---
title: 転置と内積・外積を簡単にまとめる
tags:
  - 線形代数
  - 数学
  - 機械学習
private: true
---
<!--
  コンパクト記事 no.2（草稿。公開前にこのコメントは削除）
  - 注意：日本語の「外積」は、ベクトル積（cross product）と、テンソル積としての外積（outer product）の2つの意味で使われる。本文で必ず区別する
  - 足したいもの：NumPy での計算例（a.T, a @ b, np.outer, np.cross）
  - 関連：no.3 ナブラ演算子（発散は内積、回転はベクトル積の形をしている）
-->

# はじめに

機械学習の式を読んでいると $a^\top b$ や $a b^\top$ がしれっと出てくるので、一度まとめておきます。

# ひとことで言うと

| 操作 | 書き方 | 結果 |
|---|---|---|
| 転置 | $A^\top$ | 行と列を入れ替えた行列 |
| 内積 | $a \cdot b = a^\top b$ | スカラー（数1つ） |
| 外積（outer product） | $a \otimes b = a b^\top$ | 行列 |
| 外積（ベクトル積、cross product） | $a \times b$ | ベクトル（3次元のみ） |

# 転置

行列の $i$ 行 $j$ 列の成分を、$j$ 行 $i$ 列に移す操作です。$m \times n$ 行列は $n \times m$ 行列になります。

$$
A = \begin{pmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{pmatrix}
\quad\Rightarrow\quad
A^\top = \begin{pmatrix} 1 & 4 \\ 2 & 5 \\ 3 & 6 \end{pmatrix}
$$

ベクトルは「縦ベクトル（$n \times 1$）」として扱うことが多く、転置すると横ベクトル（$1 \times n$）になります。

# 内積

同じ長さのベクトルの成分どうしを掛けて、足し合わせたものです。

$$
a^\top b = a_1 b_1 + a_2 b_2 + \cdots + a_n b_n = |a||b|\cos\theta
$$

- 横ベクトル（$1 \times n$）× 縦ベクトル（$n \times 1$）なので、結果は $1 \times 1$、つまりスカラーになる
- 内積が0なら、2つのベクトルは直交している
- 機械学習では、類似度（コサイン類似度）や、ニューロンの重み付き和 $w^\top x$ として出てくる

# 外積（outer product）

縦ベクトル × 横ベクトルの順に掛けたものです。

$$
a b^\top =
\begin{pmatrix} a_1 \\ a_2 \end{pmatrix}
\begin{pmatrix} b_1 & b_2 & b_3 \end{pmatrix}
=
\begin{pmatrix} a_1 b_1 & a_1 b_2 & a_1 b_3 \\ a_2 b_1 & a_2 b_2 & a_2 b_3 \end{pmatrix}
$$

- $n \times 1$ と $1 \times m$ を掛けるので、結果は $n \times m$ の行列になる
- 内積と違って、2つのベクトルの長さが違ってもよい
- 機械学習では、ヘブ則の重み更新や、勾配の計算（$\delta x^\top$ の形）として出てくる

# 外積（ベクトル積、cross product）

高校や物理で「外積」と呼ばれるのはこちらで、3次元のベクトルどうしで定義されます。

$$
a \times b = \begin{pmatrix} a_2 b_3 - a_3 b_2 \\ a_3 b_1 - a_1 b_3 \\ a_1 b_2 - a_2 b_1 \end{pmatrix}
$$

- 結果は $a$ と $b$ の両方に垂直なベクトル
- 大きさは $|a||b|\sin\theta$ で、$a$ と $b$ が作る平行四辺形の面積に等しい
- 向きは右ねじの法則で決まり、$a \times b = -(b \times a)$

# まとめ

内積・外積は「縦と横、どっちを先に掛けるか」で結果の形が変わるのよ。「外積」と書いてあったら、どっちの意味なのかを確かめてから読むのがおすすめです。

# 参考

- （教科書や NumPy のドキュメントを追記）
