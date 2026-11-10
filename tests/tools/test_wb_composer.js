// Website Builder's rule-based builder (wb-composer.js) and Make a Change (wb-changes.js): every answer set gives a
// valid, readable, safe page with readable colors; the same answers give the same page; different answers give
// different pages; and every change is small and valid.
//   node tests/tools/test_wb_composer.js
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..", "..");
const sandbox = { window: {}, console };
sandbox.window.SE = {};
vm.createContext(sandbox);
for (const f of ["web-kit", "code-editor", "web-studio", "wb-composer", "wb-changes"]) vm.runInContext(fs.readFileSync(path.join(ROOT, `assets/js/labs/${f}.js`), "utf8"), sandbox, { filename: f });
const SE = sandbox.window.SE, C = SE.wbComposer, X = SE.wbChanges, WK = SE.webKit;
let pass = 0, fail = 0;
const ok = (name, c, extra = "") => { if (c) pass++; else { fail++; console.log("FAIL " + name, extra); } };

const KINDS = Object.keys(C.KINDS), STYLES = Object.keys(C.THEMES), SPECIALS = ["", ...Object.keys(C.SPECIALS)], AUD = Object.keys(C.AUDIENCES);
const SECS = Object.keys(C.SECTION_INFO);
const IDEAS = ["I want a website about moose and where they live in Maine forests", "a fan page for my favorite video game where people share building tips", "Our made-up bakery sells blueberry muffins and maple scones", "my soccer team and how to join", "space, rockets and the planets", "", "<script>alert(1)</script> & stuff", "hiking trails, camping and kayaking near Katahdin"];
const MORE = { facts: "Moose can swim. They eat about 70 pounds of plants a day!", cards: "redstone, castles and farms", favorites: "hiking, kayaking and camping", about: "I started this page because I love the outdoors.", business: "We bake fresh bread every morning.", welcome: "Welcome, explorers!" };
const sets = [];
for (let i = 0; i < 40; i++) {
  const n = 1 + (i % SECS.length);
  const secs = SECS.slice(i % 3, i % 3 + n).map((id, k) => ({ id, more: (i + k) % 2 ? MORE[id] || "" : "" }));
  sets.push({ kind: KINDS[i % KINDS.length], idea: IDEAS[i % IDEAS.length], name: i % 7 === 6 ? "" : `Site ${i} <b>&</b>`, sections: secs, style: STYLES[(i * 3) % STYLES.length], color: ["#7a2bd6", "#ffd84d", "#000000", "#ffffff"][i % 4], special: SPECIALS[i % SPECIALS.length], audience: AUD[i % AUD.length] });
}
const ALLOWED = new Set("header nav main section footer h1 h2 h3 p ul li a img figure figcaption article div".split(" "));
const RULE_PAIRS = [["body", "color", "background-color"], [".hero", "color", "background-color"], [".site-header", "color", "background-color"], [".site-footer", "color", "background-color"], [".card", "color", "background-color"], [".callout", "color", "background-color"], [".button", "color", "background-color"]];
let allOk = { tags: true, h1: true, order: true, alt: true, pics: true, safe: true, size: true, contrast: true, ids: true, links: true, escaped: true };
const why = {};
sets.forEach((a, i) => {
  const r = C.build(a);
  const tags = [...r.html.matchAll(/<([a-z0-9]+)[\s>]/g)].map((m) => m[1]);
  if (!tags.every((t) => ALLOWED.has(t))) { allOk.tags = false; why.tags = tags.filter((t) => !ALLOWED.has(t)); }
  if ((r.html.match(/<h1>/g) || []).length !== 1) { allOk.h1 = false; why.h1 = i; }
  const heads = [...r.html.matchAll(/<h([1-6])>/g)].map((m) => Number(m[1]));
  if (heads.some((h, k) => k && h > heads[k - 1] + 1)) { allOk.order = false; why.order = heads; }
  const imgs = [...r.html.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
  if (!imgs.every((t) => /alt="[^"]{8,}"/.test(t))) { allOk.alt = false; why.alt = imgs; }
  if (!imgs.every((t) => WK.PICTURES[(t.match(/src="([^"]+)"/) || [])[1]])) { allOk.pics = false; why.pics = imgs; }
  if (/<script|\son[a-z]+=|javascript:|url\(|@import|https?:/i.test(r.html + r.css)) { allOk.safe = false; why.safe = i; }
  const hl = r.html.split("\n").length, cl = r.css.split("\n").length;
  if (hl > 170 || cl > 220 || r.html.length > 12000) { allOk.size = false; why.size = [hl, cl]; }
  RULE_PAIRS.forEach(([sel, fg, bg]) => {
    const f = X.getProp(r.css, sel, fg), b = X.getProp(r.css, sel, bg);
    if (f && b && /^#/.test(f) && /^#/.test(b) && C.contrast(f, b) < 4.5) { allOk.contrast = false; why.contrast = [i, sel, f, b, C.contrast(f, b)]; }
  });
  const ids = [...r.html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  if (new Set(ids).size !== ids.length) { allOk.ids = false; why.ids = ids; }
  const hrefs = [...r.html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  if (!hrefs.every((h) => ids.includes(h))) { allOk.links = false; why.links = [hrefs, ids]; }
  if (/<b>|<script>/.test(r.html)) { allOk.escaped = false; why.escaped = i; }
});
ok("40 answer sets: only beginner HTML tags", allOk.tags, why.tags);
ok("40 answer sets: exactly one <h1>", allOk.h1, why.h1);
ok("40 answer sets: headings never skip a level", allOk.order, why.order);
ok("40 answer sets: every picture has real alt text", allOk.alt, why.alt);
ok("40 answer sets: only built-in pictures", allOk.pics, why.pics);
ok("40 answer sets: no scripts, handlers, outside addresses, or url()", allOk.safe, why.safe);
ok("40 answer sets: small enough to read (HTML ≤ 170 lines, CSS ≤ 220 lines)", allOk.size, why.size);
ok("40 answer sets: every text color is at least 4.5 to 1 on its background", allOk.contrast, why.contrast);
ok("40 answer sets: ids are unique", allOk.ids, why.ids);
ok("40 answer sets: every link goes to an id that exists", allOk.links, why.links);
ok("40 answer sets: the student's < and > show as text, never as code", allOk.escaped, why.escaped);

const a0 = sets[0], r0 = C.build(a0);
ok("the same answers give the same website", JSON.stringify(C.build(a0)) === JSON.stringify(r0));
const a1 = { ...a0, style: "retro" }, a2 = { ...a0, kind: "space", sections: [{ id: "pictures" }, { id: "cards", more: "Mars, Jupiter and Saturn" }] };
ok("a different style gives different CSS", C.build(a1).css !== r0.css);
ok("different sections give different HTML", C.build(a2).html !== r0.html);
const heroes = new Set(sets.map((a) => C.build(a).hero));
ok("hero layouts vary across projects", heroes.size >= 3, [...heroes]);
const moose = C.build({ kind: "animals", idea: "moose in the Maine forest", name: "Moose", sections: [{ id: "favorites", more: "hiking, kayaking and camping" }, { id: "facts", more: "Moose can swim. They eat plants." }], style: "nature" });
ok("the student's own list becomes list items", /<li>Hiking<\/li>[\s\S]*<li>Kayaking<\/li>[\s\S]*<li>Camping<\/li>/.test(moose.html));
ok("the student's own sentences become facts", /<li>Moose can swim\.<\/li>/.test(moose.html));
ok("keywords pick matching pictures", moose.pictures.includes("moose.svg") || moose.pictures.includes("tree.svg"), moose.pictures);
const trail = C.build({ kind: "animals", idea: "A website about moose and hiking trails in Maine forests", name: "Maine Moose Facts", sections: [{ id: "favorites", more: "hiking, kayaking and camping" }, { id: "pictures" }], style: "nature", special: "hero" });
ok("the idea's subject picks the hero picture (moose, not the trail)", trail.pictures[0] === "moose.svg" && /class="hero-pic" src="moose\.svg"/.test(trail.html), trail.pictures);
ok("the gallery doesn't repeat the hero picture", !/<figure>\s*<img src="moose\.svg"/.test(trail.html));
ok("the student's long sentence goes on its own short lines, so it fits the code box", /<p class="tagline">\n {6}A website about moose and hiking trails\n {6}in Maine forests\.\n {4}<\/p>/.test(trail.html), trail.html.split("\n").slice(14, 20));
ok("missing content is a clear placeholder, not an invented fact", /Add your own/.test(C.build({ kind: "animals", name: "Owls", sections: [{ id: "facts" }, { id: "about" }] }).html));
ok("it explains what it built, and says what's a placeholder", r0.explanation.length >= 3 && /placeholder/.test(r0.explanation.join(" ")));
ok("fixContrast lifts a too-light color to 4.5 to 1", C.contrast(C.fixContrast("#cccccc", "#ffffff"), "#ffffff") >= 4.5);

// Make a Change
const base = C.build({ kind: "gaming", idea: "minecraft tips", name: "Pixel Quest", sections: [{ id: "welcome" }, { id: "cards", more: "redstone, castles and farms" }, { id: "about" }], style: "bright", special: "cards" });
const cur = { html: base.html, css: base.css };
const asks = ["make the title stand out", "center it", "make it darker", "make it lighter", "make it more colorful", "make it look like a video game", "give it a nature look", "make it sporty", "make the text bigger", "add more space", "rounded corners please", "add shadows", "make it look better on a phone", "change the font to something fancy", "add a border between parts", "add a section about secret tips", "add a list of mobs, pigs and creepers", "add a picture of a rocket"];
const results = asks.map((q) => [q, X.propose(q, cur)]);
ok("every known change makes a proposal", results.every(([, p]) => p.ok), results.filter(([, p]) => !p.ok).map(([q, p]) => `${q}: ${p.why}`));
ok("every change is small: it never rewrites the page", results.every(([, p]) => !p.ok || SE.webStudio.diff(cur.html + cur.css, p.html + p.css).filter((x) => x.op !== " ").length <= 24), results.map(([q, p]) => [q, p.ok && SE.webStudio.diff(cur.html + cur.css, p.html + p.css).filter((x) => x.op !== " ").length]));
ok("changes keep the code safe", results.every(([, p]) => !p.ok || !/<script|\son[a-z]+=|javascript:|url\(/i.test(p.html + p.css)));
const dk = X.propose("make it darker", cur);
ok("darker keeps the words readable", C.contrast(X.getProp(dk.css, "body", "color"), X.getProp(dk.css, "body", "background-color")) >= 4.5);
const lessDark = X.propose("make it less dark", { html: dk.html, css: dk.css });
ok("\"less dark\" makes it lighter, not darker", lessDark.ok && lessDark.id === "lighter", lessDark.id);
ok("\"too bright\" makes it darker", X.propose("it's too bright", cur).id === "darker");
const blue = X.propose("make the background blue", cur);
ok("a color name changes that color", blue.ok && blue.id === "color" && X.getProp(blue.css, "body", "background-color") === "#1c64d1", blue.id);
ok("after a color change the words and links stay readable", C.contrast(X.getProp(blue.css, "body", "color"), "#1c64d1") >= 4.5 && C.contrast(X.getProp(blue.css, "a", "color"), "#1c64d1") >= 4.5);
const hero = X.propose("make the title area light green", cur);
ok("\"title\" plus a color changes the hero, readably", hero.ok && C.contrast(X.getProp(hero.css, ".hero", "color"), X.getProp(hero.css, ".hero", "background-color")) >= 4.5 && X.getProp(hero.css, "body", "background-color") === X.getProp(cur.css, "body", "background-color"));
ok("\"outer space\" is a look, not more padding", X.propose("make it look like outer space", cur).id === "spacetheme");
ok("\"add more space\" is still padding", X.propose("add more space", cur).id === "space");
const sec = X.propose("add a section about secret tips", cur);
ok("a new section gets a heading, an id, and a working menu link", /<section id="secret-tips"[\s\S]*<h2>Secret tips<\/h2>/.test(sec.html) && /href="#secret-tips"/.test(sec.html));
ok("a link to a part that doesn't exist says so honestly", /no part of the page/.test(X.propose("add a link to dragons", cur).why));
ok("an unknown request says the builder isn't AI and offers ideas", (() => { const p = X.propose("make it fly to the moon and sing", cur); return !p.ok && /isn't AI/.test(p.why) && p.suggest.length >= 3; })());
ok("a picture nobody has says which pictures exist", /doesn't have a built-in picture/.test(X.propose("add a picture of a dragon", cur).why));
const st = X.steps(cur, X.propose("make the title stand out", cur));
ok("Teach Me turns a change into steps with a file, a line, and the new code", st.length >= 1 && st.every((s) => s.lang && s.line > 0 && s.to.length) && /styles\.css/.test(st[0].say), JSON.stringify(st));

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
