// compact no.33「POPとSMTP」の図1〜4（zukai-diagrams 準拠、色の組は no.8 を踏襲）
// 使い方: node figs.js <出力フォルダ>   → 続けて ./render.sh <出力フォルダ> で PNG（2000px）
// 文字は 14pt 以上（名前は 15pt 太字）。記事幅 約800px でも読める大きさにする
const Z = require("./zukai.js");
const path = require("path");
const OUT = process.argv[2] || ".";

// 元の図の分類色（記事全体で共通）
//   no.8 と同じ色の組。意味はこの記事用：slate＝利用者の端末／teal＝送信側サーバ／navy＝受信側サーバ／gray＝DNS／red＝問題
const K = {
  slate: {c: "2B3A4A", f: "F3F4F6"},
  teal: {c: "1E8A82", f: "E8F5F3"},
  navy: {c: "2E5E8E", f: "EEF3F9"},
  red: {c: "C0392B", f: "FBEEEC"},
  gray: {c: "6B7280", f: "F1F3F4"},
  panel: {c: "3C4043", f: "F5F6F7"},
};
const MUTED = Z.C.muted, NAME = 15, LH = 0.27;

function art() {
  const p = Z.article({title: "POPとSMTP 図", author: "Nico"});
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
// ---- ここから no.33 の図 ----
// 分類色の意味（この記事）：slate＝利用者の端末（MUA）／teal＝送信側のサーバ／navy＝受信側のサーバ／gray＝DNS／red＝問題
const L = {
  term: ["slate", "利用者の端末", 1.75], snd: ["teal", "送信側サーバ", 1.75], rcv: ["navy", "受信側サーバ", 1.75],
  dns: ["gray", "DNS", 1.0], cmd: ["solid", "コマンド", 1.5], cmdData: ["solid", "コマンド・データ", 2.15], req: ["solid", "要求・転送", 1.65], rep: ["reply", "応答", 1.1],
};

// 右側の括弧（シーケンス図の区間の説明）
function bracket(s, x, y1, y2, name, sub) {
  const c = Z.C.arrow;
  s.addShape("line", {x, y: y1, w: 0, h: y2 - y1, line: {color: c, width: 2}});
  s.addShape("line", {x: x - 0.12, y: y1, w: 0.12, h: 0, line: {color: c, width: 2}});
  s.addShape("line", {x: x - 0.12, y: y2, w: 0.12, h: 0, line: {color: c, width: 2}});
  const runs = [{text: name, options: {bold: true, fontSize: NAME, color: c, breakLine: !!sub}}];
  if (sub) runs.push({text: sub, options: {color: MUTED}});
  Z.T(s, runs, {x: x + 0.15, y: (y1 + y2) / 2 - 0.3, w: 9.9 - x - 0.15, h: 0.6, fontSize: 14, valign: "middle"});
}

// 2本のライフラインのシーケンス図。rows: [向き(">" or "<"), ラベル]
function seq2(s, X, y0, dy, rows, kL, kR) {
  rows.forEach(([dir, label], i) => {
    const y = y0 + i * dy;
    if (dir === ">") Z.msg(s, X[0] + 0.07, X[1] - 0.07, y, label, "sync", i + 1, {w: 4.4});
    else Z.msg(s, X[1] - 0.07, X[0] + 0.07, y, label, "reply", i + 1, {w: 4.4});
  });
  const yl = y0 + (rows.length - 1) * dy;
  act(s, X[0], y0 - 0.06, yl + 0.06, kL);
  act(s, X[1], y0, yl, kR);
  return (i) => y0 + i * dy;  // i 行目の y
}

(async () => {
  // ---------------- 図1：メールが届くまでの流れ（概念図） ----------------
  {
    const p = art(), s = Z.canvas(p);
    const CY = 2.45, X = [0.9, 3.0, 5.45, 7.25, 9.2], FT = 1.65;
    cframe(s, 0.12, FT, 3.98, 2.15, "送信側（example.com）", "teal", {bottom: true});
    cframe(s, 4.45, FT, 5.5, 2.15, "受信側（example.net）", "navy", {bottom: true});
    const a = await cnode(s, "pc", X[0], CY, "送信者の端末", ["メールソフト"], "slate", {w: 1.6});
    const b = await cnode(s, "server", X[1], CY, "送信サーバ", ["MSA・MTA"], "teal", {w: 1.6});
    const c = await cnode(s, "server", X[2], CY, "受信サーバ", ["MTA・MDA"], "navy", {w: 1.6});
    const d = await cnode(s, "mail", X[3], CY, "メールボックス", ["bob の箱"], "navy", {w: 1.7});
    const e = await cnode(s, "pc", X[4], CY, "受信者の端末", ["メールソフト"], "slate", {w: 1.6});
    const n = await cnode(s, "dns", 4.25, 0.72, "DNS", ["example.net の MX"], "gray", {right: true, w: 2.4});
    Z.arrow(s, [a.r, b.l], "SMTP 587", {num: "①", w: 1.5, dy: -0.06, dx: -0.08});
    Z.arrow(s, [[2.88, b.t[1]], [2.88, 0.61], [n.l[0], 0.61]], "MX の問い合わせ", {num: "②", seg: 0, left: true, w: 2.2});
    Z.arrow(s, [[n.l[0], 0.83], [3.12, 0.83], [3.12, b.t[1]]], "mx.example.net", {seg: 1, w: 1.9, dash: true, open: true, dy: -0.12});
    Z.arrow(s, [b.r, c.l], "SMTP 25", {num: "③", w: 1.9, dy: -0.06});
    Z.arrow(s, [c.r, d.l], "格納", {num: "④", w: 1.2, dy: -0.06});
    // ⑤ POP3：受信者の端末から接続し、応答でメールを受け取る
    Z.arrow(s, [[e.l[0], CY - 0.08], [d.r[0], CY - 0.08]], "POP3 995", {num: "⑤", w: 1.45, dy: -0.06, dx: 0.1});
    Z.arrow(s, [[d.r[0], CY + 0.08], [e.l[0], CY + 0.08]], null, {dash: true, open: true});
    // push / pull の区間
    const by = 4.05;
    const span = (x1, x2, text, k, tx1 = x1, tx2 = x2) => {
      s.addShape("line", {x: x1, y: by, w: x2 - x1, h: 0, line: {color: K[k].c, width: 2.5}});
      s.addShape("line", {x: x1, y: by - 0.1, w: 0, h: 0.2, line: {color: K[k].c, width: 2.5}});
      s.addShape("line", {x: x2, y: by - 0.1, w: 0, h: 0.2, line: {color: K[k].c, width: 2.5}});
      Z.T(s, text, {x: tx1, y: by + 0.08, w: tx2 - tx1, h: 0.56, fontSize: 14, align: "center", color: Z.C.text});
    };
    span(0.5, 5.75, [{text: "SMTP：送る側からの接続", options: {bold: true, color: K.teal.c, breakLine: true}}, {text: "メールの送信・中継（push）"}], "teal");
    span(6.95, 9.7, [{text: "POP3：受け取る側からの接続", options: {bold: true, color: K.navy.c, breakLine: true}}, {text: "箱からの取り出し（pull）"}], "navy", 6.7, 9.95);
    await clegend(s, [L.term, ["teal", "送信側", 1.2], ["navy", "受信側", 1.2], L.dns, L.req, L.rep], 4.82);
    await save(p, "01_メールが届くまでの流れ");
  }

  // ---------------- 図2：SMTP のやり取り（シーケンス図） ----------------
  {
    const p = art(), s = Z.canvas(p);
    const X = [1.15, 5.75], TOP = 0.1, BOT = 5.0;
    cline(s, X[0], TOP, BOT, "送信サーバ", "SMTP クライアント", "teal", 2.1);
    cline(s, X[1], TOP, BOT, "受信サーバ", "SMTP サーバ", "navy", 2.1);
    const Y = seq2(s, X, 1.11, 0.325, [
      ["<", "220 mx.example.net ESMTP（あいさつ）"],
      [">", "EHLO mail.example.com"],
      ["<", "250（対応する拡張の一覧）"],
      [">", "MAIL FROM:<alice@example.com>"],
      ["<", "250 OK"],
      [">", "RCPT TO:<bob@example.net>"],
      ["<", "250 OK"],
      [">", "DATA"],
      ["<", "354（メッセージの送信開始）"],
      [">", "ヘッダ＋本文＋「.」だけの行"],
      ["<", "250 OK（受付）"],
      [">", "QUIT"],
      ["<", "221（切断）"],
    ], "teal", "navy");
    bracket(s, 7.0, Y(3) - 0.24, Y(6) + 0.04, "エンベロープ", "配送用の差出人・宛先");
    bracket(s, 7.0, Y(9) - 0.24, Y(9) + 0.04, "メッセージ", "From: To: Subject: 本文");
    await clegend(s, [["teal", "送信サーバ", 1.75], ["navy", "受信サーバ", 1.75], L.cmdData, L.rep], 5.15);
    await save(p, "02_SMTPのやり取り");
  }

  // ---------------- 図3：POP3 のやり取り（シーケンス図） ----------------
  {
    const p = art(), s = Z.canvas(p);
    const X = [1.15, 5.75], TOP = 0.1, BOT = 5.0;
    cline(s, X[0], TOP, BOT, "受信者の端末", "POP3 クライアント", "slate", 2.1);
    cline(s, X[1], TOP, BOT, "受信サーバ", "POP3 サーバ", "navy", 2.1);
    const Y = seq2(s, X, 1.11, 0.325, [
      ["<", "+OK POP3 server ready"],
      [">", "USER bob"],
      ["<", "+OK"],
      [">", "PASS ********"],
      ["<", "+OK（認証成功）"],
      [">", "STAT"],
      ["<", "+OK 2 3200（2通・3200 バイト）"],
      [">", "RETR 1"],
      ["<", "+OK＋1通目の全文"],
      [">", "DELE 1"],
      ["<", "+OK（削除予定の印）"],
      [">", "QUIT"],
      ["<", "+OK（削除の確定・切断）"],
    ], "slate", "navy");
    bracket(s, 7.0, Y(1) - 0.24, Y(4) + 0.02, "AUTHORIZATION", "認証");
    bracket(s, 7.0, Y(5) - 0.22, Y(10) + 0.02, "TRANSACTION", "取得・削除予定の印");
    bracket(s, 7.0, Y(11) - 0.22, Y(12) + 0.04, "UPDATE", "削除の確定");
    await clegend(s, [["slate", "受信者の端末", 1.75], ["navy", "受信サーバ", 1.75], L.cmd, L.rep], 5.15);
    await save(p, "03_POP3のやり取り");
  }

  // ---------------- 図4：POP3 と IMAP の違い（2パネル） ----------------
  {
    const p = art(), s = Z.canvas(p);
    const SY = 1.75, PY = 1.1, MY = 2.95;  // 箱・PC・スマホの y
    const panel = async (x0, head, keep) => {
      cframe(s, x0, 0.5, 4.6, 3.7, head, "panel");
      const sv = await cnode(s, "mail", x0 + 0.8, SY, "メールボックス", keep ? ["メールを保持"] : ["取得後に削除"], "navy", {w: 1.75});
      const pc = await cnode(s, "pc", x0 + 3.4, PY, "PC", keep ? ["同期済み"] : ["保存済み"], "slate", {right: true, w: 1.05});
      const ph = await cnode(s, "mobile", x0 + 3.4, MY, "スマホ", keep ? ["同期済み"] : ["受信なし"], keep ? "slate" : "red", {right: true, w: 1.05});
      const ex = x0 + 1.62, sx = sv.r[0];
      if (!keep) {
        Z.arrow(s, [[sx, 1.6], [ex, 1.6], [ex, PY], [pc.l[0], PY]], "RETR・DELE", {seg: 2, w: 1.5, dx: -0.12});
        Z.arrow(s, [[sx, 1.9], [ex, 1.9], [ex, MY], [ph.l[0], MY]], "STAT：0 通", {seg: 2, w: 1.5, below: true, dash: true, open: true});
      } else {  // 双方向の同期（行きと帰りの2本）
        const ex2 = ex + 0.16;
        Z.arrow(s, [[sx, 1.52], [ex, 1.52], [ex, PY - 0.07], [pc.l[0], PY - 0.07]], "双方向の同期", {seg: 2, w: 1.7, dx: -0.12});
        Z.arrow(s, [[pc.l[0], PY + 0.07], [ex2, PY + 0.07], [ex2, 1.64], [sx, 1.64]], null);
        Z.arrow(s, [[ph.l[0], MY - 0.07], [ex2, MY - 0.07], [ex2, 1.86], [sx, 1.86]], null);
        Z.arrow(s, [[sx, 1.98], [ex, 1.98], [ex, MY + 0.07], [ph.l[0], MY + 0.07]], "双方向の同期", {seg: 2, w: 1.7, below: true, dx: -0.12});
      }
    };
    await panel(0.2, "POP3：端末への取り出し", false);
    await panel(5.2, "IMAP：サーバに置いたままの同期", true);
    Z.note(s, 0.35, 3.5, 4.3, 0.5, "サーバにコピーを残せば複数端末も可");
    Z.note(s, 5.35, 3.5, 4.3, 0.5, "フォルダ・既読もサーバ側で管理");
    await clegend(s, [L.term, ["navy", "受信側", 1.2], ["red", "問題", 1.1], ["solid", "メールの取得・同期", 2.45], ["reply", "取得対象なし", 1.9]], 4.5);
    await save(p, "04_POP3とIMAPの違い");
  }
})();
