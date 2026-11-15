// figs.js が使うアイコンの SVG を icons.json に書き出す（react-icons がある環境で1回だけ実行）
// react-icons がない環境では、figs.js がこの icons.json を読む
const fs = require("fs"), path = require("path");
const React = require("react"), RDS = require("react-dom/server"), tb = require("react-icons/tb"), si = require("react-icons/si");
const src = fs.readFileSync(path.join(__dirname, "figs.js"), "utf8");
const names = [...new Set(src.match(/"(Tb|Si)[A-Za-z0-9]+"/g).map((s) => s.slice(1, -1)))].sort();
const set = {...tb, SiBurpsuite: si.SiBurpsuite}, out = {};
for (const n of names) out[n] = RDS.renderToStaticMarkup(React.createElement(set[n], {size: 256}));
fs.writeFileSync(path.join(__dirname, "icons.json"), JSON.stringify(out, null, 0));
console.log(Object.keys(out).length, "icons");
