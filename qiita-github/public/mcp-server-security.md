---
title: MCPサーバーを自分で立ててみて考えた、構築の手順とセキュリティの勘所
tags:
  - MCP
  - ClaudeCode
  - Security
  - AIエージェント
  - LLM
private: false
updated_at: '2026-10-19T20:56:13+09:00'
id: a2e5c48aa746c3010923
organization_url_name: null
slide: false
ignorePublish: false
posting_campaign_uuid: null
agreed_posting_campaign_term: false
---

# はじめに

自作の論文読解アプリにMCPサーバーを生やして、Claudeから操作できるようにしてみました。
つなぐだけなら思ったより簡単だったんですが、「これ、AIに自分のファイルを書き換える権限を渡してるんだよな」と気づいてから急に怖くなってきたので、構築の手順とセキュリティで気をつけることをまとめておきます。

# MCPとは

MCP（Model Context Protocol）は、LLMアプリと外部のツールやデータをつなぐための共通の取り決めを指します。
主な機能区分として3種類に分類されます。

| 役割 | 説明 | 例 |
| --- | --- | --- |
| ホスト | ユーザーが操作するLLMアプリ | Claude Desktop、Claude Code |
| クライアント | ホストの中で、サーバー1つと1対1でつながる部分 | ホストが自動で用意する |
| サーバー | ツールやデータを提供するプログラム | 今回自作したもの |

サーバーが提供できるものは、主に次の3種類です。

- **ツール（tools）**：LLMが呼び出せる操作。「論文の一覧を取る」「訳を書き込む」など
- **リソース（resources）**：LLMに読ませるデータ
- **プロンプト（prompts）**：定型の指示のひな形

通信はJSON-RPC 2.0で、つなぎ方（トランスポート）は大きく2つあります。

- **stdio**：ホストがサーバーを子プロセスとして起動し、標準入出力でやりとりする。ローカルで使うならこれが基本
- **Streamable HTTP**：サーバーをHTTPで公開し、ネットワーク越しにつなぐ

![MCPの全体像](https://raw.githubusercontent.com/nico0748/tech-boosters/0d7838dc326f3d40e83ab47efae2f42e1a7c7a4b/other/drafts/no.7-mcp-server-security/image/01_MCP%E3%81%AE%E5%85%A8%E4%BD%93%E5%83%8F.png)
*図1：MCPの全体像。ホストの中のクライアントが、サーバーと1対1でつながる*

LLMがツールを使うときは、図2の順番でやりとりが進みます。
接続したときにホストがツールの一覧（`tools/list`）を受け取っておき、会話の中でLLMが使いたいツールを選ぶと、ホストがユーザーに確認したうえでサーバーに実行（`tools/call`）を頼みます。

![ツールを呼ぶまでの流れ](https://raw.githubusercontent.com/nico0748/tech-boosters/0d7838dc326f3d40e83ab47efae2f42e1a7c7a4b/other/drafts/no.7-mcp-server-security/image/02_%E3%83%84%E3%83%BC%E3%83%AB%E3%82%92%E5%91%BC%E3%81%B6%E3%81%BE%E3%81%A7%E3%81%AE%E6%B5%81%E3%82%8C.png)
*図2：ツールを呼ぶまでの流れ。実際にファイルやAPIを触るのはサーバーで、LLMはツール名と引数を決めるだけ*

# 構築してみる

今回つないだ構成は図3のとおりです。
Claude CodeとClaude Desktopのどちらからも、同じPaperLensのMCPサーバーをstdioで起動します。サーバーは、PaperLensアプリが使うのと同じ論文データを読み書きしています。

![PaperLensのMCP構成](https://raw.githubusercontent.com/nico0748/tech-boosters/0d7838dc326f3d40e83ab47efae2f42e1a7c7a4b/other/drafts/no.7-mcp-server-security/image/03_PaperLens%E3%81%AEMCP%E6%A7%8B%E6%88%90.png)
*図3：PaperLensのMCP構成。AIに頼んでも、自分でアプリから読んでも、同じデータが更新される*

## サーバーを作る

公式のSDK（TypeScriptなら `@modelcontextprotocol/sdk`）を使うと、ツールの名前・説明・引数のスキーマと処理を書くだけでサーバーになります。
引数のスキーマは zod で書けて、ここに書いた説明文がそのままLLMに渡ります。

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "paperlens", version: "0.1.0" });

server.registerTool(
  "list_papers",
  {
    description: "保存されている論文の一覧を返します",
    inputSchema: {},
    annotations: { readOnlyHint: true },
  },
  async () => ({ content: [{ type: "text", text: JSON.stringify(await listPapers()) }] }),
);

await server.connect(new StdioServerTransport());
```

※ `@modelcontextprotocol/sdk` 1.30.0 で書いたコードです。バージョンによって API 名が変わることがあります。

## Claude Codeに登録する

Claude Codeでは `claude mcp add` で登録します。環境変数は `-e` で渡します。

```sh
claude mcp add -s user paperlens \
  -e PAPERLENS_DATA=/path/to/data \
  -- node /path/to/dist-server/mcp.js
```

`claude mcp get paperlens` で「✔ Connected」と出れば接続できています。

## Claude Desktopに登録する

Claude Desktopは設定ファイル（macOSなら `~/Library/Application Support/Claude/claude_desktop_config.json`）の `mcpServers` に足します。

```json
{
  "mcpServers": {
    "paperlens": {
      "command": "/Users/you/.nodebrew/current/bin/node",
      "args": ["/path/to/dist-server/mcp.js"],
      "env": { "PAPERLENS_DATA": "/path/to/data" }
    }
  }
}
```

保存したらClaude Desktopを再起動します。

## 動作確認は自分でJSON-RPCを投げる

つないだあと「本当に動いてるのか？」が気になったので、サーバーを直接起動して `initialize` → `tools/list` → `tools/call` を標準入力から送ってみました。
ツールの一覧と実際の戻り値が見えるので、ホスト側の問題かサーバー側の問題かを切り分けるのに便利です。

```js
// 1行1メッセージの JSON-RPC を送るだけ
send({ jsonrpc: "2.0", id: 1, method: "initialize",
       params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "smoke", version: "0" } } });
send({ jsonrpc: "2.0", method: "notifications/initialized" });
send({ jsonrpc: "2.0", id: 2, method: "tools/list" });
```

## ハマったところ

つなぐまでに3回ほどやらかしました…

1. **登録したのに別のフォルダで使えない**：`claude mcp add` は何も付けないと local スコープで、登録したフォルダで起動したときしか使えません。どこでも使うなら `-s user` を付ける必要がある。
2. **Claude Desktopから `node` が見つからない**：GUIアプリはシェルの `PATH` を読まないので、nodebrewやnvmで入れた `node` は `command: "node"` だと見つからないことがあります。フルパスで書くと確実ではある。
3. **ツールに引数を足したのに反映されない**：ホストは起動時にサーバーを立ち上げて、そのときのツール定義を覚えています。サーバーをビルドし直したら、ホスト側も再起動が必要でした。

# セキュリティで気をつけること

ここからが本題です。MCPサーバーをつなぐというのは、**LLMに「このプログラムを、あなたの権限で動かしていいよ」と渡す** ことです。
LLMは読んだ文章に影響されるので、普通のプログラムとは違う守り方が要ります。

## 何がリスクになるのか？

| リスク | 何が起きるか |
| --- | --- |
| プロンプトインジェクション | ツールの戻り値（Webページ、メール、PDFの本文など）に「このファイルを消して」のような指示が混ざっていて、LLMがそれに従ってしまう |
| ツールポイズニング | ツールの説明文に、人には見えにくい形で悪い指示が仕込まれている。説明文はそのままLLMに渡るので、呼ばれなくても影響する |
| ラグプル | 最初は無害だったサーバーが、更新でツールの中身や説明をこっそり変える |
| 過剰な権限 | 読むだけで足りるのに、書き込みや削除までできるツールを公開している |
| 秘密情報の漏えい | 設定ファイルの `env` にAPIキーを平文で書いている。ログやスクショにも出やすい |
| サプライチェーン | `npx some-mcp-server` のようにバージョンを固定せず取ってきて、知らない間に中身が変わる |
| ローカルHTTPサーバーへの攻撃 | HTTPで待ち受けるローカルサーバーに、ブラウザで開いた悪いページから DNS リバインディングなどでリクエストが届く |

ツールポイズニングは、2025年4月にInvariant Labsが報告した攻撃です。ローカルHTTPサーバーへのDNSリバインディングやトークンの扱いは、MCPの仕様書のセキュリティの章でも注意点として挙げられています。

## サーバーを作る側の対策

- **ツールは最小限にする**：本当に必要な操作だけを公開する。削除のような取り返しのつかない操作は、なるべくツールにしない
- **読み取り専用モードを用意する**：今回作ったサーバーは、環境変数（`PAPERLENS_MCP_READONLY`）を付けると書き込み系のツールを公開しないようにしました。まず読み取り専用で試して、必要になったら書き込みを許す、という使い方ができます
- **アノテーションを付ける**：`readOnlyHint` や `destructiveHint` で、ツールの性質をホストに伝える。ただしこれはヒントで、強制力はない
- **入力を検証する**：引数はスキーマで型と範囲を絞る。ファイルパスは許可したフォルダの外に出ないか（`../` など）を確かめる。シェルに文字列をそのまま渡さない
- **戻り値は「データ」として返す**：外から取ってきた本文に指示文が混ざっていても、サーバー側では止めきれない。少なくとも、どこから来た文章かが分かる形で返す
- **HTTPで公開するなら**：ローカル用は `127.0.0.1` だけで待ち受ける。`Origin` ヘッダーを検証する。認証を付ける。受け取ったトークンを別のAPIにそのまま転送しない（トークンパススルー）

図4は、Claudeが書き込み系のツールを使ってPaperLensの数式帳に記号の説明を書き込んだ結果です。
便利な反面、AIがこれだけの量をノートに直接書き込めるということでもあります。`PAPERLENS_MCP_READONLY` を付けておけば、書き込み系のツール自体が公開されないので、こうした書き込みは起こりません。

![PaperLensの画面とMCPサーバ](https://raw.githubusercontent.com/nico0748/tech-boosters/0d7838dc326f3d40e83ab47efae2f42e1a7c7a4b/other/drafts/no.7-mcp-server-security/image/04_PaperLens%E3%81%AE%E7%94%BB%E9%9D%A2%E3%81%A8MCP%E3%82%B5%E3%83%BC%E3%83%90.png)
*図4：MCPサーバー経由で書き込まれた数式帳。読み取り専用モードでは、書き込み系のツールは公開されない*

## 使う側の対策

- **出どころの分からないサーバーを入れない**：中身を読めるか、信頼できる提供元かを確かめる。バージョンは固定する
- **ツールの説明文も読む**：何をするツールかだけでなく、説明文に変な指示が入っていないかも見る
- **権限を絞る**：読み取り専用モードや、触れるフォルダの指定があれば使う。サンドボックスやコンテナで動かせるならそのほうが安全
- **書き込み・削除・送信は毎回確認する**：ホストの許可設定で、取り返しのつかない操作は自動で通さない
- **秘密情報の置き場所を考える**：設定ファイルにAPIキーを書くなら、ファイルの権限を絞り、スクショや画面共有で映さない。キーを貼ってしまったらすぐ作り直す
- **プロンプトインジェクションは防ぎきれない前提でいる**：外部の文章を読むツールと、書き込み・送信ができるツールを同じ会話でつなぐと危ない、と覚えておく

# まとめ

- MCPサーバーは、SDKでツールを書いて `claude mcp add` や設定ファイルで登録すれば、思ったより簡単に作れる
- 動かないときは、サーバーに直接JSON-RPCを投げると原因を切り分けやすい
- つないだツールはLLMが自分の権限で動かすので、「最小限のツール」「読み取り専用から始める」「取り返しのつかない操作は毎回確認」が基本
- 外から読んだ文章や、ツールの説明文そのものが攻撃の入り口になる

便利なものほど、渡す権限は小さくから始めるのが大事なのよ🙌

ほかにも「これは気をつけたほうがいい」というポイントがあれば、有識者の方教えて欲しいです！

# 参考

- [Transports（Model Context Protocol 仕様）](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports)
- [Security Best Practices（Model Context Protocol 仕様）](https://modelcontextprotocol.io/specification/2025-06-18/basic/security_best_practices)
- [Connect Claude Code to tools via MCP（Claude Code ドキュメント）](https://code.claude.com/docs/en/mcp)
- [MCP Security Notification: Tool Poisoning Attacks（Invariant Labs）](https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks)
