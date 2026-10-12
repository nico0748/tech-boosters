---
title: Qiita記事をGitHubで管理しよう：Qiita CLIで「書く・プレビュー・公開」をローカル完結させる
tags:
  - Qiita
  - QiitaCLI
  - GitHub
  - GitHubActions
  - 初心者向け
private: true
---

<!--
  下書きメモ（公開前に削除）
  - シリーズ: 技術を使いこなし隊
  - タグ案: Qiita / QiitaCLI / GitHub / GitHubActions / 初心者向け（Qiitaのタグ上限は5つ）
  - 代替タグ: Markdown, Node.js, 個人開発
  - TODO: 実際に手元で実行したスクリーンショット（プレビュー画面、Actionsの実行結果）を差し込む
  - TODO: コマンドやファイル内容は執筆時点の最新版 Qiita CLI で再確認する
-->

# はじめに

こんにちは、「技術を深ぼり隊」です。

Qiitaの記事、ブラウザのエディタで書いていませんか？
短い記事ならそれで十分ですが、記事が増えてくると次のような悩みが出てきます。

- 書きかけの記事がどこにあるかわからない
- 「前のバージョンに戻したい」ができない
- 使い慣れたエディタ（VS Codeなど）で書きたい

この記事では、Qiita公式の **Qiita CLI** を使って、記事をMarkdownファイルとしてGitHubで管理し、`git push` するだけで公開できる環境を作ります。

## この記事でわかること

- Qiita CLIのインストールと初期設定
- ローカルでのプレビュー方法
- GitHub Actionsを使った自動公開の仕組み

## 対象読者

- Qiitaに記事を書いたことがある（またはこれから書く）人
- Gitの基本操作（commit / push）がわかる人

# 背景：なぜ記事をGitで管理するのか

記事をコードと同じように扱うと、次のメリットがあります。

| 観点 | ブラウザエディタ | Qiita CLI + Git |
| --- | --- | --- |
| 編集環境 | Qiitaのエディタ | 好きなエディタ |
| 変更履歴 | 記事ごとの編集履歴 | Gitで差分・巻き戻しが自由 |
| レビュー | 難しい | Pull Requestで仲間にレビューしてもらえる |
| バックアップ | Qiita上のみ | GitHubにも残る |

特に「チームで記事を出す」「誰かにレビューしてから公開したい」という場合、Pull Requestでレビューできるのは大きな利点です。

# 手順

## 0. 必要なもの

- Node.js（Qiita CLIの動作要件を満たすバージョン）
- GitHubアカウント
- Qiitaアカウント

## 1. Qiitaのアクセストークンを発行する

Qiitaの「設定」→「アプリケーション」→「個人用アクセストークン」から新しいトークンを発行します。
スコープは **`read_qiita`** と **`write_qiita`** にチェックを入れます。

:::note warn
トークンはパスワードと同じです。GitHubにコミットしたり、人に見せたりしないよう注意してください。
:::

## 2. リポジトリを作ってQiita CLIを入れる

```bash
mkdir qiita-articles
cd qiita-articles
git init

npm init -y
npm install @qiita/qiita-cli --save-dev
```

## 3. 初期化とログイン

```bash
# 設定ファイルやGitHub Actionsのワークフローを生成
npx qiita init

# 手順1で発行したトークンでログイン
npx qiita login
```

`npx qiita init` を実行すると、次のようなファイルが生成されます。

```text
qiita-articles/
├── .github/
│   └── workflows/
│       └── publish.yml   # 自動公開用のワークフロー
├── .gitignore
├── qiita.config.json     # Qiita CLIの設定
└── package.json
```

## 4. 記事を作成する

```bash
npx qiita new my-first-article
```

`public/my-first-article.md` が作られます。ファイルの先頭はこんな形です。

```yaml
---
title: 新しく記事を投稿する
tags:
  - ''
private: false
updated_at: ''
id: null
organization_url_name: null
slide: false
ignorePublish: false
---
# new article body
```

主な項目の意味は次のとおりです。

| 項目 | 意味 |
| --- | --- |
| `title` | 記事タイトル |
| `tags` | タグ（最大5つ） |
| `private` | `true` で限定共有記事 |
| `ignorePublish` | `true` にすると公開対象から外れる（下書き置き場として便利） |
| `id` | 投稿後に自動で入る。手で書き換えない |

:::note info
書きかけの記事は `ignorePublish: true` にしておくと、うっかり公開されません。
:::

## 5. ローカルでプレビューする

```bash
npx qiita preview
```

ブラウザでプレビュー画面が開き、Qiitaでの見た目を確認しながら書けます。ファイルを保存すると表示も更新されます。

<!-- TODO: プレビュー画面のスクリーンショット -->

## 6. 手元から公開する

```bash
npx qiita publish my-first-article
```

公開に成功すると、ファイルの `id` や `updated_at` が自動で書き換わります。
この変更もコミットしておきましょう。

## 7. GitHub Actionsで自動公開する

毎回コマンドを打つ代わりに、`main` ブランチへのpushで自動公開できます。

1. GitHubにリポジトリを作成してpushする
2. リポジトリの「Settings」→「Secrets and variables」→「Actions」で、`QIITA_TOKEN` という名前で手順1のトークンを登録する

生成された `.github/workflows/publish.yml` の中身（抜粋）は次のようになっています。

```yaml
name: Publish articles

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false

jobs:
  publish_articles:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: increments/qiita-cli/actions/publish@v1
        with:
          qiita-token: ${{ secrets.QIITA_TOKEN }}
          root: "."
```

これで、記事を書いて `main` にpushすれば自動でQiitaに反映されます。
`contents: write` は、公開後に `id` などを書き戻したコミットをリポジトリへ反映するために必要です。

<!-- TODO: Actionsの実行結果のスクリーンショット -->

## 8. 既存の記事を取り込む（任意）

すでにQiitaに書いた記事がある場合は、次のコマンドで手元に取り込めます。

```bash
npx qiita pull
```

# 運用のコツ

- **ブランチで書いてPRでレビュー**：`main` へのマージ＝公開、というルールにするとチーム運用しやすくなります
- **下書きは `ignorePublish: true`**：mainに入れても公開されないので、書きかけでもコミットできます
- **ブラウザで直接編集しない**：Qiita上で編集するとローカルとの差分が生まれます。編集したら `npx qiita pull` で取り込みましょう

# まとめ

- Qiita CLIを使うと、記事をMarkdownファイルとしてGitで管理できる
- `npx qiita preview` で見た目を確認しながら書ける
- GitHub Actionsと組み合わせれば、`git push` だけで記事を公開できる
- Pull Requestを使えば、記事を仲間にレビューしてもらってから公開できる

「技術を使いこなし隊」では、こうした日々の開発を少し楽にする道具の使い方を紹介していきます。
次回は〇〇について深ぼりする予定です。

# 参考

- [Qiita CLI（GitHub）](https://github.com/increments/qiita-cli)
- [Qiita API v2 ドキュメント](https://qiita.com/api/v2/docs)
