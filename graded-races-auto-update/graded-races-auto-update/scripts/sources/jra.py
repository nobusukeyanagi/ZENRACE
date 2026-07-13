from __future__ import annotations

import datetime as dt
import logging
import re
from typing import Any

from scripts.common import (
    Patch,
    RateLimitedSession,
    SourceResult,
    best_record_match,
    clean_text,
    extract_time_near,
    parse_grade_and_name,
    soup_from,
    table_rows,
)

NAME = "JRA"
LIST_URL = "https://www.jra.go.jp/datafile/seiseki/replay/{year}/jyusyo.html"
CALENDAR_URL = "https://www.jra.go.jp/keiba/calendar{year}/{year}/{month}/{month:02d}{day:02d}.html"


def _parse_date(text: str, year: int) -> str:
    match = re.search(r"(\d{1,2})月(\d{1,2})日", text)
    if not match:
        return ""
    return dt.date(year, int(match.group(1)), int(match.group(2))).isoformat()


def collect(records: list[dict[str, Any]], session: RateLimitedSession, logger: logging.Logger) -> SourceResult:
    patches: list[Patch] = []
    fetched: list[str] = []
    warnings: list[str] = []
    targets = [record for record in records if record.get("sport") == "jra"]
    if not targets:
        return SourceResult(NAME, True, [], [], [])

    try:
        years = sorted({int(str(record["date"])[:4]) for record in targets})
        for year in years:
            url = LIST_URL.format(year=year)
            response = session.get(url)
            fetched.append(url)
            soup = soup_from(response)
            for cells in table_rows(soup):
                if len(cells) < 3:
                    continue
                date_text = _parse_date(cells[0], year)
                if not date_text:
                    continue
                grade, name = parse_grade_and_name(cells[1])
                venue = cells[2]
                # 公式表の列順は「月日、レース名、競馬場、性齢、コース、優勝馬、騎手、結果」。
                winner = clean_text(cells[5]) if len(cells) >= 6 else ""
                index = best_record_match(records, sport="jra", date=date_text, venue=venue, name=name)
                if index is None:
                    continue
                fields = {"venue": venue, "grade": grade, "name": name}
                if winner:
                    fields["winner"] = winner
                patches.append(Patch(index, fields, NAME, url, "JRA重賞一覧"))

        # 発走時刻は対象日の公式競馬番組ページから、レース名の近傍だけを採用する。
        for index, record in enumerate(records):
            if record.get("sport") != "jra":
                continue
            date_value = dt.date.fromisoformat(str(record["date"]))
            url = CALENDAR_URL.format(
                year=date_value.year,
                month=date_value.month,
                day=date_value.day,
            )
            try:
                response = session.get(url)
                fetched.append(url)
                text = soup_from(response).get_text(" ", strip=True)
                time_value = extract_time_near(text, str(record.get("name", "")), radius=500)
                if time_value:
                    patches.append(Patch(index, {"time": time_value}, NAME, url, "JRA競馬番組"))
            except Exception as exc:  # 日程ページが未公開の場合は既存値を維持
                warnings.append(f"{record['date']} {record.get('name','')}: 時刻取得を見送り ({exc})")

        return SourceResult(NAME, True, patches, fetched, warnings)
    except Exception as exc:
        logger.exception("JRAの取得に失敗しました")
        return SourceResult(NAME, False, patches, fetched, warnings, str(exc))
