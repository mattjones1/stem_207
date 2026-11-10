/*
 * STEM 207 Website Builder — Make a Change: a student describes a change in everyday words, and the builder proposes
 * a small, targeted edit to their CURRENT code (never a rewrite). Pure: no AI, no network, no DOM.
 * About 20 curated changes, matched by keywords. Unknown requests get an honest "I don't know that one yet".
 *
 *   SE.wbChanges.propose(request, { html, css }) → { ok: true, id, says, html, css, why }
 *                                                 | { ok: false, why, suggest }
 *   SE.wbChanges.steps(before, after) → Teach Me steps from the change: [{ lang, line, from, to, say }]
 *   SE.wbChanges.LIST: the changes it knows (shown as examples)
 * The lab shows Before → After and the line diff, and the student chooses Apply or Cancel (Apply saves a version first).
 */
(function () {
  "use strict";
  const SE = (window.SE = window.SE || {});
  const C = () => SE.wbComposer;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const cap = (s) => { const t = String(s || "").trim().replace(/[.!?]+$/, ""); return t ? t[0].toUpperCase() + t.slice(1) : ""; };
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "part";

  /* ───────── Small CSS edits ───────── */
  const ruleRe = (sel) => new RegExp(`(^|\\n)(${sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\s*\\{([^}]*)\\}`);
  function getProp(css, sel, prop) { const m = ruleRe(sel).exec(css); if (!m) return null; const d = new RegExp(`(^|\\n)\\s*${prop}\\s*:\\s*([^;]+);`).exec(m[3]); return d ? d[2].trim() : null; }
  /* Set one property in one rule: change its value, or add the line, or add the whole rule at the end. */
  function setProp(css, sel, prop, value) {
    const m = ruleRe(sel).exec(css);
    if (!m) return `${css.replace(/\s*$/, "")}\n\n${sel} {\n  ${prop}: ${value};\n}\n`;
    const body = m[3], dr = new RegExp(`(^|\\n)(\\s*)${prop}\\s*:\\s*[^;]+;`);
    const nb = dr.test(body) ? body.replace(dr, (x, a, sp) => `${a}${sp}${prop}: ${value};`) : `${body.replace(/\s*$/, "")}\n  ${prop}: ${value};\n`;
    const start = m.index + m[1].length;
    return css.slice(0, start) + `${m[2]} {${nb}}` + css.slice(m.index + m[0].length);
  }
  const bodyColors = (css) => ({ bg: getProp(css, "body", "background-color") || "#ffffff", text: getProp(css, "body", "color") || "#1d2426" });
  const shade = (hex, to, t) => (/^#[0-9a-f]{6}$/i.test(hex) ? C().fixContrast(hexMix(hex, to, t), "#808080", 1) : hex);
  function hexMix(a, b, t) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const x = p(a), y = p(b); return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join(""); }
  /* After the page background changes, keep the words and links readable on it (4.5 to 1). */
  function readableOn(css, bg) {
    let x = setProp(css, "body", "color", C().fixContrast(getProp(css, "body", "color") || "#1d2426", bg));
    const link = getProp(x, "a", "color");
    if (link && /^#[0-9a-f]{6}$/i.test(link)) x = setProp(x, "a", "color", C().fixContrast(link, bg));
    return x;
  }
  /* Color words students use, as hex colors. "light blue" and "dark green" are mixed from them. */
  const COLORS = { red: "#d62828", orange: "#f77f00", yellow: "#ffd23f", green: "#2f9e44", blue: "#1c64d1", purple: "#7b2cbf", pink: "#e8457c", brown: "#7f4f24", gray: "#6c757d", grey: "#6c757d", black: "#111111", white: "#ffffff", teal: "#0f8b8d", gold: "#e0a800", navy: "#13213c", maroon: "#800020", turquoise: "#30c5d2", lime: "#a7c957", silver: "#c0c0c0", tan: "#d2b48c", sky: "#8ecae6" };
  const colorRe = new RegExp(`\\b(light |dark )?(${Object.keys(COLORS).join("|")})\\b`, "i");
  const remSize = (v, add, dflt) => { const n = parseFloat(v); return `${Math.round(((isNaN(n) ? dflt : n) + add) * 10) / 10}rem`; };

  /* ───────── Small HTML edits ───────── */
  const beforeMainEnd = (html, block) => (html.includes("</main>") ? html.replace("</main>", `${block}\n</main>`) : `${html.replace(/\s*$/, "")}\n${block}\n`);
  function addNavLink(html, id, words) {
    if (!/<\/nav>/.test(html)) return html;
    return html.replace(/(\n?)(\s*)<\/nav>/, (m, nl, sp) => `\n${sp}  <a href="#${id}">${esc(words)}</a>${nl}${sp}</nav>`);
  }
  const uniqueId = (html, base) => { let id = slug(base); while (new RegExp(`id="${id}"`).test(html)) id += "-2"; return id; };

  /* ───────── The changes it knows ───────── */
  const LIST = [
    { id: "color", match: colorRe, says: "Change a color to the one you named, and keep the words easy to read on it.",
      run: (h, c, r, m) => {
        let col = COLORS[m[2].toLowerCase()];
        if (/light/i.test(m[1] || "")) col = hexMix(col, "#ffffff", 0.55); else if (/dark/i.test(m[1] || "")) col = hexMix(col, "#000000", 0.45);
        // Where it goes: the title area, the words, the menu, or (by default) the page background.
        if (/title|heading|hero|top|banner/i.test(r)) return { css: setProp(setProp(c, ".hero", "background-color", col), ".hero", "color", C().fixContrast(getProp(c, ".hero", "color") || "#ffffff", col)) };
        if (/words|text|letters|writing/i.test(r) && !/background/i.test(r)) { const { bg } = bodyColors(c); return { css: setProp(c, "body", "color", C().fixContrast(col, /^#[0-9a-f]{6}$/i.test(bg) ? bg : "#ffffff")) }; }
        if (/menu|header|nav/i.test(r)) return { css: setProp(setProp(c, ".site-header", "background-color", col), ".site-header", "color", C().fixContrast(getProp(c, ".site-header", "color") || "#1d2426", col)) };
        return { css: readableOn(setProp(c, "body", "background-color", col), col) };
      }, why: "background-color changes what's behind, and color changes the words. If your color was hard to read on its background, the builder made it a little darker or lighter, so it's at least 4.5 to 1." },
    { id: "spacetheme", match: /outer space|space theme|like space|galaxy|galaxies|planets?|stars|starry|cosmic|astronaut/i, says: "Give it an outer-space look: a night-sky background with light words and a glowing title.",
      run: (h, c) => { let x = setProp(c, "body", "background-color", "#0b1020"); x = readableOn(setProp(x, "body", "color", "#e6ecff"), "#0b1020"); x = setProp(setProp(x, ".hero", "background-color", "#1b2350"), ".hero", "color", "#ffffff"); return { css: setProp(x, ".hero h1", "text-shadow", "0 0 12px #5ee7ff") }; }, why: "A very dark blue background looks like the night sky. text-shadow with no offset and a blur makes the title glow." },    { id: "title", match: /(title|heading|h1|name).*(stand out|bigger|pop|bold|larger|huge)|(stand out|bigger|pop).*(title|heading)/i, says: "Make the main title bigger and give it a shadow so it stands out.",
      run: (h, c) => ({ css: setProp(setProp(c, ".hero h1", "font-size", remSize(getProp(c, ".hero h1", "font-size"), 0.8, 2.6)), ".hero h1", "text-shadow", "2px 2px 0 rgba(0, 0, 0, 0.35)") }), why: "font-size makes the <h1> bigger. text-shadow draws a soft copy of the letters behind them." },
    { id: "center", match: /center|centre|middle/i, says: "Center the words in the hero.", run: (h, c) => ({ css: setProp(c, ".hero", "text-align", "center") }), why: "text-align: center lines the words up in the middle." },
    { id: "darker", match: /dark(er)?|night|black/i, says: "Make the page background darker, and the words light so they're still easy to read.",
      run: (h, c) => { const { bg } = bodyColors(c); const nb = hexMix(/^#[0-9a-f]{6}$/i.test(bg) ? bg : "#ffffff", "#000000", 0.82); return { css: readableOn(setProp(setProp(c, "body", "background-color", nb), "body", "color", C().fixContrast("#f2f2f2", nb, 7)), nb) }; }, why: "background-color changes what's behind the words, and color changes the words. The builder kept them at least 4.5 to 1 apart." },
    { id: "lighter", match: /light(er)?|bright(er)?|white/i, says: "Make the page background lighter, and the words dark so they're easy to read.",
      run: (h, c) => { const { bg } = bodyColors(c); const nb = hexMix(/^#[0-9a-f]{6}$/i.test(bg) ? bg : "#ffffff", "#ffffff", 0.85); return { css: readableOn(setProp(setProp(c, "body", "background-color", nb), "body", "color", C().fixContrast("#1d2426", nb, 7)), nb) }; }, why: "Light backgrounds with dark words have high contrast, so they're easy to read." },
    { id: "colorful", match: /colou?rful|more colou?r|rainbow|vibrant/i, says: "Give the hero a bold color, with words that stand out on it.",
      run: (h, c) => ({ css: setProp(setProp(c, ".hero", "background-color", "#e8457c"), ".hero", "color", C().fixContrast("#ffffff", "#e8457c")) }), why: "One bold color in the hero draws the eye. The words keep enough contrast to read." },
    { id: "game", match: /video ?game|gaming|game|arcade|pixel/i, says: "Make it look like a retro video game: a pixel-style font and a dark purple background.",
      run: (h, c) => { let x = setProp(c, "body", "font-family", "\"Courier New\", monospace"); x = setProp(x, "body", "background-color", "#1a1033"); x = setProp(x, "body", "color", "#f8f3ff"); return { css: setProp(x, "h1, h2, h3", "text-transform", "uppercase") }; }, why: "A monospace font (every letter the same width) looks like old game screens. text-transform: uppercase makes headings all capitals." },
    { id: "nature", match: /nature|forest|green|outdoors|woods/i, says: "Give it a nature look: forest green and a soft, leafy background.",
      run: (h, c) => { let x = setProp(c, "body", "background-color", "#f3f7ee"); x = setProp(x, "body", "color", "#1f3324"); return { css: setProp(setProp(x, ".hero", "background-color", "#2f5d3a"), ".hero", "color", "#ffffff") }; }, why: "Greens and soft creams feel calm and natural. The builder kept the words readable on each one." },
    { id: "sports", match: /sport|team|stadium|athletic/i, says: "Make it look sporty: a bold heading font and team colors.",
      run: (h, c) => { let x = setProp(c, "h1, h2, h3", "font-family", "Impact, \"Arial Black\", sans-serif"); return { css: setProp(setProp(x, ".hero", "background-color", "#13213c"), ".hero", "color", "#ffffff") }; }, why: "A heavy font like Impact looks like a team jersey. Navy and white are classic team colors." },
    { id: "bigtext", match: /(bigger|larger|easier to read).*(text|words|font|letters)|(text|words|font).*(bigger|larger)/i, says: "Make all the text a little bigger.",
      run: (h, c) => ({ css: setProp(c, "body", "font-size", remSize(getProp(c, "body", "font-size"), 0.15, 1.05)) }), why: "font-size on body changes the size of every word on the page. rem means \"times the normal size\"." },
    { id: "space", match: /\bspac(e|ing)\b|roomy|\broom\b|padding|crowded|breathe|spread/i, says: "Add more space around each part of the page.",
      run: (h, c) => ({ css: setProp(c, ".part", "padding", "3rem 2rem") }), why: "padding adds space inside each part, between its edge and its words." },
    { id: "rounded", match: /round(ed)?|curv|soft corners/i, says: "Make the corners rounder on pictures, cards, and buttons.",
      run: (h, c) => { let x = setProp(c, "img", "border-radius", "24px"); if (/\.card\s*\{/.test(x)) x = setProp(x, ".card", "border-radius", "24px"); return { css: /\.button\s*\{/.test(x) ? setProp(x, ".button", "border-radius", "999px") : x }; }, why: "border-radius rounds corners. 999px makes a button into a pill shape." },
    { id: "shadow", match: /shadow|3d|lift|float/i, says: "Add shadows so the cards and pictures look lifted off the page.",
      run: (h, c) => { let x = setProp(c, "img", "box-shadow", "0 8px 18px rgba(0, 0, 0, 0.25)"); return { css: /\.card\s*\{/.test(x) ? setProp(x, ".card", "box-shadow", "0 8px 18px rgba(0, 0, 0, 0.25)") : x }; }, why: "box-shadow draws a soft shadow: how far right, how far down, how blurry, and what color." },
    { id: "phone", match: /phone|mobile|small screen|tablet/i, says: "Make it work better on a phone: smaller headings and less padding on small screens.",
      run: (h, c) => ({ css: /@media/.test(c) ? c : `${c.replace(/\s*$/, "")}\n\n/* On small screens (like a phone) */\n@media (max-width: 600px) {\n  .hero h1 {\n    font-size: 2rem;\n  }\n  .part {\n    padding: 1.5rem 1rem;\n  }\n}\n` }), why: "@media (max-width: 600px) means \"only on screens 600 pixels wide or smaller\", so phones get their own sizes." },
    { id: "font", match: /font|typeface|letters|fancy|handwrit/i, says: "Change the font of the whole page.",
      run: (h, c, r) => ({ css: setProp(c, "body", "font-family", /fancy|elegant|old/i.test(r) ? "Georgia, \"Times New Roman\", serif" : /code|computer|robot|tech/i.test(r) ? "\"Courier New\", monospace" : /fun|round|friendly/i.test(r) ? "Verdana, sans-serif" : (getProp(c, "body", "font-family") || "").includes("Georgia") ? "system-ui, \"Segoe UI\", sans-serif" : "Georgia, serif") }), why: "font-family picks the typeface. The list after the first font gives backups, in case a computer doesn't have the first one." },
    { id: "border", match: /border|outline|line between|divider/i, says: "Add a line between the parts of the page.",
      run: (h, c) => ({ css: setProp(c, ".part", "border-bottom", "2px solid rgba(0, 0, 0, 0.15)") }), why: "border-bottom draws a line along the bottom edge: its thickness, style, and color." },
    { id: "section", match: /add (a |an |another )?(new )?section (about|on|for) (.+)/i, says: "Add a new section, with a heading and a sentence for you to write, and a menu link to it.",
      run: (h, c, r, m) => { const topic = cap(m[4]); const id = uniqueId(h, topic); return { html: addNavLink(beforeMainEnd(h, `\n  <!-- A new section about ${esc(topic.toLowerCase())} -->\n  <section id="${id}" class="part">\n    <h2>${esc(topic)}</h2>\n    <p>Write about ${esc(topic.toLowerCase())} here.</p>\n  </section>`), id, topic) }; }, why: "A <section> groups one part of the page. Its id lets the menu link jump to it." },
    { id: "list", match: /add (a |an )?list (of|about) (.+)/i, says: "Add a list section. Each thing you named becomes an <li>.",
      run: (h, c, r, m) => { const items = C().listFrom(m[3]); const topic = cap(m[3].split(/,| and /)[0]); const list = items.length >= 2 ? items : [`My first ${topic.toLowerCase()}`, `My second ${topic.toLowerCase()}`]; const id = uniqueId(h, `${topic}-list`); return { html: beforeMainEnd(h, `\n  <section id="${id}" class="part">\n    <h2>${esc(items.length >= 2 ? "My list" : topic)}</h2>\n    <ul>\n${list.map((x) => `      <li>${esc(x)}</li>`).join("\n")}\n    </ul>\n  </section>`) }; }, why: "<ul> is a bullet list. Each <li> is one thing in it." },
    { id: "picture", match: /add (a |an )?(picture|image|photo|pic|drawing) (of|about|with) (.+)/i, says: "Add a built-in picture that matches, with alt text.",
      run: (h, c, r, m) => { const info = (SE.webKit && SE.webKit.PICTURE_INFO) || {}; const w = new Set(String(m[4]).toLowerCase().match(/[a-z]+/g) || []); const pic = Object.keys(info).find((k) => info[k][1].split(" ").some((x) => w.has(x))); if (!pic) return { fail: `STEM 207 doesn't have a built-in picture of ${m[4]}. Try one of: moose, loon, puffin, fox, deer, mountains, a tree, waves, soccer, basketball, a game controller, a guitar, a paintbrush, a robot, a rocket, a light bulb.` }; return { html: beforeMainEnd(h, `\n  <section class="part">\n    <img src="${pic}" alt="${esc(info[pic][0])}">\n  </section>`) }; }, why: "<img> shows a picture: src picks which one, and alt describes it for people who can't see it." },
    { id: "link", match: /add (a |an )?link (to|for) (.+)/i, says: "Add a menu link that jumps to that part of the page.",
      run: (h, c, r, m) => { const want = slug(m[3]); const ids = [...h.matchAll(/id="([^"]+)"/g)].map((x) => x[1]); const id = ids.find((x) => x.includes(want) || want.includes(x)); if (!id) return { fail: `There's no part of the page called "${m[3]}" yet. Add a section about it first (try: add a section about ${m[3]}).` }; return { html: addNavLink(h, id, `Jump to ${cap(m[3]).toLowerCase()}`) }; }, why: "href=\"#id\" jumps to the part of the page with that id. The link words say where it goes." }
  ];

  /* Find the change that fits the request, and build it on the student's current code. */
  function propose(request, cur) {
    // "less dark", "too bright": what the student wants is the opposite word.
    const r = String(request || "").trim().replace(/\b(less|not so|not as|too)\s+(dark|black)\b/gi, "lighter").replace(/\b(less|not so|not as|too)\s+(light|bright|white)\b/gi, "darker");
    if (!r) return { ok: false, why: "Describe a change, like \"make the title stand out\".", suggest: LIST.slice(0, 4).map((x) => x.says) };
    // Specific add-requests win over style words they might contain ("add a section about video games").
    const order = ["section", "list", "picture", "link"].map((id) => LIST.find((x) => x.id === id)).concat(LIST.filter((x) => !["section", "list", "picture", "link"].includes(x.id)));
    // A color name is the most exact thing a student can ask for, so it comes before "darker" or "nature" in LIST.
    for (const ch of order) {
      const m = ch.match.exec(r);
      if (!m) continue;
      const out = ch.run(cur.html, cur.css, r, m);
      if (out.fail) return { ok: false, why: out.fail, suggest: [] };
      const html = out.html != null ? out.html : cur.html, css = out.css != null ? out.css : cur.css;
      if (html === cur.html && css === cur.css) return { ok: false, why: "Your page already has that change.", suggest: [] };
      return { ok: true, id: ch.id, says: ch.says, why: ch.why, html, css };
    }
    return { ok: false, why: "The builder doesn't know how to do that one yet. It only knows a list of changes (it isn't AI). You can make it yourself: the Tag Explorer and What does this do? can help.", suggest: LIST.filter((x) => !["section", "list", "picture", "link", "color"].includes(x.id)).slice(0, 6).map((x) => x.says) };
  }

  /* Teach Me: the same change as steps a student types themselves. One step per changed spot. */
  function steps(before, after) {
    const out = [];
    ["html", "css"].forEach((lang) => {
      const d = SE.webStudio.diff(before[lang] || "", after[lang] || "");
      let line = 0, i = 0;
      while (i < d.length) {
        if (d[i].op === " ") { line++; i++; continue; }
        const from = [], to = [], at = line + 1;
        while (i < d.length && d[i].op !== " ") { if (d[i].op === "-") { from.push(d[i].text); line++; } else to.push(d[i].text); i++; }
        const file = lang === "css" ? "styles.css" : "index.html";
        out.push({ lang, line: at, from, to, say: from.length ? `In ${file}, near line ${at}, change ${from.length === 1 ? "this line" : `these ${from.length} lines`} to the new code.` : `In ${file}, at line ${at}, add ${to.length === 1 ? "this line" : `these ${to.length} lines`}.` });
      }
    });
    return out;
  }

  SE.wbChanges = { propose, steps, LIST, setProp, getProp };
})();
