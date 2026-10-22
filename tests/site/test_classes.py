# Classes and the Dashboard (usability Stage 3): one Dashboard for every class, a Classes page
# (add, archive, restore), and each class's own page (rename, archive, delete with a typed name,
# roster, sign-in cards). Archived classes can't be used to sign in. Local mode (sample class).
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/site/test_classes.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def go(pg, h):
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(150); await pg.goto(S + h); await pg.wait_for_timeout(500)

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    ctx = await b.new_context(viewport={"width": 1280, "height": 900}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await pg.goto(S + "#/signin/educator"); await pg.wait_for_timeout(300); await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(900)

    # Dashboard: all classes, no class dropdown, no 14-day chart.
    await go(pg, "#/teach")
    ok("Dashboard heading", (await pg.inner_text("#app h1")).strip() == "Dashboard")
    ok("no class dropdown in the header", await pg.locator("#class-switch").count() == 0)
    ok("no 14-day chart", await pg.locator(".colchart").count() == 0)
    ok("Dashboard lists the classes, current plans, and check-ins", all([await pg.locator(sel).count() == 1 for sel in ["#dash-classes", "#dash-plans", "#dash-attn"]]))
    acts = await pg.inner_text(".dash-actions")
    ok("quick actions: Checks, New Learning Plan, Add a class", all(t in acts for t in ["Checks", "New Learning Plan", "Add a class"]))

    # Classes page: add a class, then open it. (The old #/teach/class address lands here.)
    await go(pg, "#/teach/class")
    ok("old #/teach/class goes to Classes", pg.url.endswith("#/teach/classes"), pg.url)
    n0 = await pg.locator(".dash-classes > li").count()
    await pg.fill("#nc-name", "Room 9"); await pg.click("#new-class button[type=submit]"); await pg.wait_for_timeout(600)
    ok("adding a class opens its page", "#/teach/classes/" in pg.url and "Room 9" in await pg.inner_text("#app h1"))
    cid = pg.url.split("#/teach/classes/")[1]
    ok("class page shows its sign-in code", await pg.locator(".code-chip").count() == 1)
    await pg.locator("[data-add-students]").first.click(); await pg.fill("#ms-names", "Kai M."); await pg.click("#ms-add"); await pg.wait_for_timeout(400); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
    ok("add a student on the class page", "Kai M." in await pg.inner_text(".login-cards"))
    await pg.fill("#cr-name", "Room 9 Science"); await pg.click("#rename-class button[type=submit]"); await pg.wait_for_timeout(400)
    ok("rename the class", "Room 9 Science" in await pg.inner_text("#app h1"))
    code = await pg.evaluate(f"SE.store.classById('{cid}').code")

    # Archive: hidden from the list and from student sign-in; restore brings it back.
    await pg.click("#archive-class"); await pg.wait_for_timeout(400)
    ok("archived class shows a banner", "Archived." in await pg.inner_text("#app"))
    ok("archived class leaves the active list", await pg.evaluate(f"!SE.store.classesFor(SE.store.currentUser().id).some(c => c.id === '{cid}')"))
    ok("an archived class's code can't be used to sign in", await pg.evaluate(f"SE.store.findClass('{code}').then(r => r === null)"))
    await go(pg, "#/teach/classes")
    ok("Classes page: archived section with Restore", await pg.locator("#archived-title").count() == 1 and await pg.locator(f'[data-restore="{cid}"]').count() == 1)
    await pg.locator("details:has(#archived-title) summary").click()
    await pg.click(f'[data-restore="{cid}"]'); await pg.wait_for_timeout(400)
    ok("restore puts it back", await pg.locator(".dash-classes > li").count() == n0 + 1 and await pg.evaluate(f"SE.store.findClass('{code}').then(r => !!r)"))

    # Delete: needs the exact class name, then removes the class and its students.
    await go(pg, f"#/teach/classes/{cid}")
    await pg.click("#delete-open"); await pg.wait_for_timeout(300)
    await pg.fill("#del-confirm", "room 9"); await pg.click("#delete-yes"); await pg.wait_for_timeout(300)
    ok("delete refuses the wrong name", "Type Room 9 Science exactly" in await pg.inner_text("#del-err") and await pg.evaluate(f"!!SE.store.classById('{cid}')"))
    await pg.fill("#del-confirm", "Room 9 Science"); await pg.click("#delete-yes"); await pg.wait_for_timeout(500)
    ok("delete removes the class and its students", await pg.evaluate(f"!SE.store.classById('{cid}') && !SE.store.studentsIn('{cid}').length") and pg.url.endswith("#/teach/classes"))

    # The sample class page has the roster, journey, messages, and labs.
    demo = await pg.evaluate("SE.store.classesFor(SE.store.currentUser().id).find(c => c.isDemo).id")
    await go(pg, f"#/teach/classes/{demo}")
    ok("sample class page: roster, journey, messages, login cards", await pg.locator("table.roster").count() == 1 and await pg.locator(".cjourney").count() == 1 and await pg.locator("#msg-form").count() == 1 and await pg.locator(".login-card").count() == 8)
    sid = await pg.evaluate(f"SE.store.studentsIn('{demo}')[0].id")
    await go(pg, f"#/teach/student/{sid}")
    ok("student page links back to its class", await pg.locator(f'a[href="#/teach/classes/{demo}"]').count() >= 1)
    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    for h in ["#/teach", "#/teach/classes", f"#/teach/classes/{demo}"]:
        await m.goto(S + h); await m.wait_for_timeout(500)
        ok(f"phone: {h} has no sideways scroll", await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.close()
    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
