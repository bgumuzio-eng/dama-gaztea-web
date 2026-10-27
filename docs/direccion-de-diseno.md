# Dirección de diseño: Dama Gaztea Ajedrez

Documento de referencia para la maqueta y la web definitiva. Prevalece sobre cualquier interpretación anterior del apartado 4 de la especificación.

## 1. La idea en una frase

Un club de ajedrez con 30 años de historia, fotografiado con luz cálida, contado con tipografía clásica y mucho aire. Elegante como un club, cercano como una academia de niños.

Referencias de tono: la portada del Saint Louis Chess Club (fotografía grande, titulares con serifa, datos en cifras) y la estructura por bloques de ENFAF (tarjetas con foto, profesor con cara, preguntas frecuentes). No se copia ninguna; se toma el nivel de acabado.

## 2. Lo que estaba mal en la primera maqueta

- Huecos grises en lugar de fotos. Una maqueta sin fotografía no se puede evaluar; nadie ve el diseño, ve la ausencia de fotos.
- Colores aplicados en bloques planos: verde sobre verde, sin blanco entre secciones, sin textura ni luz.
- Sin jerarquía tipográfica: títulos del mismo peso que el texto, sin un titular grande que mande en cada pantalla.
- Tarjetas y botones genéricos, de plantilla.
- Logotipo de texto sin trabajar.

## 3. Fotografía: la regla número uno

Toda pantalla tiene al menos una fotografía grande y real. Hasta que el club entregue las suyas, se usan fotos provisionales de Unsplash o Pexels (licencia libre) que cumplan estas condiciones:

- Niños o adolescentes concentrados frente a un tablero, manos moviendo piezas, piezas de madera con luz lateral, salas de torneo con muchas mesas, entregas de premios.
- Tonos cálidos: madera, luz natural, ocres. Nada de fondos negros brillantes ni renders 3D de piezas cromadas.
- Siempre con etiqueta "foto provisional" en el pie en la maqueta, para que el club sepa qué va a sustituir.

Tratamiento: fotos a sangre (de borde a borde) en hero y en bloques de presentación; con esquinas de 12 px dentro de tarjetas; degradado verde bosque al 60 por ciento sobre la foto cuando lleva texto encima, nunca el verde plano.

Las fotos de las noticias antiguas de damagaztea.com son del propio club y pueden reutilizarse en la migración.

## 4. Color: cómo usar la paleta de verdad

La paleta es la aprobada (verde bosque #14532D, verde ajedrez #2E7D32, dorado #D4AF37, blanco, gris #E5E5E5, rojo #C62828 para avisos). Lo que cambia es la proporción:

- 70 por ciento blanco y crema. Fondo general #FFFFFF; secciones alternas en crema cálido #F7F4EC (no en verde pálido). El crema combina con la madera de las fotos y hace que el verde parezca más caro.
- 20 por ciento verde bosque: cabecera, pie, un único bloque de presentación por página y el degradado sobre las fotos del hero.
- 7 por ciento dorado: solo en líneas finas de 1 px, numerales, iconos de piezas y el subrayado del enlace activo. Nunca como fondo ni como texto de párrafo.
- 3 por ciento verde ajedrez y rojo: botones primarios y etiquetas de aviso.

Texto principal gris muy oscuro #1F2937, nunca negro puro. Sobre verde, blanco a 92 por ciento de opacidad para el texto secundario.

## 5. Tipografía: que mande el titular

- Titulares: Fraunces (variable, con ópticos grandes) en peso 600, interletrado ligeramente negativo. Tamaños: hero 56 px en escritorio y 36 px en móvil; H2 40/28; H3 24/20.
- Texto: Inter 17 px, interlineado 1,6, ancho máximo de párrafo 68 caracteres.
- Etiquetas y fechas: Inter 13 px en mayúsculas con interletrado de 0,08 em, en dorado sobre claro o en gris claro sobre verde.
- Cifras grandes (30 años, 14 centros, 9 ediciones del torneo): Fraunces 64 px en dorado sobre verde bosque.

Las otras dos combinaciones (Playfair Display + Inter, DM Serif + DM Sans) se mantienen en el selector, pero Fraunces + Inter es la que se trabaja a fondo.

## 6. Composición y ritmo

- Hero de portada: foto a sangre de 85 vh con degradado verde desde abajo. Encima, a la izquierda, etiqueta pequeña en dorado "Academia y club de ajedrez en Bizkaia desde 1994" (fecha a confirmar), titular "Aprende jugando. Crece pensando." en dos líneas, un párrafo de 20 palabras y dos botones: uno sólido verde ajedrez "Clases y horarios", otro contorno blanco "Próximos torneos". Abajo a la derecha, tres cifras en dorado.
- Franja de confianza bajo el hero: en crema, tres frases cortas con icono de pieza en dorado: "Más de 30 años enseñando", "Clases en 14 centros de Bizkaia", "Circuito propio de torneos".
- Alternancia de secciones: blanco, crema, foto a sangre con texto, blanco, verde bosque, blanco, crema, pie verde. Nunca dos secciones del mismo fondo seguidas, nunca dos verdes seguidas.
- Separación entre secciones: 96 px en escritorio, 64 px en móvil. Más aire del que parece necesario.
- Tarjetas de noticia: foto 3:2 arriba, etiqueta en mayúsculas dorada, titular Fraunces 22 px, fecha en gris, sin botón "leer más" (toda la tarjeta es enlace). Sombra solo al pasar el ratón.
- Bloque del profesor: foto vertical real a la izquierda, texto a la derecha, una cita corta entre comillas tipográficas en Fraunces itálica.
- Centros: mapa con marcadores dorados sobre fondo crema, lista de localidades a la derecha con día y hora en una línea por grupo.
- Torneo: cartel vertical del torneo (el club ya hace carteles) como imagen principal de la ficha, datos clave en una columna fija a la derecha en escritorio.
- Problemas: tablero con casillas crema #F0D9B5 y verde #2E7D32 apagado al 85 por ciento, piezas estilo Lichess "cburnett", marco fino dorado. Panel lateral con nivel, racha y botones. Fondo de la página en crema.

## 7. Detalles que hacen que parezca cara

- Línea dorada de 1 px bajo cada H2, de 48 px de ancho, alineada a la izquierda.
- Numeración de secciones en la portada en dorado pequeño (01, 02, 03) a la izquierda del H2.
- Iconos de piezas como silueta plana, a línea, en dorado; no emojis ni cliparts.
- Patrón de tablero solo en el pie, en verde ligeramente más oscuro que el fondo (#113F25 sobre #14532D), casi imperceptible.
- Transiciones suaves de 200 ms en hover; ninguna animación de entrada que distraiga.
- Botones con radio de 8 px, altura 48 px, texto en Inter 600 15 px. Un único botón primario por sección.
- Frase de cierre "Y disfruta de cada movimiento" en Fraunces itálica, 24 px, centrada, en dorado sobre el verde del pie.

## 8. Móvil

- Hero de 70 vh, titular a 36 px, los botones apilados a ancho completo.
- Tarjetas de noticia en carrusel horizontal con desplazamiento táctil en portada, en lista en la sección Noticias.
- Menú inferior fijo con cuatro iconos: Inicio, Horarios, Torneos, WhatsApp. El menú completo en el botón de hamburguesa.
- Tablero de problemas al ancho de pantalla menos 32 px, panel de controles debajo.

## 9. Logotipo provisional

Mientras llega el logo definitivo: monograma "DG" en Fraunces 600 dentro de un círculo de contorno dorado de 1,5 px, y a su derecha "DAMA GAZTEA" en Inter 700 con interletrado de 0,12 em y debajo "AJEDREZ" en Inter 400 a 11 px. Versión blanca sobre verde para la cabecera.

## 10. Comprobación antes de dar por buena una pantalla

- ¿Hay una foto real y grande? Si no, no está terminada.
- ¿Hay un único titular que manda? Si todo pesa igual, no hay jerarquía.
- ¿Más de la mitad de la pantalla es blanco o crema? Si no, sobra verde.
- ¿El dorado aparece solo en detalles finos? Si hay un bloque dorado, quitarlo.
- ¿Se lee bien a un brazo de distancia en el móvil? Si no, subir tamaños.
- ¿Una madre o un padre entendería en 5 segundos qué es esto y qué hacer? Si no, simplificar el hero.
