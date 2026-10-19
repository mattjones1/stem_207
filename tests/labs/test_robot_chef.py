# Robot Chef lab: pure rules, all five levels through the UI, feedback wording, and phone layout.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/labs/test_robot_chef.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
GOOD = ["open-bag", "take-slices", "open-jar", "pick-knife", "scoop", "spread", "top", "eat"]

async def wait_run(pg):
    for _ in range(60):
        await pg.wait_for_timeout(150)
        if not await pg.is_disabled("#rc-run"): return
async def level(pg, n):
    await pg.goto(S + "#/library"); await pg.wait_for_timeout(150)
    await pg.goto(S + f"#/lab/robot-chef/{n}"); await pg.wait_for_timeout(400)

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    ctx = await b.new_context(viewport={"width": 1280, "height": 900}, reduced_motion="reduce"); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)

    # Pure rules
    r = await pg.evaluate(f"""(() => {{ const C = SE.robotChef, G = {GOOD};
      const k = (ids) => {{ const x = C.run(ids); return x.ok ? 'ok' : x.bug.kind + '@' + x.bug.index; }};
      return [k(C.START[0]), k(C.START[1]), k(C.START[2]), k(C.START[3]), k(G), k([]), k(G.slice(0, 7)), k(['wash', ...G]),
              C.explain(C.START[1], C.run(C.START[1])), C.explain(C.START[2], C.run(C.START[2]))]; }})()""")
    ok("rule: buggy class algorithm fails at step 1, unclear", r[0] == "unclear@0", r[0])
    ok("rule: level 2 start is an order bug at step 1", r[1] == "order@0", r[1])
    ok("rule: level 3 start is a missing step at step 3", r[2] == "missing@2", r[2])
    ok("rule: level 4 start is unclear at step 3", r[3] == "unclear@2", r[3])
    ok("rule: the precise algorithm works", r[4] == "ok")
    ok("rule: empty program and no-eat program end without a sandwich", r[5] == "end@0" and r[6] == "end@7", (r[5], r[6]))
    ok("rule: a harmless extra step is fine", r[7] == "ok")
    ok("feedback names the student's step and hints at order", "Take out two slices of bread." in r[8] and "wrong order" in r[8], r[8])
    ok("feedback names the step and hints a step is missing", "Scoop some spread" in r[9] and "missing" in r[9], r[9])

    # Level 1
    await level(pg, 1)
    ok("L1: question hidden before running", await pg.is_hidden("#rc-q"))
    await pg.click("#rc-run"); await wait_run(pg)
    ok("L1: run stops at step 1 with a bug flag", await pg.locator('.rc-row.is-bug[data-row="0"]').count() == 1)
    ok("L1: robot says what it did", "whole jar" in await pg.inner_text("#lab-feedback"))
    await pg.click('[data-qstep="2"]'); ok("L1: wrong step gets a nudge", "first step marked" in await pg.inner_text("#lab-feedback"))
    await pg.click('[data-qstep="0"]'); await pg.click('[data-qkind="order"]')
    ok("L1: wrong kind explained, no win yet", "still doesn't say how" in await pg.inner_text("#lab-feedback") and await pg.is_hidden("#lab-win"))
    await pg.click('[data-qkind="unclear"]'); await pg.wait_for_timeout(300)
    ok("L1: win after right step and kind", await pg.is_visible("#lab-win"))
    ok("L1: objective and why shown", await pg.locator(".lab-objective").count() == 1)

    # Level 2: fix the order with buttons
    await level(pg, 2)
    await pg.click("#rc-run"); await wait_run(pg)
    ok("L2: unfixed run shows order bug", "wrong order" in await pg.inner_text("#lab-feedback") and await pg.is_hidden("#lab-win"))
    await pg.click('[data-down="0"]'); await pg.click('[data-down="4"]')
    order = await pg.eval_on_selector_all(".rc-row__t", "els=>els.map(e=>e.textContent.trim())")
    ok("L2: Up/Down reorder the steps", order[0].startswith("Open the bread bag") and order[4].startswith("Scoop"), order[:6])
    await pg.click("#rc-run"); await wait_run(pg); await pg.wait_for_timeout(200)
    ok("L2: fixed order wins", await pg.is_visible("#lab-win"))

    # Level 3: add missing steps from the bank
    await level(pg, 3)
    await pg.click('[data-add="wash"]'); n = await pg.locator(".rc-row").count()
    await pg.click(f'[data-del="{n-1}"]')
    ok("L3: add then remove a step", await pg.locator(".rc-row").count() == n - 1)
    await pg.click('[data-add="open-jar"]'); await pg.click('[data-add="pick-knife"]')
    for i in range(6, 2, -1): await pg.click(f'[data-up="{i}"]')
    for i in range(7, 3, -1): await pg.click(f'[data-up="{i}"]')
    order = await pg.eval_on_selector_all(".rc-row__t", "els=>els.map(e=>e.textContent.trim())")
    ok("L3: new steps moved into place", order[2].startswith("Open the jar") and order[3].startswith("Pick up"), order)
    await pg.click("#rc-run"); await wait_run(pg); await pg.wait_for_timeout(200)
    ok("L3: complete algorithm wins", await pg.is_visible("#lab-win"))

    # Level 4: rewrite unclear steps
    await level(pg, 4)
    await pg.click('[data-rewrite="2"]'); await pg.click('[data-pick="2:0"]')
    ok("L4: a vague rewrite is still rewritable", await pg.locator('[data-rewrite="2"]').count() == 1)
    await pg.click("#rc-run"); await wait_run(pg)
    ok("L4: vague rewrite still fails as unclear", "unclear" in await pg.inner_text("#lab-feedback"))
    await pg.click('[data-rewrite="2"]'); await pg.click('[data-pick="2:1"]')
    ok("L4: precise rewrite becomes 4 steps", await pg.locator(".rc-row").count() == 8)
    await pg.click('[data-rewrite="6"]'); await pg.click('[data-pick="6:1"]')
    await pg.click("#rc-run"); await wait_run(pg); await pg.wait_for_timeout(200)
    ok("L4: precise algorithm wins", await pg.is_visible("#lab-win"))

    # Level 5: build it from scratch
    await level(pg, 5)
    ok("L5: starts empty", await pg.locator(".rc-empty").count() == 1)
    await pg.click('[data-add="vague-make"]'); await pg.click("#rc-run"); await wait_run(pg)
    ok("L5: 'Make the sandwich' is unclear", "unclear" in await pg.inner_text("#lab-feedback"))
    await pg.click('[data-del="0"]')
    for sid in GOOD: await pg.click(f'[data-add="{sid}"]')
    await pg.click("#rc-run"); await wait_run(pg); await pg.wait_for_timeout(200)
    ok("L5: written from scratch, robot eats", await pg.is_visible("#lab-win") and "crumbs" in await pg.inner_text("#rc-scene"))
    done = await pg.evaluate("SE.labs.progressFor(SE.game.profile(SE.store.currentUser().id), 'robot-chef').size")
    ok("progress saved for all 5 levels", done == 5, done)
    ok("library entry launches the lab", await pg.evaluate("SE.activityById['lab-robot-chef'].launch.labId === 'robot-chef'"))

    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    for n in [2, 4]:
        await m.goto(S + f"#/lab/robot-chef/{n}"); await m.wait_for_timeout(500)
        if n == 4: await m.click('[data-rewrite="2"]')
        w = await m.evaluate("document.documentElement.scrollWidth")
        ok(f"phone: level {n} has no sideways scroll", w <= 390, w)
    await m.screenshot(path="/tmp/chef-phone.png", full_page=True)
    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
