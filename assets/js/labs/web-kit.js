/*
 * STEM 207 — the web kit, shared by the Web Builder Lab (lab-web.js) and Build Your First Website (lab-website.js).
 * The safe preview, the built-in pictures, and the page-reading tools a checker needs.
 *
 *   SE.webKit.PICTURES                 the only pictures a page can use (inline SVG, no outside request)
 *   SE.webKit.srcdoc(code, opts)       the preview document. Layers, outside to inside:
 *        1. the iframe itself: sandbox without allow-scripts (no scripts, forms, popups, or navigation)
 *        2. a Content-Security-Policy: default-src 'none'; img-src data:; style-src 'unsafe-inline'
 *        3. sanitize(): a DOM allowlist of elements and attributes (when the browser's DOMParser is there)
 *        4. defuse(): anything that could still fetch (src, srcset, url(), @import) is rewritten
 *      opts.css: CSS kept separately (put in a <style>); opts.map: tag each opening tag for "Find it"
 *      opts.head: extra trusted markup for <head> (the lab's own styles)
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
    const doc = `<!doctype html><html lang="en"><head>${CSP}<meta charset="utf-8">${opts.head || ""}</head><body>${body}</body></html>`;
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

  SE.webKit = { PICTURES, CSP, rgb, lum, contrast, summarize, textContrast, sanitize, defuse, tagSource, srcdoc, cssColors, setCssColor, toHex };
})();
