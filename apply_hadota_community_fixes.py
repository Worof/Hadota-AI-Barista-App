#!/usr/bin/env python3
# Apply the prepared community fixes from the repository root:
# python apply_hadota_community_fixes.py
#
# Only these files are changed:
# backend.js, app.js, tests/supabase-adapter.test.mjs,
# tests/features.py, docs/DEPLOY.ar.md
#
# The original files are backed up in .hadota-community-fix-backup/.
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path.cwd()
FILES = {
    "backend.js": ROOT / "backend.js",
    "app.js": ROOT / "app.js",
    "adapter": ROOT / "tests/supabase-adapter.test.mjs",
    "features": ROOT / "tests/features.py",
    "deploy": ROOT / "docs/DEPLOY.ar.md",
}
BACKUP = ROOT / ".hadota-community-fix-backup"

def read(path):
    if not path.is_file():
        raise FileNotFoundError(f"Required project file not found: {path.relative_to(ROOT)}")
    return path.read_text(encoding="utf-8")

def replace_once(source, old, new, label):
    count = source.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one matching source block, found {count}. No files have been written.")
    return source.replace(old, new, 1)

# Read all source files before making any change.
backend = read(FILES["backend.js"])
app_lines = read(FILES["app.js"]).splitlines()
adapter = read(FILES["adapter"])
features = read(FILES["features"])
deploy = read(FILES["deploy"])

# ---------- backend.js ----------
backend = replace_once(
    backend,
    ' const poll=(fn,cb,ms)=>{let on=true;const run=async()=>{try{const r=await fn();if(on)cb(r)}catch(e){}};run();const t=setInterval(run,ms);return()=>{on=false;clearInterval(t)}};',
    ' const poll=(fn,cb,ms,onError)=>{let on=true,inFlight=false,lastError="";const run=async()=>{if(!on||inFlight)return;inFlight=true;try{const r=await fn();if(!on)return;lastError="";cb(r)}catch(e){if(on&&onError){const key=String(e&&((e.code||"")+":"+(e.message||""))||e);if(key!==lastError){lastError=key;try{onError(e)}catch(_){}}}}finally{inFlight=false}};run();const t=setInterval(run,ms);return()=>{on=false;clearInterval(t)}};',
    "polling error callback"
)
backend = replace_once(
    backend,
    'if(need.length){const{data}=await c.storage.from("media-private").createSignedUrls(need.map(p=>p.media_path),3600);(data||[]).forEach',
    'if(need.length){const{data,error}=await c.storage.from("media-private").createSignedUrls(need.map(p=>p.media_path),3600);if(error)throw error;(data||[]).forEach',
    "signed media URL error handling"
)
backend = replace_once(
    backend,
    '  const liked=new Set((lk.data||[]).map(x=>x.post_id)),orig=new Map((og.data||[]).map(x=>[x.id,x])),urls=await mediaUrls([...data,...(og.data||[])]);',
    '  chk(lk);chk(og);const liked=new Set((lk.data||[]).map(x=>x.post_id)),orig=new Map((og.data||[]).map(x=>[x.id,x])),urls=await mediaUrls([...data,...(og.data||[])]);',
    "secondary feed query error handling"
)
backend = replace_once(backend, '  watchTables:cb=>poll(tables,cb,5000),',
                      '  watchTables:(cb,onError)=>poll(tables,cb,5000,onError),', "Supabase table watcher")
backend = replace_once(backend, '  watchMessages:(id,cb)=>poll(()=>msgs(id),cb,3500),',
                      '  watchMessages:(id,cb,onError)=>poll(()=>msgs(id),cb,3500,onError),', "Supabase message watcher")
backend = replace_once(
    backend,
    '  async create(t){chk(await c.from("tables").insert({title:t.title,vibe:t.vibe,meet_at:t.when,capacity:t.cap,host:user.id}))},',
    '  async create(t){const{data,error}=await c.from("tables").insert({title:t.title,vibe:t.vibe,meet_at:t.when,capacity:t.cap,host:user.id}).select("id").single();if(error)throw error;return data&&data.id||null},',
    "verified Supabase table creation"
)
backend = replace_once(backend, '  watchFeed:(scope,cb)=>poll(()=>feed(scope),cb,6000),',
                      '  watchFeed:(scope,cb,onError)=>poll(()=>feed(scope),cb,6000,onError),', "Supabase feed watcher")
backend = replace_once(
    backend,
    '''  async post({text,table,file,kind,repostOf}){let path=null,type=null;
   if(file){type=kind;const ext=((file.name||"").split(".").pop()||(kind==="video"?"mp4":"jpg")).replace(/[^a-z0-9]/gi,"").slice(0,5)||"bin",name=Date.now()+"-"+Math.random().toString(36).slice(2,7)+"."+ext;
    path=table?table+"/"+user.id+"/"+name:user.id+"/"+name;const up=await c.storage.from(table?"media-private":"media").upload(path,file,{contentType:file.type||(kind==="video"?"video/mp4":"image/jpeg"),upsert:false});if(up.error)throw up.error}
   chk(await c.from("posts").insert({body:text||"",table_id:table||null,media_path:path,media_type:type,repost_of:repostOf||null}))},''',
    '''  async post({text,table,file,kind,repostOf}){let path=null,type=null,bucket=table?"media-private":"media";
   if(file){type=kind;const ext=((file.name||"").split(".").pop()||(kind==="video"?"mp4":"jpg")).replace(/[^a-z0-9]/gi,"").slice(0,5)||"bin",name=Date.now()+"-"+Math.random().toString(36).slice(2,7)+"."+ext;
    path=table?table+"/"+user.id+"/"+name:user.id+"/"+name;const up=await c.storage.from(bucket).upload(path,file,{contentType:file.type||(kind==="video"?"video/mp4":"image/jpeg"),upsert:false});if(up.error)throw up.error}
   try{const{data,error}=await c.from("posts").insert({body:text||"",table_id:table||null,media_path:path,media_type:type,repost_of:repostOf||null}).select("id").single();if(error)throw error;return data&&data.id||null}
   catch(e){if(path){try{await c.storage.from(bucket).remove([path])}catch(_){}}throw e}},''',
    "post confirmation and uploaded-file cleanup"
)
backend = replace_once(backend, '  watchComments:(id,cb)=>poll(()=>cmts(id),cb,5000),',
                      '  watchComments:(id,cb,onError)=>poll(()=>cmts(id),cb,5000,onError),', "Supabase comments watcher")
backend = replace_once(
    backend,
    'const watch=(path,order,cb)=>{let un=()=>{},dead=false;ready.then(()=>{if(!db||dead)return;try{un=db.collection(path).orderBy(order[0],order[1]).limit(100).onSnapshot(s=>cb(s.docs.map(d=>d.data())),()=>{})}catch(e){}});return()=>{dead=true;try{un()}catch(e){}}};',
    'const watch=(path,order,cb,onError)=>{let un=()=>{},dead=false;ready.then(()=>{if(!db||dead){if(!db&&!dead&&onError)onError(new Error("no-preview-db"));return}try{un=db.collection(path).orderBy(order[0],order[1]).limit(100).onSnapshot(s=>{if(!dead)cb(s.docs.map(d=>d.data()))},e=>{if(!dead&&onError)onError(e)})}catch(e){if(!dead&&onError)onError(e)}});return()=>{dead=true;try{un()}catch(e){}}};',
    "preview watcher errors"
)
backend = replace_once(
    backend,
    ' watchTables:cb=>{keep();return watch("tables",["at","desc"],d=>cb(d.map(mapTable)))}',
    ' watchTables:(cb,onError)=>{keep();return watch("tables",["at","desc"],d=>cb(d.map(mapTable)),onError)}',
    "preview table watcher"
)
backend = replace_once(
    backend,
    ' watchMessages:(id,cb)=>watch("tables/"+id+"/msgs",["at","asc"],cb),',
    ' watchMessages:(id,cb,onError)=>watch("tables/"+id+"/msgs",["at","asc"],cb,onError),',
    "preview message watcher"
)
backend = replace_once(
    backend,
    ' async create(t){need();const id="t"+gid();await db.doc("tables/"+id).set({id,title:t.title,vibe:t.vibe,when:t.when,cap:t.cap,host:uid,at:Date.now(),members:[{id:uid,name:acct.name}],requests:{}})},',
    ' async create(t){need();const id="t"+gid();await db.doc("tables/"+id).set({id,title:t.title,vibe:t.vibe,when:t.when,cap:t.cap,host:uid,at:Date.now(),members:[{id:uid,name:acct.name}],requests:{}});return id},',
    "preview create returns ID"
)
backend = replace_once(
    backend,
    ''' watchFeed:(scope,cb)=>{keep();return watch("feed",["at","desc"],d=>{const mt=myTables();rawF=d;const vis=d.filter(p=>scope&&scope.table?p.table===scope.table&&mt.has(p.table):!p.table);
  cb(vis.map(p=>({...shapeP(p,d),repostOf:p.repostOf?(()=>{const o=d.find(x=>x.id===p.repostOf);return o?shapeP(o,d):{missing:true}})():null})))})},''',
    ''' watchFeed:(scope,cb,onError)=>{keep();return watch("feed",["at","desc"],d=>{const mt=myTables();rawF=d;const vis=d.filter(p=>scope&&scope.table?p.table===scope.table&&mt.has(p.table):!p.table);
  cb(vis.map(p=>({...shapeP(p,d),repostOf:p.repostOf?(()=>{const o=d.find(x=>x.id===p.repostOf);return o?shapeP(o,d):{missing:true}})():null})))},onError)},''',
    "preview feed watcher"
)
backend = replace_once(
    backend,
    ''' async post({text,table,file,kind,repostOf}){need();let media=null;if(file){if(kind==="video")throw new Error("video-unsupported");if(file.size>260*1024)throw new Error("media-too-big");media={type:"image",dataUrl:await blobToUrl(file)}}
  const id="p"+gid();await db.doc("feed/"+id).set({id,uid,name:acct.name,text:text||"",at:Date.now(),table:table||null,media,repostOf:repostOf||null,likes:{},commentCount:0})},''',
    ''' async post({text,table,file,kind,repostOf}){need();let media=null;if(file){if(kind==="video")throw new Error("video-unsupported");if(file.size>260*1024)throw new Error("media-too-big");media={type:"image",dataUrl:await blobToUrl(file)}}
  const id="p"+gid();await db.doc("feed/"+id).set({id,uid,name:acct.name,text:text||"",at:Date.now(),table:table||null,media,repostOf:repostOf||null,likes:{},commentCount:0});return id},''',
    "preview post returns ID"
)
backend = replace_once(
    backend,
    ' watchComments:(id,cb)=>watch("feed/"+id+"/comments",["at","asc"],cb),',
    ' watchComments:(id,cb,onError)=>watch("feed/"+id+"/comments",["at","asc"],cb,onError),',
    "preview comments watcher"
)

# ---------- app.js ----------
def find_line(lines, predicate, label):
    hits = [i for i, line in enumerate(lines) if predicate(line.strip())]
    if len(hits) != 1:
        raise RuntimeError(f"app.js {label}: expected one match, found {len(hits)}")
    return hits[0]

i = find_line(app_lines, lambda x: x.startswith("const errMsg=e=>{"), "error mapper")
app_lines[i] = 'const errMsg=e=>{const m=String(e&&e.message||e),code=String(e&&e.code||""),all=code+" "+m;return/no-server/.test(m)?"المجتمع مش متصل بسيرفر. حط بيانات Supabase في config.js.":/PGRST200|PGRST204|PGRST205|42P01|42703|schema cache|could not find (the )?(table|column|relationship)/i.test(all)?"إعدادات قاعدة بيانات الحكواتية ناقصة أو غير محدثة. شغّلي supabase/schema.sql أولاً، وبعده supabase/migrations/002_social_and_requests.sql من محرر SQL في سوبابيز.":/Failed to fetch|NetworkError|Load failed|fetch failed/i.test(m)?"الاتصال بقاعدة بيانات الحكواتية فشل. اتأكدي من الإنترنت وإعدادات المشروع وحاولي تاني.":/table_full|full/.test(m)?"الترابيزة كملت.":/confirm-email/.test(m)?"بعتنالك إيميل تأكيد. أكّديه وبعدين سجّلي دخول.":/Invalid login/.test(m)?"البريد أو كلمة السر غلط.":/no-preview-db|no-account/.test(m)?"مش قادر أوصل لقاعدة بيانات الترابيزات. أعد تحميل الصفحة وجرّبي تاني.":/row-level|permission|policy|42501/i.test(all)?"مش مسموحلك العملية دي. راجعي صلاحيات قاعدة البيانات وسياسات الأمان.":m};'
i = find_line(app_lines, lambda x: x.startswith("const errM=e=>{"), "community error mapper")
app_lines[i] = 'const errM=e=>{const m=String(e&&e.message||e);return/media-too-big/.test(m)?"الصورة كبيرة على المعاينة. جرّبي صورة أصغر.":/video-unsupported/.test(m)?"الفيديو مش مدعوم في المعاينة (شغّال على النسخة المنشورة).":/not-member/.test(m)?"الأعضاء بس يقدروا يصوّتوا.":/repost_private/.test(m)?"مينفعش تعيدي نشر منشور ترابيزة برّا الترابيزة.":/duplicate key|already exists|23505/.test(m)?"انت عملتي الطلب ده قبل كده.":errMsg(e)};'
i = find_line(app_lines, lambda x: x.startswith("const favBtn=e=>{"), "community error status")
app_lines[i:i] = [
    'let COMMUNITY_ERRORS={};',
    'const communityErrorsHTML=()=>Object.values(COMMUNITY_ERRORS).map(m=>"<p>"+esc(m)+"</p>").join("");',
    'const communityStatus=()=>\'<div id="community-errors" class="card warn \'+(Object.keys(COMMUNITY_ERRORS).length?"":"hide") + \'" role="alert">\'+communityErrorsHTML()+"</div>";',
    'function updateCommunityErrors(){const el=$("#community-errors");if(!el)return;el.innerHTML=communityErrorsHTML();el.classList.toggle("hide",Object.keys(COMMUNITY_ERRORS).length===0)}',
    'function showCommunityError(key,e){const message=errMsg(e);COMMUNITY_ERRORS[key]=message;if($("#community-errors"))updateCommunityErrors();else toast(message)}',
    'function clearCommunityError(key){if(COMMUNITY_ERRORS[key]){delete COMMUNITY_ERRORS[key];updateCommunityErrors()}}'
]
i = find_line(app_lines, lambda x: x.startswith("async mk(){"), "create table action")
app_lines[i] = 'async mk(){const t=$("#tt").value.trim();if(t.length<2){$("#tt").focus();return}try{const id=await Backend.create({title:t,vibe:$("#tv").value,when:$("#tw").value.trim(),cap:+$("#tc").value});$("#tt").value="";clearCommunityError("tables");if(id){TT="feed";LASTT=id;location.hash="#table/"+id}else watchT();toast("الترابيزة اتفتحت")}catch(e){toast(errMsg(e))}},'
i = find_line(app_lines, lambda x: x.startswith('return`<h2>${T.nav.community}</h2><p class="mute">أهلاً يا'), "community view")
app_lines[i] = app_lines[i].replace('return`<h2>', 'return`${communityStatus()}<h2>')
i = find_line(app_lines, lambda x: x.startswith("V.table=()=>"), "table view")
app_lines[i] = app_lines[i].replace(
    'back=`<a href="#community" data-a="ctab" data-t="tables">← الترابيزات</a>`;',
    'back=`<a href="#community" data-a="ctab" data-t="tables">← الترابيزات</a>`,status=communityStatus();'
)
i = find_line(app_lines, lambda x: x.startswith('if(!t){TBK="n";'), "missing table branch")
app_lines[i] = app_lines[i].replace('return`${back}', 'return`${back}${status}')
i = find_line(app_lines, lambda x: x.startswith('if(!mine(t)){TBK="o";'), "outsider table branch")
app_lines[i] = app_lines[i].replace('return`${back}${head}', 'return`${back}${status}${head}')
i = find_line(app_lines, lambda x: x.startswith('return`${back}${head}${tabs(TT,'), "member table branch")
app_lines[i] = app_lines[i].replace('return`${back}${head}', 'return`${back}${status}${head}')
i = find_line(app_lines, lambda x: x.startswith("const watchT=()=>"), "table watcher")
app_lines[i] = app_lines[i].replace('Backend.watchTables(l=>{TB=l;', 'Backend.watchTables(l=>{clearCommunityError("tables");TB=l;')
i = find_line(app_lines, lambda x: x.startswith('const sel=$("#pa");'), "table watcher error callback")
if not app_lines[i].endswith("}}));"):
    raise RuntimeError("watchT closing block did not match expected source")
app_lines[i] = app_lines[i][:-5] + '}},e=>showCommunityError("tables",e)));'
i = find_line(app_lines, lambda x: x.startswith("const watchM=()=>"), "message watcher")
app_lines[i] = app_lines[i].replace('Backend.watchMessages(tid(),l=>{MS=l;', 'Backend.watchMessages(tid(),l=>{clearCommunityError("messages");MS=l;')
if not app_lines[i].endswith("}}));"):
    raise RuntimeError("watchM closing block did not match expected source")
app_lines[i] = app_lines[i][:-5] + '}},e=>showCommunityError("messages",e)));'
i = find_line(app_lines, lambda x: x.startswith("const watchF=scope=>"), "feed watcher")
app_lines[i] = 'const watchF=scope=>{FS=scope;FW&&FW();FW=Backend.watchFeed(scope,l=>{clearCommunityError("feed");FEED=l;updF()},e=>showCommunityError("feed",e))};'
i = find_line(app_lines, lambda x: x.startswith("async ppost(t){"), "post action")
app_lines[i] = 'async ppost(t){const txt=($("#pt").value||"").trim(),tbl=t.dataset.t||($("#pa")?$("#pa").value:"")||null;if(!txt&&!PF){toast("اكتب حاجة أو اختار صورة أو فيديو");return}'
i = find_line(app_lines, lambda x: x.strip().startswith('try{await Backend.post({text:txt,table:tbl,'), "post action body")
app_lines[i] = ' try{await Backend.post({text:txt,table:tbl,file:PF&&PF.blob,kind:PF&&PF.kind});track("post_created",{table:!!tbl,media:PF?PF.kind:null});$("#pt").value="";PF=null;const pv=$("#pv");if(pv)pv.textContent="";'
app_lines.insert(i + 1, '  if(tbl&&page()==="community"){TT="feed";LASTT=tbl;location.hash="#table/"+tbl;toast("اتنشر في الترابيزة، وفتحنا منشوراتها")}else{watchF({table:tbl||null});toast(tbl?"اتنشر في الترابيزة":"اتنشر")}}catch(e){toast(errM(e))}},')
app = "\n".join(app_lines) + "\n"

# ---------- tests/supabase-adapter.test.mjs ----------
adapter = replace_once(
    adapter,
    '''      if (k === "then") return (res) => res({ data: fixtures[table] ?? [], error: fixtures[table + ":error"] ?? null });
      return (...a) => { if (["insert", "upsert", "delete", "update"].includes(k)) { op.op = k; op.args = a; } else op.filters.push([k, ...a]); if (k === "maybeSingle") return Promise.resolve({ data: null, error: null }); return b; };''',
    '''      if (k === "then") return (res) => res({ data: fixtures[table] ?? [], error: fixtures[table + ":error"] ?? null });
      if (k === "single") return Promise.resolve({ data: fixtures[table + ":single"] ?? { id: "created-" + table }, error: fixtures[table + ":error"] ?? null });
      return (...a) => { if (["insert", "upsert", "delete", "update"].includes(k)) { op.op = k; op.args = a; } else op.filters.push([k, ...a]); if (k === "maybeSingle") return Promise.resolve({ data: null, error: null }); return b; };''',
    "fake single response"
)
adapter = replace_once(
    adapter,
    '''      upload: async (p, f, o) => { storageCalls.push({ bucket, p, type: o.contentType }); return { error: null }; },
      getPublicUrl: (p) => ({ data: { publicUrl: "https://x/public/" + bucket + "/" + p } }),''',
    '''      upload: async (p, f, o) => { storageCalls.push({ bucket, p, type: o.contentType }); return { error: null }; },
      remove: async (paths) => { storageCalls.push({ bucket, remove: paths }); return { data: [], error: null }; },
      getPublicUrl: (p) => ({ data: { publicUrl: "https://x/public/" + bucket + "/" + p } }),''',
    "fake storage cleanup"
)
adapter += "\n" + "\n".join([
    'test("creating a table returns the persisted row ID", async () => {',
    '  const { B, client } = await load();',
    '  const id = await B.create({ title: "تركي بالهيل", vibe: "قعدة هادية", when: "الجمعة", cap: 4 });',
    '  assert.equal(id, "created-tables");',
    '  const op = client.ops.at(-1);',
    '  assert.equal(op.table, "tables");',
    '  assert.equal(op.op, "insert");',
    '  assert.equal(op.args[0].host, "U1");',
    '});',
    '',
    'test("table polling reports schema errors to the UI instead of swallowing them", async () => {',
    '  const error = { code: "PGRST205", message: "Could not find the table in the schema cache" };',
    '  const { B } = await load({ "tables:error": error });',
    '  const received = await new Promise((resolve) => {',
    '    let stop;',
    '    stop = B.watchTables(() => {}, (e) => { stop(); resolve(e); });',
    '  });',
    '  assert.equal(received.code, "PGRST205");',
    '});',
    '',
    'test("feed polling reports missing feed migrations to the UI", async () => {',
    '  const error = { code: "PGRST205", message: "Could not find posts in the schema cache" };',
    '  const { B } = await load({ "posts:error": error });',
    '  const received = await new Promise((resolve) => {',
    '    let stop;',
    '    stop = B.watchFeed({ table: null }, () => {}, (e) => { stop(); resolve(e); });',
    '  });',
    '  assert.equal(received.code, "PGRST205");',
    '});',
    '',
    'test("a failed post write removes its uploaded media and rejects the operation", async () => {',
    '  const error = { code: "42501", message: "permission denied" };',
    '  const { B, client } = await load({ "posts:error": error });',
    '  await assert.rejects(B.post({ text: "صورة", file: { name: "a.jpg", type: "image/jpeg" }, kind: "image" }), /permission denied/);',
    '  assert.ok(client.storageCalls.some((x) => x.remove && x.bucket === "media"));',
    '});'
]) + "\n"

# ---------- tests/features.py ----------
features = replace_once(
    features,
    '        tid = A_.evaluate("TB[0].id")',
    '        tid = A_.evaluate("TB[0].id")\n        chk("creating a table opens the created table immediately", A_.evaluate("location.hash") == f"#table/{tid}" and "تركي بالهيل" in A_.inner_text("#view"))',
    "table creation navigation test"
)
old_feed = "\n".join([
    '        chk("table feed is visible to members", "سر الترابيزة" in A_.inner_text("#fd"))',
    '        tab(D_, "#community"); D_.click("[data-a=ctab][data-t=feed]"); D_.wait_for_timeout(600)',
    '        chk("table posts do NOT show in the public feed (آخر الأخبار)", "سر الترابيزة" not in D_.inner_text("#fd"))'
])
new_feed = "\n".join([
    '        chk("table feed is visible to members", "سر الترابيزة" in A_.inner_text("#fd"))',
    '        # A table-selected post from the community composer should open that table feed.',
    '        tab(A_, "#community"); A_.click("[data-a=ctab][data-t=feed]"); A_.wait_for_timeout(400)',
    '        A_.select_option("#pa", tid); A_.fill("#pt", "منشور من صفحة المجتمع للترابيزة")',
    '        A_.click("[data-a=ppost]"); A_.wait_for_timeout(700)',
    '        chk("a table-targeted community post opens the correct private feed", A_.evaluate("location.hash") == f"#table/{tid}" and "منشور من صفحة المجتمع للترابيزة" in A_.inner_text("#fd"))',
    '        tab(D_, "#community"); D_.click("[data-a=ctab][data-t=feed]"); D_.wait_for_timeout(600)',
    '        chk("private table posts do NOT show in the public feed (آخر الأخبار)", "سر الترابيزة" not in D_.inner_text("#fd") and "منشور من صفحة المجتمع للترابيزة" not in D_.inner_text("#fd"))'
])
features = replace_once(features, old_feed, new_feed, "table-targeted feed feature test")

# ---------- docs/DEPLOY.ar.md ----------
deploy = replace_once(
    deploy,
    '1. **Supabase** (supabase.com، خطة مجانية): اعمل Project جديد، افتح *SQL Editor* والصق `supabase/schema.sql` واضغط Run.',
    '1. **Supabase** (supabase.com، خطة مجانية): اعمل Project جديد، افتح *SQL Editor* وشغّل `supabase/schema.sql` أولاً، وبعد نجاحه شغّل `supabase/migrations/002_social_and_requests.sql`. الملف التاني ضروري للترابيزات وطلبات الانضمام والمنشورات والتفاعلات؛ من غيره المجتمع مش هيشتغل بالكامل.',
    "required community migration setup"
)
deploy = replace_once(
    deploy,
    '- كود الـ SQL والـ `backend.js` مكتوبين بعناية لكن **لم يتجربوا على مشروع Supabase حقيقي** (مفيش اتصال بالنت في البيئة اللي اتبنى فيها). لو طلع خطأ في الـ SQL Editor ابعتهولي.',
    '- بعد تشغيل الملفين، لو ظهر خطأ في تحميل الترابيزات أو المنشورات، راجعي رسالة الخطأ داخل التطبيق. أخطاء `PGRST200/204/205` أو `42P01/42703` غالباً معناها إن جدولاً أو عموداً أو علاقة مطلوبة غير موجودة أو لم تُحدّث في مخطط سوبابيز؛ أعيدي تشغيل ملف الترحيل الثاني بعد الملف الأساسي.',
    "migration troubleshooting"
)

# Verify changes before writing.
if "onError" not in backend or 'return data&&data.id||null' not in backend:
    raise RuntimeError("Backend verification failed.")
if "communityStatus()" not in app or 'location.hash="#table/"+tbl' not in app:
    raise RuntimeError("App verification failed.")
if adapter.count('test("') < 13:
    raise RuntimeError("Adapter test count unexpectedly low.")
if "table-targeted community post" not in features:
    raise RuntimeError("Browser feature test missing.")
if "002_social_and_requests.sql" not in deploy:
    raise RuntimeError("Deployment documentation missing.")

# JavaScript syntax checks are run before writing, when Node is installed.
def run_node_check(filename, content):
    node = shutil.which("node")
    if not node:
        return None
    import tempfile
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".js", delete=False) as tmp:
        tmp.write(content)
        temp_path = Path(tmp.name)
    try:
        return subprocess.run([node, "--check", str(temp_path)], capture_output=True, text=True)
    finally:
        temp_path.unlink(missing_ok=True)

for filename, content in [("backend.js", backend), ("app.js", app), ("supabase-adapter.test.mjs", adapter)]:
    result = run_node_check(filename, content)
    if result is not None and result.returncode != 0:
        raise RuntimeError(f"JavaScript syntax check failed for {filename}:\n{result.stderr}")

# Create backups first. No files have been written up to this point.
BACKUP.mkdir(exist_ok=True)
for path in FILES.values():
    shutil.copy2(path, BACKUP / (path.name + ".original"))

updates = {
    FILES["backend.js"]: backend,
    FILES["app.js"]: app,
    FILES["adapter"]: adapter,
    FILES["features"]: features,
    FILES["deploy"]: deploy,
}
for path, content in updates.items():
    path.write_text(content, encoding="utf-8", newline="\n")

print("Updated successfully:")
for path in updates:
    print(" -", path.relative_to(ROOT))
print("Original files backed up in:", BACKUP.relative_to(ROOT))
print("Coffee-only agent prompts/configuration were not modified.")
print("Run `npm test` and `npm run e2e` from the project root.")
