# Accessibility checks on the main student, teacher, and guest pages, in light and dark mode.
# A home-grown subset of axe-core's rules (no downloads needed):
#   name      buttons, links, and images (svg role=img) have an accessible name
#   label     form fields have a label
#   ids       no duplicate ids; aria-labelledby / describedby / controls point at real ids
#   hidden    nothing focusable inside aria-hidden="true"
#   headings  one h1 per page, no skipped levels going down
#   tabindex  no positive tabindex
#   contrast  text meets WCAG AA (4.5:1, or 3:1 for large text) against its solid background
#   target    buttons, links, and form controls are at least 24×24 px (WCAG 2.2 AA)
#   doc       <html lang> and a page title
#   python3 tests/site/test_a11y.py [url] [--report]   (--report lists every finding)
import asyncio, sys, json
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
REPORT = "--report" in sys.argv
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)

CHECK = r"""
(() => {
  const out = [];
  const add = (rule, el, msg) => out.push({ rule, msg, where: describe(el) });
  const describe = (el) => {
    if (!el || !el.tagName) return "";
    const id = el.id ? "#" + el.id : "";
    const cls = typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
    const txt = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
    return `${el.tagName.toLowerCase()}${id}${cls}${txt ? ` "${txt}"` : ""}`;
  };
  const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none"; };
  const hiddenFromAT = (el) => !!el.closest('[aria-hidden="true"], [hidden], .visually-hidden-everything');
  const byId = (id) => document.getElementById(id);
  const nameOf = (el) => {
    const lb = el.getAttribute("aria-labelledby");
    if (lb) { const t = lb.split(/\s+/).map((i) => (byId(i) ? byId(i).textContent : "")).join(" ").trim(); if (t) return t; }
    const al = el.getAttribute("aria-label"); if (al && al.trim()) return al.trim();
    if (el.tagName === "IMG") return (el.getAttribute("alt") || "").trim();
    const t = [...el.childNodes].map((n) => n.nodeType === 3 ? n.textContent : n.nodeType === 1 && !n.closest('[aria-hidden="true"]') ? (n.tagName === "IMG" ? n.getAttribute("alt") || "" : n.tagName === "svg" ? (n.querySelector("title") ? n.querySelector("title").textContent : n.getAttribute("aria-label") || "") : nameOf(n)) : "").join(" ").trim();
    if (t) return t;
    if (el.tagName === "INPUT" && /^(submit|button|reset)$/.test(el.type)) return el.value || "";
    return (el.getAttribute("title") || "").trim();
  };
  // doc
  if (!document.documentElement.lang) add("doc", document.documentElement, "missing lang");
  if (!document.title.trim()) add("doc", document.documentElement, "missing title");
  // ids
  const ids = {}; document.querySelectorAll("[id]").forEach((el) => { ids[el.id] = (ids[el.id] || 0) + 1; });
  Object.entries(ids).filter(([, n]) => n > 1).forEach(([id]) => add("ids", byId(id), `duplicate id "${id}"`));
  document.querySelectorAll("[aria-labelledby],[aria-describedby],[aria-controls]").forEach((el) => {
    ["aria-labelledby", "aria-describedby", "aria-controls"].forEach((a) => (el.getAttribute(a) || "").split(/\s+/).filter(Boolean).forEach((id) => { if (!byId(id)) add("ids", el, `${a} → missing #${id}`); }));
  });
  // name
  document.querySelectorAll('button, a[href], [role="button"], [role="link"], [role="tab"]').forEach((el) => {
    if (!visible(el) || hiddenFromAT(el)) return;
    if (!nameOf(el)) add("name", el, "no accessible name");
  });
  document.querySelectorAll('img, svg[role="img"], [role="img"]').forEach((el) => {
    if (hiddenFromAT(el) || !visible(el)) return;
    if (el.tagName === "IMG" && el.hasAttribute("alt")) return;
    if (!nameOf(el) && !(el.querySelector && el.querySelector("title"))) add("name", el, "image with no name");
  });
  // label
  document.querySelectorAll("input, select, textarea").forEach((el) => {
    if (el.type === "hidden" || /^(submit|button|reset)$/.test(el.type) || !visible(el) || hiddenFromAT(el)) return;
    const lab = (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) || el.closest("label");
    if (!lab && !el.getAttribute("aria-label") && !el.getAttribute("aria-labelledby") && !el.getAttribute("title")) add("label", el, "form field with no label");
  });
  // hidden: focusable inside aria-hidden
  document.querySelectorAll('[aria-hidden="true"]').forEach((h) => h.querySelectorAll('a[href], button, input, select, textarea, [tabindex]').forEach((el) => {
    if (el.getAttribute("tabindex") === "-1" || el.disabled) return;
    add("hidden", el, "focusable inside aria-hidden");
  }));
  // tabindex
  document.querySelectorAll("[tabindex]").forEach((el) => { if (Number(el.getAttribute("tabindex")) > 0) add("tabindex", el, "positive tabindex"); });
  // headings (main content only; overlays count as their own page)
  const root = document.querySelector(".overlay") || document.getElementById("app") || document.body;
  const hs = [...root.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter((h) => visible(h) && !hiddenFromAT(h));
  const h1s = hs.filter((h) => h.tagName === "H1").length;
  if (!document.querySelector(".overlay") && h1s !== 1) add("headings", root, `${h1s} h1 elements`);
  let prev = 0; hs.forEach((h) => { const lv = Number(h.tagName[1]); if (prev && lv > prev + 1) add("headings", h, `h${prev} → h${lv}`); prev = lv; });
  // target size
  document.querySelectorAll('button, a[href].btn, [role="button"], input:not([type=hidden]), select, .tab, .chip a').forEach((el) => {
    if (!visible(el) || hiddenFromAT(el) || el.closest("p, li > small")) return;
    if (el.type === "checkbox" || el.type === "radio") { const l = el.closest("label"); if (l && l.getBoundingClientRect().height >= 24) return; }
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.height < 24) add("target", el, `${Math.round(r.width)}×${Math.round(r.height)}`);
  });
  // contrast
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const blend = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  const bgOf = (el) => {
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage !== "none") return null;  // gradient or image: can't judge
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
      if (Number(cs.opacity) < 1) return null;
    }
    if (!layers.length) layers.push({ r: 255, g: 255, b: 255, a: 1 });
    let bg = layers[layers.length - 1].a < 1 ? blend(layers[layers.length - 1], { r: 255, g: 255, b: 255, a: 1 }) : layers[layers.length - 1];
    for (let i = layers.length - 2; i >= 0; i--) bg = blend(layers[i], bg);
    return bg;
  };
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || !visible(el) || hiddenFromAT(el) || el.closest("svg, .visually-hidden, option, [disabled]")) continue;
    const cs = getComputedStyle(el);
    const fg = parse(cs.color); if (!fg) continue;
    // A label positioned outside its parent (like a chart value above its bar) sits on the grandparent.
    const pr = el.parentElement && el.parentElement.getBoundingClientRect(), er = el.getBoundingClientRect();
    const outside = cs.position === "absolute" && pr && (er.bottom <= pr.top + 1 || er.top >= pr.bottom - 1);
    const bg = bgOf(outside ? el.parentElement.parentElement : el); if (!bg) continue;
    const f = fg.a < 1 ? blend(fg, bg) : fg;
    const L1 = lum(f), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(cs.fontSize), bold = Number(cs.fontWeight) >= 700;
    const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
    if (ratio < need) { const k = `${cs.color}|${JSON.stringify(bg)}|${el.className}`; if (seen.has(k)) continue; seen.add(k); add("contrast", el, `${ratio.toFixed(2)}:1 (needs ${need})`); }
  }
  return out;
})()
"""

async def audit(pg, label, findings):
    res = await pg.evaluate(CHECK)
    for f in res: findings.append({ **f, "page": label })

async def sign_student(pg):
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(700)
async def sign_teacher(pg):
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await pg.goto(S + "#/signin/educator"); await pg.wait_for_timeout(300); await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(800)
async def visit(pg, h):
    await pg.goto(S + "#/library"); await pg.wait_for_timeout(100); await pg.goto(S + h); await pg.wait_for_timeout(450)

PUBLIC = ["#/signin", "#/signin/student", "#/signin/educator", "#/signup"]
STUDENT = ["#/", "#/activities", "#/activities/3d-printing", "#/plans", "#/base", "#/me", "#/activity/fix-the-recipe", "#/activity/noreaster-alerts",
           "#/activity/python-turtle-bridge", "#/lab/pattern-machine/5", "#/lab/pattern-machine/6", "#/lab/robot-chef/4", "#/lab/rover/1", "#/lab/dance-party/1", "#/lab/dance-party/5", "#/lab/dance-party/6", "#/activity/3d-buoy-charm"]
TEACHER = ["#/teach", "#/activities", "#/activities/coding",
           "#/moxie", "#/moxie/teach", "#/activity/moxie-03", "#/activity/moxie-13", "#/activity/moxie-16",
           "#/activities/3d-printing", "#/activity/3d-printing-exercise-04", "#/activity/3d-buoy-charm", "#/activity/fix-the-recipe", "#/teach/plans", "#/teach/plans/tpl-maine-coast"]
# Moxie sessions are drafts, so students only see them here by publishing them in memory for the audit.
STUDENT_MOXIE = ["#/moxie", "#/activity/moxie-01", "#/activity/moxie-06", "#/activity/moxie-08", "#/activity/moxie-03", "#/activity/moxie-11", "#/activity/moxie-13", "#/activity/moxie-14", "#/activity/moxie-15", "#/activity/moxie-16"]

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch()
    totals = {}
    for scheme in ["light", "dark"]:
        ctx = await b.new_context(viewport={"width": 1366, "height": 768}, color_scheme=scheme); pg = await ctx.new_page()
        F = []
        await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
        for h in PUBLIC: await visit(pg, h); await audit(pg, h, F)
        # A guest: Home with the Support STEM 207 card, then the card in the dialog with a Venmo name set.
        await pg.evaluate("SE.store.startGuest()"); await visit(pg, "#/"); await audit(pg, "guest home", F)
        await pg.evaluate("window.STEM207_CONFIG.donate = { venmo: 'stem207-test', qr: '' }"); await pg.click("#donate-open"); await pg.wait_for_timeout(250)
        await audit(pg, "modal: support", F); await pg.keyboard.press("Escape")
        await pg.evaluate("window.STEM207_CONFIG.donate = {}; SE.store.signOut()"); await pg.wait_for_timeout(200)
        await sign_student(pg)
        for h in STUDENT: await visit(pg, h); await audit(pg, h, F)
        await pg.evaluate("STEM.moxieSessions.forEach((s) => { s.pub = 'published'; })")
        for h in STUDENT_MOXIE: await visit(pg, h); await audit(pg, h, F)
        # Go deeper: the punch-out dialog, open.
        await visit(pg, "#/activity/lab-dance-party"); await pg.locator("a[data-deeper]").first.click(); await pg.wait_for_timeout(250)
        await audit(pg, "modal: go deeper", F); await pg.keyboard.press("Escape")
        await pg.evaluate("STEM.moxieSessions.forEach((s) => { s.pub = 'draft'; })")
        await pg.evaluate("SE.certificate.open({award:'Responsible AI Explorer',course:'Pattern Machine Lab',detail:'Passed with 8 of 10',name:'Ava R.',className:'Room 12'})"); await pg.wait_for_timeout(200)
        await audit(pg, "certificate", F); await pg.keyboard.press("Escape")
        await sign_teacher(pg)
        sid = await pg.evaluate("SE.store.studentsIn(SE.store.classesFor(SE.store.currentUser().id)[0].id)[0].id")
        pw = await pg.evaluate("SE.store.duplicatePathway(SE.plans.template('tpl-maine-coast')).id")
        cid = await pg.evaluate("SE.store.classesFor(SE.store.currentUser().id)[0].id")
        for h in TEACHER + ["#/teach/classes", f"#/teach/classes/{cid}", "#/teach/checks", f"#/teach/student/{sid}", f"#/teach/plans/{pw}/edit"]: await visit(pg, h); await audit(pg, h, F)
        # Plan pages after assigning, then the student's plan page.
        aid = await pg.evaluate(f"(() => {{ SE.store.publishPathway('{pw}'); const c = SE.store.classesFor(SE.store.currentUser().id)[0]; return SE.store.assignPathway(c.id, '{pw}').id; }})()")
        for h in [f"#/teach/plans/{pw}", f"#/teach/plans/{pw}/students", f"#/teach/plans/{pw}/checks"]: await visit(pg, h); await audit(pg, h, F)
        await visit(pg, "#/teach/plans/tpl-ws-sampler"); await audit(pg, "workshop template", F)
        # The shared modal, open: Add students (with a checked list), Message a class, and Send a note.
        await visit(pg, f"#/teach/classes/{cid}"); await pg.locator("[data-add-students]").first.click(); await pg.wait_for_timeout(250)
        await pg.fill("#ms-names", "Sam P.\nava r.\nx@y.org"); await pg.wait_for_timeout(150); await audit(pg, "modal: add students", F)
        await pg.click("#ms-add"); await pg.wait_for_timeout(300); await audit(pg, "modal: added cards", F); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        await visit(pg, "#/teach"); await pg.locator(".dash-actions [data-message-class]").click(); await pg.wait_for_timeout(250); await audit(pg, "modal: message", F); await pg.keyboard.press("Escape")
        await visit(pg, f"#/teach/student/{sid}"); await pg.click("[data-note-student]"); await pg.wait_for_timeout(250); await audit(pg, "modal: note", F); await pg.keyboard.press("Escape")
        await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200); await sign_student(pg)
        await visit(pg, f"#/plans/{aid}"); await audit(pg, "my plan", F)
        await ctx.close()
        by = {}
        for f in F: by.setdefault(f["rule"], []).append(f)
        for rule in ["doc", "ids", "name", "label", "hidden", "tabindex", "headings", "contrast", "target"]:
            items = by.get(rule, [])
            # de-duplicate the same element message across pages
            uniq = {}
            for f in items: uniq.setdefault((f["where"], f["msg"]), []).append(f["page"])
            ok(f"{scheme}: {rule}", not uniq, f"{len(uniq)} issue(s)" if uniq else "")
            if uniq and (REPORT or True):
                for (w, m), pages in list(uniq.items())[:40 if REPORT else 6]:
                    print(f"      {m} · {w} · {', '.join(sorted(set(pages)))[:90]}")
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
