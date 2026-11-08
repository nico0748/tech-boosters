# ※図1は zukai-diagrams スキル準拠の zukai/図1生成スクリプト.js に移行（2026-11-06）。ここの図1は旧版なので使わない
# 図1：重み空間プログラミングの全体像（解析・修復・生成 × 入力・制約・処理・出力）
# 図2：従来の学習（勾配法）との違い
# 図3：実験8 Qwen3.5-0.8B の編集箇所
# 数値の出典：rikiyat.github.io/blog/weight-space-programming/ と github.com/RikiyaT/lm_understand-logs（exp8_math/runs/p50c）
# スイムレーン型＋アイコン＋レーンごとのアクセント色（writing-guides/figure-reference のお手本に準拠）
# アイコン：image/icons/svg/（Tabler Icons 風の線画アイコンを自作）
# 使い方：python3 図生成スクリプト.py <1|2|3> out.pptx
import sys, re, os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from PIL import Image

which, out = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__)); ICON = os.path.join(HERE, "icons")
JP = "Noto Sans CJK JP"; MONO = "DejaVu Sans Mono"
INK = RGBColor(0x1F,0x23,0x28); SUB = RGBColor(0x4B,0x55,0x63); EDGE = RGBColor(0x55,0x55,0x55)
BORDER = RGBColor(0xC8,0xCC,0xD2); WHITE = RGBColor(0xFF,0xFF,0xFF)
RED = RGBColor(0xC6,0x28,0x28); GREEN = RGBColor(0x2E,0x7D,0x32)
BLUE   = (RGBColor(0x2F,0x6F,0xDB), RGBColor(0xEE,0xF4,0xFD))
TEAL   = (RGBColor(0x13,0x8A,0x7E), RGBColor(0xEA,0xF6,0xF4))
ORANGE = (RGBColor(0xE0,0x7B,0x1A), RGBColor(0xFF,0xF4,0xE6))
VIOLET = (RGBColor(0x7C,0x4D,0xDB), RGBColor(0xF5,0xF1,0xFD))
SLATE  = RGBColor(0x2B,0x3A,0x4A)

HEIGHT = {"1": 8.6, "2": 7.5, "3": 8.2}[which]
prs = Presentation(); prs.slide_width = Inches(13.333); prs.slide_height = Inches(HEIGHT)
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

def node(x, y, w, h, ic, title, desc, accent, fill=WHITE, badge=None, badge_color=None, dsize=13):
    b = rect(x, y, w, h, fill, accent[0], MSO_SHAPE.ROUNDED_RECTANGLE, lw=1.75); b.adjustments[0] = 0.06
    icon(ic, x+w/2, y+0.34, 0.42)
    text(x+0.08, y+0.62, w-0.16, h-0.68, [(title, 15, INK, True)] + [(d, dsize, SUB, False) for d in desc], anchor=MSO_ANCHOR.TOP)
    if badge:
        bw = 0.62
        p = rect(x+w-bw-0.12, y-0.14, bw, 0.28, badge_color or accent[0], None, MSO_SHAPE.ROUNDED_RECTANGLE); p.adjustments[0] = 0.5
        text(x+w-bw-0.12, y-0.14, bw, 0.28, [(badge, 12, WHITE, True)])

def line(x1, y1, x2, y2, color=EDGE, head=True, dash=False):
    c = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    c.line.width = Pt(1.75); c.line.color.rgb = color
    ln = c.line._get_or_add_ln()
    if dash: ln.append(ln.makeelement(qn('a:prstDash'), {'val':'dash'}))
    if head: ln.append(ln.makeelement(qn('a:tailEnd'), {'type':'triangle','w':'med','len':'med'}))

def elabel(x, y, w, t, color=EDGE, align=PP_ALIGN.CENTER, bold=False):
    text(x, y, w, 0.3, [(t, 13, color, bold)], align=align)

def pill(x, y, w, h, t, color):
    p = rect(x, y, w, h, color, None, MSO_SHAPE.ROUNDED_RECTANGLE); p.adjustments[0] = 0.5
    text(x, y, w, h, [(t, 13, WHITE, True)])

L, R, HEAD = 0.3, 13.03, 2.75

def lanes(defs):
    for y0, y1, names, sub, acc, ic in defs:
        names = names if isinstance(names, list) else [names]
        rect(L, y0, R-L, y1-y0, acc[1])
        rect(L, y0, 0.09, y1-y0, acc[0])
        icon(ic, L+0.62, (y0+y1)/2, 0.6)
        text(L+1.0, y0, HEAD-0.95, y1-y0, [(n, 17, acc[0], True) for n in names] + [(t, 13, SUB, False) for t in sub], align=PP_ALIGN.LEFT)
    top, bot = defs[0][0], defs[-1][1]
    rect(L, top, R-L, bot-top, None, BORDER)
    line(L+HEAD, top, L+HEAD, bot, BORDER, head=False)

if which == "1":
    T = 0.95
    LH = (HEIGHT - 0.25 - T) / 4
    ys = [T + i*LH for i in range(5)]
    lanes([(ys[0], ys[1], "入力", ["LLM に渡すもの"], TEAL, "file-import_teal"),
           (ys[1], ys[2], "制約", ["許可された操作"], VIOLET, "lock_violet"),
           (ys[2], ys[3], "LLM の処理", ["GPT-6 Astra", "追加学習なし"], ORANGE, "robot_orange"),
           (ys[3], ys[4], "出力と評価", ["LLM が返すもの"], BLUE, "file-export_blue")])
    GAP = 0.35
    X0 = L + HEAD + 0.3; W = (R - 0.3 - X0 - 2*GAP) / 3
    xs = [X0 + i*(W+GAP) for i in range(3)]
    for x, t in zip(xs, ["解析 Read（実験 1〜3・7）", "修復 Fix（実験 4・8）", "生成 Write（実験 5・6）"]):
        pill(x, 0.3, W, 0.45, t, SLATE)
    NH = LH - 0.36; off = 0.18
    cols = [
      [("grid_teal", "重みテンソル", ["MLP `500→32→32→5` など", "タスク名は秘匿"]),
       ("code_violet", "静的解析が中心", ["forward pass なし", "※実験 7 のみ Attention 観測"]),
       ("eye_orange", "構造解析", ["重みの分布から役割を推定"]),
       ("message_blue", "推定ラベル", ["ゲーム 4/4・言語 3/3 正解", "迎合は重みのみで判別不可"])],
      [("bug_teal", "失敗する重み", ["PPO 方策・Qwen3.5-0.8B"]),
       ("ban_violet", "勾配・学習は禁止", ["forward pass 0〜50 回"]),
       ("tool_orange", "原因特定 → `ΔW`", ["小回路の追加・方向 `u` の減算"]),
       ("circle-check_blue", "編集後の重み", ["成功率 `0% → 100%`", "MATH-500 `7.9% → 48.1%`"])],
      [("file-text_teal", "仕様のみ", ["ルール・コード・I/O", "全重み `0` から開始"]),
       ("ban_violet", "データ・損失なし", ["forward pass 0〜50 回"]),
       ("pencil_orange", "重みを直接生成", ["最大 `1,480,274` params"]),
       ("gamepad_blue", "新規の重み", ["Breakout `517.4`", "（PPO 5 億 step：`25.3`）"])],
    ]
    accs = [TEAL, VIOLET, ORANGE, BLUE]
    for ci, col in enumerate(cols):
        for ri, (ic, t, d) in enumerate(col):
            fill = ORANGE[1] if ri == 2 else WHITE
            node(xs[ci], ys[ri]+off, W, NH, ic, t, d, accs[ri], fill=fill,
                 badge="LLM" if ri == 2 else None, badge_color=SLATE)
            if ri < 3:
                line(xs[ci]+W/2, ys[ri]+off+NH, xs[ci]+W/2, ys[ri+1]+off)

elif which == "2":
    lanes([(0.3, 3.75, "従来の学習", ["勾配法", "SGD・Adam など"], BLUE, "refresh_blue"),
           (3.75, 7.2, ["重み空間", "プログラミング"], ["LLM が値を決める"], ORANGE, "robot_orange")])
    GAP = 0.32
    X0 = L + HEAD + 0.25; W = (R - 0.25 - X0 - 4*GAP) / 5
    xs = [X0 + i*(W+GAP) for i in range(5)]
    Y1, H = 0.55, 1.75
    nodes1 = [("database_blue", "データ", ["`(x, y) ~ D`"]),
              ("arrow-forward_blue", "順伝播", ["`ŷ = f(x; θ)`"]),
              ("chart_blue", "損失", ["`L(ŷ, y)`"]),
              ("arrow-back_blue", "逆伝播", ["`∇θ L`"]),
              ("trending-down_blue", "更新", ["`θ ← θ − η∇θL`"])]
    for i, (ic, t, d) in enumerate(nodes1):
        node(xs[i], Y1, W, H, ic, t, d, BLUE)
        if i < 4: line(xs[i]+W, Y1+H/2, xs[i+1], Y1+H/2)
    yl = Y1 + H + 0.45
    line(xs[4]+W/2, Y1+H, xs[4]+W/2, yl, head=False)
    line(xs[4]+W/2, yl, xs[1]+W/2, yl, head=False)
    line(xs[1]+W/2, yl, xs[1]+W/2, Y1+H)
    elabel(xs[1]+W/2, yl+0.05, xs[4]-xs[1], "N ステップ反復（例：PPO 1 億〜10 億 step）")
    Y2 = 4.0
    nodes2 = [("file-text_orange", "仕様", ["自然言語", "ルール・I/O"], WHITE, None),
              ("grid_orange", "重み `θ`", ["テキスト化", "既存 or 全 `0`"], WHITE, None),
              ("robot_orange", "LLM が推論", ["構造を読んで", "原因を診断"], ORANGE[1], "LLM"),
              ("pencil_orange", "直接出力", ["`θ' = θ + ΔW`"], WHITE, None),
              ("circle-check_orange", "評価", ["ベンチマーク", "対戦・成功率"], WHITE, None)]
    for i, (ic, t, d, f, b) in enumerate(nodes2):
        node(xs[i], Y2, W, H, ic, t, d, ORANGE, fill=f, badge=b, badge_color=SLATE)
        if i < 4: line(xs[i]+W, Y2+H/2, xs[i+1], Y2+H/2)
    yl = Y2 + H + 0.45
    line(xs[3]+W/2, Y2+H, xs[3]+W/2, yl, head=False, dash=True)
    line(xs[3]+W/2, yl, xs[2]+W/2, yl, head=False, dash=True)
    line(xs[2]+W/2, yl, xs[2]+W/2, Y2+H, dash=True)
    elabel(xs[1], yl+0.1, xs[4]+W-xs[1], "forward pass で確認（予算 0〜50 回、実験 6・8 など）")
    elabel(xs[0], 6.8, xs[4]+W-xs[0], "使わないもの：損失関数・`backward()`・optimizer・訓練データへのフィッティング", RED)

else:
    lanes([(0.3, 3.0, "診断", ["forward pass で", "観察・比較"], BLUE, "target_blue"),
           (3.0, 5.6, "編集", ["`down_proj` の", "64 列 × 2 層"], ORANGE, "tool_orange"),
           (5.6, 7.9, "確認", ["選定に使っていない", "問題で検証"], TEAL, "flask_teal")])
    GAP = 0.32
    X0 = L + HEAD + 0.25; W = (R - 0.25 - X0 - 3*GAP) / 4
    xs = [X0 + i*(W+GAP) for i in range(4)]
    Y1, H1 = 0.5, 2.3
    d1 = [("bug_blue", "失敗の観察", ["練習 96 問中 85 問が", "32,768 トークン上限", "末尾は同じ言い回し"]),
          ("compare_blue", "文脈を対比", ["生産的な思考 vs", "反復する思考", "4 組の文脈"]),
          ("target_blue", "方向 `u` を推定", ["残差上の反復方向", "`u`（ノルム 1）", "L15・L19 の出力"]),
          ("layers_blue", "書き手を選ぶ", ["`u` に強く書き込む", "MLP ニューロン", "上位 64 個 / 層"])]
    for i, (ic, t, d) in enumerate(d1):
        node(xs[i], Y1, W, H1, ic, t, d, BLUE)
        if i < 3: line(xs[i]+W, Y1+H1/2, xs[i+1], Y1+H1/2)
    # 編集レーン：右の 2 列にまたがる広いノード
    Y2, H2 = 3.25, 2.1
    EW = 2*W + GAP
    node(xs[2], Y2, EW, H2, "pencil_orange", "`W = W₀ − 6·u (m ⊙ uᵀW₀)`",
         ["`W₀ ∈ ℝ^(1024×3584)`：`down_proj.weight`", "`m`：選んだ 64 列だけ 1 のマスク",
          "2 層 × 64 列 × 1,024 行 = 131,072 値（0.016%）"], ORANGE, fill=ORANGE[1], badge="LLM", badge_color=SLATE)
    node(xs[1], Y2, W, H2, "flask_orange", "対照実験（比較）", ["ノルムをそろえた", "ランダム方向", "+1.56 pt（SE 3.52）"], ORANGE)
    line(xs[3]+W/2, Y1+H1, xs[3]+W/2, Y2)
    line(xs[2], Y2+H2/2, xs[1]+W, Y2+H2/2, head=False, dash=True)
    # 確認レーン：右 → 左
    Y3, H3 = 5.85, 1.8
    d3 = [("refresh_teal", "上限到達の割合", ["MATH-500", "`93.0% → 33.1%`"]),
          ("chart_teal", "ベンチマーク", ["MATH-500 正答率", "`7.9% → 48.1%`"]),
          ("compare_teal", "内訳", ["救済 579・悪化 5", "救済の 576 問は", "元は上限で打ち切り"]),
          ("circle-check_teal", "練習問題で確認", ["未使用の 1,152 問", "`10.6% → 60.4%`"])]
    for i, (ic, t, d) in enumerate(d3):
        node(xs[i], Y3, W, H3, ic, t, d, TEAL)
        if i < 3: line(xs[i+1], Y3+H3/2, xs[i]+W, Y3+H3/2)
    line(xs[3]+W/2, Y2+H2, xs[3]+W/2, Y3)

prs.save(out)
