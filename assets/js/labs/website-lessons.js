/*
 * Build Your First Website — teaching content for the code stages (data only; lab-website.js uses it).
 * EXAMPLES[stage]: Show an Example for each stage, about a separate demo topic (Maine Moose Facts), so the example
 *   shows the idea without doing the student's own page. { html, css?, notes: [{ match, say }], snippet, snippetLang? }
 *   snippet is a small starter the student can insert at the cursor (it asks first): a pattern, never the whole answer.
 * Stage numbers are 0-based, like STAGES in website-stages.js.
 */
(function () {
  "use strict";
  const SE = (window.SE = window.SE || {});
  const MOOSE_CSS = "body {\n  background-color: #f3f7ee;\n  color: #1f3324;\n  font-family: Georgia, serif;\n  padding: 1rem;\n}\nh1 {\n  color: #2f5d3a;\n}";

  const EXAMPLES = {
    1: {
      html: "<h1>Maine Moose Facts</h1>\n<p>Moose are the biggest animals in Maine's forests, and they love ponds.</p>",
      notes: [
        { match: "<h1>", say: "<h1> opens the main heading. </h1> closes it. The words between are the heading." },
        { match: "<p>", say: "<p> makes a paragraph: a full sentence or two about the topic." }
      ],
      snippet: "<h1>Your website's name</h1>\n<p>One sentence that introduces your idea.</p>"
    },
    2: {
      html: "<h1>Maine Moose Facts</h1>\n<p>Moose are the biggest animals in Maine's forests.</p>\n<section>\n  <h2>What moose eat</h2>\n  <ul>\n    <li>Leaves and twigs</li>\n    <li>Water plants</li>\n    <li>Tree bark in winter</li>\n  </ul>\n</section>",
      notes: [
        { match: "<section>", say: "<section> groups one part of the page. Everything inside it belongs to that part." },
        { match: "<h2>", say: "<h2> is a section heading: smaller than <h1>, for one part of the page." },
        { match: "<ul>", say: "<ul> starts a bullet list. Each item inside it is an <li>." },
        { match: "<li>", say: "<li> is one list item. It's nested inside the <ul>, so it's indented." }
      ],
      snippet: "<h2>A title for this part</h2>\n<ul>\n  <li>First thing</li>\n  <li>Second thing</li>\n</ul>"
    },
    3: {
      html: "<h1>Maine Moose Facts</h1>\n<p><a href=\"#food\">Jump to what moose eat</a></p>\n<img src=\"moose.svg\" alt=\"A moose standing near the mountains\">\n<h2 id=\"food\">What moose eat</h2>\n<p>Leaves, twigs, and water plants.</p>",
      notes: [
        { match: "href=\"#food\"", say: "href=\"#food\" jumps to the part of the page with id=\"food\". The words say where it goes." },
        { match: "<img", say: "<img> shows a picture. src picks it, and alt describes it for people who can't see it. No closing tag." },
        { match: "id=\"food\"", say: "id=\"food\" names this heading, so the link can jump to it." }
      ],
      snippet: "<img src=\"lighthouse.svg\" alt=\"Describe what's in the picture\">\n<a href=\"#an-id\">Words that say where this goes</a>"
    },
    4: {
      html: "<h1>Maine Moose Facts</h1>\n<p>Moose are the biggest animals in Maine's forests.</p>",
      css: MOOSE_CSS,
      notes: [
        { match: "<h1>", say: "The CSS rule h1 { color: #2f5d3a; } turns every <h1> dark green." },
        { match: "<p>", say: "The body rule sets the background, the text color, and the font for the whole page, so this paragraph gets them too." }
      ],
      snippet: "body {\n  background-color: #fff7e8;\n  color: #213547;\n  padding: 1rem;\n}",
      snippetLang: "css"
    },
    5: {
      html: "<h1>Maine Moose Facts</h1>\n<img src=\"moose.svg\" alt=\"A moose standing near the mountains\">\n<p><a href=\"#food\">See what moose eat</a></p>\n<h2 id=\"food\">What moose eat</h2>\n<p>Leaves, twigs, and water plants.</p>",
      css: MOOSE_CSS,
      notes: [
        { match: "alt=", say: "Good alt text says what's in the picture, in a few words. A screen reader reads it out loud." },
        { match: "See what moose eat", say: "Good link words say where the link goes. \"Click here\" doesn't." },
        { match: "<h1>", say: "One <h1>, then <h2> for each section: headings in order help everyone find their way." }
      ],
      snippet: "alt=\"What the picture shows\""
    },
    6: {
      html: "<h1>Maine Moose Facts</h1>\n<p>Moose can swim for miles.</p>\n<img src=\"moose.svg\" alt=\"A moose standing near the mountains\">\n<p><a href=\"#food\">See what moose eat</a></p>\n<h2 id=\"food\">What moose eat</h2>",
      css: MOOSE_CSS,
      notes: [
        { match: "<h1>", say: "A real heading uses <h1>, not a big <p>. Screen readers and search engines can tell the difference." },
        { match: "alt=", say: "Every picture needs alt text that describes it." },
        { match: "See what moose eat", say: "Link words that say where they go, not \"click here\"." }
      ],
      snippet: "<h1>The page's real title</h1>"
    },
    7: {
      html: "<h1>Maine Moose Facts</h1>\n<p>Moose are the biggest animals in Maine's forests, and they love ponds and lakes.</p>\n<img src=\"moose.svg\" alt=\"A moose standing near the mountains\">\n<p><a href=\"#food\">See what moose eat</a></p>\n<h2 id=\"food\">What moose eat</h2>\n<ul>\n  <li>Leaves and twigs</li>\n  <li>Water plants</li>\n</ul>",
      css: MOOSE_CSS + "\nimg {\n  max-width: 100%;\n}",
      notes: [
        { match: "<h1>", say: "A finished page: a main heading, a paragraph, a picture with alt text, a clear link, a section, and a list." },
        { match: "<ul>", say: "The list is inside the section it belongs to." }
      ],
      snippet: "<h2>Another part of my page</h2>\n<p>A sentence about it.</p>"
    }
  };
  /* LESSONS[stage]: the lesson stepper in the left panel. Learn first, then try.
     { building, why, learn: [{ h, say: [..], code? }], start, experiments: [{ predict, options: [..], answer, explain }],
       check, mistakes: [..] }. "What you just learned" comes from the stage's own learned line. */
  const LESSONS = {
    1: {
      building: "The bones of your website: the biggest headline, so visitors know what your page is about, and a first paragraph.",
      why: "Every website is built from HTML. Headlines help people understand what they're looking at, and they help browsers and screen readers understand how the page is organized.",
      learn: [
        { h: "How the web works", say: ["A browser, like Chrome, reads a file of HTML and draws the page you see. HTML says what each part is. CSS says how it looks. JavaScript adds things that move or react, but you won't need it for your first website."] },
        { h: "The parts of a web page file", say: ["Every page starts with the same lines: <!DOCTYPE html> says \"this is modern HTML\", <head> holds information for the browser, like the <title>, and <body> holds everything visitors see. Open the locked lines at the top of your code to see them. You write inside the body."] },
        { h: "Elements and tags", say: ["An element is one part of a page, like a heading. It has an opening tag, what's inside, and a closing tag with a slash.", "The opening tag <h1> says where the heading starts. The closing tag </h1> says where it ends. The words between them are what visitors see."], code: "<h1>Maine Moose Facts</h1>" },
        { h: "Headings and paragraphs", say: ["<h1> is the main heading. A page has one. <h2> is a smaller heading for one part of the page.", "<p> is a paragraph: sentences that go together."], code: "<h1>Maine Moose Facts</h1>\n<p>Moose love ponds.</p>" }
      ],
      start: "Your code already has an empty <h1></h1>. Type your website's name between the tags, or use My plan → Use as my <h1>. Then add a <p> with your opening sentence.",
      experiments: [
        { predict: "What happens if you change <h1> to <h2> (and </h1> to </h2>)?", options: ["The heading gets smaller", "Nothing changes", "The page breaks"], answer: 0, explain: "<h2> is a smaller heading. Browsers draw it smaller because it means \"a part of the page\", not \"the whole page\". Change it back to <h1>." },
        { predict: "What happens if you delete the closing </p>?", options: ["The paragraph disappears", "It still shows", "The whole page goes blank"], answer: 1, explain: "Browsers try to fix small mistakes, so it still shows. But it can break the parts after it, so always close your tags." }
      ],
      check: "Press Check my page. It needs one main heading with words in it, and a paragraph with a full sentence.",
      mistakes: ["Forgetting the slash in the closing tag: </h1>, not <h1>.", "Putting the heading words outside the tags.", "Using more than one <h1>. Use <h2> for the parts of your page."]
    },
    2: {
      building: "The story of your website: a section with its own heading, and a list of the three things visitors should learn or see.",
      why: "Sections and lists organize information, so visitors find what they need fast. Screen readers announce \"list, 3 items\", so their users know what's coming.",
      learn: [
        { h: "Section headings", say: ["Each part of your page gets an <h2>. Headings go in order: one <h1>, then <h2> for each part."] },
        { h: "Lists", say: ["<ul> makes a bullet list, and <ol> makes a numbered one. Each thing in the list is an <li>.", "The <li> items are nested inside the <ul>: they go between <ul> and </ul>. Indenting them shows that."], code: "<ul>\n  <li>Leaves</li>\n  <li>Twigs</li>\n</ul>" },
        { h: "Sections", say: ["<section> groups one part of the page, like a box with a label. It's semantic HTML: the tag says what the part is. <header>, <main>, and <footer> are semantic too."], code: "<section>\n  <h2>What moose eat</h2>\n  <ul>…</ul>\n</section>" }
      ],
      start: "Your page from stage 2 is still here. Under your paragraph, add an <h2> with the name of your first section, then a <ul> with your three things. My plan → Use as a <ul> list can add them.",
      experiments: [
        { predict: "What happens if you change <ul> to <ol> (and </ul> to </ol>)?", options: ["The bullets become numbers", "The list disappears", "Nothing"], answer: 0, explain: "<ol> is an ordered list: the browser numbers the items for you. Use it when the order matters, like steps in a recipe." },
        { predict: "What happens if you put an <li> outside the </ul>?", options: ["It joins the list", "It shows, but outside the list", "It disappears"], answer: 1, explain: "It shows, but it isn't part of the list anymore. Check my page will say the list has fewer items." }
      ],
      check: "Press Check my page. It needs a section heading and a list with at least two items.",
      mistakes: ["<li> items outside the <ul>.", "Forgetting </ul> at the end of the list.", "Typing bullet symbols yourself: the browser adds them."]
    },
    3: {
      building: "A picture with alt text, and a link with clear words that jumps to a part of your page.",
      why: "Pictures help visitors see your idea. Alt text describes them for people who can't see them, and clear link words tell everyone where a link goes. These two habits make the web work for more people.",
      learn: [
        { h: "Attributes", say: ["An attribute adds information inside an opening tag: a name, an equals sign, and a value in quotes."], code: "<img src=\"moose.svg\" alt=\"A moose near the mountains\">" },
        { h: "Pictures", say: ["<img> shows a picture. src says which picture, and alt describes it. <img> has no closing tag.", "In STEM 207 you use the built-in pictures, like moose.svg or rocket.svg. My plan → Add as an <img> adds yours."] },
        { h: "Links", say: ["<a> makes a link. href says where it goes. #facts jumps to the part of the page with id=\"facts\". A web address starts with https://.", "The words between <a> and </a> are what people click, so they should say where the link goes."], code: "<a href=\"#facts\">See the fun facts</a>\n<h2 id=\"facts\">Fun facts</h2>" }
      ],
      start: "Add your picture under your heading, then write its alt text. Give your <h2> an id, like <h2 id=\"facts\">, and add a link that jumps to it.",
      experiments: [
        { predict: "What happens if the src names a picture that doesn't exist, like nope.svg?", options: ["A broken picture", "A random picture", "The page breaks"], answer: 0, explain: "The browser can't find it, so it shows nothing (or a broken icon). That's when alt text matters most: it says what should be there." },
        { predict: "What happens if your link says href=\"#facts\" but nothing has id=\"facts\"?", options: ["It jumps to the top", "Nothing happens", "It opens a new page"], answer: 1, explain: "There's nowhere to jump. Check my page names the missing id." }
      ],
      check: "Press Check my page. It needs a built-in picture with alt text, and a link with clear words that goes somewhere real.",
      mistakes: ["alt=\"picture\" doesn't say what's in it.", "Link words like \"click here\".", "Forgetting the # in href=\"#facts\"."]
    },
    4: {
      building: "Your website's own look: a background color, a text color, and one more style choice, in CSS.",
      why: "HTML says what each part is. CSS says how it looks. Every website you know uses CSS for its colors, fonts, and spacing.",
      learn: [
        { h: "A CSS rule", say: ["A rule has a selector, then properties and values inside curly braces. The selector picks what to style. Each property: value; pair changes one thing."], code: "body {\n  background-color: #fff7e8;\n  color: #213547;\n}" },
        { h: "Selectors", say: ["body styles the whole page. h1 styles every <h1>. You can write as many rules as you like."] },
        { h: "Colors", say: ["#213547 is a hex color: red, green, and blue numbers. The color helper turns any color in your CSS into a picker. My plan → Use in my CSS body rule adds your plan's colors."] }
      ],
      start: "You're in the CSS tab (style.css). Your HTML is still in the HTML tab. Start with a body rule: background-color and color.",
      experiments: [
        { predict: "What happens if you leave out a semicolon between two lines?", options: ["Both still work", "The second line stops working", "The page goes blank"], answer: 1, explain: "Without the ;, the browser can't tell where one value ends, so it skips the broken line. Semicolons separate the lines." },
        { predict: "What happens if you add h1 { color: tomato; }?", options: ["Only the <h1> turns red-orange", "All the words change", "Nothing"], answer: 0, explain: "The selector h1 picks only <h1> elements. That's how CSS styles one part without changing the rest." }
      ],
      check: "Press Check my page. It needs a background color, a text color, and one more style that matches part of your page.",
      mistakes: ["Forgetting a { or }.", "Writing CSS in the HTML tab.", "Spelling a property wrong, like colour or backround."]
    },
    5: {
      building: "A website more people can use: one main heading, alt text, clear links, and readable colors. Then you'll hear it the way a screen reader does.",
      why: "About 1 in 4 adults has a disability. Accessible pages work for everyone, including people who use screen readers, can't see well, or read on a sunny phone.",
      learn: [
        { h: "Contrast", say: ["Contrast is how much the words stand out from the background. Readable text needs at least 4.5 to 1. The meter under the preview measures yours."] },
        { h: "Screen readers", say: ["A screen reader reads a page out loud, from heading to heading. Press Screen reader above the preview to see the order it reads yours."] },
        { h: "Check with a person", say: ["A computer can't tell if alt text or link words make sense. A person can. Read each one out loud to a partner."] }
      ],
      start: "Press Check my page first, and fix anything it finds. Then use the contrast meter and the Screen reader view.",
      experiments: [
        { predict: "Which is easier to read: light gray words on white, or dark blue words on cream?", options: ["Light gray on white", "Dark blue on cream"], answer: 1, explain: "Dark text on a light background has much more contrast. Try both in your CSS and watch the meter." }
      ],
      check: "Press Check my page. Every check needs to pass, and then a person checks your alt text and link words.",
      mistakes: ["Text that's almost the same color as its background.", "Two <h1> headings.", "Alt text that just says the file name."]
    },
    6: {
      building: "Debugging: another developer's page has four bugs. You'll find and fix them, one at a time.",
      why: "Every programmer writes bugs. Good ones investigate: they test, find the first problem, fix it, and test again.",
      learn: [
        { h: "Debugging", say: ["Debugging means finding and fixing mistakes in code. Check my page names the kinds of problems first. Then Show where they are gives each one its own Find it."] },
        { h: "A fake heading", say: ["Some pages use a big <p> to look like a heading. It looks right, but screen readers don't know it's the title. A real heading uses <h1>."] }
      ],
      start: "The page in the editor isn't yours: it's Puffin Point Ice Cream's. Press Check my page to start investigating.",
      experiments: [
        { predict: "Debug Detective: want more practice? Six small broken pages, each with one bug. They never change this page.", options: [], answer: -1, explain: "", detective: true }
      ],
      check: "Fix all four bugs, then press Check my page.",
      mistakes: ["Fixing the look (making it bold) instead of the code (using <h1>).", "Changing lots of things at once: fix one bug, then check again."]
    },
    7: {
      building: "Your finished website: everything you've learned, together, checked like a real visitor would.",
      why: "Real web teams test every page before it's done: on a phone, with a screen reader, and by reading it like a visitor.",
      learn: [
        { h: "Test it like a visitor", say: ["Read your page top to bottom. Does the headline say what it's about? Does every link go somewhere? Look at it in Phone. Listen to it in Screen reader."] },
        { h: "Finishing", say: ["When every check passes, press Finish my website. Your website stays on this device: it isn't published on the internet. You can copy your code or print a summary."] }
      ],
      start: "Choose Start from my page to keep improving it, or Start blank to build it again from memory. My plan has everything you planned.",
      experiments: [
        { predict: "What could you add that wasn't in your plan?", options: [], answer: -1, explain: "Try a second section, another picture, or a footer. The Level Up goals under Check my page have ideas." }
      ],
      check: "Press Check my page. Everything needs to pass, the page must fit a phone, and you need to look at it in Phone.",
      mistakes: ["Forgetting to look at the Phone preview.", "Fewer than 20 words of your own."]
    }
  };
  /* Debug Detective: isolated broken pages, one bug each. They never touch the student's project.
     fixed(html): true when the bug is gone (checked on the code itself). */
  const PUZZLES = [
    { title: "The heading that never ends", html: "<h1>Loon Lookout\n<p>Loons dive for fish.</p>", clue: "The heading swallows the paragraph. What's missing?", fixed: (h) => /<h1>[^<]*<\/h1>/i.test(h), explain: "The <h1> had no closing </h1>, so the browser made everything after it part of the heading." },
    { title: "The tangled list", html: "<ul>\n  <li>Hiking\n  <li>Camping</li>\n</li>\n</ul>", clue: "One <li> is closed in the wrong place.", fixed: (h) => (h.match(/<li>/g) || []).length === (h.match(/<\/li>/g) || []).length && !/<\/li>\s*<\/li>/.test(h) && /<li>[^<]*<\/li>\s*<li>/.test(h), explain: "Each <li> closes before the next one starts. Nesting means close the inside one first." },
    { title: "The mystery tag", html: "<h1>Rocket Notes</h1>\n<pp>The Moon is about 239,000 miles away.</pp>", clue: "Is <pp> a real HTML tag?", fixed: (h) => /<p>[^<]+<\/p>/.test(h) && !/<pp>/.test(h), explain: "<pp> isn't HTML, so the browser treats it as plain text with no meaning. A paragraph is <p>." },
    { title: "The empty description", html: "<img src=\"puffin.svg\" alt=\"\">", clue: "Read the alt text out loud. What does it say?", fixed: (h) => /alt="[^"]{8,}"/.test(h), explain: "An empty alt tells screen readers to skip the picture. Describe what's in it." },
    { title: "The missing picture", html: "<img src=\"mooose.svg\" alt=\"A moose near the mountains\">", clue: "Look closely at the file name.", fixed: (h) => /src="moose\.svg"/.test(h), explain: "A typo in src means the browser can't find the picture. It's moose.svg, with two o's." },
    { title: "The heading staircase", html: "<h1>Trail Guide</h1>\n<h4>Easy trails</h4>\n<p>Start with a short loop.</p>", clue: "Headings go in order. What comes after <h1>?", fixed: (h) => /<h2>[^<]+<\/h2>/.test(h) && !/<h4>/.test(h), explain: "After <h1> comes <h2>. Skipping levels makes the page harder to follow for screen reader users." }
  ];
  /* Where each tag is taught, for the Tag Explorer. */
  const TAG_LESSON = { h1: "Stage 2: Build the Bones", p: "Stage 2: Build the Bones", h2: "Stage 3: Tell Your Story", ul: "Stage 3: Tell Your Story", ol: "Stage 3: Tell Your Story", section: "Stage 3: Tell Your Story", header: "Stage 3: Tell Your Story", main: "Stage 3: Tell Your Story", footer: "Stage 3: Tell Your Story", a: "Stage 4: Connect and Illustrate", img: "Stage 4: Connect and Illustrate", nav: "Stage 4: Connect and Illustrate", strong: "Stage 6: Build for Everyone", em: "Stage 6: Build for Everyone" };

  SE.websiteLessons = { EXAMPLES, LESSONS, PUZZLES, TAG_LESSON };
})();
