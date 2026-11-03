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
    const io = new IntersectionObserver(es => {
      let n = 0;
      es.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.style.setProperty('--fx-delay', (n++ * 60) + 'ms');
        e.target.classList.add('fx-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    els.forEach(el => io.observe(el));
    /* panel demo pakai appear milik Framer (id 6ttxv6) */
    const ap = document.querySelector('[data-framer-appear-id]');
    if (ap) requestAnimationFrame(() => requestAnimationFrame(() => ap.classList.add('fx-in')));
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
      heroImg.style.transform = `translate(-50%, ${(-9 - y * .05).toFixed(2)}px)`;
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
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

  /* 5. strip tab: geser + pilih */
  const strip = document.querySelector('.framer-12mu1d9');
  if (strip) {
    let down = false, startX = 0, startL = 0;
    strip.style.cursor = 'grab';
    strip.addEventListener('pointerdown', e => { down = true; startX = e.clientX; startL = strip.scrollLeft; strip.setPointerCapture(e.pointerId); strip.style.cursor = 'grabbing'; });
    strip.addEventListener('pointermove', e => { if (down) strip.scrollLeft = startL - (e.clientX - startX); });
    strip.addEventListener('pointerup', () => { down = false; strip.style.cursor = 'grab'; });
    strip.addEventListener('wheel', e => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { strip.scrollLeft += e.deltaY; e.preventDefault(); }
    }, { passive: false });
    strip.querySelectorAll('[data-highlight]').forEach(tab => {
      tab.addEventListener('click', () => {
        strip.querySelectorAll('[data-highlight]').forEach(t => {
          t.classList.remove('framer-v-1ifwjco');
        });
        tab.classList.add('framer-v-1ifwjco');
        tab.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      });
    });
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
    v.muted = true; v.playsInline = true;
    if (v.preload === 'none') v.preload = 'metadata';
    if (reduce) return;
    const io = new IntersectionObserver(es => es.forEach(e => {
      e.isIntersecting ? v.play().catch(() => {}) : v.pause();
    }), { threshold: .15 });
    io.observe(v);
  });
})();
