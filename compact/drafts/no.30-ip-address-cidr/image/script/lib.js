// 図生成の共通部品（スイムレーン＋アイコン付きノード、tech-boosters の図のルール準拠）
const pptxgen = require("pptxgenjs"), JSZip = require("jszip"), fs = require("fs");
const React = require("react"), RDS = require("react-dom/server");
const sharp = require("sharp"), md = require("react-icons/md"), tb = require("react-icons/tb");

const FONT = {ja: "Hiragino Sans", en: "Helvetica Neue"};
const C = {navy: "1F2A44", text: "222222", muted: "5F6368", arrow: "3C4043", grid: "D5DAE1", white: "FFFFFF",
  blue: "2F5BD3", blueBg: "EEF3FD", red: "C0392B", redBg: "FCEEEC", orange: "E37400", orangeBg: "FFF4E5",
  pink: "D81B60", green: "1E8E3E", slate: "2B3A4A"};
const ICON = {user: md.MdPerson, embed: md.MdScatterPlot, db: tb.TbDatabase, llm: md.MdPsychology, code: md.MdCode,
  web: md.MdWeb, repo: tb.TbBrandGit, hacker: md.MdPersonOff, dna: md.MdAutorenew, pool: md.MdTextFields,
  calc: md.MdFunctions, search: md.MdSearch, box: md.MdViewInAr, target: md.MdGpsFixed, insert: md.MdInput,
  rank: md.MdFormatListNumbered, lock: md.MdLock, check: md.MdVerified, warn: md.MdWarning};

async function icon(name, color) {
  let svg = RDS.renderToStaticMarkup(React.createElement(ICON[name], {color: "#" + color, size: 256}));
  svg = svg.replace(/currentColor/g, "#" + color);
  return "image/svg+xml;base64," + Buffer.from(svg).toString("base64");
}
const T = (s, text, o) => s.addText(text, {isTextBox: true, margin: 0, fontFace: FONT.en, fontSize: 12, color: C.text, valign: "top", ...o});

function deck() {
  const p = new pptxgen(); p.layout = "LAYOUT_WIDE"; p.theme = {headFontFace: FONT.en, bodyFontFace: FONT.en};
  p.author = "nico0748";
  return p;
}

// スイムレーン：左に見出し列（アイコン＋太字名＋補足）、左端に濃い帯
async function lane(s, y, h, name, sub, col, bg, ic, o = {}) {
  const x = 0.25, w = 12.83, hw = 1.75;
  s.addShape("rect", {x, y, w, h, fill: {color: o.plain ? C.white : bg}, line: {color: C.grid, width: 0.75}});
  s.addShape("rect", {x, y, w: hw, h, fill: {color: bg}, line: {color: C.grid, width: 0.75}});
  s.addShape("rect", {x, y, w: 0.09, h, fill: {color: col}, line: {type: "none"}});
  const cy = y + h / 2;
  s.addImage({data: await icon(ic, col), x: x + 0.2, y: cy - 0.42, w: 0.36, h: 0.36});
  T(s, name, {x: x + 0.2, y: cy - 0.02, w: hw - 0.3, h: 0.3, fontSize: 14, bold: true, color: col});
  if (sub) T(s, sub, {x: x + 0.2, y: cy + 0.28, w: hw - 0.3, h: 0.5, fontSize: 12, color: C.muted});
}

// ノード：白地（または fill）＋アクセント色の枠、上にアイコン、太字タイトル＋説明（2行以内）
// title/desc は文字列か runs 配列
async function node(s, cx, cy, w, h, ic, title, desc, col, o = {}) {
  const x = cx - w / 2, y = cy - h / 2;
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.1, fill: {color: o.fill || C.white},
    line: {color: col, width: o.bold ? 2.25 : 1.5, dashType: o.dash ? "dash" : "solid"}});
  s.addImage({data: await icon(ic, col), x: cx - 0.19, y: y + 0.1, w: 0.38, h: 0.38});
  const runs = [];
  const add = (v, base) => (Array.isArray(v) ? v : [{text: v}]).forEach((r) => runs.push({text: r.text, options: {...base, ...(r.options || {})}}));
  add(title, {bold: true, fontSize: 13, color: C.navy});
  if (desc) { runs[runs.length - 1].options.breakLine = true; add(desc, {fontSize: 12, color: C.muted}); }
  T(s, runs, {x: x + 0.06, y: y + 0.52, w: w - 0.12, h: h - 0.58, align: "center", lineSpacingMultiple: 0.95});
  if (o.badge) badge(s, x + w - 0.1, y, o.badge, o.badgeColor || col);
  return {l: [x, cy], r: [x + w, cy], t: [cx, y], b: [cx, y + h], x, y, w, h};
}
function badge(s, rx, y, text, col) {
  const w = 0.16 + text.length * 0.17;
  s.addText(text, {shape: "roundRect", rectRadius: 0.1, x: rx - w, y: y - 0.14, w, h: 0.28, fill: {color: col},
    line: {color: C.white, width: 0.75}, fontFace: FONT.en, fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle", margin: 0});
}

// 矢印（細い直線＋小三角）。ラベルは矢印の上（横線）／横（縦線）
function arrow(s, pts, label, o = {}) {
  const line = {color: o.color || C.arrow, width: o.width || 1.5, dashType: o.dash ? "dash" : "solid", endArrowType: "triangle"};
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]), x0 = Math.min(...xs), y0 = Math.min(...ys);
  if (pts.length === 2) {
    const [[x1, y1], [x2, y2]] = pts;
    s.addShape("line", {x: x0, y: y0, w: Math.max(Math.abs(x2 - x1), 0.0001), h: Math.max(Math.abs(y2 - y1), 0.0001), flipH: x2 < x1, flipV: y2 < y1, line});
  } else s.addShape("custGeom", {x: x0, y: y0, w: Math.max(Math.max(...xs) - x0, 0.01), h: Math.max(Math.max(...ys) - y0, 0.01),
    points: pts.map(([x, y]) => ({x: x - x0, y: y - y0})), fill: {type: "none"}, line});
  if (!label) return;
  const i = o.seg ?? Math.floor((pts.length - 1) / 2), [a, b] = [pts[i], pts[i + 1]];
  const mx = (a[0] + b[0]) / 2 + (o.dx || 0), my = (a[1] + b[1]) / 2 + (o.dy || 0);
  const horiz = Math.abs(b[1] - a[1]) < Math.abs(b[0] - a[0]), lw = o.w || 1.6, lh = o.h || 0.3;
  const box = horiz ? {x: mx - lw / 2, y: o.below ? my + 0.04 : my - lh - 0.03, w: lw, h: lh, align: "center", valign: o.below ? "top" : "bottom"}
    : {x: o.left ? mx - lw - 0.08 : mx + 0.08, y: my - lh / 2, w: lw, h: lh, align: o.left ? "right" : "left", valign: "middle"};
  const runs = Array.isArray(label) ? label : [{text: label}];
  T(s, runs.map((r) => ({text: r.text, options: {...(r.options || {})}})), {...box, fontSize: o.size || 13, color: o.color || C.muted, fill: o.fill ? {color: C.white} : undefined});
}

function fixFonts(f, x) {
  if (/^ppt\/theme\/theme\d+\.xml$/.test(f)) return x.replace(/<a:latin typeface="[^"]*"[^>]*\/>/g, `<a:latin typeface="${FONT.en}"/>`)
    .replace(/<a:ea typeface="[^"]*"[^>]*\/>/g, `<a:ea typeface="${FONT.ja}"/>`).replace(/(<a:font script="Jpan" typeface=")[^"]*/g, `$1${FONT.ja}`);
  return x.replace(/<a:ea typeface="(?!\+)[^"]*"[^>]*\/>/g, `<a:ea typeface="${FONT.ja}" pitchFamily="34" charset="-128"/>`);
}
async function save(p, file) {
  const src = await JSZip.loadAsync(await p.write({outputType: "nodebuffer"})), out = new JSZip();
  for (const f of Object.keys(src.files)) {
    if (src.files[f].dir) continue;
    let data = await src.file(f).async("nodebuffer");
    const m = f.match(/^ppt\/media\/image-(\d+)-(\d+)\.png$/), svg = m && src.file(`ppt/media/image-${m[1]}-${+m[2] + 1}.svg`);
    if (svg) data = await sharp(await svg.async("nodebuffer"), {density: 300}).resize(256, 256, {fit: "contain", background: {r: 0, g: 0, b: 0, alpha: 0}}).png().toBuffer();
    if (/^ppt\/.*\.xml$/.test(f)) {
      let x = fixFonts(f, data.toString("utf8"));
      x = x.replace(/(<a:(?:rPr|endParaRPr|defRPr)\b[^>]*?) lang="en-US"(?![^>]*altLang)/g, '$1 lang="ja-JP" altLang="en-US"');
      data = Buffer.from(x);
    }
    out.file(f, data, {createFolders: false});
  }
  fs.writeFileSync(file, await out.generateAsync({type: "nodebuffer", compression: "DEFLATE"}));
}
module.exports = {C, FONT, ICON, icon, T, deck, lane, node, badge, arrow, save};
