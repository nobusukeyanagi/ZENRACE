from __future__ import annotations

import hashlib
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[2]
RACES_PATH = ROOT / "gradedraces" / "races.json"
MONTHLY_JS_PATH = ROOT / "monthly" / "monthly.js"
STATE_PATH = ROOT / "gradedraces" / "discord_notification_state.json"
JST = ZoneInfo("Asia/Tokyo")
DISCORD_MAX_LENGTH = 1900
MONTHLY_DATA_RE = re.compile(r"const MONTHLY_DATA = (?P<data>\{.*?\});\n\n  const WEEKDAY", re.S)

SPORT_NAMES = {
    "keirin": "競輪",
    "auto": "オートレース",
    "boat": "ボートレース",
    "nar": "地方競馬",
    "jra": "JRA",
}
SPORT_ORDER = {"keirin": 0, "auto": 1, "boat": 2, "nar": 3, "jra": 4}
VENUE_ORDER = {
    "keirin": ["函館", "青森", "いわき平", "弥彦", "前橋", "取手", "宇都宮", "大宮", "西武園", "京王閣", "立川", "松戸", "川崎", "平塚", "小田原", "伊東", "静岡", "名古屋", "岐阜", "大垣", "豊橋", "富山", "松阪", "四日市", "福井", "奈良", "向日町", "和歌山", "岸和田", "玉野", "広島", "防府", "高松", "小松島", "高知", "松山", "小倉", "久留米", "武雄", "佐世保", "別府", "熊本"],
    "auto": ["川口", "伊勢崎", "浜松", "飯塚", "山陽"],
    "boat": ["桐生", "戸田", "江戸川", "平和島", "多摩川", "浜名湖", "蒲郡", "常滑", "津", "三国", "びわこ", "住之江", "尼崎", "鳴門", "丸亀", "児島", "宮島", "徳山", "下関", "若松", "芦屋", "福岡", "唐津", "大村"],
    "nar": ["帯広", "門別", "盛岡", "水沢", "浦和", "船橋", "大井", "川崎", "金沢", "笠松", "名古屋", "園田", "姫路", "高知", "佐賀"],
    "jra": ["札幌", "函館", "福島", "新潟", "東京", "中山", "中京", "京都", "阪神", "小倉"],
}
VENUE_RANK = {sport: {venue: index for index, venue in enumerate(venues)} for sport, venues in VENUE_ORDER.items()}
WEEKDAY_NAMES = ("月", "火", "水", "木", "金", "土", "日")
SESSION_NAMES = {"morning": "モーニング", "night": "ナイター", "midnight": "ミッドナイト"}


def truthy(value: str) -> bool:
    return value.strip().lower() in {"1", "true", "yes", "on"}


def get_target_date() -> str:
    specified = os.environ.get("NOTIFY_DATE", "").strip()
    if specified:
        date.fromisoformat(specified)
        return specified
    return datetime.now(JST).date().isoformat()


def site_urls() -> tuple[str, str]:
    graded = os.environ.get("GRADED_SITE_URL", "").strip()
    monthly = os.environ.get("MONTHLY_SITE_URL", "").strip()
    if graded and monthly:
        return graded.rstrip("/") + "/", monthly.rstrip("/") + "/"

    configured = os.environ.get("SITE_URL", "").strip()
    if configured:
        base = configured.rstrip("/")
        for suffix in ("/gradedraces", "/monthly"):
            if base.endswith(suffix):
                base = base[: -len(suffix)]
                break
        return base + "/gradedraces/", base + "/monthly/"

    repository = os.environ.get("GITHUB_REPOSITORY", "").strip()
    if "/" not in repository:
        raise ValueError("SITE_URLまたはGITHUB_REPOSITORYから公開URLを判定できません。")
    owner, repo_name = repository.split("/", 1)
    base = f"https://{owner}.github.io" if repo_name.lower() == f"{owner.lower()}.github.io" else f"https://{owner}.github.io/{repo_name}"
    return base + "/gradedraces/", base + "/monthly/"


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def load_races() -> list[dict[str, Any]]:
    payload = load_json(RACES_PATH)
    if not isinstance(payload, list):
        raise ValueError("races.jsonの最上位は配列である必要があります。")
    return [item for item in payload if isinstance(item, dict)]


def load_monthly_data() -> dict[str, list[dict[str, Any]]]:
    text = MONTHLY_JS_PATH.read_text(encoding="utf-8")
    match = MONTHLY_DATA_RE.search(text)
    if not match:
        raise ValueError("monthly.jsからMONTHLY_DATAを読み取れません。")
    payload = json.loads(match.group("data"))
    if not isinstance(payload, dict):
        raise ValueError("MONTHLY_DATAの最上位が不正です。")
    return payload


def load_state() -> dict[str, Any]:
    if not STATE_PATH.exists():
        return {}
    try:
        payload = load_json(STATE_PATH)
    except (OSError, json.JSONDecodeError):
        return {}
    return payload if isinstance(payload, dict) else {}


def save_state(target_date: str, graded_count: int, venue_count: int, message_digest: str) -> None:
    payload = {
        "last_notified_date": target_date,
        "last_notified_graded_count": graded_count,
        "last_notified_venue_count": venue_count,
        "last_message_digest": message_digest,
        "notified_at": datetime.now(timezone.utc).isoformat(),
    }
    STATE_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def time_value(value: str) -> int:
    if re.fullmatch(r"\d{1,2}:\d{2}", value):
        hour, minute = map(int, value.split(":"))
        return hour * 60 + minute
    return 24 * 60 + 1


def format_date(target_date: str) -> str:
    parsed = date.fromisoformat(target_date)
    return f"{parsed.month}/{parsed.day} ({WEEKDAY_NAMES[parsed.weekday()]})"


def format_race(race: dict[str, Any]) -> str:
    values = [
        str(race.get("time", "")).strip() or "時刻未定",
        SPORT_NAMES.get(str(race.get("sport", "")), str(race.get("sport", ""))),
        str(race.get("venue", "")).strip(),
        str(race.get("grade", "")).strip(),
        str(race.get("name", "")).strip(),
    ]
    return " ".join(value for value in values if value)


def target_venues(monthly_data: dict[str, list[dict[str, Any]]], target_date: str) -> list[dict[str, Any]]:
    month = target_date[:7]
    for row in monthly_data.get(month, []):
        if row.get("date") == target_date:
            venues = [dict(item) for item in row.get("venues", []) if isinstance(item, dict)]
            return sorted(
                venues,
                key=lambda item: (
                    SPORT_ORDER.get(str(item.get("sport", "")), 99),
                    VENUE_RANK.get(str(item.get("sport", "")), {}).get(str(item.get("venue", "")), 999),
                    str(item.get("venue", "")),
                ),
            )
    return []


def format_venue(item: dict[str, Any]) -> str:
    sport = str(item.get("sport", ""))
    values = [str(item.get("venue", "")).strip()]
    grade = str(item.get("grade", "")).strip()
    if grade:
        values.append(grade)
    if sport in {"keirin", "auto", "boat"}:
        day = str(item.get("day", "")).strip()
        if day:
            values.append(day)
    session = SESSION_NAMES.get(str(item.get("session", "")).strip(), "")
    if session:
        values.append(session)
    if item.get("girls"):
        values.append("ガールズ")
    return " ".join(values)


def build_full_message(target_date: str, races: list[dict[str, Any]], venues: list[dict[str, Any]], graded_url: str, monthly_url: str) -> str:
    todays_races = [item for item in races if str(item.get("date", "")) == target_date]
    todays_races.sort(
        key=lambda item: (
            time_value(str(item.get("time", ""))),
            SPORT_ORDER.get(str(item.get("sport", "")), 99),
            str(item.get("venue", "")),
            str(item.get("name", "")),
        )
    )
    lines = [f"{format_date(target_date)} の公営競技", "🏆グレードレース（優勝戦・決勝）"]
    lines.extend(format_race(item) for item in todays_races)
    if not todays_races:
        lines.append("グレードレースはありません")
    lines.extend([graded_url, "", "🏁開催場"])
    lines.extend(format_venue(item) for item in venues)
    if not venues:
        lines.append("開催はありません")
    lines.append(monthly_url)
    return "\n".join(lines)


def split_message(message: str) -> list[str]:
    if len(message) <= DISCORD_MAX_LENGTH:
        return [message]
    lines = message.splitlines()
    chunks: list[str] = []
    current: list[str] = []
    for line in lines:
        candidate = "\n".join(current + [line])
        if current and len(candidate) > DISCORD_MAX_LENGTH:
            chunks.append("\n".join(current))
            current = ["（続き）", line]
        else:
            current.append(line)
    if current:
        chunks.append("\n".join(current))
    return chunks


def send_message(webhook_url: str, message: str) -> None:
    payload = json.dumps(
        {"content": message, "username": "公営競技開催情報", "allowed_mentions": {"parse": []}},
        ensure_ascii=False,
    ).encode("utf-8")
    request = urllib.request.Request(
        webhook_url,
        data=payload,
        headers={"Content-Type": "application/json", "User-Agent": "zenrace-public-racing-schedule/1.0"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            if response.status not in (200, 204):
                raise RuntimeError(f"Discord通知に失敗しました: HTTP {response.status}")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Discord通知に失敗しました: HTTP {exc.code} {body}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Discordへ接続できませんでした: {exc.reason}") from exc


def main() -> int:
    webhook_url = os.environ.get("DISCORD_WEBHOOK_URL", "").strip()
    if not webhook_url:
        print("DISCORD_WEBHOOK_URLが設定されていません。", file=sys.stderr)
        return 1
    try:
        target_date = get_target_date()
        force_notify = truthy(os.environ.get("FORCE_NOTIFY", ""))
        state = load_state()
        if not force_notify and state.get("last_notified_date") == target_date:
            print(f"{target_date}は通知済みのため、再送しません。")
            return 0

        graded_url, monthly_url = site_urls()
        races = load_races()
        monthly_data = load_monthly_data()
        venues = target_venues(monthly_data, target_date)
        message = build_full_message(target_date, races, venues, graded_url, monthly_url)
        digest = hashlib.sha256(message.encode("utf-8")).hexdigest()
        for chunk in split_message(message):
            send_message(webhook_url, chunk)
        graded_count = sum(1 for item in races if str(item.get("date", "")) == target_date)
        save_state(target_date, graded_count, len(venues), digest)
    except (OSError, json.JSONDecodeError, ValueError, RuntimeError) as exc:
        print(str(exc), file=sys.stderr)
        return 1
    print(f"{target_date}のグレードレース{graded_count}件、開催場{len(venues)}件をDiscordへ通知しました。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
