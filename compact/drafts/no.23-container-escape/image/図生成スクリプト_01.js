const Z = require("./zukai.js");
const {C} = Z;
(async () => {
  const p = Z.article({title: "コンテナの隔離とホストカーネルの共有"});
  Z.FS.sub = 12.5; Z.FS.arrow = 12;
  const s = Z.canvas(p);

  // 凡例（上部・横並び）
  {
    const lx = 0.45, ly = 0.1, lw = 9.15, lh = 0.52, cy = ly + lh / 2;
    s.addShape("roundRect", {x: lx, y: ly, w: lw, h: lh, rectRadius: 0.08, fill: {color: C.white}, line: {color: C.grid, width: 0.75}});
    Z.T(s, "凡例", {x: lx + 0.14, y: ly, w: 0.6, h: lh, fontSize: 12, bold: true, color: C.muted, valign: "middle"});
    let ix = 1.2;
    s.addShape("roundRect", {x: ix, y: cy - 0.1, w: 0.34, h: 0.2, rectRadius: 0.04, fill: {color: C.frame}, line: {type: "none"}});
    Z.T(s, "隔離の単位", {x: ix + 0.42, y: cy - 0.15, w: 1.5, h: 0.3, fontSize: 12, valign: "middle"});
    ix = 3.25; Z.arrow(s, [[ix, cy], [ix + 0.5, cy]], null, {});
    Z.T(s, "処理の流れ", {x: ix + 0.6, y: cy - 0.15, w: 1.4, h: 0.3, fontSize: 12, valign: "middle"});
    ix = 5.35; Z.arrow(s, [[ix, cy], [ix + 0.5, cy]], null, {dash: true, open: true, color: C.gray});
    Z.T(s, "生成・隔離設定", {x: ix + 0.6, y: cy - 0.15, w: 1.7, h: 0.3, fontSize: 12, valign: "middle"});
    ix = 7.75;
    s.addShape("roundRect", {x: ix, y: cy - 0.1, w: 0.34, h: 0.2, rectRadius: 0.04, fill: {color: "FDE7EC"}, line: {color: C.err, width: 1}});
    Z.T(s, "共有カーネル＝境界", {x: ix + 0.42, y: cy - 0.15, w: 1.85, h: 0.3, fontSize: 12, valign: "middle"});
  }

  // ランタイム（制御プレーン・中立グレー）
  const rt = {x: 0.45, y: 1.55, w: 1.45, h: 1.2};
  s.addShape("roundRect", {x: rt.x, y: rt.y, w: rt.w, h: rt.h, rectRadius: 0.1, fill: {color: C.grayFill}, line: {color: C.muted, width: 1.25}});
  Z.T(s, [{text: "コンテナランタイム", options: {bold: true, color: C.muted, breakLine: true}}, {text: "runc / containerd", options: {fontSize: 12, color: C.muted}}],
    {x: rt.x + 0.06, y: rt.y + 0.12, w: rt.w - 0.12, h: rt.h - 0.2, fontSize: 12.5, align: "center"});

  // コンテナ3つ
  const cw = 2.433, ch = 1.95, cy0 = 1.1;
  const xs = [2.15, 4.683, 7.216]; const cx = xs.map(x => x + cw / 2);
  const titles = ["コンテナ A（Webアプリ）", "コンテナ B（APIサーバ）", "コンテナ C（バッチ処理）"];
  const items = [["namespaces", "PID・NET等の分離"], ["cgroups", "CPU・メモリの制限"], ["capabilities", "root権限の細分化"]];
  for (let i = 0; i < 3; i++) {
    const x = xs[i];
    s.addShape("roundRect", {x, y: cy0, w: cw, h: ch, rectRadius: 0.1, fill: {color: C.white}, line: {color: C.icon, width: 1.5}});
    Z.T(s, titles[i], {x, y: cy0 + 0.08, w: cw, h: 0.3, fontSize: 13, bold: true, color: C.title, align: "center"});
    for (let j = 0; j < 3; j++) {
      const iy = cy0 + 0.42 + j * 0.5;
      s.addShape("roundRect", {x: x + 0.12, y: iy, w: cw - 0.24, h: 0.46, rectRadius: 0.05, fill: {color: "F4F8FE"}, line: {color: C.frameLine, width: 0.75}});
      Z.T(s, [{text: items[j][0], options: {bold: true, color: C.label, breakLine: true}}, {text: items[j][1], options: {color: C.muted}}],
        {x: x + 0.16, y: iy, w: cw - 0.3, h: 0.46, fontSize: 13, align: "center", valign: "middle"});
    }
  }

  // ランタイム → 全コンテナ（制御, 破線バス。意味は凡例「生成・隔離設定」）
  const busY = 0.86, vx = rt.x + rt.w / 2;
  Z.arrow(s, [[vx, rt.y], [vx, busY]], null, {head: "none", dash: true, color: C.gray});
  Z.arrow(s, [[vx, busY], [cx[2], busY]], null, {head: "none", dash: true, color: C.gray});
  for (let i = 0; i < 3; i++) Z.arrow(s, [[cx[i], busY], [cx[i], cy0]], null, {dash: true, open: true, color: C.gray});

  // 共有カーネル帯（全幅・赤）
  const ky = 4.3, kh = 0.82;
  s.addShape("roundRect", {x: 0.45, y: ky, w: 9.15, h: kh, rectRadius: 0.12, fill: {color: "FDE7EC"}, line: {color: C.err, width: 1.25}});
  Z.T(s, [{text: "ホストカーネル（全コンテナで共有）", options: {bold: true, color: C.err, breakLine: true}}, {text: "namespaces / cgroups / capabilities の提供元", options: {fontSize: 12.5, color: C.muted}}],
    {x: 0.6, y: ky + 0.08, w: 8.9, h: kh - 0.14, fontSize: 13, align: "center", valign: "middle"});

  // システムコール（3コンテナ→1点→カーネル直行）
  const fy = 3.68, fcx = cx[1];
  for (let i = 0; i < 3; i++) Z.arrow(s, [[cx[i], cy0 + ch], [fcx, fy]], null, {head: "none", color: C.arrow, width: 1});
  Z.arrow(s, [[fcx, fy], [fcx, ky]], "システムコール", {width: 1.75, fill: true, w: 2.0});

  // 対比ノート（短文・体言止め）
  Z.note(s, 0.45, 5.25, 9.15, 0.32, [{text: "対比：", options: {bold: true}}, {text: "VM＝ゲストごとに別カーネル＋ハイパーバイザ／コンテナ＝単一カーネルを共有（境界突破は全体へ波及）", options: {}}]);

  await Z.save(p, "fig1.pptx");
  console.log("fig1 done");
})();
