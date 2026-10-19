# Batch 7: grades 6–8 coding track (one mission per stage + Python bridge), Loop Dance in Scratch
# with a starter, Bug Hunt → Robot Chef, and band-aware pathway suggestions.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/site/test_batch7.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
TRACK = {"sort-the-catch": 1, "lighthouse-network": 2, "snowstorm-clones": 3, "noreaster-alerts": 4,
         "catch-log-lists": 5, "snowflake-functions": 6, "python-turtle-bridge": 6, "capstone-studio": 7}
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

    bad = await pg.evaluate(f"""Object.entries({TRACK}).filter(([id, st]) => {{ const a = SE.activityById[id];
      const stage = STEM.pathway.find(s => s.stage === st);
      return !(a && a.track === '6-8' && a.grades.join() === '6-8' && a.pathwayStage === st && stage.activities.includes(id)
        && a.why && a.vocab && a.stopAt && a.check && a.stuck && a.stuck.length >= 3 && a.teacherNotes.length >= 3
        && (!a.bridge || SE.activityById[a.bridge.from]) && (!a.next || SE.activityById[a.next])); }}).map(x => x[0])""")
    ok("8 grades 6–8 missions: on their stage, complete fields, links resolve", not bad, bad)
    ok("every stage 1–7 has a grades 6–8 mission", await pg.evaluate("STEM.pathway.every(s => s.activities.some(id => (SE.activityById[id]||{}).track === '6-8'))"))
    for aid in TRACK:
        await pg.goto(S + f"#/activity/{aid}"); await pg.wait_for_timeout(250)
        t = await pg.inner_text("#app")
        ok(f"{aid}: page renders with why, steps, done-when", "Why it matters" in t and "You're done when" in t and await pg.locator("#s-steps").count() == 1)
    await pg.goto(S + "#/activity/noreaster-alerts"); await pg.wait_for_timeout(300)
    ok("noreaster: 6 test readings and a made-up-rules note", await pg.locator(".board li").count() == 6 and "made-up rules" in await pg.inner_text(".board"))
    await pg.goto(S + "#/activity/python-turtle-bridge"); await pg.wait_for_timeout(300)
    ok("python: Scratch → Python code card", await pg.locator(".board--code code").count() == 5)
    href = await pg.evaluate("SE.activityById['python-turtle-bridge'].launch.url")
    ok("python: launches the Raspberry Pi Foundation Code Editor", href.startswith("https://editor.raspberrypi.org/"), href)
    ok("python: account note says running needs no account", "Running code doesn't need an account" in await pg.evaluate("SE.activityById['python-turtle-bridge'].access.accountNote"))

    # Loop Dance in Scratch
    await pg.goto(S + "#/activity/loop-dance"); await pg.wait_for_timeout(300)
    h = await pg.get_attribute(".starter a", "href")
    head = await pg.evaluate(f"fetch('{h}').then(r=>r.arrayBuffer()).then(b=>String.fromCharCode(...new Uint8Array(b).slice(0,2)))")
    ok("loop-dance: Dance Crew starter is a zip", h.endswith("dance-crew.sb3") and head == "PK", h)
    ok("loop-dance: launches the Scratch editor", await pg.evaluate("SE.activityById['loop-dance'].launch.url.includes('scratch.mit.edu')"))
    ok("loop-dance: steps load the starter and shorten it with repeat", "Load from your computer" in await pg.inner_text("#s-steps ~ *, #app") and "repeat 2" in await pg.inner_text("#app"))
    # Bug Hunt → Robot Chef
    await pg.goto(S + "#/activity/fix-the-recipe"); await pg.wait_for_timeout(300)
    ok("bug hunt: next step is Robot Chef", await pg.locator('a[href="#/activity/lab-robot-chef"]').count() >= 1)
    # pathway
    await pg.goto(S + "#/pathway"); await pg.wait_for_timeout(400)
    ok("pathway: grades 6–8 note and 8 tagged missions", await pg.locator(".track-note").count() == 1 and await pg.locator(".stage__links .track-tag").count() == 8)
    # suggestions follow the band
    recs = await pg.evaluate("""(() => { const prof = { stages: { 1: { status: 'cleared' } }, completions: [], completedIds: new Set(), counts: { sectors: new Set() } };
      return ['6-8', '4-5'].map(b => SE.game.recommendations({ gradeBand: b }, prof, 1)[0].activity.id); })()""")
    ok("suggestions: Stage 2 for grades 6–8 picks Lighthouse Network, for 4–5 Event Party", recs == ["lighthouse-network", "event-party"], recs)
    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    for hh in ["#/activity/python-turtle-bridge", "#/activity/noreaster-alerts", "#/pathway", "#/activity/loop-dance"]:
        await m.goto(S + hh); await m.wait_for_timeout(400)
        w = await m.evaluate("document.documentElement.scrollWidth")
        ok(f"phone: {hh} has no sideways scroll", w <= 390, w)
    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
