/*
 * STEM 207 — who can open what (planning/STEM 207 PAID.md). Loaded right after content.js.
 *
 * Two subscriptions, never per activity:
 *   family     $20/month or $200/year: every activity for up to 4 children at home, XP and patches.
 *   educator   $40/month or $400/year: everything in Family, plus classes, Learning Plans, checks, tracking.
 * Free (no plan): the free tier in data/tiers.js (activities, full labs, level 1 of the other labs),
 * browsing, and the read-only sample class. Students and home children get their class owner's plan.
 *
 * An account's plan is `plan` on its educators row: "none" | "family" | "educator". An account made before
 * subscriptions has no `plan` and counts as a founding educator, so no live class breaks. In local mode the
 * plan can be simulated on #/account (setLocalPlan); in cloud mode it will come from the server (my_access).
 *
 * `enforced` turns the locks on. It's on in local mode (development and tests) and off in cloud mode until
 * the server checks access too (supabase/update-13), so the live site never locks anyone out by accident.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const STEM = window.STEM;
  const T = STEM.tiers || { activities: [], labs: {}, templates: [], moxie: [] };
  const FREE = new Set(T.activities);
  const PLANS = ["none", "family", "educator"];

  const PRICES = {
    family: { name: "Family", month: 20, year: 200, blurb: "Every activity at home for up to 4 children. XP, ranks, patches, and My harbor." },
    educator: { name: "Educator", month: 40, year: 400, blurb: "Everything in Family, plus classes, Learning Plans, checks, and student tracking." },
  };

  const enforced = () => !(SE.store && SE.store.mode === "cloud");
  const accountPlan = (ed) => (!ed ? "none" : PLANS.includes(ed.plan) ? ed.plan : "educator");

  /* Local mode only: tests of how a lab works (not who may open it) set stem207.devPlan to play every level. */
  const devPlan = () => { if (SE.store && SE.store.mode === "cloud") return null; try { const p = localStorage.getItem("stem207.devPlan"); return PLANS.includes(p) ? p : null; } catch (e) { return null; } };

  /* The plan that applies to this person: their own (an account) or their class owner's (a student). */
  function plan(user) {
    if (devPlan()) return devPlan();
    if (!user || user.role === "guest") return "none";
    if (user.role === "educator") return accountPlan(user);
    if (user.role === "student") {
      if (user.cls && PLANS.includes(user.cls.access)) return user.cls.access;   // from the server (student_state, update-13)
      const owner = user.cls && SE.store.educatorById && SE.store.educatorById(user.cls.educatorId);
      return owner ? accountPlan(owner) : "educator";   // cloud before update-13: the owner isn't loaded
    }
    return "none";
  }
  const paid = (user) => plan(user) !== "none";

  const isFree = (a) => !!a && FREE.has(a.id);
  const canOpen = (a, user) => !enforced() || isFree(a) || paid(user);
  /* Lab levels: a "full" lab is free throughout, every other lab's level 1 (index 0) is a free preview. */
  const labTier = (labId) => T.labs[labId] || null;
  const canOpenLab = (labId, idx, user) => !enforced() || labTier(labId) === "full" || idx === 0 || paid(user);
  const canTeach = (user) => !enforced() || plan(user) === "educator";
  const canFamily = (user) => !enforced() || paid(user);
  const isTemplateFree = (t) => !!t && (T.templates || []).includes(t.id);

  const isParent = (user) => !!user && user.role === "educator" && user.accountKind === "parent";
  const atHome = (user) => !!user && user.role === "student" && !!user.cls && user.cls.kind === "family";

  /* What a locked item says to this person. Students and children never see prices. */
  function lockText(user) {
    if (user && user.role === "student") return atHome(user) ? "Ask a grown-up to open this one." : "Ask your teacher about this one.";
    if (user && user.role === "educator" && paid(user)) return "Part of the Educator plan.";
    return "Part of a STEM 207 subscription.";
  }
  const canSubscribe = (user) => !user || user.role === "guest" || user.role === "educator";

  /* Local mode only: simulate a subscription so the whole flow can be tried and tested without Stripe. */
  function setLocalPlan(user, p) {
    if (SE.store.mode === "cloud" || !user || user.role !== "educator" || !PLANS.includes(p)) return false;
    return SE.store.setPlan(user.id, p);
  }

  SE.access = { PLANS, PRICES, enforced, plan, paid, isFree, canOpen, labTier, canOpenLab, canTeach, canFamily, isTemplateFree,
    isParent, atHome, lockText, canSubscribe, setLocalPlan, tiers: T };
  SE.content.openable = (a, user) => SE.content.visibleTo(a, user) && canOpen(a, user);
})();
