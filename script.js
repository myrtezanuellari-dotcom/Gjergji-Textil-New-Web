const form = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = (form.querySelector('input[name="name"]')?.value || "").trim();
    const email = (form.querySelector('input[name="email"]')?.value || "").trim();
    const message = (form.querySelector('textarea[name="message"]')?.value || "").trim();
    const phoneNumber = "355697088800";
    const textParts = [];

    if (name) textParts.push("Emri: " + name);
    if (email) textParts.push("Email: " + email);
    if (message) textParts.push("Mesazhi: " + message);

    const text = encodeURIComponent(textParts.join("\n"));
    const whatsappUrl = "https://wa.me/" + phoneNumber + "?text=" + text;
    if (formStatus) {
      formStatus.textContent = "Po hapet WhatsApp për dërgimin e mesazhit...";
    }
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  });
}

const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {
  const dropdowns = navMenu.querySelectorAll(".nav-dropdown");

  menuToggle.addEventListener("click", function () {
    const isOpen = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    if (!isOpen) {
      dropdowns.forEach(function (dropdown) {
        dropdown.classList.remove("open");
        const toggle = dropdown.querySelector(".nav-dropdown-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      });
    }
  });

  navMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      dropdowns.forEach(function (dropdown) {
        dropdown.classList.remove("open");
        const toggle = dropdown.querySelector(".nav-dropdown-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      });
    });
  });

  dropdowns.forEach(function (dropdown) {
    const toggle = dropdown.querySelector(".nav-dropdown-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", function (event) {
      event.preventDefault();
      const isDesktop = window.innerWidth > 1024;
      const willOpen = !dropdown.classList.contains("open");

      dropdowns.forEach(function (otherDropdown) {
        otherDropdown.classList.remove("open");
        const otherToggle = otherDropdown.querySelector(".nav-dropdown-toggle");
        if (otherToggle) otherToggle.setAttribute("aria-expanded", "false");
      });

      if (!isDesktop || willOpen) {
        dropdown.classList.toggle("open", willOpen);
        toggle.setAttribute("aria-expanded", String(willOpen));
      }
    });
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }

    if (window.innerWidth > 1024) {
      dropdowns.forEach(function (dropdown) {
        dropdown.classList.remove("open");
        const toggle = dropdown.querySelector(".nav-dropdown-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      });
    }
  });

  document.addEventListener("click", function (event) {
    if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
      dropdowns.forEach(function (dropdown) {
        dropdown.classList.remove("open");
        const toggle = dropdown.querySelector(".nav-dropdown-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      });
    }
  });
}

function placeLanguageSwitcherInMobileMenu() {
  const switcher = document.querySelector(".language-switcher");
  const nav = document.querySelector(".nav");
  if (!switcher || !nav) return;

  const originalParent = switcher.parentElement;
  const originalNext = switcher.nextElementSibling;

  const placeInNav = () => {
    if (!nav.contains(switcher)) {
      nav.appendChild(switcher);
    }
    switcher.classList.add("in-nav");
  };

  const placeOriginal = () => {
    switcher.classList.remove("in-nav");
    if (originalParent) {
      if (originalNext && originalParent.contains(originalNext)) {
        originalParent.insertBefore(switcher, originalNext);
      } else {
        originalParent.appendChild(switcher);
      }
    }
  };

  const mediaQuery = window.matchMedia("(max-width: 1024px)");
  const updatePlacement = () => {
    if (mediaQuery.matches) {
      placeInNav();
    } else {
      placeOriginal();
    }
  };

  updatePlacement();
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", updatePlacement);
  } else {
    mediaQuery.addListener(updatePlacement);
  }
}

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

const COOKIE_CONSENT_KEY = "gjergji-cookie-consent";

function getCookieConsent() {
  try {
    return window.localStorage.getItem(COOKIE_CONSENT_KEY);
  } catch (error) {
    return null;
  }
}

function setCookieConsent(value) {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch (error) {
    // If storage is blocked, still allow hiding the banner for this session.
  }
}

function initCookieBanner() {
  if (getCookieConsent()) return;
  if (document.querySelector(".cookie-banner")) return;

  const existingLink = document.querySelector('a[href*="cookies.html"]');
  const cookiesHref = existingLink ? existingLink.getAttribute("href") : "privacy/cookies.html";

  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-live", "polite");
  banner.setAttribute("aria-label", "Njoftim për cookies");

  banner.innerHTML = `
    <p>
      Ne përdorim cookie për të përmirësuar eksperiencën tuaj. Duke klikuar “Pranoj”,
      ju pajtoheni me përdorimin e cookie-ve. Më shumë te
      <a href="${cookiesHref}">Politika e Cookies</a>.
    </p>
    <div class="cookie-actions">
      <button class="cookie-btn cookie-btn-accept" type="button">Pranoj</button>
      <button class="cookie-btn" type="button">Refuzoj</button>
    </div>
  `;

  const [acceptBtn, declineBtn] = banner.querySelectorAll(".cookie-btn");
  if (acceptBtn) {
    acceptBtn.addEventListener("click", () => {
      setCookieConsent("accepted");
      banner.remove();
    });
  }
  if (declineBtn) {
    declineBtn.addEventListener("click", () => {
      setCookieConsent("declined");
      banner.remove();
    });
  }

  document.body.appendChild(banner);
}

placeLanguageSwitcherInMobileMenu();
wireLanguageSwitcher();
document.addEventListener("DOMContentLoaded", () => {
  placeLanguageSwitcherInMobileMenu();
  wireLanguageSwitcher();
  loadGoogleTranslate();
  initCookieBanner();
});


