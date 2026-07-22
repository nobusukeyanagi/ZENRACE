(() => {
  "use strict";

  const SUPPORTED_DATE = "2026-02-23";
  const groupKey = (sport, venue) => `${sport}:${venue}`;
  const SESSION_ICON = {
    morning: "../schedule/icons/morning.png",
    night: "../schedule/icons/night.png",
    midnight: "../schedule/icons/midnight.png",
  };
  const FEATURED = new Set([groupKey("keirin", "熊本") + ":12R"]);

  const board = document.getElementById("resultsBoard");
  if (!board) return;

  const buildRaceMap = (dateKey) => {
    const source = window.ZENRACE_RACE_DAYS?.[dateKey];
    if (!source) return null;
    const races = source.races.filter((race) => race.sport === "keirin");
    const venueOrder = source.venueOrder.filter((entry) => entry.sport === "keirin");
    const grades = new Map((source.venueGrades || []).filter((entry) => entry.sport === "keirin").map((entry) => [groupKey(entry.sport, entry.venue), entry]));
    const days = new Map(Object.entries(source.venueDays || {}));
    const sessions = new Map(Object.entries(source.venueSessions || {}));
    const girls = new Set(source.girlsVenues || []);
    const byVenue = new Map();
    races.forEach((race) => {
      const key = groupKey(race.sport, race.venue);
      if (!byVenue.has(key)) byVenue.set(key, []);
      byVenue.get(key).push(race);
    });
    return { venueOrder, byVenue, grades, days, sessions, girls };
  };

  const hashSeed = (text) => [...text].reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);

  const buildResult = (venue, raceLabel) => {
    const raceNo = Number(String(raceLabel).replace(/\D/g, "")) || 1;
    const seed = hashSeed(`${venue}-${raceLabel}`);
    const picks = [];
    let cursor = (seed % 9) + 1;
    while (picks.length < 3) {
      if (!picks.includes(cursor)) picks.push(cursor);
      cursor = ((cursor + raceNo + 1) % 9) + 1;
    }
    const payout = 1200 + (seed % 7800) * 10;
    const popularity = (seed % 18) + 1;
    return {
      first: String(picks[0]),
      second: String(picks[1]),
      third: String(picks[2]),
      payout: `${payout.toLocaleString("ja-JP")}円`,
      popularity: `${popularity}人気`,
    };
  };

  const renderVenueMeta = (entry, meta) => {
    const key = groupKey(entry.sport, entry.venue);
    const grade = meta.grades.get(key);
    const session = meta.sessions.get(key);
    const girls = meta.girls.has(key);
    const day = meta.days.get(key) || "";
    const gradeHtml = grade ? `<span class="venue-grade-icon ${grade.accent ? "accent" : "muted"}">${grade.label}</span>` : "";
    const sessionHtml = session ? `<img class="venue-status-icon" src="${SESSION_ICON[session]}" alt="" aria-hidden="true">` : "";
    const girlsHtml = girls ? `<img class="venue-status-icon girls" src="../schedule/icons/girls.png" alt="" aria-hidden="true">` : "";
    const dayHtml = day ? `<span class="venue-day-label">${day}</span>` : "";
    return `
      <div class="venue-card sport-${entry.sport}">
        <div class="venue-title-line">
          <div class="venue-name">${entry.venue}</div>
          <span class="venue-sport-icon ${entry.sport}" aria-hidden="true"></span>
        </div>
        <div class="venue-meta-row">${gradeHtml}${sessionHtml}${girlsHtml}${dayHtml}</div>
      </div>`;
  };

  const renderVenueTable = (entry, races) => {
    const rows = races.map((race) => {
      const result = buildResult(entry.venue, race.race);
      const featured = FEATURED.has(groupKey(entry.sport, entry.venue) + `:${race.race}`) ? " featured" : "";
      return `<tr class="${featured}">
        <td class="race-col">${race.race}</td>
        <td class="finish-cell win">${result.first}</td>
        <td class="finish-cell">${result.second}</td>
        <td class="finish-cell">${result.third}</td>
        <td class="payout-cell">${result.payout}</td>
        <td class="pop-cell">${result.popularity}</td>
      </tr>`;
    }).join("");
    return `
      <div class="result-table-wrap">
        <table class="result-table" aria-label="${entry.venue} 結果一覧">
          <colgroup>
            <col class="r-col"><col class="finish-col"><col class="finish-col"><col class="finish-col"><col class="payout-col"><col class="pop-col">
          </colgroup>
          <thead>
            <tr>
              <th>R</th>
              <th>1着</th>
              <th>2着</th>
              <th>3着</th>
              <th>三連単</th>
              <th>人気</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  };

  const renderUnsupported = (dateKey) => {
    board.innerHTML = `<section class="results-placeholder"><h2>結果早見</h2><p>${dateKey.replace(/-/g, "/")} は準備中です。<br>ひとまず 2/23 の競輪のみ掲載しています。</p></section>`;
  };

  const render = (dateKey) => {
    board.innerHTML = "";
    if (dateKey !== SUPPORTED_DATE) {
      renderUnsupported(dateKey);
      return;
    }
    const meta = buildRaceMap(dateKey);
    if (!meta) {
      renderUnsupported(dateKey);
      return;
    }
    const html = meta.venueOrder.map((entry) => {
      const key = groupKey(entry.sport, entry.venue);
      const races = meta.byVenue.get(key) || [];
      return `<article class="results-group">${renderVenueMeta(entry, meta)}${renderVenueTable(entry, races)}</article>`;
    }).join("");
    board.innerHTML = html;
  };

  window.addEventListener("zenrace-date-refresh", (event) => {
    render(event.detail?.date || SUPPORTED_DATE);
  });

  document.addEventListener("DOMContentLoaded", () => {
    const selected = document.querySelector("[data-zenrace-date-selector]")?.dataset.selectedDate || SUPPORTED_DATE;
    render(selected);
  });
})();
