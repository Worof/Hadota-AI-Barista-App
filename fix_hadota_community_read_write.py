from pathlib import Path
from datetime import datetime
import shutil
import sys

ROOT = Path.cwd()
BACKUP_DIR = ROOT / (".hadota-community-fix-" + datetime.now().strftime("%Y%m%d-%H%M%S"))


def replace_once(source: str, old: str, new: str, label: str) -> str:
    count = source.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly 1 match, found {count}. No files were changed.")
    return source.replace(old, new, 1)


def read_file(name: str) -> str:
    path = ROOT / name
    if not path.is_file():
        raise FileNotFoundError(f"Could not find {name}. Run this script from the repository root.")
    return path.read_text(encoding="utf-8")


try:
    backend = read_file("backend.js")
    app = read_file("app.js")
    tests = read_file("tests/supabase-adapter.test.mjs")

    # Pin every profiles embed to its actual foreign-key constraint. This prevents
    # PostgREST from guessing when relationships are ambiguous or its cache is stale.
    backend = replace_once(
        backend,
        'const TCOLS="id,title,vibe,meet_at,capacity,host,members_n,table_members(user_id,profiles(name)),table_requests(id,user_id,status,profiles(name),table_votes(voter_id,approve))";',
        'const TCOLS="id,title,vibe,meet_at,capacity,host,members_n,table_members(user_id,profiles!table_members_user_id_fkey(name)),table_requests(id,user_id,status,profiles!table_requests_user_id_fkey(name),table_votes(voter_id,approve))";',
        "table and request profile relationships",
    )
    backend = replace_once(
        backend,
        'const PCOLS="id,author,table_id,body,media_path,media_type,repost_of,like_count,comment_count,repost_count,created_at,profiles(name)";',
        'const PCOLS="id,author,table_id,body,media_path,media_type,repost_of,like_count,comment_count,repost_count,created_at,profiles!posts_author_fkey(name)";',
        "post author relationship",
    )
    backend = replace_once(
        backend,
        'c.from("messages").select("id,body,created_at,user_id,profiles(name)")',
        'c.from("messages").select("id,body,created_at,user_id,profiles!messages_user_id_fkey(name)")',
        "message author relationship",
    )
    backend = replace_once(
        backend,
        'c.from("post_comments").select("id,body,created_at,user_id,profiles(name)")',
        'c.from("post_comments").select("id,body,created_at,user_id,profiles!post_comments_user_id_fkey(name)")',
        "comment author relationship",
    )

    # Never return a false success when the API did not return a persisted row ID.
    backend = replace_once(
        backend,
        'async create(t){const{data,error}=await c.from("tables").insert({title:t.title,vibe:t.vibe,meet_at:t.when,capacity:t.cap,host:user.id}).select("id").single();if(error)throw error;return data&&data.id||null},',
        'async create(t){const{data,error}=await c.from("tables").insert({title:t.title,vibe:t.vibe,meet_at:t.when,capacity:t.cap,host:user.id}).select("id").single();if(error)throw error;if(!data||!data.id)throw new Error("table-create-no-id");return data.id},',
        "table create result validation",
    )
    backend = replace_once(
        backend,
        'try{const{data,error}=await c.from("posts").insert({body:text||"",table_id:table||null,media_path:path,media_type:type,repost_of:repostOf||null}).select("id").single();if(error)throw error;return data&&data.id||null}',
        'try{const{data,error}=await c.from("posts").insert({body:text||"",table_id:table||null,media_path:path,media_type:type,repost_of:repostOf||null}).select("id").single();if(error)throw error;if(!data||!data.id)throw new Error("post-create-no-id");return data.id}',
        "post create result validation",
    )
    backend = replace_once(
        backend,
        'catch(e){if(path){try{await c.storage.from(bucket).remove([path])}catch(_){}}throw e}},',
        'catch(e){if(path){try{const{error:cleanupError}=await c.storage.from(bucket).remove([path]);if(cleanupError)console.error("Hadota media cleanup failed:",cleanupError)}catch(cleanupError){console.error("Hadota media cleanup failed:",cleanupError)}}throw e}},',
        "media cleanup diagnostics",
    )

    # Give relationship errors a readable message and require a returned ID before
    # showing any success toast in the UI.
    app = replace_once(
        app,
        'const errMsg=e=>{const m=String(e&&e.message||e),code=String(e&&e.code||""),all=code+" "+m;return/no-server/.test(m)?"المجتمع مش متصل بسيرفر. حط بيانات Supabase في config.js.":/PGRST200|PGRST204|PGRST205|42P01|42703|schema cache|could not find (the )?(table|column|relationship)/i.test(all)?',
        'const errMsg=e=>{const m=String(e&&e.message||e),code=String(e&&e.code||""),all=code+" "+m;return/no-server/.test(m)?"المجتمع مش متصل بسيرفر. حط بيانات Supabase في config.js.":/PGRST201|more than one relationship was found/i.test(all)?"تعذر تحميل أسماء الأعضاء بسبب تعارض في ربط بيانات الحسابات. حدّثي الصفحة، ولو استمر الخطأ بلّغينا.":/PGRST200|PGRST204|PGRST205|42P01|42703|schema cache|could not find (the )?(table|column|relationship)/i.test(all)?',
        "relationship error message",
    )
    app = replace_once(
        app,
        'const errM=e=>{const m=String(e&&e.message||e);return/media-too-big/.test(m)?',
        'const errM=e=>{const m=String(e&&e.message||e);return/table-create-no-id|post-create-no-id/.test(m)?"قاعدة البيانات ما أكدتش حفظ العملية، فمش هنعرضها كنجاح. جرّبي مرة تانية.":/media-too-big/.test(m)?',
        "save confirmation error message",
    )
    app = replace_once(
        app,
        'async mk(){const t=$("#tt").value.trim();if(t.length<2){$("#tt").focus();return}try{const id=await Backend.create({title:t,vibe:$("#tv").value,when:$("#tw").value.trim(),cap:+$("#tc").value});$("#tt").value="";clearCommunityError("tables");if(id){TT="feed";LASTT=id;location.hash="#table/"+id}else watchT();toast("الترابيزة اتفتحت")}catch(e){toast(errMsg(e))}},',
        'async mk(){const t=$("#tt").value.trim();if(t.length<2){$("#tt").focus();return}try{const id=await Backend.create({title:t,vibe:$("#tv").value,when:$("#tw").value.trim(),cap:+$("#tc").value});if(!id)throw new Error("table-create-no-id");$("#tt").value="";clearCommunityError("tables");TT="feed";LASTT=id;location.hash="#table/"+id;toast("الترابيزة اتفتحت")}catch(e){toast(errMsg(e))}},',
        "table creation success notification",
    )
    app = replace_once(
        app,
        'try{await Backend.post({text:txt,table:tbl,file:PF&&PF.blob,kind:PF&&PF.kind});track("post_created",{table:!!tbl,media:PF?PF.kind:null});',
        'try{const postId=await Backend.post({text:txt,table:tbl,file:PF&&PF.blob,kind:PF&&PF.kind});if(!postId)throw new Error("post-create-no-id");track("post_created",{table:!!tbl,media:PF?PF.kind:null});',
        "post creation success notification",
    )

    test_marker = 'test("profile embeds use explicit foreign keys to avoid PostgREST ambiguity"'
    if test_marker not in tests:
        tests += '''\n\ntest("profile embeds use explicit foreign keys to avoid PostgREST ambiguity", () => {\n  for (const hint of [\n    "profiles!table_members_user_id_fkey(name)",\n    "profiles!table_requests_user_id_fkey(name)",\n    "profiles!posts_author_fkey(name)",\n    "profiles!messages_user_id_fkey(name)",\n    "profiles!post_comments_user_id_fkey(name)"\n  ]) assert.ok(src.includes(hint), hint);\n});\n\ntest("creating a table rejects when Supabase does not return a persisted ID", async () => {\n  const { B } = await load({ "tables:single": {} });\n  await assert.rejects(\n    B.create({ title: "اختبار", vibe: "قعدة هادية", when: "", cap: 4 }),\n    /table-create-no-id/\n  );\n});\n\ntest("posting rejects a missing persisted ID and removes its uploaded image", async () => {\n  const { B, client } = await load({ "posts:single": {} });\n  await assert.rejects(\n    B.post({ text: "اختبار", file: { name: "a.jpg", type: "image/jpeg" }, kind: "image" }),\n    /post-create-no-id/\n  );\n  assert.ok(client.storageCalls.some((x) => x.remove && x.bucket === "media"));\n});\n\ntest("a successfully persisted image is kept in storage", async () => {\n  const { B, client } = await load();\n  const id = await B.post({\n    text: "صورة محفوظة",\n    file: { name: "a.jpg", type: "image/jpeg" },\n    kind: "image"\n  });\n  assert.equal(id, "created-posts");\n  assert.equal(client.storageCalls.some((x) => x.remove), false);\n});\n'''

    # All replacements are validated before the first write.
    targets = {
        "backend.js": backend,
        "app.js": app,
        "tests/supabase-adapter.test.mjs": tests,
    }
    BACKUP_DIR.mkdir(parents=True, exist_ok=False)
    for name in targets:
        path = ROOT / name
        backup = BACKUP_DIR / name.replace("/", "__")
        shutil.copy2(path, backup)
    for name, content in targets.items():
        (ROOT / name).write_text(content, encoding="utf-8", newline="\n")

    print("Community fixes applied successfully.")
    print(f"Backups: {BACKUP_DIR}")
    print("Updated: backend.js, app.js, tests/supabase-adapter.test.mjs")
    print("Next: run npm.cmd test (PowerShell) or npm test.")
except Exception as exc:
    print(f"Fix not applied: {exc}", file=sys.stderr)
    raise
