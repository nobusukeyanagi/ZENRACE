from __future__ import annotations

import re
import sys
from pathlib import Path

ROBOTS_META = '<meta name="robots" content="noindex, follow">'
ROBOTS_META_PATTERN = re.compile(
    r"\s*<meta\b(?=[^>]*\bname\s*=\s*(['\"])robots\1)[^>]*>\s*",
    flags=re.IGNORECASE,
)
HEAD_PATTERN = re.compile(r"<head\b[^>]*>", flags=re.IGNORECASE)


def inject_noindex(html: str) -> tuple[str, bool]:
    """既存のrobots指定を置き換え、head直下へnoindexを挿入する。"""
    without_existing = ROBOTS_META_PATTERN.sub("\n", html)
    head = HEAD_PATTERN.search(without_existing)
    if head is None:
        return html, False

    updated = (
        without_existing[: head.end()]
        + "\n  "
        + ROBOTS_META
        + without_existing[head.end() :]
    )
    return updated, True


def main() -> int:
    site_dir = Path(sys.argv[1] if len(sys.argv) > 1 else "_site")
    if not site_dir.is_dir():
        print(f"ERROR: 公開ディレクトリがありません: {site_dir}", file=sys.stderr)
        return 1

    html_files = sorted(site_dir.rglob("*.html"))
    if not html_files:
        print(f"ERROR: HTMLファイルがありません: {site_dir}", file=sys.stderr)
        return 1

    updated_count = 0
    errors: list[str] = []

    for html_file in html_files:
        try:
            original = html_file.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError) as exc:
            errors.append(f"{html_file}: 読み込み失敗 ({exc})")
            continue

        updated, inserted = inject_noindex(original)
        if not inserted:
            errors.append(f"{html_file}: <head>が見つかりません")
            continue

        try:
            html_file.write_text(updated, encoding="utf-8")
        except OSError as exc:
            errors.append(f"{html_file}: 書き込み失敗 ({exc})")
            continue

        updated_count += 1

    print(f"{updated_count}件のHTMLへnoindexを設定しました。")

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
