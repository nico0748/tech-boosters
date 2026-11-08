// 図2：守る側から見た対策の置き場所（論文 arXiv:2510.11195 の Discussion で挙げられた対策と、評価で確認された限界）
const {FS, C, T, deck, lane, node, badge, arrow, save} = require("./lib.js");
const out = process.argv[2] || "02_RAG-Pullへの対策の置き場所.pptx";

(async () => {
  const p = deck(); const s = p.addSlide(); s.background = {color: C.white};
  const L1 = {y: 0.3, h: 2.05}, L2 = {y: 2.35, h: 2.05}, L3 = {y: 4.4, h: 2.05};
  await lane(s, L1.y, L1.h, "コーパス", "D の取り込み", C.blue, C.blueBg, "repo");
  await lane(s, L2.y, L2.h, "検索・生成", "Retriever＋LLM", C.slate, "EEF1F4", "search", {plain: true});
  await lane(s, L3.y, L3.h, "クエリ", "利用者の入力 q", C.blue, C.blueBg, "user");

  // 列：除去／Retriever／LLM／静的解析（最後の列だけ幅広）
  const W = 1.9, W3 = 2.2, G = 0.91, x0 = 2.3;
  const W0 = 2.5;  // 除去ノードは副作用の注記と同じ幅・同じ中心線
  const X = [x0 + W0 / 2, x0 + W * 1.5 + G, x0 + W * 2.5 + G * 2, x0 + W * 3 + G * 3 + W3 / 2];
  const H = 1.45, y1 = L1.y + L1.h / 2, y2 = L2.y + L2.h / 2, y3 = L3.y + L3.h / 2;

  const a = await node(s, X[0], y1, W0, H, "filter", "不可視文字除去", "トークナイザ前段", C.green, {badge: "対策"});
  const c = await node(s, X[0], y3, W0, H, "filter", "不可視文字除去", "トークナイザ前段", C.green, {badge: "対策"});
  const r = await node(s, X[1], y2, W, H, "search", "Retriever", "不可視文字→[UNK]\nE の頑健化学習", C.green, {badge: "対策"});
  const l = await node(s, X[2], y2, W, H, "llm", "LLM", "Codestral-22B", C.slate);
  const z = await node(s, X[3], y2, W3, H, "bug", "静的解析", "Bandit・FindSecBugs\n見逃し・LOW 判定", C.orange, {badge: "限界"});

  arrow(s, [a.r, [X[1], y1], r.t], "除去後の D", {seg: 0, w: 1.6});
  arrow(s, [c.r, [X[1], y3], r.b], "除去後の q", {seg: 0, w: 1.6});
  arrow(s, [r.r, l.l], "上位 k 件", {w: 1.0});
  arrow(s, [l.r, z.l], "コード", {w: 0.9});

  // 除去の副作用（中段の左。上下の除去ノードから破線）
  const nw = 2.5, nh = 1.2, nx = x0, ny = y2 - nh / 2;
  s.addShape("roundRect", {x: nx, y: ny, w: nw, h: nh, rectRadius: 0.1, fill: {color: C.orangeBg}, line: {color: C.orange, width: 1.5}});
  T(s, [{text: "除去の副作用", options: {bold: true, fontSize: FS.title, color: C.navy, breakLine: true}},
    {text: "正規用途の破損\n異体字セレクタ・ZWJ", options: {fontSize: FS.desc, color: C.muted}}],
    {x: nx + 0.06, y: ny + 0.16, w: nw - 0.12, h: nh - 0.2, align: "center", valign: "middle", lineSpacingMultiple: 0.95});
  badge(s, nx + nw - 0.1, ny, "限界", C.orange);
  arrow(s, [[X[0], a.b[1]], [X[0], ny]], null, {color: C.orange, dash: true});
  arrow(s, [[X[0], c.t[1]], [X[0], ny + nh]], null, {color: C.orange, dash: true});

  // 凡例（1段）
  const ly = 6.6, LH = 0.36, f = {fontSize: FS.legend, valign: "middle", color: C.text};
  T(s, "凡例", {...f, x: 0.3, y: ly, w: 0.7, h: LH, bold: true, color: C.muted});
  badge(s, 1.65, ly + LH / 2, "対策", C.green);
  T(s, "論文が挙げる対策（緑枠）", {...f, x: 1.75, y: ly, w: 2.9, h: LH});
  badge(s, 5.25, ly + LH / 2, "限界", C.orange);
  T(s, "論文が指摘する限界・副作用（橙枠）", {...f, x: 5.35, y: ly, w: 4.0, h: LH});
  s.addShape("line", {x: 9.45, y: ly + LH / 2, w: 0.45, h: 0, line: {color: C.orange, width: 1.5, dashType: "dash", endArrowType: "triangle"}});
  T(s, "副作用の発生元", {...f, x: 10.0, y: ly, w: 1.6, h: LH});
  s.addShape("roundRect", {x: 11.55, y: ly + 0.07, w: 0.36, h: 0.22, rectRadius: 0.04, fill: {color: C.white}, line: {color: C.slate, width: 1.5}});
  T(s, "対策なし", {...f, x: 12.0, y: ly, w: 1.1, h: LH});
  await save(p, out);
})();
