/*
 * Field Station 360 — Virtual Reality
 * A look-around field trip. Students start at home in Maine (a Gulf of Maine
 * tide pool and a North Woods pond under Katahdin), then travel to a rainforest,
 * a desert, and a coral reef. They turn to compass headings, find clues,
 * separate observations from inferences, and compare adaptations.
 * Works with a mouse, touch, keyboard, or a VR headset's web browser.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;
  const W = 3200, H = 420; // the full 360° panorama in world pixels

  /* ───────── Scenes ───────── */
  const SCENES = {
    tidepool: {
      name: "Gulf of Maine tide pools",
      short: "Maine tide pools",
      sky: ["#5f98c8", "#a6cde6", "#e2eff6"], ground: "#9c8a80",
      clues: [
        { deg: 30, y: 300, title: "White cones on the rocks", see: "Hundreds of tiny white cone-shaped shells are stuck to the rock. Right now, with the tide out, every one is shut tight.",
          q: "What's the best inference?", options: ["They close up to keep from drying out until the tide comes back.", "They are empty shells left by animals that died.", "They close because they are asleep for the winter."], a: 0,
          why: "These are barnacles: animals that glue themselves head-first to rocks. At low tide they seal their shells to hold in seawater. When the water returns, they open and sweep feathery legs through it to catch food." },
        { deg: 110, y: 260, title: "Bubbly seaweed", see: "Brown seaweed lies flat over the rocks. Along each strand are little bubbles, like beads.",
          q: "What could the bubbles help the seaweed do?", options: ["Keep fish from eating it", "Float up toward sunlight when the tide comes in", "Store salt"], a: 1,
          why: "This is rockweed, a kind of algae. Like plants, it needs sunlight to make food. Its air bladders lift it toward the light when it's underwater. At low tide it lies flat, stays damp, and shelters snails and crabs underneath." },
        { deg: 200, y: 330, title: "Sea star on a mussel", see: "A sea star is wrapped around a dark blue mussel shell. The shell is open a crack.",
          q: "What is the sea star most likely doing?", options: ["Hiding from the sun", "Protecting the mussel", "Prying the shell open to eat the mussel"], a: 2,
          why: "Sea stars pull mussel shells apart with hundreds of tiny tube feet, then eat the soft animal inside. A tide pool is full of predators and prey, packed into a small space." },
        { deg: 290, y: 190, title: "A dark stripe on the cliff", see: "High above the water there's a dark band across the rock. Above it, the rock is dry and gray. Below it, seaweed covers everything.",
          q: "What can you infer from the stripe?", options: ["Someone painted a line", "The ocean reaches that high at high tide", "It's a shadow from a cloud"], a: 1,
          why: "The Gulf of Maine has big tides. Twice a day the water rises and falls, about 9 feet at Portland and close to 20 feet near Eastport. Everything living on these rocks has to survive both underwater and out in the air." }
      ],
      task: { prompt: "The open ocean is east of these tide pools. Turn to face east, out to sea.", deg: 90, label: "east (90°)" }
    },
    northwoods: {
      name: "Maine North Woods",
      short: "North Woods",
      sky: ["#4f7fb3", "#97bfdb", "#dbe9f0"], ground: "#39452a",
      clues: [
        { deg: 50, y: 285, title: "Moose in the pond", see: "A moose stands knee-deep in the pond. It dunks its head and comes up chewing water plants.",
          q: "What's a likely reason a moose wades into a pond in summer?", options: ["To eat water plants and stay cool", "To hunt for fish", "To wash off mud"], a: 0,
          why: "Water plants are full of salt (sodium) that moose need, and the cool water helps such a big animal shed heat and escape biting insects. Long legs make wading easy. Maine has more moose than any state except Alaska." },
        { deg: 140, y: 170, title: "Cone-shaped trees", see: "The spruce and fir trees are shaped like cones, with thin needles instead of wide leaves. Last night's snow is sliding off the branches.",
          q: "How could the cone shape help in a Maine winter?", options: ["It catches more snow to keep the tree warm", "Heavy snow slides off instead of breaking branches", "It makes the tree easier for birds to land on"], a: 1,
          why: "Snow slides off sloped branches instead of piling up and snapping them. Thin, waxy needles also lose less water in cold, dry air, so these evergreens can stay green all winter." },
        { deg: 230, y: 300, title: "A dome of sticks", see: "A big dome of sticks and mud sits in the pond. On the shore, a tree stump has been chewed to a sharp point.",
          q: "What can you infer?", options: ["Beavers cut the tree and built a home", "A storm knocked the tree down", "People are building a camp"], a: 0,
          why: "Beavers cut trees with their teeth and build dams and lodges. The dam floods the area into a pond, which becomes a home for fish, frogs, ducks, and moose. That's why beavers are called ecosystem engineers." },
        { deg: 320, y: 270, title: "Bird with back legs", see: "A black-and-white checkered bird floats low on the water. Its legs are set far back on its body.",
          q: "What are legs that far back best for?", options: ["Walking long distances", "Perching on branches", "Swimming and diving fast"], a: 2,
          why: "This is a common loon. Legs at the very back push it through the water like propellers when it dives for fish. On land it can barely walk, so loons nest right at the water's edge." }
      ],
      task: { prompt: "Katahdin, Maine's tallest mountain, is north of this pond. Turn to face north.", deg: 0, label: "north (0°)" }
    },
    rainforest: {
      name: "Amazon rainforest",
      sky: ["#2f5d3a", "#5f8f4e", "#a9c97a"], ground: "#2b3b1d",
      clues: [
        { deg: 40, y: 300, title: "Giant roots", see: "This tree's roots spread out above the ground like tall, thin walls.",
          q: "What's the best inference?", options: ["The soil is thin, so wide roots help hold up a very tall tree.", "The roots grew above ground to get sunlight.", "Animals built walls around the tree."], a: 0,
          why: "Rainforest soil is thin and most nutrients are near the surface. These buttress roots spread wide to keep giant trees from tipping over." },
        { deg: 112, y: 170, title: "Pointy leaves", see: "Many leaves here end in a long, pointed tip.",
          q: "What could the pointed tips help with?", options: ["Catching more sunlight", "Letting rain drip off quickly", "Keeping insects away"], a: 1,
          why: "These are called drip tips. It rains almost every day, and water running off quickly keeps mold and algae from growing on the leaves." },
        { deg: 205, y: 330, title: "Dark forest floor", see: "Down here it's shady and there are only a few small plants.",
          q: "Why might so few plants grow on the forest floor?", options: ["It's too cold", "Tall trees block most of the sunlight", "The river floods it every day"], a: 1,
          why: "The canopy of treetops catches most of the light. Only about 2% of sunlight reaches the forest floor, so few plants can grow there." },
        { deg: 300, y: 150, title: "Big-billed bird", see: "A toucan sits on a thin branch. Its bill is almost as long as its body.",
          q: "What's a likely reason for such a long bill?", options: ["To reach fruit at the ends of thin branches", "To scare away the rain", "To dig holes in the ground"], a: 0,
          why: "Toucans are too heavy for thin branches, so a long, light bill lets them reach fruit from where they sit. It also helps them release heat." }
      ],
      task: { prompt: "The river is south of the station. Turn to face south.", deg: 180, label: "south (180°)" }
    },
    desert: {
      name: "Sonoran Desert",
      sky: ["#2e5c8a", "#e9a66b", "#f6d39a"], ground: "#d8a86a",
      clues: [
        { deg: 60, y: 210, title: "Pleated cactus", see: "This saguaro cactus has folds like an accordion, and it looks swollen.",
          q: "What do the folds probably let the cactus do?", options: ["Expand to store water after it rains", "Bend in the wind", "Make shade for animals"], a: 0,
          why: "The pleats let a saguaro swell up and store hundreds of liters of water after a storm, then shrink as it uses the water." },
        { deg: 150, y: 320, title: "Holes in the sand", see: "There are small holes at the bottom of the bush. Tracks lead into them.",
          q: "What can you infer?", options: ["Animals hide underground during the hot day", "Rain made the holes", "People dug them"], a: 0,
          why: "Many desert animals are nocturnal. They stay in cooler burrows during the day and come out at night." },
        { deg: 235, y: 280, title: "Huge ears", see: "A kit fox rests in the shade. Its ears are very large for its body.",
          q: "How could big ears help in the desert?", options: ["They help it hear birds far away", "They let heat escape and keep it cool", "They store food"], a: 1,
          why: "Big ears have lots of blood vessels close to the surface. Heat escapes through them, like a radiator. They also help it hear prey underground." },
        { deg: 330, y: 300, title: "Spread-out plants", see: "The bushes here grow far apart from each other, with bare ground between them.",
          q: "Why might plants grow so far apart?", options: ["They don't like each other", "Each one needs a large area to collect scarce water", "The wind blows them apart"], a: 1,
          why: "Water is scarce. Each plant's roots spread wide to soak up rain, so plants that grow too close compete for the same water." }
      ],
      task: { prompt: "The sun is setting. In the evening, the sun is in the west. Turn to face west.", deg: 270, label: "west (270°)" }
    },
    reef: {
      name: "Coral reef",
      sky: ["#0b3d63", "#136e93", "#3fa6b8"], ground: "#d9c48f",
      clues: [
        { deg: 30, y: 270, title: "Hard, branching shapes", see: "These branching shapes are hard like rock, but tiny tentacles poke out of little holes.",
          q: "What is coral, most likely?", options: ["A kind of rock", "A plant", "A colony of tiny animals"], a: 2,
          why: "Corals are colonies of tiny animals called polyps. They build hard skeletons that pile up over thousands of years into a reef." },
        { deg: 120, y: 230, title: "Fish in the tentacles", see: "A small orange fish swims in and out of a stinging anemone without getting hurt.",
          q: "What can you infer?", options: ["The fish and anemone help each other", "The anemone is trying to eat the fish", "The fish is lost"], a: 0,
          why: "Clownfish have a coating that protects them from stings. The anemone protects the fish, and the fish cleans the anemone and chases off predators." },
        { deg: 215, y: 300, title: "Pale coral", see: "Some coral here is bright white, while coral nearby is brown and purple.",
          q: "What could white coral be a sign of?", options: ["The coral is healthy and new", "The water got too warm and the coral is stressed", "It's covered in sand"], a: 1,
          why: "When water gets too warm, coral pushes out the algae living inside it. Without them it turns white (bleaching) and can starve if the water doesn't cool." },
        { deg: 300, y: 160, title: "Swimming upward", see: "A sea turtle swims slowly toward the surface.",
          q: "Why might a turtle swim up to the surface?", options: ["To breathe air", "To catch birds", "To dry off"], a: 0,
          why: "Sea turtles are reptiles with lungs. They can hold their breath a long time, but they have to surface to breathe." }
      ],
      task: { prompt: "The shore is north of the reef. Turn to face north, toward the shore.", deg: 0, label: "north (0°)" }
    }
  };

  /* ───────── Drawing the panoramas ───────── */
  function drawScene(id) {
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const x = c.getContext("2d");
    const S = SCENES[id];
    const r = SE.rng(id);
    const at = (deg) => (deg / 360) * W;
    const grd = x.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, S.sky[0]); grd.addColorStop(0.6, S.sky[1]); grd.addColorStop(1, S.sky[2]);
    x.fillStyle = grd; x.fillRect(0, 0, W, H);
    // Draw an object at world x, repeating it across the wrap seam if needed
    const wrap = (px, fn) => { fn(px); if (px < 200) fn(px + W); if (px > W - 200) fn(px - W); };

    if (id === "tidepool") {
      // Open ocean to the east, with a far spruce shore the rest of the way around
      x.fillStyle = "#2f6185"; x.fillRect(0, 196, W, 70);
      x.fillStyle = "rgba(255,255,255,.55)";
      for (let i = 0; i < 70; i++) { const px = r() * W, py = 205 + r() * 55; x.fillRect(px, py, 10 + r() * 16, 2); }
      // Far headlands with spruce, except straight out to sea (east)
      x.fillStyle = "#24442f";
      for (let px = 0; px < W; px += 9) {
        const deg = (px / W) * 360;
        if (deg > 55 && deg < 135) continue;
        const h = 14 + r() * 18;
        x.beginPath(); x.moveTo(px - 6, 198); x.lineTo(px, 198 - h); x.lineTo(px + 6, 198); x.fill();
      }
      x.fillRect(0, 194, at(55), 6); x.fillRect(at(135), 194, W - at(135), 6);
      // A white lighthouse on a far point
      wrap(at(160), (p) => {
        x.fillStyle = "#f4f2ea"; x.beginPath(); x.moveTo(p - 7, 196); x.lineTo(p - 5, 150); x.lineTo(p + 5, 150); x.lineTo(p + 7, 196); x.fill();
        x.fillStyle = "#1d1647"; x.fillRect(p - 7, 144, 14, 7); x.beginPath(); x.moveTo(p - 7, 144); x.lineTo(p, 136); x.lineTo(p + 7, 144); x.fill();
        x.fillStyle = "#fff3a8"; x.fillRect(p - 4, 145, 8, 5);
      });
      // Pink granite ledges in the foreground
      const ledge = ["#b6988c", "#a8897e", "#c4a89c", "#9b7f74"];
      for (let i = 0; i < 26; i++) {
        const px = i * (W / 26) + r() * 30, w = 160 + r() * 120, top = 236 + r() * 40;
        wrap(px, (p) => {
          x.fillStyle = ledge[i % 4];
          x.beginPath(); x.moveTo(p - w / 2, 420); x.lineTo(p - w / 2 + 20, top + 12); x.lineTo(p - 10, top); x.lineTo(p + w / 2 - 18, top + 18); x.lineTo(p + w / 2, 420); x.fill();
          x.strokeStyle = "rgba(60,40,35,.25)"; x.lineWidth = 2; x.beginPath(); x.moveTo(p - w / 4, top + 30); x.lineTo(p - w / 8, top + 80); x.lineTo(p - w / 5, 420); x.stroke();
        });
      }
      // Tide pools
      x.fillStyle = "#3f7fa3";
      [[15, 372], [75, 360], [150, 380], [245, 368], [330, 376]].forEach(([deg, y]) => wrap(at(deg), (p) => { x.beginPath(); x.ellipse(p, y, 60, 14, 0, 0, Math.PI * 2); x.fill(); }));
      // Tall cliff with the high-tide stripe
      wrap(at(290), (p) => {
        x.fillStyle = "#c9c2b8"; x.beginPath(); x.moveTo(p - 170, 420); x.lineTo(p - 150, 140); x.lineTo(p - 40, 118); x.lineTo(p + 120, 132); x.lineTo(p + 170, 420); x.fill();
        x.fillStyle = "#2f2d2a"; x.beginPath(); x.moveTo(p - 157, 222); x.lineTo(p + 145, 214); x.lineTo(p + 147, 236); x.lineTo(p - 156, 246); x.fill();
        x.fillStyle = "#7a5d2a"; x.beginPath(); x.moveTo(p - 156, 246); x.lineTo(p + 147, 236); x.lineTo(p + 168, 420); x.lineTo(p - 170, 420); x.fill();
        x.fillStyle = "#24442f";
        for (let k = -140; k < 120; k += 14) { const h = 20 + Math.abs(Math.sin(k)) * 20; x.beginPath(); x.moveTo(p + k - 7, 130); x.lineTo(p + k, 130 - h); x.lineTo(p + k + 7, 130); x.fill(); }
      });
      // Barnacles
      wrap(at(30), (p) => {
        for (let k = 0; k < 140; k++) { const bx = p - 110 + r() * 220, by = 280 + r() * 50; x.fillStyle = "#f2efe6"; x.beginPath(); x.arc(bx, by, 3 + r() * 2.5, 0, Math.PI * 2); x.fill(); x.fillStyle = "#6b625a"; x.beginPath(); x.arc(bx, by, 1, 0, Math.PI * 2); x.fill(); }
      });
      // Rockweed with air bladders
      wrap(at(110), (p) => {
        for (let k = 0; k < 16; k++) {
          const sx = p - 130 + k * 17, sy = 250 + r() * 20;
          x.strokeStyle = k % 2 ? "#6f6a26" : "#7d7130"; x.lineWidth = 4; x.lineCap = "round";
          x.beginPath(); x.moveTo(sx, sy); x.bezierCurveTo(sx + 20, sy + 20, sx - 10, sy + 40, sx + 14, sy + 64); x.stroke();
          x.fillStyle = "#a89a45"; [0.3, 0.6, 0.85].forEach((t) => { x.beginPath(); x.ellipse(sx + 6 + t * 6, sy + t * 64, 4, 6, 0, 0, Math.PI * 2); x.fill(); });
        }
      });
      // Sea star on a mussel bed
      wrap(at(200), (p) => {
        x.fillStyle = "#1f2b4a";
        for (let k = 0; k < 14; k++) { x.beginPath(); x.ellipse(p - 70 + r() * 140, 338 + r() * 26, 13, 6, r() * 2, 0, Math.PI * 2); x.fill(); }
        x.fillStyle = "#c2552f"; x.beginPath();
        for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 9 : 30; x.lineTo(p + Math.cos(a) * rr, 335 + Math.sin(a) * rr); }
        x.closePath(); x.fill();
        x.fillStyle = "rgba(255,230,200,.5)"; for (let k = 0; k < 12; k++) { x.beginPath(); x.arc(p - 12 + r() * 24, 325 + r() * 20, 1.6, 0, Math.PI * 2); x.fill(); }
      });
    }

    if (id === "northwoods") {
      // Katahdin to the north, with other far ridges
      x.fillStyle = "#7d8fae";
      for (let i = 0; i < 8; i++) {
        const px = r() * W, w = 300 + r() * 300, h = 40 + r() * 40;
        wrap(px, (p) => { x.beginPath(); x.moveTo(p - w / 2, 250); x.quadraticCurveTo(p, 250 - h * 2, p + w / 2, 250); x.fill(); });
      }
      wrap(at(0), (p) => {
        x.fillStyle = "#6a7c9e"; x.beginPath(); x.moveTo(p - 330, 250); x.lineTo(p - 150, 150); x.lineTo(p - 60, 96); x.lineTo(p - 10, 86); x.lineTo(p + 40, 104); x.lineTo(p + 120, 128); x.lineTo(p + 330, 250); x.fill();
        x.fillStyle = "#eef2f6"; x.beginPath(); x.moveTo(p - 60, 96); x.lineTo(p - 10, 86); x.lineTo(p + 40, 104); x.lineTo(p + 18, 112); x.lineTo(p - 8, 101); x.lineTo(p - 40, 112); x.fill();
      });
      // Far shore of spruce and fir
      x.fillStyle = "#1f3a26";
      for (let px = 0; px < W; px += 8) { const h = 22 + r() * 30; x.beginPath(); x.moveTo(px - 7, 266); x.lineTo(px, 266 - h); x.lineTo(px + 7, 266); x.fill(); }
      x.fillRect(0, 262, W, 6);
      // The pond
      x.fillStyle = "#3f6f8f"; x.fillRect(0, 266, W, 72);
      x.fillStyle = "rgba(255,255,255,.28)"; for (let i = 0; i < 50; i++) x.fillRect(r() * W, 272 + r() * 60, 18 + r() * 24, 2);
      // Near shore
      x.fillStyle = "#39452a"; x.beginPath(); x.moveTo(0, 420); for (let px = 0; px <= W; px += 40) x.lineTo(px, 340 + Math.sin(px / 150) * 6); x.lineTo(W, 420); x.fill();
      // Birches
      for (let i = 0; i < 12; i++) {
        const px = r() * W; const deg = (px / W) * 360;
        if ([50, 140, 230, 320].some((d) => Math.abs(deg - d) < 22)) continue;
        wrap(px, (p) => { x.fillStyle = "#efeee8"; x.fillRect(p - 6, 120, 12, 240); x.fillStyle = "#2b2b2b"; for (let k = 0; k < 9; k++) x.fillRect(p - 6 + (k % 2) * 5, 140 + k * 24, 6, 3); x.fillStyle = "#c7a43a"; x.beginPath(); x.arc(p, 120, 34, 0, Math.PI * 2); x.fill(); });
      }
      // Big snowy spruce up close
      [[128, 1.1], [150, 1.25], [170, .9]].forEach(([deg, k]) => wrap(at(deg), (p) => {
        x.fillStyle = "#4a3828"; x.fillRect(p - 6, 330, 12, 40);
        for (let t = 0; t < 5; t++) {
          const y = 120 * k + t * 45, w = (40 + t * 22) * k;
          x.fillStyle = "#1c4a2c"; x.beginPath(); x.moveTo(p, y - 30 * k); x.lineTo(p - w, y + 50); x.lineTo(p + w, y + 50); x.fill();
          x.fillStyle = "#f4f7fa"; x.beginPath(); x.moveTo(p, y - 30 * k); x.lineTo(p - w * .55, y + 18); x.lineTo(p - w * .2, y + 10); x.lineTo(p + w * .3, y + 20); x.lineTo(p + w * .5, y + 14); x.fill();
        }
      }));
      // Moose wading
      wrap(at(50), (p) => {
        x.fillStyle = "#3b2a1e";
        x.beginPath(); x.ellipse(p, 268, 58, 26, 0, 0, Math.PI * 2); x.fill();
        x.beginPath(); x.moveTo(p + 40, 250); x.lineTo(p + 62, 236); x.lineTo(p + 70, 270); x.lineTo(p + 50, 278); x.fill();
        x.beginPath(); x.ellipse(p + 78, 276, 22, 13, 0.5, 0, Math.PI * 2); x.fill();
        x.fillRect(p - 40, 280, 9, 22); x.fillRect(p + 28, 280, 9, 22);
        x.strokeStyle = "#cdb48a"; x.lineWidth = 6; x.lineCap = "round";
        x.beginPath(); x.moveTo(p + 62, 236); x.quadraticCurveTo(p + 60, 214, p + 44, 210); x.moveTo(p + 54, 222); x.lineTo(p + 40, 222); x.moveTo(p + 64, 234); x.quadraticCurveTo(p + 80, 214, p + 96, 214); x.moveTo(p + 82, 220); x.lineTo(p + 88, 206); x.stroke();
        x.fillStyle = "rgba(255,255,255,.35)"; x.fillRect(p - 70, 300, 160, 3);
      });
      // Beaver lodge and chewed stump
      wrap(at(230), (p) => {
        x.fillStyle = "#5a4430"; x.beginPath(); x.ellipse(p, 300, 80, 34, 0, Math.PI, 0); x.fill();
        x.strokeStyle = "#7a5e40"; x.lineWidth = 3;
        for (let k = 0; k < 22; k++) { const a = Math.PI + r() * Math.PI, rr = 30 + r() * 46; x.beginPath(); x.moveTo(p + Math.cos(a) * rr * .5, 300 + Math.sin(a) * 20); x.lineTo(p + Math.cos(a) * rr, 300 + Math.sin(a) * 30); x.stroke(); }
        x.fillStyle = "#b98d5a"; x.beginPath(); x.moveTo(p + 120, 360); x.lineTo(p + 124, 330); x.lineTo(p + 132, 318); x.lineTo(p + 140, 330); x.lineTo(p + 144, 360); x.fill();
        x.fillStyle = "#e9d3a8"; for (let k = 0; k < 6; k++) { x.beginPath(); x.arc(p + 110 + r() * 40, 362 + r() * 8, 2.5, 0, Math.PI * 2); x.fill(); }
      });
      // Loon
      wrap(at(320), (p) => {
        x.fillStyle = "#121418"; x.beginPath(); x.ellipse(p, 290, 40, 11, 0, 0, Math.PI * 2); x.fill();
        x.beginPath(); x.ellipse(p + 34, 274, 9, 8, 0, 0, Math.PI * 2); x.fill(); x.fillRect(p + 28, 276, 8, 12);
        x.fillStyle = "#121418"; x.beginPath(); x.moveTo(p + 41, 272); x.lineTo(p + 56, 276); x.lineTo(p + 41, 277); x.fill();
        x.fillStyle = "#eef0ee"; for (let k = 0; k < 14; k++) x.fillRect(p - 26 + (k % 7) * 7, 284 + Math.floor(k / 7) * 5, 3, 3);
        x.fillStyle = "#b21e1e"; x.beginPath(); x.arc(p + 36, 272, 1.8, 0, Math.PI * 2); x.fill();
        x.fillStyle = "rgba(255,255,255,.3)"; x.fillRect(p - 50, 302, 110, 2);
      });
    }

    if (id === "rainforest") {
      for (let layer = 0; layer < 3; layer++) {
        x.fillStyle = ["#24462b", "#1d3b22", "#16301b"][layer];
        for (let i = 0; i < 46; i++) {
          const px = r() * W, py = 90 + layer * 50 + r() * 40, rad = 40 + r() * 50;
          wrap(px, (p) => { x.beginPath(); x.arc(p, py, rad, 0, Math.PI * 2); x.fill(); });
        }
      }
      x.fillStyle = "#2b3b1d"; x.fillRect(0, 330, W, 90);
      // River to the south
      x.fillStyle = "#3e7a8f";
      x.beginPath(); x.moveTo(at(150), 420); x.bezierCurveTo(at(165), 350, at(195), 350, at(212), 420); x.fill();
      x.strokeStyle = "rgba(255,255,255,.35)"; x.lineWidth = 2;
      for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(at(165 + i * 6), 380 + i * 5); x.lineTo(at(170 + i * 6), 380 + i * 5); x.stroke(); }
      // Big trees with buttress roots
      [[40, 70], [95, 46], [250, 52], [350, 60]].forEach(([deg, wdt]) => wrap(at(deg), (p) => {
        x.fillStyle = "#5b4630";
        x.fillRect(p - wdt / 2, 20, wdt, 320);
        x.beginPath(); x.moveTo(p - wdt / 2, 260); x.lineTo(p - wdt * 1.6, 345); x.lineTo(p - wdt / 2, 345); x.fill();
        x.beginPath(); x.moveTo(p + wdt / 2, 260); x.lineTo(p + wdt * 1.6, 345); x.lineTo(p + wdt / 2, 345); x.fill();
        x.fillStyle = "rgba(0,0,0,.18)"; x.fillRect(p + wdt / 6, 20, wdt / 4, 320);
      }));
      // Vines
      x.strokeStyle = "#3d6b2c"; x.lineWidth = 4;
      for (let i = 0; i < 24; i++) {
        const px = r() * W;
        wrap(px, (p) => { x.beginPath(); x.moveTo(p, 0); x.bezierCurveTo(p + 30, 80, p - 30, 160, p + 10, 220 + r() * 60); x.stroke(); });
      }
      // Drip-tip leaves cluster
      wrap(at(112), (p) => {
        x.fillStyle = "#4f8f3a";
        for (let i = 0; i < 9; i++) {
          const lx = p - 80 + (i % 3) * 60, ly = 130 + Math.floor(i / 3) * 40;
          x.beginPath(); x.moveTo(lx, ly); x.quadraticCurveTo(lx + 25, ly - 18, lx + 70, ly + 10); x.quadraticCurveTo(lx + 25, ly + 18, lx, ly); x.fill();
        }
      });
      // Ferns
      x.strokeStyle = "#4a7d34"; x.lineWidth = 3;
      for (let i = 0; i < 40; i++) {
        const px = r() * W, py = 340 + r() * 40;
        if (Math.abs(px - at(205)) < 160) continue; // keep the dark floor bare
        wrap(px, (p) => { for (let k = -3; k <= 3; k++) { x.beginPath(); x.moveTo(p, py); x.quadraticCurveTo(p + k * 8, py - 30, p + k * 14, py - 20 - Math.abs(k) * 4); x.stroke(); } });
      }
      // Toucan
      wrap(at(300), (p) => {
        x.strokeStyle = "#5b4630"; x.lineWidth = 6; x.beginPath(); x.moveTo(p - 120, 172); x.lineTo(p + 90, 168); x.stroke();
        x.fillStyle = "#121212"; x.beginPath(); x.ellipse(p, 145, 18, 28, 0, 0, Math.PI * 2); x.fill();
        x.fillStyle = "#f6efe2"; x.beginPath(); x.ellipse(p + 6, 135, 9, 10, 0, 0, Math.PI * 2); x.fill();
        x.fillStyle = "#ec7a2f"; x.beginPath(); x.moveTo(p + 12, 124); x.quadraticCurveTo(p + 60, 118, p + 64, 132); x.lineTo(p + 14, 138); x.fill();
        x.fillStyle = "#0d1d36"; x.beginPath(); x.arc(p + 8, 126, 2.5, 0, Math.PI * 2); x.fill();
      });
    }

    if (id === "desert") {
      // Sun low in the west
      x.fillStyle = "rgba(255,230,160,.9)"; x.beginPath(); x.arc(at(270), 250, 46, 0, Math.PI * 2); x.fill();
      x.fillStyle = "rgba(255,230,160,.25)"; x.beginPath(); x.arc(at(270), 250, 80, 0, Math.PI * 2); x.fill();
      // Mesas
      x.fillStyle = "#a35f3c";
      for (let i = 0; i < 9; i++) {
        const px = r() * W, w = 140 + r() * 200, h = 50 + r() * 50;
        wrap(px, (p) => { x.beginPath(); x.moveTo(p - w / 2 - 30, 300); x.lineTo(p - w / 2, 300 - h); x.lineTo(p + w / 2, 300 - h); x.lineTo(p + w / 2 + 30, 300); x.fill(); });
      }
      // Dunes / ground
      x.fillStyle = "#d8a86a"; x.beginPath(); x.moveTo(0, 420);
      for (let px = 0; px <= W; px += 40) x.lineTo(px, 300 + Math.sin(px / 180) * 10);
      x.lineTo(W, 420); x.fill();
      // Spread-out bushes
      x.fillStyle = "#7b8a46";
      for (let i = 0; i < 26; i++) {
        const px = i * (W / 26) + r() * 40, py = 315 + r() * 30;
        wrap(px, (p) => { x.beginPath(); x.ellipse(p, py, 26, 14, 0, 0, Math.PI * 2); x.fill(); });
      }
      // Burrow holes under a bush
      wrap(at(150), (p) => {
        x.fillStyle = "#3a2a1a"; [[-30, 338], [10, 344], [40, 336]].forEach(([dx, y]) => { x.beginPath(); x.ellipse(p + dx, y, 10, 5, 0, 0, Math.PI * 2); x.fill(); });
        x.fillStyle = "#6d4f30"; for (let k = 0; k < 8; k++) { x.beginPath(); x.arc(p - 70 + k * 8, 352 - k, 2, 0, Math.PI * 2); x.fill(); }
      });
      // Saguaros
      [[60, 1.3], [110, .8], [190, 1], [300, .9], [355, .7]].forEach(([deg, s]) => wrap(at(deg), (p) => {
        x.fillStyle = "#3f7a4a"; x.strokeStyle = "#2c5a35"; x.lineWidth = 2;
        const t = 330 - 230 * s, w = 34 * s;
        x.beginPath(); x.roundRect(p - w / 2, t, w, 330 - t, w / 2); x.fill();
        x.beginPath(); x.roundRect(p - w * 1.6, t + 70 * s, w * .7, 70 * s, w / 3); x.fill(); x.fillRect(p - w * 1.6, t + 120 * s, w * 1.2, w * .6);
        x.beginPath(); x.roundRect(p + w * .9, t + 40 * s, w * .7, 80 * s, w / 3); x.fill(); x.fillRect(p + w * .4, t + 100 * s, w * 1.1, w * .6);
        for (let k = -1; k <= 1; k++) { x.beginPath(); x.moveTo(p + k * w / 4, t + 10); x.lineTo(p + k * w / 4, 325); x.stroke(); }
      }));
      // Kit fox
      wrap(at(235), (p) => {
        x.fillStyle = "#c58a52";
        x.beginPath(); x.ellipse(p, 305, 34, 14, 0, 0, Math.PI * 2); x.fill();
        x.beginPath(); x.ellipse(p + 34, 292, 13, 11, 0, 0, Math.PI * 2); x.fill();
        x.beginPath(); x.moveTo(p + 26, 286); x.lineTo(p + 22, 254); x.lineTo(p + 36, 282); x.fill();
        x.beginPath(); x.moveTo(p + 38, 284); x.lineTo(p + 46, 252); x.lineTo(p + 48, 286); x.fill();
        x.beginPath(); x.moveTo(p - 32, 302); x.quadraticCurveTo(p - 70, 300, p - 66, 318); x.lineTo(p - 30, 310); x.fill();
        x.fillStyle = "#0d1d36"; x.beginPath(); x.arc(p + 40, 290, 2.2, 0, Math.PI * 2); x.fill();
      });
    }

    if (id === "reef") {
      // Light from the shore (north) and rays
      const g2 = x.createRadialGradient(at(0), 0, 10, at(0), 0, 600);
      g2.addColorStop(0, "rgba(200,240,255,.55)"); g2.addColorStop(1, "rgba(200,240,255,0)");
      x.fillStyle = g2; x.fillRect(0, 0, 700, H); x.fillRect(W - 700, 0, 700, H);
      x.fillStyle = "rgba(255,255,255,.07)";
      for (let i = 0; i < 18; i++) { const px = r() * W; x.beginPath(); x.moveTo(px, 0); x.lineTo(px + 40, 0); x.lineTo(px + 140, H); x.lineTo(px + 90, H); x.fill(); }
      // Sand
      x.fillStyle = "#d9c48f"; x.beginPath(); x.moveTo(0, 420);
      for (let px = 0; px <= W; px += 50) x.lineTo(px, 340 + Math.sin(px / 140) * 8);
      x.lineTo(W, 420); x.fill();
      // Brain coral and branching coral
      const branch = (p, y, color, n) => {
        x.strokeStyle = color; x.lineCap = "round";
        const arm = (bx, by, ang, len, depth) => {
          if (depth === 0) return;
          const ex = bx + Math.cos(ang) * len, ey = by + Math.sin(ang) * len;
          x.lineWidth = depth * 3; x.beginPath(); x.moveTo(bx, by); x.lineTo(ex, ey); x.stroke();
          arm(ex, ey, ang - 0.45, len * .72, depth - 1); arm(ex, ey, ang + 0.45, len * .72, depth - 1);
        };
        arm(p, y, -Math.PI / 2, n, 4);
      };
      [[30, "#8a5a7a", 60], [70, "#b5654a", 46], [180, "#7a5aa0", 50], [215, "#f1f1ee", 56], [228, "#efeee9", 40], [265, "#a5634f", 44], [340, "#7a5aa0", 52]].forEach(([deg, col, n]) => wrap(at(deg), (p) => branch(p, 350, col, n)));
      [[95, "#a77a4a"], [160, "#8b6a95"], [320, "#b07a50"]].forEach(([deg, col]) => wrap(at(deg), (p) => {
        x.fillStyle = col; x.beginPath(); x.ellipse(p, 340, 50, 30, 0, Math.PI, 0); x.fill();
        x.strokeStyle = "rgba(0,0,0,.25)"; x.lineWidth = 2;
        for (let k = 0; k < 5; k++) { x.beginPath(); x.ellipse(p, 340, 46 - k * 9, 26 - k * 5, 0, Math.PI, 0); x.stroke(); }
      }));
      // Anemone with clownfish
      wrap(at(120), (p) => {
        x.strokeStyle = "#c88ab0"; x.lineWidth = 5; x.lineCap = "round";
        for (let k = -6; k <= 6; k++) { x.beginPath(); x.moveTo(p + k * 4, 340); x.quadraticCurveTo(p + k * 10, 300, p + k * 12 + Math.sin(k) * 8, 270); x.stroke(); }
        [[-30, 240], [26, 226]].forEach(([dx, y]) => {
          x.fillStyle = "#ec7a2f"; x.beginPath(); x.ellipse(p + dx, y, 16, 9, 0, 0, Math.PI * 2); x.fill();
          x.beginPath(); x.moveTo(p + dx - 14, y); x.lineTo(p + dx - 24, y - 8); x.lineTo(p + dx - 24, y + 8); x.fill();
          x.fillStyle = "#fff"; x.fillRect(p + dx - 3, y - 9, 4, 18); x.fillRect(p + dx + 7, y - 7, 3, 14);
        });
      });
      // Sea turtle
      wrap(at(300), (p) => {
        x.fillStyle = "#4f6b3a"; x.beginPath(); x.ellipse(p, 170, 46, 30, -0.4, 0, Math.PI * 2); x.fill();
        x.strokeStyle = "#384d29"; x.lineWidth = 2; for (let k = -1; k <= 1; k++) { x.beginPath(); x.ellipse(p + k * 14, 170 - k * 6, 10, 8, -0.4, 0, Math.PI * 2); x.stroke(); }
        x.fillStyle = "#7f9a5a"; x.beginPath(); x.ellipse(p + 46, 146, 13, 10, -0.4, 0, Math.PI * 2); x.fill();
        [[24, 140, -1.2], [-30, 198, 0.6], [20, 198, 0.8], [-36, 150, -0.6]].forEach(([dx, y, a]) => { x.beginPath(); x.ellipse(p + dx, y, 20, 7, a, 0, Math.PI * 2); x.fill(); });
      });
      // Small fish schools
      for (let i = 0; i < 30; i++) {
        const px = r() * W, py = 60 + r() * 200;
        wrap(px, (p) => { x.fillStyle = r() > .5 ? "#f4d35e" : "#7fd8d3"; x.beginPath(); x.ellipse(p, py, 8, 4, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.moveTo(p - 7, py); x.lineTo(p - 13, py - 4); x.lineTo(p - 13, py + 4); x.fill(); });
      }
    }
    return c;
  }

  /* ───────── Habitat level ───────── */
  function mountScene(el, sceneId, api) {
    const S = SCENES[sceneId];
    const pano = drawScene(sceneId);
    let heading = (S.task.deg + 90) % 360; // start facing away from the task direction
    const found = new Set();
    let taskDone = false;
    let raf = null;

    el.innerHTML = `
      <div class="fs">
        <div class="fs__view" tabindex="0" aria-label="${esc(S.name)} panorama. Use the arrow keys or the Look buttons to turn.">
          <canvas class="fs__canvas"></canvas>
          <div class="fs__hotspots"></div>
          <button type="button" class="fs__look fs__look--l" data-look="-30" aria-label="Look left">${icon("arrowLeft")}</button>
          <button type="button" class="fs__look fs__look--r" data-look="30" aria-label="Look right">${icon("arrowRight")}</button>
          <span class="fs__place">${icon("map")}${esc(S.name)}</span>
        </div>
        <div class="fs__compass" aria-hidden="true"><div class="fs__strip"></div><span class="fs__needle"></span></div>
        <p class="fs__heading" aria-live="polite">Facing <b id="fs-deg"></b></p>
        <div class="fs__panels">
          <div class="lab-panel">
            <h3>Field log: clues found <span class="muted" id="fs-count"></span></h3>
            <ul class="fs__log" id="fs-log"></ul>
            <button type="button" class="btn btn--ghost btn--small" id="fs-scan">${icon("search")}Scan for a clue</button>
          </div>
          <div class="lab-panel fs__task" id="fs-task">
            <h3>${icon("compass", 'class="inline-icon"')}Compass check</h3>
            <p>${esc(S.task.prompt)}</p>
            <button type="button" class="btn btn--primary btn--small" id="fs-face">I'm facing it</button>
          </div>
        </div>
        <div class="lab-panel fs__card" id="fs-card" hidden></div>
      </div>`;

    const view = el.querySelector(".fs__view");
    const canvas = el.querySelector(".fs__canvas");
    const ctx = canvas.getContext("2d");
    const hot = el.querySelector(".fs__hotspots");
    const strip = el.querySelector(".fs__strip");

    // Compass strip: two laps of N/E/S/W ticks so it can wrap
    const labels = { 0: "N", 45: "NE", 90: "E", 135: "SE", 180: "S", 225: "SW", 270: "W", 315: "NW" };
    let stripHtml = "";
    for (let lap = -1; lap <= 1; lap++) for (let d = 0; d < 360; d += 15) {
      stripHtml += `<span class="tick ${labels[d] ? "tick--major" : ""}" style="left:${(lap * 360 + d) * 4}px">${labels[d] ? `<i>${labels[d]}</i>` : ""}</span>`;
    }
    strip.innerHTML = stripHtml;

    S.clues.forEach((c, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "fs__spot";
      b.dataset.i = i;
      b.setAttribute("aria-label", `Clue: ${c.title}`);
      b.innerHTML = `<span>${icon("search")}</span>`;
      hot.appendChild(b);
    });

    const dirName = (d) => ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"][Math.round(((d % 360) + 360) % 360 / 45) % 8];
    function draw() {
      const vw = view.clientWidth, vh = view.clientHeight;
      if (canvas.width !== vw || canvas.height !== vh) { canvas.width = vw; canvas.height = vh; }
      const scale = vh / H;
      const worldW = W * scale;
      let off = ((heading / 360) * worldW - vw / 2) % worldW;
      if (off < 0) off += worldW;
      ctx.drawImage(pano, 0, 0, W, H, -off, 0, worldW, vh);
      ctx.drawImage(pano, 0, 0, W, H, -off + worldW, 0, worldW, vh);
      if (off + vw > 2 * worldW - vw) ctx.drawImage(pano, 0, 0, W, H, -off + 2 * worldW, 0, worldW, vh);
      [...hot.children].forEach((b) => {
        const c = S.clues[b.dataset.i];
        let sx = ((c.deg / 360) * worldW - off) % worldW;
        if (sx < -40) sx += worldW;
        const visible = sx > 10 && sx < vw - 10;
        b.hidden = !visible;
        b.style.left = `${sx}px`;
        b.style.top = `${c.y * scale}px`;
        b.classList.toggle("is-found", found.has(Number(b.dataset.i)));
      });
      strip.style.transform = `translateX(${-(heading * 4) + strip.parentElement.clientWidth / 2}px)`;
      const deg = Math.round(((heading % 360) + 360) % 360);
      el.querySelector("#fs-deg").textContent = `${deg}° (${dirName(deg)})`;
    }
    function turn(by) { heading = (heading + by + 360) % 360; draw(); }
    function animateTo(target) {
      cancelAnimationFrame(raf);
      const start = heading;
      let diff = ((target - start + 540) % 360) - 180;
      const t0 = performance.now();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const step = (t) => {
        const k = reduce ? 1 : Math.min(1, (t - t0) / 700);
        heading = (start + diff * (1 - Math.pow(1 - k, 3)) + 360) % 360;
        draw();
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }

    // Drag to look around
    let dragX = null;
    view.addEventListener("pointerdown", (e) => { if (e.target.closest("button")) return; dragX = e.clientX; view.setPointerCapture(e.pointerId); view.classList.add("is-drag"); });
    view.addEventListener("pointermove", (e) => {
      if (dragX === null) return;
      const vw = view.clientWidth, worldW = W * (view.clientHeight / H);
      turn(-((e.clientX - dragX) / worldW) * 360);
      dragX = e.clientX;
    });
    const endDrag = () => { dragX = null; view.classList.remove("is-drag"); };
    view.addEventListener("pointerup", endDrag);
    view.addEventListener("pointercancel", endDrag);
    view.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); turn(-10); }
      if (e.key === "ArrowRight") { e.preventDefault(); turn(10); }
    });
    el.querySelectorAll("[data-look]").forEach((b) => b.addEventListener("click", () => animateTo(heading + Number(b.dataset.look))));

    function renderLog() {
      el.querySelector("#fs-count").textContent = `${found.size} of ${S.clues.length}`;
      el.querySelector("#fs-log").innerHTML = S.clues.map((c, i) => found.has(i)
        ? `<li class="is-found">${icon("check")}<span><strong>${esc(c.title)}</strong> · ${c.deg}° ${dirName(c.deg)}</span></li>`
        : `<li>${icon("search")}<span>Not found yet</span></li>`).join("");
    }

    function openCard(i) {
      const c = S.clues[i];
      const card = el.querySelector("#fs-card");
      card.hidden = false;
      card.innerHTML = `
        <span class="eyebrow">Clue at ${c.deg}° ${dirName(c.deg)}</span>
        <h3>${esc(c.title)}</h3>
        <p class="fs__see"><strong>Observation (what you see):</strong> ${esc(c.see)}</p>
        <p><strong>Inference (what it might mean):</strong> ${esc(c.q)}</p>
        <div class="choice-grid">${c.options.map((o, k) => `<button type="button" class="choice" data-opt="${k}">${esc(o)}</button>`).join("")}</div>
        <p class="explain" id="fs-why" hidden></p>`;
      card.querySelectorAll("[data-opt]").forEach((b) => b.addEventListener("click", () => {
        const k = Number(b.dataset.opt);
        if (k === c.a) {
          b.classList.add("is-right");
          card.querySelectorAll("[data-opt]").forEach((x) => (x.disabled = true));
          const why = card.querySelector("#fs-why");
          why.hidden = false;
          why.innerHTML = `<strong>Good inference.</strong> ${esc(c.why)}`;
          found.add(i);
          api.log("lab_clue", { scene: sceneId, clue: i });
          renderLog(); draw(); check();
        } else {
          b.classList.add("is-wrong");
          b.disabled = true;
          api.say("Not quite. Look again at the observation. Which explanation fits what you can actually see?", "warn");
        }
      }));
      card.scrollIntoView({ block: "nearest", behavior: "smooth" });
      card.querySelector("h3").setAttribute("tabindex", "-1");
      card.querySelector("h3").focus({ preventScroll: true });
    }
    hot.addEventListener("click", (e) => { const b = e.target.closest(".fs__spot"); if (b) { api.say(""); openCard(Number(b.dataset.i)); } });

    el.querySelector("#fs-scan").addEventListener("click", () => {
      const left = S.clues.map((c, i) => ({ c, i })).filter((x) => !found.has(x.i));
      if (!left.length) return;
      // Nearest unfound clue by angle
      left.sort((a, b) => Math.abs(((a.c.deg - heading + 540) % 360) - 180) - Math.abs(((b.c.deg - heading + 540) % 360) - 180));
      animateTo(left[0].c.deg);
      api.say(`Scanning… there's something to the ${dirName(left[0].c.deg)}. Tap the search marker.`, "info");
    });
    el.querySelector("#fs-face").addEventListener("click", () => {
      const off = Math.abs(((heading - S.task.deg + 540) % 360) - 180);
      if (off <= 25) {
        taskDone = true;
        el.querySelector("#fs-task").innerHTML = `<h3>${icon("check", 'class="inline-icon"')}Compass check done</h3><p>You faced ${esc(S.task.label)}. Compass headings are measured in degrees clockwise from north.</p>`;
        api.log("lab_compass", { scene: sceneId });
        check();
      } else {
        api.say(`You're facing ${Math.round(heading)}° (${dirName(heading)}). Turn until the compass shows ${S.task.label}. Remember: north is 0°, east is 90°, south is 180°, west is 270°.`, "warn");
      }
    });

    function check() {
      if (found.size === S.clues.length && taskDone) {
        api.say(`Field log complete for the ${S.name}!`, "good");
        api.win({ scene: sceneId, clues: found.size });
      } else if (found.size === S.clues.length) {
        api.say("All clues found! Finish the compass check to complete your field log.", "info");
      }
    }

    const ro = new ResizeObserver(draw);
    ro.observe(view);
    renderLog();
    draw();
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }

  /* ───────── Compare habitats (sorting) ───────── */
  const HABS = ["tidepool", "northwoods", "rainforest", "desert", "reef"];
  const TRAITS = [
    ["Shell seals shut to stay wet at low tide", "tidepool"],
    ["Air bubbles float seaweed up toward light", "tidepool"],
    ["Cone shape lets heavy snow slide off", "northwoods"],
    ["Legs at the back for diving after fish", "northwoods"],
    ["Roots spread wide because the soil is thin", "rainforest"],
    ["Leaves with drip tips shed daily rain", "rainforest"],
    ["Pleated stem swells to store water", "desert"],
    ["Big ears let body heat escape", "desert"],
    ["Tiny animals build hard skeletons", "reef"],
    ["Fish and anemone protect each other", "reef"]
  ];
  function mountCompare(el, api) {
    const order = SE.shuffle(TRAITS.map((t, i) => i), "compare");
    const placed = {};
    let selected = null;
    el.innerHTML = `
      <div class="sorter">
        <div class="lab-panel">
          <h3>Adaptations</h3>
          <p class="muted">Tap an adaptation, then tap the habitat where it helps a living thing survive.</p>
          <div class="sort-cards" id="sort-cards"></div>
        </div>
        <div class="sort-bins sort-bins--5">
          ${HABS.map((h) => `<button type="button" class="sort-bin" data-bin="${h}"><strong>${esc(SCENES[h].short || SCENES[h].name)}</strong><ul data-list="${h}"></ul></button>`).join("")}
        </div>
      </div>`;
    function render() {
      el.querySelector("#sort-cards").innerHTML = order.filter((i) => !placed[i]).map((i) => `<button type="button" class="sort-card" data-card="${i}" aria-pressed="${selected === i}">${esc(TRAITS[i][0])}</button>`).join("") || `<p class="muted">All sorted!</p>`;
      HABS.forEach((h) => {
        el.querySelector(`[data-list="${h}"]`).innerHTML = Object.keys(placed).filter((i) => placed[i] === h).map((i) => `<li>${icon("check")}${esc(TRAITS[i][0])}</li>`).join("");
      });
    }
    el.addEventListener("click", (e) => {
      const card = e.target.closest("[data-card]");
      const bin = e.target.closest("[data-bin]");
      if (card) { selected = Number(card.dataset.card); render(); return; }
      if (bin && selected !== null) {
        const h = bin.dataset.bin;
        if (TRAITS[selected][1] === h) {
          placed[selected] = h;
          api.say(`Yes, that helps living things in the ${SCENES[h].name}.`, "good");
          selected = null;
          render();
          if (Object.keys(placed).length === TRAITS.length) api.win({ sorted: TRAITS.length });
        } else {
          api.say(`Think again. Would that trait help in the ${SCENES[h].name}? What problem does it solve?`, "warn");
          api.log("lab_miss", { trait: selected, bin: h });
        }
      } else if (bin) api.say("First tap an adaptation card, then tap a habitat.", "info");
    });
    render();
  }

  /* ───────── Observation or inference? ───────── */
  const STATEMENTS = [
    ["The moose is standing in the pond.", "obs", "You can see this directly."],
    ["The moose went in the pond to stay cool.", "inf", "That's a good explanation, but you can't see why the moose went in. You'd need more evidence."],
    ["The leaves have long pointed tips.", "obs", "You can see this directly."],
    ["The pointed tips help rain run off.", "inf", "This explains why, based on what you saw. You can't see it directly."],
    ["The fox has very large ears.", "obs", "You can see and measure this."],
    ["The fox is cooling off in the shade.", "inf", "You see the fox in the shade, but 'cooling off' is your explanation."],
    ["Some of the coral is white.", "obs", "You can see the color."],
    ["The water got too warm for the coral.", "inf", "This is a likely explanation, but you'd need more evidence, like a thermometer reading."],
    ["There are tracks leading into the holes.", "obs", "You can see the tracks."],
    ["A lizard lives in that hole.", "inf", "You haven't seen a lizard. This is a guess based on clues."]
  ];
  function mountObsInf(el, api) {
    const order = SE.shuffle(STATEMENTS.map((_, i) => i), "obsinf");
    const answered = {};
    el.innerHTML = `
      <div class="lab-panel">
        <h3>Sort each statement</h3>
        <p class="muted">An <strong>observation</strong> is something you can directly see, hear, or measure. An <strong>inference</strong> is an explanation you figure out from observations.</p>
        <ol class="oi-list">${order.map((i) => `
          <li data-row="${i}">
            <p>“${esc(STATEMENTS[i][0])}”</p>
            <div class="seg" role="group" aria-label="Observation or inference">
              <button type="button" data-ans="obs" data-i="${i}">Observation</button>
              <button type="button" data-ans="inf" data-i="${i}">Inference</button>
            </div>
            <p class="oi-why" hidden></p>
          </li>`).join("")}</ol>
      </div>`;
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-ans]");
      if (!b) return;
      const i = Number(b.dataset.i);
      const row = el.querySelector(`[data-row="${i}"]`);
      const right = STATEMENTS[i][1] === b.dataset.ans;
      row.querySelectorAll("[data-ans]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      const why = row.querySelector(".oi-why");
      why.hidden = false;
      why.className = `oi-why ${right ? "is-right" : "is-wrong"}`;
      why.textContent = `${right ? "Correct." : "Not quite."} ${STATEMENTS[i][2]}`;
      answered[i] = right;
      const correct = Object.values(answered).filter(Boolean).length;
      if (correct === STATEMENTS.length) { api.say(`All ${STATEMENTS.length} sorted correctly. You can tell what you see from what you think!`, "good"); api.win({ correct }); }
      else api.say(`${correct} of ${STATEMENTS.length} correct so far.`, "info");
    });
  }

  const LEVELS = [
    { title: "Maine tide pools", concept: "Observe and infer", scene: "tidepool",
      goal: "Find all 4 clues in a Gulf of Maine tide pool at low tide and complete the compass check.",
      steps: ["Drag the view, use the arrow keys, or tap the Look buttons to turn around.", "Tap a search marker to examine a clue.", "Choose the inference that best fits what you see."],
      hint: "Use “Scan for a clue” if you're stuck. For the compass check, watch the strip under the view: east is 90°.",
      learned: "Scientists separate observations (what they see) from inferences (what they think it means). Tide pool life has adaptations for a home that is underwater half the day and dry the other half." },
    { title: "North Woods", concept: "Adaptations", scene: "northwoods",
      goal: "Find all 4 clues at a North Woods pond below Katahdin and complete the compass check.",
      hint: "Think about Maine's long, snowy winters and how much life depends on water. North is 0° (or 360°).",
      learned: "North Woods living things are shaped by cold winters and lots of water: trees that shed snow, divers built for lakes, and beavers that build whole new ponds." },
    { title: "Rainforest", concept: "Observe and infer", scene: "rainforest",
      goal: "Leave Maine for the Amazon. Find all 4 clues in the rainforest and complete the compass check.",
      hint: "Use “Scan for a clue” if you're stuck. For the compass check, watch the strip under the view: south is 180°.",
      learned: "A rainforest gets rain almost every day and very little light reaches the ground. Its living things are shaped by those two facts." },
    { title: "Desert", concept: "Adaptations", scene: "desert",
      goal: "Find all 4 clues in the Sonoran Desert and complete the compass check.",
      hint: "Many desert adaptations are about saving water or staying cool. West is 270°, where the sun sets.",
      learned: "Desert life is shaped by heat and scarce water: storing water, losing heat, and staying underground during the day." },
    { title: "Coral reef", concept: "Ecosystems", scene: "reef",
      goal: "Find all 4 clues on the coral reef and complete the compass check.",
      hint: "North is 0° (or 360°). Some reef clues are about living things helping each other.",
      learned: "A reef is built by tiny animals. Its living things depend on each other, and changes like warmer water can harm the whole ecosystem." },
    { title: "Compare habitats", concept: "Compare with evidence",
      goal: "Sort 10 adaptations into the habitat where each one helps living things survive, from Maine to the tropics.",
      hint: "For each trait, ask: what problem does it solve? Drying out at low tide, deep snow, too much rain, too little water, or life on a warm reef?",
      learned: "Comparing habitats shows a big idea: living things in different places solve different problems, so they have different adaptations." },
    { title: "Observation or inference?", concept: "Thinking like a scientist",
      goal: "Sort all 10 statements correctly.",
      hint: "Ask: could I point to it, or measure it, right now? If yes, it's an observation. If it explains why, it's an inference.",
      learned: "Good field scientists record observations first and label their inferences as ideas to test. That keeps evidence and guesses separate." }
  ];

  SE.labs.register({
    id: "field-station",
    area: "vr",
    title: "Field Station 360",
    tagline: "Start in Maine's tide pools and North Woods, then travel the world. Look all around five habitats, find clues, and think like a field scientist. Works with a mouse, touch screen, or a VR headset's browser.",
    levels: LEVELS,
    mount(el, idx, api) {
      const L = LEVELS[idx];
      if (L.scene) return mountScene(el, L.scene, api);
      if (idx === 5) return mountCompare(el, api);
      return mountObsInf(el, api);
    }
  });
})();
