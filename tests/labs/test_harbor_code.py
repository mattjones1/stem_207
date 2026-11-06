# Harbor Code Lab (lab-coding.js, lab id "rover"): a characterization test, written before the engine and
# editor moved to harbor-engine.js and harbor-editor.js for Captain Code. It plays levels the way a student
# does (tap blocks, Run, Step), checks the feedback text, and compares the editor's markup with a saved
# snapshot, so the shared code can't quietly change Harbor Code.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/labs/test_harbor_code.py [url] [--record]
import asyncio, sys, json, re, os
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
RECORD = "--record" in sys.argv
SNAP = os.path.join(os.path.dirname(__file__), "..", "fixtures", "harbor-code-dom.json")
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def level(pg, n):
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(120)
    await pg.goto(S + f"#/lab/rover/{n}"); await pg.wait_for_timeout(450)
    await pg.select_option("#rv-speed", "140")
async def won(pg):
    await pg.wait_for_timeout(150)
    return await pg.locator("#lab-win:not([hidden])").count() == 1
async def feedback(pg): return (await pg.inner_text("#lab-feedback")).strip()
async def status(pg): return (await pg.inner_text("#rover-status")).strip()
async def add(pg, *types):
    for t in types: await pg.click(f'[data-add="{t}"]'); await pg.wait_for_timeout(20)
async def root_end(pg):
    # The last gap of the main program: blocks added next go after everything.
    await pg.locator("#prog-list > ol.blocks > .slot").last.click(); await pg.wait_for_timeout(20)
async def inc(pg, n, times=1):
    for _ in range(times): await pg.locator("[data-inc]").nth(n).click(); await pg.wait_for_timeout(15)
async def run(pg):
    await pg.click("#rv-run")
    for _ in range(200):
        await pg.wait_for_timeout(60)
        if not await pg.locator(".lab-mount.is-running").count(): break
    await pg.wait_for_timeout(100)
def norm(html): return re.sub(r'\bb\d+\b', "bN", re.sub(r"\s+", " ", html)).strip()

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    ctx = await b.new_context(viewport={"width": 1366, "height": 650}, reduced_motion="reduce")
    pg = await ctx.new_page(); pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await pg.evaluate("SE.store.startGuest()")
    snap = {}

    # Level 1: three Forwards by taps.
    await level(pg, 1)
    snap["l1_palette"] = norm(await pg.inner_html(".palette"))
    snap["l1_prog"] = norm(await pg.inner_html("#prog-list"))
    await pg.click("#rv-run")
    ok("an empty program is named", "empty" in await feedback(pg), await feedback(pg))
    await add(pg, "move", "move")
    await run(pg)
    ok("stopping short is explained", "isn't at the wharf yet" in await feedback(pg), await feedback(pg))
    await add(pg, "move")
    await run(pg)
    ok("level 1 wins with three Forwards", await won(pg), await feedback(pg))

    # Level 3: the debug starter crashes, and Step highlights one block at a time.
    await level(pg, 3)
    ok("level 3 says another captain wrote it", "another captain" in await feedback(pg))
    ok("level 3 starts with 11 blocks", (await pg.inner_text("#blk-count")).startswith("11 blocks"), await pg.inner_text("#blk-count"))
    await pg.click("#rv-step"); await pg.wait_for_timeout(80)
    ok("Step highlights the first block", await pg.locator(".blk.is-active").count() == 1 and await status(pg) == "Forward", await status(pg))
    await run(pg)
    ok("the starter bumps a ledge", "granite ledge" in await feedback(pg) and await pg.locator(".cell.is-crash").count() == 1, await feedback(pg))

    # Level 4: block limit text, then Repeat 7: Forward wins.
    await level(pg, 4)
    await add(pg, "move", "move", "move")
    await run(pg)
    ok("over the block limit is explained", "this level allows 2" in await feedback(pg), await feedback(pg))
    await pg.click("#rv-clear")
    await add(pg, "repeat", "move")
    await inc(pg, 0, 5)
    ok("the counter shows 2 / 2", (await pg.inner_text("#blk-count")) == "2 / 2 blocks", await pg.inner_text("#blk-count"))
    await run(pg)
    ok("level 4 wins with a loop", await won(pg), await feedback(pg))

    # Level 6: the loop bug. Fix the turn inside the loop (L -> R).
    await level(pg, 6)
    await run(pg)
    ok("the loop bug starter bumps a ledge", "granite ledge" in await feedback(pg), await feedback(pg))
    await pg.locator('[data-del]').nth(3).click()          # remove the Turn left inside the loop
    await pg.locator("#prog-list .blk__body .slot").last.click()
    await add(pg, "right")
    await run(pg)
    ok("level 6 wins after fixing the turn", await won(pg), await feedback(pg))

    # Level 9: fog sensor. Repeat until at wharf { If ledge ahead: Turn right else Forward }.
    await level(pg, 9)
    await add(pg, "untilGoal", "ifWall", "right")
    await pg.locator("#prog-list .blk__body .blk__body").nth(1).locator(".slot").first.click()
    await add(pg, "move")
    await run(pg)
    ok("level 9 wins with if-else in a loop", await won(pg), await feedback(pg))

    # Level 10: the variable. Set steps 1; Repeat 4 { Repeat steps: Forward; Turn right; Change steps by 1 }.
    await level(pg, 10)
    await add(pg, "setVar")
    await add(pg, "repeat")
    await inc(pg, 1, 2)                                     # repeat 2 -> 4
    await add(pg, "repeatVar", "move")
    await pg.locator("#prog-list .blk__body > ol.blocks > .slot").last.click()   # after Repeat steps, inside Repeat 4
    await add(pg, "right", "changeVar")
    await run(pg)
    ok("level 10 wins with a variable", await won(pg), await feedback(pg))
    ok("the steps readout shows 5", (await pg.inner_text("#var-steps")) == "5", await pg.inner_text("#var-steps"))

    # Level 11: your own block, and See it in Python.
    await level(pg, 11)
    snap["l11_palette"] = norm(await pg.inner_html(".palette"))
    snap["l11_prog"] = norm(await pg.inner_html(".rover__code"))
    await pg.locator("#fn-list .slot").first.click()
    await add(pg, "move", "left", "move", "right")
    await root_end(pg)
    await add(pg, "call", "call", "move", "move", "call", "call")
    py = (await pg.text_content("#py-view")) or ""
    snap["l11_python"] = py
    ok("See it in Python shows def zig and calls", "def zig():" in py and py.count("zig()") >= 4, py)
    await run(pg)
    ok("level 11 wins with the Zig block", await won(pg), await feedback(pg))

    ok("no page errors", not errs, errs[:3])
    if RECORD:
        os.makedirs(os.path.dirname(SNAP), exist_ok=True)
        with open(SNAP, "w", encoding="utf-8") as f: json.dump(snap, f, indent=1)
        print("recorded", SNAP)
    elif os.path.exists(SNAP):
        with open(SNAP, encoding="utf-8") as f: want = json.load(f)
        for k, v in want.items(): ok(f"markup unchanged: {k}", snap.get(k) == v, "" if snap.get(k) == v else (snap.get(k) or "")[:200])
    else:
        ok("snapshot exists (run with --record once)", False)
    await b.close()
  print(f"\n{sum(R)}/{len(R)} passed"); sys.exit(0 if all(R) else 1)

asyncio.run(main())
