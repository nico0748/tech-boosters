#!/bin/bash
# pptx -> odp (text-autospace off) -> pdf -> 2000px png
set -e
OUT=$1; T=$(mktemp -d)
for f in "$OUT"/*.pptx; do
  b=$(basename "$f" .pptx)
  soffice --headless --convert-to odp --outdir $T "$f" >/dev/null 2>&1
  mkdir -p $T/x && cd $T/x && rm -rf * && unzip -q ../"$b".odp
  python3 - <<'PY'
import re
for fn in ("content.xml","styles.xml"):
    s=open(fn,encoding="utf-8").read()
    s=s.replace('style:text-autospace="ideograph-alpha"','style:text-autospace="none"')
    s=re.sub(r'<style:paragraph-properties(?![^>]*text-autospace)', '<style:paragraph-properties style:text-autospace="none"', s)
    open(fn,"w",encoding="utf-8").write(s)
PY
  rm ../"$b".odp && zip -q -X -0 ../"$b".odp mimetype && zip -q -X -r ../"$b".odp . -x mimetype && cd - >/dev/null
  soffice --headless --convert-to pdf --outdir $T $T/"$b".odp >/dev/null 2>&1
  pdftoppm -png -r 300 -singlefile $T/"$b".pdf $T/"$b"
  convert $T/"$b".png -resize 2000x "$OUT/$b.png"
done
rm -rf $T
