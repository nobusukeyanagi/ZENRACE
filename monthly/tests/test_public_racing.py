from __future__ import annotations

import tempfile
import unittest
from datetime import date
from pathlib import Path
from types import SimpleNamespace

from gradedraces.scripts.send_discord import build_full_message
from monthly.scripts.common import (
    existing_entry,
    find_day,
    normalize_grade,
    relabel_meeting_days,
)
from monthly.scripts.sources import boatrace, jra, keirin


class FakeSession:
    def __init__(self, responses: dict[str, str]) -> None:
        self.responses = responses

    def get(self, url: str, **kwargs):
        key = url
        if kwargs.get("params"):
            key = url
        if key not in self.responses:
            raise AssertionError(f"unexpected URL: {url}")
        return SimpleNamespace(text=self.responses[key], url=url)


class ScheduleTests(unittest.TestCase):
    def test_nar_grade_notation(self) -> None:
        self.assertEqual(normalize_grade("nar", "HⅡ"), "H2")
        self.assertEqual(normalize_grade("nar", "MⅢ"), "M3")
        self.assertEqual(normalize_grade("nar", "BGⅠ"), "BG1")
        self.assertEqual(normalize_grade("nar", "SⅢ"), "SⅢ")
        self.assertEqual(normalize_grade("boat", "GⅢ"), "G3")
        self.assertEqual(normalize_grade("boat", "GIII"), "G3")
        self.assertEqual(normalize_grade("boat", "PGI"), "PG1")

    def test_keirin_parser(self) -> None:
        html = """
        <html><body>
          <section><h3>青森</h3><img alt="F1"><img alt="1">07/23(木)～07/25(土)<p>坂本勉カップ</p></section>
          <section><h3>いわき平</h3><img alt="F2"><img alt="5">07/22(水)～07/24(金)<p>楽天Kドリームスカップ</p></section>
        </body></html>
        """
        result = keirin.collect(date(2026, 7, 23), FakeSession({keirin.URL: html}))
        self.assertTrue(result.ok)
        by_venue = {item["venue"]: item for item in result.entries}
        self.assertEqual(by_venue["青森"]["day"], "初日")
        self.assertEqual(by_venue["青森"]["grade"], "FⅠ")
        self.assertEqual(by_venue["いわき平"]["day"], "2日目")
        self.assertEqual(by_venue["いわき平"]["session"], "midnight")

    def test_boat_parser(self) -> None:
        monthly_html = """
        <html><body><h1>月間スケジュール</h1>
          <a href="/owpc/pc/race/raceindex?hd=20260724&jcd=05">テストG3</a>
        </body></html>
        """
        detail_html = """
        <html><body><h2>テストG3</h2><img alt="G3">
          <a>7月22日 初日</a><a>7月23日 ２日目</a><span>7月24日 最終日</span>
          <div>1R 14:35</div>
        </body></html>
        """
        session = FakeSession(
            {
                boatrace.MONTHLY_URL: monthly_html,
                "https://www.boatrace.jp/owpc/pc/race/raceindex?hd=20260724&jcd=05": detail_html,
            }
        )
        result = boatrace.collect(date(2026, 7, 23), session)
        self.assertTrue(result.ok)
        self.assertEqual(result.entries[0]["venue"], "多摩川")
        self.assertEqual(result.entries[0]["day"], "2日目")
        self.assertEqual(result.entries[0]["grade"], "G3")
        self.assertEqual(result.entries[0]["session"], "night")


    def test_jra_parser(self) -> None:
        html = """<html><body><h1>2026年7月19日（日曜） 競馬番組</h1><h2>2回福島8日</h2><h2>2回小倉8日</h2><h2>1回函館12日</h2></body></html>"""
        url = jra.URL.format(year=2026, month=7, day=19)
        result = jra.collect(date(2026, 7, 19), FakeSession({url: html}))
        self.assertTrue(result.ok)
        self.assertEqual([item["venue"] for item in result.entries], ["函館", "福島", "小倉"])

    def test_relabel_contiguous_meeting(self) -> None:
        payload = {"2026-07": []}
        for day in (22, 23, 24):
            find_day(payload, date(2026, 7, day))["venues"] = [{"sport": "boat", "venue": "多摩川"}]
        relabel_meeting_days(payload, "boat", "多摩川", date(2026, 7, 23))
        self.assertEqual(existing_entry(payload, date(2026, 7, 22), "boat", "多摩川")["day"], "初日")
        self.assertEqual(existing_entry(payload, date(2026, 7, 23), "boat", "多摩川")["day"], "2日目")
        self.assertEqual(existing_entry(payload, date(2026, 7, 24), "boat", "多摩川")["day"], "最終日")

    def test_notification_format(self) -> None:
        races = [{"date": "2026-07-22", "time": "17:50", "sport": "boat", "venue": "児島", "grade": "GⅢ", "name": "シモデンカップ"}]
        venues = [{"sport": "boat", "venue": "児島", "grade": "G3", "day": "最終日", "session": "night"}]
        message = build_full_message(
            "2026-07-22",
            races,
            venues,
            "https://example.com/gradedraces/",
            "https://example.com/monthly/",
        )
        self.assertTrue(message.startswith("7/22 (水) の公営競技\n🏆グレードレース（優勝戦・決勝）"))
        self.assertIn("17:50 ボートレース 児島 GⅢ シモデンカップ", message)
        self.assertIn("🏁開催場\n児島 G3 最終日 ナイター", message)
        self.assertTrue(message.endswith("https://example.com/monthly/"))


if __name__ == "__main__":
    unittest.main()
