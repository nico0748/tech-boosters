// 図2 従量課金の API で動かす翻訳アプリの構成（AWS の例）— zukai-diagrams 準拠＋分類の色
const {Z, C, F, SUB, lab, node, dframe, subnet, lframe, legend, note} = require("./zk2.js");
const OUT = process.argv[2] || "02_翻訳アプリの構成_従量課金API.pptx";
(async () => {
  const p = Z.article({title: "翻訳アプリの構成（従量課金の API）", author: "nico0748"});
  Object.assign(F, {name: 14, duty: 13, lab: 13, sub: 13, frame: 14, head: 15, legend: 13});
  p.defineLayout({name: "FIG2", width: 11.8, height: 13.15}); p.layout = "FIG2";
  const s = Z.canvas(p);
  const arrow = (pts, o = {}) => Z.arrow(s, pts, null, o);

  // ---- 座標（AZ a を代表に矢印を描く） ----
  const TOP = 0.85, XC = 7.0, AX = 5.0, BX = 9.0, DBX = 5.9, DBS = 8.75, VY = 2.45;
  const R_NAT = 3.9, R_WK = 6.15, R_API = 7.9, R_DB = 9.6;
  const MX = 1.35, M_COG = 3.5, M_S3 = 4.82, M_SEC = R_WK, M_SQS = R_API, VX = 3.95, CX = 2.95;

  // ---- 枠 ----
  dframe(s, 0.35, 1.85, 10.7, 9.1, "AWS 東京リージョン");
  lframe(s, 0.45, 3.05, 2.4, 5.87, "VPC 外のサービス", {align: "l"});
  dframe(s, 3.05, VY, 7.8, 8.37, "VPC", C.title, 1.75);
  for (const [ax, aw, name, dbAlign] of [[3.25, 3.6, "AZ 1a", "l"], [7.15, 3.4, "AZ 1c", "r"]]) {
    dframe(s, ax, 2.9, aw, 7.8, name);
    subnet(s, ax + 0.15, 3.3, aw - 0.3, 1.52, "pub");
    subnet(s, ax + 0.15, 4.97, aw - 0.3, 3.88, "priv", "r");
    subnet(s, ax + 0.15, 8.97, aw - 0.3, 1.63, "priv", dbAlign);
  }

  // ---- 部品 ----
  const usr = await node(s, "user", 2.7, TOP, "ext", "ユーザー", "ブラウザ", {plain: true, w: 1.3});
  const r53 = await node(s, "dns", 0.8, TOP, "net", "Route 53", "名前解決（DNS）", {w: 1.6});
  const cf = await node(s, "cdn", 4.6, TOP, "net", "CloudFront", "配信（CDN）", {w: 1.6});
  const pay = await node(s, "payment", 8.7, TOP, "ext", "決済サービス", "月額料金の請求", {w: 1.6});
  const cla = await node(s, "ai", 10.5, TOP, "ext", "Claude API", "LLM 推論（従量課金）", {w: 2.1});
  // ③ 原文：CloudFront → (IGW を通過) → ALB。IGW のタイルの下を通すため、IGW より先に描く
  arrow([cf.r, [XC, TOP], [XC, R_NAT - 0.33]]);
  s.addShape("rect", {x: 6.55, y: VY - 0.07, w: 0.15, h: 0.14, fill: {color: C.white}, line: {type: "none"}});  // IGW の名前と枠線の隙間
  const igw = await node(s, "igw", XC, VY, "net", "インターネット\nゲートウェイ", "VPC の出入口", {pos: "left", w: 1.6, fill: true});
  const alb = await node(s, "lb", XC, R_NAT, "net", "ALB", "負荷分散", {pos: "left", w: 1.0});
  const natA = await node(s, "nat", AX, R_NAT, "net", "NAT ゲートウェイ", "送信元 IP の変換", {});
  await node(s, "nat", BX, R_NAT, "net", "NAT ゲートウェイ", "送信元 IP の変換", {});
  const wkA = await node(s, "translate", AX, R_WK, "cmp", "翻訳ワーカー", "ジョブ処理（ECS）", {w: 2.0});
  await node(s, "translate", BX, R_WK, "cmp", "翻訳ワーカー", "ジョブ処理（ECS）", {w: 2.0});
  const apiA = await node(s, "api", AX, R_API, "cmp", "API サーバ", "受付（ECS）", {w: 1.5});
  const apiB = await node(s, "api", BX, R_API, "cmp", "API サーバ", "受付（ECS）", {w: 1.5});
  const rdsP = await node(s, "db", DBX, R_DB, "db", "RDS プライマリ", "会員・利用量", {w: 1.85});
  const rdsS = await node(s, "db", DBS, R_DB, "db", "RDS スタンバイ", "フェイルオーバー先", {w: 1.85});
  const cog = await node(s, "badgeid", MX, M_COG, "sec", "Cognito", "ログイン・会員管理", {});
  const s3 = await node(s, "storage", MX, M_S3, "sto", "S3", "画面・訳の保存", {});
  const sec = await node(s, "key", MX, M_SEC, "sec", "Secrets Manager", "API キーの保管", {});
  const sqs = await node(s, "queue", MX, M_SQS, "msg", "SQS", "翻訳ジョブのキュー", {});

  // ---- 矢印 ----
  // ① 名前解決・画面
  arrow([usr.l, r53.r]); lab(s, (usr.l[0] + r53.r[0]) / 2, TOP - 0.22, [1], "名前解決", {align: "c"});
  arrow([usr.r, cf.l]); lab(s, (usr.r[0] + cf.l[0]) / 2, TOP - 0.22, [1], "画面", {align: "c"}); lab(s, (usr.r[0] + cf.l[0]) / 2, TOP + 0.22, [3], "原文", {align: "c"});
  arrow([[cf.cx, 1.74], [cf.cx, 1.96], [CX, 1.96], [CX, M_S3 - 0.12], [s3.r[0], M_S3 - 0.12]]);
  lab(s, 3.1, 2.21, [1], "画面の取得");
  // ② ログイン
  arrow([[usr.cx, 1.74], [usr.cx, M_COG], cog.r]); lab(s, 2.6, 2.45, [2], "ログイン", {align: "r"});
  // ③ 原文 → ALB → API サーバ → RDS・SQS
  lab(s, 5.1, TOP - 0.22, [3], "原文");
  arrow([[XC, R_NAT + 0.33], [XC, R_API], apiA.r]); arrow([[XC, R_NAT + 0.33], [XC, R_API], apiB.l]);
  lab(s, XC + 0.22, 5.35, [3], "リクエストの\n振り分け");
  arrow([[AX, apiA.b[1]], [AX, R_DB], rdsP.l]); lab(s, AX - 0.1, 9.55, [3], "残量の確認", {align: "r"});
  arrow([[apiA.l[0], R_API + 0.12], [sqs.r[0], R_API + 0.12]], {dash: true}); lab(s, 1.73, R_API + 0.34, [3], "ジョブ");
  // ④ ジョブ → キー → Claude API
  arrow([[sqs.r[0], M_SQS - 0.12], [VX, M_SQS - 0.12], [VX, R_WK + 0.18], wkA.lp(0.18)], {dash: true}); lab(s, 1.73, M_SQS - 0.38, [4], "ジョブ");
  arrow([wkA.l, sec.r]); lab(s, 1.73, R_WK - 0.22, [4], "API キー");
  arrow([wkA.t, [AX, natA.b[1]]]); lab(s, AX + 0.1, 5.5, [4], "翻訳の依頼");
  arrow([[AX + 0.25, R_NAT - 0.33], [6.85, 2.78]]); lab(s, 5.9, 3.13, [4], "翻訳の依頼", {align: "r"});
  arrow([[igw.r[0], 2.35], [cla.cx, 2.35], [cla.cx, cla.b[1] + 0.02]]); lab(s, 7.6, 2.1, [4], "原文＋プロンプト");
  // ⑤ 訳・利用量
  arrow([wkA.lp(-0.18), [VX, R_WK - 0.18], [VX, M_S3 + 0.12], [s3.r[0], M_S3 + 0.12]]); lab(s, 1.73, M_S3 + 0.34, [5], "訳の保存");
  arrow([wkA.r, [DBX, R_WK], [DBX, rdsP.t[1]]]); lab(s, DBX - 0.1, 7.28, [5], "利用量の記録", {align: "r"});
  arrow([rdsP.r, rdsS.l]); lab(s, 7.35, R_DB - 0.22, [], "同期で複製");
  // ⑥ 支払い
  arrow([usr.t, [usr.cx, 0.2], [pay.cx, 0.2], pay.t]); lab(s, 8.3, 0.46, [6], "月額料金の支払い", {align: "r"});

  // ---- 注記・凡例 ----
  note(s, 0.45, 9.2, 2.4, 0.95, "AZ 1c も同じ通信\n1c から出る矢印は省略");
  await legend(s, 0.35, 11.15, 4, 2.75, [
    ["cat:net", "ネットワーク・配信"], ["cat:cmp", "コンピュート"], ["cat:db", "データベース"], ["cat:sto", "オブジェクトストレージ"],
    ["cat:sec", "認証・秘密情報"], ["cat:msg", "キュー"], ["cat:ext", "外部サービス"], ["num", "本文の手順の番号"],
    ["solid", "呼び出し・データ"], ["dash", "非同期（ジョブ）"], ["dframe", "リージョン・AZ"], ["vpc", "VPC"],
    ["pub", "パブリックサブネット"], ["priv", "プライベートサブネット"], ["lframe", "論理的なまとまり"]]);
  await Z.save(p, OUT);
  console.log("saved", OUT);
})();
