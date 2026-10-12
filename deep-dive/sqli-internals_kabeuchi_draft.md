---
title: SQLインジェクションの正体をバイトコードで見る：DBの中で「命令」がすり替わる瞬間
tags:
  - SQLインジェクション
  - セキュリティ
  - SQLite
  - Python
  - 脆弱性
private: true
---

<!--
  下書きメモ（公開前に削除）
  - 深ぼり隊テンプレート（templates/fukabori-tai_template.md）の構成に組み直した版
  - ✍️ の欄は Nico が自分の言葉で書き直す。今入っている文章は仮置きの例
  - 「AI」の発言は、元の下書きの解説を会話形式に要約したもの。実際の壁打ちログがあれば差し替える
  - コードと EXPLAIN の出力は Python 3 + SQLite 3.45.1 で実行確認済み
    （SQLiteのバージョンが違うとバイトコードの番号や並びが変わる可能性あり）
  - TODO: PostgreSQL の Parse/Bind/Execute を Wireshark でキャプチャした図を入れると「深ぼり感」が増す
  - 続編案: XSS編「ブラウザのパーサはどこでスクリプトを実行すると判断するのか」
-->

# はじめに

こんにちは、「技術を深ぼり隊」です。
このシリーズでは、攻撃や脆弱性について「自分が知っていること」から出発して、
**わからない部分をAIとの壁打ちで掘り下げ、低レイヤーで何が起きているのか** を明らかにしていきます。

今回のテーマは **SQLインジェクション（SQLi）** です。
SQLiteの仮想マシンが実行する「バイトコード」を覗いて、SQLiが起きたときにDBの中で何が変わっているのかを確かめます。

:::note warn
この記事の内容は、自分で用意したローカル環境で仕組みを理解するためのものです。
許可なく他人のシステムに試すことは、不正アクセス禁止法などの法律に触れるおそれがあります。
:::

## この記事でわかること

- SQL文がDBの中でどう処理されるか（字句解析 → 構文解析 → バイトコード生成 → 実行）
- SQLiが「データ」を「命令」に変えてしまう瞬間を、バイトコードの差分で確認する方法
- プリペアドステートメントが安全な本当の理由と、それでも残る落とし穴

## 検証環境

- Python 3 標準の `sqlite3`（SQLite 3.45.1）。追加インストールは不要です

# 自分が知っていること（壁打ち前）

<!-- ✍️ Nico が自分の言葉で書き直す欄。以下は仮置きの例 -->

SQLiは、入力欄に `'` などを混ぜてSQL文を壊し、想定外のSQLを実行させる攻撃です。
たとえばログイン処理を文字列連結で書いていると、こうなります。

```python:demo.py
import sqlite3

conn = sqlite3.connect(":memory:")
conn.executescript("""
CREATE TABLE users(id INTEGER PRIMARY KEY, name TEXT, password TEXT);
INSERT INTO users(name, password) VALUES ('alice', 'alice-pass'), ('bob', 'bob-pass');
""")

def login_vulnerable(name, password):
    # 文字列連結でSQLを組み立てている（ダメな例）
    sql = f"SELECT id, name FROM users WHERE name = '{name}' AND password = '{password}'"
    print("実行されるSQL:", sql)
    return conn.execute(sql).fetchall()

def login_safe(name, password):
    # プレースホルダを使う（良い例）
    sql = "SELECT id, name FROM users WHERE name = ? AND password = ?"
    return conn.execute(sql, (name, password)).fetchall()

print(login_vulnerable("alice", "wrong"))
print(login_vulnerable("alice' --", "wrong"))
print(login_safe("alice' --", "wrong"))
```

実行結果です。

```text
実行されるSQL: SELECT id, name FROM users WHERE name = 'alice' AND password = 'wrong'
[]
実行されるSQL: SELECT id, name FROM users WHERE name = 'alice' --' AND password = 'wrong'
[(1, 'alice')]
[]
```

ユーザー名に `alice' --` と入れるだけで、パスワードが違うのにログインできてしまいます。
`'` で文字列リテラルが閉じられ、`--` 以降がコメントになって、パスワードのチェックが消えたためです。

対策はプリペアドステートメント（プレースホルダ）を使うこと。
**危ない文字をエスケープしてくれるから安全**、と理解していました。

# わからないこと

ここまでは有名な話です。でも「なぜ？」と聞かれると答えられない点がありました。

1. DBはSQLの文字列を受け取ってから、中で何をしているのか
2. インジェクションされたとき、DBの中では具体的に何が変わっているのか
3. プレースホルダを使うと、なぜ同じ入力でも安全になるのか。本当に「エスケープ」なのか
4. SQLite以外のDBでも同じ仕組みなのか
5. プリペアドステートメントを使っていれば、もう安心なのか

# AIとの壁打ち

## ラウンド1：DBはSQL文字列をどう処理している？

> **自分**：アプリがDBにSQLを送ったあと、DBの中ではどういう順番で処理されるの？

> **AI**：SQLはDBにとってただの文字列です。まず字句解析で単語（トークン）に分け、構文解析で「何をする命令か」の構造を作り、そこから実行用のコードを生成して実行します。SQLiteの場合は、VDBEという仮想マシン用のバイトコードが作られます。

```text
SQL文字列
  ↓ 字句解析（トークナイザ）  … 'alice' は文字列リテラル、AND はキーワード、と単語に分ける
  ↓ 構文解析（パーサ）        … 単語の並びから「何をする命令か」の構造を作る
  ↓ 実行計画・コード生成      … SQLiteの場合は仮想マシン（VDBE）用のバイトコードを作る
  ↓ 実行
結果
```

### わかったこと

**「どこまでが命令で、どこからがデータか」は字句解析と構文解析の段階で決まる。**
SQLiとは、データとして渡したつもりの文字列が、この段階で命令の一部として解釈されてしまう問題だと言えそうです。
では、実際に「命令の一部として解釈された」結果を見ることはできるのか。

## ラウンド2：インジェクションでDBの中の何が変わる？

> **自分**：`alice' --` を入れたとき、DBの中で何が変わっているのか実際に見る方法はある？

> **AI**：SQLiteでは、SQLの先頭に `EXPLAIN` を付けると、実行される仮想マシンのバイトコードを表示できます。正常な入力とインジェクションされた入力で比べてみると違いがわかります。

### 自分で確かめる

```python:explain.py
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users(id INTEGER PRIMARY KEY, name TEXT, password TEXT)")

def show(sql, params=()):
    print("==", sql)
    for addr, opcode, p1, p2, p3, p4, p5, comment in conn.execute("EXPLAIN " + sql, params):
        print(f"{addr:>3} {opcode:<12} {p1!s:>3} {p2!s:>3} {p3!s:>3} {p4!s}")

show("SELECT id, name FROM users WHERE name = 'alice' AND password = 'wrong'")
show("SELECT id, name FROM users WHERE name = 'alice' --' AND password = 'wrong'")
show("SELECT id, name FROM users WHERE name = ? AND password = ?", ("alice' --", "wrong"))
```

正常な入力のとき：

```text
  0 Init           0  12   0 None
  1 OpenRead       0   2   0 3
  2 Rewind         0  11   0 None
  3 Column         0   1   1 None      ← name列を読む
  4 Ne             2  10   1 BINARY-8  ← 'alice' と違えばスキップ
  5 Column         0   2   1 None      ← password列を読む
  6 Ne             3  10   1 BINARY-8  ← 'wrong' と違えばスキップ
  7 Rowid          0   4   0 None
  8 Column         0   1   5 None
  9 ResultRow      4   2   0 None      ← 両方一致した行だけ返す
 10 Next           0   3   0 None
 11 Halt           0   0   0 None
 12 Transaction    0   0   1 0
 13 String8        0   2   0 alice
 14 String8        0   3   0 wrong
 15 Goto           0   1   0 None
```

比較命令 `Ne`（Not Equal）が **2つ** あります。name と password の両方をチェックしています。

インジェクションされたとき：

```text
  0 Init           0  10   0 None
  1 OpenRead       0   2   0 2
  2 Rewind         0   9   0 None
  3 Column         0   1   1 None      ← name列を読む
  4 Ne             2   8   1 BINARY-8  ← 'alice' と違えばスキップ
  5 Rowid          0   3   0 None
  6 Column         0   1   4 None
  7 ResultRow      3   2   0 None      ← name だけ一致すれば返してしまう
  8 Next           0   3   0 None
  9 Halt           0   0   0 None
 10 Transaction    0   0   1 0
 11 String8        0   2   0 alice
 12 Goto           0   1   0 None
```

### わかったこと

**password をチェックする命令が丸ごと消えています。**
入力値が変えたのは「比較する値」ではなく、**DBが実行するプログラムそのもの** でした。
これがSQLiの正体です。データを渡したつもりが、命令を書き換えてしまっています。

## ラウンド3：プレースホルダはなぜ安全？エスケープしてるの？

> **自分**：プレースホルダを使うと安全なのは、`'` をエスケープしてくれるからだよね？

> **AI**：そうとは限りません。SQLiteのプレースホルダは、SQL文を先にバイトコードへ変換し、値はその後に「変数」として渡します。値はパーサを通らないので、エスケープする必要自体がありません。同じ `EXPLAIN` で確認できます。

### 自分で確かめる

`explain.py` の3つ目、`?` を使ったときの出力です。

```text
  0 Init           0  12   0 None
  1 OpenRead       0   2   0 3
  2 Rewind         0  11   0 None
  3 Column         0   1   1 None
  4 Ne             2  10   1 BINARY-8
  5 Column         0   2   1 None
  6 Ne             3  10   1 BINARY-8  ← password のチェックが残っている
  7 Rowid          0   4   0 None
  8 Column         0   1   5 None
  9 ResultRow      4   2   0 None
 10 Next           0   3   0 None
 11 Halt           0   0   0 None
 12 Transaction    0   0   1 0
 13 Variable       1   2   0 None      ← 1番目の値を「変数」としてレジスタに入れる
 14 Variable       2   3   0 None      ← 2番目の値も同様
 15 Goto           0   1   0 None
```

### わかったこと

命令の構造は正常なときとまったく同じです。違いは最後の `String8`（SQL文に埋め込まれた文字列）が `Variable`（あとから渡される値）に変わっている点だけです。

`alice' --` という値は、**バイトコードが完成した後に** レジスタへ入る単なるデータです。
そのため、中に `'` や `--` が含まれていても、命令の構造に影響を与えようがありません。

壁打ち前の「エスケープしてくれるから安全」という理解は、少なくともSQLiteでは間違いでした。

## ラウンド4：SQLite以外のDBでも同じ？

> **自分**：SQLite以外、たとえばPostgreSQLやMySQLでも同じ仕組み？

> **AI**：考え方は同じです。どちらもSQL文と値を別々のメッセージとしてサーバに送るプロトコルを持っています。

| DB | 命令を送る | 値を送る |
| --- | --- | --- |
| PostgreSQL | 拡張クエリプロトコルの `Parse` メッセージ | `Bind` メッセージ（その後 `Execute`） |
| MySQL | `COM_STMT_PREPARE` | `COM_STMT_EXECUTE` |

### わかったこと

SQL文と値が **別々のメッセージ** としてDBに届くので、値がパーサを通ることはありません。
<!-- TODO: PostgreSQL の通信を Wireshark でキャプチャして、Parse と Bind が別パケットになっていることを自分で確かめる -->

## ラウンド5：プリペアドステートメントなら完璧？

> **自分**：じゃあ、プリペアドステートメントを使っていればもう安心？

> **AI**：落とし穴が2つあります。ひとつは、見た目はプリペアドステートメントでも、内部ではクライアント側でエスケープして1本のSQLに組み立てる「エミュレート」があること。もうひとつは、プレースホルダで渡せるのは値だけで、テーブル名や列名などは渡せないことです。

### 1. 「エミュレート」されたプリペアドステートメント

ライブラリによっては、内部でエスケープして1本のSQL文字列に組み立ててから送るものがあります（例：PHPのPDOの `PDO::ATTR_EMULATE_PREPARES`）。
この場合、安全性はエスケープ処理の正しさに依存します。過去には、文字コードの扱いの違いを突いてエスケープをすり抜ける問題も知られています。
使っているライブラリが「本当にサーバ側でprepareしているか」を確認しておくと安心です。

### 2. プレースホルダにできない場所

```python
# これはできない（列名はプレースホルダにできない）
conn.execute("SELECT * FROM users ORDER BY ?", (sort_key,))
```

こうした部分をユーザー入力で切り替えたい場合は、許可する値を決めておく（許可リスト）のが基本です。

```python
ALLOWED_SORT_KEYS = {"id", "name"}
if sort_key not in ALLOWED_SORT_KEYS:
    raise ValueError("invalid sort key")
conn.execute(f"SELECT * FROM users ORDER BY {sort_key}")
```

### わかったこと

ラウンド3でわかった「値は後から渡される」という仕組みが効くのは、**値** の部分だけです。
仕組みが崩れる場所（エミュレート、識別子）では、別の対策が必要になります。

# 壁打ちで変わった理解

| 壁打ち前 | 壁打ち後 |
| --- | --- |
| SQLiは入力でSQL文を「壊す」攻撃 | 入力で、DBが実行する **プログラム（バイトコード）そのもの** が書き換わる攻撃 |
| プリペアドステートメントはエスケープしてくれるから安全 | 命令の構造を先に確定させ、値は後からデータとして渡すから安全。エスケープはしていない |
| プリペアドステートメントを使えば安心 | エミュレートされたprepareや、プレースホルダにできない識別子には別の対策が要る |

# まとめ

- SQLiは「値」が字句解析・構文解析を通ることで、**DBが実行するプログラムそのものが書き換わる** 問題
- SQLiteの `EXPLAIN` を使うと、インジェクションで比較命令が消える様子をバイトコードで確認できる
- プリペアドステートメントは、命令の構造を先に確定させ、値を後からデータとして渡すので安全
- ただし、エミュレートされたprepareや、プレースホルダにできない識別子には注意が必要

次回はXSS編として、ブラウザのパーサがどのタイミングで文字列をスクリプトとして扱うのかを深ぼりする予定です。

# 参考

- [The SQLite Bytecode Engine](https://www.sqlite.org/opcode.html)
- [SQLite: EXPLAIN](https://www.sqlite.org/lang_explain.html)
- [PostgreSQL: Message Flow（Extended Query）](https://www.postgresql.org/docs/current/protocol-flow.html)
- [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [IPA 安全なウェブサイトの作り方](https://www.ipa.go.jp/security/vuln/websecurity/about.html)
