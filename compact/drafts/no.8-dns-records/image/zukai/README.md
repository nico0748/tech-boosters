# no.8 図の生成（zukai-diagrams 準拠）

- `figs.js`：図1〜10 の本体。色は元の分類色（slate＝端末・送る側／teal＝キャッシュDNSサーバ・確かめる側／navy＝権威DNS・ゾーン・接続先／red＝失敗・問題／gray＝解約予定）
- `zukai.js`：zukai-diagrams スキルの描画ヘルパー（そのまま）
- `render.sh`：PPTX → PNG（2000px、余白を詰める）。LibreOffice の和欧間の自動スペースを切ってから描画
- `fonts.conf`：コンテナ用の代替フォント（Hiragino Sans → Noto Sans CJK JP、Helvetica Neue → Liberation Sans）

```sh
npm i pptxgenjs jszip react react-dom react-icons sharp
node figs.js ../   # image/ に 01〜10 の .pptx を出力
./render.sh ../    # 同じフォルダに .png を出力
```

Mac の PowerPoint で開けば本来のフォント（ヒラギノ角ゴ＋Helvetica Neue）で表示される。
