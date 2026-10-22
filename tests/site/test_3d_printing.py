# 3D Printing (live since October 22, 2026: three Tinkercad exercises) and Go deeper on activity pages:
# complete records, students can open them, placeholders stay hidden, the workshop add-on steps resolve, and
# the Go deeper punch-out (dialog, Stay here, Go opens a new tab, deeper_opened logged, welcome back).
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js
#   python3 tests/site/test_3d_printing.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
IDS = ["3d-buoy-charm", "3d-trail-marker", "3d-fix-it-clip"]
async def go(pg, h):
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(150); await pg.goto(S + h); await pg.wait_for_timeout(500)
async def student(pg):
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    ctx = await b.new_context(viewport={"width": 1280, "height": 900}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)

    # Records
    FIELDS = ["title", "summary", "mission", "learn", "before", "steps", "reflect", "extend", "teacherNotes", "stopAt", "check", "stuck", "why", "realWorld", "vocab", "time", "access", "launch", "deeper"]
    for id in IDS:
        miss = await pg.evaluate(f"(() => {{ const a = SE.activityById['{id}']; return {FIELDS}.filter((k) => !a || a[k] == null || (Array.isArray(a[k]) && !a[k].length)); }})()")
        ok(f"{id}: every field is filled", not miss, miss)
    rule = await pg.evaluate(f"{IDS}.map((id) => SE.activityById[id]).every((a) => a.area === '3d-printing' && a.grades.join() === '4-5,6-8' && a.time.core[1] === 90 && a.access.supervision && a.launch.url.startsWith('https://www.tinkercad.com') && a.equipment.includes('printer3d') && SE.content.isPublished(a))")
    ok("3D: grades 4–8, 90 minutes, supervised, Tinkercad, 3D printer, published", rule)
    ok("3D: the three chain with next", await pg.evaluate("SE.activityById['3d-buoy-charm'].next === '3d-trail-marker' && SE.activityById['3d-trail-marker'].next === '3d-fix-it-clip'"))
    ok("3D: teacher notes say to check Tinkercad before class", await pg.evaluate(f"{IDS}.every((id) => SE.activityById[id].teacherNotes.some((n) => /before class/.test(n)))"))
    ok("3D: placeholders 4 and 5 stay drafts", await pg.evaluate("['3d-printing-exercise-04', '3d-printing-exercise-05'].every((id) => SE.activityById[id] && SE.activityById[id].placeholder && !STEM.activities.includes(SE.activityById[id]))"))
    ok("3D: the equipment filter offers a 3D printer", await pg.evaluate("STEM.equipment.printer3d && STEM.equipment.printer3d.filter"))

    # Student
    await student(pg)
    await go(pg, "#/activities/3d-printing")
    t = await pg.inner_text("#app")
    ok("student: 3D Printing lists all three", all(k in t for k in ["Lobster Buoy Charm", "Trail Blaze Marker", "Fix It! Design a Clip"]) and "Coming soon" not in t)
    await go(pg, "#/activity/3d-trail-marker")
    t = await pg.inner_text("#app")
    ok("student: activity page shows the mission, done-when, and the Tinkercad launch", "Katahdin" in t and "You're done when" in t and await pg.locator('a[href="https://www.tinkercad.com/"]').count() >= 1)
    ok("student: Go deeper with a Tinkercad lessons card", await pg.locator("#s-deeper").count() == 1 and "Tinkercad lessons" in await pg.inner_text(".deeper__links"))

    # Go deeper punch-out
    await go(pg, "#/activity/lab-dance-party")
    ok("Go deeper: challenge mentions the new lab levels", "Go deeper levels" in await pg.inner_text(".deeper__challenge"))
    ok("Go deeper: link cards say they open in a new tab", await pg.locator("a[data-deeper]").count() == 2 and "opens in a new tab" in (await pg.inner_text(".deeper__links")).lower())
    card = pg.locator("a[data-deeper]").first
    await card.click(); await pg.wait_for_timeout(250)
    ok("Go deeper: a dialog names the site and the way back", await pg.locator("dialog.modal[open]").count() == 1 and "Code.org" in await pg.inner_text("dialog.modal") and "come back" in await pg.inner_text("dialog.modal"))
    await pg.locator("dialog [data-modal-close]", has_text="Stay here").click(); await pg.wait_for_timeout(200)
    ok("Go deeper: Stay here keeps you on the page, nothing logged", await pg.locator("dialog.modal").count() == 0 and "#/activity/lab-dance-party" in pg.url
       and await pg.evaluate("SE.store.eventsFor(SE.store.currentUser().id).filter((e) => e.type === 'deeper_opened').length") == 0)
    await card.click(); await pg.wait_for_timeout(250)
    async with ctx.expect_page() as newp:
        await pg.click("#deeper-go")
    other = await newp.value
    ok("Go deeper: Go opens the site in a new tab", "code.org" in other.url, other.url)
    await other.close()
    ok("Go deeper: deeper_opened is logged with the site", await pg.evaluate("SE.store.eventsFor(SE.store.currentUser().id).some((e) => e.type === 'deeper_opened' && e.data.activityId === 'lab-dance-party' && e.data.provider === 'Code.org')"))
    await pg.evaluate("document.dispatchEvent(new Event('visibilitychange'))"); await pg.wait_for_timeout(200)
    back = await pg.inner_text("#deeper-back")
    ok("Go deeper: welcome back, with a link to tell the teacher", "Welcome back from Code.org" in back and await pg.locator('#deeper-back a[href="#s-debrief"]').count() == 1, back)
    ok("debrief: the optional field asks about Go deeper", "Did you try Go deeper" in await pg.inner_text("#debrief-form"))

    # Educator: workshops and the plan picker
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await pg.goto(S + "#/signin/educator"); await pg.wait_for_timeout(300); await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(900)
    await go(pg, "#/activity/3d-fix-it-clip")
    t = await pg.inner_text("#app")
    ok("educator: teacher notes with print settings and safety", "infill" in t and "Safety" in t and "Common misconception" in t)
    ok("educator: can add a 3D exercise to a Learning Plan", await pg.locator("#plan-pick, a[href='#/teach/plans/new/3d-fix-it-clip']").count() >= 1)
    ok("workshops: both 3D add-on steps resolve and are optional", await pg.evaluate("[['tpl-ws-sampler', '3d-buoy-charm'], ['tpl-ws-katahdin', '3d-trail-marker']].every(([t, id]) => SE.plans.stepsOf(SE.plans.template(t)).some((s) => s.activityId === id && !s.required))"))

    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    await m.goto(S + "#/activity/3d-buoy-charm"); await m.wait_for_timeout(600)
    ok("phone: a 3D activity page has no sideways scroll", await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.close()
    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
