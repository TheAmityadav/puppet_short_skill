// Flat cut-out scenery and props for the Nachiketa short (folk-mural style, ink outlines, dot trims).
import React from "react";
import { C, rand } from "./lib";
import { Dots, along } from "./Puppet";

const SW = 3.2;

/** fire tongues (flat layered flames), base at (0,0) */
export const Flames: React.FC<{ t: number; s?: number; hot?: number; col?: [string, string, string] }> = ({ t, s = 1, hot = 1, col = ["#c4432f", "#e8892b", "#f6d27a"] }) => (
  <g transform={`scale(${s})`}>
    <ellipse cx={0} cy={-90} rx={150 * hot} ry={170 * hot} fill="#ffb347" opacity={0.25} filter="url(#soft)" />
    {col.map((c, k) => (
      <g key={k} transform={`scale(${1 - k * 0.28})`}>
        {[-2, -1, 0, 1, 2].map((i) => {
          const h = (110 + 60 * Math.sin(t * (6 + i) + i * 2 + k)) * hot * (1 - Math.abs(i) * 0.18);
          const x = i * 30, sw = Math.sin(t * 5 + i + k) * 10;
          return <path key={i} d={`M ${x - 26} 0 Q ${x - 22} ${-h * 0.5} ${x + sw} ${-h} Q ${x + 22} ${-h * 0.5} ${x + 26} 0 Z`} fill={c} stroke={k === 0 ? C.ink : "none"} strokeWidth={2.4} />;
        })}
      </g>
    ))}
  </g>
);

/** square havan kund (fire altar) with stepped brick rim */
export const HavanKund: React.FC<{ x: number; y: number; t: number; s?: number; hot?: number }> = ({ x, y, t, s = 1, hot = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <g transform="translate(0,-40)"><Flames t={t} hot={hot} /></g>
    <path d="M -140 -40 L 140 -40 L 120 20 L -120 20 Z" fill={C.deepRed} stroke={C.ink} strokeWidth={SW} />
    <path d="M -160 20 L 160 20 L 150 70 L -150 70 Z" fill={C.red} stroke={C.ink} strokeWidth={SW} />
    {[-110, -55, 0, 55, 110].map((xx) => <rect key={xx} x={xx - 22} y={-30} width={44} height={40} fill="none" stroke={C.ink} strokeOpacity={0.4} strokeWidth={2} />)}
    <Dots pts={along(-150, 45, 150, 45, 12)} r={3} fill={C.gold} />
  </g>
);

/** gate of Yama's palace: pillars, closed doors, buffalo-horn crest, two torches */
export const Gate: React.FC<{ x: number; y: number; t: number; s?: number; open?: number }> = ({ x, y, t, s = 1, open = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#pglow)">
    {/* arch */}
    <path d="M -330 0 L -330 -620 Q -330 -900 0 -960 Q 330 -900 330 -620 L 330 0 Z" fill="#2b2230" stroke={C.ink} strokeWidth={4} />
    <path d="M -300 0 L -300 -610 Q -300 -860 0 -915 Q 300 -860 300 -610 L 300 0" fill="none" stroke={C.gold} strokeWidth={5} opacity={0.8} />
    <Dots pts={Array.from({ length: 21 }, (_, i) => { const a = Math.PI * (i / 20); return [-Math.cos(a) * 300, -610 - Math.sin(a) * 290] as [number, number]; })} r={5} fill={C.gold} />
    {/* doors */}
    {[-1, 1].map((sd) => (
      <g key={sd} transform={`translate(${sd * 250},0) scale(${1 - open * 0.8},1) translate(${-sd * 250},0)`}>
        <rect x={sd < 0 ? -250 : 0} y={-600} width={250} height={600} fill="#4a2a1c" stroke={C.ink} strokeWidth={4} />
        {[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={(sd < 0 ? -210 : 40) + c * 85} cy={-520 + r * 140} r={9} fill={C.gold} stroke={C.ink} strokeWidth={2} />))}
        <rect x={sd < 0 ? -250 : 0} y={-600} width={250} height={600} fill="none" stroke={C.gold} strokeWidth={3} strokeOpacity={0.5} transform="translate(0,0)" />
      </g>
    ))}
    {/* buffalo-horn crest */}
    <g transform="translate(0,-720)">
      <path d="M -60 0 Q -200 -40 -190 -150 Q -150 -70 -40 -50 Z M 60 0 Q 200 -40 190 -150 Q 150 -70 40 -50 Z" fill={C.cream} stroke={C.ink} strokeWidth={3} />
      <path d="M -55 -60 Q 0 -110 55 -60 L 40 40 Q 0 70 -40 40 Z" fill="#3a3a4a" stroke={C.ink} strokeWidth={3} />
      <circle cx={-22} cy={-20} r={9} fill={C.red} /><circle cx={22} cy={-20} r={9} fill={C.red} />
    </g>
    {/* torches */}
    {[-420, 420].map((tx, i) => (
      <g key={tx} transform={`translate(${tx},-380)`}>
        <rect x={-10} y={0} width={20} height={380} fill={C.wood} stroke={C.ink} strokeWidth={3} />
        <path d="M -36 0 L 36 0 L 24 30 L -24 30 Z" fill={C.gold} stroke={C.ink} strokeWidth={3} />
        <g transform="scale(0.45)"><Flames t={t + i} /></g>
      </g>
    ))}
  </g>
);

/** misty river: flat stylised wave rows */
export const River: React.FC<{ y: number; t: number; col?: string; rows?: number }> = ({ y, t, col = "#2d4a5c", rows = 4 }) => (
  <g>
    {Array.from({ length: rows }, (_, r) => {
      const yy = y + r * 70, ph = t * (0.6 + r * 0.25) * 60;
      const d = `M -200 ${yy} ` + Array.from({ length: 16 }, (_, i) => `q 45 -38 90 0`).join(" ") + ` L 1300 2000 L -200 2000 Z`;
      return <g key={r} transform={`translate(${-(ph % 90)},0)`}>
        <path d={d} fill={r % 2 ? col : "#365a6e"} stroke={C.ink} strokeWidth={2.6} />
        <Dots pts={Array.from({ length: 16 }, (_, i) => [-155 + i * 90, yy - 14] as [number, number])} r={2.6} fill="#9cc7c9" />
      </g>;
    })}
  </g>
);

/** folk tree of life: trunk + round canopy of dotted leaf clusters */
export const Tree: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#pglow)">
    <path d="M -40 0 Q -20 -200 -30 -380 L 30 -380 Q 20 -200 50 0 Z" fill={C.wood} stroke={C.ink} strokeWidth={SW} />
    {Array.from({ length: 13 }, (_, i) => {
      const a = (i / 13) * Math.PI * 2, r = i % 2 ? 190 : 120;
      const cx = Math.cos(a) * r, cy = -470 + Math.sin(a) * r * 0.8 + Math.sin(t + i) * 3;
      return <g key={i}>
        <circle cx={cx} cy={cy} r={78} fill={i % 3 ? C.green : "#4c8a3c"} stroke={C.ink} strokeWidth={SW} />
        <Dots pts={Array.from({ length: 5 }, (_, k) => [cx + Math.cos(k * 1.3 + i) * 40, cy + Math.sin(k * 1.3 + i) * 40] as [number, number])} r={4} fill={k(i)} />
      </g>;
    })}
  </g>
);
const k = (i: number) => (i % 2 ? C.gold : C.cream);

/** gold coin */
export const Coin: React.FC<{ x: number; y: number; r?: number; rot?: number }> = ({ x, y, r = 22, rot = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${Math.max(0.15, Math.abs(Math.cos(rot)))},1)`}>
    <circle r={r} fill={C.gold} stroke={C.ink} strokeWidth={2.4} />
    <circle r={r * 0.6} fill="none" stroke={C.ink} strokeWidth={1.4} strokeOpacity={0.6} />
  </g>
);

/** pot overflowing with gold */
export const GoldPot: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#pglow)">
    {Array.from({ length: 9 }, (_, i) => <Coin key={i} x={-60 + (i % 5) * 30} y={-130 - Math.floor(i / 5) * 22 - (i % 2) * 8} r={20} />)}
    <path d="M -90 -110 Q -130 -20 -60 20 L 60 20 Q 130 -20 90 -110 Z" fill={C.ochre} stroke={C.ink} strokeWidth={SW} />
    <path d="M -96 -120 L 96 -120 L 90 -100 L -90 -100 Z" fill={C.deepRed} stroke={C.ink} strokeWidth={SW} />
    <Dots pts={along(-100, -50, 100, -50, 9)} r={4} fill={C.red} />
  </g>
);

/** small palace cut-out (a kingdom), hangs from strings */
export const Palace: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#pglow)">
    {[-150, 150].map((xx) => <line key={xx} x1={xx} y1={-300} x2={xx} y2={-2400} stroke="#e9d9ad" strokeOpacity={0.35} strokeWidth={1.6} />)}
    <rect x={-200} y={-160} width={400} height={160} fill={C.cream} stroke={C.ink} strokeWidth={SW} />
    {[-140, -70, 0, 70, 140].map((xx) => <path key={xx} d={`M ${xx - 22} 0 L ${xx - 22} -80 Q ${xx} -110 ${xx + 22} -80 L ${xx + 22} 0 Z`} fill={C.deepRed} stroke={C.ink} strokeWidth={2.4} />)}
    {[-150, 0, 150].map((xx, i) => (
      <g key={xx} transform={`translate(${xx},-160)`}>
        <path d={`M -60 0 Q -60 ${-90 - i % 2 * 40} 0 ${-140 - (i === 1 ? 60 : 0)} Q 60 ${-90 - i % 2 * 40} 60 0 Z`} fill={C.gold} stroke={C.ink} strokeWidth={SW} />
        <line x1={0} y1={-140 - (i === 1 ? 60 : 0)} x2={0} y2={-180 - (i === 1 ? 60 : 0)} stroke={C.ink} strokeWidth={3} />
        <path d={`M 0 ${-180 - (i === 1 ? 60 : 0)} l 30 10 l -30 10 Z`} fill={C.red} stroke={C.ink} strokeWidth={2} />
      </g>
    ))}
    <Dots pts={along(-200, -150, 200, -150, 14)} r={3.4} fill={C.red} />
  </g>
);

/** stylised cloud bank */
export const Cloud: React.FC<{ x: number; y: number; s?: number; col?: string }> = ({ x, y, s = 1, col = "#cfc3a6" }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M -260 40 Q -270 -40 -190 -40 Q -170 -110 -90 -90 Q -40 -150 30 -110 Q 100 -150 150 -80 Q 240 -90 250 -10 Q 290 30 250 40 Z" fill={col} stroke={C.ink} strokeWidth={SW} />
    {[-150, -40, 70, 170].map((xx) => <path key={xx} d={`M ${xx - 40} 10 Q ${xx} -30 ${xx + 40} 10`} fill="none" stroke={C.ink} strokeOpacity={0.4} strokeWidth={2.4} />)}
  </g>
);

/** palm-leaf manuscript; `open` 0..1 unrolls it from the centre */
export const Manuscript: React.FC<{ x: number; y: number; open: number; text: string }> = ({ x, y, open, text }) => {
  const w = 40 + 720 * open;
  return (
    <g transform={`translate(${x},${y})`} filter="url(#pglow)">
      {[-70, 0, 70].map((dy, i) => (
        <g key={dy} transform={`translate(0,${dy})`}>
          <rect x={-w / 2} y={-28} width={w} height={56} rx={26} fill={i === 1 ? "#e9cf8f" : "#dcbd78"} stroke={C.ink} strokeWidth={SW} />
          <circle cx={-w * 0.3} cy={0} r={6} fill={C.ink} opacity={open} /><circle cx={w * 0.3} cy={0} r={6} fill={C.ink} opacity={open} />
          {i !== 1 && open > 0.3 && Array.from({ length: 8 }, (_, j) => <line key={j} x1={-w * 0.22 + j * w * 0.06} y1={-8} x2={-w * 0.22 + j * w * 0.06 + w * 0.04} y2={-8} stroke="#6b4423" strokeWidth={3} opacity={(open - 0.3) * 1.4} />)}
        </g>
      ))}
      <line x1={-w * 0.3} y1={-140} x2={-w * 0.3} y2={140} stroke="#7a2a1a" strokeWidth={4} opacity={open} />
      <line x1={w * 0.3} y1={-140} x2={w * 0.3} y2={140} stroke="#7a2a1a" strokeWidth={4} opacity={open} />
      <text x={0} y={14} textAnchor="middle" fontFamily="Tiro" fontSize={46} fill="#4a1c0c" opacity={Math.max(0, open * 1.6 - 0.6)}>{text}</text>
    </g>
  );
};

/** heavenly sun disc with flat rays */
export const Sun: React.FC<{ x: number; y: number; r?: number; t: number; col?: string }> = ({ x, y, r = 70, t, col = C.gold }) => (
  <g transform={`translate(${x},${y}) rotate(${t * 8})`} filter="url(#pglow)">
    {Array.from({ length: 14 }, (_, i) => <path key={i} transform={`rotate(${(i / 14) * 360})`} d={`M -12 ${-r} L 0 ${-r - 40} L 12 ${-r} Z`} fill={C.saffron} stroke={C.ink} strokeWidth={2.4} />)}
    <circle r={r} fill={col} stroke={C.ink} strokeWidth={3} />
    <circle r={r * 0.65} fill="none" stroke={C.ink} strokeOpacity={0.5} strokeWidth={2} />
  </g>
);

/** god's face peeking (crowned head only) */
export const PeekGod: React.FC<{ x: number; y: number; skin: string; s?: number; flip?: boolean }> = ({ x, y, skin, s = 1, flip }) => (
  <g transform={`translate(${x},${y}) scale(${(flip ? -1 : 1) * s},${s})`} filter="url(#pglow)">
    <path d="M -34 -40 C -46 -74 -30 -112 4 -116 C 30 -118 44 -100 45 -82 L 46 -70 L 60 -52 Q 61 -48 56 -47 L 47 -46 L 50 -39 L 45 -35 L 47 -29 C 44 -18 34 -12 20 -12 C 2 -11 -16 -14 -26 -22 Z" fill={skin} stroke={C.ink} strokeWidth={3} />
    <path d="M 15 -76 Q 28 -88 42 -76 Q 28 -68 15 -76 Z" fill={C.white} stroke={C.ink} strokeWidth={2.4} />
    <circle cx={33} cy={-77} r={4.4} fill={C.ink} />
    <path d="M -30 -96 L -22 -150 L 0 -176 L 22 -150 L 36 -96 Z" fill={C.gold} stroke={C.ink} strokeWidth={2.6} />
    <Dots pts={along(-26, -110, 32, -110, 5)} r={3} fill={C.red} />
  </g>
);

export const sparkle = (t: number, n: number, seed: number, cx: number, cy: number, rad: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = rand(i + seed) * Math.PI * 2 + t * (0.3 + rand(i) * 0.5), r = rad * (0.3 + rand(i * 3 + seed) * 0.7);
    return <circle key={i} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r * 1.2 - ((t * 40 * (0.5 + rand(i))) % 200)} r={2 + rand(i * 5) * 4}
      fill="#ffe7a0" opacity={0.3 + 0.6 * Math.abs(Math.sin(t * 2 + i))} />;
  });

// ------------------------------------------------------------------ Neelkanth props
/** Kshir Sagar: milky ocean bands (cream waves with dot foam); `churn` speeds and swirls it */
export const MilkOcean: React.FC<{ y: number; t: number; rows?: number; churn?: number; tint?: string }> = ({ y, t, rows = 3, churn = 0, tint }) => (
  <g>
    {Array.from({ length: rows }, (_, r) => {
      const yy = y + r * 80, ph = t * (0.5 + r * 0.2 + churn * 1.5) * 60 * (r % 2 ? -1 : 1);
      const amp = 34 + churn * 18;
      const d = `M -300 ${yy} ` + Array.from({ length: 20 }, () => `q 45 ${-amp} 90 0`).join(" ") + ` L 1500 2400 L -300 2400 Z`;
      return <g key={r} transform={`translate(${((ph % 90) + 90) % 90 - 90},0)`}>
        <path d={d} fill={tint ?? (r % 2 ? "#e9dfc6" : "#f3ead4")} stroke={C.ink} strokeWidth={2.6} />
        <Dots pts={Array.from({ length: 20 }, (_, i) => [-255 + i * 90, yy - amp * 0.4] as [number, number])} r={2.6} fill="#ffffff" />
      </g>;
    })}
  </g>
);

/** Mount Mandara: tall rounded cone with trees and ridges; `rot` = churn phase (stripes slide sideways) */
export const Mandara: React.FC<{ x: number; y: number; s?: number; rot?: number; tilt?: number }> = ({ x, y, s = 1, rot = 0, tilt = 0 }) => {
  const id = `mclip${Math.round(x)}${Math.round(y)}`;
  const body = "M -170 0 Q -150 -420 -40 -760 Q 0 -820 40 -760 Q 150 -420 170 0 Z";
  return (
    <g transform={`translate(${x},${y}) rotate(${tilt}) scale(${s})`} filter="url(#pglow)">
      <clipPath id={id}><path d={body} /></clipPath>
      <path d={body} fill="#8a6a4a" stroke={C.ink} strokeWidth={4} />
      <g clipPath={`url(#${id})`}>
        {Array.from({ length: 12 }, (_, i) => {
          const xx = (((i * 70 + rot * 120) % 840) + 840) % 840 - 420;
          return <g key={i}>
            <path d={`M ${xx} 40 L ${xx + 40} -840`} stroke="#6e5238" strokeWidth={22} />
            <circle cx={xx + 20} cy={-200 - (i % 4) * 130} r={26} fill={i % 2 ? C.green : "#4c8a3c"} stroke={C.ink} strokeWidth={2.4} />
          </g>;
        })}
      </g>
      <path d="M -40 -760 Q 0 -820 40 -760 Q 20 -730 0 -748 Q -20 -730 -40 -760 Z" fill="#efe6d2" stroke={C.ink} strokeWidth={2.4} />
    </g>
  );
};

/** Vasuki wrapped round the mountain: coil bands across the mountain + head; `pull` shifts the scale pattern */
export const VasukiCoils: React.FC<{ x: number; y: number; s?: number; pull?: number }> = ({ x, y, s = 1, pull = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {[-520, -400, -280].map((yy, i) => {
      const w = 120 + (yy + 760) * 0.14;
      return <g key={yy}>
        <path d={`M ${-w - 40} ${yy + 30} Q 0 ${yy + 80} ${w + 40} ${yy + 30}`} stroke="#2f6b3a" strokeWidth={36} fill="none" strokeLinecap="round" />
        <path d={`M ${-w - 40} ${yy + 30} Q 0 ${yy + 80} ${w + 40} ${yy + 30}`} stroke="#d9c86a" strokeWidth={6} fill="none" strokeDasharray="10 16" strokeDashoffset={pull * 60 + i * 9} />
        <path d={`M ${-w - 40} ${yy + 30} Q 0 ${yy + 80} ${w + 40} ${yy + 30}`} stroke={C.ink} strokeWidth={2.6} fill="none" opacity={0.6} />
      </g>;
    })}
  </g>
);

/** Vasuki as a straight horizontal rope from x0 to x1 at y, sliding by `pull`; optional hooded head at x0 */
export const VasukiRope: React.FC<{ x0: number; x1: number; y: number; pull?: number; head?: boolean; sag?: number }> = ({ x0, x1, y, pull = 0, head = true, sag = 30 }) => {
  const d = `M ${x0} ${y} Q ${(x0 + x1) / 2} ${y + sag} ${x1} ${y}`;
  return (
    <g>
      <path d={d} stroke="#2f6b3a" strokeWidth={34} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#d9c86a" strokeWidth={6} fill="none" strokeDasharray="10 16" strokeDashoffset={pull * 60} />
      <path d={d} stroke={C.ink} strokeWidth={2.6} fill="none" opacity={0.5} />
      {head && <g transform={`translate(${x0},${y})`}>
        <path d="M 0 -18 Q -40 -70 -90 -54 Q -120 -30 -100 0 Q -80 24 -40 18 Q -10 16 0 18 Z" fill="#2f6b3a" stroke={C.ink} strokeWidth={3} />
        <path d="M -60 -50 Q -84 -30 -70 0 Q -50 6 -40 -10 Z" fill="#d9c86a" stroke={C.ink} strokeWidth={2} />
        <circle cx={-90} cy={-24} r={5} fill={C.red} stroke={C.ink} strokeWidth={1.6} />
        <path d="M -118 -10 l -22 -4 m 22 4 l -22 6" stroke={C.red} strokeWidth={2.4} />
      </g>}
    </g>
  );
};

/** Kurma (Vishnu's tortoise form): big domed shell with hex plates, head + flippers; origin = shell top centre */
export const Kurma: React.FC<{ x: number; y: number; s?: number; t: number; glow?: number }> = ({ x, y, s = 1, t, glow = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#pglow)">
    <ellipse cx={0} cy={60} rx={420} ry={180} fill="#7fd0ff" opacity={0.25 * glow} filter="url(#soft)" />
    {[-1, 1].map((k) => <path key={k} d={`M ${k * 250} 110 q ${k * 120} ${20 + Math.sin(t * 2 + k) * 14} ${k * 170} 90 q ${-k * 80} 10 ${-k * 170} -40 Z`} fill="#6f9c78" stroke={C.ink} strokeWidth={3} />)}
    <g transform={`translate(310,${70 + Math.sin(t * 1.5) * 6})`}>
      <path d="M -40 0 Q 20 -50 90 -30 Q 120 0 90 30 Q 30 46 -40 30 Z" fill="#6f9c78" stroke={C.ink} strokeWidth={3} />
      <circle cx={70} cy={-10} r={7} fill={C.white} stroke={C.ink} strokeWidth={2} /><circle cx={72} cy={-10} r={3} fill={C.ink} />
      <path d="M 50 -38 L 60 -64 L 74 -40" fill={C.gold} stroke={C.ink} strokeWidth={2} />
    </g>
    <path d="M -300 120 Q -300 -60 0 -60 Q 300 -60 300 120 Z" fill="#4f7a5a" stroke={C.ink} strokeWidth={4} />
    {[-180, -60, 60, 180].map((xx, i) => <path key={xx} d={`M ${xx - 50} ${30 - (i % 3 === 0 ? -10 : 10)} l 25 -40 l 50 0 l 25 40 l -25 40 l -50 0 Z`} fill="#6b9a74" stroke={C.ink} strokeWidth={2.4} />)}
    <path d="M -310 120 L 310 120 L 300 140 L -300 140 Z" fill={C.gold} stroke={C.ink} strokeWidth={3} />
    <Dots pts={along(-290, 130, 290, 130, 16)} r={3} fill={C.red} />
  </g>
);

/** Halahal: churning dark blue-black smoke with a sickly glow; `grow` 0..1 size, `spread` widens it across the frame */
export const PoisonCloud: React.FC<{ x: number; y: number; t: number; grow?: number; spread?: number }> = ({ x, y, t, grow = 1, spread = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${grow * (1 + spread * 1.6)},${grow * (1 + spread * 0.8)})`}>
    <ellipse cx={0} cy={-120} rx={360} ry={300} fill="#3fd0a0" opacity={0.18} filter="url(#soft)" />
    {Array.from({ length: 14 }, (_, i) => {
      const a = i * 2.39 + t * (0.4 + (i % 3) * 0.15), r = 60 + (i % 5) * 40;
      const cx = Math.cos(a) * r * 1.3, cy = -140 + Math.sin(a) * r * 0.9 - (i % 4) * 30;
      return <circle key={i} cx={cx} cy={cy} r={70 + (i % 4) * 22} fill={i % 3 ? "#1b2a44" : "#24384f"} stroke="#0b0f18" strokeWidth={3} opacity={0.92} />;
    })}
    {Array.from({ length: 9 }, (_, i) => {
      const a = i * 0.7 + t * 0.8, r = 40 + i * 18;
      return <path key={i} d={`M ${Math.cos(a) * r} ${-140 + Math.sin(a) * r * 0.7} q 20 -16 40 0 q 20 16 40 0`} stroke="#5fe0b0" strokeWidth={3} fill="none" opacity={0.7} />;
    })}
  </g>
);

/** Kailash: snowy peaks with Shiva's seat; origin bottom centre */
export const Kailash: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#pglow)">
    <path d="M -620 0 L -360 -420 L -250 -300 L -40 -720 L 140 -420 L 260 -520 L 620 0 Z" fill="#7f8aa6" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -40 -720 L 40 -560 L 0 -580 L -40 -530 L -80 -580 L -110 -560 Z" fill="#f2f0ea" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
    <path d="M -360 -420 L -310 -340 L -350 -360 L -390 -330 Z M 260 -520 L 310 -440 L 270 -455 L 230 -430 Z" fill="#f2f0ea" stroke={C.ink} strokeWidth={2.6} />
    {[-300, -100, 120, 340].map((xx, i) => <path key={xx} d={`M ${xx} ${-60 - i * 20} q 40 -30 80 0`} stroke="#5f6a86" strokeWidth={4} fill="none" />)}
  </g>
);

export const Snake: React.FC<{ x: number; y: number; s?: number; t: number; flip?: boolean }> = ({ x, y, s = 1, t, flip }) => (
  <g transform={`translate(${x},${y}) scale(${(flip ? -1 : 1) * s},${s})`} filter="url(#pglow)">
    <path d={`M -90 0 Q -60 ${-26 + Math.sin(t * 5) * 10} -30 0 Q 0 ${26 - Math.sin(t * 5) * 10} 30 0 Q 50 -20 60 -50`} stroke="#3f7a3a" strokeWidth={18} fill="none" strokeLinecap="round" />
    <path d={`M -90 0 Q -60 ${-26 + Math.sin(t * 5) * 10} -30 0 Q 0 ${26 - Math.sin(t * 5) * 10} 30 0 Q 50 -20 60 -50`} stroke={C.gold} strokeWidth={3} fill="none" strokeDasharray="4 8" />
    <ellipse cx={66} cy={-60} rx={18} ry={12} fill="#3f7a3a" stroke={C.ink} strokeWidth={2.4} />
    <circle cx={74} cy={-63} r={2.4} fill={C.gold} />
  </g>
);

export const Scorpion: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#pglow)">
    {[-1, 1].map((k) => [0, 1, 2].map((i) => <path key={`${k}${i}`} d={`M ${-14 + i * 14} 0 l ${k * 0 - 8} 22`} stroke={C.ink} strokeWidth={4} transform={`scale(1,${k})`} />))}
    <ellipse cx={0} cy={0} rx={38} ry={16} fill="#5a3a22" stroke={C.ink} strokeWidth={2.6} />
    <path d={`M -36 0 Q -80 -10 -84 -50 Q -80 -84 -50 ${-80 + Math.sin(t * 4) * 6}`} stroke="#5a3a22" strokeWidth={10} fill="none" strokeLinecap="round" />
    <path d={`M -50 ${-80 + Math.sin(t * 4) * 6} l 14 6 l -10 8 Z`} fill={C.red} stroke={C.ink} strokeWidth={1.6} />
    {[-1, 1].map((k) => <path key={k} d={`M 34 ${k * 6} q 26 ${k * 16} 44 ${k * 4} m 0 0 l 8 ${k * -10} m -8 ${k * 10} l 12 ${k * 4}`} stroke="#5a3a22" strokeWidth={6} fill="none" strokeLinecap="round" />)}
  </g>
);

/** golden amrit kalash (the hoped-for nectar) */
export const Kalash: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#pglow)">
    <ellipse cx={0} cy={-80} rx={160} ry={160} fill="#ffe28a" opacity={0.28 + 0.08 * Math.sin(t * 2)} filter="url(#soft)" />
    <path d="M -50 -150 L 50 -150 L 40 -130 Q 100 -100 90 -40 Q 80 10 0 14 Q -80 10 -90 -40 Q -100 -100 -40 -130 Z" fill={C.gold} stroke={C.ink} strokeWidth={3} />
    <Dots pts={along(-80, -60, 80, -60, 8)} r={4} fill={C.red} />
    {[-30, 0, 30].map((xx) => <path key={xx} d={`M ${xx} -150 Q ${xx - 20} -200 ${xx} -220 Q ${xx + 20} -200 ${xx} -150`} fill={C.green} stroke={C.ink} strokeWidth={2} />)}
    <circle cx={0} cy={-230} r={20} fill="#c4432f" stroke={C.ink} strokeWidth={2.4} />
  </g>
);

/** glowing Om for the finale */
export const Om: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <circle r={150} fill="#ffcf6a" opacity={0.25} filter="url(#soft)" />
    <text x={0} y={60} textAnchor="middle" fontFamily="Tiro" fontSize={190} fill="#f6d27a" stroke="#5a3a12" strokeWidth={3}>ॐ</text>
  </g>
);
