# Browser test for the Today view, pilot mission fields, and pilot filters (Batch 3).
# Serve locally first:  LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js
# Then:  python3 tests/site/test_today_pilot.py [http://localhost:8767/]
import asyncio, sys, os
from playwright.async_api import async_playwright
S = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
O = os.environ.get("SHOTS", "/tmp/")
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def student(pg):
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)
async def educator(pg):
    await pg.goto(S + "#/signin/educator"); await pg.wait_for_timeout(300)
    await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(900)
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    def watch(pg): pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e} {(e.stack or '')[:300]}"))
    ctx = await b.new_context(viewport={"width": 1280, "height": 900})   # one storage, like one classroom device
    pg = await ctx.new_page(); watch(pg)
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await student(pg)
    # Today
    h = await pg.evaluate("document.documentElement.scrollHeight")
    ok("Today is short (under 2,500 px; was ~12,400)", h < 2500, h)
    first = await pg.evaluate("""(()=>{const u=SE.store.currentUser(), prof=SE.game.profile(u.id);
      const open=SE.store.assignmentsFor(u.classId).map(x=>({x,a:SE.activityById[x.activityId]})).filter(r=>r.a&&!SE.game.missionDone(prof,r.a)).sort((p,q)=>(p.x.dueDate||'9999').localeCompare(q.x.dueDate||'9999'));
      return open[0].a.title})()""")
    ok("Today leads with the earliest-due unfinished assignment", (await pg.inner_text("#today-mission")) == first, first)
    act = await pg.inner_text(".today-card__actions .btn--launch")
    ok("big Start/Continue button", act.strip() in ("Start", "Continue"), act)
    ok("map, patches, and full library are not on Today", await pg.locator(".map-frame, .patch-row, #library").count() == 0)
    await pg.screenshot(path=O + "today.png", full_page=True)
    await pg.click("#help-btn")
    ok("help panel opens", await pg.is_visible("#help-panel") and await pg.get_attribute("#help-btn", "aria-expanded") == "true")
    await pg.click("#help-ask"); await pg.wait_for_timeout(200)
    n = await pg.evaluate("SE.store.eventsFor(SE.store.currentUser().id).filter(e=>e.type==='help_requested').length")
    ok("'Let my teacher know' logs a help request and confirms", n == 1 and "can see" in await pg.inner_text("#help-status"))
    # nav: library vs explore
    await pg.goto(S + "#/library"); await pg.wait_for_timeout(400)
    ok("Missions = mission finder only", await pg.locator("#library").count() == 1 and await pg.locator(".map-frame").count() == 0)
    await pg.goto(S + "#/explore"); await pg.wait_for_timeout(400)
    ok("My expedition = map and patches, no library", await pg.locator(".map-frame").count() == 1 and await pg.locator("#library").count() == 0)
    nav = await pg.inner_text("#site-nav")
    ok("nav has Today / Missions / My expedition", all(t in nav for t in ["Today", "Missions", "My expedition"]))
    # pilot mission page (student)
    await pg.goto(S + "#/activity/event-party"); await pg.wait_for_timeout(400)
    t = await pg.inner_text("#app")
    ok("pilot page: stopping point, Stuck?, Show what you know, Next up", all(k in t for k in ["You're done when", "Stuck? Try these", "Show what you know", "Next up"]))
    ok("pilot page: student time range and teacher prep shown", "15–20 min" in t and "teacher prep" in t.lower())
    ok("students don't see the Pilot tag", await pg.locator(".pilot-tag").count() == 0)
    # time filter now uses the core range
    ids = await pg.evaluate("STEM.activities.filter(a=>SE.timeMax(a)<=20).map(a=>a.id)")
    ok("20-minute filter includes Robot Maze (core 15–20) and Dance Party (core 10–15)", "robot-maze-mission" in ids and "lab-dance-party" in ids)
    # no assignment -> one eligible next step
    await pg.evaluate("(()=>{const c=SE.store.currentUser().classId; SE.store.assignmentsFor(c).map(x=>x.activityId).forEach(id=>SE.store.unassign(c,[id]))})()")
    await pg.goto(S + "#/library"); await pg.wait_for_timeout(150); await pg.goto(S + "#/"); await pg.wait_for_timeout(500)
    why = await pg.inner_text(".today-card__why") if await pg.locator(".today-card__why").count() else ""
    ok("no assignment: Today offers one next step", await pg.locator(".today-card").count() == 1 and "teacher" not in why.lower(), why)
    # teacher views
    t2 = await ctx.new_page(); watch(t2)
    await educator(t2)
    await t2.goto(S + "#/teach"); await t2.wait_for_timeout(500)
    ok("teacher check-in list shows the help request", "Asked for help" in await t2.inner_text("#app"))
    await t2.goto(S + "#/library"); await t2.wait_for_timeout(400)
    await t2.select_option("#f-pilot", "yes"); await t2.wait_for_timeout(300)
    cnt = await t2.locator("#results .card").count()
    ok("teacher library: Collection = Pilot shows the 6 pilot missions", cnt == 6, cnt)
    ok("teacher sees Pilot tags", await t2.locator(".pilot-tag").count() >= 6)
    await t2.goto(S + "#/teach/missions/coding"); await t2.wait_for_timeout(400)
    await t2.check("#mfilters input[name=pilot]"); await t2.dispatch_event("#mfilters input[name=pilot]", "change"); await t2.wait_for_timeout(400)
    rows = await t2.locator(".mrow").count()
    ok("Missions tab: Pilot only (coding) shows the 4 coding pilot missions", rows == 4, rows)
    await t2.goto(S + "#/activity/lab-dance-party"); await t2.wait_for_timeout(400)
    tt = await t2.inner_text("#app")
    ok("Dance Party shows 10–15 min (pilot estimate) and teacher prep", "10–15 min" in tt and "pilot estimate" in tt)
    # phone
    m = await b.new_page(viewport={"width": 390, "height": 844}); watch(m)
    await m.goto(S); await m.evaluate("localStorage.clear()"); await m.reload(); await m.wait_for_timeout(300); await student(m)
    ok("phone: Today has no sideways scroll", await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.screenshot(path=O + "today-m.png", full_page=True)
    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
