const panels = ["home", "about", "experience", "skills", "education", "contact"];

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const topnav = document.getElementById("topnav");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = Array.from(document.querySelectorAll(".topnav__link, .topnav__cta"));
const panelEls = Object.fromEntries(
  panels.map((id) => [id, document.querySelector(`[data-panel="${id}"]`)])
);
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const dotsWrap = document.getElementById("pager-dots");

let current = "home";
let isAnimating = false;

const setMenuOpen = (open) => {
  if (!topnav || !menuToggle) return;
  topnav.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};

const updateChrome = () => {
  navLinks.forEach((link) => {
    const target = link.getAttribute("data-go");
    link.classList.toggle("is-active", target === current && !link.classList.contains("topnav__cta"));
  });

  const index = panels.indexOf(current);
  if (prevBtn) prevBtn.disabled = index <= 0;
  if (nextBtn) nextBtn.disabled = index >= panels.length - 1;

  if (dotsWrap) {
    Array.from(dotsWrap.children).forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
      dot.setAttribute("aria-current", i === index ? "true" : "false");
    });
  }
};

const showPanel = (id, { updateHash = true } = {}) => {
  if (!panels.includes(id) || id === current || isAnimating) return;

  const outgoing = panelEls[current];
  const incoming = panelEls[id];
  if (!outgoing || !incoming) return;

  isAnimating = true;
  outgoing.classList.add("is-exit");
  outgoing.classList.remove("is-active");

  window.setTimeout(() => {
    outgoing.hidden = true;
    outgoing.classList.remove("is-exit");

    incoming.hidden = false;
    requestAnimationFrame(() => {
      incoming.classList.add("is-active");
    });

    current = id;
    updateChrome();
    if (updateHash) {
      history.replaceState(null, "", `#${id}`);
    }
    setMenuOpen(false);
    isAnimating = false;
  }, 220);
};

const goRelative = (step) => {
  const index = panels.indexOf(current);
  const next = panels[index + step];
  if (next) showPanel(next);
};

if (dotsWrap) {
  panels.forEach((id, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "pager__dot" + (index === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", `Go to ${id}`);
    dot.addEventListener("click", () => showPanel(id));
    dotsWrap.appendChild(dot);
  });
}

document.querySelectorAll("[data-go]").forEach((el) => {
  el.addEventListener("click", (event) => {
    const target = el.getAttribute("data-go");
    if (!target) return;
    if (el.tagName === "A" && el.getAttribute("href")?.startsWith("mailto:")) return;
    event.preventDefault();
    showPanel(target);
  });
});

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!open);
  });
}

if (prevBtn) prevBtn.addEventListener("click", () => goRelative(-1));
if (nextBtn) nextBtn.addEventListener("click", () => goRelative(1));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuOpen(false);
  if (event.key === "ArrowRight") goRelative(1);
  if (event.key === "ArrowLeft") goRelative(-1);
});

document.querySelectorAll(".job-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const job = tab.getAttribute("data-job");
    document.querySelectorAll(".job-tab").forEach((item) => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".job-panel").forEach((panel) => {
      const active = panel.getAttribute("data-job-panel") === job;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  });
});

document.querySelectorAll(".skill-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const skill = tab.getAttribute("data-skill");
    document.querySelectorAll(".skill-tab").forEach((item) => {
      item.classList.toggle("is-active", item === tab);
    });
    document.querySelectorAll(".skill-panel").forEach((panel) => {
      const active = panel.getAttribute("data-skill-panel") === skill;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  });
});

document.querySelectorAll(".skill-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    chip.classList.toggle("is-picked");
  });
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 860) setMenuOpen(false);
});

const initial = (location.hash || "#home").replace("#", "");
if (panels.includes(initial) && initial !== "home") {
  const home = panelEls.home;
  const target = panelEls[initial];
  if (home && target) {
    home.classList.remove("is-active");
    home.hidden = true;
    target.hidden = false;
    target.classList.add("is-active");
    current = initial;
  }
}

updateChrome();
