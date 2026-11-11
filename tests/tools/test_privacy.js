// The privacy check (assets/js/privacy.js): it finds what points to a real person in a student's words, and leaves
// ordinary website code alone (colors, sizes, ids, and the builder's own pages).
//   node tests/tools/test_privacy.js
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..", "..");
const sandbox = { window: {}, console };
sandbox.window.SE = {};
vm.createContext(sandbox);
for (const f of ["assets/js/privacy.js", "assets/js/labs/web-kit.js", "assets/js/labs/wb-composer.js"]) vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
const SE = sandbox.window.SE, P = SE.privacy;
let pass = 0, fail = 0;
const ok = (name, c, extra = "") => { if (c) pass++; else { fail++; console.log("FAIL " + name, extra); } };
const kinds = (t) => P.scan(t).map((x) => x.kind);

ok("an email address", kinds("<p>Write to ava.r@example.com</p>").includes("email"));
ok("a phone number, several ways", ["207-555-0142", "(207) 555-0142", "207.555.0142", "+1 207 555 0142"].every((n) => kinds(`<p>Call ${n}</p>`).includes("phone")), ["207-555-0142", "(207) 555-0142"].map(kinds));
ok("a street address", kinds("<p>Come to 12 Pine Tree Road</p>").includes("address"));
ok("a link to another website", kinds('<a href="https://example.com">x</a>').includes("link") && kinds("<p>www.example.com</p>").includes("link"));
ok("about-me phrases", ["My name is Ava Rose", "I live on Elm", "I go to Lincoln School", "my birthday is May 3"].every((t) => kinds(t).includes("about-me")));
ok("each match says where it is", (() => { const m = P.scan("Hi! My name is Ava.")[0]; return m && m.at === 4 && m.text === "My name is"; })());
ok("ordinary code is fine: hex colors, sizes, ids, numbers", P.scan('body { color: #1f3324; padding: 2rem 1.5rem; } <section id="fun-facts"><p>Moose eat 50 pounds a day. It is 2026.</p></section>').length === 0, P.scan('body { color: #1f3324; }'));
const builder = ["animals", "gaming", "business", "club"].map((kind, i) => SE.wbComposer.build({ kind, idea: "A website about moose and hiking in Maine", name: `Site ${i}`, sections: [{ id: "welcome" }, { id: "facts", more: "Moose can swim. They eat plants." }, { id: "favorites", more: "hiking, camping and kayaking" }, { id: "about" }, { id: "business" }, { id: "links" }], style: "nature", special: "colors", audience: "friends" }));
ok("the builder's own pages pass", builder.every((r) => P.scan(r.title + r.html + r.css).length === 0), builder.map((r) => P.scan(r.html)));

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
