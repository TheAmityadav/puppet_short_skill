// Puppet lab: one still/clip with every character and a few props, to check a new character or pose before using it.
// Render: node scripts/stills.mjs __COMP__Test out/__SLUG__/lab_ 0,30 0.5
import React from "react";
import { useCurrentFrame } from "remotion";
import { Puppet, NACHIKETA, RISHI, YAMA, APSARA, Cow } from "./Puppet";
import { Defs, Backdrop, Floor, Hanging, Dust, Atmos, Diya } from "./Stage";
import { C } from "./lib";
export const __COMP__Test: React.FC = () => {
  const t = useCurrentFrame() / 30;
  return <svg width={1080} height={1920} viewBox="0 0 1080 1920"><Defs /><Backdrop /><Hanging t={t} /><Floor />
    <Puppet look={RISHI} pose={{ x: 200, y: 1180, aN: [60, 40], head: 5 }} />
    <Puppet look={NACHIKETA} pose={{ x: 470, y: 1290, flip: true, aN: [100, 20] }} />
    <Puppet look={APSARA(C.teal, C.gold)} pose={{ x: 640, y: 1180, s: 0.85, aN: [120, 40] }} />
    <Puppet look={YAMA} pose={{ x: 880, y: 1150, flip: true, aN: [30, 60] }} />
    <Cow x={500} y={1650} s={0.9} t={t} />
    <Diya x={900} y={1700} t={t} />
    <Dust t={t} /><Atmos t={t} /></svg>;
};
