---
title: Langシリーズは何ができるの？LangChain・LangGraph・LangSmith・Langfuseの違いを整理してみる
tags:
  - LangChain
  - LangGraph
  - LangSmith
  - Langfuse
  - LLM
private: false
updated_at: ''
id: null
organization_url_name: null
slide: false
ignorePublish: false
---

# はじめに

最近、業務や個人開発でLangChain、LangGraph、LangSmith、Langfuse…といった"Lang"シリーズを頻繁に使う機会が増えてきたので、今回はそれぞれの役割を体系的に整理してみました。

# ざっくり全体像

ということで一旦簡単にまとめてみました

| 名前 | ひとことで | 種類 | 提供元 |
| --- | --- | --- | --- |
| LangChain | LLMアプリの部品をつなぐフレームワーク | ライブラリ（オープンソース） | LangChain社 |
| LangGraph | エージェントの処理の流れをグラフで組み立てる実行基盤 | ライブラリ（オープンソース） | LangChain社 |
| LangSmith | LLMアプリの動きを記録・評価・監視するプラットフォーム | クラウドサービス（有料プランあり） | LangChain社 |
| Langfuse | LLMアプリの動きを記録・評価・監視するプラットフォーム | オープンソース（自分のサーバーでも動かせる） | Langfuse（2026年からClickHouse社の傘下） |

Langシリーズとかいう括りでまとめたけど、Langfuseは提供元が違うという...
役割で分けると、こんな感じに↓↓↓

- **作る**：LangChain、LangGraph
- **見る・測る**：LangSmith、Langfuse

# LangChain：部品をつなぐフレームワーク

LangChainは、LLMアプリでよく使う部品を、共通の書き方で扱えるようにするPython / JavaScriptのライブラリです。

## 何ができるのか

- **モデルの切り替え**：OpenAI、Anthropic、Googleなど、各社のモデルを同じ書き方で呼べる。モデルを差し替えても、周りのコードをほとんど変えずに済む
- **プロンプトのテンプレート**：変数を埋め込むプロンプトを部品として管理できる
- **ツール呼び出し**：LLMに関数（検索、計算、API呼び出しなど）を使わせる仕組み
- **RAGの部品**：文書の読み込み、分割、埋め込み、ベクトルストアへの保存と検索
- **エージェント**：LLMがツールを選んで使いながらタスクを進める仕組みを、少ないコードで作れる

図1は、LangChain単体でエージェントを作ったときの構成です。プロンプトにユーザーの入力を埋め込んでチャットモデルに渡し、モデルが必要と判断すればツールを呼んで、その結果を受け取ってから回答を返します。モデルの提供元が変わっても、この形は変わりません。

![LangChain単体の構成](https://raw.githubusercontent.com/nico0748/tech-boosters/c2c73583c612107f6bde5f0d2f9a79beef39d8b8/other/drafts/no.9-lang-series/image/01_LangChain%E5%8D%98%E4%BD%93%E3%81%AE%E6%A7%8B%E6%88%90.png)
*図1：LangChain単体の構成。モデルの呼び出しとツールの実行を、共通の書き方でつなぐ*

## どんなときに使うか

「とりあえずLLMにツールを持たせて動かしたい」「RAGを手早く組みたい」といった、よくある形のアプリを素早く作りたいときに向いています。
なお、1.0以降のLangChainのエージェントは、内部でLangGraphの上に作られています。

# LangGraph：処理の流れをグラフで組み立てる

LangGraphは、エージェントの処理を「ノード（処理）」と「エッジ（次にどこへ進むか）」のグラフとして書くためのライブラリです。

## 何ができるのか

- **分岐とループ**：「結果が不十分ならもう一度検索する」「条件によって別の処理へ進む」といった流れを、グラフとしてはっきり書ける
- **状態（ステート）の管理**：会話の履歴や途中の結果を、決まった形のデータとしてノード間で受け渡す
- **途中保存（チェックポイント）**：処理の途中の状態を保存して、失敗したところから再開したり、過去の状態に戻ったりできる
- **人の確認を挟む（human-in-the-loop）**：「メールを送る前に人が承認する」のように、処理を止めて人の判断を待てる
- **複数エージェントの連携**：役割の違うエージェントをノードとしてつなげられる

図2は、複数のエージェントをLangGraphでまとめた例です。スーパーバイザーが次の担当を決め、各エージェントの中身はLangChainで書きます。会話履歴や途中の結果は共有のState（状態）に入れて受け渡し、チェックポインタに保存しておくことで、失敗しても途中から再開できます。

![LangGraphによるオーケストレーション](https://raw.githubusercontent.com/nico0748/tech-boosters/c2c73583c612107f6bde5f0d2f9a79beef39d8b8/other/drafts/no.9-lang-series/image/02_LangGraph%E3%81%AB%E3%82%88%E3%82%8B%E3%82%AA%E3%83%BC%E3%82%B1%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3.png)
*図2：LangGraphによるオーケストレーション。分岐・人の確認・途中保存をグラフとして書ける*

## LangChainとどう使い分けるのか？

| やりたいこと | 向いているもの |
| --- | --- |
| よくある形のエージェントやRAGを手早く作る | LangChain |
| 処理の流れを細かく制御したい、長く動くエージェント、途中で人の確認を挟みたい | LangGraph |

LangChainで作って、制御が足りなくなったらLangGraphで書き直す（または組み合わせる）、という進め方が多いようです。
オーケストレーション構成の実装のために必要な感じ！

両方を組み合わせた例がRAGです（図3）。文書の読み込みからベクトルストアへの保存まではLangChainの部品で準備しておき、質問が来たときの「検索するか判断する → 検索する → 関連があるか確かめる → なければ質問を書き換えてもう一度」という流れをLangGraphで組みます。

![LangGraphで組むRAG](https://raw.githubusercontent.com/nico0748/tech-boosters/c2c73583c612107f6bde5f0d2f9a79beef39d8b8/other/drafts/no.9-lang-series/image/03_LangGraph%E3%81%A7%E7%B5%84%E3%82%80RAG.png)
*図3：LangGraphで組むRAG。部品はLangChain、流れの分岐とループはLangGraphが受け持つ*

# LangSmith：動きを記録して、評価する

LangSmithは、LangChain社が提供する、LLMアプリの開発と運用のためのプラットフォームです。

## 何ができるのか

- **トレース（記録）**：LLMへの入力と出力、ツール呼び出し、かかった時間、トークン数、費用などを、1回の処理ごとに木構造で見られる。エージェントが「どこで何を考えて、どのツールを呼んだか」を後から追える
- **評価**：テスト用のデータセットを用意して、プロンプトやモデルを変えたときに結果が良くなったか悪くなったかを比べられる。LLMに採点させる方法（LLM-as-a-judge）も使える
- **監視**：本番環境でのエラー率、応答時間、費用の推移を見られる
- **プロンプトの管理**：プロンプトのバージョンを管理して、試したり戻したりできる

LangChainやLangGraphとはそのまま連携できますが、それ以外のフレームワークや、フレームワークを使わずに書いたコードからも記録を送れます。

LangChainやLangGraphで作ったアプリなら、環境変数（`LANGSMITH_TRACING=true` など）を設定するだけで、SDKがトレースをLangSmithに送ってくれます（図4）。

![LangSmithを加えた構成](https://raw.githubusercontent.com/nico0748/tech-boosters/c2c73583c612107f6bde5f0d2f9a79beef39d8b8/other/drafts/no.9-lang-series/image/04_LangSmith%E3%82%92%E5%8A%A0%E3%81%88%E3%81%9F%E6%A7%8B%E6%88%90.png)
*図4：LangSmithを加えた構成。アプリからトレースを送り、開発者はブラウザで記録・評価・監視を確認する*

実際にLangSmithにログインすると、図6の画面になります。左のメニューに、トレース（Tracing）、監視（Monitoring）、データセットと実験（Datasets & Experiments）、評価（Evaluators）、プロンプト管理（Prompts）などが並んでいて、ここまでで紹介した機能がそのまま項目になっています。

![LangSmithのホーム画面](https://raw.githubusercontent.com/nico0748/tech-boosters/c2c73583c612107f6bde5f0d2f9a79beef39d8b8/other/drafts/no.9-lang-series/image/06_LangSmith_Home.png)
*図6：LangSmithのホーム画面。左のメニューから、トレース・監視・評価・プロンプト管理などを開ける*

# Langfuse：オープンソースで同じことをする

Langfuseは、LangSmithとよく似た役割を持つ、オープンソースのLLMエンジニアリング基盤です。

## 何ができるのか

- **トレース**：LLMの呼び出しやツールの実行を記録して、後から追える
- **評価**：データセットを使った評価や、LLMによる採点、人による採点を記録できる
- **プロンプトの管理**：プロンプトをバージョン管理して、アプリから呼び出せる
- **費用・利用状況の分析**：モデルごとのトークン数や費用を集計できる

## LangSmithとの一番の違いは？

**自分のサーバーで動かせること** です。
本体はMITライセンスのオープンソースで、Dockerなどを使って自社の環境に立てられます（一部の管理機能はエンタープライズ版のライセンスが必要）。
「LLMに送ったデータを外部のサービスに置きたくない」という場合に選ばれやすいです。

図5は、Langfuseを自分のAWSアカウントに立てる場合と、Langfuseのクラウド版を使う場合を並べたものです。アプリ側はLangfuseのSDKを組み込み、送信先（`LANGFUSE_BASE_URL`）を切り替えるだけで、どちらにもトレースを送れます。自分で立てる場合は、Web・Worker・データベース・キュー・ClickHouseなど、運用する部品が増える点に注意が必要です。

![Langfuseを加えた構成](https://raw.githubusercontent.com/nico0748/tech-boosters/c2c73583c612107f6bde5f0d2f9a79beef39d8b8/other/drafts/no.9-lang-series/image/05_Langfuse%E3%82%92%E5%8A%A0%E3%81%88%E3%81%9F%E6%A7%8B%E6%88%90.png)
*図5：Langfuseを加えた構成。自分のAWSで運用するか、クラウド版を使うかを選べる*

クラウド版には東京リージョン（`jp.cloud.langfuse.com`）もあり、トレースやプロンプト、評価のデータを日本国内に置いたまま使えるとされています（図7）。サイトのロゴの横に「by ClickHouse」と書かれているところからも、ClickHouse社の傘下に入ったことが分かります。

![Langfuseのトップページ](https://raw.githubusercontent.com/nico0748/tech-boosters/c2c73583c612107f6bde5f0d2f9a79beef39d8b8/other/drafts/no.9-lang-series/image/07_LangFuse_Home.png)
*図7：Langfuseのトップページ。日本（東京）リージョンのクラウド版が案内されている*

## 勘違いしていたこと

ざっくり全体像整理でも触れましたが、名前が似ているので、**LangfuseもLangChain社の製品だと思っていました**…

実際は、**LangfuseはLangChain社とは別に開発されてきたプロダクト** とのこと。
2026年1月には、データベースのClickHouse社に買収されたことが発表されています。発表では、オープンソースのまま開発を続け、自分のサーバーで動かせることも、クラウド版もそのまま続けるとされていますね。
LangChainやLangGraphとの連携機能はありますが、「Langシリーズ」として同じ会社が出しているわけではありません。

# 組み合わせ方の例

よくある組み合わせを並べてみます。

| やりたいこと | 組み合わせ |
| --- | --- |
| とにかく早く試作したい | LangChain ＋ LangSmith（無料枠） |
| 複雑なエージェントを作って、本番で運用したい | LangGraph ＋ LangSmith |
| データを外に出したくない | LangChain / LangGraph ＋ Langfuse（自分のサーバーに立てる） |
| フレームワークは使わず、記録だけほしい | 自前のコード ＋ LangSmith か Langfuse |

# まとめ

- **LangChain**：LLMアプリの部品を共通の書き方でつなぐフレームワーク
- **LangGraph**：エージェントの処理の流れをグラフで組み立てる実行基盤。分岐・ループ・途中保存・人の確認に強い
- **LangSmith**：LangChain社の、記録・評価・監視のプラットフォーム
- **Langfuse**：同じ役割を持つオープンソースの基盤。自分のサーバーで動かせる。LangChain社の製品ではない

「作る」がLangChainとLangGraph、「見る・測る」がLangSmithとLangfuse、と分けられそう🙌

# 参考

- [LangChain overview（LangChain公式ドキュメント）](https://docs.langchain.com/oss/python/langchain/overview)
- [LangGraph overview（LangChain公式ドキュメント）](https://docs.langchain.com/oss/python/langgraph/overview)
- [LangSmith Observability（LangChain公式ドキュメント）](https://docs.langchain.com/langsmith/home)
- [Langfuse ドキュメント](https://langfuse.com/docs)
- [Langfuse joins ClickHouse（Langfuse公式ブログ）](https://langfuse.com/blog/joining-clickhouse)
- [ClickHouse raises $400M Series D...（ClickHouse公式ブログ）](https://clickhouse.com/blog/clickhouse-raises-400-million-series-d-acquires-langfuse-launches-postgres)
