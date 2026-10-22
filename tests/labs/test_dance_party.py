# Browser test for Robot Dance Party: the basics (levels 1–4) and the Go deeper levels 5–8 (loops, debugging, fewest blocks).
# Serve the app in local mode first:  LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js
# Then run:  python3 tests/labs/test_dance_party.py [http://localhost:8767/]   (needs: pip install playwright)
import asyncio
from playwright.async_api import async_playwright
S="http://localhost:8767/"; import os, sys; S=sys.argv[1] if len(sys.argv)>1 else S; O=os.environ.get("SHOTS","/tmp/")
results=[]
def ok(name, cond, extra=""):
    results.append((name, bool(cond))); print(("PASS " if cond else "FAIL ")+name, extra)
async def prog(pg): return await pg.eval_on_selector_all("#dp-list .dp-step", "els=>els.map(e=>e.className.match(/dp-step--(\\w+)/)[1])")
async def add(pg, *moves):
    for m in moves: await pg.click(f'[data-add="{m}"]')
async def run_done(pg):
    await pg.click("#dp-run")
    await pg.wait_for_function("!document.querySelector('.dp').classList.contains('is-running')", timeout=20000)
    await pg.wait_for_timeout(150)
async def fb(pg): return await pg.inner_text("#lab-feedback")
async def robot_x(pg): return await pg.evaluate("getComputedStyle(document.getElementById('dp-robot')).getPropertyValue('--x').trim()")
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); errs=[]
    def watch(pg):
        pg.on("pageerror", lambda e: errs.append(str(e)))
    pg=await b.new_page(viewport={"width":1280,"height":900}); watch(pg)
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400); await pg.click("text=Look around as a guest"); await pg.wait_for_timeout(400)
    # ── Level 1: predict + run (guest)
    await pg.goto(S+"#/lab/dance-party/1"); await pg.wait_for_timeout(500)
    ok("L1 starts with 3-step example", await prog(pg)==["right","jump","spin"], await prog(pg))
    await pg.click("#dp-run"); await pg.wait_for_timeout(200)
    ok("L1 run blocked until predictions made", "predictions first" in await fb(pg), await fb(pg))
    await pg.click('[data-predict="first"][data-move="right"]'); await pg.click('[data-predict="last"][data-move="pose"]')
    await pg.click("#dp-run"); await pg.wait_for_timeout(250)
    a1 = await pg.get_attribute("#dp-list .dp-step:nth-child(1)","aria-current")
    ok("step 1 highlighted while running", a1=="step" and await pg.locator("#dp-list .is-active").count()==1)
    ok("Run locked during run", await pg.get_attribute("#dp-run","aria-disabled")=="true")
    await pg.evaluate("document.getElementById('dp-run').click()")  # real click during the run (Playwright's click would wait for it to be enabled)
    seen=[]
    for _ in range(40):
        i = await pg.evaluate("(()=>{const a=document.querySelector('#dp-list .is-active');return a?Number(a.dataset.i):-1})()")
        if not seen or seen[-1]!=i: seen.append(i)
        if i==-1 and len(seen)>1: break
        await pg.wait_for_timeout(100)
    ok("steps highlighted in order 1,2,3 exactly once (no overlap)", seen==[0,1,2,-1], seen)
    await pg.wait_for_timeout(200)
    ok("robot moved one square right (2→3)", await robot_x(pg)=="3", await robot_x(pg))
    f=await fb(pg)
    ok("prediction feedback specific", "Move right first. Correct" in f and "final step was Spin" in f, f)
    ok("L1 win panel shown", await pg.is_visible("#lab-win"))
    await pg.screenshot(path=O+"l1-done.png", full_page=True)
    # ── Reset robot
    await pg.click("#dp-reset"); await pg.wait_for_timeout(100)
    ok("Reset robot returns to middle", await robot_x(pg)=="2")
    # ── Level 2: swap
    await pg.goto(S+"#/lab/dance-party/2"); await pg.wait_for_timeout(400)
    await run_done(pg)
    ok("L2 unchanged order not accepted", "still the original order" in await fb(pg), await fb(pg))
    await pg.click('[data-op="up"][data-i="2"]'); await pg.wait_for_timeout(100)
    ok("move up swaps steps 2 and 3", await prog(pg)==["right","spin","jump"], await prog(pg))
    foc = await pg.evaluate("document.activeElement.dataset.op+':'+document.activeElement.dataset.i")
    ok("focus follows moved step", foc=="up:1", foc)
    await pg.click('[data-op="up"][data-i="1"]'); await pg.wait_for_timeout(100)
    foc = await pg.evaluate("document.activeElement.dataset.op+':'+document.activeElement.dataset.i")
    ok("move to top; focus falls back to enabled button", await prog(pg)==["spin","right","jump"] and foc=="down:0", f"{await prog(pg)} {foc}")
    await pg.click('[data-op="down"][data-i="0"]')
    ok("move down works", await prog(pg)==["right","spin","jump"])
    await pg.click('[data-op="remove"][data-i="1"]')
    ok("remove works", await prog(pg)==["right","jump"])
    await run_done(pg)
    ok("L2 changed instruction set rejected", "Keep the same three" in await fb(pg), await fb(pg))
    await pg.click("#dp-example"); ok("Reset level restores example", await prog(pg)==["right","jump","spin"])
    await pg.click('[data-op="down"][data-i="0"]')  # jump,right,spin
    await run_done(pg)
    f=await fb(pg)
    ok("L2 swap + run wins with comparison", await pg.is_visible("#lab-win") and "started with Jump" in f, f)
    # Reset mid-run
    await pg.click("#dp-run"); await pg.wait_for_timeout(1100)
    await pg.click("#dp-reset"); await pg.wait_for_timeout(1500)
    ok("Reset mid-run stops the dance", await pg.locator("#dp-list .is-active").count()==0 and await pg.get_attribute("#dp-run","aria-disabled") is None and await robot_x(pg)=="2")
    # ── Level 3: five steps, edges
    await pg.goto(S+"#/lab/dance-party/3"); await pg.wait_for_timeout(400)
    ok("L3 starts empty", await prog(pg)==[])
    await run_done(pg); ok("empty program message", "Add at least one move" in await fb(pg))
    await add(pg,"left","left","left","jump")
    await run_done(pg)
    ok("L3 four steps -> asks for 1 more", "Add 1 more" in await fb(pg), await fb(pg))
    ok("robot stays inside floor at left edge (x=0)", await robot_x(pg)=="0", await robot_x(pg))
    now = await pg.inner_text("#dp-now")
    await add(pg,"pose")
    await pg.click("#dp-run"); edge=""
    for _ in range(60):
        t_ = await pg.inner_text("#dp-now")
        if "edge" in t_: edge=t_; break
        await pg.wait_for_timeout(80)
    await pg.wait_for_function("!document.querySelector('.dp').classList.contains('is-running')", timeout=20000)
    ok("edge note shown when moving past edge", "edge" in edge, edge)
    ok("L3 five steps wins", await pg.is_visible("#lab-win"), await fb(pg))
    await pg.click("#dp-clear"); ok("Clear program empties list", await prog(pg)==[] and await pg.locator(".dp-empty").count()==1)
    # ── Level 4: challenge feedback
    await pg.goto(S+"#/lab/dance-party/4"); await pg.wait_for_timeout(400)
    cases=[(["spin","jump","pose"],"spins before it jumps"),(["jump","spin"],"never strikes a pose"),(["jump","pose","spin"],"must finish with the pose"),(["pose","spin"],"never jumps"),(["right","left"],"never jumps or spins")]
    for moves, want in cases:
        await pg.click("#dp-clear"); await add(pg,*moves); await run_done(pg)
        f=await fb(pg); ok(f"challenge feedback {moves}", want in f and not await pg.is_visible("#lab-win"), f)
    ok("feedback never states the full answer", all("Jump, Spin, Strike a pose" not in x for x in [await fb(pg)]))
    # hints progressive
    await pg.click("#lab-hint-btn"); h1=await pg.is_visible('[data-hint="0"]'); h2=await pg.is_visible('[data-hint="1"]')
    await pg.click("#lab-hint-btn"); h2b=await pg.is_visible('[data-hint="1"]')
    ok("hints reveal one at a time", h1 and not h2 and h2b)
    await pg.click("#dp-clear"); await add(pg,"jump","spin","pose"); await run_done(pg)
    ok("challenge solved from executed sequence", await pg.is_visible("#lab-win") and "exactly right" in await fb(pg), await fb(pg))
    await pg.screenshot(path=O+"l4-done.png", full_page=True)
    # unit rules
    r = await pg.evaluate("""[SE.dance.check(3,['left','jump','spin','pose']).ok, SE.dance.check(3,['jump','spin','pose','pose']).ok, SE.dance.check(3,['jump','spin','pose','jump']).ok, SE.dance.check(3,['spin','jump','spin','pose']).ok, SE.dance.check(1,['jump','spin','right']).ok, SE.dance.check(2,['jump','jump','jump','jump','jump']).ok]""")
    ok("rule matrix", r==[True,True,False,True,True,True], r)
    # keyboard
    await pg.click("#dp-clear"); await pg.focus('[data-add="spin"]'); await pg.keyboard.press("Enter"); await pg.keyboard.press("Space")
    ok("keyboard adds steps", await prog(pg)==["spin","spin"])
    ol = await pg.evaluate("getComputedStyle(document.activeElement).outlineStyle")
    await pg.keyboard.press("Tab")
    ol2 = await pg.evaluate("getComputedStyle(document.activeElement).outlineStyle")
    ok("visible focus outline", "solid" in (ol+ol2), f"{ol} {ol2}")
    # ── Go deeper (grades 4–6): levels 5–8
    r = await pg.evaluate("""[SE.dance.expand(['pose',{repeat:2,body:['jump','spin']}]).join(), SE.dance.blocks(['pose',{repeat:2,body:['jump','spin']}]),
      SE.dance.check(4,[{repeat:3,body:['jump','spin']},'pose']).ok, SE.dance.check(4,['jump','spin','jump','spin','jump','spin','pose']).ok,
      SE.dance.check(5,SE.dance.BUGGY).ok, SE.dance.check(6,[{repeat:3,body:['left','jump','right','spin']}]).ok, SE.dance.check(6,SE.dance.T7).ok,
      SE.dance.check(7,[{repeat:4,body:['left','jump','right']}]).ok, SE.dance.check(7,[{repeat:2,body:['jump']}]).ok]""")
    ok("Go deeper rule matrix (expand, blocks, levels 5–8)", r==["pose,jump,spin,jump,spin",4,True,False,False,True,False,True,False], r)
    await pg.goto(S+"#/lab/dance-party/5"); await pg.wait_for_timeout(500)
    ok("L5: in the Go deeper chapter", "Go deeper" in await pg.inner_text("#app"))
    ok("L5: target dance of 7 moves and a Repeat button", await pg.locator(".dp-target__move").count()==7 and await pg.locator("#dp-addrep").count()==1)
    await add(pg,"jump","spin","jump","spin","jump","spin","pose"); await run_done(pg)
    f=await fb(pg); ok("L5: the long way matches but asks for a Repeat", "use a Repeat block" in f and not await pg.is_visible("#lab-win"), f)
    await pg.click("#dp-clear"); await pg.click("#dp-addrep")
    ok("L5: a new Repeat takes the next moves", await pg.get_attribute('[data-op="into"][data-i="0"]', "aria-pressed")=="true" and "inside the Repeat at step 1" in await pg.inner_text("#dp-into"))
    await add(pg,"jump","spin"); await pg.click('[data-op="more"][data-i="0"]')
    ok("L5: + raises the repeat count to 3", (await pg.inner_text(".dp-rep__n")).strip()=="3")
    await pg.click('[data-op="into"][data-i="0"]'); await add(pg,"pose")
    ok("L5: count shows 4 blocks · 7 moves", "4 blocks · 7 moves" in await pg.inner_text("#dp-count"), await pg.inner_text("#dp-count"))
    await pg.click("#dp-run"); seen_time=""
    for _ in range(80):
        t_ = await pg.inner_text("#dp-now")
        if "time 2 of 3" in t_: seen_time=t_; break
        await pg.wait_for_timeout(60)
    await pg.wait_for_function("!document.querySelector('.dp').classList.contains('is-running')", timeout=20000); await pg.wait_for_timeout(150)
    ok("L5: the trace names the loop pass (time 2 of 3)", "Repeat 3 times, time 2 of 3" in seen_time, seen_time)
    f=await fb(pg); ok("L5: wins with the repeat", await pg.is_visible("#lab-win") and "7 moves from only 4 blocks" in f, f)
    # L6: fix the bug
    await pg.goto(S+"#/lab/dance-party/6"); await pg.wait_for_timeout(500)
    await run_done(pg); f=await fb(pg)
    ok("L6: names the first wrong move with the student's own move", "Move 4 should be Spin, but your robot did Strike a pose" in f, f)
    await pg.click('[data-op="more"][data-i="1"]'); await run_done(pg); f=await fb(pg)
    ok("L6: after one fix, points to the next bug", "Move 5 should be Move left" in f and not await pg.is_visible("#lab-win"), f)
    await pg.click('[data-op="down"][data-i="2"]'); await run_done(pg)
    ok("L6: fixed program wins", await pg.is_visible("#lab-win") and "Bug fixed" in await fb(pg), await fb(pg))
    # L7: fewest blocks
    await pg.goto(S+"#/lab/dance-party/7"); await pg.wait_for_timeout(500)
    ok("L7: starts with the 12-block long version", "12 blocks · 12 moves" in await pg.inner_text("#dp-count"))
    await run_done(pg); f=await fb(pg)
    ok("L7: same dance, too many blocks, says the count", "you used 12 blocks" in f, f)
    await pg.click("#dp-clear"); await pg.click("#dp-addrep"); await add(pg,"left","jump","right","spin")
    await pg.click("[data-add=pose]"); f=await fb(pg)
    ok("L7: a Repeat holds at most 4 moves", "up to 4 moves" in f, f)
    await pg.click('[data-op="more"][data-i="0"]'); await run_done(pg)
    ok("L7: 5 blocks wins", await pg.is_visible("#lab-win") and "5 blocks" in await fb(pg), await fb(pg))
    # L8: keyboard only, then the Scratch handoff
    await pg.goto(S+"#/lab/dance-party/8"); await pg.wait_for_timeout(500)
    await pg.focus("#dp-addrep"); await pg.keyboard.press("Enter")
    for m in ["left","jump","right"]:
        await pg.focus(f'[data-add="{m}"]'); await pg.keyboard.press("Enter")
    await pg.focus('[data-op="more"][data-i="0"]'); await pg.keyboard.press("Enter"); await pg.keyboard.press("Enter")
    ok("L8: keyboard builds Repeat 4 with 3 moves", "4 blocks · 12 moves" in await pg.inner_text("#dp-count"), await pg.inner_text("#dp-count"))
    await pg.focus("#dp-run"); await pg.keyboard.press("Enter")
    await pg.wait_for_function("!document.querySelector('.dp').classList.contains('is-running')", timeout=20000); await pg.wait_for_timeout(200)
    ok("L8: wins, with the Scratch handoff", await pg.is_visible("#lab-win") and await pg.locator('#lab-win a[href="#/activity/loop-dance"]').count()==1 and await pg.locator('#lab-win a[href="assets/starters/dance-crew.sb3"]').count()==1)
    await pg.screenshot(path=O+"l8-done.png", full_page=True)
    await pg.goto(S+"#/lab/dance-party/7"); await pg.wait_for_timeout(300); await pg.goto(S+"#/lab/dance-party/8"); await pg.wait_for_timeout(500)
    await pg.click("#dp-clear")
    for _ in range(2):
        await pg.click("#dp-addrep"); await add(pg,"left","jump","right","spin")
    for i in range(2):
        await pg.click(f'[data-op="more"][data-i="{i}"]'); await pg.click(f'[data-op="more"][data-i="{i}"]')
    await pg.click("#dp-run"); await pg.wait_for_timeout(200)
    ok("L8: too many moves is refused before running", "up to 24" in await fb(pg) and await pg.get_attribute("#dp-run","aria-disabled") is None, await fb(pg))
    # ── Signed-in student: logs, one run per click
    st=await b.new_page(viewport={"width":1280,"height":900}); watch(st)
    await st.goto(S+"#/signin/student"); await st.wait_for_timeout(300)
    await st.fill("#class-code","MOOSE7"); await st.click("#code-form button[type=submit]"); await st.wait_for_timeout(400)
    await st.click("text=Ava R."); await st.wait_for_timeout(200)
    for x in ["pine","lighthouse","moon"]: await st.click(f"[data-pic={x}]")
    await st.wait_for_timeout(800)
    await st.goto(S+"#/lab/dance-party/4"); await st.wait_for_timeout(400)
    await add(st,"jump","right","spin","pose")
    await st.click("#dp-run"); await st.wait_for_timeout(200); await st.evaluate("document.getElementById('dp-run').click(); document.getElementById('dp-run').click()")
    await st.wait_for_function("!document.querySelector('.dp').classList.contains('is-running')", timeout=20000)
    runs = await st.evaluate("SE.store.eventsFor(SE.store.currentUser().id).filter(e=>e.type==='lab_test_run'&&e.data.labId==='dance-party').length")
    done = await st.evaluate("JSON.stringify(SE.store.eventsFor(SE.store.currentUser().id).filter(e=>e.type==='lab_level_completed'&&e.data.labId==='dance-party').map(e=>e.data.result.program))")
    ok("triple-click Run = one run logged", runs==1, runs)
    ok("completion saved with the executed program", done=='[["jump","right","spin","pose"]]', done)
    await st.goto(S+"#/activity/lab-dance-party"); await st.wait_for_timeout(400)
    ok("mission page exists", "Robot Dance Party" in await st.inner_text("h1"))
    # teacher note on educator view
    t=await b.new_page(viewport={"width":1280,"height":900}); watch(t)
    await t.goto(S+"#/signin/educator"); await t.wait_for_timeout(300); await t.click("#fill-demo"); await t.click("#edu-form button[type=submit]"); await t.wait_for_timeout(800)
    await t.goto(S+"#/activity/lab-dance-party"); await t.wait_for_timeout(400)
    txt = await t.inner_text("#app")
    ok("teacher note: objective, misconception, question", "Learning objective" in txt and "Common misconception" in txt and "Ask afterward" in txt)
    await t.screenshot(path=O+"teacher-page.png", full_page=True)
    ok("educator can add it to a Learning Plan", await t.locator('a[href="#/teach/plans/new/lab-dance-party"]').count()>=1)
    # ── reduced motion + mobile
    rm=await b.new_page(viewport={"width":390,"height":844}, reduced_motion="reduce"); watch(rm)
    await rm.goto(S); await rm.wait_for_timeout(300); await rm.click("text=Look around as a guest"); await rm.wait_for_timeout(300)
    await rm.goto(S+"#/lab/dance-party/4"); await rm.wait_for_timeout(400)
    await add(rm,"jump","spin","pose")
    await rm.click("#dp-run"); await rm.wait_for_timeout(250)
    an = await rm.evaluate("getComputedStyle(document.querySelector('.dp-robot__body')).animationName")
    cap = await rm.inner_text("#dp-caption")
    ok("reduced motion: no animation, caption names the move", an=="none" and "Jump" in cap, f"{an} {cap}")
    await rm.wait_for_function("!document.querySelector('.dp').classList.contains('is-running')", timeout=20000)
    ok("reduced motion run completes and checks", await rm.is_visible("#lab-win"))
    ok("phone: no sideways scroll", await rm.evaluate("document.documentElement.scrollWidth")<=390, await rm.evaluate("document.documentElement.scrollWidth"))
    await rm.goto(S+"#/lab/dance-party/1"); await rm.wait_for_timeout(400); await rm.screenshot(path=O+"m-l1.png", full_page=True)
    await rm.goto(S+"#/lab/dance-party/6"); await rm.wait_for_timeout(400)
    ok("phone: a Repeat block fits with no sideways scroll", await rm.locator(".dp-step--repeat").count()==1 and await rm.evaluate("document.documentElement.scrollWidth")<=390, await rm.evaluate("document.documentElement.scrollWidth"))
    await rm.screenshot(path=O+"m-l6.png", full_page=True)
    ok("no page errors", not errs, errs)
    print(f"\n{sum(1 for _,c in results if c)}/{len(results)} passed")
    await b.close()
asyncio.run(main())
