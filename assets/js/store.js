/*
 * STEM 207 — accounts, sessions, and the activity log.
 *
 * Two modes, same API (the rest of the app only talks to `SE.store`):
 *
 *   LOCAL (default): everything is kept in this browser's localStorage. Good for
 *   trying the app on one device, but not shared and not secure.
 *
 *   CLOUD: when assets/js/config.js has a Supabase URL and key. Educators sign in
 *   with Supabase Auth; students sign in through database functions; data is shared
 *   across devices and protected by row-level security (see supabase/schema.sql).
 *   Reads come from an in-memory copy loaded at sign-in, so every screen stays fast
 *   and synchronous. Writes update that copy right away and are sent to the server
 *   in order in the background, with automatic retries if the connection drops.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const STEM = window.STEM;
  const KEY = "stem-explorers:v2";
  const SESSION_KEY = "stem-explorers:session";
  const CLOUD = !!(SE.cloud && SE.cloud.enabled);

  /* ───────── Persistence ───────── */
  let memoryDb = null;      // used when localStorage is blocked
  let memorySession = null;

  function readDb() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* storage blocked or corrupt */ }
    return memoryDb;
  }
  function writeDb(db) {
    memoryDb = db;
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* keep in memory */ }
  }
  function readSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return memorySession;
  }
  function writeSession(s) {
    memorySession = s;
    try {
      if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      else localStorage.removeItem(SESSION_KEY);
    } catch (e) { /* ignore */ }
  }

  /* ───────── Password hashing (educators) ─────────
   * SHA-256 with a per-account salt. Real deployments should hash on a server. */
  async function hash(password, salt) {
    const text = `${salt}:${password}`;
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    // Fallback for contexts without Web Crypto (prototype only).
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return `fnv-${(h >>> 0).toString(16)}`;
  }

  let db = null;
  const save = () => writeDb(db);

  /* ───────── Class codes and picture codes ───────── */
  const CODE_WORDS = ["MOOSE", "PUFFIN", "LOBSTR", "ACADIA", "BAXTER", "CASCO", "KENNEBC", "PINE", "LOON", "BEACON"];
  function newClassCode() {
    let code;
    do {
      code = `${CODE_WORDS[Math.floor(Math.random() * CODE_WORDS.length)]}${Math.floor(Math.random() * 90 + 10)}`;
    } while (db.classes.some((c) => c.code === code));
    return code;
  }
  function newPictureCode(rand = Math.random) {
    const ids = STEM.progression.pictures.map((p) => p.id);
    const out = [];
    while (out.length < 3) {
      const pick = ids[Math.floor(rand() * ids.length)];
      if (!out.includes(pick)) out.push(pick);
    }
    return out;
  }

  /* ───────── Demo class ─────────
   * A made-up class so the educator dashboard has something to show.
   * Every demo record has isDemo: true and the UI labels it as sample data. */
  const DEMO = {
    email: "demo@stem207.example",
    password: "explore",
    classCode: "MOOSE7",
    studentName: "Ava R.",
    studentCode: ["pine", "lighthouse", "moon"]
  };

  // Sample answers are grouped by area so they fit the mission they're attached to.
  const SAMPLE_REFLECTIONS = {
    coding: [
      "I ran it one step at a time until I found the exact block that went wrong.",
      "A repeat block made my program way shorter and it still did the same thing.",
      "The computer did exactly what I said, not what I meant. I had to be more precise.",
      "My partner spotted a bug I kept missing. Two people checking is better than one."
    ],
    vr: [
      "I noticed the plants were short and spread out, so I think it doesn't rain much there.",
      "Looking for a whole minute without talking helped me see things I would have skipped."
    ],
    ai: [
      "The examples we gave it decided what it learned. Bad examples, bad guesses.",
      "It sounded sure, but it was still wrong. You have to check its answers.",
      "When we added the tricky examples, our rule got a lot better."
    ],
    engineering: [
      "Our first bridge bent in the middle, so we folded the paper and it held way more.",
      "We changed one thing at a time so we knew which change actually helped."
    ],
    science: [
      "My prediction was wrong, but now I know why. That was the best part.",
      "We did three trials because one try could have been a fluke."
    ],
    creative: [
      "Small moves between photos made the animation look smooth.",
      "If one letter in my code was wrong, the whole row of the picture was off."
    ]
  };

  function seedDemo(opts = {}) {
    const sfx = opts.suffix || "";
    const rand = SE.rng("stem-explorers-demo");
    const now = Date.now();
    const educator = {
      id: opts.educatorId || "edu_demo",
      name: "Demo Educator",
      email: DEMO.email,
      salt: "demo-salt",
      hash: null, // filled in by ensureDemoHash()
      isDemo: true,
      createdAt: now - 30 * SE.DAY
    };
    const cls = {
      id: `cls_demo${sfx}`,
      name: "Room 12 (sample class)",
      code: opts.code || DEMO.classCode,
      educatorId: educator.id,
      isDemo: true,
      createdAt: now - 30 * SE.DAY
    };
    const people = [
      ["Ava R.", "4-5", 0.9], ["Mateo L.", "4-5", 0.75], ["Priya S.", "4-5", 0.95], ["Jonah K.", "4-5", 0.45],
      ["Lena M.", "4-5", 0.6], ["Darius T.", "4-5", 0.8], ["Sofia G.", "2-3", 0.55], ["Eli W.", "4-5", 0.15]
    ];
    const students = people.map(([name, band], i) => ({
      id: `stu_demo_${i}${sfx}`,
      classId: cls.id,
      displayName: name,
      gradeBand: band,
      picCode: i === 0 ? DEMO.studentCode.slice() : newPictureCode(rand),
      isDemo: true,
      createdAt: now - 21 * SE.DAY
    }));

    const events = [];
    const ev = (student, type, at, data = {}) => {
      const e = { id: `ev_demo_${events.length}${sfx}`, studentId: student.id, classId: cls.id, type, at, data, isDemo: true };
      events.push(e);
      return e;
    };

    // A believable order of missions for a grade 4–5 class.
    const plan = [
      "fix-the-recipe", "robot-maze-mission", "how-ai-sorts", "sink-or-float", "event-party", "paper-bridge",
      "loop-dance", "pixel-art-code", "ecosystem-field-trip", "debug-animation", "pattern-predictors",
      "ai-for-oceans", "melting-race", "interactive-story", "marble-run-iteration", "animate-your-name"
    ];

    students.forEach((s, i) => {
      const engagement = people[i][2];
      const count = Math.max(1, Math.round(engagement * 11 + rand() * 2));
      // Eli's last activity was over a week ago, so the dashboard can show a check-in flag.
      const lastDay = i === 7 ? 9 : Math.floor(rand() * 2);
      const firstDay = 18;
      let completedStages = 0;

      for (let k = 0; k < count && k < plan.length; k++) {
        const act = SE.activityById[plan[k]];
        if (!act) continue;
        const dayOffset = firstDay - Math.round(((firstDay - lastDay) * k) / Math.max(1, count - 1));
        const t = SE.startOfDay(now - dayOffset * SE.DAY) + (9 + Math.floor(rand() * 5)) * 3600000 + Math.floor(rand() * 50) * 60000;
        if (t > now) continue;
        ev(s, "signed_in", t - 120000);
        ev(s, "mission_opened", t, { activityId: act.id });
        if (act.launch.status === "ready") ev(s, "launched", t + 300000, { activityId: act.id });
        const answered = rand() < 0.35 + engagement * 0.6;
        const conf = rand() < 0.2 ? "figuring" : rand() < 0.75 ? "got-it" : "teach";
        const done = ev(s, "mission_completed", t + act.duration * 60000, {
          activityId: act.id,
          reflection: answered ? (() => { const pool = SAMPLE_REFLECTIONS[act.area]; return pool[Math.floor(rand() * pool.length)]; })() : "",
          extension: rand() < engagement * 0.45,
          confidence: conf,
          stepsDone: act.steps.length,
          stepsTotal: act.steps.length
        });
        // Older reflections have been reviewed; the last few are waiting.
        if (answered && (dayOffset > 2 ? rand() < 0.95 : rand() < 0.4)) {
          events.push({
            id: `ev_demo_${events.length}${sfx}`, studentId: s.id, classId: cls.id, type: "reflection_reviewed",
            at: done.at + SE.DAY, data: { completionId: done.id, note: rand() < 0.4 ? "Great evidence in this answer." : "" },
            by: educator.id, isDemo: true
          });
        }
        // The teacher has passed most older work (XP comes only from a pass); the last few days are waiting.
        if (dayOffset > 3 && rand() < 0.8) {
          events.push({
            id: `ev_demo_${events.length}${sfx}`, studentId: s.id, classId: cls.id, type: "teacher_confirmed",
            at: done.at + SE.DAY + 3600000, data: { activityId: act.id, how: ["oral", "demo", "work"][Math.floor(rand() * 3)], note: "" },
            by: educator.id, isDemo: true
          });
        }
        // Pathway: claim the stage after a coding mission.
        if (act.pathwayStage && act.pathwayStage > completedStages) {
          const stage = act.pathwayStage;
          ev(s, "ican_claimed", done.at + 60000, { stage });
          if (dayOffset > 2 || rand() < 0.5) {
            events.push({
              id: `ev_demo_${events.length}${sfx}`, studentId: s.id, classId: cls.id, type: "ican_verified",
              at: done.at + SE.DAY, data: { stage }, by: educator.id, isDemo: true
            });
            completedStages = stage;
          }
        }
      }
    });

    /* Interactive lab progress for the sample class */
    const LAB_PLAN = [["rover", 36], ["field-station", 7], ["pattern-machine", 6], ["launcher", 6], ["line-follower", 4], ["ramp-racers", 5], ["pixel-studio", 6]];
    const rle = (grid) => grid.map((row) => { const out = []; let i = 0; while (i < row.length) { let j = i; while (j < row.length && row[j] === row[i]) j++; out.push(`${j - i}${row[i]}`); i = j; } return out.join(" "); }).join("/");
    const canvas = (n) => Array.from({ length: n }, () => Array(n).fill("."));
    const disc = (g, cx, cy, r, c) => g.forEach((row, y) => row.forEach((_, x) => { if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) g[y][x] = c; }));
    const SAMPLE_ART = {
      3: () => { const a = canvas(12), b = canvas(12); [a, b].forEach((g) => disc(g, 5.5, 5.5, 4.6, "Y")); a[4][4] = a[4][7] = "K"; b[4][4] = b[4][7] = "Y"; b[5][3] = b[5][4] = b[5][7] = b[5][8] = "K"; [a, b].forEach((g) => { g[8][4] = g[8][5] = g[8][6] = g[8][7] = "R"; }); return { n: 12, fps: 3, frames: [a, a, a, b].map(rle) }; },
      4: () => ({ n: 12, fps: 6, frames: [1, 3, 5, 7, 9].map((x) => { const g = canvas(12); disc(g, x, 6, 1.5, "B"); for (let k = 0; k < 12; k++) g[9][k] = "G"; return rle(g); }) }),
      5: () => ({ n: 16, fps: 8, frames: [3, 6, 9, 11, 9, 6].map((y) => { const g = canvas(16); disc(g, 7.5, y, 2.2, "O"); for (let k = 0; k < 16; k++) g[14][k] = "K"; return rle(g); }) })
    };
    students.forEach((s, i) => {
      const engagement = people[i][2];
      LAB_PLAN.forEach(([labId, total], li) => {
        if (rand() > engagement + 0.15) return;
        const levels = Math.min(total, Math.max(1, Math.round(total * engagement * (0.45 + rand() * 0.7))));
        for (let lv = 0; lv < levels; lv++) {
          const dayOffset = i === 7 ? 9 + Math.floor(rand() * 6) : Math.max(0, 15 - Math.round((lv / Math.max(1, total)) * 14) - Math.floor(rand() * 3) + (li % 3));
          const t = SE.startOfDay(now - dayOffset * SE.DAY) + (10 + Math.floor(rand() * 4)) * 3600000 + Math.floor(rand() * 50) * 60000;
          if (t > now) continue;
          ev(s, "lab_opened", t, { labId, level: lv });
          const runs = 1 + Math.floor(rand() * 4);
          for (let r = 0; r < runs; r++) ev(s, "lab_test_run", t + (r + 1) * 60000, { labId, level: lv });
          if (rand() < 0.3) ev(s, "lab_hint", t + 30000, { labId, level: lv });
          const result = labId === "pixel-studio" && SAMPLE_ART[lv] ? SAMPLE_ART[lv]() : {};
          ev(s, "lab_level_completed", t + (runs + 2) * 60000, { labId, level: lv, result });
        }
      });
    });

    // Sample explorers (all but the first, who designs their own), using free gear only.
    const hairs = ["short", "curly", "long", "bun", "braids", "buzz", "puffs"], hats = ["none", "beanie", "cap"], jackets = ["indigo", "red", "spruce", "harbor"];
    students.slice(1).forEach((s, i) => ev(s, "profile_custom", now - (15 - i) * SE.DAY, {
      look: { skin: (i * 2 + 1) % 6, hair: hairs[(i * 3) % 7], hairColor: (i * 5) % 8, hat: hats[i % 3], jacket: jackets[(i + 1) % 4], gear: i % 4 === 2 ? "glasses" : "none", back: ["sky", "fog", "sunset", "pine"][i % 4] },
      boat: { hull: i % 6, stripe: (i + 2) % 8, a: i % 12, b: (i * 5) % 12, buoy: [i % 8, (i + 3) % 8, (i + 5) % 8] }
    }));

    events.sort((a, b) => a.at - b.at);

    // Missions the sample teacher has assigned to the class, a couple with due dates.
    const ASSIGNED = [["robot-maze-mission", -4], ["how-ai-sorts", -1], ["lobster-trap-logic", 2], ["lab-rover", 6], ["tide-watchers", 9], ["lab-field-station", null]];
    const assignments = ASSIGNED.filter(([id]) => SE.activityById[id]).map(([activityId, dueIn], i) => ({
      id: `asg_demo_${i}${sfx}`, classId: cls.id, activityId, isDemo: true,
      assignedAt: now - (12 - i * 2) * SE.DAY,
      dueDate: dueIn == null ? null : new Date(SE.startOfDay(now + dueIn * SE.DAY)).toISOString().slice(0, 10),
      note: activityId === "lobster-trap-logic" ? "Work with your table group. Bring your flowchart to Thursday's class." : null
    }));
    const messages = [
      { id: `msg_demo_1${sfx}`, classId: cls.id, isDemo: true, createdAt: now - 3 * SE.DAY, body: "Welcome to STEM 207! Start with your assigned missions. When you finish, explore anything you like." },
      { id: `msg_demo_2${sfx}`, classId: cls.id, isDemo: true, createdAt: now - 6 * 3600000, body: "This week we're working on loops and if–else. Tomorrow we'll share our lobster trap flowcharts." }
    ];
    // One sample partner team (Moxie partners share capstone work).
    const teams = [{ id: `team_demo_1${sfx}`, classId: cls.id, studentIds: [students[0].id, students[1].id], isDemo: true, createdAt: now - 7 * SE.DAY }];
    return { educator, cls, students, events, assignments, messages, teams };
  }

  async function ensureDemoHash() {
    const edu = db.educators.find((e) => e.id === "edu_demo");
    if (edu && !edu.hash) {
      edu.hash = await hash(DEMO.password, edu.salt);
      save();
    }
  }

  function installDemo() {
    const d = seedDemo();
    db.educators = db.educators.filter((e) => !e.isDemo).concat(d.educator);
    db.classes = db.classes.filter((c) => !c.isDemo).concat(d.cls);
    db.students = db.students.filter((s) => !s.isDemo).concat(d.students);
    db.events = db.events.filter((e) => !e.isDemo).concat(d.events).sort((a, b) => a.at - b.at);
    db.assignments = (db.assignments || []).filter((x) => !x.isDemo).concat(d.assignments);
    db.messages = (db.messages || []).filter((x) => !x.isDemo).concat(d.messages);
    db.teams = (db.teams || []).filter((x) => !x.isDemo).concat(d.teams);
  }

  function init() {
    db = readDb();
    if (!db || db.version !== 7) {
      db = { version: 7, educators: [], classes: [], students: [], events: [], assignments: [], messages: [] };
      installDemo();
      save();
    }
    if (!db.assignments) { // added after version 7: give existing browsers the sample assignments
      db.assignments = [];
      const d = seedDemo();
      if (db.classes.some((c) => c.id === d.cls.id)) db.assignments = d.assignments;
      save();
    }
    if (!db.messages) { // added in Batch 9: give existing browsers the sample class messages and instructions
      const d = seedDemo();
      db.messages = db.classes.some((c) => c.id === d.cls.id) ? d.messages : [];
      d.assignments.forEach((x) => { const a = db.assignments.find((y) => y.id === x.id); if (a && x.note && a.note === undefined) a.note = x.note; });
      save();
    }
    if (!db.teams) { // added with Moxie: partner teams, and the sample class's team
      const d = seedDemo();
      db.teams = db.classes.some((c) => c.id === d.cls.id) ? d.teams : [];
      save();
    }
    if (!db.pathways) { // added with educator pathways
      Object.assign(db, { pathways: [], pathwayVersions: [], pathwayAssignments: [] });
      save();
    }
    return ensureDemoHash();
  }


  /* ═════════════════════════ Cloud mode (Supabase) ═════════════════════════ */
  const ms = (t) => (t ? new Date(t).getTime() : Date.now());
  const iso = (n) => new Date(n || Date.now()).toISOString();
  const fromRow = {
    educator: (r) => ({ id: r.id, name: r.name, email: r.email, createdAt: ms(r.created_at) }),
    cls: (r) => ({ id: r.id, name: r.name, code: r.code, educatorId: r.educator_id, isDemo: r.is_demo, createdAt: ms(r.created_at), archivedAt: r.archived_at ? ms(r.archived_at) : null }),
    student: (r) => ({ id: r.id, classId: r.class_id, displayName: r.display_name, gradeBand: r.grade_band, picCode: r.pic_code, isDemo: r.is_demo, createdAt: ms(r.created_at) }),
    event: (r) => ({ id: r.id, studentId: r.student_id, classId: r.class_id, type: r.type, at: Number(r.at), data: r.data || {}, by: r.by || undefined, isDemo: r.is_demo }),
    assignment: (r) => ({ id: r.id, classId: r.class_id, activityId: r.activity_id, assignedAt: ms(r.assigned_at), dueDate: r.due_date || null, note: r.note || null, isDemo: r.is_demo }),
    message: (r) => ({ id: r.id, classId: r.class_id, body: r.body, createdAt: ms(r.created_at), isDemo: r.is_demo }),
    team: (r) => ({ id: r.id, classId: r.class_id, studentIds: r.student_ids || [], createdAt: ms(r.created_at), isDemo: r.is_demo }),
    pathway: (r) => ({ id: r.id, educatorId: r.educator_id, title: r.title, essentialQuestion: r.essential_question || "", goal: r.goal || "", finalProduct: r.final_product || "",
      audience: r.audience || {}, status: r.status, version: r.version, steps: r.steps || [], basedOn: r.based_on || null, isDemo: r.is_demo, createdAt: ms(r.created_at), updatedAt: ms(r.updated_at) }),
    pathwayVersion: (r) => ({ pathwayId: r.pathway_id, version: r.version, snapshot: r.snapshot, publishedAt: ms(r.published_at) }),
    pathwayAssignment: (r) => ({ id: r.id, classId: r.class_id, pathwayId: r.pathway_id, version: r.version, assignedAt: ms(r.assigned_at), dueDate: r.due_date || null, note: r.note || null, isDemo: r.is_demo })
  };
  const toRow = {
    cls: (c) => ({ id: c.id, educator_id: c.educatorId, name: c.name, code: c.code, is_demo: !!c.isDemo, created_at: iso(c.createdAt) }),
    student: (s) => ({ id: s.id, class_id: s.classId, display_name: s.displayName, grade_band: s.gradeBand, pic_code: s.picCode, is_demo: !!s.isDemo, created_at: iso(s.createdAt) }),
    event: (e) => ({ id: e.id, student_id: e.studentId, class_id: e.classId, type: e.type, at: e.at, data: e.data || {}, by: e.by || null, is_demo: !!e.isDemo }),
    // note is sent only when set, so assigning still works before supabase/update-3 is run.
    assignment: (a) => ({ id: a.id, class_id: a.classId, activity_id: a.activityId, assigned_at: iso(a.assignedAt), due_date: a.dueDate || null, is_demo: !!a.isDemo, ...(a.note ? { note: a.note } : {}) }),
    message: (m) => ({ id: m.id, class_id: m.classId, body: m.body, created_at: iso(m.createdAt), is_demo: !!m.isDemo }),
    team: (t) => ({ id: t.id, class_id: t.classId, student_ids: t.studentIds, created_at: iso(t.createdAt), is_demo: !!t.isDemo }),
    pathway: (p) => ({ id: p.id, educator_id: p.educatorId, title: p.title, essential_question: p.essentialQuestion || null, goal: p.goal || null, final_product: p.finalProduct || null,
      audience: p.audience || {}, status: p.status, version: p.version, steps: p.steps, based_on: p.basedOn || null, is_demo: !!p.isDemo, created_at: iso(p.createdAt), updated_at: iso(p.updatedAt) }),
    pathwayVersion: (v) => ({ pathway_id: v.pathwayId, version: v.version, snapshot: v.snapshot, published_at: iso(v.publishedAt) }),
    pathwayAssignment: (a) => ({ id: a.id, class_id: a.classId, pathway_id: a.pathwayId, version: a.version, assigned_at: iso(a.assignedAt), due_date: a.dueDate || null, note: a.note || null, is_demo: !!a.isDemo })
  };
  const emptyDb = () => ({ version: 7, educators: [], classes: [], students: [], events: [], assignments: [], messages: [], teams: [], pathways: [], pathwayVersions: [], pathwayAssignments: [] });
  const cloudCode = () => `${CODE_WORDS[Math.floor(Math.random() * CODE_WORDS.length)]}${Math.floor(Math.random() * 900 + 100)}`;

  async function loadEducator(user) {
    journey = null;
    // Educator pathways arrive with supabase/update-6-pathways.sql; until then there are none.
    const missing6 = (e) => { if (e.offline) throw e; console.warn("STEM 207: pathway tables missing (run supabase/update-6-pathways.sql)", e); return []; };
    const [eds, classes, students, events, assignments, messages, teams, pathways, pathwayVersions, pathwayAssignments] = await Promise.all([
      SE.cloud.selectAll("educators", `id=eq.${user.id}`),
      SE.cloud.selectAll("classes", "order=created_at.asc"),
      SE.cloud.selectAll("students", "order=created_at.asc"),
      SE.cloud.selectAll("events", "order=at.asc"),
      // Older databases may not have the assignments table yet (run supabase/schema.sql again to add it).
      SE.cloud.selectAll("assignments", "order=assigned_at.asc").catch((e) => { if (e.offline) throw e; console.warn("STEM 207: assignments table missing", e); return []; }),
      // Class messages arrive with supabase/update-3-class-messages.sql; until then there are none.
      SE.cloud.selectAll("class_messages", "order=created_at.asc").catch((e) => { if (e.offline) throw e; console.warn("STEM 207: class_messages table missing (run supabase/update-3-class-messages.sql)", e); return []; }),
      // Partner teams arrive with supabase/update-5-moxie-teams.sql; until then there are none.
      SE.cloud.selectAll("class_teams", "order=created_at.asc").catch((e) => { if (e.offline) throw e; console.warn("STEM 207: class_teams table missing (run supabase/update-5-moxie-teams.sql)", e); return []; }),
      SE.cloud.selectAll("pathways", "order=created_at.asc").catch(missing6),
      SE.cloud.selectAll("pathway_versions", "order=published_at.asc").catch(missing6),
      SE.cloud.selectAll("pathway_assignments", "order=assigned_at.asc").catch(missing6)
    ]);
    if (!eds.length) {
      // The sign-up trigger normally creates this row; make it here if it's missing.
      const row = { id: user.id, name: user.name || user.email.split("@")[0], email: user.email };
      await SE.cloud.rest("POST", "/educators", row, "resolution=ignore-duplicates");
      eds.push(row);
    }
    db = { version: 7, educators: eds.map(fromRow.educator), classes: classes.map(fromRow.cls), students: students.map(fromRow.student), events: events.map(fromRow.event), assignments: assignments.map(fromRow.assignment), messages: messages.map(fromRow.message), teams: teams.map(fromRow.team),
      pathways: pathways.map(fromRow.pathway), pathwayVersions: pathwayVersions.map(fromRow.pathwayVersion), pathwayAssignments: pathwayAssignments.map(fromRow.pathwayAssignment) };
  }
  /* A student's partner team and their teammates' shared work, on a student's device in cloud mode
     (supabase/update-5-moxie-teams.sql). Null until loaded, or if the function isn't there yet. */
  let teamCache = null;
  async function loadTeam(token, studentId) {
    try {
      const r = await SE.cloud.rpc("team_events", { p_token: token });
      teamCache = r && r.ok ? { studentId, team: r.team || null, events: (r.events || []).map((e) => ({ ...e, at: Number(e.at), data: e.data || {} })),
        cards: (r.cards || []).map((e) => ({ ...e, at: Number(e.at), data: e.data || {} })), classTeams: r.classTeams || [] } : null;
    } catch (e) { teamCache = null; if (!e.offline) console.warn("STEM 207: partner work unavailable (run supabase/update-5-moxie-teams.sql)", e); }
  }
  /* Class journey totals for a student's device in cloud mode (supabase/update-4-class-journey.sql).
     Counts only; null until loaded, or if the function isn't there yet (then the app counts what it has). */
  let journey = null;
  async function loadJourney(token, classId) {
    try { const r = await SE.cloud.rpc("class_journey", { p_token: token }); if (r && r.ok) { const { ok, ...counts } = r; journey = { classId, counts }; } else journey = null; }
    catch (e) { journey = null; if (!e.offline) console.warn("STEM 207: class journey totals unavailable (run supabase/update-4-class-journey.sql)", e); }
  }

  function loadStudentState(state) {
    db = emptyDb();
    db.classes.push({ ...state.class, educatorId: null });
    db.students.push({ ...state.student, picCode: [] });
    db.events = (state.events || []).map((e) => ({ ...e, at: Number(e.at), data: e.data || {} }));
    db.assignments = (state.assignments || []).map((a) => ({ ...a, classId: state.class.id, assignedAt: Number(a.assignedAt) || Date.now(), note: a.note || null }));
    db.messages = (state.messages || []).map((m) => ({ ...m, classId: state.class.id, createdAt: Number(m.createdAt) || Date.now() }));
    // Assigned pathways come with their pinned snapshot (update-6); none before that update is run.
    db.pathwayAssignments = (state.pathways || []).map((p) => ({ ...p, classId: state.class.id, assignedAt: Number(p.assignedAt) || Date.now(), dueDate: p.dueDate || null, note: p.note || null }));
  }

  /* Outbox: writes go to the server one at a time, in order, retrying when offline. */
  const outbox = [];
  let flushing = null, failures = 0, warnedOffline = false;
  const sleep = (t) => new Promise((r) => setTimeout(r, t));
  function send(op) { outbox.push(op); return flush(); }
  function flush() {
    if (!flushing) flushing = (async () => {
      while (outbox.length) {
        const op = outbox[0];
        try {
          await op.run();
          outbox.shift();
          failures = 0;
          if (warnedOffline) { warnedOffline = false; SE.toast && SE.toast("Back online. Your work is saved."); }
        } catch (e) {
          if (e.offline || e.status >= 500 || e.status === 429) {
            failures++;
            if (!warnedOffline && failures >= 2) { warnedOffline = true; SE.toast && SE.toast("Can't reach the server. Your work will save when you're back online."); }
            await sleep(Math.min(30000, 1000 * 2 ** Math.min(failures, 5)));
            continue;
          }
          outbox.shift();
          if (op.onError && (await op.onError(e))) continue;
          console.warn("STEM 207: a change couldn't be saved", e);
          if (e.status === 401) { SE.toast && SE.toast("Your sign-in expired. Please sign in again."); outbox.length = 0; }
          else SE.toast && SE.toast("One change couldn't be saved. Refresh the page to see the latest.");
        }
      }
    })().finally(() => { flushing = null; });
    return flushing;
  }
  window.addEventListener("beforeunload", (e) => { if (outbox.length) { e.preventDefault(); e.returnValue = ""; } });

  const restOp = (method, path, body, prefer, onError) => ({ run: () => SE.cloud.rest(method, path, body, prefer), onError });
  const insertClassOp = (cls, tries = 0) => restOp("POST", "/classes", toRow.cls(cls), "return=minimal", async (e) => {
    if ((e.status !== 409 && e.code !== "23505") || tries >= 8) {
      db.classes = db.classes.filter((c) => c.id !== cls.id); // never reached the server; take it back out
      SE.toast && SE.toast(`Couldn't create ${cls.name}. Try again.`);
      return true;
    }
    cls.code = cloudCode(); // class code already taken by another teacher: pick a new one and retry
    outbox.unshift(insertClassOp(cls, tries + 1));
    SE.toast && SE.toast(`Class code changed to ${cls.code}`);
    return true;
  });

  async function initCloud() {
    db = emptyDb();
    const s = readSession();
    if (!s || !s.cloud) { if (s && s.role !== "guest") writeSession(null); return; }
    try {
      if (s.role === "educator") {
        const a = SE.cloud.auth();
        if (!a) { writeSession(null); return; }
        await loadEducator(a.user);
      } else if (s.role === "student") {
        const st = await SE.cloud.rpc("student_state", { p_token: s.token });
        if (!st || !st.ok) { writeSession(null); return; }
        loadStudentState(st);
        await Promise.all([loadJourney(s.token, st.class.id), loadTeam(s.token, st.student.id)]);
      }
    } catch (e) {
      if (e.status === 401 || e.status === 400) { writeSession(null); SE.cloud.forgetAuth(); }
      else { SE.store.loadError = e; console.warn("STEM 207: couldn't load your data", e); }
    }
  }

  async function installDemoCloud(educatorId) {
    const own = db.classes.filter((c) => c.isDemo && c.educatorId === educatorId);
    for (const c of own) await SE.cloud.rest("DELETE", `/classes?id=eq.${encodeURIComponent(c.id)}`);
    const d = seedDemo({ suffix: `_${SE.uid("d").slice(-8)}`, educatorId, code: cloudCode() });
    for (let tries = 0; ; tries++) {
      try { await SE.cloud.rest("POST", "/classes", toRow.cls(d.cls), "return=minimal"); break; }
      catch (e) { if ((e.status === 409 || e.code === "23505") && tries < 5) d.cls.code = cloudCode(); else throw e; }
    }
    await SE.cloud.rest("POST", "/students", d.students.map(toRow.student), "return=minimal");
    for (let i = 0; i < d.events.length; i += 500) await SE.cloud.rest("POST", "/events", d.events.slice(i, i + 500).map(toRow.event), "return=minimal");
    if (d.assignments.length) await SE.cloud.rest("POST", "/assignments", d.assignments.map(toRow.assignment), "return=minimal")
      .catch(() => SE.cloud.rest("POST", "/assignments", d.assignments.map((a) => toRow.assignment({ ...a, note: null })), "return=minimal")) // before update-3
      .catch((e) => console.warn("STEM 207: couldn't add sample assignments", e));
    if (d.messages.length) await SE.cloud.rest("POST", "/class_messages", d.messages.map(toRow.message), "return=minimal").catch((e) => console.warn("STEM 207: couldn't add sample messages (run supabase/update-3-class-messages.sql)", e));
    if (d.teams.length) await SE.cloud.rest("POST", "/class_teams", d.teams.map(toRow.team), "return=minimal").catch((e) => console.warn("STEM 207: couldn't add the sample team (run supabase/update-5-moxie-teams.sql)", e));
    const a = SE.cloud.auth();
    await loadEducator(a.user);
    return d.cls;
  }

  const authError = (e) => {
    const m = `${e.code || ""} ${e.message || ""}`.toLowerCase();
    if (e.offline) return { field: "email", error: "Can't reach the server. Check your internet connection and try again." };
    if (m.includes("not_confirmed") || m.includes("not confirmed")) return { field: "email", error: "Confirm your email first: open the link Supabase sent you, then sign in." };
    if (m.includes("invalid") && (m.includes("credential") || m.includes("grant") || m.includes("login"))) return { field: "password", error: "That email and password don't match. Check for typos and try again." };
    if (m.includes("already") || m.includes("exists")) return { field: "email", error: "An account with this email already exists. Sign in instead." };
    if (m.includes("password")) return { field: "password", error: e.message };
    return { field: "email", error: e.message || "Something went wrong. Try again." };
  };

  /* Drafts and placeholders can't be assigned; pilot and published records can (assets/js/content.js). */
  const assignable = (a) => SE.content.assignable(a);

  /* Work that Moxie partners share (one copy, read by both). Keep this list the same as
     team_events in supabase/update-7-pathway-teams.sql. Reflections and explanations stay individual. */
  const TEAM_TYPES = ["moxie_design", "moxie_codecheck", "moxie_buglog", "moxie_test", "moxie_feedback_got", "moxie_improve", "moxie_card",
    "moxie_kit", "moxie_standup", "moxie_subsystem", "moxie_change", "moxie_pitch", "pathway_artifact"];

  /* Pathways: a published version is a snapshot that pins each mission step to the mission's current version. */
  const clip = (v, n) => String(v == null ? "" : v).trim().slice(0, n);
  const snapshotOf = (p) => ({
    title: p.title, essentialQuestion: p.essentialQuestion, goal: p.goal, finalProduct: p.finalProduct, audience: p.audience,
    steps: p.steps.map((s) => (s.kind === "mission" ? { ...s, missionVersion: SE.content.version(SE.activityById[s.activityId]) } : { ...s }))
  });
  const needs6 = (undo) => async () => { undo(); SE.toast && SE.toast("Couldn't save the pathway. Ask your admin to run supabase/update-6-pathways.sql."); return true; };

  /* ───────── Public API ───────── */
  SE.store = {
    TEAM_TYPES,
    assignable,
    DEMO,
    mode: CLOUD ? "cloud" : "local",
    ready: null,
    loadError: null,
    pendingWrites: () => outbox.length,
    journeyCounts: (classId) => (journey && journey.classId === classId ? journey.counts : null),
    flush: () => flush(),

    /* Session */
    session: () => readSession(),
    async signOut() {
      const s = readSession();
      if (CLOUD) {
        await Promise.race([flush(), sleep(4000)]);
        if (s && s.role === "student" && s.token) SE.cloud.rpc("student_sign_out", { p_token: s.token }).catch(() => {});
        if (s && s.role === "educator") await SE.cloud.signOut();
        db = emptyDb();
        journey = null;
        teamCache = null;
      }
      writeSession(null);
    },
    startGuest() { writeSession({ role: "guest" }); },
    currentUser() {
      const s = readSession();
      if (!s) return null;
      if (s.role === "guest") return { role: "guest" };
      if (s.role === "student") {
        const st = db.students.find((x) => x.id === s.id);
        return st ? { role: "student", ...st, cls: db.classes.find((c) => c.id === st.classId) } : null;
      }
      if (s.role === "educator") {
        const ed = db.educators.find((x) => x.id === s.id);
        return ed ? { role: "educator", ...ed } : null;
      }
      return null;
    },

    /* Educators */
    async createEducator({ name, email, password, className }) {
      email = String(email || "").trim().toLowerCase();
      name = String(name || "").trim();
      if (!name) return { ok: false, field: "name", error: "Enter your name as students will see it, like Ms. Lopez." };
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, field: "email", error: "Enter a full email address, like name@school.org." };
      if (String(password || "").length < 8) return { ok: false, field: "password", error: "Use at least 8 characters for your password." };
      if (CLOUD) {
        try {
          const r = await SE.cloud.signUp(email, password, name);
          if (r.needsConfirm) return { ok: false, field: "email", error: "Almost done: check your email for a link to confirm your account, then sign in." };
          await loadEducator(r.session.user);
          const cls = { id: SE.uid("cls"), name: String(className || "").trim() || `${name}'s class`, code: cloudCode(), educatorId: r.session.user.id, createdAt: Date.now() };
          db.classes.push(cls);
          writeSession({ role: "educator", id: r.session.user.id, cloud: true });
          await send(insertClassOp(cls));
          return { ok: true, educator: db.educators[0], cls };
        } catch (e) { return { ok: false, ...authError(e) }; }
      }
      if (db.educators.some((e) => e.email === email)) return { ok: false, field: "email", error: "An account with this email already exists. Sign in instead." };
      const salt = SE.uid("salt");
      const educator = { id: SE.uid("edu"), name, email, salt, hash: await hash(password, salt), createdAt: Date.now() };
      db.educators.push(educator);
      const cls = { id: SE.uid("cls"), name: String(className || "").trim() || `${name}'s class`, code: newClassCode(), educatorId: educator.id, createdAt: Date.now() };
      db.classes.push(cls);
      save();
      writeSession({ role: "educator", id: educator.id });
      return { ok: true, educator, cls };
    },

    async signInEducator(email, password) {
      email = String(email || "").trim().toLowerCase();
      if (CLOUD) {
        if (!email) return { ok: false, field: "email", error: "Enter the email you signed up with." };
        try {
          const a = await SE.cloud.signIn(email, password);
          await loadEducator(a.user);
          writeSession({ role: "educator", id: a.user.id, cloud: true });
          return { ok: true, educator: db.educators[0] };
        } catch (e) { return { ok: false, ...authError(e) }; }
      }
      const edu = db.educators.find((e) => e.email === email);
      if (!edu) return { ok: false, field: "email", error: "We couldn't find an educator account with that email." };
      if ((await hash(password, edu.salt)) !== edu.hash) return { ok: false, field: "password", error: "That password doesn't match. Check for typos and try again." };
      writeSession({ role: "educator", id: edu.id });
      return { ok: true, educator: edu };
    },

    /* Classes */
    /* An educator's active classes (archived ones are hidden everywhere except the Classes page). */
    classesFor: (educatorId) => db.classes.filter((c) => c.educatorId === educatorId && !c.archivedAt),
    archivedClassesFor: (educatorId) => db.classes.filter((c) => c.educatorId === educatorId && c.archivedAt),
    classById: (id) => db.classes.find((c) => c.id === id),
    classByCode: (code) => db.classes.find((c) => !c.archivedAt && c.code === String(code || "").trim().toUpperCase().replace(/\s+/g, "")),
    /* Student sign-in step 1: the class and its roster (names only), or null. */
    async findClass(code) {
      if (CLOUD) {
        const r = await SE.cloud.rpc("class_roster", { p_code: String(code || "") });
        return r ? { id: r.id, name: r.name, code: r.code, students: r.students || [] } : null;
      }
      const cls = SE.store.classByCode(code);
      return cls ? { ...cls, students: SE.store.studentsIn(cls.id).map(({ id, displayName, gradeBand }) => ({ id, displayName, gradeBand })) } : null;
    },
    renameClass(id, name) {
      const c = SE.store.classById(id);
      name = String(name || "").trim().slice(0, 80);
      if (!c || !name) return false;
      c.name = name;
      if (CLOUD) send(restOp("PATCH", `/classes?id=eq.${encodeURIComponent(id)}`, { name }, "return=minimal")); else save();
      return true;
    },
    /* Archive hides a class (and stops its students signing in) without deleting anything. Needs supabase/update-9-classes.sql. */
    archiveClass(id, on = true) {
      const c = SE.store.classById(id);
      if (!c) return;
      const prev = c.archivedAt;
      c.archivedAt = on ? Date.now() : null;
      if (CLOUD) send(restOp("PATCH", `/classes?id=eq.${encodeURIComponent(id)}`, { archived_at: on ? iso(c.archivedAt) : null }, "return=minimal", async () => {
        c.archivedAt = prev;
        SE.toast && SE.toast("Couldn't archive the class. Ask your admin to run supabase/update-9-classes.sql.");
        return true;
      }));
      else save();
    },
    /* Delete removes the class with its students, their work, assignments, and messages. */
    deleteClass(id) {
      const c = SE.store.classById(id);
      if (!c) return;
      const ids = new Set(db.students.filter((s) => s.classId === id).map((s) => s.id));
      db.classes = db.classes.filter((x) => x.id !== id);
      db.students = db.students.filter((s) => s.classId !== id);
      db.events = db.events.filter((e) => !ids.has(e.studentId) && e.classId !== id);
      db.assignments = (db.assignments || []).filter((a) => a.classId !== id);
      db.messages = (db.messages || []).filter((m) => m.classId !== id);
      db.teams = (db.teams || []).filter((t) => t.classId !== id);
      db.pathwayAssignments = (db.pathwayAssignments || []).filter((a) => a.classId !== id);
      if (CLOUD) send(restOp("DELETE", `/classes?id=eq.${encodeURIComponent(id)}`, undefined, "return=minimal")); else save();
    },
    createClass(educatorId, name) {
      const cls = { id: SE.uid("cls"), name: String(name || "").trim() || "New class", code: CLOUD ? cloudCode() : newClassCode(), educatorId, createdAt: Date.now() };
      db.classes.push(cls);
      if (CLOUD) send(insertClassOp(cls)); else save();
      return cls;
    },

    /* Assigned missions: what a teacher has picked for a class, in the order assigned. */
    assignmentsFor: (classId) => (db.assignments || []).filter((x) => x.classId === classId).sort((a, b) => a.assignedAt - b.assignedAt),
    assignmentFor: (classId, activityId) => (db.assignments || []).find((x) => x.classId === classId && x.activityId === activityId) || null,
    assign(classId, activityIds, opts = {}) {
      const added = [];
      [].concat(activityIds).forEach((activityId, i) => {
        if (SE.store.assignmentFor(classId, activityId) || !assignable(SE.activityById[activityId])) return;
        const a = { id: SE.uid("asg"), classId, activityId, assignedAt: Date.now() + i, dueDate: opts.dueDate || null };
        db.assignments.push(a);
        added.push(a);
      });
      if (!added.length) return added;
      if (CLOUD) send(restOp("POST", "/assignments", added.map(toRow.assignment), "return=minimal")); else save();
      return added;
    },
    unassign(classId, activityIds) {
      const ids = [].concat(activityIds);
      const gone = db.assignments.filter((x) => x.classId === classId && ids.includes(x.activityId));
      if (!gone.length) return;
      db.assignments = db.assignments.filter((x) => !gone.includes(x));
      if (CLOUD) gone.forEach((g) => send(restOp("DELETE", `/assignments?id=eq.${encodeURIComponent(g.id)}`, undefined, "return=minimal"))); else save();
    },
    setDueDate(classId, activityId, dueDate) {
      const a = SE.store.assignmentFor(classId, activityId);
      if (!a) return;
      a.dueDate = dueDate || null;
      if (CLOUD) send(restOp("PATCH", `/assignments?id=eq.${encodeURIComponent(a.id)}`, { due_date: a.dueDate }, "return=minimal")); else save();
    },

    /* Instructions a teacher adds to one assigned mission (shown on the student's Home). */
    setAssignmentNote(classId, activityId, note) {
      const a = SE.store.assignmentFor(classId, activityId);
      if (!a) return;
      a.note = String(note || "").trim().slice(0, 500) || null;
      if (CLOUD) send(restOp("PATCH", `/assignments?id=eq.${encodeURIComponent(a.id)}`, { note: a.note }, "return=minimal")); else save();
    },

    /* Class messages: short notes from the teacher to the whole class, newest first. */
    messagesFor: (classId) => (db.messages || []).filter((m) => m.classId === classId).sort((a, b) => b.createdAt - a.createdAt),
    postMessage(classId, body) {
      body = String(body || "").trim().slice(0, 500);
      if (!body) return null;
      const m = { id: SE.uid("msg"), classId, body, createdAt: Date.now() };
      db.messages = db.messages || [];
      db.messages.push(m);
      if (CLOUD) send(restOp("POST", "/class_messages", toRow.message(m), "return=minimal", async () => {
        db.messages = db.messages.filter((x) => x.id !== m.id);
        SE.toast && SE.toast("Couldn't send that message. Ask your admin to run supabase/update-3-class-messages.sql.");
        return true;
      }));
      else save();
      return m;
    },
    deleteMessage(id) {
      db.messages = (db.messages || []).filter((m) => m.id !== id);
      if (CLOUD) send(restOp("DELETE", `/class_messages?id=eq.${encodeURIComponent(id)}`, undefined, "return=minimal")); else save();
    },

    /* Students */
    studentsIn: (classId) => db.students.filter((s) => s.classId === classId).sort((a, b) => a.displayName.localeCompare(b.displayName)),
    studentById: (id) => db.students.find((s) => s.id === id),
    addStudent(classId, { displayName, gradeBand }) {
      const name = String(displayName || "").trim().replace(/\s+/g, " ");
      if (!name) return { ok: false, error: "Enter a first name and last initial, like Sam P." };
      if (name.length > 24) return { ok: false, error: "Keep display names short: a first name and last initial." };
      if (db.students.some((s) => s.classId === classId && s.displayName.toLowerCase() === name.toLowerCase()))
        return { ok: false, error: `${name} is already in this class. Add a last initial to tell them apart.` };
      const student = { id: SE.uid("stu"), classId, displayName: name, gradeBand: gradeBand || "4-5", picCode: newPictureCode(), createdAt: Date.now() };
      db.students.push(student);
      if (CLOUD) send(restOp("POST", "/students", toRow.student(student), "return=minimal")); else save();
      return { ok: true, student };
    },
    updateStudent(id, patch) {
      const s = db.students.find((x) => x.id === id);
      if (!s) return;
      Object.assign(s, patch);
      if (CLOUD) {
        const row = {};
        if (patch.gradeBand) row.grade_band = patch.gradeBand;
        if (patch.displayName) row.display_name = patch.displayName;
        if (patch.picCode) row.pic_code = patch.picCode;
        send(restOp("PATCH", `/students?id=eq.${encodeURIComponent(id)}`, row, "return=minimal"));
      } else save();
    },
    newPictureCodeFor(id) {
      const s = db.students.find((x) => x.id === id);
      if (!s) return;
      SE.store.updateStudent(id, { picCode: newPictureCode() });
      return s.picCode;
    },
    removeStudent(id) {
      const team = (db.teams || []).find((t) => t.studentIds.includes(id));
      if (team) SE.store.saveTeam(team.classId, team.studentIds.filter((x) => x !== id)).ok || SE.store.deleteTeam(team.id);
      db.students = db.students.filter((s) => s.id !== id);
      db.events = db.events.filter((e) => e.studentId !== id);
      if (CLOUD) send(restOp("DELETE", `/students?id=eq.${encodeURIComponent(id)}`, undefined, "return=minimal")); else save();
    },
    async signInStudent(studentId, code) {
      if (CLOUD) {
        let r;
        try { r = await SE.cloud.rpc("student_sign_in", { p_student_id: studentId, p_code: code }); }
        catch (e) { return { ok: false, error: e.offline ? "Can't reach the server. Check the internet connection and try again." : "Something went wrong. Try again." }; }
        if (!r || !r.ok) {
          const msg = { locked: "Too many tries. Wait 10 minutes, or ask your teacher for your login card.", missing: "We couldn't find that explorer." }[r && r.error];
          return { ok: false, error: msg || "Those pictures don't match. Try again, or ask your teacher for your login card." };
        }
        loadStudentState(r);
        await Promise.all([loadJourney(r.token, r.class.id), loadTeam(r.token, r.student.id)]);
        writeSession({ role: "student", id: r.student.id, token: r.token, cloud: true });
        SE.store.log("signed_in");
        return { ok: true, student: db.students[0] };
      }
      const s = db.students.find((x) => x.id === studentId);
      if (!s) return { ok: false, error: "We couldn't find that explorer." };
      if (code.join("|") !== s.picCode.join("|")) return { ok: false, error: "Those pictures don't match. Try again, or ask your teacher for your login card." };
      writeSession({ role: "student", id: s.id });
      SE.store.log("signed_in");
      return { ok: true, student: s };
    },

    /* Activity log */
    log(type, data = {}) {
      const s = readSession();
      if (!s || s.role !== "student") return null;
      const st = db.students.find((x) => x.id === s.id);
      if (!st) return null;
      const e = { id: SE.uid("ev"), studentId: st.id, classId: st.classId, type, at: Date.now(), data };
      db.events.push(e);
      if (CLOUD) {
        send({
          run: async () => {
            const r = await SE.cloud.rpc("student_log", { p_token: s.token, p_event: { id: e.id, type, at: e.at, data } });
            if (r && r.ok === false) { const err = new Error("Your sign-in expired. Please sign in again."); err.status = 401; throw err; }
          }
        });
        // A sent mission can move the class journey: refresh the class totals once it's saved.
        if (type === "mission_completed") flush().then(() => loadJourney(s.token, st.classId)).catch(() => {});
      } else save();
      return e;
    },
    teacherLog(studentId, type, data = {}) {
      const s = readSession();
      const st = db.students.find((x) => x.id === studentId);
      if (!s || s.role !== "educator" || !st) return null;
      const e = { id: SE.uid("ev"), studentId, classId: st.classId, type, at: Date.now(), data, by: s.id };
      db.events.push(e);
      if (CLOUD) send(restOp("POST", "/events", toRow.event(e), "return=minimal")); else save();
      return e;
    },
    eventsFor: (studentId) => db.events.filter((e) => e.studentId === studentId),
    eventsForClass: (classId) => db.events.filter((e) => e.classId === classId),

    /* Partner teams (Moxie). A student is in at most one team per class. */
    teamsFor: (classId) => (db.teams || []).filter((t) => t.classId === classId),
    teamOf(studentId) {
      if (teamCache && teamCache.studentId === studentId) return teamCache.team ? { id: teamCache.team.id, studentIds: teamCache.team.members.map((m) => m.id) } : null;
      return (db.teams || []).find((t) => t.studentIds.includes(studentId)) || null;
    },
    /* Display names of a student's teammates (not the student). */
    teammates(studentId) {
      if (teamCache && teamCache.studentId === studentId) return teamCache.team ? teamCache.team.members.filter((m) => m.id !== studentId) : [];
      const t = SE.store.teamOf(studentId);
      return t ? t.studentIds.filter((id) => id !== studentId).map((id) => ({ id, displayName: (SE.store.studentById(id) || {}).displayName || "Partner" })) : [];
    },
    /* Teammates' shared work (TEAM_TYPES only), oldest first. */
    teamEvents(studentId) {
      if (teamCache && teamCache.studentId === studentId) return teamCache.events.slice();
      const t = SE.store.teamOf(studentId);
      if (!t) return [];
      return db.events.filter((e) => e.studentId !== studentId && t.studentIds.includes(e.studentId) && TEAM_TYPES.includes(e.type));
    },
    /* Moxie feedback cards other students sent to this student's team (supabase/update-12-moxie-feedback.sql). */
    feedbackCards(studentId) {
      if (teamCache && teamCache.studentId === studentId) return (teamCache.cards || []).slice();
      const t = SE.store.teamOf(studentId);
      if (!t) return [];
      return db.events.filter((e) => e.type === "moxie_feedback_card" && e.data.toTeam === t.id && !t.studentIds.includes(e.studentId));
    },
    /* The teams in a student's class (first names only), for choosing who gets a feedback card. */
    classTeams(studentId) {
      if (teamCache && teamCache.studentId === studentId) return (teamCache.classTeams || []).slice();
      const st = db.students.find((x) => x.id === studentId);
      if (!st) return [];
      return SE.store.teamsFor(st.classId).map((t) => ({ id: t.id, members: t.studentIds.map((id) => (db.students.find((x) => x.id === id) || {}).displayName).filter(Boolean).sort() }));
    },
    /* Reload partner work on a student's cloud device; resolves right away elsewhere. */
    async refreshTeam() {
      const s = readSession();
      if (CLOUD && s && s.role === "student") await loadTeam(s.token, s.id);
    },
    saveTeam(classId, studentIds) {
      const ids = [...new Set(studentIds)].filter((id) => db.students.some((s) => s.id === id && s.classId === classId));
      if (ids.length < 2) return { ok: false, error: "Pick at least two different students." };
      // Students leave any team they were in; a team left with one student is removed.
      SE.store.teamsFor(classId).forEach((t) => {
        const rest = t.studentIds.filter((id) => !ids.includes(id));
        if (rest.length === t.studentIds.length) return;
        if (rest.length < 2) return SE.store.deleteTeam(t.id);
        t.studentIds = rest;
        if (CLOUD) send(restOp("PATCH", `/class_teams?id=eq.${encodeURIComponent(t.id)}`, { student_ids: rest }, "return=minimal"));
      });
      const team = { id: SE.uid("team"), classId, studentIds: ids, createdAt: Date.now() };
      db.teams = db.teams || [];
      db.teams.push(team);
      if (CLOUD) send(restOp("POST", "/class_teams", toRow.team(team), "return=minimal", async () => {
        db.teams = db.teams.filter((x) => x.id !== team.id);
        SE.toast && SE.toast("Couldn't save that team. Ask your admin to run supabase/update-5-moxie-teams.sql.");
        return true;
      }));
      else save();
      return { ok: true, team };
    },
    /* Educator pathways. The pathway row is the working copy; publishing adds an immutable version;
       assigning pins a class to one version, so later edits never change an assigned class's work. */
    pathwaysFor: (educatorId) => (db.pathways || []).filter((p) => p.educatorId === educatorId).sort((a, b) => b.updatedAt - a.updatedAt),
    pathwayById: (id) => (db.pathways || []).find((p) => p.id === id) || null,
    pathwayVersionsOf: (id) => (db.pathwayVersions || []).filter((v) => v.pathwayId === id).sort((a, b) => a.version - b.version),
    pathwayVersion: (id, version) => ((db.pathwayVersions || []).find((v) => v.pathwayId === id && v.version === version) || {}).snapshot || null,
    createPathway(fields = {}) {
      const s = readSession();
      if (!s || s.role !== "educator") return null;
      const now = Date.now();
      const p = {
        id: SE.uid("pw"), educatorId: s.id, title: clip(fields.title, 120) || "Untitled Learning Plan",
        essentialQuestion: clip(fields.essentialQuestion, 300), goal: clip(fields.goal, 600), finalProduct: clip(fields.finalProduct, 600),
        audience: Object.assign({ grades: [], minutes: null, equipment: [], prior: "" }, fields.audience || {}),
        status: "draft", version: 0, steps: (fields.steps || []).map((st) => ({ ...st, id: SE.uid("st") })),
        basedOn: fields.basedOn || null, createdAt: now, updatedAt: now
      };
      db.pathways = db.pathways || [];
      db.pathways.push(p);
      if (CLOUD) send(restOp("POST", "/pathways", toRow.pathway(p), "return=minimal", needs6(() => { db.pathways = db.pathways.filter((x) => x.id !== p.id); })));
      else save();
      return p;
    },
    savePathway(id, patch) {
      const p = SE.store.pathwayById(id);
      if (!p) return null;
      const f = {};
      ["title", "essentialQuestion", "goal", "finalProduct"].forEach((k) => { if (k in patch) f[k] = clip(patch[k], k === "title" ? 120 : k === "essentialQuestion" ? 300 : 600); });
      if ("title" in f && !f.title) f.title = "Untitled pathway";
      if (patch.audience) f.audience = patch.audience;
      if (patch.steps) f.steps = patch.steps;
      Object.assign(p, f, { updatedAt: Date.now() });
      if (CLOUD) { const row = toRow.pathway(p); ["id", "educator_id", "created_at", "is_demo"].forEach((k) => delete row[k]); send(restOp("PATCH", `/pathways?id=eq.${encodeURIComponent(id)}`, row, "return=minimal")); }
      else save();
      return p;
    },
    publishPathway(id) {
      const p = SE.store.pathwayById(id);
      if (!p) return null;
      const now = Date.now();
      const v = { pathwayId: id, version: p.version + 1, snapshot: snapshotOf(p), publishedAt: now };
      db.pathwayVersions = db.pathwayVersions || [];
      db.pathwayVersions.push(v);
      Object.assign(p, { version: v.version, status: "published", updatedAt: now });
      if (CLOUD) {
        send(restOp("POST", "/pathway_versions", toRow.pathwayVersion(v), "return=minimal", needs6(() => { db.pathwayVersions = db.pathwayVersions.filter((x) => x !== v); p.version -= 1; })));
        send(restOp("PATCH", `/pathways?id=eq.${encodeURIComponent(id)}`, { version: p.version, status: p.status, updated_at: iso(now) }, "return=minimal"));
      } else save();
      return v;
    },
    archivePathway(id, archived = true) {
      const p = SE.store.pathwayById(id);
      if (!p) return;
      p.status = archived ? "archived" : p.version ? "published" : "draft";
      p.updatedAt = Date.now();
      if (CLOUD) send(restOp("PATCH", `/pathways?id=eq.${encodeURIComponent(id)}`, { status: p.status, updated_at: iso(p.updatedAt) }, "return=minimal")); else save();
    },
    /* A new draft copied from a template or another pathway. The source never changes. */
    duplicatePathway(source, opts = {}) {
      return SE.store.createPathway({
        title: opts.title || source.title, essentialQuestion: source.essentialQuestion, goal: source.goal, finalProduct: source.finalProduct,
        audience: JSON.parse(JSON.stringify(source.audience || {})), steps: JSON.parse(JSON.stringify(source.steps || [])), basedOn: source.id
      });
    },
    pathwayAssignmentsFor: (classId) => (db.pathwayAssignments || []).filter((a) => a.classId === classId).sort((a, b) => a.assignedAt - b.assignedAt)
      .map((a) => ({ ...a, snapshot: a.snapshot || SE.store.pathwayVersion(a.pathwayId, a.version) })),
    pathwayAssignmentFor: (classId, pathwayId) => (db.pathwayAssignments || []).find((a) => a.classId === classId && a.pathwayId === pathwayId) || null,
    /* Assign the latest published version (or move an assigned class up to it). */
    assignPathway(classId, pathwayId) {
      const p = SE.store.pathwayById(pathwayId);
      if (!p || !p.version || p.status === "archived") return null;
      db.pathwayAssignments = db.pathwayAssignments || [];
      const old = SE.store.pathwayAssignmentFor(classId, pathwayId);
      if (old) {
        const prev = old.version;
        old.version = p.version;
        if (CLOUD) send(restOp("PATCH", `/pathway_assignments?id=eq.${encodeURIComponent(old.id)}`, { version: p.version }, "return=minimal", needs6(() => { old.version = prev; }))); else save();
        return old;
      }
      const a = { id: SE.uid("pasg"), classId, pathwayId, version: p.version, assignedAt: Date.now(), dueDate: null, note: null };
      db.pathwayAssignments.push(a);
      if (CLOUD) send(restOp("POST", "/pathway_assignments", toRow.pathwayAssignment(a), "return=minimal", needs6(() => { db.pathwayAssignments = db.pathwayAssignments.filter((x) => x !== a); }))); else save();
      return a;
    },
    unassignPathway(classId, pathwayId) {
      const a = SE.store.pathwayAssignmentFor(classId, pathwayId);
      if (!a) return;
      db.pathwayAssignments = db.pathwayAssignments.filter((x) => x !== a);
      if (CLOUD) send(restOp("DELETE", `/pathway_assignments?id=eq.${encodeURIComponent(a.id)}`, undefined, "return=minimal")); else save();
    },

    /* Learning Plans (the name educators and students see for pathways). */
    planAssignmentsOf: (pathwayId) => (db.pathwayAssignments || []).filter((a) => a.pathwayId === pathwayId),
    /* draft (never assigned) · current (assigned to a class) · finished (archived: it moves to history). */
    planStatus: (p) => (p.status === "archived" ? "finished" : SE.store.planAssignmentsOf(p.id).length ? "current" : "draft"),
    /* Is an assigned plan finished? Students get this from student_state (update-10); others read the plan. */
    planFinished: (asg) => (asg.finished != null ? !!asg.finished : ((SE.store.pathwayById(asg.pathwayId) || {}).status === "archived")),
    /* Publish the working copy and move every class that has this plan to it, in one step. */
    updatePlanForStudents(id) {
      const v = SE.store.publishPathway(id);
      if (v) SE.store.planAssignmentsOf(id).forEach((a) => SE.store.assignPathway(a.classId, id));
      return v;
    },
    addActivityToPlan(id, activityId) {
      const p = SE.store.pathwayById(id), a = SE.activityById[activityId];
      if (!p || !a) return null;
      const step = { id: SE.uid("st"), kind: "mission", activityId, required: SE.content.readiness(a) !== "missing-resource", note: null };
      return SE.store.savePathway(id, { steps: p.steps.concat(step) });
    },

    deleteTeam(id) {
      db.teams = (db.teams || []).filter((t) => t.id !== id);
      if (CLOUD) send(restOp("DELETE", `/class_teams?id=eq.${encodeURIComponent(id)}`, undefined, "return=minimal")); else save();
    },

    /* Demo: in local mode, restores the built-in sample class. In cloud mode, adds a
       fresh sample class to the signed-in educator's account (replacing an older one). */
    async resetDemo() {
      if (CLOUD) {
        const s = readSession();
        if (!s || s.role !== "educator") return null;
        await flush();
        return installDemoCloud(s.id);
      }
      installDemo();
      save();
      await ensureDemoHash();
      return db.classes.find((c) => c.isDemo);
    }
  };

  SE.store.ready = CLOUD ? initCloud() : init();
})();
