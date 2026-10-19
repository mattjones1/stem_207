/*
 * STEM 207 — progression engine.
 * Turns a student's activity log into XP, rank, patches, and pathway status.
 * Rules live in data/progression.js.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const STEM = window.STEM;
  const P = STEM.progression;

  function baseXp(act) {
    const d = act.duration <= 20 ? 20 : act.duration <= 30 ? 30 : 45;
    // Flat base: longer missions don't earn more. (d is kept so older settings still load.)
    return (P.xp.mission || P.xp.missionByDuration[d]) + (P.xp.levelBonus[act.level] || 0);
  }

  function rankFor(xp) {
    let idx = 0;
    P.ranks.forEach((r, i) => { if (xp >= r.xp) idx = i; });
    const rank = P.ranks[idx];
    const next = P.ranks[idx + 1] || null;
    const progress = next ? (xp - rank.xp) / (next.xp - rank.xp) : 1;
    return { rank, next, index: idx, progress: Math.max(0, Math.min(1, progress)) };
  }

  function patchProgress(patch, c) {
    switch (patch.rule) {
      case "missions": return c.missions;
      case "reflections": return c.reflections;
      case "extensions": return c.extensions;
      case "sectors": return c.sectors.size;
      case "collaborative": return c.collaborative;
      case "keyword": return c.keywords[patch.keyword] || 0;
      case "area": return c.areas[patch.area] || 0;
      case "stages": return c.stagesCleared;
      case "confident": return c.confident;
      case "labs": return c.labsTouched;
      case "labFull": return c.labsFull;
      case "labLevels": return c.labLevelsDone;
      default: return 0;
    }
  }

  /* Week index (Monday-based) for streaks. */
  const weekOf = (t) => {
    const d = new Date(t);
    const day = (d.getDay() + 6) % 7;
    return Math.floor((SE.startOfDay(t) - day * SE.DAY) / (7 * SE.DAY));
  };

  function profile(studentId, events) {
    events = (events || SE.store.eventsFor(studentId)).slice().sort((a, b) => a.at - b.at);
    const c = {
      missions: 0, reflections: 0, extensions: 0, collaborative: 0, confident: 0,
      sectors: new Set(), areas: {}, keywords: {}, stagesCleared: 0,
      labsTouched: 0, labsFull: 0, labLevelsDone: 0
    };
    const labLevels = {}; // labId -> Set of completed level indexes
    const labResults = {}; // labId -> { level: latest result }
    const labTimes = [];
    const labStats = {}; // labId -> { runs, hints }
    let xp = 0;
    const completedIds = new Set();
    const completions = [];
    const stages = {}; // stage -> { status: "claimed" | "cleared", at }
    const reviewed = {}; // completionId -> review event
    const earned = {}; // patchId -> at
    const opened = new Set();
    const steps = {}; // activityId -> Set of checked step indexes
    const missions = {}; // activityId -> { submitted, confirmed, tryAgain } (latest events)
    let lastActive = 0;

    const checkPatches = (at) => {
      P.patches.forEach((p) => {
        if (!earned[p.id] && patchProgress(p, c) >= p.n) earned[p.id] = at;
      });
    };

    events.forEach((e) => {
      if (!e.by) lastActive = Math.max(lastActive, e.at);
      const act = e.data && e.data.activityId ? SE.activityById[e.data.activityId] : null;

      if (e.type === "mission_opened" && act) opened.add(act.id);

      if (e.type === "step_checked" && act) {
        steps[act.id] = steps[act.id] || new Set();
        if (e.data.checked) steps[act.id].add(e.data.step);
        else steps[act.id].delete(e.data.step);
      }

      if (e.type === "mission_completed" && act) {
        const first = !completedIds.has(act.id);
        let gained = 0;
        const parts = [];
        if (first) {
          const b = baseXp(act);
          gained += b; parts.push(["Mission sent", b]);
          if (!c.sectors.has(act.area)) { gained += P.xp.newSector; parts.push([`New area: ${SE.areaById[act.area].short}`, P.xp.newSector]); }
          const answered = (e.data.reflection || "").trim().length >= 3;
          if (answered) { gained += P.xp.reflection; parts.push(["Answered Think about it", P.xp.reflection]); c.reflections++; }
          // New debriefs ask what happened (extensionNote); older ones used a checkbox.
          const tried = e.data.evidence ? !!(e.data.extensionNote || "").trim() : !!e.data.extension;
          if (tried) { gained += P.xp.extension; parts.push(["Tried Take it further", P.xp.extension]); c.extensions++; }
          c.missions++;
          c.sectors.add(act.area);
          c.areas[act.area] = (c.areas[act.area] || 0) + 1;
          if (act.format === "collaborative") c.collaborative++;
          (act.keywords || []).forEach((k) => { c.keywords[k] = (c.keywords[k] || 0) + 1; });
          if (e.data.confidence === "teach") c.confident++;
        } else {
          // Repeats are practice. They're recorded (so a teacher can read the new answer) but earn no XP.
          const r = Math.round(baseXp(act) * (P.xp.replay || 0));
          if (r) { gained += r; parts.push(["Mission replayed", r]); }
        }
        xp += gained;
        completedIds.add(act.id);
        completions.push({ event: e, activity: act, xp: gained, parts, first });
        const ms = (missions[act.id] = missions[act.id] || {});
        ms.submitted = e; if (ms.tryAgain && ms.tryAgain.at < e.at) ms.tryAgain = null;
        checkPatches(e.at);
      }
      // Teacher checks. Confirmation sticks; "try again" holds until the student submits again.
      if (e.type === "teacher_confirmed" && act) {
        const ms = (missions[act.id] = missions[act.id] || {});
        if (!ms.confirmed) { xp += P.xp.teacherConfirmed || 0; }
        ms.confirmed = e; ms.tryAgain = null;
      }
      if (e.type === "teacher_try_again" && act) {
        const ms = (missions[act.id] = missions[act.id] || {});
        if (!ms.confirmed) ms.tryAgain = e;
      }

      if (e.type === "ican_claimed") {
        const cur = stages[e.data.stage];
        if (!cur || cur.status !== "cleared") stages[e.data.stage] = { status: "claimed", at: e.at };
      }
      if (e.type === "ican_verified") {
        if (!stages[e.data.stage] || stages[e.data.stage].status !== "cleared") {
          stages[e.data.stage] = { status: "cleared", at: e.at };
          xp += P.xp.stageCleared;
          c.stagesCleared++;
          checkPatches(e.at);
        }
      }
      if (e.type === "ican_returned") {
        if (stages[e.data.stage] && stages[e.data.stage].status === "claimed") delete stages[e.data.stage];
      }
      if (e.type === "reflection_reviewed") reviewed[e.data.completionId] = e;

      if (e.type === "lab_test_run" || e.type === "lab_hint") {
        const st = (labStats[e.data.labId] = labStats[e.data.labId] || { runs: 0, hints: 0 });
        if (e.type === "lab_test_run") st.runs++; else st.hints++;
      }
      if (e.type === "lab_level_completed") {
        labTimes.push(e.at);
        const id = e.data.labId;
        if (!labLevels[id]) { labLevels[id] = new Set(); c.labsTouched++; }
        labResults[id] = labResults[id] || {};
        labResults[id][e.data.level] = { at: e.at, result: e.data.result || {} };
        if (!labLevels[id].has(e.data.level)) {
          labLevels[id].add(e.data.level);
          xp += P.xp.labLevel;
          c.labLevelsDone++;
          const lab = SE.labs && SE.labs.byId(id);
          if (lab && labLevels[id].size === lab.levels.length) c.labsFull++;
        }
        checkPatches(e.at);
      }
    });

    // Weekly streak: consecutive weeks (ending this week or last) with at least one mission.
    const weeks = new Set(completions.map((x) => weekOf(x.event.at)).concat(labTimes.map(weekOf)));
    let streak = 0;
    let w = weekOf(Date.now());
    if (!weeks.has(w)) w -= 1;
    while (weeks.has(w)) { streak++; w--; }

    const patches = P.patches.map((p) => ({
      patch: p,
      earned: !!earned[p.id],
      earnedAt: earned[p.id] || null,
      progress: Math.min(p.n, patchProgress(p, c)),
      target: p.n
    }));

    return {
      xp, ...rankFor(xp),
      counts: c,
      completions,
      completedIds,
      opened,
      steps,
      stages,
      reviewed,
      patches,
      earnedCount: patches.filter((p) => p.earned).length,
      lastActive,
      streak,
      labLevels,
      labResults,
      labStats,
      missions
    };
  }

  /* Suggested next missions: pathway first, then new areas, then anything in grade band. */
  function recommendations(student, prof, limit = 3) {
    const inBand = (a) => !student.gradeBand || a.grades.includes(student.gradeBand);
    // Assigned missions get their own section on the student home, so suggestions skip them.
    const assignedIds = new Set(student.classId ? SE.store.assignmentsFor(student.classId).map((x) => x.activityId) : []);
    // Only suggest what a student can start alone: no teacher-led activities, hands-on activities
    // that need materials, or placeholders. Teachers can still assign any of these.
    const canStartAlone = (a) => a.format !== "teacher-led" && (a.launch.status === "lab" || a.launch.status === "ready")
      && !(a.access && (a.access.supervision || (a.access.hardware || []).length));
    // Respect prerequisites: no coding activity beyond the student's next pathway stage, and no
    // advanced activity until they've finished an intermediate one in the same area.
    const stageOf = (a) => a.pathwayStage || (STEM.pathway.find((s) => s.activities.includes(a.id)) || {}).stage || 0;
    let reach = 1;
    while (prof.stages[reach] && prof.stages[reach].status === "cleared") reach++;
    prof.completions.forEach((c) => { reach = Math.max(reach, stageOf(c.activity) + 1); });
    const doneLevel = (area, level) => prof.completions.some((c) => c.activity.area === area && c.activity.level === level);
    const ready = (a) => (stageOf(a) <= reach) && (a.level !== "advanced" || doneLevel(a.area, "intermediate"));
    const notDone = (a) => !prof.completedIds.has(a.id) && !assignedIds.has(a.id) && canStartAlone(a) && ready(a);
    const picks = [];
    const add = (a, reason) => { if (a && !picks.some((p) => p.activity.id === a.id)) picks.push({ activity: a, reason }); };

    // Next coding pathway stage
    let nextStage = 1;
    while (prof.stages[nextStage] && prof.stages[nextStage].status === "cleared") nextStage++;
    const stage = STEM.pathway.find((s) => s.stage === nextStage);
    if (stage) {
      // Prefer the student's own grade-band track (e.g. the grades 6–8 missions), then anything in band.
      const acts = stage.activities.map((id) => SE.activityById[id]).filter((a) => a && notDone(a));
      const act = acts.find((a) => a.track && a.track === student.gradeBand) || acts.find(inBand);
      if (act) add(act, `Coding pathway, stage ${stage.stage}`);
    }
    // An area they haven't visited yet
    STEM.areas.forEach((area) => {
      if (prof.counts.sectors.has(area.id)) return;
      const act = STEM.activities.filter((a) => a.area === area.id && inBand(a) && notDone(a))
        .sort((x, y) => SE.levelOrder[x.level] - SE.levelOrder[y.level])[0];
      if (act) add(act, `New area: ${area.short}`);
    });
    // Anything else in their grade band, easiest first
    STEM.activities.filter((a) => inBand(a) && notDone(a))
      .sort((x, y) => SE.levelOrder[x.level] - SE.levelOrder[y.level] || x.duration - y.duration)
      .forEach((a) => add(a, "Ready for you"));

    return picks.slice(0, limit);
  }

  function classSummary(classId) {
    const students = SE.store.studentsIn(classId);
    const events = SE.store.eventsForClass(classId);
    const byStudent = {};
    events.forEach((e) => { (byStudent[e.studentId] = byStudent[e.studentId] || []).push(e); });
    const profiles = students.map((s) => ({ student: s, prof: profile(s.id, byStudent[s.id] || []) }));
    const totalXp = profiles.reduce((sum, p) => sum + p.prof.xp, 0);
    return { students, events, profiles, totalXp, goal: classGoal(totalXp) };
  }

  function classGoal(totalXp) {
    const g = P.classGoal;
    let idx = 0;
    g.forEach((m, i) => { if (totalXp >= m.xp) idx = i; });
    const reached = g[idx];
    const next = g[idx + 1] || null;
    const progress = next ? (totalXp - reached.xp) / (next.xp - reached.xp) : 1;
    return { reached, next, index: idx, progress: Math.max(0, Math.min(1, progress)), totalXp };
  }

  /* Has this student finished a mission? For lab missions, finishing every level counts too. */
  function missionDone(prof, a) {
    const ms = prof.missions[a.id] || {};
    if (ms.confirmed) return true;
    if (ms.tryAgain) return false;   // the teacher reopened it
    if (prof.completedIds.has(a.id)) return true;
    const labId = a.launch && a.launch.labId;
    const lab = labId && SE.labs && SE.labs.byId(labId);
    if (!lab) return false;
    // A lab mission is done when its core levels pass (all levels unless coreLevels is set).
    const lv = prof.labLevels[labId] || new Set();
    const core = Math.min(lab.levels.length, a.coreLevels || lab.levels.length);
    return [...Array(core).keys()].every((i) => lv.has(i));
  }

  /* One status per mission for a student, strongest first:
   *   confirmed  Teacher confirmed the target skill (spoken check, watched a demo, or reviewed work)
   *   tryagain   Teacher asked for more work; holds until the student submits again
   *   checked    The lab's own check passed for its core levels (only what the lab tests)
   *   submitted  The student submitted evidence (written, or "I'll show my teacher"); not yet confirmed
   *   started    Opened it, checked a step, or finished a lab level
   *   none       Not started
   * legacy: the latest submission came from the old one-click flow. */
  function statusFor(prof, a) {
    const ms = prof.missions[a.id] || {};
    const labId = a.launch && a.launch.labId;
    const lab = labId && SE.labs && SE.labs.byId(labId);
    const lv = lab ? (prof.labLevels[labId] || new Set()) : null;
    const core = lab ? Math.min(lab.levels.length, a.coreLevels || lab.levels.length) : 0;
    const coreDone = lab && [...Array(core).keys()].every((i) => lv.has(i));
    const sub = ms.submitted;
    const legacy = !!sub && !sub.data.evidence && !sub.isDemo && sub.at < (P.legacyBefore || 0);
    const base = { sub, legacy, confirmed: ms.confirmed, tryAgain: ms.tryAgain };
    if (ms.confirmed) return { ...base, state: "confirmed", label: "Teacher confirmed" };
    if (ms.tryAgain) return { ...base, state: "tryagain", label: "Try again" };
    if (coreDone) return { ...base, state: "checked", label: "Checked in lab" };
    if (sub) return { ...base, state: "submitted", label: legacy ? "Legacy" : sub.data.evidence === "show" ? "Submitted (will show teacher)" : "Submitted" };
    const started = prof.opened.has(a.id) || (prof.steps[a.id] && prof.steps[a.id].size > 0) || (lv && lv.size > 0);
    return { ...base, state: started ? "started" : "none", label: started ? "Started" : "Not started" };
  }

  SE.game = { profile, recommendations, classSummary, classGoal, rankFor, baseXp, missionDone, statusFor };
})();
