#!/bin/sh
# Render this film: 8 s, 1920x1080, 24 fps, silent loop. Plates: add --q "plate=img/<file>&w=1920&h=1200" --size 1920x1200
set -e
LIB=/c/Users/ayush/lemo-opuscar
HERE=$(cd "$(dirname "$0")" && pwd)
cd "$LIB"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --out "$HERE/out/film.mp4"
node core/render/still.mjs "$HERE" 0 2 4 6 --out "$HERE/stills"
