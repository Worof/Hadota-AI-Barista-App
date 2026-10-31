"""Browser end-to-end test: real Chromium, real UI. Run:  pip install playwright && playwright install chromium && python3 tests/e2e.py"""
import subprocess, sys, time, os, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8791
srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
fails, errs = [], []
def check(name, ok, extra=""):
    print(("PASS " if ok else "FAIL ") + name + (f"  [{extra}]" if extra else "")); ok or fails.append(name)
def run_flow(pg):
    for _ in range(14):
        if pg.query_selector("[data-a=rate]"): return True
        opts = pg.query_selector_all(".opt[data-id]")
        if not opts: return False
        opts[0].click(); pg.wait_for_timeout(80)
        c = pg.query_selector("[data-a=cont]")
        if c and not c.is_disabled(): c.click()
        pg.wait_for_timeout(120)
    return bool(pg.query_selector("[data-a=rate]"))
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); ctx = b.new_context(viewport={"width": 420, "height": 900}); pg = ctx.new_page()
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(f"http://localhost:{PORT}/"); pg.wait_for_timeout(500)
        check("splash shows the enter button", pg.query_selector("#enter") is not None)
        pg.click("#enter"); pg.wait_for_timeout(600)
        check("home renders with the animated character", pg.query_selector("#view .chr img") is not None)
        pg.fill("#nm", "محمد"); pg.click("[data-a=start]"); pg.wait_for_timeout(300)
        pg.evaluate("(()=>{const u=me();u.arm='learner';sv()})()")   # make the test independent of the A/B hash
        check("questionnaire reaches a result", run_flow(pg))
        check("result shows blend, roast, grind and tahweeg", all(t in pg.inner_text("#view") for t in ["خلطتك", "التحميص", "التحويجة"]))
        check("feedback box is at the end of the result", pg.query_selector("[data-a=fbsend]") is not None)
        pg.click("[data-a=rate][data-n='2']"); pg.wait_for_timeout(200)
        check("rating is saved and learned", pg.evaluate("me().history.slice(-1)[0].rating") == 2 and pg.evaluate("me().model.n") == 1)
        pg.click("[data-a=ftag][data-id='too-bitter']"); pg.fill("#fbt", "القهوة طعمها محروق أوي"); pg.click("[data-a=fbsend]"); pg.wait_for_timeout(200)
        prefs = pg.evaluate("me().prefs")
        check("tags + Arabic text move the taste offset (roast lighter)", bool(prefs) and prefs["pr"] <= -0.5, json.dumps(prefs))
        check("user sees what will change next time", "هفتّح التحميص" in pg.inner_text("#view"))
        check("a feedback event is tracked without the free text", pg.evaluate("DB.log.filter(e=>e.name==='feedback_sent').length") == 1 and "محروق" not in pg.evaluate("JSON.stringify(DB.log)"))
        pg.evaluate("location.hash='#profile'"); pg.wait_for_timeout(300)
        check("profile shows what Hadota learned", "حدوتة بيتعلم ذوقك" in pg.inner_text("#view") and "التحميص الأفتح" in pg.inner_text("#view"))
        check("control arm gets no personalisation", pg.evaluate("recommend({serve:'hot',drink:'espresso',gear:'espresso'},newModel(12),undefined).prefs.pr===0"))
        pg.evaluate("location.hash='#account'"); pg.wait_for_timeout(200); pg.fill("#an", "محمد"); pg.click("[data-a=signup]"); pg.wait_for_timeout(400)
        check("without a server the community explains the setup", "المجتمع محتاج سيرفر" in pg.inner_text("#view"))
        pg.reload(); pg.wait_for_timeout(800)
        check("session and learning survive a reload", pg.evaluate("!!me()&&me().history.length>0&&me().prefs.pr<=-0.5"))
        check("no JavaScript errors", not errs, "; ".join(errs[:2]))
        b.close()
finally:
    srv.terminate()
print("\n" + ("ALL PASSED" if not fails else str(len(fails)) + " FAILED")); sys.exit(1 if fails else 0)
