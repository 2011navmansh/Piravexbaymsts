(function () {
  'use strict';
  if (window.__AB_SMOOTH) return;
  window.__AB_SMOOTH = true;
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  } catch (e) {}

  var style = document.createElement('style');
  style.textContent = 'html.lenis,html.lenis body{height:auto}html.lenis,.lenis.lenis-smooth{scroll-behavior:auto!important}';
  document.head.appendChild(style);

  var LERP = 0.0625;

  function canScroll(node) {
    if (!node || node === document.body || node === document.documentElement || !node.hasAttribute) return false;
    if (node.hasAttribute('data-lenis-prevent') || node.hasAttribute('data-lenis-prevent-wheel') || node.hasAttribute('data-lenis-prevent-touch')) return true;
    var st;
    try { st = getComputedStyle(node); } catch (e) { return false; }
    var oy = st.overflowY, ox = st.overflowX;
    if ((oy === 'auto' || oy === 'scroll' || oy === 'overlay') && node.scrollHeight > node.clientHeight + 2) return true;
    if ((ox === 'auto' || ox === 'scroll' || ox === 'overlay') && node.scrollWidth > node.clientWidth + 2) return true;
    return false;
  }

  function locked() {
    var h = document.documentElement, b = document.body;
    if (!b) return false;
    if (h.classList.contains('has-intro') || b.classList.contains('menu-open')) return true;
    if (b.style.overflow === 'hidden' || h.style.overflow === 'hidden') return true;
    return false;
  }

  function boot() {
    if (typeof Lenis === 'undefined' || window.AB_LENIS) return;
    var lenis = new Lenis({
      autoRaf: true,
      lerp: LERP,
      smoothWheel: true,
      syncTouch: true,
      syncTouchLerp: LERP,
      touchInertiaMultiplier: 16,
      wheelMultiplier: 1,
      touchMultiplier: 1.15,
      anchors: true,
      prevent: canScroll
    });
    window.AB_LENIS = lenis;

    function syncLock() {
      try { if (locked()) lenis.stop(); else lenis.start(); } catch (e) {}
    }
    syncLock();
    var mo = new MutationObserver(syncLock);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
    if (document.body) mo.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] });

    var native = window.scrollTo.bind(window);
    window.scrollTo = function (a, b) {
      if (!window.AB_LENIS) return native(a, b);
      if (a && typeof a === 'object') {
        if (a.behavior === 'instant' || a.behavior === 'auto') return native(a);
        if (typeof a.top === 'number') {
          window.AB_LENIS.scrollTo(a.top);
          return;
        }
      }
      if (typeof a === 'number' && typeof b === 'number') {
        window.AB_LENIS.scrollTo(b);
        return;
      }
      return native(a, b);
    };
  }

  if (typeof Lenis !== 'undefined') {
    boot();
    return;
  }
  var s = document.createElement('script');
  s.src = 'lenis.min.js?v=1.1.19';
  s.onload = boot;
  document.head.appendChild(s);
})();
