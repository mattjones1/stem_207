/*
 * STEM 207 — the web kit, shared by the Web Builder Lab (lab-web.js) and Build Your First Website (lab-website.js).
 * The safe preview, the built-in pictures, and the page-reading tools a checker needs.
 *
 *   SE.webKit.PICTURES                 the only pictures a page can use (inline SVG, no outside request)
 *   SE.webKit.PICTURE_INFO             each picture's description (for alt text) and words that point to it
 *   SE.webKit.srcdoc(code, opts)       the preview document. Layers, outside to inside:
 *        1. the iframe itself: sandbox without allow-scripts (no scripts, forms, popups, or navigation)
 *        2. a Content-Security-Policy: default-src 'none'; img-src data:; style-src 'unsafe-inline'
 *        3. sanitize(): a DOM allowlist of elements and attributes (when the browser's DOMParser is there)
 *        4. defuse(): anything that could still fetch (src, srcset, url(), @import) is rewritten
 *      opts.css: CSS kept separately (put in a <style>); opts.map: tag each opening tag for "Find it"
 *      opts.head: extra trusted markup for <head> (the lab's own styles); opts.title: the page's <title>
 *   SE.webKit.contrast(a, b)           WCAG 2 contrast ratio of two CSS rgb() colors, rounded to 0.1
 *   SE.webKit.summarize(doc)           what a rendered page has (Web Builder's checker reads this)
 *   SE.webKit.textContrast(doc)        contrast of every element with its own text, against the nearest
 *                                      opaque background up the tree; null where it can't be measured
 *   SE.webKit.cssColors(css) / setCssColor(css, item, hex)   the colors in a style sheet, for a color helper
 * Pure where it can be. Student code is never logged by these tools.
 */
(function () {
  "use strict";
  const SE = (window.SE = window.SE || {});

  /* ───────── Pictures: drawn as SVG so they work offline and need no outside request ───────── */
  const svg = (body) => "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">${body}</svg>`);
  const PICTURES = {
    "lighthouse.svg": svg(`<rect width="160" height="120" fill="#cde8f2"/><rect y="92" width="160" height="28" fill="#03968f"/><polygon points="68,92 92,92 86,34 74,34" fill="#f7f6f0" stroke="#012d2b" stroke-width="2"/><rect x="74" y="50" width="12" height="8" fill="#c0392b"/><rect x="74" y="70" width="12" height="8" fill="#c0392b"/><rect x="72" y="22" width="16" height="12" fill="#f4d35e" stroke="#012d2b" stroke-width="2"/><polygon points="70,22 90,22 80,12" fill="#012d2b"/><polygon points="88,26 150,10 150,40" fill="#f4d35e" opacity=".5"/>`),
    "lobster-boat.svg": svg(`<rect width="160" height="120" fill="#cde8f2"/><rect y="80" width="160" height="40" fill="#03968f"/><polygon points="20,74 140,74 128,94 32,94" fill="#f7f6f0" stroke="#012d2b" stroke-width="2"/><rect x="40" y="52" width="34" height="22" fill="#f7f6f0" stroke="#012d2b" stroke-width="2"/><rect x="46" y="58" width="10" height="8" fill="#cde8f2"/><rect x="100" y="64" width="18" height="10" fill="#c0392b"/><line x1="58" y1="52" x2="58" y2="36" stroke="#012d2b" stroke-width="3"/>`),
    "muffins.svg": svg(`<rect width="160" height="120" fill="#fff3dc"/><rect y="86" width="160" height="34" fill="#c99a4f"/><ellipse cx="80" cy="88" rx="70" ry="8" fill="#a0784f"/>${[34, 80, 126].map((x) => `<path d="M${x - 20} 70 L${x - 16} 88 H${x + 16} L${x + 20} 70 Z" fill="#f2c14e" stroke="#7a5a0e" stroke-width="2"/><path d="M${x - 22} 72 Q${x - 24} 50 ${x} 48 Q${x + 24} 50 ${x + 22} 72 Z" fill="#c98a4b" stroke="#7a5a0e" stroke-width="2"/><circle cx="${x - 8}" cy="60" r="3.2" fill="#3f4fa8"/><circle cx="${x + 6}" cy="56" r="3.2" fill="#3f4fa8"/><circle cx="${x + 2}" cy="66" r="3.2" fill="#3f4fa8"/>`).join("")}`),
    "kayak.svg": svg(`<rect width="160" height="120" fill="#cde8f2"/><path d="M0 70 Q40 58 80 66 T160 62 V120 H0 Z" fill="#2f5d3a"/><rect y="78" width="160" height="42" fill="#03968f"/><path d="M28 88 Q80 72 132 88 Q80 100 28 88 Z" fill="#e9603f" stroke="#012d2b" stroke-width="2"/><ellipse cx="80" cy="86" rx="12" ry="4" fill="#012d2b"/><line x1="54" y1="70" x2="106" y2="102" stroke="#012d2b" stroke-width="3"/><ellipse cx="52" cy="69" rx="6" ry="3" fill="#f2c14e" transform="rotate(32 52 69)"/><ellipse cx="108" cy="103" rx="6" ry="3" fill="#f2c14e" transform="rotate(32 108 103)"/><circle cx="130" cy="24" r="10" fill="#f4d35e"/>`),
    "tackle.svg": svg(`<rect width="160" height="120" fill="#e8f2f5"/><rect x="14" y="56" width="78" height="44" rx="4" fill="#2f5d3a" stroke="#012d2b" stroke-width="2"/><rect x="14" y="48" width="78" height="10" rx="3" fill="#3f7d4f" stroke="#012d2b" stroke-width="2"/><rect x="42" y="42" width="22" height="8" rx="3" fill="none" stroke="#012d2b" stroke-width="3"/>${[24, 42, 60, 78].map((x, i) => `<circle cx="${x}" cy="78" r="5" fill="${["#e9603f", "#f2c14e", "#94c93d", "#3f7fc9"][i]}"/>`).join("")}<rect x="112" y="28" width="18" height="58" rx="9" fill="#f7f6f0" stroke="#012d2b" stroke-width="2"/><rect x="112" y="46" width="18" height="12" fill="#e9603f"/><line x1="121" y1="86" x2="121" y2="104" stroke="#012d2b" stroke-width="3"/><line x1="121" y1="12" x2="121" y2="28" stroke="#012d2b" stroke-width="3"/>`)
  };
  /* More pictures for students' own topics (Build Your First Website, Website Builder). Drawn, offline, made up. */
  const sky = (c = "#cde8f2") => `<rect width="160" height="120" fill="${c}"/>`;
  Object.assign(PICTURES, {
    "moose.svg": svg(`${sky()}<rect y="88" width="160" height="32" fill="#4f7d3a"/><path d="M0 70 L30 40 L55 66 L80 36 L110 70 L135 48 L160 66 V90 H0 Z" fill="#2f5d3a"/><ellipse cx="78" cy="78" rx="30" ry="14" fill="#6b4226"/><rect x="58" y="86" width="5" height="22" fill="#4a2c18"/><rect x="70" y="86" width="5" height="22" fill="#4a2c18"/><rect x="86" y="86" width="5" height="22" fill="#4a2c18"/><rect x="96" y="86" width="5" height="22" fill="#4a2c18"/><path d="M104 74 L118 60 L126 62 L124 80 Z" fill="#6b4226"/><path d="M114 60 Q104 44 92 50 M118 58 Q128 40 140 46" stroke="#c9a46a" stroke-width="5" fill="none" stroke-linecap="round"/>`),
    "loon.svg": svg(`${sky("#dceff5")}<rect y="66" width="160" height="54" fill="#2b6f8f"/><ellipse cx="78" cy="70" rx="34" ry="11" fill="#1d2426"/><circle cx="112" cy="58" r="9" fill="#1d2426"/><path d="M120 58 L134 61 L120 62 Z" fill="#1d2426"/><circle cx="114" cy="56" r="2" fill="#c0392b"/>${[56, 66, 76, 86, 96].map((x) => `<circle cx="${x}" cy="66" r="1.8" fill="#fff"/>`).join("")}<path d="M104 64 Q112 70 120 64" stroke="#fff" stroke-width="2" fill="none"/>`),
    "puffin.svg": svg(`${sky()}<path d="M0 92 Q50 70 100 88 T160 84 V120 H0 Z" fill="#7a7f80"/><ellipse cx="80" cy="74" rx="20" ry="26" fill="#1d2426"/><ellipse cx="82" cy="78" rx="12" ry="19" fill="#fff"/><circle cx="84" cy="52" r="15" fill="#1d2426"/><ellipse cx="88" cy="52" rx="9" ry="8" fill="#fff"/><path d="M96 48 L112 54 L96 60 Z" fill="#e9603f"/><circle cx="90" cy="50" r="2" fill="#1d2426"/><rect x="74" y="98" width="5" height="8" fill="#e9603f"/><rect x="84" y="98" width="5" height="8" fill="#e9603f"/>`),
    "fox.svg": svg(`${sky("#f3ead8")}<rect y="92" width="160" height="28" fill="#8fae5a"/><path d="M40 92 Q30 70 50 62 L100 62 Q118 66 116 92 Z" fill="#d9692b"/><path d="M40 86 Q14 84 18 64 Q32 80 46 76 Z" fill="#d9692b"/><path d="M18 64 Q20 72 26 74" stroke="#fff" stroke-width="4" fill="none"/><path d="M100 64 L112 40 L118 58 L130 46 L126 70 Q118 80 104 76 Z" fill="#d9692b"/><path d="M118 70 L132 74 L120 78 Z" fill="#1d2426"/><circle cx="118" cy="62" r="2" fill="#1d2426"/>`),
    "deer.svg": svg(`${sky()}<rect y="90" width="160" height="30" fill="#6f9a4c"/><ellipse cx="74" cy="72" rx="28" ry="12" fill="#a8703f"/><rect x="54" y="80" width="4" height="22" fill="#7a4d2a"/><rect x="64" y="80" width="4" height="22" fill="#7a4d2a"/><rect x="82" y="80" width="4" height="22" fill="#7a4d2a"/><rect x="92" y="80" width="4" height="22" fill="#7a4d2a"/><path d="M98 66 L106 44 L114 46 L108 70 Z" fill="#a8703f"/><ellipse cx="114" cy="44" rx="9" ry="6" fill="#a8703f"/><path d="M110 38 L104 26 M114 38 L120 26" stroke="#7a4d2a" stroke-width="3"/><circle cx="116" cy="43" r="1.6" fill="#1d2426"/>`),
    "mountain-trail.svg": svg(`${sky("#d9eef7")}<path d="M0 100 L50 36 L76 66 L104 24 L160 100 Z" fill="#6c7f86"/><path d="M104 24 L116 40 L96 40 Z M50 36 L60 50 L40 50 Z" fill="#fff"/><rect y="96" width="160" height="24" fill="#4f7d3a"/><path d="M70 120 Q76 104 92 100 Q108 96 112 86" stroke="#d8c08a" stroke-width="6" fill="none"/>${[18, 34, 138].map((x) => `<polygon points="${x},70 ${x - 9},98 ${x + 9},98" fill="#2f5d3a"/>`).join("")}`),
    "tree.svg": svg(`${sky()}<rect y="96" width="160" height="24" fill="#6f9a4c"/><rect x="74" y="66" width="12" height="32" fill="#6b4226"/><polygon points="80,10 46,56 114,56" fill="#2f5d3a"/><polygon points="80,30 40,78 120,78" fill="#3f7d4f"/>`),
    "wave.svg": svg(`${sky("#e3f3f8")}<circle cx="128" cy="26" r="12" fill="#f4d35e"/><path d="M0 74 Q20 52 44 64 Q60 72 72 58 Q90 38 112 58 Q130 74 160 62 V120 H0 Z" fill="#2b8fb0"/><path d="M0 90 Q30 78 60 90 T120 90 T160 88 V120 H0 Z" fill="#1d6f8a"/><path d="M72 58 Q84 52 92 60" stroke="#fff" stroke-width="3" fill="none"/>`),
    "soccer.svg": svg(`${sky("#cfe9c2")}<rect y="84" width="160" height="36" fill="#4f9a3a"/><circle cx="80" cy="62" r="30" fill="#fff" stroke="#1d2426" stroke-width="3"/><polygon points="80,50 91,58 87,71 73,71 69,58" fill="#1d2426"/><path d="M80 50 V34 M91 58 L106 52 M87 71 L96 86 M73 71 L64 86 M69 58 L54 52" stroke="#1d2426" stroke-width="2"/>`),
    "basketball.svg": svg(`${sky("#f6e6d2")}<rect y="96" width="160" height="24" fill="#c99a4f"/><circle cx="80" cy="58" r="32" fill="#e07a2a" stroke="#1d2426" stroke-width="3"/><path d="M48 58 H112 M80 26 V90 M58 34 Q72 58 58 82 M102 34 Q88 58 102 82" stroke="#1d2426" stroke-width="2.5" fill="none"/>`),
    "game-controller.svg": svg(`${sky("#2a2f45")}<path d="M34 50 Q36 38 52 38 H108 Q124 38 126 50 L134 84 Q136 96 122 94 L104 78 H56 L38 94 Q24 96 26 84 Z" fill="#5b6bd6" stroke="#e8eaf8" stroke-width="2"/><rect x="50" y="52" width="6" height="20" fill="#e8eaf8"/><rect x="43" y="59" width="20" height="6" fill="#e8eaf8"/>${[[106, 54, "#f2c14e"], [116, 62, "#e9603f"], [106, 70, "#94c93d"], [96, 62, "#7fc8f2"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="5" fill="${c}"/>`).join("")}`),
    "guitar.svg": svg(`${sky("#f3e9f7")}<rect x="96" y="14" width="10" height="56" fill="#6b4226" transform="rotate(30 101 42)"/><circle cx="64" cy="80" r="22" fill="#c9782b"/><circle cx="80" cy="64" r="15" fill="#c9782b"/><circle cx="70" cy="74" r="6" fill="#3a2414"/><path d="M52 92 L112 22" stroke="#f7f6f0" stroke-width="1.2"/>`),
    "paintbrush.svg": svg(`${sky("#fdf6e3")}<path d="M20 96 Q44 70 70 90 Q96 110 122 84" stroke="#e9603f" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M30 60 Q60 40 90 56" stroke="#3f7fc9" stroke-width="10" fill="none" stroke-linecap="round"/><rect x="104" y="20" width="10" height="56" rx="4" fill="#6b4226" transform="rotate(35 109 48)"/><path d="M118 70 L132 92 L120 96 Z" fill="#94c93d"/>`),
    "robot.svg": svg(`${sky("#e4ecf5")}<rect x="50" y="36" width="60" height="44" rx="8" fill="#9aa9b8" stroke="#2a3540" stroke-width="2"/><circle cx="68" cy="56" r="7" fill="#7fe0f2"/><circle cx="92" cy="56" r="7" fill="#7fe0f2"/><rect x="66" y="68" width="28" height="5" rx="2" fill="#2a3540"/><line x1="80" y1="36" x2="80" y2="22" stroke="#2a3540" stroke-width="3"/><circle cx="80" cy="20" r="5" fill="#e9603f"/><rect x="58" y="82" width="44" height="26" rx="5" fill="#7d8c9b"/>`),
    "rocket.svg": svg(`${sky("#1d2550")}${[[20, 20], [140, 30], [30, 90], [130, 96], [60, 12]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#fff"/>`).join("")}<path d="M80 12 Q100 34 98 78 H62 Q60 34 80 12 Z" fill="#f2f2f2" stroke="#2a3540" stroke-width="2"/><circle cx="80" cy="46" r="8" fill="#7fc8f2" stroke="#2a3540" stroke-width="2"/><path d="M62 70 L48 90 L62 84 Z M98 70 L112 90 L98 84 Z" fill="#e9603f"/><path d="M70 80 Q80 112 90 80 Z" fill="#f4d35e"/>`),
    "lightbulb.svg": svg(`${sky("#fff8dc")}<circle cx="80" cy="50" r="28" fill="#f4d35e" stroke="#7a5a0e" stroke-width="2"/><rect x="68" y="76" width="24" height="18" rx="3" fill="#9aa9b8" stroke="#2a3540" stroke-width="2"/><path d="M70 50 Q80 34 90 50 L84 76 M76 76 L70 50" stroke="#7a5a0e" stroke-width="2" fill="none"/>${[[40, 30], [120, 30], [36, 62], [124, 62]].map(([x, y]) => `<line x1="${x}" y1="${y}" x2="${x < 80 ? x + 10 : x - 10}" y2="${y + (y < 50 ? 6 : -2)}" stroke="#e0a800" stroke-width="3"/>`).join("")}`)
  });
  /* What each picture shows (for alt text suggestions) and words that point to it (Website Builder's keyword reading). */
  const PICTURE_INFO = {
    "lighthouse.svg": ["A lighthouse shining over the water", "lighthouse coast ocean sea harbor maine beach boat"],
    "lobster-boat.svg": ["A lobster boat on the water", "boat lobster fishing harbor sail sailing"],
    "muffins.svg": ["A tray of blueberry muffins", "bakery muffin muffins food baking cook cooking bread cake dessert"],
    "kayak.svg": ["An orange kayak on calm water near a pine shore", "kayak kayaking paddle paddling canoe river lake"],
    "tackle.svg": ["A tackle box next to a lobster buoy", "fishing fish tackle bait shop store"],
    "moose.svg": ["A moose standing near the mountains", "moose animal animals wildlife forest maine"],
    "loon.svg": ["A loon swimming on a lake", "loon bird birds lake pond wildlife"],
    "puffin.svg": ["A puffin standing on a rock", "puffin bird birds seabird island wildlife"],
    "fox.svg": ["A red fox in a field", "fox animal animals wildlife pet pets"],
    "deer.svg": ["A deer standing in a meadow", "deer animal animals wildlife forest"],
    "mountain-trail.svg": ["A trail leading toward snowy mountains", "hike hiking trail trails mountain mountains climb camping camp outdoors nature katahdin explore"],
    "tree.svg": ["A tall pine tree", "tree trees forest pine nature environment earth plant plants park"],
    "wave.svg": ["Ocean waves under the sun", "wave waves ocean surf surfing beach swim swimming water"],
    "soccer.svg": ["A soccer ball on a green field", "soccer ball sport sports team goal game"],
    "basketball.svg": ["A basketball", "basketball hoop sport sports team court"],
    "game-controller.svg": ["A video game controller", "game games gaming video controller play player minecraft level"],
    "guitar.svg": ["A guitar", "guitar music song songs band instrument play"],
    "paintbrush.svg": ["A paintbrush and bright paint strokes", "art paint painting draw drawing artist color colors create creations portfolio"],
    "robot.svg": ["A friendly robot", "robot robots robotics code coding invent invention machine tech technology"],
    "rocket.svg": ["A rocket flying through space", "space rocket planet planets star stars astronaut moon galaxy"],
    "lightbulb.svg": ["A glowing light bulb", "idea ideas invent invention inventor science experiment"]
  };
  const CSP = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'">`;

  /* ───────── Colors and contrast (WCAG 2 relative luminance) ───────── */
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

  /* Every element with its own words: its color against the nearest opaque background behind it.
     ratio is null when the background can't be known (a picture or gradient, or see-through colors). */
  function textContrast(doc) {
    const win = doc.defaultView, out = [];
    const cs = (el) => win.getComputedStyle(el);
    const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    doc.body.querySelectorAll("*").forEach((el) => {
      if (/^(STYLE|SCRIPT)$/.test(el.tagName) || !ownText(el)) return;
      const s = cs(el);
      if (s.display === "none" || s.visibility === "hidden") return;
      const fg = rgb(s.color);
      let bg = null, unknown = !fg || fg.a < 1;
      for (let n = el; n && n.nodeType === 1 && !unknown; n = n.parentElement) {
        const ns = cs(n);
        if (ns.backgroundImage && ns.backgroundImage !== "none") { unknown = true; break; }
        const c = rgb(ns.backgroundColor);
        if (c && c.a >= 1) { bg = ns.backgroundColor; break; }
        if (c && c.a > 0) { unknown = true; break; }
      }
      const size = parseFloat(s.fontSize), bold = Number(s.fontWeight) >= 700;
      out.push({
        el, text: el.textContent.trim().slice(0, 40), fg: s.color, bg: bg || "rgb(255, 255, 255)",
        ratio: unknown ? null : contrast(s.color, bg || "rgb(255, 255, 255)"),
        large: size >= 24 || (bold && size >= 18.66)
      });
    });
    return out;
  }

  /* ───────── The preview document ───────── */
  const KEEP = new Set("h1 h2 h3 h4 h5 h6 p ul ol li a img strong em b i u small mark br hr section header main footer nav article aside div span blockquote figure figcaption table thead tbody tr th td style".split(" "));
  const DROP = new Set("script noscript template iframe frame frameset object embed applet portal video audio source track canvas svg math form input button select option textarea label fieldset link meta base title".split(" "));
  const ATTRS = new Set(["id", "class", "href", "src", "alt", "title", "style", "lang", "colspan", "rowspan", "data-wk"]);
  /* An allowlist pass over the student's markup, in an inert document (nothing runs or loads there). Unknown
     elements are unwrapped (their words stay); dangerous ones go, with their contents. */
  function sanitize(html) {
    if (typeof DOMParser === "undefined") return String(html);   // the defuse() layer, the CSP, and the sandbox still apply
    const doc = new DOMParser().parseFromString(`<!doctype html><body>${html}</body>`, "text/html");
    const walk = (node) => {
      [...node.children].forEach((el) => {
        const tag = el.tagName.toLowerCase();
        if (DROP.has(tag)) { el.remove(); return; }
        [...el.attributes].forEach((a) => {
          const name = a.name.toLowerCase(), v = a.value.trim();
          if (!ATTRS.has(name) || name.startsWith("on")) el.removeAttribute(a.name);
          else if (name === "href" && /^[a-z][a-z0-9+.-]*:/i.test(v) && !/^(https?|mailto):/i.test(v)) el.removeAttribute(a.name);   // javascript:, data:, and friends
        });
        walk(el);
        if (!KEEP.has(tag)) el.replaceWith(...el.childNodes);
      });
    };
    walk(doc.body);
    return doc.body.innerHTML;
  }
  /* Anything that could still reach outside is rewritten. The lab's own picture names become built-in drawings. */
  const pic = (src, q = '"') => PICTURES[src] ? `src=${q}${PICTURES[src]}${q} data-name=${q}${src}${q}` : `data-src=${q}${src}${q}`;
  function defuse(code) {
    return String(code)
      .replace(/<\/?(meta|base|link|iframe|frame|object|embed|video|audio|source|track|script|portal)\b[^>]*>/gi, "")
      .replace(/\b(srcset|background|poster|data|action|formaction)\s*=/gi, "data-off-$1=")
      .replace(/\bsrc\s*=\s*(["'])([^"']*)\1/gi, (m, q, src) => pic(src, q))
      .replace(/\bsrc\s*=\s*([^\s>"']+)/gi, (m, src) => pic(src))
      .replace(/url\s*\(/gi, "url-off(")
      .replace(/@import/gi, "@import-off");
  }
  /* Mark each opening tag (outside <style>) with data-wk="i", and remember where it starts in the code. */
  function tagSource(html) {
    const map = [];
    let i = 0, out = "", last = 0;
    const re = /<style\b[\s\S]*?<\/style>|<!--[\s\S]*?-->|<([a-zA-Z][a-zA-Z0-9]*)(?=[\s/>])/g;
    let m;
    while ((m = re.exec(html))) {
      if (!m[1]) continue;
      const end = m.index + m[0].length;
      out += html.slice(last, end) + ` data-wk="${i}"`;
      last = end;
      const close = html.indexOf(">", end);
      map.push({ i, tag: m[1].toLowerCase(), start: m.index, end: close < 0 ? html.length : close + 1 });
      i++;
    }
    return { html: out + html.slice(last), map };
  }
  function srcdoc(code, opts = {}) {
    let html = String(code), map = null;
    if (opts.map) { const t = tagSource(html); html = t.html; map = t.map; }
    const css = opts.css != null ? `<style>\n${opts.css}\n</style>\n` : "";
    const body = defuse(sanitize(css + html));
    const title = opts.title ? `<title>${String(opts.title).replace(/[<>&]/g, "")}</title>` : "";
    const doc = `<!doctype html><html lang="en"><head>${CSP}<meta charset="utf-8">${title}${opts.head || ""}</head><body>${body}</body></html>`;
    return opts.map ? { doc, map } : doc;
  }

  /* ───────── Colors in a style sheet, for a color helper ───────── */
  const COLOR_PROPS = /^(color|background|background-color|border-color|border)$/i;
  const COLOR_VALUE = /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|\b[a-z]{3,20}\b/gi;
  /* [{ selector, prop, value, start, end }]: offsets of each color value in the CSS text. */
  function cssColors(css) {
    const out = [];
    const rule = /([^{}]+)\{([^}]*)\}/g;
    let r;
    while ((r = rule.exec(css))) {
      const selector = r[1].trim().replace(/\s+/g, " "), bodyAt = r.index + r[0].indexOf("{") + 1;
      const decl = /([a-z-]+)\s*:\s*([^;]+)/gi;
      let d;
      while ((d = decl.exec(r[2]))) {
        if (!COLOR_PROPS.test(d[1])) continue;
        const valueAt = bodyAt + d.index + d[0].indexOf(d[2], d[1].length);
        let v;
        COLOR_VALUE.lastIndex = 0;
        while ((v = COLOR_VALUE.exec(d[2]))) {
          if (!/^#|^rgb/i.test(v[0]) && !isNamedColor(v[0])) continue;
          out.push({ selector, prop: d[1].toLowerCase(), value: v[0], start: valueAt + v.index, end: valueAt + v.index + v[0].length });
          break;
        }
      }
    }
    return out;
  }
  const NOT_COLORS = /^(solid|dashed|dotted|none|inherit|initial|unset|transparent|auto|thin|thick|medium|px|em|rem)$/i;
  function isNamedColor(word) {
    if (NOT_COLORS.test(word)) return false;
    if (typeof CSS !== "undefined" && CSS.supports) return CSS.supports("color", word);
    return /^(black|white|red|green|blue|navy|teal|gray|grey|yellow|orange|purple|pink|brown|maroon|olive|silver|lightyellow|lightblue|darkblue|darkgreen)$/i.test(word);
  }
  const setCssColor = (css, item, hex) => css.slice(0, item.start) + hex + css.slice(item.end);
  /* Any CSS color as #rrggbb (uses the browser to read it). */
  function toHex(value) {
    if (/^#[0-9a-f]{6}$/i.test(value)) return value.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(value)) return ("#" + value.slice(1).split("").map((c) => c + c).join("")).toLowerCase();
    if (typeof document === "undefined") return "#000000";
    const probe = document.createElement("span");
    probe.style.color = value; probe.hidden = true;
    document.body.appendChild(probe);
    const c = rgb(getComputedStyle(probe).color);
    probe.remove();
    return c ? "#" + [c.r, c.g, c.b].map((n) => Number(n).toString(16).padStart(2, "0")).join("") : "#000000";
  }

  SE.webKit = { PICTURES, PICTURE_INFO, CSP, rgb, lum, contrast, summarize, textContrast, sanitize, defuse, tagSource, srcdoc, cssColors, setCssColor, toHex };
})();
