/*
 * STEM 207 — Pricing and Account (planning/STEM 207 PAID.md, workstream B).
 *
 *   #/pricing   public: the two subscriptions (Family, Educator), monthly or yearly, and what's free
 *   #/account   educators and parents: the plan, its status, and Subscribe / Upgrade / Manage billing
 *
 * Subscriptions only, never per activity. Students never see this page or any price.
 * Checkout runs through Stripe (workstream E). Until then, local mode can simulate a plan on #/account
 * so every locked and unlocked state can be tried; cloud mode says checkout is coming.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const STEM = window.STEM;
  const { icon, esc } = SE;
  const app = () => document.getElementById("app");
  const P = () => SE.access.PRICES;
  let interval = "year";

  const FEATURES = {
    family: ["Every activity and lab, all levels", "Up to 4 children, each with their own sign-in pictures", "XP, ranks, patches, and My harbor", "Work at your own pace, no classroom needed"],
    educator: ["Everything in Family", "Classes with sign-in codes (no student emails)", "Learning Plans, templates, and the Moxie course", "Checks: Pass or Try again, with XP for students", "Student and class progress"],
  };
  const price = (plan) => interval === "year" ? `$${P()[plan].year}<small>/year</small>` : `$${P()[plan].month}<small>/month</small>`;
  const saving = (plan) => interval === "year" ? `<span class="price-card__save">2 months free</span>` : "";

  function top(title, lede, ic) {
    return `
      <section class="page-top">
        <div class="wrap page-top__inner">
          <div class="backbar">${SE.backLink()}</div>
          <div class="page-top__head"><span class="icon-badge">${icon(ic)}</span><div><h1 tabindex="-1">${esc(title)}</h1></div></div>
          <p class="page-top__lede">${esc(lede)}</p>
        </div>
      </section>`;
  }

  /* Choose a plan: guests make a free account first; educators and parents go to checkout (or simulate it in local mode). */
  function choose(user, plan) {
    if (!user || user.role === "guest") {
      try { sessionStorage.setItem("stem207.wantPlan", plan); } catch (e) { /* fine */ }
      SE.toast("Make a free account first. Then you can subscribe.");
      location.hash = "#/signup";
      return;
    }
    if (SE.store.mode !== "cloud") {
      SE.access.setLocalPlan(user, plan);
      SE.toast(`${P()[plan].name} plan on (simulated in this browser).`);
      location.hash = "#/account";
      SE.route(true);
      return;
    }
    if (SE.access.checkout) return SE.access.checkout(plan, interval);
    SE.toast("Online checkout is coming soon. Contact STEM Coliseum to subscribe.");
  }

  SE.views.pricing = function (user) {
    if (user && user.role === "student") { location.replace("#/"); return; }
    const mine = user && user.role === "educator" ? SE.access.plan(user) : "none";
    const card = (plan) => `
      <li class="price-card ${plan === "educator" ? "price-card--edu" : ""}">
        <h2>${esc(P()[plan].name)}</h2>
        <p class="price-card__price">${price(plan)}${saving(plan)}</p>
        <p>${esc(P()[plan].blurb)}</p>
        <ul class="bullets">${FEATURES[plan].map((f) => `<li><span>${esc(f)}</span></li>`).join("")}</ul>
        ${mine === plan ? `<p class="chip chip--ok">${icon("check")}Your plan</p>`
          : mine === "educator" && plan === "family" ? `<p class="muted small">Included in your Educator plan.</p>`
          : `<button type="button" class="btn ${plan === "educator" ? "btn--primary" : "btn--ghost"}" data-choose="${plan}">${icon("arrowRight")}${mine === "family" ? "Upgrade to Educator" : `Choose ${esc(P()[plan].name)}`}</button>`}
      </li>`;
    const free = SE.access.tiers.activities.length;
    app().innerHTML = top("Pricing", "One subscription opens every activity. There's nothing to buy one activity at a time.", "star") + `
      <section class="wrap section">
        <div class="seg" role="group" aria-label="Billing">
          <button type="button" class="seg__btn" data-interval="month" aria-pressed="${interval === "month"}">Monthly</button>
          <button type="button" class="seg__btn" data-interval="year" aria-pressed="${interval === "year"}">Yearly</button>
        </div>
        <ul class="price-cards">${card("family")}${card("educator")}</ul>
        <div class="block price-free">
          <h2>${icon("star")}Free, no subscription</h2>
          <p>${free} activities across every category, three labs with every level, and level 1 of every other lab. Make a free account to look around, or explore as a guest.</p>
          <a class="btn btn--ghost btn--small" href="#/activities">${icon("compass")}See the activities</a>
        </div>
        <div class="block price-free">
          <h2>${icon("users")}Schools and districts</h2>
          <p>Buying for several teachers? We send one invoice for the whole school, at the Educator price per teacher, and turn each teacher's account on.</p>
          <a class="btn btn--ghost btn--small" href="https://stem-coliseum.odoo.com/" target="_blank" rel="noopener">${icon("message")}Contact STEM Coliseum<span class="visually-hidden"> (opens in a new tab)</span></a>
        </div>
        <p class="muted small">Prices in US dollars. Cancel anytime from your Account page. Children and students never see prices.</p>
      </section>`;
    app().querySelectorAll("[data-interval]").forEach((b) => b.addEventListener("click", () => { interval = b.dataset.interval; SE.route(true); }));
    app().querySelectorAll("[data-choose]").forEach((b) => b.addEventListener("click", () => choose(user, b.dataset.choose)));
  };

  SE.views.account = function (user) {
    const plan = SE.access.plan(user);
    const founding = !user.plan;   // accounts from before subscriptions
    const parent = SE.access.isParent(user);
    const status = founding ? `<p><strong>Founding educator.</strong> You have full access, as an early STEM 207 educator. Thank you!</p>`
      : plan === "none" ? `<p><strong>Free account.</strong> You can look around: ${SE.access.tiers.activities.length} free activities, three full labs, and level 1 of every other lab.${parent ? " Subscribe to add your children." : " Subscribe to make classes and Learning Plans."}</p>`
      : `<p><strong>${esc(P()[plan].name)} plan.</strong> ${esc(P()[plan].blurb)}</p>`;
    app().innerHTML = top("Account", parent ? "Your plan and your family's access." : "Your plan and what it opens.", "user") + `
      <section class="wrap section acct">
        <div class="block">
          <h2>${icon("key")}Your plan</h2>
          ${status}
          <div class="acct__actions">
            ${plan === "none" ? `<a class="btn btn--primary" href="#/pricing">${icon("arrowRight")}See plans and subscribe</a>` : ""}
            ${plan === "family" ? `<a class="btn btn--primary" href="#/pricing">${icon("arrowRight")}Upgrade to Educator</a>` : ""}
            ${plan !== "none" && !founding && SE.store.mode === "cloud" ? `<button type="button" class="btn btn--ghost" id="acct-billing">${icon("tools")}Manage billing</button>` : ""}
          </div>
        </div>
        <div class="block">
          <h2>${icon("user")}About you</h2>
          <dl class="facts">
            <div><dt>Name</dt><dd>${esc(user.name)}</dd></div>
            <div><dt>Email</dt><dd>${esc(user.email || "")}</dd></div>
            <div><dt>Account</dt><dd>${parent ? "Parent or family" : "Educator"}</dd></div>
          </dl>
          ${!parent && SE.access.canFamily(user) ? `<p class="muted small">Your plan also covers your own children at home. <a href="#/family">Set up your family</a></p>` : ""}
        </div>
        ${SE.store.mode === "cloud" ? "" : `
        <div class="block acct-dev">
          <h2>${icon("flag")}Try a plan (this browser only)</h2>
          <p class="muted small">Local mode: no payment. Pick a plan to see what each one opens.</p>
          <div class="seg" role="group" aria-label="Simulated plan">
            ${["none", "family", "educator"].map((p) => `<button type="button" class="seg__btn" data-sim="${p}" aria-pressed="${plan === p && !founding}">${p === "none" ? "Free" : esc(P()[p].name)}</button>`).join("")}
          </div>
        </div>`}
      </section>`;
    app().querySelectorAll("[data-sim]").forEach((b) => b.addEventListener("click", () => {
      SE.access.setLocalPlan(user, b.dataset.sim);
      SE.toast(b.dataset.sim === "none" ? "Free account (simulated)." : `${P()[b.dataset.sim].name} plan on (simulated).`);
      SE.route(true);
    }));
    const billing = document.getElementById("acct-billing");
    if (billing) billing.addEventListener("click", () => (SE.access.portal ? SE.access.portal() : SE.toast("Billing opens here once online checkout is on.")));
  };
})();
