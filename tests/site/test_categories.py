# Categories and content status: the 3D Printing category (live since October 22, 2026, with three Tinkercad
# exercises and two hidden placeholders), library counts, educator-only drafts, and delivery/skills display.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js
#   python3 tests/site/test_categories.py [url]
import asyncio, json, pathlib, sys
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
BASE = json.loads((pathlib.Path(__file__).resolve().parent.parent / "fixtures" / "catalog-baseline.json").read_text(encoding="utf-8"))
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
NOT_FOUND = "couldn’t find that page"
async def go(pg, h):
    await pg.goto(S + "#/library"); await pg.wait_for_timeout(150); await pg.goto(S + h); await pg.wait_for_timeout(450)
async def student(pg):
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(700)
async def educator(pg):
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await pg.goto(S + "#/signin/educator"); await pg.wait_for_timeout(300); await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(800)

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    ctx = await b.new_context(viewport={"width": 1280, "height": 900}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await pg.evaluate("SE.store.startGuest()"); await go(pg, "#/")

    # Counts and ids are the baseline: nothing lost; the three 3D exercises are the only additions.
    ok("library total is the baseline", await pg.evaluate("STEM.activities.length") == BASE["total"])
    ok("every baseline mission still resolves", await pg.evaluate(f"{json.dumps([m['id'] for m in BASE['missions']])}.every((id) => SE.activityById[id])"))
    ok("7 categories, all live", await pg.evaluate("STEM.areas.length === 7 && SE.liveAreas.length === 7"))
    ok("home shows 7 category cards", await pg.locator("a.area-card").count() == 7)
    ok("no category card says Coming soon", await pg.locator("a.area-card--soon").count() == 0)
    ok("the buoy hero has 7 buoys, one per category", await pg.locator(".coast .buoy").count() == 7)
    ok("3D Printing has 3 activities", await pg.evaluate("STEM.activities.filter((a) => a.area === '3d-printing').length") == 3)

    # Guests and students see the three exercises, never the placeholders.
    await go(pg, "#/area/3d-printing")
    t = await pg.inner_text("#app")
    ok("guest: 3D Printing lists the 3 exercises and no drafts", all(k in t for k in ["Lobster Buoy Charm", "Trail Blaze Marker", "Fix It! Design a Clip"]) and await pg.locator("#area-drafts").count() == 0)
    await go(pg, "#/activity/3d-printing-exercise-04")
    ok("guest: a placeholder is not found", NOT_FOUND in await pg.inner_text("#app"))
    await pg.evaluate("SE.store.signOut()"); await student(pg)
    await go(pg, "#/activity/3d-printing-exercise-05")
    ok("student: a placeholder is not found", NOT_FOUND in await pg.inner_text("#app"))
    await go(pg, "#/activity/3d-buoy-charm")
    ok("student: a 3D exercise opens", "Lobster Buoy Charm" in await pg.inner_text("h1"))
    await go(pg, "#/activities")
    ok("student: Activities lists 3D Printing", "3D Printing" in await pg.inner_text("#app"))

    # Educators see the two remaining drafts, labeled, and can't assign them.
    await educator(pg)
    await go(pg, "#/area/3d-printing")
    links = await pg.eval_on_selector_all("#area-drafts ~ * a, .draft-list a", "els=>els.map(e=>e.textContent)")
    ok("educator: exactly 2 placeholders, Exercise 4–5", links == [f"Exercise {n} — placeholder" for n in range(4, 6)], links)
    await go(pg, "#/activity/3d-printing-exercise-04")
    t = await pg.inner_text("#app")
    ok("educator: placeholder page says it has no content", "Exercise 4 — placeholder" in t and "no content yet" in t)
    ok("educator: no Add to a Learning Plan on a placeholder", await pg.locator("#plan-pick, a[href^='#/teach/plans/new/']").count() == 0)
    ok("store refuses to assign a placeholder", await pg.evaluate("(() => { const c = SE.store.classesFor(SE.store.currentUser().id)[0]; const n = SE.store.assignmentsFor(c.id).length; SE.store.assign(c.id, ['3d-printing-exercise-04']); return SE.store.assignmentsFor(c.id).length === n; })()"))
    await go(pg, "#/teach/plans/new"); await pg.wait_for_timeout(300)
    await pg.click("[data-pick-area='3d-printing']"); await pg.wait_for_timeout(200)
    ok("plan editor: the 3D Printing tab lists the 3 exercises", await pg.locator("#pw-results .pk-card").count() == 3 and await pg.locator(".pk-tab.is-soon").count() == 0)

    # Optional metadata shows when set (set in memory for the check).
    await pg.evaluate("Object.assign(SE.activityById['lab-field-station'], { delivery: 'Browser 360° (not headset VR)', skills: ['observation'] })")
    await go(pg, "#/activity/lab-field-station")
    t = await pg.inner_text(".facts")
    ok("delivery and skills show in the facts", "Browser 360° (not headset VR)" in t and "Observation" in t)

    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    await m.goto(S + "#/"); await m.wait_for_timeout(500)
    ok("phone: home has no sideways scroll", await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.close()
    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
