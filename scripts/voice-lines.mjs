// Lists every sentence Hadota can say, WITHOUT the user's name (recorded clips are name-free; the caption still shows the name).
// Output: scripts/voice-lines.json -> feed it to scripts/render_voice.py on a free Colab GPU.
import fs from "node:fs"; import crypto from "node:crypto"; import path from "node:path"; import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.join(here, "..");
const T = new Function(fs.readFileSync(path.join(root, "data.js"), "utf8") + ";return T")();
const strip = (t) => t.split(/يا\s*\{\{name\}\}/).join("").split("{{name}}").join("").replace(/\s+/g, " ").replace(/\s([!،.؟?])/g, "$1").replace(/^[\s،,]+/, "").trim();
export const sentences = (t) => strip(t).split(/(?<=[.!؟?])\s+/).map((x) => x.trim()).filter(Boolean);
const texts = new Set();
const add = (t) => sentences(t).forEach((s) => texts.add(s));
add(T.hadota.greeting); add(T.lines.intro); add(T.lines.welcomeBack); add(T.result.intro);
T.cheers.forEach((c) => add(T.result.intro + " " + c));
for (const q of Object.values(T.q)) if (q.ask) { add(q.ask); T.callouts.forEach((c) => add(c + q.ask)); }
const items = [...texts].map((text) => ({ id: crypto.createHash("sha1").update(text).digest("hex").slice(0, 10), text }));
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fs.writeFileSync(path.join(here, "voice-lines.json"), JSON.stringify({ lang: "ar-EG", items }, null, 1));
  console.log(items.length, "sentences,", items.reduce((s, i) => s + i.text.length, 0), "characters ->", "scripts/voice-lines.json");
}
