// 図1：Streamable HTTP のメッセージの流れ（MCP 仕様 2026-07-28）
const Z = require("./zukai.js");
const F = 14;  // 文字サイズ（pt）
(async () => {
  const p = Z.article({title: "Streamable HTTPのメッセージの流れ"});
  Object.assign(Z.FS, {label: F, sub: F, arrow: F, box: F});
  const c = Z.canvas(p);
  const XC = 1.45, XS = 6.45, TOP = 0.3, BOT = 5.1;
  await Z.lifeline(c, XC, TOP, BOT, "MCP クライアント", {w: 2.1});
  await Z.lifeline(c, XS, TOP, BOT, "MCP サーバ（/mcp）", {w: 2.3});
  // リクエストは1本。応答の形式はサーバがリクエストごとに選ぶ
  Z.msg(c, XC + 0.07, XS - 0.07, 1.45, "POST /mcp  tools/call（JSON-RPC id=1）\nAccept: application/json, text/event-stream", "sync", 1, {h: 0.6});
  const FX = 0.3, FW = 7.2, FY = 1.7, EY = 2.75;
  Z.fragment(c, FX, FY, FW, 3.2, "alt", null, EY, "");
  const guard = (y, t) => Z.T(c, t, {x: FX + 0.7, y, w: 4.3, h: 0.3, wrap: false, fontSize: F, bold: true, color: Z.C.title, valign: "middle", fill: {color: Z.C.white}});
  guard(FY + 0.04, "[Content-Type: application/json]");
  guard(EY + 0.04, "[Content-Type: text/event-stream]");
  Z.msg(c, XS - 0.07, XC + 0.07, 2.45, "200 OK  JSON-RPC 応答", "reply", 2);
  Z.msg(c, XS - 0.07, XC + 0.07, 3.55, "200 OK  ストリーム開始", "reply", 3);
  Z.msg(c, XS - 0.07, XC + 0.07, 4.05, "SSE: notifications/progress（0 回以上）", "async", 4, {width: 1.25});
  Z.msg(c, XS - 0.07, XC + 0.07, 4.65, "SSE: JSON-RPC 応答（最終）", "async", 5, {width: 1.25});
  Z.activation(c, XS, 1.45, 4.65);
  // このリクエスト専用の SSE ストリーム（3〜5）
  const BX = 7.8;
  Z.arrow(c, [[BX - 0.12, 3.55], [BX, 3.55], [BX, 4.65], [BX - 0.12, 4.65]], null, {head: "none", color: Z.C.muted, width: 1.5});
  Z.T(c, [{text: "SSE ストリーム", options: {bold: true, color: Z.C.title, breakLine: true}}, {text: "リクエスト専用", options: {color: Z.C.muted, breakLine: true}}, {text: "最終応答で終了", options: {color: Z.C.muted}}],
    {x: BX + 0.1, y: 3.6, w: 2.0, h: 0.95, fontSize: F, valign: "middle"});
  await Z.legend(c, 7.68, 0.3, [["solid", "同期リクエスト"], ["reply", "HTTP 応答"], ["open", "SSE イベント"]], 2.2);
  await Z.save(p, process.argv[2] || "01_Streamable HTTPのメッセージの流れ.pptx");
})();
