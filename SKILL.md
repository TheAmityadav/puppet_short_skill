---
name: puppet-theatre-short
description: Make a 60-90 s vertical (1080x1920) Hindi mythology/story short in the "kathputli puppet theatre" style — flat folk-mural cut-out marionettes with ink outlines, pinned elbow/knee joints and strings, on a dark warm wooden stage with a temple arch, hanging stars/moon, dust motes, sepia haze, glow, parallax + depth-of-field camera, red curtain open/close bookends, word-by-word Devanagari karaoke captions with cyan keyword highlight, edge-tts Hindi voice and a synthesized tanpura/tabla score + SFX. Pure SVG in Remotion (no three.js). Proven on "नचिकेता — जिसने मौत से सवाल पूछे" (80 s, 2026-11-17). Use when the user asks for another video "like the Nachiketa video", "puppet theatre / kathputli / marionette style", "like the maya shorts", a Hindi mythology story short, or says "use the puppet skill".
---

# Puppet-theatre Hindi short (SVG cut-out marionettes in Remotion)

Proven example: **नचिकेता — जिसने मौत से सवाल पूछे**, an original 80 s Hindi short (Katha Upanishad).
- Final video: `~/learn/vid-test/out/nachi/nachiketa.mp4` (1080x1920, 30 fps; a 4K `--scale 2` version too)
- Code: `~/learn/vid-test/src/videos/nachi/` (composition `NachiShort`)
- Script, voice, audio: `~/nachiketa-short/`
- Look target frames: `references/frames/` (`sheet1-4.jpg` = the whole video, `strip.jpg` = one frame per 5 s). **Open sheet1+sheet2 before drawing anything.**

Look reference = the 4 shorts in `~/learn/maya/` (Indian myth channel, private study material: never upload them, never
copy their scripts/characters/shots, never name the channel). Our stories, characters and voice are always our own.

## What's in this skill
| path | what |
|---|---|
| `templates/remotion/` | the full renderer: `Main.tsx` (composition: scenes, crossfades, curtain, karaoke captions, audio), `Stage.tsx` (SVG filters, backdrop+arch, floor, hanging stars/moon, dust, haze/vignette/grain, curtain, diya), `Puppet.tsx` (marionette rig + character library: NACHIKETA, RISHI, YAMA, APSARA, Cow, **SHIVA(throat, trident)**, **PARVATI**, **DEVA(skin, cloth)**, **ASURA(skin, cloth)**), `Props.tsx` (flames, havan kund, gate, river, tree, coins, gold pot, palace, cloud, manuscript, sun, peeking god, sparkle, **MilkOcean, Mandara, VasukiCoils, VasukiRope, Kurma, PoisonCloud, Kailash, Snake, Scorpion, Kalash, Om**), `Scenes.tsx` (story: `SCENES` + `KEY`; ships with the 17 Nachiketa scenes as a worked example), `lib.ts` (timing/easing/noise/sway, palette `C`), `Test.tsx` (puppet lab) |
| `templates/voice/tts.py` | edge-tts Hindi voice per line → `voice.wav` + exact `words.json` + `lines.md` |
| `templates/audio/` | `make_audio.py` (tanpura drone, plucked raga melody, tabla, pads, 12 synthesized SFX, ducking, −15 LUFS master) + `dsp.py` |
| `templates/scripts/` | `new_short.sh` (one-command scaffold), `stills.mjs` (render stills), `sheet.py` (contact sheet), `render.sh` (final render + checks) |
| `templates/assets/` | `TiroDevanagariHindi-Regular.ttf` (caption + manuscript font, OFL) |
| `templates/SCRIPT_template.md` | beat structure for the Hindi script |
| `references/STYLE_BIBLE.md` | **exact** look numbers: palette, layout, captions, camera, timing, sound |
| `references/RIG.md` | puppet rig API, pose angles, how to design a new character/prop, scene cookbook |
| `examples/neelkanth/` | Shiva drinks the Halahal (128 s, ElevenLabs Viraj): script, lines.md, full Scenes.tsx (churning tableau, poison, blue throat), filled make_audio.py. Final video `~/learn/vid-test/out/neelkanth/neelkanth.mp4` |
| `examples/nachiketa/` | approved SCRIPT.md, words.json, filled-in make_audio.py, original Nachi.tsx, scene timing table |

## Setup (once per machine; already done on this box)
- Remotion project `~/learn/vid-test` (Remotion 4.0.290, React 18.3.1; `package.json` there). For a new box:
  `npm i remotion@4.0.290 @remotion/cli@4.0.290 @remotion/bundler@4.0.290 @remotion/renderer@4.0.290 react@18.3.1 react-dom@18.3.1 && npm i -D typescript@5.6.3 @types/react@18.3.12`, `src/index.ts` = `registerRoot(RemotionRoot)`, `src/Root.tsx` with a `<>…</>` of Compositions.
- Python with `edge-tts numpy scipy pillow`: use `~/setu-short/.venv/bin/python` (has all four). New box: `python3 -m venv ~/.venvs/puppet && ~/.venvs/puppet/bin/pip install edge-tts numpy scipy pillow`.
- `ffmpeg`/`ffprobe` on PATH (`~/.local/bin`, static build). tts.py falls back to Remotion's bundled ffmpeg.
- edge-tts needs internet (Microsoft voices, free, no key).

Below `PY=~/setu-short/.venv/bin/python`, `SK=~/.claude/skills/puppet-theatre-short`, project `~/learn/vid-test`.

## Pipeline
1. **Story + facts.** Topics are **Hindu mythology stories about the gods** (Shiva, Vishnu and avatars, Devi, Ganesha,
   Hanuman, Indra, Yama...), not human heroes (the user rejected Ekalavya). One story with a paradox hook (child given to Death, ants that were Indra…).
   Write source (text + chapter/verse) at the top of the script. Facts only from the source.
2. **Script** (`~/<slug>-short/SCRIPT.md`, from `templates/SCRIPT_template.md`). Hindi, Devanagari, 14-18 lines, one line =
   one TTS clip = one scene, 6-14 words each, 60-85 s total. Short dialogue in quotes, `…` for dramatic pauses, `—` before
   speech. Beats: hook paradox → setting → trigger question → escalation in threes → journey → test → the ask that
   scares the god → temptation → refusal → teaching in one quotable line → name it ("यही संवाद आज ___ कहलाता है") → callback twist.
   **Show the script to the user and get approval.** After approval, run all remaining steps without asking.
3. **Scaffold**: `$SK/templates/scripts/new_short.sh <slug> <Comp>` (e.g. `prahlad Prahlad`). Creates
   `src/videos/<slug>/`, `public/<slug>/` (font + placeholder words/mix), `~/<slug>-short/{voice,audio}`, registers
   `<Comp>Short` + `<Comp>Test` in `src/Root.tsx`, copies scripts into `scripts/`. It compiles and renders immediately (with the Nachiketa example).
4. **Voice** — default = **ElevenLabs connector, voice "Viraj – Mythological & Historical Storytelling Voice"**
   (`voice_id bTQ95wUqqzrQbvYGBBR5`, Hindi, deep/calm/reverent; the user chose it for Neelkanth). Steps:
   a. `creative_generate_speech` with `model_id: eleven_v4`, the whole script as ONE prompt (lines separated by blank
      lines), delivery tags only where the mood changes: start `[calmly] [deep voice]`, `[dramatically]` on the reveal,
      `[calmly]` back, `[softly]` for relief, `[reverently]` for the last line. Default 2 takes (~1,450 credits each for
      280 words ≈ 2 min). Poll `creative_get_flow_run_status`; never re-call generate to retry.
   b. Download both `content_url`s to `~/<slug>-short/voice/el/`; compare with ffmpeg (`silencedetect`, `volumedetect`) and
      pick the steadier/slower take for calm narration.
   c. `creative_add_flow_asset_node` (modality audio, `generation_id` of the chosen take, same flow) →
      `creative_transcribe_audio` (`eleven_scribe_v1`, `connect_from` that node; free) → download `words_download_url`.
   d. `cd ~/<slug>-short/voice && $PY $SK/templates/voice/el_words.py el/takeA.mp3 el/words_raw.json ../SCRIPT.md --lead 2.0`
      → voice.wav, words.json, lines.md (prints mismatches; Neelkanth matched 276/276 words).
   Free fallback: `$PY tts.py ../SCRIPT.md` (edge-tts `hi-IN-MadhurNeural`, `--rate +8%`, `--lead 2.2`, `--gap 0.6`).
   Then `cp voice.wav words.json <project>/public/<slug>/`. Captions and every animation are timed to words.json.
   Length = last word end + ~3.8 s (Neelkanth: 278 words at Viraj's calm pace → 128 s).
5. **Scenes** (`src/videos/<slug>/Scenes.tsx`): replace `KEY` (names/key concepts → cyan) and `SCENES`. One scene per
   script line: `a` = previous scene's `b`, `b` = next line's start − ~0.1 s (take from `lines.md`); scene 1 starts at 0;
   last scene ends ~3.8 s after the last word (curtain closes over the last 2.4 s — `Main.tsx` reads the length from the last `b`).
   Build each with the `Stage`/`Lay`/`P` helpers (see `references/RIG.md` cookbook). Every gesture is keyed with `step(T, a, b)`
   so it lands 0-0.2 s **before** its word. New characters → `Puppet.tsx` (`Look`), new props → `Props.tsx`, all in the same
   ink/flat/dot-trim language. Check new ones in the lab: `node scripts/stills.mjs <Comp>Test out/<slug>/lab_ 0 0.5`.
6. **Sound** (`~/<slug>-short/audio/`): fill the four `### EDIT` tables in `make_audio.py` (melody sections, tabla, pads,
   SFX cues at the exact scene-event times; `examples/nachiketa/make_audio.py` is a complete filled example). Then
   `$PY make_audio.py && cp mix.wav <project>/public/<slug>/mix.wav`. Prints `dur / LUFS (≈ −15) / TP (≤ −1)`.
   Picture timing must be locked first; any later scene-time change → re-run.
7. **Look check**: `cd ~/learn/vid-test && npx tsc --noEmit -p .` then
   `node scripts/stills.mjs <Comp>Short out/<slug>/s_ <one frame mid-each-scene, comma list> 0.4` and
   `python3 scripts/sheet.py out/<slug>/sheet1.jpg out/<slug>/s_*.jpg` (8 per sheet). Read the sheets and compare with
   `references/frames/sheet1.jpg`… against the checklist in STYLE_BIBLE.md (characters on the floor line, captions
   readable and not covering faces, nothing cut by the frame edge, each line's picture says what the line says). Fix and repeat.
8. **Render**: `scripts/render.sh <Comp> <slug> both` → `out/<slug>/<slug>.mp4` (1080x1920, crf 18, ~3-5 min) and
   `<slug>_4k.mp4` (2160x3840 `--scale 2`, crf 14, preset slow — crisper on YouTube, ~15-25 min). Prints duration, size,
   loudness and writes `out/<slug>/strip.jpg`; read the strip. Remotion muxes `mix.wav` itself (no extra mux step).
9. **Deliver**: give paths to the mp4s + a Hindi title/description suggestion; save a memory note for the new short.

## Hard rules (what makes it "exactly this style")
- Everything is flat SVG: ink outline `#24150c` 3.2 px on every shape, flat fills from palette `C`, dot-trim borders
  (`Dots`/`along`), no gradients on characters, no photos, no AI images, no 3D.
- Characters are marionettes: limbs pinned with visible joint pins, strings to the top of the frame, constant idle sway,
  profile folk faces (big frontal almond eye, long nose), blinking. They hang/stand on the stage floor at y = 1460.
- Every scene sits inside the `Stage` (dark wall + faint arch + hanging stars/moon + floor), with `Dust` in front and the
  global `Atmos` (spotlight, sepia soft-light, vignette, grain) and the warm `pglow` edge glow.
- Camera never sits still: every scene has a slow push (`kf` zoom 1.0→1.1-1.6) or pan; parallax layers by depth `d`.
- Captions: top (y 330), Tiro Devanagari 76 px, ≤ 4 words per chunk, karaoke (unsaid 50 % alpha), KEY words cyan `#7fe6df`.
- Bookends: curtain opens 0.3-2.1 s (voice starts at 2.2 s), closes in the last 2.4 s.
- Sound: one narrator, Indian-flavoured original score under it (ducked −4 dB on speech), SFX on visual events, −15 LUFS.
- No on-screen title cards, no English text, no channel name.

## Gotchas
- `words.json` is imported at build time: after replacing it, re-bundle (stills.mjs bundles every run; Studio needs reload).
- Fonts: the caption font loads with `delayRender`; SVG `<text>` (Manuscript) uses the same `Tiro` family.
- SVG `filter="url(#pglow)"` on many big groups is the main render cost; still ~0.5 s/frame at 0.5 scale, full render ~4-6 fps.
- `clipPath` ids must be unique per scene (e.g. `win1`, `win2`) or crossfading scenes clip each other.
- A puppet's `y` is the **pelvis**; use `feet(LOOK)` / `seat(LOOK)` to stand/sit it on the floor, never guess.
- Angles: arms/legs 0 = straight down, + = forward toward the face; for a flipped (facing left) puppet the same numbers work.
- Keep characters below y ≈ 560 at their head top or the caption (y 330-430) covers faces; zoom pushes move them up — check.
- Remotion temp bundles pile up in `out/.remotion-tmp`: delete it when a project is finished (ask first if unsure).
- `npx tsc` errors in `out/` scratch files: name scratch files `.txt`.
