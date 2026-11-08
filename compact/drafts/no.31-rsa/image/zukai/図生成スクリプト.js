// compact no.31 RSA暗号 の図1〜3
// 実行：node 図生成スクリプト.js <出力フォルダ>（同じフォルダに zukai.js）
// 文字：本文 13pt、カード見出し・枠見出し 14pt。ピンク＝秘密の値、青＝公開の値
const Z = require("./zukai.js");
const { C } = Z;
const OUT = process.argv[2] || ".";
const F = 13, FT = 14;
const R = (t, o = {}) => ({ text: t, options: { ...o } });
const SEC = { color: C.pink, bold: true };   // 秘密の値
const PUB = { color: C.label, bold: true };  // 公開の値
const SUP = (t, o = {}) => R(t, { superscript: true, fontSize: 21, ...o });
const HEAD = { headColor: C.title };
const setFS = () => Object.assign(Z.FS, { label: FT - 2, sub: F, arrow: F, box: F });
function newDeck(title) {
  const p = Z.article({ title }); setFS();
  p.defineLayout({ name: "A", width: 10, height: 5.6 }); p.layout = "A";
  return p;
}
// カード：太字見出し＋本文行（行は文字列か run 配列）
function card(s, x, y, w, h, title, lines = [], o = {}) {
  s.addShape("roundRect", { x, y, w, h, rectRadius: 0.1, fill: { color: o.fill || C.white }, line: { color: o.line || C.gray, width: 1.5 } });
  const runs = title ? [R(title, { bold: true, fontSize: FT, color: C.title, breakLine: lines.length > 0 })] : [];
  lines.forEach((l, i) => {
    const parts = Array.isArray(l) ? l : typeof l === "string" ? [R(l)] : [l];
    parts.forEach((p, j) => runs.push(R(p.text, { color: C.text, ...p.options, breakLine: j === parts.length - 1 && i < lines.length - 1 })));
  });
  const top = o.valign === "top"; Z.T(s, runs, { x: x + 0.15, y: top ? y + 0.15 : y, w: w - 0.3, h: top ? h - 0.3 : h, fontSize: F, align: o.align || "left", valign: o.valign || "middle", lineSpacingMultiple: 1.15 });
  return { l: [x, y + h / 2], r: [x + w, y + h / 2], t: [x + w / 2, y], b: [x + w / 2, y + h], x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
}
function legendRow(s, x, y, w, items) {
  s.addShape("roundRect", { x, y, w, h: 0.46, rectRadius: 0.08, fill: { color: C.white }, line: { color: C.grid, width: 0.75 } });
  Z.T(s, "凡例", { x: x + 0.15, y, w: 0.6, h: 0.46, fontSize: F, bold: true, color: C.muted, valign: "middle" });
  let cx = x + 0.8;
  for (const it of items) { it.draw(cx, y + 0.23); Z.T(s, it.text, { x: cx + it.iw + 0.1, y, w: it.tw, h: 0.46, fontSize: F, color: C.text, valign: "middle" }); cx += it.iw + 0.1 + it.tw + 0.2; }
}
const swatch = (s, txt, o) => (x, y) => Z.T(s, txt, { x, y: y - 0.15, w: 0.5, h: 0.3, fontSize: F, align: "center", valign: "middle", color: o.color, bold: o.bold });
const line = (s, o = {}) => (x, y) => Z.arrow(s, [[x, y], [x + 0.55, y]], null, { width: 1.75, ...o });


const NEU = { fill: "F3F4F6", headColor: C.title };            // 中立の枠（受信者・送信者）
const LG_SEC = (s) => ({ draw: swatch(s, "abc", SEC), iw: 0.5, tw: 1.75, text: "秘密（受信者のみ）" });
const LG_PUB = (s) => ({ draw: swatch(s, "abc", PUB), iw: 0.5, tw: 0.5, text: "公開" });
const LG_PLAIN = (s) => ({ draw: swatch(s, "abc", { color: C.text }), iw: 0.5, tw: 0.5, text: "平文" });
const LG_SEND = (s) => ({ draw: line(s), iw: 0.55, tw: 0.5, text: "送信" });
const LG_TAP = (s) => ({ draw: (x, y) => s.addShape("rect", { x: x + 0.03, y: y - 0.09, w: 0.5, h: 0.18, fill: { type: "none" }, line: { color: C.muted, width: 1, dashType: "dash" } }), iw: 0.55, tw: 1.5, text: "盗聴され得る経路" });
// 受信者｜通信路｜送信者 の共通骨組み（図1・図2）
const L = { fx: 0.25, fw: 3.75, mx: 4.15, mw: 1.7, rx: 6.0, FY: 0.65, FH: 3.5, cw: 3.35 };
function skeleton(s, FH = L.FH) {
  Z.frame(s, L.fx, L.FY, L.fw, FH, "受信者（鍵の持ち主）", NEU);
  Z.frame(s, L.rx, L.FY, L.fw, FH, "送信者", NEU);
  s.addShape("rect", { x: L.mx, y: L.FY - 0.05, w: L.mw, h: FH + 0.1, fill: { type: "none" }, line: { color: C.muted, width: 1.25, dashType: "dash" } });
  Z.T(s, "通信路", { x: L.mx, y: L.FY + 0.05, w: L.mw, h: 0.3, fontSize: FT, bold: true, color: C.muted, align: "center" });
}
// 通信路の中央にラベルを置く横矢印
function chArrow(s, x1, x2, y, label) {
  Z.arrow(s, [[x1, y], [x2, y]], null, { width: 1.75 });
  Z.T(s, label, { x: L.mx, y: y - 0.62, w: L.mw, h: 0.58, fontSize: F, align: "center", valign: "bottom" });
}

// ======================= 図1：鍵の生成・暗号化・復号の流れ =======================
async function fig1() {
  const p = newDeck("RSAの鍵の生成・暗号化・復号の流れ");
  const s = Z.canvas(p);
  skeleton(s);
  const K = card(s, 0.45, 0.95, L.cw, 1.95, "① 鍵の生成", [
    [R("p", SEC), R(", "), R("q", SEC), R("：ランダムな大きな素数（"), R("p", SEC), R(" ≠ "), R("q", SEC), R("）")],
    [R("n", PUB), R(" = "), R("p", SEC), R(" · "), R("q", SEC), R(",   "), R("φ(n)", SEC), R(" = ("), R("p", SEC), R(" − 1)("), R("q", SEC), R(" − 1)")],
    [R("e", PUB), R("：1 < "), R("e", PUB), R(" < "), R("φ(n)", SEC), R(",  gcd("), R("e", PUB), R(", "), R("φ(n)", SEC), R(") = 1")],
    [R("d", SEC), R(" ≡ "), R("e", PUB), SUP("−1", PUB), R(" (mod "), R("φ(n)", SEC), R(")")],
  ], { valign: "top" });
  const D = card(s, 0.45, 3.1, L.cw, 0.9, "⑤ 復号", [
    [R("m = "), R("c", PUB), SUP("d", SEC), R(" mod "), R("n", PUB), R("（秘密鍵 ("), R("n", PUB), R(", "), R("d", SEC), R(")）")],
  ]);
  const E = card(s, 6.2, 0.95, L.cw, 3.05, "③ 暗号化", [
    [R("c", PUB), R(" = m"), SUP("e", PUB), R(" mod "), R("n", PUB)],
    [R("m：平文の整数表現（0 ≤ m < "), R("n", PUB), R("）")],
    [R(" ")],
    [R("公開鍵 (", { color: C.muted }), R("n", PUB), R(", ", { color: C.muted }), R("e", PUB), R(") のみで暗号化可能", { color: C.muted })],
    [R("実用：m は OAEP 符号化後の整数", { color: C.muted })],
  ], { valign: "top" });
  chArrow(s, K.x + K.w, E.x, 1.55, [R("② 公開鍵\n"), R("(n, e)", PUB)]);
  chArrow(s, E.x, D.x + D.w, D.cy, [R("④ 暗号文 "), R("c", PUB)]);
  Z.T(s, [R("第三者も入手可能", { bold: true, color: C.muted, breakLine: true }), R("n", PUB), R(", "), R("e", PUB), R(", "), R("c", PUB)],
    { x: L.mx, y: 2.25, w: L.mw, h: 0.7, fontSize: F, align: "center", valign: "middle" });
  legendRow(s, 0.25, 4.5, 9.5, [LG_SEC(s), LG_PUB(s), LG_PLAIN(s), LG_SEND(s), LG_TAP(s)]);
  await Z.save(p, `${OUT}/01_RSAの鍵の生成と暗号化と復号.pptx`);
}

// ======================= 図2：小さい数での計算例 =======================
async function fig2() {
  const p = newDeck("小さい数でのRSAの計算例");
  const s = Z.canvas(p);
  skeleton(s);
  const K = card(s, 0.45, 0.95, L.cw, 2.05, "① 鍵の生成", [
    [R("p", SEC), R(" = "), R("61", SEC), R(",  "), R("q", SEC), R(" = "), R("53", SEC)],
    [R("n", PUB), R(" = "), R("61", SEC), R(" × "), R("53", SEC), R(" = "), R("3233", PUB)],
    [R("φ(n)", SEC), R(" = "), R("60", SEC), R(" × "), R("52", SEC), R(" = "), R("3120", SEC)],
    [R("e", PUB), R(" = "), R("17", PUB), R(",  "), R("d", SEC), R(" = "), R("2753", SEC)],
    [R("検算：17 × 2753 = 15 × 3120 + 1", { color: C.muted })],
  ], { valign: "top" });
  const D = card(s, 0.45, 3.15, L.cw, 0.85, "⑤ 復号", [
    [R("m = "), R("2790", PUB), SUP("2753", SEC), R(" mod "), R("3233", PUB), R(" = "), R("65", { bold: true })],
  ]);
  const E = card(s, 6.2, 0.95, L.cw, 3.05, "③ 暗号化", [
    [R("m = "), R("65", { bold: true }), R("（平文）")],
    [R("c", PUB), R(" = 65"), SUP("17", PUB), R(" mod "), R("3233", PUB)],
    [R("  = "), R("2790", PUB)],
  ], { valign: "top" });
  chArrow(s, K.x + K.w, E.x, 1.55, [R("② 公開鍵\n"), R("(3233, 17)", PUB)]);
  chArrow(s, E.x, D.x + D.w, D.cy, [R("④ 暗号文\n"), R("c = 2790", PUB)]);
  Z.T(s, [R("第三者も入手可能", { bold: true, color: C.muted, breakLine: true }), R("3233", PUB), R(", "), R("17", PUB), R(", "), R("2790", PUB)],
    { x: L.mx, y: 2.25, w: L.mw, h: 0.7, fontSize: F, align: "center", valign: "middle" });
  Z.note(s, 0.25, 4.3, 4.65, 0.62, "textbook RSA（パディングなし）：実用不可\n実用：n は 2048 bit 以上＋OAEP（署名は PSS）");
  Z.note(s, 5.1, 4.3, 4.65, 0.62, "RFC 8017：d を λ(n) = lcm(p−1, q−1) = 780 で定義\nこの場合 d = 413（2753 も条件を満たす）");
  legendRow(s, 0.25, 5.07, 9.5, [LG_SEC(s), LG_PUB(s), LG_PLAIN(s), LG_SEND(s), LG_TAP(s)]);
  await Z.save(p, `${OUT}/02_小さい数でのRSAの計算例.pptx`);
}

// ======================= 図3：安全性の根拠 =======================
async function fig3() {
  const p = newDeck("RSAの安全性の根拠");
  const s = Z.canvas(p);
  const FY = 0.65, FH = 3.25, CW = 2.4, CH = 0.75;
  Z.frame(s, 0.25, FY, 3.6, FH, "秘密の値（受信者のみ）", { fill: "FDECF2", headColor: C.pink });
  Z.frame(s, 6.15, FY, 3.6, FH, "公開の値（第三者も入手可能）", { fill: C.frame, headColor: C.label });
  const sc = { align: "center", line: C.pink };
  const pc = { align: "center", line: C.icon };
  const big = (t, o) => R(t, { ...o, fontSize: FT + 2 });
  const PQ = card(s, 0.5, 0.9, CW, CH, "", [[big("p, q", SEC)], [R("ランダムな大きな素数", { color: C.muted })]], sc);
  const PH = card(s, 0.5, 1.95, CW, CH, "", [[big("φ(n)", SEC)], [R("(p − 1)(q − 1)", { color: C.muted })]], sc);
  const D = card(s, 0.5, 3.0, CW, CH, "", [[big("d", SEC)], [R("秘密指数", { color: C.muted })]], sc);
  const N = card(s, 7.1, 0.9, CW, CH, "", [[big("n", PUB)], [R("法", { color: C.muted })]], pc);
  const E = card(s, 7.1, 1.95, CW, CH, "", [[big("e", PUB)], [R("公開指数", { color: C.muted })]], pc);
  Z.arrow(s, [[PQ.x + CW, 1.05], [N.x, 1.05]], "乗算 p × q：多項式時間", { w: 3.4, width: 1.75 });
  Z.arrow(s, [[N.x, 1.5], [PQ.x + CW, 1.5]], null, { dash: true, open: false, width: 1.75 });
  Z.T(s, "素因数分解：既知の古典解法は準指数時間", { x: (N.x + PQ.x + CW) / 2 - 2.1, y: 1.5 - 0.36, w: 4.2, h: 0.32, fontSize: F, color: C.arrow, align: "center", valign: "bottom" });
  Z.arrow(s, [[PQ.cx, PQ.y + CH], [PH.cx, PH.y]], null, { width: 1.75 });
  // φ(n) → d に e が合流（φ(n) と e が揃えば d を算出）
  const JY = PH.y + CH + 0.12;
  Z.arrow(s, [[PH.cx, PH.y + CH], [D.cx, D.y]], null, { width: 1.75 });
  Z.arrow(s, [[E.x, E.cy], [3.45, E.cy], [3.45, JY], [PH.cx, JY]], null, { width: 1.75, head: "none" });
  s.addShape("ellipse", { x: PH.cx - 0.05, y: JY - 0.05, w: 0.1, h: 0.1, fill: { color: C.arrow }, line: { type: "none" } });
  Z.T(s, [R("d", SEC), R(" ≡ "), R("e", PUB), SUP("−1", PUB), R(" (mod "), R("φ(n)", SEC), R(")")],
    { x: 3.45, y: E.cy - 0.45, w: E.x - 3.45, h: 0.42, fontSize: F, color: C.arrow, align: "center", valign: "bottom" });
  Z.note(s, 0.25, 4.15, 9.5, 0.62, "d の復元と n の素因数分解：等価（証明済み）\nd を使わない c → m の計算（RSA 問題）と素因数分解の等価性：未証明");
  legendRow(s, 0.25, 4.98, 9.5, [
    { draw: line(s), iw: 0.55, tw: 1.6, text: "効率的に計算可能" },
    { draw: line(s, { dash: true, open: false }), iw: 0.55, tw: 2.6, text: "既知の効率的な古典解法なし" },
    { draw: (x, y) => s.addShape("ellipse", { x: x + 0.2, y: y - 0.06, w: 0.12, h: 0.12, fill: { color: C.arrow }, line: { type: "none" } }), iw: 0.5, tw: 2.0, text: "両方の入力が必要" },
  ]);
  await Z.save(p, `${OUT}/03_RSAの安全性の根拠.pptx`);
}

(async () => { await fig1(); await fig2(); await fig3(); })();
