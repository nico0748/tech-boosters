// compact no.34「TCPとUDP」の図1〜4（zukai-diagrams 準拠）
// 使い方: node figs.js <出力フォルダ>   → 続けて ./render.sh <出力フォルダ> で PNG（2000px）
// 文字は 14pt 以上（名前は 15pt 太字）。記事幅 約800px でも読める大きさにする
const Z = require("./zukai.js");
const path = require("path");
const OUT = process.argv[2] || ".";

// 元の図の分類色（記事全体で共通）
//   この記事での意味：slate＝クライアント／navy＝サーバ／teal・navy・purple＝ストリーム A・B・C／red＝損失／gray＝待ち
const K = {
  slate: {c: "2B3A4A", f: "F3F4F6"},
  teal: {c: "1E8A82", f: "E8F5F3"},
  navy: {c: "2E5E8E", f: "EEF3F9"},
  red: {c: "C0392B", f: "FBEEEC"},
  gray: {c: "6B7280", f: "F1F3F4"},
  panel: {c: "3C4043", f: "F5F6F7"},
  purple: {c: "6B4FA0", f: "F1EDF8"},
};
const MUTED = Z.C.muted, NAME = 15, LH = 0.27;

function art() {
  const p = Z.article({title: "TCPとUDP 図", author: "Nico"});
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
// o.boxH：枠の高さ（2行の凡例の1行目で指定）／o.cont：2行目（枠と「凡例」を描かず、o.x0 から並べる）
async function clegend(s, items, y, colW = 1.6, o = {}) {
  const h = 0.42, ww = o.w || 0.66 + items.reduce((a, it) => a + (it[2] || colW), 0), x0 = o.x0 ?? (10 - ww) / 2;
  if (!o.cont) {
    s.addShape("roundRect", {x: x0, y, w: ww, h: o.boxH || h, rectRadius: 0.08, fill: {color: "FFFFFF"}, line: {color: Z.C.grid, width: 0.75}});
    Z.T(s, "凡例", {x: x0 + 0.1, y: y + 0.07, w: 0.54, h: 0.28, fontSize: 14, bold: true, color: MUTED, valign: "middle"});
  }
  let sx = x0 + 0.66;
  for (const [kind, text, cw0] of items) {
    const cw = cw0 || colW, yy = y + h / 2;
    if (kind === "note") Z.note(s, sx + 0.02, yy - 0.12, 0.36, 0.24, "");
    else if (kind === "lost") {
      s.addShape("line", {x: sx, y: yy, w: 0.3, h: 0, line: {color: K.red.c, width: 1.75}});
      Z.T(s, "×", {x: sx + 0.2, y: yy - 0.15, w: 0.3, h: 0.3, fontSize: 16, bold: true, color: K.red.c, align: "center", valign: "middle"});
    } else if (kind.startsWith("arr:")) {
      const k2 = kind.slice(4), back = false;  // 凡例の矢印は種類によらず右下向きに揃える
      Z.arrow(s, back ? [[sx + 0.42, yy - 0.09], [sx, yy + 0.09]] : [[sx, yy - 0.09], [sx + 0.42, yy + 0.09]], null, {color: SEG[k2], width: 2.25, dash: !!SEGDASH[k2], open: false});
    } else if (kind === "self") {
      Z.arrow(s, [[sx, yy - 0.1], [sx + 0.3, yy - 0.1], [sx + 0.3, yy + 0.1], [sx, yy + 0.1]], null, {width: 1.75});
    } else if (kind === "dot") s.addShape("line", {x: sx, y: yy, w: 0.4, h: 0, line: {color: Z.C.gray, width: 1.25, dashType: "sysDot"}});
    else if (kind === "num") Z.T(s, "①", {x: sx, y: yy - 0.17, w: 0.4, h: 0.34, fontSize: 16, bold: true, color: Z.C.title, align: "center", valign: "middle"});
    else if (kind.startsWith("bar:")) s.addShape("rect", {x: sx + 0.15, y: yy - 0.15, w: 0.07, h: 0.3, fill: {color: K[kind.slice(4)].c}, line: {type: "none"}});
    else if (K[kind]) s.addShape("roundRect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, rectRadius: 0.04, fill: {color: K[kind].f}, line: {color: K[kind].c, width: 1.5}});
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
// ---- ここから no.34 の図 ----
// 右側の括弧（シーケンス図の区間の説明）。w で文字の幅
function bracket(s, x, y1, y2, name, sub, w = 1.7) {
  const c = Z.C.arrow;
  s.addShape("line", {x, y: y1, w: 0, h: y2 - y1, line: {color: c, width: 2}});
  s.addShape("line", {x: x - 0.12, y: y1, w: 0.12, h: 0, line: {color: c, width: 2}});
  s.addShape("line", {x: x - 0.12, y: y2, w: 0.12, h: 0, line: {color: c, width: 2}});
  const runs = [{text: name, options: {bold: true, fontSize: NAME, color: c, breakLine: !!sub}}];
  if (sub) runs.push({text: sub, options: {color: MUTED}});
  Z.T(s, runs, {x: x + 0.12, y: (y1 + y2) / 2 - 0.3, w, h: 0.6, fontSize: 14, valign: "middle"});
}
const RED = K.red.c;
// セグメントの種類ごとの色（図1・図2で共通）
// Okabe-Ito 系の色（色覚の多様性に配慮）。ACK は破線にして、色だけに頼らない。文字は読みやすいよう少し濃く
const SEG = {syn: "D55E00", data: "0072B2", ack: "009E73", fin: "CC79A7"};
const SEGT = {syn: "C05000", data: "0067A0", ack: "007A5A", fin: "A8508A"};
const SEGDASH = {ack: true};
// 斜めのメッセージ（時間経過）。ラベルは水平のまま、線の上側（線にかからない高さ）に置く
const textW = (t) => [...t].reduce((a, c) => a + (c.charCodeAt(0) > 0xff ? 0.2 : 0.115), 0) + 0.12;  // 14pt 太字の目安幅
const LBL = 0.3;  // ラベルの高さ
function dmsg(s, x1, y1, x2, y2, label, k, o = {}) {
  const col = o.color || SEG[k], tcol = o.color || SEGT[k];
  const xe = o.stopAt ?? x2, ye = y1 + (y2 - y1) * (xe - x1) / (x2 - x1);
  if (o.stopAt != null) s.addShape("line", {x: Math.min(x1, xe), y: y1, w: Math.abs(xe - x1), h: ye - y1, flipH: xe < x1, line: {color: col, width: 2.25}});
  else Z.arrow(s, [[x1, y1], [x2, y2]], null, {color: col, width: 2.25, dash: !!SEGDASH[k], open: false});
  const w = textW(label), L = Math.abs(xe - x1), cy = (y1 + ye) / 2;
  const cx = Math.max((x1 + xe) / 2 + (o.dx || 0), Math.min(x1, xe) + 0.05 + w / 2);  // 左端のライフラインにかからない位置
  const top = cy - (ye - y1) * (w / 2) / L;  // ラベルの幅の範囲で線がいちばん高いところ
  Z.T(s, label, {x: cx - w / 2, y: top - 0.04 - LBL, w, h: LBL, fontSize: 14, bold: true, color: tcol, align: "center", valign: "middle"});
  return {xe, ye};
}
// 次のメッセージのラベルが、前のメッセージの線（逆向きの斜め）にかからないための間隔
const gapFor = (label, D, L) => Math.max(0.08, LBL + 0.08 - D * (1 - textW(label) / L));
// 縦長の記事用台紙
function artH(h) {
  const p = art(); p.defineLayout({name: "ART_TALL", width: 10, height: h}); p.layout = "ART_TALL"; return p;
}
(async () => {
  // ---------------- 図1：TCP と UDP の通信の違い（2パネル、斜めの矢印で時間経過） ----------------
  {
    const T = [0.75, 4.05], L = T[1] - T[0], D = 0.46, GG = 0.18, TOP = 0.62, Y0 = 1.2;
    const rows = [
      [">", "SYN（seq=x）", "syn"], ["<", "SYN+ACK（seq=y, ack=x+1）", "syn"], [">", "ACK（ack=y+1）", "ack"],
      [">", "データ", "data"], ["<", "ACK", "ack"],
      [">", "FIN", "fin"], ["<", "ACK", "ack"], ["<", "FIN", "fin"], [">", "ACK", "ack"],
    ].map((r, i) => [r[0], `${i + 1}: ${r[1]}`, r[2]]);
    const ys = []; let t = Y0 + LBL;
    rows.forEach((r, i) => {
      if (i > 0) t += (i === 3 || i === 5) ? Math.max(GG + LBL, gapFor(r[1], D, L)) : gapFor(r[1], D, L);
      ys.push([t, t + D]); t += D;
    });
    const BOT = t + 0.15, H = BOT + 0.95;
    const p = artH(H), s = Z.canvas(p);
    cframe(s, 0.1, 0.45, 6.35, BOT - 0.3, "TCP", "panel");
    cframe(s, 6.6, 0.45, 3.3, BOT - 0.3, "UDP", "panel");
    cline(s, T[0], TOP, BOT, "クライアント", null, "slate", 1.3, 0.42);
    cline(s, T[1], TOP, BOT, "サーバ", null, "navy", 1.3, 0.42);
    rows.forEach(([d, l, k], i) => {
      const [a, b] = d === ">" ? [T[0], T[1]] : [T[1], T[0]];
      dmsg(s, a, ys[i][0], b, ys[i][1], l, k);
    });
    bracket(s, 4.35, ys[0][0] - LBL - 0.05, ys[2][1] + 0.03, "接続の確立", "3ウェイハンドシェイク", 2.0);
    bracket(s, 4.35, ys[3][0] - LBL - 0.05, ys[4][1] + 0.03, "データ転送", "ACK による到達確認", 2.0);
    bracket(s, 4.35, ys[5][0] - LBL - 0.05, ys[8][1] + 0.03, "切断", "向きごとの FIN", 2.0);
    // UDP（TCP の1・2と同じ時刻に置いて、往復数の違いを見せる）
    const U = [7.2, 9.3];
    cline(s, U[0], TOP, BOT, "クライアント", null, "slate", 1.2, 0.42);
    cline(s, U[1], TOP, BOT, "サーバ", null, "navy", 1.2, 0.42);
    dmsg(s, U[0], ys[0][0], U[1], ys[0][1] - 0.15, "1: 要求", "data");
    dmsg(s, U[1], ys[1][0], U[0], ys[1][1] - 0.15, "2: 応答", "data");
    Z.note(s, 7.35, ys[2][1] + 0.3, 1.8, 1.1, [
      {text: "接続管理の不在", options: {breakLine: true}}, {text: "到達確認の不在", options: {breakLine: true}}, {text: "再送はアプリ側"}]);
    await clegend(s, [["arr:syn", "SYN・SYN+ACK", 2.25], ["arr:data", "データ", 1.35], ["arr:ack", "ACK", 1.15], ["arr:fin", "FIN", 1.1], ["note", "補足", 1.1]], BOT + 0.35);
    await save(p, "01_TCPとUDPの通信の違い");
  }

  // ---------------- 図2：TCP の再送と並べ直し（斜めの矢印で時間経過） ----------------
  {
    const X = [1.3, 4.85], R = [X[0], X[1]], Lw = R[1] - R[0], D = 0.52, TOP = 0.1;
    const lostX = R[0] + Lw * 0.6;
    const ev = [
      ["msg", ">", "seq=1（1〜1000）", "data"], ["msg", "<", "ACK=1001", "ack"],
      ["lost", ">", "seq=1001（1001〜2000）", "lost"],
      ["msg", ">", "seq=2001（2001〜3000）", "data"], ["msg", "<", "ACK=1001（重複 ACK）", "ack"],
      ["self", null, "再送タイマ切れ"],
      ["msg", ">", "seq=1001（1001〜2000、再送）", "data"], ["msg", "<", "ACK=3001", "ack"],
    ];
    const ys = []; let t = 0.95 + LBL;
    ev.forEach((e, i) => {
      if (i > 0) {
        const prev = ev[i - 1];
        if (e[0] === "self") t += 0.15;
        else if (prev[0] === "self") t += LBL + 0.12;
        else if (prev[0] === "lost") t += 0.3;  // 損失線は途中で止まるので重なりが小さい
        else t += gapFor(e[2], D, e[0] === "lost" ? lostX - R[0] : Lw) + (e[0] === "lost" ? 0.06 : 0);
      }
      const h = e[0] === "self" ? 0.3 : D;
      ys.push([t, t + h]); t += h;
    });
    const BOT = t + 0.18, H = BOT + 1.35;
    const p = artH(H), s = Z.canvas(p);
    cline(s, X[0], TOP, BOT, "送信側", "TCP", "slate", 1.8, 0.62);
    cline(s, X[1], TOP, BOT, "受信側", "TCP", "navy", 1.8, 0.62);
    let lostEnd;
    ev.forEach((e, i) => {
      const [y1, y2] = ys[i];
      if (e[0] === "self") return selfR(s, X[0], y1, e[2], 2.0, 0.3);
      const [a, b] = e[1] === ">" ? [R[0], R[1]] : [R[1], R[0]];
      if (e[0] === "lost") {
        lostEnd = dmsg(s, a, y1, b, y2, e[2], null, {color: RED, stopAt: lostX});
        Z.T(s, "×", {x: lostEnd.xe - 0.2, y: lostEnd.ye - 0.2, w: 0.4, h: 0.4, fontSize: 22, bold: true, color: RED, align: "center", valign: "middle"});
        Z.T(s, "損失", {x: lostEnd.xe + 0.2, y: lostEnd.ye - 0.15, w: 0.8, h: 0.3, fontSize: 14, bold: true, color: RED, valign: "middle"});
      } else dmsg(s, a, y1, b, y2, e[2], e[3]);
    });
    [["①", 0, 1], ["②", 2, 2], ["③", 3, 4], ["④", 5, 6], ["⑤", 7, 7]].forEach(([n, a, b]) => {
      const yy = (ys[a][0] - (ev[a][0] === "self" ? 0 : LBL / 2) + ys[b][1]) / 2;
      Z.T(s, n, {x: 0.05, y: yy - 0.2, w: 0.4, h: 0.4, fontSize: 18, bold: true, color: Z.C.title, align: "center", valign: "middle"});
    });
    // 受信側の動き（セグメントが届いた時刻にそろえる）
    Z.T(s, "受信側の動き", {x: 6.0, y: 0.25, w: 3.8, h: 0.32, fontSize: NAME, bold: true, color: K.navy.c, valign: "middle"});
    const st = (y, head, sub, k) => {
      s.addShape("rect", {x: 6.0, y: y - 0.28, w: 0.07, h: 0.56, fill: {color: K[k].c}, line: {type: "none"}});
      Z.T(s, [{text: head, options: {bold: true, color: K[k].c, breakLine: true}}, {text: sub, options: {color: MUTED}}],
        {x: 6.17, y: y - 0.3, w: 3.75, h: 0.6, fontSize: 14, valign: "middle"});
      s.addShape("line", {x: X[1] + 0.12, y, w: 6.0 - X[1] - 0.2, h: 0, line: {color: Z.C.gray, width: 1, dashType: "sysDot"}});
    };
    st(ys[0][1], "1〜1000：受信", "アプリへ受け渡し", "navy");
    st(ys[3][1], "2001〜3000：受信", "手前の抜けによりバッファで保留", "gray");
    st(ys[6][1], "1001〜2000：受信", "1001〜3000 のアプリへの受け渡し", "navy");
    await clegend(s, [["arr:data", "データ", 1.35], ["arr:ack", "ACK", 1.15], ["lost", "損失", 1.05], ["bar:navy", "受け渡し済み", 1.75], ["bar:gray", "バッファ保留", 1.75]], BOT + 0.3, 1.6, {w: 7.71, boxH: 0.86});
    await clegend(s, [["self", "送信側の内部処理", 2.35], ["dot", "到着時刻との対応", 2.35], ["num", "本文の手順番号", 2.15]], BOT + 0.72, 1.6, {cont: true, w: 7.71, x0: (10 - 7.71) / 2});
    await save(p, "02_TCPの再送と並べ直し");
  }
  // ---------------- 図3：TCP と UDP のヘッダ（ビット配置） ----------------
  {
    const p = art(), s = Z.canvas(p);
    const X0 = 1.95, WD = 7.85, BW = WD / 32, RH = 0.46;
    const cell = (b0, bits, y, h, text, k, o = {}) => {
      const lines = Array.isArray(text) ? text : [text];
      const runs = lines.map((t, i) => ({text: t, options: {breakLine: i < lines.length - 1}}));
      s.addText(runs, {shape: "rect", x: X0 + b0 * BW, y, w: bits * BW, h, fill: {color: K[k].f},
        line: {color: K[k].c, width: 1.25, dashType: o.dash ? "dash" : "solid"}, fontFace: Z.FONT.en, fontSize: 14,
        bold: !!o.bold, color: o.color || Z.C.text, align: "center", valign: "middle", margin: o.m ?? 0.02});
    };
    // ビットの目盛り
    for (const b of [0, 8, 16, 24, 31]) {
      const x = X0 + (b === 31 ? 31.5 : b + 0.5) * BW;
      Z.T(s, String(b), {x: x - 0.25, y: 0.12, w: 0.5, h: 0.26, fontSize: 14, color: MUTED, align: "center", valign: "middle"});
    }
    const side = (y, h, name, sub) => Z.T(s, [{text: name, options: {bold: true, fontSize: 18, color: Z.C.title, breakLine: true}}, {text: sub, options: {color: MUTED}}],
      {x: 0.1, y: y + h / 2 - 0.35, w: 1.75, h: 0.7, fontSize: 14, align: "center", valign: "middle"});
    // TCP
    let y = 0.42;
    const tcpTop = y;
    cell(0, 16, y, RH, "送信元ポート", "teal"); cell(16, 16, y, RH, "宛先ポート", "teal"); y += RH;
    cell(0, 32, y, RH, "シーケンス番号", "navy"); y += RH;
    cell(0, 32, y, RH, "ACK 番号", "navy"); y += RH;
    const FH = 0.62;
    cell(0, 4, y, FH, "ヘッダ長", "gray"); cell(4, 4, y, FH, "予約", "gray");
    cell(8, 8, y, FH, ["CWR ECE URG ACK", "PSH RST SYN FIN"], "navy");
    cell(16, 16, y, FH, "ウィンドウ", "navy"); y += FH;
    cell(0, 16, y, RH, "チェックサム", "purple"); cell(16, 16, y, RH, "緊急ポインタ", "gray"); y += RH;
    cell(0, 32, y, RH, "オプション（可変長、0〜40 バイト）", "gray"); y += RH;
    side(tcpTop, y - tcpTop, "TCP", "20〜60 バイト");
    // UDP
    y += 0.42;
    const udpTop = y;
    cell(0, 16, y, RH, "送信元ポート", "teal"); cell(16, 16, y, RH, "宛先ポート", "teal"); y += RH;
    cell(0, 16, y, RH, "長さ", "gray"); cell(16, 16, y, RH, "チェックサム", "purple"); y += RH;
    side(udpTop, y - udpTop, "UDP", "8 バイト固定");
    await clegend(s, [["teal", "宛先アプリの区別", 2.3], ["navy", "接続・到達・順序・流量・輻輳の制御", 3.95], ["purple", "誤り検出", 1.5], ["gray", "その他", 1.15]], 4.85);
    await save(p, "03_TCPとUDPのヘッダ");
  }

  // ---------------- 図4：HTTP/2 と HTTP/3 のヘッドオブラインブロッキング ----------------
  {
    const p = art(), s = Z.canvas(p);
    const COL = (i) => 2.15 + i * 1.08, PW = 0.92, PH = 0.36;
    const SK = {A: "teal", B: "navy", C: "purple"};
    // パケット1つ。state: ok（受け渡し済み）／lost（損失）／wait（待ち）
    const pkt = (i, y, name, state) => {
      const k = SK[name[0]];
      if (state === "lost") {
        s.addText(name, {shape: "rect", x: COL(i), y, w: PW, h: PH, fill: {color: K.red.f}, line: {color: RED, width: 1.5, dashType: "dash"},
          fontFace: Z.FONT.en, fontSize: 14, bold: true, color: RED, align: "center", valign: "middle", margin: 0});
        Z.T(s, "×", {x: COL(i) + PW - 0.22, y: y - 0.2, w: 0.3, h: 0.3, fontSize: 18, bold: true, color: RED, align: "center", valign: "middle"});
      } else if (state === "wait") {
        s.addText(name, {shape: "rect", x: COL(i), y, w: PW, h: PH, fill: {color: K.gray.f}, line: {color: K.gray.c, width: 1.25, dashType: "dash"},
          fontFace: Z.FONT.en, fontSize: 14, bold: true, color: K.gray.c, align: "center", valign: "middle", margin: 0});
      } else {
        s.addText(name, {shape: "rect", x: COL(i), y, w: PW, h: PH, fill: {color: K[k].c}, line: {color: K[k].c, width: 1.25},
          fontFace: Z.FONT.en, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0});
      }
    };
    const seq = [["A1", 0], ["B1", 1], ["C1", 2], ["B2", 3], ["A2", 4], ["C2", 5], ["B3", 6]];
    // 時間軸
    Z.arrow(s, [[COL(0), 0.3], [COL(6) + PW, 0.3]], "送信順", {w: 2.6, width: 1.5});
    // 上段：HTTP/2（TCP）
    cframe(s, 0.1, 0.62, 9.8, 1.62, null, "panel");
    Z.T(s, [{text: "HTTP/2", options: {bold: true, fontSize: 18, color: Z.C.title, breakLine: true}}, {text: "TCP 接続1本", options: {color: MUTED}}],
      {x: 0.12, y: 0.82, w: 1.45, h: 0.62, fontSize: 14, align: "center", valign: "middle"});
    const ty = 0.95;
    s.addShape("rect", {x: COL(0) - 0.08, y: ty - 0.08, w: COL(6) + PW - COL(0) + 0.16, h: PH + 0.16, fill: {type: "none"}, line: {color: Z.C.arrow, width: 1.25}});
    for (const [n, i] of seq) pkt(i, ty, n, n === "B2" ? "lost" : i < 3 ? "ok" : "wait");
    Z.T(s, [{text: "B2 の再送待ち", options: {bold: true, color: RED}}, {text: " → A2・C2・B3 も受け渡し待ち"}], {x: COL(0) - 0.1, y: 1.52, w: 7.7, h: 0.32, fontSize: 14, valign: "middle"});
    Z.T(s, "順序保証の単位：TCP 接続全体", {x: COL(0) - 0.1, y: 1.84, w: 7.7, h: 0.3, fontSize: 14, color: MUTED, valign: "middle"});
    // 下段：HTTP/3（QUIC）
    cframe(s, 0.1, 2.42, 9.8, 2.35, null, "panel");
    Z.T(s, [{text: "HTTP/3", options: {bold: true, fontSize: 18, color: Z.C.title, breakLine: true}}, {text: "QUIC（UDP）", options: {color: MUTED}}],
      {x: 0.12, y: 2.93, w: 1.45, h: 0.62, fontSize: 14, align: "center", valign: "middle"});
    const ly = {A: 2.62, B: 3.12, C: 3.62};
    for (const n of ["A", "B", "C"]) {
      s.addShape("line", {x: COL(0) - 0.08, y: ly[n] + PH / 2, w: COL(6) + PW - COL(0) + 0.16, h: 0, line: {color: K[SK[n]].c, width: 1, dashType: "dash"}});
      Z.T(s, n, {x: 1.6, y: ly[n] + PH / 2 - 0.15, w: 0.35, h: 0.3, fontSize: 16, bold: true, color: K[SK[n]].c, align: "center", valign: "middle"});
    }
    for (const [n, i] of seq) pkt(i, ly[n[0]], n, n === "B2" ? "lost" : n === "B3" ? "wait" : "ok");
    Z.T(s, [{text: "B3 のみ B2 の再送待ち", options: {bold: true, color: RED}}, {text: " → A2・C2 は即時受け渡し"}], {x: COL(0) - 0.1, y: 4.07, w: 7.7, h: 0.32, fontSize: 14, valign: "middle"});
    Z.T(s, "順序保証の単位：ストリーム", {x: COL(0) - 0.1, y: 4.39, w: 7.7, h: 0.3, fontSize: 14, color: MUTED, valign: "middle"});
    // 凡例
    const lx = 0.6, lyy = 4.93, items = [["A", "ストリーム A", 1.8], ["B", "B", 0.9], ["C", "C", 0.9], ["lost", "損失", 1.1], ["wait", "アプリへの受け渡し待ち", 3.1]];
    const ww = 0.66 + items.reduce((a, it) => a + it[2], 0), x0 = (10 - ww) / 2;
    s.addShape("roundRect", {x: x0, y: lyy, w: ww, h: 0.42, rectRadius: 0.08, fill: {color: "FFFFFF"}, line: {color: Z.C.grid, width: 0.75}});
    Z.T(s, "凡例", {x: x0 + 0.1, y: lyy + 0.07, w: 0.54, h: 0.28, fontSize: 14, bold: true, color: MUTED, valign: "middle"});
    let sx = x0 + 0.66;
    for (const [kd, t, cw] of items) {
      const r = {x: sx, y: lyy + 0.11, w: 0.36, h: 0.2};
      if (kd === "lost") {
        s.addShape("rect", {...r, fill: {color: K.red.f}, line: {color: RED, width: 1.5, dashType: "dash"}});
        Z.T(s, "×", {x: sx + 0.24, y: lyy - 0.04, w: 0.24, h: 0.24, fontSize: 14, bold: true, color: RED, align: "center", valign: "middle"});
      }
      else if (kd === "wait") s.addShape("rect", {...r, fill: {color: K.gray.f}, line: {color: K.gray.c, width: 1.25, dashType: "dash"}});
      else s.addShape("rect", {...r, fill: {color: K[SK[kd]].c}, line: {type: "none"}});
      Z.T(s, t, {x: sx + 0.46, y: lyy + 0.07, w: cw - 0.48, h: 0.28, fontSize: 14, valign: "middle"});
      sx += cw;
    }
    await save(p, "04_HTTP2とHTTP3のヘッドオブラインブロッキング");
  }
})();
