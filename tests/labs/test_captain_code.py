# Captain Code (lab-captain.js): plays the workshop the way students do. Tap blocks (no dragging), predict, plot,
# run and step, fix a broken program, hit a block budget, sail in fog, pass two tides with one program, use a
# variable and your own block, read the Python, Undo/Redo, design a chart, and graduate with a certificate.
# Also: keyboard-only play, reduced motion, the Chromebook first screen, phone width, and the educator Demo.
# Every level's reference solution is checked separately in tests/tools/test_captain_levels.js.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/labs/test_captain_code.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def level(pg, n, fast=True):
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(120)
    await pg.goto(S + f"#/lab/captain-code/{n}"); await pg.wait_for_timeout(500)
    if fast: await pg.click('#cc-speed [data-speed="140"]')
async def won(pg):
    await pg.wait_for_timeout(150)
    return await pg.locator("#lab-win:not([hidden])").count() == 1
async def feedback(pg): return (await pg.inner_text("#lab-feedback")).strip()
async def add(pg, *types):
    for t in types: await pg.click(f'#cc-code [data-add="{t}"]'); await pg.wait_for_timeout(15)
async def root_end(pg):
    await pg.locator("#prog-list > ol.blocks > .slot").last.click(); await pg.wait_for_timeout(15)
async def inc(pg, n, times=1):
    for _ in range(times): await pg.locator("#cc-code [data-inc]").nth(n).click(); await pg.wait_for_timeout(10)
async def else_of(pg, label):
    blk = pg.locator(f'#cc-code li.blk:has(> .blk__row .blk__label:text-is("{label}"))').first
    await blk.locator(":scope > .blk__body").nth(1).locator(".slot").first.click(); await pg.wait_for_timeout(15)
async def run(pg):
    await pg.click("#cc-run")
    for _ in range(300):
        await pg.wait_for_timeout(50)
        if not await pg.locator(".lab-mount.is-running").count(): break
    await pg.wait_for_timeout(120)
async def predict(pg, x, y):
    await pg.click("#cc-run")                       # Run asks for a guess first
    await pg.click(f'#cc-gridwrap button.cc-cell[data-x="{x}"][data-y="{y}"]')
async def count(pg): return (await pg.inner_text("#blk-count")).strip()

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    ctx = await b.new_context(viewport={"width": 1366, "height": 650}, reduced_motion="reduce")
    pg = await ctx.new_page(); pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear(); sessionStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await pg.evaluate("SE.store.signInEducator(SE.store.DEMO.email, SE.store.DEMO.password)")

    # Landing: the rule, Start on the first screen, three regions with real level counts.
    await pg.goto(S + "#/lab/captain-code"); await pg.wait_for_timeout(500)
    txt = await pg.inner_text("#app")
    ok("landing states the rule", "Your boat only goes where your code tells it." in txt)
    box = await pg.locator("#cc-start").bounding_box()
    ok("Start is on the first screen at 1366x650", box and box["y"] + box["height"] <= 650, box)
    ok("landing lists 10 + 12 + 12 levels", "10 levels" in txt and txt.count("12 levels") == 2, txt[-300:])

    # Level 1: empty program, then a prediction is required before the first run.
    await level(pg, 1)
    ok("level 1 shows the harbor master's briefing", await pg.locator(".lab-briefing").count() == 1)
    order = await pg.evaluate("[...document.querySelector('.lab-brief').children].map((n) => n.className).join(' | ')")
    ok("the brief leads with the goal, before the briefing", order.index("lab-goal") < order.index("lab-briefing"), order)
    ok("learn and why fold into 'Why this level?'", await pg.locator("details.lab-objective--fold summary:has-text('Why this level?')").count() == 1)
    hb = await pg.locator("#lab-hint-btn").bounding_box()
    ok("Need a hint? is on the first screen at 1366x650", hb and hb["y"] + hb["height"] <= 650, hb)
    ok("a predict level says so before the first Run", "guess where the boat stops" in await pg.inner_text("#cc-modepanel"))
    await pg.click("#cc-run")
    ok("an empty program is named", "empty" in await feedback(pg), await feedback(pg))
    await add(pg, "move", "move", "move", "move")
    await pg.click("#cc-run")
    ok("Run asks for a prediction first", "where you think the boat will stop" in await feedback(pg), await feedback(pg))
    ok("predict mode turns squares into buttons", await pg.locator("#cc-gridwrap button.cc-cell").count() > 10)
    await pg.click('#cc-gridwrap button.cc-cell[data-x="5"][data-y="1"]')
    await run(pg)
    ok("level 1 wins with 4 Forwards", await won(pg), await feedback(pg))
    ok("a right prediction is named and earns the Compass", "predicted exactly" in await feedback(pg) and await pg.locator("#lab-win .cc-mark.is-on").count() == 2, await feedback(pg))
    ok("the Compass says what it checked", await pg.locator('#lab-win .cc-mark:has-text("Compass: exact guess")').count() == 1)
    marks_y = (await pg.locator("#lab-win .cc-marks").bounding_box())["y"]; head_y = (await pg.locator("#lab-win-title").bounding_box())["y"]
    ok("the marks sit under the Level complete heading", marks_y > head_y, (marks_y, head_y))

    # A wrong guess is described from the guess, not with grid numbers.
    await level(pg, 1)
    await add(pg, "move", "move", "move")
    await predict(pg, 5, 1)
    await run(pg)
    ok("a wrong guess says how far off it was", "1 square from your guess" in await feedback(pg) and "row" not in await feedback(pg), await feedback(pg))
    ok("the guess ring stays on the chart after the run", await pg.locator(".cc-guess").count() == 1)

    # Level 3: Captain Dot's program crashes; the feedback names the turn; fixing the first turn wins.
    await level(pg, 3)
    ok("level 3 starts with the broken program", (await count(pg)).startswith("9 blocks"), await count(pg))
    ok("with a program to read, the chart is ready for a guess", await pg.locator("#cc-gridwrap button.cc-cell").count() > 10)
    await predict(pg, 6, 3)
    await pg.click("#cc-step"); await pg.wait_for_timeout(60)
    ok("Step highlights one block and its Python line", await pg.locator("#cc-code .blk.is-active").count() == 1)
    await run(pg)
    ok("the crash feedback points at the last turn", "last turn" in await feedback(pg) and await pg.locator(".cc-cell.is-crash").count() == 1, await feedback(pg))
    await pg.locator("#cc-code [data-del]").nth(2).click()
    await pg.locator("#prog-list > ol.blocks > .slot").nth(2).click()
    await add(pg, "right")
    await run(pg)
    ok("level 3 wins after fixing the first turn", await won(pg), await feedback(pg))

    # Level 5: a working 13-block route runs, then asks for a loop; Undo/Redo; a loop wins with Par.
    await level(pg, 5)
    for _ in range(4): await add(pg, "move", "move", "pick")
    await add(pg, "move")
    await predict(pg, 10, 1)
    await run(pg)
    ok("over budget still runs, then asks for a loop", "Your route works! It uses 13 blocks, and this level allows 5" in await feedback(pg) and "loop" in await feedback(pg), await feedback(pg))
    ok("over budget is said in words, not only color", "too many" in await count(pg), await count(pg))
    ok("budget = par shows one number, not a Par chip", await pg.locator("#cc-par").count() == 0)
    ok("the toolbox says 'Repeat … times', not '#'", (await pg.inner_text('#cc-code [data-add="repeat"]')).strip() == "Repeat … times")
    ok("a working but long route doesn't win", not await won(pg))
    await pg.click("#rv-undo")
    ok("Undo takes back the last block", (await count(pg)).startswith("12 /"), await count(pg))
    await pg.click("#rv-redo")
    ok("Redo puts it back", (await count(pg)).startswith("13 /"), await count(pg))
    await pg.locator('#cc-code [data-add="move"]').focus()   # focus inside the editor
    await pg.keyboard.press("Control+z")
    ok("Ctrl+Z undoes too", (await count(pg)).startswith("12 /"), await count(pg))
    await pg.click("#rv-clear")
    await add(pg, "repeat", "move", "move", "pick")
    await root_end(pg); await add(pg, "move")
    await inc(pg, 0, 2)
    await run(pg)
    ok("level 5 wins with a loop in 5 blocks", await won(pg), await feedback(pg))
    ok("at par earns the Par mark", await pg.locator('#lab-win .cc-mark.is-on:has-text("Par")').count() == 1)

    # Level 6: real fog. The mooring is hidden until the boat gets close; if/else wins.
    await level(pg, 6)
    ok("in fog the mooring square is hidden", await pg.locator('.cc-cell[data-x="2"][data-y="3"].cc-cell--fog').count() == 1)
    ok("the chart's label says it's foggy, not where things are", "fog" in (await pg.get_attribute(".cc__grid", "aria-label")).lower())
    await add(pg, "untilGoal", "ifWall", "right")
    await else_of(pg, "If ledge ahead"); await add(pg, "move")
    await run(pg)
    ok("level 6 wins with if / else in fog", await won(pg), await feedback(pg))
    ok("the fog cleared where the boat sailed", await pg.locator('.cc-cell[data-x="2"][data-y="3"].cc-cell--fog').count() == 0)

    # Level 7: one program, two tides. A route for high tide fails at low tide; the nested rule passes both.
    await level(pg, 7)
    await add(pg, "move", "move", "right", "move", "move", "left", "move", "move", "move", "move")
    await run(pg)
    ok("too many blocks is named even when it works on one tide", "allows 6" in await feedback(pg), await feedback(pg))
    await pg.click("#rv-clear")
    await add(pg, "untilGoal", "ifWall", "ifLedgeRight", "left")
    await else_of(pg, "If ledge on the right"); await add(pg, "right")
    await else_of(pg, "If ledge ahead"); await add(pg, "move")
    await run(pg)
    ok("passing one tide asks for the other", "It works at High tide" in await feedback(pg) and "Low tide" in await feedback(pg), await feedback(pg))
    ok("no win until both tides pass", not await won(pg))
    await pg.click("#cc-all")
    for _ in range(80):
        await pg.wait_for_timeout(100)
        if await won(pg): break
    ok("Test both tides wins with one program", await won(pg), await feedback(pg))

    # Level 8: the variable really controls the loop.
    await level(pg, 8)
    await add(pg, "setVar", "repeat"); await inc(pg, 1, 3)
    await add(pg, "repeatVar", "move")
    await pg.locator("#prog-list .blk__body > ol.blocks > .slot").last.click()
    await add(pg, "right", "changeVar")
    await run(pg)
    ok("level 8 wins with a variable", await won(pg), await feedback(pg))
    ok("the distance chip shows the variable's last value", "distance = 6" in (await pg.inner_text("#cc-chips")).replace("\n", " "), await pg.inner_text("#cc-chips"))

    # Level 9: your own block, defined once and called 3 times. Calling it zero times is named.
    await level(pg, 9)
    await pg.locator("#fn-list .slot").first.click()
    await add(pg, "move", "move", "move", "pick", "right")
    await root_end(pg); await add(pg, "call", "call", "call", "move")
    ok("the counter counts your block's blocks too", (await count(pg)).startswith("9 / 9"), await count(pg))
    await pg.click("#cc-pybtn")
    py = await pg.inner_text("#cc-py-code")
    ok("See your code in Python shows def and three calls", "def haul_and_turn():" in py and py.count("haul_and_turn()") == 4, py)
    ok("the Python view explains the boat's commands aren't built into Python", "not built into Python" in (await pg.text_content(".cc-py__help")))
    ok("the toolbox stays while Python is open", await pg.locator('#cc-code [data-add="move"]').is_visible())
    rb = await pg.locator("#cc-run").bounding_box()
    ok("Run stays on the first screen with Python open", rb and rb["y"] + rb["height"] <= 650, rb)
    await pg.click("#cc-step"); await pg.wait_for_timeout(60)
    ok("stepping highlights the matching Python line", await pg.locator(".cc-py__line.is-active").count() == 1)
    await run(pg)
    ok("level 9 wins with Haul and Turn", await won(pg), await feedback(pg))

    # Level 10: design a chart. A chart the boat can't sail is refused; a good one is accepted.
    await level(pg, 10)
    await pg.click("#cc-design")
    db = await pg.locator("#cc-design-done").bounding_box(); gb = await pg.locator(".cc__grid").bounding_box()
    ok("the designer opens with the chart and Done: test my chart on one screen", db and gb and gb["y"] >= 0 and db["y"] + db["height"] <= 650, (gb, db))
    await pg.click('[data-tool="#"]')
    for x, y in [(2, 1), (1, 2)]: await pg.click(f'#cc-gridwrap button.cc-cell[data-x="{x}"][data-y="{y}"]')
    await pg.click("#cc-design")
    ok("a chart with the dock walled in is refused", "can't reach" in await feedback(pg), await feedback(pg))
    await pg.click('[data-tool="."]')
    await pg.click('#cc-gridwrap button.cc-cell[data-x="2"][data-y="1"]')
    await pg.click("#cc-design-done")
    ok("a chart that works is accepted with its best route", "Your chart works" in await feedback(pg), await feedback(pg))

    # Keyboard only: level 1 again, by Tab/Enter and arrow keys.
    await level(pg, 1)
    btn = pg.locator('#cc-code [data-add="move"]')
    for _ in range(4): await btn.focus(); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(20)
    await pg.locator("#cc-run").focus(); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(80)
    first = pg.locator('#cc-gridwrap button.cc-cell[tabindex="0"]')
    await first.focus()
    fx = int(await first.get_attribute("data-x")); fy = int(await first.get_attribute("data-y"))
    for _ in range(5 - fx): await pg.keyboard.press("ArrowRight")
    for _ in range(1 - fy): await pg.keyboard.press("ArrowDown")
    await pg.keyboard.press("Enter"); await pg.wait_for_timeout(60)
    await pg.locator("#cc-run").focus(); await pg.keyboard.press("Enter")
    for _ in range(60):
        await pg.wait_for_timeout(80)
        if await won(pg): break
    ok("level 1 can be played by keyboard only", await won(pg), await feedback(pg))

    # Chromebook first screen: the chart and Run fit at 1366x650.
    await level(pg, 9)
    rb = await pg.locator("#cc-run").bounding_box()
    ok("Run is on the first screen at 1366x650", rb and rb["y"] + rb["height"] <= 650, rb)
    ok("an educator previewing sees the Demo button", await pg.locator("#cc-demo").count() == 1)
    await pg.click("#cc-big")
    ok("Bigger blocks makes the toolbox bigger without Extra help", await pg.locator("#cc.cc--big:not(.cc--help)").count() == 1 and (await pg.locator('#cc-code [data-add="move"]').bounding_box())["height"] >= 52)
    await pg.click("#cc-big")

    # Phone width: no sideways scroll.
    ph = await b.new_context(viewport={"width": 390, "height": 800}, reduced_motion="reduce")
    pp = await ph.new_page(); pp.on("pageerror", lambda e: errs.append(f"phone: {e}"))
    await pp.goto(S); await pp.evaluate("SE.store.signInEducator(SE.store.DEMO.email, SE.store.DEMO.password)")
    for n in [7, 9]:
        await pp.goto(S + "#/activities"); await pp.wait_for_timeout(100)
        await pp.goto(S + f"#/lab/captain-code/{n}"); await pp.wait_for_timeout(500)
        sw = await pp.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        ok(f"level {n} has no sideways scroll on a phone", sw <= 1, sw)
    await ph.close()

    # Educator: Demo loads the reference solution, which wins without a prediction.
    t = await (await b.new_context(viewport={"width": 1366, "height": 800}, reduced_motion="reduce")).new_page()
    t.on("pageerror", lambda e: errs.append(f"educator: {e}"))
    await t.goto(S + "#/signin/educator"); await t.wait_for_timeout(300); await t.click("#fill-demo"); await t.click("#edu-form button[type=submit]"); await t.wait_for_timeout(800)
    await level(t, 7)
    await t.click("#cc-demo")
    ok("Demo loads the reference (6 blocks)", (await count(t)).startswith("6 /"), await count(t))
    await t.click("#cc-all")
    for _ in range(80):
        await t.wait_for_timeout(100)
        if await won(t): break
    ok("the Demo solution passes both tides", await won(t), await feedback(t))
    await t.goto(S + "#/activity/lab-captain-code"); await t.wait_for_timeout(500)
    ok("the activity page has the teacher notes", "Demo" in await t.inner_text("#app"))

    # Signed-in student: best result, and the Casco Bay graduation with a certificate.
    st = await (await b.new_context(viewport={"width": 1366, "height": 900}, reduced_motion="reduce")).new_page()
    st.on("pageerror", lambda e: errs.append(f"student: {e}"))
    await st.goto(S); await st.evaluate("localStorage.clear()"); await st.reload(); await st.wait_for_timeout(300)
    await st.goto(S + "#/signin/student"); await st.wait_for_timeout(300)
    await st.fill("#class-code", "MOOSE7"); await st.click("#code-form button[type=submit]"); await st.wait_for_timeout(400)
    await st.click("text=Ava R."); await st.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await st.click(f"[data-pic={x}]")
    await st.wait_for_timeout(800)
    await level(st, 4)
    await add(st, "move", "right", "move", "move", "left", "move", "move", "right", "move", "move", "left", "move", "move", "move")
    await run(st)
    ok("a student wins level 4 at par", await won(st), await feedback(st))
    await level(st, 4)
    ok("coming back shows the student's best", "Your best so far: 14 blocks" in await feedback(st), await feedback(st))
    await st.evaluate("for (let i = 0; i < 9; i++) SE.store.log('lab_level_completed', { labId: 'captain-code', level: i, result: { blocks: 1 } })")
    await level(st, 10)
    await add(st, "repeat", "move"); await inc(st, 0, 1)
    await root_end(st)
    await add(st, "pick", "right", "move", "move", "right", "move", "move", "pick", "left", "left", "move", "move", "right", "move", "move", "pick", "left", "repeat", "move")
    await inc(st, 1, 1)
    await root_end(st)
    await add(st, "left", "move", "pick", "left", "left", "move")
    ok("the free-build reference is 27 blocks", (await count(st)).startswith("27 blocks"), await count(st))
    await run(st)
    ok("the Captain's Challenge wins", await won(st), await feedback(st))
    win = await st.inner_text("#lab-win")
    ok("the Voyage Card shows the student's program", "My Voyage Card" in win and "Captain Ava R." in win, win[:300])
    ok("graduation: Casco Bay Certified Captain", "Casco Bay Certified Captain" in win and "Keep the humanity in technology" in win, win[-400:])
    ok("graduation links on to Penobscot Bay", await st.locator('#lab-win a:has-text("Sail on to Penobscot Bay")[href="#/lab/captain-code/11"]').count() == 1)
    ok("graduation offers the certificate", await st.locator("#lab-win button:has-text('Print my certificate')").count() == 1)
    earned = await st.evaluate("(() => { const u = SE.store.currentUser(); return SE.game.profile(u.id).patches.find((p) => p.patch.id === 'captain-casco').earned; })()")
    ok("finishing Casco Bay earns the Certified Captain patch", bool(earned), earned)

    ok("no page errors", not errs, errs[:3])
    await b.close()
  print(f"\n{sum(R)}/{len(R)} passed"); sys.exit(0 if all(R) else 1)

asyncio.run(main())
