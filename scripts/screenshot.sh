#!/usr/bin/env bash
# Headless-chrome screenshot tool for AI debugging of diagrams / docs app.
# Usage:
#   scripts/screenshot.sh [URL] [OUTPUT] [WIDTH] [HEIGHT]
# Defaults:
#   URL     http://localhost:5180/
#   OUTPUT  /tmp/hyperkit-screenshots/latest.png
#   WIDTH   1600
#   HEIGHT  7000   (tall enough to capture all 8 diagrams stacked)
#
# Reads the PNG via Claude Code's Read tool for visual inspection.
# Dependencies: google-chrome (already installed system-wide).

set -euo pipefail

URL="${1:-http://localhost:5180/}"
OUT="${2:-/tmp/hyperkit-screenshots/latest.png}"
W="${3:-1600}"
H="${4:-7000}"

mkdir -p "$(dirname "$OUT")"

google-chrome \
  --headless=new \
  --disable-gpu \
  --hide-scrollbars \
  --no-sandbox \
  --virtual-time-budget=4000 \
  --window-size="${W},${H}" \
  --screenshot="$OUT" \
  "$URL" > /dev/null 2>&1

echo "Saved: $OUT ($(du -h "$OUT" | cut -f1))"
