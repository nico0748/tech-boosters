#!/usr/bin/env python3
"""PPTX のフォントを zukai-diagrams（図解ベストプラクティス）の3役に揃える。
usage: refont.py in.pptx [out.pptx]
  魅せる(display): Codec Cold / UD新ゴ Pr6N M … 枠の見出し（ピンク・太字・下線）とタイトル
  読ませる(body) : Gibson / Hiragino Sans     … それ以外の文字
  コード(code)   : Menlo / Hiragino Sans      … 等幅フォントだった文字
"""
import re, sys, zipfile, shutil, os, tempfile
ROLE = {"display": ("Codec Cold", "UD新ゴ Pr6N M"), "body": ("Gibson", "Hiragino Sans"), "code": ("Menlo", "Hiragino Sans")}
MONO = re.compile(r"Menlo|Consolas|Courier|Mono|Monaco|Source Code|SF Mono|Inconsolata|Fira Code|Ricty|Osaka.等幅", re.I)
ORDER_AFTER = ("sym", "hlinkClick", "hlinkMouseOver", "rtl", "extLst")

def role_of(rpr_open, inner):
    lat = re.search(r'<a:latin typeface="([^"]*)"', inner)
    ea = re.search(r'<a:ea typeface="([^"]*)"', inner)
    if (lat and MONO.search(lat.group(1))) or (not lat and ea and MONO.search(ea.group(1))):
        return "code"
    bold = re.search(r'\sb="1"', rpr_open); ul = re.search(r'\su="(?!none)[^"]+"', rpr_open)
    pink = re.search(r'<a:solidFill>\s*<a:srgbClr val="D81B60"', inner, re.I)
    if bold and ul and pink:
        return "display"
    return None  # body or inherit

def fonts_xml(role):
    en, ja = ROLE[role]
    return f'<a:latin typeface="{en}"/><a:ea typeface="{ja}" pitchFamily="34" charset="-128"/><a:cs typeface="{en}"/>'

def fix_rpr(m, default_role):
    tag, attrs, inner = m.group(1), m.group(2), m.group(3)
    inner = inner or ""
    role = role_of(attrs, inner) or default_role
    inner = re.sub(r'<a:(latin|ea|cs)\b[^>]*/>', "", inner)
    # schema order: latin/ea/cs come before sym, hlinkClick, ..., extLst
    pos = len(inner)
    for t in ORDER_AFTER:
        k = inner.find(f"<a:{t}")
        if k != -1: pos = min(pos, k)
    inner = inner[:pos] + fonts_xml(role) + inner[pos:]
    return f"<a:{tag}{attrs}>{inner}</a:{tag}>"

RPR = re.compile(r'<a:(rPr|defRPr|endParaRPr)(\b[^>]*?)(?:/>|>(.*?)</a:\1>)', re.S)

def fix_part(x, title=False):
    return RPR.sub(lambda m: fix_rpr(m, "display" if title else "body"), x)

def fix_slide(x):
    # 図形ごとに処理：タイトルのプレースホルダーは display
    def sp(m):
        s = m.group(0)
        is_title = re.search(r'<p:ph[^>]*type="(?:title|ctrTitle)"', s) is not None
        return fix_part(s, is_title)
    x2 = re.sub(r'<p:sp>.*?</p:sp>|<p:sp\s[^>]*>.*?</p:sp>', sp, x, flags=re.S)
    # 表（graphicFrame）など図形外の rPr
    return re.sub(r'(<p:graphicFrame\b.*?</p:graphicFrame>)', lambda m: fix_part(m.group(1)), x2, flags=re.S)

def fix_theme(x):
    def blk(m):
        k, b = m.group(1), m.group(0)
        en, ja = ROLE["display" if k == "major" else "body"]
        b = re.sub(r'<a:latin typeface="[^"]*"[^>]*/>', f'<a:latin typeface="{en}"/>', b, count=1)
        b = re.sub(r'<a:ea typeface="[^"]*"[^>]*/>', f'<a:ea typeface="{ja}"/>', b, count=1)
        b = re.sub(r'(<a:font script="Jpan" typeface=")[^"]*', r'\g<1>' + ja, b)
        return b
    return re.sub(r'<a:(major|minor)Font>.*?</a:\1Font>', blk, x, flags=re.S)

def main(src, dst=None):
    dst = dst or src
    zin = zipfile.ZipFile(src)
    fd, tmp = tempfile.mkstemp(suffix=".pptx", dir=os.path.dirname(os.path.abspath(dst))); os.close(fd)
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for info in zin.infolist():
            data = zin.read(info.filename); f = info.filename
            if f.endswith(".xml") and f.startswith("ppt/"):
                x = data.decode("utf8")
                if re.match(r"ppt/theme/theme\d+\.xml$", f): x = fix_theme(x)
                elif re.match(r"ppt/slides/slide\d+\.xml$", f): x = fix_slide(x)
                elif re.match(r"ppt/(slideLayouts|slideMasters|notesSlides|notesMasters)/", f) or f == "ppt/presentation.xml": x = fix_part(x)
                data = x.encode("utf8")
            zi = zipfile.ZipInfo(info.filename, date_time=info.date_time); zi.compress_type = zipfile.ZIP_STORED if info.filename == "[Content_Types].xml" and False else zipfile.ZIP_DEFLATED
            zout.writestr(zi, data)
    shutil.move(tmp, dst)

if __name__ == "__main__":
    main(*sys.argv[1:3])
