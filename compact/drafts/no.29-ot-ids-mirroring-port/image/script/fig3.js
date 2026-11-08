// 図3：SPAN・RSPAN・ERSPAN の届く範囲
const {C, T, deck, lane, node, badge, arrow, save} = require("./lib.js");
const out = process.argv[2] || "03_SPAN・RSPAN・ERSPANの届く範囲.pptx";
const M = C.orange;
(async () => {
  const p = deck(); const s = p.addSlide(); s.background = {color: C.white};
  const L = [{y: 0.15, h: 2.25}, {y: 2.4, h: 2.25}, {y: 4.65, h: 2.25}];
  await lane(s, L[0].y, L[0].h, "SPAN", "同一スイッチ\n（スタック含む）", C.teal, C.tealBg, "sw");
  await lane(s, L[1].y, L[1].h, "RSPAN", "複数スイッチ（L2）", C.blue, C.blueBg, "lan", {plain: true});
  await lane(s, L[2].y, L[2].h, "ERSPAN", "L3 越え（GRE）", C.purple, C.purpleBg, "router");
  const X = [3.2, 5.95, 8.7, 11.45], W = 2.0, H = 1.3, D = {dash: true, color: M, width: 2};
  const cy = (l) => l.y + l.h / 2 + 0.05;
  const sen = (y) => node(s, X[3], y, W, H, "sensor", "OT-IDS センサー", "監視 IF", M, {fill: C.orangeBg, bold: true});

  // SPAN
  let y = cy(L[0]);
  const s1 = await node(s, X[0], y, W, H, "plc", "監視対象の機器", "PLC・HMI など", C.teal);
  const s2 = await node(s, X[1], y, W, H, "sw", "スイッチ", "送信元 → 宛先ポート", C.teal);
  const s4 = await sen(y);
  arrow(s, [s1.r, s2.l], null, {noHead: true, width: 1.75});
  arrow(s, [s2.r, s4.l], "宛先ポートから出力", {...D, w: 2.6});

  // RSPAN
  y = cy(L[1]);
  const r1 = await node(s, X[0], y, W, H, "sw", "スイッチ 1", "送信元ポート\n（監視対象）", C.blue);
  const r2 = await node(s, X[1], y, W, H, "sw", "スイッチ 2", "RSPAN VLAN で中継", C.blue);
  const r3 = await node(s, X[2], y, W, H, "sw", "スイッチ 3", "宛先ポート", C.blue);
  const r4 = await sen(y);
  arrow(s, [r1.r, r2.l], "RSPAN", {...D, w: 0.8});
  arrow(s, [r2.r, r3.l], "RSPAN", {...D, w: 0.8});
  arrow(s, [r3.r, r4.l], "出力", {...D, w: 0.6});

  // ERSPAN
  y = cy(L[2]);
  const e1 = await node(s, X[0], y, W, H, "sw", "スイッチ／ルータ", "送信元（監視対象）\nGRE カプセル化", C.purple);
  const e2 = await node(s, X[1], y, W, H, "cloud", "IP ネットワーク", "L3 ルーティング", C.purple, {dash: true});
  const e3 = await node(s, X[2], y, W, H, "sw", "宛先スイッチ", "GRE を外して出力", C.purple);
  const e4 = await sen(y);
  arrow(s, [e1.r, e2.l], "GRE", {...D, w: 0.6});
  arrow(s, [e2.r, e3.l], "GRE", {...D, w: 0.6});
  arrow(s, [e3.r, e4.l], "出力", {...D, w: 0.6});
  const ly = 7.38 - 0.3;
  T(s, "凡例", {x: 0.3, y: ly, w: 0.6, h: 0.3, fontSize: 14, bold: true, color: C.muted, valign: "middle"});
  s.addShape("line", {x: 1.0, y: ly + 0.15, w: 0.6, h: 0, line: {color: C.arrow, width: 1.75}});
  T(s, "通信回線", {x: 1.7, y: ly, w: 1.2, h: 0.3, fontSize: 14, valign: "middle"});
  s.addShape("line", {x: 3.0, y: ly + 0.15, w: 0.6, h: 0, line: {color: M, width: 2, dashType: "dash", endArrowType: "triangle"}});
  T(s, "複製トラフィック（片方向）", {x: 3.7, y: ly, w: 2.8, h: 0.3, fontSize: 14, valign: "middle"});
  await save(p, out);
})();
