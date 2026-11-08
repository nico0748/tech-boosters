// 図1：検索精度を上げる工夫の置き場所（インデックス作成／質問応答／評価の3レーン）
const {C, T, deck, lane, node, badge, arrow, save} = require("./ext.js");
const out = process.argv[2] || "01_検索精度を上げる工夫の置き場所.pptx";
(async () => {
  const p = deck(); const s = p.addSlide(); s.background = {color: C.white};
  const L1 = {y: 0.2, h: 2.1}, L2 = {y: 2.3, h: 2.35}, L3 = {y: 4.65, h: 2.05};
  await lane(s, L1.y, L1.h, "インデックス作成", "事前処理", C.teal, C.tealBg, "db");
  await lane(s, L2.y, L2.h, "質問応答", "クエリごとの処理", C.blue, C.blueBg, "chat", {plain: true});
  await lane(s, L3.y, L3.h, "評価", "オフライン", C.purple, C.purpleBg, "chart");
  const X = [3.5, 5.6, 7.7, 9.8, 11.9], W = 1.78, H = 1.35, K = {badge: "改善", badgeColor: C.orange, fill: C.orangeBg};
  const y1 = L1.y + L1.h / 2 + 0.05, y2 = L2.y + L2.h / 2 + 0.05, y3 = L3.y + L3.h / 2 + 0.05;

  const XA = [3.5, 6.3, 9.1, 11.9];
  const a1 = await node(s, XA[0], y1, W, H, "doc", "文書", "社内資料・仕様書", C.teal);
  const a2 = await node(s, XA[1], y1, W, H, "cut", "チャンク分割", "見出し・段落単位\nオーバーラップ", C.orange, K);
  const a3 = await node(s, XA[2], y1, W, H, "note", "文脈の付与", "文書名・節の要約を\nチャンク先頭に追加", C.orange, K);
  const a4 = await node(s, XA[3], y1, W, H, "db", "索引", "ベクトル索引\nBM25 索引", C.teal);
  arrow(s, [a1.r, a2.l]); arrow(s, [a2.r, a3.l]); arrow(s, [a3.r, a4.l]);

  const b1 = await node(s, X[0], y2, W, H, "user", "質問", "利用者の入力", C.blue);
  const b2 = await node(s, X[1], y2, W, H, "edit", "クエリ書き換え", "マルチクエリ\nHyDE", C.orange, K);
  const b3 = await node(s, X[2], y2, W, H, "merge", "ハイブリッド検索", "BM25＋ベクトル\nRRF で統合", C.orange, K);
  const b4 = await node(s, X[3], y2, W, H, "sort", "リランキング", "クロスエンコーダ\n例：150 件→20 件", C.orange, K);
  const b5 = await node(s, X[4], y2, W, H, "llm", "LLM", "上位 k 件から生成", C.blue);
  arrow(s, [b1.r, b2.l]); arrow(s, [b2.r, b3.l]);
  arrow(s, [b3.r, b4.l]); arrow(s, [b4.r, b5.l]);
  // 索引 → ハイブリッド検索（参照）
  const my = L2.y + 0.17;
  arrow(s, [a4.b, [XA[3], my], [X[2] - 0.4, my], [X[2] - 0.4, b3.t[1]]], "参照", {seg: 1, dash: true, w: 0.8, dy: -0.0});

  const c1 = await node(s, X[0], y3, W, 1.2, "data", "評価用データ", "質問・正解チャンク", C.purple);
  const c2 = await node(s, X[3], y3, W, 1.2, "chart", "検索の評価", "Recall@k・MRR\nnDCG@k", C.purple);
  const c3 = await node(s, X[4], y3, W, 1.2, "check", "生成の評価", "Faithfulness\nContext Recall 等", C.purple);
  arrow(s, [c1.r, c2.l], "正解チャンクと照合", {w: 2.0});
  arrow(s, [b4.b, c2.t], "上位 k 件", {dash: true, color: C.purple, w: 1.0});
  arrow(s, [b5.b, c3.t], "回答・根拠", {dash: true, color: C.purple, w: 1.1});

  const ly = 6.85;
  T(s, "凡例", {x: 0.3, y: ly, w: 0.6, h: 0.3, fontSize: 13, bold: true, color: C.muted, valign: "middle"});
  badge(s, 1.62, ly + 0.15, "改善", C.orange);
  T(s, "精度改善の適用箇所", {x: 1.72, y: ly, w: 3.2, h: 0.3, fontSize: 13, valign: "middle"});
  s.addShape("line", {x: 4.4, y: ly + 0.15, w: 0.6, h: 0, line: {color: C.arrow, width: 1.5, dashType: "dash", endArrowType: "triangle"}});
  T(s, "参照・評価への入力", {x: 5.1, y: ly, w: 2.5, h: 0.3, fontSize: 13, valign: "middle"});
  await save(p, out);
})();
