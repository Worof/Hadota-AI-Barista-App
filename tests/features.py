"""Feature tests against the preview backend (an in-memory stand-in for the claude.ai database shared through localStorage).
Run: python3 tests/features.py   (needs: pip install playwright && playwright install chromium)"""
import subprocess, sys, time, os, json, io
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); PORT = 8795
srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
URL = f"http://localhost:{PORT}/"
def STUB(uid): return """
window.__uid='%s';const R=()=>JSON.parse(localStorage.getItem('__st')||'{}'),W=o=>{localStorage.setItem('__st',JSON.stringify(o));window.__ls.forEach(l=>l())};window.__ls=[];
addEventListener('storage',()=>window.__ls.forEach(l=>l()));
window.claude={use:async n=>{if(n==='user')return{id:async()=>window.__uid};if(n==='db')return{
 doc:p=>({get:async()=>{const s=R();return{exists:p in s,data:()=>s[p]}},set:async v=>{const s=R();s[p]=v;W(s)},delete:async()=>{const s=R();delete s[p];W(s)}}),
 collection:p=>{let f='at',d='asc';const q={orderBy(a,b){f=a;d=b;return q},limit(){return q},onSnapshot(cb){const run=()=>{const s=R();const arr=Object.keys(s).filter(k=>k.startsWith(p+'/')&&k.slice(p.length+1).split('/').length===1).map(k=>s[k]).sort((a,b)=>d==='asc'?a[f]-b[f]:b[f]-a[f]);cb({docs:arr.map(x=>({data:()=>x}))})};window.__ls.push(run);run();return()=>{const i=window.__ls.indexOf(run);if(i>=0)window.__ls.splice(i,1)}}};return q}};return null}};
window.__says=[];window.__spoken=[];
Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[],cancel(){},speak(u){window.__spoken.push(u.text)}}});
""" % uid
res = []; errs = []
def chk(name, ok, extra=""):
    print(("PASS " if ok else "FAIL ") + name + (f"  [{extra}]" if extra else "")); res.append(bool(ok))
def png():
    from PIL import Image
    b = io.BytesIO(); Image.new("RGB", (60, 40), (184, 50, 42)).save(b, "PNG"); return b.getvalue()
def first_answers(pg, n):
    for _ in range(n):
        o = pg.query_selector_all(".opt[data-id]")
        if not o: break
        o[0].click(); pg.wait_for_timeout(80)
        c = pg.query_selector("[data-a=cont]")
        if c and not c.is_disabled(): c.click()
        pg.wait_for_timeout(120)
def finish_flow(pg):
    for _ in range(16):
        if pg.query_selector("[data-a=rate]"): return True
        if not pg.query_selector_all(".opt[data-id]"): return False
        first_answers(pg, 1)
    return bool(pg.query_selector("[data-a=rate]"))
def user(ctx, uid, name, ch=False):
    pg = ctx.new_page(); pg.on("pageerror", lambda e, n=name: errs.append(n + ": " + str(e)))
    pg.add_init_script(STUB(uid)); pg.goto(URL + "#account"); pg.wait_for_timeout(300); pg.click("#enter"); pg.wait_for_timeout(200)
    pg.fill("#an", name); pg.click("[data-a=signup]"); pg.wait_for_timeout(500); return pg
def tab(pg, hashv):
    pg.evaluate(f"location.hash='{hashv}'"); pg.wait_for_timeout(500)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); ctx = b.new_context(viewport={"width": 420, "height": 900}); ctx.grant_permissions([])
        # ---------- single user: ask flow, recipes, favourites, opinions, usage, shop, blog ----------
        pg = ctx.new_page(); pg.on("pageerror", lambda e: errs.append(str(e))); pg.add_init_script(STUB("solo"))
        pg.add_init_script("window.SpeechRecognition=function(){this.start=()=>setTimeout(()=>this.onresult({results:[[{transcript:'عايزها سخنة'}]]}),10)};")
        pg.goto(URL); pg.wait_for_timeout(500); pg.click("#enter"); pg.wait_for_timeout(900)
        chk("no device voice is used for the greeting", pg.evaluate("window.__spoken.length")==0)
        pg.fill("#nm", "محمد"); pg.click("[data-a=start]"); pg.wait_for_timeout(300); pg.evaluate("(()=>{const u=me();u.arm='learner';sv()})()")
        pg.evaluate("window.__sayN=0;const _s=say;window.say=(t,e)=>{window.__sayN++;return _s(t,e)}")
        pg.click("[data-a=vans]"); pg.wait_for_timeout(300)
        chk("a spoken answer is understood and applied", pg.evaluate("S.ans.serve")=="hot", pg.evaluate("JSON.stringify(S.ans)"))
        # find a multiple-choice question and toggle twice
        multi = False
        for _ in range(8):
            if pg.query_selector("#pk"): multi = True; break
            first_answers(pg, 1)
        n0 = pg.evaluate("window.__sayN"); opts = pg.query_selector_all("#ops .opt")
        if multi and len(opts) >= 2:
            opts[0].click(); opts[1].click(); pg.wait_for_timeout(200)
        chk("the question is spoken once, not on every choice in a multiple-choice question", multi and pg.evaluate("window.__sayN")==n0 and len(pg.query_selector_all("#ops .opt.on"))==2, f"{n0}->{pg.evaluate('window.__sayN')}")
        if pg.query_selector("[data-a=cont]"): pg.click("[data-a=cont]")
        chk("flow reaches a recipe", finish_flow(pg))
        chk("recipe has a favourites button and a free-text opinion box", pg.query_selector("[data-a=fav]") and pg.query_selector("#fbt"))
        pg.click("[data-a=rate][data-n='4']"); pg.wait_for_timeout(100)
        pg.click("[data-a=fav]"); pg.wait_for_timeout(200)
        chk("recipe was added to favourites", pg.evaluate("me().favs.length")==1)
        pg.fill("#fbt", "كانت حامضة شوية، وأنا بحب الشوكولاتة ومبحبش الفواكه وعايزها تصحصحني"); pg.click("[data-a=ftag][data-id='too-heavy']"); pg.click("[data-a=fbsend]"); pg.wait_for_timeout(200)
        pr = pg.evaluate("me().prefs"); nt = pg.evaluate("me().notes")
        chk("the opinion is stored and turned into rules (likes, avoids, caffeine, tags)", len(nt)==1 and pr["pf"].get("nutty-cocoa")==1 and pr["pf"].get("fruity")==-1 and pr["caf"]=="kick" and pr["pa"]<=-0.5 and pr["pb"]<=-0.5, json.dumps(pr, ensure_ascii=False))
        chk("the box stays available for another opinion", pg.query_selector("#fbt") is not None and "حدوتة سجّل" in pg.inner_text("#view"))
        # second recipe so the curve has 2 points
        pg.evaluate("ACT.again()"); pg.wait_for_timeout(150); finish_flow(pg); pg.click("[data-a=rate][data-n='2']"); pg.wait_for_timeout(100)
        tab(pg, "#favorites")
        chk("favourites page lists the recipe", len(pg.query_selector_all("a.rrow"))==1)
        pg.click("a.rrow"); pg.wait_for_timeout(300)
        chk("clicking opens the full recipe on its own page", pg.evaluate("location.hash").startswith("#recipe/") and "التحويجة" in pg.inner_text("#view") and "رأيك وتجربتك" in pg.inner_text("#view"))
        tab(pg, "#more")
        txt = pg.inner_text("#view")
        chk("menu has favourites, shopping list and usage", all(x in txt for x in ["المفضلة", "قايمة التسوق", "استخدامي"]))
        tab(pg, "#usage"); u = pg.inner_text("#view")
        chk("usage page: stats + curve + rules + opinions + recipe titles; no download button, no star list", all(x in u for x in ["منحنى رضاك", "حدوتة لاحظ إيه", "آراؤك وتعليقاتك", "وصفاتك"]) and "نزّل بياناتي" not in u and "★" not in u and "تقييماتك نزلت" not in u and pg.query_selector("svg polyline") is not None)
        chk("usage lists what Hadota noted about taste", "بتحب نكهات مكسرات وكاكاو" in u and "بتتجنّب نكهات فواكه" in u)
        n_rows = len(pg.query_selector_all("a.rrow")); pg.click("a.rrow"); pg.wait_for_timeout(250)
        chk("a recipe title in usage opens the recipe page", n_rows==2 and pg.evaluate("location.hash").startswith("#recipe/"))
        tab(pg, "#shop"); pid = pg.evaluate("BEANS[0].id")
        chk("shop warns that it is not ready", "المتجر لسه مش جاهز" in pg.inner_text("#view"))
        tab(pg, f"#product/{pid}"); pt = pg.inner_text("#view")
        chk("each product has its own page with the not-ready message", "المتجر لسه مش جاهز" in pt and "الوصف الكامل: لسه جاي" in pt)
        pg.click("[data-a=bag]"); pg.wait_for_timeout(150); tab(pg, "#shoplist")
        chk("shopping list shows the product with a link", pg.query_selector(f"a[href='#product/{pid}']") is not None)
        tab(pg, "#blog"); aid = pg.evaluate("ARTICLES[0].id"); pg.click(f"a[href='#article/{aid}']"); pg.wait_for_timeout(250)
        chk("a blog post opens on its own page", pg.evaluate("location.hash")==f"#article/{aid}" and pg.query_selector("article.card h2") is not None)
        # sound stops when the app is hidden
        st = pg.evaluate("(async()=>{await new Promise(r=>setTimeout(r,300));if(!ac)return 'noctx';Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));await new Promise(r=>setTimeout(r,200));const a=ac.state;Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'));await new Promise(r=>setTimeout(r,200));return a+'/'+ac.state})()")
        chk("café sound is suspended when the app is hidden and resumes when it is back", st.startswith("suspended/"), st)
        chk("the device voice was never used", pg.evaluate("window.__spoken.length")==0)
        pg.close()
        # ---------- recorded voice clips ----------
        ctxv = b.new_context(); pg = ctxv.new_page(); pg.add_init_script(STUB("v1"))
        pg.add_init_script("window.__audio=[];window.Audio=function(s){this.src=s;window.__audio.push(s);this.play=()=>{setTimeout(()=>this.onended&&this.onended(),5);return Promise.resolve()};this.pause=()=>{}};")
        pg.route("**/assets/voice/manifest.json", lambda r: r.fulfill(body=json.dumps({"أيوة جاااي": "ar-EG/a.mp3"}), content_type="application/json"))
        pg.goto(URL); pg.wait_for_timeout(500); pg.click("#enter"); pg.wait_for_timeout(800)
        chk("recorded male clip plays, device voice stays silent", any("a.mp3" in s for s in pg.evaluate("window.__audio")) and pg.evaluate("window.__spoken.length")==0); pg.close(); ctxv.close()
        # ---------- tables: members-only, approval by every member ----------
        A_ = user(ctx, "a1", "أحمد"); B_ = user(ctx, "b1", "منى"); C_ = user(ctx, "c1", "كريم"); D_ = user(ctx, "d1", "سارة")
        tab(A_, "#community"); A_.click("[data-a=ctab][data-t=tables]"); A_.wait_for_timeout(200)
        A_.fill("#tt", "تركي بالهيل"); A_.select_option("#tc", "4"); A_.click("[data-a=mk]"); A_.wait_for_timeout(500)
        tid = A_.evaluate("TB[0].id")
        chk("creating a table opens the created table immediately", A_.evaluate("location.hash") == f"#table/{tid}" and "تركي بالهيل" in A_.inner_text("#view"))
        for q in (B_, C_, D_): tab(q, "#community"); q.click("[data-a=ctab][data-t=tables]"); q.wait_for_timeout(500)
        chk("an outsider sees the table but not its members", "🔒" in B_.inner_text("#tl") and B_.evaluate("TB[0].members.length")==0 and "أحمد" not in B_.inner_text("#tl"))
        tab(B_, f"#table/{tid}"); chk("an outsider cannot open the chat or the table feed", "للأعضاء بس" in B_.inner_text("#view") and B_.query_selector("#msgs") is None)
        C_.click(f"[data-a=rjoin][data-id='{tid}']"); C_.wait_for_timeout(500); chk("joining needs a request", C_.evaluate("TB[0].myReq")=="pending" and C_.evaluate("TB[0].n")==1)
        tab(A_, f"#table/{tid}"); A_.click("[data-a=ttab][data-t=members]"); A_.wait_for_timeout(400)
        A_.click("[data-a=vote][data-v='1']"); A_.wait_for_timeout(500)
        chk("with one member, that member's approval seats the newcomer", A_.evaluate("TB[0].n")==2)
        B_.click(f"[data-a=rjoin][data-id='{tid}']"); B_.wait_for_timeout(500)
        tab(A_, f"#table/{tid}"); A_.click("[data-a=ttab][data-t=members]"); A_.wait_for_timeout(400); A_.click("[data-a=vote][data-v='1']"); A_.wait_for_timeout(500)
        chk("one approval is not enough when the table has two members", A_.evaluate("TB[0].n")==2 and B_.evaluate("TB[0].myReq")=="pending")
        tab(C_, f"#table/{tid}"); C_.click("[data-a=ttab][data-t=members]"); C_.wait_for_timeout(400); C_.click("[data-a=vote][data-v='1']"); C_.wait_for_timeout(600)
        chk("after EVERY member approved, the newcomer is a member", A_.evaluate("TB[0].n")==3 and "منى" in A_.inner_text("#view"))
        D_.click(f"[data-a=rjoin][data-id='{tid}']"); D_.wait_for_timeout(500)
        tab(A_, f"#table/{tid}"); A_.click("[data-a=ttab][data-t=members]"); A_.wait_for_timeout(400); A_.click("[data-a=vote][data-v='0']"); A_.wait_for_timeout(500)
        chk("one rejection rejects the request", D_.evaluate("TB[0].myReq")=="rejected" and A_.evaluate("TB[0].n")==3)
        # chat visible to members only
        tab(B_, f"#table/{tid}"); B_.fill("#mi", "صباح الخير"); B_.click("[data-a=sendm]"); B_.wait_for_timeout(500)
        tab(A_, f"#table/{tid}"); A_.click("[data-a=ttab][data-t=chat]"); A_.wait_for_timeout(500)
        chk("members see the chat", "صباح الخير" in A_.inner_text("#msgs"))
        # ---------- news feed: posts, photo, like, comment, repost, table-only posts ----------
        tab(A_, "#community"); A_.click("[data-a=ctab][data-t=feed]"); A_.wait_for_timeout(500)
        A_.fill("#pt", "أول منشور في الحكواتية ☕"); A_.click("[data-a=ppost]"); A_.wait_for_timeout(600)
        tab(D_, "#community"); D_.click("[data-a=ctab][data-t=feed]"); D_.wait_for_timeout(600)
        chk("public posts are visible to everyone, even outside tables", "أول منشور" in D_.inner_text("#fd"))
        D_.click("[data-a=plike]"); D_.wait_for_timeout(500); chk("like works", "❤️ 1" in D_.inner_text("#fd"))
        D_.click("[data-a=pcm]"); D_.wait_for_timeout(300); D_.fill("input[id^=ci-]", "منشور حلو"); D_.click("[data-a=pcsend]"); D_.wait_for_timeout(600)
        chk("comments work", "منشور حلو" in D_.inner_text("#fd"))
        D_.click("[data-a=prepost]"); D_.wait_for_timeout(700); chk("repost works", "أعاد النشر" in D_.inner_text("#fd") or "🔁 1" in D_.inner_text("#fd"))
        with D_.expect_file_chooser() as fc: D_.click("[data-a=pimg]")
        fc.value.set_files({"name": "a.png", "mimeType": "image/png", "buffer": png()}); D_.wait_for_timeout(500)
        D_.fill("#pt", "صورة من عندي"); D_.click("[data-a=ppost]"); D_.wait_for_timeout(800)
        chk("photo posts show the image", D_.query_selector("#fd img.pmed") is not None)
        # table-only post
        tab(B_, f"#table/{tid}"); B_.click("[data-a=ttab][data-t=feed]"); B_.wait_for_timeout(400)
        B_.fill("#pt", "سر الترابيزة"); B_.click("[data-a=ppost]"); B_.wait_for_timeout(700)
        tab(A_, f"#table/{tid}"); A_.click("[data-a=ttab][data-t=feed]"); A_.wait_for_timeout(600)
        chk("table feed is visible to members", "سر الترابيزة" in A_.inner_text("#fd"))
        # A table-selected post from the community composer should open that table feed.
        tab(A_, "#community"); A_.click("[data-a=ctab][data-t=feed]"); A_.wait_for_timeout(400)
        A_.select_option("#pa", tid); A_.fill("#pt", "منشور من صفحة المجتمع للترابيزة")
        A_.click("[data-a=ppost]"); A_.wait_for_timeout(700)
        chk("a table-targeted community post opens the correct private feed", A_.evaluate("location.hash") == f"#table/{tid}" and "منشور من صفحة المجتمع للترابيزة" in A_.inner_text("#fd"))
        tab(D_, "#community"); D_.click("[data-a=ctab][data-t=feed]"); D_.wait_for_timeout(600)
        chk("private table posts do NOT show in the public feed (آخر الأخبار)", "سر الترابيزة" not in D_.inner_text("#fd") and "منشور من صفحة المجتمع للترابيزة" not in D_.inner_text("#fd"))
        tab(A_, "#usage"); A_.wait_for_timeout(600); chk("usage shows my community activity", "نشاطك في المجتمع" in A_.inner_text("#view") and "أول منشور" in A_.inner_text("#act"))
        # ---------- every route opens without errors, signed in or not ----------
        for who in ("guest", "user"):
            ctxr = b.new_context(viewport={"width": 420, "height": 900}); pr = ctxr.new_page(); e2 = []
            pr.on("pageerror", lambda e, l=e2: l.append(str(e))); pr.add_init_script(STUB("r1")); pr.goto(URL); pr.wait_for_timeout(300); pr.click("#enter")
            if who == "user": pr.fill("#nm", "رنا"); pr.click("[data-a=start]"); pr.wait_for_timeout(200); finish_flow(pr)
            for r in ["#home","#ask","#favorites","#usage","#profile","#more","#shop","#shoplist","#product/"+pr.evaluate("BEANS[1].id"),"#product/nope","#blog","#article/"+pr.evaluate("ARTICLES[1].id"),"#article/nope","#chat","#community","#account","#table/nope","#recipe/nope","#recipe/"+(pr.evaluate("me()&&me().history[0]?rid(me().history[0]):'x'")),"#nonexistent"]:
                pr.evaluate(f"location.hash='{r}'"); pr.wait_for_timeout(120)
            chk(f"all routes open without JavaScript errors ({who})", not e2, "; ".join(e2[:2])); ctxr.close()
        chk("no JavaScript errors", not errs, "; ".join(errs[:3]))
        b.close()
finally: srv.terminate()
print("\nALL PASSED" if all(res) else f"\n{res.count(False)} FAILED"); sys.exit(0 if all(res) else 1)
