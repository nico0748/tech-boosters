// compact no.35「JavaはなぜOSに依存せずに動作させることができるのか」の図1・図2（zukai-diagrams 準拠）
// 使い方: node figs.js <出力フォルダ>   → 続けて bash render.sh <出力フォルダ> で PNG（2000px）
// 文字は 14pt 以上（名前は 15pt 太字）。記事幅 約800px でも読める大きさにする
const Z = require("./zukai.js");
const path = require("path"), JSZip = require("jszip"), fs = require("fs");
const OUT = process.argv[2] || ".";

// 分類色（この記事）：navy＝どのOSでも同じもの／amber＝OS・CPUごとに別のもの／slate＝OS・CPU／pink＝配布するもの
const K = {
  navy: {c: "2E5E8E", f: "EEF3F9"},
  amber: {c: "B45309", f: "FDF3E7"},
  slate: {c: "2B3A4A", f: "F3F4F6"},
  panel: {c: "3C4043", f: "F7F8F9"},
};
const PINK = Z.C.pink, MUTED = "4B5563", NAME = 15;

function art(title) {
  const p = Z.article({title, author: "Nico"});
  Object.assign(Z.FS, {label: 14, sub: 14, arrow: 14, box: 14});
  return p;
}
// 名前（太字）＋補足行のボックス。返り値は矢印の端点
function cbox(s, x, y, w, h, name, sub, k, o = {}) {
  const runs = [{text: name, options: {bold: true, fontSize: o.fs || NAME, color: K[k].c, breakLine: !!sub, fontFace: o.mono ? "Menlo" : undefined}}];
  if (sub) runs.push({text: sub, options: {color: MUTED, fontSize: 14}});
  s.addText(runs, {shape: "roundRect", rectRadius: 0.08, x, y, w, h, fill: {color: o.fill || "FFFFFF"},
    line: {color: K[k].c, width: o.lw || 1.5, dashType: o.dash ? "dash" : "solid"},
    fontFace: Z.FONT.en, align: "center", valign: "middle", margin: 0.03});
  return {l: [x, y + h / 2], r: [x + w, y + h / 2], t: [x + w / 2, y], b: [x + w / 2, y + h], cx: x + w / 2};
}
// 分類色の枠（淡い地＋左上に見出し）
function cframe(s, x, y, w, h, heading, k, o = {}) {
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.12, fill: {color: K[k].f},
    line: o.dash ? {color: K[k].c, width: 1.25, dashType: "dash"} : {type: "none"}});
  if (heading) Z.T(s, heading, {x: x + 0.14, y: y + 0.07, w: w - 0.28, h: 0.3, fontSize: NAME, bold: true, color: K[k].c, valign: "middle"});
}
// ピンクのピル（「配布するもの」）
function pill(s, cx, y, text, w = 1.15) {
  s.addText(text, {shape: "roundRect", rectRadius: 0.14, x: cx - w / 2, y, w, h: 0.28, fill: {color: PINK}, line: {type: "none"},
    fontFace: Z.FONT.en, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0});
}
// 凡例（下端に横1列）。items: [種類, 文字, 幅]。種類＝分類色のキー or "pill" or "solid"
async function clegend(s, items, y, colW = 1.8) {
  const h = 0.42, ww = 0.66 + items.reduce((a, it) => a + (it[2] || colW), 0), x0 = (10 - ww) / 2;
  s.addShape("roundRect", {x: x0, y, w: ww, h, rectRadius: 0.08, fill: {color: "FFFFFF"}, line: {color: Z.C.grid, width: 0.75}});
  Z.T(s, "凡例", {x: x0 + 0.1, y: y + 0.07, w: 0.54, h: 0.28, fontSize: 14, bold: true, color: MUTED, valign: "middle"});
  let sx = x0 + 0.66;
  for (const [kind, text, cw0] of items) {
    const cw = cw0 || colW, yy = y + h / 2;
    if (K[kind]) s.addShape("roundRect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, rectRadius: 0.04, fill: {color: K[kind].f}, line: {color: K[kind].c, width: 1.5}});
    else if (kind === "pill") s.addShape("roundRect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, rectRadius: 0.1, fill: {color: PINK}, line: {type: "none"}});
    else Z.arrow(s, [[sx, yy], [sx + 0.4, yy]], null, {width: 1.5});
    Z.T(s, text, {x: sx + 0.46, y: yy - 0.14, w: cw - 0.48, h: 0.28, fontSize: 14, valign: "middle"});
    sx += cw;
  }
}
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
const A = (s, pts, label, o = {}) => Z.arrow(s, pts, label, {width: 1.5, ...o});

// ---- 図1：C言語とJavaでOSごとに用意するもの ----
async function fig1() {
  const p = art("C言語とJavaでOSごとに用意するもの"), s = Z.canvas(p);
  const PW = 4.75, PX = [0.15, 5.1], Y0 = 0.15, PH = 4.45;
  const OS = [["Windows", "x64"], ["macOS", "AArch64"], ["Linux", "x64"]];
  const bw = 1.4, gap = 0.1, row = {src: 0.62, mid: 1.72, per: 2.92, os: 3.74};
  const colX = (px, i) => px + 0.15 + i * (bw + gap) + (PW - 0.3 - 3 * bw - 2 * gap) / 2;
  for (const [pi, title] of [[0, "C言語"], [1, "Java"]]) cframe(s, PX[pi], Y0, PW, PH, title, "panel");
  // 配布するものの枠（ピンクの破線）＋ピル
  const dist = (x, y, w, h, pcx, py) => {
    s.addShape("roundRect", {x, y, w, h, rectRadius: 0.1, fill: {type: "none"}, line: {color: PINK, width: 1.75, dashType: "dash"}});
    pill(s, pcx, py, "配布するもの", 1.3);
  };
  // C言語
  {
    const px = PX[0], cx = px + PW / 2;
    const src = cbox(s, cx - 0.8, row.src, 1.6, 0.5, "main.c", null, "navy");
    const ex = [["main.exe", "PE 形式"], ["main", "Mach-O 形式"], ["main", "ELF 形式"]];
    const fanY = row.mid + 0.2;
    for (let i = 0; i < 3; i++) {
      const x = colX(px, i);
      const b = cbox(s, x, row.per, bw, 0.62, ex[i][0], ex[i][1], "amber");
      const o = cbox(s, x, row.os, bw, 0.68, OS[i][0], OS[i][1], "slate", {fill: K.slate.f});
      A(s, [src.b, [src.cx, fanY], [b.cx, fanY], b.t], null);
    }
    Z.T(s, [{text: "gcc で OS ごとに", options: {breakLine: true}}, {text: "コンパイル"}], {x: src.cx + 0.12, y: src.b[1] + 0.0, w: 2.0, h: 0.55, fontSize: 14, color: Z.C.arrow, valign: "middle"});
    const c0 = colX(px, 0), c1 = colX(px, 1);
    dist(c0 - 0.08, row.per - 0.08, 3 * bw + 2 * gap + 0.16, 0.78, (c0 + bw / 2 + c1 + bw / 2) / 2, row.per - 0.52);
  }
  // Java
  {
    const px = PX[1], cx = px + PW / 2;
    const src = cbox(s, cx - 0.8, row.src, 1.6, 0.5, "Main.java", null, "navy");
    const cls = cbox(s, cx - 0.8, row.mid, 1.6, 0.5, "Main.class", null, "navy");
    A(s, [src.b, cls.t], "javac で1回だけ", {w: 2.0});
    dist(cls.l[0] - 0.08, row.mid - 0.08, 1.76, 0.66, cls.l[0] - 0.85, row.mid + 0.11);
    const fanY = row.per - 0.22;
    Z.T(s, "そのまま実行", {x: cls.cx + 0.12, y: row.mid + 0.6, w: 1.6, h: 0.3, fontSize: 14, color: Z.C.arrow, valign: "middle"});
    for (let i = 0; i < 3; i++) {
      const x = colX(px, i);
      const b = cbox(s, x, row.per, bw, 0.62, "JVM", OS[i][0] + " 用", "amber");
      const o = cbox(s, x, row.os, bw, 0.68, OS[i][0], OS[i][1], "slate", {fill: K.slate.f});
      A(s, [[cls.cx, cls.b[1] + 0.08], [cls.cx, fanY], [b.cx, fanY], b.t], null);
    }
  }
  await clegend(s, [["navy", "どの OS でも同じ", 2.15], ["amber", "OS・CPU ごとに別物", 2.4], ["slate", "OS・CPU", 1.5], ["pill", "配布するもの", 1.8]], 4.8);
  await save(p, "01_C言語とJavaでOSごとに用意するもの");
}

// ---- 図2：JVMがOSの違いを吸収するしくみ ----
async function fig2() {
  const p = art("JVMがOSの違いを吸収するしくみ"), s = Z.canvas(p);
  const L1 = {y: 0.1, h: 1.25}, L2 = {y: 2.0, h: 1.58}, L3 = {y: 3.98, h: 1.0};
  cframe(s, 0.15, L1.y, 9.7, L1.h, "Java のコード（どの OS でも同じ）", "navy");
  cframe(s, 0.15, L2.y, 9.7, L2.h, null, "amber", {dash: true});
  // 見出しは ① の矢印（x≈1.1）を避けて、その右から置く
  Z.T(s, "JVM・ネイティブ実装（OS・CPU ごとに別物）", {x: 1.35, y: L2.y + 0.07, w: 5.0, h: 0.3, fontSize: NAME, bold: true, color: K.amber.c, valign: "middle"});
  cframe(s, 0.15, L3.y, 9.7, L3.h, "OS・CPU", "slate");
  const bw = 1.38, g = 0.24, x0 = 0.4, by2 = L2.y + 0.5;
  const cls = cbox(s, x0, L1.y + 0.48, bw, 0.6, "Main.class", null, "navy");
  const lib = cbox(s, 6.75, L1.y + 0.45, 2.9, 0.68, "FileInputStream", "標準ライブラリ（java.base）", "navy");
  const names = [["クラスローダ"], ["検証器"], ["インタプリタ"], ["JIT コンパイラ", "C1・C2"]];
  const bx = names.map((n, i) => cbox(s, x0 + i * (bw + g), by2, bw, 0.68, n[0], n[1] || null, "amber", {fs: 14}));
  const n1 = cbox(s, 6.75, by2, 1.4, 0.68, "io_util_md.c", "Unix 向け", "amber", {fs: 14});
  const n2 = cbox(s, 8.25, by2, 1.4, 0.68, "io_util_md.c", "Windows 向け", "amber", {fs: 14});
  const lab = (cx, y, t, w) => Z.T(s, t, {x: cx - w / 2, y, w, h: 0.3, fontSize: 14, color: Z.C.arrow, align: "center", valign: "middle"});
  lab(bx[1].cx, bx[1].b[1] + 0.05, "② 検証", 1.3);
  lab(bx[2].cx, bx[2].b[1] + 0.05, "③ 解釈実行", 1.3);
  lab(bx[3].cx, bx[3].b[1] + 0.05, "④ コンパイル", 1.3);
  // 3段目
  const mid = (bx[2].cx + bx[3].cx) / 2;
  const cpu = cbox(s, mid - 1.5, L3.y + 0.3, 3.0, 0.55, "CPU（x64・AArch64）", null, "slate", {fs: 14});
  const r1 = cbox(s, 6.75, L3.y + 0.22, 1.4, 0.68, "read", "システムコール", "slate", {fs: 14});
  const r2 = cbox(s, 8.25, L3.y + 0.22, 1.4, 0.68, "ReadFile", "Win32 API", "slate", {fs: 14});
  // 矢印
  A(s, [cls.b, bx[0].t], null);
  const gapY = (L1.y + L1.h + L2.y) / 2 - 0.15;
  Z.T(s, "① 読み込み", {x: cls.cx + 0.12, y: gapY, w: 1.6, h: 0.3, fontSize: 14, color: Z.C.arrow, valign: "middle"});
  for (let i = 0; i < 3; i++) A(s, [bx[i].r, bx[i + 1].l], null);
  A(s, [[mid, L2.y + L2.h], [mid, cpu.t[1]]], null);
  Z.T(s, "機械語で実行", {x: mid + 0.12, y: (L2.y + L2.h + L3.y) / 2 - 0.15, w: 1.6, h: 0.3, fontSize: 14, color: Z.C.arrow, valign: "middle"});
  const fanY = L2.y + 0.3;
  A(s, [lib.b, [lib.cx, fanY], [n1.cx, fanY], n1.t], null);
  A(s, [lib.b, [lib.cx, fanY], [n2.cx, fanY], n2.t], null);
  Z.T(s, [{text: "native メソッド呼び出し", options: {breakLine: true}}, {text: "（OS ごとにどちらか一方）"}], {x: lib.cx - 3.2, y: gapY - 0.12, w: 3.08, h: 0.55, fontSize: 14, color: Z.C.arrow, align: "right", valign: "middle"});
  A(s, [n1.b, r1.t], null);
  A(s, [n2.b, r2.t], null);
  await clegend(s, [["navy", "どの OS でも同じ", 2.15], ["amber", "OS・CPU ごとに別物", 2.4], ["slate", "OS・CPU", 1.5]], 5.15);
  await save(p, "02_JVMがOSの違いを吸収するしくみ");
}

(async () => { await fig1(); await fig2(); })();
