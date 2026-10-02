/* ============================================================
   ALTARIA: configuración compartida de WhatsApp
   Usado por script.js (CTA genérico) y booking.js (reservas).
   Editar el teléfono acá cuando el cliente confirme el número real.
   ============================================================ */
const ALTARIA_WHATSAPP = {
  phone: '56900000000' // TODO: reemplazar por el número real de ALTARIA
};

function altariaWhatsAppLink(message) {
  return `https://wa.me/${ALTARIA_WHATSAPP.phone}?text=${encodeURIComponent(message)}`;
}
