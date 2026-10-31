/** Answers collected so far. Single questions store a string, multi questions a string[]. */
export type Answers = Partial<Record<QId, string | string[]>>;

export type QId =
  | 'serve' | 'drink' | 'gear' | 'strength' | 'acidity' | 'body' | 'aroma' | 'flavor'
  | 'milk' | 'sweetness' | 'sweetener' | 'addons' | 'roast' | 'caffeine' | 'origin' | 'species';

export const one = (a: Answers, k: QId): string | undefined => (typeof a[k] === 'string' ? (a[k] as string) : undefined);
export const many = (a: Answers, k: QId): string[] => (Array.isArray(a[k]) ? (a[k] as string[]) : []);
