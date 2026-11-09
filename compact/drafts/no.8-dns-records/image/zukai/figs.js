// compact no.8「DNSとレコード」の図1〜10（zukai-diagrams 準拠、色分けは元の分類を踏襲）
// 使い方: node figs.js <出力フォルダ>   → 続けて ./render.sh <出力フォルダ> で PNG（2000px）
// 文字は 14pt 以上（名前は 15pt 太字）。記事幅 約800px でも読める大きさにする
const Z = require("./zukai.js");
const path = require("path");
const OUT = process.argv[2] || ".";

// 元の図の分類色（記事全体で共通）
//   slate＝端末・送る側／teal＝キャッシュDNSサーバ・確かめる側／navy＝権威DNSサーバ・ゾーン・接続先／red＝失敗・問題／gray＝解約予定
const K = {
  slate: {c: "2B3A4A", f: "F3F4F6"},
  teal: {c: "1E8A82", f: "E8F5F3"},
  navy: {c: "2E5E8E", f: "EEF3F9"},
  red: {c: "C0392B", f: "FBEEEC"},
  gray: {c: "9AA0A6", f: "F1F3F4"},
};
const MUTED = Z.C.muted, NAME = 15, LH = 0.27;

function art() {
  const p = Z.article({title: "DNSとレコード 図", author: "Nico"});
  Object.assign(Z.FS, {label: 14, sub: 14, arrow: 14, box: 14});
  return p;
}

// 分類色つきの枠（淡い地＋分類色の下線つき見出し）。o.bottom で見出しを枠の内側の下端に置く
function cframe(s, x, y, w, h, heading, k, o = {}) {
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.2, fill: {color: K[k].f}, line: {type: "none"}});
  if (!heading) return;
  const hy = o.bottom ? y + h - 0.38 : y - 0.38;
  Z.T(s, heading, {x, y: hy, w, h: 0.32, fontSize: NAME, bold: true, color: K[k].c, underline: {style: "sng"}, align: "center", valign: "middle"});
}

// アイコン＋名前＋補足行。o.right で文字をアイコンの右に置く
async function cnode(s, icon, cx, cy, name, subs, k, o = {}) {
  const size = o.size || 0.5, tw = o.w || 2.0;
  s.addImage({data: await Z.icon(icon, K[k].c), x: cx - size / 2, y: cy - size / 2, w: size, h: size, altText: name});
  const runs = [{text: name, options: {bold: true, fontSize: NAME, color: K[k].c, breakLine: subs.length > 0}}];
  subs.forEach((t, i) => runs.push({text: t, options: {color: o.subColor || MUTED, breakLine: i < subs.length - 1}}));
  const lines = 1 + subs.length;
  if (o.right) Z.T(s, runs, {x: cx + size / 2 + 0.1, y: cy - lines * LH / 2 - 0.02, w: tw, h: lines * LH + 0.04, fontSize: Z.FS.label, align: "left", valign: "middle"});
  else Z.T(s, runs, {x: cx - tw / 2, y: cy + size / 2 + 0.04, w: tw, h: lines * LH + 0.04, fontSize: Z.FS.label, align: "center"});
  const r = size / 2 + 0.04;
  return {l: [cx - r, cy], r: [cx + r, cy], t: [cx, cy - r], b: [cx, o.right ? cy + r : cy + size / 2 + 0.06 + lines * LH]};
}

// シーケンス図のライフライン（頭を分類色に）
function cline(s, x, top, bottom, name, sub, k, w = 1.8, h = null) {
  h = h ?? (sub ? 0.66 : 0.4);
  const nm = name.split("\n");
  const runs = nm.map((t, i) => ({text: t, options: {bold: true, fontSize: NAME, color: K[k].c, breakLine: i < nm.length - 1 || !!sub}}));
  if (sub) runs.push({text: sub, options: {color: MUTED}});
  s.addText(runs, {shape: "rect", x: x - w / 2, y: top, w, h, fill: {color: K[k].f}, line: {color: K[k].c, width: 1.25},
    fontFace: Z.FONT.en, fontSize: Z.FS.label, align: "center", valign: "middle", margin: 0.03});
  s.addShape("line", {x, y: top + h, w: 0, h: bottom - top - h, line: {color: Z.C.gray, width: 1, dashType: "dash"}});
}
const act = (s, x, y1, y2, k) => s.addShape("rect", {x: x - 0.07, y: y1, w: 0.14, h: y2 - y1, fill: {color: "FFFFFF"}, line: {color: K[k].c, width: 1}});
// 自己呼び出し（右向き）
function selfR(s, x, y, label, lw = 2.4, h = 0.3) {
  Z.arrow(s, [[x + 0.07, y], [x + 0.45, y], [x + 0.45, y + h], [x + 0.07, y + h]], null, {width: 1.75});
  Z.T(s, label, {x: x + 0.52, y: y + h / 2 - 0.16, w: lw, h: 0.32, fontSize: Z.FS.arrow, color: Z.C.arrow, valign: "middle", fill: {color: "FFFFFF"}});
}
// 自己呼び出し（左向き。右端からはみ出さないように）
function selfL(s, x, y, label, lw = 2.8, h = 0.3) {
  Z.arrow(s, [[x - 0.07, y], [x - 0.45, y], [x - 0.45, y + h], [x - 0.07, y + h]], null, {width: 1.75});
  Z.T(s, label, {x: x - 0.52 - lw, y: y + h / 2 - 0.16, w: lw, h: 0.32, fontSize: Z.FS.arrow, color: Z.C.arrow, align: "right", valign: "middle"});
}

// 凡例（下端に横1列）。items: [種類, 文字, 幅]。種類＝分類色のキー or solid/reply/async
async function clegend(s, items, y, colW = 1.6) {
  const h = 0.42, ww = 0.66 + items.reduce((a, it) => a + (it[2] || colW), 0), x0 = (10 - ww) / 2;
  s.addShape("roundRect", {x: x0, y, w: ww, h, rectRadius: 0.08, fill: {color: "FFFFFF"}, line: {color: Z.C.grid, width: 0.75}});
  Z.T(s, "凡例", {x: x0 + 0.1, y: y + 0.07, w: 0.54, h: 0.28, fontSize: 14, bold: true, color: MUTED, valign: "middle"});
  let sx = x0 + 0.66;
  for (const [kind, text, cw0] of items) {
    const cw = cw0 || colW, yy = y + h / 2;
    if (K[kind]) s.addShape("roundRect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, rectRadius: 0.04, fill: {color: K[kind].f}, line: {color: K[kind].c, width: 1.5}});
    else Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {dash: kind === "reply", open: kind !== "solid", width: kind === "reply" ? 1.25 : 1.75});
    Z.T(s, text, {x: sx + 0.48, y: yy - 0.14, w: cw - 0.5, h: 0.28, fontSize: 14, valign: "middle"});
    sx += cw;
  }
}
const JSZip = require("jszip"), fs = require("fs");
async function save(p, name) {  // 矢じりを大きめ（lg）にして保存
  const f = path.join(OUT, name + ".pptx");
  await Z.save(p, f);
  const zip = await JSZip.loadAsync(fs.readFileSync(f));
  for (const n of Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))) {
    const x = (await zip.file(n).async("string")).replace(/<a:tailEnd type="(triangle|arrow)"\/>/g, '<a:tailEnd type="$1" w="lg" len="lg"/>');
    zip.file(n, x);
  }
  fs.writeFileSync(f, await zip.generateAsync({type: "nodebuffer", compression: "DEFLATE"}));
}
const L = {
  term: ["slate", "端末", 1.1], cache: ["teal", "キャッシュDNSサーバ", 2.65], auth: ["navy", "権威DNSサーバ", 2.1],
  q: ["solid", "問い合わせ", 1.75], req: ["solid", "要求", 1.1], rep: ["reply", "応答", 1.1],
};
const lines = (...t) => t.map((x, i) => ({text: x, options: {breakLine: i < t.length - 1}}));

(async () => {
  // ---------------- 図1：名前解決の流れ（シーケンス図） ----------------
  {
    const p = art(), s = Z.canvas(p);
    const X = [0.95, 2.85, 4.95, 6.75, 8.85], TOP = 0.1, BOT = 5.0;
    cline(s, X[0], TOP, BOT, "スタブリゾルバ", "端末の OS など", "slate", 1.7);
    cline(s, X[1], TOP, BOT, "キャッシュ\nDNSサーバ", null, "teal", 1.9, 0.66);
    cline(s, X[2], TOP, BOT, "ルートサーバ", "「.」の担当", "navy", 1.6);
    cline(s, X[3], TOP, BOT, "TLD サーバ", ".com の担当", "navy", 1.6);
    cline(s, X[4], TOP, BOT, "権威DNSサーバ", "example.com の担当", "navy", 2.1);
    const y = [1.15, 1.75, 2.17, 2.6, 3.02, 3.45, 3.87, 4.22, 4.85];
    Z.msg(s, X[0] + 0.07, X[1] - 0.07, y[0], "名前解決の依頼", "sync", 1);
    Z.msg(s, X[1] + 0.07, X[2] - 0.07, y[1], "www.example.com\nの A を問い合わせ", "sync", 2, {h: 0.6, w: 2.05});
    Z.msg(s, X[2] - 0.07, X[1] + 0.07, y[2], ".com の NS", "reply", 3);
    Z.msg(s, X[1] + 0.07, X[3] - 0.07, y[3], "同じ問い合わせ", "sync", 4, {fill: true, w: 1.9});
    Z.msg(s, X[3] - 0.07, X[1] + 0.07, y[4], "example.com の NS", "reply", 5, {fill: true, w: 2.3});
    Z.msg(s, X[1] + 0.07, X[4] - 0.07, y[5], "同じ問い合わせ", "sync", 6, {fill: true, w: 1.9});
    Z.msg(s, X[4] - 0.07, X[1] + 0.07, y[6], "A 192.0.2.1", "reply", 7, {fill: true, w: 1.6});
    selfR(s, X[1], y[7], "8: TTL の間キャッシュ", 2.1);
    Z.msg(s, X[1] - 0.07, X[0] + 0.07, y[8], "A 192.0.2.1", "reply", 9);
    act(s, X[0], y[0] - 0.08, y[8] + 0.08, "slate");
    act(s, X[1], y[0], y[8], "teal");
    act(s, X[2], y[1], y[2], "navy");
    act(s, X[3], y[3], y[4], "navy");
    act(s, X[4], y[5], y[6], "navy");
    await clegend(s, [L.term, L.cache, L.auth, L.q, L.rep], 5.12);
    await save(p, "01_名前解決の流れ");
  }

  // ---------------- 図2：A レコード（DNS ラウンドロビン、シーケンス図） ----------------
  {
    const p = art(), s = Z.canvas(p);
    const X = [0.75, 2.15, 5.0, 7.05, 8.95], TOP = 0.1, BOT = 3.95;
    cline(s, X[0], TOP, BOT, "端末1", null, "slate", 1.2, 0.66);
    cline(s, X[1], TOP, BOT, "端末2", null, "slate", 1.2, 0.66);
    cline(s, X[2], TOP, BOT, "キャッシュDNSサーバ", null, "teal", 2.45, 0.66);
    cline(s, X[3], TOP, BOT, "Web サーバ1", "192.0.2.1", "navy", 1.5);
    cline(s, X[4], TOP, BOT, "Web サーバ2", "192.0.2.2", "navy", 1.5);
    const y = [1.15, 1.6, 2.1, 2.65, 3.1, 3.6];
    Z.msg(s, X[0] + 0.07, X[2] - 0.07, y[0], "www.example.com の A を問い合わせ", "sync", 1, {fill: true, w: 3.8});
    Z.msg(s, X[2] - 0.07, X[0] + 0.07, y[1], "192.0.2.1, 192.0.2.2", "reply", 2, {fill: true, w: 2.5});
    Z.msg(s, X[0] + 0.07, X[3] - 0.07, y[2], "先頭の 192.0.2.1 に接続", "sync", 3, {fill: true, w: 2.6, dx: -0.35});
    Z.msg(s, X[1] + 0.07, X[2] - 0.07, y[3], "同じ問い合わせ", "sync", 4);
    Z.msg(s, X[2] - 0.07, X[1] + 0.07, y[4], "192.0.2.2, 192.0.2.1", "reply", 5);
    Z.msg(s, X[1] + 0.07, X[4] - 0.07, y[5], "先頭の 192.0.2.2 に接続", "sync", 6, {fill: true, w: 2.6, dx: -1.98});
    act(s, X[0], y[0] - 0.08, y[2] + 0.12, "slate");
    act(s, X[1], y[3] - 0.08, y[5] + 0.12, "slate");
    act(s, X[2], y[0], y[1], "teal");
    act(s, X[2], y[3], y[4], "teal");
    act(s, X[3], y[2], y[2] + 0.3, "navy");
    act(s, X[4], y[5], y[5] + 0.3, "navy");
    Z.note(s, 5.55, 4.05, 4.3, 0.66, lines("A レコード：192.0.2.1、192.0.2.2", "問い合わせごとに順番を入れ替え"));
    await clegend(s, [L.term, L.cache, ["navy", "接続先", 1.3], L.req, L.rep], 4.85);
    await save(p, "02_Aレコード");
  }

  // ---------------- 図3：AAAA レコード（Happy Eyeballs、概念図） ----------------
  {
    const p = art(), s = Z.canvas(p);
    const d = await cnode(s, "dns", 5.0, 0.55, "キャッシュDNSサーバ", [], "teal", {right: true, w: 2.6});
    const t = await cnode(s, "pc", 1.2, 1.85, "端末", ["IPv4／IPv6 両対応"], "slate", {w: 2.2});
    const w = await cnode(s, "server", 8.7, 1.85, "Web サーバ", ["IPv6 2001:db8::1", "IPv4 192.0.2.1"], "navy", {w: 2.1});
    Z.arrow(s, [[1.08, t.t[1]], [1.08, 0.45], [d.l[0], 0.45]], "AAAA と A を問い合わせ", {num: "①", seg: 1, w: 3.4});
    Z.arrow(s, [[d.l[0], 0.67], [1.32, 0.67], [1.32, t.t[1]]], "2001:db8::1 と 192.0.2.1", {num: "②", seg: 0, below: true, w: 3.3, dash: true, open: true});
    Z.arrow(s, [[t.r[0], 1.75], [w.l[0], 1.75]], "まず IPv6 で接続を試行", {num: "③", w: 3.0});
    Z.arrow(s, [[t.r[0], 1.98], [w.l[0], 1.98]], "250ms 後も未接続なら IPv4 でも試行", {num: "④", w: 3.9, below: true});
    Z.note(s, 2.9, 2.75, 4.2, 0.66, lines("③④ は Happy Eyeballs（RFC 8305）", "先に確立した接続を使用"));
    await clegend(s, [L.term, L.cache, ["navy", "接続先", 1.3], L.req, L.rep], 3.65);
    await save(p, "03_AAAAレコード");
  }

  // ---------------- 図4：CNAME（シーケンス図） ----------------
  {
    const p = art(), s = Z.canvas(p);
    const X = [1.0, 3.3, 6.2, 8.65], TOP = 0.1, BOT = 4.15;
    cline(s, X[0], TOP, BOT, "スタブリゾルバ", "端末の OS など", "slate", 1.9);
    cline(s, X[1], TOP, BOT, "キャッシュDNSサーバ", null, "teal", 2.45, 0.66);
    cline(s, X[2], TOP, BOT, "権威DNSサーバ", "example.com の担当", "navy", 2.1);
    cline(s, X[3], TOP, BOT, "権威DNSサーバ", "github.io の担当", "navy", 2.0);
    const y = [1.45, 1.95, 2.4, 2.9, 3.35, 3.85];
    Z.msg(s, X[0] + 0.07, X[1] - 0.07, y[0], "blog.example.com\nの A を問い合わせ", "sync", 1, {h: 0.6, w: 2.15});
    Z.msg(s, X[1] + 0.07, X[2] - 0.07, y[1], "同じ問い合わせ", "sync", 2);
    Z.msg(s, X[2] - 0.07, X[1] + 0.07, y[2], "CNAME example.github.io", "reply", 3);
    Z.msg(s, X[1] + 0.07, X[3] - 0.07, y[3], "example.github.io の A を問い合わせ", "sync", 4, {fill: true, w: 3.6});
    Z.msg(s, X[3] - 0.07, X[1] + 0.07, y[4], "A 185.199.108.153", "reply", 5, {fill: true, w: 2.3});
    Z.msg(s, X[1] - 0.07, X[0] + 0.07, y[5], "CNAME と A", "reply", 6);
    act(s, X[0], y[0] - 0.08, y[5] + 0.08, "slate");
    act(s, X[1], y[0], y[5], "teal");
    act(s, X[2], y[1], y[2], "navy");
    act(s, X[3], y[3], y[4], "navy");
    Z.note(s, 3.3, 4.2, 4.0, 0.66, lines("4 で正式な名前をたどり直し", "ルート・TLD への問い合わせは省略"));
    await clegend(s, [L.term, L.cache, L.auth, L.q, L.rep], 5.0);
    await save(p, "04_CNAME");
  }

  // ---------------- 図5：PTR（逆引き、概念図） ----------------
  {
    const p = art(), s = Z.canvas(p);
    const snd = await cnode(s, "mail", 1.05, 2.45, "送信側メールサーバ", ["IP 192.0.2.25"], "slate", {w: 2.05});
    const rcv = await cnode(s, "mail", 3.4, 2.45, "受信側メールサーバ", [], "teal", {w: 2.05});
    cframe(s, 6.0, 0.75, 3.85, 1.15, "逆引きゾーン（IP の割り当て元）", "navy");
    cframe(s, 6.0, 3.2, 3.85, 1.15, "正引きゾーン（example.com）", "navy");
    const ptr = await cnode(s, "doc", 6.4, 1.325, "25.2.0.192.in-addr.arpa.", ["PTR  mail.example.com."], "navy", {right: true, w: 3.3, subColor: Z.C.text});
    const fwd = await cnode(s, "doc", 6.4, 3.775, "mail.example.com.", ["A  192.0.2.25"], "navy", {right: true, w: 3.3, subColor: Z.C.text});
    Z.arrow(s, [snd.r, rcv.l], "メールを送信", {num: "①", w: 1.75});
    Z.arrow(s, [[3.28, rcv.t[1]], [3.28, 1.2], [ptr.l[0], 1.2]], "PTR を問い合わせ", {num: "②", seg: 1, w: 2.2});
    Z.arrow(s, [[ptr.l[0], 1.44], [3.52, 1.44], [3.52, rcv.t[1]]], "PTR mail.example.com", {num: "③", seg: 0, below: true, w: 2.6, dash: true, open: true});
    Z.arrow(s, [[3.28, rcv.b[1] + 0.08], [3.28, 3.65], [fwd.l[0], 3.65]], "A を問い合わせ", {num: "④", seg: 1, w: 2.0, dx: 0.1});
    Z.arrow(s, [[fwd.l[0], 3.89], [3.52, 3.89], [3.52, rcv.b[1] + 0.08]], "A 192.0.2.25", {num: "⑤", seg: 0, below: true, w: 2.2, dash: true, open: true});
    Z.note(s, 0.15, 3.4, 3.03, 0.95, lines("⑤ と送信元 IP（①）を照合", "一致すれば FCrDNS 成立", "キャッシュDNSサーバは省略"));
    await clegend(s, [["slate", "送る側", 1.3], ["teal", "確かめる側", 1.75], ["navy", "ゾーン", 1.3], L.q, L.rep], 4.55);
    await save(p, "05_PTR");
  }

  // ---------------- 図6：NS（委任とグルー、概念図） ----------------
  {
    const p = art(), s = Z.canvas(p);
    const c = await cnode(s, "dns", 1.2, 2.45, "キャッシュDNSサーバ", [], "teal", {w: 2.3});
    cframe(s, 4.85, 0.75, 5.0, 1.15, ".com の TLD サーバ（親ゾーン）", "navy");
    cframe(s, 4.85, 3.2, 5.0, 1.15, "example.com の権威DNSサーバ（子ゾーン）", "navy");
    const par = await cnode(s, "dns", 5.25, 1.325, "example.com.  NS  ns1.example.com.", ["ns1.example.com.  A  192.0.2.53（グルー）"], "navy", {right: true, w: 4.4, subColor: Z.C.text});
    const chi = await cnode(s, "dns", 5.25, 3.775, "example.com.  NS  ns1.example.com.", ["www.example.com.  A  192.0.2.1"], "navy", {right: true, w: 4.4, subColor: Z.C.text});
    Z.arrow(s, [[1.08, c.t[1]], [1.08, 1.2], [par.l[0], 1.2]], "www.example.com の A を問い合わせ", {num: "①", seg: 1, w: 3.7});
    Z.arrow(s, [[par.l[0], 1.44], [1.32, 1.44], [1.32, c.t[1]]], "NS とグルー（192.0.2.53）", {num: "②", seg: 0, below: true, w: 3.0, dash: true, open: true});
    Z.arrow(s, [[1.08, c.b[1] + 0.08], [1.08, 3.65], [chi.l[0], 3.65]], "192.0.2.53 に同じ問い合わせ", {num: "③", seg: 1, w: 3.2});
    Z.arrow(s, [[chi.l[0], 3.89], [1.32, 3.89], [1.32, c.b[1] + 0.08]], "A 192.0.2.1", {num: "④", seg: 0, below: true, w: 2.0, dash: true, open: true});
    await clegend(s, [L.cache, L.auth, L.q, L.rep], 4.55);
    await save(p, "06_NS");
  }

  // ---------------- 図7：SOA とゾーン転送（シーケンス図） ----------------
  {
    const p = art(), s = Z.canvas(p);
    const X = [0.85, 4.65, 8.3], TOP = 0.1, BOT = 4.3;
    cline(s, X[0], TOP, BOT, "管理者", null, "slate", 1.3, 0.66);
    cline(s, X[1], TOP, BOT, "プライマリ", "ゾーンの原本", "navy", 1.9);
    cline(s, X[2], TOP, BOT, "セカンダリ", "ゾーンのコピー", "navy", 1.9);
    const y = [1.1, 1.55, 2.05, 2.5, 2.85, 3.6, 4.05];
    Z.msg(s, X[0] + 0.07, X[1] - 0.07, y[0], "ゾーン更新（シリアル 2026110102）", "sync", 1);
    Z.msg(s, X[1] + 0.07, X[2] - 0.07, y[1], "NOTIFY（更新の通知）", "async", 2);
    Z.msg(s, X[2] - 0.07, X[1] + 0.07, y[2], "SOA を問い合わせ", "sync", 3);
    Z.msg(s, X[1] + 0.07, X[2] - 0.07, y[3], "SOA（シリアル 2026110102）", "reply", 4);
    selfL(s, X[2], y[4], "5: 手元の 2026110101 と比較", 2.7);
    Z.msg(s, X[2] - 0.07, X[1] + 0.07, y[5], "IXFR（TSIG 署名つき）", "sync", 6);
    Z.msg(s, X[1] + 0.07, X[2] - 0.07, y[6], "差分レコード（TSIG 署名つき）", "reply", 7);
    act(s, X[1], y[0], y[1] + 0.1, "navy");
    act(s, X[1], y[2], y[3], "navy");
    act(s, X[1], y[5], y[6], "navy");
    act(s, X[2], y[1], y[6] + 0.1, "navy");
    Z.note(s, 0.95, 2.35, 3.45, 0.66, lines("NOTIFY 不達時も", "リフレッシュ間隔で 3 以降を実行"));
    await clegend(s, [["slate", "管理者", 1.4], L.auth, L.req, ["async", "通知", 1.1], L.rep], 4.45);
    await save(p, "07_SOAとゾーン転送");
  }

  // ---------------- 図8：MX（優先度とフェイルオーバ、概念図） ----------------
  {
    const p = art(), s = Z.canvas(p);
    const snd = await cnode(s, "mail", 1.15, 2.4, "送信側メールサーバ", [], "slate", {w: 2.05});
    const d = await cnode(s, "dns", 5.0, 0.55, "キャッシュDNSサーバ", [], "teal", {right: true, w: 2.6});
    cframe(s, 7.3, 1.85, 2.55, 2.85, "宛先のメールサーバ", "navy");
    const m1 = await cnode(s, "mail", 8.575, 2.4, "mail1.example.com", ["優先度 10（停止中）"], "red", {w: 2.45});
    const m2 = await cnode(s, "mail", 8.575, 3.65, "mail2.example.com", ["優先度 20"], "navy", {w: 2.45});
    Z.arrow(s, [[1.03, snd.t[1]], [1.03, 0.45], [d.l[0], 0.45]], "example.com の MX を問い合わせ", {num: "①", seg: 1, w: 3.5});
    Z.arrow(s, [[d.l[0], 0.67], [1.27, 0.67], [1.27, snd.t[1]]], "MX 10 mail1, 20 mail2", {num: "②", seg: 0, below: true, w: 3.0, dash: true, open: true});
    Z.arrow(s, [snd.r, [6.85, 2.4]], "優先度 10 へ SMTP 接続（失敗）", {num: "③", w: 3.6, color: K.red.c, head: "none"});
    Z.T(s, "✘", {x: 6.82, y: 2.22, w: 0.36, h: 0.36, fontSize: 20, bold: true, color: K.red.c, align: "center", valign: "middle", fill: {color: "FFFFFF"}});
    Z.arrow(s, [[1.15, snd.b[1]], [1.15, 3.65], [m2.l[0], 3.65]], "優先度 20 へ配送", {num: "④", seg: 1, w: 2.2});
    Z.note(s, 2.4, 4.0, 3.6, 0.46, "mail1・mail2 の A 解決は省略");
    await clegend(s, [["slate", "送る側", 1.3], L.cache, ["navy", "受け取る側", 1.75], ["red", "失敗", 1.1], L.req, L.rep], 4.9);
    await save(p, "08_MX");
  }

  // ---------------- 図9：MX の切り替えと届く箱（前後比較の概念図） ----------------
  {
    const p = art(), s = Z.canvas(p);
    for (const [ox, after] of [[0.2, false], [5.1, true]]) {
      Z.T(s, after ? "切り替え後" : "切り替え前", {x: ox, y: 0.0, w: 4.7, h: 0.32, fontSize: NAME, bold: true, color: Z.C.title, align: "center", valign: "middle"});
      const ext = await cnode(s, "user", ox + 1.1, 0.62, "社外の送信者", [], "slate", {size: 0.42, w: 2.2});
      const same = await cnode(s, "group", ox + 3.55, 0.62, "同じサービスの利用者", [], "slate", {size: 0.42, w: 2.3});
      // 見出しは枠の内側の下端（上から入る矢印と重ならないように）
      cframe(s, ox + 0.05, 1.85, 2.1, 2.95, "レンタルサーバ", "navy", {bottom: true});
      cframe(s, ox + 2.35, 1.85, 2.35, 2.95, "クラウドメール", "teal", {bottom: true});
      const dns = await cnode(s, "doc", ox + 1.1, 2.2, "MX レコード", [after ? "mx.cloud.example" : "mail.example.com"], "navy", {size: 0.42, w: 2.05});
      const old = await cnode(s, "mail", ox + 1.1, 3.55, "旧サーバの箱", [after ? "併用期間後に解約" : "社外からの着信"], after ? "gray" : "navy", {size: 0.42, w: 2.05});
      const cl = await cnode(s, "mail", ox + 3.55, 3.55, "クラウドの箱", [after ? "すべての着信" : "同サービス内からのみ"], after ? "teal" : "red", {size: 0.42, w: 2.3});
      const top = 3.55 - 0.21;  // 封筒アイコンの上端
      Z.arrow(s, [ext.b, dns.t], "MX を参照", {num: "①", w: 1.3});
      Z.arrow(s, [[ox + 3.67, same.b[1]], [ox + 3.67, top]], "直接配送", {w: 0.95});
      if (after) Z.arrow(s, [dns.r, [ox + 3.43, 2.2], [ox + 3.43, top]], "配送", {num: "②", seg: 0, below: true, dx: 0.45, w: 1.0});
      else Z.arrow(s, [[ox + 1.1, dns.b[1]], [ox + 1.1, top]], "配送", {num: "②", w: 1.0});
      Z.T(s, after ? "✓ すべて1つの箱に集約" : "✘ 届く箱が2つに分断", {x: ox, y: 4.86, w: 4.7, h: 0.28, fontSize: 14, bold: true, color: after ? K.teal.c : K.red.c, align: "center", valign: "middle"});
    }
    s.addShape("line", {x: 4.98, y: 0.05, w: 0, h: 5.05, line: {color: Z.C.grid, width: 1}});
    await clegend(s, [["slate", "送る側", 1.25], ["navy", "レンタルサーバ", 2.0], ["teal", "クラウドメール", 2.0], ["red", "問題", 1.05], ["gray", "解約予定", 1.45], ["solid", "流れ", 1.1]], 5.18);
    await save(p, "09_MXの切り替えと届く箱");
  }

  // ---------------- 図10：TXT（送信ドメイン認証、概念図） ----------------
  {
    const p = art(), s = Z.canvas(p);
    const snd = await cnode(s, "mail", 1.3, 2.6, "送信側メールサーバ", ["MAIL FROM: example.com", "IP 192.0.2.25"], "slate", {w: 2.45});
    const rcv = await cnode(s, "mail", 3.85, 2.6, "受信側メールサーバ", [], "teal", {w: 2.05});
    cframe(s, 6.2, 0.75, 3.65, 3.8, "example.com のゾーン", "navy");
    const spf = await cnode(s, "doc", 6.6, 1.3, "SPF", ["example.com.  TXT", "\"v=spf1 ip4:192.0.2.25 -all\""], "navy", {right: true, w: 3.2, subColor: Z.C.text});
    const dk = await cnode(s, "doc", 6.6, 2.6, "DKIM", ["s1._domainkey  TXT", "\"v=DKIM1; k=rsa; p=MIIB…\""], "navy", {right: true, w: 3.4, subColor: Z.C.text});
    const dm = await cnode(s, "doc", 6.6, 3.9, "DMARC", ["_dmarc  TXT", "\"v=DMARC1; p=reject\""], "navy", {right: true, w: 3.4, subColor: Z.C.text});
    Z.arrow(s, [snd.r, rcv.l], "署名つきメール", {num: "①", w: 1.9});
    Z.arrow(s, [[3.85, rcv.t[1]], [3.85, 1.3], [spf.l[0], 1.3]], "SPF を問い合わせ", {num: "②", seg: 1, w: 2.2});
    Z.arrow(s, [rcv.r, dk.l], "DKIM 公開鍵を取得", {num: "③", w: 2.1});
    Z.arrow(s, [[3.85, rcv.b[1]], [3.85, 3.9], [dm.l[0], 3.9]], "DMARC を問い合わせ", {num: "④", seg: 1, w: 2.3});
    Z.note(s, 0.15, 3.82, 3.55, 0.95, lines("DMARC 判定が fail なら", "p= の方針で隔離・拒否など", "キャッシュDNSサーバは省略"));
    await clegend(s, [["slate", "送る側", 1.3], ["teal", "確かめる側", 1.75], ["navy", "ゾーン", 1.3], ["solid", "送信・問い合わせ（応答は省略）", 3.5]], 4.88);
    await save(p, "10_TXT");
  }
})().catch((e) => { console.error(e); process.exit(1); });
