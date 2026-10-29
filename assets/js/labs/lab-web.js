/*
 * Web Builder Lab — Coding & Computer Science, Web development (planning/CODING_PLAN.md)
 * Type real HTML and CSS and see the page live. Eight levels in three chapters:
 *   Structure (1–4): headline, paragraph and list, a link people can trust, a picture with alt text
 *   Style (5–6):     CSS colors, then colors everyone can read (contrast 4.5 to 1)
 *   Ship (7–8):      fix a broken page, then build a page for a made-up Maine business
 * Safety: the preview is a sandboxed iframe with no scripts, no forms, and no navigation. A
 * Content-Security-Policy blocks every outside request, so only the lab's own pictures load. Links
 * are shown, never followed. Student code isn't logged.
 * Pure rules for tests: SE.webBuilder.check(level, summary), .contrast(a, b), .summarize(doc).
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;

  /* The lab's own pictures, drawn as SVG so they work offline and need no outside request. */
  const svg = (body) => "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">${body}</svg>`);
  const PICTURES = {
    "lighthouse.svg": svg(`<rect width="160" height="120" fill="#cde8f2"/><rect y="92" width="160" height="28" fill="#03968f"/><polygon points="68,92 92,92 86,34 74,34" fill="#f7f6f0" stroke="#012d2b" stroke-width="2"/><rect x="74" y="50" width="12" height="8" fill="#c0392b"/><rect x="74" y="70" width="12" height="8" fill="#c0392b"/><rect x="72" y="22" width="16" height="12" fill="#f4d35e" stroke="#012d2b" stroke-width="2"/><polygon points="70,22 90,22 80,12" fill="#012d2b"/><polygon points="88,26 150,10 150,40" fill="#f4d35e" opacity=".5"/>`),
    "lobster-boat.svg": svg(`<rect width="160" height="120" fill="#cde8f2"/><rect y="80" width="160" height="40" fill="#03968f"/><polygon points="20,74 140,74 128,94 32,94" fill="#f7f6f0" stroke="#012d2b" stroke-width="2"/><rect x="40" y="52" width="34" height="22" fill="#f7f6f0" stroke="#012d2b" stroke-width="2"/><rect x="46" y="58" width="10" height="8" fill="#cde8f2"/><rect x="100" y="64" width="18" height="10" fill="#c0392b"/><line x1="58" y1="52" x2="58" y2="36" stroke="#012d2b" stroke-width="3"/>`),
  };
  const CSP = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'">`;
  const GENERIC_LINK = /^(click here|here|link|this|click|more|read more)$/i;
  const GENERIC_ALT = /^(image|picture|photo|pic|img|graphic|lighthouse\.svg|lobster-boat\.svg)$/i;

  /* Colors and contrast (WCAG relative luminance). */
  function rgb(c) {
    const m = String(c || "").match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function lum({ r, g, b }) {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }
  function contrast(a, b) {
    const x = rgb(a), y = rgb(b);
    if (!x || !y) return 21;
    const [hi, lo] = [lum(x), lum(y)].sort((m, n) => n - m);
    return Math.round(((hi + 0.05) / (lo + 0.05)) * 10) / 10;
  }
  const isWhite = (c) => { const x = rgb(c); return !x || x.a === 0 || (x.r === 255 && x.g === 255 && x.b === 255); };
  const isBlack = (c) => { const x = rgb(c); return !!x && x.r === 0 && x.g === 0 && x.b === 0; };

  /* What the page has, read from the rendered document (so CSS is what the browser really applied). */
  function summarize(doc) {
    const win = doc.defaultView;
    const cs = (el) => win.getComputedStyle(el);
    const h1 = doc.querySelector("h1");
    const bgOf = () => {
      for (const el of [doc.body, doc.documentElement]) { const c = el && rgb(cs(el).backgroundColor); if (c && c.a > 0) return cs(el).backgroundColor; }
      return "rgb(255, 255, 255)";   // nothing set: the browser shows white
    };
    const textEl = doc.querySelector("p") || doc.body;
    return {
      h1: h1 ? h1.textContent.trim() : null,
      p: doc.querySelectorAll("p").length,
      lists: doc.querySelectorAll("ul, ol").length,
      li: doc.querySelectorAll("ul > li, ol > li").length,
      links: [...doc.querySelectorAll("a")].map((a) => ({ href: a.getAttribute("href") || "", text: a.textContent.trim() })),
      imgs: [...doc.querySelectorAll("img")].map((i) => ({ src: i.getAttribute("data-name") || i.getAttribute("data-src") || i.getAttribute("src") || "", alt: i.hasAttribute("alt") ? i.getAttribute("alt").trim() : null })),
      h1Color: h1 ? cs(h1).color : null,
      bg: bgOf(),
      text: textEl ? cs(textEl).color : "rgb(0, 0, 0)",
    };
  }

  /* One rule per need. Each failure names what the student wrote, never the answer. */
  const RULES = {
    h1: (s) => s.h1 === null ? "Add a headline: <h1>, then your words, then </h1>."
      : !s.h1 ? "Your <h1> is empty. Type words between <h1> and </h1>." : null,
    p: (s) => s.p < 1 ? "Add a paragraph: <p>, then a sentence, then </p>." : null,
    list3: (s) => s.lists < 1 ? "Add a list: put <li> items inside <ul> and </ul>."
      : s.li < 3 ? `Your list has ${s.li} item${s.li === 1 ? "" : "s"}. A list needs 3 <li> items inside the <ul>.` : null,
    link: (s) => {
      if (!s.links.length) return "Add a link: <a href=\"https://...\">words that say where it goes</a>.";
      for (const a of s.links) {
        if (!/^https:\/\/[^\s.]+\.[^\s]+/.test(a.href)) return `Your link goes to "${a.href || "nowhere"}". Web addresses start with https:// and have a dot, like https://example.org.`;
        if (!a.text) return "Your link has no words. Put words between <a ...> and </a>.";
        if (GENERIC_LINK.test(a.text)) return `"${a.text}" doesn't say where the link goes. People using screen readers often hear only link words. Use words that name the place.`;
      }
      return null;
    },
    img: (s) => {
      if (!s.imgs.length) return "Add a picture: <img src=\"lighthouse.svg\" alt=\"...\">.";
      for (const i of s.imgs) {
        if (!PICTURES[i.src]) return `"${i.src || "(no src)"}" isn't one of the lab's pictures. Use lighthouse.svg or lobster-boat.svg.`;
        if (i.alt === null || !i.alt) return `Your picture ${i.src} has no alt text. Add alt="..." that says what's in the picture, for people who can't see it.`;
        if (GENERIC_ALT.test(i.alt) || i.alt.length < 8) return `Alt text "${i.alt}" doesn't say what's in the picture. Describe it in a few words.`;
      }
      return null;
    },
    styled: (s) => s.h1Color && isBlack(s.h1Color) ? "Your headline is still black. Add CSS inside <style>: h1 { color: teal; }"
      : isWhite(s.bg) ? "Your page background is still white. Add CSS: body { background: lightyellow; }" : null,
    contrast: (s) => {
      const r = contrast(s.text, s.bg);
      return r < 4.5 ? `Your text and background have a contrast of ${r} to 1. Readable text needs at least 4.5 to 1. Make the text darker or the background lighter (or the other way around).` : null;
    },
  };
  const ratioLine = (s) => `Contrast: ${contrast(s.text, s.bg)} to 1`;

  const PAGE = (body, style = "") => `${style ? `<style>\n${style}\n</style>\n` : ""}${body}`;
  const LEVELS = [
    { title: "Your first headline", concept: "HTML tags", need: ["h1"], start: "<h1></h1>\n",
      goal: "Every web page starts with tags. Type a headline for a page about your town between <h1> and </h1>.",
      hints: ["Tags come in pairs: <h1> opens the headline and </h1> closes it.", "Type your words between the two tags, like <h1>Welcome to Bar Harbor</h1>."],
      learned: "HTML tags tell the browser what each part of a page is. <h1> means the main headline." },
    { title: "Paragraph and list", concept: "HTML structure", need: ["h1", "p", "list3"], start: "<h1>Harbor News</h1>\n\n",
      goal: "Add a paragraph that says what the page is about, then a list of three things to see.",
      hints: ["A paragraph is <p>…</p>. A list is <ul> with <li> items inside.", "<ul>\n  <li>Lighthouse</li>\n  …\n</ul> Each item gets its own <li>."],
      learned: "Structure tags (headline, paragraph, list) help browsers, search engines, and screen readers understand a page." },
    { title: "A link people can trust", concept: "Links", need: ["link"], start: "<h1>Plan a visit</h1>\n<p>Learn more about Maine lighthouses: <a href=\"www.lighthouses.example\">click here</a></p>\n",
      goal: "This link has two problems. Fix the address and the link words, so everyone knows where it goes.",
      hints: ["Check how the address starts. Web addresses start with https://.", "Screen-reader users often hear only the link words. \"click here\" doesn't say where it goes."],
      learned: "Good links have a full https:// address and words that name where they go. That helps everyone, especially people using screen readers." },
    { title: "Pictures for everyone", concept: "Accessibility", need: ["img"], start: "<h1>Our lighthouse</h1>\n<img src=\"lighthouse.svg\">\n",
      goal: "Add alt text to the picture: a few words that say what's in it, for people who can't see it.",
      hints: ["Alt text goes inside the img tag: <img src=\"lighthouse.svg\" alt=\"...\">.", "Say what you see, like what the building looks like and where it is. \"image\" isn't enough."],
      learned: "Alt text is read aloud by screen readers. Web developers add it to every picture so everyone gets the information." },
    { title: "Style it", concept: "CSS", need: ["styled"], start: PAGE("<h1>Harbor Days</h1>\n<p>Boats, music, and chowder by the water.</p>", "\n"),
      goal: "CSS changes how a page looks. Inside <style>, change the headline color and the page background.",
      hints: ["A CSS rule names a tag, then sets properties in curly braces: h1 { color: navy; }", "For the background: body { background: lightyellow; } Try color names or codes like #fdf6e3."],
      learned: "HTML says what things are; CSS says how they look. Keeping them separate lets designers restyle a whole site at once." },
    { title: "Colors everyone can read", concept: "Contrast", need: ["contrast"], start: PAGE("<h1>Fog Report</h1>\n<p>Thick fog this morning. Clearing by noon.</p>", "body { background: #8fb3c4; color: #a9c4cf; }"),
      goal: "This page is hard to read: the text and background are too alike. Change the colors until the contrast is at least 4.5 to 1.",
      hints: ["Watch the contrast number under the preview as you change colors.", "Dark text on a light background (or light on dark) gives high contrast. Try color: #012d2b."],
      learned: "Contrast is how different text and background are. Web developers check it so people with low vision, or on a sunny screen, can read the page." },
    { title: "Fix the broken page", concept: "Debugging", need: ["h1", "link", "img", "contrast"],
      start: PAGE("<h1></h1>\n<p>The Pine Cove ferry runs every hour.</p>\n<img src=\"lobster-boat.svg\" alt=\"image\">\n<p>Times: <a href=\"ferry-times\">here</a></p>", "body { background: #ffffff; color: #c8c8c8; }"),
      goal: "A web developer handed you a page with four bugs. Find them all and fix them. Press Check to find the next one.",
      hints: ["Check the headline, the picture, the link, and the colors.", "Read each message from Check. It names the bug it found."],
      learned: "Testing a page against a checklist (headline, alt text, links, contrast) is how web teams catch problems before people do." },
    { title: "Ship a page", concept: "Make", need: ["h1", "p", "list3", "link", "img", "styled", "contrast"], start: PAGE("<h1></h1>\n", "\n"),
      goal: "Build a page for a made-up Maine business (a bakery, a boat tour, a bait shop…): headline, paragraph, a list, a link, a picture with alt text, and your own colors that pass contrast.",
      hints: ["Copy pieces from earlier levels, then change the words.", "Press Check often. It tells you the next thing the page needs."],
      learned: "You built a real web page: structure, style, and access for everyone. That's the everyday work of a web developer." },
  ];
  SE.labs.goals(LEVELS, LEVELS.map((L) => ({
    "HTML tags": ["Write HTML tags that open and close.", "Every page on the web is built from HTML."],
    "HTML structure": ["Use paragraphs and lists to give a page structure.", "Structure helps people, search engines, and screen readers find their way around a page."],
    "Links": ["Write a link with a full address and clear link words.", "Clear links help everyone, and they're a big part of an accessible web."],
    "Accessibility": ["Write alt text that describes a picture.", "About 1 in 4 adults has a disability. Accessible pages work for everyone."],
    "CSS": ["Write CSS rules that change colors.", "CSS controls how every website looks, from your school's page to your favorite game's."],
    "Contrast": ["Choose text and background colors with enough contrast.", "Readable colors are an accessibility rule web developers check on every page."],
    "Debugging": ["Find and fix bugs in a page by testing it against a checklist.", "Web teams test every page before it goes live."],
    "Make": ["Build a complete, accessible page of your own.", "This is how web developers work: plan, build, test, and ship."],
  })[L.concept]));

  function check(idx, s) {
    for (const n of LEVELS[idx].need) { const why = RULES[n](s); if (why) return { ok: false, reason: why, rule: n }; }
    return { ok: true };
  }

  /* Build the preview document: the CSP first, then the student's code with the lab's pictures swapped in.
     Belt and braces: anything that could fetch from outside is also defused before the browser sees it
     (other src values, srcset, background and poster attributes, CSS url() and @import, embedding tags). */
  const pic = (src, q = '"') => PICTURES[src] ? `src=${q}${PICTURES[src]}${q} data-name=${q}${src}${q}` : `data-src=${q}${src}${q}`;
  function srcdoc(code) {
    const safe = String(code)
      .replace(/<\/?(meta|base|link|iframe|frame|object|embed|video|audio|source|track|script|portal)\b[^>]*>/gi, "")
      .replace(/\b(srcset|background|poster|data|action|formaction)\s*=/gi, "data-off-$1=")
      .replace(/\bsrc\s*=\s*(["'])([^"']*)\1/gi, (m, q, src) => pic(src, q))
      .replace(/\bsrc\s*=\s*([^\s>"']+)/gi, (m, src) => pic(src))
      .replace(/url\s*\(/gi, "url-off(")
      .replace(/@import/gi, "@import-off");
    return `<!doctype html><html lang="en"><head>${CSP}<meta charset="utf-8"></head><body>${safe}</body></html>`;
  }

  function mount(el, idx, api) {
    const L = LEVELS[idx];
    const KEY = `stem207.web.${idx}`;
    let code = L.start;
    try { code = localStorage.getItem(KEY) || L.start; } catch (e) { /* storage off */ }
    el.innerHTML = `
      <div class="wb">
        <div class="wb-edit">
          <label class="py-h" for="wb-code">Your code (HTML and CSS)</label>
          <textarea id="wb-code" class="py-editor wb-code" rows="12" spellcheck="false" autocapitalize="off" autocomplete="off">${esc(code)}</textarea>
          <p class="wb-pics">Pictures you can use: <code>lighthouse.svg</code> and <code>lobster-boat.svg</code></p>
          <div class="wb-actions">
            <button type="button" class="btn btn--launch" id="wb-check">${icon("check")}Check my page</button>
            <button type="button" class="btn btn--ghost btn--small" id="wb-reset">Start over</button>
          </div>
        </div>
        <div class="wb-view">
          <p class="py-h" id="wb-prev-h">Preview</p>
          <iframe id="wb-frame" class="wb-frame" title="Preview of your page" sandbox="allow-same-origin" aria-describedby="wb-prev-h"></iframe>
          <p class="wb-stats" id="wb-stats" aria-live="polite"></p>
        </div>
      </div>`;
    const ta = el.querySelector("#wb-code"), frame = el.querySelector("#wb-frame"), stats = el.querySelector("#wb-stats");
    let timer = null, ready = null;
    function render() {
      ready = new Promise((res) => { frame.onload = () => {
        const d = frame.contentDocument;
        if (d) d.addEventListener("click", (e) => {
          const a = e.target.closest && e.target.closest("a");
          if (a) { e.preventDefault(); api.say(`Links don't open in the preview. This one would go to: ${a.getAttribute("href") || "nowhere"}`, "info"); }
        });
        try { const s = summarize(d); stats.textContent = ratioLine(s); } catch (e) { stats.textContent = ""; }
        res();
      }; });
      frame.srcdoc = srcdoc(ta.value);
    }
    ta.addEventListener("input", () => {
      try { localStorage.setItem(KEY, ta.value); } catch (e) { /* storage off */ }
      clearTimeout(timer); timer = setTimeout(render, 250);
    });
    el.querySelector("#wb-reset").addEventListener("click", () => {
      ta.value = L.start; try { localStorage.removeItem(KEY); } catch (e) { /* storage off */ }
      render(); ta.focus();
    });
    el.querySelector("#wb-check").addEventListener("click", async () => {
      clearTimeout(timer); render(); await ready;
      const s = summarize(frame.contentDocument);
      api.log("lab_test_run", { rule: (check(idx, s).rule || "ok") });   // never the student's code
      const res = check(idx, s);
      if (res.ok) api.win({ checks: L.need.length });
      else api.say(res.reason, "warn");
    });
    render();
    return () => clearTimeout(timer);
  }

  SE.labs.register({
    id: "web-builder",
    area: "coding",
    title: "Web Builder Lab",
    tagline: "Write real HTML and CSS, see your page live, and make it work for everyone. Nothing leaves the lab.",
    levels: LEVELS,
    chapters: [
      { title: "Structure", short: "Structure", from: 0, to: 3, blurb: "Headlines, paragraphs, lists, links, and pictures: the parts of every page." },
      { title: "Style", short: "Style", from: 4, to: 5, blurb: "CSS changes how a page looks. Make it yours, and make it readable." },
      { title: "Ship", short: "Ship", from: 6, to: 7, blurb: "Debug a broken page, then build and ship your own." },
    ],
    mount
  });
  SE.webBuilder = { LEVELS, RULES, PICTURES, check, contrast, summarize, srcdoc };
})();
