(() => {
  'use strict';

  if (typeof PROPERTIES === 'undefined') return;

  /* properties.js se edita a mano. Una propiedad a la que le falte una
     clave no puede tumbar el catálogo y la ficha a la vez: las que no
     traen id ni nombre se descartan y al resto se le completan los campos
     vacíos. El enlace de Airbnb solo se acepta si empieza con https://
     y el precio, si no es un número mayor que cero, queda sin publicar. */
  const PROPS = (Array.isArray(PROPERTIES) ? PROPERTIES : [])
    .filter(p => p && p.id && p.nombre)
    .map(p => ({
      ...p,
      fotos: Array.isArray(p.fotos) ? p.fotos : [],
      amenities: Array.isArray(p.amenities) ? p.amenities : [],
      precioDesde: Number(p.precioDesde) > 0 ? Number(p.precioDesde) : null,
      airbnb: typeof p.airbnb === 'string' && /^https:\/\//.test(p.airbnb.trim()) ? p.airbnb.trim() : ''
    }));

  const params = new URLSearchParams(location.search);

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  }

  function formatPrice(n) {
    return '$' + n.toLocaleString('es-CL');
  }

  function propertyPhotoMarkup(property) {
    if (property.fotos && property.fotos.length) {
      return `<img src="${property.fotos[0]}" alt="${property.nombre}" loading="lazy">`;
    }
    return `<span class="gallery-photo-icon" aria-hidden="true">✷</span><span>Fotografía pendiente</span>`;
  }

  /* Una sola tarjeta para el catálogo y para el adelanto del inicio */
  function propertyCardMarkup(p) {
    return `
      <article class="property-card">
        <div class="gallery-photo${p.fotos.length ? '' : ' is-empty'}">
          ${propertyPhotoMarkup(p)}
        </div>
        <div class="property-card-body">
          <p class="property-card-comuna">${p.comuna}</p>
          <h3>${p.nombre}</h3>
          <div class="property-card-meta">
            <span>${p.tipo}</span>
            <span>${p.capacidad} huéspedes</span>
            <span>${p.dormitorios} dorm.</span>
          </div>
          <div class="property-card-price">
            ${p.precioDesde
              ? `<span class="price-label">Desde</span><span class="price-value">${formatPrice(p.precioDesde)}/noche</span>`
              : `<span class="price-label">Precio</span><span class="price-value">Según fechas</span>`}
          </div>
          <a class="property-card-link" href="propiedad.html?id=${p.id}">Ver propiedad</a>
        </div>
      </article>
    `;
  }

  /* Galería de la ficha: foto grande con flechas y una tira de
     miniaturas. Cada foto puede tener su miniatura con el sufijo -mini
     (foto-01.jpg → foto-01-mini.jpg); si no existe, se usa la foto
     completa. */
  const FLECHA = (trazo) =>
    `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${trazo}"/></svg>`;

  function miniatura(src) {
    return src.replace(/(\.[a-z0-9]+)$/i, '-mini$1');
  }

  function montarGaleria(photoEl, property) {
    const fotos = property.fotos;
    const total = fotos.length;
    const img = photoEl.querySelector('img');
    const tira = document.querySelector('[data-property-thumbs]');
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let actual = 0;

    photoEl.classList.add('is-gallery');
    img.loading = 'eager';

    const boton = (clase, etiqueta, trazo) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'property-photo-nav ' + clase;
      b.setAttribute('aria-label', etiqueta);
      b.innerHTML = FLECHA(trazo);
      return b;
    };
    const anterior = boton('is-prev', 'Foto anterior', 'M12.5 4.5 7 10l5.5 5.5');
    const siguiente = boton('is-next', 'Foto siguiente', 'M7.5 4.5 13 10l-5.5 5.5');
    const contador = document.createElement('span');
    contador.className = 'property-photo-count';
    contador.setAttribute('aria-live', 'polite');
    photoEl.append(anterior, siguiente, contador);

    const miniaturas = fotos.map((src, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'property-thumb';
      b.setAttribute('aria-label', `Ver foto ${i + 1} de ${total}`);
      const m = document.createElement('img');
      m.alt = '';
      m.loading = 'lazy';
      m.decoding = 'async';
      m.addEventListener('error', () => { m.src = src; }, { once: true });
      m.src = miniatura(src);
      b.appendChild(m);
      b.addEventListener('click', () => mostrar(i));
      li.appendChild(b);
      return li;
    });
    if (tira) {
      tira.append(...miniaturas);
      tira.hidden = false;
    }

    function mostrar(i) {
      actual = (i + total) % total;
      img.src = fotos[actual];
      img.alt = `${property.nombre}, foto ${actual + 1} de ${total}`;
      contador.textContent = `${actual + 1} / ${total}`;
      miniaturas.forEach((li, j) => li.firstChild.setAttribute('aria-current', String(j === actual)));
      if (tira) {
        const li = miniaturas[actual];
        tira.scrollTo({ left: li.offsetLeft - (tira.clientWidth - li.offsetWidth) / 2, behavior: suave ? 'smooth' : 'auto' });
      }
      // Precarga la siguiente para que el cambio sea inmediato
      new Image().src = fotos[(actual + 1) % total];
    }

    anterior.addEventListener('click', () => mostrar(actual - 1));
    siguiente.addEventListener('click', () => mostrar(actual + 1));

    // Flechas del teclado y deslizamiento con el dedo
    photoEl.parentElement.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); mostrar(actual - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); mostrar(actual + 1); }
    });
    let inicioX = null;
    photoEl.addEventListener('touchstart', (e) => { inicioX = e.touches[0].clientX; }, { passive: true });
    photoEl.addEventListener('touchend', (e) => {
      if (inicioX === null) return;
      const dx = e.changedTouches[0].clientX - inicioX;
      inicioX = null;
      if (Math.abs(dx) > 40) mostrar(actual + (dx < 0 ? 1 : -1));
    });

    mostrar(0);
  }

  /* ============================================================
     Catálogo (propiedades.html)
     ============================================================ */
  const grid = document.querySelector('[data-property-grid]');
  if (grid) {
    const select = document.querySelector('[data-comuna-filter]');
    const emptyMsg = document.querySelector('[data-filter-empty]');

    if (select) {
      const comunas = [...new Set(PROPS.map(p => p.comuna))].sort();
      comunas.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        select.appendChild(opt);
      });
    }

    function renderGrid(filterComuna) {
      const list = filterComuna ? PROPS.filter(p => p.comuna === filterComuna) : PROPS;
      grid.innerHTML = list.map(propertyCardMarkup).join('');
      if (emptyMsg) emptyMsg.hidden = list.length > 0;
    }

    renderGrid(select ? select.value : '');
    if (select) select.addEventListener('change', () => renderGrid(select.value));
  }

  /* ============================================================
     Teaser de propiedades (index.html)
     ============================================================ */
  const teaser = document.querySelector('[data-property-teaser]');
  if (teaser) {
    teaser.innerHTML = PROPS.slice(0, 3).map(propertyCardMarkup).join('');
  }

  /* ============================================================
     Ficha de propiedad (propiedad.html)
     ============================================================ */
  const detailRoot = document.querySelector('[data-property-detail]');
  if (detailRoot) {
    const id = params.get('id');
    const property = PROPS.find(p => p.id === id);
    const notFound = document.querySelector('[data-property-not-found]');

    if (!property) {
      detailRoot.hidden = true;
      if (notFound) notFound.hidden = false;
    } else {
      document.title = `${property.nombre} | ALTARIA`;

      /* La tarjeta de WhatsApp: sin esto, compartir una ficha concreta
         mostraba el título genérico y el enlace del catálogo. */
      const meta = (sel, valor) => {
        const el = document.querySelector(sel);
        if (el && valor) el.setAttribute('content', valor);
      };
      meta('meta[property="og:title"]', `${property.nombre}, ${property.comuna} | ALTARIA`);
      meta('meta[name="twitter:title"]', `${property.nombre}, ${property.comuna} | ALTARIA`);
      meta('meta[property="og:url"]', location.href);
      if (property.descripcion) {
        meta('meta[property="og:description"]', property.descripcion);
        meta('meta[name="twitter:description"]', property.descripcion);
        meta('meta[name="description"]', property.descripcion);
      }
      if (property.fotos.length) {
        const foto = new URL(property.fotos[0], location.href).href;
        meta('meta[property="og:image"]', foto);
        meta('meta[name="twitter:image"]', foto);
      }

      const photoEl = document.querySelector('[data-property-photo]');
      if (photoEl) {
        photoEl.classList.toggle('is-empty', !property.fotos.length);
        photoEl.innerHTML = propertyPhotoMarkup(property);
        if (property.fotos.length > 1) montarGaleria(photoEl, property);
      }

      setText('[data-property-nombre]', property.nombre);
      setText('[data-property-comuna]', property.comuna);
      setText('[data-property-precio]', property.precioDesde
        ? `${formatPrice(property.precioDesde)} / noche`
        : 'Según tus fechas, en Airbnb');
      setText('[data-property-desc]', property.descripcion);

      const chips = document.querySelector('[data-property-chips]');
      if (chips) {
        chips.innerHTML = [
          property.tipo,
          `${property.capacidad} huéspedes`,
          `${property.dormitorios} dormitorios`,
          `${property.banos} baños`
        ].map(c => `<li>${c}</li>`).join('');
      }

      const amenities = document.querySelector('[data-property-amenities]');
      if (amenities) {
        amenities.innerHTML = property.amenities.map(a => `<li>${a}</li>`).join('');
      }

      /* Las reservas se hacen en Airbnb. Si la propiedad aún no tiene su
         enlace, el botón abre WhatsApp para consultar por ella. */
      document.querySelectorAll('[data-property-cta]').forEach(cta => {
        if (property.airbnb) {
          cta.href = property.airbnb;
          cta.target = '_blank';
          cta.rel = 'noopener';
          cta.textContent = 'Reservar en Airbnb';
        } else if (typeof altariaWhatsAppLink === 'function') {
          cta.href = altariaWhatsAppLink(`Hola ALTARIA, quiero reservar ${property.nombre} en ${property.comuna}.`);
          cta.textContent = 'Consultar disponibilidad';
        }
      });
    }
  }
})();
