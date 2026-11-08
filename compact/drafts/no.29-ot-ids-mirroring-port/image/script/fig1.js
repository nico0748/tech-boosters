// 図1：OT ネットワークでの OT-IDS センサーの置き場所（SPAN と TAP からの複製）
const {C, T, deck, lane, node, badge, arrow, save} = require("./lib.js");
const out = process.argv[2] || "01_OT-IDSセンサーの配置.pptx";
const M = C.orange; // 複製トラフィックの色
(async () => {
  const p = deck(); const s = p.addSlide(); s.background = {color: C.white};
  const L3 = {y: 0.2, h: 1.9}, L2 = {y: 2.1, h: 2.4}, L1 = {y: 4.5, h: 2.1};
  await lane(s, L3.y, L3.h, "Level 3", "サイト運用", C.blue, C.blueBg, "server");
  await lane(s, L2.y, L2.h, "Level 2", "監視制御", C.teal, C.tealBg, "hmi", {plain: true});
  await lane(s, L1.y, L1.h, "Level 1", "基本制御", C.purple, C.purpleBg, "plc");
  const X = [3.2, 5.95, 8.7, 11.45], W = 2.0, H = 1.3;
  const y3 = L3.y + L3.h / 2, y2 = L2.y + L2.h / 2, y1 = L1.y + L1.h / 2 + 0.05;

  const his = await node(s, X[1], y3, W, H, "server", "ヒストリアン", "プロセス値の蓄積", C.blue);
  const con = await node(s, X[2], y3, W, H, "console", "管理コンソール", "アラート・資産台帳", C.blue);

  const hmi = await node(s, X[0], y2, W, H, "hmi", "HMI", "監視・操作画面", C.teal);
  const sw = await node(s, X[1], y2, W, H, "sw", "L2 スイッチ", "対象ポートを SPAN", C.teal);
  const sen = await node(s, X[2], y2, W, 1.45, "sensor", "OT-IDS センサー", "監視 IF：IP なし\n管理 IF：L3 側", M, {fill: C.orangeBg, bold: true, badge: "パッシブ"});

  const pa = await node(s, X[0], y1, W, H, "plc", "PLC A", "Modbus/TCP", C.purple);
  const tap = await node(s, X[2], y1, W, H, "tap", "ネットワーク TAP", "回線に挿入", C.purple);
  const pb = await node(s, X[3], y1, W, H, "plc", "PLC B", "EtherNet/IP", C.purple);

  // 通信回線（矢じりなし）
  const N = {noHead: true, width: 1.75};
  arrow(s, [hmi.r, sw.l], null, N);
  arrow(s, [sw.t, his.b], null, N);
  arrow(s, [[X[1] - 0.35, sw.b[1]], [X[1] - 0.35, y1], pa.r], null, N);
  arrow(s, [[X[1] + 0.35, sw.b[1]], [X[1] + 0.35, y1], tap.l], null, N);
  arrow(s, [tap.r, pb.l], null, N);
  // 複製トラフィック（破線・片方向）
  arrow(s, [sw.r, sen.l], "SPAN", {dash: true, color: M, width: 2, w: 0.7});
  arrow(s, [tap.t, sen.b], "TAP", {dash: true, color: M, width: 2, w: 0.7});
  // 管理 IF からの送信
  arrow(s, [[X[2] - 0.45, sen.y], [X[2] - 0.45, con.y + con.h]], "アラート・資産情報", {color: C.blue, w: 1.9});

  // 凡例
  const ly = 6.78;
  T(s, "凡例", {x: 0.3, y: ly, w: 0.6, h: 0.3, fontSize: 14, bold: true, color: C.muted, valign: "middle"});
  s.addShape("line", {x: 1.0, y: ly + 0.15, w: 0.6, h: 0, line: {color: C.arrow, width: 1.75}});
  T(s, "通信回線", {x: 1.7, y: ly, w: 1.2, h: 0.3, fontSize: 14, valign: "middle"});
  s.addShape("line", {x: 3.0, y: ly + 0.15, w: 0.6, h: 0, line: {color: M, width: 2, dashType: "dash", endArrowType: "triangle"}});
  T(s, "複製トラフィック（片方向）", {x: 3.7, y: ly, w: 2.8, h: 0.3, fontSize: 14, valign: "middle"});
  s.addShape("line", {x: 6.6, y: ly + 0.15, w: 0.6, h: 0, line: {color: C.blue, width: 1.5, endArrowType: "triangle"}});
  T(s, "管理 IF からの送信", {x: 7.3, y: ly, w: 2.4, h: 0.3, fontSize: 14, valign: "middle"});
  await save(p, out);
})();
