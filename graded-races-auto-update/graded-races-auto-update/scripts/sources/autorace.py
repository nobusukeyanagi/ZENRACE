from __future__ import annotations

import logging
import re
from typing import Any

from scripts.common import (
    Patch,
    RateLimitedSession,
    SourceResult,
    choose_first_place_name,
    clean_text,
    extract_times,
    soup_from,
    table_rows,
)

NAME = "オートレース"
GRADE_URL = "https://autorace.jp/calendar/graderace/"
VENUE_SLUGS = {
    "川口": "kawaguchi",
    "伊勢崎": "isesaki",
    "浜松": "hamamatsu",
    "飯塚": "iizuka",
    "山陽": "sanyo",
}


def _url(kind: str, venue: str, date: str, race_no: int) -> str:
    slug = VENUE_SLUGS[venue]
    return f"https://autorace.jp/race_info/{kind}/{slug}/{date}_{race_no:02d}"


def collect(records: list[dict[str, Any]], session: RateLimitedSession, logger: logging.Logger) -> SourceResult:
    targets = [(index, record) for index, record in enumerate(records) if record.get("sport") == "auto"]
    if not targets:
        return SourceResult(NAME, True, [], [], [])
    patches: list[Patch] = []
    fetched: list[str] = []
    warnings: list[str] = []
    try:
        grade_response = session.get(GRADE_URL)
        fetched.append(grade_response.url)
        grade_text = soup_from(grade_response).get_text(" ", strip=True)
        if "グレード" not in grade_text or len(grade_text) < 500:
            raise RuntimeError("オートレース年間グレード日程の内容を確認できません")

        for index, record in targets:
            venue = str(record.get("venue", ""))
            if venue not in VENUE_SLUGS:
                warnings.append(f"未対応の開催場: {venue}")
                continue
            compact_date = str(record["date"])
            found = False
            # 終了後はResult、開催前はProgram。12Rから9Rまで順に確認する。
            for kind in ("RaceResult", "Program"):
                for race_no in range(12, 8, -1):
                    url = _url(kind, venue, compact_date, race_no)
                    try:
                        response = session.get(url)
                        fetched.append(response.url)
                        soup = soup_from(response)
                        text = clean_text(soup.get_text(" ", strip=True))
                        if len(text) < 250 or "ページが見つかりません" in text:
                            continue
                        # 誤ったURLで表示される「開催中止」は、年間日程や結果表と矛盾し得るため、
                        # 結果表・出走表が存在する場合だけページを採用する。
                        rows = list(table_rows(soup))
                        if not rows and "発走" not in text:
                            continue
                        fields: dict[str, str] = {}
                        time_match = re.search(r"発走(?:予定)?\s*([0-2]?\d:[0-5]\d)", text)
                        if time_match:
                            hour, minute = time_match.group(1).split(":")
                            fields["time"] = f"{int(hour):02d}:{minute}"
                        if kind == "RaceResult":
                            winner = choose_first_place_name(rows)
                            if winner:
                                fields["winner"] = winner
                        if fields:
                            patches.append(Patch(index, fields, NAME, response.url, f"{kind} {race_no}R"))
                            found = True
                            break
                    except Exception as exc:
                        warnings.append(f"{record['date']} {venue} {kind} {race_no}R: {exc}")
                if found:
                    break
            if not found:
                warnings.append(f"{record['date']} {venue}: 優勝戦ページを特定できませんでした")
        return SourceResult(NAME, True, patches, list(dict.fromkeys(fetched)), warnings)
    except Exception as exc:
        logger.exception("オートレースの取得に失敗しました")
        return SourceResult(NAME, False, patches, fetched, warnings, str(exc))
