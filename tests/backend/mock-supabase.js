/*
 * A tiny stand-in for Supabase, for testing STEM 207's cloud mode without an account.
 *
 * It serves the app's files and answers the handful of Supabase endpoints the app uses
 * (Auth sign-up / sign-in / refresh / sign-out, PostgREST select / insert / update / delete,
 * and RPC calls). Every database call runs on a real Postgres with schema.sql loaded,
 * as the "anon" or "authenticated" role with the caller's user id set, so the real
 * row-level security rules are what allow or refuse each request.
 *
 *   node tests/backend/mock-supabase.js        (needs psql; see tests/backend/README.md)
 *
 * Settings (environment variables): PORT (8787), PGURL (postgres connection string),
 * TOKEN_TTL (access-token lifetime in seconds, default 3600).
 */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFile } = require("child_process");

const PORT = Number(process.env.PORT || 8787);
const PGURL = process.env.PGURL || "postgresql://postgres@/s207?host=/tmp&port=5433";
const TTL = Number(process.env.TOKEN_TTL || 3600);
const ANON_KEY = "test-anon-key";
const ROOT = path.resolve(__dirname, "../..");
const tokens = new Map();   // access token -> { sub, exp }
const refresh = new Map();  // refresh token -> sub

const lit = (v) => { const tag = "$q" + crypto.randomBytes(4).toString("hex") + "$"; return `${tag}${String(v)}${tag}`; };
const ident = (s) => { if (!/^[a-z_][a-z0-9_]*$/.test(s)) throw Object.assign(new Error("bad identifier"), { status: 400 }); return `"${s}"`; };

function psql(sql) {
  return new Promise((resolve, reject) => {
    const p = execFile("psql", [PGURL, "-X", "-q", "-At", "-v", "ON_ERROR_STOP=1"], { maxBuffer: 64 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        const msg = (stderr.match(/ERROR:\s+(.*)/) || [, stderr])[1].trim();
        const e = new Error(msg);
        e.status = /duplicate key|unique/.test(msg) ? 409 : /row-level security|permission denied/.test(msg) ? 403 : 400;
        e.code = e.status === 409 ? "23505" : e.status === 403 ? "42501" : "P0001";
        return reject(e);
      }
      resolve(stdout.trim());
    });
    p.stdin.end(sql);
  });
}
function asRole(auth, sql) {
  const claims = auth ? { sub: auth.sub, role: "authenticated" } : { role: "anon" };
  return psql(`begin;\nset local role ${auth ? "authenticated" : "anon"};\nset local "request.jwt.claims" to ${lit(JSON.stringify(claims))};\n${sql};\ncommit;\n`);
}

function session(sub, email, name) {
  const access_token = crypto.randomBytes(16).toString("hex"), refresh_token = crypto.randomBytes(16).toString("hex");
  tokens.set(access_token, { sub, exp: Date.now() + TTL * 1000 });
  refresh.set(refresh_token, { sub, email, name });
  return { access_token, refresh_token, token_type: "bearer", expires_in: TTL, user: { id: sub, email, user_metadata: { name } } };
}
const pwHash = (pw) => crypto.createHash("sha256").update("mock:" + pw).digest("hex");

function whereFrom(params) {
  const parts = [];
  for (const [k, v] of params) {
    if (["select", "order", "limit", "offset"].includes(k)) continue;
    const m = /^(eq|neq|lt|gt|is)\.(.*)$/.exec(v);
    if (!m) throw Object.assign(new Error(`unsupported filter ${k}=${v}`), { status: 400 });
    const op = { eq: "=", neq: "<>", lt: "<", gt: ">", is: "is" }[m[1]];
    parts.push(m[1] === "is" ? `${ident(k)} is ${m[2] === "null" ? "null" : m[2] === "true" ? "true" : "false"}` : `${ident(k)} ${op} ${lit(m[2])}`);
  }
  return parts.length ? ` where ${parts.join(" and ")}` : "";
}

async function rest(method, table, params, body, prefer, auth) {
  const t = `public.${ident(table)}`;
  if (method === "GET") {
    let q = `select * from ${t}${whereFrom(params)}`;
    const order = params.get("order");
    if (order) q += " order by " + order.split(",").map((o) => { const [c, d] = o.split("."); return `${ident(c)} ${d === "desc" ? "desc" : "asc"}`; }).join(", ");
    if (params.get("limit")) q += ` limit ${Number(params.get("limit"))}`;
    if (params.get("offset")) q += ` offset ${Number(params.get("offset"))}`;
    const out = await asRole(auth, `select coalesce(json_agg(r), '[]') from (${q}) r`);
    return { status: 200, body: out };
  }
  if (method === "POST") {
    const rows = Array.isArray(body) ? body : [body];
    if (!rows.length) return { status: 201 };
    const cols = Object.keys(rows[0]).map(ident).join(", ");
    const conflict = /ignore-duplicates/.test(prefer || "") ? " on conflict do nothing" : "";
    await asRole(auth, `insert into ${t} (${cols}) select ${cols} from json_populate_recordset(null::${t}, ${lit(JSON.stringify(rows))})${conflict}`);
    return { status: 201 };
  }
  if (method === "PATCH") {
    const cols = Object.keys(body).map(ident).join(", ");
    await asRole(auth, `update ${t} set (${cols}) = (select ${cols} from json_populate_record(null::${t}, ${lit(JSON.stringify(body))}))${whereFrom(params)}`);
    return { status: 204 };
  }
  if (method === "DELETE") {
    if (![...params.keys()].some((k) => !["select"].includes(k))) throw Object.assign(new Error("DELETE needs a filter"), { status: 400 });
    await asRole(auth, `delete from ${t}${whereFrom(params)}`);
    return { status: 204 };
  }
  throw Object.assign(new Error("method not allowed"), { status: 405 });
}

async function rpc(fn, args, auth) {
  const named = Object.entries(args || {}).map(([k, v]) => {
    let val;
    if (Array.isArray(v)) val = `array[${v.map(lit).join(", ")}]::text[]`;
    else if (v && typeof v === "object") val = `${lit(JSON.stringify(v))}::json`;
    else if (v === null || v === undefined) val = "null";
    else val = lit(v);
    return `${ident(k)} => ${val}`;
  }).join(", ");
  const out = await asRole(auth, `select to_json(public.${ident(fn)}(${named}))`);
  return { status: 200, body: out || "null" };
}

async function authRoute(pathname, query, body) {
  if (pathname === "/auth/v1/signup") {
    const email = String(body.email || "").toLowerCase(), name = (body.data || {}).name || "";
    if (String(body.password || "").length < 6) return { status: 422, body: JSON.stringify({ error_code: "weak_password", msg: "Password should be at least 6 characters." }) };
    const exists = await psql(`select count(*) from auth.users where email = ${lit(email)}`);
    if (exists !== "0") return { status: 422, body: JSON.stringify({ error_code: "user_already_exists", msg: "User already registered" }) };
    const id = await psql(`insert into auth.users (email, encrypted_password, raw_user_meta_data) values (${lit(email)}, ${lit(pwHash(body.password))}, ${lit(JSON.stringify({ name }))}::jsonb) returning id`);
    return { status: 200, body: JSON.stringify(session(id, email, name)) };
  }
  if (pathname === "/auth/v1/token" && query.get("grant_type") === "password") {
    const email = String(body.email || "").toLowerCase();
    const row = await psql(`select json_build_object('id', id, 'pw', encrypted_password, 'name', raw_user_meta_data->>'name') from auth.users where email = ${lit(email)}`);
    const u = row ? JSON.parse(row) : null;
    if (!u || u.pw !== pwHash(body.password)) return { status: 400, body: JSON.stringify({ error_code: "invalid_credentials", msg: "Invalid login credentials" }) };
    return { status: 200, body: JSON.stringify(session(u.id, email, u.name)) };
  }
  if (pathname === "/auth/v1/token" && query.get("grant_type") === "refresh_token") {
    const r = refresh.get(body.refresh_token);
    if (!r) return { status: 400, body: JSON.stringify({ error_code: "refresh_token_not_found", msg: "Invalid Refresh Token" }) };
    refresh.delete(body.refresh_token);
    return { status: 200, body: JSON.stringify(session(r.sub, r.email, r.name)) };
  }
  if (pathname === "/auth/v1/logout") return { status: 204 };
  return { status: 404, body: JSON.stringify({ msg: "not found" }) };
}

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json" };

http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);
  const send = (status, body, type = "application/json") => { res.writeHead(status, { "Content-Type": type }); res.end(body || ""); };
  try {
    if (u.pathname === "/__stats") { req.resume(); return send(200, JSON.stringify({ tokens: tokens.size })); }
    if (u.pathname.startsWith("/auth/") || u.pathname.startsWith("/rest/")) {
      if (req.headers.apikey !== ANON_KEY) return send(401, JSON.stringify({ message: "Invalid API key" }));
      let raw = ""; for await (const c of req) raw += c;
      const body = raw ? JSON.parse(raw) : undefined;
      if (u.pathname.startsWith("/auth/")) { const r = await authRoute(u.pathname, u.searchParams, body || {}); return send(r.status, r.body); }
      const bearer = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
      let auth = null;
      if (bearer && bearer !== ANON_KEY) {
        const t = tokens.get(bearer);
        if (!t || t.exp < Date.now()) return send(401, JSON.stringify({ code: "PGRST301", message: "JWT expired" }));
        auth = t;
      }
      const m = /^\/rest\/v1\/(rpc\/)?([a-z_]+)$/.exec(u.pathname);
      if (!m) return send(404, JSON.stringify({ message: "not found" }));
      const r = m[1] ? await rpc(m[2], body, auth) : await rest(req.method, m[2], u.searchParams, body, req.headers.prefer, auth);
      return send(r.status, r.body);
    }
    // Static app files, with config.js pointed at this server.
    if (u.pathname === "/assets/js/config.js") {
      return send(200, `window.STEM207_CONFIG = { supabaseUrl: "http://localhost:${PORT}", supabaseKey: "${ANON_KEY}" };`, "text/javascript");
    }
    const file = path.join(ROOT, u.pathname === "/" ? "index.html" : decodeURIComponent(u.pathname));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(404, "not found", "text/plain");
    return send(200, fs.readFileSync(file), TYPES[path.extname(file)] || "application/octet-stream");
  } catch (e) {
    return send(e.status || 500, JSON.stringify({ code: e.code, message: e.message }));
  }
}).listen(PORT, () => console.log(`Mock Supabase + STEM 207 at http://localhost:${PORT}`));
