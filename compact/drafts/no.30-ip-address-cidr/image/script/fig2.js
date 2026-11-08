// 図2：10.1.37.200/20 の範囲の計算（境界が第3オクテットの途中にある例）
const {C, T, NET, HOST, deck, cell, bracket, save} = require("./common.js");
const out = process.argv[2] || "02_CIDRの範囲の計算.pptx";
const P = (t) => ({text: t, options: {color: C.pink, bold: true}});

(async () => {
  const {p, s} = deck(5.4);
  const X = [2.6, 3.98, 5.36, 6.74], W = 1.3, H = 0.55, Y0 = 0.8;
  const lab = (y, t, sub, h = H) => T(s, [{text: t, options: {bold: true, fontSize: 14, color: C.navy, breakLine: !!sub}},
    ...(sub ? [{text: sub, options: {fontSize: 13.5, color: C.muted}}] : [])], {x: 0.2, y, w: 2.35, h, valign: "middle"});

  // 上段：アドレス全体
  const mid = X[2] + W / 2;
  bracket(s, X[0], mid, Y0 - 0.16, "ネットワーク部  20ビット", NET.line);
  bracket(s, mid, X[3] + W, Y0 - 0.16, "ホスト部  12ビット", HOST.line);
  lab(Y0, "IP アドレス", "10.1.37.200/20");
  ["10", "1"].forEach((d, j) => cell(s, X[j], Y0, W, H, d, {size: 16, bold: true, fill: NET.bg, line: NET.line, color: NET.text}));
  s.addShape("rect", {x: X[2], y: Y0, w: W / 2, h: H, fill: {color: NET.bg}, line: {color: NET.line, width: 1.25}});
  s.addShape("rect", {x: mid, y: Y0, w: W / 2, h: H, fill: {color: HOST.bg}, line: {color: HOST.line, width: 1.25}});
  T(s, "0010", {x: X[2], y: Y0, w: W / 2, h: H, fontFace: "Menlo", fontSize: 14, bold: true, color: NET.text, align: "center", valign: "middle"});
  T(s, "0101", {x: mid, y: Y0, w: W / 2, h: H, fontFace: "Menlo", fontSize: 14, bold: true, color: HOST.text, align: "center", valign: "middle"});
  cell(s, X[3], Y0, W, H, "200", {size: 16, bold: true, fill: HOST.bg, line: HOST.line, color: HOST.text});

  // 第3オクテットを拡大
  const CW = 0.55, G = 0.05, GX = 2.6, GY = 2.15, DY = 0.7, CH = 0.5;
  const gx = (k) => GX + k * (CW + G), GR = gx(8) - G;
  [[X[2], GX], [X[2] + W, GR]].forEach(([a, b]) =>
    s.addShape("line", {x: Math.min(a, b), y: Y0 + H, w: Math.abs(a - b), h: GY - 0.4 - Y0 - H, flipH: b < a, line: {color: C.muted, width: 1, dashType: "dash"}}));
  [128, 64, 32, 16, 8, 4, 2, 1].forEach((v, k) =>
    T(s, String(v), {x: gx(k), y: GY - 0.36, w: CW, h: 0.3, fontSize: 13, color: C.muted, align: "center", valign: "bottom"}));
  T(s, "第3オクテットの展開", {x: 0.2, y: Y0 + H + 0.2, w: 2.3, h: 0.3, fontSize: 13, color: C.muted, valign: "middle"});
  T(s, "ビットの重み", {x: 0.2, y: GY - 0.36, w: 2.35, h: 0.3, fontSize: 13, color: C.muted, valign: "bottom"});

  const rows = [
    {t: "第3オクテット", sub: "37 の2進表記", bits: "00100101", dec: "37"},
    {t: "サブネットマスク", sub: "/20 の第3オクテット", bits: "11110000", dec: "240"},
    {t: "ネットワークアドレス", sub: "下位4ビットすべて0", bits: "00100000", dec: "32", key: true},
    {t: "ブロードキャストアドレス", sub: "下位4ビットすべて1", bits: "00101111", dec: "47", key: true},
  ];
  rows.forEach((r, i) => {
    const y = GY + i * DY;
    lab(y, r.t, r.sub, CH);
    [...r.bits].forEach((b, k) => {
      const host = k >= 4, pal = host ? HOST : NET, hot = r.key && host;
      cell(s, gx(k), y, CW, CH, b, {mono: true, size: 15, fill: pal.bg, line: pal.line, color: hot ? C.pink : pal.text, bold: hot});
    });
    T(s, [{text: "= " + r.dec}], {x: GR + 0.12, y, w: 0.8, h: CH, fontSize: 15, bold: true, color: C.navy, valign: "middle"});
  });

  // 結果
  const bx = 8.1, by = GY + 2 * DY, bw = 1.75, bh = DY + CH;
  s.addShape("roundRect", {x: bx, y: by, w: bw, h: bh, rectRadius: 0.08, fill: {color: C.white}, line: {color: C.navy, width: 1.5}});
  T(s, [
    {text: "アドレス範囲", options: {bold: true, fontSize: 13, color: C.muted, breakLine: true}},
    {text: "10.1.", options: {bold: true}}, {text: "32", options: {bold: true}}, {text: ".0", options: {bold: true, breakLine: true}},
    {text: "〜 10.1.", options: {bold: true}}, {text: "47", options: {bold: true}}, {text: ".255", options: {bold: true, breakLine: true}},
    {text: "4,096 個", options: {fontSize: 13, color: C.muted}},
  ], {x: bx + 0.12, y: by + 0.08, w: bw - 0.2, h: bh - 0.16, fontSize: 14, color: C.navy, valign: "middle", lineSpacingMultiple: 1.0});

  const ly = GY + 4 * DY - 0.05;
  T(s, "凡例", {x: 0.2, y: ly, w: 0.6, h: 0.3, fontSize: 13, bold: true, color: C.muted, valign: "middle"});
  T(s, [P("abc"), {text: "  ホスト部をすべて0／すべて1にした値"}], {x: 0.85, y: ly, w: 7.0, h: 0.3, fontSize: 13, valign: "middle"});
  await save(p, out);
})();
