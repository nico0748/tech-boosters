// 図1：TLP 2.0 のラベルごとの共有範囲（FIRST TLP 2.0 の定義に準拠）
const {C, T, deck, icon, pill, LINE, TINT, badge} = require("./tlp.js");
const out = process.argv[2] || "01_TLPのラベルごとの共有範囲.pptx";
(async () => {
  const p = deck(); const s = p.addSlide(); s.background = {color: C.white};
  const X0 = 3.0, CW = 2.0, cols = [
    ["person", "受信者本人", "会議は出席者"], ["org", "受信者の組織", "organization"], ["clients", "組織の顧客", "clients"],
    ["community", "コミュニティ", "community"], ["world", "公開の場", "Web・SNS など"]];
  // 共有範囲の軸
  const ay = 0.42;
  s.addShape("line", {x: X0 + 0.1, y: ay, w: CW * 5 - 0.9, h: 0, line: {color: C.muted, width: 1.5, endArrowType: "triangle"}});
  T(s, "共有範囲：狭い", {x: X0 - 1.9, y: ay - 0.15, w: 1.85, h: 0.3, fontSize: 12, color: C.muted, align: "right", valign: "middle"});
  T(s, "広い", {x: X0 + CW * 5 - 0.72, y: ay - 0.15, w: 0.6, h: 0.3, fontSize: 12, color: C.muted, valign: "middle"});
  // 列見出し
  const hy = 0.7, hh = 1.25;
  for (let i = 0; i < 5; i++) {
    const x = X0 + i * CW, [ic, name, sub] = cols[i];
    s.addShape("rect", {x: x + 0.04, y: hy, w: CW - 0.08, h: hh, fill: {color: C.blueBg}, line: {type: "none"}});
    s.addImage({data: await icon(ic, C.blue), x: x + CW / 2 - 0.2, y: hy + 0.1, w: 0.4, h: 0.4});
    T(s, [{text: name, options: {bold: true, fontSize: 14, color: C.navy, breakLine: true}}, {text: sub, options: {fontSize: 12, color: C.muted}}],
      {x: x + 0.05, y: hy + 0.55, w: CW - 0.1, h: 0.65, align: "center"});
  }
  T(s, [{text: "ラベル", options: {bold: true, fontSize: 14, color: C.navy}}], {x: 0.3, y: hy, w: 2.5, h: hh, align: "center", valign: "middle"});
  // 行
  const rows = [
    ["RED", 1, "本人のみ", "RED"], ["AMBER+STRICT", 2, "組織内・need-to-know", "AMBER"], ["AMBER", 3, "組織＋顧客・need-to-know", "AMBER"],
    ["GREEN", 4, [{text: "コミュニティ内", options: {breakLine: true}}, {text: "未定義時はセキュリティ・防御コミュニティ", options: {fontSize: 12, bold: false, color: C.muted}}], "GREEN"], ["CLEAR", 5, "制限なし・著作権は適用", "CLEAR"]];
  const ry0 = 2.1, RH = 0.92;
  for (let r = 0; r < rows.length; r++) {
    const [lab, n, text, k] = rows[r], y = ry0 + r * RH, cy = y + RH / 2;
    s.addShape("line", {x: 0.3, y: y + RH, w: X0 + CW * 5 - 0.3, h: 0, line: {color: C.grid, width: 0.75}});
    pill(s, 0.4, cy - 0.24, 2.3, 0.48, lab, {fs: 15});
    s.addText(text, {shape: "roundRect", rectRadius: 0.08, x: X0 + 0.1, y: cy - 0.31, w: CW * n - 0.2, h: 0.62,
      fill: {color: TINT[k]}, line: {color: LINE[k], width: 2}, fontFace: "Helvetica Neue", fontSize: 14, bold: true,
      color: C.navy, align: "center", valign: "middle", margin: 0});
    for (let i = n; i < 5; i++) T(s, "×", {x: X0 + i * CW, y: cy - 0.2, w: CW, h: 0.4, fontSize: 18, color: "B0B5BC", align: "center", valign: "middle"});
  }
  s.addShape("line", {x: 0.3, y: ry0, w: X0 + CW * 5 - 0.3, h: 0, line: {color: C.grid, width: 0.75}});
  // 凡例
  const ly = ry0 + 5 * RH + 0.18;
  T(s, "凡例", {x: 0.3, y: ly, w: 0.6, h: 0.3, fontSize: 12, bold: true, color: C.muted, valign: "middle"});
  pill(s, 0.95, ly + 0.01, 1.1, 0.28, "RED", {fs: 12});
  T(s, "TLP 2.0 の指定色（黒地）", {x: 2.12, y: ly, w: 2.6, h: 0.3, fontSize: 12, valign: "middle"});
  s.addShape("roundRect", {x: 4.8, y: ly + 0.04, w: 0.55, h: 0.22, rectRadius: 0.05, fill: {color: "F3F4F6"}, line: {color: "8A9099", width: 1.5}});
  T(s, "共有可（枠色＝ラベル色）", {x: 5.42, y: ly, w: 2.6, h: 0.3, fontSize: 12, valign: "middle"});
  T(s, "×", {x: 8.0, y: ly, w: 0.3, h: 0.3, fontSize: 14, color: "B0B5BC", align: "center", valign: "middle"});
  T(s, "共有不可", {x: 8.32, y: ly, w: 1.2, h: 0.3, fontSize: 12, valign: "middle"});
  T(s, "need-to-know：知る必要のある者に限定", {x: 9.5, y: ly, w: 3.6, h: 0.3, fontSize: 12, valign: "middle"});
  await require("./lib.js").save(p, out);
})();
