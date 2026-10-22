# Browser test for Batch 5: starter projects, the Score Keeper picture, lab-to-Scratch bridges,
# readiness-based capstone, and the AI route (now a Learning Plan template).
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
    # capstone: open to ready 4–5 students, but not suggested before Stage 6
    ok("capstone tagged for grades 4–8", await pg.evaluate("SE.activityById['capstone-game'].grades.includes('4-5')"))
    recs = await pg.evaluate("SE.game.recommendations(SE.store.currentUser(), SE.game.profile(SE.store.currentUser().id), 20).map(r=>r.activity.id)")
    ok("capstone not suggested before Stage 6 is reached", "capstone-game" not in recs)
    # AI route: a Learning Plan template now (students no longer see a separate route page)
    await pg.goto(S + "#/ai-route"); await pg.wait_for_timeout(400)
    ok("AI route: a student's old link goes to My Learning Plans", pg.url.endswith("#/plans"), pg.url)
    ok("AI route template: 8 activities, every one resolves, marked for review", await pg.evaluate("(()=>{const t=SE.pathways.template('tpl-ai-route'); return t.steps.length===8 && t.steps.every(s=>!!SE.activityById[s.activityId]) && t.reviewed===false})()"))
    # phone
    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    for h in ["#/activities/ai", "#/activity/score-keeper", "#/activity/debug-animation"]:
        await m.goto(S + h); await m.wait_for_timeout(400)
        w = await m.evaluate("document.documentElement.scrollWidth")
        ok(f"phone: {h} has no sideways scroll", w <= 390, w)
    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
