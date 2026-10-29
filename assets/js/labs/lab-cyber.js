/*
 * Cyber Defender Lab — Coding & Computer Science, Cyber Defender crew (planning/CODING_PLAN.md)
 * Six levels of everyday security, all on the device:
 *   1 Decode      read a Caesar cipher with a cipher wheel (tap to turn it; no dragging)
 *   2 Encode      send a secret message
 *   3 Crack it    find an unknown shift by trying keys
 *   4 Passphrase  build a strong, made-up passphrase (never a real password; nothing is saved or sent)
 *   5 Phish or not  sort made-up messages into safe and phishing, and name the clue
 *   6 Share or not  decide what's OK to share online
 * Every message, account, and link here is made up for the lesson. Pure rules for tests: SE.cyber.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;

  const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const shift = (text, k) => String(text).toUpperCase().replace(/[A-Z]/g, (c) => ABC[(ABC.indexOf(c) + k + 26 * 10) % 26]);
  const norm = (s) => String(s || "").toUpperCase().replace(/[^A-Z ]/g, "").replace(/\s+/g, " ").trim();

  /* Passphrase strength: a rough count of guesses, from words (a 7,776-word list, like dice passphrases)
     or from characters. Students see the number of digits in the guess count, never a promise of safety. */
  function strength(p) {
    const s = String(p || "");
    const words = s.trim().split(/[\s\-_.]+/).filter((w) => /^[a-z]{3,}$/i.test(w));
    const pool = (/[a-z]/.test(s) ? 26 : 0) + (/[A-Z]/.test(s) ? 26 : 0) + (/[0-9]/.test(s) ? 10 : 0) + (/[^A-Za-z0-9\s]/.test(s) ? 32 : 0);
    const byChars = s.length * Math.log10(Math.max(pool, 1));
    const byWords = words.length * Math.log10(7776);
    const digits = Math.round(Math.max(byChars * (words.length >= 3 ? 0.6 : 1), byWords));   // word-based phrases are guessed by words
    const COMMON = ["password", "123456", "qwerty", "letmein", "maine", "lobster", "iloveyou"];
    const common = COMMON.some((w) => s.toLowerCase().includes(w)) && s.length < 16;
    const level = common || s.length < 8 ? "weak" : digits >= 15 && s.length >= 12 ? "strong" : digits >= 10 ? "okay" : "weak";
    return { digits, level, length: s.length, words: words.length, common };
  }

  const MESSAGES = [
    { id: "m1", from: "Coach Rivera (your school account)", text: "Practice moves to the gym on Thursday because of rain.", phish: false },
    { id: "m2", from: "Prize Center <win-now@prizes-4u.example>", text: "YOU WON a free game console!!! Click here in 10 minutes and enter your password to claim it.", phish: true, clue: "rush" },
    { id: "m3", from: "Gamer Support <support@gaame-help.example>", text: "Your account is locked. Reply with your username and password so we can fix it.", phish: true, clue: "password" },
    { id: "m4", from: "Library (your school account)", text: "The book you reserved, Ocean Explorers, is ready at the front desk.", phish: false },
    { id: "m5", from: "Bank Alert <alert@bannk-secure.example>", text: "Unusual activity! Open the attached file to keep your account safe.", phish: true, clue: "sender" },
    { id: "m6", from: "Grandma (in your contacts)", text: "Can't wait to see your science fair project this weekend!", phish: false },
  ];
  const CLUES = { rush: "It rushes you or promises a prize", password: "It asks for a password or personal information", sender: "The sender's address looks fake or misspelled" };
  const SHARE = [
    { id: "s1", item: "Your favorite book or game", ok: "share" },
    { id: "s2", item: "Your home address", ok: "never" },
    { id: "s3", item: "A drawing you made (with no name on it)", ok: "share" },
    { id: "s4", item: "Your password", ok: "never" },
    { id: "s5", item: "A photo that shows your school's name", ok: "ask" },
    { id: "s6", item: "Where you're going after school today", ok: "never" },
  ];

  const LEVELS = [
    { kind: "decode", title: "Decode the signal", concept: "Encryption", secret: "MEET AT THE DOCK", key: 3,
      goal: "A friend sent a secret message, shifted 3 letters forward. Turn the wheel to shift 3, read the message, and type it.",
      hints: ["Set the wheel to 3. Find each secret letter on the bottom ring. The real letter is right above it.", "Work backward: each secret letter is 3 letters after the real one. So P becomes M."],
      learned: "A cipher scrambles a message so only someone with the key can read it. The key here is the shift: 3." },
    { kind: "encode", title: "Send a secret", concept: "Encryption", plain: "LIGHTHOUSE AT NOON", key: 5,
      goal: "Encode this message with a shift of 5, so only your crew can read it.",
      hints: ["Turn the wheel to 5. Find each letter on the top ring and write the letter under it.", "Keep the spaces where they are. Check one letter at a time."],
      learned: "Encrypting turns plain text into secret text with a key. Your crew needs the same key to decode it." },
    { kind: "crack", title: "Crack the code", concept: "Breaking codes", secret: "FOG ROLLING IN", key: 7,
      goal: "You found a secret message, but not the key. Try shifts on the wheel until the message makes sense, then type the message.",
      hints: ["Try one shift at a time and look for a real word.", "Only 25 shifts are possible. That's why a Caesar cipher is easy to crack, and real encryption uses much bigger keys."],
      learned: "A Caesar cipher has only 25 keys, so a computer can try them all in a blink. Real encryption has so many keys that trying them all would take longer than the age of the universe." },
    { kind: "pass", title: "Build a passphrase", concept: "Passwords",
      goal: "Make up a passphrase for a pretend account that the meter rates strong: at least 12 characters, like three or more random words.",
      hints: ["Three or four random words, like river-pickle-lantern, beat a short password with symbols.", "Avoid common words like password or your name. Never type a real password here."],
      learned: "Long passphrases of random words are hard for computers to guess and easy for people to remember. Never share a password, and use a different one for each account." },
    { kind: "phish", title: "Phish or not?", concept: "Phishing",
      goal: "Mark each message Safe or Phishing. For each phishing message, choose the clue that gave it away.",
      hints: ["Phishing messages rush you, ask for passwords, or come from strange addresses.", "Read the sender's address letter by letter. Is anything misspelled?"],
      learned: "Phishing tricks people into giving away passwords or clicking bad links. Slow down, check the sender, and never send a password in a message." },
    { kind: "share", title: "Share or not?", concept: "Privacy",
      goal: "For each thing, decide: OK to share online, ask a grown-up first, or never share.",
      hints: ["Never share things that tell strangers where you are or how to get into your accounts.", "Photos can show more than you think, like a school name or a street sign."],
      learned: "Protecting personal information keeps you safe. When you're not sure, ask a trusted grown-up before you share." },
  ];
  SE.labs.goals(LEVELS, LEVELS.map((L) => ({
    "Encryption": ["Use a key to encrypt and decrypt a message.", "Encryption protects messages, passwords, and payments every time you use the internet."],
    "Breaking codes": ["Crack a weak cipher by trying every key, and explain why real encryption is stronger.", "Security experts test systems by trying to break them, so attackers can't."],
    "Passwords": ["Build a strong passphrase and explain what makes it strong.", "Strong, private passwords are the first defense for every account you'll ever have."],
    "Phishing": ["Spot the clues in a phishing message.", "Most account break-ins start with a trick message. Spotting the clues protects you and your family."],
    "Privacy": ["Decide what information is safe to share online.", "What you share online can stay there. Protecting personal information keeps you safe."],
  })[L.concept]));

  /* ───────── Rules (pure, for tests) ───────── */
  function check(idx, a) {
    const L = LEVELS[idx];
    if (L.kind === "decode" || L.kind === "crack") {
      const want = L.secret;
      if (!norm(a.text)) return { ok: false, reason: "Type the message you decoded." };
      const got = norm(a.text);
      if (got !== want) {
        const i = [...want].findIndex((c, j) => got[j] !== c);
        return { ok: false, reason: L.kind === "crack" && i === 0
          ? `"${got}" isn't a message yet. Keep turning the wheel until the words make sense.`
          : `Letter ${i + 1} of "${got}" doesn't match. Check that letter on the wheel${L.kind === "decode" ? " at shift " + L.key : ""}.` };
      }
      return { ok: true };
    }
    if (L.kind === "encode") {
      const want = shift(L.plain, L.key);
      const got = norm(a.text);
      if (!got) return { ok: false, reason: "Type your encoded message." };
      if (got !== want) {
        const i = [...want].findIndex((c, j) => got[j] !== c);
        return { ok: false, reason: `Letter ${i + 1}: you wrote "${got[i] || "nothing"}". Find "${L.plain[i]}" on the top ring at shift ${L.key} and read the letter under it.` };
      }
      return { ok: true };
    }
    if (L.kind === "pass") {
      const s = strength(a.text);
      if (!a.text) return { ok: false, reason: "Type a made-up passphrase for a pretend account." };
      if (s.common) return { ok: false, reason: "That has a common word in it, one of the first things attackers try. Use random words." };
      if (s.level !== "strong") return { ok: false, reason: `The meter says ${s.level}: about ${s.digits}-digit numbers of guesses, ${s.length} characters. Make it longer, with three or more random words.` };
      return { ok: true };
    }
    if (L.kind === "phish") {
      for (const m of MESSAGES) {
        const pick = (a.marks || {})[m.id];
        if (!pick) return { ok: false, reason: `Mark every message. "${m.from}" isn't marked yet.` };
        if ((pick === "phish") !== m.phish) return { ok: false, reason: `Look again at the message from ${m.from}. You marked it ${pick === "phish" ? "phishing" : "safe"}.` };
        if (m.phish && (a.clues || {})[m.id] !== m.clue) return { ok: false, reason: `You spotted the phishing message from ${m.from}. Now choose the clue that gives it away.` };
      }
      return { ok: true };
    }
    if (L.kind === "share") {
      for (const s of SHARE) {
        const pick = (a.marks || {})[s.id];
        if (!pick) return { ok: false, reason: `Decide about "${s.item}".` };
        if (pick !== s.ok) return { ok: false, reason: `Think again about "${s.item}". Could it help a stranger find you or get into your accounts?` };
      }
      return { ok: true };
    }
    return { ok: false, reason: "" };
  }

  /* ───────── View ───────── */
  function wheel(k) {
    return `<div class="cy-wheel" aria-label="Cipher wheel at shift ${k}: A becomes ${ABC[k % 26]}">
      <div class="cy-ring">${[...ABC].map((c) => `<span>${c}</span>`).join("")}</div>
      <div class="cy-ring cy-ring--shift">${[...ABC].map((c, i) => `<span>${ABC[(i + k) % 26]}</span>`).join("")}</div>
    </div>`;
  }
  function mount(el, idx, api) {
    const L = LEVELS[idx];
    let k = 0, text = "", marks = {}, clues = {};
    function render(focus) {
      const s = L.kind === "pass" ? strength(text) : null;
      el.innerHTML = `
        <div class="cy">
          <p class="cr-sim">${icon("shield")}<span><strong>Practice only.</strong> Every message, account, and link here is made up. ${L.kind === "pass" ? "Never type a real password. Nothing you type is saved or sent." : ""}</span></p>
          ${["decode", "encode", "crack"].includes(L.kind) ? `
            <p class="cy-msg"><strong>${L.kind === "encode" ? "Message to encode" : "Secret message"}:</strong> <code>${esc(L.kind === "encode" ? L.plain : shift(L.secret, L.key))}</code></p>
            <div class="cy-shift" role="group" aria-label="Turn the wheel">
              <button type="button" class="btn btn--ghost btn--small" id="cy-down" aria-label="Shift down one">${icon("arrowLeft")}</button>
              <span class="cy-k" aria-live="polite">Shift <strong>${k}</strong></span>
              <button type="button" class="btn btn--ghost btn--small" id="cy-up" aria-label="Shift up one">${icon("arrowRight")}</button>
            </div>
            ${wheel(k)}
            ${L.kind === "crack" ? `<p class="cy-try">At shift ${k}, the message reads: <code>${esc(shift(L.secret, L.key - k))}</code></p>` : ""}
            <label class="py-h" for="cy-text">${L.kind === "encode" ? "Your encoded message" : "The real message"}</label>
            <input id="cy-text" class="input cy-input" autocomplete="off" autocapitalize="characters" spellcheck="false" value="${esc(text)}">` : ""}
          ${L.kind === "pass" ? `
            <label class="py-h" for="cy-text">A made-up passphrase for a pretend account</label>
            <input id="cy-text" class="input cy-input" type="text" autocomplete="off" spellcheck="false" value="${esc(text)}" aria-describedby="cy-meter">
            <div class="cy-meter cy-meter--${s.level}" id="cy-meter" aria-live="polite"><span class="cy-bar"><i style="width:${Math.min(100, (s.digits / 20) * 100)}%"></i></span><strong>${({ weak: "Weak", okay: "Okay", strong: "Strong" })[s.level]}</strong> · ${s.length} characters · about a ${s.digits}-digit number of guesses</div>` : ""}
          ${L.kind === "phish" ? `
            <ul class="cy-list">${MESSAGES.map((m) => `<li class="cy-card">
              <p class="cy-from">${icon("message")}<span>${esc(m.from)}</span></p><p>${esc(m.text)}</p>
              <div class="cy-q" role="group" aria-label="Safe or phishing: message from ${esc(m.from)}">
                <button type="button" class="btn btn--ghost btn--small" data-mark="${m.id}" data-v="safe" aria-pressed="${marks[m.id] === "safe"}">Safe</button>
                <button type="button" class="btn btn--ghost btn--small" data-mark="${m.id}" data-v="phish" aria-pressed="${marks[m.id] === "phish"}">Phishing</button>
              </div>
              ${marks[m.id] === "phish" ? `<div class="cy-q" role="group" aria-label="The clue">${Object.entries(CLUES).map(([cid, t]) => `<button type="button" class="btn btn--ghost btn--small" data-clue="${m.id}" data-v="${cid}" aria-pressed="${clues[m.id] === cid}">${esc(t)}</button>`).join("")}</div>` : ""}
            </li>`).join("")}</ul>` : ""}
          ${L.kind === "share" ? `
            <ul class="cy-list">${SHARE.map((s2) => `<li class="cy-card"><p><strong>${esc(s2.item)}</strong></p>
              <div class="cy-q" role="group" aria-label="${esc(s2.item)}">${[["share", "OK to share"], ["ask", "Ask a grown-up"], ["never", "Never share"]].map(([v, t]) => `<button type="button" class="btn btn--ghost btn--small" data-mark="${s2.id}" data-v="${v}" aria-pressed="${marks[s2.id] === v}">${t}</button>`).join("")}</div></li>`).join("")}</ul>` : ""}
          <button type="button" class="btn btn--launch" id="cy-check">${icon("check")}Check</button>
        </div>`;
      bind();
      if (focus) { const f = el.querySelector(focus); if (f) f.focus(); }
    }
    function bind() {
      const up = el.querySelector("#cy-up"), down = el.querySelector("#cy-down"), inp = el.querySelector("#cy-text");
      if (up) up.addEventListener("click", () => { k = (k + 1) % 26; text = inp ? inp.value : text; render("#cy-up"); });
      if (down) down.addEventListener("click", () => { k = (k + 25) % 26; text = inp ? inp.value : text; render("#cy-down"); });
      if (inp && L.kind === "pass") inp.addEventListener("input", () => {
        text = inp.value; const s = strength(text); const m = el.querySelector("#cy-meter");
        m.className = `cy-meter cy-meter--${s.level}`;
        m.innerHTML = `<span class="cy-bar"><i style="width:${Math.min(100, (s.digits / 20) * 100)}%"></i></span><strong>${({ weak: "Weak", okay: "Okay", strong: "Strong" })[s.level]}</strong> · ${s.length} characters · about a ${s.digits}-digit number of guesses`;
      });
      el.querySelectorAll("[data-mark]").forEach((b) => b.addEventListener("click", () => { marks[b.dataset.mark] = b.dataset.v; render(`[data-mark="${b.dataset.mark}"][data-v="${b.dataset.v}"]`); }));
      el.querySelectorAll("[data-clue]").forEach((b) => b.addEventListener("click", () => { clues[b.dataset.clue] = b.dataset.v; render(`[data-clue="${b.dataset.clue}"][data-v="${b.dataset.v}"]`); }));
      el.querySelector("#cy-check").addEventListener("click", () => {
        if (inp) text = inp.value;
        api.log("lab_test_run", { kind: L.kind });
        const res = check(idx, { text, marks, clues });
        if (res.ok) api.win(L.kind === "pass" ? { level: "strong" } : {});   // never log the passphrase itself
        else api.say(res.reason, "warn");
      });
    }
    render();
    return () => { text = ""; };
  }

  SE.labs.register({
    id: "cyber-defender",
    area: "coding",
    title: "Cyber Defender Lab",
    tagline: "Crack ciphers, build passphrases, catch phishing, and protect your privacy. Everything here is practice, made up, and stays on your device.",
    levels: LEVELS,
    mount
  });
  SE.cyber = { LEVELS, MESSAGES, SHARE, CLUES, shift, strength, check };
})();
