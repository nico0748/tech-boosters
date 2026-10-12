import sys
from pptx import Presentation
from pptx.util import Emu, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from lxml import etree

OUT = sys.argv[1]
FONT = "Hiragino Sans"
MONO = "Menlo"
NAVY = RGBColor(0x24, 0x40, 0x4D)
SUB = RGBColor(0x5E, 0x76, 0x82)
GRAY_BG = RGBColor(0xF1, 0xF3, 0xF4)
GRAY_LN = RGBColor(0xC2, 0xCB, 0xD0)
TEAL_BG = RGBColor(0xE6, 0xF5, 0xF2)
TEAL = RGBColor(0x1A, 0xA6, 0x9A)
TEAL_D = RGBColor(0x0E, 0x7C, 0x72)
RED = RGBColor(0xD9, 0x43, 0x3B)
RED_BG = RGBColor(0xFB, 0xEB, 0xEA)
ORANGE = RGBColor(0xF0, 0x8A, 0x24)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)

IN = 914400
prs = Presentation()
prs.slide_width = Emu(12192000)
prs.slide_height = Emu(6858000)
BLANK = prs.slide_layouts[6]


def inch(v):
    return Emu(int(v * IN))


def text(slide, x, y, w, h, s, size, color=NAVY, bold=False, align=PP_ALIGN.LEFT,
         font=FONT, anchor=MSO_ANCHOR.TOP):
    tb = slide.shapes.add_textbox(inch(x), inch(y), inch(w), inch(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    lines = s.split("\n") if isinstance(s, str) else s
    for i, line in enumerate(lines):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.alignment = align
        segs = line if isinstance(line, list) else [(line, {})]
        for seg, opt in segs:
            r = para.add_run()
            r.text = seg
            r.font.name = opt.get("font", font)
            r.font.size = Pt(opt.get("size", size))
            r.font.bold = opt.get("bold", bold)
            r.font.color.rgb = opt.get("color", color)
            rpr = r._r.get_or_add_rPr()
            for tag in ("a:ea", "a:cs"):
                el = rpr.find(qn(tag))
                if el is None:
                    el = etree.SubElement(rpr, qn(tag))
                el.set("typeface", opt.get("font", font))
    return tb


def box(slide, x, y, w, h, fill, line=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE, lw=1.5, radius=0.08):
    sh = slide.shapes.add_shape(shape, inch(x), inch(y), inch(w), inch(h))
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
    if shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        sh.adjustments[0] = radius
    return sh


def arrow(slide, x1, y1, x2, y2, color=SUB, w=2.0):
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, inch(x1), inch(y1), inch(x2), inch(y2))
    c.line.color.rgb = color
    c.line.width = Pt(w)
    ln = c.line._get_or_add_ln()
    tail = etree.SubElement(ln, qn("a:tailEnd"))
    tail.set("type", "triangle")
    tail.set("w", "med")
    tail.set("len", "med")
    return c


def badge(slide, x, y, n, label):
    b = box(slide, x, y, 0.42, 0.42, ORANGE, radius=0.12)
    tf = b.text_frame
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    r = tf.paragraphs[0].add_run()
    r.text = str(n)
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.name = FONT
    r.font.color.rgb = WHITE
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    text(slide, x + 0.55, y + 0.02, 5.2, 0.42, label, 13, NAVY, anchor=MSO_ANCHOR.MIDDLE)


def header(slide, title, sub):
    # タイトル・サブタイトルは記事のキャプションに書くので、図には入れない
    pass


def center_vertically(slide):
    shapes = list(slide.shapes)
    top = min(sh.top for sh in shapes)
    bottom = max(sh.top + sh.height for sh in shapes)
    dy = (prs.slide_height - (bottom - top)) // 2 - top
    for sh in shapes:
        if hasattr(sh, "begin_y"):
            sh.begin_y = sh.begin_y + dy
            sh.end_y = sh.end_y + dy
        else:
            sh.top = sh.top + dy


# ---------- Slide 1: 全体像 ----------
s = prs.slides.add_slide(BLANK)
header(s, "ブラウザのHTMLパーサ：全体像",
       "サーバから届いたバイト列は、4つの段階を経て「画面」と「実行されるスクリプト」になる")

stages = [
    ("バイト列", "サーバからの応答", "3C 70 3E E3 81 93 …", GRAY_BG, GRAY_LN, SUB),
    ("① デコード", "文字コードに従って\n文字の並びにする", "< p > こ ん …", GRAY_BG, GRAY_LN, SUB),
    ("② トークナイザ", "字句解析。1文字ずつ読み\n「タグ」か「文字」かを決める", "StartTag(p)\nCharacter(こ) …", RED_BG, RED, RED),
    ("③ ツリー構築", "トークンを積み上げて\nDOMツリーを作る", "html > body > p\n  └ \"こんにちは\"", TEAL_BG, TEAL, TEAL_D),
]
x0, y0, bw, bh, gap = 0.5, 1.55, 2.75, 2.55, 0.42
for i, (t, d, ex, bg, ln, tc) in enumerate(stages):
    x = x0 + i * (bw + gap)
    box(s, x, y0, bw, bh, bg, ln)
    text(s, x + 0.18, y0 + 0.15, bw - 0.36, 0.4, t, 17, tc, bold=True)
    text(s, x + 0.18, y0 + 0.62, bw - 0.36, 0.8, d, 12, NAVY)
    box(s, x + 0.18, y0 + 1.52, bw - 0.36, 0.85, WHITE, ln, lw=1.0, radius=0.1)
    text(s, x + 0.28, y0 + 1.6, bw - 0.56, 0.7, ex, 11, NAVY, font=MONO, anchor=MSO_ANCHOR.MIDDLE)
    if i < len(stages) - 1:
        arrow(s, x + bw + 0.04, y0 + bh / 2, x + bw + gap - 0.04, y0 + bh / 2)

# 出口：DOMツリー → 描画 / script要素ならJSエンジン
ex_x = x0 + 3 * (bw + gap)
arrow(s, ex_x + bw / 2, y0 + bh + 0.02, ex_x + bw / 2, 4.55, TEAL_D)
box(s, ex_x - 0.05, 4.6, bw + 0.1, 0.62, WHITE, TEAL, radius=0.15)
text(s, ex_x, 4.6, bw, 0.62, "④ 描画（レイアウト・ペイント）", 12, TEAL_D, bold=True,
     align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
box(s, ex_x - 0.05, 5.35, bw + 0.1, 0.62, WHITE, RED, radius=0.15)
text(s, ex_x, 5.35, bw, 0.62, "script要素ならJSエンジンで実行", 12, RED, bold=True,
     align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

# トークナイザの強調コールアウト
cx = x0 + 2 * (bw + gap)
arrow(s, cx + bw / 2, y0 + bh + 0.02, cx + bw / 2, 4.55, RED)
box(s, 0.5, 4.6, cx + bw - 0.5, 1.37, RED_BG, RED, radius=0.08)
text(s, 0.75, 4.72, cx + bw - 1.0, 1.2, [
    [("「どこからどこまでがタグか」はトークナイザで決まる", {"bold": True, "color": RED, "size": 15})],
    [("サーバは文字列を埋め込んだだけ。それを「文字」と読むか「タグ」と読むかは、", {})],
    [("被害者のブラウザのトークナイザが、", {}), ("<", {"font": MONO, "bold": True, "color": RED}),
     ("を見た瞬間に決めている（SQLiでいう字句解析と同じ役割）", {})],
], 12, NAVY)

text(s, 0.5, 6.25, 11.5, 0.3,
     "参考：HTML Living Standard 13.2「Parsing HTML documents」（13.2.3 入力バイトストリーム / 13.2.5 トークン化 / 13.2.6 ツリー構築）",
     10, SUB)

# ---------- Slide 2: トークナイザの状態遷移 ----------
s = prs.slides.add_slide(BLANK)
header(s, "トークナイザは「状態」を切り替えながら1文字ずつ読む",
       "同じ「<」でも、生の文字で来るか文字参照（&lt;）で来るかで、たどる状態がまったく違う")

# 状態ノード
def state(x, y, w, name, en, kind):
    bg, ln, tc = {"data": (TEAL_BG, TEAL, TEAL_D), "tag": (RED_BG, RED, RED),
                  "ref": (GRAY_BG, GRAY_LN, SUB)}[kind]
    box(s, x, y, w, 0.95, bg, ln, radius=0.2)
    text(s, x, y + 0.13, w, 0.38, name, 15, tc, bold=True, align=PP_ALIGN.CENTER)
    text(s, x, y + 0.53, w, 0.3, en, 10, SUB, align=PP_ALIGN.CENTER)

# 上段：生の「<b>」が来たとき
text(s, 0.5, 1.45, 6, 0.35, [[("入力 ", {}), ("<b>太字</b>", {"font": MONO, "bold": True, "color": RED}),
                             ("　（生の < が来た場合）", {})]], 13, NAVY, bold=True)
sy = 1.95
state(0.5, sy, 2.3, "データ状態", "Data state", "data")
state(3.6, sy, 2.3, "タグ開始状態", "Tag open state", "tag")
state(6.7, sy, 2.3, "タグ名状態", "Tag name state", "tag")
box(s, 9.8, sy, 2.95, 0.95, WHITE, RED, radius=0.2)
text(s, 9.8, sy + 0.12, 2.95, 0.4, "StartTag(b) を出力", 14, RED, bold=True, align=PP_ALIGN.CENTER)
text(s, 9.8, sy + 0.52, 2.95, 0.35, "→ ツリーに b 要素ができる", 11, NAVY, align=PP_ALIGN.CENTER)
for x1, x2, lab in [(2.8, 3.6, "<"), (5.9, 6.7, "b"), (9.0, 9.8, ">")]:
    arrow(s, x1 + 0.03, sy + 0.475, x2 - 0.03, sy + 0.475, RED)
    text(s, x1, sy + 0.05, x2 - x1, 0.35, lab, 15, RED, bold=True, align=PP_ALIGN.CENTER, font=MONO)

# 下段：「&lt;b&gt;」が来たとき
text(s, 0.5, 3.35, 7, 0.35, [[("入力 ", {}), ("&lt;b&gt;太字", {"font": MONO, "bold": True, "color": TEAL_D}),
                             ("　（エスケープされて来た場合）", {})]], 13, NAVY, bold=True)
sy2 = 3.85
state(0.5, sy2, 2.3, "データ状態", "Data state", "data")
state(3.6, sy2, 2.3, "文字参照状態", "Character reference state", "ref")
box(s, 6.7, sy2, 2.3, 0.95, WHITE, TEAL, radius=0.2)
text(s, 6.7, sy2 + 0.12, 2.3, 0.4, "Character(<) を出力", 13, TEAL_D, bold=True, align=PP_ALIGN.CENTER)
text(s, 6.7, sy2 + 0.52, 2.3, 0.35, "ただの「文字」として", 11, NAVY, align=PP_ALIGN.CENTER)
box(s, 9.8, sy2, 2.95, 0.95, WHITE, TEAL, radius=0.2)
text(s, 9.8, sy2 + 0.12, 2.95, 0.4, "データ状態に戻る", 14, TEAL_D, bold=True, align=PP_ALIGN.CENTER)
text(s, 9.8, sy2 + 0.52, 2.95, 0.35, "→ 画面に「<b>太字」と表示", 11, NAVY, align=PP_ALIGN.CENTER)
for x1, x2, lab in [(2.8, 3.6, "&"), (5.9, 6.7, "lt;"), (9.0, 9.8, "")]:
    arrow(s, x1 + 0.03, sy2 + 0.475, x2 - 0.03, sy2 + 0.475, TEAL_D)
    if lab:
        text(s, x1, sy2 + 0.05, x2 - x1, 0.35, lab, 15, TEAL_D, bold=True, align=PP_ALIGN.CENTER, font=MONO)

badge(s, 0.5, 5.2, 1, "トークナイザは「今どの状態か」と「次の1文字」だけで動く")
badge(s, 6.7, 5.2, 2, "タグ開始状態に入れるのは、生の「<」だけ")
badge(s, 0.5, 5.75, 3, "&lt; は文字参照状態を通り、「<」という文字として出てくる")
badge(s, 6.7, 5.75, 4, "<script> の中身は専用の状態（Script data state）で読まれる")

text(s, 0.5, 6.4, 11.5, 0.3,
     "参考：HTML Living Standard 13.2.5「Tokenization」（13.2.5.1 Data state / 13.2.5.6 Tag open state / 13.2.5.77 Character reference state）",
     10, SUB)

# ---------- Slide 3: エスケープの有無でDOMツリーがどう変わるか ----------
s = prs.slides.add_slide(BLANK)

# テンプレート
box(s, 3.17, 0.5, 7.0, 0.6, WHITE, GRAY_LN, radius=0.2)
text(s, 3.17, 0.5, 7.0, 0.6, [[("サーバのテンプレート　", {"font": FONT, "size": 12, "color": SUB}),
                              ("<p>こんにちは、", {}), ("{name}", {"color": ORANGE, "bold": True}), ("さん</p>", {})]],
     15, NAVY, font=MONO, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)


def column(x, w, kind, name_in, html_parts, tokens, tree):
    bg, ln, tc = (RED_BG, RED, RED) if kind == "raw" else (TEAL_BG, TEAL, TEAL_D)
    box(s, x, 1.4, w, 5.05, bg, ln, radius=0.04)
    label = "エスケープしない場合" if kind == "raw" else "エスケープした場合"
    text(s, x + 0.25, 1.52, w - 0.5, 0.4, label, 16, tc, bold=True)
    # 入力
    text(s, x + 0.25, 2.0, w - 0.5, 0.35, [[("name = ", {"font": MONO}), (name_in, {"font": MONO, "bold": True, "color": tc})]], 13, NAVY)
    # 埋め込み後のHTML
    text(s, x + 0.25, 2.45, w - 0.5, 0.3, "埋め込み後のHTML", 11, SUB, bold=True)
    box(s, x + 0.25, 2.75, w - 0.5, 0.5, WHITE, ln, lw=1.0, radius=0.12)
    text(s, x + 0.35, 2.75, w - 0.7, 0.5, [html_parts], 11.5, NAVY, font=MONO, anchor=MSO_ANCHOR.MIDDLE)
    # トークン列
    text(s, x + 0.25, 3.4, w - 0.5, 0.3, "② トークナイザが出すトークン", 11, SUB, bold=True)
    ty = 3.7
    for t, hot in tokens:
        lines = t.count("\n") + 1
        th = 0.3 if lines == 1 else 0.52
        tw = 0.12 * max(len(l) for l in t.split("\n")) + 0.3
        tw = min(tw, w / 2 - 0.4)
        b = box(s, x + 0.25, ty, tw, th, WHITE if not hot else RED, ln if not hot else None, lw=1.0, radius=0.25)
        text(s, x + 0.25, ty, tw, th, t, 10, WHITE if hot else NAVY, font=MONO,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        ty += th + 0.06
    # DOMツリー
    tx = x + w / 2 + 0.05
    text(s, tx, 3.4, w / 2 - 0.3, 0.3, "③ できるDOMツリー", 11, SUB, bold=True)
    box(s, tx, 3.7, w / 2 - 0.3, 2.55, WHITE, ln, lw=1.0, radius=0.06)
    text(s, tx + 0.15, 3.82, w / 2 - 0.6, 2.9, tree, 11, NAVY, font=MONO)


W = 6.05
column(0.5, W, "raw", "<b>Nico</b>",
       [("<p>こんにちは、", {}), ("<b>", {"color": RED, "bold": True}), ("Nico", {}),
        ("</b>", {"color": RED, "bold": True}), ("さん</p>", {})],
       [("StartTag p", False), ("Char こんにちは、", False), ("StartTag b", True),
        ("Char Nico", False), ("EndTag b", True), ("Char さん", False), ("EndTag p", False)],
       [[("<p>", {})], [("├ \"こんにちは、\"", {})], [("├ ", {}), ("<b>", {"color": RED, "bold": True})],
        [("│ └ \"Nico\"", {})], [("└ \"さん\"", {})], [("", {})],
        [("要素が1つ増えた", {"font": FONT, "color": RED, "bold": True})]])
column(0.5 + W + 0.23, W, "esc", "&lt;b&gt;Nico&lt;/b&gt;",
       [("<p>こんにちは、", {}), ("&lt;b&gt;", {"color": TEAL_D, "bold": True}), ("Nico", {}),
        ("&lt;/b&gt;", {"color": TEAL_D, "bold": True}), ("さん</p>", {})],
       [("StartTag p", False), ("Char こんにちは、\n<b>Nico</b>さん", False), ("EndTag p", False)],
       [[("<p>", {})], [("└ \"こんにちは、", {})], [("   <b>Nico</b>さん\"", {})], [("", {})],
        [("テキスト1つのまま", {"font": FONT, "color": TEAL_D, "bold": True})]])

# ---------- Slide 4: エスケープは何をしているか ----------
s = prs.slides.add_slide(BLANK)

# 左：置き換え表
text(s, 0.5, 0.6, 6.2, 0.4, "html.escape() が置き換える5文字（上から順に実行）", 14, NAVY, bold=True)
rows = [("&", "&amp;", "必ず最初"), ("<", "&lt;", ""), (">", "&gt;", ""), ('"', "&quot;", "quote=True のとき"), ("'", "&#x27;", "quote=True のとき")]
ry = 1.15
for i, (src, dst, note) in enumerate(rows):
    hot = i == 0
    box(s, 0.5, ry, 1.0, 0.62, RED_BG, RED, radius=0.2)
    text(s, 0.5, ry, 1.0, 0.62, src, 22, RED, bold=True, font=MONO, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    arrow(s, 1.58, ry + 0.31, 2.22, ry + 0.31, SUB)
    box(s, 2.3, ry, 1.9, 0.62, TEAL_BG, TEAL, radius=0.2)
    text(s, 2.3, ry, 1.9, 0.62, dst, 18, TEAL_D, bold=True, font=MONO, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    if note:
        text(s, 4.35, ry, 2.4, 0.62, note, 12, ORANGE if hot else SUB, bold=hot, anchor=MSO_ANCHOR.MIDDLE)
    ry += 0.78

# 右上：なぜ & が最初か
rx, rw = 7.0, 5.83
box(s, rx, 0.6, rw, 2.75, GRAY_BG, GRAY_LN, radius=0.06)
text(s, rx + 0.25, 0.72, rw - 0.5, 0.4, "なぜ「&」を最初に置き換えるのか", 14, NAVY, bold=True)
text(s, rx + 0.25, 1.22, rw - 0.5, 0.3, "順番を逆にすると（< を先に置き換えると）", 11, SUB)
text(s, rx + 0.25, 1.55, rw - 0.5, 0.45, [[("<", {"color": RED, "bold": True}), ("  →  ", {"font": FONT, "color": SUB}),
                                        ("&lt;", {}), ("  →  ", {"font": FONT, "color": SUB}),
                                        ("&amp;lt;", {"color": RED, "bold": True})]], 15, NAVY, font=MONO)
text(s, rx + 0.25, 2.05, rw - 0.5, 0.3, "自分が作った & まで置き換えてしまい、画面に「&lt;」と出る", 11, RED)
text(s, rx + 0.25, 2.5, rw - 0.5, 0.3, "& を先に置き換えれば", 11, SUB)
text(s, rx + 0.25, 2.8, rw - 0.5, 0.45, [[("<", {"color": NAVY, "bold": True}), ("  →  ", {"font": FONT, "color": SUB}),
                                        ("&lt;", {"color": TEAL_D, "bold": True}), ("　画面には「<」と出る", {"font": FONT, "size": 11, "color": TEAL_D})]], 15, NAVY, font=MONO)

# 右下：要点
box(s, rx, 3.55, rw, 1.95, WHITE, TEAL, radius=0.06)
text(s, rx + 0.25, 3.7, rw - 0.5, 2.0, [
    [("エスケープ ＝ 文字を消すことではない", {"bold": True, "color": TEAL_D, "size": 14})],
    [("", {"size": 6})],
    [("トークナイザが特別扱いする文字を、", {})],
    [("文字参照（", {}), ("&lt;", {"font": MONO, "bold": True}), (" など）に言い換えるだけ。", {})],
    [("", {"size": 6})],
    [("文字参照はトークナイザの中で「ただの文字」に戻るので、", {})],
    [("画面には元の文字がそのまま表示される", {})],
], 12, NAVY)

# ---------- Slide 5: 埋め込む場所でルールが変わる ----------
s = prs.slides.add_slide(BLANK)
cols = [("埋め込む場所", 2.75), ("トークナイザの状態", 2.55), ("そこから抜け出す文字", 2.15), ("文字参照", 1.3), ("必要な対策", 3.58)]
gx, gy = 0.5, 0.6
x = gx
for name, w in cols:
    box(s, x, gy, w - 0.06, 0.5, NAVY, None, radius=0.12)
    text(s, x, gy, w - 0.06, 0.5, name, 12, WHITE, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    x += w
data = [
    ("本文", "<p>{v}</p>", "Data state", "<", "解釈される", "HTMLエスケープ", "ok"),
    ("属性値", 'title="{v}"', "Attribute value\n(double-quoted) state", '"', "解釈される", "HTMLエスケープ（\" を含む）\n＋ 属性値は必ず \" で囲む", "ok"),
    ("script要素の中", "<script>…{v}…</script>", "Script data state", "</script", "解釈されない", "HTMLエスケープは効かない\nJSONにして < を \\u003c にする", "ng"),
    ("URLを入れる属性", 'href="{v}"', "Attribute value state\n→ その後URLとして解釈", "（抜け出さない）", "解釈される", "HTMLエスケープだけでは足りない\nスキームを http / https に限定", "ng"),
]
ry = gy + 0.6
for place, code, st, esc, ref, fix, kind in data:
    rh = 1.08
    bg, ln, tc = (TEAL_BG, TEAL, TEAL_D) if kind == "ok" else (RED_BG, RED, RED)
    x = gx
    for ci, (name, w) in enumerate(cols):
        box(s, x, ry, w - 0.06, rh, WHITE if ci not in (0, 4) else bg, ln if ci in (0, 4) else GRAY_LN, lw=1.0, radius=0.08)
        x += w
    x = gx
    w0 = cols[0][1] - 0.06
    text(s, x + 0.12, ry + 0.14, w0 - 0.24, 0.35, place, 13, tc, bold=True)
    text(s, x + 0.12, ry + 0.55, w0 - 0.24, 0.4, code, 10.5, NAVY, font=MONO)
    x += cols[0][1]
    text(s, x + 0.1, ry, cols[1][1] - 0.26, rh, st, 11, NAVY, anchor=MSO_ANCHOR.MIDDLE, align=PP_ALIGN.CENTER)
    x += cols[1][1]
    text(s, x, ry, cols[2][1] - 0.06, rh, esc, 15 if len(esc) < 4 else 13, RED, bold=True,
         font=MONO if esc[0] in '<"' else FONT, anchor=MSO_ANCHOR.MIDDLE, align=PP_ALIGN.CENTER)
    x += cols[2][1]
    text(s, x, ry, cols[3][1] - 0.06, rh, ref, 11, RED if ref == "解釈されない" else NAVY, bold=ref == "解釈されない",
         anchor=MSO_ANCHOR.MIDDLE, align=PP_ALIGN.CENTER)
    x += cols[3][1]
    text(s, x + 0.15, ry, cols[4][1] - 0.36, rh, fix, 11.5, tc, bold=True, anchor=MSO_ANCHOR.MIDDLE)
    ry += rh + 0.1

text(s, gx, ry + 0.08, 12.3, 0.3,
     "参考：HTML Living Standard 13.2.5.1 Data state / 13.2.5.4 Script data state / 13.2.5.36 Attribute value (double-quoted) state",
     10, SUB)

# ---------- Slide 6: 格納型XSSの流れ（攻撃者・サーバ・被害者のブラウザ・被害者の見え方） ----------
s = prs.slides.add_slide(BLANK)
lanes = [("攻撃者", RED, RED_BG, RED), ("Webアプリ（サーバ）", TEAL, TEAL_BG, TEAL_D),
         ("被害者のブラウザの中", GRAY_LN, GRAY_BG, NAVY), ("被害者に見えていること", ORANGE, WHITE, ORANGE)]
lx0, lw, lgap = 1.0, 2.88, 0.1
ly0 = 0.45
for i, (name, ln, bg, tc) in enumerate(lanes):
    x = lx0 + i * (lw + lgap)
    box(s, x, ly0, lw, 0.5, tc, None, radius=0.15)
    text(s, x, ly0, lw, 0.5, name, 13, WHITE, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

steps = [
    ["掲示板に、スクリプトを\n含む文字列を投稿する", "投稿をそのまま\nDBに保存する", None, None],
    ["あとは待つだけ", None, None, "いつもの掲示板を\n開く"],
    [None, "保存された投稿を\nエスケープせずに\nHTMLへ埋め込んで返す", "トークナイザが生の < を\n読み、script要素ができる", "いつも通りのページ"],
    [None, None, "スクリプトが「そのサイトの\nページの一部」として動き、\nCookieや画面の情報を読む", "何も起きていない\nように見える"],
    ["受け取った情報で\n被害者になりすます", None, "読んだ情報を、\n攻撃者のサーバへ送る", "気づかない"],
]
sy0, sh_, sgap = 1.08, 0.98, 0.1
for r, row in enumerate(steps):
    y = sy0 + r * (sh_ + sgap)
    # 手順番号
    b = box(s, 0.45, y + sh_ / 2 - 0.21, 0.42, 0.42, NAVY, radius=0.5)
    text(s, 0.45, y + sh_ / 2 - 0.21, 0.42, 0.42, str(r + 1), 14, WHITE, bold=True,
         align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    for i, cell in enumerate(row):
        x = lx0 + i * (lw + lgap)
        name, ln, bg, tc = lanes[i]
        if cell is None:
            box(s, x, y, lw, sh_, None, RGBColor(0xE4, 0xE8, 0xEA), lw=0.75, radius=0.1)
            continue
        box(s, x, y, lw, sh_, bg, ln, lw=1.5, radius=0.1)
        text(s, x + 0.1, y, lw - 0.2, sh_, cell, 11.5, tc if i != 2 else NAVY, bold=(i == 3),
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

# ---------- Slide 7: 反射型・格納型・DOM型の違い ----------
s = prs.slides.add_slide(BLANK)
cols = [("種類", 1.9), ("罠を仕込む場所", 3.3), ("文字列をHTMLに入れるのは", 3.4), ("被害者が踏むきっかけ", 3.73)]
gx, gy = 0.5, 0.6
x = gx
for name, w in cols:
    box(s, x, gy, w - 0.06, 0.5, NAVY, None, radius=0.12)
    text(s, x, gy, w - 0.06, 0.5, name, 12, WHITE, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    x += w
data = [
    ("反射型", "罠URLのクエリ（? 以降）", "サーバ\nリクエストの値を、\nそのまま応答のHTMLに入れる", "攻撃者が送った罠URLを\n被害者がクリックする", "server"),
    ("格納型", "掲示板の投稿など、\nサーバに保存されるデータ", "サーバ\n保存したデータを、\nページのHTMLに入れる", "いつものページを開くだけ\n（罠URLすら要らない）", "server"),
    ("DOM型", "URLの # 以降など、\nページ内のJSが読む場所", "ブラウザ上のJavaScript\n読んだ値を、\ninnerHTML などでDOMに入れる", "罠URLをクリックする\n（# 以降はサーバに送られない）", "client"),
]
ry = gy + 0.6
for kind, where, who, trig, side in data:
    rh = 1.25
    x = gx
    for ci, (name, w) in enumerate(cols):
        if ci == 0:
            box(s, x, ry, w - 0.06, rh, RED_BG, RED, lw=1.5, radius=0.1)
            text(s, x, ry, w - 0.06, rh, kind, 16, RED, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        else:
            hot = ci == 2
            bg, ln = ((TEAL_BG, TEAL) if side == "server" else (GRAY_BG, NAVY)) if hot else (WHITE, GRAY_LN)
            box(s, x, ry, w - 0.06, rh, bg, ln, lw=1.5 if hot else 1.0, radius=0.08)
            val = [where, who, trig][ci - 1]
            lines = val.split("\n")
            segs = [[(lines[0], {"bold": True, "color": (TEAL_D if side == "server" else NAVY) if hot else NAVY})]]
            segs += [[(l, {"size": 11})] for l in lines[1:]]
            if not hot:
                segs = [[(l, {})] for l in lines]
            text(s, x + 0.15, ry, w - 0.36, rh, segs, 13 if hot else 12, NAVY, anchor=MSO_ANCHOR.MIDDLE)
        x += w
    ry += rh + 0.1
box(s, gx, ry + 0.05, 12.3, 0.62, WHITE, ORANGE, radius=0.2)
text(s, gx + 0.25, ry + 0.05, 11.8, 0.62,
     "どの型でも、最後にスクリプトが動くのは被害者のブラウザの中。違うのは「罠の置き場所」と「誰がHTMLに入れるか」",
     13, NAVY, bold=True, anchor=MSO_ANCHOR.MIDDLE)

# ---------- Slide 8〜10: 3タイプのデータフロー図 ----------
# ノード位置（x, y, w, h）。WebサーバとDBは離して配置する
SRV = (4.3, 0.6, 1.9, 1.05)
DB  = (7.25, 0.6, 1.3, 1.05)
ATK = (0.55, 4.05, 2.3, 1.05)
COL = (0.55, 5.85, 2.7, 1.0)
VIC = (8.7, 3.2, 4.1, 3.65)
INNER = (8.95, 3.95, 3.6, 1.55)


def flab(slide, x, y, w, txt, color):
    lines_n = txt.count("\n") + 1
    h = 0.42 if lines_n == 1 else 0.68
    box(slide, x, y, w, h, WHITE, color, lw=1.2, radius=0.2)
    text(slide, x + 0.08, y, w - 0.16, h, txt, 11, NAVY, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)


def dfd_nodes(slide, db_active):
    sx, sy, sw, sh = SRV
    box(slide, sx, sy, sw, sh, TEAL_BG, TEAL, lw=2.0, radius=0.12)
    text(slide, sx, sy, sw, sh, "Webサーバ", 14, TEAL_D, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    dx, dy, dw, dh = DB
    dbg, dln, dtc = (TEAL_BG, TEAL, TEAL_D) if db_active else (GRAY_BG, GRAY_LN, SUB)
    box(slide, dx, dy, dw, dh, dbg, dln, lw=2.0, radius=0.12)
    text(slide, dx, dy, dw, dh, "DB", 14, dtc, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    ax, ay, aw, ah = ATK
    box(slide, ax, ay, aw, ah, RED_BG, RED, lw=2.0, radius=0.12)
    text(slide, ax, ay, aw, ah, "攻撃者", 14, RED, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    cx, cy, cw, ch = COL
    box(slide, cx, cy, cw, ch, RED_BG, RED, lw=2.0, radius=0.12)
    text(slide, cx, cy, cw, ch, "攻撃者の回収サーバ", 13, RED, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    vx, vy, vw, vh = VIC
    box(slide, vx, vy, vw, vh, GRAY_BG, NAVY, lw=2.0, radius=0.06)
    text(slide, vx, vy + 0.15, vw, 0.4, "被害者のブラウザ", 14, NAVY, bold=True, align=PP_ALIGN.CENTER)


def dfd_inner(slide, step, body):
    ix, iy, iw, ih = INNER
    box(slide, ix, iy, iw, ih, RED_BG, RED, lw=1.8, radius=0.1)
    text(slide, ix + 0.15, iy + 0.1, iw - 0.3, 0.7, step, 12, RED, bold=True)
    text(slide, ix + 0.15, iy + 0.82, iw - 0.3, 0.65, body, 11, NAVY, anchor=MSO_ANCHOR.MIDDLE)
    text(slide, VIC[0] + 0.05, 5.7, VIC[2] - 0.1, 0.9,
         "→ Cookie・画面の情報を読み、\n   攻撃者の回収サーバへ送る", 11, NAVY, align=PP_ALIGN.CENTER)


def draw_dfd(slide, db_active, arrows, labels, inner, note):
    # 1) ノード 2) 矢印 3) 吹き出し（必ず矢印より上のレイヤーに来るよう最後に描く）
    dfd_nodes(slide, db_active)
    for p1, p2, color in arrows:
        arrow(slide, p1[0], p1[1], p2[0], p2[1], color)
    dfd_inner(slide, inner[0], inner[1])
    for x, y, w, txt, color in labels:
        flab(slide, x, y, w, txt, color)
    text(slide, 0.5, 0.15, 12.3, 0.3, note, 11, SUB)


# --- 反射型 ---
s = prs.slides.add_slide(BLANK)
draw_dfd(
    s, False,
    arrows=[
        ((2.85, 4.5), (8.7, 4.9), RED),
        ((9.5, 3.2), (5.9, 1.65), SUB),
        ((5.6, 1.65), (9.0, 3.2), RED),
        ((9.4, 6.85), (3.25, 6.4), RED),
    ],
    labels=[
        (3.1, 3.3, 3.4, "① 罠URL（?q=スクリプト）を\nメールやSNSで送る", RED),
        (8.6, 2.2, 3.4, "② 罠URLでアクセス", SUB),
        (3.5, 1.95, 4.0, "③ クエリの値をそのまま応答のHTMLに入れて返す", RED),
        (4.4, 5.95, 3.4, "⑤ 盗んだ情報を攻撃者へ送信", RED),
    ],
    inner=("④ HTMLパーサがscript要素を作り実行", "届いたHTMLの中に\nscript要素ができてしまう"),
    note="点線の DB はこの型では使われない。罠の文字列はサーバを素通りして（保存されず）すぐ応答に反射される",
)

# --- 格納型 ---
s = prs.slides.add_slide(BLANK)
draw_dfd(
    s, True,
    arrows=[
        ((2.85, 4.2), (5.0, 1.65), RED),
        ((6.2, 1.0), (7.25, 1.0), RED),
        ((9.5, 3.2), (5.9, 1.65), SUB),
        ((5.6, 1.65), (9.0, 3.2), RED),
        ((9.4, 6.85), (3.25, 6.4), RED),
    ],
    labels=[
        (1.0, 2.55, 3.0, "① スクリプトを含む\n投稿を送る", RED),
        (6.75, 1.82, 2.1, "② そのまま保存", RED),
        (8.6, 2.35, 3.4, "③ いつものページを開く", SUB),
        (3.5, 3.1, 4.2, "④ 保存データをHTMLに入れて応答", RED),
        (4.4, 5.95, 3.4, "⑥ 盗んだ情報を攻撃者へ送信", RED),
    ],
    inner=("⑤ HTMLパーサがscript要素を作り実行", "保存された投稿が\nscript要素になる"),
    note="罠は DB に保存される。被害者は罠URLすら踏まず、普通にページを開くだけで発動する",
)

# --- DOM型 ---
s = prs.slides.add_slide(BLANK)
draw_dfd(
    s, False,
    arrows=[
        ((2.85, 4.5), (8.7, 4.9), RED),
        ((9.5, 3.2), (5.9, 1.65), SUB),
        ((5.6, 1.65), (9.0, 3.2), SUB),
        ((9.4, 6.85), (3.25, 6.4), RED),
    ],
    labels=[
        (3.1, 3.3, 3.4, "① 罠URL（#スクリプト）を\nメールやSNSで送る", RED),
        (8.5, 2.2, 3.6, "② ページを取得（# 以降は送らない）", SUB),
        (3.4, 1.95, 4.0, "③ 普通のページ（JS入り）を応答", SUB),
        (4.4, 5.95, 3.4, "⑤ 盗んだ情報を攻撃者へ送信", RED),
    ],
    inner=("④ ページ内のJSが # を読み、innerHTML でDOMに入れて実行",
           "文字列をHTMLに入れるのは\nサーバではなくブラウザ上のJS"),
    note="文字列をHTMLに入れるのはサーバではなくブラウザ上のJavaScript。# 以降はサーバに届かない",
)

# 記事の順番に並べ替える（ビルド順→目的の順のインデックス）
# ビルド順: 0全体像 1トークナイザ 2DOMツリー 3エスケープ中身 4場所 5格納型流れ 6三型違い 7反射DFD 8格納DFD 9DOM DFD
order = [5, 6, 7, 8, 9, 0, 1, 2, 3, 4]
sld = prs.slides._sldIdLst
ids = list(sld)
for el in ids:
    sld.remove(el)
for i in order:
    sld.append(ids[i])


for i, sl in enumerate(prs.slides):
    center_vertically(sl)

prs.save(OUT)
print("saved", OUT)


