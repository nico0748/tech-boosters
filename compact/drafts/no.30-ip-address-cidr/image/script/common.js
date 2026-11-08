// compact no.30 の図の共通設定（記事用 10in 幅の台紙、本文 13pt・見出し 14pt 以上）
const L = require("./lib.js");
const pptxgen = require("pptxgenjs");
const {C, T, FONT} = L;
const MONO = "Menlo";
// 配色：ネットワーク部＝青、ホスト部＝オレンジ、核心の値＝ピンク
const NET = {line: "2F5BD3", bg: "E3ECFC", text: "1F3A8A"};
const HOST = {line: "E37400", bg: "FFEFD9", text: "9A4A00"};

function deck(h, w = 10) {
  const p = new pptxgen();
  p.defineLayout({name: "ART", width: w, height: h});
  p.layout = "ART"; p.theme = {headFontFace: FONT.en, bodyFontFace: FONT.en}; p.author = "nico0748";
  const s = p.addSlide(); s.background = {color: C.white};
  return {p, s};
}
// 角丸でない箱に文字（等幅など）
function cell(s, x, y, w, h, text, o = {}) {
  s.addText(text, {shape: o.round ? "roundRect" : "rect", rectRadius: 0.06, x, y, w, h,
    fill: {color: o.fill || C.white}, line: o.line ? {color: o.line, width: o.lw || 1.25, dashType: o.dash ? "dash" : "solid"} : {type: "none"},
    fontFace: o.mono ? MONO : FONT.en, fontSize: o.size || 13, bold: !!o.bold, color: o.color || C.text,
    align: o.align || "center", valign: "middle", margin: o.margin ?? 0.03});
}
// 区間を示す括弧（上向きの角括弧）＋ラベル
function bracket(s, x1, x2, y, label, col, o = {}) {
  const t = 0.1;
  s.addShape("custGeom", {x: x1, y: y, w: x2 - x1, h: t, points: [{x: 0, y: t}, {x: 0, y: 0}, {x: x2 - x1, y: 0}, {x: x2 - x1, y: t}],
    fill: {type: "none"}, line: {color: col, width: 1.5}});
  const lw = Math.max(x2 - x1, o.lw || 2.2), cx = (x1 + x2) / 2;
  T(s, label, {x: cx - lw / 2, y: y - 0.34, w: lw, h: 0.3, fontSize: o.size || 14, bold: true, color: col, align: "center", valign: "bottom"});
}
module.exports = {...L, MONO, NET, HOST, deck, cell, bracket};
