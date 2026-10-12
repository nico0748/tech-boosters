#!/usr/bin/env bash
# 新しい記事の下書きディレクトリを作る。
#   使い方: scripts/new-draft.sh <シリーズ> <slug>
#   例:     scripts/new-draft.sh deep-dive csrf
#           → deep-dive/drafts/no.3-csrf/csrf-internals.md と image/ ができる
# ルールはリポジトリ直下の README.md「記事ディレクトリのルール」を参照。
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
series="${1:-}"
slug="${2:-}"

usage() {
  echo "使い方: $0 <deep-dive|hands-on|hidden-gems> <slug>" >&2
  exit 1
}

case "$series" in
  deep-dive|hands-on|hidden-gems) ;;
  *) usage ;;
esac
[[ "$slug" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || {
  echo "slug は英小文字・数字・ハイフンのみ（例: xss, open-redirect）: '$slug'" >&2
  exit 1
}

# deep-dive だけ記事ファイル名に -internals を付ける
if [[ "$series" == deep-dive ]]; then
  file="$slug-internals.md"
else
  file="$slug.md"
fi

drafts="$root/$series/drafts"
mkdir -p "$drafts"

# 同じ slug の記事がすでにないか
if compgen -G "$drafts/no.*-$slug" > /dev/null; then
  echo "すでにあります: $(ls -d "$drafts"/no.*-"$slug")" >&2
  exit 1
fi
if [[ -e "$root/qiita-github/public/$file" ]]; then
  echo "同じファイル名の記事が qiita-github/public/ にあります: $file" >&2
  exit 1
fi

# 次の番号 = 既存の最大番号 + 1（公開済みでもディレクトリは残すので欠番・重複しない）
max=0
for d in "$drafts"/no.*-*/; do
  [[ -d "$d" ]] || continue
  n="$(basename "$d")"
  n="${n#no.}"
  n="${n%%-*}"
  [[ "$n" =~ ^[0-9]+$ ]] && (( n > max )) && max="$n"
done
dir="$drafts/no.$((max + 1))-$slug"

mkdir -p "$dir/image"
touch "$dir/image/.gitkeep"

template="$(ls "$root/$series/templates/"*.md 2>/dev/null | head -1 || true)"
if [[ -n "$template" ]]; then
  cp "$template" "$dir/$file"
else
  cat > "$dir/$file" <<'EOF'
---
title: （タイトル）
tags:
  - （タグ）
private: true
---

EOF
fi

echo "作成しました: ${dir#$root/}/$file"
