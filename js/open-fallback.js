(function () {
  var MAX_FIELD_LENGTH = 80;
  var API_BASE_URLS = ["https://api.vaktim.app", "https://mcp.vaktim.app"];
  var SUPPORTED_LANGUAGES = ["tr", "en", "de", "fr", "ar", "id", "ms"];

  function safeDecode(value) {
    try {
      return decodeURIComponent(value || "");
    } catch (err) {
      return "";
    }
  }

  function cleanText(value, fallback) {
    var text = safeDecode(value)
      .replace(/[\u0000-\u001f\u007f<>]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) return fallback;
    return text.slice(0, MAX_FIELD_LENGTH);
  }

  function normalizeLanguage(value) {
    var language = cleanText(value, "tr").toLowerCase().split(/[-_]/)[0];
    return SUPPORTED_LANGUAGES.indexOf(language) === -1 ? "tr" : language;
  }

  function normalizeDate(value) {
    var text = cleanText(value, "");
    return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
  }

  function appendTracking(url, params) {
    var source = cleanText(params.get("source"), "web_fallback").toLowerCase();
    url.searchParams.set("source", source);

    ["utm_source", "utm_medium", "utm_campaign"].forEach(function (key) {
      var value = cleanText(params.get(key), "");
      if (value) url.searchParams.set(key, value);
    });

    return url;
  }

  function pathParts() {
    var parts = window.location.pathname.split("/").filter(Boolean);
    if (parts[0] === "en" || parts[0] === "ar") parts.shift();
    return parts;
  }

  function parseAyah(parts) {
    var ref = cleanText(parts[1] || "", "");
    var surah = "";
    var ayah = "";

    if (/^\d{1,3}:\d{1,3}$/.test(ref)) {
      var split = ref.split(":");
      surah = split[0];
      ayah = split[1];
    } else if (/^\d{1,3}$/.test(parts[1] || "") && /^\d{1,3}$/.test(parts[2] || "")) {
      surah = parts[1];
      ayah = parts[2];
    }

    if (!surah || !ayah) return null;

    return {
      kind: "ayah",
      title: surah + ":" + ayah + " ayeti",
      target: surah + ":" + ayah,
      appPath: "vaktim://ayah/" + surah + "/" + ayah,
    };
  }

  function parseSurah(parts) {
    var surah = cleanText(parts[1] || "", "");
    if (!/^\d{1,3}$/.test(surah)) return null;

    return {
      kind: "surah",
      title: surah + ". sure",
      target: surah + ". sure",
      appPath: "vaktim://surah/" + surah,
    };
  }

  function parsePrayer(params) {
    var city = cleanText(params.get("city"), "Seçili şehir");
    var country = cleanText(params.get("country"), "Turkey");
    var date = normalizeDate(params.get("date"));
    var appUrl = new URL("vaktim://prayer-times");

    appUrl.searchParams.set("city", city);
    appUrl.searchParams.set("country", country);
    if (date) appUrl.searchParams.set("date", date);

    return {
      kind: "prayer",
      title: city + " namaz vakitleri",
      target: date ? city + " - " + date : city,
      appPath: appUrl.toString(),
    };
  }

  function getContext() {
    var parts = pathParts();
    var params = new URLSearchParams(window.location.search);
    var parsed = null;

    if (parts[0] === "ayah") parsed = parseAyah(parts);
    if (parts[0] === "surah") parsed = parseSurah(parts);
    if (parts[0] === "prayer-times") parsed = parsePrayer(params);

    if (parsed) return parsed;

    return {
      kind: "general",
      title: "Vaktim bağlantısı",
      target: "Vaktim",
      appPath: "vaktim://home",
    };
  }

  function getCurrentLanguage() {
    var params = new URLSearchParams(window.location.search);
    return normalizeLanguage(params.get("lang") || params.get("language") || "tr");
  }

  function setText(id, value) {
    var element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function setHref(id, href) {
    var element = document.getElementById(id);
    if (element) element.setAttribute("href", href);
  }

  function showElement(id, visible) {
    var element = document.getElementById(id);
    if (element) element.hidden = !visible;
  }

  function setPanelVisible(id, visible) {
    var element = document.getElementById(id);
    if (!element) return;
    if (visible) {
      element.classList.add("is-visible");
    } else {
      element.classList.remove("is-visible");
    }
  }

  function setStatus(value) {
    setText("statusText", value);
  }

  function requestUrl(baseUrl, path, params) {
    var url = new URL(path, baseUrl);
    params.forEach(function (value, key) {
      url.searchParams.set(key, value);
    });
    return url.toString();
  }

  async function fetchJson(url) {
    var response = await fetch(url, {
      headers: { accept: "application/json" },
    });
    var payload = await response.json().catch(function () {
      return null;
    });

    if (!response.ok || !payload || payload.success !== true) {
      var message = payload && payload.error && payload.error.message
        ? payload.error.message
        : "İçerik şu anda alınamadı.";
      throw new Error(message);
    }

    return payload.data;
  }

  async function fetchApiJson(path, params) {
    var lastError = null;

    for (var index = 0; index < API_BASE_URLS.length; index += 1) {
      try {
        return await fetchJson(requestUrl(API_BASE_URLS[index], path, params));
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("İçerik şu anda alınamadı.");
  }

  function setContentText(id, value, fallback) {
    setText(id, value || fallback || "");
  }

  async function loadAyahContent(context, language) {
    var split = context.target.split(":");
    if (split.length !== 2 || !/^\d{1,3}$/.test(split[0]) || !/^\d{1,3}$/.test(split[1])) {
      throw new Error("Ayet bağlantısı geçersiz.");
    }

    var params = new URLSearchParams(window.location.search);
    params.set("lang", language);
    if (language === "tr") params.set("includeExplanation", "true");
    if (language !== "tr") params.delete("includeExplanation");
    params.set("source", cleanText(params.get("source"), "web_fallback"));

    setStatus("Ayet içeriği yükleniyor...");
    setPanelVisible("surahPanel", false);
    setPanelVisible("ayahPanel", false);

    var data = await fetchApiJson("/api/quran/ayah/" + split[0] + "/" + split[1], params);

    if (data.surahName && data.verseKey) {
      document.title = data.surahName + " " + data.verseKey + " | Vaktim";
      setText("pageTitle", data.surahName + " " + data.verseKey);
      setText("leadText", "Arapça metin, meal ve kısa açıklamayı tek ekranda sakin bir okuma düzeniyle görebilirsin.");
    }

    setContentText("arabicText", data.arabicText, "Arapça metin şu anda alınamadı.");
    setContentText("translationText", data.translationText || data.translation, "Bu dil için meal şu anda alınamadı.");
    setContentText("translationSource", data.translationSource ? "Kaynak: " + data.translationSource : "");
    setContentText("explanationText", data.explanationSummary || "");
    showElement("explanationBlock", !!data.explanationSummary);
    setStatus(data.surahName ? data.surahName + " " + data.verseKey : data.verseKey);
    setPanelVisible("ayahPanel", true);
  }

  function renderVerseList(verses) {
    var list = document.getElementById("verseList");
    if (!list) return;
    list.textContent = "";

    verses.forEach(function (verse) {
      var item = document.createElement("div");
      item.className = "verse-item";

      var key = document.createElement("div");
      key.className = "verse-key";
      key.textContent = verse.verseKey || "";

      var arabic = document.createElement("div");
      arabic.className = "arabic-text";
      arabic.textContent = verse.arabicText || "";

      var translation = document.createElement("div");
      translation.className = "translation-text";
      translation.textContent = verse.translationText || verse.translation || "";

      item.appendChild(key);
      if (arabic.textContent) item.appendChild(arabic);
      if (translation.textContent) item.appendChild(translation);
      list.appendChild(item);
    });
  }

  async function loadSurahContent(context, language) {
    var surah = context.target.match(/\d+/);
    if (!surah) {
      throw new Error("Sure bağlantısı geçersiz.");
    }

    var params = new URLSearchParams(window.location.search);
    params.set("lang", language);
    params.set("source", cleanText(params.get("source"), "web_fallback"));

    setStatus("Sure içeriği yükleniyor...");
    setPanelVisible("ayahPanel", false);
    setPanelVisible("surahPanel", false);

    var data = await fetchApiJson("/api/quran/surah/" + surah[0], params);

    if (data.surah && data.surah.name) {
      document.title = data.surah.name + " Suresi | Vaktim";
      setText("pageTitle", data.surah.name + " Suresi");
      setText("leadText", data.surah.verseCount + " ayeti Arapça metin ve meal ile birlikte okuyabilirsin.");
    }

    renderVerseList(data.verses || []);
    setStatus(data.surah && data.surah.name ? data.surah.name + " - " + data.surah.verseCount + " ayet" : context.target);
    setPanelVisible("surahPanel", true);
  }

  async function loadDynamicContent(context, language) {
    var reader = document.getElementById("reader");
    if (!reader || (context.kind !== "ayah" && context.kind !== "surah")) return;

    reader.hidden = false;

    try {
      if (context.kind === "ayah") {
        await loadAyahContent(context, language);
      } else {
        await loadSurahContent(context, language);
      }
    } catch (error) {
      setStatus(error && error.message ? error.message : "İçerik şu anda alınamadı.");
      setPanelVisible("ayahPanel", false);
      setPanelVisible("surahPanel", false);
    }
  }

  function buildLandingUrl(params) {
    var url = new URL("/", window.location.origin);
    url = appendTracking(url, params);
    url.hash = "cta";
    return url.toString();
  }

  function withSource(appPath, params) {
    var source = cleanText(params.get("source"), "web_fallback").toLowerCase();
    var joiner = appPath.indexOf("?") === -1 ? "?" : "&";
    return appPath + joiner + "source=" + encodeURIComponent(source);
  }

  function buildQuranUrl(language) {
    var url = new URL("/quran", window.location.origin);
    url.searchParams.set("lang", normalizeLanguage(language));
    return url.toString();
  }

  function applyContext() {
    var context = getContext();
    var params = new URLSearchParams(window.location.search);
    var language = getCurrentLanguage();
    var landingUrl = buildLandingUrl(params);
    var appLink = withSource(context.appPath, params);
    var languageSelect = document.getElementById("languageSelect");

    setHref("appLink", appLink);
    setHref("landingLink", landingUrl);
    setHref("headerHomeLink", landingUrl);
    setHref("quranLink", buildQuranUrl(language));

    if (languageSelect) {
      languageSelect.value = language;
      languageSelect.addEventListener("change", function () {
        var nextLanguage = normalizeLanguage(languageSelect.value);
        var nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set("lang", nextLanguage);
        window.history.replaceState(null, "", nextUrl.toString());
        setHref("quranLink", buildQuranUrl(nextLanguage));
        loadDynamicContent(context, nextLanguage);
      });
    }

    if (context.kind === "ayah") {
      document.title = context.target + " | Vaktim'de Aç";
      setText("kicker", "Kur'an bağlantısı");
      setText("pageTitle", context.title);
      setText("leadText", "Bu ayeti Vaktim uygulamasında meal, notlar ve manevi okuma akışıyla açabilirsin.");
      loadDynamicContent(context, language);
      return;
    }

    if (context.kind === "surah") {
      document.title = context.target + " | Vaktim'de Aç";
      setText("kicker", "Sure bağlantısı");
      setText("pageTitle", context.title);
      setText("leadText", "Bu sureyi Vaktim uygulamasında düzenli okuma ve takip deneyimiyle açabilirsin.");
      loadDynamicContent(context, language);
      return;
    }

    if (context.kind === "prayer") {
      document.title = context.target + " | Vaktim'de Aç";
      setText("kicker", "Namaz vakti bağlantısı");
      setText("pageTitle", context.title);
      setText("leadText", "Seçili şehir için namaz vakitlerini Vaktim uygulamasında takip edebilirsin.");
      return;
    }
  }

  applyContext();
})();
