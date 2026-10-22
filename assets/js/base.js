/*
 * STEM 207 — the student's own explorer and home harbor.
 *
 *   SE.base.avatar(look, size)       an illustrated explorer (never a photo)
 *   SE.base.harbor(prof, custom)     the student's harbor scene, which grows as they learn
 *   SE.base.unlocks(prof)            which gear and harbor items a student has earned
 *   SE.base.customFor(studentId)     the student's saved choices (from their activity log)
 *   SE.views.base(user)              the "My harbor" page (#/base)
 *
 * Choices are saved as "profile_custom" events, so they work in local and cloud mode
 * with no extra storage. Boat names are built from word lists, so students never type
 * free text or personal information.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const STEM = window.STEM;
  const P = STEM.progression;
  const { icon, esc } = SE;
  const app = () => document.getElementById("app");
  const rankIdx = (id) => P.ranks.findIndex((r) => r.id === id);

  /* ───────── Unlock rules ───────── */
  // need: { rank } | { patch } | { activities } | { labLevels } | { xp } | null (always open)
  const need = {
    rank: (id) => ({ rank: id }), patch: (id) => ({ patch: id }), missions: (n) => ({ missions: n }), labs: (n) => ({ labLevels: n })
  };
  function isOpen(n, prof) {
    if (!n) return true;
    if (!prof) return false;
    if (n.rank) return prof.index >= rankIdx(n.rank);
    if (n.patch) return !!(prof.patches.find((p) => p.patch.id === n.patch) || {}).earned;
    if (n.missions) return prof.counts.missions >= n.missions;
    if (n.labLevels) return (prof.counts.labLevelsDone || 0) >= n.labLevels;
    if (n.xp) return prof.xp >= n.xp;
    return false;
  }
  function howTo(n) {
    if (!n) return "";
    if (n.rank) return `Reach ${P.ranks[rankIdx(n.rank)].name}`;
    if (n.patch) { const p = P.patches.find((x) => x.id === n.patch); return p ? `Earn the ${p.name} patch` : "Earn a patch"; }
    if (n.missions) return `Pass ${n.missions} activities`;
    if (n.labLevels) return `Finish ${n.labLevels} lab levels`;
    if (n.xp) return `Earn ${SE.num(n.xp)} XP`;
    return "";
  }
  function progressTo(n, prof) {
    if (!n || !prof) return null;
    if (n.rank) { const r = P.ranks[rankIdx(n.rank)]; return { have: prof.xp, want: r.xp, unit: "XP" }; }
    if (n.patch) { const p = prof.patches.find((x) => x.patch.id === n.patch); return p ? { have: p.progress, want: p.target, unit: "" } : null; }
    if (n.missions) return { have: prof.counts.missions, want: n.missions, unit: "activities passed" };
    if (n.labLevels) return { have: prof.counts.labLevelsDone || 0, want: n.labLevels, unit: "levels" };
    return null;
  }

  /* ───────── Avatar parts ───────── */
  const SKIN = ["#f6d7c3", "#eac0a0", "#d39b78", "#b07552", "#8a5a3c", "#5e3b26"];
  const HAIR_COLORS = ["#2b2118", "#5a3825", "#8e5a2b", "#c99a4f", "#e8d39a", "#a33b2a", "#6b6f7a", "#3f5fa8"];
  const HAIR = [
    { id: "short", name: "Short" }, { id: "curly", name: "Curly" }, { id: "long", name: "Long" },
    { id: "bun", name: "Top bun" }, { id: "braids", name: "Braids" }, { id: "buzz", name: "Buzz" }, { id: "puffs", name: "Puffs" }
  ];
  const HATS = [
    { id: "none", name: "No hat" },
    { id: "beanie", name: "Wool beanie" },
    { id: "cap", name: "Ball cap" },
    { id: "souwester", name: "Sou'wester", need: need.rank("tidepooler"), about: "The yellow rain hat Maine fishermen wear in a storm." },
    { id: "ranger", name: "Ranger hat", need: need.rank("trail-scout"), about: "For long days on the trail." },
    { id: "keeper", name: "Keeper's cap", need: need.rank("keeper"), about: "Lighthouse keepers kept the light burning all night." },
    { id: "captain", name: "Captain's cap", need: need.rank("harbor-pilot"), about: "Only harbor pilots wear this one." },
    { id: "helmet", name: "Summit helmet", need: need.rank("katahdin"), about: "For the climb to Baxter Peak." }
  ];
  const JACKETS = [
    { id: "indigo", name: "Indigo", c: "#012d2b" },
    { id: "red", name: "Red", c: "#c9302c" },
    { id: "spruce", name: "Spruce", c: "#2f5d3a" },
    { id: "harbor", name: "Harbor blue", c: "#24476b" },
    { id: "buoy", name: "Buoy orange", c: "#e9822b", need: need.rank("tidepooler") },
    { id: "lime", name: "STEM 207 lime", c: "#94c93d", need: need.rank("trail-scout") },
    { id: "plaid", name: "Woods plaid", c: "#b5302c", pattern: "plaid", need: need.patch("wide-horizon") },
    { id: "stripes", name: "Lighthouse stripes", c: "#f4f2ea", pattern: "stripes", need: need.rank("keeper") },
    { id: "slicker", name: "Fisher's slicker", c: "#f2c14e", need: need.patch("crew") }
  ];
  const GEAR = [
    { id: "none", name: "None" },
    { id: "glasses", name: "Glasses" },
    { id: "compass", name: "Compass necklace", need: need.patch("first-launch") },
    { id: "binoculars", name: "Binoculars", need: need.patch("sector-vr") },
    { id: "headlamp", name: "Headlamp", need: need.patch("lab-explorer") },
    { id: "goggles", name: "Builder's goggles", need: need.patch("sector-engineering") },
    { id: "headset", name: "VR headset", need: need.patch("sector-ai") }
  ];
  const BACKS = [
    { id: "sky", name: "Clear sky", c: "#bfe0f2" },
    { id: "fog", name: "Sea smoke", c: "#dfe5e8" },
    { id: "sunset", name: "Sunset", c: "#f6c48f" },
    { id: "pine", name: "Pine", c: "#b9d8a8" },
    { id: "night", name: "Night", c: "#012d2b", need: need.missions(5) },
    { id: "aurora", name: "Northern lights", c: "#01201e", aurora: true, need: need.rank("ridge-runner") }
  ];
  const DEFAULT_LOOK = { skin: 2, hair: "short", hairColor: 1, hat: "beanie", jacket: "indigo", gear: "none", back: "sky" };

  const find = (list, id) => list.find((x) => x.id === id) || list[0];

  function avatar(look = {}, size = 64, opts = {}) {
    const L = { ...DEFAULT_LOOK, ...look };
    const skin = SKIN[L.skin] || SKIN[2];
    const hairC = HAIR_COLORS[L.hairColor] || HAIR_COLORS[1];
    const jacket = find(JACKETS, L.jacket);
    const back = find(BACKS, L.back);
    const uid = `av${Math.random().toString(36).slice(2, 8)}`;
    const hairBack = { long: `<path d="M35 52 C33 76 36 92 44 96 L76 96 C84 92 87 76 85 52 Z" fill="${hairC}"/>`, braids: `<rect x="31" y="54" width="9" height="34" rx="4.5" fill="${hairC}"/><rect x="80" y="54" width="9" height="34" rx="4.5" fill="${hairC}"/><circle cx="35.5" cy="91" r="4" fill="#e9603f"/><circle cx="84.5" cy="91" r="4" fill="#e9603f"/>`, puffs: `<circle cx="34" cy="38" r="13" fill="${hairC}"/><circle cx="86" cy="38" r="13" fill="${hairC}"/>` }[L.hair] || "";
    const hairFront = {
      short: `<path d="M37 54 C35 34 48 27 60 27 C73 27 85 34 83 54 C80 45 71 40 60 41 C49 41 40 46 37 54 Z" fill="${hairC}"/>`,
      curly: `<g fill="${hairC}">${[[40, 44, 8], [47, 35, 8], [57, 30, 9], [68, 31, 9], [77, 37, 8], [82, 46, 7], [38, 52, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>`,
      long: `<path d="M37 56 C35 34 48 27 60 27 C73 27 85 34 83 56 C76 44 66 38 58 39 C50 40 42 46 37 56 Z" fill="${hairC}"/>`,
      bun: `<circle cx="60" cy="24" r="9" fill="${hairC}"/><path d="M37 54 C35 34 48 29 60 29 C73 29 85 34 83 54 C80 45 71 41 60 42 C49 42 40 46 37 54 Z" fill="${hairC}"/>`,
      braids: `<path d="M37 55 C35 34 48 27 60 27 C73 27 85 34 83 55 C79 44 70 39 60 39 C50 39 41 44 37 55 Z" fill="${hairC}"/><path d="M60 28 V40" stroke="${skin}" stroke-width="1.5" opacity=".5"/>`,
      buzz: `<path d="M38 50 C38 34 49 30 60 30 C71 30 82 34 82 50 C78 43 70 40 60 40 C50 40 42 43 38 50 Z" fill="${hairC}" opacity=".85"/>`,
      puffs: `<path d="M38 52 C37 36 48 30 60 30 C72 30 83 36 82 52 C78 44 70 41 60 41 C50 41 42 44 38 52 Z" fill="${hairC}"/>`
    }[L.hair] || "";
    const hat = {
      none: "",
      beanie: `<path d="M36 48 C36 30 48 23 60 23 C72 23 84 30 84 48 Z" fill="#c9302c"/><rect x="34" y="44" width="52" height="9" rx="4" fill="#9e2422"/><circle cx="60" cy="21" r="6" fill="#f4f2ea"/><path d="M44 30 V44 M52 26 V44 M60 25 V44 M68 26 V44 M76 30 V44" stroke="#9e2422" stroke-width="1.5" opacity=".5"/>`,
      cap: `<path d="M37 47 C37 30 48 25 60 25 C72 25 83 30 83 47 Z" fill="#012d2b"/><path d="M60 47 L95 47 Q97 51 92 52 L60 52 Z" fill="#01201e"/><circle cx="60" cy="26" r="2.5" fill="#94c93d"/><path d="M50 36 h20" stroke="#94c93d" stroke-width="3" stroke-linecap="round"/>`,
      souwester: `<path d="M38 46 C38 28 49 22 60 22 C71 22 82 28 82 46 Z" fill="#f2c14e"/><path d="M24 50 Q60 36 96 50 L100 57 Q60 46 20 57 Z" fill="#e3a92b"/><path d="M60 22 V44" stroke="#c99327" stroke-width="1.5"/>`,
      ranger: `<path d="M40 44 C40 30 50 22 60 22 C70 22 80 30 80 44 Z" fill="#a98450"/><path d="M50 26 Q60 32 70 26" stroke="#7b5e36" stroke-width="2" fill="none"/><ellipse cx="60" cy="46" rx="34" ry="6" fill="#8b6a3e"/><rect x="40" y="40" width="40" height="5" fill="#2f5d3a"/>`,
      keeper: `<path d="M38 46 C38 32 48 27 60 27 C72 27 82 32 82 46 Z" fill="#01201e"/><rect x="36" y="44" width="48" height="6" rx="2" fill="#111"/><path d="M60 50 L86 50 Q88 54 84 55 L60 55 Z" fill="#111"/><path d="M54 37 l6 -5 l6 5 l-2 4 h-8 Z" fill="#f2c14e"/>`,
      captain: `<path d="M36 44 C36 30 48 25 60 25 C72 25 84 30 84 44 Z" fill="#f7f6f0"/><rect x="36" y="42" width="48" height="7" fill="#01201e"/><path d="M38 49 Q60 58 82 49 L80 52 Q60 61 40 52 Z" fill="#111"/><path d="M53 35 Q60 29 67 35 Q60 40 53 35 Z" fill="#94c93d"/><path d="M36 42 h48" stroke="#f2c14e" stroke-width="1.5"/>`,
      helmet: `<path d="M35 50 C35 28 47 22 60 22 C73 22 85 28 85 50 Z" fill="#e9822b"/><path d="M60 22 V50 M46 26 Q44 38 46 50 M74 26 Q76 38 74 50" stroke="#c4621e" stroke-width="2" fill="none"/><rect x="33" y="47" width="54" height="5" rx="2.5" fill="#c4621e"/>`
    }[L.hat] || "";
    const gear = {
      none: "",
      glasses: `<g fill="none" stroke="#01201e" stroke-width="2.2"><circle cx="51" cy="58" r="6"/><circle cx="69" cy="58" r="6"/><path d="M57 58 h6"/></g>`,
      compass: `<path d="M52 84 L60 96 L68 84" fill="none" stroke="#c99a4f" stroke-width="1.5"/><circle cx="60" cy="100" r="7" fill="#f2c14e" stroke="#8e5a2b" stroke-width="1.5"/><path d="M60 95 l2 5 l-2 5 l-2 -5 Z" fill="#c9302c"/>`,
      binoculars: `<path d="M48 84 Q60 96 72 84" fill="none" stroke="#111" stroke-width="1.5"/><rect x="49" y="94" width="9" height="13" rx="3" fill="#2b2b2b"/><rect x="62" y="94" width="9" height="13" rx="3" fill="#2b2b2b"/><rect x="57" y="97" width="6" height="5" fill="#444"/>`,
      headlamp: `<rect x="35" y="41" width="50" height="5" rx="2.5" fill="#2b2b2b"/><circle cx="60" cy="43" r="5" fill="#fff4b0" stroke="#2b2b2b" stroke-width="2"/>`,
      goggles: `<rect x="36" y="38" width="48" height="5" fill="#2b2b2b"/><rect x="43" y="34" width="14" height="11" rx="5" fill="#8fd3e8" stroke="#2b2b2b" stroke-width="2"/><rect x="63" y="34" width="14" height="11" rx="5" fill="#8fd3e8" stroke="#2b2b2b" stroke-width="2"/>`,
      headset: `<rect x="40" y="50" width="40" height="14" rx="6" fill="#012d2b"/><rect x="44" y="53" width="32" height="8" rx="4" fill="#94c93d" opacity=".85"/><path d="M38 56 h-2 M82 56 h2" stroke="#012d2b" stroke-width="3"/>`
    }[L.gear] || "";
    const pattern = jacket.pattern === "plaid"
      ? `<pattern id="${uid}p" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#b5302c"/><path d="M0 5 H10 M5 0 V10" stroke="#01201e" stroke-width="2.5" opacity=".55"/><path d="M0 2 H10" stroke="#01201e" stroke-width=".8" opacity=".4"/></pattern>`
      : jacket.pattern === "stripes" ? `<pattern id="${uid}p" width="10" height="12" patternUnits="userSpaceOnUse"><rect width="10" height="12" fill="#f4f2ea"/><rect width="10" height="6" fill="#c9302c"/></pattern>` : "";
    const fill = jacket.pattern ? `url(#${uid}p)` : jacket.c;
    const aurora = back.aurora ? `<path d="M0 30 Q30 10 60 28 T120 20 V50 Q90 40 60 55 T0 45 Z" fill="#94c93d" opacity=".45"/><path d="M0 50 Q40 30 70 45 T120 38 V60 Q80 52 50 66 T0 62 Z" fill="#5fd3c0" opacity=".3"/>` : "";
    const label = opts.label ? `role="img" aria-label="${esc(opts.label)}"` : 'aria-hidden="true"';
    return `<svg class="avatar ${opts.cls || ""}" viewBox="0 0 120 120" width="${size}" height="${size}" ${label}>
      <defs><clipPath id="${uid}c"><circle cx="60" cy="60" r="60"/></clipPath>${pattern}</defs>
      <g clip-path="url(#${uid}c)">
        <rect width="120" height="120" fill="${back.c}"/>${aurora}
        ${hairBack}
        <path d="M14 124 C16 96 38 86 60 86 C82 86 104 96 106 124 Z" fill="${fill}"/>
        <path d="M60 88 V124" stroke="#000" stroke-opacity=".18" stroke-width="2"/>
        <path d="M50 86 L60 98 L70 86" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="2"/>
        <rect x="52" y="72" width="16" height="16" rx="5" fill="${skin}"/>
        <circle cx="38" cy="59" r="5" fill="${skin}"/><circle cx="82" cy="59" r="5" fill="${skin}"/>
        <ellipse cx="60" cy="56" rx="22" ry="25" fill="${skin}"/>
        ${hairFront}
        <circle cx="51.5" cy="59" r="2.8" fill="#0a2b29"/><circle cx="68.5" cy="59" r="2.8" fill="#0a2b29"/>
        <circle cx="52.4" cy="58" r=".9" fill="#fff"/><circle cx="69.4" cy="58" r=".9" fill="#fff"/>
        <circle cx="46" cy="66" r="3.5" fill="#e9603f" opacity=".18"/><circle cx="74" cy="66" r="3.5" fill="#e9603f" opacity=".18"/>
        <path d="M53 68 Q60 74 67 68" fill="none" stroke="#0a2b29" stroke-width="2.2" stroke-linecap="round"/>
        ${hat}${gear}
      </g>
    </svg>`;
  }

  /* ───────── Boats and buoys ───────── */
  const BUOY_COLORS = ["#e9603f", "#f2c14e", "#94c93d", "#3f7fc9", "#ffffff", "#012d2b", "#c9302c", "#2f5d3a"];
  const HULLS = ["#f7f6f0", "#c9302c", "#2f5d3a", "#24476b", "#012d2b", "#f2c14e"];
  const NAME_A = ["Lucky", "Salty", "Foggy", "Brave", "Steady", "Northern", "Swift", "Quiet", "Sunny", "Bold", "Wicked Good", "Gentle"];
  const NAME_B = ["Gull", "Puffin", "Loon", "Lobster", "Tide", "Ledge", "Pine", "Lantern", "Harbor", "Moose", "Mackerel", "Comet"];
  const DEFAULT_BOAT = { hull: 0, stripe: 2, a: 0, b: 0, buoy: [0, 1, 3] };

  /* Items in the harbor, in the order they're usually unlocked. */
  const ITEMS = [
    { id: "dock", name: "Your dock", about: "Every harbor starts with a dock." },
    { id: "rowboat", name: "Rowboat", about: "Your first boat. Small, but it's yours." },
    { id: "pines", name: "Pine grove", about: "A tree grows for every activity you finish.", grows: true },
    { id: "buoys", name: "String of traps", about: "A buoy appears for every 2 lab levels you finish, painted in your colors.", grows: true },
    { id: "lobsterboat", name: "Lobster boat", need: need.rank("tidepooler"), about: "Name it and paint it yourself." },
    { id: "loon", name: "Loon", need: need.patch("logbook"), about: "A loon swims by when you keep a good logbook." },
    { id: "cabin", name: "Camp cabin", need: need.rank("trail-scout"), about: "A cabin on the shore, Maine camp style." },
    { id: "canoe", name: "Canoe", need: need.patch("sector-vr"), about: "For exploring every cove." },
    { id: "puffins", name: "Puffin colony", need: need.patch("sector-ai"), about: "Atlantic puffins nest on a few islands off the Maine coast." },
    { id: "telescope", name: "Telescope", need: need.patch("sector-science"), about: "For dark-sky nights on the dock." },
    { id: "workshop", name: "Workshop shed", need: need.patch("sector-engineering"), about: "Where builders build." },
    { id: "easel", name: "Painting easel", need: need.patch("sector-creative"), about: "Paint the view." },
    { id: "lighthouse", name: "Lighthouse", need: need.rank("keeper"), about: "Your own light on the point." },
    { id: "weather", name: "Weather station", need: need.patch("lab-explorer"), about: "Track wind and temperature like a real scientist." },
    { id: "moose", name: "Moose", need: need.patch("wide-horizon"), about: "A moose wanders out of the woods." },
    { id: "sailboat", name: "Sailboat", need: need.rank("harbor-pilot"), about: "Harbor pilots can sail anything." },
    { id: "aurora", name: "Northern lights", need: need.rank("ridge-runner"), about: "On a clear winter night, northern Maine can see the aurora." },
    { id: "katahdin", name: "Katahdin", need: need.rank("katahdin"), about: "The summit, at last." }
  ];

  function unlocks(prof) {
    const all = [
      ...HATS.filter((x) => x.need).map((x) => ({ kind: "Hat", ...x })),
      ...JACKETS.filter((x) => x.need).map((x) => ({ kind: "Jacket", ...x })),
      ...GEAR.filter((x) => x.need).map((x) => ({ kind: "Gear", ...x })),
      ...BACKS.filter((x) => x.need).map((x) => ({ kind: "Background", ...x })),
      ...ITEMS.filter((x) => x.need).map((x) => ({ kind: "Harbor", ...x }))
    ];
    return all.map((x) => ({ ...x, key: `${x.kind}:${x.id}`, open: isOpen(x.need, prof), how: howTo(x.need), prog: progressTo(x.need, prof) }));
  }
  /* New unlocks between two profiles (for celebrations). */
  const newUnlocks = (before, after) => {
    const was = new Set(unlocks(before).filter((x) => x.open).map((x) => x.key));
    return unlocks(after).filter((x) => x.open && !was.has(x.key));
  };

  function harbor(prof, custom = {}, opts = {}) {
    const boat = { ...DEFAULT_BOAT, ...(custom.boat || {}) };
    const has = (id) => { const it = ITEMS.find((x) => x.id === id); return it && isOpen(it.need, prof); };
    const pr = SE.rng(`harbor-${opts.seed || "x"}`);
    const missions = prof ? prof.counts.missions : 0;
    const levels = prof ? prof.counts.labLevelsDone || 0 : 0;
    const bc = boat.buoy.map((i) => BUOY_COLORS[i] || BUOY_COLORS[0]);
    const boatName = `${NAME_A[boat.a] || NAME_A[0]} ${NAME_B[boat.b] || NAME_B[0]}`;
    const night = has("aurora");
    const pine = (x, y, h, fill) => `<use href="#hbPine" x="${(x - h * 0.18).toFixed(1)}" y="${(y - h).toFixed(1)}" width="${(h * 117 / 332).toFixed(1)}" height="${h.toFixed(1)}" fill="${fill}"/>`;
    const parts = [];
    // Sky
    parts.push(`<rect width="800" height="400" fill="url(#hbSky)"/>`);
    if (night) {
      const s = SE.rng("hb-stars");
      parts.push(Array.from({ length: 40 }, () => `<circle cx="${(s() * 800).toFixed(0)}" cy="${(s() * 140).toFixed(0)}" r="${(s() * 1.2 + .4).toFixed(1)}" fill="#fff" opacity="${(s() * .6 + .3).toFixed(2)}"/>`).join(""));
      parts.push(`<path d="M0 90 Q150 20 320 80 T640 50 T800 70 V140 Q640 100 480 130 T160 120 T0 150 Z" fill="#94c93d" opacity=".35"/><path d="M80 120 Q260 60 420 110 T800 100 V150 Q600 130 420 150 T80 160 Z" fill="#5fd3c0" opacity=".25"/>`);
    } else {
      parts.push(`<circle cx="680" cy="70" r="30" fill="#fff4c4" opacity=".9"/>`);
    }
    // Far hills and Katahdin
    parts.push(`<path d="M0 210 Q120 170 240 195 T480 185 T800 190 V240 H0 Z" fill="${night ? "#063532" : "#9fb6c9"}"/>`);
    if (has("katahdin")) parts.push(`<path d="M420 205 L500 140 L540 120 L575 132 L620 160 L700 205 Z" fill="${night ? "#3a2f8a" : "#7d8fae"}"/><path d="M500 140 L540 120 L575 132 L560 140 L540 132 L515 146 Z" fill="#eef2f6"/>`);
    // Treeline
    for (let x = 0; x < 820; x += 12 + pr() * 10) parts.push(pine(x, 236, 26 + pr() * 26, night ? "#021e1c" : "#2f4a3a"));
    // Water
    parts.push(`<rect y="232" width="800" height="168" fill="url(#hbSea)"/>`);
    parts.push(Array.from({ length: 22 }, (_, i) => `<path d="M${(i * 37) % 800} ${250 + ((i * 53) % 140)} q8 -3 16 0 t16 0" stroke="#fff" stroke-opacity=".25" fill="none" stroke-width="1.5"/>`).join(""));
    // Right shore with the pine grove
    parts.push(`<path d="M560 400 L560 300 Q600 262 680 258 Q760 254 800 262 V400 Z" fill="#6b6a5f"/><path d="M570 300 Q620 270 690 266 Q760 262 800 270 V290 Q740 282 680 288 Q620 292 570 312 Z" fill="#4f6b3a"/>`);
    const grove = Math.min(12, missions);
    for (let i = 0; i < grove; i++) parts.push(pine(600 + ((i * 47) % 190), 286 - (i % 3) * 6, 40 + ((i * 13) % 26), "#2f5d3a"));
    // Left granite ledge
    parts.push(`<path d="M0 400 L0 270 Q60 250 130 262 Q190 272 230 300 L260 400 Z" fill="#8b8a83"/><path d="M0 285 Q60 266 125 276 Q175 284 210 305" stroke="#a6a59e" stroke-width="5" fill="none"/>`);
    if (has("lighthouse")) parts.push(`<g><path d="M66 266 L72 160 H92 L98 266 Z" fill="#f4f2ea"/><path d="M70 205 H94 M68 235 H96" stroke="#c9302c" stroke-width="10"/><rect x="66" y="152" width="32" height="8" fill="#01201e"/><rect x="72" y="134" width="20" height="18" fill="#01201e"/><rect x="75" y="137" width="14" height="12" fill="#fff4b0"/><path d="M70 134 L82 122 L94 134 Z" fill="#01201e"/>${night ? `<path d="M82 143 L330 110 L330 176 Z" fill="#fff4b0" opacity=".25"/>` : ""}</g>`);
    if (has("puffins")) parts.push([[150, 268], [163, 266], [176, 270]].map(([x, y]) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="5" ry="7" fill="#111"/><ellipse cx="1" cy="1" rx="3" ry="5" fill="#fff"/><circle cx="1" cy="-7" r="3.6" fill="#111"/><circle cx="2" cy="-7.5" r="1.6" fill="#fff"/><path d="M4 -8 l5 1.5 l-5 1.5 Z" fill="#e9822b"/></g>`).join(""));
    // Dock and flag (flag in the student's buoy colors)
    parts.push(`<g><rect x="200" y="282" width="210" height="12" fill="#8b6540"/>${[210, 250, 290, 330, 370, 400].map((x) => `<rect x="${x}" y="290" width="7" height="40" fill="#6b4a2c"/>`).join("")}<path d="M200 282 h210" stroke="#a0784f" stroke-width="2"/></g>`);
    parts.push(`<g><rect x="222" y="212" width="3" height="72" fill="#d9d6cc"/><path d="M225 214 h34 v8 h-34 Z" fill="${bc[0]}"/><path d="M225 222 h34 v8 h-34 Z" fill="${bc[1]}"/><path d="M225 230 h34 v8 h-34 Z" fill="${bc[2]}"/></g>`);
    if (has("telescope")) parts.push(`<g transform="translate(380 282)"><path d="M0 0 L-8 -22 M0 0 L8 -22 M0 0 V-22" stroke="#444" stroke-width="2"/><rect x="-16" y="-34" width="34" height="8" rx="3" fill="#012d2b" transform="rotate(-24 0 -30)"/></g>`);
    // Boats
    parts.push(`<g transform="translate(300 316)"><path d="M-34 0 H34 L26 14 H-26 Z" fill="#8e5a2b"/><path d="M-30 0 H30" stroke="#6b4a2c" stroke-width="3"/><path d="M-8 -2 l14 -10" stroke="#c99a4f" stroke-width="2"/></g>`);
    if (has("lobsterboat")) {
      const hull = HULLS[boat.hull] || HULLS[0], stripe = BUOY_COLORS[boat.stripe] || BUOY_COLORS[2];
      parts.push(`<g transform="translate(470 330)"><path d="M-90 -18 H70 Q96 -16 100 -4 L86 18 H-80 Q-92 0 -90 -18 Z" fill="${hull}" stroke="#01201e" stroke-width="2.5"/><path d="M-88 -6 H96" stroke="${stripe}" stroke-width="6"/><rect x="-10" y="-58" width="54" height="40" rx="4" fill="#f7f6f0" stroke="#01201e" stroke-width="2.5"/><rect x="0" y="-50" width="14" height="14" fill="#b9e2f5"/><rect x="20" y="-50" width="14" height="14" fill="#b9e2f5"/><path d="M-6 -58 H40" stroke="#01201e" stroke-width="4"/><rect x="-70" y="-36" width="18" height="18" fill="#c99a4f" stroke="#01201e" stroke-width="1.5"/>
        <text x="0" y="12" text-anchor="middle" textLength="${Math.min(150, boatName.length * 8.2)}" lengthAdjust="spacingAndGlyphs" font-family="Montserrat, sans-serif" font-weight="800" font-size="11" fill="${hull === "#f7f6f0" || hull === "#f2c14e" ? "#01201e" : "#fff"}">${esc(boatName.toUpperCase())}</text></g>`);
    }
    if (has("sailboat")) parts.push(`<g transform="translate(150 350)"><path d="M-40 0 H40 L30 14 H-30 Z" fill="#f7f6f0" stroke="#01201e" stroke-width="2"/><path d="M0 -4 V-90" stroke="#6b4a2c" stroke-width="3"/><path d="M3 -86 L46 -8 H3 Z" fill="#f7f6f0" stroke="#01201e" stroke-width="1.5"/><path d="M-3 -78 L-34 -8 H-3 Z" fill="${bc[0]}" stroke="#01201e" stroke-width="1.5"/></g>`);
    if (has("canoe")) parts.push(`<g transform="translate(610 312) rotate(-6)"><path d="M-40 0 Q0 16 40 0 Q0 6 -40 0 Z" fill="#c9302c" stroke="#7a1f1c" stroke-width="2"/></g>`);
    if (has("loon")) parts.push(`<g transform="translate(560 368)"><ellipse cx="0" cy="0" rx="22" ry="6" fill="#111"/><circle cx="18" cy="-8" r="5" fill="#111"/><path d="M22 -9 l9 2 l-9 2 Z" fill="#111"/><g fill="#eee">${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${-14 + i * 5}" y="-3" width="2" height="2"/>`).join("")}</g><circle cx="20" cy="-9" r="1" fill="#c9302c"/></g>`);
    // Buoys: one per 2 lab levels
    const nb = Math.min(14, Math.floor(levels / 2));
    for (let i = 0; i < nb; i++) {
      const x = 330 + ((i * 89) % 420), y = 352 + ((i * 31) % 40);
      parts.push(`<g transform="translate(${x} ${y})"><line x1="0" y1="-14" x2="0" y2="-22" stroke="#ddd" stroke-width="1.5"/><rect x="-4.5" y="-15" width="9" height="16" rx="4.5" fill="${bc[0]}"/><rect x="-4.5" y="-10" width="9" height="4" fill="${bc[1]}"/><rect x="-4.5" y="-6" width="9" height="3" fill="${bc[2]}"/></g>`);
    }
    // Shore buildings
    if (has("cabin")) parts.push(`<g transform="translate(700 262)"><rect x="-34" y="-30" width="68" height="34" fill="#8b5a3c"/><path d="M-40 -28 L0 -58 L40 -28 Z" fill="#2f4a3a"/><rect x="-8" y="-18" width="16" height="22" fill="#4a2f1f"/><rect x="14" y="-22" width="12" height="10" fill="#f2c14e"/><rect x="18" y="-60" width="8" height="18" fill="#6b6a5f"/></g>`);
    if (has("workshop")) parts.push(`<g transform="translate(618 288)"><rect x="-22" y="-24" width="44" height="26" fill="#a0784f"/><path d="M-26 -22 L0 -40 L26 -22 Z" fill="#6b4a2c"/><rect x="-6" y="-14" width="12" height="16" fill="#4a2f1f"/><path d="M12 -18 l6 6" stroke="#f2c14e" stroke-width="2"/></g>`);
    if (has("easel")) parts.push(`<g transform="translate(752 300)"><path d="M-10 0 L0 -36 L10 0 M0 -36 V4" stroke="#6b4a2c" stroke-width="2.5" fill="none"/><rect x="-12" y="-34" width="24" height="18" fill="#fff" stroke="#6b4a2c" stroke-width="1.5"/><path d="M-9 -20 L-2 -28 L4 -22 L9 -27 V-18 H-9 Z" fill="#94c93d"/></g>`);
    if (has("weather")) parts.push(`<g transform="translate(660 230)"><rect x="-1.5" y="0" width="3" height="40" fill="#9aa3ad"/><path d="M-14 0 h28" stroke="#9aa3ad" stroke-width="2"/><circle cx="-14" cy="0" r="4" fill="#3f7fc9"/><circle cx="14" cy="0" r="4" fill="#3f7fc9"/><rect x="-8" y="16" width="16" height="10" fill="#01201e"/><rect x="-6" y="18" width="12" height="6" fill="#94c93d" opacity=".7"/></g>`);
    if (has("moose")) parts.push(`<g transform="translate(686 336)"><ellipse cx="0" cy="0" rx="20" ry="9" fill="#3b2a1e"/><path d="M14 -6 l10 -6 l4 12 l-8 4 Z" fill="#3b2a1e"/><ellipse cx="27" cy="2" rx="8" ry="5" fill="#3b2a1e"/><rect x="-14" y="4" width="3" height="10" fill="#3b2a1e"/><rect x="10" y="4" width="3" height="10" fill="#3b2a1e"/><path d="M22 -12 q-2 -8 -8 -8 M24 -12 q6 -8 12 -6" stroke="#cdb48a" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>`);
    const label = `${opts.name ? `${opts.name}'s` : "Your"} harbor: ${grove} pine trees, ${nb} buoys${has("lobsterboat") ? `, a lobster boat named ${boatName}` : ""}.`;
    return `<svg class="harbor" viewBox="0 0 800 400" role="img" aria-label="${esc(label)}">
      <defs>
        <symbol id="hbPine" viewBox="1138 172 117 332"><path d="${SE.brand.PINE_D}"/></symbol>
        <linearGradient id="hbSky" x1="0" y1="0" x2="0" y2="1">${night ? `<stop offset="0" stop-color="#011817"/><stop offset="1" stop-color="#012d2b"/>` : `<stop offset="0" stop-color="#8fc3e6"/><stop offset="1" stop-color="#e3f0f7"/>`}</linearGradient>
        <linearGradient id="hbSea" x1="0" y1="0" x2="0" y2="1">${night ? `<stop offset="0" stop-color="#073431"/><stop offset="1" stop-color="#03211f"/>` : `<stop offset="0" stop-color="#3f7fa3"/><stop offset="1" stop-color="#24476b"/>`}</linearGradient>
      </defs>${parts.join("")}</svg>`;
  }

  /* ───────── Saved choices ───────── */
  function customFor(studentId) {
    const ev = SE.store.eventsFor(studentId).filter((e) => e.type === "profile_custom").pop();
    return ev ? ev.data || {} : {};
  }
  const lookFor = (studentId) => customFor(studentId).look || null;
  /* A student's avatar, or their rank insignia if they haven't made one yet. */
  SE.studentAvatar = (studentId, size, prof, label) => {
    const look = lookFor(studentId);
    return look ? avatar(look, size, { label }) : SE.insignia((prof || SE.game.profile(studentId)).rank, size * 0.8);
  };

  /* The student's own avatar: a starter explorer until they design one. */
  SE.ownAvatar = (studentId, size, label) => avatar(lookFor(studentId) || {}, size, { label });

  SE.base = { avatar, harbor, unlocks, newUnlocks, customFor, lookFor, isOpen, ITEMS, NAME_A, NAME_B };

  /* ───────── The "My harbor" page ───────── */
  let tab = "look";
  SE.views.base = function (user) {
    const prof = SE.game.profile(user.id);
    const saved = customFor(user.id);
    const state = { look: { ...DEFAULT_LOOK, ...(saved.look || {}) }, boat: { ...DEFAULT_BOAT, ...(saved.boat || {}) } };
    const all = unlocks(prof);
    const openCount = all.filter((x) => x.open).length;
    let timer = null;

    const optBtn = (group, item, cur, preview) => {
      const open = isOpen(item.need, prof);
      return `<button type="button" class="opt ${open ? "" : "is-locked"}" data-set="${group}" data-v="${item.id}" aria-pressed="${cur === item.id}" ${open ? "" : `aria-disabled="true" title="${esc(howTo(item.need))}"`}>
        <span class="opt__art">${preview}</span><span class="opt__name">${esc(item.name)}</span>${open ? "" : `<span class="opt__lock">${icon("lock")}${esc(howTo(item.need))}</span>`}</button>`;
    };
    const panels = {
      look: () => `
        <div class="opt-group"><h3>Skin</h3><div class="sw-row">${SKIN.map((c, i) => `<button type="button" class="sw" data-set="skin" data-v="${i}" style="--c:${c}" aria-pressed="${state.look.skin === i}" aria-label="Skin tone ${i + 1}"></button>`).join("")}</div></div>
        <div class="opt-group"><h3>Hair</h3><div class="opt-row">${HAIR.map((h) => optBtn("hair", h, state.look.hair, avatar({ ...state.look, hair: h.id, hat: "none", gear: "none" }, 56))).join("")}</div>
          <div class="sw-row">${HAIR_COLORS.map((c, i) => `<button type="button" class="sw" data-set="hairColor" data-v="${i}" style="--c:${c}" aria-pressed="${state.look.hairColor === i}" aria-label="Hair color ${i + 1}"></button>`).join("")}</div></div>`,
      hat: () => `<div class="opt-group"><h3>Hats</h3><div class="opt-row">${HATS.map((h) => optBtn("hat", h, state.look.hat, avatar({ ...state.look, hat: h.id }, 56))).join("")}</div></div>`,
      jacket: () => `<div class="opt-group"><h3>Jackets</h3><div class="opt-row">${JACKETS.map((j) => optBtn("jacket", j, state.look.jacket, avatar({ ...state.look, jacket: j.id }, 56))).join("")}</div></div>`,
      gear: () => `<div class="opt-group"><h3>Gear</h3><div class="opt-row">${GEAR.map((g) => optBtn("gear", g, state.look.gear, avatar({ ...state.look, gear: g.id }, 56))).join("")}</div></div>
        <div class="opt-group"><h3>Background</h3><div class="opt-row">${BACKS.map((b) => optBtn("back", b, state.look.back, avatar({ ...state.look, back: b.id }, 56))).join("")}</div></div>`
    };
    const boatOpen = isOpen(ITEMS.find((x) => x.id === "lobsterboat").need, prof);

    function render() {
      app().innerHTML = `
        <section class="page-top page-top--base">
          <div class="wrap page-top__inner">
            <div class="backbar">${SE.backLink("#/")}</div>
            <div class="base-head">
              <div class="base-head__avatar">${avatar(state.look, 132, { label: "Your explorer" })}</div>
              <div><span class="eyebrow">${esc(prof.rank.name)} · ${SE.num(prof.xp)} XP</span><h1 tabindex="-1">My harbor</h1>
                <p class="page-top__lede">Design your explorer, paint your boat, and watch your harbor grow. Every activity your teacher passes, every lab level, patch, and rank adds something new.</p>
                <p class="base-head__count">${icon("star")}<b>${openCount}</b> of ${all.length} unlocks earned</p></div>
            </div>
          </div>
        </section>
        <div class="wrap base-grid">
          <section class="block base-harbor" aria-labelledby="harbor-title">
            <div class="block__head"><h2 id="harbor-title">Your harbor</h2><span class="muted">${prof.counts.missions} passed · ${prof.counts.labLevelsDone || 0} lab levels</span></div>
            <div class="harbor-frame">${harbor(prof, state, { seed: user.id, name: user.displayName.split(" ")[0] })}</div>
            <div class="boat-design">
              <h3>${icon("buoy")}Your buoy colors <small>Every Maine lobsterman paints their buoys in their own colors.</small></h3>
              <div class="buoy-design">${[0, 1, 2].map((k) => `<div class="sw-row" role="group" aria-label="Buoy band ${k + 1}"><span class="sw-label">Band ${k + 1}</span>${BUOY_COLORS.map((c, i) => `<button type="button" class="sw sw--small" data-set="buoy${k}" data-v="${i}" style="--c:${c}" aria-pressed="${state.boat.buoy[k] === i}" aria-label="Band ${k + 1} color ${i + 1}"></button>`).join("")}</div>`).join("")}</div>
              ${boatOpen ? `
                <h3>${icon("boat")}Your lobster boat</h3>
                <div class="boat-name"><label>Name <select class="input input--small" data-set="nameA">${NAME_A.map((n, i) => `<option value="${i}" ${state.boat.a === i ? "selected" : ""}>${esc(n)}</option>`).join("")}</select></label>
                  <select class="input input--small" data-set="nameB" aria-label="Second word of the boat's name">${NAME_B.map((n, i) => `<option value="${i}" ${state.boat.b === i ? "selected" : ""}>${esc(n)}</option>`).join("")}</select></div>
                <div class="sw-row" role="group" aria-label="Hull color"><span class="sw-label">Hull</span>${HULLS.map((c, i) => `<button type="button" class="sw sw--small" data-set="hull" data-v="${i}" style="--c:${c}" aria-pressed="${state.boat.hull === i}" aria-label="Hull color ${i + 1}"></button>`).join("")}</div>
                <div class="sw-row" role="group" aria-label="Stripe color"><span class="sw-label">Stripe</span>${BUOY_COLORS.map((c, i) => `<button type="button" class="sw sw--small" data-set="stripe" data-v="${i}" style="--c:${c}" aria-pressed="${state.boat.stripe === i}" aria-label="Stripe color ${i + 1}"></button>`).join("")}</div>`
              : `<p class="muted">${icon("lock", 'class="inline-icon"')}Reach <strong>Tidepooler</strong> to get a lobster boat you can name and paint.</p>`}
            </div>
          </section>
          <section class="block base-look" aria-labelledby="look-title">
            <div class="block__head"><h2 id="look-title">Your explorer</h2><span class="save-state muted" id="save-state" aria-live="polite"></span></div>
            <div class="look-tabs" role="tablist">${[["look", "Face & hair"], ["hat", "Hats"], ["jacket", "Jackets"], ["gear", "Gear"]].map(([id, label]) => `<button type="button" role="tab" class="look-tab" data-tab="${id}" aria-selected="${tab === id}">${label}</button>`).join("")}</div>
            <div class="look-panel" role="tabpanel">${panels[tab]()}</div>
          </section>
        </div>
        <section class="wrap section" aria-labelledby="col-title">
          <div class="section__head"><div><span class="eyebrow">Collection</span><h2 id="col-title">Everything you can unlock</h2></div><p>Gear and harbor items unlock as you rank up, earn patches, and finish activities and lab levels.</p></div>
          <ul class="collection">${all.slice().sort((a, b) => b.open - a.open).map((x) => `
            <li class="col-item ${x.open ? "is-open" : ""}">
              <span class="col-item__kind">${esc(x.kind)}</span>
              <strong>${esc(x.name)}</strong>
              ${x.about ? `<span class="col-item__about">${esc(x.about)}</span>` : ""}
              ${x.open ? `<span class="col-item__got">${icon("check")}Unlocked</span>` : `<span class="col-item__how">${icon("lock")}${esc(x.how)}</span>${x.prog ? `<span class="mini-meter"><span style="width:${Math.min(100, (x.prog.have / Math.max(1, x.prog.want)) * 100)}%"></span></span>` : ""}`}
            </li>`).join("")}</ul>
        </section>`;
      bind();
    }

    function save() {
      clearTimeout(timer);
      const st = document.getElementById("save-state");
      if (st) st.textContent = "Saving…";
      timer = setTimeout(() => {
        SE.store.log("profile_custom", { look: state.look, boat: state.boat });
        const s2 = document.getElementById("save-state");
        if (s2) s2.textContent = "Saved";
        const chip = document.querySelector(".site-nav .user-chip .avatar, .site-nav .user-chip .insignia");
        if (chip) chip.outerHTML = avatar(state.look, 28);
      }, 500);
    }

    function bind() {
      app().querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => { tab = b.dataset.tab; render(); app().querySelector(`[data-tab="${tab}"]`).focus(); }));
      app().querySelectorAll("button[data-set]").forEach((b) => b.addEventListener("click", () => {
        if (b.getAttribute("aria-disabled") === "true") { SE.toast(b.title || "Locked"); return; }
        const k = b.dataset.set, v = b.dataset.v;
        if (["skin", "hairColor"].includes(k)) state.look[k] = Number(v);
        else if (["hair", "hat", "jacket", "gear", "back"].includes(k)) state.look[k] = v;
        else if (k === "hull" || k === "stripe") state.boat[k] = Number(v);
        else if (k.startsWith("buoy")) { state.boat.buoy = state.boat.buoy.slice(); state.boat.buoy[Number(k.slice(4))] = Number(v); }
        const y = window.scrollY;
        render();
        window.scrollTo(0, y);
        const again = app().querySelector(`[data-set="${k}"][data-v="${v}"]`);
        if (again) again.focus({ preventScroll: true });
        save();
      }));
      app().querySelectorAll("select[data-set]").forEach((s) => s.addEventListener("change", () => {
        state.boat[s.dataset.set === "nameA" ? "a" : "b"] = Number(s.value);
        const y = window.scrollY; render(); window.scrollTo(0, y); save();
      }));
    }
    render();
  };

  /* A small "new unlock" strip used by the activity and lab celebrations. */
  SE.base.unlockStrip = (items) => !items.length ? "" : `
    <div class="unlock-strip">
      <span class="eyebrow">New unlock${items.length > 1 ? "s" : ""}</span>
      <ul>${items.slice(0, 4).map((x) => `<li>${icon("star")}<span><strong>${esc(x.name)}</strong><small>${esc(x.kind === "Harbor" ? "for your harbor" : `${x.kind.toLowerCase()} for your explorer`)}</small></span></li>`).join("")}</ul>
      <a class="btn btn--ghost btn--small" href="#/base">${icon("arrowRight")}Visit my harbor</a>
    </div>`;
})();
