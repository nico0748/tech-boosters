// 図3 OTに攻撃が届く主な経路と対策
const {Z, F, ACC, INK, MUTED, svgData, pres, T, node, arrow, badge} = require("./lib.js");
const md = require("react-icons/md"), tb = require("react-icons/tb");

(async () => {
  const W = 10, H = 5.75;
  const p = pres(W, H, "OTに攻撃が届く主な経路と対策");
  const s = p.addSlide({masterName: "CANVAS"});
  const EXT = {c: ACC.dmz.c}, IT = {c: ACC.it.c}, OT = {c: "3D4651"}, OK = ACC.ok;
  const NW = 1.55, NH = 0.86, COL = [1.65, 3.85, 6.05], DX = 7.85, DW = 2.0;
  const ROW = [0.78, 1.93, 3.08, 4.23];

  // 列の背景（IT・IDMZ／OT）と列見出し
  const top = 0.62, bot = ROW[3] + NH + 0.12;
  [0, 1, 3].forEach((i) => s.addShape("rect", {x: COL[1] - 0.12, y: i === 0 ? top : ROW[i] - 0.14, w: NW + 0.24, h: (i === 3 ? bot : ROW[i] + NH + 0.14) - (i === 0 ? top : ROW[i] - 0.14), fill: {color: ACC.it.bg}, line: {type: "none"}}));
  s.addShape("rect", {x: COL[2] - 0.12, y: top, w: NW + 0.24, h: bot - top, fill: {color: "EEF0F3"}, line: {type: "none"}});
  const hd = (x, w, text, color) => T(s, text, {x, y: 0.22, w, h: 0.32, fontSize: 14, bold: true, color, align: "center", valign: "middle"});
  hd(COL[0], NW, "起点", EXT.c); hd(COL[1], NW, "IT・境界", IT.c); hd(COL[2], NW, "OT", OT.c); hd(DX, DW, "主な対策", OK.c);

  const rows = [
    {name: "IT からの\n横展開", a: [md.MdOutlineMail, "フィッシング", "添付・リンク"], b: [md.MdComputer, "業務 PC", "認証情報の窃取"],
     c: [md.MdMonitor, "HMI・EWS", "OT 側の端末"], l1: "感染", l2: "横展開", d: ["IDMZ で IT/OT 分離", "許可リスト通信のみ"]},
    {name: "リモート\n保守の経路", a: [md.MdEngineering, "保守ベンダ", "社外の接続元"], b: [md.MdVpnLock, "VPN 機器", "脆弱性・認証の悪用"],
     c: [tb.TbCpu, "EWS・PLC", "保守対象の機器"], l1: "接続", l2: "到達", d: ["ジャンプサーバ・MFA", "都度承認・セッション記録"]},
    {name: "持ち込みの\n媒体・機器", a: [md.MdUsb, "USB・保守用 PC", "社外で使った媒体"], b: null,
     c: [tb.TbTopologyStar3, "制御 LAN", "媒体の接続先"], l1: "IT を経由せず直接接続", d: ["媒体の検査", "未登録機器の接続禁止"]},
    {name: "IT 側の\n停止の波及", a: [md.MdLockClock, "IT 側の感染", "ランサムウェア"], b: [md.MdLocalShipping, "生産管理・出荷", "システム停止"],
     c: [md.MdPrecisionManufacturing, "生産ライン", "予防的な停止"], l1: "暗号化", l2: "波及", dash2: true, d: ["OT の IT 依存の洗い出し", "IT 停止時の運転手順"]},
  ];
  rows.forEach((r, i) => {
    const y = ROW[i];
    // 行見出し
    s.addShape("ellipse", {x: 0.3, y: y + NH / 2 - 0.15, w: 0.3, h: 0.3, fill: {color: ACC.ng.c}, line: {type: "none"}});
    T(s, String(i + 1), {x: 0.3, y: y + NH / 2 - 0.15, w: 0.3, h: 0.3, fontSize: 12, bold: true, color: "FFFFFF", align: "center", valign: "middle"});
    T(s, r.name, {x: 0.63, y, w: 0.98, h: NH, fontSize: 13, bold: true, color: ACC.ng.c, valign: "middle"});
    const A = node(s, COL[0], y, NW, NH, r.a[0], EXT, r.a[1], r.a[2]);
    const C = node(s, COL[2], y, NW, NH, r.c[0], OT, r.c[1], r.c[2], {dash: !!r.dash2});
    if (r.b) {
      const B = node(s, COL[1], y, NW, NH, r.b[0], IT, r.b[1], r.b[2]);
      arrow(s, [A.r, B.l], r.l1, {w: 0.65, color: ACC.ng.c});
      arrow(s, [B.r, C.l], r.l2, {w: 0.4, color: ACC.ng.c, dash: !!r.dash2, w: 0.65});
    } else {
      arrow(s, [A.r, C.l], r.l1, {w: 2.2, color: ACC.ng.c});
    }
    // 対策
    s.addShape("roundRect", {x: DX, y, w: DW, h: NH, rectRadius: 0.08, fill: {color: OK.bg}, line: {color: OK.c, width: 1.5}});
    T(s, [{text: r.d[0], options: {breakLine: true}}, {text: r.d[1]}], {x: DX + 0.12, y, w: DW - 0.2, h: NH, fontSize: 12, color: INK, valign: "middle"});
  });

  // 凡例（下に1行）
  const gy = H - 0.25;
  T(s, "凡例", {x: 3.0, y: gy - 0.11, w: 0.5, h: 0.22, fontSize: 12, bold: true, color: MUTED, valign: "middle"});
  arrow(s, [[3.55, gy], [4.1, gy]], null, {color: ACC.ng.c});
  T(s, "侵入・到達", {x: 4.18, y: gy - 0.11, w: 1.1, h: 0.22, fontSize: 12, valign: "middle"});
  arrow(s, [[5.35, gy], [5.9, gy]], null, {color: ACC.ng.c, dash: true});
  T(s, "影響の波及", {x: 5.98, y: gy - 0.11, w: 1.1, h: 0.22, fontSize: 12, valign: "middle"});

  s.addShape("roundRect", {x: 7.2, y: gy - 0.11, w: 0.45, h: 0.22, rectRadius: 0.04, fill: {color: "FFFFFF"}, line: {color: "3D4651", width: 1.25, dashType: "dash"}});
  T(s, "侵入なしの影響先", {x: 7.73, y: gy - 0.11, w: 1.6, h: 0.22, fontSize: 12, valign: "middle"});
  await Z.save(p, process.argv[2] || "03_OTに攻撃が届く主な経路と対策.pptx");
})();
