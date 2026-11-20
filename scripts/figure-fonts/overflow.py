#!/usr/bin/env python3
"""全角幅（Noto Sans CJK JP / Liberation Sans）で、テキストボックスからはみ出す・折り返す行を探す。
usage: overflow.py file.pptx ...   → file  slide  shape  need/avail  text"""
import sys, re, zipfile
from PIL import ImageFont
F = {}
def font(kind, bold):
    k = (kind, bold)
    if k not in F:
        p = {("ja", 0): "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc", ("ja", 1): "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
             ("en", 0): "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", ("en", 1): "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
             ("mono", 0): "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", ("mono", 1): "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"}[k]
        F[k] = ImageFont.truetype(p, 1000, index=0)
    return F[k]
def is_ja(ch): return ord(ch) > 0x2E7F or ch in "→←↑↓↔⇄⇆⇒⇐⇔" or 0x2010 <= ord(ch) <= 0x2027 and ch in "‐–—―‘’“”…‥・"
def width_pt(text, sz, bold, mono):
    w = 0
    for ch in text:
        kind = "ja" if is_ja(ch) else ("mono" if mono else "en")
        w += font(kind, 1 if bold else 0).getlength(ch) / 1000 * sz
    return w
EMU = 12700
def geom_inset(sp, w, h):
    """図形の種類で決まる文字領域の左右の食い込み（pt）。角丸は角の分、楕円は内接矩形の分だけ狭い（PowerPoint・LibreOffice とも）"""
    g = re.search(r'<a:prstGeom prst="(\w+)"', sp)
    if not g: return 0
    if g.group(1) == "roundRect":
        a = re.search(r'<a:gd name="adj" fmla="val (\d+)"', sp); a = int(a.group(1)) if a else 16667
        return min(w, h) * a / 100000 * 0.29289
    if g.group(1) == "ellipse": return w * 0.14645
    return 0
def check(path):
    z = zipfile.ZipFile(path); out = []
    slides = sorted([n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)], key=lambda s: int(re.findall(r"\d+", s)[0]))
    for sn in slides:
        x = z.read(sn).decode()
        for sp in re.findall(r"<p:sp>.*?</p:sp>|<p:sp\s[^>]*>.*?</p:sp>", x, re.S):
            if "<p:txBody>" not in sp: continue
            ext = re.search(r'<a:ext cx="(\d+)" cy="(\d+)"', sp)
            if not ext: continue
            cx = int(ext.group(1)) / EMU
            bp = re.search(r"<a:bodyPr([^>]*)", sp).group(1)
            if 'wrap="none"' in bp: continue
            if re.search(r'vert="(?:vert|eaVert|vert270)', bp): continue
            li = int((re.search(r'lIns="(\d+)"', bp) or [0, 91440])[1]) / EMU
            ri = int((re.search(r'rIns="(\d+)"', bp) or [0, 91440])[1]) / EMU
            cy = int(ext.group(2)) / EMU
            avail = cx - li - ri - 2 * geom_inset(sp, cx, cy)
            if avail <= 0: continue
            for para in re.findall(r"<a:p>.*?</a:p>|<a:p\s.*?</a:p>", sp, re.S):
                dsz = re.search(r'<a:(?:endParaRPr|defRPr)[^>]*\ssz="(\d+)"', para)
                lines = [[]]
                for tok in re.findall(r"<a:r>.*?</a:r>|<a:br\b[^>]*/?>(?:.*?</a:br>)?", para, re.S):
                    if tok.startswith("<a:br"): lines.append([]); continue
                    rpr = re.search(r"<a:rPr([^>]*)", tok); a = rpr.group(1) if rpr else ""
                    sz = int((re.search(r'\ssz="(\d+)"', a) or [0, dsz.group(1) if dsz else 1800])[1]) / 100
                    bold = ' b="1"' in a
                    mono = 'typeface="Menlo"' in tok
                    spc = int((re.search(r'\sspc="(-?\d+)"', a) or [0, 0])[1]) / 100
                    t = re.search(r"<a:t>(.*?)</a:t>", tok, re.S); t = t.group(1) if t else ""
                    t = t.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"').replace("&apos;", "'")
                    lines[-1].append((t, sz, bold, mono, spc))
                for ln in lines:
                    txt = "".join(r[0] for r in ln)
                    if not txt.strip(): continue
                    need = sum(width_pt(*r[:4]) + r[4] * len(r[0]) for r in ln)
                    if need > avail + 0.5:
                        out.append((sn.split("/")[-1], round(need, 1), round(avail, 1), txt))
    return out
for p in sys.argv[1:]:
    for o in check(p): print(p, *o, sep=" | ")
