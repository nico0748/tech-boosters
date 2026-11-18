#!/bin/bash
# usage: render.sh in.pptx out_prefix
set -e; cd "$(dirname "$0")"; B=$(basename "$1" .pptx); export FONTCONFIG_FILE=$PWD/fonts.conf
rm -rf _r && mkdir _r && cp "$1" _r/a.pptx && cd _r
soffice --headless --convert-to odp a.pptx >/dev/null 2>&1
mkdir x && cd x && unzip -q ../a.odp
python3 - <<'P'
import re
def fix(m):
    t=re.sub(r'\s+style:text-autospace="[^"]*"','',m.group(0))
    return t.replace('<style:paragraph-properties','<style:paragraph-properties style:text-autospace="none"',1)
for f in ["styles.xml","content.xml"]:
    s=open(f).read(); s=re.sub(r'<style:paragraph-properties\b[^>]*>',fix,s); open(f,"w").write(s)
P
zip -q -r ../b.odp mimetype -X -0 && zip -q -r ../b.odp . -x mimetype && cd ..
soffice --headless --convert-to pdf b.odp >/dev/null 2>&1
pdftoppm -png -r 300 -singlefile b.pdf b
python3 - "$2" <<'P'
import sys
from PIL import Image, ImageChops
im=Image.open("b.png").convert("RGB"); bg=Image.new("RGB",im.size,(255,255,255))
x0,y0,x1,y1=ImageChops.difference(im,bg).getbbox(); m=60
im=im.crop((max(0,x0-m),max(0,y0-m),min(im.width,x1+m),min(im.height,y1+m)))
im=im.resize((2000,round(im.height*2000/im.width)),Image.LANCZOS); im.save(sys.argv[1])
P
