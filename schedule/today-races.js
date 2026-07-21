(() => {
  "use strict";

  // 添付データセットの基準日・表示基準時刻。
  const todayBase = new Date(2026, 1, 23);
  const selectedDate = new Date(todayBase);
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

  const races = Array.isArray(window.ZENRACE_RACES) ? window.ZENRACE_RACES : [];
  const venueOrder = Array.isArray(window.ZENRACE_VENUE_ORDER) ? window.ZENRACE_VENUE_ORDER : [];

  const showPreparingToast = () => {
    let toast = document.querySelector(".today-race-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "today-race-toast";
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

  const pad = (value) => String(value).padStart(2, "0");
  const dateKey = (value) => `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  const startOfDay = (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const diffDays = (a, b) => Math.round((startOfDay(a) - startOfDay(b)) / 86400000);
  const isHoliday = (value) => JAPAN_HOLIDAYS_2026.has(dateKey(value));
  const formatDateTitle = (value) => {
    const holidayClass = isHoliday(value) ? " holiday" : "";
    return `${value.getFullYear()}年 ${value.getMonth() + 1}月 ${value.getDate()}日 <span class="date-weekday${holidayClass}">(${WEEKDAY[value.getDay()]})</span>`;
  };
  const timeToMinutes = (time) => {
    const [hour, minute] = String(time).split(":").map(Number);
    return (hour * 60) + minute;
  };
  const groupKey = (sport, venue) => `${sport}:${venue}`;



  const groupRacesByVenue = () => {
    const grouped = new Map();
    for (const race of races) {
      const key = groupKey(race.sport, race.venue);
      if (!grouped.has(key)) {
        grouped.set(key, { venue: race.venue, sport: race.sport, races: [] });
      }
      grouped.get(key).races.push({ ...race, minutes: timeToMinutes(race.time) });
    }

    const venueRank = new Map(venueOrder.map((item, index) => [groupKey(item.sport, item.venue), index]));
    return [...grouped.entries()]
      .map(([key, row]) => ({ ...row, key, races: row.races.sort((a, b) => a.minutes - b.minutes) }))
      .sort((a, b) => (venueRank.get(a.key) ?? 999) - (venueRank.get(b.key) ?? 999));
  };

  const createCard = (race, className = "") => {
    if (!race) {
      return `<span class="race-card placeholder ${className}" aria-hidden="true"><span class="race-no">--</span><span class="race-time">--:--</span></span>`;
    }
    const label = `${race.venue} ${race.race} 締切${race.time}`;
    return `<a href="#" class="race-card ${className}" aria-label="${label}"><span class="race-no">${race.race}</span><span class="race-time">${race.time}</span></a>`;
  };

  const buildCurrentTrack = (row) => {
    const nextIndex = row.races.findIndex((race) => race.minutes > REFERENCE_MINUTES);
    if (nextIndex < 0) {
      return {
        mode: "ended",
        anchor: "previous",
        cards: [
          ...row.races.map((race, index) => createCard(
            race,
            index === row.races.length - 1 ? "finished final anchor-card" : "finished",
          )),
          '<span class="race-scroll-tail" aria-hidden="true"></span>',
        ].join(""),
      };
    }

    const cards = [];
    const minutesUntilFirstRace = row.races[0].minutes - REFERENCE_MINUTES;
    const anchor = nextIndex === 0 && minutesUntilFirstRace >= 30 ? "after-focus" : "focus";

    // 1R前は左側に実レースがないため、基準列まで透明スロットを置く。
    if (nextIndex === 0) {
      const spacerCount = anchor === "after-focus" ? 2 : 1;
      for (let index = 0; index < spacerCount; index += 1) {
        cards.push(createCard(null, "spacer"));
      }
    }

    row.races.forEach((race, index) => {
      let className = "upcoming";
      if (index < nextIndex) className = "finished";
      if (index === nextIndex) className = "current anchor-card";
      cards.push(createCard(race, className));
    });
    cards.push('<span class="race-scroll-tail" aria-hidden="true"></span>');

    return { mode: "active", anchor, cards: cards.join("") };
  };


  const buildPastTrack = (row) => ({
    mode: "past",
    anchor: "right",
    cards: [
      ...row.races.map((race, index) => createCard(
        race,
        index === row.races.length - 1 ? "finished final anchor-card" : "finished",
      )),
      '<span class="race-scroll-tail" aria-hidden="true"></span>',
    ].join(""),
  });

  const buildFutureTrack = (row) => ({
    mode: "future",
    anchor: "left",
    cards: [
      ...row.races.map((race, index) => createCard(race, `upcoming${index === 0 ? " anchor-card" : ""}`)),
      '<span class="race-scroll-tail" aria-hidden="true"></span>',
    ].join(""),
  });

  const renderRow = (row, dayDiff) => {
    let track = buildCurrentTrack(row);
    if (dayDiff < 0) track = buildPastTrack(row);
    if (dayDiff > 0) track = buildFutureTrack(row);

    return `
      <article class="venue-row" data-mode="${track.mode}">
        <div class="venue-card sport-${row.sport}">
          <div class="venue-name">${row.venue}</div>
          <span class="venue-sport-icon ${row.sport}" aria-hidden="true"></span>
        </div>
        <div class="venue-track-shell">
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
    const board = document.getElementById("todayBoard");
    const boardRect = board.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const { slotWidth, slotGap, trackPad, bandWidth } = readLayout();
    const boardStyles = getComputedStyle(board, "::before");
    const bandLeft = parseFloat(boardStyles.left);
    const bandVisualLeft = Number.isFinite(bandLeft)
      ? boardRect.left + bandLeft
      : trackRect.left + trackPad + slotWidth + slotGap;
    const actualCardWidth = card?.getBoundingClientRect().width || slotWidth;
    const focusLeft = bandVisualLeft + ((bandWidth - actualCardWidth) / 2) - trackRect.left;
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
    const rows = groupRacesByVenue();
    board.innerHTML = rows.map((row) => renderRow(row, dayDiff)).join("");

    board.querySelectorAll(".race-card[href='#']").forEach((card) => {
      card.addEventListener("click", (event) => {
        event.preventDefault();
        showPreparingToast();
      });
    });

    const alignAllTracks = () => board.querySelectorAll(".venue-track").forEach(alignTrack);
    requestAnimationFrame(() => requestAnimationFrame(alignAllTracks));
    window.setTimeout(alignAllTracks, 60);
    window.setTimeout(alignAllTracks, 180);
    document.fonts?.ready.then(alignAllTracks).catch(() => {});
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("prevDate")?.addEventListener("click", () => {
      selectedDate.setDate(selectedDate.getDate() - 1);
      render();
    });
    document.getElementById("nextDate")?.addEventListener("click", () => {
      selectedDate.setDate(selectedDate.getDate() + 1);
      render();
    });
    document.getElementById("todayBtn")?.addEventListener("click", () => {
      selectedDate.setTime(todayBase.getTime());
      render();
    });

    const realignVisibleTracks = () => document.querySelectorAll(".venue-track").forEach(alignTrack);
    render();
    window.addEventListener("resize", realignVisibleTracks);
    window.addEventListener("orientationchange", () => window.setTimeout(realignVisibleTracks, 120));
    window.addEventListener("pageshow", () => window.setTimeout(realignVisibleTracks, 80));
    window.visualViewport?.addEventListener("resize", () => window.setTimeout(realignVisibleTracks, 40));
  });
})();
