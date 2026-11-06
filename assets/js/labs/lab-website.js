/*
 * Build Your First Website (lab id "build-your-first-website"): a 90-minute workshop, grades 2–8.
 * Plan → HTML → Content → Media → CSS → Accessibility → Debug → Ship, for a made-up Maine business.
 * Stages are in website-stages.js; the safe preview, pictures, and page reading are shared with the Web Builder
 * Lab (web-kit.js). Students type real HTML and CSS. The helpers only put real code in front of them:
 *   Tag Shelf     buttons that type a real tag pair at the cursor (and wrap a selection)
 *   Find it       tap the preview to select the code that made it; the tag at the cursor is outlined
 *   Code Coach    one line about the tag or CSS property under the cursor
 *   Color helper  every color in the CSS, with a picker that rewrites that value in the code
 *   Check my page a checklist with three outcomes: Looks good, Needs a fix, Check with a person
 * Privacy: student code and plans stay on this device (localStorage for students, sessionStorage for guests).
 * Only check names are logged. Pure rules for tests: SE.website.checks(doc, ctx), SE.website.TAGS.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;
  const WK = SE.webKit;
  const { BUSINESSES, STAGES, BROKEN, SHIP, ex } = SE.websiteStages;
  const LAB = "build-your-first-website";
  const PIC_NAMES = Object.keys(WK.PICTURES);
  const BIZ_PICS = ["muffins.svg", "kayak.svg", "tackle.svg"];
  const GENERIC_LINK = /^(click here|here|click|link|this|this link|more|read more|read this|go|go here|website|page|learn more)$/i;
  const GENERIC_ALT = /^(image|picture|photo|pic|img|graphic|a picture|an image|a photo|.*\.svg)$/i;
  const JOURNEY = ["Plan", "HTML", "Content", "Media", "CSS", "Accessibility", "Debug", "Ship"];
  const CELEBRATE = ["Your plan is ready. Time to write code!", "Your first HTML heading is live!", "Your page tells its story now.", "Your page has a picture everyone can understand, and a link that says where it goes.", "Your website has its own style.", "You made your website easier for more people to use.", "You found and fixed all four bugs.", ""];

  /* ───────── Tag Shelf and Code Coach ───────── */
  const TAGS = (b) => ({
    h1: { label: "Main heading", open: "<h1>", close: "</h1>" },
    h2: { label: "Section heading", open: "<h2>", close: "</h2>" },
    p: { label: "Paragraph", open: "<p>", close: "</p>" },
    ul: { label: "Bullet list", open: "<ul>\n  <li>", close: "</li>\n</ul>" },
    ol: { label: "Numbered list", open: "<ol>\n  <li>", close: "</li>\n</ol>" },
    li: { label: "List item", open: "<li>", close: "</li>" },
    img: { label: "Picture", open: `<img src="${b.pic}" alt="`, close: `">` },
    a: { label: "Link", open: `<a href="#${b.section}">`, close: "</a>" },
    id: { label: "Name to link to", open: ` id="${b.section}"`, close: "" }
  });
  const TAG_COACH = {
    h1: "<h1> is the main heading: what the whole page is about. A page has one.",
    h2: "<h2> is a section heading for one part of the page.",
    h3: "<h3> is a smaller heading inside a section.",
    p: "<p> is a paragraph: sentences that go together.",
    ul: "<ul> is a bullet list. Put <li> items inside it.",
    ol: "<ol> is a numbered list. Put <li> items inside it.",
    li: "<li> is one item in a list.",
    img: "<img> shows a picture. src picks the picture; alt describes it for people who can't see it.",
    a: "<a> is a link. href says where it goes; the words between the tags should say where, too.",
    strong: "<strong> marks words as important.",
    em: "<em> adds emphasis, like when you say a word louder.",
    section: "<section> groups one part of the page.",
    div: "<div> groups things so you can style them together.",
    span: "<span> marks a few words so you can style them.",
    style: "<style> holds CSS rules. In this workshop, CSS goes in the CSS tab."
  };
  const CSS_COACH = {
    color: "color sets the color of the words.",
    "background-color": "background-color sets the color behind the words.",
    background: "background sets what's behind the words, like a color.",
    padding: "padding adds space inside, between the edge and the content.",
    margin: "margin adds space outside, between this part and the next.",
    "font-family": "font-family picks the typeface, like Arial or Georgia.",
    "font-size": "font-size sets how big the words are.",
    "font-weight": "font-weight makes words bold (700) or regular (400).",
    border: "border draws a line around a part of the page.",
    "border-radius": "border-radius rounds the corners.",
    "text-align": "text-align lines words up: left, center, or right.",
    "line-height": "line-height sets the space between lines of text.",
    "max-width": "max-width keeps a part from getting wider than you choose."
  };
  const STYLE_EXTRA = /^(padding|padding-[a-z]+|margin|margin-[a-z]+|font-family|font-size|font-weight|font-style|border|border-[a-z-]+|text-align|line-height|letter-spacing|text-transform|max-width|width)$/i;

  /* ───────── Check my page: three outcomes from the real page ───────── */
  const LABEL = { h1: "Main heading", p: "Paragraph", h2: "Section heading", list: "List", img: "Picture", alt: "Alt text", link: "Link", style: "CSS style", contrast: "Readable colors", narrow: "Fits a phone screen", phone: "Phone preview", own: "Your own words" };
  const words = (s) => (String(s).trim().match(/\S+/g) || []).length;
  const wkOf = (el) => (el && el.getAttribute && el.getAttribute("data-wk")) || null;
  /* doc: the rendered preview. ctx: { css, narrowOverflow, viewedPhone }. Returns { results: { id: { state, msg, wk } }, person: [{ msg, wk }] }.
     state: "good" | "fix" | "person". */
  function checks(doc, ctx = {}) {
    const R = {}, person = [];
    const win = doc.defaultView, cs = (el) => win.getComputedStyle(el);
    const good = (id, msg, wk) => (R[id] = { state: "good", msg, wk });
    const fix = (id, msg, wk) => (R[id] = { state: "fix", msg, wk });
    // Main heading (and the classic bug: a big <p> pretending to be one)
    const h1s = [...doc.querySelectorAll("h1")];
    if (!h1s.length) {
      const fake = [...doc.querySelectorAll("p, div, span, strong, b")].find((el) => el.textContent.trim() && parseFloat(cs(el).fontSize) >= 26);
      fake ? fix("h1", `"${fake.textContent.trim().slice(0, 40)}" looks like a heading, but it's marked up as <${fake.tagName.toLowerCase()}>. A main heading uses <h1>, so screen readers know it's the title.`, wkOf(fake))
        : fix("h1", "Your page has words, but it needs a main heading. Try <h1>, the business name, then </h1>.");
    } else if (!h1s[0].textContent.trim()) fix("h1", "Your <h1> is empty. Type the business name between <h1> and </h1>.", wkOf(h1s[0]));
    else if (h1s.length > 1) fix("h1", `Your page has ${h1s.length} <h1> headings. Use one <h1> for the main heading, and <h2> for sections.`, wkOf(h1s[1]));
    else good("h1", `Main heading: "${h1s[0].textContent.trim().slice(0, 50)}"`, wkOf(h1s[0]));
    // Paragraph
    const ps = [...doc.querySelectorAll("p")];
    const realP = ps.find((p) => words(p.textContent) >= 3);
    realP ? good("p", "Your page has a paragraph.", wkOf(realP))
      : ps.length ? fix("p", "Your paragraph is very short. Write a full sentence about the business.", wkOf(ps[0]))
        : fix("p", "Add a paragraph that tells customers about the business: <p>, a sentence, then </p>.");
    // Section heading
    const h2 = [...doc.querySelectorAll("h2")].find((h) => h.textContent.trim());
    h2 ? good("h2", `Section heading: "${h2.textContent.trim().slice(0, 40)}"`, wkOf(h2)) : fix("h2", "Add a section heading with <h2>, like <h2>Our menu</h2>.");
    // List
    const lists = [...doc.querySelectorAll("ul, ol")];
    const best = lists.sort((a, b) => b.querySelectorAll(":scope > li").length - a.querySelectorAll(":scope > li").length)[0];
    const nli = best ? best.querySelectorAll(":scope > li").length : 0;
    !best ? fix("list", doc.querySelector("li") ? "Your <li> items need a list around them: put them inside <ul> and </ul>." : "Add a list of what the business offers: <ul>, then <li> items, then </ul>.")
      : nli < 2 ? fix("list", `Your list has ${nli} item${nli === 1 ? "" : "s"}. Add another <li> inside the <${best.tagName.toLowerCase()}>.`, wkOf(best))
        : good("list", `Your list has ${nli} items.`, wkOf(best));
    // Picture and alt text
    const imgs = [...doc.querySelectorAll("img")];
    if (!imgs.length) {
      fix("img", "Add a picture for your business, like <img src=\"muffins.svg\" alt=\"…\">.");
      fix("alt", "Add a picture first. Then give it alt text.");
    } else {
      const unknown = imgs.find((i) => !i.getAttribute("data-name"));
      const name = (i) => i.getAttribute("data-name") || i.getAttribute("data-src") || "";
      unknown ? fix("img", `"${name(unknown) || "(no src)"}" isn't one of the workshop's pictures. Use ${BIZ_PICS.join(", ")}.`, wkOf(unknown))
        : good("img", `Your page shows ${name(imgs[0])}.`, wkOf(imgs[0]));
      const noAlt = imgs.find((i) => !i.hasAttribute("alt") || !i.getAttribute("alt").trim());
      const weak = imgs.find((i) => { const a = (i.getAttribute("alt") || "").trim(); return a && (GENERIC_ALT.test(a) || a.length < 8); });
      if (noAlt) fix("alt", `Your picture ${name(noAlt)} has no alt text. What would someone need to know about this picture if they couldn't see it?`, wkOf(noAlt));
      else if (weak) fix("alt", `Alt text "${weak.getAttribute("alt").trim()}" doesn't say what's in the picture. Describe it in a few words.`, wkOf(weak));
      else {
        good("alt", "Every picture has alt text.", wkOf(imgs[0]));
        imgs.forEach((i) => person.push({ msg: `Read your alt text out loud: "${i.getAttribute("alt").trim()}". Does it tell someone what's in the picture?`, wk: wkOf(i) }));
      }
    }
    // Link
    const links = [...doc.querySelectorAll("a")];
    if (!links.length) fix("link", "Add a link with words that say where it goes, like <a href=\"#menu\">See our bakery menu</a>.");
    else {
      let problem = null;
      for (const a of links) {
        const text = a.textContent.trim(), href = (a.getAttribute("href") || "").trim();
        if (!text) { problem = ["Your link has no words. Put words between <a …> and </a>.", a]; break; }
        if (GENERIC_LINK.test(text)) { problem = [`"${text}" doesn't say where the link goes. People using screen readers often hear only the link words. Try words like "See our flavors".`, a]; break; }
        if (!href) { problem = ["Your link needs an address: href=\"#\" plus the id of a part of your page.", a]; break; }
        if (href.startsWith("#")) {
          const id = href.slice(1);
          if (!id || !doc.getElementById(id)) { problem = [`Your link goes to ${href}, but nothing on the page has id="${id || "…"}". Add id="${id || "menu"}" to a heading.`, a]; break; }
        } else if (!/^https:\/\/[^\s.]+\.[^\s]+/.test(href)) { problem = [`Your link goes to "${href}". In this workshop, links jump to a part of your page, like href="#menu".`, a]; break; }
      }
      if (problem) fix("link", problem[0], wkOf(problem[1]));
      else {
        good("link", `Your link "${links[0].textContent.trim().slice(0, 40)}" works.`, wkOf(links[0]));
        links.forEach((a) => person.push({ msg: `Read just your link words: "${a.textContent.trim()}". Would someone know where it goes?`, wk: wkOf(a) }));
      }
    }
    // CSS style
    const bodyBg = (() => { for (const el of [doc.body, doc.documentElement]) { const c = WK.rgb(cs(el).backgroundColor); if (c && c.a > 0) return c; } return null; })();
    const bodyColor = WK.rgb(cs(doc.body).color);
    const rules = String(ctx.css || "").match(/[^{}]+\{[^}]*\}/g) || [];
    const extraOk = rules.some((rule) => {
      const sel = rule.slice(0, rule.indexOf("{")).trim(), body = rule.slice(rule.indexOf("{") + 1, -1);
      let matches = false;
      try { matches = !!doc.querySelector(sel); } catch (e) { matches = false; }
      return matches && body.split(";").some((d) => STYLE_EXTRA.test((d.split(":")[0] || "").trim()) && (d.split(":")[1] || "").trim());
    });
    if (!bodyBg || (bodyBg.r === 255 && bodyBg.g === 255 && bodyBg.b === 255)) fix("style", "Your page background is still white. In the CSS tab, try body { background-color: #fff7e8; }");
    else if (!bodyColor || (bodyColor.r === 0 && bodyColor.g === 0 && bodyColor.b === 0)) fix("style", "Your words are still the default black. Add color to your body rule, like color: #213547;");
    else if (!extraOk) fix("style", "Nice colors! Now make one more style choice, like padding: 1em; or a font-family, in a rule that matches part of your page.");
    else good("style", "Your CSS sets the background, the text color, and more.");
    // Contrast (WCAG 2: the workshop asks 4.5 to 1 for all text)
    const tc = WK.textContrast(doc);
    const low = tc.filter((t) => t.ratio !== null && t.ratio < 4.5).sort((a, b) => a.ratio - b.ratio)[0];
    const unknown = tc.filter((t) => t.ratio === null);
    const known = tc.filter((t) => t.ratio !== null);
    if (low) fix("contrast", `"${low.text}" has a contrast of ${low.ratio} to 1. Readable text needs at least 4.5 to 1. Try making the words darker or the background lighter.`, wkOf(low.el));
    else if (!known.length && unknown.length) R.contrast = { state: "person", msg: "We can't measure the colors behind your words. Ask a person: is every word easy to read?", wk: wkOf(unknown[0].el) };
    else if (known.length) good("contrast", `All your text is readable: the lowest contrast is ${Math.min(...known.map((t) => t.ratio))} to 1.`, wkOf(known[0].el));
    else fix("contrast", "Add some words to your page first.");
    unknown.forEach((t) => person.push({ msg: `We can't measure the contrast of "${t.text}" (something is behind it). Is it easy to read?`, wk: wkOf(t.el) }));
    // Ship: fits a phone, looked at on a phone, and the student's own words
    if (ctx.narrowOverflow === true) fix("narrow", "Your page is wider than a phone screen, so people would have to scroll sideways. Look for something too wide.");
    else if (ctx.narrowOverflow === false) good("narrow", "Your page fits on a phone screen.");
    ctx.viewedPhone ? good("phone", "You looked at your page in the Phone preview.") : fix("phone", "Press Phone above the preview and look at your page the way a phone shows it.");
    const all = doc.body.textContent.replace(/\s+/g, " ").trim();
    words(all) >= 20 ? good("own", "Your page has your own words.") : fix("own", `Your page has ${words(all)} words. Tell customers more: aim for 20 or more.`);
    return { results: R, person };
  }

  /* Extra goals for early finishers (Challenge mode). They never block a stage. */
  function challenges(doc, ctx = {}) {
    const ids = [...doc.querySelectorAll("a[href^='#']")].filter((a) => a.getAttribute("href").length > 1 && doc.getElementById(a.getAttribute("href").slice(1)));
    const tc = WK.textContrast(doc).filter((t) => t.ratio !== null);
    return [
      { label: "Two sections with <h2> headings", done: doc.querySelectorAll("h2").length >= 2 },
      { label: "A second link that jumps to another section", done: new Set(ids.map((a) => a.getAttribute("href"))).size >= 2 },
      { label: "A business hours section", done: /hour|open|closed|am\b|pm\b/i.test(doc.body.textContent) && doc.querySelectorAll("h2").length >= 2 },
      { label: "A second picture with alt text", done: [...doc.querySelectorAll("img[alt]")].filter((i) => i.getAttribute("alt").trim()).length >= 2 },
      { label: "A theme where all text has 7 to 1 contrast or more", done: tc.length > 0 && tc.every((t) => t.ratio >= 7) },
      { label: "Fits a phone screen", done: ctx.narrowOverflow === false }
    ];
  }

  /* ───────── Saving (this device only) ───────── */
  function storeFor(user) {
    const student = user && user.role === "student";
    const key = `stem207.website.${student ? user.id : "guest"}`;
    let s = null;
    try { s = student ? window.localStorage : window.sessionStorage; } catch (e) { s = null; }
    return {
      load() { try { return JSON.parse((s && s.getItem(key)) || "{}") || {}; } catch (e) { return {}; } },
      save(v) { try { if (s) s.setItem(key, JSON.stringify(v)); } catch (e) { /* storage full or off */ } }
    };
  }
  const flag = (k, v) => { try { if (v === undefined) return sessionStorage.getItem(k) === "1"; sessionStorage.setItem(k, v ? "1" : "0"); } catch (e) { return false; } return v; };
  /* A starting page for a stage, built from the stages before it (for a student who starts partway). */
  function seed(idx, b) {
    if (idx <= 1) return { html: "<h1></h1>\n", css: "" };
    let html = ex.bones(b);
    if (idx >= 3) html += ex.story(b);
    if (idx >= 4) html += ex.media(b);
    return { html, css: idx >= 5 ? ex.style() : "" };
  }

  /* ───────── The journey strip (View my progress) ───────── */
  function journey(api, idx) {
    const done = SE.labs.progressFor(api.user, LAB);
    return `<nav class="ws-journey" aria-label="Your progress"><ol>${JOURNEY.map((j, i) => `<li class="${i === idx ? "is-here" : ""} ${done.has(i) ? "is-done" : ""}"><a href="#/lab/${LAB}/${i + 1}" ${i === idx ? 'aria-current="step"' : ""}>${done.has(i) ? icon("check") : `<b>${i + 1}</b>`}<span>${j}</span>${done.has(i) ? '<span class="visually-hidden"> (done)</span>' : ""}</a></li>`).join("")}</ol></nav>`;
  }

  /* ───────── Stage 1: plan ───────── */
  function mountPlan(el, idx, api) {
    const st = storeFor(api.user), state = st.load();
    const plan = Object.assign({ message: "", sections: [], noticed: "", improve: "", alone: false }, state.plan || {});
    const SECTIONS = ["Website title", "Main heading", "Short description", "List of products or services", "Picture", "A link"];
    el.innerHTML = `
      <div class="ws ws--plan">
        ${journey(api, idx)}
        <fieldset class="ws-biz"><legend>1. Pick your business (all made up)</legend>
          ${Object.values(BUSINESSES).map((b) => `<button type="button" class="ws-biz__card" data-biz="${b.id}" aria-pressed="${state.business === b.id}">
            <img src="${WK.PICTURES[b.pic]}" alt="" width="120" height="90"><strong>${esc(b.name)}</strong><span>${esc(b.about)}</span><span class="muted">${esc(b.owner)}</span></button>`).join("")}
        </fieldset>
        <div class="ws-plan__cols">
          <section class="ws-card" aria-labelledby="ws-wf-h">
            <h3 id="ws-wf-h">2. Sketch a wireframe on paper</h3>
            <p>A wireframe is a simple drawing that shows where the important parts of your website will go. Boxes and labels, no coloring.</p>
            <details><summary>See an example wireframe</summary>${wireframeSvg()}</details>
            <h3>3. The five-second test</h3>
            <p>Show your sketch to a partner. Press the button, then hide the sketch when time is up.</p>
            <button type="button" class="btn btn--ghost" id="ws-five">${icon("clock")}Start 5 seconds</button>
            <p class="ws-five" id="ws-five-out" aria-live="assertive"></p>
            <ol class="ws-qs" id="ws-qs" hidden><li>What is this business?</li><li>What does it offer?</li><li>What would you look for next?</li></ol>
          </section>
          <section class="ws-card" aria-labelledby="ws-notes-h">
            <h3 id="ws-notes-h">4. My plan</h3>
            <p class="muted small">Write about your made-up business. This stays on this device.</p>
            <label class="ws-field">Main message: what should customers learn first?<input class="input" id="ws-msg" maxlength="140" value="${esc(plan.message)}"></label>
            <fieldset class="ws-field"><legend>Sections on my page</legend><div class="ws-chips">${SECTIONS.map((s) => `<label class="ws-chip"><input type="checkbox" value="${esc(s)}" ${plan.sections.includes(s) ? "checked" : ""}> ${esc(s)}</label>`).join("")}</div></fieldset>
            <label class="ws-field">What did your tester notice?<textarea class="input" id="ws-noticed" rows="2" maxlength="300">${esc(plan.noticed)}</textarea></label>
            <label class="ws-field">One thing you'll change because of it<textarea class="input" id="ws-improve" rows="2" maxlength="300">${esc(plan.improve)}</textarea></label>
            <label class="ws-chip"><input type="checkbox" id="ws-alone" ${plan.alone ? "checked" : ""}> No partner today: my teacher was my tester.</label>
            <button type="button" class="btn btn--launch" id="ws-plan-done">${icon("check")}Save my plan</button>
            <p class="field-help">STEM 207 can't hear your conversation. It checks that you wrote down what your tester noticed and one change.</p>
          </section>
        </div>
      </div>`;
    const $ = (s) => el.querySelector(s);
    let timer = null;
    el.querySelectorAll("[data-biz]").forEach((b) => b.addEventListener("click", () => {
      state.business = b.dataset.biz; st.save(state);
      el.querySelectorAll("[data-biz]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      api.say(`You're building a website for ${BUSINESSES[state.business].name}.`, "info");
    }));
    $("#ws-five").addEventListener("click", () => {
      clearInterval(timer);
      let n = 5;
      const out = $("#ws-five-out");
      out.textContent = `Show your sketch: ${n}`;
      timer = setInterval(() => {
        n--;
        if (n > 0) { out.textContent = `Show your sketch: ${n}`; return; }
        clearInterval(timer);
        out.textContent = "Time's up! Hide the sketch. Ask your partner these questions:";
        $("#ws-qs").hidden = false;
      }, 1000);
    });
    const collect = () => {
      plan.message = $("#ws-msg").value.trim();
      plan.sections = [...el.querySelectorAll(".ws-chips input:checked")].map((c) => c.value);
      plan.noticed = $("#ws-noticed").value.trim();
      plan.improve = $("#ws-improve").value.trim();
      plan.alone = $("#ws-alone").checked;
      state.plan = plan; st.save(state);
    };
    el.addEventListener("input", collect);
    $("#ws-plan-done").addEventListener("click", () => {
      collect();
      const missing = !state.business ? "Pick a business first." : plan.sections.length < 4 ? "Check at least 4 sections you drew on your wireframe." : plan.noticed.length < 3 ? "Write what your tester noticed." : plan.improve.length < 3 ? "Write one thing you'll change." : null;
      if (missing) { api.say(missing, "warn"); return; }
      api.log("lab_test_run", { stage: 0, alone: plan.alone });
      api.win({ business: state.business, sections: plan.sections.length, alone: plan.alone }, { extra: `<p class="ws-cheer">${icon("check")}${esc(CELEBRATE[0])}</p>` });
    });
    return () => clearInterval(timer);
  }
  function wireframeSvg() {
    const box = (x, y, w, h, t) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#fff" stroke="#012d2b" stroke-width="2" stroke-dasharray="${t === "Picture" ? "6 4" : "0"}"/><text x="${x + w / 2}" y="${y + h / 2 + 5}" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#012d2b">${t}</text>`;
    return `<svg class="ws-wire" viewBox="0 0 320 260" role="img" aria-label="Example wireframe: a title bar at the top, a main heading, a short description, a picture on the left with a list of products on the right, and a link at the bottom.">
      <rect width="320" height="260" rx="8" fill="#ecebe4"/>${box(10, 10, 300, 28, "Website title")}${box(10, 46, 300, 34, "Main heading")}${box(10, 88, 300, 34, "Short description")}${box(10, 130, 130, 80, "Picture")}${box(150, 130, 160, 80, "List of products")}${box(10, 218, 300, 32, "Link: See our menu")}</svg>`;
  }

  /* ───────── Stages 2–8: the code workspace ───────── */
  function mountCode(el, idx, api) {
    const S = STAGES[idx];
    const st = storeFor(api.user), state = st.load();
    if (!BUSINESSES[state.business]) state.business = "bakery";
    const b = BUSINESSES[state.business];
    const bucket = S.source === "project" ? "project" : S.source;   // project (stages 2–6), debug, ship
    if (!state[bucket] || typeof state[bucket].html !== "string") state[bucket] = S.source === "debug" ? { ...BROKEN } : S.source === "ship" ? { ...SHIP } : seed(idx, b);
    state.snap = state.snap || {};
    if (!state.snap[idx]) state.snap[idx] = { ...state[bucket] };   // what Start over goes back to
    state.viewed = state.viewed || {};
    state.fixes = state.fixes || [];
    st.save(state);
    const work = state[bucket];
    let help = flag("stem207.website.help"), challenge = flag("stem207.website.challenge");
    let tab = "html", phone = false, map = [], timer = null, ready = Promise.resolve(), checks2 = 0, failed = 0, confirmReset = false;
    const prev = {};   // last state of each check, to notice a fix
    const tags = TAGS(S.source === "debug" ? { pic: "lighthouse.svg", section: "flavors" } : b);   // the broken page has its own picture and section

    el.innerHTML = `
      <div class="ws ${help ? "ws--help" : ""}" id="ws">
        ${journey(api, idx)}
        <div class="ws__bar">
          <label class="ws-bizpick">Business <select class="input input--small" id="ws-biz" ${S.source === "debug" ? "disabled" : ""}>${Object.values(BUSINESSES).map((x) => `<option value="${x.id}" ${x.id === b.id ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select></label>
          <div class="ws__toggles">
            <button type="button" class="btn btn--ghost btn--small" id="ws-help" aria-pressed="${help}">${icon("bulb")}Extra help</button>
            <button type="button" class="btn btn--ghost btn--small" id="ws-challenge" aria-pressed="${challenge}">${icon("star")}Challenge mode</button>
          </div>
        </div>
        <div class="ws__panes">
          <section class="ws__edit" aria-label="Your code">
            <div class="ws-tabs" role="tablist" aria-label="Code">
              <button type="button" role="tab" id="ws-tab-html" aria-selected="true" aria-controls="ws-panel-html">HTML</button>
              ${S.css ? `<button type="button" role="tab" id="ws-tab-css" aria-selected="false" aria-controls="ws-panel-css">CSS</button>` : ""}
            </div>
            <div id="ws-panel-html" role="tabpanel" aria-labelledby="ws-tab-html">
              ${S.tags && S.tags.length ? `<div class="ws-shelf" role="group" aria-label="Tag Shelf: type a tag at the cursor">${S.tags.map((t) => `<button type="button" class="ws-tag" data-tag="${t}"><span>${esc(tags[t].label)}</span><code>${esc(tags[t].open.split("\n")[0].replace(/"#?[^"]*"$/, '"…"'))}</code></button>`).join("")}</div>` : ""}
              <label class="visually-hidden" for="ws-html">Your HTML</label>
              <textarea id="ws-html" class="ws-code" rows="11" spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="ws-coach">${esc(work.html)}</textarea>
              <p class="ws-pics">Pictures: ${BIZ_PICS.map((p) => `<code>${p}</code>`).join(" ")}</p>
            </div>
            ${S.css ? `<div id="ws-panel-css" role="tabpanel" aria-labelledby="ws-tab-css" hidden>
              <div class="ws-colors" id="ws-colors" aria-label="Color helper"></div>
              <label class="visually-hidden" for="ws-css">Your CSS</label>
              <textarea id="ws-css" class="ws-code" rows="11" spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="ws-coach">${esc(work.css)}</textarea>
            </div>` : ""}
            <p class="ws-coach" id="ws-coach" aria-live="polite"></p>
            <div class="ws-actions">
              <button type="button" class="btn btn--launch" id="ws-check">${icon("check")}${S.source === "ship" ? "Mark ready for review" : "Check my page"}</button>
              <button type="button" class="btn btn--ghost btn--small" id="ws-undo">${icon("refresh", 'style="transform:scaleX(-1)"')}Undo</button>
              <button type="button" class="btn btn--ghost btn--small" id="ws-redo">${icon("refresh")}Redo</button>
              ${S.example ? `<button type="button" class="btn btn--ghost btn--small ws-help-only" id="ws-example">${icon("plus")}Show an example</button>` : ""}
              ${S.source === "ship" ? `<button type="button" class="btn btn--ghost btn--small" id="ws-earlier" aria-expanded="false" aria-controls="ws-earlier-code">${icon("eye")}Show my earlier page</button>` : ""}
              <button type="button" class="btn btn--ghost btn--small" id="ws-reset">Start this stage over</button>
            </div>
            ${S.source === "ship" ? `<pre class="ws-earlier" id="ws-earlier-code" hidden tabindex="0" aria-label="Your earlier page (read only)">${esc((state.project && state.project.html) || "You haven't built an earlier page yet.")}</pre>` : ""}
          </section>
          <section class="ws__view" aria-label="Preview">
            <div class="ws-viewbar">
              <span class="ws-viewbar__h" id="ws-prev-h">Preview</span>
              <div class="ws-size" role="group" aria-label="Preview size">
                <button type="button" class="btn btn--ghost btn--small" id="ws-desk" aria-pressed="true">Desktop</button>
                <button type="button" class="btn btn--ghost btn--small" id="ws-phone" aria-pressed="false">Phone</button>
              </div>
            </div>
            <div class="ws-framebox" id="ws-framebox"><iframe id="ws-frame" class="ws-frame" title="Preview of your website" sandbox="allow-same-origin" aria-describedby="ws-prev-h ws-findhelp"></iframe></div>
            <p class="field-help" id="ws-findhelp">Find it: tap any part of your page to find the code that made it.</p>
            ${S.css ? `<div class="ws-meter" id="ws-meter" aria-live="polite"></div>` : ""}
            <div class="ws-feedback-slot"></div>
            <section class="ws-checks" id="ws-checks" aria-live="polite" aria-label="Check my page results"></section>
          </section>
        </div>
      </div>`;

    const $ = (s) => el.querySelector(s);
    // Feedback and the checklist sit beside the preview, on the first screen.
    const fb = document.getElementById("lab-feedback");
    if (fb) $(".ws-feedback-slot").replaceWith(fb);
    const ta = { html: $("#ws-html"), css: $("#ws-css") };
    const frame = $("#ws-frame");
    const save = () => { work.html = ta.html.value; if (ta.css) work.css = ta.css.value; st.save(state); };

    /* Typing real code: insertText keeps the browser's own Undo history. */
    function typeAt(area, text, caretBack = 0) {
      area.focus();
      const ok = document.execCommand && document.execCommand("insertText", false, text);
      if (!ok) area.setRangeText(text, area.selectionStart, area.selectionEnd, "end");
      if (caretBack) { const p = area.selectionEnd - caretBack; area.setSelectionRange(p, p); }
      area.dispatchEvent(new Event("input", { bubbles: true }));
    }
    function shelf(t) {
      const area = ta.html, tg = tags[t];
      const sel = area.value.slice(area.selectionStart, area.selectionEnd);
      if (t === "id") {   // id goes inside an opening tag: put it after the tag name at the cursor's line
        typeAt(area, tg.open);
        api.say(`An id names this part so a link can jump to it: href="#${b.section}". Make sure it's inside an opening tag, like <h2 id="${b.section}">.`, "info");
        return;
      }
      typeAt(area, tg.open + sel + tg.close, sel ? 0 : tg.close.length);
      api.log("lab_tag_shelf", { tag: t, stage: idx });
    }

    /* ───────── Preview, Find it, Code Coach ───────── */
    const HEAD = `<style>[data-wk-on]{outline:3px solid #b4006a !important;outline-offset:2px}</style>`;
    function render() {
      const out = WK.srcdoc(ta.html.value, { css: ta.css ? ta.css.value : work.css, map: true, head: HEAD });
      map = out.map;
      ready = new Promise((res) => {
        frame.onload = () => {
          const d = frame.contentDocument;
          if (d) {
            d.addEventListener("click", (e) => {
              const a = e.target.closest && e.target.closest("a");
              if (a) {
                e.preventDefault();
                const href = a.getAttribute("href") || "";
                const target = href.startsWith("#") && href.length > 1 && d.getElementById(href.slice(1));
                if (target) target.scrollIntoView({ block: "start" });
                api.say(target ? `This link jumps to the part of your page with id="${href.slice(1)}".` : `Links don't leave the preview. This one goes to: ${href || "nowhere"}`, "info");
              }
              const hit = e.target.closest && e.target.closest("[data-wk]");
              if (hit) findCode(hit.getAttribute("data-wk"));
            });
          }
          meter();
          res();
        };
      });
      frame.srcdoc = out.doc;
    }
    function findCode(wk) {
      const m = map.find((x) => String(x.i) === String(wk));
      if (!m) return;
      showTab("html");
      const area = ta.html;
      area.focus();
      area.setSelectionRange(m.start, m.end);
      const line = area.value.slice(0, m.start).split("\n").length - 1;
      area.scrollTop = Math.max(0, line * 22 - 40);
      outline(wk);
      coach();
      api.say(`Found it: line ${line + 1}, the <${m.tag}> tag.`, "info");
    }
    function outline(wk) {
      const d = frame.contentDocument;
      if (!d) return;
      d.querySelectorAll("[data-wk-on]").forEach((n) => n.removeAttribute("data-wk-on"));
      const n = wk != null && d.querySelector(`[data-wk="${wk}"]`);
      if (n) { n.setAttribute("data-wk-on", ""); if (n.scrollIntoView) n.scrollIntoView({ block: "nearest" }); }
    }
    function coach() {
      const out = $("#ws-coach");
      if (tab === "html") {
        const v = ta.html.value, c = ta.html.selectionStart;
        const lt = v.lastIndexOf("<", c - 1 < 0 ? 0 : c - 1);
        const m = lt >= 0 && v.slice(lt, lt + 30).match(/^<\/?([a-zA-Z][a-zA-Z0-9]*)/);
        const tag = m && m[1].toLowerCase();
        out.textContent = tag && TAG_COACH[tag] ? TAG_COACH[tag] : "";
        const here = map.filter((x) => x.start <= c).pop();
        outline(here ? here.i : null);
      } else if (ta.css) {
        const v = ta.css.value, c = ta.css.selectionStart;
        const line = v.slice(v.lastIndexOf("\n", c - 1) + 1, (v.indexOf("\n", c) + 1 || v.length + 1) - 1);
        const prop = (line.match(/^\s*([a-z-]+)\s*:/i) || [])[1];
        const sel = (line.match(/^\s*([^{]+)\{/) || [])[1];
        out.textContent = prop && CSS_COACH[prop.toLowerCase()] ? CSS_COACH[prop.toLowerCase()]
          : sel ? `${sel.trim()} { } picks ${sel.trim() === "body" ? "the whole page" : `every <${sel.trim()}>`} to style.` : "";
      }
    }
    function meter() {
      const box = $("#ws-meter"), d = frame.contentDocument;
      if (!box || !d || !d.body) return;
      const tc = WK.textContrast(d).filter((t) => t.ratio !== null).sort((x, y) => x.ratio - y.ratio);
      if (!tc.length) { box.innerHTML = ""; return; }
      const t = tc[0], okay = t.ratio >= 4.5;
      box.innerHTML = `<span class="ws-meter__sw" style="background:${esc(t.fg)}"></span><span>Text ${esc(WK.toHex(t.fg))}</span>
        <span class="ws-meter__sw" style="background:${esc(t.bg)}"></span><span>Background ${esc(WK.toHex(t.bg))}</span>
        <strong>${t.ratio} to 1</strong><span class="ws-meter__st ${okay ? "is-ok" : "is-bad"}">${icon(okay ? "check" : "alert")}${okay ? "Readable" : "Needs a fix"}</span>
        <span class="muted small">(lowest on the page)</span>`;
    }

    /* ───────── Color helper ───────── */
    function colors() {
      const box = $("#ws-colors");
      if (!box) return;
      const list = WK.cssColors(ta.css.value);
      box.innerHTML = list.length ? `<p class="ws-colors__h">Color helper: pick a color, and it changes in your code.</p>${list.map((c, i) => `
        <label class="ws-color"><input type="color" data-ci="${i}" value="${WK.toHex(c.value)}"><span><code>${esc(c.selector)}</code> ${esc(c.prop)}</span></label>`).join("")}`
        : `<p class="ws-colors__h">Color helper: write a color in your CSS, like <code>color: #213547;</code>, and a color picker for it shows up here.</p>`;
    }
    $("#ws-panel-css") && $("#ws-panel-css").addEventListener("change", (e) => {
      const inp = e.target.closest("[data-ci]");
      if (!inp) return;
      const item = WK.cssColors(ta.css.value)[Number(inp.dataset.ci)];
      if (!item) return;
      ta.css.setSelectionRange(item.start, item.end);
      typeAt(ta.css, inp.value);
      ta.css.setSelectionRange(item.start, item.start + inp.value.length);   // the changed value stays selected, so it's easy to see
      api.say(`Your CSS changed: ${item.selector} { ${item.prop}: ${inp.value}; }`, "info");
      colors();
    });

    /* ───────── Check my page ───────── */
    async function measureNarrow() {
      const box = $("#ws-framebox"), was = phone;
      box.classList.add("is-phone");
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const d = frame.contentDocument;
      const over = d ? d.documentElement.scrollWidth > d.documentElement.clientWidth + 1 : false;
      if (!was) box.classList.remove("is-phone");
      return over;
    }
    const STATE_TEXT = { good: "Looks good", fix: "Needs a fix", person: "Check with a person" };
    function showChecks(res, mode) {
      const need = S.checks.map((id) => ({ id, ...res.results[id] }));
      const fixes = need.filter((c) => c.state === "fix"), goods = need.filter((c) => c.state === "good"), persons = need.filter((c) => c.state === "person").map((c) => ({ msg: c.msg, wk: c.wk })).concat(res.person);
      const item = (c, st, detail = true) => `<li class="ws-check ws-check--${st}">${icon(st === "good" ? "check" : st === "fix" ? "alert" : "users")}<span><strong>${STATE_TEXT[st]}${c.id ? `: ${esc(LABEL[c.id])}` : ""}.</strong> ${detail ? esc(c.msg) : ""}</span>${detail && c.wk != null ? `<button type="button" class="linkish" data-find="${c.wk}">Find it</button>` : ""}</li>`;
      let html = "";
      if (mode === "summary") {
        html = `<p class="ws-checks__h">Check found ${fixes.length} problem${fixes.length === 1 ? "" : "s"}: ${fixes.map((c) => esc(LABEL[c.id])).join(", ")}. Press Check my page again to find where they are.</p><ul class="ws-checklist">${fixes.map((c) => item(c, "fix", false)).join("")}</ul>`;
      } else {
        html = `<ul class="ws-checklist">${fixes.map((c) => item(c, "fix")).join("")}${goods.map((c) => item(c, "good")).join("")}${persons.map((c) => item(c, "person")).join("")}</ul>`;
      }
      if (challenge) html += `<div class="ws-challenge"><p class="ws-checks__h">${icon("star")}Challenge mode goals</p><ul>${res.challenges.map((c) => `<li class="${c.done ? "is-done" : ""}">${icon(c.done ? "check" : "target")}${esc(c.label)}${c.done ? " (done)" : ""}</li>`).join("")}</ul></div>`;
      $("#ws-checks").innerHTML = html;
    }
    const FIX_WORDS = { h1: "Marked the main heading with <h1>", alt: "Gave every picture alt text", link: "Made the link words say where they go", contrast: "Made the text readable (contrast 4.5 to 1 or more)" };
    async function check() {
      clearTimeout(timer); save(); render(); await ready;
      const d = frame.contentDocument;
      const narrowOverflow = S.checks.includes("narrow") ? await measureNarrow() : undefined;
      const ctx = { css: ta.css ? ta.css.value : work.css, narrowOverflow, viewedPhone: !!state.viewed[idx] };
      const res = checks(d, ctx);
      res.challenges = challenges(d, ctx);
      const failing = S.checks.filter((id) => res.results[id].state === "fix");
      // Notice accessibility fixes the student made (stages 6–8), for the finished-website screen.
      ["h1", "alt", "link", "contrast"].forEach((id) => {
        if (prev[id] === "fix" && res.results[id] && res.results[id].state === "good" && !state.fixes.includes(FIX_WORDS[id])) state.fixes.push(FIX_WORDS[id]);
        if (res.results[id]) prev[id] = res.results[id].state;
      });
      st.save(state);
      api.log("lab_test_run", { stage: idx, failing });   // check names only, never the code
      checks2++;
      showChecks(res, S.source === "debug" && checks2 === 1 && failing.length ? "summary" : "full");
      if (failing.length) {
        failed++;
        api.say(S.source === "debug" && checks2 === 1 ? `This page has ${failing.length} problems. Press Check my page again to find where they are.`
          : `${res.results[failing[0]].msg}${help && failed >= 2 ? " Stuck? Press Need a hint? above, or Show an example." : ""}`, "warn");
        return;
      }
      win(res);
    }
    function win(res) {
      const passed = S.checks.filter((id) => res.results[id].state === "good");
      if (S.source !== "ship") {
        api.say(CELEBRATE[idx] || "Stage complete!", "good");
        api.win({ checks: passed, business: b.id }, { extra: `<p class="ws-cheer">${icon("check")}${esc(CELEBRATE[idx])}</p>` });
        return;
      }
      const doc = WK.srcdoc(ta.html.value, { css: ta.css.value });
      const info = { award: "First Website Shipped", course: "Build Your First Website", detail: `A web page for ${b.name}, checked for structure, style, and access`, name: api.user && api.user.role === "student" ? api.user.displayName : "", className: api.user && api.user.cls ? api.user.cls.name : "", at: Date.now() };
      const extra = `<section class="ws-done" id="ws-done" aria-labelledby="ws-done-h">
        <h3 id="ws-done-h">${icon("rocket")}Your First Website Is Ready!</h3>
        <p class="ws-done__biz">A website for <strong>${esc(b.name)}</strong> (a made-up Maine business)</p>
        <div class="ws-done__cols">
          <iframe class="ws-done__frame" title="Your finished website" sandbox srcdoc="${esc(doc)}"></iframe>
          <div>
            <h4>Checks that passed</h4>
            <ul class="ws-checklist">${passed.map((id) => `<li class="ws-check ws-check--good">${icon("check")}<span><strong>${esc(LABEL[id])}.</strong> ${esc(res.results[id].msg)}</span></li>`).join("")}</ul>
            ${state.fixes.length ? `<h4>Accessibility fixes you made</h4><ul class="ws-fixes">${state.fixes.map((f) => `<li>${icon("users")}${esc(f)}</li>`).join("")}</ul>` : ""}
          </div>
        </div>
        <h4>Think about it</h4>
        <ol class="ws-reflect"><li>What does your website help people do?</li><li>What was the hardest part of building it?</li><li>What changed after you tested your design?</li><li>How did you make your website easier for more people to use?</li></ol>
        <p>Answer these in the activity debrief, or show your teacher your page.</p>
        <div class="ws-done__actions">
          ${SE.certificate ? SE.certificate.button(info, "Print my certificate") : ""}
          <button type="button" class="btn btn--ghost" id="ws-copy">${icon("clipboard")}Copy my HTML and CSS</button>
          <button type="button" class="btn btn--ghost" id="ws-print">${icon("print")}Print my project summary</button>
        </div>
      </section>`;
      api.say("Your website passed every check. It's ready for review!", "good");
      api.win({ checks: passed, business: b.id, fixes: state.fixes.length }, { extra, title: "Ship Your First Website: complete!" });
      const copy = document.getElementById("ws-copy");
      if (copy) copy.addEventListener("click", () => {
        const text = exportPage(ta.html.value, ta.css.value, b.name);
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => api.say("Copied your HTML and CSS.", "good"), () => api.say("Your browser didn't allow copying.", "warn"));
      });
      const pr = document.getElementById("ws-print");
      if (pr) pr.addEventListener("click", () => { document.body.classList.add("ws-printing"); window.print(); setTimeout(() => document.body.classList.remove("ws-printing"), 500); });
    }

    /* ───────── Events ───────── */
    function showTab(t) {
      if (t === "css" && !ta.css) return;
      tab = t;
      ["html", "css"].forEach((k) => {
        const tb = $(`#ws-tab-${k}`), pn = $(`#ws-panel-${k}`);
        if (tb) tb.setAttribute("aria-selected", String(k === t));
        if (pn) pn.hidden = k !== t;
      });
      if (t === "css") colors();
      coach();
    }
    el.querySelectorAll("[role=tab]").forEach((t) => t.addEventListener("click", () => { showTab(t.id.replace("ws-tab-", "")); ta[tab].focus(); }));
    const tabs = $(".ws-tabs");
    tabs.addEventListener("keydown", (e) => {
      if (!ta.css || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
      showTab(tab === "html" ? "css" : "html"); $(`#ws-tab-${tab}`).focus();
    });
    Object.values(ta).forEach((area) => area && area.addEventListener("input", () => {
      save(); clearTimeout(timer); timer = setTimeout(() => { render(); if (area === ta.css) colors(); }, 300);
      confirmReset = false; $("#ws-reset").textContent = "Start this stage over";
    }));
    Object.values(ta).forEach((area) => area && ["click", "keyup"].forEach((ev) => area.addEventListener(ev, coach)));
    el.querySelectorAll("[data-tag]").forEach((bt) => bt.addEventListener("click", () => shelf(bt.dataset.tag)));
    $("#ws-check").addEventListener("click", check);
    $("#ws-undo").addEventListener("click", () => { ta[tab].focus(); document.execCommand("undo"); });
    $("#ws-redo").addEventListener("click", () => { ta[tab].focus(); document.execCommand("redo"); });
    $("#ws-checks").addEventListener("click", (e) => { const f = e.target.closest("[data-find]"); if (f) findCode(f.dataset.find); });
    $("#ws-reset").addEventListener("click", (e) => {
      if (!confirmReset) { confirmReset = true; e.currentTarget.textContent = "Yes, start this stage over"; api.say("This puts your code back the way it was when you started this stage. Press again to do it.", "info"); return; }
      const snap = state.snap[idx];
      ta.html.value = snap.html; if (ta.css) ta.css.value = snap.css;
      save(); render(); colors(); confirmReset = false; e.currentTarget.textContent = "Start this stage over";
      api.say("Your code is back to the start of this stage.", "info");
    });
    const exBtn = $("#ws-example");
    if (exBtn) exBtn.addEventListener("click", () => {
      const snippet = S.example(b);
      if (S.css && /\{/.test(snippet)) { showTab("css"); ta.css.setSelectionRange(ta.css.value.length, ta.css.value.length); typeAt(ta.css, (ta.css.value.trim() ? "\n" : "") + snippet); }
      else { showTab("html"); ta.html.setSelectionRange(ta.html.value.length, ta.html.value.length); typeAt(ta.html, (ta.html.value.endsWith("\n") || !ta.html.value ? "" : "\n") + snippet); }
      api.say("An example is in your code now. Change the words to make it yours.", "info");
    });
    const earlier = $("#ws-earlier");
    if (earlier) earlier.addEventListener("click", () => { const p = $("#ws-earlier-code"); p.hidden = !p.hidden; earlier.setAttribute("aria-expanded", String(!p.hidden)); });
    const size = (ph) => {
      phone = ph;
      $("#ws-framebox").classList.toggle("is-phone", ph);
      $("#ws-phone").setAttribute("aria-pressed", String(ph)); $("#ws-desk").setAttribute("aria-pressed", String(!ph));
      if (ph) { state.viewed[idx] = true; st.save(state); }
    };
    $("#ws-desk").addEventListener("click", () => size(false));
    $("#ws-phone").addEventListener("click", () => size(true));
    $("#ws-biz").addEventListener("change", (e) => { state.business = e.target.value; st.save(state); SE.route(true); });
    $("#ws-help").addEventListener("click", (e) => { help = !help; flag("stem207.website.help", help); $("#ws").classList.toggle("ws--help", help); e.currentTarget.setAttribute("aria-pressed", String(help)); });
    $("#ws-challenge").addEventListener("click", (e) => { challenge = !challenge; flag("stem207.website.challenge", challenge); e.currentTarget.setAttribute("aria-pressed", String(challenge)); api.say(challenge ? "Challenge mode is on. Press Check my page to see the extra goals." : "Challenge mode is off.", "info"); });

    render();
    if (S.source === "debug") api.say("Another developer left this page with four problems. Press Check my page to start investigating.", "info");
    return () => clearTimeout(timer);
  }

  /* The student's page as one HTML file to copy: the same allowlist, pictures named (not embedded), no outside requests. */
  function exportPage(html, css, title) {
    const safeCss = String(css).replace(/url\s*\(/gi, "url-off(").replace(/@import/gi, "@import-off");
    return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>${esc(title)}</title>\n<style>\n${safeCss}\n</style>\n</head>\n<body>\n${WK.sanitize(html).trim()}\n</body>\n</html>\n`;
  }

  const GOALS = {
    "Plan before you code": ["Plan a web page on paper and test it with a real person.", "Changing a sketch takes seconds. Changing finished code takes hours."],
    "HTML structure": ["Write HTML tags that give a page its structure.", "Every website is built from HTML. It tells browsers and screen readers what each part means."],
    "Paragraphs and lists": ["Use paragraphs, lists, and section headings to organize information.", "Clear structure helps everyone find what they need on a page."],
    "Links and images": ["Add a picture with alt text, and a link with clear words.", "Alt text and clear links are how pages work for people who can't see the screen."],
    "CSS": ["Write CSS rules: a selector, properties, and values.", "CSS controls how every website looks, from your school's page to a store's."],
    "Accessibility": ["Check and fix headings, alt text, links, and color contrast.", "About 1 in 4 adults has a disability. Accessible pages work for everyone."],
    "Debugging": ["Find and fix four bugs using a checklist.", "Web teams test every page before it goes live."],
    "Create": ["Build, check, and ship a complete web page of your own.", "This is how web developers work: plan, build, test, fix, and ship."]
  };
  SE.labs.goals(STAGES, STAGES.map((s) => GOALS[s.concept]));
  SE.labs.register({
    id: LAB,
    area: "coding",
    title: "Build Your First Website",
    tagline: "Launch your first website: plan, code, test, and ship a real web page for a made-up Maine business, in HTML and CSS.",
    levels: STAGES,
    chapters: [
      { title: "Plan", short: "Plan", from: 0, to: 0, blurb: "Meet your business and plan on paper. Then test your plan with a real person." },
      { title: "Build", short: "Build", from: 1, to: 3, blurb: "Real HTML: headings, paragraphs, lists, pictures, and links." },
      { title: "Style and access", short: "Style", from: 4, to: 5, blurb: "CSS for how it looks, and checks so it works for everyone." },
      { title: "Debug and ship", short: "Ship", from: 6, to: 7, blurb: "Fix a broken website, then build and ship your own." }
    ],
    mount: (el, idx, api) => (STAGES[idx].kind === "plan" ? mountPlan(el, idx, api) : mountCode(el, idx, api))
  });
  SE.website = { checks, challenges, TAGS, STAGES, BUSINESSES, exportPage, seed };
})();
