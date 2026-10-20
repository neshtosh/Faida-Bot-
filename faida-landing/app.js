/* Faida landing, v2. No dependencies.
   One signature move: the receipt. As each moment of Wanjiru's day completes, a line is
   stamped on the slip in the margin; at 9 pm the slip is tallied on stage.
   Everything degrades to a readable static page (no JS, reduced motion). */
(function () {
  'use strict';

  /* ---------- config: set these before launch ---------- */
  var CONFIG = {
    whatsappNumber: '',            // digits only with country code, e.g. '2547XXXXXXXX'
    whatsappText: { en: 'Hi Faida', sw: 'Habari Faida' },
    orgEmail: '',                  // e.g. 'partners@yourdomain.co.ke'
    orgSubject: { en: 'Listing an offer with Faida', sw: 'Kuorodhesha ofa na Faida' }
  };

  var doc = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) doc.classList.add('rm');

  /* ---------- language ---------- */
  var lang = 'en';
  try {
    var saved = localStorage.getItem('faida-lang');
    if (saved === 'sw' || saved === 'en') lang = saved;
    else if ((navigator.language || '').toLowerCase().indexOf('sw') === 0) lang = 'sw';
  } catch (e) {}

  var TITLES = { en: 'Faida: before you ask, it is handled', sw: 'Faida: kabla hujauliza, imeshughulikiwa' };

  var LEVELS = {
    1: { en: 'Your business permit expires in 30 days.',
         sw: 'Kibali chako cha biashara kinaisha baada ya siku 30.' },
    2: { en: 'Your permit renewal is filled in and ready.<div class="qr"><span>Open the form</span></div>',
         sw: 'Ombi lako la kusasisha kibali limejazwa na liko tayari.<div class="qr"><span>Fungua fomu</span></div>' },
    3: { en: 'Your permit renews next month and the fee is due. Shall I renew it?<div class="qr"><span>YES</span><span>NO</span></div>',
         sw: 'Kibali chako kinasasishwa mwezi ujao na ada inastahili. Nikisasishe?<div class="qr"><span>NDIYO</span><span>HAPANA</span></div>' },
    4: { en: 'Renewed your permit and paid from your M-Pesa, as you allowed (up to Ksh 5,000 a year). Receipt saved.',
         sw: 'Nimesasisha kibali chako na kulipa kutoka M-Pesa yako, kama ulivyoruhusu (hadi Ksh 5,000 kwa mwaka). Risiti imehifadhiwa.' }
  };
  var level = '3';

  function renderLevel() {
    var el = $('#lvlMsg');
    if (el) el.innerHTML = LEVELS[level][lang];
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
    renderLevel();
    updateNow();
    if (!silent) { try { localStorage.setItem('faida-lang', l); } catch (e) {} }
  }

  function wireLinks() {
    var wa = 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(CONFIG.whatsappText[lang]);
    $$('[data-wa]').forEach(function (a) { a.href = wa; a.target = '_blank'; a.rel = 'noopener'; });
    var mail = 'mailto:' + CONFIG.orgEmail + '?subject=' + encodeURIComponent(CONFIG.orgSubject[lang]);
    $$('[data-org]').forEach(function (a) { a.href = mail; });
  }

  $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { applyLang(b.dataset.lang); }); });

  /* ---------- consent level selector ---------- */
  $$('input[name="lvl"]').forEach(function (r) {
    r.addEventListener('change', function () { level = r.value; renderLevel(); });
  });

  /* ---------- voice waveform ---------- */
  function waves() {
    $$('[data-wave]').forEach(function (w) {
      var h = [30, 55, 80, 45, 95, 60, 35, 75, 50, 90, 40, 65, 85, 45, 70, 30, 55, 80, 40, 60, 35, 50];
      w.innerHTML = h.map(function (v) { return '<i style="height:' + v + '%"></i>'; }).join('');
    });
  }

  /* ---------- the receipt ---------- */
  var slip, slipNow, chipTime, chipCount, chapters = [], stamped = {};
  var slipLines = [];

  function stampLine(n) {
    n = +n;
    for (var k = 1; k <= n; k++) stamped[k] = true;   // jumping ahead still stamps what came before
    slipLines.forEach(function (li) { if (+li.dataset.line <= n) li.classList.add('is-on'); });
    chipCount.textContent = Object.keys(stamped).length;
  }

  var currentChap = null;
  function updateNow() {
    if (!slipNow) return;
    if (!currentChap) { slipNow.innerHTML = ''; chipTime.textContent = '6:00'; return; }
    var d = currentChap.dataset;
    var t = lang === 'sw' ? d.timeSw : d.timeEn;
    var title = lang === 'sw' ? d.titleSw : d.titleEn;
    slipNow.innerHTML = '<b>' + t + '</b><span>' + title + '</span>';
    chipTime.textContent = t.replace(/\s*(am|pm|asubuhi|mchana|jioni|usiku)$/i, '');
  }

  /* ---------- chat playback ---------- */
  function play(phone, done) {
    if (phone.dataset.played) return;
    phone.dataset.played = '1';
    var msgs = $$('.msg', phone), typing = $('.typing', phone), i = 0;
    if (reduce || !typing) { msgs.forEach(function (m) { m.classList.add('is-on'); }); done(); return; }
    function next() {
      if (i >= msgs.length) { done(); return; }
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

  /* ---------- scroll driver ---------- */
  var vh = window.innerHeight, ticking = false, lastY = 0;
  var langEl, stickyEl, heroEl, startEl, peak, bigLines = [], bigTotal, bigStamp, peakDone = false;

  function frame() {
    ticking = false;
    var y = window.scrollY, i, cur = null;
    vh = window.innerHeight;

    for (i = 0; i < chapters.length; i++) {
      if (chapters[i].getBoundingClientRect().top < vh * 0.45) cur = chapters[i];
    }
    if (cur !== currentChap) { currentChap = cur; updateNow(); }

    var pr = peak.getBoundingClientRect();
    var deskTop = $('#desk').getBoundingClientRect().top;
    slip.classList.toggle('is-hidden', pr.top < vh * 0.4);

    // the peak: lines of the tally appear as the chapter crosses the screen
    var p = clamp((vh * 0.95 - pr.top) / (pr.height * 0.62), 0, 1);
    var n = reduce ? bigLines.length : Math.round(p * (bigLines.length + 1));
    bigLines.forEach(function (li, k) { li.classList.toggle('is-on', k < n); });
    var allIn = n > bigLines.length - 1 && p > 0.82;
    bigTotal.classList.toggle('is-on', allIn || reduce);
    if (allIn || reduce) bigStamp.classList.add('is-on');
    else bigStamp.classList.remove('is-on');

    var hb = heroEl.getBoundingClientRect().bottom, st = startEl.getBoundingClientRect().top;
    var cr = $('#charge').getBoundingClientRect();
    var inDay = chapters[0].getBoundingClientRect().top < vh * 0.9 && pr.bottom > vh * 0.1;  // never cover the chat mocks
    var inCharge = cr.top < vh * 0.9 && cr.bottom > vh * 0.1;                                 // or the consent options
    stickyEl.classList.toggle('is-on', hb < vh * 0.25 && st > vh * 0.55 && !inDay && !inCharge);

    var down = y > lastY + 4, up = y < lastY - 4;
    if (window.innerWidth < 900 && y > vh * 0.5) { if (down) langEl.classList.add('is-away'); else if (up) langEl.classList.remove('is-away'); }
    else langEl.classList.remove('is-away');
    if (down || up) lastY = y;
  }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  /* ---------- observers ---------- */
  function observers() {
    var plain = reduce || !('IntersectionObserver' in window);

    // reveal on entry
    var revealEls = $$('[data-in], #ledger');
    if (plain) revealEls.forEach(function (e) { e.classList.add('in'); });
    else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealEls.forEach(function (e) { io.observe(e); });
    }

    // each chapter's main moment stamps its line on the receipt
    $$('[data-chap][data-stamp]').forEach(function (chap) {
      var n = chap.dataset.stamp;
      var phone = $('[data-play]', chap);
      var target = phone || $('.col-media', chap);
      var fire = function () { if (phone) play(phone, function () { stampLine(n); }); else stampLine(n); };
      if (plain) { fire(); return; }
      var o = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { fire(); o.disconnect(); } });
      }, { threshold: phone ? 0.55 : 0.45 });
      o.observe(target);
    });
  }

  /* ---------- boot ---------- */
  function boot() {
    slip = $('#slip'); slipNow = $('#slipNow'); chipTime = $('#chipTime'); chipCount = $('#chipCount');
    slipLines = $$('#slipLines li');
    chapters = $$('[data-chap]');
    langEl = $('.lang'); stickyEl = $('#sticky'); heroEl = $('#top'); startEl = $('#start');
    peak = $('#c6'); bigLines = $$('#bigLines li'); bigTotal = $('#bigTotal'); bigStamp = $('#bigStamp');

    waves();
    applyLang(lang, true);
    observers();

    $('#slipChip').addEventListener('click', function (e) {
      var open = slip.classList.toggle('is-open');
      this.setAttribute('aria-expanded', String(open));
      e.stopPropagation();
    });
    document.addEventListener('click', function (e) {
      if (!slip.contains(e.target)) { slip.classList.remove('is-open'); $('#slipChip').setAttribute('aria-expanded', 'false'); }
    });

    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(request);
    request();

    // the hero stamp lands once
    var s = $('#heroStamp');
    var land = function () { s.classList.add('is-in'); };
    if (reduce) land(); else setTimeout(land, 650);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
