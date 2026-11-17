"""ElevenLabs take + Scribe word timings -> voice.wav, words.json, lines.md (same format tts.py writes).

usage: python el_words.py <take.mp3> <scribe words.json> ../SCRIPT.md [--lead 2.0]
- take.mp3: the chosen ElevenLabs speech generation (download its content_url)
- scribe words.json: the transcript's words_download_url (eleven_scribe_v1 on the same take)
- SCRIPT.md: spoken lines (Devanagari lines, one per scene), the same text that was sent to ElevenLabs
Delivery tags like [calmly] and the dash token are dropped; trailing punctuation is stripped from caption words;
every word gets the index of its script line. Prints any mismatch between script words and transcript words.
"""
import argparse, json, re, shutil, subprocess
ap = argparse.ArgumentParser(); ap.add_argument("take"); ap.add_argument("words"); ap.add_argument("script"); ap.add_argument("--lead", type=float, default=2.0)
A = ap.parse_args()
ff = shutil.which("ffmpeg") or "ffmpeg"
subprocess.run([ff, "-v", "error", "-y", "-f", "lavfi", "-t", str(A.lead), "-i", "anullsrc=r=48000:cl=mono", "-i", A.take, "-filter_complex",
                "[1:a]aresample=48000,pan=mono|c0=c0[v];[0:a][v]concat=n=2:v=0:a=1", "-c:a", "pcm_s16le", "voice.wav"], check=True)
raw = json.load(open(A.words, encoding="utf-8")); ws = raw["words"] if isinstance(raw, dict) else raw
lines = [l.strip() for l in open(A.script, encoding="utf-8").read().splitlines() if re.search(r"[ऀ-ॿ]", l) and not l.lstrip().startswith(("#", "-"))]
strip = lambda t: re.sub(r'[.,!?।…"\']+$', "", t.strip('"\''))
toks = [[strip(x) for x in l.split() if x not in ("—", "-")] for l in lines]
out = [{"w": strip(w["text"]), "t": round(w["start"] + A.lead, 3), "d": round(w["end"] - w["start"], 3)}
       for w in ws if w.get("type", "word") == "word" and not (w["text"].startswith("[") or w["text"].endswith("]")) and w["text"] not in ("—", "-")]
flat = [(li, t) for li, L in enumerate(toks) for t in L]
print("transcript words", len(out), "script words", len(flat))
for w, (li, t) in zip(out, flat):
    w["line"] = li
    if w["w"] != t: print("  mismatch:", w["w"], "vs script", t, "line", li)
for w in out[len(flat):]: w["line"] = len(lines) - 1
json.dump(out, open("words.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
rows = [f"| {i} | {L[0]['t']:.2f} | {L[-1]['t'] + L[-1]['d']:.2f} | {' '.join(w['w'] for w in L)} |" for i in range(len(lines)) if (L := [w for w in out if w['line'] == i])]
open("lines.md", "w", encoding="utf-8").write(f"ElevenLabs voice, lead {A.lead} s\n\n| line | start | end | text |\n|---|---|---|---|\n" + "\n".join(rows) + "\n")
print("\n".join(rows)); print(f"last word ends {out[-1]['t'] + out[-1]['d']:.2f} s -> video length = ceil(that + 3.8)")
