(function () {
  var MAX_FIELD_LENGTH = 80;
  var API_BASE_URLS = ["https://mcp.vaktim.app", "https://api.vaktim.app"];
  var QURAN_API_BASE_URL = "https://api.quran.com/api/v4";
  var AUDIO_CDN_BASE_URL = "https://verses.quran.foundation/";
  var AUDIO_ALLOWED_HOSTS = ["verses.quran.foundation", "verses.quran.com", "audio.qurancdn.com"];
  var AUDIO_FETCH_TIMEOUT_MS = 10000;
  var DEFAULT_RECITATION = {
    id: 7,
    name: "Mishari Rashid al-Afasy",
    source: "Vaktim.app / Quran Foundation Audio",
  };
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
      { id: "vaktim-tr-summary", source: "Elmalılı Hamdi Yazır özeti", local: true },
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
  var audioCacheByVerseKey = {};
  var audioCacheBySurah = {};
  var audioState = {
    element: null,
    currentKey: "",
    currentScope: "",
    queue: [],
    queueIndex: -1,
    autoAdvance: false,
    loading: false,
    lastScrolledKey: "",
    requestId: 0,
    abortController: null,
  };
  var TAJWEED_RULE_NAMES = {
    end: "Ayet sonu",
    ham_wasl: "Hemzetu'l vasl",
    ikhf: "İhfa",
    ikhf_shfw: "İhfa şefevî",
    iqlb: "İklab",
    idgh_ghn: "Ğunneli idğam",
    idgh_w_ghn: "Ğunnesiz idğam",
    idgh_mus: "İdğam",
    idghm_shfw: "İdğam şefevî",
    laam_shamsiyah: "Şemsî lam",
    madda_necessary: "Meddi lazım",
    madda_obligatory: "Meddi vacip",
    madda_permissible: "Meddi caiz",
    madda_normal: "Tabii med",
    qlq: "Kalkale",
    slnt: "Okunmayan harf",
    ghn: "Ğunne",
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

  function normalizeScript(value) {
    return String(value || "").toLowerCase() === "tajweed" ? "tajweed" : "uthmani";
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

  function getCurrentQuranScript() {
    var params = new URLSearchParams(window.location.search);
    return normalizeScript(params.get("script"));
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

  function updateScriptParam(url, script) {
    var normalized = normalizeScript(script);
    if (normalized === "tajweed") {
      url.searchParams.set("script", normalized);
    } else {
      url.searchParams.delete("script");
    }
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

  function setLoading(visible, message) {
    var loader = document.getElementById("readerLoading");
    if (!loader) return;
    var label = loader.querySelector("span");
    if (label && message) label.textContent = message;
    loader.classList.toggle("is-visible", Boolean(visible));
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

  async function fetchExternalJson(url, options) {
    var requestOptions = options || {};
    var fetchOptions = {
      headers: { accept: "application/json" },
    };
    var controller = null;
    var timeoutId = null;
    var relayAbort = null;
    var timedOut = false;

    if ((requestOptions.timeoutMs || requestOptions.signal) && typeof AbortController !== "undefined") {
      controller = new AbortController();
      fetchOptions.signal = controller.signal;

      if (requestOptions.signal) {
        if (requestOptions.signal.aborted) {
          controller.abort();
        } else {
          relayAbort = function () {
            controller.abort();
          };
          requestOptions.signal.addEventListener("abort", relayAbort, { once: true });
        }
      }

      if (requestOptions.timeoutMs) {
        timeoutId = setTimeout(function () {
          timedOut = true;
          controller.abort();
        }, requestOptions.timeoutMs);
      }
    } else if (requestOptions.signal) {
      fetchOptions.signal = requestOptions.signal;
    }

    var response;
    var payload;
    try {
      response = await fetch(url, fetchOptions);
      payload = await response.json().catch(function () {
        return null;
      });
    } catch (error) {
      if (timedOut) {
        throw new Error(requestOptions.timeoutMessage || "Harici içerik zaman aşımına uğradı.");
      }
      if (requestOptions.signal && requestOptions.signal.aborted) {
        var abortError = new Error("İstek iptal edildi.");
        abortError.name = "AbortError";
        throw abortError;
      }
      throw error;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      if (relayAbort && requestOptions.signal) {
        requestOptions.signal.removeEventListener("abort", relayAbort);
      }
    }

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

  function abortAudioRequest() {
    if (audioState.abortController) {
      audioState.abortController.abort();
      audioState.abortController = null;
    }
  }

  function cancelAudioRequest() {
    abortAudioRequest();
    audioState.requestId += 1;
  }

  function beginAudioRequest() {
    abortAudioRequest();
    audioState.requestId += 1;
    audioState.abortController = typeof AbortController !== "undefined" ? new AbortController() : null;
    return {
      id: audioState.requestId,
      signal: audioState.abortController ? audioState.abortController.signal : null,
    };
  }

  function isCurrentAudioRequest(request) {
    return Boolean(request && request.id === audioState.requestId && !(request.signal && request.signal.aborted));
  }

  function finishAudioRequest(request) {
    if (!isCurrentAudioRequest(request)) return;
    audioState.abortController = null;
  }

  function isAbortError(error) {
    return Boolean(error && (error.name === "AbortError" || error.message === "İstek iptal edildi."));
  }

  function normalizeVerseKey(value) {
    var text = String(value || "").trim();
    return /^\d{1,3}:\d{1,3}$/.test(text) ? text : "";
  }

  function splitVerseKey(verseKey) {
    var normalizedKey = normalizeVerseKey(verseKey);
    if (!normalizedKey) return null;
    var parts = normalizedKey.split(":").map(function (part) {
      return Number(part);
    });
    if (parts.length !== 2 || !Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) return null;
    if (parts[0] <= 0 || parts[0] > 114 || parts[1] <= 0) return null;
    return {
      verseKey: normalizedKey,
      surahNumber: parts[0],
      ayahNumber: parts[1],
    };
  }

  function verseKeyBelongsToSurah(verseKey, surahNumber) {
    var normalizedKey = normalizeVerseKey(verseKey);
    var normalizedSurah = Number(surahNumber || 0);
    if (!normalizedKey || !Number.isFinite(normalizedSurah) || normalizedSurah <= 0) return false;
    return normalizedKey.split(":")[0] === String(normalizedSurah);
  }

  function resolveAudioUrl(value) {
    if (!value) return "";
    try {
      var raw = String(value).trim();
      var url = /^https:\/\//i.test(raw)
        ? new URL(raw)
        : new URL(raw.replace(/^\/+/, ""), AUDIO_CDN_BASE_URL);

      if (url.protocol !== "https:") return "";
      if (AUDIO_ALLOWED_HOSTS.indexOf(url.hostname) === -1) return "";
      return url.toString();
    } catch (error) {
      return "";
    }
  }

  function buildAudioEntryFromVerseKey(verseKey) {
    var parsed = splitVerseKey(verseKey);
    if (!parsed) return null;
    if (audioCacheByVerseKey[parsed.verseKey]) return audioCacheByVerseKey[parsed.verseKey];

    var path = "Alafasy/mp3/"
      + String(parsed.surahNumber).padStart(3, "0")
      + String(parsed.ayahNumber).padStart(3, "0")
      + ".mp3";
    var audioUrl = resolveAudioUrl(path);
    if (!audioUrl) return null;

    var entry = {
      verseKey: parsed.verseKey,
      url: audioUrl,
      duration: 0,
    };
    audioCacheByVerseKey[parsed.verseKey] = entry;
    return entry;
  }

  function buildAudioQueueFromVerses(surahNumber, verses) {
    var key = String(surahNumber || "");
    if (!/^\d{1,3}$/.test(key)) throw new Error("Ses için sure numarası geçersiz.");
    if (audioCacheBySurah[key]) return audioCacheBySurah[key];

    var queue = (verses || []).map(function (verse) {
      var verseKey = normalizeVerseKey(verse && verse.verseKey);
      if (!verseKey || !verseKeyBelongsToSurah(verseKey, surahNumber)) return null;
      return buildAudioEntryFromVerseKey(verseKey);
    }).filter(Boolean);

    if (!queue.length) throw new Error("Sure sesi şu anda alınamadı.");
    audioCacheBySurah[key] = queue;
    return queue;
  }

  function formatDuration(value) {
    var seconds = Number(value || 0);
    if (!Number.isFinite(seconds) || seconds <= 0) return "";
    var minutes = Math.floor(seconds / 60);
    var rest = Math.floor(seconds % 60);
    return minutes + ":" + String(rest).padStart(2, "0");
  }

  function getAudioElement() {
    if (audioState.element) return audioState.element;

    var audio = new Audio();
    audio.preload = "none";
    audio.addEventListener("timeupdate", updateAudioProgress);
    audio.addEventListener("ended", handleAudioEnded);
    audio.addEventListener("error", handleAudioError);
    audioState.element = audio;
    return audio;
  }

  function isAudioPlaying() {
    var audio = getAudioElement();
    return Boolean(audio.src && !audio.paused && !audio.ended);
  }

  function setAudioStatus(id, value) {
    setText(id, value || "");
  }

  function setAudioProgress(id, current, duration) {
    var element = document.getElementById(id);
    if (!element) return;

    var percent = duration > 0 ? Math.max(0, Math.min(100, (current / duration) * 100)) : 0;
    var fill = element.querySelector(".audio-bar-fill");
    var time = element.querySelector(".audio-time");
    if (fill) fill.style.width = percent + "%";
    if (time) {
      var currentText = formatDuration(current);
      var durationText = formatDuration(duration);
      time.textContent = durationText ? currentText + " / " + durationText : currentText;
    }
  }

  function setMiniPlayerVisible(visible) {
    var miniPlayer = document.getElementById("audioMiniPlayer");
    if (!miniPlayer) return;
    if (visible) {
      miniPlayer.dataset.visible = "true";
      miniPlayer.hidden = false;
      window.requestAnimationFrame(function () {
        if (miniPlayer.dataset.visible === "true") miniPlayer.classList.add("is-visible");
      });
    } else {
      miniPlayer.dataset.visible = "false";
      miniPlayer.classList.remove("is-visible");
      miniPlayer.hidden = true;
    }
    document.body.classList.toggle("has-mini-player", Boolean(visible));
  }

  function updateMiniPlayer() {
    var hasAudio = Boolean(audioState.currentKey && getAudioElement().src);
    setMiniPlayerVisible(hasAudio);
    if (!hasAudio) return;

    var audio = getAudioElement();
    var playing = isAudioPlaying();
    var isSurahQueue = audioState.currentScope === "surah" && audioState.queue.length > 0;
    setText("miniAudioTitle", isSurahQueue ? audioState.currentKey : audioState.currentKey + " ayet sesi");
    setText("miniAudioMeta", DEFAULT_RECITATION.name + " - " + DEFAULT_RECITATION.source);
    setText("miniAudioStatus", audio.paused ? audioState.currentKey + " duraklatıldı." : audioState.currentKey + " oynatılıyor.");
    setAudioProgress("miniAudioProgress", audio.currentTime, audio.duration);

    var toggleButton = document.getElementById("miniAudioToggle");
    if (toggleButton) {
      toggleButton.disabled = audioState.loading;
      toggleButton.textContent = playing ? "Duraklat" : "Devam et";
    }

    var previousButton = document.getElementById("miniAudioPrev");
    var nextButton = document.getElementById("miniAudioNext");
    if (previousButton) previousButton.disabled = audioState.loading || !isSurahQueue || audioState.queueIndex <= 0;
    if (nextButton) nextButton.disabled = audioState.loading || !isSurahQueue || audioState.queueIndex >= audioState.queue.length - 1;
  }

  function scrollActiveVerseIntoView(verseKey) {
    if (audioState.currentScope !== "surah" || !verseKey || audioState.lastScrolledKey === verseKey) return;
    var activeItem = null;
    document.querySelectorAll(".verse-item").forEach(function (item) {
      if (item.dataset.verseKey === verseKey) activeItem = item;
    });
    if (!activeItem) return;

    var rect = activeItem.getBoundingClientRect();
    var topSafeArea = 108;
    var bottomSafeArea = 160;
    var alreadyComfortable = rect.top >= topSafeArea && rect.bottom <= window.innerHeight - bottomSafeArea;
    if (alreadyComfortable) {
      audioState.lastScrolledKey = verseKey;
      return;
    }

    audioState.lastScrolledKey = verseKey;
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(function () {
      activeItem.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
    }, 80);
  }

  function updateAudioProgress() {
    var audio = getAudioElement();
    setAudioProgress("ayahAudioProgress", audio.currentTime, audio.duration);
    setAudioProgress("surahAudioProgress", audio.currentTime, audio.duration);
    setAudioProgress("miniAudioProgress", audio.currentTime, audio.duration);
  }

  function setAudioLoading(scope, loading, message) {
    audioState.loading = Boolean(loading);
    var buttonId = scope === "surah" ? "surahAudioButton" : "ayahAudioButton";
    var button = document.getElementById(buttonId);
    if (button) {
      button.disabled = Boolean(loading);
      if (message) button.textContent = message;
    }

    document.querySelectorAll(".verse-audio-button").forEach(function (verseButton) {
      verseButton.disabled = Boolean(loading);
    });

    if (message) {
      setAudioStatus(scope === "surah" ? "surahAudioStatus" : "ayahAudioStatus", message);
    }
  }

  function updateAudioButtons() {
    var playing = isAudioPlaying();
    var currentKey = audioState.currentKey;

    var ayahButton = document.getElementById("ayahAudioButton");
    if (ayahButton && ayahButton.dataset.verseKey) {
      var ayahIsCurrent = currentKey === ayahButton.dataset.verseKey;
      ayahButton.disabled = audioState.loading;
      ayahButton.setAttribute("aria-pressed", ayahIsCurrent && playing ? "true" : "false");
      ayahButton.textContent = ayahIsCurrent ? (playing ? "Duraklat" : "Devam et") : "Ayeti dinle";
    }

    var surahButton = document.getElementById("surahAudioButton");
    if (surahButton && surahButton.dataset.surahNumber) {
      var surahIsCurrent = audioState.currentScope === "surah" && audioState.queue.length > 0;
      surahButton.disabled = audioState.loading;
      surahButton.setAttribute("aria-pressed", surahIsCurrent && playing ? "true" : "false");
      surahButton.textContent = surahIsCurrent ? (playing ? "Duraklat" : "Devam et") : "Sureyi dinle";
    }

    var previousButton = document.getElementById("surahAudioPrev");
    var nextButton = document.getElementById("surahAudioNext");
    if (previousButton) previousButton.disabled = audioState.loading || audioState.queueIndex <= 0 || audioState.currentScope !== "surah";
    if (nextButton) nextButton.disabled = audioState.loading || audioState.queueIndex < 0 || audioState.queueIndex >= audioState.queue.length - 1 || audioState.currentScope !== "surah";

    document.querySelectorAll(".verse-audio-button").forEach(function (button) {
      var active = currentKey && button.dataset.verseKey === currentKey;
      button.disabled = audioState.loading;
      button.classList.toggle("is-active", Boolean(active && playing));
      button.setAttribute("aria-pressed", active && playing ? "true" : "false");
      button.textContent = active ? (playing ? "Duraklat" : "Devam et") : "Dinle";
    });

    document.querySelectorAll(".verse-item").forEach(function (item) {
      item.classList.toggle("is-audio-active", item.dataset.verseKey === currentKey && playing);
    });

    updateMiniPlayer();
  }

  function setCurrentAudioText(entry) {
    var title = entry && entry.verseKey ? entry.verseKey : "Dinleme";
    var meta = DEFAULT_RECITATION.name + " - " + DEFAULT_RECITATION.source;
    setText("ayahAudioTitle", title);
    setText("ayahAudioMeta", meta);
    setText("surahAudioTitle", audioState.currentScope === "surah" ? title + " oynatılıyor" : "Sure dinleme");
    setText("surahAudioMeta", meta);
  }

  function resetAudioUi() {
    cancelAudioRequest();
    var audio = getAudioElement();
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    audioState.currentKey = "";
    audioState.currentScope = "";
    audioState.queue = [];
    audioState.queueIndex = -1;
    audioState.autoAdvance = false;
    audioState.loading = false;
    audioState.lastScrolledKey = "";
    setAudioProgress("ayahAudioProgress", 0, 0);
    setAudioProgress("surahAudioProgress", 0, 0);
    setAudioProgress("miniAudioProgress", 0, 0);
    setAudioStatus("ayahAudioStatus", "Dinlemek için ayet sesini başlat.");
    setAudioStatus("surahAudioStatus", "Dinlemek için sure sesini başlat.");
    updateAudioButtons();
  }

  function normalizedAudioEntry(entry) {
    var verseKey = normalizeVerseKey(entry && entry.verse_key ? entry.verse_key : entry && entry.verseKey);
    var audioUrl = resolveAudioUrl(entry && entry.url);
    if (!verseKey || !audioUrl) return null;
    return {
      verseKey: verseKey,
      url: audioUrl,
      duration: Number(entry.duration || 0),
    };
  }

  async function fetchAyahAudio(verseKey, request) {
    var normalizedKey = normalizeVerseKey(verseKey);
    if (!normalizedKey) throw new Error("Ses için ayet referansı geçersiz.");
    if (audioCacheByVerseKey[normalizedKey]) return audioCacheByVerseKey[normalizedKey];

    var audioUrl = quranApiUrl("/recitations/" + DEFAULT_RECITATION.id + "/by_ayah/" + encodeURIComponent(normalizedKey), {
      fields: "verse_key,url,duration",
      per_page: "1",
    });
    var payload = await fetchExternalJson(audioUrl, {
      signal: request && request.signal,
      timeoutMs: AUDIO_FETCH_TIMEOUT_MS,
      timeoutMessage: "Ses isteği zaman aşımına uğradı. Lütfen tekrar deneyin.",
    });
    var entry = normalizedAudioEntry(payload.audio_files && payload.audio_files[0]);
    if (!entry) throw new Error("Ses dosyası şu anda alınamadı.");
    audioCacheByVerseKey[normalizedKey] = entry;
    return entry;
  }

  async function fetchSurahAudio(surahNumber, request) {
    var key = String(surahNumber || "");
    if (!/^\d{1,3}$/.test(key)) throw new Error("Ses için sure numarası geçersiz.");
    if (audioCacheBySurah[key]) return audioCacheBySurah[key];

    var page = 1;
    var entries = [];
    var guard = 0;
    do {
      var audioUrl = quranApiUrl("/recitations/" + DEFAULT_RECITATION.id + "/by_chapter/" + key, {
        fields: "verse_key,url,duration",
        per_page: "50",
        page: String(page),
      });
      var payload = await fetchExternalJson(audioUrl, {
        signal: request && request.signal,
        timeoutMs: AUDIO_FETCH_TIMEOUT_MS,
        timeoutMessage: "Sure sesi zaman aşımına uğradı. Lütfen tekrar deneyin.",
      });
      (payload.audio_files || []).forEach(function (entry) {
        var normalized = normalizedAudioEntry(entry);
        if (normalized) {
          entries.push(normalized);
          audioCacheByVerseKey[normalized.verseKey] = normalized;
        }
      });
      page = payload.pagination && payload.pagination.next_page ? Number(payload.pagination.next_page) : null;
      guard += 1;
    } while (page && guard < 10);

    if (!entries.length) throw new Error("Sure sesi şu anda alınamadı.");
    audioCacheBySurah[key] = entries;
    return entries;
  }

  async function playAudioEntry(entry, scope, queue, queueIndex, autoAdvance, request) {
    if (request && !isCurrentAudioRequest(request)) return;
    var audio = getAudioElement();
    audioState.currentKey = entry.verseKey;
    audioState.currentScope = scope;
    audioState.queue = queue || [entry];
    audioState.queueIndex = Number.isFinite(queueIndex) ? queueIndex : 0;
    audioState.autoAdvance = Boolean(autoAdvance);
    setCurrentAudioText(entry);
    setAudioStatus(scope === "surah" ? "surahAudioStatus" : "ayahAudioStatus", entry.verseKey + " yükleniyor...");
    updateAudioButtons();

    audio.src = entry.url;
    audio.load();

    try {
      await audio.play();
      if (request && !isCurrentAudioRequest(request)) return;
      scrollActiveVerseIntoView(entry.verseKey);
      setAudioStatus(scope === "surah" ? "surahAudioStatus" : "ayahAudioStatus", entry.verseKey + " oynatılıyor.");
    } catch (error) {
      if (request && !isCurrentAudioRequest(request)) return;
      setAudioStatus(scope === "surah" ? "surahAudioStatus" : "ayahAudioStatus", "Tarayıcı oynatmayı başlatamadı. Lütfen tekrar deneyin.");
    } finally {
      updateAudioButtons();
    }
  }

  async function toggleAudio(entry, scope, queue, queueIndex, autoAdvance, request) {
    if (request && !isCurrentAudioRequest(request)) return;
    var audio = getAudioElement();
    var requestedQueueLength = Array.isArray(queue) ? queue.length : 1;
    var samePlayback = audioState.currentKey === entry.verseKey
      && audio.src
      && audioState.currentScope === scope
      && audioState.autoAdvance === Boolean(autoAdvance)
      && audioState.queue.length === requestedQueueLength;

    if (samePlayback) {
      if (audio.paused) {
        await audio.play().catch(function () {
          setAudioStatus(scope === "surah" ? "surahAudioStatus" : "ayahAudioStatus", "Tarayıcı oynatmayı başlatamadı. Lütfen tekrar deneyin.");
        });
        if (!audio.paused) {
          scrollActiveVerseIntoView(entry.verseKey);
          setAudioStatus(scope === "surah" ? "surahAudioStatus" : "ayahAudioStatus", entry.verseKey + " oynatılıyor.");
        }
      } else {
        audio.pause();
        setAudioStatus(scope === "surah" ? "surahAudioStatus" : "ayahAudioStatus", entry.verseKey + " duraklatıldı.");
      }
      updateAudioButtons();
      return;
    }
    await playAudioEntry(entry, scope, queue, queueIndex, autoAdvance, request);
  }

  async function playSingleVerse(verseKey, scope) {
    var normalizedKey = normalizeVerseKey(verseKey);
    if (!normalizedKey) return;
    var request = beginAudioRequest();
    setAudioLoading(scope === "surah" ? "surah" : "ayah", true, "Ses hazırlanıyor...");
    try {
      var entry = buildAudioEntryFromVerseKey(normalizedKey);
      if (!entry) throw new Error("Ses dosyası şu anda alınamadı.");
      if (!isCurrentAudioRequest(request)) return;
      await toggleAudio(entry, scope || "ayah", [entry], 0, false, request);
    } catch (error) {
      if (!isCurrentAudioRequest(request) || isAbortError(error)) return;
      setAudioStatus(scope === "surah" ? "surahAudioStatus" : "ayahAudioStatus", error && error.message ? error.message : "Ses şu anda alınamadı.");
    } finally {
      if (isCurrentAudioRequest(request)) {
        finishAudioRequest(request);
        setAudioLoading(scope === "surah" ? "surah" : "ayah", false);
        updateAudioButtons();
      }
    }
  }

  async function playSurahQueue(surahNumber, verses, startVerseKey) {
    var request = beginAudioRequest();
    setAudioLoading("surah", true, "Sure sesi hazırlanıyor...");
    try {
      var queue = buildAudioQueueFromVerses(surahNumber, verses);
      if (!isCurrentAudioRequest(request)) return;
      var startIndex = startVerseKey
        ? Math.max(0, queue.findIndex(function (entry) { return entry.verseKey === startVerseKey; }))
        : 0;
      if (!isCurrentAudioRequest(request)) return;
      await toggleAudio(queue[startIndex], "surah", queue, startIndex, true, request);
    } catch (error) {
      if (!isCurrentAudioRequest(request) || isAbortError(error)) return;
      setAudioStatus("surahAudioStatus", error && error.message ? error.message : "Sure sesi şu anda alınamadı.");
    } finally {
      if (isCurrentAudioRequest(request)) {
        finishAudioRequest(request);
        setAudioLoading("surah", false);
        updateAudioButtons();
      }
    }
  }

  function playSurahRelative(offset) {
    var nextIndex = audioState.queueIndex + offset;
    if (nextIndex < 0 || nextIndex >= audioState.queue.length) return;
    playAudioEntry(audioState.queue[nextIndex], "surah", audioState.queue, nextIndex, true);
  }

  async function toggleCurrentSurahQueue(surahNumber, verses) {
    var currentEntry = audioState.queue[audioState.queueIndex];
    var sameSurahQueue = audioState.currentScope === "surah"
      && currentEntry
      && verseKeyBelongsToSurah(currentEntry.verseKey, surahNumber);

    if (sameSurahQueue) {
      await toggleAudio(currentEntry, "surah", audioState.queue, audioState.queueIndex, true);
      return;
    }

    await playSurahQueue(surahNumber, verses);
  }

  function handleAudioEnded() {
    if (audioState.autoAdvance && audioState.queueIndex < audioState.queue.length - 1) {
      playSurahRelative(1);
      return;
    }
    setAudioStatus(audioState.currentScope === "surah" ? "surahAudioStatus" : "ayahAudioStatus", "Dinleme tamamlandı.");
    audioState.currentKey = "";
    audioState.currentScope = "";
    audioState.queueIndex = -1;
    audioState.autoAdvance = false;
    updateAudioButtons();
  }

  function handleAudioError() {
    setAudioStatus(audioState.currentScope === "surah" ? "surahAudioStatus" : "ayahAudioStatus", "Ses oynatılırken bir sorun oluştu.");
    updateAudioButtons();
  }

  function getCurrentAudioEntry() {
    if (audioState.queueIndex >= 0 && audioState.queue[audioState.queueIndex]) return audioState.queue[audioState.queueIndex];
    return audioState.currentKey ? audioCacheByVerseKey[audioState.currentKey] : null;
  }

  function configureMiniPlayerControls() {
    var toggleButton = document.getElementById("miniAudioToggle");
    var previousButton = document.getElementById("miniAudioPrev");
    var nextButton = document.getElementById("miniAudioNext");

    if (toggleButton && !toggleButton.dataset.bound) {
      toggleButton.dataset.bound = "true";
      toggleButton.onclick = function () {
        var entry = getCurrentAudioEntry();
        if (!entry) return;
        toggleAudio(
          entry,
          audioState.currentScope || "ayah",
          audioState.queue.length ? audioState.queue : [entry],
          audioState.queueIndex >= 0 ? audioState.queueIndex : 0,
          audioState.autoAdvance
        );
      };
    }

    if (previousButton && !previousButton.dataset.bound) {
      previousButton.dataset.bound = "true";
      previousButton.onclick = function () {
        playSurahRelative(-1);
      };
    }

    if (nextButton && !nextButton.dataset.bound) {
      nextButton.dataset.bound = "true";
      nextButton.onclick = function () {
        playSurahRelative(1);
      };
    }
  }

  function configureAyahAudio(verseKey) {
    var normalizedKey = normalizeVerseKey(verseKey);
    var button = document.getElementById("ayahAudioButton");
    if (!button) return;
    button.dataset.verseKey = normalizedKey;
    button.disabled = !normalizedKey;
    button.textContent = normalizedKey ? "Ayeti dinle" : "Ses hazır değil";
    button.onclick = function () {
      playSingleVerse(normalizedKey, "ayah");
    };
    setText("ayahAudioTitle", normalizedKey ? normalizedKey + " ayet sesi" : "Ayet sesi");
    setText("ayahAudioMeta", DEFAULT_RECITATION.name + " - " + DEFAULT_RECITATION.source);
    setAudioStatus("ayahAudioStatus", normalizedKey ? "Dinlemek için ayet sesini başlat." : "Ses şu anda hazır değil.");
    updateAudioButtons();
  }

  function configureSurahAudio(surahNumber, verses) {
    var button = document.getElementById("surahAudioButton");
    var previousButton = document.getElementById("surahAudioPrev");
    var nextButton = document.getElementById("surahAudioNext");
    if (!button) return;

    button.dataset.surahNumber = String(surahNumber || "");
    button.disabled = !verses || !verses.length;
    button.textContent = "Sureyi dinle";
    button.onclick = function () {
      toggleCurrentSurahQueue(surahNumber, verses);
    };

    if (previousButton) {
      previousButton.onclick = function () {
        playSurahRelative(-1);
      };
    }
    if (nextButton) {
      nextButton.onclick = function () {
        playSurahRelative(1);
      };
    }

    setText("surahAudioTitle", "Sure dinleme");
    setText("surahAudioMeta", DEFAULT_RECITATION.name + " - " + DEFAULT_RECITATION.source);
    setAudioStatus("surahAudioStatus", verses && verses.length ? "Dinlemek için sure sesini başlat." : "Ses şu anda hazır değil.");
    updateAudioButtons();
  }

  function htmlToText(value) {
    var element = document.createElement("div");
    var html = String(value || "")
      .replace(/<sup\b[^>]*>.*?<\/sup>/gis, "")
      .replace(/<(br|\/p|\/div|\/h[1-6]|\/li)\b[^>]*>/gi, " ");
    element.innerHTML = html;
    return (element.textContent || "").replace(/\s+/g, " ").trim();
  }

  function decodeEntities(value) {
    return String(value || "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'");
  }

  function stripMarkup(value) {
    return decodeEntities(value).replace(/<[^>]*>/g, "");
  }

  function tajweedRuleName(rule) {
    if (TAJWEED_RULE_NAMES[rule]) return TAJWEED_RULE_NAMES[rule];
    return String(rule || "")
      .split(/[_-]+/)
      .filter(Boolean)
      .map(function (part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(" ");
  }

  function normalizeTajweedRule(value) {
    var firstClass = String(value || "").split(/\s+/)[0] || "";
    return firstClass.toLowerCase().replace(/[^a-z0-9_-]/g, "") || "plain";
  }

  function pushTajweedSegment(segments, text, rule) {
    if (!text) return;
    var last = segments[segments.length - 1];
    if (last && last.rule === rule) {
      last.text += text;
      return;
    }
    segments.push({
      text: text,
      rule: rule,
      ruleName: tajweedRuleName(rule),
    });
  }

  function parseTajweedMarkup(markup) {
    if (!markup) return null;
    var regex = /<(tajweed|span)\b[^>]*\bclass=(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>([\s\S]*?)<\/\1>/gi;
    var segments = [];
    var match = null;
    var cursor = 0;

    while ((match = regex.exec(String(markup))) !== null) {
      pushTajweedSegment(segments, stripMarkup(String(markup).slice(cursor, match.index)), "plain");
      pushTajweedSegment(segments, stripMarkup(match[5] || ""), normalizeTajweedRule(match[2] || match[3] || match[4]));
      cursor = match.index + match[0].length;
    }

    pushTajweedSegment(segments, stripMarkup(String(markup).slice(cursor)), "plain");
    segments = segments.filter(function (segment) {
      return segment.text;
    });

    var seen = {};
    var legend = segments.filter(function (segment) {
      if (segment.rule === "plain" || seen[segment.rule]) return false;
      seen[segment.rule] = true;
      return true;
    }).map(function (segment) {
      return { rule: segment.rule, ruleName: segment.ruleName };
    });

    var plainText = segments.map(function (segment) {
      return segment.text;
    }).join("").replace(/\s+/g, " ").trim();

    if (!plainText) return null;
    return {
      script: "tajweed",
      source: "quran.com",
      sourceLabel: "Quran.com Uthmani Tajweed",
      plainText: plainText,
      segments: segments,
      legend: legend,
    };
  }

  function getTajweedText(data) {
    if (!data || !data.tajweedText || !Array.isArray(data.tajweedText.segments)) return null;
    return data.tajweedText;
  }

  function renderArabicElement(element, verse, script) {
    if (!element) return;
    element.textContent = "";
    element.classList.remove("has-tajweed");

    var tajweedText = script === "tajweed" ? getTajweedText(verse) : null;
    if (!tajweedText) {
      element.textContent = (verse && verse.arabicText) || "";
      return;
    }

    element.classList.add("has-tajweed");
    tajweedText.segments.forEach(function (segment) {
      var span = document.createElement("span");
      span.textContent = segment.text || "";
      if (segment.rule && segment.rule !== "plain") {
        span.className = "tajweed-rule tajweed-" + normalizeTajweedRule(segment.rule);
        span.title = segment.ruleName || tajweedRuleName(segment.rule);
      }
      element.appendChild(span);
    });
  }

  function renderTajweedLegend(id, verses, script) {
    var legendElement = document.getElementById(id);
    if (!legendElement) return;
    legendElement.textContent = "";

    if (script !== "tajweed") {
      legendElement.hidden = true;
      return;
    }

    var byRule = {};
    (Array.isArray(verses) ? verses : [verses]).forEach(function (verse) {
      var tajweedText = getTajweedText(verse);
      if (!tajweedText) return;
      (tajweedText.legend || []).forEach(function (item) {
        if (item && item.rule && !byRule[item.rule]) byRule[item.rule] = item.ruleName || tajweedRuleName(item.rule);
      });
    });

    Object.keys(byRule).slice(0, 8).forEach(function (rule) {
      var chip = document.createElement("span");
      chip.className = "tajweed-chip tajweed-" + normalizeTajweedRule(rule);
      chip.textContent = byRule[rule];
      legendElement.appendChild(chip);
    });

    legendElement.hidden = !legendElement.children.length;
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

  async function fetchQuranArabicAyah(verseKey, script) {
    var endpoint = normalizeScript(script) === "tajweed"
      ? "/quran/verses/uthmani_tajweed"
      : "/quran/verses/uthmani";
    var payload = await fetchExternalJson(
      quranApiUrl(endpoint, { verse_key: verseKey })
    );
    var verse = payload.verses && payload.verses[0] ? payload.verses[0] : null;
    if (!verse) return { arabicText: "" };
    var tajweedText = normalizeScript(script) === "tajweed"
      ? parseTajweedMarkup(verse.text_uthmani_tajweed)
      : null;
    return {
      arabicText: tajweedText ? tajweedText.plainText : (verse.text_uthmani || ""),
      script: normalizeScript(script),
      tajweedText: tajweedText || undefined,
    };
  }

  async function fetchQuranArabicSurah(surahNumber, script) {
    var endpoint = normalizeScript(script) === "tajweed"
      ? "/quran/verses/uthmani_tajweed"
      : "/quran/verses/uthmani";
    var payload = await fetchExternalJson(
      quranApiUrl(endpoint, { chapter_number: surahNumber })
    );
    return payload.verses || [];
  }

  async function fetchQuranAyahBase(surahNumber, ayahNumber, language, script) {
    var verseKey = surahNumber + ":" + ayahNumber;
    var chapter = await fetchQuranChapter(surahNumber, language);
    var arabic = await fetchQuranArabicAyah(verseKey, script);

    return {
      verseKey: verseKey,
      surahNumber: Number(surahNumber),
      surahName: chapter.translated_name && chapter.translated_name.name ? chapter.translated_name.name : chapter.name_simple,
      surahNameArabic: chapter.name_arabic || "",
      ayahNumber: Number(ayahNumber),
      language: language,
      script: normalizeScript(script),
      arabicText: arabic.arabicText,
      tajweedText: arabic.tajweedText,
    };
  }

  async function fetchQuranSurahBase(surahNumber, language, script) {
    var chapter = await fetchQuranChapter(surahNumber, language);
    var arabicVerses = await fetchQuranArabicSurah(surahNumber, script);

    return {
      language: language,
      script: normalizeScript(script),
      surah: {
        number: Number(surahNumber),
        name: chapter.translated_name && chapter.translated_name.name ? chapter.translated_name.name : chapter.name_simple,
        nameArabic: chapter.name_arabic || "",
        verseCount: chapter.verses_count || arabicVerses.length,
      },
      verses: arabicVerses.map(function (verse) {
        var split = String(verse.verse_key || "").split(":");
        var tajweedText = normalizeScript(script) === "tajweed"
          ? parseTajweedMarkup(verse.text_uthmani_tajweed)
          : null;
        return {
          verseKey: verse.verse_key,
          surahNumber: Number(split[0] || surahNumber),
          ayahNumber: Number(split[1] || 0),
          script: normalizeScript(script),
          arabicText: tajweedText ? tajweedText.plainText : (verse.text_uthmani || ""),
          tajweedText: tajweedText || undefined,
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

  function parseVerseKey(verseKey) {
    var split = String(verseKey || "").split(":");
    return {
      surah: split[0] || "",
      ayah: split[1] || "",
    };
  }

  async function fetchLocalTafsirForAyah(verseKey, resource, localExplanation) {
    if (localExplanation) {
      return { text: localExplanation, source: resource.source };
    }

    var parsed = parseVerseKey(verseKey);
    if (!/^\d{1,3}$/.test(parsed.surah) || !/^\d{1,3}$/.test(parsed.ayah)) return null;

    var params = new URLSearchParams(window.location.search);
    params.set("lang", "tr");
    params.set("source", cleanText(params.get("source"), "web_fallback"));

    var data = await fetchApiJson("/api/quran/explanation/" + parsed.surah + "/" + parsed.ayah, params);
    var text = data.explanation || data.explanationSummary || "";
    var source = data.sourceLabel || resource.source;

    return text ? { text: text, source: source } : null;
  }

  async function fetchTafsirForAyah(verseKey, resource, localExplanation) {
    if (resource && resource.local && localExplanation) {
      return { text: localExplanation, source: resource.source };
    }

    if (resource && resource.local) {
      return fetchLocalTafsirForAyah(verseKey, resource, localExplanation);
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
    if (resource.local) {
      var params = new URLSearchParams(window.location.search);
      params.set("lang", "tr");
      params.set("source", cleanText(params.get("source"), "web_fallback"));

      var localData = await fetchApiJson("/api/quran/explanations/" + surahNumber, params);
      var localByVerseKey = {};

      (localData.explanations || []).forEach(function (entry) {
        if (entry.verseKey && entry.explanation) {
          localByVerseKey[entry.verseKey] = entry.explanation;
        }
      });

      return Object.keys(localByVerseKey).length
        ? {
            byVerseKey: localByVerseKey,
            source: localData.source && localData.source.label ? localData.source.label : resource.source,
          }
        : null;
    }

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

  async function loadAyahContent(context, language, mode, resource, script) {
    var split = context.target.split(":");
    if (split.length !== 2 || !/^\d{1,3}$/.test(split[0]) || !/^\d{1,3}$/.test(split[1])) {
      throw new Error("Ayet bağlantısı geçersiz.");
    }

    var params = new URLSearchParams(window.location.search);
    params.set("lang", language);
    if (language === "tr") params.set("includeExplanation", "true");
    if (language !== "tr") params.delete("includeExplanation");
    updateScriptParam({ searchParams: params }, script);
    params.set("source", cleanText(params.get("source"), "web_fallback"));

    setStatus("Ayet içeriği yükleniyor...");
    setPanelVisible("surahPanel", false);
    setPanelVisible("ayahPanel", false);

    var data = null;
    try {
      data = await fetchApiJson("/api/quran/ayah/" + split[0] + "/" + split[1], params);
    } catch (error) {
      data = await fetchQuranAyahBase(split[0], split[1], language, script);
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

    renderArabicElement(document.getElementById("arabicText"), data, script);
    if (!document.getElementById("arabicText")?.textContent) {
      setContentText("arabicText", "", "Arapça metin şu anda alınamadı.");
    }
    renderTajweedLegend("tajweedLegend", data, script);
    renderTajweedLegend("surahTajweedLegend", [], "uthmani");
    setContentText("translationText", translationText, language === "ar" ? "Arapça orijinal metin yukarıda yer alıyor. Meal için başka bir dil seçebilirsin." : "Bu dil için meal şu anda alınamadı.");
    setContentText("translationSource", translationSource ? "Kaynak: " + translationSource : "");
    configureAyahAudio(data.verseKey);

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
    var script = options && options.script ? options.script : "uthmani";
    if (!list) return;
    list.textContent = "";

    verses.forEach(function (verse) {
      var item = document.createElement("div");
      item.className = "verse-item";
      item.dataset.verseKey = verse.verseKey || "";

      var key = document.createElement("div");
      key.className = "verse-key";
      key.textContent = verse.verseKey || "";

      var actions = document.createElement("div");
      actions.className = "verse-actions";
      if (verse.verseKey) {
        var listenButton = document.createElement("button");
        listenButton.className = "verse-audio-button";
        listenButton.type = "button";
        listenButton.dataset.verseKey = verse.verseKey;
        listenButton.setAttribute("aria-pressed", "false");
        listenButton.textContent = "Dinle";
        listenButton.addEventListener("click", function () {
          playSingleVerse(verse.verseKey, "surah");
        });
        actions.appendChild(listenButton);
      }

      var arabic = document.createElement("div");
      arabic.className = "arabic-text";
      renderArabicElement(arabic, verse, script);

      var translation = document.createElement("div");
      translation.className = mode === "tafsir" ? "explanation-text" : "translation-text";
      translation.textContent = mode === "tafsir"
        ? (verse.tafsirText || "")
        : (verse.translationText || verse.translation || "");

      var sourceText = document.createElement("div");
      sourceText.className = "source-text";
      sourceText.textContent = source ? "Kaynak: " + source : "";

      item.appendChild(key);
      if (actions.children.length) item.appendChild(actions);
      if (arabic.textContent) item.appendChild(arabic);
      if (translation.textContent) item.appendChild(translation);
      if (translation.textContent && sourceText.textContent) item.appendChild(sourceText);
      list.appendChild(item);
    });
  }

  async function loadSurahContent(context, language, mode, resource, script) {
    var surah = context.target.match(/\d+/);
    if (!surah) {
      throw new Error("Sure bağlantısı geçersiz.");
    }

    var params = new URLSearchParams(window.location.search);
    params.set("lang", language);
    updateScriptParam({ searchParams: params }, script);
    params.set("source", cleanText(params.get("source"), "web_fallback"));

    setStatus("Sure içeriği yükleniyor...");
    setPanelVisible("ayahPanel", false);
    setPanelVisible("surahPanel", false);

    var data = null;
    try {
      data = await fetchApiJson("/api/quran/surah/" + surah[0], params);
    } catch (error) {
      data = await fetchQuranSurahBase(surah[0], language, script);
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
        renderTajweedLegend("surahTajweedLegend", [], "uthmani");
        configureSurahAudio(surah[0], verses);
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

    renderTajweedLegend("tajweedLegend", [], "uthmani");
    renderTajweedLegend("surahTajweedLegend", verses, script);
    renderVerseList(verses, { mode: mode, source: contentSource, script: script });
    configureSurahAudio(surah[0], verses);
    setStatus(data.surah && data.surah.name ? data.surah.name + " - " + data.surah.verseCount + " ayet" : context.target);
    setPanelVisible("surahPanel", true);
  }

  async function loadDynamicContent(context, language, mode, resource, script) {
    var reader = document.getElementById("reader");
    if (!reader || (context.kind !== "ayah" && context.kind !== "surah")) return;

    reader.hidden = false;
    var selectedResource = resource || getCurrentResource(language, mode);
    var selectedScript = normalizeScript(script || getCurrentQuranScript());
    resetAudioUi();
    setLoading(true, context.kind === "ayah" ? "Ayet hazırlanıyor..." : "Sure hazırlanıyor...");

    try {
      if (context.kind === "ayah") {
        await loadAyahContent(context, language, mode, selectedResource, selectedScript);
      } else {
        await loadSurahContent(context, language, mode, selectedResource, selectedScript);
      }
    } catch (error) {
      setStatus(error && error.message ? error.message : "İçerik şu anda alınamadı.");
      setPanelVisible("ayahPanel", false);
      setPanelVisible("surahPanel", false);
    } finally {
      setLoading(false);
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

  function buildQuranUrl(language, script) {
    var url = new URL("/quran", window.location.origin);
    url.searchParams.set("lang", normalizeLanguage(language));
    updateScriptParam(url, script);
    return url.toString();
  }

  function applyContext() {
    var context = getContext();
    var params = new URLSearchParams(window.location.search);
    var language = getCurrentLanguage();
    var contentMode = getCurrentContentMode();
    var quranScript = getCurrentQuranScript();
    var landingUrl = buildLandingUrl(params);
    var appLink = withSource(context.appPath, params);
    var languageSelect = document.getElementById("languageSelect");
    var contentModeSelect = document.getElementById("contentModeSelect");
    var scriptSelect = document.getElementById("scriptSelect");
    var resourceSelect = document.getElementById("resourceSelect");
    var selectedResource = populateResourceSelect(language, contentMode);

    configureMiniPlayerControls();
    setHref("appLink", appLink);
    setHref("landingLink", landingUrl);
    setHref("headerHomeLink", landingUrl);
    setHref("quranLink", buildQuranUrl(language, quranScript));

    if (languageSelect) {
      languageSelect.value = language;
      languageSelect.addEventListener("change", function () {
        var nextLanguage = normalizeLanguage(languageSelect.value);
        var nextMode = getCurrentContentMode();
        var nextResource = getDefaultResource(nextLanguage, nextMode);
        var nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set("lang", nextLanguage);
        updateResourceParam(nextUrl, nextMode, nextResource);
        updateScriptParam(nextUrl, getCurrentQuranScript());
        window.history.replaceState(null, "", nextUrl.toString());
        setHref("quranLink", buildQuranUrl(nextLanguage, getCurrentQuranScript()));
        populateResourceSelect(nextLanguage, nextMode);
        loadDynamicContent(context, nextLanguage, nextMode, nextResource, getCurrentQuranScript());
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
        updateScriptParam(nextUrl, getCurrentQuranScript());
        window.history.replaceState(null, "", nextUrl.toString());
        populateResourceSelect(getCurrentLanguage(), nextMode);
        loadDynamicContent(context, getCurrentLanguage(), nextMode, nextResource, getCurrentQuranScript());
      });
    }

    if (scriptSelect) {
      scriptSelect.value = quranScript;
      scriptSelect.addEventListener("change", function () {
        var nextScript = normalizeScript(scriptSelect.value);
        var nextUrl = new URL(window.location.href);
        updateScriptParam(nextUrl, nextScript);
        window.history.replaceState(null, "", nextUrl.toString());
        setHref("quranLink", buildQuranUrl(getCurrentLanguage(), nextScript));
        loadDynamicContent(context, getCurrentLanguage(), getCurrentContentMode(), getCurrentResource(getCurrentLanguage(), getCurrentContentMode()), nextScript);
      });
    }

    if (resourceSelect) {
      resourceSelect.addEventListener("change", function () {
        var mode = getCurrentContentMode();
        var languageForResource = getCurrentLanguage();
        var nextResource = findResource(languageForResource, mode, resourceSelect.value);
        var nextUrl = new URL(window.location.href);
        updateResourceParam(nextUrl, mode, nextResource);
        updateScriptParam(nextUrl, getCurrentQuranScript());
        window.history.replaceState(null, "", nextUrl.toString());
        populateResourceSelect(languageForResource, mode);
        loadDynamicContent(context, languageForResource, mode, nextResource, getCurrentQuranScript());
      });
    }

    if (context.kind === "ayah") {
      document.title = context.target + " | Vaktim'de Aç";
      setText("kicker", "Kur'an bağlantısı");
      setText("pageTitle", context.title);
      setText("leadText", "Bu ayeti Vaktim uygulamasında meal, notlar ve manevi okuma akışıyla açabilirsin.");
      loadDynamicContent(context, language, contentMode, selectedResource, quranScript);
      return;
    }

    if (context.kind === "surah") {
      document.title = context.target + " | Vaktim'de Aç";
      setText("kicker", "Sure bağlantısı");
      setText("pageTitle", context.title);
      setText("leadText", "Bu sureyi Vaktim uygulamasında düzenli okuma ve takip deneyimiyle açabilirsin.");
      loadDynamicContent(context, language, contentMode, selectedResource, quranScript);
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
