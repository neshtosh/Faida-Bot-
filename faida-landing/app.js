/* Faida landing. No dependencies.
   Scroll is a timeline: pinned acts publish --p (0..1) and the page reacts to it.
   Everything here degrades to a readable static page (no JS, reduced motion, short screens). */
(function () {
  'use strict';

  /* ---------- config: set these before launch ---------- */
  var CONFIG = {
    whatsappNumber: '',            // e.g. '2547XXXXXXXX' (digits only, with country code)
    whatsappText: { en: 'Hi Faida', sw: 'Habari Faida' },
    orgEmail: '',                  // e.g. 'partners@yourdomain.co.ke'
    orgSubject: { en: 'Faida for our organisation', sw: 'Faida kwa taasisi yetu' }
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

  var TITLES = { en: 'Faida: just ask, and it gets done', sw: 'Faida: uliza tu, na yanafanyika' };

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
    if (bridge.ready) { renderBridge(); }
    if (!silent) { try { localStorage.setItem('faida-lang', l); } catch (e) {} }
  }

  function wireLinks() {
    var t = encodeURIComponent(CONFIG.whatsappText[lang]);
    var wa = 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + t;
    $$('[data-wa]').forEach(function (a) { a.href = wa; a.target = '_blank'; a.rel = 'noopener'; });
    var mail = 'mailto:' + CONFIG.orgEmail + '?subject=' + encodeURIComponent(CONFIG.orgSubject[lang]);
    $$('[data-org]').forEach(function (a) { a.href = mail; });
  }

  $$('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.dataset.lang); });
  });

  /* ---------- bridge: real rules over example people ---------- */
  var T = {
    fits: { en: 'Fits', sw: 'Inafaa' },
    notfit: { en: 'Not a fit: ', sw: 'Haifai: ' },
    tapPerson: { en: 'Tap a person to see what fits them.', sw: 'Gusa mtu kuona kinachomfaa.' },
    everyone: { en: 'Everyone', sw: 'Kila mtu' },
    women: { en: 'Women', sw: 'Wanawake' },
    biz: { en: 'Business owners', sw: 'Wenye biashara' },
    nowork: { en: 'Not in work or business', sw: 'Wasio na ajira au biashara' }
  };

  // Rules follow faida-export/src/db/benefits.json (simplified).
  var PEOPLE = [
    { id: 'wanjiru', name: 'Wanjiru', age: 24, gender: 'f', county: 'Kisumu', status: 'business',
      desc: { en: '24, Kisumu, runs a salon', sw: '24, Kisumu, ana saluni' } },
    { id: 'otieno', name: 'Otieno', age: 33, gender: 'm', county: 'Nakuru', status: 'business',
      desc: { en: '33, Nakuru, boda boda rider', sw: '33, Nakuru, mwendesha boda boda' } },
    { id: 'amina', name: 'Amina', age: 19, gender: 'f', county: 'Mombasa', status: 'none',
      desc: { en: '19, Mombasa, student', sw: '19, Mombasa, mwanafunzi' } },
    { id: 'ekai', name: 'Ekai', age: 62, gender: 'm', county: 'Turkana', status: 'none',
      desc: { en: '62, Turkana, retired farmer', sw: '62, Turkana, mkulima mstaafu' } }
  ];
  var COUNTIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'];
  var PROGS = [
    { id: 'sha', name: 'SHA health cover', r: { min: 0, max: 99 } },
    { id: 'hustler', name: 'Hustler Fund', r: { min: 18, max: 99 } },
    { id: 'yedf', name: 'YEDF', r: { min: 18, max: 34 } },
    { id: 'wef', name: 'Women Enterprise Fund', r: { min: 18, max: 99, gender: 'f' } },
    { id: 'county', name: 'County Youth & Women Funds', r: { min: 18, max: 35, business: true, counties: COUNTIES } },
    { id: 'agpo', name: 'AGPO tenders', r: { min: 18, max: 35, business: true } },
    { id: 'ngcdf', name: 'NG-CDF Bursary', r: { min: 14, max: 30, notWorking: true } },
    { id: 'ajira', name: 'Ajira Digital', r: { min: 18, max: 35 } }
  ];
  var AUTO_PROG = 'county';

  function range(r) {
    return r.max >= 99 ? r.min + '+' : r.min + (lang === 'sw' ? ' hadi ' : ' to ') + r.max;
  }
  function check(p, g) {
    var r = g.r;
    if (p.age < r.min || p.age > r.max) return { k: 'age' };
    if (r.gender && r.gender !== p.gender) return { k: 'gender' };
    if (r.business && p.status !== 'business') return { k: 'business' };
    if (r.counties && r.counties.indexOf(p.county) < 0) return { k: 'county' };
    if (r.notWorking && p.status !== 'none') return { k: 'notwork' };
    return null;
  }
  function reason(p, g, why) {
    var sw = lang === 'sw';
    switch (why.k) {
      case 'age': return (sw ? 'umri ' : 'age ') + p.age + (sw ? ', inahitaji ' : ', needs ') + range(g.r);
      case 'gender': return sw ? 'kwa wanawake pekee' : 'for women only';
      case 'business': return sw ? 'kwa wenye biashara' : 'for business owners';
      case 'county': return (sw ? 'inapatikana ' : 'only in ') + g.r.counties.join(', ') + (sw ? ' pekee' : '');
      default: return sw ? 'kwa wasio na ajira au biashara' : 'for people not in work or business';
    }
  }
  function ruleText(g) {
    var r = g.r, out = [];
    if (r.min === 0 && r.max >= 99 && !r.gender && !r.business && !r.counties && !r.notWorking) return T.everyone[lang];
    if (!(r.min === 0)) out.push((lang === 'sw' ? 'Miaka ' : 'Ages ') + range(r));
    if (r.gender) out.push(T.women[lang]);
    if (r.business) out.push(T.biz[lang]);
    if (r.notWorking) out.push(T.nowork[lang]);
    if (r.counties) out.push(lang === 'sw' ? 'kaunti ' + r.counties.length : r.counties.length + ' counties');
    return out.join(' · ');
  }
  function icon(id) { return '<svg class="icon" aria-hidden="true"><use href="#' + id + '"/></svg>'; }

  var bridge = { ready: false, mode: null, id: null, manual: false };
  var peopleEl, progsEl, bodyEl, threadsEl, layerEl, captionEl, bridgeStage;
  var isVertical = function () { return window.matchMedia('(max-width: 899px)').matches; };

  function renderBridge() {
    var sel = bridge.id;
    var person = bridge.mode === 'person' ? PEOPLE.filter(function (p) { return p.id === sel; })[0] : null;
    var prog = bridge.mode === 'prog' ? PROGS.filter(function (g) { return g.id === sel; })[0] : null;

    peopleEl.innerHTML = PEOPLE.map(function (p) {
      var cls = 'node', sub = p.desc[lang], tag = '';
      if (prog) {
        var why = check(p, prog);
        cls += why ? ' is-nofit' : ' is-fit';
        if (why) sub = T.notfit[lang] + reason(p, prog, why);
        else tag = '<span class="node__tag">' + icon('i-check') + '<span class="t">' + T.fits[lang] + '</span></span>';
      }
      return '<button type="button" class="' + cls + '" data-person="' + p.id + '" aria-pressed="' + (person === p) + '">' +
        '<span class="node__name"><span>' + p.name + '</span>' + tag + '</span>' +
        '<span class="node__sub">' + sub + '</span></button>';
    }).join('');

    progsEl.innerHTML = PROGS.map(function (g) {
      var cls = 'node', sub = ruleText(g), tag = '';
      if (person) {
        var why = check(person, g);
        cls += why ? ' is-nofit' : ' is-fit';
        if (why) sub = T.notfit[lang] + reason(person, g, why);
        else tag = '<span class="node__tag">' + icon('i-check') + '<span class="t">' + T.fits[lang] + '</span></span>';
      }
      return '<button type="button" class="' + cls + '" data-prog="' + g.id + '" aria-pressed="' + (prog === g) + '">' +
        '<span class="node__name"><span>' + g.name + '</span>' + tag + '</span>' +
        '<span class="node__sub">' + sub + '</span></button>';
    }).join('');

    var cap;
    if (person) {
      var n = PROGS.filter(function (g) { return !check(person, g); }).length;
      cap = lang === 'sw'
        ? person.name + ' anastahili programu ' + n + ' kati ya ' + PROGS.length + '. Faida ingeuliza: “Niombe kwa niaba yako?”'
        : person.name + ' fits ' + n + ' of ' + PROGS.length + ' programmes. Faida would ask: “Shall I apply for you?”';
    } else if (prog) {
      var m = PEOPLE.filter(function (p) { return !check(p, prog); }).length;
      cap = lang === 'sw'
        ? prog.name + ' inawafaa watu ' + m + ' kati ya ' + PEOPLE.length + ' wa mfano. Faida ingewajulisha waliokubali.'
        : prog.name + ' fits ' + m + ' of ' + PEOPLE.length + ' example people. Faida would tell the ones who opted in.';
    } else {
      cap = T.tapPerson[lang];
    }
    captionEl.textContent = cap;
    layoutThreads(true);
  }

  function select(mode, id, manual) {
    if (bridge.mode === mode && bridge.id === id) { if (manual) { bridge.manual = true; } return; }
    bridge.mode = mode; bridge.id = id;
    if (manual) bridge.manual = true;
    renderBridge();
    if (isVertical() && mode === 'person') {
      var tab = $('[data-person="' + id + '"]', peopleEl);
      if (tab) peopleEl.scrollTo({ left: Math.max(0, tab.offsetLeft - 12), behavior: 'auto' });
    }
  }
  function clear() {
    if (bridge.mode === null) return;
    bridge.mode = null; bridge.id = null; renderBridge();
  }

  var SVGNS = 'http://www.w3.org/2000/svg';
  function mk(tag, attrs) {
    var el = document.createElementNS(SVGNS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function layoutThreads(animate) {
    if (!bridge.ready) return;
    layerEl.innerHTML = '';
    if (!bridge.mode) return;
    var cr = bodyEl.getBoundingClientRect();
    var vertical = isVertical();
    var grad = $('#tg-h'), gradV = $('#tg-v');
    grad.setAttribute('x2', cr.width); gradV.setAttribute('y2', cr.height);
    var stroke = vertical ? 'url(#tg-v)' : 'url(#tg-h)';
    var pairs = [];
    if (bridge.mode === 'person') {
      var p = PEOPLE.filter(function (x) { return x.id === bridge.id; })[0];
      var pe = $('[data-person="' + p.id + '"]', peopleEl).getBoundingClientRect();
      PROGS.forEach(function (g) {
        if (check(p, g)) return;
        pairs.push({ a: pe, b: $('[data-prog="' + g.id + '"]', progsEl).getBoundingClientRect() });
      });
    } else if (!vertical) {
      var gg = PROGS.filter(function (x) { return x.id === bridge.id; })[0];
      var ge = $('[data-prog="' + gg.id + '"]', progsEl).getBoundingClientRect();
      PEOPLE.forEach(function (q) {
        if (check(q, gg)) return;
        pairs.push({ a: $('[data-person="' + q.id + '"]', peopleEl).getBoundingClientRect(), b: ge, rev: true });
      });
    }
    pairs.forEach(function (pr, i) {
      var d, x1, y1, x2, y2;
      if (!vertical) {
        x1 = pr.a.right - cr.left; y1 = pr.a.top + pr.a.height / 2 - cr.top;
        x2 = pr.b.left - cr.left; y2 = pr.b.top + pr.b.height / 2 - cr.top;
        var mx = (x1 + x2) / 2;
        d = pr.rev
          ? 'M' + x2 + ' ' + y2 + ' C' + mx + ' ' + y2 + ' ' + mx + ' ' + y1 + ' ' + x1 + ' ' + y1
          : 'M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2;
      } else {
        x1 = pr.a.left + pr.a.width / 2 - cr.left; y1 = pr.a.bottom - cr.top;
        x2 = pr.b.left - cr.left; y2 = pr.b.top + pr.b.height / 2 - cr.top;
        d = 'M' + x1 + ' ' + y1 + ' V' + (y1 + 8) + ' H12 V' + y2 + ' H' + x2;
      }
      var path = mk('path', { d: d, class: 'thread', pathLength: 1, stroke: stroke });
      path.style.setProperty('--i', i);
      layerEl.appendChild(path);
      var c1 = mk('circle', { cx: x1, cy: y1, r: 4.5, fill: '#0a7b48', class: 'thread-end' });
      var c2 = mk('circle', { cx: x2, cy: y2, r: 4.5, fill: '#5fe29a', class: 'thread-end' });
      c1.style.transitionDelay = (i * 70 + 500) + 'ms'; c2.style.transitionDelay = (i * 70 + 500) + 'ms';
      layerEl.appendChild(c1); layerEl.appendChild(c2);
      if (animate && !reduce) {
        requestAnimationFrame(function () { requestAnimationFrame(function () { path.classList.add('is-drawn'); c1.classList.add('is-drawn'); c2.classList.add('is-drawn'); }); });
      } else {
        path.classList.add('is-drawn'); path.style.transition = 'none'; c1.classList.add('is-drawn'); c2.classList.add('is-drawn');
      }
    });
  }

  function initBridge() {
    peopleEl = $('#people'); progsEl = $('#progs'); bodyEl = $('#bridgebody');
    threadsEl = $('#threads'); layerEl = $('#thread-layer'); captionEl = $('#caption');
    bridgeStage = $('#bridge .stage');
    bridge.ready = true;
    peopleEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-person]'); if (!b) return;
      select('person', b.dataset.person, true);
    });
    progsEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-prog]'); if (!b) return;
      select('prog', b.dataset.prog, true);
    });
    peopleEl.addEventListener('scroll', function () { layoutThreads(false); }, { passive: true });
    renderBridge();
  }

  /* ---------- hero art: dots (people) reach squares (programmes) across the seam ---------- */
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function heroArt() {
    var hero = $('.hero'), svg = $('.hero__art');
    var hr = hero.getBoundingClientRect(), W = hr.width, H = hr.height;
    var vertical = W < 900, rnd = rng(11), dots = [], sqs = [], knot;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.innerHTML = '';
    function grid(x0, x1, y0, y1, cols, rows, out) {
      var cw = (x1 - x0) / cols, ch = (y1 - y0) / rows;
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
        out.push({ x: x0 + cw * (c + 0.2 + rnd() * 0.6), y: y0 + ch * (r + 0.2 + rnd() * 0.6) });
      }
    }
    if (!vertical) {
      var ct = Math.min($('.hero__side--people .hero__copy').getBoundingClientRect().top, $('.hero__side--org .hero__copy').getBoundingClientRect().top) - hr.top;
      var y0 = Math.max(H * 0.15, 90), y1 = Math.max(y0 + 120, ct - 36);
      grid(W * 0.07, W * 0.43, y0, y1, 5, 3, dots);
      grid(W * 0.57, W * 0.93, y0, y1, 4, 3, sqs);
      knot = (y0 + y1) / 2;
    } else {
      var S = $('.hero__side--people').getBoundingClientRect().bottom - hr.top;
      grid(W * 0.07, W * 0.93, S - 112, S - 26, 8, 2, dots);
      grid(W * 0.07, W * 0.93, S + 26, S + 112, 6, 2, sqs);
      knot = S;
    }
    hero.style.setProperty('--knot-y', knot + 'px');
    var defs = mk('defs', {});
    var g = mk('linearGradient', { id: 'hg', gradientUnits: 'userSpaceOnUse', x1: vertical ? 0 : W * 0.25, y1: vertical ? knot - 80 : 0, x2: vertical ? 0 : W * 0.75, y2: vertical ? knot + 80 : 0 });
    g.appendChild(mk('stop', { offset: 0, 'stop-color': '#0a7b48' })); g.appendChild(mk('stop', { offset: 1, 'stop-color': '#5fe29a' }));
    defs.appendChild(g); svg.appendChild(defs);

    var arcs = [], used = {};
    for (var i = 0; i < dots.length; i += 3) {
      var j = Math.floor(rnd() * sqs.length), tries = 0;
      while (used[j] && tries++ < 20) j = Math.floor(rnd() * sqs.length);
      used[j] = 1; arcs.push([i, j]);
    }
    var matchedD = {}, matchedS = {};
    arcs.forEach(function (a) { matchedD[a[0]] = 1; matchedS[a[1]] = 1; });
    arcs.forEach(function (a, n) {
      var p = dots[a[0]], q = sqs[a[1]], d;
      var lift = (rnd() - 0.55) * (vertical ? 60 : 130);
      if (!vertical) { var mx = (p.x + q.x) / 2; d = 'M' + p.x + ' ' + p.y + ' C' + (p.x + (q.x - p.x) * 0.45) + ' ' + (p.y + lift) + ' ' + (p.x + (q.x - p.x) * 0.55) + ' ' + (q.y + lift) + ' ' + q.x + ' ' + q.y; }
      else { var my = (p.y + q.y) / 2; d = 'M' + p.x + ' ' + p.y + ' C' + (p.x + lift) + ' ' + my + ' ' + (q.x + lift) + ' ' + my + ' ' + q.x + ' ' + q.y; }
      var path = mk('path', { d: d, class: 'arc', pathLength: 1, fill: 'none', stroke: 'url(#hg)', 'stroke-width': 2, 'stroke-linecap': 'round' });
      path.style.setProperty('--i', n);
      svg.appendChild(path);
    });
    dots.forEach(function (p, i) {
      var m = matchedD[i];
      svg.appendChild(mk('circle', { cx: p.x, cy: p.y, r: m ? 6 : 3.5, fill: m ? '#0f2018' : '#0f2018', 'fill-opacity': m ? 1 : 0.28, class: 'pt' }));
    });
    sqs.forEach(function (q, i) {
      var m = matchedS[i], s = m ? 14 : 11;
      svg.appendChild(mk('rect', { x: q.x - s / 2, y: q.y - s / 2, width: s, height: s, rx: 3, fill: m ? '#5fe29a' : 'none', stroke: '#5fe29a', 'stroke-opacity': m ? 1 : 0.35, 'stroke-width': 1.5, class: 'pt' }));
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { svg.classList.add('is-drawn'); }); });
  }

  /* ---------- scroll driver ---------- */
  var acts = [], unpin = false, vh = window.innerHeight, ticking = false;
  var chat = { msgs: [], steps: [], n: -1 };
  var gapCols, stickyEl, heroEl, startEl, finalEl, langEl, lastY = 0;

  function computeUnpin() {
    vh = window.innerHeight;
    unpin = !reduce && (vh < 680 || (window.innerWidth < 900 && vh < 700));
    doc.classList.toggle('unpin', unpin);
  }

  function onChat(p, pinned) {
    var N = chat.msgs.length;
    var n = pinned ? Math.round(clamp((p - 0.04) / 0.86, 0, 1) * N) : N;
    if (n === chat.n) return;
    chat.n = n;
    chat.msgs.forEach(function (m, i) { m.classList.toggle('is-on', i < n); });
    var cur = n === 0 ? 0 : +chat.msgs[n - 1].dataset.step;
    chat.steps.forEach(function (li, i) {
      li.classList.toggle('is-done', pinned ? i < cur : false);
      li.classList.toggle('is-on', pinned ? i === cur : i === chat.steps.length - 1);
    });
  }

  function onBridge(p, pinned) {
    if (p < 0.02 || p > 0.98) bridge.manual = false;
    if (!pinned || bridge.manual) return;
    var a = 0.06, b = 0.7, step = (b - a) / PEOPLE.length;
    if (p < a) { clear(); return; }
    if (p < b) { select('person', PEOPLE[Math.min(PEOPLE.length - 1, Math.floor((p - a) / step))].id, false); return; }
    select('prog', AUTO_PROG, false);
  }

  function onClose(p, pinned) {
    if (!pinned) return;
    var t = clamp((p - 0.28) / 0.52, 0, 1);
    var eased = 1 - Math.pow(1 - t, 3);
    var max = Math.hypot(window.innerWidth, vh) / 2 * 1.06;
    finalEl.style.setProperty('--reveal', (eased * max).toFixed(1) + 'px');
    finalEl.style.setProperty('--ct', clamp((t - 0.55) / 0.4, 0, 1).toFixed(3));
    finalEl.classList.toggle('is-live', t >= 1);
  }

  function frame() {
    ticking = false;
    var y = window.scrollY;
    for (var i = 0; i < acts.length; i++) {
      var a = acts[i], r = a.el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      var pinned = !unpin && !reduce;
      var p = pinned ? clamp(-r.top / Math.max(1, r.height - vh), 0, 1) : clamp((vh - r.top) / (r.height + vh), 0, 1);
      a.el.style.setProperty('--p', p.toFixed(4));
      a.fn(p, pinned);
    }
    if (gapCols) {
      var g = gapCols.getBoundingClientRect();
      var fill = clamp((vh * 0.9 - g.top) / (g.height * 0.85), 0, 1);
      gapCols.style.setProperty('--fill', reduce ? 1 : fill.toFixed(3));
      $('.gap__channel b', gapCols).style.setProperty('--fill', reduce ? 1 : fill.toFixed(3));
    }
    var hb = heroEl.getBoundingClientRect().bottom, inAct = false;
    for (var k = 0; k < acts.length; k++) { var ar = acts[k].el.getBoundingClientRect(); if (ar.top < vh * 0.6 && ar.bottom > vh * 0.4) inAct = true; }
    stickyEl.classList.toggle('is-on', hb < vh * 0.25 && !inAct);
    var down = y > lastY + 4, up = y < lastY - 4;
    if (window.innerWidth < 900 && y > vh * 0.5) { if (down) langEl.classList.add('is-away'); else if (up) langEl.classList.remove('is-away'); }
    else langEl.classList.remove('is-away');
    if (down || up) lastY = y;
  }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  /* ---------- reveal on entry ---------- */
  function initReveal() {
    var els = $$('[data-in]');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- boot ---------- */
  function boot() {
    langEl = $('.lang'); heroEl = $('.hero'); gapCols = $('#gapcols'); stickyEl = $('#sticky'); startEl = $('#start'); finalEl = $('#final');
    chat.msgs = $$('#msgs .msg'); chat.steps = $$('#steps li');
    acts = $$('[data-act]').map(function (el) {
      var k = el.dataset.act;
      return { el: el, fn: k === 'bridge' ? onBridge : k === 'chat' ? onChat : onClose };
    });
    computeUnpin();
    initBridge();
    applyLang(lang, true);
    if (reduce || unpin) { select('person', PEOPLE[0].id, false); }
    heroArt();
    initReveal();
    window.addEventListener('scroll', request, { passive: true });
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { computeUnpin(); heroArt(); layoutThreads(false); request(); }, 120);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { heroArt(); layoutThreads(false); request(); });
    request();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
