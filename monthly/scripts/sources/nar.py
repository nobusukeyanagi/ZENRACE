from __future__ import annotations

import re
from datetime import date
from typing import Any

from bs4 import BeautifulSoup

from monthly.scripts.common import OfficialSession, SourceResult, clean_text

SPORT = "nar"
URL = "https://www.keiba.go.jp/KeibaWeb/TodayRaceInfo/RaceList"
VENUE_CODES = {
    "帯広": "03", "門別": "36", "盛岡": "10", "水沢": "11", "浦和": "18", "船橋": "19", "大井": "20",
    "川崎": "21", "金沢": "22", "笠松": "23", "名古屋": "24", "園田": "27", "姫路": "28", "高知": "31", "佐賀": "32",
}
TIME_RE = re.compile(r"\b(?:1[0-9]|2[0-3]|[0-9]):[0-5][0-9]\b")


def collect(target: date, session: OfficialSession) -> SourceResult:
    entries: list[dict[str, Any]] = []
    fetched: list[str] = []
    warnings: list[str] = []
    successful_requests = 0
    expected_date = f"{target.year}年{target.month}月{target.day}日"

    for venue, code in VENUE_CODES.items():
        try:
            response = session.get(URL, params={"k_raceDate": target.strftime("%Y/%m/%d"), "k_babaCode": code})
            fetched.append(response.url)
            soup = BeautifulSoup(response.text, "lxml")
            text = clean_text(soup.get_text(" ", strip=True))
            successful_requests += 1
            venue_tokens = {venue, "帯広ば" if venue == "帯広" else venue}
            if expected_date not in text or not any(token in text for token in venue_tokens) or "当日メニュー" not in text:
                continue
            item: dict[str, Any] = {"sport": SPORT, "venue": venue}
            times = TIME_RE.findall(text)
            if times and max(int(value.split(":", 1)[0]) * 60 + int(value.split(":", 1)[1]) for value in times) >= 18 * 60:
                item["session"] = "night"
            entries.append(item)
        except Exception as exc:
            warnings.append(f"{venue}: {exc}")

    if successful_requests == 0:
        return SourceResult(SPORT, False, fetched_urls=fetched, warnings=warnings, error="地方競馬当日メニューへ接続できませんでした")
    return SourceResult(SPORT, True, entries=entries, fetched_urls=fetched, warnings=warnings)
