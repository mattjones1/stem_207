# Chromebook target: a school Chromebook at 1366x768, 100% scaling, leaves about 1366x650 of page.
# Checks the short-screen layout (page top, sign-in pictures, Home, every lab's stage and main button),
# the student activity bar, the Moxie upload note, the IT link, no sideways scroll, and speed at 6x CPU slowdown.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/site/test_chromebook.py [url]
import asyncio, statistics, sys
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
W, H = 1366, 650
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def go(pg, h, wait=500):
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(150); await pg.goto(S + h); await pg.wait_for_timeout(wait)

LABS = ["dance-party/1", "dance-party/5", "space-blob/1", "moon-gate/1", "robot-chef/1", "rover/1", "field-station/1",
        "pattern-machine/1", "launcher/1", "line-follower/1", "ramp-racers/1", "pixel-studio/1"]
# The stage's main button (Run / Test / Check), its position, and the page top.
LAB = """() => { const q = (s) => document.querySelector(s); const rb = (e) => e && e.getBoundingClientRect();
  const stage = q('.lab-stage'); const btn = stage && (stage.querySelector('.btn--launch') || stage.querySelector('button'));
  const s = rb(stage), b = rb(btn);
  return { stageTop: s ? Math.round(s.top) : null, btn: btn ? (btn.id || btn.textContent.trim().slice(0, 16)) : null,
           btnBottom: b ? Math.round(b.bottom) : null, vh: innerHeight }; }"""
TOP = "Math.round(document.querySelector('.cobrand-bar').getBoundingClientRect().height + document.querySelector('.site-header').getBoundingClientRect().height)"
SIDEWAYS = "document.documentElement.scrollWidth > innerWidth"

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    ctx = await b.new_context(viewport={"width": W, "height": H}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)

    # The page top: compact brand row plus the pinned menu.
    ok("page top (brand row + menu) <= 104px", await pg.evaluate(TOP) <= 104, await pg.evaluate(TOP))
    ok("pinned menu <= 54px", await pg.evaluate("document.querySelector('.site-header').offsetHeight") <= 54)
    ok("Coliseum logo stays >= 190px wide", await pg.evaluate("document.querySelector('.cobrand-bar img').getBoundingClientRect().width") >= 189)

    # Student sign-in: all 9 pictures and the slots fit on one screen.
    await go(pg, "#/signin/student", 300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    last = await pg.evaluate("Math.round(Math.max(...[...document.querySelectorAll('[data-pic]')].map(e => e.getBoundingClientRect().bottom)))")
    ok("sign-in: all 9 pictures are on screen", await pg.locator("[data-pic]").count() == 9 and last <= H, last)
    ok("sign-in: pictures are large enough to tap (>= 64px)", await pg.evaluate("Math.min(...[...document.querySelectorAll('[data-pic]')].map(e => e.getBoundingClientRect().height))") >= 64)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)

    # Home: the Up next button is above the fold.
    up = await pg.evaluate("(() => { const e = document.querySelector('#upnext .btn--launch'); return e ? Math.round(e.getBoundingClientRect().bottom) : 9999; })()")
    ok("Home: Up next button is on the first screen", up <= H - 40, up)

    # Every lab: the stage and its main button are visible on load.
    for l in LABS:
      await go(pg, "#/lab/" + l, 800)
      m = await pg.evaluate(LAB)
      ok(f"lab {l}: stage and '{m['btn']}' on screen", m["stageTop"] is not None and m["stageTop"] >= 0 and m["btnBottom"] is not None and m["btnBottom"] <= m["vh"], m)
      hint = await pg.evaluate("Math.round(document.querySelector('#lab-hint-btn').getBoundingClientRect().bottom)")
      ok(f"lab {l}: Need a hint? on screen", hint <= H, hint)

    # Activity page (student): sections fold after the first visit, and the bar jumps to the debrief.
    await go(pg, "#/activity/sort-the-catch")
    ok("activity: first visit opens What you'll learn", await pg.evaluate("document.querySelector('#s-learn').closest('details').open"))
    ok("activity: action bar is on screen", await pg.locator(".act-bar").count() == 1 and await pg.evaluate("document.querySelector('.act-bar').getBoundingClientRect().bottom") <= H)
    await pg.locator(".act-bar .btn--primary").click(); await pg.wait_for_timeout(1200)   # smooth scroll
    ok("activity: the bar jumps to Show what you know", await pg.evaluate("(() => { const r = document.querySelector('#s-debrief').getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; })()") and "#/activity/sort-the-catch" in pg.url)
    await go(pg, "#/activity/sort-the-catch")
    ok("activity: later visits fold the background sections", await pg.evaluate("['s-learn', 's-before'].every(id => !document.getElementById(id).closest('details').open)"))

    student_pages = ["#/", "#/activities", "#/activities/coding", "#/activity/sort-the-catch", "#/plans", "#/base", "#/lab/dance-party/1", "#/lab/field-station/1"]
    for h in student_pages:
      await go(pg, h, 400)
      ok(f"student {h}: no sideways scroll", not await pg.evaluate(SIDEWAYS))

    # Educator: the Dashboard's IT link, the Moxie upload note, and no sideways scroll.
    await pg.evaluate("SE.store.signOut && SE.store.signOut()"); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await go(pg, "#/signin/educator", 300); await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(900)
    await go(pg, "#/teach")
    ok("Dashboard links the IT allowlist", await pg.locator('.dash-cb a[href*="CHROMEBOOK_IT_ALLOWLIST"]').count() == 1)
    await go(pg, "#/activity/moxie-01")
    ok("Moxie session 1: Chromebook upload note", "On a Chromebook?" in await pg.inner_text("#app"))
    await go(pg, "#/moxie/teach")
    ok("Moxie teacher page: upload station note", "upload station" in await pg.inner_text("#app"))
    for h in ["#/teach", "#/teach/classes", "#/teach/checks", "#/plans", "#/moxie", "#/moxie/teach", "#/activity/moxie-01", "#/activity/sort-the-catch"]:
      await go(pg, h, 400)
      ok(f"educator {h}: no sideways scroll", not await pg.evaluate(SIDEWAYS))

    # A smaller Chromebook (1280x720 at 100%): still no sideways scroll, and Dance Party's Run is on screen.
    await pg.set_viewport_size({"width": 1280, "height": 593})
    for h in ["#/teach", "#/activities", "#/activity/sort-the-catch"]:
      await go(pg, h, 400)
      ok(f"1280x593 {h}: no sideways scroll", not await pg.evaluate(SIDEWAYS))
    await go(pg, "#/lab/dance-party/1", 800)
    m = await pg.evaluate(LAB)
    ok("1280x593 Dance Party: Run on screen", m["btnBottom"] is not None and m["btnBottom"] <= m["vh"], m)

    # Speed on a low-end CPU (6x slowdown): median of 5 route changes.
    await pg.set_viewport_size({"width": W, "height": H})
    cdp = await ctx.new_cdp_session(pg); await cdp.send("Emulation.setCPUThrottlingRate", {"rate": 6})
    for route, limit in [("#/activities", 800), ("#/activities/coding", 800), ("#/lab/rover/1", 800)]:
      xs = []
      for _ in range(5):
        await pg.goto(S + "#/teach"); await pg.wait_for_timeout(300)
        xs.append(await pg.evaluate(f"""(async () => {{ const t0 = performance.now(); location.hash = '{route}'; await new Promise(r => setTimeout(r, 0));
          await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return Math.round(performance.now() - t0); }})()"""))
      ok(f"6x CPU: {route} renders in <= {limit}ms", statistics.median(xs) <= limit, f"median {statistics.median(xs)} {xs}")
    await cdp.send("Emulation.setCPUThrottlingRate", {"rate": 1})

    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
