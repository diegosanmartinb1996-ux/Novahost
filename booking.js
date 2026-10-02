(() => {
  'use strict';

  if (typeof PROPERTIES === 'undefined') return;

  /* properties.js se edita a mano. Una propiedad a la que le falte una
     clave no puede tumbar el catálogo, la ficha y el formulario a la vez:
     las que no traen id ni nombre se descartan y al resto se le completan
     las listas vacías. */
  const PROPS = (Array.isArray(PROPERTIES) ? PROPERTIES : [])
    .filter(p => p && p.id && p.nombre)
    .map(p => ({
      ...p,
      fotos: Array.isArray(p.fotos) ? p.fotos : [],
      amenities: Array.isArray(p.amenities) ? p.amenities : [],
      fechasNoDisponibles: Array.isArray(p.fechasNoDisponibles) ? p.fechasNoDisponibles : []
    }));

  const params = new URLSearchParams(location.search);

  /* Hoy en hora local. toISOString() entrega fecha UTC y en Chile, de noche,
     adelanta un día: el huésped no podía pedir llegada para hoy. */
  function hoyLocal() {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'),
            String(d.getDate()).padStart(2, '0')].join('-');
  }

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  }

  function formatPrice(n) {
    return '$' + n.toLocaleString('es-CL');
  }

  function fechaCorta(iso) {
    const [a, m, d] = iso.split('-').map(Number);
    const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return `${d} ${meses[m - 1]}`;
  }

  function nights(checkin, checkout) {
    const a = new Date(checkin);
    const b = new Date(checkout);
    return Math.round((b - a) / 86400000);
  }

  function rangesOverlap(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
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
            <span class="price-label">Desde</span>
            <span class="price-value">${formatPrice(p.precioDesde)}/noche</span>
          </div>
          <a class="property-card-link" href="propiedad.html?id=${p.id}">Ver propiedad</a>
        </div>
      </article>
    `;
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
      }

      setText('[data-property-nombre]', property.nombre);
      setText('[data-property-comuna]', property.comuna);
      setText('[data-property-precio]', `${formatPrice(property.precioDesde)} / noche`);
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

      const cta = document.querySelector('[data-property-cta]');
      if (cta) cta.href = `reservar.html?propiedad=${property.id}`;
    }
  }

  /* ============================================================
     Formulario de reserva (reservar.html)
     ============================================================ */
  const bookingForm = document.querySelector('[data-booking-form]');
  if (bookingForm) {
    const propertySelect = document.querySelector('[data-booking-property]');
    const checkinInput = document.querySelector('[data-booking-checkin]');
    const checkoutInput = document.querySelector('[data-booking-checkout]');
    const guestsInput = document.querySelector('[data-booking-guests]');
    const nameInput = document.querySelector('[data-booking-name]');
    const phoneInput = document.querySelector('[data-booking-phone]');
    const emailInput = document.querySelector('[data-booking-email]');
    const noteInput = document.querySelector('[data-booking-note]');
    const alertBox = document.querySelector('[data-booking-alert]');

    PROPS.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.nombre} · ${p.comuna}`;
      propertySelect.appendChild(opt);
    });

    const preselected = params.get('propiedad');
    if (preselected && PROPS.some(p => p.id === preselected)) {
      propertySelect.value = preselected;
    }

    checkinInput.min = hoyLocal();

    function sincronizarMinimoSalida() {
      if (!checkinInput.value) return;
      const next = new Date(checkinInput.value + 'T00:00:00');
      next.setDate(next.getDate() + 1);
      checkoutInput.min = [next.getFullYear(), String(next.getMonth() + 1).padStart(2, '0'),
                           String(next.getDate()).padStart(2, '0')].join('-');
    }

    function currentProperty() {
      return PROPS.find(p => p.id === propertySelect.value);
    }

    function hideAlert() {
      alertBox.classList.remove('is-visible');
      alertBox.textContent = '';
    }

    function showAlert(message) {
      alertBox.textContent = message;
      alertBox.classList.add('is-visible');
    }

    function updateFolio() {
      const property = currentProperty();
      const checkin = checkinInput.value;
      const checkout = checkoutInput.value;
      const validRange = checkin && checkout && new Date(checkout) > new Date(checkin);
      const n = validRange ? nights(checkin, checkout) : null;

      setText('[data-folio-property]', property ? property.nombre : 'Pendiente');
      setText('[data-folio-fechas]', (checkin && checkout) ? `${fechaCorta(checkin)} al ${fechaCorta(checkout)}` : 'Pendiente');
      setText('[data-folio-noches]', n ? `${n} noche${n === 1 ? '' : 's'}` : 'Pendiente');
      setText('[data-folio-huespedes]', guestsInput.value || 'Pendiente');
      setText('[data-folio-nombre]', nameInput.value || 'Pendiente');
    }

    const OBLIGATORIOS = [
      [propertySelect, 'Elige una propiedad.'],
      [checkinInput, 'Indica la fecha de llegada.'],
      [checkoutInput, 'Indica la fecha de salida.'],
      [guestsInput, 'Indica cuántos huéspedes llegan.'],
      [nameInput, 'Escribe tu nombre.'],
      [phoneInput, 'Escribe un teléfono de contacto.']
    ];

    function limpiarMarcas() {
      OBLIGATORIOS.forEach(([campo]) => campo.removeAttribute('aria-invalid'));
    }

    function marcar(campo, mensaje) {
      campo.setAttribute('aria-invalid', 'true');
      showAlert(mensaje);
      campo.focus();
    }

    function validate() {
      hideAlert();
      limpiarMarcas();
      const property = currentProperty();
      const checkin = checkinInput.value;
      const checkout = checkoutInput.value;

      const faltante = OBLIGATORIOS.find(([campo]) => !campo.value);
      if (faltante) {
        marcar(faltante[0], faltante[1]);
        return false;
      }
      if (!property) {
        marcar(propertySelect, 'Elige una propiedad.');
        return false;
      }
      if (new Date(checkout) <= new Date(checkin)) {
        marcar(checkoutInput, 'La fecha de salida debe ser posterior a la de llegada.');
        return false;
      }
      const conflict = (property.fechasNoDisponibles || []).some(r =>
        rangesOverlap(checkin, checkout, r.inicio, r.fin)
      );
      if (conflict) {
        marcar(checkinInput, 'Esas fechas ya están tomadas para esta propiedad. Prueba con otro rango o escríbenos para revisar alternativas.');
        return false;
      }
      return true;
    }

    checkinInput.addEventListener('change', sincronizarMinimoSalida);
    sincronizarMinimoSalida();

    [propertySelect, checkinInput, checkoutInput, guestsInput, nameInput].forEach(el => {
      el.addEventListener('input', updateFolio);
      el.addEventListener('change', updateFolio);
    });
    updateFolio();

    bookingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validate()) return;

      const property = currentProperty();
      const n = nights(checkinInput.value, checkoutInput.value);
      const message = [
        'Hola, quiero solicitar una reserva en ALTARIA:',
        `Propiedad: ${property.nombre} (${property.comuna})`,
        `Llegada: ${checkinInput.value}`,
        `Salida: ${checkoutInput.value} (${n} noche${n === 1 ? '' : 's'})`,
        `Huéspedes: ${guestsInput.value}`,
        `Nombre: ${nameInput.value}`,
        `Teléfono: ${phoneInput.value}`,
        emailInput.value ? `Email: ${emailInput.value}` : null,
        noteInput.value ? `Comentario: ${noteInput.value}` : null
      ].filter(Boolean).join('\n');

      const ventana = window.open(altariaWhatsAppLink(message), '_blank', 'noopener');
      if (!ventana) mostrarRespaldo(message);
    });

    /* Respaldo cuando el navegador bloquea la ventana emergente o el
       dispositivo no tiene WhatsApp instalado. */
    function mostrarRespaldo(message) {
      let caja = document.querySelector('[data-booking-fallback]');
      if (!caja) {
        caja = document.createElement('div');
        caja.className = 'booking-fallback';
        caja.setAttribute('data-booking-fallback', '');
        bookingForm.appendChild(caja);
      }
      caja.innerHTML = '';

      const titulo = document.createElement('p');
      titulo.className = 'booking-fallback-title';
      titulo.textContent = 'Tu navegador bloqueó la ventana de WhatsApp.';

      const ayuda = document.createElement('p');
      ayuda.textContent = 'Copia el texto de tu solicitud y envíanoslo por WhatsApp.';

      const texto = document.createElement('textarea');
      texto.readOnly = true;
      texto.rows = 8;
      texto.value = message;

      const copiar = document.createElement('button');
      copiar.type = 'button';
      copiar.className = 'btn btn-ghost';
      copiar.textContent = 'Copiar solicitud';
      copiar.addEventListener('click', () => {
        texto.select();
        try {
          navigator.clipboard ? navigator.clipboard.writeText(message) : document.execCommand('copy');
          copiar.textContent = 'Copiada';
        } catch (e) {
          copiar.textContent = 'Selecciona el texto y cópialo';
        }
      });

      const abrir = document.createElement('a');
      abrir.className = 'btn btn-primary';
      abrir.href = altariaWhatsAppLink(message);
      abrir.target = '_blank';
      abrir.rel = 'noopener';
      abrir.textContent = 'Abrir WhatsApp';

      const acciones = document.createElement('div');
      acciones.className = 'booking-fallback-actions';
      acciones.append(abrir, copiar);

      caja.append(titulo, ayuda, texto, acciones);
      caja.scrollIntoView({ block: 'nearest' });
    }
  }
})();
