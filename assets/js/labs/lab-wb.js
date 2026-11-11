/*
 * STEM 207 Website Builder (lab id "website-builder"): describe a website in everyday words, watch the rule-based
 * builder write it (wb-composer.js, wb-interview.js), then learn HTML and CSS by changing it in the Coding Studio.
 * No AI, no network: everything here is rules and the student's own work, on this device.
 *
 * The 8 levels are 8 activities. Each one checks the student's OWN edits, by comparing the code with a snapshot
 * taken when the activity opened (Make a Change updates that snapshot, so the builder's changes never count).
 * Storage: localStorage stem207.wb.<studentId> (sessionStorage stem207.wb.preview for educators):
 *   { answers, q, v1, files: { html, css }, title, versions: [{ at, label, html, css }], base: { [idx]: files },
 *     debug: { html, css, kinds }, bugLog: { [kind]: { saw, guess, fixed } }, reflect: { right, wrong, changed },
 *     predict: { [idx]: choice }, applies: { [idx]: n }, peer: { t0, t1, t2, change }, viewedPhone }
 * The teaching rules (Predict, real sentences, the Debug bug pool) are in wb-teach.js.
 * Pure rules for tests: SE.wb.injectBugs(files, kinds | seed), SE.wb.cssSemicolons(css), SE.wb.ACTIVITIES.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;
  const WK = SE.webKit, WS = SE.webStudio, T = SE.wbTeach;
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
    { title: "Design the Layout", concept: "Spacing and layout", goal: "Change the spacing (margin, padding, or gap), or move a section. Then write a CSS comment that says what you changed and why.",
      steps: ["Find padding or gap in styles.css and change it.", "Or move a whole <section> in index.html: cut it, and paste it in a new place inside <main>.", "Above your change in styles.css, write a comment like /* More space so it's easier to read */."],
      hints: ["padding is space inside an element; margin is space outside it.", "gap is the space between items in a grid or flex layout.", "Move a section from its <section> line to its </section> line, all together.", "A CSS comment starts with /* and ends with */. The browser ignores it; people read it."],
      learned: "Spacing makes a page easy to read, and layout decides where each part goes.",
      lesson: { building: "A page that breathes: the right space, in the right order.", why: "Crowded pages are hard to read. Good spacing guides visitors' eyes.",
        learn: [{ h: "Padding and margin", say: ["padding: space inside the edge. margin: space outside the edge."] }, { h: "Flex and grid", say: ["display: grid makes columns. repeat(auto-fit, minmax(12rem, 1fr)) fits as many as there's room for, so it works on a phone too."] },
          { h: "Comments", say: ["Developers leave notes in code for the next person (often themselves). In CSS a note goes between /* and */."] }],
        mistakes: ["Moving only part of a section: move from <section> to </section>.", "Huge padding on a phone."] } },
    { title: "Add Something New", concept: "Lists, links, and images", goal: "Add something that wasn't in Version 1: a list, a card, a picture with alt text, a link, or a new section.",
      steps: ["Choose what to add.", "Use Show an Example or the Tag Explorer for the tags.", "Check that pictures have alt text and links go somewhere."],
      hints: ["A list: <ul>, then <li> items, then </ul>.", "A picture: <img src=\"rocket.svg\" alt=\"…\">. Built-in pictures only.", "A link that jumps: <a href=\"#about\">See the About section</a>."],
      learned: "You extended your website beyond what the builder made, with real HTML of your own.",
      lesson: { building: "Something the builder didn't make.", why: "The builder only knows a few rules. You can add anything HTML can do.",
        learn: [{ h: "Lists, links, and pictures", say: ["<ul> and <li> make a list. <a href=\"#id\"> jumps to part of the page. <img src alt> shows a picture with a description."] }],
        mistakes: ["A picture without alt text.", "A link to an id that doesn't exist."] } },
    { title: "Debug Like a Developer", concept: "Debugging", goal: "This practice copy of your website has three bugs. Find them, fix them, and write in your bug log how you fixed one.",
      steps: ["Look at the preview: what looks wrong?", "Press Check my work to see what kinds of bugs there are. Use Where is it? before Find it.", "Fix one at a time, and check again.", "Fill in your bug log for at least one bug."],
      hints: ["Read the preview top to bottom like a visitor. Does anything look wrong or missing?", "Each bug has a Where is it? button. Try to find the line yourself before you press Find it.", "Fix the first bug, then press Check my work again."],
      learned: "Debugging is investigating: test, find the first problem, fix it, and test again.",
      lesson: { building: "A practice copy of your website with three bugs in it. Your real website doesn't change.", why: "Every developer writes bugs. Finding them calmly is a superpower.",
        learn: [{ h: "CSS bugs", say: ["A missing semicolon or } makes the browser skip lines, so a style seems to vanish. A misspelled property is skipped too, with no error message."] }, { h: "HTML bugs", say: ["A link to a missing id goes nowhere. A picture needs alt text and a name spelled exactly right. A tag that never closes swallows what comes after it."] }],
        mistakes: ["Changing many things at once: fix one, check again.", "Deleting the line instead of fixing it."] } },
    { title: "The Human Touch", concept: "People and programs", goal: "Think about what the builder got right and wrong, then make one improvement of your own.",
      steps: ["Answer the three questions.", "Make one change that makes your website better for a real visitor.", "Press Check my work."],
      hints: ["Read your page like a visitor who knows nothing about your topic.", "Did the builder use your words? What did it guess?", "A better sentence, a clearer link, or a missing fact all count."],
      learned: "A program follows rules. People bring judgment, care, and ideas. Keep the humanity in technology.",
      lesson: { building: "A better website, because a person thought about it.", why: "The builder followed rules: it can't know what your visitors need. You can.",
        learn: [{ h: "Programs follow rules", say: ["The builder matched keywords and filled in templates. It didn't understand your idea. That's why it left placeholders."] }],
        mistakes: ["Calling it done because the builder made it."] } },
    { title: "My Website, My Creation", concept: "Testing and finishing", goal: "Test your website with a partner, fix anything that needs it, and finish it.",
      steps: ["Ask a partner to try the three tasks, and tap how each one went.", "Write one change you'll make because of them, and make it.", "Look at it in Phone, press Check my work, and fix anything it finds."],
      hints: ["Every picture needs alt text.", "Every link should go somewhere on the page.", "Words need 4.5 to 1 contrast on their background.", "Placeholders like \"Write your About words here\" need your own words before you finish."],
      learned: "You described a website, read the code a program wrote, and made it your own: changing, extending, debugging, and testing it.",
      lesson: { building: "Your finished website.", why: "Real web teams test every page: on a phone, for accessibility, and by reading it like a visitor.",
        learn: [{ h: "Test like a visitor", say: ["Read it top to bottom. Try every link. Look at it on a phone. Check the colors are easy to read."] }],
        mistakes: ["Skipping the Phone preview."] } }
  ];
  // Common mistakes are the last hints, so the lesson stays short: Learn, Predict, Do.
  ACTIVITIES.forEach((a) => { a.hints = a.hints.concat(a.lesson.mistakes.map((m) => `Common mistake: ${m}`)); });
  const GOALS = ACTIVITIES.map((a) => [a.goal, a.lesson.why]);

  /* ───────── Pure rules ───────── */
  const cssSemicolons = T.cssSemicolons, injectBugs = T.injectBugs;
  const parse = (h) => new DOMParser().parseFromString(`<!doctype html><body>${h}</body>`, "text/html");
  const texts = (doc, sel) => [...doc.querySelectorAll(sel)].map((e) => e.textContent.replace(/\s+/g, " ").trim());
  const decls = (css, re) => new Set((String(css).match(/[a-z-]+\s*:\s*[^;{}]+/gi) || []).map((d) => d.replace(/\s+/g, " ").trim().toLowerCase()).filter((d) => re.test(d)));
  const count = (doc, sel) => doc.querySelectorAll(sel).length;
  /* The rules in b with a declaration (matching re) that its rule in a didn't have, and whether any of them styles
     something on the page, so a change only counts when you could see it. */
  function changedRules(a, b, re) {
    const was = {};
    WS.cssRules(a).forEach((r) => { was[r.selector] = (was[r.selector] || "") + ";" + r.body; });
    return WS.cssRules(b).filter((r) => { const old = decls(was[r.selector] || "", re); return [...decls(r.body, re)].some((d) => !old.has(d)); });
  }
  const shows = (doc, rules) => rules.some((r) => r.selector.split(",").some((s) => { try { return !!doc.querySelector(s.trim()); } catch (e) { return false; } }));
  const comments = (css) => new Set((String(css).match(/\/\*[\s\S]*?\*\//g) || []).map((c) => c.replace(/\s+/g, " ").trim()));
  const headWords = (doc) => new Set(texts(doc, "h1, h2, h3").flatMap((t) => T.realWords(t).map((w) => w.toLowerCase())));
  /* Text the builder leaves for the student to replace. */
  const PLACEHOLDER = /^(Write (your|one sentence|about)|Your (first|second) fun fact goes here|My (first|second|third) favorite|(First|Second|Third) highlight|Describe what your made-up business does)/i;

  /* ───────── The studio ───────── */
  function mount(el, idx, api) {
    const store = storeFor(api.user), state = store.load();
    const A = ACTIVITIES[idx];
    if (!state.v1) {   // no website yet: the interview runs right here, full width (the activity's brief comes later)
      const lb = el.closest(".lab-body");
      if (lb) lb.classList.add("wb-nobrief");
      el.innerHTML = `<div id="wb-start"></div>`;
      SE.wbInterview.mount(el.querySelector("#wb-start"), api, store);
      return () => {};
    }
    const body = el.closest(".lab-body");
    if (body) body.classList.add("lab-body--wide");
    const debug = idx === 5;
    // Debug: a practice copy with 3 different bugs from the pool, picked fresh for each copy.
    state.base = state.base || {};
    if (debug && !(state.debug && state.debug.kinds)) { state.debug = injectBugs(state.files, Date.now()); state.bugLog = {}; delete state.base[5]; }
    const files = debug ? state.debug : state.files;
    if (!state.base[idx]) state.base[idx] = { html: files.html, css: files.css };
    state.versions = state.versions || [];
    state.reflect = state.reflect || {};
    state.predict = state.predict || {};
    state.applies = state.applies || {};
    state.bugLog = state.bugLog || {};
    state.peer = state.peer || {};
    store.save(state);
    const save = () => store.save(state);
    let tab = "html", phone = false, map = [], timer = null, ready = Promise.resolve(), checked = false;
    const title = state.title || "My Website";
    // The Human Touch and the partner test lead the right column, so their questions are on the first screen.
    const reflect = idx === 6, peer = idx === 7, lead = reflect || peer;
    const actions = `<div class="ws-actions"><button type="button" class="btn btn--launch" id="wb-check">${icon("check")}Check my work</button></div><div class="ws-feedback-slot"></div>`;
    const R = state.reflect;
    const reflectHtml = !reflect ? "" : `<section class="wbr" id="wb-reflect" aria-labelledby="wbr-h"><h3 id="wbr-h">The Human Touch</h3><p class="muted small">Your answers stay on this device.</p>
        ${[["right", "Did the builder understand your idea? What did it get right?"], ["wrong", "What did it get wrong, or leave out?"], ["changed", "What will you change, and why will it help a real visitor?"]].map(([k, q]) => `<label class="wp-field">${esc(q)}<textarea class="input" data-reflect="${k}" rows="2" maxlength="400">${esc(R[k] || "")}</textarea></label>`).join("")}</section>`;
    const TASKS = ["Use the menu to jump to a part of the page.", "Find one sentence you like, and read it out loud.", "Press Phone. Is everything still easy to read?"];
    const HOW = [["easy", "check", "Easy"], ["hard", "alert", "Hard"], ["lost", "question", "I got lost"]];
    const peerHtml = !peer ? "" : `<section class="wbp" id="wb-peer" aria-labelledby="wbp-h"><h3 id="wbp-h">Test it with a partner</h3>
        <p class="muted small">Ask a classmate (or your teacher) to try each task on your page, then tap how it went.</p>
        <ol class="wbp__tasks">${TASKS.map((t, i) => `<li><span>${esc(t)}</span><span class="wbp__how" role="group" aria-label="How did task ${i + 1} go?">${HOW.map(([v, ic, w]) => `<button type="button" class="wbp__b" data-peer="t${i}" data-v="${v}" aria-pressed="${state.peer[`t${i}`] === v}">${icon(ic)}${w}</button>`).join("")}</span></li>`).join("")}</ol>
        <label class="wp-field">One change I'll make because of my partner<input class="input" data-peer-change maxlength="160" value="${esc(state.peer.change || "")}"></label></section>`;

    el.innerHTML = `
      <div class="wbs" id="wbs">
        <div class="wbs__bar">
          <p class="wbs__name">${debug ? `${icon("alert")}<span>A <strong>practice copy</strong> of your website, with three bugs. Your real website doesn't change.</span>` : `<span>My website: <strong>${esc(title)}</strong></span>`}</p>
          <div class="ws__toggles" role="group" aria-label="Studio tools">
            <button type="button" class="btn btn--ghost btn--small" id="wb-example">${icon("eye")}Show an Example</button>
            ${debug ? "" : `<button type="button" class="btn btn--ghost btn--small" id="wb-change">${icon("palette")}Make a Change</button>`}
            <span class="wbs__more"><button type="button" class="btn btn--ghost btn--small" id="wb-more" aria-expanded="false" aria-controls="wb-more-menu">${icon("list")}More tools</button>
              <span class="wbs__menu" id="wb-more-menu" hidden>
                <button type="button" class="linkish" id="wb-tags">${icon("code")}Tag Explorer</button>
                ${debug ? `<button type="button" class="linkish" id="wb-newcopy">${icon("refresh")}New practice copy (new bugs)</button>` : `<button type="button" class="linkish" id="wb-versions">${icon("refresh")}Versions</button>`}
              </span></span>
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
            ${lead ? reflectHtml + peerHtml + actions : ""}
            <div class="ws-viewbar"><span class="ws-viewbar__h" id="wb-prev-h">Live preview</span>
              <div class="ws-size" role="group" aria-label="Preview size"><button type="button" class="btn btn--ghost btn--small" id="wb-desk" aria-pressed="true">Desktop</button><button type="button" class="btn btn--ghost btn--small" id="wb-phone" aria-pressed="false">Phone</button></div></div>
            <div class="ws-framebox" id="wb-framebox"><iframe id="wb-frame" class="ws-frame" title="Preview of your website" sandbox="allow-same-origin" aria-describedby="wb-prev-h"></iframe></div>
            ${lead ? "" : actions}
            <p class="wbs__blank" id="wb-blank" role="status"></p>
            <section class="ws-checks" id="wb-results" aria-label="Check my work results"></section>
            ${debug ? `<section class="wbl" id="wb-buglog" aria-labelledby="wbg-h"></section>` : ""}
            <div class="wbs__rules" id="wb-rules" aria-live="polite"><p class="field-help">Tap any part of your page: its HTML is selected, and the CSS rules that style it show here.</p></div>
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
      // In Debug, these hints would name a bug before the student has looked: they wait for the first Check my work.
      const hints = !debug || checked;
      out.textContent = !d || !d.body || !d.body.textContent.trim() ? "Your page looks blank because there are no words inside <body> yet, or they're inside a tag that was never closed."
        : !hints ? ""
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
      clearTimeout(timer); checked = true; persist(); render(); await ready;
      const d = $("#wb-frame").contentDocument, base = state.base[idx], b = parse(base.html), now = parse(ta.html.value), css = ta.css.value;
      const items = [], issues = [];
      const item = (ok, label, msg) => items.push({ ok, label, msg });
      const H = "h1, h2, h3", same = (x, y) => x.length === y.length && x.every((v, i) => v === y[i]);
      // A heading counts when it has a real word of your own that no heading had before, and no heading was deleted.
      const oldWords = headWords(b), newHeading = texts(now, H).some((t) => !texts(b, H).includes(t) && T.realWords(t).some((w) => !oldWords.has(w.toLowerCase())));
      const headingMsg = count(now, H) < count(b, H) ? "A heading's tags went missing. Undo (Ctrl+Z), and change only the words between the tags." : "Change a heading's words to your own, like <h1>Moose of Maine</h1>.";
      if (idx === 0) item(newHeading && count(now, H) >= count(b, H), "A heading has new words of your own", headingMsg);
      if (idx === 1) {
        item(newHeading && count(now, H) >= count(b, H), "A heading has new words of your own", headingMsg);
        item(texts(now, "p, li").some((t) => !texts(b, "p, li").includes(t) && T.realWords(t).length), "A paragraph's words changed", "Change a paragraph, or fill in a placeholder.");
        item(texts(now, "p, li, h2, h3").some((t) => !texts(b, "p, li, h2, h3").includes(t) && T.realSentence(t)), "A new sentence of your own (5 or more real words)", "Write a real sentence about your topic in a <p>, like \"Moose can run 35 miles an hour.\"");
      }
      if (idx === 2) {
        const col = changedRules(base.css, css, /^(color|background|background-color)\s*:/), typ = changedRules(base.css, css, /^(font-family|font-size|font-weight|line-height|letter-spacing|text-transform)\s*:/);
        const low = WK.textContrast(d).filter((t) => t.ratio !== null && t.ratio < 4.5);
        item(col.length && shows(d, col), "A color changed", col.length ? "That rule doesn't style anything on your page. Try a color in body or .hero." : "Change a color, like background-color or color, in styles.css.");
        item(!col.length || !low.length, "Your colors are easy to read (4.5 to 1)", low.length ? `"${low[0].text}" is ${low[0].ratio} to 1 on its background. Make the words darker or the background lighter.` : "");
        item(typ.length && shows(d, typ), "A typography property changed", typ.length ? "That rule doesn't style anything on your page." : "Change a font-size, font-family, or font-weight.");
      }
      if (idx === 3) {
        item(changedRules(base.css, css, /^(margin|padding|gap)(-[a-z]+)?\s*:/).length > 0 || !same([...now.querySelectorAll("main > section")].map((s) => s.id || s.className), [...b.querySelectorAll("main > section")].map((s) => s.id || s.className)), "Spacing changed, or a section moved", "Change margin, padding, or gap, or move a <section>.");
        const was = comments(base.css);
        item([...comments(css)].some((c) => !was.has(c) && T.realWords(c).length >= 3), "A CSS comment that explains your change", "Write a comment of 3 or more words, like /* More space so it's easier to read */.");
      }
      if (idx === 4) {
        const sel = ["ul", "ol", "li", "img", "a", "section", "article", "figure", "h2", "h3", "table"];
        item(sel.some((t) => count(now, t) > count(b, t)), "Something new: a list, a picture, a link, a card, or a section", "Add an element that wasn't there before.");
      }
      if (idx === 5) issues.push(...T.findBugs(d, ta.html.value, css));
      // Pictures, links, and lists: always part of good work (activities 5, 7, and 8).
      if (idx >= 4 && idx !== 5) {
        T.findBugs(d, ta.html.value, css).filter((x) => x.kind === "alt" || x.kind === "link" || x.kind === "src").forEach((x) => issues.push(x));
        [...d.querySelectorAll("a")].forEach((a) => { if (!T.realWords(a.textContent).length) issues.push({ key: `words:${a.getAttribute("data-wk")}`, label: "A link with no words", what: "Visitors can't see or click a link with no words.", why: "Link words say where the link goes, for everyone, and screen readers read them out loud.", how: "Put a few words between <a …> and </a>.", hint: "<a href=\"#about\">About us</a>", wk: a.getAttribute("data-wk") }); });
        [...d.querySelectorAll("ul, ol")].forEach((l) => { if (l.querySelectorAll("li").length < 2) issues.push({ key: `list:${l.getAttribute("data-wk")}`, label: "A list with fewer than 2 items", what: "This list has fewer than 2 items.", why: "A list groups several things. One item is just a sentence.", how: "Add another <li> item, or make it a <p>.", hint: "<li>Another thing</li>", wk: l.getAttribute("data-wk") }); });
      }
      if (idx === 5) {
        const log = state.bugLog, full = (k) => log[k] && ["saw", "guess", "fixed"].every((f) => T.realWords(log[k][f]).length >= 2);
        item((state.debug.kinds || []).some(full), "Your bug log: what you saw, your guess, and what fixed it (for one bug or more)", "Fill in all three boxes for at least one bug in the bug log.");
      }
      if (idx === 6) {
        const r = state.reflect, enough = (t) => T.realWords(t).length >= 3;
        item(enough(r.right) && enough(r.wrong) && enough(r.changed), "You answered the three questions", "Write a few real words for each question.");
        item(ta.html.value !== base.html || css !== base.css, "You made an improvement of your own", "Make one change that helps a real visitor.");
      }
      if (idx === 7) {
        [...d.querySelectorAll("p, li, h2, h3, figcaption")].forEach((e) => { if (PLACEHOLDER.test(e.textContent.trim())) issues.push({ key: `ph:${e.getAttribute("data-wk")}`, label: "A placeholder is still on your page", what: `"${e.textContent.trim().slice(0, 50)}" is the builder's placeholder, not your words.`, why: "Visitors came for your ideas. A placeholder tells them the page isn't finished.", how: "Replace it with your own words, or delete it.", hint: "<p>Moose can swim up to 6 miles an hour.</p>", wk: e.getAttribute("data-wk") }); });
        const p = state.peer;
        item(["t0", "t1", "t2"].every((k) => p[k]) && T.realWords(p.change).length >= 4, "A partner tested your page, and you wrote one change you'll make", "Ask a partner to try the three tasks, tap how each went, and write one change (4 or more words).");
        item(d.querySelectorAll("h1").length === 1, "One main heading", "A page has exactly one <h1>.");
        const low = WK.textContrast(d).filter((t) => t.ratio !== null && t.ratio < 4.5);
        item(!low.length, "Readable colors (4.5 to 1)", low.length ? `"${low[0].text}" is ${low[0].ratio} to 1. Make the words darker or the background lighter.` : "");
        item(!!state.viewedPhone, "You looked at it in Phone", "Press Phone above the preview.");
        item(ta.html.value !== state.v1.html || css !== state.v1.css, "It has your own changes, not just Version 1", "Make it yours.");
      }
      lastIssues = issues;
      const all = items.every((x) => x.ok) && !issues.length;
      const list = debug ? bugList(issues) : WS.issueList(issues);
      $("#wb-results").innerHTML = `${issues.length ? `<p class="ws-checks__h">${issues.length === 1 ? "1 thing needs a fix" : `${issues.length} things need a fix`}:</p>${list}` : ""}
        ${items.length ? `<ul class="ws-checklist">${items.map((x) => `<li class="ws-check ws-check--${x.ok ? "good" : "fix"}">${icon(x.ok ? "check" : "alert")}<span><strong>${esc(x.label)}.</strong> ${x.ok ? "" : esc(x.msg)}</span></li>`).join("")}</ul>` : ""}`;
      api.log("lab_test_run", { activity: idx, ok: all, issues: issues.length });
      if (!all) { api.say(issues.length ? (debug ? `${issues.length} to fix. Use Where is it? first, then Find it.` : `${issues.length} to fix. Each one has its own Find it.`) : "Not yet: see the checklist.", "warn"); return; }
      win();
    }
    /* Debug's list: the kind of bug first, then Where is it?, and only then Find it (a hint ladder, not the answer). */
    function bugList(issues) {
      return `<ol class="wsi">${issues.map((x, n) => `<li class="wsi__i" data-key="${esc(x.key)}">
          <p class="wsi__h">${icon("bug")}<strong>${n + 1}. ${esc(x.label)}</strong></p>
          <p class="wbd__where" hidden><span class="wsi__k">Where:</span> ${esc(x.where)}. Look there first, then use Find it if you need it.</p>
          <p class="wbd__how" hidden><span class="wsi__k">Why it matters:</span> ${esc(x.why)}</p>
          <p class="wbd__what" hidden><span class="wsi__k">What's wrong:</span> ${esc(x.what)} <span class="wsi__k">How to fix it:</span> ${esc(x.how)}</p>
          <div class="wsi__btns"><button type="button" class="btn btn--ghost btn--small" data-where="${esc(x.key)}">${icon("search")}Where is it?</button>
            <button type="button" class="btn btn--ghost btn--small" data-issue="${esc(x.key)}" hidden>${icon("search")}Find it</button></div></li>`).join("")}</ol>`;
    }
    let lastIssues = [];
    function win() {
      const done = new Set(SE.labs.progressFor(api.user, LAB)); done.add(idx);
      let extra = "";
      if (idx === 5) extra = `<p class="ws-cheer">${icon("check")}All three bugs fixed, and you logged how. That was a practice copy: your real website is waiting in the next activity. Want more practice? More tools has a new practice copy with different bugs.</p>`;
      if (idx === 7) {
        const info = { award: "Website Developer", course: "STEM 207 Website Builder", detail: `Built and made my own: ${title}`, name: api.user && api.user.role === "student" ? api.user.displayName : "", className: api.user && api.user.cls ? api.user.cls.name : "", at: Date.now() };
        extra = `<section class="wb-done" aria-labelledby="wb-done-h"><h3 id="wb-done-h">${icon("rocket")}My Website, My Creation</h3>
          <p>You described a website, read the code a program wrote, and made it your own. The builder followed rules; you and your partner did the thinking. <strong>Keep the humanity in technology.</strong></p>
          <iframe class="ws-done__frame" title="Your finished website" sandbox srcdoc="${esc(WK.srcdoc(ta.html.value, { css: ta.css.value, title }))}"></iframe>
          <div class="ws-done__actions">${SE.certificate ? SE.certificate.button(info, "Print my certificate") : ""}</div>
          <p class="muted small">Your website stays on this device. It isn't published on the internet.</p>
          <p><strong>What's next:</strong> <a href="#/activity/lab-web-builder">${icon("arrowRight")}Web Builder Lab</a>: write a page from a blank file, with no builder at all.</p></section>`;
      }
      if (idx === 1 || idx === 6) extra = `<p class="ws-cheer">${icon("users")}Check with a person: read your new words to a partner. Do they make sense to someone who doesn't know your topic?</p>`;
      api.say(idx === 7 ? "You finished your website!" : `${ACTIVITIES[idx].title}: done!`, "good");
      api.win({ activity: idx, achievements: done.size >= 8 ? 3 : [0, 1, 2].every((i) => done.has(i)) ? 2 : 1 }, { extra });
    }
    $("#wb-results").addEventListener("click", (e) => {
      const wh = e.target.closest("[data-where]");
      if (wh) {
        const li = wh.closest(".wsi__i");
        li.querySelector(".wbd__where").hidden = false; li.querySelector(".wbd__how").hidden = false;
        wh.hidden = true;
        const f = li.querySelector("[data-issue]"); f.hidden = false; f.focus();
        api.log("lab_hint", { activity: idx, step: "where" });
        return;
      }
      const iss = e.target.closest("[data-issue]");
      if (iss) {
        const x = lastIssues.find((i) => i.key === iss.dataset.issue);
        if (!x) return;
        const what = iss.closest(".wsi__i").querySelector(".wbd__what");
        if (what) what.hidden = false;   // Debug's last rung: the exact problem, with the line
        if (x.css) { showTab("css"); ed.css.goTo(x.css.start, x.css.end); api.say(`${x.label}: line ${x.css.line} of styles.css. ${x.how}`, "info"); return; }
        if (x.html) { showTab("html"); ed.html.goTo(x.html.start, x.html.end); api.say(`${x.label}: line ${ed.html.lineOf(x.html.start)} of index.html. ${x.how}`, "info"); return; }
        const m = map.find((y) => String(y.i) === String(x.wk));
        if (m) { showTab("html"); ed.html.goTo(m.start, m.end); api.say(`${x.label}: line ${ed.html.lineOf(m.start)} of index.html. ${x.how}`, "info"); }
        return;
      }
      const hb = e.target.closest("[data-hint]");
      if (hb) { const h = hb.closest(".wsi__i").querySelector(".wsi__hint"); h.hidden = !h.hidden; hb.textContent = h.hidden ? "Show me a hint" : "Hide the hint"; }
    });
    /* The bug log: one row per bug in this copy, kept on this device. */
    function drawBugLog() {
      const box = $("#wb-buglog");
      if (!box) return;
      const F = [["saw", "What I saw"], ["guess", "My guess"], ["fixed", "What fixed it"]];
      box.innerHTML = `<h3 id="wbg-h">${icon("bug")}My bug log</h3><p class="muted small">Developers write down what they found, so the next bug is faster. Fill in at least one bug.</p>
        ${(state.debug.kinds || []).map((k, n) => `<fieldset class="wbl__bug"><legend>Bug ${n + 1}</legend>${F.map(([f, w]) => `<label class="wbl__f">${w}<input class="input" data-log="${k}" data-f="${f}" maxlength="120" value="${esc((state.bugLog[k] || {})[f] || "")}"></label>`).join("")}</fieldset>`).join("")}`;
    }

    /* ───────── Make a Change (rules, not AI): Before → After, the diff, Teach Me first, and 3 Applies an activity ───────── */
    const APPLIES = 3;
    function makeChange(prefill) {
      SE.modal.open({ title: "Make a Change", wide: true, body: `<p>Describe a change in your own words. The builder knows a list of changes (it isn't AI), and it shows you exactly what it would change before anything happens.</p>
          <form class="wbc__ask" id="wbc-form"><label class="visually-hidden" for="wbc-q">Describe a change</label><input class="input" id="wbc-q" maxlength="120" placeholder="Make the title stand out" value="${esc(prefill || "")}"><button type="submit" class="btn btn--primary">${icon("search")}Show me</button></form>
          <div class="wb-chips">${["Make the title stand out", "Make the background light blue", "Add more space", "Make it look better on a phone", "Add a section about my favorite part"].map((x) => `<button type="button" class="wb-chip" data-try="${esc(x)}">${esc(x)}</button>`).join("")}</div>
          <div id="wbc-out" aria-live="polite"></div>`,
        onOpen(dlg) {
          const out = dlg.querySelector("#wbc-out");
          const go = (q) => {
            const cur = { html: ta.html.value, css: ta.css.value }, p = SE.wbChanges.propose(q, cur);
            api.log("lab_change", { ok: p.ok, id: p.id || "" });
            if (!p.ok) { out.innerHTML = `<p class="wbc__no">${esc(p.why)}</p>${p.suggest && p.suggest.length ? `<p class="muted small">Changes it knows: ${p.suggest.map(esc).join(" · ")}</p>` : ""}`; return; }
            const dH = WS.diff(cur.html, p.html), dC = WS.diff(cur.css, p.css), used = state.applies[idx] || 0, left = APPLIES - used;
            out.innerHTML = `<p><strong>Here's what the builder will try:</strong> ${esc(p.says)}</p>
              <div class="wbc__ba"><figure><figcaption>Before</figcaption>${WS.miniFrame(cur.html, cur.css, "Before the change", "wbc__f")}</figure><figure><figcaption>After</figcaption>${WS.miniFrame(p.html, p.css, "After the change", "wbc__f")}</figure></div>
              <h3>What changed in the code?</h3><p>${esc(p.why)}</p>
              ${dH.some((x) => x.op !== " ") ? `<p class="muted small">index.html</p>${WS.diffHtml(dH, "Changes in index.html")}` : ""}${dC.some((x) => x.op !== " ") ? `<p class="muted small">styles.css</p>${WS.diffHtml(dC, "Changes in styles.css")}` : ""}
              <div class="wb-actions"><button type="button" class="btn btn--primary" id="wbc-teach">${icon("bulb")}Teach Me to Make This Change</button><button type="button" class="btn btn--ghost" id="wbc-apply" ${left > 0 ? "" : "disabled"}>${icon("check")}Apply it for me</button><button type="button" class="btn btn--ghost" id="wbc-cancel">Cancel</button></div>
              <p class="muted small">${left > 0 ? `Teach Me shows you how to type it yourself. That's how you learn it, and it counts as your work. The builder can apply ${left === 1 ? "1 more change" : `${left} more changes`} in this activity.` : `You've used the builder's ${APPLIES} changes in this activity. Teach Me shows you how to make this one yourself.`}</p>`;
            out.querySelector("#wbc-cancel").onclick = () => dlg.close();
            out.querySelector("#wbc-apply").onclick = () => {
              if ((state.applies[idx] || 0) >= APPLIES) return;
              state.applies[idx] = (state.applies[idx] || 0) + 1;
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
    /* Teach Me: the change as steps the student types, with Find it and a check that it worked; then Your turn, the same
       kind of change somewhere else with no steps, so the scaffold fades. */
    function teach(steps, what) {
      if (!steps.length) return;
      $("#wb-results").innerHTML = `<section class="wbt" aria-labelledby="wbt-h"><h3 id="wbt-h" tabindex="-1">${icon("bulb")}Teach me: ${esc(what)}</h3>
        <ol>${steps.map((s, i) => `<li><p>${esc(s.say)}</p>${s.from.length ? `<p class="muted small">Change:</p><pre class="wl__code">${esc(s.from.join("\n"))}</pre><p class="muted small">to:</p>` : ""}<pre class="wl__code">${esc(s.to.join("\n"))}</pre><button type="button" class="linkish" data-step="${i}">${icon("search")}Find it</button></li>`).join("")}</ol>
        <div class="wb-actions"><button type="button" class="btn btn--primary btn--small" id="wbt-check">${icon("check")}Did I do it?</button></div><p id="wbt-say" role="status"></p><div id="wbt-turn"></div></section>`;
      $("#wbt-h").focus();
      $("#wb-results").querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => {
        const s = steps[Number(b.dataset.step)], area = ta[s.lang], lines = area.value.split("\n");
        const at = lines.slice(0, Math.max(0, s.line - 1)).reduce((n, l) => n + l.length + 1, 0);
        showTab(s.lang); ed[s.lang].showInsertPoint(Math.min(at, area.value.length), s.from.length ? "Change this line" : "Add the new lines here");
      }));
      // What the change was about: its CSS properties, or its HTML tags.
      const props = [...new Set(steps.filter((s) => s.lang === "css").flatMap((s) => s.to.map((l) => (/^\s*([a-z-]+)\s*:/.exec(l) || [])[1]).filter(Boolean)))];
      const tags = [...new Set(steps.filter((s) => s.lang === "html").flatMap((s) => s.to.map((l) => (/<([a-z][a-z0-9]*)/.exec(l) || [])[1]).filter(Boolean)))];
      $("#wbt-check").addEventListener("click", () => {
        const norm = (t) => t.replace(/\s+/g, " ").trim();
        const ok = steps.every((s) => s.to.filter((l) => l.trim()).every((l) => norm(ta[s.lang].value).includes(norm(l))));
        $("#wbt-say").textContent = ok ? "Yes! You made the change yourself, in real code." : "Not yet: compare your code with each step. Find it shows where.";
        if (!ok || $("#wbt-yours") || (!props.length && !tags.length)) return;
        const mine = { html: ta.html.value, css: ta.css.value };
        $("#wbt-turn").innerHTML = `<div class="wbt__turn"><h4 id="wbt-yours">Your turn</h4><p>Now make the same kind of change somewhere else, with no steps: ${props.length ? `change <code>${esc(props.join(", "))}</code> in a different rule, or give it a new value` : `add another <code>&lt;${esc(tags[0])}&gt;</code> of your own`}.</p>
          <button type="button" class="btn btn--ghost btn--small" id="wbt-mine">${icon("check")}Check my turn</button><p id="wbt-mine-say" role="status"></p></div>`;
        $("#wbt-mine").addEventListener("click", () => {
          const done = props.length ? changedRules(mine.css, ta.css.value, new RegExp(`^(${props.join("|")})\\s*:`)).length > 0 : tags.some((t) => count(parse(ta.html.value), t) > count(parse(mine.html), t));
          $("#wbt-mine-say").textContent = done ? "You did it on your own. That's how a trick becomes yours." : "Not yet: make the same kind of change in a new spot.";
          api.log("lab_teach_turn", { activity: idx, ok: done });
        });
      });
    }

    /* ───────── Versions: a small picture of each, Compare, and Restore that asks first ───────── */
    function versions() {
      const list = [{ label: "Version 1 (from the builder)", html: state.v1.html, css: state.v1.css, at: state.v1.at }].concat(state.versions.slice().reverse());
      SE.modal.open({ title: "Versions", wide: true, body: `<p>Every time you apply a change, the page before it is saved here. You can also save one yourself. Restoring saves your current page first, so nothing is lost.</p>
          <div class="wb-actions"><button type="button" class="btn btn--ghost btn--small" id="wbv-save">${icon("plus")}Save this version now</button></div>
          <ol class="wbv">${list.map((v, i) => `<li class="wbv__i">${WS.miniFrame(v.html, v.css, v.label, "wbv__f")}<span class="wbv__t"><strong>${esc(v.label)}</strong> <span class="muted small">${v.at ? new Date(v.at).toLocaleString() : ""}</span>
            <span class="wbv__btns"><button type="button" class="linkish" data-cmp="${i}">Compare with now</button><button type="button" class="linkish" data-restore="${i}">Restore</button></span></span></li>`).join("")}</ol><div id="wbv-out" aria-live="polite"></div>`,
        onOpen(dlg) {
          const out = dlg.querySelector("#wbv-out");
          dlg.querySelector("#wbv-save").onclick = () => { state.versions.push({ at: Date.now(), label: "Saved by me", html: ta.html.value, css: ta.css.value }); save(); dlg.close(); api.say("Saved a version.", "good"); };
          dlg.querySelectorAll("[data-cmp]").forEach((b) => b.addEventListener("click", () => { const v = list[Number(b.dataset.cmp)]; out.innerHTML = `<h3>${esc(v.label)} → now</h3>${WS.diffHtml(WS.diff(v.html, ta.html.value), "index.html changes")}${WS.diffHtml(WS.diff(v.css, ta.css.value), "styles.css changes")}`; }));
          dlg.querySelectorAll("[data-restore]").forEach((b) => b.addEventListener("click", () => {
            const v = list[Number(b.dataset.restore)];
            out.innerHTML = `<div class="wbv__ask"><p><strong>Restore "${esc(v.label)}"?</strong> Your page right now is saved in Versions first, so nothing is lost.</p>
              <div class="wb-actions"><button type="button" class="btn btn--primary btn--small" id="wbv-yes">${icon("refresh")}Restore it</button><button type="button" class="btn btn--ghost btn--small" id="wbv-no">Keep my page</button></div></div>`;
            out.querySelector("#wbv-no").onclick = () => { out.innerHTML = ""; b.focus(); };
            out.querySelector("#wbv-yes").onclick = () => {
              state.versions.push({ at: Date.now(), label: "Before restoring", html: ta.html.value, css: ta.css.value });
              setFiles({ html: v.html, css: v.css }); save(); dlg.close();
              api.say(`Restored: ${v.label}. Your page before that is saved in Versions.`, "info");
            };
            out.querySelector("#wbv-yes").focus();
          }));
        } });
    }

    /* ───────── The lesson in the left panel: Learn, Predict (about the student's own code), Do ───────── */
    function lesson() {
      const brief = document.querySelector(".lab-brief"), L = A.lesson, P = T.predict(idx, files);
      if (!brief) return;
      const steps = [
        { t: "Learn", b: `<p>${esc(L.why)}</p>${L.learn.map((c) => `<h4>${esc(c.h)}</h4>${c.say.map((s) => `<p>${esc(s)}</p>`).join("")}`).join("")}<button type="button" class="btn btn--ghost btn--small" data-wl="example">${icon("eye")}Show an Example</button>` },
        { t: "Predict", b: `<p>${esc(P.q)}</p><div class="wl__opts" role="group" aria-label="Your prediction">${P.options.map((o, i) => `<button type="button" class="btn btn--ghost btn--small" data-pick="${i}" aria-pressed="${state.predict[idx] === i}">${esc(o)}</button>`).join("")}</div><p class="wl__why" id="wl-why" role="status"></p>` },
        { t: "Do it", b: `<p>${esc(A.goal)}</p><p class="muted small">Check my work looks at your real code, and any way that works passes.</p><button type="button" class="btn btn--primary btn--small" data-wl="check">${icon("check")}Check my work</button>` }];
      let at = 0;
      const box = document.createElement("section");
      box.className = "wl";
      const old = brief.querySelector(".lab-steps");
      if (old) old.replaceWith(box); else brief.appendChild(box);
      const why = () => {
        const pick = state.predict[idx], w = box.querySelector("#wl-why");
        if (!w || pick == null) return;
        w.innerHTML = `<strong>${pick === P.answer ? "You predicted it." : "Good guess, but not quite."}</strong> ${esc(P.explain)} ${P.find ? `<button type="button" class="linkish" data-wl="find">${icon("search")}Show me in my code</button>` : ""} Now try it and watch the preview.`;
      };
      const draw = (f) => {
        box.innerHTML = `<p class="wl__top"><span class="eyebrow">Lesson</span><span class="wl__n">${at + 1} of ${steps.length}</span></p><h3 id="wbl-h" tabindex="-1">${esc(steps[at].t)}</h3><div class="wl__body">${steps[at].b}</div>
          <div class="wl__nav">${at ? `<button type="button" class="btn btn--ghost btn--small" data-wl="back">${icon("arrowLeft")}Back</button>` : ""}${at < steps.length - 1 ? `<button type="button" class="btn btn--primary btn--small" data-wl="next">Next${icon("arrowRight")}</button>` : ""}</div>`;
        if (steps[at].t === "Predict") why();
        if (f) box.querySelector("#wbl-h").focus();
      };
      box.addEventListener("click", (e) => {
        const pk = e.target.closest("[data-pick]");
        if (pk) {
          state.predict[idx] = Number(pk.dataset.pick); save();
          box.querySelectorAll("[data-pick]").forEach((x) => x.setAttribute("aria-pressed", String(x === pk)));
          api.log("lab_predict", { activity: idx, right: state.predict[idx] === P.answer });
          why(); return;
        }
        const b = e.target.closest("[data-wl]"); if (!b) return;
        ({ next: () => { at++; draw(true); }, back: () => { at--; draw(true); }, example: () => $("#wb-example").click(), check: () => check(),
          find: () => { showTab(P.find.lang); ed[P.find.lang].goTo(P.find.start, P.find.end); } })[b.dataset.wl]();
      });
      draw(false);
    }
    if (reflect) $("#wb-reflect").addEventListener("input", (e) => { const t = e.target.closest("[data-reflect]"); if (t) { state.reflect[t.dataset.reflect] = t.value; save(); } });
    if (peer) {
      $("#wb-peer").addEventListener("click", (e) => {
        const b = e.target.closest("[data-peer]"); if (!b) return;
        state.peer[b.dataset.peer] = b.dataset.v; save();
        $("#wb-peer").querySelectorAll(`[data-peer="${b.dataset.peer}"]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      });
      $("#wb-peer").addEventListener("input", (e) => { if (e.target.matches("[data-peer-change]")) { state.peer.change = e.target.value; save(); } });
    }
    if (debug) {
      drawBugLog();
      $("#wb-buglog").addEventListener("input", (e) => { const t = e.target.closest("[data-log]"); if (!t) return; state.bugLog[t.dataset.log] = Object.assign(state.bugLog[t.dataset.log] || {}, { [t.dataset.f]: t.value }); save(); });
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
    // More tools: a small menu (Esc or a click elsewhere closes it).
    const more = $("#wb-more"), menu = $("#wb-more-menu");
    const closeMenu = (back) => { menu.hidden = true; more.setAttribute("aria-expanded", "false"); if (back) more.focus(); };
    more.addEventListener("click", () => { const open = menu.hidden; menu.hidden = !open; more.setAttribute("aria-expanded", String(open)); if (open) menu.querySelector("button").focus(); });
    menu.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(true); });
    const outside = (e) => { if (!e.target.closest || !e.target.closest(".wbs__more")) closeMenu(false); };
    document.addEventListener("click", outside);
    $("#wb-tags").addEventListener("click", () => { closeMenu(false); WS.tagExplorer({}); });
    $("#wb-example").addEventListener("click", () => {
      const e = SE.websiteLessons.EXAMPLES[[1, 2, 4, 6, 3, 6, 7, 7][idx]];
      WS.showExample({ title: `Show an Example: ${A.concept}`, html: e.html, css: e.css, notes: e.notes, snippet: e.snippet, snippetLang: e.snippetLang,
        onInsert(text, lang) { const area = ta[lang] || ta.html; showTab(lang === "css" ? "css" : "html"); const before = area.value.slice(0, area.selectionStart); typeAt(area, (before && !before.endsWith("\n") ? "\n" : "") + text + "\n"); } });
    });
    if (!debug) { $("#wb-change").addEventListener("click", () => makeChange("")); $("#wb-versions").addEventListener("click", () => { closeMenu(false); versions(); }); }
    if (debug) $("#wb-newcopy").addEventListener("click", () => {
      closeMenu(false);
      const fresh = injectBugs(state.files, Date.now());
      state.debug = fresh; state.bugLog = {}; state.base[5] = { html: fresh.html, css: fresh.css }; checked = false;
      files.html = fresh.html; files.css = fresh.css; files.kinds = fresh.kinds;
      state.debug = files;
      setFiles(fresh); drawBugLog(); $("#wb-results").innerHTML = "";
      api.say("A new practice copy, with three new bugs. Look at the preview, then press Check my work.", "info");
    });
    lesson();
    render();
    let open = null;
    try { open = sessionStorage.getItem("stem207.wb.open"); sessionStorage.removeItem("stem207.wb.open"); } catch (e) { /* private mode */ }
    if (open === "change" && !debug) setTimeout(() => makeChange(""), 50);
    if (open === "explore") api.say("Tap any part of your page in the preview: its code is selected, and the CSS rules that style it are listed.", "info");
    if (debug) api.say("This is a practice copy with three bugs. Look at the preview: what looks wrong? Then press Check my work.", "info");
    return () => { clearTimeout(timer); document.removeEventListener("click", outside); };
  }

  SE.labs.goals(ACTIVITIES, GOALS);
  SE.labs.register({
    id: LAB, area: "coding", title: "STEM 207 Website Builder",
    tagline: "Describe a website in your own words, watch the builder write it in real HTML and CSS, then make the code yours.",
    briefFirst: true, compactTools: true, unit: "activity", levels: ACTIVITIES,
    chapters: [{ title: "Learn by changing it", short: "Learn", from: 0, to: 4, blurb: "Read and change the code the builder wrote: HTML, CSS, layout, and something new." }, { title: "Make it yours", short: "Yours", from: 5, to: 7, blurb: "Debug, add the human touch, and finish your website." }],
    landing: (el, api) => SE.wbInterview.mount(el, api, storeFor(api.user)),
    mount
  });
  SE.wb = { ACTIVITIES, injectBugs, cssSemicolons };
})();
