// compact no.15 npm・pnpm・yarn・bun の図（図解ベストプラクティス準拠、記事用キャンバス 10×5.625in）
// 使い方: node 図生成スクリプト.js <出力ディレクトリ>
// 文字サイズ：最小 14pt（記事幅 800px で約 15.5px）、ボックス名 16pt
const Z = require("./zukai.js");
const path = require("path");
const OUT = process.argv[2] || ".";
const C = Z.C, MONO = "Menlo";
const F = 14, FN = 16;
const FS = () => Object.assign(Z.FS, {label: F, sub: F, arrow: F, box: FN});
const BUN = "00897B"; // bun 実行ファイルを示すアクセント（ティール）
const DIRLINE = "7F9CCF";

// 角丸ボックス（名前＋補足）。o: {line, lw, dash, fill, mono, sub, subMono, nameColor}
function rbox(s, x, y, w, h, name, o = {}) {
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.08, fill: {color: o.fill || C.white},
    line: {color: o.line || C.icon, width: o.lw || 1.5, dashType: o.dash ? "dash" : "solid"}});
  const runs = [{text: name, options: {bold: true, fontSize: o.nameSize || FN, color: o.nameColor || C.title, fontFace: o.mono ? MONO : undefined, breakLine: !!o.sub}}];
  if (o.sub) {
    const lines = o.sub.split("\n");
    lines.forEach((t, i) => runs.push({text: t, options: {fontSize: F, color: "4A4F57", fontFace: o.subMono ? MONO : undefined, breakLine: i < lines.length - 1}}));
  }
  Z.T(s, runs, {x: x + 0.04, y, w: w - 0.08, h, fontSize: F, align: "center", valign: "middle"});
  return {l: [x, y + h / 2], r: [x + w, y + h / 2], t: [x + w / 2, y], b: [x + w / 2, y + h], x, y, w, h};
}
// ディレクトリ枠（細い実線＋淡い塗り、内側左上に等幅の名前。name は "\n" で2行可）
function dir(s, x, y, w, h, name, o = {}) {
  s.addShape("rect", {x, y, w, h, fill: {color: o.fill || C.white}, line: {color: o.line || DIRLINE, width: 1}});
  const lines = name.split("\n");
  Z.T(s, lines.map((t, i) => ({text: t, options: {breakLine: i < lines.length - 1}})),
    {x: x + 0.1, y: y + 0.05, w: w - 0.15, h: 0.27 * lines.length, fontSize: F, bold: true, color: o.color || "3B5BDB", fontFace: MONO});
}
// 凡例。items: [{kind, text, w}]。o.vertical で縦並び（w は全体幅）
function legend(s, x, y, items, o = {}) {
  const v = !!o.vertical, rowH = 0.36, aw = v ? 0.4 : 0.5;
  const total = v ? o.w : 0.75 + items.reduce((a, i) => a + i.w, 0);
  const h = v ? 0.45 + items.length * rowH : 0.48;
  s.addShape("roundRect", {x, y, w: total, h, rectRadius: 0.08, fill: {color: C.white}, line: {color: C.grid, width: 0.75}});
  Z.T(s, "凡例", {x: x + 0.12, y: v ? y + 0.07 : y + 0.1, w: 0.6, h: 0.28, fontSize: F, bold: true, color: C.muted, valign: "middle"});
  let cx = v ? x + 0.15 : x + 0.75;
  items.forEach((it, i) => {
    const yy = v ? y + 0.55 + i * rowH : y + 0.24;
    if (it.kind === "solid") Z.arrow(s, [[cx, yy], [cx + aw, yy]], null);
    if (it.kind === "dash") Z.arrow(s, [[cx, yy], [cx + aw, yy]], null, {dash: true});
    if (it.kind === "red") Z.arrow(s, [[cx, yy], [cx + aw, yy]], null, {color: C.err, width: 1.75});
    if (it.kind === "bun") s.addShape("roundRect", {x: cx, y: yy - 0.11, w: aw, h: 0.22, rectRadius: 0.04, fill: {color: C.white}, line: {color: BUN, width: 2.5}});
    Z.T(s, it.text, {x: cx + aw + 0.1, y: yy - 0.15, w: (v ? total - 0.15 : it.w) - aw - 0.12, h: 0.3, fontSize: F, valign: "middle"});
    if (!v) cx += it.w;
  });
}

async function fig1() {
  const p = Z.article({title: "図1 パッケージマネージャとランタイムの位置づけ"}); FS();
  const s = Z.canvas(p);
  // 外部：npm レジストリ
  // パッケージマネージャ
  const PM = {x: 1.7, y: 0.7, w: 2.45, h: 4.25};
  Z.frame(s, PM.x, PM.y, PM.w, PM.h, "パッケージマネージャ");
  const rows = [["npm", "package-lock.json"], ["yarn ※", "yarn.lock"], ["pnpm", "pnpm-lock.yaml"], ["bun", "bun.lock"]];
  rows.forEach(([n, lock], i) => rbox(s, PM.x + 0.12, PM.y + 0.25 + i * 0.98, PM.w - 0.24, 0.8, n,
    {sub: lock, subMono: true, mono: true, line: n === "bun" ? BUN : C.icon, lw: n === "bun" ? 2.5 : 1.5}));
  // 外部：npm レジストリ（yarn と pnpm の隙間の高さ＝枠全体を指す）
  const regY = PM.y + 0.25 + 0.98 + 0.8 + 0.09;
  const reg = await Z.node(s, "ext", 0.55, regY, "npm\nレジストリ", null, {kind: "ext", w: 1.1});
  // プロジェクト
  const PJ = {x: 5.25, y: 0.7, w: 2.15, h: 4.25};
  Z.frame(s, PJ.x, PJ.y, PJ.w, PJ.h, "プロジェクト");
  const bx = PJ.x + 0.12, bw = PJ.w - 0.24;
  const pkg = rbox(s, bx, 0.95, bw, 0.8, "package.json", {mono: true, sub: "依存の宣言"});
  const lock = rbox(s, bx, 2.22, bw, 1.05, "ロックファイル", {sub: "解決済みバージョン\nintegrity ハッシュ"});
  const nm = rbox(s, bx, 3.75, bw, 0.8, "node_modules/", {mono: true, sub: "パッケージ実体"});
  // ランタイム（node_modules の高さを中心に上下対称）
  const RT = {x: 8.2, y: 3.18, w: 1.78, h: 1.77};
  Z.frame(s, RT.x, RT.y, RT.w, RT.h, "ランタイム");
  const rx = RT.x + 0.1, rw = RT.w - 0.2, nmc = nm.l[1];
  rbox(s, rx, nmc - 0.77, rw, 0.7, "Node.js", {sub: "V8"});
  rbox(s, rx, nmc + 0.07, rw, 0.7, "Bun", {sub: "JavaScriptCore", line: BUN, lw: 2.5});
  // 矢印（ラベルは矢印の上）
  Z.arrow(s, [reg.r, [PM.x, regY]], "tarball", {w: 0.85});
  // 右側の矢印は PM 枠全体に接続（縦のバス線）。特定ツールの行との対応に見せない
  const BUS = PM.x + PM.w + 0.08;
  s.addShape("line", {x: BUS, y: PM.y + 0.25, w: 0, h: 3.74, line: {color: C.arrow, width: 2.5}});
  Z.arrow(s, [pkg.l, [BUS, pkg.l[1]]], "読み込み", {w: 1.0});
  const ly = lock.l[1];
  Z.arrow(s, [[BUS, ly - 0.2], [lock.x, ly - 0.2]], "書き出し", {w: 1.0});
  Z.arrow(s, [[lock.x, ly + 0.25], [BUS, ly + 0.25]], "参照", {w: 1.0});
  Z.arrow(s, [[BUS, nmc], nm.l], "展開・配置", {w: 1.15});
  Z.arrow(s, [nm.r, [RT.x, nmc]], "import /\nrequire", {h: 0.55, w: 0.8});
  // 凡例（右上の空き）と注記
  legend(s, 7.98, 0.55, [{kind: "solid", text: "処理の流れ"}, {kind: "bun", text: "同一バイナリ"}], {vertical: true, w: 2.0});
  Z.note(s, 0.15, 5.1, 9.83, 0.42, "");
  Z.T(s, [{text: "※ Yarn Berry 既定の "}, {text: "nodeLinker: pnp", options: {fontFace: MONO}}, {text: " では node_modules の代わりに "},
    {text: ".pnp.cjs", options: {fontFace: MONO}}, {text: " で依存解決"}], {x: 0.27, y: 5.1, w: 9.5, h: 0.42, fontSize: F, valign: "middle"});
  await Z.save(p, path.join(OUT, "01_パッケージマネージャとランタイムの位置づけ.pptx"));
}

async function fig2() {
  const p = Z.article({title: "図2 npm と pnpm の node_modules の構造"}); FS();
  const s = Z.canvas(p);
  const M = (t) => ({text: t, options: {fontFace: MONO}});
  // ---- npm ----
  const A = {x: 0.15, y: 0.62, w: 3.3, h: 4.25};
  Z.frame(s, A.x, A.y, A.w, A.h, "npm：フラット配置");
  rbox(s, 0.3, 0.82, 3.0, 0.8, "package.json", {mono: true, sub: "dependencies: express", subMono: true});
  dir(s, 0.3, 1.85, 3.0, 2.2, "node_modules/");
  rbox(s, 0.5, 2.28, 2.6, 0.55, "express/", {mono: true});
  const dbgA = rbox(s, 0.5, 3.0, 2.6, 0.88, "debug/", {mono: true, sub: "express の依存\n巻き上げ配置", line: C.err, lw: 2});
  const idx = rbox(s, 2.2, 4.24, 1.1, 0.5, "index.js", {mono: true, nameSize: F});
  Z.arrow(s, [idx.t, [idx.t[0], dbgA.b[1]]], null, {color: C.err, width: 2});
  Z.T(s, [{text: "require('debug')", options: {fontFace: MONO, breakLine: true}}, {text: "未宣言でも解決"}],
    {x: 0.27, y: 4.18, w: 1.92, h: 0.62, fontSize: F, color: C.err, valign: "middle"});
  // ---- pnpm ----
  const B = {x: 3.6, y: 0.62, w: 6.38, h: 4.25};
  Z.frame(s, B.x, B.y, B.w, B.h, "pnpm：ストア＋リンク");
  dir(s, 3.72, 0.8, 4.46, 4.0, "node_modules/");
  const exL = rbox(s, 4.0, 1.2, 1.7, 0.66, "express", {mono: true, sub: "symlink", dash: true});
  Z.T(s, [{text: "require('debug')", options: {fontFace: MONO, breakLine: true}}, {text: "index.js から解決不可"}],
    {x: 5.88, y: 1.21, w: 2.25, h: 0.64, fontSize: F, color: C.title, valign: "middle"});
  dir(s, 3.9, 2.05, 4.16, 2.65, ".pnpm/", {fill: "F4F8FE"});
  dir(s, 4.0, 2.45, 2.0, 2.15, "express@4.21.2/\nnode_modules/", {color: C.muted, line: C.gray});
  const exR = rbox(s, 4.15, 3.12, 1.7, 0.66, "express/", {mono: true, sub: "実ディレクトリ"});
  const dbL = rbox(s, 4.15, 3.88, 1.7, 0.62, "debug", {mono: true, sub: "symlink", dash: true});
  dir(s, 6.08, 2.45, 1.9, 2.15, "debug@2.6.9/\nnode_modules/", {color: C.muted, line: C.gray});
  const dbR = rbox(s, 6.2, 3.88, 1.68, 0.62, "debug/", {mono: true, sub: "実ディレクトリ"});
  // シンボリックリンク（破線）
  Z.arrow(s, [exL.l, [3.81, exL.l[1]], [3.81, exR.l[1]], exR.l], null, {dash: true, width: 1.5});
  Z.arrow(s, [dbL.r, dbR.l], null, {dash: true, width: 1.5});
  // ストアとハードリンク（ファイル単位。実ディレクトリ内の各ファイルがストアを指す）
  const SX = 9.15, SY = exR.r[1];
  s.addImage({data: await Z.icon("db"), x: SX - 0.31, y: SY - 0.31, w: 0.62, h: 0.62, altText: "ストア"});
  Z.T(s, [{text: "ストア", options: {bold: true, color: C.label, breakLine: true}}, {text: "プロジェクト横断", options: {color: "4A4F57"}}],
    {x: 8.33, y: SY + 0.35, w: 1.64, h: 0.56, fontSize: F, align: "center"});
  Z.arrow(s, [exR.r, [SX - 0.37, SY]], null, {width: 1.5});
  Z.arrow(s, [dbR.r, [8.3, dbR.r[1]], [8.3, SY]], null, {head: "none", width: 1.5});
  const OY = 1.3;
  s.addImage({data: await Z.icon("storage"), x: SX - 0.31, y: OY - 0.31, w: 0.62, h: 0.62, altText: "other-app"});
  Z.T(s, [{text: "other-app/", options: {bold: true, color: C.label, fontFace: MONO, breakLine: true}}, {text: "同一バージョン", options: {color: "4A4F57"}}],
    {x: 8.3, y: OY + 0.34, w: 1.7, h: 0.56, fontSize: F, align: "center"});
  Z.arrow(s, [[SX, OY + 0.95], [SX, SY - 0.37]], "ハード\nリンク", {w: 0.8, h: 0.55, width: 1.5});
  legend(s, 0.15, 5.02, [{kind: "dash", text: "シンボリックリンク", w: 2.55}, {kind: "solid", text: "ハードリンク（ファイル単位）", w: 3.45},
    {kind: "red", text: "未宣言パッケージの解決", w: 3.05}]);
  await Z.save(p, path.join(OUT, "02_npmとpnpmのnode_modulesの構造.pptx"));
}

async function fig3() {
  const p = Z.article({title: "図3 依存パッケージのインストールスクリプトの扱い"}); FS();
  const s = Z.canvas(p);
  const Y = 1.0, Y2 = Y + 1.1;
  Z.point(s, 0.2, Y, "start");
  const a = rbox(s, 0.58, Y - 0.32, 1.95, 0.64, "依存の取得・展開");
  const b = rbox(s, 2.75, Y - 0.5, 2.6, 1.0, "スクリプト検出", {sub: "preinstall / install\npostinstall", subMono: true});
  Z.arrow(s, [[0.33, Y], a.l], null);
  Z.arrow(s, [a.r, b.l], null);
  const dx = 5.85; Z.decision(s, dx, Y, 0.56);
  Z.T(s, "許可リスト照合", {x: 5.4, y: Y - 0.8, w: 1.5, h: 0.32, fontSize: F, bold: true, color: C.title, align: "center", valign: "bottom"});
  Z.arrow(s, [b.r, [dx - 0.28, Y]], null);
  // 既定は拒否：未許可を本流（上段）に、許可済みを下段に
  const ng = rbox(s, 7.15, Y - 0.35, 1.95, 0.7, "スクリプト不実行");
  const ok = rbox(s, 7.15, Y2 - 0.35, 1.95, 0.7, "スクリプト実行", {line: C.err, lw: 2});
  Z.arrow(s, [[dx + 0.28, Y], ng.l], "[未許可]", {w: 1.0});
  Z.arrow(s, [[dx, Y + 0.28], [dx, Y2], ok.l], "[許可済み]", {seg: 1, w: 1.25});
  // 合流して終了
  const ex = 9.55, ey = (Y + Y2) / 2;
  Z.arrow(s, [ng.r, [ex, Y], [ex, ey - 0.16]], null);
  Z.arrow(s, [ok.r, [ex, Y2], [ex, ey + 0.16]], null);
  Z.point(s, ex, ey, "end");
  Z.T(s, "⚠ 許可済みなら悪性コードも実行対象", {x: 0.9, y: Y2 - 0.16, w: 4.7, h: 0.32, fontSize: F, bold: true, color: C.err, align: "right", valign: "middle"});
  // 表：ツールごとの違い
  const Mn = (t) => ({text: t, options: {fontFace: MONO}});
  const rows = [
    ["ツール", "既定ブロック", "許可リストの設定", "未許可時"],
    ["npm", "v12.0.0〜", [{text: "package.json の "}, Mn("allowScripts")], "スキップ"],
    ["Yarn Berry", "v4.14.0〜", [{text: "package.json の "}, Mn("dependenciesMeta.<pkg>.built")], "スキップ"],
    ["pnpm", "v10.0.0〜", [{text: "pnpm-workspace.yaml の "}, Mn("allowBuilds"), {text: "", options: {breakLine: true}}, {text: "v10 は "}, Mn("onlyBuiltDependencies")],
      [{text: "v11〜 はエラー", options: {breakLine: true}}, {text: "v10 はスキップ"}]],
    ["bun", "v1.0.0〜", [{text: "package.json の "}, Mn("trustedDependencies"), {text: "", options: {breakLine: true}}, {text: "未設定時は組み込みリスト"}], "スキップ"],
  ];
  const cell = (t, head) => ({text: Array.isArray(t) ? t : String(t), options: {bold: head, color: C.title, fill: {color: head ? C.frame : C.white}}});
  s.addTable(rows.map((r, i) => r.map((t) => cell(t, i === 0))), {x: 0.2, y: 2.75, colW: [1.25, 1.6, 5.1, 1.6], fontFace: Z.FONT.en, fontSize: F,
    border: {type: "solid", pt: 0.75, color: C.grid}, margin: 0.06, valign: "middle", rowH: [0.42, 0.42, 0.42, 0.7, 0.7]});
  await Z.save(p, path.join(OUT, "03_インストールスクリプトの扱い.pptx"));
}

(async () => { await fig1(); await fig2(); await fig3(); })();
