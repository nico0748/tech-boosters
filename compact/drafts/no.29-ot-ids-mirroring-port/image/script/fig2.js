// 図2：SPAN と TAP の複製のしかたの違い
const {C, T, deck, lane, node, badge, arrow, save} = require("./lib.js");
const out = process.argv[2] || "02_SPANとTAPの違い.pptx";
const M = C.orange, SYM = "DejaVu Sans";
const NG = (t) => ["✘", t], OK = (t) => ["✔", t];
const note = (s, x, y, [g, t], col) => {
  T(s, g, {x, y, w: 0.3, h: 0.32, fontSize: 14, bold: true, color: col, fontFace: SYM, valign: "middle"});
  T(s, t, {x: x + 0.3, y, w: 3.4, h: 0.32, fontSize: 14, color: col, valign: "middle"});
};
const AR = (str) => str.split("→").flatMap((p, i) => i ? [{text: "→", options: {fontFace: SYM}}, {text: p}] : [{text: p}]);
(async () => {
  const p = deck(); const s = p.addSlide(); s.background = {color: C.white};
  const A = {y: 0.2, h: 3.55}, B = {y: 3.75, h: 3.55};
  await lane(s, A.y, A.h, "SPAN", "スイッチで複製", C.teal, C.tealBg, "sw");
  await lane(s, B.y, B.h, "TAP", "回線上で分岐", C.purple, C.purpleBg, "tap", {plain: true});
  const X = [3.2, 5.95, 8.7, 11.45], W = 2.0, H = 1.3;
  const N = {noHead: true, width: 1.75}, D = {dash: true, color: M, width: 2};
  const NX = 2.25; // 注記の左端

  // SPAN
  const ya = A.y + 1.0, yA = A.y + 2.7;
  const a1 = await node(s, X[0], ya, W, H, "hmi", "機器 X", "例：HMI", C.teal);
  const a2 = await node(s, X[1], ya, W, H, "sw", "スイッチ", "スイッチ内で複製\n（低優先度）", C.teal);
  const a3 = await node(s, X[2], ya, W, H, "plc", "機器 Y", "例：PLC", C.teal);
  const a4 = await node(s, X[3], yA, W, 1.2, "sensor", "OT-IDS センサー", "監視 IF × 1", M, {fill: C.orangeBg, bold: true});
  arrow(s, [a1.r, a2.l], null, N);
  arrow(s, [a2.r, a3.l], null, N);
  arrow(s, [a2.b, [X[1], yA], a4.l], null, D);
  T(s, AR("ミラーポート 1 本に X→Y・Y→X を合流"), {x: X[1] + 0.2, y: yA - 0.38, w: 4.0, h: 0.32, fontSize: 14, color: M, valign: "bottom"});
  note(s, NX, A.y + 2.15, NG("送受信合計 > ミラーポート帯域で破棄"), C.red);
  note(s, NX, A.y + 2.55, NG("CRC エラーフレームは通常破棄"), C.red);

  // TAP
  const yb = B.y + 1.0, yc = B.y + 2.6;
  const b1 = await node(s, X[0], yb, W, H, "hmi", "機器 X", "例：HMI", C.purple);
  const b2 = await node(s, X[1], yb, W, H, "tap", "TAP", "光：無電源で分岐\n銅線：電源断で瞬断", C.purple);
  const b3 = await node(s, X[2], yb, W, H, "plc", "機器 Y", "例：PLC", C.purple);
  const b4 = await node(s, X[3], yc, W, 1.2, "sensor", "OT-IDS センサー", "監視 IF × 2", M, {fill: C.orangeBg, bold: true});
  arrow(s, [b1.r, b2.l], null, N);
  arrow(s, [b2.r, b3.l], null, N);
  const y1 = yc - 0.3, y2 = yc + 0.3;
  arrow(s, [[X[1] + 0.3, b2.b[1]], [X[1] + 0.3, y1], [b4.x, y1]], null, D);
  arrow(s, [[X[1] - 0.3, b2.b[1]], [X[1] - 0.3, y2], [b4.x, y2]], null, D);
  T(s, AR("出力 1：X→Y の複製"), {x: X[1] + 0.45, y: y1 - 0.34, w: 2.8, h: 0.3, fontSize: 14, color: M, valign: "bottom"});
  T(s, AR("出力 2：Y→X の複製"), {x: X[1] + 0.45, y: y2 - 0.34, w: 2.8, h: 0.3, fontSize: 14, color: M, valign: "bottom"});
  note(s, NX, B.y + 1.95, OK("CRC エラーフレームも複製"), C.green);
  note(s, NX, B.y + 2.35, OK("非集約 TAP は帯域超過なし"), C.green);
  note(s, NX, B.y + 2.75, NG("集約 TAP は出力で帯域超過あり"), C.red);
  await save(p, out);
})();
