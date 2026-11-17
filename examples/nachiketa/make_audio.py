# Soundtrack of "नचिकेता — जिसने मौत से सवाल पूछे": Hindi voice + an original sombre Indian-flavoured score
# (tanpura drone on D, slow plucked melody in a Bhairavi-like D scale, soft tabla in the middle, swells) ducked under
# the voice + synthesized SFX timed to the scenes (Scenes.tsx). Master -15 LUFS, -1.2 dBTP, exactly 80 s, 48 kHz stereo.
import json, os
import numpy as np
from scipy import signal
from dsp import SR, ns, tt, dbg, rng, lp, hp, bp, pan, st, place, widen, modal, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
DUR = 80.0; N = ns(DUR); R = rng(7)

x, sr = read_wav(os.path.join(ROOT, "voice", "voice.wav"))
v = x.mean(0); voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
words = json.load(open(os.path.join(ROOT, "voice", "words.json"), encoding="utf-8"))
spans = []
for w in words:
    s, e = w["t"], w["t"] + w["d"]
    if spans and s - spans[-1][1] < 0.35: spans[-1][1] = max(spans[-1][1], e)
    else: spans.append([s, e])

def env(n, a=0.005, d=0.3, curve=4.0):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t * curve / max(d, 1e-3))

def ks(freq, dur, bright=0.5, seed=0):
    n = ns(dur); p = max(2, int(SR / freq)); rr = rng(seed)
    b = lp(rr.uniform(-1, 1, p), 1800 + 6000 * bright, 1).copy(); out = np.zeros(n); i = 0
    for k in range(n):
        out[k] = b[i]; j = (i + 1) % p; b[i] = 0.996 * 0.5 * (b[i] + b[j]); i = j
    return (out + np.tanh(out * 3) * 0.25) * env(n, 0.002, dur, 2.5)
_c = {}
def pluck(f, d, seed=0):
    k = (round(f, 2), round(d, 2), seed % 3)
    if k not in _c: _c[k] = ks(f, d, 0.5, seed % 3)
    return _c[k]

def tanpura(f0, dur):
    t = tt(dur); y = np.zeros_like(t)
    for h in range(1, 14):
        y += np.sin(2 * np.pi * f0 * h * t + 0.3 * np.sin(2 * np.pi * 0.17 * t * h)) / h ** 1.1 * (1 + 0.4 * np.sin(2 * np.pi * (0.5 + 0.07 * h) * t))
    return lp(y, 3000) * 0.25

def bayan(dur=0.6, bend=1.0):
    t = tt(dur); f = 65 + 55 * bend * np.exp(-t * 7)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.4, 3)
def dayan(freq=480, dur=0.3):
    t = tt(dur); y = sum(np.sin(2 * np.pi * freq * m * t) * a for m, a in [(1, 1), (2.02, .5), (3.01, .3)])
    return (y * env(len(t), 0.001, 0.3, 3) + hp(R.standard_normal(len(t)), 2500) * np.exp(-t * 120) * 0.5) * 0.5

def pad(f, dur, att=1.5):
    t = tt(dur); y = sum(np.sin(2 * np.pi * f * m * t * (1 + 0.002 * k)) / m for k, m in enumerate([1, 2, 3, 1.5]))
    a = np.minimum(1, t / att) * np.minimum(1, (dur - t) / att)
    return lp(y, 1600) * np.clip(a, 0, 1) * 0.25

D = 146.83
SC = [0, 1, 3, 5, 7, 8, 10]          # D Eb F G A Bb C  (Bhairavi-like)
def note(deg, o=1): return D * 2 ** (o + deg // 7 + SC[deg % 7] / 12)

music = np.zeros((2, N))
dr = tanpura(D / 2, DUR) + 0.7 * tanpura(D * 0.75, DUR)
dr *= np.clip(np.minimum(np.arange(N) / ns(2.0), (N - np.arange(N)) / ns(2.5)), 0, 1)
music += widen(dr * 0.5, R, 13, 0.7)

BEAT = 60 / 72
PH = {"A": [(4, 1), (3, .5), (2, .5), (1, 1), (0, 2)], "B": [(0, .5), (2, .5), (3, 1), (4, 1), (5, .5), (4, .5), (3, 2)],
      "C": [(7, 1), (6, .5), (5, .5), (4, 2), (5, 1), (4, 1), (3, 2)], "W": [(4, 1), (6, 1), (7, 2), (8, 1), (7, 1), (6, 2)]}
SECT = [(0.5, 7.0, "A", .5), (7.0, 16.6, "B", .45), (23.1, 33.2, "A", .4), (38.9, 48.9, "C", .4), (54.8, 68.0, "W", .45), (71.4, 78.5, "A", .5)]
for a, b, k, g in SECT:
    t = a; i = 0
    while t < b - 0.4:
        for deg, beats in PH[k]:
            if t >= b - 0.3: break
            d = beats * BEAT
            place(music, pan(pluck(note(deg, 1), min(1.8, d * 2.4), i + deg), -0.3 + 0.6 * R.random()), t, g)
            t += d; i += 1
# soft tabla pulse in the middle (journey .. boons), heavier in the anger beat
def tabla(a, b, g, bpm=72):
    bt = 60 / bpm; t = a; k = 0
    while t < b:
        if k % 4 == 0: place(music, bayan(0.6), t, g)
        if k % 2 == 1: place(music, pan(dayan(), 0.2), t, g * 0.6)
        if k % 4 == 3: place(music, pan(dayan(560, 0.15), -0.2), t + bt / 2, g * 0.35)
        t += bt; k += 1
tabla(23.1, 38.5, 0.55); tabla(16.6, 22.0, 0.7, 96)
# pads / swells per mood
for a, b, f, g in [(16.6, 22.4, D / 2 * 2 ** (1 / 12), .7), (44.7, 48.9, D / 2 * 2 ** (8 / 12), .6), (48.9, 54.8, D * 2 ** (7 / 12) / 2, .45),
                   (59.0, 68.0, D, .6), (64.9, 68.0, D * 1.5, .4), (74.0, 80.0, D / 2, .7)]:
    place(music, widen(pad(f, b - a, 1.2), R, 9, 0.8), a, g)

# ---------------------------------------------------------------- SFX
sfx = np.zeros((2, N))
def noise(d): return R.standard_normal(ns(d))
def swoosh(d=1.6):
    t = tt(d); y = bp(noise(d), 300, 3000) * np.sin(np.pi * t / d) ** 2
    return y * 0.6
def gong(f=90, d=5.0):
    return modal(d, [(f, 1, 2.2), (f * 2.4, .5, 1.4), (f * 3.9, .3, .9), (f * 5.3, .2, .6), (f * 1.52, .4, 1.8)], R, glide=0.02) * 0.6
def bell(f=1200, d=2.0):
    return modal(d, [(f, 1, .9), (f * 2.76, .45, .5), (f * 5.4, .2, .25), (f * 1.5, .25, .7)], R) * 0.5
def boom(d=1.5):
    t = tt(d); return np.sin(2 * np.pi * np.cumsum(45 + 40 * np.exp(-t * 6)) / SR) * np.exp(-t * 2.5) + lp(noise(d), 200) * np.exp(-t * 8) * 0.5
def step_(f=220, g=1.0):
    t = tt(0.18); return (lp(noise(0.18), 900) * np.exp(-t * 40) + np.sin(2 * np.pi * f * t) * np.exp(-t * 30) * 0.6) * g
def crackle(d):
    y = np.zeros(ns(d)); 
    for tm in R.uniform(0, d - 0.02, int(d * 14)): k = ns(tm); y[k:k + 200] += hp(R.standard_normal(200), 2000) * R.uniform(.2, 1) * np.exp(-np.arange(200) / 40)
    return y + lp(noise(d), 400) * 0.25
def jingle(d=1.0, base=3000, n=24):
    y = np.zeros(ns(d) + ns(0.5))
    for tm in R.uniform(0, d, n):
        b = bell(base * R.uniform(.8, 1.4), 0.4); k = ns(tm); y[k:k + len(b)] += b[:len(y) - k] * R.uniform(.3, 1)
    return y
def rumble(d):
    t = tt(d); return lp(noise(d), 120) * np.sin(np.pi * t / d) * 2.0
def shimmer(d=2.0, f=1800):
    t = tt(d); y = sum(np.sin(2 * np.pi * f * k * (1 + 0.3 * t / d) * t) / k for k in [1, 1.5, 2.01]) * np.sin(np.pi * t / d)
    return y * 0.25
def rustle(d=1.2):
    t = tt(d); return bp(noise(d), 1500, 7000) * (0.5 + 0.5 * np.abs(np.sin(t * 23))) * np.sin(np.pi * t / d) * 0.5

place(sfx, widen(swoosh(1.8), R), 0.2, 0.8)                           # curtain opens
place(sfx, widen(gong(70, 5), R), 5.15, 0.9); place(sfx, boom(), 5.15, 0.6)   # "मृत्यु" — shadow rises
place(sfx, widen(crackle(4.9), R), 7.0, 0.35); place(sfx, widen(crackle(4.7), R), 11.9, 0.22)   # yajna fire
for tm in [10.0, 10.6, 11.2]: place(sfx, pan(bell(620 + 80 * R.random(), 0.8), 0.5), tm, 0.35)   # cow bells
place(sfx, widen(crackle(2.4), R), 19.6, 0.5)                         # anger: fire flares
place(sfx, boom(1.8), 21.88, 1.0); place(sfx, widen(gong(55, 4.5), R), 21.88, 0.9)   # "यमराज को!"
for k in range(6): place(sfx, pan(step_(240, 0.8), -0.4 + 0.15 * k), 23.15 + k * 0.571, 0.5)   # walking
place(sfx, widen(lp(noise(3.2), 700) * 0.4, R), 23.1, 0.35)          # river
place(sfx, widen(rumble(2.0), R), 26.4, 0.6)                          # the gate
for tm in [28.6, 30.05, 31.5]: place(sfx, widen(bell(1500, 1.4), R), tm, 0.35)   # each day passes
for k in range(3): place(sfx, step_(120, 1.3), 33.3 + k * 0.45, 0.7)  # Yama's heavy steps
for k, tm in enumerate([37.6, 37.72, 37.84]): place(sfx, pan(bell(1800 + 300 * k, 1.6), -0.4 + 0.4 * k), tm, 0.4)   # three lamps
place(sfx, widen(bell(1800, 1.8), R), 39.1, 0.4)                      # boon 1
place(sfx, widen(swoosh(1.2), R), 42.5, 0.5); place(sfx, widen(crackle(2.0), R), 42.6, 0.45)   # heavenly fire
place(sfx, widen(shimmer(1.8, 900), R), 45.2, 0.5)                    # boon 3, blue lamp
place(sfx, widen(rumble(2.0), R), 46.2, 0.9)                          # Yama trembles
place(sfx, widen(jingle(1.4, 2600, 30), R), 49.5, 0.45)               # gold
place(sfx, boom(1.2), 50.45, 0.5); place(sfx, widen(bell(700, 1.5), R), 50.5, 0.35)   # kingdom
place(sfx, widen(jingle(1.6, 4200, 40), R), 51.3, 0.35)               # apsaras' anklets
place(sfx, widen(swoosh(1.0), R), 55.5, 0.5)                          # refusal
place(sfx, widen(swoosh(2.4), R), 56.3, 0.35)                         # temptations lifted away
place(sfx, widen(shimmer(2.4, 1400), R), 59.3, 0.55)                  # "सत्य"
place(sfx, widen(shimmer(3.0, 1100), R), 61.3, 0.3)
place(sfx, widen(bell(1300, 2.5), R), 65.1, 0.45)                     # आत्मा
place(sfx, widen(rustle(1.3), R), 68.4, 0.5)                          # manuscript unrolls
place(sfx, pan(bell(2600, 0.8), -0.5), 72.4, 0.35)                    # gods peek
place(sfx, widen(bell(900, 3.0), R), 74.5, 0.55)                      # namaste
place(sfx, widen(swoosh(2.0), R), 77.5, 0.8); place(sfx, widen(gong(80, 3.5), R), 79.1, 0.5)   # curtain closes

# ---------------------------------------------------------------- mix + reverb
ir = make_ir(1.8, 3, pre=0.02, hf=1.2)
music += 0.25 * convolve_st(music, ir); sfx += 0.2 * convolve_st(sfx, ir)
vL = integrated(st(voice))
duck = np.ones(N)
for s, e in spans: duck[max(0, ns(s - 0.08)):ns(e + 0.12)] = dbg(-4.0)
duck = np.convolve(duck, np.ones(ns(0.12)) / ns(0.12), "same")
music *= dbg(vL - 10.0 - integrated(music) + 3.0); music *= duck
sfx *= dbg(vL - 9.0 - integrated(sfx) - 4.0)
mix = st(voice) + music + sfx
mix *= dbg(-15.0 - integrated(mix))
ceil = dbg(-1.2)
up = signal.resample_poly(mix, 4, 1, axis=-1)
pk = np.abs(up).max(0).reshape(-1, 4).max(1)[:N]
g = np.minimum(1, ceil / np.maximum(pk, 1e-9)); win = ns(0.005)
gmin = np.array([g[max(0, i - win):i + win].min() for i in range(0, N, win)])
gs = np.convolve(np.repeat(gmin, win)[:N], np.hanning(2 * win) / np.hanning(2 * win).sum(), "same")
mix *= np.minimum(gs, 1)
fade = np.ones(N); fade[-ns(0.6):] = np.linspace(1, 0, ns(0.6)); mix *= fade
write_wav(os.path.join(HERE, "mix.wav"), mix)
print("dur", mix.shape[1] / SR, "LUFS", round(integrated(mix), 2), "TP", round(true_peak(mix), 2))
