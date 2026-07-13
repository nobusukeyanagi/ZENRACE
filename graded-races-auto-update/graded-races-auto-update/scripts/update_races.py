from __future__ import annotations

import argparse
import datetime as dt
import json
import logging
import sys
from pathlib import Path
from typing import Any

from scripts.common import (
    RateLimitedSession,
    SourceResult,
    date_window,
    in_window,
    load_json,
    merge_patches,
    now_jst,
    save_json,
)
from scripts.sources import autorace, boatrace, jra, keirin, nar

LOGGER = logging.getLogger("update_races")
ADAPTERS = (jra, nar, boatrace, keirin, autorace)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="前後数日間の公営競技重賞情報を公式サイトから更新します。")
    parser.add_argument("--config", default="config.json")
    parser.add_argument("--date", help="基準日 YYYY-MM-DD。省略時は日本時間の当日")
    parser.add_argument("--before", type=int, help="基準日の何日前まで更新するか")
    parser.add_argument("--after", type=int, help="基準日の何日後まで更新するか")
    parser.add_argument("--dry-run", action="store_true", help="ファイルを書き換えず差分だけ作成")
    parser.add_argument("--fail-if-all-sources-fail", action="store_true", help="全競技の取得に失敗した場合は終了コード2")
    return parser.parse_args()


def configure_logging() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


def result_to_json(result: SourceResult) -> dict[str, Any]:
    return {
        "name": result.name,
        "ok": result.ok,
        "patch_count": len(result.patches),
        "fetched_urls": result.fetched_urls,
        "warnings": result.warnings,
        "error": result.error,
    }


def main() -> int:
    configure_logging()
    args = parse_args()
    root = Path(__file__).resolve().parents[1]
    config_path = (root / args.config).resolve()
    config = load_json(config_path)

    center = dt.date.fromisoformat(args.date) if args.date else now_jst().date()
    before = args.before if args.before is not None else int(config.get("days_before", 3))
    after = args.after if args.after is not None else int(config.get("days_after", 3))
    start, end = date_window(center, before, after)

    data_path = root / str(config.get("data_file", "races.json"))
    changes_path = root / str(config.get("changes_file", "changes.json"))
    status_path = root / str(config.get("source_status_file", "source_status.json"))

    all_records = load_json(data_path)
    if not isinstance(all_records, list):
        raise TypeError("races.json の最上位は配列である必要があります")

    target_indices = [index for index, record in enumerate(all_records) if in_window(record, start, end)]
    target_records = [dict(all_records[index]) for index in target_indices]
    LOGGER.info("更新対象: %s ～ %s、%d件", start, end, len(target_records))

    if not target_records:
        generated_at = now_jst().isoformat()
        save_json(changes_path, {"generated_at": generated_at, "window": {"start": str(start), "end": str(end)}, "changes": []})
        save_json(status_path, {"generated_at": generated_at, "sources": [], "note": "対象期間に登録済みレースがありません"})
        LOGGER.info("対象期間にレースがありません")
        return 0

    session = RateLimitedSession(
        timeout=int(config.get("request_timeout_seconds", 25)),
        interval=float(config.get("request_interval_seconds", 0.8)),
        user_agent=str(config.get("user_agent", "graded-races-schedule-updater/1.0")),
    )

    results: list[SourceResult] = []
    local_patches = []
    for adapter in ADAPTERS:
        result = adapter.collect(target_records, session, LOGGER)
        results.append(result)
        for patch in result.patches:
            # アダプターは対象期間内のローカル配列のインデックスを返す。
            if 0 <= patch.index < len(target_indices):
                patch.index = target_indices[patch.index]
                local_patches.append(patch)
        LOGGER.info("%s: ok=%s patches=%d warnings=%d", result.name, result.ok, len(result.patches), len(result.warnings))

    updated_records, changes = merge_patches(all_records, local_patches)
    report = {
        "generated_at": now_jst().isoformat(),
        "center_date": center.isoformat(),
        "window": {"start": start.isoformat(), "end": end.isoformat()},
        "target_count": len(target_records),
        "change_count": len(changes),
        "changes": changes,
    }
    status = {
        "generated_at": now_jst().isoformat(),
        "sources": [result_to_json(result) for result in results],
    }

    save_json(changes_path, report)
    save_json(status_path, status)
    if not args.dry_run:
        save_json(data_path, updated_records)
    else:
        LOGGER.info("dry-runのため races.json は変更しません")

    failed = [result for result in results if not result.ok]
    LOGGER.info("変更件数: %d / 取得失敗: %d競技", len(changes), len(failed))
    if args.fail_if_all_sources_fail and results and all(not result.ok for result in results):
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
