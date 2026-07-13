from __future__ import annotations

import dataclasses
import datetime as dt
import json
import logging
import re
import time
import unicodedata
from pathlib import Path
from typing import Any, Iterable
from zoneinfo import ZoneInfo

import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

LOGGER = logging.getLogger(__name__)
TIME_RE = re.compile(r"(?<!\d)([0-2]?\d):([0-5]\d)(?!\d)")
JP_TIME_RE = re.compile(r"(?<!\d)([0-2]?\d)時([0-5]\d)分")


@dataclasses.dataclass(slots=True)
class Patch:
    index: int
    fields: dict[str, str]
    source: str
    evidence_url: str
    note: str = ""


@dataclasses.dataclass(slots=True)
class SourceResult:
    name: str
    ok: bool
    patches: list[Patch]
    fetched_urls: list[str]
    warnings: list[str]
    error: str = ""


class RateLimitedSession:
    def __init__(self, *, timeout: int, interval: float, user_agent: str) -> None:
        self.timeout = timeout
        self.interval = interval
        self._last_request_at = 0.0
        self.session = requests.Session()
        retries = Retry(
            total=3,
            connect=3,
            read=3,
            status=3,
            backoff_factor=1.0,
            status_forcelist=(429, 500, 502, 503, 504),
            allowed_methods=frozenset({"GET"}),
            respect_retry_after_header=True,
        )
        self.session.mount("https://", HTTPAdapter(max_retries=retries))
        self.session.headers.update(
            {
                "User-Agent": user_agent,
                "Accept-Language": "ja,en;q=0.7",
                "Cache-Control": "no-cache",
            }
        )

    def get(self, url: str, **kwargs: Any) -> requests.Response:
        elapsed = time.monotonic() - self._last_request_at
        if elapsed < self.interval:
            time.sleep(self.interval - elapsed)
        response = self.session.get(url, timeout=self.timeout, **kwargs)
        self._last_request_at = time.monotonic()
        response.raise_for_status()
        response.encoding = response.apparent_encoding or response.encoding
        return response


def load_json(path: Path) -> Any:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def save_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    with temporary.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(value, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    temporary.replace(path)


def now_jst() -> dt.datetime:
    return dt.datetime.now(ZoneInfo("Asia/Tokyo"))


def parse_iso_date(value: str) -> dt.date:
    return dt.date.fromisoformat(value)


def date_window(center: dt.date, before: int, after: int) -> tuple[dt.date, dt.date]:
    return center - dt.timedelta(days=before), center + dt.timedelta(days=after)


def in_window(record: dict[str, Any], start: dt.date, end: dt.date) -> bool:
    try:
        value = parse_iso_date(str(record.get("date", "")))
    except ValueError:
        return False
    return start <= value <= end


def normalize(value: Any) -> str:
    text = unicodedata.normalize("NFKC", str(value or ""))
    text = text.replace("　", " ")
    text = re.sub(r"\s+", "", text)
    text = text.replace("ステークス", "S")
    text = text.replace("トロフィー", "T")
    text = text.replace("カップ", "杯")
    return text.casefold()


def clean_text(value: Any) -> str:
    text = unicodedata.normalize("NFKC", str(value or ""))
    return re.sub(r"\s+", " ", text.replace("　", " ")).strip()


def strip_edition(value: str) -> str:
    return re.sub(r"第[0-9０-９]+回", "", clean_text(value)).strip()


def same_name(left: str, right: str) -> bool:
    a, b = normalize(strip_edition(left)), normalize(strip_edition(right))
    return bool(a and b and (a == b or a in b or b in a))


def parse_grade_and_name(value: str) -> tuple[str, str]:
    text = clean_text(value)
    pattern = re.compile(
        r"^(J・G[ⅠⅡⅢIV1-4]+|Jpn[ⅠⅡⅢIV1-4]+|G[ⅠⅡⅢIV1-4]+|SG|PG1|GP|BG[ⅠⅡⅢ1-3]+|SP[ⅠⅡⅢ1-3]+|S[ⅠⅡⅢ1-3]+|H[ⅠⅡⅢ1-3]+|M[ⅠⅡⅢ1-3]+|重賞[ⅠⅡⅢ1-3]?)\s*(.*)$",
        re.I,
    )
    match = pattern.match(text)
    if not match:
        return "", strip_edition(text)
    return match.group(1), strip_edition(match.group(2))


def extract_times(value: str) -> list[str]:
    result: list[str] = []
    for hour, minute in TIME_RE.findall(value):
        candidate = f"{int(hour):02d}:{minute}"
        if candidate not in result:
            result.append(candidate)
    for hour, minute in JP_TIME_RE.findall(value):
        candidate = f"{int(hour):02d}:{minute}"
        if candidate not in result:
            result.append(candidate)
    return result


def extract_time_near(full_text: str, needle: str, *, radius: int = 350) -> str:
    if not needle:
        return ""
    index = normalize(full_text).find(normalize(needle))
    if index < 0:
        return ""
    # 正規化文字列と元文字列の位置は厳密には一致しないため、十分広い範囲で探索する。
    raw_index = full_text.find(needle)
    if raw_index < 0:
        raw_index = max(0, index)
    section = full_text[max(0, raw_index - radius) : raw_index + len(needle) + radius]
    times = extract_times(section)
    return times[-1] if times else ""


def soup_from(response: requests.Response) -> BeautifulSoup:
    return BeautifulSoup(response.text, "lxml")


def table_rows(soup: BeautifulSoup) -> Iterable[list[str]]:
    for row in soup.select("tr"):
        cells = [clean_text(cell.get_text(" ", strip=True)) for cell in row.select("th,td")]
        if cells:
            yield cells


def choose_first_place_name(rows: Iterable[list[str]]) -> str:
    for cells in rows:
        if not cells:
            continue
        first = normalize(cells[0])
        if first not in {"1", "1着", "一着"}:
            continue
        candidates = []
        for cell in cells[1:]:
            value = clean_text(cell)
            if not value or re.fullmatch(r"[\d.,+-]+", value):
                continue
            if any(token in value for token in ("着差", "試走", "タイム", "人気", "枠", "車番")):
                continue
            if 2 <= len(value) <= 30:
                candidates.append(value)
        if candidates:
            return candidates[0]
    return ""


def candidate_indices(records: list[dict[str, Any]], sport: str) -> list[int]:
    return [index for index, record in enumerate(records) if record.get("sport") == sport]


def best_record_match(
    records: list[dict[str, Any]],
    *,
    sport: str,
    date: str,
    venue: str = "",
    name: str = "",
) -> int | None:
    candidates: list[tuple[int, int]] = []
    for index, record in enumerate(records):
        if record.get("sport") != sport or record.get("date") != date:
            continue
        score = 0
        if venue and normalize(record.get("venue")) == normalize(venue):
            score += 3
        if name and same_name(str(record.get("name", "")), name):
            score += 5
        if not name and not record.get("name"):
            score += 1
        candidates.append((score, index))
    if not candidates:
        return None
    candidates.sort(reverse=True)
    if candidates[0][0] <= 0 and len(candidates) > 1:
        return None
    return candidates[0][1]


def merge_patches(
    original: list[dict[str, Any]], patches: Iterable[Patch]
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    records = [dict(record) for record in original]
    changes: list[dict[str, Any]] = []
    allowed = {"time", "venue", "grade", "name", "winner"}
    for patch in patches:
        if not 0 <= patch.index < len(records):
            continue
        record = records[patch.index]
        before = dict(record)
        for field, raw_value in patch.fields.items():
            if field not in allowed:
                continue
            value = clean_text(raw_value)
            # 取得できなかった空文字で、既存情報を消さない。
            if not value:
                continue
            if field == "name":
                value = strip_edition(value)
            record[field] = value
        if record != before:
            changes.append(
                {
                    "date": record.get("date", ""),
                    "sport": record.get("sport", ""),
                    "venue": record.get("venue", ""),
                    "name": record.get("name", ""),
                    "before": before,
                    "after": dict(record),
                    "source": patch.source,
                    "evidence_url": patch.evidence_url,
                    "note": patch.note,
                }
            )
    records.sort(key=sort_key)
    return records, changes


def sort_key(record: dict[str, Any]) -> tuple[Any, ...]:
    sport_order = {"jra": 0, "nar": 1, "boat": 2, "keirin": 3, "auto": 4}
    time_value = str(record.get("time", ""))
    minutes = 24 * 60 + 2
    if re.fullmatch(r"\d{2}:\d{2}", time_value):
        hour, minute = map(int, time_value.split(":"))
        minutes = hour * 60 + minute
    elif time_value == "中止":
        minutes = 24 * 60 + 1
    return (
        record.get("date", ""),
        minutes,
        sport_order.get(str(record.get("sport", "")), 99),
        str(record.get("venue", "")),
        str(record.get("name", "")),
    )
