// 図2：TLP:AMBER のレポートを受け取ったときの共有の流れ（FIRST TLP 2.0 の定義に準拠）
const {C, T, deck, lane, node, badge, arrow, pill, LINE} = require("./tlp.js");
const out = process.argv[2] || "02_TLPAMBERの情報が共有される流れ.pptx";
const G = LINE.GREEN, R = C.red;
(async () => {
  const p = deck(); const s = p.addSlide(); s.background = {color: C.white};
  const LH = 1.62, Y = [0.2, 0.2 + LH, 0.2 + 2 * LH, 0.2 + 3 * LH];
  await lane(s, Y[0], LH, "発信元", "CSIRT・ISAC など", C.slate, "EEF0F3", "report");
  await lane(s, Y[1], LH, "受信組織", "SOC・CSIRT", C.blue, C.blueBg, "org");
  await lane(s, Y[2], LH, "受信組織の顧客", "clients", G, "EEF8EC", "clients");
  await lane(s, Y[3], LH, "コミュニティ", "同業他社\n業界グループ", C.red, C.redBg, "community");
  const X = [3.3, 6.5, 9.2, 11.75], W = 2.2, H = 1.22, cy = (i) => Y[i] + LH / 2;
  const n1 = await node(s, X[0], cy(0), W, H, "report", "脅威レポート", "TLP:AMBER を付与", C.slate);
  const n5 = await node(s, X[3], cy(0), W, H, "gavel", "許可の判断", "範囲拡大の可否", C.slate);
  const n2 = await node(s, X[0], cy(1), W, H, "inbox", "レポート受信", "ラベル・追加制限の確認", C.blue);
  const n3 = await node(s, X[1], cy(1), W, H, "org", "組織内で共有", "need-to-know の担当者", C.blue);
  const n4 = await node(s, X[1], cy(2), W, H, "clients", "顧客へ共有", "対策に必要な範囲", G);
  const n6 = await node(s, X[2], cy(3), W, H, "community", "コミュニティへ共有", "AMBER の範囲外", C.red);
  arrow(s, [n1.b, n2.t], "TLP:AMBER", {w: 1.2, color: G});
  arrow(s, [n2.r, n3.l], "対策担当へ", {w: 1.0, color: G});
  arrow(s, [n3.b, n4.t], "共有可", {color: G, w: 1.0});
  // 許可なしの共有（不可）
  const yb = cy(1) - 0.0, xb = X[2];
  arrow(s, [n3.r, [xb, cy(1)], n6.t], "無許可の共有：不可", {color: R, seg: 1, w: 1.75, left: true, dy: -0.2});
  badge(s, xb + 0.21, cy(2) + 0.45, "×", R);
  // 許可依頼 → 許可後の共有
  const yr = Y[0] + 0.28;
  arrow(s, [[n3.x + 0.5, n3.y], [n3.x + 0.5, yr], [n5.x, yr]], "範囲拡大の許可依頼", {seg: 1, w: 2.4, dash: true});
  const xr = n5.x + n5.w - 0.4;
  arrow(s, [[xr, n5.y + n5.h], [xr, cy(3)], n6.r], "明示的な許可後：可", {color: G, seg: 1, w: 2.0, dash: true});
  // 凡例
  const ly = Y[3] + LH + 0.17;
  T(s, "凡例", {x: 0.3, y: ly, w: 0.6, h: 0.3, fontSize: 12, bold: true, color: C.muted, valign: "middle"});
  arrow(s, [[1.0, ly + 0.15], [1.6, ly + 0.15]], null, {color: G});
  T(s, "ラベルの範囲内の共有", {x: 1.7, y: ly, w: 2.2, h: 0.3, fontSize: 12, valign: "middle"});
  arrow(s, [[4.0, ly + 0.15], [4.6, ly + 0.15]], null, {color: R});
  T(s, "範囲外の共有（不可）", {x: 4.7, y: ly, w: 2.2, h: 0.3, fontSize: 12, valign: "middle"});
  arrow(s, [[7.0, ly + 0.15], [7.6, ly + 0.15]], null, {dash: true});
  T(s, "許可依頼", {x: 7.7, y: ly, w: 1.2, h: 0.3, fontSize: 12, valign: "middle"});
  arrow(s, [[9.1, ly + 0.15], [9.7, ly + 0.15]], null, {color: G, dash: true});
  T(s, "発信元の許可後の共有", {x: 9.8, y: ly, w: 2.6, h: 0.3, fontSize: 12, valign: "middle"});
  await require("./lib.js").save(p, out);
})();
