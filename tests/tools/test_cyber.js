// Cyber Defender Lab (assets/js/labs/lab-cyber.js): the cipher math, the passphrase meter, and every level's
// check (right answers pass, wrong ones are refused with feedback that names the student's own work).
//   node tests/tools/test_cyber.js
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.resolve(__dirname, "../..");
const R = [];
const ok = (n, c, x = "") => { R.push(!!c); console.log((c ? "PASS " : "FAIL ") + n, c ? "" : x); };
const sandbox = { window: {}, console };
sandbox.window.SE = { icon: () => "", esc: (s) => String(s), labs: { register() {}, goals(levels, g) { levels.forEach((L, i) => { if (g[i]) [L.learn, L.why] = g[i]; }); } } };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, "assets/js/labs/lab-cyber.js"), "utf8"), sandbox, { filename: "lab-cyber.js" });
const C = sandbox.window.SE.cyber;
ok("the lab loads with 6 levels", !!C && C.LEVELS.length === 6);
ok("every level has learn, why, two hints, and what was learned", C.LEVELS.every((L) => L.learn && L.why && L.hints.length === 2 && L.learned));

// Cipher math
ok("shift 3 turns ABC XYZ into DEF ABC", C.shift("ABC XYZ", 3) === "DEF ABC");
ok("shifting back undoes it", C.shift(C.shift("MEET AT THE DOCK", 7), -7) === "MEET AT THE DOCK");

// Levels 1–3: ciphers
const [dec, enc, crk] = C.LEVELS;
ok("level 1: the decoded message passes (any case)", C.check(0, { text: dec.secret.toLowerCase() }).ok);
const d1 = C.check(0, { text: "MEET AT THE DUCK" });
ok("level 1: a wrong letter is named by position", !d1.ok && /Letter 14/.test(d1.reason) && !d1.reason.includes(dec.secret), d1.reason);
ok("level 1: an empty answer asks for one", !C.check(0, { text: " " }).ok);
ok("level 2: the encoded message passes", C.check(1, { text: C.shift(enc.plain, enc.key) }).ok);
const e2 = C.check(1, { text: C.shift(enc.plain, 4) });
ok("level 2: a wrong shift names the student's letter, not the answer", !e2.ok && e2.reason.includes(`"${C.shift(enc.plain, 4)[0]}"`) && !e2.reason.includes(C.shift(enc.plain, 5)), e2.reason);
ok("level 3: the cracked message passes", C.check(2, { text: crk.secret }).ok);
ok("level 3: the scrambled text is refused", !C.check(2, { text: C.shift(crk.secret, crk.key) }).ok);

// Level 4: passphrase meter
const strong = C.strength("river-pickle-lantern");
ok("three random words rate strong", strong.level === "strong", JSON.stringify(strong));
ok("a short password rates weak", C.strength("abc123").level === "weak");
ok("a common word is flagged", C.strength("password2026!").common);
ok("level 4: a strong passphrase passes", C.check(3, { text: "maple-rocket-tuba-cloud" }).ok);
const p4 = C.check(3, { text: "Lobster1" });
ok("level 4: a common, short one is refused with the reason", !p4.ok && /common/.test(p4.reason), p4.reason);
const p5 = C.check(3, { text: "Sunfish7" });
ok("level 4: a weak one reports the meter, length included", !p5.ok && /8 characters/.test(p5.reason), p5.reason);

// Level 5: phishing
const marks = Object.fromEntries(C.MESSAGES.map((m) => [m.id, m.phish ? "phish" : "safe"]));
const clues = Object.fromEntries(C.MESSAGES.filter((m) => m.phish).map((m) => [m.id, m.clue]));
ok("every message is made up (example domains or school accounts only)", C.MESSAGES.every((m) => !/@/.test(m.from) || /\.example>/.test(m.from)));
ok("level 5: right marks and clues pass", C.check(4, { marks, clues }).ok);
ok("level 5: a missing clue is refused", !C.check(4, { marks, clues: {} }).ok);
const wrong = { ...marks, m1: "phish" };
const r5 = C.check(4, { marks: wrong, clues });
ok("level 5: a safe message marked phishing names the sender", !r5.ok && r5.reason.includes("Coach Rivera") && /phishing/.test(r5.reason), r5.reason);

// Level 6: share or not
const sh = Object.fromEntries(C.SHARE.map((s) => [s.id, s.ok]));
ok("level 6: right choices pass", C.check(5, { marks: sh }).ok);
const r6 = C.check(5, { marks: { ...sh, s2: "share" } });
ok("level 6: sharing a home address is refused and named", !r6.ok && r6.reason.includes("home address"), r6.reason);
ok("level 6: an unanswered item is named", /Decide/.test(C.check(5, { marks: {} }).reason));

console.log(`\n${R.filter(Boolean).length}/${R.length} passed`);
process.exit(R.every(Boolean) ? 0 : 1);
