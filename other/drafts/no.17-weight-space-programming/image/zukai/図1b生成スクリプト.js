// 図1b：実験8（50パス版 p50c）の実際の流れ — 図1と同じレーンに、実際に動いた手順をフェーズ順に並べた実行トレース
// 出典：github.com/RikiyaT/lm_understand-logs exp8_math/runs/p50c（driver.log, tool_calls.jsonl, requests/fwd_*.done.json, work_notes/notes.md）
// 実行：node 図1b生成スクリプト.js 01b_実験8の実際の流れ.pptx（同じフォルダに zukai.js）
const Z = require("./zukai.js");
const { C } = Z;
(async () => {
  const p = Z.article({ title: "実験8の実際の流れ" });
  Object.assign(Z.FS, { label: 12, sub: 12, arrow: 12, box: 12 });
  const COLS = [1.52, 1.58, 1.8, 1.52, 1.45, 1.62];            // 列＝フェーズ（左から時間順）
  const X0 = 0.2, HW = 1.2, LW = HW + COLS.reduce((a, b) => a + b, 0);
  p.defineLayout({ name: "TRACE", width: LW + 0.4, height: 5.55 }); p.layout = "TRACE";
  const s = Z.canvas(p);
  const left = [X0 + HW]; COLS.forEach((w, i) => left.push(left[i] + w));
  const colX = i => left[i] + COLS[i] / 2;
  const BWc = i => COLS[i] - 0.24, BH = 0.62;
  const TRACE = { color: "8A94A6", width: 1.25 };            // 実行順（抜粋）の矢印

  // ---- 見出し行：フェーズ番号とターン範囲 ----
  const HY = 0.2, HH = 0.42;
  s.addShape("rect", { x: X0, y: HY, w: HW, h: HH, fill: { color: C.white }, line: { color: C.frameLine, width: 1 } });
  Z.T(s, "ターン →", { x: X0, y: HY, w: HW, h: HH, fontSize: 12, color: C.muted, align: "center", valign: "middle" });
  ["① t1–2", "② t3–9", "③ t10–99", "④ t100–115", "⑤ t116–157", "⑥ t158"].forEach((t, i) => {
    s.addShape("rect", { x: left[i], y: HY, w: COLS[i], h: HH, fill: { color: C.frame }, line: { color: C.frameLine, width: 1 } });
    Z.T(s, t, { x: left[i], y: HY, w: COLS[i], h: HH, fontSize: 12, bold: true, color: C.title, align: "center", valign: "middle" });
  });
  // ---- レーン（図1と同じ担当） ----
  const lanes = [
    { h: 0.8, name: "GPT-6 Astra", sub: "問い" },
    { h: 0.62, name: "ハーネス", sub: "使ったパス" },
    { h: 0.9, name: "Python\nカーネル" },
    { h: 0.9, name: "forward pass" },
    { h: 0.9, name: "実験者", sub: "評価・実行後" },
  ];
  let y = HY + HH;
  lanes.forEach((l, i) => {
    l.y = y; l.cy = y + l.h / 2; y += l.h;
    s.addShape("rect", { x: X0, y: l.y, w: LW, h: l.h, fill: { color: i % 2 ? "F8FBFF" : C.white }, line: { color: C.frameLine, width: 1 } });
    s.addShape("rect", { x: X0, y: l.y, w: HW, h: l.h, fill: { color: C.frame }, line: { color: C.frameLine, width: 1 } });
    const nm = l.name.split("\n");
    const t = nm.map((n, j) => ({ text: n, options: { bold: true, fontSize: 13, color: C.title, breakLine: j < nm.length - 1 || !!l.sub } }));
    if (l.sub) t.push({ text: l.sub, options: { fontSize: 12, color: C.muted } });
    Z.T(s, t, { x: X0 + 0.04, y: l.y, w: HW - 0.08, h: l.h, align: "center", valign: "middle" });
  });
  const BOT = y;
  for (let i = 1; i < 6; i++) s.addShape("line", { x: left[i], y: HY + HH, w: 0, h: BOT - HY - HH, line: { color: C.frameLine, width: 0.75, dashType: "dash" } });
  const [AS, HN, KN, FW, EV] = lanes;

  // ---- 部品 ----
  const chip = (i, l, t, o = {}) => {
    const w = COLS[i] - 0.12, cx = colX(i);
    s.addShape("roundRect", { x: cx - w / 2, y: l.cy - 0.17, w, h: 0.34, rectRadius: 0.17,
      fill: { color: o.fill || C.white }, line: { color: C.frameLine, width: 1 } });
    Z.T(s, t, { x: cx - w / 2, y: l.cy - 0.17, w, h: 0.34, fontSize: 12, color: C.title, align: "center", valign: "middle" });
  };
  const act = (i, l, title, detail, o = {}) => {
    const w = o.w || BWc(i), cx = colX(i) + (o.dx || 0);
    const txt = [{ text: title, options: { bold: true, breakLine: !!detail } }];
    if (detail) txt.push({ text: detail, options: { bold: false, color: C.muted } });
    Z.box(s, cx - w / 2, l.cy - BH / 2, w, BH, txt);
    return { l: [cx - w / 2, l.cy], r: [cx + w / 2, l.cy], t: [cx, l.cy - BH / 2], b: [cx, l.cy + BH / 2] };
  };
  const A = pts => Z.arrow(s, pts, null, TRACE);

  // Astra が各フェーズで確かめた問い／ハーネスが数えたパス（失敗した依頼は数えない）
  ["失敗の型は？", "ループの原因は？", "どこを・どれだけ？", "もっと絞れるか？", "汎化するか？"].forEach((t, i) => chip(i, AS, t));
  ["パス 1", "パス 2–3", "パス 4–26", "パス 27–32", "パス 33–50"].forEach((t, i) => chip(i, HN, t, { fill: C.frame }));

  // 実際に動いた手順
  const k1 = act(0, KN, "問題を選ぶ", "練習問題96問");
  const f1 = act(0, FW, "元モデルで生成", "打切り85／96");
  const f2 = act(1, FW, "教師強制で比較", "正常4・ループ4");
  const k2 = act(1, KN, "方向 u を計算", "ループ − 正常");
  const k3 = act(2, KN, "u 成分を引く", "15・19層 MLP");
  const f3 = act(2, FW, "用量反応・対照", "乱数方向は +1.6pt");
  const k4 = act(3, KN, "64列・α=6", "ここで凍結");
  const f4 = act(3, FW, "既出64問で検証", "both +43.8pt");
  const f5 = act(4, FW, "未使用1,152問", "10.6%→60.4%");
  const k5 = act(4, KN, "最終集計", "");
  // 終了：図1の「返信を書く」→[コードなし]→パス残数の分岐→[残り=0]
  const a6 = act(5, AS, "返信を書く", "コードなし", { w: 1.12 });
  const dx6 = colX(5), dy6 = HN.cy, dd = 0.4;
  Z.decision(s, dx6, dy6, dd);
  const e6 = act(5, EV, "MATH-500", "7.9%→48.1%", { w: 1.08, dx: -0.24 });
  const endX = colX(5) + 0.58;
  Z.point(s, endX, EV.cy, "end");

  // ---- 実行順（抜粋）：各矢印の間で図1のループを1周以上している ----
  A([k1.b, f1.t]);
  A([f1.r, f2.l]);
  A([f2.t, k2.b]);
  A([k2.r, k3.l]);
  A([k3.b, f3.t]);
  A([f3.r, [left[3] - 0.06, FW.cy], [left[3] - 0.06, KN.cy], k4.l]);
  A([k4.b, f4.t]);
  A([f4.r, f5.l]);
  A([f5.t, k5.b]);
  A([k5.r, [left[5] + 0.1, KN.cy], [left[5] + 0.1, AS.cy], a6.l]);
  A([a6.b, [dx6, dy6 - dd / 2]]);
  A([[dx6, dy6 + dd / 2], [dx6, EV.cy - BH / 2]]);
  Z.T(s, "[残り=0]", { x: dx6 + 0.06, y: dy6 + dd / 2 + 0.1, w: 0.8, h: 0.28, fontSize: 12, color: C.title, valign: "middle" });
  A([e6.r, [endX - 0.14, EV.cy]]);

  // ---- 凡例 ----
  const ly = BOT + 0.14, lh = 0.42, mid = ly + lh / 2, lx = X0;
  s.addShape("roundRect", { x: lx, y: ly, w: LW, h: lh, rectRadius: 0.08, fill: { color: C.white }, line: { color: C.grid, width: 0.75 } });
  Z.T(s, "凡例", { x: lx + 0.12, y: ly, w: 0.45, h: lh, fontSize: 12, bold: true, color: C.muted, valign: "middle" });
  const lab = (x, t, w) => Z.T(s, t, { x, y: mid - 0.14, w, h: 0.28, fontSize: 12, color: C.title, valign: "middle" });
  Z.box(s, lx + 0.75, mid - 0.13, 0.42, 0.26, ""); lab(lx + 1.23, "実際の手順", 1.0);
  s.addShape("roundRect", { x: lx + 2.4, y: mid - 0.12, w: 0.42, h: 0.24, rectRadius: 0.12, fill: { color: C.white }, line: { color: C.frameLine, width: 1 } });
  lab(lx + 2.88, "問い・状態", 1.0);
  Z.decision(s, lx + 4.17, mid, 0.28); lab(lx + 4.37, "分岐", 0.5);
  Z.arrow(s, [[lx + 5.05, mid], [lx + 5.45, mid]], null, TRACE); lab(lx + 5.5, "実行順（抜粋）", 1.3);
  Z.point(s, lx + 7.05, mid, "end"); lab(lx + 7.25, "終了", 0.5);

  await Z.save(p, process.argv[2]);
})();
