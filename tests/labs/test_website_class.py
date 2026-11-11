# STEM 207 Website Builder with a class (wb-share.js, views-websites.js, SE.store.website*): a student's website is
# saved for their teacher as they work (never with personal information in it), follows them to another device,
# can be handed in and shared, and shows in the class gallery only after the teacher approves it, with kind
# feedback buttons. Local mode (the sample class); the same store API runs on Supabase with update-13.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/labs/test_website_class.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
LAB = "website-builder"

async def as_student(pg):
    await pg.evaluate("SE.store.signOut && SE.store.signOut()"); await pg.wait_for_timeout(200)
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(700)
async def as_teacher(pg):
    await pg.evaluate("SE.store.signOut && SE.store.signOut()"); await pg.wait_for_timeout(200)
    await pg.evaluate("SE.store.signInEducator(SE.store.DEMO.email, SE.store.DEMO.password)"); await pg.wait_for_timeout(300)
async def go(pg, h, wait=900):
    await pg.goto(S + "#/library"); await pg.wait_for_timeout(120); await pg.goto(S + h); await pg.wait_for_timeout(wait)
async def more(pg, item):
    # Wait for the studio to finish mounting (the lesson is drawn last), then open More tools and make sure it opened.
    await pg.wait_for_selector(".wl", timeout=20000)
    for _ in range(3):
        if not await pg.locator("#wb-more-menu").is_visible(): await pg.click("#wb-more")
        try: await pg.locator(item).wait_for(state="visible", timeout=3000); break
        except Exception: await pg.wait_for_timeout(300)
    await pg.click(item)
async def class_id(pg): return await pg.evaluate("SE.store.classesFor(SE.store.currentUser().id).find((c) => c.isDemo).id")
async def mine(pg): return await pg.evaluate("SE.store.websiteMine()")

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    pg = await (await b.new_context(viewport={"width": 1366, "height": 768}, reduced_motion="reduce")).new_page()
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(S); await pg.evaluate("localStorage.clear(); sessionStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)

    # The teacher: the sample class has a website in the gallery and one asking to share
    await as_teacher(pg)
    cid = await class_id(pg)
    await go(pg, f"#/teach/classes/{cid}")
    sec = await pg.inner_text("#class-websites")
    ok("the class page lists student websites", "Puffins of Maine" in sec and "In the gallery" in sec, sec[:300])
    ok("a request to share waits for the teacher", await pg.locator("#class-websites .webq [data-web-approve]").count() == 1 and "Darius" in await pg.inner_text("#class-websites .webq"))
    await pg.locator('#class-websites [data-web-open="stu_demo_2"]').first.click(); await pg.wait_for_timeout(300)
    dlg = await pg.inner_text("dialog[open]")
    ok("opening a handed-in website shows the page, the Human Touch answers, the note, and Print", await pg.locator("dialog[open] .webm__f").count() == 1 and "puffin facts" in dlg and "Great facts" in await pg.input_value("#webm-note-t") and await pg.locator("dialog[open] [data-web-print]").count() == 1, dlg[:200])
    await pg.fill("#webm-note-t", "Wonderful diving fact!"); await pg.click("#webm-note button[type=submit]")
    ok("a note saves", "Note saved" in await pg.inner_text("#webm-msg"))
    await pg.click("dialog[open] [data-modal-close]"); await pg.wait_for_timeout(300)
    await pg.locator("#class-websites .webq [data-web-approve]").click(); await pg.wait_for_timeout(300)
    ok("approving moves it into the gallery", await pg.locator("#class-websites .webq").count() == 0 and (await pg.inner_text("#class-websites")).count("In the gallery") == 2)

    # The student: the website is saved for the teacher as she works
    await as_student(pg)
    await pg.evaluate("""(() => { const id = SE.store.currentUser().id; const r = SE.wbComposer.build({ kind: 'animals', idea: 'Loons on Maine lakes', name: 'Loon Lake', sections: [{ id: 'facts', more: 'Loons dive deep.' }, { id: 'about' }], style: 'nature' });
      localStorage.setItem('stem207.wb.' + id, JSON.stringify({ answers: {}, q: 7, v1: { html: r.html, css: r.css, title: r.title }, files: { html: r.html, css: r.css }, title: r.title, reflect: { right: 'It used my loon facts', wrong: 'It guessed a picture', changed: 'I added a fact' } })); })()""")
    await go(pg, f"#/lab/{LAB}/1", 3500)
    ok("the studio says it's saved for the teacher", "Saved for your teacher" in await pg.inner_text("#wb-sync"), await pg.inner_text("#wb-sync"))
    w = await mine(pg)
    ok("the teacher's copy is the student's website", w and w["title"] == "Loon Lake" and "Loons dive deep" in w["html"])
    html = await pg.input_value("#wb-html")
    await pg.fill("#wb-html", html.replace("</main>", "  <p>The lake office: 207-555-0142</p>\n</main>")); await pg.wait_for_timeout(3200)
    ok("personal information stops the save, and says what it is", "phone number" in await pg.inner_text("#wb-sync") and await pg.locator("#wb-sync-find").count() == 1, await pg.inner_text("#wb-sync"))
    ok("so the phone number never left the device", "555-0142" not in (await mine(pg))["html"])
    await pg.click("#wb-sync-find"); await pg.wait_for_timeout(150)
    sel = await pg.evaluate("(() => { const t = document.getElementById('wb-html'); return t.value.slice(t.selectionStart, t.selectionEnd); })()")
    ok("Find it selects it in the code", "555-0142" in sel, sel)
    await pg.fill("#wb-html", html.replace("</main>", "  <p>Loons can stay underwater for a minute.</p>\n</main>")); await pg.wait_for_timeout(3200)
    ok("once it's out, the website saves again", "underwater" in (await mine(pg))["html"] and "Saved for your teacher" in await pg.inner_text("#wb-sync"))

    # Hand in and share (More tools)
    await more(pg, "#wb-share"); await pg.wait_for_timeout(400)
    ok("Hand in or share opens with both choices", await pg.locator("dialog[open] #wbh-handin").count() == 1 and await pg.locator("dialog[open] #wbh-share").count() == 1)
    await pg.click("dialog[open] #wbh-handin"); await pg.wait_for_timeout(400)
    ok("handing in says so", "Handed in" in await pg.inner_text("dialog[open]"))
    await pg.click("dialog[open] #wbh-share"); await pg.wait_for_timeout(400)
    ok("asking to share waits for the teacher", "Waiting for your teacher" in await pg.inner_text("dialog[open]") and (await mine(pg))["gallery"] == "requested")
    await pg.click("dialog[open] #wbh-gallery")
    await pg.wait_for_selector("dialog[open] .wbg__card", timeout=15000); await pg.wait_for_timeout(800)   # let the previews finish loading
    g = await pg.inner_text("dialog[open]")
    ok("the class gallery shows only approved websites", "Puffins of Maine" in g and "Lobster Boat Club" in g and "Loon Lake" not in g, g[:300])
    btn = pg.locator('dialog[open] [data-kudos="stu_demo_2"][data-kind="design"]')
    before = int(await btn.locator(".wbg__n").inner_text())
    await btn.click(); await pg.wait_for_timeout(250)
    ok("a kind feedback button counts once and shows it's pressed", await btn.get_attribute("aria-pressed") == "true" and int(await btn.locator(".wbg__n").inner_text()) == before + 1)
    await btn.click(); await pg.wait_for_timeout(250)
    ok("and tapping again takes it back", await btn.get_attribute("aria-pressed") == "false" and int(await btn.locator(".wbg__n").inner_text()) == before)
    await pg.keyboard.press("Escape")

    # A newer copy from another device: the student chooses
    await pg.evaluate("SE.store.websiteSave({ title: 'Loon Lake', html: '<main><h1>Loon Lake</h1><p>Saved on the library Chromebook.</p></main>', css: 'body { color: #1d2426; }' })")
    await go(pg, f"#/lab/{LAB}/2", 1500)
    ok("a newer copy from another device is offered", await pg.locator("#wb-newer:not([hidden])").count() == 1, await pg.inner_text("#wb-newer"))
    await pg.click("#wb-newer-use"); await pg.wait_for_timeout(300)
    ok("Use the newer copy puts it in the editor (this device's copy goes to Versions)", "library Chromebook" in await pg.input_value("#wb-html") and await pg.evaluate("JSON.parse(localStorage.getItem('stem207.wb.' + SE.store.currentUser().id)).versions.some((v) => /before using the newer/.test(v.label))"))
    await go(pg, f"#/lab/{LAB}/2", 1500)
    ok("after choosing, it doesn't ask again", await pg.locator("#wb-newer:not([hidden])").count() == 0)

    # A brand-new device: nothing on it yet, so the saved website comes along
    await pg.evaluate("localStorage.removeItem('stem207.wb.' + SE.store.currentUser().id)")
    await go(pg, f"#/lab/{LAB}", 1500)
    ok("a new device picks up the website from the class account", "came from your class account" in await pg.inner_text("#app"))
    await go(pg, f"#/lab/{LAB}/1", 1500)
    ok("and the studio opens it", "library Chromebook" in await pg.input_value("#wb-html"))

    # The teacher sees the hand-in and the request, and approves it
    await as_teacher(pg)
    await go(pg, f"#/teach/classes/{cid}")
    row = await pg.locator("#class-websites tr", has_text="Ava R.").inner_text()
    ok("the teacher sees the student's website as handed in", "Loon Lake" in row and "changed since" in row, row)
    ok("and the request to share", "Ava" in await pg.inner_text("#class-websites .webq"))
    await pg.locator('#class-websites .webq [data-web-open]').click(); await pg.wait_for_timeout(300)
    ok("Look first shows the copy the student asked to share, with her answers", "underwater" in await pg.evaluate("document.querySelector('dialog[open] .webm__f').srcdoc") and "loon facts" in await pg.inner_text("dialog[open]"))
    await pg.click("dialog[open] [data-web-approve]"); await pg.wait_for_timeout(400)
    await as_student(pg)
    await go(pg, f"#/lab/{LAB}/1", 1200)
    await more(pg, "#wb-gallery"); await pg.wait_for_timeout(500)
    ok("after approval, the student's own website is in the gallery, marked (you), with no buttons to press", "Loon Lake" in await pg.inner_text("dialog[open]") and "(you)" in await pg.inner_text("dialog[open]") and await pg.locator('dialog[open] [data-kudos="stu_demo_0"]:disabled').count() == 3)
    await pg.keyboard.press("Escape")
    ok("no page errors", not errs, errs[:3])
    await b.close()
  print(f"\n{sum(R)}/{len(R)} passed"); sys.exit(0 if all(R) else 1)

asyncio.run(main())
