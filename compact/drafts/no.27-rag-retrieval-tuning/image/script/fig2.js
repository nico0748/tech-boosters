// 図2：RRF で BM25 とベクトル検索の結果をまとめる計算例（k = 60）
const {C, T, deck, icon, arrow, save, pill, memo} = require("./ext.js");
const out = process.argv[2] || "02_RRFで2つの検索結果をまとめる.pptx";
const M = (t, o = {}) => ({text: t, options: {fontFace: "Menlo", ...o}});
(async () => {
  const p = deck(); const s = p.addSlide(); s.background = {color: C.white};
  async function list(y, col, bg, ic, name, sub, rows, unit) {
    const x = 0.3, w = 4.1, h = 3.05;
    s.addShape("roundRect", {x, y, w, h, rectRadius: 0.08, fill: {color: bg}, line: {color: col, width: 1.5}});
    s.addShape("rect", {x, y: y + 0.08, w: 0.09, h: h - 0.16, fill: {color: col}, line: {type: "none"}});
    s.addImage({data: await icon(ic, col), x: x + 0.25, y: y + 0.2, w: 0.36, h: 0.36});
    T(s, name, {x: x + 0.7, y: y + 0.2, w: 3.3, h: 0.36, fontSize: 15, bold: true, color: col, valign: "middle"});
    T(s, sub, {x: x + 0.7, y: y + 0.58, w: 3.3, h: 0.3, fontSize: 13, color: C.muted});
    T(s, "順位", {x: x + 0.3, y: y + 0.98, w: 0.8, h: 0.28, fontSize: 13, color: C.muted, align: "center"});
    T(s, "文書", {x: x + 1.3, y: y + 0.98, w: 1.2, h: 0.28, fontSize: 13, color: C.muted, align: "center"});
    T(s, unit, {x: x + 2.6, y: y + 0.98, w: 1.3, h: 0.28, fontSize: 13, color: C.muted, align: "center"});
    rows.forEach(([d, sc], i) => {
      const cy = y + 1.5 + i * 0.5;
      pill(s, x + 0.7, cy, 0.7, 0.4, `${i + 1} 位`, col, {fs: 13, b: true, color: col});
      pill(s, x + 1.9, cy, 1.1, 0.4, `文書 ${d}`, C.grid, {fs: 13, b: true});
      T(s, [M(sc)], {x: x + 2.6, y: cy - 0.2, w: 1.3, h: 0.4, fontSize: 14, align: "center", valign: "middle", color: C.text});
    });
    return [x + w, y + h / 2];
  }
  const e1 = await list(0.35, C.teal, C.tealBg, "search", "BM25（キーワード検索）", "範囲：多くの実装で 0 以上・上限なし", [["A", "12.4"], ["C", "9.8"], ["D", "7.1"]], "BM25 スコア");
  const e2 = await list(3.75, C.blue, C.blueBg, "embed", "ベクトル検索", "範囲：−1〜1", [["B", "0.82"], ["A", "0.79"], ["C", "0.74"]], "コサイン類似度");

  // 式
  const tx = 6.05, tw = 7.0;
  T(s, [M("RRF(d) = Σ_r 1 / (k + rank_r(d))", {bold: true}), {text: "　k = 60、未出現のリストは加算なし", options: {fontSize: 13, color: C.muted}}],
    {x: tx, y: 1.45, w: tw, h: 0.4, fontSize: 14, color: C.navy, valign: "middle"});
  // 表
  const H = {bold: true, color: C.white, fill: {color: C.slate}, align: "center", fontSize: 14};
  const c = (t, o = {}) => ({text: t, options: {align: "center", fontSize: 14, color: C.text, ...o}});
  const hl = {fill: {color: C.orangeBg}};
  const rows = [
    [{text: "文書", options: H}, {text: "BM25 順位", options: H}, {text: "ベクトル順位", options: H}, {text: "計算", options: H}, {text: "RRF", options: H}, {text: "統合順位", options: H}],
    [c("A", {bold: true}), c("1"), c("2"), c("1/61 + 1/62", {fontFace: "Menlo"}), c("0.0325", {fontFace: "Menlo"}), c("1", {bold: true})],
    [c("C", {bold: true, ...hl}), c("2", hl), c("3", hl), c("1/62 + 1/63", {fontFace: "Menlo", ...hl}), c("0.0320", {fontFace: "Menlo", ...hl}), c("2", {bold: true, color: C.orange, ...hl})],
    [c("B", {bold: true}), c("—", {color: C.muted}), c("1"), c("1/61", {fontFace: "Menlo"}), c("0.0164", {fontFace: "Menlo"}), c("3", {bold: true})],
    [c("D", {bold: true}), c("3"), c("—", {color: C.muted}), c("1/63", {fontFace: "Menlo"}), c("0.0159", {fontFace: "Menlo"}), c("4", {bold: true})],
  ];
  s.addTable(rows, {x: tx, y: 2.2, w: tw, colW: [0.8, 1.15, 1.3, 1.8, 0.95, 1.0], rowH: 0.55, fontFace: "Helvetica Neue",
    border: {type: "solid", color: C.grid, pt: 0.75}, valign: "middle", margin: 0.04});
  arrow(s, [e1, [4.75, e1[1]], [4.75, 3.6], [tx, 3.6]], "順位のみ使用", {seg: 2, w: 1.3});
  arrow(s, [e2, [4.75, e2[1]], [4.75, 3.6]], null, {noHead: true});
  memo(s, tx, 5.35, tw, 0.75, [{text: "両方で 2〜3 位の C ＞ 片方だけ 1 位の B", options: {bold: true, fontSize: 14}},
    {text: "スコアのスケール差を順位化で吸収", options: {breakLine: false}}].map((r, i) => (i === 0 ? {...r, options: {...r.options, breakLine: true}} : r)));
  await save(p, out);
})();
