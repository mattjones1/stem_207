# "Support STEM 207" (SE.donateCard; config.js donate): grown-ups only. Guests see it on Home, educators on
# the Dashboard, and grown-ups get a footer link that opens it in the dialog. Students never see it.
# Until donate.venmo is set it shows a "QR coming soon" placeholder and no button; once set, the button
# goes to https://venmo.com/u/<name> and the QR has alt text.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/site/test_donate.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def go(pg, h, wait=500):
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(120); await pg.goto(S + h); await pg.wait_for_timeout(wait)
SET = "window.STEM207_CONFIG.donate = { venmo: 'stem207-test', qr: 'assets/img/donate-venmo.png' }; SE.route(true)"   # local mode serves its own config.js

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    pg = await b.new_page(viewport={"width": 1366, "height": 650})
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)

    # Guest Home: the placeholder (no Venmo name yet)
    await pg.evaluate("SE.store.startGuest()"); await go(pg, "#/")
    card = pg.locator("#app .donate")
    ok("guest Home shows Support STEM 207", await card.count() == 1 and "Support STEM 207" in await card.inner_text())
    ok("placeholder: 'QR coming soon' and no Venmo button", await pg.locator("#app .donate__qr.is-missing").count() == 1 and await pg.locator("#app .donate a[href*='venmo.com']").count() == 0)
    ok("the card never says tax-deductible", "tax" not in (await card.inner_text()).lower())

    # With a Venmo name set (missing QR image falls back to the placeholder frame)
    await pg.evaluate(SET); await pg.wait_for_timeout(400)
    btn = pg.locator("#app .donate a[href*='venmo.com']")
    ok("set: Donate with Venmo goes to venmo.com/u/<name>", await btn.count() == 1 and await btn.get_attribute("href") == "https://venmo.com/u/stem207-test" and await btn.get_attribute("target") == "_blank")
    ok("set: the QR image has alt text, and the name is written out", await pg.locator("#app .donate__qr img[alt]").count() == 1 and "@stem207-test" in await card.inner_text())
    await pg.wait_for_timeout(300)
    ok("a QR image that won't load falls back to the placeholder frame", await pg.locator("#app .donate__qr.is-missing").count() == 1)

    # Footer link opens the card in the dialog
    await pg.click("#donate-open"); await pg.wait_for_timeout(300)
    ok("footer link opens the card in the dialog", await pg.locator("dialog[open] .donate").count() == 1)
    await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)

    # Student: never
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await go(pg, "#/signin/student", 300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)
    seen = []
    for h in ["#/", "#/activities", "#/me", "#/base", "#/activity/sort-the-catch"]:
      await go(pg, h, 400)
      if await pg.locator(".donate").count(): seen.append(h)
    ok("students never see the donate card", not seen, seen)
    ok("students don't see the footer link", not await pg.locator("#donate-open").is_visible())

    # Educator Dashboard: the compact card in the side column
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await go(pg, "#/signin/educator", 300); await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(900)
    await go(pg, "#/teach")
    ok("educator Dashboard shows the compact card", await pg.locator(".dash-side .donate--compact").count() == 1)
    ok("no sideways scroll on the Dashboard at 1366x650", not await pg.evaluate("document.documentElement.scrollWidth > innerWidth"))

    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
