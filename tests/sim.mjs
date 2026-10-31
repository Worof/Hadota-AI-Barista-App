// Offline evaluation of the recommender: simulated users with a HIDDEN taste rate what they get.
// Everything here uses the real engine.js, so the numbers describe the shipped logic.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));

export function loadEngine(file = path.join(here, "..", "engine.js")) {
  const src = fs.readFileSync(file, "utf8");
  return new Function(src + "\nreturn {BEANS,DRINKS,FLAVORS,FAMILIES,ADDONS,nextQuestion,recommend,recommendBlend,featuresOf,newModel,learn,stats,trust,rewardOfRating,drinkById,many,one,roundShares,pickRoast,scoreBean,FEEDBACK_TAGS,applyFeedback,tagsFromText,REC_CFG};")();
}

export function rng(seed) { // mulberry32
  let a = seed >>> 0;
  const r = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  r.pick = (arr) => arr[Math.floor(r() * arr.length)];
  r.normal = () => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  return r;
}

/** A user with a stable hidden taste. Ratings come from this, never from the engine. */
export function makeUser(E, r) {
  const fams = E.FAMILIES.map((f) => f.id);
  const likes = new Set([r.pick(fams), r.pick(fams)]);
  return { acid: Math.floor(r() * 4), body: Math.floor(r() * 4), sweet: Math.floor(r() * 4), roast: Math.floor(r() * 4), likes, noise: 0.45 };
}

/** True satisfaction (about -1..1) of a recommended blend for this user. */
export function utility(E, u, rec) {
  const x = rec.x, n = x.length, famStart = 4, famEnd = n - 1;
  const loss = (Math.abs(x[0] - u.acid / 3) + Math.abs(x[1] - u.body / 3) + Math.abs(x[2] - u.sweet / 3) + Math.abs(x[n - 1] - u.roast / 3)) / 4;
  const ids = E.FAMILIES.map((f) => f.id);
  let like = 0; ids.forEach((id, i) => { if (u.likes.has(id)) like += x[famStart + i]; });
  like = Math.min(1, like / 1.5);
  return 0.2 - 1.7 * loss + 0.9 * like;
}
export const ratingOf = (u, util, r) => Math.max(1, Math.min(5, Math.round(3 + 2.6 * util + u.noise * r.normal())));

/** The user answers the questionnaire. Stated taste is only partly informative (people describe themselves badly). */
export function answerFlow(E, u, r, interp = 0.6) {
  let a = {};
  for (let g = 0; g < 30; g++) {
    const res = E.nextQuestion(a); a = res.answers;
    if (!res.question) return a;
    const q = res.question, opts = q.options(a);
    let pick;
    const closest = (target, order) => order.find((o) => opts.some((x) => x.id === o));
    if (q.id === "acidity" && r() < interp) pick = ["soft", "balanced", "bright", "bright"][u.acid];
    else if (q.id === "body" && r() < interp) pick = ["silky", "medium", "heavy", "heavy"][u.body];
    else if (q.id === "roast" && r() < interp) pick = ["light", "medium", "mediumdark", "dark"][u.roast];
    if (!pick || !opts.some((o) => o.id === pick)) pick = r.pick(opts).id;
    if (q.multi) {
      const n = 1 + Math.floor(r() * Math.min(3, q.max || 2));
      const ids = new Set(); for (let i = 0; i < n; i++) ids.add(r.pick(opts).id);
      let arr = [...ids]; const ex = arr.find((x) => x === "any" || x === "none"); if (ex) arr = [ex];
      a[q.id] = arr;
    } else a[q.id] = pick;
  }
  return a;
}

/** What a user would tap after tasting: the biggest mismatch between the blend and their hidden taste. */
export function simTags(u, rec, rating, r) {
  if (rating >= 5 || r() > (rating <= 3 ? 0.7 : 0.35)) return [];
  const n = rec.x.length, d = { a: rec.x[0] * 3 - u.acid, b: rec.x[1] * 3 - u.body, s: rec.x[2] * 3 - u.sweet, r: rec.x[n - 1] * 3 - u.roast };
  const k = Object.keys(d).sort((p, q) => Math.abs(d[q]) - Math.abs(d[p]))[0];
  if (Math.abs(d[k]) < 0.8) return rating >= 4 ? ["perfect"] : [];
  const map = { a: ["too-acidic", "not-bright"], b: ["too-heavy", "too-light"], s: ["too-sweet", "not-sweet"], r: ["too-bitter", "too-pale"] };
  return [map[k][d[k] > 0 ? 0 : 1]];
}

/** policy: "random" | "rules" | "bandit" (the shipped learner). Returns per-session mean rating. */
export function runSim({ E = loadEngine(), users = 200, sessions = 30, seed = 1, policy = "bandit", interp = 0.6 } = {}) {
  const r = rng(seed);
  const sum = Array(sessions).fill(0), hi = Array(sessions).fill(0), regret = Array(sessions).fill(0), expl = Array(sessions).fill(0);
  for (let k = 0; k < users; k++) {
    const u = makeUser(E, r); let model = E.newModel(12), prefs = undefined;
    for (let s = 0; s < sessions; s++) {
      const a = answerFlow(E, u, r, interp);
      let rec;
      if (policy === "random") {
        const d = E.drinkById(E.one(a, "drink")); const bean = r.pick(E.BEANS);
        const roast = E.pickRoast(a, d, E.many(a, "flavor")); const blend = [{ bean, percent: 100 }];
        rec = { x: E.featuresOf(blend, roast), explored: false };
      } else if (policy === "oracle") {
        const d = E.drinkById(E.one(a, "drink")), roast = E.pickRoast(a, d, E.many(a, "flavor"));
        rec = E.BEANS.map((bean) => ({ x: E.featuresOf([{ bean, percent: 100 }], roast), explored: false })).sort((p, q) => utility(E, u, q) - utility(E, u, p))[0];
      } else rec = E.recommend(a, policy.startsWith("bandit") ? model : null, policy.endsWith("prefs") ? prefs : undefined);
      const util = utility(E, u, rec), rating = ratingOf(u, util, r);
      sum[s] += rating; hi[s] += rating >= 4 ? 1 : 0; expl[s] += rec.explored ? 1 : 0;
      if (policy.startsWith("bandit")) model = E.learn(model, rec.x, E.rewardOfRating(rating));
      if (policy.endsWith("prefs")) prefs = E.applyFeedback(prefs, simTags(u, rec, rating, r));
    }
  }
  return { mean: sum.map((v) => v / users), hit: hi.map((v) => v / users), explored: expl.map((v) => v / users) };
}
const avg = (a, i, j) => a.slice(i, j).reduce((x, y) => x + y, 0) / (j - i);
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const users = +(process.argv[2] || 200), sessions = +(process.argv[3] || 30);
  const out = {};
  for (const p of ["random", "rules", "bandit", "bandit+prefs"]) out[p] = runSim({ users, sessions, policy: p, seed: 7 });
  console.log("policy   first5  last5   lift(last5-first5)  hit>=4(last5)");
  for (const p of Object.keys(out)) { const m = out[p].mean, f = avg(m, 0, 5), l = avg(m, sessions - 5, sessions); console.log(p.padEnd(8), f.toFixed(2).padStart(6), l.toFixed(2).padStart(7), (l - f).toFixed(2).padStart(12), avg(out[p].hit, sessions - 5, sessions).toFixed(2).padStart(18)); }
}
