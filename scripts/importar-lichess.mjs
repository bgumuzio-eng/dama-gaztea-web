// Importación de la base abierta de problemas de Lichess (licencia CC0, https://database.lichess.org/#puzzles).
// Descarga el fichero comprimido, elige 300 problemas por nivel y genera un CSV con las columnas de la hoja de problemas,
// listo para importar en la pestaña "lichess" (ver docs/guia-problemas.md).
//
// Uso (desde /scripts, la primera vez con npm install):
//   node importar-lichess.mjs                      descarga la base y escribe salida/problemas-lichess.csv
//   node importar-lichess.mjs --por-nivel 100      otro número de problemas por nivel
//   node importar-lichess.mjs --fichero base.csv.zst   usa un fichero ya descargado (.csv o .csv.zst)
//
// Niveles por puntuación de Lichess: fácil por debajo de 1200, medio de 1200 a 1700 y difícil por encima de 1700.
// Solo entran problemas fiables (populares, muy jugados y con puntuación estable), de 4 jugadas propias como máximo
// y con algún tema de la lista de la web. Ningún tema pasa de la quinta parte de un nivel, para que haya variedad.
import { createReadStream, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { createInterface } from 'node:readline';
import { createZstdDecompress } from 'node:zlib';
import { parseArgs } from 'node:util';
import { Chess } from 'chess.js';
import { TEMAS_PROBLEMA } from '../astro/src/lib/problemas/temas.ts';

const URL_BASE = 'https://database.lichess.org/lichess_db_puzzle.csv.zst';

const { values: opciones } = parseArgs({
  options: {
    'por-nivel': { type: 'string', default: '300' },
    fichero: { type: 'string' },
    salida: { type: 'string', default: fileURLToPath(new URL('salida/problemas-lichess.csv', import.meta.url)) },
  },
});
const POR_NIVEL = Number(opciones['por-nivel']);
const TOPE_POR_TEMA = Math.ceil(POR_NIVEL / 5);

const FILTRO = { popularidadMinima: 90, partidasMinimas: 1000, desviacionMaxima: 80, jugadasPropiasMaximas: 4 };

// Temas de Lichess -> temas de la web, por orden de preferencia: el primero que aparezca es el tema principal.
const TEMAS = [
  ['mateIn1', 'mate en 1'],
  ['mateIn2', 'mate en 2'],
  ['mateIn3', 'mate en 3'],
  ['backRankMate', 'mate del pasillo'],
  ['fork', 'horquilla'],
  ['pin', 'clavada'],
  ['skewer', 'enfilada'],
  ['discoveredAttack', 'descubierta'],
  ['doubleCheck', 'jaque doble'],
  ['deflection', 'desviación'],
  ['attraction', 'atracción'],
  ['hangingPiece', 'pieza indefensa'],
  ['sacrifice', 'sacrificio'],
  ['promotion', 'coronación'],
  ['endgame', 'finales'],
];
for (const [, tema] of TEMAS) if (!TEMAS_PROBLEMA.includes(tema)) throw new Error(`El tema "${tema}" no está en la lista de la web`);

// Notación española, como la escribe Álex en la hoja.
const A_ESPANOL = { N: 'C', B: 'A', R: 'T', Q: 'D', K: 'R' };
const aEspanol = (san) => san.replace(/[NBRQK]/g, (l) => A_ESPANOL[l]);

const nivelDe = (puntuacion) => (puntuacion < 1200 ? 'facil' : puntuacion <= 1700 ? 'medio' : 'dificil');

const elegidos = { facil: [], medio: [], dificil: [] };
const porTema = { facil: {}, medio: {}, dificil: {} };
const completo = () => Object.values(elegidos).every((l) => l.length >= POR_NIVEL);

function convertir([id, fen, jugadas, puntuacion, desviacion, popularidad, partidas, temasLichess]) {
  if (+popularidad < FILTRO.popularidadMinima || +partidas < FILTRO.partidasMinimas || +desviacion > FILTRO.desviacionMaxima) return;
  const uci = jugadas.split(' ');
  // La primera jugada es del rival; luego alternan visitante y rival, y la última es del visitante.
  if (uci.length / 2 > FILTRO.jugadasPropiasMaximas) return;
  const etiquetas = temasLichess.split(' ');
  if (etiquetas.includes('equality')) return;
  const tema = TEMAS.filter(([clave]) => etiquetas.includes(clave)).map(([, t]) => t);
  if (!tema.length) return;

  const nivel = nivelDe(+puntuacion);
  const principal = tema[0];
  if (elegidos[nivel].length >= POR_NIVEL || (porTema[nivel][principal] ?? 0) >= TOPE_POR_TEMA) return;

  const chess = new Chess(fen);
  const mover = (m) => chess.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] });
  mover(uci[0]);
  const posicion = chess.fen();
  const juegan = chess.turn() === 'w' ? 'blancas' : 'negras';
  const solucion = uci.slice(1).map((m) => aEspanol(mover(m).san));

  const mateEn = etiquetas.find((t) => /^mateIn\d$/.test(t))?.slice(-1);
  if (etiquetas.includes('mate') && !chess.isCheckmate()) return;
  const enunciado = mateEn
    ? `Juegan ${juegan} y dan mate en ${mateEn}`
    : etiquetas.includes('mate')
      ? `Juegan ${juegan} y dan mate`
      : `Juegan ${juegan} y ganan`;

  porTema[nivel][principal] = (porTema[nivel][principal] ?? 0) + 1;
  elegidos[nivel].push({
    id,
    fen: posicion,
    solucion: solucion.join(' '),
    nivel,
    tema: tema.join(', '),
    titulo: '',
    enunciado,
    origen: 'lichess',
    fecha_publicacion: '',
    notas: `Lichess ${puntuacion} · https://lichess.org/training/${id}`,
  });
}

const descarga = new AbortController();
let entrada;
if (opciones.fichero) {
  entrada = createReadStream(opciones.fichero);
  console.log(`Leyendo ${opciones.fichero}...`);
} else {
  console.log(`Descargando ${URL_BASE} (se para en cuanto tiene bastantes problemas)...`);
  const res = await fetch(URL_BASE, { signal: descarga.signal });
  if (!res.ok) throw new Error(`Lichess respondió ${res.status}`);
  entrada = Readable.fromWeb(res.body);
}
const comprimido = (opciones.fichero ?? URL_BASE).endsWith('.zst');
const lineas = createInterface({ input: comprimido ? entrada.pipe(createZstdDecompress()) : entrada, crlfDelay: Infinity });

let leidas = 0;
try {
  for await (const linea of lineas) {
    if (leidas++ === 0 && linea.startsWith('PuzzleId')) continue;
    convertir(linea.split(','));
    if (leidas % 200000 === 0) console.log(`${leidas} problemas leídos...`);
    if (completo()) break;
  }
} finally {
  descarga.abort();
  entrada.destroy();
}

const columnas = ['id', 'fen', 'solucion', 'nivel', 'tema', 'titulo', 'enunciado', 'origen', 'fecha_publicacion', 'notas'];
const celda = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const filas = Object.values(elegidos).flat();
const csv = [columnas.join(','), ...filas.map((f) => columnas.map((c) => celda(f[c])).join(','))].join('\n') + '\n';

mkdirSync(dirname(opciones.salida), { recursive: true });
writeFileSync(opciones.salida, csv);

console.log(`\n${leidas} problemas leídos; ${filas.length} elegidos en ${opciones.salida}`);
for (const [nivel, lista] of Object.entries(elegidos)) {
  const temas = Object.entries(porTema[nivel])
    .sort((a, b) => b[1] - a[1])
    .map(([t, n]) => `${t} ${n}`)
    .join(', ');
  console.log(`  ${nivel}: ${lista.length}${lista.length < POR_NIVEL ? ' (no hay bastantes)' : ''} · ${temas}`);
}
