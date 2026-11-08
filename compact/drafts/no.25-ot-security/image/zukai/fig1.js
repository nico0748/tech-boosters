// 図1 パーデューモデルで見るITとOTのネットワーク構成
const {Z, F, ACC, INK, svgData, pres, T, node, arrow, pill} = require("./lib.js");
const md = require("react-icons/md"), tb = require("react-icons/tb");

(async () => {
  const W = 10, Y0 = 0.55;
  const LH = [1.42, 1.44, 1.32, 1.22, 1.22, 1.46];   // FW をまたぐレーンだけ隙間を広げる
  const OFF = [0.27, 0.28, 0.28, 0.17, 0.17, 0.17];  // レーン上端からノードまで
  const LY = [Y0]; LH.forEach((h, i) => LY.push(LY[i] + h));
  const H = LY[6] + 0.1;
  const p = pres(W, H, "パーデューモデルで見るITとOTのネットワーク構成");
  const s = p.addSlide({masterName: "CANVAS"});

  const LX = 0.25, HW = 1.45, LW = 8.35;
  const NW = 2.05, NH = 0.88, COL = [1.88, 4.18, 6.48];
  const cx = COL.map((x) => x + NW / 2);
  const LV = "4B5563";
  const lanes = [
    {k: "it",  lv: "Level 4〜5", name: "企業 IT",    ic: md.MdBusiness},
    {k: "dmz", lv: "Level 3.5",  name: "IDMZ",       ic: md.MdSecurity},
    {k: "l3",  lv: "Level 3",    name: "運用管理",   ic: md.MdInsights},
    {k: "l2",  lv: "Level 2",    name: "監視制御",   ic: md.MdMonitorHeart},
    {k: "l1",  lv: "Level 1",    name: "基本制御",   ic: md.MdTune},
    {k: "l0",  lv: "Level 0",    name: "物理プロセス", ic: md.MdFactory},
  ];
  lanes.forEach((L, i) => {
    const a = ACC[L.k], y = LY[i], h = LH[i];
    const w = i === 0 ? COL[2] - 0.12 - LX : LW;       // 企業 IT レーンは社外の手前まで
    s.addShape("rect", {x: LX, y, w, h, fill: {color: a.bg}, line: {color: "FFFFFF", width: 1.5}});
    s.addShape("rect", {x: LX, y, w: 0.08, h, fill: {color: a.c}, line: {type: "none"}});
    s.addImage({data: svgData(L.ic, a.c), x: LX + 0.08 + HW / 2 - 0.17, y: y + h / 2 - 0.46, w: 0.34, h: 0.34});
    T(s, [{text: L.lv, options: {fontSize: F.laneSub, color: LV, breakLine: true}},
          {text: L.name, options: {fontSize: F.lane, bold: true, color: a.c}}],
      {x: LX + 0.1, y: y + h / 2 - 0.1, w: HW, h: 0.52, align: "center"});
  });
  // 社外（インターネット側）
  const ox = COL[2] - 0.12, ow = LX + LW - ox;
  s.addShape("rect", {x: ox, y: LY[0], w: ow, h: LH[0], fill: {color: "FFFFFF"}, line: {color: "9AA0A6", width: 1.25, dashType: "dash"}});
  T(s, "社外（インターネット）", {x: ox + 0.08, y: LY[0] + 0.04, w: ow - 0.16, h: 0.2, fontSize: 12, bold: true, color: "5F6368"});

  const N = {};
  const add = (key, lane, col, ic, t, sub, o = {}) => (N[key] = node(s, o.x ?? COL[col], LY[lane] + OFF[lane] + (o.dy || 0), o.w || NW, NH, ic, o.acc || ACC[lanes[lane].k], t, sub));
  add("erp", 0, 0, md.MdBusinessCenter, "ERP", "生産計画・受発注");
  add("pc", 0, 1, md.MdComputer, "業務 PC・メール", "一般の業務端末");
  add("vendor", 0, 2, md.MdEngineering, "保守ベンダ", "リモート保守の接続元", {acc: {c: "5F6368"}});
  add("rep", 1, 0, tb.TbDatabaseExport, "ヒストリアン複製", "IT からの参照用");
  add("patch", 1, 1, md.MdSystemUpdateAlt, "パッチ配信", "OS パッチ・ウイルス定義");
  add("jump", 1, 2, tb.TbServer2, "ジャンプサーバ", "MFA・セッション記録");
  add("hist", 2, 0, tb.TbDatabase, "ヒストリアン", "計測値の時系列保存");
  add("mes", 2, 1, md.MdPrecisionManufacturing, "MES", "製造実行・作業指示");
  add("scada", 3, 0, md.MdDns, "SCADA サーバ", "データ収集・監視制御");
  add("hmi", 3, 1, md.MdMonitor, "HMI", "運転監視・操作画面");
  add("ews", 3, 2, md.MdLaptop, "EWS", "制御ロジックの作成");
  add("plc", 4, 0, tb.TbCpu, "PLC", "制御ロジックの実行");
  add("dcs", 4, 1, md.MdMemory, "DCS コントローラ", "連続プロセスの制御");
  add("sis", 4, 2, md.MdHealthAndSafety, "SIS", "異常時の安全停止");
  add("field", 5, 0, md.MdSensors, "センサ・アクチュエータ", "温度・圧力の計測／バルブ・モータの駆動", {w: COL[1] + NW - COL[0]});

  add("sfield", 5, 2, md.MdSensors, "専用センサ・遮断弁", "安全計装用の計測・遮断");
  // SIS は独立した安全ゾーン（専用 EWS で保守）
  const zb = N.sfield.y + NH + 0.07;
  s.addShape("rect", {x: N.sis.x - 0.07, y: N.sis.y - 0.07, w: NW + 0.14, h: zb - N.sis.y + 0.07, fill: {type: "none"}, line: {color: ACC.ng.c, width: 1.5, dashType: "dash"}});
  T(s, "独立した安全ゾーン・専用 EWS", {x: N.sis.x - 0.2, y: zb + 0.03, w: NW + 0.4, h: 0.22, fontSize: 12, bold: true, color: ACC.ng.c, align: "center", valign: "middle"});

  // 境界のファイアウォール
  for (const y of [LY[1], LY[2]]) {
    s.addShape("line", {x: LX, y, w: LW, h: 0, line: {color: "3D4651", width: 2.5}});
    pill(s, LX + LW + 0.06, y - 0.15, 0.6, 0.3, "FW", "3D4651");
  }

  const lab = (x, y, text, o = {}) => T(s, text, {x: o.left ? x - (o.w || 1.6) - 0.08 : x + 0.08, y: y - 0.11, w: o.w || 1.6, h: 0.22,
    fontSize: F.arrow, color: o.color || "3C4043", align: o.left ? "right" : "left", valign: "middle"});
  // L0 ↔ L1（PLC・DCS それぞれ計測値↑と操作出力↓）
  const fTop = N.field.y, cBot = N.plc.y + NH, mid01 = (fTop + cBot) / 2;
  for (const c of [cx[0], cx[1], cx[2]]) {
    arrow(s, [[c - 0.3, fTop], [c - 0.3, cBot]], null);
    arrow(s, [[c + 0.3, cBot], [c + 0.3, fTop]], null);
    lab(c - 0.3, mid01, "計測値", {left: true, w: 0.7});
    lab(c + 0.3, mid01, "操作出力", {w: 0.85});
  }
  // L1 ↔ L2
  const mid12 = (N.plc.y + N.scada.y + NH) / 2;
  arrow(s, [[cx[0] - 0.3, N.plc.y], [cx[0] - 0.3, N.scada.y + NH]], null);
  arrow(s, [[cx[0] + 0.3, N.scada.y + NH], [cx[0] + 0.3, N.plc.y]], null);
  lab(cx[0] - 0.3, mid12, "状態値", {left: true, w: 0.7});
  lab(cx[0] + 0.3, mid12, "指令値（Modbus/TCP など）", {w: 2.3});
  // EWS → DCS（ロジックの書き込み、L字）
  const ewsB = N.ews.y + NH, ex = cx[2] - 0.55, dx = cx[1] + 0.55;
  arrow(s, [[ex, ewsB], [ex, mid12], [dx, mid12], [dx, N.dcs.y]], null);
  lab(ex, (ewsB + mid12) / 2 + 0.02, "ロジック書き込み", {w: 1.5});
  // L2 → L3
  const mid23 = (N.scada.y + N.hist.y + NH) / 2;
  arrow(s, [N.scada.t, N.hist.b], null); lab(cx[0], mid23, "プロセスデータ", {w: 1.4});
  // L3 → IDMZ（FW の下側にラベル）
  const fw2 = LY[2], fw1 = LY[1];
  arrow(s, [N.hist.t, N.rep.b], null); lab(cx[0], (fw2 + N.hist.y) / 2, "複製（OT 側から送信）", {w: 2.0});
  arrow(s, [N.patch.b, N.mes.t], null); lab(cx[1], (fw2 + N.mes.y) / 2, "検証済みパッチ（OT 端末へ）", {w: 2.3});
  // IDMZ → IT（参照）、社外 → ジャンプサーバ（FW の上側にラベル）
  arrow(s, [N.rep.t, N.erp.b], null); lab(cx[0], (fw1 + N.erp.y + NH) / 2, "参照用データ", {w: 1.3});
  arrow(s, [N.vendor.b, N.jump.t], null, {dash: true}); lab(cx[2], (fw1 + N.vendor.y + NH) / 2, "VPN", {left: true, w: 0.5});
  arrow(s, [N.jump.b, N.ews.t], null, {dash: true}); T(s, "許可した\n接続のみ", {x: cx[2] - 0.08 - 0.95, y: (N.jump.y + NH + N.ews.y) / 2 - 0.22, w: 0.95, h: 0.44, fontSize: F.arrow, color: "3C4043", align: "right", valign: "middle"});

  // 右端の IT / OT 範囲
  const bx = 9.42;
  const brace = (y1, y2, label, color) => {
    s.addShape("line", {x: bx, y: y1 + 0.05, w: 0, h: y2 - y1 - 0.1, line: {color, width: 2}});
    s.addShape("line", {x: bx - 0.08, y: y1 + 0.05, w: 0.08, h: 0, line: {color, width: 2}});
    s.addShape("line", {x: bx - 0.08, y: y2 - 0.05, w: 0.08, h: 0, line: {color, width: 2}});
    T(s, label, {x: bx + 0.06, y: (y1 + y2) / 2 - 0.15, w: 0.5, h: 0.3, fontSize: 14, bold: true, color, valign: "middle"});
  };
  brace(LY[2], LY[6], "OT", "3D4651");

  // 凡例（右上に1行）
  const gy = 0.2;
  T(s, "凡例", {x: 3.45, y: gy - 0.11, w: 0.5, h: 0.22, fontSize: F.legend, bold: true, color: "5F6368", valign: "middle"});
  arrow(s, [[3.95, gy], [4.45, gy]], null);
  T(s, "データ・制御通信", {x: 4.52, y: gy - 0.11, w: 1.5, h: 0.22, fontSize: F.legend, valign: "middle"});
  arrow(s, [[6.05, gy], [6.55, gy]], null, {dash: true});
  T(s, "リモート保守", {x: 6.62, y: gy - 0.11, w: 1.2, h: 0.22, fontSize: F.legend, valign: "middle"});
  pill(s, 7.82, gy - 0.13, 0.56, 0.26, "FW", "3D4651", {size: 12});
  T(s, "境界の FW", {x: 8.42, y: gy - 0.11, w: 1.2, h: 0.22, fontSize: F.legend, valign: "middle"});

  await Z.save(p, process.argv[2] || "01_パーデューモデルで見るITとOTのネットワーク構成.pptx");
})();
