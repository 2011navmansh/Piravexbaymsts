/* ============================================================
   PIRAVEXBAY MSTS — DEEPAVALI FESTIVE SCRIPT (2026, optimised)
   · decorates EVERY page: ribbon, toran, rangoli, hero greet,
     footer diya rows (idempotent — skips what already exists)
   · golden firework bursts + rising embers on a sky canvas,
     drawn with pre-rendered glow sprites (drawImage only —
     no per-particle arcs, no filters, no shadows)
   · adaptive quality: measures frame time and steps down
     automatically on slow devices, up to a full stop
   · pauses when the tab is hidden; honours reduced motion
   Safe to fail: the site works without this file.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia && window.matchMedia('(max-width:760px)').matches;

  /* ================= 1. AUTO-DRESS (all pages) ================= */
  var RIBBON_HTML =
    '<div class="diwali-ribbon" role="region" aria-label="Deepavali greeting">' +
      '<div class="diwali-ribbon-text">' +
        '<span class="dvl-diya" aria-hidden="true"></span>' +
        '<span class="dvl-script">Shubh Deepavali</span>' +
        '<span class="dvl-sep" aria-hidden="true"></span>' +
        '<span>Festival of Lights &middot; 8 Nov 2026</span>' +
        '<span class="dvl-sep" aria-hidden="true"></span>' +
        '<span>All 920+ Addons Stay 100% Free</span>' +
        '<span class="dvl-spark material-symbols-outlined" aria-hidden="true">auto_awesome</span>' +
      '</div>' +
    '</div>';
  var TORAN_HTML = '<div class="diwali-toran" aria-hidden="true"></div>';
  var RANGOLI_HTML = '<div class="diwali-rangoli" aria-hidden="true"></div>';
  var HERO_GREET_HTML =
    '<div class="diwali-hero-greet" aria-hidden="true">' +
      '<span class="dvl-diya"></span>' +
      'Shubh Deepavali &middot; Festival of Lights 2026' +
      '<span class="dvl-diya"></span>' +
    '</div>';
  var FOOT_GREET_HTML =
    '<div class="diwali-foot-greet" aria-label="Deepavali greeting">' +
      '<div class="dvl-row" aria-hidden="true">' +
        '<span class="dvl-diya"></span><span class="dvl-diya"></span><span class="dvl-diya"></span>' +
      '</div>' +
      '<h3>May your year glow like a thousand diyas</h3>' +
      '<p>Shubh Deepavali <b>2026</b> — with love, from the piravexbay MSTS family</p>' +
    '</div>';

  function dress() {
    try {
      if (!document.querySelector('.diwali-ribbon')) {
        document.body.insertAdjacentHTML('afterbegin', RIBBON_HTML);
      }
      var homeHero = document.querySelector('.hero-home');
      var hero = homeHero || document.querySelector('.page-hero');
      if (hero) {
        if (!hero.querySelector('.diwali-toran')) {
          hero.insertAdjacentHTML('afterbegin', TORAN_HTML);
        }
        if (!hero.querySelector('.diwali-rangoli')) {
          hero.insertAdjacentHTML('beforeend', RANGOLI_HTML);
        }
        /* small greeting chip on inner pages (home has its own line) */
        if (!homeHero) {
          var anchor = hero.querySelector('.breadcrumb') || hero.querySelector('h1');
          if (anchor && !hero.querySelector('.diwali-hero-greet')) {
            anchor.insertAdjacentHTML('beforebegin', HERO_GREET_HTML);
          }
        }
      }
      var footBottom = document.querySelector('footer .foot-bottom');
      if (footBottom && !document.querySelector('.diwali-foot-greet')) {
        footBottom.insertAdjacentHTML('beforebegin', FOOT_GREET_HTML);
      }
    } catch (e) {}
  }
  dress();

  /* ================= 1b. 2026 ENHANCEMENTS ================= */
  var DIWALI_YEAR = 2026;
  var DIWALI_MONTH = 10;   /* November (0-based) */
  var DIWALI_DAY = 8;
  var GREET_KEY = 'piravex_diwali_greeted_2026';

  function daysToDiwali() {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var target = new Date(DIWALI_YEAR, DIWALI_MONTH, DIWALI_DAY);
    return Math.round((target - today) / 86400000);
  }

  function injectCountdown() {
    try {
      var ribbon = document.querySelector('.diwali-ribbon');
      if (!ribbon) return;
      var text = ribbon.querySelector('.diwali-ribbon-text');
      if (!text || text.querySelector('.dvl-count')) return;
      var days = daysToDiwali();
      if (days < 0) return;
      var chip = document.createElement('span');
      chip.className = 'dvl-count';
      if (days === 0) {
        chip.className += ' is-today';
        chip.innerHTML = '<b>Today</b><i>is Deepavali</i>';
        chip.setAttribute('title', 'Shubh Deepavali!');
      } else {
        chip.innerHTML = '<b>' + days + '</b><i>' + (days === 1 ? 'day to Diwali' : 'days to Diwali') + '</i>';
        chip.setAttribute('title', days + ' days until Deepavali on 8 November 2026');
      }
      var spark = text.querySelector('.dvl-spark');
      if (spark) text.insertBefore(chip, spark);
      else text.appendChild(chip);
    } catch (e) {}
  }
  injectCountdown();

  /* small rangoli motif in alternate section corners */
  function decorateSections() {
    try {
      var secs = document.querySelectorAll('section.section');
      for (var i = 0; i < secs.length; i++) {
        var s = secs[i];
        if (s.classList.contains('tight') || s.querySelector('.dvl-corner')) continue;
        var c = document.createElement('span');
        c.className = 'dvl-corner ' + (i % 2 ? 'l' : 'r');
        c.setAttribute('aria-hidden', 'true');
        s.classList.add('dvl-decorated');
        s.insertBefore(c, s.firstChild);
      }
    } catch (e) {}
  }
  decorateSections();

  /* drifting marigold petals — hero section only */
  function plantPetals() {
    if (reduceMotion) return;
    try {
      if (document.getElementById('diwali-petals')) return;
      var hero = document.querySelector('.hero-home') || document.querySelector('.page-hero');
      if (!hero) return;
      var wrap = document.createElement('div');
      wrap.id = 'diwali-petals';
      wrap.setAttribute('aria-hidden', 'true');
      wrap.style.setProperty('--h', Math.round(hero.offsetHeight) + 'px');
      var n = mobile ? 6 : 11;
      for (var i = 0; i < n; i++) {
        var p = document.createElement('i');
        p.className = 'dvl-petal';
        p.style.setProperty('--x', (Math.random() * 100).toFixed(1) + '%');
        p.style.setProperty('--s', (7 + Math.random() * 7).toFixed(1) + 'px');
        p.style.setProperty('--dur', (14 + Math.random() * 12).toFixed(1) + 's');
        p.style.setProperty('--delay', (-Math.random() * 20).toFixed(1) + 's');
        p.style.setProperty('--sway', ((Math.random() - 0.5) * 130).toFixed(0) + 'px');
        p.style.setProperty('--rot', (Math.random() * 180).toFixed(0) + 'deg');
        wrap.appendChild(p);
      }
      hero.appendChild(wrap);
      var rt;
      window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () {
          if (!wrap.parentNode) return;
          wrap.style.setProperty('--h', Math.round(hero.offsetHeight) + 'px');
        }, 180);
      }, { passive: true });
    } catch (e) {}
  }
  plantPetals();

  /* ================= 1c. UTSAV PASS ================= */

  /* clay diya lamps — reused by the hero floor and the footer */
  function lampHTML(delay) {
    return '<span class="dvl-lamp">' +
      '<i class="dvl-pool"></i>' +
      '<i class="dvl-bowl"></i>' +
      '<i class="dvl-flame" style="--fdly:' + delay.toFixed(2) + 's;--fdur:' +
        (1.8 + Math.random() * 0.9).toFixed(2) + 's"></i>' +
    '</span>';
  }

  /* a row of diyas sitting on the hero floor */
  function plantLamps() {
    try {
      var hero = document.querySelector('.hero-home');
      if (!hero || hero.querySelector('.diwali-diyas')) return;
      var row = document.createElement('div');
      row.className = 'diwali-diyas';
      row.setAttribute('aria-hidden', 'true');
      var n = mobile ? 7 : 13;
      var html = '';
      for (var i = 0; i < n; i++) html += lampHTML(i * 0.23);
      row.innerHTML = html;
      hero.appendChild(row);
    } catch (e) {}
  }
  plantLamps();

  /* jhimil — fairy lights strung in swags across the home hero */
  var BULB_COLORS = [
    { c: '#ffc24f', c2: '#e8801d', g: 'rgba(255,178,70,.55)', l: '16px' },
    { c: '#ff9a3d', c2: '#d9541a', g: 'rgba(255,140,50,.50)', l: '15px' },
    { c: '#f2711c', c2: '#c33f14', g: 'rgba(242,113,28,.46)', l: '15px' },
    { c: '#ffd98a', c2: '#e0a63d', g: 'rgba(255,214,130,.50)', l: '16px' },
    { c: '#ff6f5c', c2: '#cf3327', g: 'rgba(255,111,92,.44)', l: '14px' },
    { c: '#8fe08a', c2: '#3d8f45', g: 'rgba(143,224,138,.38)', l: '13px' }
  ];

  function layoutJhimil(hero, wrap) {
    var W = hero.clientWidth || window.innerWidth;
    if (!W) return;
    var small = W < 620;
    var swags = small ? 2 : (W < 1080 ? 3 : 4);
    var amp = small ? 16 : (W < 1080 ? 22 : 28);
    var per = small ? 5 : 7;
    var TOP = 8;
    var H = TOP + amp + (small ? 13 : 16) + 6;

    /* one smooth polyline drives both the visible wire and its glow */
    var d = '';
    var SAMPLES = 140;
    for (var i = 0; i <= SAMPLES; i++) {
      var t = i / SAMPLES;
      var y = TOP + amp * Math.sin(Math.PI * ((t * swags) % 1));
      d += (i ? ' L' : 'M') + (t * W).toFixed(1) + ' ' + y.toFixed(1);
    }

    var bulbs = '';
    var k = 0;
    for (var s = 0; s < swags; s++) {
      for (var j = 0; j < per; j++) {
        var tb = (s + (j + 0.5) / per) / swags;
        var yb = TOP + amp * Math.sin(Math.PI * ((tb * swags) % 1));
        var col = BULB_COLORS[k % BULB_COLORS.length];
        var bw = (small ? 7 : 9) + (k % 3 === 0 ? 1.5 : 0);
        bulbs += '<i class="dvl-bulb" style="' +
          '--bx:' + (tb * W).toFixed(1) + 'px;' +
          '--by:' + yb.toFixed(1) + 'px;' +
          '--bw:' + bw + 'px;' +
          '--bc:' + col.c + ';--bc2:' + col.c2 + ';--bgs:' + col.g + ';--bgl:' + col.l + ';' +
          '--bdur:' + (2.8 + (k % 5) * 0.42).toFixed(2) + 's;' +
          '--bdly:-' + ((k * 0.37) % 3.4).toFixed(2) + 's"></i>';
        k++;
      }
    }

    wrap.style.height = H + 'px';
    wrap.innerHTML =
      '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true" focusable="false">' +
        '<path class="dvl-wire-glow" d="' + d + '"/>' +
        '<path class="dvl-wire" d="' + d + '"/>' +
      '</svg>' + bulbs;
  }

  function plantJhimil() {
    try {
      var hero = document.querySelector('.hero-home');
      if (!hero || hero.querySelector('.diwali-jhimil')) return;
      var wrap = document.createElement('div');
      wrap.className = 'diwali-jhimil';
      wrap.setAttribute('aria-hidden', 'true');
      hero.appendChild(wrap);
      layoutJhimil(hero, wrap);
      var jt;
      window.addEventListener('resize', function () {
        clearTimeout(jt);
        jt = setTimeout(function () {
          if (wrap.parentNode) layoutJhimil(hero, wrap);
        }, 220);
      }, { passive: true });
    } catch (e) {}
  }
  plantJhimil();

  /* beaded marigold trim on the marquee band */
  function beadMarquee() {
    try {
      var mw = document.querySelector('.marquee-wrap');
      if (!mw || mw.querySelector('.dvl-beads')) return;
      mw.insertAdjacentHTML('afterbegin', '<span class="dvl-beads t" aria-hidden="true"></span>');
      mw.insertAdjacentHTML('beforeend', '<span class="dvl-beads b" aria-hidden="true"></span>');
    } catch (e) {}
  }
  beadMarquee();

  /* rangoli divider ahead of the closing invitation */
  var DIVIDER_HTML =
    '<div class="dvl-divider" aria-hidden="true">' +
      '<span class="dvl-dline"></span>' +
      '<span class="dvl-dbead"></span>' +
      '<span class="dvl-dmotif"></span>' +
      '<span class="dvl-dbead b"></span>' +
      '<span class="dvl-dline r"></span>' +
    '</div>';

  function insertDivider() {
    try {
      var band = document.querySelector('.cta-band');
      if (!band || !band.parentNode) return;
      var host = band.parentNode;
      if (host.querySelector('.dvl-divider')) return;
      host.insertAdjacentHTML('afterbegin', DIVIDER_HTML);
    } catch (e) {}
  }
  insertDivider();

  /* swap the footer's three tiny diyas for a proper lamp row */
  function upgradeFootLamps() {
    try {
      var row = document.querySelector('.diwali-foot-greet .dvl-row');
      if (!row || row.querySelector('.dvl-lamp')) return;
      var html = '';
      for (var i = 0; i < 5; i++) html += lampHTML(i * 0.34);
      row.innerHTML = html;
    } catch (e) {}
  }
  upgradeFootLamps();

  /* first-visit diya greeting (dismissable, once per browser) */
  var GREET_HTML =
    '<div class="dvl-greet-overlay" id="dvlGreet" role="dialog" aria-modal="true" aria-labelledby="dvlGreetTitle">' +
      '<div class="dvl-greet-card">' +
        '<button type="button" class="dvl-greet-close" aria-label="Close Deepavali greeting">' +
          '<span class="material-symbols-outlined">close</span>' +
        '</button>' +
        '<div class="dvl-greet-diyas" aria-hidden="true">' +
          '<span class="dvl-diya"></span><span class="dvl-diya"></span><span class="dvl-diya"></span>' +
        '</div>' +
        '<span class="dvl-greet-kicker">piravexbay MSTS &middot; Festival of Lights</span>' +
        '<h2 id="dvlGreetTitle">Shubh Deepavali</h2>' +
        '<div class="dvl-greet-rule" aria-hidden="true"></div>' +
        '<p>May a thousand diyas light your way &mdash; and may this season bring you ' +
          '<b>joy, prosperity and endless great addons</b>.</p>' +
        '<button type="button" class="btn btn-primary dvl-greet-enter">' +
          '<span class="material-symbols-outlined">auto_awesome</span> Enter the Utsav' +
        '</button>' +
        '<span class="dvl-greet-note">Wishing you a bright Deepavali 2026</span>' +
        '<span class="dvl-greet-progress" aria-hidden="true"></span>' +
      '</div>' +
    '</div>';

  function forceGreet() {
    try {
      var q = new URLSearchParams(location.search);
      return q.get('diwali') === '1' || q.get('dvl') === '1';
    } catch (e) {
      return false;
    }
  }

  function showGreeting() {
    try {
      if (document.getElementById('dvlGreet')) return;
      if (location.pathname.toLowerCase().indexOf('private') !== -1) return;
      if (!forceGreet()) {
        var seen = false;
        try { seen = !!localStorage.getItem(GREET_KEY); } catch (e) { seen = false; }
        if (seen) return;
      }
      document.body.insertAdjacentHTML('beforeend', GREET_HTML);
      var ov = document.getElementById('dvlGreet');
      if (!ov) return;
      var lastFocus = document.activeElement;
      var timer = 0;
      var closed = false;
      document.body.classList.add('dvl-greet-open');

      function close() {
        if (closed) return;
        closed = true;
        clearTimeout(timer);
        ov.classList.add('is-closing');
        try { localStorage.setItem(GREET_KEY, '1'); } catch (e) {}
        setTimeout(function () {
          if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
          document.body.classList.remove('dvl-greet-open');
          if (lastFocus && lastFocus.focus) {
            try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
          }
        }, 430);
        document.removeEventListener('keydown', onKey);
      }

      function onKey(e) {
        if (e.key === 'Escape' || e.key === 'Esc') close();
      }

      document.addEventListener('keydown', onKey);
      ov.addEventListener('click', function (e) {
        if (e.target === ov) close();
      });
      var btnClose = ov.querySelector('.dvl-greet-close');
      var btnEnter = ov.querySelector('.dvl-greet-enter');
      if (btnClose) btnClose.addEventListener('click', close);
      if (btnEnter) {
        btnEnter.addEventListener('click', close);
        setTimeout(function () {
          try { btnEnter.focus({ preventScroll: true }); } catch (e) {}
        }, 80);
      }
      timer = setTimeout(close, 12000);
    } catch (e) {}
  }
  showGreeting();

  /* ================= 2. SPRITE-BASED SKY ================= */
  var ctx = null;
  var canvas = null;
  var SPRITES = null;
  var HUES = [
    [255, 196, 79],   /* flame gold   */
    [255, 154, 61],   /* saffron      */
    [242, 113, 28],   /* marigold     */
    [255, 224, 138],  /* champagne    */
    [244, 82, 62],    /* rose embers  */
    [255, 240, 200]   /* white gold   */
  ];
  var SPRITE_SIZE = 64;

  function buildSprites() {
    SPRITES = [];
    for (var i = 0; i < HUES.length; i++) {
      var s = document.createElement('canvas');
      s.width = s.height = SPRITE_SIZE;
      var g = s.getContext('2d');
      var grad = g.createRadialGradient(SPRITE_SIZE / 2, SPRITE_SIZE / 2, 0, SPRITE_SIZE / 2, SPRITE_SIZE / 2, SPRITE_SIZE / 2);
      var h = HUES[i];
      grad.addColorStop(0, 'rgba(255,252,240,.95)');
      grad.addColorStop(0.25, 'rgba(' + h[0] + ',' + h[1] + ',' + h[2] + ',.9)');
      grad.addColorStop(0.6, 'rgba(' + h[0] + ',' + h[1] + ',' + h[2] + ',.35)');
      grad.addColorStop(1, 'rgba(' + h[0] + ',' + h[1] + ',' + h[2] + ',0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
      SPRITES.push(s);
    }
  }

  function makeSky() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'diwali-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    buildSprites();
    resizeSky();
  }

  var DPR = 1, W = 0, H = 0;
  function resizeSky() {
    if (!ctx) return;
    DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  /* ================= 3. PARTICLES ================= */
  var embers = [];
  var rockets = [];
  var sparks = [];
  var N_EMBER = mobile ? 7 : 14;
  var N_SPARK = mobile ? 24 : 38;
  var TRAIL = 8;

  function pickHue() { return (Math.random() * HUES.length) | 0; }

  function makeEmber(scatter) {
    return {
      x: Math.random() * W,
      y: scatter ? Math.random() * H : H + 10 + Math.random() * 40,
      r: 10 + Math.random() * 16,                /* sprite draw size */
      vy: 0.16 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 0.3,
      life: scatter ? Math.random() * 300 : 0,
      maxLife: 380 + Math.random() * 240,
      hue: pickHue(),
      tw: Math.random() * 6.283
    };
  }

  function spawnRocket() {
    if (mode === LITE) return;
    if (rockets.length >= 1) return;
    rockets.push({
      x: W * (0.16 + Math.random() * 0.68),
      y: H,
      ty: H * (0.10 + Math.random() * 0.30),
      vx: (Math.random() - 0.5) * 0.8,
      vy: -(7 + Math.random() * 3.2),
      trail: [],
      hue: pickHue()
    });
  }

  function explode(x, y, hue) {
    var ring = Math.random() < 0.35;
    var n = N_SPARK;
    for (var i = 0; i < n; i++) {
      var ang = (Math.PI * 2 * i) / n + Math.random() * 0.14;
      var speed = ring ? 2.3 + Math.random() * 0.5 : 1.3 + Math.random() * 3.1;
      sparks.push({
        x: x, y: y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        r: 12 + Math.random() * 10,               /* sprite size */
        life: 0,
        maxLife: 50 + Math.random() * 30,
        hue: ring ? hue : pickHue()
      });
    }
  }

  function resetAmbience() {
    embers.length = 0;
    for (var i = 0; i < N_EMBER; i++) embers.push(makeEmber(true));
  }

  /* ================= 4. LOOP (adaptive) ================= */
  var FRAME = 0;
  var nextBurst = 70;   /* ~1.2s after load */
  var BURST_MIN = 170;  /* ~2.8s */
  var BURST_RAND = 120;
  var NORMAL = 0, LITE = 1, FROZEN = 2;
  var mode = NORMAL;
  var running = true;
  var last = 0, ewma = 16.7, checked = 0;

  function drawSky() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    /* embers: one drawImage each */
    for (var i = 0; i < embers.length; i++) {
      var e = embers[i];
      e.life++;
      e.y -= e.vy;
      e.x += e.drift + Math.sin((FRAME + e.tw * 40) / 46) * 0.22;
      var p = e.life / e.maxLife;
      if (e.y < -16 || p >= 1) { embers[i] = makeEmber(false); continue; }
      var a = Math.min(1, (1 - p) * 2.2) * 0.62 * (0.7 + 0.3 * Math.sin(FRAME / 9 + e.tw));
      ctx.globalAlpha = a;
      var size = e.r * (0.85 + 0.15 * Math.sin(FRAME / 11 + e.tw));
      ctx.drawImage(SPRITES[e.hue], e.x - size / 2, e.y - size / 2, size, size);
    }

    /* rockets: sprite glow head + short trail */
    for (var ri = rockets.length - 1; ri >= 0; ri--) {
      var rk = rockets[ri];
      rk.vy += 0.055;
      rk.x += rk.vx;
      rk.y += rk.vy;
      rk.trail.push({ x: rk.x, y: rk.y });
      if (rk.trail.length > TRAIL) rk.trail.shift();
      for (var t = 0; t < rk.trail.length; t++) {
        ctx.globalAlpha = 0.06 + (t / rk.trail.length) * 0.4;
        ctx.drawImage(SPRITES[rk.hue], rk.trail[t].x - 5, rk.trail[t].y - 5, 10, 10);
      }
      if (rk.y <= rk.ty || rk.vy >= -0.5) {
        explode(rk.x, rk.y, rk.hue);
        rockets.splice(ri, 1);
      }
    }

    /* sparks: fast fade, one drawImage each */
    for (var si = sparks.length - 1; si >= 0; si--) {
      var s = sparks[si];
      s.life++;
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.02;
      s.vx *= 0.988;
      s.vy *= 0.988;
      if (s.life >= s.maxLife) { sparks.splice(si, 1); continue; }
      var q = 1 - s.life / s.maxLife;
      ctx.globalAlpha = q * q;
      var sz = s.r * (0.6 + q * 0.6);
      ctx.drawImage(SPRITES[s.hue], s.x - sz / 2, s.y - sz / 2, sz, sz);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function tick(now) {
    if (!running) return;
    if (mode === FROZEN) return;

    /* adaptive quality: EWMA of frame deltas */
    if (last) {
      ewma = ewma * 0.92 + Math.min(now - last, 250) * 0.08;
      if (++checked % 45 === 0) {
        if (ewma > 50) {
          mode = FROZEN;
          if (ctx) ctx.clearRect(0, 0, W, H);
          return;                     /* full stop — CSS beauty remains */
        }
        if (ewma > 34 && mode === NORMAL) {
          mode = LITE;                /* no rockets, thin embers */
          embers.length = Math.min(embers.length, 6);
          rockets.length = 0;
        }
      }
    }
    last = now;
    FRAME++;

    drawSky();

    if (FRAME >= nextBurst) {
      spawnRocket();
      nextBurst = FRAME + BURST_MIN + Math.random() * BURST_RAND;
    }
    requestAnimationFrame(tick);
  }

  /* ================= 5. WIRING ================= */

  /* tap anywhere on open space to set off a firework */
  function wireClickBurst() {
    var SKIP = 'a,button,input,textarea,select,label,summary,' +
               '.product-card,.category-card,.dl-modal,[role="dialog"]';
    var lastAt = 0;
    document.addEventListener('click', function (e) {
      if (!running || mode === FROZEN) return;
      var el = e.target;
      if (el && el.closest && el.closest(SKIP)) return;
      var now = Date.now();
      if (now - lastAt < 340) return;
      lastAt = now;
      explode(e.clientX, e.clientY, pickHue());
      if (mode !== LITE && sparks.length < 120) {
        explode(
          e.clientX + (Math.random() - 0.5) * 90,
          e.clientY + (Math.random() - 0.5) * 60,
          pickHue()
        );
      }
    }, { passive: true });
  }

  if (!reduceMotion) {
    makeSky();
    resetAmbience();
    requestAnimationFrame(tick);
    wireClickBurst();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        running = false;
      } else if (!running) {
        running = true;
        last = 0;
        requestAnimationFrame(tick);
      }
    });

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        resizeSky();
        resetAmbience();
      }, 200);
    }, { passive: true });
  }
})();
