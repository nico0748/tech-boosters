// compact no.14 フレームワーク・ライブラリ・パッケージ の図1〜3（v2：批評レビュー反映）
// 実行：node 図生成スクリプト.js <出力フォルダ>（同じフォルダに zukai.js）
// 文字サイズ：本文 13pt、カード見出し・枠見出し 14pt（10in 幅の台紙を Qiita の本文幅 約800px に縮めても読める大きさ）
const Z = require("./zukai.js");
const { C } = Z;
const OUT = process.argv[2] || ".";
const F = 13, FT = 14, FH = 14;
const R = (t, o = {}) => ({ text: t, options: o });
const setFS = () => Object.assign(Z.FS, { label: FH - 2, sub: F, arrow: F, box: F });   // 枠見出し = label + 2
const BLUE = { color: C.label, bold: true };      // 配布パッケージ名
const PINK = { color: C.pink, bold: true };       // import パッケージ名
const HEAD = { headColor: C.title };              // 枠見出しは紺（ピンクは強調専用）

// 角丸カード：太字タイトル＋グレー補足行
function card(s, x, y, w, h, title, subs = [], o = {}) {
  s.addShape("roundRect", { x, y, w, h, rectRadius: 0.1, fill: { color: o.fill || C.white }, line: { color: o.line || C.icon, width: 1.5 } });
  const runs = [R(title, { bold: true, fontSize: FT, color: C.title, breakLine: subs.length > 0 })];
  subs.forEach((l, i) => {
    const parts = Array.isArray(l) ? l : [R(l)];
    parts.forEach((p, j) => runs.push(R(p.text, { color: C.muted, ...p.options, breakLine: j === parts.length - 1 && i < subs.length - 1 })));
  });
  Z.T(s, runs, { x: x + 0.06, y: y + (o.pad || 0), w: w - 0.12, h: h - (o.pad || 0), fontSize: F, align: "center", valign: "middle" });
  return { l: [x, y + h / 2], r: [x + w, y + h / 2], t: [x + w / 2, y], b: [x + w / 2, y + h], x, y, w, h };
}
function pill(s, x, y, text, w = 1.9) {
  s.addShape("roundRect", { x, y: y - 0.17, w, h: 0.34, rectRadius: 0.17, fill: { color: C.pink }, line: { color: C.white, width: 1 } });
  if (text) Z.T(s, text, { x, y: y - 0.17, w, h: 0.34, fontSize: F, bold: true, color: C.white, align: "center", valign: "middle" });
}
function legendRow(s, x, y, w, items) {
  s.addShape("roundRect", { x, y, w, h: 0.46, rectRadius: 0.08, fill: { color: C.white }, line: { color: C.grid, width: 0.75 } });
  Z.T(s, "凡例", { x: x + 0.15, y, w: 0.6, h: 0.46, fontSize: F, bold: true, color: C.muted, valign: "middle" });
  let cx = x + 0.85;
  for (const it of items) { it.draw(cx, y + 0.23); Z.T(s, it.text, { x: cx + it.iw + 0.1, y, w: it.tw, h: 0.46, fontSize: F, color: C.text, valign: "middle" }); cx += it.iw + 0.1 + it.tw + 0.25; }
}

// ======================= 図1：呼び出しの向き（制御の反転） =======================
async function fig1() {
  const p = Z.article({ title: "ライブラリとフレームワークの呼び出しの向き" }); setFS();
  p.defineLayout({ name: "F1", width: 10, height: 5.6 }); p.layout = "F1";
  const s = Z.canvas(p);
  const FY = 0.65, FHt = 4.05, TOP = 1.05, BOT = 3.45, BH = 1.1, CW = 2.7;
  // 左：ライブラリ
  Z.frame(s, 0.25, FY, 3.6, FHt, "ライブラリ：呼び出し元＝自分のコード", HEAD);
  const a = card(s, 0.7, TOP, CW, BH, "自分のコード", ["main.py"], { pad: 0.14 });
  const b = card(s, 0.7, BOT, CW, BH, "ライブラリ", ["requests"]);
  pill(s, 0.85, TOP, "制御フローの保持");
  Z.arrow(s, [[1.0, a.b[1]], [1.0, b.t[1]]], "① requests.get(url)", { w: 2.1, dy: -0.4, width: 1.75 });
  Z.arrow(s, [[3.1, b.t[1]], [3.1, a.b[1]]], "② Response 返却", { left: true, w: 1.9, dy: 0.45, dash: true });
  // 右：フレームワーク
  Z.frame(s, 4.15, FY, 5.6, FHt, "フレームワーク：呼び出し元＝Flask", HEAD);
  const f = card(s, 4.45, TOP, CW, BH, "フレームワーク", ["Flask", "URL ルール照合"], { pad: 0.14 });
  const v = card(s, 4.45, BOT, CW, BH, "自分のコード", ['@app.route("/")', "def index()"]);
  const c = card(s, 8.25, TOP, 1.3, BH, "HTTP", ["クライアント"], { fill: C.grayFill, line: C.muted });
  pill(s, 4.6, TOP, "制御フローの保持");
  Z.arrow(s, [[c.x, TOP + 0.3], [f.x + f.w, TOP + 0.3]], "① GET /", { w: 1.05, width: 1.75 });
  Z.arrow(s, [[f.x + f.w, TOP + 0.8], [c.x, TOP + 0.8]], "④ 200 OK", { w: 1.0, dash: true });
  Z.arrow(s, [[4.75, f.b[1]], [4.75, v.t[1]]], "② index() 呼び出し", { w: 1.95, dy: -0.4, width: 1.75 });
  Z.arrow(s, [[6.85, v.t[1]], [6.85, f.b[1]]], '③ 戻り値 "hello"', { left: true, w: 1.9, dy: 0.45, dash: true });
  legendRow(s, 0.25, 4.95, 9.5, [
    { draw: (x, y) => Z.arrow(s, [[x, y], [x + 0.55, y]], null, { width: 1.75 }), iw: 0.55, tw: 1.0, text: "呼び出し" },
    { draw: (x, y) => Z.arrow(s, [[x, y], [x + 0.55, y]], null, { dash: true }), iw: 0.55, tw: 1.6, text: "戻り値・応答" },
    { draw: (x, y) => pill(s, x, y, "", 0.55), iw: 0.55, tw: 2.6, text: "制御フローの保持側" },
  ]);
  await Z.save(p, `${OUT}/01_ライブラリとフレームワークの呼び出しの向き.pptx`);
}

// ======================= 図2：パッケージの配布とインストール =======================
async function fig2() {
  const p = Z.article({ title: "パッケージの配布とインストールの流れ" }); setFS();
  p.defineLayout({ name: "F2", width: 10, height: 7.2 }); p.layout = "F2";
  const s = Z.canvas(p);
  const X0 = 0.2, HW = 1.7, CW = 3.95, HY = 0.2, HH = 0.5, LH = 1.6;
  const LW = HW + 2 * CW;
  s.addShape("rect", { x: X0, y: HY, w: HW, h: HH, fill: { color: C.white }, line: { color: C.frameLine, width: 1 } });
  Z.T(s, "段階", { x: X0, y: HY, w: HW, h: HH, fontSize: F, color: C.muted, align: "center", valign: "middle" });
  ["JavaScript", "Python"].forEach((t, i) => {
    s.addShape("rect", { x: X0 + HW + i * CW, y: HY, w: CW, h: HH, fill: { color: C.frame }, line: { color: C.frameLine, width: 1 } });
    Z.T(s, t, { x: X0 + HW + i * CW, y: HY, w: CW, h: HH, fontSize: 16, bold: true, color: C.title, align: "center", valign: "middle" });
  });
  const rows = [["作者（配布元）", "パッケージの作成"], ["レジストリ", "パッケージ置き場"], ["パッケージ\nマネージャ", "依存解決・取得"], ["自分の\nプロジェクト", "インストール先"]];
  const rowY = rows.map((r, i) => HY + HH + i * LH);
  rows.forEach(([name, sub], i) => {
    const y = rowY[i];
    s.addShape("rect", { x: X0, y, w: HW, h: LH, fill: { color: C.frame }, line: { color: C.frameLine, width: 1 } });
    Z.T(s, [...name.split("\n").map((n) => R(n, { bold: true, fontSize: FT, color: C.title, breakLine: true })), R(sub, { fontSize: F, color: C.muted })],
      { x: X0 + 0.04, y, w: HW - 0.08, h: LH, align: "center", valign: "middle" });
  });
  s.addShape("rect", { x: X0 + HW, y: HY + HH, w: 2 * CW, h: rows.length * LH, fill: { color: C.white }, line: { color: C.frameLine, width: 1 } });
  s.addShape("line", { x: X0 + HW + CW, y: HY + HH, w: 0, h: rows.length * LH, line: { color: C.frameLine, width: 0.75, dashType: "dash" } });
  const BW = 3.1, BH = 0.85, OFF = (CW - BW) / 2;
  const cell = (col, row, title, subs) => card(s, X0 + HW + col * CW + OFF, rowY[row] + (LH - BH) / 2, BW, BH, title, subs);
  const cols = [
    { cells: [["ソース＋メタデータ", ["package.json"]], ["npm レジストリ", ["registry.npmjs.org"]], ["npm・pnpm・yarn・bun", ["npm install lodash"]], ["node_modules/", ["lodash/"]]],
      arrows: [["npm publish", "tarball 化・アップロード"], ["tarball のダウンロード", ""], ["展開・配置", "package-lock.json の更新"]] },
    { cells: [["ソース＋メタデータ", ["pyproject.toml"]], ["PyPI", ["pypi.org"]], ["pip・uv", ["pip install requests"]], [".venv/…/site-packages/", ["requests/", "requests-2.32.3.dist-info/"]]],
      arrows: [["python -m build", "twine upload dist/*"], ["wheel 優先のダウンロード", "なければ sdist をビルド"], ["展開・配置", ""]] },
  ];
  cols.forEach((c, ci) => {
    const boxes = c.cells.map(([t, sub], ri) => cell(ci, ri, t, sub));
    c.arrows.forEach(([l1, l2], ri) => {
      const ax = boxes[ri].x + 0.35, y1 = boxes[ri].b[1], y2 = boxes[ri + 1].t[1];
      Z.arrow(s, [[ax, y1], [ax, y2]], l2 ? `${l1}\n${l2}` : l1, { w: 3.0, h: l2 ? 0.5 : 0.28, width: 1.75 });
    });
  });
  await Z.save(p, `${OUT}/02_パッケージの配布とインストールの流れ.pptx`);
}

// ======================= 図3：Python の2つの「パッケージ」 =======================
async function fig3() {
  const p = Z.article({ title: "Pythonの配布パッケージとimportパッケージ" }); setFS();
  p.defineLayout({ name: "F3", width: 10, height: 5.5 }); p.layout = "F3";
  const s = Z.canvas(p);
  const LX = 0.25, LWd = 5.05, RX = 5.65, RWd = 4.1;
  Z.frame(s, LX, 0.65, LWd, 4.05, "配布パッケージ（Distribution Package）", HEAD);
  Z.frame(s, RX, 0.65, RWd, 4.05, "import パッケージ（Import Package）", HEAD);
  const ex = [
    { dist: "requests", ver: "2.32.3", pkg: "requests", imp: [R("import "), R("requests", PINK)] },
    { dist: "beautifulsoup4", ver: "4.12.3", pkg: "bs4", imp: [R("from "), R("bs4", PINK), R(" import BeautifulSoup")] },
  ];
  ex.forEach((e, i) => {
    const y0 = 0.82 + i * 1.92, wy = y0 + 0.36, wh = 1.3;
    // 左：pip install と wheel の中身
    Z.T(s, [R("$ pip install "), R(e.dist, BLUE)], { x: LX + 0.2, y: y0, w: LWd - 0.4, h: 0.32, fontSize: F, color: C.muted, valign: "middle" });
    const wx = LX + 0.2, ww = LWd - 0.4;
    s.addShape("roundRect", { x: wx, y: wy, w: ww, h: wh, rectRadius: 0.08, fill: { color: C.white }, line: { color: C.icon, width: 1.5 } });
    Z.T(s, [R(e.dist, BLUE), R(`-${e.ver}-py3-none-any.whl`, { bold: true, color: C.title })], { x: wx + 0.15, y: wy + 0.06, w: ww - 0.3, h: 0.34, fontSize: F, valign: "middle" });
    s.addShape("line", { x: wx, y: wy + 0.44, w: ww, h: 0, line: { color: C.frameLine, width: 1 } });
    Z.T(s, [R("├ "), R(`${e.pkg}/`, PINK), R("（__init__.py ほか）", { color: C.muted })], { x: wx + 0.2, y: wy + 0.5, w: ww - 0.3, h: 0.34, fontSize: F, color: C.text, valign: "middle" });
    Z.T(s, [R("└ "), R(e.dist, BLUE), R(`-${e.ver}.dist-info/`, { color: C.muted })], { x: wx + 0.2, y: wy + 0.86, w: ww - 0.25, h: 0.34, fontSize: F, color: C.text, valign: "middle" });
    // 右：import 文と site-packages 内の配置
    Z.T(s, [R(">>> ", { color: C.muted }), ...e.imp], { x: RX + 0.2, y: y0, w: RWd - 0.3, h: 0.32, fontSize: F, color: C.title, valign: "middle" });
    const ix = RX + 0.2, iw = RWd - 0.4;
    s.addShape("roundRect", { x: ix, y: wy, w: iw, h: wh, rectRadius: 0.08, fill: { color: C.white }, line: { color: C.icon, width: 1.5 } });
    Z.T(s, "site-packages/", { x: ix + 0.15, y: wy + 0.06, w: iw - 0.3, h: 0.34, fontSize: F, bold: true, color: C.title, valign: "middle" });
    s.addShape("line", { x: ix, y: wy + 0.44, w: iw, h: 0, line: { color: C.frameLine, width: 1 } });
    Z.T(s, [R("├ "), R(`${e.pkg}/`, PINK), R("（__init__.py ほか）", { color: C.muted })], { x: ix + 0.2, y: wy + 0.5, w: iw - 0.3, h: 0.34, fontSize: F, color: C.text, valign: "middle" });
    Z.T(s, [R("└ "), R(e.dist, BLUE), R(`-${e.ver}.dist-info/`, { color: C.muted })], { x: ix + 0.2, y: wy + 0.86, w: iw - 0.25, h: 0.34, fontSize: F, color: C.text, valign: "middle" });
    Z.arrow(s, [[wx + ww, wy + wh / 2], [ix, wy + wh / 2]], "install", { w: 0.75, width: 1.75 });
  });
  legendRow(s, 0.25, 4.85, 9.5, [
    { draw: (x, y) => Z.T(s, "abc", { x, y: y - 0.15, w: 0.5, h: 0.3, fontSize: F, bold: true, color: C.label, align: "center", valign: "middle" }), iw: 0.5, tw: 1.85, text: "pip install での名前" },
    { draw: (x, y) => Z.T(s, "abc", { x, y: y - 0.15, w: 0.5, h: 0.3, fontSize: F, bold: true, color: C.pink, align: "center", valign: "middle" }), iw: 0.5, tw: 1.5, text: "import での名前" },
    { draw: (x, y) => Z.arrow(s, [[x, y], [x + 0.5, y]], null, { width: 1.75 }), iw: 0.5, tw: 2.1, text: "site-packages への配置" },
  ]);
  await Z.save(p, `${OUT}/03_Pythonの2つのパッケージ.pptx`);
}

(async () => { await fig1(); await fig2(); await fig3(); })();
