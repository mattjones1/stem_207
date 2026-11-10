/*
 * Build Your First Website — the website plan: stage 1's Planning Studio, and My Website Plan on every later stage.
 * Data stays on this device (in the lab's saved state). No AI: Surprise Me picks from curated lists.
 *
 *   SE.websitePlan.IDEAS               the topic cards (the three made-up Maine businesses are presets)
 *   SE.websitePlan.migrate(state)      turns an old save (state.business + the v1 plan) into a v2 plan; keeps the old notes
 *   SE.websitePlan.subject(plan)       what the code stages need: { name, about, items, section, sectionTitle, pic, alt, link }
 *   SE.websitePlan.readiness(plan)     [{ id, ok, required, msg }]: the readiness checklist, with teaching messages
 *   SE.websitePlan.mountStudio(el, api, ctx)   stage 1. ctx: { state, save, journey }
 *   SE.websitePlan.drawer(host, opts)  the My plan panel. opts: { state, save, stage, onUse(kind) }. Returns { open, close, refresh }
 * Plan v2 (state.plan): { v: 2, idea, name, purpose, audience, unique, goal, headline, intro, points: [3], picture,
 *   linkIdea, colors: { primary, secondary }, style, mood, sections: [...], notes, tested: { noticed, improve } }
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;
  const WK = SE.webKit;
  const BIZ = SE.websiteStages.BUSINESSES;

  /* ───────── Ideas (curated, made up) ───────── */
  const IDEAS = [
    { id: "animal", label: "An animal I love", pic: "moose.svg", names: ["Maine Moose Facts", "All About Puffins", "Loon Lookout", "Fox Tales"], headlines: ["Meet the Moose of the North Woods", "Puffins: Clowns of the Sea", "The Call of the Loon"], intros: ["Moose are the biggest animals in Maine's forests, and there's a lot to learn about them.", "Puffins spend most of their lives at sea and nest on rocky islands."], points: [["Where they live", "What they eat", "A surprising fact"], ["How they swim", "Their babies", "How to spot one"]] },
    { id: "hobby", label: "A game or hobby fan page", pic: "game-controller.svg", names: ["Pixel Quest Fan Club", "The Guitar Corner", "Paint Splash Studio"], headlines: ["Level Up With Us", "Learn Your First Three Chords", "Make Art Every Day"], intros: ["A fan page for players who love building, exploring, and sharing tips.", "Everything a beginner needs to start playing the guitar."], points: [["Best tips for beginners", "My favorite levels", "How to play fair"], ["Gear you need", "Easy songs", "Practice tricks"]] },
    { id: "business", label: "A made-up business", pic: "muffins.svg", preset: true, names: [], headlines: [], intros: [], points: [] },
    { id: "sport", label: "A sport or activity", pic: "soccer.svg", names: ["Coastal Kickers Soccer", "Hoop Dreams Club", "Trail Runners of Maine"], headlines: ["Join the Team!", "Shoot, Score, Repeat", "Find Your Trail"], intros: ["A page for a made-up youth soccer team that loves to play by the coast.", "Tips and drills for players who want to get better at basketball."], points: [["How to join", "Practice drills", "Game day tips"], ["Warm-ups", "Dribbling drills", "Teamwork"]] },
    { id: "nature", label: "Nature or a good cause", pic: "tree.svg", names: ["Keep Maine Green", "Clean Shores Crew", "Plant a Pine"], headlines: ["Small Steps for a Cleaner Coast", "Trees Make Everything Better"], intros: ["Ideas for keeping beaches and trails clean, one small step at a time.", "Why trees matter, and how kids can help plant more of them."], points: [["Why it matters", "How you can help", "A fact that surprised me"], ["What trees do", "How to plant one", "Trees near you"]] },
    { id: "invention", label: "Something I invented", pic: "robot.svg", names: ["The Homework Helper Bot", "The Snow Day Machine", "Bright Idea Lab"], headlines: ["Meet My Robot Helper", "An Invention for Snowy Mornings"], intros: ["A made-up robot that helps you keep track of your homework.", "An invention that clears the walkway before the bus comes."], points: [["What it does", "How it works", "What I'd improve next"], ["The problem it solves", "The parts", "My drawings"]] },
    { id: "space", label: "Outer space", pic: "rocket.svg", names: ["Rocket Notes", "Planet Patrol", "Night Sky Guide"], headlines: ["Blast Off to the Planets", "What's Up There Tonight?"], intros: ["A guide to the planets in our solar system, from hot Mercury to icy Neptune.", "How to find stars and planets in the night sky over Maine."], points: [["The planets", "Famous missions", "A space fact"], ["What to look for", "Best times to look", "Tools you need"]] },
    { id: "own", label: "My own idea", pic: "lightbulb.svg", names: [], headlines: [], intros: [], points: [] }
  ];
  const PURPOSES = ["Teach people something", "Entertain visitors", "Help people do something", "Share something I love"];
  const AUDIENCES = ["Kids my age", "My class", "Fans of my topic", "People learning about it", "Visitors to a made-up business", "Everyone"];
  const STYLES = ["Bright and colorful", "Calm and natural", "Bold and sporty", "Clean and simple", "Dark and mysterious"];
  const PALETTES = [["#145b72", "#fff7e8"], ["#2f5d3a", "#f3f7ee"], ["#5b2a86", "#f7f1ff"], ["#b03a1a", "#fff4e6"], ["#1d2550", "#e8ecfb"]];
  const SECTION_CHOICES = ["About", "Fun facts", "Pictures", "My favorites", "How to help", "Tips", "Questions people ask"];

  const blank = () => ({ v: 2, idea: "", name: "", purpose: "", audience: "", unique: "", goal: "", headline: "", intro: "", points: ["", "", ""], picture: "", linkIdea: "", colors: { primary: "#145b72", secondary: "#fff7e8" }, style: "", mood: "", sections: ["About", "Fun facts"], notes: "", tested: { noticed: "", improve: "" } });
  /* An old save (a business and the v1 plan) becomes a v2 plan for that business. Nothing is lost. */
  function fromBusiness(b, old = {}) {
    return Object.assign(blank(), {
      idea: "business", business: b.id, name: b.name, purpose: "Help people do something", audience: "Visitors to a made-up business",
      headline: b.name, intro: b.about, points: b.items.slice(0, 3), picture: b.pic, linkIdea: b.link, sections: [b.sectionTitle, "About"],
      goal: old.message || "", tested: { noticed: old.noticed || "", improve: old.improve || "" }, alone: !!old.alone
    });
  }
  function migrate(state) {
    if (state.plan && state.plan.v === 2) return state.plan;
    const old = state.plan || {};
    state.plan = BIZ[state.business] ? fromBusiness(BIZ[state.business], old) : Object.assign(blank(), { goal: old.message || "", tested: { noticed: old.noticed || "", improve: old.improve || "" } });
    return state.plan;
  }
  const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "facts";
  /* What the code stages use: the plan's words, or friendly defaults while the plan is thin. */
  function subject(plan) {
    const p = plan || blank();
    const pic = WK.PICTURES[p.picture] ? p.picture : (IDEAS.find((i) => i.id === p.idea) || {}).pic || "lighthouse.svg";
    const sectionTitle = (p.sections && p.sections[0]) || "Fun facts";
    const items = (p.points || []).filter((x) => x && x.trim());
    return {
      id: p.business || p.idea || "own", name: p.name || "My Website", about: p.intro || "A website about something I care about.",
      items: items.length >= 2 ? items : ["First thing", "Second thing", "Third thing"], section: slug(sectionTitle), sectionTitle, pic,
      alt: (WK.PICTURE_INFO[pic] || ["A picture"])[0], link: p.linkIdea || `See the ${sectionTitle.toLowerCase()}`
    };
  }
  const words = (s) => (String(s || "").trim().match(/\S+/g) || []).length;
  /* The readiness checklist. Required: a name, a purpose, a headline, and a one-sentence intro. */
  function readiness(p) {
    return [
      { id: "name", required: true, ok: words(p.name) >= 1, msg: "Give your website a name. It becomes the title in the browser tab." },
      { id: "purpose", required: true, ok: !!p.purpose, msg: "Pick a purpose. Knowing why your site exists helps you decide what goes on it." },
      { id: "headline", required: true, ok: words(p.headline) >= 2, msg: "Write a main headline of two words or more. It's the first thing visitors read." },
      { id: "intro", required: true, ok: words(p.intro) >= 5, msg: "Visitors need to know what your website is about. Try writing one sentence that introduces your idea." },
      { id: "audience", ok: !!p.audience, msg: "Who is it for? Knowing your visitors helps you choose your words." },
      { id: "points", ok: (p.points || []).filter((x) => words(x) >= 1).length >= 3, msg: "Three things visitors should learn or see make a great list later." },
      { id: "picture", ok: !!p.picture, msg: "Pick a picture. You'll add it with <img> on stage 4." },
      { id: "colors", ok: !!(p.colors && p.colors.primary), msg: "Choose your colors. You'll use them with CSS on stage 5." },
      { id: "sections", ok: (p.sections || []).length >= 1, msg: "Plan at least one section for your page." }
    ];
  }
  const LABELS = { name: "Website name", purpose: "Purpose", headline: "Main headline", intro: "Opening sentence", audience: "Audience", points: "Three things to see", picture: "Picture", colors: "Colors", sections: "Sections" };

  /* The planning mockup: boxes in the student's colors. It's a sketch, never their code. */
  function mockup(p) {
    const s = subject(p), c = p.colors || {};
    return `<div class="wp-mock" style="--wp-a:${esc(c.primary || "#145b72")};--wp-b:${esc(c.secondary || "#fff7e8")}" role="img" aria-label="Planning mockup of ${esc(s.name)}: a header with the name, the headline, the opening sentence, ${(p.sections || []).length} planned sections, and a footer. It's a sketch, not code.">
      <div class="wp-mock__head">${esc(s.name)}</div>
      <div class="wp-mock__hero"><b>${esc(p.headline || "Your headline")}</b><span>${esc(p.intro || "Your opening sentence goes here.")}</span></div>
      ${WK.PICTURES[p.picture] ? `<img class="wp-mock__pic" src="${WK.PICTURES[p.picture]}" alt="">` : ""}
      ${(p.sections || []).map((x) => `<div class="wp-mock__sec">${esc(x)}</div>`).join("")}
      <div class="wp-mock__foot">Footer</div>
    </div>`;
  }

  const why = (text) => `<details class="wp-why"><summary>Why?</summary><p>${esc(text)}</p></details>`;
  const field = (id, label, value, o = {}) => `<label class="wp-field" for="wp-${id}">${esc(label)}${o.why ? "" : ""}
      ${o.area ? `<textarea class="input" id="wp-${id}" data-k="${id}" rows="${o.rows || 2}" maxlength="${o.max || 200}" placeholder="${esc(o.ph || "")}">${esc(value || "")}</textarea>` : `<input class="input" id="wp-${id}" data-k="${id}" maxlength="${o.max || 80}" placeholder="${esc(o.ph || "")}" value="${esc(value || "")}">`}</label>${o.why ? why(o.why) : ""}`;
  const chips = (k, list, value) => `<div class="wp-chips" role="group" aria-label="${esc(LABELS[k] || k)}">${list.map((x) => `<button type="button" class="wp-chip" data-pick="${k}" data-v="${esc(x)}" aria-pressed="${value === x}">${esc(x)}</button>`).join("")}</div>`;

  /* ───────── Stage 1: the Planning Studio ───────── */
  function mountStudio(el, api, ctx) {
    const { state, save } = ctx;
    const p = migrate(state); save();
    const pics = Object.keys(WK.PICTURES);
    el.innerHTML = `
      <div class="ws wp">
        ${ctx.journey}
        <p class="wp-intro">Plan your website before you build it, like real web designers do. Your plan stays on this device, and you can change it on any stage with <strong>My plan</strong>. <span class="muted">Please don't type your full name, address, school, or phone number.</span></p>
        <div class="wp-cols">
          <div class="wp-form">
            <section class="wp-part" aria-labelledby="wp-h1"><h3 id="wp-h1"><span class="wp-n">1</span>Your idea</h3>
              <div class="wp-ideas" role="group" aria-label="Website ideas">${IDEAS.map((i) => `<button type="button" class="wp-idea" data-idea="${i.id}" aria-pressed="${p.idea === i.id}"><img src="${WK.PICTURES[i.pic]}" alt="" width="64" height="48"><span>${esc(i.label)}</span></button>`).join("")}</div>
              <div class="wp-biz" ${p.idea === "business" ? "" : "hidden"} role="group" aria-label="Made-up businesses">${Object.values(BIZ).map((b) => `<button type="button" class="wp-chip" data-biz="${b.id}" aria-pressed="${p.business === b.id}">${esc(b.name)}</button>`).join("")}</div>
              <button type="button" class="btn btn--ghost btn--small" id="wp-surprise">${icon("star")}Surprise me</button>
              ${why("A website starts with an idea you care about. When you care about your topic, visitors can tell, and building it is more fun.")}
            </section>
            <section class="wp-part" aria-labelledby="wp-h2"><h3 id="wp-h2"><span class="wp-n">2</span>Who and why</h3>
              ${field("name", "Website name", p.name, { ph: "Maine Moose Facts", why: "The name becomes your page's <title>: the words in the browser tab and in search results." })}
              <p class="wp-label">Purpose: what is your website for?</p>${chips("purpose", PURPOSES, p.purpose)}
              ${why("Think about your favorite website. Is it there to entertain you, teach you something, or help you do something? Knowing your website's purpose helps you decide what to put on it.")}
              <p class="wp-label">Who is it for?</p>${chips("audience", AUDIENCES, p.audience)}
              ${field("unique", "What makes it interesting or different?", p.unique, { ph: "It has facts most people don't know" })}
              ${field("goal", "My goal for this website (one sentence)", p.goal, { area: true, ph: "I want visitors to learn three cool facts about moose." })}
            </section>
            <section class="wp-part" aria-labelledby="wp-h3"><h3 id="wp-h3"><span class="wp-n">3</span>What visitors see</h3>
              ${field("headline", "Main headline", p.headline, { ph: "Meet the Moose of the North Woods", why: "Your headline becomes your <h1>, the biggest heading. It should tell visitors in a few words what your page is about." })}
              <details class="wp-why"><summary>Examples of strong headlines</summary><ul><li>"Puffins: Clowns of the Sea" (it's about puffins, and it's fun)</li><li>"Small Steps for a Cleaner Coast" (it says what you'll learn)</li><li>Weak: "Welcome!" (it doesn't say what the page is about)</li></ul></details>
              ${field("intro", "Opening sentence", p.intro, { area: true, ph: "Moose are the biggest animals in Maine's forests.", why: "This becomes your first <p>. One clear sentence tells visitors if they're in the right place." })}
              <fieldset class="wp-field"><legend>Three things visitors should learn or see</legend>
                ${[0, 1, 2].map((i) => `<label class="visually-hidden" for="wp-pt${i}">Thing ${i + 1}</label><input class="input" id="wp-pt${i}" data-pt="${i}" maxlength="60" placeholder="Thing ${i + 1}" value="${esc((p.points || [])[i] || "")}">`).join("")}
              </fieldset>${why("Three things make a great list (<ul>) on stage 3. Lists are quick to read.")}
              <p class="wp-label">A picture (built in, no outside images)</p>
              <div class="wp-pics" role="group" aria-label="Pictures">${pics.map((k) => `<button type="button" class="wp-pic" data-pic="${k}" aria-pressed="${p.picture === k}" title="${esc(WK.PICTURE_INFO[k][0])}"><img src="${WK.PICTURES[k]}" alt="${esc(WK.PICTURE_INFO[k][0])}"></button>`).join("")}</div>
              ${field("linkIdea", "Link words: where could a link take visitors?", p.linkIdea, { ph: "See the fun facts", why: "Good link words say where the link goes. \"Click here\" doesn't." })}
            </section>
            <section class="wp-part" aria-labelledby="wp-h4"><h3 id="wp-h4"><span class="wp-n">4</span>The look</h3>
              <div class="wp-colors"><label class="wp-field">Main color<input type="color" id="wp-c1" value="${esc(p.colors.primary)}"></label><label class="wp-field">Background color<input type="color" id="wp-c2" value="${esc(p.colors.secondary)}"></label></div>
              <div class="wp-chips" role="group" aria-label="Color presets">${PALETTES.map(([a, b2], i) => `<button type="button" class="wp-swatch" data-pal="${i}" aria-label="Color preset ${i + 1}"><i style="background:${a}"></i><i style="background:${b2}"></i></button>`).join("")}</div>
              <p class="wp-label">Style</p>${chips("style", STYLES, p.style)}
              ${field("mood", "In three words, how should it feel?", p.mood, { ph: "Friendly, wild, curious" })}
              ${why("Colors and style show your website's personality. You'll turn these choices into CSS on stage 5.")}
            </section>
            <section class="wp-part" aria-labelledby="wp-h5"><h3 id="wp-h5"><span class="wp-n">5</span>Page structure</h3>
              <p class="muted small">Every page has a header at the top and a footer at the bottom. Put your sections in the order visitors should see them.</p>
              <ol class="wp-secs" id="wp-secs"></ol>
              <div class="wp-chips" role="group" aria-label="Add a section">${SECTION_CHOICES.map((x) => `<button type="button" class="wp-chip" data-addsec="${esc(x)}">${icon("plus")}${esc(x)}</button>`).join("")}</div>
              ${why("A clear order helps visitors find things. Each section will get its own <h2> heading.")}
              ${field("notes", "Notes and ideas (optional)", p.notes, { area: true, rows: 2, max: 400 })}
            </section>
            <details class="wp-part wp-test"><summary><h3><span class="wp-n">+</span>Optional: test your plan with a partner</h3></summary>
              <p>Sketch your page on paper: boxes and labels, no coloring. Show it to a partner for five seconds, then hide it and ask what they noticed.</p>
              <button type="button" class="btn btn--ghost btn--small" id="ws-five">${icon("clock")}Start 5 seconds</button>
              <p class="ws-five" id="ws-five-out" aria-live="assertive"></p>
              ${field("noticed", "What did your tester notice?", p.tested.noticed, { area: true })}
              ${field("improve", "One thing you'll change because of it", p.tested.improve, { area: true })}
            </details>
          </div>
          <aside class="wp-side" aria-label="Your plan so far">
            <p class="wp-side__h">${icon("eye")}Planning mockup <span class="muted small">(a sketch of your idea, not your code yet)</span></p>
            <div id="wp-mock"></div>
            <div class="wp-ready" id="wp-ready" aria-live="polite"></div>
            <button type="button" class="btn btn--launch" id="ws-plan-done">${icon("check")}Save my plan and start building</button>
          </aside>
        </div>
      </div>`;
    const $ = (s) => el.querySelector(s);
    let timer = null;
    function draw() {
      $("#wp-mock").innerHTML = mockup(p);
      const R = readiness(p), done = R.filter((r) => r.ok).length, req = R.filter((r) => r.required);
      const level = req.every((r) => r.ok) ? (done === R.length ? "Ready to build" : "Ready (you can add more later)") : done >= 3 ? "Almost there" : "Just starting";
      $("#wp-ready").innerHTML = `<p class="wp-meter"><strong>${esc(level)}</strong> · ${done} of ${R.length}</p><div class="wp-bar" aria-hidden="true"><i style="width:${Math.round(done / R.length * 100)}%"></i></div>
        <ul class="wp-check">${R.map((r) => `<li class="${r.ok ? "is-ok" : ""}">${icon(r.ok ? "check" : r.required ? "alert" : "target")}<span><strong>${esc(LABELS[r.id])}</strong>${r.required ? "" : " (optional)"}${r.ok ? "" : `: ${esc(r.msg)}`}</span></li>`).join("")}</ul>`;
      $("#wp-secs").innerHTML = `<li class="wp-sec wp-sec--fixed">Header: your name and headline</li>${p.sections.map((x, i) => `<li class="wp-sec"><span>${esc(x)}</span>
          <button type="button" class="linkish" data-up="${i}" ${i ? "" : "disabled"} aria-label="Move ${esc(x)} up">Up</button>
          <button type="button" class="linkish" data-down="${i}" ${i < p.sections.length - 1 ? "" : "disabled"} aria-label="Move ${esc(x)} down">Down</button>
          <button type="button" class="linkish" data-rm="${i}" aria-label="Remove ${esc(x)}">Remove</button></li>`).join("")}<li class="wp-sec wp-sec--fixed">Footer</li>`;
    }
    const set = (k, v) => { p[k] = v; save(); draw(); };
    const fillFrom = (idea, pick = (a) => a[0]) => {
      if (!idea || !idea.names.length) return;
      p.name = pick(idea.names); p.headline = pick(idea.headlines); p.intro = pick(idea.intros); p.points = pick(idea.points).slice(); p.picture = idea.pic;
      ["name", "headline", "intro"].forEach((k) => { $(`#wp-${k}`).value = p[k]; });
      p.points.forEach((x, i) => { $(`#wp-pt${i}`).value = x; });
    };
    el.addEventListener("input", (e) => {
      const t = e.target;
      if (t.id === "wp-noticed") p.tested.noticed = t.value;
      else if (t.id === "wp-improve") p.tested.improve = t.value;
      else if (t.dataset.k) p[t.dataset.k] = t.value;
      else if (t.dataset.pt) p.points[Number(t.dataset.pt)] = t.value;
      else if (t.id === "wp-c1") p.colors.primary = t.value;
      else if (t.id === "wp-c2") p.colors.secondary = t.value;
      else return;
      save(); draw();
    });
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.idea) {
        p.idea = b.dataset.idea;
        el.querySelectorAll("[data-idea]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        $(".wp-biz").hidden = p.idea !== "business";
        const idea = IDEAS.find((i) => i.id === p.idea);
        if (!p.picture) p.picture = idea.pic;
        if (!p.name && idea.names.length) fillFrom(idea);
        api.say(p.idea === "own" ? "Your own idea: fill in the name and headline below." : p.idea === "business" ? "Pick a made-up business, or invent your own below." : `Good choice: ${idea.label.toLowerCase()}. Change anything to make it yours.`, "info");
      } else if (b.dataset.biz) {
        Object.assign(p, fromBusiness(BIZ[b.dataset.biz], { message: p.goal }), { idea: "business" });
        state.business = b.dataset.biz;
        el.querySelectorAll("[data-biz]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        ["name", "headline", "intro"].forEach((k) => { $(`#wp-${k}`).value = p[k]; });
        p.points.forEach((x, i) => { $(`#wp-pt${i}`).value = x; });
      } else if (b.id === "wp-surprise") {
        const pool = IDEAS.filter((i) => i.names.length), r = (a) => a[Math.floor(Math.random() * a.length)];
        const idea = r(pool);
        p.idea = idea.id; fillFrom(idea, r);
        p.purpose = p.purpose || r(PURPOSES);
        el.querySelectorAll("[data-idea]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.idea === p.idea)));
        el.querySelectorAll('[data-pick="purpose"]').forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.v === p.purpose)));
        api.say(`Surprise! How about "${p.name}"? Change the words to make it yours.`, "info");
      } else if (b.dataset.pick) {
        set(b.dataset.pick, b.dataset.v);
        el.querySelectorAll(`[data-pick="${b.dataset.pick}"]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        return;
      } else if (b.dataset.pic) {
        p.picture = b.dataset.pic;
        el.querySelectorAll("[data-pic]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      } else if (b.dataset.pal) {
        const [a, c] = PALETTES[Number(b.dataset.pal)];
        p.colors = { primary: a, secondary: c }; $("#wp-c1").value = a; $("#wp-c2").value = c;
      } else if (b.dataset.addsec) {
        if (p.sections.includes(b.dataset.addsec)) { api.say(`${b.dataset.addsec} is already in your plan.`, "info"); return; }
        p.sections.push(b.dataset.addsec);
      } else if (b.dataset.up || b.dataset.down) {
        const i = Number(b.dataset.up || b.dataset.down), j = b.dataset.up ? i - 1 : i + 1;
        [p.sections[i], p.sections[j]] = [p.sections[j], p.sections[i]];
        save(); draw();
        const again = el.querySelector(`[data-${b.dataset.up ? "up" : "down"}="${j}"]`) || el.querySelector(`[data-up="${j}"], [data-down="${j}"]`);
        if (again) again.focus();
        return;
      } else if (b.dataset.rm) {
        p.sections.splice(Number(b.dataset.rm), 1);
      } else if (b.id === "ws-five") {
        clearInterval(timer);
        let n = 5;
        const out = $("#ws-five-out");
        out.textContent = `Show your sketch: ${n}`;
        timer = setInterval(() => { n--; if (n > 0) { out.textContent = `Show your sketch: ${n}`; return; } clearInterval(timer); out.textContent = "Time's up! Hide the sketch. Ask: What is this website about? What would you look for next?"; }, 1000);
        return;
      } else if (b.id === "ws-plan-done") {
        const missing = readiness(p).filter((r) => r.required && !r.ok);
        if (missing.length) { api.say(missing[0].msg, "warn"); const f = $(`#wp-${missing[0].id}`) || el.querySelector(`[data-pick="${missing[0].id}"]`); if (f) f.focus(); return; }
        api.log("lab_test_run", { stage: 0, idea: p.idea, ready: readiness(p).filter((r) => r.ok).length });
        api.win({ idea: p.idea, ready: readiness(p).filter((r) => r.ok).length, tested: !!p.tested.noticed }, { extra: `<p class="ws-cheer">${icon("check")}Your plan is ready. Time to write code!</p>` });
        return;
      } else return;
      save(); draw();
    });
    draw();
    return () => clearInterval(timer);
  }

  /* ───────── My Website Plan: a panel on every code stage ───────── */
  const STAGE_FIELDS = { 1: ["name", "headline", "intro"], 2: ["points", "sections"], 3: ["picture", "linkIdea", "sections"], 4: ["colors"], 5: ["headline", "picture", "linkIdea", "colors"], 7: ["name", "headline", "intro", "points", "picture", "linkIdea", "colors"] };
  const USE = { name: "Put it in my <title>", headline: "Use as my <h1>", intro: "Use as a <p>", points: "Use as a <ul> list", picture: "Add as an <img>", colors: "Use in my CSS body rule" };
  function drawer(host, o) {
    const p = migrate(o.state);
    const panel = document.createElement("aside");
    panel.className = "wp-drawer";
    panel.id = "wp-drawer";
    panel.hidden = true;
    panel.setAttribute("aria-label", "My Website Plan");
    host.appendChild(panel);
    let opener = null;
    const hot = STAGE_FIELDS[o.stage] || [];
    const row = (k, label, val, editor) => `<div class="wp-row ${hot.includes(k) ? "is-hot" : ""}" data-row="${k}">
        <p class="wp-row__k">${esc(label)}${hot.includes(k) ? ' <span class="wp-tag">for this stage</span>' : ""}</p>
        ${editor}
        ${USE[k] && o.onUse ? `<button type="button" class="btn btn--ghost btn--small" data-use="${k}">${icon("plus")}${esc(USE[k])}</button>` : ""}
      </div>`;
    function render() {
      panel.innerHTML = `
        <div class="wp-drawer__head"><h2 id="wp-drawer-h" tabindex="-1">${icon("map")}My Website Plan</h2><button type="button" class="btn btn--ghost btn--small" id="wp-close">Close</button></div>
        <p class="muted small">Changing your plan never changes your code. Use the buttons to add a part to your code, and they'll ask first.</p>
        ${row("name", "Website name", "", `<input class="input" data-k="name" value="${esc(p.name)}" aria-label="Website name">`)}
        ${row("headline", "Main headline", "", `<input class="input" data-k="headline" value="${esc(p.headline)}" aria-label="Main headline">`)}
        ${row("intro", "Opening sentence", "", `<textarea class="input" data-k="intro" rows="2" aria-label="Opening sentence">${esc(p.intro)}</textarea>`)}
        ${row("points", "Three things to see", "", [0, 1, 2].map((i) => `<input class="input" data-pt="${i}" value="${esc(p.points[i] || "")}" aria-label="Thing ${i + 1}">`).join(""))}
        ${row("sections", "Sections, in order", "", `<p>Header · ${p.sections.map(esc).join(" · ")} · Footer</p>`)}
        ${row("picture", "Picture", "", WK.PICTURES[p.picture] ? `<p class="wp-row__pic"><img src="${WK.PICTURES[p.picture]}" alt="" width="64" height="48">${esc(p.picture)}</p>` : "<p>No picture yet.</p>")}
        ${row("linkIdea", "Link words", "", `<input class="input" data-k="linkIdea" value="${esc(p.linkIdea)}" aria-label="Link words">`)}
        ${row("colors", "Colors", "", `<p class="wp-row__sw"><i style="background:${esc(p.colors.primary)}"></i>${esc(p.colors.primary)} <i style="background:${esc(p.colors.secondary)}"></i>${esc(p.colors.secondary)}</p>`)}
        <p><a href="#/lab/build-your-first-website/1">${icon("arrowLeft")}Edit the full plan on stage 1</a></p>
        <p class="wp-drawer__msg" id="wp-msg" role="status"></p>`;
    }
    panel.addEventListener("input", (e) => {
      const t = e.target;
      if (t.dataset.k) p[t.dataset.k] = t.value;
      else if (t.dataset.pt) p.points[Number(t.dataset.pt)] = t.value;
      else return;
      o.save();
      if (o.onChange) o.onChange(p);
    });
    panel.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.id === "wp-close") return api.close();
      if (b.dataset.use) {
        const msg = o.onUse(b.dataset.use, p, b);
        if (msg) panel.querySelector("#wp-msg").textContent = msg;
      }
    });
    panel.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.preventDefault(); api.close(); } });
    const api = {
      panel,
      open(from) { opener = from || document.activeElement; render(); panel.hidden = false; host.classList.add("has-plan"); panel.querySelector("#wp-drawer-h").focus(); },
      close() { panel.hidden = true; host.classList.remove("has-plan"); if (opener && opener.isConnected) opener.focus(); },
      toggle(from) { panel.hidden ? api.open(from) : api.close(); },
      refresh: render,
      get isOpen() { return !panel.hidden; }
    };
    return api;
  }

  SE.websitePlan = { IDEAS, migrate, subject, readiness, mountStudio, drawer, mockup, blank };
})();
