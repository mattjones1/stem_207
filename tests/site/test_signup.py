# Educator sign-up: confirm-password field, no autocorrect on passwords, and sign-in with the
# same password afterward. Also checks the role-aware "home" labels.
#   python3 tests/site/test_signup.py [local_url]
import asyncio, sys, time
from playwright.async_api import async_playwright
S = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    pg = await b.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(300)
    await pg.goto(S + "#/signup"); await pg.wait_for_timeout(300)
    attrs = await pg.eval_on_selector_all("input[type=password]", "els=>els.map(e=>[e.id,e.getAttribute('autocapitalize'),e.getAttribute('autocorrect'),e.getAttribute('spellcheck')])")
    ok("sign-up has two password fields, no auto-capitalize or autocorrect", len(attrs) == 2 and all(a[1:] == ["off", "off", "false"] for a in attrs), attrs)
    email = f"t{int(time.time())}@school.org"
    await pg.fill("#su-name", "Ms. Test"); await pg.fill("#su-email", email); await pg.fill("#su-pw", "Lighthouse207"); await pg.fill("#su-pw2", "lighthouse207")
    await pg.click("#su-form button[type=submit]"); await pg.wait_for_timeout(400)
    ok("mismatched passwords are caught before the account exists", "don't match" in await pg.inner_text("#su-pw2-err") and pg.url.endswith("#/signup") and not await pg.evaluate(f"!!SE.store.currentUser()"))
    await pg.fill("#su-pw2", ""); await pg.click("#su-form button[type=submit]"); await pg.wait_for_timeout(300)
    ok("an empty confirm field asks to type it again", "second time" in await pg.inner_text("#su-pw2-err"))
    await pg.fill("#su-pw2", "Lighthouse207"); await pg.click("#su-form button[type=submit]"); await pg.wait_for_timeout(800)
    ok("matching passwords create the account", "#/teach" in pg.url, pg.url)
    nav = await pg.inner_text("#site-nav")
    ok("educator nav: Dashboard, Learning Plans, Activities, Classes, Checks", all(t in nav for t in ["Dashboard", "Learning Plans", "Activities", "Classes", "Checks"]) and "Mission" not in nav, nav)
    ok("no Projector button", await pg.locator("#projector-toggle").count() == 0)
    await pg.click("[data-signout]"); await pg.wait_for_timeout(500)
    await pg.goto(S + "#/signin/educator"); await pg.wait_for_timeout(300)
    await pg.fill("#edu-email", email); await pg.fill("#edu-pw", "Lighthouse207"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(800)
    ok("signs back in with the same password", "#/teach" in pg.url, pg.url)
    await pg.goto(S + "#/nowhere"); await pg.wait_for_timeout(300)
    ok("not-found page says Back to Dashboard", "Back to Dashboard" in await pg.inner_text("#app"))
    await pg.click("[data-signout]"); await pg.wait_for_timeout(400)
    await pg.evaluate("SE.store.startGuest()"); await pg.goto(S + "#/library"); await pg.wait_for_timeout(400)
    ok("the old #/library address goes to Activities", pg.url.endswith("#/activities"), pg.url)
    nav = await pg.inner_text("#site-nav")
    ok("guest nav says Home and Activities", "Home" in nav and "Activities" in nav and "Dashboard" not in nav and "Mission" not in nav, nav)
    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
