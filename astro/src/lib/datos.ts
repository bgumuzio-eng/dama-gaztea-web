// Consultas comunes. Con Sanity se sustituirán por consultas GROQ equivalentes.
import { getCollection } from 'astro:content';

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

export const problemasPublicados = async () => {
  const orden = { facil: 0, medio: 1, dificil: 2 };
  return (await getCollection('problemas', ({ data }) => data.publicado)).sort(
    (a, b) =>
      orden[a.data.nivel] - orden[b.data.nivel] ||
      (a.data.origen === 'propio' ? -1 : 0) - (b.data.origen === 'propio' ? -1 : 0),
  );
};

// El problema de la semana es el problema propio con la fecha de destacado más reciente.
export const problemaDeLaSemana = async () =>
  (await getCollection('problemas', ({ data }) => data.publicado && data.origen === 'propio' && !!data.destacadoSemana)).sort(
    (a, b) => b.data.destacadoSemana!.getTime() - a.data.destacadoSemana!.getTime(),
  )[0];
