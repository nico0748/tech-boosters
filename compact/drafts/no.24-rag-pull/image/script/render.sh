#!/bin/bash
# usage: render.sh file.pptx -> out/file.png (2000px wide). LibreOffice の和欧間スペースを消すため odp 経由
set -e; f="$1"; n="$(basename "${f%.pptx}")"; mkdir -p out/tmp
FONTCONFIG_FILE=$PWD/fonts.conf soffice --headless --convert-to odp --outdir out/tmp "$f" >/dev/null 2>&1
python3 - "out/tmp/$n.odp" <<'PY'
import sys,zipfile,re,shutil
p=sys.argv[1]; q=p+'.x'
zi=zipfile.ZipFile(p); zo=zipfile.ZipFile(q,'w')
for it in zi.infolist():
    d=zi.read(it.filename)
    if it.filename in('content.xml','styles.xml'):
        t=d.decode()
        t=re.sub(r'style:text-autospace="[^"]*"','',t)
        t=t.replace('<style:paragraph-properties','<style:paragraph-properties style:text-autospace="none"')
        d=t.encode()
    zo.writestr(it,d, compress_type=zipfile.ZIP_STORED if it.filename=='mimetype' else zipfile.ZIP_DEFLATED)
zo.close(); shutil.move(q,p)
PY
FONTCONFIG_FILE=$PWD/fonts.conf soffice --headless --convert-to pdf --outdir out/tmp "out/tmp/$n.odp" >/dev/null 2>&1
pdftoppm -png -r 150 -singlefile "out/tmp/$n.pdf" "out/$n"
python3 -c "from PIL import Image;im=Image.open('out/$n.png');im=im.resize((2000,1125),Image.LANCZOS);im.save('out/$n.png');print(im.size)"
