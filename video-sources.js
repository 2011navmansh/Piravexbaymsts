/* Video sources are kept out of the HTML markup. */
(function () {
  'use strict';
  if (window.__AB_VIDEO_SOURCES) return;
  window.__AB_VIDEO_SOURCES = true;
  var M = {
    'ABV1': 'https://huggingface.co/datasets/navmansh/mhgd/resolve/main/Released%20_%20How%20to%20Use%20New%20Consist%20Editor%20_%20Full%20Step%20By%20Step%20Guide%20Video_%20Credit%20By%20_%20Dev%20Bhai%20%23msts.mp4',
    'ABV2': 'https://huggingface.co/datasets/navmansh/totoria4/resolve/main/export-1793355653743.mp4',
    'ABV3': 'https://huggingface.co/datasets/navmansh/totorial-2/resolve/main/Download%20%26%20Install%20DB%20Tracks%20For%20MSTS%20In%20Just%201%20Click%20!!%20_%20High%20Quality%20Track%20Textures%20For%20Openrails.mp4',
    'ABV4': 'https://huggingface.co/datasets/navmansh/totroiral3/resolve/main/How%20To%20Fix%20Activity%20Error%20%20%26%20Edit%20Consists%20TSRE5%20ln%20MSTS%20_%20OPENRAILS%20%20%20Super%20Easy%20!!%20-%20100%25%20Working.mp4',
    'ABV5': 'https://huggingface.co/datasets/navmansh/tyyiu/resolve/main/Installing%20and%20Patching%20MSTS%20for%20Windows%2011%20(2022%20Edition).mp4',
    'ABV6': 'https://huggingface.co/datasets/navmansh/v45675467/resolve/main/How%20to%20create%20activity%20in%20MSTS%20Tutorial%20_%20Commentary%20_%20MSTS%20Open%20Rails.mp4',
    'ABV7': 'https://huggingface.co/datasets/navmansh/videoss/resolve/main/DMR-1.mp4',
    'ABV8': 'https://www.kaggle.com/api/v1/datasets/download/navmansh/uuiiihshhshhshhss/qq.mp4?datasetVersionNumber=1'
  };
  function apply() {
    var vids = document.querySelectorAll("[data-vsrc]");
    for (var i = 0; i < vids.length; i++) {
      var t = vids[i].getAttribute("data-vsrc");
      if (M[t]) vids[i].setAttribute("src", M[t]);
      vids[i].removeAttribute("data-vsrc");
    }
    var els = document.querySelectorAll('[data-video],[href]');
    for (var n = 0; n < els.length; n++) {
      ['data-video','href'].forEach(function (a) {
        var v = els[n].getAttribute(a);
        if (v && /ABV\d+/.test(v)) {
          els[n].setAttribute(a, v.replace(/ABV\d+/g, function (k) { return M[k] || k; }));
        }
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
