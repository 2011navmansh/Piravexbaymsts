/* ==========================================================================
   TSDR image slideshows — TSDR product cards + TSDR download-page galleries.
   Fills every [data-tsdr-slides] box with the TSDR screenshot pool.

   Delivery: postimg.cc is not reachable by wsrv.nl directly, so each file is
   routed through DuckDuckGo's image proxy and then resized to WebP by
   wsrv.nl (~40-75 KB per frame instead of the 200-270 KB original). If a
   frame is dropped, the same file is retried once through the WordPress
   Photon CDN (i0.wp.com).

   Uniqueness: every box gets its own offset into one shared shuffled pool and
   all boxes advance in lockstep on a single timer, so no two slideshows on a
   page ever show the same image at the same moment.

   Timing and lazy loading are handled here (main.js skips [data-tsdr-slides]),
   so this script can load before or after main.js.
   ========================================================================== */
(function () {
  'use strict';

  var IDS = [
    'kGdXH91c/thumbnail-cqpw-Rpt-O-Os-1280x720.jpg',
    'v8WmVgDB/thumbnail-jv8W2w-WLRbo-1280x720.jpg',
    'qqL0ZKCR/Small-Live-Mumbai-Vandebharat-Sleeper-Rake-Transit-to-Mumbai-MSTS-Open-Rails-Gameplay-0-12-17.jpg',
    'sxVCS201/Reaching-KSR-Bengaluru-Today-in-17308-Basava-Express-MSTS-Open-Rails-Gameplay-0-12-39.jpg',
    'kXYP6qQz/Reaching-KSR-Bengaluru-Today-in-17308-Basava-Express-MSTS-Open-Rails-Gameplay-0-55-41.jpg',
    'PrR0fKhC/Driving-17663-Raichur-Jalna-Express-via-Vikarabad-Secunderabad-MSTS-Open-Rails-Gameplay-0.jpg',
    'HnPvxWqX/Driving-17663-Raichur-Jalna-Express-via-Vikarabad-Secunderabad-MSTS-Open-Rails-Gameplay-1.jpg',
    '3wCLGZMK/Driving-12734-Narayanadri-SF-Exp-MSTS-Open-Rails-Gameplay-0-3-56.jpg',
    '4xpwC13T/12702-Hussain-Sagar-SF-Express-TSDR-LIVE-IR-MSTS-0-6-23.jpg',
    '8cFBZRYt/12702-Hussain-Sagar-SF-Express-TSDR-LIVE-IR-MSTS-1-00-44.jpg',
    'ydG03JNF/12708-Andhra-Pradesh-Sampark-Kranti-Express-TSDR-V6-LIVE-IR-MSTS-1-32-36.jpg',
    'c4RT2mHP/PREMIUM-JOURNEY-12025-Pune-Hyderabad-Shatabdi-Express-TSDR-V7-Route-MSTS-LIVE-Gameplay.jpg',
    'RV4w6zSp/Motor-Man-Duty-in-Hyderabad-MMTS-Local-Train-TSDRV7-0-38-21.jpg'
  ];

  var INTERVAL = 4000;
  var ALT = 'TSDR — MSTS & Open Rails screenshot';

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* wsrv.nl WebP render, reached through DuckDuckGo's image proxy. */
  function cdn(id, size) {
    var src = 'https://i.postimg.cc/' + id;
    var ddg = 'https://external-content.duckduckgo.com/iu/?u=' + encodeURIComponent(src) + '&f=1&nofb=1';
    return 'https://wsrv.nl/?url=' + encodeURIComponent(ddg) + '&' + size + '&output=webp&q=82&we';
  }

  /* Fallback render (WordPress Photon) if wsrv.nl drops a frame. */
  function photon(id, size) {
    return 'https://i0.wp.com/i.postimg.cc/' + id + '?' + size + '&quality=82';
  }

  function loadImg(img) {
    if (!img || !img.dataset.src) return;
    img.removeAttribute('loading');
    img.decoding = 'async';
    img.src = img.dataset.src;
    delete img.dataset.src;
  }

  var ORDER = shuffle(IDS.slice());
  var boxes = [];

  function build(box, offset, size) {
    var frag = document.createDocumentFragment();
    var slides = [];
    for (var i = 0; i < ORDER.length; i++) {
      var id = ORDER[(offset + i) % ORDER.length];
      var img = document.createElement('img');
      img.className = i === 0 ? 'pc-slide is-active' : 'pc-slide';
      img.alt = ALT;
      img.decoding = 'async';
      img.loading = 'lazy';
      var primary = cdn(id, size);
      if (i === 0) img.src = primary;
      else img.setAttribute('data-src', primary);
      (function (im, pid) {
        im.addEventListener('error', function () {
          var fb = photon(pid, size);
          if (im.getAttribute('src') !== fb) im.src = fb;
        });
      })(img, id);
      frag.appendChild(img);
      slides.push(img);
    }
    box.appendChild(frag);
    return slides;
  }

  /* One shared tick: every box steps forward together, so the distinct
     starting offsets keep all visible slideshows on different images. */
  function advance() {
    if (document.hidden) return;
    for (var b = 0; b < boxes.length; b++) {
      var box = boxes[b];
      var slides = box.slides;
      var next = (box.idx + 1) % slides.length;
      if (box.visible) loadImg(slides[next]);
      slides[box.idx].classList.remove('is-active');
      slides[next].classList.add('is-active');
      box.idx = next;
      if (box.visible) loadImg(slides[(box.idx + 1) % slides.length]);
    }
  }

  function watch(box) {
    if (!('IntersectionObserver' in window)) {
      box.visible = true;
      loadImg(box.slides[0]);
      loadImg(box.slides[1]);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      var en = entries[0];
      if (!en) return;
      box.visible = en.isIntersecting;
      if (en.isIntersecting) {
        loadImg(box.slides[box.idx]);
        loadImg(box.slides[(box.idx + 1) % box.slides.length]);
      }
    }, { rootMargin: '300px' });
    io.observe(box.el);
  }

  function init() {
    var els = document.querySelectorAll('[data-tsdr-slides]');
    if (!els.length) return;
    /* Random, distinct starting slot per box: the slideshow does not have to
       begin on the first image, and no two boxes may share a slot — that is
       what keeps them from showing the same image at the same moment. */
    var starts = [];
    for (var s = 0; s < ORDER.length; s++) starts.push(s);
    shuffle(starts);
    els.forEach(function (el, i) {
      /* Gallery is ~900px wide, cards ~500px — each gets its own render width.
         The card width is spelled 'width' on purpose: main.js imageUrl()
         rewrites mobile 'w=' hits to 1200, which would upscale an 800px card. */
      var size = el.classList.contains('product-gallery') ? 'w=1600' : 'width=800';
      var slides = build(el, starts[i % starts.length], size);
      var box = { el: el, slides: slides, idx: 0, visible: false };
      boxes.push(box);
      watch(box);
    });
    setInterval(advance, INTERVAL);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
