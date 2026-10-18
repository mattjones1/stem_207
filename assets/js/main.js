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
      html = link("#/", "dashboard", "Dashboard") + link("#/library", "library", "Activity library") + link("#/pathway", "pathway", "Coding pathway") +
        `<a href="#/signin" class="nav-signin" data-signout>${icon("user")}Sign in</a>`;
    } else if (user.role === "student") {
      const prof = SE.game.profile(user.id);
      html = link("#/", "dashboard", "My expedition") + link("#/library", "library", "Missions") + link("#/pathway", "pathway", "Coding pathway") +
        `<a href="#/me" class="user-chip" ${navKey === "me" ? 'aria-current="page"' : ""}>${SE.insignia(prof.rank, 24)}<span><b>${esc(user.displayName)}</b><small>${SE.num(prof.xp)} XP · ${esc(prof.rank.name)}</small></span></a>` +
        `<button type="button" class="nav-out" data-signout>${icon("logout")}<span>Sign out</span></button>`;
    } else {
      html = link("#/teach", "teach", "Educator dashboard") + link("#/library", "library", "Activity library") + link("#/pathway", "pathway", "Coding pathway") +
        `<span class="user-chip user-chip--edu">${icon("clipboard")}<span><b>${esc(user.name)}</b><small>Educator</small></span></span>` +
        `<button type="button" class="nav-out" data-signout>${icon("logout")}<span>Sign out</span></button>`;
    }
    nav.innerHTML = html + `
      <button type="button" class="projector-toggle" id="projector-toggle" aria-pressed="${document.documentElement.classList.contains("projector")}" title="Projector mode">
        ${icon("eye")}<span>Projector</span>
      </button>`;
    nav.querySelectorAll("[data-signout]").forEach((b) => b.addEventListener("click", async (e) => {
      if (b.tagName === "BUTTON") e.preventDefault();
      b.disabled = true;
      await SE.store.signOut();
      location.hash = "#/signin";
      route(true);
    }));
    document.getElementById("projector-toggle").addEventListener("click", () => setProjector(!document.documentElement.classList.contains("projector")));
  }

  /* ───────── Projector mode (per-device convenience) ───────── */
  function setProjector(on) {
    document.documentElement.classList.toggle("projector", on);
    const b = document.getElementById("projector-toggle");
    if (b) b.setAttribute("aria-pressed", String(on));
    try { localStorage.setItem("stem-explorers-projector", on ? "1" : "0"); } catch (e) { /* ignore */ }
    setScrollPad();
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

    if (a === "signin" && !b) { SE.views.signin(); title = "Sign in · STEM 207"; }
    else if (a === "signin" && b === "student") { SE.views.signinStudent(); title = "Student sign in · STEM 207"; }
    else if (a === "signin" && b === "educator") { SE.views.signinEducator(); title = "Educator sign in · STEM 207"; }
    else if (a === "signup") { SE.views.signup(); title = "Create account · STEM 207"; }
    else if (a === "teach") {
      if (user.role !== "educator") { location.replace("#/signin/educator"); return; }
      navKey = "teach";
      if (!b) SE.views.teach(user);
      else if (b === "student") SE.views.teachStudent(user, c);
      else if (b === "pathway") SE.views.teachPathway(user);
      else if (b === "missions") SE.views.teachMissions(user, c);
      else if (b === "reflections") SE.views.teachReflections(user);
      else if (b === "class") SE.views.teachClass(user);
      else SE.views.notFound();
      title = "Educator dashboard · STEM 207";
    }
    else if (!a || a === "library") {
      if (!a && user.role === "educator") { location.replace("#/teach"); return; }
      SE.views.dashboard(user);
      navKey = a === "library" ? "library" : "dashboard";
    }
    else if (a === "me") {
      if (user.role !== "student") { location.replace("#/"); return; }
      SE.views.me(user); navKey = "me"; title = "My profile · STEM 207";
    }
    else if (a === "area") { SE.views.area(user, b); title = `${SE.areaById[b] ? SE.areaById[b].name : "Not found"} · STEM 207`; }
    else if (a === "activity") { SE.views.activity(user, b); title = `${SE.activityById[b] ? SE.activityById[b].title : "Not found"} · STEM 207`; }
    else if (a === "lab") {
      SE.views.lab(user, b, c);
      const lab = SE.labs.byId(b);
      title = `${lab ? lab.title : "Lab"} · STEM 207`;
    }
    else if (a === "pathway") { SE.views.pathway(user); navKey = "pathway"; title = "Coding pathway · STEM 207"; }
    else SE.views.notFound();

    document.title = title;
    document.body.dataset.role = user ? user.role : "none";
    renderNav(isAuthRoute ? null : user, navKey);
    if (isAuthRoute) document.getElementById("site-nav").innerHTML = "";

    if (a === "library") {
      const lib = document.getElementById("library");
      if (lib) { lib.scrollIntoView({ block: "start" }); document.getElementById("library-title").focus({ preventScroll: true }); }
    } else if (anchor) {
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
  try { if (localStorage.getItem("stem-explorers-projector") === "1") document.documentElement.classList.add("projector"); } catch (e) { /* ignore */ }
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
