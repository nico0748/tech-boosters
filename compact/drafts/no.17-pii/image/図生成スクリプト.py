# -*- coding: utf-8 -*-
"""compact no.17 PII の図（3枚）を生成する。

使い方: python3 図生成スクリプト.py <出力ディレクトリ> <tabler outline svg ディレクトリ>
- 01_PIIの分類.pptx
- 02_PIIと個人情報とpersonal_dataの範囲.pptx
- 03_マスキングと仮名化と匿名化の違い.pptx
デザインは writing-guides/figure-reference（スイムレーン・レーンごとのアクセント色・アイコン）に合わせる。
文字サイズ：レーン名 20pt／ノード見出し 17pt／説明・ラベル 15pt（最小 15pt）。
記事幅（約750px）に縮めても本文が約12pxになるよう、13.333in 幅の台紙で 15pt 以上にしている。
"""
import os
import sys

import cairosvg
from lxml import etree
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

OUT = sys.argv[1]
SVG_DIR = sys.argv[2]
ICON_DIR = os.path.join(OUT, "icons")
os.makedirs(os.path.join(ICON_DIR, "svg"), exist_ok=True)

W, H = 13.333, 7.5
JP = "Noto Sans JP"
MONO = "Noto Sans Mono"

# 文字サイズ
F_LANE, F_TITLE, F_BODY = 20, 17, 15

INK = "1F2937"
SUB = "4B5563"
ARROW = "555555"
GREEN = "2E7D32"
SLATE = "3D4651"
FRAME = "D5D9E0"
AMBER = "C77700"

PURPLE = ("7C4DDB", "F5F1FD")
BLUE = ("1F5FC8", "EEF4FD")
TEAL = ("0F766E", "EAF6F4")
ORANGE = ("E07B1A", "FFF4E6")


def rgb(h):
    return RGBColor.from_string(h)


def is_ascii(s):
    return all(ord(c) < 128 for c in s)


def icon(name, color):
    """Tabler の svg をアクセント色に塗って png にする（記事の image/icons/ に残す）。"""
    src = os.path.join(SVG_DIR, name + ".svg")
    raw = open(src, encoding="utf-8").read()
    open(os.path.join(ICON_DIR, "svg", f"{name}.svg"), "w", encoding="utf-8").write(raw)
    png = os.path.join(ICON_DIR, f"{name}_{color}.png")
    if not os.path.exists(png):
        cairosvg.svg2png(bytestring=raw.replace("currentColor", "#" + color).encode(),
                         write_to=png, output_width=256, output_height=256)
    return png


def set_font(run, size, color=INK, bold=False, font=JP):
    f = run.font
    f.size = Pt(size)
    f.bold = bold
    f.color.rgb = rgb(color)
    f.name = font
    rpr = run._r.get_or_add_rPr()
    for tag in ("a:ea", "a:cs"):
        el = rpr.find(qn(tag))
        if el is None:
            el = etree.SubElement(rpr, qn(tag))
        el.set("typeface", JP)


def no_shadow(shp):
    """影を消す（effectLst を空にし、テーマの effectRef も 0 にする）"""
    etree.SubElement(shp._element.spPr, qn("a:effectLst"))
    for er in shp._element.iter(qn("a:effectRef")):
        er.set("idx", "0")


def box(slide, x, y, w, h, fill=None, line=None, lw=1.75, radius=0.1, dash=False):
    shp = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE,
                                 Inches(x), Inches(y), Inches(w), Inches(h))
    if radius:
        shp.adjustments[0] = min(0.5, radius / min(w, h))
    if fill:
        shp.fill.solid()
        shp.fill.fore_color.rgb = rgb(fill)
    else:
        shp.fill.background()
    if line:
        shp.line.color.rgb = rgb(line)
        shp.line.width = Pt(lw)
        if dash:
            shp.line.dash_style = 4
    else:
        shp.line.fill.background()
    no_shadow(shp)
    return shp


def T(s, size=F_BODY, color=INK, bold=False, font=None):
    return (s, size, color, bold, font or (JP if not is_ascii(s) else JP))


def text(slide, x, y, w, h, paras, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
         spacing=1.05):
    """paras: [[T(...), ...], ...]"""
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = Inches(0.02)
    tf.margin_top = tf.margin_bottom = Inches(0.0)
    tf.vertical_anchor = anchor
    for i, runs in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = spacing
        for s, size, color, bold, font in runs:
            run = p.add_run()
            run.text = s
            set_font(run, size, color, bold, font)
    return tb


def arrow(slide, x1, y1, x2, y2, color=ARROW, lw=2.25, head=True, dash=False):
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1),
                                   Inches(x2), Inches(y2))
    c.line.color.rgb = rgb(color)
    c.line.width = Pt(lw)
    if dash:
        c.line.dash_style = 4
    if head:
        ln = c.line._get_or_add_ln()
        te = etree.SubElement(ln, qn("a:tailEnd"))
        te.set("type", "triangle")
        te.set("w", "lg")
        te.set("len", "lg")
    return c


def pic(slide, path, x, y, size):
    slide.shapes.add_picture(path, Inches(x), Inches(y), Inches(size), Inches(size))


def new_slide():
    prs = Presentation()
    prs.slide_width = Inches(W)
    prs.slide_height = Inches(H)
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg = s.background.fill
    bg.solid()
    bg.fore_color.rgb = rgb("FFFFFF")
    return prs, s


LX = 0.25
LW = W - 0.5


def lanes(slide, top, specs, heights, head):
    """specs: [(name, sub, icon_name, (accent, pale))]。name/sub は \\n で改行。"""
    ys = []
    y = top
    for (name, sub, ic, (acc, pale)), h in zip(specs, heights):
        box(slide, LX, y, LW, h, fill=pale, radius=0)
        box(slide, LX, y, 0.09, h, fill=acc, radius=0)
        arrow(slide, LX + head, y, LX + head, y + h, color="FFFFFF", lw=2.0, head=False)
        # アイコンを名前の上に積んで中央揃え
        nl = name.count("\n") + 1
        sl = sub.count("\n") + 1 if sub else 0
        block = 0.5 + 0.08 + nl * 0.36 + sl * 0.29
        by = y + (h - block) / 2
        pic(slide, icon(ic, acc), LX + 0.09 + (head - 0.09) / 2 - 0.25, by, 0.5)
        paras = [[T(l, F_LANE, acc, True)] for l in name.split("\n")]
        paras += [[T(l, F_BODY, SUB)] for l in sub.split("\n")] if sub else []
        text(slide, LX + 0.12, by + 0.58, head - 0.15, block - 0.5, paras,
             anchor=MSO_ANCHOR.TOP, spacing=1.0)
        ys.append((y, h))
        y += h
    box(slide, LX, top, LW, sum(heights), line=FRAME, lw=1.0, radius=0)
    return ys


def node(slide, x, y, w, h, title, desc, acc, ic=None, fill="FFFFFF", title_color=INK,
         desc_color=SUB, lw=1.75, line=None):
    box(slide, x, y, w, h, fill=fill, line=line or acc, lw=lw, radius=0.1)
    ty = y + 0.18
    if ic:
        ics = ic if isinstance(ic, tuple) else (ic,)
        n = len(ics)
        for k, one in enumerate(ics):
            pic(slide, icon(one, acc), x + w / 2 - 0.22 * n - 0.03 * (n - 1) + k * 0.5, ty, 0.44)
        ty += 0.5
    paras = [[T(title, F_TITLE, title_color, True)]]
    for d in desc:
        paras.append([T(d, F_BODY, desc_color)])
    text(slide, x + 0.05, ty, w - 0.1, y + h - ty - 0.08, paras, anchor=MSO_ANCHOR.TOP)


def label(slide, xc, y, s, w=1.4, color=SUB, bold=False):
    """矢印の上に置く注釈（xc を中心に）"""
    text(slide, xc - w / 2, y, w, 0.32, [[T(s, F_BODY, color, bold)]])


# ============================================================
# 図1：PIIの分類（直接識別子／準識別子／関連情報 → 特定の個人）
# ============================================================
def fig1():
    prs, s = new_slide()
    head = 1.9
    cx0 = LX + head + 0.2
    top = 0.25
    hs = [2.333, 2.334, 2.333]
    L = lanes(s, top, [
        ("直接識別子", "単体で特定", "user-scan", PURPLE),
        ("準識別子", "組合せで特定", "puzzle", BLUE),
        ("関連情報", "識別子と\n連結可能", "file-text", TEAL),
    ], hs, head)
    nw, nh, gap, pad = 1.72, 1.66, 0.45, 0.1
    rx, rw = 11.58, 1.3
    col = [cx0 + pad + i * (nw + gap) for i in range(4)]
    lab_x0 = col[3] + nw  # 注釈の列をそろえる基準

    # 結果ノード（3レーンをまたぐ）
    ry0, ry1 = L[0][0] + 0.3, L[2][0] + L[2][1] - 0.3
    box(s, rx, ry0, rw, ry1 - ry0, fill=SLATE, line=SLATE, radius=0.1)
    ym = (ry0 + ry1) / 2
    pic(s, icon("user", "FFFFFF"), rx + rw / 2 - 0.3, ym - 0.9, 0.6)
    text(s, rx + 0.05, ym - 0.17, rw - 0.1, 1.1,
         [[T("特定の", F_LANE, "FFFFFF", True)], [T("個人", F_LANE, "FFFFFF", True)],
          [T("識別・追跡", F_BODY, "E5E7EB")]], anchor=MSO_ANCHOR.TOP, spacing=1.0)

    def group(lane, items, acc, joiner=None):
        y, h = L[lane]
        n = len(items)
        ch = nh + 2 * pad
        cy = y + (h - ch) / 2
        cw = n * nw + (n - 1) * gap + 2 * pad
        box(s, cx0, cy, cw, ch, line=acc, lw=1.5, radius=0.12, dash=True)
        for i, (t, d, ic) in enumerate(items):
            node(s, col[i], cy + pad, nw, nh, t, d, acc, ic)
            if joiner and i < n - 1:
                text(s, col[i] + nw, cy + pad + nh / 2 - 0.24, gap, 0.48,
                     [[T(joiner, 22, acc, True)]])
        return cx0 + cw, y + h / 2

    def into_result(x0, yc, s_label):
        arrow(s, x0, yc, rx, yc)
        label(s, (lab_x0 + rx) / 2, yc - 0.42, s_label, w=rx - lab_x0 + 0.1)

    # レーン1：直接識別子（どれか1つで特定）
    acc = PURPLE[0]
    xe, yc = group(0, [
        ("氏名", ["フルネーム"], "signature"),
        ("識別番号", ["旅券・免許証", "口座・カード"], "id"),
        ("個人の連絡先", ["メールアドレス", "電話番号"], "address-book"),
        ("生体情報", ["顔画像・指紋", "虹彩・声紋"], "fingerprint"),
    ], acc)
    into_result(xe, yc, "単体")

    # 4列目（仕組みのノード）はレーン色の淡い塗り＋太枠＋見出しをアクセント色に
    # レーン2：準識別子（＋で組み合わせ）
    acc, pale = BLUE
    xe, yc = group(1, [
        ("生年月日", ["完全な日付"], "calendar"),
        ("郵便番号", ["米国5桁ZIP"], "map-pin"),
        ("性別", ["値の種類が少数"], ("gender-female", "gender-male")),
    ], acc, joiner="＋")
    bx = col[3]
    node(s, bx, yc - nh / 2, nw, nh, "87%が一意", ["米国人口で推定", "1990年国勢調査"],
         acc, "user-search", fill=pale, title_color=acc, lw=2.75)
    arrow(s, xe, yc, bx, yc)
    into_result(bx + nw, yc, "組合せ")

    # レーン3：関連情報（識別子と連結して PII）
    acc, pale = TEAL
    xe, yc = group(2, [
        ("医療", ["病歴・処方"], "stethoscope"),
        ("学歴・職歴", ["学校・勤務先"], "school"),
        ("金融", ["年収・取引履歴"], "cash"),
    ], acc)
    bx = col[3]
    node(s, bx, yc - nh / 2, nw, nh, "連結経路", ["同一レコード内", "結合キー経由"],
         acc, "link", fill=pale, title_color=acc, lw=2.75)
    arrow(s, xe, yc, bx, yc)
    into_result(bx + nw, yc, "連結")

    path = os.path.join(OUT, "01_PIIの分類.pptx")
    prs.save(path)
    return path


# ============================================================
# 図2：NIST の PII／日本の個人情報／GDPR の personal data の範囲
# ============================================================
MARK = {"○": GREEN, "△": AMBER, "×": "6B7280"}


def mark(s, m, x, y, size, lw=3.5):
    col = MARK[m]
    if m == "×":
        d = size * 0.15
        arrow(s, x + d, y + d, x + size - d, y + size - d, color=col, lw=lw, head=False)
        arrow(s, x + size - d, y + d, x + d, y + size - d, color=col, lw=lw, head=False)
        return
    shape = MSO_SHAPE.OVAL if m == "○" else MSO_SHAPE.ISOSCELES_TRIANGLE
    sh = s.shapes.add_shape(shape, Inches(x), Inches(y), Inches(size),
                            Inches(size if m == "○" else size * 0.9))
    sh.fill.background()
    sh.line.color.rgb = rgb(col)
    sh.line.width = Pt(lw)
    no_shadow(sh)


def fig2():
    prs, s = new_slide()
    head = 1.9
    cx0, cx1 = LX + head + 0.15, LX + LW - 0.15
    head_h = 1.3
    top = 0.25 + head_h
    hs = [(H - 0.25 - top) / 3] * 3
    specs = [
        ("PII", "NIST\nSP 800-122", "file-certificate", PURPLE),
        ("個人情報", "個人情報保護法", "scale", TEAL),
        ("personal\ndata", "GDPR", "world", BLUE),
    ]
    L = lanes(s, top, specs, hs, head)
    cols = [
        ("氏名", "signature"),
        ("旅券番号\n指紋データ", "id"),
        ("メール\nアドレス", "mail"),
        ("IPアドレス\nCookie ID", "world-www"),
        ("仮名化した\nデータ", "arrows-shuffle"),
        ("匿名化した\nデータ", "user-off"),
    ]
    n = len(cols)
    gap = 0.12
    cw = (cx1 - cx0 - (n - 1) * gap) / n
    for i, (t, ic) in enumerate(cols):
        x = cx0 + i * (cw + gap)
        pic(s, icon(ic, SLATE), x + cw / 2 - 0.22, 0.3, 0.44)
        text(s, x, 0.82, cw, 0.66, [[T(l, F_TITLE, INK, True)] for l in t.split("\n")],
             anchor=MSO_ANCHOR.TOP, spacing=1.0)
    # 凡例（左上の空きセル）
    for k, (m, t) in enumerate([("○", "該当"), ("△", "条件次第"), ("×", "非該当")]):
        yy = 0.38 + k * 0.38
        mark(s, m, LX + 0.2, yy, 0.28, lw=2.5)
        text(s, LX + 0.6, yy - 0.04, 1.3, 0.36, [[T(t, F_BODY + 1, SUB)]], align=PP_ALIGN.LEFT)

    cells = [
        # NIST SP 800-122
        [("○", ["単体で識別"]), ("○", ["識別番号", "生体記録"]), ("○", ["アドレス情報", "例示に明記"]),
         ("△", ["個人・小集団に", "固定で紐づく時"]), ("○", ["再識別コードで", "連結可能"]),
         ("×", ["再識別コード", "なし"])],
        # 個人情報保護法
        [("○", ["特定個人の識別"]), ("○", ["個人識別符号"]), ("△", ["単体で識別時", "容易照合時"]),
         ("△", ["個人関連情報", "容易照合で該当"]), ("△", ["仮名加工情報", "容易照合で該当"]),
         ("×", ["匿名加工情報", "別規律"])],
        # GDPR
        [("○", ["識別された", "自然人"]), ("○", ["識別番号", "生体データ"]),
         ("○", ["識別可能な", "自然人の情報"]), ("○", ["オンライン", "識別子"]),
         ("△", ["追加情報で", "再識別可能時"]), ("×", ["適用対象外"])],
    ]
    # セルの枠は中立の灰色。行の色は左の帯・背景・行名だけに使う
    ms = 0.42
    for r, row in enumerate(cells):
        y, h = L[r]
        for i, (m, note) in enumerate(row):
            x = cx0 + i * (cw + gap)
            cy, ch = y + 0.12, h - 0.24
            box(s, x, cy, cw, ch, fill="FFFFFF", line="C4C9D1", lw=1.25, radius=0.1)
            my = cy + 0.26
            mark(s, m, x + cw / 2 - ms / 2, my, ms)
            text(s, x + 0.02, my + ms + 0.12, cw - 0.04, 0.68,
                 [[T(l, F_BODY, INK)] for l in note], anchor=MSO_ANCHOR.TOP, spacing=1.05)

    path = os.path.join(OUT, "02_PIIと個人情報とpersonal_dataの範囲.pptx")
    prs.save(path)
    return path


# ============================================================
# 図3：マスキング／仮名化／匿名化の違い
# ============================================================
def record(s, x, y, w, h, rows, acc, frame=True, kw=0.92, fill="FFFFFF"):
    """rows: [(key, value, changed)]。変更された項目は key と value をアクセント色の太字にする。"""
    if frame:
        box(s, x, y, w, h, fill=fill, line=acc, lw=1.75, radius=0.1)
    rh = 0.33
    ty = y + (h - rh * len(rows)) / 2
    for k, v, ch in rows:
        text(s, x + 0.12, ty, kw, rh, [[T(k, F_BODY, acc if ch else SUB, ch)]],
             align=PP_ALIGN.LEFT)
        text(s, x + 0.12 + kw, ty, w - kw - 0.2, rh,
             [[T(v, F_BODY, acc if ch else INK, ch, MONO if is_ascii(v) else JP)]],
             align=PP_ALIGN.LEFT)
        ty += rh


def fig3():
    prs, s = new_slide()
    head = 2.1
    cx0, cx1 = LX + head + 0.15, LX + LW - 0.15
    top = 0.25
    bottom = H - 0.62
    hs = [(bottom - top) / 3] * 3
    L = lanes(s, top, [
        ("マスキング", "masking", "eye-off", PURPLE),
        ("仮名化", "pseudonymization", "tag", BLUE),
        ("匿名化", "anonymization", "user-off", TEAL),
    ], hs, head)
    # 注記（右下に1行）
    text(s, cx1 - 6.0, bottom + 0.1, 6.0, 0.36,
         [[T("※ 各法令の要件を満たした場合", F_BODY, SUB)]], align=PP_ALIGN.RIGHT)

    ow, pw, rw, qw = 2.55, 2.15, 2.45, 2.4
    g = (cx1 - cx0 - ow - pw - rw - qw) / 3
    ox = cx0
    px = ox + ow + g
    rx = px + pw + g
    qx = rx + rw + g

    # 元データ（中央レーンに置き、幹線から3レーンへ分岐）
    ym = L[1][0] + L[1][1] / 2
    oh = 2.75
    box(s, ox, ym - oh / 2, ow, oh, fill="FFFFFF", line=SLATE, lw=1.75, radius=0.1)
    pic(s, icon("database", SLATE), ox + ow / 2 - 0.22, ym - oh / 2 + 0.14, 0.44)
    text(s, ox, ym - oh / 2 + 0.62, ow, 0.36, [[T("元データ", F_TITLE, INK, True)]])
    orig = [("氏名", "山田 太郎", False), ("生年月日", "1998-04-12", False),
            ("郵便番号", "160-0023", False), ("診断", "高血圧", False)]
    record(s, ox, ym - oh / 2 + 1.02, ow, 1.55, orig, SLATE, frame=False)
    xt = ox + ow + 0.16  # 幹線の x
    yc_top = L[0][0] + L[0][1] / 2
    yc_bot = L[2][0] + L[2][1] / 2
    arrow(s, ox + ow, ym, xt, ym, head=False)
    arrow(s, xt, yc_top, xt, yc_bot, head=False)

    nh = 1.66
    lanes_def = [
        (PURPLE, "伏せ字化", ["一部文字の置換", "表示・ログ用途"], "asterisk",
         [("氏名", "山田 **", True), ("生年月日", "1998-**-**", True),
          ("郵便番号", "160-0023", False), ("診断", "高血圧", False)],
         ("出力時のみ秘匿", ["GDPR：個人データ", "日本：個人情報"], "alert-triangle")),
        (BLUE, "識別子の置換", ["氏名 → 乱数ID", "対応表の分離管理"], "replace",
         [("ID", "u_8f3a2c", True), ("生年月日", "1998-04-12", False),
          ("郵便番号", "160-0023", False), ("診断", "高血圧", False)],
         ("対応表で復元可", ["GDPR：個人データ", "日本：仮名加工情報※"], "key")),
        (TEAL, "削除・一般化", ["氏名の削除", "日付・地域の一般化"], "filter",
         [("氏名", "削除済", True), ("生年", "1990年代", True),
          ("地域", "新宿区", True), ("診断", "高血圧", False)],
         ("復元不可", ["GDPR：適用対象外※", "日本：匿名加工情報※"], "link-off")),
    ]
    for i, ((acc, pale), pt, pd, pic_name, rows, (qt, qd, qic)) in enumerate(lanes_def):
        y, h = L[i]
        yc = y + h / 2
        arrow(s, xt, yc, px, yc)
        node(s, px, yc - nh / 2, pw, nh, pt, pd, acc, pic_name)
        arrow(s, px + pw, yc, rx, yc)
        record(s, rx, yc - 0.82, rw, 1.64, rows, acc)
        arrow(s, rx + rw, yc, qx, yc)
        node(s, qx, yc - nh / 2, qw, nh, qt, qd, acc, qic, fill=pale, title_color=acc, lw=2.75)

    path = os.path.join(OUT, "03_マスキングと仮名化と匿名化の違い.pptx")
    prs.save(path)
    return path


if __name__ == "__main__":
    for f in (fig1, fig2, fig3):
        print(f())
