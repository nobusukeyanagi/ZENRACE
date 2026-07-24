(() => {
  "use strict";

  const BASE_DATE = "2026-02-23";
  const TARGET_HOUR = 16;
  const board = document.getElementById("timetableBoard");
  const toolbar = document.querySelector("[data-zenrace-date-selector]");
  const shell = document.querySelector(".zenrace-content-shell");
  const baseRaces = Array.isArray(window.ZENRACE_RACES) ? window.ZENRACE_RACES : [];
  const raceDays = window.ZENRACE_RACE_DAYS && typeof window.ZENRACE_RACE_DAYS === "object"
    ? window.ZENRACE_RACE_DAYS
    : {};
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
  const getRacesForDate = (date) => {
    if (date === BASE_DATE) return baseRaces;
    return Array.isArray(raceDays[date]?.races) ? raceDays[date].races : [];
  };
  const isFeaturedRace = (date, race) => FEATURED_RACES.has(
    featuredRaceKey(date, race.sport, race.venue, race.race),
  );

  const timeParts = (value) => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || ""));
    if (!match) return null;
    return { hour: Number(match[1]), minute: Number(match[2]) };
  };

  const SPORT_ORDER = Object.freeze({ keirin: 0, auto: 1, boat: 2, nar: 3, jra: 4 });
  const sportOrder = (sport) => SPORT_ORDER[sport] ?? 99;
  const raceMinutes = (race) => {
    const parts = timeParts(race.time);
    return parts ? (parts.hour * 60) + parts.minute : Number.POSITIVE_INFINITY;
  };

  const showPreparingToast = () => {
    let toast = document.querySelector(".timetable-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "timetable-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.append(toast);
    }
    toast.textContent = "遷移先ページは準備中です";
    toast.classList.add("is-visible");
    window.clearTimeout(Number(toast.dataset.timer || 0));
    toast.dataset.timer = String(window.setTimeout(() => toast.classList.remove("is-visible"), 1800));
  };

  const raceCard = (date, race) => {
    const parts = timeParts(race.time);
    const minute = String(parts?.minute ?? "").padStart(2, "0");
    const featured = isFeaturedRace(date, race);
    const label = `${race.venue} ${race.race} ${race.time}${featured ? " 注目レース" : ""}`;
    return `
      <a class="timetable-race sport-${race.sport}${featured ? " featured-race" : ""}" href="#" aria-label="${label}">
        <span class="race-minute">${minute}</span>
        <span class="race-sport-line" aria-hidden="true"></span>
        <span class="race-detail"><span class="race-venue">${race.venue}</span><span class="race-no">${race.race}</span></span>
      </a>`;
  };

  const buildHourGroups = (date, races) => {
    const validRaces = races
      .map((race, sourceIndex) => ({ race, sourceIndex }))
      .filter(({ race }) => timeParts(race.time))
      .sort((a, b) =>
        (raceMinutes(a.race) - raceMinutes(b.race))
        || (sportOrder(a.race.sport) - sportOrder(b.race.sport))
        || (a.sourceIndex - b.sourceIndex))
      .map(({ race }) => race);
    const grouped = new Map();

    validRaces.forEach((race) => {
      const { hour } = timeParts(race.time);
      if (!grouped.has(hour)) grouped.set(hour, []);
      grouped.get(hour).push(race);
    });

    const hourMarkup = [...grouped.entries()]
      .sort(([a], [b]) => a - b)
      .map(([hour, hourRaces]) => `
        <section class="hour-group${date === BASE_DATE && hour === TARGET_HOUR ? " current-hour" : ""}${hourRaces.length <= 4 ? " single-row" : ""}" data-hour="${hour}" aria-label="${hour}時台">
          <div class="hour-label">${hour}</div>
          <div class="hour-races">${hourRaces.map((race) => raceCard(date, race)).join("")}</div>
        </section>`)
      .join("");

    return hourMarkup;
  };

  const scrollToCurrentHour = () => {
    const target = board?.querySelector(`[data-hour="${TARGET_HOUR}"]`);
    if (!shell || !target) return;
    const shellRect = shell.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const top = shell.scrollTop + targetRect.top - shellRect.top - 5;
    shell.scrollTo({ top: Math.max(0, top), behavior: "auto" });
  };

  const bindCards = () => {
    board?.querySelectorAll(".timetable-race").forEach((card) => {
      card.addEventListener("click", (event) => {
        event.preventDefault();
        showPreparingToast();
      });
    });
  };

  const render = (date, resetPosition = true) => {
    if (!board) return;
    const races = getRacesForDate(date);
    if (!races.length) {
      const [, month, day] = date.split("-").map(Number);
      board.innerHTML = `
        <section class="timetable-empty">
          <strong>${month}月${day}日の時刻表</strong>
          <span>作成中</span>
        </section>`;
      if (shell) shell.scrollTop = 0;
      return;
    }

    board.innerHTML = buildHourGroups(date, races);
    bindCards();
    if (!resetPosition) return;
    requestAnimationFrame(() => requestAnimationFrame(scrollToCurrentHour));
    window.setTimeout(scrollToCurrentHour, 80);
    window.setTimeout(scrollToCurrentHour, 180);
  };

  document.addEventListener("DOMContentLoaded", () => {
    const selectedDate = toolbar?.dataset.selectedDate || BASE_DATE;
    render(selectedDate, true);

    window.addEventListener("zenrace-date-refresh", (event) => {
      const date = event.detail?.date || toolbar?.dataset.selectedDate || BASE_DATE;
      render(date, true);
    });

    window.addEventListener("resize", () => {
      const date = toolbar?.dataset.selectedDate || BASE_DATE;
      if (getRacesForDate(date).length) window.setTimeout(scrollToCurrentHour, 60);
    }, { passive: true });
  });
})();
