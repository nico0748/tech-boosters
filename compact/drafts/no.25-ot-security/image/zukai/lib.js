// no.25 OTセキュリティ 図の共通部品（zukai.js の上に、スイムレーン＋アクセント色のお手本スタイル）
const Z = require("./zukai.js");
const React = require("react"), RDS = require("react-dom/server");
const pptxgen = require("pptxgenjs");

const F = {title: 13, sub: 12, lane: 14, laneSub: 12, arrow: 12, legend: 12};
const ACC = {
  it:   {c: "2F6FDB", bg: "EEF4FD"},
  dmz:  {c: "E07B1A", bg: "FFF4E6"},
  l3:   {c: "138A7E", bg: "EAF6F4"},
  l2:   {c: "7C4DDB", bg: "F5F1FD"},
  l1:   {c: "B83C78", bg: "FBEFF5"},
  l0:   {c: "4A5A6E", bg: "F1F3F6"},
  ok:   {c: "2E7D32", bg: "EDF6EE"},
  ng:   {c: "C62828", bg: "FDECEC"},
};
const INK = "1F2937", MUTED = "5F6368", ARROW = "3C4043";

function svgData(Comp, color, size = 256) {
  let svg = RDS.renderToStaticMarkup(React.createElement(Comp, {color: "#" + color, size}));
  svg = svg.replace(/currentColor/g, "#" + color);
  return "image/svg+xml;base64," + Buffer.from(svg).toString("base64");
}
function pres(w, h, title) {
  const p = new pptxgen();
  p.defineLayout({name: "ART", width: w, height: h}); p.layout = "ART";
  p.theme = {headFontFace: Z.FONT.en, bodyFontFace: Z.FONT.en}; p.title = title;
  p.defineSlideMaster({title: "CANVAS", background: {color: "FFFFFF"}, objects: []});
  return p;
}
const T = (s, text, o) => s.addText(text, {isTextBox: true, margin: 0, fontFace: Z.FONT.en, fontSize: F.sub, color: INK, valign: "top", ...o});

// ノード：白地＋アクセント枠、アイコン上中央、太字タイトル＋説明1行
function node(s, x, y, w, h, Comp, acc, title, sub, o = {}) {
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.08, fill: {color: o.fill || "FFFFFF"},
    line: {color: acc.c, width: 1.75, dashType: o.dash ? "dash" : "solid"}});
  const is = o.icon || 0.3;
  s.addImage({data: svgData(Comp, acc.c), x: x + w / 2 - is / 2, y: y + 0.07, w: is, h: is, altText: title});
  const runs = [{text: title, options: {bold: true, fontSize: F.title, color: INK, breakLine: !!sub}}];
  if (sub) runs.push({text: sub, options: {fontSize: F.sub, color: MUTED}});
  T(s, runs, {x: x + 0.04, y: y + 0.07 + is + 0.02, w: w - 0.08, h: h - is - 0.12, align: "center", valign: "top", lineSpacingMultiple: 0.95});
  return {l: [x, y + h / 2], r: [x + w, y + h / 2], t: [x + w / 2, y], b: [x + w / 2, y + h], x, y, w, h, cx: x + w / 2};
}
// 矢印（zukai.arrow を流用）。ラベルは12pt
function arrow(s, pts, label, o = {}) {
  const save = Z.FS.arrow; Z.FS.arrow = F.arrow;
  Z.arrow(s, pts, label, {color: o.color || ARROW, width: o.width || 1.5, ...o});
  Z.FS.arrow = save;
}
function pill(s, x, y, w, h, text, color, o = {}) {
  s.addShape("roundRect", {x, y, w, h, rectRadius: h / 2, fill: {color}, line: {color: "FFFFFF", width: 1}});
  T(s, text, {x, y, w, h, fontSize: o.size || 12, bold: true, color: "FFFFFF", align: "center", valign: "middle"});
}
module.exports = {Z, F, ACC, INK, MUTED, ARROW, svgData, pres, T, node, arrow, pill};
