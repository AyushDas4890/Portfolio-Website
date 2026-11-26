#!/bin/sh
# Export the six project films and their styled plates into the site (public/media/films/<slug>/).
# Every file keeps the name of the media slot it replaces (PNG slots become JPEG), so data/projects.ts only
# changes its folder. Run from anywhere: sh films/export.sh [slug…]
set -e
LIB=/c/Users/ayush/lemo-opuscar
FILMS=$(cd "$(dirname "$0")" && pwd)
SITE=$(dirname "$FILMS")
PY="$LIB/.venv/Scripts/python.exe"; [ -x "$PY" ] || PY="$LIB/.venv/bin/python"

enc() {  # web encode: 1280 wide, silent, loops cleanly, starts fast
  ffmpeg -loglevel error -y -i "$1" -an -vf "scale=1280:-2:flags=lanczos,format=yuv420p" -c:v libx264 -preset slow -crf 26 -movflags +faststart "$2"
}
shrink() {  # $1 in, $2 out, $3 WxH
  "$PY" -c "import sys;from PIL import Image;w,h=map(int,sys.argv[3].split('x'));Image.open(sys.argv[1]).convert('RGB').resize((w,h),Image.LANCZOS).save(sys.argv[2],quality=84,optimize=True,progressive=True)" "$1" "$2" "$3"
}
# plate: film dir, source image (in img/), output name (.jpg). Renders the still (used as the poster) and,
# unless $4 is "still", a 6 s motion clip of the same plate beside it (<name>.mp4): every screen slot moves.
plate() {
  d="$FILMS/$1"; o="$OUT/$3"
  if [ ! -f "$o" ] || [ -n "$FORCE" ]; then
    (cd "$LIB" && node core/render/still.mjs "$d" 3 --q "plate=img/$2&w=1920&h=1200" --size 1920x1200 --prefix "x_" --out "$d/tmp" >/dev/null)
    shrink "$d/tmp/x_3.jpg" "$o" 1440x900; echo "  $3  ← plate $2"
  fi
  [ "$4" = still ] && return 0
  v="$OUT/${3%.*}.mp4"
  if [ ! -f "$v" ] || [ -n "$FORCE" ]; then clip "$1" "$2" "${3%.*}.mp4"; fi
}
# plate clip (6 s loop) + nothing else
clip() {
  d="$FILMS/$1"
  (cd "$LIB" && node core/render/video.mjs "$d" --fps 24 --workers 4 --q "plate=img/$2&w=1920&h=1200" --size 1920x1200 --out "$d/tmp/clip.mp4" >/dev/null)
  enc "$d/tmp/clip.mp4" "$OUT/$3"; rm -f "$d/tmp/clip.mp4"; echo "  $3  ← clip $2"
}
# the 8 s film + its poster frame
film() {
  d="$FILMS/$1"
  [ -f "$d/out/film.mp4" ] || (cd "$LIB" && node core/render/video.mjs "$d" --fps 24 --workers 4 --out "$d/out/film.mp4" >/dev/null)
  enc "$d/out/film.mp4" "$OUT/$2"
  (cd "$LIB" && node core/render/still.mjs "$d" "$4" --prefix "x_" --out "$d/tmp" >/dev/null)
  shrink "$d/tmp/x_$4.jpg" "$OUT/$3" 1600x900; echo "  $2 + $3  ← film (poster t=$4)"
}
need() { [ -n "$FORCE" ] || [ ! -f "$OUT/$1" ]; }   # skip outputs already exported (FORCE=1 redoes all)
go() { slug=$1; media=$2; OUT="$SITE/public/media/films/$media"; mkdir -p "$OUT" "$FILMS/$slug/tmp"; echo "$slug → $OUT"; }

ALL="${*:-relay c4future research-assistant cancer-tf dynamic-island fruit-ripeness}"
for s in $ALL; do case $s in
relay)
  go relay relay
  need "landing.mp4" && film relay landing.mp4 landing-poster.jpg 6.9
  cp "$OUT/landing.mp4" "$OUT/intro.mp4"; echo "  intro.mp4  ← film"
  for f in app-admin app-canvas app-channel app-list landing-1 landing-2 landing-4 landing-6 signin tour-huddles tour-search tour-workflows; do plate relay $f.jpg $f.jpg; done
  plate relay hero.jpg poster.jpg still
  clip relay hero.jpg loop.mp4
  clip relay signin.jpg transition.mp4 ;;
c4future)
  go c4future c4future
  need "scene.mp4" && film c4future scene.mp4 scene-poster.jpg 5.2
  for f in advisor calc-form compare decompose insights result-1 result-2 result-3 result-4 screen-1 screen-3 screen-5; do plate c4future $f.jpg $f.jpg; done
  plate c4future calc-form.jpg calc-poster.jpg still
  plate c4future screen-1.jpg loop-poster.jpg still
  clip c4future result-1.jpg calc.mp4
  clip c4future screen-1.jpg loop.mp4 ;;
research-assistant)
  go research-assistant research-assistant
  need "film.mp4" && film research-assistant film.mp4 film-poster.jpg 5.6
  for f in screen-1.jpg webui.jpg pipeline.png report.png; do plate research-assistant $f "${f%.*}.jpg"; done ;;
cancer-tf)
  go cancer-tf cancer-tf
  need "loop.mp4" && film cancer-tf loop.mp4 loop-poster.jpg 3.5
  for f in screen-1 screen-2 screen-3 screen-4; do plate cancer-tf $f.jpg $f.jpg; done ;;
dynamic-island)
  go dynamic-island dynamic-island
  need "film.mp4" && film dynamic-island film.mp4 film-poster.jpg 2.6
  for f in home-spiderbot.jpg island-hero.jpg settings.jpg notification.png now-playing.png timer.png; do plate dynamic-island $f "${f%.*}.jpg"; done ;;
fruit-ripeness)
  go fruit-ripeness fruit
  need "loop.mp4" && film fruit-ripeness loop.mp4 loop-poster.jpg 6.2
  for f in idea look pipeline result results slides; do plate fruit-ripeness $f.jpg $f.jpg; done ;;
esac; rm -rf "$FILMS/$s/tmp"; done
echo done
