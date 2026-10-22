/*
 * STEM 207 — printable certificates of completion.
 *
 *   SE.certificate.button(info, label)  a button that opens the certificate
 *   SE.certificate.open(info)           show it in an overlay with Print and Close
 *
 * info: { award, course, detail, name, className, at }
 * Only the student's display name and class name appear: no other personal information.
 * For guests, the name is a blank line to write on.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;

  function markup(info) {
    const date = new Date(info.at || Date.now()).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    return `
      <article class="cert" aria-labelledby="cert-title">
        <div class="cert__frame">
          <div class="cert__logo">${SE.brandLogo(54)}</div>
          <p class="cert__parent"><span>Powered by</span><img src="assets/img/brand/coliseum/stem-coliseum.png" alt="STEM Coliseum" width="700" height="105"></p>
          <p class="cert__eyebrow">Certificate of completion</p>
          <h2 class="cert__award" id="cert-title" tabindex="-1">${esc(info.award)}</h2>
          <p class="cert__lead">This certifies that</p>
          <p class="cert__name">${info.name ? esc(info.name) : "&nbsp;"}</p>
          <p class="cert__lead">completed</p>
          <p class="cert__course">${esc(info.course)}</p>
          ${info.detail ? `<p class="cert__detail">${esc(info.detail)}</p>` : ""}
          <div class="cert__foot">
            <div><span class="cert__line">${esc(date)}</span><small>Date</small></div>
            <div class="cert__pine" aria-hidden="true">${SE.pine(56, "", "#94c93d")}</div>
            <div><span class="cert__line">${info.className ? esc(info.className) : "&nbsp;"}</span><small>Class</small></div>
          </div>
          <div class="cert__sign"><span class="cert__line">&nbsp;</span><small>Teacher</small></div>
          <p class="cert__mission">Keep the humanity in technology.</p>
        </div>
      </article>`;
  }

  function open(info) {
    document.querySelectorAll(".cert-overlay").forEach((o) => o.remove());
    const back = document.activeElement;
    const ov = document.createElement("div");
    ov.className = "overlay cert-overlay";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");
    ov.setAttribute("aria-labelledby", "cert-title");
    ov.innerHTML = `
      <div class="cert-wrap">
        ${markup(info)}
        <div class="cert-actions">
          <button type="button" class="btn btn--primary" data-cert-print>${icon("print")}Print my certificate</button>
          <button type="button" class="btn btn--ghost cert-close" data-cert-close>Close</button>
        </div>
      </div>`;
    document.body.appendChild(ov);
    document.body.classList.add("has-overlay");
    const close = () => {
      ov.remove();
      document.body.classList.remove("has-overlay", "cert-printing");
      document.removeEventListener("keydown", onKey);
      if (back && back.focus) back.focus();
    };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    ov.addEventListener("click", (e) => {
      if (e.target === ov || e.target.closest("[data-cert-close]")) close();
      else if (e.target.closest("[data-cert-print]")) {
        document.body.classList.add("cert-printing");
        window.print();
      }
    });
    window.addEventListener("afterprint", () => document.body.classList.remove("cert-printing"), { once: true });
    ov.querySelector("#cert-title").focus();
  }

  const button = (info, label = "See my certificate", cls = "btn btn--launch") =>
    `<button type="button" class="${cls}" data-cert="${esc(JSON.stringify(info))}">${icon("star")}${esc(label)}</button>`;

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cert]");
    if (b) open(JSON.parse(b.dataset.cert));
  });

  SE.certificate = { open, button, markup };
})();
