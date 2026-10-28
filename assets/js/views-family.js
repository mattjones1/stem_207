/*
 * STEM 207 — Family (#/family): a parent's children, learning at home (planning/STEM 207 PAID.md).
 *
 * A family is a small class (kind "family", SE.store.familyOf / createFamily) with up to 4 children.
 * Children sign in like students: the family code, their name, and their 3 secret pictures. At home
 * there's no teacher: a written answer earns the XP when it's sent (game.js), so this page shows
 * each child's progress and what they wrote, read-only. No checks, plans, or messages.
 * Needs a Family or Educator plan (SE.access.canFamily); without one it shows what Family adds.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const STEM = window.STEM;
  const { icon, esc, plural } = SE;
  const app = () => document.getElementById("app");
  let pendingRemove = null;

  function top(title, lede, code) {
    return `
      <section class="page-top">
        <div class="wrap page-top__inner">
          <div class="page-top__head"><span class="icon-badge">${icon("users")}</span><div><span class="eyebrow">Learning at home</span><h1 tabindex="-1">${esc(title)}</h1></div></div>
          ${code ? `<p class="code-chip" title="Children use this code to sign in">${icon("key")}Family code <b>${esc(code)}</b></p>` : ""}
          <p class="page-top__lede">${esc(lede)}</p>
        </div>
      </section>`;
  }

  /* One child's card: rank, XP, patches, and what they've sent lately (their own words). */
  function childCard(st, fam) {
    const prof = SE.game.profile(st.id);
    const recent = prof.completions.slice(-3).reverse();
    return `
      <li class="fam-child">
        <div class="fam-child__head">
          ${SE.studentAvatar(st.id, 56, prof)}
          <div><h3>${esc(st.displayName)}</h3><p class="muted small">${esc(prof.rank.name)} · ${esc((SE.gradeById[st.gradeBand] || {}).name || "")} · last active ${prof.lastActive ? SE.timeAgo(prof.lastActive) : "never"}</p></div>
        </div>
        ${SE.rankBar(prof, true)}
        <dl class="xstats xstats--light">
          <div><dt>XP</dt><dd>${SE.num(prof.xp)}</dd></div>
          <div><dt>Done</dt><dd>${prof.completedIds.size}</dd></div>
          <div><dt>Patches</dt><dd>${prof.earnedCount}</dd></div>
        </dl>
        ${recent.length ? `<h4>Lately</h4><ul class="fam-recent">${recent.map((c) => `<li><a href="#/activity/${c.activity.id}">${esc(c.activity.title)}</a><small>${SE.timeAgo(c.event.at)}</small>${c.event.data.reflection ? `<blockquote>${esc(c.event.data.reflection)}</blockquote>` : ""}</li>`).join("")}</ul>`
          : `<p class="muted small">Nothing sent yet. When ${esc(st.displayName.split(" ")[0])} finishes an activity and writes what they did, it shows up here.</p>`}
        <div class="fam-child__tools">
          <button type="button" class="btn btn--ghost btn--small" data-newpics="${st.id}">${icon("refresh")}New pictures</button>
          ${pendingRemove === st.id
            ? `<span class="confirm-inline">Remove ${esc(st.displayName)} and all their work? <button type="button" class="btn btn--danger btn--small" data-remove-yes="${st.id}">Remove</button><button type="button" class="btn btn--ghost btn--small" data-remove-no>Keep</button></span>`
            : `<button type="button" class="btn btn--ghost btn--small" data-remove="${st.id}">${icon("trash")}Remove</button>`}
        </div>
      </li>`;
  }

  SE.views.family = function (user) {
    if (!SE.access.canFamily(user)) {
      const p = SE.access.PRICES.family;
      app().innerHTML = top("Family", "Children learn at home with every STEM 207 activity, and earn XP, ranks, and patches as they go.") + `
        <section class="wrap section">
          <div class="block fam-pitch">
            <h2>${icon("star")}Add your children with the Family plan</h2>
            <ul class="bullets">
              <li><span>Up to ${SE.store.FAMILY_MAX} children, each with their own secret pictures. No child email or password.</span></li>
              <li><span>Every activity and lab, at every level.</span></li>
              <li><span>XP when they explain what they did, plus ranks, patches, and My harbor.</span></li>
              <li><span>See what each child has done, in their own words.</span></li>
            </ul>
            <p><strong>$${p.month} a month, or $${p.year} a year.</strong></p>
            <div class="acct__actions">
              <a class="btn btn--primary" href="#/pricing">${icon("arrowRight")}See plans</a>
              <a class="btn btn--ghost" href="#/activities">${icon("compass")}Try the free activities</a>
            </div>
          </div>
        </section>`;
      return;
    }
    const fam = SE.store.familyOf(user.id) || SE.store.createFamily(user);
    const kids = SE.store.studentsIn(fam.id);
    const room = kids.length < SE.store.FAMILY_MAX;
    app().innerHTML = top(fam.name, "Each child signs in with the family code and their own 3 secret pictures.", fam.code) + `
      <section class="wrap section" aria-labelledby="kids-title">
        <div class="section__head"><div><h2 id="kids-title">${plural(kids.length, "child", "children")}</h2></div>
          <p class="muted">Up to ${SE.store.FAMILY_MAX}. Children earn XP when they finish an activity and write what they did.</p></div>
        ${kids.length ? `<ul class="fam-kids">${kids.map((k) => childCard(k, fam)).join("")}</ul>` : ""}
        ${room ? `
        <form class="block fam-add" id="fam-add" novalidate>
          <h3>${icon("plus")}Add a child</h3>
          <div class="fam-add__row">
            <div class="form__field"><label for="fa-name">Name they'll see</label><input id="fa-name" class="input" maxlength="24" placeholder="Sam L." aria-describedby="fa-help fa-err"></div>
            <div class="form__field"><label for="fa-grade">Grade</label><select id="fa-grade" class="input">${STEM.gradeBands.map((g) => `<option value="${g.id}" ${g.id === "4-5" ? "selected" : ""}>${esc(g.name)}</option>`).join("")}</select></div>
            <button type="submit" class="btn btn--primary">${icon("plus")}Add</button>
          </div>
          <p class="field-help" id="fa-help">A first name and last initial is plenty. No birthdays or other personal details.</p>
          <p class="form__error" id="fa-err" role="alert"></p>
        </form>` : `<p class="muted">Your family has ${SE.store.FAMILY_MAX} children, the most a Family plan covers.</p>`}
      </section>
      ${kids.length ? `
      <section class="wrap section" aria-labelledby="fcards-title">
        <div class="section__head"><div><span class="eyebrow">Sign-in cards</span><h2 id="fcards-title">How your children sign in</h2></div>
          <button type="button" class="btn btn--ghost" id="fam-print">${icon("print")}Print the cards</button></div>
        <ol class="fam-steps"><li>Open STEM 207 and choose <strong>I'm a student</strong>.</li><li>Type the family code <strong>${esc(fam.code)}</strong>.</li><li>Pick your name, then tap your 3 secret pictures.</li></ol>
        <div class="login-cards">${kids.map((k) => SE.loginCard(k, fam)).join("")}</div>
      </section>` : ""}`;

    const form = document.getElementById("fam-add");
    if (form) form.addEventListener("submit", (e) => {
      e.preventDefault();
      const r = SE.store.addStudent(fam.id, { displayName: document.getElementById("fa-name").value, gradeBand: document.getElementById("fa-grade").value });
      if (!r.ok) { document.getElementById("fa-err").textContent = r.error; document.getElementById("fa-name").focus(); return; }
      SE.toast(`${r.student.displayName} is in. Print their sign-in card below.`);
      SE.route(true);
    });
    const print = document.getElementById("fam-print");
    if (print) print.addEventListener("click", () => window.print());
    app().querySelectorAll("[data-newpics]").forEach((b) => b.addEventListener("click", () => { SE.store.newPictureCodeFor(b.dataset.newpics); SE.toast("New secret pictures. Print a new card."); SE.route(true); }));
    app().querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", () => { pendingRemove = b.dataset.remove; SE.route(true); }));
    app().querySelectorAll("[data-remove-no]").forEach((b) => b.addEventListener("click", () => { pendingRemove = null; SE.route(true); }));
    app().querySelectorAll("[data-remove-yes]").forEach((b) => b.addEventListener("click", () => { SE.store.removeStudent(b.dataset.removeYes); pendingRemove = null; SE.toast("Removed."); SE.route(true); }));
  };
})();
