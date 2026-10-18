<p><img src="assets/img/brand/stem207-logo.svg" alt="STEM 207" width="420"></p>

# STEM 207

**Live site:** https://mattjones1.github.io/stem_207/

**Maine's STEM explorer for grades 2–8.** Teachers and students choose an exploration area, find an activity that fits their time and equipment, read the mission, and launch it. The content is rooted in Maine: lobster boats and tide pools, the North Woods and Katahdin, sugarhouses, nor'easters, and fall fairs.

**Choose an exploration area → Select an activity → Understand the mission → Launch the experience.**

## What's included

- **Dashboard** with the six exploration areas, a featured classroom mission, a coding pathway overview, and a searchable activity library.
- **Quick time picker**: "How much time do you have?" with 20, 30, and 45 minutes.
- **Library filters**: topic, experience level, grade band, time, and equipment, plus search, a live result count, an empty state, and Reset filters.
- **Activity pages** with Your mission, What you'll learn, Before you begin, Your steps, Launch activity, Think about it, Take it further, and Teacher notes. VR activities also include setup notes and a way to take part without a headset.
- **Coding pathway** with seven readiness-based stages. Each stage has a prerequisite, learning goal, project, debugging habit, and an "I can" statement.
- **Projector mode** to enlarge everything for a shared screen. This setting is remembered only on that device.


## Interactive labs

Each exploration area has its own leveled, interactive lab that runs inside STEM 207, with no outside account or website. Every level teaches one idea, gives a hint on request, checks the student's work, and ends with "What you just learned." Signed-in students earn XP for each level (+30), and lab work counts toward patches and the weekly streak.

| Area | Lab | Levels | What students learn |
| --- | --- | --- | --- |
| Coding & Computer Science | **Harbor Code Lab** | 36 | Three voyages of 12 levels (Casco Bay, Penobscot Bay, Down East). Steer a lobster boat: haul and set traps, dodge granite ledges, find the mooring in fog. Sequences, debugging with step-through, loops, actions, conditionals (if / if–else), a variable, functions (custom blocks), free build. Levels map to coding pathway stages. |
| Virtual Reality | **Field Station 360** | 7 | Look-around Gulf of Maine tide pools and a North Woods pond below Katahdin, then a rainforest, desert, and coral reef, with compass headings. Observation vs. inference, adaptations, comparing five habitats. Works in a VR headset's browser too. |
| Artificial Intelligence | **Pattern Machine Lab** | 6 | Find a pattern, train a real k-nearest-neighbors classifier, see accuracy grow with more examples, uncover biased data, set a confidence threshold, judge responsible uses (including counting puffins and sorting wild blueberries). Made-up creatures only. |
| Engineering & Robotics | **Pumpkin Launcher Lab** | 6 | Design–test–iterate a catapult for a fall-fair pumpkin toss: prediction, one-change-at-a-time fair tests, a hay-bale constraint, a budget, an engineering notebook. |
| Engineering & Robotics | **Snowplow Robot Lab** | 4 | After a nor'easter, sense → think → act rules for a two-sensor robot plow: debugging behavior, recovering at sharp corners, speed vs. accuracy. |
| Science & Discovery | **Sled Hill Science** | 5 | A model sledding hill: predict and test, natural variation and averages, controlling variables (powder, packed snow, ice), the "does weight matter?" misconception, claim–evidence–reasoning. |
| Creative STEM | **Pixel Animation Studio** | 6 | Pixels, resolution, run-length encoding (decode a lighthouse), frames and fps, and an original animation saved to the student's gallery. |

Each lab also has a library entry with a full teacher guide (mission, objectives, setup, steps, reflection, extension, and facilitation notes). Educators see lab progress per class and per student, including tests run, hints used, and saved animations.

Lab ids (`rover`, `launcher`, `line-follower`, `ramp-racers`) are kept from earlier versions so saved progress carries over. Lab code lives in `assets/js/labs/`. `lab-shell.js` provides the shared layout, hints, completion panel, and progress logging. Each lab registers itself with `SE.labs.register({ id, area, title, tagline, levels, chapters?, mount })` (optional `chapters` group levels into voyages, as in the Harbor Code Lab), so adding a lab means adding one file and one `<script>` tag.

## Accounts and progress (prototype)

**Students** sign in with a class code, by tapping their name, and by tapping three secret pictures from a login card their teacher hands out. They never type an email or password, and the only thing stored about them is a display name (first name and last initial) and a grade band.

**Educators** sign in with an email and password, create classes, add students, and print login cards.

**Try it with the sample class:**

| | |
| --- | --- |
| Educator | `demo@stem207.example` / `explore` |
| Student | class code `MOOSE7` → **Ava R.** → Pine tree, Lighthouse, Moon |

The sample class has eight made-up students with two and a half weeks of made-up activity, so the educator dashboard has something to show. It is labeled as sample data everywhere it appears, and **Reset sample data** on the dashboard restores it.

### What students get

- **My expedition** home: rank, XP, mission count, patches, weekly streak, suggested next missions, a note from their teacher, and a class goal.
- **Expedition map**: the Maine night sky over a North Woods treeline. Every mission is a star in its area's constellation. Finishing a mission lights its star and connects it to the constellation.
- **Mission checklist**: steps can be checked off, and the page remembers where they stopped.
- **Mission debrief**: answer "Think about it," mark "Take it further" as tried, and say how it went. Then a Mission complete screen shows XP earned, any promotion, and new patches.
- **Ranks**: Deckhand → Tidepooler → Trail Scout → Lighthouse Keeper → Harbor Pilot → Ridge Runner → Katahdin Guide, each with a chevron insignia.
- **18 mission patches** for things like first mission, reflections, team missions, debugging, each area, pathway stages, and interactive labs.
- **Class expedition**: everyone's XP moves the class across Maine, from Kittery to Portland Head, Penobscot Bay, Acadia, Moosehead, and the summit of Katahdin. It's cooperative, so there's no leaderboard.
- **Coding pathway**: an "I can do this" button sends a stage to the teacher to check.

### What educators get (`#/teach`)

- **Missions**: the whole library organized by discipline (Coding pathway, Coding, Virtual Reality, AI, Engineering, Science, Creative). Filter by grade band, time, or Made in Maine; see how many students have finished each mission; and **Assign** missions to the class, one at a time or a whole pathway stage at once. Add due dates in the Assigned list. Assigned missions show first on every student's home screen and are tagged on the mission page. You can also assign from any mission page.
- **Overview**: active students this week, missions this week compared with last week, reflections and "I can" checks waiting, a 14-day chart, which areas the class is exploring, a "needs a check-in" list (inactive for a week, or "still figuring it out" on recent missions), the class goal, a sortable roster, and a live activity log.
- **Student detail**: rank, XP, patches, pathway with Confirm / Not yet, every completed mission with answers and confidence, and a full activity timeline.
- **Pathway checks**: pending "I can" claims and a class-by-stage readiness map.
- **Reflections**: unread answers with a one-line reply that students see on their home screen.
- **Class & logins**: add students, change grade bands, issue new pictures, remove students, create more classes, and print login cards.

### What gets recorded

Each student action is saved as an event: signed in, opened a mission, checked a step, launched a resource, completed a mission (with answer, challenge, and confidence), claimed a pathway stage. Teacher actions are also events: confirmed a stage, said not yet, read or replied to a reflection. XP, ranks, and patches are calculated from the events using the rules in `assets/js/data/progression.js`, so changing a rule updates everyone.

## Back end (Supabase, free)

STEM 207 runs in one of two modes, chosen by `assets/js/config.js`:

| | Local mode (default) | Cloud mode |
| --- | --- | --- |
| Turn on by | Leaving `config.js` empty | Pasting a Supabase URL and publishable key into `config.js` |
| Where data lives | This browser only | Your Supabase Postgres database, shared across every device |
| Educator passwords | Hashed in the browser | Handled by Supabase Auth |
| Student sign-in | Checked in the browser | Checked by the database; 8 wrong tries in 10 minutes pauses sign-in |
| Sample class | Built in (`demo@stem207.example`) | Any educator can add one from **Class & logins** |
| Works offline | Always | Keeps working; changes save when the connection returns |

### Set up the free back end (about 10 minutes)

1. Create a free account at [supabase.com](https://supabase.com) and click **New project**. Pick a region near Maine (for example US East) and save the database password somewhere safe.
2. In the project, open **SQL Editor → New query**, paste all of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. (Already set up before assigned missions were added? Run [`supabase/update-2-assignments.sql`](supabase/update-2-assignments.sql) once.) It creates the tables, the security rules, and the student sign-in functions. Running it again is safe.
3. Open **Authentication → Sign In / Providers → Email** and turn off **Confirm email** while you're prototyping, so new educator accounts work right away. (If you leave it on, teachers must click the link in a confirmation email first. In that case, set **Authentication → URL Configuration → Site URL** to wherever your site lives.)
4. Open **Project Settings → API Keys**. Copy the **Project URL** and the **publishable** key (older projects call it the **anon public** key) into `assets/js/config.js`. Never use a secret or `service_role` key here.
5. Commit and push. GitHub Pages serves the site with the back end on. To make the one-file version use it too, run `python tools/build_single_file.py` again.
6. Open the site, choose **I'm an educator → Create an educator account**, then add students or **Add a sample class** to explore the dashboard with made-up data.

Free projects pause after about a week with no activity. If that happens, open the project in the Supabase dashboard and click **Restore**.

### How it works

- `supabase/schema.sql` defines five tables (`educators`, `classes`, `students`, `events`, plus private `student_sessions` and `sign_in_attempts`) with row-level security. Each educator can read and change only their own classes, students, and events.
- Students never get a Supabase account. They sign in through database functions (`class_roster`, `student_sign_in`, `student_state`, `student_log`, `student_sign_out`) that check the picture code on the server and hand back a 7-day session token. Picture codes are visible only to the student's educator.
- `assets/js/cloud.js` is a small client for Supabase Auth, REST, and RPC with no extra libraries, so the app still runs as plain files.
- `assets/js/store.js` keeps the same `SE.store` API in both modes. In cloud mode it loads the signed-in person's data once, serves every screen from memory, and sends each change to the server in order in the background, retrying if the connection drops.
- `tests/backend/` has a Supabase stand-in for testing the rules and sync on plain Postgres. See its README.

### Before using with real students

1. Review student-data requirements (COPPA, FERPA, Maine student privacy law, and district policy) and get the approvals your program needs. Supabase's free tier is meant for prototypes; a district rollout should use a paid plan with a data processing agreement.
2. Keep collecting only display names and grade bands for students.
3. Keep **Confirm email** on once real educators are signing up.

## Made in Maine

Eight original activities are rooted in Maine, alongside the five Maine-themed labs:

| Activity | Area | What students do |
| --- | --- | --- |
| Lobster Trap Logic | Coding | Write if–else rules for Maine's lobster size, egg, and V-notch rules (featured mission) |
| Acadia from Above | Virtual Reality | Fly over Acadia in Google Earth and read glacier clues |
| Blueberry Sorting Machine | AI | Train a human "machine" to sort wild blueberries, then catch it missing examples |
| Lighthouse Beam Challenge | Engineering | Build a foil reflector that focuses a flashlight beam |
| Float a Wind Turbine | Engineering | Keep a model floating turbine upright in waves, like UMaine's VolturnUS |
| Tide Watchers: Portland vs. Eastport | Science | Graph a day of tides at two harbors and explain the difference |
| Sap Run Detectives | Science | Find the freeze–thaw pattern in sugarhouse data and do the 40-to-1 syrup math |
| Animated Maine Postcard | Creative | Animate a favorite Maine place in Scratch |

## Running it

- **One-file version:** run `python tools/build_single_file.py` to create `dist/STEM 207.html`. Double-click that file to run the whole app offline, with no server needed. You can copy it to any computer.

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
assets/js/config.js           Back-end settings: empty = local mode, Supabase URL + key = cloud mode
assets/js/cloud.js            Small Supabase client (Auth, REST, RPC)
assets/js/store.js            Accounts, sessions, activity log, sample class, cloud sync
supabase/schema.sql           Database tables, security rules, and student sign-in functions
tests/backend/                Supabase stand-in for testing cloud mode on plain Postgres
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
| `source` | `"original"` shows the "Original STEM 207 lesson" label |
| `keywords` containing `"maine"` | Shows the **Made in Maine** tag and adds the activity to the dashboard's Made in Maine rail |
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

## Brand

The STEM 207 wordmark lives in `assets/img/brand/`: `stem207-logo.svg` (the vector master), `stem207-logo-reverse.svg` (white letters for dark backgrounds), `stem207-mark.svg` (the Maine "0" on an indigo tile, used as the favicon), and `stem207-pine.svg` (the pine from the M). In the app, `assets/js/brand.js` draws the same artwork inline so the letters can turn white in dark mode. Brand colors are indigo `#302568` and lime `#8CC832`. Headings use Montserrat and body text uses Atkinson Hyperlegible. Color tokens live at the top of `assets/css/styles.css`.

Maine design touches: a pine-ridge edge cut from the logo's own pine (on the hero, student home, star map, and footer), a coastal hero scene with a working lighthouse beam and one lobster buoy per exploration area, and a fog-white page background.

## Accessibility

Keyboard navigation with visible focus, a skip link, focus moved to the page heading on each view, touch targets of at least 44px, and experience levels shown with filled squares and a text label so meaning never relies on color alone. The site follows the device's light or dark setting.
