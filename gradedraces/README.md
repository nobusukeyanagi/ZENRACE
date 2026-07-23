# 公営競技重賞日程

`zenrace`内の、公営競技グレードレース日程と開催日程の自動更新・Discord通知を管理します。

## 公開URL

https://nobusukeyanagi.github.io/zenrace/gradedraces/

## 対象競技

- JRA
- 地方競馬
- ボートレース
- 競輪
- オートレース

## 主なファイル

```text
gradedraces/
├─ index.html
├─ graded_races_schedule.html
├─ races.json
├─ config.json
├─ schedule_sync_state.json
├─ changes.json
├─ source_status.json
├─ incomplete_records.json
├─ master_schedule_report.json       # 実行時生成
├─ daily_update_report.json          # 実行時生成
├─ discord_notification_state.json
├─ requirements.txt
└─ scripts/
   ├─ daily_update.py
   ├─ master_schedule.py
   ├─ update_races.py
   ├─ validate_races.py
   └─ sync_html.py
```

- `races.json`：公開するレース一覧
- `graded_races_schedule.html`：更新元HTML
- `index.html`：公開用HTML。自動更新時に更新元HTMLから同期
- `schedule_sync_state.json`：公式日程ページの内容ハッシュ。変更がない日は同じ内容を維持
- `master_schedule_report.json`：公式日程との全件照合結果
- `changes.json`：発走時刻・優勝者など個別ページから取得した変更
- `source_status.json`：個別情報の取得先、警告、失敗状況
- `incomplete_records.json`：終了済みの未解決項目と、開催前の時刻未公開項目
- `daily_update_report.json`：1回の統合処理全体の集計

## 自動更新時刻

`.github/workflows/graded-race-update.yml`を、日本時間の毎日25:00に実行します。
暦上は翌日の01:00で、GitHub ActionsのcronはUTC 16:00です。

```text
毎日 25:00（翌日01:00）
```

GitHub Actionsのscheduleは混雑状況により開始が数分以上遅れる場合があります。

## 1日1回の統合処理

`python -m scripts.daily_update`がグレード日程を更新した後、`python -m monthly.scripts.update_schedule`が当日の開催場を各競技の公式情報で照合します。

### 1. 公式日程マスター同期

各競技の公式年間・月間日程だけを取得します。
登録済みレースの個別ページを1年分巡回する処理ではありません。

更新対象：

- 公式日程に追加された新規レース
- レース名
- 開催日
- 開催場
- 格
- 公式日程に掲載済みの優勝者

新規レースは、発走時刻が未発表でも`races.json`へ追加します。
名称変更は「日付＋開催場」などで同一レースと高い確度で判断できる場合に反映します。
日付または開催場が変わった将来レースは、誤表示防止のため発走時刻を一度空欄に戻します。

### 2. 未来14日の個別情報更新

当日から14日後までの登録済みレースについて、公式出走表・番組・レース詳細を確認します。

更新対象：

- 発走時刻
- 開催中止
- 個別結果ページで確認できる優勝者

レース名・開催日・開催場・格は、原則として公式日程マスター同期が担当します。

### 3. 直近2日と未解決情報の補完

当日および過去2日は、入力済みでも公式結果を再確認します。
また、過去2日を過ぎていても発走時刻・優勝者が空欄のレースは、設定期間内で再取得を続けます。

更新対象：

- 優勝者
- 発走時刻の公開遅延・訂正
- 中止情報

### 4. 公式日程との全件監査

取得した公式日程全件と`races.json`をローカルで照合します。

確認対象：

- 公式にあるが未登録のレース
- 登録内容と公式の名称・日付・開催場・格が異なるレース
- 登録済みだが取得した公式日程内に見つからないレース
- 重複レース

公式日程から見つからないレースは自動削除しません。
公式サイトの一時的な表示不具合や解析失敗を考慮し、`master_schedule_report.json`へ要確認として記録します。


## 開催日程の当日更新

`monthly/scripts/update_schedule.py`は、日本時間の当日について次の公式情報を確認します。

- KEIRIN.JP 開催日程
- AutoRace.JP 当日出走表
- BOAT RACE 月間日程・レース一覧
- 地方競馬情報サイト 当日メニュー
- JRA 競馬番組

取得できた競技だけを更新し、公式ページの構造変更などで0件になった場合は既存データを保全します。
取得結果は`monthly/monthly_update_report.json`へ記録します。

## Discord通知

`notify-discord.yml`は日本時間の毎日02:00に、グレードレースと当日の開催場を1つの通知として送信します。
GitHub Actionsの起動遅延対策として02:17にも予備実行し、同じ日付が通知済みなら送信しません。
手動実行では`notify_date`で日付指定、`force_notify`で再送ができます。

## 公式日程の取得範囲

通常は以下を確認します。

- 暦年ページ：当年と翌年
- 年度ページ：当年度と翌年度

翌年・翌年度ページがまだ公開されていない競技は、取得失敗ではなく未公開警告として記録し、公開後の次回実行で自動取得を試みます。

## 安全な上書きルール

- 公式から空欄しか取得できなかった場合、既存値を削除しない
- 公式から異なる値を取得した場合、公式値へ更新する
- 公式日程から消えただけではレースを削除しない
- 追加・変更後に`races.json`を検証し、検証失敗時はHTMLを更新しない
- 公式ページのハッシュが変わらない日は、`schedule_sync_state.json`を更新しない

## GitHub Actionsで確認する場所

```text
Actions
→ Graded-race Update
```

Summaryには次の件数を表示します。

- 公式日程取得件数
- 新規追加件数
- 基本情報更新件数
- 公式日程との照合要確認件数
- 重複候補件数
- 個別ページ確認対象件数
- 発走時刻・優勝者等の更新件数
- 終了済み未解決件数
- 開催前の時刻未公開件数
- 競技別の取得成否・警告件数

詳細レポートはActionsのArtifactとして30日間保存します。
実データが変更された実行では、レポートもGit履歴に保存します。

## 手動実行

```text
Actions
→ Graded-race Update
→ Run workflow
```

`base_date`を空欄にすると、日本時間の実行日を基準にします。
過去日を指定すると、公式日程同期は指定日の当年・翌年、詳細更新は指定日の未来14日・直近2日を対象にします。

GitHub PagesのSourceは`GitHub Actions`を使用します。
