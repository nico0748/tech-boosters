// no.27 用の追加部品（アイコン・ピル・注記）
const L = require("./lib.js"), md = require("react-icons/md"), tb = require("react-icons/tb");
Object.assign(L.ICON, {doc: md.MdDescription, cut: md.MdContentCut, note: md.MdPostAdd, edit: md.MdEditNote,
  merge: md.MdCallMerge, sort: md.MdSort, data: md.MdFactCheck, chart: md.MdInsights, help: md.MdHelpOutline, chat: md.MdChatBubbleOutline, angle: tb.TbAngle});
Object.assign(L.C, {teal: "138A7E", tealBg: "E7F5F3", purple: "6A3FC8", purpleBg: "F2EEFB", yellowBg: "FFF8D6", yellow: "C9A400"});
// テキストだけの小さい角丸ボックス
function pill(s, cx, cy, w, h, runs, col, o = {}) {
  const r = (Array.isArray(runs) ? runs : [{text: runs}]).map((x) => ({text: x.text, options: {...(x.options || {})}}));
  s.addText(r, {shape: "roundRect", rectRadius: 0.08, x: cx - w / 2, y: cy - h / 2, w, h, fill: {color: o.fill || L.C.white},
    line: {color: col, width: o.bold ? 2 : 1.25, dashType: o.dash ? "dash" : "solid"}, fontFace: o.mono ? "Menlo" : L.FONT.en,
    fontSize: o.fs || 14, bold: !!o.b, color: o.color || L.C.navy, align: "center", valign: "middle", margin: 2});
  return {l: [cx - w / 2, cy], r: [cx + w / 2, cy], t: [cx, cy - h / 2], b: [cx, cy + h / 2]};
}
// 黄色の注記
function memo(s, x, y, w, h, runs) {
  const r = (Array.isArray(runs) ? runs : [{text: runs}]).map((q) => ({text: q.text, options: {...(q.options || {})}}));
  s.addText(r, {shape: "rect", x, y, w, h, fill: {color: L.C.yellowBg}, line: {color: L.C.yellow, width: 1},
    fontFace: L.FONT.en, fontSize: 13, color: L.C.text, align: "left", valign: "middle", margin: 6});
}
module.exports = {...L, pill, memo};
