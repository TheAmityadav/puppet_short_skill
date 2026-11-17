#!/usr/bin/env bash
# Final render of a puppet-theatre short + quick checks.  Run from the Remotion project root.
# usage: scripts/render.sh <CompName> <slug> [hd|4k|both]     -> out/<slug>/<slug>.mp4 (1080x1920) / <slug>_4k.mp4 (2160x3840)
set -euo pipefail
COMP="${1:?CompName}"; SLUG="${2:?slug}"; MODE="${3:-hd}"
mkdir -p out/.remotion-tmp "out/$SLUG"; export TMPDIR="$PWD/out/.remotion-tmp" TEMP="$PWD/out/.remotion-tmp" TMP="$PWD/out/.remotion-tmp"
r() { npx remotion render src/index.ts "${COMP}Short" "$1" --gl angle "${@:2}" 2>&1 | tail -3; }
[[ $MODE == hd || $MODE == both ]] && r "out/$SLUG/$SLUG.mp4" --crf 18 --concurrency 6
[[ $MODE == 4k || $MODE == both ]] && r "out/$SLUG/${SLUG}_4k.mp4" --scale 2 --crf 14 --x264-preset slow --timeout 240000 --concurrency 4
F="out/$SLUG/$SLUG.mp4"; [[ $MODE == 4k ]] && F="out/$SLUG/${SLUG}_4k.mp4"
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact "$F"
ffmpeg -v error -i "$F" -vf "select='not(mod(n\,150))',scale=270:-1,tile=8x2" -frames:v 1 -y "out/$SLUG/strip.jpg"
ffmpeg -v info -i "$F" -af loudnorm=print_format=summary -f null - 2>&1 | grep -E "Input Integrated|Input True Peak"
echo "contact strip: out/$SLUG/strip.jpg"
