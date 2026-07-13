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

NAME = "競輪"
RESULT_URL = "https://keirin.jp/pc/race/raceresult"
SCHEDULE_URL = "https://keirin.jp/pc/graderaceschedule"

VENUE_CODES = {
    "函館":"11","青森":"12","いわき平":"13","弥彦":"21","前橋":"22","取手":"23","宇都宮":"24",
    "大宮":"25","西武園":"26","京王閣":"27","立川":"28","松戸":"31","千葉":"32","川崎":"34",
    "平塚":"35","小田原":"36","伊東":"37","静岡":"38","名古屋":"42","岐阜":"43","大垣":"44",
    "豊橋":"45","富山":"46","松阪":"47","四日市":"48","福井":"51","奈良":"53","向日町":"54",
    "和歌山":"55","岸和田":"56","玉野":"61","広島":"62","防府":"63","高松":"71","小松島":"73",
    "高知":"74","松山":"75","小倉":"81","久留米":"83","武雄":"84","佐世保":"85","別府":"86","熊本":"87",
}


def _race_page(record: dict[str, Any], race_no: int, session: RateLimitedSession):
    code = VENUE_CODES.get(str(record.get("venue", "")))
    if not code:
        return None
    params = {
        "joCode": code,
        "kaisaiBi": str(record["date"]).replace("-", ""),
        "raceNo": str(race_no),
    }
    return session.get(RESULT_URL, params=params)


def collect(records: list[dict[str, Any]], session: RateLimitedSession, logger: logging.Logger) -> SourceResult:
    targets = [(index, record) for index, record in enumerate(records) if record.get("sport") == "keirin"]
    if not targets:
        return SourceResult(NAME, True, [], [], [])
    patches: list[Patch] = []
    fetched: list[str] = []
    warnings: list[str] = []
    try:
        # 公式グレード日程が生きていることを確認する。
        schedule = session.get(SCHEDULE_URL)
        fetched.append(schedule.url)
        schedule_text = soup_from(schedule).get_text(" ", strip=True)
        if "グレード" not in schedule_text or len(schedule_text) < 500:
            raise RuntimeError("競輪グレード日程の内容を確認できません")

        for index, record in targets:
            page_found = False
            for race_no in range(12, 8, -1):
                try:
                    response = _race_page(record, race_no, session)
                    if response is None:
                        break
                    fetched.append(response.url)
                    soup = soup_from(response)
                    text = clean_text(soup.get_text(" ", strip=True))
                    if any(token in text for token in ("該当するレースがありません", "データがありません", "開催はありません")):
                        continue
                    if len(text) < 300:
                        continue
                    fields: dict[str, str] = {}
                    times = extract_times(text)
                    # ページ内の「発走予定」近傍を優先。
                    time_match = re.search(r"発走(?:予定)?\s*([0-2]?\d:[0-5]\d)", text)
                    if time_match:
                        fields["time"] = f"{int(time_match.group(1).split(':')[0]):02d}:{time_match.group(1).split(':')[1]}"
                    winner = choose_first_place_name(table_rows(soup))
                    if winner:
                        fields["winner"] = winner
                    if "中止" in text and not winner:
                        fields["time"] = "中止"
                    if fields:
                        patches.append(Patch(index, fields, NAME, response.url, f"{race_no}R公式結果"))
                        page_found = True
                        break
                except Exception as exc:
                    warnings.append(f"{record['date']} {record.get('venue','')} {race_no}R: {exc}")
            if not page_found:
                warnings.append(f"{record['date']} {record.get('venue','')}: 決勝ページを特定できませんでした")
        return SourceResult(NAME, True, patches, list(dict.fromkeys(fetched)), warnings)
    except Exception as exc:
        logger.exception("競輪の取得に失敗しました")
        return SourceResult(NAME, False, patches, fetched, warnings, str(exc))
