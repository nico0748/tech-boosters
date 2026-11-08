// TLP 図の共通部品（lib.js に追加）
const L = require("./lib.js");
const md = require("react-icons/md");
Object.assign(L.ICON, {person: md.MdPerson, org: md.MdBusiness, clients: md.MdHandshake, community: md.MdGroups,
  world: md.MdPublic, report: md.MdDescription, inbox: md.MdMarkEmailRead, share: md.MdShare, gavel: md.MdGavel,
  block: md.MdBlock, mail: md.MdEmail, doc: md.MdArticle, shield: md.MdShield});
// TLP 2.0 の指定色（文字）。背景は黒 RGB(0,0,0)
const TLP = {RED: "FF0033", AMBER: "FFC000", GREEN: "33FF00", CLEAR: "FFFFFF"};
// 白地の図で使う、読みやすい線色・淡い塗り
const LINE = {RED: "D6002B", AMBER: "C98A00", GREEN: "2E9E1F", CLEAR: "8A9099"};
const TINT = {RED: "FFE5EA", AMBER: "FFF3D1", GREEN: "E3F8DD", CLEAR: "F3F4F6"};
function pill(s, x, y, w, h, label, o = {}) {
  const col = TLP[label.replace("+STRICT", "")];
  s.addText([{text: "TLP:", options: {color: col}}, {text: label, options: {color: col}}], {shape: "roundRect", rectRadius: 0.06,
    x, y, w, h, fill: {color: "000000"}, line: {type: "none"}, fontFace: "Menlo", fontSize: o.fs || 14, bold: true,
    align: "center", valign: "middle", margin: 0});
}
module.exports = {...L, TLP, LINE, TINT, pill};
