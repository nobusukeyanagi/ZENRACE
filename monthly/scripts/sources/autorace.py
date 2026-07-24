from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date
from typing import Any
from urllib.parse import urlparse

from bs4 import BeautifulSoup

from monthly.scripts.common import OfficialSession, SourceResult, clean_text

SPORT = "auto"
VENUES = {
    "川口": "kawaguchi",
    "伊勢崎": "isesaki",
    "浜松": "hamamatsu",
    "飯塚": "iizuka",
    "山陽": "sanyo",
}
SLUG_TO_VENUE = {slug: venue for venue, slug in VENUES.items()}

# AutoRace.JP のページ上部にあるタイトルだけを開催場判定に使う。
# 本文全体には共通ナビとして全5場名が必ず含まれるため、本文の部分一致は禁止。
TITLE_IDENTITY_RE = re.compile(
    r"(?P<year>\d{4})[/-](?P<month>\d{1,2})[/-](?P<day>\d{1,2})"
    r"\s*出走表\s*[|｜]\s*"
    r"(?P<venue>川口|伊勢崎|浜松|飯塚|山陽)オート"
)
VENUE_HEADING_RE = re.compile(r"^(?P<venue>川口|伊勢崎|浜松|飯塚|山陽)オート(?:レース)?(?:\s+出走表)?$")
DATE_RE = re.compile(r"(?P<year>\d{4})[/-](?P<month>\d{1,2})[/-](?P<day>\d{1,2})")
TIME_RE = re.compile(r"(?:発走(?:予定)?|締切(?:予定)?|投票締切)\s*[:：]?\s*([0-2]?\d:[0-5]\d)")
NOT_FOUND_TOKENS = ("ページが見つかりません", "404 Not Found")


@dataclass(frozen=True)
class PageIdentity:
    venue: str
    target_date: date


def _session_from_text(context_text: str, first_time: str) -> str:
    """開催名周辺と1R時刻だけから時間帯を判定する。"""
    if "オーバーミッドナイト" in context_text or "ミッドナイト" in context_text:
        return "midnight"
    if "ナイター" in context_text or "アフター5" in context_text or "アフター５" in context_text:
        return "night"
    if "アーリー" in context_text:
        return "morning"
    if first_time:
        hour = int(first_time.split(":", 1)[0])
        if hour <= 10:
            return "morning"
        if hour >= 14:
            return "night"
    return ""


def _title_candidates(soup: BeautifulSoup) -> list[str]:
    """共通ナビ・本文を除き、ページ固有タイトルだけを返す。"""
    candidates: list[str] = []
    if soup.title:
        candidates.append(soup.title.get_text(" ", strip=True))
    for attrs in ({"property": "og:title"}, {"name": "twitter:title"}):
        tag = soup.find("meta", attrs=attrs)
        if tag and tag.get("content"):
            candidates.append(str(tag.get("content")))
    return [clean_text(value) for value in candidates if clean_text(value)]


def _heading_identity(soup: BeautifulSoup, requested_date: date) -> PageIdentity | None:
    """タイトルに日付がない旧形式だけ、main先頭見出しを補助情報として使う。"""
    main = soup.find("main")
    if not main:
        return None
    headings = [clean_text(node.get_text(" ", strip=True)) for node in main.find_all(("h1", "h2"), limit=5)]
    venue = ""
    page_date: date | None = None
    for heading in headings:
        match = VENUE_HEADING_RE.match(heading)
        if match:
            venue = match.group("venue")
        date_match = DATE_RE.search(heading)
        if date_match:
            page_date = date(
                int(date_match.group("year")),
                int(date_match.group("month")),
                int(date_match.group("day")),
            )
    if venue and (page_date is None or page_date == requested_date):
        return PageIdentity(venue=venue, target_date=requested_date)
    return None


def _page_identity(soup: BeautifulSoup, requested_date: date) -> PageIdentity | None:
    """ページ固有タイトルから、実際の開催場と対象日を厳密に確定する。"""
    for candidate in _title_candidates(soup):
        match = TITLE_IDENTITY_RE.search(candidate)
        if not match:
            continue
        return PageIdentity(
            venue=match.group("venue"),
            target_date=date(
                int(match.group("year")),
                int(match.group("month")),
                int(match.group("day")),
            ),
        )
    return _heading_identity(soup, requested_date)


def _canonical_slug(soup: BeautifulSoup) -> str:
    canonical = soup.find("link", rel=lambda value: value and "canonical" in value)
    if not canonical or not canonical.get("href"):
        return ""
    parts = [part for part in urlparse(str(canonical.get("href"))).path.split("/") if part]
    for part in parts:
        if part in SLUG_TO_VENUE:
            return part
    return ""


def _event_context(soup: BeautifulSoup) -> str:
    """フッターの『ミッドナイト特設』等を除外し、開催名周辺だけを取得する。"""
    candidates = _title_candidates(soup)
    main = soup.find("main")
    if main:
        for heading in main.find_all(("h1", "h2", "h3"), limit=8):
            candidates.append(clean_text(heading.get_text(" ", strip=True)))
        for selector in (".race-title", ".event-title", ".meeting-title", ".race-name"):
            for element in main.select(selector)[:3]:
                candidates.append(clean_text(element.get_text(" ", strip=True)))
    return clean_text(" ".join(value for value in candidates if value))


def _first_time(soup: BeautifulSoup) -> str:
    main = soup.find("main") or soup.body or soup
    main_text = clean_text(main.get_text(" ", strip=True))
    times = TIME_RE.findall(main_text)
    return times[0] if times else ""


def _candidate_urls(slug: str, target: date) -> tuple[str, str]:
    # 現行の正規URLを優先し、旧URL形式を互換用に残す。
    base = f"https://autorace.jp/race_info/Program/{slug}/{target.isoformat()}"
    return base, f"{base}_01"


def collect(target: date, session: OfficialSession) -> SourceResult:
    entries_by_venue: dict[str, dict[str, Any]] = {}
    fetched: list[str] = []
    warnings: list[str] = []
    reachable_pages = 0
    identified_pages = 0

    for expected_venue, slug in VENUES.items():
        accepted = False
        last_mismatch = ""

        for url in _candidate_urls(slug, target):
            try:
                response = session.get(url)
                reachable_pages += 1
                fetched.append(response.url)
                soup = BeautifulSoup(response.text, "lxml")
                page_text = clean_text(soup.get_text(" ", strip=True))
                if any(token in page_text for token in NOT_FOUND_TOKENS):
                    continue

                identity = _page_identity(soup, target)
                if identity is None:
                    continue
                identified_pages += 1

                if identity.target_date != target:
                    last_mismatch = (
                        f"{expected_venue}: {target.isoformat()}を要求しましたが、"
                        f"{identity.target_date.isoformat()}のページが返されたため除外しました。"
                    )
                    continue
                if identity.venue != expected_venue:
                    last_mismatch = (
                        f"{expected_venue}: 取得ページは{identity.venue}の出走表だったため、"
                        "非開催場として除外しました。"
                    )
                    continue

                canonical_slug = _canonical_slug(soup)
                if canonical_slug and canonical_slug != slug:
                    warnings.append(
                        f"{expected_venue}: canonical URLが{canonical_slug}を指していましたが、"
                        "ページタイトルの開催場を優先して確認しました。"
                    )

                first_time = _first_time(soup)
                item: dict[str, Any] = {
                    "sport": SPORT,
                    "venue": expected_venue,
                    "grade": "普通",
                }
                session_name = _session_from_text(_event_context(soup), first_time)
                if session_name:
                    item["session"] = session_name
                entries_by_venue[expected_venue] = item
                accepted = True
                break
            except Exception as exc:
                last_mismatch = f"{expected_venue}: {exc}"

        if not accepted and last_mismatch:
            warnings.append(last_mismatch)

    if reachable_pages == 0:
        return SourceResult(
            SPORT,
            False,
            fetched_urls=fetched,
            warnings=warnings,
            error="AutoRace.JPの当日出走表へ接続できませんでした",
        )

    entries = [entries_by_venue[venue] for venue in VENUES if venue in entries_by_venue]

    # ページは取得できたのに1場も厳密に確定できない場合は、既存データを保全させる。
    if identified_pages > 0 and not entries:
        return SourceResult(
            SPORT,
            False,
            fetched_urls=fetched,
            warnings=warnings,
            error="AutoRace.JPのページタイトルから対象日の開催場を確定できませんでした",
        )

    # 5場すべてを同日に検出した場合は、共通ページ誤認の再発とみなし更新を停止する。
    if len(entries) == len(VENUES):
        return SourceResult(
            SPORT,
            False,
            fetched_urls=fetched,
            warnings=warnings,
            error="オートレース全5場が同日に検出されたため、共通ページ誤認として更新を停止しました",
        )

    return SourceResult(SPORT, True, entries=entries, fetched_urls=fetched, warnings=warnings)
