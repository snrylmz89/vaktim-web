(function () {
  var SUPPORTED_LANGUAGES = ["tr", "en", "de", "fr", "ar", "id", "ms"];
  var surahs = [
    { n: 1, name: "Fâtiha", arabic: "الفاتحة", meaning: "Açılış", ayahs: 7 },
    { n: 2, name: "Bakara", arabic: "البقرة", meaning: "İnek", ayahs: 286 },
    { n: 3, name: "Âl-i İmrân", arabic: "آل عمران", meaning: "İmrân ailesi", ayahs: 200 },
    { n: 4, name: "Nisâ", arabic: "النساء", meaning: "Kadınlar", ayahs: 176 },
    { n: 5, name: "Mâide", arabic: "المائدة", meaning: "Sofra", ayahs: 120 },
    { n: 6, name: "En'âm", arabic: "الأنعام", meaning: "En'am", ayahs: 165 },
    { n: 7, name: "A'râf", arabic: "الأعراف", meaning: "Yüksek yerler", ayahs: 206 },
    { n: 8, name: "Enfâl", arabic: "الأنفال", meaning: "Ganimetler", ayahs: 75 },
    { n: 9, name: "Tevbe", arabic: "التوبة", meaning: "Tevbe", ayahs: 129 },
    { n: 10, name: "Yûnus", arabic: "يونس", meaning: "Yunus", ayahs: 109 },
    { n: 11, name: "Hûd", arabic: "هود", meaning: "Hud", ayahs: 123 },
    { n: 12, name: "Yûsuf", arabic: "يوسف", meaning: "Yusuf", ayahs: 111 },
    { n: 13, name: "Ra'd", arabic: "الرعد", meaning: "Gök gürültüsü", ayahs: 43 },
    { n: 14, name: "İbrâhîm", arabic: "إبراهيم", meaning: "İbrahim", ayahs: 52 },
    { n: 15, name: "Hicr", arabic: "الحجر", meaning: "Hicr", ayahs: 99 },
    { n: 16, name: "Nahl", arabic: "النحل", meaning: "Arı", ayahs: 128 },
    { n: 17, name: "İsrâ", arabic: "الإسراء", meaning: "Gece yürüyüşü", ayahs: 111 },
    { n: 18, name: "Kehf", arabic: "الكهف", meaning: "Mağara", ayahs: 110 },
    { n: 19, name: "Meryem", arabic: "مريم", meaning: "Meryem", ayahs: 98 },
    { n: 20, name: "Tâhâ", arabic: "طه", meaning: "Tâhâ", ayahs: 135 },
    { n: 21, name: "Enbiyâ", arabic: "الأنبياء", meaning: "Peygamberler", ayahs: 112 },
    { n: 22, name: "Hac", arabic: "الحج", meaning: "Hac", ayahs: 78 },
    { n: 23, name: "Mü'minûn", arabic: "المؤمنون", meaning: "Müminler", ayahs: 118 },
    { n: 24, name: "Nûr", arabic: "النور", meaning: "Nur", ayahs: 64 },
    { n: 25, name: "Furkân", arabic: "الفرقان", meaning: "Ölçü", ayahs: 77 },
    { n: 26, name: "Şuarâ", arabic: "الشعراء", meaning: "Şairler", ayahs: 227 },
    { n: 27, name: "Neml", arabic: "النمل", meaning: "Karınca", ayahs: 93 },
    { n: 28, name: "Kasas", arabic: "القصص", meaning: "Kıssalar", ayahs: 88 },
    { n: 29, name: "Ankebût", arabic: "العنكبوت", meaning: "Örümcek", ayahs: 69 },
    { n: 30, name: "Rûm", arabic: "الروم", meaning: "Rumlar", ayahs: 60 },
    { n: 31, name: "Lokmân", arabic: "لقمان", meaning: "Lokman", ayahs: 34 },
    { n: 32, name: "Secde", arabic: "السجدة", meaning: "Secde", ayahs: 30 },
    { n: 33, name: "Ahzâb", arabic: "الأحزاب", meaning: "Gruplar", ayahs: 73 },
    { n: 34, name: "Sebe", arabic: "سبأ", meaning: "Sebe", ayahs: 54 },
    { n: 35, name: "Fâtır", arabic: "فاطر", meaning: "Yaratan", ayahs: 45 },
    { n: 36, name: "Yâsîn", arabic: "يس", meaning: "Yâsîn", ayahs: 83 },
    { n: 37, name: "Sâffât", arabic: "الصافات", meaning: "Saf tutanlar", ayahs: 182 },
    { n: 38, name: "Sâd", arabic: "ص", meaning: "Sâd", ayahs: 88 },
    { n: 39, name: "Zümer", arabic: "الزمر", meaning: "Zümreler", ayahs: 75 },
    { n: 40, name: "Mü'min", arabic: "غافر", meaning: "Mümin", ayahs: 85 },
    { n: 41, name: "Fussilet", arabic: "فصلت", meaning: "Açıklanmış", ayahs: 54 },
    { n: 42, name: "Şûrâ", arabic: "الشورى", meaning: "Danışma", ayahs: 53 },
    { n: 43, name: "Zuhruf", arabic: "الزخرف", meaning: "Süs", ayahs: 89 },
    { n: 44, name: "Duhân", arabic: "الدخان", meaning: "Duman", ayahs: 59 },
    { n: 45, name: "Câsiye", arabic: "الجاثية", meaning: "Diz çöken", ayahs: 37 },
    { n: 46, name: "Ahkâf", arabic: "الأحقاف", meaning: "Kum tepeleri", ayahs: 35 },
    { n: 47, name: "Muhammed", arabic: "محمد", meaning: "Muhammed", ayahs: 38 },
    { n: 48, name: "Fetih", arabic: "الفتح", meaning: "Fetih", ayahs: 29 },
    { n: 49, name: "Hucurât", arabic: "الحجرات", meaning: "Odalar", ayahs: 18 },
    { n: 50, name: "Kâf", arabic: "ق", meaning: "Kâf", ayahs: 45 },
    { n: 51, name: "Zâriyât", arabic: "الذاريات", meaning: "Savuranlar", ayahs: 60 },
    { n: 52, name: "Tûr", arabic: "الطور", meaning: "Tur", ayahs: 49 },
    { n: 53, name: "Necm", arabic: "النجم", meaning: "Yıldız", ayahs: 62 },
    { n: 54, name: "Kamer", arabic: "القمر", meaning: "Ay", ayahs: 55 },
    { n: 55, name: "Rahmân", arabic: "الرحمن", meaning: "Rahman", ayahs: 78 },
    { n: 56, name: "Vâkıa", arabic: "الواقعة", meaning: "Olay", ayahs: 96 },
    { n: 57, name: "Hadîd", arabic: "الحديد", meaning: "Demir", ayahs: 29 },
    { n: 58, name: "Mücâdele", arabic: "المجادلة", meaning: "Mücadele", ayahs: 22 },
    { n: 59, name: "Haşr", arabic: "الحشر", meaning: "Toplanma", ayahs: 24 },
    { n: 60, name: "Mümtehine", arabic: "الممتحنة", meaning: "İmtihan edilen", ayahs: 13 },
    { n: 61, name: "Saf", arabic: "الصف", meaning: "Saf", ayahs: 14 },
    { n: 62, name: "Cuma", arabic: "الجمعة", meaning: "Cuma", ayahs: 11 },
    { n: 63, name: "Münâfikûn", arabic: "المنافقون", meaning: "Münafıklar", ayahs: 11 },
    { n: 64, name: "Teğâbün", arabic: "التغابن", meaning: "Aldanma", ayahs: 18 },
    { n: 65, name: "Talâk", arabic: "الطلاق", meaning: "Boşanma", ayahs: 12 },
    { n: 66, name: "Tahrîm", arabic: "التحريم", meaning: "Yasaklama", ayahs: 12 },
    { n: 67, name: "Mülk", arabic: "الملك", meaning: "Hükümranlık", ayahs: 30 },
    { n: 68, name: "Kalem", arabic: "القلم", meaning: "Kalem", ayahs: 52 },
    { n: 69, name: "Hâkka", arabic: "الحاقة", meaning: "Gerçek", ayahs: 52 },
    { n: 70, name: "Meâric", arabic: "المعارج", meaning: "Yükseliş yolları", ayahs: 44 },
    { n: 71, name: "Nûh", arabic: "نوح", meaning: "Nuh", ayahs: 28 },
    { n: 72, name: "Cin", arabic: "الجن", meaning: "Cin", ayahs: 28 },
    { n: 73, name: "Müzzemmil", arabic: "المزمل", meaning: "Örtünen", ayahs: 20 },
    { n: 74, name: "Müddessir", arabic: "المدثر", meaning: "Bürünüp örtünen", ayahs: 56 },
    { n: 75, name: "Kıyâmet", arabic: "القيامة", meaning: "Kıyamet", ayahs: 40 },
    { n: 76, name: "İnsân", arabic: "الإنسان", meaning: "İnsan", ayahs: 31 },
    { n: 77, name: "Mürselât", arabic: "المرسلات", meaning: "Gönderilenler", ayahs: 50 },
    { n: 78, name: "Nebe", arabic: "النبأ", meaning: "Haber", ayahs: 40 },
    { n: 79, name: "Nâziât", arabic: "النازعات", meaning: "Söküp çıkaranlar", ayahs: 46 },
    { n: 80, name: "Abese", arabic: "عبس", meaning: "Yüzünü ekşitti", ayahs: 42 },
    { n: 81, name: "Tekvîr", arabic: "التكوير", meaning: "Dürülme", ayahs: 29 },
    { n: 82, name: "İnfitâr", arabic: "الانفطار", meaning: "Yarılma", ayahs: 19 },
    { n: 83, name: "Mutaffifîn", arabic: "المطففين", meaning: "Ölçüde hile yapanlar", ayahs: 36 },
    { n: 84, name: "İnşikâk", arabic: "الانشقاق", meaning: "Yarılma", ayahs: 25 },
    { n: 85, name: "Bürûc", arabic: "البروج", meaning: "Burçlar", ayahs: 22 },
    { n: 86, name: "Târık", arabic: "الطارق", meaning: "Gece gelen", ayahs: 17 },
    { n: 87, name: "A'lâ", arabic: "الأعلى", meaning: "En yüce", ayahs: 19 },
    { n: 88, name: "Ğâşiye", arabic: "الغاشية", meaning: "Kaplayan", ayahs: 26 },
    { n: 89, name: "Fecr", arabic: "الفجر", meaning: "Fecr", ayahs: 30 },
    { n: 90, name: "Beled", arabic: "البلد", meaning: "Şehir", ayahs: 20 },
    { n: 91, name: "Şems", arabic: "الشمس", meaning: "Güneş", ayahs: 15 },
    { n: 92, name: "Leyl", arabic: "الليل", meaning: "Gece", ayahs: 21 },
    { n: 93, name: "Duhâ", arabic: "الضحى", meaning: "Kuşluk vakti", ayahs: 11 },
    { n: 94, name: "İnşirâh", arabic: "الشرح", meaning: "Ferahlık", ayahs: 8 },
    { n: 95, name: "Tîn", arabic: "التين", meaning: "İncir", ayahs: 8 },
    { n: 96, name: "Alak", arabic: "العلق", meaning: "Alak", ayahs: 19 },
    { n: 97, name: "Kadir", arabic: "القدر", meaning: "Kadir", ayahs: 5 },
    { n: 98, name: "Beyyine", arabic: "البينة", meaning: "Apaçık delil", ayahs: 8 },
    { n: 99, name: "Zilzâl", arabic: "الزلزلة", meaning: "Sarsıntı", ayahs: 8 },
    { n: 100, name: "Âdiyât", arabic: "العاديات", meaning: "Koşan atlar", ayahs: 11 },
    { n: 101, name: "Kâria", arabic: "القارعة", meaning: "Kapıyı çalan", ayahs: 11 },
    { n: 102, name: "Tekâsür", arabic: "التكاثر", meaning: "Çokluk yarışı", ayahs: 8 },
    { n: 103, name: "Asr", arabic: "العصر", meaning: "Asır", ayahs: 3 },
    { n: 104, name: "Hümeze", arabic: "الهمزة", meaning: "Arkadan çekiştiren", ayahs: 9 },
    { n: 105, name: "Fîl", arabic: "الفيل", meaning: "Fil", ayahs: 5 },
    { n: 106, name: "Kureyş", arabic: "قريش", meaning: "Kureyş", ayahs: 4 },
    { n: 107, name: "Mâûn", arabic: "الماعون", meaning: "Yardım", ayahs: 7 },
    { n: 108, name: "Kevser", arabic: "الكوثر", meaning: "Kevser", ayahs: 3 },
    { n: 109, name: "Kâfirûn", arabic: "الكافرون", meaning: "İnkarcılar", ayahs: 6 },
    { n: 110, name: "Nasr", arabic: "النصر", meaning: "Yardım", ayahs: 3 },
    { n: 111, name: "Tebbet", arabic: "المسد", meaning: "Tebbet", ayahs: 5 },
    { n: 112, name: "İhlâs", arabic: "الإخلاص", meaning: "İhlas", ayahs: 4 },
    { n: 113, name: "Felak", arabic: "الفلق", meaning: "Sabah aydınlığı", ayahs: 5 },
    { n: 114, name: "Nâs", arabic: "الناس", meaning: "İnsanlar", ayahs: 6 },
  ];

  var state = {
    language: "tr",
    script: "tajweed",
    query: "",
    ascending: true,
  };

  function normalizeLanguage(value) {
    var language = String(value || "tr").toLowerCase().split(/[-_]/)[0];
    return SUPPORTED_LANGUAGES.indexOf(language) === -1 ? "tr" : language;
  }

  function normalizeScript(value) {
    var script = String(value || "").toLowerCase();
    return script === "uthmani" ? "uthmani" : "tajweed";
  }

  function fold(value) {
    return String(value || "")
      .toLocaleLowerCase("tr")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/\s+/g, " ")
      .trim();
  }

  function selectedLanguage() {
    return normalizeLanguage(state.language);
  }

  function buildSurahUrl(number) {
    var url = new URL("/surah/" + number, window.location.origin);
    url.searchParams.set("source", "web");
    url.searchParams.set("lang", selectedLanguage());
    url.searchParams.set("script", normalizeScript(state.script));
    return url.toString();
  }

  function createTextElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  }

  function createSurahCard(surah) {
    var card = document.createElement("a");
    card.className = "surah-card";
    card.href = buildSurahUrl(surah.n);
    card.setAttribute("aria-label", surah.n + ". sure " + surah.name + " suresini aç");

    var number = createTextElement("div", "number", "");
    number.appendChild(createTextElement("span", "", String(surah.n)));

    var main = createTextElement("div", "surah-main", "");
    main.appendChild(createTextElement("span", "surah-name", surah.name));
    main.appendChild(createTextElement("span", "surah-meaning", surah.meaning));
    main.appendChild(createTextElement("div", "surah-meta", surah.ayahs + " ayet"));

    var arabic = createTextElement("div", "arabic-name", surah.arabic);

    card.appendChild(number);
    card.appendChild(main);
    card.appendChild(arabic);
    return card;
  }

  function filteredSurahs() {
    var query = fold(state.query);
    var result = surahs.filter(function (surah) {
      if (!query) return true;
      var haystack = fold([surah.n, surah.name, surah.meaning, surah.arabic].join(" "));
      return haystack.indexOf(query) !== -1;
    });

    result.sort(function (a, b) {
      return state.ascending ? a.n - b.n : b.n - a.n;
    });

    return result;
  }

  function render() {
    var grid = document.getElementById("surahGrid");
    var loadingState = document.getElementById("loadingState");
    var resultCount = document.getElementById("resultCount");
    var emptyState = document.getElementById("emptyState");
    var sortButton = document.getElementById("sortButton");
    var featuredSurahLink = document.getElementById("featuredSurahLink");
    if (!grid || !resultCount || !emptyState || !sortButton) return;

    var result = filteredSurahs();
    grid.textContent = "";
    result.forEach(function (surah) {
      grid.appendChild(createSurahCard(surah));
    });

    resultCount.textContent = result.length + " sure";
    sortButton.textContent = "Sıralama: " + (state.ascending ? "Artan" : "Azalan");
    emptyState.classList.toggle("is-visible", result.length === 0);
    grid.hidden = false;
    if (loadingState) loadingState.hidden = true;
    if (featuredSurahLink) featuredSurahLink.href = buildSurahUrl(67);
  }

  function applyQueryParams() {
    var params = new URLSearchParams(window.location.search);
    state.language = normalizeLanguage(params.get("lang") || params.get("language") || "tr");
    state.script = normalizeScript(params.get("script"));
    var languageSelect = document.getElementById("languageSelect");
    var scriptSelect = document.getElementById("scriptSelect");
    if (languageSelect) languageSelect.value = state.language;
    if (scriptSelect) scriptSelect.value = state.script;
  }

  function bindControls() {
    var searchInput = document.getElementById("searchInput");
    var languageSelect = document.getElementById("languageSelect");
    var scriptSelect = document.getElementById("scriptSelect");
    var sortButton = document.getElementById("sortButton");

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        state.query = searchInput.value;
        render();
      });
    }

    if (languageSelect) {
      languageSelect.addEventListener("change", function () {
        state.language = normalizeLanguage(languageSelect.value);
        var nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set("lang", state.language);
        window.history.replaceState(null, "", nextUrl.toString());
        render();
      });
    }

    if (scriptSelect) {
      scriptSelect.addEventListener("change", function () {
        state.script = normalizeScript(scriptSelect.value);
        var nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set("script", state.script);
        window.history.replaceState(null, "", nextUrl.toString());
        render();
      });
    }

    if (sortButton) {
      sortButton.addEventListener("click", function () {
        state.ascending = !state.ascending;
        render();
      });
    }
  }

  applyQueryParams();
  bindControls();
  render();
})();
