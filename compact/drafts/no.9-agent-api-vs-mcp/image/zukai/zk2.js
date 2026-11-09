// zk2.js — zukai.js の上に「分類の色」を載せる補助（compact no.9 図2・図3用）
const Z = require("./zukai.js");
const md = require("react-icons/md");
const { C, T } = Z;

// 文字サイズ（記事幅 約800px で読める大きさ。図ごとに上書きする）
const F = {name: 14, duty: 13, lab: 13, sub: 13, frame: 14, head: 15, legend: 13};

// 分類の色（元の図のカラーデザインを維持）
const CAT = {
  net:  {line: "7B4FB0", fill: "F3EEFA"}, cmp: {line: "D9731A", fill: "FDF1E6"}, db: {line: "2E5E8E", fill: "EAF1F8"},
  sto:  {line: "1E8A82", fill: "E8F5F3"}, sec: {line: "C0392B", fill: "FBEEEC"}, msg: {line: "C2185B", fill: "FCE8F0"},
  ext:  {line: "2B3A4A", fill: "F3F4F6"}, host: {line: "1E8A82", fill: "E8F5F3"}, mcp: {line: "D9731A", fill: "FDF1E6"},
  cfg:  {line: "7B4FB0", fill: "F3EEFA"}, file: {line: "2E5E8E", fill: "EAF1F8"}, ant: {line: "2B3A4A", fill: "F3F4F6"},
  dev:  {line: "8D6E63", fill: "F5EFEB"},
};
Object.assign(Z.ICON, {
  translate: md.MdTranslate, queue: md.MdQueue, igw: md.MdRouter, badgeid: md.MdBadge,
  findpage: md.MdFindInPage, book: md.MdMenuBook, save: md.MdSave, json: md.MdDataObject,
  settings: md.MdSettings, cable: md.MdCable, code: md.MdCode, pkg: md.MdInventory2, quota: md.MdDataUsage,
});

// 文字幅のざっくり見積もり（インチ、全角1em）
function tw(str, pt) {let w = 0; for (const ch of str) w += /[\x00-\x7F]/.test(ch) ? 0.56 : 1.0; return w * pt / 72;}

// 番号バッジ（本文の手順番号）
function badge(s, cx, cy, n, d = 0.32) {
  s.addShape("ellipse", {x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: {color: C.title}, line: {color: C.white, width: 0.75}});
  T(s, String(n), {x: cx - d / 2, y: cy - d / 2, w: d, h: d, fontSize: F.lab, bold: true, color: C.white, align: "center", valign: "middle"});
}

// 矢印ラベル（番号バッジ＋文字）。align: l | r | c。y は1行目の中心
function lab(s, x, y, nums, text, o = {}) {
  const pt = o.pt || F.lab, bd = 0.32, lines = text.split("\n"), lh = pt / 72 * 1.22;
  const real = Math.max(...lines.map((l) => tw(l, pt))), textW = real * 1.1 + 0.1;
  const bw = nums.length ? nums.length * (bd + 0.03) + 0.03 : 0, W = bw + real + 0.04, H = lines.length * lh;
  const x0 = o.align === "r" ? x - W : o.align === "c" ? x - W / 2 : x, y0 = y - lh / 2;
  if (o.fill) s.addShape("rect", {x: x0 - 0.04, y: y0 - 0.02, w: W + 0.08, h: H + 0.04, fill: {color: o.fill === true ? C.white : o.fill}, line: {type: "none"}});
  nums.forEach((n, i) => badge(s, x0 + i * (bd + 0.03) + bd / 2, y, n));
  T(s, text, {x: x0 + bw, y: y0, w: textW, h: H, fontSize: pt, color: o.color || C.arrow, valign: "top", align: "left", lineSpacingMultiple: 0.95});
  return {x: x0, y: y0, w: W, h: H};
}

// アイコン（分類の色のタイル）＋名前＋責務。o: {pos: below|left, w, ul（開発者が作る・運用する）, plain（タイルなし）, fill}
async function node(s, icon, cx, cy, cat, name, duty, o = {}) {
  const c = CAT[cat], size = 0.62;
  if (!o.plain) {
    s.addShape("roundRect", {x: cx - size / 2, y: cy - size / 2, w: size, h: size, rectRadius: 0.1, fill: {color: c.fill}, line: {color: c.line, width: 1.25}});
    s.addImage({data: await Z.icon(icon, c.line), x: cx - 0.22, y: cy - 0.22, w: 0.44, h: 0.44, altText: name});
  } else s.addImage({data: await Z.icon(icon, c.line), x: cx - 0.31, y: cy - 0.31, w: 0.62, h: 0.62, altText: name});
  const nm = name.split("\n"), runs = [];
  nm.forEach((t, i) => runs.push({text: t, options: {bold: true, color: c.line, underline: o.ul ? {style: "sng"} : undefined, breakLine: i < nm.length - 1 || !!duty}}));
  if (duty) runs.push({text: duty, options: {fontSize: F.duty, bold: false, color: C.muted}});
  const tw0 = o.w || 2.2, th = 0.06 + nm.length * F.name / 72 * 1.25 + (duty ? F.duty / 72 * 1.25 : 0);
  const fl = o.fill ? {fill: {color: o.fill === true ? C.white : o.fill}} : {};
  if (o.pos === "left") T(s, runs, {x: cx - size / 2 - 0.1 - tw0, y: cy - th / 2, w: tw0, h: th, fontSize: F.name, align: "right", valign: "middle", ...fl});
  else T(s, runs, {x: cx - tw0 / 2, y: cy + size / 2 + 0.04, w: tw0, h: th, fontSize: F.name, align: "center", valign: "top", ...fl});
  const r = size / 2 + 0.02;
  return {cx, cy, l: [cx - r, cy], r: [cx + r, cy], t: [cx, cy - r], b: [cx, cy + size / 2 + (o.pos ? r : 0.06 + th)],
    lp: (dy) => [cx - r, cy + dy], rp: (dy) => [cx + r, cy + dy]};
}

// 物理的な境界（破線＋内側左上に名前）
function dframe(s, x, y, w, h, label, color = C.rule, width = 1.25) {
  s.addShape("rect", {x, y, w, h, fill: {type: "none"}, line: {color, width, dashType: "dash"}});
  if (label) T(s, label, {x: x + 0.12, y: y + 0.07, w: tw(label, F.frame) * 1.1 + 0.3, h: 0.3, fontSize: F.frame, bold: true, color});
}
// サブネット（淡い塗り＋角に名前）
const SUB = {pub: {fill: "EEF7EC", text: "3C8D40", name: "パブリック"}, priv: {fill: "EEF2F8", text: "4A6A8A", name: "プライベート"}};
function subnet(s, x, y, w, h, kind, align = "l") {
  const k = SUB[kind];
  s.addShape("rect", {x, y, w, h, fill: {color: k.fill}, line: {type: "none"}});
  T(s, k.name, {x: align === "r" ? x + w - 2.3 : x + 0.1, y: y + 0.05, w: 2.2, h: 0.27, fontSize: F.sub, bold: true, color: k.text, align: align === "r" ? "right" : "left"});
}
// 論理的なまとまり（淡い塗りの角丸＋上にピンクの下線付き見出し）
function lframe(s, x, y, w, h, heading, o = {}) {
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.18, fill: {color: o.fill || C.frame}, line: {type: "none"}});
  const hx = o.hx ?? (o.align === "l" ? x : null);  // hx：見出しの左端を指定（線をよけるとき）
  if (heading) T(s, heading, {x: hx ?? x - 0.6, y: y - 0.38, w: hx != null ? tw(heading, F.head) * 1.1 + 0.3 : w + 1.2, h: 0.32, fontSize: F.head, bold: true, color: C.pink,
    underline: {style: "sng"}, align: hx != null ? "left" : "center", valign: "middle"});
}

// 凡例（白い角丸、cols 列の格子）。items: [kind, text]
async function legend(s, x, y, cols, colW, items, title = "凡例") {
  const rh = 0.34, rows = Math.ceil(items.length / cols), w = 0.25 + cols * colW, h = 0.5 + rows * rh;
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.08, fill: {color: C.white}, line: {color: C.grid, width: 0.75}});
  T(s, title, {x: x + 0.14, y: y + 0.08, w: 1.2, h: 0.28, fontSize: F.legend, bold: true, color: C.muted});
  for (let i = 0; i < items.length; i++) {
    const [k, t] = items[i], col = Math.floor(i / rows), row = i % rows;
    const sx = x + 0.15 + col * colW, yy = y + 0.6 + row * rh, sw = {x: sx + 0.04, y: yy - 0.11, w: 0.52, h: 0.22};
    if (k.startsWith("cat:")) {const c = CAT[k.slice(4)]; s.addShape("roundRect", {x: sx + 0.17, y: yy - 0.13, w: 0.26, h: 0.26, rectRadius: 0.05, fill: {color: c.fill}, line: {color: c.line, width: 1.25}});}
    else if (k === "solid" || k === "dash") Z.arrow(s, [[sx, yy], [sx + 0.6, yy]], null, {dash: k === "dash"});
    else if (k === "dframe") s.addShape("rect", {...sw, fill: {type: "none"}, line: {color: C.rule, width: 1.25, dashType: "dash"}});
    else if (k === "pub" || k === "priv") s.addShape("rect", {...sw, fill: {color: SUB[k].fill}, line: {color: SUB[k].text, width: 0.5}});
    else if (k.startsWith("lframe")) s.addShape("roundRect", {...sw, rectRadius: 0.06, fill: {color: k.split(":")[1] || C.frame}, line: {type: "none"}});
    else if (k === "vpc") s.addShape("rect", {...sw, fill: {type: "none"}, line: {color: C.title, width: 1.75, dashType: "dash"}});
    else if (k === "ul") T(s, "名前", {...sw, fontSize: F.legend, bold: true, color: C.title, underline: {style: "sng"}, align: "center", valign: "middle"});
    else if (k === "num") badge(s, sx + 0.3, yy, 1);
    T(s, t, {x: sx + 0.7, y: yy - 0.15, w: colW - 0.72, h: 0.3, fontSize: F.legend, valign: "middle"});
  }
  return {x, y, w, h};
}
function note(s, x, y, w, h, text) {
  const f = 0.16;
  s.addShape("custGeom", {x, y, w, h, points: [{x: 0, y: 0}, {x: w - f, y: 0}, {x: w, y: f}, {x: w, y: h}, {x: 0, y: h}, {close: true}], fill: {color: C.note}, line: {color: C.noteLine, width: 0.75}});
  T(s, text, {x: x + 0.12, y: y + 0.08, w: w - 0.26, h: h - 0.16, fontSize: F.lab, valign: "middle"});
}
module.exports = {Z, C, T, F, CAT, SUB, tw, badge, lab, node, dframe, subnet, lframe, legend, note};
