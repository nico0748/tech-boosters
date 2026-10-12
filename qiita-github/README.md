# Qiita記事管理リポジトリ（Qiita CLI + GitHub Actions）

参考: https://qiita.com/Qiita/items/32c79014509987541130

## 構成
- `public/` 記事のMarkdown（`npx qiita new 記事名` で作成）
- `qiita.config.json` プレビューの設定
- `../.github/workflows/publish.yml`（リポジトリ直下）main/masterへのpushで記事を投稿・更新。`root: "qiita-github"` でこのフォルダを対象にしている

## セットアップ（Nicoさんの作業）
1. GitHubで空のリポジトリを作る（例: `qiita-articles`、PrivateでもOK）
2. Qiitaの「設定 > アプリケーション > 個人用アクセストークン」で `read_qiita` と `write_qiita` にチェックしてトークンを発行
3. リポジトリの Settings > Secrets and variables > Actions で、名前 `QIITA_TOKEN`、値に上のトークンを登録
4. このフォルダをMacに置いて以下を実行
   ```sh
   npm install
   npx qiita login        # プレビュー用。トークンはローカルにだけ保存される
   git init && git add . && git commit -m "Qiita CLI setup"
   git branch -M main
   git remote add origin https://github.com/nico0748/tech-boosters.git
   git push -u origin main
   ```

## 使い方
- 新規記事: `npx qiita new 記事名` → `public/記事名.md` ができる
- プレビュー: `npx qiita preview` → http://localhost:8888
- 投稿: mainにpushすると自動で投稿・更新される

## 注意
- **mainにpushした記事は公開される**。書きかけの記事はフロントマターで `ignorePublish: true` にしておくとActionsで投稿されない
- 限定共有にしたいときは `private: true`
- 記事の削除はCLIではできないのでQiita上で行う
- 投稿後に `id` などがフロントマターに書き戻されるコミットが入るので、作業前に `git pull` する
