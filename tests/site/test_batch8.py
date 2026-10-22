# The one check for every activity (usability Stage 2; this replaces the old coding-pathway test).
# Students send a reflection; the teacher marks Pass (XP earned) or Try again (note required, reopens).
# Checks is one queue across classes with the "How checks work" guide. The coding pathway is a Learning
# Plan template now, and its old addresses redirect.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/site/test_batch8.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def go(pg, h):
    await pg.goto(S + "#/library"); await pg.wait_for_timeout(150); await pg.goto(S + h); await pg.wait_for_timeout(500)
async def educator(pg):
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await pg.goto(S + "#/signin/educator"); await pg.wait_for_timeout(300); await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(800)
async def student(pg):
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    ctx = await b.new_context(viewport={"width": 1280, "height": 900}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)

    # Old coding-pathway and AI-route addresses redirect by role.
    await educator(pg)
    for old, new in [("#/pathway", "#/teach/plans/tpl-coding-foundations"), ("#/teach/pathway", "#/teach/plans/tpl-coding-foundations"), ("#/ai-route", "#/teach/plans/tpl-ai-route")]:
        await go(pg, old)
        ok(f"educator: {old} goes to the template", pg.url.endswith(new), pg.url)
    await go(pg, "#/teach/plans/tpl-coding-foundations")
    ok("Coding Foundations template has the 24 coding activities", await pg.locator(".pw-step").count() == 24)
    await go(pg, "#/activities/coding")
    ok("Coding category points educators to the template", await pg.locator('a[href="#/teach/plans/tpl-coding-foundations"]').count() == 1)

    # Checks page: one flow, the queue matches the data.
    await go(pg, "#/teach/checks")
    g = pg.locator("#checks-guide")
    ok("guide: open, one flow of four steps", await g.get_attribute("open") is not None and await g.locator(".cg-flow").count() == 1 and await g.locator(".cg-step").count() == 4)
    gt = await g.inner_text()
    ok("guide: Pass earns XP, Try again needs a note", all(x in gt for x in ["Pass", "Try again", "Only your Pass earns XP"]))
    expected = await pg.evaluate("""(() => { const u = SE.store.currentUser(); let n = 0;
      SE.store.classesFor(u.id).forEach(c => SE.game.classSummary(c.id).profiles.forEach(({ prof }) =>
        Object.keys(prof.missions).forEach(id => { const a = SE.activityById[id]; if (a && SE.game.statusFor(prof, a).state === 'submitted') n++; })));
      return n; })()""")
    shown = await pg.locator(".mission-log > li").count()
    ok("queue lists every sent reflection that's waiting", shown == expected and shown > 0, (shown, expected))
    ok("each waiting item has Pass and Try again, open", await pg.locator(".mission-log details.check-act[open]").count() == shown and await pg.locator(".mission-log button[value=confirm]").count() == shown)
    badge = await pg.inner_text('#site-nav a[href="#/teach/checks"]')
    ok("top menu shows the waiting count", str(expected) in badge, badge)
    # Pass the first one: XP earned once, item leaves the queue.
    first = pg.locator(".mission-log > li").first
    form = first.locator("form[data-check-student]")
    sid = await form.get_attribute("data-check-student"); aid = await form.get_attribute("data-check-activity")
    x0 = await pg.evaluate(f"SE.game.profile('{sid}').xp")
    await form.locator("button[value=confirm]").click(); await pg.wait_for_timeout(500)
    x1 = await pg.evaluate(f"SE.game.profile('{sid}').xp")
    gain = await pg.evaluate(f"SE.game.profile('{sid}').passes.find(p => p.activity.id === '{aid}').xp")
    ok("Pass earns the activity's XP", x1 - x0 == gain and gain >= 150, (x0, x1, gain))
    ok("the passed item leaves the queue", await pg.locator(".mission-log > li").count() == shown - 1)
    # Try again needs a note, then reopens the activity.
    nxt = pg.locator(".mission-log > li").first.locator("form[data-check-student]")
    sid2 = await nxt.get_attribute("data-check-student"); aid2 = await nxt.get_attribute("data-check-activity")
    await nxt.locator("button[value=again]").click(); await pg.wait_for_timeout(200)
    ok("Try again needs a note", "Add a short note" in await nxt.locator(".form__error").inner_text())
    await nxt.locator("input[name=note]").fill("Show the block you changed."); await nxt.locator("button[value=again]").click(); await pg.wait_for_timeout(500)
    ok("Try again reopens it (status tryagain, no XP)", await pg.evaluate(f"SE.game.statusFor(SE.game.profile('{sid2}'), SE.activityById['{aid2}']).state") == "tryagain")
    await pg.check("#show-reviewed"); await pg.wait_for_timeout(400)
    ok("'checked recently' lists the pass and the try again", "Passed" in await pg.inner_text(".checked-list") and "Try again" in await pg.inner_text(".checked-list"))
    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    await m.goto(S + "#/teach/checks"); await m.wait_for_timeout(500)
    ok("phone: Checks has no sideways scroll", await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.close()

    # Student side: the short guide on every activity, statuses in words, no XP for sending.
    await student(pg)
    await go(pg, "#/pathway")
    ok("student: #/pathway goes to My Learning Plans", pg.url.endswith("#/plans"), pg.url)
    aid3 = await pg.evaluate("(()=>{const p=SE.game.profile(SE.store.currentUser().id); return STEM.activities.find(a=>!p.sentIds.has(a.id)&&a.launch.status==='ready').id})()")
    await go(pg, f"#/activity/{aid3}")
    sg = pg.locator(".cg--student")
    ok("activity page: short 'How checks work' with 3 steps", await sg.count() == 1 and await sg.locator(".cg-step").count() == 3)
    ok("activity page: XP is promised on a pass, not on sending", "when your teacher passes it" in await pg.inner_text(".block--debrief"))
    x = await pg.evaluate("SE.game.profile(SE.store.currentUser().id).xp")
    await pg.fill("#d-reflect", "I put the steps in order and tested them."); await pg.click("#debrief-form button[type=submit]"); await pg.wait_for_timeout(500)
    ok("sending: overlay says Sent, no XP added", "Sent to your teacher" in await pg.inner_text(".celebrate") and await pg.evaluate("SE.game.profile(SE.store.currentUser().id).xp") == x)
    await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
    ok("status reads Sent", await pg.evaluate(f"SE.game.statusFor(SE.game.profile(SE.store.currentUser().id), SE.activityById['{aid3}']).label") == "Sent")
    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
