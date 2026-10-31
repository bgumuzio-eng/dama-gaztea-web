# Dama Gaztea Ajedrez: web

Web de la academia y club de ajedrez Dama Gaztea (Bizkaia) que sustituye al blog de Blogger. La especificación completa está en `docs/especificacion.md`; leer la sección relevante antes de construir cualquier página, esquema o integración.

Estado: fase 0 (validación). Propuesta pendiente de aprobación por el club; el stack aún no está confirmado.

## Proyecto independiente de RIF

Este proyecto no tiene ninguna relación con los proyectos de RIF (web de RIF, rif-pipeline, rif-startup-agent ni nada bajo `Desktop/Claude`).

- Ubicación local: `C:\Users\bgumu\Desktop\DamaGaztea`, con su propio repositorio git. Nunca crear ni mover archivos de este proyecto dentro de `Desktop/Claude`, ni al revés.
- Repositorio remoto: `bgumuzio-eng/dama-gaztea-web` en GitHub, propio y separado de los de RIF.
- Despliegue: proyecto propio en Cloudflare Pages, sin compartir proyecto, dominio, Workers, variables de entorno ni tokens con RIF.
- Cuentas y servicios (Sanity, Resend, Google Sheets, Turnstile, Search Console): siempre los de Dama Gaztea. No reutilizar credenciales, `.env`, hosting (Hostinger) ni configuración de RIF.
- Ante cualquier duda sobre qué cuenta o proyecto usar, preguntar antes de configurar o desplegar.

## Stack

- Astro (salida estática) + Sanity (CMS) + Cloudflare Pages (hosting) + GitHub.
- Integración `@sanity/astro`; imágenes vía Sanity Image CDN con `srcset` y AVIF/WebP.
- Formularios: Cloudflare Worker (validación, Turnstile, Resend, Google Sheets API).
- Circuito: CSV publicado de Google Sheets leído en build; webhook de Sanity y botón manual para redeploy.

## Publicación temporal de la maqueta

- Repositorio: https://github.com/bgumuzio-eng/dama-gaztea-web (remoto `origin`, público).
- Dirección: https://bgumuzio-eng.github.io/dama-gaztea-web/ (GitHub Pages).
- Cada push a `main` se compila y se publica solo con `.github/workflows/deploy.yml` (withastro/action, carpeta `astro`). No hacer push a `main` de nada que no deba verse.
- El mismo workflow se ejecuta cada día a las 06:00 de Madrid (dos cron en UTC y el trabajo `hora` deja pasar el que toca) y a mano con `workflow_dispatch`. Esa compilación confirma en `main` el fichero `astro/src/data/historial-problemas.json` (commit de github-actions[bot]): hacer `git pull` antes de trabajar.
- Por esa dirección, `astro.config.mjs` lleva `site` y `base: '/dama-gaztea-web'`. Toda ruta interna debe pasar por `ruta()` de `src/lib/rutas.ts` (enlaces) o por el componente `Foto` (imágenes); nunca escribir `href="/..."` a mano.
- Es una publicación temporal para enseñar la maqueta. La web definitiva irá en una cuenta y dominio del club (Cloudflare Pages), no en este GitHub Pages: entonces se cambia `site` y se quita `base`.
- Franja superior "Maqueta en revisión. Fotos y textos provisionales." en `Cabecera.astro`: solo para la maqueta, se retira al lanzar.
- Datos pendientes de que los confirme Álex: `docs/pendiente-de-confirmar.md`. No tocar los textos marcados "(confirmar)".

## Problemas interactivos (sección 9 de la especificación)

- Fuente: hoja de Google Sheets de Álex, con pestañas `propios` y `lichess` y columnas id, fen, solucion (notación española, con las respuestas del rival), nivel, tema, titulo, enunciado, origen, fecha_publicacion, notas. Guía para Álex: `docs/guia-problemas.md`.
- Las URL de las pestañas publicadas como CSV van en `hojaProblemas` de `astro/src/data/ajustes.json`. Sin URL, se usan `astro/src/data/problemas-ejemplo.csv` y se avisa en el registro. Variables para pruebas: `PROBLEMAS_CSV` (URL separadas por espacios) y `PROBLEMAS_HOY=AAAA-MM-DD`.
- Código en `astro/src/lib/problemas/`: `cargador.ts` (cargador de la colección `problemas`: descarga y descarta las filas inválidas con aviso), `validar.ts` (chess.js: FEN, solución, mate), `calendario.ts` (problema del día, fondo común determinista por fecha, archivo), `notacion.ts`, `temas.ts` (lista controlada; el importador de Lichess la importa).
- Problema del día: el de fecha de hoy (Madrid) o uno no usado del fondo común; las elecciones se guardan en `historial-problemas.json` solo con `GUARDAR_HISTORIAL=1` (lo pone el workflow). Fechas futuras: no se publican.
- Páginas: `/aprende/problemas/` (problema del día y modo entrenamiento con `?nivel=` y `?tema=`; `?p=<id>` abre uno), `/aprende/problemas/archivo/`, `/aprende/problemas/problemas.json` (lo descarga el entrenador). Problema del día también en portada.
- Tablero interactivo en cliente: chess.js (reglas) + chessground (tablero). Pista, ver solución, aciertos y rachas en localStorage, sin registro.
- Distintivos: solo `propio` lleva "De las clases de Dama Gaztea". Los de `lichess` se ven igual que los propios, sin mención de la fuente: la palabra Lichess no debe aparecer en ningún texto, título, alt ni tema publicado (al navegador solo llega `propio: true/false`, ver `paraLaWeb`). La procedencia CC0 se cita en `/aviso-legal/`.
- Equipo online del club: el bloque "¿Quieres jugar partidas online?" está retirado hasta que Álex cree el equipo; entonces se vuelve a poner en `/aprende/problemas/` con el nombre del club (y su enlace en `ajustes.json`).
- Importación de Lichess: `scripts/importar-lichess.mjs` (300 por nivel: fácil < 1200, medio 1200 a 1700, difícil > 1700) o el workflow manual "Importar problemas de Lichess", que deja el CSV como artifact. El 31-10-2026 este equipo no conseguía conectar con lichess.org ni con docs.google.com; si vuelve a pasar, usar el workflow.
- Cuando entre Sanity, la hoja se migra a un tipo de documento `problema` equivalente y el cargador se sustituye por una consulta.
- Fuera de alcance: cuenta de alumno (fase 3); jugar online contra personas (descartado; se enlazará el equipo online del club cuando exista).

## Maqueta de fase 0 (`/astro`)

- Astro 7 con content collections locales en `astro/src/content` (Markdown y JSON), alineadas con el esquema de la sección 6. El slug de Sanity equivale al nombre del fichero; Astro lo pasa a minúsculas.
- Ajustes globales en `astro/src/data/ajustes.json` (futuro documento único `ajustes`).
- Selector de tres tipografías en la franja amarilla de la maqueta (`data-tipo` en `<html>`, también `?tipo=2`). Se retira al elegir una.
- Fotos: el componente `Foto` muestra un hueco con el texto alternativo mientras no hay foto real.
- Comandos (desde `astro/`): `npm run dev`, `npm run build` (valida la hoja de problemas y muestra los avisos). Desde `scripts/`: `npm install` y `node importar-lichess.mjs`.
- Sanity no se instala hasta que el club apruebe el stack.

## Estructura del repositorio

- `/astro` web
- `/studio` Sanity Studio (esquemas de la sección 6 de la especificación)
- `/scripts` importación de problemas de Lichess y, más adelante, migración de Blogger (genera `_redirects`). Paquete npm propio.
- `/docs` especificación y guía del administrador

## Reglas

- Todo el texto de la web, el panel y la documentación en castellano. Nombres de esquema y campos en castellano tal como figuran en la sección 6 (`noticia`, `centro`, `torneo`, `imagenPrincipal`...).
- Nunca usar guiones largos (U+2014) en ningún texto de la web ni de la documentación.
- CSS propio con tokens, sin frameworks pesados. Tipografías autoalojadas: Fraunces (títulos) e Inter (texto).
- Tokens: `--color-primary #14532D`, `--color-accent #2E7D32`, `--color-gold #D4AF37`, `--color-white #FFFFFF`, `--color-muted #E5E5E5`, `--color-alert #C62828`, `--color-text #1F2937`, `--color-surface #F3F8F4`.
- Dorado solo en detalles; rojo solo para avisos y etiquetas de torneo, máximo uno por pantalla; verde bosque solo en cabecera, pie, hero y bloques destacados.
- Accesibilidad AA, navegación por teclado, texto alternativo obligatorio en toda imagen.
- Objetivo Lighthouse móvil 90 o más en rendimiento, accesibilidad y SEO.
- SEO: sitemap, robots, Open Graph por página, `LocalBusiness` en centros, `Event` en torneos, `hreflang` preparado para `/eu/`.
- El administrador es una sola persona sin conocimientos técnicos: cada campo del panel debe ser obvio, con descripción y validación.
- Datos de menores: minimización, nada se publica, consentimientos en casillas separadas.

## Marca

- Eslogan: "Aprende jugando. Crece pensando."
- Cierre: "Y disfruta de cada movimiento."
- Nombre en cabecera: DAMA GAZTEA AJEDREZ.
