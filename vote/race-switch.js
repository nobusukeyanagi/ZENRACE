(() => {
  "use strict";
  const RACES = [{"venue":"松戸","race":"1R","time":"8:47","sport":"keirin"},{"venue":"松戸","race":"2R","time":"9:07","sport":"keirin"},{"venue":"松戸","race":"3R","time":"9:28","sport":"keirin"},{"venue":"松戸","race":"4R","time":"9:49","sport":"keirin"},{"venue":"松戸","race":"5R","time":"10:10","sport":"keirin"},{"venue":"松戸","race":"6R","time":"10:31","sport":"keirin"},{"venue":"浜松","race":"1R","time":"10:35","sport":"auto"},{"venue":"松戸","race":"7R","time":"10:52","sport":"keirin"},{"venue":"高知","race":"1R","time":"10:52","sport":"keirin"},{"venue":"防府","race":"1R","time":"10:57","sport":"keirin"},{"venue":"浜松","race":"2R","time":"11:01","sport":"auto"},{"venue":"高知","race":"2R","time":"11:07","sport":"keirin"},{"venue":"防府","race":"2R","time":"11:20","sport":"keirin"},{"venue":"浜松","race":"3R","time":"11:27","sport":"auto"},{"venue":"高知","race":"3R","time":"11:32","sport":"keirin"},{"venue":"防府","race":"3R","time":"11:44","sport":"keirin"},{"venue":"浜松","race":"4R","time":"11:53","sport":"auto"},{"venue":"高知","race":"4R","time":"12:02","sport":"keirin"},{"venue":"防府","race":"4R","time":"12:09","sport":"keirin"},{"venue":"浜松","race":"5R","time":"12:21","sport":"auto"},{"venue":"高知","race":"5R","time":"12:32","sport":"keirin"},{"venue":"防府","race":"5R","time":"12:39","sport":"keirin"},{"venue":"浜松","race":"6R","time":"12:52","sport":"auto"},{"venue":"高知","race":"6R","time":"13:02","sport":"keirin"},{"venue":"防府","race":"6R","time":"13:09","sport":"keirin"},{"venue":"浜松","race":"7R","time":"13:23","sport":"auto"},{"venue":"高知","race":"7R","time":"13:32","sport":"keirin"},{"venue":"防府","race":"7R","time":"13:39","sport":"keirin"},{"venue":"浜松","race":"8R","time":"13:55","sport":"auto"},{"venue":"高知","race":"8R","time":"14:02","sport":"keirin"},{"venue":"防府","race":"8R","time":"14:07","sport":"keirin"},{"venue":"防府","race":"9R","time":"14:30","sport":"keirin"},{"venue":"浜松","race":"9R","time":"14:31","sport":"auto"},{"venue":"高知","race":"9R","time":"14:37","sport":"keirin"},{"venue":"防府","race":"10R","time":"14:57","sport":"keirin"},{"venue":"浜松","race":"10R","time":"15:09","sport":"auto"},{"venue":"高知","race":"10R","time":"15:12","sport":"keirin"},{"venue":"防府","race":"11R","time":"15:32","sport":"keirin"},{"venue":"豊橋","race":"1R","time":"15:39","sport":"keirin"},{"venue":"高知","race":"11R","time":"15:47","sport":"keirin"},{"venue":"浜松","race":"11R","time":"15:49","sport":"auto"},{"venue":"高知","race":"1R","time":"15:54","sport":"keirin"},{"venue":"防府","race":"12R","time":"16:07","sport":"keirin"},{"venue":"豊橋","race":"2R","time":"16:13","sport":"keirin"},{"venue":"高知","race":"2R","time":"16:19","sport":"keirin"},{"venue":"高知","race":"12R","time":"16:27","sport":"keirin"},{"venue":"豊橋","race":"3R","time":"16:39","sport":"keirin"},{"venue":"浜松","race":"12R","time":"16:45","sport":"auto"},{"venue":"高知","race":"3R","time":"16:51","sport":"keirin"},{"venue":"豊橋","race":"4R","time":"17:03","sport":"keirin"},{"venue":"高知","race":"4R","time":"17:15","sport":"keirin"},{"venue":"豊橋","race":"5R","time":"17:27","sport":"keirin"},{"venue":"高知","race":"5R","time":"17:39","sport":"keirin"},{"venue":"豊橋","race":"6R","time":"17:51","sport":"keirin"},{"venue":"高知","race":"6R","time":"18:03","sport":"keirin"},{"venue":"豊橋","race":"7R","time":"18:15","sport":"keirin"},{"venue":"高知","race":"7R","time":"18:27","sport":"keirin"},{"venue":"豊橋","race":"8R","time":"18:40","sport":"keirin"},{"venue":"高知","race":"8R","time":"18:53","sport":"keirin"},{"venue":"豊橋","race":"9R","time":"19:06","sport":"keirin"},{"venue":"高知","race":"9R","time":"19:19","sport":"keirin"},{"venue":"豊橋","race":"10R","time":"19:32","sport":"keirin"},{"venue":"高知","race":"10R","time":"19:45","sport":"keirin"},{"venue":"豊橋","race":"11R","time":"19:59","sport":"keirin"},{"venue":"高知","race":"11R","time":"20:13","sport":"keirin"},{"venue":"飯塚","race":"1R","time":"20:17","sport":"auto"},{"venue":"豊橋","race":"12R","time":"20:27","sport":"keirin"},{"venue":"玉野","race":"1R","time":"20:38","sport":"keirin"},{"venue":"飯塚","race":"2R","time":"20:45","sport":"auto"},{"venue":"京王閣","race":"1R","time":"20:46","sport":"keirin"},{"venue":"平塚","race":"1R","time":"20:54","sport":"keirin"},{"venue":"玉野","race":"2R","time":"21:02","sport":"keirin"},{"venue":"京王閣","race":"2R","time":"21:10","sport":"keirin"},{"venue":"飯塚","race":"3R","time":"21:13","sport":"auto"},{"venue":"平塚","race":"2R","time":"21:18","sport":"keirin"},{"venue":"玉野","race":"3R","time":"21:26","sport":"keirin"},{"venue":"京王閣","race":"3R","time":"21:34","sport":"keirin"},{"venue":"飯塚","race":"4R","time":"21:42","sport":"auto"},{"venue":"平塚","race":"3R","time":"21:42","sport":"keirin"},{"venue":"玉野","race":"4R","time":"21:50","sport":"keirin"},{"venue":"京王閣","race":"4R","time":"21:58","sport":"keirin"},{"venue":"平塚","race":"4R","time":"22:06","sport":"keirin"},{"venue":"飯塚","race":"5R","time":"22:12","sport":"auto"},{"venue":"玉野","race":"5R","time":"22:15","sport":"keirin"},{"venue":"京王閣","race":"5R","time":"22:24","sport":"keirin"},{"venue":"平塚","race":"5R","time":"22:33","sport":"keirin"},{"venue":"飯塚","race":"6R","time":"22:42","sport":"auto"},{"venue":"玉野","race":"6R","time":"22:42","sport":"keirin"},{"venue":"京王閣","race":"6R","time":"22:51","sport":"keirin"},{"venue":"平塚","race":"6R","time":"23:00","sport":"keirin"},{"venue":"玉野","race":"7R","time":"23:09","sport":"keirin"},{"venue":"飯塚","race":"7R","time":"23:12","sport":"auto"},{"venue":"京王閣","race":"7R","time":"23:18","sport":"keirin"},{"venue":"平塚","race":"7R","time":"23:27","sport":"keirin"},{"venue":"飯塚","race":"8R","time":"23:44","sport":"auto"}];
  const DEFAULT_ACTIVE = "浜松-12R-16:45";
  const keyOf = (race) => `${race.venue}-${race.race}-${race.time}`;
  const showPreparingToast = () => {
    let toast = document.querySelector(".race-switch-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "race-switch-toast";
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

  class ZenraceRaceSwitch extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready === "true") return;
      this.dataset.ready = "true";
      const activeKey = this.getAttribute("active-key") || DEFAULT_ACTIVE;
      const tabs = RACES.map((race) => {
        const key = keyOf(race);
        const active = key === activeKey;
        return `<a class="race-tab sport-${race.sport}${active ? " active" : ""}" href="#" data-race-key="${key}" data-race-time="${race.time}"${active ? ' aria-current="true"' : ""}><strong><span class="race-tab-name">${race.venue}</span><span class="race-tab-icon ${race.sport}" aria-hidden="true"></span></strong><span>${race.race} ${race.time}</span></a>`;
      }).join("");
      this.innerHTML = `<section class="race-switch-wrap" aria-label="レース切り替え"><div class="race-switch">${tabs}</div></section>`;

      const track = this.querySelector(".race-switch");
      const active = this.querySelector(".race-tab.active");
      const alignActive = () => {
        if (!track || !active) return;
        const leftPadding = Number.parseFloat(getComputedStyle(track).paddingLeft) || 0;
        const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
        const target = Math.min(maxScroll, Math.max(0, active.offsetLeft - leftPadding));
        track.scrollLeft = target;
      };

      this.querySelectorAll(".race-tab").forEach((tab) => {
        tab.addEventListener("click", (event) => {
          event.preventDefault();
          showPreparingToast();
        });
      });

      requestAnimationFrame(() => requestAnimationFrame(alignActive));
      setTimeout(alignActive, 120);
      window.addEventListener("pageshow", alignActive);
      if ("ResizeObserver" in window) new ResizeObserver(alignActive).observe(track);
    }
  }

  if (!customElements.get("zenrace-race-switch")) {
    customElements.define("zenrace-race-switch", ZenraceRaceSwitch);
  }
})();
