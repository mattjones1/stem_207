# Young readers (grades 2–3): "Simple words" (a.simple) is on by default for a student in the 2–3 band,
# switches and remembers; Read it to me uses the browser's own voice only when pressed, highlights what
# it reads, and stops. speechSynthesis is stubbed so the test can see what would be spoken.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/site/test_young_readers.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def go(pg, h, wait=500):
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(120); await pg.goto(S + h); await pg.wait_for_timeout(wait)
# A fake voice: records what it's asked to say; each utterance "ends" when the test calls __finish().
STUB = """
window.__spoken = []; window.__cancelled = 0; window.__queue = [];
window.SpeechSynthesisUtterance = function (t) { this.text = t; };
Object.defineProperty(window, "speechSynthesis", { configurable: true, value: { speak(u) { window.__spoken.push(u.text); window.__queue.push(u); }, cancel() { window.__cancelled++; window.__queue = []; }, getVoices() { return [{}]; } } });
window.__finish = () => { const u = window.__queue.shift(); if (u && u.onend) u.onend(); };
"""

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    ctx = await b.new_context(viewport={"width": 1366, "height": 650}); await ctx.add_init_script(STUB)
    pg = await ctx.new_page(); pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)

    # A student in the 2–3 band (the sample class has one; make Ava 2–3 for this test).
    await go(pg, "#/signin/student", 300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)
    await pg.evaluate("SE.store.updateStudent(SE.store.currentUser().id, { gradeBand: '2-3' })")
    a = await pg.evaluate("(() => { const a = SE.activityById['sink-or-float']; return { m: a.mission, sm: a.simple.mission, s0: a.steps[0], ss0: a.simple.steps[0] }; })()")

    await go(pg, "#/activity/sink-or-float")
    t = await pg.inner_text("#mission-text")
    ok("a 2–3 student sees simple words by default", t == a["sm"], t)
    ok("…and the simple steps", a["ss0"] in await pg.inner_text(".block:has(#s-steps)"))
    ok("the toggle shows it's on", await pg.get_attribute("#simple-toggle", "aria-pressed") == "true")
    await pg.click("#simple-toggle"); await pg.wait_for_timeout(300)
    ok("Simple words off shows the full mission and steps", await pg.inner_text("#mission-text") == a["m"] and a["s0"] in await pg.inner_text(".block:has(#s-steps)"))
    await go(pg, "#/activity/sink-or-float")
    ok("the choice is remembered", await pg.inner_text("#mission-text") == a["m"])
    await pg.click("#simple-toggle"); await pg.wait_for_timeout(300)

    # Read it to me
    ok("nothing is spoken until a button is pressed", await pg.evaluate("window.__spoken.length") == 0)
    await pg.click('[data-read="mission"]'); await pg.wait_for_timeout(150)
    ok("Read it to me speaks the mission (simple words)", await pg.evaluate("window.__spoken[0]") == a["sm"])
    ok("…highlights it, and the button becomes Stop reading", await pg.locator("#mission-text.is-reading").count() == 1 and "Stop" in await pg.inner_text('[data-read="mission"]'))
    await pg.click('[data-read="mission"]'); await pg.wait_for_timeout(150)
    ok("pressing it again stops", await pg.evaluate("window.__cancelled") >= 1 and await pg.locator(".is-reading").count() == 0 and await pg.get_attribute('[data-read="mission"]', "aria-pressed") == "false")
    await pg.evaluate("window.__spoken = []")
    await pg.click('[data-read="steps"]'); await pg.wait_for_timeout(150)
    await pg.evaluate("window.__finish()"); await pg.wait_for_timeout(100)
    sp = await pg.evaluate("window.__spoken")
    ok("steps are read one at a time, numbered", len(sp) == 2 and sp[0].startswith("Step 1.") and sp[1].startswith("Step 2."), sp)
    ok("the step being read is highlighted", await pg.locator(".block:has(#s-steps) ol.steps > li.is-reading").count() == 1)
    await go(pg, "#/activities")
    ok("leaving the page stops reading", await pg.locator(".is-reading").count() == 0)

    # Labs: Read it to me on the goal
    await go(pg, "#/lab/moon-gate/1", 800)
    await pg.evaluate("window.__spoken = []")
    await pg.click('[data-read="lab"]'); await pg.wait_for_timeout(150)
    ok("a lab's goal can be read aloud", (await pg.evaluate("window.__spoken[0] || ''")).startswith("Your goal:"))

    # A 4–5 student sees the full text by default; an activity without 2–3 has no toggle.
    await pg.evaluate("localStorage.removeItem('stem207.simple'); SE.store.updateStudent(SE.store.currentUser().id, { gradeBand: '4-5' })")
    await go(pg, "#/activity/sink-or-float")
    ok("a 4–5 student sees the full text by default", await pg.inner_text("#mission-text") == a["m"])
    await go(pg, "#/activity/paper-helicopter")
    ok("no Simple words toggle where there's no simple version", await pg.locator("#simple-toggle").count() == 0)

    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
