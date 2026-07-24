from __future__ import annotations

import unittest
from datetime import date
from types import SimpleNamespace

from monthly.scripts.sources import autorace


class FakeSession:
    def __init__(self, responses: dict[str, str]) -> None:
        self.responses = responses

    def get(self, url: str, **kwargs):
        if url not in self.responses:
            raise AssertionError(f"unexpected URL: {url}")
        return SimpleNamespace(text=self.responses[url], url=url)


def venue_urls(slug: str, target: date) -> tuple[str, str]:
    base = f"https://autorace.jp/race_info/Program/{slug}/{target.isoformat()}"
    return base, f"{base}_01"


def all_responses(html: str, target: date) -> dict[str, str]:
    responses: dict[str, str] = {}
    for slug in autorace.VENUES.values():
        for url in venue_urls(slug, target):
            responses[url] = html
    return responses


def race_page(target: date, venue: str, first_time: str = "15:24", footer: str = "") -> str:
    return f"""
    <html>
      <head>
        <title>{target:%Y/%m/%d} 出走表 | {venue}オート | レース情報 | AutoRace.JP</title>
        <meta property="og:title" content="{target:%Y/%m/%d} 出走表 | {venue}オート">
      </head>
      <body>
        <nav>川口 伊勢崎 浜松 飯塚 山陽</nav>
        <main>
          <h1>{venue}オート 出走表</h1>
          <h2>令和8年度{venue}市営 普通開催</h2>
          <div>1R 発走予定 {first_time}</div>
        </main>
        <footer>{footer}</footer>
      </body>
    </html>
    """


class AutoRaceSourceTests(unittest.TestCase):
    def test_iizuka_fallback_page_is_counted_only_once(self) -> None:
        target = date(2026, 7, 24)
        # 非開催場URLを含む全URLが飯塚ページを返す実障害を再現。
        responses = all_responses(race_page(target, "飯塚"), target)
        result = autorace.collect(target, FakeSession(responses))

        self.assertTrue(result.ok)
        self.assertEqual(
            result.entries,
            [{"sport": "auto", "venue": "飯塚", "grade": "普通", "session": "night"}],
        )
        self.assertEqual(len([warning for warning in result.warnings if "飯塚の出走表" in warning]), 4)

    def test_navigation_venue_names_are_never_used_as_identity(self) -> None:
        target = date(2026, 7, 24)
        html = """
        <html><head><title>出走表 | AutoRace.JP</title></head><body>
          <nav>川口 伊勢崎 浜松 飯塚 山陽</nav>
          <main><h1>本日の出走表</h1><div>1R 発走予定 15:24</div></main>
        </body></html>
        """
        result = autorace.collect(target, FakeSession(all_responses(html, target)))
        self.assertTrue(result.ok)
        self.assertEqual(result.entries, [])

    def test_stale_date_page_is_rejected(self) -> None:
        target = date(2026, 7, 24)
        stale = race_page(date(2026, 7, 23), "飯塚")
        result = autorace.collect(target, FakeSession(all_responses(stale, target)))
        self.assertFalse(result.ok)
        self.assertEqual(result.entries, [])
        self.assertIn("対象日の開催場を確定できませんでした", result.error)

    def test_footer_midnight_link_does_not_override_first_race_time(self) -> None:
        target = date(2026, 7, 24)
        responses: dict[str, str] = {}
        for venue, slug in autorace.VENUES.items():
            for url in venue_urls(slug, target):
                responses[url] = (
                    race_page(target, "飯塚", footer="ミッドナイト特設")
                    if venue == "飯塚"
                    else "<html><head><title>開催なし | AutoRace.JP</title></head><body></body></html>"
                )
        result = autorace.collect(target, FakeSession(responses))
        self.assertTrue(result.ok)
        self.assertEqual(result.entries[0]["session"], "night")

    def test_all_five_distinct_pages_are_stopped_as_anomaly(self) -> None:
        target = date(2026, 7, 24)
        responses: dict[str, str] = {}
        for venue, slug in autorace.VENUES.items():
            for url in venue_urls(slug, target):
                responses[url] = race_page(target, venue)
        result = autorace.collect(target, FakeSession(responses))
        self.assertFalse(result.ok)
        self.assertIn("全5場", result.error)


if __name__ == "__main__":
    unittest.main()
