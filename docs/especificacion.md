# Dama Gaztea Ajedrez: especificación de la web

> Documento de arranque del proyecto. Sirve como brief para el club y como contexto para Claude Code (el resumen operativo está en `CLAUDE.md` en la raíz del repositorio).

Fecha: 27 de octubre de 2026
Estado: propuesta pendiente de aprobación por el club
Desarrollo: Borja con Claude Code en Visual Studio Code

---

## 1. Resumen

Web propia para Dama Gaztea Ajedrez (academia y club de ajedrez en Bizkaia) que sustituye al blog actual en Blogger. Objetivo: un portal profesional, rápido, adaptado a móvil y fácil de gestionar a diario por una sola persona sin conocimientos técnicos, con coste anual cercano a cero salvo el dominio.

La web conecta tres ámbitos: la enseñanza (academia, centros, horarios), la competición (club, torneos, Circuito Dama Gaztea) y la comunidad (noticias, vídeos, recursos, actualidad del ajedrez).

Eslogan principal: **Aprende jugando. Crece pensando.**
Frase de cierre: **Y disfruta de cada movimiento.**

---

## 2. Decisiones ya tomadas

| Tema | Decisión |
| --- | --- |
| Plataforma | Web propia, no Blogger |
| Administrador | Una sola persona (el profesor), sin cuentas adicionales por ahora |
| Frecuencia de publicación | Casi diaria |
| Idioma | Castellano, con traducción automática a otros idiomas |
| Dominio | .com ya comprado (renovación en marzo); no se compran .es ni .eus por ahora |
| Contenido antiguo | Se migra lo relevante de Blogger; se conservan enlaces |
| Centros | 6 o 7 ubicaciones entre academias y colegios, gestionables sin rediseñar |
| Profesorado público | Solo el profesor principal, con perfil profesional |
| Tarifas | Sin decidir; la web debe permitir publicarlas más adelante |
| Circuito | Clasificación acumulada hoy en Excel; se busca actualización sin teclear |
| Redes | Instagram, TikTok, YouTube |
| Solicitudes | Deben llegar por correo y WhatsApp |
| Legal | Existen textos legales; hay que revisarlos para menores |
| Preinscripción | Se quiere online, ordenada y segura |
| Pagos | Abierto; se estudian opciones antes de decidir |
| Identidad | Verde bosque, blanco, dorado, verde ajedrez en botones |

---

## 3. Tecnología recomendada

**Stack:** Astro (generador de sitio) + Sanity (CMS, panel de edición) + Cloudflare Pages (alojamiento) + GitHub (código).

En sencillo:

1. **Sanity Studio** es el panel donde se publica: formularios por tipo de contenido (noticia, centro, torneo, vídeo), subida de fotos arrastrando, funciona desde el móvil. Accesible en `admin.<dominio>.com` con cuenta de Google.
2. **Astro** convierte el contenido del panel en páginas estáticas, muy rápidas y seguras. Lo construye y mantiene Claude Code.
3. **Cloudflare Pages** aloja la web. Al publicar en el panel, un webhook regenera la web en 1 o 2 minutos. Incluye HTTPS y protección.

**Por qué no WordPress:** exige actualizaciones mensuales de núcleo, tema y plugins, es objetivo frecuente de ataques y cuesta 80 a 150 € al año de hosting. Su única ventaja es la autonomía para añadir funciones por plugins. Como el desarrollo lo hace Borja con Claude Code, la opción recomendada compensa.

**Por qué no seguir en Blogger:** no permite contenido estructurado (centros, torneos, vídeos por tema), ni formularios avanzados, ni crecer hacia ranking, área privada o tableros.

**Matices:**

- Retraso de 1 o 2 minutos entre publicar y ver la noticia online. Si molesta, Astro permite un modo híbrido con publicación instantánea; se decide en desarrollo.
- Sanity: empresa noruega, servidores en la UE. Plan gratuito con margen amplio (decenas de miles de documentos, unos 10 GB de imágenes). Siguiente plan: unos 15 €/mes, solo si se supera.

**Servicios complementarios (todos en plan gratuito):**

| Necesidad | Servicio |
| --- | --- |
| Envío de correos desde formularios | Resend (hasta 3.000/mes) |
| Guardado de solicitudes | Google Sheets privado, vía Cloudflare Worker |
| Clasificación del circuito | Google Sheets leído por la web |
| Partidas reproducibles | Lichess embed (PGN) |
| Problemas interactivos | chess.js (reglas) + chessground (tablero), en el navegador |
| Base de problemas | Google Sheets leído por la web en cada compilación, con una pestaña de problemas propios y otra importada de la base abierta de Lichess (CC0) |
| Diagramas de posiciones | Generados desde FEN |
| Mapas | Google Maps embed |
| Vídeos | YouTube embed |
| Traducción | GTranslate (Google Translate) |
| Medición | Google Search Console + Cloudflare Web Analytics (GA4 opcional) |
| Correo profesional | Cloudflare Email Routing (reenvío a Gmail) |
| Protección anti-spam en formularios | Cloudflare Turnstile (sin captcha visible) |

---

## 4. Identidad visual

### 4.1 Paleta de colores

| Token | Nombre | Hex | Uso |
| --- | --- | --- | --- |
| `--color-primary` | Verde bosque | `#14532D` | Cabecera, pie, bloques de presentación, títulos sobre fondo claro |
| `--color-accent` | Verde ajedrez | `#2E7D32` | Botones, enlaces, estados activos |
| `--color-gold` | Dorado | `#D4AF37` | Líneas decorativas, iconos, detalles del logo, subrayados |
| `--color-white` | Blanco | `#FFFFFF` | Fondo principal, nombre y texto sobre verde |
| `--color-muted` | Gris claro | `#E5E5E5` | Texto secundario sobre verde, separadores, fondos de tarjeta |
| `--color-alert` | Rojo | `#C62828` | Etiquetas de torneo, avisos de plazo, novedades importantes |
| `--color-text` | Gris oscuro | `#1F2937` | Texto principal sobre fondo claro |
| `--color-surface` | Verde muy claro | `#F3F8F4` | Fondos alternos de sección |

Reglas de uso:

- Fondo general claro. El verde bosque se reserva a cabecera, pie, hero y bloques destacados.
- Dorado solo en detalles: nunca como fondo de grandes superficies ni como color de texto largo.
- Rojo solo para avisos y etiquetas de torneo; nunca más de un elemento rojo por pantalla.
- Contraste mínimo AA: texto blanco sobre `#14532D` y sobre `#2E7D32`; texto `#1F2937` sobre blanco y `#F3F8F4`.

### 4.2 Tipografía

Títulos: **Fraunces** (alternativa: Playfair Display). Serifa con carácter, aporta el aire clásico del ajedrez.
Texto: **Inter**. Sin serifa, muy legible en móvil.
Ambas en Google Fonts, gratuitas. Se presentarán dos o tres combinaciones antes de cerrar.

Escala orientativa: H1 40/48 px, H2 32 px, H3 24 px, cuerpo 17 px, pequeño 14 px. Interlineado 1,5 en cuerpo.

### 4.3 Eslogan y textos de marca

- Bajo el logo y en el hero: **Aprende jugando. Crece pensando.**
- Pie de página y cierre de cada noticia: **Y disfruta de cada movimiento.**
- Nombre siempre como **DAMA GAZTEA AJEDREZ** en cabecera (blanco sobre verde bosque).

### 4.4 Elementos gráficos

- Patrón sutil de tablero (opacidad 4 a 6 %) en fondos de sección alternos.
- Iconos de piezas en blanco y dorado como marcadores de categoría: dama (academia), peón (iniciación), torre (club y torneos), caballo (táctica y vídeos), rey (circuito).
- Fotografías reales de clases, torneos y entregas de premios, siempre con permiso de imagen.
- Tarjetas con esquinas suaves (8 px), sombra ligera, foto 16:9 arriba.
- Diagramas de posición generados desde FEN con los colores de la paleta (casillas `#F3F8F4` y `#2E7D32`).

### 4.5 Logo

Pendiente: Borja prepara propuestas. Se necesita en SVG y PNG, versión horizontal (cabecera), versión cuadrada (redes, favicon) y versión monocroma blanca para fondos verdes.

---

## 5. Estructura de la web

Menú principal (6 entradas): **Academia · Centros y horarios · Club y torneos · Noticias · Aprende · Contacto**. Botón destacado en cabecera: **Pide información**. Botón flotante de WhatsApp en todas las páginas.

### 5.1 Portada

1. Cabecera: logo, menú, botón "Pide información".
2. Hero: foto impactante, eslogan, botones "Clases y horarios" y "Próximos torneos".
3. Tres accesos: Academia, Club, Aprende.
4. Últimas noticias: 6 tarjetas (foto, fecha, categoría, título). Automático.
5. Próximos torneos y actividades: lista con fecha, lugar y botón de inscripción. Automático desde las fichas de torneo.
6. Centros: mapa con los puntos y enlace a cada ficha.
7. Presentación breve de la academia y del profesor, con foto y enlace.
8. Últimos vídeos (YouTube) y problema del día.
9. Galería: últimas 8 fotos.
10. Formulario corto de información y datos de contacto.
11. Pie: frase de cierre, redes, legal, enlace al panel.

### 5.2 Academia (páginas fijas)

- Quiénes somos y metodología (beneficios: concentración, razonamiento, planificación, creatividad, decisión, diversión).
- El profesor: perfil, formación, trayectoria, foto.
- Clases: iniciación, perfeccionamiento, entrenamiento táctico y estratégico.
- Información para familias y preguntas frecuentes (desplegables).
- Tarifas: página preparada, oculta hasta que se decida publicarla.
- Colegios y centros educativos: extraescolares, talleres, formación para profesores, torneos escolares, formulario de presupuesto.

### 5.3 Centros y horarios

- Índice con mapa y lista agrupada por localidad.
- Ficha por centro: nombre, dirección, mapa, grupos (nivel, día, hora), plazas (si se activa), fotos, botón de WhatsApp con el centro prerrellenado. Cada ficha es una página local para Google ("clases de ajedrez en Getxo").

### 5.4 Club y torneos

- Calendario: próximos y pasados.
- Ficha por torneo: antes (bases PDF, fecha, lugar, inscripción) y después (crónica, clasificación, fotos, partidas PGN, entrega de premios).
- Circuito Dama Gaztea: pruebas del año, clasificación acumulada (desde Google Sheets), histórico por temporada.
- Jugadores y resultados destacados.

### 5.5 Noticias

- Listado con filtros por categoría: Academia, Clases, Alumnos, Torneos, Club, Circuito, Ajedrez educativo, Vídeos, Actualidad.
- Noticia: foto principal, texto, galería opcional, vídeo incrustado opcional, etiquetas, botones de compartir (WhatsApp, Instagram, Facebook, copiar enlace), noticias relacionadas, frase de cierre.
- Las noticias de actualidad externa llevan marca visible "Actualidad" y fuente citada.

### 5.6 Aprende

- Biblioteca de vídeos por tema: aperturas, táctica y combinaciones, problemas de mate, finales, estrategia, partidas históricas, análisis, trucos y curiosidades, clases, partidas de torneos.
- Cada vídeo: título, YouTube, explicación, diagrama opcional de la posición (FEN), solución desplegable.
- Problemas: tablero interactivo donde el visitante resuelve problemas de táctica por niveles y temas (ver sección 9).
- Problema del día: un problema nuevo cada día a las 06:00, resuelto en el mismo tablero interactivo, con archivo por fechas (ver sección 9.4).
- Partidas: tablero reproducible de Lichess desde PGN.
- Jugar online contra otras personas: no se hace en la web; se enlaza al equipo del club en Lichess.

### 5.7 Contacto

- Teléfono, WhatsApp, correo, redes, localidades.
- Formulario de información.
- Preinscripción online (fase 2).

### 5.8 Legal

- Aviso legal, política de privacidad, política de cookies.
- Cláusula de consentimiento de imagen de menores, enlazada desde galería y preinscripción.

---

## 6. Modelo de contenidos (esquema de Sanity)

Un tipo de documento por pestaña del panel. Solo los campos necesarios.

### `noticia`
- titulo (texto, obligatorio)
- slug (automático desde el título)
- fecha (fecha, por defecto hoy)
- imagenPrincipal (imagen con recorte y texto alternativo)
- resumen (texto corto, 160 caracteres, para tarjetas y redes)
- cuerpo (texto enriquecido: títulos, negritas, enlaces, imágenes, vídeo YouTube, diagrama FEN)
- categoria (una: Academia, Clases, Alumnos, Torneos, Club, Circuito, Ajedrez educativo, Vídeos, Actualidad)
- etiquetas (varias, lista controlada)
- galeria (imágenes)
- fuente (URL y nombre, solo si categoría = Actualidad)
- torneoRelacionado (referencia a torneo, opcional)
- destacada (sí/no, para fijar en portada)
- estado (borrador / publicada)

### `centro`
- nombre
- slug
- localidad (lista: Bilbao, Getxo, Sestao, otras)
- tipo (academia / colegio / otro)
- direccion
- ubicacion (coordenadas o enlace de Google Maps)
- descripcion (texto corto)
- grupos (lista repetible): nivel, diaSemana, horaInicio, horaFin, edades, plazasDisponibles
- mostrarPlazas (sí/no)
- fotos
- activo (sí/no)
- orden

### `torneo`
- nombre
- slug
- fecha y horaInicio
- fechaFin (opcional)
- lugar (texto o referencia a centro)
- tipo (torneo propio / circuito / externo / escolar)
- perteneceAlCircuito (sí/no) y numeroDePrueba
- bases (PDF)
- inscripcion (URL externa o "formulario web") y fechaLimite
- descripcion
- cronica (texto enriquecido, se rellena después)
- clasificacion (tabla o PDF)
- enlaceChessResults (URL, opcional)
- partidas (ficheros PGN con título)
- fotos
- estado (próximo / celebrado / cancelado)

### `video`
- titulo
- urlYoutube
- tema (lista de la sección Aprende)
- explicacion (texto enriquecido)
- posicionFEN (opcional)
- solucion (texto, opcional)
- fecha

### `problema`
Mientras no esté Sanity, los problemas viven en una hoja de Google Sheets (sección 9.3) con columnas equivalentes: id, fen, solucion, nivel, tema, titulo, enunciado, origen, fecha_publicacion, notas. Cuando entre Sanity, la hoja se migra a este tipo de documento (un documento por fila; la pestaña de Lichess puede seguir como CSV en el repositorio para no gastar documentos del plan gratuito).
- titulo (opcional)
- posicionFEN (posición en la que le toca mover al visitante)
- enunciado ("Juegan blancas y ganan"; si va vacío se genera según el turno)
- solucionJugadas (lista de jugadas alternando visitante y respuesta del rival; la primera y la última son del visitante. En la hoja, en notación española separada por espacios)
- nivel (facil / medio / dificil)
- tema (varios, lista controlada: mate en 1, mate en 2, mate en 3, mate del pasillo, clavada, horquilla, ataque doble, enfilada, descubierta, jaque doble, desviación, atracción, pieza indefensa, sacrificio, coronación, finales)
- origen (propio / lichess; en los de Lichess el id es el id original del problema)
- fechaPublicacion (opcional; el día en que sale como problema del día)
- notas (internas, no se publican)

### `pagina`
- titulo, slug, cuerpo (texto enriquecido), imagenCabecera, mostrarEnMenu, orden, publicada

### `ajustes` (documento único)
- nombreAcademia, eslogan, fraseCierre
- telefono, whatsapp (número y mensaje por defecto), email
- redes: instagram, tiktok, youtube
- direccionFiscal (para legal)
- hojaCircuito (URL de la hoja de Google publicada)
- mostrarTarifas (sí/no)

Reglas:
- Las etiquetas se eligen de una lista cerrada para evitar duplicados.
- Toda imagen requiere texto alternativo.
- La vista previa del panel muestra la noticia como quedará en la web antes de publicar.

---

## 7. Flujos de administración

**Publicar una noticia:** Noticias › Nueva › título, foto, texto, categoría › Publicar. Aparece en la web en 1 o 2 minutos. Se puede guardar borrador o programar fecha.

**Añadir un centro:** Centros › Nuevo › rellenar ficha › Activo › Publicar. El mapa, el índice y el menú se regeneran solos. Para dar de baja: desmarcar Activo.

**Crear un torneo:** Torneos › Nuevo › datos y bases › Publicar. Aparece en portada y calendario. Tras el torneo: abrir la misma ficha, añadir crónica, clasificación, fotos y PGN; cambiar estado a Celebrado.

**Crear un problema:** abrir la hoja de problemas › pestaña "propios" › nueva fila con la FEN copiada del editor de Lichess, la solución, el nivel y el tema › opcionalmente, la fecha en que debe salir como problema del día. Sale en la web en la publicación de las 06:00 o al momento con el botón manual (sección 9.4). Guía de una página: `docs/guia-problemas.md`. Cuando entre Sanity: Problemas › Nuevo › mismos campos › Publicar.

**Actualizar el circuito:** editar la hoja de Google Sheets. La web la lee automáticamente (ver sección 8).

**Cambiar teléfono, redes o eslogan:** Ajustes › editar › Publicar. Cambia en toda la web.

**Copia de seguridad:** exportación completa desde el panel con un clic; el código vive en GitHub con historial.

**Formación:** una sesión de 1 hora al entregar la fase 1 y una guía de 2 páginas con capturas.

---

## 8. Clasificación del Circuito Dama Gaztea

Recomendación: pasar el Excel actual a Google Sheets con las mismas columnas y fórmulas. La hoja se "publica en la web" (solo lectura, formato CSV) y Astro la lee en cada regeneración; además, un botón "Actualizar" en el panel fuerza la regeneración al momento.

Columnas mínimas esperadas: posición, jugador, categoría, club, puntos por prueba (una columna por prueba), total. La web mostrará: tabla ordenable, filtro por categoría, búsqueda por nombre, y por cada jugador la evolución prueba a prueba.

Alternativa si se prefiere seguir en Excel: subir el fichero a una carpeta de Google Drive compartida; la web lo lee desde ahí. Funciona igual con un paso más.

Fase 3: ranking automático calculado por la propia web a partir de las clasificaciones de cada torneo, sin hoja externa.

---

## 9. Problemas interactivos

Base de datos de problemas de táctica que el visitante resuelve en un tablero interactivo dentro de la web. Fase 2, justo después del circuito.

### 9.1 Funcionamiento

- El visitante mueve las piezas (arrastrar o tocar origen y destino, cómodo en móvil). La web valida cada jugada contra la solución; si es correcta, responde sola con la jugada forzada del rival y espera la siguiente.
- Jugada incorrecta: aviso y la pieza vuelve a su casilla; se puede reintentar.
- Pista: ilumina la pieza que hay que mover.
- Ver solución: reproduce la línea completa y la muestra escrita en notación española.
- Contador de aciertos y racha actual y mejor racha. Un problema cuenta como acierto solo si se resuelve a la primera: sin fallos, sin pista y sin ver la solución (si los fallos no contaran, se podría resolver por tanteo). Repetir un problema ya resuelto no cambia el marcador.
- Se acepta cualquier jugada que dé mate aunque no sea la de la solución. Las coronaciones se hacen a dama automáticamente.
- Además de arrastrar, se puede escribir la jugada en notación española (C, A, T, D, R), útil con teclado y lectores de pantalla.
- Sin registro: el progreso (resueltos, aciertos, rachas) se guarda en el navegador con localStorage. Si el navegador lo borra, se empieza de cero sin errores.
- Botón "Siguiente problema" que elige uno no resuelto del nivel y tema seleccionados.

### 9.2 Niveles y temas

- Tres niveles: fácil, medio, difícil.
- Filtro opcional por tema: mate en 1, mate en 2, clavada, horquilla, ataque doble, descubierta, desviación, sacrificio, finales y otros de la lista controlada.

### 9.3 Fuentes: la hoja de problemas

Los problemas se gestionan en una hoja de Google Sheets con dos pestañas de columnas idénticas (id, fen, solucion, nivel, tema, titulo, enunciado, origen, fecha_publicacion, notas):

1. **propios:** los problemas del profesor. Llevan en la web el distintivo "De las clases de Dama Gaztea".
2. **lichess:** problemas de la base abierta de Lichess (licencia CC0), con origen `lichess` y el id original. En la web se ven igual que los propios, sin distintivo ni mención de la fuente: la palabra Lichess no aparece en ninguna página publicada. El aviso legal incluye la línea "Parte de los problemas de entrenamiento procede de bases de datos de dominio público (licencia CC0)". Se generan con `scripts/importar-lichess.mjs` (también como trabajo manual de GitHub Actions, "Importar problemas de Lichess"): descarga la base, se queda con 300 problemas por nivel (fácil por debajo de 1200, medio de 1200 a 1700, difícil por encima de 1700) entre los más populares, jugados y estables, de 4 jugadas propias como máximo, con variedad de temas; aplica la primera jugada del rival, convierte el resto a notación española y escribe un CSV para importar en la pestaña.

Cada pestaña se publica en la web como CSV (Archivo › Compartir › Publicar en la web) y sus direcciones se guardan en `hojaProblemas` de `astro/src/data/ajustes.json`. En cada compilación, Astro descarga las pestañas y valida cada fila con chess.js: FEN legal (y el bando que no mueve no está en jaque), solución legal, terminada en una jugada del bando que resuelve, y en mate cuando el enunciado o el tema dicen mate (con el número de jugadas si dice "mate en N"); además, nivel válido, id único y fecha única. Las filas con errores se descartan con un aviso en el registro de compilación que indica pestaña, fila, id y motivo; el resto se publica. Si una pestaña no se puede descargar o le faltan columnas, la compilación falla y la web sigue como estaba.

### 9.4 Problema del día

- La web se compila y publica cada día a las 06:00 (hora de Madrid) con una ejecución programada de GitHub Actions; además se puede publicar al momento con "Run workflow" (`workflow_dispatch`).
- El problema del día es el que tiene `fecha_publicacion` de hoy. Si no hay ninguno, se elige uno del fondo común (problemas sin fecha) que no haya salido antes, de forma determinista a partir de la fecha. Cuando ya han salido todos, se repite el que lleva más tiempo sin salir.
- Las elecciones del fondo común se guardan en `astro/src/data/historial-problemas.json`, que la propia ejecución de GitHub Actions confirma en el repositorio. Así el archivo no cambia aunque se añadan o quiten filas de la hoja.
- Los problemas con fecha futura no aparecen en ningún sitio hasta su día.
- Aparece en portada y en Aprende › Problemas. El archivo por fechas está en `/aprende/problemas/archivo/`.
- Modo entrenamiento: el resto de problemas publicados, filtrables por nivel y tema (`/aprende/problemas/?nivel=medio&tema=clavada`).

### 9.5 Tecnología

- chess.js para las reglas y la validación de jugadas.
- chessground (el tablero de Lichess) para la interfaz, con los colores de la paleta.
- Stockfish en el navegador (WebAssembly) solo si más adelante se añade "jugar contra la máquina".
- Todo en cliente, sin servidor: los problemas se generan como JSON estático en build (`/aprende/problemas/problemas.json`, que el entrenador descarga después de pintar el problema del día).
- Licencias: chess.js es BSD-2 (sin condiciones relevantes). chessground es GPL-3.0: al servirse al navegador, el código de la web que lo incluye debe poder ofrecerse bajo GPL (lo más sencillo es que el repositorio sea público). Si no se quiere publicar el código, alternativa con licencia MIT: cm-chessboard. Decidir antes de lanzar la fase 2.
- Mientras no esté Sanity, todos los problemas viven en la hoja de Google Sheets. Al entrar Sanity, los propios se migran al tipo `problema` y los de Lichess pueden quedarse como CSV en el repositorio para no gastar documentos del plan gratuito.

### 9.6 Fuera de alcance

- Cuenta de alumno para guardar el progreso entre dispositivos: fase 3.
- Jugar online contra otras personas: descartado. Se enlaza un equipo del club en Lichess.

---

## 10. Formularios, privacidad y pagos

### 10.1 Formulario de información
Campos: nombre, correo, teléfono, localidad de interés, mensaje, aceptación de privacidad. Protección anti-spam invisible (Turnstile). Al enviar: correo al administrador, fila en hoja de Google privada, y aviso opcional por WhatsApp. Respuesta automática de confirmación a la familia.

### 10.2 Botón de WhatsApp
Enlace `wa.me` con mensaje prerrellenado. Desde una ficha de centro, el mensaje incluye el nombre del centro.

### 10.3 Preinscripción online (fase 2)
Dos pasos:
1. Tutor: nombre y apellidos, DNI, correo, teléfono, relación con el alumno.
2. Alumno: nombre, fecha de nacimiento, centro y grupo deseado, nivel, observaciones.

Casillas separadas: política de privacidad, consentimiento del tratamiento de datos del menor, autorización de imagen (opcional). Se guarda cifrado en hoja privada, aviso al administrador, confirmación a la familia. Nada se publica.

### 10.4 Privacidad de menores
Revisión de los textos legales actuales para incluir: responsable del tratamiento, finalidades y base legal, consentimiento parental (obligatorio por debajo de 14 años), cláusula de imagen, plazo de conservación, derechos y forma de ejercerlos. Principio de minimización: solo se pide lo necesario. Sin comentarios públicos en la web.

### 10.5 Pagos online (fase 3)

| Opción | Permite | Coste | Nota |
| --- | --- | --- | --- |
| Stripe (enlaces de pago) | Tarjeta, Bizum, cuotas mensuales automáticas | 1,5 % + 0,25 € por cobro con tarjeta europea; sin cuota fija | La más sencilla; cada enlace es un botón |
| TPV virtual del banco (Redsys) | Tarjeta, Bizum | Cuota mensual y comisión según banco | Más trámite |
| Transferencia o Bizum manual | Datos en la web | 0 € | Disponible desde el primer día |

Recomendación: empezar con transferencia o Bizum manual; Stripe cuando la preinscripción esté rodada. Cobrar online obliga a emitir recibo y publicar condiciones de contratación.

---

## 11. Migración desde Blogger

1. Exportar el blog (XML) y descargar todas las fotos. Es la copia de seguridad.
2. Inventario: lista de publicaciones con título, fecha, etiquetas y visitas para marcar conservar / agrupar / descartar.
3. Script de conversión al nuevo CMS: texto, fotos (optimizadas), fechas y categorías equivalentes.
4. Revisión manual de las 20 o 30 noticias más importantes.
5. Redirecciones de cada URL antigua a la nueva.

**Pregunta abierta clave:** ¿el dominio .com está conectado al Blogger actual o el blog vive en una dirección blogspot.com?
- Si el .com ya apunta a Blogger: redirecciones por lista en Cloudflare; el posicionamiento se conserva casi íntegro.
- Si el blog vive en blogspot.com: Blogger no permite redirigir a dominio externo; se deja un aviso con enlace en el blog antiguo y Google traslada el posicionamiento en unas semanas.

---

## 12. Idiomas, redes, WhatsApp y medición

- **Traducción:** selector GTranslate (Google Translate) que traduce toda la web al vuelo. Calidad suficiente para orientarse. Preparado para una futura versión en euskera de las páginas fijas en `/eu/`.
- **Redes:** enlaces a Instagram, TikTok y YouTube en cabecera y pie. YouTube se incrusta; Instagram y TikTok se enlazan (incrustar sus feeds exige herramientas de pago o permisos inestables).
- **Compartir:** cada noticia tiene imagen y descripción preparadas para vista previa en WhatsApp, Instagram y Facebook, y botón "Compartir en WhatsApp".
- **Lista de difusión:** botón "Únete a la lista" en portada que abre WhatsApp con el mensaje de alta. Valorar un canal de WhatsApp como alternativa.
- **Correo profesional:** `info@<dominio>.com` con reenvío gratuito de Cloudflare a Gmail; Google Workspace (unos 7 €/mes) solo si se quiere bandeja separada.
- **Medición:** Search Console desde el primer día; Cloudflare Web Analytics (sin cookies); GA4 opcional si se acepta aviso de cookies.
- **SEO local:** fichas de centro redactadas como páginas locales; perfil de Google Business Profile con horario, teléfono y reseñas.

---

## 13. Costes

| Partida | Coste anual | Fase |
| --- | --- | --- |
| Dominio .com (renovación marzo) | 12 a 15 € | Ya |
| Cloudflare Pages | 0 € | 1 |
| Sanity (plan gratuito) | 0 € | 1 |
| GitHub | 0 € | 1 |
| Resend (correos) | 0 € | 1 |
| GTranslate | 0 € | 1 |
| Search Console, Analytics, Business Profile | 0 € | 1 |
| Correo profesional (Cloudflare + Gmail) | 0 € (Workspace opcional: unos 84 €) | 1 |
| Problemas interactivos (chess.js, chessground, base Lichess CC0) | 0 € | 2 |
| Stripe | Sin cuota; 1,5 % + 0,25 € por cobro | 3 |
| Fotografía profesional (opcional, recomendable) | 150 a 300 € una vez | 1 |

Desarrollo: tiempo de Borja con Claude Code, sin coste monetario.

---

## 14. Fases

| Fase | Contenido | Duración |
| --- | --- | --- |
| 0. Validación | Aprobar propuesta, decisiones del club, maqueta visual (portada, noticia, centro, torneo en móvil y escritorio), accesos a Blogger y dominio | 1 semana |
| 1. Lanzamiento | Portada, Academia, Centros, Club y torneos, Noticias, Aprende (vídeos y problema), Contacto, legal, migración, redirecciones, Search Console, panel, formación | 3 a 4 semanas |
| 2. Circuito, problemas e inscripciones | Clasificación desde Sheets, problemas interactivos (sección 9) con importación de Lichess, preinscripción con consentimientos, tarifas (si procede), página de colegios, galería ampliada, lista o canal de WhatsApp | 3 semanas |
| 3. Avanzado | Pagos online, área privada de familias, cuenta de alumno con progreso de problemas entre dispositivos, jugar contra la máquina (opcional), histórico de competiciones, euskera en páginas fijas, ranking automático | Según necesidad |

---

## 15. Decisiones pendientes y material necesario

Decisiones del club antes de empezar:

- [ ] Aprobar Astro + Sanity + Cloudflare frente a WordPress.
- [ ] Confirmar si el .com apunta al Blogger actual o si el blog vive en blogspot.com, y facilitar accesos.
- [ ] Circuito: Google Sheets (recomendado) o Excel en Drive.
- [ ] Preinscripción online en fase 1 o en fase 2 (recomendado: fase 2).
- [ ] Elegir tipografía y aprobar la maqueta visual.

Recomendaciones técnicas, modificables más adelante: GTranslate en lugar de traducción manual; no comprar .es ni .eus; pagos manuales primero y Stripe en fase 3; Search Console y Cloudflare Analytics desde el inicio; correo con reenvío de Cloudflare; Lichess para partidas.

Material para la fase 1:

- [ ] Logo (SVG y PNG, horizontal, cuadrado, monocromo blanco). Puede llegar más adelante; mientras, se usa un logotipo tipográfico provisional.
- [ ] 30 a 50 fotos con permiso de publicación.
- [ ] Lista de centros con dirección y horarios actuales.
- [ ] Textos: presentación de la academia, metodología, perfil del profesor, preguntas frecuentes.
- [ ] Textos legales actuales.
- [ ] Enlaces de Instagram, TikTok y YouTube.
- [ ] Excel del circuito.
- [ ] Acceso a Blogger (exportación) y al registrador del dominio.

---

## 16. Notas para Claude Code

- Proyecto independiente: carpeta local `Desktop/DamaGaztea`, repositorio propio `dama-gaztea-web` en GitHub y proyecto propio en Cloudflare Pages, sin compartir cuentas, credenciales ni despliegues con ningún otro proyecto.
- Repositorio: `dama-gaztea-web`. Estructura: `/astro` (web), `/studio` (Sanity), `/scripts` (migración Blogger, lector de Sheets), `/docs` (este documento, guía del administrador).
- Astro con salida estática; integración `@sanity/astro`; imágenes vía Sanity Image CDN con `srcset` responsive y formato AVIF/WebP.
- Estilos con CSS propio y tokens de la sección 4 (sin frameworks pesados). Tipografías autoalojadas para rendimiento.
- Componentes clave: `Hero`, `NoticiaCard`, `CentroCard`, `TorneoCard`, `Mapa`, `TableroFEN`, `TableroProblema`, `LichessEmbed`, `Clasificacion`, `FormularioContacto`, `BotonWhatsApp`, `ShareButtons`, `Faq`.
- Formularios: endpoint en Cloudflare Worker (validación, Turnstile, Resend, Google Sheets API).
- Circuito: fetch del CSV publicado de Google Sheets en build; webhook de Sanity y botón manual para redeploy.
- Problemas: hoja de Google Sheets publicada como CSV y leída en build por un cargador de Astro (`astro/src/lib/problemas/`), con validación chess.js; problema del día con ejecución programada de GitHub Actions a las 06:00 de Madrid; chess.js + chessground en una isla de cliente; progreso en localStorage; script de importación de la base CC0 de Lichess en `/scripts`. Al entrar Sanity, la hoja se migra al tipo `problema`.
- Redirecciones: fichero `_redirects` generado por el script de migración.
- SEO: `sitemap.xml`, `robots.txt`, Open Graph por página, datos estructurados `LocalBusiness` en centros y `Event` en torneos, `hreflang` preparado para `/eu/`.
- Accesibilidad: contraste AA, navegación por teclado, textos alternativos obligatorios.
- Rendimiento objetivo: Lighthouse móvil 90 o más en rendimiento, accesibilidad y SEO.
- No usar guiones largos (el carácter U+2014) en ningún texto de la web ni de la documentación.
