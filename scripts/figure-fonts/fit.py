#!/usr/bin/env python3
"""全角幅（ヒラギノと同じ1em）で枠からはみ出す和文の行を直す（角丸・楕円の文字領域の狭さも考える）。usage: fit.py file.pptx ...（上書き）
順に試す：(1) 文字枠を、外側の見える図形の内側まで広げる → (2) 文字を小さく（元の90%・12ptまで）
→ (3) 字間を詰める（文字サイズの8%まで）→ (4) 自然な位置で改行（高さに余裕があれば）→ (5) 文字枠を広げる。
欧文だけの行は、置き換え前と字幅が同じなので触らない。表のセルは (2)(3) まで。"""
import sys, re, zipfile, os, shutil, tempfile, math
_argv = sys.argv; sys.argv = sys.argv[:1]
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import overflow as O
sys.argv = _argv
EMU = 12700; SLACK = 0.94; MIN = 12.0; PAD = 0.07 * 72
CJK = lambda t: any(O.is_ja(c) for c in t)
BRK_AFTER = "・／/ 、）)：:"; BRK_BEFORE = "（("
MANUAL_BREAK = {"コンテナランタイム": 4}  # 区切り記号のない複合語は、ここで改行位置を決める
def unesc(t): return t.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"').replace("&apos;", "'")
def esc(u): return u.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
def para_lines(para):
    dsz = re.search(r'<a:(?:endParaRPr|defRPr)[^>]*\ssz="(\d+)"', para)
    lines = [[]]
    for tok in re.findall(r"<a:r>.*?</a:r>|<a:br\b[^>]*/?>", para, re.S):
        if tok.startswith("<a:br"): lines.append([]); continue
        rpr = re.search(r"<a:rPr([^>]*)", tok); a = rpr.group(1) if rpr else ""
        sz = int((re.search(r'\ssz="(\d+)"', a) or [0, dsz.group(1) if dsz else 1800])[1]) / 100
        spc = int((re.search(r'\sspc="(-?\d+)"', a) or [0, 0])[1]) / 100
        t = re.search(r"<a:t>(.*?)</a:t>", tok, re.S); t = unesc(t.group(1)) if t else ""
        lines[-1].append((t, sz, ' b="1"' in a, 'typeface="Menlo"' in tok, spc))
    return [l for l in lines if "".join(r[0] for r in l).strip()]
def lw(l): return sum(O.width_pt(r[0], r[1], r[2], r[3]) + r[4] * len(r[0]) for r in l)
def set_attr(para, name, fn):
    def one(m):
        a = m.group(1)
        if re.search(rf'\s{name}="(-?\d+)"', a): a = re.sub(rf'\s{name}="(-?\d+)"', lambda mm: f' {name}="{fn(int(mm.group(1)))}"', a)
        else:
            v = fn(None)
            if v is not None: a = a + f' {name}="{v}"'
        return a
    p = re.sub(r'(?<=<a:rPr)([^>/]*)', one, para)
    return p
def bad_lines(para, avail):
    return [l for l in para_lines(para) if lw(l) > avail * SLACK + 0.3 and CJK("".join(r[0] for r in l))]
def try_break(para, avail):
    if "<a:br" in para: return None
    runs = list(re.finditer(r"<a:r>(.*?)</a:r>", para, re.S)); items = []
    for ri, m in enumerate(runs):
        tok = m.group(0); rpr = re.search(r"<a:rPr([^>]*)", tok); a = rpr.group(1) if rpr else ""
        sz = int((re.search(r'\ssz="(\d+)"', a) or [0, 1800])[1]) / 100
        t = re.search(r"<a:t>(.*?)</a:t>", tok, re.S); t = unesc(t.group(1)) if t else ""
        for ci, ch in enumerate(t): items.append((ri, ci, ch, sz, ' b="1"' in a, 'typeface="Menlo"' in tok))
    w = [O.width_pt(x[2], x[3], x[4], x[5]) for x in items]; tot = sum(w); best = None; acc = 0
    for k in range(1, len(items)):
        acc += w[k - 1]; prev, cur = items[k - 1][2], items[k][2]
        line = "".join(x[2] for x in items)
        if not (prev in BRK_AFTER or cur in BRK_BEFORE or MANUAL_BREAK.get(line) == k): continue
        a1 = acc - (w[k - 1] if prev == " " else 0); a2 = tot - acc
        if a1 <= avail * SLACK and a2 <= avail * SLACK:
            sc = abs(a1 - a2) + (30 if prev == "・" else 0)
            if best is None or sc < best[0]: best = (sc, k)
    if not best: return None
    ri, ci = items[best[1]][0], items[best[1]][1]
    m = runs[ri]; tok = m.group(0); t = re.search(r"<a:t>(.*?)</a:t>", tok, re.S); raw = unesc(t.group(1))
    rpr = re.search(r"<a:rPr\b[^>]*?(?:/>|>.*?</a:rPr>)", tok, re.S); br = "<a:br>" + (rpr.group(0) if rpr else "<a:rPr/>") + "</a:br>"
    left, right = raw[:ci].rstrip(" "), raw[ci:].lstrip(" ")
    mk = lambda s: tok.replace(t.group(0), "<a:t>" + esc(s) + "</a:t>")
    newtok = (mk(left) if left else "") + br + mk(right)
    return para[:m.start()] + newtok + para[m.end():]
def text_height(paras):
    h = 0
    for p in paras:
        for l in (para_lines(p) or [[("", 12, 0, 0, 0)]]): h += 1.25 * max(r[1] for r in l)
    return h
def fit_body(body, avail, height=None, allow_break=True):
    extra = 0; log = []; paras = re.findall(r"<a:p>.*?</a:p>|<a:p\s.*?</a:p>", body, re.S)
    def fp(m):
        nonlocal extra
        para = m.group(0); bad = bad_lines(para, avail)
        if not bad: return para
        txt = "".join(r[0] for r in bad[0])[:30]; need = max(lw(l) for l in bad)
        if need > avail * 1.3: log.append(("LONG", round(need, 1), round(avail, 1), txt)); return para
        # (2) 小さく
        f = avail * SLACK / need
        new = set_attr(para, "sz", lambda v: None if v is None else max(int(MIN * 100), int(v * 0.9 // 50 * 50 + (50 if v * 0.9 % 50 else 0)), int(math.floor(v * f / 50) * 50)))
        if not bad_lines(new, avail): log.append(("SHRINK", round(need, 1), round(avail, 1), txt)); return new
        # (3) 字間を詰める
        ls = [l for l in para_lines(new) if CJK("".join(r[0] for r in l))]
        worst = max(ls, key=lw); n = sum(len(r[0]) for r in worst); szmin = min(r[1] for r in worst)
        d = (lw(worst) - avail * 0.99) / max(n, 1)
        if d <= 0: log.append(("SHRINK", round(need, 1), round(avail, 1), txt)); return new
        if d <= 0.08 * szmin:
            new2 = set_attr(new, "spc", lambda v: -int(math.ceil(d * 100)))
            log.append(("CONDENSE", round(need, 1), round(avail, 1), round(d, 2), txt)); return new2
        # (4) 改行
        if allow_break and (height is None or text_height(paras) + 1.25 * MIN <= height + 2):
            b = try_break(para, avail)
            if b: log.append(("BREAK", round(need, 1), round(avail, 1), txt)); return b
        # (5) 広げる
        new2 = set_attr(new, "spc", lambda v: -int(0.08 * szmin * 100))
        n2 = max(lw(l) for l in para_lines(new2))
        if n2 > avail: extra = max(extra, n2 - avail + 2)
        log.append(("WIDEN?", round(need, 1), round(avail, 1), txt)); return new2
    nb = re.sub(r"<a:p>.*?</a:p>|<a:p\s.*?</a:p>", fp, body, flags=re.S)
    return nb, extra, log
XF = re.compile(r'<a:off x="(-?\d+)" y="(-?\d+)"/>\s*<a:ext cx="(\d+)" cy="(\d+)"/>')
def visible_boxes(x):
    out = []
    for sp in re.findall(r"<p:sp>.*?</p:sp>|<p:sp\s[^>]*>.*?</p:sp>", x, re.S):
        m = XF.search(sp); spPr = re.search(r"<p:spPr.*?</p:spPr>", sp, re.S)
        if not m or not spPr: continue
        g = re.search(r'prstGeom prst="(\w+)"', spPr.group(0))
        if g and g.group(1) not in ("rect", "roundRect", "snipRoundRect", "round2SameRect", "flowChartProcess", "flowChartAlternateProcess"): continue
        s = spPr.group(0); vis = ("<a:solidFill>" in s.split("<a:ln")[0]) or re.search(r"<a:ln\b[^>]*>(?:(?!</a:ln>).)*<a:solidFill>", s, re.S)
        if vis: out.append(tuple(int(v) / EMU for v in m.groups()))
    return out
def fix_sp(sp, LOG, boxes):
    if "<p:txBody>" not in sp: return sp
    m = XF.search(sp)
    if not m: return sp
    bp = re.search(r"<a:bodyPr([^>]*)", sp).group(1)
    if 'wrap="none"' in bp or re.search(r'vert="(?:vert|eaVert|vert270)', bp): return sp
    ins = lambda k, d: int((re.search(rf'{k}="(\d+)"', bp) or [0, d])[1]) / EMU
    li, ri, ti, bi = ins("lIns", 91440), ins("rIns", 91440), ins("tIns", 45720), ins("bIns", 45720)
    x, y, w, h = (int(v) / EMU for v in m.groups())
    gi = O.geom_inset(sp, w, h)  # 角丸・楕円は文字領域が図形より狭い
    li, ri = li + gi, ri + gi
    avail = w - li - ri; height = h - ti - bi
    if avail <= 0: return sp
    i0 = sp.find("<p:txBody>"); i1 = sp.find("</p:txBody>"); body = sp[i0:i1]
    paras = re.findall(r"<a:p>.*?</a:p>|<a:p\s.*?</a:p>", body, re.S)
    bad = [l for p in paras for l in bad_lines(p, avail)]
    nx, nw = x, w
    if bad:
        need = max(lw(l) for l in bad)
        # (1) 外側の見える図形（自分より少し大きい枠）の内側まで広げる
        cx, cy = x + w / 2, y + h / 2
        cands = [b for b in boxes if b[0] - 1 <= x and x + w <= b[0] + b[2] + 1 and b[1] - 1 <= y and y + h <= b[1] + b[3] + 1
                 and b[2] <= w * 1.8 and not (abs(b[0] - x) < 0.5 and abs(b[2] - w) < 0.5 and abs(b[1] - y) < 0.5 and abs(b[3] - h) < 0.5)]
        algn = (re.search(r'<a:pPr[^>]*algn="(\w+)"', body) or [0, "l"])[1]
        if cands:
            b = min(cands, key=lambda b: b[2] * b[3]); lo, hi = b[0] + PAD, b[0] + b[2] - PAD
            want = need / SLACK + li + ri + 1
            if algn == "ctr":
                half = min(max(want, w) / 2, cx - lo, hi - cx); nx, nw = cx - half, 2 * half
            else:
                nx = x; nw = min(max(want, w), hi - x)
            if nw > w + 0.5:
                LOG.append(("EXPAND", round(nw - w, 1)))
                avail = nw - li - ri
            else: nx, nw = x, w
    nb, extra, log = fit_body(body, avail, height); LOG.extend(log)
    if extra:
        algn = (re.search(r'<a:pPr[^>]*algn="(\w+)"', nb) or [0, "l"])[1]
        nx = nx - extra / 2 if algn == "ctr" else (nx - extra if algn == "r" else nx); nw += extra
        LOG.append(("WIDEN", round(extra, 1)))
    sp = sp[:i0] + nb + sp[i1:]
    if (nx, nw) != (x, w):
        m2 = XF.search(sp)
        sp = sp[:m2.start()] + f'<a:off x="{int(nx * EMU)}" y="{m2.group(2)}"/><a:ext cx="{int(nw * EMU)}" cy="{m2.group(4)}"/>' + sp[m2.end():]
    return sp
def fix_tbl(gf, LOG):
    cols = [int(v) / EMU for v in re.findall(r'<a:gridCol w="(\d+)"', gf)]
    def tr(m):
        ci = [0]
        def tc(mm):
            c = mm.group(0); span = int((re.search(r'gridSpan="(\d+)"', c[:200]) or [0, 1])[1])
            w = sum(cols[ci[0]:ci[0] + span]); ci[0] += span
            a = (re.search(r"<a:tcPr([^>]*)", c) or [0, ""])[1] if re.search(r"<a:tcPr([^>]*)", c) else ""
            ml = int((re.search(r'marL="(\d+)"', a) or [0, 91440])[1]) / EMU; mr = int((re.search(r'marR="(\d+)"', a) or [0, 91440])[1]) / EMU
            i0 = c.find("<a:txBody>"); i1 = c.find("</a:txBody>")
            if i0 < 0: return c
            nb, extra, log = fit_body(c[i0:i1], w - ml - mr, None, allow_break=False); LOG.extend(log)
            return c[:i0] + nb + c[i1:]
        return re.sub(r"<a:tc\b.*?</a:tc>", tc, m.group(0), flags=re.S)
    return re.sub(r"<a:tr\b.*?</a:tr>", tr, gf, flags=re.S)
def main(path):
    z = zipfile.ZipFile(path); LOG = []
    fd, tmp = tempfile.mkstemp(suffix=".pptx", dir=os.path.dirname(os.path.abspath(path))); os.close(fd)
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
        for info in z.infolist():
            d = z.read(info.filename)
            if re.match(r"ppt/slides/slide\d+\.xml$", info.filename):
                x = d.decode(); boxes = visible_boxes(x)
                x = re.sub(r"<p:sp>.*?</p:sp>|<p:sp\s[^>]*>.*?</p:sp>", lambda mm: fix_sp(mm.group(0), LOG, boxes), x, flags=re.S)
                x = re.sub(r"<p:graphicFrame\b.*?</p:graphicFrame>", lambda mm: fix_tbl(mm.group(0), LOG) if "<a:tbl>" in mm.group(0) else mm.group(0), x, flags=re.S)
                d = x.encode()
            zo.writestr(info, d)
    shutil.move(tmp, path)
    for l in LOG: print(path, *l, sep=" | ")
for p in sys.argv[1:]: main(p)
