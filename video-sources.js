/* Video sources are kept out of the HTML markup. */
(function () {
  'use strict';
  if (window.__AB_VIDEO_SOURCES) return;
  window.__AB_VIDEO_SOURCES = true;
  var M = {
    'ABV1': 'https://huggingface.co/datasets/navmansh/mhgd/resolve/main/Released%20_%20How%20to%20Use%20New%20Consist%20Editor%20_%20Full%20Step%20By%20Step%20Guide%20Video_%20Credit%20By%20_%20Dev%20Bhai%20%23msts.mp4',
    'ABV2': 'https://huggingface.co/datasets/navmansh/totoria4/resolve/main/export-1793355653743.mp4',
    'ABV3': 'https://www.kaggle.com/api/v1/datasets/download/navmansh/wwwwqqqqqqqqqqqqqqqqqqqqqqqqq/www.mp4?datasetVersionNumber=1',
    'ABV4': 'https://www.kaggle.com/api/v1/datasets/download/navmansh/sdddddddddddddddds/hhhh.mp4?datasetVersionNumber=1',
    'ABV5': 'https://huggingface.co/datasets/navmansh/tyyiu/resolve/main/Installing%20and%20Patching%20MSTS%20for%20Windows%2011%20(2022%20Edition).mp4',
    'ABV6': 'https://huggingface.co/datasets/navmansh/v45675467/resolve/main/How%20to%20create%20activity%20in%20MSTS%20Tutorial%20_%20Commentary%20_%20MSTS%20Open%20Rails.mp4',
    'ABV7': 'https://huggingface.co/datasets/navmansh/videoss/resolve/main/DMR-1.mp4',
    'ABV8': 'https://www.kaggle.com/api/v1/datasets/download/navmansh/uuiiihshhshhshhss/qq.mp4?datasetVersionNumber=1',
    'ABV9': 'https://www.kaggle.com/api/v1/datasets/download/navmansh/ptcgihhgnnmsts-mp4/ptcgihhgnnmsts.mp4?datasetVersionNumber=1'
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
