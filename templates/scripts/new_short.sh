#!/usr/bin/env bash
# Scaffold a new puppet-theatre short.
# usage: new_short.sh <slug> <CompName> [remotion_project=~/learn/vid-test] [workdir=~/<slug>-short]
#   slug      lowercase folder name, e.g. prahlad        -> src/videos/prahlad, public/prahlad, ~/prahlad-short
#   CompName  PascalCase, e.g. Prahlad                   -> compositions PrahladShort + PrahladTest
set -euo pipefail
SKILL="$(cd "$(dirname "$0")/../.." && pwd)"
SLUG="${1:?slug}"; COMP="${2:?CompName}"
PROJ="${3:-$HOME/learn/vid-test}"; WORK="${4:-$HOME/$SLUG-short}"
V="$PROJ/src/videos/$SLUG"; P="$PROJ/public/$SLUG"
[ -e "$V" ] && { echo "exists: $V (pick another slug or delete it)"; exit 1; }
[ -f "$PROJ/package.json" ] || { echo "no Remotion project at $PROJ (see SKILL.md 'Setup')"; exit 1; }

mkdir -p "$V" "$P" "$WORK/voice" "$WORK/audio" "$PROJ/scripts" "$PROJ/out/$SLUG"
for f in lib.ts Puppet.tsx Stage.tsx Props.tsx Scenes.tsx Test.tsx; do cp "$SKILL/templates/remotion/$f" "$V/$f"; done
cp "$SKILL/templates/remotion/Main.tsx" "$V/$COMP.tsx"
sed -i "s/__SLUG__/$SLUG/g; s/__COMP__/$COMP/g" "$V"/*.tsx
cp "$SKILL/templates/assets/TiroDevanagariHindi-Regular.ttf" "$P/"
# placeholders so the project renders before the voice exists (the Nachiketa example timings)
cp "$SKILL/examples/nachiketa/words.json" "$P/words.json"
python3 - "$P/mix.wav" <<'PY'
import sys, wave
w = wave.open(sys.argv[1], "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(48000); w.writeframes(b"\0" * 4 * 48000); w.close()
PY
cp -n "$SKILL/templates/scripts/stills.mjs" "$SKILL/templates/scripts/sheet.py" "$SKILL/templates/scripts/render.sh" "$PROJ/scripts/" || true
cp "$SKILL/templates/voice/tts.py" "$WORK/voice/"
cp "$SKILL/templates/audio/dsp.py" "$SKILL/templates/audio/make_audio.py" "$WORK/audio/"
[ -f "$WORK/SCRIPT.md" ] || cp "$SKILL/templates/SCRIPT_template.md" "$WORK/SCRIPT.md"

ROOT="$PROJ/src/Root.tsx"
if ! grep -q "${COMP}Short" "$ROOT"; then
python3 - "$ROOT" "$SLUG" "$COMP" <<'PY'
import sys, re
p, slug, comp = sys.argv[1:]
s = open(p).read()
imp = f'import {{ {comp}Short, {comp}_FRAMES }} from "./videos/{slug}/{comp}";\nimport {{ {comp}Test }} from "./videos/{slug}/Test";\n'
last = list(re.finditer(r'^import .*;\n', s, re.M))[-1]
s = s[:last.end()] + imp + s[last.end():]
comp_lines = (f'    <Composition id="{comp}Short" component={{{comp}Short}} durationInFrames={{{comp}_FRAMES}} fps={{30}} width={{1080}} height={{1920}} />\n'
              f'    <Composition id="{comp}Test" component={{{comp}Test}} durationInFrames={{60}} fps={{30}} width={{1080}} height={{1920}} />\n')
i = s.rindex("</>")
s = s[:i].rstrip(" ") + comp_lines + s[i:]
open(p, "w").write(s)
PY
fi
echo "scaffolded:"
echo "  code   $V   (edit Scenes.tsx: SCENES + KEY; add characters in Puppet.tsx, props in Props.tsx)"
echo "  public $P   (words.json + mix.wav are PLACEHOLDERS until steps 3 and 6)"
echo "  work   $WORK (SCRIPT.md, voice/tts.py, audio/make_audio.py)"
echo "  comps  ${COMP}Short, ${COMP}Test registered in $ROOT"
