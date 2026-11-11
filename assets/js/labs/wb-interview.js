/*
 * STEM 207 Website Builder — the start: welcome, the guided interview (with a live preview that the builder redraws
 * after each answer), Here's What You Told Us, and the Big Reveal.
 * It's the lab's landing screen (lab-wb.js registers it). The builder is rule-based (wb-composer.js), never AI, and
 * the screens say so. Answers and the website stay on this device.
 *
 *   SE.wbInterview.mount(el, api, store)   store: { load(), save(state) } from lab-wb.js
 *   SE.wbInterview.EXAMPLE                 the sample answers behind Explore an Example
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;
  const C = () => SE.wbComposer, WK = () => SE.webKit;

  const EXAMPLE = { kind: "animals", idea: "A website about Maine moose: where they live, what they eat, and how to spot one safely.", name: "Maine Moose Facts", sections: [{ id: "welcome", more: "Welcome to moose country!" }, { id: "facts", more: "Moose can swim for miles. A moose eats about 50 pounds of plants a day." }, { id: "pictures", more: "" }, { id: "favorites", more: "ponds, forests and mountains" }], style: "nature", special: "hero", audience: "learners" };
  const Q = [
    { key: "kind", h: "What are we building?", say: "Pick the kind of website you want to make. You can change it later.", required: true },
    { key: "idea", h: "What's the big idea?", say: "Tell us what your website should be about, in a sentence or two.", hint: "Try describing what someone should learn, see, or do when they visit.", examples: ["A website about cool places in Maine to hike and explore nature.", "A fan page where players share building tips.", "A made-up bakery that sells blueberry muffins."], required: true },
    { key: "name", h: "What's your website called?", say: "Give it a name. It goes at the top of your page and in the browser tab.", required: true },
    { key: "sections", h: "What should people see?", say: "Pick the parts you want. Add a few words to any of them, and the builder will use your words.", note: "Please don't include your full name, address, school, phone number, or anyone's contact information.", required: true },
    { key: "style", h: "What's your style?", say: "Pick a look, or choose your own color. Then add one special touch if you like. Watch the preview change." },
    { key: "pic", h: "Pick your main picture", say: "It goes at the top of your page. The first ones match your words, but you decide.", optional: true },
    { key: "audience", h: "Who is it for?", say: "This changes the text size, the words on the big button, and the footer.", optional: true }
  ];
  const nameIdeas = (a) => {
    const w = (String(a.idea || "").match(/\b[a-z]{4,}\b/gi) || []).filter((x) => !/^(about|website|where|there|their|people|share|that|with|this|want|makes?|places?|cool)$/i.test(x));
    const t = w[0] ? w[0][0].toUpperCase() + w[0].slice(1).toLowerCase() : C().KINDS[a.kind || "other"].label.split(" ").pop();
    return [`${t} Zone`, `All About ${t}`, `The ${t} Club`, `${t} HQ`];
  };

  function mount(el, api0, store) {
    // On the landing screen the lab shell passes only { user }: log quietly, and say things in the card itself.
    const api = Object.assign({ log() {}, say(t) { const m = el.querySelector("#wb-msg"); if (m) m.textContent = t; } }, api0);
    const state = store.load();
    state.answers = Object.assign({ kind: "", idea: "", name: "", sections: [], style: "", color: "#145b72", special: "", pic: "", audience: "" }, state.answers || {});
    const A = state.answers;
    let q = state.q || 0;
    const save = () => { state.q = q; store.save(state); };

    function welcome() {
      el.innerHTML = `<div class="wbx wbx--welcome${state.v1 ? " wbx--two" : ""}">
        <div class="wb-hero"><p class="eyebrow">STEM 207 Website Builder</p><h2>Your ideas. Your website. Your code.</h2>
          <p>Ever imagined creating your own website? Tell us what you have in mind, and our builder will turn your ideas into a real first version. Then you'll learn how to change the real code and make it completely your own.</p>
          <p class="muted small">The builder is a program that follows rules to turn your answers into HTML and CSS. It isn't AI, and you'll see every line it writes.</p>
          <div class="wb-actions"><button type="button" class="btn btn--launch" id="wb-go">${icon("rocket")}Let's Build Something</button><button type="button" class="btn btn--ghost" id="wb-example">${icon("eye")}Explore an Example</button></div>
          ${state.v1 ? `<p><a href="#/lab/website-builder/1">${icon("arrowRight")}Back to my website in the Coding Studio</a></p>` : ""}
        </div>
        ${state.v1 ? achievements(state, api) : ""}
      </div>`;
      el.querySelector("#wb-go").addEventListener("click", () => { q = state.v1 ? 7 : 0; save(); interview(); });
      el.querySelector("#wb-example").addEventListener("click", () => reveal(C().build(EXAMPLE), true));
    }

    const dots = () => `<ol class="wb-dots" aria-label="Question ${Math.min(q + 1, Q.length)} of ${Q.length}">${Q.map((x, i) => `<li class="${i === q ? "is-on" : i < q ? "is-done" : ""}"><span class="visually-hidden">${esc(x.h)}${i < q ? " (answered)" : ""}</span></li>`).join("")}</ol>`;
    function pickRow(key, list, value, label) { return `<div class="wb-picks" role="group" aria-label="${esc(label || Q.find((x) => x.key === key).h)}">${Object.entries(list).map(([k, v]) => `<button type="button" class="wb-pick" data-k="${key}" data-v="${k}" aria-pressed="${value === k}">${v.pic ? `<img src="${WK().PICTURES[v.pic]}" alt="" width="56" height="42">` : ""}<span>${esc(v.label || v)}</span></button>`).join("")}</div>`; }
    /* The live preview: the builder redraws the page after each answer, and the frame glows once to show it changed. */
    const live = () => `<aside class="wb-live" aria-labelledby="wb-live-h"><p class="wb-live__h" id="wb-live-h">${icon("eye")}Your website so far</p>
      <div class="wb-live__box" id="wb-live-box"><iframe class="wb-live__f" id="wb-live" title="Live preview of your website" sandbox="allow-same-origin"></iframe></div>
      <p class="muted small">A sketch from your answers. The builder redraws it each time you answer.</p></aside>`;
    let liveTimer = null;
    function redraw(glow) {
      clearTimeout(liveTimer);
      liveTimer = setTimeout(() => {
        const f = el.querySelector("#wb-live");
        if (!f) return;
        const r = C().build(A);
        f.srcdoc = WK().srcdoc(r.html, { css: r.css, title: r.title });
        const box = el.querySelector("#wb-live-box");
        if (glow && box) { box.classList.remove("is-new"); void box.offsetWidth; box.classList.add("is-new"); }
      }, glow ? 250 : 0);
    }
    const picName = (f) => { const t = f.replace(/\.svg$/, "").replace(/-/g, " "); return t[0].toUpperCase() + t.slice(1); };
    /* Pictures that match the student's words first, then every other built-in picture. */
    function pictureChoices() {
      const text = [A.idea, ...A.sections.map((s) => s.more)].join(" ");
      const first = C().picturesFor(text, A.kind || "other", A.idea), all = Object.keys((SE.webKit && SE.webKit.PICTURE_INFO) || {});
      const out = {};
      first.concat(all.filter((x) => !first.includes(x))).forEach((f) => { out[f] = { label: picName(f), pic: f }; });
      return out;
    }
    function interview() {
      if (q >= Q.length) return review();
      const x = Q[q];
      let body = "";
      if (x.key === "kind") body = pickRow("kind", C().KINDS, A.kind);
      else if (x.key === "idea") body = `<label class="visually-hidden" for="wb-idea">Your big idea</label><textarea class="input" id="wb-idea" rows="3" maxlength="300" placeholder="My website is about…">${esc(A.idea)}</textarea>
        <p class="wb-hint">${icon("bulb")}${esc(x.hint)}</p><p class="wb-label">Need an idea? Tap one, then change it:</p><div class="wb-chips">${x.examples.map((e) => `<button type="button" class="wb-chip" data-ex="${esc(e)}">${esc(e)}</button>`).join("")}</div>`;
      else if (x.key === "name") body = `<label class="visually-hidden" for="wb-name">Website name</label><input class="input" id="wb-name" maxlength="60" value="${esc(A.name)}" placeholder="Maine Moose Facts">
        <p class="wb-label">Name ideas (tap one, or keep your own):</p><div class="wb-chips">${nameIdeas(A).map((n) => `<button type="button" class="wb-chip" data-name="${esc(n)}">${esc(n)}</button>`).join("")}</div>`;
      else if (x.key === "sections") body = `<p class="wb-note">${icon("alert")}${esc(x.note)}</p><div class="wb-secs">${Object.entries(C().SECTION_INFO).map(([k, v]) => { const s = A.sections.find((y) => y.id === k); return `<div class="wb-sec"><label class="wb-check"><input type="checkbox" data-sec="${k}" ${s ? "checked" : ""}> ${esc(v.label)}</label>
          <label class="visually-hidden" for="wb-more-${k}">Tell us more about ${esc(v.label)}</label><input class="input wb-more" id="wb-more-${k}" data-more="${k}" maxlength="160" placeholder="Tell us more (optional): ${k === "favorites" ? "hiking, kayaking and camping" : k === "facts" ? "Moose can swim." : "a few words"}" value="${esc(s ? s.more : "")}" ${s ? "" : "hidden"}></div>`; }).join("")}</div>`;
      else if (x.key === "style") body = `${pickRow("style", C().THEMES, A.style)}<div class="wb-own" ${A.style === "custom" ? "" : "hidden"}><label class="wb-field">My color<input type="color" id="wb-color" value="${esc(A.color)}"></label></div>
        <p class="wb-label">One special touch (optional):</p>${pickRow("special", C().SPECIALS, A.special, "One special touch")}<p class="muted small">The builder only makes things HTML and CSS can really do. Moving parts would need JavaScript, which comes later.</p>`;
      else if (x.key === "pic") body = pickRow("pic", pictureChoices(), A.pic);
      else if (x.key === "audience") body = pickRow("audience", C().AUDIENCES, A.audience);
      el.innerHTML = `<div class="wbx wbx--q wbx--live">
        <section class="wb-card" aria-labelledby="wb-qh">${dots()}<p class="wb-qn">Question ${q + 1} of ${Q.length}</p><h2 id="wb-qh" tabindex="-1">${esc(x.h)}</h2><p>${esc(x.say)}</p>${body}
          <p class="wb-msg" id="wb-msg" role="status"></p>
          <div class="wb-actions">${q ? `<button type="button" class="btn btn--ghost" id="wb-back">${icon("arrowLeft")}Back</button>` : ""}
            ${x.optional ? `<button type="button" class="btn btn--ghost" id="wb-skip">Skip this one</button>` : ""}
            <button type="button" class="btn btn--primary" id="wb-next">${q === Q.length - 1 ? "Review my idea" : "Next"}${icon("arrowRight")}</button></div>
        </section>${live()}</div>`;
      el.querySelector("#wb-qh").focus();
      redraw(false);
    }
    function answered(x) {
      if (x.key === "kind") return !!A.kind;
      if (x.key === "idea") return A.idea.trim().split(/\s+/).length >= 4 || "Write at least a few words about your idea, like what visitors should learn or see.";
      if (x.key === "name") return !!A.name.trim() || "Give your website a name, or tap a name idea.";
      if (x.key === "sections") return A.sections.length >= 1 || "Pick at least one part for your page.";
      if (x.key === "style") return !!A.style || "Pick a style, or choose My own style and a color.";
      return true;
    }
    function review() {
      const row = (i, label, val) => `<div class="wb-rv"><dt>${esc(label)}</dt><dd>${esc(val || "(skipped)")}</dd><button type="button" class="linkish" data-edit="${i}" aria-label="Edit ${esc(label)}">Edit</button></div>`;
      el.innerHTML = `<div class="wbx wbx--q wbx--live"><section class="wb-card" aria-labelledby="wb-rh"><h2 id="wb-rh" tabindex="-1">Here's What You Told Us</h2>
        <dl class="wb-rvs">
          ${row(0, "Kind of website", (C().KINDS[A.kind] || {}).label)}${row(1, "The big idea", A.idea)}${row(2, "Name", A.name)}
          ${row(3, "What people see", A.sections.map((s) => C().SECTION_INFO[s.id].label + (s.more ? ` (${s.more})` : "")).join("; "))}
          ${row(4, "Style", A.style === "custom" ? `My own style (${A.color})` : (C().THEMES[A.style] || {}).label)}${row(4, "Special touch", C().SPECIALS[A.special])}${row(5, "Main picture", A.pic ? picName(A.pic) : "")}${row(6, "Who it's for", C().AUDIENCES[A.audience])}
        </dl>
        <p>STEM 207's website builder is a program that follows rules to turn your answers into HTML and CSS. It isn't AI. It will write the first version, and you'll see every line it writes.</p>
        <p class="wb-msg" id="wb-msg" role="status"></p>
        <div class="wb-actions"><button type="button" class="btn btn--launch" id="wb-build">${icon("rocket")}Build My Website</button></div></section>${live()}</div>`;
      el.querySelector("#wb-rh").focus();
      redraw(false);
    }
    function reveal(r, isExample) {
      const doc = WK().srcdoc(r.html, { css: r.css, title: r.title });
      // The website gets the big left column; the words and the one main button sit beside it, on the first screen.
      el.innerHTML = `<div class="wbx wbx--reveal">
        <section class="wb-card" aria-labelledby="wb-vh">
          <div class="wb-reveal__view">
            <div class="wb-size" role="group" aria-label="Preview size"><button type="button" class="btn btn--ghost btn--small" data-size="desk" aria-pressed="true">Desktop</button><button type="button" class="btn btn--ghost btn--small" data-size="phone" aria-pressed="false">Phone</button></div>
            <div class="wb-frame-box" id="wb-box"><iframe class="wb-frame" title="${esc(isExample ? "The example website" : "Your website, version 1")}" sandbox="allow-same-origin" srcdoc="${esc(doc)}"></iframe></div>
          </div>
          <div class="wb-reveal__say">
            <p class="eyebrow">${isExample ? "Example project: made from sample answers" : "Version 1"}</p>
            <h2 id="wb-vh" tabindex="-1">${isExample ? "Here's an example website" : "You Made a Website!"}</h2>
            <p>${isExample ? "The builder made this from sample answers about Maine moose. Make your own to change the code." : "Your ideas are now real HTML and CSS. The builder wrote this first draft by following rules. You're the designer: your job is to understand it, test it, and make it better."}</p>
            <div class="wb-actions">${isExample
              ? `<button type="button" class="btn btn--launch" id="wb-mine">${icon("rocket")}Make my own</button>`
              : `<a class="btn btn--launch" href="#/lab/website-builder/1" data-open="studio">${icon("code")}Open my code</a>`}</div>
            ${isExample ? "" : `<p class="wb-more-ways">Or start with: <a href="#/lab/website-builder/1" data-open="explore">${icon("search")}Explore my code</a> <a href="#/lab/website-builder/1" data-open="change">${icon("palette")}Make a change</a></p>`}
            <div class="wb-two"><p><strong>HTML</strong> says what each part is: a heading, a list, a picture. It's in <code>index.html</code>.</p><p><strong>CSS</strong> says how it looks: colors, fonts, and spacing. It's in <code>styles.css</code>.</p></div>
            <details class="wb-what" open><summary>What the builder made</summary><ul>${r.explanation.map((x) => `<li>${esc(x)}</li>`).join("")}${r.notes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><p class="muted small">It used: ${esc(r.concepts.join(", "))}.</p></details>
          </div>
        </section></div>`;
      el.querySelector("#wb-vh").focus();
      el.querySelectorAll("[data-size]").forEach((b) => b.addEventListener("click", () => {
        el.querySelectorAll("[data-size]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        el.querySelector("#wb-box").classList.toggle("is-phone", b.dataset.size === "phone");
      }));
      const mine = el.querySelector("#wb-mine");
      if (mine) mine.addEventListener("click", () => { q = 0; save(); interview(); });
      el.querySelectorAll("[data-open]").forEach((a) => a.addEventListener("click", (e) => {
        try { sessionStorage.setItem("stem207.wb.open", a.dataset.open); } catch (x) { /* private mode */ }
        // Started from an activity link, the address is already #/lab/website-builder/1: draw the studio again.
        if (location.hash === a.getAttribute("href") && SE.route) { e.preventDefault(); SE.route(true); }
      }));
    }

    el.addEventListener("input", (e) => {
      const t = e.target;
      if (t.id === "wb-idea") A.idea = t.value;
      else if (t.id === "wb-name") A.name = t.value;
      else if (t.id === "wb-color") A.color = t.value;
      else if (t.dataset.more) { const s = A.sections.find((y) => y.id === t.dataset.more); if (s) s.more = t.value; }
      else return;
      save(); redraw(true);
    });
    el.addEventListener("change", (e) => {
      const t = e.target;
      if (!t.dataset.sec) return;
      const k = t.dataset.sec, more = el.querySelector(`[data-more="${k}"]`);
      if (t.checked) { if (!A.sections.find((y) => y.id === k)) A.sections.push({ id: k, more: "" }); more.hidden = false; }
      else { A.sections = A.sections.filter((y) => y.id !== k); more.hidden = true; }
      save(); redraw(true);
    });
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.k) {
        A[b.dataset.k] = b.dataset.v; save();
        el.querySelectorAll(`[data-k="${b.dataset.k}"]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        const own = el.querySelector(".wb-own"); if (own) own.hidden = A.style !== "custom";
        redraw(true);
      } else if (b.dataset.ex) { A.idea = b.dataset.ex; el.querySelector("#wb-idea").value = A.idea; save(); redraw(true); }
      else if (b.dataset.name) { A.name = b.dataset.name; el.querySelector("#wb-name").value = A.name; save(); redraw(true); }
      else if (b.id === "wb-next") { const ok = answered(Q[q]); if (ok !== true) { el.querySelector("#wb-msg").textContent = ok || "Pick one to go on."; return; } q++; save(); interview(); }
      else if (b.id === "wb-back") { q--; save(); interview(); }
      else if (b.id === "wb-skip") { A[Q[q].key] = ""; q++; save(); interview(); }
      else if (b.dataset.edit) { q = Number(b.dataset.edit); save(); interview(); }
      else if (b.id === "wb-build") {
        if (state.v1 && b.dataset.sure !== "1") { b.dataset.sure = "1"; b.lastChild.textContent = "Yes, build a new Version 1"; api.say("You already have a website. Building again makes a new Version 1 from these answers. Your current code is saved in Versions first.", "warn"); return; }
        const r = C().build(A);
        const clean = SE.webKit.sanitize(r.html);   // the builder's code goes through the same safety check as anyone's
        if (state.files) { state.versions = state.versions || []; state.versions.push({ at: Date.now(), label: "Before rebuilding", html: state.files.html, css: state.files.css }); }
        state.v1 = { html: clean, css: r.css, title: r.title, at: Date.now() };
        state.files = { html: clean, css: r.css };
        state.title = r.title;
        state.base = {};
        save();
        api.log("lab_test_run", { stage: "build", theme: r.theme, sections: r.sections.length });   // choices only, never the student's words
        reveal(r, false);
      }
    });
    if (state.v1 && state.q >= Q.length) reveal(C().build(A), false);
    else if (!A.kind && !state.v1) welcome();
    else if (state.v1) welcome();
    else interview();
  }

  /* Levels of achievement, from real work only. */
  function achievements(state, api) {
    const done = SE.labs.progressFor(api.user, "website-builder");
    const L = [
      { k: "Website Created", ok: !!state.v1, say: "The builder made your Version 1." },
      { k: "Code Explorer", ok: [0, 1, 2].every((i) => done.has(i)), say: "Activities 1 to 3: you read and changed your own HTML and CSS." },
      { k: "Website Developer", ok: done.size >= 8, say: "All 8 activities: you extended, debugged, and finished your website yourself." }
    ];
    return `<section class="wb-ach" aria-labelledby="wb-ach-h"><h3 id="wb-ach-h">Your progress</h3><ul>${L.map((x) => `<li class="${x.ok ? "is-ok" : ""}">${icon(x.ok ? "check" : "target")}<span><strong>${esc(x.k)}</strong>${x.ok ? "" : " (not yet)"}<br><span class="muted small">${esc(x.say)}</span></span></li>`).join("")}</ul></section>`;
  }

  SE.wbInterview = { mount, EXAMPLE, achievements };
})();
