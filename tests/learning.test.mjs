// Does the agent really learn? These tests fail if learning silently breaks.
import test from "node:test";
import assert from "node:assert/strict";
import { loadEngine, runSim, rng, makeUser, answerFlow, utility, ratingOf } from "./sim.mjs";

const E = loadEngine();
const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;

test("ratings map to rewards in [-1, 1]", () => { assert.equal(E.rewardOfRating(1), -1); assert.equal(E.rewardOfRating(3), 0); assert.equal(E.rewardOfRating(5), 1); });

test("learning is deterministic and does not mutate the old model", () => {
  const m = E.newModel(12), x = Array(12).fill(0.5), before = JSON.stringify(m);
  const m2 = E.learn(m, x, 1); assert.equal(JSON.stringify(m), before); assert.equal(m2.n, 1); assert.deepEqual(E.learn(m, x, 1), m2);
});

test("re-rating the same blend replaces the old feedback instead of double counting", () => {
  const x = Array(12).fill(0.4); let m = E.learn(E.newModel(12), x, -1); const n = m.n; m = E.learn(m, x, 1, -1);
  assert.equal(m.n, n); const once = E.learn(E.newModel(12), x, 1);
  m.b.forEach((v, i) => assert.ok(Math.abs(v - once.b[i]) < 1e-9));
});

test("a liked style is predicted higher than a disliked one", () => {
  const like = [0.9, 0.2, 0.2, 0.3, 0.8, 0, 0, 0, 0, 0, 0, 0.1], dislike = [0.1, 0.9, 0.2, 0.3, 0, 0, 0, 0, 0.9, 0, 0, 0.9];
  let m = E.newModel(12); for (let i = 0; i < 6; i++) { m = E.learn(m, like, 1); m = E.learn(m, dislike, -1); }
  assert.ok(E.stats(m, like, 0).mean > E.stats(m, dislike, 0).mean + 0.3);
});

test("simulated users end up happier than where they started (lift >= +0.35 over 30 sessions)", () => {
  const s = runSim({ users: 120, sessions: 30, seed: 99, policy: "bandit+prefs" });
  const lift = avg(s.mean.slice(-5)) - avg(s.mean.slice(0, 5)); assert.ok(lift >= 0.35, `lift ${lift.toFixed(2)}`);
});

test("learning beats the non-learning rules and random baselines at session 25-30", () => {
  const f = (p) => avg(runSim({ users: 120, sessions: 30, seed: 5, policy: p }).mean.slice(-5));
  const learner = f("bandit+prefs"), rules = f("rules"), random = f("random");
  assert.ok(learner > rules + 0.4, `learner ${learner.toFixed(2)} vs rules ${rules.toFixed(2)}`);
  assert.ok(learner > random + 0.4, `learner ${learner.toFixed(2)} vs random ${random.toFixed(2)}`);
});

test("the learner is not the whole story: it stays below the oracle (the sim is not trivially solved)", () => {
  const f = (p) => avg(runSim({ users: 80, sessions: 30, seed: 3, policy: p }).mean.slice(-5));
  assert.ok(f("bandit+prefs") < f("oracle"));
});

test("neutral ratings (all 3) teach no preference: every blend is predicted at 0", () => {
  const r = rng(4), u = makeUser(E, r), a = answerFlow(E, u, r), base = E.recommend(a, null); let m = E.newModel(12);
  for (let i = 0; i < 6; i++) m = E.learn(m, base.x, E.rewardOfRating(3));
  for (const b of E.BEANS.slice(0, 8)) assert.ok(Math.abs(E.stats(m, E.featuresOf([{ bean: b, percent: 100 }], "medium"), 0).mean) < 1e-9);
});

test("the new-user cold start is just the rule-based answer (trust = 0)", () => {
  const r = rng(8); for (let i = 0; i < 50; i++) { const a = answerFlow(E, makeUser(E, r), r); assert.deepEqual(E.recommend(a, E.newModel(12)).blend, E.recommend(a, null).blend); }
});

test("feedback tags move the matching taste offset and stay within +-1.5", () => {
  let p = E.applyFeedback(undefined, ["too-acidic"]); assert.equal(p.pa, -0.5);
  p = E.applyFeedback(p, ["too-acidic", "too-acidic", "too-acidic", "too-acidic"]); assert.equal(p.pa, -1.5);
  p = E.applyFeedback(p, ["too-heavy"]); assert.equal(p.pb, -0.5); assert.equal(E.applyFeedback(p, ["perfect"]).pa, -1.5);
});

test("'too acidic' feedback makes the next recommendation less acidic, 'too bitter' makes it lighter", () => {
  const a = { serve: "hot", drink: "pour-over", gear: "pourover", flavor: [E.FLAVORS[0].id] };
  const base = E.recommend(a, null), calmer = E.recommend(a, null, E.applyFeedback(undefined, ["too-acidic", "too-acidic", "too-acidic"]));
  const acid = (rec) => rec.x[0]; assert.ok(acid(calmer) <= acid(base));
  const dark = E.recommend({ ...a, flavor: E.FLAVORS.filter((f) => f.family === "roasted").slice(0, 2).map((f) => f.id) }, null);
  const lighter = E.recommend({ ...a, flavor: E.FLAVORS.filter((f) => f.family === "roasted").slice(0, 2).map((f) => f.id) }, null, E.applyFeedback(undefined, ["too-bitter", "too-bitter"]));
  const idx = (x) => ["light", "medium", "mediumdark", "dark"].indexOf(x.roast); assert.ok(idx(lighter) <= idx(dark));
});

test("Arabic free text is turned into the right tags (and negation is handled)", () => {
  const T = E.tagsFromText;
  assert.deepEqual(T("القهوة حامضة أوي"), ["too-acidic"]);
  assert.ok(T("مش حامضة كفاية").includes("not-bright") && !T("مش حامضة كفاية").includes("too-acidic"));
  assert.ok(T("طعمها محروق").includes("too-bitter"));
  assert.ok(T("تقيلة زيادة").includes("too-heavy"));
  assert.ok(T("مش حلوة").includes("not-sweet"));
  assert.ok(T("تحفة مظبوطة").includes("perfect"));
  assert.deepEqual(T("عملتها أول مرة بالمية السخنة"), []);
});
