# no.34 図の生成（zukai-diagrams 準拠）

- `figs.js`：図1〜4 の本体（ヘルパーは no.33 と共通）。色の意味：slate＝クライアント・送信側／navy＝サーバ・受信側／teal・navy・purple＝ストリーム A・B・C（図4）、図3は teal＝宛先アプリの区別／navy＝接続・到達・順序・流量・輻輳の制御／purple＝誤り検出／gray＝その他／red＝損失
- `zukai.js`：zukai-diagrams スキルの描画ヘルパー（そのまま）
- `render.sh`：PPTX → PNG（2000px、余白を詰める）
- `fonts.conf`：コンテナ用の代替フォント

```sh
npm i pptxgenjs jszip react react-dom react-icons sharp
node figs.js ../      # image/ に 01〜04 の .pptx を出力
bash render.sh ../    # 同じフォルダに .png を出力
```
