# 公営競技重賞日程・毎日自動更新

`races.json`に登録済みのレースについて、毎日、日本時間の前後3日間を公式サイトで再確認し、確認できた情報だけを更新します。

## 更新対象

- JRA：重賞一覧、競馬番組
- 地方競馬：地方競馬情報サイトの重賞・当日レース情報
- ボートレース：公式グレード日程、優勝戦日の12R発売締切予定時刻
- 競輪：KEIRIN.JPのグレード日程・決勝結果
- オートレース：AutoRace.JPのグレード日程・優勝戦番組／結果

## 安全上の方針

- 取得できなかった空欄で既存情報を消しません。
- 一競技の取得に失敗しても、ほかの競技は更新できます。
- 全競技の取得に失敗した場合はGitHub Actionsをエラー終了させます。
- `changes.json`に変更前後と根拠URLを保存します。
- `source_status.json`に競技別の取得結果と警告を保存します。
- 公式サイトの構造変更時は、誤更新より「更新を見送る」ことを優先します。

## ファイル構成

```text
.
├─ index.html
├─ graded_races_schedule.html
├─ races.json
├─ config.json
├─ requirements.txt
├─ scripts/
│  ├─ update_races.py
│  ├─ validate_races.py
│  ├─ sync_html.py
│  ├─ common.py
│  └─ sources/
│     ├─ jra.py
│     ├─ nar.py
│     ├─ boatrace.py
│     ├─ keirin.py
│     └─ autorace.py
└─ .github/workflows/daily-update.yml
```

## GitHubへの配置手順

1. ZIPを展開します。
2. 展開したファイルをGitHubリポジトリのルートへアップロードします。
3. `Settings → Actions → General`を開きます。
4. `Workflow permissions`を`Read and write permissions`にします。
5. `Actions`タブで`Daily graded-race update`を開き、`Run workflow`を押します。
6. 更新が成功したら、GitHub Pagesを`main / root`から公開します。`index.html`が公開ページになります。

定期実行は `.github/workflows/daily-update.yml` の次の箇所です。

```yaml
- cron: "17 6 * * *"
  timezone: "Asia/Tokyo"
```

これは毎日6時17分（日本時間）です。変更する場合は、時刻部分を書き換えます。

## PCでの試運転

Python 3.12を用意し、プロジェクトのルートで実行します。

```bash
python -m pip install -r requirements.txt
python -m scripts.update_races --date 2026-07-13 --before 3 --after 3 --dry-run
python -m scripts.validate_races races.json
```

実際に書き換える場合は`--dry-run`を外します。

```bash
python -m scripts.update_races --before 3 --after 3
python -m scripts.validate_races races.json
python -m scripts.sync_html
```

## 重要な注意

公式サイトに公開APIがない箇所は、公式HTMLから情報を読み取ります。そのため、公式サイトのレイアウト変更によって取得できなくなることがあります。初回は必ずGitHub Actionsを手動実行し、`changes.json`と表示結果を確認してください。

このプログラムは、`races.json`にない新規レースを無条件に追加するのではなく、登録済みレースの時刻・正式名称・優勝者などを更新する設計です。年間日程そのものを追加・変更する場合は、別途`races.json`の基礎データ更新が必要です。
