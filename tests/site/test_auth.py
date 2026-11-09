# Signing in: exactly two ways in (Student, Educator), no guest access, the student's 3-step sign-in unchanged,
# and educator sign-in and sign-up. Local mode: two doors, old guest sessions cleared, signed-out pages go to
# sign in, students and educators sign in and out. All data is made up for the test.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js
#   python3 tests/site/test_auth.py [local_url]
import asyncio, sys, time
from playwright.async_api import async_playwright
L = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)

async def go(pg, url, wait=400):
    await pg.goto(url.split("#")[0] + "#/signin"); await pg.wait_for_timeout(100); await pg.goto(url); await pg.wait_for_timeout(wait)
async def text(pg): return await pg.inner_text("#app")

async def student_signin(pg, S, pics=("pine", "lighthouse", "moon")):
    await go(pg, S + "#/signin/student", 300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in pics: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(900)

async def local(b):
    errs = []
    pg = await b.new_page(viewport={"width": 1366, "height": 650})
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(L); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)

    # Two ways in, nothing else
    await go(pg, L + "#/signin")
    doors = await pg.eval_on_selector_all(".door strong", "els => els.map(e => e.textContent.trim())")
    ok("the sign-in page has exactly two doors: student and educator", doors == ["I'm a student", "I'm an educator"], doors)
    t = await text(pg)
    ok("no guest option anywhere on sign in", "guest" not in t.lower() and await pg.locator("#guest-btn").count() == 0, t)
    ok("Create an educator account is still offered", await pg.locator('#app a[href="#/signup"]').count() == 1)
    ok("guest sessions can't be started any more", await pg.evaluate("typeof SE.store.startGuest") == "undefined")

    # An old guest session from before this change is cleared and lands on sign in
    await pg.evaluate("localStorage.setItem('stem-explorers:session', JSON.stringify({ role: 'guest' }))")
    await pg.goto(L + "#/activities"); await pg.reload(); await pg.wait_for_timeout(500)
    ok("an old guest session lands on sign in", pg.url.endswith("#/signin"), pg.url)
    ok("an old guest session is removed from storage", await pg.evaluate("localStorage.getItem('stem-explorers:session')") is None)
    ok("no one is signed in", await pg.evaluate("SE.store.currentUser()") is None)
    await pg.evaluate("localStorage.setItem('stem-explorers:session', JSON.stringify({ role: 'admin', id: 'x' }))"); await pg.reload(); await pg.wait_for_timeout(400)
    ok("a made-up role is cleared too", await pg.evaluate("localStorage.getItem('stem-explorers:session')") is None)

    # Signed out: protected pages go to sign in
    for h in ["#/", "#/activities", "#/activity/sort-the-catch", "#/lab/dance-party/1", "#/me", "#/plans", "#/teach", "#/teach/classes", "#/moxie"]:
      await go(pg, L + h)
      ok(f"signed out at {h} goes to sign in", pg.url.endswith("#/signin"), pg.url)

    # Student: the same three steps
    await go(pg, L + "#/signin/student", 300)
    steps = await pg.eval_on_selector_all(".stepper li", "els => els.map(e => e.textContent.trim())")
    ok("student sign-in still has its three steps", len(steps) == 3 and all(k in " ".join(steps) for k in ["Class code", "Your name", "Secret pictures"]), steps)
    await pg.fill("#class-code", "NOPE99"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(300)
    ok("a wrong class code is refused kindly", "couldn't find that class" in await pg.inner_text("#code-err"))
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    ok("the class code shows that class's names", await pg.locator(".name-btn").count() > 0 and await pg.locator("text=Ava R.").count() == 1)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    ok("picture step greets the student and shows the pictures", "Tap your 3 secret pictures" in await text(pg) and await pg.locator(".pic-btn").count() >= 9)
    for x in ["moon", "lighthouse", "pine"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(500)
    ok("the right pictures in the wrong order are refused", "don't match" in await pg.inner_text("#pic-err") and pg.url.endswith("#/signin/student"))
    await pg.wait_for_timeout(500)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(900)
    u = await pg.evaluate("SE.store.currentUser()")
    ok("the right pictures in order sign Ava in to her Home", u and u["role"] == "student" and u["displayName"] == "Ava R." and pg.url.endswith("#/"), pg.url)
    ok("the student's progress is there", await pg.evaluate("SE.game.profile(SE.store.currentUser().id).xp") > 0)
    await go(pg, L + "#/teach")
    ok("a student can't open teacher pages", pg.url.endswith("#/") and await pg.evaluate("SE.store.currentUser().role") == "student")
    await pg.click("[data-signout]"); await pg.wait_for_timeout(500)
    ok("sign out goes to sign in and clears the session", pg.url.endswith("#/signin") and await pg.evaluate("SE.store.currentUser()") is None)

    # Educator: wrong password, right password, sign-up
    await go(pg, L + "#/signin/educator", 300)
    await pg.fill("#edu-email", "demo@stem207.example"); await pg.fill("#edu-pw", "not-the-password"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(500)
    ok("a wrong password is refused", "doesn't match" in await pg.inner_text("#edu-pw-err") and pg.url.endswith("#/signin/educator"))
    ok("the button is ready again after a refusal", await pg.is_enabled("#edu-form button[type=submit]") and await pg.inner_text("#edu-form button[type=submit]") == "Sign in")
    await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(900)
    ok("the right password signs the educator in", pg.url.endswith("#/teach") and await pg.evaluate("SE.store.currentUser().role") == "educator")
    await pg.click("[data-signout]"); await pg.wait_for_timeout(500)
    email = f"t{int(time.time())}@school.test"
    await go(pg, L + "#/signup", 300)
    await pg.fill("#su-name", "Ms. Test"); await pg.fill("#su-email", email); await pg.fill("#su-pw", "Harbor-Light-207"); await pg.fill("#su-pw2", "Harbor-Light-207")
    await pg.click("#su-form button[type=submit]"); await pg.wait_for_timeout(700)
    ok("educator sign-up still works", "#/teach/classes/" in pg.url, pg.url)
    await pg.click("[data-signout]"); await pg.wait_for_timeout(500)
    ok("local: no page errors", not errs, errs)
    await pg.close()

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch()
    await local(b)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
