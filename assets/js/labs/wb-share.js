/*
 * STEM 207 Website Builder — handing a website in to the teacher, asking to share it with the class, and the class
 * gallery (kind feedback with three buttons, no free text). The website itself lives on the student's device; the
 * store keeps a copy for the teacher (SE.store.website*, supabase/update-13-student-websites.sql in cloud mode).
 * Nothing leaves the device until SE.privacy.scan finds no personal information, and classmates only see a website
 * the teacher approved.
 *
 *   SE.wbShare.box(container, ctx)   ctx: { state, user, save() }   the Hand in / Share panel, drawn and bound
 *   SE.wbShare.gallery(user)         the class gallery, in the shared modal
 *   SE.wbShare.privacy(state)        the first personal-information match in the website, or null
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;
  const WK = () => SE.webKit;
  const KUDOS = [["learned", "bulb", "I learned something"], ["design", "palette", "I like the design"], ["readable", "eye", "Easy to read"]];

  /* The first thing in the website that points to a real person (title or code), or null. */
  function privacy(state) {
    const f = state.files || {}, inTitle = SE.privacy.scan(state.title || "")[0];
    if (inTitle) return { ...inTitle, where: "title" };
    const h = SE.privacy.scan(f.html || "")[0];
    return h ? { ...h, where: "html" } : null;
  }
  const blocked = (hit) => `${icon("alert")}<span>Your website has ${esc(hit.say)} ("${esc(hit.text)}"). Take it out first: websites that leave this device can't have personal information.</span>`;
  /* A short fingerprint of a website, so a device knows which copy it sent last (no clocks involved). */
  const hash = (title, html, css) => { let h = 5381; for (const c of `${title}\u0000${html}\u0000${css}`) h = (Math.imul(h, 33) ^ c.charCodeAt(0)) >>> 0; return h.toString(36); };
  const when = (t) => (t ? new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "");

  /* The Hand in / Share panel. Redraws itself after each action. */
  function box(el, ctx) {
    const { state, user } = ctx;
    if (!user || user.role !== "student") {
      el.innerHTML = `<p class="muted small">${icon("users")}Students hand in their website and ask to share it with the class here. You'll see their websites on your class page, under Websites.</p>`;
      return;
    }
    const say = (t, warn) => { const m = el.querySelector("#wbh-msg"); if (m) { m.innerHTML = t; m.classList.toggle("is-warn", !!warn); } };
    async function draw(msg, warn) {
      el.innerHTML = `<p class="muted small">Loading…</p>`;
      const w = await SE.store.websiteMine();
      if (!SE.store.websitesReady()) {
        el.innerHTML = `<p class="wbh__off">${icon("alert")}<span>Handing in and sharing aren't turned on for your class yet. Your website is saved on this device. Show it to your teacher in person.</span></p>`;
        return;
      }
      const changed = w && w.handedInAt && w.updatedAt > w.handedInAt + 5000;
      el.innerHTML = `<div class="wbh">
        <section class="wbh__part" aria-labelledby="wbh-in"><h3 id="wbh-in">${icon("check")}Hand in to my teacher</h3>
          <p>${w && w.status === "handed_in" ? `Handed in ${when(w.handedInAt)}.${changed ? " You've changed it since: hand it in again so your teacher sees the newest one." : ""}` : "Not handed in yet. Your teacher sees your website and your Human Touch answers."}</p>
          ${w && w.teacherNote ? `<p class="wbh__note"><strong>Your teacher says:</strong> ${esc(w.teacherNote)}</p>` : ""}
          <button type="button" class="btn btn--primary btn--small" id="wbh-handin">${icon("check")}${w && w.status === "handed_in" ? "Hand it in again" : "Hand in my website"}</button></section>
        <section class="wbh__part" aria-labelledby="wbh-sh"><h3 id="wbh-sh">${icon("users")}Share with my class</h3>
          <p>${!w || w.gallery === "none" ? "Your teacher looks first. Then only your class can see it, in the class gallery." : w.gallery === "requested" ? "Waiting for your teacher to say yes." : "It's in the class gallery. Classmates can tap kind feedback buttons."}</p>
          <div class="wb-actions">${!w || w.gallery === "none" ? `<button type="button" class="btn btn--ghost btn--small" id="wbh-share">${icon("users")}Ask to share with my class</button>` : `<button type="button" class="btn btn--ghost btn--small" id="wbh-unshare">Stop sharing</button>`}
            <button type="button" class="btn btn--ghost btn--small" id="wbh-gallery">${icon("eye")}See the class gallery</button></div></section>
        <p class="wbh__msg" id="wbh-msg" role="status"></p></div>`;
      if (msg) say(msg, warn);
      el.querySelector("#wbh-handin").addEventListener("click", async () => {
        const hit = privacy(state);
        if (hit) return say(blocked(hit), true);
        SE.store.websiteSave({ title: state.title, html: state.files.html, css: state.files.css });
        const r = state.reflect || {}, ok = await SE.store.websiteHandIn({ right: r.right, wrong: r.wrong, changed: r.changed, partner: state.peer && state.peer.change });
        draw(ok ? `${icon("check")}<span>Handed in. Your teacher can open it now.</span>` : "Couldn't hand it in. Check the internet, then try again.", !ok);
      });
      const sh = el.querySelector("#wbh-share");
      if (sh) sh.addEventListener("click", async () => {
        const hit = privacy(state);
        if (hit) return say(blocked(hit), true);
        SE.store.websiteSave({ title: state.title, html: state.files.html, css: state.files.css });
        const ok = await SE.store.websiteShare(true);
        draw(ok ? `${icon("check")}<span>Asked. Your teacher will look at it first.</span>` : "Couldn't ask yet. Check the internet, then try again.", !ok);
      });
      const un = el.querySelector("#wbh-unshare");
      if (un) un.addEventListener("click", async () => { const ok = await SE.store.websiteShare(false); draw(ok ? "Stopped sharing. Your website isn't in the gallery." : "Couldn't stop sharing yet. Try again.", !ok); });
      el.querySelector("#wbh-gallery").addEventListener("click", () => gallery(user));
    }
    draw();
  }

  /* The class gallery: approved websites in this class, each with three kind-feedback buttons. */
  function gallery(user) {
    SE.modal.open({ title: "Class gallery", wide: true, body: `<p>Websites your classmates shared, after your teacher said yes. Tap a button to give kind feedback.</p><div id="wbg-list"><p class="muted">Loading…</p></div>`,
      async onOpen(dlg) {
        const list = dlg.querySelector("#wbg-list");
        const sites = user && user.role === "student" ? await SE.store.classGallery() : [];
        if (!sites.length) { list.innerHTML = `<p class="wbg__empty">${icon("users")}No websites in the gallery yet. When your teacher says yes to a shared website, it shows here.</p>`; return; }
        list.innerHTML = `<ul class="wbg">${sites.map((w) => `<li class="wbg__card"><h3>${esc(w.title || "A website")}</h3><p class="muted small">by ${esc(w.displayName)}${w.mine ? " (you)" : ""}</p>
            <iframe class="wbg__f" sandbox title="${esc(w.title || "A website")} by ${esc(w.displayName)}" srcdoc="${esc(WK().srcdoc(w.html || "", { css: w.css || "", title: w.title }))}"></iframe>
            <div class="wbg__kudos" role="group" aria-label="Kind feedback for ${esc(w.title || "this website")}">${KUDOS.map(([k, ic, label]) => `<button type="button" class="wbp__b" data-kudos="${esc(w.id)}" data-kind="${k}" aria-pressed="${(w.given || []).includes(k)}" ${w.mine ? "disabled" : ""}>${icon(ic)}${label}<span class="wbg__n" aria-label="${(w.kudos || {})[k] || 0} so far">${(w.kudos || {})[k] || 0}</span></button>`).join("")}</div></li>`).join("")}</ul>`;
        list.addEventListener("click", async (e) => {
          const b = e.target.closest("[data-kudos]");
          if (!b || b.disabled) return;
          const r = await SE.store.websiteKudos(b.dataset.kudos, b.dataset.kind);
          if (!r.ok) return;
          b.setAttribute("aria-pressed", String(!!r.on));
          const n = b.querySelector(".wbg__n"), v = Math.max(0, Number(n.textContent) + (r.on ? 1 : -1));
          n.textContent = v; n.setAttribute("aria-label", `${v} so far`);
        });
      } });
  }

  SE.wbShare = { box, gallery, privacy, hash, KUDOS };
})();
