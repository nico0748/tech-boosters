// compact no.19 MCPゲートウェイ 図生成スクリプト（zukai-diagrams スタイル, v2）
// 出力: 01_ゲートウェイなしの接続.pptx / 02_ゲートウェイありの接続.pptx / 03_ゲートウェイ経由のツール呼び出し.pptx
const Z = require("./zukai.js");
const md = require("react-icons/md");
Z.ICON.code = md.MdCode;
Z.ICON.log = md.MdReceiptLong;
Z.ICON.hub = md.MdDeviceHub;
const OUT = process.argv[2] || ".";

// 記事は本文幅 約800px に縮小表示されるので、最小13pt・ノード名14pt・見出し16pt
function fonts() { Object.assign(Z.FS, {label: 14, sub: 13, arrow: 13, box: 13}); }
const RED = Z.C.err, NAVY = Z.C.title;

// 図1と図2で共通の座標
const SRV = [["code", "GitHub MCPサーバ"], ["chat", "Slack MCPサーバ"], ["db", "社内DB MCPサーバ"]];
const CRED = ["GitHub PAT", "Slack Bot Token", "DB パスワード"];
const SX = 8.75, SY = [1.3, 2.35, 3.4];
async function servers(s) {
  Z.frame(s, 7.55, 0.75, 2.2, 3.4, "MCPサーバ（M = 3）");
  const r = [];
  for (let i = 0; i < SRV.length; i++) r.push(await Z.node(s, SRV[i][0], SX, SY[i], SRV[i][1], null, {kind: "user", w: 2.15}));
  return r;
}
const count = (s, text, y = 5.02) => Z.T(s, text, {x: 3.0, y, w: 4.0, h: 0.38, fontSize: 16, bold: true, color: NAVY, align: "center", valign: "middle"});
const problem = (s, text, x, w, align) => Z.T(s, text, {x, y: 4.5, w, h: 0.32, fontSize: 13, bold: true, color: RED, align, valign: "middle"});

// ---- 図1 ゲートウェイなし ----
async function fig1() {
  const p = Z.article({title: "ゲートウェイなしの接続"}); fonts();
  const s = Z.canvas(p);
  Z.frame(s, 0.3, 0.75, 3.0, 3.4, "MCPホスト（N = 2）");
  const H = [["ホスト A", "Claude Code", 1.45], ["ホスト B", "Cursor", 3.15]];
  const rows = [];
  for (const [name, prod, cy] of H) {
    await Z.node(s, "pc", 0.95, cy - 0.15, name, prod, {kind: "user", w: 1.2});
    rows.push(CRED.map((c, i) => Z.box(s, 1.65, cy - 0.54 + i * 0.36, 1.5, 0.36, c, {bold: false, size: 13, shape: "rect"})));
  }
  const sv = await servers(s);
  for (let i = 0; i < 3; i++) s.addImage({data: await Z.icon("log"), x: SX + 0.42, y: SY[i] - 0.16, w: 0.32, h: 0.32, altText: "ログ"});
  rows.forEach((r, h) => { for (let i = 0; i < 3; i++) Z.arrow(s, [r[i].r, [sv[i].l[0], sv[i].l[1] + (h ? 0.06 : -0.06)]], null); });
  problem(s, "クレデンシャル：各ホストに重複保持", 0.3, 3.3, "left");
  problem(s, "認可：ツール単位の一元制御なし", 3.55, 3.4, "center");
  s.addImage({data: await Z.icon("log"), x: 7.08, y: 4.5, w: 0.3, h: 0.3, altText: "ログ"});
  problem(s, "監査ログ：サーバごとに分散", 7.42, 2.4, "left");
  count(s, "MCP 接続数 N × M = 6");
  await Z.save(p, `${OUT}/01_ゲートウェイなしの接続.pptx`);
}

// ---- 図2 ゲートウェイあり ----
async function fig2() {
  const p = Z.article({title: "ゲートウェイありの接続"}); fonts();
  const s = Z.canvas(p);
  // ホスト
  Z.frame(s, 0.3, 0.75, 2.35, 3.0, "MCPホスト（N = 2）");
  const ha = await Z.node(s, "pc", 1.3, 1.3, "ホスト A", "Claude Code", {kind: "user", w: 1.6});
  const hb = await Z.node(s, "pc", 1.3, 2.75, "ホスト B", "Cursor", {kind: "user", w: 1.6});
  // ゲートウェイ
  const GX = 3.3, GW = 3.4, GB = 5.0, BUSL = 2.85, BUSR = 6.85;
  Z.frame(s, GX, 0.75, GW, GB - 0.75, "MCPゲートウェイ");
  const gw = await Z.node(s, "hub", 5.0, 1.3, "MCPサーバ兼クライアント", null, {kind: "user", w: 3.2});
  const chips = ["JWT 検証（署名・aud・exp）", "ツール単位の認可", "ツール集約・名前空間付与", "上流クレデンシャル管理", "PIIマスキング"];
  const cb = chips.map((t, i) => Z.box(s, GX + 0.2, 2.05 + i * 0.5, GW - 0.4, 0.4, t, {size: 13}));
  // ホスト → ゲートウェイ（合流してから1本）
  Z.arrow(s, [ha.r, [gw.l[0], 1.3]], "Bearer トークン", {w: 1.55});
  Z.arrow(s, [hb.r, [BUSL, 2.75], [BUSL, 1.45], [gw.l[0], 1.45]], null);
  // ゲートウェイ → 上流（分岐）
  Z.arrow(s, [gw.r, [BUSR, 1.3], [BUSR, SY[2]]], null, {head: "none"});
  Z.T(s, "受信トークン\n非転送", {x: 5.4, y: 0.8, w: 1.3, h: 0.46, fontSize: 13, bold: true, color: NAVY, align: "center", valign: "bottom"});
  const sv = await servers(s);
  for (let i = 0; i < 3; i++) {
    Z.arrow(s, [[BUSR, SY[i]], sv[i].l], null);
    Z.T(s, CRED[i], {x: BUSR + 0.08, y: SY[i] - 0.36, w: 1.75, h: 0.32, fontSize: 13, color: Z.C.arrow, valign: "bottom"});
  }
  // 認可サーバ（IdP）
  const idp = await Z.node(s, "cert", 1.3, 4.74, "認可サーバ（IdP）", null, {kind: "user", w: 2.0});
  Z.arrow(s, [idp.t, [1.3, 3.75]], "トークン発行", {w: 1.3});
  Z.arrow(s, [idp.r, [3.18, 4.74], [3.18, cb[0].l[1]], cb[0].l], "JWKS（公開鍵）", {seg: 0, w: 1.45});
  // 監査ログ
  const log = await Z.node(s, "log", SX, 4.74, "監査ログ", null, {kind: "user", w: 1.4});
  Z.arrow(s, [[GX + GW, 4.74], log.l], "監査イベント\n（非同期）", {open: true, w: 1.45, h: 0.55});
  count(s, "MCP 接続数 N + M = 5", 5.18);
  await Z.save(p, `${OUT}/02_ゲートウェイありの接続.pptx`);
}

// ---- 図3 tools/call のシーケンス ----
async function fig3() {
  const p = Z.article({title: "ゲートウェイ経由のツール呼び出し"}); fonts();
  const s = Z.canvas(p);
  const X = {h: 1.55, g: 4.4, v: 7.45, l: 9.25}, top = 0.15, bottom = 5.6;
  await Z.lifeline(s, X.h, top, bottom, "MCPホスト", {w: 1.9});
  await Z.lifeline(s, X.g, top, bottom, "MCPゲートウェイ", {w: 1.95});
  await Z.lifeline(s, X.v, top, bottom, "GitHub MCPサーバ", {w: 2.0});
  await Z.lifeline(s, X.l, top, bottom, "監査ログ", {w: 1.0});
  Z.msg(s, X.h + 0.07, X.g - 0.07, 1.25, "1: tools/call（Bearer トークン）\nname: github_issue_write", "sync", null, {h: 0.52, fill: true});
  Z.selfMsg(s, X.g, 1.35, "2: JWT 検証\n（署名・aud・exp）", null, 0.26, 2.2);
  Z.selfMsg(s, X.g, 1.82, "3: 名前空間解除・認可", null, 0.26, 2.2);
  // alt [拒否] / [許可]
  Z.fragment(s, 0.15, 2.18, 8.3, 2.84, "alt", "[許可]", 4.22, "[拒否]");
  Z.msg(s, X.g + 0.07, X.v - 0.07, 2.88, "4: tools/call（GitHub PAT）\nname: issue_write", "sync", null, {h: 0.52, fill: true});
  Z.msg(s, X.v - 0.07, X.g + 0.07, 3.28, "5: result", "reply", null, {fill: true});
  Z.selfMsg(s, X.g, 3.42, "6: PIIマスキング", null, 0.26, 2.2);
  Z.msg(s, X.g - 0.07, X.h + 0.07, 4.08, "7: result（PIIマスク済み）", "reply", null, {fill: true});
  Z.msg(s, X.g - 0.07, X.h + 0.07, 4.88, "4a: HTTP 401（トークン無効）\nHTTP 403（権限不足）", "reply", null, {h: 0.52, fill: true});
  Z.msg(s, X.g + 0.07, X.l - 0.07, 5.44, "8: 監査イベント", "async", null, {fill: true, w: 1.6, dx: 1.52});
  Z.activation(s, X.h, 1.25, 4.88);
  Z.activation(s, X.g, 1.25, 5.44);
  Z.activation(s, X.v, 2.88, 3.28);
  Z.activation(s, X.l, 5.44, 5.56);
  await Z.legend(s, 7.6, 0.7, [["solid", "同期"], ["open", "非同期"], ["reply", "応答"]], 1.5, {rowH: 0.3, lw: 1.75});
  await Z.save(p, `${OUT}/03_ゲートウェイ経由のツール呼び出し.pptx`);
}

(async () => { await fig1(); await fig2(); await fig3(); })();
