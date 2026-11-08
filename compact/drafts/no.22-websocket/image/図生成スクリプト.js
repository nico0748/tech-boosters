// compact no.22 WebSocket の図（図解ベストプラクティス準拠・記事用台紙 10×5.625in）
// v2：批評レビュー（見やすさ・文言・正確さ）を反映
const Z = require("./zukai.js");
const {C} = Z;
const MONO = "Menlo";

function setFS() { Object.assign(Z.FS, {label: 12, sub: 12, arrow: 12, box: 12}); }

// ---- 文字ラン ----
const mono = (t, o = {}) => ({text: t, options: {fontFace: MONO, ...o}});
const jp = (t, o = {}) => ({text: t, options: {...o}});
const pinkMono = (t) => mono(t, {color: C.pink, bold: true});
// 行の配列（各行はランの配列）を breakLine 付きの1本のラン列にする
function lines(ls) {
  const out = [];
  ls.forEach((runs, i) => runs.forEach((r, j) => out.push({text: r.text,
    options: {...r.options, breakLine: i < ls.length - 1 && j === runs.length - 1}})));
  return out;
}
// 文字幅の目安（in）。全角=1em、等幅=0.602em、その他=0.56em
function textW(runs, pt = 12) {
  let em = 0;
  for (const r of runs) for (const ch of r.text) {
    const full = /[^\x00-\x7F]/.test(ch) && ch !== "…";
    em += full ? 1 : (r.options && r.options.fontFace === MONO ? 0.602 : 0.56);
  }
  return em * pt / 72;
}

// ライフラインの頭（14pt）＋破線
function life(s, x, top, bottom, text, o = {}) {
  const w = o.w || 1.6, h = o.h || 0.45;
  Z.box(s, x - w / 2, top, w, h, text, {shape: "rect", ext: o.ext, fill: o.ext ? undefined : (o.fill || C.frame), size: o.size || 14, bold: o.bold ?? true});
  s.addShape("line", {x, y: top + h, w: 0, h: bottom - top - h, line: {color: C.gray, width: 1, dashType: "dash"}});
}
// メッセージ。ls：行の配列（各行はランの配列）。kind: sync | async | reply
function msg(s, x1, x2, y, ls, kind, o = {}) {
  Z.arrow(s, [[x1, y], [x2, y]], null, {dash: kind === "reply", open: kind !== "sync", width: kind === "reply" ? 1.25 : 1.75});
  const n = ls.length, h = n * 0.205 + 0.04, gap = Math.abs(x2 - x1);
  const left = o.align === "left";
  const off = x2 < x1 ? 0.3 : 0.2;  // 右→左の矢印は矢じりが左にあるので左端を空ける
  const w = o.w || (left ? gap - off - 0.05 : gap - 0.1), x = left ? Math.min(x1, x2) + off : Math.min(x1, x2) + (gap - w) / 2;
  Z.T(s, lines(ls), {x, y: y - h - 0.07, w, h, fontSize: 12, lineSpacing: 14.5, color: C.arrow, align: o.align || "center", valign: "bottom"});
}
// 自分自身への呼び出し（ライフラインから出てライフラインへ戻る）
function selfLoop(s, x, y, h = 0.28) {
  Z.arrow(s, [[x, y], [x + 0.42, y], [x + 0.42, y + h], [x, y + h]], null, {width: 1.75});
}
// 複合フラグメント。ガード文字は白の下地でライフラインの上に載せる
function frag(s, x, y, w, h, op, guard, elseY, elseGuard) {
  s.addShape("rect", {x, y, w, h, fill: {type: "none"}, line: {color: C.title, width: 1}});
  const tw = 0.62, th = 0.28;
  s.addShape("custGeom", {x, y, w: tw, h: th, points: [{x: 0, y: 0}, {x: tw, y: 0}, {x: tw, y: th - 0.08}, {x: tw - 0.08, y: th}, {x: 0, y: th}, {close: true}], fill: {color: C.frame}, line: {color: C.title, width: 1}});
  Z.T(s, op, {x, y, w: tw - 0.06, h: th, fontSize: 12, bold: true, color: C.title, align: "center", valign: "middle"});
  const g = (t, gx, gy) => Z.T(s, t, {x: gx, y: gy, w: textW([{text: t}]) + 0.12, h: 0.27, fontSize: 12, bold: true,
    color: C.title, valign: "middle", align: "center", fill: {color: C.white}});
  g(guard, x + tw + 0.08, y + 0.02);
  s.addShape("line", {x, y: elseY, w, h: 0, line: {color: C.title, width: 1, dashType: "dash"}});
  g(elseGuard, x + tw + 0.08, elseY + 0.04);
}
// 横1列の凡例（項目ごとに幅を計算）
function hLegend(s, x, y, items) {
  const ws = items.map(([, t]) => 0.62 + textW([{text: t}]) + 0.3);
  const W = 0.7 + ws.reduce((a, b) => a + b, 0), H = 0.42;
  s.addShape("roundRect", {x, y, w: W, h: H, rectRadius: 0.08, fill: {color: C.white}, line: {color: C.grid, width: 0.75}});
  Z.T(s, "凡例", {x: x + 0.12, y: y + 0.09, w: 0.6, h: 0.24, fontSize: 12, bold: true, color: C.muted, valign: "middle"});
  let sx = x + 0.7; const yy = y + H / 2;
  items.forEach(([k, t], i) => {
    if (["solid", "open", "reply"].includes(k))
      Z.arrow(s, [[sx, yy], [sx + 0.5, yy]], null, {dash: k === "reply", open: k !== "solid", width: k === "reply" ? 1.25 : 1.75});
    else if (k === "accent") Z.T(s, "abc", {x: sx, y: yy - 0.12, w: 0.5, h: 0.24, fontSize: 12, fontFace: MONO, bold: true, color: C.pink, align: "center", valign: "middle"});
    else if (k === "bracket") s.addShape("custGeom", {x: sx + 0.2, y: yy - 0.12, w: 0.1, h: 0.24, points: [{x: 0, y: 0}, {x: 0.1, y: 0}, {x: 0.1, y: 0.24}, {x: 0, y: 0.24}], fill: {type: "none"}, line: {color: C.title, width: 1.25}});
    else if (k === "extbox") s.addShape("rect", {x: sx + 0.05, y: yy - 0.1, w: 0.42, h: 0.2, fill: {color: C.grayFill}, line: {color: C.muted, width: 1}});
    Z.T(s, t, {x: sx + 0.6, y: yy - 0.13, w: ws[i] - 0.6, h: 0.26, fontSize: 12, valign: "middle"});
    sx += ws[i];
  });
  return {w: W};
}

(async () => {
  // ---------- 図1 ハンドシェイクからフレーム送受信まで ----------
  {
    const p = Z.article({title: "WebSocketのハンドシェイクとフレーム"}); setFS();
    const s = Z.canvas(p);
    const xc = 2.05, xs = 7.45, top = 0.15, bot = 5.5;
    life(s, xc, top, bot, "クライアント", {w: 1.5});
    life(s, xs, top, bot, "サーバ", {w: 1.3});
    const phase = (y1, y2, l1, l2) => {
      s.addShape("line", {x: 1.65, y: y1, w: 0, h: y2 - y1, line: {color: C.title, width: 2.25}});
      Z.T(s, [jp(l1, {bold: true, fontSize: 14, color: C.title, breakLine: true}), jp(l2, {fontSize: 12, color: C.muted})],
        {x: 0.05, y: (y1 + y2) / 2 - 0.3, w: 1.5, h: 0.6, align: "right", valign: "middle"});
    };
    phase(0.8, 2.85, "HTTP/1.1", "ハンドシェイク");
    phase(3.0, 5.48, "WebSocket", "フレーム送受信");

    msg(s, xc, xs, 1.45, [[mono("1: GET /chat HTTP/1.1")], [mono("Upgrade: websocket")],
      [mono("Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==")]], "sync", {align: "left"});
    selfLoop(s, xs, 1.56, 0.28);
    Z.T(s, [jp("Accept の算出", {breakLine: true}), mono("Base64(SHA-1(Key‖GUID))")],
      {x: xs + 0.06, y: 1.9, w: 2.45, h: 0.46, fontSize: 12, lineSpacing: 14.5, color: C.arrow, valign: "top"});
    msg(s, xs, xc, 2.75, [[mono("2: HTTP/1.1 101 Switching Protocols")], [mono("Upgrade: websocket")],
      [mono("Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=")]], "reply", {align: "left", w: 5.1});

    const fr = [
      [xc, xs, "Text  opcode=0x1 MASK=1", "async"],
      [xs, xc, "Text  opcode=0x1 MASK=0", "async"],
      [xs, xc, "Ping  opcode=0x9 MASK=0", "async"],
      [xc, xs, "Pong  opcode=0xA MASK=1", "reply"],
      [xc, xs, "Close opcode=0x8 MASK=1", "async"],
      [xs, xc, "Close opcode=0x8 MASK=0", "reply"],
    ];
    fr.forEach(([a, b, l, k], i) => msg(s, a, b, 3.32 + i * 0.42, [[mono(`${i + 3}: ${l}`)]], k));
    await Z.legend(s, 7.65, 3.45, [["solid", "同期"], ["open", "非同期"], ["reply", "応答"]], 1.9);
    await Z.save(p, "01_WebSocketのハンドシェイクとフレーム.pptx");
  }

  // ---------- 図2 ポーリング・SSE・WebSocket の通信の向き ----------
  {
    const p = Z.article({title: "ポーリング・SSE・WebSocketの通信の向き"}); setFS();
    const s = Z.canvas(p);
    const R = [1.8, 2.35, 2.8, 3.25, 3.7, 4.15];  // 行の y（1・2行目は2行ラベル用に高い）
    const panels = [
      {x: 0.15, head: "ポーリング", foot: "要求ごとに個別の応答", rows: [
        ["c", [[mono("GET")]], "sync"], ["s", [[mono("200 OK")]], "reply"], ["c", [[mono("GET")]], "sync"],
        ["s", [[mono("200 OK")]], "reply"], ["c", [[mono("GET")]], "sync"], ["s", [[mono("200 OK")]], "reply"]]},
      {x: 3.425, head: "SSE", foot: "単一応答で逐次配信", bracket: [1, 4], rows: [
        ["c", [[mono("GET")]], "sync"], ["s", [[mono("200 OK")], [mono("text/event-stream")]], "reply"],
        ["s", [[mono("data: ...")]], "reply"], ["s", [[mono("data: ...")]], "reply"], ["s", [[mono("data: ...")]], "reply"], null]},
      {x: 6.7, head: "WebSocket", foot: "単一接続で全二重", rows: [
        ["c", [[mono("GET")], [mono("Upgrade: websocket")]], "sync"], ["s", [[mono("101")]], "reply"],
        ["c", [[jp("フレーム")]], "async"], ["s", [[jp("フレーム")]], "async"], ["s", [[jp("フレーム")]], "async"], ["c", [[jp("フレーム")]], "async"]]},
    ];
    for (const P of panels) {
      const w = 3.15, y0 = 0.68, h = 4.25;
      Z.frame(s, P.x, y0, w, h);
      Z.T(s, P.head, {x: P.x, y: 0.2, w, h: 0.4, fontSize: 16, bold: true, color: C.title, align: "center", valign: "middle"});
      const xc = P.x + 0.74, xs = P.x + 2.72, top = y0 + 0.12, bot = 4.32;
      life(s, xc, top, bot, "クライアント", {w: 1.35, fill: C.white});
      life(s, xs, top, bot, "サーバ", {w: 0.75, fill: C.white});
      P.rows.forEach((r, i) => {
        if (!r) return;
        const [from, ls, kind] = r, [a, b] = from === "c" ? [xc, xs] : [xs, xc];
        msg(s, a, b, R[i], ls, kind, {w: xs - xc});
      });
      if (P.bracket) {  // 同じ応答のボディであることを示す括弧
        const y1 = R[P.bracket[0]] - 0.05, y2 = R[P.bracket[1]] + 0.05, bx = xs + 0.14;
        s.addShape("custGeom", {x: bx, y: y1, w: 0.1, h: y2 - y1, points: [{x: 0, y: 0}, {x: 0.1, y: 0}, {x: 0.1, y: y2 - y1}, {x: 0, y: y2 - y1}],
          fill: {type: "none"}, line: {color: C.title, width: 1.25}});
      }
      Z.T(s, P.foot, {x: P.x, y: 4.42, w, h: 0.38, fontSize: 14, bold: true, color: C.title, align: "center", valign: "middle"});
    }
    hLegend(s, 0.15, 5.08, [["solid", "同期"], ["open", "非同期"], ["reply", "応答"], ["bracket", "単一応答"]]);
    await Z.save(p, "02_ポーリング・SSE・WebSocketの通信の向き.pptx");
  }

  // ---------- 図3 クロスサイトWebSocketハイジャック ----------
  {
    const p = Z.article({title: "クロスサイトWebSocketハイジャック"}); setFS();
    const s = Z.canvas(p);
    const x1 = 1.3, x2 = 3.75, x3 = 7.75, top = 0.15, bot = 4.97;
    life(s, x1, top, bot, [jp("攻撃者のページ", {bold: true, breakLine: true}), mono("attacker.example.net", {fontSize: 12})], {w: 2.25, h: 0.65, ext: true, bold: false});
    life(s, x2, top, bot, "被害者のブラウザ", {w: 1.75, h: 0.65});
    life(s, x3, top, bot, [jp("WebSocket サーバ", {bold: true, breakLine: true}), mono("chat.example.com", {fontSize: 12})], {w: 2.2, h: 0.65, bold: false});

    msg(s, x1, x2, 1.2, [[mono("1: new WebSocket(url)")]], "async");
    msg(s, x2, x3, 2.05, [[mono("2: GET /ws HTTP/1.1")], [mono("Upgrade: websocket")], [pinkMono("Cookie: session=...")],
      [pinkMono("Origin: https://attacker.example.net")]], "sync", {align: "left"});

    frag(s, 0.15, 2.17, 9.7, 2.8, "alt", "[Origin 未検証]", 4.3, "[Origin 検証・許可リスト外]");
    msg(s, x3, x2, 2.68, [[mono("3: HTTP/1.1 101 Switching Protocols")]], "reply");
    msg(s, x3, x2, 3.05, [[mono("4: "), jp("被害者のチャットデータ")]], "async");
    msg(s, x2, x1, 3.42, [[mono("5: onmessage"), jp(" で受信")]], "async");
    msg(s, x1, x2, 3.79, [[mono("6: ws.send(data)")]], "async");
    msg(s, x2, x3, 4.16, [[mono("7: "), jp("被害者名義のメッセージ")]], "async");
    msg(s, x3, x2, 4.85, [[mono("8: HTTP/1.1 403 Forbidden")]], "reply");

    hLegend(s, 0.15, 5.07, [["solid", "同期"], ["open", "非同期"], ["reply", "応答"], ["accent", "判定対象のヘッダ"], ["extbox", "攻撃者側"]]);
    await Z.save(p, "03_クロスサイトWebSocketハイジャック.pptx");
  }
})();
