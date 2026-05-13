(function () {
  var MAX_FIELD_LENGTH = 80;
  var API_BASE_URLS = ["https://mcp.vaktim.app", "https://api.vaktim.app"];
  var QURAN_API_BASE_URL = "https://api.quran.com/api/v4";
  var SUPPORTED_LANGUAGES = ["tr", "en", "de", "fr", "ar", "id", "ms"];
  var TRANSLATION_RESOURCES = {
    tr: [
      { id: 77, source: "Vaktim.app / Diyanet İşleri Başkanlığı" },
      { id: 52, source: "Elmalılı Hamdi Yazır" },
      { id: 210, source: "Dar Al-Salam Center" },
      { id: 124, source: "Muslim Shahin" },
      { id: 112, source: "Shaban Britch" },
    ],
    en: [
      { id: 85, source: "M.A.S. Abdel Haleem" },
      { id: 149, source: "Fadel Soliman" },
      { id: 19, source: "M. Pickthall" },
      { id: 20, source: "Sahih International" },
      { id: 84, source: "T. Usmani" },
      { id: 95, source: "A. Maududi" },
    ],
    de: [
      { id: 27, source: "Frank Bubenheim and Nadeem" },
      { id: 208, source: "Abu Reda" },
    ],
    fr: [
      { id: 31, source: "Muhammad Hamidullah" },
      { id: 136, source: "Montada Islamic Foundation" },
      { id: 779, source: "Rashid Maash" },
    ],
    id: [
      { id: 33, source: "Indonesian Islamic Affairs Ministry" },
      { id: 134, source: "King Fahad Complex" },
      { id: 141, source: "The Sabiq Company" },
    ],
    ms: [
      { id: 39, source: "Abdullah Muhammad Basmeih" },
    ],
  };
  var TAFSIR_RESOURCES = {
    tr: [
      { id: "vaktim-tr-summary", source: "Vaktim kısa açıklama", local: true },
    ],
    en: [
      { id: 169, source: "Ibn Kathir (Abridged)" },
      { id: 168, source: "Maarif-ul-Quran" },
      { id: 817, source: "Tazkirul Quran" },
    ],
    ar: [
      { id: 16, source: "Tafsir Al-Muyassar" },
      { id: 93, source: "Al-Waseet" },
      { id: 14, source: "Ibn Kathir" },
      { id: 91, source: "Tafsir As-Sa'di" },
      { id: 90, source: "Al-Qurtubi" },
    ],
  };

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

  function getCurrentContentMode() {
    var params = new URLSearchParams(window.location.search);
    return params.get("mode") === "tafsir" ? "tafsir" : "translation";
  }

  function getResourceList(language, mode) {
    var source = mode === "tafsir" ? TAFSIR_RESOURCES : TRANSLATION_RESOURCES;
    return source[language] || [];
  }

  function getDefaultResource(language, mode) {
    var list = getResourceList(language, mode);
    return list.length ? list[0] : null;
  }

  function findResource(language, mode, id) {
    var list = getResourceList(language, mode);
    var normalizedId = id ? String(id) : "";
    return list.find(function (resource) {
      return String(resource.id) === normalizedId;
    }) || getDefaultResource(language, mode);
  }

  function getCurrentResource(language, mode) {
    var params = new URLSearchParams(window.location.search);
    var key = mode === "tafsir" ? "tafsir" : "translation";
    return findResource(language, mode, params.get(key) || params.get(key + "Id"));
  }

  function updateResourceParam(url, mode, resource) {
    url.searchParams.delete("translation");
    url.searchParams.delete("translationId");
    url.searchParams.delete("tafsir");
    url.searchParams.delete("tafsirId");

    if (!resource || resource.local || !resource.id) return;
    url.searchParams.set(mode === "tafsir" ? "tafsir" : "translation", String(resource.id));
  }

  function populateResourceSelect(language, mode) {
    var field = document.getElementById("resourceField");
    var label = document.getElementById("resourceLabel");
    var select = document.getElementById("resourceSelect");
    var resources = getResourceList(language, mode);
    var current = getCurrentResource(language, mode);

    if (!field || !label || !select) return current;

    label.textContent = mode === "tafsir" ? "Tefsir kaynağı" : "Meal kaynağı";
    select.setAttribute("aria-label", label.textContent);
    select.textContent = "";

    if (!resources.length) {
      var emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.textContent = mode === "tafsir" ? "Bu dilde tefsir yok" : "Arapça orijinal";
      select.appendChild(emptyOption);
      select.disabled = true;
      field.classList.add("is-disabled");
      return null;
    }

    select.disabled = false;
    field.classList.remove("is-disabled");

    resources.forEach(function (resource) {
      var option = document.createElement("option");
      option.value = String(resource.id);
      option.textContent = resource.source;
      select.appendChild(option);
    });

    if (current) select.value = String(current.id);
    return current;
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

  async function fetchExternalJson(url) {
    var response = await fetch(url, {
      headers: { accept: "application/json" },
    });
    var payload = await response.json().catch(function () {
      return null;
    });

    if (!response.ok || !payload) {
      throw new Error("Harici içerik şu anda alınamadı.");
    }

    return payload;
  }

  function quranApiUrl(path, params) {
    var url = new URL(QURAN_API_BASE_URL.replace(/\/$/, "") + path);
    Object.keys(params || {}).forEach(function (key) {
      if (params[key]) url.searchParams.set(key, params[key]);
    });
    return url.toString();
  }

  function htmlToText(value) {
    var element = document.createElement("div");
    var html = String(value || "")
      .replace(/<sup\b[^>]*>.*?<\/sup>/gis, "")
      .replace(/<(br|\/p|\/div|\/h[1-6]|\/li)\b[^>]*>/gi, " ");
    element.innerHTML = html;
    return (element.textContent || "").replace(/\s+/g, " ").trim();
  }

  function quranChapterLanguage(language) {
    return language === "de" || language === "ar" ? "en" : language;
  }

  async function fetchQuranChapter(surahNumber, language) {
    var payload = await fetchExternalJson(
      quranApiUrl("/chapters/" + surahNumber, { language: quranChapterLanguage(language) })
    );
    return payload.chapter || {};
  }

  async function fetchQuranArabicAyah(verseKey) {
    var payload = await fetchExternalJson(
      quranApiUrl("/quran/verses/uthmani", { verse_key: verseKey })
    );
    return payload.verses && payload.verses[0] ? payload.verses[0].text_uthmani : "";
  }

  async function fetchQuranArabicSurah(surahNumber) {
    var payload = await fetchExternalJson(
      quranApiUrl("/quran/verses/uthmani", { chapter_number: surahNumber })
    );
    return payload.verses || [];
  }

  async function fetchQuranAyahBase(surahNumber, ayahNumber, language) {
    var verseKey = surahNumber + ":" + ayahNumber;
    var chapter = await fetchQuranChapter(surahNumber, language);
    var arabicText = await fetchQuranArabicAyah(verseKey);

    return {
      verseKey: verseKey,
      surahNumber: Number(surahNumber),
      surahName: chapter.translated_name && chapter.translated_name.name ? chapter.translated_name.name : chapter.name_simple,
      surahNameArabic: chapter.name_arabic || "",
      ayahNumber: Number(ayahNumber),
      language: language,
      arabicText: arabicText,
    };
  }

  async function fetchQuranSurahBase(surahNumber, language) {
    var chapter = await fetchQuranChapter(surahNumber, language);
    var arabicVerses = await fetchQuranArabicSurah(surahNumber);

    return {
      language: language,
      surah: {
        number: Number(surahNumber),
        name: chapter.translated_name && chapter.translated_name.name ? chapter.translated_name.name : chapter.name_simple,
        nameArabic: chapter.name_arabic || "",
        verseCount: chapter.verses_count || arabicVerses.length,
      },
      verses: arabicVerses.map(function (verse) {
        var split = String(verse.verse_key || "").split(":");
        return {
          verseKey: verse.verse_key,
          surahNumber: Number(split[0] || surahNumber),
          ayahNumber: Number(split[1] || 0),
          arabicText: verse.text_uthmani || "",
        };
      }),
    };
  }

  async function fetchTranslationForAyah(verseKey, resource) {
    if (!resource || !resource.id) return null;

    var payload = await fetchExternalJson(
      quranApiUrl("/quran/translations/" + resource.id, { verse_key: verseKey })
    );
    var text = payload.translations && payload.translations[0]
      ? htmlToText(payload.translations[0].text)
      : "";

    return text ? { text: text, source: resource.source } : null;
  }

  async function fetchTranslationsForSurah(surahNumber, resource) {
    if (!resource || !resource.id) return null;

    var payload = await fetchExternalJson(
      quranApiUrl("/quran/translations/" + resource.id, { chapter_number: surahNumber })
    );
    var translations = (payload.translations || []).map(function (entry) {
      return htmlToText(entry.text);
    });

    return translations.length ? { translations: translations, source: resource.source } : null;
  }

  async function fetchTafsirForAyah(verseKey, resource, localExplanation) {
    if (resource && resource.local && localExplanation) {
      return { text: localExplanation, source: resource.source };
    }

    if (!resource || !resource.id) return null;

    var payload = await fetchExternalJson(
      quranApiUrl("/tafsirs/" + resource.id + "/by_ayah/" + verseKey, {})
    );
    var tafsir = payload.tafsir;
    var text = tafsir ? htmlToText(tafsir.text) : "";
    var source = tafsir && tafsir.resource_name ? tafsir.resource_name : resource.source;

    return text ? { text: text, source: source } : null;
  }

  async function fetchTafsirsForSurah(surahNumber, resource) {
    if (!resource || !resource.id) return null;
    if (resource.local) return null;

    var payload = await fetchExternalJson(
      quranApiUrl("/tafsirs/" + resource.id + "/by_chapter/" + surahNumber, { per_page: 300 })
    );
    var byVerseKey = {};

    (payload.tafsirs || []).forEach(function (entry) {
      var text = htmlToText(entry.text);
      if (entry.verse_key && text) byVerseKey[entry.verse_key] = text;
    });

    return Object.keys(byVerseKey).length
      ? { byVerseKey: byVerseKey, source: resource.source }
      : null;
  }

  function setContentText(id, value, fallback) {
    setText(id, value || fallback || "");
  }

  function formatSurahHeading(name, language) {
    if (!name) return "";
    if (language === "tr") return name + " Suresi";
    if (language === "ar") return name;
    return "Surah " + name;
  }

  async function loadAyahContent(context, language, mode, resource) {
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

    var data = null;
    try {
      data = await fetchApiJson("/api/quran/ayah/" + split[0] + "/" + split[1], params);
    } catch (error) {
      data = await fetchQuranAyahBase(split[0], split[1], language);
    }
    var translationText = data.translationText || data.translation || "";
    var translationSource = data.translationSource || "";
    var translationResource = mode === "translation" ? resource : getDefaultResource(language, "translation");

    if (language !== "ar" && translationResource) {
      try {
        var fallbackTranslation = await fetchTranslationForAyah(data.verseKey, translationResource);
        if (fallbackTranslation) {
          translationText = fallbackTranslation.text;
          translationSource = fallbackTranslation.source;
        }
      } catch (error) {
        // Keep Vaktim data visible even if the secondary translation provider is unavailable.
      }
    }

    if (data.surahName && data.verseKey) {
      document.title = data.surahName + " " + data.verseKey + " | Vaktim";
      setText("pageTitle", data.surahName + " " + data.verseKey);
      setText("leadText", "Arapça metin, meal ve kısa açıklamayı tek ekranda sakin bir okuma düzeniyle görebilirsin.");
    }

    setContentText("arabicText", data.arabicText, "Arapça metin şu anda alınamadı.");
    setContentText("translationText", translationText, language === "ar" ? "Arapça orijinal metin yukarıda yer alıyor. Meal için başka bir dil seçebilirsin." : "Bu dil için meal şu anda alınamadı.");
    setContentText("translationSource", translationSource ? "Kaynak: " + translationSource : "");

    if (mode === "tafsir") {
      var tafsirResult = null;
      try {
        tafsirResult = await fetchTafsirForAyah(data.verseKey, resource, data.explanationSummary || data.explanation);
      } catch (error) {
        tafsirResult = null;
      }

      setText("explanationTitle", "Tefsir");
      setContentText(
        "explanationText",
        tafsirResult && tafsirResult.text,
        "Bu dil için tefsir şu anda webde hazır değil. Meal okumaya devam edebilir veya ayeti Vaktim uygulamasında açabilirsin."
      );
      setContentText("explanationSource", tafsirResult && tafsirResult.source ? "Kaynak: " + tafsirResult.source : "");
      showElement("explanationBlock", true);
    } else {
      setContentText("explanationText", "");
      setContentText("explanationSource", "");
      showElement("explanationBlock", false);
    }

    setStatus(data.surahName ? data.surahName + " " + data.verseKey : data.verseKey);
    setPanelVisible("ayahPanel", true);
  }

  function renderVerseNotice(message) {
    var list = document.getElementById("verseList");
    if (!list) return;
    list.textContent = "";

    var item = document.createElement("div");
    item.className = "verse-item";

    var text = document.createElement("div");
    text.className = "translation-text";
    text.textContent = message;

    item.appendChild(text);
    list.appendChild(item);
  }

  function renderVerseList(verses, options) {
    var list = document.getElementById("verseList");
    var mode = options && options.mode === "tafsir" ? "tafsir" : "translation";
    var source = options && options.source ? options.source : "";
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
      translation.className = mode === "tafsir" ? "explanation-text" : "translation-text";
      translation.textContent = mode === "tafsir"
        ? (verse.tafsirText || "")
        : (verse.translationText || verse.translation || "");

      var sourceText = document.createElement("div");
      sourceText.className = "source-text";
      sourceText.textContent = source ? "Kaynak: " + source : "";

      item.appendChild(key);
      if (arabic.textContent) item.appendChild(arabic);
      if (translation.textContent) item.appendChild(translation);
      if (translation.textContent && sourceText.textContent) item.appendChild(sourceText);
      list.appendChild(item);
    });
  }

  async function loadSurahContent(context, language, mode, resource) {
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

    var data = null;
    try {
      data = await fetchApiJson("/api/quran/surah/" + surah[0], params);
    } catch (error) {
      data = await fetchQuranSurahBase(surah[0], language);
    }
    var verses = data.verses || [];
    var contentSource = "";
    var translationResource = mode === "translation" ? resource : getDefaultResource(language, "translation");

    if (data.surah && data.surah.name) {
      var surahHeading = formatSurahHeading(data.surah.name, language);
      document.title = surahHeading + " | Vaktim";
      setText("pageTitle", surahHeading);
      setText("leadText", data.surah.verseCount + " ayeti Arapça metin ve meal ile birlikte okuyabilirsin.");
    }

    if (mode === "tafsir") {
      var tafsirPack = null;
      try {
        tafsirPack = await fetchTafsirsForSurah(surah[0], resource);
      } catch (error) {
        tafsirPack = null;
      }

      if (!tafsirPack) {
        renderVerseNotice("Bu dil için sure seviyesinde tefsir şu anda webde hazır değil. Meal sekmesine dönebilir veya ayeti Vaktim uygulamasında açabilirsin.");
        setStatus(data.surah && data.surah.name ? data.surah.name + " - tefsir hazırlanıyor" : context.target);
        setPanelVisible("surahPanel", true);
        return;
      }

      verses.forEach(function (verse) {
        verse.tafsirText = tafsirPack.byVerseKey[verse.verseKey] || "";
      });
      contentSource = tafsirPack.source;
    } else if (language !== "ar" && translationResource) {
      try {
        var translationPack = await fetchTranslationsForSurah(surah[0], translationResource);
        if (translationPack) {
          verses.forEach(function (verse, index) {
            verse.translationText = translationPack.translations[index] || verse.translationText || "";
          });
          contentSource = translationPack.source;
        }
      } catch (error) {
        contentSource = verses.some(function (verse) {
          return verse.translationText || verse.translation;
        }) ? "Vaktim" : "";
      }
    } else if (language === "tr") {
      contentSource = "Vaktim / Diyanet İşleri Başkanlığı";
    }

    renderVerseList(verses, { mode: mode, source: contentSource });
    setStatus(data.surah && data.surah.name ? data.surah.name + " - " + data.surah.verseCount + " ayet" : context.target);
    setPanelVisible("surahPanel", true);
  }

  async function loadDynamicContent(context, language, mode, resource) {
    var reader = document.getElementById("reader");
    if (!reader || (context.kind !== "ayah" && context.kind !== "surah")) return;

    reader.hidden = false;
    var selectedResource = resource || getCurrentResource(language, mode);

    try {
      if (context.kind === "ayah") {
        await loadAyahContent(context, language, mode, selectedResource);
      } else {
        await loadSurahContent(context, language, mode, selectedResource);
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
    var contentMode = getCurrentContentMode();
    var landingUrl = buildLandingUrl(params);
    var appLink = withSource(context.appPath, params);
    var languageSelect = document.getElementById("languageSelect");
    var contentModeSelect = document.getElementById("contentModeSelect");
    var resourceSelect = document.getElementById("resourceSelect");
    var selectedResource = populateResourceSelect(language, contentMode);

    setHref("appLink", appLink);
    setHref("landingLink", landingUrl);
    setHref("headerHomeLink", landingUrl);
    setHref("quranLink", buildQuranUrl(language));

    if (languageSelect) {
      languageSelect.value = language;
      languageSelect.addEventListener("change", function () {
        var nextLanguage = normalizeLanguage(languageSelect.value);
        var nextMode = getCurrentContentMode();
        var nextResource = getDefaultResource(nextLanguage, nextMode);
        var nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set("lang", nextLanguage);
        updateResourceParam(nextUrl, nextMode, nextResource);
        window.history.replaceState(null, "", nextUrl.toString());
        setHref("quranLink", buildQuranUrl(nextLanguage));
        populateResourceSelect(nextLanguage, nextMode);
        loadDynamicContent(context, nextLanguage, nextMode, nextResource);
      });
    }

    if (contentModeSelect) {
      contentModeSelect.value = contentMode;
      contentModeSelect.addEventListener("change", function () {
        var nextMode = contentModeSelect.value === "tafsir" ? "tafsir" : "translation";
        var nextUrl = new URL(window.location.href);
        if (nextMode === "tafsir") {
          nextUrl.searchParams.set("mode", "tafsir");
        } else {
          nextUrl.searchParams.delete("mode");
        }
        var nextResource = getDefaultResource(getCurrentLanguage(), nextMode);
        updateResourceParam(nextUrl, nextMode, nextResource);
        window.history.replaceState(null, "", nextUrl.toString());
        populateResourceSelect(getCurrentLanguage(), nextMode);
        loadDynamicContent(context, getCurrentLanguage(), nextMode, nextResource);
      });
    }

    if (resourceSelect) {
      resourceSelect.addEventListener("change", function () {
        var mode = getCurrentContentMode();
        var languageForResource = getCurrentLanguage();
        var nextResource = findResource(languageForResource, mode, resourceSelect.value);
        var nextUrl = new URL(window.location.href);
        updateResourceParam(nextUrl, mode, nextResource);
        window.history.replaceState(null, "", nextUrl.toString());
        populateResourceSelect(languageForResource, mode);
        loadDynamicContent(context, languageForResource, mode, nextResource);
      });
    }

    if (context.kind === "ayah") {
      document.title = context.target + " | Vaktim'de Aç";
      setText("kicker", "Kur'an bağlantısı");
      setText("pageTitle", context.title);
      setText("leadText", "Bu ayeti Vaktim uygulamasında meal, notlar ve manevi okuma akışıyla açabilirsin.");
      loadDynamicContent(context, language, contentMode, selectedResource);
      return;
    }

    if (context.kind === "surah") {
      document.title = context.target + " | Vaktim'de Aç";
      setText("kicker", "Sure bağlantısı");
      setText("pageTitle", context.title);
      setText("leadText", "Bu sureyi Vaktim uygulamasında düzenli okuma ve takip deneyimiyle açabilirsin.");
      loadDynamicContent(context, language, contentMode, selectedResource);
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
