/* MH Tiling & Bathroom Renovations — shared behaviour
   Degrades gracefully: without GSAP or Lenis the content is still visible
   and every page still works. Touch devices get native scrolling and
   lighter animations so scrolling stays smooth. */
(function () {
  const html = document.documentElement;
  const R = document.body.dataset.root || '';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const touch = !fine;
  const G = typeof gsap !== 'undefined';
  const ST = G && typeof ScrollTrigger !== 'undefined';
  if (ST) gsap.registerPlugin(ScrollTrigger);
  if (!G) html.classList.add('no-gsap');
  if (touch) html.classList.add('touch');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  /* ---------- smooth scroll (desktop only: native touch scrolling is smoother) ---------- */
  let lenis = null;
  if (!reduce && fine && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (G) {
      lenis.on('scroll', () => ST && ScrollTrigger.update());
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollTo = el => lenis ? lenis.scrollTo(el, { offset: -90 }) : el.scrollIntoView({ behavior: 'smooth' });

  /* ---------- split headings into animatable words ---------- */
  function splitWords(el) {
    if (el.dataset.splitDone) return $$('.w > span', el);
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w'; w.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:.08em;margin-bottom:-.08em';
            const i = document.createElement('span'); i.style.display = 'inline-block'; i.textContent = part;
            w.appendChild(i); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
      });
    };
    walk(el); el.dataset.splitDone = '1';
    return $$('.w > span', el);
  }

  function enter() { heroIn(); }
  const loader = $('#loader');
  function finishIntro() { if (loader) loader.remove(); html.classList.remove('intro', 'intro-out'); enter(); }
  function runIntro() {
    try { sessionStorage.setItem('mh_intro', '1'); } catch (e) {}
    if (!loader || !html.classList.contains('intro') || reduce) { finishIntro(); return; }
    setTimeout(() => { html.classList.add('intro-out'); setTimeout(finishIntro, 680); }, 2150);
  }

  /* ---------- hero entrance ---------- */
  let heroDone = false;
  function heroIn() {
    if (heroDone) return; heroDone = true;
    const hero = $('.hero, .phero'); if (!hero) return;
    $$('video', hero).forEach(v => v.play().catch(() => {}));
    if (!G || reduce) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const h = $('h1', hero);
    if (h) {
      if (touch) tl.from(h, { opacity: 0, y: 26, duration: 0.9, clearProps: 'all' }, 0.1);
      else tl.from(splitWords(h), { yPercent: 110, duration: 1, stagger: 0.045, clearProps: 'all' }, 0);
    }
    const eb = $('.eyebrow, .crumb', hero); if (eb) tl.from(eb, { opacity: 0, x: -20, duration: 0.8, clearProps: 'all' }, 0.1);
    const lead = $('.lead', hero); if (lead) tl.from(lead, { opacity: 0, y: 20, duration: 0.9, clearProps: 'all' }, 0.45);
    const btns = $$('.btn-row .btn', hero); if (btns.length) tl.from(btns, { opacity: 0, y: 16, duration: 0.7, stagger: 0.1, clearProps: 'all' }, 0.6);
    const trust = $('.trust', hero); if (trust) tl.from(trust, { opacity: 0, y: 14, duration: 0.8, clearProps: 'all' }, 0.85);
    if (!touch) {
      const vc = $('.vcard', hero); if (vc) tl.from(vc, { clipPath: 'inset(45% 0 45% 0 round 24px)', scale: 0.97, duration: 1.2, ease: 'power4.inOut', clearProps: 'all' }, 0.15);
      const fr = $('.vwrap .frame', hero); if (fr) tl.from(fr, { opacity: 0, scale: 1.05, duration: 1, clearProps: 'all' }, 0.9);
      const pill = $('.vwrap .pill', hero); if (pill) tl.from(pill, { opacity: 0, y: 20, scale: 0.92, duration: 0.7, ease: 'back.out(1.6)', clearProps: 'all' }, 1.2);
      const tag = $('.vwrap .tag', hero); if (tag) tl.from(tag, { opacity: 0, x: -14, duration: 0.6, clearProps: 'all' }, 1.1);
      const bg = $('img.bg', hero); if (bg) tl.from(bg, { scale: 1.12, duration: 1.8, ease: 'power2.out', clearProps: 'all' }, 0);
      const sc = $('.scroll', hero); if (sc) tl.from(sc, { opacity: 0, duration: 0.8 }, 1.3);
    }
  }

  /* ---------- scroll animations ---------- */
  function touchFx() {
    const els = $$('[data-reveal],[data-split],[data-clip]').filter(el => !el.closest('.hero, .phero'));
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; const el = e.target;
      if (el.dataset.reveal === 'group') [...el.children].forEach((c, i) => { c.style.transitionDelay = (i * 60) + 'ms'; });
      el.classList.add('in'); io.unobserve(el);
    }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
    $$('[data-count]').forEach(el => {
      const end = parseFloat(el.dataset.count), suf = el.dataset.suffix || '';
      const o = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; o.disconnect(); const t0 = performance.now();
        const step = t => { const p = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); });
      o.observe(el);
    });
    $$('.timeline .tl-line').forEach(el => { const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { el.style.transform = 'scaleY(1)'; o.disconnect(); } }, { threshold: 0.2 }); o.observe(el.parentElement); });
    const rp = $('.rp i'), art = $('.article');
    if (rp && art) window.addEventListener('scroll', () => { const r = art.getBoundingClientRect(); rp.style.transform = 'scaleX(' + clamp(-r.top / (r.height - innerHeight + 80), 0, 1) + ')'; }, { passive: true });
  }
  function scrollFx() {
    if (reduce) return;
    if (touch) { touchFx(); return; }
    if (!ST) return;
    gsap.defaults({ ease: 'power3.out' });
    const dur = touch ? 0.7 : 1, dist = touch ? 24 : 40;
    $$('[data-reveal]').forEach(el => {
      const kind = el.dataset.reveal;
      if (kind === 'group') {
        gsap.from(el.children, { y: dist, opacity: 0, duration: dur, stagger: touch ? 0.06 : 0.1, clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 88%' } });
      } else {
        gsap.from(el, { y: dist, opacity: 0, duration: dur, clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 90%' } });
      }
    });
    $$('[data-split]').forEach(el => {
      if (el.closest('.hero, .phero')) return;
      if (touch) gsap.from(el, { y: 20, opacity: 0, duration: 0.7, clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 90%' } });
      else gsap.from(splitWords(el), { yPercent: 110, duration: 0.9, stagger: 0.03, clearProps: 'all', scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    $$('[data-clip]').forEach(el => {
      const img = $('img', el);
      if (touch) { gsap.from(el, { opacity: 0, y: 20, duration: 0.8, clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 90%' } }); return; }
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%' } });
      tl.from(el, { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'power4.inOut', clearProps: 'clipPath' }, 0);
      if (img && !el.hasAttribute('data-parallax')) tl.from(img, { scale: 1.2, duration: 1.6, ease: 'power3.out', clearProps: 'transform' }, 0);
    });
    if (!touch) $$('[data-parallax]').forEach(el => {
      const img = $('img', el); if (!img) return;
      gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-count]').forEach(el => {
      const end = parseFloat(el.dataset.count), o = { v: 0 }, suf = el.dataset.suffix || '';
      ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v) + suf; } }) });
    });
    $$('.timeline .tl-line').forEach(el => {
      gsap.to(el, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top 70%', end: 'bottom 70%', scrub: true } });
    });
    const rp = $('.rp i'); const art = $('.article');
    if (rp && art) gsap.to(rp, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: art, start: 'top 80px', end: 'bottom bottom', scrub: true } });
    if (!touch) $$('.ghost').forEach(el => gsap.to(el, { xPercent: -12, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top top', end: 'bottom top', scrub: true } }));

    /* horizontal showcase (desktop: pinned; touch: native swipe) */
    const hs = $('.hs'), track = $('#hsTrack');
    if (hs && track && fine) {
      ScrollTrigger.matchMedia({
        '(min-width: 761px)': () => {
          const dist = () => track.scrollWidth - window.innerWidth;
          const tween = gsap.to(track, { x: () => -dist(), ease: 'none',
            scrollTrigger: { trigger: hs, start: 'top top', end: () => '+=' + dist(), pin: $('.pin', hs), scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
              onUpdate: s => { const p = $('.prog i', hs); if (p) p.style.transform = 'scaleX(' + s.progress + ')'; } } });
          return () => tween.scrollTrigger && tween.scrollTrigger.kill();
        }
      });
    }
  }

  /* ---------- facts: pinned camera section ---------- */
  const facts = $('.facts');
  if (facts) {
    const tall = $('.tall', facts), frame = $('.cam-frame', facts), cam = $('.cam', facts);
    const pins = $$('.pin', facts), lis = $$('.stages li', facts), ms = $('.mstage', facts);
    const stages = lis.map(li => ({ px: +li.dataset.px, py: +li.dataset.py, z: +li.dataset.z, h: $('h3', li).textContent, p: $('p', li).textContent }));
    const n = stages.length;
    let stage = -1, running = false;
    function setStage(i, within) {
      const s = stages[i], W = frame.clientWidth, H = frame.clientHeight;
      if (!W || !H) return;
      const z = reduce ? 1 : (touch ? Math.min(s.z, 1.45) : s.z);
      if (i !== stage) {
        stage = i;
        const tx = clamp(W / 2 - s.px / 100 * W * z, W - W * z, 0), ty = clamp(H / 2 - s.py / 100 * H * z, H - H * z, 0);
        cam.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${z})`; cam.style.setProperty('--z', z);
        lis.forEach((li, k) => li.classList.toggle('on', k === i));
        pins.forEach(p => p.classList.toggle('on', +p.dataset.s === i));
        if (ms) { $('.n', ms).textContent = '0' + (i + 1); $('h3', ms).textContent = s.h; $('p', ms).textContent = s.p; }
      }
      const bar = lis[i] && $('.bar i', lis[i]); if (bar) bar.style.width = (within * 100) + '%';
      if (ms) { const mb = $('.bar i', ms); if (mb) mb.style.width = (within * 100) + '%'; }
      lis.forEach((li, k) => { const b = $('.bar i', li); if (b && k !== i) b.style.width = k < i ? '100%' : '0%'; });
    }
    function update() {
      const r = tall.getBoundingClientRect(), vh = window.innerHeight;
      const total = r.height - vh; const p = clamp(-r.top / total, 0, 0.9999);
      const i = Math.floor(p * n), within = (p * n) - i;
      setStage(i, within);
    }
    const onS = () => { if (!running) { running = true; requestAnimationFrame(() => { running = false; update(); }); } };
    window.addEventListener('scroll', onS, { passive: true });
    window.addEventListener('resize', () => { stage = -1; update(); });
    if (lenis) lenis.on('scroll', onS);
    update();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { stage = -1; update(); });
  }

  /* ---------- nav ---------- */
  const nav = $('.nav'); let lastY = 0;
  const burger = $('.burger'), menu = $('.menu');
  function onScroll() {
    const y = window.scrollY;
    if (nav) { nav.classList.toggle('solid', y > 40); nav.classList.toggle('hide', y > lastY && y > 300 && !(menu && menu.classList.contains('open'))); }
    lastY = y;
  }
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('open'); burger.classList.toggle('x', open);
      burger.setAttribute('aria-expanded', open);
      if (lenis) open ? lenis.stop() : lenis.start(); else document.body.style.overflow = open ? 'hidden' : '';
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const here = location.pathname.split('/').pop() || 'index.html';
  $$('.links a, .menu a').forEach(a => { const f = a.getAttribute('href').split('/').pop(); if (f === here || (location.pathname.includes('/blog/') && f === 'blog.html')) a.classList.add('on'); });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); scrollTo(t); } }));

  /* ---------- cursor + magnetic (desktop only) ---------- */
  if (fine && G && !reduce) {
    const c = $('.cursor'), r = $('.cursor-ring');
    if (c && r) {
      const cx = gsap.quickTo(c, 'x', { duration: 0.12 }), cy = gsap.quickTo(c, 'y', { duration: 0.12 });
      const rx = gsap.quickTo(r, 'x', { duration: 0.4, ease: 'power3' }), ry = gsap.quickTo(r, 'y', { duration: 0.4, ease: 'power3' });
      window.addEventListener('mousemove', e => { html.classList.add('cur'); cx(e.clientX); cy(e.clientY); rx(e.clientX); ry(e.clientY); });
      document.addEventListener('mouseover', e => {
        const v = e.target.closest('[data-cursor="view"]'); const h = e.target.closest('a, button, input, select, textarea, .compare');
        r.classList.toggle('view', !!v); r.classList.toggle('hover', !!h && !v);
      });
    }
    $$('.btn-gold, .btn-navy').forEach(b => {
      const xt = gsap.quickTo(b, 'x', { duration: 0.4, ease: 'power3' }), yt = gsap.quickTo(b, 'y', { duration: 0.4, ease: 'power3' });
      b.addEventListener('mousemove', e => { const rc = b.getBoundingClientRect(); xt((e.clientX - rc.left - rc.width / 2) * 0.25); yt((e.clientY - rc.top - rc.height / 2) * 0.35); });
      b.addEventListener('mouseleave', () => { xt(0); yt(0); });
    });
  }

  /* ---------- projects / showcase ---------- */
  const P = window.MH_PROJECTS || [];
  const camIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h3l2-2h6l2 2h3v12H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
  const grid = $('#projects');
  if (grid) {
    P.forEach((p, i) => {
      const b = document.createElement('button');
      b.className = 'proj'; b.dataset.tags = p.tags.join(' '); b.dataset.cursor = 'view'; b.setAttribute('aria-label', 'Open photos: ' + p.t);
      b.innerHTML = `<div class="ph"><img src="${R}img/${p.ph[0]}.jpg" alt="${p.t}" loading="lazy"></div>
        <span class="cnt">${camIcon}${p.ph.length}</span>
        <div class="meta"><h3>${p.t}</h3><p>${p.d.split('. ')[0].replace(/\.$/, '')}.</p>
        <div class="sw">${p.sw.map(c => `<i style="background:${c}"></i>`).join('')}</div></div>`;
      b.addEventListener('click', () => openLb(i, 0));
      grid.appendChild(b);
    });
    $$('.filters button').forEach(btn => btn.addEventListener('click', () => {
      $$('.filters button').forEach(b => b.classList.remove('on')); btn.classList.add('on');
      const f = btn.dataset.f;
      const items = $$('.proj', grid);
      items.forEach(el => el.classList.toggle('hide', f !== 'all' && !el.dataset.tags.split(' ').includes(f)));
      if (G && !reduce) gsap.from(items.filter(el => !el.classList.contains('hide')), { opacity: 0, y: 18, duration: 0.5, stagger: 0.04, clearProps: 'all' });
      if (ST) ScrollTrigger.refresh();
    }));
    if (G && ST && !reduce) gsap.from($$('.proj', grid), { y: 40, opacity: 0, duration: 0.9, stagger: 0.07, clearProps: 'all', scrollTrigger: { trigger: grid, start: 'top 88%' } });
  }
  const track = $('#hsTrack');
  if (track) {
    P.slice(0, 8).forEach((p, i) => {
      const b = document.createElement('button');
      b.className = 'item'; b.dataset.cursor = 'view'; b.setAttribute('aria-label', 'Open photos: ' + p.t);
      b.innerHTML = `<div class="ph"><img src="${R}img/${p.ph[0]}.jpg" alt="${p.t}" loading="lazy"></div><span class="n">${String(i + 1).padStart(2, '0')}</span>
        <div class="cap"><span>${p.loc}</span><h3>${p.t}</h3></div>`;
      b.addEventListener('click', () => openLb(i, 0));
      track.appendChild(b);
    });
    const cta = document.createElement('a'); cta.className = 'item cta'; cta.href = R + 'gallery.html';
    cta.innerHTML = `<div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8l4 4-4 4"/></svg><h3>See all ${P.length} projects</h3><p>Open the full gallery</p></div>`;
    track.appendChild(cta);
  }

  /* ---------- lightbox ---------- */
  const lb = $('#lb');
  let cur = 0, idx = 0, lastFocus = null;
  function openLb(i, k) {
    if (!lb) { location.href = R + 'gallery.html'; return; }
    cur = i; idx = k; lastFocus = document.activeElement;
    const p = P[i]; $('#lbTitle').textContent = p.t; $('#lbDesc').textContent = p.d;
    const th = $('#lbThumbs'); th.innerHTML = p.ph.map((f, n) => `<button aria-label="Photo ${n + 1}"><img src="${R}img/${f}.jpg" alt=""></button>`).join('');
    [...th.children].forEach((b, n) => b.addEventListener('click', () => show(n)));
    show(k, true); lb.classList.add('open'); html.classList.add('lb-open'); if (lenis) lenis.stop();
    $('#lbClose').focus();
  }
  function show(n, first) {
    const p = P[cur]; idx = (n + p.ph.length) % p.ph.length;
    const im = $('#lbImg'); im.src = `${R}img/${p.ph[idx]}.jpg`; im.alt = `${p.t}, photo ${idx + 1} of ${p.ph.length}`;
    [...$('#lbThumbs').children].forEach((b, i) => b.classList.toggle('on', i === idx));
    const nx = new Image(); nx.src = `${R}img/${p.ph[(idx + 1) % p.ph.length]}.jpg`;
    if (G && !reduce) gsap.fromTo(im, { opacity: 0 }, { opacity: 1, duration: first ? 0.45 : 0.3, clearProps: 'opacity' });
  }
  function closeLb() { lb.classList.remove('open'); html.classList.remove('lb-open'); if (lenis) lenis.start(); if (lastFocus) lastFocus.focus(); }
  if (lb) {
    $('#lbClose').addEventListener('click', closeLb);
    $('#lbPrev').addEventListener('click', () => show(idx - 1));
    $('#lbNext').addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-stage')) closeLb(); });
    document.addEventListener('keydown', e => { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); });
    let tx = null;
    lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); tx = null; });
  }

  /* ---------- before / after ---------- */
  $$('.compare').forEach(cmp => {
    const rng = $('input[type=range]', cmp);
    const set = x => { cmp.style.setProperty('--x', x + '%'); if (rng) rng.value = x; };
    if (rng) rng.addEventListener('input', () => set(rng.value));
    const fromPointer = e => { const r = cmp.getBoundingClientRect(); set(clamp((e.clientX - r.left) / r.width, 0, 1) * 100); };
    let drag = false;
    cmp.addEventListener('pointerdown', e => { drag = true; fromPointer(e); });
    window.addEventListener('pointermove', e => { if (drag) fromPointer(e); });
    window.addEventListener('pointerup', () => { drag = false; });
    if (ST && !reduce) ScrollTrigger.create({ trigger: cmp, start: 'top 75%', once: true, onEnter: () => { const o = { v: 50 }; gsap.fromTo(o, { v: 92 }, { v: 45, duration: 1.5, ease: 'power3.inOut', onUpdate: () => set(o.v) }); } });
  });

  /* ---------- quote form ---------- */
  const form = $('#quoteForm');
  if (form) form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('button[type=submit]', form); const orig = btn.innerHTML; btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const r = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      const j = await r.json();
      if (j.success) { $('#formOk').style.display = 'block'; form.reset(); scrollTo($('#formOk')); }
      else throw new Error(j.message || 'Send failed');
    } catch (err) {
      alert('Sorry, that did not send. Please call or WhatsApp us on +353 87 670 3666.');
    } finally { btn.disabled = false; btn.innerHTML = orig; }
  });

  $$('#yr').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- ambient background: gold dust particles ---------- */
  if (!reduce) $$('.hero, .cta, section.dark, footer').forEach(sec => {
    const light = false;
    if ($('.bgfx', sec)) return;
    const fx = document.createElement('div'); fx.className = 'bgfx' + (light ? ' light' : ''); fx.setAttribute('aria-hidden', 'true');
    const cv = document.createElement('canvas'); fx.appendChild(cv);
    if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
    sec.insertBefore(fx, sec.firstChild);
    const ctx = cv.getContext('2d'); let W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2), parts = [], run = false, raf = null;
    const count = () => Math.round(Math.min(light ? 60 : 90, Math.max(18, (W * H) / (touch ? (light ? 34000 : 26000) : (light ? 22000 : 16000)))));
    const C = light ? { core: '214,170,70', mid: '169,133,47', dot: '150,112,30', mul: 0.75 } : { core: '227,201,127', mid: '198,162,77', dot: '255,240,200', mul: 1 };
    const mk = (fresh) => ({ x: Math.random() * W, y: fresh ? H + 10 : Math.random() * H, r: 0.6 + Math.random() * 1.8, s: 0.12 + Math.random() * 0.28, a: Math.random() * Math.PI * 2, sw: 0.15 + Math.random() * 0.35, tw: Math.random() * Math.PI * 2, ts: 0.01 + Math.random() * 0.02, o: 0.25 + Math.random() * 0.55 });
    const size = () => {
      const r = sec.getBoundingClientRect(); const oW = W, oH = H;
      if (oW && Math.abs(r.width - oW) < 2 && Math.abs(r.height - oH) < 160) return; // address bar show/hide: ignore
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!parts.length) { parts = Array.from({ length: count() }, () => mk(false)); return; }
      const sx = oW ? W / oW : 1, sy = oH ? H / oH : 1;
      parts.forEach(p => { p.x *= sx; p.y *= sy; });
      const n = count(); while (parts.length < n) parts.push(mk(false)); if (parts.length > n) parts.length = n;
    };
    const tick = () => {
      if (!run) { raf = null; return; }
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.y -= p.s; p.a += 0.004; p.x += Math.sin(p.a) * p.sw * 0.3; p.tw += p.ts;
        if (p.y < -10) Object.assign(p, mk(true));
        const al = p.o * C.mul * (0.55 + 0.45 * Math.sin(p.tw));
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(${C.core},${al})`); g.addColorStop(0.4, `rgba(${C.mid},${al * 0.35})`); g.addColorStop(1, `rgba(${C.mid},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(${C.dot},${al})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.7, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(es => { run = es[0].isIntersecting; if (run && !raf) raf = requestAnimationFrame(tick); });
    size(); io.observe(sec);
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 250); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) run = false; else { run = true; if (!raf) raf = requestAnimationFrame(tick); } });
  });

  /* ---------- press feedback on cards ---------- */
  const pressSel = '.card, .step, .proj, .post, .val, .towns span';
  document.addEventListener('pointerdown', e => {
    const el = e.target.closest(pressSel); if (!el) return;
    el.classList.add('pressed'); clearTimeout(el._pt); el._pt = setTimeout(() => el.classList.remove('pressed'), 900);
  }, { passive: true });

  /* ---------- boot ---------- */
  scrollFx();
  runIntro();
  window.addEventListener('load', () => { ST && ScrollTrigger.refresh(); });
})();
