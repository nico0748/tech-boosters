---
title: Windowsのレジストリとコマンドを簡単にまとめる
tags:
  - Windows
  - レジストリ
  - PowerShell
  - セキュリティ
private: true
---
<!--
  コンパクト記事 no.4（草稿。公開前にこのコメントは削除）
  - 裏取り：Microsoft Learn の reg コマンドのページ、レジストリのルートキーと値の型のページ
  - 足したいもの：実際に reg query を叩いた結果のスクショ（自分の検証用 VM で）
  - 注意：レジストリを書き換えるコマンドは、試す前にバックアップ（reg export）をとるよう書く
-->

# はじめに

インシデント対応の記事を読んでいると「Run キーに登録されていた」がよく出てくるので、レジストリとその操作コマンドをまとめておきます。

# ひとことで言うと

**レジストリは、Windows の OS とアプリの設定を入れておく、階層型のデータベース**です。
`regedit`（GUI）、`reg`（コマンドプロンプト）、PowerShell で読み書きできます。

# 構造

フォルダのような「キー」の中に、名前・型・データを持つ「値」が入っています。

## ルートキー

| ルートキー | 略称 | 中身 |
|---|---|---|
| HKEY_LOCAL_MACHINE | HKLM | コンピューター全体の設定 |
| HKEY_CURRENT_USER | HKCU | ログオン中のユーザーの設定 |
| HKEY_USERS | HKU | 全ユーザーの設定 |
| HKEY_CLASSES_ROOT | HKCR | ファイルの関連付けや COM の情報 |
| HKEY_CURRENT_CONFIG | HKCC | 現在のハードウェア構成 |

## 値の主な型

| 型 | 中身 |
|---|---|
| REG_SZ | 文字列 |
| REG_EXPAND_SZ | 環境変数（`%SystemRoot%` など）を含む文字列 |
| REG_MULTI_SZ | 複数の文字列 |
| REG_DWORD | 32ビットの数値 |
| REG_QWORD | 64ビットの数値 |
| REG_BINARY | バイナリ |

# コマンド

## reg（コマンドプロンプト）

```bat
:: 読む
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Run"

:: バックアップをとる（書き換える前に必ずやる）
reg export "HKCU\Software\Example" backup.reg

:: 値を追加する
reg add "HKCU\Software\Example" /v Sample /t REG_SZ /d "hello" /f

:: 値を消す
reg delete "HKCU\Software\Example" /v Sample /f

:: バックアップから戻す
reg import backup.reg
```

## PowerShell

PowerShell では、レジストリを `HKLM:` や `HKCU:` というドライブとして扱えます。

```powershell
# 読む
Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"

# キーを作る
New-Item -Path "HKCU:\Software\Example"

# 値を書く
Set-ItemProperty -Path "HKCU:\Software\Example" -Name "Sample" -Value "hello"

# 値を消す
Remove-ItemProperty -Path "HKCU:\Software\Example" -Name "Sample"
```

# セキュリティでの見どころ

次のキーは、ログオン時にプログラムを自動で起動させるために使われます。
正規のアプリも使いますが、マルウェアが居座る（永続化する）ためにも使われるので、インシデント対応ではまず確認する場所です（MITRE ATT&CK の T1547.001）。

- `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`
- `HKCU\Software\Microsoft\Windows\CurrentVersion\RunOnce`
- `HKLM\Software\Microsoft\Windows\CurrentVersion\Run`
- `HKLM\Software\Microsoft\Windows\CurrentVersion\RunOnce`

# まとめ

レジストリは「Windows の設定の置き場所」で、Run キーは調査のときに真っ先に見る場所なのよ。
ほかにも見ておくべきキーがあれば、有識者の方教えて欲しいです！

# 参考

- Microsoft Learn「reg」コマンド
- MITRE ATT&CK T1547.001 Boot or Logon Autostart Execution: Registry Run Keys / Startup Folder
