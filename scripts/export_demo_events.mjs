// Generates DEMO events with the same schema the app emits (result_shown / rated / feedback_sent / skipped),
// by running simulated users through the real engine. Half-synthetic data lets you test the analytics package end to end.
import fs from "node:fs"; import { loadEngine, rng, makeUser, answerFlow, utility, ratingOf, simTags } from "../tests/sim.mjs";
const E = loadEngine(), N = +(process.argv[2] || 300), SESSIONS = +(process.argv[3] || 18), out = process.argv[4] || "analytics/demo_events.jsonl";
const r = rng(2026), rows = []; let t0 = Date.parse("2026-09-01T09:00:00Z");
const FB = E.FEEDBACK_TAGS;
for (let k = 0; k < N; k++) {
  const uid = "u" + String(k).padStart(4, "0"), arm = r() < 0.1 ? "control" : "learner", u = makeUser(E, r);
  let model = E.newModel(12), prefs, t = t0 + Math.floor(r() * 14 * 864e5);
  const sessions = Math.max(2, Math.round(SESSIONS * (0.35 + r() * 0.9)));
  for (let s = 0; s < sessions; s++) {
    t += Math.floor((0.5 + r() * 3) * 864e5);
    const sid = uid + "-" + s, a = answerFlow(E, u, r);
    const learner = arm === "learner", rec = E.recommend(a, learner ? model : E.newModel(12), learner ? prefs : undefined);
    const pred = learner && model.n ? Math.round(E.stats(model, rec.x, 0).mean * 100) / 100 : null;
    const base = { user_id: uid, session: sid, arm };
    rows.push({ ...base, at: new Date(t).toISOString(), name: "result_shown", props: { drink: a.drink, method: rec.method, roast: rec.roast, beans: rec.blend.map((p) => p.bean.id), explored: rec.explored, pred, n_rated: model.n } });
    if (r() < 0.12) { rows.push({ ...base, at: new Date(t + 60e3).toISOString(), name: "skipped", props: { drink: a.drink } }); if (learner) model = E.learn(model, rec.x, -0.25); continue; }
    const rating = ratingOf(u, utility(E, u, rec), r);
    rows.push({ ...base, at: new Date(t + 90e3).toISOString(), name: "rated", props: { rating, drink: a.drink, roast: rec.roast, beans: rec.blend.map((p) => p.bean.id), explored: rec.explored, pred, rerate: 0 } });
    if (learner) model = E.learn(model, rec.x, E.rewardOfRating(rating));
    const tags = simTags(u, rec, rating, r);
    if (tags.length && r() < 0.8) { rows.push({ ...base, at: new Date(t + 150e3).toISOString(), name: "feedback_sent", props: { tags, chars: 20, rating } }); if (learner) prefs = E.applyFeedback(prefs, tags); }
    if (rating >= 4 && r() < 0.25) rows.push({ ...base, at: new Date(t + 200e3).toISOString(), name: "order_started", props: {} });
  }
}
rows.sort((x, y) => x.at.localeCompare(y.at));
fs.writeFileSync(out, rows.map((x) => JSON.stringify(x)).join("\n") + "\n");
console.log(rows.length, "events for", N, "users ->", out);
