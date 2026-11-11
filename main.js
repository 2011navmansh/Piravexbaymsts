/* ============================================================
   PIRAVEXBAY MSTS — Global Scripts
   Navbar, mobile menu, universal search, counters, reveal,
   marquee, back-to-top, filters.
   ============================================================ */

/* ============================================================
   LENIS SMOOTH SCROLL — strong glide (mibproduction-style)
   Local lenis.min.js dynamically inject hota hai — har page par
   alag se script tag lagane ki zaroorat nahi. Agar file load na
   ho (offline/blocked), to native smooth scroll waisa hi chalta
   rahega — site kabhi break nahi hoti.
   ============================================================ */
window.AB_LENIS = null;
(function () {
  'use strict';
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    /* Mobile/touch devices already have native momentum scrolling —
       Lenis only adds overhead there. Keep it for mouse/trackpad. */
    if (window.matchMedia && !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    var conn = navigator.connection;
    if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) return;
    var s = document.createElement('script');
    s.src = 'lenis.min.js?v=1.1.19';
    s.async = true;
    s.onload = function () {
      try {
        if (typeof Lenis === 'undefined') return;
        /* Refsite (mibproduction) = lerp 0.1 + duration 1.2 + expo easing.
           Yahan duration 1.8 — matlab usse bhi lambi, badi glide. */
        window.AB_LENIS = new Lenis({
          autoRaf: true,
          lerp: 0.1,
          duration: 1.8,
          wheelMultiplier: 1,
          easing: function (x) { return Math.min(1, 1.001 - Math.pow(2, -10 * x)); }
        });
        /* Load ke turant baad koi overlay (menu/search/popup) open ho
           chuka ho to scroll wahi ruk jaaye */
        var menuOpen = document.body.classList.contains('menu-open');
        var sm = document.getElementById('searchModal');
        var dp = document.getElementById('donPop');
        if (menuOpen || (sm && sm.classList.contains('open')) || (dp && dp.classList.contains('open'))) {
          window.AB_LENIS.stop();
        }
      } catch (e) {}
    };
    document.head.appendChild(s);
  } catch (e) {}
})();

(function () {
  'use strict';

  /* ---------- Smooth scroll helpers ----------
     Lenis active ho to scroll usi se (badi glide), warna native.
     Lenis scroll-padding-top respect nahi karta, isliye offset -90
     manually diya gaya hai (= style.css scroll-padding-top:90px). */
  function abScrollTo(target, offset) {
    var L = window.AB_LENIS;
    if (L) {
      try {
        L.scrollTo(target, { offset: (typeof offset === 'number' ? offset : -90) });
        return;
      } catch (e) {}
    }
    if (typeof target === 'number') {
      try { window.scrollTo({ top: target, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, target); }
    } else if (target && target.scrollIntoView) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  function abScrollLock(on) {
    var L = window.AB_LENIS;
    if (!L) return;
    try { if (on) L.stop(); else L.start(); } catch (e) {}
  }

  /* ---------- Sticky navbar ---------- */
  var navbar = document.querySelector('.navbar');
  var topLink = document.getElementById('top');
  var scrollFrame = 0;
  function applyScrollState() {
    scrollFrame = 0;
    /* scrollY ko ek hi baar padho - doosra read class toggle ke baad
       forced layout trigger karta tha. */
    var y = window.scrollY || window.pageYOffset || 0;
    if (navbar) navbar.classList.toggle('scrolled', y > 24);
    if (topLink) topLink.classList.toggle('show', y > 500);
  }
  function onScroll() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(applyScrollState);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  applyScrollState();

  /* ---------- Back to top ---------- */
  var topBtn = document.getElementById('top');
  if (topBtn) {
    topBtn.addEventListener('click', function () { abScrollTo(0); });
  }

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector('.mobile-menu-btn');
  var menu = document.querySelector('.mobile-menu');
  var backdrop = document.getElementById('mobileMenuBackdrop');
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    if (burger) { burger.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
    document.body.classList.remove('menu-open');
    abScrollLock(false);
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      if (backdrop) backdrop.classList.toggle('open', open);
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('menu-open', open);
      abScrollLock(open);
    });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    if (backdrop) backdrop.addEventListener('click', closeMenu);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(); closeSearch(); } });
  }

  /* ---------- Desktop dropdowns (touch support) ---------- */
  /* Long menus (All Pages) need their own wheel scroll. Lenis listens on
     window and would otherwise scroll the page instead, so mark every
     dropdown as a native scroll area. */
  document.querySelectorAll('.nav-dropdown-menu').forEach(function (m) {
    m.setAttribute('data-lenis-prevent', '');
  });
  document.querySelectorAll('.nav-dropdown > .nav-tab').forEach(function (tab) {
    tab.addEventListener('click', function (e) {
      if (window.matchMedia('(hover: none)').matches) {
        e.preventDefault();
        var dd = tab.parentElement;
        document.querySelectorAll('.nav-dropdown.open').forEach(function (o) { if (o !== dd) o.classList.remove('open'); });
        dd.classList.toggle('open');
      }
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.open').forEach(function (o) { o.classList.remove('open'); });
    }
  });

  /* ---------- Universal search ---------- */
  var INDEX = window.AB_SEARCH_INDEX || [
    { t: 'Homepage', m: 'piravexbay MSTS — free gaming & train sim hub', ty: 'Page', u: 'index.html' },
    { t: 'Genre Index', m: 'Every page, collection and resource in one index', ty: 'Page', u: 'genre.html' },
    { t: 'MSTS Addons Hub', m: 'Every Microsoft Train Simulator Indian addon in one hub', ty: 'MSTS', u: 'msts-addons.html' },
    { t: 'MSTS Folder Backup / Preinstalled', m: 'Complete preinstalled MSTS folder backup — 6 split 7z parts, free download', ty: 'MSTS', u: 'msts-folder-backup.html' },
    { t: 'MSTS Routes', m: 'Indian railway routes & scenarios', ty: 'MSTS', u: 'msts-routes.html' },
    { t: 'THE VAISHNAVI ROUTE', m: 'Northern Railway route — Delhi NCR, Ghaziabad, Rewari & Delhi–Kalka mainline — 12-part RAR · ~23.4 GB', ty: 'MSTS', u: 'the-vaishnavi-route.html' },
    { t: 'TSCR-V2-KZJ Update', m: 'TSCR route V2 update — Kazipet Junction (KZJ), South Central Railway — 6-part RAR · ~9.6 GB', ty: 'MSTS', u: 'tscr-v2-kzj-update.html' },
    { t: 'Western_railways_v12_route', m: 'Western Railways V12 route — Kota–Mathura trunk section, Delhi–Mumbai corridor — 4-part ZIP · ~6.3 GB', ty: 'MSTS', u: 'western-railways-v12-route.html' },
    { t: 'MIR Surat Update', m: 'Mega Indian Railways Surat section for MSTS & Open Rails — free download', ty: 'MSTS', u: 'mir-surat-update.html' },
    { t: 'SER & ER Siuri Malda Update', m: 'Siuri–Malda corridor across Birbhum & Malda, West Bengal — 6-part RAR · ~10.4 GB — free download', ty: 'MSTS', u: 'msts-route-ser-er-siuri-malda-update.html' },
    { t: 'MSTS Sounds', m: 'Realistic horn, engine & brake sounds', ty: 'MSTS', u: 'msts-sounds.html' },
    { t: 'OSW_WAP5', m: 'OSW WAP-5 electric locomotive for MSTS & Open Rails — RAR · ~350 MB — free download', ty: 'MSTS', u: 'osw-wap5-download.html' },
    { t: 'MSTS Reshades', m: 'ReShade presets & graphics packs', ty: 'MSTS', u: 'msts-reshades.html' },
    { t: 'Activities', m: 'MSTS activities & scenarios', ty: 'MSTS', u: 'activity.html' },
    { t: 'Softwares', m: 'Tools, utilities and patches', ty: 'Downloads', u: 'softwares.html' },
    { t: 'Windows', m: 'Official Windows ISOs & downloads', ty: 'Downloads', u: 'windows.html' },
    { t: 'Windows 10 Official ISO', m: 'Windows 10 x64 official ISO — 4-part 7z split · ~6.7 GB — free download', ty: 'Downloads', u: 'windows-10-official-iso.html' },
    { t: 'Windows 11 Official ISO', m: 'Windows 11 x64 official ISO — 5-part 7z split · ~8.4 GB — free download', ty: 'Downloads', u: 'windows-11-official-iso.html' },
    { t: 'Utility', m: 'Handy utilities & control apps — tweakers and laptop tools', ty: 'Downloads', u: 'utility.html' },
    { t: 'Predator Sense — PH315-51 Only', m: 'Acer Predator Sense control utility for Helios 300 PH315-51 — free download', ty: 'Downloads', u: 'predator-sense-ph315-51.html' },
    { t: 'AE/PR Plugins & Extensions', m: 'After Effects plugins, Premiere Pro extensions & presets', ty: 'Downloads', u: 'ae-pr-plugins.html' },
    { t: 'Adobe Premiere Pro 2026', m: 'Pre-installed video editing suite for Windows 10/11 64-bit — 3-part 7z · ~5.06 GB — free download', ty: 'Downloads', u: 'adobe-premiere-pro-2026.html' },
    { t: 'Tips and PDFs', m: 'PDF downloads, handy tips & free guides', ty: 'Guides', u: 'tips.html' },
    { t: 'Topaz Video AI — Best Settings for 4K Edits', m: 'Proteus 2160×2160 (2x) upscale settings — enhancement, manual parameters & export — free guide', ty: 'Guides', u: 'topaz-video-ai-best-4k-settings.html' },
    { t: 'Why piravexbay MSTS', m: 'What makes the bay different', ty: 'Info', u: 'why-piravexbaymsts.html' },
    { t: 'About Us', m: 'Know more about piravexbay MSTS', ty: 'Info', u: 'about-us.html' },
    { t: 'MSTS Donation', m: 'Support the MSTS community & creators', ty: 'Support', u: 'msts-donation.html' },
    { t: 'DMCA', m: 'Copyright policy & takedown requests', ty: 'Legal', u: 'dmca.html' },
    { t: 'Privacy Policy', m: 'How piravexbay MSTS handles data', ty: 'Legal', u: 'privacy-policy.html' },
    { t: 'BGPRO_LHB_DEFAULT.SOUND', m: 'Default LHB coach sound set for MSTS & Open Rails — free zip download', ty: 'MSTS', u: 'bgpro-lhb-default-sound-download.html' },
    { t: 'MGW.LHB.V9.COMBO', m: 'Full MGW LHB V9 sound combo — coach, bogie and brake audio — free rar download', ty: 'MSTS', u: 'mgw-lhb-v9-combo-download.html' },
    { t: 'SD_LHB_V1', m: 'LHB sound pack V1 — free rar download', ty: 'MSTS', u: 'sd-lhb-v1-download.html' },
    { t: 'SD_LHB_V2', m: 'LHB sound pack V2 — free rar download', ty: 'MSTS', u: 'sd-lhb-v2-download.html' },
    { t: 'TSRC.WAP7.V2', m: 'WAP-7 sound pack V2 — free rar download', ty: 'MSTS', u: 'tsrc-wap7-v2-download.html' },
    { t: 'UZAIR_LHB_V1', m: 'LHB sound pack V1 — free rar download', ty: 'MSTS', u: 'uzair-lhb-v1-download.html' },
    { t: 'UZAIR_MEMU', m: 'MEMU sound pack — free rar download', ty: 'MSTS', u: 'uzair-memu-download.html' },
    { t: 'OSW Production', m: 'OSW production collection — Amrit Bharat trainsets and the WAP5 locomotive', ty: 'MSTS', u: 'osw-production.html' },
    { t: 'KRG PRODUCTION', m: 'KRG PRODUCTION locomotive packs - 79 files, each with its own free download page', ty: 'MSTS', u: 'krg-production-all-things.html' },
    { t: 'BRC_P5_KRG_WAP5_30068_30073', m: 'KRG WAP-5 BRC P5 30068 and 30073. Vadodara shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 134.9 MB - free download', ty: 'MSTS', u: 'brc-p5-krg-wap5-30068-30073-download.html' },
    { t: 'KRG_HWH_wap4_KRG_HWH', m: 'KRG Howrah WAP-4. Howrah shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 60.1 MB - free download', ty: 'MSTS', u: 'krg-hwh-wap4-krg-hwh-download.html' },
    { t: 'KRG_WAG_5_JMP_27170', m: 'KRG WAG-5 Jamalpur 27170. Jamalpur shed freight electric locomotive pack for Microsoft Train Simulator and Open Rails. - 112.2 MB - free download', ty: 'MSTS', u: 'krg-wag-5-jmp-27170-download.html' },
    { t: 'KRG_WAG7_Flat_27129_27583_Flatface', m: 'KRG WAG-7 flat-face 27129 and 27583. Freight electric locomotive pack for Microsoft Train Simulator and Open Rails. - 119.9 MB - free download', ty: 'MSTS', u: 'krg-wag7-flat-27129-27583-flatface-download.html' },
    { t: 'KRG_WAG7_Flat_27129_27583_Flatface_HR', m: 'High-resolution add-on for the KRG WAG-7 flat-face 27129 and 27583 pack. Use it with the matching full pack. - 10.8 MB - free download', ty: 'MSTS', u: 'krg-wag7-flat-27129-27583-flatface-hr-download.html' },
    { t: 'KRG_WAG7_TIGERFACE_2in1_PACK', m: 'KRG WAG-7 tiger-face 2-in-1 pack. Two freight electric locomotives in one archive for Microsoft Train Simulator and Open Rails. - 177.9 MB - free download', ty: 'MSTS', u: 'krg-wag7-tigerface-2in1-pack-download.html' },
    { t: 'KRG_WAG7_TIGERFACE_2in1_PACK_HR', m: 'High-resolution add-on for the KRG WAG-7 tiger-face 2-in-1 pack. Use it with the matching full pack. - 13.4 MB - free download', ty: 'MSTS', u: 'krg-wag7-tigerface-2in1-pack-hr-download.html' },
    { t: 'KRG_WAP_7_SPECIAL_HWH', m: 'KRG WAP-7 Special Howrah. Howrah special electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 119.6 MB - free download', ty: 'MSTS', u: 'krg-wap-7-special-hwh-download.html' },
    { t: 'KRG_WAP5_BRC_P5_30044_30054', m: 'KRG WAP-5 BRC P5 30044 and 30054. Vadodara shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 134.6 MB - free download', ty: 'MSTS', u: 'krg-wap5-brc-p5-30044-30054-download.html' },
    { t: 'KRG_WAP5_BRC_P5_30044_30054_HR', m: 'High-resolution add-on for the KRG WAP-5 BRC P5 30044 and 30054 pack. Use it with the matching full pack. - 9.4 MB - free download', ty: 'MSTS', u: 'krg-wap5-brc-p5-30044-30054-hr-download.html' },
    { t: 'KRG_WAP5_BRC_P5_30058', m: 'KRG WAP-5 BRC P5 30058. Vadodara shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 123.5 MB - free download', ty: 'MSTS', u: 'krg-wap5-brc-p5-30058-download.html' },
    { t: 'KRG_WAP5_BRC_P5_30058_HR', m: 'High-resolution add-on for the KRG WAP-5 BRC P5 30058 pack. Use it with the matching full pack. - 4.7 MB - free download', ty: 'MSTS', u: 'krg-wap5-brc-p5-30058-hr-download.html' },
    { t: 'KRG_WAP5_BRC_P5_30068_30073_HR', m: 'High-resolution add-on for the KRG WAP-5 BRC P5 30068 and 30073 pack. Use it with the matching full pack. - 9.2 MB - free download', ty: 'MSTS', u: 'krg-wap5-brc-p5-30068-30073-hr-download.html' },
    { t: 'KRG_WAP7_ED_37202', m: 'KRG WAP-7 Erode 37202. Erode shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 133.8 MB - free download', ty: 'MSTS', u: 'krg-wap7-ed-37202-download.html' },
    { t: 'KRG_WAP7_GMO_39112_30781', m: 'KRG WAP-7 Gomoh 39112 and 30781. Gomoh shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 148.0 MB - free download', ty: 'MSTS', u: 'krg-wap7-gmo-39112-30781-download.html' },
    { t: 'KRG_WAP7_GZB_39022', m: 'KRG WAP-7 Ghaziabad 39022. Ghaziabad shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 150.6 MB - free download', ty: 'MSTS', u: 'krg-wap7-gzb-39022-download.html' },
    { t: 'KRG_WAP7_LGD_37364', m: 'KRG WAP-7 Lallaguda 37364. Lallaguda shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 150.1 MB - free download', ty: 'MSTS', u: 'krg-wap7-lgd-37364-download.html' },
    { t: 'KRG_WAP7_RPM_37581', m: 'KRG WAP-7 Royapuram 37581. Royapuram shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 142.2 MB - free download', ty: 'MSTS', u: 'krg-wap7-rpm-37581-download.html' },
    { t: '37112BRC_37164BL_KRG_WAP7_HRPack', m: 'High-resolution add-on for the KRG WAP-7 Vadodara and Valsad 37112 and 37164 pack. Use it with the matching full pack. - 92.1 MB - free download', ty: 'MSTS', u: '37112brc-37164bl-krg-wap7-hrpack-download.html' },
    { t: '43505_41KRG_WAG9_884_43663_HR', m: 'High-resolution add-on for the KRG WAG-9 43505 and 43663 pack. Use it with the matching full pack. - 15.4 MB - free download', ty: 'MSTS', u: '43505-41krg-wag9-884-43663-hr-download.html' },
    { t: 'KRG_ABR_WAP4_22884_TruHR', m: 'High-resolution add-on for the KRG WAP-4 Abu Road 22884 pack. Use it with the matching full pack. - 87.8 MB - free download', ty: 'MSTS', u: 'krg-abr-wap4-22884-truhr-download.html' },
    { t: 'KRG_AJJ_WAP4_22889_TRI', m: 'KRG WAP-4 Arakkonam 22889. Arakkonam shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 73.4 MB - free download', ty: 'MSTS', u: 'krg-ajj-wap4-22889-tri-download.html' },
    { t: 'KRG_BZA_WAG7_28508', m: 'KRG WAG-7 Vijayawada 28508. Vijayawada shed freight electric locomotive pack for Microsoft Train Simulator and Open Rails. - 153.0 MB - free download', ty: 'MSTS', u: 'krg-bza-wag7-28508-download.html' },
    { t: 'KRG_EDDX_WAG7_28695', m: 'KRG WAG-7 Erode 28695. Erode shed freight electric locomotive pack for Microsoft Train Simulator and Open Rails. - 154.8 MB - free download', ty: 'MSTS', u: 'krg-eddx-wag7-28695-download.html' },
    { t: 'KRG_EDDX_WAG7_28695_HR', m: 'High-resolution add-on for the KRG WAG-7 Erode 28695 pack. Use it with the matching full pack. - 5.8 MB - free download', ty: 'MSTS', u: 'krg-eddx-wag7-28695-hr-download.html' },
    { t: 'KRG_GTL_WAG7_28389', m: 'KRG WAG-7 Guntakal 28389. Guntakal shed freight electric locomotive pack for Microsoft Train Simulator and Open Rails. - 177.0 MB - free download', ty: 'MSTS', u: 'krg-gtl-wag7-28389-download.html' },
    { t: 'KRG_GTL_WAG7_28389_HR', m: 'High-resolution add-on for the KRG WAG-7 Guntakal 28389 pack. Use it with the matching full pack. - 13.3 MB - free download', ty: 'MSTS', u: 'krg-gtl-wag7-28389-hr-download.html' },
    { t: 'KRG_HWH_WAP4_22518', m: 'KRG WAP-4 Howrah 22518. Howrah shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 120.5 MB - free download', ty: 'MSTS', u: 'krg-hwh-wap4-22518-download.html' },
    { t: 'KRG_HWH_WAP4_22528', m: 'KRG WAP-4 Howrah 22528. Howrah shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 126.3 MB - free download', ty: 'MSTS', u: 'krg-hwh-wap4-22528-download.html' },
    { t: 'KRG_TKD_WAP4_22345', m: 'KRG WAP-4 Tughlakabad 22345. Tughlakabad shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 158.5 MB - free download', ty: 'MSTS', u: 'krg-tkd-wap4-22345-download.html' },
    { t: 'KRG_VATVA_WAP4_22211_TruHR', m: 'High-resolution add-on for the KRG WAP-4 Vatva 22211 pack. Use it with the matching full pack. - 87.3 MB - free download', ty: 'MSTS', u: 'krg-vatva-wap4-22211-truhr-download.html' },
    { t: 'KRG_WAG_5_BWN', m: 'KRG locomotive Barddhaman. Barddhaman shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 124.9 MB - free download', ty: 'MSTS', u: 'krg-wag-5-bwn-download.html' },
    { t: 'KRG_WAG_5_JHS', m: 'KRG locomotive Jhansi. Jhansi shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 124.9 MB - free download', ty: 'MSTS', u: 'krg-wag-5-jhs-download.html' },
    { t: 'KRG_WAG7_Flat_KYN_Flatface_3in1', m: 'KRG WAG-7 flat-face 3-in-1 Kalyan. Kalyan shed freight electric locomotive pack for Microsoft Train Simulator and Open Rails. - 124.1 MB - free download', ty: 'MSTS', u: 'krg-wag7-flat-kyn-flatface-3in1-download.html' },
    { t: 'KRG_WAG7_KZJ', m: 'KRG WAG-7 Kazipet. Kazipet shed freight electric locomotive pack for Microsoft Train Simulator and Open Rails. - 139.8 MB - free download', ty: 'MSTS', u: 'krg-wag7-kzj-download.html' },
    { t: 'KRG_WAG9_43505_41884_43663', m: 'KRG WAG-9 43505, 41884 and 43663. Freight electric locomotive pack for Microsoft Train Simulator and Open Rails. - 117.1 MB - free download', ty: 'MSTS', u: 'krg-wag9-43505-41884-43663-download.html' },
    { t: 'KRG_WAG9_AJJ_38848', m: 'KRG WAG-9 Arakkonam 38848. Arakkonam shed freight electric locomotive pack for Microsoft Train Simulator and Open Rails. - 105.0 MB - free download', ty: 'MSTS', u: 'krg-wag9-ajj-38848-download.html' },
    { t: 'KRG_WAG9_AJJ_38944', m: 'KRG WAG-9 Arakkonam 38944. Arakkonam shed freight electric locomotive pack for Microsoft Train Simulator and Open Rails. - 88.5 MB - free download', ty: 'MSTS', u: 'krg-wag9-ajj-38944-download.html' },
    { t: 'KRG_WAP4_AJJ_22697', m: 'KRG WAP-4 Arakkonam 22697. Arakkonam shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 286.7 MB - free download', ty: 'MSTS', u: 'krg-wap4-ajj-22697-download.html' },
    { t: 'KRG_WAP4_AJJ_22776', m: 'KRG WAP-4 Arakkonam 22776. Arakkonam shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 286.8 MB - free download', ty: 'MSTS', u: 'krg-wap4-ajj-22776-download.html' },
    { t: 'KRG_WAP4_AJJ_22784', m: 'KRG WAP-4 Arakkonam 22784. Arakkonam shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 286.7 MB - free download', ty: 'MSTS', u: 'krg-wap4-ajj-22784-download.html' },
    { t: 'KRG_WAP4_AJJ_22845', m: 'KRG WAP-4 Arakkonam 22845. Arakkonam shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 145.9 MB - free download', ty: 'MSTS', u: 'krg-wap4-ajj-22845-download.html' },
    { t: 'KRG_WAP4_BL_22236', m: 'KRG WAP-4 Valsad 22236. Valsad shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 143.6 MB - free download', ty: 'MSTS', u: 'krg-wap4-bl-22236-download.html' },
    { t: 'KRG_WAP4_BL_22382', m: 'KRG WAP-4 Valsad 22382. Valsad shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 281.2 MB - free download', ty: 'MSTS', u: 'krg-wap4-bl-22382-download.html' },
    { t: 'KRG_WAP4_BL_22940', m: 'KRG WAP-4 Valsad 22940. Valsad shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 155.1 MB - free download', ty: 'MSTS', u: 'krg-wap4-bl-22940-download.html' },
    { t: 'KRG_WAP4_BSL_22204', m: 'KRG WAP-4 Bhusaval 22204. Bhusaval shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 153.7 MB - free download', ty: 'MSTS', u: 'krg-wap4-bsl-22204-download.html' },
    { t: 'KRG_WAP4_BSL_22831', m: 'KRG WAP-4 Bhusaval 22831. Bhusaval shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 145.1 MB - free download', ty: 'MSTS', u: 'krg-wap4-bsl-22831-download.html' },
    { t: 'KRG_WAP4_BSL_22912', m: 'KRG WAP-4 Bhusaval 22912. Bhusaval shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 145.8 MB - free download', ty: 'MSTS', u: 'krg-wap4-bsl-22912-download.html' },
    { t: 'KRG_WAP4_BZA_22206', m: 'KRG WAP-4 Vijayawada 22206. Vijayawada shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 150.7 MB - free download', ty: 'MSTS', u: 'krg-wap4-bza-22206-download.html' },
    { t: 'KRG_WAP4_BZA_22609', m: 'KRG WAP-4 Vijayawada 22609. Vijayawada shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 148.2 MB - free download', ty: 'MSTS', u: 'krg-wap4-bza-22609-download.html' },
    { t: 'KRG_WAP4_BZA_22745', m: 'KRG WAP-4 Vijayawada 22745. Vijayawada shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 155.6 MB - free download', ty: 'MSTS', u: 'krg-wap4-bza-22745-download.html' },
    { t: 'KRG_WAP4_ED_22222', m: 'KRG WAP-4 Erode 22222. Erode shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 153.2 MB - free download', ty: 'MSTS', u: 'krg-wap4-ed-22222-download.html' },
    { t: 'KRG_WAP4_ED_22223', m: 'KRG WAP-4 Erode 22223. Erode shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 155.1 MB - free download', ty: 'MSTS', u: 'krg-wap4-ed-22223-download.html' },
    { t: 'KRG_WAP4_ED_22232', m: 'KRG WAP-4 Erode 22232. Erode shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 139.5 MB - free download', ty: 'MSTS', u: 'krg-wap4-ed-22232-download.html' },
    { t: 'KRG_WAP4_ED_22903', m: 'KRG WAP-4 Erode 22903. Erode shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 145.8 MB - free download', ty: 'MSTS', u: 'krg-wap4-ed-22903-download.html' },
    { t: 'KRG_WAP4_ED_25025', m: 'KRG WAP-4 Erode 25025. Erode shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 154.6 MB - free download', ty: 'MSTS', u: 'krg-wap4-ed-25025-download.html' },
    { t: 'KRG_WAP4_ED_25025_TruHR', m: 'High-resolution add-on for the KRG WAP-4 Erode 25025 pack. Use it with the matching full pack. - 116.1 MB - free download', ty: 'MSTS', u: 'krg-wap4-ed-25025-truhr-download.html' },
    { t: 'KRG_WAP4_ET_22991', m: 'KRG WAP-4 Itarsi 22991. Itarsi shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 155.0 MB - free download', ty: 'MSTS', u: 'krg-wap4-et-22991-download.html' },
    { t: 'KRG_WAP4_SRC_22600', m: 'KRG WAP-4 Santragachi 22600. Santragachi shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 236.8 MB - free download', ty: 'MSTS', u: 'krg-wap4-src-22600-download.html' },
    { t: 'KRG_WAP4_VATVA_22919', m: 'KRG WAP-4 Vatva 22919. Vatva shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 148.7 MB - free download', ty: 'MSTS', u: 'krg-wap4-vatva-22919-download.html' },
    { t: 'KRG_WAP4V1_3_in_1_HR_Pack', m: 'KRG WAP-4 V1 3-in-1. Electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 260.8 MB - free download', ty: 'MSTS', u: 'krg-wap4v1-3-in-1-hr-pack-download.html' },
    { t: 'KRG_WAP4V1_3_in_1_HR_Pack_HR', m: 'High-resolution add-on for the KRG WAP-4 V1 3-in-1 pack. Use it with the matching full pack. - 21.6 MB - free download', ty: 'MSTS', u: 'krg-wap4v1-3-in-1-hr-pack-hr-download.html' },
    { t: 'KRG_WAP4V1_update', m: 'KRG WAP-4 V1 update. Electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 196.9 MB - free download', ty: 'MSTS', u: 'krg-wap4v1-update-download.html' },
    { t: 'KRG_WAP7_37112BRC_37164BL_HR', m: 'High-resolution add-on for the KRG WAP-7 Vadodara and Valsad 37112 and 37164 pack. Use it with the matching full pack. - 10.1 MB - free download', ty: 'MSTS', u: 'krg-wap7-37112brc-37164bl-hr-download.html' },
    { t: 'KRG_WAP7_BZA39369_PUNE39443', m: 'KRG WAP-7 Pune and Vijayawada 39369 and 39443. Pune and Vijayawada sheds electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 100.2 MB - free download', ty: 'MSTS', u: 'krg-wap7-bza39369-pune39443-download.html' },
    { t: 'KRG_WAP7_BZA39369_PUNE39443_HR', m: 'High-resolution add-on for the KRG WAP-7 Pune and Vijayawada 39369 and 39443 pack. Use it with the matching full pack. - 11.3 MB - free download', ty: 'MSTS', u: 'krg-wap7-bza39369-pune39443-hr-download.html' },
    { t: 'KRG_WAP7_ED_30423_30354', m: 'KRG WAP-7 Erode 30423 and 30354. Erode shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 108.6 MB - free download', ty: 'MSTS', u: 'krg-wap7-ed-30423-30354-download.html' },
    { t: 'KRG_WAP7_ED_37462_HWH_37501', m: 'KRG WAP-7 Howrah and Erode 37462 and 37501. Howrah and Erode sheds electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 100.9 MB - free download', ty: 'MSTS', u: 'krg-wap7-ed-37462-hwh-37501-download.html' },
    { t: 'KRG_WAP7_ED_37494', m: 'KRG WAP-7 Erode 37494. Erode shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 142.2 MB - free download', ty: 'MSTS', u: 'krg-wap7-ed-37494-download.html' },
    { t: 'KRG_WAP7_ERS_36969', m: 'KRG WAP-7 Ernakulam 36969. Ernakulam shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 138.6 MB - free download', ty: 'MSTS', u: 'krg-wap7-ers-36969-download.html' },
    { t: 'KRG_WAP7_GZB_30451', m: 'KRG WAP-7 Ghaziabad 30451. Ghaziabad shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 88.3 MB - free download', ty: 'MSTS', u: 'krg-wap7-gzb-30451-download.html' },
    { t: 'KRG_WAP7_GZB_30451_1', m: 'KRG WAP-7 Ghaziabad 30451. Ghaziabad shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 88.3 MB - free download', ty: 'MSTS', u: 'krg-wap7-gzb-30451-1-download.html' },
    { t: 'KRG_WAP7_HWH_37358', m: 'KRG WAP-7 Howrah 37358. Howrah shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 100.4 MB - free download', ty: 'MSTS', u: 'krg-wap7-hwh-37358-download.html' },
    { t: 'KRG_WAP7_HWH_37432', m: 'KRG WAP-7 Howrah 37432. Howrah shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 98.6 MB - free download', ty: 'MSTS', u: 'krg-wap7-hwh-37432-download.html' },
    { t: 'KRG_WAP7_HWH_37573', m: 'KRG WAP-7 Howrah 37573. Howrah shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 98.6 MB - free download', ty: 'MSTS', u: 'krg-wap7-hwh-37573-download.html' },
    { t: 'KRG_WAP7_LGD_39248', m: 'KRG WAP-7 Lallaguda 39248. Lallaguda shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 89.3 MB - free download', ty: 'MSTS', u: 'krg-wap7-lgd-39248-download.html' },
    { t: 'KRG_WAP7_RPM_KRG_VYOM', m: 'KRG WAP-7 Vyom Royapuram. Royapuram shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 130.0 MB - free download', ty: 'MSTS', u: 'krg-wap7-rpm-krg-vyom-download.html' },
    { t: 'KRG_WAP7_SDAH_30295', m: 'KRG WAP-7 Sealdah 30295. Sealdah shed electric passenger locomotive pack for Microsoft Train Simulator and Open Rails. - 101.4 MB - free download', ty: 'MSTS', u: 'krg-wap7-sdah-30295-download.html' },
    { t: 'WAG5_23648_23664_23769', m: 'KRG WAG-5 23648, 23664 and 23769. Freight electric locomotive pack for Microsoft Train Simulator and Open Rails. - 117.0 MB - free download', ty: 'MSTS', u: 'wag5-23648-23664-23769-download.html' },
    { t: 'OSW_AMRIT_BHARAT', m: 'OSW Amrit Bharat trainset for MSTS & Open Rails — free rar download', ty: 'MSTS', u: 'osw-amrit-bharat-download.html' },
    { t: 'TVP Production', m: 'TVP production collection — WCAM-1 rainbow, freight packs and more', ty: 'MSTS', u: 'tvp-production.html' },
    { t: 'TVP Production Stocks', m: 'Complete TVP stock pack for MSTS & Open Rails - 11-part 7z archive, free download', ty: 'MSTS', u: 'tvp-production-all-things.html' },
    { t: 'TVP_WCAM1RAINBOW', m: 'WCAM-1 rainbow livery locomotive pack — free rar download', ty: 'MSTS', u: 'tvp-wcam1-rainbow-download.html' },
    { t: 'TVP_FREIGHT_PACK', m: 'TVP freight pack for MSTS & Open Rails — free 7z download', ty: 'MSTS', u: 'tvp-freight-download.html' },
    { t: 'ArtCraft', m: 'Vibe-coded alternative to the Adobe creative apps — free exe installer', ty: 'Downloads', u: 'artcraft-download.html' },
    { t: 'DDS Viewer', m: 'Free DDS texture viewer for Windows — free exe installer', ty: 'Downloads', u: 'ddsviewer-download.html' },
    { t: 'DesignCraft', m: 'Vibe-coded design tool for Windows — free msi installer', ty: 'Downloads', u: 'designcraft-download.html' },
    { t: 'EffectCraft', m: 'Vibe-coded alternative to Adobe After Effects — free msi installer', ty: 'Downloads', u: 'effectcraft-download.html' },
    { t: 'FilmCraft', m: 'Vibe-coded alternative to Adobe Premiere Pro — free msi installer', ty: 'Downloads', u: 'filmcraft-download.html' },
    { t: 'LightCraft', m: 'Vibe-coded alternative to Adobe Lightroom — free msi installer', ty: 'Downloads', u: 'lightcraft-download.html' },
    { t: 'PDFCraft', m: 'Adobe Acrobat vibe-coded alternative — free msi installer', ty: 'Downloads', u: 'pdfcraft-download.html' },
    { t: 'PhotoCraft', m: 'Vibe-coded Photoshop alternative made by ArtCraft — free msi installer', ty: 'Downloads', u: 'photocraft-download.html' },
    { t: 'VectorCraft', m: 'Vibe-coded alternative to Adobe Illustrator — free msi installer', ty: 'Downloads', u: 'vectorcraft-download.html' },
    { t: 'Ace-It Utilities', m: 'Ace-It texture tool collection for MSTS', ty: 'Downloads', u: 'aceit-utilities.html' },
    { t: 'utilities_aceit', m: 'ACE to BMP/DDS converter toolkit — free rar download', ty: 'Downloads', u: 'utilities-aceit-download.html' },
    { t: 'TSRE Consist & Route Editor', m: 'TSRE-TS — edit consists and routes for MSTS & Open Rails — free 7z download', ty: 'Downloads', u: 'tsre-ts-download.html' },
    { t: 'MSTS Toolkit', m: 'Ultimate v2.6.2 latest update plus v2.5.2 builds — free rar downloads', ty: 'MSTS', u: 'msts-toolkit-download.html' },
    { t: 'Royal.rajsthan.route', m: 'Freeware Royal Rajasthan route — 920.5 MB zip — free download', ty: 'MSTS', u: 'msts-route-royal-rajasthan.html' },
    { t: 'Open Rails New Year (Reshade Compatible)', m: 'Preinstalled Open Rails New Year pack, reshade-compatible — free rar download', ty: 'MSTS', u: 'or-new-year-download.html' },
    { t: 'MSTS Folder Backup — Blank (Route + Trains)', m: 'Blank MSTS folder backup with fresh ROUTES and TRAINS folders — free rar download', ty: 'MSTS', u: 'msts-blank-folder-download.html' },
    { t: 'AE GPT 1.2', m: 'GPT-powered AI assistant plugin for After Effects — free rar download', ty: 'Downloads', u: 'ae-gpt-download.html' },
    { t: 'GEOlayers 3', m: 'Map the real world inside After Effects with live satellite imagery — free rar download', ty: 'Downloads', u: 'geolayers-3-download.html' },
    { t: 'AfterCodecs 1.12', m: 'Fast H.264 / HEVC / HAP export codec for AE and Premiere Pro — free rar download', ty: 'Downloads', u: 'aftercodecs-download.html' },
    { t: 'Claude Scripter 1.3', m: 'AI-powered effect scripting inside After Effects — free rar download', ty: 'Downloads', u: 'claude-scripter-download.html' },
    { t: 'CRT Emulator 8.2', m: 'Retro CRT scanline and curvature FX for After Effects — free rar download', ty: 'Downloads', u: 'crt-emulator-download.html' },
    { t: 'Deep Glow 1.6', m: 'The classic physically-based glow plugin for After Effects — free rar download', ty: 'Downloads', u: 'deep-glow-download.html' },
    { t: 'Dehancer Pro 7.4', m: 'Film emulation and grain for Premiere Pro and After Effects — free rar download', ty: 'Downloads', u: 'dehancer-pro-download.html' },
    { t: 'Flow 1.5', m: 'Frame blending and motion tool for After Effects — free rar download', ty: 'Downloads', u: 'flow-plugin-download.html' },
    { t: 'FX Console 1.0', m: 'Instant effect search and control panel for After Effects — free zip installer', ty: 'Downloads', u: 'fxconsole-download.html' },
    { t: 'Hyper.speed 2.1', m: 'Speed-ramp transition suite for After Effects — free rar download', ty: 'Downloads', u: 'hyperspeed-download.html' },
    { t: 'Influx 1.5', m: 'Native mkv / flac / mov codec plugin for AE and Premiere Pro — free rar download', ty: 'Downloads', u: 'influx-download.html' },
    { t: 'Magic Bullet Suite 2025', m: 'Looks, Colorista, Denoiser colour grading bundle — free rar download', ty: 'Downloads', u: 'magic-bullet-suite-download.html' },
    { t: 'Mocha Pro 2026', m: 'Planar tracking and object removal power — free rar download', ty: 'Downloads', u: 'mocha-pro-download.html' },
    { t: 'Optical Flares 1.3', m: 'The legendary lens flare plugin for After Effects — free rar download', ty: 'Downloads', u: 'optical-flares-download.html' },
    { t: 'Pro Shaders 1', m: 'The original shader preset pack for Element 3D — free rar download', ty: 'Downloads', u: 'pro-shaders-download.html' },
    { t: 'Twixtor Pro 8.1', m: 'Industry-standard frame interpolation plugin — free rar download', ty: 'Downloads', u: 'twixtor-pro-8-download.html' },
    { t: 'RSMB Pro 6.4', m: 'Automatic motion blur by ReelSmart — free rar download', ty: 'Downloads', u: 'rsmb-pro-download.html' },
    { t: 'Saber 1.0.4 (Lofix)', m: 'The legendary energy-beam glow plugin — free rar download', ty: 'Downloads', u: 'saber-lofix-download.html' },
    { t: 'Sapphire 2026', m: 'Industry-standard VFX suite with 340+ effects — free rar download', ty: 'Downloads', u: 'sapphire-2026-download.html' },
    { t: 'Shooter Suite 13', m: 'Ingest, deliver and offload tools by REVisionFX — free rar download', ty: 'Downloads', u: 'shooter-suite-download.html' },
    { t: 'Signal 1.2', m: 'Data-text and glitch transition tool for After Effects — free rar download', ty: 'Downloads', u: 'signal-download.html' },
    { t: 'Tracery 1.1', m: 'Procedural pattern and texture generator — free rar download', ty: 'Downloads', u: 'tracery-download.html' },
    { t: 'Trapcode Suite 2025', m: 'Particular, Form, Mir and the full particle suite — free rar download', ty: 'Downloads', u: 'trapcode-suite-2025-download.html' },
    { t: 'Twitch 1.1', m: 'The classic glitch, blur and sync plugin — free rar download', ty: 'Downloads', u: 'twitch-download.html' },
    { t: 'Universe 2026', m: '90+ GPU transitions and effects for AE and PR — free rar download', ty: 'Downloads', u: 'universe-2026-download.html' },
    { t: 'VFX Suite 2025', m: 'Supercomp, King Pin Tracker compositing suite — free rar download', ty: 'Downloads', u: 'vfx-suite-2025-download.html' },
    { t: 'Element 3D 2.2', m: 'Real 3D lights and particle objects inside After Effects — free rar download', ty: 'Downloads', u: 'element-3d-download.html' },
    { t: 'Deep Glow 2', m: 'Next-gen physically-based glow plugin, Aescripts + Lofix builds — free rar downloads', ty: 'Downloads', u: 'deep-glow-2-download.html' },
    { t: 'Pro Shaders 2', m: '900+ OpenGL shader presets for Element 3D, 2 parts — free rar downloads', ty: 'Downloads', u: 'pro-shaders-2-download.html' },
    { t: 'OSW_AMRIT_BHARAT_V2', m: 'OSW Amrit Bharat V2 trainset with power cars — free rar download', ty: 'MSTS', u: 'osw-amrit-bharat-v2-download.html' },
    { t: 'ACE.to.DDS.converter.for.MSTS', m: 'Batch ACE to DDS texture converter for MSTS & Open Rails — free 7z download', ty: 'MSTS', u: 'ace-to-dds-converter-for-msts.html' },
    { t: 'Acer Predator Sense PH315-51 Official', m: 'Official Predator Sense v3.01.3002 build for Helios 300 PH315-51 — free download', ty: 'Downloads', u: 'acer-predator-ph315-51-official.html' },
    { t: 'Adobe After Effects 2024', m: 'AE v24.6 full version for Windows 10/11 64-bit — free download', ty: 'Downloads', u: 'adobe-after-effects-2024.html' },
    { t: 'Adobe After Effects 2026', m: 'AE v26.5 latest full version for Windows 10/11 64-bit — free download', ty: 'Downloads', u: 'adobe-after-effects-2026.html' },
    { t: 'AE Project Version Converter', m: 'Convert After Effects project files between versions — free rar download', ty: 'Downloads', u: 'ae-version-converter.html' },
    { t: 'Download ARS.EMD.V1', m: 'Realistic EMD sound pack for MSTS & Open Rails — free 7z download', ty: 'MSTS', u: 'ars-emd-v1-download.html' },
    { t: 'Download ARS_LHB_V6', m: 'Realistic LHB coach sound pack V6 — free rar download', ty: 'MSTS', u: 'ars-lhb-v6-download.html' },
    { t: 'Download ARS.LHB.V7', m: 'Realistic LHB sound pack V7 — free rar download', ty: 'MSTS', u: 'ars-lhb-v7-download.html' },
    { t: 'BGPro 3-Phase Loco Pack 2025', m: 'WAP-7, WAG-9 and WAP-5 electric locomotives — free download', ty: 'MSTS', u: 'bgpro-3-phase-locos.html' },
    { t: 'Download BGPRO-ACEMU.emu', m: 'BGPro AC EMU pack, 28.3 MB — free download', ty: 'MSTS', u: 'bgpro-acemu-download.html' },
    { t: 'BGPRO-ACEMU', m: 'Indian Railways AC EMU suburban train pack by BGPro — free download', ty: 'MSTS', u: 'bgpro-acemu.html' },
    { t: 'Download BGPro_Bombardier_EMU', m: 'BGPro Bombardier EMU pack, 608 MB — free 7z download', ty: 'MSTS', u: 'bgpro-bombardier-emu-download.html' },
    { t: 'BGPro Locos', m: "Broad Gauge Productions' handcrafted Indian locomotives — 3D cabs & shed-accurate liveries", ty: 'MSTS', u: 'bgpro-locos.html' },
    { t: 'BGPro WCAM Loco Pack', m: 'Dual-power WCAM locomotives with detailed cabs and physics — free download', ty: 'MSTS', u: 'bgpro-wcam.html' },
    { t: 'BKS AI Horns Pack V1', m: 'Starter AI horn library for AI and player engines — free download', ty: 'MSTS', u: 'bks-ai-horns-pack-v1.html' },
    { t: 'BKS AI Horns Packs V2', m: 'Mixed AI-tuned horns for WAP, WAG & EMD classes — free rar download', ty: 'MSTS', u: 'bks-ai-horns-packs-v2.html' },
    { t: 'BKS EMD V1 Horns', m: 'Nathan-style EMD horn for WDG-4 and WDP-4 locos — free download', ty: 'MSTS', u: 'bks-emd-v1-horns.html' },
    { t: 'BKS WAG-9 V1 Horns', m: 'Original WAG-9 horn library for heavy freight consists — free download', ty: 'MSTS', u: 'bks-wag9-v1-horns.html' },
    { t: 'BKS WAG-9 V2 Horns', m: 'Deep, thundering WAG-9 freight air horns, V2 edition — free download', ty: 'MSTS', u: 'bks-wag9-v2-horns.html' },
    { t: 'BKS WAP-5 V1 Horns', m: 'The iconic high-speed WAP-5 commuter horn — free download', ty: 'MSTS', u: 'bks-wap5-v1-horns.html' },
    { t: 'BKS WAP-5 V2 Horns', m: 'Polished WAP-5 horn second edition with clearer top end — free download', ty: 'MSTS', u: 'bks-wap5-v2-horns.html' },
    { t: 'BKS WAP-7 V2 Horns', m: 'Twin-tone WAP-7 horns with smooth reverb tail — free download', ty: 'MSTS', u: 'bks-wap7-v2-horns.html' },
    { t: 'BKS WAP-7 V3 Horns', m: 'Crisp homing horns and long twin-tone blasts — free download', ty: 'MSTS', u: 'bks-wap7-v3-horns.html' },
    { t: 'BRP Tejas Rajdhani Updated', m: 'Detailed Tejas Express LHB coaches with real interiors — free download', ty: 'MSTS', u: 'brp-tejas-rajdhani.html' },
    { t: 'Dakshina Madhya Railway Route', m: 'Deccan trunk mainline — Secunderabad, Guntakal and Hubli — 5 RAR parts — free', ty: 'MSTS', u: 'dakshina-madhya-railway.html' },
    { t: 'Mister Download Manager', m: 'Free open-source pure-Rust download manager v0.5.2 — 32 connections, torrents, videos, galleries, 86 languages, Windows, Linux and macOS — free', ty: 'Downloads', u: 'mister-download-manager-download.html' },
    { t: 'Gallery', m: 'MSTS routes, locomotives, reshades and game screenshots — fullscreen viewer', ty: 'Page', u: 'gallery.html' },
    { t: 'Gallery — Page 2', m: 'MSTS routes, locomotives and screenshots — gallery part 2', ty: 'Page', u: 'gallery2.html' },
    { t: 'Gallery — Page 3', m: 'MSTS routes, locomotives and screenshots — gallery part 3', ty: 'Page', u: 'gallery3.html' },
    { t: 'Gallery — Page 4', m: 'MSTS routes, locomotives and screenshots — gallery part 4', ty: 'Page', u: 'gallery4.html' },
    { t: 'Gallery — Page 5', m: 'MSTS routes, locomotives and screenshots — gallery part 5', ty: 'Page', u: 'gallery5.html' },
    { t: 'Gallery — Page 6', m: 'MSTS routes, locomotives and screenshots — gallery part 6', ty: 'Page', u: 'gallery6.html' },
    { t: 'Games', m: 'Free game repacks and downloads on piravexbay MSTS', ty: 'Downloads', u: 'games.html' },
    { t: 'GitHub Release Push Command', m: 'One PowerShell command to tag a release and upload assets via gh CLI', ty: 'Guides', u: 'github-release-push-command.html' },
    { t: 'GTA.San.Andreas.Repack', m: 'GTA San Andreas v2.0 classic open-world action repack — free download', ty: 'Downloads', u: 'gta-san-andreas-repack.html' },
    { t: 'Horn by BK — 11 Horns Pack', m: '11 hand-tuned Indian loco horns in one classic collection — free rar download', ty: 'MSTS', u: 'horn-by-bk-11-horns-pack.html' },
    { t: 'JerryFlow.V2 AE Plugin', m: 'JerryFlow V2 effect and flow plugin for After Effects — free download', ty: 'Downloads', u: 'jerryflow-v2-ae-plugin.html' },
    { t: 'JJJPro_Double_Decker', m: 'JJJ Double Decker coach pack, Yellow-Red & Yellow-Green liveries — free download', ty: 'MSTS', u: 'jjjpro-double-decker.html' },
    { t: 'KERELA V2 UPDATE ACTS', m: 'Kerala Express, Parasuram, Tirunelveli Humsafar activities — free download', ty: 'MSTS', u: 'kerela-v2-update-acts.html' },
    { t: 'KHANDESH DHULE UPDATE ACTS', m: 'Deccan Queen anniversary, CSMT-Nagpur Duronto activities — free download', ty: 'MSTS', u: 'khandesh-dhule-update-acts.html' },
    { t: 'KONKAN COASTAL KULEM (DUDSAGAR) ACTS', m: 'Goa Express, Vasco-Secunderabad Express activities — free download', ty: 'MSTS', u: 'konkan-coastal-kulem-dudsagar-update-acts.html' },
    { t: 'Konkan Coastal Link - Kulem Update', m: 'Konkan run to Kulem (QLM) and the Dudhsagar ghat climb - one download link - free', ty: 'MSTS', u: 'konkan-coastal-link-kulem-update.html' },
    { t: 'Konkan Coastal Link — The Beginning', m: 'Original Konkan coastal run — 6 ZIP parts, ~11.34 GB — free download', ty: 'MSTS', u: 'konkan-coastal-link-the-beginning.html' },
    { t: 'KONKAN COASTAL LINK VASCO ACTS', m: 'Mandovi, Rocket Express, Konkan Kanya double duty activities — free download', ty: 'MSTS', u: 'konkan-coastal-link-vasco-acts.html' },
    { t: 'Konkan Coastal Link — Vasco Update', m: 'Refreshed Vasco da Gama route along the Konkan coastline — free download', ty: 'MSTS', u: 'konkan-coastal-link-vasco.html' },
    { t: 'LCD to OLED — Intel Command Center Settings', m: 'Switch to the OLED panel and configure Intel graphics — settings guide', ty: 'Guides', u: 'lcd-to-oled-intel-comm-center-settings.html' },
    { t: 'MSTS Loop Horn Maker', m: 'Create, loop and export your own horn sounds for MSTS — free download', ty: 'MSTS', u: 'msts-loop-horn-maker.html' },
    { t: 'ECR 2.0 Gaya Update', m: 'East Central Railway Grand Chord through Gaya Jn — one download link — free', ty: 'MSTS', u: 'msts-route-ecr-gaya.html' },
    { t: 'Grand Deccan Route', m: 'Chennai Central to Bangalore via Jolarpettai — one download link — free', ty: 'MSTS', u: 'msts-route-grand-deccan.html' },
    { t: 'Kamakhya Guwahati Dibrugarh Update', m: 'NFR trunk route across the Brahmaputra valley — one download link — free', ty: 'MSTS', u: 'msts-route-kamakhya-guwahati-dibrugarh.html' },
    { t: 'KRG Kerala V2 Route', m: 'Kerala route updated V2 — 3 RAR parts — free download', ty: 'MSTS', u: 'msts-route-krg-kerala-v2.html' },
    { t: 'Mumbai V4 Update Route', m: 'Mumbai suburban Western, Central and Harbour lines — 3 ZIP parts — free', ty: 'MSTS', u: 'msts-route-mumbai-v4-update.html' },
    { t: 'Narmada V2 Route', m: 'West Central Railway Narmada valley corridor — 4 RAR parts — free', ty: 'MSTS', u: 'msts-route-narmada-v2.html' },
    { t: 'NFR Version 2.2 Update with Acts', m: 'Guwahati–New Jalpaiguri corridor with activity pack — 9 ZIP parts — free', ty: 'MSTS', u: 'msts-route-nfr-v2-2-update-with-acts.html' },
    { t: 'NORTHERN DIVINE PATHANKOT UPDATE', m: 'Pathankot Jn to Jalandhar Cantt extension — 3 RAR parts — free', ty: 'MSTS', u: 'msts-route-northen-divine-pathankot-update.html' },
    { t: 'TIIC Dehradun Update', m: 'Refreshed Dehradun route with better scenery - one download link - free', ty: 'MSTS', u: 'msts-route-tiic-dehradun-update.html' },
    { t: 'Narmada V2 Activities', m: 'Kamayani, Jhelum, Karnataka Express and more — 4 activities — free', ty: 'MSTS', u: 'narmada-v2-route-activities.html' },
    { t: 'NFR V2.2 Latest Route Acts', m: '6 ready-to-run NFR V2.2 activities — free downloads', ty: 'MSTS', u: 'nfr-v2-2-latest-route-acts.html' },
    { t: 'Predator Helios 300 PH3115-51 Safety Guide', m: 'Official safety guide PDF — setup, battery care, precautions — free download', ty: 'Guides', u: 'predator-helios-300-ph3115-51-safety-guide.html' },
    { t: 'Predator Helios 300 PH3115-51 Service Guide', m: 'Complete teardown, disassembly and reassembly manual PDF — free download', ty: 'Guides', u: 'predator-helios-300-ph3115-51-service-guide.html' },
    { t: 'SHRI SALASAR LUDHINA UPDATE ACTS', m: '16 activities for the Ludhiana Junction update — free downloads', ty: 'MSTS', u: 'shri-salasar-ludhina-update-acts.html' },
    { t: 'Download SHRI SALASAR LUDHINA UPDATE', m: 'All 13 RAR parts on one page — ~26.5 GB — free download', ty: 'MSTS', u: 'shri-salasar-ludhina-update-download.html' },
    { t: 'SHRI SALASAR LUDHINA UPDATE', m: 'Shri Salasar Route Ludhiana Jn update — 13 RAR parts — free', ty: 'MSTS', u: 'shri-salasar-ludhina-update.html' },
    { t: 'Sounds by BKS', m: '10 hand-tuned Indian horn packs — WAP-7, WAP-5, WAG-9, EMD, AI', ty: 'MSTS', u: 'sounds-by-bks.html' },
    { t: 'TSCR-V2-KZJ Update Activities', m: '19 ready-to-run Kazipet Junction activities — free downloads', ty: 'MSTS', u: 'tscr-v2-kzj-update-acts.html' },
    { t: 'Download TSDRV7', m: 'TSD Route V7 full build — 11 split RAR parts, ~19.03 GB — free', ty: 'MSTS', u: 'tsdrv7-route-download.html' },
    { t: 'Windows 7 Official ISO', m: 'Genuine untouched x64 installation media for MSTS — free download', ty: 'Downloads', u: 'windows-7-official-iso.html' },
    { t: 'WRV12 Activities', m: '57 Western Railways V12 activities — Shatabdi to Vande Bharat — free', ty: 'MSTS', u: 'wrv12-activities.html' },
  ];

  /* Full-site index (search-index.js) loads only when search is opened. */
  var EXTRA = [];
  var extraState = 0; /* 0 = idle, 1 = loading, 2 = ready */
  var extraQueue = [];
  function loadExtra(cb) {
    if (extraState === 2) { if (cb) cb(); return; }
    if (cb) extraQueue.push(cb);
    if (extraState === 1) return;
    extraState = 1;
    var s = document.createElement('script');
    s.src = 'search-index.js?v=20261104a';
    s.async = true;
    function done() {
      EXTRA = window.AB_EXTRA_INDEX || [];
      extraState = 2;
      var q = extraQueue.slice(); extraQueue.length = 0;
      q.forEach(function (fn) { try { fn(); } catch (e) {} });
    }
    s.onload = done;
    s.onerror = done; /* search still works with the built-in index */
    document.head.appendChild(s);
  }
  function searchHits(q) {
    var nq = norm(q);
    var pool = EXTRA.length ? INDEX.concat(EXTRA) : INDEX;
    var seen = {};
    var hits = [];
    pool.forEach(function (it) {
      if (!matches(it.t + ' ' + it.m + ' ' + it.ty, q)) return;
      /* Ek hi page par same naam ke duplicate buttons sirf ek baar dikhao.
         File entries ke u me "#find=...&n=..." hota hai isliye sirf page part. */
      var k = norm(it.t) + '|' + String(it.u || '').split('#')[0];
      if (seen[k]) return;
      seen[k] = 1;
      var nt = norm(it.t), score = 3;
      if (nt === nq) score = 0;
      else if (nt.indexOf(nq) === 0) score = 1;
      else if (nt.indexOf(nq) !== -1) score = 2;
      hits.push({ it: it, s: score });
    });
    hits.sort(function (x, y) { return x.s - y.s; });
    return hits.map(function (h) { return h.it; });
  }


  function norm(s) { return String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); }
  function matches(text, q) {
    var nq = norm(q); if (!nq) return true;
    var nh = norm(text);
    var cq = nq.replace(/ /g, ''), ch = nh.replace(/ /g, '');
    if (nh.indexOf(nq) !== -1 || ch.indexOf(cq) !== -1) return true;
    return nq.split(' ').every(function (t) { return nh.indexOf(t) !== -1 || ch.indexOf(t) !== -1; });
  }

  var modal = document.getElementById('searchModal');
  var input = document.getElementById('modalSearchInput');
  var results = document.getElementById('searchResults');

  /* Lenis wheel ko poore page par hijack karta hai — modal par
     data-lenis-prevent lagane se RESULTS panel ka native scroll chalega
     (jaise mobile menu #mainNav par lagta hai). */
  if (modal) modal.setAttribute('data-lenis-prevent', '');

  window.openSearchModal = function () {
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    abScrollLock(true);
    setTimeout(function () { if (input) input.focus(); }, 60);
  };
  function closeSearch() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
    abScrollLock(false);
  }
  window.closeSearchModal = closeSearch;

  if (modal) {
    modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('.search-close')) closeSearch(); });
  }
  function renderSearch(q) {
    if (!results) return;
    if (!norm(q)) { results.classList.remove('open'); results.innerHTML = ''; return; }
    var hits = searchHits(q);
    if (hits.length) {
      results.innerHTML = hits.slice(0, 12).map(function (it) {
        /* File = download button (tile) — chhota download icon + gold badge */
        var isFile = it.ty === 'File';
        return '<a href="' + it.u + '"><span><span class="sr-t">' + (isFile ?
          '<span class="material-symbols-outlined sr-ic" aria-hidden="true">download</span>' : '') + it.t +
          '</span><br><span class="sr-m">' + it.m + '</span></span><span class="sr-b' + (isFile ? ' b-file' : '') +
          '">' + it.ty + '</span></a>';
      }).join('');
    } else {
      results.innerHTML = '<div class="search-empty">No results for "<b>' + q.replace(/</g, '&lt;') +
        '"</b> — try routes, locomotives, sounds, plugins…</div>';
    }
    results.classList.add('open');
  }

  if (input && results) {
    input.addEventListener('input', function () {
      var q = input.value.trim();
      renderSearch(q);
      if (norm(q)) loadExtra(function () { if (input.value.trim() === q) renderSearch(q); });
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var first = results.querySelector('a');
        if (!first) return;
        e.preventDefault();
        var href = first.getAttribute('href');
        var page = href.split('#')[0];
        var here = location.pathname.split('/').pop() || 'index.html';
        if (page && page !== here) { location.href = href; return; }
        /* Same page: modal band karke hash update/highlight */
        closeSearch();
        var hi = href.indexOf('#');
        if (hi === -1) return;
        var hashPart = hi === 0 ? href : href.slice(hi);
        if (hashPart === location.hash) abFindFromHash();
        else location.hash = hashPart.slice(1);
      }
    });
  }
  /* Result par click: usi page par ho to modal band karke hash turant
     set/highlight; doosre page par ho to page waise hi khul jayega. */
  if (results) {
    results.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      var page = href.split('#')[0];
      var here = location.pathname.split('/').pop() || 'index.html';
      if (page && page !== here) { closeSearch(); return; }
      /* Same page: naya hash lagao, pura reload nahi */
      e.preventDefault();
      closeSearch();
      var hi = href.indexOf('#');
      if (hi === -1) return;
      var hashPart = hi === 0 ? href : href.slice(hi);
      if (hashPart === location.hash) abFindFromHash(); /* same hash: hashchange fire nahi hota */
      else location.hash = hashPart.slice(1);
    });
  }
  document.querySelectorAll('[data-open-search]').forEach(function (btn) {
    btn.addEventListener('click', function (e) { e.preventDefault(); openSearchModal(); });
  });

  /* ---------- Animated counters ----------
     .reveal is CSS-only now (no entrance animation is used), so no
     scroll observer is needed for it. Fewer observers = less work. */
  var co = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / 1400, 1);
        el.textContent = Math.floor(end * (1 - Math.pow(1 - p, 3))) + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-num[data-count]').forEach(function (c) { co.observe(c); });

  /* ---------- Marquee duplication (seamless loop) ----------
     The endless animation is paused whenever the strip is offscreen or
     the tab is hidden, so it doesn't keep the GPU busy while scrolling. */
  document.querySelectorAll('.marquee-track').forEach(function (track) {
    track.innerHTML += track.innerHTML;
    if (!('IntersectionObserver' in window)) return;
    var visible = false;
    function apply() {
      track.style.animationPlayState = (visible && !document.hidden) ? 'running' : 'paused';
    }
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      apply();
    }, { rootMargin: '80px' }).observe(track);
    document.addEventListener('visibilitychange', apply);
  });

  /* ---------- Card cursor glow (mouse only, one paint per frame) ---------- */
  if (window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('.category-card, .product-card').forEach(function (card) {
      var frame = 0;
      card.addEventListener('pointermove', function (e) {
        if (frame) return;
        frame = requestAnimationFrame(function () {
          frame = 0;
          var r = card.getBoundingClientRect();
          if (!r.width || !r.height) return;
          card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
          card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
        });
      }, { passive: true });
    });
  }

  /* ---------- Poora card clickable — kahin bhi click = product page ----------
     Sirf card ke andar kisi anchor/button par click karne par wo apne
     hisaab se chalta hai; baaki jagah (image, title, price, padding)
     View button jaisa hi redirect karta hai. Placeholder cards (href="#")
     skip ho jaate hain. */
  document.querySelectorAll('.product-card').forEach(function (card) {
    var link = card.querySelector('.pc-actions a') || card.querySelector('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#') return; /* "coming soon" cards skip */
    card.style.cursor = 'pointer';
    card.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) return; /* andar ke buttons/links ko touch mat karo */
      link.click(); /* jaise View daba diya — same tab / new tab waisa hi */
    });
  });

  /* ---------- Pagination (data-paginate="8") + Filter chips ---------- */
  var paginators = [];
  document.querySelectorAll('[data-paginate]').forEach(function (grid) {
    var cfg = {
      grid: grid,
      per: parseInt(grid.getAttribute('data-paginate'), 10) || 8,
      page: 0,
      filter: 'all',
      pager: grid.parentElement.querySelector('[data-pager]'),
      cards: Array.prototype.filter.call(grid.children, function (el) { return el.hasAttribute('data-cat'); })
    };
    grid.__pag = cfg;
    paginators.push(cfg);
  });

  function applyPag(cfg, resetPage) {
    if (resetPage) cfg.page = 0;
    var match = cfg.cards.filter(function (c) { return cfg.filter === 'all' || c.dataset.cat === cfg.filter; });
    var pages = Math.max(1, Math.ceil(match.length / cfg.per));
    if (cfg.page > pages - 1) cfg.page = pages - 1;
    if (cfg.page < 0) cfg.page = 0;
    var start = cfg.page * cfg.per;
    cfg.cards.forEach(function (c) { c.style.display = 'none'; });
    match.slice(start, start + cfg.per).forEach(function (c) { c.style.display = ''; });
    if (!cfg.pager) return;
    if (pages < 2) { cfg.pager.innerHTML = ''; cfg.pager.classList.remove('on'); return; }
    var h = '<button class="pg-btn pg-arrow" type="button" data-pg="prev" aria-label="Previous page"' +
      (cfg.page === 0 ? ' disabled' : '') + '><span class="material-symbols-outlined">chevron_left</span></button>';
    for (var i = 0; i < pages; i++) {
      h += '<button class="pg-btn' + (i === cfg.page ? ' active' : '') + '" type="button" data-pg="' + i +
        '" aria-label="Page ' + (i + 1) + '"' + (i === cfg.page ? ' aria-current="page"' : '') + '>' + (i + 1) + '</button>';
    }
    h += '<button class="pg-btn pg-arrow" type="button" data-pg="next" aria-label="Next page"' +
      (cfg.page === pages - 1 ? ' disabled' : '') + '><span class="material-symbols-outlined">chevron_right</span></button>';
    cfg.pager.innerHTML = h;
    cfg.pager.classList.add('on');
  }
  paginators.forEach(function (cfg) { applyPag(cfg); });

  document.querySelectorAll('[data-pager]').forEach(function (pager) {
    var grid = pager.parentElement.querySelector('[data-paginate]');
    if (!grid || !grid.__pag) return;
    var cfg = grid.__pag;
    pager.addEventListener('click', function (e) {
      var b = e.target.closest('.pg-btn');
      if (!b || b.disabled) return;
      var v = b.getAttribute('data-pg');
      if (v === 'prev') cfg.page--;
      else if (v === 'next') cfg.page++;
      else cfg.page = parseInt(v, 10) || 0;
      applyPag(cfg);
      abScrollTo(grid);
    });
  });

  /* ---------- Filter chips ---------- */
  document.querySelectorAll('.filter-chips').forEach(function (group) {
    group.querySelectorAll('.chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        group.querySelectorAll('.chip').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var f = btn.dataset.filter;
        var scope = group.dataset.scope ? document.querySelector(group.dataset.scope) : document;
        scope.querySelectorAll('[data-cat]').forEach(function (card) {
          card.style.display = (f === 'all' || card.dataset.cat === f) ? '' : 'none';
        });
        /* Pagination wale grids: filter ke saath dobara paginate (page 1 par reset) */
        paginators.forEach(function (cfg) {
          if (scope.contains(cfg.grid)) { cfg.filter = f; applyPag(cfg, true); }
        });
      });
    });
  });

  /* ---------- Product tabs (SimAdda-style) ---------- */
  document.querySelectorAll('.ptabs').forEach(function (bar) {
    var tabs = bar.querySelectorAll('.ptab');
    var scope = bar.parentElement;
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var id = tab.dataset.tab;
        scope.querySelectorAll('.ptab-panel').forEach(function (p) {
          p.classList.toggle('active', p.id === id);
        });
        /* Support hash deep-links like #tab-installation */
      });
    });
    /* Open tab from URL hash (#tab-installation etc.) */
    function openFromHash() {
      if (!location.hash) return;
      var target = scope.querySelector('.ptab[data-tab="' + location.hash.slice(1) + '"]');
      if (target) target.click();
    }
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
  });

  /* ---------- Donation popup — download se PEHLE, 8s lock, MSTS + RailWorks ---------- */
  (function () {
    /* Popup markup JS se inject hota hai — 53 pages me alag se add karne ki zaroorat nahi */
    var pop = document.createElement('div');
    pop.id = 'donPop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-modal', 'true');
    pop.setAttribute('aria-hidden', 'true');
    pop.innerHTML =
      '<div class="don-back"></div>' +
      '<div class="don-card">' +
        '<button class="don-close" type="button" aria-label="Close donation popup" data-don-close>&#10005;</button>' +
        '<div class="don-badge">MSTS &amp; RailWorks Community</div>' +
        '<h3 id="donTitle">Enjoying <span>piravexbay MSTS</span>?</h3>' +
        '<p class="don-txt">Loving the Indian routes, locomotives and sounds? Support the MSTS &amp; RailWorks addon creators and keep every download 100% free for everyone.</p>' +
        '<div class="don-btns">' +
          '<a href="https://docs.google.com/forms/d/e/1FAIpQLSez0NfEJZIGAePycFk0E-s8qAbOqifycc32dlFzXu9G7Shcig/viewform?usp=header" target="_blank" rel="noopener" data-no-don class="don-btn don-btn-3">I Have Addons To Share</a>' +
        '</div>' +
        '<p class="don-note">Got paid MSTS / RailWorks addons? Share them and keep the bay growing.</p>' +
      '</div>';
    document.body.appendChild(pop);

    var KEY = 'piravexDonState';
    var COOLDOWN = 120000; /* close ke baad 2 min cooldown + har page par session me sirf 1 baar */
    function readSt() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
    function writeSt(st) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

    var lockIv = null, lockLeft = 8, lockBtns = [], pendingUrl = null;

    function stopLock() { if (lockIv) { clearInterval(lockIv); lockIv = null; } }
    function runLock() {
      stopLock();
      lockIv = setInterval(function () {
        lockLeft--;
        if (lockLeft > 0) { lockBtns.forEach(function (b) { b.textContent = lockLeft; }); return; }
        stopLock();
        lockBtns.forEach(function (b) { b.classList.remove('counting'); b.disabled = false; b.textContent = '\u2715'; });
      }, 1000);
    }
    /* Countdown tab visible hone par chalta hai (chahe user kisi aur app me ho) */
    function syncLock() {
      if (!pop.classList.contains('open') || lockLeft <= 0) return;
      if (document.hidden) stopLock(); else runLock();
    }
    document.addEventListener('visibilitychange', syncLock);
    window.addEventListener('focus', syncLock);
    window.addEventListener('blur', syncLock);

    function startLock() {
      lockBtns = pop.querySelectorAll('[data-don-close]');
      lockLeft = 8;
      stopLock();
      lockBtns.forEach(function (b) { b.classList.add('counting'); b.disabled = true; b.textContent = lockLeft; });
      if (!document.hidden) runLock();
    }
    var PAGE_KEY = 'piravexDonPages'; /* sessionStorage — kaunsi pages par popup ho chuka */
    function pageShown() {
      try { return (JSON.parse(sessionStorage.getItem(PAGE_KEY) || '[]')).indexOf(location.pathname) !== -1; }
      catch (e) { return false; }
    }
    function markPage() {
      try {
        var p = JSON.parse(sessionStorage.getItem(PAGE_KEY) || '[]');
        if (p.indexOf(location.pathname) === -1) { p.push(location.pathname); sessionStorage.setItem(PAGE_KEY, JSON.stringify(p)); }
      } catch (e) {}
    }
    function openPop(url, flash) {
      pendingUrl = url || null;
      markPage(); /* is page par ab aur nahi — agla popup dusre page par */
      pop.classList.add('open');
      pop.setAttribute('aria-hidden', 'false');
      abScrollLock(true); /* popup khula ho to peeche page scroll na ho */
      if (flash) { pop.classList.remove('flash'); void pop.offsetWidth; pop.classList.add('flash'); }
      startLock();
    }
    function closePop() {
      var cb = pop.querySelector('[data-don-close]');
      if (cb && cb.disabled) return; /* lock chal raha hai — band nahi hoga */
      stopLock();
      pop.classList.remove('open', 'flash');
      pop.setAttribute('aria-hidden', 'true');
      abScrollLock(false);
      var st = readSt(); st.nextShowAt = Date.now() + COOLDOWN; writeSt(st);
      /* Lock khatam → close dabate hi asli download link naye tab me khul jaaye */
      if (pendingUrl) { var u = pendingUrl; pendingUrl = null; window.open(u, '_blank', 'noopener'); }
    }
    pop.querySelectorAll('[data-don-close]').forEach(function (el) { el.addEventListener('click', closePop); });
    /* NOTE: backdrop (.don-back) par click se band NAHI hota — sirf 8s lock
       khatam hone ke baad X button se band hoga */
    /* Donate buttons daba diye → seedha donation page, pending download drop */
    pop.querySelectorAll('.don-btn').forEach(function (a) {
      a.addEventListener('click', function () {
        pendingUrl = null;
        stopLock();
        var st = readSt(); st.nextShowAt = Date.now() + COOLDOWN; writeSt(st);
        pop.classList.remove('open', 'flash');
        pop.setAttribute('aria-hidden', 'true');
        abScrollLock(false);
      });
    });

    /* Download link detect — EXTERNAL link jo download jaisa ho:
       (a) purane download classes/selectors, (b) download table ke andar,
       (c) target="_blank" (nav/footer chhod kar) */
    var DL_SEL = 'a.btn-dl, .btn-dl, [data-dl], [data-download], a[download], .dl-btn, .btn-download, .download-btn, ' +
      '#downloads a, .table-wrap a, .pc-actions a.icon-btn.gold, ' +
      'a[href*="mediafire.com"], a[href*="releases/download"], a[href*="opencloud"], a[href*="drive.google.com"], ' +
      'a[href*="drive.user.google.com"], a[href*="mega.nz"], a[href*="dropbox.com"], a[href*="github.com"], ' +
      'a[href*="spacebyte.in"]';
    function isDlLink(el) {
      if (el.hasAttribute('data-no-don')) return false; /* submission form jaise important links popup me nahi atke */
      if (el.matches(DL_SEL)) return true;
      if (el.closest('table, .table-wrap')) return true;
      if (el.target === '_blank' && !el.closest('nav, footer')) return true;
      return false;
    }
    /* Asli download URL ko data-href me shift karo — href par sirf "#".
       Fayda: (1) hover par status bar me download link nahi dikhti,
       (2) Ctrl/Shift+Click ya middle-click ke paas koi link hi nahi bachta,
       isliye popup bypass ho kar seedha open nahi ho sakta. */
    function goNow(el, url, ev) {
      var newTab = el.target === '_blank' || (ev && (ev.ctrlKey || ev.metaKey || ev.shiftKey));
      if (newTab) window.open(url, '_blank', 'noopener'); else location.href = url;
    }
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0) return;
      var isExternal = /^https?:\/\//i.test(href) && (location.protocol === 'file:' || href.indexOf(location.host) === -1);
      if (!isExternal && !a.hasAttribute('download')) return;
      if (!isDlLink(a)) return;
      a.setAttribute('data-href', href.replace(/&amp;/g, '&'));
      a.setAttribute('href', '#');
    });
    document.addEventListener('click', function (ev) {
      if (!ev.target || !ev.target.closest) return;
      if (pop.contains(ev.target)) return;
      if (pop.classList.contains('open')) return;
      var el = dlAnchor(ev.target);
      if (!el) return;
      /* Har download click par popup — koi cooldown/page-skip nahi.
         Reload, naya tab, ya purana session state ise bypass nahi kar sakta. */
      ev.preventDefault();
      ev.stopPropagation();
      openPop(dlUrl(el), true);
    }, true);
    /* Koi bhi download anchor dhundo — chhupa hua (data-href) ya runtime par
       add hua (seedha external href). Dono par popup lazmi. */
    function dlAnchor(node) {
      if (!node || !node.closest) return null;
      var el = node.closest('a[data-href], a[href]');
      if (!el || el.hasAttribute('data-no-don')) return null;
      if (el.getAttribute('data-href')) return el;
      var h = el.getAttribute('href') || '';
      if (!h || h.charAt(0) === '#' || h.indexOf('mailto:') === 0) return null;
      var ext = /^https?:\/\//i.test(h) && (location.protocol === 'file:' || h.indexOf(location.host) === -1);
      if (!ext && !el.hasAttribute('download')) return null;
      return isDlLink(el) ? el : null;
    }
    function dlUrl(el) {
      return el.getAttribute('data-href') || el.getAttribute('href') || '';
    }
    /* Middle-click (auxclick) — download direct nahi khulega, popup hi aayega */
    document.addEventListener('auxclick', function (ev) {
      if (!ev.target || !ev.target.closest) return;
      if (pop.contains(ev.target)) return;
      var el = dlAnchor(ev.target);
      if (!el) return;
      ev.preventDefault();
      ev.stopPropagation();
      if (pop.classList.contains('open')) return;
      openPop(dlUrl(el), true);
    }, true);
    /* Right-click menu ("Open link in new tab" / "Copy link") aur drag-open
       se direct download bypass block */
    ['contextmenu', 'dragstart'].forEach(function (type) {
      document.addEventListener(type, function (ev) {
        if (!ev.target || !ev.target.closest) return;
        var el = dlAnchor(ev.target);
        if (!el || pop.contains(el)) return;
        ev.preventDefault();
        ev.stopPropagation();
      }, true);
    });
  })();

  /* ---------- Smooth in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (!href || href === '#') { e.preventDefault(); return; }
      var t = null;
      try { t = document.querySelector(href); } catch (err) { t = null; }
      if (!t) return;
      e.preventDefault();
      abScrollTo(t);
      closeMenu();
    });
  });

  /* ---------- Search deep-link highlight ----------
     Navbar ki search se koi download tile (button) choose karne par uska
     result "page.html#find=<naam>&n=<index>" banata hai. Ye module har page
     par us hash ko padh kar sahi tile dhunda: scroll + golden glow highlight.
     - 'find' me tile ke naam match hota hai (exact, normalize karke)
     - 'n' fallback index hai (agar naam match na mile to)               */
  function abFindFromHash() {
    var h = location.hash || '';
    if (h.charAt(0) === '#') h = h.slice(1);
    if (!h || (h.indexOf('find=') === -1 && h.indexOf('n=') === -1)) return false;
    var find = '', n = NaN;
    h.split('&').forEach(function (pair) {
      var eq = pair.indexOf('=');
      if (eq === -1) return;
      var k = pair.slice(0, eq), v = pair.slice(eq + 1);
      try { v = decodeURIComponent(v.replace(/\+/g, '%20')); } catch (err) {}
      if (k === 'find') find = v;
      else if (k === 'n') n = parseInt(v, 10);
    });
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.dl-tile'));
    if (!tiles.length) return false;
    var target = null;
    var nf = norm(find);
    if (nf) {
      for (var i = 0; i < tiles.length; i++) {
        var b = tiles[i].querySelector('.dl-tile-txt b') || tiles[i].querySelector('b');
        if (b && norm((b.textContent || '').trim()) === nf) { target = tiles[i]; break; }
      }
    }
    if (!target && !isNaN(n) && n >= 0 && n < tiles.length) target = tiles[n];
    if (!target) return false;
    if (target.classList.contains('ab-found')) return true;
    /* Agar tile kisi inactive tab (.ptab-panel) ke andar chhupa hai to
       pehle uska tab khologo — warna scroll/highlight dikhega hi nahi. */
    var panel = target.closest ? target.closest('.ptab-panel') : null;
    if (panel && !panel.classList.contains('active')) {
      var scope = panel.parentElement;
      var bar = scope ? scope.querySelector('.ptabs') : null;
      var tab = bar ? bar.querySelector('.ptab[data-tab="' + panel.id + '"]') : null;
      if (tab) tab.click();
    }
    target.classList.add('ab-found');
    /* Do baar scroll: layout/images settle hone ke baad ek correction pass */
    setTimeout(function () { abScrollTo(target, -110); }, 120);
    setTimeout(function () { abScrollTo(target, -110); }, 900);
    setTimeout(function () { abScrollTo(target, -110); }, 1700);
    setTimeout(function () { target.classList.remove('ab-found'); }, 4400);
    return true;
  }
  window.addEventListener('hashchange', abFindFromHash);
  abFindFromHash();
  window.addEventListener('load', function () { abFindFromHash(); });

  /* ---------- Hash scroll on load ---------- */
  function scrollToHash(delay) {
    if (!location.hash) return;
    var t = null;
    try { t = document.querySelector(location.hash); } catch (e) { t = null; }
    if (t) setTimeout(function () { abScrollTo(t); }, delay);
  }
  window.addEventListener('load', function () { scrollToHash(150); });
})();

/* ============================================================
   MEDIA SLIDESHOWS — lazy, visibility-aware
   Images are loaded only when their card is near the viewport.
   Offscreen slideshows pause, so the page stays smooth.
   ============================================================ */
(function () {
  'use strict';

  var mqMobile = window.matchMedia ? window.matchMedia('(max-width: 900px), (hover: none)') : null;
  function isMobile() { return !!(mqMobile && mqMobile.matches); }

  /* Smaller CDN renders on phones. Same image, roughly half the bytes and
     decode work of the 1600px desktop file. Desktop URLs stay untouched. */
  function imageUrl(u) {
    if (!u || !isMobile()) return u;
    if (/wsrv\.nl|images\.weserv\.nl|i0\.wp\.com/i.test(u)) {
      return u.replace(/([?&])w=\d+/, '$1w=1200');
    }
    return u;
  }

  /* Load a deferred image (data-src -> src) exactly once. */
  function loadImg(img) {
    if (!img || !img.dataset.src) return false;
    img.removeAttribute('loading');
    img.decoding = 'async';
    img.src = imageUrl(img.dataset.src);
    delete img.dataset.src;
    return true;
  }

  /* Wait until the decoded bitmap is ready, not just downloaded. This keeps
     image decode off the frame where the fade starts (big mobile win). */
  function decodeThen(img, cb) {
    var p = null;
    try { p = img && img.decode && img.decode(); } catch (e) { p = null; }
    if (p && p.then) p.then(cb, cb); else cb();
  }

  /* Run a callback when an image has loaded and decoded (or errored). */
  function afterLoad(img, cb) {
    if (!img || !img.getAttribute('src')) { cb(); return; }
    if (img.complete) { decodeThen(img, cb); return; }
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      img.removeEventListener('load', finish);
      img.removeEventListener('error', finish);
      decodeThen(img, cb);
    }
    img.addEventListener('load', finish);
    img.addEventListener('error', finish);
  }

  /* ---------- One scheduler for every slideshow ----------
     50+ independent setInterval timers used to wake the main thread all
     over the page. Now a single 1s tick drives them, and nothing changes
     while the user is actively scrolling. */
  var tickers = [];
  var tickTimer = null;
  var scrolling = false;
  var scrollEnd = 0;

  function scrollStop() {
    scrolling = false;
    var now = Date.now();
    tickers.forEach(function (t) {
      if (t.next <= now) t.next = now + 500 + Math.random() * 1500;
    });
  }
  window.addEventListener('scroll', function () {
    scrolling = true;
    clearTimeout(scrollEnd);
    scrollEnd = setTimeout(scrollStop, 220);
  }, { passive: true });

  function runTickers() {
    if (document.hidden || scrolling) return;
    var now = Date.now();
    for (var i = 0; i < tickers.length; i++) {
      var t = tickers[i];
      if (now < t.next) continue;
      t.next = now + t.interval;
      try { t.fn(); } catch (e) {}
    }
  }
  function every(interval, fn) {
    tickers.push({ interval: interval, fn: fn, next: Date.now() + interval });
    if (!tickTimer) tickTimer = setInterval(runTickers, 1000);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    var now = Date.now();
    tickers.forEach(function (t) { t.next = now + t.interval; });
  });

  /* Track visibility; the callback fires the first time it enters. */
  function watch(el, margin, onEnter) {
    var state = { visible: false, ever: false };
    if (!el) return state;
    if (!('IntersectionObserver' in window)) {
      state.visible = state.ever = true;
      if (onEnter) onEnter();
      return state;
    }
    var io = new IntersectionObserver(function (entries) {
      var en = entries[0];
      if (!en) return;
      state.visible = en.isIntersecting;
      if (en.isIntersecting && !state.ever) {
        state.ever = true;
        if (onEnter) onEnter();
      }
    }, { rootMargin: margin || '250px' });
    io.observe(el);
    return state;
  }

  /* Generic fade slideshow: loads the current + next image only. */
  function slideshow(media, selector, opt) {
    if (!media) return;
    var slides = media.querySelectorAll(selector);
    var len = slides.length;
    if (!len) return;
    opt = opt || {};

    /* Single-image media still needs its deferred src loaded on approach. */
    if (len === 1) {
      watch(media, opt.margin, function () { loadImg(slides[0]); });
      return;
    }

    var idx = typeof opt.start === 'function' ? opt.start(len) : 0;
    if (!(idx >= 0 && idx < len)) idx = 0;

    function activate(n) {
      for (var i = 0; i < len; i++) slides[i].classList.toggle('is-active', i === n);
    }
    activate(idx);

    var vis = watch(media, opt.margin, function () {
      loadImg(slides[idx]);
      /* Preload the next slide only when the browser is idle, so it never
         competes with the first paint / hero image. */
      function preloadNext() {
        for (var i = 1; i <= (opt.preload || 1); i++) loadImg(slides[(idx + i) % len]);
      }
      if (window.requestIdleCallback) window.requestIdleCallback(preloadNext, { timeout: 3000 });
      else setTimeout(preloadNext, 1200);
    });

    var busy = false;
    var interval = opt.interval || 4000;
    if (isMobile()) interval = Math.round(interval * 1.4);
    every(interval, function () {
      if (!vis.visible || busy) return;
      var next = opt.next ? opt.next(idx, len) : (idx + 1) % len;
      if (next === idx) return;

      busy = true;
      loadImg(slides[next]);
      var fired = false;
      function advance() {
        if (fired) return;
        fired = true;
        clearTimeout(fallback);
        busy = false;
        idx = next;
        activate(idx);
        if (vis.visible) loadImg(slides[(idx + 1) % len]);
      }
      var fallback = setTimeout(advance, 1800);
      afterLoad(slides[next], advance);
    });
  }

  /* Hero — first slide is already in HTML; load one ahead on demand. */
  slideshow(document.querySelector('.hero-slides'), '.hero-slide', {
    interval: 5000,
    margin: '0px'
  });

  /* Category cards — single images load on approach, slides run only nearby. */
  document.querySelectorAll('.cat-media').forEach(function (media) {
    if (media.querySelectorAll('.cat-slide').length > 1) {
      slideshow(media, '.cat-slide', {
        interval: parseInt(media.dataset.int, 10) || 5000,
        margin: '300px'
      });
      return;
    }
    var single = media.querySelector('img[data-src]');
    if (single) watch(media, '300px', function () { loadImg(single); });
  });

  /* Featured product media — random first slide, paused offscreen. */
  slideshow(document.querySelector('.featured-media'), '.fs-slide', {
    interval: 4000,
    margin: '200px',
    start: function (len) { return Math.floor(Math.random() * len); }
  });

  /* Product cards — unique random start, pause when offscreen.
     No two cards on the page ever show the same image at the same time. */
  var pcMedias = document.querySelectorAll('.pc-slideshow');
  if (pcMedias.length) {
    var pools = {};
    function randomStart(len) {
      var pool = pools[len];
      if (!pool) {
        var order = [];
        for (var i = 0; i < len; i++) order.push(i);
        for (var j = order.length - 1; j > 0; j--) {
          var r = Math.floor(Math.random() * (j + 1));
          var t = order[j]; order[j] = order[r]; order[r] = t;
        }
        pool = pools[len] = { order: order, at: 0 };
      }
      var n = pool.order[pool.at % pool.order.length];
      pool.at++;
      return n;
    }

    var pcCards = [];

    /* Same picture behind different CDN resize/format params = same key. */
    function slideKey(img) {
      if (!img) return '';
      var u = img.getAttribute('data-src') || img.getAttribute('src') || '';
      var wrapped = /[?&]url=([^&]+)/.exec(u);
      if (wrapped) {
        try { u = decodeURIComponent(wrapped[1]); } catch (e) { u = wrapped[1]; }
      }
      return u.replace(/^https?:\/\//i, '').replace(/[?#].*$/, '');
    }

    /* Cards inside (or just entering) the viewport compete for pictures, so a
       card scrolled into view never lands on what a neighbour is showing. */
    function nearScreen(el) {
      var r = el.getBoundingClientRect();
      var h = window.innerHeight || document.documentElement.clientHeight;
      var w = window.innerWidth || document.documentElement.clientWidth;
      return r.bottom > -300 && r.top < h + 300 && r.right > 0 && r.left < w;
    }

    /* Is this picture already showing on (or on its way to) another card?
       `anywhere` also checks cards that are still off screen. */
    function keyTaken(key, media, anywhere) {
      for (var i = 0; i < pcCards.length; i++) {
        var other = pcCards[i];
        if (other === media) continue;
        var shown = other._pcKey;
        if (shown !== key) shown = slideKey(other.querySelector('.pc-slide.is-active'));
        if (shown !== key) continue;
        if (anywhere || nearScreen(other)) return true;
      }
      return false;
    }

    pcMedias.forEach(function (media) {
      /* TSDR / Salasar slideshows are driven by their own scripts, which keep
         every box on a different image at the same moment — leave them to
         those scripts. */
      if (media.hasAttribute('data-tsdr-slides') || media.hasAttribute('data-salasar-slides')) return;
      var slides = media.querySelectorAll('.pc-slide');
      var len = slides.length;
      if (!len) return;
      pcCards.push(media);
      slideshow(media, '.pc-slide', {
        interval: parseInt(media.dataset.int, 10) || 4000,
        margin: '300px',
        start: function (total) {
          var first = randomStart(total);
          for (var i = 0; i < total; i++) {
            var cand = (first + i) % total;
            if (keyTaken(slideKey(slides[cand]), media, true)) continue;
            media._pcKey = slideKey(slides[cand]);
            return cand;
          }
          media._pcKey = slideKey(slides[first]);
          return first;
        },
        next: function (idx, total) {
          var from = Math.floor(Math.random() * total);
          for (var i = 0; i < total; i++) {
            var cand = (from + i) % total;
            if (cand === idx) continue;
            if (keyTaken(slideKey(slides[cand]), media)) continue;
            media._pcHeld = 0;
            media._pcKey = slideKey(slides[cand]);
            return cand;
          }
          /* Neighbours are showing every other picture — wait one beat, then
             move anyway so a card never looks frozen. */
          media._pcHeld = (media._pcHeld || 0) + 1;
          if (media._pcHeld < 2) return idx;
          media._pcHeld = 0;
          var any = Math.floor(Math.random() * total);
          if (any === idx) any = (idx + 1) % total;
          media._pcKey = slideKey(slides[any]);
          return any;
        }
      });
    });
  }

  /* ============================================================
     PRODUCT MEDIA VIEWER — .pg-viewer
     Pehla slide VIDEO, phir images. User arrows/dots se change
     karta hai. Video sirf active slide par mount hota hai.
     ============================================================ */
  document.querySelectorAll('.pg-viewer').forEach(function (box) {
    var track = box.querySelector('.pgv-track');
    if (!track) return;
    var slides = Array.prototype.slice.call(track.querySelectorAll('.pgv-slide'));
    if (slides.length < 2) return;

    var dotsWrap = box.querySelector('.pgv-dots');
    var countEl = box.querySelector('.pgv-count b');
    var typeEl = box.querySelector('.pgv-type');
    var prevBtn = box.querySelector('.pgv-prev');
    var nextBtn = box.querySelector('.pgv-next');
    var idx = 0;
    var started = false;
    var interacted = false;

    /* Aagli image pehle se load — user ko wait na karna pade */
    function preload(i) {
      var s = slides[(i + slides.length) % slides.length];
      var img = s && s.querySelector('img[data-src]');
      if (img) loadImg(img);
    }

    /* Video (Storj mp4) sirf active slide pe mount hota hai —
       slide change ho to audio/vo band ho jaye. */
    function mountVideo(slide) {
      var fr = slide.querySelector('iframe');
      if (fr) {
        if (!fr.getAttribute('src')) fr.setAttribute('src', fr.dataset.src);
        return;
      }
      var vd = slide.querySelector('video[data-src]');
      if (vd && !vd.getAttribute('src')) {
        watchFallback(vd);
        vd.setAttribute('src', vd.dataset.src);
      }
    }
    function unmountVideo(slide) {
      var fr = slide.querySelector('iframe[src]');
      if (fr) { fr.dataset.src = fr.getAttribute('src'); fr.removeAttribute('src'); }
      var vd = slide.querySelector('video[src]');
      if (vd) {
        vd.dataset.src = vd.getAttribute('src');
        vd.removeAttribute('src');
        try { vd.load(); } catch (e) {}
      }
    }

    /* Storj presigned link sirf 15 min valid hota hai (X-Amz-Expires=900).
       Link expire hone pe (403/error) apne aap AnonMP4 embed lag jaye. */
    function watchFallback(vd) {
      if (vd.dataset.fallbackWatched) return;
      vd.dataset.fallbackWatched = '1';
      vd.addEventListener('error', function () {
        if (!vd.getAttribute('src')) return; /* unmount ke time ka load() yahan trigger hota hai */
        var slide = vd.closest('.pgv-slide');
        if (!slide || slide.querySelector('iframe')) return;
        var fbUrl = vd.dataset.fallback || '';
        if (!fbUrl) return;
        var fb = document.createElement('iframe');
        fb.setAttribute('data-src', fbUrl);
        fb.width = 640;
        fb.height = 360;
        fb.setAttribute('frameborder', '0');
        fb.setAttribute('allowfullscreen', '');
        fb.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
        fb.title = 'Dakshina Madhya Railway — Video';
        slide.appendChild(fb);
        vd.style.display = 'none';
        if (slide.classList.contains('is-active')) mountVideo(slide);
      });
    }

    function show(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) {
        var on = n === idx;
        s.classList.toggle('is-active', on);
        if (on) mountVideo(s); else unmountVideo(s);
      });
      preload(idx + 1);
      preload(idx + 2);
      if (dotsWrap) {
        dotsWrap.querySelectorAll('.pgv-dot').forEach(function (d, n) {
          d.classList.toggle('on', n === idx);
        });
      }
      if (countEl) countEl.textContent = idx + 1;
      if (typeEl) typeEl.textContent = slides[idx].dataset.type === 'video' ? 'Video' : 'Photo';
    }

    function userShow(i) {
      interacted = true;
      show(i);
    }

    /* Dots banao (ek har slide ke liye) */
    if (dotsWrap) {
      slides.forEach(function (_, n) {
        var d = document.createElement('button');
        d.type = 'button';
        d.className = 'pgv-dot' + (n === 0 ? ' on' : '');
        d.setAttribute('aria-label', 'Go to media ' + (n + 1));
        d.addEventListener('click', function () { userShow(n); });
        dotsWrap.appendChild(d);
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { userShow(idx - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { userShow(idx + 1); });

    /* Keyboard arrows — sirf tab jab user gallery ke paas ho */
    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); userShow(idx - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); userShow(idx + 1); }
    });
    box.tabIndex = 0;

    /* Touch swipe */
    var x0 = null;
    box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) userShow(dx < 0 ? idx + 1 : idx - 1);
      x0 = null;
    }, { passive: true });

    /* Mount the video / first image only when the gallery is near. */
    watch(box, '200px', function () {
      if (started) return;
      started = true;
      if (!interacted) show(0);
      else {
        mountVideo(slides[idx]);
        preload(idx + 1);
        preload(idx + 2);
      }
    });
  });
})();

/* ============================================================
   DOWNLOAD MODAL — shows the file link inside a pop-up
   ============================================================ */
(function () {
  'use strict';

  var modal = document.getElementById('downloadModal');
  if (!modal) return;

  var titleEl = document.getElementById('dlModalTitle');
  var metaEl = document.getElementById('dlModalMeta');
  var linkEl = document.getElementById('dlModalLink');
  var lastFocus = null;

  function openModal(trigger) {
    lastFocus = trigger;
    if (titleEl) titleEl.textContent = trigger.getAttribute('data-dl-title') || 'Download';
    if (metaEl) metaEl.textContent = trigger.getAttribute('data-dl-meta') || '';
    if (linkEl) linkEl.setAttribute('href', trigger.getAttribute('data-dl-url') || '#');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (linkEl) linkEl.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest ? e.target.closest('[data-dl-open]') : null;
    if (trigger) {
      e.preventDefault();
      openModal(trigger);
      return;
    }
    if ((e.target.closest && e.target.closest('[data-dl-close]')) || e.target === modal) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
})();

/* ============================================================
   SITE PROTECTION — right-click + Developer Tools shortcuts
   (Ye code har page pe main.js ke through lagta hai)
   ============================================================ */
(function () {
  'use strict';

  /* Right-click (context menu) block — mouse aur touch dono */
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    return false;
  });

  /* DevTools aur source-view shortcuts block */
  document.addEventListener('keydown', function (e) {
    var k = e.key || '';
    var ctrl = e.ctrlKey || e.metaKey;
    var shift = e.shiftKey;

    /* F12 */
    if (k === 'F12') { e.preventDefault(); return false; }

    /* Ctrl+Shift+I / J / C / K — DevTools */
    if (ctrl && shift && ['i', 'j', 'c', 'k'].indexOf(k.toLowerCase()) > -1) {
      e.preventDefault(); return false;
    }

    /* Ctrl+U — view source, Ctrl+S — page save */
    if (ctrl && !shift && ['u', 's'].indexOf(k.toLowerCase()) > -1) {
      e.preventDefault(); return false;
    }

    /* Alt+Ctrl+I / J (kuch browsers me DevTools) */
    if (e.altKey && ctrl && ['i', 'j'].indexOf(k.toLowerCase()) > -1) {
      e.preventDefault(); return false;
    }
  });
})();
