# no.35 図の生成（zukai-diagrams 準拠）

- `figs.js`：図1・図2 の本体。色の意味は navy＝どの OS でも同じ／amber＝OS・CPU ごとに別物／slate＝OS・CPU／pink＝配布するもの
- `zukai.js`：zukai-diagrams スキルの描画ヘルパー（そのまま）
- `render.sh`：PPTX → PNG（2000px、余白を詰める）。LibreOffice の和欧間の自動スペースを切ってから描画
- `fonts.conf`：コンテナ用の代替フォント（Hiragino Sans → IPAPGothic、Helvetica Neue → Liberation Sans）

```sh
npm i pptxgenjs jszip react react-dom react-icons sharp
node figs.js ../      # image/ に 01・02 の .pptx を出力
bash render.sh ../    # 同じフォルダに .png を出力
```
