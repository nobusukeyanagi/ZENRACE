(() => {
  "use strict";

  const carousel = document.querySelector("[data-carousel]");
  const track = document.querySelector("[data-carousel-track]");
  const dotsHost = document.querySelector("[data-carousel-dots]");
  const slides = track ? [...track.querySelectorAll(".campaign-slide")] : [];
  let current = 0;
  let timer = 0;

  const toast = document.querySelector("[data-home-toast]");
  let toastTimer = 0;
  const showToast = (message) => {
    if (!toast || !message) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
  };

  document.querySelectorAll("[data-demo-message]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      showToast(element.getAttribute("data-demo-message"));
    });
  });

  if (!carousel || !track || !dotsHost || slides.length === 0) return;

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `${index + 1}枚目を表示`);
    dot.addEventListener("click", () => goTo(index, true));
    dotsHost.append(dot);
    return dot;
  });

  const updateDots = () => {
    dots.forEach((dot, index) => {
      const active = index === current;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });
  };

  const goTo = (index, userInitiated = false) => {
    current = (index + slides.length) % slides.length;
    const slide = slides[current];
    const targetLeft = slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;
    track.scrollTo({ left: targetLeft, behavior: "smooth" });
    updateDots();
    if (userInitiated) restartAutoPlay();
  };

  const nearestIndex = () => {
    const trackRect = track.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    slides.forEach((slide, index) => {
      const rect = slide.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - center);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    return bestIndex;
  };

  let scrollFrame = 0;
  track.addEventListener("scroll", () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      const next = nearestIndex();
      if (next !== current) {
        current = next;
        updateDots();
      }
    });
  }, { passive: true });

  const stopAutoPlay = () => {
    window.clearInterval(timer);
    timer = 0;
  };
  const startAutoPlay = () => {
    if (timer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = window.setInterval(() => goTo(current + 1), 4800);
  };
  const restartAutoPlay = () => {
    stopAutoPlay();
    startAutoPlay();
  };

  document.querySelector("[data-carousel-prev]")?.addEventListener("click", () => goTo(current - 1, true));
  document.querySelector("[data-carousel-next]")?.addEventListener("click", () => goTo(current + 1, true));
  carousel.addEventListener("pointerdown", stopAutoPlay, { passive: true });
  carousel.addEventListener("pointerup", startAutoPlay, { passive: true });
  carousel.addEventListener("pointercancel", startAutoPlay, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoPlay();
    else startAutoPlay();
  });

  updateDots();
  requestAnimationFrame(() => goTo(0));
  startAutoPlay();
})();
