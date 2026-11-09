// 図1 フェルミ推定の手順（UMLアクティビティ図、zukai-diagrams の記事用台紙 10×5.625in）
// 実行: node gen.js [出力.pptx]  → PNG は render.sh
const Z = require("./zukai.js"), C = Z.C;
const OUT = process.argv[2] || "01_フェルミ推定の手順.pptx";
const F = {title: 16, sub: 14, guard: 14, ex: 14, head: 15};
const BW = 1.35, BH = 1.0, Y = 0.55, MY = Y + BH / 2, XS = [0.65, 2.55, 4.16, 5.77, 7.38];
const STEPS = [["問いの定義", "対象と範囲"], ["分解", "四則演算の式"], ["数値の仮定", "概数＋根拠"], ["計算", "指数で計算"], ["確認", "別解・統計値"]];
const sup = (t) => ({text: t, options: {superscript: true}});
const EX = [
  [[{text: "日本国内の"}], [{text: "コンビニ店舗数"}]],
  [[{text: "人口 ÷"}], [{text: "1店舗あたり人口"}]],
  [[{text: "人口 1.2億人"}], [{text: "1店舗 2,000人"}]],
  [[{text: "1.2×10"}, sup("8"), {text: "÷(2×10"}, sup("3"), {text: ")"}], [{text: "＝ 6×10"}, sup("4"), {text: "店"}]],
  [[{text: "統計値 56,208店"}], [{text: "桁の一致"}]],
];
const cx = (i) => XS[i] + BW / 2;

(async () => {
  const p = Z.article({title: "フェルミ推定の手順"});
  const s = Z.canvas(p);
  // 開始 → 問いの定義 → 合流 → 分解 → … → 確認
  Z.point(s, 0.3, MY, "start");
  Z.arrow(s, [[0.43, MY], [XS[0], MY]]);
  STEPS.forEach(([t, d], i) => {
    s.addText([{text: t, options: {fontSize: F.title, bold: true, color: C.title, breakLine: true}},
               {text: d, options: {fontSize: F.sub, bold: false, color: C.muted}}],
      {shape: "roundRect", rectRadius: 0.1, x: XS[i], y: Y, w: BW, h: BH, fill: {color: C.white},
       line: {color: C.icon, width: 1.25}, fontFace: Z.FONT.en, align: "center", valign: "middle", margin: 0.04, paraSpaceAfter: 2});
  });
  const mx = 2.27, md = 0.26;  // 合流ノード
  Z.arrow(s, [[XS[0] + BW, MY], [mx - md / 2, MY]]);
  Z.decision(s, mx, MY, md);
  Z.arrow(s, [[mx + md / 2, MY], [XS[1], MY]]);
  for (let i = 1; i < 4; i++) Z.arrow(s, [[XS[i] + BW, MY], [XS[i + 1], MY]]);
  // 分岐：桁が合っているか
  const dx = cx(4), dy = 2.2, d = 0.5;
  Z.arrow(s, [[dx, Y + BH], [dx, dy - d / 2]]);
  Z.decision(s, dx, dy, d);
  // [桁の一致] → 終了（推定値）
  const ex = 9.6;
  Z.arrow(s, [[dx + d / 2, dy], [ex - 0.15, dy]]);
  Z.T(s, "[桁の一致]", {x: dx + d / 2 + 0.03, y: dy - 0.42, w: ex - 0.2 - dx - d / 2, h: 0.34, fontSize: F.guard, bold: true, color: C.title, align: "center", valign: "bottom"});
  Z.point(s, ex, dy, "end");
  Z.T(s, "推定値", {x: ex - 0.5, y: dy + 0.2, w: 1.0, h: 0.32, fontSize: F.guard, bold: true, color: C.title, align: "center"});
  // [桁のずれ] → 合流ノードへ戻る
  Z.arrow(s, [[dx - d / 2, dy], [mx, dy], [mx, MY + md / 2]], null);
  Z.T(s, "[桁のずれ]", {x: dx - d / 2 - 1.2, y: dy - 0.42, w: 1.1, h: 0.34, fontSize: F.guard, bold: true, color: C.title, align: "right", valign: "bottom"});
  // 例1：コンビニの店舗数（各手順の下にそろえる）
  const fy = 2.8, fh = 1.35;
  Z.frame(s, 0.3, fy, 9.55, fh, null, {dashed: true, line: C.gray});
  Z.T(s, "例1：日本のコンビニ店舗数", {x: 0.42, y: fy + 0.1, w: 5, h: 0.32, fontSize: F.head, bold: true, color: C.muted});
  EX.forEach(([a, b], i) => {
    const runs = [...a.map((r, j) => ({text: r.text, options: {...(r.options || {}), breakLine: j === a.length - 1}})), ...b.map((r) => ({text: r.text, options: {...(r.options || {})}}))];
    Z.T(s, runs, {x: cx(i) - 0.88, y: fy + 0.42, w: 1.76, h: 0.8, fontSize: F.ex, color: C.text, align: "center", valign: "middle"});
  });
  // 凡例（UMLアクティビティ図の記号）
  const ly = 4.6;
  Z.T(s, "凡例", {x: 3.9, y: ly - 0.17, w: 0.6, h: 0.34, fontSize: F.sub, bold: true, color: C.muted, valign: "middle"});
  Z.point(s, 4.65, ly, "start"); Z.T(s, "開始", {x: 4.85, y: ly - 0.17, w: 0.7, h: 0.34, fontSize: F.sub, valign: "middle"});
  Z.point(s, 5.7, ly, "end"); Z.T(s, "終了", {x: 5.9, y: ly - 0.17, w: 0.7, h: 0.34, fontSize: F.sub, valign: "middle"});
  Z.decision(s, 6.75, ly, 0.3); Z.T(s, "分岐・合流（[ ]内は条件）", {x: 7.0, y: ly - 0.17, w: 2.85, h: 0.34, fontSize: F.sub, valign: "middle"});
  await Z.save(p, OUT);
})();
