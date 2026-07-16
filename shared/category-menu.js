(() => {
  "use strict";

  if (customElements.get("zenrace-category-menu")) return;

  const scriptUrl = document.currentScript?.src || window.location.href;
  const appRoot = new URL("../", scriptUrl);
  const MENUS = {
    home: [
      { id: "home", label: "トップ", path: "" },
      { id: "settings", label: "設定", path: "settings/" },
      { id: "guide", label: "ガイド", path: "guide/" },
      { id: "about", label: "ABOUT", path: "about/" },
    ],
    schedule: [
      { id: "today", label: "本日の開催", path: "schedule/" },
      { id: "timetable", label: "時刻表", path: "timetable/" },
      { id: "monthly", label: "月別日程", path: "monthly/" },
      { id: "grade", label: "グレード", path: "gradedraces/" },
    ],
    vote: [
      { id: "racecard", label: "出走表", path: "vote/" },
      { id: "odds", label: "オッズ", path: "vote/odds/" },
      { id: "bet", label: "投票", path: "vote/bet/" },
      { id: "inquiry", label: "照会", path: "vote/introduction/" },
      { id: "results", label: "結果", path: "vote/results/" },
    ],
    mypage: [
      { id: "profile", label: "プロフィール", path: "mypage/" },
      { id: "stats", label: "投票成績", path: "mypage/stats/" },
      { id: "diary", label: "ダイアリー", path: "mypage/diary/" },
      { id: "blog", label: "ブログ", path: "mypage/blog/" },
    ],
  };

  class ZenraceCategoryMenu extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const category = this.getAttribute("category") || "home";
      const items = MENUS[category] || MENUS.home;
      const active = this.getAttribute("active") || items[0].id;
      const shadow = this.attachShadow({ mode: "open" });
      const links = items.map((item) => {
        const selected = item.id === active;
        return `<a href="${new URL(item.path, appRoot).href}" class="${selected ? "active" : ""}" ${selected ? 'aria-current="page"' : ""}>${item.label}</a>`;
      }).join("");

      shadow.innerHTML = `
        <style>
          *{box-sizing:border-box}
          :host{display:block;width:100%;height:100%;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Yu Gothic UI","Hiragino Kaku Gothic ProN",Meiryo,sans-serif;-webkit-text-size-adjust:100%;text-size-adjust:100%}
          nav{width:min(100%,760px);height:100%;margin:0 auto;display:grid;grid-template-columns:repeat(${items.length},minmax(0,1fr));align-items:stretch;padding:0 5px}
          a{position:relative;min-width:0;display:flex;align-items:center;justify-content:center;padding:0 5px;color:#e8ebef;text-decoration:none;font-size:13px;font-weight:800;line-height:1;letter-spacing:.015em;white-space:nowrap;-webkit-tap-highlight-color:transparent;text-shadow:0 1px 6px rgba(0,0,0,.55)}
          a::after{content:"";position:absolute;right:26%;bottom:5px;left:26%;height:2px;border-radius:99px;background:linear-gradient(90deg,transparent,#f0cc70,transparent);box-shadow:0 0 9px rgba(240,204,112,.55);opacity:0;transform:scaleX(.45);transition:opacity .18s ease,transform .18s ease}
          a.active{color:#f0cc70}
          a.active::after{opacity:1;transform:scaleX(1)}
          @media(hover:hover){a:hover{color:#fff4c9}}
          @media(max-width:430px){a{font-size:12px;padding-inline:2px}nav{padding-inline:2px}}
          @media(max-width:350px){a{font-size:10.5px;letter-spacing:-.02em}}
        </style>
        <nav aria-label="ページ選択メニュー">${links}</nav>`;

      const nav = shadow.querySelector("nav");
      const stop = (event) => event.preventDefault();
      for (const type of ["gesturestart", "gesturechange", "gestureend"]) {
        nav.addEventListener(type, stop, { passive: false });
      }
      nav.addEventListener("touchmove", (event) => {
        if (event.touches.length > 1) event.preventDefault();
      }, { passive: false });
    }
  }

  customElements.define("zenrace-category-menu", ZenraceCategoryMenu);
})();
