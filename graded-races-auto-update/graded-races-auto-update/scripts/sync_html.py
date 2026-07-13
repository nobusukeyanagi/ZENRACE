from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

PATTERN = re.compile(r"const DEFAULT_DATA=(\[.*?\]);\nconst SPORT_ORDER", re.S)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="races.jsonをHTMLのDEFAULT_DATAへ埋め込みます。")
    parser.add_argument("--json", default="races.json")
    parser.add_argument("--html", default="graded_races_schedule.html")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    json_path = Path(args.json)
    html_path = Path(args.html)
    races = json.loads(json_path.read_text(encoding="utf-8"))
    html = html_path.read_text(encoding="utf-8")
    compact = json.dumps(races, ensure_ascii=False, separators=(",", ":"))
    match = PATTERN.search(html)
    if not match:
        print("HTML内の DEFAULT_DATA を見つけられません", file=sys.stderr)
        return 1
    html = html[: match.start(1)] + compact + html[match.end(1) :]
    html_path.write_text(html, encoding="utf-8", newline="\n")
    print(f"同期完了: {html_path} ({len(races)}件)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
