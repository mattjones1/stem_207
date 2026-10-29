# Educator QA round: the à la carte picker in the Learning Plan editor, the three STEM 207 workshop
# templates, adding students in the shared modal, the Dashboard (feed, palette KPIs, Message a class,
# Send a note), and the student's "Just for you" note. Local mode, sample class.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js
#   python3 tests/site/test_educator_qa.py [local_url]
import asyncio, sys
from playwright.async_api import async_playwright
S = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def go(pg, url):
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(150); await pg.goto(S + url); await pg.wait_for_timeout(500)
async def educator(pg):
    await pg.goto(S + "#/signin/educator"); await pg.wait_for_timeout(300); await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(900)
async def student(pg, name="Ava R.", pics=("pine", "lighthouse", "moon")):
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click(f"text={name}"); await pg.wait_for_timeout(200)
    for x in pics: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)
CLS = "SE.store.classesFor(SE.store.currentUser().id)[0]"

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    ctx = await b.new_context(viewport={"width": 1366, "height": 900}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)

    # Rules for pasted names.
    rows = await pg.evaluate("SE.roster.checkNames('Sam P.\\n\\nAva R.\\nsam p.\\nmaya@school.org\\nKid 2\\nAlexandria-Montgomery Q. Long', ['Ava R.'])")
    ok("checkNames: blank lines skipped, 6 names", len(rows) == 6, len(rows))
    ok("checkNames: ok / in class / twice / email / number / too long", [r["ok"] for r in rows] == [True, False, False, False, False, False]
       and "Already" in rows[1]["reason"] and "twice" in rows[2]["reason"] and "email" in rows[3]["reason"] and "email" in rows[4]["reason"] and "Too long" in rows[5]["reason"], rows)

    await educator(pg)
    # Dashboard
    await go(pg, "#/teach")
    ok("dashboard: greeting band", "Good " in await pg.inner_text(".dash-hello"))
    ok("dashboard: palette KPI tiles", await pg.locator(".kpi--green").count() == 1 and await pg.locator(".kpi--teal").count() == 1 and await pg.locator(".kpi--blue").count() == 1)
    feed = await pg.locator(".feed--dash li").count()
    ok("dashboard: Recent activity feed, at most 8 rows", 1 <= feed <= 8, feed)
    ok("dashboard: the feed says sent, not marked complete", "marked" not in await pg.inner_text(".feed--dash"))
    ok("dashboard: class card has Add students and Message", await pg.locator(".dash-class [data-add-students]").count() == 1 and await pg.locator(".dash-class [data-message-class]").count() == 1)

    # Message a class (modal)
    opener = pg.locator(".dash-actions [data-message-class]")
    await opener.click(); await pg.wait_for_timeout(300)
    ok("modal opens as a dialog with a name", await pg.locator("dialog.modal[open]").count() == 1 and bool(await pg.get_attribute("dialog.modal", "aria-labelledby")))
    ok("modal: focus starts in the form", await pg.evaluate("document.activeElement && document.activeElement.id") in ("mm-body", "mm-class"))
    await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
    ok("modal: Esc closes it and focus returns to the opener", await pg.locator("dialog.modal").count() == 0 and await pg.evaluate("document.activeElement.hasAttribute('data-message-class')"))
    await opener.click(); await pg.wait_for_timeout(300)
    await pg.click("#mm-form button[type=submit]"); await pg.wait_for_timeout(200)
    ok("message: an empty message is refused", "Write a message" in await pg.inner_text("#mm-err"))
    await pg.fill("#mm-body", "QA: bring your notebooks Friday."); await pg.click("#mm-form button[type=submit]"); await pg.wait_for_timeout(500)
    ok("message: posted to the class", await pg.evaluate(f"SE.store.messagesFor({CLS}.id)[0].body") == "QA: bring your notebooks Friday.")

    # Add students (modal) from the class page
    cid = await pg.evaluate(f"{CLS}.id")
    await go(pg, f"#/teach/classes/{cid}")
    ok("class page: no inline add form; Add students buttons", await pg.locator("#add-student").count() == 0 and await pg.locator("[data-add-students]").count() >= 2)
    await pg.locator("[data-add-students]").first.click(); await pg.wait_for_timeout(300)
    await pg.fill("#ms-names", "Rowan B.\nAva R.\nnina@school.org\nTheo S."); await pg.wait_for_timeout(200)
    ok("add students: the check list flags two names", await pg.locator("#ms-check .is-bad").count() == 2 and await pg.locator("#ms-check .is-ok").count() == 2)
    ok("add students: the button counts the ready names", "Add 2 students" in await pg.inner_text("#ms-add"))
    await pg.select_option("#ms-grade", "2-3"); await pg.click("#ms-add"); await pg.wait_for_timeout(500)
    ok("add students: login cards for the new students", await pg.locator(".ms-cards .login-card").count() == 2 and "Rowan B." in await pg.inner_text(".ms-cards"))
    ok("add students: saved with the chosen grade band", await pg.evaluate(f"SE.store.studentsIn('{cid}').filter((s) => ['Rowan B.', 'Theo S.'].includes(s.displayName)).every((s) => s.gradeBand === '2-3')"))
    await pg.locator("dialog [data-modal-close]", has_text="Done").click(); await pg.wait_for_timeout(500)
    ok("add students: the class page shows them after Done", "Theo S." in await pg.inner_text(".login-cards"))

    # Send a note to one student (student page)
    ava = await pg.evaluate(f"SE.store.studentsIn('{cid}').find((s) => s.displayName === 'Ava R.').id")
    await go(pg, f"#/teach/student/{ava}")
    await pg.click("[data-note-student]"); await pg.wait_for_timeout(300)
    await pg.fill("#mn-body", "Great bridge notes. Try one more change."); await pg.click("#mn-form button[type=submit]"); await pg.wait_for_timeout(500)
    ok("note: saved as teacher_note", await pg.evaluate(f"SE.store.eventsFor('{ava}').some((e) => e.type === 'teacher_note' && e.data.note.startsWith('Great bridge'))"))

    # À la carte plan: one Coding, one VR, one AI
    await go(pg, "#/teach/plans")
    ok("plans: Build your own and Start from a template", await pg.locator('a[href="#/teach/plans/new"]').count() >= 1 and await pg.locator('a[data-jump="pw-tpl"]').count() == 1)
    ok("plans: the Moxie course and 3 workshops first, then 6 classroom templates and 3 crews", await pg.locator(".pw-group-h").first.inner_text() and await pg.locator("[data-use^=tpl-ws-]").count() == 3 and await pg.locator("[data-use^=tpl-]").count() == 13)
    await pg.goto(S + "#/teach/plans/new"); await pg.wait_for_timeout(700)
    coding_n = await pg.evaluate("STEM.activities.filter((a) => a.area === 'coding' || (a.alsoIn || []).includes('coding')).length")
    ok("picker: every coding activity is listed (no 12 cap)", await pg.locator("#pw-results .pk-card").count() == coding_n, coding_n)
    ok("picker: all 7 categories are live tabs", await pg.locator("[data-pick-area]").count() == 7 and await pg.locator(".pk-tab.is-soon").count() == 0)
    for area, aid in [("coding", "lab-dance-party"), ("vr", "acadia-from-above"), ("ai", "how-ai-sorts")]:
        await pg.click(f"[data-pick-area={area}]"); await pg.wait_for_timeout(150)
        ok(f"picker: {area} tab is pressed", await pg.get_attribute(f"[data-pick-area={area}]", "aria-pressed") == "true")
        await pg.click(f'[data-add="{aid}"]'); await pg.wait_for_timeout(200)
    mix = await pg.inner_text("#pw-mix")
    ok("Your mix shows Coding, VR, and AI", all(k in mix for k in ["Coding", "Virtual Reality", "AI"]), mix)
    await pg.fill("#pw-q", "blueberry"); await pg.wait_for_timeout(200)
    ok("picker: search looks across every category", "every category" in await pg.inner_text("#pw-count") and await pg.locator('[data-add="blueberry-sorter"]').count() == 1)
    await pg.fill("#pw-q", ""); await pg.select_option("#pw-fgrade", "6-8"); await pg.wait_for_timeout(200)
    ok("picker: grade filter", await pg.evaluate("[...document.querySelectorAll('#pw-results [data-add]')].every((b) => SE.activityById[b.dataset.add].grades.includes('6-8'))"))
    await pg.wait_for_timeout(800)
    pid = pg.url.split("#/teach/plans/")[1].split("/")[0]
    await go(pg, f"#/teach/plans/{pid}")
    await pg.click("#pl-assign button[type=submit]"); await pg.wait_for_timeout(500)
    ok("the à la carte plan is assigned", await pg.evaluate(f"SE.store.planStatus(SE.store.pathwayById('{pid}'))") == "current")

    # Workshops
    tpls = await pg.evaluate("JSON.stringify(STEM.pathwayTemplates.filter((t) => t.workshop).map((t) => ({ id: t.id, n: t.steps.length, ok: t.steps.every((s) => !!SE.activityById[s.activityId]), fmt: !!(t.workshop && t.workshop.format), fut: (t.future || []).length, sess: t.workshop.sessions.every((x) => x.steps.every((k) => k >= 1 && k <= t.steps.length)) })))")
    ok("workshops (3 plus the Moxie course): every step resolves, format, valid sessions", tpls.count('"ok":true') == 4 and tpls.count('"fmt":true') == 4 and tpls.count('"sess":true') == 4, tpls)
    ok("workshops: 3D Printing is an optional add-on step now; Moxie is still future text", await pg.evaluate("['tpl-ws-sampler', 'tpl-ws-katahdin'].every((id) => SE.plans.stepsOf(SE.plans.template(id)).some((s) => SE.activityById[s.activityId].area === '3d-printing' && !s.required)) && SE.plans.template('tpl-ws-robots').future.length === 1"))
    ok("workshops: future content is never a step", await pg.evaluate("STEM.pathwayTemplates.every((t) => t.steps.every((s) => !(SE.activityById[s.activityId] || {}).placeholder))"))
    await go(pg, "#/teach/plans/tpl-ws-sampler")
    t = await pg.inner_text("#app")
    ok("workshop preview: format, sessions, and the 3D add-on", "Workshop format" in t and "Half day" in t and "Add-on: 3D printing" in t and "Lobster Buoy Charm" in t)
    await go(pg, "#/teach/plans/tpl-ws-robots")
    ok("Robots workshop shows Moxie as coming later", "Coming with future content" in await pg.inner_text("#app"))
    await go(pg, "#/teach/plans/tpl-ws-sampler")
    ok("workshop preview: one activity from each live category", await pg.evaluate("new Set(SE.plans.stepsOf(SE.plans.template('tpl-ws-sampler')).filter((s) => s.required).map((s) => SE.activityById[s.activityId].area)).size") == 5)
    await pg.click('[data-use="tpl-ws-sampler"]'); await pg.wait_for_timeout(700)
    copy = pg.url.split("#/teach/plans/")[1].split("/")[0]
    await go(pg, f"#/teach/plans/{copy}")
    ok("a copy of a workshop still shows its format", "Workshop format" in await pg.inner_text("#app"))

    # Phone
    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    for h in ["#/teach", f"#/teach/plans/{pid}/edit"]:
        await m.goto(S + h); await m.wait_for_timeout(600)
        ok(f"phone: {h} has no sideways scroll", await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.goto(S + f"#/teach/classes/{cid}"); await m.wait_for_timeout(600)
    await m.locator("[data-add-students]").first.click(); await m.wait_for_timeout(300)
    ok("phone: the modal fits the screen", await m.evaluate("document.querySelector('dialog.modal').getBoundingClientRect().width") <= 390 and await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.close()

    # Student: the note and the message on Home
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await student(pg)
    ok("student: Just for you note on Home", "Great bridge notes" in await pg.inner_text(".home-note") and "just for you" in (await pg.inner_text(".home-note__tag")).lower())
    ok("student: the class message is on Home too", "bring your notebooks" in await pg.inner_text(".home-msg"))
    await go(pg, "#/me")
    ok("student: notes listed on Me", "Great bridge notes" in await pg.inner_text(".notes-list"))
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await student(pg, "Mateo L.", await pg.evaluate("SE.store.studentsIn(SE.store.classByCode ? SE.store.classByCode('MOOSE7').id : '').find((s) => s.displayName === 'Mateo L.').picCode"))
    ok("another student doesn't see Ava's note", await pg.locator(".home-note").count() == 0 and "Great bridge" not in await pg.inner_text("#app"))

    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
