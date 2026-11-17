# Puppet rig, character design and scene cookbook

## Rig (`Puppet.tsx`)
```tsx
<Puppet look={NACHIKETA} pose={{ x, y, s, flip, lean, head, aN, aF, lN, lF, sit, strings, blink, opacity }} />
```
- `x, y`: pelvis position in the 1080x1920 frame. Stand on the floor with `y: feet(LOOK)`, sit with `y: seat(LOOK)` (Scenes.tsx helpers; pass `s` and a custom floor if scaled/raised: `feet(LOOK, s, 1475)`).
- `s` scale (on top of `look.scale`); `flip: true` faces left (drawn facing right).
- `lean` torso tilt °, + = forward; `head` °, + = look up/back.
- `aN`/`aF` near/far arm `[shoulder, elbow]`: 0 = hanging down, 90 = pointing straight forward, 165 = raised overhead;
  elbow + = bent forward (100 = folded hands, namaste: `aN:[40,100], aF:[36,104]`).
- `lN`/`lF` near/far leg `[hip, knee]`; `sit: true` overrides to cross-legged.
- `strings: false` for shadows, visions, silhouettes. `blink` from `blink(T, seed)`.
- Draw order: far leg → far arm → torso → near leg → skirt → head → near arm (so the near arm crosses the body).

Useful poses
| action | values |
|---|---|
| idle | `{...idle(T, seed)}` (always spread first, then override) |
| point at someone | `aN: [82, 4], head: -6` |
| ask / reach out | `aN: [95, 10], head: 16` |
| point at self | `aN: [30, 120]` |
| namaste / pray | `aN: [40, 100], aF: [36, 104]` |
| arms up to heaven | `aN: [165, 0], head: 30` |
| push away / refuse | `aN: [90, -10], lean: -4` |
| anger | `lean: -6 + noise(T*12)*3, head: -10, aN: [92, 0], aF: [40, 70]` |
| shame / bow | `head: -22, lean: 10` |
| tremble | `lean: noise(T*20,4)*4, head: 8 + noise(T*22,5)*6` |
| walk | `const w = walk(T); {lN: w.lN, lF: w.lF, aN: w.aN, aF: w.aF, lean: w.lean, y: feet(L) + w.hop}` + move `x` with `lerp` |
| sit, droop | `sit: true, head: -22, lean: -8, aN: [30, 70], aF: [20, 80]` |

Blend poses with `lerp(a, b, step(T, t0, t1))` — never jump.

## New character = a `Look`
```ts
export const PRAHLAD: Look = {
  skin: C.skin, scale: 0.78, torsoH: 150, arm: 0.9, leg: 0.88,   // child proportions (adult: 1.0 / 175; god: 1.2 / 185)
  band: C.gold, legCloth: C.saffron,                              // wrist/ankle band colour, thigh cloth
  head: ({ blink }) => <g transform="scale(1.18)"><Face skin={C.skin} blink={blink} />{/* hair/crown/marks */}</g>,
  torso: <g>{chest(C.skin, C.red, 150, 0.92)}{necklace(150, C.cream, 7)}</g>,
  skirt: dhoti(C.saffron, C.red, 80),                             // or a sari path like APSARA
  heldN: mace,                                                    // optional object in the near hand (gets hand angle)
};
```
Define new looks INSIDE `Puppet.tsx` (these helpers are file-local; export the look). Library to reuse: `Face` (profile, brow/lip colours), `chest`, `necklace`, `dhoti`, `crown`, `mace`, `tilak`, `Dots`, `along`, `dark`.
Existing looks: `NACHIKETA` (boy), `RISHI` (old sage, beard, jata), `YAMA` (blue god-king, crown, mace), `APSARA(sari, trim)` (woman), `Cow`.
Design rules: one strong silhouette feature per character (crown height, beard, topknot), max 4 flat colours + gold dots,
gods bigger and with crowns, villains darker skin tints with red eye rings, everyone ink-outlined. Check in the lab
(`Test.tsx`, add the look there) at frame 0 before using it in a scene.

## New prop
A function component `({x, y, s, t}) => <g transform=translate/scale filter="url(#pglow)">…</g>`, origin at its base,
flat fills + `stroke={C.ink} strokeWidth={3.2}` + one `Dots` trim row, animated only by `t` (flicker, sway, rotate).
Hanging props get two string lines up to y −2400 (see `Palace`). Existing: `Flames, HavanKund, Gate(open), River, Tree,
Coin, GoldPot, Palace, Cloud, Manuscript(open,text), Sun, PeekGod, sparkle(), Diya(lit,col)`.

## Scene cookbook (`Scenes.tsx`)
```tsx
{ a: 23.1, b: 26.3, draw: (T) => {
  const t = T - 23.1, w = walk(T);
  const cam = { z: 1.1, x: lerp(420, 660, t / 3.2), y: 1000 };          // always moving
  return <Stage T={T} cam={cam} sky="night" seed={5} moon={[300, 260]} arch={false} floor={false}>
    <Lay cam={cam} d={2.6} T={T} blur={2}>{/* far scenery */}</Lay>
    <Lay cam={cam} T={T}>{/* puppets on the stage plane */}</Lay>
    <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={7} /></Lay>          // always last
  </Stage>;
} },
```
Recipes from Nachiketa (scene # in `examples/nachiketa/scene_timing.md`):
- **Hook dread** (#1): red wall tint + a giant black `Shadow` copy of the god rising behind the characters.
- **Shout** (#4): wall tints red over 0.7 s, camera pans to the shouter and pushes 1.2→1.45, shake + cream flash on the word.
- **Journey** (#5): night sky, two `River` rows (back d 1.4, front d 0.7), walking puppet crossing, destination blurred far back.
- **Time passing** (#7): sun and moon alternate along an arc 3 times while the hero sits and droops.
- **Counting** (#8-11): three `Diya`s hanging on top, lit one per boon; the scary one burns blue `#8fc7ff` and flickers.
- **Vision** (#9): gold ring window with clipPath showing another character.
- **Temptations** (#12): coins rain, pot + palace + dancers drop in from the fly loft; the pleading god leans in from the foreground (d 0.7).
- **Refusal** (#13): everything flies up and away, a light beam (tall soft ellipse) + sparkles on the hero.
- **Teaching** (#14-15): both sit under a `Tree`; then a single big `Diya` with golden silhouettes appearing/fading around it.
- **Name the text** (#16): `Manuscript` unrolls with the Devanagari title, two diyas.
- **Finale** (#17): small gods peek over a `Cloud` and duck back, the god bows to the child, camera pulls out, curtain closes.
