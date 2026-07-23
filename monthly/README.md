# 開催日程

`monthly.js`の年間開催日程を表示します。

## 毎日の公式情報更新

リポジトリ直下で次を実行します。

```bash
python -m monthly.scripts.update_schedule
```

日付指定：

```bash
python -m monthly.scripts.update_schedule --date 2026-07-22
```

当日の開催場を、KEIRIN.JP、AutoRace.JP、BOAT RACE、地方競馬情報サイト、JRAの公式ページと照合します。取得できた競技だけを更新し、取得結果は`monthly_update_report.json`へ保存します。
