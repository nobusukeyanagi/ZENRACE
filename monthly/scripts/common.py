from __future__ import annotations

import json
import re
import time
from dataclasses import dataclass, field
from datetime import date, timedelta
from pathlib import Path
from typing import Any, Iterable

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

MONTHLY_DATA_RE = re.compile(
    r"const MONTHLY_DATA = (?P<data>\{.*?\});\n\n  const WEEKDAY",
    re.S,
)

SPORT_ORDER = {"keirin": 0, "auto": 1, "boat": 2, "nar": 3, "jra": 4}
VENUE_ORDER = {
    "keirin": [
        "函館", "青森", "いわき平", "弥彦", "前橋", "取手", "宇都宮", "大宮", "西武園", "京王閣",
        "立川", "松戸", "川崎", "平塚", "小田原", "伊東", "静岡", "名古屋", "岐阜", "大垣",
        "豊橋", "富山", "松阪", "四日市", "福井", "奈良", "向日町", "和歌山", "岸和田", "玉野",
        "広島", "防府", "高松", "小松島", "高知", "松山", "小倉", "久留米", "武雄", "佐世保",
        "別府", "熊本",
    ],
    "auto": ["川口", "伊勢崎", "浜松", "飯塚", "山陽"],
    "boat": [
        "桐生", "戸田", "江戸川", "平和島", "多摩川", "浜名湖", "蒲郡", "常滑", "津", "三国", "びわこ",
        "住之江", "尼崎", "鳴門", "丸亀", "児島", "宮島", "徳山", "下関", "若松", "芦屋", "福岡", "唐津", "大村",
    ],
    "nar": ["帯広", "門別", "盛岡", "水沢", "浦和", "船橋", "大井", "川崎", "金沢", "笠松", "名古屋", "園田", "姫路", "高知", "佐賀"],
    "jra": ["札幌", "函館", "福島", "新潟", "東京", "中山", "中京", "京都", "阪神", "小倉"],
}
VENUE_RANK = {sport: {venue: index for index, venue in enumerate(venues)} for sport, venues in VENUE_ORDER.items()}

ROMAN_TO_ARABIC = str.maketrans({"Ⅰ": "1", "Ⅱ": "2", "Ⅲ": "3"})
ARABIC_TO_ROMAN = {"1": "Ⅰ", "2": "Ⅱ", "3": "Ⅲ"}


@dataclass
class SourceResult:
    sport: str
    ok: bool
    entries: list[dict[str, Any]] = field(default_factory=list)
    fetched_urls: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    error: str = ""


class OfficialSession:
    def __init__(self, *, delay_seconds: float = 0.12) -> None:
        self.delay_seconds = delay_seconds
        self._last_request_at = 0.0
        self.session = requests.Session()
        retry = Retry(
            total=3,
            connect=3,
            read=3,
            backoff_factor=0.6,
            status_forcelist=(429, 500, 502, 503, 504),
            allowed_methods=frozenset({"GET"}),
        )
        self.session.mount("https://", HTTPAdapter(max_retries=retry))
        self.session.headers.update(
            {
                "User-Agent": "ZENRACE-schedule-sync/1.0 (+https://nobusukeyanagi.github.io/zenrace/)",
                "Accept-Language": "ja,en;q=0.5",
            }
        )

    def get(self, url: str, **kwargs: Any) -> requests.Response:
        elapsed = time.monotonic() - self._last_request_at
        if elapsed < self.delay_seconds:
            time.sleep(self.delay_seconds - elapsed)
        response = self.session.get(url, timeout=35, **kwargs)
        self._last_request_at = time.monotonic()
        response.raise_for_status()
        response.encoding = response.apparent_encoding or response.encoding
        return response


def clean_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def daterange(start: date, end: date) -> Iterable[date]:
    current = start
    while current <= end:
        yield current
        current += timedelta(days=1)


def load_monthly_data(path: Path) -> tuple[dict[str, list[dict[str, Any]]], str]:
    text = path.read_text(encoding="utf-8")
    match = MONTHLY_DATA_RE.search(text)
    if not match:
        raise ValueError("monthly.jsからMONTHLY_DATAを読み取れません。")
    payload = json.loads(match.group("data"))
    if not isinstance(payload, dict):
        raise ValueError("MONTHLY_DATAの最上位はオブジェクトである必要があります。")
    return payload, text


def write_monthly_data(path: Path, payload: dict[str, list[dict[str, Any]]], original_text: str) -> None:
    data_text = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    replaced, count = MONTHLY_DATA_RE.subn(
        f"const MONTHLY_DATA = {data_text};\n\n  const WEEKDAY",
        original_text,
        count=1,
    )
    if count != 1:
        raise ValueError("MONTHLY_DATAの置換に失敗しました。")
    path.write_text(replaced, encoding="utf-8", newline="\n")


def month_key(value: date) -> str:
    return value.strftime("%Y-%m")


def find_day(payload: dict[str, list[dict[str, Any]]], target: date) -> dict[str, Any]:
    rows = payload.setdefault(month_key(target), [])
    target_key = target.isoformat()
    for row in rows:
        if row.get("date") == target_key:
            row.setdefault("venues", [])
            return row
    row = {"date": target_key, "venues": []}
    rows.append(row)
    rows.sort(key=lambda item: str(item.get("date", "")))
    return row


def existing_entry(payload: dict[str, list[dict[str, Any]]], target: date, sport: str, venue: str) -> dict[str, Any] | None:
    for row in payload.get(month_key(target), []):
        if row.get("date") != target.isoformat():
            continue
        for item in row.get("venues", []):
            if item.get("sport") == sport and item.get("venue") == venue:
                return item
        return None
    return None


def normalize_grade(sport: str, value: Any) -> str:
    raw = clean_text(value).replace("GIII", "GⅢ").replace("GII", "GⅡ").replace("GI", "GⅠ")
    raw = raw.replace("Ｆ", "F").replace("Ｇ", "G").replace("ＳＧ", "SG")
    raw = raw.replace("G1", "GⅠ").replace("G2", "GⅡ").replace("G3", "GⅢ")
    raw = raw.replace("F1", "FⅠ").replace("F2", "FⅡ")
    raw = raw.replace("PGI", "PG1").replace("PGⅠ", "PG1")
    if sport == "boat":
        return raw.translate(ROMAN_TO_ARABIC).replace("G1", "G1").replace("G2", "G2").replace("G3", "G3")
    if sport == "nar":
        # H/M/BGは公式表記がアラビア数字。S/SP/Jpn/重賞はローマ数字を維持する。
        match = re.fullmatch(r"(H|M|BG)([123ⅠⅡⅢ])", raw, re.I)
        if match:
            return f"{match.group(1).upper()}{match.group(2).translate(ROMAN_TO_ARABIC)}"
        return raw
    return raw


def grade_priority(value: Any) -> int:
    normalized = clean_text(value).upper().translate(ROMAN_TO_ARABIC).replace(" ", "")
    if normalized in {"GP", "SG"}:
        return 100
    if normalized in {"PG1", "特G1"}:
        return 95
    if any(token in normalized for token in ("JPN1", "BG1", "SP1", "M1", "H1", "S1", "G1", "重賞1")):
        return 90
    if any(token in normalized for token in ("JPN2", "BG2", "SP2", "M2", "H2", "S2", "G2", "重賞2")):
        return 80
    if any(token in normalized for token in ("JPN3", "BG3", "SP3", "M3", "H3", "S3", "G3", "重賞3")):
        return 70
    if normalized in {"F1", "F2", "一般", "普通", ""}:
        return 0
    return 50


def merge_entry(existing: dict[str, Any] | None, fresh: dict[str, Any]) -> dict[str, Any]:
    merged: dict[str, Any] = dict(existing or {})
    for key, value in fresh.items():
        if value not in (None, "", False):
            merged[key] = value
        elif key not in merged and value is False:
            merged[key] = False
    merged["sport"] = fresh["sport"]
    merged["venue"] = fresh["venue"]
    if merged.get("grade"):
        merged["grade"] = normalize_grade(str(merged["sport"]), merged["grade"])
    return merged


def sort_entries(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(
        entries,
        key=lambda item: (
            SPORT_ORDER.get(str(item.get("sport", "")), 99),
            VENUE_RANK.get(str(item.get("sport", "")), {}).get(str(item.get("venue", "")), 999),
            str(item.get("venue", "")),
        ),
    )


def relabel_meeting_days(payload: dict[str, list[dict[str, Any]]], sport: str, venue: str, around: date) -> None:
    if sport not in {"keirin", "auto", "boat"}:
        return

    def has_venue(target: date) -> bool:
        return existing_entry(payload, target, sport, venue) is not None

    if not has_venue(around):
        return
    start = around
    while has_venue(start - timedelta(days=1)):
        start -= timedelta(days=1)
    end = around
    while has_venue(end + timedelta(days=1)):
        end += timedelta(days=1)
    days = list(daterange(start, end))
    for index, target in enumerate(days):
        item = existing_entry(payload, target, sport, venue)
        if item is None:
            continue
        if index == 0:
            item["day"] = "初日"
        elif index == len(days) - 1:
            item["day"] = "最終日"
        else:
            item["day"] = f"{index + 1}日目"


def overlay_grades(entries: list[dict[str, Any]], grade_records: list[dict[str, Any]], target: date) -> None:
    candidates: dict[tuple[str, str], str] = {}
    for race in grade_records:
        if str(race.get("date", "")) != target.isoformat():
            continue
        sport = str(race.get("sport", ""))
        venue = str(race.get("venue", ""))
        grade = normalize_grade(sport, race.get("grade", ""))
        key = (sport, venue)
        if grade_priority(grade) > grade_priority(candidates.get(key, "")):
            candidates[key] = grade
    for item in entries:
        key = (str(item.get("sport", "")), str(item.get("venue", "")))
        grade = candidates.get(key)
        if grade and grade_priority(grade) >= grade_priority(item.get("grade", "")):
            item["grade"] = grade
