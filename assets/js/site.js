(function () {
  'use strict';
  var root = document.documentElement;

  // Theme: light by default, remembered per browser.
  document.querySelectorAll('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('fcc-theme', next); } catch (e) {}
    });
  });

  // Header hairline once the page scrolls.
  var header = document.querySelector('.site-header');
  var onScroll = function () { header && header.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Full-screen menu.
  var panel = document.getElementById('menu');
  var openBtn = document.querySelector('.menu-btn');
  var closeBtn = panel && panel.querySelector('.menu-close');
  function setMenu(open) {
    if (!panel) return;
    panel.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    openBtn.setAttribute('aria-expanded', String(open));
    if (open) setTimeout(function () { closeBtn.focus(); }, 50); else openBtn.focus();
  }
  openBtn && openBtn.addEventListener('click', function () { setMenu(true); });
  closeBtn && closeBtn.addEventListener('click', function () { setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel && panel.classList.contains('open')) setMenu(false);
  });

  // Reveal on scroll.
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger, .band');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // Lightbox for gallery photos and posters.
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  if (links.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML =
      '<img alt="">' +
      '<p class="lb-cap"></p>' +
      '<button class="lb-close" type="button" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button class="lb-prev" type="button" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<button class="lb-next" type="button" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5l7 7-7 7"/></svg></button>';
    document.body.appendChild(lb);
    var img = lb.querySelector('img'), cap = lb.querySelector('.lb-cap');
    var group = [], idx = 0, lastFocus = null;

    function show(i) {
      idx = (i + group.length) % group.length;
      var a = group[idx];
      img.src = a.getAttribute('href');
      img.alt = a.getAttribute('data-caption') || '';
      cap.textContent = a.getAttribute('data-caption') || '';
      lb.querySelector('.lb-prev').hidden = lb.querySelector('.lb-next').hidden = group.length < 2;
    }
    function open(a) {
      var name = a.getAttribute('data-lightbox');
      group = links.filter(function (l) { return l.getAttribute('data-lightbox') === name; });
      lastFocus = a;
      show(group.indexOf(a));
      lb.classList.add('open');
      document.body.classList.add('menu-open');
      lb.querySelector('.lb-close').focus();
    }
    function close() {
      lb.classList.remove('open');
      document.body.classList.remove('menu-open');
      img.removeAttribute('src');
      lastFocus && lastFocus.focus();
    }
    links.forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); open(a); });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  var api = (document.querySelector('meta[name="api-base"]') || {}).content || '';
  var isStatic = !!document.querySelector('meta[name="site-mode"][content="static"]');

  // GitHub Pages build: ask the PHP site whether we're live and show the banner.
  if (isStatic && api) {
    fetch(api + '/api/live', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (s) {
      if (!s.live) return;
      document.querySelectorAll('[data-live-banner], [data-live-pill]').forEach(function (el) { el.hidden = false; });
    }).catch(function () {});
  }

  // Static build: hide announcements whose "hide after" date has passed since the last rebuild.
  if (isStatic) {
    var today = new Date().toISOString().slice(0, 10);
    document.querySelectorAll('[data-ends]').forEach(function (el) { if (el.getAttribute('data-ends') < today) el.hidden = true; });
  }

  // Pre-select the ministry/department from ?group= (static pages can't do it server-side).
  var groupSelect = document.getElementById('j-group');
  var wanted = new URLSearchParams(location.search).get('group');
  if (groupSelect && wanted) groupSelect.value = wanted;
  document.querySelectorAll('[data-join-group]').forEach(function (a) {
    a.addEventListener('click', function () { if (groupSelect) groupSelect.value = a.getAttribute('data-join-group'); });
  });

  // GitHub Pages build: send the join form to the PHP site's API.
  var joinForm = document.querySelector('form[data-api-join]');
  if (joinForm) {
    joinForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = joinForm.querySelector('[data-join-error]');
      var btn = joinForm.querySelector('button[type=submit]');
      var data = {};
      new FormData(joinForm).forEach(function (v, k) { data[k] = v; });
      btn.disabled = true;
      fetch(joinForm.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Something went wrong.'); }); })
        .then(function () {
          joinForm.hidden = true;
          document.querySelector('[data-join-thanks]').hidden = false;
        })
        .catch(function (ex) {
          err.hidden = false;
          err.querySelector('span').textContent = ex.message === 'Failed to fetch' ? 'Could not reach the church server. Please try again later.' : ex.message;
          btn.disabled = false;
        });
    });
  }

  // Share buttons: native share sheet, else copy the link.
  document.querySelectorAll('[data-share]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var data = { title: document.title, url: location.href.split('?')[0] };
      if (navigator.share) { navigator.share(data).catch(function () {}); return; }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(data.url).then(function () {
          var old = btn.innerHTML;
          btn.textContent = 'Link copied ✓';
          setTimeout(function () { btn.innerHTML = old; }, 1800);
        });
      }
    });
  });
})();
