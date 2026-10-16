# STEM Explorers

The classroom dashboard for the **STEM Explorers** program at the **STEM Coliseum and Learning Center**. Teachers and students in grades 2–8 choose an exploration area, find an activity that fits their time and equipment, read the mission, and launch it.

**Choose an exploration area → Select an activity → Understand the mission → Launch the experience.**

## What's included

- **Dashboard** with the six exploration areas, a featured classroom mission, a coding pathway overview, and a searchable activity library.
- **Quick time picker**: "How much time do you have?" with 20, 30, and 45 minutes.
- **Library filters**: topic, experience level, grade band, time, and equipment, plus search, a live result count, an empty state, and Reset filters.
- **Activity pages** with Your mission, What you'll learn, Before you begin, Your steps, Launch activity, Think about it, Take it further, and Teacher notes. VR activities also include setup notes and a way to take part without a headset.
- **Coding pathway** with seven readiness-based stages. Each stage has a prerequisite, learning goal, project, debugging habit, and an "I can" statement.
- **Projector mode** to enlarge everything for a shared screen. This setting is remembered only on that device.


## Interactive labs

Each exploration area has its own leveled, interactive lab that runs inside STEM Explorers, with no outside account or website. Every level teaches one idea, gives a hint on request, checks the student's work, and ends with "What you just learned." Signed-in students earn XP for each level (+30), and lab work counts toward patches and the weekly streak.

| Area | Lab | Levels | What students learn |
| --- | --- | --- | --- |
| Coding & Computer Science | **Rover Code Lab** | 12 | Sequences, debugging with step-through, loops, actions, conditionals (if / if–else), a variable, functions (custom blocks), free build. Levels map to coding pathway stages. |
| Virtual Reality | **Field Station 360** | 5 | Look-around rainforest, desert, and coral reef with compass headings. Observation vs. inference, adaptations, comparing habitats. Works in a VR headset's browser too. |
| Artificial Intelligence | **Pattern Machine Lab** | 6 | Find a pattern, train a real k-nearest-neighbors classifier, see accuracy grow with more examples, uncover biased data, set a confidence threshold, judge responsible uses. Made-up creatures only. |
| Engineering & Robotics | **Launcher Lab** | 6 | Design–test–iterate a catapult: prediction, one-change-at-a-time fair tests, a wall constraint, a budget, an engineering notebook. |
| Engineering & Robotics | **Line Follower Lab** | 4 | Sense → think → act rules for a two-sensor robot, debugging behavior, recovering at sharp corners, speed vs. accuracy. |
| Science & Discovery | **Ramp Racers** | 5 | Predict and test, natural variation and averages, controlling variables, the "does weight matter?" misconception, claim–evidence–reasoning. |
| Creative STEM | **Pixel Animation Studio** | 6 | Pixels, resolution, run-length encoding, frames and fps, and an original animation saved to the student's gallery. |

Each lab also has a library entry with a full teacher guide (mission, objectives, setup, steps, reflection, extension, and facilitation notes). Educators see lab progress per class and per student, including tests run, hints used, and saved animations.

Lab code lives in `assets/js/labs/`. `lab-shell.js` provides the shared layout, hints, completion panel, and progress logging. Each lab registers itself with `SE.labs.register({ id, area, title, tagline, levels, mount })`, so adding a lab means adding one file and one `<script>` tag.

## Accounts and progress (prototype)

**Students** sign in with a class code, by tapping their name, and by tapping three secret pictures from a login card their teacher hands out. They never type an email or password, and the only thing stored about them is a display name (first name and last initial) and a grade band.

**Educators** sign in with an email and password, create classes, add students, and print login cards.

**Try it with the sample class:**

| | |
| --- | --- |
| Educator | `demo@stemexplorers.example` / `explore` |
| Student | class code `ORBIT7` → **Ava R.** → Moon, Comet, Compass |

The sample class has eight made-up students with two and a half weeks of made-up activity, so the educator dashboard has something to show. It is labeled as sample data everywhere it appears, and **Reset sample data** on the dashboard restores it.

### What students get

- **My expedition** home: rank, XP, mission count, patches, weekly streak, suggested next missions, a note from their teacher, and a class goal.
- **Expedition map**: every mission is a star in its area's constellation. Finishing a mission lights its star and connects it to the constellation.
- **Mission checklist**: steps can be checked off, and the page remembers where they stopped.
- **Mission debrief**: answer "Think about it," mark "Take it further" as tried, and say how it went. Then a Mission complete screen shows XP earned, any promotion, and new patches.
- **Ranks**: Cadet → Scout → Navigator → Pathfinder → Trailblazer → Voyager → Mission Commander, each with a chevron insignia.
- **18 mission patches** for things like first mission, reflections, team missions, debugging, each area, pathway stages, and interactive labs.
- **Class expedition**: everyone's XP moves the class from the launch pad to Neptune. It's cooperative, so there's no leaderboard.
- **Coding pathway**: an "I can do this" button sends a stage to the teacher to check.

### What educators get (`#/teach`)

- **Overview**: active students this week, missions this week compared with last week, reflections and "I can" checks waiting, a 14-day chart, which areas the class is exploring, a "needs a check-in" list (inactive for a week, or "still figuring it out" on recent missions), the class goal, a sortable roster, and a live activity log.
- **Student detail**: rank, XP, patches, pathway with Confirm / Not yet, every completed mission with answers and confidence, and a full activity timeline.
- **Pathway checks**: pending "I can" claims and a class-by-stage readiness map.
- **Reflections**: unread answers with a one-line reply that students see on their home screen.
- **Class & logins**: add students, change grade bands, issue new pictures, remove students, create more classes, and print login cards.

### What gets recorded

Each student action is saved as an event: signed in, opened a mission, checked a step, launched a resource, completed a mission (with answer, challenge, and confidence), claimed a pathway stage. Teacher actions are also events: confirmed a stage, said not yet, read or replied to a reflection. XP, ranks, and patches are calculated from the events using the rules in `assets/js/data/progression.js`, so changing a rule updates everyone.

### Before using with real students

This prototype keeps all accounts and activity in the browser's local storage. It works for a demo on one device, but data isn't shared between devices and passwords are only hashed in the browser. To go live:

1. Replace the storage functions in `assets/js/store.js` with a real backend (for example Firebase, Supabase, or your district's sign-in service). The rest of the app only uses the `SE.store` API.
2. Review student-data requirements (COPPA, FERPA, and district policy) and get the approvals your program needs.
3. Keep collecting only display names and grade bands for students.

## Running it

- **One-file version:** run `python tools/build_single_file.py` to create `dist/STEM Explorers.html`. Double-click that file to run the whole app offline, with no server needed. You can copy it to any computer.

It's a static site with no build step and no dependencies.

- **Open locally:** double-click `index.html`, or run `python3 -m http.server` in this folder and visit `http://localhost:8000`.
- **Publish with GitHub Pages:** in the repo, go to **Settings → Pages**, set the source to **Deploy from a branch**, and pick `main` and `/ (root)`.

## Project layout

```
index.html                    Page shell: header, footer, script tags
assets/css/styles.css         All styles. Color and type tokens are at the top.
assets/js/data/areas.js       Exploration areas, levels, grade bands, durations, formats, equipment
assets/js/data/activities.js  The activity library
assets/js/data/pathway.js     The seven coding pathway stages
assets/js/data/progression.js XP rules, ranks, patches, class goal, picture codes
assets/js/core.js             Shared helpers and icons
assets/js/store.js            Accounts, sessions, activity log, sample class (swap for a backend)
assets/js/game.js             Turns the activity log into XP, rank, patches, and pathway status
assets/js/art.js              Insignia, patches, expedition map, class goal track
assets/js/views-*.js          Library, student, sign-in, and educator views
assets/js/main.js             Router and header
```

## Adding an activity

Copy any entry in `assets/js/data/activities.js`, give it a new `id`, and fill in the fields. The new activity appears in the library, its area page, and search automatically.

| Field | Notes |
| --- | --- |
| `id` | Unique, lowercase, hyphenated. Used in the URL: `#/activity/<id>` |
| `title`, `summary` | The summary is one student-friendly sentence for the card |
| `area` | One of `coding`, `vr`, `ai`, `engineering`, `science`, `creative` |
| `level` | `beginner`, `intermediate`, or `advanced` |
| `grades` | Any of `"2-3"`, `"4-5"`, `"6-8"` |
| `duration` | Minutes. Used by the 20/30/45 time filter |
| `format` | `independent`, `collaborative`, or `teacher-led` |
| `equipment` | Keys from `equipment` in `areas.js` (for example, `computer`, `unplugged`, `vr`) |
| `source` | `"original"` shows the "Original STEM Explorers sample lesson" label |
| `featured` | `true` on one activity makes it the featured classroom mission |
| `pathwayStage` | Optional. Links a coding activity to a pathway stage (1–7) |
| `keywords` | Extra words for search |
| `access` | `account` (`none`, `optional`, `required`), optional `accountNote`, `cost` (`free`, `paid`), `supervision` (true/false), `hardware` (list of strings) |
| `launch` | See below |
| `mission`, `learn`, `before`, `steps`, `reflect`, `extend`, `teacherNotes` | Activity page content. `before` has `materials`, `setup`, `prerequisites` |
| `vr` | VR only: `setup` (teacher notes) and `nonHeadset` (how to take part without a headset) |

### Launch links

- `{ status: "ready", label, url, provider, note }` shows a **Launch activity** button that opens in a new tab.
- `{ status: "coming-soon", note }` shows **Resource coming soon**. Use this until a resource has been chosen and checked. Don't add placeholder links.
- `{ status: "none" }` marks a hands-on activity whose full directions are on the page.

Check every external link before adding it, and record whether it needs an account, costs money, or needs special hardware.

## External resources in this version

| Resource | Used by | Notes |
| --- | --- | --- |
| [Blockly Games: Maze](https://blockly.games/maze) | Robot Maze Mission | Free, no account |
| [Scratch editor](https://scratch.mit.edu/projects/editor/) | Several coding and creative activities | Free; an account is needed only to save online |
| [Teachable Machine](https://teachablemachine.withgoogle.com/) | Train a Classroom Model | Free; teacher-run on a single computer |
| [Code.org AI for Oceans](https://code.org/oceans) | Clean the Ocean with AI | Free; sign-in is optional |
| [Google Earth](https://earth.google.com/web/) | Explore a Virtual Ecosystem | Free; works best in Chrome |

Two activities are marked **Resource coming soon** until the program picks a resource: the 360° Notice & Wonder Challenge (needs a 360° scene) and Stop-Motion Story Studio (needs a stop-motion app). The ecosystem field trip uses Google Earth now and still needs a headset experience.

## Accessibility

Keyboard navigation with visible focus, a skip link, focus moved to the page heading on each view, touch targets of at least 44px, and experience levels shown with filled squares and a text label so meaning never relies on color alone. The site follows the device's light or dark setting.
