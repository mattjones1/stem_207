# Build Your First Website (lab-website.js, web-kit.js): plays all 8 stages the way a student does, checks the
# checker against real rendered pages (with different valid answers), and attacks the preview with hostile code
# while watching for network requests, dialogs, and escapes into the app.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/labs/test_website.py [url]
import asyncio, sys, json
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
HOST = S.split("/")[2]
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
LAB = "build-your-first-website"
async def stage(pg, n):
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(120)
    await pg.goto(S + f"#/lab/{LAB}/{n}"); await pg.wait_for_timeout(600)
async def won(pg):
    await pg.wait_for_timeout(200)
    return await pg.locator("#lab-win:not([hidden])").count() == 1
async def feedback(pg): return (await pg.inner_text("#lab-feedback")).strip()
async def results(pg): return (await pg.inner_text("#ws-checks")).strip()   # each check's full message lives in the list
async def check(pg):
    await pg.click("#ws-check"); await pg.wait_for_timeout(700)
async def code(pg, sel, text):
    await pg.fill(sel, text); await pg.wait_for_timeout(450)

AUDIT = """async ([html, css, ctx]) => {
  const f = document.createElement('iframe'); f.setAttribute('sandbox', 'allow-same-origin');
  f.style.cssText = 'position:fixed;left:-9999px;top:0;width:900px;height:600px'; document.body.appendChild(f);
  await new Promise((r) => { f.onload = r; f.srcdoc = SE.webKit.srcdoc(html, { css }); });
  const res = SE.website.checks(f.contentDocument, Object.assign({ css }, ctx || {}));
  const out = { _person: res.person.length, _msg: {} };
  for (const k in res.results) { out[k] = res.results[k].state; out._msg[k] = res.results[k].msg; }
  f.remove(); return out; }"""
PAGE = """<h1>Pine Coast Kayak Rentals</h1>
<p>Paddle the calm Maine coast with friendly guides.</p>
<img src="kayak.svg" alt="An orange kayak on calm water near a pine shore">
<h2 id="rentals">Rentals</h2>
<ul><li>Single kayaks</li><li>Tandem kayaks</li><li>Beginner lessons</li></ul>
<p><a href="#rentals">Explore kayak rentals</a></p>
<p>We are open every summer day from 9 to 5, rain or shine, on the harbor.</p>
"""
CSS = "body {\n  background-color: #fff7e8;\n  color: #213547;\n  padding: 1em;\n}\n"

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []; outside = []; dialogs = []
    ctx = await b.new_context(viewport={"width": 1366, "height": 650}, reduced_motion="reduce")
    pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    # Only requests made by a preview frame count (the app itself loads its web fonts).
    pg.on("request", lambda r: outside.append(r.url) if r.frame.parent_frame is not None and not (r.url.startswith("data:") or r.url.startswith("about:")) else None)
    pg.on("dialog", lambda d: (dialogs.append(d.message), asyncio.ensure_future(d.dismiss())))
    await pg.goto(S); await pg.evaluate("localStorage.clear(); sessionStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await pg.evaluate("SE.store.signInEducator(SE.store.DEMO.email, SE.store.DEMO.password)")

    # ── The checker, on real rendered pages ──
    a = await pg.evaluate(AUDIT, [PAGE, CSS, {"narrowOverflow": False, "viewedPhone": True}])
    ok("a complete page passes every check", all(a[k] == "good" for k in ["h1", "p", "h2", "list", "img", "alt", "link", "style", "contrast", "narrow", "phone", "own"]), json.dumps(a))
    ok("alt text and link words also go to a person to judge", a["_person"] >= 2, a["_person"])
    alt = await pg.evaluate(AUDIT, [PAGE.replace("<ul>", "<ol>").replace("</ul>", "</ol>"), "body { background: lightyellow; color: navy; font-family: Georgia; }", {}])
    ok("other valid answers pass too (ol, background shorthand, named colors, a font)", all(alt[k] == "good" for k in ["list", "style", "contrast"]), json.dumps(alt))
    st2 = await pg.evaluate(AUDIT, ["<h1></h1>\n", "", {}])
    ok("stage 2's starting page fails: the heading is empty", st2["h1"] == "fix" and "empty" in st2["_msg"]["h1"], st2["_msg"]["h1"])
    br = await pg.evaluate("SE.websiteStages.BROKEN")
    bk = await pg.evaluate(AUDIT, [br["html"], br["css"], {}])
    ok("the broken page has exactly the four bugs", [k for k in ["h1", "alt", "link", "contrast"] if bk[k] == "fix"] == ["h1", "alt", "link", "contrast"] and bk["list"] == "good", json.dumps(bk))
    ok("a big <p> pretending to be a heading is named", "looks like a heading" in bk["_msg"]["h1"], bk["_msg"]["h1"])
    gr = await pg.evaluate(AUDIT, [PAGE, "body { background: linear-gradient(#fff7e8, #cde8f2); color: #213547; padding: 1em; }", {}])
    ok("contrast over a gradient is sent to a person, not passed", gr["contrast"] == "person", gr["contrast"])
    lw = await pg.evaluate(AUDIT, [PAGE, "body { background-color: #ffffff; color: #c8c8c8; padding: 1em; }", {}])
    ok("low contrast gives the real WCAG ratio", lw["contrast"] == "fix" and "1.7 to 1" in lw["_msg"]["contrast"], lw["_msg"]["contrast"])
    nest = await pg.evaluate(AUDIT, [PAGE.replace("<p>Paddle", '<p style="background:#012d2b">Paddle'), CSS, {}])
    ok("contrast uses the nearest background behind the words", nest["contrast"] == "fix", nest["_msg"]["contrast"])
    ln = await pg.evaluate(AUDIT, [PAGE.replace('href="#rentals"', 'href="#trips"'), CSS, {}])
    ok("a link to a missing id is named", ln["link"] == "fix" and 'id="trips"' in ln["_msg"]["link"], ln["_msg"]["link"])
    READ = """async ([html]) => {
      const f = document.createElement('iframe'); f.setAttribute('sandbox', 'allow-same-origin');
      f.style.cssText = 'position:fixed;left:-9999px;top:0;width:900px;height:600px'; document.body.appendChild(f);
      await new Promise((r) => { f.onload = r; f.srcdoc = SE.webKit.srcdoc(html, { map: true }).doc; });
      const out = SE.website.readOut(f.contentDocument).map((x) => x.say); f.remove(); return out; }"""
    ro = await pg.evaluate(READ, [PAGE])
    ok("the screen reader view reads headings, the list, the picture's alt, and the link words, in order",
       ro[0] == "Heading level 1: Pine Coast Kayak Rentals" and "List, 3 items" in ro and "Image: An orange kayak on calm water near a pine shore" in ro and "Link: Explore kayak rentals" in ro
       and ro.index("Heading level 2: Rentals") < ro.index("List, 3 items"), ro)
    ro2 = await pg.evaluate(READ, ['<h1>Shop</h1><img src="kayak.svg">'])
    ok("a picture with no alt is read by its file name", any("kayak.svg" in x and "no alt text" in x for x in ro2), ro2)

    # ── Security: hostile code in the preview ──
    hostile = """<h1>Test</h1><script>parent.PWNED = 1; alert(1)</script><img src="x" onerror="parent.PWNED = 2">
<img src="https://example.com/a.png" alt="outside picture"><style>@import url(https://example.com/x.css); body { background: url(https://example.com/b.png) }</style>
<iframe src="https://example.com"></iframe><form action="https://example.com"><input name="q"><button>Go</button></form>
<a id="bad" href="javascript:parent.PWNED = 3">bad link</a><svg onload="parent.PWNED = 4"></svg><object data="https://example.com/x.swf"></object>
<meta http-equiv="refresh" content="0;url=https://example.com"><div style="background-image:url(https://example.com/c.png)">styled</div>"""
    safe = await pg.evaluate("(h) => SE.webKit.srcdoc(h)", hostile)
    ok("the sanitized preview has no script, handlers, javascript:, frames, forms, or outside URLs", not any(x in safe.lower() for x in ["<script", "onerror", "onload", "javascript:", "<iframe", "<form", "<object", "<svg", "url(https", "@import url"]), safe[-400:])
    await stage(pg, 2)
    url_before = pg.url
    await code(pg, "#ws-html", hostile)
    await pg.frame_locator("#ws-frame").locator("#bad").click(); await pg.wait_for_timeout(400)
    ok("hostile code can't reach the app (window.PWNED unset)", await pg.evaluate("typeof window.PWNED") == "undefined")
    ok("hostile code opens no dialog", not dialogs, dialogs)
    ok("the preview made no outside network requests", not outside, outside[:5])
    ok("the app didn't navigate", pg.url == url_before, pg.url)
    ok("the iframe never allows scripts", (await pg.get_attribute("#ws-frame", "sandbox")) == "allow-same-origin")

    # ── Stage 1: plan ──
    await stage(pg, 1)
    await pg.click('[data-biz="kayak"]')
    await pg.click("#ws-plan-done")
    ok("saving a plan without notes says what's missing", "4 sections" in await feedback(pg), await feedback(pg))
    for i in range(4): await pg.locator(".ws-chips input").nth(i).check()
    await pg.fill("#ws-msg", "Kayak trips for beginners")
    await pg.fill("#ws-noticed", "They saw the picture first")
    await pg.fill("#ws-improve", "Move the rentals list higher")
    await pg.click("#ws-plan-done")
    ok("stage 1 completes with a business, sections, and tester notes", await won(pg), await feedback(pg))

    # ── Stage 2: Tag Shelf by keyboard, then type ──
    await stage(pg, 2)
    ok("the business carries over, shown as words (changed only on stage 1)", "Your business: Pine Coast Kayak Rentals" in await pg.inner_text(".ws-bizline") and await pg.locator("#ws-biz").count() == 0)
    order = await pg.evaluate("[...document.querySelector('.lab-brief').children].map((n) => n.className).join(' | ')")
    ok("the brief leads with the goal and Need a hint?", order.index("lab-goal") < order.index("lab-brief__tools") < order.index("lab-steps"), order)
    await code(pg, "#ws-html", "<h1>Pine Coast Kayak Rentals</h1>\n")
    await pg.evaluate("(() => { const t = document.getElementById('ws-html'); t.focus(); t.setSelectionRange(t.value.length, t.value.length); })()")
    await pg.locator('[data-tag="p"]').focus(); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(50)
    await pg.keyboard.type("Paddle the calm Maine coast with friendly guides."); await pg.wait_for_timeout(450)
    ok("the Tag Shelf typed a real <p> pair around the words", "<p>Paddle the calm Maine coast with friendly guides.</p>" in await pg.input_value("#ws-html"), await pg.input_value("#ws-html"))
    ok("the preview shows the student's heading", (await pg.frame_locator("#ws-frame").locator("h1").inner_text()) == "Pine Coast Kayak Rentals")
    cb = await pg.locator("#ws-check").bounding_box()
    ok("Check my page is on the first screen at 1366x650", cb and cb["y"] + cb["height"] <= 650, cb)
    await code(pg, "#ws-html", "<h1>Pine Coast Kayak Rentals</h1>\n<p></p>\n")
    await check(pg)
    ok("the feedback sums up what to fix; the details are in the list, once", "1 thing to fix: Paragraph" in await feedback(pg) and (await results(pg)).count("Add a paragraph") + (await results(pg)).count("very short") == 1, await feedback(pg))
    fr = await pg.locator("#ws-checks li").first.bounding_box()
    ok("the first result is on screen after Check my page", fr and fr["y"] >= 0 and fr["y"] + 40 <= 650, fr)
    await pg.locator("#ws-checks [data-find]").first.click(); await pg.wait_for_timeout(100)
    ok("Find it names the tag, not a line number nobody can see", "the <p> tag" in await feedback(pg) and "line" not in await feedback(pg), await feedback(pg))
    await code(pg, "#ws-html", "<h1>Pine Coast Kayak Rentals</h1>\n<p>Paddle the calm Maine coast with friendly guides.</p>\n")
    await check(pg)
    ok("stage 2 completes", await won(pg), await feedback(pg))

    # ── Stage 3: the same project grows ──
    await stage(pg, 3)
    v = await pg.input_value("#ws-html")
    ok("stage 3 starts from the student's own page", "Paddle the calm" in v, v)
    await code(pg, "#ws-html", v + '<h2 id="rentals">Rentals</h2>\n<ul>\n  <li>Single kayaks</li>\n</ul>\n')
    await check(pg)
    ok("a one-item list is named", "1 item" in await results(pg), await results(pg))
    await code(pg, "#ws-html", (await pg.input_value("#ws-html")).replace("</ul>", "  <li>Tandem kayaks</li>\n</ul>"))
    await check(pg)
    ok("stage 3 completes", await won(pg), await feedback(pg))

    # ── Stage 4: picture, alt, link, and Find it ──
    await stage(pg, 4)
    v = await pg.input_value("#ws-html")
    await code(pg, "#ws-html", v + '<img src="kayak.svg">\n<p><a href="#rentals">click here</a></p>\n')
    await check(pg)
    ok("a missing alt is named", "no alt text" in await results(pg), await results(pg))
    await code(pg, "#ws-html", (await pg.input_value("#ws-html")).replace('<img src="kayak.svg">', '<img src="kayak.svg" alt="An orange kayak on calm water">'))
    await check(pg)
    ok("\"click here\" is named", "click here" in await results(pg), await results(pg))
    await code(pg, "#ws-html", (await pg.input_value("#ws-html")).replace("click here", "Explore kayak rentals"))
    await pg.frame_locator("#ws-frame").locator("h2").click(); await pg.wait_for_timeout(150)
    sel = await pg.evaluate("(() => { const t = document.getElementById('ws-html'); return t.value.slice(t.selectionStart, t.selectionEnd); })()")
    ok("Find it: tapping the preview selects the code that made it", sel.startswith("<h2"), sel)
    await pg.evaluate("(() => { const t = document.getElementById('ws-html'); const i = t.value.indexOf('<li>') + 2; t.focus(); t.setSelectionRange(i, i); t.dispatchEvent(new Event('keyup')); })()")
    await pg.wait_for_timeout(100)
    ok("the tag at the cursor is outlined in the preview", (await pg.frame_locator("#ws-frame").locator("[data-wk-on]").evaluate("e => e.tagName")) == "LI")
    ok("Code Coach explains the tag at the cursor", "one item in a list" in await pg.inner_text("#ws-coach"), await pg.inner_text("#ws-coach"))
    await check(pg)
    ok("stage 4 completes", await won(pg), await feedback(pg))

    # ── Stage 5: CSS, and the color helper rewrites the code ──
    await stage(pg, 5)
    ok("the CSS stage opens on the CSS tab", (await pg.get_attribute("#ws-tab-css", "aria-selected")) == "true")
    await code(pg, "#ws-css", "body {\n  background-color: #fff7e8;\n  color: #213547;\n}\n")
    await check(pg)
    ok("colors alone ask for one more style choice", "one more style choice" in await results(pg), await results(pg))
    await pg.wait_for_timeout(300)
    await pg.evaluate("(() => { const i = document.querySelector('#ws-colors [data-ci=\"1\"]'); i.value = '#145b72'; i.dispatchEvent(new Event('change', { bubbles: true })); })()")
    await pg.wait_for_timeout(450)
    ok("the color helper changed the real CSS text", "color: #145b72;" in await pg.input_value("#ws-css"), await pg.input_value("#ws-css"))
    await code(pg, "#ws-css", (await pg.input_value("#ws-css")).replace("}\n", "  padding: 1em;\n}\n", 1))
    await check(pg)
    ok("stage 5 completes", await won(pg), await feedback(pg))

    # ── Stage 6: build for everyone ──
    await stage(pg, 6)
    await pg.click("#ws-tab-css")
    await code(pg, "#ws-css", (await pg.input_value("#ws-css")).replace("#145b72", "#b0b0b0"))
    await check(pg)
    ok("low contrast needs a fix, with the student's ratio", "to 1" in await results(pg) and "4.5" in await results(pg), await results(pg))
    ok("the contrast meter says Needs a fix in words", "Needs a fix" in await pg.inner_text("#ws-meter"))
    await code(pg, "#ws-css", (await pg.input_value("#ws-css")).replace("#b0b0b0", "#213547"))
    await check(pg)
    ok("passing the automatic checks isn't enough on stage 6: a person checks alt text and link words", not await won(pg) and "check with a person" in (await feedback(pg)).lower() and await pg.locator("#ws-checks [data-ok]").count() == 2, await feedback(pg))
    ok("the screen reader view opens and reads the page", await pg.locator("#ws-reader:not([hidden])").count() == 1 and "Heading level 1: Pine Coast Kayak Rentals" in await pg.inner_text("#ws-reader-list"))
    ok("the person checks come before the passed checks", (await pg.locator("#ws-checks li").first.get_attribute("class")).endswith("ws-check--person"))
    await pg.locator("#ws-checks [data-ok]").first.click(); await pg.wait_for_timeout(700)
    ok("one confirmation isn't all of them", not await won(pg) and await pg.locator("#ws-checks [data-ok]").count() == 1)
    await pg.locator("#ws-checks [data-ok]").first.click(); await pg.wait_for_timeout(700)
    ok("stage 6 completes after the person checks", await won(pg), await feedback(pg))

    # ── Stage 7: staged debugging, fixed in a different valid way ──
    await stage(pg, 7)
    ok("the debug page says whose it is", "another developer" in await pg.inner_text(".ws-bizline"))
    await check(pg)
    ok("the first check names the kinds of problems, not the fixes", "Check found 4 problems" in await pg.inner_text("#ws-checks") and await pg.locator("#ws-checks [data-find]").count() == 0, await pg.inner_text("#ws-checks"))
    ok("the button says what the next press does", (await pg.inner_text("#ws-check")).strip() == "Show where they are", await pg.inner_text("#ws-check"))
    await check(pg)
    ok("then it's Check my page again", (await pg.inner_text("#ws-check")).strip() == "Check my page")
    ok("the second check locates them (Find it)", await pg.locator("#ws-checks [data-find]").count() == 4)
    h = (await pg.input_value("#ws-html")).replace('<p class="title">Puffin Point Ice Cream</p>', '<h1 class="title">Puffin Point Ice Cream</h1>').replace('<img src="lighthouse.svg">', '<img src="lighthouse.svg" alt="A lighthouse beside the ice cream shop">').replace("click here", "See all our flavors")
    await code(pg, "#ws-html", h)
    await pg.click("#ws-tab-css")
    await code(pg, "#ws-css", (await pg.input_value("#ws-css")).replace("#b8b8b8", "#333333"))
    await check(pg)
    ok("stage 7 completes with the student's own fixes", await won(pg), await feedback(pg))

    # ── Stage 8: ship. Clicking isn't enough; the page must pass, and be looked at on a phone ──
    await stage(pg, 8)
    ok("stage 8 asks how to start: from my page, or blank", await pg.locator("#ws-start-mine").count() == 1 and await pg.locator("#ws-start-blank").count() == 1)
    await pg.click("#ws-start-blank"); await pg.wait_for_timeout(300)
    ok("starting blank keeps the clean starter", (await pg.input_value("#ws-html")).strip() == "<h1></h1>" and await pg.locator("#ws-start").count() == 0)
    await check(pg)
    ok("an empty starter can't ship", not await won(pg) and "Needs a fix" in await pg.inner_text("#ws-checks"))
    await code(pg, "#ws-html", PAGE)
    await pg.click("#ws-tab-css"); await code(pg, "#ws-css", CSS)
    await check(pg)
    ok("shipping asks for the Phone preview first", "Phone" in await results(pg), await results(pg))
    await pg.click("#ws-phone"); await pg.wait_for_timeout(200)
    await check(pg)
    ok("passing every check shows Mark ready for review, but doesn't ship by itself", not await won(pg) and await pg.locator("#ws-ship:not([hidden])").count() == 1, await feedback(pg))
    await pg.click("#ws-ship")
    ok("stage 8 ships when the student marks it ready", await won(pg), await feedback(pg))
    done = await pg.inner_text("#lab-win")
    ok("the finished screen: Your First Website Is Ready!", "Your First Website Is Ready!" in done and "Pine Coast Kayak Rentals" in done and "Built from a blank page" in done, done[:300])
    ok("it lists the accessibility fixes the student made", "readable" in done.lower() or "alt text" in done.lower(), done[:600])
    ok("it offers the certificate and a copy of the code", await pg.locator("#lab-win button:has-text('Print my certificate')").count() == 1 and await pg.locator("#ws-copy").count() == 1)
    # Start from my page: the stages 2-6 project comes into stage 8.
    await pg.evaluate("(() => { const k = 'stem207.website.preview'; const s = JSON.parse(sessionStorage.getItem(k)); delete s.shipFrom; delete s.ship; delete s.snap['7']; sessionStorage.setItem(k, JSON.stringify(s)); })()")
    await stage(pg, 8)
    await pg.click("#ws-start-mine"); await pg.wait_for_timeout(300)
    ok("Start from my page brings in the student's page from stages 2-6", "Paddle the calm" in await pg.input_value("#ws-html"), await pg.input_value("#ws-html"))

    # ── Progress, drafts, and the original lab ──
    ok("Web Builder's progress is separate", await pg.evaluate("SE.labs.progressFor(null, 'web-builder').size") == 0 and await pg.evaluate(f"SE.labs.progressFor(null, '{LAB}').size") == 8)
    g2 = await (await b.new_context()).new_page()
    await g2.goto(S); await g2.evaluate("SE.store.signInEducator(SE.store.DEMO.email, SE.store.DEMO.password)"); await g2.goto(S + f"#/lab/{LAB}/3"); await g2.wait_for_timeout(600)
    ok("a new browser session doesn't see another preview's draft", "Paddle the calm" not in await g2.input_value("#ws-html"))
    await g2.close()
    st = await (await b.new_context(viewport={"width": 1366, "height": 900})).new_page()
    st.on("pageerror", lambda e: errs.append(f"student: {e}"))
    await st.goto(S); await st.evaluate("localStorage.clear()"); await st.reload(); await st.wait_for_timeout(300)
    await st.goto(S + "#/signin/student"); await st.wait_for_timeout(300)
    await st.fill("#class-code", "MOOSE7"); await st.click("#code-form button[type=submit]"); await st.wait_for_timeout(400)
    await st.click("text=Ava R."); await st.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await st.click(f"[data-pic={x}]")
    await st.wait_for_timeout(800)
    await stage(st, 2)
    await code(st, "#ws-html", "<h1>Casco Bay Bakery</h1>\n<p>Fresh bread every single morning.</p>\n")
    await st.reload(); await st.wait_for_timeout(700)
    ok("a signed-in student's draft comes back after a reload", "Fresh bread every single morning" in await st.input_value("#ws-html"))
    logged = await st.evaluate("JSON.stringify(SE.store.eventsFor(SE.store.currentUser().id).filter((e) => e.data && e.data.labId === 'build-your-first-website'))")
    ok("the activity log never holds the student's code", "Fresh bread" not in logged)

    # ── Activity page and phone width ──
    ed = await (await b.new_context(viewport={"width": 1366, "height": 900})).new_page()
    ed.on("pageerror", lambda e: errs.append(f"educator: {e}"))
    await ed.goto(S + "#/signin/educator"); await ed.wait_for_timeout(300); await ed.click("#fill-demo"); await ed.click("#edu-form button[type=submit]"); await ed.wait_for_timeout(800)
    await ed.goto(S + "#/activity/lab-build-your-first-website"); await ed.wait_for_timeout(500)
    t = await ed.inner_text("#app")
    ok("the activity page has the teacher guide (schedule and answer guide)", "Stage 7 answer guide" in t and "90 minutes" in t)
    ph = await (await b.new_context(viewport={"width": 390, "height": 800}, reduced_motion="reduce")).new_page()
    ph.on("pageerror", lambda e: errs.append(f"phone: {e}"))
    await ph.goto(S); await ph.evaluate("SE.store.signInEducator(SE.store.DEMO.email, SE.store.DEMO.password)")
    for n in [1, 5]:
        await ph.goto(S + "#/activities"); await ph.wait_for_timeout(100)
        await ph.goto(S + f"#/lab/{LAB}/{n}"); await ph.wait_for_timeout(600)
        sw = await ph.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        ok(f"stage {n} has no sideways scroll on a phone", sw <= 1, sw)

    ok("no page errors", not errs, errs[:3])
    await b.close()
  print(f"\n{sum(R)}/{len(R)} passed"); sys.exit(0 if all(R) else 1)

asyncio.run(main())
