// Lista controlada de temas (sección 9.2 de docs/especificacion.md). La hoja y la importación de Lichess usan estos nombres.
export const NIVELES_PROBLEMA = ['facil', 'medio', 'dificil'] as const;
export type Nivel = (typeof NIVELES_PROBLEMA)[number];

export const TEMAS_PROBLEMA = [
  'mate en 1', 'mate en 2', 'mate en 3', 'mate del pasillo', 'clavada', 'horquilla', 'ataque doble',
  'enfilada', 'descubierta', 'jaque doble', 'desviación', 'atracción', 'pieza indefensa', 'sacrificio',
  'coronación', 'finales',
] as const;
