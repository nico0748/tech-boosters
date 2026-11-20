#!/usr/bin/env python3
"""描画したPDFの行位置で、pptx の1行が折り返されていないかを調べる。
usage: wrapcheck.py <pptxルート> <pdfルート> [rel.pptx ...]  → rel | slide | 行 | PDFでの分かれ方
PDF は <pdfルート>/<rel から .pptx を除いたもの>/doc.pdf（render.sh の出力先）。
全角スペースや大きな空きで区切った行・意図した改行（\n 入りの文字列）も出るので、出た行は PNG で目で確かめる。"""
import sys, os, re, zipfile, subprocess, html
root, proot = sys.argv[1], sys.argv[2]
rels = sys.argv[3:] or sorted(os.path.relpath(os.path.join(d, f), root) for d, _, fs in os.walk(root) for f in fs if f.endswith(".pptx"))
def norm(s): return re.sub(r"\s+", "", s)
def unesc(t): return html.unescape(t)
def pdf_lines(pdf):
    x = subprocess.run(["pdftotext", "-bbox-layout", pdf, "-"], capture_output=True, text=True).stdout
    pages = []
    for pg in re.findall(r"<page\b.*?</page>", x, re.S):
        ls = []
        for ln in re.findall(r"<line\b.*?</line>", pg, re.S):
            ws = re.findall(r"<word[^>]*>(.*?)</word>", ln, re.S)
            ls.append(norm(unesc("".join(ws))))
        pages.append(ls)
    return pages
def ppt_lines(path):
    z = zipfile.ZipFile(path); out = []
    slides = sorted([n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)], key=lambda s: int(re.findall(r"\d+", s)[0]))
    for si, sn in enumerate(slides):
        x = z.read(sn).decode(); res = []
        for p in re.findall(r"<a:p>.*?</a:p>|<a:p\s.*?</a:p>", x, re.S):
            for seg in re.split(r"<a:br\b[^>]*/>|<a:br\b.*?</a:br>", p, flags=re.S):
                t = "".join(unesc(m) for m in re.findall(r"<a:t>(.*?)</a:t>", seg, re.S))
                if len(norm(t)) >= 2: res.append(t)
        out.append(res)
    return out
for rel in rels:
    pdf = os.path.join(proot, rel[:-5], "doc.pdf")
    if not os.path.exists(pdf): print(rel, "| NO PDF"); continue
    pl = pdf_lines(pdf); sl = ppt_lines(os.path.join(root, rel))
    for si, lines in enumerate(sl):
        P = pl[si] if si < len(pl) else []
        for t in lines:
            n = norm(t)
            if any(n in l for l in P): continue
            # どこで分かれたか：先頭を含む行と、末尾を含む行
            head = next((l for l in P if n[:4] in l), "?"); tail = next((l for l in P if n[-3:] in l), "?")
            print(rel, si + 1, t.strip()[:50], f"[{head[:30]} / {tail[:30]}]", sep=" | ")
