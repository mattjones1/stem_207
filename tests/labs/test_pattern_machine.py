# Pattern Machine Lab: Train the Machine. All 8 stages played through real clicks (wrong paths refused with
# specific feedback, right paths win), the chart's numbers match the model, the report and certificate,
# guest mode, no outside requests, and Chromebook size.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/labs/test_pattern_machine.py [url]
import asyncio, sys, json
from playwright.async_api import async_playwright
S = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8767/"
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, "" if c else x)
L = "#/lab/pattern-machine/"

async def go(pg, n):
    await pg.goto(S + "#/activities/ai"); await pg.wait_for_timeout(150)   # leave first, so the lab re-mounts
    await pg.goto(S + L + str(n)); await pg.wait_for_timeout(450)
async def act(pg, a, i=None):
    sel = f'[data-act="{a}"]' + (f'[data-id="{i}"]' if i is not None else "")
    await pg.locator(sel).first.click(); await pg.wait_for_timeout(120)
async def say(pg): return await pg.inner_text("#lab-feedback")
async def won(pg): return await pg.is_visible("#lab-win")
async def state(pg):
    return await pg.evaluate("""(() => { const k = Object.keys(localStorage).concat(Object.keys(sessionStorage)).find(k => /^stem207\\.pm\\.(?!mode)/.test(k));
      return JSON.parse(localStorage.getItem(k) || sessionStorage.getItem(k) || '{}'); })()""")

async def stage1(pg):
    await go(pg, 1)
    ok("S1: Reveal waits for a prediction and a trait", await pg.is_disabled('[data-act="reveal"]'))
    ok("S1: the Field Guide offers What is AI? and patterns", await pg.locator('[data-fg="A"]').count() == 1 and await pg.locator('[data-fg="C"]').count() == 1)
    await act(pg, "guess", "Norp"); await act(pg, "trait", "color"); await act(pg, "reveal")
    t = await pg.inner_text("#pm-body")
    ok("S1: reveal names the real rule and the student's traits", "pointy horns" in t and "color" in t.lower(), t[:200])
    await act(pg, "first", "blue"); await act(pg, "more")
    ok("S1: the new example breaks the color rule", "breaks" in await say(pg), await say(pg))
    await act(pg, "more"); await act(pg, "final", "blue")
    ok("S1: a rule that doesn't fit all six is flagged", "breaks that rule" in await pg.inner_text("#pm-body"))
    await act(pg, "final", "pointy"); await act(pg, "whyfirst", "happened")
    await act(pg, "game", "solo")
    rule = (await state(pg))["s1"]["game"]["rule"]
    wrong = next(r for r in ["tail", "ant2", "spiky", "pointy", "eyes3"] if r != rule)
    await act(pg, "gguess", wrong)
    fb = await say(pg)
    ok("S1: a wrong rule guess is refused with a reason", "doesn't fit" in fb or "isn't the secret rule" in fb, fb)
    await act(pg, "gguess", rule)
    ok("S1: the right rule solves the game", "Solved" in await pg.inner_text("#pm-body"))
    await act(pg, "check", "prove")
    ok("S1: a wrong checkpoint answer doesn't win", not await won(pg))
    await act(pg, "check", "many")
    ok("S1: wins after the checkpoint", await won(pg))

async def stage2(pg):
    await go(pg, 2)
    await act(pg, "rule", "horns")
    pool = await pg.evaluate("SE.pmData.POOL.map(c => [c.id, c.traits.horns === 'pointy' ? 'Glim' : 'Norp'])")
    await act(pg, "check")
    ok("S2: too few examples is refused with the count", "has 0 examples" in await say(pg), await say(pg))
    # One wrong label first
    first = pool[0]; bad = "Glim" if first[1] == "Norp" else "Norp"
    await act(pg, "label", f"{first[0]}|{bad}")
    ok("S2: a label that breaks the rule is flagged", await pg.locator(".pm-flag").count() >= 1)
    for cid, lab in pool[:10]: await act(pg, "label", f"{cid}|{lab}")
    ok("S2: fixing the label counts as a correction", (await state(pg))["s2"]["fixes"] == 1)
    t = await pg.inner_text(".pm-stats")
    ok("S2: counts and the rule's trait table are shown", "10" in t and "Horns and label" in t, t[:200])
    await act(pg, "check")
    ok("S2: the prediction questions are required", "Make a prediction" in await say(pg), await say(pg))
    await act(pg, "hyp", "moreglim"); await act(pg, "reason", "both"); await act(pg, "check")
    ok("S2: a valid training set wins", await won(pg))
    await act(pg, "view", "table")
    ok("S2: a table view lists every creature with its traits", await pg.locator(".pm-table tbody tr").count() >= 24)
    await act(pg, "view", "cards")
    # Creature Studio: design, label, add. A copy of a held-out test creature is refused.
    n0 = len((await state(pg))["s2"]["labels"])
    await pg.evaluate("""(() => { const t = SE.pmData.TESTPOOL[0].traits; return t; })()""")
    q1 = await pg.evaluate("SE.pmData.TESTPOOL[0].traits")
    for k, v in q1.items(): await act(pg, "st-trait", f"{k}|{v}")
    await act(pg, "st-label", "Glim"); await act(pg, "st-add")
    ok("Studio: a copy of a test creature is refused (no training on the test set)", "tested on" in await say(pg) and len((await state(pg))["s2"]["labels"]) == n0, await say(pg))
    await act(pg, "st-trait", "color|purple"); await act(pg, "st-trait", "horns|pointy"); await act(pg, "st-label", "Glim"); await act(pg, "st-add")
    s2 = (await state(pg))["s2"]
    ok("Studio: a designed creature joins the training set with its label", len(s2["labels"]) == n0 + 1 and s2["labels"][-1] == ["u-1", "Glim"] and s2["custom"][0]["traits"]["color"] == "purple")
    t = await pg.inner_text(".pm-dash")
    ok("Studio: the dashboard counts it", str(n0 + 1) in t and "No number here promises" in t, t[:160])
    await act(pg, "remove", "u-1")

TRAIN3 = """(() => { const s = JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => /^stem207\\.pm\\.(?!mode)/.test(k))));
  return s.s3.train.map(([id, l]) => ({ id, traits: SE.pmData.POOL.find(c => c.id === id).traits, label: l })); })()"""
async def stage3(pg):
    await go(pg, 3)
    st = await state(pg)
    ok("S3: the first visit starts from the stage 2 training set", st["s3"]["train"] == st["s2"]["labels"], (st["s3"]["train"][:3], st["s2"]["labels"][:3]))
    await act(pg, "pick", "q-01")
    ok("S3: testing before training asks to train", "Train the model first" in await say(pg))
    await act(pg, "train")
    for q in ["q-01", "q-02", "q-03"]:
        await act(pg, "pick", q)
    ok("S3: three tests don't finish the stage by themselves", not await won(pg))
    # Inside the Machine: every step shows the model's real numbers.
    m = await pg.evaluate("""((tr) => { const t = SE.pmData.TESTPOOL.find(c => c.id === 'q-03').traits, p = SE.mlKit.knn(tr, t);
      return { label: p.label, agree: Math.round(p.agree * 100), g: p.votes.Glim || 0, n: p.votes.Norp || 0, d1: SE.mlKit.distance(tr[0].traits, t), near: p.neighbors.length }; })(""" + TRAIN3 + ")")
    await act(pg, "iv-feat", "horns")
    ok("S3: Examine highlights the chosen feature on the creature", await pg.locator(".pm-hl--horns").count() == 1)
    await act(pg, "iv-step", "next")
    t = await pg.inner_text(".pm-iv")
    ok("S3: Compare shows example 1's real distance", f"Its distance is {m['d1']}" in t, (m, t[:200]))
    await pg.locator('.pm-iv [data-act="iv-step"][data-id="next"]').focus(); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150)
    ok("S3: steps work from the keyboard", "Step 3 of 5" in await pg.inner_text(".pm-iv"))
    ok("S3: Nearest marks exactly K neighbors", await pg.locator(".pm-iv__rank li.is-near").count() == m["near"])
    await act(pg, "iv-step", "next")
    t = await pg.inner_text(".pm-iv")
    ok("S3: the vote equals the model's (votes, label, agreement)", f"{m['g']} vote" in t and f"{m['n']} vote" in t and f"Model agreement: {m['agree']}%" in t and "isn't the chance" in t, (m, t[:300]))
    await act(pg, "iv-step", "next")
    ok("S3: Reveal waits for the student's prediction", await pg.is_disabled('[data-act="iv-reveal"]'))
    await act(pg, "iv-guess", "right"); await act(pg, "iv-reveal")
    ok("S3: the walkthrough is recorded", (await state(pg))["s3"]["ivDone"] is True)
    # Change One Thing: pick a change the model says flips the prediction, and check the page agrees.
    cf = await pg.evaluate("""((tr) => { const x = SE.pmData.TESTPOOL.find(c => c.id === 'q-03').traits;
      for (const k of SE.mlKit.KEYS) for (const v of SE.mlKit.TRAITS[k]) { if (v === x[k]) continue; const r = SE.pmExplain.counterfactual(tr, x, k, v, { K: 3 });
        if (r.changed) return { k, v: String(v), to: r.after.label }; } return null; })(""" + TRAIN3 + ")")
    ok("S3: some single-trait change flips this prediction", cf is not None)
    await act(pg, "cf-trait", cf["k"]); await act(pg, "cf-value", cf["v"]); await act(pg, "cf-run")
    out = await pg.inner_text(".pm-cf__out")
    ok("S3: Change One Thing shows the flip the model makes", "changed" in out and cf["to"] in out and "sensitive" in out, out[:200])
    # Change a training example so a prediction flips. The edit is saved, even after leaving the stage.
    flip = await pg.evaluate("""((tr) => { for (const q of ['q-01','q-02','q-03']) { const t = SE.pmData.TESTPOOL.find(c => c.id === q).traits, p = SE.mlKit.knn(tr, t);
        for (const n of p.neighbors) { const t2 = tr.map(e => e.id === n.ex.id ? { ...e, label: e.label === 'Glim' ? 'Norp' : 'Glim' } : e);
          if (SE.mlKit.knn(t2, t).label !== p.label) return n.ex.id; } } return null; })(""" + TRAIN3 + ")")
    ok("S3: some example can flip a prediction", flip is not None)
    before = dict((await state(pg))["s3"]["train"])[flip]
    await act(pg, "sel", flip); await act(pg, "relabel", flip); await act(pg, "train")
    ok("S3: the flip is noticed", "changed" in await say(pg), await say(pg))
    await go(pg, 3)
    after = dict((await state(pg))["s3"]["train"])[flip]
    ok("S3: a training edit survives leaving the stage", after != before and await pg.locator(f'[data-act="sel"][data-id="{flip}"][aria-label$="labeled {after}"]').count() == 1, (before, after))
    other = await pg.evaluate(f"[...document.querySelectorAll('[data-act=cause]')].map(b => b.dataset.id).find(id => id !== '{flip}')")
    if other:
        await act(pg, "cause", other)
        ok("S3: the wrong cause is refused", "didn't change" in await say(pg) and not await won(pg))
    await act(pg, "cause", flip)
    ok("S3: with every task done, naming the changed example wins", await won(pg))
    # Experiment bench (optional): measure on the held-out creatures, save a snapshot, add a missing kind, Fool the Machine.
    await pg.evaluate("document.querySelector('details[data-k=bench3]').open = true")
    await act(pg, "measure")
    m3 = await pg.evaluate("""((tr) => { const rule = SE.pmData.SECRET_RULES.find(r => r.id === JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => /^stem207\\.pm\\.(?!mode)/.test(k)))).s2.rule);
      return Math.round(SE.mlKit.evaluate(tr, SE.pmData.labelWith(rule, SE.pmData.TESTPOOL.slice(0, 12))).overall * 100); })(""" + TRAIN3 + ")")
    ok("Bench: Measure shows the model's real held-out accuracy", f"{m3}%" in await pg.inner_text(".pm-ext"), m3)
    await act(pg, "snapname", "Baseline"); await act(pg, "snap")
    snaps = (await state(pg)).get("snaps", [])
    ok("Bench: a snapshot is saved with the measured result", len(snaps) == 1 and snaps[0]["name"] == "Baseline" and round(snaps[0]["acc"] * 100) == m3)
    await go(pg, 3)
    await pg.evaluate("document.querySelector('details[data-k=bench3]').open = true")
    ok("Bench: snapshots survive leaving the stage", "Baseline" in await pg.inner_text("[data-k=bench3]"))
    fool = await pg.evaluate("""((tr) => { const st = JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => /^stem207\\.pm\\.(?!mode)/.test(k))));
      const rule = SE.pmData.SECRET_RULES.find(r => r.id === st.s2.rule), tests = SE.pmData.TESTPOOL.map(t => SE.mlKit.key(t.traits));
      const M = SE.mlKit, all = []; for (const c of M.TRAITS.color) for (const s of M.TRAITS.shape) for (const e of M.TRAITS.eyes) for (const h of M.TRAITS.horns) for (const a of M.TRAITS.antennae) for (const t of M.TRAITS.tail) all.push({ color: c, shape: s, eyes: e, horns: h, antennae: a, tail: t });
      const tr2 = st.s3.model.map(([id, l]) => ({ id, traits: (SE.pmData.POOL.find(c => c.id === id) || st.s2.custom.find(c => c.id === id)).traits, label: l }));
      return all.find(t => !tests.includes(M.key(t)) && M.knn(tr2, t, { K: st.s3.K || 3 }).label !== (rule.test(t) ? 'Glim' : 'Norp')) || null; })(""" + TRAIN3 + ")")
    if fool:
        for k, v in fool.items(): await act(pg, "st-trait", f"{k}|{v}")
        await act(pg, "fool-guess", "wrong"); await act(pg, "fool")
        ok("Fool the Machine: a creature the model gets wrong is recognized, with its real label from the rule", "You fooled it" in await say(pg) and (await state(pg))["s3"]["ch"].get("fool") is True, await say(pg))
        ok("Fool the Machine: the designed creature opens in Inside the Machine", await pg.locator(".pm-evidence .pm-iv").count() == 1)
    # The AI Field Guide: stage 3 unlocks card D (not E), and its demo is the real model.
    await pg.locator('[data-fg="D"]').first.click(); await pg.wait_for_timeout(150)
    fg = await pg.inner_text("#pm-fg")
    ok("Field Guide: a context button opens its card", not await pg.is_hidden("#pm-fg") and "How does it predict?" in fg)
    ok("Field Guide: later cards stay locked", await pg.locator('#pm-fg [data-act="fg-card"][data-id="E"]').count() == 0 and "E. Locked" in fg)
    await act(pg, "fg-k", "1")
    k1 = await pg.evaluate("SE.mlKit.knn(SE.pmData.A.start, SE.pmData.A.next.traits, { K: 1 }).label")
    ok("Field Guide: the demo shows the model's real prediction", f"Prediction ▲ {k1}" in (await pg.inner_text("#pm-fg")).replace("\n", " ") or f"Prediction ● {k1}" in (await pg.inner_text("#pm-fg")).replace("\n", " "), k1)
    await act(pg, "fg-q", "D|store")
    ok("Field Guide: a prediction question gives feedback", "storing labeled examples" in await pg.inner_text("#pm-fg"))

async def stage4(pg):
    await go(pg, 4)
    ok("S4: runs wait for a prediction", await pg.is_disabled('[data-act="start"][data-id="same"]'))
    await act(pg, "pred", "variety")
    await act(pg, "start", "same")
    for _ in range(3): await act(pg, "add", "same")
    await act(pg, "start", "variety")
    for _ in range(3): await act(pg, "add", "variety")
    model = await pg.evaluate("[SE.patternMachine.curveFor('same', 3).map(v => Math.round(v.test*100)), SE.patternMachine.curveFor('variety', 3).map(v => Math.round(v.test*100))]")
    rows = await pg.evaluate("[...document.querySelectorAll('.pm-numbers table tbody tr')].map(r => [...r.querySelectorAll('td')].map(td => td.textContent))")
    table = [[int(r[0].rstrip('%')) for r in rows], [int(r[1].rstrip('%')) for r in rows]]
    ok("S4: the chart's table equals the model's real accuracy", table == model, (table, model))
    ok("S4: variety ends higher, as measured", model[1][3] > model[0][3], model)
    await act(pg, "explain", "same"); await act(pg, "down", "yes"); await act(pg, "q20", "depends"); await act(pg, "done")
    ok("S4: an explanation that contradicts the data is refused with the numbers", "%" in await say(pg) and not await won(pg), await say(pg))
    await act(pg, "explain", "variety"); await act(pg, "down", "no"); await act(pg, "done")
    ok("S4: 'never went down' is refused when it did", "step down" in await say(pg), await say(pg))
    await act(pg, "down", "yes"); await act(pg, "done")
    ok("S4: matching the evidence wins", await won(pg))
    await pg.check("#pm-train-acc"); await pg.wait_for_timeout(150)
    ok("S4: training accuracy can be shown, with a warning", "not proof" in await pg.inner_text("#pm-body"))

async def stage5(pg):
    await go(pg, 5)
    await act(pg, "test")
    t = await pg.inner_text("#pm-body")
    ok("S5: the flawed model gets 10 of 16", "10 of 16" in t, t[:160])
    await act(pg, "group", "color|green")
    ok("S5: a group doing well is refused with its numbers", "2 of 2" in await say(pg) or "too small" in await say(pg), await say(pg))
    await act(pg, "group", "color|blue")
    ok("S5: a group below overall is accepted", "4 of 7" in await say(pg), await say(pg))
    await pg.select_option("#pm-trait2", "horns"); await pg.wait_for_timeout(200)
    tb = await pg.inner_text("#pm-body")
    ok("Bias 2.0: grouping by two traits finds blue + pointy horns at 0 of 3", "blue + pointy horns" in tb and "0 of 3" in tb, tb[:300])
    ok("Bias 2.0: small groups say too few to tell, and missing training kinds are flagged", "too few to tell" in tb and "none" in tb)
    await pg.select_option("#pm-trait2", ""); await pg.wait_for_timeout(200)
    await act(pg, "hyp", "broken")
    ok("S5: a weak hypothesis gets a pointer", "compared with its examples" in await pg.inner_text("#pm-body"))
    await act(pg, "hyp", "shortcut")
    for cid in ["e-p07", "e-p08"]: await act(pg, "addc", cid)
    await act(pg, "retest")
    ok("S5: adding only green examples doesn't help and doesn't win", "still 0 of 6" in await say(pg) and not await won(pg), await say(pg))
    for cid in ["e-p01", "e-p02", "e-p03", "e-p04", "e-p05", "e-p06"]: await act(pg, "addc", cid)
    await act(pg, "retest")
    t = await pg.inner_text(".pm-ba")
    ok("S5: before/after shows the real change", "63%" in t and "94%" in t, t)
    ok("S5: an evidence-based fix wins", await won(pg))
    ok("Bias 2.0: before/after bars and an evidence panel from the real results", await pg.locator(".pm-babars__row").count() >= 2 and "Problem group 0 → 5 of 6" in await pg.inner_text(".pm-evid"), await pg.inner_text(".pm-evid"))
    await pg.evaluate("document.querySelector('details[data-k=trade5]').open = true")
    await act(pg, "trade")
    tt = await pg.inner_text("[data-k=trade5]")
    ok("Tradeoff: the swap lifts the problem group to 5 of 6 but turns a right blue Norp wrong", "0 → 5 of 6" in tt and "88%" in tt and "right" in tt and "wrong" in tt, tt[:300])
    await act(pg, "tradewhy", "removed")
    ok("Tradeoff: the explanation about removed neighbors is confirmed", "outvoted" in await pg.inner_text("[data-k=trade5]"))

async def stage6(pg):
    await go(pg, 6)
    ok("S6: the Trust Dashboard waits for the 5-of-5 prediction", await pg.locator('[data-act="th"]').count() == 0 and "Five out of five" in await pg.inner_text("#pm-body"))
    await act(pg, "trust", "trust")
    ok("S6: the trap is revealed only after the prediction", "It's really a" in await pg.inner_text(".pm-trap"))
    opts = await pg.evaluate("[...document.querySelectorAll('[data-act=th]')].map(b => b.dataset.id)")
    ok("S6: only possible settings are offered for K = 5 (always, 60, 80, 100)", opts == ["0", "60", "80", "100"], opts)
    await act(pg, "th", "80")
    t = await pg.inner_text(".pm-metrics")
    ok("S6: at 80%: 9 answered, 3 wrong, 75% coverage", "9" in t and "75%" in t, t)
    ok("S6: accuracy and coverage shown together", "Accuracy of its answers" in await pg.inner_text(".pm-gauges") and "Coverage" in await pg.inner_text(".pm-gauges"))
    await act(pg, "tap", "f-x09"); await act(pg, "explain", "new"); await act(pg, "done")
    ok("S6: needs 3 settings before recording", "at least 3" in await say(pg), await say(pg))
    await act(pg, "th", "60")
    await act(pg, "tap", "f-x06")
    ok("S6: a low-agreement mistake isn't a confident mistake", "Only 3 of 5" in await pg.inner_text("#pm-body"))
    await act(pg, "tap", "f-x09")
    ok("S6: the purple confident mistake is recognized", "Found one" in await pg.inner_text("#pm-body"))
    await act(pg, "th", "100")
    await act(pg, "sth", "game|100"); await act(pg, "swhy", "game|cover"); await act(pg, "sth", "bite|0"); await act(pg, "swhy", "bite|safe"); await act(pg, "purple", "both")
    await act(pg, "done")
    ok("S6: a lower bar for bites than for the game is questioned", "Is that what you meant" in await say(pg), await say(pg))
    await act(pg, "sth", "game|0"); await act(pg, "sth", "bite|80"); await act(pg, "done")
    ok("S6: consistent thresholds win", await won(pg))

async def stage7(pg):
    await go(pg, 7)
    uses = await pg.evaluate("SE.patternMachine.USES.map(u => ({ floor: u.floor, fits: u.fits }))")
    ok("S7: score waits for all 10", await pg.is_disabled('[data-act="score"]'))
    for i, u in enumerate(uses):
        d = "help" if (i < 4 and u["floor"]) or (not u["floor"] and i >= 4) else ("review" if u["floor"] else "help")
        d = "help" if u["floor"] else d   # every floored case gets the ruled-out answer: fails
        await act(pg, "d", f"{i}|{d}")
        await pg.select_option(f'[data-r="{i}"]', u["fits"][0]); await pg.wait_for_timeout(60)
    await act(pg, "score")
    ok("S7: 6 of 10 doesn't pass and says what's needed", "need 7" in await say(pg) and not await won(pg), await say(pg))
    for i, u in enumerate(uses):
        if u["floor"]: await act(pg, "d", f"{i}|review")
    await act(pg, "score")
    ok("S7: 10 of 10 passes", await won(pg) and "10 of 10" in await pg.inner_text("#lab-win-title"))

async def stage8(pg, student=True):
    await go(pg, 8)
    ok("S8: testing waits for a question and a hypothesis", await pg.is_disabled('[data-act="test"]'))
    await act(pg, "rq", "group"); await act(pg, "rh", "missing"); await act(pg, "rq-done")
    ok("S8: the question and hypothesis fold into one line", "My hypothesis:" in await pg.inner_text(".pm-qsum"))
    await act(pg, "test")
    s = (await state(pg))["s8"]
    model = await pg.evaluate("SE.mlKit.evaluate(SE.pmData.G.pool.slice(0,4).concat(SE.pmData.G.pool.slice(12,16)), SE.pmData.G.test).overall")
    ok("S8: the first test is the model's real score", abs(s["first"]["acc"] - model) < 1e-9, (s["first"], model))
    ok("S8: finish waits for every task", await pg.is_disabled('[data-act="finish"]'))
    await pg.locator('[data-act="inspect"]').first.click(); await pg.wait_for_timeout(120)
    ok("S8: inspecting opens Inside the Machine on that creature", "Inside the Machine" in await pg.inner_text(".pm-evidence") and await pg.locator(".pm-evidence .pm-iv").count() == 1)
    await pg.evaluate("document.querySelector('details[data-k=gpool]').open = true")
    ok("S8: the add list stays open after testing", await pg.evaluate("document.querySelector('details[data-k=gpool]').open"))
    for cid in ["g-p05", "g-p06", "g-p07", "g-p08", "g-p09", "g-p10"]:
        await pg.locator(f'[data-act="add"][data-id="{cid}"]').click(); await pg.wait_for_timeout(60)
    ok("S8: the add list stays open while adding", await pg.evaluate("document.querySelector('details[data-k=gpool]').open"))
    await act(pg, "test")
    if await pg.locator('[data-act="why8"]').count():
        ok("S8: no improvement asks for an explanation and a next experiment", not await pg.is_enabled('[data-act="finish"]'))
        await act(pg, "why8", "toofew"); await act(pg, "next8", "addmissing")
    await act(pg, "th", "67")
    for k, v in [("q2", "both"), ("q4", "addmissing"), ("q6", "newkind"), ("q7", "costly")]: await act(pg, k, v)
    await pg.fill("#pm-lesson", "More kinds of examples beat more copies."); await pg.dispatch_event("#pm-lesson", "change")
    await act(pg, "finish")
    ok("S8: the challenge wins", await won(pg))
    rep = await pg.inner_text("#pm-report")
    s = (await state(pg))["s8"]
    a, b = round(s["first"]["acc"] * 100), round(s["latest"]["acc"] * 100)
    expect = f"Improved from {a}% to {b}%" if b > a else (f"Stayed at {b}%" if a == b else f"Went down from {a}% to {b}%")
    ok("S8: the report states the measured before/after honestly", expect in rep, (expect, rep[:300]))
    ok("S8: the report has every section", all(x in rep for x in ["Model purpose", "Training examples", "Feature coverage", "Test accuracy", "A mistake I investigated", "Confidence threshold", "When a person should check", "Keep the humanity in technology"]))
    ok("S8: the research report has the question, hypothesis, results, group changes, and what it still struggles with", all(x in rep for x in ["My AI Research Report", "My investigation question", "My original hypothesis", "My model's first result", "My model's new result", "What improved or got worse", "Something it still struggles with", "An important mistake I discovered"]), rep[:400])
    ok("S8: the first and new results are the measured ones", f"{a}% on 20 new creatures" in rep and f"{b}%, with" in rep)
    ok("S8: the report includes notebook results from stages 4–6", "accuracy experiment" in rep.lower() and "bias detective" in rep.lower())
    if student:
        ok("S8: the certificate is offered after all stages", await pg.locator("#lab-win [data-cert]").count() == 1)
        await pg.locator("#lab-win [data-cert]").click(); await pg.wait_for_timeout(250)
        ct = await pg.inner_text(".cert")
        ok("certificate: award, name, workshop, skills, mission", all(x in ct for x in ["Responsible AI Explorer", "Ava R.", "Train the Machine", "Found and fixed biased data", "Keep the humanity in technology."]), ct[:200])
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(150)

async def researcher(pg):
    before = (await state(pg))["s3"]["train"]
    await pg.evaluate("localStorage.setItem('stem207.pm.mode', 'researcher')")
    # Stage 4: the K comparison is the model's real accuracy.
    await go(pg, 4)
    rows = await pg.evaluate("[...document.querySelectorAll('.pm-kcmp tbody tr')].map(r => [...r.querySelectorAll('td')].map(td => td.textContent))")
    model = await pg.evaluate("""[SE.pmData.CD.same, SE.pmData.CD.variety].map(pool => { const tr = SE.pmData.CD.base.concat(pool.slice(0, 9));
      return [1, 3, 5].map(k => Math.round(SE.mlKit.evaluate(tr, SE.pmData.CD.test, { K: k }).overall * 100) + '%'); })""")
    ok("Researcher: stage 4 compares K = 1, 3, 5 with the model's real accuracy", rows == model, (rows, model))
    # Stage 3: feature selection is saved and the walkthrough says what's ignored. Switching modes kept the work.
    await go(pg, 3)
    ok("modes: switching to Researcher keeps the stage 3 training set", (await state(pg))["s3"]["train"] == before)
    await pg.locator('#pm-feat3 input[value="color"]').uncheck(); await pg.wait_for_timeout(200)
    ok("Researcher: unchecking a trait is saved as the model's features", (await state(pg))["s3"]["features"] == ["shape", "eyes", "horns", "antennae", "tail"], (await state(pg))["s3"].get("features"))
    await act(pg, "train"); await act(pg, "pick", "q-02")
    ok("Researcher: Inside the Machine says which trait is ignored", "ignoring color" in await pg.inner_text(".pm-iv"))
    feat = await pg.evaluate("""((tr) => { const t = SE.pmData.TESTPOOL.find(c => c.id === 'q-02').traits; return SE.mlKit.knn(tr, t, { features: ['shape','eyes','horns','antennae','tail'] }).label; })(""" + TRAIN3 + ")")
    pt = " ".join((await pg.inner_text(".pm-test")).split())
    ok("Researcher: the prediction uses only the chosen traits", f"predicts ▲ {feat}" in pt or f"predicts ● {feat}" in pt, (feat, pt))
    await pg.locator('#pm-feat3 input[value="color"]').check(); await pg.wait_for_timeout(200)
    ok("Researcher: checking all six goes back to the default", (await state(pg))["s3"]["features"] == [])
    # Stage 8: the confusion matrix and training vs. test accuracy come from the model.
    await go(pg, 8)
    cm = await pg.evaluate("[...document.querySelectorAll('.pm-cm tbody td')].map(td => parseInt(td.textContent))")
    want = await pg.evaluate("""(() => { const st = JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => /^stem207\\.pm\\.(?!mode)/.test(k)))).s8;
      const tr = st.train.map(id => SE.pmData.G.pool.find(e => e.id === id)), c = SE.mlKit.confusion(SE.mlKit.evaluate(tr, SE.pmData.G.test, { K: st.K || 3 }));
      return [c.GG, c.GN, c.NG, c.NN]; })()""")
    ok("Researcher: the confusion matrix matches the model and covers all 20", cm == want and sum(cm) == 20, (cm, want))
    ok("Researcher: training vs. new-creature accuracy is shown", "On its training examples" in await pg.inner_text(".pm-res8"))
    await pg.evaluate("localStorage.setItem('stem207.pm.mode', 'investigator')")
    await go(pg, 3)
    ok("modes: Investigator hides the Researcher tools but keeps the work", await pg.locator("#pm-feat3").count() == 0 and (await state(pg))["s3"]["train"] == before)

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []; outside = []
    ctx = await b.new_context(viewport={"width": 1366, "height": 650}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    pg.on("request", lambda r: outside.append(r.url) if not r.url.startswith(S.rstrip("/")) and not r.url.startswith("data:") and "fonts.g" not in r.url else None)
    await pg.goto(S); await pg.evaluate("localStorage.clear(); sessionStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)

    # Guest: landing, mode choice, and the lab works without an account
    await pg.click("text=Look around as a guest"); await pg.wait_for_timeout(400)
    await pg.goto(S + "#/lab/pattern-machine"); await pg.wait_for_timeout(500)
    ok("guest: landing shows the big idea and modes", "People decide whether those patterns are useful" in await pg.inner_text("#app") and await pg.locator('[name="pm-mode"]').count() == 3)
    await pg.check('[name="pm-mode"][value="explorer"]')
    await go(pg, 2)
    ok("guest: Explorer mode shows 16 creatures and 3 rules", await pg.locator('[data-act="rule"]').count() == 3)
    await act(pg, "rule", "horns")
    ok("guest: work is kept in sessionStorage only", await pg.evaluate("!!sessionStorage.getItem('stem207.pm.guest') && !localStorage.getItem('stem207.pm.guest')"))
    await pg.evaluate("localStorage.setItem('stem207.pm.mode', 'investigator')")

    # Student
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)
    await pg.evaluate("Object.keys(localStorage).filter(k => k.startsWith('stem207.pm.') && k !== 'stem207.pm.mode').forEach(k => localStorage.removeItem(k))")
    for f in [stage1, stage2, stage3, stage4, stage5, stage6, stage7]:
        try: await f(pg)
        except Exception as e: ok(f"{f.__name__} ran without error", False, str(e)[:300])
    try: await stage8(pg)
    except Exception as e: ok("stage8 ran without error", False, str(e)[:300])
    try: await researcher(pg)
    except Exception as e: ok("researcher ran without error", False, str(e)[:300])

    # Chromebook: the stage and its main button are on the first screen
    for n, sel in [(1, '[data-act="guess"]'), (4, '[data-act="pred"]'), (8, '[data-act="rq"], .pm-qsum')]:
        await go(pg, n)
        box = await pg.locator(sel).first.bounding_box()
        ok(f"Chromebook: stage {n}'s first control is on the first screen", box and box["y"] + box["height"] <= 650, box)

    # Notebook holds real results and opens from any stage
    await pg.click("#pm-nb-btn"); await pg.wait_for_timeout(150)
    nb = await pg.inner_text("#pm-nb")
    ok("notebook: entries with real numbers from earlier stages", "The accuracy experiment" in nb and "94%" in nb, nb[:200])
    logged = await pg.evaluate("JSON.stringify(SE.store.eventsFor(SE.store.currentUser ? SE.store.currentUser().id : null) || [])") if False else ""
    ok("no requests leave the site", not outside, outside[:5])
    ok("no page errors", not errs, errs[:5])
    await pg.set_viewport_size({"width": 390, "height": 844})
    for n in [3, 5, 8]:
        await go(pg, n)
        w = await pg.evaluate("document.documentElement.scrollWidth")
        ok(f"phone: stage {n} has no sideways scroll", w <= 390, w)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
    sys.exit(0 if all(R) else 1)
asyncio.run(main())
