// Web Builder Lab (assets/js/labs/lab-web.js): contrast math, every rule refuses with the student's own values,
// each level's starting code fails (there's work to do), a good page passes, and the preview is locked down.
//   node tests/tools/test_web_builder.js
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.resolve(__dirname, "../..");
const R = [];
const ok = (n, c, x = "") => { R.push(!!c); console.log((c ? "PASS " : "FAIL ") + n, c ? "" : x); };
const sandbox = { window: {}, console, encodeURIComponent };
sandbox.window.SE = { icon: () => "", esc: (s) => String(s), labs: { register() {}, goals(levels, g) { levels.forEach((L, i) => { if (g[i]) [L.learn, L.why] = g[i]; }); } } };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, "assets/js/labs/lab-web.js"), "utf8"), sandbox, { filename: "lab-web.js" });
const W = sandbox.window.SE.webBuilder;
ok("the lab loads with 8 levels", !!W && W.LEVELS.length === 8);
ok("every level has learn, why, two hints, what was learned, and starting code", W.LEVELS.every((L) => L.learn && L.why && L.hints.length === 2 && L.learned && typeof L.start === "string"));

ok("black on white is 21 to 1", W.contrast("rgb(0, 0, 0)", "rgb(255, 255, 255)") === 21);
ok("gray #767676 on white is about 4.5 to 1", Math.abs(W.contrast("rgb(118, 118, 118)", "rgb(255, 255, 255)") - 4.5) <= 0.1);

const good = {
  h1: "Moose Point Bakery", p: 2, lists: 1, li: 3,
  links: [{ href: "https://bakery.example", text: "Moose Point Bakery menu" }],
  imgs: [{ src: "lighthouse.svg", alt: "A white lighthouse with a red stripe" }],
  h1Color: "rgb(1, 45, 43)", bg: "rgb(253, 246, 227)", text: "rgb(1, 45, 43)",
};
ok("a complete page passes the Ship it level", W.check(7, good).ok, W.check(7, good).reason);
const fail = (lvl, change) => W.check(lvl, Object.assign({}, good, change));
ok("an empty headline is named", /empty/.test(fail(0, { h1: "" }).reason));
ok("a short list says how many items it has", /has 2 items/.test(fail(1, { li: 2 }).reason));
ok("a link without https quotes the address", /"www\.x\.example"/.test(fail(2, { links: [{ href: "www.x.example", text: "Harbor map" }] }).reason));
ok("\"click here\" link words are refused", /"click here"/.test(fail(2, { links: [{ href: "https://x.example", text: "click here" }] }).reason));
ok("a missing alt is refused", /no alt text/.test(fail(3, { imgs: [{ src: "lighthouse.svg", alt: null }] }).reason));
ok("alt=\"image\" is refused and quoted", /"image"/.test(fail(3, { imgs: [{ src: "lighthouse.svg", alt: "image" }] }).reason));
ok("an unknown picture is named", /"cat\.png"/.test(fail(3, { imgs: [{ src: "cat.png", alt: "a cat on a rock" }] }).reason));
ok("an unstyled page is refused", /still black/.test(fail(4, { h1Color: "rgb(0, 0, 0)" }).reason) && /still white/.test(fail(4, { bg: "rgb(255, 255, 255)" }).reason));
const lc = fail(5, { text: "rgb(169, 196, 207)", bg: "rgb(143, 179, 196)" });
ok("low contrast gives the student's ratio", !lc.ok && /contrast of 1\.\d to 1/.test(lc.reason), lc.reason);

// Each starting page fails its level. (A starting summary, built by hand from each start.)
const starts = [
  { ...good, h1: "" },
  { ...good, p: 0, lists: 0, li: 0 },
  { ...good, links: [{ href: "www.lighthouses.example", text: "click here" }] },
  { ...good, imgs: [{ src: "lighthouse.svg", alt: null }] },
  { ...good, h1Color: "rgb(0, 0, 0)", bg: "rgb(255, 255, 255)" },
  { ...good, text: "rgb(169, 196, 207)", bg: "rgb(143, 179, 196)" },
  { ...good, h1: "", imgs: [{ src: "lobster-boat.svg", alt: "image" }], links: [{ href: "ferry-times", text: "here" }], text: "rgb(200, 200, 200)", bg: "rgb(255, 255, 255)" },
  { ...good, h1: "" },
];
starts.forEach((s, i) => ok(`level ${i + 1}: the starting page doesn't pass yet`, !W.check(i, s).ok));
// Level 7 finds all four bugs one at a time.
let s7 = starts[6]; const found = [];
for (const fix of [{ h1: "Pine Cove Ferry" }, { links: [{ href: "https://ferry.example/times", text: "Ferry times" }] }, { imgs: [{ src: "lobster-boat.svg", alt: "A lobster boat at the dock" }] }, { text: "rgb(1, 45, 43)" }]) {
  found.push(W.check(6, s7).rule); s7 = Object.assign({}, s7, fix);
}
ok("level 7: four bugs, found one at a time", found.join(",") === "h1,link,img,contrast" && W.check(6, s7).ok, found.join(","));

// The preview is locked down.
const doc = W.srcdoc('<h1>Hi</h1><script>alert(1)</script><meta http-equiv="refresh" content="0;url=https://x.example"><img src="lighthouse.svg" alt="x">');
ok("the preview starts with a policy that blocks outside requests and scripts", /Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'"/.test(doc) && doc.indexOf("Content-Security-Policy") < doc.indexOf("<h1>"));
ok("student meta tags are removed", !/refresh/.test(doc));
ok("the lab's pictures are swapped for built-in drawings", /src="data:image\/svg\+xml,/.test(doc) && /data-name="lighthouse.svg"/.test(doc));
const out = W.srcdoc('<img src="https://x.example/a.png" srcset="https://x.example/b.png 2x" alt="a"><img src=https://x.example/c.png><body background="https://x.example/d.png"><style>@import "https://x.example/e.css"; p { background: url(https://x.example/f.png) }</style><link rel="stylesheet" href="https://x.example/g.css"><iframe src="https://x.example"></iframe>');
ok("nothing in the preview can fetch from outside", !/\s(src|srcset|background)=["']?https|url\(|@import\s|<link|<iframe/i.test(out), out);
const lab = fs.readFileSync(path.join(ROOT, "assets/js/labs/lab-web.js"), "utf8");
ok("the preview iframe never allows scripts, forms, popups, or navigation", /sandbox="allow-same-origin"/.test(lab) && !/allow-scripts|allow-forms|allow-popups|allow-top-navigation/.test(lab));

console.log(`\n${R.filter(Boolean).length}/${R.length} passed`);
process.exit(R.every(Boolean) ? 0 : 1);
