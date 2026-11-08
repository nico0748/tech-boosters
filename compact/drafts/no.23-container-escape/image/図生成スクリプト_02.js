const Z = require("./zukai.js");
const {C} = Z;
(async () => {
  const p = Z.article({title: "コンテナエスケープの主な経路と防御"});
  Z.FS.sub = 12; Z.FS.arrow = 12;
  const s = Z.canvas(p);

  // 凡例（上部・横並び）
  {
    const lx = 0.45, ly = 0.1, lw = 6.7, lh = 0.6, cy = ly + lh / 2;
    s.addShape("roundRect", {x: lx, y: ly, w: lw, h: lh, rectRadius: 0.08, fill: {color: C.white}, line: {color: C.grid, width: 0.75}});
    Z.T(s, "凡例", {x: lx + 0.14, y: ly, w: 0.6, h: lh, fontSize: 12, bold: true, color: C.muted, valign: "middle"});
    let ix = 1.2; Z.arrow(s, [[ix, cy], [ix + 0.5, cy]], null, {color: C.err, width: 1.75});
    Z.T(s, "エスケープ経路", {x: ix + 0.6, y: cy - 0.15, w: 1.8, h: 0.3, fontSize: 12, valign: "middle"});
    ix = 3.6; Z.badge(s, ix + 0.13, cy, 1, C.err);
    Z.T(s, "経路番号", {x: ix + 0.42, y: cy - 0.15, w: 1.3, h: 0.3, fontSize: 12, valign: "middle"});
    ix = 5.3; Z.arrow(s, [[ix, cy], [ix + 0.5, cy]], null, {head: "none", dash: true, color: C.title});
    Z.T(s, "隔離境界", {x: ix + 0.6, y: cy - 0.15, w: 1.3, h: 0.3, fontSize: 12, valign: "middle"});
  }

  // 左：コンテナ内
  Z.frame(s, 0.45, 1.65, 2.7, 3.15, "コンテナ内", {dashed: true, line: C.icon});
  await Z.node(s, "user", 1.8, 2.7, "侵入済みプロセス", "任意コード実行", {kind: "user"});
  // 右：ホスト
  Z.frame(s, 6.85, 1.65, 2.7, 3.15, "ホスト", {dashed: true, line: C.muted});
  await Z.node(s, "server", 8.2, 2.7, "ホストOS", "root権限・全体の掌握", {kind: "legacy"});

  // 中央：隔離境界（ネイビー＝構造、赤と区別）
  const bx = 5.0;
  s.addShape("line", {x: bx, y: 1.95, w: 0, h: 2.85, line: {color: C.title, width: 1.75, dashType: "dash"}});
  s.addShape("roundRect", {x: bx - 1.12, y: 1.5, w: 2.24, h: 0.38, rectRadius: 0.08, fill: {color: C.frame}, line: {color: C.title, width: 1}});
  Z.T(s, "隔離境界（共有カーネル）", {x: bx - 1.12, y: 1.5, w: 2.24, h: 0.38, fontSize: 12, bold: true, color: C.title, align: "center", valign: "middle"});

  // 経路3本（赤＝攻撃経路）
  const routes = [["特権 / 危険な capability", "--privileged ・ CAP_SYS_ADMIN"], ["docker.sock のマウント", "Docker API 経由のホスト操作"], ["ランタイム / カーネルの脆弱性", "runc CVE-2019-5736 ほか"]];
  const ys = [2.55, 3.35, 4.15];
  for (let i = 0; i < 3; i++) {
    const y = ys[i];
    Z.arrow(s, [[3.3, y], [6.85, y]], [{text: routes[i][0] + "\n", options: {bold: true, color: C.err}}, {text: routes[i][1], options: {fontSize: 12, color: C.muted}}],
      {color: C.err, width: 1.75, w: 3.4, h: 0.52, fill: true});
    Z.badge(s, 3.46, y, i + 1, C.err);
  }

  // 防御帯（下・緑・2行、すべて体言止め）
  const dy = 5.0;
  s.addShape("roundRect", {x: 0.45, y: dy, w: 9.1, h: 0.55, rectRadius: 0.1, fill: {color: "E6F4EA"}, line: {type: "none"}});
  Z.T(s, [
    {text: "防御：", options: {bold: true, color: "137333"}},
    {text: "非root実行 ／ --cap-drop ALL ／ seccomp・AppArmor", options: {color: C.title, breakLine: true}},
    {text: "rootless ／ docker.sock の非共有 ／ ランタイム・カーネルの更新", options: {color: C.title}}
  ], {x: 0.6, y: dy, w: 8.9, h: 0.55, fontSize: 12, align: "center", valign: "middle"});

  await Z.save(p, "fig2.pptx");
  console.log("fig2 done");
})();
