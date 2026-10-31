// Convierte una fila de la hoja en un problema y comprueba con chess.js que se puede publicar:
// posición legal, solución legal, que acaba con una jugada del bando que resuelve y que da mate si el enunciado lo dice.
// Un error descarta el problema; un aviso (tema desconocido) solo se anota en el registro.
import { Chess, validateFen } from 'chess.js';
import type { Fila } from './csv';
import { deEspanol, separarJugadas } from './notacion';
import { NIVELES_PROBLEMA, TEMAS_PROBLEMA, type Nivel } from './temas';

export type Problema = {
  id: string;
  titulo: string;
  posicionFEN: string;
  enunciado: string;
  solucionJugadas: string[];
  nivel: Nivel;
  tema: string[];
  origen: 'propio' | 'lichess';
  fechaPublicacion?: string;
};

export type Validacion = { problema: Problema; avisos: string[] } | { error: string };

const sinTildes = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const ERRORES_FEN: [RegExp, string][] = [
  [/six space-delimited/, 'le faltan campos'],
  [/8 '\/'-delimited rows|too many squares|consecutive number|invalid piece/, 'la colocación de piezas está mal escrita'],
  [/side-to-move/, 'no indica a quién le toca mover (w o b)'],
  [/castling/, 'los enroques están mal escritos'],
  [/en-passant/, 'la casilla de captura al paso no es posible'],
  [/missing (white|black) king/, 'falta uno de los reyes'],
  [/too many (white|black) kings/, 'hay más de un rey del mismo color'],
  [/pawns are on the edge rows/, 'hay peones en la primera u octava fila'],
];

// La FEN del editor de Lichess puede llegar con guiones bajos (copiada de la barra de direcciones) o sin los contadores.
function normalizarFen(fen: string) {
  const campos = fen.replace(/_/g, ' ').trim().split(/\s+/);
  if (campos.length === 4) campos.push('0', '1');
  return campos.join(' ');
}

// Admite AAAA-MM-DD y también DD/MM/AAAA, que es como Google Sheets en castellano exporta una celda con formato de fecha.
function leerFecha(texto: string): string | null {
  const iso = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const es = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!iso && !es) return null;
  const [a, m, d] = iso ? [iso[1], iso[2], iso[3]] : [es![3], es![2], es![1]];
  const fecha = new Date(Date.UTC(+a, +m - 1, +d));
  if (fecha.getUTCMonth() !== +m - 1 || fecha.getUTCDate() !== +d) return null;
  return fecha.toISOString().slice(0, 10);
}

function esLegal(fen: string, san: string) {
  try {
    new Chess(fen).move(san);
    return true;
  } catch {
    return false;
  }
}

export function validarFila({ celdas }: Fila): Validacion {
  const avisos: string[] = [];

  const id = celdas.id ?? '';
  if (!id) return { error: 'falta el id' };
  if (!/^[A-Za-z0-9_-]+$/.test(id)) return { error: `el id "${id}" solo puede llevar letras sin tilde, números y guiones` };

  const posicionFEN = normalizarFen(celdas.fen ?? '');
  if (!posicionFEN) return { error: 'falta la FEN' };
  const fenValida = validateFen(posicionFEN);
  if (!fenValida.ok) {
    const motivo = ERRORES_FEN.find(([patron]) => patron.test(fenValida.error!))?.[1] ?? fenValida.error;
    return { error: `la FEN no es válida: ${motivo}` };
  }
  // El bando que no mueve no puede estar en jaque: casi siempre es que el turno de la FEN está al revés.
  const campos = posicionFEN.split(' ');
  const alReves = [campos[0], campos[1] === 'w' ? 'b' : 'w', campos[2], '-', '0', '1'].join(' ');
  if (new Chess(alReves).inCheck()) return { error: 'el bando que no mueve está en jaque; revisa a quién le toca mover en la FEN' };

  const chess = new Chess(posicionFEN);
  if (!chess.moves().length) return { error: 'en la posición no hay ninguna jugada legal' };
  const juegan = chess.turn() === 'w' ? 'blancas' : 'negras';

  const nivel = sinTildes(celdas.nivel ?? '') as Nivel;
  if (!NIVELES_PROBLEMA.includes(nivel)) return { error: `el nivel "${celdas.nivel ?? ''}" no es facil, medio ni dificil` };

  const origen = sinTildes(celdas.origen || 'propio');
  if (origen !== 'propio' && origen !== 'lichess') return { error: `el origen "${celdas.origen}" no es propio ni lichess` };

  const tema: string[] = [];
  for (const t of (celdas.tema ?? '').split(/[,;]/).map((t) => t.trim()).filter(Boolean)) {
    const conocido = TEMAS_PROBLEMA.find((c) => sinTildes(c) === sinTildes(t));
    if (conocido) {
      if (!tema.includes(conocido)) tema.push(conocido);
    } else avisos.push(`el tema "${t}" no está en la lista y no se usa`);
  }

  const enunciado = celdas.enunciado || `Juegan ${juegan} y ganan`;
  const otro = juegan === 'blancas' ? 'negras' : 'blancas';
  if (new RegExp(`\\b(juegan|mueven) ${otro}\\b`, 'i').test(enunciado)) {
    return { error: `el enunciado dice que juegan ${otro}, pero en la FEN les toca a las ${juegan}` };
  }

  const escritas = separarJugadas(celdas.solucion ?? '');
  if (!escritas.length) return { error: 'falta la solución' };
  const solucionJugadas: string[] = [];
  for (const [i, escrita] of escritas.entries()) {
    if (chess.isGameOver()) return { error: `la solución sigue después del mate o de las tablas (sobra desde ${escrita})` };
    try {
      solucionJugadas.push(chess.move(deEspanol(escrita)).san);
    } catch {
      // Error típico del editor: la posición está bien pero el turno no. Si la primera jugada vale para el otro bando, se dice.
      if (i === 0 && esLegal(alReves, deEspanol(escrita))) return { error: `la primera jugada (${escrita}) es de las ${otro}, pero en la FEN les toca a las ${juegan}` };
      return { error: `la jugada ${i + 1} de la solución (${escrita}) no es legal en esa posición` };
    }
  }
  if (solucionJugadas.length % 2 === 0) {
    return { error: 'la solución tiene que acabar con una jugada del bando que resuelve (sobra la última respuesta del rival)' };
  }

  const pideMate = /\bmate\b/i.test(enunciado) || tema.some((t) => t.startsWith('mate'));
  if (pideMate && !chess.isCheckmate()) return { error: 'el enunciado o el tema dicen mate, pero la solución no termina en mate' };
  const mateEn = Number((enunciado.match(/mate en (\d+)/i) ?? tema.join(' ').match(/mate en (\d+)/))?.[1] ?? 0);
  const jugadasPropias = (solucionJugadas.length + 1) / 2;
  if (mateEn && mateEn !== jugadasPropias) {
    return { error: `dice mate en ${mateEn}, pero la solución da mate en ${jugadasPropias}` };
  }

  let fechaPublicacion: string | undefined;
  if (celdas.fecha_publicacion) {
    const fecha = leerFecha(celdas.fecha_publicacion);
    if (!fecha) return { error: `la fecha "${celdas.fecha_publicacion}" no se entiende; escríbela como AAAA-MM-DD` };
    fechaPublicacion = fecha;
  }

  return {
    problema: { id, titulo: celdas.titulo ?? '', posicionFEN, enunciado, solucionJugadas, nivel, tema, origen, fechaPublicacion },
    avisos,
  };
}

// Lo que llega al navegador: sin fecha ni origen. Solo los problemas de Álex llevan marca (distintivo propio);
// los importados se ven igual que el resto, sin mención de la fuente.
export type ProblemaWeb = Omit<Problema, 'origen' | 'fechaPublicacion'> & { propio: boolean };

export const paraLaWeb = ({ origen, fechaPublicacion, ...p }: Problema): ProblemaWeb => ({ ...p, propio: origen === 'propio' });
