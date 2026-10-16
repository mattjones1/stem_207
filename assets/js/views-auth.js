/*
 * STEM 207 — sign in and sign up.
 *
 * Students: class code → tap your name → tap your three secret pictures.
 *   No email, no typed password, no personal information. Teachers hand out
 *   login cards. This is the pattern most K–8 classroom tools use.
 * Educators: email and password.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const STEM = window.STEM;
  const { icon, esc } = SE;
  const app = () => document.getElementById("app");
  const PICS = STEM.progression.pictures;

  const shell = (inner, wide) => `
    <section class="auth">
      <div class="auth__sky" aria-hidden="true">${SE.starMap(null)}</div>
      <div class="wrap auth__inner">
        <div class="auth__card ${wide ? "auth__card--wide" : ""}">${inner}</div>
      </div>
    </section>`;

  const prototypeNote = `<p class="auth__fine">${icon("lock", 'class="inline-icon"')}Prototype: accounts are saved only in this browser on this device.</p>`;

  /* ───────── Welcome / choose a door ───────── */
  SE.views.signin = function () {
    app().innerHTML = shell(`
      <div class="auth__brand">
        <h1 tabindex="-1" class="auth__name"><span class="auth__logo">${SE.brandLogo(64)}</span>Maine's STEM explorer for grades 2–8</h1>
        <p>From the coast to the County, big ideas start with curious minds. Who's exploring today?</p>
      </div>
      <div class="doors">
        <a class="door" href="#/signin/student">
          <span class="door__icon">${icon("rocket")}</span>
          <strong>I'm a student</strong>
          <span>Use your class code and secret pictures.</span>
        </a>
        <a class="door" href="#/signin/educator">
          <span class="door__icon">${icon("clipboard")}</span>
          <strong>I'm an educator</strong>
          <span>See your class dashboard and student progress.</span>
        </a>
      </div>
      <div class="auth__alt">
        <button type="button" class="linkish" id="guest-btn">Look around as a guest</button>
        <span aria-hidden="true">·</span>
        <a href="#/signup">Create an educator account</a>
      </div>
      ${prototypeNote}`, true);
    document.getElementById("guest-btn").addEventListener("click", () => {
      SE.store.startGuest();
      location.hash = "#/";
      SE.route(true);
    });
  };

  /* ───────── Student sign-in: 3 steps ───────── */
  const studentFlow = { step: 1, cls: null, student: null, picks: [], tries: 0 };

  SE.views.signinStudent = function () {
    if (studentFlow.step === 1) return studentStepCode();
    if (studentFlow.step === 2) return studentStepName();
    return studentStepPictures();
  };

  function stepper(n) {
    const labels = ["Class code", "Your name", "Secret pictures"];
    return `<ol class="stepper" aria-label="Sign-in steps">${labels.map((l, i) => `
      <li class="${i + 1 < n ? "is-done" : i + 1 === n ? "is-current" : ""}" ${i + 1 === n ? 'aria-current="step"' : ""}><span>${i + 1 < n ? icon("check") : i + 1}</span>${l}</li>`).join("")}</ol>`;
  }

  function studentStepCode() {
    const demo = SE.store.DEMO;
    app().innerHTML = shell(`
      <a class="auth__back" href="#/signin">${icon("arrowLeft")}Back</a>
      ${stepper(1)}
      <h1 tabindex="-1">What's your class code?</h1>
      <p class="muted">Your teacher has it. It looks like a word and a number, like <strong>MOOSE7</strong>.</p>
      <form id="code-form" class="form" novalidate>
        <div class="form__field">
          <label for="class-code">Class code</label>
          <input id="class-code" class="input input--code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="12" aria-describedby="code-err">
          <p class="form__error" id="code-err" role="alert"></p>
        </div>
        <button class="btn btn--launch btn--big" type="submit">Next ${icon("arrowRight")}</button>
      </form>
      <div class="demo-hint">${icon("flag")}<p><strong>Trying the prototype?</strong> Use class code <code>${demo.classCode}</code>, then pick <strong>${demo.studentName}</strong> and the pictures ${demo.studentCode.map((p) => `<span class="pic-inline">${icon(p)}${esc(SE.pictureById[p].name)}</span>`).join(", ")}.</p></div>
      ${prototypeNote}`);
    const input = document.getElementById("class-code");
    input.value = studentFlow.cls ? studentFlow.cls.code : "";
    input.focus();
    document.getElementById("code-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const cls = SE.store.classByCode(input.value);
      const err = document.getElementById("code-err");
      if (!input.value.trim()) { err.textContent = "Type the class code from your teacher."; input.setAttribute("aria-invalid", "true"); return; }
      if (!cls) { err.textContent = "We couldn't find that class. Check the spelling with your teacher."; input.setAttribute("aria-invalid", "true"); return; }
      Object.assign(studentFlow, { step: 2, cls, student: null, picks: [], tries: 0 });
      SE.views.signinStudent();
    });
  }

  function studentStepName() {
    const students = SE.store.studentsIn(studentFlow.cls.id);
    app().innerHTML = shell(`
      <button type="button" class="auth__back linkish" id="back-1">${icon("arrowLeft")}Different class</button>
      ${stepper(2)}
      <h1 tabindex="-1">Find your name</h1>
      <p class="muted">${esc(studentFlow.cls.name)}</p>
      ${students.length ? `<div class="name-grid">
        ${students.map((s) => `<button type="button" class="name-btn" data-id="${s.id}"><span class="name-btn__initial" aria-hidden="true">${esc(s.displayName.charAt(0))}</span>${esc(s.displayName)}</button>`).join("")}
      </div>` : `<div class="empty">${icon("users")}<h3>No explorers in this class yet</h3><p>Ask your teacher to add you to the class.</p></div>`}
      ${prototypeNote}`, true);
    document.getElementById("back-1").addEventListener("click", () => { studentFlow.step = 1; SE.views.signinStudent(); });
    app().querySelectorAll(".name-btn").forEach((b) => b.addEventListener("click", () => {
      studentFlow.student = SE.store.studentById(b.dataset.id);
      studentFlow.step = 3;
      studentFlow.picks = [];
      SE.views.signinStudent();
    }));
  }

  function studentStepPictures() {
    const s = studentFlow.student;
    app().innerHTML = shell(`
      <button type="button" class="auth__back linkish" id="back-2">${icon("arrowLeft")}Not ${esc(s.displayName)}?</button>
      ${stepper(3)}
      <h1 tabindex="-1">Hi, ${esc(s.displayName.split(" ")[0])}! Tap your 3 secret pictures</h1>
      <p class="muted">Tap them in order. They're on your login card.</p>
      <div class="pic-slots" aria-live="polite" id="pic-slots"></div>
      <div class="pic-grid" role="group" aria-label="Secret pictures">
        ${PICS.map((p) => `<button type="button" class="pic-btn" data-pic="${p.id}">${icon(p.id)}<span>${esc(p.name)}</span></button>`).join("")}
      </div>
      <p class="form__error" id="pic-err" role="alert"></p>
      <div class="pic-actions"><button type="button" class="btn btn--ghost btn--small" id="pic-clear">${icon("refresh")}Start over</button></div>
      ${prototypeNote}`, true);

    const slots = document.getElementById("pic-slots");
    const draw = () => {
      slots.innerHTML = [0, 1, 2].map((i) => {
        const p = studentFlow.picks[i];
        return `<span class="pic-slot ${p ? "is-filled" : ""}">${p ? icon(p) + `<span class="visually-hidden">${esc(SE.pictureById[p].name)}</span>` : `<span class="visually-hidden">Empty</span>`}</span>`;
      }).join("");
    };
    draw();
    document.getElementById("back-2").addEventListener("click", () => { studentFlow.step = 2; SE.views.signinStudent(); });
    document.getElementById("pic-clear").addEventListener("click", () => { studentFlow.picks = []; draw(); document.getElementById("pic-err").textContent = ""; });
    app().querySelectorAll(".pic-btn").forEach((b) => b.addEventListener("click", () => {
      if (studentFlow.picks.length >= 3) return;
      studentFlow.picks.push(b.dataset.pic);
      draw();
      if (studentFlow.picks.length === 3) {
        const res = SE.store.signInStudent(s.id, studentFlow.picks);
        if (res.ok) {
          Object.assign(studentFlow, { step: 1, cls: null, student: null, picks: [], tries: 0 });
          location.hash = "#/";
          SE.route(true);
        } else {
          studentFlow.tries++;
          document.getElementById("pic-err").textContent = res.error;
          slots.classList.add("is-wrong");
          setTimeout(() => { studentFlow.picks = []; slots.classList.remove("is-wrong"); draw(); }, 700);
        }
      }
    }));
  }

  /* ───────── Educator sign-in ───────── */
  SE.views.signinEducator = function () {
    const demo = SE.store.DEMO;
    app().innerHTML = shell(`
      <a class="auth__back" href="#/signin">${icon("arrowLeft")}Back</a>
      <h1 tabindex="-1">Educator sign in</h1>
      <form id="edu-form" class="form" novalidate>
        <div class="form__field">
          <label for="edu-email">Email</label>
          <input id="edu-email" class="input" type="email" autocomplete="username" aria-describedby="edu-email-err">
          <p class="form__error" id="edu-email-err" role="alert"></p>
        </div>
        <div class="form__field">
          <label for="edu-pw">Password</label>
          <div class="pw-wrap">
            <input id="edu-pw" class="input" type="password" autocomplete="current-password" aria-describedby="edu-pw-err">
            <button type="button" class="pw-toggle" aria-pressed="false" aria-label="Show password">${icon("eye")}</button>
          </div>
          <p class="form__error" id="edu-pw-err" role="alert"></p>
        </div>
        <button class="btn btn--primary btn--big" type="submit">Sign in</button>
      </form>
      <div class="demo-hint">${icon("flag")}<p><strong>Trying the prototype?</strong> Sign in to the sample class with <code>${demo.email}</code> and password <code>${demo.password}</code>. <button type="button" class="linkish" id="fill-demo">Fill it in for me</button></p></div>
      <p class="auth__alt">New here? <a href="#/signup">Create an educator account</a></p>
      ${prototypeNote}`);
    bindPwToggle();
    document.getElementById("fill-demo").addEventListener("click", () => {
      document.getElementById("edu-email").value = demo.email;
      document.getElementById("edu-pw").value = demo.password;
      document.querySelector("#edu-form button[type=submit]").focus();
    });
    document.getElementById("edu-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();
      const res = await SE.store.signInEducator(document.getElementById("edu-email").value, document.getElementById("edu-pw").value);
      if (!res.ok) return showError(res.field === "email" ? "edu-email" : "edu-pw", res.error);
      location.hash = "#/teach";
      SE.route(true);
    });
  };

  /* ───────── Educator sign-up ───────── */
  SE.views.signup = function () {
    app().innerHTML = shell(`
      <a class="auth__back" href="#/signin/educator">${icon("arrowLeft")}Back</a>
      <h1 tabindex="-1">Create an educator account</h1>
      <p class="muted">You'll get a class code to share with students. Students never need an email or password.</p>
      <form id="su-form" class="form" novalidate>
        <div class="form__field">
          <label for="su-name">Your name, as students see it</label>
          <input id="su-name" class="input" autocomplete="name" placeholder="Ms. Lopez" aria-describedby="su-name-err">
          <p class="form__error" id="su-name-err" role="alert"></p>
        </div>
        <div class="form__field">
          <label for="su-class">Class name</label>
          <input id="su-class" class="input" placeholder="Room 12, Tuesday Explorers">
        </div>
        <div class="form__field">
          <label for="su-email">Email</label>
          <input id="su-email" class="input" type="email" autocomplete="email" aria-describedby="su-email-err">
          <p class="form__error" id="su-email-err" role="alert"></p>
        </div>
        <div class="form__field">
          <label for="su-pw">Password</label>
          <div class="pw-wrap">
            <input id="su-pw" class="input" type="password" autocomplete="new-password" aria-describedby="su-pw-help su-pw-err">
            <button type="button" class="pw-toggle" aria-pressed="false" aria-label="Show password">${icon("eye")}</button>
          </div>
          <p class="field-help" id="su-pw-help">At least 8 characters.</p>
          <p class="form__error" id="su-pw-err" role="alert"></p>
        </div>
        <button class="btn btn--primary btn--big" type="submit">Create account</button>
      </form>
      ${prototypeNote}`);
    bindPwToggle();
    document.getElementById("su-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();
      const res = await SE.store.createEducator({
        name: document.getElementById("su-name").value,
        className: document.getElementById("su-class").value,
        email: document.getElementById("su-email").value,
        password: document.getElementById("su-pw").value
      });
      if (!res.ok) return showError({ name: "su-name", email: "su-email", password: "su-pw" }[res.field], res.error);
      SE.toast(`Welcome, ${res.educator.name}. Your class code is ${res.cls.code}.`);
      location.hash = "#/teach/class";
      SE.route(true);
    });
  };

  function bindPwToggle() {
    app().querySelectorAll(".pw-toggle").forEach((b) => b.addEventListener("click", () => {
      const input = b.previousElementSibling;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      b.setAttribute("aria-pressed", String(show));
      b.setAttribute("aria-label", show ? "Hide password" : "Show password");
    }));
  }
  function clearErrors() {
    app().querySelectorAll(".form__error").forEach((e) => (e.textContent = ""));
    app().querySelectorAll("[aria-invalid]").forEach((e) => e.removeAttribute("aria-invalid"));
  }
  function showError(inputId, msg) {
    const input = document.getElementById(inputId);
    document.getElementById(`${inputId}-err`).textContent = msg;
    input.setAttribute("aria-invalid", "true");
    input.focus();
  }
})();
