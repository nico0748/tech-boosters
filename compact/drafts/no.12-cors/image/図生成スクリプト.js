// compact no.12 CORS の図（シーケンス図3枚）を生成する（v3：2回目レビュー反映）
// 使い方: node 図生成スクリプト.js  → 01〜03 の .pptx を出力（zukai.js と同じフォルダで実行）
const Z = require("./zukai.js");
const C = Z.C;
const PINK = C.pink;
const RED = "C62828", RED_FILL = "FDECEA";
const FS = 14;            // 本文の文字サイズ（記事幅 800px に縮めても約 12px 以上）
const LH = 0.25;          // 14pt の1行の高さ（in）
const M = 0.3;            // 左右の余白（in）
let W = 12.5;             // キャンバス幅（in）

// 14pt での文字幅の見積もり（全角 0.2in、半角 0.11in）
const est = (t) => [...t].reduce((a, c) => a + (c.charCodeAt(0) > 0x2000 ? 0.2 : 0.11), 0);

function newDeck(h) {
  const p = Z.article({title: "CORS"});
  Object.assign(Z.FS, {label: FS, sub: FS, arrow: FS, box: FS});
  p.defineLayout({name: "CORS", width: W, height: h});
  p.layout = "CORS";
  return p;
}

// ライフラインの頭：名前（太字）＋補足（グレー）の2行
function head(s, x, top, bottom, name, sub, o = {}) {
  const w = o.w || 2.9, h = 0.78;
  s.addText([
    {text: name, options: {bold: true, color: o.bad ? RED : C.title, breakLine: true}},
    {text: sub, options: {color: C.muted}},
  ], {shape: "rect", x: x - w / 2, y: top, w, h, fill: {color: o.bad ? RED_FILL : C.frame},
    line: {color: o.bad ? RED : C.icon, width: 1.25}, fontFace: Z.FONT.en, fontSize: FS,
    align: "center", valign: "middle", margin: 0.04});
  s.addShape("line", {x, y: top + h, w: 0, h: bottom - top - h, line: {color: C.gray, width: 1, dashType: "dash"}});
}

const hi = (t) => ({text: t, options: {color: PINK, bold: true}});
const tx = (t) => ({text: t});
const toRuns = (num, lab) => (Array.isArray(lab) ? [{text: `${num}: `}, ...lab] : [{text: `${num}: ${lab}`}]);
const flat = (runs) => runs.flatMap((r) => r.text.split("\n").map((t, j, a) => ({text: t, options: {...r.options, breakLine: j < a.length - 1}})));
const nlines = (runs) => runs.map((r) => r.text).join("").split("\n").length;

// メッセージ（ラベルは矢印の上）。o.code：コード片は左揃え
function msg(s, x1, x2, y, num, lab, kind = "sync", o = {}) {
  Z.arrow(s, [[x1, y], [x2, y]], null, {dash: kind === "reply", open: kind !== "sync", width: kind === "reply" ? 1.25 : 1.75});
  const runs = toRuns(num, lab), lh = nlines(runs) * LH + 0.04;
  const x0 = Math.min(x1, x2) + 0.12, w = Math.abs(x2 - x1) - 0.24;
  Z.T(s, flat(runs), {x: x0, y: y - lh - 0.04, w, h: lh, fontSize: FS, color: C.arrow,
    align: o.code ? "left" : "center", valign: "bottom"});
}

// 自分自身への処理。ラベルはループの上（side "right"：右へ伸ばす／"left"：ライフラインの左で終わる）
function self(s, x, y, num, lab, side = "right", lw = 4.0) {
  const h = 0.3;
  Z.arrow(s, [[x + 0.07, y], [x + 0.45, y], [x + 0.45, y + h], [x + 0.07, y + h]], null, {width: 1.5});
  const runs = toRuns(num, lab), lh = nlines(runs) * LH + 0.04;
  Z.T(s, flat(runs), {x: side === "right" ? x + 0.12 : x - 0.15 - lw, y: y - lh - 0.04, w: lw, h: lh,
    fontSize: FS, color: C.arrow, align: side === "right" ? "left" : "right", valign: "bottom"});
}

// alt フラグメント。枠と区切り線を描き、ガード文字を描く関数を返す（活性区間より先に呼ぶ）
function alt(s, x, y, w, h, guard, elseY, elseGuard, gx0) {
  s.addShape("rect", {x, y, w, h, fill: {type: "none"}, line: {color: C.title, width: 1}});
  const tw = 0.7, th = 0.32;
  s.addShape("custGeom", {x, y, w: tw, h: th, points: [{x: 0, y: 0}, {x: tw, y: 0}, {x: tw, y: th - 0.09}, {x: tw - 0.09, y: th}, {x: 0, y: th}, {close: true}], fill: {color: C.frame}, line: {color: C.title, width: 1}});
  Z.T(s, "alt", {x, y, w: tw - 0.06, h: th, fontSize: FS, bold: true, color: C.title, align: "center", valign: "middle"});
  s.addShape("line", {x, y: elseY, w, h: 0, line: {color: C.title, width: 1, dashType: "dash"}});
  const g = (t, gy) => Z.T(s, t, {x: gx0, y: gy, w: est(t) + 0.12, h: th, fontSize: FS, bold: true, color: C.title, valign: "middle", fill: {color: C.white}});
  return () => { g(guard, y + 0.02); g(elseGuard, elseY + 0.05); };
}

// 注記（文字幅に合わせた幅）
function note(s, x, y, text) {
  const w = est(text) + 0.45;
  Z.note(s, x, y, w, 0.5, text);
  return w;
}

// 凡例（横1列）。items: [kind, 文字]。kind: sync / reply / accent / bad。右端 xr にそろえる
const SYM = 0.55, GAP_SL = 0.1, GAP_IT = 0.35, LEAD = 0.75;
function legendWidth(items) {
  return LEAD + items.reduce((a, [, t]) => a + SYM + GAP_SL + est(t), 0) + GAP_IT * (items.length - 1) + 0.2;
}
function legend(s, xr, y, items) {
  const w = legendWidth(items), x = xr - w, h = 0.5;
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.08, fill: {color: C.white}, line: {color: C.grid, width: 0.75}});
  Z.T(s, "凡例", {x: x + 0.14, y, w: 0.6, h, fontSize: FS, bold: true, color: C.muted, valign: "middle"});
  let sx = x + LEAD;
  const yy = y + h / 2;
  for (const [k, t] of items) {
    if (k === "sync" || k === "reply") Z.arrow(s, [[sx, yy], [sx + SYM, yy]], null, {dash: k === "reply", open: k === "reply", width: k === "reply" ? 1.25 : 1.75});
    if (k === "accent") Z.T(s, "abc", {x: sx, y: yy - 0.15, w: SYM, h: 0.3, fontSize: FS, bold: true, color: PINK, align: "center", valign: "middle"});
    if (k === "bad") s.addShape("rect", {x: sx + 0.05, y: yy - 0.11, w: SYM - 0.1, h: 0.22, fill: {color: RED_FILL}, line: {color: RED, width: 1}});
    Z.T(s, t, {x: sx + SYM + GAP_SL, y: yy - 0.15, w: est(t) + 0.1, h: 0.3, fontSize: FS, valign: "middle"});
    sx += SYM + GAP_SL + est(t) + GAP_IT;
  }
}
const LEG = [["sync", "要求"], ["reply", "応答"], ["accent", "CORS の照合に使う値"]];

// ---------- 図1 単純リクエストの流れ ----------
async function fig1() {
  W = 12.5;
  const H = 8.2, top = 0.25, bottom = 7.1;
  const p = newDeck(H), s = Z.canvas(p);
  const JS = 1.75, BR = 5.35, SV = 10.75;
  head(s, JS, top, bottom, "JavaScript（ページ）", "https://app.example.com");
  head(s, BR, top, bottom, "ブラウザ", "Fetch・CORS の判定");
  head(s, SV, top, bottom, "API サーバ", "https://api.example.com");

  msg(s, JS + 0.07, BR - 0.07, 1.65, 1, 'fetch(\n"https://api.example.com/items")', "sync", {code: true});
  msg(s, BR + 0.07, SV - 0.07, 2.4, 2, [tx("GET /items（単純リクエスト・プリフライトなし）\nOrigin: "), hi("https://app.example.com")]);
  self(s, SV, 2.95, 3, "リクエスト処理（CORS 判定より前に完了）", "left", 4.6);
  msg(s, SV - 0.07, BR + 0.07, 4.0, 4, [tx("200 OK\nAccess-Control-Allow-Origin: "), hi("https://app.example.com")], "reply");
  self(s, BR, 4.55, 5, "Origin と Access-Control-Allow-Origin の照合", "right", 5.0);

  const guards = alt(s, M, 5.05, 6.6, 2.0, "[ 完全一致 または * ]", 5.85, "[ 不一致・ヘッダーなし ]", JS + 0.15);
  msg(s, BR - 0.07, JS + 0.07, 5.7, 6, "Response で resolve", "reply");
  msg(s, BR - 0.07, JS + 0.07, 6.9, 7, "TypeError で reject\n（ネットワークエラー扱い）", "reply");
  guards();

  Z.activation(s, JS, 1.65, 6.9);
  Z.activation(s, BR, 1.65, 6.9);
  Z.activation(s, SV, 2.4, 4.0);
  Z.note(s, 7.15, 6.25, 3.3, 0.8, "7: status・ヘッダー・本文の\nすべてが JS から不可視");
  legend(s, W - M, 7.45, LEG);
  await Z.save(p, "01_単純リクエストの流れ.pptx");
}

// ---------- 図2 プリフライトリクエストの流れ ----------
async function fig2() {
  W = 12.5;
  const H = 10.85, top = 0.25, bottom = 9.75;
  const p = newDeck(H), s = Z.canvas(p);
  const JS = 1.75, BR = 5.35, SV = 10.75;
  head(s, JS, top, bottom, "JavaScript（ページ）", "https://app.example.com");
  head(s, BR, top, bottom, "ブラウザ", "Fetch・CORS の判定");
  head(s, SV, top, bottom, "API サーバ", "https://api.example.com");

  msg(s, JS + 0.07, BR - 0.07, 2.1, 1, 'fetch(url, {\n  method: "PUT",\n  headers: { "Content-Type":\n    "application/json" } })', "sync", {code: true});
  msg(s, BR + 0.07, SV - 0.07, 3.0, 2, [tx("OPTIONS /items/42（プリフライト・常に資格情報なし）\nOrigin: "), hi("https://app.example.com"),
    tx("\nAccess-Control-Request-Method: "), hi("PUT"), tx("\nAccess-Control-Request-Headers: "), hi("content-type")]);
  msg(s, SV - 0.07, BR + 0.07, 4.45, 3, [tx("204 No Content\nAccess-Control-Allow-Origin: "), hi("https://app.example.com"),
    tx("\nAccess-Control-Allow-Methods: "), hi("PUT, DELETE"), tx("\nAccess-Control-Allow-Headers: "), hi("content-type"),
    tx("\nAccess-Control-Max-Age: 600")], "reply");
  self(s, BR, 5.25, 4, "オリジン・メソッド・ヘッダーの照合\n許可時のみ 600 秒キャッシュ", "right", 5.0);

  const guards = alt(s, M, 5.75, W - 2 * M, 3.85, "[ 4 で許可 ]", 8.75, "[ 4 で不許可 ]", JS + 0.15);
  msg(s, BR + 0.07, SV - 0.07, 6.85, 5, [tx("PUT /items/42（本番リクエスト）\nOrigin: "), hi("https://app.example.com"),
    tx("\nContent-Type: application/json")]);
  msg(s, SV - 0.07, BR + 0.07, 7.55, 6, [tx("200 OK\nAccess-Control-Allow-Origin: "), hi("https://app.example.com")], "reply");
  self(s, BR, 8.0, 7, "Access-Control-Allow-Origin の照合", "right", 5.0);
  msg(s, BR - 0.07, JS + 0.07, 8.6, 8, "Response で resolve", "reply");
  msg(s, BR - 0.07, JS + 0.07, 9.45, 9, "TypeError で reject（5 は未送信）", "reply");
  guards();

  Z.activation(s, JS, 2.1, 9.45);
  Z.activation(s, BR, 2.1, 9.45);
  Z.activation(s, SV, 3.0, 4.45);
  Z.activation(s, SV, 6.85, 7.55);
  note(s, M, 10.05, "7 で不一致：8 の代わりに TypeError で reject");
  legend(s, W - M, 10.05, LEG);
  await Z.save(p, "02_プリフライトリクエストの流れ.pptx");
}

// ---------- 図3 Origin の反射＋Credentials の危ない設定 ----------
async function fig3() {
  W = 13;
  const H = 9.55, top = 0.65, bottom = 7.75;
  const p = newDeck(H), s = Z.canvas(p);
  const AS = 1.05, JS = 3.35, BR = 6.55, SV = 11.8;
  // 被害者のブラウザの境界（攻撃者ページの JS もブラウザの判定も、この中で動く）
  s.addShape("rect", {x: 1.98, y: 0.12, w: 5.92, h: top + 0.78, fill: {type: "none"}, line: {color: C.rule, width: 1.25, dashType: "dash"}});
  Z.T(s, "被害者のブラウザ（api.example.com にログイン中）", {x: 2.13, y: 0.17, w: 5.6, h: 0.32, fontSize: FS, bold: true, color: C.rule, valign: "middle"});
  head(s, AS, top, bottom, "攻撃者のサーバ", "attacker.example", {bad: true, w: 1.7});
  head(s, JS, top, bottom, "攻撃者ページの JS", "attacker.example のタブ", {bad: true, w: 2.5});
  head(s, BR, top, bottom, "Fetch・CORS の判定", "ブラウザ内部", {w: 2.5});
  head(s, SV, top, bottom, "API サーバ", "api.example.com", {w: 1.8});

  msg(s, AS + 0.07, JS - 0.07, 2.3, 0, "攻撃者ページ配信\n（誘導による訪問）", "reply");
  msg(s, JS + 0.07, BR - 0.07, 3.2, 1, 'fetch(\n"https://api.example.com/me",\n{ credentials: "include" })', "sync", {code: true});
  msg(s, BR + 0.07, SV - 0.07, 3.95, 2, [tx("GET /me（単純リクエスト）\nOrigin: "), hi("https://attacker.example"), tx("\nCookie: session=…（被害者のセッション）")]);
  self(s, SV, 4.45, 3, "Origin を Access-Control-Allow-Origin へ無検証で反射", "left", 5.0);
  msg(s, SV - 0.07, BR + 0.07, 5.6, 4, [tx("200 OK\nAccess-Control-Allow-Origin: "), hi("https://attacker.example"),
    tx("\nAccess-Control-Allow-Credentials: "), hi("true"), tx('\n{ "email": …, "address": … }')], "reply");
  self(s, BR, 6.4, 5, "CORS チェック通過\n（Allow-Origin＝Origin、Allow-Credentials: true）", "right", 5.0);
  msg(s, BR - 0.07, JS + 0.07, 7.0, 6, "Response で resolve\n（本文読み取り可）", "reply");
  msg(s, JS - 0.07, AS + 0.07, 7.6, 7, "被害者情報の\nPOST 送信");

  Z.activation(s, JS, 3.2, 7.6);
  Z.activation(s, BR, 3.2, 7.0);
  Z.activation(s, SV, 3.95, 5.6);
  note(s, M, 8.1, "前提：Cookie 属性 SameSite=None; Secure、サードパーティ Cookie 許可");
  legend(s, W - M, 8.8, [["sync", "要求"], ["reply", "応答"], ["accent", "CORS の照合に使う値"], ["bad", "攻撃者側"]]);
  await Z.save(p, "03_Originの反射とCredentialsの危ない設定.pptx");
}

(async () => { await fig1(); await fig2(); await fig3(); })();
