// compact no.41「subfinder の機能とできること」の図1〜5（zukai-diagrams 準拠）
// 使い方: node figs.js <出力フォルダ>   → 続けて bash render.sh <出力フォルダ> で PNG（2000px）
// 文字は 14pt 以上（名前は 16pt 太字）。記事幅 約800px でも読める大きさにする
// 数値・動作は subfinder v2.17.0（タグ、コミット c97f258、2026-10-08）のソースで確認したもの
// 色の意味（全図共通）：navy＝subfinder・ツールの処理／teal＝情報源／green＝出力・実行／gray＝対象・除外・スキップ／pink 破線＝許可が必要な範囲
const Z = require("./zukai.js");
const path = require("path");
const tb = require("react-icons/tb");
const OUT = process.argv[2] || ".";

Object.assign(Z.ICON, {terminal: tb.TbTerminal2, cert: tb.TbCertificate, pdns: tb.TbDatabase, scan: tb.TbWorldSearch,
  intel: tb.TbShieldSearch, target: tb.TbServer, list: tb.TbListDetails});

const K = {
  navy: {c: "2E5E8E", f: "EEF3F9"},
  teal: {c: "1E8A82", f: "E8F5F3"},
  gray: {c: "6B7280", f: "F1F3F4"},
  green: {c: "2E7D32", f: "EDF6EE"},
};
const MUTED = Z.C.muted, PINK = Z.C.pink;

function art() {
  const p = Z.article({title: "subfinder 図", author: "Nico"});
  Object.assign(Z.FS, {label: 16, sub: 14, arrow: 14, box: 14});
  return p;
}
// 見出し＋説明（1〜2行）の箱。o.dashed：任意の処理（破線）、o.cfg：設定（白地＋灰の破線）
function chip(s, x, y, w, h, head, sub, k, o = {}) {
  const fill = o.cfg ? "FFFFFF" : K[k].f, dashed = o.dashed || o.cfg;
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.1, fill: {color: fill}, line: {color: K[k].c, width: dashed ? 1.75 : 1.5, dashType: dashed ? "dash" : "solid"}});
  const runs = [{text: head, options: {bold: true, fontSize: 16, color: K[k].c, breakLine: !!sub}}];
  if (sub) sub.split("\n").forEach((t, i, a) => runs.push({text: t, options: {fontSize: 14, color: Z.C.text, breakLine: i < a.length - 1}}));
  Z.T(s, runs, {x: x + 0.05, y, w: w - 0.1, h, align: "center", valign: "middle", lineSpacingMultiple: 1.05});
  return {l: [x, y + h / 2], r: [x + w, y + h / 2], t: [x + w / 2, y], b: [x + w / 2, y + h]};
}
// 列見出し
const head = (s, x, y, w, text, o = {}) => Z.T(s, text, {x, y, w, h: 0.34, fontSize: 16, bold: true, color: Z.C.title, align: o.align || "center", valign: "middle"});
const note = (s, x, y, w, text) => Z.T(s, text, {x, y, w, h: 0.3, fontSize: 14, color: MUTED, align: "center"});
const dot = (s, x, y) => s.addShape("ellipse", {x: x - 0.05, y: y - 0.05, w: 0.1, h: 0.1, fill: {color: Z.C.arrow}, line: {type: "none"}});
// アイコン＋名前＋説明1行
async function inode(s, icon, color, cx, cy, label, duty, o = {}) {
  const size = o.size || 0.58, tw = o.w || 1.9;
  s.addImage({data: await Z.icon(icon, color), x: cx - size / 2, y: cy - size / 2, w: size, h: size, altText: label});
  const runs = [{text: label, options: {bold: true, fontSize: 16, color: o.lc || Z.C.title, breakLine: !!duty}}];
  if (duty) runs.push({text: duty, options: {fontSize: 14, color: MUTED}});
  Z.T(s, runs, {x: cx - tw / 2, y: cy + size / 2 + 0.04, w: tw, h: duty ? 0.6 : 0.32, align: "center"});
  const r = size / 2 + 0.08;
  return {l: [cx - r, cy], r: [cx + r, cy], t: [cx, cy - r], b: [cx, cy + size / 2 + (duty ? 0.66 : 0.4)]};
}
// 凡例（下端に横1列、中央寄せ）
function clegend(s, items, y, colW = 1.9) {
  const h = 0.42, ww = 0.7 + items.reduce((a, it) => a + (it[2] || colW), 0), x0 = (10 - ww) / 2;
  s.addShape("roundRect", {x: x0, y, w: ww, h, rectRadius: 0.08, fill: {color: "FFFFFF"}, line: {color: Z.C.grid, width: 0.75}});
  Z.T(s, "凡例", {x: x0 + 0.1, y: y + 0.07, w: 0.56, h: 0.28, fontSize: 14, bold: true, color: MUTED, valign: "middle"});
  let sx = x0 + 0.7;
  for (const [kind, text, cw0] of items) {
    const cw = cw0 || colW, yy = y + h / 2, r = {x: sx, y: yy - 0.1, w: 0.36, h: 0.2};
    if (K[kind]) s.addShape("rect", {...r, fill: {color: K[kind].f}, line: {color: K[kind].c, width: 1.5}});
    else if (kind === "accentdash") s.addShape("rect", {...r, fill: {type: "none"}, line: {color: PINK, width: 2.25, dashType: "dash"}});
    else if (kind === "dashbox") s.addShape("rect", {...r, fill: {color: K.navy.f}, line: {color: K.navy.c, width: 1.75, dashType: "dash"}});
    else if (kind === "cfgbox") s.addShape("rect", {...r, fill: {color: "FFFFFF"}, line: {color: K.gray.c, width: 1.75, dashType: "dash"}});
    else if (kind === "none") Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 1.5, dash: true, color: K.gray.c, head: "none"});
    else if (kind === "open") Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 1.5, dash: true});
    else Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 1.5});
    Z.T(s, text, {x: sx + 0.48, y: yy - 0.14, w: cw - 0.5, h: 0.28, fontSize: 14, valign: "middle"});
    sx += cw;
  }
}

// ---- 図1：パッシブなサブドメイン列挙の全体像 ----
async function fig1() {
  const p = art(), s = Z.canvas(p);
  const SX = 1.2, SY = 1.75;
  // 左：subfinder と出力
  const sf = await inode(s, "terminal", K.navy.c, SX, SY, "subfinder", "自分の端末", {lc: K.navy.c});
  const out = await inode(s, "list", K.green.c, SX, 3.65, "サブドメイン一覧", "重複排除済み", {w: 2.1});
  Z.arrow(s, [sf.b, out.t], "③ 出力", {w: 1.0, width: 1.75});
  // 中央：情報源
  const FX = 3.35, FY = 0.95, FW = 4.1, FH = 3.45;
  Z.frame(s, FX, FY, FW, FH, null);
  head(s, FX, FY + 0.1, FW, "パッシブな情報源（第三者）");
  const C1 = FX + 1.05, C2 = FX + 3.05, R1 = FY + 1.0, R2 = FY + 2.45, TEAL = K.teal.c;
  await inode(s, "cert", TEAL, C1, R1, "CT ログ", "crt.sh など", {size: 0.52});
  await inode(s, "pdns", TEAL, C2, R1, "パッシブ DNS", "SecurityTrails など", {size: 0.52, w: 2.0});
  await inode(s, "scan", TEAL, C1, R2, "スキャン DB", "Shodan・Censys など", {size: 0.52, w: 2.0});
  await inode(s, "intel", TEAL, C2, R2, "脅威情報", "VirusTotal など", {size: 0.52});
  Z.arrow(s, [[sf.r[0], SY - 0.24], [FX, SY - 0.24]], "① 問い合わせ", {w: 1.5, width: 1.75});
  Z.arrow(s, [[FX, SY + 0.26], [sf.r[0], SY + 0.26]], "② ホスト名", {w: 1.2, width: 1.75});
  // 右：対象（通信なし）。情報源の枠の上を通す
  const tg = await inode(s, "target", K.gray.c, 8.6, SY + 0.25, "対象のサーバー", "example.com", {w: 2.0});
  const LY = 0.55;
  Z.arrow(s, [[sf.t[0], sf.t[1] - 0.02], [sf.t[0], LY], [tg.t[0], LY], [tg.t[0], tg.t[1] - 0.02]], null, {dash: true, color: K.gray.c, head: "none", width: 1.75});
  Z.T(s, [{text: "×  ", options: {bold: true, color: "C0392B", fontSize: 18}}, {text: "対象への直接の通信なし", options: {bold: true, color: K.gray.c}}],
    {x: 3.6, y: LY - 0.42, w: 3.6, h: 0.36, fontSize: 14, align: "center", valign: "middle"});
  clegend(s, [["line", "データの流れ", 1.95], ["none", "通信なし", 1.45], ["navy", "subfinder", 1.55], ["teal", "情報源", 1.25], ["green", "出力", 1.05], ["gray", "対象", 1.05]], 4.95);
  await Z.save(p, path.join(OUT, "01_パッシブなサブドメイン列挙の全体像.pptx"));
}

// ---- 図2：情報源の選び方と API キー ----
async function fig2() {
  const p = art(), s = Z.canvas(p);
  const X1 = 0.25, W1 = 2.75, X2 = 3.6, W2 = 2.45, X3 = 6.95, W3 = 2.75;
  head(s, X1, 0.08, W1, "情報源の選択");
  head(s, X2, 0.08, W2, "キーの要否");
  head(s, X3, 0.08, W3, "実行時の扱い");
  // 左：選択の手順（上から順に適用）
  const FY = 0.52, FB = 3.32;
  Z.frame(s, X1, FY, W1, FB - FY, null);
  const CW = W1 - 0.3, CH = 0.62, CX = X1 + 0.15, CYS = [0.66, 1.6, 2.54];
  const a = [
    chip(s, CX, CYS[0], CW, CH, "基本の集合", "既定 40・-all 54・-s 指定", "navy"),
    chip(s, CX, CYS[1], CW, CH, "-es", "指定した情報源の除外", "navy", {dashed: true}),
    chip(s, CX, CYS[2], CW, CH, "-recursive", "サブドメイン入力に対応", "navy", {dashed: true}),
  ];
  for (let i = 0; i < 2; i++) Z.arrow(s, [a[i].b, a[i + 1].t], null, {width: 1.5});
  // 中：キーの要否
  const RH = 0.72, RY = [0.55, 1.55, 2.55];
  const mid = [["キー不要", "例：crt.sh"], ["キー任意", "例：HackerTarget"], ["キー必須", "例：Shodan・Censys"]]
    .map(([h, sub], i) => chip(s, X2, RY[i], W2, RH, h, sub, "teal"));
  // 左 → 中（枠の右端から出してバスで分岐）
  const BX = X1 + W1 + 0.3, MY = mid[1].l[1];
  Z.arrow(s, [[X1 + W1, MY], [BX, MY]], null, {width: 1.5, head: "none"});
  Z.arrow(s, [[BX, mid[0].l[1]], [BX, mid[2].l[1]]], null, {width: 1.5, head: "none"});
  mid.forEach((m) => Z.arrow(s, [[BX, m.l[1]], m.l], null, {width: 1.5}));
  dot(s, BX, MY);
  // 右：実行時の扱い
  const res = [
    chip(s, X3, RY[0], W3, RH, "常に実行", null, "green"),
    chip(s, X3, RY[1], W3, RH, "常に実行", "キーありで結果増", "green"),
    chip(s, X3, RY[2], W3, RH, "キーありのみ実行", "キーなしは原則スキップ", "gray"),
  ];
  mid.forEach((m, i) => Z.arrow(s, [m.r, res[i].l], null, {width: 1.5}));
  // 下：キーの設定（2つを合流させて1本に）
  const KY = 3.95, KH = 0.66, JY = 3.68, TX = res[2].b[0];
  const k1 = chip(s, 3.4, KY, 2.9, KH, "provider-config.yaml", "情報源ごとに複数キー", "gray", {cfg: true});
  const k2 = chip(s, X3, KY, W3, KH, "環境変数（優先）", "<情報源名>_API_KEY", "gray", {cfg: true});
  Z.arrow(s, [k1.t, [k1.t[0], JY]], null, {width: 1.5, head: "none"});
  Z.arrow(s, [k2.t, [k2.t[0], JY]], null, {width: 1.5, head: "none"});
  Z.arrow(s, [[k1.t[0], JY], [k2.t[0], JY]], null, {width: 1.5, head: "none"});
  Z.arrow(s, [[TX, JY], res[2].b], "API キー", {width: 1.5, w: 1.1});
  dot(s, TX, JY);
  clegend(s, [["navy", "処理", 1.05], ["teal", "情報源の区分", 1.9], ["dashbox", "任意", 1.05], ["green", "実行", 1.05], ["gray", "原則スキップ", 1.75], ["cfgbox", "キーの設定", 1.6]], 4.95);
  await Z.save(p, path.join(OUT, "02_情報源の選び方とAPIキー.pptx"));
}

// ---- 図3：結果の後処理と出力形式 ----
async function fig3() {
  const p = art(), s = Z.canvas(p);
  const W = 1.7, H = 0.82, Y1 = 0.3, XS = [0.25, 2.2, 4.15, 6.1, 8.05];
  const steps = [["情報源の結果", "並列に受信", "teal"], ["正規化", "小文字化・*. 除去", "navy"], ["検証", "配下のドメインか", "navy"],
    ["フィルタ", "-m・-f・正規表現", "navy"], ["重複排除", "情報源の記録", "navy"]];
  const b = steps.map(([h, sub, k], i) => chip(s, XS[i], Y1, W, H, h, sub, k));
  for (let i = 0; i < 4; i++) Z.arrow(s, [b[i].r, b[i + 1].l], null, {width: 1.75});
  note(s, XS[2] - 0.1, Y1 + H + 0.06, W + 0.2, "範囲外は破棄");
  note(s, XS[3] - 0.1, Y1 + H + 0.06, W + 0.2, "条件外は破棄");
  // -active（任意）
  const AY = 1.6, AW = 3.2;
  const act = chip(s, XS[4] + W - AW, AY, AW, H, "-active（任意）", "名前解決・ワイルドカード除去", "navy", {dashed: true});
  Z.arrow(s, [b[4].b, [b[4].b[0], AY]], null, {width: 1.75});
  // 出力形式
  const OY = 3.05, OW = 2.27, OXS = [0.25, 2.66, 5.07, 7.48];
  const outs = [["テキスト（既定）", "1 行 1 ホスト"], ["JSONL（-oJ）", "host・input・source"], ["情報源つき（-cs）", "-oJ で sources 配列"], ["IP つき（-oI）", "-active 時のみ"]];
  const ob = outs.map(([h, sub], i) => chip(s, OXS[i], OY, OW, H, h, sub, "green"));
  note(s, OXS[2], OY + H + 0.04, OW, "-active 時は無効");
  const BY = OY - 0.32;
  Z.arrow(s, [act.b, [act.b[0], BY]], null, {width: 1.75, head: "none"});
  Z.arrow(s, [[ob[0].t[0], BY], [ob[3].t[0], BY]], null, {width: 1.75, head: "none"});
  ob.forEach((o) => Z.arrow(s, [[o.t[0], BY], o.t], null, {width: 1.75}));
  dot(s, act.b[0], BY);
  note(s, 0.3, OY + H + 0.42, 9.34, "出力先：標準出力・-o（追記）・-oD（ドメインごと）");
  clegend(s, [["teal", "情報源", 1.4], ["navy", "subfinder の処理", 2.2], ["dashbox", "任意の処理", 1.7], ["green", "出力形式", 1.5]], 4.95);
  await Z.save(p, path.join(OUT, "03_結果の後処理と出力形式.pptx"));
}

// ---- 図4：-active によるワイルドカード除去 ----
async function fig4() {
  const p = art(), s = Z.canvas(p);
  const W = 2.25, XA = 0.3, XB = 3.75, XC = 7.2, OW = 2.5;
  head(s, XA, 0.08, 6.5, "① ワイルドカード判定（ドメインごと・最初のみ）", {align: "left"});
  const Y1 = 0.55, H1 = 0.95;
  const r1 = chip(s, XA, Y1, W, H1, "ランダムなホスト名", "<xid>.example.com", "navy");
  const d1 = chip(s, XB, Y1, W, H1, "DNS リゾルバ", "既定は公開 10 個\n-r：置換・-rL：追加", "gray");
  const wi = chip(s, XC, Y1, OW, H1, "ワイルドカード IP", "応答した IP の集合", "navy");
  Z.arrow(s, [r1.r, d1.l], "最大 3 回", {w: 1.2, width: 1.75});
  Z.arrow(s, [d1.r, wi.l], "応答 IP", {w: 1.0, width: 1.75});
  head(s, XA, 1.85, 6.0, "② サブドメインごとの確認", {align: "left"});
  const Y2 = 2.95, H = 0.8;
  const c2 = chip(s, XA, Y2, W, H, "候補サブドメイン", "後処理済みの一覧", "navy");
  const d2 = chip(s, XB, Y2, W, H, "名前解決", "A レコードのみ", "navy");
  Z.arrow(s, [c2.r, d2.l], null, {width: 1.75});
  const OH = 0.66, OYS = [2.25, 3.02, 3.79];
  const o = [
    chip(s, XC, OYS[0], OW, OH, "除外", "ワイルドカード IP あり", "gray"),
    chip(s, XC, OYS[1], OW, OH, "除外", "応答なし", "gray"),
    chip(s, XC, OYS[2], OW, OH, "出力", "それ以外（先頭の IP）", "green"),
  ];
  const BX = XB + W + 0.35;
  Z.arrow(s, [d2.r, [BX, d2.r[1]]], null, {width: 1.75, head: "none"});
  Z.arrow(s, [[BX, o[0].l[1]], [BX, o[2].l[1]]], null, {width: 1.75, head: "none"});
  o.forEach((q) => Z.arrow(s, [[BX, q.l[1]], q.l], null, {width: 1.75}));
  dot(s, BX, d2.r[1]);
  Z.arrow(s, [wi.b, [wi.b[0], OYS[0]]], "照合", {dash: true, w: 0.8, width: 1.75});
  clegend(s, [["navy", "subfinder の処理", 2.2], ["gray", "DNS リゾルバ・除外", 2.35], ["green", "出力", 1.05], ["open", "照合", 1.1]], 4.95);
  await Z.save(p, path.join(OUT, "04_activeによるワイルドカード除去.pptx"));
}

// ---- 図5：httpx・Nuclei へのパイプ連携 ----
async function fig5() {
  const p = art(), s = Z.canvas(p);
  const H = 0.86, Y = 0.6;
  Z.T(s, "example.com", {x: 0.05, y: Y + H / 2 - 0.36, w: 1.4, h: 0.3, fontSize: 14, bold: true, color: Z.C.title, align: "center"});
  const c = [
    chip(s, 1.6, Y, 1.95, H, "subfinder", "パッシブ列挙", "navy"),
    chip(s, 5.0, Y, 2.0, H, "httpx", "HTTP の疎通確認", "navy"),
    chip(s, 7.75, Y, 1.85, H, "Nuclei", "テンプレート検査", "navy"),
  ];
  Z.arrow(s, [[0.2, c[0].l[1]], c[0].l], null, {width: 1.75});
  Z.arrow(s, [c[0].r, c[1].l], "ホスト名", {w: 0.9, width: 1.75});
  Z.arrow(s, [c[1].r, c[2].l], "URL", {w: 0.6, width: 1.75});
  // 下段：通信先
  const DY = 3.0;
  const src = await inode(s, "pdns", K.teal.c, c[0].b[0], DY, "パッシブな情報源", "CT ログ・パッシブ DNS など", {w: 2.6});
  const tgx = (c[1].b[0] + c[2].b[0]) / 2;
  const tg = await inode(s, "target", K.gray.c, tgx, DY, "対象のサーバー", "許可済みの対象のみ", {w: 2.6});
  Z.arrow(s, [c[0].b, src.t], "問い合わせ", {w: 1.2, width: 1.5});
  const MY = DY - 0.65;
  Z.arrow(s, [c[1].b, [c[1].b[0], MY], [tg.t[0] - 0.15, MY], [tg.t[0] - 0.15, tg.t[1]]], "HTTP(S)", {seg: 0, w: 1.0, width: 1.5, left: true});
  Z.arrow(s, [c[2].b, [c[2].b[0], MY], [tg.t[0] + 0.15, MY], [tg.t[0] + 0.15, tg.t[1]]], "検査", {seg: 0, w: 0.7, width: 1.5});
  // 許可が必要な範囲（対象と通信する部分）
  const FX = 4.82, FY = Y - 0.22, FR = 9.78, FB = 4.55;
  s.addShape("rect", {x: FX, y: FY, w: FR - FX, h: FB - FY, fill: {type: "none"}, line: {color: PINK, width: 2.25, dashType: "dash"}});
  Z.T(s, "許可が必要な範囲（対象との通信）", {x: FX + 0.12, y: FB - 0.38, w: 3.4, h: 0.3, fontSize: 14, bold: true, color: PINK});
  clegend(s, [["navy", "ツール", 1.3], ["teal", "情報源", 1.3], ["gray", "対象", 1.1]], 4.95);
  await Z.save(p, path.join(OUT, "05_httpxとNucleiへのパイプ連携.pptx"));
}

(async () => { await fig1(); await fig2(); await fig3(); await fig4(); await fig5(); })();
