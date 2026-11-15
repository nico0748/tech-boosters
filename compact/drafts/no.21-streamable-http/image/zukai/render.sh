#!/bin/bash
# usage: render.sh file.pptx -> file.png（横2000px、余白詰め）。LibreOffice の和欧間スペースを切ってから描画
f="$1"; b=$(basename "${f%.pptx}"); mkdir -p out; rm -rf out/odp; mkdir out/odp
export FONTCONFIG_FILE=$PWD/fonts.conf
soffice --headless --convert-to odp --outdir out/odp "$f" >/dev/null 2>&1
( cd out/odp && mkdir x && cd x && unzip -q "../$b.odp" && python3 - <<'PY'
import re
for fn in ["styles.xml","content.xml"]:
    s=open(fn,encoding="utf-8").read()
    s=s.replace('style:text-autospace="ideograph-alpha"','style:text-autospace="none"')
    s=re.sub(r'<style:paragraph-properties(?![^>]*text-autospace)', '<style:paragraph-properties style:text-autospace="none"', s)
    open(fn,"w",encoding="utf-8").write(s)
PY
rm "../$b.odp"; zip -q -X -0 "../$b.odp" mimetype; zip -q -X -r "../$b.odp" . -x mimetype )
soffice --headless --convert-to pdf --outdir out "out/odp/$b.odp" >/dev/null 2>&1
pdftoppm -png -r 300 -singlefile "out/$b.pdf" "out/$b"
python3 - "out/$b.png" "$b.png" <<'PY'
import sys
from PIL import Image, ImageChops
im=Image.open(sys.argv[1]).convert("RGB")
bg=Image.new("RGB",im.size,(255,255,255)); bb=ImageChops.difference(im,bg).getbbox()
pad=60; im=im.crop((max(bb[0]-pad,0),max(bb[1]-pad,0),min(bb[2]+pad,im.width),min(bb[3]+pad,im.height)))
h=round(im.height*2000/im.width); im.resize((2000,h),Image.LANCZOS).save(sys.argv[2]); print(sys.argv[2],2000,h)
PY
