# no.13 Agentic Internet の図を作る（python-pptx）
# 使い方: python3 図生成スクリプト.py <出力pptxのパス>
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from lxml import etree

NAVY = RGBColor(0x2E, 0x5E, 0x8E)
TEAL = RGBColor(0x1E, 0x8A, 0x82)
RED = RGBColor(0xC0, 0x39, 0x2B)
TEXT = RGBColor(0x1F, 0x3A, 0x5C)
SUB = RGBColor(0x6B, 0x72, 0x80)
SLATE = RGBColor(0x2B, 0x3A, 0x4A)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
NAVY_BG = RGBColor(0xEE, 0xF3, 0xF9)
TEAL_BG = RGBColor(0xE8, 0xF5, 0xF3)
TEAL_MID = RGBColor(0xC9, 0xE8, 0xE4)
GRAY_BG = RGBColor(0xF3, 0xF4, 0xF6)
GRAY_MID = RGBColor(0xE5, 0xE7, 0xEB)
FONT = "Noto Sans CJK JP"

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)


def new_slide():
    return prs.slides.add_slide(prs.slide_layouts[6])


def set_text(shape, lines, anchor=MSO_ANCHOR.MIDDLE, align=PP_ALIGN.CENTER):
    """lines: [(text, size, bold, color), ...]"""
    tf = shape.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    for m in ("margin_left", "margin_right"):
        setattr(tf, m, Inches(0.08))
    tf.margin_top = tf.margin_bottom = Inches(0.03)
    for i, (t, size, bold, color) in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        r = p.add_run()
        r.text = t
        r.font.size = Pt(size)
        r.font.bold = bold
        r.font.color.rgb = color
        r.font.name = FONT
        rpr = r._r.get_or_add_rPr()
        ea = rpr.find(qn("a:ea"))
        if ea is None:
            ea = etree.SubElement(rpr, qn("a:ea"))
        ea.set("typeface", FONT)


def rrect(s, x, y, w, h, fill, line, lw=1.4, adj=0.16, dash=False):
    sh = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    sh.adjustments[0] = adj
    sh.shadow.inherit = False
    if fill is None:
        sh.fill.background()
    else:
        sh.fill.solid()
        sh.fill.fore_color.rgb = fill
    if line is None:
        sh.line.fill.background()
    else:
        sh.line.color.rgb = line
        sh.line.width = Pt(lw)
        if dash:
            sh.line.dash_style = 4  # dash
    return sh


def rect(s, x, y, w, h, fill, line=None):
    sh = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    sh.shadow.inherit = False
    sh.fill.solid()
    sh.fill.fore_color.rgb = fill
    if line is None:
        sh.line.fill.background()
    else:
        sh.line.color.rgb = line
        sh.line.width = Pt(1.4)
    return sh


def node(s, x, y, w, h, title, sub=None, border=NAVY, fill=WHITE, tsize=18, ssize=16, tcolor=TEXT):
    sh = rrect(s, x, y, w, h, fill, border)
    lines = [(title, tsize, True, tcolor)]
    if sub:
        lines.append((sub, ssize, False, SUB))
    set_text(sh, lines)
    return sh


def zone(s, x, y, w, h, label, accent, bg, tabw=None):
    rrect(s, x, y, w, h, bg, accent, lw=1.6, adj=0.05)
    tw = tabw or (0.6 + 0.3 * len(label))
    tab = rrect(s, x + 0.3, y - 0.26, tw, 0.52, accent, None, adj=0.5)
    set_text(tab, [(label, 18, True, WHITE)])


def label(s, x, y, w, h, text, size=16, color=SUB, bold=False, align=PP_ALIGN.CENTER):
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    set_text(tb, [(text, size, bold, color)], align=align)
    return tb


def arrow(s, x1, y1, x2, y2, color=SUB, dash=False):
    c = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    c.line.color.rgb = color
    c.line.width = Pt(1.5)
    if dash:
        c.line.dash_style = 4
    ln = c.line._get_or_add_ln()
    tail = etree.SubElement(ln, qn("a:tailEnd"))
    tail.set("type", "triangle")
    tail.set("w", "med")
    tail.set("len", "med")
    return c


# ---------- 図1: AIエージェントの通信の増加と、人からのアクセスの減少 ----------
s = new_slide()
BASE = 6.0   # 棒グラフの底
MAXH = 4.2   # いちばん高い棒の高さ

# 左: AIエージェントの通信（1年前を1としたとき）
zone(s, 0.5, 0.75, 6.0, 6.25, "AIエージェントの通信", TEAL, TEAL_BG)
unit = MAXH / 18
s.shapes  # noqa
rect(s, 1.4, BASE - unit, 1.6, unit, TEAL_MID, TEAL)
rect(s, 4.0, BASE - 18 * unit, 1.6, 18 * unit, TEAL)
label(s, 1.2, BASE - unit - 0.55, 2.0, 0.5, "1", 18, TEXT, True)
label(s, 3.6, BASE - 18 * unit - 0.6, 2.4, 0.55, "18倍以上", 20, TEAL, True)
arrow(s, 2.3, BASE - 1.0, 3.85, BASE - 3.4, TEAL)
label(s, 0.7, BASE - 3.2, 2.9, 0.5, "1年で1,700%以上増", 16, TEAL, True)
s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(0.9), Inches(BASE), Inches(6.1), Inches(BASE)).line.color.rgb = SUB
label(s, 1.2, BASE + 0.1, 2.0, 0.45, "1年前", 16, TEXT)
label(s, 3.8, BASE + 0.1, 2.0, 0.45, "現在", 16, TEXT)

# 右: 人からのアクセス（以前を100としたとき）
zone(s, 6.85, 0.75, 6.0, 6.25, "人からのアクセス", NAVY, NAVY_BG)
rect(s, 7.75, BASE - MAXH, 1.6, MAXH, NAVY)
lo, hi = 0.6 * MAXH, 0.7 * MAXH
rect(s, 10.35, BASE - lo, 1.6, lo, NAVY)
rrect(s, 10.35, BASE - hi, 1.6, hi - lo, None, NAVY, adj=0.0, dash=True)
label(s, 7.55, BASE - MAXH - 0.55, 2.0, 0.5, "100", 18, TEXT, True)
label(s, 9.95, BASE - hi - 0.6, 2.4, 0.55, "3〜4割減", 20, RED, True)
s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(7.25), Inches(BASE), Inches(12.45), Inches(BASE)).line.color.rgb = SUB
label(s, 7.55, BASE + 0.1, 2.0, 0.45, "以前", 16, TEXT)
label(s, 10.15, BASE + 0.1, 2.0, 0.45, "現在", 16, TEXT)


# ---------- 図2: アイソレートの仕組み ----------
s = new_slide()
rows = [1.95, 3.5, 5.05]
RH = 0.95
# 左: エージェントが書いたコード
for i, y in enumerate(rows):
    node(s, 0.5, y, 2.4, RH, f"コード{i + 1}", "エージェントが作成", border=NAVY, ssize=15)
# サーバーとランタイム
zone(s, 4.6, 0.85, 8.25, 6.25, "1台のサーバー", SLATE, GRAY_BG)
zone(s, 4.9, 1.45, 7.65, 5.3, "ランタイム（1つのプロセス）", TEAL, TEAL_BG, tabw=4.4)
for i, y in enumerate(rows):
    node(s, 5.3, y, 4.1, RH, f"アイソレート{i + 1}", "専用のメモリと変数", border=TEAL)
    arrow(s, 2.9, y + RH / 2, 5.3, y + RH / 2, SUB)
label(s, 2.88, rows[0] + RH / 2 - 0.52, 1.75, 0.48, "数ミリ秒で作成", 15, TEAL, True)
for y in (rows[0] + RH, rows[1] + RH):
    label(s, 5.3, y + 0.07, 4.1, 0.45, "✘ 互いのメモリは見えない", 16, RED)
label(s, 5.3, rows[2] + RH + 0.05, 4.1, 0.45, "1つのランタイムで数百〜数千個", 16, TEXT, True)
v8 = rrect(s, 9.95, rows[0], 2.2, rows[2] + RH - rows[0], NAVY, None, adj=0.1)
set_text(v8, [("V8エンジン", 18, True, WHITE), ("Chromeと同じ", 16, False, WHITE), ("みんなで共有", 16, False, WHITE)])
for y in rows:
    s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(9.4), Inches(y + RH / 2), Inches(9.95), Inches(y + RH / 2)).line.color.rgb = SUB


# ---------- 図3: コンテナとアイソレートの比較 ----------
s = new_slide()
CW, GAP = 1.65, 0.2


def stack(x0, accent, bg, name, shared_runtime):
    zone(s, x0, 0.8, 5.9, 4.35, name, accent, bg)
    bar = rrect(s, x0 + 0.3, 4.4, 5.3, 0.55, GRAY_MID, None, adj=0.2)
    set_text(bar, [("サーバー", 16, True, TEXT)])
    bar = rrect(s, x0 + 0.3, 3.75, 5.3, 0.55, GRAY_MID, None, adj=0.2)
    set_text(bar, [("OS", 16, True, TEXT)])
    for i in range(3):
        cx = x0 + 0.3 + i * (CW + GAP)
        if shared_runtime:
            node(s, cx, 1.3, CW, 1.4, f"コード{i + 1}", "アイソレート", border=TEAL, tsize=16, ssize=15)
        else:
            rrect(s, cx - 0.05, 1.3, CW + 0.1, 2.35, None, NAVY, adj=0.08)
            label(s, cx - 0.05, 1.32, CW + 0.1, 0.45, f"コンテナ{i + 1}", 16, NAVY, True)
            node(s, cx + 0.1, 1.85, CW - 0.2, 0.75, f"コード{i + 1}", None, border=NAVY, tsize=16)
            rt = rrect(s, cx + 0.1, 2.75, CW - 0.2, 0.75, GRAY_MID, None)
            set_text(rt, [("ランタイム", 15, True, TEXT)])
    if shared_runtime:
        rt = rrect(s, x0 + 0.3, 2.85, 5.3, 0.75, TEAL, None, adj=0.2)
        set_text(rt, [("ランタイム（1つを共有）", 18, True, WHITE)])


stack(0.5, NAVY, NAVY_BG, "コンテナ", False)
stack(6.95, TEAL, TEAL_BG, "アイソレート", True)
# 下: 数字の比較
node(s, 0.5, 5.5, 2.85, 1.25, "数百ミリ秒", "起動にかかる時間", border=NAVY, tsize=20)
node(s, 3.55, 5.5, 2.85, 1.25, "数百MB", "動かすのに要るメモリ", border=NAVY, tsize=20)
node(s, 6.95, 5.5, 2.85, 1.25, "数ミリ秒", "起動にかかる時間", border=TEAL, tsize=20, tcolor=TEAL)
node(s, 10.0, 5.5, 2.85, 1.25, "数MB", "動かすのに要るメモリ", border=TEAL, tsize=20, tcolor=TEAL)

prs.save(sys.argv[1])
