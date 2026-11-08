// 図3：192.168.0.0/22 の分割と集約、集約できない例
const {C, T, NET, deck, cell, arrow, save} = require("./common.js");
const out = process.argv[2] || "03_サブネットの分割と集約.pptx";
const RED = "C62828", RED_BG = "FDECEA", GRAY = "9AA0A6";

(async () => {
  const {p, s} = deck(4.75);
  const SX = 2.65, SW = 1.4, H = 0.55, sx = (k) => SX + k * SW;
  const R = [0.75, 1.55, 2.35];  // /22, /23, /24 の行
  const rowLab = (y, cidr, n) => T(s, [{text: cidr, options: {bold: true, fontSize: 15, color: C.navy, breakLine: true}},
    {text: n, options: {fontSize: 13.5, color: C.muted}}], {x: 1.55, y, w: 1.05, h: H, valign: "middle"});
  const bar = (k, n, y, text) => cell(s, sx(k) + 0.03, y, n * SW - 0.06, H, text, {round: true, size: 13, bold: true, fill: NET.bg, line: NET.line, color: NET.text});

  rowLab(R[0], "/22", "1,024 個 × 1"); bar(0, 4, R[0], "192.168.0.0/22");
  rowLab(R[1], "/23", "512 個 × 2"); bar(0, 2, R[1], "192.168.0.0/23"); bar(2, 2, R[1], "192.168.2.0/23");
  rowLab(R[2], "/24", "256 個 × 4"); [0, 1, 2, 3].forEach((k) => bar(k, 1, R[2], `192.168.${k}.0/24`));
  // 次の /22 に属する 192.168.4.0/24
  cell(s, sx(4) + 0.1, R[2], SW - 0.13, H, [{text: "192.168.4.0/24", options: {breakLine: true}}, {text: "/22 の外", options: {bold: false}}], {round: true, size: 13, bold: true, fill: C.white, line: GRAY, dash: true, color: C.muted});
  // /22 の境界
  s.addShape("line", {x: sx(4), y: R[0] - 0.3, w: 0, h: R[2] + H + 0.1 - (R[0] - 0.3), line: {color: C.navy, width: 1.75, dashType: "dash"}});
  T(s, "/22 の境界", {x: sx(4) + 0.08, y: R[0] - 0.05, w: 1.3, h: 0.3, fontSize: 13, bold: true, color: C.navy, valign: "middle"});

  // 分割・集約の矢印（ラベルは白地で線の上に重ねる）
  const top = R[0] + H / 2, bot = R[2] + H / 2;
  arrow(s, [[0.5, top], [0.5, bot]], null);
  arrow(s, [[1.15, bot], [1.15, top]], null);
  const tag = (x, t1, t2) => T(s, [{text: t1, options: {bold: true, fontSize: 14, color: C.navy, breakLine: true}}, {text: t2, options: {fontSize: 13, color: C.muted}}],
    {x: x - 0.32, y: (top + bot) / 2 - 0.27, w: 0.64, h: 0.54, align: "center", valign: "middle", fill: {color: C.white}});
  tag(0.5, "分割", "/n+1"); tag(1.15, "集約", "/n−1");

  // 集約できない例
  const yb = R[2] + H + 0.32;
  s.addShape("custGeom", {x: sx(1) + 0.03, y: yb, w: 4 * SW - 0.06, h: 0.12,
    points: [{x: 0, y: 0}, {x: 0, y: 0.12}, {x: 4 * SW - 0.06, y: 0.12}, {x: 4 * SW - 0.06, y: 0}], fill: {type: "none"}, line: {color: RED, width: 1.75}});
  s.addText([{text: "集約できない例：192.168.1.0/24〜192.168.4.0/24", options: {bold: true, breakLine: true}},
    {text: "/22 の境界とずれ、/24・/23・/24 の3つ止まり"}],
    {shape: "roundRect", rectRadius: 0.06, x: sx(1) + 0.03, y: yb + 0.24, w: 4 * SW - 0.06, h: 0.64, fill: {color: RED_BG}, line: {color: RED, width: 1.25},
      fontFace: "Helvetica Neue", fontSize: 13.5, color: RED, align: "center", valign: "middle", margin: 0.04});
  await save(p, out);
})();
