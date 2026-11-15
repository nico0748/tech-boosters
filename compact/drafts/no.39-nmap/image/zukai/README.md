# no.39 図の生成（zukai-diagrams 準拠）

- `figs.js`：図1〜6 の本体。色の意味（全図共通）は navy＝Nmap 本体の処理／teal＝NSE のスクリプト／gray＝得られる情報／白地＋灰線＝中間データ。図1の「既定で実行／オプション」はブラケットで示す
- `zukai.js`：zukai-diagrams スキルの描画ヘルパー（そのまま）
- `render.sh`：PPTX → PNG（2000px、余白を詰める）
- `fonts.conf`：コンテナ用の代替フォント（ヒラギノ → IPAGothic。全角送りなので本番の字幅に近い）

```sh
npm i pptxgenjs jszip react react-dom react-icons sharp
node figs.js ../
bash render.sh ../
```
