(() => {
  "use strict";

  const STATUS_ICON = {
    morning: "../schedule/icons/morning.png",
    night: "../schedule/icons/night.png",
    midnight: "../schedule/icons/midnight.png",
  };

  const MONTHLY_DATA = {
    "2026-07": [
      {
        date: "2026-07-01",
        venues: [
          { sport: "keirin", venue: "函館", grade: "FⅡ", session: "midnight", day: "初日" },
          { sport: "keirin", venue: "大宮", grade: "FⅠ", day: "初日" },
          { sport: "keirin", venue: "松戸", grade: "FⅡ", session: "midnight", day: "初日" },
          { sport: "keirin", venue: "平塚", grade: "FⅠ", session: "night", girls: true, day: "2日目" },
          { sport: "keirin", venue: "豊橋", grade: "FⅡ", session: "morning", day: "2日目" },
          { sport: "keirin", venue: "松阪", grade: "FⅡ", session: "midnight", day: "初日" },
          { sport: "keirin", venue: "奈良", grade: "FⅡ", session: "morning", girls: true, day: "初日" },

          { sport: "auto", venue: "川口", grade: "普通", session: "night", day: "最終日" },
          { sport: "auto", venue: "飯塚", grade: "普通", day: "最終日" },

          { sport: "boat", venue: "戸田", grade: "一般", day: "最終日" },
          { sport: "boat", venue: "多摩川", grade: "一般", day: "4日目" },
          { sport: "boat", venue: "浜名湖", grade: "一般", day: "2日目" },
          { sport: "boat", venue: "蒲郡", grade: "一般", session: "night", day: "初日" },
          { sport: "boat", venue: "常滑", grade: "一般", day: "3日目" },
          { sport: "boat", venue: "三国", grade: "一般", session: "morning", day: "最終日" },
          { sport: "boat", venue: "びわこ", grade: "一般", day: "3日目" },
          { sport: "boat", venue: "児島", grade: "G2", accent: true, day: "2日目" },
          { sport: "boat", venue: "宮島", grade: "一般", day: "最終日" },
          { sport: "boat", venue: "下関", grade: "一般", session: "night", day: "2日目" },
          { sport: "boat", venue: "若松", grade: "一般", session: "midnight", day: "4日目" },
          { sport: "boat", venue: "福岡", grade: "一般", day: "初日" },
          { sport: "boat", venue: "唐津", grade: "一般", session: "morning", day: "2日目" },
          { sport: "boat", venue: "大村", grade: "一般", session: "night", day: "6日目" },

          { sport: "nar", venue: "門別", session: "night", day: "5日目" },
          { sport: "nar", venue: "大井", grade: "JpnⅠ", accent: true, session: "night", day: "3日目" },
          { sport: "nar", venue: "名古屋", day: "2日目" },
          { sport: "nar", venue: "園田", day: "4日目" },
        ],
      },
    ],
  };

  const WEEKDAY = ["日", "月", "火", "水", "木", "金", "土"];
  const schedule = document.getElementById("monthlySchedule");
  if (!schedule) return;

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[char]);

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
    const day = item.day ? `<span class="day-label">${escapeHtml(item.day)}</span>` : "";
    const aria = [item.venue, item.grade, item.session, item.girls ? "ガールズ" : "", item.day].filter(Boolean).join(" ");

    return `<button type="button" class="venue-button sport-${escapeHtml(item.sport)}" aria-label="${escapeHtml(aria)}">
      <span class="venue-main-line">
        <span class="venue-name">${escapeHtml(item.venue)}</span>
        <span class="sport-icon ${escapeHtml(item.sport)}" aria-hidden="true"></span>
      </span>
      <span class="venue-meta-line">${grade}${session}${girls}${day}</span>
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
    return `<article class="day-card">
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
