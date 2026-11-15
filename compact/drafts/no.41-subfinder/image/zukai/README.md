# no.41 図の生成（zukai-diagrams 準拠）

- `figs.js`：図1〜5 の本体。色の意味は全図共通で navy＝subfinder・ツールの処理／teal＝情報源／green＝出力・実行／gray＝対象・除外・スキップ／pink 破線＝許可が必要な範囲
- `zukai.js`：zukai-diagrams スキルの描画ヘルパー（そのまま）。アイコンは react-icons の Tabler（tb）
- `render.sh`：PPTX → PNG（2000px、余白を詰める）
- `fonts.conf`：コンテナ用の代替フォント（確認用。本番の字形は Mac の PowerPoint で書き出す）

```sh
npm i pptxgenjs jszip react react-dom react-icons sharp
node figs.js ../
bash render.sh ../
```
