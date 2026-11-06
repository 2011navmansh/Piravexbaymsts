/* ============================================================
   PIRAVEXBAY MSTS — Aesthetic Audio Preview Player
   ------------------------------------------------------------
   Turns every  <div class="abp" data-src="URL">  into a custom,
   gold-themed audio player (no native controls bar).

   Options (data attributes on .abp):
     data-src    : audio file URL (required)
     data-name   : label shown above the seek bar (optional)
     data-artist : small gold prefix before the name (optional)

   Playback: DIRECT STREAMING (no wait for full download).
   The browser range-requests the file and starts playing the
   moment enough is buffered; it keeps buffering ahead while
   playing. A warm-up request starts as soon as the player
   scrolls into view, so the first click plays almost instantly.
   ============================================================ */
(function () {
  "use strict";

  function fmt(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function build(p) {
    if (p.dataset.abpReady) return;
    p.dataset.abpReady = "1";

    var src = p.getAttribute("data-src") || "";
    var name = p.getAttribute("data-name") || "Audio preview";
    var artist = p.getAttribute("data-artist") || "";
    if (!src) return;

    p.innerHTML =
      '<button class="abp-play" type="button" aria-label="Play preview">' +
        '<span class="material-symbols-outlined">play_arrow</span>' +
      "</button>" +
      '<div class="abp-main">' +
        '<div class="abp-top">' +
          '<span class="abp-name">' +
            (artist ? "<b>" + artist + "</b> " : "") + name +
          "</span>" +
          '<span class="abp-time"><span class="abp-cur">0:00</span> / ' +
            '<span class="abp-dur">0:00</span></span>' +
        "</div>" +
        '<div class="abp-bar" role="slider" tabindex="0" aria-label="Seek" ' +
          'aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
          '<div class="abp-buffer"></div>' +
          '<div class="abp-fill"><span class="abp-knob"></span></div>' +
        "</div>" +
      "</div>" +
      '<div class="abp-eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>';

    var btn = p.querySelector(".abp-play");
    var icon = btn.querySelector(".material-symbols-outlined");
    var bar = p.querySelector(".abp-bar");
    var fill = p.querySelector(".abp-fill");
    var buffer = p.querySelector(".abp-buffer");
    var cur = p.querySelector(".abp-cur");
    var dur = p.querySelector(".abp-dur");

    var audio = new Audio();
    audio.preload = "auto";
    audio.referrerPolicy = "no-referrer";
    audio.setAttribute("playsinline", "");
    audio.src = src;            /* direct link → streams immediately, no full-download wait */

    /* -------- events -------- */
    audio.addEventListener("loadedmetadata", function () {
      dur.textContent = fmt(audio.duration);
    });
    audio.addEventListener("durationchange", function () {
      if (isFinite(audio.duration)) dur.textContent = fmt(audio.duration);
    });
    audio.addEventListener("timeupdate", function () {
      var d = audio.duration;
      var pct = d && isFinite(d) ? (audio.currentTime / d) * 100 : 0;
      fill.style.width = pct + "%";
      cur.textContent = fmt(audio.currentTime);
      bar.setAttribute("aria-valuenow", Math.round(pct));
    });
    audio.addEventListener("progress", function () {
      try {
        if (audio.buffered.length && audio.duration && isFinite(audio.duration)) {
          var end = audio.buffered.end(audio.buffered.length - 1);
          var b = Math.min(100, (end / audio.duration) * 100);
          /* keep buffer fill at least under the played fill */
          buffer.style.width = b + "%";
        }
      } catch (e) {}
    });
    audio.addEventListener("playing", function () {
      p.classList.remove("is-loading");
      p.classList.add("is-playing");
      icon.textContent = "pause";
      btn.setAttribute("aria-label", "Pause preview");
    });
    audio.addEventListener("pause", function () {
      p.classList.remove("is-playing", "is-loading");
      icon.textContent = "play_arrow";
      btn.setAttribute("aria-label", "Play preview");
    });
    audio.addEventListener("waiting", function () {
      if (!audio.paused) {
        p.classList.add("is-loading");
        icon.textContent = "progress_activity";
      }
    });
    audio.addEventListener("ended", function () {
      p.classList.remove("is-playing", "is-loading");
      icon.textContent = "play_arrow";
      fill.style.width = "0%";
      cur.textContent = "0:00";
    });
    audio.addEventListener("error", function () {
      p.classList.remove("is-playing", "is-loading");
      icon.textContent = "play_arrow";
      dur.textContent = "--:--";
    });

    /* -------- controls -------- */
    btn.addEventListener("click", function () {
      if (!audio.paused) { audio.pause(); return; }

      document.querySelectorAll(".abp[data-abp-ready]").forEach(function (o) {
        if (o !== p && o._abpAudio) { try { o._abpAudio.pause(); } catch (e) {} }
      });

      if (audio.readyState < 3) {
        p.classList.add("is-loading");
        icon.textContent = "progress_activity";
      }
      var pr = audio.play();
      if (pr && pr.catch) pr.catch(function () {
        p.classList.remove("is-loading");
        icon.textContent = "play_arrow";
      });
    });

    function seek(ev) {
      var r = bar.getBoundingClientRect();
      var x = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
      if (isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime = x * audio.duration;
        fill.style.width = x * 100 + "%";
      } else {
        /* duration not known yet — remember target after metadata */
        try { audio.currentTime = 0; } catch (e) {}
      }
    }
    var dragging = false;
    bar.addEventListener("pointerdown", function (ev) {
      dragging = true;
      if (bar.setPointerCapture) bar.setPointerCapture(ev.pointerId);
      seek(ev);
    });
    bar.addEventListener("pointermove", function (ev) { if (dragging) seek(ev); });
    bar.addEventListener("pointerup", function () { dragging = false; });
    bar.addEventListener("pointercancel", function () { dragging = false; });

    bar.addEventListener("keydown", function (ev) {
      if (!isFinite(audio.duration)) return;
      if (ev.key === "ArrowRight") { audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); ev.preventDefault(); }
      else if (ev.key === "ArrowLeft") { audio.currentTime = Math.max(0, audio.currentTime - 5); ev.preventDefault(); }
      else if (ev.key === "Home") { audio.currentTime = 0; ev.preventDefault(); }
      else if (ev.key === "End") { audio.currentTime = audio.duration; ev.preventDefault(); }
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden && !audio.paused) audio.pause();
    });

    Object.defineProperty(p, "_abpAudio", { get: function () { return audio; } });

    /* Warm-up: nudge the browser to pre-buffer a little as soon as the
       player is visible, so the first click starts fast. */
    function warm() { try { audio.load(); } catch (e) {} }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { io.disconnect(); warm(); }
        });
      }, { rootMargin: "200px" });
      io.observe(p);
    }
  }

  function init() {
    document.querySelectorAll(".abp[data-src]").forEach(build);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.ABAudioPlayer = { init: init };
})();
