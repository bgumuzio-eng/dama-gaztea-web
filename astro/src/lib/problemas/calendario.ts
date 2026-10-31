// Problema del día y archivo por fechas (sección 9.4 de docs/especificacion.md).
// - El problema del día es el que tiene fecha_publicacion de hoy (hora de Madrid).
// - Si no hay ninguno, se elige uno del fondo común (problemas sin fecha) que no haya salido antes,
//   de forma determinista a partir de la fecha: todas las compilaciones del mismo día eligen el mismo.
// - Los elegidos del fondo común se apuntan en src/data/historial-problemas.json. Así el archivo no cambia
//   aunque Álex añada o quite filas, y "no usado" significa de verdad que no ha salido ningún día anterior.
// - Los problemas con fecha futura no se publican en ningún sitio hasta su día.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type Historial = Record<string, string>;
type ConFecha = { id: string; fechaPublicacion?: string };

const RUTA_HISTORIAL = resolve(process.cwd(), 'src/data/historial-problemas.json');

// PROBLEMAS_HOY=AAAA-MM-DD permite ver cómo quedará la web otro día.
export const hoyEnMadrid = () =>
  process.env.PROBLEMAS_HOY ?? new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());

export function leerHistorial(): Historial {
  try {
    return JSON.parse(readFileSync(RUTA_HISTORIAL, 'utf8'));
  } catch {
    return {};
  }
}

// Solo se escribe en la compilación de GitHub Actions (GUARDAR_HISTORIAL=1), que después lo guarda en el repositorio.
export function guardarHistorial(historial: Historial) {
  const ordenado = Object.fromEntries(Object.entries(historial).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(RUTA_HISTORIAL, JSON.stringify(ordenado, null, 2) + '\n');
}

// FNV-1a de 32 bits: el mismo texto da siempre el mismo número, en cualquier máquina.
function resumen(texto: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 0x01000193) >>> 0;
  return h;
}

function elegirDelFondo<T extends ConFecha>(fondo: T[], historial: Historial, hoy: string): T | undefined {
  if (!fondo.length) return undefined;
  const ultimoUso = new Map<string, string>();
  for (const [fecha, id] of Object.entries(historial)) {
    if (fecha < hoy && fecha > (ultimoUso.get(id) ?? '')) ultimoUso.set(id, fecha);
  }
  let candidatos = fondo.filter((p) => !ultimoUso.has(p.id));
  // Si ya salieron todos, vuelve a salir el que lleva más tiempo sin salir.
  if (!candidatos.length) {
    const masAntigua = fondo.map((p) => ultimoUso.get(p.id)!).sort()[0];
    candidatos = fondo.filter((p) => ultimoUso.get(p.id) === masAntigua);
  }
  return candidatos[resumen(hoy) % candidatos.length];
}

export function calcularCalendario<T extends ConFecha>(problemas: T[], historialPrevio: Historial, hoy: string) {
  const porId = new Map(problemas.map((p) => [p.id, p]));
  const porFecha = new Map(problemas.filter((p) => p.fechaPublicacion).map((p) => [p.fechaPublicacion!, p]));
  const fondo = problemas.filter((p) => !p.fechaPublicacion).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  // Las entradas posteriores a hoy (por ejemplo, de una prueba con PROBLEMAS_HOY) no cuentan.
  const historial: Historial = Object.fromEntries(Object.entries(historialPrevio).filter(([fecha]) => fecha <= hoy));

  let delDia = porFecha.get(hoy);
  if (!delDia) {
    const yaElegido = porId.get(historial[hoy] ?? '');
    delDia = yaElegido && !yaElegido.fechaPublicacion ? yaElegido : elegirDelFondo(fondo, historial, hoy);
    if (delDia) historial[hoy] = delDia.id;
  }

  const fechas = new Set([...porFecha.keys(), ...Object.keys(historial)].filter((f) => f <= hoy));
  const archivo = [...fechas]
    .sort((a, b) => b.localeCompare(a))
    .map((fecha) => ({ fecha, problema: porFecha.get(fecha) ?? porId.get(historial[fecha]) }))
    .filter((d): d is { fecha: string; problema: T } => !!d.problema);

  const publicados = problemas.filter((p) => !p.fechaPublicacion || p.fechaPublicacion <= hoy);

  return { hoy, delDia, archivo, publicados, historial };
}
