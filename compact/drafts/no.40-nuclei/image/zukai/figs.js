// compact no.40「Nuclei の機能とできること」の図1〜6（zukai-diagrams 準拠、記事用 幅10in）
// 使い方: node figs.js <出力フォルダ>  → bash render.sh <出力フォルダ> で PNG（2000px）
// 文字は 14pt 以上（名前は 16pt 太字）。各箱の上部にアイコン（icons/：Tabler outline とテック・SaaSロゴ、Mac の アイコン・素材 から）
// 色の意味（6枚で共通）：navy＝Nuclei（の処理）／teal＝テンプレート／orange＝スキャン対象／gray＝入出力
//   purple＝連携ツール／green・red・amber＝署名の検証の判定（図5のみ）／pink 枠＝注目箇所／破線＝既定では通らない要素・経路
const Z = require("./zukai.js");
const path = require("path"), fs = require("fs"), sharp = require("sharp");
const OUT = process.argv[2] || ".";

const K = {
  navy: {c: "2E5E8E", f: "EEF3F9"},
  teal: {c: "1E8A82", f: "E8F5F3"},
  gray: {c: "6B7280", f: "F1F3F4"},
  orange: {c: "B45309", f: "FDF3E7"},
  purple: {c: "6B4FA0", f: "F1EDF8"},
  red: {c: "C0392B", f: "FBEEEC"},
  green: {c: "2E7D32", f: "EDF6EE"},
  amber: {c: "9A6B00", f: "FFF8E1"},
};
const MUTED = Z.C.muted, PINK = Z.C.pink;
const LOGOS = new Set(["github-icon", "jira", "joomla", "jenkins", "gitlab-icon"]);  // ロゴは元の色のまま

function art(h) {
  const p = Z.article({title: "Nuclei 図", author: "Nico"});
  p.defineLayout({name: "NUC", width: 10, height: h}); p.layout = "NUC";
  Object.assign(Z.FS, {label: 14, sub: 14, arrow: 14, box: 14});
  return p;
}
const icache = {};
async function ico(name, color) {  // SVG → PNG（Tabler は currentColor を塗り替え）
  const k = name + color; if (icache[k]) return icache[k];
  let svg = fs.readFileSync(path.join(__dirname, "icons", name + ".svg"), "utf8");
  if (!LOGOS.has(name)) svg = svg.replace(/currentColor/g, "#" + color);
  if (name === "jenkins") svg = svg.replace('viewBox="0 0 256 417"', 'viewBox="0 0 256 320"');  // ロゴ下の小さな文字を切り落とす
  let img = sharp(Buffer.from(svg), {density: 1200});
  if (LOGOS.has(name)) img = sharp(await img.png().trim().toBuffer());  // ロゴは余白を詰めて大きさをそろえる
  const png = await img.resize(512, 512, {fit: "contain", background: {r: 0, g: 0, b: 0, alpha: 0}}).png().toBuffer();
  return (icache[k] = "image/png;base64," + png.toString("base64"));
}
// アイコン（上）＋見出し＋説明（最大2行）の箱。o.icon：アイコン名（配列なら横に並べる）、o.accent：注目箇所、o.dashed：既定では通らない
const IS = 0.42;
async function chip(s, x, y, w, h, head, sub, k, o = {}) {
  if (o.accent) s.addShape("roundRect", {x: x - 0.07, y: y - 0.07, w: w + 0.14, h: h + 0.14, rectRadius: 0.13, fill: {type: "none"}, line: {color: PINK, width: 2.5}});
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.1, fill: {color: K[k].f}, line: {color: K[k].c, width: 1.5, dashType: o.dashed ? "dash" : "solid"}});
  let ty = y;
  if (o.icon) {
    const list = [].concat(o.icon), gap = 0.12, tw = list.length * IS + (list.length - 1) * gap;
    for (let i = 0; i < list.length; i++)
      s.addImage({data: await ico(list[i], K[k].c), x: x + w / 2 - tw / 2 + i * (IS + gap), y: y + 0.13, w: IS, h: IS, altText: list[i]});
    ty = y + 0.13 + IS;
  }
  const runs = [];
  head.split("\n").forEach((t, i, a) => runs.push({text: t, options: {bold: true, fontSize: o.hs || 16, color: K[k].c, breakLine: i < a.length - 1 || !!sub}}));
  if (sub) sub.split("\n").forEach((t, i, a) => runs.push({text: t, options: {fontSize: 14, color: Z.C.text, breakLine: i < a.length - 1}}));
  Z.T(s, runs, {x: x + 0.05, y: ty, w: w - 0.1, h: y + h - ty - 0.04, align: "center", valign: "middle", lineSpacingMultiple: 1.05});
  return {l: [x, y + h / 2], r: [x + w, y + h / 2], t: [x + w / 2, y], b: [x + w / 2, y + h], x, y, w, h};
}
// 凡例（下端に横1列、中央寄せ）。kind：K の色名／色名+"dash"（破線の箱）／accent（ピンク枠）／open（破線の矢印）／line（実線の矢印）
function clegend(s, items, y, colW = 1.9) {
  const h = 0.42, ww = 0.7 + items.reduce((a, it) => a + (it[2] || colW), 0), x0 = (10 - ww) / 2;
  s.addShape("roundRect", {x: x0, y, w: ww, h, rectRadius: 0.08, fill: {color: "FFFFFF"}, line: {color: Z.C.grid, width: 0.75}});
  Z.T(s, "凡例", {x: x0 + 0.1, y: y + 0.07, w: 0.56, h: 0.28, fontSize: 14, bold: true, color: MUTED, valign: "middle"});
  let sx = x0 + 0.7;
  for (const [kind, text, cw0] of items) {
    const cw = cw0 || colW, yy = y + h / 2, dash = /dash$/.test(kind), base = kind.replace(/dash$/, "");
    if (K[base]) s.addShape("rect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, fill: {color: K[base].f}, line: {color: K[base].c, width: 1.5, dashType: dash ? "dash" : "solid"}});
    else if (kind === "accent") s.addShape("rect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, fill: {color: "FFFFFF"}, line: {color: PINK, width: 2.5}});
    else if (kind === "open") Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 1.5, dash: true});
    else Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 1.5});
    Z.T(s, text, {x: sx + 0.48, y: yy - 0.14, w: cw - 0.5, h: 0.28, fontSize: 14, valign: "middle"});
    sx += cw;
  }
}
const A = (s, pts, label, o = {}) => Z.arrow(s, pts, label, {width: 1.75, ...o});
const ACC = ["accent", "注目箇所", 1.6];

// ---- 図1：Nuclei の全体像 ----
async function fig1() {
  const p = art(6.3), s = Z.canvas(p);
  const tp = await chip(s, 3.6, 0.15, 2.5, 1.25, "nuclei-templates", "YAML 約1.4万件", "teal", {icon: "file-code"});
  const inp = await chip(s, 0.2, 2.15, 1.95, 1.35, "対象の指定", "-u・-l・標準入力", "gray", {icon: "list-details"});
  const en = await chip(s, 3.6, 2.0, 2.5, 1.65, "Nuclei", "リクエスト送信\nマッチャー判定", "navy", {accent: true, icon: "atom"});
  const tg = await chip(s, 7.75, 2.15, 2.0, 1.35, "スキャン対象", "HTTP・DNS など", "orange", {icon: "server"});
  const out = await chip(s, 3.6, 4.2, 2.5, 1.25, "検出結果", "JSONL・Markdown など", "gray", {icon: "file-report"});
  A(s, [inp.r, [en.x - 0.07, inp.r[1]]], "① 対象", {w: 1.2});
  A(s, [tp.b, [tp.b[0], en.y - 0.07]], "② -tags・-s・-id で選択", {w: 2.6});
  A(s, [[en.x + en.w + 0.07, 2.55], [tg.x, 2.55]], "③ リクエスト", {w: 1.6});
  A(s, [[tg.x, 3.15], [en.x + en.w + 0.07, 3.15]], "レスポンス", {w: 1.6});
  A(s, [[en.b[0], en.y + en.h + 0.07], out.t], "④ 一致のみ出力", {w: 2.0});
  clegend(s, [["navy", "Nuclei", 1.4], ["teal", "テンプレート", 1.85], ["orange", "スキャン対象", 1.85], ["gray", "入出力", 1.35], ACC], 5.75);
  await Z.save(p, path.join(OUT, "01_Nucleiの全体像.pptx"));
}

// ---- 図2：テンプレートの構造とプロトコル ----
async function fig2() {
  const p = art(6.6), s = Z.canvas(p);
  Z.frame(s, 0.25, 0.5, 3.4, 4.55, "テンプレート（YAML）");
  await chip(s, 0.45, 0.7, 3.0, 1.15, "id", "一意な名前", "teal", {icon: "id"});
  await chip(s, 0.45, 2.0, 3.0, 1.15, "info", "名前・作者・深刻度・タグ", "teal", {icon: "info-circle"});
  const pr = await chip(s, 0.45, 3.3, 3.0, 1.55, "プロトコル部", "リクエスト・マッチャー\nエクストラクター", "teal", {accent: true, icon: "code"});
  const FX = 4.15, FW = 5.6;
  Z.frame(s, FX, 0.5, FW, 2.8, "プロトコル（既定で読み込み）");
  const P1 = [["http", "world-www"], ["dns", "sitemap"], ["tcp", "plug-connected"], ["ssl", "certificate"],
    ["websocket", "arrows-exchange"], ["whois", "address-book"], ["javascript", "brand-javascript"]];
  for (let i = 0; i < P1.length; i++)
    await chip(s, FX + 0.12 + (i % 4) * 1.36, 0.62 + Math.floor(i / 4) * 1.08, 1.28, 0.98, P1[i][0], null, "teal", {icon: P1[i][1], hs: 14});
  Z.T(s, "javascript は v3.11.0 から署名必須", {x: FX + 0.12, y: 2.8, w: FW - 0.24, h: 0.32, fontSize: 14, color: MUTED, align: "center"});
  Z.frame(s, FX, 3.85, FW, 1.85, "プロトコル（フラグ指定時のみ）");
  const P2 = [["headless", "ブラウザ操作\n-headless", "browser"], ["code", "外部コード実行\n-code＋署名", "terminal-2"], ["file", "ローカルファイル\n-file", "file"]];
  for (let i = 0; i < P2.length; i++) await chip(s, FX + 0.1 + i * 1.83, 3.97, 1.76, 1.61, P2[i][0], P2[i][1], "teal", {dashed: true, icon: P2[i][2]});
  const ty = pr.r[1], bx = 3.9;
  A(s, [[pr.x + pr.w + 0.07, ty], [FX, ty]]);
  A(s, [[bx, ty], [bx, 1.9], [FX, 1.9]]);
  clegend(s, [["teal", "テンプレートの要素", 2.45], ["tealdash", "フラグ指定時のみ", 2.25], ACC], 6.0);
  await Z.save(p, path.join(OUT, "02_テンプレートの構造とプロトコル.pptx"));
}

// ---- 図3：マッチャーとエクストラクター ----
async function fig3() {
  const p = art(6.4), s = Z.canvas(p);
  const Y = 2.1, H = 1.35;
  const rq = await chip(s, 0.2, Y, 1.55, H, "リクエスト", "変数を展開", "navy", {icon: "send"});
  const tg = await chip(s, 2.1, Y, 1.75, H, "スキャン対象", "Web サーバなど", "orange", {icon: "server"});
  const rs = await chip(s, 4.2, Y, 1.5, H, "レスポンス", "header・body", "gray", {icon: "message-reply"});
  const ma = await chip(s, 6.15, 0.55, 2.0, 1.5, "マッチャー", "status・word\nregex・dsl など", "navy", {accent: true, icon: "filter"});
  const ex = await chip(s, 6.15, 3.5, 2.0, 1.5, "エクストラクター", "regex・json\nkval・xpath・dsl", "navy", {accent: true, icon: "scissors"});
  const hit = await chip(s, 8.5, 0.62, 1.3, 1.35, "検出結果", "一致時のみ", "gray", {icon: "file-report"});
  const val = await chip(s, 8.5, 3.57, 1.3, 1.35, "抽出値", "結果に付記", "gray", {icon: "braces"});
  A(s, [rq.r, tg.l]); A(s, [tg.r, rs.l]);
  const bx = 5.92, my = Y + H / 2;
  A(s, [rs.r, [bx, my]], null, {head: "none"});
  A(s, [[bx, my], [bx, ma.l[1]], [ma.x - 0.07, ma.l[1]]]); A(s, [[bx, my], [bx, ex.l[1]], [ex.x - 0.07, ex.l[1]]]);
  A(s, [[ma.x + ma.w + 0.07, ma.r[1]], hit.l]); A(s, [[ex.x + ex.w + 0.07, ex.r[1]], val.l]);
  Z.T(s, "matchers-condition: and／or", {x: 5.4, y: 0.1, w: 3.5, h: 0.3, fontSize: 14, color: MUTED, align: "center"});
  A(s, [[ex.b[0], ex.y + ex.h + 0.07], [ex.b[0], 5.45], [rq.b[0], 5.45], rq.b], "internal: true → 次リクエストの変数（結果に出さない）", {dash: true, seg: 1, w: 5.6});
  clegend(s, [["navy", "Nuclei の処理", 1.95], ["orange", "スキャン対象", 1.85], ["gray", "入出力", 1.35], ["open", "変数として再利用", 2.2], ACC], 5.85);
  await Z.save(p, path.join(OUT, "03_マッチャーとエクストラクター.pptx"));
}

// ---- 図4：ワークフロー ----
async function fig4() {
  const p = art(6.1), s = Z.canvas(p);
  const my = 2.775;
  const tg = await chip(s, 0.25, my - 0.675, 1.6, 1.35, "スキャン対象", "URL", "orange", {icon: "server"});
  const bs = await chip(s, 2.4, my - 0.75, 2.2, 1.5, "技術検出", "tech-detect.yaml", "teal", {accent: true, icon: "fingerprint"});
  A(s, [tg.r, [bs.x - 0.07, tg.r[1]]]);
  Z.frame(s, 6.7, 0.55, 3.05, 3.0, "subtemplates");
  const R = [["Joomla 用", "tags: joomla", "teal", "name: joomla", 0.7, 1.4, "joomla"], ["Jenkins 用", "tags: jenkins", "teal", "name: jenkins", 2.15, 1.45, "jenkins"],
    ["実行なし", "後続のリクエストなし", "gray", "一致なし", 4.0, 1.1, "ban"]];
  const bx = 5.0;
  A(s, [[bs.x + bs.w + 0.07, my], [bx, my]], null, {head: "none"});
  for (const [h, sub, k, lab, y, lw, ic] of R) {
    const c = await chip(s, 6.85, y, 2.75, 1.25, h, sub, k, {dashed: k === "gray", icon: ic});
    A(s, [[bx, my], [bx, c.l[1]], c.l], lab, {seg: 1, w: lw, dash: k === "gray"});
  }
  clegend(s, [["orange", "スキャン対象", 1.85], ["teal", "テンプレート", 1.85], ["graydash", "実行なし", 1.5], ["open", "一致なしの経路", 2.05], ACC], 5.55);
  await Z.save(p, path.join(OUT, "04_ワークフローによる条件付き実行.pptx"));
}

// ---- 図5：テンプレートの更新と署名の検証 ----
async function fig5() {
  const p = art(5.75), s = Z.canvas(p);
  const my = 2.65;
  const gh = await chip(s, 0.3, 0.15, 2.4, 1.25, "nuclei-templates", "GitHub のリリース", "teal", {icon: "github-icon"});
  const lc = await chip(s, 0.3, my - 0.55, 2.4, 1.1, "ローカルのコピー", null, "teal", {icon: "folder"});
  A(s, [gh.b, lc.t], "起動ごとに確認・取得\n-duc で無効化", {w: 2.3, h: 0.6});
  const vf = await chip(s, 3.72, my - 0.75, 2.1, 1.5, "署名の検証", "本体同梱の公開鍵", "navy", {accent: true, icon: "rosette-discount-check"});
  A(s, [lc.r, [vf.x - 0.07, my]], "読み込み", {w: 1.0});
  const R = [["実行", "通常どおり", "green", "署名が有効", "circle-check"], ["実行不可", "署名が必須", "red", "未署名\ncode・javascript", "circle-x"],
    ["警告して実行", "-dut 指定時は拒否", "amber", "未署名・上記以外", "alert-triangle"]];
  const bx = 6.12;
  A(s, [[vf.x + vf.w + 0.07, my], [bx, my]], null, {head: "none"});
  for (let i = 0; i < R.length; i++) {
    const [h, sub, k, lab, ic] = R[i];
    const c = await chip(s, 7.85, 0.55 + i * 1.5, 1.9, 1.2, h, sub, k, {icon: ic});
    A(s, [[bx, my], [bx, c.l[1]], c.l], lab, {seg: 1, w: 1.72, h: lab.includes("\n") ? 0.6 : 0.32});
  }
  clegend(s, [["teal", "テンプレート", 1.85], ["navy", "Nuclei", 1.25], ["green", "実行", 1.1], ["red", "実行不可", 1.5], ["amber", "警告して実行", 1.85], ["accent", "注目箇所", 1.4]], 5.15);
  await Z.save(p, path.join(OUT, "05_テンプレートの更新と署名の検証.pptx"));
}

// ---- 図6：他ツールとのパイプ連携 ----
async function fig6() {
  const p = art(5.9), s = Z.canvas(p);
  const Y = 1.6, H = 1.35, W = 1.75;
  const sf = await chip(s, 0.25, Y, W, H, "subfinder", "サブドメイン列挙", "purple", {icon: "world-search"});
  const hx = await chip(s, 2.9, Y, W, H, "httpx", "稼働 Web の確認", "purple", {icon: "heart-rate-monitor"});
  const nu = await chip(s, 5.5, Y, W, H, "Nuclei", "テンプレート実行", "navy", {accent: true, icon: "atom"});
  const js = await chip(s, 8.25, Y, 1.55, H, "検出結果", "JSONL ファイル", "gray", {icon: "file-report"});
  A(s, [sf.r, hx.l], "ホスト名", {w: 0.9}); A(s, [hx.r, [nu.x - 0.07, nu.l[1]]], "URL", {w: 0.7}); A(s, [[nu.x + W + 0.07, nu.r[1]], js.l], "-jsonl -o", {w: 0.9});
  A(s, [sf.t, [sf.t[0], 0.7], [nu.t[0], 0.7], [nu.t[0], nu.y - 0.07]], "ホスト名（Nuclei 内部で HTTP プローブ）", {dash: true, seg: 1, w: 4.8});
  const tk = await chip(s, 5.5, 3.65, W, 1.3, "課題管理", "Jira・GitHub など", "gray", {icon: ["jira", "github-icon"]});
  A(s, [[nu.b[0], nu.y + H + 0.07], tk.t], "-rc で起票", {w: 1.3});
  clegend(s, [["purple", "連携ツール", 1.65], ["navy", "Nuclei", 1.4], ["gray", "入出力", 1.35], ["open", "httpx 省略時の経路", 2.45], ACC], 5.3);
  await Z.save(p, path.join(OUT, "06_他ツールとのパイプ連携.pptx"));
}
module.exports = {K, chip, clegend, A, art};
if (require.main === module) (async () => { await fig1(); await fig2(); await fig3(); await fig4(); await fig5(); await fig6(); })();
