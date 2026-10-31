"""Render Hadota's Egyptian Arabic voice with VoiceTut-TTS (Apache-2.0, fine-tuned for Egyptian Arabic).
Needs a GPU: run on free Google Colab / Kaggle. Reads scripts/voice-lines.json (made by `npm run voice:lines`).

  python scripts/render_voicetut.py --speaker Mohammed          # built-in male voice
  python scripts/render_voicetut.py --ref my.wav --ref-text "…"  # YOUR own consented voice (zero-shot)
  python scripts/render_voicetut.py --dry                       # just count clips

Output: public/voice/ar-EG/*.mp3, public/voice/manifest.json, public/voice.zip
Never clone a real person's voice without documented consent.
"""
import json, os, shutil, subprocess, sys

def arg(name, default=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default

def main():
    data = json.load(open("scripts/voice-lines.json", encoding="utf8"))
    lang, items = data["lang"], data["items"]
    if "--dry" in sys.argv:
        print(len(items), "clips,", sum(len(i["text"]) for i in items), "characters")
        return
    from voicetut_tts import VoiceTutTTS
    tts = VoiceTutTTS.from_pretrained("mohammedaly22/VoiceTut-TTS")
    speaker, ref, ref_text = arg("--speaker", "Mohammed"), arg("--ref"), arg("--ref-text")
    out_dir = f"public/voice/{lang}"
    os.makedirs(out_dir, exist_ok=True)
    ffmpeg = shutil.which("ffmpeg") is not None
    manifest = {lang: {}}
    for n, item in enumerate(items, 1):
        cid, text = item["id"], item["text"].strip()
        wav, mp3 = f"{out_dir}/{cid}.wav", f"{out_dir}/{cid}.mp3"
        if not (os.path.exists(mp3) or os.path.exists(wav)):
            kw = {"ref_audio": ref, "ref_text": ref_text} if ref else {"speaker": speaker}
            tts.synthesize(text, output=wav, **kw)  # the engine normalizes Egyptian text itself
            if ffmpeg:
                subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-ac", "1", "-b:a", "48k", mp3], check=True)
                os.remove(wav)
        manifest[lang][cid] = f"{lang}/{cid}." + ("mp3" if os.path.exists(mp3) else "wav")
        if n % 20 == 0:
            print(f"{n}/{len(items)}")
    json.dump(manifest, open("public/voice/manifest.json", "w"), indent=1)
    shutil.make_archive("public/voice", "zip", "public", "voice")
    print("done ->", "public/voice.zip")

if __name__ == "__main__":
    main()
