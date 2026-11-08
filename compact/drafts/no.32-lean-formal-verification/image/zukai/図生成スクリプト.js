// compact no.32 Lean と形式検証 の図1〜3
// 実行：node 図生成スクリプト.js <出力フォルダ>（同じフォルダに zukai.js）
// 文字サイズ：本文 13pt、見出し 14pt（10in 幅の台紙を Qiita の本文幅 約800px に縮めても読める大きさ）
const Z = require("./zukai.js");
const { C } = Z;
const OUT = process.argv[2] || ".";
const F = 13, FT = 14, FH = 14, MONO = "Menlo";
const GREEN = "2E7D32", RED = "C62828", CODEBG = "F6F8FA";
const R = (t, o = {}) => ({ text: t, options: o });
const setFS = () => Object.assign(Z.FS, { label: FH - 2, sub: F, arrow: F, box: F });
const HEAD = { headColor: C.title };

function card(s, x, y, w, h, title, subs = [], o = {}) {
  s.addShape("roundRect", { x, y, w, h, rectRadius: 0.1, fill: { color: o.fill || C.white }, line: { color: o.line || C.icon, width: 1.5 } });
  const runs = [R(title, { bold: true, fontSize: FT, color: o.tcolor || C.title, breakLine: subs.length > 0 })];
  subs.forEach((l, i) => {
    const parts = Array.isArray(l) ? l : [R(l)];
    parts.forEach((p, j) => runs.push(R(p.text, { color: C.muted, ...p.options, breakLine: j === parts.length - 1 && i < subs.length - 1 })));
  });
  Z.T(s, runs, { x: x + 0.06, y, w: w - 0.12, h, fontSize: F, align: "center", valign: "middle" });
  return { l: [x, y + h / 2], r: [x + w, y + h / 2], t: [x + w / 2, y], b: [x + w / 2, y + h], x, y, w, h };
}
function code(s, x, y, w, h, lines, top = false) {   // lines: [[text, color?], ...]
  s.addShape("roundRect", { x, y, w, h, rectRadius: 0.06, fill: { color: CODEBG }, line: { color: C.grid, width: 0.75 } });
  const runs = [];
  lines.forEach((ln, i) => {
    const parts = Array.isArray(ln[0]) ? ln : [ln];
    parts.forEach((p, j) => runs.push(R(p[0], { color: p[1] || C.text, bold: !!p[2], breakLine: j === parts.length - 1 && i < lines.length - 1 })));
  });
  Z.T(s, runs, { x: x + 0.15, y: top ? y + 0.14 : y, w: w - 0.3, h: top ? h - 0.14 : h, fontSize: F, fontFace: MONO, valign: top ? "top" : "middle" });
}
function pill(s, x, y, text, w, color = C.pink) {
  s.addShape("roundRect", { x, y: y - 0.17, w, h: 0.34, rectRadius: 0.17, fill: { color }, line: { color: C.white, width: 1 } });
  Z.T(s, text, { x, y: y - 0.17, w, h: 0.34, fontSize: F, bold: true, color: C.white, align: "center", valign: "middle" });
}
function legendRow(s, x, y, w, items) {
  s.addShape("roundRect", { x, y, w, h: 0.46, rectRadius: 0.08, fill: { color: C.white }, line: { color: C.grid, width: 0.75 } });
  Z.T(s, "凡例", { x: x + 0.15, y, w: 0.6, h: 0.46, fontSize: F, bold: true, color: C.muted, valign: "middle" });
  let cx = x + 0.85;
  for (const it of items) { it.draw(cx, y + 0.23); Z.T(s, it.text, { x: cx + it.iw + 0.1, y, w: it.tw, h: 0.46, fontSize: F, color: C.text, valign: "middle" }); cx += it.iw + 0.1 + it.tw + 0.25; }
}
const band = (s, x, y, w, h) => s.addShape("roundRect", { x, y, w, h, rectRadius: h / 2, fill: { color: GREEN, transparency: 70 }, line: { color: GREEN, width: 1.25 } });
const dot = (s, cx, cy, ok) => s.addShape("ellipse", { x: cx - 0.09, y: cy - 0.09, w: 0.18, h: 0.18,
  fill: ok ? { color: GREEN } : { color: C.white }, line: { color: ok ? GREEN : C.gray, width: 1.25 } });

// ======================= 図1：テストと形式検証の違い =======================
async function fig1() {
  const p = Z.article({ title: "テストと形式検証の違い" }); setFS();
  p.defineLayout({ name: "F1", width: 10, height: 5.1 }); p.layout = "F1";
  const s = Z.canvas(p);
  const FY = 0.65, FHt = 3.05, FW = 4.6, LX = 0.25, RX = 5.15;
  Z.frame(s, LX, FY, FW, FHt, "テスト：有限個の入力で実行", HEAD);
  Z.frame(s, RX, FY, FW, FHt, "形式検証：全入力について証明", HEAD);
  // 左：#eval で3点だけ確かめる
  code(s, LX + 0.25, FY + 0.25, FW - 0.5, 0.95, [
    [["#eval 0 + 0 == 0     "], ["-- true", C.muted]],
    [["#eval 0 + 1 == 1     "], ["-- true", C.muted]],
    [["#eval 0 + 100 == 100 "], ["-- true", C.muted]],
  ], true);
  // 右：定理として証明
  code(s, RX + 0.25, FY + 0.25, FW - 0.5, 0.95, [
    [["theorem", C.label, true], [" my_zero_add (n : Nat) :"]],
    [["    0 + n = n := "], ["by", C.label, true], [" omega"]],
  ], true);
  // 数直線（入力空間 n : Nat）
  const NY = FY + 1.65, ticks = ["0", "1", "2", "3", "…", "100", "…"];
  const axis = (x0) => {
    Z.arrow(s, [[x0 + 0.25, NY], [x0 + FW - 0.4, NY]], null, { color: C.gray, width: 1.25 });
    Z.T(s, "n", { x: x0 + FW - 0.34, y: NY - 0.14, w: 0.2, h: 0.28, fontSize: F, fontFace: MONO, color: C.muted, align: "left", valign: "middle" });
    return ticks.map((t, i) => {
      const cx = x0 + 0.5 + i * 0.58;
      Z.T(s, t, { x: cx - 0.3, y: NY + 0.14, w: 0.6, h: 0.25, fontSize: F, fontFace: MONO, color: C.muted, align: "center" });
      return cx;
    });
  };
  const lx = axis(LX);
  lx.forEach((cx, i) => { if (ticks[i] !== "…") dot(s, cx, NY, [0, 1, 5].includes(i)); });
  Z.T(s, [R("確認済み 3 点", { color: GREEN, bold: true }), R("　それ以外は未検査", { color: C.muted })],
    { x: LX + 0.25, y: NY + 0.5, w: FW - 0.5, h: 0.3, fontSize: F, align: "center" });
  Z.T(s, "反例がないことは未保証", { x: LX + 0.25, y: NY + 0.85, w: FW - 0.5, h: 0.3, fontSize: F, color: C.muted, align: "center" });
  const rx = axis(RX);
  rx.forEach((cx, i) => { if (ticks[i] !== "…") s.addShape("line", { x: cx, y: NY - 0.08, w: 0, h: 0.16, line: { color: C.gray, width: 1.25 } }); });
  band(s, rx[0] - 0.15, NY - 0.13, RX + FW - 0.48 - (rx[0] - 0.15), 0.26);
  Z.T(s, [R("すべての n : Nat", { color: GREEN, bold: true }), R(" で成立", { color: C.muted })],
    { x: RX + 0.25, y: NY + 0.5, w: FW - 0.5, h: 0.3, fontSize: F, align: "center" });
  Z.T(s, "証明項はカーネルが型検査", { x: RX + 0.25, y: NY + 0.85, w: FW - 0.5, h: 0.3, fontSize: F, color: C.muted, align: "center" });
  // 共通の限界
  Z.note(s, LX, FY + FHt + 0.2, 9.5, 0.45, [R("共通の限界：", { bold: true }), R("仕様（ここでは "), R("0 + n = n", { fontFace: MONO }), R("）が意図どおりかは検証対象外")]);
  legendRow(s, LX, 4.5, 9.5, [
    { draw: (x, y) => dot(s, x + 0.12, y, true), iw: 0.25, tw: 1.9, text: "確認済みの入力" },
    { draw: (x, y) => dot(s, x + 0.12, y, false), iw: 0.25, tw: 1.6, text: "未検査の入力" },
    { draw: (x, y) => band(s, x, y - 0.09, 0.45, 0.18), iw: 0.45, tw: 2.6, text: "証明で網羅（全 n : Nat）" },
  ]);
  await Z.save(p, `${OUT}/01_テストと形式検証の違い.pptx`);
}

// ======================= 図2：Lean で証明が受理されるまで =======================
async function fig2() {
  const p = Z.article({ title: "Lean で証明が受理されるまで" }); setFS();
  p.defineLayout({ name: "F2", width: 10, height: 5.7 }); p.layout = "F2";
  const s = Z.canvas(p);
  const Y = 2.1, H = 1.15, W = 1.35, G = 0.68, X0 = 0.28;
  const xs = [0, 1, 2, 3, 4].map((i) => X0 + i * (W + G)), cx = (i) => xs[i] + W / 2;
  const PINKBG = "FDF2F6", GRAYBG = "F3F4F6";
  // 枠：証明部分は信頼不要／信頼の基盤（カーネル＋公理）
  Z.frame(s, xs[1] - 0.2, 1.7, 2 * W + G + 0.4, 1.95, "証明部分は信頼不要", { ...HEAD, fill: GRAYBG });
  Z.frame(s, xs[3] - 0.2, 1.0, W + 0.4, 2.65, "信頼の基盤", { ...HEAD, fill: PINKBG });
  const src = card(s, xs[0], Y, W, H, ".lean ファイル", ["定理の主張", "＋証明"], { fill: C.grayFill, line: C.muted });
  Z.T(s, ["主張の意味は", "人が確認"].map((t, i) => R(t, { breakLine: i === 0 })), { x: xs[0] - 0.1, y: Y + H + 0.1, w: W + 0.2, h: 0.55, fontSize: F, color: C.muted, align: "center" });
  const par = card(s, xs[1], Y, W, H, "パーサ", ["構文解析"]);
  const ela = card(s, xs[2], Y, W, H, "エラボレータ", ["型推論", "タクティク実行"]);
  const ker = card(s, xs[3], Y, W, H, "カーネル", ["証明項の", "型検査"], { line: C.pink, fill: "FCE4EC" });
  card(s, xs[3], 1.2, W, 0.62, "公理", [[R("propext", { fontFace: MONO }), R(" 等")]], { line: C.pink, fill: "FCE4EC" });
  const env = card(s, xs[4], Y, W, H, "環境", ["定理として", "登録"], { line: C.arrow });
  const LBL = { w: G - 0.04, width: 1.75 };
  Z.arrow(s, [src.r, par.l], "", { width: 1.75 });
  Z.arrow(s, [par.r, ela.l], "構文木", LBL);
  Z.arrow(s, [ela.r, ker.l], "証明項", LBL);
  Z.arrow(s, [ker.r, env.l], "受理", { ...LBL, color: GREEN });
  // Mathlib（ビルド時に検査済みの宣言を読み込む）
  const lib = card(s, xs[2], 0.2, W, 0.62, "Mathlib", [[R(".olean", { fontFace: MONO })]], { fill: C.grayFill, line: C.muted });
  Z.arrow(s, [[cx(2), lib.b[1]], [cx(2), ela.t[1]]], "import：検査済み宣言（再検査なし）", { w: 3.2, left: true, dash: true, dy: -0.35 });
  // エラー：ふだんはエラボレータ、まれにカーネル
  const ex = (cx(2) + cx(3)) / 2, EY = 4.3, EW = 1.3;
  const err = card(s, ex - EW / 2, EY - 0.27, EW, 0.54, "エラー", [], { line: RED, tcolor: RED });
  Z.arrow(s, [[cx(2), ela.b[1]], [cx(2), EY], [err.x, EY]], "型不一致・未解決ゴール", { color: RED, width: 1.5, left: true, seg: 0, w: 2.3 });
  Z.arrow(s, [[cx(3), ker.b[1]], [cx(3), EY], [err.x + EW, EY]], "不受理（まれ）", { color: RED, width: 1.5, seg: 0, w: 1.6 });
  // 注記
  Z.note(s, X0, 4.0, 4.6, 0.66, [R("sorry", { fontFace: MONO, bold: true }), R("：公理 "), R("sorryAx", { fontFace: MONO }), R(" として受理（警告のみ）", { breakLine: true }),
    R("→ "), R("#print axioms", { fontFace: MONO, bold: true }), R(" で検出")]);
  Z.note(s, X0, 4.8, 4.6, 0.66, [R(".olean", { fontFace: MONO }), R(" の宣言をカーネルで再検査可", { breakLine: true }),
    R("leanchecker", { fontFace: MONO, bold: true }), R("（旧 "), R("lean4checker", { fontFace: MONO }), R("）")]);
  // 凡例（縦）
  const LX = 7.3, LY = 4.08, LW = 2.45;
  s.addShape("roundRect", { x: LX, y: LY, w: LW, h: 1.52, rectRadius: 0.08, fill: { color: C.white }, line: { color: C.grid, width: 0.75 } });
  Z.T(s, "凡例", { x: LX + 0.12, y: LY + 0.05, w: 1, h: 0.3, fontSize: F, bold: true, color: C.muted });
  [[C.grayFill, C.muted, "入力"], [C.white, C.icon, "処理"], ["FCE4EC", C.pink, "信頼の基盤"]].forEach(([f, l, t], i) => {
    const yy = LY + 0.5 + i * 0.3;
    s.addShape("roundRect", { x: LX + 0.15, y: yy - 0.09, w: 0.32, h: 0.2, rectRadius: 0.04, fill: { color: f }, line: { color: l, width: 1.25 } });
    Z.T(s, t, { x: LX + 0.57, y: yy - 0.14, w: 1.8, h: 0.28, fontSize: F, valign: "middle" });
  });
  const yy = LY + 1.4;
  Z.arrow(s, [[LX + 0.15, yy - 0.04], [LX + 0.47, yy - 0.04]], null, { color: GREEN, width: 1.5 });
  Z.T(s, "受理", { x: LX + 0.57, y: yy - 0.18, w: 0.6, h: 0.28, fontSize: F, valign: "middle" });
  Z.arrow(s, [[LX + 1.2, yy - 0.04], [LX + 1.52, yy - 0.04]], null, { color: RED, width: 1.5 });
  Z.T(s, "エラー", { x: LX + 1.62, y: yy - 0.18, w: 0.8, h: 0.28, fontSize: F, valign: "middle" });
  await Z.save(p, `${OUT}/02_Leanで証明が受理されるまで.pptx`);
}

// ======================= 図3：命題と型の対応 =======================
async function fig3() {
  const p = Z.article({ title: "命題と型の対応" }); setFS();
  p.defineLayout({ name: "F3", width: 10, height: 4.75 }); p.layout = "F3";
  const s = Z.canvas(p);
  const X = 0.25, Y = 0.25, cw = [1.9, 3.0, 4.6], RH = 0.56, HH = 0.48, COLON = 1.55;
  const M = (t, c) => R(t, { fontFace: MONO, color: c || C.text });
  // [論理の語, 論理の記法, 型理論, [項], [型]]
  const rows = [
    ["命題とその証明", "", [R("型とその項")], "rfl", "n + 0 = n"],
    ["含意", "P → Q", [R("関数型")], "fun _ => hq", "P → Q"],
    ["連言", "P ∧ Q", [R("構造体 "), M("And", C.label)], "⟨hp, hq⟩", "P ∧ Q"],
    ["全称", "∀ x, P x", [R("依存関数型 "), M("(x : α) → P x", C.label)], "fun n => rfl", "∀ n : Nat, n + 0 = n"],
    ["証明の検査", "", [R("型検査")], null, "example (n : Nat) : n + 0 = n := rfl"],
  ];
  const heads = ["論理", "型理論", "Lean 4 コード（項 : 型）"];
  let x = X;
  heads.forEach((h, i) => {
    s.addShape("rect", { x, y: Y, w: cw[i], h: HH, fill: { color: C.title }, line: { color: C.white, width: 1 } });
    Z.T(s, h, { x, y: Y, w: cw[i], h: HH, fontSize: FT, bold: true, color: C.white, align: "center", valign: "middle" });
    x += cw[i];
  });
  rows.forEach((r, j) => {
    const y = Y + HH + j * RH, bg = j % 2 ? "F8FBFF" : C.white;
    let x = X;
    for (let i = 0; i < 3; i++) { s.addShape("rect", { x, y, w: cw[i], h: RH, fill: { color: bg }, line: { color: C.frameLine, width: 0.75 } }); x += cw[i]; }
    Z.T(s, [R(r[0], { bold: true }), R(r[1] ? "　" + r[1] : "", { color: C.text })], { x: X + 0.2, y, w: cw[0] - 0.3, h: RH, fontSize: F, color: C.title, valign: "middle" });
    Z.T(s, r[2].map((q) => R(q.text, { bold: true, color: C.label, ...q.options })), { x: X + cw[0] + 0.15, y, w: cw[1] - 0.3, h: RH, fontSize: F, align: "center", valign: "middle" });
    const cx = X + cw[0] + cw[1] + 0.2;
    if (r[3] === null) Z.T(s, [M(r[4])], { x: cx, y, w: cw[2] - 0.3, h: RH, fontSize: F, valign: "middle" });
    else {
      Z.T(s, [M(r[3])], { x: cx, y, w: COLON, h: RH, fontSize: F, valign: "middle" });
      Z.T(s, [M(": ", C.muted), M(r[4])], { x: cx + COLON, y, w: cw[2] - COLON - 0.3, h: RH, fontSize: F, valign: "middle" });
    }
  });
  Z.note(s, X, Y + HH + rows.length * RH + 0.2, 9.5, 0.78, [
    R("カリー＝ハワード対応：", { bold: true }), R("命題 P の証明＝型 P の項、証明の検査＝型検査", { breakLine: true }),
    R("文脈：", { bold: true }), M("n : Nat"), R("、"), M("P Q : Prop"), R("、"), M("hp : P"), R("、"), M("hq : Q")]);
  await Z.save(p, `${OUT}/03_命題と型の対応.pptx`);
}

(async () => { await fig1(); await fig2(); await fig3(); })();
