(function () {
  'use strict';
  var api = (document.querySelector('meta[name="api-base"]') || {}).content || '';
  var isStatic = !!document.querySelector('meta[name="site-mode"][content="static"]');

  // Countdown to the next service. On the static site the build-time target may be in the
  // past, so the next service is recalculated from the weekly schedule.
  var cd = document.querySelector('[data-countdown]');
  if (cd) {
    var target = new Date(cd.getAttribute('data-countdown')).getTime();
    var services = [];
    try { services = JSON.parse(cd.getAttribute('data-services') || '[]'); } catch (e) {}
    var tz = cd.getAttribute('data-tz') || '+02:00';
    var nextFromSchedule = function () {
      var best = null, now = Date.now();
      services.forEach(function (s) {
        for (var add = 0; add <= 7; add++) {
          var d = new Date(now + add * 86400000);
          var local = new Date(d.getTime() + (parseInt(tz, 10) * 60 + (tz[0] === '-' ? -1 : 1) * parseInt(tz.slice(4), 10)) * 60000);
          if (local.getUTCDay() !== Number(s.day)) continue;
          var iso = local.toISOString().slice(0, 10) + 'T' + s.time + ':00' + tz;
          var t = new Date(iso).getTime();
          if (t > now && (best === null || t < best)) best = t;
        }
      });
      return best;
    };
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var tick = function () {
      if (target <= Date.now() && services.length) target = nextFromSchedule() || target;
      var s = Math.floor(Math.max(0, target - Date.now()) / 1000);
      cd.querySelector('[data-d]').textContent = Math.floor(s / 86400);
      cd.querySelector('[data-h]').textContent = pad(Math.floor(s % 86400 / 3600));
      cd.querySelector('[data-m]').textContent = pad(Math.floor(s % 3600 / 60));
      cd.querySelector('[data-s]').textContent = pad(s % 60);
    };
    tick();
    setInterval(tick, 1000);
  }

  // Switch between the player and the offline card when the stream starts or ends.
  var stage = document.querySelector('[data-live-state]');
  if (!stage || (isStatic && !api)) return;
  var current = stage.getAttribute('data-live-state') === '1';

  function show(status) {
    if (!isStatic) { location.reload(); return; }
    var on = stage.querySelector('[data-live-on]'), off = stage.querySelector('[data-live-off]');
    var player = stage.querySelector('[data-player]');
    var channel = status.channel || stage.getAttribute('data-channel');
    if (status.live && (status.videoId || channel)) {
      var src = status.videoId ? 'https://www.youtube-nocookie.com/embed/' + status.videoId + '?autoplay=1&rel=0'
        : 'https://www.youtube.com/embed/live_stream?channel=' + encodeURIComponent(channel) + '&autoplay=1';
      player.innerHTML = '<iframe src="' + src + '" title="Live service" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
      on.hidden = false; off.hidden = true;
    } else {
      player.innerHTML = ''; on.hidden = true; off.hidden = false;
    }
  }

  function check(force) {
    if (document.hidden && force !== true) return;
    fetch(api + '/api/live', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (s) {
      if (!!s.live !== current) { current = !!s.live; show(s); }
    }).catch(function () {});
  }
  if (isStatic) check(true);
  setInterval(check, 60000);
})();
