(() => {
  "use strict";

  // 添付データセットの基準日・表示基準時刻。
  const todayBase = new Date(2026, 1, 23);
  const selectedDate = new Date(todayBase);
  const minDate = new Date(2026, 1, 22);
  const maxDate = new Date(2026, 1, 24);
  const REFERENCE_MINUTES = 16 * 60 + 40;
  const FOCUS_SLOT_INDEX = 1;
  const WEEKDAY = ["日", "月", "火", "水", "木", "金", "土"];
  const JAPAN_HOLIDAYS_2026 = new Set([
    "2026-01-01", "2026-01-12", "2026-02-11", "2026-02-23",
    "2026-03-20", "2026-04-29", "2026-05-03", "2026-05-04",
    "2026-05-05", "2026-05-06", "2026-07-20", "2026-08-11",
    "2026-09-21", "2026-09-22", "2026-09-23", "2026-10-12",
    "2026-11-03", "2026-11-23",
  ]);

  const baseRaces = Array.isArray(window.ZENRACE_RACES) ? window.ZENRACE_RACES : [];
  const baseVenueOrder = Array.isArray(window.ZENRACE_VENUE_ORDER) ? window.ZENRACE_VENUE_ORDER : [];
  const baseVenueGrades = Array.isArray(window.ZENRACE_VENUE_GRADES) ? window.ZENRACE_VENUE_GRADES : [];
  const extraRaceDays = window.ZENRACE_RACE_DAYS && typeof window.ZENRACE_RACE_DAYS === "object"
    ? window.ZENRACE_RACE_DAYS
    : {};

  const showPreparingToast = (message = "遷移先ページは準備中です") => {
    let toast = document.querySelector(".today-race-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "today-race-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(Number(toast.dataset.timer || 0));
    const timer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
    toast.dataset.timer = String(timer);
  };

  const pad = (value) => String(value).padStart(2, "0");
  const dateKey = (value) => `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  const startOfDay = (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const diffDays = (a, b) => Math.round((startOfDay(a) - startOfDay(b)) / 86400000);
  const isHoliday = (value) => JAPAN_HOLIDAYS_2026.has(dateKey(value));
  const formatDateTitle = (value) => {
    const weekday = value.getDay();
    const classes = ["date-weekday"];
    if (isHoliday(value)) classes.push("holiday");
    else if (weekday === 0) classes.push("sunday");
    else if (weekday === 6) classes.push("saturday");
    return `${value.getFullYear()}年 ${value.getMonth() + 1}月 ${value.getDate()}日 <span class="${classes.join(" ")}">(${WEEKDAY[weekday]})</span>`;
  };
  const timeToMinutes = (time) => {
    if (!/^\d{1,2}:\d{2}$/.test(String(time))) return Number.NaN;
    const [hour, minute] = String(time).split(":").map(Number);
    return (hour * 60) + minute;
  };
  const raceNumber = (race) => Number.parseInt(String(race.race), 10) || 0;
  const groupKey = (sport, venue) => `${sport}:${venue}`;
  const normalizedGrade = (value) => String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/Ⅲ/g, "3")
    .replace(/Ⅱ/g, "2")
    .replace(/Ⅰ/g, "1")
    .replace(/III/g, "3")
    .replace(/II/g, "2")
    .replace(/I/g, "1");
  const isAccentGrade = (sport, grade) => {
    if (!grade) return false;
    const normalized = normalizedGrade(grade);
    if (sport === "keirin") return normalized === "GP" || /^G[123]$/.test(normalized);
    if (sport === "auto") return normalized === "SG" || /^G[12]$/.test(normalized);
    if (sport === "boat") return normalized === "SG" || normalized === "PG1" || /^G[123]$/.test(normalized);
    if (sport === "nar" || sport === "jra") return true;
    return false;
  };

  const featuredRaceKey = (date, sport, venue, race) => `${date}:${sport}:${venue}:${race}`;
  const FEATURED_RACES = new Set([
    featuredRaceKey("2026-02-22", "jra", "東京", "11R"),
    featuredRaceKey("2026-02-22", "jra", "小倉", "11R"),
    featuredRaceKey("2026-02-22", "nar", "帯広", "11R"),
    featuredRaceKey("2026-02-22", "nar", "高知", "4R"),
    featuredRaceKey("2026-02-23", "keirin", "熊本", "12R"),
    featuredRaceKey("2026-02-23", "auto", "浜松", "12R"),
    featuredRaceKey("2026-02-23", "nar", "名古屋", "7R"),
    featuredRaceKey("2026-02-24", "boat", "江戸川", "12R"),
  ]);
  const isFeaturedRace = (race) => FEATURED_RACES.has(
    featuredRaceKey(dateKey(selectedDate), race.sport, race.venue, race.race),
  );
  const baseVenueDayMap = new Map([
    [groupKey("keirin", "京王閣"), "初日"],
    [groupKey("keirin", "松戸"), "2日目"],
    [groupKey("keirin", "平塚"), "初日"],
    [groupKey("keirin", "豊橋"), "初日"],
    [groupKey("keirin", "玉野"), "初日"],
    [groupKey("keirin", "防府"), "最終日"],
    [groupKey("keirin", "高知"), "2日目"],
    [groupKey("keirin", "熊本"), "最終日"],
    [groupKey("auto", "浜松"), "最終日"],
    [groupKey("auto", "飯塚"), "最終日"],
    [groupKey("boat", "江戸川"), "最終日"],
    [groupKey("boat", "平和島"), "3日目"],
    [groupKey("boat", "多摩川"), "2日目"],
    [groupKey("boat", "浜名湖"), "5日目"],
    [groupKey("boat", "蒲郡"), "3日目"],
    [groupKey("boat", "びわこ"), "2日目"],
    [groupKey("boat", "住之江"), "2日目"],
    [groupKey("boat", "丸亀"), "3日目"],
    [groupKey("boat", "児島"), "初日"],
    [groupKey("boat", "宮島"), "4日目"],
    [groupKey("boat", "徳山"), "最終日"],
    [groupKey("boat", "芦屋"), "3日目"],
    [groupKey("boat", "福岡"), "最終日"],
    [groupKey("boat", "唐津"), "初日"],
    [groupKey("boat", "大村"), "最終日"],
  ]);

  const baseVenueSessionMap = new Map([
    [groupKey("keirin", "京王閣"), "midnight"],
    [groupKey("keirin", "松戸"), "morning"],
    [groupKey("keirin", "平塚"), "midnight"],
    [groupKey("keirin", "豊橋"), "night"],
    [groupKey("keirin", "玉野"), "midnight"],
    [groupKey("keirin", "高知"), "night"],
    [groupKey("auto", "飯塚"), "midnight"],
    [groupKey("boat", "蒲郡"), "night"],
    [groupKey("boat", "住之江"), "night"],
    [groupKey("boat", "丸亀"), "night"],
    [groupKey("boat", "徳山"), "morning"],
    [groupKey("boat", "芦屋"), "morning"],
    [groupKey("boat", "唐津"), "morning"],
    [groupKey("boat", "大村"), "night"],
    [groupKey("nar", "名古屋"), "night"],
    [groupKey("nar", "高知"), "night"],
  ]);
  const baseGirlsVenueSet = new Set([
    groupKey("keirin", "高知"),
    groupKey("boat", "福岡"),
  ]);

  const DAY_BADGE_DIGITS = { "0": "０", "1": "１", "2": "２", "3": "３", "4": "４", "5": "５", "6": "６", "7": "７", "8": "８", "9": "９" };
  const escapeAttr = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
  const renderVenueDayLabel = (value) => {
    if (!value) return "";
    const text = dayBadgeText(value);
    const multiDigit = String(text).length > 1 ? " multi-digit" : "";
    return `<span class="venue-day-label${multiDigit}" aria-label="${escapeAttr(value)}" title="${escapeAttr(value)}">${escapeAttr(text)}</span>`;
  };


  const makeMap = (value) => new Map(Object.entries(value || {}));
  const currentDayData = () => {
    const key = dateKey(selectedDate);
    if (key === dateKey(todayBase)) {
      return {
        races: baseRaces,
        venueOrder: baseVenueOrder,
        venueGrades: baseVenueGrades,
        venueDayMap: baseVenueDayMap,
        venueSessionMap: baseVenueSessionMap,
        girlsVenueSet: baseGirlsVenueSet,
      };
    }
    const source = extraRaceDays[key] || {};
    return {
      races: Array.isArray(source.races) ? source.races : [],
      venueOrder: Array.isArray(source.venueOrder) ? source.venueOrder : [],
      venueGrades: Array.isArray(source.venueGrades) ? source.venueGrades : [],
      venueDayMap: makeMap(source.venueDays),
      venueSessionMap: makeMap(source.venueSessions),
      girlsVenueSet: new Set(Array.isArray(source.girlsVenues) ? source.girlsVenues : []),
    };
  };

  const groupRacesByVenue = (dayData) => {
    const grouped = new Map();
    const gradeMap = new Map(dayData.venueGrades.map((item) => [groupKey(item.sport, item.venue), item]));
    for (const race of dayData.races) {
      const key = groupKey(race.sport, race.venue);
      if (!grouped.has(key)) {
        grouped.set(key, { venue: race.venue, sport: race.sport, grade: gradeMap.get(key) || null, races: [] });
      }
      grouped.get(key).races.push({ ...race, minutes: timeToMinutes(race.time) });
    }

    const venueRank = new Map(dayData.venueOrder.map((item, index) => [groupKey(item.sport, item.venue), index]));
    return [...grouped.entries()]
      .map(([key, row]) => ({
        ...row,
        key,
        races: row.races.sort((a, b) => {
          const aValid = Number.isFinite(a.minutes);
          const bValid = Number.isFinite(b.minutes);
          if (aValid && bValid) return (a.minutes - b.minutes) || (raceNumber(a) - raceNumber(b));
          if (aValid !== bValid) return aValid ? -1 : 1;
          return raceNumber(a) - raceNumber(b);
        }),
      }))
      .sort((a, b) => (venueRank.get(a.key) ?? 999) - (venueRank.get(b.key) ?? 999));
  };

  const createCard = (race, className = "") => {
    if (!race) {
      return `<span class="race-card placeholder ${className}" aria-hidden="true"><span class="race-no">--</span><span class="race-time">--:--</span></span>`;
    }
    const cancelled = race.time === "中止";
    const featured = isFeaturedRace(race);
    const label = `${race.venue} ${race.race} ${cancelled ? "中止" : `締切${race.time}`}${featured ? " 注目レース" : ""}`;
    const stateClasses = `${cancelled ? " cancelled" : ""}${featured ? " featured-race" : ""}`;
    return `<a href="#" class="race-card ${className}${stateClasses}" aria-label="${label}"><span class="race-no">${race.race}</span><span class="race-time">${race.time}</span></a>`;
  };

  const buildCurrentTrack = (row) => {
    const nextIndex = row.races.findIndex((race) => race.minutes > REFERENCE_MINUTES);
    const leadingSpacers = [createCard(null, "spacer"), createCard(null, "spacer")];

    if (nextIndex < 0) {
      return {
        mode: "ended",
        anchor: "previous",
        cards: [
          ...leadingSpacers,
          ...row.races.map((race, index) => {
            const classes = ["finished"];
            if (index === 0) classes.push("first-race");
            if (index === row.races.length - 1) classes.push("final", "anchor-card");
            return createCard(race, classes.join(" "));
          }),
          '<span class="race-scroll-tail" aria-hidden="true"></span>',
        ].join(""),
      };
    }

    // 本日は全開催で、1Rを金帯右列まで戻せるよう先頭に透明スロットを置く。
    const cards = [...leadingSpacers];
    const anchor = nextIndex === 0 ? "after-focus" : "focus";

    row.races.forEach((race, index) => {
      const classes = [];
      if (index < nextIndex) classes.push("finished");
      else if (index === nextIndex && anchor === "focus") classes.push("current");
      else classes.push("upcoming");
      if (index === 0) classes.push("first-race");
      if (index === nextIndex) {
        classes.push("anchor-card");
        if (anchor === "after-focus") classes.push("prestart");
      }
      cards.push(createCard(race, classes.join(" ")));
    });
    cards.push('<span class="race-scroll-tail" aria-hidden="true"></span>');

    return { mode: "active", anchor, cards: cards.join("") };
  };


  const buildPastTrack = (row) => ({
    mode: "past",
    anchor: "right",
    cards: row.races.map((race, index) => createCard(
      race,
      index === row.races.length - 1 ? "finished final anchor-card" : "finished",
    )).join(""),
  });

  const buildFutureTrack = (row) => ({
    mode: "future",
    anchor: "left",
    // 未来日は1Rを左端に置き、最終レース以降の空白領域を作らない。
    cards: row.races.map((race, index) => createCard(
      race,
      `upcoming${index === 0 ? " anchor-card" : ""}`,
    )).join(""),
  });

  const renderRow = (row, dayDiff, dayData) => {
    let track = buildCurrentTrack(row);
    if (dayDiff < 0) track = buildPastTrack(row);
    if (dayDiff > 0) track = buildFutureTrack(row);

    const venueDay = dayData.venueDayMap.get(row.key) || "";
    const session = dayData.venueSessionMap.get(row.key) || "";
    const hasGirls = dayData.girlsVenueSet.has(row.key);
    const gradeIcon = row.grade
      ? `<span class="venue-grade-icon ${isAccentGrade(row.sport, row.grade.label) ? "accent" : "muted"}" aria-label="格 ${row.grade.label}">${row.grade.label}</span>`
      : "";
    const sessionIcon = session
      ? `<img class="venue-status-icon" src="icons/${session}.png" alt="" aria-hidden="true">`
      : "";
    const girlsIcon = hasGirls
      ? `<img class="venue-status-icon girls" src="icons/girls.png" alt="" aria-hidden="true">`
      : "";
    const dayLabel = renderVenueDayLabel(venueDay);
    const metaLine = gradeIcon || dayLabel || sessionIcon || girlsIcon
      ? `<div class="venue-meta-row">${gradeIcon}${dayLabel}${sessionIcon}${girlsIcon}</div>`
      : "";

    return `
      <article class="venue-row" data-mode="${track.mode}">
        <div class="venue-card sport-${row.sport}">
          <div class="venue-title-line">
            <div class="venue-name">${row.venue}</div>
            <span class="venue-sport-icon ${row.sport}" aria-hidden="true"></span>
          </div>
          ${metaLine}
        </div>
        <div class="venue-track-shell">
          <span class="venue-focus-band" aria-hidden="true"></span>
          <div class="venue-track" data-mode="${track.mode}" data-anchor="${track.anchor}">${track.cards}</div>
        </div>
      </article>`;
  };

  const readLayout = () => {
    const styles = getComputedStyle(document.documentElement);
    return {
      slotWidth: parseFloat(styles.getPropertyValue("--race-card-w")) || 76,
      slotGap: parseFloat(styles.getPropertyValue("--track-gap")) || 7,
      trackPad: parseFloat(styles.getPropertyValue("--track-pad-x")) || 8,
      focusSlotIndex: parseFloat(styles.getPropertyValue("--focus-slot-index")) || 1,
      focusBandShift: parseFloat(styles.getPropertyValue("--focus-band-shift")) || 0,
      bandWidth: parseFloat(styles.getPropertyValue("--focus-band-w")) || 44,
    };
  };

  const setScrollLeftExactly = (track, value) => {
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const target = Math.min(maxScroll, Math.max(0, value));
    track.scrollLeft = target;
    return target;
  };

  const getAnchorPositions = (track, card) => {
    const { slotWidth, slotGap, trackPad, focusSlotIndex, focusBandShift, bandWidth } = readLayout();
    const bandLeft = trackPad
      + (focusSlotIndex * (slotWidth + slotGap))
      + focusBandShift
      + ((slotWidth - bandWidth) / 2);
    const actualCardWidth = card?.getBoundingClientRect().width || slotWidth;
    const focusLeft = bandLeft + ((bandWidth - actualCardWidth) / 2);
    return {
      left: trackPad,
      previous: focusLeft - actualCardWidth - slotGap,
      focus: focusLeft,
      afterFocus: focusLeft + actualCardWidth + slotGap,
      right: track.clientWidth - trackPad - actualCardWidth,
    };
  };

  const alignTrack = (track) => {
    if (!track) return;
    const card = track.querySelector(".anchor-card");
    if (!card) return setScrollLeftExactly(track, 0);

    const anchor = track.dataset.anchor || "focus";
    const positions = getAnchorPositions(track, card);
    const desiredLeft = anchor === "left"
      ? positions.left
      : anchor === "previous"
        ? positions.previous
        : anchor === "after-focus"
          ? positions.afterFocus
          : anchor === "right"
            ? positions.right
            : positions.focus;

    const target = card.offsetLeft - desiredLeft;
    setScrollLeftExactly(track, target);
  };

  const calculateTodayBounds = (track) => {
    const raceCards = [...track.querySelectorAll(".race-card[href='#']")];
    if (!raceCards.length) return { min: 0, max: 0 };

    const firstRace = raceCards[0];
    const finalRace = raceCards[raceCards.length - 1];
    const firstPositions = getAnchorPositions(track, firstRace);
    const finalPositions = getAnchorPositions(track, finalRace);
    const nativeMax = Math.max(0, track.scrollWidth - track.clientWidth);
    const min = Math.min(nativeMax, Math.max(0, firstRace.offsetLeft - firstPositions.afterFocus));
    const max = Math.min(nativeMax, Math.max(min, finalRace.offsetLeft - finalPositions.previous));
    return { min, max };
  };

  const clampTodayTrack = (track) => {
    const { min, max } = calculateTodayBounds(track);
    track.dataset.minScroll = String(min);
    track.dataset.maxScroll = String(max);
    if (track.scrollLeft < min) track.scrollLeft = min;
    else if (track.scrollLeft > max) track.scrollLeft = max;
  };

  const syncTrackBand = (track) => {
    if (!track) return;
    const band = track.parentElement?.querySelector(".venue-focus-band");
    if (!band) return;
    const baseScroll = Number.parseFloat(track.dataset.bandBaseScroll || "0");
    const offset = baseScroll - track.scrollLeft;
    band.style.transform = `translate3d(${offset}px,0,0)`;
  };

  const resetTrackBand = (track) => {
    if (!track) return;
    track.dataset.bandBaseScroll = String(track.scrollLeft);
    syncTrackBand(track);
  };

  const bindTrackBand = (track) => {
    if (!track || track.dataset.bandBound === "true") return;
    track.dataset.bandBound = "true";
    let frame = 0;
    track.addEventListener("scroll", () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        syncTrackBand(track);
      });
    }, { passive: true });
  };

  const bindTodayClamp = (track) => {
    if (!track || !["active", "ended"].includes(track.dataset.mode) || track.dataset.todayClampBound === "true") return;
    track.dataset.todayClampBound = "true";
    let frame = 0;
    const clamp = () => {
      frame = 0;
      clampTodayTrack(track);
    };
    track.addEventListener("scroll", () => {
      if (!frame) frame = requestAnimationFrame(clamp);
    }, { passive: true });
    track.addEventListener("touchend", clamp, { passive: true });
    track.addEventListener("pointerup", clamp, { passive: true });
  };

  const bindEndClamp = (track) => {
    if (!track || !["past", "future"].includes(track.dataset.mode) || track.dataset.endClampBound === "true") return;
    track.dataset.endClampBound = "true";
    let frame = 0;
    const clamp = () => {
      frame = 0;
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      if (track.scrollLeft > maxScroll) track.scrollLeft = maxScroll;
    };
    track.addEventListener("scroll", () => {
      if (!frame) frame = requestAnimationFrame(clamp);
    }, { passive: true });
    track.addEventListener("touchend", clamp, { passive: true });
  };



  const render = () => {
    const board = document.getElementById("todayBoard");
    const dateTitle = document.getElementById("dateTitle");
    const todayBtn = document.getElementById("todayBtn");
    const isCurrentDay = dateKey(selectedDate) === dateKey(todayBase);
    const dayDiff = diffDays(selectedDate, todayBase);

    dateTitle.innerHTML = formatDateTitle(selectedDate);
    todayBtn.classList.toggle("is-current", isCurrentDay);
    todayBtn.disabled = isCurrentDay;

    board.dataset.dayMode = dayDiff < 0 ? "past" : dayDiff > 0 ? "future" : "today";
    const dayData = currentDayData();
    const rows = groupRacesByVenue(dayData);
    board.innerHTML = rows.length
      ? rows.map((row) => renderRow(row, dayDiff, dayData)).join("")
      : '<div class="today-empty">この日の開催データは準備中です</div>';
    board.querySelectorAll(".venue-track").forEach((track) => {
      bindEndClamp(track);
      if (dayDiff === 0) {
        bindTodayClamp(track);
        bindTrackBand(track);
      }
    });

    board.querySelectorAll(".race-card[href='#']").forEach((card) => {
      card.addEventListener("click", (event) => {
        event.preventDefault();
        showPreparingToast();
      });
    });

    const alignAllTracks = () => board.querySelectorAll(".venue-track").forEach((track) => {
      alignTrack(track);
      if (dayDiff === 0) {
        clampTodayTrack(track);
        resetTrackBand(track);
      }
    });
    requestAnimationFrame(() => requestAnimationFrame(alignAllTracks));
    window.setTimeout(alignAllTracks, 60);
    window.setTimeout(alignAllTracks, 180);
    document.fonts?.ready.then(alignAllTracks).catch(() => {});
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("prevDate")?.addEventListener("click", () => {
      if (startOfDay(selectedDate) <= startOfDay(minDate)) {
        showPreparingToast("遷移先ページは準備中");
        return;
      }
      selectedDate.setDate(selectedDate.getDate() - 1);
      render();
    });
    document.getElementById("nextDate")?.addEventListener("click", () => {
      if (startOfDay(selectedDate) >= startOfDay(maxDate)) {
        showPreparingToast("遷移先ページは準備中");
        return;
      }
      selectedDate.setDate(selectedDate.getDate() + 1);
      render();
    });
    document.getElementById("todayBtn")?.addEventListener("click", () => {
      selectedDate.setTime(todayBase.getTime());
      render();
    });
    document.getElementById("refreshRaces")?.addEventListener("click", () => render());

    const realignVisibleTracks = () => {
      const isCurrentDay = dateKey(selectedDate) === dateKey(todayBase);
      document.querySelectorAll(".venue-track").forEach((track) => {
        alignTrack(track);
        if (isCurrentDay) {
          clampTodayTrack(track);
          resetTrackBand(track);
        }
      });
    };
    render();
    window.addEventListener("resize", realignVisibleTracks);
    window.addEventListener("orientationchange", () => window.setTimeout(realignVisibleTracks, 120));
    window.addEventListener("pageshow", () => window.setTimeout(realignVisibleTracks, 80));
    window.visualViewport?.addEventListener("resize", () => window.setTimeout(realignVisibleTracks, 40));
  });
})();
