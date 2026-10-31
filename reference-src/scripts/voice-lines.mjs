// Lists every clip the Egyptian voice must render, as JSON: node scripts/voice-lines.mjs > scripts/voice-lines.json
// Single source of truth for the Python renderer, so ids always match the app. Lines containing the user's
// name are split at the name: [before] [name clip] [after], same voice, played in sequence.
import { readFileSync } from 'node:fs';
import { clipId, nameClipId } from './hash.mjs';

const lang = 'ar-EG';
const j = JSON.parse(readFileSync('src/i18n/locales/ar-EG.json', 'utf8'));
const names = JSON.parse(readFileSync('src/content/names.json', 'utf8'));
const items = new Map();
const add = (text, id = clipId(lang, text)) => { if (text.trim() && !items.has(id)) items.set(id, { id, text }); };

// fixed lines
for (const t of [j.hadota.greeting, j.thinking, ...j.bloopers, ...j.cheers, ...Object.values(j.season)]) add(t);
// templates with {{name}}: [before] + name + [after]
for (const t of [j.lines.intro, j.lines.welcomeBack, j.lines.repeatAsk, j.result.intro]) {
  const [pre, post] = t.split('{{name}}');
  add(pre); add(post);
}
// question lines: callout + ask, e.g. "يا {{name}}، " + "تحبها سخنة ولا ساقعة؟"
for (const c of j.callouts) {
  const [pre, tail] = c.split('{{name}}');
  add(pre);
  for (const q of Object.values(j.q)) add(tail + q.ask);
}
for (const n of names) add(n, nameClipId(lang, n));

console.log(JSON.stringify({ lang, items: [...items.values()] }, null, 1));
