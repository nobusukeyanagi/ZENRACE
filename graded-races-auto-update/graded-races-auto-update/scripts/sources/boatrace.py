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
    extract_times,
    parse_grade_and_name,
    soup_from,
    strip_edition,
    same_name,
    table_rows,
)

NAME = "ボートレース"
SCHEDULE_URLS = {
    "SG": "https://www.boatrace.jp/owpc/pc/race/gradesch?hcd=01",
    "G1G2": "https://www.boatrace.jp/owpc/pc/race/gradesch?hcd=02",
    "G3": "https://www.boatrace.jp/owpc/pc/race/gradesch?hcd=03",
}
RACE_INDEX_URL = "https://www.boatrace.jp/owpc/pc/race/raceindex"
VENUE_CODES = {
    "桐生": "01", "戸田": "02", "江戸川": "03", "平和島": "04", "多摩川": "05", "浜名湖": "06",
    "蒲郡": "07", "常滑": "08", "津": "09", "三国": "10", "びわこ": "11", "住之江": "12",
    "尼崎": "13", "鳴門": "14", "丸亀": "15", "児島": "16", "宮島": "17", "徳山": "18",
    "下関": "19", "若松": "20", "芦屋": "21", "福岡": "22", "唐津": "23", "大村": "24",
}


def _parse_range(value: str, base_year: int) -> str:
    match = re.search(r"(\d{1,2})/(\d{1,2})\s*[-～]\s*(?:(\d{1,2})/)?(\d{1,2})", value)
    if not match:
        return ""
    start_month = int(match.group(1))
    end_month = int(match.group(3) or start_month)
    end_day = int(match.group(4))
    year = base_year + (1 if start_month == 12 and end_month == 1 else 0)
    return dt.date(year, end_month, end_day).isoformat()


def _schedule_patches(records: list[dict[str, Any]], session: RateLimitedSession) -> tuple[list[Patch], list[str], list[str]]:
    patches: list[Patch] = []
    fetched: list[str] = []
    warnings: list[str] = []
    years = sorted({int(str(record["date"])[:4]) for record in records if record.get("sport") == "boat"})
    for label, url in SCHEDULE_URLS.items():
        response = session.get(url)
        fetched.append(response.url)
        soup = soup_from(response)
        rows = list(table_rows(soup))
        if not rows:
            warnings.append(f"{label}: 表を取得できませんでした")
            continue
        for cells in rows:
            joined = " | ".join(cells)
            if not re.search(r"\d{1,2}/\d{1,2}\s*[-～]", joined):
                continue
            # 開催年はページの年表示または対象データとの照合で決める。
            for year in years:
                end_date = _parse_range(joined, year)
                if not end_date:
                    continue
                venue = next((cell for cell in cells if cell in VENUE_CODES), "")
                if not venue:
                    continue
                candidates = [cell for cell in cells if cell and cell != venue and not re.search(r"\d{1,2}/\d{1,2}", cell)]
                title = ""
                winner = ""
                for cell in candidates:
                    grade, parsed_name = parse_grade_and_name(cell)
                    if parsed_name and len(parsed_name) >= 3 and not any(token in parsed_name for token in ("開催日程", "優勝者", "リンク")):
                        title = strip_edition(parsed_name)
                        break
                if candidates:
                    last = candidates[-1]
                    if last != title and 2 <= len(last) <= 30 and "結果" not in last:
                        winner = last
                index = best_record_match(records, sport="boat", date=end_date, venue=venue, name=title)
                if index is None:
                    continue
                fields: dict[str, str] = {}
                existing_name = str(records[index].get("name", ""))
                generic_names = {"", "企業杯", "オールレディース", "マスターズリーグ"}
                if title and title not in {"企業杯", "オールレディース", "マスターズリーグ"}:
                    if existing_name in generic_names or same_name(existing_name, title):
                        fields["name"] = title
                if winner:
                    fields["winner"] = winner
                if fields:
                    patches.append(Patch(index, fields, NAME, response.url, f"BOAT RACE {label}日程"))
    return patches, fetched, warnings


def _final_time(record: dict[str, Any], session: RateLimitedSession) -> tuple[str, str]:
    code = VENUE_CODES.get(str(record.get("venue", "")))
    if not code:
        return "", ""
    params = {"jcd": code, "hd": str(record["date"]).replace("-", "")}
    response = session.get(RACE_INDEX_URL, params=params)
    soup = soup_from(response)
    # 原則12R優勝戦。DOM行から最後の時刻を採用する。
    for row in soup.select("tr,li,div"):
        text = clean_text(row.get_text(" ", strip=True))
        if not re.search(r"(^|\D)12R(\D|$)", text):
            continue
        times = extract_times(text)
        if times:
            return times[-1], response.url
    text = soup.get_text(" ", strip=True)
    match = re.search(r"12R.{0,500}", text)
    if match:
        times = extract_times(match.group(0))
        if times:
            return times[-1], response.url
    return "", response.url


def collect(records: list[dict[str, Any]], session: RateLimitedSession, logger: logging.Logger) -> SourceResult:
    targets = [(index, record) for index, record in enumerate(records) if record.get("sport") == "boat"]
    if not targets:
        return SourceResult(NAME, True, [], [], [])
    patches: list[Patch] = []
    fetched: list[str] = []
    warnings: list[str] = []
    try:
        schedule_patches, schedule_urls, schedule_warnings = _schedule_patches(records, session)
        patches.extend(schedule_patches)
        fetched.extend(schedule_urls)
        warnings.extend(schedule_warnings)
        for index, record in targets:
            try:
                time_value, url = _final_time(record, session)
                if url:
                    fetched.append(url)
                if time_value:
                    patches.append(Patch(index, {"time": time_value}, NAME, url, "12R発売締切予定時刻"))
            except Exception as exc:
                warnings.append(f"{record['date']} {record.get('venue','')}: 時刻取得を見送り ({exc})")
        return SourceResult(NAME, True, patches, list(dict.fromkeys(fetched)), warnings)
    except Exception as exc:
        logger.exception("ボートレースの取得に失敗しました")
        return SourceResult(NAME, False, patches, fetched, warnings, str(exc))
