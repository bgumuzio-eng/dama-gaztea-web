// Descarga una muestra de problemas de Lichess (CC0) y los guarda con el modelo `problema`.
// Solo para la maqueta: la importación real (fase 2) leerá el CSV completo de database.lichess.org.
// Uso: node scripts/muestra-lichess.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { Chess } from 'chess.js';

const PETICIONES = [
  { angle: 'mateIn1', difficulty: 'easiest' },
  { angle: 'fork', difficulty: 'easier' },
  { angle: 'pin', difficulty: 'normal' },
  { angle: 'mateIn2', difficulty: 'harder' },
];

const TEMAS = {
  mateIn1: 'mate en 1',
  mateIn2: 'mate en 2',
  mateIn3: 'mate en 3',
  fork: 'horquilla',
  pin: 'clavada',
  skewer: 'enfilada',
  discoveredAttack: 'descubierta',
  doubleCheck: 'jaque doble',
  deflection: 'desviación',
  sacrifice: 'sacrificio',
  backRankMate: 'mate del pasillo',
  endgame: 'finales',
};

const nivelPorPuntuacion = (r) => (r < 1200 ? 'facil' : r < 1800 ? 'medio' : 'dificil');

const salida = new URL('../src/content/problemas/', import.meta.url);
mkdirSync(salida, { recursive: true });

for (const { angle, difficulty } of PETICIONES) {
  const res = await fetch(`https://lichess.org/api/puzzle/next?angle=${angle}&difficulty=${difficulty}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Lichess respondió ${res.status}`);
  const { game, puzzle } = await res.json();

  // La partida termina en la jugada del rival; desde ahí mueve el visitante.
  const chess = new Chess();
  chess.loadPgn(game.pgn);
  const posicionFEN = chess.fen();
  const juegan = chess.turn() === 'w' ? 'blancas' : 'negras';

  const solucionJugadas = puzzle.solution.map((uci) =>
    chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] }).san,
  );

  const tema = [...new Set(puzzle.themes.map((t) => TEMAS[t]).filter(Boolean))];
  const problema = {
    titulo: '',
    posicionFEN,
    enunciado: `Juegan ${juegan} y ganan`,
    solucionJugadas,
    solucion: '',
    nivel: nivelPorPuntuacion(puzzle.rating),
    tema,
    origen: 'lichess',
    idLichess: puzzle.id,
    puntuacionLichess: puzzle.rating,
    publicado: true,
  };
  writeFileSync(new URL(`lichess-${puzzle.id}.json`, salida), JSON.stringify(problema, null, 2) + '\n');
  console.log(puzzle.id, puzzle.rating, problema.nivel, tema.join(', '), solucionJugadas.join(' '));
}
