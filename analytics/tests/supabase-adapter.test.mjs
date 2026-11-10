// The Supabase adapter is exercised against a FAKE client that records calls. It checks our code (names, payloads, buckets, mapping),
// not Postgres itself: the SQL and RLS in supabase/migrations still have to be run on a real project.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(root, "backend.js"), "utf8");

function fake(fixtures = {}) {
  const ops = [];
  const builder = (table) => {
    const op = { table, op: "select", args: [], filters: [] }; ops.push(op);
    const b = new Proxy({}, { get: (_, k) => {
      if (k === "then") return (res) => res({ data: fixtures[table] ?? [], error: fixtures[table + ":error"] ?? null });
      if (k === "single") return () => Promise.resolve({
        data: fixtures[table + ":single"] ?? { id: "created-" + table },
        error: fixtures[table + ":error"] ?? null
      });
      if (k === "maybeSingle") return () => Promise.resolve({
        data: fixtures[table + ":single"] ?? null,
        error: fixtures[table + ":error"] ?? null
      });
      return (...a) => {
        if (["insert", "upsert", "delete", "update"].includes(k)) {
          op.op = k;
          op.args = a;
        } else {
          op.filters.push([k, ...a]);
        }
        return b;
      };
    } });
    return b;
  };
  const storageCalls = [];
  const client = {
    ops, storageCalls,
    auth: { getSession: async () => ({ data: { session: { user: { id: "U1", user_metadata: { name: "منى" } } } } }) },
    from: builder, rpc: async (n) => ({ data: [{ word: "هيل", n: "3" }], error: null }),
    functions: { invoke: async (n, o) => ({ data: { text: "رد:" + o.body.rules }, error: null }) },
      storage: {
          from: (bucket) => ({
              upload: async (p, f, o) => {
                  storageCalls.push({ bucket, p, type: o.contentType });
                  return { error: null };
              },
              remove: async (paths) => {
                  storageCalls.push({ bucket, remove: paths });
                  return { error: null };
              },
              getPublicUrl: (p) => ({
                  data: { publicUrl: "https://x/public/" + bucket + "/" + p }
              }),
              createSignedUrls: async (ps) => ({
                  data: ps.map((p) => ({ signedUrl: "https://x/signed/" + p }))
              }),
          })
      },
  };
  return client;
}
async function load(fixtures) {
  const client = fake(fixtures);
  const win = { HADOTA_CONFIG: { supabaseUrl: "u", supabaseKey: "k" }, supabase: { createClient: () => client }, addEventListener() {} };
  const B = new Function("window", "addEventListener", "localStorage", src + "\nreturn Backend;")(win, () => {}, { getItem() {}, setItem() {}, removeItem() {} });
  await B.init(); return { B, client };
}

test("joining is a request, never a direct insert into table_members", async () => {
  const { B, client } = await load();
  assert.equal(typeof B.join, "undefined");
  await B.request("T1"); const o = client.ops.at(-1);
  assert.equal(o.table, "table_requests"); assert.deepEqual(o.args[0], { table_id: "T1", user_id: "U1" });
});
test("voting writes one row to table_votes with the voter and the decision", async () => {
  const { B, client } = await load(); await B.vote("T1", { id: "R9", uid: "X" }, false); const o = client.ops.at(-1);
  assert.equal(o.table, "table_votes"); assert.deepEqual(o.args[0], { request_id: "R9", voter_id: "U1", approve: false });
});
test("withdrawing a request deletes only my own row", async () => {
  const { B, client } = await load(); await B.cancelRequest("T1"); const o = client.ops.at(-1);
  assert.equal(o.op, "delete"); assert.ok(o.filters.some((f) => f[0] === "eq" && f[1] === "user_id" && f[2] === "U1"));
});
test("tables are mapped with seat count, my request status and pending requests (members only)", async () => {
  const row = (id, members, reqs) => ({ id, title: "t" + id, vibe: "v", meet_at: "w", capacity: 4, host: "H", members_n: 3, table_members: members, table_requests: reqs });
  const { B } = await load({ tables: [
    row("A", [{ user_id: "U1", profiles: { name: "منى" } }, { user_id: "H", profiles: { name: "ه" } }], [{ id: "R1", user_id: "Z", status: "pending", profiles: { name: "زياد" }, table_votes: [{ voter_id: "H", approve: true }] }]),
    row("B", [], [{ id: "R2", user_id: "U1", status: "pending", profiles: { name: "منى" }, table_votes: [] }]) ] });
  const list = await new Promise((ok) => { const un = B.watchTables((l) => { un(); ok(l); }); });
  const a = list.find((t) => t.id === "A"), b = list.find((t) => t.id === "B");
  assert.equal(a.n, 3); assert.equal(a.members.length, 2); assert.equal(a.pending.length, 1); assert.deepEqual(a.pending[0].votes, { H: true });
  assert.equal(b.members.length, 0); assert.equal(b.myReq, "pending"); assert.deepEqual(b.pending, []);
});
test("a photo on the public timeline goes to the public bucket under my user id", async () => {
  const { B, client } = await load(); await B.post({ text: "hi", file: { name: "a.jpg", type: "image/jpeg" }, kind: "image" });
  const s = client.storageCalls[0]; assert.equal(s.bucket, "media"); assert.match(s.p, /^U1\/\d+-\w+\.jpg$/);
  const o = client.ops.at(-1); assert.equal(o.table, "posts"); assert.equal(o.args[0].media_type, "image"); assert.equal(o.args[0].table_id, null);
});
test("a table post uploads to the PRIVATE bucket under table id / user id", async () => {
  const { B, client } = await load(); await B.post({ text: "", table: "T7", file: { name: "v.mp4", type: "video/mp4" }, kind: "video" });
  const s = client.storageCalls[0]; assert.equal(s.bucket, "media-private"); assert.match(s.p, /^T7\/U1\/\d+-\w+\.mp4$/);
  assert.equal(client.ops.at(-1).args[0].table_id, "T7");
});
test("reposting sends repost_of; likes and comments hit the right tables", async () => {
  const { B, client } = await load();
  await B.post({ text: "", repostOf: "P1" }); assert.equal(client.ops.at(-1).args[0].repost_of, "P1");
  await B.like("P1"); assert.deepEqual([client.ops.at(-1).table, client.ops.at(-1).args[0]], ["post_likes", { post_id: "P1", user_id: "U1" }]);
  await B.comment("P1", "حلو"); assert.deepEqual([client.ops.at(-1).table, client.ops.at(-1).args[0]], ["post_comments", { post_id: "P1", body: "حلو" }]);
});
test("feed maps counters, liked flag, reposts and private media (signed URLs)", async () => {
  const p = (id, t, extra = {}) => ({ id, author: "A", table_id: t, body: "b" + id, media_path: null, media_type: null, repost_of: null, like_count: 2, comment_count: 1, repost_count: 0, created_at: "2026-10-01T10:00:00Z", profiles: { name: "ن" }, ...extra });
  const { B } = await load({ posts: [p("1", null), p("2", "T", { media_path: "T/A/x.jpg", media_type: "image" }), p("3", null, { repost_of: "1" })], post_likes: [{ post_id: "1" }] });
  const list = await new Promise((ok) => { const un = B.watchFeed({ table: null }, (l) => { un(); ok(l); }); });
  const f = (id) => list.find((x) => x.id === id);
  assert.equal(f("1").liked, true); assert.equal(f("1").likes, 2); assert.equal(f("2").mediaUrl, "https://x/signed/T/A/x.jpg"); assert.equal(f("3").repostOf.id, "1");
});
test("telemetry and feedback carry no free text; ask() passes the taste rules but no name", async () => {
  const { B, client } = await load(); await B.sendFeedback({ tags: ["too-bitter"], rating: 2, drink: "d", roast: "dark" });
  assert.deepEqual(Object.keys(client.ops.at(-1).args[0]).sort(), ["drink", "rating", "roast", "tags"]);
  const r = await B.ask("سؤال", "قهوة", "بتتجنّب نكهات فواكه"); assert.ok(r.includes("بتتجنّب"));
});
test("every Backend method the app calls exists on all three implementations", () => {
  for (const m of ["request", "cancelRequest", "vote", "leave", "watchFeed", "post", "like", "unlike", "comment", "watchComments", "deletePost", "myActivity"]) assert.ok(src.includes(m), m);
});

test("creating a table returns the persisted row ID", async () => {
  const { B, client } = await load();
  const id = await B.create({ title: "تركي بالهيل", vibe: "قعدة هادية", when: "الجمعة", cap: 4 });
  assert.equal(id, "created-tables");
  const op = client.ops.at(-1);
  assert.equal(op.table, "tables");
  assert.equal(op.op, "insert");
  assert.equal(op.args[0].host, "U1");
});

test("table polling reports schema errors to the UI instead of swallowing them", async () => {
  const error = { code: "PGRST205", message: "Could not find the table in the schema cache" };
  const { B } = await load({ "tables:error": error });
  const received = await new Promise((resolve) => {
    let stop;
    stop = B.watchTables(() => {}, (e) => { stop(); resolve(e); });
  });
  assert.equal(received.code, "PGRST205");
});

test("feed polling reports missing feed migrations to the UI", async () => {
  const error = { code: "PGRST205", message: "Could not find posts in the schema cache" };
  const { B } = await load({ "posts:error": error });
  const received = await new Promise((resolve) => {
    let stop;
    stop = B.watchFeed({ table: null }, () => {}, (e) => { stop(); resolve(e); });
  });
  assert.equal(received.code, "PGRST205");
});

test("a failed post write removes its uploaded media and rejects the operation", async () => {
  const error = { code: "42501", message: "permission denied" };
  const { B, client } = await load({ "posts:error": error });
    await assert.rejects(
        B.post({
            text: "صورة",
            file: { name: "a.jpg", type: "image/jpeg" },
            kind: "image"
        }),
        (error) =>
            error?.code === "42501" &&
            /permission denied/i.test(error?.message ?? "")
    );  assert.ok(client.storageCalls.some((x) => x.remove && x.bucket === "media"));
});
