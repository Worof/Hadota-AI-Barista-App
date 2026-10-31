// Correctness tests: do recommendations obey coffee knowledge, not just "look plausible"?
// Run: npm test   (uses node:test, no dependencies)
import test from "node:test";
import assert from "node:assert/strict";
import { loadEngine, rng, answerFlow, makeUser } from "./sim.mjs";

const E = loadEngine();
const r = rng(2026);
const flows = [];                       // 1500 random complete questionnaires
for (let i = 0; i < 1500; i++) { const u = makeUser(E, r); const a = answerFlow(E, u, r, 0.5); const rec = E.recommend(a, null); if (rec) flows.push({ a, rec }); }

test("every random questionnaire ends in a recommendation", () => assert.ok(flows.length >= 1450, `only ${flows.length}/1500 produced one`));

test("blend shares are multiples of 5 and sum to exactly 100", () => {
  for (const { rec } of flows) { assert.equal(rec.blend.reduce((s, p) => s + p.percent, 0), 100); assert.ok(rec.blend.every((p) => p.percent % 5 === 0 && p.percent > 0)); assert.ok(rec.blend.length <= 3); }
});

test("grind size matches the brewing method (standard coffee practice)", () => {
  const want = { ibrik: "extrafine", espresso: "fine", moka: "medfine", aeropress: "medfine", french: "coarse", pourover: "medium", coldbrew: "coarse", phin: "medfine" };
  for (const { rec } of flows) assert.equal(rec.grind, want[rec.method], rec.method);
});

test("brew ratios stay inside accepted ranges (grams of coffee : ml of water)", () => {
  // [min, max] ml per gram; ranges from common barista guidance (espresso counts the volume that comes out)
  const range = { espresso: [2.5, 4.0] /* output VOLUME per gram: 9 g -> 30 ml incl. crema, i.e. ~1:2.4 by weight */, pourover: [13, 18.5], french: [12, 18.5], aeropress: [5, 17], coldbrew: [6, 9], moka: [6, 8], ibrik: [8, 11], phin: [4, 6] };
  for (const { rec } of flows) { const ratio = rec.dose.waterMl / rec.dose.grams, [lo, hi] = range[rec.method]; assert.ok(ratio >= lo && ratio <= hi, `${rec.method} ratio ${ratio.toFixed(2)} outside ${lo}-${hi}`); }
});

test("water temperature is in the 88-96 C window for hot brews that use hot water", () => {
  for (const { rec } of flows) if (rec.dose.tempC != null) assert.ok(rec.dose.tempC >= 88 && rec.dose.tempC <= 96, `${rec.method} ${rec.dose.tempC}`);
});

test("espresso shots are 1-3 and doses scale with shots (about 9 g and 30 ml per shot)", () => {
  for (const { rec } of flows.filter((f) => f.rec.method === "espresso")) { const s = rec.dose.shots; assert.ok(s >= 1 && s <= 3); assert.equal(rec.dose.grams, 9 * s); assert.equal(rec.dose.waterMl, 30 * s); }
});

test("traditional Turkish/Arabic coffee gets a medium-dark roast and an extra-fine grind", () => {
  for (const { a, rec } of flows.filter((f) => f.rec.drink.family === "traditional")) { assert.equal(rec.roast, "mediumdark"); assert.equal(rec.grind, "extrafine"); }
});

test("an explicit roast request is always respected", () => {
  for (const { a, rec } of flows) { const asked = E.one(a, "roast"); if (asked && asked !== "auto") assert.equal(rec.roast, asked); }
});

test("asking for a specific species returns blends led by that species", () => {
  for (const sp of ["arabica", "robusta", "liberica", "excelsa"]) {
    const a = { serve: "hot", drink: "espresso", gear: "espresso", origin: "species", species: sp };
    const rec = E.recommend(a, null); if (!rec) continue;
    assert.equal(rec.blend[0].bean.species, sp, `lead bean for ${sp}`);
  }
});

test("asking for a region puts a bean from that region first", () => {
  for (const region of ["africa", "americas", "asia", "arabia"]) {
    const a = { serve: "hot", drink: "espresso", gear: "espresso", origin: region };
    const rec = E.recommend(a, null); if (!rec) continue;
    assert.equal(rec.blend[0].bean.region, region);
  }
});

test("bright (fruity/floral) wishes lead to lighter roasts than roasted/smoky wishes", () => {
  const base = { serve: "hot", drink: "pour-over", gear: "pourover" }, drink = E.DRINKS.find((d) => d.id === "pour-over") ? "pour-over" : base.drink;
  const fruity = E.FLAVORS.filter((f) => f.family === "fruity").slice(0, 2).map((f) => f.id), roasted = E.FLAVORS.filter((f) => f.family === "roasted").slice(0, 2).map((f) => f.id);
  const idx = (x) => ["light", "medium", "mediumdark", "dark"].indexOf(x);
  const light = E.recommend({ ...base, drink, flavor: fruity }, null), dark = E.recommend({ ...base, drink, flavor: roasted }, null);
  if (light && dark) assert.ok(idx(light.roast) < idx(dark.roast), `${light.roast} vs ${dark.roast}`);
});

test("wanted flavours actually show up in the blend notes", () => {
  let hit = 0, total = 0;
  for (const { a, rec } of flows) { const want = E.many(a, "flavor"); if (!want.length) continue; total++; if (want.some((f) => rec.blend.some((p) => p.bean.notes.includes(f)))) hit++; }
  assert.ok(hit / total > 0.85, `only ${(100 * hit / total).toFixed(0)}% of requests have a matching note`);
});

test("the recommender is clearly better than picking a random bean (rule score)", () => {
  // average rule score of the recommended lead bean vs. a random bean for the same answers
  let better = 0, n = 0;
  for (const { a, rec } of flows.slice(0, 600)) { const d = E.drinkById(E.one(a, "drink")), roast = rec.roast; const mine = E.scoreBean(rec.blend[0].bean, a, d, roast); const rnd = E.BEANS[Math.floor(r() * E.BEANS.length)]; if (mine >= E.scoreBean(rnd, a, d, roast)) better++; n++; }
  assert.ok(better / n > 0.9, `lead bean beat a random bean only ${(100 * better / n).toFixed(0)}% of the time`);
});

test("spices are suggestions, never user add-ons (add-on question has no ground spices)", () => {
  for (const { rec } of flows) for (const id of rec.addons) { const x = E.ADDONS.find((y) => y.id === id); assert.ok(x, id); if (x.group === "spice") assert.ok(["rose-water", "orange-blossom"].includes(id), id); }
});

test("milk drinks never get a very light roast (milk needs body)", () => {
  for (const { a, rec } of flows) if (rec.milk && rec.milk.ml >= 100 && !E.one(a, "roast")) assert.notEqual(rec.roast, "light");
});

test("same answers, same recommendation (deterministic without a model)", () => {
  for (const { a, rec } of flows.slice(0, 100)) assert.deepEqual(E.recommend(a, null).blend, rec.blend);
});
