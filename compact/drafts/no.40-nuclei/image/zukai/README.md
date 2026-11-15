# no.40 図の生成（zukai-diagrams 準拠）

- `figs.js`：図1〜6 の本体（記事用 幅10in、本文 14pt・名前 16pt）。各箱の上部にアイコン（`icons/`：Mac の アイコン・素材 の Tabler outline とテック・SaaSロゴから。ライセンスは同フォルダの _licenses）
- 色の意味（6枚共通）：navy＝Nuclei（の処理）／teal＝テンプレート／orange＝スキャン対象／gray＝入出力／purple＝連携ツール（subfinder・httpx）／green・red・amber＝署名の検証の判定（図5のみ）／ピンク枠＝注目箇所／破線＝既定では通らない要素・経路
- `zukai.js`：zukai-diagrams スキルの描画ヘルパー（そのまま）
- `render.sh`：PPTX → PNG（2000px、余白を詰める）。コンテナでは代替フォントで描くので、本番の字形は Mac の PowerPoint で書き出す
- `fonts.conf`：コンテナ用の代替フォント

```sh
npm i pptxgenjs jszip react react-dom react-icons sharp
node figs.js ../
bash render.sh ../
```
