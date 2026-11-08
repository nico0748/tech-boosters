// compact no.13 RAG の図（図1 全体像、図2 セキュリティの攻撃面）
// 使い方: node 図生成スクリプト.js <出力ディレクトリ>
const pptxgen = require("pptxgenjs"), JSZip = require("jszip"), fs = require("fs"), path = require("path");
const React = require("react"), RDS = require("react-dom/server"), sharp = require("sharp"), tb = require("react-icons/tb");

const OUT = process.argv[2] || ".";
const FONT = {ja: "Hiragino Sans", en: "Helvetica Neue"};
const C = {navy: "1F2A44", gray: "5F6368", line: "555555", white: "FFFFFF", border: "D5D9E0",
  teal: "138A7E", tealBg: "EAF6F4", blue: "2F6FDB", blueBg: "EEF4FD", orange: "E07B1A", orangeBg: "FFF4E6",
  purple: "7C4DDB", purpleBg: "F5F1FD", red: "C62828", redBg: "FDECEC", green: "2E7D32", greenBg: "EAF4EA",
  slate: "3D4651", neutral: "8A919C", neutralBg: "F4F5F7"};
const FS = 12; // すべて 12pt 以上

const cache = {};
async function icon(Comp, color) {
  const k = Comp.name + color; if (cache[k]) return cache[k];
  const svg = RDS.renderToStaticMarkup(React.createElement(Comp, {color: "#" + color, size: 256})).replace(/currentColor/g, "#" + color);
  return (cache[k] = "image/svg+xml;base64," + Buffer.from(svg).toString("base64"));
}
const T = (s, text, o) => s.addText(text, {isTextBox: true, margin: 0, fontFace: FONT.en, fontSize: FS, color: C.navy, valign: "top", ...o});

function newDeck() {
  const p = new pptxgen(); p.layout = "LAYOUT_16x9"; // 10 x 5.625 in
  p.theme = {headFontFace: FONT.en, bodyFontFace: FONT.en};
  return p;
}

// レーン：左に見出し列（アイコン＋太字名＋グレー補足）、淡い背景、左端に濃い帯
async function lane(s, y, h, accent, bg, name, sub, Ico, hc) {
  const c = hc ?? y + h / 2;
  s.addShape("rect", {x: 0.15, y, w: 9.7, h, fill: {color: bg}, line: {type: "none"}});
  s.addShape("rect", {x: 0.15, y, w: 0.08, h, fill: {color: accent}, line: {type: "none"}});
  s.addImage({data: await icon(Ico, accent), x: 0.5, y: c - 0.62, w: 0.48, h: 0.48});
  const nm = name.split("\n").map((t) => ({text: t, options: {bold: true, color: accent, breakLine: true}}));
  const sb = sub.split("\n").map((t, i, a) => ({text: t, options: {color: C.gray, breakLine: i < a.length - 1}}));
  nm.forEach((r) => (r.options.fontSize = 12));
  T(s, [...nm, ...sb],
    {x: 0.25, y: c - 0.1, w: 1.04, h: 0.8, align: "center", fontSize: FS});
}

// ノード：白地＋アクセント枠、上部にアイコン、太字タイトル＋説明（2行まで）
// o: {fill, badge:{n,color}, pill:{text,color}}
async function node(s, cx, cy, w, h, accent, Ico, title, desc, o = {}) {
  const x = cx - w / 2, y = cy - h / 2;
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.1, fill: {color: o.fill || C.white}, line: {color: accent, width: 1.75}});
  s.addImage({data: await icon(Ico, accent), x: cx - 0.2, y: y + 0.1, w: 0.4, h: 0.4});
  const runs = [{text: title, options: {bold: true, color: C.navy, fontSize: 14, breakLine: !!desc}}];
  if (desc) desc.split("\n").forEach((d, i, a) => runs.push({text: d, options: {color: C.gray, breakLine: i < a.length - 1}}));
  T(s, runs, {x: x + 0.02, y: y + 0.54, w: w - 0.04, h: h - 0.58, align: "center", lineSpacingMultiple: 0.95});
  if (o.badge) {
    const bx = x - 0.12, by = y - 0.13;
    s.addShape("ellipse", {x: bx, y: by, w: 0.3, h: 0.3, fill: {color: o.badge.color}, line: {color: C.white, width: 1}});
    T(s, String(o.badge.n), {x: bx, y: by, w: 0.3, h: 0.3, bold: true, color: C.white, align: "center", valign: "middle"});
  }
  if (o.pill) {
    const pw = o.pill.w || 1.0;
    const px = x + w - pw - 0.06, py = y + h - 0.14;
    s.addShape("roundRect", {x: px, y: py, w: pw, h: 0.28, rectRadius: 0.14, fill: {color: o.pill.color}, line: {type: "none"}});
    T(s, o.pill.text, {x: px, y: py, w: pw, h: 0.28, bold: true, color: C.white, align: "center", valign: "middle"});
  }
  return {l: [x, cy], r: [x + w, cy], t: [cx, y], b: [cx, y + h], x, y, w, h, cx, cy};
}

// 矢印（細い直線＋小三角）。pts 3点以上で折れ線
function arrow(s, pts, o = {}) {
  const line = {color: o.color || C.line, width: o.width || 1.5, dashType: o.dash ? "dash" : "solid", endArrowType: "triangle"};
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]), x0 = Math.min(...xs), y0 = Math.min(...ys);
  if (pts.length === 2) {
    const [[x1, y1], [x2, y2]] = pts;
    s.addShape("line", {x: x0, y: y0, w: Math.max(Math.abs(x2 - x1), 0.0001), h: Math.max(Math.abs(y2 - y1), 0.0001), flipH: x2 < x1, flipV: y2 < y1, line});
  } else s.addShape("custGeom", {x: x0, y: y0, w: Math.max(Math.max(...xs) - x0, 0.01), h: Math.max(Math.max(...ys) - y0, 0.01),
    points: pts.map(([x, y]) => ({x: x - x0, y: y - y0})), fill: {type: "none"}, line});
}
const label = (s, text, x, y, w, o = {}) => T(s, text, {x, y, w, h: o.h || 0.26, color: o.color || C.gray, align: o.align || "center", valign: o.valign || "middle", bold: o.bold});

// 凡例（下端に横1列）
async function legend(s, y, items) {
  let x = 0.25;
  T(s, "凡例", {x, y, w: 0.5, h: 0.3, bold: true, color: C.gray, valign: "middle"}); x += 0.55;
  for (const it of items) {
    if (it.kind === "badge") {
      s.addShape("ellipse", {x, y: y + 0.01, w: 0.28, h: 0.28, fill: {color: it.color}, line: {type: "none"}});
      T(s, "1", {x, y: y + 0.01, w: 0.28, h: 0.28, bold: true, color: C.white, align: "center", valign: "middle"});
      x += 0.34;
    } else if (it.kind === "pill") {
      s.addShape("roundRect", {x, y: y + 0.02, w: it.pw, h: 0.26, rectRadius: 0.13, fill: {color: it.color}, line: {type: "none"}});
      T(s, it.sample, {x, y: y + 0.02, w: it.pw, h: 0.26, bold: true, color: C.white, align: "center", valign: "middle"});
      x += it.pw + 0.06;
    } else if (it.kind === "box") {
      s.addShape("roundRect", {x, y: y + 0.04, w: 0.36, h: 0.22, rectRadius: 0.05, fill: {color: it.fill}, line: {color: it.color, width: 1.5}});
      x += 0.42;
    } else if (it.kind === "line") {
      arrow(s, [[x, y + 0.15], [x + 0.45, y + 0.15]], {color: it.color, width: 1.75}); x += 0.52;
    } else if (it.kind === "dash") {
      arrow(s, [[x, y + 0.15], [x + 0.45, y + 0.15]], {dash: true, color: it.color}); x += 0.52;
    }
    T(s, it.text, {x, y, w: it.tw, h: 0.3, color: C.navy, valign: "middle"}); x += it.tw + 0.18;
  }
}

// ---------- 図1 RAG の全体像 ----------
async function fig1() {
  const p = newDeck(), s = p.addSlide(); s.background = {color: C.white};
  const W = 1.46, H = 1.3;
  const cx = (i) => 2.06 + i * 1.735; // 5 列
  const yA = 1.1, yB = 3.6;
  await lane(s, 0.15, 1.85, C.teal, C.tealBg, "インデックス\n作成", "オフライン", tb.TbDatabaseImport, yA);
  await lane(s, 2.6, 2.55, C.blue, C.blueBg, "質問応答", "オンライン", tb.TbMessageQuestion, yB);
  // インデックス作成
  const doc = await node(s, cx(0), yA, W, H, C.teal, tb.TbFiles, "文書", "社内資料・Wiki");
  const chk = await node(s, cx(1), yA, W, H, C.teal, tb.TbScissors, "チャンク分割", "数百文字単位\n前後に重複区間", {badge: {n: 1, color: C.teal}});
  const emA = await node(s, cx(2), yA, W, H, C.teal, tb.TbVectorTriangle, "埋め込みモデル", "チャンクの\nベクトル化", {badge: {n: 2, color: C.teal}});
  const db = await node(s, cx(3), yA, W, H, C.teal, tb.TbDatabase, "ベクトルDB", "ベクトル＋\nチャンク本文", {badge: {n: 3, color: C.teal}});
  arrow(s, [doc.r, chk.l]); arrow(s, [chk.r, emA.l]); arrow(s, [emA.r, db.l]);
  // 質問応答
  const usr = await node(s, cx(0), yB, W, H, C.blue, tb.TbUser, "ユーザー", "質問の入力");
  const emB = await node(s, cx(1), yB, W, H, C.blue, tb.TbVectorTriangle, "埋め込みモデル", "質問のベクトル化\n（上段②と同一）", {badge: {n: 1, color: C.blue}});
  const ret = await node(s, cx(2), yB, W, H, C.blue, tb.TbSearch, "ベクトル検索", "類似度上位 k 件\nチャンクの取得", {badge: {n: 2, color: C.blue}, pill: {text: "Retrieval", color: C.slate, w: 0.95}});
  const aug = await node(s, cx(3), yB, W, H, C.blue, tb.TbFileText, "プロンプト構築", "質問＋取得\nチャンクの結合", {badge: {n: 3, color: C.blue}, pill: {text: "Augmented", color: C.slate, w: 1.08}});
  const gen = await node(s, cx(4), yB, W, H, C.blue, tb.TbSparkles, "LLM", "チャンクに基づく\n回答生成", {badge: {n: 4, color: C.blue}, pill: {text: "Generation", color: C.slate, w: 1.08}});
  arrow(s, [usr.r, emB.l]); arrow(s, [emB.r, ret.l]); arrow(s, [ret.r, aug.l]); arrow(s, [aug.r, gen.l]);
  // ベクトル検索 ⇄ ベクトルDB（入れ子の L 字 2 本で交差させない）
  const yUp = 2.32, yDn = 2.55, xs1 = ret.cx - 0.3, xd1 = db.cx - 0.5, xs2 = ret.cx + 0.3, xd2 = db.cx + 0.3;
  arrow(s, [[xs1, ret.y], [xs1, yUp], [xd1, yUp], [xd1, db.b[1]]]);
  label(s, "質問ベクトル", xs1 - 0.2, yUp - 0.29, xd1 - xs1 + 0.2, {valign: "bottom"});
  arrow(s, [[xd2, db.b[1]], [xd2, yDn], [xs2, yDn], [xs2, ret.y]]);
  label(s, "上位 k 件のチャンク", xd2 + 0.1, 2.02, 1.9, {align: "left"});
  // 質問文 → プロンプト構築、回答 → ユーザー（箱の下を回す）
  const yQ = 4.6, yR = 5.0;
  arrow(s, [[usr.cx + 0.3, usr.y + H], [usr.cx + 0.3, yQ], [aug.x + 0.12, yQ], [aug.x + 0.12, aug.y + H]]);
  label(s, "質問文", cx(1) - 0.6, yQ - 0.28, 1.2, {valign: "bottom"});
  arrow(s, [[gen.x + 0.12, gen.y + H], [gen.x + 0.12, yR], [usr.cx - 0.3, yR], [usr.cx - 0.3, usr.y + H]]);
  label(s, "回答", cx(2) - 0.5, yR - 0.28, 1.0, {valign: "bottom"});
  await legend(s, 5.22, [
    {kind: "badge", color: C.teal, text: "インデックス作成の手順", tw: 1.95},
    {kind: "badge", color: C.blue, text: "質問応答の手順", tw: 1.3},
    {kind: "pill", color: C.slate, sample: "R / A / G", pw: 0.95, text: "RAG の各段階", tw: 1.25},
  ]);
  return p;
}

// ---------- 図2 セキュリティで気をつける箇所 ----------
async function fig2() {
  const p = newDeck(), s = p.addSlide(); s.background = {color: C.white};
  const W = 1.6, H = 1.3, y = 2.6;
  const cx = (i) => 1.1 + i * 1.95; // 5 列
  const doc = await node(s, cx(0), y, W, H, C.red, tb.TbFiles, "文書", "検索対象の資料", {fill: C.redBg});
  const db = await node(s, cx(1), y, W, H, C.red, tb.TbDatabase, "ベクトルDB", "ベクトル＋本文\n＋ACL", {fill: C.redBg});
  const ret = await node(s, cx(2), y, W, H, C.green, tb.TbSearch, "ベクトル検索", "類似度上位 k 件\nチャンクの取得", {fill: C.greenBg});
  const aug = await node(s, cx(3), y, W, H, C.red, tb.TbFileText, "プロンプト構築", "質問＋取得\nチャンクの結合", {fill: C.redBg});
  const gen = await node(s, cx(4), y, W, H, C.red, tb.TbSparkles, "LLM", "チャンクに基づく\n回答生成", {fill: C.redBg});
  for (const [a, b] of [[doc, db], [db, ret], [ret, aug], [aug, gen]]) arrow(s, [a.r, b.l], {color: C.red, width: 1.75});
  // 攻撃者 → 文書
  const atk = await node(s, cx(0), 0.75, W, 0.95, C.red, tb.TbSpy, "攻撃者", null);
  arrow(s, [atk.b, doc.t], {dash: true, color: C.red});
  label(s, "インデックス対象への書き込み", doc.cx + 0.1, 1.38, 2.6, {align: "left", color: C.red});
  // ユーザー → 検索、LLM → ユーザー
  const usr = await node(s, cx(2), 0.75, W, 0.95, C.blue, tb.TbUser, "ユーザー", null);
  arrow(s, [usr.b, ret.t]);
  label(s, "質問＋ユーザーID", ret.cx + 0.1, 1.38, 1.9, {align: "left"});
  arrow(s, [gen.t, [gen.cx, usr.cy], usr.r]);
  label(s, "回答", (usr.r[0] + gen.cx) / 2 - 0.5, usr.cy - 0.29, 1.0, {valign: "bottom"});
  // 脅威・対策の注記（見出し＋2行、体言止め）
  const ty = 3.8, th = 0.95;
  function tag(x, w, color, bg, head, body) {
    s.addShape("roundRect", {x, y: ty, w, h: th, rectRadius: 0.08, fill: {color: C.white}, line: {color, width: 1.5}});
    T(s, [{text: head, options: {bold: true, color, fontSize: 14, breakLine: true}}, ...body.split("\n").map((t, i, a) => ({text: t, options: {color: C.navy, breakLine: i < a.length - 1}}))],
      {x: x + 0.08, y: ty + 0.06, w: w - 0.16, h: th - 0.12, align: "center", valign: "middle"});
  }
  tag(cx(0) - W / 2, cx(1) - cx(0) + W - 0.15, C.red, C.redBg, "データ汚染", "インデックス対象の改ざん\n誤情報・指示文の混入");
  tag(cx(2) - 1.1, 2.2, C.green, C.greenBg, "アクセス制御", "検索時の権限フィルタ\nACL とユーザーID の照合");
  tag(cx(3) - W / 2 + 0.15, cx(4) - cx(3) + W - 0.15, C.red, C.redBg, "間接プロンプトインジェクション", "チャンク内の悪意ある指示文\nLLM による指示の実行");
  for (const [nd, col] of [[doc, C.red], [db, C.red], [ret, C.green], [aug, C.red], [gen, C.red]])
    s.addShape("line", {x: nd.cx, y: nd.y + H, w: 0.0001, h: ty - nd.y - H, line: {color: col, width: 1.25, dashType: "sysDot"}});
  await legend(s, 5.12, [
    {kind: "box", color: C.red, fill: C.redBg, text: "攻撃の影響を受ける箇所", tw: 1.95},
    {kind: "box", color: C.green, fill: C.greenBg, text: "対策を入れる箇所", tw: 1.45},
    {kind: "line", color: C.red, text: "汚染データの伝播経路", tw: 1.75},
    {kind: "dash", color: C.red, text: "攻撃者の操作", tw: 1.15},
  ]);
  return p;
}

// 和文の欄をヒラギノに、アイコンの代替PNGを作り直し、言語を ja-JP に
async function save(p, file) {
  const src = await JSZip.loadAsync(await p.write({outputType: "nodebuffer"})), out = new JSZip();
  for (const f of Object.keys(src.files)) {
    if (src.files[f].dir) continue;
    let data = await src.file(f).async("nodebuffer");
    const m = f.match(/^ppt\/media\/image-(\d+)-(\d+)\.png$/), svg = m && src.file(`ppt/media/image-${m[1]}-${+m[2] + 1}.svg`);
    if (svg) data = await sharp(await svg.async("nodebuffer"), {density: 300}).resize(256, 256, {fit: "contain", background: {r: 0, g: 0, b: 0, alpha: 0}}).png().toBuffer();
    if (/^ppt\/.*\.xml$/.test(f)) {
      let x = data.toString("utf8");
      if (/^ppt\/theme\//.test(f)) x = x.replace(/<a:ea typeface="[^"]*"[^>]*\/>/g, `<a:ea typeface="${FONT.ja}"/>`);
      x = x.replace(/<a:ea typeface="(?!\+)[^"]*"[^>]*\/>/g, `<a:ea typeface="${FONT.ja}" pitchFamily="34" charset="-128"/>`)
        .replace(/(<a:(?:rPr|endParaRPr|defRPr)\b[^>]*?) lang="en-US"(?![^>]*altLang)/g, '$1 lang="ja-JP" altLang="en-US"');
      data = Buffer.from(x);
    }
    out.file(f, data, {createFolders: false});
  }
  fs.writeFileSync(file, await out.generateAsync({type: "nodebuffer", compression: "DEFLATE"}));
}

(async () => {
  fs.mkdirSync(OUT, {recursive: true});
  await save(await fig1(), path.join(OUT, "01_RAGの全体像.pptx"));
  await save(await fig2(), path.join(OUT, "02_RAGのセキュリティで気をつける箇所.pptx"));
  console.log("ok");
})();
