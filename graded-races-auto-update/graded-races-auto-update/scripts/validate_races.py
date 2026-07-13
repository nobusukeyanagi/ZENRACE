from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path
from typing import Any

VALID_SPORTS = {"jra", "nar", "boat", "keirin", "auto"}
TIME_RE = re.compile(r"^(?:[0-2]\d:[0-5]\d|中止)?$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="races.jsonを検証します。")
    parser.add_argument("path", nargs="?", default="races.json")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    path = Path(args.path)
    records: Any = json.loads(path.read_text(encoding="utf-8"))
    errors: list[str] = []
    if not isinstance(records, list):
        errors.append("最上位が配列ではありません")
        records = []

    seen: set[tuple[str, str, str, str]] = set()
    for index, record in enumerate(records, start=1):
        if not isinstance(record, dict):
            errors.append(f"{index}件目: オブジェクトではありません")
            continue
        date_text = str(record.get("date", ""))
        try:
            dt.date.fromisoformat(date_text)
        except ValueError:
            errors.append(f"{index}件目: dateが不正です: {date_text}")
        sport = str(record.get("sport", ""))
        if sport not in VALID_SPORTS:
            errors.append(f"{index}件目: sportが不正です: {sport}")
        if not str(record.get("venue", "")).strip():
            errors.append(f"{index}件目: venueが空です")
        time_text = str(record.get("time", ""))
        if not TIME_RE.fullmatch(time_text):
            errors.append(f"{index}件目: timeが不正です: {time_text}")
        for field in ("name", "winner"):
            if not isinstance(record.get(field, ""), str):
                errors.append(f"{index}件目: {field}が文字列ではありません")
        key = (date_text, sport, str(record.get("venue", "")), str(record.get("name", "")))
        if key in seen and key[3]:
            errors.append(f"{index}件目: 重複しています: {key}")
        seen.add(key)

    if errors:
        print("検証エラー:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"OK: {len(records)}件")
    return 0


if __name__ == "__main__":
    sys.exit(main())
