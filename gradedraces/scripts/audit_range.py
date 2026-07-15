from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any


def parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def date_ranges(start: date, end: date, days: int):
    cursor = start
    while cursor <= end:
        chunk_end = min(end, cursor + timedelta(days=days - 1))
        yield cursor, chunk_end
        cursor = chunk_end + timedelta(days=1)


def run_chunk(chunk_start: date, chunk_end: date) -> dict[str, Any]:
    center = chunk_start + (chunk_end - chunk_start) // 2
    before = (center - chunk_start).days
    after = (chunk_end - center).days

    command = [
        sys.executable,
        "-m",
        "scripts.update_races",
        "--date",
        center.isoformat(),
        "--before",
        str(before),
        "--after",
        str(after),
        "--fail-if-all-sources-fail",
    ]

    print(f"[range-update] {chunk_start} - {chunk_end}", flush=True)
    completed = subprocess.run(command, check=False)
    return {
        "start": chunk_start.isoformat(),
        "end": chunk_end.isoformat(),
        "returncode": completed.returncode,
    }


def load_registered_range(path: Path) -> tuple[str, str, int]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, list):
        raise TypeError("races.jsonの最上位は配列である必要があります。")

    dates: list[date] = []
    for item in payload:
        if not isinstance(item, dict) or not item.get("date"):
            continue
        try:
            dates.append(parse_date(str(item["date"])))
        except ValueError:
            continue

    if not dates:
        return "", "", 0

    return min(dates).isoformat(), max(dates).isoformat(), len(payload)


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "指定期間を分割し、全競技の登録済みグレードレースについて、"
            "日付・発走時刻・正式名称・優勝者などを公式取得処理で再確認します。"
        )
    )
    parser.add_argument("--start", required=True)
    parser.add_argument("--end", required=True)
    parser.add_argument("--chunk-days", type=int, default=31)
    parser.add_argument("--races", default="races.json")
    parser.add_argument("--report", default="range_update_report.json")
    parser.add_argument("--fail-if-any-chunk-fails", action="store_true")
    args = parser.parse_args()

    start = parse_date(args.start)
    end = parse_date(args.end)
    if end < start:
        raise ValueError("終了日は開始日以降にしてください。")
    if not 1 <= args.chunk_days <= 62:
        raise ValueError("chunk-daysは1〜62で指定してください。")

    results = [
        run_chunk(chunk_start, chunk_end)
        for chunk_start, chunk_end in date_ranges(start, end, args.chunk_days)
    ]

    normalize = subprocess.run(
        [
            sys.executable,
            "-m",
            "scripts.normalize_grades",
            args.races,
            "--start",
            start.isoformat(),
        ],
        check=False,
    )

    registered_start, registered_end, registered_count = load_registered_range(
        Path(args.races)
    )
    failed_chunks = [item for item in results if item["returncode"] != 0]

    warnings: list[str] = []
    if registered_end and parse_date(registered_end) < end:
        warnings.append(
            "races.jsonの登録最終日が指定終了日より前です。"
            "現行のupdate_racesは登録済みレースの再確認が中心のため、"
            "未登録の翌年度日程は別途、年間基礎日程の追加処理が必要です。"
        )

    summary = {
        "requested_start": start.isoformat(),
        "requested_end": end.isoformat(),
        "chunk_days": args.chunk_days,
        "successful_chunks": len(results) - len(failed_chunks),
        "failed_chunks": len(failed_chunks),
        "total_chunks": len(results),
        "grade_normalization_returncode": normalize.returncode,
        "registered_start": registered_start,
        "registered_end": registered_end,
        "registered_count": registered_count,
        "warnings": warnings,
        "chunks": results,
    }
    Path(args.report).write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    for warning in warnings:
        print(f"::warning::{warning}", flush=True)

    if normalize.returncode != 0:
        return 1
    if not results:
        return 1
    if args.fail_if_any_chunk_fails and failed_chunks:
        return 1
    if len(failed_chunks) == len(results):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
