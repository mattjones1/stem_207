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

There are no student accounts, no tracking, and no student information collected.

## Running it

It's a static site with no build step and no dependencies.

- **Open locally:** double-click `index.html`, or run `python3 -m http.server` in this folder and visit `http://localhost:8000`.
- **Publish with GitHub Pages:** in the repo, go to **Settings → Pages**, set the source to **Deploy from a branch**, and pick `main` and `/ (root)`.

## Project layout

```
index.html                    Page shell: header, footer, script tags
assets/css/styles.css         All styles. Color and type tokens are at the top.
assets/js/app.js              Router and views (dashboard, area, activity, pathway)
assets/js/data/areas.js       Exploration areas, levels, grade bands, durations, formats, equipment
assets/js/data/activities.js  The activity library
assets/js/data/pathway.js     The seven coding pathway stages
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
