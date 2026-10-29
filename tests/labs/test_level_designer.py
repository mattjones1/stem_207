# Harbor Level Designer (lab-builder.js) and the Game Dev crew: tap a tool and squares to edit (no dragging),
# the route line updates, a design that breaks the rules is refused with the reason, a good design wins,
# the difficulty-curve level, and the crew template plus the Game Developer patch.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/labs/test_level_designer.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def level(pg, n):
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(120)
    await pg.goto(S + f"#/lab/level-designer/{n}"); await pg.wait_for_timeout(500)
async def won(pg):
    await pg.wait_for_timeout(200)
    return await pg.locator("#lab-win:not([hidden])").count() == 1
async def feedback(pg): return (await pg.inner_text("#lab-feedback")).strip()
async def paint(pg, tool, cells):
    await pg.click(f'[data-tool="{tool}"]')
    for x, y in cells: await pg.click(f'[data-x="{x}"][data-y="{y}"]'); await pg.wait_for_timeout(30)

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    pg = await b.new_page(viewport={"width": 1366, "height": 650})
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await pg.evaluate("SE.store.startGuest(); localStorage.setItem('stem207.devPlan', 'educator')")

    # Level 1: impossible until a channel is opened.
    await level(pg, 1)
    ok("the map is a set of labeled buttons (no dragging)", await pg.locator(".ld-cell").count() == 48 and "Row 2, column 2: boat start" == await pg.get_attribute('[data-x="1"][data-y="1"]', "aria-label"))
    ok("the route line says the level is impossible", "can't reach the wharf" in await pg.inner_text(".ld-stats"))
    await pg.click("#ld-check")
    ok("Check design explains why it's refused", "can't reach the wharf" in await feedback(pg), await feedback(pg))
    await paint(pg, ".", [(4, 1)])
    ok("opening one ledge updates the route line", "Possible" in await pg.inner_text(".ld-stats"))
    await pg.click("#ld-check")
    ok("a possible level with enough ledges wins", await won(pg), await feedback(pg))

    # Level 2: too easy until the route is at least 10 moves (keyboard: focus a tool, then squares, Enter).
    await level(pg, 2)
    await pg.focus('[data-tool="#"]'); await pg.keyboard.press("Enter")
    # Two walls make a zigzag: column 2 open only at the bottom, column 4 open only at the top (14 moves).
    for x, y in [(2, 1), (2, 2), (2, 3), (4, 2), (4, 3), (4, 4)]:
        await pg.focus(f'[data-x="{x}"][data-y="{y}"]'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(30)
    await pg.click("#ld-check")
    ok("a zigzag built by keyboard makes the route long enough and wins", await won(pg), (await pg.inner_text(".ld-stats")) + " | " + await feedback(pg))

    # Level 6: difficulty curve.
    await level(pg, 6)
    for c in ["A", "B", "C"]: await pg.click(f'[data-pick="{c}"]')
    await pg.click("#ld-check")
    ok("a wrong order is refused with each level's route", "Your order was A → B → C" in await feedback(pg) and "moves" in await feedback(pg), await feedback(pg))
    await pg.click("#ld-clear")
    for c in ["B", "C", "A"]: await pg.click(f'[data-pick="{c}"]')
    await pg.click("#ld-check")
    ok("easiest to hardest wins", await won(pg))

    # The Game Dev crew and patch.
    ok("the Game Dev crew template exists with 5 activities", await pg.evaluate("SE.plans.stepsOf(SE.plans.template('tpl-crew-game-dev')).length") == 5)
    earned = await pg.evaluate("""(() => {
      const ids = ['score-keeper', 'interactive-story', 'lab-level-designer', 'playtest-lab'];
      const ev = ids.flatMap((id, i) => [{ type: 'mission_completed', studentId: 'x', at: 1000 + i * 10, data: { activityId: id, evidence: 'written', reflection: 'ok' } },
        { type: 'teacher_confirmed', studentId: 'x', at: 1001 + i * 10, by: 't', data: { activityId: id, how: 'work' } }]);
      return !!SE.game.profile('x', ev).patches.find((p) => p.patch.id === 'crew-game-dev').earned;
    })()""")
    ok("the Game Developer patch comes with 4 crew passes", earned)

    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
