(() => {
  'use strict';

  if (typeof PROPERTIES === 'undefined') return;

  const params = new URLSearchParams(location.search);

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  }

  function formatPrice(n) {
    return '$' + n.toLocaleString('es-CL');
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

  /* ============================================================
     Catálogo (propiedades.html)
     ============================================================ */
  const grid = document.querySelector('[data-property-grid]');
  if (grid) {
    const select = document.querySelector('[data-comuna-filter]');
    const emptyMsg = document.querySelector('[data-filter-empty]');

    if (select) {
      const comunas = [...new Set(PROPERTIES.map(p => p.comuna))].sort();
      comunas.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        select.appendChild(opt);
      });
    }

    function renderGrid(filterComuna) {
      const list = filterComuna ? PROPERTIES.filter(p => p.comuna === filterComuna) : PROPERTIES;
      grid.innerHTML = list.map(p => `
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
      `).join('');
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
    const featured = PROPERTIES.slice(0, 3);
    teaser.innerHTML = featured.map(p => `
      <div class="gallery-card" tabindex="0">
        <div class="gallery-face gallery-front">
          <div class="gallery-photo${p.fotos.length ? '' : ' is-empty'}">
            ${propertyPhotoMarkup(p)}
          </div>
        </div>
        <div class="gallery-face gallery-back">
          <span class="folio-label">Folio</span>
          <ul class="folio-fields folio-fields-mini">
            <li><span>Comuna</span><span class="folio-value">${p.comuna}</span></li>
            <li><span>Tipo</span><span class="folio-value">${p.tipo}</span></li>
            <li><span>Desde</span><span class="folio-value">${formatPrice(p.precioDesde)}</span></li>
          </ul>
        </div>
      </div>
    `).join('');
  }

  /* ============================================================
     Ficha de propiedad (propiedad.html)
     ============================================================ */
  const detailRoot = document.querySelector('[data-property-detail]');
  if (detailRoot) {
    const id = params.get('id');
    const property = PROPERTIES.find(p => p.id === id);
    const notFound = document.querySelector('[data-property-not-found]');

    if (!property) {
      detailRoot.hidden = true;
      if (notFound) notFound.hidden = false;
    } else {
      document.title = `${property.nombre} — Novahost`;

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

    PROPERTIES.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.nombre} — ${p.comuna}`;
      propertySelect.appendChild(opt);
    });

    const preselected = params.get('propiedad');
    if (preselected && PROPERTIES.some(p => p.id === preselected)) {
      propertySelect.value = preselected;
    }

    const today = new Date().toISOString().slice(0, 10);
    checkinInput.min = today;

    function currentProperty() {
      return PROPERTIES.find(p => p.id === propertySelect.value);
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

      setText('[data-folio-property]', property ? property.nombre : '—');
      setText('[data-folio-fechas]', (checkin && checkout) ? `${checkin} → ${checkout}` : '—');
      setText('[data-folio-noches]', n ? `${n} noche${n === 1 ? '' : 's'}` : '—');
      setText('[data-folio-huespedes]', guestsInput.value || '—');
      setText('[data-folio-nombre]', nameInput.value || '—');
    }

    function validate() {
      hideAlert();
      const property = currentProperty();
      const checkin = checkinInput.value;
      const checkout = checkoutInput.value;

      if (!property || !checkin || !checkout || !guestsInput.value || !nameInput.value || !phoneInput.value) {
        showAlert('Completa los campos obligatorios antes de enviar tu solicitud.');
        return false;
      }
      if (new Date(checkout) <= new Date(checkin)) {
        showAlert('La fecha de salida debe ser posterior a la fecha de llegada.');
        return false;
      }
      const conflict = (property.fechasNoDisponibles || []).some(r =>
        rangesOverlap(checkin, checkout, r.inicio, r.fin)
      );
      if (conflict) {
        showAlert('Esas fechas ya están tomadas para esta propiedad. Prueba con otro rango o escríbenos para revisar alternativas.');
        return false;
      }
      return true;
    }

    checkinInput.addEventListener('change', () => {
      if (checkinInput.value) {
        const next = new Date(checkinInput.value);
        next.setDate(next.getDate() + 1);
        checkoutInput.min = next.toISOString().slice(0, 10);
      }
    });

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
        'Hola, quiero solicitar una reserva en Novahost:',
        `Propiedad: ${property.nombre} (${property.comuna})`,
        `Llegada: ${checkinInput.value}`,
        `Salida: ${checkoutInput.value} (${n} noche${n === 1 ? '' : 's'})`,
        `Huéspedes: ${guestsInput.value}`,
        `Nombre: ${nameInput.value}`,
        `Teléfono: ${phoneInput.value}`,
        emailInput.value ? `Email: ${emailInput.value}` : null,
        noteInput.value ? `Comentario: ${noteInput.value}` : null
      ].filter(Boolean).join('\n');

      window.open(novahostWhatsAppLink(message), '_blank', 'noopener');
    });
  }
})();
