// Cut-out marionette rig: flat illustrated parts with ink outlines, pinned at shoulder/elbow/hip/knee, hanging on strings.
// Every character faces +x (right) in its own drawing; `flip` mirrors it. Angles are degrees: arms/legs 0 = hanging straight
// down, positive = swung forward (toward the face); elbows/knees positive = bent (forearm forward, shin backward).
import React from "react";
import { C } from "./lib";

export type Pose = {
  x: number; y: number; s?: number; flip?: boolean;
  lean?: number; head?: number;
  aN?: [number, number]; aF?: [number, number]; // near arm / far arm: [shoulder, elbow]
  lN?: [number, number]; lF?: [number, number]; // near leg / far leg: [hip, knee]
  sit?: boolean; strings?: boolean; blink?: boolean; opacity?: number;
};

const dark = (hex: string, k = 0.72) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k);
  return `rgb(${r},${g},${b})`;
};
const SW = 3.2; // ink line width

/** a wooden limb segment from (0,0) down to (0,len), with a pin at the top joint and dot-trim bands */
const Seg: React.FC<{ len: number; w: number; w2?: number; fill: string; band?: string; pin?: boolean }> = ({ len, w, w2 = w * 0.82, fill, band, pin = true }) => (
  <g>
    <path d={`M ${-w / 2} 0 Q ${-w / 2} ${-w / 2} 0 ${-w / 2} Q ${w / 2} ${-w / 2} ${w / 2} 0 L ${w2 / 2} ${len} Q ${w2 / 2} ${len + w2 / 2} 0 ${len + w2 / 2} Q ${-w2 / 2} ${len + w2 / 2} ${-w2 / 2} ${len} Z`}
      fill={fill} stroke={C.ink} strokeWidth={SW} strokeLinejoin="round" />
    {/* wood-grain highlight */}
    <path d={`M ${-w * 0.18} ${w * 0.3} L ${-w2 * 0.18} ${len - w2 * 0.2}`} stroke="#fff" strokeOpacity={0.18} strokeWidth={w * 0.18} strokeLinecap="round" />
    {band && <g>
      <rect x={-w2 / 2 - 1} y={len * 0.78} width={w2 + 2} height={9} fill={band} stroke={C.ink} strokeWidth={2} />
      {[-0.25, 0, 0.25].map((k) => <circle key={k} cx={k * w2} cy={len * 0.78 + 4.5} r={1.8} fill={C.ink} />)}
    </g>}
    {pin && <g><circle r={w * 0.3} fill={dark(fill, 0.85)} stroke={C.ink} strokeWidth={2} /><circle r={w * 0.09} fill={C.ink} /></g>}
  </g>
);

const Hand: React.FC<{ fill: string; open?: boolean }> = ({ fill, open }) => (
  <g>
    {open
      ? <path d="M -9 0 L -10 22 L -6 34 L -2 22 L 1 36 L 4 22 L 8 34 L 9 20 L 14 26 L 10 6 Q 0 -4 -9 0 Z" fill={fill} stroke={C.ink} strokeWidth={2.4} strokeLinejoin="round" />
      : <path d="M -10 0 Q -13 16 -6 24 Q 4 30 11 20 L 15 12 Q 12 6 9 9 L 10 0 Q 0 -5 -10 0 Z" fill={fill} stroke={C.ink} strokeWidth={2.4} strokeLinejoin="round" />}
  </g>
);

const Foot: React.FC<{ fill: string }> = ({ fill }) => (
  <path d="M -11 -2 L -12 12 Q -12 18 -4 18 L 30 18 Q 34 12 26 8 L 10 2 L 10 -2 Z" fill={fill} stroke={C.ink} strokeWidth={2.4} strokeLinejoin="round" />
);

/** a string going straight up on screen from a point whose cumulative rotation is `ang` degrees */
const Str: React.FC<{ ang: number; on?: boolean }> = ({ ang, on }) => {
  if (!on) return null;
  const a = (ang * Math.PI) / 180, L = 3000;
  return <line x1={0} y1={0} x2={-Math.sin(a) * L} y2={-Math.cos(a) * L} stroke="#e9d9ad" strokeOpacity={0.38} strokeWidth={1.6} />;
};

export type Look = {
  skin: string; scale?: number; head: (p: { blink: boolean }) => React.ReactNode;
  torso: React.ReactNode; skirt: React.ReactNode; legCloth: string; band: string;
  arm?: number; leg?: number; torsoH?: number; heldN?: (A: number) => React.ReactNode; heldF?: (A: number) => React.ReactNode; openN?: boolean; openF?: boolean;
};

export const Puppet: React.FC<{ look: Look; pose: Pose }> = ({ look, pose }) => {
  const { x, y, s = 1, flip = false, lean = 0, head = 0, aN = [8, 10], aF = [-6, 12], lN = [4, 2], lF = [-4, 3], strings = true, blink = false, opacity = 1 } = pose;
  const sc = s * (look.scale ?? 1);
  const UA = (look.arm ?? 1) * 82, FA = (look.arm ?? 1) * 76, TH = (look.leg ?? 1) * 100, SH = (look.leg ?? 1) * 98, TOR = look.torsoH ?? 170;
  const fl = flip ? -1 : 1;
  void fl;
  const shoulder = { x: 6, y: -TOR + 18 };
  const arm = (a: [number, number], near: boolean) => {
    const sk = near ? look.skin : dark(look.skin);
    const held = near ? look.heldN : look.heldF;
    const open = near ? look.openN : look.openF;
    return (
      <g transform={`translate(${shoulder.x + (near ? 4 : -6)},${shoulder.y}) rotate(${-a[0]})`}>
        <Seg len={UA} w={26} fill={sk} band={look.band} />
        <g transform={`translate(0,${UA}) rotate(${-a[1]})`}>
          <Seg len={FA} w={22} w2={18} fill={sk} band={look.band} />
          <g transform={`translate(0,${FA + 4})`}>
            <Hand fill={sk} open={open} />
            {held && held(-(lean + a[0] + a[1]))}
            <Str ang={-(lean + a[0] + a[1])} on={strings} />
          </g>
        </g>
      </g>
    );
  };
  const leg = (l: [number, number], near: boolean) => {
    const sk = near ? look.skin : dark(look.skin);
    return (
      <g transform={`translate(${near ? 8 : -8},6) rotate(${-l[0]})`}>
        <Seg len={TH} w={34} w2={28} fill={near ? look.legCloth : dark(look.legCloth)} />
        <g transform={`translate(0,${TH}) rotate(${l[1]})`}>
          <Seg len={SH} w={22} w2={17} fill={sk} band={look.band} />
          <g transform={`translate(0,${SH + 6})`}><Foot fill={sk} /></g>
        </g>
      </g>
    );
  };
  // seated: thighs forward, shins down (cross-legged reads as folded legs)
  const legs = pose.sit ? { lN: [88, 158] as [number, number], lF: [82, 162] as [number, number] } : { lN, lF };
  return (
    <g transform={`translate(${x},${y}) scale(${sc * fl},${sc})`} opacity={opacity} filter="url(#pglow)">
      {leg(legs.lF, false)}
      <g transform={`rotate(${-lean})`}>
        {arm(aF, false)}
        {look.torso}
      </g>
      {leg(legs.lN, true)}
      <g transform={`rotate(${-lean})`}>{look.skirt}</g>
      <g transform={`rotate(${-lean})`}>
        <g transform={`translate(0,${-TOR + 4}) rotate(${-head})`}>
          {look.head({ blink })}
          <g transform="translate(0,-118)"><Str ang={-(lean + head)} on={strings} /></g>
        </g>
        {arm(aN, true)}
      </g>
    </g>
  );
};

// ------------------------------------------------------------------ shared drawing bits
const Dots: React.FC<{ pts: [number, number][]; r?: number; fill?: string }> = ({ pts, r = 2.4, fill = C.cream }) => (
  <g>{pts.map(([a, b], i) => <circle key={i} cx={a} cy={b} r={r} fill={fill} stroke={C.ink} strokeWidth={0.8} />)}</g>
);
const along = (x0: number, y0: number, x1: number, y1: number, n: number): [number, number][] =>
  Array.from({ length: n }, (_, i) => [x0 + ((x1 - x0) * (i + 0.5)) / n, y0 + ((y1 - y0) * (i + 0.5)) / n]);

/** folk-style profile face, neck at (0,0), looking right: big frontal almond eye, long nose, small lips */
const Face: React.FC<{ skin: string; blink: boolean; k?: number; brow?: string; lip?: string }> = ({ skin, blink, k = 1, brow = C.ink, lip = C.red }) => (
  <g transform={`scale(${k})`}>
    <rect x={-13} y={-24} width={26} height={30} fill={skin} stroke={C.ink} strokeWidth={SW} />
    <path d="M -34 -40 C -46 -74 -30 -112 4 -116 C 30 -118 44 -100 45 -82 L 46 -70 L 60 -52 Q 61 -48 56 -47 L 47 -46 L 50 -39 L 45 -35 L 47 -29 C 44 -18 34 -12 20 -12 C 2 -11 -16 -14 -26 -22 Z"
      fill={skin} stroke={C.ink} strokeWidth={SW} strokeLinejoin="round" />
    {/* ear + earring */}
    <ellipse cx={-6} cy={-64} rx={8} ry={12} fill={dark(skin, 0.86)} stroke={C.ink} strokeWidth={2.4} />
    <circle cx={-6} cy={-46} r={5} fill={C.gold} stroke={C.ink} strokeWidth={2} />
    {/* eye */}
    {blink
      ? <path d="M 16 -76 Q 28 -71 41 -76" stroke={C.ink} strokeWidth={3} fill="none" />
      : <g>
          <path d="M 15 -76 Q 28 -88 42 -76 Q 28 -68 15 -76 Z" fill={C.white} stroke={C.ink} strokeWidth={2.6} />
          <circle cx={31} cy={-77} r={4.6} fill={C.ink} />
          <circle cx={32.5} cy={-78.5} r={1.3} fill="#fff" />
        </g>}
    <path d="M 12 -88 Q 28 -98 46 -86" stroke={brow} strokeWidth={3.4} fill="none" strokeLinecap="round" />
    <path d="M 47 -38 L 53 -37" stroke={lip} strokeWidth={3} strokeLinecap="round" />
    <path d="M 46 -72 L 46 -60" stroke={C.ink} strokeWidth={1.4} strokeOpacity={0.5} />
  </g>
);

const tilak = <path d="M 30 -100 L 32 -112 M 36 -100 L 36 -113 M 33 -98 L 33 -104" stroke={C.red} strokeWidth={2.6} strokeLinecap="round" />;

/** bare-chest torso (pelvis at origin, shoulders at -TOR) with waist sash */
const chest = (skin: string, sash: string, TOR = 170, w = 1) => (
  <g transform={`scale(${w},1)`}>
    <path d={`M -36 ${-TOR + 12} Q 0 ${-TOR - 8} 42 ${-TOR + 14} Q 48 ${-TOR + 70} 30 -46 L -26 -46 Q -46 ${-TOR + 70} -36 ${-TOR + 12} Z`}
      fill={skin} stroke={C.ink} strokeWidth={SW} strokeLinejoin="round" />
    <path d={`M 0 ${-TOR + 50} Q 14 ${-TOR + 62} 26 ${-TOR + 52}`} stroke={C.ink} strokeOpacity={0.45} strokeWidth={2} fill="none" />
    <path d="M -30 -60 L 34 -60 L 36 -34 L -32 -34 Z" fill={sash} stroke={C.ink} strokeWidth={SW} />
    <Dots pts={along(-26, -47, 32, -47, 8)} r={2.2} />
  </g>
);

const necklace = (TOR: number, col = C.gold, n = 9) => (
  <g>
    <path d={`M -22 ${-TOR + 14} Q 6 ${-TOR + 62} 34 ${-TOR + 16}`} stroke={C.ink} strokeWidth={1.6} fill="none" />
    <Dots pts={Array.from({ length: n }, (_, i) => { const u = i / (n - 1); return [-22 + 56 * u, -TOR + 14 + 46 * Math.sin(Math.PI * u) * 0.95] as [number, number]; })} r={3.4} fill={col} />
  </g>
);

/** knee-length dhoti over the hips; covers the tops of both thighs */
const dhoti = (fill: string, border: string, len = 96) => (
  <g>
    <path d={`M -38 -40 L 42 -40 L 52 ${len} Q 6 ${len + 12} -44 ${len} Z`} fill={fill} stroke={C.ink} strokeWidth={SW} strokeLinejoin="round" />
    {/* front pleat fan */}
    <path d={`M 14 -36 L 4 ${len + 6} L 14 ${len + 8} L 22 ${len + 4} Z`} fill={dark(fill, 0.9)} stroke={C.ink} strokeWidth={2} strokeLinejoin="round" />
    <path d={`M -44 ${len - 12} Q 6 ${len} 52 ${len - 12} L 52 ${len} Q 6 ${len + 12} -44 ${len} Z`} fill={border} stroke={C.ink} strokeWidth={2} />
    <Dots pts={along(-38, len - 4, 46, len - 4, 9)} r={2} />
    <path d="M -38 -40 L 42 -40 L 42 -30 L -38 -30 Z" fill={border} stroke={C.ink} strokeWidth={2} />
  </g>
);

// ------------------------------------------------------------------ characters (original designs)
export const NACHIKETA: Look = {
  skin: C.skin, scale: 0.78, torsoH: 150, arm: 0.9, leg: 0.88, band: C.gold, legCloth: C.saffron,
  head: ({ blink }) => (
    <g transform="scale(1.18)">
      <Face skin={C.skin} blink={blink} />
      {/* black hair cap + shikha topknot */}
      <path d="M -36 -44 C -50 -84 -28 -120 6 -120 C 26 -120 38 -110 42 -98 Q 20 -104 2 -96 Q -14 -86 -16 -62 Q -26 -50 -36 -44 Z" fill="#1d130d" stroke={C.ink} strokeWidth={2.6} />
      <circle cx={-14} cy={-124} r={13} fill="#1d130d" stroke={C.ink} strokeWidth={2.4} />
      <circle cx={-14} cy={-124} r={4} fill={C.gold} />
      {tilak}
    </g>
  ),
  torso: <g>
    {chest(C.skin, C.red, 150, 0.92)}
    <path d="M -28 -136 L 30 -52" stroke={C.white} strokeWidth={3} />
    {necklace(150, C.cream, 7)}
  </g>,
  skirt: dhoti(C.saffron, C.red, 80),
};

export const RISHI: Look = {
  skin: "#c79058", scale: 1.0, torsoH: 175, band: C.ochre, legCloth: C.white,
  head: ({ blink }) => (
    <g>
      {/* tall jata bun behind */}
      <path d="M -40 -70 C -50 -150 -10 -190 12 -176 C 30 -166 28 -130 18 -108 Z" fill={C.white} stroke={C.ink} strokeWidth={2.8} />
      {[-150, -132, -114].map((yy) => <path key={yy} d={`M -34 ${yy + 30} Q -8 ${yy + 18} 22 ${yy + 22}`} stroke={C.ink} strokeOpacity={0.55} strokeWidth={2} fill="none" />)}
      <Face skin="#c79058" blink={blink} brow={C.white} />
      {/* white hair back */}
      <path d="M -36 -42 C -50 -80 -34 -116 0 -118 Q -10 -96 -14 -70 Q -22 -50 -36 -42 Z" fill={C.white} stroke={C.ink} strokeWidth={2.6} />
      {/* long pointed beard + moustache */}
      <path d="M 44 -44 Q 54 -34 46 -26 Q 40 10 18 52 Q 8 18 -22 -18 Q 0 -10 26 -16 Q 36 -26 44 -44 Z" fill={C.white} stroke={C.ink} strokeWidth={2.6} strokeLinejoin="round" />
      <path d="M 40 -42 Q 52 -46 58 -38" stroke={C.ink} strokeWidth={2} fill={C.white} />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${14 + i * 8} -6 Q ${14 + i * 6} 14 ${12 + i * 4} 30`} stroke={C.ink} strokeOpacity={0.4} strokeWidth={1.6} fill="none" />)}
      <path d="M 26 -100 L 44 -100 M 26 -106 L 44 -106 M 26 -112 L 42 -112" stroke={C.cream} strokeWidth={2.2} />
      <circle cx={35} cy={-103} r={3} fill={C.red} />
    </g>
  ),
  torso: <g>
    {chest("#c79058", C.ochre, 175)}
    {/* angavastram over the far shoulder */}
    <path d="M -38 -164 Q 4 -150 36 -60 L 14 -56 Q -10 -120 -40 -130 Z" fill={C.saffron} stroke={C.ink} strokeWidth={SW} strokeLinejoin="round" />
    <Dots pts={along(-36, -150, 28, -64, 7)} r={2} />
    {/* rudraksha mala */}
    {necklace(175, "#6b3a22", 11)}
  </g>,
  skirt: dhoti(C.white, C.ochre, 98),
};

const crown = (
  <g>
    <path d="M -34 -96 L -28 -150 L -14 -160 L -8 -196 L 6 -214 L 20 -196 L 26 -160 L 40 -150 L 46 -96 Z" fill={C.gold} stroke={C.ink} strokeWidth={2.8} strokeLinejoin="round" />
    {[-150, -172, -196].map((yy, i) => <path key={yy} d={`M ${-26 + i * 10} ${yy + 4} L ${38 - i * 10} ${yy + 4}`} stroke={C.ink} strokeWidth={2} />)}
    <Dots pts={along(-28, -122, 42, -122, 7)} r={3} fill={C.red} />
    <Dots pts={along(-14, -164, 30, -164, 4)} r={2.6} fill={C.teal} />
    <circle cx={6} cy={-206} r={6} fill={C.red} stroke={C.ink} strokeWidth={2} />
    <path d="M -36 -96 L 48 -96 L 48 -84 L -36 -84 Z" fill={C.deepRed} stroke={C.ink} strokeWidth={2.4} />
    <Dots pts={along(-32, -90, 46, -90, 8)} r={2} fill={C.gold} />
  </g>
);

const mace = (A: number) => (
  <g transform={`translate(0,14) rotate(${-A})`}>
    <rect x={-5} y={-190} width={10} height={230} rx={4} fill={C.gold} stroke={C.ink} strokeWidth={2.6} />
    <circle cx={0} cy={-210} r={30} fill={C.gold} stroke={C.ink} strokeWidth={2.8} />
    {[0, 60, 120].map((a) => <ellipse key={a} cx={0} cy={-210} rx={30} ry={9} transform={`rotate(${a} 0 -210)`} fill="none" stroke={C.ink} strokeWidth={1.6} />)}
    <circle cx={0} cy={-244} r={7} fill={C.red} stroke={C.ink} strokeWidth={2} />
  </g>
);

export const YAMA: Look = {
  skin: C.yamaSkin, scale: 1.22, torsoH: 185, band: C.gold, legCloth: C.red,
  head: ({ blink }) => (
    <g>
      <path d="M -40 -60 C -60 -40 -50 10 -30 20 L -10 -20 Z" fill="#1a1410" stroke={C.ink} strokeWidth={2.4} />
      <Face skin={C.yamaSkin} blink={blink} lip="#e0b070" brow="#120c08" />
      {crown}
      {/* curled moustache */}
      <path d="M 44 -44 Q 30 -40 22 -50 Q 14 -56 10 -48 Q 14 -38 26 -38 Q 38 -36 46 -40 Z" fill="#120c08" stroke={C.ink} strokeWidth={1.6} />
      {/* fierce eye ring */}
      <path d="M 13 -79 Q 28 -94 44 -78" stroke={C.red} strokeWidth={2.2} fill="none" />
      <circle cx={-6} cy={-44} r={8} fill={C.gold} stroke={C.ink} strokeWidth={2} />
    </g>
  ),
  torso: <g>
    {chest(C.yamaSkin, C.gold, 185, 1.12)}
    <path d="M -40 -176 Q 8 -160 40 -64 L 18 -60 Q -6 -130 -42 -142 Z" fill={C.green} stroke={C.ink} strokeWidth={SW} strokeLinejoin="round" />
    <Dots pts={along(-38, -162, 30, -68, 8)} r={2.2} fill={C.gold} />
    {necklace(185, C.gold, 11)}
    <path d="M -10 -150 L 6 -120 L 22 -150" stroke={C.ink} strokeWidth={2} fill={C.red} />
  </g>,
  skirt: dhoti(C.red, C.gold, 104),
  heldN: mace,
};

/** a thin old cow cut-out; origin at the belly, faces right; legs swing at four pins */
export const Cow: React.FC<{ x: number; y: number; s?: number; t: number; walk?: number; flip?: boolean }> = ({ x, y, s = 1, t, walk = 1, flip }) => {
  const sw = (k: number) => Math.sin(t * 4 * walk + k) * 14 * walk;
  const legP = (lx: number, k: number, near: boolean) => (
    <g transform={`translate(${lx},12) rotate(${sw(k)})`}>
      <Seg len={70} w={16} w2={11} fill={near ? "#d8cbb0" : "#a99d84"} />
      <rect x={-7} y={70} width={14} height={10} fill="#2a1d14" />
    </g>
  );
  return (
    <g transform={`translate(${x},${y + Math.abs(Math.sin(t * 4 * walk)) * -4}) scale(${(flip ? -1 : 1) * s},${s})`} filter="url(#pglow)">
      {legP(-60, 0, false)}{legP(48, Math.PI, false)}
      {/* bony body */}
      <path d="M -88 -30 Q -70 -52 -20 -46 Q 30 -56 70 -40 Q 86 -20 74 14 Q 20 30 -60 22 Q -96 8 -88 -30 Z" fill="#e2d6bc" stroke={C.ink} strokeWidth={SW} strokeLinejoin="round" />
      {[-30, -14, 2, 18].map((rx) => <path key={rx} d={`M ${rx} -36 Q ${rx + 6} -10 ${rx} 14`} stroke={C.ink} strokeOpacity={0.45} strokeWidth={2} fill="none" />)}
      <circle cx={-40} cy={-8} r={14} fill="#b59a74" stroke={C.ink} strokeWidth={2} />
      <path d="M -88 -24 Q -110 -4 -104 30" stroke={C.ink} strokeWidth={3} fill="none" />
      {/* head */}
      <g transform={`translate(72,-34) rotate(${20 + Math.sin(t * 2) * 6})`}>
        <path d="M 0 -10 Q 30 -20 52 6 Q 58 22 44 26 Q 22 24 4 12 Z" fill="#e2d6bc" stroke={C.ink} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M 8 -12 Q 2 -34 14 -42 M 18 -14 Q 24 -36 36 -38" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M 22 0 Q 28 -4 34 0" stroke={C.ink} strokeWidth={2.4} fill="none" />
      </g>
      {legP(-44, Math.PI, true)}{legP(60, 0, true)}
    </g>
  );
};

export const APSARA = (sari: string, trim: string): Look => ({
  skin: "#d39a66", scale: 0.92, torsoH: 160, band: C.gold, legCloth: sari, openN: true, openF: true,
  head: ({ blink }) => (
    <g>
      <Face skin="#d39a66" blink={blink} lip={C.deepRed} />
      <path d="M -36 -44 C -50 -84 -30 -120 6 -120 C 28 -121 40 -110 44 -96 Q 18 -102 0 -94 Q -14 -84 -16 -60 Q -26 -50 -36 -44 Z" fill="#1d130d" stroke={C.ink} strokeWidth={2.6} />
      <circle cx={-34} cy={-96} r={20} fill="#1d130d" stroke={C.ink} strokeWidth={2.4} />
      <Dots pts={along(-48, -110, -20, -82, 5)} r={3.4} fill={C.cream} />
      <path d="M 8 -114 L 34 -104" stroke={C.gold} strokeWidth={4} />
      <circle cx={36} cy={-98} r={3} fill={C.red} />
    </g>
  ),
  torso: <g>
    <path d="M -34 -148 Q 0 -166 40 -146 Q 44 -100 28 -46 L -24 -46 Q -42 -100 -34 -148 Z" fill="#d39a66" stroke={C.ink} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M -34 -146 Q 0 -160 40 -144 L 38 -112 Q 0 -100 -36 -114 Z" fill={trim} stroke={C.ink} strokeWidth={SW} />
    <path d="M -38 -150 Q 10 -140 34 -46 L 12 -46 Q -8 -110 -40 -118 Z" fill={sari} stroke={C.ink} strokeWidth={SW} strokeLinejoin="round" />
    <Dots pts={along(-34, -140, 24, -52, 7)} r={2} fill={C.gold} />
  </g>,
  skirt: <g>
    <path d="M -40 -50 L 44 -50 L 74 196 Q 6 214 -64 196 Z" fill={sari} stroke={C.ink} strokeWidth={SW} strokeLinejoin="round" />
    {[-30, -6, 18, 42].map((xx) => <path key={xx} d={`M ${xx * 0.5} -44 L ${xx * 1.4} 196`} stroke={C.ink} strokeOpacity={0.35} strokeWidth={2} />)}
    <path d="M -64 180 Q 6 198 74 180 L 74 196 Q 6 214 -64 196 Z" fill={trim} stroke={C.ink} strokeWidth={2} />
    <Dots pts={along(-58, 190, 70, 190, 10)} r={2.2} fill={C.gold} />
  </g>,
});

export { Dots, along, dark };

// ------------------------------------------------------------------ Neelkanth cast (original designs)
const tigerDhoti = (len = 104) => (
  <g>
    {dhoti("#d98a2e", C.deepRed, len)}
    {[-24, -2, 20, 38].map((xx, i) => <path key={xx} d={`M ${xx} ${-24 + i * 6} q 8 18 0 34 M ${xx - 6} ${44 + i * 4} q 8 14 2 26`} stroke="#3a1e0e" strokeWidth={4} fill="none" strokeLinecap="round" />)}
  </g>
);

const trishul = (A: number) => (
  <g transform={`translate(0,14) rotate(${-A})`}>
    <rect x={-5} y={-230} width={10} height={290} rx={4} fill="#c9c2b0" stroke={C.ink} strokeWidth={2.6} />
    <path d="M -40 -250 Q -40 -214 0 -214 Q 40 -214 40 -250 L 30 -246 Q 28 -226 6 -226 L 6 -300 L 0 -316 L -6 -300 L -6 -226 Q -28 -226 -30 -246 Z"
      fill="#e6dfcc" stroke={C.ink} strokeWidth={2.6} strokeLinejoin="round" />
    <path d="M -40 -250 L -46 -270 L -32 -252 Z M 40 -250 L 46 -270 L 32 -252 Z" fill="#e6dfcc" stroke={C.ink} strokeWidth={2} />
    {/* damaru tied below the prongs */}
    <g transform="translate(12,-196)">
      <path d="M -12 -14 L 12 -14 L 2 0 L 12 14 L -12 14 L -2 0 Z" fill={C.red} stroke={C.ink} strokeWidth={2} />
      <path d="M 12 -2 q 14 10 6 26" stroke={C.gold} strokeWidth={2} fill="none" />
    </g>
  </g>
);

/** Shiva: blue skin, jata with crescent moon, third eye + tripundra, serpent at the neck, tiger-skin dhoti, trishul.
 *  throat 0..1 = how blue/glowing the throat is (Neelkanth). */
export const SHIVA = (throat = 0, trident = true): Look => ({
  skin: "#5b86b8", scale: 1.25, torsoH: 185, band: C.gold, legCloth: "#d98a2e",
  head: ({ blink }) => (
    <g>
      {/* jata hair falling behind */}
      <path d="M -36 -50 C -64 -20 -60 40 -40 70 L -22 30 L -26 -20 Z" fill="#3a2414" stroke={C.ink} strokeWidth={2.4} />
      <Face skin="#5b86b8" blink={blink} lip="#8e2a22" brow="#1a120c" />
      {/* tall jata bun with rudraksha bands */}
      <path d="M -34 -96 C -40 -150 -20 -206 4 -210 C 26 -206 34 -150 28 -100 Z" fill="#3a2414" stroke={C.ink} strokeWidth={2.8} />
      {[-120, -150, -178].map((yy) => <path key={yy} d={`M -30 ${yy} Q 0 ${yy - 10} 28 ${yy}`} stroke={C.gold} strokeWidth={3.4} fill="none" />)}
      <path d="M -36 -42 C -50 -80 -34 -116 0 -118 Q -10 -96 -14 -70 Q -22 -50 -36 -42 Z" fill="#3a2414" stroke={C.ink} strokeWidth={2.4} />
      {/* crescent moon in the hair */}
      <path d="M 22 -196 A 22 22 0 1 0 40 -160 A 16 16 0 1 1 22 -196 Z" fill="#f3dfa0" stroke={C.ink} strokeWidth={2} filter="url(#pglow)" />
      {/* tripundra + third eye */}
      <path d="M 18 -98 L 44 -98 M 18 -104 L 44 -104 M 18 -92 L 42 -92" stroke="#efe6d2" strokeWidth={2.6} strokeLinecap="round" />
      <path d="M 33 -112 Q 37 -104 33 -96 Q 29 -104 33 -112 Z" fill={C.red} stroke={C.ink} strokeWidth={1.4} />
      {/* earring */}
      <circle cx={-6} cy={-44} r={8} fill={C.gold} stroke={C.ink} strokeWidth={2} />
      {/* the blue throat */}
      {throat > 0.01 && <g>
        <ellipse cx={2} cy={-6} rx={30 * (0.8 + throat * 0.5)} ry={22 * (0.8 + throat * 0.5)} fill="#5fc8ff" opacity={0.35 * throat} filter="url(#soft)" />
        <rect x={-13} y={-24} width={26} height={30} fill="#1f4fa8" opacity={throat} stroke={C.ink} strokeWidth={2.4} />
        <path d="M -9 -12 Q 0 -6 9 -12" stroke="#9fe0ff" strokeWidth={2} fill="none" opacity={throat} />
      </g>}
    </g>
  ),
  torso: <g>
    {chest("#5b86b8", "#d98a2e", 185, 1.12)}
    {necklace(185, "#6b3a22", 12)}
    {/* serpent around the neck */}
    <path d="M -40 -176 Q -10 -150 22 -160 Q 46 -168 40 -186 Q 36 -200 50 -204" stroke="#2f6b3a" strokeWidth={12} fill="none" strokeLinecap="round" />
    <path d="M -40 -176 Q -10 -150 22 -160 Q 46 -168 40 -186 Q 36 -200 50 -204" stroke={C.ink} strokeWidth={1.6} fill="none" strokeDasharray="3 7" />
    <ellipse cx={54} cy={-208} rx={11} ry={8} fill="#2f6b3a" stroke={C.ink} strokeWidth={2} />
    <circle cx={57} cy={-210} r={1.8} fill={C.gold} />
  </g>,
  skirt: tigerDhoti(104),
  heldN: trident ? trishul : undefined,
});

/** Parvati: crowned goddess in a red sari with gold trim */
export const PARVATI: Look = (() => {
  const base = APSARA(C.red, C.gold);
  return {
    ...base, scale: 1.0,
    head: ({ blink }) => (
      <g>
        {base.head({ blink })}
        <path d="M -24 -112 L -18 -150 L -6 -140 L 4 -166 L 14 -140 L 26 -150 L 32 -112 Z" fill={C.gold} stroke={C.ink} strokeWidth={2.4} strokeLinejoin="round" />
        <Dots pts={along(-20, -122, 30, -122, 5)} r={2.6} fill={C.red} />
        <circle cx={34} cy={-90} r={3.2} fill={C.red} />
      </g>
    ),
  };
})();

/** a deva: golden-skinned god with a small crown and yellow dhoti */
export const DEVA = (skin = "#e6c08a", cloth = C.gold): Look => ({
  skin, scale: 0.95, torsoH: 168, band: C.red, legCloth: cloth,
  head: ({ blink }) => (
    <g>
      <Face skin={skin} blink={blink} />
      <path d="M -36 -44 C -50 -84 -30 -118 4 -118 Q -12 -96 -16 -66 Q -26 -50 -36 -44 Z" fill="#1d130d" stroke={C.ink} strokeWidth={2.4} />
      <path d="M -30 -96 L -22 -140 L 0 -164 L 22 -140 L 34 -96 Z" fill={C.gold} stroke={C.ink} strokeWidth={2.6} strokeLinejoin="round" />
      <Dots pts={along(-24, -110, 30, -110, 5)} r={3} fill={C.red} />
      <circle cx={-6} cy={-44} r={6} fill={C.gold} stroke={C.ink} strokeWidth={2} />
    </g>
  ),
  torso: <g>{chest(skin, C.red, 168)}{necklace(168, C.gold, 9)}</g>,
  skirt: dhoti(cloth, C.red, 96),
});

/** an asura: dark skin, wild hair, fangs, heavy brows, horned band */
export const ASURA = (skin = "#6a4b5e", cloth = "#3f6b4a"): Look => ({
  skin, scale: 1.0, torsoH: 175, band: C.gold, legCloth: cloth,
  head: ({ blink }) => (
    <g>
      <path d="M -40 -40 C -70 -70 -60 -130 -20 -132 C 0 -150 30 -140 40 -118 L 30 -100 Q 0 -106 -14 -90 Q -24 -60 -40 -40 Z" fill="#1a1010" stroke={C.ink} strokeWidth={2.6} />
      <Face skin={skin} blink={blink} brow="#120c08" lip="#efe6d2" />
      <path d="M 44 -36 L 46 -26 L 40 -34 Z" fill="#efe6d2" stroke={C.ink} strokeWidth={1.4} />
      <path d="M 12 -90 L 46 -80" stroke="#120c08" strokeWidth={6} strokeLinecap="round" />
      <path d="M 13 -79 Q 28 -94 44 -78" stroke={C.red} strokeWidth={2.4} fill="none" />
      <path d="M -10 -118 Q -30 -150 -18 -170 Q -10 -146 4 -124 Z M 20 -122 Q 30 -156 50 -166 Q 40 -140 32 -118 Z" fill="#e6dfcc" stroke={C.ink} strokeWidth={2.4} />
      <circle cx={-6} cy={-44} r={7} fill={C.gold} stroke={C.ink} strokeWidth={2} />
    </g>
  ),
  torso: <g>{chest(skin, C.deepRed, 175, 1.08)}{necklace(175, "#c9c2b0", 9)}</g>,
  skirt: dhoti(cloth, C.deepRed, 100),
});
