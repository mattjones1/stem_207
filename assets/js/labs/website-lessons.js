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
  /* Where each tag is taught, for the Tag Explorer. */
  const TAG_LESSON = { h1: "Stage 2: Build the Bones", p: "Stage 2: Build the Bones", h2: "Stage 3: Tell Your Story", ul: "Stage 3: Tell Your Story", ol: "Stage 3: Tell Your Story", section: "Stage 3: Tell Your Story", header: "Stage 3: Tell Your Story", main: "Stage 3: Tell Your Story", footer: "Stage 3: Tell Your Story", a: "Stage 4: Connect and Illustrate", img: "Stage 4: Connect and Illustrate", nav: "Stage 4: Connect and Illustrate", strong: "Stage 6: Build for Everyone", em: "Stage 6: Build for Everyone" };

  SE.websiteLessons = { EXAMPLES, TAG_LESSON };
})();
