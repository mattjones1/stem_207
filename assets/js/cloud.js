/*
 * STEM 207 — Supabase client.
 *
 * A small wrapper around Supabase's REST endpoints (Auth, PostgREST, and RPC), so
 * the app needs no extra libraries and still works as plain files. store.js uses
 * this when assets/js/config.js has a Supabase URL and key; otherwise the app
 * runs in local mode and this file does nothing.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const cfg = window.STEM207_CONFIG || {};
  const base = String(cfg.supabaseUrl || "").trim().replace(/\/+$/, "");
  const key = String(cfg.supabaseKey || cfg.supabaseAnonKey || "").trim();
  const AUTH_KEY = "stem207:auth";
  let memAuth = null;

  const readAuth = () => { try { const r = localStorage.getItem(AUTH_KEY); if (r) return JSON.parse(r); } catch (e) { /* ignore */ } return memAuth; };
  const writeAuth = (a) => { memAuth = a; try { if (a) localStorage.setItem(AUTH_KEY, JSON.stringify(a)); else localStorage.removeItem(AUTH_KEY); } catch (e) { /* ignore */ } };

  async function http(method, path, { body, token, prefer } = {}) {
    // The project key always goes in the apikey header. Authorization carries a signed-in
    // educator's token only; without it, Supabase treats the request as the anon role.
    const headers = { apikey: key, "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (prefer) headers.Prefer = prefer;
    let res;
    try {
      res = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    } catch (e) {
      const err = new Error("You're offline or the server can't be reached.");
      err.offline = true;
      throw err;
    }
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (e) { /* not JSON */ }
    if (!res.ok) {
      const err = new Error((json && (json.msg || json.message || json.error_description || json.error)) || res.statusText || "Request failed");
      err.status = res.status;
      err.code = json && (json.error_code || json.code || json.error);
      err.body = json;
      throw err;
    }
    return json;
  }

  function saveSession(s) {
    const a = { access_token: s.access_token, refresh_token: s.refresh_token, expires_at: Date.now() + (s.expires_in || 3600) * 1000, user: { id: s.user.id, email: s.user.email, name: (s.user.user_metadata || {}).name || "" } };
    writeAuth(a);
    return a;
  }

  let refreshing = null;
  async function accessToken() {
    const a = readAuth();
    if (!a) return null;
    if (Date.now() < a.expires_at - 60000) return a.access_token;
    if (!refreshing) {
      refreshing = http("POST", "/auth/v1/token?grant_type=refresh_token", { body: { refresh_token: a.refresh_token } })
        .then((s) => saveSession(s).access_token)
        .catch((e) => { if (!e.offline) writeAuth(null); throw e; })
        .finally(() => { refreshing = null; });
    }
    return refreshing;
  }

  const PAGE = 1000; // Supabase returns at most 1000 rows per request by default

  SE.cloud = {
    enabled: !!(base && key),
    url: base,
    auth: readAuth,

    async signUp(email, password, name, accountKind = "educator") {
      const r = await http("POST", "/auth/v1/signup", { body: { email, password, data: { name, account_kind: accountKind } } });
      if (r && r.access_token) return { session: saveSession(r) };
      return { needsConfirm: true };
    },
    async signIn(email, password) {
      const r = await http("POST", "/auth/v1/token?grant_type=password", { body: { email, password } });
      return saveSession(r);
    },
    async signOut() {
      const a = readAuth();
      writeAuth(null);
      if (a) { try { await http("POST", "/auth/v1/logout", { token: a.access_token }); } catch (e) { /* already signed out */ } }
    },
    forgetAuth: () => writeAuth(null),

    /* PostgREST call as the signed-in educator. `path` is like "/classes?id=eq.cls_1". */
    async rest(method, path, body, prefer) {
      const token = await accessToken();
      if (!token) { const e = new Error("Please sign in again."); e.status = 401; throw e; }
      return http(method, `/rest/v1${path}`, { body, token, prefer });
    },
    /* Read every row of a table the educator can see, a page at a time. */
    async selectAll(table, query = "") {
      const out = [];
      for (let offset = 0; ; offset += PAGE) {
        const rows = await SE.cloud.rest("GET", `/${table}?select=*${query ? `&${query}` : ""}&limit=${PAGE}&offset=${offset}`);
        out.push(...rows);
        if (rows.length < PAGE) return out;
      }
    },
    /* Call a database function. Student functions use the public key; educators send their token. */
    async rpc(fn, args, asEducator = false) {
      const token = asEducator ? await accessToken() : null;
      return http("POST", `/rest/v1/rpc/${fn}`, { body: args, token });
    }
  };
})();
