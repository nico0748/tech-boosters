---
title: DNSとレコードを簡単にまとめる
tags:
  - DNS
  - ネットワーク
  - インフラ
private: true
---
<!--
  コンパクト記事 no.8（草稿。公開前にこのコメントは削除）
  - 裏取り：RFC 1034 / 1035、各レコードの RFC
  - 足したいもの：名前解決の流れの図（pptx→png）、dig を実際に叩いた結果
-->

# はじめに

ドメインを設定するたびに「A と CNAME ってどっちだっけ…」となるので、一度まとめておきます。

# ひとことで言うと

**DNS は、ドメイン名から IP アドレスなどの情報を引くための、世界中に分散したデータベース**です。
そのデータベースの1行1行が**レコード（リソースレコード）**で、種類ごとに役割が決まっています。

# 名前解決の流れ

`www.example.com` の IP アドレスを調べるとき、次の順に問い合わせます。

1. 端末（スタブリゾルバ）が、キャッシュDNSサーバ（フルサービスリゾルバ）に問い合わせる
2. キャッシュになければ、キャッシュDNSサーバがルートサーバに `.com` の担当を聞く
3. `.com` の TLD サーバに `example.com` の担当を聞く
4. `example.com` の権威DNSサーバに `www.example.com` を聞いて、答えをもらう
5. キャッシュDNSサーバは、答えを TTL の間だけ覚えておく

# 主なレコード

| レコード | 中身 | 例 |
|---|---|---|
| A | ドメイン名 → IPv4 アドレス | `www.example.com. A 192.0.2.1` |
| AAAA | ドメイン名 → IPv6 アドレス | `www.example.com. AAAA 2001:db8::1` |
| CNAME | 別名 → 正式な名前 | `blog.example.com. CNAME example.github.io.` |
| MX | メールの受け取り先サーバ（優先度つき） | `example.com. MX 10 mail.example.com.` |
| NS | そのゾーンを担当する権威DNSサーバ | `example.com. NS ns1.example.net.` |
| SOA | ゾーンの管理情報（シリアル番号など） | — |
| TXT | 任意の文字列。SPF やドメインの所有確認に使う | `example.com. TXT "v=spf1 -all"` |
| PTR | IP アドレス → ドメイン名（逆引き） | `1.2.0.192.in-addr.arpa. PTR www.example.com.` |
| SRV | サービスのホスト名とポート番号 | `_sip._tcp.example.com. SRV 10 5 5060 sip.example.com.` |
| CAA | そのドメインの証明書を発行してよい認証局 | `example.com. CAA 0 issue "letsencrypt.org"` |

# ハマりやすいところ

- **CNAME は、同じ名前にほかのレコードと一緒に置けない**。そのため、ゾーンの頂点（`example.com` そのもの）には、ふつう CNAME を置けない（NS や SOA があるため）
- レコードを変えても、古い答えが TTL の間はキャッシュに残る。切り替える前に TTL を短くしておくとよい
- メールのなりすまし対策（SPF・DKIM・DMARC）は、どれも TXT レコードで設定する

# 確かめるコマンド

```sh
# A レコードを引く
dig www.example.com A

# MX レコードを引く
dig example.com MX

# 答えだけを表示する
dig +short example.com TXT

# 権威サーバまで順にたどる様子を見る
dig +trace www.example.com
```

# まとめ

DNS は「名前 → 情報」の分散データベースで、レコードの種類さえ押さえれば設定で迷わなくなるのよ。
よくあるハマりどころがほかにもあれば、有識者の方教えて欲しいです！

# 参考

- RFC 1034 / RFC 1035（DNS の基本仕様）
- RFC 3596（AAAA）、RFC 2782（SRV）、RFC 8659（CAA）
