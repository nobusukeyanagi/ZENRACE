from __future__ import annotations

import re
from datetime import date
from typing import Any

from bs4 import BeautifulSoup, NavigableString, Tag

from monthly.scripts.common import (
    OfficialSession,
    SourceResult,
    clean_text,
    daterange,
    normalize_grade,
)

SPORT = "keirin"
URL = "https://www.keirin.jp/sp/raceschedule"
VENUES = {
    "函館", "青森", "いわき平", "弥彦", "前橋", "取手", "宇都宮", "大宮", "西武園", "京王閣", "立川",
    "松戸", "川崎", "平塚", "小田原", "伊東", "静岡", "名古屋", "岐阜", "大垣", "豊橋", "富山",
    "松阪", "四日市", "福井", "奈良", "向日町", "和歌山", "岸和田", "玉野", "広島", "防府", "高松",
    "小松島", "高知", "松山", "小倉", "久留米", "武雄", "佐世保", "別府", "熊本",
}
DATE_RANGE_RE = re.compile(
    r"(?P<sm>\d{1,2})/(?P<sd>\d{1,2}).*?[～〜~-](?P<em>\d{1,2})/(?P<ed>\d{1,2})"
)
GRADE_RE = re.compile(r"^(?:F[12ⅠⅡ]|G[123ⅠⅡⅢ]|GP)$", re.I)
SESSION_BY_ALT = {"8": "morning", "3": "night", "5": "midnight"}


def _stream(soup: BeautifulSoup) -> list[tuple[str, str]]:
    tokens: list[tuple[str, str]] = []
    for node in soup.descendants:
        if isinstance(node, Tag) and node.name == "img":
            alt = clean_text(node.get("alt", ""))
            if alt:
                tokens.append(("img", alt))
        elif isinstance(node, NavigableString):
            text = clean_text(node)
            if text:
                tokens.append(("text", text))
    return tokens


def _range_dates(target: date, start_month: int, start_day: int, end_month: int, end_day: int) -> tuple[date, date]:
    start_year = target.year - 1 if target.month == 1 and start_month == 12 else target.year
    end_year = start_year + (1 if end_month < start_month else 0)
    return date(start_year, start_month, start_day), date(end_year, end_month, end_day)


def collect(target: date, session: OfficialSession) -> SourceResult:
    response = session.get(URL, params={"scyy": str(target.year), "scym": f"{target.month:02d}"})
    soup = BeautifulSoup(response.text, "lxml")
    tokens = _stream(soup)
    current_venue = ""
    recent_images: list[str] = []
    entries: list[dict[str, Any]] = []
    seen_ranges: set[tuple[str, date, date]] = set()

    for index, (kind, value) in enumerate(tokens):
        if kind == "text" and value in VENUES:
            # メニュー部の開催場名を誤採用しないよう、後方に日付範囲がある場合だけ見出しとして採用する。
            if any(DATE_RANGE_RE.search(next_value) for next_kind, next_value in tokens[index + 1 : index + 18] if next_kind == "text"):
                current_venue = value
                recent_images = []
            continue
        if kind == "img":
            recent_images.append(value)
            recent_images = recent_images[-8:]
            continue
        if not current_venue:
            continue
        match = DATE_RANGE_RE.search(value)
        if not match:
            continue

        start_month = int(match.group("sm"))
        start, end = _range_dates(
            target,
            start_month,
            int(match.group("sd")),
            int(match.group("em")),
            int(match.group("ed")),
        )
        key = (current_venue, start, end)
        if key in seen_ranges:
            recent_images = []
            continue
        seen_ranges.add(key)

        grade = ""
        session_name = ""
        girls = False
        for alt in recent_images:
            compact = clean_text(alt).upper().replace("Ｆ", "F").replace("Ｇ", "G")
            if GRADE_RE.fullmatch(compact):
                grade = normalize_grade(SPORT, compact)
            if compact in SESSION_BY_ALT:
                session_name = SESSION_BY_ALT[compact]
            if "ガールズ" in alt or compact == "L":
                girls = True

        days = list(daterange(start, end))
        if target in days:
            offset = days.index(target)
            label = "初日" if offset == 0 else ("最終日" if offset == len(days) - 1 else f"{offset + 1}日目")
            item: dict[str, Any] = {"sport": SPORT, "venue": current_venue, "day": label}
            if grade:
                item["grade"] = grade
            if session_name:
                item["session"] = session_name
            if girls:
                item["girls"] = True
            entries.append(item)
        recent_images = []

    if not entries and "開催日程" not in soup.get_text(" ", strip=True):
        return SourceResult(SPORT, False, fetched_urls=[response.url], error="KEIRIN.JP開催日程を確認できませんでした")
    return SourceResult(SPORT, True, entries=entries, fetched_urls=[response.url])
