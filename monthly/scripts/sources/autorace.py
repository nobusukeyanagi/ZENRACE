from __future__ import annotations

import re
from datetime import date
from typing import Any

from bs4 import BeautifulSoup

from monthly.scripts.common import OfficialSession, SourceResult, clean_text

SPORT = "auto"
VENUES = {
    "川口": "kawaguchi",
    "伊勢崎": "isesaki",
    "浜松": "hamamatsu",
    "飯塚": "iizuka",
    "山陽": "sanyo",
}
TIME_RE = re.compile(r"(?:発走(?:予定)?|締切(?:予定)?)\s*([0-2]?\d:[0-5]\d)")


def _session_from_text(text: str, first_time: str) -> str:
    if "ミッドナイト" in text:
        return "midnight"
    if "ナイター" in text or "アフター5" in text:
        return "night"
    if "アーリー" in text:
        return "morning"
    if first_time:
        hour = int(first_time.split(":", 1)[0])
        if hour <= 10:
            return "morning"
        if hour >= 14:
            return "night"
    return ""


def collect(target: date, session: OfficialSession) -> SourceResult:
    entries: list[dict[str, Any]] = []
    fetched: list[str] = []
    warnings: list[str] = []
    successful = 0
    for venue, slug in VENUES.items():
        url = f"https://autorace.jp/race_info/Program/{slug}/{target.isoformat()}_01"
        try:
            response = session.get(url)
            fetched.append(response.url)
            soup = BeautifulSoup(response.text, "lxml")
            text = clean_text(soup.get_text(" ", strip=True))
            if venue not in text or len(text) < 250 or "ページが見つかりません" in text:
                continue
            if not any(token in text for token in ("1R", "第1レース", "発走", "出走表")):
                continue
            successful += 1
            times = TIME_RE.findall(text)
            first_time = times[0] if times else ""
            item: dict[str, Any] = {"sport": SPORT, "venue": venue, "grade": "普通"}
            session_name = _session_from_text(text, first_time)
            if session_name:
                item["session"] = session_name
            entries.append(item)
        except Exception as exc:
            warnings.append(f"{venue}: {exc}")
    if successful == 0 and len(warnings) == len(VENUES):
        return SourceResult(SPORT, False, fetched_urls=fetched, warnings=warnings, error="AutoRace.JPの当日出走表へ接続できませんでした")
    return SourceResult(SPORT, True, entries=entries, fetched_urls=fetched, warnings=warnings)
