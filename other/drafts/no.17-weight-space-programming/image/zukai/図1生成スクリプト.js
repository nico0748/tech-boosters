// 図1：重み空間プログラミングの改善ループ（実験8 のハーネス）— アクティビティ図（スイムレーン）
// 問い：重みの編集は、誰が・何を・どの順で回して改善されていくのか
// 出典：github.com/RikiyaT/lm_understand-logs（exp8_math/runs/p50c/turns/t001/prompt.txt, state.json, exp8_math/README.md）
// 実行：node 図1生成スクリプト.js 01_重み空間プログラミングの全体像.pptx（同じフォルダに zukai.js、npm で pptxgenjs と react-icons ほかが必要）
const Z = require("./zukai.js");
const { C } = Z;
(async () => {
  const p = Z.article({ title: "重み空間プログラミングの改善ループ" });
  Object.assign(Z.FS, { label: 12, sub: 12, arrow: 12, box: 12 });   // 12pt 以上
  p.defineLayout({ name: "LOOP", width: 9.8, height: 6.6 }); p.layout = "LOOP";
  const s = Z.canvas(p);

  // ---- レーン（担当） ----
  const X0 = 0.2, HW = 1.5, LW = 9.4;
  const lanes = [
    { y: 0.2, h: 1.25, name: "GPT-6 Astra", sub: "Codex CLI・max" },
    { y: 1.45, h: 1.3, name: "ハーネス", sub: "実行・計数・引継" },
    { y: 2.75, h: 1.0, name: "Python カーネル", sub: "CPU・上限300回" },
    { y: 3.75, h: 1.0, name: "forward pass", sub: "予算50回" },
    { y: 4.75, h: 1.0, name: "実験者（評価）", sub: "Astra は見ない" },
  ];
  lanes.forEach((l, i) => {
    s.addShape("rect", { x: X0, y: l.y, w: LW, h: l.h, fill: { color: i % 2 ? "F8FBFF" : C.white }, line: { color: C.frameLine, width: 1 } });
    s.addShape("rect", { x: X0, y: l.y, w: HW, h: l.h, fill: { color: C.frame }, line: { color: C.frameLine, width: 1 } });
    Z.T(s, [{ text: l.name, options: { bold: true, fontSize: 13, color: C.title, breakLine: true } },
            { text: l.sub, options: { fontSize: 12, color: C.muted } }],
        { x: X0 + 0.05, y: l.y, w: HW - 0.1, h: l.h, align: "center", valign: "middle" });
  });
  const cy = [0.98, 2.1, 3.25, 4.25, 5.25];

  // ---- 部品 ----
  const act = (cx, y, w, title, detail) => Z.box(s, cx - w / 2, y - 0.31, w, 0.62,
    [{ text: title, options: { bold: true, breakLine: true } }, { text: detail, options: { bold: false, color: C.muted } }]);
  const dia = (cx, y, d = 0.42) => { Z.decision(s, cx, y, d); return { l: [cx - d / 2, y], r: [cx + d / 2, y], t: [cx, y - d / 2], b: [cx, y + d / 2] }; };
  const lab = (x, y, w, t, o = {}) => Z.T(s, t, { x, y, w, h: 0.28, fontSize: 12, color: o.color || C.title, align: o.align || "left", valign: "middle" });

  Z.point(s, 2.15, cy[0], "start");
  const m0 = dia(2.65, cy[0], 0.36);
  const a1 = act(4.2, cy[0], 1.75, "返信を書く", "説明＋コード0〜1個");
  const d1 = dia(4.2, cy[1]);
  const d2 = dia(2.65, cy[1]);
  const k = act(5.8, cy[2], 1.85, "重みを解析・編集する", "load()・save_edit()");
  const f = act(5.8, cy[3], 1.85, "モデルを実行する", "元／編集後／both");
  const m1 = dia(7.35, cy[1]);
  const h = act(8.45, cy[1], 1.4, "結果を返す", "出力＋実行回数");
  const e1 = act(4.0, cy[4], 1.8, "重みを差し替える", "bf16・/work/edited");
  const e2 = act(6.45, cy[4], 1.95, "ベンチマークで評価する", "MATH-500・GSM8K ほか");
  Z.point(s, 8.05, cy[4], "end");

  // ---- 制御フロー ----
  Z.arrow(s, [[2.28, cy[0]], m0.l]);
  Z.arrow(s, [m0.r, a1.l]);
  Z.arrow(s, [a1.b, d1.t]);
  // d1：コードの種類
  Z.arrow(s, [d1.r, [4.62, cy[1]], [4.62, cy[2]], k.l]);            // [python]
  lab(4.69, 2.42, 1.0, "[python]");
  Z.arrow(s, [d1.b, [4.2, cy[3]], f.l]);                         // [forward]
  lab(3.2, 3.0, 0.93, "[forward]", { align: "right" });
  Z.arrow(s, [d1.l, d2.r]);                                       // [コードなし]
  lab(2.86, 1.8, 1.13, "[コードなし]", { align: "center" });
  // d2：forward pass の残り
  Z.arrow(s, [d2.t, m0.b]);                                       // [残り > 0] → 次の返信へ
  lab(1.8, 1.52, 0.78, "[残り>0]", { align: "right" });
  Z.arrow(s, [d2.b, [2.65, cy[4]], e1.l]);                        // [残り = 0] → 提出・評価
  lab(2.72, 2.36, 0.8, "[残り=0]");
  // カーネル・forward → 合流 → 結果を返す → 次の返信へ
  Z.arrow(s, [k.r, [6.95, cy[2]], [6.95, cy[1]], m1.l]);
  Z.arrow(s, [f.r, [7.35, cy[3]], m1.b]);
  Z.arrow(s, [m1.r, h.l]);
  Z.arrow(s, [h.r, [9.35, cy[1]], [9.35, 0.42], [2.65, 0.42], m0.t]);
  // 評価
  Z.arrow(s, [e1.r, e2.l]);
  Z.arrow(s, [e2.r, [7.9, cy[4]]]);

  // ---- 凡例 ----
  const lx = 0.2, ly = 5.97, lw = 9.4, lh = 0.46, mid = ly + lh / 2;
  s.addShape("roundRect", { x: lx, y: ly, w: lw, h: lh, rectRadius: 0.08, fill: { color: C.white }, line: { color: C.grid, width: 0.75 } });
  Z.T(s, "凡例", { x: lx + 0.12, y: ly, w: 0.45, h: lh, fontSize: 12, bold: true, color: C.muted, valign: "middle" });
  Z.point(s, lx + 0.8, mid, "start"); Z.point(s, lx + 1.1, mid, "end");
  lab(lx + 1.3, mid - 0.14, 0.95, "開始／終了");
  Z.box(s, lx + 2.45, mid - 0.13, 0.42, 0.26, "");
  lab(lx + 2.93, mid - 0.14, 0.95, "アクション");
  Z.decision(s, lx + 4.15, mid, 0.28);
  lab(lx + 4.35, mid - 0.14, 0.95, "分岐／合流");
  Z.arrow(s, [[lx + 5.55, mid], [lx + 5.95, mid]]);
  lab(lx + 6.0, mid - 0.14, 0.45, "流れ");
  lab(lx + 6.7, mid - 0.14, 1.3, "[条件] ガード");

  await Z.save(p, process.argv[2]);
})();
