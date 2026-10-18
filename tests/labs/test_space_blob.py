# Browser test for Feed the Space Blob.
# Serve the app in local mode first:  LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js
# Then run:  python3 tests/labs/test_space_blob.py [http://localhost:8767/]   (needs: pip install playwright)
import asyncio, sys, os, random
from playwright.async_api import async_playwright
S = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
O = os.environ.get("SHOTS", "/tmp/")
results = []
def ok(name, cond, extra=""):
    results.append(bool(cond)); print(("PASS " if cond else "FAIL ") + name, extra)
async def st(pg): return await pg.evaluate("SE.blob.state()")
async def val(pg): return int(await pg.inner_text("#sb-val"))
async def fb(pg): return await pg.inner_text("#lab-feedback")
async def setnum(pg, sel, v): await pg.fill(sel, str(v))
async def feed(pg, n=1):
    for _ in range(n): await pg.click("#sb-feed")
async def guest(pg):
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await pg.click("text=Look around as a guest"); await pg.wait_for_timeout(300)
async def level(pg, n): await pg.goto(S + f"#/lab/space-blob/{n}"); await pg.wait_for_timeout(400)
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    def watch(pg): pg.on("pageerror", lambda e: errs.append(str(e)))
    pg = await b.new_page(viewport={"width": 1280, "height": 900}); watch(pg)
    await guest(pg)
    # ── Level 1
    await level(pg, 1)
    ok("default code is set 0 / change 1", await pg.input_value("#sb-init") == "0" and await pg.input_value("#sb-inc") == "1")
    await pg.evaluate("document.getElementById('sb-feed').click()")
    ok("Feed before Start is refused", "Press Start first" in await fb(pg) and await val(pg) == 0)
    await pg.click("#sb-start"); ok("Start initializes snacks to 0", await val(pg) == 0 and (await st(pg))["run"]["feeds"] == 0)
    ok("Start button becomes Restart", "Restart" in await pg.inner_text("#sb-start"))
    seq = []
    for _ in range(3): await feed(pg); seq.append(await val(pg))
    ok("feeding 3 times: 1, 2, 3", seq == [1, 2, 3], seq)
    hist = await pg.inner_text("#sb-history")
    ok("history shows each update", "Feed 3: 2 + 1 = 3" in hist, hist.replace("\n", " | "))
    ok("question appears after 3 feeds", await pg.is_visible("#sb-ask"))
    await setnum(pg, "#sb-answer", 4); await pg.click("#sb-answer-btn")
    ok("wrong answer not accepted", not await pg.is_visible("#lab-win") and "Not quite" in await fb(pg))
    await setnum(pg, "#sb-answer", 3); await pg.keyboard.press("Enter") if False else await pg.click("#sb-answer-btn")
    ok("correct answer (3) completes level 1", await pg.is_visible("#lab-win"), await fb(pg))
    # Restart behavior + editing mid-run
    await pg.click("#sb-start")
    ok("Restart resets snacks to 0 and feed count to 0", await val(pg) == 0 and (await st(pg))["run"]["feeds"] == 0)
    await feed(pg, 2)
    await setnum(pg, "#sb-inc", 5)
    ok("editing mid-run shows Restart notice", await pg.is_visible("#sb-changed"))
    await feed(pg)
    ok("mid-run edit does not apply until Restart (2 → 3, not 7)", await val(pg) == 3, await val(pg))
    await pg.click("#sb-start")
    ok("Restart applies new code and hides notice", not await pg.is_visible("#sb-changed") and (await st(pg))["run"]["inc"] == 5)
    await feed(pg, 2); ok("new amount used after restart (0 → 10)", await val(pg) == 10)
    await setnum(pg, "#sb-inc", 1); ok("changing it back hides notice? (code differs from run → shown)", await pg.is_visible("#sb-changed"))
    # validation
    for bad in ["2.5", "500", "", "-3"]:
        await setnum(pg, "#sb-init", bad); await pg.click("#sb-start")
        ok(f"invalid start value {bad!r} blocked", await pg.get_attribute("#sb-init", "aria-invalid") == "true" and "red number" in await fb(pg) and await val(pg) == 10, await pg.inner_text("#sb-init-err"))
    await setnum(pg, "#sb-init", 0); await setnum(pg, "#sb-inc", 11); await pg.click("#sb-start")
    ok("amount above 10 blocked", await pg.get_attribute("#sb-inc", "aria-invalid") == "true")
    # arithmetic sweep, including negatives
    good = True; detail = ""
    rnd = random.Random(7)
    for _ in range(12):
        i0, inc, n = rnd.randint(0, 100), rnd.randint(-10, 10), rnd.randint(0, 6)
        await setnum(pg, "#sb-init", i0); await setnum(pg, "#sb-inc", inc); await pg.click("#sb-start"); await feed(pg, n)
        if await val(pg) != i0 + inc * n: good = False; detail = f"{i0}+{inc}*{n} gave {await val(pg)}"
    ok("arithmetic sweep: snacks = start + amount × feeds (12 random runs)", good, detail)
    # ── Level 2
    await level(pg, 2)
    await pg.click("#sb-start"); ok("L2 needs a prediction first", "prediction first" in await fb(pg) and not (await st(pg))["run"])
    await setnum(pg, "#sb-predict", 8); await pg.click("#sb-start")
    ok("L2 with amount still 1 → told to change it", "Change it to 2" in await fb(pg), await fb(pg))
    await setnum(pg, "#sb-inc", 2); await pg.click("#sb-start"); await feed(pg, 3)
    f = await fb(pg)
    ok("L2 prediction compared with real result", await val(pg) == 6 and "You predicted 8. snacks is 6: 0 + 2 + 2 + 2 = 6" in f and await pg.is_visible("#lab-win"), f)
    # ── Level 3: missing reset experiment
    await level(pg, 3)
    await pg.click("#sb-start"); await feed(pg, 4)
    ok("L3 fed to 4", await val(pg) == 4)
    await pg.click("#sb-reset-toggle")
    ok("switch turns block off (pressed=false, block greyed)", await pg.get_attribute("#sb-reset-toggle", "aria-pressed") == "false" and "is-off" in await pg.get_attribute("#sb-set-blk", "class"))
    await pg.click("#sb-start")
    s_ = await st(pg)
    ok("without reset, Restart keeps old value (4)", await val(pg) == 4 and s_["run"]["start"] == 4 and s_["L3"]["leftover"], await fb(pg))
    ok("history explains the skipped block", "off" in await pg.inner_text("#sb-history"))
    await feed(pg, 2); ok("feeding continues from old value (4 → 6)", await val(pg) == 6 and (await st(pg))["L3"]["fedAfter"])
    await pg.click("#sb-start"); ok("Restart again without reset still keeps 6", await val(pg) == 6 and not (await st(pg))["won"])
    await feed(pg)
    await pg.click("#sb-reset-toggle"); await pg.click("#sb-start")
    ok("turning reset back on → Restart returns to 0 and completes level", await val(pg) == 0 and await pg.is_visible("#lab-win"), await fb(pg))
    ok("L3 checklist all done", await pg.locator("#sb-checks li.is-done").count() == 3)
    # ── Level 4: challenge
    await level(pg, 4)
    async def attempt(i0, inc, n):
        await setnum(pg, "#sb-init", i0); await setnum(pg, "#sb-inc", inc); await pg.click("#sb-start"); await feed(pg, n)
        return await fb(pg)
    f = await attempt(0, 3, 4)
    ok("challenge (0,+3,4): explains with real values", "0 + 3 + 3 + 3 + 3 = 12" in f and "started at 0, not 2" in f and not await pg.is_visible("#lab-win"), f)
    f = await attempt(14, 0, 4)
    ok("challenge (14,+0,4): total 14 by luck is NOT accepted", await val(pg) == 14 and "snacks is 14, but" in f and "added 0, not 3" in f and not await pg.is_visible("#lab-win"), f)
    f = await attempt(2, 4, 3)
    ok("challenge (2,+4,3): no verdict before 4 feeds", f.strip() == "" and await val(pg) == 14, repr(f))
    await feed(pg); f = await fb(pg)
    ok("challenge (2,+4,4): wrong amount explained", "added 4, not 3" in f and not await pg.is_visible("#lab-win"), f)
    ok("wrong code is explained, not auto-fixed", await pg.input_value("#sb-init") == "2" and await pg.input_value("#sb-inc") == "4")
    xf = await pg.evaluate("SE.blob.check(3, {start:2, inc:3, feeds:5, resetOn:true}).msg")
    ok("extra feeds explained (rule): 5 feeds with correct code", "fed 5 times, not 4" in xf and "2 + 3 + 3 + 3 + 3 + 3 = 17" in xf, xf)
    await pg.click("#lab-hint-btn"); h = [await pg.is_visible('[data-hint="0"]'), await pg.is_visible('[data-hint="1"]')]
    await pg.click("#lab-hint-btn"); h.append(await pg.is_visible('[data-hint="1"]'))
    ok("two hints revealed one at a time", h == [True, False, True])
    f = await attempt(2, 3, 4)
    ok("challenge (2,+3,4) passes: 2 → 5 → 8 → 11 → 14", await val(pg) == 14 and await pg.is_visible("#lab-win") and "2 + 3 + 3 + 3 + 3 = 14" in f, f)
    await pg.screenshot(path=O + "blob-l4.png", full_page=True)
    rules = await pg.evaluate("""(() => { const c = (r) => SE.blob.check(3, r).ok;
      return [c({start:2,inc:3,feeds:4,resetOn:true}), c({start:2,inc:3,feeds:4,resetOn:false}), c({start:14,inc:0,feeds:4,resetOn:true}), c({start:5,inc:3,feeds:3,resetOn:true}), c({start:-10,inc:6,feeds:4,resetOn:true})]; })()""")
    ok("rule table (reset off with leftover 2 also fails)", rules == [True, False, False, False, False], rules)
    # keyboard
    await level(pg, 1)
    await pg.focus("#sb-start"); await pg.keyboard.press("Enter")
    await pg.focus("#sb-feed"); await pg.keyboard.press("Enter"); await pg.keyboard.press("Space")
    ol = await pg.evaluate("getComputedStyle(document.activeElement).outlineStyle")
    ok("keyboard: Enter/Space start and feed; focus visible", await val(pg) == 2 and ol == "solid", ol)
    # ── signed-in student: progress saved from the run record
    s2 = await b.new_page(viewport={"width": 1280, "height": 900}); watch(s2)
    await s2.goto(S + "#/signin/student"); await s2.wait_for_timeout(300)
    await s2.fill("#class-code", "MOOSE7"); await s2.click("#code-form button[type=submit]"); await s2.wait_for_timeout(400)
    await s2.click("text=Ava R."); await s2.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await s2.click(f"[data-pic={x}]")
    await s2.wait_for_timeout(800)
    await s2.goto(S + "#/lab/space-blob/4"); await s2.wait_for_timeout(400)
    await s2.fill("#sb-init", "2"); await s2.fill("#sb-inc", "3"); await s2.click("#sb-start")
    for _ in range(4): await s2.click("#sb-feed")
    saved = await s2.evaluate("JSON.stringify(SE.store.eventsFor(SE.store.currentUser().id).filter(e=>e.type==='lab_level_completed'&&e.data.labId==='space-blob').map(e=>e.data.result))")
    ok("student completion saved with start/amount/feeds", saved == '[{"start":2,"inc":3,"feeds":4,"value":14,"resetOn":true}]', saved)
    # teacher guide
    t = await b.new_page(viewport={"width": 1280, "height": 900}); watch(t)
    await t.goto(S + "#/signin/educator"); await t.wait_for_timeout(300); await t.click("#fill-demo"); await t.click("#edu-form button[type=submit]"); await t.wait_for_timeout(800)
    await t.goto(S + "#/activity/lab-space-blob"); await t.wait_for_timeout(400)
    txt = await t.inner_text("#app")
    ok("teacher guide covers variables, initialization, common mistakes", all(k in txt for k in ["Variables:", "Initialization:", "Common mistake"]))
    await t.goto(S + "#/teach/missions/coding"); await t.wait_for_timeout(400)
    ok("assignable from educator Missions tab", await t.locator('[data-assign="lab-space-blob"]').count() >= 1)
    # reduced motion + phone
    rm = await b.new_page(viewport={"width": 390, "height": 844}, reduced_motion="reduce"); watch(rm)
    await rm.goto(S); await rm.wait_for_timeout(300); await rm.click("text=Look around as a guest"); await rm.wait_for_timeout(300)
    await rm.goto(S + "#/lab/space-blob/1"); await rm.wait_for_timeout(400)
    await rm.click("#sb-start"); await rm.click("#sb-feed")
    an = await rm.evaluate("getComputedStyle(document.querySelector('.sb-blob__svg')).animationName")
    ok("reduced motion: no animation, value still updates", an == "none" and int(await rm.inner_text("#sb-val")) == 1, an)
    ok("phone: no sideways scroll", await rm.evaluate("document.documentElement.scrollWidth") <= 390)
    await rm.screenshot(path=O + "blob-m.png", full_page=True)
    ok("no page errors", not errs, errs)
    print(f"\n{sum(results)}/{len(results)} passed")
    await b.close()
asyncio.run(main())
