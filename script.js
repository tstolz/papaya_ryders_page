const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

menuButton?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});

document.querySelectorAll(".main-nav a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton?.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open navigation");
  });
});

const audio = document.getElementById("audio-player");
const playButtons = Array.from(document.querySelectorAll(".play-button"));
let activeButton = null;

function syncButtons() {
  playButtons.forEach(b => {
    const playing = b === activeButton && !audio.paused;
    b.classList.toggle("is-playing", playing);
    b.textContent = playing ? "❚❚" : "▶";
    b.setAttribute("aria-label", (playing ? "Pause " : "Play ") + b.dataset.track);
  });
}

if (audio) {
  playButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (activeButton === button) {
        if (audio.paused) audio.play();
        else audio.pause();
        return;
      }
      activeButton = button;
      audio.src = button.closest(".track").dataset.src;
      audio.play().catch(() => {});
      showToast("Now playing — " + button.dataset.track);
    });
  });

  audio.addEventListener("play", syncButtons);
  audio.addEventListener("pause", syncButtons);
  audio.addEventListener("ended", () => {
    const current = activeButton?.closest(".track");
    const next = current?.nextElementSibling;
    activeButton = null;
    syncButtons();
    if (next?.classList.contains("track")) {
      next.querySelector(".play-button")?.click();
    }
  });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

const film = document.querySelector(".film-viewport");
if (film) {
  const FULL_SPEED = 55;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let hovering = false;
  let dragging = false;
  let idleUntil = 0;
  let speed = FULL_SPEED;
  let lastTime;
  let dragStartX = 0;
  let dragStartScroll = 0;

  film.addEventListener("pointerenter", () => { hovering = true; });
  film.addEventListener("pointerleave", () => { hovering = false; });

  film.addEventListener("pointerdown", event => {
    if (event.pointerType !== "mouse") return;
    dragging = true;
    dragStartX = event.clientX;
    dragStartScroll = film.scrollLeft;
    film.setPointerCapture(event.pointerId);
    film.classList.add("dragging");
  });

  film.addEventListener("pointermove", event => {
    if (!dragging) return;
    film.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    film.classList.remove("dragging");
    idleUntil = performance.now() + 2500;
  };
  film.addEventListener("pointerup", endDrag);
  film.addEventListener("pointercancel", endDrag);

  film.addEventListener("wheel", event => {
    idleUntil = performance.now() + 2500;
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    film.scrollLeft += event.deltaX;
  }, { passive: false });

  film.addEventListener("keydown", event => {
    const card = film.querySelector("img");
    if (!card) return;
    const stepSize = card.getBoundingClientRect().width + 12;
    let direction = 0;
    if (event.key === "ArrowRight") direction = 1;
    else if (event.key === "ArrowLeft") direction = -1;
    else return;
    event.preventDefault();
    film.scrollBy({ left: direction * stepSize, behavior: "smooth" });
    idleUntil = performance.now() + 2500;
  });

  const wrap = () => {
    const half = film.scrollWidth / 2;
    if (half <= 0) return;
    if (film.scrollLeft >= half) film.scrollLeft -= half;
    else if (film.scrollLeft < 0) film.scrollLeft += half;
  };

  const frame = now => {
    if (lastTime !== undefined) {
      const dt = Math.min(now - lastTime, 50);
      const focused = document.activeElement === film;
      const target = reducedMotion.matches || dragging || focused || now < idleUntil
        ? 0
        : hovering ? FULL_SPEED * 0.25 : FULL_SPEED;
      speed += (target - speed) * Math.min(1, dt / 250);
      if (speed > 0.5) film.scrollLeft += speed * dt / 1000;
      wrap();
    }
    lastTime = now;
    window.requestAnimationFrame(frame);
  };
  window.requestAnimationFrame(frame);
}

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

let toastTimer;
function showToast(message) {
  const toast = document.querySelector(".toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}
