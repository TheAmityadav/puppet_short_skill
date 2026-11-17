# Style bible — puppet-theatre short (measured from the shipped Nachiketa video + its source)

Look in one line: a lit wooden kathputli stage at night — flat folk-mural marionettes with ink outlines and dot trims,
hanging on strings, glowing softly in a warm sepia haze, filmed by a slow, drifting camera with depth-of-field.

## Frame
- 1080x1920, 30 fps, 60-90 s. Background `#0c0806`. Stage floor top at **y = 1460** (`FLOOR`).
- Safe zones: captions y 330-430 (top band); characters' heads below y ≈ 560; nothing important below y 1750 (UI overlays).
- Temple arch (backdrop): outer `M130 1500 L130 700 Q130 360 540 300 Q950 360 950 700 L950 1500`, `#6b4a26` 6 px + inner
  2 px, 24 dots `#8a6430`, whole arch at 50 % opacity.

## Palette (`C` in lib.ts)
| token | hex | use |
|---|---|---|
| ink | #24150c | every outline (3.2 px; 2-2.6 px on small details) |
| ochre | #d9a441 | pots, lamps, sashes |
| gold | #f0c75e | crowns, jewellery, coins, trims, dots |
| saffron | #e8892b | boy's dhoti, angavastram, sun rays |
| red / deepRed | #c4432f / #8e2a22 | dhoti borders, havan kund, crowns' bands |
| teal | #3f8f8a | sari, gems |
| green | #5f9e4a | tree, Yama's sash |
| blue | #3c6fb0 | gods |
| yamaSkin | #3d5a7a | Yama |
| skin / skinDark | #c98a55 / #a86c3e | humans (rishi #c79058, apsara #d39a66) |
| cream / white | #f3e2bd / #efe6d2 | dot fills, beard, white dhoti |
| wood | #9a6a3c | torches, trunks |
- Far limbs = `dark(color, 0.72)`; joint pins = `dark(color, 0.85)` + ink centre dot.
- Wall gradient `#120c08 → #2c1d12 → #1a110b`; night `#0f1626 → #24263a → #1a1410`; floor `#3a2616` + `#6b4a26` lip + `#2a1a0f` band with `#a07a3a` dots.
- Scene tints over the wall (35 % of the tint colour): anger `rgba(120,20,10,.6)`, hook dread `#5a1010`,
  heavenly fire `rgba(140,70,10,.4)`, fear `rgba(20,30,70,.5)`, night `sky="night"`.

## Light & atmosphere (Stage.tsx)
- `pglow` on every puppet/prop: alpha blurred 9 px, flooded `#ffcf7a` at 55 %, under the art — the soft halo.
- `Atmos` over everything: spotlight ellipse (540, 820) rx 620 ry 900, `#ffd590` 55 % → transparent; soft-light `#7a4a1c`
  at 12 %; vignette 55 % → black 82 % at the edges; grain pattern 2 px dots at 7 %, jumping 24×/s.
- `Hanging`: 14 four-point stars (r 6-13, `#f6d27a`, twinkle 0.65-1) + crescent moon `#f3dfa0`, each on a thread
  `#cdb886` 25-30 %, swaying ±4 px, layer d 2.2 with blur 2.
- `Dust`: 60 motes r 1.5-5, `#ffd98f` (cold scenes `#bfe0ff`), drifting up-right, opacity 0.25-0.7, foreground layer d 0.8.
- Glows behind fire/lamps: big ellipse in `#ffb347`/`#ffcf5a` at 25-35 % with `soft` blur (22 px).

## Characters
- Marionette proportions (unscaled): torso 150-185, upper arm 82, forearm 76, thigh 100, shin 98 (× look.arm / look.leg).
  Scale: boy 0.78, sage 1.0, apsara 0.92, god-king (Yama) 1.22 — the size gap tells status.
- Profile folk face looking right, frontal almond eye (white, ink pupil, 1 highlight), long straight nose, small lip
  stroke, ear + gold earring, tilak/forehead marks. Hair = flat black shapes; topknot (boy), white jata (sage), bun (apsara), crown (god).
- Clothing = flat dhoti/sari with a contrasting border, a dotted trim row and a fan pleat; necklaces of dots; sash with dots.
- Strings: `#e9d9ad` 38 %, 1.6 px, from each hand and head straight up off-frame (off for silhouettes/visions).
- Motion: idle sway always on (`idle(T, seed)`: lean ±2°, head ±3°, arms ±6°); blink 3.5 % of each ~3 s cycle;
  walk = stiff ±26° leg swings, ±22° arm swings, 14 px hop, 4° lean, 5.5 rad/s.
- Special renders: black shadow-puppet (`Shadow`, `filter #black` + blur 4) for looming gods; golden silhouette
  (`goldsil`) for memories/souls; vision circle (gold ring r 330 + `clipPath`) for "what the hero imagines".

## Camera (Scenes.tsx `Lay`)
- `cam = {z, x, y, shake}`; layers by depth `d`: backdrop 3, hanging 2.2 (blur 2), mid-props 1.25-1.6 (often blur 2),
  floor 1.15, puppets 1, foreground 0.55-0.8 (blur 4 for a big out-of-focus foreground character), dust 0.8.
- Every scene moves: push-ins 1.0→1.1-1.15 (calm), 1.25→1.42 / 1.15→1.55 (tension), 1.3→1.6 (fear close-up); pans
  420→640 px across a scene; a slow pull-out (1.15→0.92) for the finale.
- Shake only on a shout/tremble: `shake` 0.5-1, noise 18 Hz, ±14 px, decays in 0.3-0.6 s; a cream flash
  (`#fff4dc` 70 %, 0.4 s) on the biggest hit.

## Edit & timing
- One scene per narration line (17 scenes for 80 s, 2.2-8.6 s each), 0.4 s crossfades, no hard cuts.
- Curtain: closed at 0, opens 0.3-2.1 s (smoothstep), voice starts at 2.2 s; closes over the last 2.4 s; valance lifts.
- Gestures/props land 0-0.2 s before their word (`step(T, wordT - 0.3, wordT)`); props enter by dropping from the fly
  loft on strings (`lerp(-300, y, step)`), leave by flying up.
- Counted beats come in threes (three lamps = three boons, three sun/moon passes = three days).

## Captions (Main.tsx)
- Tiro Devanagari Hindi, 76 px, line-height 1.25, letter-spacing 1, 18 px word gap, centred, top 330, side padding 70.
- Chunks ≤ 4 words, never across a script line, new chunk at a pause > 0.28 s; show 0.12 s before the first word,
  hold ≤ 0.9 s after the last; fade-in 0.15 s with a 0.92→1 scale pop over 0.18 s.
- Colours: said `#f6ead0`, unsaid `rgba(246,234,208,.5)`; KEY said `#7fe6df`, unsaid `rgba(127,230,223,.55)`;
  shadow `0 0 3px #000 ×2, 0 3px 10px rgba(0,0,0,.9)`.

## Sound
- Voice: edge-tts `hi-IN-MadhurNeural`, rate +8 %, per-line clips, 0.6 s gaps, 2.2 s lead, peak 0.89.
- Score (all synthesized, original): tanpura drone on D (D3/2 + 0.75 ratio), Karplus-Strong plucks in a Bhairavi-like
  D scale (D Eb F G A Bb C) at 72 bpm, phrases A calm / B question / C tension / W wonder; tabla 72 bpm under the journey,
  96 bpm under the anger; pads for mood (b2 anger, b6 fear, root wonder); reverb RT 1.8 s.
- SFX vocabulary: swoosh (curtain, whoosh), gong+boom (doom/reveal), bell (lamps, boons, days), steps, crackle (fire),
  jingle (gold, anklets), rumble (gate, tremble), shimmer (divine/truth), rustle (manuscript).
- Mix: music −10 dB under voice LUFS (+3), ducked −4 dB on speech; SFX voice −13 dB; master −15 LUFS, −1.2 dBTP, 0.6 s fade.

## Review checklist (each contact sheet)
- [ ] Every character's feet on the floor line (or sitting on it), strings visible going up
- [ ] Captions readable, never over a face; cyan only on names/key ideas
- [ ] Each frame tells its line without the voice (the gesture/prop matches the words)
- [ ] Warm haze + glow + dust present; no flat-black or flat-bright frames (except the deliberate flash)
- [ ] Nothing important cut by the frame edge after zoom; no prop overlapping a face
- [ ] Curtain fully open by 2.1 s and closed at the end
- [ ] Characters consistent scene to scene (same look, same side of the stage unless they move)
