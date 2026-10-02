/* ============================================================
   ALTARIA | Catálogo de propiedades
   ============================================================

   Este archivo es la ÚNICA fuente de datos para el catálogo
   (propiedades.html), la ficha de cada propiedad (propiedad.html)
   y el formulario de reserva (reservar.html). No requiere servidor:
   es un array de JavaScript normal, así que funciona incluso abriendo
   los archivos .html con doble clic.

   CÓMO AGREGAR UNA PROPIEDAD NUEVA
   ---------------------------------
   1. Copia uno de los bloques { ... } de abajo y pégalo antes del
      corchete final "];".
   2. Cambia "id" por un texto corto y único, sin espacios ni tildes
      (ej: "depto-nunoa-2"). Ese id es el que se usa en la URL:
      propiedad.html?id=depto-nunoa-2
   3. Completa nombre, comuna, tipo, capacidad, dormitorios, banos,
      precioDesde (en pesos chilenos, solo el número) y descripcion.
   4. Fotos reales: agrega las rutas de las imágenes dentro de
      "fotos": ["assets/gallery/nombre-1.jpg", "assets/gallery/nombre-2.jpg"].
      Mientras "fotos" esté vacío (fotos: []), la propiedad se muestra
      con el mismo aviso "Fotografía pendiente" que ya se usa en el
      resto del sitio. Nunca se inventan fotos de stock.
   5. fechasNoDisponibles: cada vez que confirmes una reserva a mano
      (por WhatsApp), agrega el rango de fechas acá para que el
      formulario de reserva avise si alguien más intenta pedir esas
      mismas fechas. Formato: { inicio: "AAAA-MM-DD", fin: "AAAA-MM-DD" }.

   SI UNA PROPIEDAD NO APARECE
   ---------------------------
   Le falta "id" o le falta "nombre". El sitio descarta en silencio las
   propiedades sin esos dos campos, en vez de dejar en blanco el catálogo
   entero. Los campos "fotos", "amenities" y "fechasNoDisponibles" pueden
   faltar sin romper nada: se asumen vacíos.

   IMPORTANTE
   ----------
   Las 6 propiedades de abajo son EJEMPLOS de estructura, no propiedades
   reales de ALTARIA. Reemplaza nombre, descripción, precio y fotos por
   la información real antes de publicar el sitio.
   ============================================================ */

const PROPERTIES = [
  {
    id: 'depto-santiago-centro-1',
    nombre: 'Departamento céntrico (ejemplo)',
    comuna: 'Santiago Centro',
    tipo: 'Departamento',
    capacidad: 4,
    dormitorios: 2,
    banos: 1,
    precioDesde: 45000,
    fotos: [],
    amenities: ['Wifi', 'Cocina equipada', 'Aire acondicionado', 'Ascensor'],
    descripcion: 'Texto de ejemplo: acá va la descripción real de la propiedad (ambientes, vista, cercanía a metro/comercio, etc.). Reemplazar antes de publicar.',
    fechasNoDisponibles: []
  },
  {
    id: 'depto-providencia-1',
    nombre: 'Departamento con vista (ejemplo)',
    comuna: 'Providencia',
    tipo: 'Departamento',
    capacidad: 3,
    dormitorios: 1,
    banos: 1,
    precioDesde: 52000,
    fotos: [],
    amenities: ['Wifi', 'Cocina equipada', 'Gimnasio del edificio', 'Estacionamiento'],
    descripcion: 'Texto de ejemplo: acá va la descripción real de la propiedad. Reemplazar antes de publicar.',
    fechasNoDisponibles: [
      { inicio: '2026-08-10', fin: '2026-08-15' }
    ]
  },
  {
    id: 'depto-las-condes-1',
    nombre: 'Departamento familiar (ejemplo)',
    comuna: 'Las Condes',
    tipo: 'Departamento',
    capacidad: 5,
    dormitorios: 2,
    banos: 2,
    precioDesde: 68000,
    fotos: [],
    amenities: ['Wifi', 'Piscina del edificio', 'Estacionamiento', 'Seguridad 24h'],
    descripcion: 'Texto de ejemplo: acá va la descripción real de la propiedad. Reemplazar antes de publicar.',
    fechasNoDisponibles: []
  },
  {
    id: 'casa-vitacura-1',
    nombre: 'Casa con jardín (ejemplo)',
    comuna: 'Vitacura',
    tipo: 'Casa',
    capacidad: 8,
    dormitorios: 4,
    banos: 3,
    precioDesde: 130000,
    fotos: [],
    amenities: ['Wifi', 'Jardín', 'Estacionamiento privado', 'Quincho'],
    descripcion: 'Texto de ejemplo: acá va la descripción real de la propiedad. Reemplazar antes de publicar.',
    fechasNoDisponibles: []
  },
  {
    id: 'depto-nunoa-1',
    nombre: 'Estudio para dos (ejemplo)',
    comuna: 'Ñuñoa',
    tipo: 'Departamento',
    capacidad: 2,
    dormitorios: 1,
    banos: 1,
    precioDesde: 38000,
    fotos: [],
    amenities: ['Wifi', 'Cocina equipada', 'Balcón'],
    descripcion: 'Texto de ejemplo: acá va la descripción real de la propiedad. Reemplazar antes de publicar.',
    fechasNoDisponibles: []
  },
  {
    id: 'depto-la-reina-1',
    nombre: 'Departamento tranquilo (ejemplo)',
    comuna: 'La Reina',
    tipo: 'Departamento',
    capacidad: 4,
    dormitorios: 2,
    banos: 2,
    precioDesde: 55000,
    fotos: [],
    amenities: ['Wifi', 'Cocina equipada', 'Estacionamiento', 'Área verde'],
    descripcion: 'Texto de ejemplo: acá va la descripción real de la propiedad. Reemplazar antes de publicar.',
    fechasNoDisponibles: []
  }
];
