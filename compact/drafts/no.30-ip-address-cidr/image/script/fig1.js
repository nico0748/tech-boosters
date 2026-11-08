// 図1：192.168.10.37/24 のネットワーク部とホスト部
const {C, T, NET, HOST, deck, cell, bracket, save} = require("./common.js");
const out = process.argv[2] || "01_ネットワーク部とホスト部.pptx";

(async () => {
  const {p, s} = deck(4.45);
  const X = [2.6, 3.98, 5.36, 6.74], W = 1.3, H = 0.55, DX = 8.35;
  const rows = [
    {t: "IP アドレス", sub: "192.168.10.37/24", bits: ["11000000", "10101000", "00001010", "00100101"], dec: ["192", "168", "10", "37"]},
    {t: "サブネットマスク", sub: "/24 相当", bits: ["11111111", "11111111", "11111111", "00000000"], dec: ["255", "255", "255", "0"]},
    {t: "ネットワークアドレス", sub: "アドレス AND マスク", bits: ["11000000", "10101000", "00001010", "00000000"], dec: ["192", "168", "10", "0"], key: true},
    {t: "ブロードキャストアドレス", sub: "ホスト部をすべて1", bits: ["11000000", "10101000", "00001010", "11111111"], dec: ["192", "168", "10", "255"], key: true},
  ];
  const Y0 = 0.85, DY = 0.78;
  bracket(s, X[0], X[2] + W, Y0 - 0.16, "ネットワーク部  24ビット", NET.line);
  bracket(s, X[3], X[3] + W, Y0 - 0.16, "ホスト部  8ビット", HOST.line, {lw: 1.6});
  T(s, "10進数", {x: DX, y: Y0 - 0.5, w: 1.7, h: 0.3, fontSize: 13, bold: true, color: C.muted, align: "left", valign: "bottom"});

  rows.forEach((r, i) => {
    const y = Y0 + i * DY;
    const runs = [{text: r.t, options: {bold: true, fontSize: 14, color: C.navy, breakLine: !!r.sub}}];
    if (r.sub) runs.push({text: r.sub, options: {fontSize: 13.5, color: C.muted}});
    T(s, runs, {x: 0.2, y, w: 2.35, h: H, valign: "middle"});
    r.bits.forEach((b, j) => {
      const host = j === 3, pal = host ? HOST : NET, hot = r.key && host;
      cell(s, X[j], y, W, H, b, {mono: true, size: 14, fill: pal.bg, line: pal.line, color: hot ? C.pink : pal.text, bold: hot});
    });
    T(s, [
      {text: r.dec.slice(0, 3).join(".") + ".", options: {color: C.navy}},
      {text: r.dec[3], options: {color: r.key ? C.pink : C.navy}},
    ], {x: DX, y, w: 1.7, h: H, fontSize: 14, bold: true, valign: "middle"});
  });
  // 凡例（下端に横1列）
  const ly = Y0 + 4 * DY + 0.05;
  T(s, "凡例", {x: 0.2, y: ly, w: 0.6, h: 0.3, fontSize: 13, bold: true, color: C.muted, valign: "middle"});
  T(s, [{text: "abc", options: {color: C.pink, bold: true}}, {text: "  ホスト部をすべて0／すべて1にした値"}],
    {x: 0.85, y: ly, w: 7.5, h: 0.3, fontSize: 13, valign: "middle"});
  await save(p, out);
})();
