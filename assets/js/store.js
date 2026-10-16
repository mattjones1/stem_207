/*
 * STEM Explorer Academy — accounts, sessions, and the activity log.
 *
 * PROTOTYPE STORAGE: everything is kept in this browser's localStorage.
 * That's enough to try the experience on one device, but it is NOT a secure
 * or shared account system. To go live, replace the functions in the
 * "Persistence" section with calls to a real backend (for example Firebase,
 * Supabase, or a district SSO service). The rest of the app only talks to the
 * `SE.store` API below, so nothing else has to change.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const STEM = window.STEM;
  const KEY = "stem-explorers:v2";
  const SESSION_KEY = "stem-explorers:session";

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
  const CODE_WORDS = ["ORBIT", "COMET", "NOVA", "ROVER", "LUNAR", "QUASAR", "SOLAR", "ATLAS", "VECTOR", "PULSE"];
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
    email: "demo@stemexploreracademy.example",
    password: "explore",
    classCode: "ORBIT7",
    studentName: "Ava R.",
    studentCode: ["moon", "comet", "compass"]
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

  function seedDemo() {
    const rand = SE.rng("stem-explorers-demo");
    const now = Date.now();
    const educator = {
      id: "edu_demo",
      name: "Demo Educator",
      email: DEMO.email,
      salt: "demo-salt",
      hash: null, // filled in by ensureDemoHash()
      isDemo: true,
      createdAt: now - 30 * SE.DAY
    };
    const cls = {
      id: "cls_demo",
      name: "Room 12 (sample class)",
      code: DEMO.classCode,
      educatorId: educator.id,
      isDemo: true,
      createdAt: now - 30 * SE.DAY
    };
    const people = [
      ["Ava R.", "4-5", 0.9], ["Mateo L.", "4-5", 0.75], ["Priya S.", "4-5", 0.95], ["Jonah K.", "4-5", 0.45],
      ["Lena M.", "4-5", 0.6], ["Darius T.", "4-5", 0.8], ["Sofia G.", "2-3", 0.55], ["Eli W.", "4-5", 0.15]
    ];
    const students = people.map(([name, band], i) => ({
      id: `stu_demo_${i}`,
      classId: cls.id,
      displayName: name,
      gradeBand: band,
      picCode: i === 0 ? DEMO.studentCode.slice() : newPictureCode(rand),
      isDemo: true,
      createdAt: now - 21 * SE.DAY
    }));

    const events = [];
    const ev = (student, type, at, data = {}) => {
      const e = { id: `ev_demo_${events.length}`, studentId: student.id, classId: cls.id, type, at, data, isDemo: true };
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
            id: `ev_demo_${events.length}`, studentId: s.id, classId: cls.id, type: "reflection_reviewed",
            at: done.at + SE.DAY, data: { completionId: done.id, note: rand() < 0.4 ? "Great evidence in this answer." : "" },
            by: educator.id, isDemo: true
          });
        }
        // Pathway: claim the stage after a coding mission.
        if (act.pathwayStage && act.pathwayStage > completedStages) {
          const stage = act.pathwayStage;
          ev(s, "ican_claimed", done.at + 60000, { stage });
          if (dayOffset > 2 || rand() < 0.5) {
            events.push({
              id: `ev_demo_${events.length}`, studentId: s.id, classId: cls.id, type: "ican_verified",
              at: done.at + SE.DAY, data: { stage }, by: educator.id, isDemo: true
            });
            completedStages = stage;
          }
        }
      }
    });

    /* Interactive lab progress for the sample class */
    const LAB_PLAN = [["rover", 12], ["field-station", 5], ["pattern-machine", 6], ["launcher", 6], ["line-follower", 4], ["ramp-racers", 5], ["pixel-studio", 6]];
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

    events.sort((a, b) => a.at - b.at);
    return { educator, cls, students, events };
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
  }

  function init() {
    db = readDb();
    if (!db || db.version !== 5) {
      db = { version: 5, educators: [], classes: [], students: [], events: [] };
      installDemo();
      save();
    }
    return ensureDemoHash();
  }

  /* ───────── Public API ───────── */
  SE.store = {
    DEMO,
    ready: null,

    /* Session */
    session: () => readSession(),
    signOut() { writeSession(null); },
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
      const edu = db.educators.find((e) => e.email === email);
      if (!edu) return { ok: false, field: "email", error: "We couldn't find an educator account with that email." };
      if ((await hash(password, edu.salt)) !== edu.hash) return { ok: false, field: "password", error: "That password doesn't match. Check for typos and try again." };
      writeSession({ role: "educator", id: edu.id });
      return { ok: true, educator: edu };
    },

    /* Classes */
    classesFor: (educatorId) => db.classes.filter((c) => c.educatorId === educatorId),
    classById: (id) => db.classes.find((c) => c.id === id),
    classByCode: (code) => db.classes.find((c) => c.code === String(code || "").trim().toUpperCase().replace(/\s+/g, "")),
    createClass(educatorId, name) {
      const cls = { id: SE.uid("cls"), name: String(name || "").trim() || "New class", code: newClassCode(), educatorId, createdAt: Date.now() };
      db.classes.push(cls);
      save();
      return cls;
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
      save();
      return { ok: true, student };
    },
    updateStudent(id, patch) {
      const s = db.students.find((x) => x.id === id);
      if (!s) return;
      Object.assign(s, patch);
      save();
    },
    newPictureCodeFor(id) {
      const s = db.students.find((x) => x.id === id);
      if (!s) return;
      s.picCode = newPictureCode();
      save();
      return s.picCode;
    },
    removeStudent(id) {
      db.students = db.students.filter((s) => s.id !== id);
      db.events = db.events.filter((e) => e.studentId !== id);
      save();
    },
    signInStudent(studentId, code) {
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
      save();
      return e;
    },
    teacherLog(studentId, type, data = {}) {
      const s = readSession();
      const st = db.students.find((x) => x.id === studentId);
      if (!s || s.role !== "educator" || !st) return null;
      const e = { id: SE.uid("ev"), studentId, classId: st.classId, type, at: Date.now(), data, by: s.id };
      db.events.push(e);
      save();
      return e;
    },
    eventsFor: (studentId) => db.events.filter((e) => e.studentId === studentId),
    eventsForClass: (classId) => db.events.filter((e) => e.classId === classId),

    /* Demo */
    async resetDemo() {
      installDemo();
      save();
      await ensureDemoHash();
    }
  };

  SE.store.ready = init();
})();
