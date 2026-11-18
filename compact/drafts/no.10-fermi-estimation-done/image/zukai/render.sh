set -e
f="$1"; b="${f%.pptx}"; t=$(mktemp -d)
export FONTCONFIG_FILE=$PWD/fonts.conf
python3 /mnt/skills/public/pptx/scripts/office/soffice.py --headless --convert-to odp --outdir "$t" "$f" >/dev/null 2>&1
( cd "$t" && mkdir x && cd x && unzip -q ../*.odp && \
  sed -i 's/style:text-autospace="[^"]*"//g; s/<style:paragraph-properties/<style:paragraph-properties style:text-autospace="none"/g' styles.xml content.xml && \
  zip -q -X -0 ../fixed.odp mimetype && zip -q -X -r ../fixed.odp . -x mimetype )
python3 /mnt/skills/public/pptx/scripts/office/soffice.py --headless --convert-to pdf --outdir "$t" "$t/fixed.odp" >/dev/null 2>&1
pdftoppm -png -r 300 -singlefile "$t/fixed.pdf" "$b"
python3 - "$b.png" <<'PY'
import sys
from PIL import Image, ImageChops
p=sys.argv[1]; im=Image.open(p).convert("RGB")
bg=Image.new("RGB",im.size,(255,255,255)); bb=ImageChops.difference(im,bg).getbbox()
m=60; im=im.crop((max(bb[0]-m,0),max(bb[1]-m,0),min(bb[2]+m,im.width),min(bb[3]+m,im.height)))
w=2000; im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS); im.save(p); print(im.size)
PY
