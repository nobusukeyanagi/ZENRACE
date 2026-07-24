(() => {
  "use strict";

  const init = () => {
    document.querySelectorAll(".table-scroll").forEach((scroller) => {
      const pageShell = scroller.closest(".zenrace-content-shell");
      const keepPageShellAtLeft = () => {
        if (pageShell && pageShell.scrollLeft !== 0) pageShell.scrollLeft = 0;
      };
      if (pageShell) {
        pageShell.scrollLeft = 0;
        pageShell.addEventListener("scroll", keepPageShellAtLeft, { passive: true });
      }

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
        scroller.classList.toggle('rider-name-hidden', scroller.scrollLeft > 0);
      };

      const queueRiderNameState = () => {
        keepPageShellAtLeft();
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
