"""Voice tests (stubbed audio): Hadota speaks ONLY with recorded clips, never with the device voice. Run: python3 tests/voice.py"""
import subprocess, sys, time, os, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); PORT = 8793
srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
STUB = """window.__spoken=[];window.SpeechSynthesisUtterance=function(t){this.text=t};
Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[{name:'Microsoft Shakir',lang:'ar-EG',voiceURI:'s'}],cancel(){},speak(u){window.__spoken.push(u.text)}}});
window.__audio=[];window.Audio=function(src){this.src=src;window.__audio.push(src);this.play=()=>{setTimeout(()=>this.onended&&this.onended(),5);return Promise.resolve()};this.pause=()=>{}};"""
res = []
def chk(n, ok, x=""): print(("PASS " if ok else "FAIL ") + n + (f" [{x}]" if x else "")); res.append(bool(ok))
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_context().new_page(); pg.add_init_script(STUB); pg.goto(f"http://localhost:{PORT}/"); pg.wait_for_timeout(400); pg.click("#enter"); pg.wait_for_timeout(900)
        chk("without recorded clips Hadota is silent (no device voice, even if the device has a male one)", pg.evaluate("window.__spoken.length") == 0)
        chk("the caption still types", len(pg.inner_text("#hb")) > 3)
        pg.goto(f"http://localhost:{PORT}/#more"); pg.wait_for_timeout(400); chk("settings says the recorded voice is not available yet", "لسه مش متاح" in pg.inner_text("#view"))
        pg = b.new_context().new_page(); pg.add_init_script(STUB)
        pg.route("**/assets/voice/manifest.json", lambda r: r.fulfill(body=json.dumps({"أيوة جاااي": "ar-EG/a.mp3"}), content_type="application/json"))
        pg.goto(f"http://localhost:{PORT}/"); pg.wait_for_timeout(500); pg.click("#enter"); pg.wait_for_timeout(900)
        chk("recorded clips play and the device voice stays silent", any("a.mp3" in s for s in pg.evaluate("window.__audio")) and pg.evaluate("window.__spoken.length") == 0, json.dumps(pg.evaluate("window.__audio")))
        lines = json.load(open(os.path.join(ROOT, "scripts", "voice-lines.json"), encoding="utf8"))["items"]
        pg = b.new_context().new_page(); pg.add_init_script(STUB); pg.goto(f"http://localhost:{PORT}/"); pg.wait_for_timeout(400); pg.evaluate("signIn('محمد')")
        miss = pg.evaluate("(have)=>{const S=new Set(have),out=[];for(const q of Object.keys(T.q)){if(!T.q[q].ask)continue;for(const c of T.callouts){for(const s of sentences(c.replace('{{name}}',rn())+T.q[q].ask)) if(!S.has(s)) out.push(s)}}for(const c of T.cheers)for(const s of sentences(T.result.intro.replace('{{name}}',rn())+' '+c))if(!S.has(s))out.push(s);for(const s of sentences(T.lines.intro.replace('{{name}}',rn())))if(!S.has(s))out.push(s);return out}", [i["text"] for i in lines])
        chk("every sentence the app can speak has a line in voice-lines.json (so one rendered voice covers it)", not miss, json.dumps(miss[:3], ensure_ascii=False))
        b.close()
finally: srv.terminate()
print("ALL PASSED" if all(res) else "FAILURES"); sys.exit(0 if all(res) else 1)
