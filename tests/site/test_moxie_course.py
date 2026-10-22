# Moxie course material: the 16 student sheets as interactive session pages (pilot), in local mode.
# Covers visibility through the Moxie course template, code blanks (copy and download), checklists, Think about it,
# the teacher's Pass and stretch star, the plan and truth table, the capstone design pin rule, team stand-ups and
# subsystems, Star/Star/Wish cards between teams, the self-rating, and the paper print view.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js
#   python3 tests/site/test_moxie_course.py [local_url]
import asyncio, sys, re
from playwright.async_api import async_playwright
S = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
NOT_FOUND = "couldn’t find that page"
async def go(pg, h):
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(120); await pg.goto(S + h); await pg.wait_for_timeout(550)
async def educator(pg):
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(150)
    await pg.goto(S + "#/signin/educator"); await pg.wait_for_timeout(300); await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(800)
async def student(pg, name="Ava R."):
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(150)
    pics = await pg.evaluate(f"SE.store.classByCode('MOOSE7') ? SE.store.studentsIn(SE.store.classByCode('MOOSE7').id).find((s) => s.displayName === '{name}').picCode : null")
    await pg.goto(S + "#/signin"); await pg.wait_for_timeout(150)
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    # The device may remember the class (and even the student); fill in only what the screen asks for.
    if await pg.locator("#class-code").count():
        await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    if await pg.locator(f"text={name}").count(): await pg.click(f"text={name}"); await pg.wait_for_timeout(200)
    for x in pics: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    ctx = await b.new_context(viewport={"width": 1280, "height": 900}, permissions=["clipboard-read", "clipboard-write"], accept_downloads=True)
    pg = await ctx.new_page(); pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)

    # Data: every session has its sheet; blanks on screen match the sheet's underscores.
    d = await pg.evaluate("""STEM.moxieSessions.map((s) => ({ id: s.id, pub: s.pub, v: s.version, sheet: !!s.moxie.sheet, kind: s.moxie.kind,
      wiring: !!s.wiring, code: !!s.code, tests: !!(s.tests && s.tests.length), check: !!(s.moxie.checkoff && s.moxie.checkoff.length),
      blanks: s.code ? SE.moxieCode.codeModel(s.code.lines).count : 0, underscores: s.code ? (s.code.lines.join('\\n').match(/_{3,}/g) || []).length : 0,
      diagramText: !s.diagram || !!s.diagram.text, pilotReady: SE.moxie.readyToPublish(s, 'pilot').length === 0 }))""")
    ok("16 sessions, all pilot v1.0, each with its sheet", len(d) == 16 and all(x["pub"] == "pilot" and x["v"] == "1.0" and x["sheet"] for x in d))
    builds = [x for x in d if x["kind"] == "build"]
    ok("sessions 1–12 have code, tests, and a checkoff list; 2–12 have wiring", all(x["code"] and x["tests"] and x["check"] for x in builds) and all(x["wiring"] for x in builds[1:]))
    ok("every blank on screen is a blank on the sheet", all(x["blanks"] == x["underscores"] for x in builds), [(x["id"], x["blanks"], x["underscores"]) for x in builds if x["blanks"] != x["underscores"]])
    ok("every diagram has a text version", all(x["diagramText"] for x in d))
    ok("every session is ready for the pilot", all(x["pilotReady"] for x in d), [x["id"] for x in d if not x["pilotReady"]])
    ok("publishing to everyone still waits for grades and time", await pg.evaluate("SE.moxie.readyToPublish(SE.activityById['moxie-01'], 'publish').includes('grade range')"))
    ok("no answer key: the sheets' blanks are still blanks", await pg.evaluate("STEM.moxieSessions.filter((s) => s.code).every((s) => s.code.lines.join('').includes('____'))"))

    # A student sees nothing until the course is assigned.
    await student(pg)
    await go(pg, "#/activity/moxie-01")
    ok("student: Session 1 isn't open before the course is assigned", NOT_FOUND in await pg.inner_text("#app"))
    await educator(pg)
    ok("the Moxie course template has 16 sessions in 4 units", await pg.evaluate("(() => { const t = SE.plans.template('tpl-moxie'); return t.steps.length === 16 && t.workshop.sessions.length === 4; })()"))
    await go(pg, "#/teach/plans/tpl-moxie")
    await pg.click('[data-use="tpl-moxie"]'); await pg.wait_for_timeout(700)
    pid = pg.url.split("#/teach/plans/")[1].split("/")[0]
    await go(pg, f"#/teach/plans/{pid}")
    ok("the course can be assigned (pilot sessions count as required)", await pg.get_attribute("#pl-assign button[type=submit]", "aria-disabled") is None)
    await pg.click("#pl-assign button[type=submit]"); await pg.wait_for_timeout(500)
    await student(pg)
    await go(pg, "#/activity/moxie-01")
    ok("student: Session 1 opens once the course is assigned", "Hello, ESP32!" in await pg.inner_text("h1"))
    t = await pg.inner_text("#app")
    ok("student: the header shows name and partner, with a Kit # field", "Name: Ava R." in t and "Mateo L." in t and await pg.locator("#mx-kit").count() == 1)
    ok("student: Meet your ESP32 shows the board with a text version", await pg.locator(".mx-diagram img[src$='session-01-board.png']").count() == 1 and "D-numbers are the pins" in await pg.evaluate("document.querySelector('.mx-diagram').textContent"))

    # Code blanks
    n = await pg.locator("[data-blank]").count()
    ok("Session 1 has 9 blanks on screen", n == 9, n)
    await pg.click("#mx-code-save"); await pg.wait_for_timeout(300)
    msg = await pg.inner_text("#mx-code-status")
    ok("empty blanks are named by line", "still have an empty blank" in msg and re.search(r"\d+, \d+", msg), msg)
    vals = ["Ava", "Mateo", "makes a heartbeat", "2", "HIGH", "100", "LOW", "100", "700"]
    for i, v in enumerate(vals): await pg.fill(f'[data-blank="{i}"]', v)
    await pg.click("#mx-code-copy"); await pg.wait_for_timeout(300)
    clip = await pg.evaluate("navigator.clipboard.readText()")
    ok("Copy my code puts the finished sketch on the clipboard", "____" not in clip and "const int LED_PIN = 2;" in clip and "digitalWrite(LED_PIN, HIGH);" in clip, clip[:120])
    async with pg.expect_download() as dl:
        await pg.click("#mx-code-dl")
    f = await dl.value
    ok("Download .ino names the file after the session", f.suggested_filename == "Session_01_Hello_ESP32.ino", f.suggested_filename)
    ok("the blanks are saved for the teacher", await pg.evaluate("SE.store.eventsFor(SE.store.currentUser().id).some((e) => e.type === 'moxie_code' && e.data.activityId === 'moxie-01' && e.data.blanks[3] === '2')"))
    await go(pg, "#/activity/moxie-01")
    ok("saved blanks come back on the page", await pg.input_value('[data-blank="4"]') == "HIGH")

    # Kit, checklists, Think about it, and sending
    await pg.fill("#mx-kit", "7"); await pg.click("form[data-mx=kit] button[type=submit]"); await pg.wait_for_timeout(400)
    ok("Kit # saves for the team", await pg.evaluate("SE.store.eventsFor(SE.store.currentUser().id).some((e) => e.type === 'moxie_kit' && e.data.kit === '7')"))
    for i in range(4): await pg.locator(f'[data-checklist="checkoff"] input[data-ci="{i}"]').check()
    await pg.locator('[data-checklist="test"] input[data-ci="0"]').check(); await pg.wait_for_timeout(200)
    ok("the checkoff and test lists save", await pg.evaluate("(() => { const e = SE.store.eventsFor(SE.store.currentUser().id).filter((x) => x.type === 'moxie_checklist'); const c = e.filter((x) => x.data.list === 'checkoff').pop(); return c && c.data.items.every(Boolean) && e.some((x) => x.data.list === 'test'); })()"))
    await pg.fill("#mx-think", "A microwave, a thermostat, and a car."); await pg.click("form[data-mx=think] button[type=submit]"); await pg.wait_for_timeout(400)
    ok("Think about it saves", await pg.evaluate("SE.store.eventsFor(SE.store.currentUser().id).some((e) => e.type === 'moxie_think')"))
    await pg.fill("#d-reflect", "setup runs once and loop runs forever."); await pg.click("#debrief-form button[type=submit]"); await pg.wait_for_timeout(700)
    await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)

    # S6 truth table and S8 plan
    await go(pg, "#/activity/moxie-06")
    ok("Session 6 shows the truth table", await pg.locator("#s-plan ~ * table, .mx-sec table").count() >= 1 and "All 3 LEDs flash" in await pg.inner_text("#app"))
    await go(pg, "#/activity/moxie-08")
    ok("Session 8: four plan lines to fill, and the approval check", await pg.locator("[data-plan]").count() == 4 and "Plan approved: not yet" in await pg.inner_text("#app"))
    for i, step in enumerate(["Green on, check button", "Yellow 2 s", "Red; if WALK pressed, chirp", "Back to green"]): await pg.fill(f"#mx-pl-{i}", step)
    await pg.click("form[data-mx=plan] button[type=submit]"); await pg.wait_for_timeout(400)
    ok("the plan saves as numbered steps", await pg.evaluate("SE.store.eventsFor(SE.store.currentUser().id).some((e) => e.type === 'moxie_plan' && e.data.text.startsWith('1. Green on'))"))

    # Teacher: sees the blanks in Checks, passes, and stars the stretch
    await educator(pg)
    await go(pg, "#/teach/checks")
    item = pg.locator("li", has_text="setup runs once and loop runs forever.")
    ok("Checks shows the student's code blanks and checklist", await item.locator(".mx-check-code").count() == 1 and "9 of 9 blanks filled" in await item.inner_text() and "4 of 4 checked" in await item.inner_text())
    await item.locator("button[value=confirm]").first.click(); await pg.wait_for_timeout(500)
    await go(pg, "#/moxie/teach")
    star = pg.locator('.mx-star[data-gate^="moxie-01|stretch"]').first
    ok("the checkoff grid shows the pass with a stretch star", await star.count() == 1)
    await star.click(); await pg.wait_for_timeout(400)
    ok("the stretch star records the sign-off", await pg.evaluate("SE.moxie.gateOpen(SE.moxie.work(SE.store.studentsIn(SE.store.classesFor(SE.store.currentUser().id)[0].id).find((s) => s.displayName === 'Ava R.').id), 'moxie-01', 'stretch')"))
    # a second team, for cards
    await pg.evaluate("(() => { const c = SE.store.classesFor(SE.store.currentUser().id)[0]; const s = SE.store.studentsIn(c.id); SE.store.saveTeam(c.id, [s.find((x) => x.displayName === 'Priya S.').id, s.find((x) => x.displayName === 'Jonah K.').id]); })()")
    await student(pg)
    await go(pg, "#/activity/moxie-01")
    so = await pg.inner_text(".mx-signoffs")
    ok("student: both sign-offs show as done", "passed by your teacher" in so and "checked" in so, so)

    # S13 design: the pin rule
    await go(pg, "#/activity/moxie-13")
    await pg.fill("#mx-pp-0", "Buzzer"); await pg.select_option("#mx-pio-0", "output"); await pg.fill("#mx-ppin-0", "D6")
    await pg.click("form[data-mx=design] button[type=submit]"); await pg.wait_for_timeout(400)
    ok("a part on pin 6 is refused, naming the pin", "Pin 6 (Buzzer) is on the don't-use list" in await pg.inner_text("#app"))
    ok("the idea bank and scoring tables are shown", "Secret-combo lock box" in await pg.inner_text("#app") and "Works and meets all of your criteria" in await pg.inner_text("#app"))

    # S14 stand-up and subsystems, shared with the partner
    await go(pg, "#/activity/moxie-14")
    await pg.fill("#mx-su-done-14", "Wired the buzzer"); await pg.click('form[data-mx=standup][data-session="14"] button[type=submit]'); await pg.wait_for_timeout(400)
    await pg.fill("#mx-ss-0", "Buzzer"); await pg.check("#mx-ss-wired-0"); await pg.click("form[data-mx=subsystems] button[type=submit]"); await pg.wait_for_timeout(400)
    mateo = await pg.evaluate("SE.store.teammates(SE.store.currentUser().id)[0].id")
    ok("stand-up and subsystem checklist are shared with the partner", await pg.evaluate(f"(() => {{ const w = SE.moxie.work('{mateo}'); return w.some((e) => e.type === 'moxie_standup' && e.data.done === 'Wired the buzzer') && w.some((e) => e.type === 'moxie_subsystem'); }})()"))

    # S15 cards between teams: Priya's team sends one to Ava's team
    await student(pg, "Priya S.")
    await go(pg, "#/activity/moxie-15")
    ok("Priya can pick Ava's team, not her own", "Ava R. & Mateo L." in await pg.inner_text("#mx-fc-to-15") and "Priya" not in await pg.inner_text("#mx-fc-to-15"))
    await pg.fill("#mx-fc-s1-15", "The alarm is loud and fast"); await pg.fill("#mx-fc-s2-15", "Clear wiring"); await pg.fill("#mx-fc-w-15", "Add a reset button")
    await pg.click('form[data-mx=fbcard][data-session="15"] button[type=submit]'); await pg.wait_for_timeout(400)
    ok("the card shows as sent", "For Ava R. & Mateo L." in await pg.inner_text("#app"))
    await student(pg)
    await go(pg, "#/activity/moxie-15")
    t = await pg.inner_text("#app")
    ok("Ava's team sees the card, with who sent it", "From Jonah K. & Priya S." in t or "From Priya S. & Jonah K." in t, t[t.find("Cards for your team"):][:200])
    ok("a received card counts as feedback for the capstone", await pg.evaluate("SE.moxie.capstone(SE.moxie.work(SE.store.currentUser().id)).cards.length === 1"))

    # S16 reflection and self-rating
    await go(pg, "#/activity/moxie-16")
    await pg.fill("#mx-refl-0", "Test one part at a time."); await pg.check('input[name=mx-rate-2][value="3"]')
    await pg.click("form[data-mx=reflect] button[type=submit]"); await pg.wait_for_timeout(400)
    ok("reflection and the 4 'I can' ratings save", await pg.evaluate("(() => { const e = SE.store.eventsFor(SE.store.currentUser().id).filter((x) => x.type === 'moxie_reflect').pop(); return e && e.data.answers[0] === 'Test one part at a time.' && e.data.ratings['find and fix a problem when my project doesn’t work'] === 3; })()"))

    # Print this sheet
    await go(pg, "#/activity/moxie-08")
    await pg.evaluate("window.print = () => {}")
    await pg.click("#mx-print"); await pg.wait_for_timeout(200)
    sheet = await pg.inner_html("#mx-print-sheet")
    ok("the print sheet is the paper layout with lines for blanks and sign-offs", "Initials / date" in sheet and "Smart Crosswalk" in sheet and "<input" not in sheet and "____" in sheet)

    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    for h in ["#/activity/moxie-08", "#/activity/moxie-13", "#/activity/moxie-14", "#/activity/moxie-15"]:
        await m.goto(S + h); await m.wait_for_timeout(500)
        ok(f"phone: {h} has no sideways scroll", await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.close()
    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
