import ajustes from '../data/ajustes.json';

const zona = 'Europe/Madrid';

export const fechaLarga = (d: Date) =>
  new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: zona }).format(d);

export const fechaCorta = (d: Date) =>
  new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', timeZone: zona }).format(d);

export const diaMes = (d: Date) => ({
  dia: new Intl.DateTimeFormat('es-ES', { day: 'numeric', timeZone: zona }).format(d),
  mes: new Intl.DateTimeFormat('es-ES', { month: 'short', timeZone: zona }).format(d).replace('.', ''),
});

export const diaSemana = (d: Date) =>
  new Intl.DateTimeFormat('es-ES', { weekday: 'long', timeZone: zona }).format(d);

export const isoDia = (d: Date) => d.toISOString().slice(0, 10);

// Fechas de calendario sin hora ("2026-10-31", como en la hoja de problemas): a mediodía UTC para que en Madrid sea el mismo día.
export const diaDeCalendario = (iso: string) => new Date(`${iso}T12:00:00Z`);

export const enlaceWhatsApp = (mensaje: string = ajustes.whatsapp.mensaje) =>
  `https://wa.me/${ajustes.whatsapp.numero}?text=${encodeURIComponent(mensaje)}`;

export const NIVELES = { facil: 'Fácil', medio: 'Medio', dificil: 'Difícil' } as const;

export const TIPOS_TORNEO = {
  propio: 'Torneo propio',
  circuito: 'Circuito',
  externo: 'Externo',
  escolar: 'Escolar',
} as const;

export const TIPOS_CENTRO = { academia: 'Academia', colegio: 'Colegio', otro: 'Centro' } as const;

// Glifos con selector de variación de texto para que el móvil no los convierta en emoji.
export const PIEZAS = {
  dama: '♛︎',
  peon: '♟︎',
  torre: '♜︎',
  caballo: '♞︎',
  rey: '♚︎',
} as const;

export type Pieza = keyof typeof PIEZAS;

export const PIEZA_CATEGORIA: Record<string, Pieza> = {
  Academia: 'dama',
  Clases: 'peon',
  Alumnos: 'peon',
  Torneos: 'torre',
  Club: 'torre',
  Circuito: 'rey',
  'Ajedrez educativo': 'dama',
  Vídeos: 'caballo',
  Actualidad: 'caballo',
};
