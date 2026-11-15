// compact no.38「ベースラインスキャン（ZAP×GitHub Actions）」の図1〜3（zukai-diagrams 準拠）
// 使い方: node figs.js <出力フォルダ>   → 続けて bash render.sh <出力フォルダ> で PNG（2000px）
// 文字は 14pt 以上（名前は 16pt 太字）。記事幅 約800px でも読める大きさにする
// 色の意味：teal＝コード・依存を中から見るチェック／navy＝動くアプリを外から見るチェック／pink 枠＝ベースラインスキャン／red＝FAIL・CI 失敗／green＝CI 成功
const Z = require("./zukai.js");
const path = require("path");
const OUT = process.argv[2] || ".";

const K = {
  navy: {c: "2E5E8E", f: "EEF3F9"},
  teal: {c: "1E8A82", f: "E8F5F3"},
  gray: {c: "6B7280", f: "F1F3F4"},
  red: {c: "C0392B", f: "FBEEEC"},
  green: {c: "2E7D32", f: "EDF6EE"},
};
const MUTED = Z.C.muted, PINK = Z.C.pink;

function art() {
  const p = Z.article({title: "ベースラインスキャン 図", author: "Nico"});
  Object.assign(Z.FS, {label: 14, sub: 14, arrow: 14, box: 14});
  return p;
}
// 見出し＋1行の箱
function chip(s, x, y, w, h, head, sub, k, o = {}) {
  if (o.accent) s.addShape("roundRect", {x: x - 0.07, y: y - 0.07, w: w + 0.14, h: h + 0.14, rectRadius: 0.13, fill: {type: "none"}, line: {color: PINK, width: 2.5}});
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.1, fill: {color: K[k].f}, line: {color: K[k].c, width: 1.5}});
  const runs = [{text: head, options: {bold: true, fontSize: 16, color: K[k].c, breakLine: !!sub}}];
  if (sub) runs.push({text: sub, options: {fontSize: 14, color: Z.C.text}});
  Z.T(s, runs, {x: x + 0.05, y, w: w - 0.1, h, align: "center", valign: "middle", lineSpacingMultiple: 1.05});
  return {l: [x, y + h / 2], r: [x + w, y + h / 2], t: [x + w / 2, y], b: [x + w / 2, y + h]};
}
// 凡例（下端に横1列、中央寄せ）
function clegend(s, items, y, colW = 1.9) {
  const h = 0.42, ww = 0.7 + items.reduce((a, it) => a + (it[2] || colW), 0), x0 = (10 - ww) / 2;
  s.addShape("roundRect", {x: x0, y, w: ww, h, rectRadius: 0.08, fill: {color: "FFFFFF"}, line: {color: Z.C.grid, width: 0.75}});
  Z.T(s, "凡例", {x: x0 + 0.1, y: y + 0.07, w: 0.56, h: 0.28, fontSize: 14, bold: true, color: MUTED, valign: "middle"});
  let sx = x0 + 0.7;
  for (const [kind, text, cw0] of items) {
    const cw = cw0 || colW, yy = y + h / 2;
    if (K[kind]) s.addShape("rect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, fill: {color: K[kind].f}, line: {color: K[kind].c, width: 1.5}});
    else if (kind === "accent") s.addShape("rect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, fill: {color: "FFFFFF"}, line: {color: PINK, width: 2.5}});
    else if (kind === "accentdash") s.addShape("rect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, fill: {type: "none"}, line: {color: PINK, width: 2.25, dashType: "dash"}});
    else if (kind === "dashbox") s.addShape("rect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, fill: {type: "none"}, line: {color: Z.C.rule, width: 1.25, dashType: "dash"}});
    else if (kind === "dash") s.addShape("rect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, fill: {type: "none"}, line: {color: K.navy.c, width: 1.25, dashType: "dash"}});
    else if (kind === "frame") s.addShape("roundRect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, rectRadius: 0.05, fill: {color: Z.C.frame}, line: {type: "none"}});
    else if (kind === "open") Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 1.5, dash: true});
    else Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 1.5});
    Z.T(s, text, {x: sx + 0.48, y: yy - 0.14, w: cw - 0.5, h: 0.28, fontSize: 14, valign: "middle"});
    sx += cw;
  }
}

// ---- 図1：開発フローとスキャンの位置 ----
async function fig1() {
  const p = art(), s = Z.canvas(p);
  const COLS = [
    {x: 0.3, head: "push", sub: "push ごと"},
    {x: 3.55, head: "PR の CI", sub: "PR の作成・更新ごと"},
    {x: 6.8, head: "ステージング", sub: "夜間・リリース前"},
  ];
  const W = 2.9, HY = 0.25, HH = 0.8, HW = 2.5, HO = (2.9 - 2.5) / 2;
  COLS.forEach((c, i) => {
    s.addText([{text: c.head, options: {bold: true, fontSize: 16, color: "FFFFFF", breakLine: true}},
      {text: c.sub, options: {fontSize: 14, color: "FFFFFF"}}],
    {shape: "roundRect", rectRadius: 0.12, x: c.x + HO, y: HY, w: HW, h: HH, fill: {color: Z.C.title}, line: {type: "none"},
      fontFace: Z.FONT.en, align: "center", valign: "middle", margin: 0});
    if (i < COLS.length - 1) Z.arrow(s, [[c.x + HO + HW + 0.04, HY + HH / 2], [COLS[i + 1].x + HO - 0.04, HY + HH / 2]], null, {width: 2});
  });
  const CH = 0.82, G = 0.2, Y0 = 1.35;
  const at = (i, r) => [COLS[i].x, Y0 + r * (CH + G)];
  chip(s, ...at(0, 0), W, CH, "シークレットスキャン", "コミット内のキー・トークン", "teal");
  chip(s, ...at(1, 0), W, CH, "SAST", "ソースコード", "teal");
  chip(s, ...at(1, 1), W, CH, "SCA", "依存ライブラリ", "teal");
  chip(s, ...at(1, 2), W, CH, "ベースラインスキャン", "DAST・パッシブ", "navy", {accent: true});
  chip(s, ...at(2, 0), W, CH, "フルスキャン", "DAST・アクティブ", "navy");
  const [bx, by] = at(1, 2);
  Z.T(s, "攻撃なし・数分", {x: bx, y: by + CH + 0.08, w: W, h: 0.3, fontSize: 14, bold: true, color: PINK, align: "center"});
  const [fx, fy] = at(2, 0);
  Z.T(s, "攻撃あり・長時間", {x: fx, y: fy + CH + 0.08, w: W, h: 0.3, fontSize: 14, bold: true, color: K.navy.c, align: "center"});
  clegend(s, [["teal", "静的（コード・依存）", 2.6], ["navy", "動的（実行中のアプリ）", 2.8], ["accent", "この記事の対象", 2.1]], 4.95);
  await Z.save(p, path.join(OUT, "01_開発フローとスキャンの位置.pptx"));
}

// ---- 図2：GitHub Actions でのベースラインスキャンの構成（アイコン付きアーキテクチャ図） ----
// アイコン：icons/（Mac の アイコン・素材 から。ロゴ＝テック・SaaSロゴ総合、汎用＝Tabler outline）
const fs = require("fs"), sharp = require("sharp");
async function ico(name, color) {  // SVG → PNG（Tabler は currentColor を塗り替え）
  let svg = fs.readFileSync(path.join(__dirname, "icons", name + ".svg"), "utf8");
  if (color) svg = svg.replace(/currentColor/g, "#" + color);
  const png = await sharp(Buffer.from(svg), {density: 1200}).resize(512, 512, {fit: "contain", background: {r: 0, g: 0, b: 0, alpha: 0}}).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}
// アイコン＋名前＋説明1行
async function inode(s, icon, color, cx, cy, label, duty, o = {}) {
  const size = o.size || 0.6, tw = o.w || 1.8;
  s.addImage({data: await ico(icon, color), x: cx - size / 2, y: cy - size / 2, w: size, h: size, altText: label});
  const runs = [{text: label, options: {bold: true, fontSize: 16, color: o.lc || Z.C.title, breakLine: !!duty}}];
  if (duty) runs.push({text: duty, options: {fontSize: 14, color: MUTED}});
  Z.T(s, runs, {x: cx - tw / 2, y: cy + size / 2 + 0.05, w: tw, h: duty ? 0.6 : 0.32, align: "center"});
  const r = size / 2 + 0.08;
  return {l: [cx - r, cy], r: [cx + r, cy], t: [cx, cy - r], b: [cx, cy + size / 2 + (duty ? 0.68 : 0.4)]};
}
// 見出しにアイコンを付けた枠
async function iframe(s, x, y, w, h, icon, title, o = {}) {
  if (o.dashed) s.addShape("rect", {x, y, w, h, fill: {color: "FFFFFF"}, line: {color: o.line || Z.C.rule, width: o.lw || 1.25, dashType: "dash"}});
  else s.addShape("roundRect", {x, y, w, h, rectRadius: 0.18, fill: {color: Z.C.frame}, line: {color: Z.C.frameLine, width: 1}});
  s.addImage({data: await ico(icon, o.ic), x: x + 0.12, y: y + 0.1, w: 0.34, h: 0.34});
  Z.T(s, title, {x: x + 0.52, y: y + 0.1, w: w - 0.6, h: 0.34, fontSize: o.fs || 15, bold: true, color: o.tc || Z.C.title, valign: "middle"});
}
async function fig2() {
  const p = art(), s = Z.canvas(p);
  const BLUE = Z.C.icon;
  // 左：開発者 → GitHub
  const dev = await inode(s, "user", Z.C.title, 0.6, 0.75, "開発者", null, {w: 1.2});
  const gh = await inode(s, "github-icon", null, 0.6, 2.55, "GitHub", null, {w: 1.1});
  Z.arrow(s, [dev.b, gh.t], "① PR", {w: 0.7, width: 1.75});
  // ランナー
  const RX = 1.62, RY = 0.12, RW = 6.0, RH = 4.6;
  await iframe(s, RX, RY, RW, RH, "github-actions", "GitHub Actions ランナー（ubuntu-latest）");
  Z.arrow(s, [gh.r, [RX, gh.r[1]]], "② 起動", {w: 0.85, width: 1.75, dash: true, dx: -0.02});
  // Docker コンテナ2つ
  const CY = 0.82, CH = 2.8, CW = 2.05, AX = 1.88, ZX = 5.3;
  await iframe(s, AX, CY, CW, CH, "docker-icon", "アプリのコンテナ", {dashed: true, fs: 14});
  await iframe(s, ZX, CY, CW, CH, "docker-icon", "ZAP のコンテナ", {dashed: true, fs: 14, line: PINK, lw: 2.25});
  const app = await inode(s, "app-window", BLUE, AX + CW / 2, 1.85, "スキャン対象アプリ", "ポート 3000 を公開", {w: 1.95});
  const zap = await inode(s, "radar", PINK, ZX + CW / 2, 1.85, "ZAP", "zap-baseline.py", {w: 1.95, lc: PINK});
  Z.T(s, "--network=host", {x: ZX, y: 3.25, w: CW, h: 0.3, fontSize: 14, color: MUTED, align: "center"});
  Z.T(s, "⑤ パッシブスキャン", {x: ZX, y: 2.9, w: CW, h: 0.3, fontSize: 14, bold: true, color: PINK, align: "center"});
  Z.arrow(s, [[ZX, 1.62], [AX + CW, 1.62]], "③ クロール", {w: 1.35, width: 1.75});
  Z.arrow(s, [[AX + CW, 2.12], [ZX, 2.12]], "④ レスポンス", {w: 1.35, width: 1.75, below: true});
  // rules.tsv
  const rules = await inode(s, "file-settings", MUTED, 4.0, 4.0, "rules.tsv", null, {size: 0.5, w: 1.4});
  Z.arrow(s, [rules.r, [ZX + CW / 2, rules.r[1]], [ZX + CW / 2, CY + CH]], "判定ルール", {seg: 0, w: 1.3, width: 1.5});
  // 右：成果物
  const rep = await inode(s, "file-report", BLUE, 8.85, 1.0, "⑥ レポート", "アーティファクト", {w: 1.9});
  const chk = await inode(s, "circle-check", MUTED, 8.85, 3.0, "⑦ PR のチェック", "終了コード＋fail_action", {w: 2.3});
  const bx = 7.95, my = 2.1;
  Z.arrow(s, [[ZX + CW, my], [bx, my]], null, {width: 1.5, head: "none"});
  Z.arrow(s, [[bx, my], [bx, rep.l[1]], rep.l], null, {width: 1.5});
  Z.arrow(s, [[bx, my], [bx, chk.l[1]], chk.l], null, {width: 1.5});
  clegend(s, [["line", "リクエスト・データ", 2.35], ["open", "起動", 1.1], ["dashbox", "Docker コンテナ", 2.15], ["accentdash", "この記事の対象", 2.05]], 5.0);
  await Z.save(p, path.join(OUT, "02_GitHub Actionsでのベースラインスキャンの流れ.pptx"));
}

// ---- 図3：アラートの判定から CI の結果まで ----
async function fig3() {
  const p = art(), s = Z.canvas(p);
  const XS = [0.3, 2.85, 5.25, 7.65], W = 2.0, H = 0.72, YS = [1.0, 2.05, 3.1];
  const HEADS = ["rules.tsv の判定", "終了コード", "-I オプション適用後", "CI の結果"];
  const SUBS = [" ", "zap-baseline.py", "WARN 時の 2 を抑止", "fail_action: true"];
  HEADS.forEach((h, i) => Z.T(s, [{text: h, options: {bold: true, fontSize: 16, color: Z.C.title, breakLine: true}},
    {text: SUBS[i], options: {fontSize: 14, color: MUTED}}], {x: XS[i] - 0.2, y: 0.2, w: W + 0.4, h: 0.65, align: "center", valign: "middle"}));
  const ROWS = [
    ["IGNORE・INFO", "gray", "0", "gray", "0", "gray", "成功", "green"],
    ["WARN", "navy", "2", "navy", "0", "gray", "成功", "green"],
    ["FAIL", "red", "1", "red", "1", "red", "失敗", "red"],
  ];
  ROWS.forEach((r, j) => {
    const y = YS[j];
    const b = [0, 1, 2, 3].map((i) => chip(s, XS[i], y, W, H, r[i * 2], null, r[i * 2 + 1]));
    for (let i = 0; i < 3; i++) Z.arrow(s, [b[i].r, b[i + 1].l], null, {width: 1.75});
  });
  Z.T(s, "前提：1種類の判定のアラートのみ／エラー（3）は常に失敗", {x: 0.3, y: 4.0, w: 9.4, h: 0.3, fontSize: 14, color: MUTED, align: "center"});
  clegend(s, [["gray", "IGNORE・INFO", 2.0], ["navy", "WARN", 1.3], ["red", "FAIL・CI 失敗", 2.0], ["green", "CI 成功", 1.4]], 4.6);
  await Z.save(p, path.join(OUT, "03_アラートの判定からCIの結果まで.pptx"));
}

(async () => { await fig1(); await fig2(); await fig3(); })();
