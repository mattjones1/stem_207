/*
 * STEM 207 — Student websites on the educator's class page (the Website Builder lab).
 * Each student's website is saved from their device as they work (SE.store.websiteSave). Here the educator sees
 * every student's status, opens a website (Desktop/Phone, the Human Touch answers once it's handed in), leaves a
 * short note, prints a one-page summary, and approves or declines requests to share with the class gallery.
 * In cloud mode this needs supabase/update-13-student-websites.sql; until then the section says so.
 *
 *   SE.teachWebsites.block(cls, sum)   the section's HTML        SE.teachWebsites.bind(cls)   its buttons
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;
  const LAB = "website-builder";
  const day = (t) => (t ? new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "");
  const studentName = (cls, id) => (SE.store.studentsIn(cls.id).find((s) => s.id === id) || {}).displayName || "A student";
  const activitiesDone = (sum, id) => { const p = sum.profiles.find((x) => x.student.id === id); return p ? (p.prof.labLevels[LAB] || new Set()).size : 0; };
  const galleryText = (w) => (!w || w.gallery === "none" ? "Not shared" : w.gallery === "requested" ? "Asks to share" : "In the gallery");
  const kudosText = (k) => { const n = k.learned + k.design + k.readable; return n ? `${n} (${k.learned} learned, ${k.design} design, ${k.readable} easy to read)` : "None yet"; };

  function block(cls, sum) {
    const ready = SE.store.websitesReady();
    const sites = SE.store.websitesFor(cls.id), by = new Map(sites.map((w) => [w.studentId, w]));
    const students = SE.store.studentsIn(cls.id);
    const asks = sites.filter((w) => w.gallery === "requested");
    return `<section class="wrap section" id="class-websites" aria-labelledby="web-title">
      <div class="section__head"><div><span class="eyebrow">Website Builder</span><h2 id="web-title">Student websites</h2></div>
        <p>Each student's website is saved from their device as they work. Open one to see it and their Human Touch answers, and to leave a note. Classmates see a website only after you approve it.</p></div>
      ${!ready ? `<p class="pwk-banner">${icon("alert")}<span><strong>Not turned on yet.</strong> Run <code>supabase/update-13-student-websites.sql</code> in the Supabase SQL Editor. Until then, websites stay on each student's device.</span></p>` : ""}
      ${asks.length ? `<div class="webq" role="region" aria-labelledby="webq-h"><h3 id="webq-h">${icon("users")}${asks.length === 1 ? "1 student asks" : `${asks.length} students ask`} to share with the class</h3>
        <ul>${asks.map((w) => `<li><span><strong>${esc(studentName(cls, w.studentId))}</strong>: ${esc(w.galleryTitle || w.title)}</span>
          <span class="webq__btns"><button type="button" class="btn btn--ghost btn--small" data-web-open="${esc(w.studentId)}">${icon("eye")}Look first</button>
          <button type="button" class="btn btn--primary btn--small" data-web-approve="${esc(w.studentId)}">${icon("check")}Approve</button>
          <button type="button" class="btn btn--ghost btn--small" data-web-decline="${esc(w.studentId)}">Decline</button></span></li>`).join("")}</ul></div>` : ""}
      ${students.length ? `<div class="table-scroll"><table class="lab-table web-table">
        <caption class="visually-hidden">Student websites in ${esc(cls.name)}</caption>
        <thead><tr><th scope="col">Student</th><th scope="col">Website</th><th scope="col" class="num">Activities</th><th scope="col">Handed in</th><th scope="col">Class gallery</th><th scope="col">Kind feedback</th><th scope="col"><span class="visually-hidden">Open</span></th></tr></thead>
        <tbody>${students.map((st) => {
          const w = by.get(st.id), done = activitiesDone(sum, st.id);
          return `<tr><th scope="row">${esc(st.displayName)}</th>
            <td>${w ? esc(w.title) : `<span class="muted">${done ? "On this student's device only" : "Not started"}</span>`}</td>
            <td class="num">${done} <small>of 8</small></td>
            <td>${w && w.status === "handed_in" ? `${icon("check")}${day(w.handedInAt)}${w.updatedAt > w.handedInAt + 5000 ? ` <small class="muted">(changed since)</small>` : ""}` : `<span class="muted">Not yet</span>`}</td>
            <td>${w ? esc(galleryText(w)) : "–"}</td>
            <td>${w ? esc(kudosText(SE.store.kudosFor(w.studentId))) : "–"}</td>
            <td>${w ? `<button type="button" class="btn btn--ghost btn--small" data-web-open="${esc(st.id)}" aria-label="Open ${esc(st.displayName)}'s website">${icon("eye")}Open</button>` : ""}</td></tr>`;
        }).join("")}</tbody></table></div>` : `<p class="muted">Add students to see their websites here.</p>`}
    </section>`;
  }

  /* One website: the page, the Human Touch answers, a note, sharing, and a printable summary. */
  function open(cls, studentId) {
    const w = SE.store.websitesFor(cls.id).find((x) => x.studentId === studentId);
    if (!w) return;
    const who = studentName(cls, studentId), r = w.reflect || {};
    const show = w.gallery === "requested" ? { title: w.galleryTitle, html: w.galleryHtml, css: w.galleryCss } : { title: w.title, html: w.html, css: w.css };
    const Q = [["right", "What did the builder get right?"], ["wrong", "What did it get wrong, or leave out?"], ["changed", "What will you change, and why will it help a real visitor?"], ["partner", "One change from my partner test"]];
    SE.modal.open({ title: `${who}: ${w.title}`, wide: true, body: `
      <div class="webm">
        <div class="webm__view">
          <div class="wb-size" role="group" aria-label="Preview size"><button type="button" class="btn btn--ghost btn--small" data-wsz="desk" aria-pressed="true">Desktop</button><button type="button" class="btn btn--ghost btn--small" data-wsz="phone" aria-pressed="false">Phone</button></div>
          ${w.gallery === "requested" ? `<p class="small">${icon("users")}This is the copy ${esc(who)} asked to share. Look it over before you approve it.</p>` : ""}
          <div class="wb-frame-box" id="webm-box"><iframe class="webm__f" sandbox title="${esc(who)}'s website" srcdoc="${esc(SE.webKit.srcdoc(show.html || "", { css: show.css || "", title: show.title }))}"></iframe></div>
        </div>
        <div class="webm__side">
          <p class="small muted">Saved ${day(w.updatedAt)}. ${w.status === "handed_in" ? `Handed in ${day(w.handedInAt)}.` : "Not handed in yet."}</p>
          ${w.status === "handed_in" ? `<h3>The Human Touch</h3><dl class="webm__dl">${Q.filter(([k]) => r[k]).map(([k, q]) => `<dt>${esc(q)}</dt><dd>${esc(r[k])}</dd>`).join("") || `<dd class="muted">No answers written.</dd>`}</dl>` : ""}
          <form id="webm-note"><label for="webm-note-t" class="wp-field">A short note for ${esc(who)} (they see it with their website)<textarea class="input" id="webm-note-t" rows="3" maxlength="300">${esc(w.teacherNote || "")}</textarea></label>
            <button type="submit" class="btn btn--ghost btn--small">${icon("check")}Save note</button></form>
          <div class="wb-actions">${w.gallery === "requested" ? `<button type="button" class="btn btn--primary btn--small" data-web-approve="${esc(studentId)}">${icon("check")}Approve for the class gallery</button><button type="button" class="btn btn--ghost btn--small" data-web-decline="${esc(studentId)}">Decline</button>`
            : w.gallery === "approved" ? `<button type="button" class="btn btn--ghost btn--small" data-web-decline="${esc(studentId)}">Take it out of the gallery</button>` : ""}
            <button type="button" class="btn btn--ghost btn--small" data-web-print>${icon("print")}Print a summary</button></div>
          <p class="small" id="webm-msg" role="status"></p>
        </div>
      </div>`,
      onOpen(dlg) {
        dlg.querySelectorAll("[data-wsz]").forEach((b) => b.addEventListener("click", () => {
          dlg.querySelectorAll("[data-wsz]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
          dlg.querySelector("#webm-box").classList.toggle("is-phone", b.dataset.wsz === "phone");
        }));
        dlg.querySelector("#webm-note").addEventListener("submit", (e) => {
          e.preventDefault();
          SE.store.reviewWebsite(studentId, { teacherNote: dlg.querySelector("#webm-note-t").value });
          dlg.querySelector("#webm-msg").textContent = "Note saved. The student sees it under Hand in or share.";
        });
        dlg.addEventListener("click", (e) => {
          if (e.target.closest("[data-web-print]")) { document.body.classList.add("web-printing"); window.print(); }
          else if (decide(e)) dlg.close();
        });
        window.addEventListener("afterprint", () => document.body.classList.remove("web-printing"), { once: true });
      },
      onClose: () => SE.route(true) });
  }

  /* Approve or decline a request (from the list or the dialog). True when something changed. */
  function decide(e) {
    const ap = e.target.closest("[data-web-approve]"), de = e.target.closest("[data-web-decline]");
    if (ap && SE.store.reviewWebsite(ap.dataset.webApprove, { gallery: "approved" })) { SE.toast("Approved. It's in the class gallery now."); return true; }
    if (de && SE.store.reviewWebsite(de.dataset.webDecline, { gallery: "none" })) { SE.toast("Not shared. The student can ask again."); return true; }
    return false;
  }

  function bind(cls) {
    const sec = document.getElementById("class-websites");
    if (!sec) return;
    sec.addEventListener("click", (e) => {
      const o = e.target.closest("[data-web-open]");
      if (o) { open(cls, o.dataset.webOpen); return; }
      if (decide(e)) SE.route(true);
    });
  }

  SE.teachWebsites = { block, bind, open };
})();
