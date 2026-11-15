// compact no.39「Nmap の機能とできること」の図1〜6（zukai-diagrams 準拠）
// 使い方: node figs.js <出力フォルダ> → bash render.sh <出力フォルダ> で PNG（2000px）
// 文字は 14pt 以上（登場者・箱の名前は 16pt 太字）
// 色の意味（全図共通、「誰が処理するか」の1軸）：navy＝Nmap 本体の処理／teal＝NSE のスクリプト／
//   gray＝得られる情報／白地＋灰線＝中間データ。既定かオプションかは図1のブラケットで示す
const Z = require("./zukai.js");
const path = require("path");
const md = require("react-icons/md"), tb = require("react-icons/tb");
const OUT = process.argv[2] || ".";
Z.ICON.radar = md.MdComputer; Z.ICON.host = md.MdDns; Z.ICON.wall = tb.TbWall;

const K = {
  navy: {c: "2E5E8E", f: "EEF3F9", t: "2E5E8E"},
  teal: {c: "1E8A82", f: "E8F5F3", t: "17706A"},
  gray: {c: "6B7280", f: "F1F3F4", t: "4B5563"},
  plain: {c: "9AA0A6", f: "FFFFFF", t: "2B3550"},
};
const MUTED = "4B5563", NAVY = Z.C.title;

function art() {
  const p = Z.article({title: "Nmap 図", author: "Nico"});
  Object.assign(Z.FS, {label: 14, sub: 14, arrow: 14, box: 14});
  return p;
}
function chip(s, x, y, w, h, head, sub, k, o = {}) {
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.1, fill: {color: K[k].f}, line: {color: K[k].c, width: 1.5}});
  const runs = [{text: head, options: {bold: true, fontSize: o.hs || 16, color: K[k].t, breakLine: !!sub}}];
  if (sub) runs.push({text: sub, options: {fontSize: 14, color: Z.C.text}});
  Z.T(s, runs, {x: x + 0.05, y, w: w - 0.1, h, align: "center", valign: "middle", lineSpacingMultiple: 1.05});
  return {l: [x, y + h / 2], r: [x + w, y + h / 2], t: [x + w / 2, y], b: [x + w / 2, y + h]};
}
function clegend(s, items, y, colW = 1.9) {
  const h = 0.42, ww = 0.7 + items.reduce((a, it) => a + (it[2] || colW), 0), x0 = (10 - ww) / 2;
  s.addShape("roundRect", {x: x0, y, w: ww, h, rectRadius: 0.08, fill: {color: "FFFFFF"}, line: {color: Z.C.grid, width: 0.75}});
  Z.T(s, "凡例", {x: x0 + 0.1, y: y + 0.07, w: 0.56, h: 0.28, fontSize: 14, bold: true, color: MUTED, valign: "middle"});
  let sx = x0 + 0.7;
  for (const [kind, text, cw0] of items) {
    const cw = cw0 || colW, yy = y + h / 2;
    if (K[kind]) s.addShape("rect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, fill: {color: K[kind].f}, line: {color: K[kind].c, width: 1.5}});
    else if (kind === "dframe") s.addShape("rect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, fill: {type: "none"}, line: {color: Z.C.rule, width: 1.25, dashType: "dash"}});
    else if (kind === "reply") Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 1.5, dash: true});
    else Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 1.75});
    Z.T(s, text, {x: sx + 0.48, y: yy - 0.14, w: cw - 0.5, h: 0.28, fontSize: 14, valign: "middle"});
    sx += cw;
  }
}
// 頭（アイコン＋名前）。名前の下端の y を返す
async function head(s, icon, x, y, name) {
  s.addImage({data: await Z.icon(icon, Z.C.icon), x: x - 0.25, y, w: 0.5, h: 0.5, altText: name});
  Z.T(s, name, {x: x - 1.2, y: y + 0.52, w: 2.4, h: 0.3, fontSize: 16, bold: true, color: NAVY, align: "center", valign: "middle"});
  return y + 0.86;
}
const vline = (s, x, y1, y2) => s.addShape("line", {x, y: y1, w: 0, h: y2 - y1, line: {color: Z.C.gray, width: 1, dashType: "dash"}});
const send = (s, x1, x2, y, label, o = {}) => Z.arrow(s, [[x1, y], [x2, y]], label, {width: 1.75, w: Math.abs(x2 - x1) - 0.1, ...o});
const reply = (s, x1, x2, y, label, o = {}) => Z.arrow(s, [[x1, y], [x2, y]], label, {width: 1.5, dash: true, w: Math.abs(x2 - x1) - 0.1, ...o});
const txt = (s, t, x, y, w, o = {}) => Z.T(s, t, {x, y, w, h: o.h || 0.3, fontSize: 14, color: o.color || MUTED, align: o.align || "center", bold: o.bold, valign: o.valign || "middle"});
const LEG_SEND = ["line", "スキャン元からの送信", 2.65], LEG_REPLY = ["reply", "応答", 1.15], LEG_INFO = ["gray", "得られる情報", 1.95];
const SRC = "スキャン元（Nmap）";
const LEG_FLOW = ["line", "送信・処理の流れ", 2.4];

// ---- 図1：Nmap のスキャンの流れ ----
async function fig1() {
  const p = art(), s = Z.canvas(p);
  const W = 1.8, G = 0.22, X0 = 0.06, Y = 0.55, H = 1.05, OH = 0.85, OY = Y + H + 0.25;
  const X = (i) => X0 + i * (W + G);
  const steps = [
    ["ホスト発見", "ARP/ICMP/TCP", "navy", "稼働中の\nホスト"],
    ["ポートスキャン", "TCP 上位\n1,000ポート", "navy", "ポートの\n状態"],
    ["バージョン検出", "-sV", "navy", "サービスと\nバージョン"],
    ["OS 検出", "-O", "navy", "OS と\nデバイス種別"],
    ["スクリプト\nスキャン", "NSE（-sC 等）", "teal", "スクリプトの\n実行結果"],
  ];
  const bs = steps.map(([h, sub, k, out], i) => {
    chip(s, X(i), OY, W, OH, out, null, "gray", {hs: 15});
    return chip(s, X(i), Y, W, H, h, sub, k);
  });
  for (let i = 0; i < 4; i++) Z.arrow(s, [bs[i].r, bs[i + 1].l], null, {width: 1.5});
  const brk = (i1, i2, label) => {
    const x1 = X(i1), x2 = X(i2) + W, y = 0.36;
    Z.arrow(s, [[x1, y + 0.12], [x1, y], [x2, y], [x2, y + 0.12]], null, {head: "none", color: MUTED, width: 1.25});
    txt(s, label, x1, 0.02, x2 - x1, {bold: true});
  };
  brk(0, 1, "既定で実行");
  brk(2, 4, "オプション（-A で一括）");
  clegend(s, [["navy", "Nmap 本体の処理", 2.3], ["teal", "NSE のスクリプト", 2.3], LEG_INFO], OY + OH + 0.35);
  await Z.save(p, path.join(OUT, "01_nmapのスキャンの流れ.pptx"));
}

// ---- 図2：ホスト発見で送るプローブ ----
async function fig2() {
  const p = art(), s = Z.canvas(p);
  const NX = 1.3, TX = 8.5, L = NX + 0.05, R = TX - 0.05;
  const y0 = await head(s, "radar", NX, 0.05, SRC);
  await head(s, "host", TX, 0.05, "対象ホスト");
  vline(s, NX, y0 + 0.04, 4.72); vline(s, TX, y0 + 0.04, 4.72);
  Z.fragment(s, 0.45, 1.02, 8.9, 3.72, "alt", null, 2.32, " ");
  txt(s, "[同一セグメント]", 1.45, 1.04, 3, {color: NAVY, bold: true, align: "left", h: 0.26});
  txt(s, "[別セグメント]", 1.45, 2.36, 3, {color: NAVY, bold: true, align: "left", h: 0.26});
  send(s, L, R, 1.75, "ARP Request（ブロードキャスト）", {w: 4});
  reply(s, R, L, 2.15, "ARP Reply（＝稼働）", {w: 4});
  const ys = [2.98, 3.38, 3.78, 4.18];
  ["ICMP Echo Request", "TCP SYN（443/tcp）", "TCP ACK（80/tcp）", "ICMP Timestamp Request"].forEach((t, i) => send(s, L, R, ys[i], t, {w: 4}));
  reply(s, R, L, 4.58, "いずれかの応答（＝稼働）", {w: 4});
  clegend(s, [LEG_SEND, LEG_REPLY], 4.98);
  await Z.save(p, path.join(OUT, "02_ホスト発見で送るプローブ.pptx"));
}

// ---- 図3：SYN スキャンでのポートの状態の判定 ----
async function fig3() {
  const p = art(), s = Z.canvas(p);
  const NX = 1.3, TX = 6.35, RX = 7.05, RW = 2.7, FX = 4.2;
  const y0 = await head(s, "radar", NX, 0.05, SRC);
  await head(s, "host", TX, 0.05, "対象ホスト");
  txt(s, "Nmap の判定", RX, 1.0, RW, {bold: true});
  vline(s, NX, y0 + 0.04, 4.75); vline(s, TX, y0 + 0.04, 4.75);
  const L = NX + 0.05, R = TX - 0.05;
  // open
  send(s, L, R, 1.5, "SYN"); reply(s, R, L, 1.95, "SYN/ACK"); send(s, L, R, 2.4, "RST（スキャン元の OS が自動送信）", {w: 4.2});
  chip(s, RX, 1.55, RW, 0.8, "open", "待ち受けあり", "gray");
  // closed
  send(s, L, R, 3.05, "SYN"); reply(s, R, L, 3.5, "RST");
  chip(s, RX, 2.88, RW, 0.8, "closed", "待ち受けなし", "gray");
  // filtered：途中の FW で破棄、または FW から ICMP 到達不能
  s.addImage({data: await Z.icon("wall", Z.C.icon), x: FX - 0.25, y: 4.02, w: 0.5, h: 0.5, altText: "FW"});
  Z.T(s, "FW・ルーター", {x: FX + 0.32, y: 4.12, w: 1.6, h: 0.3, fontSize: 16, bold: true, color: NAVY, valign: "middle"});
  send(s, L, FX - 0.3, 4.12, "SYN（再送後も応答なし）", {w: 2.4});
  reply(s, FX - 0.3, L, 4.55, "または ICMP 到達不能", {w: 2.4});
  chip(s, RX, 3.95, RW, 0.8, "filtered", "フィルタで判別不能", "gray");
  clegend(s, [LEG_SEND, LEG_REPLY, LEG_INFO], 5.0);
  await Z.save(p, path.join(OUT, "03_SYNスキャンでのポートの状態の判定.pptx"));
}

// ---- 図4：バージョン検出のしくみ ----
async function fig4() {
  const p = art(), s = Z.canvas(p);
  const NX = 1.3, TX = 8.4, L = NX + 0.05, R = TX - 0.05;
  const y0 = await head(s, "radar", NX, 0.05, SRC);
  await head(s, "host", TX, 0.05, "対象ホスト");
  vline(s, NX, y0 + 0.04, 3.5); vline(s, TX, y0 + 0.04, 3.5);
  Z.fragment(s, 0.45, 1.05, 8.55, 2.35, "loop", null);
  txt(s, "[一致しない間]", 1.45, 1.07, 3, {color: NAVY, bold: true, align: "left", h: 0.26});
  send(s, L, R, 1.8, "① TCP 接続（open ポート宛て）", {w: 4});
  send(s, L, R, 2.25, "② プローブ（初回は NULL プローブ：無送信で待機）", {w: 5.4});
  reply(s, R, L, 2.7, "③ 応答（初回はバナー）", {w: 3.4});
  // ④ 自己メッセージ：照合
  Z.arrow(s, [[NX + 0.07, 2.9], [NX + 0.5, 2.9], [NX + 0.5, 3.18], [NX + 0.07, 3.18]], null, {width: 1.75});
  Z.T(s, "④ nmap-service-probes の match と照合", {x: NX + 0.6, y: 2.88, w: 5, h: 0.32, fontSize: 14, color: Z.C.arrow, valign: "middle"});
  const r = chip(s, 0.3, 3.75, 3.3, 0.9, "判定結果", "サービス・製品名・バージョン", "gray");
  Z.arrow(s, [[NX, 3.5], [NX, 3.75]], null, {width: 1.5});
  clegend(s, [LEG_FLOW, LEG_REPLY, LEG_INFO], 4.95);
  await Z.save(p, path.join(OUT, "04_バージョン検出のしくみ.pptx"));
}

// ---- 図5：OS 検出のしくみ ----
async function fig5() {
  const p = art(), s = Z.canvas(p);
  const NX = 1.3, TX = 8.4, L = NX + 0.05, R = TX - 0.05;
  const y0 = await head(s, "radar", NX, 0.05, SRC);
  await head(s, "host", TX, 0.05, "対象ホスト");
  vline(s, NX, y0 + 0.04, 2.7); vline(s, TX, y0 + 0.04, 2.7);
  send(s, L, R, 1.3, "TCP（open・closed ポート宛て）", {w: 4});
  send(s, L, R, 1.7, "UDP（closed ポート宛て）", {w: 4});
  send(s, L, R, 2.1, "ICMP Echo Request", {w: 4});
  reply(s, R, L, 2.5, "各プローブへの応答", {w: 4});
  const Y = 3.55, H = 1.05;
  const f1 = chip(s, 0.3, Y, 2.95, H, "フィンガープリント", "ISN・IP ID・TCP オプション\nウィンドウサイズ・TTL など", "plain");
  Z.arrow(s, [[NX, 2.7], [NX, Y]], "テスト結果を集約", {w: 2.0, width: 1.5});
  const f3 = chip(s, 6.45, Y, 3.3, H, "OS の推定", "OS 名・デバイス種別\n推測時は確度（%）", "gray");
  Z.arrow(s, [f1.r, f3.l], "nmap-os-db（6,000件超）と照合", {w: 3.2, width: 1.75});
  clegend(s, [LEG_FLOW, LEG_REPLY, ["plain", "中間データ", 1.75], LEG_INFO], 4.9);
  await Z.save(p, path.join(OUT, "05_OS検出のしくみ.pptx"));
}

// ---- 図6：NSE のスクリプトが動くタイミング ----
async function fig6() {
  const p = art(), s = Z.canvas(p);
  const W = 2.0, Y = 0.55, H = 1.05, XS = [0.25, 2.75, 5.25, 7.75];
  Z.fragment(s, 2.5, 0.05, 5.0, 2.35, "loop", "[ホストグループごと]");
  const ph = [
    ["事前スキャン", "prerule（1回）", "teal", "例：broadcast-ping"],
    ["スキャン本体", "ホスト発見〜\nOS 検出", "navy", null],
    ["スクリプト\nスキャン", "hostrule・portrule", "teal", "例：smb-os-discovery\nhttp-title"],
    ["事後スキャン", "postrule（1回）", "teal", "例：ssh-hostkey\n（ホスト鍵の重複検出）"],
  ];
  const bs = ph.map(([h, sub, k, ex], i) => {
    const b = chip(s, XS[i], Y, W, H, h, sub, k);
    if (ex) txt(s, ex, XS[i] - 0.1, Y + H + 0.08, W + 0.2, {h: 0.6, valign: "top"});
    return b;
  });
  for (let i = 0; i < 3; i++) Z.arrow(s, [bs[i].r, bs[i + 1].l], null, {width: 1.5});
  clegend(s, [["navy", "Nmap 本体の処理", 2.3], ["teal", "NSE のスクリプト", 2.3]], 2.65);
  await Z.save(p, path.join(OUT, "06_NSEのスクリプトが動くタイミング.pptx"));
}

(async () => { await fig1(); await fig2(); await fig3(); await fig4(); await fig5(); await fig6(); })();
