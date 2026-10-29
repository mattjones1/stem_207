# Web Builder Lab (lab-web.js): typing updates a sandboxed preview, Check reads what the browser really
# rendered (CSS included), each mistake is named, right pages win, scripts and outside requests are
# blocked, links don't open, and the Web development group appears on the Coding page.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/labs/test_web_builder.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def level(pg, n):
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(120)
    await pg.goto(S + f"#/lab/web-builder/{n}"); await pg.wait_for_timeout(500)
async def won(pg):
    await pg.wait_for_timeout(250)
    return await pg.locator("#lab-win:not([hidden])").count() == 1
async def feedback(pg): return (await pg.inner_text("#lab-feedback")).strip()
async def code(pg, text):
    await pg.fill("#wb-code", text); await pg.wait_for_timeout(450)
async def check(pg):
    await pg.click("#wb-check"); await pg.wait_for_timeout(300)

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []; outside = []
    pg = await b.new_page(viewport={"width": 1366, "height": 650})
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    pg.on("request", lambda r: outside.append(r.url) if r.url.startswith("http") and "localhost" not in r.url and "fonts." not in r.url else None)
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await pg.evaluate("SE.store.startGuest(); localStorage.setItem('stem207.devPlan', 'educator')")
    frame = lambda: pg.frame_locator("#wb-frame")

    # Level 1: an empty headline, then a real one, live in the preview.
    await level(pg, 1)
    await check(pg)
    ok("an empty headline is refused", "empty" in await feedback(pg), await feedback(pg))
    await code(pg, "<h1>Welcome to Bar Harbor</h1>")
    ok("the preview updates as you type", await frame().locator("h1").inner_text() == "Welcome to Bar Harbor")
    await check(pg)
    ok("a real headline wins", await won(pg))

    # Level 3: the link needs https and real words; clicking it in the preview doesn't navigate.
    await level(pg, 3)
    await check(pg)
    ok("a link without https is refused with its address", "www.lighthouses.example" in await feedback(pg), await feedback(pg))
    await code(pg, '<h1>Plan a visit</h1><p>Learn more: <a href="https://lighthouses.example">click here</a></p>')
    await check(pg)
    ok("\"click here\" is refused", "click here" in await feedback(pg), await feedback(pg))
    await code(pg, '<h1>Plan a visit</h1><p>Learn more: <a href="https://lighthouses.example">Maine lighthouse guide</a></p>')
    await frame().locator("a").click(); await pg.wait_for_timeout(200)
    ok("clicking a link in the preview says where it would go instead of opening it", "would go to: https://lighthouses.example" in await feedback(pg) and await frame().locator("h1").count() == 1, await feedback(pg))
    await check(pg)
    ok("a clear https link wins", await won(pg))

    # Level 4: alt text.
    await level(pg, 4)
    await check(pg)
    ok("a picture with no alt is refused", "no alt text" in await feedback(pg), await feedback(pg))
    ok("the lab's picture shows (built in, no outside request)", await frame().locator("img").evaluate("i => i.complete && i.naturalWidth > 0"))
    await code(pg, '<h1>Our lighthouse</h1><img src="lighthouse.svg" alt="image">')
    await check(pg)
    ok("alt=\"image\" is refused", '"image"' in await feedback(pg), await feedback(pg))
    await code(pg, '<h1>Our lighthouse</h1><img src="lighthouse.svg" alt="A white lighthouse with red stripes by the sea">')
    await check(pg)
    ok("descriptive alt text wins", await won(pg))

    # Level 6: contrast is read from the CSS the browser applied.
    await level(pg, 6)
    await pg.wait_for_timeout(300)
    ok("the contrast number shows under the preview", "to 1" in await pg.inner_text("#wb-stats"))
    await check(pg)
    ok("low contrast is refused with the student's ratio", "contrast of 1." in await feedback(pg), await feedback(pg))
    await code(pg, "<style>body { background: #fdf6e3; color: #012d2b; }</style><h1>Fog Report</h1><p>Thick fog this morning.</p>")
    await check(pg)
    ok("readable colors win", await won(pg))

    # Safety: scripts don't run, outside images don't load.
    await level(pg, 8)
    await code(pg, '<h1 id="t">Safe</h1><script>document.getElementById("t").textContent = "ran"</script><img src="https://example.com/x.png" alt="outside picture test">')
    ok("scripts never run in the preview", await frame().locator("h1").inner_text() == "Safe")
    ok("no outside request is made", not outside, outside)

    # Level 8: a full page ships.
    await code(pg, """<style>body { background: #fdf6e3; color: #012d2b; } h1 { color: #037872; }</style>
<h1>Moose Point Bakery</h1><p>Fresh blueberry muffins every morning.</p>
<ul><li>Muffins</li><li>Whoopie pies</li><li>Bread</li></ul>
<p><a href="https://bakery.example/menu">See the bakery menu</a></p>
<img src="lobster-boat.svg" alt="A lobster boat in the harbor near the bakery">""")
    await check(pg)
    ok("a complete, accessible page ships", await won(pg), await feedback(pg))
    ok("code is kept on the device for the level", "Moose Point" in (await pg.evaluate("localStorage.getItem('stem207.web.7')") or ""))

    # The Web development group shows on Coding.
    await pg.goto(S + "#/activities/coding"); await pg.wait_for_timeout(500)
    ok("the Web development group now appears on the Coding page", "Web development" in await pg.evaluate("document.querySelector('main').textContent"))

    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
