# Moxie pathway: draft visibility, the overview and session pages, teams, capstone checks, gates,
# and versions, in local mode (sample class) and cloud mode (mock Supabase with update-5 applied).
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; PORT=8787 node tests/backend/mock-supabase.js
#   python3 tests/site/test_moxie.py [local_url] [cloud_url|skip]
import asyncio, sys, time
from playwright.async_api import async_playwright
L = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
C = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:8787/"
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def student_sample(pg, S):
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)
async def switch(pg, S, role):
    await pg.reload(); await pg.wait_for_timeout(500)
    await pg.evaluate("SE.store.signOut && SE.store.signOut()"); await pg.wait_for_timeout(200)
    if role == "student": return await student_sample(pg, S)
    await pg.goto(S + "#/signin/educator"); await pg.wait_for_timeout(300); await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(900)
async def go(pg, url):
    await pg.goto(url.split("#")[0] + "#/library"); await pg.wait_for_timeout(150); await pg.goto(url); await pg.wait_for_timeout(500)
NOT_FOUND = "couldn’t find that page"
async def open_card(card):
    # The page remembers which review card was open, so only click a closed one.
    if await card.get_attribute("open") is None: await card.locator("summary").click(); await card.page.wait_for_timeout(150)
# Sessions are drafts in the repo. Tests make some "pilot" in memory (a reload undoes it).
PILOT = "['moxie-13','moxie-14','moxie-15','moxie-16'].forEach((id) => { const s = SE.activityById[id]; s.pub = 'pilot'; s.grades = ['6-8']; s.duration = 45; })"

async def local(b):
    S = L; errs = []
    ctx = await b.new_context(viewport={"width": 1280, "height": 900}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)

    # Students and guests never see drafts, and Moxie changes no library counts.
    await student_sample(pg, S)
    await go(pg, S + "#/moxie")
    ok("student: draft Moxie overview is not found", NOT_FOUND in await pg.inner_text("#app"))
    await go(pg, S + "#/activity/moxie-01")
    ok("student: draft session is not found", NOT_FOUND in await pg.inner_text("#app"))
    await go(pg, S + "#/area/engineering")
    ok("student: Engineering has no Moxie link", await pg.locator('a[href="#/moxie"]').count() == 0)
    ok("no Moxie session is in the library list", await pg.evaluate("!STEM.activities.some((a) => a.moxie)"))

    # Educators see the whole draft pathway.
    await switch(pg, S, "teacher")
    await go(pg, S + "#/area/engineering")
    ok("educator: Engineering links to Moxie", await pg.locator('a[href="#/moxie"]').count() == 1)
    await go(pg, S + "#/moxie")
    ok("educator: overview has 4 units", await pg.locator(".mx-unit").count() == 4)
    ok("educator: overview links all 16 sessions in order", await pg.eval_on_selector_all(".mx-unit__session a", "els=>els.map(e=>e.getAttribute('href'))") == [f"#/activity/moxie-{i:02d}" for i in range(1, 17)])
    t = await pg.inner_text("#app")
    ok("educator: pilot banner, pending grades and time", "In pilot." in t and "pending validation" in t and "pending a classroom pilot" in t)
    await go(pg, S + "#/activity/moxie-11")
    t = await pg.inner_text("#app")
    ok("educator: session follows the sheet's sections", all(h in t for h in ["Your mission", "What you need", "Before you wire", "Build it", "How the ultrasonic sensor works", "Code it", "Test it", "Stuck? Check these first", "Stretch goal", "Think about it", "Checkoff"]))
    ok("educator: the sheet's wiring and code are shown", "Echo" in t and await pg.locator("pre.mx-code").count() == 1 and "in review" not in t)
    ok("educator: a pilot session can be added to a Learning Plan", await pg.locator("#plan-pick, a[href='#/teach/plans/new/moxie-11']").count() >= 1)
    await go(pg, S + "#/moxie/teach")
    ok("educator: Teach Moxie shows the sample team", "Ava R. & Mateo L." in await pg.inner_text(".mx-teams"))
    ok("educator: all 16 pilot sessions can go in a Learning Plan", (await pg.inner_text(".mx-table")).count("Add to a Learning Plan") == 16)

    # Pilot: the teacher assigns capstone sessions; Ava designs, Mateo sees the shared design.
    await pg.evaluate(PILOT); await go(pg, S + "#/moxie/teach")
    ok("educator: pilot sessions can be added to a Learning Plan", await pg.locator('a[href="#/activity/moxie-13"]').count() >= 1 and "Add to a Learning Plan" in await pg.inner_text(".mx-table"))
    # Pilot sessions aren't published, so they go in a plan as optional activities.
    await pg.evaluate("""(() => { const p = SE.store.createPathway({ title: 'Moxie capstone', steps: ['moxie-13','moxie-14','moxie-15','moxie-16'].map((id) => ({ kind: 'mission', activityId: id, required: false, note: null })) });
      SE.store.publishPathway(p.id); SE.store.assignPathway(SE.store.classesFor(SE.store.currentUser().id)[0].id, p.id); })()""")
    ok("educator: the capstone plan is assigned", await pg.evaluate("SE.store.pathwayAssignmentsFor(SE.store.classesFor(SE.store.currentUser().id)[0].id).some((x) => x.snapshot.title === 'Moxie capstone')"))
    await switch(pg, S, "student"); await pg.evaluate(PILOT)
    await go(pg, S + "#/activity/moxie-13")
    ok("student: assigned pilot session opens", NOT_FOUND not in await pg.inner_text("#app"))
    ok("student: team panel names the partner", "you and Mateo L." in await pg.inner_text(".mx-team"))
    await pg.fill("#mx-problem", "Kids forget to shut the classroom door"); await pg.fill("#mx-user", "Our class")
    await pg.fill("#mx-crit-0", "Beeps within 2 seconds"); await pg.fill("#mx-crit-1", "Light is on when the door is open")
    await pg.check('input[name=mx-in][value=distance]'); await pg.check('input[name=mx-out][value=led]'); await pg.check('input[name=mx-out][value=rgb]')
    await pg.click('form[data-mx=design] button[type=submit]'); await pg.wait_for_timeout(400)
    t = await pg.inner_text("#app")
    ok("design check names the student's own outputs", "(LED, RGB LED) are all one type: light" in t, t[:0])
    ok("design check counts criteria", "You have 2 of 3 criteria" in t)
    await pg.fill("#mx-crit-2", "Quiet when the door is closed"); await pg.check('input[name=mx-out][value=buzzer]')
    await pg.fill("#mx-device", "beep when the door is left open")
    for i, how in enumerate(["Stopwatch from door open to beep", "Look at the light", "Listen with the door shut"]): await pg.fill(f"#mx-how-{i}", how)
    await pg.fill("#mx-pp-0", "Distance sensor"); await pg.select_option("#mx-pio-0", "input"); await pg.fill("#mx-ppin-0", "D5")
    await pg.fill("#mx-pp-1", "Buzzer"); await pg.select_option("#mx-pio-1", "output"); await pg.fill("#mx-ppin-1", "D18")
    await pg.check("#mx-sketch"); await pg.fill("#mx-pseudo", "if the door is open, beep and light")
    await pg.click('form[data-mx=design] button[type=submit]'); await pg.wait_for_timeout(400)
    ok("a complete design passes the check", "Your design has everything" in await pg.inner_text("#app"))
    ok("design approval shows as not yet", "Design approved: not yet" in await pg.inner_text("#app"))
    await go(pg, S + "#/activity/moxie-16")
    await pg.fill("#mx-refl-0", "I learned to test one part at a time."); await pg.check('input[name=mx-rate-0][value="3"]')
    await pg.click('form[data-mx=reflect] button[type=submit]'); await pg.wait_for_timeout(400)
    t = await pg.inner_text("#app")
    ok("showcase checklist names what's missing", "Code checklist" in t and "Criterion 1 (“Beeps within 2 seconds”)" in t)
    mateo = await pg.evaluate("SE.store.teammates(SE.store.currentUser().id)[0].id")
    ok("partner reads the shared design, not the reflection", await pg.evaluate(f"(() => {{ const w = SE.moxie.work('{mateo}'); return w.some((e) => e.type === 'moxie_design') && !w.some((e) => e.type === 'moxie_reflect'); }})()"))

    # Teacher approves the design for the team; a later content version is labeled.
    await switch(pg, S, "teacher"); await pg.evaluate(PILOT)
    await go(pg, S + "#/moxie/teach")
    card = pg.locator("details.mx-review", has_text="Ava R. & Mateo L.")
    await open_card(card)
    ok("review shows the team's design and Ava's reflection", "Kids forget to shut" in await card.inner_text() and "test one part at a time" in await card.inner_text())
    await card.locator('[data-gate^="moxie-13|design"]').click(); await pg.wait_for_timeout(400)
    ok("design approval is recorded for both partners", await pg.evaluate(f"['{mateo}', SE.store.studentsIn(SE.store.classesFor(SE.store.currentUser().id)[0].id).find((s) => s.displayName === 'Ava R.').id].every((id) => SE.moxie.gateOpen(SE.moxie.work(id), 'moxie-13', 'design'))"))
    await pg.evaluate("SE.activityById['moxie-13'].version = '0.2'"); await go(pg, S + "#/moxie/teach")
    await open_card(pg.locator("details.mx-review", has_text="Ava R. & Mateo L."))
    ok("work done on an older version is labeled", "Done on v1.0; current is v0.2" in await pg.inner_text("#app"))
    rubric = pg.locator("form.mx-rubric").first
    await rubric.locator("input").fill("Clear criteria you can measure."); await rubric.locator("button").click(); await pg.wait_for_timeout(400)
    ok("rubric feedback is saved per dimension (no score)", await pg.evaluate("SE.store.eventsForClass(SE.store.classesFor(SE.store.currentUser().id)[0].id).some((e) => e.type === 'moxie_rubric' && e.data.dimension && !('score' in e.data))"))

    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    await m.goto(S + "#/moxie/teach"); await m.wait_for_timeout(500)
    ok("phone: Teach Moxie has no sideways scroll", await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.goto(S + "#/activity/moxie-13"); await m.wait_for_timeout(500)
    ok("phone: a session page has no sideways scroll", await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.close()
    ok("local: no page errors", not errs, errs)
    await ctx.close()

async def cloud(b):
    S = C; errs = []; email = f"mx{int(time.time())}@school.org"
    tc = await b.new_context(viewport={"width": 1280, "height": 900}); t = await tc.new_page(); t.on("pageerror", lambda e: errs.append(str(e)))
    await t.goto(S + "#/signup"); await t.wait_for_timeout(400)
    await t.fill("#su-name", "Mr. Okafor"); await t.fill("#su-class", "Room 7"); await t.fill("#su-email", email); await t.fill("#su-pw", "harbor207!"); await t.fill("#su-pw2", "harbor207!")
    await t.click("#su-form button[type=submit]"); await t.wait_for_timeout(1200)
    for n in ["Kai M.", "Rosa P.", "Theo B."]:
        await t.locator("[data-add-students]").first.click(); await t.fill("#ms-names", n); await t.click("#ms-add"); await t.wait_for_timeout(300); await t.keyboard.press("Escape"); await t.wait_for_timeout(300)
    await t.evaluate("""(() => { const c = SE.store.classesFor(SE.store.currentUser().id)[0]; const s = SE.store.studentsIn(c.id);
      SE.store.saveTeam(c.id, [s.find((x) => x.displayName === 'Kai M.').id, s.find((x) => x.displayName === 'Rosa P.').id]); })()""")
    await t.evaluate("SE.store.flush()"); await t.wait_for_timeout(800)
    await t.reload(); await t.wait_for_timeout(1500)
    ok("cloud: the team persists after reload", await t.evaluate("SE.store.teamsFor(SE.store.classesFor(SE.store.currentUser().id)[0].id).length === 1"))
    code = await t.evaluate("SE.store.classesFor(SE.store.currentUser().id)[0].code")
    pcs = await t.evaluate("Object.fromEntries(SE.store.studentsIn(SE.store.classesFor(SE.store.currentUser().id)[0].id).map((s) => [s.displayName, s.picCode]))")
    async def student(name):
        sc = await b.new_context(viewport={"width": 1280, "height": 900}); s = await sc.new_page(); s.on("pageerror", lambda e: errs.append(str(e)))
        await s.goto(S + "#/signin/student"); await s.wait_for_timeout(300)
        await s.fill("#class-code", code); await s.click("#code-form button[type=submit]"); await s.wait_for_timeout(500)
        await s.click(f"text={name}"); await s.wait_for_timeout(200)
        for x in pcs[name]: await s.click(f"[data-pic={x}]")
        await s.wait_for_timeout(1200)
        return sc, s
    kc, k = await student("Kai M.")
    await k.evaluate("SE.store.log('moxie_design', { activityId: 'moxie-13', v: '0.1', problem: 'Plants need water', user: 'Our garden club', criteria: ['a','b','c'], inputs: ['light'], outputs: ['led','buzzer'], pins: 'x', pseudocode: 'y' })")
    await k.evaluate("SE.store.log('moxie_reflect', { activityId: 'moxie-16', v: '0.1', text: 'private to Kai', ratings: {} })")
    await k.evaluate("SE.store.flush()"); await k.wait_for_timeout(800)
    rc, r = await student("Rosa P.")
    ok("cloud: partner's device knows the team", await r.evaluate("SE.store.teammates(SE.store.currentUser().id).map((m) => m.displayName).join()") == "Kai M.")
    ok("cloud: partner reads the shared design", await r.evaluate("SE.store.teamEvents(SE.store.currentUser().id).some((e) => e.type === 'moxie_design' && e.data.problem === 'Plants need water')"))
    ok("cloud: partner never gets the reflection", await r.evaluate("!SE.store.teamEvents(SE.store.currentUser().id).some((e) => e.type === 'moxie_reflect')"))
    xc, x = await student("Theo B.")
    ok("cloud: a student on no team gets no one's work", await x.evaluate("SE.store.teamEvents(SE.store.currentUser().id).length === 0 && SE.store.teammates(SE.store.currentUser().id).length === 0"))
    ok("cloud: the public key can't read class_teams directly", await x.evaluate("""fetch(SE.cloud.url + '/rest/v1/class_teams?select=*', { headers: { apikey: STEM207_CONFIG.supabaseKey } })
      .then(async (r) => !r.ok || (await r.json()).length === 0)"""))
    ok("cloud: no page errors", not errs, errs)
    for c in [tc, kc, rc, xc]: await c.close()

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch()
    await local(b)
    if C != "skip": await cloud(b)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
