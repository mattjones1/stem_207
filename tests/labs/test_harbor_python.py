# Harbor Python Lab (lab-python.js) and "See it in Python" in Harbor Code: plays a level from each chapter the
# way a student would (one of them by keyboard only), checks the friendly error for a syntax bug, and that the
# Python view in Harbor Code follows the blocks.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/labs/test_harbor_python.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def level(pg, n):
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(120)
    await pg.goto(S + f"#/lab/harbor-python/{n}"); await pg.wait_for_timeout(500)
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
    await pg.evaluate("SE.store.startGuest()")

    # Read it: a wrong prediction is named, the right one wins.
    await level(pg, 1)
    ok("Read it shows the program and choices A, B, C", await pg.locator(".py-code li").count() == 2 and await pg.locator("[data-pick]").count() == 3)
    await pg.click("#py-run")
    ok("Run before choosing asks for a prediction", "Predict" in await feedback(pg) or "Choose" in await feedback(pg))
    await pg.click('[data-pick="C"]'); await pg.click("#py-run")
    ok("a wrong prediction names the student's choice and the real stop", "You predicted C" in await feedback(pg) and "B" in await feedback(pg), await feedback(pg))
    await pg.click('[data-pick="B"]'); await pg.click("#py-run")
    ok("the right prediction wins", await won(pg))

    # Put it in order (Parsons), by keyboard only: Tab to each line and press Enter, then Indent.
    await level(pg, 5)
    order = ["for i in range(3):", "move()", "turn_right()", "for i in range(2):", "move()"]
    for want in order:
        btn = pg.locator(".py-add", has=pg.locator(f"code:text-is('{want}')")).first
        await btn.focus(); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(80)
    for i in [1, 4]:
        await pg.locator(f'[data-indent="{i}"]').focus(); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(80)
    await pg.locator("#py-run").focus(); await pg.keyboard.press("Enter")
    ok("a Parsons puzzle solved by keyboard only wins", await won(pg), await feedback(pg))

    # Fix it: Python's error names the line; fixing the colon wins.
    await level(pg, 8)
    await pg.click("#py-run"); await pg.wait_for_timeout(150)
    err = await pg.inner_text("#py-errors")
    ok("a syntax error is explained with its line", "Line 1" in err and "colon" in err, err)
    src = await pg.input_value("#py-src")
    await pg.fill("#py-src", src.replace("range(2)\n", "range(2):\n", 1)); await pg.click("#py-run")
    ok("fixing the colon wins", await won(pg), await feedback(pg))

    # Write it: too long is refused; a loop wins.
    await level(pg, 10)
    await pg.fill("#py-src", "\n".join(["move()"] * 9)); await pg.click("#py-run")
    ok("Write it refuses 9 lines and says how many", "9 lines" in await feedback(pg), await feedback(pg))
    await pg.fill("#py-src", "for i in range(9):\n    move()"); await pg.click("#py-run")
    ok("a 2-line loop wins", await won(pg), await feedback(pg))
    ok("Tab moves focus out of the editor (no keyboard trap)", await pg.evaluate("""(() => { const t = document.getElementById('py-src'); t.focus(); const e = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }); t.dispatchEvent(e); return !e.defaultPrevented; })()"""))

    # Harbor Code: See it in Python follows the blocks.
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(120)
    await pg.goto(S + "#/lab/rover/4"); await pg.wait_for_timeout(600)
    await pg.click(".py-view summary"); await pg.wait_for_timeout(100)
    before = await pg.inner_text("#py-view")
    await pg.click('[data-add="move"]'); await pg.wait_for_timeout(150)
    after = await pg.inner_text("#py-view")
    ok("See it in Python shows the program and updates when a block is added", after != before and "move()" in after, after)
    py = await pg.evaluate("document.getElementById('py-view').textContent")
    ok("the Python view reads back as valid mini-Python", await pg.evaluate("t => SE.minipy.parse(t).errors.length === 0", py))

    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
