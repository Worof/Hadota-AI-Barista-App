import { ADDONS, FAMILIES, FLAVORS, MILKS, SWEETENERS, type L } from '../content/catalog';
import { DRINKS, METHOD_NAMES, drinkById, type Drink } from '../content/drinks';
import { many, one, type Answers, type QId } from './types';

/** An option is labelled either by an i18n key (simple scales) or by a bilingual catalog entry. */
export interface Option { id: string; key?: string; label?: L }

export interface Question {
  id: QId;
  multi?: boolean;
  max?: number;
  /** only asked when this is true: this is what makes the series adapt to earlier answers */
  when: (a: Answers) => boolean;
  options: (a: Answers) => Option[];
}

const keyed = (q: QId, ids: string[]): Option[] => ids.map((id) => ({ id, key: `q.${q}.${id}` }));
export const drinkOf = (a: Answers): Drink | undefined => {
  const id = one(a, 'drink');
  return id ? drinkById(id) : undefined;
};
const blackish = (d?: Drink) => !!d && (d.family === 'brewed' ? d.milkMl === 0 : d.family === 'espresso' && d.milkMl <= 20);

export const QUESTIONS: Question[] = [
  { id: 'serve', when: () => true, options: () => keyed('serve', ['hot', 'iced']) },
  {
    id: 'drink',
    when: (a) => !!one(a, 'serve'),
    options: (a) => DRINKS.filter((d) => d.serve.includes(one(a, 'serve') as 'hot' | 'iced')).map((d) => ({ id: d.id, label: d.name })),
  },
  {
    id: 'gear',
    when: (a) => !!drinkOf(a),
    options: (a) => (drinkOf(a)?.methods ?? []).map((m) => ({ id: m, label: METHOD_NAMES[m] })),
  },
  { id: 'strength', when: (a) => !!drinkOf(a) && drinkOf(a)!.family !== 'traditional', options: () => keyed('strength', ['light', 'medium', 'strong']) },
  { id: 'acidity', when: (a) => blackish(drinkOf(a)), options: () => keyed('acidity', ['soft', 'balanced', 'bright', 'any']) },
  { id: 'body', when: (a) => blackish(drinkOf(a)), options: () => keyed('body', ['silky', 'medium', 'heavy', 'any']) },
  {
    id: 'aroma', multi: true, max: 3,
    when: (a) => !!drinkOf(a) && drinkOf(a)!.family !== 'traditional',
    options: () => [...FAMILIES.map((f) => ({ id: f.id, label: f.name })), { id: 'any', key: 'q.aroma.any' }],
  },
  {
    id: 'flavor', multi: true, max: 4,
    when: (a) => many(a, 'aroma').length > 0,
    options: (a) => {
      const fams = many(a, 'aroma').filter((f) => f !== 'any');
      const pool = fams.length ? FLAVORS.filter((f) => fams.includes(f.family)) : FLAVORS.filter((f) => f.family === 'sweet' || f.family === 'nutty-cocoa');
      return pool.map((f) => ({ id: f.id, label: f.name }));
    },
  },
  { id: 'milk', when: (a) => (drinkOf(a)?.milkMl ?? 0) > 0, options: () => MILKS.map((m) => ({ id: m.id, label: m.name })) },
  { id: 'sweetness', when: (a) => !!drinkOf(a), options: () => keyed('sweetness', ['none', 'light', 'medium', 'sweet']) },
  {
    id: 'sweetener',
    when: (a) => !!one(a, 'sweetness') && one(a, 'sweetness') !== 'none',
    options: (a) => SWEETENERS.filter((s) => s.id !== 'condensed' || (drinkOf(a)?.milkMl ?? 0) > 0 || drinkOf(a)?.id === 'phin').map((s) => ({ id: s.id, label: s.name })),
  },
  {
    id: 'addons', multi: true, max: 6,
    when: (a) => !!drinkOf(a),
    options: (a) => { const o: Option[] = addonsFor(a).map((x) => ({ id: x.id, label: x.name })); o.push({ id: 'none', key: 'q.addons.none' }); return o; },
  },
  { id: 'roast', when: (a) => !!drinkOf(a) && drinkOf(a)!.family !== 'traditional', options: () => keyed('roast', ['light', 'medium', 'mediumdark', 'dark', 'auto']) },
  { id: 'caffeine', when: (a) => !!drinkOf(a), options: () => keyed('caffeine', ['normal', 'gentle', 'kick']) },
];

/** Add-ons depend on the drink: traditional coffee takes spices only; milk drinks get everything. */
export function addonsFor(a: Answers) {
  const d = drinkOf(a);
  const iced = one(a, 'serve') === 'iced';
  if (!d) return [];
  return ADDONS.filter((x) => {
    if (x.iced && !iced) return false;
    if (d.family === 'traditional') return x.group === 'spice' && x.id !== 'nutmeg';
    if (x.id === 'vanilla-ice-cream') return d.id === 'affogato' || iced;
    if (x.id === 'extra-shot') return d.family === 'espresso' || d.id.startsWith('cold-brew');
    if (d.milkMl === 0 && (x.group === 'topping' || x.group === 'sauce')) return x.id === 'whipped-cream' && d.id === 'con-panna';
    return true;
  });
}

/** The next question for these answers, skipping questions with a single possible option (auto-answered). */
export function nextQuestion(a: Answers): { question?: Question; answers: Answers } {
  let cur = { ...a };
  for (let guard = 0; guard < QUESTIONS.length + 1; guard++) {
    const q = QUESTIONS.find((x) => x.when(cur) && cur[x.id] === undefined);
    if (!q) return { answers: cur };
    const opts = q.options(cur);
    if (opts.length === 1 && !q.multi) { cur = { ...cur, [q.id]: opts[0].id }; continue; }
    return { question: q, answers: cur };
  }
  return { answers: cur };
}
