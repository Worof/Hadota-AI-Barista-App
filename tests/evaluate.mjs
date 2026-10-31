// Held-out evaluation (seeds not used for tuning). Writes tests/results.json for the analytics report.
import fs from "node:fs"; import { loadEngine, runSim } from "./sim.mjs";
const users = +(process.argv[2] || 200), sessions = +(process.argv[3] || 30), seeds = [21, 22, 23, 24, 25];
const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const E = loadEngine(), Eold = loadEngine(new URL("../variants/old_default.js", import.meta.url).pathname);
const cases = [["random", E, "random"], ["rules only", E, "rules"], ["learner v1 (old settings)", Eold, "bandit"], ["learner v2 + tags (shipped)", E, "bandit+prefs"], ["oracle (upper bound)", E, "oracle"]];
const out = {};
for (const [name, eng, pol] of cases) {
  const runs = seeds.map((seed) => runSim({ E: eng, users, sessions, seed, policy: pol === "bandit" ? "bandit" : pol }));
  out[name] = { mean: runs[0].mean.map((_, i) => avg(runs.map((r) => r.mean[i]))), hit: runs[0].hit.map((_, i) => avg(runs.map((r) => r.hit[i]))), explored: runs[0].explored.map((_, i) => avg(runs.map((r) => r.explored[i]))) };
}
fs.writeFileSync(new URL("./results.json", import.meta.url), JSON.stringify({ users, sessions, seeds, out }, null, 1));
console.log("policy".padEnd(30), "first5  last5   lift   hit>=4(last5)");
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(30), avg(v.mean.slice(0, 5)).toFixed(2).padStart(6), avg(v.mean.slice(-5)).toFixed(2).padStart(7), (avg(v.mean.slice(-5)) - avg(v.mean.slice(0, 5))).toFixed(2).padStart(6), avg(v.hit.slice(-5)).toFixed(2).padStart(10));
