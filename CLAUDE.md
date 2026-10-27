# Dama Gaztea Ajedrez: web

Web de la academia y club de ajedrez Dama Gaztea (Bizkaia) que sustituye al blog de Blogger. La especificación completa está en `docs/especificacion.md`; leer la sección relevante antes de construir cualquier página, esquema o integración.

Estado: fase 0 (validación). Propuesta pendiente de aprobación por el club; el stack aún no está confirmado.

## Stack

- Astro (salida estática) + Sanity (CMS) + Cloudflare Pages (hosting) + GitHub.
- Integración `@sanity/astro`; imágenes vía Sanity Image CDN con `srcset` y AVIF/WebP.
- Formularios: Cloudflare Worker (validación, Turnstile, Resend, Google Sheets API).
- Circuito: CSV publicado de Google Sheets leído en build; webhook de Sanity y botón manual para redeploy.

## Estructura del repositorio

- `/astro` web
- `/studio` Sanity Studio (esquemas de la sección 6 de la especificación)
- `/scripts` migración de Blogger (genera `_redirects`) y lector de Sheets
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
