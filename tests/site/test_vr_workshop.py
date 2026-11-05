# VR First Contact (STEM Coliseum VR / AR Workshop 1): the activity page shows the safety block to everyone,
# the session plan, safety protocols, and motion sickness guide to educators only, the Coliseum credit tag,
# exact grades 5–8, and the 90-minute time filter.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/site/test_vr_workshop.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
A = "#/activity/vr-first-contact"

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    ctx = await b.new_context(viewport={"width": 1280, "height": 900}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)

    # Educator view
    await pg.goto(S + "#/signin/educator"); await pg.wait_for_timeout(300)
    await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(800)
    await pg.goto(S + A); await pg.wait_for_timeout(500)
    ok("page title", "VR First Contact" in await pg.inner_text("h1"))
    ok("credit tag: STEM Coliseum workshop 1", "STEM Coliseum workshop 1" in await pg.inner_text(".page-top__tags"))
    facts = await pg.inner_text(".facts")
    ok("exact grades 5–8 and 90 min", "Grades 5–8" in facts and "90" in facts, facts.replace("\n", " ")[:160])
    ok("safety block shows the stop word", "PAUSE" in await pg.inner_text(".block--safety"))
    ok("plan table has 9 rows", await pg.locator(".plan-table tbody tr").count() == 9)
    vr = await pg.inner_text("section:has(#s-vr)")
    ok("educator sees safety protocols and motion sickness guide", "Safety protocols" in vr and "If a student feels sick" in vr)
    ok("launch panel explains the headset setup", "Meta Quest 3" in await pg.inner_text(".launch-panel"))
    ok("unverified items flagged in teacher notes", "check before class" in (await pg.inner_text(".teacher-notes")).lower())

    # The 90-minute workshop filter exists and the workshop fits it
    found = await pg.evaluate("STEM.durations.some(d => d.max === 90) && SE.timeMax(SE.activityById['vr-first-contact']) === 90")
    ok("90-minute workshop filter exists and fits", found)

    # Phone: plan table stacks without sideways scroll
    await pg.set_viewport_size({"width": 390, "height": 800}); await pg.goto(S + "#/"); await pg.wait_for_timeout(200)
    await pg.goto(S + A); await pg.wait_for_timeout(500)
    sw = await pg.evaluate("document.documentElement.scrollWidth")
    ok("phone: no sideways scroll", sw <= 390, sw)
    await pg.set_viewport_size({"width": 1280, "height": 900})

    # Student view: safety yes, plan and protocols no
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)
    await pg.goto(S + A); await pg.wait_for_timeout(500)
    ok("student sees the safety block", await pg.locator(".block--safety").count() == 1)
    ok("student doesn't see the plan or protocols",
       await pg.locator(".plan-table").count() == 0 and "Safety protocols" not in await pg.inner_text("section:has(#s-vr)"))
    ok("no page errors", not errs, errs[:3])
    await b.close()
  print(f"{sum(R)}/{len(R)} passed")

asyncio.run(main())
