/* 0. router 4 tingkatan breakpoint (1440 / 1200 / 810 / <810) */
(function () {
  var tierOf = function (w) { return w >= 1440 ? '' : w >= 1200 ? 'd/' : w >= 810 ? 't/' : 'm/'; };
  var dirOf = function (p) {
    if (p.indexOf('m/index.html') > -1) return 'm/';
    if (p.indexOf('t/index.html') > -1) return 't/';
    if (p.indexOf('d/index.html') > -1) return 'd/';
    return '';
  };
  var go = function () {
    var want = tierOf(innerWidth), cur = dirOf(location.pathname);
    if (want === cur) return;
    var root = location.pathname
      .replace('m/index.html', '').replace('t/index.html', '').replace('d/index.html', '')
      .replace('index.html', '');
    location.replace(root + want + 'index.html');
  };
  go();
  setTimeout(go, 400);
  addEventListener('resize', function () { clearTimeout(window.__rt); window.__rt = setTimeout(function () { location.reload(); }, 260); });
})();

/* Mekanisme animasi billow.so, ditulis ulang tanpa runtime Framer.
   Nilai diambil dari sumber asli (lihat MOTION-TOKENS.md di teardown). */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. entrance: .45s cubic-bezier(.16,1,.3,1), stagger 60 ms, sekali jalan */
  const targets = [
    'h1', 'h2', 'h3', '.framer-text',
    '[data-framer-name="Container"] > *',
    '[data-framer-name="Visual"]',
    '[data-framer-name="Card"]',
    '[data-framer-name="Headline"]'
  ].join(',');
  const seen = new Set();
  const els = [...document.querySelectorAll(targets)].filter(el => {
    if (seen.has(el)) return false;
    seen.add(el);
    const r = el.getBoundingClientRect();
    return r.width > 40 && r.height > 8;
  });
  els.forEach(el => el.setAttribute('data-fx', ''));
  if (!reduce) {
    /* reveal: cek posisi (bukan cuma IntersectionObserver) supaya tidak ada blok yang tertinggal invisible */
    const reveal = () => {
      let n = 0;
      for (const el of els) {
        if (el.classList.contains('fx-in')) continue;
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight * .92 && r.bottom > 0) {
          el.style.setProperty('--fx-delay', Math.min(n++ * 50, 200) + 'ms');
          el.classList.add('fx-in');
        }
      }
    };
    reveal();
    addEventListener('scroll', () => { if (!reveal.__r) reveal.__r = requestAnimationFrame(() => { reveal.__r = 0; reveal(); }); }, { passive: true });
    addEventListener('resize', reveal, { passive: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) reveal(); });
    setInterval(reveal, 700); /* jaring pengaman */
  } else {
    els.forEach(el => el.classList.add('fx-in'));
  }

  /* 2. parallax 5% pada gambar hero (speed 95 di aslinya) */
  const heroImg = document.querySelector('.framer-g7j0c');
  if (heroImg && !reduce) {
    let raf = 0;
    const tick = () => {
      raf = 0;
      const y = scrollY;
      const base = innerWidth < 810 ? 36 : 0;
      heroImg.style.transform = `translate(-50%, ${(base + y * .0464).toFixed(2)}px)`;
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
  }

  /* 2b. parallax lapisan awan footer (150 px pada scroll maksimum) */
  const cloud = document.querySelector('.framer-1wbjkgo');
  if (cloud && !reduce) {
    const upd = () => { cloud.style.transform = `translate3d(0, ${(-scrollY * .015).toFixed(2)}px, 0)`; };
    upd();
    addEventListener('scroll', upd, { passive: true });
  }

  /* 3. glare pada CTA */
  document.querySelectorAll('a[data-framer-name="Primary"]').forEach(a => {
    if (getComputedStyle(a).position === 'static') a.style.position = 'relative';
    a.style.overflow = 'hidden';
    a.insertAdjacentHTML('beforeend', '<span class="fx-glare" aria-hidden="true"></span>');
    a.addEventListener('pointerleave', () => {
      const g = a.querySelector('.fx-glare');
      if (!g) return;
      g.style.transition = 'none';
      g.style.transform = 'translateX(-100%)';
    });
  });

  /* 4. akordeon FAQ: spring .3s, satu per satu boleh terbuka */
  document.querySelectorAll('.framer-1ifwjco[data-framer-name="Closed"]').forEach(item => {
    const top = item.querySelector('.framer-h80zy6');
    if (!top) return;
    item.setAttribute('data-open', 'false');
    top.setAttribute('role', 'button');
    top.setAttribute('aria-expanded', 'false');
    const toggle = () => {
      const open = item.getAttribute('data-open') === 'true';
      item.setAttribute('data-open', open ? 'false' : 'true');
      item.setAttribute('data-framer-name', open ? 'Closed' : 'Open');
      top.setAttribute('aria-expanded', String(!open));
    };
    top.addEventListener('click', toggle);
    top.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });

  /* 5. tab Why Switch: strip bisa digeser + ganti varian konten */
  const NAMES = ['Freelancers', 'Studios', 'Agencies', 'Creators', 'Consultants'];
  const section = document.querySelector('[data-framer-name="Why Switch"]');
  const group = section && section.querySelector('.why-var-group');
  const strip = section && section.querySelector('.framer-12mu1d9');
  if (strip && group) {
    const tabs = [...strip.querySelectorAll('[data-highlight]')].filter(x => NAMES.includes(x.innerText.trim()));
    const deactivate = tab => {
      tab.setAttribute('data-framer-name', 'Default');
      tab.style.removeProperty('--border-color');
      tab.style.removeProperty('background-color');
      const p = tab.querySelector('p');
      if (p) { p.style.removeProperty('--extracted-r6o4lv'); p.style.removeProperty('--framer-text-color'); }
    };
    const activate = tab => {
      tab.setAttribute('data-framer-name', 'Active');
      tab.style.setProperty('--border-color', '#0080ff');
      tab.style.setProperty('background-color', 'rgba(0,127.5,255,.039)');
      const p = tab.querySelector('p');
      if (p) { p.style.setProperty('--extracted-r6o4lv', '#0080ff'); p.style.setProperty('--framer-text-color', '#0080ff'); }
    };
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = [...group.children].find(c => c.dataset.var === tab.innerText.trim());
        if (!target) return;
        [...group.children].forEach(c => c.classList.toggle('is-on', c === target));
        tabs.forEach(deactivate);
        activate(tab);
        tab.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    strip.scrollLeft = 0;
    let down = false, startX = 0, startL = 0;
    strip.style.cursor = 'grab';
    strip.addEventListener('pointerdown', e => { down = true; startX = e.clientX; startL = strip.scrollLeft; strip.setPointerCapture(e.pointerId); strip.style.cursor = 'grabbing'; });
    strip.addEventListener('pointermove', e => { if (down) strip.scrollLeft = startL - (e.clientX - startX); });
    strip.addEventListener('pointerup', () => { down = false; strip.style.cursor = 'grab'; });
    strip.addEventListener('wheel', e => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { strip.scrollLeft += e.deltaY; e.preventDefault(); }
    }, { passive: false });
  }

  /* 6. burger → drawer */
  const burger = document.querySelector('[data-framer-name="Burger"]');
  if (burger) {
    burger.setAttribute('role', 'button');
    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', () => {
      const on = document.body.classList.toggle('mobile-open');
      burger.setAttribute('aria-expanded', String(on));
      burger.querySelectorAll('div').forEach((bar, i) => {
        bar.style.transition = 'transform .25s cubic-bezier(.22,1,.36,1)';
        bar.style.transform = on ? (i === 0 ? 'translateY(4px) rotate(45deg)' : 'translateY(-4px) rotate(-45deg)') : 'none';
      });
    });
  }

  /* 7. video mockup: autoplay saat tampak, pause saat keluar */
  document.querySelectorAll('video').forEach(v => {
    v.muted = true; v.playsInline = true; v.autoplay = true;
    if (v.preload === 'none') v.preload = 'auto';
    const tryPlay = () => v.play().catch(() => {});
    if (v.readyState >= 3) tryPlay(); else v.addEventListener('canplay', tryPlay, { once: true });
    if (reduce) return;
    const io = new IntersectionObserver(es => es.forEach(e => {
      e.isIntersecting ? tryPlay() : v.pause();
    }), { threshold: .05 });
    io.observe(v);
  });
})();
