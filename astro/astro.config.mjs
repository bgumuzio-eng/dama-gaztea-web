// @ts-check
import { defineConfig } from 'astro/config';

// Maqueta de fase 0: salida estática, sin Sanity todavía.
// Publicación temporal en GitHub Pages (https://bgumuzio-eng.github.io/dama-gaztea-web/).
// La web definitiva irá en una cuenta y dominio del club: entonces se cambia site y se quita base.
export default defineConfig({
  output: 'static',
  site: 'https://bgumuzio-eng.github.io',
  base: '/dama-gaztea-web',
  trailingSlash: 'ignore',
});
