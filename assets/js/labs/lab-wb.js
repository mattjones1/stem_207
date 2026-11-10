/*
 * STEM 207 Website Builder (lab id "website-builder"): describe a website in everyday words, watch the rule-based
 * builder write it (wb-composer.js, wb-interview.js), then learn HTML and CSS by changing it in the Coding Studio.
 * No AI, no network: everything here is rules and the student's own work, on this device.
 *
 * The 8 levels are 8 activities. Each one checks the student's OWN edits, by comparing the code with a snapshot
 * taken when the activity opened (Make a Change updates that snapshot, so the builder's changes never count).
 * Storage: localStorage stem207.wb.<studentId> (sessionStorage stem207.wb.preview for educators):
 *   { answers, q, v1, files: { html, css }, title, versions: [{ at, label, html, css }], base: { [idx]: files },
 *     debug: { html, css }, reflect: { right, wrong, changed }, viewedPhone }
 * Pure rules for tests: SE.wb.injectBugs(files), SE.wb.cssSemicolons(css), SE.wb.ACTIVITIES.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;
  const WK = SE.webKit, WS = SE.webStudio;
  const LAB = "website-builder";

  /* ───────── Saving (this device only) ───────── */
  function storeFor(user) {
    const student = user && user.role === "student";
    const key = `stem207.wb.${student ? user.id : "preview"}`;
    let s = null;
    try { s = student ? window.localStorage : window.sessionStorage; } catch (e) { s = null; }
    return {
      load() { try { return JSON.parse((s && s.getItem(key)) || "{}") || {}; } catch (e) { return {}; } },
      save(v) { try { if (s) s.setItem(key, JSON.stringify(v)); } catch (e) { /* storage full or off */ } }
    };
  }

  /* ───────── The 8 activities: learn first, then change your own website ───────── */
  const ACTIVITIES = [
    { title: "Meet Your HTML", concept: "HTML structure", goal: "Find a heading in your website's code and change its words.",
      steps: ["Open the locked lines at the top of index.html to see the start of the file.", "Find a heading: <h1>, <h2>, or <h3>.", "Change its words, and watch the preview."],
      hints: ["Tap the heading in the preview: the code that made it is selected.", "The words between <h1> and </h1> are what visitors see.", "Only change the words between the tags, not the tags themselves."],
      learned: "A web page is a document of elements. Each element has an opening tag, content, and a closing tag, and the browser draws them in order.",
      lesson: { building: "Your first change to your own website's real code.", why: "The builder wrote this HTML, but now it's yours. Reading code is how every developer starts.",
        learn: [{ h: "The parts of the file", say: ["<!DOCTYPE html> says it's modern HTML. <head> holds information for the browser, like the <title>. <body> holds everything visitors see."] },
          { h: "Elements and tags", say: ["An element is an opening tag, its content, and a closing tag. <h1>Maine Moose</h1> is a main heading."] },
          { h: "Semantic structure", say: ["Your page uses tags that say what each part is: <header> at the top, <nav> for the menu, <main> for the content, <section> for each part, <footer> at the bottom."] }],
        mistakes: ["Deleting a < or > by accident: Undo (Ctrl+Z) brings it back.", "Changing the tag name instead of the words."] } },
    { title: "Make It Personal", concept: "Headings and paragraphs", goal: "Change a heading and a paragraph, then add a sentence or a section of your own.",
      steps: ["Change a heading's words.", "Change a paragraph's words.", "Add a new sentence, a new <p>, or a whole new section."],
      hints: ["Placeholders like \"Write your About words here\" are waiting for your words.", "A new paragraph is <p>, your sentence, then </p>.", "A new section: <section>, an <h2>, a <p>, then </section>, inside <main>."],
      learned: "Headings organize a page, paragraphs hold the sentences, and nesting puts elements inside other elements.",
      lesson: { building: "A website that sounds like you: your headings, your sentences.", why: "The builder only knew your answers. You know much more about your topic.",
        learn: [{ h: "Headings in order", say: ["One <h1> for the page, <h2> for each section, <h3> inside a section."] }, { h: "Nesting", say: ["Nesting means putting elements inside other elements. A <p> inside a <section> belongs to that section. Close the inside one first."] }],
        mistakes: ["Typing new text outside any tag.", "Adding a second <h1>."] } },
    { title: "Discover CSS", concept: "CSS", goal: "In styles.css, change a main color and one typography property (like font-size or font-family).",
      steps: ["Open styles.css.", "Find a color, like background-color in body, and change it.", "Change a font-size, font-family, or font-weight."],
      hints: ["Tap a part of the preview: the CSS rules that style it are listed, with Go to rule.", "A rule is a selector, then property: value; lines inside { }.", "body { color: … } changes the color of all the words."],
      learned: "CSS rules pick elements with a selector and change them with properties and values.",
      lesson: { building: "Your own colors and fonts.", why: "HTML says what something is. CSS says how it looks. Every site you know uses CSS.",
        learn: [{ h: "A CSS rule", say: ["The selector picks what to style. Each property: value; line changes one thing."] }, { h: "Colors and fonts", say: ["#13213c is a hex color. font-family picks the typeface; font-size how big; font-weight how bold."] }],
        mistakes: ["Forgetting the semicolon at the end of a line.", "Words that are hard to read on the new background: check the contrast."] } },
    { title: "Design the Layout", concept: "Spacing and layout", goal: "Change the spacing (margin, padding, or gap), or move a section to a new place.",
      steps: ["Find padding or gap in styles.css and change it.", "Or move a whole <section> in index.html: cut it, and paste it in a new place inside <main>."],
      hints: ["padding is space inside an element; margin is space outside it.", "gap is the space between items in a grid or flex layout.", "Move a section from its <section> line to its </section> line, all together."],
      learned: "Spacing makes a page easy to read, and layout decides where each part goes.",
      lesson: { building: "A page that breathes: the right space, in the right order.", why: "Crowded pages are hard to read. Good spacing guides visitors' eyes.",
        learn: [{ h: "Padding and margin", say: ["padding: space inside the edge. margin: space outside the edge."] }, { h: "Flex and grid", say: ["display: grid makes columns. repeat(auto-fit, minmax(12rem, 1fr)) fits as many as there's room for, so it works on a phone too."] }],
        mistakes: ["Moving only part of a section: move from <section> to </section>.", "Huge padding on a phone."] } },
    { title: "Add Something New", concept: "Lists, links, and images", goal: "Add something that wasn't in Version 1: a list, a card, a picture with alt text, a link, or a new section.",
      steps: ["Choose what to add.", "Use Show an Example or the Tag Explorer for the tags.", "Check that pictures have alt text and links go somewhere."],
      hints: ["A list: <ul>, then <li> items, then </ul>.", "A picture: <img src=\"rocket.svg\" alt=\"…\">. Built-in pictures only.", "A link that jumps: <a href=\"#about\">See the About section</a>."],
      learned: "You extended your website beyond what the builder made, with real HTML of your own.",
      lesson: { building: "Something the builder didn't make.", why: "The builder only knows a few rules. You can add anything HTML can do.",
        learn: [{ h: "Lists, links, and pictures", say: ["<ul> and <li> make a list. <a href=\"#id\"> jumps to part of the page. <img src alt> shows a picture with a description."] }],
        mistakes: ["A picture without alt text.", "A link to an id that doesn't exist."] } },
    { title: "Debug Like a Developer", concept: "Debugging", goal: "This practice copy of your website has three bugs. Find and fix them.",
      steps: ["Press Check my work to see the bugs.", "Use Find it on each one.", "Fix one at a time, and check again."],
      hints: ["Look for a CSS line that's missing its semicolon.", "A link goes to an id that isn't on the page.", "A picture lost its alt text."],
      learned: "Debugging is investigating: test, find the first problem, fix it, and test again.",
      lesson: { building: "A practice copy of your website with three bugs in it. Your real website doesn't change.", why: "Every developer writes bugs. Finding them calmly is a superpower.",
        learn: [{ h: "CSS bugs", say: ["A missing semicolon makes the browser skip the next line, so a style seems to vanish."] }, { h: "HTML bugs", say: ["A link to a missing id goes nowhere. A picture without alt is invisible to screen readers."] }],
        mistakes: ["Changing many things at once: fix one, check again.", "Deleting the line instead of fixing it."] } },
    { title: "The Human Touch", concept: "People and programs", goal: "Think about what the builder got right and wrong, then make one improvement of your own.",
      steps: ["Answer the three questions.", "Make one change that makes your website better for a real visitor.", "Press Check my work."],
      hints: ["Read your page like a visitor who knows nothing about your topic.", "Did the builder use your words? What did it guess?", "A better sentence, a clearer link, or a missing fact all count."],
      learned: "A program follows rules. People bring judgment, care, and ideas. Keep the humanity in technology.",
      lesson: { building: "A better website, because a person thought about it.", why: "The builder followed rules: it can't know what your visitors need. You can.",
        learn: [{ h: "Programs follow rules", say: ["The builder matched keywords and filled in templates. It didn't understand your idea. That's why it left placeholders."] }],
        mistakes: ["Calling it done because the builder made it."] } },
    { title: "My Website, My Creation", concept: "Testing and finishing", goal: "Test your website like a visitor, fix anything that needs it, and finish it.",
      steps: ["Look at it in Phone.", "Press Check my work.", "Fix anything it finds, then finish."],
      hints: ["Every picture needs alt text.", "Every link should go somewhere on the page.", "Words need 4.5 to 1 contrast on their background."],
      learned: "You described a website, read the code a program wrote, and made it your own: changing, extending, debugging, and testing it.",
      lesson: { building: "Your finished website.", why: "Real web teams test every page: on a phone, for accessibility, and by reading it like a visitor.",
        learn: [{ h: "Test like a visitor", say: ["Read it top to bottom. Try every link. Look at it on a phone. Check the colors are easy to read."] }],
        mistakes: ["Skipping the Phone preview."] } }
  ];
  const GOALS = ACTIVITIES.map((a) => [a.goal, a.lesson.why]);

  /* ───────── Pure rules ───────── */
  /* A CSS declaration line with no semicolon, followed by another declaration: the classic skipped-line bug. */
  function cssSemicolons(css) {
    const lines = String(css).split("\n"), out = [];
    let off = 0;
    lines.forEach((l, i) => {
      const next = (lines.slice(i + 1).find((x) => x.trim()) || "").trim();
      if (/^\s*[a-z-]+\s*:\s*[^;{}]+$/i.test(l) && /^[a-z-]+\s*:/i.test(next)) out.push({ start: off + l.search(/\S/), end: off + l.length, line: i + 1 });
      off += l.length + 1;
    });
    return out;
  }
  /* Three bugs in a copy: a missing semicolon, a link to a missing id, a picture without alt. */
  function injectBugs(files) {
    let { html, css } = files;
    css = css.replace(/(body\s*\{[^}]*?\n\s*color:\s*[^;\n]+);/, "$1");
    if (css === files.css) css = css.replace(/(\n\s*[a-z-]+:\s*[^;\n]+);(\n\s*[a-z-]+:)/, "$1$2");
    if (/href="#[^"]+"/.test(html)) html = html.replace(/href="#[^"]+"/, "href=\"#oops\"");
    else html = html.replace("</main>", "  <p><a href=\"#oops\">Jump to the top</a></p>\n</main>");
    if (/<img [^>]*alt="[^"]*"/.test(html)) html = html.replace(/(<img [^>]*?)\s+alt="[^"]*"/, "$1");
    else html = html.replace("</main>", "  <img src=\"lighthouse.svg\">\n</main>");
    return { html, css };
  }
  const parse = (h) => new DOMParser().parseFromString(`<!doctype html><body>${h}</body>`, "text/html");
  const texts = (doc, sel) => [...doc.querySelectorAll(sel)].map((e) => e.textContent.replace(/\s+/g, " ").trim());
  const decls = (css, re) => new Set((String(css).match(/[a-z-]+\s*:\s*[^;{}]+/gi) || []).map((d) => d.replace(/\s+/g, " ").trim().toLowerCase()).filter((d) => re.test(d)));
  const changedDecl = (a, b, re) => { const x = decls(a, re), y = decls(b, re); return [...y].some((d) => !x.has(d)); };
  const wordCount = (doc) => (doc.body.textContent.match(/\S+/g) || []).length;
  const count = (doc, sel) => doc.querySelectorAll(sel).length;

  /* ───────── The studio ───────── */
  function mount(el, idx, api) {
    const store = storeFor(api.user), state = store.load();
    const A = ACTIVITIES[idx];
    if (!state.v1) {   // no website yet: the interview runs right here
      el.innerHTML = `<div id="wb-start"></div>`;
      SE.wbInterview.mount(el.querySelector("#wb-start"), api, store);
      return () => {};
    }
    const body = el.closest(".lab-body");
    if (body) body.classList.add("lab-body--wide");
    const debug = idx === 5;
    if (debug && !state.debug) state.debug = injectBugs(state.files);
    const files = debug ? state.debug : state.files;
    state.base = state.base || {};
    if (!state.base[idx]) state.base[idx] = { html: files.html, css: files.css };
    state.versions = state.versions || [];
    state.reflect = state.reflect || {};
    store.save(state);
    const save = () => store.save(state);
    let tab = "html", phone = false, map = [], timer = null, ready = Promise.resolve();
    const title = state.title || "My Website";

    el.innerHTML = `
      <div class="wbs" id="wbs">
        <div class="wbs__bar">
          <p class="wbs__name">${debug ? `${icon("alert")}<span>A <strong>practice copy</strong> of your website, with three bugs. Your real website doesn't change.</span>` : `<span>My website: <strong>${esc(title)}</strong></span>`}</p>
          <div class="ws__toggles" role="group" aria-label="Studio tools">
            <button type="button" class="btn btn--ghost btn--small" id="wb-example">${icon("eye")}Show an Example</button>
            <button type="button" class="btn btn--ghost btn--small" id="wb-tags">${icon("code")}Tag Explorer</button>
            ${debug ? "" : `<button type="button" class="btn btn--ghost btn--small" id="wb-change">${icon("palette")}Make a Change</button>
            <button type="button" class="btn btn--ghost btn--small" id="wb-versions">${icon("refresh")}Versions</button>`}
          </div>
        </div>
        <div class="wbs__panes">
          <section class="wbs__edit" aria-label="Your code">
            <div class="ws-tabrow">
              <div class="ws-tabs" role="tablist" aria-label="Files">
                <button type="button" role="tab" id="wb-tab-html" aria-selected="true" aria-controls="wb-panel-html">HTML <span class="ws-file">index.html</span></button>
                <button type="button" role="tab" id="wb-tab-css" aria-selected="false" aria-controls="wb-panel-css">CSS <span class="ws-file">styles.css</span></button>
              </div>
              <div class="ws-undo"><button type="button" class="linkish" id="wb-tidy">Tidy</button></div>
            </div>
            <div id="wb-panel-html" role="tabpanel" aria-labelledby="wb-tab-html"><label class="visually-hidden" for="wb-html">index.html</label><textarea id="wb-html" class="ws-code" rows="14" aria-describedby="wb-coach">${esc(files.html)}</textarea></div>
            <div id="wb-panel-css" role="tabpanel" aria-labelledby="wb-tab-css" hidden><label class="visually-hidden" for="wb-css">styles.css</label><textarea id="wb-css" class="ws-code" rows="14" aria-describedby="wb-coach">${esc(files.css)}</textarea></div>
            <p class="ws-coach" id="wb-coach" aria-live="polite"></p>
          </section>
          <section class="wbs__view" aria-label="Preview">
            <div class="ws-viewbar"><span class="ws-viewbar__h" id="wb-prev-h">Live preview</span>
              <div class="ws-size" role="group" aria-label="Preview size"><button type="button" class="btn btn--ghost btn--small" id="wb-desk" aria-pressed="true">Desktop</button><button type="button" class="btn btn--ghost btn--small" id="wb-phone" aria-pressed="false">Phone</button></div></div>
            <div class="ws-framebox" id="wb-framebox"><iframe id="wb-frame" class="ws-frame" title="Preview of your website" sandbox="allow-same-origin" aria-describedby="wb-prev-h"></iframe></div>
            <p class="wbs__blank" id="wb-blank" role="status"></p>
            <div class="wbs__rules" id="wb-rules" aria-live="polite"><p class="field-help">Tap any part of your page: its HTML is selected, and the CSS rules that style it show here.</p></div>
            <div class="ws-actions"><button type="button" class="btn btn--launch" id="wb-check">${icon("check")}Check my work</button></div>
            <div class="ws-feedback-slot"></div>
            <section class="ws-checks" id="wb-results" aria-label="Check my work results"></section>
          </section>
        </div>
      </div>`;
    const $ = (s) => el.querySelector(s);
    const fb = document.getElementById("lab-feedback");
    if (fb) $(".ws-feedback-slot").replaceWith(fb);
    const ta = { html: $("#wb-html"), css: $("#wb-css") };
    const shellTop = [{ text: "<!DOCTYPE html>", why: "Use modern HTML" }, { text: "<html lang=\"en\">", why: "The whole page, in English" }, { text: "<head>", why: "Information for the browser" }, { text: "  <meta charset=\"UTF-8\">", why: "Show every letter correctly" }, { text: `  <title>${title}</title>`, why: "The name in the browser tab" }, { text: "  <link rel=\"stylesheet\" href=\"styles.css\">", why: "Use the CSS in styles.css" }, { text: "</head>" }, { text: "<body>", why: "Everything visitors see" }];
    const ed = { html: SE.codeEditor(ta.html, { lang: "html", shellTop, shellBottom: [{ text: "</body>" }, { text: "</html>" }], foldTop: true }), css: SE.codeEditor(ta.css, { lang: "css" }) };
    const persist = () => { files.html = ta.html.value; files.css = ta.css.value; save(); };
    function setFiles(f) { ta.html.value = f.html; ta.css.value = f.css; ed.html.refresh(); ed.css.refresh(); persist(); render(); }
    function showTab(t) {
      tab = t;
      ["html", "css"].forEach((k) => { $(`#wb-tab-${k}`).setAttribute("aria-selected", String(k === t)); $(`#wb-panel-${k}`).hidden = k !== t; });
      coach();
    }
    function typeAt(area, text) {
      area.focus();
      if (!(document.execCommand && document.execCommand("insertText", false, text))) area.setRangeText(text, area.selectionStart, area.selectionEnd, "end");
      area.dispatchEvent(new Event("input", { bubbles: true }));
    }

    /* Preview: the sandbox, Find it, the rules that style what was tapped, and a word when the page looks blank. */
    const HEAD = `<style>[data-wk-on]{outline:3px solid #b4006a !important;outline-offset:2px}</style>`;
    function render() {
      const out = WK.srcdoc(ta.html.value, { css: ta.css.value, map: true, head: HEAD, title });
      map = out.map;
      ready = new Promise((res) => {
        $("#wb-frame").onload = () => {
          const d = $("#wb-frame").contentDocument;
          if (d) d.addEventListener("click", (e) => {
            e.preventDefault();
            const hit = e.target.closest && e.target.closest("[data-wk]");
            if (hit) explore(hit);
          });
          blank(d);
          res();
        };
      });
      $("#wb-frame").srcdoc = out.doc;
    }
    function blank(d) {
      const out = $("#wb-blank");
      const open = (ta.css.value.match(/\{/g) || []).length, close = (ta.css.value.match(/\}/g) || []).length;
      const semis = cssSemicolons(ta.css.value);
      out.textContent = !d || !d.body || !d.body.textContent.trim() ? "Your page looks blank because there are no words inside <body> yet, or they're inside a tag that was never closed."
        : open !== close ? `Your CSS has ${open} { and ${close} }. Every rule needs both, so some styles may not show.`
          : semis.length ? `A CSS line near line ${semis[0].line} is missing its semicolon, so the browser skips the line after it.` : "";
    }
    function explore(node) {
      const wk = node.getAttribute("data-wk"), m = map.find((x) => String(x.i) === wk);
      if (m) { showTab("html"); ed.html.goTo(m.start, m.end); }
      const d = $("#wb-frame").contentDocument;
      d.querySelectorAll("[data-wk-on]").forEach((n) => n.removeAttribute("data-wk-on"));
      node.setAttribute("data-wk-on", "");
      const rules = WS.rulesFor(node, ta.css.value);
      $("#wb-rules").innerHTML = `<p><strong>&lt;${esc(node.tagName.toLowerCase())}&gt;</strong> is selected in index.html${m ? ` (line ${ed.html.lineOf(m.start)})` : ""}. HTML says what it is. CSS says how it looks:</p>
        ${rules.length ? `<ul class="wbs__rl">${rules.map((r, i) => `<li><code>${esc(r.selector)} { … }</code><button type="button" class="linkish" data-rule="${i}">Go to rule</button></li>`).join("")}</ul>` : `<p class="muted">No rule in styles.css picks this element by itself; it gets its look from body.</p>`}`;
      $("#wb-rules").onclick = (e) => { const b = e.target.closest("[data-rule]"); if (!b) return; const r = rules[Number(b.dataset.rule)]; showTab("css"); ed.css.goTo(r.start, r.end); };
    }
    function coach() {
      const area = ta[tab], x = WS.explain(area.value, area.selectionStart, tab);
      $("#wb-coach").textContent = x ? `What does this do? ${x.title}: ${x.text}` : "";
    }

    /* ───────── Check my work: each activity checks real changes ───────── */
    async function check() {
      clearTimeout(timer); persist(); render(); await ready;
      const d = $("#wb-frame").contentDocument, base = state.base[idx], b = parse(base.html), now = parse(ta.html.value);
      const items = [], issues = [];
      const item = (ok, label, msg) => items.push({ ok, label, msg });
      const H = "h1, h2, h3", same = (x, y) => x.length === y.length && x.every((v, i) => v === y[i]);
      if (idx === 0) item(texts(now, H).some((t) => !texts(b, H).includes(t)), "A heading's words changed", "Change the words between a heading's tags, like <h1>…</h1>.");
      if (idx === 1) {
        item(texts(now, H).some((t) => !texts(b, H).includes(t)), "A heading's words changed", "Change a heading's words.");
        item(texts(now, "p, li").some((t) => !texts(b, "p, li").includes(t)), "A paragraph's words changed", "Change a paragraph, or fill in a placeholder.");
        item(wordCount(now) >= wordCount(b) + 5 || count(now, "p, section") > count(b, "p, section"), "Something new of your own (5 or more new words, or a new <p> or <section>)", "Add a sentence, a <p>, or a whole <section>.");
      }
      if (idx === 2) {
        item(changedDecl(base.css, ta.css.value, /^(color|background|background-color)\s*:/), "A color changed", "Change a color, like background-color or color, in styles.css.");
        item(changedDecl(base.css, ta.css.value, /^(font-family|font-size|font-weight|line-height|letter-spacing|text-transform)\s*:/), "A typography property changed", "Change a font-size, font-family, or font-weight.");
      }
      if (idx === 3) item(changedDecl(base.css, ta.css.value, /^(margin|padding|gap)(-[a-z]+)?\s*:/) || !same([...now.querySelectorAll("main > section")].map((s) => s.id || s.className), [...b.querySelectorAll("main > section")].map((s) => s.id || s.className)), "Spacing changed, or a section moved", "Change margin, padding, or gap, or move a <section>.");
      if (idx === 4) {
        const sel = ["ul", "ol", "li", "img", "a", "section", "article", "figure", "h2", "h3", "table"];
        item(sel.some((t) => count(now, t) > count(b, t)), "Something new: a list, a picture, a link, a card, or a section", "Add an element that wasn't there before.");
      }
      // Pictures, links, and contrast: always part of good work (activities 5 to 8), and the bugs in activity 6.
      if (idx >= 4) {
        [...d.querySelectorAll("img")].forEach((i) => { if (!(i.getAttribute("alt") || "").trim()) issues.push({ key: `alt:${i.getAttribute("data-wk")}`, label: "Picture without alt text", what: "This picture has no alt text.", why: "Screen readers read alt text out loud for people who can't see the picture.", how: "Add alt=\"…\" with a few words that describe it.", hint: "alt=\"What the picture shows\"", wk: i.getAttribute("data-wk") }); });
        [...d.querySelectorAll("a[href^='#']")].forEach((a) => { const id = a.getAttribute("href").slice(1); if (id && !d.getElementById(id)) issues.push({ key: `link:${a.getAttribute("data-wk")}`, label: "Link that goes nowhere", what: `This link goes to #${id}, but nothing on the page has id="${id}".`, why: "A link that goes nowhere confuses visitors.", how: "Change the href to an id that's on the page, like one of your sections.", hint: "<a href=\"#about\">", wk: a.getAttribute("data-wk") }); });
      }
      if (idx === 5) cssSemicolons(ta.css.value).forEach((s) => issues.push({ key: `semi:${s.line}`, label: "CSS line missing its semicolon", what: `Line ${s.line} of styles.css doesn't end with a semicolon.`, why: "Without the ;, the browser can't tell where the value ends, so it skips the next line too.", how: "Add ; at the end of the line.", hint: "color: #213547;", css: s }));
      if (idx === 6) {
        const r = state.reflect, enough = (t) => (String(t || "").match(/\S+/g) || []).length >= 3;
        item(enough(r.right) && enough(r.wrong) && enough(r.changed), "You answered the three questions", "Write a few words for each question.");
        item(ta.html.value !== base.html || ta.css.value !== base.css, "You made an improvement of your own", "Make one change that helps a real visitor.");
      }
      if (idx === 7) {
        item(d.querySelectorAll("h1").length === 1, "One main heading", "A page has exactly one <h1>.");
        const low = WK.textContrast(d).filter((t) => t.ratio !== null && t.ratio < 4.5);
        item(!low.length, "Readable colors (4.5 to 1)", low.length ? `"${low[0].text}" is ${low[0].ratio} to 1. Make the words darker or the background lighter.` : "");
        item(!!state.viewedPhone, "You looked at it in Phone", "Press Phone above the preview.");
        item(ta.html.value !== state.v1.html || ta.css.value !== state.v1.css, "It has your own changes, not just Version 1", "Make it yours.");
      }
      lastIssues = issues;
      const all = items.every((x) => x.ok) && !issues.length;
      $("#wb-results").innerHTML = `${issues.length ? `<p class="ws-checks__h">${issues.length === 1 ? "1 thing needs a fix" : `${issues.length} things need a fix`}:</p>${WS.issueList(issues)}` : ""}
        ${items.length ? `<ul class="ws-checklist">${items.map((x) => `<li class="ws-check ws-check--${x.ok ? "good" : "fix"}">${icon(x.ok ? "check" : "alert")}<span><strong>${esc(x.label)}.</strong> ${x.ok ? "" : esc(x.msg)}</span></li>`).join("")}</ul>` : ""}`;
      api.log("lab_test_run", { activity: idx, ok: all, issues: issues.length });
      if (!all) { api.say(issues.length ? `${issues.length} to fix. Each one has its own Find it.` : "Not yet: see the checklist.", "warn"); return; }
      win();
    }
    let lastIssues = [];
    function win() {
      const done = new Set(SE.labs.progressFor(api.user, LAB)); done.add(idx);
      let extra = "";
      if (idx === 5) extra = `<p class="ws-cheer">${icon("check")}All three bugs fixed. That was a practice copy: your real website is waiting in the next activity.</p>`;
      if (idx === 7) {
        const info = { award: "Website Developer", course: "STEM 207 Website Builder", detail: `Built and made my own: ${title}`, name: api.user && api.user.role === "student" ? api.user.displayName : "", className: api.user && api.user.cls ? api.user.cls.name : "", at: Date.now() };
        extra = `<section class="wb-done" aria-labelledby="wb-done-h"><h3 id="wb-done-h">${icon("rocket")}My Website, My Creation</h3>
          <p>You described a website, read the code a program wrote, and made it your own. The builder followed rules; you did the thinking. <strong>Keep the humanity in technology.</strong></p>
          <iframe class="ws-done__frame" title="Your finished website" sandbox srcdoc="${esc(WK.srcdoc(ta.html.value, { css: ta.css.value, title }))}"></iframe>
          <div class="ws-done__actions">${SE.certificate ? SE.certificate.button(info, "Print my certificate") : ""}</div>
          <p class="muted small">Your website stays on this device. It isn't published on the internet.</p></section>`;
      }
      api.say(idx === 7 ? "You finished your website!" : `${ACTIVITIES[idx].title}: done!`, "good");
      api.win({ activity: idx, achievements: done.size >= 8 ? 3 : [0, 1, 2].every((i) => done.has(i)) ? 2 : 1 }, { extra, after: idx === 6 ? "" : "" });
    }
    $("#wb-results").addEventListener("click", (e) => {
      const iss = e.target.closest("[data-issue]");
      if (iss) {
        const x = lastIssues.find((i) => i.key === iss.dataset.issue);
        if (!x) return;
        if (x.css) { showTab("css"); ed.css.goTo(x.css.start, x.css.end); api.say(`${x.label}: line ${x.css.line} of styles.css. ${x.how}`, "info"); return; }
        const m = map.find((y) => String(y.i) === String(x.wk));
        if (m) { showTab("html"); ed.html.goTo(m.start, m.end); api.say(`${x.label}: line ${ed.html.lineOf(m.start)} of index.html. ${x.how}`, "info"); }
        return;
      }
      const hb = e.target.closest("[data-hint]");
      if (hb) { const h = hb.closest(".wsi__i").querySelector(".wsi__hint"); h.hidden = !h.hidden; hb.textContent = h.hidden ? "Show me a hint" : "Hide the hint"; }
    });

    /* ───────── Make a Change (rules, not AI), with Before → After, the diff, Apply or Cancel, and Teach Me ───────── */
    function makeChange(prefill) {
      SE.modal.open({ title: "Make a Change", wide: true, body: `<p>Describe a change in your own words. The builder knows a list of changes (it isn't AI), and it shows you exactly what it would change before anything happens.</p>
          <form class="wbc__ask" id="wbc-form"><label class="visually-hidden" for="wbc-q">Describe a change</label><input class="input" id="wbc-q" maxlength="120" placeholder="Make the title stand out" value="${esc(prefill || "")}"><button type="submit" class="btn btn--primary">${icon("search")}Show me</button></form>
          <div class="wb-chips">${["Make the title stand out", "Make it darker", "Add more space", "Make it look better on a phone", "Add a section about my favorite part"].map((x) => `<button type="button" class="wb-chip" data-try="${esc(x)}">${esc(x)}</button>`).join("")}</div>
          <div id="wbc-out" aria-live="polite"></div>`,
        onOpen(dlg) {
          const out = dlg.querySelector("#wbc-out");
          const go = (q) => {
            const cur = { html: ta.html.value, css: ta.css.value }, p = SE.wbChanges.propose(q, cur);
            api.log("lab_change", { ok: p.ok, id: p.id || "" });
            if (!p.ok) { out.innerHTML = `<p class="wbc__no">${esc(p.why)}</p>${p.suggest && p.suggest.length ? `<p class="muted small">Changes it knows: ${p.suggest.map(esc).join(" · ")}</p>` : ""}`; return; }
            const dH = WS.diff(cur.html, p.html), dC = WS.diff(cur.css, p.css);
            out.innerHTML = `<p><strong>Here's what the builder will try:</strong> ${esc(p.says)}</p>
              <div class="wbc__ba"><figure><figcaption>Before</figcaption>${WS.miniFrame(cur.html, cur.css, "Before the change", "wbc__f")}</figure><figure><figcaption>After</figcaption>${WS.miniFrame(p.html, p.css, "After the change", "wbc__f")}</figure></div>
              <h3>What changed in the code?</h3><p>${esc(p.why)}</p>
              ${dH.some((x) => x.op !== " ") ? `<p class="muted small">index.html</p>${WS.diffHtml(dH, "Changes in index.html")}` : ""}${dC.some((x) => x.op !== " ") ? `<p class="muted small">styles.css</p>${WS.diffHtml(dC, "Changes in styles.css")}` : ""}
              <div class="wb-actions"><button type="button" class="btn btn--primary" id="wbc-apply">${icon("check")}Apply</button><button type="button" class="btn btn--ghost" id="wbc-teach">${icon("bulb")}Teach Me to Make This Change</button><button type="button" class="btn btn--ghost" id="wbc-cancel">Cancel</button></div>`;
            out.querySelector("#wbc-cancel").onclick = () => dlg.close();
            out.querySelector("#wbc-apply").onclick = () => {
              state.versions.push({ at: Date.now(), label: `Before: ${q.slice(0, 40)}`, html: cur.html, css: cur.css });
              if (state.versions.length > 15) state.versions.shift();
              setFiles({ html: p.html, css: p.css });
              state.base[idx] = { html: p.html, css: p.css };   // the builder's change never counts as the student's own work
              save(); dlg.close();
              api.say("Applied. Your page before the change is saved in Versions. The activity still needs a change of your own.", "info");
            };
            out.querySelector("#wbc-teach").onclick = () => { dlg.close(); teach(SE.wbChanges.steps(cur, p), p.says); };
          };
          dlg.querySelector("#wbc-form").addEventListener("submit", (e) => { e.preventDefault(); go(dlg.querySelector("#wbc-q").value); });
          dlg.querySelectorAll("[data-try]").forEach((b) => b.addEventListener("click", () => { dlg.querySelector("#wbc-q").value = b.dataset.try; go(b.dataset.try); }));
          if (prefill) go(prefill);
        } });
    }
    /* Teach Me: the change as steps the student types, with Find it and a check that it worked. */
    function teach(steps, what) {
      if (!steps.length) return;
      $("#wb-results").innerHTML = `<section class="wbt" aria-labelledby="wbt-h"><h3 id="wbt-h" tabindex="-1">${icon("bulb")}Teach me: ${esc(what)}</h3>
        <ol>${steps.map((s, i) => `<li><p>${esc(s.say)}</p>${s.from.length ? `<p class="muted small">Change:</p><pre class="wl__code">${esc(s.from.join("\n"))}</pre><p class="muted small">to:</p>` : ""}<pre class="wl__code">${esc(s.to.join("\n"))}</pre><button type="button" class="linkish" data-step="${i}">${icon("search")}Find it</button></li>`).join("")}</ol>
        <div class="wb-actions"><button type="button" class="btn btn--primary btn--small" id="wbt-check">${icon("check")}Did I do it?</button></div><p id="wbt-say" role="status"></p></section>`;
      $("#wbt-h").focus();
      $("#wb-results").querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => {
        const s = steps[Number(b.dataset.step)], area = ta[s.lang], lines = area.value.split("\n");
        const at = lines.slice(0, Math.max(0, s.line - 1)).reduce((n, l) => n + l.length + 1, 0);
        showTab(s.lang); ed[s.lang].showInsertPoint(Math.min(at, area.value.length), s.from.length ? "Change this line" : "Add the new lines here");
      }));
      $("#wbt-check").addEventListener("click", () => {
        const norm = (t) => t.replace(/\s+/g, " ").trim();
        const ok = steps.every((s) => s.to.filter((l) => l.trim()).every((l) => norm(ta[s.lang].value).includes(norm(l))));
        $("#wbt-say").textContent = ok ? "Yes! You made the change yourself, in real code." : "Not yet: compare your code with each step. Find it shows where.";
      });
    }

    /* ───────── Versions ───────── */
    function versions() {
      const list = [{ label: "Version 1 (from the builder)", html: state.v1.html, css: state.v1.css, at: state.v1.at }].concat(state.versions.slice().reverse());
      SE.modal.open({ title: "Versions", wide: true, body: `<p>Every time you apply a change, the page before it is saved here. You can also save one yourself. Restoring saves your current page first, so nothing is lost.</p>
          <div class="wb-actions"><button type="button" class="btn btn--ghost btn--small" id="wbv-save">${icon("plus")}Save this version now</button></div>
          <ol class="wbv">${list.map((v, i) => `<li><strong>${esc(v.label)}</strong> <span class="muted small">${v.at ? new Date(v.at).toLocaleString() : ""}</span>
            <button type="button" class="linkish" data-cmp="${i}">Compare with now</button><button type="button" class="linkish" data-restore="${i}">Restore</button></li>`).join("")}</ol><div id="wbv-out" aria-live="polite"></div>`,
        onOpen(dlg) {
          dlg.querySelector("#wbv-save").onclick = () => { state.versions.push({ at: Date.now(), label: "Saved by me", html: ta.html.value, css: ta.css.value }); save(); dlg.close(); api.say("Saved a version.", "good"); };
          dlg.querySelectorAll("[data-cmp]").forEach((b) => b.addEventListener("click", () => { const v = list[Number(b.dataset.cmp)]; dlg.querySelector("#wbv-out").innerHTML = `<h3>${esc(v.label)} → now</h3>${WS.diffHtml(WS.diff(v.html, ta.html.value), "index.html changes")}${WS.diffHtml(WS.diff(v.css, ta.css.value), "styles.css changes")}`; }));
          dlg.querySelectorAll("[data-restore]").forEach((b) => b.addEventListener("click", () => {
            if (b.dataset.sure !== "1") { b.dataset.sure = "1"; b.textContent = "Yes, restore it"; return; }
            const v = list[Number(b.dataset.restore)];
            state.versions.push({ at: Date.now(), label: "Before restoring", html: ta.html.value, css: ta.css.value });
            setFiles({ html: v.html, css: v.css }); save(); dlg.close();
            api.say(`Restored: ${v.label}. Your page before that is saved in Versions.`, "info");
          }));
        } });
    }

    /* ───────── The lesson in the left panel, and Activity 7's questions ───────── */
    function lesson() {
      const brief = document.querySelector(".lab-brief"), L = A.lesson;
      if (!brief) return;
      const steps = [{ t: "What we're building", b: `<p>${esc(L.building)}</p>` }, { t: "Why it matters", b: `<p>${esc(L.why)}</p>` },
        ...L.learn.map((c) => ({ t: `Learn: ${c.h}`, b: c.say.map((s) => `<p>${esc(s)}</p>`).join("") })),
        { t: "See a working example", b: `<p>See example code beside the website it makes.</p><button type="button" class="btn btn--ghost btn--small" data-wl="example">${icon("eye")}Show an Example</button>` },
        { t: "Do it", b: `<p>${esc(A.goal)}</p>` }, { t: "Check", b: `<p>Press Check my work. It looks at your real code, and any way that works passes.</p><button type="button" class="btn btn--primary btn--small" data-wl="check">${icon("check")}Check my work</button>` },
        { t: "Common mistakes", b: `<ul>${L.mistakes.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` }, { t: "What you'll learn", b: `<p>${esc(A.learned)}</p>` }];
      let at = 0;
      const box = document.createElement("section");
      box.className = "wl";
      const old = brief.querySelector(".lab-steps");
      if (old) old.replaceWith(box); else brief.appendChild(box);
      const draw = (f) => {
        box.innerHTML = `<p class="wl__top"><span class="eyebrow">Lesson</span><span class="wl__n">${at + 1} of ${steps.length}</span></p><h3 id="wbl-h" tabindex="-1">${esc(steps[at].t)}</h3><div class="wl__body">${steps[at].b}</div>
          <div class="wl__nav">${at ? `<button type="button" class="btn btn--ghost btn--small" data-wl="back">${icon("arrowLeft")}Back</button>` : ""}${at < steps.length - 1 ? `<button type="button" class="btn btn--primary btn--small" data-wl="next">Next${icon("arrowRight")}</button>` : ""}</div>`;
        if (f) box.querySelector("#wbl-h").focus();
      };
      box.addEventListener("click", (e) => {
        const b = e.target.closest("[data-wl]"); if (!b) return;
        ({ next: () => { at++; draw(true); }, back: () => { at--; draw(true); }, example: () => $("#wb-example").click(), check: () => check() })[b.dataset.wl]();
      });
      draw(false);
    }
    if (idx === 6) {
      const r = state.reflect;
      $("#wb-results").innerHTML = `<section class="wbr" aria-labelledby="wbr-h"><h3 id="wbr-h">The Human Touch</h3><p class="muted small">Your answers stay on this device.</p>
        ${[["right", "Did the builder understand your idea? What did it get right?"], ["wrong", "What did it get wrong, or leave out?"], ["changed", "What will you change, and why will it help a real visitor?"]].map(([k, q]) => `<label class="wp-field">${esc(q)}<textarea class="input" data-reflect="${k}" rows="2" maxlength="400">${esc(r[k] || "")}</textarea></label>`).join("")}</section>`;
      $("#wb-results").addEventListener("input", (e) => { const t = e.target.closest("[data-reflect]"); if (t) { state.reflect[t.dataset.reflect] = t.value; save(); } });
    }

    /* ───────── Events ───────── */
    Object.values(ta).forEach((area) => {
      area.addEventListener("input", () => { persist(); clearTimeout(timer); timer = setTimeout(render, 300); });
      ["click", "keyup"].forEach((ev) => area.addEventListener(ev, coach));
    });
    el.querySelectorAll("[role=tab]").forEach((t) => t.addEventListener("click", () => { showTab(t.id.replace("wb-tab-", "")); ta[tab].focus(); }));
    $(".ws-tabs").addEventListener("keydown", (e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { showTab(tab === "html" ? "css" : "html"); $(`#wb-tab-${tab}`).focus(); } });
    $("#wb-tidy").addEventListener("click", () => { if (!ed[tab].tidy()) api.say("Your code is already tidy.", "info"); });
    $("#wb-check").addEventListener("click", check);
    $("#wb-desk").addEventListener("click", () => { phone = false; $("#wb-framebox").classList.remove("is-phone"); $("#wb-desk").setAttribute("aria-pressed", "true"); $("#wb-phone").setAttribute("aria-pressed", "false"); });
    $("#wb-phone").addEventListener("click", () => { phone = true; state.viewedPhone = true; save(); $("#wb-framebox").classList.add("is-phone"); $("#wb-phone").setAttribute("aria-pressed", "true"); $("#wb-desk").setAttribute("aria-pressed", "false"); });
    $("#wb-tags").addEventListener("click", () => WS.tagExplorer({}));
    $("#wb-example").addEventListener("click", () => {
      const e = SE.websiteLessons.EXAMPLES[[1, 2, 4, 6, 3, 6, 7, 7][idx]];
      WS.showExample({ title: `Show an Example: ${A.concept}`, html: e.html, css: e.css, notes: e.notes, snippet: e.snippet, snippetLang: e.snippetLang,
        onInsert(text, lang) { const area = ta[lang] || ta.html; showTab(lang === "css" ? "css" : "html"); const before = area.value.slice(0, area.selectionStart); typeAt(area, (before && !before.endsWith("\n") ? "\n" : "") + text + "\n"); } });
    });
    if (!debug) { $("#wb-change").addEventListener("click", () => makeChange("")); $("#wb-versions").addEventListener("click", versions); }
    lesson();
    render();
    let open = null;
    try { open = sessionStorage.getItem("stem207.wb.open"); sessionStorage.removeItem("stem207.wb.open"); } catch (e) { /* private mode */ }
    if (open === "change" && !debug) setTimeout(() => makeChange(""), 50);
    if (open === "explore") api.say("Tap any part of your page in the preview: its code is selected, and the CSS rules that style it are listed.", "info");
    if (debug) api.say("This is a practice copy with three bugs. Press Check my work to start investigating.", "info");
    return () => { clearTimeout(timer); };
  }

  SE.labs.goals(ACTIVITIES, GOALS);
  SE.labs.register({
    id: LAB, area: "coding", title: "STEM 207 Website Builder",
    tagline: "Describe a website in your own words, watch the builder write it in real HTML and CSS, then make the code yours.",
    briefFirst: true, compactTools: true, levels: ACTIVITIES,
    chapters: [{ title: "Learn by changing it", short: "Learn", from: 0, to: 4, blurb: "Read and change the code the builder wrote: HTML, CSS, layout, and something new." }, { title: "Make it yours", short: "Yours", from: 5, to: 7, blurb: "Debug, add the human touch, and finish your website." }],
    landing: (el, api) => SE.wbInterview.mount(el, api, storeFor(api.user)),
    mount
  });
  SE.wb = { ACTIVITIES, injectBugs, cssSemicolons };
})();
