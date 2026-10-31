// Embeds public/voice clips into a single-file build so the preview artifact has real sound.
// Usage: node scripts/inline-voice.mjs <in.html> <out.html>
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const [input, output] = process.argv.slice(2);
const mf = 'public/voice/manifest.json';
if (!existsSync(mf)) { console.error('No public/voice/manifest.json: render clips first.'); process.exit(1); }
const manifest = JSON.parse(readFileSync(mf, 'utf8'));
const mime = { mp3: 'audio/mpeg', wav: 'audio/wav' };
let bytes = 0;
for (const clips of Object.values(manifest)) {
  for (const [id, file] of Object.entries(clips)) {
    const buf = readFileSync(`public/voice/${file}`);
    bytes += buf.length;
    clips[id] = `data:${mime[file.split('.').pop()] ?? 'audio/mpeg'};base64,${buf.toString('base64')}`;
  }
}
const html = readFileSync(input, 'utf8').replace('<head>', `<head><script>window.__HADOTA_VOICE__=${JSON.stringify(manifest)};</script>`);
writeFileSync(output, html);
console.log(`embedded ${(bytes / 1e6).toFixed(1)} MB of clips -> ${output}`);
