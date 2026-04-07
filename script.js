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

function initChatWidget() {
  if (document.querySelector(".chat-panel")) return;

  function getChatEndpoint() {
    if (window.GJERGJI_CHAT_API) return window.GJERGJI_CHAT_API;
    return "/api/chat";
  }

  const toggle = document.createElement("button");
  toggle.className = "chat-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Hap chat");
  toggle.textContent = "AI";

  const panel = document.createElement("div");
  panel.className = "chat-panel hidden";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Chat me asistencen");

  panel.innerHTML = `
    <div class="chat-header">
      <span>AI</span>
      <button class="chat-close" type="button" aria-label="Mbyll chat">×</button>
    </div>
    <div class="chat-messages" aria-live="polite"></div>
    <div class="chat-input">
      <textarea rows="1" placeholder="Shkruani pyetjen tuaj..."></textarea>
      <button class="chat-send" type="button">Dergo</button>
    </div>
  `;

  const messages = panel.querySelector(".chat-messages");
  const input = panel.querySelector("textarea");
  const sendBtn = panel.querySelector(".chat-send");
  const closeBtn = panel.querySelector(".chat-close");

  const history = [];

  function appendBubble(text, role) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${role}`;
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  function setBusy(isBusy) {
    sendBtn.disabled = isBusy;
    input.disabled = isBusy;
  }

  async function sendMessage() {
    const text = (input.value || "").trim();
    if (!text) return;
    input.value = "";
    appendBubble(text, "user");
    history.push({ role: "user", content: text });
    setBusy(true);

    try {
      const endpoint = getChatEndpoint();
      if (location.protocol === "file:" && endpoint.startsWith("/")) {
        appendBubble(
          "Chat-i funksionon vetem kur faqja hapet nga serveri (p.sh. http://localhost:3000).",
          "bot"
        );
        setBusy(false);
        return;
      }
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await response.json();
      if (!response.ok) {
        appendBubble("Ka nje problem. Ju lutem provoni perseri pak me vone.", "bot");
        setBusy(false);
        return;
      }
      const reply = data.reply || "Faleminderit! Si mund tju ndihmoj tjeter?";
      appendBubble(reply, "bot");
      history.push({ role: "assistant", content: reply });
    } catch (error) {
      appendBubble("Ka nje problem me lidhjen. Provoni perseri.", "bot");
    } finally {
      setBusy(false);
    }
  }

  toggle.addEventListener("click", () => {
    panel.classList.toggle("hidden");
    if (!panel.classList.contains("hidden")) {
      input.focus();
      if (!history.length) {
        appendBubble("Pershendetje! Si mund tju ndihmoj sot?", "bot");
        if (location.protocol === "file:" && getChatEndpoint().startsWith("/")) {
          appendBubble(
            "Hap faqen nga serveri (http://localhost:3000) qe chat-i te funksionoje.",
            "bot"
          );
        }
        if (location.hostname.includes("github.io") && !window.GJERGJI_CHAT_API) {
          appendBubble(
            "Vendos linkun e API-se me `window.GJERGJI_CHAT_API` qe chat-i te punoje ne GitHub Pages.",
            "bot"
          );
        }
      }
    }
  });

  closeBtn.addEventListener("click", () => {
    panel.classList.add("hidden");
  });

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

  document.body.appendChild(toggle);
  document.body.appendChild(panel);
}

placeLanguageSwitcherInMobileMenu();
wireLanguageSwitcher();
document.addEventListener("DOMContentLoaded", () => {
  placeLanguageSwitcherInMobileMenu();
  wireLanguageSwitcher();
  loadGoogleTranslate();
  initCookieBanner();
  initChatWidget();
});


