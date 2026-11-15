# no.38 図の生成（zukai-diagrams 準拠）

- `figs.js`：図1〜3 の本体。色の意味は teal＝静的なチェック／navy＝動的なチェック・実行中のプロセス／gray＝ファイル・成果物・IGNORE/INFO／pink 枠＝この記事の対象／red＝FAIL・CI 失敗／green＝CI 成功
- `zukai.js`：zukai-diagrams スキルの描画ヘルパー（そのまま）
- `render.sh`：PPTX → PNG（2000px、余白を詰める）
- `fonts.conf`：コンテナ用の代替フォント

```sh
npm i pptxgenjs jszip react react-dom react-icons sharp
node figs.js ../
bash render.sh ../
```
