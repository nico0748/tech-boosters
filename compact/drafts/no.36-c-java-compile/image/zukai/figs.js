// compact no.36「C言語とJavaのコンパイル方法の違い」の図1〜3（zukai-diagrams 準拠、色の組は no.8 を踏襲）
// 使い方: node figs.js <出力フォルダ>   → 続けて ./render.sh <出力フォルダ> で PNG（2000px）
// 文字は 14pt 以上（名前は 15pt 太字）。記事幅 約800px でも読める大きさにする
const Z = require("./zukai.js");
const path = require("path");
const OUT = process.argv[2] || ".";

// 分類色（この記事の3枚で共通）：teal＝テキスト（ソース・アセンブリ）／violet＝バイトコード／navy＝機械語／slate＝実行する側（JVM・CPU）／gray＝リンクする部品
const K = {
  slate: {c: "2B3A4A", f: "F3F4F6"},
  teal: {c: "1E8A82", f: "E8F5F3"},
  navy: {c: "2E5E8E", f: "EEF3F9"},
  red: {c: "C0392B", f: "FBEEEC"},
  gray: {c: "6B7280", f: "F1F3F4"},
  violet: {c: "6D3FC0", f: "F1ECFB"},
  note: {c: "D4B44A", f: "FFF8E1"},
  panel: {c: "3C4043", f: "F5F6F7"},
};
const MUTED = Z.C.muted, NAME = 15, LH = 0.27;

function art() {
  const p = Z.article({title: "C言語とJavaのコンパイル 図", author: "Nico"});
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
async function clegend(s, items, y, colW = 1.6) {
  const h = 0.42, ww = 0.66 + items.reduce((a, it) => a + (it[2] || colW), 0), x0 = (10 - ww) / 2;
  s.addShape("roundRect", {x: x0, y, w: ww, h, rectRadius: 0.08, fill: {color: "FFFFFF"}, line: {color: Z.C.grid, width: 0.75}});
  Z.T(s, "凡例", {x: x0 + 0.1, y: y + 0.07, w: 0.54, h: 0.28, fontSize: 14, bold: true, color: MUTED, valign: "middle"});
  let sx = x0 + 0.66;
  for (const [kind, text, cw0] of items) {
    const cw = cw0 || colW, yy = y + h / 2;
    if (K[kind]) s.addShape("roundRect", {x: sx, y: yy - 0.1, w: 0.36, h: 0.2, rectRadius: 0.04, fill: {color: K[kind].f}, line: {color: K[kind].c, width: 1.5}});
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
// ---- ここから no.36 の図 ----
const md = require("react-icons/md");
Object.assign(Z.ICON, {src: md.MdDescription, obj: md.MdExtension, exe: md.MdTerminal, lib: md.MdLibraryBooks,
  cpu: md.MdMemory, loader: md.MdInput, verify: md.MdFactCheck, interp: md.MdTranslate, jit: md.MdBolt,
  bytecode: md.MdDataObject, link: md.MdLink, code: md.MdCode, mcode: md.MdDataArray});
const LG = {txt: ["teal", "テキスト", 1.5], bc: ["violet", "バイトコード", 1.95], mc: ["navy", "機械語", 1.3],
  run: ["slate", "実行する側", 1.75], part: ["gray", "リンク対象", 1.6], flow: ["solid", "処理の流れ", 1.75]};
// 2行の矢印ラベル（太字の名前＋灰色の補足）
const lab2 = (a, b) => [{text: a, options: {bold: true}}, {text: "\n" + b, options: {color: MUTED}}];

(async () => {
  // ---------------- 図1：C のビルドの4段階 ----------------
  {
    const p = art(), s = Z.canvas(p);
    const CY = 1.3, X = [0.8, 2.9, 5.0, 7.1, 9.2], W = 1.7;
    cframe(s, 0.12, 0.55, 9.76, 2.95, "ビルド時（gcc ドライバ）", "panel");
    const f = [];
    f.push(await cnode(s, "src", X[0], CY, "hello.c", ["C ソース"], "teal", {w: W}));
    f.push(await cnode(s, "src", X[1], CY, "hello.i", ["前処理済み C"], "teal", {w: W}));
    f.push(await cnode(s, "code", X[2], CY, "hello.s", ["アセンブリ"], "teal", {w: W}));
    f.push(await cnode(s, "obj", X[3], CY, "hello.o", ["printf 未解決"], "navy", {w: W}));
    f.push(await cnode(s, "exe", X[4], CY, "hello", ["実行ファイル"], "navy", {w: W}));
    const st = [["前処理", "cc1"], ["コンパイル", "cc1"], ["アセンブル", "as"], ["リンク", "ld"]];
    st.forEach(([a, b], i) => Z.arrow(s, [f[i].r, f[i + 1].l], lab2(a, b), {w: 1.5, h: 0.58}));
    const lx = (X[3] + X[4]) / 2;
    const part = await cnode(s, "lib", lx, 2.62, "リンク対象", ["Scrt1.o・libc"], "gray", {w: 2.0, size: 0.42});
    Z.arrow(s, [[lx, 2.62 - 0.25], [lx, CY + 0.02]], "部品", {left: true, w: 0.7, dy: 0.42});
    Z.note(s, 0.35, 2.55, 5.9, 0.62, "既定：cc1 による前処理・コンパイルの一括実行\n（hello.i 非保存、取得は gcc -E・-save-temps）");
    // 実行時
    cframe(s, 0.12, 3.95, 9.76, 1.1, "実行時（./hello）", "panel");
    const RY = 4.5;
    const a = await cnode(s, "exe", 0.55, RY, "hello", ["ELF 形式"], "navy", {right: true, w: 1.3});
    const b = await cnode(s, "link", 3.85, RY, "動的リンカ", ["libc.so.6 のロード"], "slate", {right: true, w: 2.1});
    const c = await cnode(s, "cpu", 7.55, RY, "_start → main", ["CPU による実行"], "navy", {right: true, w: 1.95});
    Z.arrow(s, [[2.0, RY], b.l], "execve", {w: 1.2});
    Z.arrow(s, [[6.25, RY], c.l], "制御移譲", {w: 1.6});
    await clegend(s, [["teal", "テキスト", 1.45], ["navy", "機械語", 1.25], LG.part, ["slate", "実行する側", 1.7], ["solid", "処理の流れ", 1.7], ["note", "補足", 1.1]], 5.17);
    await save(p, "01_Cのビルドの4段階");
  }

  // ---------------- 図2：Java のビルドと実行の流れ ----------------
  {
    const p = art(), s = Z.canvas(p);
    const R1 = 1.25, R2 = 3.55;
    cframe(s, 0.12, 0.55, 2.3, 4.45, "ビルド時", "panel");
    cframe(s, 2.82, 0.55, 7.06, 4.45, "実行時（JVM）", "panel");
    const j = await cnode(s, "src", 1.27, R1, "Hello.java", ["Java ソース"], "teal", {w: 2.0});
    const k = await cnode(s, "bytecode", 1.27, R2, "Hello.class", ["バイトコード"], "violet", {w: 2.0});
    Z.arrow(s, [j.b, [1.27, R2 - 0.29]], lab2("javac", "コンパイル"), {w: 1.1, h: 0.58});
    const L = await cnode(s, "loader", 3.9, R1, "クラスローダ", ["クラスの読み込み"], "slate", {w: 2.0});
    const V = await cnode(s, "verify", 6.15, R1, "リンク", ["検証・準備"], "slate", {w: 2.1});
    const I = await cnode(s, "interp", 8.6, R1, "インタプリタ", ["逐次解釈", "初回実行時のシンボル解決"], "slate", {w: 2.5});
    const J = await cnode(s, "jit", 8.6, R2, "JIT コンパイラ", ["C1・C2"], "slate", {w: 2.0});
    const M = await cnode(s, "mcode", 6.15, R2, "機械語", ["CPU による直接実行"], "navy", {w: 2.2});
    Z.arrow(s, [k.r, [2.62, R2], [2.62, R1], L.l], "Hello.class", {seg: 2, w: 1.15, dx: -0.2, dy: -0.04});
    Z.arrow(s, [L.r, V.l], "クラス", {w: 1.0});
    Z.arrow(s, [V.r, I.l], "バイトコード", {w: 1.5});
    Z.arrow(s, [[8.6, I.b[1] + 0.02], J.t], lab2("高頻度の", "メソッド・ループ"), {left: true, w: 2.3, h: 0.58});
    Z.arrow(s, [J.l, M.r], "機械語", {w: 1.2});
    await clegend(s, [LG.txt, LG.bc, LG.run, LG.mc, LG.flow], 5.12);
    await save(p, "02_Javaのビルドと実行の流れ");
  }

  // ---------------- 図3：HotSpot の段階的コンパイル ----------------
  {
    const p = art(), s = Z.canvas(p);
    const Y = 0.35, H = 1.75, CW = 2.3, XS = [0.25, 3.85, 7.45];
    const card = async (x, lv, icon, name, subs, k) => {
      s.addShape("roundRect", {x, y: Y, w: CW, h: H, rectRadius: 0.12, fill: {color: K[k].f}, line: {color: K[k].c, width: 1.5}});
      s.addShape("roundRect", {x: x + 0.15, y: Y + 0.15, w: 1.05, h: 0.32, rectRadius: 0.16, fill: {color: K[k].c}, line: {type: "none"}});
      Z.T(s, lv, {x: x + 0.15, y: Y + 0.15, w: 1.05, h: 0.32, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle"});
      s.addImage({data: await Z.icon(icon, K[k].c), x: x + CW - 0.6, y: Y + 0.1, w: 0.45, h: 0.45});
      const runs = [{text: name, options: {bold: true, fontSize: NAME, color: K[k].c, breakLine: true}}];
      subs.forEach((t, i) => runs.push({text: t, options: {color: MUTED, breakLine: i < subs.length - 1}}));
      Z.T(s, runs, {x: x + 0.15, y: Y + 0.65, w: CW - 0.3, h: 0.95, fontSize: 14, valign: "top"});
      return {l: [x, Y + H / 2], r: [x + CW, Y + H / 2]};
    };
    const c0 = await card(XS[0], "レベル 0", "interp", "インタプリタ", ["呼び出し回数の計測", "バイトコードの逐次解釈"], "slate");
    const c3 = await card(XS[1], "レベル 3", "jit", "C1 コンパイラ", ["高速なコンパイル", "プロファイル収集"], "slate");
    const c4 = await card(XS[2], "レベル 4", "jit", "C2 コンパイラ", ["強い最適化", "プロファイル活用"], "slate");
    Z.arrow(s, [c0.r, c3.l], lab2("200 回〜", "呼び出し"), {w: 1.3, h: 0.58});
    Z.arrow(s, [c3.r, c4.l], lab2("5,000 回〜", "呼び出し"), {w: 1.3, h: 0.58});
    // 下：実測（本文の Hot.java・2億回のベンチマーク）
    const MX = XS.map((x) => x + CW / 2);
    const row = (y, name, cells) => {
      s.addShape("line", {x: 0.25, y: y - 0.32, w: 9.5, h: 0, line: {color: Z.C.grid, width: 1}});
      Z.T(s, name, {x: 0.25, y: y - 0.26, w: 9.5, h: 0.3, fontSize: 14, bold: true, color: MUTED});
      cells.forEach(([i, t, w]) => Z.T(s, t, {x: MX[i] - (w || CW) / 2, y: y + 0.08, w: w || CW, h: 0.34, fontSize: NAME, bold: true, color: Z.C.title, align: "center", valign: "middle"}));
    };
    row(2.85, "実測：Hot::square の切替時刻（起動から）", [[0, "36 ms 以前"], [1, "36 ms"], [2, "37 ms"]]);
    Z.note(s, 0.25, 3.75, 9.5, 0.42, "回数：Java 21 の既定値の目安（5,000 回はレベル3のコードでの計数）");
    await clegend(s, [LG.run, LG.flow, ["note", "補足", 1.2]], 4.5);
    await save(p, "03_HotSpotの段階的コンパイル");
  }
})();
