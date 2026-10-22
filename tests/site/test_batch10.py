# Separate rewards, under the one-check model (usability Stage 2). Sending earns nothing; a teacher's Pass
# earns the student's XP. The class journey moves only when a teacher passes class work (an assigned
# activity, or one in an assigned Learning Plan). Local mode (sample class) and cloud mode (mock Supabase
# on real Postgres with update-8: class totals from the server).
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; PORT=8787 node tests/backend/mock-supabase.js
#   python3 tests/site/test_batch10.py [local_url] [cloud_url|skip]
import asyncio, sys, time
from playwright.async_api import async_playwright
L = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
C = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:8787/"
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
J = "(()=>{const u=SE.store.currentUser(); const c=u.classId||SE.store.classesFor(u.id)[0].id; return SE.game.classJourney(c)})()"
XP = "SE.game.profile(SE.store.currentUser().id).xp"
async def student_sample(pg, S):
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)
async def educator(pg, S):
    await pg.reload(); await pg.wait_for_timeout(400); await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await pg.goto(S + "#/signin/educator"); await pg.wait_for_timeout(300); await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(900)
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
      const a = f({ students: 3, passed: 2, passedAll: 5, withPassed: 3, withThree: 1, onTime: 0 });
      const b = f({ students: 3, passed: 0, passedAll: 10, withPassed: 0, withThree: 3, onTime: 1 });
      const e = (j) => j.badges.filter(x => x.earned).map(x => x.badge.id).sort().join();
      return [a.points, e(a), b.points, e(b), f({ students: 0, passed: 0, passedAll: 0, withPassed: 0, withThree: 0, onTime: 0 }).badges.some(x => x.earned)]; })()""")
    ok("rule: 100 per passed class activity, nothing else", r[0] == 200 and r[2] == 0, (r[0], r[2]))
    ok("rule: badges follow their counts", r[1] == "all-hands,first-haul" and r[3] == "first-haul,pathfinders,right-on-tide,steady-crew", (r[1], r[3]))
    ok("rule: an empty class earns no badges", r[4] is False)
    await student_sample(pg, S)
    j0 = await pg.evaluate(J); x0 = await pg.evaluate(XP)
    # an activity the student chose (not assigned): sending earns nothing
    aid = await pg.evaluate("(()=>{const u=SE.store.currentUser(),p=SE.game.profile(u.id),as=new Set(SE.store.assignmentsFor(u.classId).map(x=>x.activityId)); return STEM.activities.find(a=>!as.has(a.id)&&!p.sentIds.has(a.id)&&!p.completedIds.has(a.id)&&a.launch.status!=='lab').id})()")
    await send_show(pg, S, aid)
    ok("sent: no class points line and no XP in the celebration", await pg.locator(".celebrate__class").count() == 0 and await pg.locator(".celebrate__xp").count() == 0)
    ok("sent: the celebration says what a pass will earn", "when they pass it" in (await pg.inner_text(".celebrate")).lower())
    await pg.keyboard.press("Escape")
    ok("sent: XP and class points unchanged", await pg.evaluate(XP) == x0 and (await pg.evaluate(J))["points"] == j0["points"])
    await send_show(pg, S, "lobster-trap-logic"); await pg.keyboard.press("Escape")
    ok("sent class work: still no class points", (await pg.evaluate(J))["points"] == j0["points"])
    # teacher passes both
    await educator(pg, S)
    t0 = await pg.evaluate(J)
    ok("teacher and student agree on the class total", t0["points"] == j0["points"], (t0["points"], j0["points"]))
    ava = await pg.evaluate("SE.store.studentsIn(SE.store.classesFor(SE.store.currentUser().id)[0].id).find(s=>s.displayName==='Ava R.').id")
    await pg.evaluate(f"SE.store.teacherLog('{ava}', 'teacher_confirmed', {{ activityId: '{aid}', how: 'demo', note: '' }})")
    t1 = await pg.evaluate(J)
    ok("passing a student's own activity: no class points", t1["points"] == t0["points"], (t0["points"], t1["points"]))
    await pg.evaluate(f"SE.store.teacherLog('{ava}', 'teacher_confirmed', {{ activityId: 'lobster-trap-logic', how: 'demo', note: '' }})")
    await pg.evaluate(f"SE.store.teacherLog('{ava}', 'teacher_confirmed', {{ activityId: 'lobster-trap-logic', how: 'oral', note: '' }})")
    t2 = await pg.evaluate(J)
    ok("passing class work: +100 class points, once", t2["points"] == t1["points"] + 100, (t1["points"], t2["points"]))
    ok("Ava's XP went up from the two passes", await pg.evaluate(f"SE.game.profile('{ava}').xp") > x0)
    await go(pg, S + "#/teach/classes/" + await pg.evaluate("SE.store.classesFor(SE.store.currentUser().id)[0].id"))
    ok("class page: Class journey with badges and the rule", await pg.locator(".cjourney .cbadge").count() == 5 and "Only class work moves the journey" in await pg.inner_text("#app"))
    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    await m.goto(S + "#/teach"); await m.wait_for_timeout(500)
    ok("phone: #/teach has no sideways scroll", await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.close()
    ok("local: no page errors", not errs, errs)
    await ctx.close()

async def cloud(b):
    S = C; errs = []; email = f"b10{int(time.time())}@school.org"
    tc = await b.new_context(viewport={"width": 1280, "height": 900}); t = await tc.new_page(); t.on("pageerror", lambda e: errs.append(str(e)))
    await t.goto(S + "#/signup"); await t.wait_for_timeout(400)
    await t.fill("#su-name", "Mr. Ames"); await t.fill("#su-class", "Room 4"); await t.fill("#su-email", email); await t.fill("#su-pw", "harbor207!"); await t.fill("#su-pw2", "harbor207!")
    await t.click("#su-form button[type=submit]"); await t.wait_for_timeout(1200)
    for n in ["Lia P.", "Sam K."]:
        await t.locator("[data-add-students]").first.click(); await t.fill("#ms-names", n); await t.click("#ms-add"); await t.wait_for_timeout(400); await t.keyboard.press("Escape"); await t.wait_for_timeout(300)
    await t.evaluate("""(() => { const c = SE.store.classesFor(SE.store.currentUser().id)[0];
      SE.store.assign(c.id, ['event-party'], { dueDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10) }); })()""")
    await t.evaluate("SE.store.flush()"); await t.wait_for_timeout(800)
    code = await t.evaluate("SE.store.classesFor(SE.store.currentUser().id)[0].code")
    kids = await t.evaluate("SE.store.studentsIn(SE.store.classesFor(SE.store.currentUser().id)[0].id).map(s=>[s.id, s.displayName, s.picCode])")
    pages = []
    for sid, name, pc in kids:
        sc = await b.new_context(viewport={"width": 1280, "height": 900}); s = await sc.new_page(); s.on("pageerror", lambda e: errs.append(str(e)))
        await s.goto(S + "#/signin/student"); await s.wait_for_timeout(300)
        await s.fill("#class-code", code); await s.click("#code-form button[type=submit]"); await s.wait_for_timeout(500)
        await s.click(f"text={name}"); await s.wait_for_timeout(200)
        for x in pc: await s.click(f"[data-pic={x}]")
        await s.wait_for_timeout(900); pages.append((sc, s))
    s1 = pages[0][1]; s2 = pages[1][1]
    ok("cloud: student device gets class totals from the server", await s1.evaluate("!!SE.store.journeyCounts(SE.store.currentUser().classId)"))
    for s in (s1, s2):
        await send_show(s, S, "event-party"); await s.keyboard.press("Escape"); await s.evaluate("SE.store.flush()"); await s.wait_for_timeout(800)
    await s1.reload(); await s1.wait_for_timeout(1500)
    j = await s1.evaluate(J)
    earned = sorted(x["badge"]["id"] for x in j["badges"] if x["earned"])
    ok("cloud: sending alone earns no class points", j["points"] == 0, j["points"])
    ok("cloud: Right on Tide earned (everyone sent before the due date)", earned == ["right-on-tide"], earned)
    for sid, _, _ in kids:
        await t.evaluate(f"SE.store.teacherLog('{sid}', 'teacher_confirmed', {{ activityId: 'event-party', how: 'demo', note: '' }})")
    await t.evaluate("SE.store.flush()"); await t.wait_for_timeout(800)
    await s2.reload(); await s2.wait_for_timeout(1500)
    j2 = await s2.evaluate(J)
    earned2 = sorted(x["badge"]["id"] for x in j2["badges"] if x["earned"])
    ok("cloud: two passes show on a student's device (2 × 100)", j2["points"] == 200, j2["points"])
    ok("cloud: First Haul and All Hands on Deck earned too", earned2 == ["all-hands", "first-haul", "right-on-tide"], earned2)
    await t.reload(); await t.wait_for_timeout(1500)
    tj = await t.evaluate(J)
    ok("cloud: teacher's count matches the server's", tj["counts"] == j2["counts"], (tj["counts"], j2["counts"]))
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
