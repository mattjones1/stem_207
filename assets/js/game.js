/*
 * STEM 207 — progression engine.
 * Turns a student's activity log into XP, rank, and patches. Rules live in data/progression.js.
 *
 * One check for every activity: the student sends a reflection (the deliverable), and the teacher
 * marks it Pass (teacher_confirmed: XP is earned) or Try again (teacher_try_again: no XP; it reopens).
 * Sending, lab levels, and old "I can" stage checks earn nothing on their own.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const STEM = window.STEM;
  const P = STEM.progression;

  function baseXp(act) {
    const d = act.duration <= 20 ? 20 : act.duration <= 30 ? 30 : 45;
    // Flat base: longer activities don't earn more. (d is kept so older settings still load.)
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
      case "crewPass": {   // passes among a crew template's activities
        const t = (STEM.pathwayTemplates || []).find((x) => x.id === patch.crew);
        return t ? t.steps.filter((s) => c.passedIds.has(s.activityId)).length : 0;
      }
      default: return 0;
    }
  }

  /* Week index (Monday-based) for streaks. */
  const weekOf = (t) => {
    const d = new Date(t);
    const day = (d.getDay() + 6) % 7;
    return Math.floor((SE.startOfDay(t) - day * SE.DAY) / (7 * SE.DAY));
  };

  /* Events only a teacher may write. They count only when they carry the teacher's id (by), so a
     student device can't pass its own work (student_log also refuses them: supabase/update-11). */
  const TEACHER_ONLY = new Set(["teacher_confirmed", "teacher_try_again", "teacher_note", "reflection_reviewed", "ican_verified", "ican_returned",
    "moxie_gate", "moxie_rubric", "pathway_review", "pathway_observation"]);
  const trusted = (e) => !TEACHER_ONLY.has(e.type) || !!e.by;

  function profile(studentId, events) {
    events = (events || SE.store.eventsFor(studentId)).filter(trusted).sort((a, b) => a.at - b.at);
    const c = {
      missions: 0, reflections: 0, extensions: 0, collaborative: 0, confident: 0,
      sectors: new Set(), areas: {}, keywords: {}, stagesCleared: 0,
      labsTouched: 0, labsFull: 0, labLevelsDone: 0,
      passedIds: new Set()   // for crew patches
    };
    const labLevels = {}; // labId -> Set of completed level indexes
    const labResults = {}; // labId -> { level: latest result }
    const labTimes = [];
    const labStats = {}; // labId -> { runs, hints }
    let xp = 0;
    const completedIds = new Set();   // passed by the teacher
    const sentIds = new Set();        // sent at least once
    const completions = [];           // every send (the deliverable), oldest first
    const passes = [];                // every first pass, with the XP it earned
    const stages = {}; // stage -> { status: "claimed" | "cleared", at }
    const reviewed = {}; // completionId -> review event
    const notes = [];    // teacher_note events, private to this student
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
        // A send is the deliverable. It earns nothing yet: XP comes when the teacher passes it.
        const first = !sentIds.has(act.id);
        sentIds.add(act.id);
        completions.push({ event: e, activity: act, xp: 0, parts: [], first });
        const ms = (missions[act.id] = missions[act.id] || {});
        ms.submitted = e; if (ms.tryAgain && ms.tryAgain.at < e.at) ms.tryAgain = null;
      }
      // Teacher checks. A pass sticks and earns the XP once; "try again" holds until the student sends again.
      if (e.type === "teacher_confirmed" && act) {
        const ms = (missions[act.id] = missions[act.id] || {});
        if (!ms.confirmed) {
          const sub = (ms.submitted && ms.submitted.data) || {};
          let gained = baseXp(act);
          const parts = [["Passed by your teacher", gained]];
          if (!c.sectors.has(act.area)) { gained += P.xp.newSector; parts.push([`First pass in ${SE.areaById[act.area].short}`, P.xp.newSector]); }
          xp += gained;
          passes.push({ event: e, activity: act, xp: gained, parts });
          c.missions++;
          c.sectors.add(act.area);
          c.areas[act.area] = (c.areas[act.area] || 0) + 1;
          if (act.format === "collaborative") c.collaborative++;
          (act.keywords || []).forEach((k) => { c.keywords[k] = (c.keywords[k] || 0) + 1; });
          if ((sub.reflection || "").trim().length >= 3) c.reflections++;
          if (sub.evidence ? !!(sub.extensionNote || "").trim() : !!sub.extension) c.extensions++;
          if (sub.confidence === "teach") c.confident++;
          completedIds.add(act.id);
          c.passedIds.add(act.id);
          checkPatches(e.at);
        }
        ms.confirmed = e; ms.tryAgain = null;
      }
      if (e.type === "teacher_try_again" && act) {
        const ms = (missions[act.id] = missions[act.id] || {});
        if (!ms.confirmed) ms.tryAgain = e;
      }

      if (e.type === "reflection_reviewed") reviewed[e.data.completionId] = e;
      if (e.type === "teacher_note" && e.data.note) notes.unshift(e);   // newest first

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
          labLevels[id].add(e.data.level);   // practice: lab levels count toward lab patches, not XP
          c.labLevelsDone++;
          const lab = SE.labs && SE.labs.byId(id);
          if (lab && labLevels[id].size === lab.levels.length) c.labsFull++;
        }
        checkPatches(e.at);
      }
    });

    // Weekly streak: consecutive weeks (ending this week or last) with at least one activity.
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
      sentIds,
      passes,
      opened,
      steps,
      stages,
      reviewed,
      notes,
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
    // Assigned activities get their own section on the student home, so suggestions skip them.
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
      // Prefer the student's own grade-band track (e.g. the grades 6–8 activities), then anything in band.
      const acts = stage.activities.map((id) => SE.activityById[id]).filter((a) => a && notDone(a));
      const act = acts.find((a) => a.track && a.track === student.gradeBand) || acts.find(inBand);
      if (act) add(act, `Coding Foundations, step ${stage.stage}`);
    }
    // An area they haven't visited yet
    SE.liveAreas.forEach((area) => {
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
    return { students, events, profiles, totalXp, journey: classJourney(classId) };
  }

  /* ───────── Class rewards ─────────
   * Counts of class work. The same rules run in supabase/update-8-usability.sql (class_journey),
   * which is how a student's device gets the whole class's totals.
   * "Assigned" = activities assigned to the class, plus activities in Learning Plans assigned to it.
   *   passed        distinct (student, assigned activity) a teacher passed  ← the only source of points
   *   passedAll     distinct (student, activity) a teacher passed
   *   withPassed    students with at least one assigned activity passed
   *   withThree     students with at least three activities passed
   *   onTime        assigned activities with a due date that every student sent by the end of that day (UTC) */
  const dueEnd = (d) => { const [y, m, dd] = d.split("-").map(Number); return Date.UTC(y, m - 1, dd + 1); };
  function assignedIds(classId) {
    const ids = new Set(SE.store.assignmentsFor(classId).map((a) => a.activityId));
    (SE.store.pathwayAssignmentsFor ? SE.store.pathwayAssignmentsFor(classId) : []).forEach((pa) =>
      (pa.snapshot ? pa.snapshot.steps : []).forEach((s) => { if (s.kind === "mission" && s.activityId) ids.add(s.activityId); }));
    return ids;
  }
  function classCounts(classId) {
    const students = SE.store.studentsIn(classId);
    const ids = new Set(students.map((s) => s.id));
    const assignedSet = assignedIds(classId);
    const dated = SE.store.assignmentsFor(classId).filter((a) => a.dueDate);
    const events = SE.store.eventsForClass(classId).filter((e) => ids.has(e.studentId) && trusted(e));
    const sent = new Map(), passedAll = new Set(), passed = new Set();
    events.forEach((e) => {
      const a = e.data && e.data.activityId;
      if (!a) return;
      if (e.type === "mission_completed") { const k = `${e.studentId}|${a}`; if (!sent.has(k) || sent.get(k) > e.at) sent.set(k, e.at); }
      if (e.type === "teacher_confirmed") { passedAll.add(`${e.studentId}|${a}`); if (assignedSet.has(a)) passed.add(`${e.studentId}|${a}`); }
    });
    const per = {};
    passedAll.forEach((k) => { const s = k.split("|")[0]; per[s] = (per[s] || 0) + 1; });
    const withPassed = new Set([...passed].map((k) => k.split("|")[0]));
    let onTime = 0;
    if (students.length) dated.forEach((x) => {
      if (students.every((s) => { const at = sent.get(`${s.id}|${x.activityId}`); return at != null && at < dueEnd(x.dueDate); })) onTime++;
    });
    return { students: students.length, passed: passed.size, passedAll: passedAll.size, withPassed: withPassed.size,
      withThree: Object.values(per).filter((n) => n >= 3).length, onTime };
  }
  function journeyFrom(c) {
    const points = (c.passed || 0) * P.classPoints.passed;
    const all = (n) => c.students > 0 && n >= c.students;
    const earned = { "first-haul": c.passedAll >= 1, "all-hands": all(c.withPassed), pathfinders: all(c.withThree), "right-on-tide": c.onTime >= 1, "steady-crew": c.passedAll >= 10 };
    return { counts: c, points, goal: classGoal(points), badges: P.classBadges.map((b) => ({ badge: b, earned: !!earned[b.id] })) };
  }
  /* On a student's device in cloud mode, the class totals come from the server (the device only
     holds that student's own work). Everywhere else they're counted from the data in hand. */
  function classJourney(classId) {
    const server = SE.store.journeyCounts && SE.store.journeyCounts(classId);
    return journeyFrom(server || classCounts(classId));
  }
  /* What one student has added to the class journey. */
  function classPointsFor(studentId, classId) {
    const assignedSet = assignedIds(classId);
    const passed = new Set(SE.store.eventsFor(studentId).filter((e) => e.type === "teacher_confirmed" && trusted(e) && assignedSet.has(e.data.activityId)).map((e) => e.data.activityId));
    return passed.size * P.classPoints.passed;
  }

  function classGoal(points) {
    const g = P.classGoal;
    let idx = 0;
    g.forEach((m, i) => { if (points >= m.pts) idx = i; });
    const reached = g[idx];
    const next = g[idx + 1] || null;
    const progress = next ? (points - reached.pts) / (next.pts - reached.pts) : 1;
    return { reached, next, index: idx, progress: Math.max(0, Math.min(1, progress)), points };
  }

  /* Is the student's part done? Sent (waiting for the teacher) or passed; a Try again reopens it. */
  function missionDone(prof, a) {
    const ms = prof.missions[a.id] || {};
    if (ms.confirmed) return true;
    if (ms.tryAgain) return false;
    return !!ms.submitted;
  }

  /* One status per activity for a student, strongest first (words, so color is never the only signal):
   *   confirmed  "Passed": the teacher passed the reflection (XP earned)
   *   tryagain   "Try again": the teacher asked for more; holds until the student sends again
   *   submitted  "Sent": the reflection is waiting for the teacher (written, or "I'll show my teacher")
   *   started    "In progress": opened it, checked a step, or played a lab level
   *   none       "Not started"
   * legacy: the latest send came from the old one-click flow. */
  function statusFor(prof, a) {
    const ms = prof.missions[a.id] || {};
    const labId = a.launch && a.launch.labId;
    const lv = labId ? (prof.labLevels[labId] || new Set()) : null;
    const sub = ms.submitted;
    const legacy = !!sub && !sub.data.evidence && !sub.isDemo && sub.at < (P.legacyBefore || 0);
    const base = { sub, legacy, confirmed: ms.confirmed, tryAgain: ms.tryAgain };
    if (ms.confirmed) return { ...base, state: "confirmed", label: "Passed" };
    if (ms.tryAgain) return { ...base, state: "tryagain", label: "Try again" };
    if (sub) return { ...base, state: "submitted", label: legacy ? "Sent (older record)" : sub.data.evidence === "show" ? "Sent (will show teacher)" : "Sent" };
    const started = prof.opened.has(a.id) || (prof.steps[a.id] && prof.steps[a.id].size > 0) || (lv && lv.size > 0);
    return { ...base, state: started ? "started" : "none", label: started ? "In progress" : "Not started" };
  }

  SE.game = { profile, recommendations, classSummary, classGoal, classCounts, journeyFrom, classJourney, classPointsFor, rankFor, baseXp, missionDone, statusFor };
})();
