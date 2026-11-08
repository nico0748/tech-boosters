// 図2 ITとOTのセキュリティの優先順位
const {Z, F, ACC, INK, MUTED, svgData, pres, T, arrow} = require("./lib.js");
const md = require("react-icons/md");

(async () => {
  const W = 10, H = 5.0;
  const p = pres(W, H, "ITとOTのセキュリティの優先順位");
  const s = p.addSlide({masterName: "CANVAS"});

  const BW = 3.55, BH = 0.86, XL = 0.35, XR = W - 0.35 - BW, ROW = [1.95, 2.97, 3.99];
  const PAL = {
    it: {main: ACC.it.c, fills: ["2F6FDB", "C9DBF8", "EEF4FD"], text: ["FFFFFF", INK, INK], sub: ["E3ECFB", MUTED, MUTED]},
    ot: {main: "3D4651", fills: ["3D4651", "C9CED6", "EEF0F3"], text: ["FFFFFF", INK, INK], sub: ["E5E8EC", MUTED, MUTED]},
  };
  const item = {
    C: ["機密性", "Confidentiality"], I: ["完全性", "Integrity"], A: ["可用性", "Availability"],
  };
  const desc = {
    it: {C: "機密データの漏えい防止", I: "データの改ざん防止", A: "短時間の停止は許容"},
    ot: {A: "物理プロセスの連続稼働", I: "計測値・制御ロジックの正しさ", C: "設計情報・運転データの保護"},
  };

  // 見出し（守る対象）
  const head = (x, side, Comp, label, target) => {
    const c = PAL[side].main;
    s.addImage({data: svgData(Comp, c), x, y: 0.25, w: 0.5, h: 0.5});
    T(s, [{text: label, options: {fontSize: 18, bold: true, color: c, breakLine: true}},
          {text: target, options: {fontSize: 12, color: MUTED}}], {x: x + 0.62, y: 0.2, w: BW - 0.62, h: 0.62, valign: "middle"});
  };
  head(XL, "it", md.MdStorage, "IT", "守る対象：データ");
  head(XR, "ot", md.MdFactory, "OT", "守る対象：物理プロセスと人");

  const box = (x, y, side, rank, key) => {
    const P = PAL[side], i = rank - 1;
    s.addShape("roundRect", {x, y, w: BW, h: BH, rectRadius: 0.08, fill: {color: P.fills[i]}, line: {color: P.main, width: 1.5}});
    // 順位バッジ
    s.addShape("ellipse", {x: x + 0.14, y: y + BH / 2 - 0.17, w: 0.34, h: 0.34, fill: {color: i === 0 ? "FFFFFF" : P.main}, line: {type: "none"}});
    T(s, String(rank), {x: x + 0.14, y: y + BH / 2 - 0.17, w: 0.34, h: 0.34, fontSize: 13, bold: true, color: i === 0 ? P.main : "FFFFFF", align: "center", valign: "middle"});
    T(s, key, {x: x + 0.56, y, w: 0.45, h: BH, fontSize: 24, bold: true, color: P.text[i], align: "center", valign: "middle"});
    T(s, [{text: item[key][0] + "  ", options: {fontSize: 14, bold: true, color: P.text[i]}},
          {text: item[key][1], options: {fontSize: 12, color: P.sub[i], breakLine: true}},
          {text: desc[side][key], options: {fontSize: 12, color: P.text[i]}}],
      {x: x + 1.08, y, w: BW - 1.15, h: BH, valign: "middle"});
    return {l: [x, y + BH / 2], r: [x + BW, y + BH / 2]};
  };
  const it = {C: box(XL, ROW[0], "it", 1, "C"), I: box(XL, ROW[1], "it", 2, "I"), A: box(XL, ROW[2], "it", 3, "A")};
  const ot = {A: box(XR, ROW[0], "ot", 1, "A"), I: box(XR, ROW[1], "ot", 2, "I"), C: box(XR, ROW[2], "ot", 3, "C")};

  // OT だけ CIA より上に「安全」
  const sy = 1.0, sh = 0.7;
  s.addShape("roundRect", {x: XR, y: sy, w: BW, h: sh, rectRadius: 0.08, fill: {color: ACC.ng.c}, line: {color: ACC.ng.c, width: 1.5}});
  s.addImage({data: svgData(md.MdHealthAndSafety, "FFFFFF"), x: XR + 0.13, y: sy + sh / 2 - 0.18, w: 0.36, h: 0.36});
  T(s, "最優先", {x: XR + 0.5, y: sy, w: 0.6, h: sh, fontSize: 12, bold: true, color: "FFFFFF", align: "center", valign: "middle"});
  T(s, [{text: "安全  ", options: {fontSize: 14, bold: true, color: "FFFFFF"}},
        {text: "Safety（CIA より上位）", options: {fontSize: 12, color: "FDECEC", breakLine: true}},
        {text: "人命・設備・環境の保護", options: {fontSize: 12, color: "FFFFFF"}}],
    {x: XR + 1.08, y: sy, w: BW - 1.15, h: sh, valign: "middle"});

  // 同じ要素どうしを結ぶ線（順位の入れ替わり）
  const L = (a, b, k1, k2, color) => arrow(s, [a.r, [a.r[0] + k1, a.r[1]], [b.l[0] - k2, b.l[1]], b.l], null, {head: "none", color, width: 2});
  L(it.I, ot.I, 0.3, 0.3, "9AA0A6");
  L(it.C, ot.C, 0.22, 0.62, "7C4DDB");
  L(it.A, ot.A, 0.62, 0.22, "138A7E");
  T(s, [{text: "C と A が入れ替わる", options: {bold: true, breakLine: true}}, {text: "（一般的な目安）", options: {color: MUTED}}],
    {x: XL + BW, y: ROW[0] - 0.62, w: XR - XL - BW, h: 0.5, fontSize: 12, color: INK, align: "center", valign: "bottom"});

  await Z.save(p, process.argv[2] || "02_ITとOTのセキュリティの優先順位.pptx");
})();
