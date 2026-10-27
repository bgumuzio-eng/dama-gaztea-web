// Antepone la base de la web (en GitHub Pages, /dama-gaztea-web) a las rutas internas que empiezan por "/".
// Las direcciones externas y los anclajes de la misma página (#contacto) se devuelven tal cual.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const ruta = (p: string) => (p.startsWith('/') && !p.startsWith('//') ? `${base}${p}` : p);
