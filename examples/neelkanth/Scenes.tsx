// SCENES = the story. Each scene is a 2.5D layered puppet stage timed to the Hindi voice (words.json): {a, b, draw(T)}.
// Times are GLOBAL seconds (T = frame / 30); scene i spans [a, b) and crossfades 0.4 s into the next.
// Neelkanth Mahadev — 17 scenes, 128 s, timed to the ElevenLabs Viraj voice (public/neelkanth/words.json).
// Camera: `cam` {z zoom, x/y focus point in the 1080x1920 frame, shake 0..1}; per-layer parallax by depth d
// (1 = puppet plane, >1 = further back (moves less), <1 = foreground (moves more); add blur={2|4|7|12} for depth of field).
import React from "react";
import { C, kf, step, sway, lerp, clamp, noise, easeIn, easeOut } from "./lib";
import { Puppet, Look, Pose, SHIVA, PARVATI, DEVA, ASURA, Dots, along } from "./Puppet";
import { Backdrop, Floor, Hanging, Dust, Atmos, Diya, W, H } from "./Stage";
import { Flames, sparkle, Sun, MilkOcean, Mandara, VasukiCoils, VasukiRope, Kurma, PoisonCloud, Kailash, Snake, Scorpion, Kalash, Om } from "./Props";

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


/** caption words that get the cyan highlight (names, key concepts). Prefix match. */
export const KEY = ["शिव", "महादेव", "अमृत", "हलाहल", "विष", "ज़हर", "मंथन", "देवता", "असुर", "वासुकी", "मंदराचल", "कच्छप", "कैलाश", "पार्वती", "नीलकंठ", "कंठ", "तीनों", "समुद्र"];

export type Scene = { a: number; b: number; draw: (T: number) => React.ReactNode };

// ------------------------------------------------------------------ cast instances
const DV = [DEVA("#e6c08a", C.gold), DEVA("#d9a46a", C.saffron), DEVA("#f0d2a0", C.teal)];
const AS = [ASURA("#6a4b5e", "#3f6b4a"), ASURA("#5a4a6e", C.deepRed), ASURA("#4f5a4a", "#6b3a22")];
const S_DV = 0.85;
const LEDGE = 1300;

/** poison drop (teardrop), tip up */
const Drop: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={0} rx={60} ry={60} fill="#3fd0a0" opacity={0.35} filter="url(#soft)" />
    <path d="M 0 -34 Q 22 -4 18 10 Q 12 26 0 26 Q -12 26 -18 10 Q -22 -4 0 -34 Z" fill="#1f3a5a" stroke="#5fe0b0" strokeWidth={3} />
  </g>
);

/** three hanging medallions = the three lokas (swarga / prithvi / patala); burn 0..1 sets them on poison-fire */
const Lokas: React.FC<{ T: number; burn: number[]; y?: number }> = ({ T, burn, y = 600 }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const x = 300 + i * 240, sw = Math.sin(T * 1.2 + i) * 4, b = burn[i] ?? 0;
      const col = ["#f0c75e", "#5f9e4a", "#3c4f8a"][i];
      return <g key={i} transform={`translate(${x + sw},${y})`}>
        <line x1={-sw} y1={-y} x2={0} y2={-70} stroke="#cdb886" strokeOpacity={0.3} strokeWidth={1.4} />
        <g filter="url(#pglow)">
          <circle r={70} fill={col} stroke={C.ink} strokeWidth={4} />
          <circle r={56} fill="none" stroke={C.ink} strokeOpacity={0.5} strokeWidth={2} />
          {i === 0 && <g>{Array.from({ length: 8 }, (_, k) => <path key={k} transform={`rotate(${k * 45})`} d="M -6 -26 L 0 -42 L 6 -26 Z" fill={C.saffron} stroke={C.ink} strokeWidth={1.6} />)}<circle r={22} fill={C.saffron} stroke={C.ink} strokeWidth={2} /></g>}
          {i === 1 && <g><rect x={-6} y={-6} width={12} height={36} fill={C.wood} stroke={C.ink} strokeWidth={2} /><circle cy={-18} r={26} fill="#4c8a3c" stroke={C.ink} strokeWidth={2} /></g>}
          {i === 2 && <path d="M -36 10 Q -18 -20 0 10 Q 18 40 36 0" stroke="#9cc7c9" strokeWidth={8} fill="none" strokeLinecap="round" />}
          {b > 0.01 && <rect x={-72} y={-72} width={144} height={144} rx={72} fill="#10202e" opacity={0.55 * b} />}
        </g>
        {b > 0.01 && <g transform="translate(0,40)" opacity={b}><Flames t={T + i} s={0.5} hot={b} col={["#1f6b5a", "#3fd0a0", "#b8ffe0"]} /></g>}
      </g>;
    })}
  </g>
);

/** rocky ledge the devas/asuras stand on */
const Ledge: React.FC<{ x0: number; x1: number; y?: number }> = ({ x0, x1, y = LEDGE }) => (
  <g>
    <path d={`M ${x0} ${y} Q ${(x0 + x1) / 2} ${y - 24} ${x1} ${y} L ${x1 + (x1 > 540 ? 0 : 40)} 2000 L ${x0 - (x1 > 540 ? 40 : 0)} 2000 Z`} fill="#4a3220" stroke={C.ink} strokeWidth={4} />
    {[30, 120, 220, 330].map((dy, i) => <g key={dy}>
      <path d={`M ${x0} ${y + dy} Q ${(x0 + x1) / 2} ${y + dy - 14 + i * 4} ${x1} ${y + dy}`} stroke={C.ink} strokeOpacity={0.45} strokeWidth={3} fill="none" />
      <Dots pts={along(x0 + 30, y + dy + 22, x1 - 30, y + dy + 22, 7)} r={3.4} fill={i % 2 ? "#a07a3a" : C.red} />
    </g>)}
    <rect x={Math.min(x0, x1)} y={y} width={Math.abs(x1 - x0)} height={10} fill="#6b4a26" />
  </g>
);

/** the churning tableau: mountain + Vasuki + ocean + devas (left, tail) + asuras (right, head) */
const Churn: React.FC<{ T: number; cam: Cam; sink?: number; kurma?: number; poison?: number; spread?: number; fear?: number; devaPull?: number; asuraPull?: number; speed?: number; dark?: number; kalash?: number }> =
  ({ T, cam, sink = 0, kurma = 0, poison = 0, spread = 0, fear = 0, devaPull = 1, asuraPull = 1, speed = 1, dark = 0, kalash = 0 }) => {
    const ph = Math.sin(T * 2.6) * speed, rot = T * 0.9 * speed + ph * 0.4;
    const my = 1360 + sink * 260, tilt = Math.sin(T * 3.1) * 7 * sink * (1 - kurma);
    const pullD = Math.max(0, ph) * devaPull, pullA = Math.max(0, -ph) * asuraPull;
    const rope = T * 1.6 * speed;
    const lean = (side: number) => (side < 0 ? -10 * pullD : -10 * pullA) * (1 - fear) - fear * 10;
    return <>
      <Lay cam={cam} d={2.0} T={T}>{kalash > 0.01 && <g opacity={kalash}><Kalash x={540} y={560} s={0.9} t={T} /></g>}</Lay>
      <Lay cam={cam} d={1.3} T={T}>
        {kurma > 0.01 && <g opacity={kurma}><Kurma x={540} y={1450 + (1 - kurma) * 400} s={0.85} t={T} glow={kurma} /></g>}
        <Mandara x={540} y={my} s={0.85} rot={rot} tilt={tilt} />
        <VasukiCoils x={540 + Math.sin(tilt * 0.017) * 0} y={my} s={0.85} pull={rope} />
      </Lay>
      <Lay cam={cam} d={1.15} T={T}>
        <g opacity={0.82}><MilkOcean y={1330} t={T} rows={4} churn={0.3 + 0.5 * speed} tint={dark > 0.5 ? "#9fb3b0" : undefined} /></g>
        {dark > 0.01 && <rect x={-400} y={1280} width={1900} height={900} fill="#16302e" opacity={0.55 * dark} />}
        {poison > 0.01 && <PoisonCloud x={540} y={1300 - poison * 220} t={T} grow={poison} spread={spread} />}
      </Lay>
      <Lay cam={cam} T={T}>
        <Ledge x0={-120} x1={360} /><Ledge x0={720} x1={1200} />
        <VasukiRope x0={150} x1={455} y={1030} pull={rope} head={false} sag={26} />
        <g transform="translate(1080,0) scale(-1,1)"><VasukiRope x0={150} x1={455} y={1030} pull={-rope} head sag={26} /></g>
        {DV.map((L, i) => <P key={`d${i}`} look={L} pose={{ ...idle(T, 30 + i), x: 50 + i * 100 - pullD * 12, y: feet(L, S_DV, LEDGE), s: S_DV,
          lean: lean(-1), head: fear * 18, aN: [90 - fear * 30, 10 + fear * 60], aF: [84 - fear * 30, 16 + fear * 60], lN: [8 * pullD, 4], lF: [-14 * pullD, 6] }} />)}
        {AS.map((L, i) => <P key={`a${i}`} look={L} pose={{ ...idle(T, 40 + i), x: 1030 - i * 100 + pullA * 12, y: feet(L, S_DV, LEDGE), s: S_DV, flip: true,
          lean: lean(1), head: fear * 18, aN: [90 - fear * 30, 10 + fear * 60], aF: [84 - fear * 30, 16 + fear * 60], lN: [8 * pullA, 4], lF: [-14 * pullA, 6] }} />)}
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={21} col={poison > 0.3 ? "#9fffd8" : "#ffd98f"} /></Lay>
    </>;
  };

const ShivaStand = (T: number, x: number, p: Partial<Pose> = {}, throat = 0, trident = true) =>
  <P look={SHIVA(throat, trident)} pose={{ ...idle(T, 7), x, y: feet(SHIVA(0)), flip: true, aN: [32 + sway(T, 9, 3), 48], ...p }} />;

export const SCENES: Scene[] = [
  // 1 — hook: a poison so deadly one drop could end the world; who drank it? (0 – 11.86)
  { a: 0, b: 11.86, draw: (T) => {
    const cam = { z: kf(T, [[0, 1.0], [11.86, 1.16]]), x: 540, y: 960 };
    const fall = step(T, 5.0, 6.3), hit = step(T, 6.25, 6.6) * (1 - step(T, 7.4, 8.6));
    const sh = step(T, 7.6, 9.0), ask = step(T, 10.7, 11.2);
    return <Stage T={T} cam={cam} tint="rgba(10,40,50,0.6)" moon={[820, 300]}>
      <Lay cam={cam} d={1.6} T={T}>
        <ellipse cx={540} cy={820} rx={440} ry={640} fill="#3aa0b0" opacity={0.42 * sh} filter="url(#soft)" />
        <ellipse cx={540} cy={860} rx={380} ry={540} fill="#1f6b7a" opacity={0.25 * sh} filter="url(#soft)" />
        <g opacity={sh}><Shadow o={0.95}><P look={SHIVA(0)} pose={{ x: 540, y: 1150, s: 1.5, flip: true, strings: false, lean: 0, head: 0, aN: [12, 10], aF: [-6, 12] }} /></Shadow></g>
        <ellipse cx={538} cy={796} rx={70 + ask * 30} ry={50 + ask * 20} fill="#5fc8ff" opacity={(0.35 + 0.4 * ask) * sh} filter="url(#soft)" />
      </Lay>
      <Lay cam={cam} T={T}>
        {T < 6.6 && <Drop x={540 + Math.sin(T * 1.3) * 6 * (1 - fall)} y={lerp(lerp(-60, 640, easeOut(step(T, 1.6, 3.0))), 1440, easeIn(fall))} s={1.2 + 0.4 * (1 - fall) * step(T, 2.5, 4.5)} />}
        {T < 5.2 && <line x1={540} y1={0} x2={540 + Math.sin(T * 1.3) * 6} y2={lerp(-60, 606, easeOut(step(T, 1.6, 3.0)))} stroke="#cdb886" strokeOpacity={0.35 * (1 - step(T, 4.6, 5.1))} strokeWidth={1.4} />}
        <ellipse cx={540} cy={1450} rx={600 * hit + 10} ry={120 * hit + 4} fill="#3fd0a0" opacity={0.5 * hit} filter="url(#soft)" />
        {hit > 0 && sparkle(T, 24, 3, 540, 1350, 260 * hit)}
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={1} col="#bfe0ff" /></Lay>
    </Stage>;
  } },
  // 2 — not a king, not a warrior: Shiva himself (11.86 – 17.9)
  { a: 11.86, b: 17.9, draw: (T) => {
    const king = step(T, 11.9, 12.3) * (1 - step(T, 12.9, 13.3)), war = step(T, 13.2, 13.6) * (1 - step(T, 14.4, 14.9));
    const drop = step(T, 14.6, 16.0), beam = step(T, 15.6, 16.6);
    const cam = { z: kf(T, [[11.86, 1.05], [17.9, 1.16]]), x: 540, y: 980 };
    return <Stage T={T} cam={cam} seed={2} moon={null}>
      <Lay cam={cam} T={T}>
        <ellipse cx={540} cy={900} rx={300} ry={820} fill="#bfe6ff" opacity={0.28 * beam} filter="url(#soft)" />
        <g opacity={king}><g filter="url(#goldsil)"><P look={DEVA("#d9a46a", C.red)} pose={{ ...idle(T, 2), x: 300, y: feet(DV[0]), strings: false }} /></g></g>
        <g opacity={war}><g filter="url(#goldsil)"><P look={ASURA("#a8744a", C.deepRed)} pose={{ ...idle(T, 3), x: 780, y: feet(AS[0]), flip: true, strings: false, aN: [120, 20] }} /></g></g>
        {ShivaStand(T, 560, { y: lerp(-700, feet(SHIVA(0)), easeOut(drop)), flip: false, head: lerp(10, 0, drop) })}
        {beam > 0 && sparkle(T, 24, 5, 560, 800, 300)}
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={2} /></Lay>
    </Stage>;
  } },
  // 3 — where did the poison come from? the churning of the ocean (17.9 – 24.46)
  { a: 17.9, b: 24.46, draw: (T) => {
    const rise = step(T, 20.6, 22.9), wisp = 1 - step(T, 20.0, 21.6);
    const cam = { z: 1.08, x: 540, y: kf(T, [[17.9, 860], [24.46, 1080]]) };
    return <Stage T={T} cam={cam} sky="night" seed={3} moon={[780, 280]} arch={false} floor={false}>
      <Lay cam={cam} d={1.4} T={T}><g opacity={wisp * 0.9}><PoisonCloud x={540} y={900} t={T} grow={0.45} /></g></Lay>
      <Lay cam={cam} d={1.1} T={T}><MilkOcean y={lerp(2000, 1250, easeOut(rise))} t={T} rows={5} churn={0.3} /></Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={3} col="#e8f4ff" /></Lay>
    </Stage>;
  } },
  // 4 — devas and asuras both wanted amrit, the boon of immortality (24.46 – 31.26)
  { a: 24.46, b: 31.26, draw: (T) => {
    const dv = step(T, 24.4, 25.0), as = step(T, 25.4, 26.0), am = step(T, 27.4, 28.2), reach = step(T, 29.6, 30.4);
    const cam = { z: kf(T, [[24.46, 1.0], [31.26, 1.1]]), x: 540, y: 1000 };
    return <Stage T={T} cam={cam} seed={4} moon={null}>
      <Lay cam={cam} d={1.6} T={T}><g opacity={am}><Kalash x={540} y={lerp(-200, 640, easeOut(am))} s={1.0} t={T} />{sparkle(T, 20, 7, 540, 560, 200)}</g></Lay>
      <Lay cam={cam} T={T}>
        {DV.map((L, i) => <g key={i} opacity={dv}><P look={L} pose={{ ...idle(T, 30 + i), x: 110 + i * 120, y: feet(L, S_DV) - (1 - dv) * 300, s: S_DV,
          head: 20 * am, aN: [lerp(8, 150, reach), lerp(12, 10, reach)] }} /></g>)}
        {AS.map((L, i) => <g key={i} opacity={as}><P look={L} pose={{ ...idle(T, 40 + i), x: 970 - i * 120, y: feet(L, S_DV) - (1 - as) * 300, s: S_DV, flip: true,
          head: 20 * am, aN: [lerp(8, 150, reach), lerp(12, 10, reach)] }} /></g>)}
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={4} /></Lay>
    </Stage>;
  } },
  // 5 — Mandara the churning rod, Vasuki the rope (31.26 – 35.82)
  { a: 31.26, b: 35.82, draw: (T) => {
    const m = step(T, 31.2, 32.6), v = step(T, 33.6, 34.6);
    const cam = { z: kf(T, [[31.26, 0.95], [35.82, 1.05]]), x: 540, y: 1000 };
    return <Stage T={T} cam={cam} sky="night" seed={5} moon={[860, 240]} arch={false} floor={false}>
      <Lay cam={cam} d={1.3} T={T}>
        <Mandara x={540} y={lerp(-200, 1360, easeOut(m))} s={0.85} rot={0} />
        <g opacity={v}><VasukiCoils x={540} y={1360} s={0.85} pull={T * 2} /></g>
      </Lay>
      <Lay cam={cam} d={1.15} T={T}><g opacity={0.85}><MilkOcean y={1330} t={T} rows={4} churn={0.2} /></g></Lay>
      <Lay cam={cam} T={T}><g opacity={v}><g transform="translate(1080,0) scale(-1,1)"><VasukiRope x0={150} x1={455} y={1030} pull={T * 2} head sag={26} /></g>
        <VasukiRope x0={150} x1={455} y={1030} pull={T * 2} head={false} sag={26} /></g></Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={5} /></Lay>
    </Stage>;
  } },
  // 6 — devas pull one side, asuras the other: the churning begins (35.82 – 42.22)
  { a: 35.82, b: 42.22, draw: (T) => {
    const cam = { z: kf(T, [[35.82, 1.0], [42.22, 1.06]]), x: kf(T, [[35.82, 480], [37.8, 480], [39.4, 600], [41, 540]]), y: 1000 };
    const sp = 0.35 + 0.65 * step(T, 40.4, 41.2);
    return <Stage T={T} cam={cam} sky="night" seed={6} moon={[860, 240]} arch={false} floor={false}>
      <Churn T={T} cam={cam} devaPull={step(T, 36.6, 37.2)} asuraPull={step(T, 37.9, 38.4)} speed={sp} />
    </Stage>;
  } },
  // 7 — the mountain sinks; Vishnu as Kurma lifts it on his back (42.22 – 50.22)
  { a: 42.22, b: 50.22, draw: (T) => {
    const sink = step(T, 43.6, 45.2) * (1 - step(T, 48.4, 49.6)), ku = step(T, 46.0, 47.6), fear = sink * (1 - ku * 0.8);
    const cam = { z: kf(T, [[42.22, 1.0], [45.4, 0.95], [50.22, 1.02]]), x: 540, y: kf(T, [[42.22, 1000], [46, 1060], [50.22, 1010]]), shake: sink * (1 - ku) * 0.5 };
    return <Stage T={T} cam={cam} sky="night" seed={7} moon={[860, 240]} arch={false} floor={false}>
      <Churn T={T} cam={cam} sink={sink} kurma={ku} fear={fear} speed={0.4 * (1 - sink * 0.8)} />
    </Stage>;
  } },
  // 8 — churning again, all hoping for amrit ... but out comes Halahal (50.22 – 60.7)
  { a: 50.22, b: 60.7, draw: (T) => {
    const k = step(T, 52.6, 53.6) * (1 - step(T, 54.6, 55.4)), bub = step(T, 55.6, 57.0), p = step(T, 56.4, 60.4), fear = step(T, 58.8, 59.6);
    const cam = { z: kf(T, [[50.22, 1.0], [55.6, 1.04], [60.7, 1.3]]), x: 540, y: kf(T, [[50.22, 1000], [60.7, 1080]]), shake: step(T, 59.1, 59.4) * (1 - step(T, 60.0, 60.6)) };
    return <Stage T={T} cam={cam} sky="night" seed={8} moon={[860, 240]} arch={false} floor={false} tint={p > 0 ? `rgba(10,50,45,${0.6 * p})` : undefined}>
      <Churn T={T} cam={cam} kurma={1} speed={1 - fear * 0.9} poison={p} fear={fear} dark={bub} kalash={k} />
    </Stage>;
  } },
  // 9 — its fire burns the three worlds; no one has a cure (60.7 – 67.66)
  { a: 60.7, b: 67.66, draw: (T) => {
    const spread = step(T, 60.8, 63.0), b0 = step(T, 62.9, 63.3), b1 = step(T, 63.3, 63.7), b2 = step(T, 63.7, 64.1), cower = step(T, 64.2, 64.9);
    const cam = { z: kf(T, [[60.7, 1.05], [67.66, 1.15]]), x: 540, y: 980, shake: 0.25 * spread };
    return <Stage T={T} cam={cam} seed={9} moon={null} tint="rgba(10,50,45,0.6)">
      <Lay cam={cam} d={1.8} T={T}><PoisonCloud x={540} y={1100} t={T} grow={0.8} spread={spread} /></Lay>
      <Lay cam={cam} d={1.3} T={T}><Lokas T={T} burn={[b0, b1, b2]} y={640} /></Lay>
      <Lay cam={cam} T={T}>
        {[-1, 0, 1].map((i) => <g key={i} transform={`translate(${540 + i * 360},1470)`}><Flames t={T + i} s={0.9 * spread} hot={spread} col={["#1f6b5a", "#3fd0a0", "#b8ffe0"]} /></g>)}
        {DV.slice(0, 2).map((L, i) => <P key={i} look={L} pose={{ ...idle(T, 30 + i), x: 140 + i * 130, y: feet(L, S_DV), s: S_DV, head: -20 * cower, lean: 12 * cower, aN: [lerp(8, 150, cower), lerp(12, 120, cower)], aF: [lerp(-6, 140, cower), 110] }} />)}
        {AS.slice(0, 2).map((L, i) => <P key={i} look={L} pose={{ ...idle(T, 40 + i), x: 940 - i * 130, y: feet(L, S_DV), s: S_DV, flip: true, head: -20 * cower, lean: 12 * cower, aN: [lerp(8, 150, cower), lerp(12, 120, cower)], aF: [lerp(-6, 140, cower), 110] }} />)}
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={9} col="#9fffd8" /></Lay>
    </Stage>;
  } },
  // 10 — in terror they run to Shiva on Kailash (67.66 – 74.62)
  { a: 67.66, b: 74.62, draw: (T) => {
    const t = T - 67.66, w = walk(T, 1.3), k = step(T, 71.0, 72.6);
    const cam = { z: 1.05, x: lerp(380, 700, t / 6.96), y: 1000 };
    return <Stage T={T} cam={cam} sky="night" seed={10} moon={[300, 260]} arch={false}>
      <Lay cam={cam} d={2.4} T={T}><g opacity={0.7}><PoisonCloud x={160} y={760} t={T} grow={0.5} /></g></Lay>
      <Lay cam={cam} d={1.6} T={T}><g opacity={k}><Kailash x={900} y={1470} s={0.9} />
        <g filter="url(#goldsil)" opacity={0.9}><P look={SHIVA(0)} pose={{ x: 900, y: seat(SHIVA(0), 0.45, 920), s: 0.45, sit: true, flip: true, strings: false, blink: true, aN: [40, 70], aF: [36, 76] }} /></g></g></Lay>
      <Lay cam={cam} T={T}>
        {[...DV, ...AS].map((L, i) => {
          const x = lerp(-200 + i * 95, 520 + i * 95, clamp(t / 6.4));
          return <P key={i} look={L} pose={{ ...idle(T, 30 + i), x, y: feet(L, S_DV) + w.hop, s: S_DV, lN: w.lN, lF: w.lF, aN: [150, 20], aF: [140, 30], lean: 10, head: -8 }} />;
        })}
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={10} /></Lay>
    </Stage>;
  } },
  // 11 — one cry: "Mahadev, only you can save us!" (74.62 – 80.7)
  { a: 74.62, b: 80.7, draw: (T) => {
    const kneel = step(T, 74.7, 75.4), cry = step(T, 76.8, 77.3);
    const cam = { z: kf(T, [[74.62, 1.0], [80.7, 1.18]]), x: kf(T, [[74.62, 540], [80.7, 640]]), y: 1000 };
    return <Stage T={T} cam={cam} sky="night" seed={11} moon={[860, 240]} arch={false}>
      <Lay cam={cam} d={2.4} T={T}><Kailash x={760} y={1500} s={1.1} /></Lay>
      <Lay cam={cam} d={2.0} T={T}><g opacity={0.6}><PoisonCloud x={120} y={700} t={T} grow={0.5} /></g></Lay>
      <Lay cam={cam} T={T}>
        <ellipse cx={780} cy={1000} rx={300} ry={460} fill="#bfe6ff" opacity={0.18 + 0.12 * cry} filter="url(#soft)" />
        <P look={SHIVA(0)} pose={{ ...idle(T, 7), x: 790, y: seat(SHIVA(0)), sit: true, flip: true, blink: true, head: -4, aN: [40, 70], aF: [36, 76] }} />
        {[...DV, ...AS].slice(0, 5).map((L, i) => <P key={i} look={L} pose={{ ...idle(T, 30 + i), x: 80 + i * 92, y: seat(L, S_DV), s: S_DV, sit: kneel > 0.5,
          head: 10 + cry * 14, lean: 6, aN: [40, 100], aF: [36, 104] }} />)}
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={11} /></Lay>
    </Stage>;
  } },
  // 12 — Shiva sees their pain; Parvati, trusting his power, agrees (80.7 – 87.58)
  { a: 80.7, b: 87.58, draw: (T) => {
    const open = T > 81.0, rays = step(T, 80.9, 81.8), pv = step(T, 83.0, 84.0), nod = Math.sin(clamp((T - 86.4) / 0.9) * Math.PI);
    const cam = { z: kf(T, [[80.7, 1.15], [87.58, 1.28]]), x: 660, y: 960 };
    return <Stage T={T} cam={cam} sky="night" seed={12} moon={[260, 260]} arch={false}>
      <Lay cam={cam} d={2.4} T={T}><Kailash x={700} y={1500} s={1.1} /></Lay>
      <Lay cam={cam} T={T}>
        <g opacity={rays}>{Array.from({ length: 12 }, (_, i) => <path key={i} transform={`translate(560,860) rotate(${i * 30 + T * 6})`} d="M -14 0 L 0 -520 L 14 0 Z" fill="#ffe7a0" opacity={0.12} />)}</g>
        <P look={SHIVA(0)} pose={{ ...idle(T, 7), x: 560, y: seat(SHIVA(0)), sit: true, blink: !open, head: 4, aN: [40, 70], aF: [36, 76] }} />
        <g opacity={pv}><P look={PARVATI} pose={{ ...idle(T, 8), x: 860, y: feet(PARVATI) - (1 - pv) * 200, flip: true, head: -14 * nod, aN: [40, 100], aF: [36, 104] }} /></g>
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={12} /></Lay>
    </Stage>;
  } },
  // 13 — Mahadev takes the poison on his palm ... and drinks it without a thought (87.58 – 95.02)
  { a: 87.58, b: 95.02, draw: (T) => {
    const stand = step(T, 87.6, 88.6), palm = step(T, 88.4, 89.4), flow = step(T, 89.0, 91.2), drink = step(T, 93.6, 94.4);
    const cam = { z: kf(T, [[87.58, 1.05], [92, 1.15], [95.02, 1.35]]), x: kf(T, [[87.58, 600], [95.02, 640]]), y: kf(T, [[87.58, 960], [95.02, 900]]) };
    const hx = lerp(792, 640, drink), hy = lerp(925, 880, drink);
    const ox = lerp(160, hx, easeOut(flow)), oy = lerp(560, hy - 30, easeOut(flow));
    return <Stage T={T} cam={cam} sky="night" seed={13} moon={null} arch={false} tint={`rgba(10,50,45,${0.5 * (1 - drink)})`}>
      <Lay cam={cam} d={2.4} T={T}><Kailash x={600} y={1500} s={1.1} /></Lay>
      <Lay cam={cam} d={1.6} T={T}><g opacity={1 - flow}><PoisonCloud x={160} y={760} t={T} grow={0.7} /></g></Lay>
      <Lay cam={cam} T={T}>
        <path d={`M 160 560 Q 400 ${520 - flow * 60} ${ox} ${oy}`} stroke="#3fd0a0" strokeWidth={10 * (1 - drink)} strokeDasharray="18 14" strokeDashoffset={-T * 80} fill="none" opacity={0.7 * flow * (1 - step(T, 91.4, 92))} />
        <P look={SHIVA(0, false)} pose={{ ...idle(T, 7), x: 600, y: lerp(seat(SHIVA(0)), feet(SHIVA(0)), stand), sit: stand < 0.5, head: lerp(0, 10, drink),
          aN: [lerp(lerp(40, 90, palm), 120, drink), lerp(lerp(70, 30, palm), 100, drink)], aF: [-6, 14] }} />
        {flow > 0.05 && drink < 0.98 && <g transform={`translate(${ox},${oy}) scale(${(0.4 + 0.6 * flow) * (1 - drink * 0.9)})`}>
          <circle r={70} fill="#3fd0a0" opacity={0.3} filter="url(#soft)" />
          <circle r={34} fill="#1b2a44" stroke="#5fe0b0" strokeWidth={4} />
          <path d={`M -20 0 q 10 -12 20 0 q 10 12 20 0`} stroke="#5fe0b0" strokeWidth={3} fill="none" transform={`rotate(${T * 90})`} />
        </g>}
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={13} col={drink > 0.5 ? "#ffd98f" : "#9fffd8"} /></Lay>
    </Stage>;
  } },
  // 14 — Parvati holds his throat; the poison stays there and the throat turns blue (95.02 – 104.51)
  { a: 95.02, b: 104.51, draw: (T) => {
    const reach = step(T, 95.7, 96.6) * (1 - step(T, 100.6, 101.4)), hold = step(T, 97.4, 98.2) * (1 - step(T, 100.6, 101.4)), blue = step(T, 101.2, 103.4), pulse = step(T, 100.6, 101.0) * (1 - step(T, 101.4, 102));
    const cam = { z: kf(T, [[95.02, 1.1], [99, 1.25], [104.51, 1.55]]), x: kf(T, [[95.02, 560], [104.51, 620]]), y: kf(T, [[95.02, 1080], [104.51, 1120]]) };
    return <Stage T={T} cam={cam} sky="night" seed={14} moon={[860, 260]} arch={false}>
      <Lay cam={cam} d={2.4} T={T}><Kailash x={560} y={1500} s={1.1} /></Lay>
      <Lay cam={cam} T={T}>
        <ellipse cx={640} cy={1170} rx={120 + 160 * blue + 60 * pulse} ry={100 + 120 * blue} fill="#5fc8ff" opacity={0.15 + 0.45 * blue + 0.3 * pulse} filter="url(#soft)" />
        <P look={SHIVA(blue, false)} pose={{ ...idle(T, 7), x: 640, y: seat(SHIVA(0)), sit: true, flip: true, head: 8 - hold * 4, blink: T > 99 && T < 100.4, aN: [40, 70], aF: [36, 76] }} />
        <P look={PARVATI} pose={{ ...idle(T, 8), x: lerp(500, 440, step(T, 100.6, 101.6)), y: feet(PARVATI), head: 6, lean: 6 * reach, aN: [lerp(8, 55, reach), lerp(12, 12, reach)], aF: [lerp(-6, 40, hold), lerp(14, 90, hold)] }} />
        {blue > 0 && sparkle(T, 22, 17, 640, 1160, 180 * blue)}
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={14} col="#bfe6ff" /></Lay>
    </Stage>;
  } },
  // 15 — a few drops fall to earth: snakes, scorpions and poisonous plants take them (104.51 – 110.94)
  { a: 104.51, b: 110.94, draw: (T) => {
    const sn = step(T, 106.7, 107.4), sc = step(T, 107.5, 108.2), pl = step(T, 109.0, 109.7);
    const cam = { z: kf(T, [[104.51, 1.0], [106.4, 1.15], [110.94, 1.45]]), x: 540, y: kf(T, [[104.51, 1000], [106.4, 1200], [110.94, 1280]]) };
    const drops = [[300, 104.7], [540, 105.0], [780, 105.3]] as const;
    return <Stage T={T} cam={cam} seed={15} moon={[820, 300]}>
      <Lay cam={cam} T={T}>
        {drops.map(([x, t0], i) => { const f = step(T, t0, t0 + 1.0); return f < 1 ? <Drop key={i} x={x} y={lerp(-60, 1440, easeIn(f))} /> : <ellipse key={i} cx={x} cy={1452} rx={60} ry={10} fill="#3fd0a0" opacity={0.5 * (1 - step(T, t0 + 1, t0 + 2.4))} />; })}
        <g opacity={sn}><Snake x={330} y={1440 - sn * 20} s={2.0} t={T} /><Snake x={170} y={1450} s={1.4} t={T + 1} flip /></g>
        <g opacity={sc}><Scorpion x={590} y={1420} s={1.9} t={T} /></g>
        <g opacity={pl}>{[760, 880, 960].map((x, i) => <g key={i} transform={`translate(${x},1460) scale(${(0.6 + 0.4 * pl) * 1.25})`} filter="url(#pglow)">
          {[-40, -15, 10, 35].map((a) => <path key={a} transform={`rotate(${a + Math.sin(T * 2 + i) * 4})`} d="M -10 0 Q -16 -80 0 -150 Q 16 -80 10 0 Z" fill="#2f5a3a" stroke={C.ink} strokeWidth={2.4} />)}
          <circle cy={-150} r={9} fill="#7a3fa0" stroke={C.ink} strokeWidth={2} />
        </g>)}</g>
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={15} /></Lay>
    </Stage>;
  } },
  // 16 — the three worlds are saved; creation breathes again (110.94 – 116.38)
  { a: 110.94, b: 116.38, draw: (T) => {
    const heal = step(T, 111.4, 113.0), dawn = step(T, 112.0, 115.5), relief = step(T, 113.4, 114.4);
    const cam = { z: kf(T, [[110.94, 1.12], [116.38, 1.0]]), x: 540, y: 1000 };
    return <Stage T={T} cam={cam} seed={16} moon={null} tint={`rgba(200,140,60,${0.3 * dawn})`}>
      <Lay cam={cam} d={2.2} T={T}><g opacity={dawn}><Sun x={540} y={lerp(1300, 920, dawn)} r={80} t={T} /></g></Lay>
      <Lay cam={cam} d={1.3} T={T}><Lokas T={T} burn={[1 - heal, 1 - heal, 1 - heal]} y={560} /></Lay>
      <Lay cam={cam} T={T}>
        {DV.map((L, i) => <P key={i} look={L} pose={{ ...idle(T, 30 + i), x: 110 + i * 120, y: feet(L, S_DV), s: S_DV, head: 16 * relief, lean: -6 * relief, aN: [lerp(40, 150, relief), lerp(100, 10, relief)], aF: [36, 104] }} />)}
        {AS.map((L, i) => <P key={i} look={L} pose={{ ...idle(T, 40 + i), x: 970 - i * 120, y: feet(L, S_DV), s: S_DV, flip: true, head: 16 * relief, lean: -6 * relief, aN: [lerp(40, 150, relief), lerp(100, 10, relief)], aF: [36, 104] }} />)}
        {heal > 0 && sparkle(T, 30, 23, 540, 700, 380)}
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={16} /></Lay>
    </Stage>;
  } },
  // 17 — the one who held the world's poison in his throat: Neelkanth Mahadev. Curtain falls (116.38 – 128)
  { a: 116.38, b: 128.0, draw: (T) => {
    const om = step(T, 121.6, 122.6), glow = 0.7 + 0.3 * om, bow = step(T, 122.4, 123.4);
    const cam = { z: kf(T, [[116.38, 1.3], [121.6, 1.2], [126, 0.95]]), x: 540, y: kf(T, [[116.38, 900], [126, 1000]]) };
    return <Stage T={T} cam={cam} seed={17} moon={[830, 260]}>
      <Lay cam={cam} T={T}><Om x={560} y={760} s={1.35} o={om} /></Lay>
      <Lay cam={cam} T={T}>
        <ellipse cx={540} cy={900} rx={340} ry={700} fill="#bfe6ff" opacity={0.2} filter="url(#soft)" />
        <ellipse cx={538} cy={945} rx={90 + 40 * om} ry={70 + 30 * om} fill="#5fc8ff" opacity={0.4 * glow} filter="url(#soft)" />
        {ShivaStand(T, 540, { flip: false, head: 0, aF: [lerp(-6, 40, bow), lerp(14, 100, bow)] }, glow)}
        <g opacity={step(T, 116.4, 117.2)}><P look={PARVATI} pose={{ ...idle(T, 8), x: 800, y: feet(PARVATI), flip: true, aN: [40, 100], aF: [36, 104], head: -8 * bow }} /></g>
        {[DV[0], DV[1]].map((L, i) => <P key={i} look={L} pose={{ ...idle(T, 30 + i), x: 90 + i * 110, y: feet(L, S_DV), s: S_DV, head: -18 * bow, lean: 12 * bow, aN: [40, 100], aF: [36, 104] }} />)}
        {om > 0 && sparkle(T, 30, 29, 540, 700, 360)}
      </Lay>
      <Lay cam={cam} d={0.8} T={T}><Dust t={T} seed={17} /></Lay>
    </Stage>;
  } },
];

export const atmosFor = (T: number) => <Atmos t={T} />;
