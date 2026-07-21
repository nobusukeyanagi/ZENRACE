(() => {
  "use strict";

  const BASE_DATE = new Date();
  const todayBase = new Date(BASE_DATE.getFullYear(), BASE_DATE.getMonth(), BASE_DATE.getDate());
  const selectedDate = new Date(todayBase);

  const WEEKDAY = ["日", "月", "火", "水", "木", "金", "土"];
  const FOCUS_SLOT_INDEX = 1;

  const SHOW_PREPARING_TOAST = () => {
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

  const BASE_ROWS = [
    { venue: "富山", sport: "keirin", raceCount: 12, focusRace: 8, startTime: "17:10", interval: 18 },
    { venue: "岸和田", sport: "keirin", raceCount: 12, focusRace: 8, startTime: "16:58", interval: 19 },
    { venue: "京王閣", sport: "keirin", raceCount: 12, focusRace: 8, startTime: "17:05", interval: 18 },
    { venue: "松戸", sport: "keirin", raceCount: 12, focusRace: 8, startTime: "17:18", interval: 19 },
    { venue: "豊橋", sport: "keirin", raceCount: 12, focusRace: 8, startTime: "17:30", interval: 18 },
    { venue: "松阪", sport: "keirin", raceCount: 12, focusRace: 8, startTime: "17:42", interval: 19 },
    { venue: "伊勢崎", sport: "auto", raceCount: 12, focusRace: 8, startTime: "18:00", interval: 24 },
    { venue: "山陽", sport: "auto", raceCount: 12, focusRace: 8, startTime: "18:15", interval: 24 },
  ];

  const pad = (value) => String(value).padStart(2, "0");
  const dateKey = (value) => `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  const startOfDay = (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const diffDays = (a, b) => Math.round((startOfDay(a) - startOfDay(b)) / 86400000);
  const formatDateTitle = (value) => `${value.getFullYear()}年 ${value.getMonth() + 1}月 ${value.getDate()}日 (${WEEKDAY[value.getDay()]})`;

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

  const shiftTime = (time, minutes) => {
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + minutes;
    const normalized = ((total % 1440) + 1440) % 1440;
    return `${pad(Math.floor(normalized / 60))}:${pad(normalized % 60)}`;
  };

  const makeRaces = (row, minutesShift = 0) => Array.from({ length: row.raceCount }, (_, index) => ({
    no: `${index + 1}R`,
    time: shiftTime(row.startTime, row.interval * index + minutesShift),
    raceNo: index + 1,
  }));

  const buildRowsForDate = (value) => {
    const diff = diffDays(value, todayBase);
    return BASE_ROWS.map((row, index) => {
      const races = makeRaces(row, diff * (index % 2 === 0 ? 3 : 2));
      let state = "today";
      if (diff < 0) state = "past";
      if (diff > 0) state = "future";
      return { ...row, state, races };
    });
  };

  const createCard = (race, className = "") => {
    if (!race) {
      return `<span class="race-card placeholder ${className}" aria-hidden="true"><span class="race-no">--</span><span class="race-time">--:--</span></span>`;
    }
    const label = `${race.no} ${race.time}`;
    return `<a href="#" class="race-card ${className}" data-race-label="${label}" aria-label="${label}"><span class="race-no">${race.no}</span><span class="race-time">${race.time}</span></a>`;
  };

  const buildTodayTrack = (row) => {
    const focusIndex = Math.max(0, Math.min(row.raceCount - 1, row.focusRace - 1));
    return row.races.map((race, index) => {
      let className = "upcoming";
      if (index === focusIndex) className = "current";
      else if (index < focusIndex) className = "finished";
      return createCard(race, className);
    }).join("");
  };

  const buildPastTrack = (row) => {
    const lastRace = row.races[row.races.length - 1];
    return [
      createCard(lastRace, "finished"),
      createCard(null),
      createCard(null),
      createCard(null),
    ].join("");
  };

  const buildFutureTrack = (row) => {
    const cards = [createCard(null, "spacer")];
    row.races.slice(0, 6).forEach((race, index) => cards.push(createCard(race, index === 0 ? "current" : "upcoming")));
    return cards.join("");
  };

  const renderRow = (row) => {
    let cards = buildTodayTrack(row);
    let mode = "today";
    if (row.state === "past") {
      cards = buildPastTrack(row);
      mode = "past";
    } else if (row.state === "future") {
      cards = buildFutureTrack(row);
      mode = "future";
    }

    return `
      <article class="venue-row" data-mode="${mode}">
        <div class="venue-card sport-${row.sport}">
          <div class="venue-name">${row.venue}</div>
          <span class="venue-sport-icon ${row.sport}" aria-hidden="true"></span>
        </div>
        <div class="venue-track-shell">
          <div class="venue-track" data-mode="${mode}" data-focus-race="${row.focusRace}">
            ${cards}
          </div>
        </div>
      </article>`;
  };

  const alignTrack = (track) => {
    if (!track) return;
    const mode = track.dataset.mode || "today";
    if (mode === "past") {
      track.scrollLeft = 0;
      return;
    }
    const focusCard = track.querySelector(".race-card.current");
    if (!focusCard) {
      track.scrollLeft = 0;
      return;
    }
    const styles = getComputedStyle(document.documentElement);
    const slotWidth = parseFloat(styles.getPropertyValue("--race-card-w")) || focusCard.offsetWidth || 116;
    const slotGap = parseFloat(styles.getPropertyValue("--track-gap")) || 14;
    const trackPad = parseFloat(styles.getPropertyValue("--track-pad-x")) || 10;
    const target = focusCard.offsetLeft - trackPad - (FOCUS_SLOT_INDEX * (slotWidth + slotGap));
    track.scrollLeft = Math.max(0, target);
  };

  const render = () => {
    const board = document.getElementById("todayBoard");
    const dateTitle = document.getElementById("dateTitle");
    const todayBtn = document.getElementById("todayBtn");
    const isCurrentDay = dateKey(selectedDate) === dateKey(todayBase);

    dateTitle.textContent = formatDateTitle(selectedDate);
    todayBtn.classList.toggle("is-current", isCurrentDay);
    todayBtn.disabled = isCurrentDay;

    const rows = buildRowsForDate(selectedDate);
    board.innerHTML = rows.map(renderRow).join("");

    board.querySelectorAll(".race-card[href='#']").forEach((card) => {
      card.addEventListener("click", (event) => {
        event.preventDefault();
        SHOW_PREPARING_TOAST();
      });
    });

    requestAnimationFrame(() => {
      board.querySelectorAll(".venue-track").forEach(alignTrack);
    });
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
    window.addEventListener("resize", () => {
      document.querySelectorAll(".venue-track").forEach(alignTrack);
    });
  });
})();
