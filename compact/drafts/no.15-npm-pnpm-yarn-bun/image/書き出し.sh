set -e
FC=$PWD/fonts.conf; cd "$1"; rm -rf /tmp/r15; mkdir -p /tmp/r15
for f in *.pptx; do
  b="${f%.pptx}"
  FONTCONFIG_FILE=$FC soffice --headless --convert-to odp --outdir /tmp/r15 "$f" >/dev/null 2>&1
  (cd /tmp/r15 && mkdir -p x && cd x && rm -rf * && unzip -q ../"$b".odp && sed -i 's/text-autospace="ideograph-alpha"/text-autospace="none"/g' styles.xml content.xml && grep -q 'text-autospace="none"' styles.xml || sed -i 's#<style:paragraph-properties #<style:paragraph-properties style:text-autospace="none" #g' styles.xml content.xml; zip -q -X -0 ../"$b"_f.odp mimetype && zip -q -X -r ../"$b"_f.odp . -x mimetype)
  FONTCONFIG_FILE=$FC soffice --headless --convert-to pdf --outdir /tmp/r15 /tmp/r15/"$b"_f.odp >/dev/null 2>&1
  pdftoppm -png -r 300 -singlefile /tmp/r15/"$b"_f.pdf /tmp/r15/"$b"
  python3 - "/tmp/r15/$b.png" "$b.png" <<'PY'
import sys
from PIL import Image, ImageChops
im=Image.open(sys.argv[1]).convert("RGB")
bg=Image.new("RGB",im.size,(255,255,255)); bb=ImageChops.difference(im,bg).getbbox()
m=60; im=im.crop(bb); c=Image.new('RGB',(im.width+2*m,im.height+2*m),(255,255,255)); c.paste(im,(m,m)); im=c
w=2000; im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS); im.save(sys.argv[2]); print(sys.argv[2],im.size)
PY
done
