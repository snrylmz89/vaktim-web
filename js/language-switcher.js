(function () {
  var SUPPORTED_LANGS = ["tr", "en", "ar"];
  var STORAGE_KEY = "vaktim_lang";

  function normalizePath(pathname) {
    if (!pathname) return "/";
    if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
    return pathname;
  }

  function splitPath(pathname) {
    var normalized = normalizePath(pathname);
    if (normalized === "/") return { lang: "tr", basePath: "/" };

    var parts = normalized.split("/").filter(Boolean);
    if (parts.length && (parts[0] === "en" || parts[0] === "ar")) {
      var rest = "/" + parts.slice(1).join("/");
      return { lang: parts[0], basePath: rest === "/" ? "/" : rest };
    }

    return { lang: "tr", basePath: normalized };
  }

  function hasExplicitLocale(pathname) {
    var normalized = normalizePath(pathname);
    if (normalized === "/") return false;
    var parts = normalized.split("/").filter(Boolean);
    return !!(parts.length && (parts[0] === "en" || parts[0] === "ar"));
  }

  function toPath(lang, basePath) {
    if (!SUPPORTED_LANGS.includes(lang)) lang = "tr";
    if (!basePath || basePath === "") basePath = "/";
    if (basePath !== "/" && basePath.endsWith("/")) basePath = basePath.slice(0, -1);

    if (lang === "tr") return basePath;
    if (basePath === "/") return "/" + lang;
    return "/" + lang + basePath;
  }

  function getStoredLang() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return SUPPORTED_LANGS.includes(value) ? value : null;
    } catch (err) {
      return null;
    }
  }

  function setStoredLang(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (err) {
      // ignore storage failures
    }
  }

  function getPreferredLang() {
    var candidates = [];
    if (Array.isArray(navigator.languages) && navigator.languages.length) {
      candidates = navigator.languages.slice();
    } else if (navigator.language || navigator.userLanguage) {
      candidates = [navigator.language || navigator.userLanguage];
    }

    var sawNonTurkish = false;

    for (var i = 0; i < candidates.length; i += 1) {
      var raw = (candidates[i] || "").toLowerCase();
      if (!raw) continue;
      var short = raw.split("-")[0];
      if (SUPPORTED_LANGS.includes(short)) return short;
      if (short && short !== "tr") sawNonTurkish = true;
    }

    return sawNonTurkish ? "en" : "tr";
  }

  function setHtmlDirection(lang) {
    document.documentElement.lang = lang;
    if (lang === "ar") {
      document.documentElement.dir = "rtl";
      document.body.classList.add("lang-ar");
    } else {
      document.documentElement.dir = "ltr";
      document.body.classList.remove("lang-ar");
    }
  }

  function buildSelector(initialLang, onChange) {
    var wrap = document.createElement("div");
    wrap.id = "languageSwitcher";
    wrap.setAttribute("aria-label", "Language");
    wrap.className = "lang-switch";

    SUPPORTED_LANGS.forEach(function (lang) {
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = lang.toUpperCase();
      button.setAttribute("data-lang", lang);
      button.className = "lang-link";
      button.addEventListener("click", onChange);
      wrap.appendChild(button);
    });

    return wrap;
  }

  function createFloatingSelector(initialLang, onChange) {
    var box = document.createElement("div");
    box.style.position = "fixed";
    box.style.top = "12px";
    box.style.right = "12px";
    box.style.zIndex = "9999";
    box.style.background = "rgba(6, 6, 14, 0.86)";
    box.style.border = "1px solid rgba(255,255,255,.14)";
    box.style.borderRadius = "8px";
    box.style.padding = "4px 6px";
    box.style.backdropFilter = "blur(8px)";

    var wrap = buildSelector(initialLang, onChange);
    wrap.style.display = "inline-flex";
    wrap.style.gap = "6px";

    wrap.querySelectorAll("[data-lang]").forEach(function (button) {
      var lang = button.getAttribute("data-lang");
      button.style.border = "1px solid rgba(255,255,255,.12)";
      button.style.background = lang === initialLang ? "rgba(255,215,0,.18)" : "rgba(255,255,255,.04)";
      button.style.color = "#edeae3";
      button.style.borderRadius = "999px";
      button.style.padding = "6px 10px";
      button.style.font = "700 11px Sora, system-ui, sans-serif";
      button.style.cursor = "pointer";
    });

    box.appendChild(wrap);
    document.body.appendChild(box);
    return wrap;
  }

  function createHeaderSelector(initialLang, onChange) {
    var topIn = document.querySelector(".top-in");
    if (!topIn) return null;

    var host = topIn.querySelector(".top-actions");
    if (!host) {
      host = document.createElement("div");
      host.className = "top-actions";

      var topBack = topIn.querySelector(".top-back");
      if (topBack && !topIn.querySelector(".top-nav")) {
        host.appendChild(topBack);
      }

      topIn.appendChild(host);
    }

    var wrap = buildSelector(initialLang, onChange);
    host.appendChild(wrap);
    return wrap;
  }

  function closeSelector(selector) {
    if (!selector || !selector.classList) return;
    selector.classList.remove("is-open");
    var current = selector.querySelector(".lang-current");
    if (current) current.setAttribute("aria-expanded", "false");
  }

  function enhanceSelector(selector) {
    if (!selector || selector.tagName === "SELECT" || selector.querySelector(".lang-current")) {
      return selector;
    }

    var buttons = Array.prototype.slice.call(selector.querySelectorAll("[data-lang]"));
    var current = document.createElement("button");
    current.type = "button";
    current.className = "lang-current";
    current.setAttribute("aria-haspopup", "listbox");
    current.setAttribute("aria-expanded", "false");
    current.innerHTML = '<span class="lang-current-label"></span><span class="lang-current-caret" aria-hidden="true">▾</span>';

    var menu = document.createElement("div");
    menu.className = "lang-menu";
    menu.setAttribute("role", "listbox");

    selector.innerHTML = "";
    selector.appendChild(current);
    selector.appendChild(menu);

    buttons.forEach(function (button) {
      menu.appendChild(button);
    });

    current.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      var shouldOpen = !selector.classList.contains("is-open");
      selector.classList.toggle("is-open", shouldOpen);
      current.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    });

    document.addEventListener("click", function (event) {
      if (!selector.contains(event.target)) closeSelector(selector);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeSelector(selector);
    });

    return selector;
  }

  function updateSelectorState(selector, currentLang) {
    selector.querySelectorAll("[data-lang]").forEach(function (node) {
      var isActive = node.getAttribute("data-lang") === currentLang;
      node.classList.toggle("is-active", isActive);
      if (node.tagName === "BUTTON") {
        node.setAttribute("aria-pressed", isActive ? "true" : "false");
      }
    });

    var currentLabel = selector.querySelector(".lang-current-label");
    if (currentLabel) currentLabel.textContent = currentLang.toUpperCase();
  }

  function init() {
    var info = splitPath(window.location.pathname);
    var currentLang = info.lang;
    var basePath = info.basePath;
    var explicitLocale = hasExplicitLocale(window.location.pathname);
    var storedLang = getStoredLang();

    if (!explicitLocale) {
      var preferredLang = storedLang || getPreferredLang();
      if (preferredLang !== "tr") {
        var autoTarget = toPath(preferredLang, basePath);
        if (autoTarget !== normalizePath(window.location.pathname)) {
          window.location.replace(autoTarget + window.location.search + window.location.hash);
          return;
        }
      }
    } else {
      setStoredLang(currentLang);
    }

    setHtmlDirection(currentLang);

    var selector = null;

    function handleChange(e) {
      var selected = e.target.getAttribute("data-lang") || e.target.value;
      if (!SUPPORTED_LANGS.includes(selected)) return;
      setStoredLang(selected);
      closeSelector(selector);
      var target = toPath(selected, basePath);
      if (target !== normalizePath(window.location.pathname)) {
        window.location.href = target + window.location.search + window.location.hash;
      }
    }

    selector = document.getElementById("languageSwitcher");
    if (!selector) {
      selector = createHeaderSelector(currentLang, handleChange) || createFloatingSelector(currentLang, handleChange);
    }

    selector = enhanceSelector(selector);

    if (selector.tagName === "SELECT") {
      selector.value = currentLang;
      selector.addEventListener("change", handleChange);
    } else {
      selector.querySelectorAll("[data-lang]").forEach(function (node) {
        node.addEventListener("click", handleChange);
      });
      updateSelectorState(selector, currentLang);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
