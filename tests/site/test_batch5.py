# Browser test for Batch 5: starter projects, the Score Keeper picture, lab-to-Scratch bridges,
# "New to coding? Start here", readiness-based capstone, and the AI learning route.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/site/test_batch5.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    ctx = await b.new_context(viewport={"width": 1280, "height": 900}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)
    for aid, fname in [("debug-animation", "debug-the-fish.sb3"), ("my-blocks-patterns", "pattern-studio.sb3")]:
        await pg.goto(S + f"#/activity/{aid}"); await pg.wait_for_timeout(400)
        href = await pg.get_attribute(".starter a", "href")
        head = await pg.evaluate(f"fetch('{href}').then(r=>r.arrayBuffer()).then(b=>[b.byteLength, String.fromCharCode(...new Uint8Array(b).slice(0,2))])")
        ok(f"{aid}: starter link serves a zip ({fname})", href and href.endswith(fname) and head[1] == "PK", head)
        ok(f"{aid}: steps tell students how to open it", "Load from your computer" in await pg.inner_text("#app"))
        ok(f"{aid}: bridge back to Harbor Code Lab", await pg.locator('.bridge a[href="#/activity/lab-rover"]').count() == 1)
    await pg.goto(S + "#/activity/score-keeper"); await pg.wait_for_timeout(400)
    t = await pg.inner_text("#app")
    ok("score-keeper: steps say 'inside your forever loop'", "Inside your forever loop" in t)
    ok("score-keeper: block picture with a text version", await pg.locator(".block-fig svg").count() == 1 and await pg.locator(".block-fig__text li").count() == 9)
    ok("score-keeper: bridge from Feed the Space Blob", await pg.locator('.bridge a[href="#/activity/lab-space-blob"]').count() == 1)
    await pg.goto(S + "#/activity/interactive-story"); await pg.wait_for_timeout(300)
    ok("interactive-story: bridge from Moon Base Gatekeeper", await pg.locator('.bridge a[href="#/activity/lab-moon-gate"]').count() == 1)
    await pg.goto(S + "#/pathway"); await pg.wait_for_timeout(400)
    ok("pathway: three start-here tracks", await pg.locator(".start-here__track").count() == 3)
    ok("pathway: student's own band highlighted", await pg.locator(".start-here__track.is-mine").count() == 1)
    ok("pathway: grades 6–8 track framed for older beginners", "working programmers" in await pg.inner_text(".start-here"))
    links = await pg.eval_on_selector_all(".start-here a", "els=>els.map(e=>e.getAttribute('href'))")
    ok("start-here links all resolve", links and await pg.evaluate("(hs)=>hs.every(h=>!!SE.activityById[h.split('/').pop()])", links), links)
    # capstone: open to ready 4–5 students, but not suggested before Stage 6
    ok("capstone tagged for grades 4–8", await pg.evaluate("SE.activityById['capstone-game'].grades.includes('4-5')"))
    recs = await pg.evaluate("SE.game.recommendations(SE.store.currentUser(), SE.game.profile(SE.store.currentUser().id), 20).map(r=>r.activity.id)")
    ok("capstone not suggested before Stage 6 is reached", "capstone-game" not in recs)
    # AI route
    await pg.goto(S + "#/area/ai"); await pg.wait_for_timeout(400)
    await pg.click('a[href="#/ai-route"]'); await pg.wait_for_timeout(400)
    ok("AI route: six steps, linked from the AI area", await pg.locator(".ai-route__step").count() == 6)
    alinks = await pg.eval_on_selector_all(".ai-route a", "els=>els.map(e=>e.getAttribute('href'))")
    ok("AI route: every mission link resolves", alinks and await pg.evaluate("(hs)=>hs.every(h=>!!SE.activityById[h.split('/').pop()])", alinks), len(alinks))
    await pg.screenshot(path="/tmp/ai-route.png", full_page=True)
    # phone
    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    for h in ["#/ai-route", "#/pathway", "#/activity/score-keeper", "#/activity/debug-animation"]:
        await m.goto(S + h); await m.wait_for_timeout(400)
        w = await m.evaluate("document.documentElement.scrollWidth")
        ok(f"phone: {h} has no sideways scroll", w <= 390, w)
    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
