// __COMP__Short: Hindi puppet-theatre short (2D cut-out marionettes on a dark stage), made from the puppet-theatre-short skill.
// Pure SVG scenes (Scenes.tsx) crossfaded on narration lines, red-curtain bookends, word-by-word Devanagari karaoke
// captions from the TTS word timings (public/__SLUG__/words.json), soundtrack public/__SLUG__/mix.wav.
// You normally never edit this file: story lives in Scenes.tsx (SCENES, KEY), look lives in Stage/Puppet/Props.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { SCENES, KEY } from "./Scenes";
import { Defs, Atmos, Curtain } from "./Stage";
import { step, clamp } from "./lib";
import WORDS from "../../../public/__SLUG__/words.json";

const DUR = SCENES[SCENES.length - 1].b;            // seconds; the last scene's end = video length
export const __COMP___FRAMES = Math.round(DUR * 30);
const XF = 0.4;                                      // scene crossfade, seconds

type Wd = { w: string; t: number; d: number; line: number };
const words = WORDS as Wd[];
// caption chunks: <= 4 words, never across a script line, broken at pauses > 0.28 s
const chunks: Wd[][] = [];
for (const w of words) {
  const c = chunks[chunks.length - 1];
  const prev = c?.[c.length - 1];
  if (!c || prev.line !== w.line || c.length >= 4 || w.t - (prev.t + prev.d) > 0.28) chunks.push([w]); else c.push(w);
}

const useFont = () => {
  const [h] = useState(() => delayRender("tiro font"));
  useEffect(() => {
    const f = new FontFace("Tiro", `url(${staticFile("__SLUG__/TiroDevanagariHindi-Regular.ttf")})`);
    f.load().then((ff) => { (document.fonts as unknown as { add: (f: FontFace) => void }).add(ff); continueRender(h); });
  }, [h]);
};

/** karaoke captions: top of frame, unsaid words at 50 % alpha, said words solid; KEY words cyan */
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

export const __COMP__Short: React.FC = () => {
  useFont();
  const f = useCurrentFrame(), T = f / 30;
  const live = SCENES.map((s, i) => ({ s, i })).filter(({ s }) => T >= s.a - XF && T < s.b + XF);
  // curtain: opens 0.3 → 2.1 s, closes over the last ~2.4 s
  const curtain = T < 2.2 ? step(T, 0.3, 2.1) : 1 - step(T, DUR - 2.4, DUR - 0.6);
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
      <Audio src={staticFile("__SLUG__/mix.wav")} />
    </AbsoluteFill>
  );
};
