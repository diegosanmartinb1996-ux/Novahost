(() => {
  'use strict';

  /* ============================================================
     Contacto — editar acá cuando el cliente confirme el número real
     ============================================================ */
  const WHATSAPP = {
    phone: '56900000000', // TODO: reemplazar por el número real de Novahost
    message: 'Hola, quiero cotizar la administración de mi propiedad en arriendo de corto plazo.'
  };
  const waHref = `https://wa.me/${WHATSAPP.phone}?text=${encodeURIComponent(WHATSAPP.message)}`;
  document.querySelectorAll('[data-cta]').forEach(el => { el.href = waHref; });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     Reveal genérico al hacer scroll
     ============================================================ */
  if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) {
    document.querySelectorAll('[data-reveal], [data-reveal-group] > *').forEach(el => el.classList.add('is-visible'));
  } else {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('[data-reveal]').forEach(el => {
      if (el.closest('.hero')) return; // el hero lo anima el timeline de entrada, no el scroll
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => el.classList.add('is-visible')
      });
    });

    document.querySelectorAll('[data-reveal-group]').forEach(group => {
      const items = group.children;
      ScrollTrigger.create({
        trigger: group,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          Array.from(items).forEach((el, i) => {
            setTimeout(() => el.classList.add('is-visible'), i * 90);
          });
        }
      });
    });
  }

  /* ============================================================
     Momento firma — el Folio se arma en el hero al cargar
     ============================================================ */
  const folio = document.querySelector('[data-folio]');
  if (folio) {
    if (prefersReducedMotion || !window.gsap) {
      folio.querySelectorAll('[data-folio-rule]').forEach(el => el.classList.add('is-drawn'));
      folio.querySelectorAll('[data-folio-field]').forEach(el => el.classList.add('is-visible'));
      const seal = folio.querySelector('[data-folio-seal]');
      if (seal) seal.classList.add('is-visible');
    } else {
      const rules = folio.querySelectorAll('[data-folio-rule]');
      const fields = folio.querySelectorAll('[data-folio-field]');
      const seal = folio.querySelector('[data-folio-seal]');
      const caption = document.querySelector('[data-folio-caption]');
      const heroLines = document.querySelectorAll('[data-hero-title] .line');

      gsap.set(folio, { autoAlpha: 0, y: 24 });
      gsap.set(caption, { autoAlpha: 0 });
      gsap.set(heroLines, { yPercent: 110 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to(heroLines, { yPercent: 0, duration: 1, stagger: 0.09 })
        .to('.hero-copy .eyebrow, .hero-sub, .hero-actions, .hero-trust', {
          opacity: 1, y: 0, duration: 0.8
        }, '-=0.7')
        .to(caption, { autoAlpha: 1, duration: 0.6 }, '-=0.5')
        .to(folio, { autoAlpha: 1, y: 0, duration: 0.9 }, '-=0.4')
        .addLabel('folioBuild')
        .to(rules[0], { scaleX: 1, duration: 0.7 }, 'folioBuild')
        .to(Array.from(fields), {
          opacity: 1, y: 0, duration: 0.5, stagger: 0.12
        }, 'folioBuild+=0.15')
        .to(rules[1], { scaleX: 1, duration: 0.7 }, 'folioBuild+=0.7')
        .to(seal, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2.4)' }, 'folioBuild+=0.95');
    }
  }

  /* ============================================================
     Galería — tap para dar vuelta la tarjeta en pantallas táctiles
     ============================================================ */
  document.querySelectorAll('.gallery-card').forEach(card => {
    card.addEventListener('click', () => {
      const isTouch = window.matchMedia('(hover: none)').matches;
      if (isTouch) card.classList.toggle('is-flipped');
    });
  });
})();
