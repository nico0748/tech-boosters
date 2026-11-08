// compact no.26 ベクトルDB の図（01 埋め込みと近傍探索／02 コサイン類似度／03 HNSW の階層探索／04 書き込みと検索）
// 使い方: python3 math.py（数式PNGを math/ に作る） → node 図生成スクリプト.js <出力ディレクトリ>
const pptxgen = require("pptxgenjs"), JSZip = require("jszip"), fs = require("fs"), path = require("path");
const React = require("react"), RDS = require("react-dom/server"), sharp = require("sharp"), tb = require("react-icons/tb");

const OUT = process.argv[2] || ".";
const MATH = path.join(__dirname, "math");
const MS = JSON.parse(fs.readFileSync(path.join(MATH, "sizes.json"), "utf8"));
const FONT = {ja: "Hiragino Sans", en: "Helvetica Neue", mono: "Menlo"};
const C = {navy: "1F2A44", gray: "5F6368", line: "555555", white: "FFFFFF", border: "D5D9E0", edge: "B4BAC4",
  teal: "138A7E", tealBg: "EAF6F4", blue: "2F6FDB", blueBg: "EEF4FD", orange: "E07B1A", orangeBg: "FFF4E6",
  purple: "7C4DDB", purpleBg: "F5F1FD", red: "C62828", redBg: "FDECEC", slate: "3D4651", magenta: "B83C78",
  neutral: "8A919C", neutralBg: "F4F5F7"};
const FS = 13, FH = 14; // 本文 13pt・見出し 14pt（12pt 未満は使わない）

const cache = {};
async function icon(Comp, color) {
  const k = Comp.name + color; if (cache[k]) return cache[k];
  const svg = RDS.renderToStaticMarkup(React.createElement(Comp, {color: "#" + color, size: 256})).replace(/currentColor/g, "#" + color);
  return (cache[k] = "image/svg+xml;base64," + Buffer.from(svg).toString("base64"));
}
const T = (s, text, o) => s.addText(text, {isTextBox: true, margin: 0, fontFace: FONT.en, fontSize: FS, color: C.navy, valign: "top", ...o});
// 数式PNG（実寸）。anchor: "l"=左端/"c"=中央/"r"=右端、y は上端
function M(s, name, x, y, anchor = "l", scale = 1) {
  const [w, h] = MS[name].map((v) => v * scale);
  const xx = anchor === "c" ? x - w / 2 : anchor === "r" ? x - w : x;
  s.addImage({path: path.join(MATH, name + ".png"), x: xx, y, w, h});
  return {w, h, x: xx, y};
}
function newDeck() {
  const p = new pptxgen(); p.layout = "LAYOUT_16x9"; // 10 x 5.625 in
  p.theme = {headFontFace: FONT.en, bodyFontFace: FONT.en};
  return p;
}
// レーン：淡い背景＋左端の濃い帯、見出し列（アイコン＋太字名＋グレー補足）
async function lane(s, y, h, accent, bg, name, sub, Ico, o = {}) {
  const w = o.w || 9.7, hw = o.hw || 1.12;
  s.addShape("rect", {x: 0.15, y, w, h, fill: {color: bg}, line: {type: "none"}});
  s.addShape("rect", {x: 0.15, y, w: 0.08, h, fill: {color: accent}, line: {type: "none"}});
  const nl = sub.split("\n").length, blockH = 0.46 + 0.26 * (name.split("\n").length + nl);
  const top = y + (h - blockH) / 2;
  s.addImage({data: await icon(Ico, accent), x: 0.23 + hw / 2 - 0.21, y: top, w: 0.42, h: 0.42});
  const nm = name.split("\n").map((t) => ({text: t, options: {bold: true, color: accent, fontSize: FH, breakLine: true}}));
  const sb = sub.split("\n").map((t, i, a) => ({text: t, options: {color: C.gray, breakLine: i < a.length - 1}}));
  T(s, [...nm, ...sb], {x: 0.23, y: top + 0.46, w: hw, h: blockH - 0.46, align: "center", lineSpacingMultiple: 0.95});
}
// ノード：白地＋アクセント枠、上部にアイコン、太字タイトル＋説明（2行まで）
async function node(s, cx, cy, w, h, accent, Ico, title, desc, o = {}) {
  const x = cx - w / 2, y = cy - h / 2;
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.1, fill: {color: o.fill || C.white}, line: {color: accent, width: 1.75}});
  s.addImage({data: await icon(Ico, accent), x: cx - 0.19, y: y + 0.09, w: 0.38, h: 0.38});
  const runs = [{text: title, options: {bold: true, fontSize: FH, color: C.navy, breakLine: !!desc}}];
  if (desc) desc.split("\n").forEach((d, i, a) => {
    const mono = d.startsWith("`");
    runs.push({text: mono ? d.slice(1) : d, options: {color: C.gray, fontFace: mono ? FONT.mono : FONT.en, breakLine: i < a.length - 1}});
  });
  T(s, runs, {x: x + 0.04, y: y + 0.5, w: w - 0.08, h: h - 0.54, align: "center", lineSpacingMultiple: 1.0});
  if (o.badge) {
    const bw = o.badge.w || 0.44, bx = x - 0.14, by = y - 0.14;
    s.addShape("roundRect", {x: bx, y: by, w: bw, h: 0.28, rectRadius: 0.14, fill: {color: o.badge.color}, line: {color: C.white, width: 1}});
    T(s, o.badge.text, {x: bx, y: by, w: bw, h: 0.28, bold: true, fontSize: 12, color: C.white, align: "center", valign: "middle"});
  }
  if (o.pill) {
    const pw = o.pill.w || 0.9;
    s.addShape("roundRect", {x: x + w - pw + 0.12, y: y - 0.14, w: pw, h: 0.28, rectRadius: 0.14, fill: {color: o.pill.color}, line: {type: "none"}});
    T(s, o.pill.text, {x: x + w - pw + 0.12, y: y - 0.14, w: pw, h: 0.28, bold: true, fontSize: 12, color: C.white, align: "center", valign: "middle"});
  }
  return {l: [x, cy], r: [x + w, cy], t: [cx, y], b: [cx, y + h], x, y, w, h, cx, cy};
}
// 線（矢印つき既定）。pts 3点以上で折れ線
function arrow(s, pts, o = {}) {
  const line = {color: o.color || C.line, width: o.width || 1.5, dashType: o.dash ? "dash" : "solid"};
  if (o.head !== false) line.endArrowType = "triangle";
  if (o.both) line.beginArrowType = "triangle";
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]), x0 = Math.min(...xs), y0 = Math.min(...ys);
  if (pts.length === 2) {
    const [[x1, y1], [x2, y2]] = pts;
    s.addShape("line", {x: x0, y: y0, w: Math.max(Math.abs(x2 - x1), 0.0001), h: Math.max(Math.abs(y2 - y1), 0.0001), flipH: x2 < x1, flipV: y2 < y1, line});
  } else s.addShape("custGeom", {x: x0, y: y0, w: Math.max(Math.max(...xs) - x0, 0.01), h: Math.max(Math.max(...ys) - y0, 0.01),
    points: pts.map(([x, y]) => ({x: x - x0, y: y - y0})), fill: {type: "none"}, line});
}
const label = (s, text, x, y, w, o = {}) => T(s, text, {x, y, w, h: o.h || 0.26, color: o.color || C.gray, align: o.align || "center", valign: o.valign || "middle", bold: o.bold, fontFace: o.mono ? FONT.mono : FONT.en, fontSize: o.fs || FS});
const dot = (s, cx, cy, r, color, o = {}) => s.addShape("ellipse", {x: cx - r, y: cy - r, w: 2 * r, h: 2 * r, fill: {color: o.fill || color}, line: {color: o.lineColor || color, width: o.lw || 1}});
const star = (s, cx, cy, r, color) => s.addShape("star5", {x: cx - r, y: cy - r, w: 2 * r, h: 2 * r, fill: {color}, line: {color: C.white, width: 0.75}});
// カード（白地＋薄い枠、左上に色付きの小さな帯＋太字見出し）
function card(s, x, y, w, h, accent, head) {
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.08, fill: {color: C.white}, line: {color: C.border, width: 1.25}});
  s.addShape("rect", {x: x + 0.18, y: y + 0.17, w: 0.07, h: 0.28, fill: {color: accent}, line: {type: "none"}});
  T(s, head, {x: x + 0.32, y: y + 0.14, w: w - 0.5, h: 0.34, bold: true, fontSize: FH, valign: "middle"});
}
// 凡例（横1列）
async function legend(s, y, items, x0 = 0.25) {
  let x = x0;
  T(s, "凡例", {x, y, w: 0.5, h: 0.3, bold: true, color: C.gray, valign: "middle"}); x += 0.55;
  for (const it of items) {
    const cy = y + 0.15;
    if (it.kind === "pill") {
      s.addShape("roundRect", {x, y: y + 0.01, w: it.pw, h: 0.28, rectRadius: 0.14, fill: {color: it.color}, line: {type: "none"}});
      T(s, it.sample, {x, y: y + 0.01, w: it.pw, h: 0.28, bold: true, fontSize: 12, color: C.white, align: "center", valign: "middle"}); x += it.pw + 0.07;
    } else if (it.kind === "dot") { dot(s, x + 0.1, cy, 0.08, it.color, it.o || {}); x += 0.26; }
    else if (it.kind === "star") { star(s, x + 0.12, cy, 0.12, it.color); x += 0.3; }
    else if (it.kind === "circle") { s.addShape("ellipse", {x, y: y + 0.02, w: 0.26, h: 0.26, fill: {type: "none"}, line: {color: it.color, width: 1.5, dashType: "dash"}}); x += 0.33; }
    else if (it.kind === "line") { arrow(s, [[x, cy], [x + 0.45, cy]], {color: it.color, dash: it.dash, width: it.width || 1.5, head: it.head}); x += 0.52; }
    else if (it.kind === "box") { s.addShape("roundRect", {x, y: y + 0.04, w: 0.36, h: 0.22, rectRadius: 0.05, fill: {color: it.fill}, line: {color: it.color, width: 1.5}}); x += 0.43; }
    T(s, it.text, {x, y, w: it.tw, h: 0.3, color: C.navy, valign: "middle"}); x += it.tw + 0.2;
    if (it.math) { const m = M(s, it.math, x - 0.2, y + 0.15 - MS[it.math][1] / 2); x += m.w + 0.05; }
  }
}

// ---------- 図1 埋め込みと近傍探索 ----------
async function fig1() {
  const p = newDeck(), s = p.addSlide(); s.background = {color: C.white};
  const LW = 6.4; // レーンの幅（右はベクトル空間のパネル）
  await lane(s, 0.15, 2.6, C.teal, C.tealBg, "文書", "事前に登録", tb.TbFiles, {w: LW, hw: 0.95});
  await lane(s, 2.9, 1.6, C.blue, C.blueBg, "質問", "検索ごと", tb.TbMessageQuestion, {w: LW, hw: 0.95});
  const docs = ["猫が好き", "ネコを飼っている", "犬の散歩", "SQLの書き方"];
  const vecs = ["[0.12, −0.48, …]", "[0.10, −0.53, …]", "[0.31, −0.22, …]", "[−0.62, 0.05, …]"];
  const cyA = 0.15 + 2.6 / 2, cyB = 2.9 + 0.8;
  const chipX = 1.27, chipW = 1.5, chipH = 0.42, gap = 0.14;
  const rowY = (i) => cyA - (4 * chipH + 3 * gap) / 2 + i * (chipH + gap) + chipH / 2;
  const chip = (cx0, cy, text, color) => {
    s.addShape("roundRect", {x: cx0, y: cy - chipH / 2, w: chipW, h: chipH, rectRadius: 0.08, fill: {color: C.white}, line: {color, width: 1.25}});
    T(s, text, {x: cx0, y: cy - chipH / 2, w: chipW, h: chipH, align: "center", valign: "middle"});
  };
  docs.forEach((d, i) => chip(chipX, rowY(i), d, C.teal));
  // 文書 → 埋め込みモデル（束ねて1本）
  const bx1 = chipX + chipW + 0.1;
  docs.forEach((_, i) => arrow(s, [[chipX + chipW, rowY(i)], [bx1, rowY(i)]], {head: false}));
  arrow(s, [[bx1, rowY(0)], [bx1, rowY(3)]], {head: false});
  const mA = await node(s, 3.68, cyA, 1.45, 1.45, C.teal, tb.TbVectorTriangle, "埋め込みモデル", "文章→ベクトル\n1536次元");
  arrow(s, [[bx1, cyA], mA.l]);
  // 埋め込みモデル → ベクトル（各行へ）
  const bx2 = mA.r[0] + 0.1, vx = bx2 + 0.1, vw = 1.75;
  arrow(s, [mA.r, [bx2, cyA]], {head: false});
  arrow(s, [[bx2, rowY(0)], [bx2, rowY(3)]], {head: false});
  vecs.forEach((v, i) => { arrow(s, [[bx2, rowY(i)], [vx, rowY(i)]]); label(s, v, vx + 0.04, rowY(i) - 0.15, vw, {mono: true, align: "left", h: 0.3, color: C.navy}); });
  // 質問
  chip(chipX, cyB, "猫の飼い方", C.blue);
  const mB = await node(s, 3.68, cyB, 1.45, 1.3, C.blue, tb.TbVectorTriangle, "埋め込みモデル", "文書側と同一\n1536次元");
  arrow(s, [[chipX + chipW, cyB], mB.l]);
  arrow(s, [mB.r, [vx, cyB]]);
  M(s, "q_eq", (mB.r[0] + vx) / 2 - 0.07, cyB - 0.36);
  label(s, "[0.11, −0.50, …]", vx + 0.04, cyB - 0.15, vw, {mono: true, align: "left", h: 0.3, color: C.navy});
  // ベクトル空間パネル
  const PX = 6.75, PY = 0.15, PW = 3.1, PH = 4.35;
  s.addShape("roundRect", {x: PX, y: PY, w: PW, h: PH, rectRadius: 0.06, fill: {color: C.white}, line: {color: C.border, width: 1.25}});
  T(s, [{text: "ベクトル空間", options: {bold: true, fontSize: FH, breakLine: true}}, {text: "2次元に簡略化（イメージ）", options: {color: C.gray}}], {x: PX + 0.15, y: PY + 0.12, w: PW - 0.3, h: 0.55});
  // 文書側・質問側からパネルへ
  const bx3 = vx + vw + 0.08;
  arrow(s, [[bx3, rowY(0)], [bx3, rowY(3)]], {head: false});
  vecs.forEach((_, i) => arrow(s, [[vx + vw - 0.01, rowY(i)], [bx3, rowY(i)]], {head: false}));
  arrow(s, [[bx3, cyA], [PX, cyA]]);
  arrow(s, [[bx3, cyB], [PX, cyB]]);
  // 点（文書）と質問 q、上位 3 件の円
  const q = [7.75, 2.35];
  const pts = [
    {p: [7.3, 2.1], t: "ネコを飼っている", lx: 6.88, ly: 1.7, lw: 1.6, al: "left"},
    {p: [7.4, 2.62], t: "猫が好き", lx: 6.98, ly: 2.76, lw: 0.9, al: "left"},
    {p: [8.55, 2.95], t: "犬の散歩", lx: 8.7, ly: 2.82, lw: 0.9, al: "left"},
    {p: [9.25, 4.0], t: "SQLの書き方", lx: 7.85, ly: 3.87, lw: 1.25, al: "right"},
  ];
  for (const d of pts.slice(0, 3)) arrow(s, [q, d.p], {color: C.orange, width: 1.25, dash: true, head: false});
  pts.forEach((d, i) => { dot(s, d.p[0], d.p[1], 0.085, C.teal, i < 3 ? {lineColor: C.orange, lw: 2.5} : {}); label(s, d.t, d.lx, d.ly, d.lw, {align: d.al, color: C.navy}); });
  star(s, q[0], q[1], 0.14, C.orange);
  M(s, "q_orange", q[0] + 0.14, q[1] - 0.36);
  await legend(s, 4.85, [
    {kind: "dot", color: C.teal, text: "文書のベクトル", tw: 1.3},
    {kind: "star", color: C.orange, text: "質問のベクトル", tw: 1.17, math: "q_leg"},
    {kind: "dot", color: C.teal, o: {lineColor: C.orange, lw: 2.5}, text: "q に近い上位 3 件（k = 3）", tw: 2.3},
  ]);
  return p;
}

// ---------- 図2 コサイン類似度 ----------
function vec(s, o, t, color, w = 2.25) { arrow(s, [o, t], {color, width: w}); }
function arc(s, o, r, a0, a1, color) { // 角度は度、画面上で反時計回り（y は下向き）
  const pts = []; for (let i = 0; i <= 24; i++) { const a = (a0 + (a1 - a0) * i / 24) * Math.PI / 180; pts.push([o[0] + r * Math.cos(a), o[1] - r * Math.sin(a)]); }
  arrow(s, pts, {color, width: 1.5, head: false});
}
async function fig2() {
  const p = newDeck(), s = p.addSlide(); s.background = {color: C.white};
  // 定義
  card(s, 0.2, 0.2, 4.3, 5.2, C.slate, "定義");
  const O = [0.95, 3.1], A = [4.0, 2.5], B = [2.85, 0.95];
  const ang = (t) => Math.atan2(O[1] - t[1], t[0] - O[0]) * 180 / Math.PI;
  arc(s, O, 0.72, ang(A), ang(B), C.orange);
  vec(s, O, A, C.blue); vec(s, O, B, C.teal);
  dot(s, O[0], O[1], 0.05, C.gray);
  const am = (ang(A) + ang(B)) / 2 * Math.PI / 180;
  M(s, "theta", O[0] + 0.98 * Math.cos(am), O[1] - 0.98 * Math.sin(am) - 0.17, "c");
  M(s, "a_blue", A[0] - 0.12, A[1] + 0.06);
  M(s, "b_teal", B[0] + 0.1, B[1] - 0.12);
  M(s, "O", O[0] - 0.08, O[1] + 0.02, "r");
  M(s, "cosdef", 2.35, 3.5, "c");
  M(s, "range", 2.35, 4.35, "c");
  label(s, "向きのみ比較（長さは無関係）", 0.4, 4.8, 3.9, {color: C.navy});
  // 向きと値
  card(s, 4.7, 0.2, 5.1, 2.55, C.slate, "向きと値");
  const xs = [5.55, 7.25, 8.95];
  M(s, "cos1", xs[0], 0.7, "c"); M(s, "cos0", xs[1], 0.7, "c"); M(s, "cosm1", xs[2], 0.7, "c");
  { const o = [xs[0] - 0.62, 1.92], f = [0.04, 0.08]; vec(s, o, [o[0] + 1.2, o[1] - 0.6], C.teal); vec(s, [o[0] + f[0], o[1] + f[1]], [o[0] + f[0] + 0.7, o[1] + f[1] - 0.35], C.blue); }
  { const o = [xs[1] - 0.45, 1.95]; vec(s, o, [o[0] + 1.05, o[1]], C.blue); vec(s, o, [o[0], o[1] - 0.72], C.teal);
    arrow(s, [[o[0] + 0.14, o[1]], [o[0] + 0.14, o[1] - 0.14], [o[0], o[1] - 0.14]], {color: C.orange, width: 1.25, head: false}); }
  { const o = [xs[2], 1.7]; vec(s, o, [o[0] + 0.58, o[1]], C.blue); vec(s, o, [o[0] - 0.58, o[1]], C.teal); arc(s, o, 0.2, 0, 180, C.orange); }
  ["同じ向き", "直交", "逆向き"].forEach((t, i) => label(s, t, xs[i] - 0.7, 2.18, 1.4, {color: C.navy}));
  // L2 距離との違い
  card(s, 4.7, 2.95, 5.1, 2.45, C.slate, "L2距離との違い");
  const o = [5.0, 4.95], a = [5.65, 4.58], b = [6.3, 4.21];
  vec(s, o, b, C.teal); { const f = [0.045, 0.08]; vec(s, [o[0] + f[0], o[1] + f[1]], [a[0] + f[0], a[1] + f[1]], C.blue); }
  dot(s, o[0], o[1], 0.05, C.gray);
  // a と b の先端どうしの距離（少しずらして平行に描く）
  const nx = -0.45 * 0.5, ny = -0.8 * 0.5, k = 0.22 / Math.hypot(nx, ny);
  arrow(s, [[a[0] + nx * k, a[1] + ny * k], [b[0] + nx * k, b[1] + ny * k]], {color: C.red, width: 1.5, dash: true, both: true});
  M(s, "l2", (a[0] + b[0]) / 2 + nx * k - 0.05, (a[1] + b[1]) / 2 + ny * k - 0.42, "r");
  M(s, "a_blue", a[0] + 0.05, a[1] + 0.02);
  M(s, "b2a", b[0] + 0.08, b[1] - 0.12);
  const tx = 7.35;
  label(s, "コサイン類似度", tx, 3.5, 1.3, {align: "left", h: MS.cos1_l2[1], color: C.navy}); M(s, "cos1_l2", tx + 1.32, 3.5);
  label(s, "L2距離", tx, 3.92, 0.62, {align: "left", h: MS.l2big[1], color: C.red}); M(s, "l2big", tx + 0.64, 3.92);
  arrow(s, [[tx, 4.4], [9.65, 4.4]], {color: C.border, width: 1, head: false});
  const r3 = M(s, "unit", tx, 4.52); label(s, "なら", tx + r3.w + 0.06, 4.52, 0.5, {align: "left", h: r3.h, color: C.navy});
  M(s, "norm", tx, 4.92);
  return p;
}

// ---------- 図3 HNSW の階層探索 ----------
async function fig3() {
  const p = newDeck(), s = p.addSlide(); s.background = {color: C.white};
  const L = [ // 上から レイヤー2, 1, 0
    {y: 0.15, h: 1.35, color: C.purple, bg: C.purpleBg, name: "レイヤー 2", sub: "ノード少\n長距離リンク", amp: 0.4},
    {y: 1.65, h: 1.35, color: C.blue, bg: C.blueBg, name: "レイヤー 1", sub: "一部のノード", amp: 0.4},
    {y: 3.15, h: 1.6, color: C.teal, bg: C.tealBg, name: "レイヤー 0", sub: "全ノード\n短距離リンク", amp: 0.5},
  ];
  for (const l of L) await lane(s, l.y, l.h, l.color, l.bg, l.name, l.sub, tb.TbStack2, {hw: 1.25});
  // ノード：x, u（-1〜1 のレーン内の位置）, 最上位レイヤー
  const N = {
    n0: [2.0, -0.35, 2], n1: [2.55, 0.6, 0], n2: [3.15, -0.7, 1], n3: [3.65, 0.2, 0], n4: [4.2, 0.65, 1],
    n5: [4.6, -0.5, 0], n6: [5.1, 0.6, 2], n7: [5.5, 0.0, 0], n8: [6.1, -0.6, 1], nD: [6.95, 0.6, 0],
    nA: [7.0, -0.45, 1], nB: [8.05, -0.3, 0], nC: [7.85, 0.85, 0], n11: [8.6, -0.7, 2], n15: [9.05, 0.3, 0], n13: [9.45, -0.4, 1],
  };
  const Q = [7.6, 0.25];
  const P = (id, li) => { const l = L[li], [x, u] = N[id]; return [x, l.y + l.h / 2 + u * l.amp]; };
  const qP = (li) => { const l = L[li]; return [Q[0], l.y + l.h / 2 + Q[1] * l.amp]; };
  const E = [
    ["n0 n6", "n6 n11"],
    ["n0 n2", "n2 n4", "n0 n4", "n4 n6", "n6 n8", "n8 nA", "n6 nA", "nA n11", "n11 n13"],
    ["n0 n1", "n0 n2", "n1 n3", "n2 n3", "n2 n5", "n3 n4", "n3 n5", "n4 n6", "n5 n7", "n6 n7", "n6 nD", "n7 n8", "n7 nD",
      "n8 nA", "nD nA", "nD nC", "nA nB", "nB nC", "nB n11", "nC n15", "n11 n15", "n15 n13", "n11 n13"],
  ];
  const path_ = [["n0", "n6", "n11"], ["n11", "nA"], ["nA", "nB", "nC"]];
  const topk = ["nC", "nB", "nD"];
  const li = (k) => 2 - k; // 最上位レイヤー番号 → L の添字
  for (let i = 0; i < 3; i++) {
    for (const e of E[i]) { const [a, b] = e.split(" "); arrow(s, [P(a, i), P(b, i)], {color: C.edge, width: 1.25, head: false}); }
  }
  // 探索経路
  const shorten = (a, b, r) => { const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy); return [[a[0] + dx * r / d, a[1] + dy * r / d], [b[0] - dx * r / d, b[1] - dy * r / d]]; };
  for (let i = 0; i < 3; i++) { const ids = path_[i]; for (let j = 0; j + 1 < ids.length; j++) arrow(s, shorten(P(ids[j], i), P(ids[j + 1], i), 0.1), {color: C.orange, width: 2.5}); }
  // 下の層へ
  arrow(s, shorten(P("n11", 0), P("n11", 1), 0.1), {color: C.orange, width: 1.75, dash: true});
  arrow(s, shorten(P("nA", 1), P("nA", 2), 0.1), {color: C.orange, width: 1.75, dash: true});
  // ノード
  for (let i = 0; i < 3; i++) for (const [id, [, , top]] of Object.entries(N)) {
    if (li(top) > i) continue;
    const [x, y] = P(id, i);
    const hit = i === 2 && topk.includes(id);
    dot(s, x, y, 0.085, hit ? C.orange : L[i].color, {fill: hit ? C.orange : C.white, lw: 1.75});
  }
  for (let i = 0; i < 3; i++) { const [x, y] = qP(i); star(s, x, y, 0.13, C.orange); M(s, "q_eq", x + 0.11, y - 0.33); }
  // 注記
  const e0 = P("n0", 0);
  s.addShape("roundRect", {x: e0[0] - 0.3, y: e0[1] - 0.47, w: 0.6, h: 0.28, rectRadius: 0.14, fill: {color: C.slate}, line: {type: "none"}});
  T(s, "入口", {x: e0[0] - 0.3, y: e0[1] - 0.47, w: 0.6, h: 0.28, bold: true, fontSize: 12, color: C.white, align: "center", valign: "middle"});
  label(s, "q に近い隣へ移動", 3.2, 0.2, 1.8, {color: C.orange, align: "left"});
  const d1 = P("n11", 0), d2 = P("nA", 1);
  label(s, "下の層へ", d1[0] + 0.15, (d1[1] + P("n11", 1)[1]) / 2 - 0.13, 1.0, {color: C.orange, align: "left"});
  label(s, "下の層へ", d2[0] + 0.12, 2.7, 1.0, {color: C.orange, align: "left"});
  T(s, [{text: "ef_search", options: {fontFace: FONT.mono, color: C.orange}}, {text: " 個保持→上位 k 件", options: {color: C.orange}}],
    {x: 7.08, y: 3.2, w: 2.6, h: 0.3, align: "right", valign: "middle"});
  arrow(s, shorten(P("nA", 2), P("nD", 2), 0.1), {color: C.orange, width: 2, dash: true, head: false});
  await legend(s, 5.0, [
    {kind: "dot", color: C.neutral, o: {fill: C.white, lw: 1.75}, text: "ノード（ベクトル）", tw: 1.45},
    {kind: "line", color: C.edge, head: false, text: "近傍リンク", tw: 0.9},
    {kind: "line", color: C.orange, width: 2.5, text: "探索経路", tw: 0.75},
    {kind: "line", color: C.orange, width: 2, dash: true, head: false, text: "評価した近傍", tw: 1.1},
    {kind: "dot", color: C.orange, text: "上位 k 件", tw: 0.8},
    {kind: "star", color: C.orange, text: "質問", tw: 0.38, math: "q_leg"},
  ]);
  return p;
}

// ---------- 図4 ベクトルDBの書き込みと検索 ----------
async function fig4() {
  const p = newDeck(), s = p.addSlide(); s.background = {color: C.white};
  await lane(s, 0.15, 1.5, C.purple, C.purpleBg, "アプリ", "呼び出し側", tb.TbAppWindow, {hw: 1.2});
  await lane(s, 1.8, 1.45, C.teal, C.tealBg, "埋め込み", "API・ローカル", tb.TbVectorTriangle, {hw: 1.2});
  await lane(s, 3.4, 1.75, C.blue, C.blueBg, "ベクトルDB", "保存・検索", tb.TbDatabase, {hw: 1.2});
  const W = 1.6, H = 1.2, ya = 0.9, yb = 2.525, yc = 4.275;
  const xW = 2.3, xI = 4.25, xQ = 6.2, xF = 8.95;
  const Wb = (n) => ({text: "W" + n, color: C.slate}), Qb = (n) => ({text: "Q" + n, color: C.magenta});
  const doc = await node(s, xW, ya, W, H, C.purple, tb.TbFileUpload, "文書の登録", "チャンク＋\nメタデータ", {badge: Wb(1)});
  const req = await node(s, xQ, ya, W, H, C.purple, tb.TbSearch, "検索リクエスト", "質問文＋\n絞り込み条件", {badge: Qb(1)});
  const res = await node(s, xF, ya, W, H, C.purple, tb.TbListNumbers, "検索結果", "`id, score,\n`metadata", {badge: Qb(5)});
  const eW = await node(s, xW, yb, W, H, C.teal, tb.TbVectorTriangle, "埋め込み", "チャンク→\nベクトル", {badge: Wb(2)});
  const eQ = await node(s, xQ, yb, W, H, C.teal, tb.TbVectorTriangle, "埋め込み", "質問→q\n文書側と同一", {badge: Qb(2)});
  const up = await node(s, xW, yc, W, 1.3, C.blue, tb.TbDatabaseImport, "upsert", "`id, vector,\n`metadata", {badge: Wb(3)});
  const idx = await node(s, xI, yc, 1.38, 1.3, C.orange, tb.TbBinaryTree2, "インデックス", "HNSW, IVF-PQ\n探索用の構造", {fill: C.orangeBg});
  const ann = await node(s, xQ, yc, W, 1.3, C.blue, tb.TbListSearch, "ANN検索", "q の近傍候補\n近似で高速", {badge: Qb(3)});
  const flt = await node(s, xF, yc, W, 1.3, C.blue, tb.TbFilter, "絞り込み", "合致のみ残す\n`tenant_id='A'", {badge: Qb(4)});
  const vlab = (t, x, y1, y2, o = {}) => label(s, t, x + 0.1, (y1 + y2) / 2 - 0.13, 1.5, {align: "left", ...o});
  arrow(s, [doc.b, eW.t]); vlab("テキスト", xW, doc.b[1], eW.t[1]);
  arrow(s, [eW.b, up.t]); vlab("ベクトル", xW, eW.b[1], up.t[1]);
  arrow(s, [up.r, idx.l]); label(s, "追加", up.r[0], yc - 0.32, idx.l[0] - up.r[0]);
  arrow(s, [req.b, eQ.t]); vlab("質問文", xQ, req.b[1], eQ.t[1]);
  arrow(s, [eQ.b, ann.t]); vlab("q", xQ, eQ.b[1], ann.t[1]);
  arrow(s, [idx.r, ann.l]); label(s, "参照", idx.r[0], yc - 0.32, ann.l[0] - idx.r[0]);
  arrow(s, [ann.r, flt.l]); label(s, "候補", ann.r[0] + 0.62, yc + 0.06, flt.l[0] - ann.r[0] - 0.62);
  // 絞り込み条件（Q1 → Q4）
  const xc = 7.6, yc2 = flt.y + 0.3;
  arrow(s, [req.r, [xc, ya], [xc, yc2], [flt.x, yc2]], {color: C.purple, dash: true});
  label(s, "絞り込み条件", xc + 0.1, yb - 0.13, 1.25, {align: "left", color: C.purple});
  arrow(s, [flt.t, res.b]); vlab("k 件以内", xF, res.b[1], flt.t[1]);
  await legend(s, 5.27, [
    {kind: "pill", color: C.slate, sample: "W1", pw: 0.44, text: "書き込みの手順", tw: 1.3},
    {kind: "pill", color: C.magenta, sample: "Q1", pw: 0.44, text: "検索の手順", tw: 1.0},
    {kind: "box", color: C.orange, fill: C.orangeBg, text: "両方の経路が使うインデックス", tw: 2.5},
    {kind: "line", color: C.purple, dash: true, text: "絞り込み条件", tw: 1.1},
  ]);
  return p;
}

// 和文の欄をヒラギノに、アイコンの代替PNGを作り直し、言語を ja-JP に
async function save(p, file) {
  const src = await JSZip.loadAsync(await p.write({outputType: "nodebuffer"})), out = new JSZip();
  for (const f of Object.keys(src.files)) {
    if (src.files[f].dir) continue;
    let data = await src.file(f).async("nodebuffer");
    const m = f.match(/^ppt\/media\/image-(\d+)-(\d+)\.png$/), svg = m && src.file(`ppt/media/image-${m[1]}-${+m[2] + 1}.svg`);
    if (svg) data = await sharp(await svg.async("nodebuffer"), {density: 300}).resize(256, 256, {fit: "contain", background: {r: 0, g: 0, b: 0, alpha: 0}}).png().toBuffer();
    if (/^ppt\/.*\.xml$/.test(f)) {
      let x = data.toString("utf8");
      if (/^ppt\/theme\//.test(f)) x = x.replace(/<a:ea typeface="[^"]*"[^>]*\/>/g, `<a:ea typeface="${FONT.ja}"/>`);
      x = x.replace(/<a:ea typeface="(?!\+)[^"]*"[^>]*\/>/g, `<a:ea typeface="${FONT.ja}" pitchFamily="34" charset="-128"/>`)
        .replace(/(<a:(?:rPr|endParaRPr|defRPr)\b[^>]*?) lang="en-US"(?![^>]*altLang)/g, '$1 lang="ja-JP" altLang="en-US"');
      data = Buffer.from(x);
    }
    out.file(f, data, {createFolders: false});
  }
  fs.writeFileSync(file, await out.generateAsync({type: "nodebuffer", compression: "DEFLATE"}));
}

(async () => {
  fs.mkdirSync(OUT, {recursive: true});
  const figs = {
    "01_埋め込みと近傍探索": fig1, "02_コサイン類似度": fig2,
    "03_HNSWの階層探索": fig3, "04_ベクトルDBの書き込みと検索": fig4,
  };
  const only = process.argv[3];
  for (const [name, f] of Object.entries(figs)) if (!only || name.startsWith(only)) await save(await f(), path.join(OUT, name + ".pptx"));
  console.log("ok");
})();
