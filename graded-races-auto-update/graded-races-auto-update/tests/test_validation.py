from scripts.common import merge_patches, Patch, same_name, strip_edition


def test_strip_edition() -> None:
    assert strip_edition("第35回 アサヒビールカップ") == "アサヒビールカップ"


def test_same_name() -> None:
    assert same_name("フェアリーステークス", "フェアリーS")


def test_empty_patch_does_not_delete_existing_value() -> None:
    records = [{"date":"2026-01-01","sport":"jra","venue":"中山","grade":"GⅠ","name":"テスト","winner":"既存"}]
    patched, changes = merge_patches(records, [Patch(0, {"winner":""}, "test", "https://example.com")])
    assert patched[0]["winner"] == "既存"
    assert changes == []
