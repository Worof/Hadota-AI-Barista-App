import { BEANS, type Bean, type Level, type Region, type Species } from '../content/beans';
import { FAMILIES, FLAVORS, type FamilyId, type Grind, type Roast } from '../content/catalog';
import { stats, trust, type Model } from './learn';
import { drinkById, type Drink, type Method, type Serve } from '../content/drinks';
import { many, one, type Answers } from './types';

export interface BlendPart { bean: Bean; percent: number }
export interface Dose { grams: number; waterMl: number; tempC: number | null; minutes: number; shots: number }
export interface Result {
  drink: Drink;
  serve: Serve;
  method: Method;
  blend: BlendPart[];
  roast: Roast;
  grind: Grind;
  dose: Dose;
  milk?: { id: string; ml: number };
  sweetness: { level: string; sweetener?: string; tsp: number };
  addons: string[];
  profile: { acidity: Level; body: Level; sweet: Level };
  aroma: FamilyId[];
  notes: string[];
  /** feature vector of the chosen blend, kept so ratings can teach the personal model */
  x: number[];
  /** true when the personal model picked a different blend than the plain taste match (exploring) */
  explored: boolean;
  learnedFrom: number;
}

/** Round shares to multiples of 5 that sum to exactly 100 (largest remainder). */
export function roundShares(raw: number[]): number[] {
  const sum = raw.reduce((a, b) => a + b, 0) || 1;
  const units = raw.map((r) => (r / sum) * 20);
  const base = units.map(Math.floor);
  let left = 20 - base.reduce((a, b) => a + b, 0);
  const order = units.map((u, i) => ({ i, f: u - Math.floor(u) })).sort((a, b) => b.f - a.f);
  for (const o of order) {
    if (left <= 0) break;
    base[o.i] += 1;
    left -= 1;
  }
  return base.map((b) => b * 5);
}

const FAMILY_OF = new Map(FLAVORS.map((f) => [f.id, f.family]));
const ROAST_ORDER: Roast[] = ['light', 'medium', 'mediumdark', 'dark'];

function targetAcidity(a: Answers, d: Drink, flavors: string[]): number {
  const ans = one(a, 'acidity');
  if (ans === 'soft') return 0.5;
  if (ans === 'balanced') return 2;
  if (ans === 'bright') return 3;
  if (d.family === 'traditional') return 0.5;
  if (d.milkMl > 20) return 1;
  const fams = flavors.map((f) => FAMILY_OF.get(f));
  const bright = fams.filter((f) => f === 'fruity' || f === 'floral').length;
  return bright > fams.length / 2 ? 3 : 1.5;
}

function targetBody(a: Answers, d: Drink): number {
  const ans = one(a, 'body');
  if (ans === 'silky') return 1;
  if (ans === 'medium') return 2;
  if (ans === 'heavy') return 3;
  if (d.family === 'traditional') return 3;
  return { light: 1, medium: 2, strong: 3 }[one(a, 'strength') ?? 'medium'] ?? 2;
}

export function pickRoast(a: Answers, d: Drink, flavors: string[]): Roast {
  const asked = one(a, 'roast');
  if (asked && asked !== 'auto') return asked as Roast;
  if (d.family === 'traditional') return 'mediumdark';
  const fams = flavors.map((f) => FAMILY_OF.get(f));
  const n = (x: FamilyId) => fams.filter((f) => f === x).length;
  let r = 1; // medium
  if (n('fruity') + n('floral') > n('roasted') + n('spices')) r = 0;
  if (n('roasted') + n('spices') > n('fruity') + n('floral')) r = 2;
  if (n('roasted') >= 2) r = 3;
  if (d.milkMl >= 100 && r < 2) r += 1; // milk drinks need more roast to stand up to milk
  if (one(a, 'serve') === 'iced' && d.id.startsWith('cold-brew') && r === 0) r = 1;
  return ROAST_ORDER[Math.min(3, r)];
}

export function scoreBean(b: Bean, a: Answers, d: Drink, roast: Roast): number {
  const flavors = many(a, 'flavor');
  const aroma = many(a, 'aroma') as FamilyId[];
  let s = 0;
  s += 3 - Math.abs(b.acidity - targetAcidity(a, d, flavors)) * 1.2;
  s += 3 - Math.abs(b.body - targetBody(a, d));
  s += Math.min(3, flavors.filter((f) => b.notes.includes(f)).length) * 2.2;
  s += aroma.filter((f) => b.aroma.includes(f)).length * 1.2;
  if (b.roasts.includes(roast)) s += 1.2;
  const caf = one(a, 'caffeine');
  if (caf === 'gentle') s += (3 - b.caffeine) * 0.8;
  if (caf === 'kick') s += b.caffeine * 0.9;
  const origin = one(a, 'origin');
  if (origin && ['africa', 'americas', 'asia', 'arabia'].includes(origin) && b.region === (origin as Region)) s += 3.5;
  if (origin === 'species' && b.species === one(a, 'species')) s += 6;
  if (d.milkMl >= 100 && b.body >= 2) s += 0.8;
  return s;
}

function blendFrom(lead: { b: Bean; s: number }, rest: { b: Bean; s: number }[], lo: number): BlendPart[] {
  const top = [lead, ...rest];
  const shares = roundShares(top.map((t) => (t.s - lo + 1) ** 2));
  return top
    .map((t, i) => ({ bean: t.b, percent: shares[i] }))
    .filter((x) => x.percent > 0)
    .sort((x, y) => y.percent - x.percent);
}

const ROAST_N = ROAST_ORDER.length - 1;
/** Context vector of a blend: taste levels, aroma-family shares and roast (12 numbers, all 0..1). No constant term, so the model compares blends rather than just reflecting overall mood. */
export function featuresOf(blend: BlendPart[], roast: Roast): number[] {
  const w = (f: (b: Bean) => number) => blend.reduce((s, p) => s + f(p.bean) * p.percent, 0) / 100 / 3;
  const fam = FAMILIES.map((f) => blend.reduce((s, p) => s + (p.bean.aroma.includes(f.id) ? p.percent : 0), 0) / 100);
  return [w((b) => b.acidity), w((b) => b.body), w((b) => b.sweet), w((b) => b.caffeine), ...fam, ROAST_ORDER.indexOf(roast) / ROAST_N];
}

/**
 * Candidate blends are ranked by taste match; if the user has a personal model (LinUCB-style
 * contextual bandit trained on their ratings) it re-ranks them: rewards what they liked, penalises
 * what they did not, and adds an exploration bonus for unfamiliar styles.
 */
export function recommendBlend(a: Answers, d: Drink, roast: Roast, model?: Model): { blend: BlendPart[]; explored: boolean } {
  const scored = BEANS.map((b) => ({ b, s: scoreBean(b, a, d, roast) })).sort((x, y) => y.s - x.s);
  const lo = scored[scored.length - 1].s;
  const cands = scored.slice(0, 6).map((lead, i) => {
    const rest = scored.slice(i + 1, i + 3); // sliding windows: candidates use genuinely different beans
    const blend = blendFrom(lead, rest, lo);
    const base = blend.reduce((s, p) => s + (scored.find((q) => q.b.id === p.bean.id)?.s ?? 0) * p.percent, 0) / 100;
    return { blend, base };
  });
  const bases = cands.map((c) => c.base);
  const span = Math.max(...bases) - Math.min(...bases) + 1e-6;
  const tw = model ? trust(model.n) : 0;
  const st = cands.map((c) => (model && tw > 0 ? stats(model, featuresOf(c.blend, roast), 0.35) : { mean: 0, bonus: 0 }));
  const avg = st.reduce((s, x) => s + x.mean, 0) / st.length; // compare blends with each other, not with the user's overall mood
  const ranked = cands.map((c, i) => {
    const norm = (c.base - Math.min(...bases)) / span;
    return { i, score: norm + tw * (4 * (st[i].mean - avg) + 0.6 * st[i].bonus) };
  }).sort((x, y) => y.score - x.score);
  return { blend: cands[ranked[0].i].blend, explored: ranked[0].i !== 0 };
}

const GRIND: Record<Method, Grind> = { ibrik: 'extrafine', espresso: 'fine', moka: 'medfine', aeropress: 'medfine', french: 'coarse', pourover: 'medium', coldbrew: 'coarse', phin: 'medfine' };

function doseFor(method: Method, d: Drink, a: Answers): Dose {
  const strength = one(a, 'strength') ?? 'medium';
  let shots = Math.max(1, d.shots || 1);
  if (d.family === 'espresso') {
    shots = Math.min(3, Math.max(1, shots + (strength === 'strong' ? 1 : 0) - (strength === 'light' && shots > 1 ? 1 : 0)));
    if (many(a, 'addons').includes('extra-shot')) shots = Math.min(3, shots + 1);
  }
  const k = { light: 0.9, medium: 1, strong: 1.15 }[strength] ?? 1;
  const r1 = (n: number) => Math.round(n * 10) / 10;
  switch (method) {
    case 'ibrik': return { grams: r1(7 * k), waterMl: 70, tempC: null, minutes: 3, shots: 1 };
    case 'espresso': return { grams: 9 * shots, waterMl: 30 * shots, tempC: 93, minutes: 0.5, shots };
    case 'moka': return { grams: r1(8 * shots), waterMl: 56 * shots, tempC: null, minutes: 4, shots };
    case 'aeropress': return { grams: r1(7.5 * shots), waterMl: 50 * shots, tempC: 90, minutes: 2, shots };
    case 'french': return { grams: r1(15 * k), waterMl: 240, tempC: 94, minutes: 4, shots: 1 };
    case 'pourover': return { grams: r1(15 * k), waterMl: 240, tempC: 94, minutes: 3, shots: 1 };
    case 'coldbrew': return { grams: r1(40 * k), waterMl: 320, tempC: null, minutes: 840, shots: 1 };
    case 'phin': return { grams: r1(20 * k), waterMl: 100, tempC: 92, minutes: 5, shots: 1 };
  }
}

const TSP: Record<string, number> = { none: 0, light: 0.5, medium: 1, sweet: 2 };

export function recommend(a: Answers, model?: Model): Result | undefined {
  const d = drinkById(one(a, 'drink') ?? '');
  const method = one(a, 'gear') as Method | undefined;
  if (!d || !method) return undefined;
  const flavors = many(a, 'flavor');
  const roast = pickRoast(a, d, flavors);
  const { blend, explored } = recommendBlend(a, d, roast, model);
  const w = (f: (b: Bean) => number) => Math.round(blend.reduce((s, p) => s + f(p.bean) * p.percent, 0) / 100) as Level;
  const wantedNotes = flavors.filter((f) => blend.some((p) => p.bean.notes.includes(f)));
  const blendNotes = blend.flatMap((p) => p.bean.notes);
  const notes = [...new Set([...wantedNotes, ...blendNotes])].slice(0, 5);
  const level = one(a, 'sweetness') ?? 'none';
  return {
    drink: d,
    serve: (one(a, 'serve') as Serve) ?? 'hot',
    method,
    blend,
    roast,
    grind: GRIND[method],
    dose: doseFor(method, d, a),
    milk: d.milkMl > 0 ? { id: one(a, 'milk') ?? 'whole', ml: d.milkMl } : undefined,
    sweetness: { level, sweetener: one(a, 'sweetener'), tsp: TSP[level] ?? 0 },
    addons: many(a, 'addons').filter((x) => x !== 'none'),
    profile: { acidity: w((b) => b.acidity), body: w((b) => b.body), sweet: w((b) => b.sweet) },
    aroma: [...new Set(blend.flatMap((p) => p.bean.aroma))].slice(0, 3),
    notes,
    x: featuresOf(blend, roast),
    explored,
    learnedFrom: model?.n ?? 0,
  };
}

export const speciesOf = (r: Result): Species[] => [...new Set(r.blend.map((p) => p.bean.species))];
