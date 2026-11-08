# compact no.11 中心極限定理と正規分布の図を生成するスクリプト
# 使い方: python3 図生成スクリプト.py <出力ディレクトリ> <作業ディレクトリ>
#   出力: 01_正規分布と標準偏差の範囲.pptx / 02_中心極限定理の流れ.pptx / 03_サイコロの目の平均の分布.pptx
import math
import os
import sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt
from lxml import etree

OUT = sys.argv[1]
WORK = sys.argv[2]
os.makedirs(OUT, exist_ok=True)
os.makedirs(WORK, exist_ok=True)

# compact シリーズの配色（no.1・no.3 と同じ）
NAVY = "#2E5E8E"
NAVY_M = "#7FA3C9"
NAVY_L = "#C9D9EC"
TEAL = "#1E8A82"
ORANGE = "#E8710A"
TEXT = "#1F3A5C"
GRAY = "#6B7280"
AXIS = "#9AA3AF"
FONT = "Hiragino Sans"

plt.rcParams["mathtext.fontset"] = "cm"
plt.rcParams["font.family"] = "DejaVu Sans"

SW, SH = 13.333, 7.5
_count = [0]


def tmp(name):
    _count[0] += 1
    return os.path.join(WORK, f"{_count[0]:02d}_{name}.png")


def rgb(h):
    return RGBColor.from_string(h.lstrip("#"))


# ---------- matplotlib ----------

def mathimg(tex, size_pt=20, color=TEXT):
    """TeX 風の式を透明 PNG にして (path, 幅in, 高さin) を返す（配置時の大きさ＝size_pt）"""
    path = tmp("math")
    fig = plt.figure(figsize=(0.01, 0.01))
    fig.text(0, 0, f"${tex}$", fontsize=size_pt, color=color)
    fig.savefig(path, dpi=300, transparent=True, bbox_inches="tight", pad_inches=0.02)
    plt.close(fig)
    w, h = Image.open(path).size
    return path, w / 300, h / 300


class Panel:
    """配置サイズちょうどの matplotlib 図。axes の位置を固定して、データ座標→スライド座標を計算できるようにする"""

    def __init__(self, x, y, w, h, rect, xlim, ylim):
        self.x, self.y, self.w, self.h = x, y, w, h
        self.rect = rect  # (left, bottom, width, height) 図に対する割合
        self.fig = plt.figure(figsize=(w, h))
        self.ax = self.fig.add_axes(rect)
        self.ax.set_xlim(*xlim)
        self.ax.set_ylim(*ylim)
        self.xlim, self.ylim = xlim, ylim
        ax = self.ax
        for side in ("top", "right"):
            ax.spines[side].set_visible(False)
        for side in ("left", "bottom"):
            ax.spines[side].set_color(AXIS)
        ax.tick_params(labelsize=17, colors=GRAY, length=4)

    def sx(self, v):
        l, b, w, h = self.rect
        return self.x + (l + (v - self.xlim[0]) / (self.xlim[1] - self.xlim[0]) * w) * self.w

    def sy(self, v):
        l, b, w, h = self.rect
        return self.y + (1 - (b + (v - self.ylim[0]) / (self.ylim[1] - self.ylim[0]) * h)) * self.h

    def place(self, slide, name):
        path = tmp(name)
        self.fig.savefig(path, dpi=300, transparent=True)
        plt.close(self.fig)
        slide.shapes.add_picture(path, Inches(self.x), Inches(self.y), Inches(self.w), Inches(self.h))


# ---------- pptx ----------

def new_pres():
    p = Presentation()
    p.slide_width, p.slide_height = Inches(SW), Inches(SH)
    s = p.slides.add_slide(p.slide_layouts[6])
    return p, s


def text(s, x, y, w, h, t, size=16, color=TEXT, bold=False, align="center", anchor="middle"):
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = {"top": MSO_ANCHOR.TOP, "middle": MSO_ANCHOR.MIDDLE, "bottom": MSO_ANCHOR.BOTTOM}[anchor]
    lines = t.split("\n")
    for i, ln in enumerate(lines):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.alignment = {"center": PP_ALIGN.CENTER, "left": PP_ALIGN.LEFT, "right": PP_ALIGN.RIGHT}[align]
        r = para.add_run()
        r.text = ln
        f = r.font
        f.size, f.bold, f.name = Pt(size), bold, FONT
        f.color.rgb = rgb(color)
        rPr = r._r.get_or_add_rPr()
        for tag in ("a:latin", "a:ea", "a:cs"):
            el = rPr.find(qn(tag))
            if el is None:
                el = etree.SubElement(rPr, qn(tag))
            el.set("typeface", FONT)
    return tb


def box(s, x, y, w, h, fill="#FFFFFF", line=NAVY, lw=1.5, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.12):
    sh = s.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    if shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        sh.adjustments[0] = radius
    if fill is None:
        sh.fill.background()
    else:
        sh.fill.solid()
        sh.fill.fore_color.rgb = rgb(fill)
    if line is None:
        sh.line.fill.background()
    else:
        sh.line.color.rgb = rgb(line)
        sh.line.width = Pt(lw)
    sh.shadow.inherit = False
    st = sh._element.find(qn("p:style"))
    if st is not None:  # テーマの影を消す
        sh._element.remove(st)
    return sh


def pill(s, x, y, w, h, t, fill=NAVY, color="#FFFFFF", size=15):
    box(s, x, y, w, h, fill=fill, line=None, radius=0.5)
    text(s, x, y, w, h, t, size=size, color=color, bold=True)


def line(s, x1, y1, x2, y2, color=TEXT, lw=1.5, head=False, dash=False):
    c = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    c.line.color.rgb = rgb(color)
    c.line.width = Pt(lw)
    ln = c.line._get_or_add_ln()
    if dash:
        d = etree.SubElement(ln, qn("a:prstDash"))
        d.set("val", "dash")
    if head:
        t = etree.SubElement(ln, qn("a:tailEnd"))
        t.set("type", "triangle")
        t.set("w", "med")
        t.set("len", "med")
    return c


def formula(s, tex, cx, cy, size=20, color=TEXT, anchor="center"):
    path, w, h = mathimg(tex, size, color)
    x = cx - w / 2 if anchor == "center" else cx
    s.shapes.add_picture(path, Inches(x), Inches(cy - h / 2), Inches(w), Inches(h))
    return w, h


def npdf(x, mu=0.0, var=1.0):
    return np.exp(-(x - mu) ** 2 / (2 * var)) / np.sqrt(2 * math.pi * var)


def Phi(z):
    return 0.5 * (1 + math.erf(z / math.sqrt(2)))


# =====================================================================
# 図1 正規分布と μ±kσ に入る割合
# =====================================================================
def fig1():
    p, s = new_pres()
    P = Panel(0.9, 2.55, 11.5, 4.75, (0.02, 0.15, 0.96, 0.83), (-4, 4), (0, 0.42))
    ax = P.ax
    ax.spines["left"].set_visible(False)
    ax.set_yticks([])
    x = np.linspace(-4, 4, 1601)
    y = npdf(x)
    for k, col in [(3, NAVY_L), (2, NAVY_M), (1, NAVY)]:
        m = (x >= -k) & (x <= k)
        ax.fill_between(x[m], 0, y[m], color=col, lw=0)
    ax.plot(x, y, color=TEXT, lw=2.2)
    for k in (-3, -2, -1, 1, 2, 3):
        ax.plot([k, k], [0, npdf(k)], color="#FFFFFF", lw=1.2)
    ax.plot([0, 0], [0, npdf(0)], color="#FFFFFF", lw=1.2, ls=(0, (4, 3)))
    ax.set_xticks([-3, -2, -1, 0, 1, 2, 3])
    ax.set_xticklabels([r"$\mu-3\sigma$", r"$\mu-2\sigma$", r"$\mu-1\sigma$", r"$\mu$",
                        r"$\mu+1\sigma$", r"$\mu+2\sigma$", r"$\mu+3\sigma$"], fontsize=21, color=TEXT)
    P.place(s, "normal")

    # 各帯に入る割合（片側、小数第2位。2倍して足すと上の範囲の値と一致する）
    a1 = (Phi(1) - Phi(0)) * 100   # 34.13
    a2 = (Phi(2) - Phi(1)) * 100   # 13.59
    a3 = (Phi(3) - Phi(2)) * 100   # 2.14
    a4 = (1 - Phi(3)) * 100        # 0.13
    base = P.sy(0)
    for sg in (-1, 1):
        text(s, P.sx(sg * 0.5) - 0.7, base - 1.0, 1.4, 0.4, f"{a1:.2f}%", 20, "#FFFFFF", True)
        text(s, P.sx(sg * 1.5) - 0.7, base - 0.5, 1.4, 0.4, f"{a2:.2f}%", 18, "#172E4A", True)
        # 2σ〜3σ と 3σ の外は帯が薄いので、引き出し線でつなぐ
        lx3, ly3 = P.sx(sg * 2.4), base - 0.99
        line(s, P.sx(sg * 2.4), P.sy(npdf(2.4) * 0.45), lx3, ly3 + 0.38, AXIS, 1.0)
        text(s, lx3 - 0.7, ly3, 1.4, 0.38, f"{a3:.2f}%", 18, TEXT, True)
        lx4, ly4 = P.sx(sg * 3.45), base - 0.75
        line(s, P.sx(sg * 3.3), P.sy(0.002), lx4, ly4 + 0.38, AXIS, 1.0)
        text(s, lx4 - 0.7, ly4, 1.4, 0.38, f"{a4:.2f}%", 17, GRAY)

    # μ±kσ の範囲（ブラケット）。上から ±3σ, ±2σ, ±1σ
    for i, k in enumerate((3, 2, 1)):
        yb = 0.95 + i * 0.64
        xl, xr = P.sx(-k), P.sx(k)
        line(s, xl, yb, xr, yb, TEXT, 1.5)
        line(s, xl, yb, xl, yb + 0.16, TEXT, 1.5)
        line(s, xr, yb, xr, yb + 0.16, TEXT, 1.5)
        pct = (Phi(k) - Phi(-k)) * 100
        path, fw, fh = mathimg(rf"\mu \pm {k}\sigma", 21)
        tw = 1.55  # 「：約99.7%」の幅（20pt）
        x0 = P.sx(0) - (fw + tw) / 2
        s.shapes.add_picture(path, Inches(x0), Inches(yb - 0.24 - fh / 2), Inches(fw), Inches(fh))
        text(s, x0 + fw + 0.02, yb - 0.44, tw, 0.4, f"：約{pct:.1f}%", 20, TEXT, True, "left")
    p.save(os.path.join(OUT, "01_正規分布と標準偏差の範囲.pptx"))


# =====================================================================
# 図2 中心極限定理の流れ（母集団 → 標本 n 個 × m 回 → 標本平均 → 分布）
# =====================================================================
def fig2():
    p, s = new_pres()
    rng = np.random.default_rng(0)
    n, m = 30, 10000
    hy = 0.65
    ay = 2.95  # 横矢印の高さ

    # --- 左：母集団（指数分布 λ=1：μ=1, σ²=1）
    pill(s, 0.3, hy, 3.4, 0.52, "母集団（指数分布）", NAVY, size=18)
    P = Panel(0.3, 1.3, 3.4, 3.1, (0.1, 0.2, 0.85, 0.75), (0, 5), (0, 1.1))
    xx = np.linspace(0, 5, 500)
    P.ax.fill_between(xx, 0, np.exp(-xx), color=NAVY_L, lw=0)
    P.ax.plot(xx, np.exp(-xx), color=NAVY, lw=2.2)
    P.ax.axvline(1, color=TEXT, lw=1.3, ls=(0, (4, 3)))
    P.ax.set_xticks([0, 1, 2, 3, 4, 5])
    P.ax.set_yticks([])
    P.ax.spines["left"].set_visible(False)
    P.ax.set_xlabel(r"$x$", fontsize=19, color=TEXT, labelpad=2)
    P.place(s, "population")
    formula(s, r"\mu = 1", P.sx(1) + 0.1, P.sy(1.0), 19, anchor="left")
    formula(s, r"\lambda = 1:\ \ \mu = 1,\ \ \sigma^2 = 1", 2.0, 4.8, 22)
    text(s, 0.2, 5.17, 3.6, 0.4, "分布の形は不問（分散は有限）", 17, GRAY)

    # 矢印：無作為抽出（注釈は矢印の上）
    line(s, 3.75, ay, 4.5, ay, TEXT, 1.75, head=True)
    text(s, 3.55, ay - 0.82, 1.15, 0.72, "無作為\n抽出", 17, TEXT, anchor="bottom")

    # --- 中央：標本 n 個 × 反復 m 回 と、それぞれの標本平均
    pill(s, 4.55, hy, 4.5, 0.52, f"標本 n = {n} × 反復 m = {m:,}", NAVY, size=18)
    rows = [("1", r"\bar{x}^{(1)}"), ("2", r"\bar{x}^{(2)}"), (None, None), ("m", r"\bar{x}^{(m)}")]
    y0, rh = 1.5, 0.66
    for i, (k, xb) in enumerate(rows):
        yy = y0 + i * 0.86
        if k is None:
            text(s, 5.75, yy - 0.05, 1.0, rh, "⋮", 26, GRAY)
            text(s, 7.9, yy - 0.05, 1.0, rh, "⋮", 26, GRAY)
            continue
        path, fw, fh = mathimg(rf"j = {k}", 18, GRAY)  # 箱の左に右揃え
        s.shapes.add_picture(path, Inches(5.13 - fw), Inches(yy + rh / 2 - fh / 2), Inches(fw), Inches(fh))
        box(s, 5.25, yy, 2.05, rh, fill="#FFFFFF", line=NAVY, lw=1.4)
        formula(s, r"x_1,\ \ldots,\ x_n", 5.25 + 1.025, yy + rh / 2, 22)
        line(s, 7.35, yy + rh / 2, 7.8, yy + rh / 2, TEXT, 1.5, head=True)
        box(s, 7.85, yy + 0.02, 1.1, rh - 0.04, fill="#FFF1E6", line=ORANGE, lw=1.4, radius=0.5)
        formula(s, xb, 7.85 + 0.55, yy + rh / 2, 22)
    text(s, 7.6, y0 - 0.34, 1.6, 0.34, "標本平均", 17, TEXT)
    formula(s, r"\bar{x}^{(j)} = \dfrac{1}{n}\,\sum_{i=1}^{n}\, x_i^{(j)}", 6.75, 5.3, 22)

    # 矢印：標本平均の集計
    line(s, 9.08, ay, 9.85, ay, TEXT, 1.75, head=True)
    text(s, 8.92, ay - 0.82, 1.1, 0.72, "標本平均\nの集計", 17, TEXT, anchor="bottom")

    # --- 右：標本平均の分布（シミュレーション）と N(μ, σ²/n)
    pill(s, 9.75, hy, 3.3, 0.52, "標本平均の分布", NAVY, size=18)
    xbar = rng.exponential(1.0, size=(m, n)).mean(axis=1)
    P2 = Panel(9.75, 1.3, 3.4, 3.1, (0.08, 0.2, 0.88, 0.75), (0.4, 1.7), (0, 2.6))
    bins = np.linspace(0.4, 1.7, 44)
    P2.ax.hist(xbar, bins=bins, density=True, color=NAVY_M, edgecolor="#FFFFFF", lw=0.5)
    xs = np.linspace(0.4, 1.7, 400)
    P2.ax.plot(xs, npdf(xs, 1.0, 1.0 / n), color=ORANGE, lw=2.4, zorder=3)
    P2.ax.axvline(1, color=TEXT, lw=1.3, ls=(0, (4, 3)))
    P2.ax.set_xticks([0.5, 1.0, 1.5])
    P2.ax.set_yticks([])
    P2.ax.spines["left"].set_visible(False)
    P2.ax.set_xlabel(r"$\bar{x}$", fontsize=19, color=TEXT, labelpad=2)
    P2.place(s, "xbar")
    formula(s, r"\mu = 1", P2.sx(1) + 0.1, P2.sy(2.45), 19, anchor="left")
    formula(s, r"\bar{X}\ \overset{\cdot}{\sim}\ N(\mu,\ \sigma^2/n)", 11.45, 4.8, 22, ORANGE)
    text(s, 9.75, 5.17, 3.4, 0.4, "大標本での正規近似", 17, GRAY)

    # 凡例（下に1行、スライド中央にそろえる）
    ly = 6.45
    dx = 0.42
    box(s, 1.3 + dx + 0.15, ly - 0.34, 9.2, 0.68, fill="#FFFFFF", line="#D5DAE1", lw=0.75)
    text(s, 1.6 + dx, ly - 0.2, 0.8, 0.4, "凡例", 17, GRAY, True, "left")
    box(s, 2.3 + dx, ly - 0.13, 0.45, 0.26, fill=NAVY_M, line=None, shape=MSO_SHAPE.RECTANGLE)
    text(s, 2.85 + dx, ly - 0.2, 2.8, 0.4, "標本平均のヒストグラム", 17, TEXT, align="left")
    line(s, 5.75 + dx, ly, 6.2 + dx, ly, ORANGE, 2.4)
    fw, _ = formula(s, r"N(\mu,\ \sigma^2/n)", 6.3 + dx, ly, 22, anchor="left")
    text(s, 6.3 + dx + fw + 0.04, ly - 0.2, 1.0, 0.4, "の密度", 17, TEXT, align="left")
    line(s, 9.05 + dx, ly, 9.6 + dx, ly, TEXT, 1.5, dash=True)
    text(s, 9.7 + dx, ly - 0.2, 1.1, 0.4, "母平均", 17, TEXT, align="left")
    p.save(os.path.join(OUT, "02_中心極限定理の流れ.pptx"))


# =====================================================================
# 図3 サイコロ n 個の目の平均の分布（厳密な確率質量）と正規近似
# =====================================================================
def dice_mean_pmf(n):
    pmf = np.array([1.0])
    die = np.ones(6) / 6
    for _ in range(n):
        pmf = np.convolve(pmf, die)
    sums = np.arange(n, 6 * n + 1)
    return sums / n, pmf


def fig3():
    p, s = new_pres()
    mu, var = 3.5, 35 / 12
    ns = [1, 2, 5, 30]
    pw, ph = 6.1, 2.9
    pos = [(0.75, 0.2), (7.05, 0.2), (0.75, 3.25), (7.05, 3.25)]
    for n, (x0, y0) in zip(ns, pos):
        xs, pmf = dice_mean_pmf(n)
        assert abs(pmf.sum() - 1) < 1e-12 and len(xs) == 5 * n + 1
        yt = {1: [0, 0.1, 0.2], 2: [0, 0.1, 0.2], 5: [0, 0.05, 0.1], 30: [0, 0.02, 0.04]}[n]
        ymax = max(pmf.max(), npdf(mu, mu, var / n) / n) * 1.2
        ymax = max(ymax, yt[-1] * 1.25)  # 最上段の目盛が見出し行に重ならないように
        P = Panel(x0, y0, pw, ph, (0.14, 0.2, 0.83, 0.7), (0.5, 6.5), (0, ymax))
        if n < 30:
            P.ax.bar(xs, pmf, width=0.8 / n, color=NAVY_M, edgecolor=NAVY, lw=0.8)
        else:
            P.ax.bar(xs, pmf, width=1.0 / n, color=NAVY_M, edgecolor="none")
        xx = np.linspace(0.5, 6.5, 800)
        # 確率質量（棒の高さ）と比べるため、密度に刻み幅 1/n をかける
        P.ax.plot(xx, npdf(xx, mu, var / n) / n, color=ORANGE, lw=2.0, zorder=3)
        P.ax.set_xticks([1, 2, 3, 3.5, 4, 5, 6])
        P.ax.set_xticklabels(["1", "2", "3", "", "4", "5", "6"])
        P.ax.set_yticks(yt)
        P.ax.set_yticklabels([f"{v:g}" for v in yt])
        P.ax.axvline(mu, color=TEXT, lw=1.2, ls=(0, (4, 3)))
        P.place(s, f"dice{n}")
        pill(s, x0 + 1.0, y0 + 0.02, 1.35, 0.46, f"n = {n}", NAVY, size=18)
        path, fw, fh = mathimg(r"\mu = 3.5", 19)  # 破線の左に置く
        s.shapes.add_picture(path, Inches(P.sx(3.5) - 0.08 - fw), Inches(y0 + 0.24 - fh / 2), Inches(fw), Inches(fh))
        text(s, P.sx(6.5) - 2.6, y0 + 0.05, 2.6, 0.4, f"取りうる値 {len(xs)} 通り", 16, GRAY, align="right")
    # 軸の名前（共通）
    for x0, y0 in pos[2:]:
        text(s, x0 + 0.8, y0 + ph - 0.02, pw - 0.8, 0.4, "標本平均（n個の目の平均）", 17, TEXT)
    for x0, y0 in pos[::2]:
        text(s, x0 - 0.5, y0 + ph / 2 - 0.85, 0.4, 1.4, "確\n率\n質\n量", 16, TEXT)

    # 凡例（下に1行、スライド中央にそろえる）
    ly = 6.98
    dx = 0.68
    box(s, 0.9 + dx, ly - 0.3, 10.27, 0.6, fill="#FFFFFF", line="#D5DAE1", lw=0.75)
    text(s, 1.05 + dx, ly - 0.2, 0.8, 0.4, "凡例", 16, GRAY, True, "left")
    box(s, 1.85 + dx, ly - 0.13, 0.45, 0.26, fill=NAVY_M, line=NAVY, lw=0.8, shape=MSO_SHAPE.RECTANGLE)
    text(s, 2.4 + dx, ly - 0.2, 3.4, 0.4, "確率質量（厳密値）", 16, TEXT, align="left")
    line(s, 5.1 + dx, ly, 5.55 + dx, ly, ORANGE, 2.4)
    fw, _ = formula(s, r"N(3.5,\,35/(12n))", 5.65 + dx, ly, 19, anchor="left")
    tx = 5.65 + dx + fw + 0.04
    text(s, tx, ly - 0.2, 0.8, 0.4, "の密度", 16, TEXT, align="left")
    formula(s, r"\times\,1/n", tx + 0.7, ly, 19, anchor="left")
    line(s, 9.75 + dx, ly, 10.3 + dx, ly, TEXT, 1.5, dash=True)
    text(s, 10.4 + dx, ly - 0.2, 1.3, 0.4, "母平均", 16, TEXT, align="left")
    p.save(os.path.join(OUT, "03_サイコロの目の平均の分布.pptx"))


fig1()
fig2()
fig3()
print("done")
