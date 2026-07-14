(() => {
  if (customElements.get("zenrace-bottom-nav")) return;

  const ITEMS = [
    { key: "home", label: "ホーム", href: "../", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.2 12 4l9 7.2"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></svg>` },
    { key: "schedule", label: "日程", href: "../gradedraces/", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M7.5 3.5v4M16.5 3.5v4M3.5 9.5h17"/><path d="M7.5 13h2M11 13h2M14.5 13h2M7.5 16.5h2M11 16.5h2"/></svg>` },
    { key: "vote", label: "投票", href: "../vote/", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5h11l3 3V20.5H5z"/><path d="M16 3.5v4h4M8 11h8M8 14.5h8M8 18h5"/><path d="m8 7 1.3 1.3L12 5.7"/></svg>` },
    { key: "onair", label: "配信", href: "../onair/", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4.5" width="18" height="13" rx="2"/><path d="m10 8 5 3-5 3zM8 21h8M12 17.5V21"/></svg>` },
    { key: "mypage", label: "マイページ", href: "../mypage/", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.7-4 3-6 6.5-6s5.8 2 6.5 6"/></svg>` }
  ];

  class ZenraceBottomNav extends HTMLElement {
    connectedCallback() {
      const active = this.getAttribute("active") || "";
      const standalone = window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
      if (standalone) this.setAttribute("standalone", "");
      const shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = `
        <style>
          :host{
            --safe:max(env(safe-area-inset-bottom),0px);
            position:fixed;left:0;right:0;bottom:0;z-index:2000;display:block;
            height:calc(62px + var(--safe));font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Yu Gothic UI","Hiragino Kaku Gothic ProN",Meiryo,sans-serif;
            -webkit-text-size-adjust:100%;text-size-adjust:100%;contain:layout style;
          }
          :host([standalone]){height:calc(58px + var(--safe))}
          *{box-sizing:border-box}
          nav{
            width:100%;height:100%;display:grid;grid-template-columns:repeat(5,1fr);align-items:start;
            padding:4px 2px var(--safe);color:#d7dce3;background:
              linear-gradient(110deg,rgba(213,171,67,.08),transparent 27%,transparent 72%,rgba(213,171,67,.07)),
              linear-gradient(180deg,#151515,#070707);
            border-top:1px solid rgba(213,171,67,.4);box-shadow:0 -5px 18px rgba(0,0,0,.25)
          }
          a{
            min-width:0;height:57px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;
            color:inherit;text-decoration:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation
          }
          :host([standalone]) a{height:53px}
          .icon{width:27px;height:27px;display:grid;place-items:center;flex:none}
          svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;overflow:visible}
          .label{font-size:10px;line-height:1;font-weight:750;white-space:nowrap;letter-spacing:-.02em}
          a.active{color:#f0cc70}.active .icon{filter:drop-shadow(0 0 5px rgba(213,171,67,.28))}.active .label{font-weight:900}
          @media(max-width:380px){.icon{width:25px;height:25px}.label{font-size:9px}}
          @media(display-mode:standalone){.icon{width:25px;height:25px}.label{font-size:9.5px}}
        </style>
        <nav aria-label="メインナビゲーション">
          ${ITEMS.map(item => `<a href="${item.href}" class="${item.key === active ? "active" : ""}" ${item.key === active ? 'aria-current="page"' : ""}><span class="icon">${item.icon}</span><span class="label">${item.label}</span></a>`).join("")}
        </nav>`;
    }
  }

  customElements.define("zenrace-bottom-nav", ZenraceBottomNav);
})();
