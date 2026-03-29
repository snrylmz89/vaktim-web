(function () {
  var SUPPORTED_LANGS = ["tr", "en", "ar"];

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

  function toPath(lang, basePath) {
    if (!SUPPORTED_LANGS.includes(lang)) lang = "tr";
    if (!basePath || basePath === "") basePath = "/";
    if (basePath !== "/" && basePath.endsWith("/")) basePath = basePath.slice(0, -1);

    if (lang === "tr") return basePath;
    if (basePath === "/") return "/" + lang;
    return "/" + lang + basePath;
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

    var wrap = document.createElement("div");
    wrap.id = "languageSwitcher";
    wrap.setAttribute("aria-label", "Language");
    wrap.style.display = "inline-flex";
    wrap.style.gap = "6px";

    SUPPORTED_LANGS.forEach(function (lang) {
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = lang.toUpperCase();
      button.setAttribute("data-lang", lang);
      button.style.border = "1px solid rgba(255,255,255,.12)";
      button.style.background = lang === initialLang ? "rgba(255,215,0,.18)" : "rgba(255,255,255,.04)";
      button.style.color = "#edeae3";
      button.style.borderRadius = "999px";
      button.style.padding = "6px 10px";
      button.style.font = "700 11px Sora, system-ui, sans-serif";
      button.style.cursor = "pointer";
      button.addEventListener("click", onChange);
      wrap.appendChild(button);
    });

    box.appendChild(wrap);
    document.body.appendChild(box);
    return wrap;
  }

  function updateSelectorState(selector, currentLang) {
    selector.querySelectorAll("[data-lang]").forEach(function (node) {
      var isActive = node.getAttribute("data-lang") === currentLang;
      node.classList.toggle("is-active", isActive);
      if (node.tagName === "BUTTON") {
        node.setAttribute("aria-pressed", isActive ? "true" : "false");
      }
    });
  }

  function init() {
    var info = splitPath(window.location.pathname);
    var currentLang = info.lang;
    var basePath = info.basePath;

    setHtmlDirection(currentLang);

    function handleChange(e) {
      var selected = e.target.getAttribute("data-lang") || e.target.value;
      if (!SUPPORTED_LANGS.includes(selected)) return;
      var target = toPath(selected, basePath);
      if (target !== normalizePath(window.location.pathname)) {
        window.location.href = target + window.location.search + window.location.hash;
      }
    }

    var selector = document.getElementById("languageSwitcher");
    if (!selector) {
      selector = createFloatingSelector(currentLang, handleChange);
    }

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
