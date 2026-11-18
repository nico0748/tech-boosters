// 図1 rPPGの全体像（zukai-diagrams の規約＋元の色分け：被験者=ネイビー、測定系=ティール）
const Z = require("./zukai.js"), md = require("react-icons/md");
Z.FONT.ja = "Hiragino Mincho ProN"; Z.FONT.en = "Times New Roman";   // Nico指定の明朝体（2026-11-02）
Z.ICON.light = md.MdWbSunny; Z.ICON.hr = md.MdMonitorHeart;

const NAVY = "2E5E8E", LNAVY = "EEF3F9", TEAL = "1E8A82", LTEAL = "E8F5F3", SLATE = "2B3A4A",
  RED = "B02A2A", PERSON = "D5E0EE", INK = "1F2937";

(async () => {
  const p = Z.article({title: "rPPGの全体像"});
  Object.assign(Z.FS, {label: 16, sub: 14, arrow: 14, box: 16});   // 記事幅800pxで読める下限
  const s = Z.canvas(p, "図1 rPPGの全体像。①環境光→②拡散反射光→③RGB時系列→④心拍数の順に読む。");

  // 枠：元の色分けを維持（淡い地＋アクセント色の線、見出しはアクセント色の下線付き）
  function zone(x, y, w, h, heading, accent, fill) {
    s.addShape("roundRect", {x, y, w, h, rectRadius: 0.2, fill: {color: fill}, line: {color: accent, width: 1.25}});
    Z.T(s, heading, {x, y: y - 0.4, w, h: 0.34, fontSize: 16, bold: true, color: accent,
      align: "center", valign: "middle"});
  }
  const SX = 0.3, SY = 1.3, SW = 4.35, SH = 4.0;     // 被験者
  const MX = 6.2, MY = 1.3, MW = 3.5, MH = 2.75;   // 測定系
  zone(SX, SY, SW, SH, "被験者 Subject", NAVY, LNAVY);
  zone(MX, MY, MW, MH, "測定系 Measurement System", TEAL, LTEAL);

  // 人型（頭・首・肩を1本の輪郭で）
  const PCX = 3.5, headCY = 2.42, RX = 0.52, RY = 0.62, NW = 0.21, SHY = 3.78, SHX = 0.98, NOTEY = SY + SH - 0.72, BOT = NOTEY - 0.2;
  {
    const pts = [[PCX - SHX, BOT], [PCX - SHX, SHY]];
    const srx = 0.6, sry = 0.55, scx = PCX - SHX + srx;
    for (let i = 1; i <= 20; i++) {const t = Math.PI + Math.PI / 2 * i / 20; pts.push([scx + srx * Math.cos(t), SHY + sry * Math.sin(t)]);}
    const p0 = pts[pts.length - 1], p2 = [PCX - NW, SHY - sry - 0.12], p1 = [PCX - NW - 0.04, p0[1]];
    for (let i = 1; i <= 15; i++) {const u = i / 15; pts.push([(1-u)**2*p0[0] + 2*(1-u)*u*p1[0] + u*u*p2[0], (1-u)**2*p0[1] + 2*(1-u)*u*p1[1] + u*u*p2[1]]);}
    const ar = Math.acos(NW / RX), s0 = Math.PI - ar, s1 = 2 * Math.PI + ar;
    for (let i = 0; i <= 60; i++) {const t = s0 + (s1 - s0) * i / 60; pts.push([PCX + RX * Math.cos(t), headCY + RY * Math.sin(t)]);}
    const left = pts.slice(0, 2 + 20 + 15);
    pts.push(...left.reverse().map(([x, y]) => [2 * PCX - x, y]));
    const x0 = Math.min(...pts.map((q) => q[0])), y0 = Math.min(...pts.map((q) => q[1]));
    const w = Math.max(...pts.map((q) => q[0])) - x0, h = Math.max(...pts.map((q) => q[1])) - y0;
    s.addShape("custGeom", {x: x0, y: y0, w, h, points: [...pts.map(([x, y]) => ({x: x - x0, y: y - y0})), {close: true}],
      fill: {color: PERSON}, line: {color: NAVY, width: 1.25}});
  }
  const bodyT = SHY - 0.55;
  const ROI = {x: PCX - 0.3, y: headCY - RY + 0.18, w: 0.6, h: 0.28};
  const FY = ROI.y + ROI.h / 2;
  s.addShape("rect", {...ROI, fill: {type: "none"}, line: {color: RED, width: 1.75, dashType: "dash"}});
  Z.T(s, "ROI", {x: PCX + 0.03, y: ROI.y + ROI.h + 0.01, w: 0.5, h: 0.26, fontSize: 14, bold: true, color: RED, align: "center"});

  // 心臓と血流（心臓→毛細血管）
  const HX = PCX + 0.36, HY = SHY + 0.22, HS = 0.34, ELY = bodyT + 0.22;
  Z.arrow(s, [[HX, HY - HS / 2 + 0.04], [HX, ELY], [PCX, ELY], [PCX, ROI.y + ROI.h]], null, {color: RED, width: 1.75});
  s.addShape("heart", {x: HX - HS / 2, y: HY - HS / 2, w: HS, h: HS, fill: {color: "FFFFFF"}, line: {color: RED, width: 1.75}});

  // 引き出し（左）：本文の①〜③と同じ番号
  const CX = SX + 0.15, CW = 1.85, CH = 0.66;
  const EX = CX + CW + 0.12;
  function callout(cy, title, sub, tx, ty) {
    s.addText([{text: title, options: {bold: true, fontSize: 16, color: INK, breakLine: true}},
               {text: sub, options: {fontSize: 14, color: Z.C.muted}}],
      {shape: "rect", x: CX, y: cy - CH / 2, w: CW, h: CH, fill: {color: "FFFFFF"}, line: {color: NAVY, width: 1.25},
       fontFace: Z.FONT.en, align: "center", valign: "middle", margin: 0.03});
    const pts = Math.abs(cy - ty) < 0.01 ? [[CX + CW, cy], [tx, ty]] : [[CX + CW, cy], [EX, cy], [EX, ty], [tx, ty]];
    Z.arrow(s, pts, null, {color: Z.C.muted, width: 1.5, head: "none"});
    s.addShape("ellipse", {x: tx - 0.05, y: ty - 0.05, w: 0.1, h: 0.1, fill: {color: INK}, line: {type: "none"}});
  }
  const B1 = FY, B3 = HY, B2 = (B1 + B3) / 2, VY = ROI.y + ROI.h + 0.2;
  callout(B1, "Forehead", "反射光の輝度変化", ROI.x, FY);
  callout(B2, "真皮微小血管", "血液量の拍動変化", PCX, VY);
  callout(B3, "心臓", "拍動（心周期）", HX - HS / 2, HY);

  // 注記
  Z.note(s, SX + 0.15, NOTEY, SW - 0.3, 0.5, "血液量の変動 → 吸光量の変化 → 輝度変化");

  // 環境光（被験者の外）
  Z.C.icon = SLATE; const NB = (n, t) => [{text: n + " ", options: {bold: true}}, {text: t}];
  const L = await Z.node(s, "light", PCX, 0.5, "", null, {size: 0.46});
  Z.T(s, [{text: "環境光 "}, {text: "Ambient Light", options: {fontSize: 14, bold: false, color: Z.C.muted}}], {x: PCX + 0.3, y: 0.32, w: 2.6, h: 0.34, fontSize: 16, bold: true, color: INK, valign: "middle"});
  Z.arrow(s, [[PCX, 0.79], [PCX, ROI.y]], NB("①", "照射"), {w: 1.0, dy: 0.22, color: NAVY, width: 1.75});

  // 測定系（ティール）
  Z.C.icon = TEAL; Z.C.label = TEAL;
  const cam = await Z.node(s, "camera", MX + 0.85, FY, "RGBカメラ", "顔動画の撮像", {w: 1.6, kind: "user"});
  const pc = await Z.node(s, "pc", MX + 2.62, FY, "信号処理", "脈波抽出・FFT", {w: 1.6, kind: "user"});
  Z.arrow(s, [cam.r, pc.l], NB("③", "動画\nフレーム"), {w: 1.1, h: 0.55, color: NAVY, width: 1.75});
  const OY = MY + MH - 0.45;
  s.addText("心拍数 HR [bpm]", {shape: "roundRect", rectRadius: 0.1, x: pc.b[0] - 0.98, y: OY - 0.24, w: 1.7, h: 0.48,
    fill: {color: SLATE}, line: {type: "none"}, fontFace: Z.FONT.en, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0});
  Z.arrow(s, [[pc.b[0], pc.b[1] + 0.08], [pc.b[0], OY - 0.24]], NB("④", "推定値"), {w: 1.2, left: true, color: NAVY, width: 1.75});

  // 拡散反射光（非接触で受光）
  Z.arrow(s, [[ROI.x + ROI.w, FY], cam.l], NB("②", "拡散反射光"), {w: 1.4, dx: (SX + SW + MX) / 2 - 0.04 - (ROI.x + ROI.w + cam.l[0]) / 2, color: NAVY, width: 1.75});
  Z.T(s, [{text: "非接触", options: {bold: true, color: TEAL, breakLine: true}}, {text: "Non-contact", options: {fontSize: 14, color: Z.C.muted}}],
    {x: SX + SW, y: FY + 0.12, w: MX - SX - SW, h: 0.6, fontSize: 16, align: "center"});

  // 凡例（色分けの意味）
  const LX = MX, LY = NOTEY - 0.1;
  s.addShape("roundRect", {x: LX, y: LY, w: MW, h: 0.95, rectRadius: 0.08, fill: {color: "FFFFFF"}, line: {color: Z.C.grid, width: 0.75}});
  const rows = [
    [(y) => Z.arrow(s, [[LX + 0.15, y], [LX + 0.6, y]], null, {color: NAVY, width: 1.75}), "光・信号の流れ"],
    [(y) => Z.arrow(s, [[LX + 0.15, y], [LX + 0.6, y]], null, {color: RED, width: 1.75}), "脈波の伝播（心臓→ROI）"],
    [(y) => s.addShape("rect", {x: LX + 0.18, y: y - 0.08, w: 0.4, h: 0.16, fill: {type: "none"}, line: {color: RED, width: 1.5, dashType: "dash"}}), "ROI（計測領域）"]];
  rows.forEach(([draw, t], i) => {const y = LY + 0.2 + i * 0.28; draw(y);
    Z.T(s, t, {x: LX + 0.72, y: y - 0.13, w: MW - 0.8, h: 0.26, fontSize: 14, valign: "middle"});});

  await Z.save(p, process.argv[2] || "01_rPPGの全体像.pptx");
})();
