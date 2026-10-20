/* MH Tiling & Bathroom Renovations — shared behaviour
   Everything degrades gracefully: if GSAP or Lenis fail to load,
   content is still visible and the site still works. */
(function () {
  const html = document.documentElement;
  const R = document.body.dataset.root || '';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const G = typeof gsap !== 'undefined';
  const ST = G && typeof ScrollTrigger !== 'undefined';
  if (ST) gsap.registerPlugin(ScrollTrigger);
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
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
            const w = document.createElement('span'); w.className = 'w'; w.style.display = 'inline-block'; w.style.overflow = 'hidden'; w.style.verticalAlign = 'bottom';
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

  /* ---------- intro loader ---------- */
  const loader = $('#loader');
  const isIntro = html.classList.contains('intro') && loader;
  function finishIntro() {
    try { sessionStorage.setItem('mh_intro', '1'); } catch (e) {}
    if (loader) loader.remove();
    html.classList.remove('intro');
    document.body.style.overflow = '';
    heroIn();
  }
  function runIntro() {
    document.body.style.overflow = 'hidden';
    if (!G || reduce) { setTimeout(finishIntro, 300); return; }
    const num = $('.num', loader), bar = $('.bar i', loader), o = { v: 0 };
    const tl = gsap.timeline({ onComplete: finishIntro });
    tl.to($$('.hex', loader), { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.15 }, 0)
      .from($('.mh', loader), { opacity: 0, scale: 0.8, transformOrigin: '50% 50%', duration: 0.9, ease: 'power3.out' }, 0.5)
      .from($('.lt span', loader), { yPercent: 110, duration: 0.7, ease: 'power3.out' }, 0.9)
      .to(o, { v: 100, duration: 1.7, ease: 'power2.inOut', onUpdate: () => { num.textContent = Math.round(o.v); bar.style.width = o.v + '%'; } }, 0.2)
      .to($('.lc', loader), { opacity: 0, y: -30, duration: 0.5, ease: 'power2.in' }, '+=0.15')
      .to($('.lp.one', loader), { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '<0.1')
      .to($('.lp.two', loader), { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '<0.12');
    setTimeout(() => { if (document.body.contains(loader)) finishIntro(); }, 7000);
  }

  /* ---------- page transitions ---------- */
  const trans = $('#transition');
  const tp = trans ? $$('.tp', trans) : [];
  function enter() {
    if (!G || !tp.length || reduce) { html.classList.remove('entering'); heroIn(); return; }
    gsap.set(tp, { scaleY: 1, transformOrigin: 'bottom' });
    html.classList.remove('entering');
    gsap.to(tp, { scaleY: 0, duration: 0.9, ease: 'power4.inOut', stagger: 0.08, onComplete: heroIn });
  }
  function leave(href) {
    if (!G || !tp.length || reduce) { location.href = href; return; }
    gsap.set(tp, { scaleY: 0, transformOrigin: 'top' });
    gsap.to(tp.slice().reverse(), { scaleY: 1, duration: 0.7, ease: 'power4.inOut', stagger: 0.08, onComplete: () => { location.href = href; } });
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]'); if (!a) return;
    const href = a.getAttribute('href');
    if (a.target === '_blank' || a.hasAttribute('download') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || a.origin !== location.origin || e.metaKey || e.ctrlKey) return;
    if (a.pathname === location.pathname && a.hash) return;
    e.preventDefault(); leave(a.href);
  });
  window.addEventListener('pageshow', e => { if (e.persisted && G && tp.length) gsap.set(tp, { scaleY: 0 }); });

  /* ---------- hero entrance ---------- */
  let heroDone = false;
  function heroIn() {
    if (heroDone) return; heroDone = true;
    const hero = $('.hero, .phero'); if (!hero) return;
    const v = $('video', hero); if (v) v.play().catch(() => {});
    if (!G || reduce) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const h = $('h1', hero);
    if (h) tl.from(splitWords(h), { yPercent: 110, duration: 1.1, stagger: 0.05 }, 0);
    const eb = $('.eyebrow, .crumb', hero); if (eb) tl.from(eb, { opacity: 0, x: -20, duration: 0.8 }, 0.1);
    const lead = $('.lead', hero); if (lead) tl.from(lead, { opacity: 0, y: 24, duration: 0.9 }, 0.5);
    const btns = $$('.btn-row .btn', hero); if (btns.length) tl.from(btns, { opacity: 0, y: 20, duration: 0.7, stagger: 0.1 }, 0.7);
    const trust = $('.trust', hero); if (trust) tl.from(trust, { opacity: 0, y: 16, duration: 0.8 }, 1);
    const vc = $('.vcard', hero); if (vc) tl.from(vc, { clipPath: 'inset(50% 0 50% 0 round 24px)', scale: 0.96, duration: 1.3, ease: 'power4.inOut' }, 0.2);
    const fr = $('.vwrap .frame', hero); if (fr) tl.from(fr, { opacity: 0, scale: 1.06, duration: 1, ease: 'power3.out' }, 1);
    const pill = $('.vwrap .pill', hero); if (pill) tl.from(pill, { opacity: 0, y: 24, scale: 0.9, duration: 0.7, ease: 'back.out(1.6)' }, 1.3);
    const tag = $('.vwrap .tag', hero); if (tag) tl.from(tag, { opacity: 0, x: -14, duration: 0.6 }, 1.2);
    const bg = $('img.bg', hero); if (bg) tl.from(bg, { scale: 1.15, duration: 1.8, ease: 'power2.out' }, 0);
    const sc = $('.scroll', hero); if (sc) tl.from(sc, { opacity: 0, duration: 0.8 }, 1.4);
  }

  /* ---------- scroll animations ---------- */
  function scrollFx() {
    if (!ST || reduce) return;
    gsap.defaults({ ease: 'power3.out' });
    $$('[data-reveal]').forEach(el => {
      const kind = el.dataset.reveal;
      if (kind === 'group') {
        gsap.from(el.children, { y: 44, opacity: 0, duration: 1, stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 85%' } });
      } else {
        gsap.from(el, { y: 40, opacity: 0, duration: 1, scrollTrigger: { trigger: el, start: 'top 88%' } });
      }
    });
    $$('[data-split]').forEach(el => {
      if (el.closest('.hero, .phero')) return;
      gsap.from(splitWords(el), { yPercent: 110, duration: 0.9, stagger: 0.03, scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    $$('[data-clip]').forEach(el => {
      const img = $('img', el);
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%' } });
      tl.from(el, { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'power4.inOut' }, 0);
      if (img && !el.hasAttribute('data-parallax')) tl.from(img, { scale: 1.25, duration: 1.6, ease: 'power3.out' }, 0);
    });
    $$('[data-parallax]').forEach(el => {
      const img = $('img', el); if (!img) return;
      gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-count]').forEach(el => {
      const end = parseFloat(el.dataset.count), o = { v: 0 }, suf = el.dataset.suffix || '';
      ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v) + suf; } }) });
    });
    $$('.timeline .tl-line').forEach(el => {
      gsap.to(el, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top 70%', end: 'bottom 70%', scrub: true } });
    });
    const rp = $('.rp i'); const art = $('.article');
    if (rp && art) gsap.to(rp, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: art, start: 'top 80px', end: 'bottom bottom', scrub: true } });
    $$('.ghost').forEach(el => gsap.to(el, { xPercent: -12, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top top', end: 'bottom top', scrub: true } }));

    /* horizontal showcase */
    const hs = $('.hs'), track = $('#hsTrack');
    if (hs && track) {
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

  /* ---------- nav ---------- */
  const nav = $('.nav'); let lastY = 0;
  function onScroll() {
    const y = window.scrollY;
    if (nav) { nav.classList.toggle('solid', y > 40); nav.classList.toggle('hide', y > lastY && y > 300 && !menu.classList.contains('open')); }
    lastY = y;
  }
  const burger = $('.burger'), menu = $('.menu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('open'); burger.classList.toggle('x', open);
      burger.setAttribute('aria-expanded', open);
      if (lenis) open ? lenis.stop() : lenis.start(); else document.body.style.overflow = open ? 'hidden' : '';
      if (open && G && !reduce) gsap.from($$('a', menu), { x: -30, opacity: 0, duration: 0.6, stagger: 0.06, delay: 0.25, ease: 'power3.out' });
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  /* current page link */
  const here = location.pathname.split('/').pop() || 'index.html';
  $$('.links a, .menu a').forEach(a => { const f = a.getAttribute('href').split('/').pop(); if (f === here || (here.startsWith('blog') && f === 'blog.html')) a.classList.add('on'); });
  /* anchor links */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); scrollTo(t); } }));

  /* ---------- cursor + magnetic ---------- */
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
        <div class="meta"><h3>${p.t}</h3><p>${p.d.split('. ')[0].replace(/\.$/,'')}.</p>
        <div class="sw">${p.sw.map(c => `<i style="background:${c}"></i>`).join('')}</div></div>`;
      b.addEventListener('click', () => openLb(i, 0));
      grid.appendChild(b);
    });
    $$('.filters button').forEach(btn => btn.addEventListener('click', () => {
      $$('.filters button').forEach(b => b.classList.remove('on')); btn.classList.add('on');
      const f = btn.dataset.f;
      const items = $$('.proj', grid);
      items.forEach(el => el.classList.toggle('hide', f !== 'all' && !el.dataset.tags.split(' ').includes(f)));
      if (G && !reduce) gsap.from(items.filter(el => !el.classList.contains('hide')), { opacity: 0, y: 24, duration: 0.6, stagger: 0.05, clearProps: 'all' });
      if (ST) ScrollTrigger.refresh();
    }));
    if (G && ST && !reduce) gsap.from($$('.proj', grid), { y: 50, opacity: 0, duration: 1, stagger: 0.08, scrollTrigger: { trigger: grid, start: 'top 85%' } });
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
    show(k); lb.classList.add('open'); if (lenis) lenis.stop(); else document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
    if (G && !reduce) gsap.from($('#lbImg'), { scale: 0.94, opacity: 0, duration: 0.5, ease: 'power3.out' });
  }
  function show(n) {
    const p = P[cur]; idx = (n + p.ph.length) % p.ph.length;
    const im = $('#lbImg'); im.src = `${R}img/${p.ph[idx]}.jpg`; im.alt = `${p.t}, photo ${idx + 1} of ${p.ph.length}`;
    [...$('#lbThumbs').children].forEach((b, i) => b.classList.toggle('on', i === idx));
    const nx = new Image(); nx.src = `${R}img/${p.ph[(idx + 1) % p.ph.length]}.jpg`;
    if (G && !reduce) gsap.fromTo(im, { opacity: 0.4, x: 10 }, { opacity: 1, x: 0, duration: 0.4 });
  }
  function closeLb() { lb.classList.remove('open'); if (lenis) lenis.start(); else document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
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
    const fromPointer = e => { const r = cmp.getBoundingClientRect(); set(Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1) * 100); };
    let drag = false;
    cmp.addEventListener('pointerdown', e => { drag = true; fromPointer(e); });
    window.addEventListener('pointermove', e => { if (drag) fromPointer(e); });
    window.addEventListener('pointerup', () => { drag = false; });
    if (ST && !reduce) ScrollTrigger.create({ trigger: cmp, start: 'top 75%', once: true, onEnter: () => { const o = { v: 50 }; gsap.fromTo(o, { v: 95 }, { v: 45, duration: 1.6, ease: 'power3.inOut', onUpdate: () => set(o.v) }); } });
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
      const ph = $('[data-phone]');
      alert('Sorry, that did not send. Please call or WhatsApp us on ' + (ph ? ph.textContent : 'the number above') + '.');
    } finally { btn.disabled = false; btn.innerHTML = orig; }
  });

  $$('#yr').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- boot ---------- */
  scrollFx();
  if (isIntro) runIntro(); else enter();
  window.addEventListener('load', () => { ST && ScrollTrigger.refresh(); });
})();
