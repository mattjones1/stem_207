/*
 * STEM 207 — web studio parts shared by Build Your First Website (lab-website.js) and the Website Builder (lab-wb.js).
 * Everything here is deterministic: no AI, no network. Previews always go through SE.webKit.srcdoc in a
 * sandboxed iframe without scripts.
 *
 *   SE.webStudio.explain(code, at, lang)    "What does this do?": { title, text } for the tag, attribute, CSS
 *                                           property, or value at an offset (null when there's nothing to say)
 *   SE.webStudio.cssRules(css)              [{ selector, body, start, end }]: the rules in a style sheet
 *   SE.webStudio.rulesFor(el, css)          the rules that style an element (el is inside the sandboxed preview)
 *   SE.webStudio.diff(a, b)                 a line diff: [{ op: " " | "+" | "-", text }]
 *   SE.webStudio.showExample(opts)          the Show an Example panel (a dialog): code ↔ website, notes, Try it,
 *                                           Copy, and Insert at my cursor (asks first). opts: { title, html, css,
 *                                           notes: [{ match, say }], snippet, snippetLang, onInsert(text, lang) }
 *   SE.webStudio.tagExplorer(opts)          the HTML Tag Explorer (a dialog). opts: { lessonOf(tag) }
 *   SE.webStudio.GLOSSARY, term(word)       the word list, and a toggletip button for one word
 *   SE.webStudio.issueList(issues, opts)    the "Needs a fix" list: every issue gets its own Find It
 *   SE.webStudio.miniFrame(html, css, title) a sandboxed preview iframe's HTML
 */
(function () {
  "use strict";
  const SE = (window.SE = window.SE || {});
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const icon = (n, a) => (SE.icon ? SE.icon(n, a) : "");
  const WK = () => SE.webKit;

  /* ───────── What does this do? ───────── */
  const TAGS = {
    html: ["The whole web page", "<html> wraps everything on the page. lang=\"en\" tells browsers and screen readers the page is in English."],
    head: ["Information about the page", "<head> holds things the browser needs that visitors don't see on the page, like the title and the link to the CSS."],
    body: ["Everything visitors see", "<body> holds everything that shows on the page: headings, paragraphs, pictures, and links."],
    title: ["The page's name", "<title> is the name in the browser tab and in search results. It's in the head, so it isn't on the page itself."],
    meta: ["A setting for the browser", "<meta charset=\"UTF-8\"> tells the browser how to read the letters, so every character shows correctly."],
    link: ["A link to the CSS file", "<link rel=\"stylesheet\" href=\"styles.css\"> tells the browser to use the CSS in styles.css to style this page."],
    h1: ["Main heading", "<h1> is the main heading: what the whole page is about. A page has one. The opening tag <h1> starts it, and the closing tag </h1> ends it."],
    h2: ["Section heading", "<h2> is a heading for one part of the page. Headings go in order: <h1>, then <h2>, then <h3>."],
    h3: ["Smaller heading", "<h3> is a heading inside a section that already has an <h2>."],
    p: ["Paragraph", "<p> is a paragraph: sentences that go together. Browsers put a little space between paragraphs."],
    ul: ["Bullet list", "<ul> is an unordered (bullet) list. Each thing in it is an <li>."],
    ol: ["Numbered list", "<ol> is an ordered list: the browser numbers each <li> for you."],
    li: ["List item", "<li> is one item in a list. It always goes inside <ul> or <ol>."],
    a: ["Link", "<a> is a link. href says where it goes. The words between <a> and </a> are what people click, so they should say where the link goes."],
    img: ["Picture", "<img> shows a picture. src says which picture. alt describes it for people who can't see it. <img> has no closing tag."],
    header: ["Top of the page", "<header> holds the top part: usually the site's name, its main heading, and sometimes the menu."],
    nav: ["Menu", "<nav> holds the links that move around the site or the page."],
    main: ["Main content", "<main> holds the page's main content. A page has one <main>."],
    section: ["A section", "<section> groups one part of the page, usually with its own heading."],
    article: ["A stand-alone piece", "<article> holds something that makes sense on its own, like one card or one story."],
    footer: ["Bottom of the page", "<footer> holds the bottom part, like who made the page."],
    div: ["A box for grouping", "<div> groups things so you can style them together. It doesn't say what they are, so use <section> or <article> when one fits."],
    span: ["A few words to style", "<span> marks a few words inside a line so CSS can style them."],
    strong: ["Important words", "<strong> marks words as important. Browsers show them in bold."],
    em: ["Emphasis", "<em> adds emphasis, like when you say a word louder. Browsers show it in italics."],
    figure: ["A picture with a caption", "<figure> holds a picture with its <figcaption>, the words that go with it."],
    figcaption: ["A caption", "<figcaption> is the caption for the picture in a <figure>."],
    blockquote: ["A quote", "<blockquote> holds words someone else said or wrote."],
    br: ["Line break", "<br> starts a new line. It has no closing tag. Use a new <p> for a new paragraph."],
    hr: ["A dividing line", "<hr> draws a line between two topics."]
  };
  const ATTRS = {
    href: "href is where a link goes. #menu jumps to the part of the page with id=\"menu\". A web address starts with https://.",
    src: "src is the picture to show. In STEM 207 you can use the built-in pictures, like lighthouse.svg.",
    alt: "alt describes the picture in words, for people who can't see it. A screen reader reads it out loud.",
    id: "id gives one part of the page a name, so a link can jump to it with href=\"#name\". Each id is used once.",
    class: "class gives a part a name for CSS. Many parts can share one class, and CSS styles them with .name { }.",
    lang: "lang says what language the page is in, so screen readers say the words correctly.",
    rel: "rel says what a linked file is. rel=\"stylesheet\" means it's the page's CSS.",
    charset: "charset says how the letters are stored. UTF-8 covers almost every language and emoji."
  };
  const CSS = {
    color: "color sets the color of the words.",
    "background-color": "background-color sets the color behind the words.",
    background: "background sets what's behind an element, like a color.",
    padding: "padding adds space inside, between the element's edge and what's in it.",
    margin: "margin adds space outside, between this element and the next one.",
    "font-family": "font-family picks the typeface. The list gives backups in case the first isn't on the computer.",
    "font-size": "font-size sets how big the words are. rem means \"times the page's normal text size\".",
    "font-weight": "font-weight makes words bold (700) or regular (400).",
    "line-height": "line-height sets the space between lines of text. About 1.5 is easy to read.",
    "text-align": "text-align lines words up: left, center, or right.",
    "text-transform": "text-transform can make words all capitals (uppercase) without retyping them.",
    "letter-spacing": "letter-spacing adds space between letters.",
    border: "border draws a line around an element: how thick, what style, and what color.",
    "border-radius": "border-radius rounds the corners. Bigger numbers make rounder corners.",
    "box-shadow": "box-shadow draws a soft shadow behind an element, so it looks lifted off the page.",
    "max-width": "max-width keeps an element from getting wider than you choose, so lines stay easy to read.",
    width: "width sets how wide an element is.",
    display: "display decides how an element is laid out. flex and grid line up the things inside it.",
    "flex-wrap": "flex-wrap lets things move to the next line when there isn't room, like on a phone.",
    gap: "gap sets the space between the things inside a flex or grid layout.",
    "grid-template-columns": "grid-template-columns makes columns. repeat(auto-fit, minmax(14rem, 1fr)) makes as many columns as fit.",
    "justify-content": "justify-content spreads things out along a row: start, center, space-between…",
    "align-items": "align-items lines things up across a row: top, center, or bottom.",
    "list-style": "list-style changes the bullets of a list, or removes them (none).",
    "text-decoration": "text-decoration adds or removes lines on words, like the underline on links.",
    "object-fit": "object-fit decides how a picture fills its box without stretching.",
    height: "height sets how tall an element is."
  };
  function explainValue(prop, value) {
    const v = value.trim();
    if (/^#[0-9a-f]{3,8}$/i.test(v)) return `${v} is a hex color: red, green, and blue, each from 00 (none) to ff (full).`;
    if (/^rgba?\(/i.test(v)) return `${v} is a color made from red, green, and blue numbers from 0 to 255.`;
    if (/^-?\d*\.?\d+rem$/.test(v)) return `${v}: rem means "times the page's normal text size", so ${v} is ${parseFloat(v)} times that size.`;
    if (/^-?\d*\.?\d+em$/.test(v)) return `${v}: em means "times this element's text size".`;
    if (/^-?\d*\.?\d+px$/.test(v)) return `${v} is ${parseFloat(v)} pixels, the tiny dots on a screen.`;
    if (/^-?\d*\.?\d+%$/.test(v)) return `${v} is a percent of the space around it.`;
    if (/^(flex|grid)$/.test(v)) return `display: ${v} lines up the things inside this element ${v === "flex" ? "in a row" : "in a grid of columns and rows"}.`;
    return "";
  }
  /* What does this do? For HTML: the tag or attribute at the cursor. For CSS: the property and its value. */
  function explain(code, at, lang) {
    if (lang === "css") {
      const lineStart = code.lastIndexOf("\n", at - 1) + 1, lineEnd = (code.indexOf("\n", at) + 1 || code.length + 1) - 1;
      const line = code.slice(lineStart, lineEnd);
      const d = line.match(/^\s*([a-zA-Z-]+)\s*:\s*([^;]*);?/);
      if (d) {
        const prop = d[1].toLowerCase();
        return { title: `${prop}: ${d[2].trim()}`, text: [CSS[prop] || `${prop} is a CSS property: it changes one thing about how the element looks.`, explainValue(prop, d[2])].filter(Boolean).join(" ") };
      }
      const sel = line.match(/^\s*([^{]+)\{/);
      if (sel) {
        const s = sel[1].trim();
        const what = s === "body" ? "the whole page" : s.startsWith(".") ? `every element with class="${s.slice(1)}"` : s.startsWith("#") ? `the element with id="${s.slice(1)}"` : /\s/.test(s) ? `every ${s.split(/\s+/).pop()} inside ${s.split(/\s+/)[0]}` : `every <${s}>`;
        return { title: `${s} { }`, text: `This is a CSS rule. The selector ${s} picks ${what}. The lines inside { } are properties and values that style it.` };
      }
      if (/\/\*/.test(line)) return { title: "A CSS comment", text: "Words between /* and */ are notes for people. The browser skips them." };
      return null;
    }
    // HTML: find the tag the cursor is in (or just after)
    const lt = code.lastIndexOf("<", at), gt = code.lastIndexOf(">", at - 1);
    if (lt >= 0 && lt > gt) {
      const tagText = code.slice(lt, (code.indexOf(">", lt) + 1) || code.length);
      if (tagText.startsWith("<!--")) return { title: "An HTML comment", text: "Words between <!-- and --> are notes for people. The browser skips them." };
      if (/^<!doctype/i.test(tagText)) return { title: "<!DOCTYPE html>", text: "The first line of every web page. It tells the browser to use modern HTML." };
      const name = (tagText.match(/^<\/?([a-zA-Z][a-zA-Z0-9]*)/) || [])[1];
      // On an attribute?
      // On an attribute? Find the name="value" pair the cursor is in, even mid-word.
      const ar = /([a-zA-Z-]+)(\s*=\s*("[^"]*"?|'[^']*'?|[^\s>]*))?/g;
      let attr = null, am;
      const rel = at - lt;
      ar.lastIndex = (tagText.match(/^<\/?[a-zA-Z][a-zA-Z0-9]*/) || [""])[0].length;
      while ((am = ar.exec(tagText))) { if (!am[0]) { ar.lastIndex++; continue; } if (rel >= am.index && rel <= am.index + am[0].length) { attr = am[1]; break; } }
      if (attr && ATTRS[attr.toLowerCase()]) return { title: `${attr} (an attribute of <${name}>)`, text: `${ATTRS[attr.toLowerCase()]} Attributes go inside the opening tag and add information to it.` };
      if (name && TAGS[name.toLowerCase()]) {
        const [t, x] = TAGS[name.toLowerCase()];
        return { title: `${tagText.startsWith("</") ? "Closing" : "Opening"} tag: <${tagText.startsWith("</") ? "/" : ""}${name.toLowerCase()}> · ${t}`, text: tagText.startsWith("</") ? `This closing tag ends the <${name.toLowerCase()}>. ${x}` : x };
      }
      if (name) return { title: `<${name}>`, text: `STEM 207 doesn't have a note about <${name}> yet. Try the Tag Explorer for the tags you'll use most.` };
    }
    // In text between tags: what element holds it?
    const before = code.slice(0, at);
    const open = [...before.matchAll(/<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g)].map((m) => m[1].toLowerCase());
    const closed = [...before.matchAll(/<\/([a-zA-Z][a-zA-Z0-9]*)>/g)].map((m) => m[1].toLowerCase());
    for (let i = open.length - 1; i >= 0; i--) {
      const n = open[i], k = closed.lastIndexOf(n);
      if (k >= 0) { closed.splice(k, 1); continue; }
      if (TAGS[n]) return { title: `Words inside <${n}>`, text: `These words are the content of the <${n}>: what visitors see. ${TAGS[n][1]}` };
    }
    return null;
  }

  /* ───────── CSS rules, and which ones style an element ───────── */
  function cssRules(css) {
    const out = [];
    const src = String(css || "").replace(/\/\*[\s\S]*?(\*\/|$)/g, (c) => c.replace(/[^\n]/g, " "));   // comments → spaces, so offsets stay true
    const re = /([^{}]+)\{([^}]*)\}/g;
    let m;
    while ((m = re.exec(src))) {
      const selector = m[1].trim();
      if (selector.startsWith("@")) { re.lastIndex = m.index + m[1].length + 1; continue; }   // look inside @media { … }
      if (!selector) continue;
      out.push({ selector, body: m[2], start: m.index + (m[1].length - m[1].trimStart().length), end: m.index + m[0].length });
    }
    return out;
  }
  function rulesFor(el, css) {
    return cssRules(css).filter((r) => r.selector.split(",").some((s) => { try { return el.matches(s.trim()); } catch (e) { return false; } }));
  }

  /* ───────── A line diff (LCS) ───────── */
  function diff(a, b) {
    const A = String(a).split("\n"), B = String(b).split("\n");
    const n = A.length, m = B.length;
    if (n * m > 400000) return [...A.map((t) => ({ op: "-", text: t })), ...B.map((t) => ({ op: "+", text: t }))];
    const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const out = [];
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (A[i] === B[j]) { out.push({ op: " ", text: A[i] }); i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) out.push({ op: "-", text: A[i++] });
      else out.push({ op: "+", text: B[j++] });
    }
    while (i < n) out.push({ op: "-", text: A[i++] });
    while (j < m) out.push({ op: "+", text: B[j++] });
    return out;
  }
  /* Only the changed lines, with a little context. */
  function diffHtml(d, label) {
    const keep = d.map((x, k) => x.op !== " " || d.slice(Math.max(0, k - 1), k + 2).some((y) => y.op !== " "));
    let html = "", gap = false;
    d.forEach((x, k) => {
      if (!keep[k]) { if (!gap) { html += `<li class="wsd__gap">…</li>`; gap = true; } return; }
      gap = false;
      html += `<li class="wsd__l wsd__l--${x.op === "+" ? "add" : x.op === "-" ? "del" : "same"}"><span class="wsd__op" aria-hidden="true">${x.op === " " ? "" : x.op}</span><span class="visually-hidden">${x.op === "+" ? "Added: " : x.op === "-" ? "Removed: " : ""}</span><code>${esc(x.text) || " "}</code></li>`;
    });
    return `<ol class="wsd" aria-label="${esc(label || "What changed")}">${html}</ol>`;
  }

  /* ───────── Previews ───────── */
  const miniFrame = (html, css, title, cls = "ws-mini") => `<iframe class="${cls}" title="${esc(title)}" sandbox="allow-same-origin" srcdoc="${esc(WK().srcdoc(html, { css }))}"></iframe>`;

  /* ───────── Show an Example ───────── */
  function showExample(o) {
    const lines = String(o.html).split("\n");
    const body = `
      <p class="wse__intro">${esc(o.intro || "This is an example, separate from your website. Tap a line of code to see what it makes.")}</p>
      <div class="wse">
        <section class="wse__code" aria-labelledby="wse-code-h">
          <h3 id="wse-code-h">${icon("code")}Example code</h3>
          <ol class="wse__lines">${lines.map((l, i) => `<li><button type="button" class="wse__line" data-line="${i}"><code>${esc(l) || " "}</code></button></li>`).join("")}</ol>
          ${o.css ? `<h4>Its CSS</h4><pre class="wse__css"><code>${esc(o.css)}</code></pre>` : ""}
        </section>
        <section class="wse__site" aria-labelledby="wse-site-h">
          <h3 id="wse-site-h">${icon("eye")}Example website</h3>
          <iframe class="wse__frame" id="wse-frame" title="The example, as a website" sandbox="allow-same-origin"></iframe>
          <p class="wse__say" id="wse-say" role="status">${esc((o.notes && o.notes[0] && o.notes[0].say) || "")}</p>
        </section>
      </div>
      ${o.notes && o.notes.length ? `<details class="wse__notes" open><summary>What this code does</summary><ul>${o.notes.map((n) => `<li><code>${esc(n.match)}</code> ${esc(n.say)}</li>`).join("")}</ul></details>` : ""}
      <details class="wse__try"><summary>${icon("bulb")}Try it: change the example (it never touches your website)</summary>
        <label class="visually-hidden" for="wse-try">Example code to try</label>
        <textarea id="wse-try" class="ws-code" rows="6" spellcheck="false">${esc(o.html)}</textarea>
        <div class="wse__trybar"><button type="button" class="btn btn--ghost btn--small" id="wse-reset">${icon("refresh")}Reset the example</button></div>
        <iframe class="wse__frame wse__frame--try" id="wse-tryframe" title="Your changed example" sandbox="allow-same-origin"></iframe>
      </details>
      <div class="wse__actions">
        <button type="button" class="btn btn--ghost btn--small" id="wse-copy">${icon("clipboard")}Copy the example</button>
        ${o.snippet ? `<button type="button" class="btn btn--primary btn--small" id="wse-insert">${icon("plus")}Insert a starter at my cursor</button>` : ""}
        <p class="wse__msg" id="wse-msg" role="status"></p>
      </div>`;
    SE.modal.open({
      title: o.title || "Show an Example", body, wide: true,
      onOpen(dlg) {
        const $ = (s) => dlg.querySelector(s);
        const out = WK().srcdoc(o.html, { css: o.css, map: true, head: `<style>[data-wk-on]{outline:3px solid #b4006a;outline-offset:2px}</style>` });
        $("#wse-frame").srcdoc = out.doc;
        // A code line → the element its first opening tag made.
        const lineStart = (k) => lines.slice(0, k).reduce((n, l) => n + l.length + 1, 0);
        dlg.querySelectorAll(".wse__line").forEach((b) => b.addEventListener("click", () => {
          const k = Number(b.dataset.line), s = lineStart(k), e = s + lines[k].length;
          dlg.querySelectorAll(".wse__line.is-on").forEach((x) => x.classList.remove("is-on"));
          b.classList.add("is-on");
          const hit = out.map.find((m) => m.start >= s && m.start < e) || out.map.filter((m) => m.start < s).pop();
          const d = $("#wse-frame").contentDocument;
          if (d) {
            d.querySelectorAll("[data-wk-on]").forEach((n) => n.removeAttribute("data-wk-on"));
            const n = hit && d.querySelector(`[data-wk="${hit.i}"]`);
            if (n) { n.setAttribute("data-wk-on", ""); n.scrollIntoView({ block: "nearest" }); }
          }
          const note = (o.notes || []).find((x) => lines[k].includes(x.match));
          const ex = explain(o.html, s + Math.max(0, lines[k].indexOf("<") + 1), "html");
          $("#wse-say").textContent = note ? note.say : ex ? ex.text : "This line is part of the example.";
        }));
        const tryIt = () => { $("#wse-tryframe").srcdoc = WK().srcdoc($("#wse-try").value, { css: o.css }); };
        let t = null;
        $("#wse-try").addEventListener("input", () => { clearTimeout(t); t = setTimeout(tryIt, 250); });
        dlg.querySelector(".wse__try").addEventListener("toggle", tryIt, { once: true });
        $("#wse-reset").addEventListener("click", () => { $("#wse-try").value = o.html; tryIt(); $("#wse-msg").textContent = "The example is back the way it was. Your website didn't change."; });
        $("#wse-copy").addEventListener("click", () => {
          const text = o.css ? `${o.html}\n\n/* CSS */\n${o.css}` : o.html;
          const done = () => { $("#wse-msg").textContent = "Copied the example."; };
          if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => { $("#wse-msg").textContent = "Your browser didn't allow copying. Select the code and copy it instead."; });
        });
        const ins = $("#wse-insert");
        if (ins) {
          let asked = false;
          ins.addEventListener("click", () => {
            if (!asked) {
              asked = true;
              ins.innerHTML = `${icon("check")}Yes, insert it`;
              $("#wse-msg").textContent = `This adds ${o.snippet.split("\n").length === 1 ? "this line" : `these ${o.snippet.split("\n").length} lines`} where your cursor is: ${o.snippet.replace(/\s+/g, " ").slice(0, 80)}. Nothing else in your code changes. Press again to insert.`;
              return;
            }
            dlg.close();
            o.onInsert(o.snippet, o.snippetLang || "html");
          });
        }
      }
    });
  }

  /* ───────── Tag Explorer ───────── */
  const EXPLORER = [
    { tag: "h1", code: "<h1>Maine Moose Facts</h1>", mistake: "Using more than one <h1>, or a big <p> instead of a real heading." },
    { tag: "h2", code: "<h2>Where Moose Live</h2>", mistake: "Skipping a level, like going from <h1> straight to <h3>." },
    { tag: "p", code: "<p>Moose are the largest deer in the world.</p>", mistake: "Forgetting the closing </p>." },
    { tag: "ul", code: "<ul>\n  <li>Forests</li>\n  <li>Ponds</li>\n</ul>", mistake: "Putting <li> items outside the <ul>." },
    { tag: "ol", code: "<ol>\n  <li>Pack water</li>\n  <li>Start the trail</li>\n</ol>", mistake: "Typing the numbers yourself: <ol> numbers the items for you." },
    { tag: "a", code: "<a href=\"#facts\">Jump to the moose facts</a>", mistake: "Link words like \"click here\" that don't say where the link goes." },
    { tag: "img", code: "<img src=\"moose.svg\" alt=\"A moose standing in a pond\">", mistake: "Leaving out alt, or writing alt=\"picture\"." },
    { tag: "header", code: "<header>\n  <h1>Trail Finder</h1>\n</header>", mistake: "Using <header> for every heading: it's the top part of the page or a section." },
    { tag: "nav", code: "<nav>\n  <a href=\"#trails\">Trails</a>\n  <a href=\"#tips\">Tips</a>\n</nav>", mistake: "Putting the whole page in <nav>: it's only for the menu links." },
    { tag: "main", code: "<main>\n  <p>The main content goes here.</p>\n</main>", mistake: "Using more than one <main> on a page." },
    { tag: "section", code: "<section id=\"tips\">\n  <h2>Hiking tips</h2>\n  <p>Bring water.</p>\n</section>", mistake: "A <section> with no heading: give each section one." },
    { tag: "footer", code: "<footer>\n  <p>Made by a STEM 207 student.</p>\n</footer>", mistake: "Putting personal information, like an address, in the footer." },
    { tag: "strong", code: "<p>Always <strong>stay on the trail</strong>.</p>", mistake: "Using <strong> just to make words bold: it means important." },
    { tag: "em", code: "<p>Moose can <em>swim</em>!</p>", mistake: "Using <em> for whole paragraphs." }
  ];
  function tagExplorer(o = {}) {
    const body = `<p>The tags you'll use most. Pick one to see what it does.</p>
      <div class="wst">
        <div class="wst__list" role="group" aria-label="Tags">${EXPLORER.map((t, i) => `<button type="button" class="wst__tag" data-t="${i}" aria-pressed="${i === 0}"><code>&lt;${t.tag}&gt;</code><span>${esc(TAGS[t.tag][0])}</span></button>`).join("")}</div>
        <div class="wst__card" id="wst-card" aria-live="polite"></div>
      </div>`;
    SE.modal.open({
      title: "HTML Tag Explorer", body, wide: true,
      onOpen(dlg) {
        const show = (i) => {
          const t = EXPLORER[i];
          dlg.querySelectorAll(".wst__tag").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.t) === i)));
          const lesson = o.lessonOf ? o.lessonOf(t.tag) : "";
          dlg.querySelector("#wst-card").innerHTML = `<h3><code>&lt;${t.tag}&gt;</code> ${esc(TAGS[t.tag][0])}</h3>
            <p>${esc(TAGS[t.tag][1])}</p>
            <div class="wst__ex"><pre><code>${esc(t.code)}</code></pre>${miniFrame(t.code, "body{font-family:system-ui,sans-serif;margin:.5rem;color:#213547}", `What <${t.tag}> looks like`)}</div>
            <p class="wst__oops">${icon("alert")}<span><strong>Common mistake:</strong> ${esc(t.mistake)}</span></p>
            ${lesson ? `<p class="muted small">You'll practice it in: ${esc(lesson)}</p>` : ""}`;
        };
        dlg.querySelector(".wst__list").addEventListener("click", (e) => { const b = e.target.closest("[data-t]"); if (b) show(Number(b.dataset.t)); });
        show(0);
      }
    });
  }

  /* ───────── Glossary ───────── */
  const GLOSSARY = {
    element: "An element is one part of a page, like a heading or a picture: the opening tag, what's inside, and the closing tag.",
    tag: "A tag is the code in angle brackets, like <h1>. Most come in pairs: an opening tag and a closing tag with a slash, </h1>.",
    attribute: "An attribute adds information inside an opening tag, like href in <a href=\"#menu\">.",
    browser: "A browser is the app that reads HTML and shows the page, like Chrome or Safari.",
    document: "The document is the whole web page file, from <!DOCTYPE html> to </html>.",
    "source code": "Source code is the text you write that the computer reads. Your HTML and CSS are source code.",
    nesting: "Nesting means putting an element inside another one, like <li> inside <ul>. Close the inside one first.",
    "semantic HTML": "Semantic HTML uses tags that say what something is, like <nav> for a menu, not just how it looks.",
    selector: "A selector is the part of a CSS rule that picks what to style, like h1 or .card.",
    property: "A property is the thing CSS changes, like color or padding.",
    value: "A value is what you set a property to, like #213547 or 1rem.",
    debugging: "Debugging is finding and fixing mistakes in code, one at a time.",
    CSS: "CSS (Cascading Style Sheets) controls how a page looks: colors, fonts, and spacing.",
    HTML: "HTML (HyperText Markup Language) gives a page its structure: what each part is."
  };
  let tipN = 0;
  /* A toggletip: a button with the word that shows its meaning when pressed (keyboard and touch friendly). */
  const term = (word, shown) => { const id = `wsg-${++tipN}`; return `<span class="wsg"><button type="button" class="wsg__b" aria-expanded="false" aria-controls="${id}">${esc(shown || word)}</button><span class="wsg__tip" id="${id}" role="note" hidden>${esc(GLOSSARY[word] || "")}</span></span>`; };
  if (typeof document !== "undefined") document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest(".wsg__b");
    document.querySelectorAll(".wsg__b[aria-expanded=true]").forEach((x) => { if (x !== b) { x.setAttribute("aria-expanded", "false"); document.getElementById(x.getAttribute("aria-controls")).hidden = true; } });
    if (!b) return;
    const tip = document.getElementById(b.getAttribute("aria-controls")), open = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", String(open)); tip.hidden = !open;
  });
  if (typeof document !== "undefined") document.addEventListener("keydown", (e) => { if (e.key === "Escape") document.querySelectorAll(".wsg__b[aria-expanded=true]").forEach((x) => { x.setAttribute("aria-expanded", "false"); document.getElementById(x.getAttribute("aria-controls")).hidden = true; }); });

  /* ───────── The issue list: every issue gets its own Find It ───────── */
  /* issues: [{ key, label, what, why, how, hint, wk, at }]. Find It buttons carry data-issue="<key>". */
  function issueList(issues, o = {}) {
    return `<ol class="wsi">${issues.map((x, n) => `<li class="wsi__i" data-key="${esc(x.key)}">
        <p class="wsi__h">${icon("alert")}<strong>${n + 1}. ${esc(x.label)}</strong></p>
        <p><span class="wsi__k">What's wrong:</span> ${esc(x.what)}</p>
        ${x.why ? `<p><span class="wsi__k">Why it matters:</span> ${esc(x.why)}</p>` : ""}
        ${x.how ? `<p><span class="wsi__k">How to fix it:</span> ${esc(x.how)}</p>` : ""}
        <div class="wsi__btns">
          <button type="button" class="btn btn--ghost btn--small" data-issue="${esc(x.key)}">${icon("search")}Find it</button>
          ${x.hint ? `<button type="button" class="linkish" data-hint="${esc(x.key)}" aria-expanded="false">Show me a hint</button>` : ""}
        </div>
        ${x.hint ? `<p class="wsi__hint" hidden><code>${esc(x.hint)}</code></p>` : ""}
      </li>`).join("")}</ol>${o.after || ""}`;
  }

  SE.webStudio = { explain, cssRules, rulesFor, diff, diffHtml, showExample, tagExplorer, GLOSSARY, term, issueList, miniFrame, TAGS, EXPLORER };
})();
