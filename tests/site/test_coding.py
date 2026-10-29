# Coding 2.0 (planning/CODING_PLAN.md): the Coding page in browsing groups (empty groups hidden), "Think like a
# coder" (PRIMM) and "Who does this in Maine" on coding activities, "Explain your build" in the debrief saved to
# My portfolio, and the Coding Foundations template for grades 2–3.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/site/test_coding.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def go(pg, h, wait=500):
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(120); await pg.goto(S + h); await pg.wait_for_timeout(wait)

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    pg = await b.new_page(viewport={"width": 1366, "height": 650})
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await pg.evaluate("SE.store.startGuest()")

    await go(pg, "#/activities/coding")
    titles = await pg.eval_on_selector_all(".code-group__title", "els => els.map(e => e.childNodes[0].textContent.trim())")
    ok("the Coding page shows its groups in order", titles[:5] == ["Coding Foundations", "Code right here", "Block coding with Scratch", "Game Dev crew: games and stories", "Python and text coding"], titles)
    ok("an empty group (Web development) isn't shown", "Web development" not in titles)
    ok("robotics activities from Engineering appear in their group", "Robotics and physical computing" in titles and "Snowplow" in await pg.evaluate("document.querySelector('.code-group:has(#cg-robotics) .cards').textContent"))
    n = await pg.evaluate("document.querySelectorAll('.code-group .card').length")
    total = await pg.evaluate("STEM.activities.filter(a => a.area === 'coding' || ((a.alsoIn || []).includes('coding') && a.group)).length")
    ok("every coding activity is in exactly one group", n == total, f"{n} cards, {total} activities")

    await go(pg, "#/activity/loop-dance")
    t = await pg.inner_text("#app")
    primm = await pg.inner_text(".primm")
    ok("Think like a coder shows Predict, Run, Investigate, Modify, Make", all(w in primm for w in ["Predict", "Run", "Investigate", "Modify", "Make"]))
    ok("Think like a coder comes before the steps", await pg.evaluate("document.querySelector('.primm').compareDocumentPosition(document.getElementById('s-steps')) & Node.DOCUMENT_POSITION_FOLLOWING") > 0)
    ok("Who does this in Maine names a role and an industry", "Who does this in Maine" in t and await pg.locator(".career__role strong").count() == 1)

    # Student: Explain your build is saved and shows in My portfolio.
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await go(pg, "#/signin/student", 300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)
    await go(pg, "#/activity/debug-animation")
    ok("the debrief asks students to explain their build", await pg.locator("#d-explain").count() == 1)
    await pg.fill("#d-reflect", "I fixed the stop block so the fish swims forever.")
    await pg.fill("#d-explain", "My fish swims back and forth. The worst bug was the stop block. Next I'd add a shark.")
    await pg.click("#debrief-form button[type=submit]"); await pg.wait_for_timeout(500)
    await pg.keyboard.press("Escape")
    await go(pg, "#/me")
    ok("My portfolio shows the explanation", "My portfolio" in await pg.inner_text("#app") and "Next I'd add a shark." in await pg.inner_text(".portfolio"))

    # Educator: the grades 2–3 Coding Foundations template
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await go(pg, "#/signin/educator", 300); await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(900)
    await go(pg, "#/teach/plans/tpl-coding-foundations-23")
    ok("Coding Foundations: Grades 2–3 exists with every step open to grades 2–3",
       await pg.evaluate("SE.plans.stepsOf(SE.plans.template('tpl-coding-foundations-23')).every(s => SE.activityById[s.activityId].grades.includes('2-3'))") and "Coding Foundations: Grades 2–3" in await pg.inner_text("#app h1"))

    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
