# no.37 図の生成（zukai-diagrams 準拠）

- `figs.js`：図1〜4 の本体。色の意味は navy＝int・int *／teal＝unsigned char *・読み替え／gray＝x の外の領域・元の float・void *／red＝互換性のない型（図4）／pink＝同じビット列
- `zukai.js`：zukai-diagrams スキルの描画ヘルパー（そのまま）
- `render.sh`：PPTX → PNG（2000px、余白を詰める）
- `fonts.conf`：コンテナ用の代替フォント

```sh
npm i pptxgenjs jszip react react-dom react-icons sharp
node figs.js ../
bash render.sh ../
```
