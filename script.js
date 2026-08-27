const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

menuButton?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});

document.querySelectorAll(".main-nav a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
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
    });
  });

  audio.addEventListener("play", syncButtons);
  audio.addEventListener("pause", syncButtons);
  audio.addEventListener("ended", () => { activeButton = null; syncButtons(); });
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

document.getElementById("year").textContent = new Date().getFullYear();

let toastTimer;
function showToast(message) {
  const toast = document.querySelector(".toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}
