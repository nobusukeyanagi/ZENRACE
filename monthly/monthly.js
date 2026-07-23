(() => {
  "use strict";

  const STATUS_ICON = {
    morning: "../schedule/icons/morning.png",
    night: "../schedule/icons/night.png",
    midnight: "../schedule/icons/midnight.png",
  };

  // 2026年7月の各競技公式開催日程を日単位で集約。
  const MONTHLY_DATA = {
  "2026-07": [
    {
      "date": "2026-07-01",
      "venues": [
        {
          "sport": "keirin",
          "venue": "函館",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "大宮",
          "grade": "FⅠ",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "松戸",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "平塚",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "豊橋",
          "grade": "FⅡ",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "松阪",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "奈良",
          "grade": "FⅡ",
          "session": "morning",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "auto",
          "venue": "川口",
          "grade": "普通",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "飯塚",
          "grade": "普通",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "戸田",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "多摩川",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "浜名湖",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "蒲郡",
          "grade": "一般",
          "session": "night",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "三国",
          "grade": "一般",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "びわこ",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "G2",
          "accent": true,
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "宮島",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "下関",
          "grade": "一般",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "若松",
          "grade": "一般",
          "session": "midnight",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "大村",
          "grade": "一般",
          "session": "night",
          "day": "6日目"
        },
        {
          "sport": "nar",
          "venue": "門別",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "大井",
          "session": "night",
          "day": "初日",
          "grade": "JpnⅠ",
          "accent": true
        },
        {
          "sport": "nar",
          "venue": "名古屋",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "園田",
          "day": "初日"
        }
      ]
    },
    {
      "date": "2026-07-02",
      "venues": [
        {
          "sport": "keirin",
          "venue": "函館",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "弥彦",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "大宮",
          "grade": "FⅠ",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "松戸",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "平塚",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "豊橋",
          "grade": "FⅡ",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "松阪",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "奈良",
          "grade": "FⅡ",
          "session": "morning",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "小松島",
          "grade": "GⅢ",
          "day": "初日"
        },
        {
          "sport": "auto",
          "venue": "伊勢崎",
          "grade": "普通",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "auto",
          "venue": "山陽",
          "grade": "普通",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "多摩川",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "浜名湖",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "蒲郡",
          "grade": "一般",
          "session": "night",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "びわこ",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "G2",
          "accent": true,
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "下関",
          "grade": "一般",
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "若松",
          "grade": "一般",
          "session": "midnight",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "芦屋",
          "grade": "一般",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "大村",
          "grade": "一般",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "門別",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "船橋",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "大井",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "名古屋",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "園田",
          "day": "最終日"
        }
      ]
    },
    {
      "date": "2026-07-03",
      "venues": [
        {
          "sport": "keirin",
          "venue": "函館",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "青森",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "弥彦",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "大宮",
          "grade": "FⅠ",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "松戸",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "松阪",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "奈良",
          "grade": "FⅡ",
          "session": "morning",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "小松島",
          "grade": "GⅢ",
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "伊勢崎",
          "grade": "普通",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "山陽",
          "grade": "普通",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "浜名湖",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "蒲郡",
          "grade": "一般",
          "session": "night",
          "girls": true,
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "びわこ",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "住之江",
          "grade": "一般",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "尼崎",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "G2",
          "accent": true,
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "下関",
          "grade": "一般",
          "session": "night",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "若松",
          "grade": "一般",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "芦屋",
          "grade": "一般",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "4日目"
        },
        {
          "sport": "nar",
          "venue": "船橋",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "大井",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "名古屋",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "園田",
          "session": "night",
          "day": "最終日"
        }
      ]
    },
    {
      "date": "2026-07-04",
      "venues": [
        {
          "sport": "keirin",
          "venue": "青森",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "弥彦",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "京王閣",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "伊東",
          "grade": "FⅡ",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "岸和田",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "小松島",
          "grade": "GⅢ",
          "day": "3日目"
        },
        {
          "sport": "keirin",
          "venue": "別府",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "auto",
          "venue": "伊勢崎",
          "grade": "普通",
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "auto",
          "venue": "浜松",
          "grade": "普通",
          "day": "初日"
        },
        {
          "sport": "auto",
          "venue": "山陽",
          "grade": "普通",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "桐生",
          "grade": "一般",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "浜名湖",
          "grade": "一般",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "蒲郡",
          "grade": "一般",
          "session": "night",
          "girls": true,
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "住之江",
          "grade": "一般",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "尼崎",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "G2",
          "accent": true,
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "徳山",
          "grade": "一般",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "下関",
          "grade": "一般",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "芦屋",
          "grade": "一般",
          "session": "morning",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "5日目"
        },
        {
          "sport": "jra",
          "venue": "福島",
          "day": "3日目"
        },
        {
          "sport": "jra",
          "venue": "小倉",
          "day": "3日目"
        },
        {
          "sport": "jra",
          "venue": "函館",
          "day": "7日目"
        },
        {
          "sport": "nar",
          "venue": "帯広",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "船橋",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "高知",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "佐賀",
          "session": "night",
          "day": "初日"
        }
      ]
    },
    {
      "date": "2026-07-05",
      "venues": [
        {
          "sport": "keirin",
          "venue": "青森",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "京王閣",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "伊東",
          "grade": "FⅡ",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "豊橋",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "和歌山",
          "grade": "FⅠ",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "岸和田",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "小松島",
          "grade": "GⅢ",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "佐世保",
          "grade": "FⅡ",
          "session": "morning",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "別府",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "伊勢崎",
          "grade": "普通",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "浜松",
          "grade": "普通",
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "山陽",
          "grade": "普通",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "桐生",
          "grade": "一般",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "多摩川",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "浜名湖",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "蒲郡",
          "grade": "一般",
          "session": "night",
          "girls": true,
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "住之江",
          "grade": "一般",
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "尼崎",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "G2",
          "accent": true,
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "徳山",
          "grade": "一般",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "芦屋",
          "grade": "一般",
          "session": "morning",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "一般",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "大村",
          "grade": "一般",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "jra",
          "venue": "福島",
          "day": "4日目"
        },
        {
          "sport": "jra",
          "venue": "小倉",
          "day": "4日目",
          "grade": "GⅢ"
        },
        {
          "sport": "jra",
          "venue": "函館",
          "day": "8日目"
        },
        {
          "sport": "nar",
          "venue": "帯広",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "盛岡",
          "day": "初日",
          "grade": "MⅡ"
        },
        {
          "sport": "nar",
          "venue": "金沢",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "高知",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "佐賀",
          "session": "night",
          "day": "最終日"
        }
      ]
    },
    {
      "date": "2026-07-06",
      "venues": [
        {
          "sport": "keirin",
          "venue": "取手",
          "grade": "FⅡ",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "京王閣",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "伊東",
          "grade": "FⅡ",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "豊橋",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "和歌山",
          "grade": "FⅠ",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "岸和田",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "佐世保",
          "grade": "FⅡ",
          "session": "morning",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "別府",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "浜松",
          "grade": "普通",
          "day": "3日目"
        },
        {
          "sport": "auto",
          "venue": "飯塚",
          "grade": "GⅡ",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "桐生",
          "grade": "一般",
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "多摩川",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "蒲郡",
          "grade": "一般",
          "session": "night",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "住之江",
          "grade": "一般",
          "session": "night",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "尼崎",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "徳山",
          "grade": "一般",
          "session": "morning",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "芦屋",
          "grade": "一般",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "大村",
          "grade": "一般",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "帯広",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "盛岡",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "川崎",
          "session": "night",
          "day": "初日"
        }
      ]
    },
    {
      "date": "2026-07-07",
      "venues": [
        {
          "sport": "keirin",
          "venue": "弥彦",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "取手",
          "grade": "FⅡ",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "豊橋",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "和歌山",
          "grade": "FⅠ",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "玉野",
          "grade": "FⅡ",
          "session": "midnight",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "防府",
          "grade": "FⅠ",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "久留米",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "佐世保",
          "grade": "FⅡ",
          "session": "morning",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "浜松",
          "grade": "普通",
          "day": "4日目"
        },
        {
          "sport": "auto",
          "venue": "飯塚",
          "grade": "GⅡ",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "桐生",
          "grade": "一般",
          "session": "night",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "戸田",
          "grade": "G2",
          "accent": true,
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "多摩川",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "三国",
          "grade": "G3",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "びわこ",
          "grade": "一般",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "住之江",
          "grade": "一般",
          "session": "night",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "尼崎",
          "grade": "一般",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "徳山",
          "grade": "一般",
          "session": "morning",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "若松",
          "grade": "G3",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "大村",
          "grade": "一般",
          "session": "midnight",
          "day": "3日目"
        },
        {
          "sport": "nar",
          "venue": "門別",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "盛岡",
          "day": "最終日",
          "grade": "MⅡ"
        },
        {
          "sport": "nar",
          "venue": "川崎",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "金沢",
          "day": "最終日"
        }
      ]
    },
    {
      "date": "2026-07-08",
      "venues": [
        {
          "sport": "keirin",
          "venue": "函館",
          "grade": "FⅠ",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "弥彦",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "取手",
          "grade": "FⅡ",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "大垣",
          "grade": "FⅠ",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "玉野",
          "grade": "FⅡ",
          "session": "midnight",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "広島",
          "grade": "FⅡ",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "防府",
          "grade": "FⅠ",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "久留米",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "浜松",
          "grade": "普通",
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "飯塚",
          "grade": "GⅡ",
          "session": "midnight",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "桐生",
          "grade": "一般",
          "session": "night",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "戸田",
          "grade": "G2",
          "accent": true,
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "多摩川",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "三国",
          "grade": "G3",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "びわこ",
          "grade": "一般",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "住之江",
          "grade": "一般",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "尼崎",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "徳山",
          "grade": "一般",
          "session": "morning",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "若松",
          "grade": "G3",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "大村",
          "grade": "一般",
          "session": "midnight",
          "day": "4日目"
        },
        {
          "sport": "nar",
          "venue": "門別",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "川崎",
          "session": "night",
          "day": "3日目",
          "grade": "JpnⅢ"
        },
        {
          "sport": "nar",
          "venue": "笠松",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "園田",
          "day": "初日"
        }
      ]
    },
    {
      "date": "2026-07-09",
      "venues": [
        {
          "sport": "keirin",
          "venue": "函館",
          "grade": "FⅠ",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "弥彦",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "大垣",
          "grade": "FⅠ",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "玉野",
          "grade": "FⅡ",
          "session": "midnight",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "広島",
          "grade": "FⅡ",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "防府",
          "grade": "FⅠ",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "久留米",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "川口",
          "grade": "普通",
          "day": "初日"
        },
        {
          "sport": "auto",
          "venue": "飯塚",
          "grade": "GⅡ",
          "session": "midnight",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "桐生",
          "grade": "一般",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "戸田",
          "grade": "G2",
          "accent": true,
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "多摩川",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "三国",
          "grade": "G3",
          "session": "morning",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "びわこ",
          "grade": "一般",
          "girls": true,
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "鳴門",
          "grade": "一般",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "丸亀",
          "grade": "一般",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "徳山",
          "grade": "一般",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "若松",
          "grade": "G3",
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "大村",
          "grade": "一般",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "門別",
          "session": "night",
          "day": "最終日",
          "grade": "HⅢ"
        },
        {
          "sport": "nar",
          "venue": "川崎",
          "session": "night",
          "day": "4日目"
        },
        {
          "sport": "nar",
          "venue": "笠松",
          "day": "2日目",
          "grade": "SPⅠ"
        },
        {
          "sport": "nar",
          "venue": "園田",
          "day": "最終日"
        }
      ]
    },
    {
      "date": "2026-07-10",
      "venues": [
        {
          "sport": "keirin",
          "venue": "函館",
          "grade": "FⅠ",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "いわき平",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "前橋",
          "grade": "GⅢ",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "小田原",
          "grade": "FⅡ",
          "session": "morning",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "伊東",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "名古屋",
          "grade": "FⅡ",
          "session": "midnight",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "大垣",
          "grade": "FⅠ",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "広島",
          "grade": "FⅡ",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "川口",
          "grade": "普通",
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "飯塚",
          "grade": "GⅡ",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "戸田",
          "grade": "G2",
          "accent": true,
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "浜名湖",
          "grade": "一般",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "三国",
          "grade": "G3",
          "session": "morning",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "びわこ",
          "grade": "一般",
          "girls": true,
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "鳴門",
          "grade": "一般",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "丸亀",
          "grade": "一般",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "下関",
          "grade": "一般",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "若松",
          "grade": "G3",
          "session": "night",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "川崎",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "笠松",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "園田",
          "session": "night",
          "day": "最終日",
          "grade": "重賞Ⅰ"
        }
      ]
    },
    {
      "date": "2026-07-11",
      "venues": [
        {
          "sport": "keirin",
          "venue": "いわき平",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "前橋",
          "grade": "GⅢ",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "小田原",
          "grade": "FⅡ",
          "session": "morning",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "伊東",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "名古屋",
          "grade": "FⅡ",
          "session": "midnight",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "岐阜",
          "grade": "FⅠ",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "松山",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "auto",
          "venue": "川口",
          "grade": "普通",
          "day": "3日目"
        },
        {
          "sport": "auto",
          "venue": "伊勢崎",
          "grade": "普通",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "戸田",
          "grade": "G2",
          "accent": true,
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "江戸川",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "浜名湖",
          "grade": "一般",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "三国",
          "grade": "G3",
          "session": "morning",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "びわこ",
          "grade": "一般",
          "girls": true,
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "鳴門",
          "grade": "一般",
          "session": "morning",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "丸亀",
          "grade": "一般",
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "下関",
          "grade": "一般",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "若松",
          "grade": "G3",
          "session": "night",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "jra",
          "venue": "福島",
          "day": "5日目"
        },
        {
          "sport": "jra",
          "venue": "小倉",
          "day": "5日目"
        },
        {
          "sport": "jra",
          "venue": "函館",
          "day": "9日目"
        },
        {
          "sport": "nar",
          "venue": "帯広",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "高知",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "佐賀",
          "session": "night",
          "day": "最終日"
        }
      ]
    },
    {
      "date": "2026-07-12",
      "venues": [
        {
          "sport": "keirin",
          "venue": "いわき平",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "前橋",
          "grade": "GⅢ",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "小田原",
          "grade": "FⅡ",
          "session": "morning",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "伊東",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "名古屋",
          "grade": "FⅡ",
          "session": "midnight",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "岐阜",
          "grade": "FⅠ",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "松山",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "川口",
          "grade": "普通",
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "伊勢崎",
          "grade": "普通",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "戸田",
          "grade": "G2",
          "accent": true,
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "江戸川",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "多摩川",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "浜名湖",
          "grade": "一般",
          "girls": true,
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "三国",
          "grade": "G3",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "びわこ",
          "grade": "一般",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "鳴門",
          "grade": "一般",
          "session": "morning",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "丸亀",
          "grade": "一般",
          "session": "night",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "下関",
          "grade": "一般",
          "session": "midnight",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "若松",
          "grade": "G3",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "3日目"
        },
        {
          "sport": "jra",
          "venue": "福島",
          "day": "6日目",
          "grade": "GⅢ"
        },
        {
          "sport": "jra",
          "venue": "小倉",
          "day": "6日目"
        },
        {
          "sport": "jra",
          "venue": "函館",
          "day": "10日目"
        },
        {
          "sport": "nar",
          "venue": "帯広",
          "session": "night",
          "day": "2日目",
          "grade": "BGⅡ"
        },
        {
          "sport": "nar",
          "venue": "盛岡",
          "day": "初日",
          "grade": "MⅡ"
        },
        {
          "sport": "nar",
          "venue": "金沢",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "高知",
          "session": "night",
          "day": "最終日"
        }
      ]
    },
    {
      "date": "2026-07-13",
      "venues": [
        {
          "sport": "keirin",
          "venue": "宇都宮",
          "grade": "FⅠ",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "京王閣",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "岐阜",
          "grade": "FⅠ",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "岸和田",
          "grade": "FⅡ",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "広島",
          "grade": "FⅡ",
          "session": "midnight",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "松山",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "佐世保",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "熊本",
          "grade": "FⅡ",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "auto",
          "venue": "伊勢崎",
          "grade": "普通",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "飯塚",
          "grade": "普通",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "auto",
          "venue": "山陽",
          "grade": "普通",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "江戸川",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "多摩川",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "浜名湖",
          "grade": "一般",
          "girls": true,
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "蒲郡",
          "grade": "G2",
          "accent": true,
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "尼崎",
          "grade": "G3",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "鳴門",
          "grade": "一般",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "丸亀",
          "grade": "一般",
          "session": "night",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "下関",
          "grade": "一般",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "4日目"
        },
        {
          "sport": "nar",
          "venue": "帯広",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "盛岡",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "浦和",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "名古屋",
          "session": "night",
          "day": "初日"
        }
      ]
    },
    {
      "date": "2026-07-14",
      "venues": [
        {
          "sport": "keirin",
          "venue": "函館",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "宇都宮",
          "grade": "FⅠ",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "京王閣",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "岸和田",
          "grade": "FⅡ",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "玉野",
          "grade": "FⅠ",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "広島",
          "grade": "FⅡ",
          "session": "midnight",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "佐世保",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "熊本",
          "grade": "FⅡ",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "飯塚",
          "grade": "普通",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "山陽",
          "grade": "普通",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "桐生",
          "grade": "一般",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "江戸川",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "多摩川",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "浜名湖",
          "grade": "一般",
          "girls": true,
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "蒲郡",
          "grade": "G2",
          "accent": true,
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "尼崎",
          "grade": "G3",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "丸亀",
          "grade": "一般",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "芦屋",
          "grade": "一般",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "一般",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "大村",
          "grade": "一般",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "門別",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "盛岡",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "浦和",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "金沢",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "名古屋",
          "session": "night",
          "day": "2日目"
        }
      ]
    },
    {
      "date": "2026-07-15",
      "venues": [
        {
          "sport": "keirin",
          "venue": "函館",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "取手",
          "grade": "FⅡ",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "宇都宮",
          "grade": "FⅠ",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "京王閣",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "岸和田",
          "grade": "FⅡ",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "玉野",
          "grade": "FⅠ",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "広島",
          "grade": "FⅡ",
          "session": "midnight",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "佐世保",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "熊本",
          "grade": "FⅡ",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "飯塚",
          "grade": "普通",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "山陽",
          "grade": "普通",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "桐生",
          "grade": "一般",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "江戸川",
          "grade": "一般",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "多摩川",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "浜名湖",
          "grade": "一般",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "蒲郡",
          "grade": "G2",
          "accent": true,
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "住之江",
          "grade": "一般",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "尼崎",
          "grade": "G3",
          "girls": true,
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "宮島",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "徳山",
          "grade": "一般",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "芦屋",
          "grade": "一般",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "大村",
          "grade": "一般",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "門別",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "浦和",
          "day": "3日目"
        },
        {
          "sport": "nar",
          "venue": "名古屋",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "園田",
          "day": "初日"
        }
      ]
    },
    {
      "date": "2026-07-16",
      "venues": [
        {
          "sport": "keirin",
          "venue": "函館",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "いわき平",
          "grade": "FⅡ",
          "session": "midnight",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "取手",
          "grade": "FⅡ",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "西武園",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "松阪",
          "grade": "FⅠ",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "奈良",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "玉野",
          "grade": "FⅠ",
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "川口",
          "grade": "GⅠ",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "auto",
          "venue": "山陽",
          "grade": "普通",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "桐生",
          "grade": "一般",
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "江戸川",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "多摩川",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "蒲郡",
          "grade": "G2",
          "accent": true,
          "session": "night",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "びわこ",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "住之江",
          "grade": "一般",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "尼崎",
          "grade": "G3",
          "girls": true,
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "宮島",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "徳山",
          "grade": "一般",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "芦屋",
          "grade": "一般",
          "session": "morning",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "大村",
          "grade": "一般",
          "session": "midnight",
          "day": "3日目"
        },
        {
          "sport": "nar",
          "venue": "門別",
          "session": "night",
          "day": "最終日",
          "grade": "HⅡ"
        },
        {
          "sport": "nar",
          "venue": "浦和",
          "day": "4日目"
        },
        {
          "sport": "nar",
          "venue": "園田",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "佐賀",
          "session": "night",
          "day": "最終日"
        }
      ]
    },
    {
      "date": "2026-07-17",
      "venues": [
        {
          "sport": "keirin",
          "venue": "いわき平",
          "grade": "FⅡ",
          "session": "midnight",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "弥彦",
          "grade": "FⅡ",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "取手",
          "grade": "FⅡ",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "西武園",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "松阪",
          "grade": "FⅠ",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "奈良",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "高知",
          "grade": "GⅡ",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "auto",
          "venue": "川口",
          "grade": "GⅠ",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "山陽",
          "grade": "普通",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "桐生",
          "grade": "一般",
          "session": "night",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "戸田",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "蒲郡",
          "grade": "G2",
          "accent": true,
          "session": "night",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "びわこ",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "住之江",
          "grade": "一般",
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "尼崎",
          "grade": "G3",
          "girls": true,
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "G3",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "宮島",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "徳山",
          "grade": "一般",
          "session": "morning",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "芦屋",
          "grade": "一般",
          "session": "morning",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "大村",
          "grade": "一般",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "浦和",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "名古屋",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "園田",
          "session": "night",
          "day": "最終日"
        }
      ]
    },
    {
      "date": "2026-07-18",
      "venues": [
        {
          "sport": "keirin",
          "venue": "いわき平",
          "grade": "FⅡ",
          "session": "midnight",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "弥彦",
          "grade": "FⅡ",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "西武園",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "静岡",
          "grade": "FⅠ",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "岐阜",
          "grade": "FⅡ",
          "session": "morning",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "松阪",
          "grade": "FⅠ",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "奈良",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "高知",
          "grade": "GⅡ",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "川口",
          "grade": "GⅠ",
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "auto",
          "venue": "浜松",
          "grade": "普通",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "auto",
          "venue": "山陽",
          "grade": "普通",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "桐生",
          "grade": "一般",
          "session": "night",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "戸田",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "蒲郡",
          "grade": "G2",
          "accent": true,
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "G3",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "三国",
          "grade": "一般",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "びわこ",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "住之江",
          "grade": "一般",
          "session": "night",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "尼崎",
          "grade": "G3",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "G3",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "宮島",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "徳山",
          "grade": "一般",
          "session": "morning",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "若松",
          "grade": "一般",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "芦屋",
          "grade": "一般",
          "session": "morning",
          "day": "5日目"
        },
        {
          "sport": "jra",
          "venue": "福島",
          "day": "7日目"
        },
        {
          "sport": "jra",
          "venue": "小倉",
          "day": "7日目"
        },
        {
          "sport": "jra",
          "venue": "函館",
          "day": "11日目"
        },
        {
          "sport": "nar",
          "venue": "帯広",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "高知",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "佐賀",
          "session": "night",
          "day": "最終日"
        }
      ]
    },
    {
      "date": "2026-07-19",
      "venues": [
        {
          "sport": "keirin",
          "venue": "弥彦",
          "grade": "FⅡ",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "京王閣",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "松戸",
          "grade": "FⅡ",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "静岡",
          "grade": "FⅠ",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "岐阜",
          "grade": "FⅡ",
          "session": "morning",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "豊橋",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "高知",
          "grade": "GⅡ",
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "auto",
          "venue": "川口",
          "grade": "GⅠ",
          "session": "night",
          "day": "4日目"
        },
        {
          "sport": "auto",
          "venue": "浜松",
          "grade": "普通",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "山陽",
          "grade": "普通",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "桐生",
          "grade": "一般",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "戸田",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "多摩川",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "G3",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "三国",
          "grade": "一般",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "びわこ",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "住之江",
          "grade": "一般",
          "session": "night",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "G3",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "宮島",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "徳山",
          "grade": "一般",
          "session": "morning",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "下関",
          "grade": "G3",
          "session": "night",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "若松",
          "grade": "一般",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "芦屋",
          "grade": "一般",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "G3",
          "day": "初日"
        },
        {
          "sport": "jra",
          "venue": "福島",
          "day": "8日目"
        },
        {
          "sport": "jra",
          "venue": "小倉",
          "day": "8日目",
          "grade": "GⅢ"
        },
        {
          "sport": "jra",
          "venue": "函館",
          "day": "12日目",
          "grade": "GⅢ"
        },
        {
          "sport": "nar",
          "venue": "帯広",
          "session": "night",
          "day": "2日目",
          "grade": "BGⅢ"
        },
        {
          "sport": "nar",
          "venue": "盛岡",
          "day": "初日",
          "grade": "MⅢ"
        },
        {
          "sport": "nar",
          "venue": "金沢",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "高知",
          "session": "night",
          "day": "最終日"
        }
      ]
    },
    {
      "date": "2026-07-20",
      "venues": [
        {
          "sport": "keirin",
          "venue": "京王閣",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "松戸",
          "grade": "FⅡ",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "静岡",
          "grade": "FⅠ",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "岐阜",
          "grade": "FⅡ",
          "session": "morning",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "豊橋",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "岸和田",
          "grade": "FⅠ",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "高知",
          "grade": "GⅡ",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "川口",
          "grade": "GⅠ",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "浜松",
          "grade": "普通",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "戸田",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "多摩川",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "G3",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "三国",
          "grade": "一般",
          "session": "morning",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "びわこ",
          "grade": "一般",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "住之江",
          "grade": "一般",
          "session": "night",
          "day": "6日目"
        },
        {
          "sport": "boat",
          "venue": "丸亀",
          "grade": "一般",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "G3",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "徳山",
          "grade": "一般",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "下関",
          "grade": "G3",
          "session": "night",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "若松",
          "grade": "一般",
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "G3",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "帯広",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "盛岡",
          "day": "2日目",
          "grade": "JpnⅢ"
        },
        {
          "sport": "nar",
          "venue": "大井",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "金沢",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "笠松",
          "day": "最終日",
          "grade": "SPⅡ"
        },
        {
          "sport": "nar",
          "venue": "佐賀",
          "session": "night",
          "day": "最終日"
        }
      ]
    },
    {
      "date": "2026-07-21",
      "venues": [
        {
          "sport": "keirin",
          "venue": "京王閣",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "松戸",
          "grade": "FⅡ",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "豊橋",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "富山",
          "grade": "FⅠ",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "松阪",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "岸和田",
          "grade": "FⅠ",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "伊勢崎",
          "grade": "普通",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "auto",
          "venue": "山陽",
          "grade": "普通",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "多摩川",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "G3",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "三国",
          "grade": "一般",
          "session": "morning",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "びわこ",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "住之江",
          "grade": "一般",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "丸亀",
          "grade": "一般",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "G3",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "下関",
          "grade": "G3",
          "session": "night",
          "girls": true,
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "若松",
          "grade": "一般",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "G3",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "門別",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "盛岡",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "大井",
          "session": "night",
          "day": "2日目"
        }
      ]
    },
    {
      "date": "2026-07-22",
      "venues": [
        {
          "sport": "keirin",
          "venue": "いわき平",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "前橋",
          "grade": "GⅢ",
          "session": "night",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "伊東",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "富山",
          "grade": "FⅠ",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "松阪",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "岸和田",
          "grade": "FⅠ",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "玉野",
          "grade": "FⅠ",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "広島",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "佐世保",
          "grade": "FⅡ",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "auto",
          "venue": "伊勢崎",
          "grade": "普通",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "山陽",
          "grade": "普通",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "多摩川",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "G3",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "三国",
          "grade": "一般",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "尼崎",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "鳴門",
          "grade": "一般",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "丸亀",
          "grade": "一般",
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "G3",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "下関",
          "grade": "G3",
          "session": "night",
          "girls": true,
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "G3",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "大村",
          "grade": "一般",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "門別",
          "session": "night",
          "day": "2日目",
          "grade": "HⅢ"
        },
        {
          "sport": "nar",
          "venue": "大井",
          "session": "night",
          "day": "3日目",
          "grade": "SⅢ"
        },
        {
          "sport": "nar",
          "venue": "笠松",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "園田",
          "day": "初日"
        }
      ]
    },
    {
      "date": "2026-07-23",
      "venues": [
        {
          "sport": "keirin",
          "venue": "青森",
          "grade": "FⅠ",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "いわき平",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "前橋",
          "grade": "GⅢ",
          "session": "night",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "小田原",
          "grade": "FⅡ",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "伊東",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "富山",
          "grade": "FⅠ",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "松阪",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "玉野",
          "grade": "FⅠ",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "広島",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "佐世保",
          "grade": "FⅡ",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "伊勢崎",
          "grade": "普通",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "山陽",
          "grade": "普通",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "桐生",
          "grade": "一般",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "江戸川",
          "grade": "G3",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "多摩川",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "G3",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "尼崎",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "鳴門",
          "grade": "一般",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "丸亀",
          "grade": "一般",
          "session": "night",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "下関",
          "grade": "G3",
          "session": "night",
          "girls": true,
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "芦屋",
          "grade": "一般",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "G3",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "大村",
          "grade": "一般",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "門別",
          "session": "night",
          "day": "最終日",
          "grade": "HⅡ"
        },
        {
          "sport": "nar",
          "venue": "大井",
          "session": "night",
          "day": "4日目"
        },
        {
          "sport": "nar",
          "venue": "笠松",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "園田",
          "day": "最終日"
        }
      ]
    },
    {
      "date": "2026-07-24",
      "venues": [
        {
          "sport": "keirin",
          "venue": "青森",
          "grade": "FⅠ",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "いわき平",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "前橋",
          "grade": "GⅢ",
          "session": "night",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "小田原",
          "grade": "FⅡ",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "伊東",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "和歌山",
          "grade": "FⅡ",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "玉野",
          "grade": "FⅠ",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "広島",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "小倉",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "佐世保",
          "grade": "FⅡ",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "飯塚",
          "grade": "普通",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "桐生",
          "grade": "一般",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "戸田",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "江戸川",
          "grade": "G3",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "浜名湖",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "住之江",
          "grade": "一般",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "尼崎",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "鳴門",
          "grade": "一般",
          "session": "morning",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "丸亀",
          "grade": "一般",
          "session": "night",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "宮島",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "下関",
          "grade": "G3",
          "session": "night",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "芦屋",
          "grade": "一般",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "G3",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "大村",
          "grade": "一般",
          "session": "midnight",
          "day": "3日目"
        },
        {
          "sport": "nar",
          "venue": "大井",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "笠松",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "園田",
          "session": "night",
          "day": "最終日"
        }
      ]
    },
    {
      "date": "2026-07-25",
      "venues": [
        {
          "sport": "keirin",
          "venue": "青森",
          "grade": "FⅠ",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "小田原",
          "grade": "FⅡ",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "豊橋",
          "grade": "GⅢ",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "奈良",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "和歌山",
          "grade": "FⅡ",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "松山",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "小倉",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "武雄",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "auto",
          "venue": "川口",
          "grade": "普通",
          "day": "初日"
        },
        {
          "sport": "auto",
          "venue": "飯塚",
          "grade": "普通",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "桐生",
          "grade": "一般",
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "戸田",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "江戸川",
          "grade": "G3",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "浜名湖",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "住之江",
          "grade": "一般",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "尼崎",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "鳴門",
          "grade": "一般",
          "session": "morning",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "丸亀",
          "grade": "一般",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "宮島",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "若松",
          "grade": "一般",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "芦屋",
          "grade": "一般",
          "session": "morning",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "大村",
          "grade": "一般",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "jra",
          "venue": "新潟",
          "day": "初日"
        },
        {
          "sport": "jra",
          "venue": "中京",
          "day": "初日"
        },
        {
          "sport": "jra",
          "venue": "札幌",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "帯広",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "高知",
          "session": "night",
          "day": "初日"
        }
      ]
    },
    {
      "date": "2026-07-26",
      "venues": [
        {
          "sport": "keirin",
          "venue": "取手",
          "grade": "FⅡ",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "豊橋",
          "grade": "GⅢ",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "奈良",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "和歌山",
          "grade": "FⅡ",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "松山",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "小倉",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "武雄",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "川口",
          "grade": "普通",
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "飯塚",
          "grade": "普通",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "桐生",
          "grade": "一般",
          "session": "night",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "戸田",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "江戸川",
          "grade": "G3",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "浜名湖",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "住之江",
          "grade": "一般",
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "尼崎",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "鳴門",
          "grade": "一般",
          "session": "morning",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "宮島",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "若松",
          "grade": "一般",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "芦屋",
          "grade": "一般",
          "session": "morning",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "jra",
          "venue": "新潟",
          "day": "2日目",
          "grade": "GⅢ"
        },
        {
          "sport": "jra",
          "venue": "中京",
          "day": "2日目",
          "grade": "GⅢ"
        },
        {
          "sport": "jra",
          "venue": "札幌",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "帯広",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "盛岡",
          "day": "初日",
          "grade": "MⅢ"
        },
        {
          "sport": "nar",
          "venue": "金沢",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "高知",
          "session": "night",
          "day": "最終日"
        }
      ]
    },
    {
      "date": "2026-07-27",
      "venues": [
        {
          "sport": "keirin",
          "venue": "取手",
          "grade": "FⅡ",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "立川",
          "grade": "FⅠ",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "豊橋",
          "grade": "GⅢ",
          "day": "3日目"
        },
        {
          "sport": "keirin",
          "venue": "奈良",
          "grade": "FⅠ",
          "session": "night",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "玉野",
          "grade": "FⅠ",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "広島",
          "grade": "FⅡ",
          "session": "morning",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "松山",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "武雄",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "川口",
          "grade": "普通",
          "day": "3日目"
        },
        {
          "sport": "auto",
          "venue": "伊勢崎",
          "grade": "普通",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "auto",
          "venue": "飯塚",
          "grade": "普通",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "桐生",
          "grade": "一般",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "戸田",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "江戸川",
          "grade": "G3",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "girls": true,
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "浜名湖",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "三国",
          "grade": "一般",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "住之江",
          "grade": "一般",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "鳴門",
          "grade": "一般",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "宮島",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "下関",
          "grade": "一般",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "若松",
          "grade": "一般",
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "芦屋",
          "grade": "一般",
          "session": "morning",
          "day": "5日目"
        },
        {
          "sport": "nar",
          "venue": "帯広",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "盛岡",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "川崎",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "金沢",
          "session": "night",
          "day": "2日目"
        }
      ]
    },
    {
      "date": "2026-07-28",
      "venues": [
        {
          "sport": "keirin",
          "venue": "取手",
          "grade": "FⅡ",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "西武園",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "立川",
          "grade": "FⅠ",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "平塚",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "伊東",
          "grade": "FⅡ",
          "session": "midnight",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "豊橋",
          "grade": "GⅢ",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "玉野",
          "grade": "FⅠ",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "広島",
          "grade": "FⅡ",
          "session": "morning",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "川口",
          "grade": "普通",
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "伊勢崎",
          "grade": "普通",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "飯塚",
          "grade": "普通",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "江戸川",
          "grade": "G3",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "girls": true,
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "三国",
          "grade": "一般",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "びわこ",
          "grade": "SG",
          "accent": true,
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "丸亀",
          "grade": "一般",
          "session": "night",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "宮島",
          "grade": "一般",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "下関",
          "grade": "一般",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "若松",
          "grade": "一般",
          "session": "night",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "芦屋",
          "grade": "一般",
          "session": "morning",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "大村",
          "grade": "一般",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "門別",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "nar",
          "venue": "盛岡",
          "day": "最終日",
          "grade": "MⅡ"
        },
        {
          "sport": "nar",
          "venue": "川崎",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "金沢",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "名古屋",
          "session": "night",
          "day": "初日",
          "grade": "SPⅠ"
        }
      ]
    },
    {
      "date": "2026-07-29",
      "venues": [
        {
          "sport": "keirin",
          "venue": "西武園",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "立川",
          "grade": "FⅠ",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "平塚",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "伊東",
          "grade": "FⅡ",
          "session": "midnight",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "和歌山",
          "grade": "FⅠ",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "玉野",
          "grade": "FⅠ",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "広島",
          "grade": "FⅡ",
          "session": "morning",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "伊勢崎",
          "grade": "普通",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "浜松",
          "grade": "GⅡ",
          "day": "初日"
        },
        {
          "sport": "auto",
          "venue": "飯塚",
          "grade": "普通",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "girls": true,
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "三国",
          "grade": "一般",
          "session": "morning",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "びわこ",
          "grade": "SG",
          "accent": true,
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "丸亀",
          "grade": "一般",
          "session": "night",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "宮島",
          "grade": "一般",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "徳山",
          "grade": "一般",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "下関",
          "grade": "一般",
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "若松",
          "grade": "一般",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "大村",
          "grade": "一般",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "門別",
          "session": "night",
          "day": "2日目",
          "grade": "HⅢ"
        },
        {
          "sport": "nar",
          "venue": "川崎",
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "nar",
          "venue": "名古屋",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "nar",
          "venue": "園田",
          "day": "初日"
        }
      ]
    },
    {
      "date": "2026-07-30",
      "venues": [
        {
          "sport": "keirin",
          "venue": "青森",
          "grade": "FⅡ",
          "session": "morning",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "弥彦",
          "grade": "FⅠ",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "西武園",
          "grade": "FⅡ",
          "session": "midnight",
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "平塚",
          "grade": "FⅡ",
          "session": "night",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "伊東",
          "grade": "FⅡ",
          "session": "midnight",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "keirin",
          "venue": "岐阜",
          "grade": "FⅡ",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "keirin",
          "venue": "和歌山",
          "grade": "FⅠ",
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "浜松",
          "grade": "GⅡ",
          "day": "2日目"
        },
        {
          "sport": "auto",
          "venue": "山陽",
          "grade": "普通",
          "session": "midnight",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "平和島",
          "grade": "一般",
          "girls": true,
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "三国",
          "grade": "一般",
          "session": "morning",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "びわこ",
          "grade": "SG",
          "accent": true,
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "丸亀",
          "grade": "一般",
          "session": "night",
          "girls": true,
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "徳山",
          "grade": "一般",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "下関",
          "grade": "一般",
          "session": "night",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "大村",
          "grade": "一般",
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "nar",
          "venue": "門別",
          "session": "night",
          "day": "最終日",
          "grade": "HⅢ"
        },
        {
          "sport": "nar",
          "venue": "川崎",
          "session": "night",
          "day": "4日目"
        },
        {
          "sport": "nar",
          "venue": "名古屋",
          "session": "night",
          "day": "3日目"
        },
        {
          "sport": "nar",
          "venue": "園田",
          "day": "最終日"
        }
      ]
    },
    {
      "date": "2026-07-31",
      "venues": [
        {
          "sport": "keirin",
          "venue": "青森",
          "grade": "FⅡ",
          "session": "morning",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "弥彦",
          "grade": "FⅠ",
          "session": "night",
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "岐阜",
          "grade": "FⅡ",
          "girls": true,
          "day": "2日目"
        },
        {
          "sport": "keirin",
          "venue": "和歌山",
          "grade": "FⅠ",
          "day": "最終日"
        },
        {
          "sport": "auto",
          "venue": "浜松",
          "grade": "GⅡ",
          "day": "3日目"
        },
        {
          "sport": "auto",
          "venue": "山陽",
          "grade": "普通",
          "session": "midnight",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "桐生",
          "grade": "G3",
          "session": "night",
          "girls": true,
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "多摩川",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "浜名湖",
          "grade": "G3",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "常滑",
          "grade": "一般",
          "day": "2日目"
        },
        {
          "sport": "boat",
          "venue": "津",
          "grade": "一般",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "三国",
          "grade": "一般",
          "session": "morning",
          "day": "5日目"
        },
        {
          "sport": "boat",
          "venue": "びわこ",
          "grade": "SG",
          "accent": true,
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "尼崎",
          "grade": "一般",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "丸亀",
          "grade": "一般",
          "session": "night",
          "girls": true,
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "児島",
          "grade": "一般",
          "day": "4日目"
        },
        {
          "sport": "boat",
          "venue": "徳山",
          "grade": "一般",
          "session": "morning",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "下関",
          "grade": "一般",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "boat",
          "venue": "若松",
          "grade": "一般",
          "session": "night",
          "day": "初日"
        },
        {
          "sport": "boat",
          "venue": "福岡",
          "grade": "一般",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "唐津",
          "grade": "一般",
          "session": "morning",
          "day": "3日目"
        },
        {
          "sport": "boat",
          "venue": "大村",
          "grade": "一般",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "川崎",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "名古屋",
          "session": "night",
          "day": "最終日"
        },
        {
          "sport": "nar",
          "venue": "園田",
          "session": "night",
          "day": "最終日"
        }
      ]
    }
  ]
};

  const WEEKDAY = ["日", "月", "火", "水", "木", "金", "土"];
  const HOLIDAYS = new Set(["2026-07-20"]);
  const schedule = document.getElementById("monthlySchedule");
  if (!schedule) return;

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[char]);

  const DAY_BADGE_DIGITS = { "0": "０", "1": "１", "2": "２", "3": "３", "4": "４", "5": "５", "6": "６", "7": "７", "8": "８", "9": "９" };
  const toFullWidthDigits = (value) => String(value).replace(/\d/g, (digit) => DAY_BADGE_DIGITS[digit] || digit);
  const dayBadgeText = (value) => {
    if (!value) return "";
    if (value === "初日") return "初";
    if (value === "最終日") return "終";
    const match = String(value).match(/^(\d+)日目$/);
    if (!match) return String(value);
    const numeric = Number(match[1]);
    return numeric <= 9 ? toFullWidthDigits(match[1]) : match[1];
  };
  const renderDayLabel = (value) => {
    if (!value) return "";
    const text = dayBadgeText(value);
    const multiDigit = String(text).length > 1 ? " multi-digit" : "";
    return `<span class="day-label${multiDigit}" aria-label="${escapeHtml(value)}" title="${escapeHtml(value)}">${escapeHtml(text)}</span>`;
  };

  const parseDate = (value) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const showPreparingToast = () => {
    let toast = document.querySelector(".monthly-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "monthly-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.append(toast);
    }
    toast.textContent = "遷移先ページは準備中です";
    toast.classList.add("is-visible");
    window.clearTimeout(Number(toast.dataset.timer || 0));
    const timer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
    toast.dataset.timer = String(timer);
  };

  const venueButtonHtml = (item) => {
    const grade = item.grade
      ? `<span class="grade-icon ${item.accent ? "accent" : "muted"}">${escapeHtml(item.grade)}</span>`
      : "";
    const session = item.session
      ? `<img class="status-icon" src="${STATUS_ICON[item.session]}" alt="" aria-hidden="true">`
      : "";
    const girls = item.girls
      ? '<img class="status-icon girls" src="../schedule/icons/girls.png" alt="" aria-hidden="true">'
      : "";
    const showDay = item.sport !== "nar" && item.sport !== "jra" && item.day;
    const day = showDay ? renderDayLabel(item.day) : "";
    const aria = [item.venue, item.grade, item.session, item.girls ? "ガールズ" : "", showDay ? item.day : ""].filter(Boolean).join(" ");

    return `<button type="button" class="venue-button sport-${escapeHtml(item.sport)}" aria-label="${escapeHtml(aria)}">
      <span class="venue-main-line">
        <span class="venue-name">${escapeHtml(item.venue)}</span>
        <span class="sport-icon ${escapeHtml(item.sport)}" aria-hidden="true"></span>
      </span>
      <span class="venue-meta-line">${grade}${day}${session}${girls}</span>
    </button>`;
  };

  const venueGroupsHtml = (venues) => {
    const groups = [];
    venues.forEach((item) => {
      const lastGroup = groups.at(-1);
      if (lastGroup?.sport === item.sport) {
        lastGroup.items.push(item);
        return;
      }
      groups.push({ sport: item.sport, items: [item] });
    });

    return groups.map((group) => `<div class="venue-sport-group sport-group-${escapeHtml(group.sport)}">
      ${group.items.map(venueButtonHtml).join("")}
    </div>`).join("");
  };

  const dayHtml = (day) => {
    const date = parseDate(day.date);
    const dayClasses = ["day-card"];
    if (date.getDay() === 6) dayClasses.push("sat");
    if (date.getDay() === 0) dayClasses.push("sun");
    if (HOLIDAYS.has(day.date)) dayClasses.push("holiday");
    return `<article class="${dayClasses.join(" " )}">
      <div class="date-cell" aria-label="${date.getMonth() + 1}月${date.getDate()}日 ${WEEKDAY[date.getDay()]}曜日">
        <span class="date-number">${date.getDate()}</span>
        <span class="date-weekday">${WEEKDAY[date.getDay()]}</span>
      </div>
      <div class="venue-grid">${venueGroupsHtml(day.venues)}</div>
    </article>`;
  };

  const render = (monthKey) => {
    const days = MONTHLY_DATA[monthKey] || [];
    schedule.innerHTML = days.length
      ? days.map(dayHtml).join("")
      : '<div class="monthly-empty">この月の開催日程は準備中です</div>';
    schedule.querySelectorAll(".venue-button").forEach((button) => {
      button.addEventListener("click", showPreparingToast);
    });
  };

  window.addEventListener("zenrace-month-change", (event) => {
    render(event.detail?.month || "2026-07");
  });

  document.addEventListener("DOMContentLoaded", () => {
    const selectedMonth = document.querySelector("[data-zenrace-month-selector]")?.dataset.selectedMonth || "2026-07";
    render(selectedMonth);
  });
})();
