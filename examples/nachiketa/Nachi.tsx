// "नचिकेता — जिसने मौत से सवाल पूछे": an original 80 s Hindi short in the 2D cut-out puppet-theatre style
// (reference look: ~/learn/maya shorts). Pure SVG scenes (Scenes.tsx) crossfaded on narration lines, curtain bookends,
// word-by-word Devanagari captions from the TTS word timings (public/nachi/words.json).
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { SCENES } from "./Scenes";
import { Defs, Atmos, Curtain } from "./Stage";
import { step, clamp } from "./lib";
import WORDS from "../../../public/nachi/words.json";

export const NACHI_FRAMES = 2400;
const XF = 0.4; // crossfade seconds

type Wd = { w: string; t: number; d: number; line: number };
const words = WORDS as Wd[];
const KEY = ["नचिकेता", "मृत्यु", "यमराज", "यम", "यमलोक", "वाजश्रवा", "आत्मा", "कठोपनिषद", "सत्य", "तीन", "वर", "पिता", "मौत", "देवता"];
// caption chunks: <= 4 words, broken at pauses
const chunks: Wd[][] = [];
for (const w of words) {
  const c = chunks[chunks.length - 1];
  const prev = c?.[c.length - 1];
  if (!c || prev.line !== w.line || c.length >= 4 || w.t - (prev.t + prev.d) > 0.28) chunks.push([w]); else c.push(w);
}

const useFont = () => {
  const [h] = useState(() => delayRender("tiro font"));
  useEffect(() => {
    const f = new FontFace("Tiro", `url(${staticFile("nachi/TiroDevanagariHindi-Regular.ttf")})`);
    f.load().then((ff) => { document.fonts.add(ff); continueRender(h); });
  }, [h]);
};

const Captions: React.FC<{ T: number }> = ({ T }) => {
  const i = chunks.findIndex((c, k) => T >= c[0].t - 0.12 && T < (chunks[k + 1] ? Math.min(chunks[k + 1][0].t - 0.12, c[c.length - 1].t + c[c.length - 1].d + 0.9) : c[c.length - 1].t + 1.2));
  if (i < 0) return null;
  const c = chunks[i];
  const age = T - (c[0].t - 0.12);
  const pop = 0.92 + 0.08 * step(age, 0, 0.18);
  return (
    <div style={{ position: "absolute", top: 330, width: "100%", textAlign: "center", opacity: clamp(age / 0.15), transform: `scale(${pop})` }}>
      <span style={{ fontFamily: "Tiro", fontSize: 76, lineHeight: 1.25, padding: "0 70px", display: "inline-block", letterSpacing: 1 }}>
        {c.map((w, k) => {
          const said = T >= w.t;
          const key = KEY.some((x) => w.w.startsWith(x));
          const col = key ? (said ? "#7fe6df" : "rgba(127,230,223,0.55)") : said ? "#f6ead0" : "rgba(246,234,208,0.5)";
          return <span key={k} style={{ color: col, textShadow: "0 0 3px #000, 0 0 3px #000, 0 3px 10px rgba(0,0,0,0.9)", marginRight: 18 }}>{w.w}</span>;
        })}
      </span>
    </div>
  );
};

export const NachiShort: React.FC = () => {
  useFont();
  const f = useCurrentFrame(), T = f / 30;
  const live = SCENES.map((s, i) => ({ s, i })).filter(({ s }) => T >= s.a - XF && T < s.b + XF);
  const curtain = T < 2.2 ? step(T, 0.3, 2.1) : 1 - step(T, 77.6, 79.4);
  return (
    <AbsoluteFill style={{ background: "#0c0806" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <Defs />
        {live.map(({ s, i }) => {
          const fadeIn = i === 0 ? 1 : step(T, s.a - XF, s.a + XF * 0.25);
          return <g key={i} opacity={fadeIn}>{s.draw(T)}</g>;
        })}
        <Atmos t={T} />
        <Curtain open={curtain} />
      </svg>
      <Captions T={T} />
      <Audio src={staticFile("nachi/mix.wav")} />
    </AbsoluteFill>
  );
};
