// The web studio's pure parts (code-editor.js, web-studio.js, web-kit.js pictures): coloring that keeps every
// character, tag pairs, re-indenting, "What does this do?", CSS rules, and the line diff.
//   node tests/tools/test_web_studio.js
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..", "..");
const sandbox = { window: {}, console };
sandbox.window.SE = {};
vm.createContext(sandbox);
for (const f of ["assets/js/labs/web-kit.js", "assets/js/labs/code-editor.js", "assets/js/labs/web-studio.js"]) vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
const SE = sandbox.window.SE, E = SE.codeEditor, W = SE.webStudio, WK = SE.webKit;
let pass = 0, fail = 0;
const ok = (name, c, extra = "") => { if (c) pass++; else { fail++; console.log("FAIL " + name, extra); } };
const unhtml = (h) => h.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&amp;/g, "&");

// Coloring never loses or adds a character (the colored copy must line up with the real text).
const samples = [
  "<!DOCTYPE html>\n<h1 class=\"big\">Hi & you</h1>\n<!-- note -->\n<img src=\"moose.svg\" alt=\"A moose\">\n<p>a < b</p>",
  "<a href='#x'>Go</a><br><ul>\n  <li>One</li>\n</ul>\n<p>unclosed <strong>bold",
  "<h1>Broken <h2 tag"
];
samples.forEach((s, i) => ok(`HTML coloring keeps every character (sample ${i + 1})`, unhtml(E.highlight(s, "html")) === s, unhtml(E.highlight(s, "html"))));
const css = "/* site */\nbody {\n  color: #213547;\n  padding: 1rem 2em;\n}\n.card:hover, h1 { border-radius: 12px; }\n@media (max-width: 600px) { h1 { font-size: 2rem; } }";
ok("CSS coloring keeps every character", unhtml(E.highlight(css, "css")) === css, unhtml(E.highlight(css, "css")));
ok("tag names, attributes, and values are colored", /ce-t">h1</.test(E.highlight("<h1 class=\"x\">", "html")) && /ce-a">class</.test(E.highlight("<h1 class=\"x\">", "html")) && /ce-v">"x"</.test(E.highlight("<h1 class=\"x\">", "html")));

// Tag pairs
const code = "<ul>\n  <li>a</li>\n  <li>b</li>\n</ul>";
ok("the pair of an opening tag", JSON.stringify(E.pairAt(code, 1)) === JSON.stringify({ open: [0, 4], close: [code.length - 5, code.length], tag: "ul" }));
ok("the pair of a closing tag, past a nested same-name tag", E.pairAt("<div><div>x</div></div>", 20).open[0] === 0);
ok("a void tag has no pair", E.pairAt("<img src=\"a\">", 3).close === null);
ok("text between tags isn't a tag", E.pairAt("<p>hello</p>", 5) === null);

// Tidy
ok("tidy indents nested HTML", E.tidyHtml("<ul>\n<li>a</li>\n</ul>") === "<ul>\n  <li>a</li>\n</ul>");
ok("tidy indents CSS declarations", E.tidyCss("body {\ncolor: red;\n}") === "body {\n  color: red;\n}");

// What does this do?
const ex = (c, at, lang = "html") => W.explain(c, at, lang);
ok("explains an opening tag", /main heading/.test(ex("<h1>Hi</h1>", 2).text));
ok("explains a closing tag as the end", /ends the <h1>/.test(ex("<h1>Hi</h1>", 8).text));
ok("explains an attribute, even mid-word", /^href/.test(ex("<a href=\"#x\">Go</a>", 4).title));
ok("explains the words inside an element", /content of the <p>/.test(ex("<p>Hello there</p>", 6).text));
ok("explains a CSS property and a hex value", /padding/.test(ex("body {\n  padding: 1rem;\n}", 12, "css").text) && /hex color/.test(ex("h1 {\n  color: #163a5f;\n}", 10, "css").text));
ok("explains a CSS selector", /every element with class="card"/.test(ex(".card {\n}", 2, "css").text));
ok("unknown tags get an honest answer", /doesn't have a note/.test(ex("<marquee>x</marquee>", 3).text));

// CSS rules
const rules = W.cssRules(css);
ok("finds the CSS rules and their selectors", rules.map((r) => r.selector).join("|") === "body|.card:hover, h1|h1", rules.map((r) => r.selector).join("|"));
ok("a rule's range starts at its selector", css.slice(rules[0].start, rules[0].start + 4) === "body");

// Diff
const d = W.diff("a\nb\nc", "a\nB\nc\nd");
ok("the diff keeps, removes, and adds lines", d.map((x) => x.op + x.text).join(",") === " a,-b,+B, c,+d", d.map((x) => x.op + x.text).join(","));

// Pictures
ok("every picture has a description and keywords", Object.keys(WK.PICTURES).every((k) => WK.PICTURE_INFO[k] && WK.PICTURE_INFO[k][0] && WK.PICTURE_INFO[k][1]));
ok("pictures are offline data: no outside address", Object.values(WK.PICTURES).every((u) => u.startsWith("data:image/svg+xml,") && !/https?:/.test(decodeURIComponent(u).replace("http://www.w3.org/2000/svg", ""))));
ok("the example list covers 14 tags, each explained", W.EXPLORER.length === 14 && W.EXPLORER.every((t) => W.TAGS[t.tag]));

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
