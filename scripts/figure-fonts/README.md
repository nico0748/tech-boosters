# 図のフォントを zukai-diagrams の基準に揃える

図（PPTX）のフォントは zukai-diagrams（図解ベストプラクティス）の3役だけにする（2026-11-20〜）。

| 役 | 使う所 | 欧文 | 和文 |
|---|---|---|---|
| 魅せる（display） | 枠の見出し（ピンク・太字・下線）、タイトル | Codec Cold | UD新ゴ Pr6N M |
| 読ませる（body） | それ以外の文字 | Gibson | ヒラギノ角ゴ（Hiragino Sans） |
| コード（code） | コード片・コマンド・設定値・パス | Menlo | ヒラギノ角ゴ（Hiragino Sans） |

数式（matplotlib の mathtext で画像にしたもの）は数式用の書体のまま。

## 手順

生成スクリプトで作った PPTX も、Nico が手で直した PPTX も、最後にこの順で通してから PNG にする。

```sh
D=scripts/figure-fonts
python3 $D/refont.py   図.pptx      # フォントを3役に置き換える（等幅だった文字は code、ピンク太字下線は display）
python3 $D/arrowfix.py 図.pptx      # 欧文フォントの「→」を同じ役の和文フォントで描く（欧文の矢印は小さく下寄りになる）
python3 $D/fit.py      図.pptx      # ヒラギノの全角幅で枠からはみ出す和文の行を直す（下の順で試す）
python3 $D/overflow.py 図.pptx      # はみ出しが残っていないか確認（何も出なければOK）
$D/render.sh 図.pptx out/図         # out/図/p1.png, p2.png …（300dpi→余白60px→横2000px）と out/図/doc.pdf
python3 $D/wrapcheck.py . out 図.pptx  # 描いたPDFの行位置で、1行のはずの文字列が折り返されていないか確認
```

fit.py が試す順番：(1) 文字枠を外側の見える枠の内側まで広げる → (2) 文字を小さく（元の90%・下限12pt）→ (3) 字間を詰める（文字サイズの8%まで）→ (4) 「・」「、」「（」などの自然な位置で改行（高さに余裕があるとき）→ (5) 文字枠を広げる。

## はまりどころ

- **角丸・楕円の図形は、文字の入る幅が図形より狭い**。角丸は角の丸み（adj）×0.29 だけ左右が食い込む（PowerPoint も LibreOffice も同じ）。図形の幅ぎりぎりの見出しは、ここで折り返す。overflow.py・fit.py はこの分を引いて測る。直すときは、左右の内余白（lIns・rIns）を減らすのが一番見た目を崩さない。
- **字間（spc）は最後の文字のあとには付かない**ことがあるので、詰めた行は数pt の余裕を残す。
- 欧文だけの行（「GitHub Actions」など）は、スペースで2行に分かれるのが自然なことが多いので fit.py は触らない。1語なのに折り返したら手で直す。
- wrapcheck.py は、全角スペースや大きな空きで区切った行・意図した改行も「折り返し」として出す。出た行は PNG を見て判断する。
- render.sh は LibreOffice で描く。fonts.conf で Hiragino Sans・UD新ゴ → Noto Sans CJK JP、Gibson・Codec Cold → Liberation Sans、Menlo → DejaVu Sans Mono に割り当てる（和文はどちらも全角1em で、ヒラギノと同じ字幅）。
- 和文と英数字の間に LibreOffice が自動で入れる空き（PowerPoint は入れない）は切ってから描く。
- python-pptx のコネクタ（p:cxnSp）は LibreOffice が経路を引き直して曲がった線になるので、描画用の複製だけ普通の図形に置き換える。台紙の端からはみ出た図形が切れないよう、描画用の台紙は右と下に1インチ広げる。

## 対象外

- スクリーンショット、プログラムの出力（matplotlib のグラフなど、Qiita に直接上げたもの）。
- バックアップの PPTX（`_to_delete`、`_旧版_python-pptx`、`*旧明朝版*`）。
