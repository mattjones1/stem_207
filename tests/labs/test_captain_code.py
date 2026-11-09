# Captain Code (lab-captain.js): plays the workshop the way students do. Tap blocks (no dragging), predict, plot
# a course with its jobs, run and step, fix a broken program, hit a block budget, loop with laps and Put in a
# Repeat, learn first in a lesson, sail in fog, pass two tides with one program, use a variable and your own
# block, read the Python (on by default), Undo/Redo, sail Level 10's lettered legs, design a chart step by step,
# and graduate with a certificate. Also: keyboard-only play, reduced motion, the Chromebook first screen, phone
# width, the lean toolbar (no Extra help, Bigger blocks, or Demo), and the activity page's sticky steps.
# Every level's reference solution and every lesson example is checked in tests/tools/test_captain_levels.js.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/labs/test_captain_code.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
# Mark every lesson as seen for whoever is signed in, so a level opens straight on its workspace.
SEED = "(() => { const u = SE.store.currentUser(); const id = u && u.id ? u.id : 'preview'; SE.captain.LEVELS.filter((l) => l.lesson).forEach((l) => localStorage.setItem(`stem207.captain.lesson.${l.id}.${id}`, '1')); })()"
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
async def cell(pg, x, y): await pg.click(f'#cc-gridwrap button.cc-cell[data-x="{x}"][data-y="{y}"]'); await pg.wait_for_timeout(20)

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    ctx = await b.new_context(viewport={"width": 1366, "height": 650}, reduced_motion="reduce")
    pg = await ctx.new_page(); pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear(); sessionStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await pg.evaluate("SE.store.signInEducator(SE.store.DEMO.email, SE.store.DEMO.password)")
    await pg.evaluate(SEED)

    # Landing: the rule, Start on the first screen, three regions with real level counts, no Extra help.
    await pg.goto(S + "#/lab/captain-code"); await pg.wait_for_timeout(500)
    txt = await pg.inner_text("#app")
    ok("landing states the rule", "Your boat only goes where your code tells it." in txt)
    box = await pg.locator("#cc-start").bounding_box()
    ok("Start is on the first screen at 1366x650", box and box["y"] + box["height"] <= 650, box)
    ok("landing lists 10 + 12 + 12 levels", "10 levels" in txt and txt.count("12 levels") == 2, txt[-300:])
    ok("landing has no Extra help toggle", "Extra help" not in txt)

    # Level 1: the lean screen, then a prediction is required before the first run.
    await level(pg, 1)
    ok("level 1 shows the harbor master's briefing", await pg.locator(".lab-briefing").count() == 1)
    order = await pg.evaluate("[...document.querySelector('.lab-brief').children].map((n) => n.className).join(' | ')")
    ok("the brief leads with the goal, before the briefing", order.index("lab-goal") < order.index("lab-briefing"), order)
    ok("learn and why fold into 'Why this level?'", await pg.locator("details.lab-objective--fold summary:has-text('Why this level?')").count() == 1)
    hb = await pg.locator("#lab-hint-btn").bounding_box()
    ok("Hint is on the first screen at 1366x650", hb and hb["y"] + hb["height"] <= 650, hb)
    ok("Listen and Hint are a quiet row of small links", await pg.locator(".lab-brief__tools--compact #lab-hint-btn:has-text('Hint')").count() == 1 and hb["height"] <= 32, hb)
    ok("no Extra help, Bigger blocks, or Demo buttons", await pg.locator("#cc-help, #cc-big, #cc-demo").count() == 0)
    ok("Python shows by default", await pg.locator("#cc-py").is_visible() and await pg.get_attribute("#cc-pybtn", "aria-pressed") == "true")
    ok("Step says what it does", "1 block" in await pg.inner_text("#cc-step"))
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

    # Level 2: plot your course, with the job on the route and the plan in words.
    await level(pg, 2)
    ok("Guess where it stops is offered on a level that doesn't require it", await pg.locator("#cc-predict").count() == 1)
    ok("a plan level opens Plot your course", await pg.get_attribute("#cc-plan", "aria-pressed") == "true")
    await cell(pg, 2, 1); await cell(pg, 3, 1)
    ok("plotting onto a trap says it can be planned as a job", "Tap it again" in await feedback(pg), await feedback(pg))
    await cell(pg, 3, 1)
    ok("tapping the trap again plans the haul there (H on the chart)", await pg.locator(".cc-plan--act").count() == 1 and "Planned: haul" in await feedback(pg), await feedback(pg))
    await cell(pg, 3, 2); await cell(pg, 3, 3)
    words = [w.strip() for w in await pg.locator(".cc-planwords__list li").all_inner_texts()]
    ok("My plan in words follows the route from the boat's direction", words == ["Forward 2", "Haul trap", "Turn right", "Forward 2"], words)
    ok("the plan says it reaches the mooring and counts the jobs", "reaches the mooring" in await pg.inner_text("#cc-planwords") and "1 of 1" in await pg.inner_text("#cc-planwords"))
    await pg.click("#cc-plan")   # done planning
    await add(pg, "move", "move", "right", "move", "move")
    await run(pg)
    ok("skipping a planned haul is named on the chart", "Your plan hauls a trap on the red square" in await feedback(pg) and await pg.locator(".cc-cell.is-off").count() == 1, await feedback(pg))

    # Level 3: Captain Dot's program crashes; the feedback names the turn; fixing the first turn wins.
    await level(pg, 3)
    ok("level 3 starts with the broken program", (await count(pg)).startswith("9 blocks"), await count(pg))
    ok("with a program to read, the chart is ready for a guess", await pg.locator("#cc-gridwrap button.cc-cell").count() > 10)
    await predict(pg, 6, 3)
    await pg.click("#cc-step"); await pg.wait_for_timeout(60)
    ok("Step highlights one block and its Python line", await pg.locator("#cc-code .blk.is-active").count() == 1 and await pg.locator(".cc-py__line.is-active").count() == 1)
    ok("the status counts steps", (await pg.inner_text("#cc-status")).startswith("Step 1:"), await pg.inner_text("#cc-status"))
    ok("the first Step explains what Step does", "one block at a time" in await feedback(pg), await feedback(pg))
    await run(pg)
    ok("the crash feedback points at the last turn", "last turn" in await feedback(pg) and await pg.locator(".cc-cell.is-crash").count() == 1, await feedback(pg))
    await pg.locator("#cc-code [data-del]").nth(2).click()
    await pg.locator("#prog-list > ol.blocks > .slot").nth(2).click()
    await add(pg, "right")
    await run(pg)
    ok("level 3 wins after fixing the first turn", await won(pg), await feedback(pg))

    # Level 5: a working 13-block route runs, then asks for a loop; Undo/Redo; Put in a Repeat; laps; Par.
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
    await add(pg, "move", "move", "pick", "move")
    await pg.click("#rv-select")
    for i in range(3): await pg.locator("#cc-code [data-sel]").nth(i).check()
    await pg.click("#rv-wrap")
    ok("Put in a Repeat wraps the ticked blocks", (await count(pg)).startswith("5 /") and await pg.locator('#prog-list > ol.blocks > li.blk:has(.blk__label:text-is("Repeat"))').count() == 1, await count(pg))
    ok("the Repeat has an 'end repeat' foot", await pg.locator("#cc-code .blk__foot:text-is('end repeat')").count() == 1)
    await pg.click("#cc-code [data-pick]")
    await pg.click('#cc-code [data-set][data-n="4"]')
    ok("the number picker sets the count in one tap", (await pg.inner_text("#cc-code [data-pick]")).strip() == "4")
    await pg.click("#cc-code [data-unroll]")
    ok("See it unrolled shows the 12 blocks the loop stands for", await pg.locator("#cc-code .blk__unrolled li").count() == 12)
    await pg.click("#cc-code [data-unroll]")
    await run(pg)
    ok("level 5 wins with a loop in 5 blocks", await won(pg), await feedback(pg))
    ok("at par earns the Par mark", await pg.locator('#lab-win .cc-mark.is-on:has-text("Par")').count() == 1)
    ok("the loop's lap badge shows its last lap", (await pg.inner_text("#cc-code .blk__lap")).strip() == "lap 4 of 4", await pg.inner_text("#cc-code .blk__lap"))
    ok("the Python loop line shows its counter", "i = 3" in await pg.inner_text("#cc-py-code"), await pg.inner_text("#cc-py-code"))

    # Level 6: learn first. The lesson shows before the workspace, its example runs, and its question gates it.
    await pg.evaluate("(() => { const u = SE.store.currentUser(); localStorage.removeItem(`stem207.captain.lesson.cb-6.${u.id}`); })()")
    await level(pg, 6, fast=False)
    ok("level 6 opens on its lesson, not the editor", await pg.locator("#cc-lesson:not([hidden])").count() == 1 and not await pg.locator("#cc-run").is_visible())
    ok("the lesson starts with an everyday choice", "raining" in await pg.inner_text("#cc-lesson"))
    for _ in range(3): await pg.click("#cc-lesson-next"); await pg.wait_for_timeout(40)
    ok("the worked example shows a tiny chart and its program", await pg.locator("#cc-ex-chart .cc__grid").count() == 1 and await pg.locator("#cc-ex-code li").count() >= 4)
    said = ""
    for _ in range(4): await pg.click("#cc-ex-step"); await pg.wait_for_timeout(30); said += await pg.inner_text("#cc-ex-status") + " | "
    ok("stepping the example says which part of the if / else runs", "No, so the else part runs" in said, said)
    await pg.click("#cc-lesson-next"); await pg.wait_for_timeout(40)
    ok("the question card holds the lesson until it's answered", await pg.is_disabled("#cc-lesson-done"))
    await pg.click('#cc-lesson [data-opt="0"]')
    ok("a wrong answer explains itself and keeps the gate", "only when the answer is yes" in await pg.inner_text("#cc-lesson-why") and await pg.is_disabled("#cc-lesson-done"))
    await pg.click('#cc-lesson [data-opt="1"]')
    ok("the right answer opens the level", await pg.is_enabled("#cc-lesson-done"))
    await pg.click("#cc-lesson-done"); await pg.wait_for_timeout(100)
    ok("Start coding shows the workspace", await pg.locator("#cc-run").is_visible() and await pg.locator("#cc-lesson[hidden]").count() == 1)
    await pg.click("#cc-lesson-open"); await pg.wait_for_timeout(60)
    ok("Lesson in the brief opens it again, with a way back", await pg.locator("#cc-lesson:not([hidden])").count() == 1 and await pg.locator("#cc-lesson-skip").count() == 1)
    await pg.click("#cc-lesson-skip"); await pg.wait_for_timeout(60)
    await pg.click('#cc-speed [data-speed="140"]')
    ok("in fog the mooring square is hidden", await pg.locator('.cc-cell[data-x="2"][data-y="3"].cc-cell--fog').count() == 1)
    ok("the chart's label says it's foggy, not where things are", "fog" in (await pg.get_attribute(".cc__grid", "aria-label")).lower())
    ok("fog levels have no guess or plan tools", await pg.locator("#cc-predict, #cc-plan").count() == 0)
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

    # Level 9: your own block, defined once and called 3 times. Python is already beside it.
    await level(pg, 9)
    await pg.locator("#fn-list .slot").first.click()
    await add(pg, "move", "move", "move", "pick", "right")
    await root_end(pg); await add(pg, "call", "call", "call", "move")
    ok("the counter counts your block's blocks too", (await count(pg)).startswith("9 / 9"), await count(pg))
    py = await pg.inner_text("#cc-py-code")
    ok("the Python beside the blocks shows def and three calls", "def haul_and_turn():" in py and py.count("haul_and_turn()") == 4, py)
    ok("the Python view explains the boat's commands aren't built into Python", "not built into Python" in (await pg.text_content(".cc-py__help")))
    ok("the toolbox stays while Python is open", await pg.locator('#cc-code [data-add="move"]').is_visible())
    rb = await pg.locator("#cc-run").bounding_box()
    ok("Run stays on the first screen with Python open", rb and rb["y"] + rb["height"] <= 650, rb)
    await pg.click("#cc-step"); await pg.wait_for_timeout(60)
    ok("stepping highlights the matching Python line", await pg.locator(".cc-py__line.is-active").count() == 1)
    await run(pg)
    ok("level 9 wins with Haul and Turn", await won(pg), await feedback(pg))
    await level(pg, 9)
    await pg.click("#cc-pybtn")
    ok("the Python chip hides Python", not await pg.locator("#cc-py").is_visible())
    await level(pg, 9)
    ok("hiding Python is remembered for the session", not await pg.locator("#cc-py").is_visible())
    await pg.click("#cc-pybtn")
    ok("and the chip shows it again", await pg.locator("#cc-py").is_visible())

    # Level 10, Part 1: lettered legs. A partial run names the leg that worked; design waits for Part 1.
    await level(pg, 10)
    ok("level 10 letters its four traps on the chart", await pg.locator(".cc-leg").count() == 4)
    ok("the readout lists the legs A to D", await pg.locator("#cc-chips .cc-legs__i").count() == 4 and await pg.locator("#cc-chips .cc-legs__i.is-done").count() == 0)
    await pg.click("#cc-design")
    ok("Design my chart waits until Part 1 is won", "Finish Part 1 first" in await feedback(pg) and await pg.locator("#cc-design-done").count() == 0, await feedback(pg))
    await add(pg, "move", "move", "move", "pick", "move")
    await run(pg)
    ok("a partial run names the legs that worked", "Legs done: A" in await feedback(pg) and "Keep those blocks" in await feedback(pg), await feedback(pg))
    ok("a hauled leg ticks off", await pg.locator(".cc-legs__i.is-done").count() == 1)

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

    # Chromebook first screen: the chart and Run fit at 1366x650, and the program has room.
    for n in [5, 7, 10]:
        await level(pg, n)
        rb = await pg.locator("#cc-run").bounding_box()
        ok(f"level {n}: Run is on the first screen at 1366x650", rb and rb["y"] + rb["height"] <= 650, rb)
    ph_ = await pg.locator("#cc-code .prog").last.bounding_box()
    ok("the program pane is tall (at least 220px)", ph_ and ph_["height"] >= 220, ph_)

    # Phone width: no sideways scroll.
    ph = await b.new_context(viewport={"width": 390, "height": 800}, reduced_motion="reduce")
    pp = await ph.new_page(); pp.on("pageerror", lambda e: errs.append(f"phone: {e}"))
    await pp.goto(S); await pp.evaluate("SE.store.signInEducator(SE.store.DEMO.email, SE.store.DEMO.password)"); await pp.evaluate(SEED)
    for n in [7, 9, 10]:
        await pp.goto(S + "#/activities"); await pp.wait_for_timeout(100)
        await pp.goto(S + f"#/lab/captain-code/{n}"); await pp.wait_for_timeout(500)
        sw = await pp.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        ok(f"level {n} has no sideways scroll on a phone", sw <= 1, sw)
    await pp.evaluate("(() => { const u = SE.store.currentUser(); localStorage.removeItem(`stem207.captain.lesson.cb-8.${u.id}`); })()")
    await pp.goto(S + "#/activities"); await pp.wait_for_timeout(100)
    await pp.goto(S + "#/lab/captain-code/8"); await pp.wait_for_timeout(500)
    for _ in range(2): await pp.click("#cc-lesson-next"); await pp.wait_for_timeout(40)
    sw = await pp.evaluate("document.documentElement.scrollWidth - window.innerWidth")
    ok("a lesson's worked example has no sideways scroll on a phone", sw <= 1 and await pp.locator("#cc-ex-chart").count() == 1, sw)
    await ph.close()

    # Activity page: the teacher notes, and Your steps stays in view while the page scrolls.
    t = await (await b.new_context(viewport={"width": 1366, "height": 800}, reduced_motion="reduce")).new_page()
    t.on("pageerror", lambda e: errs.append(f"educator: {e}"))
    await t.goto(S + "#/signin/educator"); await t.wait_for_timeout(300); await t.click("#fill-demo"); await t.click("#edu-form button[type=submit]"); await t.wait_for_timeout(800)
    await t.goto(S + "#/activity/lab-captain-code"); await t.wait_for_timeout(500)
    notes = await t.inner_text("#app")
    ok("the teacher notes describe the lessons, not a Demo button", "Lessons:" in notes and "Demo the solution" not in notes)
    ok("Your steps shows in the side column", await t.locator(".aside .steps-quick .steps-quick__list li").count() == 6)
    await t.evaluate("document.getElementById('s-reflect').scrollIntoView({ block: 'start' })"); await t.wait_for_timeout(150)
    qb = await t.locator(".aside .steps-quick").bounding_box()
    ok("Your steps stays in view after scrolling down", qb and qb["y"] >= 0 and qb["y"] < 800, qb)

    # Signed-in student: best result, Level 10's legs, Part 2's guided designer, and the Casco Bay graduation.
    st = await (await b.new_context(viewport={"width": 1366, "height": 900}, reduced_motion="reduce")).new_page()
    st.on("pageerror", lambda e: errs.append(f"student: {e}"))
    await st.goto(S); await st.evaluate("localStorage.clear()"); await st.reload(); await st.wait_for_timeout(300)
    await st.goto(S + "#/signin/student"); await st.wait_for_timeout(300)
    await st.fill("#class-code", "MOOSE7"); await st.click("#code-form button[type=submit]"); await st.wait_for_timeout(400)
    await st.click("text=Ava R."); await st.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await st.click(f"[data-pic={x}]")
    await st.wait_for_timeout(800)
    await st.evaluate(SEED)
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
    ok("all four legs tick off", await st.locator(".cc-legs__i.is-done").count() == 4)
    win = await st.inner_text("#lab-win")
    ok("the Voyage Card shows the student's program", "My Voyage Card" in win and "Captain Ava R." in win, win[:300])
    ok("winning Part 1 offers Part 2: design your own voyage", "Part 2: design your own voyage" in win and await st.locator("#cc-part2-go").count() == 1)
    ok("graduation: Casco Bay Certified Captain", "Casco Bay Certified Captain" in win and "Keep the humanity in technology" in win, win[-400:])
    ok("graduation links on to Penobscot Bay", await st.locator('#lab-win a:has-text("Sail on to Penobscot Bay")[href="#/lab/captain-code/11"]').count() == 1)
    ok("graduation offers the certificate", await st.locator("#lab-win button:has-text('Print my certificate')").count() == 1)
    earned = await st.evaluate("(() => { const u = SE.store.currentUser(); return SE.game.profile(u.id).patches.find((p) => p.patch.id === 'captain-casco').earned; })()")
    ok("finishing Casco Bay earns the Certified Captain patch", bool(earned), earned)
    await st.click("#cc-part2-go"); await st.wait_for_timeout(150)
    ok("Part 2 opens the designer's four steps", await st.locator(".cc-dsteps li").count() == 4)

    # Part 2, on a Chromebook screen: the designer's steps, the live Sailable! check, and Done.
    await st.set_viewport_size({"width": 1366, "height": 650})
    await level(st, 10)
    await st.click("#cc-design")
    db = await st.locator("#cc-design-done").bounding_box(); gb = await st.locator(".cc__grid").bounding_box()
    ok("the designer opens with the chart and Done: test my chart on one screen", db and gb and gb["y"] >= 0 and db["y"] + db["height"] <= 650, (gb, db))
    ok("a finished level opens the designer straight away, and the chart is sailable", "Sailable!" in await st.inner_text("#cc-solvable"), await st.inner_text("#cc-solvable"))
    await st.click('[data-tool="#"]')
    for x, y in [(2, 1), (1, 2)]: await cell(st, x, y)
    ok("walling in the dock turns the check to Not ready yet", "Not ready yet" in await st.inner_text("#cc-solvable") and "can't reach" in await st.inner_text("#cc-solvable"), await st.inner_text("#cc-solvable"))
    await st.click("#cc-design")
    ok("a chart with the dock walled in is refused", "can't reach" in await feedback(st), await feedback(st))
    await st.click('[data-tool="."]')
    await cell(st, 2, 1)
    ok("opening a gap makes it sailable again, with its best route", "Sailable!" in await st.inner_text("#cc-solvable") and "moves" in await st.inner_text("#cc-solvable"))
    await st.click("#cc-design-done")
    ok("a chart that works is accepted with its best route", "Your chart works" in await feedback(st), await feedback(st))
    ok("a designed chart drops the A–D letters", await st.locator(".cc-leg").count() == 0)

    ok("no page errors", not errs, errs[:3])
    await b.close()
  print(f"\n{sum(R)}/{len(R)} passed"); sys.exit(0 if all(R) else 1)

asyncio.run(main())
