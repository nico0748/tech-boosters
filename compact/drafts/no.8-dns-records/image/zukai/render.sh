#!/bin/bash
# usage: render.sh <outdir>  — pptx → odp（和欧間の自動スペースを切る）→ pdf → png（2000px、余白を詰める）
# LibreOffice は和文と英数字の間に自動でスペースを入れる（PowerPoint は入れない）ので、odp で text-autospace を none にしてから PDF にする
HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$1" || exit 1
export FONTCONFIG_FILE="$HERE/fonts.conf"
timeout 170 soffice --headless --convert-to odp *.pptx >/dev/null 2>&1
python3 - <<'PY'
import glob, re, zipfile, os
for src in glob.glob("*.odp"):
    tmp = src + ".tmp"
    zin = zipfile.ZipFile(src); zout = zipfile.ZipFile(tmp, "w")
    for it in zin.infolist():
        d = zin.read(it.filename)
        if it.filename in ("styles.xml", "content.xml"):
            t = d.decode().replace('text-autospace="ideograph-alpha"', 'text-autospace="none"')
            t = re.sub(r'<style:paragraph-properties(?![^>]*text-autospace)', '<style:paragraph-properties style:text-autospace="none"', t)
            d = t.encode()
        zout.writestr(it, d, compress_type=zipfile.ZIP_STORED if it.filename == "mimetype" else zipfile.ZIP_DEFLATED)
    zout.close(); zin.close(); os.replace(tmp, src)
PY
timeout 170 soffice --headless --convert-to pdf *.odp >/dev/null 2>&1
for f in *.pdf; do n="${f%.pdf}"; pdftoppm -png -r 300 -singlefile "$f" "$n"; done
python3 - <<'PY'
import glob
from PIL import Image, ImageChops
for f in glob.glob("*.png"):
    im = Image.open(f).convert("RGB"); bg = Image.new("RGB", im.size, (255, 255, 255))
    bb = ImageChops.difference(im, bg).getbbox()
    if bb:
        m = 60; im = im.crop((max(bb[0]-m, 0), max(bb[1]-m, 0), min(bb[2]+m, im.width), min(bb[3]+m, im.height)))
    h = round(im.height * 2000 / im.width); im.resize((2000, h), Image.LANCZOS).save(f)
PY
rm -f -- *.pdf *.odp
