// 図3 MCP で Claude のプランにつなぐ翻訳アプリの構成 — zukai-diagrams 準拠＋分類の色
const {Z, C, F, lab, node, dframe, lframe, legend} = require("./zk2.js");
const OUT = process.argv[2] || "03_翻訳アプリの構成_MCP.pptx";
const LIGHT = {host: "F1F9F8", mcp: "FEF7F0", file: "F3F7FB", dev: "FAF6F3"};  // 枠の塗り（分類の色を薄めたもの）
(async () => {
  const p = Z.article({title: "翻訳アプリの構成（MCP＋Claudeのプラン）", author: "nico0748"});
  Object.assign(F, {name: 15, duty: 13, lab: 13, sub: 13, frame: 14, head: 15, legend: 13});
  p.defineLayout({name: "FIG3", width: 12.75, height: 11.15}); p.layout = "FIG3";
  const s = Z.canvas(p);
  const arrow = (pts, o = {}) => Z.arrow(s, pts, null, o);

  const CHX = 3.25, CLX = 5.3, ROW = 4.15, APPL = 8.0, TX = 9.1, FX = 11.65, T1 = 4.15, T2 = 5.55, T3 = 6.95, CFX = 4.3;
  const DOWN = CLX - 0.1, UP = CLX + 0.1;  // Claude ⇄ MCP クライアントの縦線
  // ---- 枠 ----
  dframe(s, 1.3, 0.3, 8.6, 1.8, "Anthropic のクラウド");
  dframe(s, 1.3, 2.65, 11.3, 6.0, "ユーザーの PC");
  lframe(s, 2.35, 3.55, 3.9, 1.6, "Claude Desktop", {fill: LIGHT.host, hx: 3.42});
  lframe(s, APPL, 3.55, 2.75, 4.3, "翻訳アプリ（MCP サーバ）", {fill: LIGHT.mcp, hx: APPL});
  lframe(s, 10.9, 3.55, 1.5, 4.3, "ローカルファイル", {fill: LIGHT.file});
  lframe(s, 8.15, 9.5, 4.45, 1.5, "開発者の公開先", {fill: LIGHT.dev});

  // ---- 部品（自作の部品は分類の色＝オレンジで示す） ----
  const usr = await node(s, "user", 0.6, ROW, "ext", "ユーザー", null, {plain: true, w: 1.1});
  const cla = await node(s, "ai", (CHX + CLX) / 2, 1.0, "ant", "Claude", "利用枠で推論", {w: 1.8});
  const quo = await node(s, "quota", 8.6, 1.0, "ant", "利用枠の管理", "プランごとの上限", {w: 1.9});
  const chat = await node(s, "chat", CHX, ROW, "host", "チャット画面", "依頼・結果の表示", {w: 1.7});
  const cli = await node(s, "cable", CLX, ROW, "host", "MCP クライアント", "ツールの呼び出し", {w: 2.2});
  const cfg = await node(s, "settings", CFX, 7.6, "cfg", "claude_desktop_config.json", "MCP サーバの起動設定", {w: 3.3});
  const rd = await node(s, "findpage", TX, T1, "mcp", "read_document", "PDF の段落分け", {w: 2.1});
  const gl = await node(s, "book", TX, T2, "mcp", "get_glossary", "用語集の取得", {w: 2.1});
  const sv = await node(s, "save", TX, T3, "mcp", "save_translation", "訳のファイル保存", {w: 2.1});
  const fp = await node(s, "storage", FX, T1, "file", "papers/", "論文の PDF", {w: 1.6});
  const fg = await node(s, "json", FX, T2, "file", "glossary.json", "用語集", {w: 1.6});
  const ft = await node(s, "storage", FX, T3, "file", "translations/", "訳の保存先", {w: 1.6});
  const npm = await node(s, "pkg", TX, 10.05, "dev", "npm レジストリ", "パッケージの配布", {w: 1.9});
  const gh = await node(s, "code", 11.3, 10.05, "dev", "GitHub リポジトリ", "ソースコード", {w: 2.3});

  // ---- 矢印 ----
  // ① 登録・取得
  arrow([usr.b, [usr.cx, cfg.cy], cfg.l]); lab(s, 1.45, cfg.cy - 0.24, [1], "起動コマンドの登録");
  arrow([npm.t, [TX, 7.85]], {dash: true}); lab(s, TX - 0.1, 8.3, [1], "初回の起動時に取得（npx）", {align: "r"});
  arrow([gh.l, npm.r]); lab(s, (gh.l[0] + npm.r[0]) / 2, 9.83, [], "npm publish", {align: "c"});
  // ② 起動・ツールの一覧
  arrow([[CFX, 5.15], cfg.t]); lab(s, CFX - 0.1, 6.35, [2], "起動時に読み込み", {align: "r"});
  arrow([[UP + 0.1, 5.15], [UP + 0.1, 6.1], [APPL, 6.1]], {dash: true}); lab(s, UP + 0.22, 5.68, [2], "子プロセスで起動\nstdio・JSON-RPC");
  // ③ 依頼・会話・呼び出し指示
  arrow([usr.r, chat.l]); lab(s, 1.42, ROW - 0.26, [3], "依頼");
  arrow([chat.t, [CHX, 1.0], cla.l]); lab(s, CHX - 0.1, 1.38, [3], "会話（HTTPS）\n＋ツールの定義", {align: "r"});
  arrow([cla.rp(0.15), [DOWN, 1.15], [DOWN, cli.t[1]]]); lab(s, DOWN - 0.1, 2.38, [3], "呼び出し指示", {align: "r"});
  // ②④ JSON-RPC の要求と応答
  arrow([cli.rp(-0.12), [APPL, ROW - 0.12]]); lab(s, 6.4, ROW - 0.72, [2], "tools/list"); lab(s, 6.4, ROW - 0.36, [4], "tools/call");
  arrow([[APPL, ROW + 0.12], cli.rp(0.12)]); lab(s, 6.4, ROW + 0.36, [2], "ツールの一覧"); lab(s, 6.4, ROW + 0.72, [4], "ツールの結果");
  // ④〜⑥ ファイル
  arrow([rd.r, fp.l]); lab(s, TX + 0.45, T1 - 0.24, [4], "読み込み");
  arrow([gl.r, fg.l]); lab(s, TX + 0.45, T2 - 0.24, [5], "読み込み");
  arrow([sv.r, ft.l]); lab(s, TX + 0.45, T3 - 0.24, [6], "書き込み");
  // ⑤ ツールの結果・利用枠
  arrow([[UP, cli.t[1]], [UP, 1.0], cla.r]); lab(s, UP + 0.1, 2.38, [5], "ツールの結果");
  arrow([cla.rp(-0.15), quo.lp(-0.15)]); lab(s, 5.7, 0.6, [5], "ユーザーの利用枠を消費");

  // ---- 凡例 ----
  await legend(s, 0.3, 9.15, 3, 2.45, [
    ["cat:host", "Claude Desktop"], ["cat:mcp", "自作の翻訳アプリ"], ["cat:cfg", "設定ファイル"], ["cat:file", "ローカルファイル"],
    ["cat:ant", "Anthropic"], ["cat:dev", "開発者の公開先"], ["solid", "呼び出し・データ"], ["dash", "起動・取得"],
    ["dframe", "PC・クラウドの境界"], ["lframe:EEF1F5", "部品のまとまり"], ["num", "本文の手順の番号"]]);
  await Z.save(p, OUT);
  console.log("saved", OUT);
})();
