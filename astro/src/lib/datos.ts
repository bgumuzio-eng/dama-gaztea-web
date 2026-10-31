// Consultas comunes. Con Sanity se sustituirán por consultas GROQ equivalentes.
import { getCollection } from 'astro:content';
import { calcularCalendario, guardarHistorial, hoyEnMadrid, leerHistorial } from './problemas/calendario';

export const noticiasPublicadas = async () =>
  (await getCollection('noticias', ({ data }) => data.estado === 'publicada')).sort(
    (a, b) => b.data.fecha.getTime() - a.data.fecha.getTime(),
  );

export const torneosProximos = async () =>
  (await getCollection('torneos', ({ data }) => data.estado === 'proximo')).sort(
    (a, b) => a.data.fecha.getTime() - b.data.fecha.getTime(),
  );

export const centrosActivos = async () =>
  (await getCollection('centros', ({ data }) => data.activo)).sort((a, b) => a.data.orden - b.data.orden);

// Problema del día, archivo y modo entrenamiento salen del mismo cálculo (lib/problemas/calendario.ts),
// que se hace una sola vez por compilación.
let calendario: ReturnType<typeof calcular> | undefined;

async function calcular() {
  const orden = { facil: 0, medio: 1, dificil: 2 };
  const problemas = (await getCollection('problemas'))
    .map((p) => p.data)
    .sort((a, b) => orden[a.nivel] - orden[b.nivel] || (a.origen === 'propio' ? -1 : 0) - (b.origen === 'propio' ? -1 : 0));
  const previo = leerHistorial();
  const resultado = calcularCalendario(problemas, previo, hoyEnMadrid());
  if (process.env.GUARDAR_HISTORIAL === '1' && JSON.stringify(resultado.historial) !== JSON.stringify(previo)) {
    guardarHistorial(resultado.historial);
  }
  return resultado;
}

export const calendarioProblemas = () => (calendario ??= calcular());
