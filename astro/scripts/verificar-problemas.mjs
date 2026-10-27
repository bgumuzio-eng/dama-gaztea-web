// Comprueba que la solución de cada problema es legal desde su posición.
// Uso: node scripts/verificar-problemas.mjs
import { readdirSync, readFileSync } from 'node:fs';
import { Chess } from 'chess.js';

const carpeta = new URL('../src/content/problemas/', import.meta.url);
let errores = 0;
for (const fichero of readdirSync(carpeta)) {
  const p = JSON.parse(readFileSync(new URL(fichero, carpeta), 'utf8'));
  try {
    const chess = new Chess(p.posicionFEN);
    for (const jugada of p.solucionJugadas) chess.move(jugada);
    console.log(`ok  ${fichero}${chess.isCheckmate() ? ' (mate)' : ''}`);
  } catch (e) {
    errores++;
    console.log(`MAL ${fichero}: ${e.message}`);
  }
}
process.exit(errores ? 1 : 0);
