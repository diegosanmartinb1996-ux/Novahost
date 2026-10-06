/* ============================================================
   ALTARIA | Catálogo de propiedades
   ============================================================

   Este archivo es la ÚNICA fuente de datos para el catálogo
   (propiedades.html) y la ficha de cada propiedad (propiedad.html).
   No requiere servidor:
   es un array de JavaScript normal, así que funciona incluso abriendo
   los archivos .html con doble clic.

   CÓMO AGREGAR UNA PROPIEDAD NUEVA
   ---------------------------------
   1. Copia un bloque { ... } de abajo y pégalo antes del corchete
      final "];". Separa cada bloque del siguiente con una coma.
   2. Cambia "id" por un texto corto y único, sin espacios ni tildes
      (ej: "depto-nunoa-2"). Ese id es el que se usa en la URL:
      propiedad.html?id=depto-nunoa-2
   3. Completa nombre, comuna, tipo, capacidad, dormitorios, banos y
      descripcion.
   4. precioDesde es opcional (en pesos chilenos, solo el número). Como
      en Airbnb el precio cambia según las fechas, conviene dejarlo en
      null: la web muestra "Según fechas" en vez de un precio que puede
      quedar desactualizado.
   5. Fotos reales: agrega las rutas de las imágenes dentro de
      "fotos": ["assets/gallery/nombre-1.jpg", "assets/gallery/nombre-2.jpg"].
      La primera es la portada de la tarjeta y de la ficha; con más de
      una, la ficha muestra una galería. Para que cargue rápido, cada
      foto puede tener una miniatura de 240 px de ancho con el mismo
      nombre terminado en -mini (nombre-1-mini.jpg). Si no está, la
      galería usa la foto completa.
      Mientras "fotos" esté vacío (fotos: []), la propiedad se muestra
      con el mismo aviso "Fotografía pendiente" que ya se usa en el
      resto del sitio. Nunca se inventan fotos de stock.
   6. airbnb: el enlace del anuncio en Airbnb, completo y con https://,
      sin lo que viene después del "?" al compartirlo. Las reservas se
      hacen solo en Airbnb, para que cada estadía quede cubierta por su
      protección. El botón de la ficha lleva a ese enlace. Mientras esté
      vacío (airbnb: ''), el botón abre WhatsApp para consultar.

   SI UNA PROPIEDAD NO APARECE
   ---------------------------
   Le falta "id" o le falta "nombre". El sitio descarta en silencio las
   propiedades sin esos dos campos, en vez de dejar en blanco el catálogo
   entero. Los campos "precioDesde", "fotos", "amenities" y "airbnb"
   pueden faltar sin romper nada: se asumen vacíos.

   IMPORTANTE
   ----------
   Todo lo que está en esta lista se publica en la web. Agrega solo
   propiedades reales que administre ALTARIA.
   ============================================================ */

const PROPERTIES = [
  {
    id: 'depto-las-condes-el-golf-1',
    nombre: 'A pasos de Costanera Center, con estacionamiento',
    comuna: 'Las Condes',
    tipo: 'Departamento',
    capacidad: 4,
    dormitorios: 2,
    banos: 2,
    precioDesde: null,
    fotos: [
      'assets/gallery/las-condes-el-golf-01.jpg',
      'assets/gallery/las-condes-el-golf-02.jpg',
      'assets/gallery/las-condes-el-golf-03.jpg',
      'assets/gallery/las-condes-el-golf-04.jpg',
      'assets/gallery/las-condes-el-golf-05.jpg',
      'assets/gallery/las-condes-el-golf-06.jpg',
      'assets/gallery/las-condes-el-golf-07.jpg',
      'assets/gallery/las-condes-el-golf-08.jpg',
      'assets/gallery/las-condes-el-golf-09.jpg',
      'assets/gallery/las-condes-el-golf-10.jpg',
      'assets/gallery/las-condes-el-golf-11.jpg',
      'assets/gallery/las-condes-el-golf-12.jpg',
      'assets/gallery/las-condes-el-golf-13.jpg',
      'assets/gallery/las-condes-el-golf-14.jpg',
      'assets/gallery/las-condes-el-golf-15.jpg',
      'assets/gallery/las-condes-el-golf-16.jpg',
      'assets/gallery/las-condes-el-golf-17.jpg',
      'assets/gallery/las-condes-el-golf-18.jpg',
      'assets/gallery/las-condes-el-golf-19.jpg',
      'assets/gallery/las-condes-el-golf-20.jpg',
      'assets/gallery/las-condes-el-golf-21.jpg'
    ],
    amenities: ['Wifi', 'Cocina equipada', 'Estacionamiento', 'Llegada autónoma', 'Smart TV', 'Zona de trabajo', 'Conserjería 24/7', 'Se aceptan mascotas'],
    descripcion: 'Departamento en El Golf, frente al Mercado Urbano Tobalaba y a pasos del metro Tobalaba (líneas 1 y 4) y del Costanera Center. Tiene un dormitorio con cama doble, otro con camarote y dos baños. Incluye estacionamiento subterráneo, cocina equipada, wifi y llegada autónoma las 24 horas, en un edificio con conserjería.',
    airbnb: 'https://www.airbnb.cl/rooms/1386484554472875702'
  }
];
