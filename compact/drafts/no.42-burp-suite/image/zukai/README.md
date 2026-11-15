# Burp Suite シリーズ（compact no.42〜50）の図の生成（zukai-diagrams 準拠）

- `figs.js`：no.42〜50 の図12枚の本体。各記事の `image/` に PPTX を書き出す
- `zukai.js`：zukai-diagrams スキルの描画ヘルパー（矢印の `dashType` 指定だけ追加）
- `render.sh`：PPTX → PNG（2000px、余白を詰める）
- `fonts.conf`：代替フォントの割り当て（確認用。本番の字形は Mac の PowerPoint で書き出す）
- `icons.json`：図で使うアイコンの SVG（react-icons がない環境では figs.js がこれを読む）。`make-icons.js` で作り直せる

アイコン（全図で共通、紺）：Burp Suite＝Simple Icons の SiBurpsuite（ブランド色はオレンジだが、図では「橙＝対象」なので紺にしている）、
Proxy＝TbArrowsExchange、Repeater＝TbRepeat、Intruder＝TbListNumbers、Scanner＝TbScan、Collaborator＝TbRadar2、
Sequencer＝TbChartHistogram、Decoder＝TbTransform、Comparer＝TbFileDiff、Burp AT＝TbRobot、プロジェクト＝TbDeviceFloppy、検索＝TbSearch

色の意味：navy＝Burp のツール・処理／orange＝対象の Web アプリ／gray＝ブラウザ・データ・成果物／
pink＝書き換えた値・注目点／紺のピル「Pro」＝Professional のみ／pink 枠のピル「demo」＝Community では demo 版

```sh
npm i pptxgenjs jszip sharp        # react・react-icons があれば icons.json の代わりにそちらを使う
node figs.js ../../..            # compact/drafts を指定。no.42〜50 の image/ に PPTX を出力
for d in ../../../no.4[2-9]-burp-*/image ../../../no.50-burp-comparer/image; do bash render.sh "$d"; done
```

PowerPoint で PPTX を直した場合は、このスクリプトではなく直した PPTX から PNG を書き出し直す。
