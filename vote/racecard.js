(() => {
  "use strict";

  const RANK_COLORS = {
    1: "#fff0b8",
    2: "#e4f5b4",
    3: "#cfeeff",
  };

  const RANK_CLASSES = ["rank-highlight", "rank-first", "rank-second", "rank-third"];

  const parseNumber = (text) => {
    const match = String(text || "").replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : Number.NaN;
  };

  const clearRankStyle = (element) => {
    if (!element) return;
    element.classList.remove(...RANK_CLASSES);
    delete element.dataset.rank;
    delete element.dataset.rankColor;

    [element, ...element.children].forEach((node) => {
      [
        "display",
        "width",
        "min-width",
        "background",
        "background-color",
        "background-image",
        "border-radius",
        "box-shadow",
      ].forEach((property) => node.style.removeProperty(property));
    });
  };

  const applyRankStyle = (element, rank) => {
    const color = RANK_COLORS[rank];
    if (!element || !color) return;

    const rankClass = rank === 1 ? "rank-first" : rank === 2 ? "rank-second" : "rank-third";
    element.classList.add("rank-highlight", rankClass);
    element.dataset.rank = String(rank);
    element.dataset.rankColor = color;

    const gridLine = element.classList.contains("stat-line") || element.classList.contains("good-ten-line");
    element.style.setProperty("display", gridLine ? "grid" : "block", "important");
    element.style.setProperty("width", "100%", "important");
    element.style.setProperty("background-color", color, "important");
    element.style.setProperty("background-image", `linear-gradient(${color}, ${color})`, "important");
    element.style.setProperty("border-radius", "0", "important");
    element.style.setProperty("box-shadow", "none", "important");

    [...element.children].forEach((child) => {
      child.style.setProperty("background-color", color, "important");
    });
  };

  const applyDenseRanks = (entries, { higherIsBetter = false } = {}) => {
    const validEntries = entries.filter(({ element, value }) => element && Number.isFinite(value));
    validEntries.forEach(({ element }) => clearRankStyle(element));

    const distinctValues = [...new Set(validEntries.map(({ value }) => value))]
      .sort((a, b) => (higherIsBetter ? b - a : a - b))
      .slice(0, 3);
    const rankByValue = new Map(distinctValues.map((value, index) => [value, index + 1]));

    validEntries.forEach(({ element, value }) => {
      const rank = rankByValue.get(value);
      if (rank) applyRankStyle(element, rank);
    });
  };

  const directChildren = (element, selector = "span") =>
    [...(element?.children || [])].filter((child) => child.matches(selector));

  const applyAllRaceRanks = () => {
    const rows = [...document.querySelectorAll(".race-table tbody tr")];
    if (!rows.length) return;

    const cells = rows.map((row) => [...row.children].filter((child) => child.matches("td")));

    // ST: smaller is better.
    applyDenseRanks(cells.map((tds) => {
      const element = directChildren(tds[2])[1];
      return { element, value: parseNumber(element?.textContent) };
    }));

    // Trial time: smaller is better.
    applyDenseRanks(cells.map((tds) => {
      const element = directChildren(tds[3])[0];
      return { element, value: parseNumber(element?.textContent) };
    }));

    // Good-track last-10 average and best times: smaller is better, ranked separately.
    [0, 1].forEach((lineIndex) => {
      applyDenseRanks(cells.map((tds) => {
        const element = tds[4]?.querySelectorAll(".good-ten-line")[lineIndex];
        const valueElement = element?.querySelector(".good-ten-value");
        return { element, value: parseNumber(valueElement?.textContent) };
      }));
    });

    // Win, exacta-place and trifecta-place rates: good/wet ranked separately; larger is better.
    [6, 7, 8].forEach((cellIndex) => {
      [0, 1].forEach((lineIndex) => {
        applyDenseRanks(cells.map((tds) => {
          const element = tds[cellIndex]?.querySelectorAll(".stat-line")[lineIndex];
          const valueElement = element?.querySelector(".surface-value");
          return { element, value: parseNumber(valueElement?.textContent) };
        }), { higherIsBetter: true });
      });
    });
  };

  const init = () => {
    applyAllRaceRanks();

    document.querySelectorAll(".table-scroll").forEach((scroller) => {
      let startX = 0;
      let startY = 0;
      let direction = "";
      let riderStateFrame = 0;

      const rows = [...scroller.querySelectorAll("tbody tr")];
      rows.forEach((row) => {
        const carCell = row.querySelector("td.car-number");
        const riderCell = row.querySelector("td.rider-name");
        if (!carCell || !riderCell) return;
        const nameSource = riderCell.querySelector(".rider-name-main")?.textContent || riderCell.textContent || "";
        const shortName = String(nameSource).replace(/[\s　]+/g, "").slice(0, 3);
        carCell.dataset.riderShort = shortName;
        if (!carCell.querySelector(".car-number-value")) {
          const value = document.createElement("span");
          value.className = "car-number-value";
          value.textContent = String(carCell.textContent || "").trim();
          carCell.replaceChildren(value);
        }
      });

      const updateRiderNameState = () => {
        riderStateFrame = 0;
        scroller.classList.toggle("rider-name-hidden", scroller.scrollLeft > 0);
      };

      const queueRiderNameState = () => {
        if (riderStateFrame) return;
        riderStateFrame = window.requestAnimationFrame(updateRiderNameState);
      };

      const maxScrollLeft = () => Math.max(0, scroller.scrollWidth - scroller.clientWidth);

      scroller.addEventListener("scroll", queueRiderNameState, { passive: true });
      window.addEventListener("resize", queueRiderNameState, { passive: true });
      queueRiderNameState();

      scroller.addEventListener("touchstart", (event) => {
        if (event.touches.length !== 1) return;
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        direction = "";
        const max = maxScrollLeft();
        if (scroller.scrollLeft < 0) scroller.scrollLeft = 0;
        if (scroller.scrollLeft > max) scroller.scrollLeft = max;
      }, { passive: true });

      scroller.addEventListener("touchmove", (event) => {
        if (event.touches.length !== 1) return;
        const dx = event.touches[0].clientX - startX;
        const dy = event.touches[0].clientY - startY;

        if (!direction && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
          direction = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
        }
        if (direction !== "x") return;

        const max = maxScrollLeft();
        const atStart = scroller.scrollLeft <= 0;
        const atEnd = scroller.scrollLeft >= max - 1;

        if ((atStart && dx > 0) || (atEnd && dx < 0)) {
          event.preventDefault();
          scroller.scrollLeft = atStart ? 0 : max;
        }
      }, { passive: false });

      scroller.addEventListener("touchend", () => {
        const max = maxScrollLeft();
        scroller.scrollLeft = Math.min(max, Math.max(0, scroller.scrollLeft));
        direction = "";
        queueRiderNameState();
      }, { passive: true });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
