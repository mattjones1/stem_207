/*
 * Build Your First Website — the businesses and the 8 stages (data only; lab-website.js runs them).
 * Every business is made up: no real addresses, phone numbers, or people.
 *
 * A stage: title, concept, kind ("plan" | "code"), source ("project" | "debug" | "ship"), goal, steps,
 *   hints: [notice, idea, scaffold], learned, tags (Tag Shelf buttons), css (show the CSS tab),
 *   checks (check ids that must be "good" to finish), example(biz) (an Extra help snippet: real code to edit)
 * Check ids are defined in lab-website.js: h1 p list h2 img alt link style contrast narrow phone own.
 */
(function () {
  "use strict";
  const SE = (window.SE = window.SE || {});

  const BUSINESSES = {
    bakery: {
      id: "bakery", name: "Casco Bay Bakery", pic: "muffins.svg", kind: "a small bakery",
      about: "Fresh bread, blueberry muffins, and pastries, baked every morning.",
      owner: "The owner wants customers to find out fast what the bakery sells.",
      items: ["Blueberry muffins", "Sourdough bread", "Maple scones"], section: "menu", sectionTitle: "Our menu",
      alt: "A tray of fresh blueberry muffins", link: "See our bakery menu"
    },
    kayak: {
      id: "kayak", name: "Pine Coast Kayak Rentals", pic: "kayak.svg", kind: "a kayak rental company",
      about: "Beginner-friendly paddling trips on calm coastal water.",
      owner: "The owner wants visitors to see the rentals and find trip information.",
      items: ["Single kayak rentals", "Tandem kayak rentals", "Beginner paddling lessons"], section: "rentals", sectionTitle: "Rentals",
      alt: "An orange kayak on calm water near a pine shore", link: "Explore kayak rentals"
    },
    tackle: {
      id: "tackle", name: "Harbor Bait & Tackle", pic: "tackle.svg", kind: "a bait and tackle shop",
      about: "Bait, tackle, and fishing supplies for the harbor.",
      owner: "The owner wants customers to find supplies, opening hours, and store information.",
      items: ["Fresh bait", "Hooks and fishing line", "Lobster buoys"], section: "hours", sectionTitle: "Store hours",
      alt: "A green tackle box next to a red and white lobster buoy", link: "View our store hours"
    }
  };

  /* What each code stage adds, as example code for one business (the Extra help "Show an example"). */
  const ex = {
    bones: (b) => `<h1>${b.name}</h1>\n<p>${b.about}</p>\n`,
    story: (b) => `<h2 id="${b.section}">${b.sectionTitle}</h2>\n<ul>\n${b.items.map((i) => `  <li>${i}</li>`).join("\n")}\n</ul>\n`,
    media: (b) => `<img src="${b.pic}" alt="${b.alt}">\n<p><a href="#${b.section}">${b.link}</a></p>\n`,
    style: () => `body {\n  background-color: #fff7e8;\n  color: #213547;\n  padding: 1em;\n}\nh1 {\n  color: #145b72;\n}\n`
  };

  const STAGES = [
    {
      title: "Meet Your Maine Business", concept: "Plan before you code", kind: "plan",
      goal: "Pick a business, sketch a wireframe on paper, and test it with a partner for five seconds.",
      steps: ["Pick one of the three businesses.", "On paper, draw boxes for the title, heading, description, list, picture, and link.", "Show your sketch to a partner for five seconds, then hide it.", "Write what your partner noticed, and one thing you'll change."],
      hints: ["A wireframe is just boxes with labels. No coloring needed.", "Put the most important thing for a customer near the top.", "Ask your partner: What is this business? What does it offer? What would you look for next?"],
      learned: "Web designers plan and test with real people before they write code. A five-second test shows what people notice first.",
      checks: []
    },
    {
      title: "Build the Bones", concept: "HTML structure", kind: "code", source: "project",
      goal: "Write a main heading with <h1> and a paragraph with <p> about your business.",
      steps: ["Type a main heading: <h1>, the business name, then </h1>.", "Add a paragraph about the business: <p>…</p>.", "Change the words in your heading and watch the preview change."],
      hints: ["Tags come in pairs. <h1> opens the heading and </h1> closes it.", "HTML tells the browser what each part means. <h1> means the page's main heading, not just big words.", "Try: <h1>Casco Bay Bakery</h1> then <p>Fresh bread every morning.</p>"],
      learned: "HTML gives a page its structure. An <h1> tells people and screen readers what the whole page is about.",
      tags: ["h1", "p"], checks: ["h1", "p"], example: (b) => ex.bones(b)
    },
    {
      title: "Tell Your Story", concept: "Paragraphs and lists", kind: "code", source: "project",
      goal: "Add a section heading with <h2> and a list of what your business offers.",
      steps: ["Add a section heading: <h2>…</h2>.", "Add a list: <ul>, then one <li> for each thing you offer, then </ul>.", "Use your own words."],
      hints: ["A list is one <ul> with several <li> items inside it.", "<h2> is a smaller heading for one part of the page. It helps people find their way.", "<ul>\n  <li>Blueberry muffins</li>\n  <li>Sourdough bread</li>\n</ul>"],
      learned: "HTML describes what information is: a heading, a paragraph, a list. That structure helps every visitor, including people using screen readers.",
      tags: ["h2", "p", "ul", "ol", "li"], checks: ["h1", "p", "h2", "list"], example: (b) => ex.story(b)
    },
    {
      title: "Connect and Illustrate", concept: "Links and images", kind: "code", source: "project",
      goal: "Add a picture with alt text, and a link with clear words that jumps to a part of your page.",
      steps: ["Add a picture: <img src=\"muffins.svg\" alt=\"…\">. Pick the picture for your business.", "Write alt text that says what's in the picture.", "Give your <h2> an id, like <h2 id=\"menu\">.", "Add a link to it: <a href=\"#menu\">See our bakery menu</a>."],
      hints: ["The pictures you can use are listed under the code: muffins.svg, kayak.svg, and tackle.svg.", "Alt text is read aloud for people who can't see the picture. Link words should say where the link goes, not \"click here\".", "<a href=\"#menu\"> jumps to the part of the page with id=\"menu\"."],
      learned: "Images need alt text, and links need words that say where they go. Those two habits make the web work for more people.",
      tags: ["img", "a", "id"], checks: ["h1", "p", "list", "img", "alt", "link"], example: (b) => ex.media(b)
    },
    {
      title: "Give Your Website Style", concept: "CSS", kind: "code", source: "project", css: true,
      goal: "In the CSS tab, set the page's background color and text color, and make one more style choice.",
      steps: ["Open the CSS tab.", "Write a rule for body: background-color and color.", "Add one more style, like padding, a font, or a border.", "Try the color helper: pick a color and watch the code change."],
      hints: ["A CSS rule is: a selector, then { property: value; }.", "HTML is what the parts are. CSS is how they look. body { … } styles the whole page.", "body {\n  background-color: #fff7e8;\n  color: #213547;\n  padding: 1em;\n}"],
      learned: "CSS controls how a page looks: selectors pick parts of the page, and properties and values change them.",
      tags: [], checks: ["style"], example: () => ex.style()
    },
    {
      title: "Build for Everyone", concept: "Accessibility", kind: "code", source: "project", css: true,
      goal: "Make your page work for more people: a main heading, alt text, clear links, and text with a contrast of at least 4.5 to 1.",
      steps: ["Press Check my page.", "Fix anything that says Needs a fix.", "Use the contrast meter: make the text darker or the background lighter until it says Readable.", "Read Check with a person items out loud to a partner."],
      hints: ["Look at the contrast meter under the preview.", "Text needs to stand out from its background so more people can read it, like someone on a sunny screen or with low vision.", "Dark text on a light background works well: color: #213547 on background-color: #fff7e8."],
      learned: "Accessibility is part of good design. Headings, alt text, clear links, and readable colors help people with different needs use your page.",
      tags: ["h1", "img", "a"], checks: ["h1", "alt", "link", "contrast"]
    },
    {
      title: "Fix the Broken Website", concept: "Debugging", kind: "code", source: "debug", css: true,
      goal: "Another developer left this page with four problems. Use Check my page to find them, then fix all four.",
      steps: ["Press Check my page to see what kinds of problems there are.", "Press it again to find where each one is.", "Fix them one at a time, and check again."],
      hints: ["Check names four areas: the heading, the picture, the link, and the colors.", "Tap Find it on a problem to jump to its code.", "The title is a <p> made to look big. A real main heading uses <h1>."],
      learned: "Professional developers test pages against a checklist and fix problems one at a time. You found and fixed four real bugs.",
      tags: ["h1", "img", "a"], checks: ["h1", "alt", "link", "contrast"]
    },
    {
      title: "Ship Your First Website", concept: "Create", kind: "code", source: "ship", css: true,
      goal: "Build your business's page on your own: heading, paragraph, list, picture with alt text, a clear link, your own styles, and readable colors. Check it on a phone, then mark it ready.",
      steps: ["Look back at your wireframe and your earlier page.", "Write the HTML, then the CSS.", "Look at the Phone preview.", "Press Check my page and fix what it finds.", "Press Mark ready for review."],
      hints: ["Start with the bones: <h1> and <p>. Then add the rest one piece at a time.", "Check often. Each check tells you the next thing the page needs.", "Look back at your earlier page with Show my earlier page. You can type the same tags again."],
      learned: "You planned a website, wrote the code, tested it, fixed mistakes, and made a page other people can understand and use.",
      tags: ["h1", "h2", "p", "ul", "li", "img", "a", "id"], checks: ["h1", "p", "list", "img", "alt", "link", "style", "contrast", "narrow", "phone", "own"]
    }
  ];

  /* The broken page for stage 7 (a made-up ice cream shop). Four bugs: a fake heading, a missing alt,
     "click here", and low contrast. */
  const BROKEN = {
    html: `<p class="title">Puffin Point Ice Cream</p>
<p>Homemade ice cream by the harbor, open every summer day.</p>
<img src="lighthouse.svg">
<h2 id="flavors">This week's flavors</h2>
<ul>
  <li>Wild blueberry</li>
  <li>Maple walnut</li>
  <li>Sea salt caramel</li>
</ul>
<p>To see all our flavors, <a href="#flavors">click here</a>.</p>
`,
    css: `.title {
  font-size: 2.2em;
  font-weight: bold;
}
body {
  background-color: #ffffff;
  color: #b8b8b8;
  padding: 1em;
}
`
  };
  const SHIP = { html: "<h1></h1>\n", css: "body {\n  \n}\n" };

  SE.websiteStages = { BUSINESSES, STAGES, BROKEN, SHIP, ex };
})();
