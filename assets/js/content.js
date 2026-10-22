/*
 * STEM 207 — content status: what is published, which version, whether its resource is ready,
 * and who may see or assign it. Loaded right after core.js.
 *
 * Two separate ideas (never mix them):
 *   pub (editorial status)   draft → review → hardware → pilot → published. A missing `pub` means
 *                            published, so the hand-written missions need no field.
 *   readiness (delivery)     ready · missing-resource (launch "coming-soon", or a placeholder) ·
 *                            needs-review (`resourceReview: "needed"`, e.g. a link someone reported).
 *
 * Unpublished records live in STEM.drafts: found by id (SE.activityById), never in STEM.activities,
 * so library lists, counts, suggestions, and the expedition map skip them with no extra filters.
 * Educators see every draft (they are the content editors). Students see a "pilot" record only when
 * their class has it assigned. Placeholders are never assignable.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const STEM = window.STEM;

  const STATES = ["draft", "review", "hardware", "pilot", "published"];
  const isPublished = (a) => !!a && (!a.pub || a.pub === "published");
  const version = (a) => String((a && a.version) || "1");
  function readiness(a) {
    if (!a || a.placeholder || (a.launch && a.launch.status === "coming-soon")) return "missing-resource";
    if (a.resourceReview === "needed") return "needs-review";
    return "ready";
  }
  function visibleTo(a, user) {
    if (!a) return false;
    if (isPublished(a)) return true;
    const role = user && user.role;
    if (role === "educator") return true;
    return a.pub === "pilot" && role === "student" && classWork(user.classId, a.id);
  }
  /* Assigned to the class: on its own (older assignments) or in an assigned Learning Plan. */
  const classWork = (classId, id) => !!SE.store && (!!SE.store.assignmentFor(classId, id)
    || SE.store.pathwayAssignmentsFor(classId).some((x) => x.snapshot && (x.snapshot.steps || []).some((st) => st.activityId === id)));
  const assignable = (a) => !!a && !a.placeholder && (isPublished(a) || a.pub === "pilot");
  /* Drafts in an area (educators only see these, on the area page). */
  const draftsIn = (areaId) => (STEM.drafts || []).filter((a) => a.area === areaId);

  SE.content = { STATES, isPublished, version, readiness, visibleTo, assignable, draftsIn };
})();
