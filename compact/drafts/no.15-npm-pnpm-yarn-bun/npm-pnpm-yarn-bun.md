---
title: npm・pnpm・yarn・bunの違いを簡単にまとめる
tags:
  - npm
  - pnpm
  - Yarn
  - Bun
  - JavaScript
private: true
---
<!--
  コンパクト記事 no.15（草稿。公開前にこのコメントは削除）
  - 裏取り：各ツールの公式ドキュメント（特にバージョンで変わるところ）
    - Bun のロックファイル：Bun 1.2 からテキスト形式の bun.lock が標準（それより前は bun.lockb）
    - pnpm 10 で、依存パッケージの postinstall などのスクリプトを、許可したものしか実行しないようになった
    - Bun も、依存パッケージのスクリプトは trustedDependencies に書いたものしか実行しない
  - 足したいもの：同じ package.json で install の時間とディスク使用量を比べた結果（自分の環境で計測）
  - 関連：no.14 フレームワーク・ライブラリ・パッケージ
-->

# はじめに

リポジトリごとに `package-lock.json` だったり `pnpm-lock.yaml` だったりして混乱するので、4つの違いをまとめておきます。

# ひとことで言うと

4つとも **npm レジストリからパッケージを入れて、`node_modules` を作る道具**です。違うのは、入れ方（速さ・ディスクの使い方・厳しさ）と、bun だけは**ランタイムそのもの**でもあることです。

| ツール | ひとことで | ロックファイル |
|---|---|---|
| npm | Node.js に最初からついてくる標準 | `package-lock.json` |
| yarn | npm が遅かったころに Facebook（現 Meta）が作った代替 | `yarn.lock` |
| pnpm | ディスクを節約し、依存関係に厳しい | `pnpm-lock.yaml` |
| bun | 速さ重視の JavaScript ランタイムに、パッケージマネージャも入っている | `bun.lock` |

# それぞれの特徴

## npm

- Node.js をインストールすると一緒に入る
- `node_modules` は、依存関係をできるだけ平らに（フラットに）並べる
  - そのため、`package.json` に書いていないパッケージでも `require` できてしまうことがある（幽霊依存）

## yarn

- 2016年に登場。ロックファイルと並列インストールを、npm より先に取り入れた
- v2 以降（Yarn Berry）は、`node_modules` を作らない Plug'n'Play（PnP）という方式も選べる

## pnpm

- パッケージの実体は、マシンに1つの保存場所（ストア）にだけ置き、各プロジェクトからはハードリンクで参照する
  - 同じパッケージを何十ものプロジェクトで使っても、ディスクを1つ分しか使わない
- `node_modules` を平らにしないので、`package.json` に書いたパッケージしか使えない（幽霊依存が起きない）

## bun

- Zig で書かれ、JavaScriptCore（Safari のエンジン）で動く JavaScript ランタイム
- パッケージマネージャ、バンドラー、テストランナーが1つに入っている
- npm 互換なので、`package.json` はそのまま使える

# コマンドの対応

| やること | npm | yarn | pnpm | bun |
|---|---|---|---|---|
| 全部入れる | `npm install` | `yarn` | `pnpm install` | `bun install` |
| 追加する | `npm install <pkg>` | `yarn add <pkg>` | `pnpm add <pkg>` | `bun add <pkg>` |
| 開発用に追加 | `npm install -D <pkg>` | `yarn add -D <pkg>` | `pnpm add -D <pkg>` | `bun add -d <pkg>` |
| 消す | `npm uninstall <pkg>` | `yarn remove <pkg>` | `pnpm remove <pkg>` | `bun remove <pkg>` |
| スクリプト実行 | `npm run dev` | `yarn dev` | `pnpm dev` | `bun run dev` |
| 入れずに実行 | `npx <pkg>` | `yarn dlx <pkg>` | `pnpm dlx <pkg>` | `bunx <pkg>` |

# 気をつけるところ

- **1つのリポジトリでは1つに統一する**。ロックファイルが混ざると、人によって入るバージョンが変わる
- CI では、ロックファイルどおりに入れるコマンドを使う（`npm ci`、`pnpm install --frozen-lockfile` など）
- **サプライチェーン攻撃**：パッケージのインストール時に走るスクリプト（`postinstall` など）で、悪いコードが実行されることがある。pnpm や bun は、依存パッケージのスクリプトを、許可したものしか実行しないようになっている

# まとめ

迷ったら「ディスクと厳しさなら pnpm、速さとオールインワンなら bun、互換性なら npm」くらいで選べばいいのよ。
ほかにも選ぶときの決め手があれば、有識者の方教えて欲しいです！

# 参考

- npm Docs、Yarn 公式ドキュメント、pnpm 公式ドキュメント、Bun 公式ドキュメント
