---
title: ナブラ演算子と勾配・発散・回転を簡単にまとめる
tags:
  - 数学
  - ベクトル解析
  - 物理
private: true
---
<!--
  コンパクト記事 no.3（草稿。公開前にこのコメントは削除）
  - 足したいもの：勾配・発散・回転のイメージ図（pptx→png、図のルールに従う）
  - 関連：no.2 転置と内積・外積（発散は内積、回転はベクトル積の形）
-->

# はじめに

$\nabla$ が出てくると身構えてしまうので、勾配・発散・回転の3つを1枚にまとめてみました。

# ひとことで言うと

ナブラ演算子 $\nabla$ は「各方向の偏微分を並べたベクトル」のような記号で、何にどう掛けるかで3つの意味になります。

$$
\nabla = \left( \frac{\partial}{\partial x}, \frac{\partial}{\partial y}, \frac{\partial}{\partial z} \right)
$$

| 名前 | 書き方 | 入力 | 出力 | 意味 |
|---|---|---|---|---|
| 勾配（grad） | $\nabla f$ | スカラー場 | ベクトル場 | いちばん急に増える向きと、その増え方 |
| 発散（div） | $\nabla \cdot F$ | ベクトル場 | スカラー場 | その点から湧き出している量 |
| 回転（rot / curl） | $\nabla \times F$ | ベクトル場 | ベクトル場 | その点のまわりの渦の強さと軸の向き |

# 勾配（grad）

スカラー場 $f(x, y, z)$ に $\nabla$ を掛けます。

$$
\nabla f = \left( \frac{\partial f}{\partial x}, \frac{\partial f}{\partial y}, \frac{\partial f}{\partial z} \right)
$$

- 例：山の標高を $f$ とすると、$\nabla f$ はいちばん急な登り坂の向きを指す
- 機械学習の勾配降下法は、損失関数の勾配と逆向き（$-\nabla L$）にパラメータを動かす

# 発散（div）

ベクトル場 $F = (F_x, F_y, F_z)$ と $\nabla$ の**内積**をとります。

$$
\nabla \cdot F = \frac{\partial F_x}{\partial x} + \frac{\partial F_y}{\partial y} + \frac{\partial F_z}{\partial z}
$$

- 正なら湧き出し、負なら吸い込み
- 例：水の流れで、蛇口のあたりは発散が正、排水口のあたりは発散が負

# 回転（rot / curl）

ベクトル場 $F$ と $\nabla$ の**ベクトル積**をとります。

$$
\nabla \times F = \left(
\frac{\partial F_z}{\partial y} - \frac{\partial F_y}{\partial z},\;
\frac{\partial F_x}{\partial z} - \frac{\partial F_z}{\partial x},\;
\frac{\partial F_y}{\partial x} - \frac{\partial F_x}{\partial y}
\right)
$$

- 例：渦を巻く流れでは、回転のベクトルが渦の軸の向きを指す
- 向きは右ねじの法則で決まる

# 覚えておくと便利な性質

- $\nabla \times (\nabla f) = 0$：勾配の回転は0
- $\nabla \cdot (\nabla \times F) = 0$：回転の発散は0
- $\nabla \cdot (\nabla f) = \nabla^2 f$：勾配の発散はラプラシアン

# まとめ

$\nabla$ を「偏微分のベクトル」と思えば、grad はスカラー倍、div は内積、rot はベクトル積と覚えられるのよ。
もっと直感的な説明があれば、有識者の方教えて欲しいです！

# 参考

- （ベクトル解析の教科書を追記）
