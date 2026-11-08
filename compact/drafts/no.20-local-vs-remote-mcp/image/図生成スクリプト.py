# -*- coding: utf-8 -*-
"""compact no.20 ローカルMCPとリモートMCPの違い の図（3枚）を生成する。

  01_ローカルMCPの構成.pptx      … stdio。ホストがサーバを子プロセスとして起動
  02_リモートMCPの構成.pptx      … Streamable HTTP ＋ OAuth 2.1
  03_リモートMCPの認可フロー.pptx … MCP 仕様 Authorization のフロー

スタイル：writing-guides/figure-reference/architecture-figure-best-practice.md（スイムレーン、
レーンごとのアクセント色、白地＋色枠のノード、主役はオレンジ、右上に1行の凡例）。
図内タイトルなし、文字は13pt以上（Qiita の本文幅 約800px に縮めても読める大きさ）、16:9。
ラベルは体言止め。アイコンは Tabler Icons (MIT) を icons/ から使う。

使い方: python3 図生成スクリプト.py   （このファイルと同じフォルダに pptx を出力）
PNG化: soffice --headless --convert-to pdf *.pptx → pdftoppm → 横2000px に縮小
"""
import glob
import os
import subprocess

from lxml import etree
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

HERE = os.path.dirname(os.path.abspath(__file__))
ICON_SVG = os.path.join(HERE, "icons", "svg")
ICON_PNG = os.path.join(HERE, "icons")

FONT = "Noto Sans CJK JP"
MONO = "Menlo"

# 文字サイズ（pt）
FS_LANE, FS_SUB, FS_TITLE, FS_DESC, FS_LABEL, FS_LEGEND = 17, 13, 16, 13, 13, 13

W, H = 13.333, 7.5

INK = RGBColor(0x1F, 0x29, 0x37)     # タイトル文字
SUB = RGBColor(0x4B, 0x55, 0x63)     # 説明文字
ARROW = RGBColor(0x55, 0x5B, 0x63)
FRAME = RGBColor(0xD5, 0xD9, 0xE0)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
BAND = RGBColor(0xF4, 0xF6, 0xF9)

LANES = {
    "blue":   ("2F6FDB", "EEF4FD"),
    "teal":   ("138A7E", "EAF6F4"),
    "purple": ("7C4DDB", "F5F1FD"),
    "orange": ("E07B1A", "FFF4E6"),
}


def rgb(h):
    return RGBColor.from_string(h)


# ---------------------------------------------------------------- 文字幅の計測（はみ出し検出用。フォントが無ければ概算）
_FONTS = {}


def _font(mono, bold, size):
    key = (mono, bold, size)
    if key in _FONTS:
        return _FONTS[key]
    f = None
    try:
        from PIL import ImageFont
        pats = (["JetBrainsMono_400Regular.ttf", "JetBrainsMono-Regular.ttf", "Menlo.ttc", "DejaVuSansMono.ttf"] if mono else
                (["NotoSansJP_700Bold.ttf", "NotoSansCJK-Bold.ttc"] if bold else
                 ["NotoSansJP_400Regular.ttf", "NotoSansCJK-Regular.ttc"]))
        dirs = [os.path.expanduser("~/.fonts"), "/usr/share/fonts", "/Library/Fonts", "/System/Library/Fonts"]
        for p in pats:
            hit = [g for d in dirs for g in glob.glob(os.path.join(d, "**", p), recursive=True)]
            if hit:
                f = ImageFont.truetype(hit[0], int(size * 10))
                break
    except Exception:
        f = None
    _FONTS[key] = f
    return f


def run_w(s, size, bold=False, mono=False):
    """文字列の幅（インチ）"""
    f = _font(mono, bold, size)
    if f is not None:
        return f.getlength(s) / 10 / 72
    return sum((0.6 if mono else (1.0 if ord(c) > 0x2000 else 0.55)) for c in s) * size / 72


def para_w(runs):
    return sum(run_w(s, o.get("size", 13), o.get("bold", False), o.get("mono", False)) for s, o in runs)


WARN = []


# ---------------------------------------------------------------- 基本部品
def no_style(sp):
    """テーマ由来の影・線を消す（p:style を外す）"""
    st = sp._element.find(qn("p:style"))
    if st is not None:
        sp._element.remove(st)


def set_font(run, size, bold=False, color=INK, mono=False):
    f = run.font
    f.size = Pt(size)
    f.bold = bold
    f.color.rgb = color
    f.name = MONO if mono else FONT
    rPr = run._r.get_or_add_rPr()
    for tag in ("a:ea", "a:cs"):
        el = rPr.find(qn(tag))
        if el is None:
            el = etree.SubElement(rPr, qn(tag))
        el.set("typeface", FONT)


def text(slide, x, y, w, h, lines, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.TOP, fill=None, wrap=True,
         spacing=1.0):
    """lines: [[(文字, {size, bold, color, mono}), ...], ...]  1要素=1段落"""
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = wrap
    tf.auto_size = None
    for m in ("margin_left", "margin_right", "margin_top", "margin_bottom"):
        setattr(tf, m, 0)
    tf.vertical_anchor = anchor
    if fill:
        tb.fill.solid()
        tb.fill.fore_color.rgb = fill
    for i, runs in enumerate(lines):
        if isinstance(runs, tuple):
            runs = [runs]
        if wrap and para_w(runs) > w + 0.01:
            WARN.append(f"はみ出し {para_w(runs):.2f}in > {w:.2f}in : {''.join(s for s, _ in runs)}")
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = spacing
        for s, o in runs:
            r = p.add_run()
            r.text = s
            set_font(r, o.get("size", 13), o.get("bold", False), o.get("color", INK), o.get("mono", False))
    return tb


def T(s, **o):
    return (s, o)


def shape(slide, kind, x, y, w, h, fill=None, line=None, lw=1.0, dash=None, radius=None):
    sp = slide.shapes.add_shape(kind, Inches(x), Inches(y), Inches(w), Inches(h))
    no_style(sp)
    if fill is None:
        sp.fill.background()
    else:
        sp.fill.solid()
        sp.fill.fore_color.rgb = fill
    if line is None:
        sp.line.fill.background()
    else:
        sp.line.color.rgb = line
        sp.line.width = Pt(lw)
        if dash:
            sp.line.dash_style = dash
    if radius is not None and kind == MSO_SHAPE.ROUNDED_RECTANGLE:
        sp.adjustments[0] = radius
    return sp


DASH, DOT = 4, 3   # MSO_LINE_DASH_STYLE: DASH=4, ROUND_DOT=3


def _arrow_head(ln):
    el = etree.SubElement(ln, qn("a:tailEnd"))
    el.set("type", "triangle")
    el.set("w", "med")
    el.set("len", "med")


def arrow(slide, pts, color=ARROW, lw=1.5, dash=None, head=True):
    """pts=[(x,y),...] インチ。2点は直線コネクタ、3点以上はフリーフォーム。dash は DASH / DOT"""
    if len(pts) == 2:
        (x1, y1), (x2, y2) = pts
        sp = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    else:
        fb = slide.shapes.build_freeform(Inches(pts[0][0]), Inches(pts[0][1]), scale=1.0)
        fb.add_line_segments([(Inches(x), Inches(y)) for x, y in pts[1:]], close=False)
        sp = fb.convert_to_shape()
        sp.fill.background()
    no_style(sp)
    sp.line.color.rgb = color
    sp.line.width = Pt(lw)
    if dash:
        sp.line.dash_style = dash
    if head:
        _arrow_head(sp.line._get_or_add_ln())
    return sp


def icon_png(name, color_hex):
    out = os.path.join(ICON_PNG, f"{name}_{color_hex}.png")
    if not os.path.exists(out):
        svg = open(os.path.join(ICON_SVG, f"{name}.svg"), encoding="utf-8").read()
        svg = svg.replace("currentColor", "#" + color_hex)
        tmp = out + ".svg"
        open(tmp, "w", encoding="utf-8").write(svg)
        try:  # cairosvg があれば使い、なければ ImageMagick
            import cairosvg
            cairosvg.svg2png(url=tmp, write_to=out, output_width=256, output_height=256)
        except ImportError:
            subprocess.run(["convert", "-background", "none", "-density", "1200", tmp,
                            "-resize", "256x256", out], check=True)
        os.remove(tmp)
    return out


def icon(slide, name, color_hex, cx, cy, size):
    slide.shapes.add_picture(icon_png(name, color_hex), Inches(cx - size / 2), Inches(cy - size / 2),
                             Inches(size), Inches(size))


class Node:
    def __init__(self, x, y, w, h):
        self.x, self.y, self.w, self.h = x, y, w, h

    @property
    def cx(self):
        return self.x + self.w / 2

    @property
    def cy(self):
        return self.y + self.h / 2

    @property
    def l(self):
        return (self.x, self.cy)

    @property
    def r(self):
        return (self.x + self.w, self.cy)

    @property
    def t(self):
        return (self.cx, self.y)

    @property
    def b(self):
        return (self.cx, self.y + self.h)


def _runs(d, size, color, **extra):
    if isinstance(d, str):
        return [T(d, size=size, color=color, **extra)]
    return [(s, {"size": size, "color": color, **extra, **o}) for s, o in d]


def node(slide, x, y, w, h, icon_name, title, desc, accent, main=False, dashed=False):
    """desc: 段落のリスト（2行まで）。各段落は文字列か run のリスト。等幅は T(s, mono=True)"""
    a_hex, l_hex = LANES["orange" if main else accent]
    shape(slide, MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h,
          fill=rgb(l_hex) if main else WHITE, line=rgb(a_hex), lw=1.75, dash=DASH if dashed else None, radius=0.08)
    icon(slide, icon_name, a_hex, x + w / 2, y + 0.27, 0.40)
    lines = [[T(title, size=FS_TITLE, bold=True, color=INK)]] + [_runs(d, FS_DESC, SUB) for d in desc]
    text(slide, x + 0.07, y + 0.49, w - 0.14, h - 0.52, lines)
    return Node(x, y, w, h)


def label(slide, x, y, w, lines, align=PP_ALIGN.LEFT, h=None, color=SUB, fill=None):
    ls = [_runs(ln, FS_LABEL, color) for ln in lines]
    return text(slide, x, y, w, h or 0.27 * len(lines), ls, align=align, anchor=MSO_ANCHOR.MIDDLE, fill=fill)


def legend(slide, right_x, y, items):
    """items: [(種類, 文字)] を右寄せ1行で。種類: solid / dash / dot / main"""
    gap_sym, gap_item = 0.1, 0.35
    widths = [0.55 + gap_sym + run_w(s, FS_LEGEND) + gap_item for _, s in items]
    x = right_x - sum(widths) + gap_item
    for (k, s), wdt in zip(items, widths):
        if k == "main":
            shape(slide, MSO_SHAPE.ROUNDED_RECTANGLE, x + 0.06, y - 0.15, 0.44, 0.3, fill=rgb(LANES["orange"][1]),
                  line=rgb(LANES["orange"][0]), lw=1.75, radius=0.2)
        else:
            arrow(slide, [(x, y), (x + 0.55, y)], dash={"solid": None, "dash": DASH, "dot": DOT}[k],
                  head=(k != "dot"), lw=2.25 if k == "dot" else 1.5)
        text(slide, x + 0.55 + gap_sym, y - 0.16, run_w(s, FS_LEGEND) + 0.1, 0.32,
             [T(s, size=FS_LEGEND, color=SUB)], align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.MIDDLE, wrap=False)
        x += wdt


def new_slide(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg = s.background.fill
    bg.solid()
    bg.fore_color.rgb = WHITE
    return s


def new_prs():
    prs = Presentation()
    prs.slide_width = Inches(W)
    prs.slide_height = Inches(H)
    return prs


# ---------------------------------------------------------------- スイムレーン（図1・図2 共通の座標）
X0, X1 = 0.3, 13.03            # 外枠
HEAD_W = 2.2                   # レーン見出し列
LANE_Y0 = 0.62
LANE_H = 2.24
COLS = [2.68, 6.23, 9.78]      # ノード左端
NW, NH = 2.35, 1.45            # ノード寸法
Y_L1, Y_L2, Y_L3 = 0.28, 0.62, 0.56   # 各レーン上端からノード上端まで


def lanes(slide, defs):
    """defs: [(レーン名, [補足...], アクセント, アイコン)]"""
    n = len(defs)
    shape(slide, MSO_SHAPE.ROUNDED_RECTANGLE, X0, LANE_Y0, X1 - X0, LANE_H * n, fill=WHITE, line=FRAME,
          lw=1.0, radius=0.02)
    for i, (name, sub, acc, ic) in enumerate(defs):
        a_hex, l_hex = LANES[acc]
        y = LANE_Y0 + LANE_H * i
        y0 = y + (0.02 if i == 0 else 0)
        y1 = y + LANE_H - (0.02 if i == n - 1 else 0)
        shape(slide, MSO_SHAPE.RECTANGLE, X0 + 0.02, y0, X1 - X0 - 0.04, y1 - y0, fill=rgb(l_hex))
        shape(slide, MSO_SHAPE.RECTANGLE, X0 + 0.02, y0, 0.09, y1 - y0, fill=rgb(a_hex))
        icon(slide, ic, a_hex, X0 + 0.4, y + LANE_H / 2, 0.44)
        text(slide, X0 + 0.7, y + LANE_H / 2 - 0.5, HEAD_W - 0.72, 1.0,
             [[T(name, size=FS_LANE, bold=True, color=rgb(a_hex))]] + [[T(s, size=FS_SUB, color=SUB)] for s in sub],
             align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.MIDDLE)
    arrow(slide, [(X0 + HEAD_W + 0.1, LANE_Y0 + 0.02), (X0 + HEAD_W + 0.1, LANE_Y0 + LANE_H * n - 0.02)],
          color=FRAME, lw=1.0, head=False)


def lane_top(i, offset=0.0):
    return LANE_Y0 + LANE_H * i + offset


def host_row(s, cfg_icon, cfg_title, cfg_desc, host_desc, cli_desc):
    """ホスト側レーンの3ノード（図1・図2で同じ位置）"""
    y1 = lane_top(0, Y_L1)
    cfg = node(s, COLS[0], y1, NW, NH, cfg_icon, cfg_title, cfg_desc, "blue")
    host = node(s, COLS[1], y1, NW, NH, "app-window", "MCPホスト", host_desc, "blue")
    cli = node(s, COLS[2], y1, NW, NH, "plug", "MCPクライアント", cli_desc, "blue")
    gap = COLS[1] - COLS[0] - NW
    arrow(s, [cfg.r, host.l])
    label(s, cfg.x + NW, cfg.cy - 0.32, gap, ["起動時の読込"], align=PP_ALIGN.CENTER)
    arrow(s, [host.r, cli.l])
    label(s, host.x + NW, host.cy - 0.32, gap, ["ツール実行"], align=PP_ALIGN.CENTER)
    return cfg, host, cli


def link_rows(s, cli, srv, down_lines, up_lines, centered=False):
    """ホスト側 ⇄ サーバ側 の縦矢印2本。注釈は既定でサーバ側レーン上端の帯、centered=True で2ノード間の中央"""
    xd, xu = cli.cx - 0.4, cli.cx + 0.4
    arrow(s, [(xd, cli.y + NH), (xd, srv.y)])
    arrow(s, [(xu, srv.y), (xu, cli.y + NH)], dash=DASH)
    if centered:
        hgt = 0.58
        ytop = (cli.y + NH + srv.y) / 2 - hgt / 2
    else:
        ytop = lane_top(1, 0.05)
        hgt = srv.y - ytop - 0.03
    label(s, xd - 3.62, ytop, 3.5, down_lines, align=PP_ALIGN.RIGHT, h=hgt)
    label(s, xu + 0.12, ytop, X1 - xu - 0.17, up_lines, h=hgt)
    return xd, xu


def bus(s, srv, targets, text_runs):
    """サーバ → アクセス先の分配線。注釈は横線の上"""
    by = lane_top(2, 0.30)
    xs = srv.cx - 0.4
    arrow(s, [(xs, srv.y + NH), (xs, by)], head=False)
    xl, xr = min(t.cx for t in targets), max(t.cx for t in targets)
    arrow(s, [(xl, by), (xr, by)], head=False)
    for t in targets:
        arrow(s, [(t.cx, by), (t.cx, t.y)])
    label(s, xs - 0.12 - 4.6, by - 0.29, 4.6, [text_runs], align=PP_ALIGN.RIGHT)


# ---------------------------------------------------------------- 図1 ローカル
def fig1(path):
    prs = new_prs()
    s = new_slide(prs)
    legend(s, X1, 0.32, [("solid", "要求・操作"), ("dash", "応答・出力"), ("main", "この図の主役")])
    lanes(s, [("ホスト側", ["ユーザーのPC"], "blue", "app-window"),
              ("サーバ側", ["ユーザーのPC", "子プロセス"], "teal", "server"),
              ("アクセス先", ["ローカル資源", "外部API"], "purple", "folder")])

    cfg, host, cli = host_row(
        s, "file-settings", "設定ファイル",
        [[T("command", mono=True), T("・"), T("args", mono=True), T("・"), T("env", mono=True)], "起動コマンドの定義"],
        ["Claude Code など", "LLM連携・同意管理"],
        ["サーバ1つに1接続", "JSON-RPC 送受信"])

    y2 = lane_top(1, Y_L2)
    srv = node(s, COLS[2], y2, NW, NH, "server", "MCPサーバ",
               [[T("例："), T("node server.js", mono=True)], "ホストと同じOSユーザー"], "teal", main=True)
    err = node(s, COLS[1], y2, NW, NH, "file-text", "stderr",
               ["ログ出力専用（任意）", "扱いはクライアント次第"], "teal")

    link_rows(s, cli, srv,
              [[T("① 起動時の子プロセス生成（"), T("spawn", mono=True), T("）")],
               [T("② "), T("stdin", mono=True), T(" への JSON-RPC 要求（1行1件）")]],
              [[T("④ "), T("stdout", mono=True), T(" 経由")], "JSON-RPC 応答"], centered=True)

    arrow(s, [srv.l, err.r], dash=DASH)
    label(s, err.x + NW, srv.cy - 0.32, COLS[2] - err.x - NW, ["ログ"], align=PP_ALIGN.CENTER)

    y3 = lane_top(2, Y_L3)
    fs = node(s, COLS[0], y3, NW, NH, "folder", "ローカルファイル",
              ["読み取り・書き込み", "アクセス制御はOS権限"], "purple")
    cmd = node(s, COLS[1], y3, NW, NH, "terminal", "OSコマンド",
               ["サーバ配下の子プロセス", "サーバ権限の継承"], "purple")
    api = node(s, COLS[2], y3, NW, NH, "cloud", "外部API",
               [[T("env", mono=True), T(" 経由の APIキー認証")], "HTTPS"], "purple")
    bus(s, srv, [fs, cmd, api], "③ ツールの処理（ファイル・コマンド・API）")

    prs.save(path)


# ---------------------------------------------------------------- 図2 リモート
def fig2(path):
    prs = new_prs()
    s = new_slide(prs)
    legend(s, X1, 0.32, [("solid", "要求・操作"), ("dash", "応答"), ("dot", "信頼関係"), ("main", "この図の主役")])
    lanes(s, [("ホスト側", ["ユーザーのPC"], "blue", "app-window"),
              ("サーバ側", ["リモートサーバ", "HTTP経由"], "teal", "server"),
              ("アクセス先", ["リモート資源", "上流API・DB"], "purple", "database")])

    cfg, host, cli = host_row(
        s, "link", "接続設定",
        ["MCPサーバのURL", [T("https://…/mcp", mono=True)]],
        ["Claude Code など", "LLM連携・同意管理"],
        ["OAuth 2.1 クライアント", "トークンの保持・付与"])

    y2 = lane_top(1, Y_L2)
    az = node(s, COLS[0], y2, NW, NH, "shield-lock", "認可サーバ",
              ["アクセストークン発行", "同居または外部IdP"], "teal")
    srv = node(s, COLS[2], y2, NW, NH, "server", "MCPサーバ",
               [[T("単一エンドポイント "), T("/mcp", mono=True)], [T("トークンの "), T("aud", mono=True), T(" 検証")]],
               "teal", main=True)

    # ① 認可・トークン取得：クライアント → ホスト側レーン下部 → 列1と列2の間 → 認可サーバ右辺
    xa = cli.x + 0.25
    ya = (cli.y + NH + lane_top(1)) / 2
    xm = COLS[0] + NW + (COLS[1] - COLS[0] - NW) / 2
    yz = az.y + 0.4
    arrow(s, [(xa, cli.y + NH), (xa, ya), (xm, ya), (xm, yz), (az.x + NW, yz)])
    ly = lane_top(1, 0.05)
    label(s, COLS[0], ly, xm - 0.12 - COLS[0], ["① 認可・トークン取得", "（図3の手順1〜13）"], align=PP_ALIGN.RIGHT,
          h=az.y - ly - 0.03)

    link_rows(s, cli, srv,
              [[T("② "), T("POST /mcp", mono=True), T("（JSON-RPC 1件ずつ）")],
               [T("Authorization: Bearer", mono=True)]],
              ["④ 応答", "JSON／SSE"])

    # MCPサーバ ⇢ 認可サーバ：トークンの発行元として信頼（保護リソースメタデータの authorization_servers）
    yt = az.y + NH - 0.22
    arrow(s, [(srv.x, yt), (az.x + NW, yt)], dash=DOT, head=False, lw=2.25)
    label(s, az.x + NW + 0.15, yt - 0.3, srv.x - az.x - NW - 0.3,
          [[T("発行元として信頼（"), T("authorization_servers", mono=True), T("）")]], align=PP_ALIGN.CENTER)

    y3 = lane_top(2, Y_L3)
    up = node(s, COLS[1], y3, NW, NH, "cloud", "上流API",
              ["外部SaaS など", "受信トークンの転送禁止"], "purple")
    db = node(s, COLS[2], y3, NW, NH, "database", "サーバのDB",
              ["ユーザーごとのデータ", "接続はサーバの資格情報"], "purple")
    bus(s, srv, [up, db], "③ ツールの処理（API呼び出し・DB操作）")

    prs.save(path)


# ---------------------------------------------------------------- 図3 認可フロー
def fig3(path):
    prs = new_prs()
    s = new_slide(prs)
    legend(s, X1, 0.25, [("solid", "要求・操作"), ("dash", "応答"), ("main", "この図の主役")])

    parts = [  # 名前, 補足, アクセント, アイコン, x, 枠の幅
        ("ブラウザ", "ユーザーエージェント", "blue", "browser", 1.5, 2.55),
        ("MCPクライアント", "OAuth 2.1 クライアント", "blue", "plug", 5.05, 2.8),
        ("MCPサーバ", "リソースサーバ", "orange", "server", 8.85, 2.3),
        ("認可サーバ", "トークン発行元", "teal", "shield-lock", 11.5, 2.3),
    ]
    head_y, head_h = 0.55, 0.82
    top_rows, step = 1.72, 0.38
    rows = 15
    bottom = top_rows + step * (rows - 1) + 0.25

    # フェーズの帯
    phases = [("発見", 0, 6), ("登録", 6, 7), ("認可", 7, 13), ("利用", 13, 15)]
    band_of = {}
    for i, (name, a, b) in enumerate(phases):
        y0 = top_rows + step * a - step / 2
        y1 = top_rows + step * (b - 1) + step / 2
        col = BAND if i % 2 == 0 else WHITE
        shape(s, MSO_SHAPE.RECTANGLE, 0.3, y0, X1 - 0.3, y1 - y0, fill=col)
        text(s, 12.25, y0, 0.75, y1 - y0, [T(name, size=15, bold=True, color=SUB)], anchor=MSO_ANCHOR.MIDDLE)
        for r in range(a, b):
            band_of[r] = col

    xs = {}
    for name, sub, acc, ic, x, head_w in parts:
        a_hex, l_hex = LANES[acc]
        shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, x - head_w / 2, head_y, head_w, head_h,
              fill=rgb(l_hex) if acc == "orange" else WHITE, line=rgb(a_hex), lw=1.75, radius=0.12)
        icon(s, ic, a_hex, x - head_w / 2 + 0.32, head_y + head_h / 2, 0.42)
        text(s, x - head_w / 2 + 0.56, head_y + 0.06, head_w - 0.6, head_h - 0.12,
             [[T(name, size=FS_TITLE, bold=True)], [T(sub, size=FS_SUB, color=SUB)]], align=PP_ALIGN.LEFT,
             anchor=MSO_ANCHOR.MIDDLE)
        arrow(s, [(x, head_y + head_h), (x, bottom)], color=rgb("A0A6AE"), lw=1.0, dash=DASH, head=False)
        xs[name] = x

    B, C, M, A = (xs[p[0]] for p in parts)
    msgs = [
        (C, M, False, [T("POST /mcp", mono=True), T("（トークンなし）")]),
        (M, C, True, [T("401 ＋ "), T("WWW-Authenticate", mono=True)]),
        (C, M, False, [T("GET 保護リソースメタデータ（RFC 9728）")]),
        (M, C, True, [T("authorization_servers", mono=True)]),
        (C, A, False, [T("GET 認可サーバメタデータ（RFC 8414 / OIDC Discovery）")]),
        (A, C, True, [T("authorization_endpoint", mono=True), T("・"), T("token_endpoint", mono=True), T(" など")]),
        None,  # 7 はノート（クライアント登録）
        (C, B, False, [T("認可URLの起動")]),
        (B, A, False, [T("認可リクエスト（"), T("code_challenge", mono=True), T("・"), T("resource", mono=True),
                       T("）＋ ユーザー認証・同意")]),
        (A, B, True, [T("リダイレクト（"), T("code", mono=True), T("・"), T("iss", mono=True), T("）")]),
        (B, C, False, [T("redirect_uri", mono=True), T(" へのコールバック")]),
        (C, A, False, [T("トークン要求（"), T("code", mono=True), T("・"), T("code_verifier", mono=True), T("・"),
                       T("resource", mono=True), T("）")]),
        (A, C, True, [T("アクセストークン")]),
        (C, M, False, [T("POST /mcp", mono=True), T(" ＋ "), T("Bearer", mono=True), T(" トークン")]),
        (M, C, True, [T("MCP応答（JSON／SSE）")]),
    ]
    for i, m in enumerate(msgs):
        y = top_rows + step * i + 0.1
        num = T(f"{i + 1}. ", bold=True, color=INK)
        if m is None:  # クライアント登録：3方式（事前登録は通信なし、CIMD は認可サーバ側から取得）なのでノートで表す
            runs = [(t, {"size": FS_LABEL, "color": INK, **o}) for t, o in
                    [num, T("クライアント登録（事前登録 ／ CIMD ／ DCR）")]]
            yc = top_rows + step * i
            shape(s, MSO_SHAPE.RECTANGLE, C - 0.25, yc - 0.14, A - C + 0.5, 0.28, fill=rgb("ECEFF3"), line=rgb("A0A6AE"),
                  lw=1.0)
            text(s, C - 0.25, yc - 0.14, A - C + 0.5, 0.28, [runs], anchor=MSO_ANCHOR.MIDDLE)
            continue
        x1, x2, reply, body = m
        arrow(s, [(x1, y), (x2, y)], dash=DASH if reply else None, lw=1.5)
        runs = [(t, {"size": FS_LABEL, "color": INK if not reply else SUB, **o}) for t, o in [num] + body]
        wdt = para_w(runs) + 0.08
        mid = (x1 + x2) / 2
        if wdt > abs(x2 - x1):
            WARN.append(f"図3 ラベル {i + 1} が矢印より長い {wdt:.2f} > {abs(x2 - x1) - 0.1:.2f}")
        text(s, mid - wdt / 2, y - 0.29, wdt, 0.26, [runs], anchor=MSO_ANCHOR.BOTTOM, fill=band_of[i], wrap=False)
    prs.save(path)


if __name__ == "__main__":
    fig1(os.path.join(HERE, "01_ローカルMCPの構成.pptx"))
    fig2(os.path.join(HERE, "02_リモートMCPの構成.pptx"))
    fig3(os.path.join(HERE, "03_リモートMCPの認可フロー.pptx"))
    for w in WARN:
        print("WARN", w)
    print("ok")
