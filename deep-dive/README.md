<img src="icon.png" alt="series logo" width="480">

# deep-dive（技術を深ぼり隊）

セキュリティ技術・脆弱性・攻撃を深掘りするシリーズです。XSSやSQLiなどで、内部・低レイヤーで何が起きているかを掘り下げます。

記事の構成は、まず自分が知っていることを書き、そのあとAIとの壁打ちで分からなかった内部動作を明らかにしていく形式です。

## 中身
- [templates/](templates/) 記事のテンプレート
  - `fukabori-tai_template.md` 深ぼり隊の記事テンプレート
- [drafts/](drafts/) 下書き
  - `sqli-internals.md` SQLインジェクションの内部動作（壁打ち形式）
- [assets/](assets/) 記事で使う図・素材
  - [attack-routes/](assets/attack-routes/) 攻撃経路図

公開する記事は `qiita-github/public/` に移すと、mainへのpushでQiitaに投稿されます。
