/* ============================================================
   NOVAHOST: comportamiento del sitio

   Sin dependencias externas: los reveals usan IntersectionObserver
   y las animaciones viven en CSS. El teléfono de WhatsApp está en
   assets/config.js (compartido con booking.js).
   ============================================================ */
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     Contacto
     ============================================================ */
  const DEFAULT_WHATSAPP_MESSAGE =
    'Hola, quiero cotizar la administración de mi propiedad en arriendo de corto plazo.';

  if (typeof novahostWhatsAppLink === 'function') {
    const waHref = novahostWhatsAppLink(DEFAULT_WHATSAPP_MESSAGE);
    document.querySelectorAll('[data-cta]').forEach(el => { el.href = waHref; });
  }

  /* ============================================================
     Header y barra de acción móvil
     ============================================================ */
  const header = document.querySelector('[data-header]');
  const mobileCta = document.querySelector('[data-mobile-cta]');

  function syncScrollState() {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-stuck', y > 8);
    if (mobileCta) {
      const navOpen = document.body.classList.contains('nav-open');
      mobileCta.classList.toggle('is-visible', y > 420 && !navOpen);
    }
  }
  syncScrollState();
  window.addEventListener('scroll', syncScrollState, { passive: true });

  /* ============================================================
     Menú móvil
     ============================================================ */
  const navToggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    const setNavOpen = (open) => {
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      mobileNav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      syncScrollState();
    };

    navToggle.addEventListener('click', () => {
      const abrir = navToggle.getAttribute('aria-expanded') !== 'true';
      setNavOpen(abrir);
      if (abrir) {
        const primero = mobileNav.querySelector('a, button');
        if (primero) primero.focus();
      }
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setNavOpen(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        setNavOpen(false);
        navToggle.focus();
      }
    });

    const desktop = window.matchMedia('(min-width: 900px)');
    desktop.addEventListener('change', (event) => {
      if (event.matches) setNavOpen(false);
    });
  }

  /* ============================================================
     Entrada del hero
     ============================================================ */
  const heroTitle = document.querySelector('[data-hero-title]');
  const heroReveals = document.querySelectorAll('.hero [data-reveal]');

  function playHero() {
    if (heroTitle) heroTitle.classList.add('is-in');
    heroReveals.forEach((el, i) => {
      setTimeout(() => el.classList.add('is-visible'), prefersReducedMotion ? 0 : 420 + i * 110);
    });
  }

  // setTimeout y no requestAnimationFrame: en una pestaña en segundo plano
  // rAF no corre y el hero se quedaría invisible hasta que la enfoquen.
  setTimeout(playHero, prefersReducedMotion ? 0 : 60);

  /* ============================================================
     Panel de ocupación: elemento firma del hero

     Dibuja el mes en curso y marca las noches reservadas. Las
     cifras se derivan del mismo calendario para que el ejemplo
     sea internamente consistente.
     ============================================================ */
  const cal = document.querySelector('[data-panel-cal]');

  if (cal) {
    const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const OCUPACION = 0.87;          // tasa del ejemplo
    const TARIFA_EJEMPLO = 53000;    // CLP por noche, solo para el ejemplo

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // lunes primero

    const booked = Math.round(daysInMonth * OCUPACION);
    const freeCount = daysInMonth - booked;

    // Noches libres repartidas de forma pareja por el mes
    const freeDays = new Set();
    for (let i = 0; i < freeCount; i++) {
      const day = Math.floor((i + 0.5) * daysInMonth / freeCount) + 1;
      freeDays.add(Math.min(day, daysInMonth));
    }

    const frag = document.createDocumentFragment();

    DOW.forEach(d => {
      const head = document.createElement('span');
      head.className = 'cal-dow';
      head.textContent = d;
      frag.appendChild(head);
    });

    for (let i = 0; i < firstDow; i++) {
      const blank = document.createElement('i');
      blank.className = 'cal-cell is-out';
      frag.appendChild(blank);
    }

    const bookedCells = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('i');
      cell.className = 'cal-cell';
      if (day === now.getDate()) cell.classList.add('is-today');
      if (!freeDays.has(day)) bookedCells.push(cell);
      frag.appendChild(cell);
    }

    const trailing = (7 - ((firstDow + daysInMonth) % 7)) % 7;
    for (let i = 0; i < trailing; i++) {
      const blank = document.createElement('i');
      blank.className = 'cal-cell is-out';
      frag.appendChild(blank);
    }

    cal.appendChild(frag);

    if (prefersReducedMotion) {
      bookedCells.forEach(cell => cell.classList.add('is-booked'));
    } else {
      bookedCells.forEach((cell, i) => {
        setTimeout(() => cell.classList.add('is-booked'), 700 + i * 34);
      });
    }

    /* Cifras derivadas del calendario, para que el ejemplo cuadre */
    const setStat = (selector, value) => {
      const el = document.querySelector('.panel-stats ' + selector);
      if (el) el.dataset.count = String(value);
    };
    setStat('[data-count-suffix="%"]', Math.round((booked / daysInMonth) * 100));
    setStat('dd:not([data-count-suffix]):not([data-count-format])', booked);
    setStat('[data-count-format="clp"]', booked * TARIFA_EJEMPLO);
  }

  /* ============================================================
     Contadores del panel
     ============================================================ */
  function formatCount(value, el) {
    const suffix = el.dataset.countSuffix || '';
    if (el.dataset.countFormat === 'clp') {
      return '$' + Math.round(value).toLocaleString('es-CL') + suffix;
    }
    return Math.round(value).toLocaleString('es-CL') + suffix;
  }

  document.querySelectorAll('[data-count]').forEach(el => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;

    const finish = () => { el.textContent = formatCount(target, el); };

    if (prefersReducedMotion) {
      finish();
      return;
    }

    const duration = 1400;
    const delay = 900;
    let startedAt = null;
    let frame = null;
    let done = false;

    const step = (now) => {
      if (startedAt === null) startedAt = now;
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatCount(target * eased, el);
      if (progress < 1) frame = requestAnimationFrame(step);
      else done = true;
    };

    setTimeout(() => { frame = requestAnimationFrame(step); }, delay);

    // Si la pestaña estuvo en segundo plano, rAF no avanza: dejamos la cifra final
    setTimeout(() => {
      if (done) return;
      if (frame) cancelAnimationFrame(frame);
      finish();
    }, delay + duration + 1200);
  });
})();
