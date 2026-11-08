// 図1：正常な RAG の検索と、RAG-Pull ですり替えられた検索の比較
// 出典：Stambolic, Dhar, Cavigelli "RAG-Pull: Imperceptible Attacks on RAG Systems for Code Generation" arXiv:2510.11195
const {FS, C, T, deck, lane, node, badge, arrow, save} = require("./lib.js");
const out = process.argv[2] || "01_正常な検索とRAG-Pullの比較.pptx";
const P = (t) => ({text: t, options: {color: C.pink, bold: true}});
const M = (t) => ({text: t, options: {fontFace: "Menlo"}});

(async () => {
  const p = deck(); const s = p.addSlide(); s.background = {color: C.white};
  const L1 = {y: 0.15, h: 2.0}, L2 = {y: 2.15, h: 1.85}, L3 = {y: 4.0, h: 2.2};
  await lane(s, L1.y, L1.h, "正常な RAG", "無改変", C.blue, C.blueBg, "check");
  await lane(s, L2.y, L2.h, "攻撃者", "ブラックボックス\n観測対象：s のみ", C.red, C.redBg, "spy", {plain: true});
  await lane(s, L3.y, L3.h, "RAG-Pull", "q・D の一方\nまたは両方の改変", C.orange, C.orangeBg, "warn");

  const X = [3.38, 6.2, 9.03, 11.85], W = 1.9, H = 1.45;
  const y1 = L1.y + L1.h / 2, y2 = L2.y + L2.h / 2, y3 = L3.y + L3.h / 2 + 0.08;

  // 正常な RAG
  const a1 = await node(s, X[0], y1, W, H, "user", "クエリ q", "利用者の入力", C.blue);
  const a2 = await node(s, X[1], y1, W, H, "search", "Retriever", [{text: "E＋s による検索\n"}, {text: "r", options: {bold: true, color: C.blue}}, {text: " の上位 k 件入り"}], C.blue);
  const a3 = await node(s, X[2], y1, W, H, "llm", "LLM", "Codestral-22B", C.blue);
  const a4 = await node(s, X[3], y1, W, H, "code", "生成コード", "r 準拠のコード", C.blue);
  arrow(s, [a1.r, a2.l], "q", {w: 0.9});
  arrow(s, [a2.r, a3.l], "上位 k 件", {w: 1.0});
  arrow(s, [a3.r, a4.l], "応答", {w: 0.9});

  // 攻撃者
  const b1 = await node(s, X[0], y2, W, H, "web", "プロンプト加工", [P("q"), {text: " への\n不可視文字の挿入"}], C.red);
  const b2 = await node(s, X[1], y2, W, H, "repo", "公開リポジトリ", [{text: "悪性スニペット\n"}, P("δt"), {text: " の追加"}], C.red);

  // RAG-Pull
  const c1 = await node(s, X[0], y3, W, H, "user", [{text: "クエリ "}, P("δq")], "表示上 q と同一", C.orange, {badge: "改変"});
  const c2 = await node(s, X[1], y3, W, H, "search", "Retriever", [{text: "E・s：無改変\n"}, P("δt"), {text: " の上位 k 件入り"}], C.orange);
  const c3 = await node(s, X[2], y3, W, H, "llm", "LLM", "Codestral-22B\n無改変", C.orange);
  const c4 = await node(s, X[3], y3, W, H, "code", "生成コード", [{text: "悪性ペイロード\n例："}, M("curl … | sh")], C.red, {fill: C.redBg, bold: true});
  arrow(s, [c1.r, c2.l], [P("δq")], {w: 0.9});
  arrow(s, [c2.r, c3.l], "上位 k 件", {w: 1.0});
  arrow(s, [c3.r, c4.l], "応答", {w: 0.9});

  arrow(s, [b1.b, c1.t], [{text: "改変クエリ "}, P("δq")], {color: C.red, w: 1.9, dy: 0.05});
  arrow(s, [b2.b, c2.t], [{text: "D′ = D ∪ {"}, P("δt"), {text: "}"}], {color: C.red, w: 1.9, dy: 0.05});

  // 凡例（下端に2段：1段目＝記号、2段目＝色・バッジ）
  const lx = 0.3, r1 = 6.36, r2 = 6.8, LH = 0.36, f = {fontSize: FS.legend, valign: "middle", color: C.text};
  T(s, "凡例", {...f, x: lx, y: r1, w: 0.7, h: LH, bold: true, color: C.muted});
  T(s, [P("δq"), {text: "・"}, P("δt"), {text: "：不可視 Unicode 文字の挿入済み文字列　　q：改変前のクエリ　　D：コーパス"}], {...f, x: 1.05, y: r1, w: 9.2, h: LH});
  badge(s, 11.2, r1 + LH / 2, "改変", C.orange);
  T(s, "攻撃者の改変箇所", {...f, x: 11.28, y: r1, w: 1.75, h: LH});
  T(s, "r：D 内で q に最も近い正規スニペット　　E：埋め込みモデル　　s：コサイン類似度", {...f, x: 1.05, y: r2, w: 9.2, h: LH});
  s.addShape("rect", {x: 10.66, y: r2 + 0.08, w: 0.5, h: 0.2, fill: {color: C.redBg}, line: {color: C.red, width: 1.5}});
  T(s, "赤：攻撃者由来", {...f, x: 11.28, y: r2, w: 1.75, h: LH});
  await save(p, out);
})();
