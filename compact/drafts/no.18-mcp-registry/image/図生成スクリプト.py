# compact no.18 MCPレジストリ 図1・図2 生成スクリプト
# 使い方: python3 図生成スクリプト.py  （icons/svg に Tabler Icons の outline SVG を置いておく）
import os, re, subprocess
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from lxml import etree

HERE = os.path.dirname(os.path.abspath(__file__))
SVG = os.path.join(HERE, "icons", "svg")
PNG = os.path.join(HERE, "icons")
JP = "Meiryo"; MONO = "Consolas"
GRAY_TXT = RGBColor(0x55, 0x5B, 0x66); DARK = RGBColor(0x1F, 0x29, 0x37)
ARROW = RGBColor(0x55, 0x55, 0x55)

def rgb(h): return RGBColor.from_string(h.lstrip("#"))

def icon(name, color):
    out = os.path.join(PNG, f"{name}_{color.lstrip('#')}.png")
    if not os.path.exists(out):
        s = open(os.path.join(SVG, name + ".svg")).read().replace("currentColor", color)
        try:
            import cairosvg
            cairosvg.svg2png(bytestring=s.encode(), write_to=out, output_width=256, output_height=256)
        except ImportError:  # Mac では ImageMagick で変換
            tmp = out[:-4] + ".svg"; open(tmp, "w").write(s)
            subprocess.run(["convert", "-density", "1200", "-background", "none", tmp,
                            "-resize", "256x256", out], check=True)
            os.remove(tmp)
    return out

def runs(p, text, size, color, bold=False):
    # `...` で囲んだ部分は等幅フォント
    for i, part in enumerate(re.split(r"`", text)):
        if not part: continue
        r = p.add_run(); r.text = part
        f = r.font; f.size = Pt(size); f.bold = bold; f.color.rgb = color
        f.name = MONO if i % 2 else JP
        rPr = r._r.get_or_add_rPr()
        ea = rPr.find(qn("a:ea"))
        if ea is None: ea = etree.SubElement(rPr, qn("a:ea"))
        ea.set("typeface", JP)

def textbox(sl, x, y, w, h, lines, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP):
    tb = sl.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True; tf.vertical_anchor = anchor
    for m in ("margin_left", "margin_right", "margin_top", "margin_bottom"): setattr(tf, m, 0)
    for i, (t, size, color, bold) in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; p.line_spacing = 1.1
        runs(p, t, size, color, bold)
    return tb

def rect(sl, x, y, w, h, fill, line=None, lw=1.0, shape=MSO_SHAPE.RECTANGLE, adj=None, dash=False):
    s = sl.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    if adj is not None: s.adjustments[0] = adj
    if fill: s.fill.solid(); s.fill.fore_color.rgb = rgb(fill)
    else: s.fill.background()
    if line: s.line.color.rgb = rgb(line); s.line.width = Pt(lw)
    else: s.line.fill.background()
    if dash:
        from pptx.enum.dml import MSO_LINE
        s.line.dash_style = MSO_LINE.DASH
    s.shadow.inherit = False
    return s

def arrow(sl, x1, y1, x2, y2, color=ARROW, w=2.0, dash=False):
    c = sl.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    c.line.color.rgb = color; c.line.width = Pt(w)
    ln = c.line._get_or_add_ln()
    if dash:
        from pptx.enum.dml import MSO_LINE
        c.line.dash_style = MSO_LINE.DASH
    tail = etree.SubElement(ln, qn("a:tailEnd")); tail.set("type", "triangle"); tail.set("w", "lg"); tail.set("len", "lg")
    return c

def node(sl, x, y, w, h, accent, ic, title, desc, fill="FFFFFF", ts=15, ds=14):
    rect(sl, x, y, w, h, fill, accent, 1.75, MSO_SHAPE.ROUNDED_RECTANGLE, 0.12)
    sl.shapes.add_picture(icon(ic, accent), Inches(x + 0.14), Inches(y + 0.12), Inches(0.36), Inches(0.36))
    textbox(sl, x + 0.58, y + 0.1, w - 0.68, 0.42, [(title, ts, DARK, True)], anchor=MSO_ANCHOR.MIDDLE)
    textbox(sl, x + 0.16, y + 0.54, w - 0.26, h - 0.56, [(d, ds, GRAY_TXT, False) for d in desc])

LABEL = RGBColor(0x44, 0x4A, 0x55)
def label(sl, x, y, w, text, align=PP_ALIGN.LEFT, color=LABEL, h=0.3):
    textbox(sl, x, y, w, h, [(text, 13, color, False)], align=align, anchor=MSO_ANCHOR.MIDDLE)

def lanes(sl, specs, top, h, left=0.25, right=13.08, head_w=2.6, ns=16, ss=13):
    """specs: [(name, sub, accent, bg, icon)]"""
    rect(sl, left, top, right - left, h * len(specs), "FFFFFF", "D5D9DF", 1.0, MSO_SHAPE.ROUNDED_RECTANGLE, 0.015)
    ys = []
    for i, (name, sub, acc, bg, ic) in enumerate(specs):
        y = top + i * h; ys.append(y)
        rect(sl, left + 0.02, y + 0.03, right - left - 0.04, h - 0.06, bg)
        rect(sl, left + 0.02, y + 0.03, 0.09, h - 0.06, acc)
        sl.shapes.add_picture(icon(ic, acc), Inches(left + 0.22), Inches(y + h / 2 - 0.24), Inches(0.48), Inches(0.48))
        textbox(sl, left + 0.82, y + 0.1, head_w - 0.74, h - 0.2,
                [(name, ns, rgb(acc), True)] + [(s, ss, GRAY_TXT, False) for s in sub], anchor=MSO_ANCHOR.MIDDLE)
    return ys

prs = Presentation(); prs.slide_width = Inches(13.333); prs.slide_height = Inches(7.5)
BL = prs.slide_layouts[6]

# ---------------- 図1：エコシステム（公開者 → 公式Registry → サブレジストリ → ホスト → サーバ本体） ----------------
s = prs.slides.add_slide(BL)
PUR, PURB = "#7C4DDB", "#F5F1FD"; BLU, BLUB = "#2F6FDB", "#EEF4FD"; TEA, TEAB = "#138A7E", "#EAF6F4"
MAG, MAGB = "#B83C78", "#FCEFF5"; SLA, SLAB = "#4A5A6E", "#F1F3F6"; ORA, ORAB = "#E07B1A", "#FFF4E6"
TOP, LH = 0.15, 1.44
ys = lanes(s, [
    ("公開者", ["サーバ開発者"], PUR, PURB, "user-code"),
    ("MCP Registry", ["公式レジストリ", "メタデータのみ保持"], BLU, BLUB, "server-2"),
    ("サブレジストリ", ["マーケットプレイス", "社内レジストリ"], TEA, TEAB, "building-store"),
    ("MCP ホスト", ["LLM アプリ"], MAG, MAGB, "apps"),
    ("サーバ本体", ["パッケージ", "リモート"], SLA, SLAB, "box-multiple"),
], TOP, LH)
W, H = 3.0, 1.08
C = [2.95, 6.4, 9.85]
def ny(i): return ys[i] + (LH - H) / 2
def mid(i): return ny(i) + H / 2
def nd(c, i, acc, ic, t, d, **k): node(s, C[c], ny(i), W, H, acc, ic, t, d, ts=15, ds=13, **k)
def cx(c): return C[c] + W / 2
def gap_label(i, x, text):  # レーン i と i+1 の間の縦矢印の右横にラベル
    label(s, x + 0.1, ny(i) + H, 2.6, text, h=LH - H)
# 公開者
nd(0, 0, PUR, "file-code", "`server.json`", ["`name` / `version`", "`packages` / `remotes`"])
nd(1, 0, PUR, "terminal-2", "`mcp-publisher`", ["`login` → `publish`", "認証: GitHub / DNS / HTTP"])
arrow(s, C[0] + W, mid(0), C[1], mid(0))
# 公式 Registry
nd(1, 1, BLU, "shield-check", "公開時の検証", ["名前空間の所有", "パッケージの所有"])
nd(2, 1, ORA, "api", "Registry API", ["認証不要の読み取り API", "`GET /v0.1/servers`"], fill=ORAB[1:])
arrow(s, cx(1), ny(0) + H, cx(1), ny(1)); gap_label(0, cx(1), "`server.json` 送信")
arrow(s, C[1] + W, mid(1), C[2], mid(1))
# サブレジストリ（右→左）
nd(2, 2, TEA, "refresh", "定期同期", ["`updated_since` で差分取得", "独自 DB へ格納"])
nd(1, 2, TEA, "list-check", "キュレーション", ["`_meta` への評価付与", "OpenAPI 準拠の API"])
arrow(s, cx(2), ny(1) + H, cx(2), ny(2)); gap_label(1, cx(2), "定期取得")
arrow(s, C[2], mid(2), C[1] + W, mid(2))
# MCP ホスト（中央から左右へ分岐）
nd(1, 3, MAG, "search", "サーバ検索", ["`name` + `version` で特定", "候補の選択"])
nd(0, 3, MAG, "player-play", "ローカル起動", ["`packages` → 起動コマンド", "`npx` / `uvx` / `dnx` など"])
nd(2, 3, MAG, "plug-connected", "リモート接続", ["`remotes` → URL・ヘッダ", "Streamable HTTP"])
arrow(s, cx(1), ny(2) + H, cx(1), ny(3)); gap_label(2, cx(1), "検索 API")
arrow(s, C[1], mid(3), C[0] + W, mid(3))
arrow(s, C[1] + W, mid(3), C[2], mid(3))
# サーバ本体
nd(0, 4, SLA, "package", "パッケージ", ["npm / PyPI / NuGet", "Cargo / OCI / MCPB"])
nd(2, 4, SLA, "world-www", "リモートサーバ", ["公開 URL", "SSE は非推奨"])
arrow(s, cx(0), ny(3) + H, cx(0), ny(4)); gap_label(3, cx(0), "パッケージ取得")
arrow(s, cx(2), ny(3) + H, cx(2), ny(4)); gap_label(3, cx(2), "接続")

# ---------------- 図2：公式 Registry の検証範囲 ----------------
s = prs.slides.add_slide(BL)
GRN, GRNB = "#2E7D32", "#EEF6EE"; RED, REDB = "#C62828", "#FCEEEE"; SL2, SL2B = "#4A5A6E", "#F1F3F6"
TOP2, LH2 = 0.3, 2.3
ys = lanes(s, [
    ("検証対象", ["公開時のチェック"], GRN, GRNB, "shield-check"),
    ("検証対象外", ["下流・利用者の責任"], RED, REDB, "shield-x"),
    ("モデレーション", ["公開後の対応"], SL2, SL2B, "trash"),
], TOP2, LH2, ns=17, ss=14)
W2, H2 = 3.0, 1.3
C2 = [3.1, 6.45, 9.8]
def ny2(i): return ys[i] + (LH2 - H2) / 2
def n2(c, i, acc, ic, t, d): node(s, C2[c], ny2(i), W2, H2, acc, ic, t, d, ts=16, ds=14)
n2(0, 0, GRN, "user-check", "名前空間の所有", ["GitHub（OAuth / OIDC）", "DNS TXT / `.well-known`"])
n2(1, 0, GRN, "file-certificate", "パッケージの所有", ["`mcpName` / `mcp-name:`", "OCI ラベルとの名前照合"])
n2(2, 0, GRN, "lock-access", "配布元の制限", ["パブリックレジストリ限定", "非公開・ミラー経由は不可"])
n2(0, 1, RED, "world-www", "リモート URL の所有", ["URL ドメインの照合なし", "同一 URL の別名登録可"])
n2(1, 1, RED, "bug", "コードの安全性", ["セキュリティスキャンなし", "配布元・下流へ委譲"])
n2(2, 1, RED, "hash", "MCPB のハッシュ", ["`fileSha256` 必須・未照合", "照合はクライアント側"])
n2(0, 2, SL2, "gavel", "手動削除", ["違法コンテンツ・マルウェア", "スパム・動作不能サーバ"])
n2(1, 2, SL2, "tag", "`status` 変更", ["`status: \"deleted\"`", "既定の一覧で非表示"])
n2(2, 2, SL2, "filter", "下流での除外", ["サブレジストリ側の任意対応", "インデックスから除外"])
arrow(s, C2[0] + W2, ny2(2) + H2 / 2, C2[1], ny2(2) + H2 / 2)
arrow(s, C2[1] + W2, ny2(2) + H2 / 2, C2[2], ny2(2) + H2 / 2)

out = os.path.join(HERE, "MCPレジストリ図.pptx")
prs.save(out); print("saved", out)
