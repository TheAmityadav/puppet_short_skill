"""Hindi narration + exact word timings for a puppet-theatre short (edge-tts, free, no key).

usage:  python tts.py ../SCRIPT.md [--voice hi-IN-MadhurNeural] [--rate +8%] [--lead 2.2] [--gap 0.6]
reads:  every line of SCRIPT.md that contains Devanagari and does not start with '#' or '-' = one spoken line
writes: voice.wav (48 kHz mono), words.json [{w, t, d, line}], lines.md (start/end of each line -> scene times)

Each line is synthesised as its own clip (WordBoundary events give exact word times), silence-trimmed, then
concatenated with GAP seconds between lines and LEAD seconds of silence first (room for the curtain to open).
Voices: hi-IN-MadhurNeural (male, used for Nachiketa), hi-IN-SwaraNeural (female).
"""
import argparse, asyncio, json, os, re, shutil, subprocess, wave
import numpy as np
import edge_tts

ap = argparse.ArgumentParser()
ap.add_argument("script")
ap.add_argument("--voice", default="hi-IN-MadhurNeural")
ap.add_argument("--rate", default="+8%")
ap.add_argument("--lead", type=float, default=2.20)
ap.add_argument("--gap", type=float, default=0.60)
A = ap.parse_args()

FF = shutil.which("ffmpeg")
env = dict(os.environ)
if not FF:  # fall back to Remotion's bundled ffmpeg
    d = os.path.expanduser("~/learn/vid-test/node_modules/@remotion/compositor-linux-x64-gnu")
    FF = os.path.join(d, "ffmpeg"); env["LD_LIBRARY_PATH"] = d

lines = [l.strip() for l in open(A.script, encoding="utf-8").read().splitlines()
         if re.search(r"[ऀ-ॿ]", l) and not l.lstrip().startswith(("-", "#"))]
SR = 48000


async def one(i, text):
    c = edge_tts.Communicate(text, A.voice, rate=A.rate, boundary="WordBoundary")
    words = []; mp3 = f"l{i:02d}.mp3"
    with open(mp3, "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio": f.write(ch["data"])
            elif ch["type"] == "WordBoundary": words.append({"w": ch["text"], "t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7})
    subprocess.run([FF, "-y", "-loglevel", "error", "-i", mp3, "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", "tmp.wav"], check=True, env=env)
    with wave.open("tmp.wav") as wf:
        a = np.frombuffer(wf.readframes(wf.getnframes()), np.int16).astype(np.float32) / 32768
    nz = np.where(np.abs(a) > 0.01)[0]; s0 = max(0, nz[0] - int(0.03 * SR)); s1 = min(len(a), nz[-1] + int(0.08 * SR))
    return a[s0:s1], [dict(w, t=w["t"] - s0 / SR) for w in words]


async def main():
    out = [np.zeros(int(A.lead * SR), np.float32)]; T = A.lead; allw = []
    for i, l in enumerate(lines):
        a, ws = await one(i, l)
        allw += [dict(w, t=round(w["t"] + T, 3), line=i) for w in ws]
        out += [a, np.zeros(int(A.gap * SR), np.float32)]; T += len(a) / SR + A.gap
    y = np.concatenate(out); y = y / max(1e-6, np.abs(y).max()) * 0.89
    with wave.open("voice.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
    json.dump(allw, open("words.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    dur = len(y) / SR
    rows = ["| line | start | end | text |", "|---|---|---|---|"]
    for i in range(len(lines)):
        ws = [w for w in allw if w["line"] == i]
        if ws: rows.append(f"| {i} | {ws[0]['t']:.2f} | {ws[-1]['t'] + ws[-1]['d']:.2f} | {' '.join(w['w'] for w in ws)} |")
    open("lines.md", "w", encoding="utf-8").write(f"voice {A.voice} {A.rate}, {dur:.2f} s, {len(allw)} words\n\n" + "\n".join(rows) + "\n")
    print(f"dur {dur:.2f}s  words {len(allw)}  lines {len(lines)}")
    print("\n".join(rows[2:]))

asyncio.run(main())
