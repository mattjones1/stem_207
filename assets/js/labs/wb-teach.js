/*
 * STEM 207 Website Builder — the teaching rules behind the Coding Studio (lab-wb.js). No AI, no network.
 *
 *   SE.wbTeach.realWords(text), realSentence(text)   words with a vowel; a sentence of 5+ words that isn't "asdf asdf…"
 *   SE.wbTeach.predict(idx, files)   the activity's Predict question, made from the student's OWN code:
 *                                    { q, options, answer, explain, find?: { lang, start, end } }
 *   SE.wbTeach.cssSemicolons(css)    CSS lines missing their semicolon (the classic skipped-line bug)
 *   SE.wbTeach.BUGS                  the Debug activity's bug pool: { kind: { label, where } }
 *   SE.wbTeach.injectBugs(files, kinds | seed) → { html, css, kinds }   a practice copy with 3 different bugs
 *   SE.wbTeach.findBugs(doc, html, css) → issues   every bug in the pool, found in the rendered page and the code
 *     (issue: { key, kind, label, where, what, why, how, hint, wk? | html?: {start,end} | css?: {start,end,line} })
 */
(function () {
  "use strict";
  const SE = (window.SE = window.SE || {});
  const WK = () => SE.webKit, WS = () => SE.webStudio, C = () => SE.wbComposer;

  /* ───────── Real words ───────── */
  const realWords = (t) => (String(t || "").match(/[A-Za-z][A-Za-z']*/g) || []).filter((w) => /[aeiouy]/i.test(w) && (w.length >= 2 || /^[ai]$/i.test(w)));
  /* 5+ words, most of them real, and not the same word over and over. */
  function realSentence(t) {
    const all = String(t || "").match(/\S+/g) || [], real = realWords(t);
    return all.length >= 5 && real.length >= all.length * 0.8 && new Set(real.map((w) => w.toLowerCase())).size >= Math.ceil(all.length * 0.6);
  }

  /* ───────── CSS helpers ───────── */
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
  const lineOf = (text, at) => String(text).slice(0, at).split("\n").length;
  /* Where a declaration sits: the first "prop:" inside the rule for sel. */
  function declAt(css, sel, prop) {
    const r = WS().cssRules(css).find((x) => x.selector === sel);
    if (!r) return null;
    const i = css.slice(r.start, r.end).search(new RegExp(`\\n\\s*${prop}\\s*:`));
    if (i < 0) return null;
    const start = r.start + i + 1 + (css.slice(r.start + i + 1).match(/^\s*/) || [""])[0].length, end = css.indexOf("\n", start);
    return { start, end: end < 0 ? css.length : end, line: lineOf(css, start) };
  }

  /* ───────── Predict: one question per activity, about the student's own code ───────── */
  function predict(idx, files) {
    const html = String(files.html || ""), css = String(files.css || "");
    const at = (code, re) => { const m = re.exec(code); return m ? { start: m.index, end: m.index + m[0].length } : null; };
    if (idx === 0) {
      const h = at(html, /<h1>[\s\S]*?<\/h1>/), words = h ? html.slice(h.start + 4, h.end - 5).replace(/\s+/g, " ").trim() : "your title";
      return { q: `Your code has <h1>${words}</h1>. If you change the words between the tags, what changes?`, options: ["The big title on your page", "The name in the browser tab", "Nothing until you save"], answer: 0,
        explain: "The words between <h1> and </h1> are what visitors see, and the preview updates right away. The browser tab name comes from <title>, in the locked lines at the top.", find: h && { lang: "html", ...h } };
    }
    if (idx === 1) return { q: "What happens if you type a sentence between two sections, without any tag around it?", options: ["It shows, but it isn't a paragraph", "It disappears", "The whole page breaks"], answer: 0,
      explain: "Browsers show loose words, but they aren't in a <p>, so they don't get a paragraph's spacing or style. Put your sentence between <p> and </p>." };
    if (idx === 2) {
      const d = declAt(css, ".hero h1", "font-size"), v = d ? css.slice(d.start, d.end).replace(/^font-size:\s*/, "").replace(/;$/, "") : "2.6rem";
      return { q: `In styles.css, the rule .hero h1 says font-size: ${v}. If you make it bigger, what changes?`, options: ["Only the big title", "Every word on the page", "Nothing: CSS can't change size"], answer: 0,
        explain: "The selector .hero h1 picks only the <h1> inside the hero. A rule for body would change every word.", find: d && { lang: "css", start: d.start, end: d.end } };
    }
    if (idx === 3) {
      const d = declAt(css, ".part", "padding"), v = d ? css.slice(d.start, d.end).replace(/^padding:\s*/, "").replace(/;$/, "") : "2rem 1.5rem";
      return { q: `The rule .part says padding: ${v}. What happens if you change it to 4rem?`, options: ["More space inside each part, around its words", "The words get bigger", "The parts change order"], answer: 0,
        explain: "padding is the space inside an element, between its edge and its content. Bigger padding gives each part room to breathe.", find: d && { lang: "css", start: d.start, end: d.end } };
    }
    if (idx === 4) {
      const id = (/<section id="([^"]+)"/.exec(html) || [])[1] || "about";
      return { q: `If you add <a href="#${id}">Jump</a> to your page, what happens when a visitor clicks it?`, options: [`It jumps to the part with id="${id}"`, "It opens a new website", "Nothing: links need https"], answer: 0,
        explain: `#${id} means "the part of this page with id=\"${id}\"". That's how your menu links work.`, find: at(html, new RegExp(`id="${id}"`)) && { lang: "html", ...at(html, new RegExp(`id="${id}"`)) } };
    }
    if (idx === 5) return { q: "A line in styles.css is missing the ; at its end. What does the browser do?", options: ["Skips the line after it", "Shows an error message on the page", "Stops showing the page"], answer: 0,
      explain: "Browsers never show CSS errors. They quietly skip what they can't read, so a style just seems to vanish. That's why debugging means looking closely." };
    if (idx === 6) {
      const pic = (/src="([a-z-]+)\.svg"/.exec(html) || [])[1] || "moose";
      return { q: `The builder put ${pic.replace(/-/g, " ")}.svg on your page. How did it choose?`, options: ["It matched a word you typed to a list of keywords", "It read your idea and understood it", "It picked at random"], answer: 0,
        explain: "The builder follows rules: a word in your answers matched a keyword for that picture. It didn't understand your idea. That's your job." };
    }
    const bg = (/body\s*\{[^}]*?background-color:\s*(#[0-9a-f]{6})/i.exec(css) || [])[1], fg = (/body\s*\{[^}]*?\n\s*color:\s*(#[0-9a-f]{6})/i.exec(css) || [])[1];
    if (bg && fg) {
      const r = Math.round(C().contrast(fg, bg) * 10) / 10, ok = r >= 4.5;
      return { q: `Your words are ${fg} on a ${bg} background: ${r} to 1. Can most people read that easily?`, options: ["Yes: it's 4.5 to 1 or more", "No: it's under 4.5 to 1"], answer: ok ? 0 : 1,
        explain: `Web teams aim for at least 4.5 to 1 between words and their background. ${ok ? "Yours passes." : "Make the words darker or the background lighter."} Check my work measures every part of the page.`, find: declAt(css, "body", "color") && { lang: "css", ...declAt(css, "body", "color") } };
    }
    return { q: "Before you finish: who should test your website?", options: ["A real visitor, like a classmate", "Only me", "Nobody: the builder made it"], answer: 0, explain: "Real web teams test with real people. A partner will find things you can't." };
  }

  /* ───────── Debug: the bug pool ───────── */
  const BUGS = {
    semi: { label: "A CSS line is missing its semicolon", where: "styles.css" },
    brace: { label: "A CSS rule never closes", where: "styles.css" },
    prop: { label: "A CSS line the browser can't read", where: "styles.css" },
    contrast: { label: "Words that are hard to read", where: "styles.css (a color)" },
    link: { label: "A link that goes nowhere", where: "index.html (a link)" },
    alt: { label: "A picture without alt text", where: "index.html (a picture)" },
    src: { label: "A picture that can't be found", where: "index.html (a picture)" },
    unclosed: { label: "A tag that never closes", where: "index.html" },
    heading: { label: "A heading that skips a level", where: "index.html (a heading)" },
    dupid: { label: "Two parts with the same id", where: "index.html" }
  };
  const once = (s, re, f) => { const m = re.exec(s); return m ? s.slice(0, m.index) + f(m) + s.slice(m.index + m[0].length) : null; };
  /* Each bug is one small edit to the copy, or null when the page has nothing it could break. */
  const INJECT = {
    semi: ({ html, css }) => { const x = once(css, /(body\s*\{[^}]*?\n\s*color:\s*[^;\n]+);/, (m) => m[1]) || once(css, /(\n\s*[a-z-]+:\s*[^;\n]+);(\n\s*[a-z-]+:)/, (m) => m[1] + m[2]); return x && { html, css: x }; },
    brace: ({ html, css }) => { const x = once(css, /(\na \{\n[^}]*\n)\}\n/, (m) => m[1]); return x && { html, css: x }; },
    prop: ({ html, css }) => { const x = once(css, /(\.hero \{[^}]*?\n\s*)background-color:/, (m) => `${m[1]}backgound-color:`); return x && { html, css: x }; },
    contrast: ({ html, css }) => { const bg = (/body\s*\{[^}]*?background-color:\s*(#[0-9a-f]{6})/i.exec(css) || [])[1]; if (!bg) return null; const pale = C().contrast(bg, "#000000") > C().contrast(bg, "#ffffff") ? "#c9c9c9" : "#4a4a4a"; const x = once(css, /(body\s*\{[^}]*?\n\s*color:\s*)#[0-9a-f]{6}/i, (m) => m[1] + pale); return x && { html, css: x }; },
    link: ({ html, css }) => { const x = once(html, /href="#[^"]+"/, () => "href=\"#oops\""); return { html: x || html.replace("</main>", "  <p><a href=\"#oops\">Jump to the top</a></p>\n</main>"), css }; },
    alt: ({ html, css }) => { const x = once(html, /(<img [^>]*?)\s+alt="[^"]*"/, (m) => m[1]); return { html: x || html.replace("</main>", "  <img src=\"lighthouse.svg\">\n</main>"), css }; },
    src: ({ html, css }) => { const x = once(html, /src="([a-z-]+)\.svg"/, (m) => `src="${m[1].slice(0, -1)}.svg"`); return x && { html: x, css }; },
    unclosed: ({ html, css }) => { const x = once(html, /(<section id="[^"]+"[^>]*>\s*<h2>[^<]*)<\/h2>/, (m) => m[1]); return x && { html: x, css }; },
    heading: ({ html, css }) => { const all = [...html.matchAll(/<h2>([^<]*)<\/h2>/g)]; const m = all[all.length - 1]; return m && all.length >= 2 ? { html: html.slice(0, m.index) + `<h4>${m[1]}</h4>` + html.slice(m.index + m[0].length), css } : null; },
    dupid: ({ html, css }) => { const id = (/<section id="([^"]+)"/.exec(html) || [])[1]; const x = id && once(html, /<section class="hero/, () => `<section id="${id}" class="hero`); return x && { html: x, css }; }
  };
  const CLASH = [["unclosed", "heading"]];
  /* kinds: a list, or a number (a seed) to pick 3 different bugs that fit this page. */
  function injectBugs(files, kinds) {
    let pick = Array.isArray(kinds) ? kinds.slice() : null;
    if (!pick) {
      let s = (Number(kinds) >>> 0) || 1;
      const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
      const pool = Object.keys(BUGS).sort(() => rnd() - 0.5);
      pick = [];
      for (const k of pool) {
        if (pick.length === 3) break;
        if (CLASH.some((c) => c.includes(k) && c.some((o) => o !== k && pick.includes(o)))) continue;
        if (INJECT[k]({ html: files.html, css: files.css })) pick.push(k);
      }
    }
    let f = { html: files.html, css: files.css };
    const used = [];
    pick.forEach((k) => { const n = INJECT[k] && INJECT[k](f); if (n) { f = n; used.push(k); } });
    return { html: f.html, css: f.css, kinds: used };
  }

  /* Every bug in the pool, found again from scratch, so a student's own new bugs show too. */
  function findBugs(doc, html, css) {
    const out = [], add = (kind, x) => out.push(Object.assign({ kind, label: BUGS[kind].label, where: BUGS[kind].where }, x));
    cssSemicolons(css).forEach((s) => add("semi", { key: `semi:${s.line}`, what: `Line ${s.line} of styles.css doesn't end with a semicolon.`, why: "Without the ;, the browser can't tell where the value ends, so it skips the next line too.", how: "Add ; at the end of the line.", hint: "color: #213547;", css: s }));
    // Braces: a rule that opens while another (not @media) is still open never closed.
    let depth = 0, stack = [], off = 0;
    String(css).split("\n").forEach((l, i) => {
      const t = l.replace(/\/\*.*?\*\//g, "");
      if (/\{/.test(t)) {
        if (depth && !/^@/.test(stack[stack.length - 1] || "") && !out.some((x) => x.kind === "brace")) add("brace", { key: `brace:${i}`, what: `The rule just before line ${i + 1} of styles.css has a { but no }.`, why: "Without its }, the browser thinks the next rule is part of this one, so both stop working.", how: "Add } on its own line at the end of the rule.", hint: "a {\n  color: …;\n}", css: { start: off, end: off + l.length, line: i + 1 } });
        stack.push(t.trim()); depth++;
      }
      if (/\}/.test(t)) { depth = Math.max(0, depth - 1); stack.pop(); }
      off += l.length + 1;
    });
    if (depth && !out.some((x) => x.kind === "brace")) add("brace", { key: "brace:end", what: "A rule near the end of styles.css has a { but no }.", why: "Every rule needs both { and }.", how: "Add } at the end of the last rule.", hint: "}", css: { start: Math.max(0, css.length - 1), end: css.length, line: lineOf(css, css.length) } });
    // Declarations the browser can't read: a mistyped property (or an impossible value).
    const supports = typeof CSS !== "undefined" && CSS.supports ? (p, v) => CSS.supports(p, v) : null;
    if (supports) WS().cssRules(css).forEach((r) => {
      const re = /([a-z-]+)\s*:\s*([^;{}]+)/gi;
      let m;
      while ((m = re.exec(r.body))) {
        // A value that runs into the next line is a missing semicolon, found above, not a misspelling.
        if (m[1].startsWith("--") || /\n\s*[a-z-]+\s*:/i.test(m[2]) || supports(m[1], m[2].replace(/!important/i, "").trim())) continue;
        const start = css.indexOf(m[0], r.start), line = lineOf(css, start);
        add("prop", { key: `prop:${line}`, what: `Line ${line} of styles.css says "${m[1]}: ${m[2].trim()}", and the browser doesn't know that property or value.`, why: "Browsers skip any line they can't read, without an error message.", how: "Check the spelling of the property, letter by letter.", hint: "background-color", css: { start, end: start + m[0].length, line } });
      }
    });
    if (doc) {
      const low = WK().textContrast(doc).filter((t) => t.ratio !== null && t.ratio < 4.5);
      if (low.length) add("contrast", { key: "contrast", what: `"${low[0].text}" is ${low[0].ratio} to 1 on its background.`, why: "Words need at least 4.5 to 1 contrast so everyone can read them, in sun or on a dim screen.", how: "Make the words darker on a light background, or lighter on a dark one.", hint: "color: #1f3324;", wk: low[0].el.getAttribute("data-wk") });
      [...doc.querySelectorAll("img")].forEach((i) => {
        const wk = i.getAttribute("data-wk");
        if (!(i.getAttribute("alt") || "").trim()) add("alt", { key: `alt:${wk}`, what: "This picture has no alt text.", why: "Screen readers read alt text out loud for people who can't see the picture.", how: "Add alt=\"…\" with a few words that describe it.", hint: "alt=\"What the picture shows\"", wk });
        const name = i.getAttribute("data-src");
        if (name) add("src", { key: `src:${wk}`, what: `The picture "${name}" doesn't exist, so nothing shows.`, why: "The browser can only show a picture whose name is spelled exactly right.", how: "Fix the spelling in src=\"…\". The Tag Explorer lists the built-in pictures.", hint: "src=\"moose.svg\"", wk });
      });
      [...doc.querySelectorAll("a[href^='#']")].forEach((a) => { const id = a.getAttribute("href").slice(1); if (id && !doc.getElementById(id)) add("link", { key: `link:${a.getAttribute("data-wk")}`, what: `This link goes to #${id}, but nothing on the page has id="${id}".`, why: "A link that goes nowhere confuses visitors.", how: "Change the href to an id that's on the page, like one of your sections.", hint: "<a href=\"#about\">", wk: a.getAttribute("data-wk") }); });
      const seen = {};
      [...doc.querySelectorAll("[id]")].forEach((e) => { const id = e.id; if (seen[id] && !out.some((x) => x.key === `dupid:${id}`)) add("dupid", { key: `dupid:${id}`, what: `Two parts of the page both have id="${id}". Links to #${id} only find the first one.`, why: "An id is a name for exactly one part of the page.", how: "Remove the id from the part that shouldn't have it, or give it a new name.", hint: "id=\"a-new-name\"", wk: seen[id].getAttribute("data-wk") }); seen[id] = seen[id] || e; });
      let top = 0;
      [...doc.querySelectorAll("h1, h2, h3, h4, h5, h6")].forEach((h) => { const n = Number(h.tagName[1]); if (top && n > top + 1 && !out.some((x) => x.kind === "heading")) add("heading", { key: `heading:${h.getAttribute("data-wk")}`, what: `An <h${n}> comes right after an <h${top}>, skipping <h${top + 1}>.`, why: "Screen-reader users jump between headings like a table of contents. A skipped level looks like something is missing.", how: `Change it to <h${top + 1}> (and its closing tag).`, hint: `<h${top + 1}>…</h${top + 1}>`, wk: h.getAttribute("data-wk") }); top = n; });
    }
    // Tags that never close, found in the code (the browser hides them by guessing).
    const VOID = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i, stack2 = [];
    const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
    let m;
    while ((m = re.exec(html))) {
      if (!m[2] || VOID.test(m[2])) continue;
      const name = m[2].toLowerCase();
      if (!m[1]) { stack2.push({ name, start: m.index, end: m.index + m[0].length }); continue; }
      const k = stack2.map((x) => x.name).lastIndexOf(name);
      if (k < 0) continue;
      stack2.splice(k).slice(1).forEach((x) => { if (!out.some((y) => y.kind === "unclosed")) add("unclosed", { key: `unclosed:${x.start}`, what: `The <${x.name}> on line ${lineOf(html, x.start)} of index.html never closes.`, why: "Without its closing tag, the browser guesses where it ends, and everything after it can become part of it.", how: `Add </${x.name}> where it should end.`, hint: `<${x.name}>…</${x.name}>`, html: { start: x.start, end: x.end } }); });
    }
    stack2.forEach((x) => { if (!out.some((y) => y.kind === "unclosed")) add("unclosed", { key: `unclosed:${x.start}`, what: `The <${x.name}> on line ${lineOf(html, x.start)} of index.html never closes.`, why: "Without its closing tag, the browser guesses where it ends.", how: `Add </${x.name}> where it should end.`, hint: `<${x.name}>…</${x.name}>`, html: { start: x.start, end: x.end } }); });
    return out;
  }

  SE.wbTeach = { realWords, realSentence, predict, cssSemicolons, BUGS, injectBugs, findBugs, declAt };
})();
