// compact no.37「メモリのポインタと型変換」の図1〜3（zukai-diagrams 準拠）
// 使い方: node figs.js <出力フォルダ>   → 続けて bash render.sh <出力フォルダ> で PNG（2000px）
// 文字は 14pt 以上（名前・値は 15〜16pt 太字）。記事幅 約800px でも読める大きさにする
// 色の意味：navy＝int（x・int *p）／teal＝ポインタ・1バイト単位（p の中身・unsigned char *c）／gray＝関係ない領域／pink＝同じビット列
const Z = require("./zukai.js");
const path = require("path");
const OUT = process.argv[2] || ".";

const K = {
  navy: {c: "2E5E8E", f: "EEF3F9"},
  teal: {c: "1E8A82", f: "E8F5F3"},
  gray: {c: "6B7280", f: "F1F3F4"},
  red: {c: "C0392B", f: "FBEEEC"},
};
const MUTED = Z.C.muted, PINK = Z.C.pink;

function art() {
  const p = Z.article({title: "ポインタと型変換 図", author: "Nico"});
  Object.assign(Z.FS, {label: 14, sub: 14, arrow: 14, box: 14});
  return p;
}

// メモリの1バイト（値＋アドレス下4桁）
function cell(s, x, y, w, h, val, addr, k) {
  s.addShape("rect", {x, y, w, h, fill: {color: K[k].f}, line: {color: K[k].c, width: 1.25}});
  Z.T(s, [
    {text: val, options: {bold: true, fontSize: 16, color: k === "gray" ? MUTED : K[k].c, breakLine: true}},
    {text: addr, options: {fontSize: 14, color: MUTED}},
  ], {x, y: y + 0.06, w, h: h - 0.12, align: "center", valign: "middle"});
}
// 角括弧（上向き＝up:true なら下に開く）
function bracket(s, x1, x2, y, up, color) {
  const d = up ? 0.14 : -0.14;
  Z.arrow(s, [[x1, y + d], [x1, y], [x2, y], [x2, y + d]], null, {head: "none", color, width: 1.5});
}
// 小さなピル（ポインタの位置）
function pill(s, cx, y, text, k, w = 0.8) {
  s.addText(text, {shape: "roundRect", rectRadius: 0.12, x: cx - w / 2, y, w, h: 0.32, fill: {color: K[k].c}, line: {type: "none"},
    fontFace: Z.FONT.en, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0});
}
// 値の箱（見出し＋本文）
function vbox(s, x, y, w, h, head, lines, k) {
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.1, fill: {color: K[k].f}, line: {color: K[k].c, width: 1.5}});
  Z.T(s, head, {x, y: y + 0.1, w, h: 0.34, fontSize: 15, bold: true, color: K[k].c, align: "center", valign: "middle"});
  s.addShape("line", {x: x + 0.2, y: y + 0.5, w: w - 0.4, h: 0, line: {color: K[k].c, width: 0.75}});
  const runs = lines.map((l, i) => ({text: l.t, options: {bold: !!l.b, fontSize: l.fs || 14, color: l.c || Z.C.text, breakLine: i < lines.length - 1}}));
  Z.T(s, runs, {x: x + 0.1, y: y + 0.56, w: w - 0.2, h: h - 0.64, align: "center", valign: "middle", lineSpacingMultiple: 1.1});
  return {l: [x, y + h / 2], r: [x + w, y + h / 2], t: [x + w / 2, y], b: [x + w / 2, y + h]};
}
// 凡例（下端に横1列、中央寄せ）
function clegend(s, items, y, colW = 1.9) {
  const h = 0.42, ww = 0.7 + items.reduce((a, it) => a + (it[2] || colW), 0), x0 = (10 - ww) / 2;
  s.addShape("roundRect", {x: x0, y, w: ww, h, rectRadius: 0.08, fill: {color: "FFFFFF"}, line: {color: Z.C.grid, width: 0.75}});
  Z.T(s, "凡例", {x: x0 + 0.1, y: y + 0.07, w: 0.56, h: 0.28, fontSize: 14, bold: true, color: MUTED, valign: "middle"});
  let sx = x0 + 0.7;
  for (const [kind, text, cw0] of items) {
    const cw = cw0 || colW, yy = y + h / 2;
    if (K[kind]) s.addShape("rect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, fill: {color: K[kind].f}, line: {color: K[kind].c, width: 1.5}});
    else if (kind.startsWith("pill")) s.addShape("roundRect", {x: sx - 0.04, y: yy - 0.11, w: 0.44, h: 0.22, rectRadius: 0.1, fill: {color: K[kind.slice(4)].c}, line: {type: "none"}});
    else if (kind.startsWith("arrow")) Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 1.75, color: K[kind.slice(5)].c});
    else if (kind === "accent") Z.T(s, "0x…", {x: sx - 0.04, y: yy - 0.14, w: 0.46, h: 0.28, fontSize: 14, bold: true, color: PINK, align: "center", valign: "middle"});
    else Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 1.5});
    Z.T(s, text, {x: sx + 0.48, y: yy - 0.14, w: cw - 0.5, h: 0.28, fontSize: 14, valign: "middle"});
    sx += cw;
  }
}

// ---- 図1：メモリとポインタ ----
async function fig1() {
  const p = art(), s = Z.canvas(p);
  const CW = 1.0, CH = 0.8, X0 = 1.0, CY = 2.25;
  const cells = [["??", "ccfe", "gray"], ["??", "ccff", "gray"], ["78", "cd00", "navy"], ["56", "cd01", "navy"],
    ["34", "cd02", "navy"], ["12", "cd03", "navy"], ["??", "cd04", "gray"], ["??", "cd05", "gray"]];
  cells.forEach(([v, a, k], i) => cell(s, X0 + i * CW, CY, CW, CH, v, a, k));
  // p（ポインタ変数）
  const px = X0 + 2 * CW + CW / 2;   // cd00 の中心
  vbox(s, px - 1.75, 0.2, 3.5, 1.2, "p（int *、8バイト）", [{t: "0x7ffdaefbcd00", b: true, fs: 16, c: K.navy.c}], "navy");
  Z.arrow(s, [[px, 1.4], [px, CY]], "p の指す先（*p で読み出し）", {w: 3.4, h: 0.32, width: 1.75});
  // x の範囲
  const bx1 = X0 + 2 * CW + 0.04, bx2 = X0 + 6 * CW - 0.04, by = CY + CH + 0.16;
  bracket(s, bx1, bx2, by + 0.14, true, K.navy.c);
  Z.T(s, [{text: "x（int、4バイト）＝ ", options: {}}, {text: "0x12345678", options: {}}],
    {x: bx1 - 0.5, y: by + 0.22, w: bx2 - bx1 + 1.0, h: 0.32, fontSize: 15, bold: true, color: K.navy.c, align: "center", valign: "middle"});
  // アドレスの向き
  Z.arrow(s, [[X0, 4.05], [X0 + 8 * CW, 4.05]], "小さいアドレス → 大きいアドレス（下4桁のみ表示）", {below: true, w: 6.0, color: MUTED});
  // 注記
  Z.note(s, 5.75, 0.3, 4.15, 1.05, [
    {text: "リトルエンディアン（x86_64）", options: {bold: true, breakLine: true}},
    {text: "下位バイト 0x78 を小さいアドレス側に配置", options: {}},
  ]);
  clegend(s, [["navy", "int の x・int * の p", 2.9], ["gray", "x の外の領域", 2.2]], 4.75);
  await Z.save(p, path.join(OUT, "01_メモリとポインタ.pptx"));
}

// ---- 図2：ポインタの型で変わる読み方 ----
async function fig2() {
  const p = art(), s = Z.canvas(p);
  const CW = 0.9, CH = 0.8, X0 = 2.6, CY = 2.05;
  const cells = [["78", "cd00", "navy"], ["56", "cd01", "navy"], ["34", "cd02", "navy"], ["12", "cd03", "navy"],
    ["??", "cd04", "gray"], ["??", "cd05", "gray"], ["??", "cd06", "gray"], ["??", "cd07", "gray"]];
  cells.forEach(([v, a, k], i) => cell(s, X0 + i * CW, CY, CW, CH, v, a, k));
  const cx = (i) => X0 + i * CW + CW / 2;

  // 上：int *p
  Z.T(s, "int *p", {x: 0.0, y: 1.36, w: 2.08, h: 0.36, fontSize: 16, bold: true, color: K.navy.c, align: "right", valign: "middle"});
  bracket(s, X0 + 0.04, X0 + 4 * CW - 0.04, 1.0, false, K.navy.c);
  Z.T(s, [{text: "*p：4バイトを int で読み出し → ", options: {}}, {text: "0x12345678", options: {bold: true}}],
    {x: X0 - 0.4, y: 0.42, w: 4 * CW + 2.6, h: 0.34, fontSize: 15, color: K.navy.c, align: "left", valign: "middle"});
  pill(s, cx(0), 1.38, "p", "navy");
  pill(s, cx(4), 1.38, "p + 1", "navy");
  Z.arrow(s, [[cx(0), 1.7], [cx(0), CY]], null, {width: 1.5, color: K.navy.c});
  Z.arrow(s, [[cx(4), 1.7], [cx(4), CY]], null, {width: 1.5, color: K.navy.c});
  Z.T(s, "+4バイト（sizeof(int)）", {x: cx(4) + 0.5, y: 1.38, w: 2.6, h: 0.32, fontSize: 14, bold: true, color: K.navy.c, valign: "middle"});

  // 下：unsigned char *c
  const ly = CY + CH;
  Z.T(s, "unsigned char *c",
    {x: 0.0, y: ly + 0.31, w: 2.08, h: 0.36, fontSize: 16, bold: true, color: K.teal.c, align: "right", valign: "middle"});
  Z.arrow(s, [[cx(0), ly + 0.33], [cx(0), ly]], null, {width: 1.5, color: K.teal.c});
  Z.arrow(s, [[cx(1), ly + 0.33], [cx(1), ly]], null, {width: 1.5, color: K.teal.c});
  pill(s, cx(0), ly + 0.33, "c", "teal");
  pill(s, cx(1), ly + 0.33, "c + 1", "teal");
  Z.T(s, "+1バイト（sizeof(unsigned char)）", {x: cx(1) + 0.5, y: ly + 0.33, w: 3.4, h: 0.32, fontSize: 14, bold: true, color: K.teal.c, valign: "middle"});
  bracket(s, X0 + 0.04, X0 + CW - 0.04, ly + 0.9, true, K.teal.c);
  Z.T(s, [{text: "*c：1バイトを unsigned char で読み出し → ", options: {}}, {text: "0x78", options: {bold: true}}],
    {x: X0 - 0.4, y: ly + 1.12, w: 6.4, h: 0.34, fontSize: 15, color: K.teal.c, align: "left", valign: "middle"});

  Z.T(s, "p と c の中身は同じアドレス 0x7ffd…cd00", {x: 0.5, y: 4.55, w: 9, h: 0.3, fontSize: 14, color: MUTED, align: "center"});
  clegend(s, [["navy", "x（int の4バイト）", 2.4], ["pillnavy", "int *", 1.3], ["pillteal", "unsigned char *", 2.2], ["gray", "x の外の領域", 2.0]], 5.0);
  await Z.save(p, path.join(OUT, "02_ポインタの型で変わる読み方.pptx"));
}

// ---- 図3：値の変換とビット列の読み替え ----
async function fig3() {
  const p = art(), s = Z.canvas(p);
  const src = vbox(s, 0.3, 1.75, 3.1, 1.75, "float f = 3.7f", [
    {t: "0x406CCCCD", b: true, fs: 16, c: PINK},
    {t: "符号部 0・指数部 128", c: MUTED},
    {t: "仮数部 0x6CCCCD", c: MUTED},
  ], "gray");
  const top = vbox(s, 6.2, 0.35, 3.0, 1.45, "int", [{t: "0x00000003", b: true, fs: 16, c: K.navy.c}, {t: "＝ 3"}], "navy");
  const bot = vbox(s, 6.2, 3.45, 3.0, 1.45, "uint32_t", [{t: "0x406CCCCD", b: true, fs: 16, c: PINK}, {t: "＝ 1080872141"}], "teal");
  const bx = 3.85;
  Z.arrow(s, [[src.r[0], 2.3], [bx, 2.3], [bx, top.l[1]], [top.l[0], top.l[1]]],
    "(int)f：値の変換\nビット列の作り直し",
    {seg: 2, w: 2.6, h: 0.62, width: 1.75, color: K.navy.c});
  Z.arrow(s, [[src.r[0], 2.95], [bx, 2.95], [bx, bot.l[1]], [bot.l[0], bot.l[1]]],
    "memcpy：読み替え\nビット列のコピー",
    {seg: 2, w: 2.6, h: 0.62, width: 1.75, color: K.teal.c, below: true});
  clegend(s, [["gray", "元の float", 1.8], ["arrownavy", "値の変換", 1.6], ["arrowteal", "読み替え", 1.6], ["accent", "同じビット列", 1.9]], 5.1);
  await Z.save(p, path.join(OUT, "03_値の変換とビット列の読み替え.pptx"));
}

// ---- 図4：void * を介したポインタの型変換 ----
async function fig4() {
  const p = art(), s = Z.canvas(p);
  const BW = 2.3, BH = 1.2, ADDR = {t: "0x7ffd…cd00", b: true, fs: 15};
  const src = vbox(s, 0.25, 1.7, BW, BH, "int *p", [{...ADDR, c: K.navy.c}], "navy");
  const mid = vbox(s, 3.75, 1.55, BW, 1.5, "void *v", [{...ADDR, c: K.gray.c}, {t: "型情報なし", c: MUTED}], "gray");
  const ok = vbox(s, 7.6, 0.2, BW, BH, "int *q", [{...ADDR, c: K.navy.c}], "navy");
  const ng = vbox(s, 7.6, 3.0, BW, BH, "float *f", [{...ADDR, c: K.red.c}], "red");
  Z.arrow(s, [src.r, [mid.l[0], src.r[1]]], "暗黙の変換", {w: 1.3, width: 1.75});
  const bx = 6.35;
  Z.arrow(s, [[mid.r[0], 2.05], [bx, 2.05], [bx, ok.l[1]], ok.l], "元の型へ変換", {seg: 2, w: 1.25, dx: -0.1, width: 1.75, color: K.navy.c});
  Z.arrow(s, [[mid.r[0], 2.55], [bx, 2.55], [bx, ng.l[1]], ng.l], "別の型へ変換", {seg: 2, w: 1.25, dx: -0.1, width: 1.75, color: K.red.c, below: true});
  Z.T(s, [{text: "p == q の保証", options: {bold: true, breakLine: true}}, {text: "C11 6.3.2.3 1項", options: {color: MUTED}}],
    {x: ok.l[0], y: 1.46, w: BW, h: 0.62, fontSize: 14, color: K.navy.c, align: "center"});
  Z.T(s, [{text: "*f の読み書き：未定義動作", options: {bold: true, breakLine: true}}, {text: "strict aliasing 違反（C11 6.5 7項）", options: {color: MUTED}}],
    {x: ok.l[0] - 1.0, y: 4.26, w: BW + 1.4, h: 0.62, fontSize: 14, color: K.red.c, align: "center"});
  Z.T(s, "一般的な環境ではアドレス不変・型のみ変化", {x: 0.25, y: 4.45, w: 6.0, h: 0.32, fontSize: 14, color: MUTED, align: "center"});
  clegend(s, [["navy", "int *", 1.2], ["gray", "void *", 1.3], ["red", "互換性のない型（float *）", 2.9], ["line", "変換（色＝変換先の型）", 2.9]], 5.05);
  await Z.save(p, path.join(OUT, "04_voidポインタを介した型変換.pptx"));
}

(async () => { await fig1(); await fig2(); await fig3(); await fig4(); })();
