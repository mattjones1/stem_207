# Educator pathways (categories-pathways Phase 3): templates, goal-first editor, keyboard reordering,
# publish blockers, versions pinned to assignments, and owner isolation, in local mode (sample class)
# and cloud mode (mock Supabase on real Postgres with update-6 applied).
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; PORT=8787 node tests/backend/mock-supabase.js
#   python3 tests/site/test_pathways.py [local_url] [cloud_url|skip]
import asyncio, sys, time
from playwright.async_api import async_playwright
L = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
C = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:8787/"
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
NOT_FOUND = "couldn’t find that page"
async def go(pg, url):
    await pg.goto(url.split("#")[0] + "#/library"); await pg.wait_for_timeout(150); await pg.goto(url); await pg.wait_for_timeout(500)
async def educator(pg, S):
    await pg.goto(S + "#/signin/educator"); await pg.wait_for_timeout(300); await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(900)
def pid(pg): return pg.url.split("#/teach/pathways/")[1].split("/")[0]

async def local(b):
    S = L; errs = []
    ctx = await b.new_context(viewport={"width": 1280, "height": 900}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await educator(pg, S)
    await go(pg, S + "#/teach/pathways")
    ok("Pathways tab is in the dashboard", await pg.locator('.tabs a[href="#/teach/pathways"]').count() == 1)
    ok("4 templates, each with Use this template", await pg.locator("[data-use^=tpl-]").count() == 4)
    tpl = await pg.evaluate("JSON.stringify(SE.pathways.template('tpl-maine-coast'))")

    # Use a template: an editable copy; the template doesn't change.
    await pg.click('[data-use="tpl-maine-coast"]'); await pg.wait_for_timeout(700)
    ok("Use this template opens the editor on a new draft", "/edit" in pg.url and await pg.locator(".pw-edit-step").count() == 7)
    p = pid(pg)
    # Keyboard reordering: focus Move down on step 1 and press Enter.
    first = await pg.eval_on_selector_all(".pw-edit-step h3", "els=>els.map(e=>e.textContent.trim().split(' (')[0])")
    await pg.locator("[data-down]").first.focus(); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
    after = await pg.eval_on_selector_all(".pw-edit-step h3", "els=>els.map(e=>e.textContent.trim().split(' (')[0])")
    ok("Move down (keyboard) swaps steps 1 and 2", after[0] == first[1] and after[1] == first[0], after[:2])
    ok("the moved step's button keeps focus", await pg.evaluate("!!document.activeElement.dataset.down || !!document.activeElement.dataset.up"))
    ok("the move is announced", "moved to step 2" in await pg.inner_text("#pw-live"))
    await pg.locator("[data-up]").nth(1).click(); await pg.wait_for_timeout(300)
    # An adaptation stays on the step.
    await pg.locator("textarea[data-f=adaptation]").first.fill("Pairs share one tablet."); await pg.wait_for_timeout(900)
    ok("adaptation saved on the pathway step", await pg.evaluate(f"SE.store.pathwayById('{p}').steps[0].adaptation") == "Pairs share one tablet.")
    ok("the template is unchanged", await pg.evaluate("JSON.stringify(SE.pathways.template('tpl-maine-coast'))") == tpl)
    ok("the mission itself is unchanged", await pg.evaluate("!('adaptation' in SE.activityById['lab-field-station'])"))
    # Add a coming-soon mission: it comes in optional, and can't be made required.
    await pg.fill("#pw-q", "stop-motion"); await pg.fill("#pw-q", "Stop-Motion"); await pg.wait_for_timeout(300)
    await pg.locator('[data-add="stop-motion-studio"]').click(); await pg.wait_for_timeout(300)
    last = pg.locator(".pw-edit-step").last
    ok("a mission with no resource is added as optional", not await last.locator("input[data-f=required]").is_checked())
    await last.locator("input[data-f=required]").check(); await pg.wait_for_timeout(300)
    ok("…and can't be switched to required", not await last.locator("input[data-f=required]").is_checked())
    await last.locator("[data-remove]").click(); await pg.wait_for_timeout(400)

    # Publish, assign (pins v1), edit and republish (class stays on v1), move the class.
    await go(pg, S + f"#/teach/pathways/{p}")
    await pg.click("#pw-publish"); await pg.wait_for_timeout(500)
    ok("publish makes version 1", "Published v1" in await pg.inner_text("#app"))
    await pg.click("#pw-assign"); await pg.wait_for_timeout(500)
    ok("assigning pins the class to v1", "Assigned: version 1" in await pg.inner_text("#app"))
    await go(pg, S + f"#/teach/pathways/{p}/edit")
    await pg.fill("#pw-goal", "A sharper goal."); await pg.wait_for_timeout(900)
    await go(pg, S + f"#/teach/pathways/{p}")
    ok("an edit shows as unpublished changes", "Unpublished changes" in await pg.inner_text("#app"))
    await pg.click("#pw-publish"); await pg.wait_for_timeout(500)
    t = await pg.inner_text("#app")
    ok("v2 published; the class stays on v1", "Published v2" in t and "Assigned: version 1 (latest is v2)" in t)
    await pg.click("#pw-move"); await pg.wait_for_timeout(500)
    ok("Move the class pins v2", "Assigned: version 2." in await pg.inner_text("#app"))

    # Publish is blocked with reasons for a blank pathway.
    await go(pg, S + "#/teach/pathways/new"); await pg.wait_for_timeout(300)
    blank = pid(pg)
    await go(pg, S + f"#/teach/pathways/{blank}")
    await pg.click("#pw-publish"); await pg.wait_for_timeout(300)
    t = await pg.inner_text("#app")
    ok("a blank pathway can't publish, with reasons", "Before you can publish" in t and "Add a goal" in t and "Published v1" not in t)

    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    await m.goto(S + f"#/teach/pathways/{p}/edit"); await m.wait_for_timeout(600)
    ok("phone: the editor has no sideways scroll", await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.close()
    ok("local: no page errors", not errs, errs)
    await ctx.close()

async def student_sample(pg, S):
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)

async def local_evidence(b):
    # Phase 4: the student's pathway page, evidence, team artifact, review and revise, portfolio.
    S = L; errs = []
    ctx = await b.new_context(viewport={"width": 1280, "height": 900}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await educator(pg, S)
    aid = await pg.evaluate("""(() => { const p = SE.store.duplicatePathway(SE.pathways.template('tpl-instructions-invention')); SE.store.publishPathway(p.id);
      const c = SE.store.classesFor(SE.store.currentUser().id)[0]; return SE.store.assignPathway(c.id, p.id).id + '|' + p.id; })()""")
    aid, pid_ = aid.split("|")
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await student_sample(pg, S)
    ok("Today shows the assigned pathway", "From Instructions to Invention" in await pg.inner_text(".today-col--class"))
    await pg.click(f'a[href^="#/my/pathways/{aid}"]'); await pg.wait_for_timeout(600)
    ok("the pathway page lists 4 steps", await pg.locator(".pwk-step").count() == 4)
    f = pg.locator("form[data-send]").first
    await f.locator("button[type=submit]").click(); await pg.wait_for_timeout(300)
    ok("an empty written answer is refused", "Write your answer first" in await f.inner_text())
    await f.locator("textarea").fill("Step 3 was unclear, so we rewrote it."); await f.locator("button[type=submit]").click(); await pg.wait_for_timeout(500)
    ok("sent evidence shows as Sent", "Sent" in await pg.inner_text("#step-1"))
    team = pg.locator("details.pwk-team").first
    if await team.count():
        await team.locator("summary").click()
        await team.locator("textarea").fill("Our revised instruction cards"); await team.locator("input").fill("http://not-secure.example")
        await team.locator("button[type=submit]").click(); await pg.wait_for_timeout(300)
        ok("a non-https artifact link is refused", "https://" in await team.inner_text())
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await educator(pg, S)
    await go(pg, S + f"#/teach/pathways/{pid_}/review")
    ok("review grid counts 1 sent on step 1", "1 sent · 0 accepted" in await pg.inner_text(".pwk-grid"))
    await pg.click('[data-open]:has-text("Ava R.")'); await pg.wait_for_timeout(500)
    rv = pg.locator("form[data-review]").first
    await rv.locator('input[value="revise"]').check(); await rv.locator("button[type=submit]").click(); await pg.wait_for_timeout(300)
    ok("a revision needs a note", "Write a short note" in await rv.inner_text())
    await rv.locator("textarea").fill("Show the before and after cards."); await rv.locator("button[type=submit]").click(); await pg.wait_for_timeout(500)
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await student_sample(pg, S)
    ok("Today shows the revise request with the note", "Revise step 1" in await pg.inner_text(".today-col--class") and "before and after" in await pg.inner_text(".today-col--class"))
    await go(pg, S + f"#/my/pathways/{aid}")
    ok("the pathway page shows the revise banner", "asked you to revise" in await pg.inner_text("#app"))
    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    await m.goto(S + f"#/my/pathways/{aid}"); await m.wait_for_timeout(600)
    ok("phone: the pathway page has no sideways scroll", await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.close()
    ok("evidence: no page errors", not errs, errs)
    await ctx.close()

async def cloud(b):
    S = C; errs = []
    async def signup(ctx, name):
        pg = await ctx.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(S + "#/signup"); await pg.wait_for_timeout(400)
        await pg.fill("#su-name", name); await pg.fill("#su-class", f"{name} room"); await pg.fill("#su-email", f"pw{int(time.time()*1000)}@school.org")
        await pg.fill("#su-pw", "harbor207!"); await pg.fill("#su-pw2", "harbor207!"); await pg.click("#su-form button[type=submit]"); await pg.wait_for_timeout(1200)
        return pg
    ac = await b.new_context(); a = await signup(ac, "Ms. Ames")
    pw = await a.evaluate("""(() => { const p = SE.store.duplicatePathway(SE.pathways.template('tpl-instructions-invention'));
      SE.store.publishPathway(p.id); const c = SE.store.classesFor(SE.store.currentUser().id)[0]; SE.store.assignPathway(c.id, p.id); return p.id; })()""")
    await a.evaluate("SE.store.flush()"); await a.wait_for_timeout(800); await a.reload(); await a.wait_for_timeout(1500)
    ok("cloud: pathway, version, and assignment persist after reload", await a.evaluate(f"(() => {{ const c = SE.store.classesFor(SE.store.currentUser().id)[0]; const x = SE.store.pathwayAssignmentFor(c.id, '{pw}'); return !!SE.store.pathwayById('{pw}') && !!x && x.version === 1 && !!SE.store.pathwayVersion('{pw}', 1); }})()"))
    bc = await b.new_context(); bp = await signup(bc, "Mr. Bell")
    ok("cloud: another educator can't load it", await bp.evaluate(f"!SE.store.pathwayById('{pw}')"))
    ok("cloud: RLS hides it from another educator's direct query", await bp.evaluate(f"SE.cloud.rest('GET', '/pathways?id=eq.{pw}&select=id').then((r) => r.length === 0)"))
    ok("cloud: another educator can't assign it to their class", await bp.evaluate(f"""(async () => {{ const c = SE.store.classesFor(SE.store.currentUser().id)[0];
      try {{ await SE.cloud.rest('POST', '/pathway_assignments', {{ id: 'pasg_x', class_id: c.id, pathway_id: '{pw}', version: 1 }}, 'return=minimal'); return false; }} catch (e) {{ return e.status >= 400; }} }})()"""))
    ok("cloud: published versions can't be edited", await a.evaluate(f"""SE.cloud.rest('PATCH', '/pathway_versions?pathway_id=eq.{pw}', {{ snapshot: {{}} }}, 'return=representation').then((r) => !r || r.length === 0, () => true)"""))
    # Phase 4 in the cloud: the student's device gets the pinned snapshot through student_state, and sends evidence;
    # another teacher can't write a review for a student in a class they don't own.
    await a.evaluate("(() => { const c = SE.store.classesFor(SE.store.currentUser().id)[0]; if (!SE.store.studentsIn(c.id).length) SE.store.addStudent(c.id, { displayName: 'Kai M.' }); })()")
    await a.evaluate("SE.store.flush()"); await a.wait_for_timeout(800)
    code = await a.evaluate("SE.store.classesFor(SE.store.currentUser().id)[0].code")
    cid = await a.evaluate("SE.store.classesFor(SE.store.currentUser().id)[0].id")
    kid = await a.evaluate("SE.store.studentsIn(SE.store.classesFor(SE.store.currentUser().id)[0].id)[0]")
    sc = await b.new_context(); s = await sc.new_page(); s.on("pageerror", lambda e: errs.append(str(e)))
    await s.goto(S + "#/signin/student"); await s.wait_for_timeout(300)
    await s.fill("#class-code", code); await s.click("#code-form button[type=submit]"); await s.wait_for_timeout(500)
    await s.click(f"text={kid['displayName']}"); await s.wait_for_timeout(200)
    for x in kid["picCode"]: await s.click(f"[data-pic={x}]")
    await s.wait_for_timeout(1200)
    ok("cloud: the student's device gets the assigned pathway snapshot", await s.evaluate("(() => { const a = SE.store.pathwayAssignmentsFor(SE.store.currentUser().classId); return a.length === 1 && !!a[0].snapshot && a[0].snapshot.steps.length === 4; })()"))
    await s.evaluate("""(() => { const a = SE.store.pathwayAssignmentsFor(SE.store.currentUser().classId)[0];
      SE.store.log('pathway_evidence', { assignmentId: a.id, stepId: a.snapshot.steps[0].id, v: a.version, mode: 'written', text: 'cloud evidence' }); })()""")
    await s.evaluate("SE.store.flush()"); await s.wait_for_timeout(800)
    await a.reload(); await a.wait_for_timeout(1500)
    ok("cloud: the teacher sees the student's evidence", await a.evaluate("SE.store.eventsForClass(SE.store.classesFor(SE.store.currentUser().id)[0].id).some((e) => e.type === 'pathway_evidence' && e.data.text === 'cloud evidence')"))
    ok("cloud: another teacher can't write a review for this student", await bp.evaluate(f"""(async () => {{
      try {{ await SE.cloud.rest('POST', '/events', {{ id: 'ev_x_{int(time.time())}', student_id: '{kid['id']}', class_id: '{cid}', type: 'pathway_review', at: Date.now(), data: {{}} }}, 'return=minimal'); return false; }}
      catch (e) {{ return e.status >= 400; }} }})()"""))
    await sc.close()
    ok("cloud: no page errors", not errs, errs)
    await ac.close(); await bc.close()

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch()
    await local(b)
    await local_evidence(b)
    if C != "skip": await cloud(b)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
