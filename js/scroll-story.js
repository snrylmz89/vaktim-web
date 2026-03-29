(function () {
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function buildParticles() {
    var host = document.getElementById("heroParticles");
    if (!host) return;

    for (var i = 0; i < 28; i += 1) {
      var particle = document.createElement("span");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 + "%";
      particle.style.setProperty("--size", (2 + Math.random() * 5).toFixed(2) + "px");
      particle.style.setProperty("--delay", (Math.random() * 8).toFixed(2) + "s");
      particle.style.setProperty("--duration", (8 + Math.random() * 10).toFixed(2) + "s");
      particle.style.setProperty("--drift", (10 + Math.random() * 26).toFixed(2) + "px");
      host.appendChild(particle);
    }
  }

  function setupReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function updateHeroProgress() {
    var hero = document.getElementById("hero");
    if (!hero) return;

    var rect = hero.getBoundingClientRect();
    var progress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1);
    document.documentElement.style.setProperty("--hero-progress", progress.toFixed(3));
  }

  function updateHeaderState() {
    var header = document.getElementById("siteHeader");
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  function bindAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (event) {
        var href = anchor.getAttribute("href");
        if (!href || href === "#") return;

        var target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function getScrollStoryLocale() {
    var lang = (document.documentElement.getAttribute("lang") || "tr").toLowerCase();
    if (lang.indexOf("ar") === 0) return "ar";
    if (lang.indexOf("en") === 0) return "en";
    return "tr";
  }

  function getScrollStoryCopy(locale) {
    function quranPage(metaLeft, metaRight, title, arabic, translationLabel, translation, meaningLabel, meaning) {
      return {
        metaLeft: metaLeft,
        metaRight: metaRight,
        title: title,
        arabic: arabic,
        translationLabel: translationLabel,
        translation: translation,
        meaningLabel: meaningLabel,
        meaning: meaning
      };
    }

    var copy = {
      tr: {
        lang: "tr",
        dir: "ltr",
        title: "Vaktim | Manevi Rehberlik Uygulaması",
        description: "Vaktim ile namaz takibi, Kur'an, kıble ve manevi rehberlik tek yerde buluşur.",
        brandAlt: "Vaktim logosu",
        phoneAlt: "Vaktim uygulaması telefon görünümü",
        navAriaLabel: "Bölümler",
        nav: ["Namaz", "Kur'an", "Rafi Hoca", "Premium"],
        headerCta: "İndir",
        backText: "Ana Sayfa",
        backHref: "/",
        heroTitle: "Vaktinle<br><span class=\"accent\">Bağ Kur.</span>",
        heroBody: "Vaktini hatırlatan değil, kalbine de dokunan bir yol arkadaşı. Namaz, Kur'an ve manevi rehberlik aynı akışta buluşarak günün içine daha derin bir huzur taşıyor.",
        heroButtons: ["Uygulamayı Keşfet", "Yolculuğu Gör"],
        heroMetaTitles: ["Huzurlu Deneyim", "Tek Yerde", "Derinleşen Yolculuk"],
        heroMetaBodies: [
          "Gün boyunca daha sakin, daha toplu ve daha merkezde kalmana eşlik eder.",
          "Namaz, Kur'an, kıble ve rehberlik aynı akışta buluşur.",
          "Her gün, manevi hedeflerine biraz daha yakınlaşmana yardımcı olur."
        ],
        namaz: {
          kicker: "01 — Namaz Takip",
          title: "Her vakit, <span class=\"accent\">bilinçli bir adım.</span>",
          body: "Namaz vakitlerini tek ekranda takip et, günlük düzenini koru ve her ibadeti daha bilinçli bir ritimle sürdür.",
          quote: "Vakitlerini gör, tamamladıklarını işaretle, düzenini kolayca sürdür.",
          names: ["Sabah", "Öğle", "İkindi", "Akşam", "Yatsı"],
          descriptions: [
            "Günün ilk sakin durağı",
            "Ritmi tekrar merkeze alır",
            "Hatırlatır, acele ettirmez",
            "Bir eksik kaldıysa toparlar",
            "Gün kapanırken toparlar"
          ],
          labels: ["Kıldım", "Kıldım", "Kıldım", "Kaza Namazım", "Kıldım"]
        },
        quran: {
          kicker: "02 — Kur'an Deneyimi",
          title: "Okumak değil,<br><span class=\"accent\">anlamak ve hissetmek.</span>",
          body: "Kur'an deneyimi, okumayı daha odaklı ve daha sakin bir hale getirir; ayetler arasında kaybolmadan ilerlemeni kolaylaştırır.",
          quote: "Oku, dinle, kaydet ve ayetlerle kurduğun bağı daha derin yaşa.",
          book: {
            initialLeft: quranPage("Sure 1", "Ayet 5", "Fâtiha Suresi", "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", "Meal", "Yalnız sana kulluk eder, yalnız senden yardım dileriz.", "Anlam", "Kulun tüm yönelişini Allah’a vermesi ve her konuda sadece O’na dayanması gerektiğini ifade eder."),
            initialRight: quranPage("Sure 94", "Ayet 6", "İnşirah Suresi", "إِنَّ مَعَ الْعُسْرِ يُسْرًا", "Meal", "Şüphesiz zorlukla beraber bir kolaylık vardır.", "Anlam", "Her sıkıntının içinde mutlaka bir çıkış ve kolaylık bulunduğunu hatırlatır."),
            nextLeft: quranPage("Sure 2", "Ayet 286", "Bakara Suresi", "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", "Meal", "Allah hiç kimseye gücünün yettiğinden fazlasını yüklemez.", "Anlam", "İnsanın karşılaştığı her sorumluluğun aslında taşıyabileceği kadar olduğunu bildirir."),
            nextRight: quranPage("Sure 65", "Ayet 3", "Talak Suresi", "وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", "Meal", "Kim Allah’a tevekkül ederse, O ona yeter.", "Anlam", "Gerçek güvenin Allah’a dayanmak olduğunu ve bunun insan için yeterli olacağını vurgular.")
          }
        },
        rafi: {
          kicker: "03 — Rafi Hoca Manevi Rehber",
          title: "Sor, konuş,<br><span class=\"accent\">öğren.</span>",
          body: "Rafi, merak ettiğin konularda hızlı ve anlaşılır cevaplar sunarak öğrenirken daha güvende ve daha yönlendirilmiş hissetmeni sağlar.",
          quote: "Sormak istediğin her konuda yanında olan akıllı bir rehber.",
          name: "Rafi Hoca",
          status: "Her zaman yanında",
          user: "Bugün odağımı toplamakta zorlanıyorum. Nereden başlamalıyım?",
          ai: "Küçük bir adımla. Niyet et, en yakın vakti sakin bir hazırlık olarak gör ve kendine alan aç.",
          typingAria: "Rafi yazıyor",
          avatarAlt: "Rafi Hoca profil görseli"
        },
        tools: {
          kicker: "04 — Kıble Yönünü Bulma",
          title: "Doğru yöne sakin bir<br><span class=\"accent\">yaklaşım.</span>",
          body: "İhtiyacın olan manevi araçlar bir arada.",
          pills: ["Kıble", "Tesbihat", "Hatırlatmalar", "Zikir Akışı"],
          snap: "Kıble bulundu"
        },
        journey: {
          kicker: "05 — Manevi Yolculuk",
          title: "Küçük adımlar,<br><span class=\"accent\">büyük değişim.</span>",
          body: "Haftalık ilerleyişini gör, istikrarını takip et ve günlük adımlarının zamanla nasıl güçlendiğini net bir şekilde izle.",
          quote: "Küçük adımlarını görünür kıl, ilerleyişini her gün biraz daha belirginleştir.",
          aria: "Manevi yolculuk görev listesi",
          days: ["Pzt", "Salı", "Çrş", "Prş", "Cuma", "Cmt", "Pazar"],
          tasks: [
            { icon: "🕌", title: "Namaz", body: "Günün vaktini sakin bir niyetle karşıla" },
            { icon: "🤲", title: "Dua", body: "Kısa bir dua ile kalbini toparla" },
            { icon: "📿", title: "Zikir", body: "Birkaç zikirle iç ritmini tazele" },
            { icon: "📖", title: "Kur'an", body: "Kısa bir bölüm oku ve üzerinde dur" },
            { icon: "✨", title: "Salavat", body: "Günü salavatla yumuşakça tamamla" }
          ]
        },
        daily: {
          kicker: "06 — Günlük İçerikler",
          title: "Her gün yeni<br><span class=\"accent\">ilham.</span>",
          body: "Günün ayeti, duası, zikri ve kısa manevi içerikleri her gün yenilenir; uygulamaya her girişte sana taze bir içerik akışı sunar.",
          cards: [
            { tag: "Günün Ayeti", text: "Kalpler ancak Allah'ı anmakla huzur bulur.", meta: "— Ra'd, 28" },
            { tag: "Hikmetli Söz", text: "İki günü eşit olan ziyandadır.", meta: "— Rivayet edilir" },
            { tag: "Günün Duası", text: "Allah'ım! Senden hidayet, takva, iffet ve gönül zenginliği isterim.", meta: "— Hadis duası" },
            { tag: "Sabır & Şükür", text: "Sabredenlere mükafatları hesapsız verilecektir.", meta: "— Zümer, 10" },
            { tag: "Zikir Önerisi", text: "Subhanallah (33 defa)", meta: "— Tesbihat" }
          ]
        },
        premium: {
          kicker: "07 — Premium",
          title: "Daha derin bir deneyim.<br><span class=\"accent\">Daha fazlası seninle.</span>",
          body: "Premium ile daha derin rehberlik, daha gelişmiş araçlar ve yolculuğunu daha yakından destekleyen bir deneyim seninle olur.",
          points: [
            "<strong>Daha derin rehberlik</strong>İhtiyacın olan anda daha kapsayıcı ve daha zengin bir destek sunar.",
            "<strong>Gelişmiş yolculuk ekranları</strong>İlerlemeni daha net görmen ve istikrarını koruman kolaylaşır.",
            "<strong>Ek ibadet araçları</strong>Günlük manevi rutinini destekleyen daha fazla özellik bir araya gelir.",
            "<strong>Daha kişisel deneyim</strong>Ritmine ve ihtiyacına daha uygun bir kullanım akışı sunar."
          ]
        },
        cta: {
          kicker: "08 — Zamanın Manevi Ritmi",
          title: "Vaktini yönetme.<br><span class=\"accent\">Onu anlamlandır.</span>",
          body: "Vaktim, günün her anında sana eşlik eden dingin bir manevi alan sunar. Namaz, Kur'an ve rehberlik tek yerde, tek ritimde buluşur.",
          storeSmalls: ["App Store’dan indir", "Google Play’de aç"]
        },
        footerText: "© 2026 Vaktim. Tüm hakları saklıdır.",
        footerLinks: ["Destek Merkezi", "Gizlilik Politikası", "Aydınlatma Metni", "Kullanım Koşulları", "Sorumluluk Reddi", "İletişim"],
        footerHrefs: ["/destek", "/gizlilik", "/kvkk", "/kullanim-kosullari", "/sorumluluk-reddi", "mailto:destek@vaktim.app"]
      },
      en: {
        lang: "en",
        dir: "ltr",
        title: "Vaktim | Spiritual Guidance App",
        description: "Prayer times, Qur'an, qibla and spiritual guidance come together in one calm flow with Vaktim.",
        brandAlt: "Vaktim logo",
        phoneAlt: "Vaktim app screen on a phone",
        navAriaLabel: "Sections",
        nav: ["Prayer", "Qur'an", "Rafi Hoca", "Premium"],
        headerCta: "Download",
        backText: "Home",
        backHref: "/en/",
        heroTitle: "Connect With<br><span class=\"accent\">Your Time.</span>",
        heroBody: "More than a reminder, Vaktim feels like a companion that brings calm into your day. Prayer, Qur'an and spiritual guidance come together in one gentle flow.",
        heroButtons: ["Explore the App", "See the Journey"],
        heroMetaTitles: ["Calm Experience", "All in One Place", "A Journey That Deepens"],
        heroMetaBodies: [
          "Helps you stay calmer, more centered and more collected throughout the day.",
          "Prayer, Qur'an, qibla and guidance come together in one smooth flow.",
          "Each day helps you move a little closer to your spiritual goals."
        ],
        namaz: {
          kicker: "01 — Prayer Tracking",
          title: "Every prayer, <span class=\"accent\">a mindful step.</span>",
          body: "Keep all prayer times on one screen, stay in rhythm through the day, and follow each prayer with more intention.",
          quote: "See your prayers, mark what you have completed, and keep your routine with ease.",
          names: ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"],
          descriptions: [
            "The day’s first quiet pause",
            "Brings your rhythm back to center",
            "Reminds you without rushing you",
            "Gathers what was left unfinished",
            "Closes the day with calm"
          ],
          labels: ["Done", "Done", "Done", "Make-up Prayer", "Done"]
        },
        quran: {
          kicker: "02 — Qur'an Experience",
          title: "Not just reading,<br><span class=\"accent\">but understanding and feeling.</span>",
          body: "The Qur'an experience helps you read with more focus and calm, so you can move through the verses without feeling lost.",
          quote: "Read, listen, save, and deepen the bond you build with the verses.",
          book: {
            initialLeft: quranPage("Surah 1", "Ayah 5", "Al-Fatiha", "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", "Translation", "You alone we worship, and You alone we ask for help.", "Meaning", "It reminds the believer to turn fully to Allah and rely on Him alone in every matter."),
            initialRight: quranPage("Surah 94", "Ayah 6", "Ash-Sharh", "إِنَّ مَعَ الْعُسْرِ يُسْرًا", "Translation", "Surely with hardship comes ease.", "Meaning", "It reminds you that every hardship carries an opening and a path toward ease."),
            nextLeft: quranPage("Surah 2", "Ayah 286", "Al-Baqarah", "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", "Translation", "Allah does not burden a soul beyond what it can bear.", "Meaning", "It reassures you that every responsibility you face is within the strength you have been given."),
            nextRight: quranPage("Surah 65", "Ayah 3", "At-Talaq", "وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", "Translation", "Whoever places their trust in Allah, He is enough for them.", "Meaning", "It points to true security: placing your trust in Allah and finding sufficiency in Him.")
          }
        },
        rafi: {
          kicker: "03 — Rafi Hoca, Spiritual Guide",
          title: "Ask, talk,<br><span class=\"accent\">learn.</span>",
          body: "Rafi offers quick and clear answers to the questions on your mind, helping you learn with more confidence and direction.",
          quote: "A thoughtful guide beside you whenever you need to ask.",
          name: "Rafi Hoca",
          status: "Always with you",
          user: "I'm having a hard time finding focus today. Where should I begin?",
          ai: "With one small step. Renew your intention, treat the next prayer as a calm preparation, and make space for yourself.",
          typingAria: "Rafi is typing",
          avatarAlt: "Rafi Hoca profile image"
        },
        tools: {
          kicker: "04 — Find the Qibla Direction",
          title: "A calm way<br><span class=\"accent\">toward the right direction.</span>",
          body: "The spiritual tools you need, all in one place.",
          pills: ["Qibla", "Tasbih", "Reminders", "Dhikr Flow"],
          snap: "Qibla found"
        },
        journey: {
          kicker: "05 — Spiritual Journey",
          title: "Small steps,<br><span class=\"accent\">lasting change.</span>",
          body: "See your weekly progress, follow your consistency, and watch how your daily steps grow stronger over time.",
          quote: "Make your small steps visible and let your progress become clearer each day.",
          aria: "Spiritual journey checklist",
          days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          tasks: [
            { icon: "🕌", title: "Prayer", body: "Meet the time of prayer with a calm intention" },
            { icon: "🤲", title: "Dua", body: "Gather your heart with a short supplication" },
            { icon: "📿", title: "Dhikr", body: "Refresh your inner rhythm with a few remembrances" },
            { icon: "📖", title: "Qur'an", body: "Read a short passage and sit with it" },
            { icon: "✨", title: "Salawat", body: "Close the day gently with salawat" }
          ]
        },
        daily: {
          kicker: "06 — Daily Inspiration",
          title: "Fresh meaning<br><span class=\"accent\">every day.</span>",
          body: "Daily verses, prayers, dhikr and short reflections are refreshed each day, giving you a quiet reason to return.",
          cards: [
            { tag: "Verse of the Day", text: "Surely, in the remembrance of Allah do hearts find rest.", meta: "— Ar-Ra'd 13:28" },
            { tag: "Wisdom for Today", text: "The one whose two days are equal is at loss.", meta: "— Reported saying" },
            { tag: "Daily Prayer", text: "O Allah, I ask You for guidance, mindfulness, chastity, and contentment.", meta: "— Prophetic supplication" },
            { tag: "Patience & Gratitude", text: "The patient will be given their reward without measure.", meta: "— Az-Zumar 39:10" },
            { tag: "Dhikr Suggestion", text: "Subhanallah (33 times)", meta: "— Tasbih" }
          ]
        },
        premium: {
          kicker: "07 — Premium",
          title: "A deeper experience.<br><span class=\"accent\">More when you need it.</span>",
          body: "Premium gives you deeper guidance, more advanced tools, and a richer experience that stays closer to your journey.",
          points: [
            "<strong>Deeper guidance</strong>Gives you richer, more supportive answers right when you need them.",
            "<strong>Advanced journey screens</strong>Makes it easier to see your progress clearly and stay consistent.",
            "<strong>More worship tools</strong>Brings together additional features that support your daily spiritual routine.",
            "<strong>A more personal experience</strong>Adapts the flow more closely to your pace and needs."
          ]
        },
        cta: {
          kicker: "08 — The Spiritual Rhythm of Your Time",
          title: "Don't just manage your time.<br><span class=\"accent\">Give it meaning.</span>",
          body: "Vaktim offers a calm spiritual space that stays with you through the day. Prayer, Qur'an and guidance come together in one place, in one rhythm.",
          storeSmalls: ["Download on the", "Get it on"]
        },
        footerText: "© 2026 Vaktim. All rights reserved.",
        footerLinks: ["Support Center", "Privacy Policy", "Privacy Notice", "Terms of Use", "Disclaimer", "Contact"],
        footerHrefs: ["/en/destek", "/en/gizlilik", "/en/kvkk", "/en/kullanim-kosullari", "/en/sorumluluk-reddi", "mailto:destek@vaktim.app"]
      },
      ar: {
        lang: "ar",
        dir: "rtl",
        title: "Vaktim | تطبيق الإرشاد الروحي",
        description: "يجمع Vaktim بين أوقات الصلاة والقرآن والقبلة والإرشاد الروحي في تجربة هادئة واحدة.",
        brandAlt: "شعار Vaktim",
        phoneAlt: "عرض تطبيق Vaktim على الهاتف",
        navAriaLabel: "الأقسام",
        nav: ["الصلاة", "القرآن", "رافي هوجا", "بريميوم"],
        headerCta: "حمّل",
        backText: "الصفحة الرئيسية",
        backHref: "/ar/",
        heroTitle: "ارتبط<br><span class=\"accent\">بوقتك.</span>",
        heroBody: "Vaktim ليس مجرد تذكير، بل رفيق يضيف إلى يومك سكينة ومعنى. الصلاة والقرآن والإرشاد الروحي تجتمع هنا في تدفّق هادئ واحد.",
        heroButtons: ["اكتشف التطبيق", "شاهد الرحلة"],
        heroMetaTitles: ["تجربة هادئة", "كل ما تحتاجه معًا", "رحلة تزداد عمقًا"],
        heroMetaBodies: [
          "يساعدك على البقاء أكثر سكينة وتركيزًا واتزانًا طوال يومك.",
          "الصلاة والقرآن والقبلة والإرشاد تجتمع في مسار واحد.",
          "كل يوم يقربك خطوة من أهدافك الروحية."
        ],
        namaz: {
          kicker: "01 — متابعة الصلاة",
          title: "كل صلاة، <span class=\"accent\">خطوة واعية.</span>",
          body: "تابع أوقات الصلاة في شاشة واحدة، وحافظ على إيقاع يومك، وعِش كل صلاة بنيّة أوضح وحضور أهدأ.",
          quote: "اعرف صلواتك، علّم ما أنجزته، وحافظ على انتظامك بسهولة.",
          names: ["الفجر", "الظهر", "العصر", "المغرب", "العشاء"],
          descriptions: [
            "بداية هادئة لأول لحظات اليوم",
            "يعيد الإيقاع إلى مركزه",
            "يذكّرك من غير أن يثقل عليك",
            "يلمّ ما بقي غير مكتمل",
            "يختتم يومك بسكينة"
          ],
          labels: ["أديتها", "أديتها", "أديتها", "قضاء الصلاة", "أديتها"]
        },
        quran: {
          kicker: "02 — تجربة القرآن",
          title: "ليس قراءة فقط،<br><span class=\"accent\">بل فهمًا وشعورًا.</span>",
          body: "تجربة القرآن تساعدك على القراءة بتركيز وطمأنينة أكبر، لتنتقل بين الآيات بوضوح من غير تشتّت.",
          quote: "اقرأ، واستمع، واحفظ، وعِش الصلة التي تبنيها مع الآيات بعمق أكبر.",
          book: {
            initialLeft: quranPage("سورة 1", "آية 5", "سورة الفاتحة", "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", "المعنى", "إياك نعبد وإياك نستعين.", "الدلالة", "تؤكد أن وجهة العبد كلها إلى الله، وأن الاعتماد الحق لا يكون إلا عليه."),
            initialRight: quranPage("سورة 94", "آية 6", "سورة الشرح", "إِنَّ مَعَ الْعُسْرِ يُسْرًا", "المعنى", "إن مع العسر يسرا.", "الدلالة", "تذكّر بأن في كل ضيق منفذًا، ومع كل عسر بابًا من اليسر."),
            nextLeft: quranPage("سورة 2", "آية 286", "سورة البقرة", "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", "المعنى", "لا يكلّف الله نفسًا إلا وسعها.", "الدلالة", "تطمئن القلب بأن ما يمر به الإنسان داخل حدود ما يستطيع حمله بعون الله."),
            nextRight: quranPage("سورة 65", "آية 3", "سورة الطلاق", "وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", "المعنى", "ومن يتوكل على الله فهو حسبه.", "الدلالة", "تلفت إلى أن السكينة الحقيقية تبدأ من التوكل على الله والثقة بكفايته.")
          }
        },
        rafi: {
          kicker: "03 — رافي هوجا، المرشد الروحي",
          title: "اسأل، وتحدّث،<br><span class=\"accent\">وتعلّم.</span>",
          body: "يقدّم رافي إجابات واضحة وسريعة لما يشغل بالك، لتتعلّم وأنت أكثر طمأنينة ووضوحًا.",
          quote: "مرشد هادئ يرافقك كلما احتجت أن تسأل.",
          name: "رافي هوجا",
          status: "معك دائمًا",
          user: "أشعر أن تركيزي مشتت اليوم. من أين أبدأ؟",
          ai: "ابدأ بخطوة صغيرة. جدّد نيتك، واجعل الصلاة القادمة مساحة هادئة تهيئ قلبك لما بعدها.",
          typingAria: "رافي يكتب الآن",
          avatarAlt: "صورة رافي هوجا"
        },
        tools: {
          kicker: "04 — العثور على اتجاه القبلة",
          title: "نحو الاتجاه الصحيح<br><span class=\"accent\">بهدوء وطمأنينة.</span>",
          body: "الأدوات الروحية التي تحتاجها، كلها في مكان واحد.",
          pills: ["القبلة", "التسبيح", "التذكيرات", "الأذكار"],
          snap: "تم العثور على القبلة"
        },
        journey: {
          kicker: "05 — الرحلة الروحية",
          title: "خطوات صغيرة،<br><span class=\"accent\">وأثر أكبر.</span>",
          body: "تابع تقدمك الأسبوعي، وراقب ثباتك، وشاهد كيف تنمو خطواتك اليومية بوضوح مع الوقت.",
          quote: "اجعل خطواتك الصغيرة مرئية، ودع تقدمك يزداد وضوحًا يومًا بعد يوم.",
          aria: "قائمة مهام الرحلة الروحية",
          days: ["اثن", "ثلا", "أرب", "خمي", "جمع", "سبت", "أحد"],
          tasks: [
            { icon: "🕌", title: "الصلاة", body: "استقبل وقت الصلاة بنية هادئة" },
            { icon: "🤲", title: "الدعاء", body: "جدّد نيتك بدعاء قصير" },
            { icon: "📿", title: "الذكر", body: "أنعش قلبك ببضع أذكار" },
            { icon: "📖", title: "القرآن", body: "اقرأ مقطعًا قصيرًا وتأمل فيه" },
            { icon: "✨", title: "الصلاة على النبي", body: "اختم يومك بهدوء بالصلاة على النبي" }
          ]
        },
        daily: {
          kicker: "06 — المحتوى اليومي",
          title: "إلهام جديد<br><span class=\"accent\">كل يوم.</span>",
          body: "آية اليوم، والدعاء، والذكر، والخواطر القصيرة تتجدد يوميًا لتمنحك سببًا هادئًا للعودة كل يوم.",
          cards: [
            { tag: "آية اليوم", text: "ألا بذكر الله تطمئن القلوب.", meta: "— الرعد، 28" },
            { tag: "حكمة اليوم", text: "من استوى يوماه فهو مغبون.", meta: "— أثر مشهور" },
            { tag: "دعاء اليوم", text: "اللهم إني أسألك الهدى والتقى والعفاف والغنى.", meta: "— دعاء نبوي" },
            { tag: "الصبر والشكر", text: "إنما يوفى الصابرون أجرهم بغير حساب.", meta: "— الزمر، 10" },
            { tag: "ذكر مقترح", text: "سبحان الله (٣٣ مرة)", meta: "— تسبيحات" }
          ]
        },
        premium: {
          kicker: "07 — Premium",
          title: "تجربة أعمق.<br><span class=\"accent\">وخيارات أكثر معك.</span>",
          body: "يمنحك Premium إرشادًا أعمق، وأدوات أكثر تقدمًا، وتجربة أقرب إلى احتياجك في رحلتك.",
          points: [
            "<strong>إرشاد أعمق</strong>يمنحك دعمًا أغنى وأكثر قربًا في اللحظة التي تحتاجها.",
            "<strong>شاشات رحلة أكثر تقدمًا</strong>تجعل رؤية تقدمك والحفاظ على ثباتك أوضح وأسهل.",
            "<strong>أدوات عبادة إضافية</strong>تجمع مزيدًا من المزايا التي تدعم روتينك الروحي اليومي.",
            "<strong>تجربة أكثر خصوصية</strong>تتكيف مع وتيرتك واحتياجك بشكل أقرب."
          ]
        },
        cta: {
          kicker: "08 — الإيقاع الروحي لوقتك",
          title: "لا تُدر وقتك فقط.<br><span class=\"accent\">امنحه معنى.</span>",
          body: "يمنحك Vaktim مساحة روحية هادئة ترافقك طوال اليوم. الصلاة والقرآن والإرشاد تجتمع في مكان واحد وعلى إيقاع واحد.",
          storeSmalls: ["حمّل من", "احصل عليه من"]
        },
        footerText: "© 2026 Vaktim. جميع الحقوق محفوظة.",
        footerLinks: ["مركز الدعم", "سياسة الخصوصية", "نص الإشعار", "شروط الاستخدام", "إخلاء المسؤولية", "تواصل"],
        footerHrefs: ["/ar/destek", "/ar/gizlilik", "/ar/kvkk", "/ar/kullanim-kosullari", "/ar/sorumluluk-reddi", "mailto:destek@vaktim.app"]
      }
    };

    return copy[locale] || copy.tr;
  }

  function applyLocalizedCopy() {
    if (!document.querySelector(".hero") || !document.querySelector("#namaz")) return;

    function setText(selector, text) {
      var node = document.querySelector(selector);
      if (node) node.textContent = text;
    }

    function setHTML(selector, html) {
      var node = document.querySelector(selector);
      if (node) node.innerHTML = html;
    }

    function setAttr(selector, attr, value) {
      var node = document.querySelector(selector);
      if (node) node.setAttribute(attr, value);
    }

    function setTextList(selector, values) {
      var nodes = document.querySelectorAll(selector);
      values.forEach(function (value, index) {
        if (nodes[index]) nodes[index].textContent = value;
      });
    }

    function setHTMLList(selector, values) {
      var nodes = document.querySelectorAll(selector);
      values.forEach(function (value, index) {
        if (nodes[index]) nodes[index].innerHTML = value;
      });
    }

    function setAttrList(selector, attr, values) {
      var nodes = document.querySelectorAll(selector);
      values.forEach(function (value, index) {
        if (nodes[index]) nodes[index].setAttribute(attr, value);
      });
    }

    var locale = getScrollStoryLocale();
    var copy = getScrollStoryCopy(locale);
    var hasDailySection = !!document.querySelector("#daily");
    var premiumKicker = hasDailySection ? copy.premium.kicker : copy.premium.kicker.replace(/^07/, "06");
    var ctaKicker = hasDailySection ? copy.cta.kicker : copy.cta.kicker.replace(/^08/, "07");

    document.documentElement.setAttribute("lang", copy.lang);
    document.documentElement.setAttribute("dir", copy.dir);
    document.title = copy.title;

    setAttr('meta[name="description"]', "content", copy.description);
    setAttr(".brand img", "alt", copy.brandAlt);
    setAttr(".phone img", "alt", copy.phoneAlt);
    setAttr(".nav", "aria-label", copy.navAriaLabel);
    setTextList(".nav a", copy.nav);
    setText(".header-cta", copy.headerCta);
    setText(".back-link", copy.backText);
    setAttr(".back-link", "href", copy.backHref);

    setHTML("#hero h1", copy.heroTitle);
    setText("#hero .hero-copy p", copy.heroBody);
    setText("#hero .actions .btn.primary", copy.heroButtons[0]);
    setText("#hero .actions .btn.ghost", copy.heroButtons[1]);
    setTextList("#hero .meta-card strong", copy.heroMetaTitles);
    setTextList("#hero .meta-card span", copy.heroMetaBodies);

    setText("#namaz .kicker", copy.namaz.kicker);
    setHTML("#namaz h2", copy.namaz.title);
    setText("#namaz p", copy.namaz.body);
    setText("#namaz .quote", copy.namaz.quote);

    var prayerItems = document.querySelectorAll("#namaz [data-prayer-item]");
    prayerItems.forEach(function (item, index) {
      var name = item.querySelector("strong");
      var description = item.querySelectorAll(".time")[1];
      var label = item.querySelector(".status-label");
      if (name) name.textContent = copy.namaz.names[index];
      if (description) description.textContent = copy.namaz.descriptions[index];
      if (label) label.textContent = copy.namaz.labels[index];
    });

    setText("#quran .kicker", copy.quran.kicker);
    setHTML("#quran h2", copy.quran.title);
    setText("#quran p", copy.quran.body);
    setText("#quran .quote", copy.quran.quote);

    setText("#rafi .kicker", copy.rafi.kicker);
    setHTML("#rafi h2", copy.rafi.title);
    setText("#rafi p", copy.rafi.body);
    setText("#rafi .quote", copy.rafi.quote);
    setText("#rafi .chat-head strong", copy.rafi.name);
    setText("#rafi .chat-head .muted", copy.rafi.status);

    var rafiHead = document.querySelector("#rafi .chat-head");
    if (rafiHead && !rafiHead.querySelector(".chat-avatar")) {
      var avatar = document.createElement("img");
      avatar.className = "chat-avatar";
      avatar.src = "/img/rafihocaProfil.png";
      avatar.alt = copy.rafi.avatarAlt;

      var strong = rafiHead.querySelector("strong");
      var muted = rafiHead.querySelector(".muted");
      var meta = document.createElement("div");
      meta.className = "chat-head-meta";
      if (strong) meta.appendChild(strong);
      if (muted) meta.appendChild(muted);

      rafiHead.innerHTML = "";
      rafiHead.appendChild(avatar);
      rafiHead.appendChild(meta);
    } else if (rafiHead && rafiHead.querySelector(".chat-avatar")) {
      rafiHead.querySelector(".chat-avatar").alt = copy.rafi.avatarAlt;
    }

    setText("#rafi .chat-bubble.user", copy.rafi.user);
    setText("#rafi .chat-bubble.ai", copy.rafi.ai);
    setAttr("#rafi .typing", "aria-label", copy.rafi.typingAria);

    setText("#tools .kicker", copy.tools.kicker);
    setHTML("#tools h2", copy.tools.title);
    setText("#tools p", copy.tools.body);
    setTextList("#tools .tool-pill", copy.tools.pills);
    setText("#tools .snap", copy.tools.snap);

    setText("#journey .kicker", copy.journey.kicker);
    setHTML("#journey h2", copy.journey.title);
    setText("#journey p", copy.journey.body);
    setText("#journey .quote", copy.journey.quote);
    setAttr("#journey .journey-plan", "aria-label", copy.journey.aria);
    setTextList("#journey .journey-day-label", copy.journey.days);
    var journeyTasks = document.querySelectorAll("#journey [data-journey-task]");
    journeyTasks.forEach(function (item, index) {
      var task = copy.journey.tasks[index];
      if (!task) return;

      var icon = item.querySelector("[data-journey-task-icon]");
      var title = item.querySelector("[data-journey-task-title]");
      var body = item.querySelector("[data-journey-task-body]");

      if (icon) icon.textContent = task.icon;
      if (title) title.textContent = task.title;
      if (body) body.textContent = task.body;
    });

    setText("#daily .kicker", copy.daily.kicker);
    setHTML("#daily h2", copy.daily.title);
    setText("#daily .daily-copy p", copy.daily.body);
    var dailyCards = document.querySelectorAll("#daily [data-daily-card]");
    dailyCards.forEach(function (item, index) {
      var story = copy.daily.cards[index];
      if (!story) return;

      var tag = item.querySelector("[data-daily-tag]");
      var text = item.querySelector("[data-daily-text]");
      var meta = item.querySelector("[data-daily-meta]");

      if (tag) tag.textContent = story.tag;
      if (text) text.textContent = story.text;
      if (meta) meta.textContent = story.meta;
    });

    setText("#premium .kicker", premiumKicker);
    setHTML("#premium h2", copy.premium.title);
    setText("#premium p", copy.premium.body);
    setHTMLList("#premium .premium-point", copy.premium.points);

    setText("#cta .kicker", ctaKicker);
    setHTML("#cta h2", copy.cta.title);
    setText("#cta p", copy.cta.body);
    setTextList("#cta .store-copy small", copy.cta.storeSmalls);

    setText(".footer .muted", copy.footerText);
    setTextList(".footer-links a", copy.footerLinks);
    setAttrList(".footer-links a", "href", copy.footerHrefs);
  }

  function renderQuranPage(page) {
    return [
      "    <div class=\"surah-meta\"><span>" + page.metaLeft + "</span><span>" + page.metaRight + "</span></div>",
      "    <div class=\"surah-title\">" + page.title + "</div>",
      "    <div class=\"surah-arabic\">" + page.arabic + "</div>",
      "    <div class=\"surah-translation\"><strong>" + page.translationLabel + "</strong>" + page.translation + "</div>",
      "    <div class=\"ayah\"><strong>" + page.meaningLabel + "</strong>" + page.meaning + "</div>"
    ].join("");
  }

  function hydrateLocalizedQuranBook() {
    var book = document.querySelector(".book.quran-book");
    if (!book) return;

    var copy = getScrollStoryCopy(getScrollStoryLocale()).quran.book;

    book.innerHTML = [
      '<div class="page left start">',
      '  <div class="page-layer">' + renderQuranPage(copy.initialLeft) + '</div>',
      '</div>',
      '<div class="page left final">',
      '  <div class="page-layer">' + renderQuranPage(copy.nextLeft) + '</div>',
      '</div>',
      '<div class="page right final">',
      '  <div class="page-layer">' + renderQuranPage(copy.nextRight) + '</div>',
      '</div>',
      '<div class="page turn-right">',
      '  <div class="page-layer">' + renderQuranPage(copy.initialRight) + '</div>',
      '</div>',
      '<div class="page turn-left">',
      '  <div class="page-layer">' + renderQuranPage(copy.nextLeft) + '</div>',
      '</div>'
    ].join("");
  }

  function normalizeTurkishCopy() {
    if (!document.querySelector(".hero") || !document.querySelector("#namaz")) return;

    function setText(selector, text) {
      var node = document.querySelector(selector);
      if (node) node.textContent = text;
    }

    function setHTML(selector, html) {
      var node = document.querySelector(selector);
      if (node) node.innerHTML = html;
    }

    function setAttr(selector, attr, value) {
      var node = document.querySelector(selector);
      if (node) node.setAttribute(attr, value);
    }

    function setTextList(selector, values) {
      var nodes = document.querySelectorAll(selector);
      values.forEach(function (value, index) {
        if (nodes[index]) nodes[index].textContent = value;
      });
    }

    function setHTMLList(selector, values) {
      var nodes = document.querySelectorAll(selector);
      values.forEach(function (value, index) {
        if (nodes[index]) nodes[index].innerHTML = value;
      });
    }

    document.title = "Vaktim | Manevi Rehberlik Uygulamas\u0131";
    setAttr('meta[name="description"]', "content", "Vaktim ile namaz takibi, Kur'an, k\u0131ble ve manevi rehberlik tek yerde bulu\u015fur.");
    setAttr(".phone img", "alt", "Vaktim uygulamas\u0131 telefon g\u00f6r\u00fcn\u00fcm\u00fc");

    setText("#hero .hero-copy p", "Vaktini hat\u0131rlatan de\u011fil, kalbine de dokunan bir yol arkada\u015f\u0131. Namaz, Kur'an ve manevi rehberlik ayn\u0131 ak\u0131\u015fta bulu\u015farak g\u00fcn\u00fcn i\u00e7ine daha derin bir huzur ta\u015f\u0131yor.");
    setText("#hero .actions .btn.primary", "Uygulamay\u0131 Ke\u015ffet");
    setText("#hero .actions .btn.ghost", "Yolculu\u011fu G\u00f6r");
    setTextList("#hero .meta-card strong", ["Huzurlu Deneyim", "Tek Yerde", "Derinle\u015fen Yolculuk"]);
    setTextList("#hero .meta-card span", [
      "G\u00fcn boyunca daha sakin, daha toplu ve daha merkezde kalmana e\u015flik eder.",
      "Namaz, Kur'an, k\u0131ble ve rehberlik ayn\u0131 ak\u0131\u015fta bulu\u015fur.",
      "Her g\u00fcn, manevi hedeflerine biraz daha yak\u0131nla\u015fmana yard\u0131mc\u0131 olur."
    ]);

    setHTML("#namaz h2", "Her vakit, <span class=\"accent\">bilin\u00e7li bir ad\u0131m.</span>");
    setText("#namaz p", "Namaz vakitlerini tek ekranda takip et, g\u00fcnl\u00fck d\u00fczenini koru ve her ibadeti daha bilin\u00e7li bir ritimle s\u00fcrd\u00fcr.");
    setText("#namaz .quote", "Vakitlerini g\u00f6r, tamamlad\u0131klar\u0131n\u0131 i\u015faretle, d\u00fczenini kolayca s\u00fcrd\u00fcr.");

    var prayerItems = document.querySelectorAll("#namaz [data-prayer-item]");
    var prayerNames = ["Sabah", "\u00d6\u011fle", "\u0130kindi", "Ak\u015fam", "Yats\u0131"];
    var prayerDescriptions = [
      "G\u00fcn\u00fcn ilk sakin dura\u011f\u0131",
      "Ritmi tekrar merkeze al\u0131r",
      "Hat\u0131rlat\u0131r, acele ettirmez",
      "Bir eksik kald\u0131ysa toparlar",
      "G\u00fcn kapan\u0131rken toparlar"
    ];
    var prayerLabels = ["K\u0131ld\u0131m", "K\u0131ld\u0131m", "K\u0131ld\u0131m", "Kaza Namaz\u0131m", "K\u0131ld\u0131m"];

    prayerItems.forEach(function (item, index) {
      var name = item.querySelector("strong");
      var description = item.querySelectorAll(".time")[1];
      var label = item.querySelector(".status-label");
      if (name) name.textContent = prayerNames[index];
      if (description) description.textContent = prayerDescriptions[index];
      if (label) label.textContent = prayerLabels[index];
    });

    setHTML("#quran h2", "Okumak de\u011fil,<br><span class=\"accent\">anlamak ve hissetmek.</span>");
    setText("#quran p", "Kur'an deneyimi, okumay\u0131 daha odakl\u0131 ve daha sakin bir hale getirir; ayetler aras\u0131nda kaybolmadan ilerlemeni kolayla\u015ft\u0131r\u0131r.");
    setText("#quran .quote", "Oku, dinle, kaydet ve ayetlerle kurdu\u011fun ba\u011f\u0131 daha derin ya\u015fa.");

    setText("#rafi .kicker", "03 \u2014 Rafi Hoca Manevi Rehber");
    setHTML("#rafi h2", "Sor, konu\u015f,<br><span class=\"accent\">\u00f6\u011fren.</span>");
    setText("#rafi p", "Rafi, merak etti\u011fin konularda h\u0131zl\u0131 ve anla\u015f\u0131l\u0131r cevaplar sunarak \u00f6\u011frenirken daha g\u00fcvende ve daha y\u00f6nlendirilmi\u015f hissetmeni sa\u011flar.");
    setText("#rafi .quote", "Sormak istedi\u011fin her konuda yan\u0131nda olan ak\u0131ll\u0131 bir rehber.");
    setText("#rafi .chat-head strong", "Rafi Hoca");
    setText("#rafi .chat-head .muted", "Her zaman yan\u0131nda");
    var rafiHead = document.querySelector("#rafi .chat-head");
    if (rafiHead && !rafiHead.querySelector(".chat-avatar")) {
      var avatar = document.createElement("img");
      avatar.className = "chat-avatar";
      avatar.src = "/img/rafihocaProfil.png";
      avatar.alt = "Rafi Hoca profil gorseli";

      var strong = rafiHead.querySelector("strong");
      var muted = rafiHead.querySelector(".muted");
      var meta = document.createElement("div");
      meta.className = "chat-head-meta";
      if (strong) meta.appendChild(strong);
      if (muted) meta.appendChild(muted);

      rafiHead.innerHTML = "";
      rafiHead.appendChild(avatar);
      rafiHead.appendChild(meta);
    }
    setText("#rafi .chat-bubble.user", "Bug\u00fcn oda\u011f\u0131m\u0131 toplamakta zorlan\u0131yorum. Nereden ba\u015flamal\u0131y\u0131m?");
    setText("#rafi .chat-bubble.ai", "K\u00fc\u00e7\u00fck bir ad\u0131mla. Niyet et, en yak\u0131n vakti sakin bir haz\u0131rl\u0131k olarak g\u00f6r ve kendine alan a\u00e7.");
    setAttr("#rafi .typing", "aria-label", "Rafi yaz\u0131yor");

    setText("#tools .kicker", "04 \u2014 K\u0131ble Y\u00f6n\u00fcn\u00fc Bulma");
    setHTML("#tools h2", "Do\u011fru y\u00f6ne sakin bir<br><span class=\"accent\">yakla\u015f\u0131m.</span>");
    setText("#tools p", "\u0130htiyac\u0131n olan manevi ara\u00e7lar bir arada.");
    setTextList("#tools .tool-pill", ["K\u0131ble", "Tesbihat", "Hat\u0131rlatmalar", "Zikir Ak\u0131\u015f\u0131"]);
    setText("#tools .snap", "K\u0131ble bulundu");

    setHTML("#journey h2", "K\u00fc\u00e7\u00fck ad\u0131mlar,<br><span class=\"accent\">b\u00fcy\u00fck de\u011fi\u015fim.</span>");
    setText("#journey p", "Haftal\u0131k ilerleyi\u015fini g\u00f6r, istikrar\u0131n\u0131 takip et ve g\u00fcnl\u00fck ad\u0131mlar\u0131n\u0131n zamanla nas\u0131l g\u00fc\u00e7lendi\u011fini net bir \u015fekilde izle.");
    setText("#journey .quote", "K\u00fc\u00e7\u00fck ad\u0131mlar\u0131n\u0131 g\u00f6r\u00fcn\u00fcr k\u0131l, ilerleyi\u015fini her g\u00fcn biraz daha belirginle\u015ftir.");
    setAttr("#journey svg", "aria-label", "Manevi yolculuk grafi\u011fi");

    setHTML("#premium h2", "Daha derin bir deneyim.<br><span class=\"accent\">Daha fazlas\u0131 seninle.</span>");
    setText("#premium p", "Premium ile daha derin rehberlik, daha geli\u015fmi\u015f ara\u00e7lar ve yolculu\u011funu daha yak\u0131ndan destekleyen bir deneyim seninle olur.");
    setHTMLList("#premium .premium-point", [
      "<strong>Daha derin rehberlik</strong>\u0130htiyac\u0131n olan anda daha kapsay\u0131c\u0131 ve daha zengin bir destek sunar.",
      "<strong>Geli\u015fmi\u015f yolculuk ekranlar\u0131</strong>\u0130lerlemeni daha net g\u00f6rmen ve istikrar\u0131n\u0131 koruman kolayla\u015f\u0131r.",
      "<strong>Ek ibadet ara\u00e7lar\u0131</strong>G\u00fcnl\u00fck manevi rutinini destekleyen daha fazla \u00f6zellik bir araya gelir.",
      "<strong>Daha ki\u015fisel deneyim</strong>Ritmine ve ihtiyac\u0131na daha uygun bir kullan\u0131m ak\u0131\u015f\u0131 sunar."
    ]);

    setText("#cta .kicker", "07 — Zamanın Manevi Ritmi");
    setHTML("#cta h2", "Vaktini y\u00f6netme.<br><span class=\"accent\">Onu anlamland\u0131r.</span>");
    setText("#cta p", "Vaktim, g\u00fcn\u00fcn her an\u0131nda sana e\u015flik eden dingin bir manevi alan sunar. Namaz, Kur'an ve rehberlik tek yerde, tek ritimde bulu\u015fur.");

    setText(".footer .muted", "\u00a9 2026 Vaktim. T\u00fcm haklar\u0131 sakl\u0131d\u0131r.");
    setTextList(".footer-links a", [
      "Destek Merkezi",
      "Gizlilik Politikas\u0131",
      "Ayd\u0131nlatma Metni",
      "Kullan\u0131m Ko\u015fullar\u0131",
      "Sorumluluk Reddi",
      "\u0130leti\u015fim"
    ]);
  }

  function hydrateQuranBookLegacy() {
    var book = document.querySelector(".book.quran-book");
    if (!book) return;

    book.innerHTML = [
      '<div class="page left">',
      '  <div class="page-layer primary">',
      '    <div class="surah-meta"><span>1. Sure</span><span>5. Ayet</span></div>',
      '    <div class="surah-title">F&acirc;tiha Suresi</div>',
      '    <div class="surah-arabic">&#1573;&#1616;&#1610;&#1614;&#1617;&#1575;&#1603;&#1614;&#32;&#1606;&#1614;&#1593;&#1618;&#1576;&#1615;&#1583;&#1615;&#32;&#1608;&#1614;&#1573;&#1616;&#1610;&#1614;&#1617;&#1575;&#1603;&#1614;&#32;&#1606;&#1614;&#1587;&#1618;&#1578;&#1614;&#1593;&#1616;&#1610;&#1606;&#1615;</div>',
      '    <div class="surah-translation"><strong>Meal</strong>Yaln&#305;z sana kulluk eder, yaln&#305;z senden yard&#305;m dileriz.</div>',
      '    <div class="ayah"><strong>Anlam</strong>Kulun t&uuml;m y&ouml;neli&#351;ini Allah&#39;a vermesi ve her konuda sadece O&#39;na dayanmas&#305; gerekti&#287;ini ifade eder.</div>',
      '  </div>',
      '  <div class="page-layer secondary">',
      '    <div class="surah-meta"><span>2. Sure</span><span>286. Ayet</span></div>',
      '    <div class="surah-title">Bakara Suresi</div>',
      '    <div class="surah-arabic">لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا</div>',
      '    <div class="surah-translation"><strong>Meal</strong>Allah hi&ccedil; kimseye g&uuml;c&uuml;n&uuml;n yetti&#287;inden fazlas&#305;n&#305; y&uuml;klemez.</div>',
      '    <div class="ayah"><strong>Anlam</strong>&#304;nsan&#305;n kar&#351;&#305;la&#351;t&#305;&#287;&#305; her sorumlulu&#287;un asl&#305;nda ta&#351;&#305;yabilece&#287;i kadar oldu&#287;unu bildirir.</div>',
      '  </div>',
      '</div>',
      '<div class="page right-underlay">',
      '  <div class="page-layer primary">',
      '    <div class="surah-meta"><span>65. Sure</span><span>3. Ayet</span></div>',
      '    <div class="surah-title">Talak Suresi</div>',
      '    <div class="surah-arabic">وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ</div>',
      '    <div class="surah-translation"><strong>Meal</strong>Kim Allah&#39;a tevekk&uuml;l ederse, O ona yeter.</div>',
      '    <div class="ayah"><strong>Anlam</strong>Ger&ccedil;ek g&uuml;venin Allah&#39;a dayanmak oldu&#287;unu ve bunun insan i&ccedil;in yeterli olaca&#287;&#305;n&#305; vurgular.</div>',
      '  </div>',
      '</div>',
      '<div class="page right current">',
      '  <div class="page-layer primary">',
      '    <div class="surah-meta"><span>94. Sure</span><span>6. Ayet</span></div>',
      '    <div class="surah-title">&#304;n&#351;irah Suresi</div>',
      '    <div class="surah-arabic">&#1573;&#1616;&#1606;&#1614;&#1617;&#32;&#1605;&#1614;&#1593;&#1614;&#32;&#1575;&#1604;&#1618;&#1593;&#1615;&#1587;&#1618;&#1585;&#1616;&#32;&#1610;&#1615;&#1587;&#1618;&#1585;&#1611;&#1575;</div>',
      '    <div class="surah-translation"><strong>Meal</strong>&#350;&uuml;phesiz zorlukla beraber bir kolayl&#305;k vard&#305;r.</div>',
      '    <div class="ayah"><strong>Anlam</strong>Her s&#305;k&#305;nt&#305;n&#305;n i&ccedil;inde mutlaka bir &ccedil;&#305;k&#305;&#351; ve kolayl&#305;k bulundu&#287;unu hat&#305;rlat&#305;r.</div>',
      '  </div>',
      '</div>'
    ].join("");
    return;

    book.innerHTML = [
      '<div class="page left">',
      '  <div class="page-layer primary">',
      '    <div class="surah-meta"><span>1. Sure</span><span>7 Ayet</span></div>',
      '    <div class="surah-title">F&acirc;tiha</div>',
      '    <div class="surah-arabic">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>',
      '    <div class="surah-translation">Rahm&acirc;n ve Rah&icirc;m olan Allah&#39;&#305;n ad&#305;yla. Hamd, alemlerin Rabbi Allah&#39;a mahsustur.</div>',
      '    <div class="ayah">Her ba&#351;lang&#305;&ccedil;, kalbi toplayan bir dua ile berrakla&#351;&#305;r.</div>',
      '  </div>',
      '  <div class="page-layer secondary">',
      '    <div class="surah-meta"><span>112. Sure</span><span>4 Ayet</span></div>',
      '    <div class="surah-title">&#304;hl&acirc;s</div>',
      '    <div class="surah-arabic">قُلْ هُوَ اللَّهُ أَحَدٌ</div>',
      '    <div class="surah-translation">De ki: O Allah birdir. Allah Samed&#39;dir; do&#287;urmam&#305;&#351; ve do&#287;rulmam&#305;&#351;t&#305;r.</div>',
      '    <div class="ayah">Tevhid, kalbi sadele&#351;tirir ve niyeti tek bir merkeze toplar.</div>',
      '  </div>',
      '</div>',
      '<div class="page right">',
      '  <div class="page-layer primary">',
      '    <div class="surah-meta"><span>2. Sure</span><span>Bakara</span></div>',
      '    <div class="surah-title">Bakara</div>',
      '    <div class="surah-arabic">ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ</div>',
      '    <div class="surah-translation">Bu, kendisinde &#351;&uuml;phe olmayan kitapt&#305;r. Muttakiler i&ccedil;in bir rehberdir.</div>',
      '    <div class="ayah">Rehberlik, kalp haz&#305;r oldu&#287;unda kelimelerin i&ccedil;inde daha a&ccedil;&#305;k g&ouml;r&uuml;n&uuml;r.</div>',
      '  </div>',
      '  <div class="page-layer secondary">',
      '    <div class="surah-meta"><span>2:255</span><span>Ayet-el K&uuml;rs&icirc;</span></div>',
      '    <div class="surah-title">Ayet-el K&uuml;rs&icirc;</div>',
      '    <div class="surah-arabic">اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ</div>',
      '    <div class="surah-translation">Allah, kendisinden ba&#351;ka ilah olmayand&#305;r; diridir, kayyumdur. O&#39;nun ilmi her &#351;eyi ku&#351;at&#305;r.</div>',
      '    <div class="ayah">Koruyup g&ouml;zeten kudret, kalbe emniyet ve derin bir teslimiyet verir.</div>',
      '  </div>',
      '</div>'
    ].join("");
  }

  function hydrateQuranBook() {
    var book = document.querySelector(".book.quran-book");
    if (!book) return;

    var initialLeft = [
      '    <div class="surah-meta"><span>Sure 1</span><span>Ayet 5</span></div>',
      '    <div class="surah-title">F&acirc;tiha Suresi</div>',
      '    <div class="surah-arabic">&#1573;&#1616;&#1610;&#1614;&#1617;&#1575;&#1603;&#1614;&#32;&#1606;&#1614;&#1593;&#1618;&#1576;&#1615;&#1583;&#1615;&#32;&#1608;&#1614;&#1573;&#1616;&#1610;&#1614;&#1617;&#1575;&#1603;&#1614;&#32;&#1606;&#1614;&#1587;&#1618;&#1578;&#1614;&#1593;&#1616;&#1610;&#1606;&#1615;</div>',
      '    <div class="surah-translation"><strong>Meal</strong>Yaln&#305;z sana kulluk eder, yaln&#305;z senden yard&#305;m dileriz.</div>',
      '    <div class="ayah"><strong>Anlam</strong>Kulun t&uuml;m y&ouml;neli&#351;ini Allah&#39;a vermesi ve her konuda sadece O&#39;na dayanmas&#305; gerekti&#287;ini ifade eder.</div>'
    ].join("");

    var initialRight = [
      '    <div class="surah-meta"><span>Sure 94</span><span>Ayet 6</span></div>',
      '    <div class="surah-title">&#304;n&#351;irah Suresi</div>',
      '    <div class="surah-arabic">&#1573;&#1616;&#1606;&#1614;&#1617;&#32;&#1605;&#1614;&#1593;&#1614;&#32;&#1575;&#1604;&#1618;&#1593;&#1615;&#1587;&#1618;&#1585;&#1616;&#32;&#1610;&#1615;&#1587;&#1618;&#1585;&#1611;&#1575;</div>',
      '    <div class="surah-translation"><strong>Meal</strong>&#350;&uuml;phesiz zorlukla beraber bir kolayl&#305;k vard&#305;r.</div>',
      '    <div class="ayah"><strong>Anlam</strong>Her s&#305;k&#305;nt&#305;n&#305;n i&ccedil;inde mutlaka bir &ccedil;&#305;k&#305;&#351; ve kolayl&#305;k bulundu&#287;unu hat&#305;rlat&#305;r.</div>'
    ].join("");

    var nextLeft = [
      '    <div class="surah-meta"><span>Sure 2</span><span>Ayet 286</span></div>',
      '    <div class="surah-title">Bakara Suresi</div>',
      '    <div class="surah-arabic">&#1604;&#1614;&#1575;&#32;&#1610;&#1615;&#1603;&#1614;&#1604;&#1616;&#1617;&#1601;&#1615;&#32;&#1575;&#1604;&#1604;&#1614;&#1617;&#1607;&#1615;&#32;&#1606;&#1614;&#1601;&#1618;&#1587;&#1611;&#1575;&#32;&#1573;&#1616;&#1604;&#1614;&#1617;&#1575;&#32;&#1608;&#1615;&#1587;&#1618;&#1593;&#1614;&#1607;&#1614;&#1575;</div>',
      '    <div class="surah-translation"><strong>Meal</strong>Allah hi&ccedil; kimseye g&uuml;c&uuml;n&uuml;n yetti&#287;inden fazlas&#305;n&#305; y&uuml;klemez.</div>',
      '    <div class="ayah"><strong>Anlam</strong>&#304;nsan&#305;n kar&#351;&#305;la&#351;t&#305;&#287;&#305; her sorumlulu&#287;un asl&#305;nda ta&#351;&#305;yabilece&#287;i kadar oldu&#287;unu bildirir.</div>'
    ].join("");

    var nextRight = [
      '    <div class="surah-meta"><span>Sure 65</span><span>Ayet 3</span></div>',
      '    <div class="surah-title">Talak Suresi</div>',
      '    <div class="surah-arabic">&#1608;&#1614;&#1605;&#1614;&#1606;&#1618;&#32;&#1610;&#1614;&#1578;&#1614;&#1608;&#1614;&#1603;&#1614;&#1617;&#1604;&#1618;&#32;&#1593;&#1614;&#1604;&#1614;&#1609;&#32;&#1575;&#1604;&#1604;&#1614;&#1617;&#1607;&#1616;&#32;&#1601;&#1614;&#1607;&#1615;&#1608;&#1614;&#32;&#1581;&#1614;&#1587;&#1618;&#1576;&#1615;&#1607;&#1615;</div>',
      '    <div class="surah-translation"><strong>Meal</strong>Kim Allah&#39;a tevekk&uuml;l ederse, O ona yeter.</div>',
      '    <div class="ayah"><strong>Anlam</strong>Ger&ccedil;ek g&uuml;venin Allah&#39;a dayanmak oldu&#287;unu ve bunun insan i&ccedil;in yeterli olaca&#287;&#305;n&#305; vurgular.</div>'
    ].join("");

    book.innerHTML = [
      '<div class="page left start">',
      '  <div class="page-layer">' + initialLeft + '</div>',
      '</div>',
      '<div class="page left final">',
      '  <div class="page-layer">' + nextLeft + '</div>',
      '</div>',
      '<div class="page right final">',
      '  <div class="page-layer">' + nextRight + '</div>',
      '</div>',
      '<div class="page turn-right">',
      '  <div class="page-layer">' + initialRight + '</div>',
      '</div>',
      '<div class="page turn-left">',
      '  <div class="page-layer">' + nextLeft + '</div>',
      '</div>'
    ].join("");
  }

  function setupPrayerToggles() {
    var toggles = document.querySelectorAll("[data-status-toggle]");
    var section = document.getElementById("namaz");
    var hand = document.getElementById("prayerTapHand");
    if (!toggles.length || !section || !hand) return;

    var sequenceStarted = false;
    var stepGap = 1220;
    var showDelay = 140;
    var tapDelay = 520;
    var endPause = 1850;

    function moveHandTo(toggle, immediate) {
      var stack = toggle.closest(".prayer-stack");
      var circle = toggle.querySelector(".status-circle");
      if (!stack || !circle) return;

      var stackRect = stack.getBoundingClientRect();
      var circleRect = circle.getBoundingClientRect();
      var isMobile = window.innerWidth <= 720;
      var handWidth = hand.offsetWidth || 42;
      var handHeight = hand.offsetHeight || 42;
      var tipX = 0.22;
      var tipY = 0.14;
      var x = circleRect.left + circleRect.width * 0.5 - stackRect.left - handWidth * tipX;
      var y = circleRect.top + circleRect.height * 0.5 - stackRect.top - handHeight * tipY;

      if (immediate || isMobile) {
        hand.style.transition = "none";
        hand.style.left = x.toFixed(1) + "px";
        hand.style.top = y.toFixed(1) + "px";
        hand.getBoundingClientRect();
        hand.style.transition = "";
        return;
      }

      hand.style.left = x.toFixed(1) + "px";
      hand.style.top = y.toFixed(1) + "px";
    }

    function resetPrayerState() {
      toggles.forEach(function (toggle) {
        var item = toggle.closest("[data-prayer-item]");
        toggle.classList.remove("is-tapping", "is-active");
        toggle.setAttribute("aria-pressed", "false");

        if (item) {
          item.classList.remove("is-hovered", "is-complete", "is-kaza");
        }
      });
    }

    function activateToggle(toggle) {
      var item = toggle.closest("[data-prayer-item]");
      var isKaza = toggle.getAttribute("data-status-kind") === "kaza";

      if (item) item.classList.add("is-hovered");
      toggle.classList.add("is-tapping");
      hand.classList.add("is-tapping");

      window.setTimeout(function () {
        hand.classList.remove("is-tapping");
        toggle.classList.remove("is-tapping");
        toggle.classList.add("is-active");
        toggle.setAttribute("aria-pressed", "true");

        if (item) {
          item.classList.toggle("is-complete", !isKaza);
          item.classList.toggle("is-kaza", isKaza);
          window.setTimeout(function () {
            item.classList.remove("is-hovered");
          }, 260);
        }
      }, 380);
    }

    function runSequence() {
      resetPrayerState();
      hand.classList.remove("is-visible", "is-tapping");
      moveHandTo(toggles[0], true);

      window.setTimeout(function () {
        hand.classList.add("is-visible");
      }, showDelay);

      toggles.forEach(function (toggle, index) {
        var moveAt = showDelay + index * stepGap;
        var tapAt = moveAt + tapDelay;

        window.setTimeout(function () {
          moveHandTo(toggle);
        }, moveAt);

        window.setTimeout(function () {
          activateToggle(toggle);
        }, tapAt);
      });

      window.setTimeout(function () {
        hand.classList.remove("is-visible", "is-tapping");
      }, showDelay + toggles.length * stepGap);

      window.setTimeout(function () {
        runSequence();
      }, showDelay + toggles.length * stepGap + endPause);
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || sequenceStarted) return;

          sequenceStarted = true;
          runSequence();

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.45 }
    );

    moveHandTo(toggles[0], true);

    window.addEventListener("resize", function () {
      if (!sequenceStarted) {
        moveHandTo(toggles[0], true);
      }
    });

    observer.observe(section);
  }

  function setupCompassSequence() {
    var toolsSection = document.getElementById("tools");
    var compass = document.getElementById("compassWidget");
    if (!toolsSection || !compass) return;

    var sequenceStarted = false;
    var searchDuration = 7600;
    var lockedPause = 1800;
    var returnDuration = 1300;

    function runCompassLoop() {
      compass.classList.remove("is-searching", "is-locked", "is-returning");
      compass.getBoundingClientRect();
      compass.classList.add("is-searching");

      window.setTimeout(function () {
        compass.classList.remove("is-searching");
        compass.classList.add("is-locked");
      }, searchDuration);

      window.setTimeout(function () {
        compass.classList.remove("is-locked");
        compass.classList.add("is-returning");
      }, searchDuration + lockedPause);

      window.setTimeout(function () {
        runCompassLoop();
      }, searchDuration + lockedPause + returnDuration);
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || sequenceStarted) return;

          sequenceStarted = true;
          runCompassLoop();

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.42 }
    );

    observer.observe(toolsSection);
  }

  function setupJourneyChecklist() {
    var section = document.getElementById("journey");
    var plan = document.querySelector("#journey .journey-plan");
    var hand = document.getElementById("journeyTapHand");
    var days = document.querySelectorAll("#journey [data-journey-day]");
    var checks = document.querySelectorAll("#journey [data-journey-check]");
    if (!section || !plan || !hand || !days.length || !checks.length) return;

    var sequenceStarted = false;
    var showDelay = 160;
    var isMobileViewport = window.innerWidth <= 720;
    var moveGap = isMobileViewport ? 1160 : 980;
    var tapDelay = isMobileViewport ? 780 : 460;
    var betweenDaysPause = 860;
    var loopPause = 1900;

    function moveHandTo(check, immediate) {
      var circle = check.querySelector(".journey-check-circle");
      if (!circle) return;

      var planRect = plan.getBoundingClientRect();
      var circleRect = circle.getBoundingClientRect();
      var isMobile = window.innerWidth <= 720;
      var handWidth = hand.offsetWidth || 30;
      var handHeight = hand.offsetHeight || 30;
      var tipX = 0.22;
      var tipY = 0.14;
      var x = circleRect.left + circleRect.width * 0.5 - planRect.left - handWidth * tipX;
      var y = circleRect.top + circleRect.height * 0.5 - planRect.top - handHeight * tipY;

      if (immediate || isMobile) {
        hand.style.transition = "none";
        hand.style.left = x.toFixed(1) + "px";
        hand.style.top = y.toFixed(1) + "px";
        hand.getBoundingClientRect();
        hand.style.transition = "";
        return;
      }

      hand.style.left = x.toFixed(1) + "px";
      hand.style.top = y.toFixed(1) + "px";
    }

    function clearChecks() {
      checks.forEach(function (check) {
        var task = check.closest("[data-journey-task]");
        check.classList.remove("is-active", "is-tapping");
        check.setAttribute("aria-pressed", "false");
        if (task) task.classList.remove("is-focused");
      });
    }

    function setDayProgress(day, progress) {
      if (!day) return;
      var normalized = Math.max(0, Math.min(1, progress));
      day.style.setProperty("--day-progress", String(normalized));
      day.style.setProperty("--day-progress-angle", (normalized * 360).toFixed(1) + "deg");
    }

    function resetDays() {
      days.forEach(function (day) {
        day.classList.remove("is-current", "is-done", "is-complete");
        setDayProgress(day, 0);
      });
    }

    function setCurrentDay(index) {
      days.forEach(function (day, dayIndex) {
        day.classList.toggle("is-current", dayIndex === index);
        day.classList.toggle("is-done", dayIndex < index);
        day.classList.toggle("is-complete", dayIndex < index);
        setDayProgress(day, dayIndex < index ? 1 : 0);
      });
    }

    function activateCheck(check, day, progress) {
      var task = check.closest("[data-journey-task]");
      if (task) task.classList.add("is-focused");
      check.classList.add("is-tapping");
      hand.classList.add("is-tapping");

      window.setTimeout(function () {
        hand.classList.remove("is-tapping");
        check.classList.remove("is-tapping");
        check.classList.add("is-active");
        check.setAttribute("aria-pressed", "true");
        setDayProgress(day, progress);
        if (day) day.classList.toggle("is-complete", progress >= 1);

        if (task) {
          window.setTimeout(function () {
            task.classList.remove("is-focused");
          }, 240);
        }
      }, 320);
    }

    function runLoop() {
      resetDays();
      clearChecks();
      hand.classList.remove("is-visible", "is-tapping");
      moveHandTo(checks[0], true);

      window.setTimeout(function () {
        hand.classList.add("is-visible");
      }, showDelay);

      days.forEach(function (day, dayIndex) {
        var dayStart = showDelay + dayIndex * (checks.length * moveGap + betweenDaysPause);

        window.setTimeout(function () {
          clearChecks();
          setCurrentDay(dayIndex);
          moveHandTo(checks[0], dayIndex === 0);
        }, dayStart);

        checks.forEach(function (check, checkIndex) {
          var moveAt = dayStart + checkIndex * moveGap;
          var tapAt = moveAt + tapDelay;

          if (!(dayIndex === 0 && checkIndex === 0)) {
            window.setTimeout(function () {
              moveHandTo(check);
            }, moveAt);
          }

          window.setTimeout(function () {
            activateCheck(check, day, (checkIndex + 1) / checks.length);
          }, tapAt);
        });

        window.setTimeout(function () {
          day.classList.remove("is-current");
          day.classList.add("is-done");
        }, dayStart + checks.length * moveGap + 160);
      });

      var totalDuration = showDelay + days.length * (checks.length * moveGap + betweenDaysPause);

      window.setTimeout(function () {
        hand.classList.remove("is-visible", "is-tapping");
      }, totalDuration - betweenDaysPause + 420);

      window.setTimeout(function () {
        runLoop();
      }, totalDuration + loopPause);
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || sequenceStarted) return;

          sequenceStarted = true;
          runLoop();

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.42 }
    );

    moveHandTo(checks[0], true);

    window.addEventListener("resize", function () {
      if (!sequenceStarted) {
        moveHandTo(checks[0], true);
      }
    });

    observer.observe(section);
  }

  function updateSceneProgress() {
    updateHeroProgress();
    updateHeaderState();
  }

  function init() {
    applyLocalizedCopy();
    hydrateLocalizedQuranBook();
    buildParticles();
    setupReveal();
    bindAnchorScroll();
    setupPrayerToggles();
    setupCompassSequence();
    setupJourneyChecklist();
    updateSceneProgress();

    window.addEventListener(
      "scroll",
      function () {
        updateSceneProgress();
      },
      { passive: true }
    );

    window.addEventListener("resize", updateSceneProgress);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
