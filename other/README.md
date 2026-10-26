# other（自由記事）

3つのシリーズ（深ぼり隊・使いこなし隊・広めていき隊）に当てはまらない記事を、自由に書いて置いておく場所です。
ハマった話、ちょっとした小ネタ、作業ログ、感想など、テーマも長さも自由です。

ディレクトリと命名のルールは[リポジトリ直下のREADME](../README.md#記事ディレクトリのルール)に合わせます。

- 記事1本 = `drafts/no.<番号>-<slug>/` の1ディレクトリ
- 記事ファイルは `<slug>.md`（`qiita-github/public/` に移したときにほかの記事とかぶらない名前にする）
- その記事だけで使う画像は記事の `image/` に置く
- 語調はほかのシリーズと同じく口語調
- シリーズのロゴやテンプレートはありません。形式も自由です

## 中身
- [drafts/](drafts/) 下書き（記事1本 = 1ディレクトリ）
  - `no.1-qiita-direct-edit/` Qiita上で記事を直接直したら、GitHub Actionsの自動投稿が止まった話
  - `no.2-pentagi/` PentAGI（専門エージェントが分担する完全自律型のペンテスト用マルチエージェント）
  - `no.3-strix/` Strix（脆弱性を探して、動くPoCと修正パッチまで自動生成する自律エージェント）
  - `no.4-pentestgpt/` PentestGPT（人間が主導し、AIが次の攻撃手順をアシストするペンテスト支援）
  - `no.5-hexstrike-ai/` HexStrike AI（LLMと既存のセキュリティツールをつなぐMCPサーバー）
  - `no.6-deadend-cli/` Deadend CLI（ローカルだけで完結し、エラーから自己修正する自律エージェント）
  - `no.7-mcp-server-security-done/` MCPサーバーの構築手順と、セキュリティで気をつけること
  - `no.8-recent-cyberattacks/` 直近のサイバー攻撃について分析してみる（2026年10月：IDCFクラウドとフランスのスーパーの冷蔵設備）
  - `no.9-lang-series-done/` Langシリーズは何ができるの（LangChain・LangGraph・LangSmith・Langfuse）
  - `no.10-google-selfie-video-verification-done/` Googleアカウントの認証方法に自撮り動画が追加されてた件について
  - `no.11-php-security-release-done/` PHPの脆弱性と修正パッチの公開（2026年10月21日の緊急リリースで何が行われていたか）
  - `no.12-security-days-fall-2026/` Security Days Fall 2026 Tokyoで得たナレッジと気になった技術
