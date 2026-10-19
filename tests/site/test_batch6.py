# Browser test for Batch 6: learning goals on every lab level, Pattern Machine Lab context,
# Level 6 scored out of 10 (7 passes) with a printable certificate, mission "Why it matters",
# and the Bug Hunt algorithm shown to students.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/site/test_batch6.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
CODING = ["robot-maze-mission", "event-party", "loop-dance", "debug-animation", "interactive-story", "score-keeper",
          "my-blocks-patterns", "capstone-game", "fix-the-recipe", "lobster-trap-logic"]

async def answer_all(pg, correct):
    uses = await pg.evaluate("SE.patternMachine.USES.map(u=>({floor:u.floor, fits:u.fits}))")
    for i, u in enumerate(uses):
        fl = u["floor"] or []
        if correct: d = "good" if not fl else ("human" if fl == ["good"] else "not")
        else: d = "good" if fl else "not"
        r = u["fits"][0] if correct else next(k for k in ["small", "help", "choice", "harm", "unfair", "private", "honest", "cantknow"] if k not in u["fits"])
        await pg.click(f'[data-row="{i}"] [data-u="{d}"]')
        await pg.select_option(f'[data-r="{i}"]', r)

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

    # Every lab level has a learning goal and a "why"
    missing = await pg.evaluate("SE.labs.all().flatMap(l=>l.levels.map((v,i)=>[l.id,i,!!v.learn,!!v.why])).filter(x=>!x[2]||!x[3])")
    total = await pg.evaluate("SE.labs.all().reduce((n,l)=>n+l.levels.length,0)")
    ok(f"all {total} lab levels have 'What you'll learn' and 'Why it matters'", not missing, missing[:5])

    await pg.goto(S + "#/lab/pattern-machine/1"); await pg.wait_for_timeout(500)
    t = await pg.inner_text(".lab-objective")
    ok("AI L1: objective box shows learn + why", "what you'll learn" in t.lower() and "why it matters" in t.lower(), t[:80])
    await pg.goto(S + "#/lab/pattern-machine/3"); await pg.wait_for_timeout(500)
    ok("AI L3: Glims and Norps explained, student is the teacher", "made-up creatures" in await pg.inner_text("#lab-mount") and "You're the teacher" in await pg.inner_text("#lab-mount"))
    await pg.goto(S + "#/lab/pattern-machine/5"); await pg.wait_for_timeout(500)
    ok("AI L5: confidence lesson with a diagram", await pg.locator(".cf-lesson svg").count() == 1 and "Confidence threshold" in await pg.inner_text(".cf-lesson"))

    # Pure scoring rule
    sc = await pg.evaluate("""(() => { const P = SE.patternMachine, picks = {};
      P.USES.forEach((u, i) => { const fl = u.floor || []; picks[i] = { d: !fl.length ? 'good' : fl.length === 1 ? 'human' : 'not', r: u.fits[0] }; });
      const all = P.scoreUses(picks); const seven = { ...picks }; [0,1,2].forEach(i => delete seven[i]);
      const six = { ...seven }; delete six[3];
      return [P.USES.length, P.PASS, all.score, P.scoreUses(seven).pass, P.scoreUses(six).pass]; })()""")
    ok("L6 rule: 10 cases, 7 passes, 6 doesn't", sc == [10, 7, 10, True, False], sc)

    # L6 fail path
    await pg.goto(S + "#/lab/pattern-machine/6"); await pg.wait_for_timeout(500)
    ok("L6: score button waits until all 10 are answered", await pg.is_disabled("#resp-score"))
    await answer_all(pg, False)
    ok("L6: score button ready after 10 answers", not await pg.is_disabled("#resp-score"), await pg.inner_text("#resp-count"))
    await pg.click("#resp-score"); await pg.wait_for_timeout(300)
    fb = await pg.inner_text("#lab-feedback")
    ok("L6 fail: says you need 7, no win panel", "need 7" in fb and await pg.is_hidden("#lab-win"), fb)
    ok("L6 fail: 'Look again' notes shown", await pg.locator(".oi-why.is-wrong").count() >= 4)
    # pass path
    await pg.goto(S + "#/lab/pattern-machine/5"); await pg.wait_for_timeout(200)
    await pg.goto(S + "#/lab/pattern-machine/6"); await pg.wait_for_timeout(500)
    await answer_all(pg, True); await pg.click("#resp-score"); await pg.wait_for_timeout(500)
    ok("L6 pass: celebration title", "You passed: 10 of 10!" in await pg.inner_text("#lab-win-title"))
    ok("L6 pass: win panel repeats why it matters", await pg.locator("#lab-win .lab-win__why").count() == 1)
    await pg.click("#lab-win [data-cert]"); await pg.wait_for_timeout(300)
    ct = await pg.inner_text(".cert")
    ok("certificate: award, student display name, class, mission line", all(x in ct for x in ["Responsible AI Explorer", "Ava R.", "Keep the humanity in technology.", "10 of 10"]), ct[:160])
    ok("certificate: print button", await pg.locator("[data-cert-print]").count() == 1)
    await pg.screenshot(path="/tmp/cert.png")
    await pg.emulate_media(media="print"); await pg.evaluate("document.body.classList.add('cert-printing')")
    vis = await pg.evaluate("[...document.body.children].filter(e=>getComputedStyle(e).display!=='none').map(e=>e.className)")
    ok("print view shows only the certificate", vis == ["overlay cert-overlay"], vis)
    await pg.evaluate("document.body.classList.remove('cert-printing')"); await pg.emulate_media(media="screen")
    await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
    ok("certificate closes with Escape", await pg.locator(".cert-overlay").count() == 0)
    await pg.goto(S + "#/lab/pattern-machine/5"); await pg.wait_for_timeout(200)
    await pg.goto(S + "#/lab/pattern-machine/6"); await pg.wait_for_timeout(500)
    ok("L6 revisit: certificate can be printed again", await pg.locator(".resp-prior [data-cert]").count() == 1)

    # Missions: why it matters + key words; Bug Hunt algorithm visible
    lacking = await pg.evaluate(f"{CODING}.filter(id=>{{const a=SE.activityById[id]; return !(a.why&&a.realWorld&&a.vocab&&a.vocab.length>=3)}})")
    ok("all 10 coding missions have why, real world, and key words", not lacking, lacking)
    await pg.goto(S + "#/activity/fix-the-recipe"); await pg.wait_for_timeout(400)
    ok("Bug Hunt: algorithm card shows 4 buggy steps", await pg.locator(".block--mission .board li").count() == 4)
    ok("Bug Hunt: Why it matters + Key words", await pg.locator("#s-why").count() == 1 and await pg.locator(".vocab dt").count() == 3)
    ok("Bug Hunt: 'You're done when' stop point", "You're done when" in await pg.inner_text("#app"))
    await pg.screenshot(path="/tmp/bughunt.png", full_page=True)

    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    for h in ["#/lab/pattern-machine/5", "#/lab/pattern-machine/6", "#/activity/fix-the-recipe"]:
        await m.goto(S + h); await m.wait_for_timeout(400)
        w = await m.evaluate("document.documentElement.scrollWidth")
        ok(f"phone: {h} has no sideways scroll", w <= 390, w)
    await m.evaluate("SE.certificate.open({award:'Responsible AI Explorer',course:'Pattern Machine Lab',name:'Ava R.',className:'Room 12'})")
    w = await m.evaluate("document.documentElement.scrollWidth")
    ok("phone: certificate fits", w <= 390, w)
    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
