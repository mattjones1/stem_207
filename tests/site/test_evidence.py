# Browser test for completion statuses and evidence (Batch 4): the plan's six acceptance checks,
# in local mode (sample class) and in cloud mode (mock Supabase on real Postgres).
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js     (local)
#   PORT=8787 node tests/backend/mock-supabase.js                  (cloud; see tests/backend/README.md)
#   python3 tests/site/test_evidence.py [local_url] [cloud_url|skip]
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
# Local mode keeps one sign-in and one copy of the data per browser, so switching roles signs out
# and reloads (to pick up what the other tab wrote), like taking turns on one classroom device.
async def as_student(pg, S):
    await pg.reload(); await pg.wait_for_timeout(500)
    await pg.evaluate("SE.store.signOut && SE.store.signOut()"); await pg.wait_for_timeout(200); await student_sample(pg, S)
async def as_teacher(t, S):
    await t.reload(); await t.wait_for_timeout(500)
    await t.evaluate("SE.store.signOut && SE.store.signOut()"); await t.wait_for_timeout(200)
    await t.goto(S + "#/signin/educator"); await t.wait_for_timeout(300); await t.click("#fill-demo"); await t.click("#edu-form button[type=submit]"); await t.wait_for_timeout(900)
async def go(pg, url):  # navigate away first so a same-hash visit re-renders
    await pg.goto(url.split("#")[0] + "#/library"); await pg.wait_for_timeout(150); await pg.goto(url); await pg.wait_for_timeout(500)
st = lambda pg, aid: pg.evaluate(f"(()=>{{const u=SE.store.currentUser(); return SE.game.statusFor(SE.game.profile(u.id), SE.activityById['{aid}']).state}})()")
xp = lambda pg: pg.evaluate("SE.game.profile(SE.store.currentUser().id).xp")
subs = lambda pg, aid: pg.evaluate(f"SE.store.eventsFor(SE.store.currentUser().id).filter(e=>e.type==='mission_completed'&&e.data.activityId==='{aid}').length")

async def local(b):
    S = L; errs = []
    ctx = await b.new_context(viewport={"width": 1280, "height": 900}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    ok("XP no longer depends on length (20- vs 45-minute missions)", await pg.evaluate("SE.game.baseXp(SE.activityById['fix-the-recipe'])===SE.game.baseXp(SE.activityById['paper-bridge'])"))
    await student_sample(pg, S)
    aid = "event-party"
    # event-party is done in the sample data; use a fresh one instead
    aid = await pg.evaluate("(()=>{const p=SE.game.profile(SE.store.currentUser().id); return ['robot-maze-mission','debug-animation','interactive-story','score-keeper','my-blocks-patterns','capstone-game'].find(id=>!p.completedIds.has(id))})()")
    await go(pg, S + f"#/activity/{aid}")
    x0 = await xp(pg); n0 = await subs(pg, aid)
    await pg.click("#debrief-form button[type=submit]"); await pg.wait_for_timeout(300)
    ok("1. empty written answer is refused (no record, no XP)", await subs(pg, aid) == n0 and await xp(pg) == x0 and "Write your answer first" in await pg.inner_text("#d-err"))
    await pg.check("input[name=d-ev][value=show]")
    await pg.evaluate("(()=>{const f=document.getElementById('debrief-form'); f.requestSubmit(); f.requestSubmit();})()"); await pg.wait_for_timeout(500)
    ok("2. 'Show or tell my teacher' submits without typing", await subs(pg, aid) == n0 + 1 and await st(pg, aid) == "submitted")
    ok("3. double submit records once; sending earns no XP yet", await subs(pg, aid) == n0 + 1 and await xp(pg) == x0, f"{x0}->{await xp(pg)}")
    ok("   overlay asks the student to show the teacher", "show or tell your teacher" in (await pg.inner_text(".celebrate")).lower())
    await pg.keyboard.press("Escape")
    x1 = await xp(pg)
    await go(pg, S + f"#/activity/{aid}")
    await pg.fill("#d-reflect", "I fixed the first wrong block."); await pg.click("#debrief-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.keyboard.press("Escape")
    ok("3b. sending again adds no XP", await xp(pg) == x1, f"{x1}->{await xp(pg)}")
    await pg.reload(); await pg.wait_for_timeout(800)
    ok("3c. reload adds nothing", await subs(pg, aid) == n0 + 2)
    # teacher
    t = await ctx.new_page(); t.on("pageerror", lambda e: errs.append(f"{t.url}: {e}"))
    await t.goto(S); await as_teacher(t, S)
    sid = await t.evaluate("SE.store.studentsIn(SE.store.classByCode('MOOSE7').id).find(s=>s.displayName==='Ava R.').id")
    await go(t, S + "#/teach/reflections")
    ok("old Reflections address opens Checks", t.url.endswith("#/teach/checks"), t.url)
    ok("Checks shows Ava's newest submission", "Ava R." in await t.inner_text("#app") and await t.locator(f'[data-check-student="{sid}"][data-check-activity="{aid}"]').count() >= 1)
    f = t.locator(f'[data-check-student="{sid}"][data-check-activity="{aid}"]').first
    await f.locator("button[value=again]").click(); await t.wait_for_timeout(200)
    ok("Try again needs a note", "Add a short note" in await f.locator(".form__error").inner_text())
    await f.locator("input[name=note]").fill("Show me which block you changed."); await f.locator("button[value=again]").click(); await t.wait_for_timeout(500)
    await as_student(pg, S); await go(pg, S + "#/")
    ok("5. student sees Try again with the note on Today", "try again" in (await pg.inner_text(".today-card--class .today-card__why")).lower() and "which block you changed" in await pg.inner_text(".today-card--class"))
    ok("   status is tryagain", await st(pg, aid) == "tryagain")
    await go(pg, S + f"#/activity/{aid}")
    await pg.fill("#d-reflect", "I changed the turn left block to turn right."); await pg.click("#debrief-form button[type=submit]"); await pg.wait_for_timeout(400); await pg.keyboard.press("Escape")
    ok("6. student revises after feedback; back to submitted", await st(pg, aid) == "submitted")
    x2 = await xp(pg)
    await as_teacher(t, S); await go(t, S + f"#/teach/student/{sid}")
    f = t.locator(f'[data-check-student="{sid}"][data-check-activity="{aid}"]').first
    await f.locator("xpath=..").locator("summary").click(); await f.locator("select[name=how]").select_option("oral")
    await f.locator("button[value=confirm]").click(); await t.wait_for_timeout(600)
    await as_student(pg, S); await go(pg, S + f"#/activity/{aid}")
    gain = await pg.evaluate(f"SE.game.profile(SE.store.currentUser().id).passes.find(p=>p.activity.id==='{aid}').xp")
    ok("teacher Pass (spoken check) -> passed; the activity's XP, once", await st(pg, aid) == "confirmed" and await xp(pg) == x2 + gain and gain >= 150, f"{x2}->{await xp(pg)} (+{gain})")
    ok("   student page says Passed (spoken check)", "Passed" in await pg.inner_text(".block--complete") and "spoken check" in await pg.inner_text(".block--complete"))
    await as_teacher(t, S); await go(t, S + f"#/teach/student/{sid}")
    ok("   no second confirm offered once confirmed", await t.locator(f'[data-check-student="{sid}"][data-check-activity="{aid}"]').count() == 0)
    # oral check with no submission (assigned, not started)
    oid = await t.evaluate(f"(()=>{{const p=SE.game.profile('{sid}'); return SE.store.assignmentsFor(SE.store.classByCode('MOOSE7').id).map(x=>x.activityId).find(id=>!SE.game.missionDone(p,SE.activityById[id])&&!(SE.activityById[id].launch.labId))}})()")
    if oid:
        f = t.locator(f'.astatus [data-check-activity="{oid}"]').first
        await f.locator("xpath=..").locator("summary").click(); await f.locator("select[name=how]").select_option("demo"); await f.locator("button[value=confirm]").click(); await t.wait_for_timeout(500)
        await as_student(pg, S)
        ok("observed demo with no written work counts as confirmed", await st(pg, oid) == "confirmed", oid)
    # lab check + teacher views show all four kinds
    if not oid: await as_student(pg, S)
    await go(pg, S + "#/lab/dance-party/1")
    for lvl in (1, 2):
        await go(pg, S + f"#/lab/dance-party/{lvl}"); await pg.evaluate("SE.labs.active.win({program:['right','jump','spin']})"); await pg.wait_for_timeout(200)
    ok("Dance Party levels are practice: in progress until a reflection passes", await st(pg, "lab-dance-party") in ("started", "submitted", "confirmed"))
    await t.evaluate("""(()=>{const k=Object.keys(localStorage).find(k=>{try{return JSON.parse(localStorage[k]).events}catch(e){return false}}); const db=JSON.parse(localStorage[k]);
      const sid=db.students.find(s=>s.displayName==='Ava R.').id; const e=db.events.filter(e=>e.type==='mission_completed'&&!e.data.evidence&&e.studentId===sid).pop(); e.isDemo=false; e.at=STEM.progression.legacyBefore-86400000; localStorage[k]=JSON.stringify(db);})()""")
    await as_teacher(t, S); await go(t, S + f"#/teach/student/{sid}")
    txt = await t.inner_text("#app")
    ok("4. teacher views distinguish legacy, sent, passed", all(k in txt for k in ["legacy", "Passed"]) and ("sent" in txt.lower()), [k for k in ["legacy","Checked in lab","Teacher confirmed","submitted"] if k.lower() not in txt.lower()])
    ok("local: no page errors", not errs, errs)
    await ctx.close()

async def cloud(b):
    S = C; errs = []; email = f"ev{int(time.time())}@school.org"
    tc = await b.new_context(viewport={"width": 1280, "height": 900}); t = await tc.new_page(); t.on("pageerror", lambda e: errs.append(str(e)))
    await t.goto(S + "#/signup"); await t.wait_for_timeout(400)
    await t.fill("#su-name", "Ms. Rivera"); await t.fill("#su-class", "Room 9"); await t.fill("#su-email", email); await t.fill("#su-pw", "harbor207!"); await t.fill("#su-pw2", "harbor207!")
    await t.click("#su-form button[type=submit]"); await t.wait_for_timeout(1200)
    await t.fill("#as-name", "Kai M."); await t.click("#add-student button[type=submit]"); await t.wait_for_timeout(400)
    await t.evaluate("SE.store.flush()"); await t.wait_for_timeout(500)
    code = await t.evaluate("SE.store.classesFor(SE.store.currentUser().id)[0].code")
    sid, pc = await t.evaluate("(()=>{const s=SE.store.studentsIn(SE.store.classesFor(SE.store.currentUser().id)[0].id)[0]; return [s.id, s.picCode]})()")
    sc = await b.new_context(viewport={"width": 1280, "height": 900}); s = await sc.new_page(); s.on("pageerror", lambda e: errs.append(str(e)))
    await s.goto(S + "#/signin/student"); await s.wait_for_timeout(300)
    await s.fill("#class-code", code); await s.click("#code-form button[type=submit]"); await s.wait_for_timeout(500)
    await s.click("text=Kai M."); await s.wait_for_timeout(200)
    for x in pc: await s.click(f"[data-pic={x}]")
    await s.wait_for_timeout(900)
    await go(s, S + "#/activity/event-party")
    await s.check("input[name=d-ev][value=show]"); await s.click("#debrief-form button[type=submit]"); await s.wait_for_timeout(400); await s.keyboard.press("Escape")
    await s.evaluate("SE.store.flush()"); await s.wait_for_timeout(800)
    await t.reload(); await t.wait_for_timeout(1500); await go(t, S + f"#/teach/student/{sid}")
    ok("cloud: teacher sees the student's 'will show you' submission", "will show you" in (await t.inner_text("#app")).lower())
    f = t.locator(f'[data-check-student="{sid}"][data-check-activity="event-party"]').first
    await f.locator("xpath=..").locator("summary").click(); await f.locator("button[value=confirm]").click(); await t.wait_for_timeout(500)
    await t.evaluate("SE.store.flush()"); await t.wait_for_timeout(800)
    await s.reload(); await s.wait_for_timeout(1500)
    ok("cloud: student's device shows Passed", await st(s, "event-party") == "confirmed")
    ok("cloud: no page errors", not errs, errs)
    await tc.close(); await sc.close()

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch()
    await local(b)
    if C != "skip": await cloud(b)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
