---
title: AIエージェントのためのインターネット！？Agentic Internetについて詳しく見てみる！
tags:
  - AIエージェント
  - MCP
  - A2A
  - セキュリティ
  - Web
private: true
---
<!--
  Agentic Internet の解説（公開前にこのコメントは削除）

  書き方メモ
  - 語調はスキル nico-tech-article-tone に従う（個性は導入・見出し・まとめ・記事末に3〜5か所まで）。
  - 2026-10-27 時点の公開情報でまとめている。数字・仕様のバージョン・団体の状況は変わりやすいので、
    公開直前に「参考」の一次情報（Google、Anthropic、IETF、Cloudflare など）を読み直す。
  - 「Agentic Internet」には公式の定義がない。特定の規格名のように書かない。
  - 未確認で本文に入れていないもの
    - 「A2A が 2026年8月に Agentic AI Foundation（AAIF）に移った」という話：一次情報が見つからなかった
      （確認できたのは、2025年6月に Linux Foundation に寄贈されたところまで）。
    - AP2 が A2A v1.0 の機能かどうか：Google は「A2A や MCP の拡張として使える別プロトコル」と説明している。v1.0 の機能としては書かない。
  - 数字の出どころ
    - ボットが HTML リクエストの約57%：Cloudflare Radar（Matthew Prince 氏の 2026-06-03 の X 投稿と各社の報道）。
      Cloudflare の公式ブログ記事は見つけられていない。
    - エージェントのトラフィックが7,851%増：HUMAN Security の 2026 年版レポート。
    - 8月→9月で3倍：MIT Technology Review の記事が HUMAN Security の調べとして紹介。
  - 図の候補：層の図（人 → エージェント →〔MCP〕ツール／〔A2A〕ほかのエージェント／〔Web Bot Auth・NLWeb・402〕Webサイト／〔AP2・ACP〕支払い）。
  - MCP の詳しい話は no.7（MCPサーバーの記事）にリンクする。
-->

# はじめに

最近、ニュースで「Agentic Internet（エージェンティック・インターネット）」という言葉をよく見かけるようになりました。AIエージェントのためのインターネット…？インターネットがもう1本できるの？と気になったので、何を指している言葉なのかを調べてみました。

:::note info
この記事は、2026年10月27日時点の公開情報をもとにしています。この分野は仕様や数字の更新が早いので、最新の情報は「参考」の一次情報を確認してください。
:::

# Agentic Internetって何？

先に結論を書くと、**Agentic Internet は特定の規格や製品の名前ではありません**。
「人の代わりにAIエージェントがWebを使う時代に向けて、インターネットの上に足されつつある仕組み全体」を指す言葉として使われています。新しいネットワークを別に作るわけではなく、今のインターネット（HTTP や DNS など）の上に、エージェント向けのルールや入口を足していく話です。

公式の定義はなく、使う人によって少しずつ意味が違います。たとえば Apify のブログでは、次のように分けています。

| 言葉 | 指しているもの |
| --- | --- |
| Agentic Internet | エージェント同士が見つけ合い、やり取りするためのプロトコル全体（土台の層） |
| Agentic Web | エージェントが読んだり操作したりしやすいように作られたWebサイト（ブラウザから見える層） |

一方で、MIT Technology Review の記事などでは、もっとゆるく「エージェントが人の代わりに予約や買い物をするようになったWeb」という意味で使われています。
この記事では、広い意味で **「エージェントが使う前提で足されているインターネットの仕組み」** として扱います。

# なぜ今話題になっているのか？

いちばん大きな理由は、**Webに来るアクセスの中身が変わってきた** ことです。

- Cloudflare の CEO の Matthew Prince 氏は、2026年6月3日に、自社の観測でボットのアクセスが人のアクセスを初めて上回ったと X で発表しました。Cloudflare Radar では、HTML ページへのリクエストのうち約57%がボットとされています（各社の報道による）
- セキュリティ企業 HUMAN Security の2026年版レポートでは、AIエージェントやエージェント型ブラウザからのトラフィックが、前年から **7,851%** 増えたとされています
- MIT Technology Review（2026年10月19日）は、HUMAN Security の調べとして、エージェントのトラフィックが2026年8月から9月の1か月で3倍になったと紹介しています

ただし、これらは各社が自分のネットワークで観測した数字で、インターネット全体を数えたものではありません。また「リクエストの数」なので、人が読んでいる量や買い物の量とは別物です。
それでも、「Webの訪問者が人だけではなくなった」こと自体は、複数の会社の観測で一致しています。

# 人が使うインターネットと、何が違うのか？

人がWebを使うときと、エージェントが使うときでは、困るところが違います。

| 比べるところ | 人が使うとき | エージェントが使うとき |
| --- | --- | --- |
| 画面 | 見た目で分かればいい | HTML の見た目より、意味の分かるデータや API がほしい |
| 誰が来たか | ログインやCAPTCHAで確かめる | CAPTCHA は解けない（解けても困る）。「どの会社のエージェントか」を別の方法で示す必要がある |
| 何をしてよいか | 本人が画面で判断する | 「この人は本当にこの操作を頼んだのか」を後から確かめられる必要がある |
| 支払い | 本人がカードを入力する | カード情報をエージェントに渡さずに払わせたい |
| アクセスの量 | 1人が見るページは限られる | 1つの依頼で大量のページを読みに行くことがある |

この「困るところ」を1つずつ埋めるために、いろいろな仕組みが作られています。

# どんな仕組みが足されているのか？

役割ごとに分けると、だいたい次の5つの層になります。

| 層 | 何をつなぐか | 代表的な仕組み |
| --- | --- | --- |
| ① ツールとつなぐ | エージェント ⇔ ツール・データ | MCP |
| ② エージェント同士をつなぐ | エージェント ⇔ ほかのエージェント | A2A |
| ③ Webサイトとつなぐ | エージェント ⇔ Webサイト | NLWeb など |
| ④ 身元を示す | エージェント → Webサイト | Web Bot Auth |
| ⑤ お金を払う | エージェント → お店・サイト | HTTP 402（Pay per crawl）、AP2、ACP |

## ① ツールとつなぐ：MCP

MCP（Model Context Protocol）は、Anthropic が2024年11月に公開した、エージェントが外部のツールやデータにつながるための共通のやり方です。エージェントがクライアント、ツールの側がサーバーになって、「この機能を呼ぶ → 結果を受け取る」をやり取りします。

MCP は2025年12月に、Linux Foundation の下にできた **Agentic AI Foundation（AAIF）** に寄贈されました。AAIF は Anthropic・Block・OpenAI が共同で立ち上げた団体で、MCP のほかに Block の goose、OpenAI の AGENTS.md も最初のプロジェクトとして入っています。
特定の会社のものではなく、中立の団体で管理されることで、各社が安心して採用できるようにするのがねらいです。

MCP サーバーを実際に立てる手順や、セキュリティで気をつけることは、以前の記事にまとめています。
https://qiita.com/nico0748/items/a2e5c48aa746c3010923

## ② エージェント同士をつなぐ：A2A

A2A（Agent2Agent）は、Google が2025年4月に発表した、**別の会社・別の仕組みで作られたエージェント同士が仕事を頼み合う** ための共通のやり方です。2025年6月に Linux Foundation に寄贈されました。

MCP との違いは、相手が「ツール」か「エージェント」かです。

- MCP：決まった機能を呼んで、結果を受け取る（相手は道具）
- A2A：仕事を丸ごと頼んで、進み具合や結果を受け取る（相手は自分で考えて動くエージェント）

A2A では、エージェントが **Agent Card** という JSON のファイルを決まった URL に置いて、「自分は何ができるか」「どう認証すればいいか」を公開します。頼む側はそれを読んで、仕事を任せる相手を選びます。
2026年3月に出た最初の安定版（v1.0）では、Agent Card に署名を付けて、なりすましたエージェントを見分けられるようにする **Signed Agent Cards** が入りました。

## ③ Webサイトとつなぐ：NLWeb など

今のWebサイトは人が見るために作られているので、エージェントは HTML を読み解いたり、画面を操作したりする必要があります。そこで、Webサイトの側からエージェント向けの入口を用意する動きがあります。

その1つが、Microsoft が2025年5月に発表したオープンなプロジェクト **NLWeb** です。サイトがすでに持っている Schema.org や RSS などのデータを使って、サイトに自然な言葉で質問できる入口を作ります。NLWeb で作った入口は MCP サーバーとしても動くので、エージェントからそのまま使えます。

## ④ 身元を示す：Web Bot Auth

サイトの側から見ると、「来ているのは本当にその会社のエージェントなのか」が分からないのが困りどころです。User-Agent（ブラウザの名乗り）は自由に書き換えられるので、名乗りだけでは信用できません。

そこで IETF（インターネットの標準を決める団体）で作られているのが **Web Bot Auth** です。

- エージェントを動かす会社は、鍵のペアを作って、公開鍵を自社ドメインの決まった URL（`/.well-known/http-message-signatures-directory`）に置く
- エージェントは、送るリクエストに秘密鍵で署名を付ける（HTTP Message Signatures、RFC 9421 を使う）
- サイトは公開鍵で署名を確かめて、「この会社のエージェントから来た」ことを確認する

2026年9月には IETF のワーキンググループの文書（draft-ietf-webbotauth-httpsig-protocol-00）になりました。著者は Cloudflare と Google の人で、まだ標準として確定したものではありません。
大事なのは、**署名で分かるのは「誰が送ったか」だけで、「その操作をしてよいか」は分からない** という点です。ドラフトにも、署名が正しいだけでは操作が許されたことにはならないと書かれています。何を許すかは、サイトの側で決める必要があります。

## ⑤ お金を払う：HTTP 402、AP2、ACP

エージェントがお金を払う場面は、大きく2つあります。

**サイトの中身を読むときに払う**
Cloudflare は2025年7月に、AIのクローラーに読み取りの料金を請求できる **Pay per crawl** を始めました。HTTP には昔から「402 Payment Required（支払いが必要）」という、ほとんど使われていなかったステータスコードがあり、これを使って「このページは1回いくら」と返します。
2026年7月には、これを「読んだとき」ではなく「中身が実際に使われたとき」に払う形（Pay Per Use）へ広げると発表しています。

**買い物をするときに払う**
- **AP2（Agent Payments Protocol）**：Google が2025年9月に発表した。「本人が本当にこの買い物を頼んだ」ことを、署名付きの指示書（マンデート）で後から確かめられるようにする。A2A や MCP の拡張として使える
- **ACP（Agentic Commerce Protocol）**：OpenAI と Stripe が一緒に作ったオープンな仕様。ChatGPT の中で買い物を完結させる仕組みに使われている

どちらも、**カード情報そのものをエージェントに渡さずに払わせる** ことと、**本人の同意を確かめられるようにする** ことを大事にしています。

# 便利なだけでいいのか？気になるところ

仕組みが整う一方で、心配されていることもあります。

**サイトがエージェントを締め出す**
MIT Technology Review の記事では、エージェントのアクセスを禁止するサイトや、エージェントをめぐって裁判になっている例が紹介されています。サイトによって「エージェントは入れない」「エージェント専用の入口を使って」と対応がばらばらになりつつあります。

**人にとって使いにくくなるおそれ**
同じ記事では、エージェント向けに最適化が進むと、人が自分で見比べるための画面がおろそかになったり、エージェントごとに違う値段を見せられたりするおそれも指摘されています。

**セキュリティ**
エージェントがいろいろなサイトやほかのエージェントとつながるほど、次のようなリスクが増えます。

- **なりすまし**：別のエージェントや会社になりすまして、仕事を受けたりアクセスしたりする。Signed Agent Cards や Web Bot Auth は、これに対する仕組み
- **プロンプトインジェクション**：読みに行ったWebページやほかのエージェントの返事に、指示を紛れ込ませてエージェントを操る
- **権限の持たせすぎ**：買い物や送信などの操作を、本人の確認なしにできてしまう。AP2 のマンデートのように「本人が頼んだ範囲」を確かめる仕組みが要る

身元を確かめる仕組みができても、**相手が信用できるかどうか、何を任せてよいかは別の問題** なのは、人のインターネットと同じです。

# まとめ

- Agentic Internet は規格の名前ではなく、「エージェントが使う前提で、今のインターネットの上に足されつつある仕組み全体」を指す言葉
- 背景には、Webへのアクセスのうちボットやエージェントの割合が大きく増えていることがある
- 仕組みは、ツールとつなぐ（MCP）、エージェント同士をつなぐ（A2A）、Webサイトとつなぐ（NLWeb など）、身元を示す（Web Bot Auth）、お金を払う（HTTP 402・AP2・ACP）の層に分けて見ると整理しやすい
- 身元が分かっても「何を許すか」は別の問題で、締め出しやセキュリティの課題はまだ残っている

インターネットがもう1本できるわけではなく、今のインターネットにエージェント用の入口や名札が少しずつ増えていく、というイメージです。

ほかにも「この層にはこんな仕組みもある」という情報があれば、有識者の方教えて欲しいです！

# 参考

（2026年10月27日に確認）

- [Two protocols building the agentic internet（Apify Blog）](https://blog.apify.com/mcp-a2a-agentic-internet/)
- [Making the internet better for AI agents might make it worse for everyone else（MIT Technology Review, 2026-10-19）](https://www.technologyreview.com/2026/10/19/1147186/making-the-internet-better-for-ai-agents-might-make-it-worse-for-everyone-else/)
- [The Rise of the Agentic Internet（CIO.inc）](https://www.cio.inc/rise-agentic-internet-a-31997)
- [The 2026 State of AI Traffic & Cyberthreat Benchmark Report（HUMAN Security）](https://www.humansecurity.com/learn/resources/2026-state-ai-traffic-cyberthreat-benchmarks/)
- [Bots have now surpassed human traffic online, says Cloudflare CEO（hello partner）](https://hellopartner.com/2026/06/08/bots-have-now-surpassed-human-traffic-online-says-cloudflare-ceo/)
- [Donating the Model Context Protocol and establishing the Agentic AI Foundation（Anthropic）](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation)
- [A year of open collaboration: Celebrating the anniversary of A2A（Google Open Source Blog）](https://opensource.googleblog.com/2026/04/a-year-of-open-collaboration-celebrating-the-anniversary-of-a2a.html)
- [Introducing NLWeb: Bringing conversational interfaces directly to the web（Microsoft）](https://news.microsoft.com/source/features/company-news/introducing-nlweb-bringing-conversational-interfaces-directly-to-the-web/)
- [HTTP Message Signatures for automated traffic（IETF, draft-ietf-webbotauth-httpsig-protocol）](https://datatracker.ietf.org/doc/html/draft-ietf-webbotauth-httpsig-protocol)
- [Cloudflare Allows the Agentic Internet to Flourish with a Simple Philosophy: Your Content, Your Rules（Cloudflare, 2026-07-01）](https://www.cloudflare.com/press/press-releases/2026/cloudflare-allows-the-agentic-internet-to-flourish-with-a-simple-philosophy-your-content-your-rules/)
- [Cloudflare can now charge AI crawlers to access your content（TechRadar）](https://www.techradar.com/pro/cloudflare-will-now-block-ai-crawlers-on-your-website-and-even-force-them-to-pay-you)
- [Agent Payments Protocol（AP2）の発表（Google Cloud ブログ）](https://cloud.google.com/blog/ja/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol)
- [OpenAI launches in-chat Shopping for ChatGPT, Partners with Stripe on Open-Source Payment Protocol（Maginative）](https://www.maginative.com/article/openai-launches-in-chat-shopping-for-chatgpt-partners-with-stripe-on-open-source-payment-protocol/)
