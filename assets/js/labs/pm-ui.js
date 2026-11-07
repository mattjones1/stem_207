/*
 * Pattern Machine Lab: small shared pieces (SE.pmUI) used by lab-ai.js and its helpers
 * (pm-explain.js, pm-studio.js, pm-knowledge.js). Markup only; no model logic lives here.
 *   pct(x)                 0.6875 → "69%"
 *   tag(label)             a Glim/Norp tag with a shape, so the label never depends on color alone
 *   b(act, id, label, …)   a button for delegate(): data-act, data-id, and a stable data-k for focus
 *   chips(act, opts, …)    a group of pressable choices
 *   card(ex, o)            a creature card
 *   paint(box, html)       re-render without losing focus or open <details>
 *   delegate(el, handlers) one click listener for every [data-act] inside el
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { esc } = SE;
  const M = SE.mlKit;

  const pct = (x) => (x == null ? "–" : `${Math.round(x * 100)}%`);
  const tag = (label) => `<b class="pm-tag pm-tag--${label === "Glim" ? "glim" : "norp"}"><span aria-hidden="true">${label === "Glim" ? "▲" : "●"}</span> ${esc(label)}</b>`;
  const b = (act, id, label, cls = "btn btn--ghost btn--small", extra = "") => `<button type="button" class="${cls}" data-act="${act}" data-id="${esc(id)}" data-k="${act}:${esc(id)}" ${extra}>${label}</button>`;
  const chips = (act, opts, picked, multi = false) => `<div class="pm-chips" role="group">${opts.map(([id, text]) => {
    const on = multi ? (picked || []).includes(id) : picked === id;
    return b(act, id, esc(text), "pm-chip", `aria-pressed="${on}"`);
  }).join("")}</div>`;
  function card(ex, o = {}) {
    const size = o.size || 64;
    return `<figure class="pm-card ${o.cls || ""}" data-card="${esc(ex.id)}">${M.creature(ex.traits, size)}${o.label ? `<figcaption>${tag(o.label)}${o.body || ""}</figcaption>` : o.body ? `<figcaption>${o.body}</figcaption>` : ""}</figure>`;
  }
  /* Re-render without losing the focused control (matched by data-k) or which <details> were open. */
  function paint(box, html) {
    const a = document.activeElement;
    const k = a && box.contains(a) ? a.getAttribute("data-k") : null;
    const opened = [...box.querySelectorAll("details[data-k]")].map((d) => [d.getAttribute("data-k"), d.open]);
    box.innerHTML = html;
    opened.forEach(([dk, open]) => { const d = [...box.querySelectorAll("details[data-k]")].find((x) => x.getAttribute("data-k") === dk); if (d) d.open = open; });
    if (k) { const n = [...box.querySelectorAll("[data-k]")].find((x) => x.getAttribute("data-k") === k); if (n && !n.disabled) n.focus({ preventScroll: true }); }
  }
  function delegate(el, handlers) {
    el.addEventListener("click", (e) => {
      const t = e.target.closest("[data-act]");
      if (!t || !el.contains(t) || t.disabled) return;
      const h = handlers[t.dataset.act];
      if (h) h(t.dataset.id, t, e);
    });
  }
  const reduceMotion = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  SE.pmUI = { pct, tag, b, chips, card, paint, delegate, reduceMotion };
})();
