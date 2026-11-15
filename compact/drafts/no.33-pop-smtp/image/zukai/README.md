# no.33 図の生成（zukai-diagrams 準拠）

- `figs.js`：図1〜4 の本体。色の組は no.8 と同じで、この記事での意味は slate＝利用者の端末／teal＝送信側（サーバ）／navy＝受信側（サーバ）／gray＝DNS／red＝問題
- `zukai.js`：zukai-diagrams スキルの描画ヘルパー（そのまま）
- `render.sh`：PPTX → PNG（2000px、余白を詰める）。LibreOffice の和欧間の自動スペースを切ってから描画
- `fonts.conf`：コンテナ用の代替フォント（Hiragino Sans → IPAPGothic、Helvetica Neue → Liberation Sans）

```sh
npm i pptxgenjs jszip react react-dom react-icons sharp
node figs.js ../      # image/ に 01〜04 の .pptx を出力
bash render.sh ../    # 同じフォルダに .png を出力
```

Mac の PowerPoint で開けば本来のフォント（ヒラギノ角ゴ＋Helvetica Neue）で表示される。
