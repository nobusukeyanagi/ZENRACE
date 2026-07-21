(() => {
  "use strict";

  // 出走表デモの基準日。レースデータは2026年2月23日の固定データ。
  const todayBase = new Date(2026, 1, 23);
  const selectedDate = new Date(todayBase);
  const REFERENCE_MINUTES = 16 * 60 + 40;
  const FOCUS_SLOT_INDEX = 1;
  const WEEKDAY = ["日", "月", "火", "水", "木", "金", "土"];
  const VENUE_ORDER = ["松戸", "京王閣", "平塚", "豊橋", "玉野", "防府", "高知", "浜松", "飯塚"];

  const races = Array.isArray(window.ZENRACE_RACES) ? window.ZENRACE_RACES : [];

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
  const formatDateTitle = (value) => `${value.getFullYear()}年 ${value.getMonth() + 1}月 ${value.getDate()}日 (${WEEKDAY[value.getDay()]})`;
  const timeToMinutes = (time) => {
    const [hour, minute] = String(time).split(":").map(Number);
    return (hour * 60) + minute;
  };

  const disableContentPinch = () => {
    const shell = document.querySelector(".zenrace-content-shell");
    if (!shell) return;
    const blockMultiTouch = (event) => {
      if (event.touches && event.touches.length > 1) event.preventDefault();
    };
    shell.addEventListener("touchstart", blockMultiTouch, { passive: false });
    shell.addEventListener("touchmove", blockMultiTouch, { passive: false });
    for (const type of ["gesturestart", "gesturechange", "gestureend"]) {
      shell.addEventListener(type, (event) => event.preventDefault(), { passive: false });
    }
  };

  const groupRacesByVenue = () => {
    const grouped = new Map();
    for (const race of races) {
      if (!grouped.has(race.venue)) {
        grouped.set(race.venue, { venue: race.venue, sport: race.sport, races: [] });
      }
      grouped.get(race.venue).races.push({
        ...race,
        minutes: timeToMinutes(race.time),
      });
    }
    const venueRank = new Map(VENUE_ORDER.map((venue, index) => [venue, index]));
    return [...grouped.values()]
      .map((row) => ({
        ...row,
        races: row.races.sort((a, b) => a.minutes - b.minutes),
      }))
      .sort((a, b) => (venueRank.get(a.venue) ?? 99) - (venueRank.get(b.venue) ?? 99));
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
      const finalRace = row.races[row.races.length - 1];
      return {
        mode: "ended",
        cards: [createCard(finalRace, "finished"), createCard(null), createCard(null), createCard(null)].join(""),
      };
    }

    const cards = [];
    if (nextIndex === 0) cards.push(createCard(null, "spacer"));
    row.races.forEach((race, index) => {
      let className = "upcoming";
      if (index < nextIndex) className = "finished";
      if (index === nextIndex) className = "current";
      cards.push(createCard(race, className));
    });
    if (nextIndex === row.races.length - 1) {
      cards.push(createCard(null), createCard(null), createCard(null));
    }
    return { mode: "active", cards: cards.join("") };
  };

  const buildPastTrack = (row) => {
    const finalRace = row.races[row.races.length - 1];
    return {
      mode: "ended",
      cards: [createCard(finalRace, "finished"), createCard(null), createCard(null), createCard(null)].join(""),
    };
  };

  const buildFutureTrack = (row) => ({
    mode: "future",
    cards: [createCard(null, "spacer"), ...row.races.map((race, index) => createCard(race, index === 0 ? "current" : "upcoming"))].join(""),
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
          <div class="venue-track" data-mode="${track.mode}">${track.cards}</div>
        </div>
      </article>`;
  };

  const alignTrack = (track) => {
    if (!track) return;
    if (track.dataset.mode === "ended") {
      track.scrollLeft = 0;
      return;
    }
    const focusCard = track.querySelector(".race-card.current");
    if (!focusCard) {
      track.scrollLeft = 0;
      return;
    }
    const styles = getComputedStyle(document.documentElement);
    const slotWidth = parseFloat(styles.getPropertyValue("--race-card-w")) || focusCard.offsetWidth || 76;
    const slotGap = parseFloat(styles.getPropertyValue("--track-gap")) || 7;
    const trackPad = parseFloat(styles.getPropertyValue("--track-pad-x")) || 8;
    const target = focusCard.offsetLeft - trackPad - (FOCUS_SLOT_INDEX * (slotWidth + slotGap));
    track.scrollLeft = Math.max(0, target);
  };

  const render = () => {
    const board = document.getElementById("todayBoard");
    const dateTitle = document.getElementById("dateTitle");
    const todayBtn = document.getElementById("todayBtn");
    const isCurrentDay = dateKey(selectedDate) === dateKey(todayBase);
    const dayDiff = diffDays(selectedDate, todayBase);

    dateTitle.textContent = formatDateTitle(selectedDate);
    todayBtn.classList.toggle("is-current", isCurrentDay);
    todayBtn.disabled = isCurrentDay;

    const rows = groupRacesByVenue();
    board.innerHTML = rows.map((row) => renderRow(row, dayDiff)).join("");

    board.querySelectorAll(".race-card[href='#']").forEach((card) => {
      card.addEventListener("click", (event) => {
        event.preventDefault();
        showPreparingToast();
      });
    });

    requestAnimationFrame(() => board.querySelectorAll(".venue-track").forEach(alignTrack));
  };

  document.addEventListener("DOMContentLoaded", () => {
    disableContentPinch();
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

    render();
    window.addEventListener("resize", () => document.querySelectorAll(".venue-track").forEach(alignTrack));
  });
})();
