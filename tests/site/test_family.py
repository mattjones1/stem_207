# Families (views-family.js, store.js, game.js): a parent signs up, subscribes (simulated in local mode),
# adds children (up to 4), and prints sign-in cards. A child signs in with the family code and pictures,
# sends a written answer, and earns XP right away (no teacher). An empty answer earns nothing; a
# classroom student's send still waits for the teacher's Pass.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/site/test_family.py [url]
import asyncio, sys, time
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

    await go(pg, "#/signup", 300)
    await pg.check("input[name=su-kind][value=parent]")
    await pg.fill("#su-name", "Sam Lopez"); email = f"fam{int(time.time())}@home.org"; await pg.fill("#su-email", email); await pg.fill("#su-pw", "Harbor2077"); await pg.fill("#su-pw2", "Harbor2077")
    await pg.click("#su-form button[type=submit]"); await pg.wait_for_timeout(800)
    ok("a parent lands on Family", pg.url.endswith("#/family"))
    nav = await pg.inner_text("#site-nav")
    ok("parent menu: Family, Activities, Account (no classroom items)", all(t in nav for t in ["Family", "Activities", "Account"]) and not any(t in nav for t in ["Dashboard", "Learning Plans", "Checks", "Classes"]), nav)
    ok("a free parent sees what Family adds, no Add a child", "Family plan" in await pg.inner_text("#app") and await pg.locator("#fam-add").count() == 0)

    await go(pg, "#/account"); await pg.click("[data-sim=family]"); await pg.wait_for_timeout(300)
    await go(pg, "#/family")
    ok("with the Family plan: a family code and Add a child", await pg.locator(".code-chip").count() == 1 and await pg.locator("#fam-add").count() == 1)
    for n in ["Mia L.", "Leo L.", "Ana L.", "Ben L."]:
      await pg.fill("#fa-name", n); await pg.click("#fam-add button[type=submit]"); await pg.wait_for_timeout(300)
    fam = await pg.evaluate("SE.store.familyOf(SE.store.currentUser().id)")
    ok("4 children, 4 sign-in cards", await pg.locator(".fam-child").count() == 4 and await pg.locator(".login-card").count() == 4)
    ok("a 5th child is refused (the form is gone, the store says no)", await pg.locator("#fam-add").count() == 0 and not await pg.evaluate(f"SE.store.addStudent('{fam['id']}', {{ displayName: 'Zed L.' }}).ok"))
    ok("sign-in cards say Family code", "Family code" in await pg.inner_text(".login-cards"))
    ok("a family isn't a class (not on the Classes list)", await pg.evaluate("SE.store.classesFor(SE.store.currentUser().id).length") == 0)
    pics = await pg.evaluate(f"SE.store.studentsIn('{fam['id']}').find(s => s.displayName === 'Mia L.').picCode")

    await pg.click("[data-signout]"); await pg.wait_for_timeout(400)
    await go(pg, "#/signin/student", 300)
    await pg.fill("#class-code", fam["code"]); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Mia L."); await pg.wait_for_timeout(200)
    for x in pics: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)
    nav = await pg.inner_text("#site-nav")
    ok("a child signs in with the family code and pictures", "Mia L." in nav)
    ok("child menu: Home, Activities, My harbor (no Learning Plans)", "My Learning Plans" not in nav and "My harbor" in nav)
    ok("child Home has no class journey or teacher wording", await pg.locator(".cjourney").count() == 0 and "Waiting for your teacher" not in await pg.inner_text("#app"))

    await go(pg, "#/activity/loop-dance")
    ok("a child opens a paid activity (the Family plan)", await pg.locator("#debrief-form").count() == 1)
    ok("at home there's no 'Show or tell my teacher'", await pg.locator(".evidence").count() == 0 and "Show or tell" not in await pg.inner_text("#debrief-form"))
    await pg.click("#debrief-form button[type=submit]"); await pg.wait_for_timeout(300)
    ok("an empty answer is refused and earns nothing", "Write your answer first." in await pg.inner_text("#d-err") and await pg.evaluate("SE.game.profile(SE.store.currentUser().id).xp") == 0)
    await pg.fill("#d-reflect", "I put the moves in a repeat block so the dance is shorter.")
    await pg.click("#debrief-form button[type=submit]"); await pg.wait_for_timeout(600)
    xp = await pg.evaluate("SE.game.profile(SE.store.currentUser().id).xp")
    ok("sending the answer earns the XP right away", xp > 0 and "XP" in await pg.inner_text("#cel-title"), xp)
    await go(pg, "#/activity/loop-dance")
    ok("the activity shows Done", "Done" in await pg.inner_text("#s-done"))
    await go(pg, "#/plans"); ok("a child at #/plans goes Home", pg.url.endswith("#/"))
    await go(pg, "#/family"); ok("a child can't open the Family page", not pg.url.endswith("#/family"))

    # The classroom rule is unchanged: a sample-class student's send waits for the teacher.
    await pg.evaluate("localStorage.removeItem('stem207:session')")
    await go(pg, "#/signin/student", 300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)
    xp0 = await pg.evaluate("SE.game.profile(SE.store.currentUser().id).xp")
    await go(pg, "#/activity/snowstorm-clones")
    await pg.fill("#d-reflect", "Clones made the snow fall in many places at once."); await pg.click("#debrief-form button[type=submit]"); await pg.wait_for_timeout(600)
    ok("a classroom send still earns nothing until the teacher's Pass", await pg.evaluate("SE.game.profile(SE.store.currentUser().id).xp") == xp0 and "teacher" in (await pg.inner_text("#cel-title")).lower())

    # The parent sees the child's XP and words.
    await pg.evaluate("localStorage.removeItem('stem207:session')")
    await go(pg, "#/signin/educator", 300)
    await pg.fill("#edu-email", email); await pg.fill("#edu-pw", "Harbor2077"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(800)
    t = await pg.inner_text(".fam-kids")
    ok("the parent's Family page shows the child's XP and what they wrote", "repeat block" in t and str(xp) in t.replace(",", ""))
    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
