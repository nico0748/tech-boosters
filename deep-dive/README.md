<img src="assets/icon/icon.png" alt="series logo" width="480">

# deep-dive（技術を深ぼり隊）

セキュリティ技術・脆弱性・攻撃を深掘りするシリーズです。XSSやSQLiなどで、内部・低レイヤーで何が起きているかを掘り下げます。

記事の構成は、テーマについての疑問（わからないこと）をAIとの壁打ちで1つずつ掘り下げ、内部動作を明らかにしていく形式です。

ディレクトリと命名のルールは[リポジトリ直下のREADME](../README.md#記事ディレクトリのルール)を参照してください。

## 中身
- [templates/](templates/) 記事のテンプレート
  - `fukabori-tai_template.md` 深ぼり隊の記事テンプレート
- [drafts/](drafts/) 下書き（記事1本 = 1ディレクトリ）
  - `no.1-xss-done/` XSSの内部動作（壁打ち形式）
  - `no.2-sqli/` SQLインジェクションの内部動作（壁打ち形式）
- [assets/](assets/) シリーズ共通の素材
  - `icon/` シリーズのロゴ
  - [attack-routes/](assets/attack-routes/) 攻撃経路図
