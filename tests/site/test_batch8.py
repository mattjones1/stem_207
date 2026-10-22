# Batch 8: the educator coding pathway (in sync with the student stages), inline stage checks,
# assigning from the pathway, the "How checks work" guide, and the student's short version.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/site/test_batch8.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    ctx = await b.new_context(viewport={"width": 1280, "height": 900}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await pg.goto(S + "#/signin/educator"); await pg.wait_for_timeout(300)
    await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(800)
    ok("educator nav no longer has a separate coding pathway", await pg.locator('#site-nav a[href="#/teach/pathway"]').count() == 0)
    await pg.goto(S + "#/pathway"); await pg.wait_for_timeout(500)
    ok("#/pathway sends educators to the educator pathway", pg.url.endswith("#/teach/pathway"), pg.url)
    ok("the page is the coding pathway", "Coding pathway" in await pg.inner_text("#app"))
    ok("7 stage cards", await pg.locator(".tstage").count() == 7)
    counts = await pg.evaluate("STEM.pathway.map(s => s.activities.filter(id => SE.activityById[id]).length)")
    shown = await pg.eval_on_selector_all(".tstage", "els=>els.map(e=>e.querySelectorAll('.mlist > li').length)")
    ok("each stage lists the same missions as the pathway data", counts == shown, (counts, shown))
    ok("each stage has what-a-confirm-looks-like and a misconception", await pg.evaluate("[...document.querySelectorAll('.tstage__teach p')].every(p => p.textContent.trim().length > 20)") and await pg.locator(".tstage__teach p").count() == 14)
    ok("mission rows show teacher prep", await pg.locator(".tstage .prep-line").count() >= 20)
    ok("grades 6–8 track tagged on the educator pathway", await pg.locator(".tstage .track-tag").count() == 8)
    g = pg.locator("#checks-guide")
    ok("guide: open, two flows of four steps", await g.get_attribute("open") is not None and await g.locator(".cg-flow").count() == 2 and await g.locator(".cg-step").count() == 8)
    gt = await g.inner_text()
    ok("guide: says only your Confirm clears a stage, and where things happen", all(x in gt for x in ["Only your Confirm clears a stage", "Coding pathway page", "Mission page", "Try again", "Not yet"]))
    # sync with the student view
    t_titles = await pg.eval_on_selector_all(".tstage h2", "els=>els.map(e=>e.textContent.replace(/^Stage \\d+: /,'').trim())")
    t_ican = await pg.eval_on_selector_all(".tstage .ican > span", "els=>els.map(e=>e.textContent.replace('Readiness check: ','').trim())")
    await pg.goto(S + "#/pathway/student"); await pg.wait_for_timeout(500)
    s_titles = await pg.eval_on_selector_all(".stages .stage__card h2", "els=>els.map(e=>e.textContent.replace(/^Stage \\d+: /,'').trim())")
    s_ican = await pg.eval_on_selector_all(".stages .stage__card .ican > span", "els=>els.map(e=>e.textContent.replace('Readiness check: ','').trim())")
    ok("stage titles match the student pathway", t_titles == s_titles, (t_titles[:2], s_titles[:2]))
    ok("“I can” statements match the student pathway", t_ican == s_ican)
    ok("student view preview has a banner and a way back", await pg.locator('.preview-note a[href="#/teach/pathway"]').count() == 1)
    # checks inline on the stage
    made = await pg.evaluate("""(() => { const c = SE.store.classesFor(SE.store.currentUser().id)[0];
      const sum = SE.game.classSummary(c.id); let n = 0;
      for (const { student, prof } of sum.profiles) { if (n >= 2) break;
        const st = [2, 3, 4, 5].find(k => !prof.stages[k]);
        if (st) { SE.store.teacherLog(student.id, 'ican_claimed', { stage: st }); n++; } }
      return n; })()""")
    await pg.goto(S + "#/teach/pathway"); await pg.wait_for_timeout(500)
    q = await pg.locator(".tpath-queue .claims > li").count()
    exp = await pg.evaluate("SE.game.classSummary(SE.store.classesFor(SE.store.currentUser().id)[0].id).profiles.reduce((n,p)=>n+Object.values(p.prof.stages).filter(s=>s.status==='claimed').length,0)")
    ok("checks-waiting queue matches the class data", q == exp and q > 0, (q, exp))
    card = pg.locator(".tstage", has=pg.locator(".tstage__waiting")).first
    sid = await card.get_attribute("id"); st = sid.split("-")[1]
    before = await card.locator(".tchip.is-cleared").inner_text()
    await card.locator("[data-verify]").first.click(); await pg.wait_for_timeout(500)
    after = await pg.locator(f"#{sid} .tchip.is-cleared").inner_text()
    ok("Confirm on a stage card clears it for that student", int(after.split()[0]) == int(before.split()[0]) + 1, (before, after))
    ok("queue shrinks after a confirm", await pg.locator(".tpath-queue .claims > li").count() == q - 1)
    # assign a stage from the pathway
    btn = pg.locator("#tstage-2 [data-assign-many]")
    if await btn.count():
        await btn.click(); await pg.wait_for_timeout(500)
    ok("Assign stage 2 from the pathway", await pg.locator("#tstage-2 .chip--done").count() == 1)
    await pg.goto(S + "#/teach/missions/pathway"); await pg.wait_for_timeout(400)
    ok("Missions tab links to the coding pathway", await pg.locator('.disc-panel__head a[href="#/teach/pathway"]').count() == 1)
    await pg.screenshot(path="/tmp/b8-missions.png")
    await pg.goto(S + "#/teach/pathway"); await pg.wait_for_timeout(400)
    await pg.screenshot(path="/tmp/b8-teach.png", full_page=False)
    await pg.locator("#checks-guide").scroll_into_view_if_needed(); await pg.screenshot(path="/tmp/b8-guide.png")
    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    await m.goto(S + "#/teach/pathway"); await m.wait_for_timeout(500)
    w = await m.evaluate("document.documentElement.scrollWidth")
    ok("phone: educator pathway has no sideways scroll", w <= 390, w)
    await m.close()
    # student side
    await pg.click("[data-signout]"); await pg.wait_for_timeout(500)
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)
    await pg.goto(S + "#/pathway"); await pg.wait_for_timeout(500)
    sg = pg.locator(".cg--student")
    ok("student pathway: short 'How stage checks work' with 4 steps", await sg.count() == 1 and await sg.locator(".cg-step").count() == 4)
    ok("student pathway: no preview banner, no teacher-only notes", await pg.locator(".preview-note").count() == 0 and await pg.locator(".tstage__teach").count() == 0)
    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
