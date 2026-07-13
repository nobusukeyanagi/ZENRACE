from __future__ import annotations

import logging
import re
from typing import Any
from urllib.parse import urljoin

from scripts.common import (
    Patch,
    RateLimitedSession,
    SourceResult,
    best_record_match,
    choose_first_place_name,
    clean_text,
    extract_times,
    same_name,
    soup_from,
    table_rows,
)

NAME = "地方競馬"
SCHEDULE_URL = "https://www.keiba.go.jp/gradedrace/schedule.html"
RACE_LIST_URL = "https://www.keiba.go.jp/KeibaWeb/TodayRaceInfo/RaceList"
WINNER_URL = "https://www.keiba.go.jp/KeibaWeb/DataRoom/JyusyoRaceWinhorse"

VENUE_CODES = {
    "帯広": "03", "帯広ば": "03", "門別": "36", "盛岡": "10", "水沢": "11",
    "浦和": "18", "船橋": "19", "大井": "20", "川崎": "21", "金沢": "22",
    "笠松": "23", "名古屋": "24", "園田": "27", "姫路": "28", "高知": "31", "佐賀": "32",
}


def _time_from_race_list(record: dict[str, Any], session: RateLimitedSession) -> tuple[str, str, str]:
    venue = str(record.get("venue", ""))
    code = VENUE_CODES.get(venue)
    if not code:
        return "", "", ""
    date_value = str(record["date"]).replace("-", "/")
    params = {"k_raceDate": date_value, "k_babaCode": code}
    response = session.get(RACE_LIST_URL, params=params)
    url = response.url
    soup = soup_from(response)
    for row in soup.select("tr"):
        row_text = clean_text(row.get_text(" ", strip=True))
        if not same_name(row_text, str(record.get("name", ""))):
            continue
        times = extract_times(row_text)
        time_value = times[-1] if times else ""
        if "中止" in row_text:
            time_value = "中止"
        # 結果ページへのリンクが行内にあれば、優勝馬を追加取得する。
        winner = ""
        link = row.find("a", href=True)
        if link and ("RaceMarkTable" in link["href"] or "RaceResult" in link["href"]):
            detail = session.get(urljoin(response.url, link["href"]))
            winner = choose_first_place_name(table_rows(soup_from(detail)))
        return time_value, winner, url
    return "", "", url


def _winner_from_archive(record: dict[str, Any], session: RateLimitedSession) -> tuple[str, str]:
    code = VENUE_CODES.get(str(record.get("venue", "")))
    if not code:
        return "", ""
    params = {"k_babaCode": code, "k_nenndo": str(record["date"])[:4]}
    response = session.get(WINNER_URL, params=params)
    soup = soup_from(response)
    for cells in table_rows(soup):
        joined = " ".join(cells)
        if not same_name(joined, str(record.get("name", ""))):
            continue
        for pos, cell in enumerate(cells):
            if same_name(cell, str(record.get("name", ""))):
                for candidate in cells[pos + 1 :]:
                    value = clean_text(candidate)
                    if not value or "結果" in value or re.fullmatch(r"\d+[年月日/.-].*", value):
                        continue
                    if 2 <= len(value) <= 30:
                        return value, response.url
    return "", response.url


def collect(records: list[dict[str, Any]], session: RateLimitedSession, logger: logging.Logger) -> SourceResult:
    patches: list[Patch] = []
    fetched: list[str] = []
    warnings: list[str] = []
    targets = [(index, record) for index, record in enumerate(records) if record.get("sport") == "nar"]
    if not targets:
        return SourceResult(NAME, True, [], [], [])
    try:
        # 年間重賞一覧が取得できることを先に確認する。構造変更時の検知にも使う。
        response = session.get(SCHEDULE_URL)
        fetched.append(response.url)
        schedule_text = soup_from(response).get_text(" ", strip=True)
        if "重賞" not in schedule_text or len(schedule_text) < 1000:
            raise RuntimeError("地方競馬重賞一覧の内容を確認できません")

        for index, record in targets:
            try:
                time_value, winner, url = _time_from_race_list(record, session)
                if url:
                    fetched.append(url)
                fields: dict[str, str] = {}
                if time_value:
                    fields["time"] = time_value
                if winner:
                    fields["winner"] = winner
                if not winner:
                    winner, archive_url = _winner_from_archive(record, session)
                    if archive_url:
                        fetched.append(archive_url)
                    if winner:
                        fields["winner"] = winner
                if fields:
                    patches.append(Patch(index, fields, NAME, url or SCHEDULE_URL, "地方競馬公式レース情報"))
            except Exception as exc:
                warnings.append(f"{record['date']} {record.get('venue','')} {record.get('name','')}: {exc}")
        return SourceResult(NAME, True, patches, list(dict.fromkeys(fetched)), warnings)
    except Exception as exc:
        logger.exception("地方競馬の取得に失敗しました")
        return SourceResult(NAME, False, patches, fetched, warnings, str(exc))
