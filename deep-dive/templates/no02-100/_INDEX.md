# 深ぼり隊 記事テンプレート no.2〜100 インデックス

各ファイルは「テーマ・この記事でわかること・わからないこと（疑問リスト）・AIとの壁打ちの各ラウンド見出し」まで用意した骨組みです。本文（AIとのやりとり・検証結果）はこれから埋めてください。構成は `templates/fukabori-tai_template.md` 準拠、口語調、「自分が知っていること」セクションは無し。


## Web・アプリ攻撃

- **no.2** [SQLインジェクションの正体をバイトコードで見る：DBの中で命令がすり替わる瞬間](./002_sqli-internals.md)
- **no.3** [XSSはブラウザの中でどう発火するのか：HTMLパーサの状態遷移から読み解く](./003_xss-html-parser.md)
- **no.4** [CSRFはなぜ成立するのか：ブラウザが勝手にCookieを送る仕組みから](./004_csrf-origin.md)
- **no.5** [SSRFはどこまで届くのか：サーバがリクエストを出す仕組みを悪用する](./005_ssrf-internals.md)
- **no.6** [IDORの正体：認可チェックが抜ける瞬間を追う](./006_idor-access-control.md)
- **no.7** [OSコマンドインジェクション：シェルが文字列をどう解釈するか](./007_os-command-injection.md)
- **no.8** [ディレクトリトラバーサル：../ がファイルシステムをどう遡るか](./008_path-traversal.md)
- **no.9** [オープンリダイレクト：リダイレクト先の検証が甘いと何が起きるか](./009_open-redirect.md)
- **no.10** [HTTPリクエストスマグリング：サーバ間の解釈のズレを突く](./010_http-request-smuggling.md)
- **no.11** [JWTの署名検証で何が起きているか：alg:none と鍵混同攻撃](./011_jwt-signature.md)
- **no.12** [セッション固定攻撃：ログイン前後でセッションIDがどう扱われるか](./012_session-fixation.md)
- **no.13** [Cookie属性の本当の意味：Secure/HttpOnly/SameSite が守るもの](./013_cookie-attributes.md)
- **no.14** [CORS設定ミス：ブラウザの同一オリジンポリシーとその緩め方](./014_cors-misconfig.md)
- **no.15** [クリックジャッキング：透明なiframeが重なると何が起きるか](./015_clickjacking.md)
- **no.16** [XXE：XMLパーサが外部エンティティをどう展開するか](./016_xxe.md)
- **no.17** [サーバサイドテンプレートインジェクション：テンプレートエンジンが式を評価する瞬間](./017_ssti.md)
- **no.18** [安全でないデシリアライズ：バイト列からオブジェクトが蘇る仕組み](./018_insecure-deserialization.md)
- **no.19** [LDAPインジェクション：ディレクトリ検索フィルタが壊れる仕組み](./019_ldap-injection.md)
- **no.20** [NoSQLインジェクション：クエリがオブジェクトとして注入される](./020_nosql-injection.md)
- **no.21** [第二次SQLインジェクション：いったん保存された値が後で牙をむく](./021_second-order-sqli.md)
- **no.22** [ブラインドSQLインジェクション：出力が無くても1ビットずつ漏れる](./022_blind-sqli.md)
- **no.23** [DOM-based XSS：sourceからsinkまでのデータフローを追う](./023_dom-xss.md)
- **no.24** [mutation XSS：サニタイズ後にパーサが書き換える現象](./024_mutation-xss.md)
- **no.25** [CSPバイパス：ポリシーがどう評価され、どこが抜け道になるか](./025_csp-bypass.md)
- **no.26** [プロトタイプ汚染：JSのプロトタイプチェーンが書き換わる仕組み](./026_prototype-pollution.md)
- **no.27** [ReDoS：正規表現エンジンのバックトラックが爆発する仕組み](./027_redos.md)
- **no.28** [Webのレースコンディション：チェックと使用の間に割り込む（TOCTOU）](./028_web-race-condition.md)
- **no.29** [パスワードハッシュの正体：bcrypt/argon2 はなぜ総当たりに強いか](./029_password-hashing.md)
- **no.30** [タイミング攻撃：文字列比較の時間差から秘密が漏れる](./030_timing-attack.md)
- **no.31** [OAuthのリダイレクトURI検証不備：認可コードが盗まれる経路](./031_oauth-redirect.md)
- **no.32** [GraphQLの落とし穴：イントロスペクションと深いクエリ](./032_graphql-abuse.md)
- **no.33** [ファイルアップロード検証バイパス：拡張子とContent-Typeは何を保証しないか](./033_file-upload-bypass.md)
- **no.34** [WebSocketの認可欠如：ハンドシェイク後に誰も見ていない](./034_websocket-auth.md)
- **no.35** [Webキャッシュポイズニング：キャッシュキーに入らない入力が武器になる](./035_cache-poisoning.md)
- **no.36** [HTTPヘッダインジェクション／CRLF：改行がレスポンスを分割する](./036_crlf-injection.md)
- **no.37** [メールなりすまし：SPF/DKIM/DMARC が何を検証しているか](./037_email-spoofing.md)
- **no.38** [サブドメインテイクオーバー：宙に浮いたDNSレコードを乗っ取る](./038_subdomain-takeover.md)
- **no.39** [ビジネスロジック脆弱性：仕様の隙間を突く攻撃](./039_business-logic.md)
- **no.40** [DNSリバインディング：同一オリジンポリシーをDNSで欺く](./040_dns-rebinding.md)

## 低レイヤー攻撃・防御機構

- **no.41** [スタックバッファオーバーフロー：戻りアドレスが書き換わる瞬間](./041_stack-buffer-overflow.md)
- **no.42** [ヒープバッファオーバーフロー：チャンクのメタデータが壊れる](./042_heap-buffer-overflow.md)
- **no.43** [整数オーバーフロー：桁あふれがサイズ計算を狂わせる](./043_integer-overflow.md)
- **no.44** [Off-by-one：たった1バイトのはみ出しが制御を奪う](./044_off-by-one.md)
- **no.45** [初期化されていないメモリの使用：前の住人のデータが残る](./045_uninitialized-memory.md)
- **no.46** [Use-After-Free：解放したはずの部屋をまだ使っている](./046_use-after-free.md)
- **no.47** [二重解放：同じ領域を二度返すとフリーリストが壊れる](./047_double-free.md)
- **no.48** [型混同：同じバイト列が違う型として読まれる](./048_type-confusion.md)
- **no.49** [ヒープスプレー／グルーミング：ヒープの配置を攻撃者が整える](./049_heap-spray.md)
- **no.50** [ret2libc：既存コードを戻りアドレスでつなぐ](./050_ret2libc.md)
- **no.51** [ROP：ガジェットをつないでチューリング完全に](./051_rop.md)
- **no.52** [GOT／PLT上書き：関数アドレス表を書き換える](./052_got-overwrite.md)
- **no.53** [仮想関数テーブル書き換え：vptrを乗っ取る](./053_vtable-hijacking.md)
- **no.54** [書式文字列の脆弱性：%n が書き込みに化ける](./054_format-string.md)
- **no.55** [メモリ情報漏えい：長さの取り違えでバッファの外が見える](./055_memory-disclosure.md)
- **no.56** [NULLポインタ参照：ゼロ番地を触ると何が起きるか](./056_null-deref.md)
- **no.57** [Spectre：投機実行とキャッシュで秘密を盗む](./057_spectre.md)
- **no.58** [Meltdown：例外確定前の一瞬にカーネルを覗く](./058_meltdown.md)
- **no.59** [Rowhammer：DRAMを叩いてビットを反転させる](./059_rowhammer.md)
- **no.60** [キャッシュタイミング側路：速い/遅いから秘密を推測する](./060_cache-timing.md)
- **no.61** [コールドブート攻撃：冷えたRAMに鍵が残る](./061_cold-boot.md)
- **no.62** [DMA攻撃：CPUを介さず直接RAMを読み書きする](./062_dma-attack.md)
- **no.63** [スタックカナリア：炭鉱のカナリアで改ざんを検知する](./063_stack-canary.md)
- **no.64** [DEP／NX：メモリに「実行してよい/だめ」の札を付ける](./064_dep-nx.md)
- **no.65** [ASLR／PIE：配置をランダム化して「どこ」を隠す](./065_aslr-pie.md)
- **no.66** [RELRO：GOTを読み取り専用にして書き換えを封じる](./066_relro.md)
- **no.67** [CFI：間接分岐の飛び先を「正しい入口」に限定する](./067_cfi.md)
- **no.68** [シャドウスタック／Intel CET：戻りアドレスの控えを二重に持つ](./068_shadow-stack-cet.md)
- **no.69** [ポインタ認証（PAC）：ポインタに署名を埋め込む](./069_pac.md)
- **no.70** [メモリタグ付け（MTE）：ポインタと領域に同じ色を塗る](./070_mte.md)
- **no.71** [FORTIFY_SOURCE：コンパイラがサイズを知って境界を見張る](./071_fortify-source.md)
- **no.72** [シェルコード入門：バイト列がなぜ「動く」のか](./072_shellcode-intro.md)
- **no.73** [ASLRバイパス：漏れた1アドレスから全体を逆算する](./073_aslr-bypass.md)
- **no.74** [ヒープの中身：tcache とフリーリストの仕組みを覗く](./074_heap-internals.md)
- **no.75** [リトルエンディアンと「命令とデータの境界」](./075_endianness.md)
- **no.76** [動的リンクの舞台裏：GOT/PLTと遅延バインドの仕組み](./076_dynamic-linking.md)
- **no.77** [システムコールとユーザ/カーネル境界：特権はどこで切り替わるか](./077_syscall-boundary.md)
- **no.78** [サイドチャネル総論：電力・電磁・音からも秘密は漏れる](./078_side-channel-overview.md)

## 最近の有名ソフトウェア／ライブラリの脆弱性

- **no.79** [Log4Shell：ログ文字列がリモートコード実行になった日](./079_log4shell.md) `CVE-2021-44228`
- **no.80** [Spring4Shell：データバインディングがクラスローダに届く](./080_spring4shell.md) `CVE-2022-22965`
- **no.81** [Heartbleed：心拍の返事がメモリを溢れさせる](./081_heartbleed.md) `CVE-2014-0160`
- **no.82** [Shellshock：環境変数に忍ばせた関数定義が実行される](./082_shellshock.md) `CVE-2014-6271`
- **no.83** [Dirty COW：コピーオンライトの競合で読み取り専用に書き込む](./083_dirty-cow.md) `CVE-2016-5195`
- **no.84** [xz backdoor：ビルド過程に仕込まれたサプライチェーン攻撃](./084_xz-backdoor.md) `CVE-2024-3094`
- **no.85** [regreSSHion：OpenSSHにシグナルハンドラの競合が復活](./085_regresshion.md) `CVE-2024-6387`
- **no.86** [Next.js ミドルウェア認可バイパス：ヘッダ1つで検証を飛ばす](./086_nextjs-middleware.md) `CVE-2025-29927`
- **no.87** [React2Shell：React Server Componentsの未認証RCE](./087_react2shell.md) `CVE-2025-55182`
- **no.88** [Unityランタイムの脆弱性：8年もの間ゲームに潜んだ入力処理](./088_unity-runtime.md) `CVE-2025-59489`
- **no.89** [Polyfill.io サプライチェーン攻撃：信頼していたCDNが牙をむく](./089_polyfill-supply-chain.md)
- **no.90** [ProxyLogon／ProxyShell：Exchangeを乗っ取る連鎖](./090_proxylogon.md) `CVE-2021-26855`
- **no.91** [Follina：Officeの外部参照がMSDT経由で実行される](./091_follina.md) `CVE-2022-30190`
- **no.92** [PrintNightmare：印刷スプーラがドライバを信用しすぎた](./092_printnightmare.md) `CVE-2021-34527`
- **no.93** [Text4Shell：文字列補間がコード実行に化ける](./093_text4shell.md) `CVE-2022-42889`
- **no.94** [curl SOCKS5 ヒープオーバーフロー：ホスト名長の見落とし](./094_curl-socks5.md) `CVE-2023-38545`
- **no.95** [libwebp：1枚の画像でブラウザが落ちる(BLASTPASS)](./095_libwebp.md) `CVE-2023-4863`
- **no.96** [Ghostscript RCE：PostScript解釈がファイル名から漏れる](./096_ghostscript.md) `CVE-2023-36664`
- **no.97** [Apache Struts OGNL：Equifax侵害を招いた式評価](./097_struts-ognl.md) `CVE-2017-5638`
- **no.98** [EternalBlue：SMBの処理ミスが世界的ワームになった](./098_eternalblue.md) `CVE-2017-0144`
- **no.99** [Dirty Pipe：パイプのフラグ初期化漏れで書き換える](./099_dirty-pipe.md) `CVE-2022-0847`
- **no.100** [Looney Tunables：GLIBC_TUNABLESの処理がroot奪取に](./100_looney-tunables.md) `CVE-2023-4911`
