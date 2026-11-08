// 図4：AWS の VPC で CIDR が出てくる場所（割り当て・経路・許可）
const md = require("react-icons/md");
const L = require("./common.js");
const {C, T, ICON, icon, deck, node, arrow, save, MONO} = L;
Object.assign(ICON, {internet: md.MdPublic, igw: md.MdRouter, server: md.MdDns, route: md.MdAltRoute, shield: md.MdShield});
const out = process.argv[2] || "04_クラウドでCIDRが出てくる場所.pptx";
const P = (t, o = {}) => ({text: t, options: {color: C.pink, bold: true, ...o}});
const BLUE = C.blue, ORANGE = C.orange, TEAL = "138A7E", TEAL_BG = "E6F4F2";

// ラベル付きの枠（左上の内側に名前＋CIDR）
function zone(s, x, y, w, h, name, cidr, col, bg, o = {}) {
  s.addShape(o.dash ? "rect" : "roundRect", {x, y, w, h, rectRadius: 0.1, fill: o.dash ? {type: "none"} : {color: bg},
    line: {color: col, width: o.dash ? 1.75 : 1.25, dashType: o.dash ? "dash" : "solid"}});
  T(s, [{text: name + (o.two ? "" : "  "), options: {bold: true, color: col, breakLine: !!o.two}}, P(cidr, {fontFace: MONO})],
    {x: x + 0.14, y: y + 0.1, w: w - 0.28, h: o.two ? 0.55 : 0.3, fontSize: 14, valign: "top"});
}
// 見出し（アイコン＋名前＋分類）と表。CIDR の列はピンク・等幅
async function rules(s, x, y, w, ic, title, kind, head, rows, cidrCol, cw) {
  const hd = (t) => ({text: t, options: {bold: true, color: C.muted, fill: {color: "F1F3F4"}}});
  const tr = rows.map((r) => r.map((t, j) => ({text: t, options: j === cidrCol ? {fontFace: MONO, color: C.pink, bold: true} : {fontFace: MONO, color: C.text}})));
  s.addShape("roundRect", {x, y, w, h: 0.42, rectRadius: 0.06, fill: {color: TEAL_BG}, line: {color: TEAL, width: 1.25}});
  s.addImage({data: await icon(ic, TEAL), x: x + 0.1, y: y + 0.07, w: 0.28, h: 0.28});
  T(s, [{text: title, options: {bold: true, fontSize: 14}}, {text: "  " + kind, options: {fontSize: 13, color: C.muted}}],
    {x: x + 0.45, y, w: w - 0.5, h: 0.42, color: TEAL, valign: "middle"});
  s.addTable([head.map(hd), ...tr], {x, y: y + 0.48, w, colW: cw, rowH: 0.34, fontFace: "Helvetica Neue", fontSize: 13,
    border: {type: "solid", pt: 0.75, color: C.grid}, margin: [0, 0.08, 0, 0.08], valign: "middle", fill: {color: C.white}});
}

(async () => {
  const {p, s} = deck(5.9, 10.4);
  const CY = 2.3;
  // 外部・VPC・サブネット
  const inet = await node(s, 0.72, CY, 1.2, 1.05, "internet", "インターネット", null, ORANGE);
  zone(s, 2.75, 0.3, 7.5, 5.1, "VPC", "10.0.0.0/16", C.navy, null, {dash: true});
  zone(s, 3.5, 0.85, 3.25, 2.45, "パブリックサブネット", "10.0.1.0/24", BLUE, C.blueBg, {two: true});
  zone(s, 7.65, 0.85, 2.45, 2.45, "プライベートサブネット", "10.0.2.0/24", BLUE, C.blueBg, {two: true});
  const igw = await node(s, 2.75, CY, 0.9, 1.05, "igw", "IGW", null, C.navy, {fill: C.white});
  const web = await node(s, 5.85, CY, 1.65, 1.3, "server", "Web サーバ",
    [{text: "10.0.1.10", options: {fontFace: MONO}}, {text: "\n＋パブリック IP"}], BLUE);
  const db = await node(s, 8.9, CY, 1.5, 1.3, "db", "DB", [{text: "10.0.2.20", options: {fontFace: MONO}}], BLUE);
  arrow(s, [inet.r, igw.l], "TCP/443", {w: 0.8});
  arrow(s, [igw.r, web.l], "TCP/443", {w: 1.0});
  arrow(s, [web.r, db.l], "TCP/5432", {w: 0.85, dx: -0.21});

  // 経路と許可のルール
  const ty = 3.65;
  await rules(s, 2.92, ty, 2.38, "route", "ルートテーブル", "経路", ["宛先", "ターゲット"], [["10.0.0.0/16", "local"], ["0.0.0.0/0", "IGW"]], 0, [1.42, 0.96]);
  await rules(s, 5.4, ty, 2.3, "shield", "SG（Web）", "受信許可", ["ポート", "送信元"], [["443", "0.0.0.0/0"]], 1, [0.8, 1.5]);
  await rules(s, 7.85, ty, 2.25, "shield", "SG（DB）", "受信許可", ["ポート", "送信元"], [["5432", "10.0.1.0/24"]], 1, [0.8, 1.45]);
  const assoc = (x, y1, y2) => s.addShape("line", {x, y: y1, w: 0.0001, h: y2 - y1, line: {color: TEAL, width: 1.25, dashType: "dash"}});
  assoc(4.1, 3.3, ty); assoc(5.85, web.b[1], ty); assoc(8.9, db.b[1], ty);

  // 凡例
  const ly = 5.5;
  T(s, "凡例", {x: 0.2, y: ly, w: 0.6, h: 0.3, fontSize: 13, bold: true, color: C.muted, valign: "middle"});
  T(s, [P("abc", {fontFace: MONO}), {text: "  CIDR 表記"}], {x: 0.85, y: ly, w: 1.8, h: 0.3, fontSize: 13, valign: "middle"});
  s.addShape("line", {x: 2.75, y: ly + 0.15, w: 0.5, h: 0, line: {color: TEAL, width: 1.25, dashType: "dash"}});
  T(s, "ルールの適用先（サブネット・サーバ）", {x: 3.35, y: ly, w: 3.4, h: 0.3, fontSize: 13, valign: "middle"});
  s.addShape("roundRect", {x: 6.85, y: ly + 0.05, w: 0.4, h: 0.2, rectRadius: 0.04, fill: {color: C.white}, line: {color: ORANGE, width: 1.25}});
  T(s, "VPC の外", {x: 7.35, y: ly, w: 1.3, h: 0.3, fontSize: 13, valign: "middle"});
  await save(p, out);
})();
