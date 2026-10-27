// Colecciones locales de la maqueta. Cada una replica un tipo de documento de Sanity
// (sección 6 de docs/especificacion.md) para que la migración sea directa.
// El slug de Sanity equivale al nombre del fichero (entry.id).
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// En Sanity será un asset de imagen con recorte; en la maqueta, src vacío muestra un hueco de foto.
const imagen = z.object({
  src: z.string().optional(),
  alt: z.string().min(1),
});

export const CATEGORIAS = [
  'Academia', 'Clases', 'Alumnos', 'Torneos', 'Club', 'Circuito', 'Ajedrez educativo', 'Vídeos', 'Actualidad',
] as const;

export const TEMAS_VIDEO = [
  'Aperturas', 'Táctica y combinaciones', 'Problemas de mate', 'Finales', 'Estrategia',
  'Partidas históricas', 'Análisis', 'Trucos y curiosidades', 'Clases', 'Partidas de torneos',
] as const;

export const TEMAS_PROBLEMA = [
  'mate en 1', 'mate en 2', 'mate en 3', 'mate del pasillo', 'clavada', 'horquilla', 'ataque doble',
  'enfilada', 'descubierta', 'jaque doble', 'desviación', 'sacrificio', 'finales',
] as const;

const noticias = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/noticias' }),
  schema: z.object({
    titulo: z.string(),
    fecha: z.coerce.date(),
    imagenPrincipal: imagen,
    resumen: z.string().max(160),
    categoria: z.enum(CATEGORIAS),
    etiquetas: z.array(z.string()).default([]),
    galeria: z.array(imagen).default([]),
    fuente: z.object({ nombre: z.string(), url: z.string().url() }).optional(),
    torneoRelacionado: reference('torneos').optional(),
    destacada: z.boolean().default(false),
    estado: z.enum(['borrador', 'publicada']).default('publicada'),
  }),
});

const centros = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/centros' }),
  schema: z.object({
    nombre: z.string(),
    localidad: z.enum(['Bilbao', 'Getxo', 'Sestao', 'Otra']),
    tipo: z.enum(['academia', 'colegio', 'otro']),
    direccion: z.string(),
    ubicacion: z.object({ lat: z.number(), lng: z.number() }),
    descripcion: z.string(),
    grupos: z.array(
      z.object({
        nivel: z.string(),
        diaSemana: z.string(),
        horaInicio: z.string(),
        horaFin: z.string(),
        edades: z.string(),
        plazasDisponibles: z.number().optional(),
      }),
    ),
    mostrarPlazas: z.boolean().default(false),
    fotos: z.array(imagen).default([]),
    activo: z.boolean().default(true),
    orden: z.number().default(0),
  }),
});

const torneos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/torneos' }),
  schema: z.object({
    nombre: z.string(),
    fecha: z.coerce.date(),
    horaInicio: z.string(),
    fechaFin: z.coerce.date().optional(),
    lugar: z.object({ texto: z.string().optional(), centro: reference('centros').optional() }),
    tipo: z.enum(['propio', 'circuito', 'externo', 'escolar']),
    perteneceAlCircuito: z.boolean().default(false),
    numeroDePrueba: z.number().optional(),
    bases: z.object({ titulo: z.string(), url: z.string() }).optional(),
    inscripcion: z.object({ tipo: z.enum(['formulario', 'externa']), url: z.string().optional() }),
    fechaLimite: z.coerce.date().optional(),
    cronica: z.string().optional(),
    enlaceChessResults: z.string().url().optional(),
    partidas: z.array(z.object({ titulo: z.string(), pgn: z.string() })).default([]),
    fotos: z.array(imagen).default([]),
    estado: z.enum(['proximo', 'celebrado', 'cancelado']),
  }),
});

const videos = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/videos' }),
  schema: z.object({
    titulo: z.string(),
    urlYoutube: z.string(),
    tema: z.enum(TEMAS_VIDEO),
    explicacion: z.string(),
    posicionFEN: z.string().optional(),
    solucion: z.string().optional(),
    fecha: z.coerce.date(),
  }),
});

const problemas = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/problemas' }),
  schema: z.object({
    titulo: z.string().default(''),
    posicionFEN: z.string(),
    enunciado: z.string(),
    solucionJugadas: z.array(z.string()).min(1),
    solucion: z.string().default(''),
    nivel: z.enum(['facil', 'medio', 'dificil']),
    tema: z.array(z.enum(TEMAS_PROBLEMA)).default([]),
    origen: z.enum(['propio', 'lichess']),
    idLichess: z.string().optional(),
    puntuacionLichess: z.number().optional(),
    destacadoSemana: z.coerce.date().optional(),
    publicado: z.boolean().default(true),
  }),
});

export const collections = { noticias, centros, torneos, videos, problemas };
