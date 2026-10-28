# Browser test for Moon Base Gatekeeper.
# Serve the app in local mode first:  LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js
# Then run:  python3 tests/labs/test_moon_gate.py [http://localhost:8767/]   (needs: pip install playwright)
import asyncio, sys, os, itertools
from playwright.async_api import async_playwright
S = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
O = os.environ.get("SHOTS", "/tmp/")
results = []
def ok(name, cond, extra=""):
    results.append(bool(cond)); print(("PASS " if cond else "FAIL ") + name, extra)
B = ["moon", "star", "planet"]; NAME = {"moon": "Moon", "star": "Star", "planet": "Planet"}
async def setopt(pg, group, v): await pg.click(f'[data-set="{group}"][data-v="{v}"]')
async def test(pg, visitor, predict=None):
    await setopt(pg, "visitor", visitor)
    if predict: await setopt(pg, "predict", predict)
    await pg.click("#mg-test")
async def fb(pg): return await pg.inner_text("#lab-feedback")
async def st(pg): return await pg.evaluate("SE.gate.state()")
async def won(pg): return await pg.is_visible("#lab-win")
async def level(pg, n):
    # Go via the home page so revisiting the same level always starts fresh.
    await pg.goto(S + "#/library"); await pg.wait_for_timeout(150)
    await pg.goto(S + f"#/lab/moon-gate/{n}"); await pg.wait_for_timeout(400)
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    def watch(pg): pg.on("pageerror", lambda e: errs.append(str(e)))
    pg = await b.new_page(viewport={"width": 1280, "height": 900}); watch(pg)
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await pg.click("text=Look around as a guest"); await pg.wait_for_timeout(300)
    await pg.evaluate("localStorage.setItem('stem207.devPlan', 'educator')")   # this tests the lab, not who may open it (test_access.py does that)

    # ── Every rule × visitor combination (3 badges × 2 THEN × 2 ELSE × 3 visitors = 36), through the UI
    await level(pg, 3)   # level 3 has optional predictions, so any combination can be tested
    bad = []; trace_bad = []
    for rb, th, el, vis in itertools.product(B, ["open", "closed"], ["open", "closed"], B):
        await setopt(pg, "badge", rb); await setopt(pg, "then", th); await setopt(pg, "else", el)
        await test(pg, vis)
        match = vis == rb; exp = th if match else el; branch = "then" if match else "else"
        s_ = await st(pg); last = s_["log"][-1]
        gate = await pg.get_attribute("#mg-scene", "data-gate"); sign = await pg.inner_text("#mg-sign")
        if (last["action"], last["branch"], gate, sign) != (exp, branch, exp, "OPEN" if exp == "open" else "CLOSED"):
            bad.append((rb, th, el, vis, last, gate, sign))
        tr = await pg.inner_text("#mg-trace")
        taken = await pg.get_attribute(f"#mg-{branch}", "class"); other = await pg.get_attribute(f"#mg-{'else' if match else 'then'}", "class")
        res = await pg.inner_text("#mg-res")
        want = f"is {NAME[vis]} equal to {NAME[rb]}? {'Yes (true)' if match else 'No (false)'}"
        if want not in tr or f"{branch.upper()} branch runs" not in tr or "is-taken" not in taken or "is-skipped" not in other or ("Yes" in res) != match:
            trace_bad.append((rb, th, el, vis, tr[:120]))
    ok("all 36 rule/visitor combinations: action, branch, gate, sign", not bad, bad[:3])
    ok("trace + code highlight correct for all 36 (comparison result, branch taken, other skipped)", not trace_bad, trace_bad[:2])
    rows = await pg.locator("#mg-log tr").count()
    ok("test log has a row per test", rows == 36, rows)
    row = await pg.inner_text("#mg-log tr:first-child")
    ok("log row shows visitor, expected, actual, rule", "Planet" in row and "Planet → Closed / Closed" in row, row.replace("\t", " | "))

    # ── Level 1
    await level(pg, 1)
    await setopt(pg, "visitor", "moon"); await pg.click("#mg-test")
    ok("L1: prediction required before testing", "prediction first" in await fb(pg) and len((await st(pg))["log"]) == 0)
    await test(pg, "moon", "closed")
    tr = await pg.inner_text("#mg-trace")
    ok("L1: wrong prediction shown in trace, still completes", "You predicted Closed" in tr and "did something else" in tr and await won(pg))
    lr = await pg.inner_text("#mg-log tr:first-child")
    ok("L1: log marks prediction vs actual as different", "✗ different" in lr, lr.replace("\t", " | "))
    ok("prediction resets after each test", await pg.locator('[data-set="predict"][aria-pressed="true"]').count() == 0)
    # ── Level 2
    await level(pg, 2)
    await test(pg, "moon", "open")
    ok("L2: testing Moon is not the task", "test a Star visitor" in await fb(pg) and not await won(pg))
    await test(pg, "star", "closed")
    ok("L2: Star visitor → ELSE → closed, level complete", await won(pg) and "ELSE ran" in await fb(pg), await fb(pg))
    # ── Level 3 (change the rule)
    await level(pg, 3)
    await setopt(pg, "badge", "planet"); await test(pg, "planet")
    ok("L3: one matching test is not enough", "Now test a visitor without a Planet badge" in await fb(pg) and not await won(pg), await fb(pg))
    await test(pg, "star")
    ok("L3: matching + non-matching tests complete it", await won(pg))
    # ── Level 4 (broken rule)
    await level(pg, 4)
    s_ = await st(pg); ok("L4 starts with the broken rule (both branches open)", s_["rule"] == {"badge": "moon", "then": "open", "else": "open"})
    await test(pg, "moon")
    ok("L4: Moon passes but hint says one test isn't proof", "one passing test" in await fb(pg) and not (await st(pg))["bugFound"])
    await test(pg, "planet")
    f = await fb(pg)
    ok("L4: non-matching visitor reveals the bug", (await st(pg))["bugFound"] and "Found the bug" in f and "ELSE opens the gate too" in f, f)
    await setopt(pg, "else", "closed")
    ok("L4: editing marks old tests stale", await pg.is_visible("#mg-stale") and await pg.locator("#mg-log tr.is-stale").count() == 2)
    await test(pg, "planet")
    ok("L4: after fix, non-matching only → asks for matching test", "test a Moon visitor too" in await fb(pg) and not await won(pg), await fb(pg))
    await test(pg, "moon")
    ok("L4: fixed + both tested → complete", await won(pg))
    await level(pg, 4)
    await setopt(pg, "else", "closed"); await test(pg, "star")
    ok("L4: fixing before finding the bug is explained", "before showing the bug" in await fb(pg) and not await won(pg))

    # ── Level 5 challenge
    await level(pg, 5)
    await test(pg, "moon")
    f = await fb(pg); ok("challenge: 'Moon visitors can still enter. Which branch runs for Moon?'", "Moon visitors can still enter. Which branch runs for Moon?" in f, f)
    await setopt(pg, "badge", "star")
    ok("challenge: edit clears checklist (Moon back to 'not tested')", "not tested" in await pg.inner_text("#mg-goals li:nth-child(1)"))
    await test(pg, "star")
    f = await fb(pg); ok("challenge: 'Your rule lets Star visitors in.'", "Your rule lets Star visitors in." in f and "Still to test: Moon, Planet" in f, f)
    await test(pg, "moon")
    # invalidate: change THEN away and back (same rule text, but code was edited)
    await setopt(pg, "then", "closed"); await setopt(pg, "then", "open")
    goals = await pg.inner_text("#mg-goals")
    ok("challenge: edit-and-revert still invalidates earlier passes", goals.count("not tested") == 3, goals.replace("\n", " "))
    await test(pg, "planet")
    ok("challenge: only Planet retested → not complete", not await won(pg) and "Still to test: Moon, Star" in await fb(pg), await fb(pg))
    await test(pg, "star"); await test(pg, "moon")
    ok("challenge complete only after all three pass on current rule", await won(pg))
    await pg.screenshot(path=O + "gate-l5.png", full_page=True)
    # other wrong programs never complete
    for rule in [("moon", "closed", "open"), ("planet", "closed", "open"), ("star", "closed", "closed"), ("star", "open", "open"), ("moon", "open", "closed")]:
        await level(pg, 5)
        for g, v in zip(["badge", "then", "else"], rule): await setopt(pg, g, v)
        for v in B: await test(pg, v)
        ok(f"challenge: rule {rule} tested on all 3 does NOT complete", not await won(pg), await fb(pg))
    await level(pg, 5)
    await setopt(pg, "badge", "star"); await test(pg, "star")
    await setopt(pg, "then", "closed"); await test(pg, "star")
    ok("challenge: Star kept out explained", "Star visitors are stuck outside" in await fb(pg))
    # hints
    await pg.click("#lab-hint-btn"); h = [await pg.is_visible('[data-hint="0"]'), await pg.is_visible('[data-hint="1"]')]
    await pg.click("#lab-hint-btn"); h.append(await pg.is_visible('[data-hint="1"]'))
    hints = await pg.inner_text("#lab-hint")
    ok("two progressive hints, no full answer", h == [True, False, True] and "Keep gate closed" not in hints, hints)
    # rule unit checks
    r = await pg.evaluate("""[SE.gate.run({badge:'moon',then:'open',else:'closed'},'moon').action, SE.gate.run({badge:'moon',then:'open',else:'closed'},'star').branch,
      SE.gate.check(4,{badge:'star',then:'open',else:'closed'},[{badge:'star',action:'open',ver:1},{badge:'moon',action:'closed',ver:1},{badge:'planet',action:'closed',ver:0}],{ver:1}).untested]""")
    ok("pure rules: run() and stale planet test ignored", r == ["open", "else", ["planet"]], r)
    # keyboard
    await level(pg, 1)
    await pg.focus('[data-set="visitor"][data-v="moon"]'); await pg.keyboard.press("Enter")
    await pg.focus('[data-set="predict"][data-v="open"]'); await pg.keyboard.press("Space")
    await pg.focus("#mg-test")
    ol = await pg.evaluate("getComputedStyle(document.activeElement).outlineStyle")
    await pg.keyboard.press("Enter")
    ok("keyboard: choose, predict, test; focus visible", await won(pg) and ol == "solid", ol)
    # signed-in student
    s2 = await b.new_page(viewport={"width": 1280, "height": 900}); watch(s2)
    await s2.goto(S + "#/signin/student"); await s2.wait_for_timeout(300)
    await s2.fill("#class-code", "MOOSE7"); await s2.click("#code-form button[type=submit]"); await s2.wait_for_timeout(400)
    await s2.click("text=Ava R."); await s2.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await s2.click(f"[data-pic={x}]")
    await s2.wait_for_timeout(800)
    await s2.goto(S + "#/lab/moon-gate/5"); await s2.wait_for_timeout(400)
    await setopt(s2, "badge", "star")
    for v in B: await test(s2, v)
    saved = await s2.evaluate("JSON.stringify(SE.store.eventsFor(SE.store.currentUser().id).filter(e=>e.type==='lab_level_completed'&&e.data.labId==='moon-gate').map(e=>e.data.result))")
    ok("student completion saved with rule and tests", '"rule":"star|open|closed"' in saved and "planet:closed" in saved, saved)
    # teacher note
    t = await b.new_page(viewport={"width": 1280, "height": 900}); watch(t)
    await t.goto(S + "#/signin/educator"); await t.wait_for_timeout(300); await t.click("#fill-demo"); await t.click("#edu-form button[type=submit]"); await t.wait_for_timeout(800)
    await t.goto(S + "#/activity/lab-moon-gate"); await t.wait_for_timeout(400)
    txt = await t.inner_text("#app")
    ok("teacher note: conditionals, branch selection, why one test isn't enough", all(k in txt for k in ["Conditionals:", "Branch selection:", "Why one test isn't enough"]))
    ok("educator can add it to a Learning Plan", await t.locator('a[href="#/teach/plans/new/lab-moon-gate"]').count() >= 1)
    # reduced motion + phone
    rm = await b.new_page(viewport={"width": 390, "height": 844}, reduced_motion="reduce"); watch(rm)
    await rm.goto(S); await rm.wait_for_timeout(300); await rm.click("text=Look around as a guest"); await rm.wait_for_timeout(300); await rm.evaluate("localStorage.setItem('stem207.devPlan', 'educator')")
    await rm.goto(S + "#/lab/moon-gate/1"); await rm.wait_for_timeout(400)
    await test(rm, "moon", "open")
    tr_ = await rm.evaluate("getComputedStyle(document.querySelector('.mg-door--l')).transitionDuration")
    ok("reduced motion: no door animation, result still shown", tr_ in ("0s",) and await rm.get_attribute("#mg-scene", "data-gate") == "open", tr_)
    ok("phone: no sideways scroll", await rm.evaluate("document.documentElement.scrollWidth") <= 390, await rm.evaluate("document.documentElement.scrollWidth"))
    await rm.screenshot(path=O + "gate-m.png", full_page=True)
    ok("no page errors", not errs, errs)
    print(f"\n{sum(results)}/{len(results)} passed")
    await b.close()
asyncio.run(main())
