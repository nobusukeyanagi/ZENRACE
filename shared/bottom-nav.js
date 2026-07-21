(() => {
  "use strict";

  if (customElements.get("zenrace-bottom-nav")) return;

  const scriptUrl = document.currentScript?.src || window.location.href;
  const appRoot = new URL("../", scriptUrl);

  const ROUTES = [
    {
      id: "home",
      label: "ホーム",
      path: "",
      icon: `
        <svg viewBox="0 0 96 96" aria-hidden="true">
          <path d="M10 47.5L48 14l38 33.5" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20 45v36h20V58h16v23h20V45L48 20 20 45z" fill="currentColor"/>
        </svg>`,
    },
    {
      id: "schedule",
      label: "スケジュール",
      path: "schedule/",
      icon: `
        <svg viewBox="0 0 96 96" aria-hidden="true">
          <rect x="15" y="17" width="66" height="64" rx="8" fill="none" stroke="currentColor" stroke-width="8"/>
          <path d="M15 33h66" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
          <path d="M31 12v16M65 12v16" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
          <rect x="28" y="44" width="10" height="10" rx="2" fill="currentColor"/>
          <rect x="43" y="44" width="10" height="10" rx="2" fill="currentColor"/>
          <rect x="58" y="44" width="10" height="10" rx="2" fill="currentColor"/>
          <rect x="28" y="59" width="10" height="10" rx="2" fill="currentColor"/>
          <rect x="43" y="59" width="10" height="10" rx="2" fill="currentColor"/>
          <rect x="58" y="59" width="10" height="10" rx="2" fill="currentColor"/>
        </svg>`,
    },
    {
      id: "vote",
      label: "投票",
      path: "vote/",
      featured: true,
      icon: `
        <svg viewBox="0 0 96 96" aria-hidden="true">
          <rect x="15" y="18" width="66" height="60" rx="7" fill="none" stroke="currentColor" stroke-width="8"/>
          <path d="M28 33h40M28 49h18M28 64h18" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
          <rect x="55" y="47" width="16" height="20" rx="3" fill="currentColor"/>
        </svg>`,
    },
    {
      id: "onair",
      label: "オンエア",
      path: "onair/",
      icon: `
        <svg viewBox="0 0 112 96" aria-hidden="true">
          <rect x="15" y="17" width="82" height="55" rx="5" fill="none" stroke="currentColor" stroke-width="8"/>
          <path d="M27 29h28L27 57V29z" fill="currentColor"/>
          <path d="M56 72v10M39 84h34" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
        </svg>`,
    },
    {
      id: "mypage",
      label: "マイページ",
      path: "mypage/",
      icon: `
        <svg viewBox="0 0 96 96" aria-hidden="true">
          <circle cx="48" cy="27" r="18" fill="currentColor"/>
          <path d="M17 83c2.5-20 15-33 31-33s28.5 13 31 33H17z" fill="currentColor"/>
        </svg>`,
    },
  ];

  const normalizePath = (value) => {
    const decoded = decodeURIComponent(value || "/");
    return decoded.endsWith("/") ? decoded : `${decoded}/`;
  };

  const inferActiveRoute = () => {
    const currentPath = normalizePath(window.location.pathname);
    const rootPath = normalizePath(appRoot.pathname);
    const relative = currentPath.startsWith(rootPath)
      ? currentPath.slice(rootPath.length)
      : currentPath.replace(/^\/+/, "");
    const first = relative.split("/").filter(Boolean)[0] || "";

    if (["settings", "guide", "about"].includes(first) || first === "") return "home";
    if (["schedule", "timetable", "results", "monthly", "gradedraces"].includes(first)) return "schedule";
    if (first === "vote") return "vote";
    if (first === "onair") return "onair";
    if (first === "mypage") return "mypage";
    return "home";
  };

  const syncVisualViewport = () => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    const layoutHeight = Math.max(root.clientHeight, window.innerHeight || 0);
    const top = viewport ? Math.max(0, viewport.offsetTop) : 0;
    const visibleHeight = viewport ? viewport.height : (window.innerHeight || layoutHeight);
    const bottom = viewport ? Math.max(0, layoutHeight - visibleHeight - top) : 0;

    root.style.setProperty("--visual-bottom", `${Math.round(bottom)}px`);
    root.style.setProperty(
      "--bottom-nav-total-h",
      `calc(${window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true ? 58 : 62}px + env(safe-area-inset-bottom, 0px))`,
    );
  };

  class ZenraceBottomNav extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;

      const active = this.getAttribute("active") || inferActiveRoute();
      this.setAttribute("active-route", active);
      const availableAttribute = this.getAttribute("available");
      const available = availableAttribute
        ? new Set(availableAttribute.split(/[\s,]+/).filter(Boolean))
        : new Set(ROUTES.map((route) => route.id));
      available.add(active);

      const standalone =
        window.matchMedia?.("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

      const shadow = this.attachShadow({ mode: "open" });
      const items = ROUTES.map((route) => {
        const isActive = route.id === active;
        const isAvailable = available.has(route.id);
        const href = new URL(route.path, appRoot).href;
        const classes = [
          "item",
          isActive ? "active" : "",
          route.featured ? "featured" : "",
          !isAvailable ? "disabled" : "",
        ].filter(Boolean).join(" ");

        return `
          <a
            class="${classes}"
            href="${isAvailable ? href : "#"}"
            data-route="${route.id}"
            data-active="${isActive ? "true" : "false"}"
            ${isActive ? 'aria-current="page"' : ""}
            ${!isAvailable ? 'aria-disabled="true" tabindex="-1"' : ""}
          >
            <span class="icon">${route.icon}</span>
            <span class="label">${route.label}</span>
          </a>`;
      }).join("");

      shadow.innerHTML = `
        <style>
          :host {
            --safe: max(env(safe-area-inset-bottom), 0px);
            --nav-active: #f0cc70;
            position: fixed;
            right: 0;
            bottom: var(--visual-bottom, 0px);
            left: 0;
            z-index: 9000;
            display: block;
            height: calc(${standalone ? "58px" : "62px"} + var(--safe));
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Yu Gothic UI", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;
            touch-action: none;
            overscroll-behavior: none;
          }

          * { box-sizing: border-box; }

          nav {
            width: 100%;
            height: 100%;
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            align-items: start;
            padding: 4px 4px var(--safe);
            color: #d7dce3;
            background:
              linear-gradient(110deg, rgba(213,171,67,.08), transparent 27%, transparent 72%, rgba(213,171,67,.07)),
              linear-gradient(180deg, #151515, #070707);
            border-top: 1px solid rgba(213,171,67,.4);
            box-shadow: 0 -5px 18px rgba(0,0,0,.25);
            touch-action: none;
            overscroll-behavior: none;
          }

          .item {
            position: relative;
            min-width: 0;
            height: ${standalone ? "53px" : "57px"};
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            color: inherit;
            text-decoration: none;
            border-radius: 12px;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }

          .item.featured { color: #fff; }

          .item.featured::before {
            content: "";
            position: absolute;
            inset: 2px -4px;
            z-index: 0;
            border: 1px solid rgba(242,216,137,.42);
            border-radius: 17px;
            background:
              linear-gradient(115deg, rgba(255,255,255,.055), transparent 34%, rgba(213,171,67,.045)),
              linear-gradient(180deg, rgba(38,35,27,.88), rgba(14,13,10,.92));
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,.08),
              inset 0 -1px 0 rgba(0,0,0,.42),
              0 4px 13px rgba(0,0,0,.28);
          }

          .item > * { position: relative; z-index: 1; }
          .item.featured .icon { transform: translateY(-1px) scale(1.04); }

          .icon {
            width: ${standalone ? "25px" : "27px"};
            height: ${standalone ? "25px" : "27px"};
            display: grid;
            place-items: center;
            flex: none;
          }

          svg { width: 100%; height: 100%; display: block; overflow: visible; }

          .label {
            max-width: 100%;
            overflow: hidden;
            font-size: ${standalone ? "9.5px" : "10px"};
            font-weight: 800;
            line-height: 1;
            letter-spacing: -.02em;
            text-overflow: clip;
            white-space: nowrap;
          }

          .item[data-route="onair"] .label { letter-spacing: .04em; }
          .item.active,
          .item[data-active="true"],
          .item[aria-current="page"],
          :host([active-route="home"]) .item[data-route="home"],
          :host([active-route="schedule"]) .item[data-route="schedule"],
          :host([active-route="vote"]) .item[data-route="vote"],
          :host([active-route="onair"]) .item[data-route="onair"],
          :host([active-route="mypage"]) .item[data-route="mypage"] {
            color: var(--nav-active) !important;
          }
          .item.active .icon,
          .item[data-active="true"] .icon,
          .item[aria-current="page"] .icon {
            color: var(--nav-active) !important;
            filter: drop-shadow(0 0 5px rgba(213,171,67,.28));
          }
          .item.active .label,
          .item[data-active="true"] .label,
          .item[aria-current="page"] .label {
            color: var(--nav-active) !important;
            font-weight: 800;
          }
          .disabled { opacity: .38; pointer-events: none; }

          @media (max-width: 380px) {
            .icon { width: 25px; height: 25px; }
            .label { font-size: 9px; }
            .item { gap: 3px; }
            .item.featured::before { inset-inline: -2px; }
          }

          @media print {
            :host, nav { display: none !important; }
          }
        </style>
        <nav aria-label="メインナビゲーション">${items}</nav>`;

      const navElement = shadow.querySelector("nav");
      const stopGesture = (event) => event.preventDefault();
      for (const type of ["gesturestart", "gesturechange", "gestureend"]) {
        navElement.addEventListener(type, stopGesture, { passive: false });
      }
      navElement.addEventListener("touchstart", (event) => {
        if (event.touches.length > 1) event.preventDefault();
      }, { passive: false });
      navElement.addEventListener("touchmove", (event) => {
        if (event.touches.length > 1) event.preventDefault();
      }, { passive: false });

      shadow.querySelectorAll(".disabled").forEach((item) => {
        item.addEventListener("click", (event) => event.preventDefault());
      });
    }
  }

  customElements.define("zenrace-bottom-nav", ZenraceBottomNav);

  const mountBottomNav = () => {
    syncVisualViewport();
    if (!document.querySelector("zenrace-bottom-nav") && document.body) {
      document.body.append(document.createElement("zenrace-bottom-nav"));
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountBottomNav, { once: true });
  } else {
    mountBottomNav();
  }

  window.addEventListener("resize", syncVisualViewport, { passive: true });
  window.addEventListener("orientationchange", () => setTimeout(syncVisualViewport, 80), { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", syncVisualViewport, { passive: true });
    window.visualViewport.addEventListener("scroll", syncVisualViewport, { passive: true });
  }
})();
