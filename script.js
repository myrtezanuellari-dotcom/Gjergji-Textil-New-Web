const form = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (form) {
  form.addEventListener("submit", function (e) {
    if (formStatus) {
      formStatus.textContent = "Duke dërguar mesazhin...";
    }
  });
}

const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", function () {
    const isOpen = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const root = document.documentElement;
const THEME_KEY = "gjergji-theme";

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
}

(function initTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  setTheme(prefersDark.matches ? "dark" : "light");

  prefersDark.addEventListener("change", function (event) {
    setTheme(event.matches ? "dark" : "light");
  });
})();

const revealTargets = document.querySelectorAll(
  ".section, .card, .client-card, .value-item, .footer-grid section"
);

if (revealTargets.length > 0) {
  revealTargets.forEach(function (el, index) {
    el.classList.add("reveal-on-scroll");
    const delayClass = "reveal-delay-" + ((index % 4) + 1);
    el.classList.add(delayClass);
  });

  const revealObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealTargets.forEach(function (el) {
    revealObserver.observe(el);
  });
}

document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
  const track = carousel.querySelector(".carousel-track");
  if (!track) return;

  function getScrollAmount() {
    const card = track.querySelector(".carousel-card");
    if (!card) return 320;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.gap || styles.columnGap || "0");
    return card.getBoundingClientRect().width + gap;
  }

  carousel.querySelectorAll("[data-carousel-btn]").forEach(function (button) {
    button.addEventListener("click", function () {
      const direction = button.dataset.carouselBtn === "next" ? 1 : -1;
      track.scrollBy({
        left: getScrollAmount() * direction,
        behavior: "smooth",
      });
    });
  });
});

function googleTranslateElementInit() {
  if (!window.google || !window.google.translate) {
    return;
  }
  new google.translate.TranslateElement(
    {
      pageLanguage: "sq",
      includedLanguages: "sq,en,it",
      autoDisplay: false,
    },
    "google_translate_element"
  );
  applySavedLanguage();
}

function setLanguage(lang) {
  const domain = location.hostname;
  document.cookie = `googtrans=/sq/${lang};path=/`;
  if (domain) {
    document.cookie = `googtrans=/sq/${lang};path=/;domain=${domain}`;
  }
  location.reload();
}

function getSavedLanguage() {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("googtrans="));
  if (!cookie) return "sq";
  const value = cookie.split("=")[1] || "";
  const lang = value.split("/").pop();
  return lang || "sq";
}

function applySavedLanguage() {
  const lang = getSavedLanguage();
  const combo = document.querySelector(".goog-te-combo");
  if (combo && combo.value !== lang) {
    combo.value = lang;
    combo.dispatchEvent(new Event("change"));
  }
  const languageButtons = document.querySelectorAll(".language-option");
  if (languageButtons.length) {
    languageButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
  }
}

function wireLanguageSwitcher() {
  const switcher = document.querySelector(".language-switcher");
  const toggle = document.querySelector(".language-toggle");
  const languageButtons = document.querySelectorAll(".language-option");
  if (!switcher || !toggle || !languageButtons.length) return;

  applySavedLanguage();

  toggle.addEventListener("click", () => {
    const isOpen = switcher.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const lang = button.dataset.lang;
      const combo = document.querySelector(".goog-te-combo");
      languageButtons.forEach((btn) => {
        btn.classList.toggle("active", btn === button);
      });
      switcher.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      if (combo) {
        combo.value = lang;
        combo.dispatchEvent(new Event("change"));
      } else {
        setLanguage(lang);
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!switcher.contains(event.target)) {
      switcher.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function loadGoogleTranslate() {
  if (window.google && window.google.translate) return;
  if (document.querySelector("script[data-translate]")) return;
  const script = document.createElement("script");
  script.src =
    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  script.setAttribute("data-translate", "true");
  document.body.appendChild(script);
}

wireLanguageSwitcher();
document.addEventListener("DOMContentLoaded", () => {
  wireLanguageSwitcher();
  loadGoogleTranslate();
});
