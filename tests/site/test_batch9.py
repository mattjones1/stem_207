# Batch 9: Today split into "My class" and "On my own", class messages, and assignment instructions,
# in local mode (sample class) and cloud mode (mock Supabase on real Postgres, with update-3 applied).
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; PORT=8787 node tests/backend/mock-supabase.js
#   python3 tests/site/test_batch9.py [local_url] [cloud_url|skip]
import asyncio, sys, time
from playwright.async_api import async_playwright
L = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
C = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:8787/"
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def student_sample(pg, S):
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)
async def switch(pg, S, role):
    await pg.reload(); await pg.wait_for_timeout(500)
    await pg.evaluate("SE.store.signOut && SE.store.signOut()"); await pg.wait_for_timeout(200)
    if role == "student": return await student_sample(pg, S)
    await pg.goto(S + "#/signin/educator"); await pg.wait_for_timeout(300); await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(900)
async def go(pg, url):
    await pg.goto(url.split("#")[0] + "#/library"); await pg.wait_for_timeout(150); await pg.goto(url); await pg.wait_for_timeout(500)

async def local(b):
    S = L; errs = []
    ctx = await b.new_context(viewport={"width": 1280, "height": 900}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await student_sample(pg, S)
    ok("Home is one column with one Up next card", await pg.locator(".home .upnext").count() == 1)
    ok("Home shows only the newest message, older ones folded", (await pg.inner_text(".home-msg__list li >> nth=0")).startswith("This week") and await pg.locator(".home-msg__more").count() == 1)
    assigned = await pg.evaluate("SE.store.assignmentsFor(SE.store.currentUser().classId).map(x=>SE.activityById[x.activityId].title)")
    ok("Up next is an assigned activity", (await pg.inner_text("#upnext-title")) in assigned)
    ok("assignment instructions show on the card", "Bring your flowchart" in await pg.inner_text(".upnext"))
    ok("one I need help button, on the card", await pg.locator("#help-btn").count() == 1 and await pg.locator(".upnext #help-btn").count() == 1)
    before = int((await pg.inner_text(".home-waiting")).split(":")[1].split()[0])
    await pg.evaluate("SE.store.log('mission_completed', { activityId: 'paper-helicopter', evidence: 'show', reflection: '' })"); await go(pg, S + "#/")
    after = int((await pg.inner_text(".home-waiting")).split(":")[1].split()[0])
    ok("a sent activity adds one to Waiting for your teacher", after == before + 1, (before, after))
    await pg.screenshot(path="/tmp/b9-today.png", full_page=True)
    # teacher posts and deletes messages, adds instructions
    await switch(pg, S, "teacher")
    await go(pg, S + "#/teach/classes/" + await pg.evaluate("SE.store.classesFor(SE.store.currentUser().id)[0].id"))
    ok("the class page has Message your class", await pg.locator("#msg-form").count() == 1 and await pg.locator(".msg-list li").count() == 2)
    await pg.click("#msg-form button[type=submit]"); await pg.wait_for_timeout(300)
    ok("an empty message isn't posted", await pg.locator(".msg-list li").count() == 2)
    await pg.fill("#msg-body", "Bring a pencil tomorrow."); await pg.click("#msg-form button[type=submit]"); await pg.wait_for_timeout(400)
    ok("posting adds it to the top of the list", await pg.locator(".msg-list li").count() == 3 and (await pg.inner_text(".msg-list li >> nth=0")).startswith("Bring a pencil"))
    await pg.fill("#msg-body", "Typo message"); await pg.click("#msg-form button[type=submit]"); await pg.wait_for_timeout(300)
    await pg.locator(".msg-list li", has_text="Typo message").locator("[data-msg-del]").click(); await pg.wait_for_timeout(300)
    ok("delete removes a message", await pg.locator(".msg-list li").count() == 3 and "Typo" not in await pg.inner_text(".msg-list"))
    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    await m.goto(S + "#/teach"); await m.wait_for_timeout(500)
    ok("phone: teacher overview has no sideways scroll", await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.close()
    await switch(pg, S, "student")
    ok("student sees the new message first", (await pg.inner_text(".home-msg__list li >> nth=0")).startswith("Bring a pencil"))
    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    await m.goto(S + "#/"); await m.wait_for_timeout(500)
    ok("phone: Home has no sideways scroll", await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.screenshot(path="/tmp/b9-today-m.png", full_page=True)
    ok("local: no page errors", not errs, errs)
    await ctx.close()

async def cloud(b):
    S = C; errs = []; email = f"b9{int(time.time())}@school.org"
    tc = await b.new_context(viewport={"width": 1280, "height": 900}); t = await tc.new_page(); t.on("pageerror", lambda e: errs.append(str(e)))
    await t.goto(S + "#/signup"); await t.wait_for_timeout(400)
    await t.fill("#su-name", "Ms. Rivera"); await t.fill("#su-class", "Room 9"); await t.fill("#su-email", email); await t.fill("#su-pw", "harbor207!"); await t.fill("#su-pw2", "harbor207!")
    await t.click("#su-form button[type=submit]"); await t.wait_for_timeout(1200)
    await t.locator("[data-add-students]").first.click(); await t.fill("#ms-names", "Kai M."); await t.click("#ms-add"); await t.wait_for_timeout(400); await t.keyboard.press("Escape"); await t.wait_for_timeout(300)
    await t.evaluate("""(() => { const c = SE.store.classesFor(SE.store.currentUser().id)[0];
      SE.store.assign(c.id, ['event-party']); SE.store.setAssignmentNote(c.id, 'event-party', 'Use the space key first.');
      SE.store.postMessage(c.id, 'Welcome to Room 9!'); })()""")
    await t.evaluate("SE.store.flush()"); await t.wait_for_timeout(800)
    await t.reload(); await t.wait_for_timeout(1500)
    ok("cloud: teacher's message and instructions persist after reload", await t.evaluate("(()=>{const c=SE.store.classesFor(SE.store.currentUser().id)[0]; return SE.store.messagesFor(c.id).length===1 && SE.store.assignmentFor(c.id,'event-party').note==='Use the space key first.'})()"))
    code = await t.evaluate("SE.store.classesFor(SE.store.currentUser().id)[0].code")
    pc = await t.evaluate("SE.store.studentsIn(SE.store.classesFor(SE.store.currentUser().id)[0].id)[0].picCode")
    sc = await b.new_context(viewport={"width": 1280, "height": 900}); s = await sc.new_page(); s.on("pageerror", lambda e: errs.append(str(e)))
    await s.goto(S + "#/signin/student"); await s.wait_for_timeout(300)
    await s.fill("#class-code", code); await s.click("#code-form button[type=submit]"); await s.wait_for_timeout(500)
    await s.click("text=Kai M."); await s.wait_for_timeout(200)
    for x in pc: await s.click(f"[data-pic={x}]")
    await s.wait_for_timeout(1000)
    cls_text = await s.inner_text(".home")
    ok("cloud: student's device shows the class message", "Welcome to Room 9!" in cls_text, cls_text[:120])
    ok("cloud: student's device shows the assignment instructions", "Use the space key first." in cls_text)
    await t.evaluate("(()=>{const c=SE.store.classesFor(SE.store.currentUser().id)[0]; SE.store.deleteMessage(SE.store.messagesFor(c.id)[0].id)})()")
    await t.evaluate("SE.store.flush()"); await t.wait_for_timeout(600)
    await s.reload(); await s.wait_for_timeout(1500)
    ok("cloud: a deleted message disappears for the student", await s.locator(".home-msg").count() == 0)
    ok("cloud: no page errors", not errs, errs)
    await tc.close(); await sc.close()

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch()
    await local(b)
    if C != "skip": await cloud(b)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
