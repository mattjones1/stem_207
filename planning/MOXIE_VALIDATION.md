# Moxie: validation backlog

From section 9 of `planning/MOXIE_PLAN.md`. **Nothing here is validated yet.** Fill in "Tested on / by" only after a real test, with the board, software versions, and date. A session can't move to `pub: "pilot"` until every "Before pilot" item that affects it is signed off.

Owner roles: **Hardware** (an instructor who builds and runs the circuits), **Curriculum** (reviews pedagogy and wording), **Program** (decides scope, permissions, and publication).

| # | Priority | Sessions | Item | Owner | Status | Tested on / by |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Before pilot | 1, all | Name the exact supported ESP32 board and connector. Match the diagrams (pin 2 built-in LED; D, RX2, TX2 labels) to the real kits and document any variants. | Hardware | Open | |
| 2 | Before pilot | all | Write a tested setup guide: Arduino IDE version, ESP32 board package, drivers, libraries, and device restrictions (school laptops, Chromebooks). | Hardware | Open | |
| 3 | Before pilot | 4, 8, 9, 12 | Compile and run every core and stretch sketch (PWM, tone, display, servo) with the chosen board package and libraries. Test combined capstone parts. | Hardware | Open | |
| 4 | Before pilot | 4 | Replace the RGB stretch's guessed wiring with instructions for the confirmed RGB part and matching code. | Hardware | Open | |
| 5 | Before pilot | 11, 12 | Keep the Echo voltage divider check (now a teacher gate on the site). Write exact sensor and servo power instructions, including the power-module fallback. | Hardware | Open | |
| 6 | Before pilot | 1–12 | Check every "copy it hole for hole" diagram against its wiring table and a real breadboard. Write each wiring table as text for the site. | Hardware | Open | |
| 7 | Before publication | 6 | Add release handling to the teacher solution for the press-and-release stretch, and test the sequence. | Hardware | Open | |
| 8 | Before publication | 8 | Decide what happens to a press during green, yellow, red, and WALK (chirps use plain delays). Test each one and explain it. | Hardware + Curriculum | Open | |
| 9 | Before publication | 10 | Test real buttons. Separate edge detection from debounce in the troubleshooting, and add a tested debounce explanation if needed. | Hardware | Open | |
| 10 | Before publication | 11 | Document behavior at exactly 10 cm and 30 cm, and with no echo (999). "No measurement" isn't a safe distance. | Hardware + Curriculum | Open | |
| 11 | Before publication | 1, 13 | Explain why the capstone pin list leaves out pin 2 when Session 1 uses its built-in LED. | Curriculum | Open | |
| 12 | Before publication | 1, 13, all | Record exact provenance (STEM Coliseum Arduino Introduction; STEM Coliseum Challenges #3 and 7c; TeachEngineering: An Arduino Warning System) and confirm reuse permission for text, diagrams, and code. | Program | **Done** (October 22, 2026): permission confirmed by Program. The 16 sheets are on the site as pilot course material; each session shows its "Based on" line. | Program, Oct 22, 2026 |
| 13 | Before publication | all | Set grade range and minutes per session from a pilot. Write the missing rubric levels (only "Meets", 3 of 4, exists). Write answer keys for the private teacher kit. | Curriculum + Program | Open | |
| 14 | Review | 7, 9, 12, all | Check the simplified analog voltage examples, servo travel, OLED address troubleshooting, and every optional extension against the actual kit. | Hardware | Open | |
| 15 | Review | all | Build the bill of materials per pair: models, quantities, spares, storage, and whether circuits stay built between sessions. No purchasing list from the worksheets alone. | Program + Hardware | Open | |

## Moving a session forward

1. Fill in the record in `assets/js/data/moxie.js`: `steps`, `wiring`, `code` (keep the `____` blanks), `tests`, `stretch`, `diagram` (with `alt` and a `text` version), `grades`, and `duration` or `time`. Only after item 12 is signed off.
2. `SE.moxie.readyToPublish(session)` must return an empty list.
3. Set `pub` to `"pilot"`. It's visible only to classes the teacher assigns it to.
4. After the pilot, set `time.verified: true`, update the content, bump `version` if requirements changed, and set `pub: "published"`.
