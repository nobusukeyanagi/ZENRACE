from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo


RACES_PATH = Path("races.json")
STATE_PATH = Path("discord_notification_state.json")
JST = ZoneInfo("Asia/Tokyo")
DISCORD_MAX_LENGTH = 1900

SPORT_NAMES = {
    "jra": "JRA",
    "nar": "地方競馬",
    "boat": "ボートレース",
    "keirin": "競輪",
    "auto": "オートレース",
}

SPORT_ORDER = {
    "jra": 0,
    "nar": 1,
    "boat": 2,
    "keirin": 3,
    "auto": 4,
}

WEEKDAY_NAMES = ("月", "火", "水", "木", "金", "土", "日")


def truthy(value: str) -> bool:
    return value.strip().lower() in {"1", "true", "yes", "on"}


def get_target_date() -> str:
    specified = os.environ.get("NOTIFY_DATE", "").strip()
    if specified:
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", specified):
            raise ValueError("NOTIFY_DATEはYYYY-MM-DD形式で指定してください。")
        datetime.strptime(specified, "%Y-%m-%d")
        return specified
    return datetime.now(JST).strftime("%Y-%m-%d")


def get_site_url() -> str:
    configured = os.environ.get("SITE_URL", "").strip()
    if configured:
        return configured

    repository = os.environ.get("GITHUB_REPOSITORY", "").strip()
    if "/" not in repository:
        raise ValueError(
            "SITE_URLが未設定で、GITHUB_REPOSITORYからも公開URLを判定できません。"
        )

    owner, repo_name = repository.split("/", 1)
    if repo_name.lower() == f"{owner.lower()}.github.io":
        return f"https://{owner}.github.io/gradedraces/"
    return f"https://{owner}.github.io/{repo_name}/gradedraces/"


def load_races() -> list[dict[str, Any]]:
    if not RACES_PATH.exists():
        raise FileNotFoundError("races.jsonが見つかりません。")
    payload = json.loads(RACES_PATH.read_text(encoding="utf-8"))
    if not isinstance(payload, list):
        raise ValueError("races.jsonの最上位は配列である必要があります。")
    return [race for race in payload if isinstance(race, dict)]


def load_state() -> dict[str, Any]:
    if not STATE_PATH.exists():
        return {}
    try:
        payload = json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return payload if isinstance(payload, dict) else {}


def save_state(target_date: str, count: int) -> None:
    state = {
        "last_notified_date": target_date,
        "last_notified_count": count,
        "notified_at": datetime.now(timezone.utc).isoformat(),
    }
    STATE_PATH.write_text(
        json.dumps(state, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def time_value(value: str) -> int:
    if re.fullmatch(r"\d{2}:\d{2}", value):
        hour, minute = map(int, value.split(":"))
        return hour * 60 + minute
    return 24 * 60 + 1


def format_race(race: dict[str, Any]) -> str:
    time_text = str(race.get("time", "")).strip() or "時刻未定"
    sport = SPORT_NAMES.get(
        str(race.get("sport", "")).strip(),
        str(race.get("sport", "")).strip(),
    )
    venue = str(race.get("venue", "")).strip()
    grade = str(race.get("grade", "")).strip()
    name = str(race.get("name", "")).strip()
    values = [time_text, sport, venue, grade, name]
    return " ".join(value for value in values if value)


def format_target_date(target_date: str) -> str:
    parsed = datetime.strptime(target_date, "%Y-%m-%d")
    return f"{parsed.month}/{parsed.day} ({WEEKDAY_NAMES[parsed.weekday()]})"


def build_message_block(
    title: str,
    date_text: str,
    race_lines: list[str],
    site_url: str,
) -> str:
    return "\n".join([title, date_text, *race_lines, site_url])


def build_messages(
    target_date: str,
    site_url: str,
    races: list[dict[str, Any]],
) -> list[str]:
    todays_races = [
        race
        for race in races
        if str(race.get("date", "")).strip() == target_date
    ]
    todays_races.sort(
        key=lambda race: (
            time_value(str(race.get("time", "")).strip()),
            SPORT_ORDER.get(str(race.get("sport", "")).strip(), 99),
            str(race.get("venue", "")).strip(),
            str(race.get("name", "")).strip(),
        )
    )

    title = "🏁本日のグレードレース"
    date_text = format_target_date(target_date)
    normalized_site_url = site_url.rstrip("/") + "/"

    if not todays_races:
        return [
            build_message_block(
                title,
                date_text,
                ["グレードレースはありません"],
                normalized_site_url,
            )
        ]

    race_lines = [format_race(race) for race in todays_races]
    messages: list[str] = []
    current_lines: list[str] = []

    for line in race_lines:
        candidate = build_message_block(
            title if not messages else "🏁本日のグレードレース（続き）",
            date_text,
            current_lines + [line],
            normalized_site_url,
        )
        if len(candidate) <= DISCORD_MAX_LENGTH:
            current_lines.append(line)
            continue

        if current_lines:
            messages.append(
                build_message_block(
                    title if not messages else "🏁本日のグレードレース（続き）",
                    date_text,
                    current_lines,
                    normalized_site_url,
                )
            )
            current_lines = [line]
            continue

        # 1行だけで上限を超える場合も、通知処理自体は止めない。
        messages.append(
            build_message_block(
                title if not messages else "🏁本日のグレードレース（続き）",
                date_text,
                [line[: max(1, DISCORD_MAX_LENGTH - 120)]],
                normalized_site_url,
            )
        )

    if current_lines:
        messages.append(
            build_message_block(
                title if not messages else "🏁本日のグレードレース（続き）",
                date_text,
                current_lines,
                normalized_site_url,
            )
        )

    return messages


def send_message(webhook_url: str, message: str) -> None:
    payload = json.dumps(
        {
            "content": message,
            "username": "公営競技重賞日程",
            "allowed_mentions": {"parse": []},
        },
        ensure_ascii=False,
    ).encode("utf-8")
    request = urllib.request.Request(
        webhook_url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "graded-races-schedule/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            if response.status not in (200, 204):
                raise RuntimeError(
                    f"Discord通知に失敗しました: HTTP {response.status}"
                )
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"Discord通知に失敗しました: HTTP {exc.code} {body}"
        ) from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(
            f"Discordへ接続できませんでした: {exc.reason}"
        ) from exc


def main() -> int:
    webhook_url = os.environ.get("DISCORD_WEBHOOK_URL", "").strip()
    if not webhook_url:
        print("DISCORD_WEBHOOK_URLが設定されていません。", file=sys.stderr)
        return 1

    try:
        target_date = get_target_date()
        force_notify = truthy(os.environ.get("FORCE_NOTIFY", ""))
        state = load_state()

        if (
            not force_notify
            and state.get("last_notified_date") == target_date
        ):
            print(f"{target_date}は通知済みのため、再送しません。")
            return 0

        site_url = get_site_url()
        races = load_races()
        messages = build_messages(target_date, site_url, races)
        for message in messages:
            send_message(webhook_url, message)

        count = sum(
            1
            for race in races
            if str(race.get("date", "")).strip() == target_date
        )
        save_state(target_date, count)

    except (
        OSError,
        json.JSONDecodeError,
        ValueError,
        RuntimeError,
    ) as exc:
        print(str(exc), file=sys.stderr)
        return 1

    print(f"{target_date}のグレードレース{count}件をDiscordへ通知しました。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
