// Lector de CSV (RFC 4180) para la hoja publicada de Google Sheets: comillas, comas y saltos de línea dentro de celdas.
// Devuelve una fila por registro con las cabeceras normalizadas ("Fecha publicación" -> "fecha_publicacion")
// y el número de fila de la hoja, para que los avisos digan dónde está el error.
export type Fila = { numero: number; celdas: Record<string, string> };

function registros(texto: string): string[][] {
  const filas: string[][] = [];
  let fila: string[] = [];
  let celda = '';
  let entreComillas = false;
  texto = texto.replace(/^﻿/, '');
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (entreComillas) {
      if (c === '"' && texto[i + 1] === '"') {
        celda += '"';
        i++;
      } else if (c === '"') entreComillas = false;
      else celda += c;
    } else if (c === '"') entreComillas = true;
    else if (c === ',') {
      fila.push(celda);
      celda = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      fila.push(celda);
      filas.push(fila);
      fila = [];
      celda = '';
    } else celda += c;
  }
  if (celda || fila.length) {
    fila.push(celda);
    filas.push(fila);
  }
  return filas;
}

export const normalizarCabecera = (c: string) =>
  c
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

export function leerCsv(texto: string): { cabeceras: string[]; filas: Fila[] } {
  const [cabecera = [], ...resto] = registros(texto);
  const cabeceras = cabecera.map(normalizarCabecera);
  const filas = resto
    .map((valores, i) => ({
      numero: i + 2,
      celdas: Object.fromEntries(cabeceras.map((c, j) => [c, (valores[j] ?? '').trim()])),
    }))
    .filter((f) => Object.values(f.celdas).some(Boolean));
  return { cabeceras, filas };
}
