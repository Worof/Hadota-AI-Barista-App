// Free-text opinions and spoken answers: does Hadota understand and act on them?
import test from "node:test";
import assert from "node:assert/strict";
import { loadEngine, rng, answerFlow, makeUser } from "./sim.mjs";
const E = loadEngine();

test("likes and dislikes are read per clause, including 'and I don't like...'", () => {
  const r = E.extractRules("بحب الشوكولاتة والمكسرات ومبحبش الفواكه");
  assert.equal(r.pf["nutty-cocoa"], 1); assert.equal(r.pf.fruity, -1);
  assert.deepEqual(E.extractRules("مش بحب الحمضيات").pf, { fruity: -1 });
  assert.deepEqual(E.extractRules("عايز توابل وهيل").pf, { spices: 1 });
});
test("sentences with no preference cue change nothing", () => {
  assert.deepEqual(E.extractRules("النهارده الجو حلو أوي").pf, {});
  assert.deepEqual(E.extractRules("شربتها الصبح").pf, {});
});
test("caffeine wishes", () => {
  assert.equal(E.extractRules("عايز كافيين قليل").caf, "gentle");
  assert.equal(E.extractRules("عايزها تصحصحني").caf, "kick");
});
test("rules accumulate, are bounded at +-2, and never mutate the old prefs", () => {
  let p = undefined; const before = JSON.stringify(p);
  for (let i = 0; i < 5; i++) p = E.applyRules(p, E.extractRules("مبحبش الفواكه"));
  assert.equal(p.pf.fruity, -2); assert.equal(before, JSON.stringify(undefined));
  const q = E.applyRules(p, E.extractRules("بحب الفواكه")); assert.equal(q.pf.fruity, -1); assert.equal(p.pf.fruity, -2);
});
test("rule lines describe what Hadota believes, in Arabic", () => {
  const p = E.applyRules(E.applyFeedback(undefined, ["too-acidic", "too-acidic"]), E.extractRules("بحب الشوكولاتة، وعايز كافيين قليل"));
  const l = E.ruleLines(p);
  assert.ok(l.includes("بتفضّل حموضة أهدى") && l.includes("بتحب نكهات مكسرات وكاكاو") && l.includes("بتفضّل كافيين أقل"), l.join(" | "));
});
test("'I don't like fruity' really moves recommendations away from fruity beans", () => {
  const r = rng(11); let fruityBase = 0, fruityAfter = 0, n = 0;
  const prefs = E.applyRules(undefined, E.extractRules("مبحبش الفواكه والحمضيات"));
  for (let i = 0; i < 300; i++) {
    const a = answerFlow(E, makeUser(E, r), r); const b = E.recommend(a, null), c = E.recommend(a, null, prefs);
    if (!b) continue; n++;
    const share = (rec) => rec.blend.reduce((s, p) => s + (p.bean.aroma.includes("fruity") ? p.percent : 0), 0);
    fruityBase += share(b); fruityAfter += share(c);
  }
  assert.ok(fruityAfter < fruityBase * 0.85, `fruity share ${(fruityAfter / n).toFixed(1)} vs ${(fruityBase / n).toFixed(1)}`);
});
test("'I love chocolate' moves recommendations toward nutty-cocoa beans", () => {
  const r = rng(12); let a0 = 0, a1 = 0; const prefs = E.applyRules(undefined, E.extractRules("بحب الشوكولاتة والمكسرات"));
  for (let i = 0; i < 300; i++) { const a = answerFlow(E, makeUser(E, r), r); const b = E.recommend(a, null), c = E.recommend(a, null, prefs); if (!b) continue; const sh = (x) => x.blend.reduce((s, p) => s + (p.bean.aroma.includes("nutty-cocoa") ? p.percent : 0), 0); a0 += sh(b); a1 += sh(c); }
  assert.ok(a1 > a0 * 1.1, `${a1} vs ${a0}`);
});
test("a caffeine wish is used when the question was not answered", () => {
  const a = { serve: "hot", drink: "espresso", gear: "espresso" };
  const gentle = E.recommend(a, null, E.applyRules(undefined, E.extractRules("عايز كافيين قليل"))), kick = E.recommend(a, null, E.applyRules(undefined, E.extractRules("عايزها تصحصحني")));
  const caf = (r) => r.blend.reduce((s, p) => s + p.bean.caffeine * p.percent, 0) / 100;
  assert.ok(caf(gentle) <= caf(kick), `${caf(gentle)} vs ${caf(kick)}`);
});
test("spoken answers are matched to options (Egyptian phrasing)", () => {
  const hotIced = [{ id: "hot", label: "سخنة" }, { id: "iced", label: "ساقعة" }];
  assert.equal(E.matchOptions("عايزها سخنة", hotIced)[0].id, "hot");
  assert.equal(E.matchOptions("ساقعة لو سمحت", hotIced)[0].id, "iced");
  assert.equal(E.matchOptions("حاجة سقعة", hotIced)[0].id, "iced");
  assert.deepEqual(E.matchOptions("مش عارف", hotIced), []);
});
test("spoken answers work for multiple choice and drink names", () => {
  const drinks = [{ id: "espresso", label: "إسبريسو" }, { id: "latte", label: "لاتيه" }, { id: "cappuccino", label: "كابتشينو" }];
  assert.equal(E.matchOptions("لاتيه", drinks)[0].id, "latte");
  assert.equal(E.matchOptions("هاخد كابتشينو", drinks)[0].id, "cappuccino");
  const fam = E.FAMILIES.map((f) => ({ id: f.id, label: f.name.ar })), ids = E.matchOptions("فواكه وزهور", fam).map((x) => x.id);
  assert.ok(ids.includes("fruity") && ids.includes("floral"), ids.join());
});
test("Arabic normalisation unifies spelling variants", () => { assert.equal(E.normAr("الشُّوكولاتة"), E.normAr("الشوكولاته")); assert.equal(E.normAr("أإآ ى ة"), "ااا ي ه"); });
