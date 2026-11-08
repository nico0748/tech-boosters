#!/bin/bash
# 使い方: python3 math.py && node 図生成スクリプト.js .. && bash render.sh
# pptx → odp（text-autospace を切る）→ pdf → png(2000px幅、余白詰め)
set -e
D=$(cd "$(dirname "$0")" && pwd); W=$D/work; mkdir -p $W; cd $W
for f in "$D"/../0*.pptx; do
  b=$(basename "$f" .pptx)
  FONTCONFIG_FILE=$D/fonts.conf soffice --headless --convert-to odp --outdir $W "$f" >/dev/null 2>&1
  rm -rf x && mkdir x && (cd x && unzip -q "../$b.odp" && sed -i 's/style:text-autospace="[^"]*"/style:text-autospace="none"/g' styles.xml content.xml && sed -i 's/<style:paragraph-properties /<style:paragraph-properties style:text-autospace="none" /g' styles.xml content.xml && sed -i 's/style:text-autospace="none" \([^>]*\)style:text-autospace="none"/\1style:text-autospace="none"/g' styles.xml content.xml && rm -f "../$b.odp" && zip -q -X -0 "../$b.odp" mimetype && zip -q -X -r "../$b.odp" . -x mimetype)
  FONTCONFIG_FILE=$D/fonts.conf soffice --headless --convert-to pdf --outdir $W "$b.odp" >/dev/null 2>&1
  pdftoppm -png -r 300 -singlefile "$b.pdf" raw
  python3 -c "
from PIL import Image, ImageChops
im=Image.open('raw.png').convert('RGB'); bg=Image.new('RGB',im.size,(255,255,255))
x0,y0,x1,y1=ImageChops.difference(im,bg).getbbox(); m=60
im=im.crop((max(0,x0-m),max(0,y0-m),min(im.width,x1+m),min(im.height,y1+m)))
im=im.resize((2000,round(im.height*2000/im.width)),Image.LANCZOS); im.save('$D/../$b.png'); print('$b',im.size)"
done
