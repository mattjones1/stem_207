# AI Code Review Lab (lab-review.js) and the AI Engineer crew: the simulation label, running the AI's code,
# a wrong line refused with feedback that names it, the fix winning, picking the test map that proves a bug,
# the vague-prompt level, the crew template, and the AI Engineer patch after 4 passed crew activities.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/labs/test_code_review.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def level(pg, n):
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(120)
    await pg.goto(S + f"#/lab/code-review/{n}"); await pg.wait_for_timeout(500)
async def won(pg):
    await pg.wait_for_timeout(200)
    return await pg.locator("#lab-win:not([hidden])").count() == 1
async def feedback(pg): return (await pg.inner_text("#lab-feedback")).strip()

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    ctx = await b.new_context(viewport={"width": 1366, "height": 650}, reduced_motion="reduce")
    pg = await ctx.new_page(); pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await pg.evaluate("SE.store.startGuest(); localStorage.setItem('stem207.devPlan', 'educator')")

    await level(pg, 1)
    ok("every level says it's a simulation", "Simulation" in await pg.inner_text(".cr-sim") and "No real AI" in await pg.inner_text(".cr-sim"))
    await pg.click("#cr-run-ai")
    ok("running the AI's code shows it fails", "didn't reach" in await feedback(pg), await feedback(pg))
    await pg.click("#cr-submit")
    ok("a fix without pointing to the line asks for the line first", "Point to the line" in await feedback(pg))
    await pg.click('[data-line="2"]'); await pg.click("#cr-submit")
    ok("a wrong line is refused and named", "You chose line 2" in await feedback(pg), await feedback(pg))
    await pg.click('[data-line="1"]'); await pg.fill("#cr-src", "for i in range(5):\n    move()"); await pg.click("#cr-submit")
    ok("the right line plus a fix wins", await won(pg), await feedback(pg))

    await level(pg, 6)
    await pg.click('[data-line="1"]'); await pg.click('[data-pickmap="0"]'); await pg.fill("#cr-src", "while not at_wharf():\n    move()"); await pg.click("#cr-submit")
    ok("picking the test that passes is refused", "can't prove the bug" in await feedback(pg), await feedback(pg))
    await pg.click('[data-pickmap="1"]'); await pg.click("#cr-submit")
    ok("picking the test that fails, with a fix that works on both maps, wins", await won(pg), await feedback(pg))

    await level(pg, 7)
    await pg.click('[data-prompt="0"]'); await pg.click("#cr-submit")
    ok("a vague prompt is refused", "still vague" in await feedback(pg))
    await pg.click('[data-prompt="1"]'); await pg.click("#cr-submit")
    ok("the clear prompt wins", await won(pg))

    # The crew: template, Coding page section, and the AI Engineer patch after 4 passes.
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await pg.goto(S + "#/signin/educator"); await pg.wait_for_timeout(300); await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(900)
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(100); await pg.goto(S + "#/teach/plans"); await pg.wait_for_timeout(500)
    ok("Learning Plans lists the AI Engineer crew under Crews", "Crews: workforce tracks" in await pg.inner_text("#app") and await pg.locator('[data-use="tpl-crew-ai-engineer"]').count() == 1)
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(100); await pg.goto(S + "#/activities/coding"); await pg.wait_for_timeout(500)
    ok("the Coding page has the AI Engineer crew group", "AI Engineer crew" in await pg.inner_text("#app"))
    earned = await pg.evaluate("""(() => {
      const sid = SE.store.studentsIn(SE.store.classesFor(SE.store.currentUser().id)[0].id)[0].id, me = SE.store.currentUser().id;
      const ids = ['prompt-precision', 'lab-code-review', 'trust-but-verify', 'lab-harbor-python'];
      const ev = ids.flatMap((id, i) => [
        { type: 'mission_completed', studentId: sid, at: 1000 + i * 10, data: { activityId: id, evidence: 'written', reflection: 'done' } },
        { type: 'teacher_confirmed', studentId: sid, at: 1001 + i * 10, by: me, data: { activityId: id, how: 'work' } }]);
      const three = SE.game.profile(sid, ev.slice(0, 6)).patches.find((p) => p.patch.id === 'crew-ai-engineer').earned;
      const four = SE.game.profile(sid, ev).patches.find((p) => p.patch.id === 'crew-ai-engineer').earned;
      return [!!three, !!four];
    })()""")
    ok("the AI Engineer patch needs 4 passed crew activities", earned == [False, True], earned)

    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
