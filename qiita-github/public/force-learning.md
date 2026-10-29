---
title: カオス的に動くネットワークを学習させる「FORCE学習」を簡単にまとめる
tags:
  - 機械学習
  - リザバーコンピューティング
  - 計算論的神経科学
private: false
updated_at: '2026-10-30T05:14:47+09:00'
id: 4cb4fa4c0220aea6ddc4
organization_url_name: null
slide: false
ignorePublish: false
posting_campaign_uuid: null
agreed_posting_campaign_term: false
---
# はじめに

[リザバーコンピューティング](https://qiita.com/nico0748/items/0e858bcbcd80ef0cd8a5)を調べていたら FORCE学習という名前が出てきたので、ついでにまとめておきます。

# ひとことで言うと

**カオス的に動く再帰型ネットワークの出力を、ネットワークに戻しながら、読み出しの重みをオンラインで少しずつ直して、狙った出力を出させる学習方法**です。
Sussillo と Abbott が 2009 年に提案しました。名前は First-Order Reduced and Controlled Error の略です。

# 仕組み

ネットワークの形は、リザバーコンピューティングとほぼ同じです。まずはざっくりした全体像から。

![FORCE学習の概念図](https://raw.githubusercontent.com/nico0748/tech-boosters/46852adc57a25e547e899bb2f3cb36bb1d835a35/compact/drafts/no.6-force-learning/image/01_FORCE%E5%AD%A6%E7%BF%92%E3%81%AE%E6%A6%82%E5%BF%B5%E5%9B%B3.png)
*図1：FORCE学習の全体像。ネットワークは出力をフィードバックしながら動き、学習中だけ、誤差を使って読み出し $`w`$ を直すループが回る*

中身をもう少し細かく描くと、こうなります。

![FORCE学習のアーキテクチャ](https://raw.githubusercontent.com/nico0748/tech-boosters/46852adc57a25e547e899bb2f3cb36bb1d835a35/compact/drafts/no.6-force-learning/image/02_FORCE%E5%AD%A6%E7%BF%92%E3%81%AE%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3.png)
*図2：FORCE学習の構成。再帰結合 $`J`$ と出力フィードバック $`w_f`$ は固定で、読み出し $`w`$ だけを、誤差 $`e(t)`$ を使って RLS で毎ステップ直す*

- 中の再帰結合 $`J`$ はランダムで固定する（ネットワークはカオス的に動く）
- 出力 $`z(t) = w^\top r(t)`$ を作る読み出しの重み $`w`$ だけを学習する
- 出力 $`z(t)`$ を、ネットワークへの入力として戻す（フィードバック）

ここで問題になるのが、フィードバックです。
出力が間違っていると、その間違いがネットワークに戻って、動きがどんどんずれてしまいます。

FORCE学習では、**学習の最初から誤差を小さく抑え続ける**ことで、この問題を避けます。

1. 毎ステップ、出力と目標の誤差 $`e(t) = z(t) - f(t)`$ を計算する
2. 再帰最小二乗法（RLS）で、$`w`$ を大きめに直して、誤差をすぐ小さくする
3. 誤差が小さいまま学習を続けると、そのうち $`w`$ がほとんど変わらなくなる
4. 学習を止めても、ネットワークは目標の出力を出し続ける

RLS の更新は、次のようになります。

```math
P(t) = P(t - \Delta t) - \frac{P(t - \Delta t)\, r(t)\, r(t)^\top P(t - \Delta t)}{1 + r(t)^\top P(t - \Delta t)\, r(t)}
```

```math
w(t) = w(t - \Delta t) - e(t)\, P(t)\, r(t)
```

$`e(t)`$ は、重みを直す前の $`w(t - \Delta t)`$ で計算した誤差です。$`P`$ は、リザバーの状態 $`r`$ の相関行列の逆行列を、逐次的に推定したものです。

# NumPy で書いてみる

RLS の更新を、そのまま NumPy で書くとこうなります。目標は 2 つのサイン波を足した波形です。

```python
import numpy as np

rng = np.random.default_rng(0)
N, g, dt, tau = 500, 1.5, 0.1, 1.0      # ニューロン数、結合の強さ、時間刻み、時定数
T_train, T_test = 3000, 1000             # 学習・テストのステップ数

J = g * rng.standard_normal((N, N)) / np.sqrt(N)   # 再帰結合（固定）
w_f = rng.uniform(-1, 1, N)                        # 出力フィードバック（固定）
w = np.zeros(N)                                    # 読み出し（これだけ学習）
P = np.eye(N)                                      # 相関行列の逆行列の推定値

t = np.arange(T_train + T_test) * dt
f = np.sin(t / 4) + 0.5 * np.sin(t / 2)              # 目標の出力

x = 0.5 * rng.standard_normal(N)
r = np.tanh(x)
z = w @ r
out = []
for i in range(len(t)):
    x += dt / tau * (-x + J @ r + w_f * z)
    r = np.tanh(x)
    z = w @ r
    if i < T_train:
        e = z - f[i]                               # 直す前の w での誤差
        Pr = P @ r
        P -= np.outer(Pr, Pr) / (1 + r @ Pr)
        w -= e * (P @ r)
    out.append(z)

out = np.array(out)
print("テスト区間の誤差 (RMSE):", np.sqrt(np.mean((out[T_train:] - f[T_train:]) ** 2)))
```

手元で動かすと、学習を止めたあとのテスト区間でも RMSE が 0.003 くらいで、目標の波形を出し続けてくれました。
パラメータは原論文（$`N=1000`$、$`g=1.5`$ など）より小さくして、すぐ動くようにしています。

# 学習の過程を見てみる

上のコードとほぼ同じ設定（目標も同じ波形）で、学習前 → 学習中 → 学習後と続けて動かしたときの様子を図にしました。

![FORCE学習の学習過程](https://raw.githubusercontent.com/nico0748/tech-boosters/46852adc57a25e547e899bb2f3cb36bb1d835a35/compact/drafts/no.6-force-learning/image/03_FORCE%E5%AD%A6%E7%BF%92%E3%81%AE%E5%AD%A6%E7%BF%92%E9%81%8E%E7%A8%8B.png)
*図3：学習の過程。上から、出力 $`z(t)`$ と目標 $`f(t)`$、リザバーの中のニューロン 3 個の活動 $`r_i(t)`$、1ステップあたりの重みの変化量 $`\|\Delta w\|`$（対数軸、移動平均）*

1. **学習前**：読み出し $`w`$ は小さなランダム値です。ニューロンの活動は不規則（カオス的）で、出力も目標とはまったく合いません
2. **学習中**：RLS を動かすと、出力はほぼ一瞬で目標に重なります。誤差が小さいままなので、フィードバックで戻ってくる信号もほぼ「正しい出力」になり、ニューロンの活動も目標と同じリズムにそろっていきます。重みの変化量は、時間がたつにつれてだんだん小さくなります
3. **学習後**：RLS を止めて $`w`$ を固定しても、ネットワークは目標の波形を出し続けます

「最初から誤差を小さく抑える」→「そのうち $`w`$ が落ち着く」→「止めても大丈夫」という流れが、そのまま見えるのがおもしろいところです。
図は $`N=500`$、学習前に少し空回しして初期状態の影響を消してから描いています。

# 基本的なリザバーコンピューティングとの違い

| | 基本的なESN | FORCE学習 |
| --- | --- | --- |
| 学習のタイミング | データを全部集めてから一度に解く | 1ステップごとにオンラインで直す |
| 出力のフィードバック | なくてもよい | あり（これを安定させるのが目的） |
| 誤差の扱い | 最後に最小化する | 最初から小さく抑え続ける |

# どこで使われているか

- 脳の神経回路が、どうやって複雑な時系列（運動のパターンなど）を作っているのかを調べるモデル
- スパイキングニューロンのネットワークにも応用されている（Nicola と Clopath, 2017）

# まとめ

「誤差を最初から小さく保つことで、カオスを手なずける」のが FORCE学習のミソでした。
手元のコードでも、RLS を止めたあとのテスト区間で RMSE が 0.003 くらいに収まり、学習後も目標の波形を出し続けました。
ただし、パラメータは原論文より小さくしているので、論文と同じ規模で同じように動くかまでは確かめていません。
理解が浅いところがあれば、有識者の方教えて欲しいです！

# 参考

- D. Sussillo, L. F. Abbott, "Generating coherent patterns of activity from chaotic neural networks", Neuron, 63(4), 2009 <https://doi.org/10.1016/j.neuron.2009.07.018>
- W. Nicola, C. Clopath, "Supervised learning in spiking neural networks with FORCE training", Nature Communications, 8, 2017 <https://doi.org/10.1038/s41467-017-01827-3>
