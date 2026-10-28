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
  - 方針（Nico, 2026-10-26）：数式の途中式を一切省かずに、計算方法と中身をまとめる
  - 注意：日本語の「外積」は、ベクトル積（cross product）と、テンソル積としての外積（outer product）の2つの意味で使われる。本文で必ず区別する
  - 数値例は全編で a = (1, 2, 3)ᵀ, b = (4, 5, 6)ᵀ に統一（NumPy で検算済み）
  - 関連：no.3 ナブラ演算子（発散は内積、回転はベクトル積の形をしている）。まとめの節からリンク済み
-->

# はじめに

機械学習の式を読んでいると $`a^\top b`$ や $`a b^\top`$ がしれっと出てきて、毎回「これ結果はスカラーだっけ行列だっけ…」となるので、途中式を省かずに一度まとめておきます。

# ひとことで言うと

| 操作 | 書き方 | 形の計算 | 結果 |
|---|---|---|---|
| 転置 | $`A^\top`$ | $`m \times n \to n \times m`$ | 行と列を入れ替えた行列 |
| 内積 | $`a \cdot b = a^\top b`$ | $`(1 \times n)(n \times 1) = 1 \times 1`$ | スカラー（数1つ） |
| 外積（outer product） | $`a \otimes b = a b^\top`$ | $`(n \times 1)(1 \times m) = n \times m`$ | 行列 |
| 外積（ベクトル積、cross product） | $`a \times b`$ | 3次元ベクトル2つ → 3次元ベクトル | ベクトル（3次元のみ） |

この記事では、ベクトルはすべて**縦ベクトル**（$`n \times 1`$ 行列）として扱います。数値例は最後まで次の2つで統一します。

```math
a = \begin{pmatrix} 1 \\ 2 \\ 3 \end{pmatrix}, \quad
b = \begin{pmatrix} 4 \\ 5 \\ 6 \end{pmatrix}
```

# 転置

## 定義

$`m \times n`$ 行列 $`A`$ の $`i`$ 行 $`j`$ 列の成分を $`A_{ij}`$ と書くと、転置 $`A^\top`$ は次のように定義される $`n \times m`$ 行列です。

```math
(A^\top)_{ij} = A_{ji}
```

つまり「$`i`$ 行 $`j`$ 列の成分を、$`j`$ 行 $`i`$ 列に移す」操作です。

## 計算例

```math
A = \begin{pmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{pmatrix}
```

は $`2 \times 3`$ 行列なので、$`A^\top`$ は $`3 \times 2`$ 行列になります。成分を1つずつ移すと、

```math
\begin{aligned}
(A^\top)_{11} &= A_{11} = 1, & (A^\top)_{12} &= A_{21} = 4, \\
(A^\top)_{21} &= A_{12} = 2, & (A^\top)_{22} &= A_{22} = 5, \\
(A^\top)_{31} &= A_{13} = 3, & (A^\top)_{32} &= A_{23} = 6
\end{aligned}
```

なので、

```math
A^\top = \begin{pmatrix} 1 & 4 \\ 2 & 5 \\ 3 & 6 \end{pmatrix}
```

です。縦ベクトル $`a`$（$`3 \times 1`$）を転置すると、横ベクトル $`a^\top`$（$`1 \times 3`$）になります。

```math
a^\top = \begin{pmatrix} 1 & 2 & 3 \end{pmatrix}
```

## よく使う性質

**(1) 2回転置すると元に戻る**

```math
\left( (A^\top)^\top \right)_{ij} = (A^\top)_{ji} = A_{ij}
\quad\Rightarrow\quad
(A^\top)^\top = A
```

**(2) 積の転置は順番が逆になる**

$`A`$ を $`m \times k`$、$`B`$ を $`k \times n`$ とします。行列の積の定義 $`(AB)_{ij} = \sum_{l=1}^{k} A_{il} B_{lj}`$ を使うと、

```math
\begin{aligned}
\left( (AB)^\top \right)_{ij}
&= (AB)_{ji} && \text{（転置の定義）} \\
&= \sum_{l=1}^{k} A_{jl} B_{li} && \text{（積の定義）} \\
&= \sum_{l=1}^{k} B_{li} A_{jl} && \text{（数の掛け算は順番を入れ替えてよい）} \\
&= \sum_{l=1}^{k} (B^\top)_{il} (A^\top)_{lj} && \text{（転置の定義）} \\
&= (B^\top A^\top)_{ij} && \text{（積の定義）}
\end{aligned}
```

なので、

```math
(AB)^\top = B^\top A^\top
```

です。この性質は、あとで内積の計算に使います。

# 内積

## 定義と計算方法

同じ長さ $`n`$ のベクトル $`a, b`$ の内積は、成分どうしを掛けて足し合わせたものです。

```math
a \cdot b = \sum_{i=1}^{n} a_i b_i = a_1 b_1 + a_2 b_2 + \cdots + a_n b_n
```

これは「横ベクトル $`a^\top`$（$`1 \times n`$）と縦ベクトル $`b`$（$`n \times 1`$）の行列積」と同じ計算になります。行列積の定義どおりに計算すると、

```math
a^\top b
= \begin{pmatrix} a_1 & a_2 & \cdots & a_n \end{pmatrix}
\begin{pmatrix} b_1 \\ b_2 \\ \vdots \\ b_n \end{pmatrix}
= \begin{pmatrix} a_1 b_1 + a_2 b_2 + \cdots + a_n b_n \end{pmatrix}
```

で、$`(1 \times n)(n \times 1) = 1 \times 1`$ 行列、つまりスカラーになります。なので $`a \cdot b = a^\top b`$ と書けます。

## 計算例

```math
\begin{aligned}
a^\top b
&= \begin{pmatrix} 1 & 2 & 3 \end{pmatrix}
\begin{pmatrix} 4 \\ 5 \\ 6 \end{pmatrix} \\
&= 1 \times 4 + 2 \times 5 + 3 \times 6 \\
&= 4 + 10 + 18 \\
&= 32
\end{aligned}
```

## 内積の性質

**(1) 順番を入れ替えても同じ値になる**

$`a^\top b`$ は $`1 \times 1`$ 行列（スカラー）なので、転置しても変わりません。そこに積の転置の性質 $`(AB)^\top = B^\top A^\top`$ を使うと、

```math
a^\top b = (a^\top b)^\top = b^\top (a^\top)^\top = b^\top a
```

です。

**(2) 自分自身との内積は長さの2乗**

ベクトルの長さ（ノルム）は $`|a| = \sqrt{a_1^2 + a_2^2 + \cdots + a_n^2}`$ なので、

```math
a^\top a = a_1^2 + a_2^2 + \cdots + a_n^2 = |a|^2
```

です。数値例では、

```math
\begin{aligned}
|a|^2 &= 1^2 + 2^2 + 3^2 = 1 + 4 + 9 = 14, \\
|b|^2 &= 4^2 + 5^2 + 6^2 = 16 + 25 + 36 = 77
\end{aligned}
```

になります。

## なぜ $`a^\top b = |a||b|\cos\theta`$ になるのか？

$`a`$ と $`b`$ のなす角を $`\theta`$ とします。$`a`$、$`b`$、$`a - b`$ の3本で三角形ができるので、余弦定理から

```math
|a - b|^2 = |a|^2 + |b|^2 - 2|a||b|\cos\theta \tag{1}
```

が成り立ちます。一方で、$`|a - b|^2`$ を内積で展開すると、

```math
\begin{aligned}
|a - b|^2
&= (a - b)^\top (a - b) && \text{（性質 (2)）} \\
&= a^\top a - a^\top b - b^\top a + b^\top b && \text{（分配法則で展開）} \\
&= a^\top a - a^\top b - a^\top b + b^\top b && \text{（性質 (1) より } b^\top a = a^\top b \text{）} \\
&= |a|^2 - 2 a^\top b + |b|^2 && \text{（性質 (2)）}
\end{aligned} \tag{2}
```

です。(1) と (2) の右辺は等しいので、

```math
|a|^2 + |b|^2 - 2|a||b|\cos\theta = |a|^2 - 2 a^\top b + |b|^2
```

両辺から $`|a|^2 + |b|^2`$ を引いて、$`-2`$ で割ると、

```math
a^\top b = |a||b|\cos\theta
```

が出てきます。

数値例で角度も出してみます。

```math
\cos\theta = \frac{a^\top b}{|a||b|} = \frac{32}{\sqrt{14}\sqrt{77}} = \frac{32}{\sqrt{1078}} \approx \frac{32}{32.833} \approx 0.9746
```

なので、$`\theta \approx 12.9^\circ`$ です。$`a`$ と $`b`$ はかなり近い向きを向いています。

## 機械学習での出どころ

- **直交の判定**：$`\cos 90^\circ = 0`$ なので、$`a^\top b = 0`$ なら2つのベクトルは直交している
- **コサイン類似度**：上の $`\cos\theta = \dfrac{a^\top b}{|a||b|}`$ がそのまま、埋め込みベクトルどうしの類似度になる
- **ニューロンの重み付き和**：$`w^\top x = w_1 x_1 + w_2 x_2 + \cdots + w_n x_n`$

# 外積（outer product）

## 定義と計算方法

縦ベクトル $`a`$（$`n \times 1`$）と横ベクトル $`b^\top`$（$`1 \times m`$）を、この順に掛けたものです。行列積の定義どおりに $`i`$ 行 $`j`$ 列の成分を計算すると、掛け合わせる要素が1つずつしかないので、

```math
(a b^\top)_{ij} = a_i b_j
```

になります。$`(n \times 1)(1 \times m) = n \times m`$ なので、結果は行列です。内積と違って、2つのベクトルの長さが違っていても計算できます。

## 計算例

長さが違う場合の例として、$`c = (1, 2)^\top`$ と $`d = (3, 4, 5)^\top`$ で計算します。

```math
\begin{aligned}
c d^\top
&= \begin{pmatrix} 1 \\ 2 \end{pmatrix}
\begin{pmatrix} 3 & 4 & 5 \end{pmatrix} \\
&= \begin{pmatrix}
1 \times 3 & 1 \times 4 & 1 \times 5 \\
2 \times 3 & 2 \times 4 & 2 \times 5
\end{pmatrix} \\
&= \begin{pmatrix} 3 & 4 & 5 \\ 6 & 8 & 10 \end{pmatrix}
\end{aligned}
```

$`2 \times 1`$ と $`1 \times 3`$ を掛けたので、$`2 \times 3`$ 行列になっています。

いつもの $`a, b`$ でも計算しておきます。

```math
\begin{aligned}
a b^\top
&= \begin{pmatrix} 1 \\ 2 \\ 3 \end{pmatrix}
\begin{pmatrix} 4 & 5 & 6 \end{pmatrix} \\
&= \begin{pmatrix}
1 \times 4 & 1 \times 5 & 1 \times 6 \\
2 \times 4 & 2 \times 5 & 2 \times 6 \\
3 \times 4 & 3 \times 5 & 3 \times 6
\end{pmatrix} \\
&= \begin{pmatrix} 4 & 5 & 6 \\ 8 & 10 & 12 \\ 12 & 15 & 18 \end{pmatrix}
\end{aligned}
```

## 内積とのつながり

同じ長さのベクトルなら、外積の行列の対角成分（$`i = j`$ の成分）は $`a_i b_i`$ です。対角成分の和（トレース）を取ると、

```math
\operatorname{tr}(a b^\top) = \sum_{i=1}^{n} (a b^\top)_{ii} = \sum_{i=1}^{n} a_i b_i = a^\top b
```

で、内積に一致します。数値例でも $`4 + 10 + 18 = 32`$ で、さっきの内積と同じ値です。

また、外積の行列は、どの行も $`b^\top`$ の定数倍（$`i`$ 行目は $`a_i b^\top`$）になっています。上の例でも、2行目は1行目の2倍、3行目は1行目の3倍です。こういう行列を**ランク1の行列**と呼びます。

## 機械学習での出どころ

**全結合層の重みの勾配**

全結合層 $`y = W x`$（$`W`$ は $`n \times m`$、$`x`$ は $`m \times 1`$、$`y`$ は $`n \times 1`$）で、損失 $`L`$ の $`y`$ についての勾配を $`\delta = \dfrac{\partial L}{\partial y}`$（$`n \times 1`$）とします。$`y`$ の $`i`$ 番目の成分は

```math
y_i = \sum_{k=1}^{m} W_{ik} x_k
```

なので、$`W_{ij}`$ で偏微分すると $`k = j`$ の項だけが残って $`\dfrac{\partial y_i}{\partial W_{ij}} = x_j`$ です。$`W_{ij}`$ は $`y_i`$ にしか関わらないので、連鎖律から

```math
\frac{\partial L}{\partial W_{ij}}
= \frac{\partial L}{\partial y_i} \frac{\partial y_i}{\partial W_{ij}}
= \delta_i x_j
= (\delta x^\top)_{ij}
```

となり、行列でまとめて書くと $`\dfrac{\partial L}{\partial W} = \delta x^\top`$、つまり外積の形になります。

**ヘブ則の重み更新**

「一緒に発火したニューロンどうしの結合を強める」ヘブ則は、学習率を $`\eta`$ として $`\Delta W_{ij} = \eta\, y_i x_j`$ と書けるので、まとめると $`\Delta W = \eta\, y x^\top`$ です。

# 外積（ベクトル積、cross product）

## 定義と計算方法

高校の物理などで「外積」と呼ばれるのはこちらで、3次元ベクトルどうしでだけ定義されます。

```math
a \times b = \begin{pmatrix} a_2 b_3 - a_3 b_2 \\ a_3 b_1 - a_1 b_3 \\ a_1 b_2 - a_2 b_1 \end{pmatrix}
```

覚えにくいので、単位ベクトル $`e_1, e_2, e_3`$ を1行目に置いた行列式として覚えるのが定番です。1行目で余因子展開すると、

```math
\begin{aligned}
a \times b
&= \begin{vmatrix} e_1 & e_2 & e_3 \\ a_1 & a_2 & a_3 \\ b_1 & b_2 & b_3 \end{vmatrix} \\
&= e_1 \begin{vmatrix} a_2 & a_3 \\ b_2 & b_3 \end{vmatrix}
 - e_2 \begin{vmatrix} a_1 & a_3 \\ b_1 & b_3 \end{vmatrix}
 + e_3 \begin{vmatrix} a_1 & a_2 \\ b_1 & b_2 \end{vmatrix} \\
&= e_1 (a_2 b_3 - a_3 b_2) - e_2 (a_1 b_3 - a_3 b_1) + e_3 (a_1 b_2 - a_2 b_1) \\
&= e_1 (a_2 b_3 - a_3 b_2) + e_2 (a_3 b_1 - a_1 b_3) + e_3 (a_1 b_2 - a_2 b_1)
\end{aligned}
```

となり、$`e_1, e_2, e_3`$ の係数が上の定義の成分と一致します。真ん中の項はマイナスが付くので、$`a_3 b_1 - a_1 b_3`$ の順になるところに注意です。

## 計算例

```math
\begin{aligned}
a \times b
&= \begin{pmatrix} 2 \times 6 - 3 \times 5 \\ 3 \times 4 - 1 \times 6 \\ 1 \times 5 - 2 \times 4 \end{pmatrix}
= \begin{pmatrix} 12 - 15 \\ 12 - 6 \\ 5 - 8 \end{pmatrix}
= \begin{pmatrix} -3 \\ 6 \\ -3 \end{pmatrix}
\end{aligned}
```

## 性質1：$`a`$ と $`b`$ の両方に垂直

$`a`$ との内積を一般の形で計算すると、

```math
\begin{aligned}
a^\top (a \times b)
&= a_1 (a_2 b_3 - a_3 b_2) + a_2 (a_3 b_1 - a_1 b_3) + a_3 (a_1 b_2 - a_2 b_1) \\
&= a_1 a_2 b_3 - a_1 a_3 b_2 + a_2 a_3 b_1 - a_1 a_2 b_3 + a_1 a_3 b_2 - a_2 a_3 b_1 \\
&= (a_1 a_2 b_3 - a_1 a_2 b_3) + (a_1 a_3 b_2 - a_1 a_3 b_2) + (a_2 a_3 b_1 - a_2 a_3 b_1) \\
&= 0
\end{aligned}
```

で、すべての項が打ち消し合います。$`b^\top (a \times b) = 0`$ も同じように確かめられます。内積が0なので、$`a \times b`$ は $`a`$ とも $`b`$ とも直交しています。

数値例でも確認します。

```math
\begin{aligned}
a^\top (a \times b) &= 1 \times (-3) + 2 \times 6 + 3 \times (-3) = -3 + 12 - 9 = 0, \\
b^\top (a \times b) &= 4 \times (-3) + 5 \times 6 + 6 \times (-3) = -12 + 30 - 18 = 0
\end{aligned}
```

## 性質2：なぜ大きさが $`|a||b|\sin\theta`$ になるのか？

$`|a \times b|^2`$ を成分で展開します。

```math
\begin{aligned}
|a \times b|^2
&= (a_2 b_3 - a_3 b_2)^2 + (a_3 b_1 - a_1 b_3)^2 + (a_1 b_2 - a_2 b_1)^2 \\
&= (a_2^2 b_3^2 - 2 a_2 a_3 b_2 b_3 + a_3^2 b_2^2) \\
&\quad + (a_3^2 b_1^2 - 2 a_1 a_3 b_1 b_3 + a_1^2 b_3^2) \\
&\quad + (a_1^2 b_2^2 - 2 a_1 a_2 b_1 b_2 + a_2^2 b_1^2)
\end{aligned} \tag{3}
```

一方、$`|a|^2 |b|^2`$ と $`(a^\top b)^2`$ はそれぞれ、

```math
\begin{aligned}
|a|^2 |b|^2
&= (a_1^2 + a_2^2 + a_3^2)(b_1^2 + b_2^2 + b_3^2) \\
&= a_1^2 b_1^2 + a_1^2 b_2^2 + a_1^2 b_3^2 + a_2^2 b_1^2 + a_2^2 b_2^2 + a_2^2 b_3^2 + a_3^2 b_1^2 + a_3^2 b_2^2 + a_3^2 b_3^2
\end{aligned}
```

```math
\begin{aligned}
(a^\top b)^2
&= (a_1 b_1 + a_2 b_2 + a_3 b_3)^2 \\
&= a_1^2 b_1^2 + a_2^2 b_2^2 + a_3^2 b_3^2 + 2 a_1 a_2 b_1 b_2 + 2 a_1 a_3 b_1 b_3 + 2 a_2 a_3 b_2 b_3
\end{aligned}
```

です。引き算すると $`a_1^2 b_1^2`$、$`a_2^2 b_2^2`$、$`a_3^2 b_3^2`$ が消えて、

```math
\begin{aligned}
|a|^2 |b|^2 - (a^\top b)^2
&= a_1^2 b_2^2 + a_1^2 b_3^2 + a_2^2 b_1^2 + a_2^2 b_3^2 + a_3^2 b_1^2 + a_3^2 b_2^2 \\
&\quad - 2 a_1 a_2 b_1 b_2 - 2 a_1 a_3 b_1 b_3 - 2 a_2 a_3 b_2 b_3
\end{aligned}
```

となり、(3) の最後の式と項が全部一致します。つまり、

```math
|a \times b|^2 = |a|^2 |b|^2 - (a^\top b)^2
```

です（ラグランジュの恒等式）。ここに内積の式 $`a^\top b = |a||b|\cos\theta`$ を入れると、

```math
\begin{aligned}
|a \times b|^2
&= |a|^2 |b|^2 - |a|^2 |b|^2 \cos^2\theta \\
&= |a|^2 |b|^2 (1 - \cos^2\theta) \\
&= |a|^2 |b|^2 \sin^2\theta
\end{aligned}
```

で、$`0 \le \theta \le \pi`$ なら $`\sin\theta \ge 0`$ なので、平方根を取って

```math
|a \times b| = |a||b|\sin\theta
```

が出てきます。これは $`a`$ と $`b`$ を2辺とする平行四辺形の面積（底辺 $`|a|`$ × 高さ $`|b|\sin\theta`$）と同じです。

数値例でも両側を計算して確認します。

```math
\begin{aligned}
|a \times b|^2 &= (-3)^2 + 6^2 + (-3)^2 = 9 + 36 + 9 = 54, \\
|a|^2 |b|^2 - (a^\top b)^2 &= 14 \times 77 - 32^2 = 1078 - 1024 = 54
\end{aligned}
```

## 性質3：順番を入れ替えると符号が反転する

定義の各成分で $`a`$ と $`b`$ を入れ替えると、

```math
b \times a
= \begin{pmatrix} b_2 a_3 - b_3 a_2 \\ b_3 a_1 - b_1 a_3 \\ b_1 a_2 - b_2 a_1 \end{pmatrix}
= \begin{pmatrix} -(a_2 b_3 - a_3 b_2) \\ -(a_3 b_1 - a_1 b_3) \\ -(a_1 b_2 - a_2 b_1) \end{pmatrix}
= -(a \times b)
```

です。数値例では $`b \times a = (3, -6, 3)^\top`$ になります。向きは右ねじの法則で決まり、$`a`$ から $`b`$ へ右ねじを回したときにねじが進む向きが $`a \times b`$ の向きです。

# NumPy で計算する

ここまでの数値例を NumPy で検算するとこうなります。

```python
import numpy as np

a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

# 内積
print(a @ b)            # 32

# 外積（outer product）
print(np.outer(a, b))
# [[ 4  5  6]
#  [ 8 10 12]
#  [12 15 18]]

# 外積（ベクトル積）
print(np.cross(a, b))   # [-3  6 -3]

# 転置
A = np.array([[1, 2, 3],
              [4, 5, 6]])
print(A.T)
# [[1 4]
#  [2 5]
#  [3 6]]
```

ひとつ注意で、NumPy の1次元配列には縦・横の区別がないので、`a.T` を書いても形は `(3,)` のままで何も変わりません。式どおり $`a b^\top`$ を行列積で書きたいときは、`reshape` で縦ベクトル・横ベクトルにしてから掛けます。

```python
print(a.T.shape)                          # (3,)
print(a.reshape(-1, 1) @ b.reshape(1, -1))  # np.outer(a, b) と同じ結果
```

# まとめ

- 転置は $`(A^\top)_{ij} = A_{ji}`$。積の転置は $`(AB)^\top = B^\top A^\top`$ で順番が逆になる
- 内積 $`a^\top b`$ は「横 × 縦」でスカラー。余弦定理から $`|a||b|\cos\theta`$ になる
- 外積（outer product）$`a b^\top`$ は「縦 × 横」で行列。成分は $`a_i b_j`$ で、トレースを取ると内積に戻る
- 外積（ベクトル積）$`a \times b`$ は3次元専用で、$`a`$ と $`b`$ に垂直、大きさは $`|a||b|\sin\theta`$

内積と外積（outer product）は、「縦と横、どっちを先に掛けるか」だけで結果の形がまるっと変わるのよ🙌 「外積」と書いてあったら、outer product とベクトル積のどっちの意味なのかを確かめてから読むのがおすすめです。

内積とベクトル積は、ベクトル解析の発散（div）と回転（rot）にもそのまま出てきます。そちらは「[ナブラ演算子と勾配・発散・回転を簡単にまとめる](https://qiita.com/nico0748/items/6c7ca1cb5787931e27a3)」にまとめました。

途中式でもっとわかりやすい導き方があれば、有識者の方教えて欲しいです！

# 参考

- [numpy.outer — NumPy Manual](https://numpy.org/doc/stable/reference/generated/numpy.outer.html)
- [numpy.cross — NumPy Manual](https://numpy.org/doc/stable/reference/generated/numpy.cross.html)
- [numpy.matmul — NumPy Manual](https://numpy.org/doc/stable/reference/generated/numpy.matmul.html)
