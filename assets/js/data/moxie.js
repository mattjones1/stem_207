/*
 * STEM 207 — Moxie, a physical computing pathway (16 ESP32 sessions in 4 units).
 *
 * Planning brief: planning/MOXIE_PLAN.md. Validation backlog: planning/MOXIE_VALIDATION.md.
 *
 * This is an OUTLINE edition. The repo is public, so the source lesson text, wiring,
 * and code stay out of it until reuse permissions are confirmed. Fields that hold that
 * content (wiring, diagram, code, tests, stretch, steps) are empty, and the pages say
 * "in review". Grades and minutes stay null until a pilot sets them; never guess them.
 * Answer sketches never go in this repo: anything here is readable by anyone.
 *
 * pub (publication state, per session and for the pathway):
 *   "draft" → "review" → "hardware" → "pilot" → "published"
 *   Educators see every state. "pilot" sessions also reach students whose class has them
 *   assigned. Only "published" sessions join STEM.activities (the library, counts, and
 *   suggestions). `version` is the content version and is saved with each piece of work.
 */
window.STEM = window.STEM || {};

window.STEM.moxie = {
  id: "moxie",
  name: "Moxie",
  tagline: "Code it. Build it. Make it matter.",
  promise: "A STEM 207 pathway where students turn code into working devices that help people.",
  intro:
    "Start with a blinking light. Finish with something that matters. In Moxie, students learn to code, connect circuits, and bring their ideas to life with lights, buttons, displays, sensors, and movement. Working with a partner, they test ideas, track down bugs, and build a device for a real person's problem. Every project tells a story: who it helps, how it works, and what changed along the way.",
  pub: "draft",
  version: "0.1",
  units: [
    { n: 1, title: "Outputs", question: "How can code change something in the physical world?",
      progress: "Explain and intentionally change an output pattern.", sessions: ["moxie-01", "moxie-02", "moxie-03", "moxie-04"] },
    { n: 2, title: "Inputs & Decisions", question: "How can a device respond to a person?",
      progress: "Show the Smart Crosswalk and explain how it remembers a request.", sessions: ["moxie-05", "moxie-06", "moxie-07", "moxie-08"] },
    { n: 3, title: "Displays, Time, Sensors & Motion", question: "How can a device sense, communicate, and move?",
      progress: "Demonstrate the parts your capstone idea needs.", sessions: ["moxie-09", "moxie-10", "moxie-11", "moxie-12"] },
    { n: 4, title: "Capstone", question: "What could we build that helps someone?",
      progress: "Design approval, working subsystems, a tested improvement, and the showcase.", sessions: ["moxie-13", "moxie-14", "moxie-15", "moxie-16"] }
  ],
  partner: {
    summary: "Partners share one circuit and take turns. The Driver types the code. The Builder handles the hardware. Switch every challenge.",
    individual: "A shared circuit doesn't mean both partners understand it. Each student explains the work on their own."
  },
  // From the 16 lessons together. Exact models, quantities, and spares come after the kit is reconciled.
  kit: {
    status: "Pending: reconcile with the kit you own before buying anything.",
    core: ["ESP32 board (exact board pending validation)", "Data-capable USB cable", "Computer with the Arduino IDE", "Breadboard and jumper wires",
      "Colored LEDs", "220 Ω and 10 kΩ resistors", "Push buttons", "10 kΩ potentiometer (knob)", "Passive buzzer",
      "128×64 OLED display (Adafruit libraries named in the lessons)", "HC-SR04 distance sensor", "1 kΩ and 2 kΩ resistors (voltage divider)", "SG90 servo", "Ruler"],
    optional: ["RGB LED", "Light and temperature sensors with matching resistors", "Instructor-managed power module"]
  },
  capstone: {
    requirements: [
      "Solves a real problem for someone at home, at school, or at the Coliseum.",
      "At least one input.",
      "At least two outputs of different types.",
      "Code with a variable, an if/else, and comments.",
      "Only parts from the kit, with a circuit plan your teacher approved.",
      "Three measurable criteria, with test results.",
      "Peer feedback and at least one improvement.",
      "A one-minute pitch and demo, with both partners taking part."
    ],
    schedule: "Session 13 plans build time in Sessions 14, 15, and part of 16. Don't plan Session 16 as all presentations."
  },
  // The source rubric describes only "Meets" (3 of 4). Give feedback per dimension; no scores until the other levels are written.
  rubric: ["Function", "Code & comments", "Circuit", "Design process", "Communication", "Teamwork"],
  pending: {
    grades: "Grade range: pending validation.",
    minutes: "Minutes per session: pending a classroom pilot.",
    board: "Supported board: pending. Session 1 assumes a USB-C ESP32 Dev Module with a built-in LED on pin 2.",
    software: "Software: pending a tested Arduino IDE, ESP32 board package, and library set."
  }
};

(function () {
  const STEM = window.STEM;
  const UNIT_OF = (n) => Math.ceil(n / 4);
  const COMMON_NOTES = [
    "Outline edition: the lesson text, wiring, and code stay out of this public site until reuse permissions are confirmed.",
    "Answer sketches and teacher solutions are in the private Moxie teacher kit, never on this site.",
    "Check each student's own explanation. A shared circuit doesn't mean both partners understand it."
  ];
  const kitBasics = ["ESP32 board", "Data-capable USB cable", "Computer with the Arduino IDE"];

  /* One session record. Shared fields match activities.js so a published session works everywhere. */
  function session(n, title, kind, focus, evidence, check, extra = {}) {
    const id = `moxie-${String(n).padStart(2, "0")}`;
    const u = STEM.moxie.units[UNIT_OF(n) - 1];
    const prev = n > 1 ? `moxie-${String(n - 1).padStart(2, "0")}` : null;
    return {
      id, title, area: "engineering",
      summary: `Moxie session ${n} of 16. ${focus}.`,
      // Readiness within Moxie by unit (a proposal until the pilot): outputs, then decisions and sensing, then the capstone.
      level: u.n === 1 ? "beginner" : u.n === 4 ? "advanced" : "intermediate",
      grades: [],
      duration: null,
      format: "collaborative",
      equipment: ["computer", "electronics"],
      source: "adapted",
      keywords: ["moxie", "esp32", "arduino", "electronics", "physical computing", "coding"],
      access: { account: "none", cost: "free", supervision: true, hardware: ["ESP32 kit (exact board pending validation)", "Computer with the Arduino IDE"] },
      launch: { status: "none" },
      pub: "draft",
      version: "0.1",
      moxie: Object.assign({ session: n, unit: u.n, kind, focus, evidence, gates: [], plan: null,
        sourceFile: extra.sourceFile }, extra.moxie || {}),
      mission: `Learning focus: ${focus}.`,
      learn: focus.split("; ").map((x) => x.charAt(0).toUpperCase() + x.slice(1) + "."),
      before: {
        materials: kitBasics.concat(extra.materials || []),
        setup: ["Setup steps are in review with the teacher guide."],
        prerequisites: prev ? `Moxie session ${n - 1}, or a demonstration of the same skills to your teacher.` : "None. This is the first Moxie session."
      },
      steps: [],
      stopAt: evidence,
      check,
      reflect: check,
      extend: "The stretch challenge is in review.",
      // Lesson content: empty in the outline edition.
      wiring: null,     // [[part, pin, note], ...]
      diagram: null,    // { src, alt, text }
      code: null,       // { lines: [...], file } — keep the blanks in student code
      tests: null,      // [check, ...]
      stretch: null,
      notice: null,     // an urgent correction students and teachers must see
      teacherNotes: (extra.notes || []).concat(COMMON_NOTES)
    };
  }

  const S = (n, ...args) => session(n, ...args);
  STEM.moxieSessions = [
    S(1, "Hello, ESP32!", "build", "Upload a program; setup and loop; a heartbeat LED; the Serial Monitor",
      "A working heartbeat, a saved sketch, and an explanation of setup and loop.",
      "Explain what setup() does and what loop() does in your heartbeat program.",
      { sourceFile: "Session_01_Hello_ESP32.docx", notes: [
        "Validate first: the lesson assumes a USB-C ESP32 Dev Module with a built-in LED on pin 2. Later sheets use D, RX2, and TX2 labels. Match the diagrams to your boards.",
        "Validate first: board package, drivers, and device restrictions. Record a known-working setup in the teacher guide."] }),
    S(2, "Double Blink", "build", "External LEDs; resistors; alternating outputs; a timing variable",
      "Two LEDs blinking in opposite patterns, and an explanation of a timing change.",
      "Change your timing variable. Explain what changed and why.",
      { sourceFile: "Session_02_Double_Blink.docx", materials: ["LEDs", "220 Ω resistors", "Breadboard and jumper wires"] }),
    S(3, "Traffic Light", "build", "Pseudocode; an ordered sequence; timing variables",
      "A finished plan, a working light cycle, and a timing observation.",
      "Explain how your plan matches the order of your traffic light.",
      { sourceFile: "Session_03_Traffic_Light.docx", materials: ["Red, yellow, and green LEDs", "220 Ω resistors"], moxie: { plan: "pseudocode" } }),
    S(4, "Fading & Color Mixing", "build", "PWM; counted loops; gradual output changes",
      "A working single-LED fade and an explanation. RGB mixing stays an optional stretch.",
      "Explain how your code makes the LED fade.",
      { sourceFile: "Session_04_Fading_Color_Mixing.docx", materials: ["LED", "220 Ω resistor", "RGB LED (optional stretch)"], notes: [
        "Validate first: run the fade sketch with the selected ESP32 board package.",
        "Validate first: the RGB stretch guesses wiring from brightness. Replace it with instructions for your RGB part and test both."] }),
    S(5, "I Control the Lights", "build", "Digital inputs; pull-down resistors; if/else",
      "Three button and LED behaviors, and an explanation of a pull-down.",
      "Explain what the pull-down resistor does for your button.",
      { sourceFile: "Session_05_I_Control_the_Lights.docx", materials: ["Push buttons", "10 kΩ resistors", "LEDs"] }),
    S(6, "Too Many Switches", "build", "Four input cases; AND; else-if; a helper function",
      "Truth-table checks and an explanation of the order of the cases.",
      "Explain why the order of your if and else-if cases matters.",
      { sourceFile: "Session_06_Too_Many_Switches.docx", materials: ["Two push buttons", "LEDs"], moxie: { plan: "truth-table" }, notes: [
        "Before publishing: the stretch asks for press-and-release, but the hint only sets an armed flag on press. Add release handling to the teacher solution and test it."] }),
    S(7, "Knobs & Numbers", "build", "Analog input; mapping; serial values",
      "Brightness controlled by the knob, and an explanation of map().",
      "Explain what map() does with the knob's number.",
      { sourceFile: "Session_07_Knobs_Numbers.docx", materials: ["10 kΩ potentiometer", "LED"], notes: [
        "Review the simplified analog voltage example against your board's real limits."] }),
    S(8, "Smart Crosswalk", "build", "Combine outputs, a remembered request, and sound",
      "Approved pseudocode, a working crosswalk, and an explanation of how it remembers a request.",
      "Explain how your crosswalk remembers a button press.",
      { sourceFile: "Session_08_Smart_Crosswalk.docx", materials: ["LEDs", "Push button", "Passive buzzer"], moxie: { plan: "pseudocode", gates: ["plan"] }, notes: [
        "Before publishing: the code checks the button during some waits but uses plain delays during chirps. Decide what happens to a press during green, yellow, red, and WALK, and test each one.",
        "Validate first: tone() on your ESP32 board package."] }),
    S(9, "Talking Displays", "build", "Libraries; drawing on an OLED; live values",
      "A live knob value on the OLED, and an explanation of the display steps.",
      "Explain the steps your code takes to show a number on the display.",
      { sourceFile: "Session_09_Talking_Displays.docx", materials: ["128×64 OLED display", "10 kΩ potentiometer"], notes: [
        "Validate first: install and run the named Adafruit libraries. Check the OLED address troubleshooting with your display."] }),
    S(10, "Stopwatch", "build", "Elapsed time; state; button-edge detection",
      "A start/stop demonstration, a comparison with a phone timer, and an explanation of the timing.",
      "Explain how your stopwatch measures time.",
      { sourceFile: "Session_10_Stopwatch.docx", materials: ["Push button", "128×64 OLED display"], notes: [
        "Before publishing: test with real buttons. The troubleshooting blames double counts on lastButton; edge detection and debounce are different ideas. Add a tested debounce explanation if needed."] }),
    S(11, "Parking Assistant", "build", "Distance sensing; thresholds; calibration",
      "A teacher wiring check, three distance readings, and the zone behavior.",
      "Explain how your device decides which distance zone you're in.",
      { sourceFile: "Session_11_Parking_Assistant.docx", materials: ["HC-SR04 distance sensor", "1 kΩ and 2 kΩ resistors", "LEDs", "Passive buzzer", "Ruler"], moxie: { gates: ["wiring"] }, notes: [
        "Safety gate: check every Echo voltage divider before a pair powers the circuit. Mark it on the Moxie teacher page.",
        "Before publishing: document what happens at exactly 10 cm and 30 cm, and when there's no echo (the code uses 999). No measurement is not the same as a safe distance."] }),
    S(12, "Making Things Move", "build", "Servo positions; map(); brainstorming problems",
      "Controlled servo movement and three capstone problem ideas.",
      "Explain how your code sets the servo's position.",
      { sourceFile: "Session_12_Making_Things_Move.docx", materials: ["SG90 servo", "10 kΩ potentiometer", "Power module (teacher-managed fallback)"], notes: [
        "Validate first: servo power, including the power-module fallback. Check the expected servo travel with your servos."] }),
    S(13, "Capstone: Define & Design", "design", "A user's need; measurable criteria; parts and pins; a circuit and code plan",
      "A design your teacher approved, with three measurable criteria.",
      "Explain who your device helps and how you'll know it works.",
      { sourceFile: "Session_13_Capstone_Define_Design.docx", moxie: { gates: ["design"] }, notes: [
        "Approve each team's design on the Moxie teacher page before they build.",
        "Before publishing: the capstone pin list leaves out pin 2, which Session 1 uses for the built-in LED. Explain the difference to students.",
        "Build time is Sessions 14, 15, and part of 16."] }),
    S(14, "Capstone: Build Sprint", "buildlog", "Testing subsystems; putting them together; debugging",
      "A working subsystem, the build checklist, a bug log, and any changes to the plan.",
      "Explain one bug you found and how you fixed it.",
      { sourceFile: "Session_14_Capstone_Build_Sprint.docx" }),
    S(15, "Capstone: Test & Improve", "testimprove", "Testing against criteria; feedback; revision",
      "Three test results, peer feedback, an improvement, a showcase card, and a pitch plan.",
      "Explain one change you made after testing or feedback, and why.",
      { sourceFile: "Session_15_Capstone_Test_Improve.docx" }),
    S(16, "Capstone Showcase", "showcase", "Demonstration; explanation; reflection",
      "A one-minute pitch, a device demo, feedback, and your own reflection and self-rating.",
      "Explain what you would improve next, and why.",
      { sourceFile: "Session_16_Capstone_Showcase.docx", moxie: { gates: ["pitch"] }, notes: [
        "Mark each team's pitch on the Moxie teacher page once both partners have taken part.",
        "Part of this session is still build time. Keep the showcase private to the class unless you decide otherwise."] })
  ];

  // Only published sessions join the shared library. Drafts are reached through the Moxie pages.
  STEM.activities.push(...STEM.moxieSessions.filter((s) => s.pub === "published"));
})();
