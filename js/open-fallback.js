(function () {
  var MAX_FIELD_LENGTH = 80;

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

  function setText(id, value) {
    var element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function setHref(id, href) {
    var element = document.getElementById(id);
    if (element) element.setAttribute("href", href);
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

  function applyContext() {
    var context = getContext();
    var params = new URLSearchParams(window.location.search);
    var landingUrl = buildLandingUrl(params);
    var appLink = withSource(context.appPath, params);

    setHref("appLink", appLink);
    setHref("landingLink", landingUrl);
    setHref("headerHomeLink", landingUrl);

    if (context.kind === "ayah") {
      document.title = context.target + " | Vaktim'de Aç";
      setText("kicker", "Kur'an bağlantısı");
      setText("pageTitle", context.title);
      setText("leadText", "Bu ayeti Vaktim uygulamasında meal, notlar ve manevi okuma akışıyla açabilirsin.");
      setText("typeText", "Ayet bağlantısı");
      setText("targetText", context.target);
      setText("detailText", "Uygulama yüklüyse doğrudan ayet ekranı açılır; değilse Vaktim web sayfasından uygulamayı keşfedebilirsin.");
      return;
    }

    if (context.kind === "surah") {
      document.title = context.target + " | Vaktim'de Aç";
      setText("kicker", "Sure bağlantısı");
      setText("pageTitle", context.title);
      setText("leadText", "Bu sureyi Vaktim uygulamasında düzenli okuma ve takip deneyimiyle açabilirsin.");
      setText("typeText", "Sure bağlantısı");
      setText("targetText", context.target);
      setText("detailText", "Uygulama yüklüyse doğrudan sure ekranı açılır; web fallback her zaman güvenli şekilde çalışır.");
      return;
    }

    if (context.kind === "prayer") {
      document.title = context.target + " | Vaktim'de Aç";
      setText("kicker", "Namaz vakti bağlantısı");
      setText("pageTitle", context.title);
      setText("leadText", "Seçili şehir için namaz vakitlerini Vaktim uygulamasında takip edebilirsin.");
      setText("typeText", "Namaz vakitleri");
      setText("targetText", context.target);
      setText("detailText", "Uygulama yüklüyse vakit ekranı açılır; değilse Vaktim'i keşfet bağlantısı web sayfasına döner.");
      return;
    }
  }

  applyContext();
})();
