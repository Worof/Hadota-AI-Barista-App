"""Render Hadota's MALE Egyptian voice with VoiceTuT-TTS (Apache-2.0, fine-tuned on Egyptian Arabic). Needs a GPU: use free Google Colab.

  node scripts/voice-lines.mjs                       # once, on your computer: writes scripts/voice-lines.json
  python scripts/render_voice.py --speaker Mohammed  # on Colab (male built-in voice)
  python scripts/render_voice.py --ref my.wav --ref-text "..."   # YOUR own voice, only with documented consent

Output: assets/voice/ar-EG/<id>.mp3 and assets/voice/manifest.json ({sentence: file}). Commit them; the app plays the clips
automatically (and falls back to the device voice for any sentence without a clip). Not run in the environment this was written in.
"""
import json, os, shutil, subprocess, sys

def arg(name, default=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default

def main():
    data = json.load(open("scripts/voice-lines.json", encoding="utf8"))
    lang, items = data["lang"], data["items"]
    if "--dry" in sys.argv:
        print(len(items), "clips,", sum(len(i["text"]) for i in items), "characters"); return
    from voicetut_tts import VoiceTutTTS
    tts = VoiceTutTTS.from_pretrained("mohammedaly22/VoiceTut-TTS")
    speaker, ref, ref_text = arg("--speaker", "Mohammed"), arg("--ref"), arg("--ref-text")
    out_dir = f"assets/voice/{lang}"; os.makedirs(out_dir, exist_ok=True)
    ffmpeg = shutil.which("ffmpeg") is not None; manifest = {}
    for n, item in enumerate(items, 1):
        cid, text = item["id"], item["text"].strip()
        wav, mp3 = f"{out_dir}/{cid}.wav", f"{out_dir}/{cid}.mp3"
        if not (os.path.exists(mp3) or os.path.exists(wav)):
            kw = {"ref_audio": ref, "ref_text": ref_text} if ref else {"speaker": speaker}
            tts.synthesize(text, output=wav, **kw)
            if ffmpeg:
                subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-ac", "1", "-b:a", "48k", mp3], check=True); os.remove(wav)
        manifest[text] = f"{lang}/{cid}." + ("mp3" if os.path.exists(mp3) else "wav")
        if n % 20 == 0: print(f"{n}/{len(items)}")
    json.dump(manifest, open("assets/voice/manifest.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
    shutil.make_archive("voice-clips", "zip", "assets", "voice"); print("done -> assets/voice + voice-clips.zip")

if __name__ == "__main__":
    main()
