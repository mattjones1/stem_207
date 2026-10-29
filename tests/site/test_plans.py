# Learning Plans (usability Stage 4): templates, the simplified editor, keyboard reordering, blockers,
# assign to a class, Update for students, Students / Checks tabs, Finish, the plan picker on activity pages,
# moving old single assignments into a plan, and the student's plan page. Local mode uses the sample class;
# cloud mode uses the mock Supabase on real Postgres with update-6 (and update-10) applied.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; PORT=8787 node tests/backend/mock-supabase.js
#   python3 tests/site/test_plans.py [local_url] [cloud_url|skip]
import asyncio, sys, time
from playwright.async_api import async_playwright
L = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
C = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:8787/"
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def go(pg, url):
    await pg.goto(url.split("#")[0] + "#/activities"); await pg.wait_for_timeout(150); await pg.goto(url); await pg.wait_for_timeout(500)
async def educator(pg, S):
    await pg.goto(S + "#/signin/educator"); await pg.wait_for_timeout(300); await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(900)
async def student_sample(pg, S):
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)
def pid(pg): return pg.url.split("#/teach/plans/")[1].split("/")[0]
CLS = "SE.store.classesFor(SE.store.currentUser().id)[0]"

async def local(b):
    S = L; errs = []
    ctx = await b.new_context(viewport={"width": 1280, "height": 900}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await educator(pg, S)
    await go(pg, S + "#/teach/plans")
    ok("Learning Plans is in the top menu", await pg.locator('#site-nav a[href="#/teach/plans"]').count() == 1)
    ok("12 templates (Moxie course, 3 workshops, 6 classroom, 2 crews), each with Use this template", await pg.locator("[data-use^=tpl-]").count() == 12)
    ok("Current / Finished toggle", await pg.locator("[data-mode=current]").count() == 1 and await pg.locator("[data-mode=finished]").count() == 1)
    tpl = await pg.evaluate("JSON.stringify(SE.plans.template('tpl-maine-coast'))")

    # Use a template: an editable copy; the template doesn't change.
    await pg.click('[data-use="tpl-maine-coast"]'); await pg.wait_for_timeout(700)
    ok("Use this template opens the editor on a new draft with 6 activities", "/edit" in pg.url and await pg.locator(".pw-edit-step").count() == 6)
    ok("the editor has no evidence or synthesis fields", await pg.locator("textarea[data-f=evidence], textarea[data-f=adaptation], [data-f=prompt]").count() == 0)
    p = pid(pg)
    first = await pg.eval_on_selector_all(".pw-edit-step h3", "els=>els.map(e=>e.textContent.trim().split(' (')[0])")
    await pg.locator("[data-down]").first.focus(); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
    after = await pg.eval_on_selector_all(".pw-edit-step h3", "els=>els.map(e=>e.textContent.trim().split(' (')[0])")
    ok("Move down (keyboard) swaps activities 1 and 2", after[0] == first[1] and after[1] == first[0], after[:2])
    ok("the moved activity's button keeps focus", await pg.evaluate("!!document.activeElement.dataset.down || !!document.activeElement.dataset.up"))
    ok("the move is announced", "moved to 2 of 6" in await pg.inner_text("#pw-live"))
    await pg.locator("[data-up]").nth(1).click(); await pg.wait_for_timeout(300)
    await pg.locator("textarea[data-f=note]").first.fill("Work with your table group."); await pg.wait_for_timeout(900)
    ok("a note to students is saved on the activity", await pg.evaluate(f"SE.store.pathwayById('{p}').steps[0].note") == "Work with your table group.")
    ok("the template is unchanged", await pg.evaluate("JSON.stringify(SE.plans.template('tpl-maine-coast'))") == tpl)
    await pg.fill("#pw-q", "Stop-Motion"); await pg.wait_for_timeout(300)
    await pg.locator('[data-add="stop-motion-studio"]').click(); await pg.wait_for_timeout(300)
    last = pg.locator(".pw-edit-step").last
    ok("an activity with no resource is added as optional", not await last.locator("input[data-f=required]").is_checked())
    await last.locator("input[data-f=required]").click(); await pg.wait_for_timeout(300)   # the app un-ticks it, so click (check() would fail)
    ok("…and can't be switched to required", not await last.locator("input[data-f=required]").is_checked())
    await last.locator("[data-remove]").click(); await pg.wait_for_timeout(900)

    # Draft → assign (Current) → edit → Update for students → Finish.
    await go(pg, S + f"#/teach/plans/{p}")
    ok("a new plan is a Draft", "Draft" in await pg.inner_text(".pw-card__meta"))
    for tab in ["Activities", "Students", "Checks"]:
        ok(f"plan tab: {tab}", await pg.locator(".plan-tabs a", has_text=tab).count() == 1)
    await pg.click("#pl-assign button[type=submit]"); await pg.wait_for_timeout(500)
    ok("assigning makes it Current for the class", await pg.evaluate(f"SE.store.planStatus(SE.store.pathwayById('{p}'))") == "current" and "Current" in await pg.inner_text(".pw-card__meta"))
    ok("the class is pinned to version 1", await pg.evaluate(f"SE.store.pathwayAssignmentFor({CLS}.id, '{p}').version") == 1)
    await go(pg, S + f"#/teach/plans/{p}/edit")
    await pg.fill("#pw-goal", "A sharper goal."); await pg.wait_for_timeout(900)
    await go(pg, S + f"#/teach/plans/{p}")
    ok("an edit shows Update for students", await pg.locator("#pl-update").count() == 1 and "since students got it" in await pg.inner_text("#app"))
    await pg.click("#pl-update"); await pg.wait_for_timeout(500)
    ok("Update for students moves the class to the new version", await pg.evaluate(f"SE.store.pathwayAssignmentFor({CLS}.id, '{p}').version") == 2 and await pg.locator("#pl-update").count() == 0)
    await go(pg, S + f"#/teach/plans/{p}/students")
    ok("Students tab: one row per student, status in words", await pg.locator(".plan-grid tbody tr").count() >= 3 and "Not started" in await pg.inner_text(".plan-grid"))
    await go(pg, S + "#/teach/plans")
    ok("the plan is listed under Current", await pg.locator("#plans-current ~ ul a, section:has(#plans-current) a", has_text="Maine Coast Explorers").count() >= 1)
    await go(pg, S + f"#/teach/plans/{p}")
    await pg.click("#pl-finish"); await pg.wait_for_timeout(500)
    ok("Finish moves it to Finished", await pg.evaluate(f"SE.store.planStatus(SE.store.pathwayById('{p}'))") == "finished")
    await go(pg, S + "#/teach/plans"); await pg.click("[data-mode=finished]"); await pg.wait_for_timeout(300)
    ok("the Finished view lists it", "Maine Coast Explorers" in await pg.inner_text("section:has(#plans-finished)"))
    await pg.click("[data-mode=current]"); await pg.wait_for_timeout(200)

    # A blank plan can't be assigned, with reasons.
    await go(pg, S + "#/teach/plans/new"); await pg.wait_for_timeout(300)
    blank = pid(pg)
    await go(pg, S + f"#/teach/plans/{blank}")
    ok("Assign is marked unavailable on a blank plan", await pg.get_attribute("#pl-assign button[type=submit]", "aria-disabled") == "true")
    ok("…with the reason", "Add at least one activity" in await pg.inner_text("#app"))

    # Add to a Learning Plan from an activity page.
    await go(pg, S + "#/activity/fix-the-recipe")
    ok("activity page: Add to a Learning Plan", await pg.locator("#plan-pick").count() == 1 and await pg.locator('a[href="#/teach/plans/new/fix-the-recipe"]').count() == 1)
    await pg.select_option("#pp-plan", blank); await pg.click("#plan-pick button[type=submit]"); await pg.wait_for_timeout(400)
    ok("the activity is added to the chosen plan", await pg.evaluate(f"SE.store.pathwayById('{blank}').steps.some((s) => s.activityId === 'fix-the-recipe')") and "Added to" in await pg.inner_text("#pp-status"))
    await pg.click("#plan-pick button[type=submit]"); await pg.wait_for_timeout(300)
    ok("adding it twice is refused", "already in" in await pg.inner_text("#pp-status"))

    # Old single assignments move into a plan.
    await pg.evaluate(f"SE.store.assign({CLS}.id, ['tide-watchers', 'sense-think-act'])")
    await go(pg, S + "#/teach/plans")
    ok("a banner offers to move old assignments", await pg.locator("[data-migrate]").count() == 1)
    await pg.click("[data-migrate]"); await pg.wait_for_timeout(700)
    ok("the move makes an assigned plan and clears the old assignments", await pg.evaluate(f"(() => {{ const c = {CLS}; const p = SE.store.pathwayById(location.hash.split('/')[3]); return !!p && SE.store.planStatus(p) === 'current' && SE.store.assignmentsFor(c.id).length === 0; }})()"))

    # Old addresses.
    for old, new in [("#/teach/missions", "#/teach/plans"), ("#/teach/pathways", "#/teach/plans"), (f"#/teach/pathways/{p}", f"#/teach/plans/{p}")]:
        await go(pg, S + old)
        ok(f"{old} redirects to {new}", pg.url.endswith(new), pg.url)

    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    await m.goto(S + f"#/teach/plans/{blank}/edit"); await m.wait_for_timeout(600)
    ok("phone: the editor has no sideways scroll", await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.goto(S + f"#/teach/plans/{p}/students"); await m.wait_for_timeout(600)
    ok("phone: the plan page has no sideways scroll", await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.close()
    ok("local: no page errors", not errs, errs)
    await ctx.close()

async def local_student(b):
    # The student's plan page, a send, the teacher's Pass from the plan's Checks tab, and Finish → All.
    S = L; errs = []
    ctx = await b.new_context(viewport={"width": 1280, "height": 900}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await educator(pg, S)
    aid, pid_ = (await pg.evaluate(f"""(() => {{ const p = SE.store.duplicatePathway(SE.plans.template('tpl-instructions-invention')); SE.store.publishPathway(p.id);
      return SE.store.assignPathway({CLS}.id, p.id).id + '|' + p.id; }})()""")).split("|")
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await student_sample(pg, S)
    ok("Home's Up next comes from the plan", "from instructions to invention" in (await pg.inner_text(".upnext .today-card__why")).lower())
    await go(pg, S + "#/plans")
    ok("My Learning Plans lists the plan with progress", "From Instructions to Invention" in await pg.inner_text(".myplans") and "of 3" in await pg.inner_text(".myplans"))
    await pg.click(f'a[href="#/plans/{aid}"]'); await pg.wait_for_timeout(600)
    ok("the plan page lists 3 activities", await pg.locator(".plan-item").count() == 3)
    want = await pg.evaluate(f"(() => {{ const a = SE.store.pathwayAssignmentsFor(SE.store.currentUser().classId).find((x) => x.id === '{aid}'); return SE.plans.progress(SE.game.profile(SE.store.currentUser().id), a.snapshot).passed; }})()")
    ok("progress reads N of 3 (passed of required)", f"{want} of 3" in await pg.inner_text(".page-top__progress"), want)
    # The sample student already sent Bug Hunt and Pixel Art Code, so the one not started comes first.
    ok("the next activity is offered first", await pg.locator('.page-top a[href="#/activity/sense-think-act"]').count() == 1)
    ok("statuses are words, not color", "Not started" in await pg.inner_text(".plan-list"))
    await pg.evaluate("SE.store.log('mission_completed', { activityId: 'sense-think-act', evidence: 'written', reflection: 'We fixed step 3.', confidence: 'got-it', stepsDone: 0, stepsTotal: 0 })")
    await go(pg, S + f"#/plans/{aid}")
    ok("after sending, the activity shows Sent", "Sent" in await pg.inner_text(".plan-item >> nth=1"))
    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    await m.goto(S + f"#/plans/{aid}"); await m.wait_for_timeout(600)
    ok("phone: the plan page has no sideways scroll", await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.close()
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await educator(pg, S)
    await go(pg, S + f"#/teach/plans/{pid_}/checks")
    ok("the plan's Checks tab shows the waiting reflection", "We fixed step 3." in await pg.inner_text("#app") and "Checks (" in await pg.inner_text(".plan-tabs"))
    await pg.locator('li:has-text("We fixed step 3.") [data-check-student] button[value=confirm]').click(); await pg.wait_for_timeout(500)
    await go(pg, S + f"#/teach/plans/{pid_}/students")
    ok("Students tab shows Passed and a passed count", "Passed" in await pg.inner_text(".plan-grid") and " of 3" in await pg.inner_text(".plan-grid"))
    await go(pg, S + f"#/teach/plans/{pid_}"); await pg.click("#pl-finish"); await pg.wait_for_timeout(400)
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await student_sample(pg, S)
    ok("a finished plan leaves Home", "From Instructions to Invention" not in await pg.inner_text("#app"))
    await go(pg, S + "#/plans")
    ok("My Learning Plans: Current hides the finished plan", "From Instructions to Invention" not in await pg.inner_text("#app"))
    await pg.click("[data-mymode=all]"); await pg.wait_for_timeout(300)
    ok("My Learning Plans: All shows it, marked Finished", "From Instructions to Invention" in await pg.inner_text(".myplans") and "Finished" in await pg.inner_text(".myplans"))
    ok("the toggle keeps focus and state", await pg.get_attribute("[data-mymode=all]", "aria-pressed") == "true" and await pg.evaluate("document.activeElement.dataset.mymode") == "all")
    await pg.click("[data-mymode=current]"); await pg.wait_for_timeout(200)
    await go(pg, S + f"#/plans/{aid}")
    ok("…but its page still opens, marked Finished, with Passed", "finished" in (await pg.inner_text(".page-top")).lower() and "Passed" in await pg.inner_text(".plan-list"))
    await go(pg, S + f"#/my/pathways/{aid}")
    ok("#/my/pathways/<id> redirects to #/plans/<id>", pg.url.endswith(f"#/plans/{aid}"), pg.url)
    ok("student: no page errors", not errs, errs)
    await ctx.close()

async def cloud(b):
    S = C; errs = []
    async def signup(ctx, name):
        pg = await ctx.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(S + "#/signup"); await pg.wait_for_timeout(400)
        await pg.fill("#su-name", name); await pg.fill("#su-class", f"{name} room"); await pg.fill("#su-email", f"pl{int(time.time()*1000)}@school.org")
        await pg.fill("#su-pw", "harbor207!"); await pg.fill("#su-pw2", "harbor207!"); await pg.click("#su-form button[type=submit]"); await pg.wait_for_timeout(1200)
        return pg
    ac = await b.new_context(); a = await signup(ac, "Ms. Ames")
    pw = await a.evaluate(f"""(() => {{ const p = SE.store.duplicatePathway(SE.plans.template('tpl-instructions-invention'));
      SE.store.publishPathway(p.id); SE.store.assignPathway({CLS}.id, p.id); return p.id; }})()""")
    await a.evaluate("SE.store.flush()"); await a.wait_for_timeout(800); await a.reload(); await a.wait_for_timeout(1500)
    ok("cloud: plan, version, and assignment persist after reload", await a.evaluate(f"(() => {{ const x = SE.store.pathwayAssignmentFor({CLS}.id, '{pw}'); return !!SE.store.pathwayById('{pw}') && !!x && x.version === 1 && !!SE.store.pathwayVersion('{pw}', 1); }})()"))
    bc = await b.new_context(); bp = await signup(bc, "Mr. Bell")
    ok("cloud: another educator can't load it", await bp.evaluate(f"!SE.store.pathwayById('{pw}')"))
    ok("cloud: RLS hides it from another educator's direct query", await bp.evaluate(f"SE.cloud.rest('GET', '/pathways?id=eq.{pw}&select=id').then((r) => r.length === 0)"))
    ok("cloud: another educator can't assign it to their class", await bp.evaluate(f"""(async () => {{ const c = {CLS};
      try {{ await SE.cloud.rest('POST', '/pathway_assignments', {{ id: 'pasg_x', class_id: c.id, pathway_id: '{pw}', version: 1 }}, 'return=minimal'); return false; }} catch (e) {{ return e.status >= 400; }} }})()"""))
    ok("cloud: published versions can't be edited", await a.evaluate(f"""SE.cloud.rest('PATCH', '/pathway_versions?pathway_id=eq.{pw}', {{ snapshot: {{}} }}, 'return=representation').then((r) => !r || r.length === 0, () => true)"""))
    await a.evaluate(f"(() => {{ const c = {CLS}; if (!SE.store.studentsIn(c.id).length) SE.store.addStudent(c.id, {{ displayName: 'Kai M.' }}); }})()")
    await a.evaluate("SE.store.flush()"); await a.wait_for_timeout(800)
    code = await a.evaluate(f"{CLS}.code")
    kid = await a.evaluate(f"SE.store.studentsIn({CLS}.id)[0]")
    async def student():
        sc = await b.new_context(); s = await sc.new_page(); s.on("pageerror", lambda e: errs.append(str(e)))
        await s.goto(S + "#/signin/student"); await s.wait_for_timeout(300)
        await s.fill("#class-code", code); await s.click("#code-form button[type=submit]"); await s.wait_for_timeout(500)
        await s.click(f"text={kid['displayName']}"); await s.wait_for_timeout(200)
        for x in kid["picCode"]: await s.click(f"[data-pic={x}]")
        await s.wait_for_timeout(1200)
        return sc, s
    sc, s = await student()
    ok("cloud: the student's device gets the plan snapshot, not finished", await s.evaluate("(() => { const a = SE.store.pathwayAssignmentsFor(SE.store.currentUser().classId); return a.length === 1 && a[0].snapshot.steps.length === 3 && !SE.store.planFinished(a[0]); })()"))
    await sc.close()
    await a.evaluate(f"SE.store.archivePathway('{pw}', true)"); await a.evaluate("SE.store.flush()"); await a.wait_for_timeout(800)
    sc, s = await student()
    ok("cloud: a finished plan reaches the student as finished (update-10)", await s.evaluate("SE.store.planFinished(SE.store.pathwayAssignmentsFor(SE.store.currentUser().classId)[0])"))
    await sc.close()
    ok("cloud: no page errors", not errs, errs)
    await ac.close(); await bc.close()

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch()
    await local(b)
    await local_student(b)
    if C != "skip": await cloud(b)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
