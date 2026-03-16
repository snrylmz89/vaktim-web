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

    var select = document.createElement("select");
    select.id = "languageSwitcher";
    select.setAttribute("aria-label", "Language");
    select.style.background = "transparent";
    select.style.color = "#edeae3";
    select.style.border = "none";
    select.style.font = "600 12px Plus Jakarta Sans, system-ui, sans-serif";
    select.style.outline = "none";
    select.style.cursor = "pointer";

    [
      { value: "tr", label: "TR" },
      { value: "en", label: "EN" },
      { value: "ar", label: "AR" }
    ].forEach(function (opt) {
      var option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.label;
      option.style.color = "#111";
      select.appendChild(option);
    });

    select.value = initialLang;
    select.addEventListener("change", onChange);
    box.appendChild(select);
    document.body.appendChild(box);
    return select;
  }

  function init() {
    var info = splitPath(window.location.pathname);
    var currentLang = info.lang;
    var basePath = info.basePath;
    var preferredLang = localStorage.getItem(STORAGE_KEY);

    setHtmlDirection(currentLang);

    if (preferredLang && SUPPORTED_LANGS.includes(preferredLang) && preferredLang !== currentLang) {
      var targetPath = toPath(preferredLang, basePath);
      if (targetPath !== normalizePath(window.location.pathname)) {
        window.location.replace(targetPath + window.location.search + window.location.hash);
        return;
      }
    }

    function handleChange(e) {
      var selected = e.target.value;
      if (!SUPPORTED_LANGS.includes(selected)) return;
      localStorage.setItem(STORAGE_KEY, selected);
      var target = toPath(selected, basePath);
      if (target !== normalizePath(window.location.pathname)) {
        window.location.href = target + window.location.search + window.location.hash;
      }
    }

    var selector = document.getElementById("languageSwitcher");
    if (!selector) {
      selector = createFloatingSelector(currentLang, handleChange);
    } else {
      selector.value = currentLang;
      selector.addEventListener("change", handleChange);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
