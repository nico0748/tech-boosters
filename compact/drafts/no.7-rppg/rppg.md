---
title: 非接触型容積脈波測定法（rPPG）を簡単にまとめる
tags:
  - rPPG
  - 信号処理
  - コンピュータビジョン
  - ヘルスケア
private: true
---
<!--
  コンパクト記事 no.7（草稿。公開前にこのコメントは削除）
  - 裏取り：Verkruysse ら (2008)、Poh ら (2010)、de Haan & Jeanne (2013)、Wang ら (2017) の本文
  - 足したいもの：処理の流れの図（pptx→png）、OpenCV で平均 RGB を取る短いコード
  - 関連：other no.10 Googleの自撮り動画認証（なりすまし検知の研究で rPPG が使われることがある。Google が使っているとは書かない）
-->

# はじめに

カメラに顔を映すだけで心拍数が分かるらしい、と聞いて仕組みを調べてみました。

# ひとことで言うと

**rPPG（remote Photoplethysmography、非接触型容積脈波測定法）は、カメラで撮った顔などの肌の、わずかな色の変化から脈波を取り出し、心拍数などを推定する方法**です。

# なぜ色から脈が分かるのか

- 心臓が拍動するたびに、皮膚の下の血管を流れる血液の量が少しだけ変わる
- 血液中のヘモグロビンは光を吸収するので、血液の量が変わると、肌で反射する光の量も少しだけ変わる
- この変化は目では分からないほど小さいが、カメラの画素値の時間変化としてなら取り出せる
- RGB のうち、**緑のチャンネルにいちばんはっきり出る**ことが知られている（Verkruysse ら、2008）

スマートウォッチの心拍センサー（PPG）も同じ原理で、こちらは LED で肌を照らし、受光素子で反射光を測っています。rPPG はそれをカメラと周りの光で、離れたところからやるイメージです。

# 処理の流れ

1. 動画から顔を検出する
2. 頬やおでこなど、肌が映っている領域（ROI）を決める
3. フレームごとに ROI の平均 RGB を計算し、時系列の信号にする
4. 動きや照明の変化による成分を取り除き、脈波の成分を取り出す（下の表の手法）
5. 心拍の範囲（だいたい 0.7〜4 Hz、つまり 42〜240 bpm）だけを通すフィルタをかける
6. FFT などで、いちばん強い周波数を見つけて心拍数にする

# 主な手法

| 手法 | 提案 | 中身 |
|---|---|---|
| Green | Verkruysse ら（2008） | 緑チャンネルの変化をそのまま使う |
| ICA | Poh ら（2010） | 独立成分分析で RGB から脈波の成分を分ける |
| CHROM | de Haan & Jeanne（2013） | 色差の信号を組み合わせて、動きの影響を減らす |
| POS | Wang ら（2017） | 肌の色に直交する平面に投影して脈波を取り出す |
| 深層学習 | DeepPhys（2018）、PhysNet（2019）など | 動画から脈波をニューラルネットワークで直接推定する |

# 難しいところ

- 顔が動くと、色の変化よりも動きによる変化のほうが大きくなる
- 照明のちらつきや明るさの変化に弱い
- 肌の色や化粧、カメラの圧縮（動画の画質）で精度が変わる

# まとめ

「血液の量の変化 → 肌の色のわずかな変化 → カメラで取り出す」という流れなのよ。
ほかにも押さえておくべき手法があれば、有識者の方教えて欲しいです！

# 参考

- W. Verkruysse, L. O. Svaasand, J. S. Nelson, "Remote plethysmographic imaging using ambient light", Optics Express, 2008
- M.-Z. Poh, D. J. McDuff, R. W. Picard, "Non-contact, automated cardiac pulse measurements using video imaging and blind source separation", Optics Express, 2010
- G. de Haan, V. Jeanne, "Robust pulse rate from chrominance-based rPPG", IEEE Trans. Biomed. Eng., 2013
- W. Wang, A. C. den Brinker, S. Stuijk, G. de Haan, "Algorithmic principles of remote PPG", IEEE Trans. Biomed. Eng., 2017
