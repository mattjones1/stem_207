/*
 * STEM 207 — router, header, and app start-up.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;

  /* ───────── Header ───────── */
  function renderNav(user, navKey) {
    const nav = document.getElementById("site-nav");
    const link = (href, key, label) => `<a href="${href}" ${navKey === key ? 'aria-current="page"' : ""}>${label}</a>`;
    let html = "";
    if (!user) {
      html = `<a href="#/signin" class="nav-signin">${icon("user")}Sign in</a>`;
    } else if (user.role === "guest") {
      html = link("#/", "dashboard", "Home") + link("#/activities", "activities", "Activities") +
        `<a href="#/signin" class="nav-signin" data-signout>${icon("user")}Sign in</a>`;
    } else if (user.role === "student") {
      const prof = SE.game.profile(user.id);
      html = link("#/", "dashboard", "Home") + link("#/plans", "plans", "My Learning Plans") + link("#/activities", "activities", "Activities") + link("#/base", "base", "My harbor") +
        `<a href="#/me" class="user-chip" ${navKey === "me" ? 'aria-current="page"' : ""}>${SE.ownAvatar(user.id, 28)}<span><b>${esc(user.displayName)}</b><small>${SE.num(prof.xp)} XP · ${esc(prof.rank.name)}</small></span></a>` +
        `<button type="button" class="nav-out" data-signout>${icon("logout")}<span>Sign out</span></button>`;
    } else {
      const waiting = SE.teachChecksWaiting ? SE.teachChecksWaiting(user) : 0;
      html = link("#/teach", "teach", "Dashboard") + link("#/teach/plans", "plans", "Learning Plans") + link("#/activities", "activities", "Activities") +
        link("#/teach/classes", "classes", "Classes") + link("#/teach/checks", "checks", `Checks${waiting ? ` <span class="nav-badge" aria-label="${waiting} waiting">${waiting}</span>` : ""}`) +
        `<span class="user-chip user-chip--edu">${icon("clipboard")}<span><b>${esc(user.name)}</b><small>Educator</small></span></span>` +
        `<button type="button" class="nav-out" data-signout>${icon("logout")}<span>Sign out</span></button>`;
    }
    nav.innerHTML = html;
    nav.querySelectorAll("[data-signout]").forEach((b) => b.addEventListener("click", async (e) => {
      if (b.tagName === "BUTTON") e.preventDefault();
      b.disabled = true;
      await SE.store.signOut();
      location.hash = "#/signin";
      route(true);
    }));
  }

  function setScrollPad() {
    const h = document.querySelector(".site-header").offsetHeight;
    document.documentElement.style.scrollPaddingTop = `${h + 12}px`;
  }

  /* ───────── Router ───────── */
  function parseRoute() {
    const raw = location.hash.replace(/^#/, "");
    const [path, anchor] = raw.split("#");
    const parts = path.split("/").filter(Boolean);
    return { parts, anchor: anchor || "" };
  }

  let lastKey = null;
  function route(force) {
    const { parts, anchor } = parseRoute();
    const key = parts.join("/");
    if (!force && key === lastKey && anchor) { jumpTo(anchor); return; }
    // In-page jump links like #s-steps aren't routes.
    if (parts.length === 1 && /^s-/.test(parts[0])) return;
    lastKey = key;

    const user = SE.store.currentUser();
    const [a, b, c] = parts;
    const isAuthRoute = a === "signin" || a === "signup";
    let navKey = "";
    let title = "STEM 207";

    document.querySelectorAll(".overlay").forEach((o) => o.remove());
    document.body.classList.remove("has-overlay");

    if (!user && !isAuthRoute) { location.replace("#/signin"); return; }

    const MOVED = {
      library: "#/activities", explore: "#/plans",   // #/teach/missions stays (assign, due dates, notes) until Learning Plans replace it
      "teach/pathways": "#/teach/plans", "teach/class": "#/teach/classes", "teach/reflections": "#/teach/checks"
    };
    const moved = MOVED[`${a}/${b}`] || (!b && MOVED[a]);
    if (moved) { location.replace(moved + (a === "teach" && b === "pathways" && c ? `/${parts.slice(2).join("/")}` : "")); return; }
    if (a === "area" && b) { location.replace(`#/activities/${b}`); return; }
    // The coding pathway and the AI route are Learning Plan templates now.
    const tpl = { pathway: "tpl-coding-foundations", "ai-route": "tpl-ai-route" }[a === "teach" && b === "pathway" ? "pathway" : a];
    if (tpl && (a !== "teach" || b === "pathway")) {
      location.replace(user.role === "educator" ? `#/teach/plans/${tpl}` : user.role === "student" ? "#/plans" : `#/activities/${tpl === "tpl-ai-route" ? "ai" : "coding"}`);
      return;
    }

    if (a === "signin" && !b) { SE.views.signin(); title = "Sign in · STEM 207"; }
    else if (a === "signin" && b === "student") { SE.views.signinStudent(); title = "Student sign in · STEM 207"; }
    else if (a === "signin" && b === "educator") { SE.views.signinEducator(); title = "Educator sign in · STEM 207"; }
    else if (a === "signup") { SE.views.signup(); title = "Create account · STEM 207"; }
    else if (a === "teach") {
      if (user.role !== "educator") { location.replace("#/signin/educator"); return; }
      navKey = { plans: "plans", classes: "classes", checks: "checks" }[b] || "teach";
      if (!b) SE.views.teach(user);
      else if (b === "student") SE.views.teachStudent(user, c);
      else if (b === "missions") SE.views.teachMissions(user, c);
      else if (b === "checks") SE.views.teachChecks(user);
      else if (b === "classes") (c ? SE.views.teachClassPage(user, c) : SE.views.teachClasses(user));
      else if (b === "plans") SE.views.teachPathways(user, parts.slice(2));
      else SE.views.notFound();
      title = "Educator dashboard · STEM 207";
    }
    else if (!a && user.role === "student") { SE.views.today(user); navKey = "dashboard"; title = "Home · STEM 207"; }
    else if (a === "plans") {
      if (user.role !== "student") { location.replace("#/teach/plans"); return; }
      SE.views.dashboard(user, "explore"); navKey = "plans"; title = "My Learning Plans · STEM 207";
    }
    else if (!a) {
      if (user.role === "educator") { location.replace("#/teach"); return; }
      SE.views.dashboard(user, ""); navKey = "dashboard";
    }
    else if (a === "activities") {
      SE.views.activities(user, b); navKey = "activities";
      title = `${b && SE.areaById[b] ? SE.areaById[b].name : "Activities"} · STEM 207`;
    }
    else if (a === "my" && b === "pathways") {
      if (user.role !== "student") { location.replace("#/"); return; }
      SE.views.myPathway(user, c); navKey = "dashboard"; title = "My pathway · STEM 207";
    }
    else if (a === "me") {
      if (user.role !== "student") { location.replace("#/"); return; }
      SE.views.me(user); navKey = "me"; title = "My profile · STEM 207";
    }
    else if (a === "base") {
      if (user.role !== "student") { location.replace("#/"); return; }
      SE.views.base(user); navKey = "base"; title = "My harbor · STEM 207";
    }
    else if (a === "activity") { SE.views.activity(user, b); title = `${SE.activityById[b] ? SE.activityById[b].title : "Not found"} · STEM 207`; }
    else if (a === "lab") {
      SE.views.lab(user, b, c);
      const lab = SE.labs.byId(b);
      title = `${lab ? lab.title : "Lab"} · STEM 207`;
    }
    else if (a === "moxie" && !b) { SE.views.moxie(user); navKey = "activities"; title = "Moxie · STEM 207"; }
    else if (a === "moxie" && b === "teach") {
      if (user.role !== "educator") { location.replace("#/signin/educator"); return; }
      SE.views.moxieTeach(user); navKey = "teach"; title = "Teach Moxie · STEM 207";
    }
    else SE.views.notFound();

    document.title = title;
    document.body.dataset.role = user ? user.role : "none";
    renderNav(isAuthRoute ? null : user, navKey);
    if (isAuthRoute) document.getElementById("site-nav").innerHTML = "";

    if (anchor) {
      jumpTo(anchor);
    } else if (!force || isAuthRoute) {
      window.scrollTo(0, 0);
      const h1 = document.querySelector("#app h1");
      if (h1 && booted) h1.focus({ preventScroll: true });
    }
  }
  SE.route = route;

  function jumpTo(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ block: "start" });
    const target = el.querySelector("h2") || el;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }

  document.getElementById("app").addEventListener("click", (e) => {
    const j = e.target.closest("[data-jump]");
    if (!j) return;
    e.preventDefault();
    jumpTo(j.dataset.jump);
  });

  /* ───────── Start ───────── */
  let booted = false;
  SE.paintBrand();
  window.addEventListener("hashchange", () => route(false));
  window.addEventListener("resize", setScrollPad);
  SE.store.ready.then(() => {
    const note = document.getElementById("storage-note");
    if (note && SE.store.mode === "cloud") note.textContent = "Data is saved in your school's STEM 207 database.";
    if (SE.store.loadError) SE.toast("We couldn't load your latest data. Check the internet connection, then refresh.");
    route(false);
    booted = true;
    setScrollPad();
  });
})();
