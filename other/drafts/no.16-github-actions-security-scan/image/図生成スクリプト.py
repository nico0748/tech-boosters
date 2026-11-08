# 図1：PRごとにZAPで診断する流れ
# スイムレーン型＋アイコン＋レーンごとのアクセント色（writing-guides/figure-reference のお手本に準拠）
# アイコン：image/icons/（出典：Tabler Icons=MIT、IBM Carbon Pictograms=Apache-2.0、gilbarbara/logos=CC0）
import sys, re, os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from PIL import Image

out = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__)); ICON = os.path.join(HERE, "icons")
JP = "Noto Sans CJK JP"; MONO = "DejaVu Sans Mono"
INK = RGBColor(0x1F,0x23,0x28); SUB = RGBColor(0x4B,0x55,0x63); EDGE = RGBColor(0x55,0x55,0x55)
BORDER = RGBColor(0xC8,0xCC,0xD2); WHITE = RGBColor(0xFF,0xFF,0xFF)
GREEN = RGBColor(0x2E,0x7D,0x32); RED = RGBColor(0xC6,0x28,0x28)
# レーンごとのアクセント色（濃い色＝枠・アイコン、淡い色＝レーン背景）
VIOLET = (RGBColor(0x7C,0x4D,0xDB), RGBColor(0xF5,0xF1,0xFD))
BLUE   = (RGBColor(0x2F,0x6F,0xDB), RGBColor(0xEE,0xF4,0xFD))
TEAL   = (RGBColor(0x13,0x8A,0x7E), RGBColor(0xEA,0xF6,0xF4))
ORANGE = (RGBColor(0xE0,0x7B,0x1A), RGBColor(0xFF,0xF4,0xE6))

prs = Presentation(); prs.slide_width = Inches(13.333); prs.slide_height = Inches(7.5)
s = prs.slides.add_slide(prs.slide_layouts[6])

def runs(p, text, size, color, bold=False):
    for i, part in enumerate(re.split(r"`", text)):
        if not part: continue
        r = p.add_run(); r.text = part; r.font.size = Pt(size); r.font.bold = bold
        r.font.color.rgb = color; r.font.name = MONO if i % 2 else JP

def rect(x, y, w, h, fill, line=None, shape=MSO_SHAPE.RECTANGLE, lw=1.25):
    sh = s.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    sp = sh._element.spPr; sp.append(sp.makeelement(qn("a:effectLst"), {}))
    if fill is None: sh.fill.background()
    else: sh.fill.solid(); sh.fill.fore_color.rgb = fill
    if line is None: sh.line.fill.background()
    else: sh.line.color.rgb = line; sh.line.width = Pt(lw)
    return sh

def text(x, y, w, h, lines, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE):
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True; tf.vertical_anchor = anchor
    for m in ("margin_left","margin_right","margin_top","margin_bottom"): setattr(tf, m, 0)
    for i, (t, size, color, bold) in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; runs(p, t, size, color, bold)

def icon(name, cx, cy, size):
    path = os.path.join(ICON, name + ".png"); w, h = Image.open(path).size
    sw, sh = (size, size*h/w) if w >= h else (size*w/h, size)
    s.shapes.add_picture(path, Inches(cx-sw/2), Inches(cy-sh/2), Inches(sw), Inches(sh))

def node(x, y, w, h, ic, title, desc, accent, fill=WHITE, badge=None):
    b = rect(x, y, w, h, fill, accent[0], MSO_SHAPE.ROUNDED_RECTANGLE, lw=1.75); b.adjustments[0] = 0.07
    icon(ic, x+w/2, y+0.36, 0.44)
    text(x+0.08, y+0.66, w-0.16, h-0.74, [(title, 16, INK, True)] + [(d, 13, SUB, False) for d in desc], anchor=MSO_ANCHOR.TOP)
    if badge:
        bw = 0.62
        p = rect(x+w-bw-0.12, y-0.14, bw, 0.28, accent[0], None, MSO_SHAPE.ROUNDED_RECTANGLE); p.adjustments[0] = 0.5
        text(x+w-bw-0.12, y-0.14, bw, 0.28, [(badge, 12, WHITE, True)])

def arrow(x1, y1, x2, y2, color=EDGE):
    c = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    c.line.width = Pt(1.75); c.line.color.rgb = color
    ln = c.line._get_or_add_ln()
    ln.append(ln.makeelement(qn('a:tailEnd'), {'type':'triangle','w':'med','len':'med'}))

def elabel(x, y, w, t, color=EDGE, align=PP_ALIGN.LEFT, bold=False):
    text(x, y, w, 0.3, [(t, 13, color, bold)], align=align)

# ---- レーン ----
L, R, HEAD = 0.3, 13.03, 2.3
lanes = [(0.3, 2.05, "開発者", "GitHub の PR", VIOLET, "person_violet"),
         (2.05, 4.95, "GitHub Actions", "ワークフロー", BLUE, "github-actions"),
         (4.95, 7.2, "設定・出力", "ファイル", TEAL, "file-code_teal")]
for y0, y1, name, sub, acc, ic in lanes:
    rect(L, y0, R-L, y1-y0, acc[1])
    rect(L, y0, 0.09, y1-y0, acc[0])                       # 左端のアクセント帯
    icon(ic, L+0.62, (y0+y1)/2, 0.6)
    text(L+1.05, y0, HEAD-1.1, y1-y0, [(name, 17, acc[0], True), (sub, 13, SUB, False)], align=PP_ALIGN.LEFT)
frame = rect(L, 0.3, R-L, 6.9, None, BORDER, MSO_SHAPE.RECTANGLE)
c = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(L+HEAD), Inches(0.3), Inches(L+HEAD), Inches(7.2))
c.line.color.rgb = BORDER; c.line.width = Pt(1.25)

# ---- GitHub Actions レーン（左→右）----
W, H, GAP = 1.78, 1.95, 0.28
X0 = L + HEAD + 0.3
xs = [X0 + i*(W+GAP) for i in range(5)]
YA = 2.55
node(xs[0], YA, W, H, "github", "チェックアウト", ["`checkout`", "コードを取得"], BLUE)
node(xs[1], YA, W, H, "docker", "アプリを起動", ["`docker compose`", "`localhost:3000`"], BLUE)
node(xs[2], YA, W, H, "hourglass_blue", "起動を待つ", ["`curl` で確認", "最大 60 秒"], BLUE)
node(xs[3], YA, W, H, "report-search_orange", "Baseline Scan", ["1 分クロール", "応答を見るだけ", "攻撃は送らない"], ORANGE, fill=ORANGE[1], badge="ZAP")
node(xs[4], YA, W, H, "shield-check_blue", "判定", ["アラートを集計", "`fail_action`"], BLUE)
for i in range(4):
    arrow(xs[i]+W, YA+H/2, xs[i+1], YA+H/2)

# ---- 開発者レーン ----
Y1, H1 = 0.5, 1.35
node(xs[0], Y1, W, H1, "git-pull-request_violet", "PR を出す", [], VIOLET)
node(xs[4], Y1, W, H1, "circle-check_violet", "結果を見る", [], VIOLET)
text(xs[0], Y1+1.0, W, 0.3, [("コードを push", 13, SUB, False)])
text(xs[4], Y1+1.0, W, 0.3, [("PR のチェック欄", 13, SUB, False)])
arrow(xs[0]+W/2, Y1+H1, xs[0]+W/2, YA); elabel(xs[0]+W/2+0.1, 2.12, 1.4, "実行")
arrow(xs[4]+W/2, YA, xs[4]+W/2, Y1+H1)
text(xs[4]+W/2-1.6, 2.12, 1.5, 0.3, [("成功", 13, GREEN, True), ], align=PP_ALIGN.RIGHT)
# 「成功／失敗」を色分け
tb = s.shapes[-1].text_frame.paragraphs[0]; runs(tb, "／", 13, EDGE); runs(tb, "失敗", 13, RED, True)

# ---- 設定・出力レーン ----
Y3, H3 = 5.3, 1.6
node(xs[3], Y3, W, H3, "file-report_teal", "レポート", ["`zap_scan`"], TEAL)
node(xs[4], Y3, W, H3, "file-settings_teal", "判定ルール", ["`.zap/rules.tsv`"], TEAL)
arrow(xs[3]+W/2, YA+H, xs[3]+W/2, Y3); elabel(xs[3]+W/2+0.1, 4.95, 1.2, "保存")
arrow(xs[4]+W/2, Y3, xs[4]+W/2, YA+H); elabel(xs[4]+W/2-1.3, 4.95, 1.2, "読み込む", align=PP_ALIGN.RIGHT)

prs.save(out)
