/**
 * Per-user personalization with a LinUCB contextual bandit (Li et al., 2010), the same
 * algorithm family offered by the Open Bandit Pipeline and Vowpal Wabbit. Each rated blend is
 * one (context, reward) sample: reward +1 = loved it, -1 = disliked it, a quick "try again" with
 * no rating is a small penalty. Runs on the device (a ridge-regression model of 12 numbers), so
 * it works with the handful of ratings one person gives. Cross-user learning needs a server.
 */
export interface Model { n: number; A: number[][]; b: number[] }

export const newModel = (d: number): Model => ({
  n: 0,
  A: Array.from({ length: d }, (_, i) => Array.from({ length: d }, (_, j) => (i === j ? 1 : 0))),
  b: Array(d).fill(0),
});

/** rating 1..5 -> reward -1..1 */
export const rewardOfRating = (rating: number): number => (Math.min(5, Math.max(1, rating)) - 3) / 2;
/** Confidence in the personal model grows with the number of ratings (full trust from 5). */
export const trust = (n: number): number => Math.min(1, n / 5);

function inverse(M: number[][]): number[][] {
  const n = M.length;
  const a = M.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
    [a[c], a[p]] = [a[p], a[c]];
    const d = a[c][c] || 1e-9;
    for (let j = 0; j < 2 * n; j++) a[c][j] /= d;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = a[r][c];
      if (f) for (let j = 0; j < 2 * n; j++) a[r][j] -= f * a[c][j];
    }
  }
  return a.map((r) => r.slice(n));
}
const mv = (M: number[][], v: number[]) => M.map((r) => r.reduce((s, x, j) => s + x * v[j], 0));
const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);

/** Predicted reward for context x and an uncertainty bonus (exploration). */
export function stats(m: Model, x: number[], alpha: number): { mean: number; bonus: number } {
  const Ai = inverse(m.A);
  return { mean: dot(mv(Ai, m.b), x), bonus: alpha * Math.sqrt(Math.max(0, dot(x, mv(Ai, x)))) };
}

/**
 * Learn from feedback. First time for a blend: add the sample. If the same blend is re-rated,
 * pass the earlier reward so the old feedback is replaced instead of double-counted.
 */
export function learn(m: Model, x: number[], reward: number, previous?: number): Model {
  const A = m.A.map((r) => [...r]);
  const b = [...m.b];
  if (previous === undefined) {
    for (let i = 0; i < x.length; i++) for (let j = 0; j < x.length; j++) A[i][j] += x[i] * x[j];
    for (let i = 0; i < x.length; i++) b[i] += reward * x[i];
    return { n: m.n + 1, A, b };
  }
  for (let i = 0; i < x.length; i++) b[i] += (reward - previous) * x[i];
  return { n: m.n, A, b };
}
