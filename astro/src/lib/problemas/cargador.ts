// Cargador de la colección `problemas`: descarga en cada compilación las pestañas de la hoja de Google Sheets
// publicadas como CSV, valida cada fila y descarta las que tienen errores dejando un aviso en el registro de build.
// Sin URL configurada se usan los problemas de ejemplo de src/data/problemas-ejemplo.csv.
// Cuando entre Sanity, la hoja se migra a un tipo de documento `problema` y este cargador se sustituye por una consulta.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Loader } from 'astro/loaders';
import ajustes from '../../data/ajustes.json';
import { leerCsv } from './csv';
import { validarFila, type Problema } from './validar';

const COLUMNAS_OBLIGATORIAS = ['id', 'fen', 'solucion', 'nivel'];
const EJEMPLO = resolve(process.cwd(), 'src/data/problemas-ejemplo.csv');

// PROBLEMAS_CSV (varias URL separadas por espacios) permite probar otra hoja sin tocar ajustes.json.
const urlsConfiguradas = () =>
  (process.env.PROBLEMAS_CSV?.split(/\s+/) ?? (ajustes.hojaProblemas as string[])).map((u) => u.trim()).filter(Boolean);

async function descargar(url: string, intentos = 3): Promise<string> {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (!res.ok) throw new Error(`respuesta ${res.status}`);
      if ((res.headers.get('content-type') ?? '').includes('text/html')) {
        throw new Error('devuelve una página web, no un CSV: ¿está publicada en formato CSV?');
      }
      return await res.text();
    } catch (e) {
      if (i >= intentos) throw new Error(`No se pudo descargar la hoja de problemas ${url}: ${(e as Error).message}`);
      await new Promise((r) => setTimeout(r, 2000 * i));
    }
  }
}

export function cargadorProblemas(): Loader {
  return {
    name: 'hoja-de-problemas',
    load: async ({ store, logger, parseData, generateDigest }) => {
      const urls = urlsConfiguradas();
      const fuentes: { nombre: string; texto: string }[] = [];
      if (urls.length) {
        for (const [i, url] of urls.entries()) fuentes.push({ nombre: `pestaña ${i + 1}`, texto: await descargar(url) });
      } else {
        logger.warn('No hay URL de la hoja de problemas en src/data/ajustes.json (hojaProblemas): se usan los problemas de ejemplo.');
        fuentes.push({ nombre: 'problemas-ejemplo.csv', texto: readFileSync(EJEMPLO, 'utf8') });
      }

      const validos: Problema[] = [];
      const fechas = new Map<string, string>();
      let descartados = 0;
      for (const { nombre, texto } of fuentes) {
        const { cabeceras, filas } = leerCsv(texto);
        const faltan = COLUMNAS_OBLIGATORIAS.filter((c) => !cabeceras.includes(c));
        // Una cabecera mal escrita invalidaría todas las filas: mejor parar y no publicar una web sin problemas.
        if (faltan.length) throw new Error(`La ${nombre} de la hoja de problemas no tiene las columnas: ${faltan.join(', ')}`);

        for (const fila of filas) {
          const donde = `${nombre}, fila ${fila.numero}${fila.celdas.id ? ` (id ${fila.celdas.id})` : ''}`;
          const resultado = validarFila(fila);
          if ('error' in resultado) {
            descartados++;
            logger.warn(`Problema descartado, ${donde}: ${resultado.error}.`);
            continue;
          }
          const { problema, avisos } = resultado;
          for (const aviso of avisos) logger.warn(`Aviso, ${donde}: ${aviso}.`);
          if (validos.some((p) => p.id === problema.id)) {
            descartados++;
            logger.warn(`Problema descartado, ${donde}: el id ${problema.id} está repetido.`);
            continue;
          }
          const fecha = problema.fechaPublicacion;
          if (fecha && fechas.has(fecha)) {
            descartados++;
            logger.warn(`Problema descartado, ${donde}: el ${fecha} ya tiene el problema ${fechas.get(fecha)}.`);
            continue;
          }
          if (fecha) fechas.set(fecha, problema.id);
          validos.push(problema);
        }
      }

      if (!validos.length) throw new Error('La hoja de problemas no tiene ningún problema válido.');

      store.clear();
      for (const problema of validos) {
        const data = await parseData({ id: problema.id, data: problema });
        store.set({ id: problema.id, data, digest: generateDigest(data) });
      }
      const propios = validos.filter((p) => p.origen === 'propio').length;
      logger.info(
        `${validos.length} problemas válidos (${propios} propios, ${validos.length - propios} de Lichess); ${descartados} descartados.`,
      );
    },
  };
}
