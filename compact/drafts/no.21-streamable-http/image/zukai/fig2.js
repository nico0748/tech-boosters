// 図2：旧 HTTP+SSE（2024-11-05）と Streamable HTTP（2026-07-28）の比較
const Z = require("./zukai.js");
const F = 13;  // 文字サイズ（pt）
(async () => {
  const p = Z.article({title: "HTTP+SSEとStreamable HTTPの比較"});
  Object.assign(Z.FS, {label: F, sub: F, arrow: F, box: F});
  const c = Z.canvas(p);
  const TOP = 0.95, HH = 0.62, BOT = 4.8, PY = 0.55, PH = 4.45;
  const pink = (t) => ({text: t, options: {color: Z.C.pink, bold: true}});
  // ライフライン（頭は2行まで）
  const life = (x, w, lines, ext) => {
    const runs = lines.map((t, i) => ({text: t, options: {breakLine: i < lines.length - 1, bold: i === lines.length - 1, color: i < lines.length - 1 ? Z.C.muted : Z.C.title, fontSize: F}}));
    c.addText(runs, {shape: "rect", x: x - w / 2, y: TOP, w, h: HH, fill: {color: Z.C.frame}, line: {color: Z.C.icon, width: 1.25},
      fontFace: Z.FONT.en, align: "center", valign: "middle", margin: 0.03});
    c.addShape("line", {x, y: TOP + HH, w: 0, h: BOT - TOP - HH, line: {color: Z.C.gray, width: 1, dashType: "dash"}});
  };
  // 左：HTTP+SSE（同じサーバにエンドポイント2つ）
  Z.frame(c, 0.25, PY, 5.75, PH, "HTTP+SSE（2024-11-05・非推奨）");
  const L = {c: 1.05, sse: 3.15, post: 5.08};
  life(L.c, 1.6, ["MCP クライアント"]);
  life(L.sse, 1.75, ["MCP サーバ", "SSE エンドポイント"]);
  life(L.post, 1.75, ["MCP サーバ", "POST エンドポイント"]);
  Z.msg(c, L.c + 0.07, L.sse - 0.07, 2.05, "GET（SSE 接続）", "sync", 1, {w: 1.95});
  Z.msg(c, L.sse - 0.07, L.c + 0.07, 2.75, "endpoint イベント\n（POST 先の URI）", "async", 2, {h: 0.58, w: 1.95, width: 1.25});
  Z.msg(c, L.c + 0.07, L.post - 0.07, 3.45, "POST\nJSON-RPC リクエスト", "sync", 3, {w: 1.85, h: 0.58, dx: 1.1});
  Z.msg(c, L.post - 0.07, L.c + 0.07, 4.05, "HTTP 応答\n（仕様上は未規定）", "reply", 4, {w: 1.8, h: 0.58, dx: 0.98});
  Z.msg(c, L.sse - 0.07, L.c + 0.07, 4.6, [pink("message イベント"), {text: "\n（JSON-RPC 応答）"}], "async", 5, {h: 0.58, w: 1.95, width: 1.25});
  Z.activation(c, L.sse, 2.05, 4.72);
  Z.activation(c, L.post, 3.45, 4.05);
  Z.T(c, "SSE 接続の維持", {x: L.sse + 0.14, y: 4.42, w: 1.6, h: 0.3, fontSize: F, color: Z.C.muted, valign: "middle"});
  // 右：Streamable HTTP（エンドポイント1つ）
  Z.frame(c, 6.25, PY, 3.55, PH, "Streamable HTTP（2026-07-28）");
  const R = {c: 7.0, s: 8.98};
  life(R.c, 1.4, ["MCP クライアント"]);
  life(R.s, 1.5, ["MCP サーバ", "/mcp"]);
  Z.msg(c, R.c + 0.07, R.s - 0.07, 2.15, "POST /mcp\nJSON-RPC リクエスト", "sync", 1, {h: 0.58, w: 1.9});
  Z.msg(c, R.s - 0.07, R.c + 0.07, 3.05, [pink("同一 HTTP 応答"), {text: "\n200 OK（JSON / SSE）"}], "reply", 2, {h: 0.58, w: 1.9});
  Z.activation(c, R.s, 2.15, 3.05);
  Z.T(c, "SSE 接続の維持なし", {x: R.s - 2.15, y: 4.42, w: 2.0, h: 0.3, fontSize: F, color: Z.C.muted, align: "right", valign: "middle"});
  await Z.legend(c, 0.55, 5.1, [["solid", "同期リクエスト"], ["reply", "HTTP 応答"], ["open", "SSE イベント"], ["accent", "応答の返却経路"]], 0, {horizontal: true, colW: 2.05});
  await Z.save(p, process.argv[2] || "02_HTTP+SSEとStreamable HTTPの違い.pptx");
})();
