#!/bin/bash
# pptx → odp（text-autospace を切る）→ pdf → png(2000px幅、余白詰め)。使い方: render.sh 出力先 a.pptx b.pptx ...
set -e
OUTD=$1; shift; D=$(cd "$(dirname "$0")" && pwd); W=$(mktemp -d); mkdir -p "$OUTD"
for f in "$@"; do
  b=$(basename "$f" .pptx); cp "$f" "$W/$b.pptx"; cd $W
  FONTCONFIG_FILE=$D/fonts.conf soffice --headless --convert-to odp --outdir $W "$W/$b.pptx" >/dev/null 2>&1
  rm -rf x && mkdir x && (cd x && unzip -q "../$b.odp" && sed -i 's/style:text-autospace="[^"]*"/style:text-autospace="none"/g' styles.xml content.xml && sed -i 's/<style:paragraph-properties /<style:paragraph-properties style:text-autospace="none" /g' styles.xml content.xml && sed -i 's/style:text-autospace="none" \([^>]*\)style:text-autospace="none"/\1style:text-autospace="none"/g' styles.xml content.xml && rm -f "../$b.odp" && zip -q -X -0 "../$b.odp" mimetype && zip -q -X -r "../$b.odp" . -x mimetype)
  FONTCONFIG_FILE=$D/fonts.conf soffice --headless --convert-to pdf --outdir $W "$b.odp" >/dev/null 2>&1
  pdftoppm -png -r 300 -singlefile "$b.pdf" raw
  python3 -c "
from PIL import Image, ImageChops
im=Image.open('raw.png').convert('RGB'); bg=Image.new('RGB',im.size,(255,255,255))
x0,y0,x1,y1=ImageChops.difference(im,bg).getbbox(); m=60
im=im.crop((max(0,x0-m),max(0,y0-m),min(im.width,x1+m),min(im.height,y1+m)))
im=im.resize((2000,round(im.height*2000/im.width)),Image.LANCZOS); im.save('$OUTD/$b.png'); print('$b',im.size)"
  cd - >/dev/null
done
rm -rf $W
