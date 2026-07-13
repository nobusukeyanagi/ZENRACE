# 毎朝のDiscord通知への変更手順

## 変更内容

更新差分は通知しません。

毎朝の自動更新完了後、当日のグレードレースを必ずDiscordへ投稿します。
当日のレースが0件の場合も、その旨を投稿します。

通知タイトルをクリックすると、GitHub Pagesのindex.htmlが開きます。

## 差し替えるファイル

- `scripts/send_discord.py`
- `.github/workflows/daily-update.yml`

このZIP内の同名ファイルで、GitHub上の既存ファイルを置き換えてください。

## 通知例

```text
🏁本日のグレードレース
17:15 地方競馬 笠松 SPⅠ ぎふ清流カップ
20:35 地方競馬 門別 HⅢ 星雲賞
```

レースがない場合：

```text
🏁本日のグレードレース
グレードレースはありません
```

実際のDiscord投稿では、見出し部分がindex.htmlへのリンクになります。

## 手動テスト

GitHubで以下を開きます。

1. Actions
2. Daily graded-race update
3. Run workflow
4. `base_date`に試したい日付を入力
5. Run workflow

例：

```text
2026-07-09
```

この場合、7月9日のレースをDiscordへ投稿します。

空欄で実行すると、日本時間の当日分を投稿します。

## 公開URL

通常は、リポジトリ名から次のURLを自動作成します。

```text
https://GitHubユーザー名.github.io/リポジトリ名/index.html
```

独自ドメインなどを使う場合は、GitHubの次の場所に変数を登録してください。

```text
Settings
→ Secrets and variables
→ Actions
→ Variables
→ New repository variable
```

名前：

```text
SITE_URL
```

値の例：

```text
https://example.com/graded-races/
```

Webhook URLは、これまでどおりRepository secretの
`DISCORD_WEBHOOK_URL`を使用します。
