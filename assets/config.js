/* ============================================================
   NOVAHOST — Configuración compartida de WhatsApp
   Usado por script.js (CTA genérico) y booking.js (reservas).
   Editar el teléfono acá cuando el cliente confirme el número real.
   ============================================================ */
const NOVAHOST_WHATSAPP = {
  phone: '56900000000' // TODO: reemplazar por el número real de Novahost
};

function novahostWhatsAppLink(message) {
  return `https://wa.me/${NOVAHOST_WHATSAPP.phone}?text=${encodeURIComponent(message)}`;
}
