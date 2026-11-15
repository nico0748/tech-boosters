// compact no.42「Burp Suite の機能とできること」の図1〜10（zukai-diagrams 準拠）
// 使い方: node figs.js <出力フォルダ>  → 続けて bash render.sh <出力フォルダ> で PNG（2000px）
// 文字は 14pt 以上（名前は 16pt 太字）。記事幅 約800px でも読める大きさにする
// 色の意味：navy＝Burp のツール／orange＝対象の Web アプリ（自分の検証環境）／gray＝ブラウザ・データ／
//           pink＝書き換えた値・注目点／紺のピル「Pro」＝Professional のみ
const Z = require("./zukai.js");
const path = require("path"), fs = require("fs");
const sharp = require("sharp");
const OUT = process.argv[2] || ".";  // compact/drafts を指す。各記事の image/ に書き出す
const DIR = Object.fromEntries(Object.entries({
  n42: "no.42-burp-suite", n43: "no.43-burp-proxy", n44: "no.44-burp-repeater", n45: "no.45-burp-intruder", n46: "no.46-burp-scanner",
  n47: "no.47-burp-collaborator", n48: "no.48-burp-sequencer", n49: "no.49-burp-decoder", n50: "no.50-burp-comparer",
}).map(([k, v]) => { const d = path.join(v, "image"); fs.mkdirSync(path.join(OUT, d), {recursive: true}); return [k, d]; }));

const K = {
  navy: {c: "2E5E8E", f: "EEF3F9"},
  orange: {c: "B4580A", f: "FFF3E6"},
  gray: {c: "6B7280", f: "F1F3F4"},
  teal: {c: "1E8A82", f: "E8F5F3"},
  red: {c: "C0392B", f: "FBEEEC"},
};
const MUTED = Z.C.muted, PINK = Z.C.pink, TITLE = Z.C.title;

function art(title, h) {
  const p = Z.article({title: `Burp Suite 図 ${title}`, author: "Nico"});
  if (h) { p.defineLayout({name: "ART_H", width: 10, height: h}); p.layout = "ART_H"; }  // 縦に長い図
  Object.assign(Z.FS, {label: 14, sub: 14, arrow: 14, box: 14});
  return p;
}
// アイコンの SVG。Tabler（react-icons/tb）と、Burp Suite のロゴ（Simple Icons の SiBurpsuite）
// react-icons がない環境（Mac の作業用 VM など）では、同じフォルダの icons.json（node make-icons.js で作る）を使う
const SVG = (() => {
  try {
    const React = require("react"), RDS = require("react-dom/server"), tb = require("react-icons/tb"), si = require("react-icons/si");
    const set = {...tb, SiBurpsuite: si.SiBurpsuite};
    return (name) => RDS.renderToStaticMarkup(React.createElement(set[name], {size: 256}));
  } catch (e) {
    const j = JSON.parse(fs.readFileSync(path.join(__dirname, "icons.json"), "utf8"));
    return (name) => j[name];
  }
})();
// 各ツールのアイコン（図の間で同じものを使う）
const TOOL = {burp: "SiBurpsuite", proxy: "TbArrowsExchange", repeater: "TbRepeat", intruder: "TbListNumbers", scanner: "TbScan",
  collaborator: "TbRadar2", sequencer: "TbChartHistogram", decoder: "TbTransform", comparer: "TbFileDiff",
  burpat: "TbRobot", project: "TbDeviceFloppy", search: "TbSearch"};
const cache = {};
async function ico(name, color) {
  const k = name + color; if (cache[k]) return cache[k];
  const svg = SVG(name).replace(/currentColor/g, "#" + color);
  const png = await sharp(Buffer.from(svg), {density: 600}).resize(512, 512, {fit: "contain", background: {r: 0, g: 0, b: 0, alpha: 0}}).png().toBuffer();
  return (cache[k] = "image/png;base64," + png.toString("base64"));
}
// アイコン＋名前＋説明1行
async function inode(s, icon, k, cx, cy, label, duty, o = {}) {
  const size = o.size || 0.62, tw = o.w || 1.8, col = K[k].c;
  s.addImage({data: await ico(icon, col), x: cx - size / 2, y: cy - size / 2, w: size, h: size, altText: label});
  const runs = [{text: label, options: {bold: true, fontSize: 16, color: col, breakLine: !!duty}}];
  if (duty) runs.push({text: duty, options: {fontSize: 14, color: MUTED}});
  const lh = o.h || (duty ? 0.6 : 0.32);
  Z.T(s, runs, {x: cx - tw / 2, y: cy + size / 2 + 0.05, w: tw, h: lh, align: "center"});
  const r = size / 2 + 0.08;
  return {l: [cx - r, cy], r: [cx + r, cy], t: [cx, cy - r], b: [cx, cy + size / 2 + lh + 0.08]};
}
// Professional のみ の印
function pro(s, x, y) {
  s.addText("Pro", {shape: "roundRect", rectRadius: 0.15, x, y, w: 0.56, h: 0.3, fill: {color: TITLE}, line: {color: "FFFFFF", width: 1},
    fontFace: Z.FONT.en, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0});
}
// 見出し＋1行の箱
function chip(s, x, y, w, h, head, sub, k, o = {}) {
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.1, fill: {color: o.fill || K[k].f}, line: {color: o.line || K[k].c, width: o.lw || 1.5}});
  const runs = [{text: head, options: {bold: true, fontSize: o.hs || 16, color: o.hc || K[k].c, breakLine: !!sub}}];
  if (sub) runs.push({text: sub, options: {fontSize: 14, color: o.sc || Z.C.text}});
  Z.T(s, runs, {x: x + 0.05, y, w: w - 0.1, h, align: "center", valign: "middle", lineSpacingMultiple: 1.05});
  if (o.pro) pro(s, x + w - 0.42, y - 0.17);
  return {l: [x, y + h / 2], r: [x + w, y + h / 2], t: [x + w / 2, y], b: [x + w / 2, y + h]};
}
// 見出しの文字幅の見積もり（欧文＝Helvetica Bold の字幅×1.04、和文＝全角1em）
const HB = {" ": 278, "!": 333, "(": 333, ")": 333, ",": 278, "-": 333, ".": 278, "/": 278, ":": 333, "0": 556, "1": 556, "2": 556, "3": 556, "4": 556,
  "5": 556, "6": 556, "7": 556, "8": 556, "9": 556, A: 722, B: 722, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 556, K: 722, L: 611,
  M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611, a: 556, b: 611, c: 556, d: 611,
  e: 556, f: 333, g: 611, h: 611, i: 278, j: 278, k: 556, l: 278, m: 889, n: 611, o: 611, p: 611, q: 611, r: 389, s: 556, t: 333, u: 611, v: 556,
  w: 778, x: 556, y: 556, z: 500};
const textW = (t, pt) => [...t].reduce((w, ch) => w + (ch.charCodeAt(0) < 128 ? (HB[ch] || 556) * 1.04 / 1000 : 1), 0) * pt / 72;
// アイコン付きの箱。既定は見出しの左にアイコン、o.top で見出しの上にアイコン
async function chipI(s, x, y, w, h, head, sub, k, icon, o = {}) {
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.1, fill: {color: o.fill || K[k].f}, line: {color: K[k].c, width: 1.5}});
  const hs = o.hs || 16, col = o.hc || K[k].c, HL = hs / 72 * 1.2, SL = 14 / 72 * 1.2, sl = sub ? sub.split("\n").length : 0;
  if (o.top) {
    const IS = o.is || 0.46, G = 0.08, T = IS + G + HL + SL * sl, top = y + (h - T) / 2;
    s.addImage({data: await ico(icon, col), x: x + w / 2 - IS / 2, y: top, w: IS, h: IS, altText: head});
    const runs = [{text: head, options: {bold: true, fontSize: hs, color: col, breakLine: !!sub}}];
    if (sub) runs.push({text: sub, options: {fontSize: 14, color: Z.C.text}});
    Z.T(s, runs, {x: x + 0.05, y: top + IS + G, w: w - 0.1, h: HL + SL * sl + 0.05, align: "center", valign: "top"});
  } else {
    const IS = o.is || 0.25, G = 0.06, T = HL + SL * sl, top = y + (h - T) / 2;
    const hw = textW(head, hs), gw = IS + G + hw, x0 = x + w / 2 - gw / 2;
    s.addImage({data: await ico(icon, col), x: x0, y: top + HL / 2 - IS / 2, w: IS, h: IS, altText: head});
    Z.T(s, head, {x: x0 + IS + G, y: top, w: hw + 0.3, h: HL, fontSize: hs, bold: true, color: col, align: "left", valign: "middle"});
    if (sub) Z.T(s, sub, {x: x + 0.05, y: top + HL, w: w - 0.1, h: SL * sl, fontSize: 14, color: o.sc || Z.C.text, align: "center", valign: "middle"});
  }
  return {l: [x, y + h / 2], r: [x + w, y + h / 2], t: [x + w / 2, y], b: [x + w / 2, y + h]};
}
// HTTP メッセージなどのテキスト（lines は文字列か run の配列。{text, accent} で pink 強調）
function code(s, x, y, w, h, lines, o = {}) {
  s.addShape("rect", {x, y, w, h, fill: {color: "FFFFFF"}, line: {color: o.line || "9AA0A6", width: o.lw || 1}});
  const runs = [];
  lines.forEach((ln, i) => {
    const parts = Array.isArray(ln) ? ln : [ln];
    parts.forEach((pt, j) => {
      const t = typeof pt === "string" ? {text: pt} : pt;
      runs.push({text: t.text, options: {fontSize: 14, bold: !!(t.accent || t.bold), color: t.accent ? PINK : t.color || Z.C.text,
        highlight: t.hl, breakLine: j === parts.length - 1 && i < lines.length - 1}});
    });
  });
  Z.T(s, runs, {x: x + 0.12, y: y + 0.06, w: w - 0.2, h: h - 0.12, valign: o.valign || "middle", lineSpacingMultiple: 1.1});
  return {l: [x, y + h / 2], r: [x + w, y + h / 2], t: [x + w / 2, y], b: [x + w / 2, y + h]};
}
// 枠（淡い青）＋内側左上の見出し
function box(s, x, y, w, h, title, o = {}) {
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.15, fill: {color: o.fill || Z.C.frame}, line: o.line ? {color: o.line, width: 1.25, dashType: o.dash ? "dash" : "solid"} : {color: Z.C.frameLine, width: 1}});
  if (title) Z.T(s, title, {x: x + 0.15, y: y + 0.08, w: w - 0.3, h: 0.32, fontSize: o.fs || 16, bold: true, color: o.tc || TITLE, valign: "middle"});
}
// アイコン付きの見出しの枠
async function boxI(s, x, y, w, h, title, icon, o = {}) {
  box(s, x, y, w, h, null, o);
  const IS = 0.28;
  s.addImage({data: await ico(icon, o.ic || K.navy.c), x: x + 0.15, y: y + 0.1, w: IS, h: IS, altText: title});
  Z.T(s, title, {x: x + 0.15 + IS + 0.08, y: y + 0.08, w: w - 0.3 - IS - 0.08, h: 0.32, fontSize: o.fs || 16, bold: true, color: o.tc || TITLE, valign: "middle"});
}
const lbl = (s, text, x, y, w, o = {}) => Z.T(s, text, {x, y, w, h: o.h || 0.3, fontSize: 14, bold: !!o.bold, color: o.color || MUTED, align: o.align || "center", valign: "middle"});
const A = (s, pts, label, o = {}) => Z.arrow(s, pts, label, {width: 1.75, ...o});

// 凡例（下端に横1列、中央寄せ）。items を [[...], [...]] にすると複数行
function clegend(s, items, y, colW = 1.9) {
  const rows = Array.isArray(items[0][0]) ? items : [items];
  const RH = 0.42, h = RH * rows.length - (rows.length - 1) * 0.06;
  const rw = (r) => 0.7 + r.reduce((a, it) => a + (it[2] || colW), 0), ww = Math.max(...rows.map(rw)), x0 = (10 - ww) / 2;
  s.addShape("roundRect", {x: x0, y, w: ww, h, rectRadius: 0.08, fill: {color: "FFFFFF"}, line: {color: Z.C.grid, width: 0.75}});
  Z.T(s, "凡例", {x: x0 + 0.1, y: y + 0.07, w: 0.56, h: 0.28, fontSize: 14, bold: true, color: MUTED, valign: "middle"});
  rows.forEach((row, ri) => {
    let sx = x0 + 0.7;
    const yy = y + RH / 2 + ri * (RH - 0.06);
    for (const [kind, text, cw0] of row) {
      const cw = cw0 || colW;
      let tx = sx + 0.48;
      if (K[kind]) s.addShape("rect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, fill: {color: K[kind].f}, line: {color: K[kind].c, width: 1.5}});
      else if (kind === "pro") {pro(s, sx, yy - 0.15); tx = sx + 0.64;}
      else if (kind === "demo") {pill(s, sx, yy - 0.15, "demo", "demo"); tx = sx + 0.8;}
      else if (kind === "accent") Z.T(s, "abc", {x: sx - 0.04, y: yy - 0.14, w: 0.44, h: 0.28, fontSize: 14, bold: true, color: PINK, align: "center", valign: "middle"});
      else if (kind === "frame") s.addShape("roundRect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, rectRadius: 0.05, fill: {color: Z.C.frame}, line: {color: Z.C.frameLine, width: 1}});
      else if (kind === "group") s.addShape("roundRect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, rectRadius: 0.05, fill: {type: "none"}, line: {color: K.navy.c, width: 1.25}});
      else if (kind === "hl") s.addShape("rect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, fill: {color: "FFE08A"}, line: {type: "none"}});
      else if (kind === "reply") Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 1.5, dash: true});
      else if (kind === "navyline") Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 2, color: K.navy.c});
      else if (kind === "navydash") Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 1.5, dash: true, color: K.navy.c});
      else if (kind === "dot") Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 2, dashType: "sysDot"});
      else if (kind === "graydash") Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 1.25, dash: true, color: MUTED, head: "none"});
      else if (kind === "grayline") Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 1.5, color: "9AA0A6"});
      else if (kind === "tealline") Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 1.75, color: K.teal.c});
      else if (kind === "redline") Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 2.25, color: K.red.c});
      else Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 1.5});
      Z.T(s, text, {x: tx, y: yy - 0.14, w: cw - (tx - sx), h: 0.28, fontSize: 14, valign: "middle"});
      sx += cw;
    }
  });
}

// ---- 図1：Burp Suite の全体像（ツールの分担） ----
// 小さいピル（Pro・demo）
function pill(s, x, y, text, k = "pro") {
  const w = text.length > 3 ? 0.72 : 0.56;
  s.addText(text, {shape: "roundRect", rectRadius: 0.15, x, y, w, h: 0.3, fill: {color: k === "pro" ? TITLE : "FFFFFF"},
    line: {color: k === "pro" ? "FFFFFF" : PINK, width: k === "pro" ? 1 : 1.5},
    fontFace: Z.FONT.en, fontSize: 14, bold: true, color: k === "pro" ? "FFFFFF" : PINK, align: "center", valign: "middle", margin: 0});
  return w;
}
async function fig1() {
  const p = art("01"), s = Z.canvas(p);
  const CY = 0.95;
  const br = await inode(s, "TbBrowser", "gray", 0.68, CY, "ブラウザ", "Burp Browser", {w: 1.4});
  const tg = await inode(s, "TbServer", "orange", 8.85, CY, "対象のWebアプリ", "許可済みの検証環境", {w: 2.2});
  await boxI(s, 1.55, 0.15, 6.4, 4.62, "Burp Suite", TOOL.burp, {fill: "FFFFFF", line: K.navy.c});
  const px = await chipI(s, 3.65, CY - 0.42, 2.2, 0.84, "Proxy", "中継・記録", "navy", TOOL.proxy);
  A(s, [br.r, px.l], "① 通信", {w: 1.0});
  A(s, [px.r, tg.l], "② 中継", {w: 1.0});
  // ツールの分類
  const GY = 2.1, GH = 2.52, R1 = GY + 0.56, R2 = GY + 1.66;
  box(s, 1.75, GY, 2.0, GH, "ローカル処理", {fs: 14});
  box(s, 3.95, GY, 3.8, GH, "対象へ送信", {fs: 14});
  const CW = 1.7, CH = 0.72;
  await chipI(s, 1.9, R1, CW, CH, "Decoder", "変換", "navy", TOOL.decoder);
  await chipI(s, 1.9, R2, CW, CH, "Comparer", "差分", "navy", TOOL.comparer);
  await chipI(s, 4.1, R1, CW, CH, "Repeater", "手動再送", "navy", TOOL.repeater);
  await chipI(s, 5.9, R1, CW, CH, "Intruder", "自動連続送信", "navy", TOOL.intruder);
  await chipI(s, 4.1, R2, CW, CH, "Scanner", "脆弱性診断", "navy", TOOL.scanner);
  await chipI(s, 5.9, R2, CW, CH, "Sequencer", "乱数性の分析", "navy", TOOL.sequencer);
  // バッジは箱の上辺にまたがせ、箱の中の文字にかからない高さに置く
  pill(s, 4.18, R2 - 0.27, "Pro");
  pill(s, 5.98, R1 - 0.27, "demo", "demo");
  // ③ Send to：Proxy から各グループへ
  const TY = 1.82;
  A(s, [px.b, [px.b[0], TY]], null, {head: "none"});
  A(s, [[2.75, TY], [5.85, TY]], null, {head: "none"});
  A(s, [[2.75, TY], [2.75, GY]], null);
  A(s, [[5.85, TY], [5.85, GY]], null);
  lbl(s, "③ Send to・Scan", px.b[0] + 0.1, TY - 0.36, 1.9, {align: "left", color: Z.C.arrow});
  // ④ 対象へ送信
  A(s, [[7.75, GY + GH / 2], [tg.b[0], GY + GH / 2], tg.b], "④ 送信", {seg: 0, w: 1.0, dx: 0.02});
  clegend(s, [["solid", "通信・受け渡し", 2.05], ["navy", "Burp のツール", 1.9], ["frame", "分類", 1.1], ["pro", "Pro のみ", 1.55], ["demo", "無償版は demo", 2.3]], 5.02);
  await Z.save(p, path.join(OUT, DIR.n42, "01_Burp_Suiteの全体像.pptx"));
}

// ---- 図2：Proxy（インターセプトと HTTP history） ----
async function fig2() {
  const p = art("02"), s = Z.canvas(p);
  const CY = 1.1;
  const br = await inode(s, "TbBrowser", "gray", 0.5, CY, "ブラウザ", null, {w: 1.0});
  const tg = await inode(s, "TbServer", "orange", 9.05, CY, "対象のWebアプリ", null, {w: 1.9});
  await boxI(s, 1.75, 0.15, 6.25, 2.95, "Proxy（127.0.0.1:8080）・Intercept on", TOOL.proxy);
  const ed = code(s, 2.1, 0.6, 3.55, 1.5, ["POST /cart HTTP/2", "Host: example.com", "Content-Type: application/json", " ", ["{\"item\": 42, \"qty\": ", {text: "100", accent: true}, "}"]], {valign: "top"});
  lbl(s, "保留中のリクエスト（編集可）", 2.1, 2.12, 3.55);
  const fw = chip(s, 6.0, CY - 0.22, 1.25, 0.44, "Forward", null, "navy", {fill: K.navy.c, hc: "FFFFFF", hs: 14});
  const dp = chip(s, 6.0, CY + 0.42, 1.25, 0.44, "Drop", null, "gray", {hs: 14});
  lbl(s, "破棄", 7.3, CY + 0.49, 0.6, {align: "left"});
  A(s, [br.r, [ed.l[0], CY]], "① 送信", {w: 0.8, dx: -0.2});
  A(s, [[ed.r[0], CY], fw.l], null, {width: 1.5});
  A(s, [[5.8, CY], [5.8, dp.l[1]], dp.l], null, {width: 1.5});
  A(s, [fw.r, tg.l], "② 転送", {w: 1.0});
  // ③ レスポンス
  A(s, [[tg.b[0], tg.b[1]], [tg.b[0], 2.75], [br.b[0], 2.75], [br.b[0], br.b[1]]], "③ レスポンス", {seg: 1, dash: true, w: 1.6, dx: 0.9});
  // ④ HTTP history への記録（点線）
  A(s, [[4.9, 3.1], [4.9, 3.5]], "④ 常時記録", {dashType: "sysDot", width: 2, w: 1.5});
  lbl(s, "HTTP history", 1.75, 3.42, 1.8, {align: "left", bold: true, color: TITLE});
  const H = (t) => ({text: t, options: {bold: true, color: TITLE, fill: {color: Z.C.frame}}});
  const D = (t, o = {}) => ({text: t, options: {color: o.c || Z.C.text, bold: !!o.b, fontSize: o.fs || 14}});
  s.addTable([
    [H("#"), H("Method"), H("URL"), H("Status code"), H("Edited")],
    [D("1"), D("GET"), D("/"), D("200"), D("")],
    [D("2"), D("GET"), D("/cart"), D("200"), D("")],
    [D("3"), D("POST"), D("/cart"), D("201"), D("✓", {c: PINK, b: true, fs: 16})],
  ], {x: 1.75, y: 3.75, colW: [0.5, 1.1, 2.25, 1.4, 1.0], rowH: 0.27, fontFace: Z.FONT.en, fontSize: 14, align: "center", valign: "middle",
    border: {type: "solid", pt: 0.75, color: Z.C.grid}, margin: 0.02});
  clegend(s, [["solid", "リクエスト", 1.6], ["reply", "レスポンス", 1.6], ["dot", "記録", 1.1], ["accent", "書き換えた値・Edited", 2.6]], 5.15);
  await Z.save(p, path.join(OUT, DIR.n43, "01_Proxyのインターセプトと記録.pptx"));
}

// ---- 図3：Repeater ----
async function fig3() {
  const p = art("03"), s = Z.canvas(p);
  // Repeater の画面（左にリクエスト、右にレスポンス）を枠で表し、対象は枠の外の下に置く
  await boxI(s, 0.3, 0.15, 9.4, 2.7, "Repeater", TOOL.repeater);
  const BY = 0.95, BW = 3.2, BH = 1.35;
  lbl(s, "リクエスト（編集）", 0.55, 0.6, BW, {bold: true, color: TITLE, align: "left"});
  const rq = code(s, 0.55, BY, BW, BH, [["GET /api/orders/", {text: "1002", accent: true}], "Host: example.com", "Cookie: session=…（alice）"]);
  lbl(s, "レスポンス", 6.25, 0.6, BW, {bold: true, color: TITLE, align: "left"});
  const rs = code(s, 6.25, BY, BW, BH, ["HTTP/2 200 OK", "{\"id\": 1002,", [" \"owner\": ", {text: "\"bob\"", accent: true}, "}"]]);
  lbl(s, "他人の注文：IDOR の疑い", 6.3, 2.36, 2.6, {color: PINK, bold: true, align: "left"});
  // ③ レスポンスを見て、リクエストを書き換えて再送
  A(s, [rs.l, rq.r], "③ 値を書き換えて再送", {w: 2.4, color: K.navy.c, width: 2});
  const tg = await inode(s, "TbServer", "orange", 5.0, 3.55, "対象のWebアプリ", null, {w: 1.9});
  A(s, [[2.15, rq.b[1]], [2.15, tg.l[1]], tg.l], "① Send", {seg: 1, w: 1.0});
  A(s, [tg.r, [9.0, tg.r[1]], [9.0, rs.b[1]]], "② レスポンス", {seg: 0, w: 1.4, dash: true});
  clegend(s, [["solid", "リクエスト", 1.6], ["reply", "レスポンス", 1.6], ["navyline", "編集・再送", 1.7], ["accent", "書き換えた値・注目点", 2.6]], 4.45);
  await Z.save(p, path.join(OUT, DIR.n44, "01_Repeaterでの手動再送.pptx"));
}
// ---- 図4：Intruder ----
async function fig4() {
  const p = art("04"), s = Z.canvas(p);
  lbl(s, "ベースリクエスト", 0.3, 0.2, 2.9, {bold: true, color: TITLE, align: "left"});
  const bq = code(s, 0.3, 0.55, 2.9, 0.9, [["GET /api/orders/", {text: "§1001§", accent: true}], "Host: example.com"]);
  const pl = chip(s, 0.3, 2.05, 2.9, 0.9, "ペイロードセット", "Numbers：1001〜1100", "gray");
  const it = await chipI(s, 3.7, 0.55, 1.8, 2.4, "Intruder", "位置へ順に挿入\n（Sniper）", "navy", TOOL.intruder, {top: true});
  A(s, [bq.r, [it.l[0], bq.r[1]]], null);
  A(s, [pl.r, [it.l[0], pl.r[1]]], null);
  const tg = await inode(s, "TbServer", "orange", it.b[0], 3.85, "対象のWebアプリ", null, {w: 1.9});
  A(s, [it.b, tg.t], "① 100件を送信", {w: 1.6});
  // 結果
  lbl(s, "結果", 6.1, 0.2, 1.0, {bold: true, color: TITLE, align: "left"});
  
  const H = (t) => ({text: t, options: {bold: true, color: TITLE, fill: {color: Z.C.frame}}});
  const D = (t, hot) => ({text: t, options: {color: hot ? PINK : Z.C.text, bold: !!hot, fill: hot ? {color: "FDECF3"} : undefined}});
  s.addTable([
    [H("Payload"), H("Status code"), H("Length")],
    [D("1001"), D("403"), D("312")],
    [D("1002", 1), D("200", 1), D("1024", 1)],
    [D("1003"), D("403"), D("312")],
    [D("…"), D("…"), D("…")],
  ], {x: 6.1, y: 0.55, colW: [1.1, 1.4, 1.1], rowH: 0.3, fontFace: Z.FONT.en, fontSize: 14, align: "center", valign: "middle",
    border: {type: "solid", pt: 0.75, color: Z.C.grid}, margin: 0.02});
  A(s, [tg.r, [7.9, tg.r[1]], [7.9, 2.12]], "② レスポンス", {seg: 0, w: 1.6, dash: true});
  lbl(s, "↑ 外れ値に注目", 6.1, 2.15, 1.7, {bold: true, color: PINK, align: "left"});
  clegend(s, [["solid", "入力・送信", 1.6], ["reply", "レスポンス", 1.6], ["navy", "Burp のツール", 1.9], ["gray", "データ", 1.2], ["accent", "§位置・外れ値", 2.1]], 4.95);
  await Z.save(p, path.join(OUT, DIR.n45, "01_Intruderの自動送信.pptx"));
}

// ---- 図5：Intruder の攻撃タイプ ----
async function fig5() {
  const p = art("05"), s = Z.canvas(p);
  const P = (t, c) => ({text: t, c}), A1 = P("a", K.navy.c), B1 = P("b", K.navy.c), X2 = P("x", K.teal.c), Y2 = P("y", K.teal.c), Z2 = P("z", K.teal.c), NO = P("—", MUTED);
  const COLS = [
    {name: "Sniper", sub: "1位置ずつ順に挿入", rows: [[A1, NO], [B1, NO], [NO, A1], [NO, B1]], f: ["位置数×セット1の", "ペイロード数"], n: "＝4件"},
    {name: "Battering ram", sub: "全位置に同じ値", rows: [[A1, A1], [B1, B1]], f: ["セット1の", "ペイロード数"], n: "＝2件"},
    {name: "Pitchfork", sub: "n番目同士の組", rows: [[A1, X2], [B1, Y2]], f: ["最小セットの", "ペイロード数"], n: "＝2件（z は未使用）"},
    {name: "Cluster bomb", sub: "全組み合わせ", rows: [[A1, X2], [A1, Y2], [A1, Z2], [B1, X2], [B1, Y2], [B1, Z2]], f: ["各セットの", "ペイロード数の積"], n: "＝2×3＝6件"},
  ];
  const W = 2.2, G = 0.2, X0 = 0.3, TY = 1.25, RH = 0.32;
  COLS.forEach((c, i) => {
    const x = X0 + i * (W + G);
    chip(s, x, 0.2, W, 0.85, c.name, c.sub, "navy");
    const H = (t) => ({text: t, options: {bold: true, color: TITLE, fill: {color: Z.C.frame}}});
    const D = (t) => ({text: t.text, options: {color: t.c, bold: t.text !== "—"}});
    s.addTable([[H("位置1"), H("位置2")], ...c.rows.map((r) => r.map(D))],
      {x: x + 0.2, y: TY, colW: [0.9, 0.9], rowH: RH, fontFace: Z.FONT.en, fontSize: 14, align: "center", valign: "middle",
        border: {type: "solid", pt: 0.75, color: Z.C.grid}, margin: 0.02});
    Z.T(s, [{text: c.f[0], options: {breakLine: true}}, {text: c.f[1], options: {breakLine: true}}, {text: c.n, options: {bold: true, color: TITLE}}],
      {x: x - 0.05, y: 3.6, w: W + 0.1, h: 0.95, fontSize: 14, color: MUTED, align: "center", valign: "top"});
  });
  const LY = 4.75, h = 0.42, ww = 8.2, x0 = (10 - ww) / 2;
  s.addShape("roundRect", {x: x0, y: LY, w: ww, h, rectRadius: 0.08, fill: {color: "FFFFFF"}, line: {color: Z.C.grid, width: 0.75}});
  Z.T(s, [{text: "凡例　", options: {bold: true, color: MUTED}},
    {text: "a, b", options: {bold: true, color: K.navy.c}}, {text: "＝セット1　　"},
    {text: "x, y, z", options: {bold: true, color: K.teal.c}}, {text: "＝セット2　　"},
    {text: "—", options: {color: MUTED}}, {text: "＝元の値のまま"}],
  {x: x0 + 0.1, y: LY, w: ww - 0.2, h, fontSize: 14, align: "center", valign: "middle"});
  await Z.save(p, path.join(OUT, DIR.n45, "02_Intruderの攻撃タイプ.pptx"));
}

// ---- 図6：Scanner ----
// 小さい角丸ラベル（検査の種類など）
function tag(s, x, y, w, h, text, fill, color, line) {
  s.addText(text, {shape: "roundRect", rectRadius: 0.08, x, y, w, h, fill: {color: fill}, line: {color: line || K.navy.c, width: 1},
    fontFace: Z.FONT.en, fontSize: 14, bold: true, color, align: "center", valign: "middle", margin: 0});
  return {l: [x, y + h / 2], r: [x + w, y + h / 2], t: [x + w / 2, y], b: [x + w / 2, y + h]};
}
async function fig6() {
  const p = art("06", 6.4), s = Z.canvas(p);
  const FLOW = {color: "9AA0A6", width: 1.5}, D = 0.5;  // D：Scanner の枠の見出しの分だけ下げる
  await boxI(s, 0.15, 0.1, 6.8, 3.85, "Scanner", TOOL.scanner, {fill: "FFFFFF", line: "8FA9C8"});
  // ① クロール
  box(s, 0.3, 0.2 + D, 2.75, 2.8, "① クロール");
  const TH = 0.42;
  tag(s, 0.5, 0.65 + D, 2.35, TH, "リンク追跡", K.navy.f, K.navy.c);
  tag(s, 0.5, 1.12 + D, 2.35, TH, "フォーム送信", K.navy.f, K.navy.c);
  const lg = tag(s, 0.5, 1.59 + D, 2.35, TH, "ログイン", K.navy.f, K.navy.c);
  const sm = chip(s, 0.5, 2.3 + D, 2.35, 0.5, "サイトマップ", null, "gray", {hs: 15});
  A(s, [lg.b, sm.t], null, FLOW);
  // ② 監査
  box(s, 3.45, 0.2 + D, 3.3, 3.15, "② 監査");
  const AX = 4.05, AW = 2.45;
  tag(s, AX, 0.65 + D, AW, TH, "Passive", "FFFFFF", K.navy.c);
  const ACT = [["Light active", "E3ECF6", K.navy.c], ["Medium active", "C9DAEC", K.navy.c], ["Intrusive active", K.navy.c, "FFFFFF"]];
  const ay = (i) => 1.27 + D + i * 0.47;
  ACT.forEach(([n, f, c], i) => tag(s, AX, ay(i), AW, TH, n, f, c));
  const GX = AX - 0.08, GY0 = ay(0) - 0.07, GW = AW + 0.16, GH = ay(2) + TH + 0.07 - GY0;
  s.addShape("roundRect", {x: GX, y: GY0, w: GW, h: GH, rectRadius: 0.1, fill: {type: "none"}, line: {color: K.navy.c, width: 1.25}});
  tag(s, AX, 2.85 + D, AW, TH, "JavaScript analysis", K.teal.f, K.teal.c, K.teal.c);
  A(s, [[3.72, ay(0)], [3.72, ay(2) + TH]], null, {width: 2.25, color: K.red.c});
  // Issues（Scanner の外に出てくる結果）
  const is = chip(s, 7.3, 0.4 + D, 2.4, 0.9, "Issues", "重大度・確度", "gray", {hc: TITLE});
  A(s, [[6.75, is.l[1]], is.l], null, FLOW);
  A(s, [sm.r, [3.25, sm.r[1]], [3.25, 0.86 + D], [3.45, 0.86 + D]], null, FLOW);
  // 対象へのリクエスト
  const tg = await inode(s, "TbServer", "orange", 8.45, 4.4, "対象のWebアプリ", null, {w: 2.0, size: 0.56});
  const gy = GY0 + GH / 2;
  A(s, [[GX + GW, gy], [tg.t[0], gy], tg.t], "改変した\nリクエスト", {seg: 0, w: 1.3, h: 0.55, dx: 0.1});
  A(s, [[1.675, 3.0 + D], [1.675, tg.l[1]], tg.l], "通常のリクエスト", {seg: 1, w: 2.0, dx: -1.6});
  clegend(s, [[["frame", "フェーズ", 1.4], ["navy", "検査・処理", 1.75], ["group", "Active", 1.3], ["teal", "JS の解析", 1.55], ["gray", "成果物", 1.25]],
    [["solid", "リクエスト", 1.6], ["grayline", "処理の流れ", 1.75], ["redline", "副作用（下ほど大）", 2.6]]], 5.35);
  await Z.save(p, path.join(OUT, DIR.n46, "01_Scannerのクロールと監査.pptx"));
}

// ---- 図7：Collaborator ----
async function fig7() {
  const p = art("07"), s = Z.canvas(p);
  const CY = 0.95;
  const bp = await chipI(s, 0.25, CY - 0.45, 2.15, 0.9, "Burp", "Repeater・Scanner", "navy", TOOL.burp);
  const tg = await inode(s, "TbServer", "orange", 6.3, CY, "対象のWebアプリ", null, {w: 1.95});
  const cl = await inode(s, "TbRadar2", "navy", 8.75, 2.3, "Collaborator\nサーバー", "*.oastify.com", {w: 2.1, h: 0.95});
  A(s, [bp.r, tg.l], "① ペイロード入りリクエスト", {w: 3.2});
  code(s, 2.55, 1.12, 2.65, 0.45, [["url=", {text: "abc123.oastify.com", accent: true}]], {line: "DADCE0"});
  lbl(s, "レスポンスに変化なし", 5.2, 1.68, 2.2);
  pro(s, 9.17, 2.3 - 0.15);
  A(s, [tg.r, [cl.t[0], CY], cl.t], "② DNS / HTTP / SMTP", {seg: 0, w: 2.4, dx: 0.15});
  // ③ ④ ポーリング
  A(s, [[1.3, bp.b[1]], [1.3, 3.55], [cl.l[0] - 0.6, 3.55], [cl.l[0] - 0.6, cl.l[1]], cl.l], "③ ポーリング（60秒ごと）", {seg: 1, w: 3.0});
  A(s, [[cl.b[0], cl.b[1] + 0.02], [cl.b[0], 4.1], [0.8, 4.1], [0.8, bp.b[1]]], "④ インタラクションの詳細", {seg: 1, w: 3.0, dash: true});
  clegend(s, [["solid", "リクエスト", 1.6], ["reply", "応答", 1.1], ["navy", "Burp 側", 1.4], ["orange", "対象", 1.1], ["accent", "ペイロード", 1.6], ["pro", "Pro のみ", 1.5]], 4.65);
  await Z.save(p, path.join(OUT, DIR.n47, "01_Collaboratorでの帯域外検出.pptx"));
}

// ---- 図8：Sequencer ----
async function fig8() {
  const p = art("08"), s = Z.canvas(p);
  const tg = await inode(s, "TbServer", "orange", 1.0, 1.15, "対象のWebアプリ", null, {w: 1.9});
  await boxI(s, 2.95, 0.15, 6.9, 4.05, "Sequencer", TOOL.sequencer);
  const lc = chip(s, 3.15, 0.75, 1.75, 0.95, "Live capture", "トークン抽出", "navy");
  A(s, [[lc.l[0], 0.98], [tg.r[0], 0.98]], "① 反復送信", {w: 1.3});
  A(s, [[tg.r[0], 1.45], [lc.l[0], 1.45]], "② レスポンス", {w: 1.3, dash: true});
  lbl(s, "トークンのサンプル", 5.3, 0.35, 2.3, {bold: true, color: TITLE, align: "left"});
  const tk = code(s, 5.3, 0.7, 2.0, 1.3, ["8f3a91c2…", "c71e04b9…", "02bd5fa7…", "…"]);
  lbl(s, "FIPS 準拠には", 7.45, 0.9, 2.3, {align: "left"});
  lbl(s, "20,000 件", 7.45, 1.2, 2.3, {align: "left"});
  A(s, [lc.r, [tk.l[0], lc.r[1]]], null, {width: 1.5});
  const ts = chip(s, 4.5, 2.55, 3.2, 1.45, "検定", "文字単位：出現数・遷移\nビット単位：FIPS ほか", "navy");
  A(s, [tk.b, [tk.b[0], ts.t[1]]], "③ 分析", {w: 1.0});
  const rs = chip(s, 8.1, 2.55, 1.6, 1.45, "実効\nエントロピー", "有意水準ごとの\nビット数", "red", {hs: 16});
  A(s, [ts.r, rs.l], null);
  clegend(s, [["solid", "リクエスト・流れ", 2.2], ["reply", "レスポンス", 1.55], ["navy", "機能", 1.0], ["orange", "対象", 1.0], ["red", "推定結果", 1.4]], 4.5);
  await Z.save(p, path.join(OUT, DIR.n48, "01_Sequencerの乱数性分析.pptx"));
}

// ---- 図9：Decoder ----
async function fig9() {
  const p = art("09"), s = Z.canvas(p);
  // Decoder の画面（入力の欄の下に、変換結果の欄が順に並ぶ）を枠で表す
  await boxI(s, 0.15, 0.1, 9.7, 2.85, "Decoder", TOOL.decoder);
  const Y = 1.15, H = 0.8, W = 2.4, XS = [0.4, 3.8, 7.2];
  const d1 = code(s, XS[0], Y, W, H, ["JTNDc2NyaXB0JTNF"]);
  const d2 = code(s, XS[1], Y, W, H, ["%3Cscript%3E"]);
  const d3 = code(s, XS[2], Y, W, H, [{text: "<script>", accent: true}], {line: PINK, lw: 1.75});
  lbl(s, "入力", XS[0], 0.75, W, {bold: true, color: TITLE});
  lbl(s, "中間値", XS[1], 0.75, W, {bold: true, color: TITLE});
  lbl(s, "復元した値", XS[2], 0.75, W, {bold: true, color: TITLE});
  A(s, [d1.r, d2.l], "Base64\nデコード", {w: 1.0, h: 0.55});
  A(s, [d2.r, d3.l], "URL\nデコード", {w: 1.0, h: 0.55});
  // Smart decode（U 字の内側に注釈）
  A(s, [[d1.b[0], d1.b[1]], [d1.b[0], 2.65], [d3.b[0], 2.65], [d3.b[0], d3.b[1]]], [{text: "Smart decode", options: {bold: true}}, {text: "：形式を推定して自動で多段デコード"}],
    {seg: 1, w: 6.4, dash: true, color: K.navy.c});
  clegend(s, [["solid", "手動の変換（Decode as）", 3.0], ["navydash", "Smart decode", 2.1], ["accent", "復元した値", 1.7]], 3.2);
  await Z.save(p, path.join(OUT, DIR.n49, "01_Decoderの多段デコード.pptx"));
}
// ---- 図10：Comparer ----
async function fig10() {
  const p = art("10"), s = Z.canvas(p);
  const a = chip(s, 0.3, 0.2, 4.5, 0.75, "レスポンス A", "username=alice（登録済み）", "gray", {hc: TITLE});
  const b = chip(s, 5.2, 0.2, 4.5, 0.75, "レスポンス B", "username=zzz（未登録）", "gray", {hc: TITLE});
  const cp = await chipI(s, 3.3, 1.3, 3.4, 0.62, "Comparer（Words）", null, "navy", TOOL.comparer);
  A(s, [a.b, [a.b[0], cp.l[1]], cp.l], null, {width: 1.5});
  A(s, [b.b, [b.b[0], cp.r[1]], cp.r], null, {width: 1.5});
  const HL = "FFE08A";
  const pa = code(s, 0.3, 2.3, 4.5, 1.25, ["HTTP/2 200 OK", ["Content-Length: ", {text: "1532", hl: HL, bold: true}],
    [{text: "<p>Incorrect", hl: HL, bold: true}, " ", {text: "password</p>", hl: HL, bold: true}]]);
  const pb = code(s, 5.2, 2.3, 4.5, 1.25, ["HTTP/2 200 OK", ["Content-Length: ", {text: "1530", hl: HL, bold: true}],
    [{text: "<p>Invalid", hl: HL, bold: true}, " ", {text: "username</p>", hl: HL, bold: true}]]);
  A(s, [[cp.b[0], cp.b[1]], [cp.b[0], 2.12], [pa.t[0], 2.12], pa.t], null, {width: 1.5});
  A(s, [[cp.b[0], 2.12], [pb.t[0], 2.12], pb.t], null, {width: 1.5});
  lbl(s, "メッセージの差異：ユーザー名の列挙が可能", 0.3, 3.7, 9.4, {color: PINK, bold: true});
  clegend(s, [["gray", "比較するレスポンス", 2.5], ["navy", "Burp のツール", 1.9], ["hl", "差分トークン", 1.8], ["accent", "読み取れること", 2.1]], 4.3);
  await Z.save(p, path.join(OUT, DIR.n50, "01_Comparerでの差分比較.pptx"));
}

// ---- no.42 図2：Community と Professional の機能 ----
async function figEditions() {
  const p = art("42-2"), s = Z.canvas(p);
  await boxI(s, 0.2, 0.2, 9.6, 3.95, "Professional（有償）", TOOL.burp, {fill: "FFFFFF", line: K.navy.c});
  await boxI(s, 0.4, 0.75, 4.85, 3.2, "Community Edition（無償）", TOOL.burp);
  const CW = 2.1, CH = 0.72, XS = [0.6, 2.95], YS = [1.3, 2.2, 3.1];
  await chipI(s, XS[0], YS[0], CW, CH, "Proxy", "中継・記録", "navy", TOOL.proxy);
  await chipI(s, XS[1], YS[0], CW, CH, "Repeater", "手動再送", "navy", TOOL.repeater);
  await chipI(s, XS[0], YS[1], CW, CH, "Intruder", "demo 版", "navy", TOOL.intruder, {sc: PINK});
  await chipI(s, XS[1], YS[1], CW, CH, "Sequencer", "乱数性の分析", "navy", TOOL.sequencer);
  await chipI(s, XS[0], YS[2], CW, CH, "Decoder", "変換", "navy", TOOL.decoder);
  await chipI(s, XS[1], YS[2], CW, CH, "Comparer", "差分", "navy", TOOL.comparer);
  lbl(s, "Professional のみ", 5.5, 0.8, 3.8, {bold: true, color: TITLE, align: "left", h: 0.32});
  const PW = 1.98, PX = [5.48, 7.62];
  await chipI(s, PX[0], YS[0], PW, CH, "Scanner", "クロール・監査", "navy", TOOL.scanner);
  await chipI(s, PX[1], YS[0], PW, CH, "Collaborator", "帯域外検出", "navy", TOOL.collaborator);
  await chipI(s, PX[0], YS[1], PW, CH, "Intruder", "フル版", "navy", TOOL.intruder);
  await chipI(s, PX[1], YS[1], PW, CH, "Burp AT", "AI エージェント", "navy", TOOL.burpat);
  await chipI(s, PX[0], YS[2], PW, CH, "プロジェクト", "ディスクへの保存", "gray", TOOL.project, {hc: K.gray.c});
  await chipI(s, PX[1], YS[2], PW, CH, "検索", "Burp 全体の検索", "gray", TOOL.search, {hc: K.gray.c});
  clegend(s, [["navy", "Burp のツール", 2.0], ["gray", "作業管理の機能", 2.2], ["accent", "制限付き（demo）", 2.3]], 4.4);
  await Z.save(p, path.join(OUT, DIR.n42, "02_CommunityとProfessionalの機能.pptx"));
}

// ---- no.43 図2：HTTPS の中継（Burp の CA 証明書） ----
async function figHttps() {
  const p = art("43-2"), s = Z.canvas(p);
  const CY = 0.95;
  const br = await inode(s, "TbBrowser", "gray", 0.8, CY, "ブラウザ", null, {w: 1.3});
  const bp = await chipI(s, 3.95, CY - 0.45, 2.1, 0.9, "Burp Proxy", "復号・再暗号化", "navy", TOOL.proxy);
  const tg = await inode(s, "TbServer", "orange", 8.9, CY, "対象のWebアプリ", null, {w: 2.1});
  A(s, [br.r, bp.l], "① TLS 接続", {w: 1.5});
  A(s, [bp.r, tg.l], "② TLS 接続", {w: 1.5});
  lbl(s, "平文で表示・編集", 3.65, 1.45, 2.7, {color: K.navy.c, bold: true});
  // 提示される証明書
  const c1 = code(s, 2.3, 2.1, 2.4, 0.85, ["SAN: example.com", [{text: "発行者: Burp の CA", accent: true}]], {line: PINK, lw: 1.5});
  const c2 = code(s, 6.25, 2.1, 2.5, 0.85, ["SAN: example.com", "発行者: パブリック CA"]);
  lbl(s, "ホストごとに動的生成", 2.0, 3.0, 3.0);
  lbl(s, "サーバーの正規証明書", 6.0, 3.0, 3.0);
  A(s, [[c1.t[0], c1.t[1]], [c1.t[0], CY + 0.04]], null, {head: "none", dash: true, width: 1.25, color: MUTED});
  A(s, [[c2.t[0], c2.t[1]], [c2.t[0], CY + 0.04]], null, {head: "none", dash: true, width: 1.25, color: MUTED});
  // 信頼ストア
  const ts = chip(s, 0.2, 3.45, 2.4, 1.0, "信頼ストア", "Burp の CA 証明書\n（登録済み）", "gray", {hc: TITLE});
  A(s, [[0.8, ts.t[1]], [0.8, br.b[1] + 0.02]], null, {color: K.teal.c, width: 1.75});
  lbl(s, "信頼アンカー", 0.88, 2.45, 1.3, {align: "left", color: K.teal.c});
  lbl(s, "Burp Browser は登録不要（設定済み）", 2.8, 3.8, 4.5, {align: "left"});
  clegend(s, [["solid", "TLS 接続", 1.5], ["graydash", "証明書の提示", 1.9], ["tealline", "信頼アンカー", 1.9], ["accent", "Burp の CA による発行", 2.7]], 4.75);
  await Z.save(p, path.join(OUT, DIR.n43, "02_ProxyでのHTTPSの中継.pptx"));
}

(async () => { for (const f of [fig1, figEditions, fig2, figHttps, fig3, fig4, fig5, fig6, fig7, fig8, fig9, fig10]) await f(); })();
