# Cyber Defender Lab (lab-cyber.js) and the Cyber Defender crew: the wheel turns with buttons (no dragging),
# wrong answers are refused with feedback, right ones win, the passphrase meter updates as you type and the
# passphrase is never logged, phishing and sharing are played by tapping, plus the crew template and patch.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/labs/test_cyber_defender.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def level(pg, n):
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(120)
    await pg.goto(S + f"#/lab/cyber-defender/{n}"); await pg.wait_for_timeout(500)
async def won(pg):
    await pg.wait_for_timeout(200)
    return await pg.locator("#lab-win:not([hidden])").count() == 1
async def feedback(pg): return (await pg.inner_text("#lab-feedback")).strip()

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    pg = await b.new_page(viewport={"width": 1366, "height": 650})
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await pg.evaluate("SE.store.startGuest(); localStorage.setItem('stem207.devPlan', 'educator')")

    # Level 1: decode with the wheel.
    await level(pg, 1)
    ok("every level says it's practice and made up", "Practice only" in await pg.inner_text(".cy"))
    for _ in range(3): await pg.click("#cy-up")
    ok("the wheel turns with the arrow buttons", "Shift 3" in await pg.inner_text(".cy-k") and await pg.evaluate("document.activeElement.id") == "cy-up")
    await pg.fill("#cy-text", "meet at the duck"); await pg.click("#cy-check")
    ok("a wrong letter is refused and named", "Letter 14" in await feedback(pg), await feedback(pg))
    await pg.fill("#cy-text", "meet at the dock"); await pg.click("#cy-check")
    ok("the decoded message wins", await won(pg))

    # Level 3: crack by trying shifts; the wheel shows the try.
    await level(pg, 3)
    for _ in range(7): await pg.click("#cy-up")
    ok("at the right shift the message reads clearly", "FOG ROLLING IN" in await pg.inner_text(".cy-try"))
    await pg.fill("#cy-text", "FOG ROLLING IN"); await pg.click("#cy-check")
    ok("the cracked message wins", await won(pg))

    # Level 4: passphrase meter, never logged.
    await level(pg, 4)
    await pg.fill("#cy-text", "boat12"); await pg.wait_for_timeout(100)
    ok("the meter updates as you type", "Weak" in await pg.inner_text("#cy-meter"), await pg.inner_text("#cy-meter"))
    await pg.click("#cy-check")
    ok("a weak passphrase is refused with the meter's reason", "6 characters" in await feedback(pg), await feedback(pg))
    await pg.fill("#cy-text", "maple-rocket-tuba-cloud")
    ok("a long random passphrase rates strong", "Strong" in await pg.inner_text("#cy-meter"))
    await pg.click("#cy-check")
    ok("a strong passphrase wins", await won(pg))
    logged = await pg.evaluate("JSON.stringify(localStorage)")
    ok("the passphrase is never saved", "maple-rocket" not in logged and "boat12" not in logged)

    # Level 5: phishing, by tapping.
    await level(pg, 5)
    msgs = await pg.evaluate("SE.cyber.MESSAGES.map((m) => [m.id, m.phish, m.clue || ''])")
    await pg.click('[data-mark="m1"][data-v="phish"]'); await pg.click("#cy-check")
    ok("an unfinished inbox is refused", "isn't marked yet" in await feedback(pg) or "Look again" in await feedback(pg), await feedback(pg))
    for mid, ph, clue in msgs:
        await pg.click(f'[data-mark="{mid}"][data-v="{"phish" if ph else "safe"}"]')
        if ph: await pg.click(f'[data-clue="{mid}"][data-v="{clue}"]')
    ok("choices show as pressed", await pg.get_attribute('[data-mark="m2"][data-v="phish"]', "aria-pressed") == "true")
    await pg.click("#cy-check")
    ok("the sorted inbox with clues wins", await won(pg), await feedback(pg))

    # Level 6: share or not.
    await level(pg, 6)
    for sid, v in await pg.evaluate("SE.cyber.SHARE.map((s) => [s.id, s.ok])"):
        await pg.click(f'[data-mark="{sid}"][data-v="{v}"]')
    await pg.click("#cy-check")
    ok("the right sharing choices win", await won(pg))

    # The crew and patch.
    ok("the Cyber Defender crew template has 4 activities", await pg.evaluate("SE.plans.stepsOf(SE.plans.template('tpl-crew-cyber')).length") == 4)
    earned = await pg.evaluate("""(() => {
      const ids = ['lab-cyber-defender', 'secret-substitution', 'defender-plan'];
      const ev = ids.flatMap((id, i) => [{ type: 'mission_completed', studentId: 'x', at: 1000 + i * 10, data: { activityId: id, evidence: 'written', reflection: 'ok' } },
        { type: 'teacher_confirmed', studentId: 'x', at: 1001 + i * 10, by: 't', data: { activityId: id, how: 'work' } }]);
      return !!SE.game.profile('x', ev).patches.find((p) => p.patch.id === 'crew-cyber').earned;
    })()""")
    ok("the Cyber Defender patch comes with 3 crew passes", earned)

    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
