/* Faida for organisations (index.html, served at /). No dependencies.
   One signature move, echoing the people page's receipt: a programme report that
   prints line by line on the title page and is stamped. Everything degrades to a
   readable static page (no JS, reduced motion). */
(function () {
  'use strict';

  var CONFIG = window.FAIDA_CONFIG;
  var doc = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) doc.classList.add('rm');

  /* ---------- language (shared with the people page) ---------- */
  var lang = 'en';
  try {
    var saved = localStorage.getItem('faida-lang');
    if (saved === 'sw' || saved === 'en') lang = saved;
    else if ((navigator.language || '').toLowerCase().indexOf('sw') === 0) lang = 'sw';
  } catch (e) {}

  var TITLES = {
    en: 'Faida for organisations: reach the people your programmes are meant for',
    sw: 'Faida kwa taasisi: wafikie watu ambao mipango yako inawalenga'
  };

  function wireLinks() {
    var wa = 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(CONFIG.whatsappText[lang]);
    $$('[data-wa]').forEach(function (a) { a.href = wa; a.target = '_blank'; a.rel = 'noopener'; });
    var mail = 'mailto:' + CONFIG.orgEmail + '?subject=' + encodeURIComponent(CONFIG.orgSubject[lang]);
    $$('[data-org]').forEach(function (a) { a.href = mail; });
    // show the address and WhatsApp as text too: mailto does nothing in many webmail setups
    var contact = $('[data-org-contact]');
    if (contact && CONFIG.orgEmail) {
      var em = $('[data-org-email]', contact);
      em.href = mail; em.textContent = CONFIG.orgEmail;
      contact.hidden = false;
      if (CONFIG.orgWhatsapp) {
        var w = $('[data-org-wa]', contact);
        w.href = 'https://wa.me/' + CONFIG.orgWhatsapp; w.target = '_blank'; w.rel = 'noopener';
        w.textContent = '+' + CONFIG.orgWhatsapp;
        $('[data-org-wa-wrap]', contact).hidden = false;
      }
    }
  }

  function applyLang(l, silent) {
    lang = l;
    doc.lang = l;
    $$('[data-sw]').forEach(function (el) {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      el.innerHTML = l === 'sw' ? el.dataset.sw : el.dataset.en;
    });
    $$('[data-aria-sw]').forEach(function (el) {
      if (el.dataset.ariaEn === undefined) el.dataset.ariaEn = el.getAttribute('aria-label');
      el.setAttribute('aria-label', l === 'sw' ? el.dataset.ariaSw : el.dataset.ariaEn);
    });
    $$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === l)); });
    document.title = TITLES[l];
    wireLinks();
    if (!silent) { try { localStorage.setItem('faida-lang', l); } catch (e) {} }
  }

  /* ---------- voice waveform ---------- */
  function waves() {
    $$('[data-wave]').forEach(function (w) {
      var h = [30, 55, 80, 45, 95, 60, 35, 75, 50, 90, 40, 65, 85, 45, 70, 30, 55, 80, 40, 60, 35, 50];
      w.innerHTML = h.map(function (v) { return '<i style="height:' + v + '%"></i>'; }).join('');
    });
  }

  /* ---------- chat playback ---------- */
  function play(phone) {
    if (phone.dataset.played) return;
    phone.dataset.played = '1';
    var msgs = $$('.msg', phone), typing = $('.typing', phone), i = 0;
    if (reduce || !typing) { msgs.forEach(function (m) { m.classList.add('is-on'); }); return; }
    function next() {
      if (i >= msgs.length) return;
      var m = msgs[i++], bot = !m.classList.contains('msg--me');
      if (bot) {
        typing.classList.add('is-on');
        setTimeout(function () { typing.classList.remove('is-on'); m.classList.add('is-on'); setTimeout(next, 500); }, 700);
      } else {
        m.classList.add('is-on'); setTimeout(next, 650);
      }
    }
    setTimeout(next, 350);
  }

  /* ---------- the programme report prints on the title page ---------- */
  function printSheet() {
    var lines = $$('#sheet .receipt__lines li'), total = $('#sheet .total'), stamp = $('#sheetStamp');
    if (reduce) { lines.forEach(function (li) { li.classList.add('is-on'); }); total.classList.add('is-on'); stamp.classList.add('is-on'); return; }
    lines.forEach(function (li, k) { setTimeout(function () { li.classList.add('is-on'); }, 700 + k * 260); });
    var end = 700 + lines.length * 260;
    setTimeout(function () { total.classList.add('is-on'); }, end + 100);
    setTimeout(function () { stamp.classList.add('is-on'); }, end + 450);
  }

  /* ---------- observers ---------- */
  function observers() {
    var plain = reduce || !('IntersectionObserver' in window);
    var revealEls = $$('[data-in]');
    var phones = $$('[data-play]');
    if (plain) {
      revealEls.forEach(function (e) { e.classList.add('in'); });
      phones.forEach(play);
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (e) { io.observe(e); });
    var po = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { play(en.target); po.unobserve(en.target); } });
    }, { threshold: 0.55 });
    phones.forEach(function (p) { po.observe(p); });
  }

  /* ---------- scroll: sticky CTA on phones, language pill tucks away ---------- */
  var ticking = false, lastY = 0, heroEl, startEl, stickyEl, langEl;
  function frame() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var hb = heroEl.getBoundingClientRect().bottom, st = startEl.getBoundingClientRect().top;
    stickyEl.classList.toggle('is-on', hb < vh * 0.25 && st > vh * 0.55);
    var down = y > lastY + 4, up = y < lastY - 4;
    if (window.innerWidth < 900 && y > vh * 0.5) { if (down) langEl.classList.add('is-away'); else if (up) langEl.classList.remove('is-away'); }
    else langEl.classList.remove('is-away');
    if (down || up) lastY = y;
  }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  /* ---------- boot ---------- */
  function boot() {
    heroEl = $('#top'); startEl = $('#start'); stickyEl = $('#sticky'); langEl = $('.lang');
    waves();
    applyLang(lang, true);
    $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { applyLang(b.dataset.lang); }); });
    observers();
    printSheet();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    request();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
