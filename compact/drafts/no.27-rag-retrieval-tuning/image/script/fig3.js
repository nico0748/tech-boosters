// 図3：検索のバイエンコーダとリランキングのクロスエンコーダ、2段構えの検索
const {C, T, deck, lane, node, badge, arrow, save, pill, memo} = require("./ext.js");
const out = process.argv[2] || "03_バイエンコーダとクロスエンコーダ.pptx";
const M = (t, o = {}) => ({text: t, options: {fontFace: "Menlo", ...o}});
(async () => {
  const p = deck(); const s = p.addSlide(); s.background = {color: C.white};
  const L1 = {y: 0.2, h: 2.45}, L2 = {y: 2.65, h: 2.0}, L3 = {y: 4.65, h: 2.05};
  await lane(s, L1.y, L1.h, "バイエンコーダ", "検索で使用", C.blue, C.blueBg, "embed");
  await lane(s, L2.y, L2.h, "クロスエンコーダ", "リランキングで使用", C.orange, C.orangeBg, "sort", {plain: true});
  await lane(s, L3.y, L3.h, "2段構え", "検索→リランキング", C.teal, C.tealBg, "merge");

  // L1：q と d を別々に符号化
  const c1 = L1.y + L1.h / 2, dy = 0.55;
  const q = pill(s, 3.3, c1 - dy, 1.4, 0.5, [M("質問 q")], C.blue, {b: true});
  const d = pill(s, 3.3, c1 + dy, 1.4, 0.5, [M("文書 d")], C.blue, {b: true});
  const eq = pill(s, 5.6, c1 - dy, 1.7, 0.5, "エンコーダ E", C.blue);
  const ed = pill(s, 5.6, c1 + dy, 1.7, 0.5, "エンコーダ E", C.blue);
  T(s, "重み共有（一般的構成）", {x: 4.5, y: c1 - 0.15, w: 2.2, h: 0.3, fontSize: 13, color: C.muted, align: "center", valign: "middle"});
  const vq = pill(s, 7.85, c1 - dy, 1.7, 0.5, [M("E(q)")], C.blue);
  const vd = pill(s, 7.85, c1 + dy, 1.7, 0.5, [M("E(d)")], C.blue, {fill: C.blueBg, dash: true});
  const cs = await node(s, 9.95, c1, 1.85, 1.3, "angle", "コサイン類似度", [M("cos(E(q), E(d))")], C.blue);
  arrow(s, [q.r, eq.l]); arrow(s, [d.r, ed.l]); arrow(s, [eq.r, vq.l]); arrow(s, [ed.r, vd.l]);
  arrow(s, [vq.r, [8.85, vq.r[1]], [8.85, c1 - 0.2], [cs.l[0], c1 - 0.2]]);
  arrow(s, [vd.r, [8.85, vd.r[1]], [8.85, c1 + 0.2], [cs.l[0], c1 + 0.2]]);
  T(s, "事前計算・索引に格納", {x: 6.75, y: c1 + dy + 0.3, w: 2.2, h: 0.3, fontSize: 13, color: C.blue, align: "center"});
  const sc1 = pill(s, 12.05, c1, 1.45, 0.5, "類似度スコア", C.blue, {b: true});
  arrow(s, [cs.r, sc1.l]);

  // L2：q と d を連結して1回で採点
  const c2 = L2.y + L2.h / 2;
  const inp = pill(s, 4.1, c2, 3.1, 0.55, [M("[CLS] q [SEP] d [SEP]")], C.orange, {b: true, fs: 13});
  T(s, "q と d を連結した1入力", {x: 2.55, y: c2 + 0.35, w: 3.1, h: 0.3, fontSize: 13, color: C.muted, align: "center"});
  const ce = await node(s, 7.9, c2, 2.8, 1.35, "llm", "クロスエンコーダ", "全層で q・d 間の Attention", C.orange, {fill: C.orangeBg});
  const sc2 = pill(s, 11.45, c2, 2.0, 0.5, "関連度スコア", C.orange, {b: true});
  T(s, "候補ごとに推論（事前計算不可）", {x: 9.85, y: c2 + 0.35, w: 3.2, h: 0.3, fontSize: 13, color: C.orange, align: "center"});
  arrow(s, [inp.r, ce.l]); arrow(s, [ce.r, sc2.l]);

  // L3：2段構え
  const c3 = L3.y + L3.h / 2 + 0.3, X = [3.2, 6.3, 9.2, 11.05, 12.35];
  const sub = (a, b) => [{text: a, options: {bold: true, breakLine: true}}, {text: b, options: {fontSize: 13, color: C.muted}}];
  const s1 = pill(s, X[0], c3, 1.5, 0.75, sub("全チャンク", "数百万件"), C.teal);
  const s2 = pill(s, X[1], c3, 1.6, 0.75, sub("候補", "例：上位 150 件"), C.teal);
  const s3 = pill(s, X[2], c3, 1.6, 0.75, sub("絞り込み後", "例：上位 20 件"), C.teal);
  const s4 = pill(s, X[3], c3, 1.2, 0.75, [{text: "プロンプト", options: {bold: true}}], C.teal);
  const s5 = pill(s, X[4], c3, 0.9, 0.75, [{text: "LLM", options: {bold: true}}], C.slate, {fill: C.slate, color: C.white});
  const lab = (a, b, name, col, note) => { arrow(s, [a.r, b.l]);
    T(s, [{text: name, options: {bold: true, color: col, breakLine: true}}, {text: note, options: {color: C.muted}}],
      {x: a.r[0] - 0.25, y: c3 - 1.05, w: b.l[0] - a.r[0] + 0.5, h: 0.62, fontSize: 13, align: "center", valign: "bottom"}); };
  lab(s1, s2, "ハイブリッド検索", C.blue, "BM25＋ベクトル");
  lab(s2, s3, "クロスエンコーダ", C.orange, "低速・高精度");
  arrow(s, [s3.r, s4.l]); arrow(s, [s4.r, s5.l]);
  await save(p, out);
})();
