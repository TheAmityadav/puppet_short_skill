// Puppet-theatre stage pieces: SVG filters, backdrops, hanging stars/moon, haze, dust motes, vignette, curtain, grain.
import React from "react";
import { C, rand, clamp, lerp } from "./lib";
import { Dots, along } from "./Puppet";

export const W = 1080, H = 1920;

export const Defs: React.FC = () => (
  <defs>
    {/* warm edge glow around every cut-out, like a lit puppet in haze */}
    <filter id="pglow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="9" result="b" />
      <feFlood floodColor="#ffcf7a" floodOpacity="0.55" />
      <feComposite in2="b" operator="in" result="g" />
      <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="black"><feColorMatrix type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.02  0 0 0 0 0.02  0 0 0 1 0" /></filter>
    <filter id="soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="22" /></filter>
    <filter id="goldsil"><feColorMatrix type="matrix" values="0 0 0 0 0.95  0 0 0 0 0.72  0 0 0 0 0.38  0 0 0 0.85 0" /><feGaussianBlur stdDeviation="2" /></filter>
    {[2, 4, 7, 12].map((b) => <filter key={b} id={`blur${b}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={b} /></filter>)}
    <radialGradient id="spot" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stopColor="#ffd590" stopOpacity="0.55" />
      <stop offset="45%" stopColor="#d08a3a" stopOpacity="0.18" />
      <stop offset="100%" stopColor="#000" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="48%" r="72%">
      <stop offset="55%" stopColor="#000" stopOpacity="0" />
      <stop offset="100%" stopColor="#000" stopOpacity="0.82" />
    </radialGradient>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#120c08" /><stop offset="60%" stopColor="#2c1d12" /><stop offset="100%" stopColor="#1a110b" />
    </linearGradient>
    <linearGradient id="night" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#0f1626" /><stop offset="70%" stopColor="#24263a" /><stop offset="100%" stopColor="#1a1410" />
    </linearGradient>
    <linearGradient id="curt" x1="0" y1="0" x2="1" y2="0">
      {Array.from({ length: 9 }, (_, i) => <stop key={i} offset={`${(i / 8) * 100}%`} stopColor={i % 2 ? "#5e1012" : "#9b1f22"} />)}
    </linearGradient>
    <pattern id="grain" width="160" height="160" patternUnits="userSpaceOnUse">
      {Array.from({ length: 70 }, (_, i) => <rect key={i} x={rand(i) * 160} y={rand(i + 99) * 160} width="2" height="2" fill={rand(i + 7) > 0.5 ? "#fff" : "#000"} opacity="0.07" />)}
    </pattern>
  </defs>
);

/** dark stage wall with a faint temple-arch frame (like the painted proscenium in the references) */
export const Backdrop: React.FC<{ tint?: string; arch?: boolean; sky?: "wall" | "night" }> = ({ tint, arch = true, sky = "wall" }) => (
  <g>
    <rect width={W} height={H} fill={`url(#${sky})`} />
    {tint && <rect width={W} height={H} fill={tint} opacity={0.35} />}
    {arch && <g opacity={0.5}>
      <path d={`M 130 1500 L 130 700 Q 130 360 540 300 Q 950 360 950 700 L 950 1500`} fill="none" stroke="#6b4a26" strokeWidth={6} />
      <path d={`M 160 1500 L 160 710 Q 160 400 540 340 Q 920 400 920 710 L 920 1500`} fill="none" stroke="#6b4a26" strokeWidth={2} />
      <Dots pts={Array.from({ length: 24 }, (_, i) => { const a = Math.PI * (i / 23); return [540 - Math.cos(a) * 395, 700 - Math.sin(a) * 380] as [number, number]; })} r={3} fill="#8a6430" />
    </g>}
  </g>
);

/** stage floor with patterned front border and footlights */
export const Floor: React.FC<{ y?: number; col?: string }> = ({ y = 1460, col = "#3a2616" }) => (
  <g>
    <rect x={0} y={y} width={W} height={H - y} fill={col} />
    <rect x={0} y={y} width={W} height={10} fill="#6b4a26" />
    <rect x={0} y={y + 40} width={W} height={36} fill="#2a1a0f" />
    <Dots pts={along(0, y + 58, W, y + 58, 30)} r={4} fill="#a07a3a" />
    <rect x={0} y={y} width={W} height={H - y} fill="url(#spot)" opacity={0.25} />
  </g>
);

/** stars and a crescent moon hanging on threads from the fly loft */
export const Hanging: React.FC<{ t: number; seed?: number; n?: number; moon?: [number, number] | null; y0?: number; y1?: number }> = ({ t, seed = 1, n = 14, moon = [820, 300], y0 = 120, y1 = 760 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = 40 + rand(i * 3 + seed) * 1000, y = lerp(y0, y1, rand(i * 7 + seed)), sw = Math.sin(t * 1.3 + i) * 4;
      const r = 6 + rand(i + seed * 5) * 7;
      return <g key={i} transform={`translate(${x + sw},${y})`}>
        <line x1={-sw} y1={-y} x2={0} y2={0} stroke="#cdb886" strokeOpacity={0.25} strokeWidth={1.2} />
        <path d={`M 0 ${-r} L ${r * 0.3} ${-r * 0.3} L ${r} 0 L ${r * 0.3} ${r * 0.3} L 0 ${r} L ${-r * 0.3} ${r * 0.3} L ${-r} 0 L ${-r * 0.3} ${-r * 0.3} Z`}
          fill="#f6d27a" opacity={0.65 + 0.35 * Math.sin(t * 2 + i * 1.7)} filter="url(#pglow)" />
      </g>;
    })}
    {moon && <g transform={`translate(${moon[0] + Math.sin(t) * 5},${moon[1]})`}>
      <line x1={0} y1={-moon[1]} x2={0} y2={-30} stroke="#cdb886" strokeOpacity={0.3} strokeWidth={1.2} />
      <path d="M 10 -34 A 36 36 0 1 0 10 34 A 28 28 0 1 1 10 -34 Z" fill="#f3dfa0" filter="url(#pglow)" />
    </g>}
  </g>
);

/** floating dust motes in the light beam */
export const Dust: React.FC<{ t: number; n?: number; seed?: number; col?: string }> = ({ t, n = 60, seed = 3, col = "#ffd98f" }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = (rand(i + seed) * W + Math.sin(t * 0.3 + i) * 40 + t * (8 + rand(i * 2) * 10)) % W;
      const y = (rand(i * 5 + seed) * H - t * (12 + rand(i * 3) * 18) + H * 4) % H;
      const r = 1.5 + rand(i * 11) * 3.5;
      return <circle key={i} cx={x} cy={y} r={r} fill={col} opacity={0.25 + 0.45 * (0.5 + 0.5 * Math.sin(t * 2 + i))} />;
    })}
  </g>
);

/** sepia haze + top spotlight + vignette + grain, laid over the scene */
export const Atmos: React.FC<{ t: number; spot?: [number, number]; warm?: number }> = ({ t, spot = [540, 820], warm = 1 }) => (
  <g pointerEvents="none">
    <ellipse cx={spot[0]} cy={spot[1]} rx={620} ry={900} fill="url(#spot)" opacity={0.55 * warm} />
    <rect width={W} height={H} fill="#7a4a1c" opacity={0.12} style={{ mixBlendMode: "soft-light" }} />
    <rect width={W} height={H} fill="url(#vig)" />
    <rect width={W} height={H} fill="url(#grain)" transform={`translate(${(Math.floor(t * 24) * 37) % 160},${(Math.floor(t * 24) * 61) % 160})`} />
  </g>
);

/** red theatre curtain; open = 0 closed, 1 fully open */
export const Curtain: React.FC<{ open: number }> = ({ open }) => {
  const o = clamp(open);
  const half = (side: -1 | 1) => {
    const wq = lerp(560, 0, o); // panel width (fully off-frame when open)
    const x0 = side < 0 ? 0 : W - wq;
    const sag = lerp(0, 160, Math.min(o * 1.4, 1)) * (1 - o * 0.9);
    return <g>
      <path d={side < 0
        ? `M 0 0 L ${wq} 0 Q ${wq - sag * 0.6} ${H * 0.45} ${wq + sag * 0.2} ${H} L 0 ${H} Z`
        : `M ${W} 0 L ${x0} 0 Q ${x0 + sag * 0.6} ${H * 0.45} ${x0 - sag * 0.2} ${H} L ${W} ${H} Z`}
        fill="url(#curt)" stroke="#2a0606" strokeWidth={4} />
      {Array.from({ length: 6 }, (_, i) => {
        const xx = side < 0 ? (wq * (i + 0.5)) / 6 : x0 + (wq * (i + 0.5)) / 6;
        return <line key={i} x1={xx} y1={0} x2={xx + side * -sag * 0.15} y2={H} stroke="#3a0708" strokeOpacity={0.5} strokeWidth={10} />;
      })}
      <rect x={side < 0 ? 0 : x0} y={H - 60} width={wq} height={22} fill={C.gold} opacity={0.7} />
    </g>;
  };
  if (o >= 0.999) return null;
  return <g>
    {half(-1)}{half(1)}
    {/* valance */}
    <g transform={`translate(0,${-o * 220})`}><path d={`M 0 0 L ${W} 0 L ${W} 120 ${Array.from({ length: 8 }, (_, i) => `Q ${W - (i + 0.5) * 135} 190 ${W - (i + 1) * 135} 120`).join(" ")} Z`} fill="#8a1a1d" stroke="#2a0606" strokeWidth={4} />
    <Dots pts={along(0, 124, W, 124, 16)} r={6} fill={C.gold} /></g>
  </g>;
};

/** lamp flame (diya) */
export const Diya: React.FC<{ x: number; y: number; t: number; s?: number; lit?: number; col?: string }> = ({ x, y, t, s = 1, lit = 1, col = "#ffcf5a" }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={-40} rx={60 * lit} ry={70 * lit} fill={col} opacity={0.3 * lit} filter="url(#soft)" />
    <path d="M -40 0 Q 0 30 40 0 L 30 -8 L -30 -8 Z" fill={C.ochre} stroke={C.ink} strokeWidth={3} />
    <Dots pts={along(-30, 4, 30, 4, 5)} r={2.4} fill={C.red} />
    {lit > 0.01 && <path d={`M 0 ${-12} Q ${-12 + Math.sin(t * 9) * 3} -30 ${Math.sin(t * 7) * 4} ${-50 * lit - 6} Q ${12} -30 0 -12 Z`} fill={col} stroke="#ffeeb0" strokeWidth={2} opacity={lit} />}
  </g>
);
