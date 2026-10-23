#!/usr/bin/env node
/* Lists every outside web address the site links to or loads, grouped by domain, so a school's IT team
   can allow them on managed Chromebooks (GoGuardian, Securly, and similar filters).
   Usage: node tools/list_domains.js [--write]   (--write updates planning/CHROMEBOOK_IT_ALLOWLIST.md) */
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const SKIP = new Set(["www.w3.org", "localhost", "example.com"]);   // XML namespaces and examples, never loaded

// What each kind of domain is for, by the file it appears in.
const ROLE = [
  [/index\.html$/, "Site (fonts, brand link)"],
  [/config\.js$|cloud\.js$/, "Sign-in and saved work (Supabase)"],
  [/data\/deeper\.js$/, "Go deeper links"],
  [/data\//, "Activity launch links"],
  [/./, "Site pages"],
];

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? files(p) : /\.(js|html)$/.test(d.name) ? [p] : [];
  });
}

const hosts = new Map();   // host -> { roles:Set, count }
for (const f of [path.join(root, "index.html"), ...files(path.join(root, "assets/js"))]) {
  const rel = path.relative(root, f).split(path.sep).join("/");
  const text = fs.readFileSync(f, "utf8");
  for (const m of text.matchAll(/https:\/\/([a-z0-9.-]+\.[a-z]{2,})/gi)) {
    const host = m[1].toLowerCase();
    if (SKIP.has(host)) continue;
    const role = ROLE.find(([re]) => re.test(rel))[1];
    const h = hosts.get(host) || { roles: new Set(), count: 0 };
    h.roles.add(role); h.count++; hosts.set(host, h);
  }
}
// Google Fonts serves the font files from a second domain the CSS points to.
if (hosts.has("fonts.googleapis.com") && !hosts.has("fonts.gstatic.com")) hosts.set("fonts.gstatic.com", { roles: new Set(["Site (fonts, brand link)"]), count: 1 });

const rows = [...hosts].sort((a, b) => a[0].localeCompare(b[0]));
if (!process.argv.includes("--write")) {
  for (const [h, v] of rows) console.log(h.padEnd(36), [...v.roles].join("; "));
  console.log(`\n${rows.length} domains. Run with --write to update planning/CHROMEBOOK_IT_ALLOWLIST.md.`);
  process.exit(0);
}

const order = ["Site (fonts, brand link)", "Sign-in and saved work (Supabase)", "Site pages", "Activity launch links", "Go deeper links"];
const out = [`# Chromebook IT allowlist

For school IT teams. Managed Chromebooks often run a web filter (GoGuardian, Securly, Lightspeed, and similar). Allow these domains so STEM 207 and its activities open for students.

- **Generated** by \`node tools/list_domains.js --write\` from the site's code and activity data. Don't edit by hand; run it again after adding activities.
- **Required** for the site itself: the first two groups. Without them, fonts fall back and students can't sign in or save.
- **Activity links** open outside platforms in a new tab. Each platform has its own account rules, which the activity page shows to the teacher.
- STEM 207 itself is \`mattjones1.github.io\` (GitHub Pages).
- Downloads (\`.sb3\` starter projects, Moxie \`.ino\` files) save to the Chromebook's Downloads folder. Printing (Print this sheet, login cards, certificates) uses Chrome's print dialog.
`];
for (const role of order) {
  const list = rows.filter(([, v]) => v.roles.has(role)).map(([h]) => h);
  if (!list.length) continue;
  out.push(`## ${role}\n\n${list.map((h) => `- \`${h}\``).join("\n")}\n`);
}
fs.writeFileSync(path.join(root, "planning/CHROMEBOOK_IT_ALLOWLIST.md"), out.join("\n"));
console.log(`Wrote planning/CHROMEBOOK_IT_ALLOWLIST.md (${rows.length} domains).`);
