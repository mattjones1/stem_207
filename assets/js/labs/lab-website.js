/*
 * Build Your First Website (lab id "build-your-first-website"): a 90-minute workshop, grades 2–8.
 * Plan → HTML → Content → Media → CSS → Accessibility → Debug → Ship, for a made-up Maine business.
 * Stages are in website-stages.js; the safe preview, pictures, and page reading are shared with the Web Builder
 * Lab (web-kit.js). Students type real HTML and CSS. The helpers only put real code in front of them:
 *   Tag Shelf     buttons that type a real tag pair at the cursor (and wrap a selection)
 *   Find it       tap the preview to select the code that made it; the tag at the cursor is outlined
 *   Code Coach    one line about the tag or CSS property under the cursor
 *   Color helper  every color in the CSS, with a picker that rewrites that value in the code
 *   Check my page a checklist with three outcomes: Looks good, Needs a fix, Check with a person
 * Privacy: student code and plans stay on this device (localStorage for students, sessionStorage for educators previewing).
 * Only check names are logged. Pure rules for tests: SE.website.checks(doc, ctx), SE.website.TAGS.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;
  const WK = SE.webKit;
  const { BUSINESSES, STAGES, BROKEN, SHIP, ex } = SE.websiteStages;
  const { EXAMPLES, TAG_LESSON } = SE.websiteLessons;
  const exampleFor = (idx) => EXAMPLES[idx] || EXAMPLES[1];
  const LAB = "build-your-first-website";
  const PIC_NAMES = Object.keys(WK.PICTURES);
  const BIZ_PICS = ["muffins.svg", "kayak.svg", "tackle.svg"];
  const GENERIC_LINK = /^(click here|here|click|link|this|this link|more|read more|read this|go|go here|website|page|learn more)$/i;
  const GENERIC_ALT = /^(image|picture|photo|pic|img|graphic|a picture|an image|a photo|.*\.svg)$/i;
  const JOURNEY = ["Plan", "HTML", "Content", "Media", "CSS", "Accessibility", "Debug", "Ship"];
  const CELEBRATE = ["Your plan is ready. Time to write code!", "Your first HTML heading is live!", "Your page tells its story now.", "Your page has a picture everyone can understand, and a link that says where it goes.", "Your website has its own style.", "You made your website easier for more people to use.", "You found and fixed all four bugs.", ""];

  /* ───────── Tag Shelf and Code Coach ───────── */
  const TAGS = (b) => ({
    h1: { label: "Main heading", open: "<h1>", close: "</h1>" },
    h2: { label: "Section heading", open: "<h2>", close: "</h2>" },
    p: { label: "Paragraph", open: "<p>", close: "</p>" },
    ul: { label: "Bullet list", open: "<ul>\n  <li>", close: "</li>\n</ul>" },
    ol: { label: "Numbered list", open: "<ol>\n  <li>", close: "</li>\n</ol>" },
    li: { label: "List item", open: "<li>", close: "</li>" },
    img: { label: "Picture", open: `<img src="${b.pic}" alt="`, close: `">` },
    a: { label: "Link", open: `<a href="#${b.section}">`, close: "</a>" },
    id: { label: "Name to link to", open: ` id="${b.section}"`, close: "" }
  });
  const TAG_COACH = {
    h1: "<h1> is the main heading: what the whole page is about. A page has one.",
    h2: "<h2> is a section heading for one part of the page.",
    h3: "<h3> is a smaller heading inside a section.",
    p: "<p> is a paragraph: sentences that go together.",
    ul: "<ul> is a bullet list. Put <li> items inside it.",
    ol: "<ol> is a numbered list. Put <li> items inside it.",
    li: "<li> is one item in a list.",
    img: `<img> shows a picture. src picks the picture (${BIZ_PICS.join(", ")}); alt describes it for people who can't see it.`,
    a: "<a> is a link. href says where it goes; the words between the tags should say where, too.",
    strong: "<strong> marks words as important.",
    em: "<em> adds emphasis, like when you say a word louder.",
    section: "<section> groups one part of the page.",
    div: "<div> groups things so you can style them together.",
    span: "<span> marks a few words so you can style them.",
    style: "<style> holds CSS rules. In this workshop, CSS goes in the CSS tab."
  };
  const CSS_COACH = {
    color: "color sets the color of the words.",
    "background-color": "background-color sets the color behind the words.",
    background: "background sets what's behind the words, like a color.",
    padding: "padding adds space inside, between the edge and the content.",
    margin: "margin adds space outside, between this part and the next.",
    "font-family": "font-family picks the typeface, like Arial or Georgia.",
    "font-size": "font-size sets how big the words are.",
    "font-weight": "font-weight makes words bold (700) or regular (400).",
    border: "border draws a line around a part of the page.",
    "border-radius": "border-radius rounds the corners.",
    "text-align": "text-align lines words up: left, center, or right.",
    "line-height": "line-height sets the space between lines of text.",
    "max-width": "max-width keeps a part from getting wider than you choose."
  };
  const STYLE_EXTRA = /^(padding|padding-[a-z]+|margin|margin-[a-z]+|font-family|font-size|font-weight|font-style|border|border-[a-z-]+|text-align|line-height|letter-spacing|text-transform|max-width|width)$/i;

  /* ───────── Check my page: three outcomes from the real page ───────── */
  const LABEL = { h1: "Main heading", p: "Paragraph", h2: "Section heading", list: "List", img: "Picture", alt: "Alt text", link: "Link", style: "CSS style", contrast: "Readable colors", narrow: "Fits a phone screen", phone: "Phone preview", own: "Your own words" };
  const words = (s) => (String(s).trim().match(/\S+/g) || []).length;
  const wkOf = (el) => (el && el.getAttribute && el.getAttribute("data-wk")) || null;
  /* Why each check matters, how to fix it, and a hint (a pattern, never the student's whole answer). */
  const WHY = {
    h1: "The main heading tells visitors, and screen readers, what the whole page is about.",
    p: "A paragraph tells visitors about your idea in full sentences.",
    h2: "Section headings help people find their way around a page.",
    list: "A list makes related things quick to read.",
    img: "A picture helps visitors see what your page is about.",
    alt: "Alt text is read out loud for people who can't see the picture.",
    link: "People using screen readers often hear only the link words, so they need to say where the link goes.",
    style: "CSS gives your website its own look, so it doesn't look like every other plain page.",
    contrast: "Words without enough contrast are hard to read on a sunny screen, or for people with low vision.",
    narrow: "Lots of visitors use phones. Scrolling sideways to read is frustrating.",
    phone: "Testing on a phone shows you what many visitors will really see.",
    own: "Visitors come to your page for what you have to say."
  };
  const HOW = {
    h1: ["Put your website's name between <h1> and </h1>, near the top of the page.", "<h1>Your website's name</h1>"],
    p: ["Write a full sentence between <p> and </p>.", "<p>One sentence that introduces your idea.</p>"],
    h2: ["Add a heading for one part of your page with <h2>.", "<h2>A title for this part</h2>"],
    list: ["Put each thing in an <li>, and put all the <li> items inside <ul> and </ul>.", "<ul>\n  <li>First thing</li>\n  <li>Second thing</li>\n</ul>"],
    img: ["Use one of the built-in pictures in src.", "<img src=\"moose.svg\" alt=\"…\">"],
    alt: ["Inside the <img> tag, add alt=\"…\" with a few words that describe the picture.", "alt=\"What the picture shows\""],
    link: ["Give the link words that say where it goes, and an href that points to an id on your page.", "<a href=\"#facts\">See the fun facts</a>"],
    style: ["In the CSS tab, write a body rule with a background color and a text color, then one more style.", "body {\n  background-color: #fff7e8;\n  color: #213547;\n  padding: 1rem;\n}"],
    contrast: ["Make the words darker, or the background lighter.", "color: #213547;"],
    narrow: ["Look for something wider than a phone, like a fixed width. max-width keeps things inside the screen.", "max-width: 100%;"],
    phone: ["Press Phone above the preview, and look at your whole page.", ""],
    own: ["Add more sentences in your own words: what should visitors know?", "<p>Another sentence about your idea.</p>"]
  };
  /* doc: the rendered preview. ctx: { css, narrowOverflow, viewedPhone }. Returns
     { results: { id: { state, msg, wk } }, person: [{ msg, wk }], issues: [{ key, check, label, what, why, how, hint, wk }] }.
     state: "good" | "fix" | "person". issues lists every independent problem (each picture without alt text, each
     bad link…), so every one can have its own Find it. results keeps the first problem per check, for gating. */
  function checks(doc, ctx = {}) {
    const R = {}, person = [], issues = [];
    const win = doc.defaultView, cs = (el) => win.getComputedStyle(el);
    const good = (id, msg, wk) => (R[id] = { state: "good", msg, wk });
    const fix = (id, msg, wk, key) => {
      if (!R[id] || R[id].state !== "fix") R[id] = { state: "fix", msg, wk };
      const k = key || (wk != null ? `${id}:${wk}` : id);
      if (!issues.some((x) => x.key === k)) issues.push({ key: k, check: id, label: LABEL[id], what: msg, why: WHY[id], how: HOW[id][0], hint: HOW[id][1], wk: wk == null ? null : wk });
    };
    // Main heading (and the classic bug: a big <p> pretending to be one)
    const h1s = [...doc.querySelectorAll("h1")];
    if (!h1s.length) {
      const fake = [...doc.querySelectorAll("p, div, span, strong, b")].find((el) => el.textContent.trim() && parseFloat(cs(el).fontSize) >= 26);
      fake ? fix("h1", `"${fake.textContent.trim().slice(0, 40)}" looks like a heading, but it's marked up as <${fake.tagName.toLowerCase()}>. A main heading uses <h1>, so screen readers know it's the title.`, wkOf(fake))
        : fix("h1", "Your page has words, but it needs a main heading. Try <h1>, your website's name, then </h1>.");
    } else if (!h1s[0].textContent.trim()) fix("h1", "Your <h1> is empty. Type your website's name between <h1> and </h1>.", wkOf(h1s[0]));
    else if (h1s.length > 1) h1s.slice(1).forEach((h) => fix("h1", `Your page has ${h1s.length} <h1> headings. Use one <h1> for the main heading, and <h2> for sections.`, wkOf(h)));
    else good("h1", `Main heading: "${h1s[0].textContent.trim().slice(0, 50)}"`, wkOf(h1s[0]));
    // Paragraph
    const ps = [...doc.querySelectorAll("p")];
    const realP = ps.find((p) => words(p.textContent) >= 3);
    realP ? good("p", "Your page has a paragraph.", wkOf(realP))
      : ps.length ? fix("p", "Your paragraph is very short. Write a full sentence about your idea.", wkOf(ps[0]))
        : fix("p", "Add a paragraph that tells visitors about your idea: <p>, a sentence, then </p>.");
    // Section heading
    const h2 = [...doc.querySelectorAll("h2")].find((h) => h.textContent.trim());
    h2 ? good("h2", `Section heading: "${h2.textContent.trim().slice(0, 40)}"`, wkOf(h2)) : fix("h2", "Add a section heading with <h2>, like <h2>Fun facts</h2>.");
    // List
    const lists = [...doc.querySelectorAll("ul, ol")];
    const best = lists.sort((a, b) => b.querySelectorAll(":scope > li").length - a.querySelectorAll(":scope > li").length)[0];
    const nli = best ? best.querySelectorAll(":scope > li").length : 0;
    !best ? fix("list", doc.querySelector("li") ? "Your <li> items need a list around them: put them inside <ul> and </ul>." : "Add a list of things that go together: <ul>, then <li> items, then </ul>.", wkOf(doc.querySelector("li")))
      : nli < 2 ? fix("list", `Your list has ${nli} item${nli === 1 ? "" : "s"}. Add another <li> inside the <${best.tagName.toLowerCase()}>.`, wkOf(best))
        : good("list", `Your list has ${nli} items.`, wkOf(best));
    // Pictures and alt text: one issue for each picture that needs a fix
    const imgs = [...doc.querySelectorAll("img")];
    const name = (i) => i.getAttribute("data-name") || i.getAttribute("data-src") || "";
    if (!imgs.length) {
      fix("img", "Add a picture, like <img src=\"moose.svg\" alt=\"…\">.");
      fix("alt", "Add a picture first. Then give it alt text.", null, "alt:none");
    } else {
      const unknown = imgs.filter((i) => !i.getAttribute("data-name"));
      unknown.forEach((u) => fix("img", `"${name(u) || "(no src)"}" isn't one of the built-in pictures, so it can't show. Use one like ${BIZ_PICS.join(", ")}, or moose.svg.`, wkOf(u)));
      if (!unknown.length) good("img", `Your page shows ${name(imgs[0])}.`, wkOf(imgs[0]));
      let altBad = 0;
      imgs.forEach((i) => {
        const a = (i.getAttribute("alt") || "").trim();
        if (!i.hasAttribute("alt") || !a) { altBad++; fix("alt", `Your picture ${name(i)} has no alt text. What would someone need to know about this picture if they couldn't see it?`, wkOf(i)); }
        else if (GENERIC_ALT.test(a) || a.length < 8) { altBad++; fix("alt", `Alt text "${a}" doesn't say what's in the picture. Describe it in a few words.`, wkOf(i)); }
      });
      if (!altBad) {
        good("alt", "Every picture has alt text.", wkOf(imgs[0]));
        imgs.forEach((i) => person.push({ key: `alt:${i.getAttribute("alt").trim()}`, msg: `Read your alt text out loud: "${i.getAttribute("alt").trim()}". Does it tell someone what's in the picture?`, wk: wkOf(i) }));
      }
    }
    // Links: one issue for each link that needs a fix
    const links = [...doc.querySelectorAll("a")];
    if (!links.length) fix("link", "Add a link with words that say where it goes, like <a href=\"#facts\">See the fun facts</a>.");
    else {
      let linkBad = 0;
      for (const a of links) {
        const text = a.textContent.trim(), href = (a.getAttribute("href") || "").trim();
        let problem = null;
        if (!text) problem = "Your link has no words. Put words between <a …> and </a>.";
        else if (GENERIC_LINK.test(text)) problem = `"${text}" doesn't say where the link goes. People using screen readers often hear only the link words. Try words like "See the fun facts".`;
        else if (!href) problem = "Your link needs an address: href=\"#\" plus the id of a part of your page.";
        else if (href.startsWith("#")) {
          const id = href.slice(1);
          if (!id || !doc.getElementById(id)) problem = `Your link goes to ${href}, but nothing on the page has id="${id || "…"}". Add id="${id || "facts"}" to a heading.`;
        } else if (!/^https:\/\/[^\s.]+\.[^\s]+/.test(href)) problem = `Your link goes to "${href}". In this workshop, links jump to a part of your page, like href="#facts".`;
        if (problem) { linkBad++; fix("link", problem, wkOf(a)); }
      }
      if (!linkBad) {
        good("link", `Your link "${links[0].textContent.trim().slice(0, 40)}" works.`, wkOf(links[0]));
        links.forEach((a) => person.push({ key: `link:${a.textContent.trim()}`, msg: `Read just your link words: "${a.textContent.trim()}". Would someone know where it goes?`, wk: wkOf(a) }));
      }
    }
    // CSS style
    const bodyBg = (() => { for (const el of [doc.body, doc.documentElement]) { const c = WK.rgb(cs(el).backgroundColor); if (c && c.a > 0) return c; } return null; })();
    const bodyColor = WK.rgb(cs(doc.body).color);
    const rules = String(ctx.css || "").match(/[^{}]+\{[^}]*\}/g) || [];
    const extraOk = rules.some((rule) => {
      const sel = rule.slice(0, rule.indexOf("{")).trim(), body = rule.slice(rule.indexOf("{") + 1, -1);
      let matches = false;
      try { matches = !!doc.querySelector(sel); } catch (e) { matches = false; }
      return matches && body.split(";").some((d) => STYLE_EXTRA.test((d.split(":")[0] || "").trim()) && (d.split(":")[1] || "").trim());
    });
    if (!bodyBg || (bodyBg.r === 255 && bodyBg.g === 255 && bodyBg.b === 255)) fix("style", "Your page background is still white. In the CSS tab, try body { background-color: #fff7e8; }");
    else if (!bodyColor || (bodyColor.r === 0 && bodyColor.g === 0 && bodyColor.b === 0)) fix("style", "Your words are still the default black. Add color to your body rule, like color: #213547;");
    else if (!extraOk) fix("style", "Nice colors! Now make one more style choice, like padding: 1em; or a font-family, in a rule that matches part of your page.");
    else good("style", "Your CSS sets the background, the text color, and more.");
    // Contrast (WCAG 2: the workshop asks 4.5 to 1 for all text): one issue for each hard-to-read element
    const tc = WK.textContrast(doc);
    // One issue for each color pair that's hard to read (the same gray on every line is one problem, not ten).
    const lows = Object.values(tc.filter((t) => t.ratio !== null && t.ratio < 4.5).sort((a, b) => a.ratio - b.ratio)
      .reduce((m, t) => { const k = `${t.fg}|${t.bg}`; if (!m[k]) m[k] = t; return m; }, {}));
    const unknownTc = tc.filter((t) => t.ratio === null);
    const known = tc.filter((t) => t.ratio !== null);
    if (lows.length) lows.forEach((low) => fix("contrast", `"${low.text}" has a contrast of ${low.ratio} to 1. Readable text needs at least 4.5 to 1. Try making the words darker or the background lighter.`, wkOf(low.el)));
    else if (!known.length && unknownTc.length) R.contrast = { state: "person", msg: "We can't measure the colors behind your words. Ask a person: is every word easy to read?", wk: wkOf(unknownTc[0].el) };
    else if (known.length) good("contrast", `All your text is readable: the lowest contrast is ${Math.min(...known.map((t) => t.ratio))} to 1.`, wkOf(known[0].el));
    else fix("contrast", "Add some words to your page first.");
    unknownTc.forEach((t) => person.push({ msg: `We can't measure the contrast of "${t.text}" (something is behind it). Is it easy to read?`, wk: wkOf(t.el) }));
    // Finish: fits a phone, looked at on a phone, and the student's own words
    if (ctx.narrowOverflow === true) fix("narrow", "Your page is wider than a phone screen, so people would have to scroll sideways. Look for something too wide.");
    else if (ctx.narrowOverflow === false) good("narrow", "Your page fits on a phone screen.");
    ctx.viewedPhone ? good("phone", "You looked at your page in the Phone preview.") : fix("phone", "Press Phone above the preview and look at your page the way a phone shows it.");
    const all = doc.body.textContent.replace(/\s+/g, " ").trim();
    words(all) >= 20 ? good("own", "Your page has your own words.") : fix("own", `Your page has ${words(all)} words. Tell visitors more: aim for 20 or more.`);
    return { results: R, person, issues };
  }
  /* Where a missing part could go, so Find it can show an "add it here" line. Never edits the code.
     Returns { lang, at, label } or null when there's no sensible place. */
  function insertPoint(check, html, css) {
    const after = (re) => { let m, last = -1; const g = new RegExp(re, "gi"); while ((m = g.exec(html))) last = m.index + m[0].length; return last; };
    const endOfLine = (i) => { const n = html.indexOf("\n", i); return n < 0 ? html.length : n + 1; };
    switch (check) {
      case "h1": return { lang: "html", at: 0, label: "Add your <h1> here, at the top" };
      case "p": { const h = after("</h1>"); return { lang: "html", at: h >= 0 ? endOfLine(h) : 0, label: "Add a <p> here" }; }
      case "h2": { const p = after("</p>|</ul>|</ol>"); return { lang: "html", at: p >= 0 ? endOfLine(p) : html.length, label: "Add your <h2> here" }; }
      case "list": { const h = after("</h2>|</p>"); return { lang: "html", at: h >= 0 ? endOfLine(h) : html.length, label: "Add your <ul> list here" }; }
      case "img": return { lang: "html", at: html.length, label: "Add your <img> here" };
      case "alt": return { lang: "html", at: html.length, label: "Add a picture here first" };
      case "link": return { lang: "html", at: html.length, label: "Add your <a> link here" };
      case "own": return { lang: "html", at: html.length, label: "Add more sentences here" };
      case "contrast": return { lang: "html", at: html.length, label: "Add some words here first" };
      case "style": {
        const b = /body\s*\{/i.exec(css || "");
        return { lang: "css", at: b ? b.index + b[0].length : (css || "").length, label: b ? "Add styles inside your body rule" : "Add a body rule here" };
      }
      case "narrow": return { lang: "css", at: (css || "").length, label: "Look for something too wide" };
      default: return null;
    }
  }

  /* The page the way a screen reader moves through it: headings, paragraphs, lists, pictures, and links, in order.
     Returns [{ kind, say, wk }]. A picture with no alt text is read by its file name, as many screen readers do. */
  function readOut(doc) {
    const out = [], clip = (t, n = 80) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);
    const text = (el) => el.textContent.replace(/\s+/g, " ").trim();
    const one = (el) => {
      const tag = el.tagName.toLowerCase(), wk = wkOf(el);
      if (tag === "img") {
        const alt = el.getAttribute("alt"), file = el.getAttribute("data-name") || el.getAttribute("data-src") || "picture";
        out.push({ kind: "image", say: alt && alt.trim() ? `Image: ${alt.trim()}` : `Image: ${file} (no alt text, so it's read by its file name)`, wk });
      } else if (tag === "a") out.push({ kind: "link", say: `Link: ${text(el) || "(no words)"}`, wk });
    };
    const walk = (node) => {
      for (const el of node.children) {
        const tag = el.tagName.toLowerCase(), wk = wkOf(el);
        if (/^h[1-6]$/.test(tag)) { out.push({ kind: "heading", say: `Heading level ${tag[1]}: ${clip(text(el)) || "(empty)"}`, wk }); continue; }
        if (tag === "ul" || tag === "ol") {
          const items = [...el.querySelectorAll(":scope > li")];
          out.push({ kind: "list", say: `List, ${items.length} item${items.length === 1 ? "" : "s"}`, wk });
          items.forEach((li) => { out.push({ kind: "item", say: `• ${clip(text(li))}`, wk: wkOf(li) }); li.querySelectorAll("a, img").forEach(one); });
          continue;
        }
        if (tag === "img" || tag === "a") { one(el); continue; }
        if (tag === "p") {
          const words = [...el.childNodes].filter((n) => n.nodeType === 3 || !/^(A|IMG)$/.test(n.tagName)).map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim();
          if (words) out.push({ kind: "text", say: clip(words), wk });
          el.querySelectorAll("a, img").forEach(one);
          continue;
        }
        walk(el);
      }
    };
    if (doc && doc.body) walk(doc.body);
    return out;
  }

  /* Level Up: Try This Next. Optional goals for anyone who wants more; they never block a stage. Each says what it
     practices and what success looks like, and ticks when Check my page sees it on the real page. */
  function challenges(doc, ctx = {}) {
    const ids = [...doc.querySelectorAll("a[href^='#']")].filter((a) => a.getAttribute("href").length > 1 && doc.getElementById(a.getAttribute("href").slice(1)));
    const tc = WK.textContrast(doc).filter((t) => t.ratio !== null);
    return [
      { label: "Two sections with <h2> headings", practice: "Organizing a page with headings", success: "Two <h2> headings, each starting its own part of the page.", done: doc.querySelectorAll("h2").length >= 2 },
      { label: "A second link that jumps to another section", practice: "Links and ids", success: "Two links, each jumping to a different id on your page.", done: new Set(ids.map((a) => a.getAttribute("href"))).size >= 2 },
      { label: "Group a part of your page in <section>", practice: "Semantic HTML", success: "A <section> with its own <h2> inside it.", done: [...doc.querySelectorAll("section")].some((s) => s.querySelector("h2")) },
      { label: "A second picture with alt text", practice: "Describing pictures for everyone", success: "Two pictures, each with alt text that says what's in it.", done: [...doc.querySelectorAll("img[alt]")].filter((i) => i.getAttribute("alt").trim().length >= 8).length >= 2 },
      { label: "A theme where all text has 7 to 1 contrast or more", practice: "Choosing readable colors", success: "Every word reaches 7 to 1 contrast, the highest accessibility level.", done: tc.length > 0 && tc.every((t) => t.ratio >= 7) },
      { label: "Fits a phone screen", practice: "Designing for phones", success: "No sideways scrolling in the Phone preview.", done: ctx.narrowOverflow === false }
    ];
  }
  function levelUp(res) {
    const list = res.challenges || [];
    if (!list.length) return "";
    const n = list.filter((c) => c.done).length;
    return `<details class="ws-levelup"><summary>${icon("star")}Level Up: Try This Next (optional, ${n} of ${list.length} done)</summary>
      <p class="muted small">Extra goals for when you want more. They never stop you from finishing this stage. Each one ticks when Check my page sees it on your page.</p>
      <ul>${list.map((c) => `<li class="${c.done ? "is-done" : ""}">${icon(c.done ? "check" : "target")}<span><strong>${esc(c.label)}</strong>${c.done ? " (done)" : ""}<br><span class="muted small">Practice: ${esc(c.practice)}. You've got it when: ${esc(c.success)}</span></span></li>`).join("")}</ul>
    </details>`;
  }

  /* ───────── Saving (this device only) ───────── */
  function storeFor(user) {
    const student = user && user.role === "student";
    const key = `stem207.website.${student ? user.id : "preview"}`;
    let s = null;
    try { s = student ? window.localStorage : window.sessionStorage; } catch (e) { s = null; }
    return {
      load() { try { return JSON.parse((s && s.getItem(key)) || "{}") || {}; } catch (e) { return {}; } },
      save(v) { try { if (s) s.setItem(key, JSON.stringify(v)); } catch (e) { /* storage full or off */ } }
    };
  }
  /* A starting page for a stage, built from the stages before it (for a student who starts partway). */
  function seed(idx, b) {
    if (idx <= 1) return { html: "<h1></h1>\n", css: "" };
    let html = ex.bones(b);
    if (idx >= 3) html += ex.story(b);
    if (idx >= 4) html += ex.media(b);
    return { html, css: idx >= 5 ? ex.style() : "" };
  }

  /* ───────── The journey strip (View my progress) ───────── */
  function journey(api, idx) {
    const done = SE.labs.progressFor(api.user, LAB);
    return `<nav class="ws-journey" aria-label="Your progress"><ol>${JOURNEY.map((j, i) => `<li class="${i === idx ? "is-here" : ""} ${done.has(i) ? "is-done" : ""}"><a href="#/lab/${LAB}/${i + 1}" ${i === idx ? 'aria-current="step"' : ""}>${done.has(i) ? icon("check") : `<b>${i + 1}</b>`}<span>${j}</span>${done.has(i) ? '<span class="visually-hidden"> (done)</span>' : ""}</a></li>`).join("")}</ol></nav>`;
  }

  /* ───────── Stage 1: the Planning Studio (website-plan.js) ───────── */
  function mountPlan(el, idx, api) {
    const st = storeFor(api.user), state = st.load();
    const body = el.closest(".lab-body");
    if (body) body.classList.add("lab-body--wide");
    return SE.websitePlan.mountStudio(el, api, { state, save: () => st.save(state), journey: journey(api, idx) });
  }

  /* ───────── Stages 2–8: the code workspace ───────── */
  function mountCode(el, idx, api) {
    const S = STAGES[idx];
    const st = storeFor(api.user), state = st.load();
    const plan = SE.websitePlan.migrate(state);   // an old save (a business) becomes a v2 plan
    const b = SE.websitePlan.subject(plan);         // the plan's words for starters, the Tag Shelf, and examples
    const bucket = S.source === "project" ? "project" : S.source;   // project (stages 2–6), debug, ship
    if (!state[bucket] || typeof state[bucket].html !== "string") state[bucket] = S.source === "debug" ? { ...BROKEN } : S.source === "ship" ? { ...SHIP } : seed(idx, b);
    state.snap = state.snap || {};
    if (!state.snap[idx]) state.snap[idx] = { ...state[bucket] };   // what Start over goes back to
    state.viewed = state.viewed || {};
    state.fixes = state.fixes || [];
    st.save(state);
    const work = state[bucket];
    let tab = "html", phone = false, reader = false, map = [], timer = null, ready = Promise.resolve(), checks2 = 0, failed = 0, confirmReset = false, shipReady = null;
    let lastIssues = [];   // the issues on screen, by key, so each Find it goes to its own problem
    state.confirmed = state.confirmed || {};
    const confirmed = (state.confirmed[idx] = state.confirmed[idx] || {});   // "Check with a person" items the student said yes to, keyed by their words
    const needsPeople = !!S.confirm;   // stage 6: the person items must be confirmed too
    const body = el.closest(".lab-body");
    if (body) body.classList.add("lab-body--wide");   // a narrower brief, so code and preview get more room
    const hasProject = !!(state.project && state.project.html && state.project.html.replace(/<h1><\/h1>|\s/g, ""));
    const askStart = S.source === "ship" && !state.shipFrom && hasProject;
    const prev = {};   // last state of each check, to notice a fix
    const tags = TAGS(S.source === "debug" ? { pic: "lighthouse.svg", section: "flavors" } : b);   // the broken page has its own picture and section

    el.innerHTML = `
      <div class="ws" id="ws">
        ${journey(api, idx)}
        <div class="ws__bar">
          <p class="ws-bizline">${S.source === "debug"
            ? `${icon("alert")}<span>This page belongs to another developer: <strong>Puffin Point Ice Cream</strong>.</span>`
            : `<span>Your website: <strong id="ws-name">${esc(b.name)}</strong></span>`}</p>
          <div class="ws__toggles" role="group" aria-label="Studio tools">
            ${S.source === "debug" ? "" : `<button type="button" class="btn btn--ghost btn--small" id="ws-plan" aria-controls="wp-drawer" aria-expanded="false">${icon("map")}My plan</button>`}
            <button type="button" class="btn btn--ghost btn--small" id="ws-example">${icon("eye")}Show an Example</button>
            <button type="button" class="btn btn--ghost btn--small" id="ws-tags">${icon("code")}Tag Explorer</button>
          </div>
        </div>
        <div class="ws__panes">
          <section class="ws__edit" aria-label="Your code">
            ${askStart ? `<div class="ws-start" id="ws-start" role="group" aria-labelledby="ws-start-h">
              <p id="ws-start-h"><strong>How do you want to start?</strong> The checks are the same either way.</p>
              <div class="ws-start__btns">
                <button type="button" class="btn btn--primary btn--small" id="ws-start-mine">${icon("refresh")}Start from my page</button>
                <button type="button" class="btn btn--ghost btn--small" id="ws-start-blank">${icon("star")}Start blank (challenge)</button>
              </div>
            </div>` : ""}
            <div class="ws-tabrow">
              <div class="ws-tabs" role="tablist" aria-label="Code">
                <button type="button" role="tab" id="ws-tab-html" aria-selected="true" aria-controls="ws-panel-html">HTML <span class="ws-file">index.html</span></button>
                ${S.css ? `<button type="button" role="tab" id="ws-tab-css" aria-selected="false" aria-controls="ws-panel-css">CSS <span class="ws-file">style.css</span></button>` : ""}
              </div>
              <div class="ws-undo">
                <button type="button" class="linkish" id="ws-undo">${icon("refresh", 'style="transform:scaleX(-1)"')}Undo</button>
                <button type="button" class="linkish" id="ws-redo">${icon("refresh")}Redo</button>
              </div>
            </div>
            <div id="ws-panel-html" role="tabpanel" aria-labelledby="ws-tab-html">
              ${S.tags && S.tags.length ? `<div class="ws-shelf" role="group" aria-label="Tag Shelf: type a tag at the cursor">${S.tags.map((t) => `<button type="button" class="ws-tag" data-tag="${t}" ${t === "img" ? `title="Pictures you can use: ${BIZ_PICS.join(", ")}"` : ""}><span>${esc(tags[t].label)}</span><code>${esc(t === "id" ? 'id="…"' : `<${t}>`)}</code></button>`).join("")}</div>` : ""}
              <label class="visually-hidden" for="ws-html">Your HTML</label>
              <textarea id="ws-html" class="ws-code" rows="11" spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="ws-coach">${esc(work.html)}</textarea>
            </div>
            ${S.css ? `<div id="ws-panel-css" role="tabpanel" aria-labelledby="ws-tab-css" hidden>
              <div class="ws-colors" id="ws-colors" aria-label="Color helper"></div>
              <label class="visually-hidden" for="ws-css">Your CSS</label>
              <textarea id="ws-css" class="ws-code" rows="11" spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="ws-coach">${esc(work.css)}</textarea>
            </div>` : ""}
            <p class="ws-coach" id="ws-coach"></p>
            <div class="ws-actions">
              <button type="button" class="btn btn--launch" id="ws-check">${icon("check")}<span class="ws-check__label">Check my page</span></button>
              ${S.source === "ship" ? `<button type="button" class="btn btn--primary" id="ws-ship" hidden>${icon("rocket")}Finish my website</button>` : ""}
              ${S.source === "ship" ? `<button type="button" class="btn btn--ghost btn--small" id="ws-earlier" aria-expanded="false" aria-controls="ws-earlier-code">${icon("eye")}Show my earlier page</button>` : ""}
              <button type="button" class="btn btn--ghost btn--small" id="ws-reset">Start over</button>
            </div>
            ${S.source === "ship" ? `<pre class="ws-earlier" id="ws-earlier-code" hidden tabindex="0" aria-label="Your earlier page (read only)">${esc((state.project && state.project.html) || "You haven't built an earlier page yet.")}</pre>` : ""}
          </section>
          <section class="ws__view" aria-label="Preview">
            <div class="ws-viewbar">
              <span class="ws-viewbar__h" id="ws-prev-h">Preview</span>
              <div class="ws-size" role="group" aria-label="Preview">
                <button type="button" class="btn btn--ghost btn--small" id="ws-desk" aria-pressed="true">Desktop</button>
                <button type="button" class="btn btn--ghost btn--small" id="ws-phone" aria-pressed="false">Phone</button>
                <button type="button" class="btn btn--ghost btn--small" id="ws-sr" aria-pressed="false" aria-controls="ws-reader">${icon("sound")}Screen reader</button>
              </div>
            </div>
            <div class="ws-framebox" id="ws-framebox"><iframe id="ws-frame" class="ws-frame" title="Preview of your website" sandbox="allow-same-origin" aria-describedby="ws-prev-h ws-findhelp"></iframe></div>
            <section class="ws-reader" id="ws-reader" hidden aria-labelledby="ws-reader-h">
              <div class="ws-reader__head"><h3 id="ws-reader-h">How a screen reader moves through your page</h3>${SE.speech.button("ws-reader")}</div>
              <ol class="ws-reader__list" id="ws-reader-list"></ol>
            </section>
            <p class="field-help" id="ws-findhelp">Find it: tap any part of your page to find the code that made it.</p>
            ${S.css ? `<div class="ws-meter" id="ws-meter"></div>` : ""}
            <div class="ws-feedback-slot"></div>
            <section class="ws-checks" id="ws-checks" aria-label="Check my page results"></section>
          </section>
        </div>
      </div>`;

    const $ = (s) => el.querySelector(s);
    // Feedback and the checklist sit beside the preview, on the first screen.
    const fb = document.getElementById("lab-feedback");
    if (fb) $(".ws-feedback-slot").replaceWith(fb);
    const ta = { html: $("#ws-html"), css: $("#ws-css") };
    const frame = $("#ws-frame");
    const save = () => { work.html = ta.html.value; if (ta.css) work.css = ta.css.value; st.save(state); };
    // The editors: the real textareas, colored, with line numbers. The start of the file is shown, locked.
    const shellTopFor = (name) => [
      { text: "<!DOCTYPE html>", why: "Use modern HTML" },
      { text: "<html lang=\"en\">", why: "The whole page, in English" },
      { text: "<head>", why: "Information for the browser" },
      { text: "  <meta charset=\"UTF-8\">", why: "Show every letter correctly" },
      { text: `  <title>${name}</title>`, why: "The name in the browser tab (from your plan)" }
    ].concat(S.css ? [{ text: "  <link rel=\"stylesheet\" href=\"style.css\">", why: "Use the CSS in style.css" }] : [], [{ text: "</head>" }, { text: "<body>", why: "Everything visitors see" }]);
    const SHELL_END = [{ text: "</body>" }, { text: "</html>" }];
    const ed = {
      html: SE.codeEditor(ta.html, { lang: "html", shellTop: shellTopFor(S.source === "debug" ? "Puffin Point Ice Cream" : b.name), shellBottom: SHELL_END, foldTop: true }),
      css: ta.css ? SE.codeEditor(ta.css, { lang: "css" }) : null
    };
    /* My Website Plan: the student's plan on every stage. Editing it never changes code; "Use in my code" buttons say
       what they'll add, then add it at the cursor on a second press (and fill an empty <h1> instead of adding one). */
    const clean = (t) => String(t || "").replace(/[<>&]/g, "");
    const planDrawer = S.source === "debug" ? null : SE.websitePlan.drawer(el.querySelector(".ws"), {
      state, stage: idx, save: () => st.save(state),
      onChange(p) { const n = SE.websitePlan.subject(p).name; $("#ws-name").textContent = n; ed.html.setShell(shellTopFor(n), SHELL_END); },
      onUse(kind, p, btn) {
        const s = SE.websitePlan.subject(p);
        const html = ta.html.value, emptyH1 = /<h1>\s*<\/h1>/.exec(html);
        const add = {
          headline: emptyH1 ? null : `<h1>${clean(p.headline)}</h1>`, intro: `<p>${clean(p.intro)}</p>`,
          points: `<ul>\n${s.items.map((x) => `  <li>${clean(x)}</li>`).join("\n")}\n</ul>`,
          picture: `<img src="${s.pic}" alt="">`
        };
        if (kind === "name") { ed.html.setShell(shellTopFor(s.name), SHELL_END); return `Your <title> line already follows your plan: ${s.name}. It's in the locked lines at the top of the file.`; }
        if (kind === "colors" && !ta.css) return "Colors are CSS. You'll use them on stage 5, Give Your Website Style.";
        if (kind === "headline" && !clean(p.headline)) return "Write a headline in your plan first.";
        const what = kind === "headline" && emptyH1 ? `your headline between your empty <h1> and </h1>` : kind === "colors" ? `background-color: ${p.colors.secondary}; and color: ${p.colors.primary}; in your CSS body rule` : `${add[kind].split("\n")[0]}${add[kind].includes("\n") ? "…" : ""} where your cursor is`;
        if (btn.dataset.armed !== "1") {
          el.querySelectorAll("[data-armed]").forEach((x) => { delete x.dataset.armed; });
          btn.dataset.armed = "1";
          btn.lastChild.textContent = "Yes, add it";
          return `This adds ${what}. Nothing else in your code changes. Press again to add it.`;
        }
        delete btn.dataset.armed;
        btn.lastChild.textContent = { name: "Put it in my <title>", headline: "Use as my <h1>", intro: "Use as a <p>", points: "Use as a <ul> list", picture: "Add as an <img>", colors: "Use in my CSS body rule" }[kind];
        if (kind === "colors") {
          showTab("css");
          const body = /body\s*\{/i.exec(ta.css.value);
          if (body) { ta.css.setSelectionRange(body.index + body[0].length, body.index + body[0].length); typeAt(ta.css, `\n  background-color: ${p.colors.secondary};\n  color: ${p.colors.primary};`); }
          else { ta.css.setSelectionRange(ta.css.value.length, ta.css.value.length); typeAt(ta.css, `${ta.css.value && !ta.css.value.endsWith("\n") ? "\n" : ""}body {\n  background-color: ${p.colors.secondary};\n  color: ${p.colors.primary};\n}\n`); }
        } else {
          showTab("html");
          if (kind === "headline" && emptyH1) { const at = emptyH1.index + 4; ta.html.setSelectionRange(at, emptyH1.index + emptyH1[0].length - 5); typeAt(ta.html, clean(p.headline)); }
          else { const before = ta.html.value.slice(0, ta.html.selectionStart); typeAt(ta.html, (before && !before.endsWith("\n") ? "\n" : "") + add[kind] + "\n"); }
        }
        api.log("lab_plan_used", { stage: idx, part: kind });
        return kind === "picture" ? "Added. Now write the alt text: what's in the picture?" : "Added to your code. Change the words any time.";
      }
    });
    if (planDrawer) $("#ws-plan").addEventListener("click", (e) => { planDrawer.toggle(e.currentTarget); e.currentTarget.setAttribute("aria-expanded", String(planDrawer.isOpen)); });
    const refreshEditors = () => { ed.html.refresh(); if (ed.css) ed.css.refresh(); };

    /* Typing real code: insertText keeps the browser's own Undo history. */
    function typeAt(area, text, caretBack = 0) {
      area.focus();
      const ok = document.execCommand && document.execCommand("insertText", false, text);
      if (!ok) area.setRangeText(text, area.selectionStart, area.selectionEnd, "end");
      if (caretBack) { const p = area.selectionEnd - caretBack; area.setSelectionRange(p, p); }
      area.dispatchEvent(new Event("input", { bubbles: true }));
    }
    function shelf(t) {
      const area = ta.html, tg = tags[t];
      const sel = area.value.slice(area.selectionStart, area.selectionEnd);
      if (t === "id") {   // id goes inside an opening tag: put it after the tag name at the cursor's line
        typeAt(area, tg.open);
        api.say(`An id names this part so a link can jump to it: href="#${b.section}". Make sure it's inside an opening tag, like <h2 id="${b.section}">.`, "info");
        return;
      }
      typeAt(area, tg.open + sel + tg.close, sel ? 0 : tg.close.length);
      api.log("lab_tag_shelf", { tag: t, stage: idx });
    }

    /* ───────── Preview, Find it, Code Coach ───────── */
    const HEAD = `<style>[data-wk-on]{outline:3px solid #b4006a !important;outline-offset:2px}</style>`;
    function render() {
      const out = WK.srcdoc(ta.html.value, { css: ta.css ? ta.css.value : work.css, map: true, head: HEAD });
      map = out.map;
      ready = new Promise((res) => {
        frame.onload = () => {
          const d = frame.contentDocument;
          if (d) {
            d.addEventListener("click", (e) => {
              const a = e.target.closest && e.target.closest("a");
              if (a) {
                e.preventDefault();
                const href = a.getAttribute("href") || "";
                const target = href.startsWith("#") && href.length > 1 && d.getElementById(href.slice(1));
                if (target) target.scrollIntoView({ block: "start" });
                api.say(target ? `This link jumps to the part of your page with id="${href.slice(1)}".` : `Links don't leave the preview. This one goes to: ${href || "nowhere"}`, "info");
              }
              const hit = e.target.closest && e.target.closest("[data-wk]");
              if (hit) findCode(hit.getAttribute("data-wk"));
            });
          }
          meter();
          if (reader) readerView();
          res();
        };
      });
      frame.srcdoc = out.doc;
    }
    function findCode(wk, quiet) {
      const m = map.find((x) => String(x.i) === String(wk));
      if (!m) return false;
      showTab("html");
      ed.html.goTo(m.start, m.end);
      outline(wk);
      coach();
      if (!quiet) api.say(`Found it: the <${m.tag}> tag on line ${ed.html.lineOf(m.start)}. It's selected in your code.`, "info");
      return true;
    }
    /* Find it for one issue: its own element when it has one, or where the missing part could go. */
    function findIssue(key) {
      const x = lastIssues.find((i) => i.key === key);
      if (!x) return;
      if (x.wk != null && findCode(x.wk, true)) {
        api.say(`${x.label}: it's selected on line ${ed.html.lineOf(ta.html.selectionStart)}. ${x.how}`, "info");
        return;
      }
      if (x.check === "phone") { $("#ws-phone").focus(); api.say("Press Phone above the preview to see your page the way a phone shows it.", "info"); return; }
      if (x.check === "contrast" && ta.css) {
        const c = WK.cssColors(ta.css.value).find((k) => /^color$/i.test(k.prop)) || WK.cssColors(ta.css.value)[0];
        if (c) { showTab("css"); ed.css.goTo(c.start, c.end); api.say(`Here's a color in your CSS: ${c.selector} { ${c.prop} }. ${x.how}`, "info"); return; }
      }
      const p = insertPoint(x.check, ta.html.value, ta.css ? ta.css.value : "");
      if (!p || (p.lang === "css" && !ta.css)) { api.say(`${x.label}: ${x.how}`, "info"); return; }
      showTab(p.lang);
      ed[p.lang].showInsertPoint(p.at, p.label);
      api.say(`${p.label} (line ${p.lang === "html" ? ed.html.lineOf(p.at) : ta.css.value.slice(0, p.at).split("\n").length}). ${x.how}`, "info");
    }
    function outline(wk) {
      const d = frame.contentDocument;
      if (!d) return;
      d.querySelectorAll("[data-wk-on]").forEach((n) => n.removeAttribute("data-wk-on"));
      const n = wk != null && d.querySelector(`[data-wk="${wk}"]`);
      if (n) { n.setAttribute("data-wk-on", ""); if (n.scrollIntoView) n.scrollIntoView({ block: "nearest" }); }
    }
    function coach() {
      const out = $("#ws-coach");
      // What does this do? A plain explanation of the code at the cursor (no AI: a dictionary of HTML and CSS).
      if (tab === "html") {
        const v = ta.html.value, c = ta.html.selectionStart;
        const lt = v.lastIndexOf("<", c - 1 < 0 ? 0 : c - 1);
        const m = lt >= 0 && v.slice(lt, lt + 30).match(/^<\/?([a-zA-Z][a-zA-Z0-9]*)/);
        const tag = m && m[1].toLowerCase();
        const x = SE.webStudio.explain(v, c, "html");
        out.textContent = x ? `${x.title}: ${x.text}` : tag && TAG_COACH[tag] ? TAG_COACH[tag] : "";
        const here = map.filter((y) => y.start <= c).pop();
        outline(here ? here.i : null);
      } else if (ta.css) {
        const x = SE.webStudio.explain(ta.css.value, ta.css.selectionStart, "css");
        out.textContent = x ? `${x.title}: ${x.text}` : "";
      }
    }
    function readerView() {
      const list = $("#ws-reader-list"), d = frame.contentDocument;
      if (!list || !d) return;
      const items = readOut(d);
      list.innerHTML = items.length ? items.map((it, i) => `<li class="ws-reader__i ws-reader__i--${it.kind}" data-ri="${i}"><span>${esc(it.say)}</span>${it.wk != null ? `<button type="button" class="linkish" data-find="${it.wk}">Find it</button>` : ""}</li>`).join("")
        : `<li class="ws-reader__i">Your page has nothing to read yet.</li>`;
      const btn = el.querySelector('[data-read="ws-reader"]');
      if (btn) btn.onclick = () => SE.speech.read(btn, items.map((it, i) => ({ text: it.say.replace(/^• /, ""), el: list.querySelector(`[data-ri="${i}"]`) })));
    }
    function meter() {
      const box = $("#ws-meter"), d = frame.contentDocument;
      if (!box || !d || !d.body) return;
      const tc = WK.textContrast(d).filter((t) => t.ratio !== null).sort((x, y) => x.ratio - y.ratio);
      if (!tc.length) { box.innerHTML = ""; return; }
      const t = tc[0], okay = t.ratio >= 4.5;
      box.innerHTML = `<span class="ws-meter__sw" style="background:${esc(t.fg)}"></span><span>Text ${esc(WK.toHex(t.fg))}</span>
        <span class="ws-meter__sw" style="background:${esc(t.bg)}"></span><span>Background ${esc(WK.toHex(t.bg))}</span>
        <strong>${t.ratio} to 1</strong><span class="ws-meter__st ${okay ? "is-ok" : "is-bad"}">${icon(okay ? "check" : "alert")}${okay ? "Readable" : "Needs a fix"}</span>
        <span class="muted small">(lowest on the page)</span>`;
    }

    /* ───────── Color helper ───────── */
    function colors() {
      const box = $("#ws-colors");
      if (!box) return;
      const list = WK.cssColors(ta.css.value);
      box.innerHTML = list.length ? `<p class="ws-colors__h">Color helper: pick a color, and it changes in your code.</p>${list.map((c, i) => `
        <label class="ws-color"><input type="color" data-ci="${i}" value="${WK.toHex(c.value)}"><span><code>${esc(c.selector)}</code> ${esc(c.prop)}</span></label>`).join("")}`
        : `<p class="ws-colors__h">Color helper: write a color in your CSS, like <code>color: #213547;</code>, and a color picker for it shows up here.</p>`;
    }
    $("#ws-panel-css") && $("#ws-panel-css").addEventListener("change", (e) => {
      const inp = e.target.closest("[data-ci]");
      if (!inp) return;
      const item = WK.cssColors(ta.css.value)[Number(inp.dataset.ci)];
      if (!item) return;
      ta.css.setSelectionRange(item.start, item.end);
      typeAt(ta.css, inp.value);
      ta.css.setSelectionRange(item.start, item.start + inp.value.length);   // the changed value stays selected, so it's easy to see
      api.say(`Your CSS changed: ${item.selector} { ${item.prop}: ${inp.value}; }`, "info");
      colors();
    });

    /* ───────── Check my page ───────── */
    async function measureNarrow() {
      const box = $("#ws-framebox"), was = phone;
      box.classList.add("is-phone");
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const d = frame.contentDocument;
      const over = d ? d.documentElement.scrollWidth > d.documentElement.clientWidth + 1 : false;
      if (!was) box.classList.remove("is-phone");
      return over;
    }
    const STATE_TEXT = { good: "Looks good", fix: "Needs a fix", person: "Check with a person" };
    function showChecks(res, mode) {
      const need = S.checks.map((id) => ({ id, ...res.results[id] }));
      const fixes = need.filter((c) => c.state === "fix"), goods = need.filter((c) => c.state === "good"), persons = need.filter((c) => c.state === "person").map((c) => ({ msg: c.msg, wk: c.wk })).concat(res.person);
      // Alt text and link words: the student answers "Yes, it's clear" (stage 6 needs every one) or Change it (Find it).
      const ask = (c) => c.key && /^(alt|link):/.test(c.key)
        ? (confirmed[c.key] ? `<span class="ws-check__ok">${icon("check")}You checked this</span>`
          : `<span class="ws-check__ask"><button type="button" class="btn btn--ghost btn--small" data-ok="${esc(c.key)}">Yes, it's clear</button>${c.wk != null ? `<button type="button" class="linkish" data-find="${c.wk}">Change it</button>` : ""}</span>`)
        : (c.wk != null ? `<button type="button" class="linkish" data-find="${c.wk}">Find it</button>` : "");
      const item = (c, st, detail = true) => `<li class="ws-check ws-check--${st}">${icon(st === "good" ? "check" : st === "fix" ? "alert" : "users")}<span><strong>${STATE_TEXT[st]}${c.id ? `: ${esc(LABEL[c.id])}` : ""}.</strong> ${detail ? esc(c.msg) : ""}</span>${!detail ? "" : st === "person" ? ask(c) : c.wk != null ? `<button type="button" class="linkish" data-find="${c.wk}">Find it</button>` : ""}</li>`;
      // Every independent problem in this stage's checks, each with its own Find it (and keys that survive a re-check).
      lastIssues = (res.issues || []).filter((x) => S.checks.includes(x.check));
      let html = "";
      if (mode === "summary") {
        html = `<p class="ws-checks__h">Check found ${fixes.length} kind${fixes.length === 1 ? "" : "s"} of problem: ${fixes.map((c) => esc(LABEL[c.id])).join(", ")}. Press Show where they are to find each one.</p><ul class="ws-checklist">${fixes.map((c) => item(c, "fix", false)).join("")}</ul>`;
      } else {
        // What to do comes first: every problem, then person checks. Passed checks fold into one line while there's work left.
        const goodLine = `<li class="ws-check ws-check--good">${icon("check")}<span><strong>Looks good:</strong> ${goods.map((c) => esc(LABEL[c.id])).join(", ")}.</span></li>`;
        html = `${lastIssues.length ? `<p class="ws-checks__h">${lastIssues.length === 1 ? "1 thing needs a fix" : `${lastIssues.length} things need a fix`}:</p>${SE.webStudio.issueList(lastIssues)}` : ""}
          <ul class="ws-checklist">${persons.map((c) => item(c, "person")).join("")}${!goods.length ? "" : fixes.length || persons.length ? goodLine : goods.map((c) => item(c, "good")).join("")}</ul>`;
      }
      html += levelUp(res);
      $("#ws-checks").innerHTML = html;
    }
    const FIX_WORDS = { h1: "Marked the main heading with <h1>", alt: "Gave every picture alt text", link: "Made the link words say where they go", contrast: "Made the text readable (contrast 4.5 to 1 or more)" };
    async function check() {
      clearTimeout(timer); save(); render(); await ready;
      const d = frame.contentDocument;
      const narrowOverflow = S.checks.includes("narrow") ? await measureNarrow() : undefined;
      const ctx = { css: ta.css ? ta.css.value : work.css, narrowOverflow, viewedPhone: !!state.viewed[idx] };
      const res = checks(d, ctx);
      res.challenges = challenges(d, ctx);
      const failing = S.checks.filter((id) => res.results[id].state === "fix");
      // Notice accessibility fixes the student made (stages 6–8), for the finished-website screen.
      ["h1", "alt", "link", "contrast"].forEach((id) => {
        if (prev[id] === "fix" && res.results[id] && res.results[id].state === "good" && !state.fixes.includes(FIX_WORDS[id])) state.fixes.push(FIX_WORDS[id]);
        if (res.results[id]) prev[id] = res.results[id].state;
      });
      st.save(state);
      api.log("lab_test_run", { stage: idx, failing });   // check names only, never the code
      checks2++;
      const summary = S.source === "debug" && checks2 === 1 && failing.length;
      showChecks(res, summary ? "summary" : "full");
      // Stage 7 checks in steps: the button says what the next press does.
      $(".ws-check__label").textContent = summary ? "Show where they are" : "Check my page";
      const list = $("#ws-checks");
      if (list.scrollIntoView) list.scrollIntoView({ block: "nearest", behavior: "auto" });
      if (failing.length) {
        failed++;
        const names = failing.map((id) => LABEL[id]).join(", ");
        const n = lastIssues.length || failing.length;
        api.say(summary ? `This page has ${failing.length} kinds of problem. Press Show where they are to find each one.`
          : `${n === 1 ? "1 thing" : `${n} things`} to fix: ${names}. Each one has its own Find it.${failed >= 2 ? " Stuck? Press Show an Example, or Need a hint? under your goal." : ""}`, "warn");
        return;
      }
      const open = needsPeople ? res.person.filter((p) => p.key && /^(alt|link):/.test(p.key) && !confirmed[p.key]) : [];
      if (open.length) {
        if (!reader) setView("reader");
        api.say(`Your page passes the automatic checks. Now check with a person: read ${open.length === 1 ? "the item" : `the ${open.length} items`} marked Check with a person out loud, then press Yes, it's clear (or Change it).`, "info");
        return;
      }
      if (S.source === "ship") {
        shipReady = res;
        $("#ws-ship").hidden = false;
        api.say("Every check passed. When you're happy with it, press Finish my website. It stays on this device: it isn't published on the internet.", "good");
        return;
      }
      win(res);
    }
    function win(res) {
      const passed = S.checks.filter((id) => res.results[id].state === "good");
      if (S.source !== "ship") {
        api.say(CELEBRATE[idx] || "Stage complete!", "good");
        api.win({ checks: passed, business: b.id }, { extra: `<p class="ws-cheer">${icon("check")}${esc(CELEBRATE[idx])}</p>` });
        return;
      }
      const doc = WK.srcdoc(ta.html.value, { css: ta.css.value });
      const info = { award: "First Website Shipped", course: "Build Your First Website", detail: `A web page for ${b.name}, checked for structure, style, and access`, name: api.user && api.user.role === "student" ? api.user.displayName : "", className: api.user && api.user.cls ? api.user.cls.name : "", at: Date.now() };
      const extra = `<section class="ws-done" id="ws-done" aria-labelledby="ws-done-h">
        <h3 id="ws-done-h">${icon("rocket")}Your First Website Is Ready!</h3>
        <p class="ws-done__biz">My website: <strong>${esc(b.name)}</strong>. ${state.shipFrom === "project" ? "Started from my earlier page." : "Built from a blank page."}</p>
        <div class="ws-done__cols">
          <iframe class="ws-done__frame" title="Your finished website" sandbox srcdoc="${esc(doc)}"></iframe>
          <div>
            <h4>Checks that passed</h4>
            <ul class="ws-checklist">${passed.map((id) => `<li class="ws-check ws-check--good">${icon("check")}<span><strong>${esc(LABEL[id])}.</strong> ${esc(res.results[id].msg)}</span></li>`).join("")}</ul>
            ${state.fixes.length ? `<h4>Accessibility fixes you made</h4><ul class="ws-fixes">${state.fixes.map((f) => `<li>${icon("users")}${esc(f)}</li>`).join("")}</ul>` : ""}
          </div>
        </div>
        <h4>Think about it</h4>
        <ol class="ws-reflect"><li>What does your website help people do?</li><li>What was the hardest part of building it?</li><li>What changed after you tested your design?</li><li>How did you make your website easier for more people to use?</li></ol>
        <p>Answer these in the activity debrief, or show your teacher your page.</p>
        <div class="ws-done__actions">
          ${SE.certificate ? SE.certificate.button(info, "Print my certificate") : ""}
          <button type="button" class="btn btn--ghost" id="ws-copy">${icon("clipboard")}Copy my HTML and CSS</button>
          <button type="button" class="btn btn--ghost" id="ws-print">${icon("print")}Print my project summary</button>
        </div>
      </section>`;
      api.say("Your website passed every check. It's ready for review!", "good");
      api.win({ checks: passed, business: b.id, fixes: state.fixes.length, from: state.shipFrom === "project" ? "project" : "blank" }, { extra, title: "Ship Your First Website: complete!" });
      const copy = document.getElementById("ws-copy");
      if (copy) copy.addEventListener("click", () => {
        const text = exportPage(ta.html.value, ta.css.value, b.name);
        const no = () => api.say("Your browser didn't allow copying. Print your project summary instead.", "warn");
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => api.say("Copied your HTML and CSS.", "good"), no); else no();
      });
      const pr = document.getElementById("ws-print");
      if (pr) pr.addEventListener("click", () => { document.body.classList.add("ws-printing"); window.print(); setTimeout(() => document.body.classList.remove("ws-printing"), 500); });
    }

    /* ───────── Events ───────── */
    function showTab(t) {
      if (t === "css" && !ta.css) return;
      tab = t;
      ["html", "css"].forEach((k) => {
        const tb = $(`#ws-tab-${k}`), pn = $(`#ws-panel-${k}`);
        if (tb) tb.setAttribute("aria-selected", String(k === t));
        if (pn) pn.hidden = k !== t;
      });
      if (t === "css") colors();
      coach();
    }
    el.querySelectorAll("[role=tab]").forEach((t) => t.addEventListener("click", () => { showTab(t.id.replace("ws-tab-", "")); ta[tab].focus(); }));
    const tabs = $(".ws-tabs");
    tabs.addEventListener("keydown", (e) => {
      if (!ta.css || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
      showTab(tab === "html" ? "css" : "html"); $(`#ws-tab-${tab}`).focus();
    });
    Object.values(ta).forEach((area) => area && area.addEventListener("input", () => {
      save(); clearTimeout(timer); timer = setTimeout(() => { render(); if (area === ta.css) colors(); }, 300);
      confirmReset = false; $("#ws-reset").textContent = "Start over";
      if (shipReady) { shipReady = null; $("#ws-ship").hidden = true; }   // an edit means checking again
    }));
    Object.values(ta).forEach((area) => area && ["click", "keyup"].forEach((ev) => area.addEventListener(ev, coach)));
    el.querySelectorAll("[data-tag]").forEach((bt) => bt.addEventListener("click", () => shelf(bt.dataset.tag)));
    $("#ws-check").addEventListener("click", check);
    $("#ws-undo").addEventListener("click", () => { ta[tab].focus(); document.execCommand("undo"); });
    $("#ws-redo").addEventListener("click", () => { ta[tab].focus(); document.execCommand("redo"); });
    $("#ws-checks").addEventListener("click", (e) => {
      const iss = e.target.closest("[data-issue]");
      if (iss) { findIssue(iss.dataset.issue); return; }
      const hb = e.target.closest("[data-hint]");
      if (hb) { const h = hb.closest(".wsi__i").querySelector(".wsi__hint"); h.hidden = !h.hidden; hb.setAttribute("aria-expanded", String(!h.hidden)); hb.textContent = h.hidden ? "Show me a hint" : "Hide the hint"; return; }
      const f = e.target.closest("[data-find]");
      if (f) { findCode(f.dataset.find); return; }
      const ok = e.target.closest("[data-ok]");
      if (ok) { confirmed[ok.dataset.ok] = true; st.save(state); api.log("lab_test_run", { stage: idx, confirmed: true }); check(); }
    });
    $("#ws-reader").addEventListener("click", (e) => { const f = e.target.closest("[data-find]"); if (f) findCode(f.dataset.find); });
    if (S.source === "ship") $("#ws-ship").addEventListener("click", () => { if (shipReady) win(shipReady); });
    const start = $("#ws-start");
    if (start) start.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      if (btn.id === "ws-start-mine") {
        ta.html.value = state.project.html; if (ta.css) ta.css.value = state.project.css || "";
        state.snap[idx] = { html: ta.html.value, css: ta.css ? ta.css.value : "" };
        state.shipFrom = "project";
        api.say("Your page from stages 2 to 6 is in the editor. Improve it, check it, and ship it.", "info");
      } else {
        state.shipFrom = "blank";
        api.say("Blank page: build it your way. Show my earlier page lets you look back.", "info");
      }
      save(); render(); colors(); refreshEditors(); start.remove(); ta.html.focus();
    });
    $("#ws-reset").addEventListener("click", (e) => {
      if (!confirmReset) { confirmReset = true; e.currentTarget.textContent = "Yes, start over"; api.say("This puts your code back the way it was when you started this stage. Press again to do it.", "info"); return; }
      const snap = state.snap[idx];
      ta.html.value = snap.html; if (ta.css) ta.css.value = snap.css;
      save(); render(); colors(); refreshEditors(); confirmReset = false; e.currentTarget.textContent = "Start over";
      api.say("Your code is back to the start of this stage.", "info");
    });
    /* Show an Example: always here. A working example and the website it makes, side by side. It never goes into
       the student's code by itself: Insert a starter at my cursor says what it adds and asks first. */
    $("#ws-example").addEventListener("click", () => {
      const e = exampleFor(idx, b);
      api.log("lab_example", { stage: idx });
      SE.webStudio.showExample({
        title: `Show an Example: ${S.concept}`, html: e.html, css: e.css, notes: e.notes, snippet: e.snippet, snippetLang: e.snippetLang,
        onInsert(text, lang) {
          const area = lang === "css" && ta.css ? ta.css : ta.html;
          showTab(area === ta.css ? "css" : "html");
          const before = area.value.slice(0, area.selectionStart);
          typeAt(area, (before && !before.endsWith("\n") ? "\n" : "") + text + "\n");
          api.say("The starter is in your code at the cursor. Change the words to make it yours.", "info");
        }
      });
    });
    $("#ws-tags").addEventListener("click", () => SE.webStudio.tagExplorer({ lessonOf: (t) => TAG_LESSON[t] || "" }));
    const earlier = $("#ws-earlier");
    if (earlier) earlier.addEventListener("click", () => { const p = $("#ws-earlier-code"); p.hidden = !p.hidden; earlier.setAttribute("aria-expanded", String(!p.hidden)); });
    /* The preview: Desktop, Phone, or the Screen reader view (the page still renders behind it, for checks). */
    function setView(v) {
      phone = v === "phone"; reader = v === "reader";
      $("#ws-framebox").classList.toggle("is-phone", phone);
      $("#ws-framebox").classList.toggle("is-behind", reader);
      $("#ws-reader").hidden = !reader;
      $("#ws-findhelp").hidden = reader;
      $("#ws-desk").setAttribute("aria-pressed", String(v === "desk"));
      $("#ws-phone").setAttribute("aria-pressed", String(phone));
      $("#ws-sr").setAttribute("aria-pressed", String(reader));
      if (phone) { state.viewed[idx] = true; st.save(state); }
      if (reader) readerView(); else SE.speech.stop();
    }
    $("#ws-desk").addEventListener("click", () => setView("desk"));
    $("#ws-phone").addEventListener("click", () => setView("phone"));
    $("#ws-sr").addEventListener("click", () => setView(reader ? "desk" : "reader"));

    render();
    if (S.cssFirst) showTab("css");   // a stage about CSS opens on the CSS tab
    if (S.source === "debug") api.say("Another developer left this page with four problems. Press Check my page to start investigating.", "info");
    return () => { clearTimeout(timer); SE.speech.stop(); };
  }

  /* The student's page as one HTML file to copy: the same allowlist, pictures named (not embedded), no outside requests. */
  function exportPage(html, css, title) {
    const safeCss = String(css).replace(/url\s*\(/gi, "url-off(").replace(/@import/gi, "@import-off");
    return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>${esc(title)}</title>\n<style>\n${safeCss}\n</style>\n</head>\n<body>\n${WK.sanitize(html).trim()}\n</body>\n</html>\n`;
  }

  const GOALS = {
    "Plan before you code": ["Plan a web page on paper and test it with a real person.", "Changing a sketch takes seconds. Changing finished code takes hours."],
    "HTML structure": ["Write HTML tags that give a page its structure.", "Every website is built from HTML. It tells browsers and screen readers what each part means."],
    "Paragraphs and lists": ["Use paragraphs, lists, and section headings to organize information.", "Clear structure helps everyone find what they need on a page."],
    "Links and images": ["Add a picture with alt text, and a link with clear words.", "Alt text and clear links are how pages work for people who can't see the screen."],
    "CSS": ["Write CSS rules: a selector, properties, and values.", "CSS controls how every website looks, from your school's page to a store's."],
    "Accessibility": ["Check and fix headings, alt text, links, and color contrast.", "About 1 in 4 adults has a disability. Accessible pages work for everyone."],
    "Debugging": ["Find and fix four bugs using a checklist.", "Web teams test every page before it goes live."],
    "Create": ["Build, check, and ship a complete web page of your own.", "This is how web developers work: plan, build, test, fix, and ship."]
  };
  SE.labs.goals(STAGES, STAGES.map((s) => GOALS[s.concept]));
  SE.labs.register({
    id: LAB,
    area: "coding",
    title: "Build Your First Website",
    tagline: "Launch your first website: plan it, code it in real HTML and CSS, test it, and finish a web page about an idea of your own.",
    levels: STAGES,
    briefFirst: true,
    chapters: [
      { title: "Plan", short: "Plan", from: 0, to: 0, blurb: "Plan your own website: the idea, the words, the look, and the order of its sections." },
      { title: "Build", short: "Build", from: 1, to: 3, blurb: "Real HTML: headings, paragraphs, lists, pictures, and links." },
      { title: "Style and access", short: "Style", from: 4, to: 5, blurb: "CSS for how it looks, and checks so it works for everyone." },
      { title: "Debug and ship", short: "Ship", from: 6, to: 7, blurb: "Fix a broken website, then build and ship your own." }
    ],
    mount: (el, idx, api) => (STAGES[idx].kind === "plan" ? mountPlan(el, idx, api) : mountCode(el, idx, api))
  });
  SE.website = { checks, challenges, readOut, TAGS, STAGES, BUSINESSES, exportPage, seed };
})();
