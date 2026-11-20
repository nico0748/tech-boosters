#!/usr/bin/env python3
"""欧文フォント（Gibson / Codec Cold）の文字列に入った矢印記号（→ など）を、同じ役の和文フォント（ヒラギノ角ゴ / UD新ゴ）で描く。
欧文フォントの矢印は小さく下寄りになるため。usage: arrowfix.py file.pptx ...（上書き）"""
import sys, re, zipfile, os, shutil, tempfile
AR = "→←↑↓↔⇄⇆⇒⇐⇔"
JA = {"Gibson": "Hiragino Sans", "Codec Cold": "UD新ゴ Pr6N M"}
def fix_run(m):
    r = m.group(0)
    t = re.search(r"<a:t>(.*?)</a:t>", r, re.S)
    if not t or not any(c in t.group(1) for c in AR): return r
    lat = re.search(r'<a:latin typeface="([^"]*)"', r)
    if not lat or lat.group(1) not in JA: return r
    ja = JA[lat.group(1)]
    pre, post = r[:t.start()], r[t.end():]
    parts = re.findall(f"[{AR}]+|[^{AR}]+", t.group(1))
    out = []
    for p in parts:
        if p[0] in AR:
            pr = re.sub(r'<a:(latin|cs) typeface="[^"]*"', lambda mm: f'<a:{mm.group(1)} typeface="{ja}"', pre)
            out.append(pr + f"<a:t>{p}</a:t>" + post)
        else:
            out.append(pre + f"<a:t>{p}</a:t>" + post)
    return "".join(out)
def main(path):
    z = zipfile.ZipFile(path); changed = False
    fd, tmp = tempfile.mkstemp(suffix=".pptx", dir=os.path.dirname(os.path.abspath(path))); os.close(fd)
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
        for info in z.infolist():
            d = z.read(info.filename)
            if re.match(r"ppt/slides/slide\d+\.xml$", info.filename):
                x = d.decode(); x2 = re.sub(r"<a:r>.*?</a:r>", fix_run, x, flags=re.S)
                if x2 != x: changed = True
                d = x2.encode()
            zo.writestr(info, d)
    if changed: shutil.move(tmp, path); print(path)
    else: os.remove(tmp)
for p in sys.argv[1:]: main(p)
