// compact no.16 プログラミング言語の分け方：図1・図2 生成スクリプト（pptxgenjs）
// 実行: node fig.js <出力ディレクトリ>
const pptxgen = require("pptxgenjs"), JSZip = require("jszip"), fs = require("fs"), path = require("path");
const React = require("react"), RDS = require("react-dom/server"), sharp = require("sharp");
const tb = require("react-icons/tb"), si = require("react-icons/si");

const OUT = process.argv[2] || ".";
const FONT = {ja: "Hiragino Sans", en: "Gibson", mono: "Menlo"};
const C = {text: "1F2937", muted: "5F6368", arrow: "555555", line: "C8CCD2", white: "FFFFFF", gray: "9AA0A6", grayBg: "F1F3F4"};
// レーンのアクセント色（お手本の配色例）
const L = {
  aot: {c: "2F6FDB", bg: "EEF4FD"},  // 事前コンパイル＝青
  itp: {c: "138A7E", bg: "EAF6F4"},  // インタプリタ＝ティール
  vm: {c: "7C4DDB", bg: "F5F1FD"},   // 中間コード＋VM＝紫
  cpu: {c: "E07B1A", bg: "FFF4E6"},  // CPU＝オレンジ
};
const FS = 13;

function svgOf(Comp, color) {
  let s = RDS.renderToStaticMarkup(React.createElement(Comp, {color: "#" + color, size: 256}));
  return "image/svg+xml;base64," + Buffer.from(s.replace(/currentColor/g, "#" + color)).toString("base64");
}
const T = (s, text, o) => s.addText(text, {isTextBox: true, margin: 0, fontFace: FONT.en, fontSize: FS, color: C.text, valign: "top", ...o});
function arrow(s, x1, y1, x2, y2, label, o = {}) {
  s.addShape("line", {x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(Math.abs(x2 - x1), 0.0001), h: Math.max(Math.abs(y2 - y1), 0.0001),
    flipH: x2 < x1, flipV: y2 < y1, line: {color: C.arrow, width: 1.5, endArrowType: "triangle"}});
  if (label) {
    const w = o.w || Math.abs(x2 - x1), h = o.h || 0.24;
    T(s, label, {x: (x1 + x2) / 2 - w / 2, y: y1 - h - 0.04, w, h, fontSize: FS - 1, color: C.muted, align: "center", valign: "bottom", fill: o.fill ? {color: o.fill} : undefined});
  }
}
function pill(s, x, y, text, color) {  // 枠をまたぐバッジ
  const w = 0.5, h = 0.24;
  s.addShape("roundRect", {x, y, w, h, rectRadius: 0.12, fill: {color}, line: {type: "none"}});
  T(s, text, {x, y, w, h, fontSize: FS, bold: true, color: C.white, align: "center", valign: "middle"});
}
function base() {
  const p = new pptxgen(); p.layout = "LAYOUT_16x9"; p.theme = {headFontFace: FONT.en, bodyFontFace: FONT.en};
  p.title = "プログラミング言語の分け方"; return p;
}
async function save(p, file) {  // 和文欄をヒラギノに・言語を ja-JP に・アイコンの代替PNGを作り直す
  const src = await JSZip.loadAsync(await p.write({outputType: "nodebuffer"})), out = new JSZip();
  for (const f of Object.keys(src.files)) {
    if (src.files[f].dir) continue;
    let data = await src.file(f).async("nodebuffer");
    const m = f.match(/^ppt\/media\/image-(\d+)-(\d+)\.png$/), svg = m && src.file(`ppt/media/image-${m[1]}-${+m[2] + 1}.svg`);
    if (svg) data = await sharp(await svg.async("nodebuffer"), {density: 300}).resize(256, 256, {fit: "contain", background: {r: 0, g: 0, b: 0, alpha: 0}}).png().toBuffer();
    if (/^ppt\/.*\.xml$/.test(f)) {
      let x = data.toString("utf8");
      if (/^ppt\/theme\//.test(f)) x = x.replace(/<a:ea typeface="[^"]*"[^>]*\/>/g, `<a:ea typeface="${FONT.ja}"/>`);
      else x = x.replace(/<a:ea typeface="(?!\+)[^"]*"[^>]*\/>/g, `<a:ea typeface="${FONT.ja}" pitchFamily="34" charset="-128"/>`);
      x = x.replace(/(<a:(?:rPr|endParaRPr|defRPr)\b[^>]*?) lang="en-US"(?![^>]*altLang)/g, '$1 lang="ja-JP" altLang="en-US"');
      data = Buffer.from(x);
    }
    out.file(f, data, {createFolders: false});
  }
  fs.writeFileSync(file, await out.generateAsync({type: "nodebuffer", compression: "DEFLATE"}));
}

// レーン見出し（アイコン＋名前＋補足2行まで）
function laneHead(s, x, y, w, h, lc, name, sub, Icon) {
  s.addShape("rect", {x, y, w: 0.08, h, fill: {color: lc.c}, line: {type: "none"}});
  s.addImage({data: svgOf(Icon, lc.c), x: x + w / 2 - 0.2, y: y + h / 2 - 0.58, w: 0.4, h: 0.4});
  T(s, [{text: name, options: {bold: true, color: lc.c, breakLine: true}}, {text: sub, options: {color: C.muted}}],
    {x: x + 0.1, y: y + h / 2 - 0.14, w: w - 0.12, h: 0.75, align: "center"});
}

// ================= 図1：実行のしかた（スイムレーン） =================
async function fig1() {
  const p = base(), s = p.addSlide(); s.background = {color: C.white};
  const X0 = 0.15, X1 = 9.85, HW = 1.4, top = 0.5, LH = 1.6;
  const NW = 1.24, NH = 1.0, nx = [1.64, 3.24, 4.84, 6.66], cpuX = 9.0, cpuW = 0.78, div = 6.37;
  const lanes = [
    {k: "aot", name: "事前コンパイル", sub: "実行前に\n機械語へ変換", icon: tb.TbSettingsCog},
    {k: "itp", name: "インタプリタ", sub: "解釈しながら\n逐次実行", icon: tb.TbTerminal2},
    {k: "vm", name: "中間コード+VM", sub: "バイトコードを\nVMで実行", icon: tb.TbBox},
  ];
  // 外枠・レーン背景
  s.addShape("roundRect", {x: X0, y: top, w: X1 - X0, h: LH * 3, rectRadius: 0.08, fill: {color: C.white}, line: {color: C.line, width: 1}});
  lanes.forEach((ln, i) => {
    const y = top + i * LH;
    s.addShape("rect", {x: X0 + 0.02, y: y + 0.02, w: cpuX - 0.12 - X0, h: LH - 0.04, fill: {color: L[ln.k].bg}, line: {type: "none"}});
    laneHead(s, X0 + 0.02, y + 0.02, HW, LH - 0.04, L[ln.k], ln.name, ln.sub, ln.icon);
  });
  // ビルド時｜実行時
  s.addShape("line", {x: div, y: top - 0.32, w: 0, h: LH * 3 + 0.32, line: {color: C.gray, width: 1.25, dashType: "dash"}});
  T(s, "実行前", {x: nx[0], y: top - 0.36, w: div - nx[0], h: 0.3, fontSize: FS + 1, bold: true, color: C.muted, align: "center", valign: "middle"});
  T(s, "実行時", {x: div, y: top - 0.36, w: X1 - div, h: 0.3, fontSize: FS + 1, bold: true, color: C.muted, align: "center", valign: "middle"});

  // ノード：アイコン＋太字タイトル＋等幅の識別子
  const node = (col, lane, title, id, Icon, o = {}) => {
    const lc = o.lc || L[lanes[lane].k], x = typeof col === "number" ? nx[col] : col, y = top + lane * LH + (LH - NH) / 2;
    s.addShape("roundRect", {x, y, w: o.w || NW, h: NH, rectRadius: 0.1, fill: {color: C.white}, line: {color: lc.c, width: 1.75}});
    s.addImage({data: svgOf(Icon, lc.c), x: x + (o.w || NW) / 2 - 0.16, y: y + 0.08, w: 0.32, h: 0.32});
    T(s, [{text: title, options: {bold: true, breakLine: true}}, {text: id, options: {fontFace: FONT.mono, color: C.muted}}],
      {x: x + 0.03, y: y + 0.44, w: (o.w || NW) - 0.06, h: 0.5, align: "center"});
    return {l: x, r: x + (o.w || NW), cy: y + NH / 2, y};
  };
  const cy = (i) => top + i * LH + LH / 2;

  // CPU（全レーン共通の実行先）
  s.addShape("roundRect", {x: cpuX, y: top + 0.12, w: cpuW, h: LH * 3 - 0.24, rectRadius: 0.1, fill: {color: L.cpu.bg}, line: {color: L.cpu.c, width: 1.75}});
  s.addImage({data: svgOf(tb.TbCpu, L.cpu.c), x: cpuX + cpuW / 2 - 0.25, y: top + LH * 1.5 - 0.56, w: 0.5, h: 0.5});
  T(s, [{text: "CPU", options: {bold: true, color: L.cpu.c, breakLine: true}}, {text: "機械語を", options: {color: C.muted, breakLine: true}}, {text: "直接実行", options: {color: C.muted}}],
    {x: cpuX + 0.02, y: top + LH * 1.5 + 0.02, w: cpuW - 0.04, h: 0.75, align: "center"});

  // レーン1：事前コンパイル
  let a = node(0, 0, "ソースコード", "main.c", tb.TbFileCode), b = node(1, 0, "コンパイラ", "gcc", tb.TbSettingsCog),
    c = node(2, 0, "実行ファイル", "a.out", tb.TbBinary);
  arrow(s, a.r, a.cy, b.l, b.cy, "入力"); arrow(s, b.r, b.cy, c.l, c.cy, "生成");
  arrow(s, c.r, c.cy, cpuX, c.cy, "a.outの機械語", {w: 2.6});
  // レーン2：インタプリタ
  a = node(0, 1, "ソースコード", "script.sh", tb.TbFileCode); b = node(3, 1, "インタプリタ", "bash", tb.TbTerminal2);
  arrow(s, a.r, a.cy, b.l, b.cy, "ソースのまま入力", {w: 3.0});
  arrow(s, b.r, b.cy, cpuX, b.cy, "bash本体の\n機械語", {w: 1.0, h: 0.46});
  // レーン3：中間コード＋VM
  a = node(0, 2, "ソースコード", "Main.java", tb.TbFileCode); b = node(1, 2, "コンパイラ", "javac", tb.TbSettingsCog);
  c = node(2, 2, "バイトコード", "Main.class", tb.TbFileDigit); const d = node(3, 2, "仮想マシン", "JVM", tb.TbBox);
  pill(s, d.r - 0.6, d.y - 0.17, "JIT", L.vm.c);
  arrow(s, a.r, a.cy, b.l, b.cy, "入力"); arrow(s, b.r, b.cy, c.l, c.cy, "生成"); arrow(s, c.r, c.cy, d.l, d.cy, "ロード", {w: 0.54, fill: L.vm.bg});
  arrow(s, d.r, d.cy, cpuX, d.cy, "JVM本体と\nJITの機械語", {w: 1.06, h: 0.46});

  s.addNotes("図1 実行のしかたの3方式。どの方式でも、最後にCPUが実行するのは機械語。JIT＝実行中に頻繁に通る部分を機械語へコンパイルする仕組み。");
  await save(p, path.join(OUT, "01_実行のしかたの3方式.pptx"));
}

// ================= 図2：型付け × 実行方式 =================
const MEM = {
  manual: {c: "C62828", bg: "FDECEC", name: "手動（非メモリ安全）"},
  gc: {c: "546E7A", bg: "ECEFF1", name: "ガベージコレクション"},
  own: {c: "B7791F", bg: "FBF3E4", name: "所有権"},
};
const LANG = {
  C: [si.SiC, "5C6BC0", "manual"], "C++": [si.SiCplusplus, "00599C", "manual"], Rust: [si.SiRust, "000000", "own"], Go: [si.SiGo, "00ADD8", "gc"],
  Java: [si.SiOpenjdk, "E76F00", "gc"], "C#": [si.SiDotnet, "512BD4", "gc"], Kotlin: [si.SiKotlin, "7F52FF", "gc"], TypeScript: [si.SiTypescript, "3178C6", "gc"],
  Python: [si.SiPython, "3776AB", "gc"], JavaScript: [si.SiJavascript, "C9A800", "gc"], Ruby: [si.SiRuby, "CC342D", "gc"], PHP: [si.SiPhp, "777BB4", "gc"],
  "Ruby ≤1.8": [si.SiRuby, "CC342D", "gc"], bash: [si.SiGnubash, "4EAA25", null],
};
const MARK = {TypeScript: "*1", bash: "*2"};
async function fig2() {
  const p = base(), s = p.addSlide(); s.background = {color: C.white};
  const X0 = 0.15, HW = 2.0, top = 0.62, RH = 1.28, cx = [X0 + HW + 0.1, 0], CW = 3.75;
  cx[1] = cx[0] + CW + 0.1;
  const rows = [
    {k: "aot", name: "事前コンパイル", sub: "実行前に\n機械語へ変換", icon: tb.TbSettingsCog,
      cells: [["C", "C++", "Rust", "Go"], null]},
    {k: "itp", name: "インタプリタ", sub: "解釈しながら\n逐次実行", icon: tb.TbTerminal2,
      cells: [null, ["bash", "Ruby ≤1.8"]]},
    {k: "vm", name: "中間コード+VM", sub: "バイトコードを\nVMで実行", icon: tb.TbBox,
      cells: [["Java", "C#", "Kotlin", "TypeScript"], ["Python", "JavaScript", "Ruby", "PHP"]]},
  ];
  // 列見出し（型付け）
  [["静的型付け", "型の間違いを実行前に検出"], ["動的型付け", "型の間違いが実行時に判明"]].forEach(([n, d], j) => {
    T(s, [{text: n + "　", options: {bold: true, color: C.text, fontSize: FS + 1}}, {text: d, options: {color: C.muted}}],
      {x: cx[j], y: 0.12, w: CW, h: 0.4, align: "center", valign: "middle"});
  });
  T(s, [{text: "実行方式 ＼ 型付け", options: {bold: true, color: C.muted}}], {x: X0, y: 0.12, w: HW, h: 0.4, align: "center", valign: "middle"});

  const chip = (x, y, name) => {
    const [Icon, col, mem] = LANG[name], m = mem ? MEM[mem] : {c: C.gray, bg: C.grayBg}, w = 1.72, h = 0.42;
    s.addShape("roundRect", {x, y, w, h, rectRadius: 0.21, fill: {color: m.bg}, line: {color: m.c, width: 1.75}});
    const isz = name === "Go" ? 0.3 : 0.26;  // 横長ロゴは大きめに
    s.addImage({data: svgOf(Icon, col), x: x + (name === "Go" ? 0.23 : 0.26) - isz / 2, y: y + h / 2 - isz / 2, w: isz, h: isz});
    const sup = MARK[name];
    T(s, sup ? [{text: name}, {text: sup, options: {superscript: true}}] : name, {x: x + 0.44, y, w: w - 0.46, h, bold: true, valign: "middle"});
  };
  rows.forEach((r, i) => {
    const y = top + i * RH, lc = L[r.k];
    s.addShape("rect", {x: X0, y: y + 0.03, w: HW, h: RH - 0.06, fill: {color: lc.bg}, line: {type: "none"}});
    laneHead(s, X0, y + 0.03, HW, RH - 0.06, lc, r.name, r.sub, r.icon);
    r.cells.forEach((cell, j) => {
      s.addShape("roundRect", {x: cx[j], y: y + 0.03, w: CW, h: RH - 0.06, rectRadius: 0.08, fill: {color: cell ? C.white : "F7F8FA"}, line: {color: C.line, width: 1, dashType: cell ? "solid" : "dash"}});
      if (!cell) { T(s, "主流言語なし", {x: cx[j], y: y + 0.03, w: CW, h: RH - 0.06, color: C.gray, align: "center", valign: "middle"}); return; }
      cell.forEach((n, k) => chip(cx[j] + 0.13 + (k % 2) * 1.8, y + 0.03 + (cell.length > 2 ? 0.14 + Math.floor(k / 2) * 0.52 : (RH - 0.06 - 0.42) / 2), n));
    });
  });
  // 凡例（メモリ管理）と注記
  const ly = top + 3 * RH + 0.12;
  T(s, "枠の色＝メモリ管理", {x: X0, y: ly, w: HW, h: 0.3, bold: true, color: C.muted, align: "center", valign: "middle"});
  const items = [...Object.values(MEM), {c: C.gray, bg: C.grayBg, name: "対象外"}], lxs = [cx[0], cx[0] + 2.45, cx[0] + 4.9, cx[0] + 6.05];
  items.forEach((m, i) => {
    const lx = lxs[i];
    s.addShape("roundRect", {x: lx, y: ly + 0.05, w: 0.36, h: 0.2, rectRadius: 0.1, fill: {color: m.bg}, line: {color: m.c, width: 1.75, dashType: m.dash ? "dash" : "solid"}});
    T(s, m.name, {x: lx + 0.44, y: ly, w: 2.0, h: 0.3, valign: "middle"});
  });
  T(s, [{text: "*1 TypeScript：JavaScript へ変換後に実行　*2 bash：変数は原則として文字列", options: {breakLine: true}}, {text: "注：実行方式は代表的な処理系での分類"}],
    {x: cx[0], y: ly + 0.36, w: CW * 2 + 0.1, h: 0.5, fontSize: FS - 1, color: C.muted, valign: "top"});
  s.addNotes("図2 型付け×実行方式の2軸に主な言語を置いた図。枠の色はメモリ管理の方式。実行方式は言語ではなく処理系の性質なので、代表的な処理系（CPython、MRI/YARV など）で分類。bash はメモリ管理の分類の対象外として灰色。bash の変数は原則として文字列（declare -i などは例外）。");
  await save(p, path.join(OUT, "02_型付けと実行方式による言語の分類.pptx"));
}

(async () => { fs.mkdirSync(OUT, {recursive: true}); await fig1(); await fig2(); })();
