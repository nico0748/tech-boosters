// zukai.js — 図解ベストプラクティス集と同じ見た目で図を描くヘルパー（pptxgenjs 3.x/4.x）
const pptxgen = require("pptxgenjs"), JSZip = require("jszip"), fs = require("fs");
const React = require("react"), RDS = require("react-dom/server");
const sharp = require("sharp"), md = require("react-icons/md"), tb = require("react-icons/tb");

const C = { title: "2B3550", rule: "3B5BDB", pink: "D81B60", frame: "E8F1FC", frameLine: "C9DDF7", icon: "4285F4",
  label: "1A56C8", arrow: "3C4043", text: "222222", muted: "5F6368", grid: "DADCE0", gray: "9AA0A6",
  grayFill: "F1F3F4", err: "D93025", note: "FFF8E1", noteLine: "D4B44A", white: "FFFFFF" };
const FONT = "Meiryo";
const FS = { label: 10, sub: 9.5, arrow: 10, box: 11 };   // article() で一回り大きくなる
const ICON = { user: md.MdPerson, admin: md.MdAdminPanelSettings, mobile: md.MdPhoneIphone, pc: md.MdComputer,
  web: md.MdWeb, browser: md.MdWeb, api: md.MdApi, server: md.MdDns, dns: md.MdDns, container: md.MdViewInAr,
  function: md.MdBolt, db: tb.TbDatabase, cache: md.MdSpeed, queue: md.MdHub, storage: md.MdFolder, mail: md.MdEmail,
  chat: md.MdChat, payment: md.MdPayment, lb: md.MdCallSplit, fw: md.MdShield, router: md.MdRouter, nat: md.MdSwapHoriz,
  vpn: md.MdVpnLock, internet: md.MdPublic, cdn: md.MdCloud, monitor: md.MdAnalytics, search: md.MdSearch,
  lock: md.MdLock, key: md.MdVpnKey, cert: md.MdVerifiedUser, schedule: md.MdSchedule, dashboard: md.MdDashboard,
  ai: md.MdPsychology, doc: md.MdDescription, ocr: md.MdDocumentScanner, camera: md.MdPhotoCamera, group: md.MdGroups,
  csv: md.MdUploadFile, batch: md.MdSync, report: md.MdAssessment };   // 足りなければ Z.ICON.xxx = md.MdXxx で追加

const cache = {};
async function icon(name, color = C.icon) {          // SVG（PowerPointで色を変えられる）。代替PNGは save() が直す
  const k = name + color; if (cache[k]) return cache[k];
  if (name !== "ext" && !ICON[name]) console.warn(`zukai: icon "${name}" がないので立方体で代用`);
  let svg = name === "ext"                             // 外部サービス＝オレンジの立方体
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 100 100"><g stroke="#202124" stroke-width="4" stroke-linejoin="round"><polygon points="50,8 90,26 50,44 10,26" fill="#FDE293"/><polygon points="10,26 50,44 50,92 10,74" fill="#F9AB00"/><polygon points="90,26 50,44 50,92 90,74" fill="#FBBC04"/></g></svg>`
    : RDS.renderToStaticMarkup(React.createElement(ICON[name] || md.MdViewInAr, { color: "#" + color, size: 256 }));
  svg = svg.replace(/currentColor/g, "#" + color);
  return (cache[k] = "image/svg+xml;base64," + Buffer.from(svg).toString("base64"));
}
const T = (s, text, o) => s.addText(text, { isTextBox: true, margin: 0, fontFace: FONT, fontSize: FS.box, color: C.text, valign: "top", ...o });

function base(layout, meta = {}) {
  const p = new pptxgen(); p.layout = layout; p.theme = { headFontFace: FONT, bodyFontFace: FONT };
  Object.assign(p, { title: meta.title || "図", author: meta.author || "", company: meta.company || "", subject: meta.subject || "" }); // & は &amp; と書く
  p.defineSlideMaster({ title: "CANVAS", background: { color: C.white }, objects: [] });
  return p;
}
// 資料用（13.333×7.5in）。footer に「資料名 v0.1（日付）」
function deck(footer = "", meta) {
  Object.assign(FS, { label: 10, sub: 9.5, arrow: 10, box: 11 });
  const p = base("LAYOUT_WIDE", meta);
  p.defineSlideMaster({ title: "ZUKAI", background: { color: C.white }, objects: [
    { line: { x: 0.3, y: 0.92, w: 12.73, h: 0, line: { color: C.rule, width: 2.25 } } },
    { text: { text: footer, options: { x: 0.45, y: 7.08, w: 8, h: 0.25, fontSize: 9, color: C.gray, margin: 0, fontFace: FONT } } },
    { placeholder: { options: { name: "title", type: "title", x: 0.45, y: 0.2, w: 12.4, h: 0.66, fontSize: 24, bold: true, color: C.title, align: "left", valign: "middle", margin: 0, fontFace: FONT }, text: "タイトル" } }],
    slideNumber: { x: 12.38, y: 7.06, w: 0.5, h: 0.28, fontSize: 9, color: C.gray, align: "right" } });
  return p;
}
// 記事用（10×5.625in、文字を一回り大きく）。canvas() でタイトルなしのページを作る
function article(meta) { Object.assign(FS, { label: 12, sub: 11, arrow: 11.5, box: 12 }); return base("LAYOUT_16x9", meta); }

function slide(p, title, point, notes) {            // タイトル（全角36字以内）＋青い罫線＋POINT行
  const s = p.addSlide({ masterName: "ZUKAI" }); s.addText(title, { placeholder: "title" });
  if (point) {
    s.addShape("roundRect", { x: 0.45, y: 1.02, w: 0.78, h: 0.27, rectRadius: 0.13, fill: { color: C.pink }, line: { type: "none" } });
    T(s, "POINT", { x: 0.45, y: 1.02, w: 0.78, h: 0.27, fontSize: 10, bold: true, color: C.white, align: "center", valign: "middle" });
    T(s, point, { x: 1.35, y: 1.0, w: 11.5, h: 0.31, fontSize: 12, color: C.title, valign: "middle" });
  }
  if (notes) s.addNotes(notes);
  return s;
}
const canvas = (p, notes) => { const s = p.addSlide({ masterName: "CANVAS" }); if (notes) s.addNotes(notes); return s; };

// 枠。既定＝論理のまとまり（淡い青＋上にピンク下線見出し）
// o.dashed：物理境界・既存（破線＋内側左上に名前、o.line で色）／o.scope：提案範囲（塗りなし＋ピンク線）
// o.future：将来フェーズ（ピンク破線）／o.border：UMLのシステム境界・パッケージ外枠（白＋紺線、内側上に名前）
function frame(s, x, y, w, h, heading, o = {}) {
  if (o.dashed || o.future) {
    const col = o.line || (o.future ? C.pink : C.rule);
    s.addShape("rect", { x, y, w, h, fill: { type: "none" }, line: { color: col, width: 1.25, dashType: "dash" } });
    if (heading) T(s, heading, { x: x + 0.12, y: y + 0.08, w: w - 0.24, h: 0.26, fontSize: FS.label + 0.5, bold: true, color: col });
  } else if (o.border) {
    s.addShape("rect", { x, y, w, h, fill: { color: C.white }, line: { color: C.title, width: 1.25 } });
    if (heading) T(s, heading, { x: x + 0.15, y: y + 0.1, w: w - 0.3, h: 0.28, fontSize: FS.box, bold: true, color: C.title });
  } else {
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.25, fill: o.scope ? { type: "none" } : { color: o.fill || C.frame }, line: o.scope ? { color: C.pink, width: 1.5 } : { type: "none" } });
    if (heading) T(s, heading, { x, y: y - 0.36, w, h: 0.3, fontSize: FS.label + 2, bold: true, color: o.headColor || C.pink, underline: o.headColor ? undefined : { style: "sng" }, align: "center", valign: "middle" });
  }
}

// アイコン＋名前＋責務1行（全角12字以内）。o は kind 文字列か {kind, size, w（文字幅）, badge（要件番号）}
// kind: "self"(既定・青下線) | "user"(青・下線なし) | "ext"(外部・立方体) | "legacy"(既存・灰)
async function node(s, name, cx, cy, label, duty, o = {}) {
  if (typeof o === "string") o = { kind: o };
  const kind = o.kind || "self", size = o.size || 0.62, tw = o.w || 1.8, col = kind === "legacy" ? C.gray : C.icon;
  s.addImage({ data: await icon(kind === "ext" ? "ext" : name, col), x: cx - size / 2, y: cy - size / 2, w: size, h: size, altText: label });
  const runs = [{ text: label, options: { bold: true, color: kind === "ext" ? C.text : kind === "legacy" ? C.muted : C.label,
    underline: kind === "self" ? { style: "sng" } : undefined, breakLine: !!duty } }];
  if (duty) runs.push({ text: duty, options: { fontSize: FS.sub, color: C.muted } });
  T(s, runs, { x: cx - tw / 2, y: cy + size / 2 + 0.04, w: tw, h: 0.55, fontSize: FS.label, align: "center" });
  if (o.badge != null) badge(s, cx - size / 2 - 0.12, cy - size / 2 - 0.06, o.badge);
  const r = size / 2 + 0.06;   // b は名前・責務の下から出す（文字に矢印を重ねない）
  return { l: [cx - r, cy], r: [cx + r, cy], t: [cx, cy - r], b: [cx, cy + size / 2 + (duty ? 0.62 : 0.36)] };
}

// 矢印。pts=[[x,y],...]（3点以上で折れ線）。o: {dash（非同期・開矢じり）, open, num, below, left, w（ラベル幅）,
//   seg（ラベルを置く区間。既定は真ん中）, dx, dy（微調整）, h（ラベル高さ。2行なら0.55）, fill（白の下地で線を隠す）, color, width, head:"none"}
// label は文字列か [{text, options:{color: C.pink}}] の配列（一部だけ色を変える時）
function arrow(s, pts, label, o = {}) {
  const line = { color: o.color || C.arrow, width: o.width || 1.25, dashType: o.dash ? "dash" : "solid",
    endArrowType: o.head === "none" ? undefined : (o.open ?? !!o.dash) ? "arrow" : "triangle" };
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]), x0 = Math.min(...xs), y0 = Math.min(...ys);
  if (pts.length === 2) {
    const [[x1, y1], [x2, y2]] = pts;
    s.addShape("line", { x: x0, y: y0, w: Math.max(Math.abs(x2 - x1), 0.0001), h: Math.max(Math.abs(y2 - y1), 0.0001), flipH: x2 < x1, flipV: y2 < y1, line });
  } else s.addShape("custGeom", { x: x0, y: y0, w: Math.max(Math.max(...xs) - x0, 0.01), h: Math.max(Math.max(...ys) - y0, 0.01),
    points: pts.map(([x, y]) => ({ x: x - x0, y: y - y0 })), fill: { type: "none" }, line });
  const runs = Array.isArray(label) ? label : label ? [{ text: label }] : [];
  if (o.num) runs.unshift({ text: `${o.num}  ` });
  if (!runs.length) return;
  const i = o.seg ?? Math.floor((pts.length - 1) / 2), [a, b] = [pts[i], pts[i + 1]], mx = (a[0] + b[0]) / 2 + (o.dx || 0), my = (a[1] + b[1]) / 2 + (o.dy || 0);
  const horiz = Math.abs(b[1] - a[1]) < Math.abs(b[0] - a[0]), lw = o.w || 1.5, lh = o.h || 0.32;
  const box = horiz ? { x: mx - lw / 2, y: o.below ? my + 0.04 : my - lh - 0.04, w: lw, h: lh, align: "center", valign: o.below ? "top" : "bottom" }
    : { x: o.left ? mx - lw - 0.08 : mx + 0.08, y: my - lh / 2, w: lw, h: lh, align: o.left ? "right" : "left", valign: "middle" };
  const flat = runs.flatMap((r) => r.text.split("\n").map((t, j, a) => ({ text: t, options: { ...r.options, breakLine: j < a.length - 1 } })));
  T(s, flat, { ...box, fontSize: FS.arrow, color: o.color || C.arrow, fill: o.fill ? { color: C.white } : undefined });
}
function badge(s, cx, cy, n, fill = C.title) {        // 要件番号・通信番号の丸数字
  s.addShape("ellipse", { x: cx - 0.13, y: cy - 0.13, w: 0.26, h: 0.26, fill: { color: fill }, line: { color: C.white, width: 0.75 } });
  T(s, String(n), { x: cx - 0.13, y: cy - 0.13, w: 0.26, h: 0.26, fontSize: 9, bold: true, color: C.white, align: "center", valign: "middle" });
}
function note(s, x, y, w, h, text) {                 // 折り返し付き注記（LibreOfficeでも描画される custGeom）
  const f = Math.min(0.16, h / 3);
  s.addShape("custGeom", { x, y, w, h, points: [{ x: 0, y: 0 }, { x: w - f, y: 0 }, { x: w, y: f }, { x: w, y: h }, { x: 0, y: h }, { close: true }], fill: { color: C.note }, line: { color: C.noteLine, width: 0.75 } });
  s.addShape("custGeom", { x: x + w - f, y, w: f, h: f, points: [{ x: 0, y: 0 }, { x: 0, y: f }, { x: f, y: f }, { close: true }], fill: { color: "F3E3A6" }, line: { color: C.noteLine, width: 0.75 } });
  T(s, text, { x: x + 0.1, y: y + 0.06, w: w - 0.26, h: h - 0.12, fontSize: FS.sub, valign: "middle" });
}
// 表（要件の対応表など）。rows[0] が見出し行。colW はインチの配列
function table(s, x, y, rows, colW) {
  const cell = (t, head) => ({ text: String(t), options: { bold: head, color: C.title, fill: { color: head ? C.frame : C.white } } });
  s.addTable(rows.map((r, i) => r.map((t) => cell(t, i === 0))), { x, y, colW, fontFace: FONT, fontSize: FS.sub + 1,
    border: { type: "solid", pt: 0.75, color: C.grid }, margin: 0.05, valign: "middle" });
}
// 凡例。kind: solid/dash/open/reply（矢印）, frame, dframe（青破線）, gframe（灰破線）, scope, future, ext, legacy,
//   extbox（灰の箱＝記法の図の外部）, accent（ピンク文字＝強調した値）, num, note, または icon名
// o.horizontal：下端に横1列で置く（o.colW で1項目の幅）
async function legend(s, x, y, items, w = 2.3, o = {}) {
  const hz = !!o.horizontal, cw = o.colW || 2.0, h = hz ? 0.42 : 0.34 + items.length * 0.27, ww = hz ? 0.7 + items.length * cw : w;
  s.addShape("roundRect", { x, y, w: ww, h, rectRadius: 0.08, fill: { color: C.white }, line: { color: C.grid, width: 0.75 } });
  T(s, "凡例", { x: x + 0.12, y: hz ? y + 0.1 : y + 0.06, w: 0.6, h: 0.22, fontSize: FS.sub, bold: true, color: C.muted });
  for (let i = 0; i < items.length; i++) {
    const [k, t] = items[i], sx = hz ? x + 0.7 + i * cw : x + 0.15, yy = hz ? y + h / 2 : y + 0.42 + i * 0.27, r = { x: sx + 0.03, y: yy - 0.09, w: 0.5, h: 0.18 };
    if (["solid", "dash", "open", "reply"].includes(k)) arrow(s, [[sx, yy], [sx + 0.55, yy]], null, { dash: k === "dash" || k === "reply", open: k !== "solid" });
    else if (k === "frame") s.addShape("roundRect", { ...r, rectRadius: 0.05, fill: { color: C.frame }, line: { type: "none" } });
    else if (k === "scope") s.addShape("roundRect", { ...r, rectRadius: 0.05, fill: { type: "none" }, line: { color: C.pink, width: 1.5 } });
    else if (["dframe", "gframe", "future"].includes(k)) s.addShape("rect", { ...r, fill: { type: "none" }, line: { color: k === "future" ? C.pink : k === "gframe" ? C.gray : C.rule, width: 1, dashType: "dash" } });
    else if (k === "num") badge(s, sx + 0.28, yy, 1);
    else if (k === "extbox") s.addShape("rect", { ...r, fill: { color: C.grayFill }, line: { color: C.muted, width: 1 } });
    else if (k === "accent") T(s, "abc", { ...r, fontSize: FS.sub, bold: true, color: C.pink, align: "center", valign: "middle" });
    else if (k === "note") note(s, sx + 0.08, yy - 0.1, 0.4, 0.2, "");
    else s.addImage({ data: await icon(k === "ext" ? "ext" : k === "legacy" ? "server" : k, k === "legacy" ? C.gray : C.icon), x: sx + 0.17, y: yy - 0.11, w: 0.22, h: 0.22 });
    T(s, t, { x: sx + 0.68, y: yy - 0.12, w: (hz ? cw : w - 0.2) - 0.7, h: 0.24, fontSize: FS.sub, valign: "middle" });
  }
  return { x, y, w: ww, h };
}

// ---- 記法の図形（UML・DFD） ----
// box：アクション・状態（roundRect 既定）、クラス・ライフライン（rect）、ユースケース・DFDプロセス（ellipse）
// o: {shape, ext（灰＝外部・«actor»）, fill, bold, size}。返り値は l/r/t/b の端点
function box(s, x, y, w, h, text, o = {}) {
  s.addText(text, { shape: o.shape || "roundRect", rectRadius: 0.1, x, y, w, h, fill: { color: o.fill || (o.ext ? C.grayFill : C.white) },
    line: { color: o.ext ? C.muted : C.icon, width: 1.25 }, fontFace: FONT, fontSize: o.size || FS.box, bold: o.bold ?? true,
    color: C.title, align: "center", valign: "middle", margin: 0.04 });
  return { l: [x, y + h / 2], r: [x + w, y + h / 2], t: [x + w / 2, y], b: [x + w / 2, y + h] };
}
const usecase = (s, cx, cy, text, w = 2.4, h = 0.62) => box(s, cx - w / 2, cy - h / 2, w, h, text, { shape: "ellipse" });
const process = (s, cx, cy, text, d = 1.1) => box(s, cx - d / 2, cy - d / 2, d, d, text, { shape: "ellipse", fill: C.frame, size: FS.label });
function store(s, x, y, w, text) {                    // DFDのデータストア（上下2本線）
  s.addShape("line", { x, y, w, h: 0, line: { color: C.icon, width: 1.25 } });
  s.addShape("line", { x, y: y + 0.45, w, h: 0, line: { color: C.icon, width: 1.25 } });
  T(s, text, { x, y, w, h: 0.45, fontSize: FS.label, bold: true, color: C.title, align: "center", valign: "middle" });
}
function point(s, cx, cy, kind = "start") {           // start ● / end ◉ / flowEnd ⊗
  if (kind === "start") return s.addShape("ellipse", { x: cx - 0.13, y: cy - 0.13, w: 0.26, h: 0.26, fill: { color: C.title }, line: { type: "none" } });
  s.addShape("ellipse", { x: cx - 0.15, y: cy - 0.15, w: 0.3, h: 0.3, fill: { color: C.white }, line: { color: C.title, width: 1.25 } });
  if (kind === "end") return s.addShape("ellipse", { x: cx - 0.09, y: cy - 0.09, w: 0.18, h: 0.18, fill: { color: C.title }, line: { type: "none" } });
  const d = 0.1; s.addShape("line", { x: cx - d, y: cy - d, w: 2 * d, h: 2 * d, line: { color: C.title, width: 1.25 } });
  s.addShape("line", { x: cx - d, y: cy - d, w: 2 * d, h: 2 * d, flipV: true, line: { color: C.title, width: 1.25 } });
}
const decision = (s, cx, cy, d = 0.5) => s.addShape("diamond", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: C.white }, line: { color: C.arrow, width: 1.25 } });
const bar = (s, x, y, w, h) => s.addShape("rect", { x, y, w, h, fill: { color: C.title }, line: { type: "none" } });   // フォーク／ジョイン
function lane(s, x, y, w, h, name, i = 0) {          // スイムレーン（左に見出し列）
  s.addShape("rect", { x, y, w, h, fill: { color: i % 2 ? "F8FBFF" : C.white }, line: { color: C.frameLine, width: 1 } });
  s.addShape("rect", { x, y, w: 1.0, h, fill: { color: C.frame }, line: { color: C.frameLine, width: 1 } });
  T(s, name, { x, y, w: 1.0, h, fontSize: FS.label + 1.5, bold: true, color: C.title, align: "center", valign: "middle" });
}

// ---- シーケンス図 ----
// 頭は矩形（o.w で幅、o.ext で灰＝外部）。利用者だけ o.actor で人型アイコン
async function lifeline(s, x, top, bottom, name, o = {}) {
  if (o.actor) {
    s.addImage({ data: await icon("user"), x: x - 0.26, y: top - 0.1, w: 0.52, h: 0.52, altText: name });
    T(s, name, { x: x - 0.8, y: top + 0.42, w: 1.6, h: 0.22, fontSize: FS.label, bold: true, color: C.title, align: "center" });
  } else box(s, x - (o.w || 1.6) / 2, top, o.w || 1.6, 0.42, name, { shape: "rect", ext: o.ext, fill: o.ext ? undefined : C.frame, size: FS.label });
  const y0 = top + (o.actor ? 0.66 : 0.42);
  s.addShape("line", { x, y: y0, w: 0, h: bottom - y0, line: { color: C.gray, width: 1, dashType: "dash" } });
}
// kind: "sync"（実線＋塗り矢じり）| "async"（実線＋開矢じり）| "reply"（破線＋開矢じり）。番号は「1: 操作名」
// 活性区間のある側は x±0.07 で端を合わせる。o は arrow() のオプション（h, fill など）。活性区間は最後に描く
function msg(s, x1, x2, y, label, kind = "sync", num, o = {}) {
  const lab = num == null ? label : Array.isArray(label) ? [{ text: `${num}: ` }, ...label] : `${num}: ${label}`;
  arrow(s, [[x1, y], [x2, y]], lab, { dash: kind === "reply", open: kind !== "sync",
    width: kind === "reply" ? 1.25 : 1.75, w: Math.max(Math.abs(x2 - x1) - 0.1, 1.2), ...o });
}
function selfMsg(s, x, y, label, num, h = 0.32) {      // 自分自身への呼び出し
  arrow(s, [[x + 0.07, y], [x + 0.5, y], [x + 0.5, y + h], [x + 0.07, y + h]], null, { width: 1.75 });
  T(s, num ? `${num}: ${label}` : label, { x: x + 0.58, y: y + h / 2 - 0.16, w: 2.4, h: 0.32, fontSize: FS.arrow, color: C.arrow, valign: "middle" });
}
const activation = (s, x, y1, y2) => s.addShape("rect", { x: x - 0.07, y: y1, w: 0.14, h: y2 - y1, fill: { color: C.white }, line: { color: C.icon, width: 1 } });
// 複合フラグメント（alt/opt/loop/par）。elseY を渡すと [else] の区切り線を引く
function fragment(s, x, y, w, h, op, guard, elseY, elseGuard = "[else]") {
  s.addShape("rect", { x, y, w, h, fill: { type: "none" }, line: { color: C.title, width: 1 } });
  const tw = 0.62, th = 0.27;
  s.addShape("custGeom", { x, y, w: tw, h: th, points: [{ x: 0, y: 0 }, { x: tw, y: 0 }, { x: tw, y: th - 0.08 }, { x: tw - 0.08, y: th }, { x: 0, y: th }, { close: true }], fill: { color: C.frame }, line: { color: C.title, width: 1 } });
  T(s, op, { x, y, w: tw - 0.06, h: th, fontSize: FS.label, bold: true, color: C.title, align: "center", valign: "middle" });
  if (guard) T(s, guard, { x: x + tw + 0.08, y: y + 0.02, w: 3, h: 0.25, fontSize: FS.label, bold: true, color: C.title, valign: "middle" });
  if (elseY) { s.addShape("line", { x, y: elseY, w, h: 0, line: { color: C.title, width: 1, dashType: "dash" } });
    T(s, elseGuard, { x: x + 0.15, y: elseY + 0.04, w: 3, h: 0.25, fontSize: FS.label, bold: true, color: C.title, valign: "middle" }); }
}

// 保存：アイコンの代替PNGを正しく描き直し、テーマの和文フォントをMeiryoにし、ZIPのフォルダ項目を除く
async function save(p, file) {
  const src = await JSZip.loadAsync(await p.write({ outputType: "nodebuffer" })), out = new JSZip();
  for (const f of Object.keys(src.files)) {
    if (src.files[f].dir) continue;
    let data = await src.file(f).async("nodebuffer");
    const m = f.match(/^ppt\/media\/image-(\d+)-(\d+)\.png$/), svg = m && src.file(`ppt/media/image-${m[1]}-${+m[2] + 1}.svg`);
    if (svg) data = await sharp(await svg.async("nodebuffer"), { density: 300 }).resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    if (/^ppt\/theme\/theme\d+\.xml$/.test(f)) data = Buffer.from(data.toString("utf8")
      .replace(/<a:ea typeface=""\s*\/>/g, `<a:ea typeface="${FONT}"/>`).replace(/(<a:font script="Jpan" typeface=")[^"]*/g, `$1${FONT}`));
    out.file(f, data, { createFolders: false });
  }
  fs.writeFileSync(file, await out.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

module.exports = { C, FS, FONT, ICON, icon, table, deck, article, slide, canvas, frame, node, arrow, badge, note, legend,
  box, usecase, process, store, point, decision, bar, lane, lifeline, msg, selfMsg, activation, fragment, save, T };
