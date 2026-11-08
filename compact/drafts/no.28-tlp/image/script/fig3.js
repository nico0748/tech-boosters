// 図3：メールと文書での TLP ラベルの付け方（FIRST TLP 2.0 の Usage に準拠）
const {C, T, deck, icon, pill} = require("./tlp.js");
const out = process.argv[2] || "03_TLPラベルの付け方.pptx";
const BAR = "D5DAE1";
function lines(s, x, y, w, n, gap = 0.3) { for (let i = 0; i < n; i++) s.addShape("roundRect", {x, y: y + i * gap, w: i === n - 1 ? w * 0.6 : w, h: 0.11, rectRadius: 0.05, fill: {color: BAR}, line: {type: "none"}}); }
function callout(s, x1, y1, x2, y2, text, o = {}) {  // 引き出し線。注釈は線の上
  s.addShape("line", {x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(Math.abs(x2 - x1), 0.0001), h: Math.max(Math.abs(y2 - y1), 0.0001),
    flipH: x2 < x1, flipV: y2 < y1, line: {color: C.pink, width: 1.25, endArrowType: "oval"}});
  T(s, text, {x: o.tx ?? Math.min(x1, x2), y: y1 - 0.36, w: o.w || 3.0, h: 0.32, fontSize: 13, bold: true, color: C.pink, align: o.align || "left", valign: "bottom"});
}
(async () => {
  const p = deck(); const s = p.addSlide(); s.background = {color: C.white};
  // 見出し
  for (const [x, ic, name] of [[0.4, "mail", "メール・チャット"], [6.75, "doc", "文書（PDF・Word など）"]]) {
    s.addImage({data: await icon(ic, C.blue), x, y: 0.28, w: 0.4, h: 0.4});
    T(s, name, {x: x + 0.5, y: 0.28, w: 5, h: 0.4, fontSize: 15, bold: true, color: C.navy, valign: "middle"});
  }
  // メール
  const mx = 0.4, my = 1.3, mw = 5.9, mh = 5.0;
  s.addShape("roundRect", {x: mx, y: my, w: mw, h: mh, rectRadius: 0.08, fill: {color: C.white}, line: {color: "9AA0A6", width: 1.25}});
  s.addShape("line", {x: mx, y: my + 0.62, w: mw, h: 0, line: {color: BAR, width: 1}});
  T(s, [{text: "件名：", options: {color: C.muted}}, {text: "[TLP:AMBER] ", options: {bold: true, fontFace: "Menlo", color: C.navy}}, {text: "IoC 共有（2026-11-07）", options: {color: C.navy}}],
    {x: mx + 0.2, y: my + 0.14, w: mw - 0.4, h: 0.36, fontSize: 13, valign: "middle"});
  lines(s, mx + 0.25, my + 0.95, mw - 0.5, 2);
  pill(s, mx + 0.25, my + 1.65, 1.6, 0.36, "AMBER", {fs: 13});
  s.addShape("rect", {x: mx + 0.25, y: my + 2.12, w: 0.06, h: 1.75, fill: {color: "FFC000"}, line: {type: "none"}});
  lines(s, mx + 0.45, my + 2.2, mw - 0.75, 5);
  T(s, "TLP:AMBER ここまで", {x: mx + 0.25, y: my + 4.0, w: 2.6, h: 0.32, fontSize: 13, bold: true, fontFace: "Menlo", color: C.navy, valign: "middle"});
  lines(s, mx + 0.25, my + 4.5, mw - 0.5, 1);
  callout(s, mx + 3.4, my - 0.12, mx + 3.4, my + 0.2, "件名にもラベル", {tx: mx + 2.3, w: 2.2, align: "center"});
  callout(s, mx + 1.95, my + 1.83, mx + 4.0, my + 1.83, "情報の直前", {tx: mx + 2.05, w: 1.95, align: "right"});
  callout(s, mx + 2.95, my + 4.16, mx + 5.0, my + 4.16, "範囲の終わり", {tx: mx + 3.05, w: 1.95, align: "right"});
  // 文書
  const dx = 6.75, dy = 0.95, dw = 4.3, dh = 5.9;
  s.addShape("rect", {x: dx, y: dy, w: dw, h: dh, fill: {color: C.white}, line: {color: "9AA0A6", width: 1.25}, shadow: {type: "outer", blur: 4, offset: 2, angle: 45, color: "000000", opacity: 0.15}});
  pill(s, dx + dw - 1.75, dy + 0.18, 1.55, 0.34, "AMBER", {fs: 12});
  s.addShape("line", {x: dx + 0.25, y: dy + 0.65, w: dw - 0.5, h: 0, line: {color: BAR, width: 1}});
  s.addShape("roundRect", {x: dx + 0.3, y: dy + 0.95, w: 2.4, h: 0.2, rectRadius: 0.05, fill: {color: "AEB4BC"}, line: {type: "none"}});
  lines(s, dx + 0.3, dy + 1.45, dw - 0.6, 6, 0.32);
  lines(s, dx + 0.3, dy + 3.6, dw - 0.6, 4, 0.32);
  s.addShape("line", {x: dx + 0.25, y: dy + dh - 0.65, w: dw - 0.5, h: 0, line: {color: BAR, width: 1}});
  pill(s, dx + dw - 1.75, dy + dh - 0.52, 1.55, 0.34, "AMBER", {fs: 12});
  T(s, "1 / 12", {x: dx + 0.3, y: dy + dh - 0.52, w: 1.0, h: 0.34, fontSize: 12, color: C.muted, valign: "middle"});
  callout(s, dx + dw - 0.2, dy + 0.35, dx + dw + 1.9, dy + 0.35, "ヘッダー：右寄せ", {tx: dx + dw + 0.1, w: 1.8});
  T(s, "各ページ・12pt 以上", {x: dx + dw + 0.1, y: dy + 0.4, w: 2.0, h: 0.3, fontSize: 12, color: C.muted});
  callout(s, dx + dw - 0.2, dy + dh - 0.35, dx + dw + 1.9, dy + dh - 0.35, "フッター：右寄せ", {tx: dx + dw + 0.1, w: 1.8});
  T(s, "各ページ・12pt 以上", {x: dx + dw + 0.1, y: dy + dh - 0.3, w: 2.0, h: 0.3, fontSize: 12, color: C.muted});
  await require("./lib.js").save(p, out);
})();
