set -e
cd /tmp/z22 && node gen.js
mkdir -p out && rm -rf out/* 
for f in 0*.pptx; do
  b="${f%.pptx}"
  FONTCONFIG_FILE=$PWD/fonts.conf soffice --headless --convert-to odp --outdir out "$f" >/dev/null 2>&1
  python3 - "out/$b.odp" <<'PY'
import sys, zipfile, re, shutil
src=sys.argv[1]; tmp=src+'.tmp'
zin=zipfile.ZipFile(src); zout=zipfile.ZipFile(tmp,'w')
for it in zin.infolist():
    d=zin.read(it.filename)
    if it.filename in ('styles.xml','content.xml'):
        x=d.decode()
        x=re.sub(r'style:text-autospace="[^"]*"','style:text-autospace="none"',x)
        x=re.sub(r'<style:paragraph-properties(?![^>]*text-autospace)',r'<style:paragraph-properties style:text-autospace="none"',x)
        d=x.encode()
    zout.writestr(it, d)
zout.close(); shutil.move(tmp,src)
PY
  FONTCONFIG_FILE=$PWD/fonts.conf soffice --headless --convert-to pdf --outdir out "out/$b.odp" >/dev/null 2>&1
  pdftoppm -png -r 300 -singlefile "out/$b.pdf" "$b"
done
python3 - <<'PY'
from PIL import Image, ImageChops
import glob
for f in sorted(glob.glob('/tmp/z22/0*.png')):
    im=Image.open(f).convert('RGB'); bg=Image.new('RGB',im.size,(255,255,255))
    b=ImageChops.difference(im,bg).getbbox(); m=60
    im=im.crop((max(b[0]-m,0),max(b[1]-m,0),min(b[2]+m,im.width),min(b[3]+m,im.height)))
    im=im.resize((2000,round(im.height*2000/im.width)),Image.LANCZOS); im.save(f); print(f,im.size)
PY
