#!/bin/bash
# usage: render.sh in.pptx out_dir   → out_dir/p1.png, p2.png ...（300dpi で描画、余白60pxで切り抜き、横2000pxに縮小）と、折り返し確認用の out_dir/doc.pdf
set -e; HERE="$(cd "$(dirname "$0")" && pwd)"; IN="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"; mkdir -p "$2"; OUT="$(cd "$2" && pwd)"
export FONTCONFIG_FILE="$HERE/fonts.conf"
W=$(mktemp -d "$HOME/zfr.XXXX"); cd "$W"; cp "$IN" a.pptx
# LibreOffice はコネクタ（p:cxnSp）を経路を引き直して描くので、描画用の複製だけ普通の図形（p:sp）にする
python3 - <<'P'
import zipfile,re,shutil
zi=zipfile.ZipFile("a.pptx"); zo=zipfile.ZipFile("c.pptx","w",zipfile.ZIP_DEFLATED)
for it in zi.infolist():
    d=zi.read(it.filename)
    if re.match(r"ppt/slides/slide\d+\.xml$",it.filename):
        x=d.decode()
        x=re.sub(r"<p:cNvCxnSpPr>.*?</p:cNvCxnSpPr>|<p:cNvCxnSpPr/>","<p:cNvSpPr/>",x,flags=re.S)
        x=x.replace("<p:cxnSp>","<p:sp>").replace("</p:cxnSp>","</p:sp>").replace("<p:nvCxnSpPr>","<p:nvSpPr>").replace("</p:nvCxnSpPr>","</p:nvSpPr>")
        d=x.encode()
    if it.filename=="ppt/presentation.xml":  # 図形が台紙の端からはみ出していても切れないよう、描画用の台紙を右と下に1インチ広げる
        d=re.sub(rb'<p:sldSz cx="(\d+)" cy="(\d+)"',lambda m:b'<p:sldSz cx="%d" cy="%d"'%(int(m.group(1))+914400,int(m.group(2))+914400),d)
    zo.writestr(it,d)
zo.close(); shutil.move("c.pptx","a.pptx")
P
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
cp b.pdf "$OUT/doc.pdf"
pdftoppm -png -r 300 b.pdf pg
python3 - "$OUT" <<'P'
import sys,glob,re
from PIL import Image, ImageChops
for f in sorted(glob.glob("pg-*.png"), key=lambda s:int(re.findall(r'\d+',s)[-1])):
    n=int(re.findall(r'\d+',f)[-1])
    im=Image.open(f).convert("RGB"); bg=Image.new("RGB",im.size,(255,255,255))
    bb=ImageChops.difference(im,bg).getbbox()
    if bb:
        x0,y0,x1,y1=bb; m=60
        im=im.crop((max(0,x0-m),max(0,y0-m),min(im.width,x1+m),min(im.height,y1+m)))
    im=im.resize((2000,round(im.height*2000/im.width)),Image.LANCZOS); im.save(f"{sys.argv[1]}/p{n}.png")
P
cd /; rm -rf "$W"
