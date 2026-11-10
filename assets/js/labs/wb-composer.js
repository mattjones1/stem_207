/*
 * STEM 207 Website Builder — the rule-based builder (pure; no AI, no network, no DOM).
 * It turns a student's interview answers into a real, readable index.html (the body) and styles.css. It reads the
 * student's own words with keyword lists, picks layouts and a style theme by rules, and uses only built-in pictures.
 * It never invents facts: where the student didn't say something, it leaves a clear placeholder to fill in.
 *
 *   SE.wbComposer.build(answers) → { v: 1, title, html, css, sections: [{ id, title, kind }], concepts: [..],
 *                                     explanation: [..], notes: [..] }
 *   answers: { kind, idea, name, sections: [{ id, more }], style, color, special, audience }
 *     kind      gaming | sports | animals | hobby | business | club | portfolio | other
 *     sections  ids: welcome | pictures | facts | cards | favorites | about | business | links
 *     style     futuristic | bright | dark | nature | minimal | sports | retro | custom (uses color)
 *     special   hero | cards | colors | layout | gallery | title
 *     audience  friends | students | learners | fans | visitors | everyone
 *   SE.wbComposer.contrast(a, b), fixContrast(fg, bg, min): hex colors, WCAG 2
 *   SE.wbComposer.THEMES, KINDS, SECTION_INFO: the choices the interview offers
 * The same answers always give the same website (choices that vary use a seed from the name).
 */
(function () {
  "use strict";
  const SE = (window.SE = window.SE || {});

  /* ───────── Colors (WCAG 2 contrast on hex colors) ───────── */
  const hex = (h) => { let s = String(h || "").replace("#", ""); if (s.length === 3) s = s.split("").map((c) => c + c).join(""); const n = parseInt(s.slice(0, 6), 16); return isNaN(n) ? [0, 0, 0] : [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const toHex = (rgb) => "#" + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const lum = (h) => { const [r, g, b] = hex(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));
  /* Move fg toward black or white (whichever helps) until it reaches min contrast on bg. */
  function fixContrast(fg, bg, min = 4.5) {
    if (contrast(fg, bg) >= min) return fg;
    const toward = lum(bg) > 0.18 ? "#000000" : "#ffffff";
    for (let t = 0.1; t <= 1.001; t += 0.1) { const c = mix(fg, toward, t); if (contrast(c, bg) >= min) return c; }
    return toward;
  }

  /* ───────── The choices ───────── */
  const KINDS = {
    gaming: { label: "Gaming", pic: "game-controller.svg" }, sports: { label: "Sports", pic: "soccer.svg" },
    animals: { label: "Animals or wildlife", pic: "moose.svg" }, hobby: { label: "A hobby", pic: "paintbrush.svg" },
    business: { label: "A made-up business", pic: "lighthouse.svg" }, club: { label: "A club or community", pic: "tree.svg" },
    portfolio: { label: "A portfolio of my creations", pic: "paintbrush.svg" }, other: { label: "Something totally different", pic: "lightbulb.svg" }
  };
  const SECTION_INFO = {
    welcome: { title: "Welcome", label: "A big welcome message" }, pictures: { title: "Pictures", label: "Pictures" },
    facts: { title: "Fun facts", label: "Fun facts" }, cards: { title: "Highlights", label: "Information cards" },
    favorites: { title: "My favorites", label: "A list of favorite things" }, about: { title: "About", label: "An About section" },
    business: { title: "What we do", label: "A made-up business description" }, links: { title: "Explore", label: "Useful links around the page" }
  };
  // Each theme: background, panel, text, accent, hero background and text, fonts, corner radius, shadow, and how the header looks.
  const THEMES = {
    futuristic: { label: "Futuristic and high-tech", bg: "#0b1020", panel: "#141b33", text: "#e6ecff", accent: "#5ee7ff", hero: "#1b2350", heroText: "#ffffff", font: "\"Segoe UI\", system-ui, sans-serif", head: "\"Trebuchet MS\", \"Segoe UI\", sans-serif", radius: "14px", shadow: "0 0 18px rgba(94, 231, 255, 0.35)", upper: true },
    bright: { label: "Bright and colorful", bg: "#fffaf0", panel: "#ffffff", text: "#2b2140", accent: "#e8457c", hero: "#ffd84d", heroText: "#2b2140", font: "Verdana, system-ui, sans-serif", head: "\"Arial Rounded MT Bold\", Verdana, sans-serif", radius: "18px", shadow: "0 6px 0 rgba(43, 33, 64, 0.15)" },
    dark: { label: "Dark and mysterious", bg: "#121014", panel: "#1e1a22", text: "#ece6f2", accent: "#b48cff", hero: "#2a2133", heroText: "#f5efff", font: "Georgia, serif", head: "Georgia, serif", radius: "6px", shadow: "0 8px 24px rgba(0, 0, 0, 0.5)" },
    nature: { label: "Nature-inspired", bg: "#f3f7ee", panel: "#ffffff", text: "#1f3324", accent: "#2f6b3a", hero: "#2f5d3a", heroText: "#ffffff", font: "Georgia, serif", head: "Georgia, serif", radius: "10px", shadow: "0 4px 12px rgba(31, 51, 36, 0.15)" },
    minimal: { label: "Clean and minimal", bg: "#ffffff", panel: "#f5f5f5", text: "#1d1d1f", accent: "#0b57d0", hero: "#ffffff", heroText: "#1d1d1f", font: "system-ui, \"Segoe UI\", sans-serif", head: "system-ui, \"Segoe UI\", sans-serif", radius: "4px", shadow: "none" },
    sports: { label: "Sports-inspired", bg: "#f2f5fa", panel: "#ffffff", text: "#13213c", accent: "#d62828", hero: "#13213c", heroText: "#ffffff", font: "Arial, system-ui, sans-serif", head: "Impact, \"Arial Black\", sans-serif", radius: "8px", shadow: "0 4px 0 #13213c", upper: true },
    retro: { label: "Retro gaming", bg: "#1a1033", panel: "#26174a", text: "#f8f3ff", accent: "#ffd23f", hero: "#3b1f74", heroText: "#ffd23f", font: "\"Courier New\", monospace", head: "\"Courier New\", monospace", radius: "0", shadow: "6px 6px 0 #000000", upper: true },
    custom: { label: "My own style", bg: "#ffffff", panel: "#f7f7f7", text: "#1d2426", accent: "#145b72", hero: "#145b72", heroText: "#ffffff", font: "system-ui, sans-serif", head: "system-ui, sans-serif", radius: "10px", shadow: "0 4px 12px rgba(0, 0, 0, 0.12)" }
  };
  const SPECIALS = { hero: "A bold hero section", cards: "Cool cards", colors: "An awesome color combination", layout: "A creative layout", gallery: "A gallery", title: "A unique title design" };
  const AUDIENCES = { friends: "Friends", students: "Other students", learners: "People learning about a topic", fans: "Fans of a hobby", visitors: "Visitors to a made-up business", everyone: "Everyone" };

  /* ───────── Reading the student's words ───────── */
  const textEsc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const attrEsc = (s) => textEsc(s).replace(/"/g, "&quot;");
  const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
  const sentence = (s) => { const t = clean(s); if (!t) return ""; const u = t[0].toUpperCase() + t.slice(1); return /[.!?]$/.test(u) ? u : `${u}.`; };
  const cap = (s) => { const t = clean(s); return t ? t[0].toUpperCase() + t.slice(1) : ""; };
  /* "hiking, kayaking and camping" → ["Hiking", "Kayaking", "Camping"] */
  const listFrom = (s) => clean(s).replace(/\.$/, "").split(/\s*(?:,|;|\band\b|\bor\b|\n)\s*/i).map(cap).filter((x) => x && x.length <= 60).slice(0, 6);
  /* "I want a website about…" → "A website about…": a gentle tidy-up of the student's sentence, never new facts. */
  const tidyIdea = (s) => sentence(clean(s).replace(/^(i want|i'd like|i would like|i wanna)\s+(to make\s+)?(a|an)\s+/i, "A ").replace(/^my (website|site|page) (is|will be)\s+/i, ""));
  const words = (s) => (String(s || "").toLowerCase().match(/[a-z]+/g) || []);
  function picturesFor(text, kind) {
    const info = (SE.webKit && SE.webKit.PICTURE_INFO) || {};
    const w = new Set(words(text));
    const scored = Object.keys(info).map((k) => ({ k, n: info[k][1].split(" ").filter((x) => w.has(x)).length })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n || a.k.localeCompare(b.k));
    const picks = scored.map((x) => x.k);
    const fallback = (KINDS[kind] || KINDS.other).pic;
    if (!picks.includes(fallback)) picks.push(fallback);
    return picks.slice(0, 4);
  }
  const altFor = (pic) => ((SE.webKit && SE.webKit.PICTURE_INFO && SE.webKit.PICTURE_INFO[pic]) || ["A picture"])[0];
  const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

  /* ───────── Building ───────── */
  function build(a) {
    const kind = KINDS[a.kind] ? a.kind : "other";
    const style = THEMES[a.style] ? a.style : "custom";
    const name = clean(a.name).slice(0, 60) || "My Website";
    const idea = tidyIdea(a.idea).slice(0, 300) || `A website about ${KINDS[kind].label.toLowerCase()}.`;
    const chosen = (a.sections && a.sections.length ? a.sections : [{ id: "welcome" }, { id: "about" }, { id: "favorites" }]).filter((s) => SECTION_INFO[s.id]);
    const more = (id) => clean((chosen.find((s) => s.id === id) || {}).more);
    const allText = [a.idea, ...chosen.map((s) => s.more)].join(" ");
    const pics = picturesFor(allText, kind);
    const seed = hash(`${name}|${kind}|${style}`);
    const special = SPECIALS[a.special] ? a.special : "";

    // Colors: the theme, or the student's own color; every text pair is pushed to 4.5 to 1 or more.
    const T = Object.assign({}, THEMES[style]);
    if (style === "custom" && /^#[0-9a-f]{6}$/i.test(a.color || "")) { T.accent = a.color; T.hero = a.color; T.bg = mix(a.color, "#ffffff", 0.93); T.panel = "#ffffff"; }
    if (special === "colors") { T.hero = mix(T.accent, T.hero, 0.35); }
    T.text = fixContrast(T.text, T.bg); T.panelText = fixContrast(T.text, T.panel);
    T.heroText = fixContrast(T.heroText, T.hero);
    T.link = fixContrast(T.accent, T.bg); T.panelLink = fixContrast(T.accent, T.panel);
    T.button = T.accent; T.buttonText = fixContrast(lum(T.accent) > 0.4 ? "#111111" : "#ffffff", T.accent);
    const big = a.audience === "friends" || a.audience === "students" ? "1.15rem" : "1.05rem";

    // Layout choices: driven by the answers, with a seeded pick where the student didn't say.
    const heroLayout = special === "hero" ? "banner" : special === "title" ? "centered" : ["centered", "split", "banner"][seed % 3];
    const ids = [];
    const idOf = (title) => { let id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "part"; while (ids.includes(id)) id += "-2"; ids.push(id); return id; };
    const sections = [];
    const H = [];   // HTML lines
    const ind = (n, s) => "  ".repeat(n) + s;
    const placeholder = (what) => [ind(3, `<!-- Add your own ${what} here -->`), ind(3, `<p>Write your ${what} here.</p>`)];

    const bodySections = chosen.filter((s) => s.id !== "welcome" && s.id !== "links");
    // Header and menu
    H.push("<!-- The header: your website's name and its menu -->", "<header class=\"site-header\">", ind(1, `<p class="site-name">${textEsc(name)}</p>`));
    const navTargets = bodySections.map((s) => ({ s, title: SECTION_INFO[s.id].title }));
    navTargets.forEach((n) => { n.id = idOf(n.title); });
    if (navTargets.length) {
      H.push(ind(1, "<nav class=\"site-menu\">"));
      navTargets.forEach((n) => H.push(ind(2, `<a href="#${n.id}">${textEsc(n.title)}</a>`)));
      H.push(ind(1, "</nav>"));
    }
    H.push("</header>", "");
    // Main: the hero, then each section
    H.push("<main>");
    H.push(ind(1, "<!-- The hero: the first thing visitors see -->"), ind(1, `<section class="hero hero--${heroLayout}">`));
    const heroText = [ind(2, `<h1>${textEsc(name)}</h1>`), ind(2, `<p class="tagline">${textEsc(chosen.some((s) => s.id === "welcome") && more("welcome") ? sentence(more("welcome")) : idea)}</p>`)];
    if (heroLayout === "split") { H.push(ind(2, "<div class=\"hero-words\">"), ...heroText.map((l) => "  " + l), ind(2, "</div>"), ind(2, `<img src="${pics[0]}" alt="${attrEsc(altFor(pics[0]))}">`)); }
    else { H.push(...heroText); if (heroLayout === "banner") H.push(ind(2, `<img class="hero-pic" src="${pics[0]}" alt="${attrEsc(altFor(pics[0]))}">`)); }
    if (navTargets.length) H.push(ind(2, `<a class="button" href="#${navTargets[0].id}">Start with ${textEsc(navTargets[0].title.toLowerCase())}</a>`));
    H.push(ind(1, "</section>"));
    sections.push({ id: "hero", title: name, kind: "hero" });

    navTargets.forEach((n, k) => {
      const s = n.s, m = more(s.id), id = n.id;
      H.push("", ind(1, `<!-- ${SECTION_INFO[s.id].label} -->`));
      const layout = s.id === "pictures" || (special === "gallery" && s.id === "about") ? "gallery" : s.id === "cards" || (special === "cards" && s.id === "favorites") ? "cards" : s.id;
      H.push(ind(1, `<section id="${id}" class="part part--${layout}${special === "layout" && k % 2 ? " part--flip" : ""}">`), ind(2, `<h2>${textEsc(n.title)}</h2>`));
      const items = listFrom(m);
      if (layout === "gallery") {
        H.push(ind(2, "<div class=\"gallery\">"));
        pics.slice(0, 3).forEach((p) => H.push(ind(3, "<figure>"), ind(4, `<img src="${p}" alt="${attrEsc(altFor(p))}">`), ind(4, `<figcaption>${textEsc(altFor(p))}</figcaption>`), ind(3, "</figure>")));
        H.push(ind(2, "</div>"));
        if (m && !items.length) H.push(ind(2, `<p>${textEsc(sentence(m))}</p>`));
      } else if (layout === "cards") {
        const cards = items.length >= 2 ? items : ["First highlight", "Second highlight", "Third highlight"];
        H.push(ind(2, "<div class=\"cards\">"));
        cards.slice(0, 4).forEach((c) => H.push(ind(3, "<article class=\"card\">"), ind(4, `<h3>${textEsc(c)}</h3>`), ind(4, `<p>Write one sentence about ${textEsc(c.toLowerCase())}.</p>`), ind(3, "</article>")));
        H.push(ind(2, "</div>"));
      } else if (s.id === "favorites") {
        const list = items.length >= 2 ? items : ["My first favorite", "My second favorite", "My third favorite"];
        H.push(ind(2, "<ul class=\"list\">"), ...list.map((x) => ind(3, `<li>${textEsc(x)}</li>`)), ind(2, "</ul>"));
      } else if (s.id === "facts") {
        const facts = m ? m.split(/(?<=[.!?])\s+/).map(sentence).filter(Boolean) : [];
        H.push(ind(2, "<ul class=\"facts\">"));
        if (facts.length) facts.slice(0, 5).forEach((f) => H.push(ind(3, `<li>${textEsc(f)}</li>`)));
        else H.push(ind(3, "<!-- Add your own fun facts here: one <li> for each -->"), ind(3, "<li>Your first fun fact goes here.</li>"), ind(3, "<li>Your second fun fact goes here.</li>"));
        H.push(ind(2, "</ul>"));
      } else if (s.id === "about") {
        H.push(ind(2, "<div class=\"two-col\">"), ind(3, `<img src="${pics[1] || pics[0]}" alt="${attrEsc(altFor(pics[1] || pics[0]))}">`));
        if (m) H.push(ind(3, `<p>${textEsc(sentence(m))}</p>`)); else H.push(...placeholder("About words"));
        H.push(ind(2, "</div>"));
      } else if (s.id === "business") {
        H.push(ind(2, `<p class="callout">${m ? textEsc(sentence(m)) : "Describe what your made-up business does. (No real addresses or phone numbers.)"}</p>`));
      }
      H.push(ind(1, "</section>"));
      sections.push({ id, title: n.title, kind: s.id });
    });
    H.push("</main>", "", "<!-- The footer: the bottom of every page -->", "<footer class=\"site-footer\">",
      ind(1, `<p>${textEsc(name)} · Made by a STEM 207 student${a.audience && AUDIENCES[a.audience] ? ` for ${textEsc(AUDIENCES[a.audience].toLowerCase())}` : ""}.</p>`));
    if (chosen.some((s) => s.id === "links") && navTargets.length) H.push(ind(1, `<p><a href="#${navTargets[0].id}">Back to ${textEsc(navTargets[0].title.toLowerCase())}</a></p>`));
    H.push("</footer>");
    const html = H.join("\n") + "\n";

    // CSS, in the order a student reads the page
    const C = [];
    C.push("/* The whole page: background, text color, and font */", "body {", `  margin: 0;`, `  background-color: ${T.bg};`, `  color: ${T.text};`, `  font-family: ${T.font};`, `  font-size: ${big};`, "  line-height: 1.6;", "}", "");
    C.push("/* Headings use the title font */", "h1, h2, h3 {", `  font-family: ${T.head};`, "  line-height: 1.2;", ...(T.upper ? ["  letter-spacing: 0.04em;"] : []), "}", "");
    C.push("img {", "  max-width: 100%;", "  height: auto;", `  border-radius: ${T.radius};`, "}", "");
    C.push("a {", `  color: ${T.link};`, "}", "");
    C.push("/* The header and menu */", ".site-header {", "  display: flex;", "  flex-wrap: wrap;", "  align-items: center;", "  justify-content: space-between;", "  gap: 1rem;", "  padding: 1rem 1.5rem;", `  background-color: ${T.panel};`, `  color: ${T.panelText};`, "}", "");
    C.push(".site-name {", "  margin: 0;", "  font-weight: bold;", "  font-size: 1.2rem;", "}", "");
    C.push(".site-menu {", "  display: flex;", "  flex-wrap: wrap;", "  gap: 1rem;", "}", "", ".site-menu a {", `  color: ${T.panelLink};`, "  font-weight: bold;", "}", "");
    C.push("/* The hero */", ".hero {", "  padding: 3rem 1.5rem;", `  background-color: ${T.hero};`, `  color: ${T.heroText};`, "}", "");
    C.push(".hero h1 {", `  font-size: ${special === "title" ? "3.4rem" : "2.6rem"};`, "  margin: 0 0 0.5rem;", ...(special === "title" ? [`  text-shadow: 3px 3px 0 ${mix(T.hero, "#000000", 0.4)};`] : []), ...(T.upper ? ["  text-transform: uppercase;"] : []), "}", "");
    C.push(".tagline {", "  font-size: 1.25rem;", "  max-width: 40rem;", "}", "");
    if (heroLayout === "centered") C.push(".hero--centered {", "  text-align: center;", "}", "", ".hero--centered .tagline {", "  margin: 0 auto 1.5rem;", "}", "");
    if (heroLayout === "split") C.push("/* Words on one side, a picture on the other (they stack on a phone) */", ".hero--split {", "  display: grid;", "  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));", "  gap: 2rem;", "  align-items: center;", "}", "");
    if (heroLayout === "banner") C.push(".hero--banner .hero-pic {", "  display: block;", "  width: 100%;", "  max-width: 28rem;", "  margin: 1.5rem 0;", "}", "");
    C.push(".button {", "  display: inline-block;", "  padding: 0.7rem 1.2rem;", `  border-radius: ${T.radius};`, `  background-color: ${T.button};`, `  color: ${T.buttonText};`, "  font-weight: bold;", "  text-decoration: none;", `  box-shadow: ${T.shadow};`, "}", "");
    C.push("/* Each part of the page */", ".part {", "  max-width: 60rem;", "  margin: 0 auto;", "  padding: 2rem 1.5rem;", "}", "");
    const used = new Set(sections.map((s) => s.kind));
    if (navTargets.some((n) => n.s.id === "pictures") || (special === "gallery" && used.has("about"))) C.push("/* A gallery: as many columns as fit */", ".gallery {", "  display: grid;", "  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));", "  gap: 1rem;", "}", "", "figure {", "  margin: 0;", "}", "");
    if (navTargets.some((n) => n.s.id === "cards" || (special === "cards" && n.s.id === "favorites"))) C.push("/* Cards in a grid */", ".cards {", "  display: grid;", "  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));", "  gap: 1rem;", "}", "", ".card {", "  padding: 1rem;", `  border-radius: ${T.radius};`, `  background-color: ${T.panel};`, `  color: ${T.panelText};`, `  box-shadow: ${T.shadow};`, "}", "");
    if (used.has("about")) C.push("/* Picture and words side by side (they stack on a phone) */", ".two-col {", "  display: grid;", "  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));", "  gap: 1.5rem;", "  align-items: center;", "}", "");
    if (used.has("facts")) C.push(".facts li {", "  margin-bottom: 0.5rem;", "}", "");
    if (used.has("business")) C.push(".callout {", "  padding: 1rem 1.25rem;", `  border-left: 6px solid ${T.accent};`, `  background-color: ${T.panel};`, `  color: ${T.panelText};`, "}", "");
    if (special === "layout") C.push("/* A creative layout: every other part leans the other way */", ".part--flip {", "  text-align: right;", "}", "");
    C.push("/* The footer */", ".site-footer {", "  padding: 1.5rem;", "  text-align: center;", `  background-color: ${T.panel};`, `  color: ${T.panelText};`, "}", "", ".site-footer a {", `  color: ${T.panelLink};`, "}");
    const css = C.join("\n").replace(/\n{3,}/g, "\n\n") + "\n";

    const concepts = ["header, nav, main, section, footer (semantic HTML)", "one <h1> and <h2> headings", "links that jump to an id", "pictures with alt text"]
      .concat(used.has("cards") || navTargets.some((n) => n.s.id === "cards") ? ["a CSS grid for cards"] : [], heroLayout === "split" ? ["a two-column hero with CSS grid"] : [], ["CSS colors, fonts, and spacing"]);
    const explanation = [
      `The builder made a ${THEMES[style].label.toLowerCase()} website called "${name}".`,
      `It used your words for the headline${chosen.some((s) => more(s.id)) ? " and your sections" : ""}, and picked pictures that match: ${pics.slice(0, 3).join(", ")}.`,
      `It has ${navTargets.length} section${navTargets.length === 1 ? "" : "s"} after the hero, with a menu that jumps to each one.`,
      "Anything it couldn't know from your answers is a placeholder for you to fill in."
    ];
    const notes = [];
    if (/<|>/.test(String(a.idea || "") + String(a.name || ""))) notes.push("Some of your words had < or > in them. The builder shows them as text, not code.");
    return { v: 1, title: name, html, css, sections, concepts, explanation, notes, pictures: pics.slice(0, 3), theme: style, hero: heroLayout };
  }

  SE.wbComposer = { build, contrast, fixContrast, THEMES, KINDS, SECTION_INFO, SPECIALS, AUDIENCES, listFrom };
})();
