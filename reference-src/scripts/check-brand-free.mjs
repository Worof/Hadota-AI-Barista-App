// Fails CI if the brand name leaks into code, assets or file names. Terms are escaped so this file stays clean.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const terms = [
  '\u063a\u0645\u0631\u0629', // Arabic brand name
  ['gh', 'um', 'rah'].join(''),
];
const skip = new Set(['node_modules', 'dist', '.git', 'package-lock.json']);
const bad = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const p = join(dir, name);
    if (terms.some((t) => p.toLowerCase().includes(t))) bad.push(p + ' (file name)');
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx|js|mjs|json|css|html|md|svg|yml|yaml)$/.test(name)) {
      const txt = readFileSync(p, 'utf8').toLowerCase();
      if (terms.some((t) => txt.includes(t))) bad.push(p);
    }
  }
}
walk('.');
if (bad.length) { console.error('Brand name found in:\n' + bad.join('\n')); process.exit(1); }
console.log('brand-free: OK');
