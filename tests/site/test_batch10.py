# Batch 10: separate reward systems. Class journey points and class badges come only from class
# work; personal XP, ranks, patches, and the harbor still count everything. Local mode (sample
# class) and cloud mode (mock Supabase on real Postgres with update-4: class totals from the server).
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; PORT=8787 node tests/backend/mock-supabase.js
#   python3 tests/site/test_batch10.py [local_url] [cloud_url|skip]
import asyncio, sys, time
from playwright.async_api import async_playwright
L = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
C = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:8787/"
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
J = "(()=>{const u=SE.store.currentUser(); const c=u.classId||SE.store.classesFor(u.id)[0].id; return SE.game.classJourney(c)})()"
async def student_sample(pg, S):
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)
async def go(pg, url):
    await pg.goto(url.split("#")[0] + "#/library"); await pg.wait_for_timeout(150); await pg.goto(url); await pg.wait_for_timeout(500)
async def send_show(pg, S, aid):
    await go(pg, S + f"#/activity/{aid}")
    await pg.check("input[name=d-ev][value=show]"); await pg.click("#debrief-form button[type=submit]"); await pg.wait_for_timeout(500)

async def local(b):
    S = L; errs = []
    ctx = await b.new_context(viewport={"width": 1280, "height": 900}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    r = await pg.evaluate("""(() => { const f = SE.game.journeyFrom;
      const a = f({ students: 3, assignedDone: 2, confirmed: 1, stages: 1, withAssigned: 3, withStage1: 2, onTime: 0 });
      const b = f({ students: 3, assignedDone: 0, confirmed: 10, stages: 0, withAssigned: 0, withStage1: 3, onTime: 1 });
      const e = (j) => j.badges.filter(x => x.earned).map(x => x.badge.id).sort().join();
      return [a.points, e(a), b.points, e(b), f({ students: 0, assignedDone: 0, confirmed: 0, stages: 0, withAssigned: 0, withStage1: 0, onTime: 0 }).badges.some(x => x.earned)]; })()""")
    ok("rule: 100 per assigned mission sent, 50 per confirm, 100 per stage", r[0] == 350, r[0])
    ok("rule: badges follow their counts", r[1] == "all-hands,first-haul" and r[3] == "first-haul,pathfinders,right-on-tide,steady-crew", (r[1], r[3]))
    ok("rule: an empty class earns no badges", r[4] is False)
    await student_sample(pg, S)
    j0 = await pg.evaluate(J); x0 = await pg.evaluate("SE.game.profile(SE.store.currentUser().id).xp")
    ok("Today: class journey on the class side, My rewards on the own side", await pg.locator(".today-col--class .cjourney--compact").count() == 1 and await pg.locator(".today-col--own .myrewards").count() == 1 and await pg.locator(".today-col--own .cjourney").count() == 0)
    # an unassigned mission: personal XP up, class journey unchanged
    aid = await pg.evaluate("(()=>{const u=SE.store.currentUser(),p=SE.game.profile(u.id),as=new Set(SE.store.assignmentsFor(u.classId).map(x=>x.activityId)); return STEM.activities.find(a=>!as.has(a.id)&&!p.completedIds.has(a.id)&&a.launch.status!=='lab').id})()")
    await send_show(pg, S, aid)
    ok("own mission: no class points line in the celebration", await pg.locator(".celebrate__class").count() == 0)
    await pg.keyboard.press("Escape")
    j1 = await pg.evaluate(J); x1 = await pg.evaluate("SE.game.profile(SE.store.currentUser().id).xp")
    ok("own mission: personal XP goes up, class points don't", x1 > x0 and j1["points"] == j0["points"], (x0, x1, j0["points"], j1["points"]))
    # an assigned mission
    await send_show(pg, S, "lobster-trap-logic")
    ok("class mission: celebration shows +100 class points", "+100 class points" in await pg.inner_text(".celebrate__class"))
    await pg.keyboard.press("Escape")
    j2 = await pg.evaluate(J); x2 = await pg.evaluate("SE.game.profile(SE.store.currentUser().id).xp")
    ok("class mission: class points +100 and personal XP up too", j2["points"] == j1["points"] + 100 and x2 > x1, (j1["points"], j2["points"]))
    await go(pg, S + "#/explore")
    ok("My expedition: class journey with all 5 class badges and how points are earned", await pg.locator(".cbadges .cbadge").count() == 5 and "How the class earns points" in await pg.inner_text(".cjourney__how"))
    await pg.screenshot(path="/tmp/b10-explore.png", full_page=False)
    # teacher: confirming moves the class
    await pg.reload(); await pg.wait_for_timeout(400); await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await pg.goto(S + "#/signin/educator"); await pg.wait_for_timeout(300); await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(900)
    t0 = await pg.evaluate(J)
    ok("teacher and student agree on the class total", t0["points"] == j2["points"], (t0["points"], j2["points"]))
    ava = await pg.evaluate("SE.store.studentsIn(SE.store.classesFor(SE.store.currentUser().id)[0].id).find(s=>s.displayName==='Ava R.').id")
    await pg.evaluate(f"SE.store.teacherLog('{ava}', 'teacher_confirmed', {{ activityId: 'lobster-trap-logic', how: 'demo', note: '' }})")
    await pg.evaluate(f"SE.store.teacherLog('{ava}', 'teacher_confirmed', {{ activityId: 'lobster-trap-logic', how: 'oral', note: '' }})")
    await pg.evaluate(f"SE.store.teacherLog('{ava}', 'ican_verified', {{ stage: 4 }})")
    t1 = await pg.evaluate(J)
    ok("teacher confirm +50 (once per mission) and stage confirm +100", t1["points"] == t0["points"] + 150, (t0["points"], t1["points"]))
    await go(pg, S + "#/teach")
    ok("teacher overview: Class journey with badges and the rule", await pg.locator(".cjourney .cbadge").count() == 5 and "Only class work moves the journey" in await pg.inner_text("#app"))
    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    for h in ["#/teach", "#/explore"]:
        await m.goto(S + h); await m.wait_for_timeout(500)
        ok(f"phone: {h} has no sideways scroll", await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.close()
    ok("local: no page errors", not errs, errs)
    await ctx.close()

async def cloud(b):
    S = C; errs = []; email = f"b10{int(time.time())}@school.org"
    tc = await b.new_context(viewport={"width": 1280, "height": 900}); t = await tc.new_page(); t.on("pageerror", lambda e: errs.append(str(e)))
    await t.goto(S + "#/signup"); await t.wait_for_timeout(400)
    await t.fill("#su-name", "Mr. Ames"); await t.fill("#su-class", "Room 4"); await t.fill("#su-email", email); await t.fill("#su-pw", "harbor207!")
    await t.click("#su-form button[type=submit]"); await t.wait_for_timeout(1200)
    for n in ["Lia P.", "Sam K."]:
        await t.fill("#as-name", n); await t.click("#add-student button[type=submit]"); await t.wait_for_timeout(400)
    await t.evaluate("""(() => { const c = SE.store.classesFor(SE.store.currentUser().id)[0];
      SE.store.assign(c.id, ['event-party'], { dueDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10) }); })()""")
    await t.evaluate("SE.store.flush()"); await t.wait_for_timeout(800)
    code = await t.evaluate("SE.store.classesFor(SE.store.currentUser().id)[0].code")
    kids = await t.evaluate("SE.store.studentsIn(SE.store.classesFor(SE.store.currentUser().id)[0].id).map(s=>[s.displayName, s.picCode])")
    pages = []
    for name, pc in kids:
        sc = await b.new_context(viewport={"width": 1280, "height": 900}); s = await sc.new_page(); s.on("pageerror", lambda e: errs.append(str(e)))
        await s.goto(S + "#/signin/student"); await s.wait_for_timeout(300)
        await s.fill("#class-code", code); await s.click("#code-form button[type=submit]"); await s.wait_for_timeout(500)
        await s.click(f"text={name}"); await s.wait_for_timeout(200)
        for x in pc: await s.click(f"[data-pic={x}]")
        await s.wait_for_timeout(900); pages.append((sc, s))
    s1 = pages[0][1]; s2 = pages[1][1]
    ok("cloud: student device gets class totals from the server", await s1.evaluate("!!SE.store.journeyCounts(SE.store.currentUser().classId)"))
    await send_show(s1, S, "event-party"); await s1.keyboard.press("Escape"); await s1.evaluate("SE.store.flush()"); await s1.wait_for_timeout(800)
    await send_show(s2, S, "event-party"); await s2.keyboard.press("Escape"); await s2.evaluate("SE.store.flush()"); await s2.wait_for_timeout(800)
    await s1.reload(); await s1.wait_for_timeout(1500)
    j = await s1.evaluate(J)
    earned = sorted(x["badge"]["id"] for x in j["badges"] if x["earned"])
    ok("cloud: a student's device sees the whole class's points (2 × 100)", j["points"] == 200, j["points"])
    ok("cloud: All Hands on Deck and Right on Tide earned", earned == ["all-hands", "right-on-tide"], earned)
    await t.reload(); await t.wait_for_timeout(1500)
    tj = await t.evaluate(J)
    ok("cloud: teacher's count matches the server's", tj["counts"] == j["counts"], (tj["counts"], j["counts"]))
    sid = await t.evaluate("SE.store.studentsIn(SE.store.classesFor(SE.store.currentUser().id)[0].id)[0].id")
    await t.evaluate(f"SE.store.teacherLog('{sid}', 'teacher_confirmed', {{ activityId: 'event-party', how: 'demo', note: '' }})")
    await t.evaluate("SE.store.flush()"); await t.wait_for_timeout(800)
    await s2.reload(); await s2.wait_for_timeout(1500)
    ok("cloud: a teacher's confirm shows on another student's device (+50)", (await s2.evaluate(J))["points"] == 250)
    leak = await s2.evaluate("(async()=>{const s=SE.store.session(); return JSON.stringify(await SE.cloud.rpc('class_journey',{p_token:s.token}))})()")
    ok("cloud: class_journey returns counts only (no names or ids)", "Lia" not in leak and "stu_" not in leak and "Sam" not in leak, leak)
    ok("cloud: no page errors", not errs, errs)
    await tc.close()
    for sc, _ in pages: await sc.close()

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch()
    await local(b)
    if C != "skip": await cloud(b)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
