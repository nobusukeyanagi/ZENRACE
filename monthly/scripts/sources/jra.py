from __future__ import annotations

import re
from datetime import date
from typing import Any

from bs4 import BeautifulSoup

from monthly.scripts.common import OfficialSession, SourceResult, clean_text

SPORT = "jra"
URL = "https://www.jra.go.jp/keiba/calendar{year}/{year}/{month}/{month:02d}{day:02d}.html"
VENUES = ["札幌", "函館", "福島", "新潟", "東京", "中山", "中京", "京都", "阪神", "小倉"]


def collect(target: date, session: OfficialSession) -> SourceResult:
    url = URL.format(year=target.year, month=target.month, day=target.day)
    try:
        response = session.get(url)
    except Exception as exc:
        # 平日など競馬番組ページが存在しない日は「開催なし」として扱えるが、接続障害とは区別する。
        status = getattr(getattr(exc, "response", None), "status_code", None)
        if status == 404:
            return SourceResult(SPORT, True, entries=[], fetched_urls=[url])
        return SourceResult(SPORT, False, fetched_urls=[url], error=str(exc))

    soup = BeautifulSoup(response.text, "lxml")
    text = clean_text(soup.get_text(" ", strip=True))
    if f"{target.year}年{target.month}月{target.day}日" not in text or "競馬番組" not in text:
        return SourceResult(SPORT, False, fetched_urls=[response.url], error="JRA競馬番組の対象日を確認できませんでした")
    entries: list[dict[str, Any]] = []
    for venue in VENUES:
        if re.search(rf"\d+回{re.escape(venue)}\d+日", text):
            entries.append({"sport": SPORT, "venue": venue})
    return SourceResult(SPORT, True, entries=entries, fetched_urls=[response.url])
