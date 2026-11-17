// SCENES = the story. Each scene is a 2.5D layered puppet stage timed to the Hindi voice (words.json): {a, b, draw(T)}.
// Times are GLOBAL seconds (T = frame / 30); scene i spans [a, b) and crossfades 0.4 s into the next.
// This file starts as the worked example (Nachiketa, 17 scenes, 80 s): REPLACE the SCENES and KEY with the new story,
// but keep the helpers (Lay, Stage, idle, walk, feet, seat, Shadow) and the patterns they show.
// Camera: `cam` {z zoom, x/y focus point in the 1080x1920 frame, shake 0..1}; per-layer parallax by depth d
// (1 = puppet plane, >1 = further back (moves less), <1 = foreground (moves more); add blur={2|4|7|12} for depth of field).
import React from "react";
import { C, kf, step, sway, lerp, clamp, noise } from "./lib";
import { Puppet, NACHIKETA, RISHI, YAMA, APSARA, Cow, Look, Pose } from "./Puppet";
import { Backdrop, Floor, Hanging, Dust, Atmos, Diya, W, H } from "./Stage";
import { HavanKund, Gate, River, Tree, Coin, GoldPot, Palace, Cloud, Manuscript, Sun, PeekGod, Flames, sparkle } from "./Props";

export type Cam = { z: number; x: number; y: number; shake?: number };
const Lay: React.FC<{ cam: Cam; d?: number; blur?: number; children: React.ReactNode; T?: number }> = ({ cam, d = 1, blur, children, T = 0 }) => {
  const z = cam.z * 1.08, k = 1 + (z - 1) / d;
  const fx = 540 + (cam.x - 540) / d, fy = 960 + (cam.y - 960) / d;
  const sh = cam.shake ? cam.shake / d : 0;
  const sx = sh * noise(T * 18, 1) * 14, sy = sh * noise(T * 18, 2) * 14;
  return <g transform={`translate(${540 + sx},${960 + sy}) scale(${k}) translate(${-fx},${-fy})`} filter={blur ? `url(#blur${blur})` : undefined}>{children}</g>;
};

const FLOOR = 1460;
const legLen = (lk: Look) => ((lk.leg ?? 1) * 198 + 24) * (lk.scale ?? 1);
const feet = (lk: Look, s = 1, floor = FLOOR) => floor - legLen(lk) * s;
const seat = (lk: Look, s = 1, floor = FLOOR) => floor - 44 * (lk.scale ?? 1) * s;
const blink = (T: number, seed: number) => ((T * 0.31 + seed * 0.37) % 1) < 0.035;
/** idle puppet pose: gentle string sway */
const idle = (T: number, seed: number, p: Partial<Pose> = {}): Partial<Pose> => ({
  lean: sway(T, seed, 2), head: sway(T * 0.8, seed + 2, 3),
  aN: [8 + sway(T, seed + 4, 6), 12 + sway(T, seed + 5, 6)], aF: [-6 + sway(T, seed + 6, 5), 14],
  lN: [2 + sway(T, seed + 7, 2), 2], lF: [-2, 3], blink: blink(T, seed), ...p,
});
/** puppet walk: stiff leg swings and a little hop */
const walk = (T: number, sp = 1) => {
  const ph = T * 5.5 * sp, s = Math.sin(ph);
  return { lN: [s * 26, Math.max(0, -s) * 30] as [number, number], lF: [-s * 26, Math.max(0, s) * 30] as [number, number],
    aN: [-s * 22, 14] as [number, number], aF: [s * 22, 14] as [number, number], hop: -Math.abs(Math.cos(ph)) * 14, lean: 4 };
};
const P: React.FC<{ look: Look; pose: Partial<Pose> & { x: number; y: number } }> = ({ look, pose }) => <Puppet look={look} pose={pose as Pose} />;

/** a black shadow-puppet copy (Yama looming on the back wall) */
const Shadow: React.FC<{ o: number; children: React.ReactNode }> = ({ o, children }) => (
  <g opacity={o} filter="url(#blur4)"><g filter="url(#black)">{children}</g></g>
);

const Stage: React.FC<{ T: number; cam: Cam; tint?: string; sky?: "wall" | "night"; moon?: [number, number] | null; arch?: boolean; floor?: boolean; seed?: number; children?: React.ReactNode }> =
  ({ T, cam, tint, sky = "wall", moon = [820, 300], arch = true, floor = true, seed = 1, children }) => (
    <>
      <Lay cam={cam} d={3} T={T}><Backdrop tint={tint} arch={arch} sky={sky} /></Lay>
      <Lay cam={cam} d={2.2} T={T} blur={2}><Hanging t={T} seed={seed} moon={moon} /></Lay>
      {floor && <Lay cam={cam} d={1.15} T={T}><Floor /></Lay>}
      {children}
    </>
  );

/** caption words that get the cyan highlight (names, key concepts). Prefix match: "यम" also matches "यमलोक". */
export const KEY = ["नचिकेता", "मृत्यु", "यमराज", "यम", "यमलोक", "वाजश्रवा", "आत्मा", "कठोपनिषद", "सत्य", "तीन", "वर", "पिता", "मौत", "देवता"];

export type Scene = { a: number; b: number; draw: (T: number) => React.ReactNode };

export const SCENES: Scene[] = [
  // 1 — hook: father points at his son; Death's shadow rises behind (0 – 7.0)
  { a: 0, b: 7.0, draw: (T) => {
    const cam = { z: kf(T, [[0, 1.0], [7, 1.14]]), x: 560, y: 1000 };
    const point = step(T, 3.5, 4.1);
    const sh = step(T, 4.9, 5.8);
    return <Stage T={T} cam={cam} tint={sh > 0 ? "#5a1010" : undefined}>
      <Lay cam={cam} d={1.6} T={T}><ellipse cx={800} cy={860} rx={420} ry={600} fill="#e07a40" opacity={0.42 * sh} filter="url(#soft)" /><g opacity={sh}><Shadow o={0.95}><P look={YAMA} pose={{ ...idle(T, 9), x: 800, y: 1080 - sh * 120, s: 1.5, flip: true, strings: false }} /></Shadow></g>
        <ellipse cx={800} cy={900} rx={380} ry={520} fill="#c4432f" opacity={0.18 * sh} filter="url(#soft)" /></Lay>
      <Lay cam={cam} T={T}>
        <P look={RISHI} pose={{ ...idle(T, 1), x: 300, y: feet(RISHI), aN: [lerp(10, 82, point), lerp(12, 4, point)], head: lerp(0, -6, point) }} />
        <P look={NACHIKETA} pose={{ ...idle(T, 3), x: 640, y: feet(NACHIKETA), flip: true, head: lerp(0, 12, step(T, 5.0, 5.6)), aN: [lerp(8, 30, sh), lerp(12, 100, sh)] }} />
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} /></Lay>
    </Stage>;
  } },
  // 2 — the yajna: rishi gives away old cows (7.0 – 11.9)
  { a: 7.0, b: 11.9, draw: (T) => {
    const t = T - 7;
    const cam = { z: 1.08, x: kf(T, [[7, 420], [9.6, 440], [11.0, 640]]), y: 1080 };
    const pour = Math.max(0, Math.sin(t * 2.6));
    const cows = step(T, 9.6, 11.6);
    return <Stage T={T} cam={cam} seed={2} moon={null}>
      <Lay cam={cam} T={T}>
        <HavanKund x={520} y={1400} t={T} s={0.9} />
        <P look={RISHI} pose={{ ...idle(T, 1), x: 230, y: seat(RISHI), sit: true, aN: [70 + pour * 25, 30], head: -8 + pour * -4 }} />
        <Cow x={lerp(1400, 860, cows)} y={1350} s={0.95} t={T} walk={0.5} flip />
        <Cow x={lerp(1650, 1080, cows)} y={1380} s={0.85} t={T + 0.7} walk={0.5} flip />
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={5} /></Lay>
    </Stage>;
  } },
  // 3 — Nachiketa asks: "Father, to whom will you give me?" (11.9 – 16.6)
  { a: 11.9, b: 16.6, draw: (T) => {
    const cam = { z: kf(T, [[11.9, 1.25], [16.6, 1.42]]), x: 640, y: 1000 };
    const ask = step(T, 13.9, 14.3), self = step(T, 14.6, 14.9);
    return <Stage T={T} cam={cam} seed={3} moon={null}>
      <Lay cam={cam} d={1.4} T={T} blur={2}><HavanKund x={300} y={1420} t={T} s={0.8} hot={0.7} /></Lay>
      <Lay cam={cam} T={T}>
        <P look={RISHI} pose={{ ...idle(T, 1), x: 330, y: feet(RISHI), head: -4 }} />
        <P look={NACHIKETA} pose={{ ...idle(T, 3), x: 700, y: feet(NACHIKETA), flip: true, head: 16,
          aN: [lerp(lerp(8, 95, ask), 30, self), lerp(lerp(12, 10, ask), 120, self)] }} />
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={6} /></Lay>
    </Stage>;
  } },
  // 4 — asked twice; the third time the father snaps "to Yama!" (16.6 – 23.1)
  { a: 16.6, b: 23.1, draw: (T) => {
    const anger = step(T, 19.5, 20.2), yell = step(T, 21.8, 22.1);
    const cam = { z: kf(T, [[16.6, 1.15], [18.5, 1.2], [20.2, 1.45], [23.1, 1.55]]), x: kf(T, [[16.6, 560], [18.5, 560], [20.2, 400]]), y: 960, shake: yell * (1 - step(T, 22.4, 23)) };
    const twice = Math.max(0, Math.sin((T - 16.7) * Math.PI * 2)) * (1 - step(T, 17.6, 17.9));
    return <Stage T={T} cam={cam} seed={4} moon={null} tint={anger > 0 ? `rgba(120,20,10,${0.6 * anger})` : undefined}>
      <Lay cam={cam} d={1.6} T={T}><ellipse cx={560} cy={820} rx={460} ry={640} fill="#e07a40" opacity={0.45 * yell} filter="url(#soft)" /><g opacity={yell}><Shadow o={0.95}><P look={YAMA} pose={{ ...idle(T, 9), x: 560, y: 1000, s: 1.7, flip: true, strings: false }} /></Shadow></g></Lay>
      <Lay cam={cam} d={1.3} T={T} blur={2}><HavanKund x={140} y={1420} t={T} s={0.8} hot={1 + anger * 0.6} /></Lay>
      <Lay cam={cam} T={T}>
        <P look={RISHI} pose={{ ...idle(T, 1), x: 330, y: feet(RISHI), lean: -anger * 6 + noise(T * 12) * 3 * anger, head: -anger * 10,
          aN: [lerp(8, 92, anger), lerp(12, 0, anger)], aF: [lerp(-6, 40, anger), lerp(14, 70, anger)] }} />
        <P look={NACHIKETA} pose={{ ...idle(T, 3), x: 720, y: feet(NACHIKETA), flip: true, head: 16 - yell * 10, lean: -yell * 8,
          aN: [70 + twice * 30, 10] }} />
      </Lay>
      <rect width={W} height={H} fill="#fff4dc" opacity={0.7 * yell * (1 - step(T, 22.1, 22.5))} />
    </Stage>;
  } },
  // 5 — the journey to Yamaloka across the misty river (23.1 – 26.3)
  { a: 23.1, b: 26.3, draw: (T) => {
    const t = T - 23.1, w = walk(T);
    const nx = lerp(150, 760, t / 3.2);
    const cam = { z: 1.1, x: lerp(420, 660, t / 3.2), y: 1000 };
    return <Stage T={T} cam={cam} sky="night" seed={5} moon={[300, 260]} arch={false} floor={false}>
      <Lay cam={cam} d={2.6} T={T} blur={2}><g opacity={0.6}><Gate x={900} y={1250} t={T} s={0.45} /></g></Lay>
      <Lay cam={cam} d={1.4} T={T}><River y={1360} t={T} rows={2} /></Lay>
      <Lay cam={cam} T={T}>
        <path d="M -200 1470 Q 540 1420 1300 1470 L 1300 2000 L -200 2000 Z" fill="#3a2616" stroke={C.ink} strokeWidth={3} />
        <P look={NACHIKETA} pose={{ ...idle(T, 3), x: nx, y: feet(NACHIKETA, 1, 1475) + w.hop, lN: w.lN, lF: w.lF, aN: w.aN, aF: w.aF, lean: w.lean }} />
      </Lay>
      <Lay cam={cam} d={0.7} T={T}><River y={1640} t={T * 1.3} rows={2} col="#22394a" /></Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={7} col="#bfe0ff" /></Lay>
    </Stage>;
  } },
  // 6 — Yama's gate, doors shut, nobody home (26.3 – 28.5)
  { a: 26.3, b: 28.5, draw: (T) => {
    const cam = { z: 1.0, x: 540, y: kf(T, [[26.3, 820], [28.5, 1060]]) };
    return <Stage T={T} cam={cam} sky="night" seed={6} moon={[860, 220]} arch={false}>
      <Lay cam={cam} d={1.05} T={T}><Gate x={540} y={1460} t={T} s={0.95} /></Lay>
      <Lay cam={cam} T={T}><P look={NACHIKETA} pose={{ ...idle(T, 3), x: 470, y: feet(NACHIKETA), head: 22 }} /></Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={8} /></Lay>
    </Stage>;
  } },
  // 7 — three days, three nights at the door (28.5 – 33.2)
  { a: 28.5, b: 33.2, draw: (T) => {
    const cyc = clamp((T - 28.6) / 1.45, 0, 3);           // 3 sun/moon passes
    const f = cyc % 1, day = Math.floor(cyc) < 3 ? Math.sin(f * Math.PI) : 0;
    const arcX = lerp(-80, 1160, f), arcY = 520 - Math.sin(f * Math.PI) * 300;
    const droop = step(T, 29.5, 32.8);
    const cam = { z: kf(T, [[28.5, 1.0], [33.2, 1.15]]), x: 540, y: 1050 };
    return <Stage T={T} cam={cam} sky="night" seed={7} moon={null} arch={false}>
      <Lay cam={cam} d={2.4} T={T}>
        <rect width={W} height={H} fill="#e8a24a" opacity={0.45 * day} />
        {cyc < 3 && (Math.floor(T * 0) === 0) && <g>
          <g opacity={day}><Sun x={arcX} y={arcY} r={60} t={T} /></g>
          <g opacity={1 - day}><path transform={`translate(${lerp(1160, -80, f)},${arcY})`} d="M 10 -34 A 36 36 0 1 0 10 34 A 28 28 0 1 1 10 -34 Z" fill="#f3dfa0" filter="url(#pglow)" /></g>
        </g>}
      </Lay>
      <Lay cam={cam} d={1.05} T={T}><Gate x={540} y={1460} t={T} s={0.95} /></Lay>
      <Lay cam={cam} T={T}><P look={NACHIKETA} pose={{ ...idle(T, 3), x: 440, y: seat(NACHIKETA), sit: true, head: lerp(10, -22, droop), lean: -droop * 8, aN: [30, 70], aF: [20, 80] }} /></Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={9} /></Lay>
    </Stage>;
  } },
  // 8 — Yama returns, ashamed: "ask for three boons" (33.2 – 38.9)
  { a: 33.2, b: 38.9, draw: (T) => {
    const arrive = step(T, 33.2, 34.6), w = walk(T, 0.8), walking = T < 34.6;
    const shame = step(T, 34.4, 35.0) * (1 - step(T, 37.2, 37.6));
    const three = step(T, 37.5, 38.2);
    const cam = { z: 1.05, x: 600, y: 900 };
    return <Stage T={T} cam={cam} seed={8} moon={[200, 260]}>
      <Lay cam={cam} d={1.05} T={T} blur={2}><g opacity={0.8}><Gate x={540} y={1460} t={T} s={0.95} open={0.6} /></g></Lay>
      <Lay cam={cam} T={T}>
        <P look={NACHIKETA} pose={{ ...idle(T, 3), x: 260, y: feet(NACHIKETA), head: 20 }} />
        <P look={YAMA} pose={{ ...idle(T, 9), x: lerp(1250, 760, arrive), y: feet(YAMA) + (walking ? w.hop : 0), flip: true,
          ...(walking ? { lN: w.lN, lF: w.lF } : {}), head: -shame * 22, lean: shame * 10,
          aF: [lerp(20, 120, three), lerp(110, 10, three)], aN: [30 + shame * 10, 60] }} />
        {[0, 1, 2].map((i) => <g key={i} opacity={step(T, 37.6 + i * 0.12, 37.9 + i * 0.12)}><Diya x={420 + i * 150} y={560 - (i === 1 ? 40 : 0)} t={T + i} s={0.9} /></g>)}
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={10} /></Lay>
    </Stage>;
  } },
  // 9 — boon one: "may my father's anger be calmed" (38.9 – 41.9)
  { a: 38.9, b: 41.9, draw: (T) => {
    const calm = step(T, 40.5, 41.4), win = step(T, 39.6, 40.2);
    const cam = { z: 1.0, x: 540, y: 960 };
    return <Stage T={T} cam={cam} seed={9} moon={null}>
      <Lay cam={cam} T={T}>
        {[0, 1, 2].map((i) => <Diya key={i} x={390 + i * 150} y={330} t={T + i} s={0.8} lit={i === 0 ? 1 : 0.0} />)}
        <g opacity={win}>
          <circle cx={600} cy={860} r={330} fill="#3a2414" stroke={C.gold} strokeWidth={8} />
          <circle cx={600} cy={860} r={330} fill="url(#spot)" opacity={0.9} />
          <clipPath id="win1"><circle cx={600} cy={860} r={322} /></clipPath>
          <g clipPath="url(#win1)"><P look={RISHI} pose={{ ...idle(T, 1), x: 600, y: 1040, s: 0.8, strings: false, head: lerp(-8, 6, calm),
            aN: [lerp(10, 40, calm), lerp(12, 100, calm)], aF: [lerp(-6, 36, calm), lerp(14, 104, calm)] }} /></g>
        </g>
        <P look={NACHIKETA} pose={{ ...idle(T, 3), x: 210, y: feet(NACHIKETA), head: 18, aN: [40, 100], aF: [36, 104] }} />
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={11} /></Lay>
    </Stage>;
  } },
  // 10 — boon two: the secret of the heavenly fire (41.9 – 44.7)
  { a: 41.9, b: 44.7, draw: (T) => {
    const rise = step(T, 42.6, 43.6);
    const cam = { z: kf(T, [[41.9, 1.0], [44.7, 1.12]]), x: 540, y: 1000 };
    return <Stage T={T} cam={cam} seed={10} moon={null} tint="rgba(140,70,10,0.4)">
      <Lay cam={cam} T={T}>
        {[0, 1, 2].map((i) => <Diya key={i} x={390 + i * 150} y={330} t={T + i} s={0.8} lit={i === 0 ? 1 : i === 1 ? step(T, 42.6, 43.0) : 0} />)}
        <g transform={`translate(540,1380)`}><Flames t={T} s={1.1 + rise * 0.9} hot={1 + rise * 0.5} col={["#c4432f", "#f0a030", "#ffe28a"]} /></g>
        {sparkle(T, 30, 4, 540, 900, 380)}
        <P look={YAMA} pose={{ ...idle(T, 9), x: 900, y: feet(YAMA), flip: true, aF: [110, 20], aN: [30, 60] }} />
        <P look={NACHIKETA} pose={{ ...idle(T, 3), x: 170, y: feet(NACHIKETA), head: 14 }} />
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={12} /></Lay>
    </Stage>;
  } },
  // 11 — boon three: Yama trembles at "what happens after death?" (44.7 – 48.9)
  { a: 44.7, b: 48.9, draw: (T) => {
    const tremble = step(T, 46.2, 46.5) * (1 - step(T, 47.6, 48.4));
    const cam = { z: kf(T, [[44.7, 1.3], [48.9, 1.6]]), x: 700, y: 760, shake: tremble * 0.5 };
    return <Stage T={T} cam={cam} seed={11} moon={null} tint="rgba(20,30,70,0.5)">
      <Lay cam={cam} T={T}>
        {[0, 1, 2].map((i) => <Diya key={i} x={390 + i * 150} y={330} t={T + i} s={0.8} lit={i < 2 ? 1 : step(T, 45.2, 45.6) * (0.6 + 0.4 * Math.abs(Math.sin(T * 11)))} col={i === 2 ? "#8fc7ff" : undefined} />)}
        <P look={YAMA} pose={{ ...idle(T, 9), x: 760, y: feet(YAMA), flip: true, lean: -tremble * 6 + noise(T * 20, 4) * 4 * tremble, head: 8 + noise(T * 22, 5) * 6 * tremble,
          aN: [30 + tremble * 20, 60], aF: [lerp(10, 70, tremble), lerp(14, 90, tremble)] }} />
      </Lay>
      <Lay cam={cam} d={0.55} T={T} blur={4}><P look={NACHIKETA} pose={{ ...idle(T, 3), x: 640, y: 985, s: 1.2, head: 24, aN: [100, 10] }} /></Lay>
    </Stage>;
  } },
  // 12 — the temptations: gold, a kingdom, apsaras ... "just don't ask this" (48.9 – 54.8)
  { a: 48.9, b: 54.8, draw: (T) => {
    const gold = step(T, 49.5, 50.0), king = step(T, 50.4, 51.1), aps = step(T, 51.3, 52.2), plead = step(T, 53.0, 53.5);
    const cam = { z: kf(T, [[48.9, 1.0], [54.8, 1.08]]), x: 540, y: 1000 };
    return <Stage T={T} cam={cam} seed={12} moon={null}>
      <Lay cam={cam} d={1.6} T={T} blur={2}><Palace x={760} y={lerp(-300, 820, king)} s={0.9} /></Lay>
      <Lay cam={cam} T={T}>
        {Array.from({ length: 26 }, (_, i) => { const fall = ((T - 49.5) * (300 + (i % 5) * 60) + i * 140) % 1500; return gold > 0 && <Coin key={i} x={80 + (i * 197) % 920} y={fall - 100} rot={T * 4 + i} r={18} />; })}
        <g opacity={gold}><GoldPot x={190} y={1460} s={0.9} /></g>
        {[0, 1].map((i) => <P key={i} look={APSARA(i ? C.teal : C.pink, i ? C.gold : C.red)} pose={{ ...idle(T, 20 + i), x: 760 + i * 180, y: lerp(-400, feet(APSARA(C.pink, C.red)) - 60, aps), s: 0.85, flip: i === 1,
          aN: [120 + Math.sin(T * 3 + i) * 30, 40 + Math.sin(T * 3) * 20], aF: [60 - Math.sin(T * 3 + i) * 30, 70], lean: Math.sin(T * 3 + i) * 6, head: Math.sin(T * 3) * 8 }} />)}
        <P look={NACHIKETA} pose={{ ...idle(T, 3), x: 470, y: feet(NACHIKETA), head: 4, aN: [40, 100], aF: [36, 104], lean: 0 }} />
      </Lay>
      <Lay cam={cam} d={0.7} T={T}><g opacity={plead}><P look={YAMA} pose={{ ...idle(T, 9), x: -60, y: 1060, s: 1.1, lean: plead * 12, head: -10, aN: [lerp(10, 75, plead), 30], aF: [70, 40] }} /></g></Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={13} /></Lay>
    </Stage>;
  } },
  // 13 — Nachiketa refuses: "they'll all return to you; I want the truth" (54.8 – 61.1)
  { a: 54.8, b: 61.1, draw: (T) => {
    const push = step(T, 55.5, 56.0) * (1 - step(T, 58.6, 59.2)), up = step(T, 59.3, 59.9), away = step(T, 56.2, 58.6);
    const cam = { z: kf(T, [[54.8, 1.05], [61.1, 1.3]]), x: 540, y: kf(T, [[54.8, 1000], [59.4, 1000], [61.1, 900]]) };
    return <Stage T={T} cam={cam} seed={13} moon={null}>
      <Lay cam={cam} d={1.6} T={T} blur={2}><Palace x={760} y={lerp(820, -500, away)} s={0.9} /></Lay>
      <Lay cam={cam} T={T}>
        <g opacity={1 - away}><GoldPot x={190} y={1460 - away * 900} s={0.9} />
          {[0, 1].map((i) => <P key={i} look={APSARA(i ? C.teal : C.pink, i ? C.gold : C.red)} pose={{ ...idle(T, 20 + i), x: 780 + i * 170, y: feet(APSARA(C.pink, C.red)) - 60 - away * 1400, s: 0.85, flip: i === 1 }} />)}</g>
        <ellipse cx={540} cy={900} rx={260} ry={760} fill="#ffe29a" opacity={0.35 * up} filter="url(#soft)" />
        <P look={NACHIKETA} pose={{ ...idle(T, 3), x: 540, y: feet(NACHIKETA), head: lerp(0, 30, up), lean: -push * 4,
          aN: [lerp(lerp(8, 90, push), 165, up), lerp(lerp(12, -10, push), 0, up)], aF: [-6, 14] }} />
        {up > 0 && sparkle(T, 24, 9, 540, 700, 300)}
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={14} /></Lay>
    </Stage>;
  } },
  // 14 — Death teaches a child the secret of the self (61.1 – 64.9)
  { a: 61.1, b: 64.9, draw: (T) => {
    const cam = { z: kf(T, [[61.1, 1.0], [64.9, 1.12]]), x: 560, y: 1050 };
    return <Stage T={T} cam={cam} seed={14} moon={[160, 280]} arch={false}>
      <Lay cam={cam} d={1.25} T={T}><Tree x={620} y={1460} s={1.15} t={T} /></Lay>
      <Lay cam={cam} T={T}>
        <P look={YAMA} pose={{ ...idle(T, 9), x: 760, y: seat(YAMA), flip: true, sit: true, aF: [70 + Math.sin(T * 1.5) * 15, 50], aN: [30, 60], head: -6 }} />
        <P look={NACHIKETA} pose={{ ...idle(T, 3), x: 330, y: seat(NACHIKETA), sit: true, head: 12, aN: [40, 100], aF: [36, 104] }} />
        {sparkle(T, 30, 21, 540, 1000, 220)}
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={15} /></Lay>
    </Stage>;
  } },
  // 15 — "the self is neither born nor dies": a steady flame while bodies come and go (64.9 – 68.0)
  { a: 64.9, b: 68.0, draw: (T) => {
    const born = step(T, 65.5, 66.1), gone = step(T, 66.8, 67.5);
    const cam = { z: kf(T, [[64.9, 1.0], [68, 1.1]]), x: 540, y: 960 };
    return <Stage T={T} cam={cam} seed={15} moon={null} arch={false} floor={false}>
      <Lay cam={cam} T={T}>
        <circle cx={540} cy={880} r={420} fill="#ffcf6a" opacity={0.12} filter="url(#soft)" />
        <g opacity={born * 0.8}><g filter="url(#goldsil)"><P look={NACHIKETA} pose={{ ...idle(T, 3), x: 230, y: 1250, s: 0.8, strings: false }} /></g></g>
        <g opacity={(1 - gone) * 0.8}><g filter="url(#goldsil)"><P look={RISHI} pose={{ ...idle(T, 1), x: 850, y: 1170, flip: true, lean: 10 + gone * 30, head: -15, strings: false }} /></g></g>
        <Diya x={540} y={1060} t={T} s={2.6} />
        {sparkle(T, 36, 31, 540, 900, 260)}
      </Lay>
    </Stage>;
  } },
  // 16 — that dialogue is the Katha Upanishad (68.0 – 71.4)
  { a: 68.0, b: 71.4, draw: (T) => {
    const open = step(T, 68.4, 69.6);
    const cam = { z: kf(T, [[68, 1.0], [71.4, 1.08]]), x: 540, y: 960 };
    return <Stage T={T} cam={cam} seed={16} moon={null}>
      <Lay cam={cam} T={T}>
        <Manuscript x={540} y={880} open={open} text="कठोपनिषद" />
        <Diya x={300} y={1250} t={T} s={1.1} /><Diya x={780} y={1250} t={T + 1} s={1.1} />
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={17} /></Lay>
    </Stage>;
  } },
  // 17 — finale: the gods were afraid of the question; a child asked Death himself. Curtain falls (71.4 – 80)
  { a: 71.4, b: 80.0, draw: (T) => {
    const peek = step(T, 72.3, 72.8) * (1 - step(T, 73.0, 73.6)), bow = step(T, 74.4, 75.2);
    const cam = { z: kf(T, [[71.4, 1.15], [74.4, 1.15], [77.5, 0.92]]), x: 560, y: 1000 };
    return <Stage T={T} cam={cam} seed={17} moon={[820, 250]}>
      <Lay cam={cam} d={1.8} T={T}>
        <g transform={`translate(0,${lerp(140, 0, peek)})`} opacity={peek}>
          <PeekGod x={150} y={520} skin={C.blue} s={0.8} /><PeekGod x={300} y={500} skin="#e6c08a" s={0.8} /><PeekGod x={450} y={520} skin={C.green} s={0.8} />
        </g>
        <Cloud x={300} y={560} s={1.05} />
      </Lay>
      <Lay cam={cam} T={T}>
        <P look={YAMA} pose={{ ...idle(T, 9), x: 760, y: feet(YAMA), flip: true, head: -bow * 14, lean: bow * 8, aN: [lerp(30, 40, bow), lerp(60, 100, bow)], aF: [lerp(10, 36, bow), lerp(14, 104, bow)] }} />
        <P look={NACHIKETA} pose={{ ...idle(T, 3), x: 330, y: feet(NACHIKETA), head: 18 - bow * 22, lean: bow * 8, aN: [40, 100], aF: [36, 104] }} />
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={18} /></Lay>
    </Stage>;
  } },
];

export const atmosFor = (T: number) => <Atmos t={T} />;
