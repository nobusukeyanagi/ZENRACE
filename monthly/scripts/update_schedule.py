from __future__ import annotations

import argparse
import json
import sys
from datetime import date, datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

from monthly.scripts.common import (
    OfficialSession,
    SourceResult,
    existing_entry,
    find_day,
    load_monthly_data,
    merge_entry,
    normalize_grade,
    overlay_grades,
    sort_entries,
    write_monthly_data,
)
from monthly.scripts.sources import autorace, boatrace, jra, keirin, nar

JST = ZoneInfo("Asia/Tokyo")
SOURCE_COLLECTORS = (keirin.collect, autorace.collect, boatrace.collect, nar.collect, jra.collect)


def parse_target(value: str | None) -> date:
    if value:
        return date.fromisoformat(value)
    return datetime.now(JST).date()


def load_grade_records(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    payload = json.loads(path.read_text(encoding="utf-8"))
    return [item for item in payload if isinstance(item, dict)] if isinstance(payload, list) else []


def source_summary(result: SourceResult) -> dict[str, Any]:
    return {
        "sport": result.sport,
        "ok": result.ok,
        "entry_count": len(result.entries),
        "fetched_urls": result.fetched_urls,
        "warnings": result.warnings,
        "error": result.error,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="公式サイトを確認し、当日の開催日程をmonthly.jsへ反映します。")
    parser.add_argument("--date", help="基準日 YYYY-MM-DD。省略時は日本時間の当日")
    parser.add_argument("--fail-if-all-sources-fail", action="store_true")
    parser.add_argument("--monthly-js", default="monthly/monthly.js")
    parser.add_argument("--graded-races", default="gradedraces/races.json")
    parser.add_argument("--report", default="monthly/monthly_update_report.json")
    args = parser.parse_args()

    root = Path.cwd()
    monthly_path = root / args.monthly_js
    grade_path = root / args.graded_races
    report_path = root / args.report
    target = parse_target(args.date)

    payload, original_text = load_monthly_data(monthly_path)
    target_day = find_day(payload, target)
    before = [dict(item) for item in target_day.get("venues", [])]
    grades = load_grade_records(grade_path)
    session = OfficialSession()
    results: list[SourceResult] = []

    for collector in SOURCE_COLLECTORS:
        try:
            result = collector(target, session)
        except Exception as exc:
            sport = collector.__module__.rsplit(".", 1)[-1].replace("autorace", "auto").replace("boatrace", "boat")
            result = SourceResult(sport=sport, ok=False, error=str(exc))
        results.append(result)

    current_entries = [dict(item) for item in target_day.get("venues", [])]
    for result in results:
        existing_for_sport = [item for item in current_entries if item.get("sport") == result.sport]
        other_sports = [item for item in current_entries if item.get("sport") != result.sport]
        if not result.ok:
            continue
        # HTML構造変更による誤消去を避けるため、既存開催がある日に0件取得となった場合は保守的に維持する。
        if existing_for_sport and not result.entries:
            result.warnings.append("取得結果が0件だったため、既存データを保全しました。")
            continue
        merged_entries: list[dict[str, Any]] = []
        for fresh in result.entries:
            old = next(
                (
                    item
                    for item in existing_for_sport
                    if item.get("venue") == fresh.get("venue")
                ),
                None,
            )
            merged_entries.append(merge_entry(old, fresh))
        current_entries = other_sports + merged_entries

    # 各競技の当日開催を公式情報で更新し、重賞格は最新マスターで補正する。
    overlay_grades(current_entries, grades, target)
    for item in current_entries:
        if item.get("grade"):
            item["grade"] = normalize_grade(str(item.get("sport", "")), item.get("grade"))
    target_day["venues"] = sort_entries(current_entries)

    # 日目は各公式ページの表記、または既存の年間開催日程を優先する。
    # 同一場で開催が連続する別節を誤って一つの開催として数えないため、日付の連続だけでは再計算しない。
    target_day["venues"] = sort_entries(target_day["venues"])

    write_monthly_data(monthly_path, payload, original_text)
    after = [dict(item) for item in target_day.get("venues", [])]
    report = {
        "generated_at": datetime.now(JST).isoformat(),
        "target_date": target.isoformat(),
        "before_count": len(before),
        "after_count": len(after),
        "changed": before != after,
        "before": before,
        "after": after,
        "sources": [source_summary(result) for result in results],
    }
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    failed_count = sum(1 for result in results if not result.ok)
    print(json.dumps({"target_date": target.isoformat(), "changed": before != after, "sources_failed": failed_count}, ensure_ascii=False))
    if args.fail_if_all_sources_fail and failed_count == len(results):
        print("全開催日程ソースの取得に失敗しました。", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
