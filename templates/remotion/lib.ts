// Small timing helpers for the Nachiketa puppet-theatre short.
export const FPS = 30;
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const smooth = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t); };
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const easeIn = (x: number) => Math.pow(clamp(x), 3);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0 before a, 1 after b, smooth in between. */
export const step = (t: number, a: number, b: number) => smooth((t - a) / Math.max(1e-4, b - a));
/** keyframes [[t, v], ...] with smoothstep between them */
export const kf = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t <= t1) { const [t0, v0] = keys[i - 1]; return lerp(v0, v1, smooth((t - t0) / Math.max(1e-4, t1 - t0))); }
  }
  return keys[keys.length - 1][1];
};
export const rand = (seed: number) => { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** cheap smooth 1D noise in [-1, 1] */
export const noise = (t: number, seed = 0) => {
  const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f);
  return lerp(rand(i + seed * 57) * 2 - 1, rand(i + 1 + seed * 57) * 2 - 1, u);
};
/** puppet sway: small swinging motion, as if hanging from strings */
export const sway = (t: number, seed = 0, amp = 1) => amp * (Math.sin(t * 1.7 + seed) * 0.6 + noise(t * 0.8, seed) * 0.4);

// Palette taken from the reference look: folk-mural flat fills under a warm sepia haze.
export const C = {
  ink: "#24150c",
  ochre: "#d9a441",
  gold: "#f0c75e",
  saffron: "#e8892b",
  red: "#c4432f",
  deepRed: "#8e2a22",
  teal: "#3f8f8a",
  green: "#5f9e4a",
  blue: "#3c6fb0",
  yamaSkin: "#3d5a7a",
  skin: "#c98a55",
  skinDark: "#a86c3e",
  cream: "#f3e2bd",
  white: "#efe6d2",
  wood: "#9a6a3c",
  stage: "#1a120c",
  pink: "#d9798a",
};
