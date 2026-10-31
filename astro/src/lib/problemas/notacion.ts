// Notación española (C, A, T, D, R) <-> inglesa de chess.js (N, B, R, Q, K).
// La usan el cargador de la hoja (build) y el entrenador (navegador).
const A_INGLES: Record<string, string> = { C: 'N', A: 'B', T: 'R', D: 'Q', R: 'K' };
const A_ESPANOL: Record<string, string> = { N: 'C', B: 'A', R: 'T', Q: 'D', K: 'R' };

export const deEspanol = (san: string) => san.trim().replace(/0/g, 'O').replace(/[CATDR]/g, (l) => A_INGLES[l]);
export const aEspanol = (san: string) => san.replace(/[NBRQK]/g, (l) => A_ESPANOL[l]);

// Separa la solución escrita en la hoja en jugadas sueltas. Admite números de jugada ("1. Txd8+ Rh7 2. Dg8#"),
// comas, signos de valoración (!, ?) y "a.p." de la captura al paso, que se descartan.
export const separarJugadas = (texto: string) =>
  texto
    .replace(/\b[ae]\.\s?p\./gi, ' ')
    .replace(/\d+\s*(\.+|…)/g, ' ')
    .split(/[\s,;]+/)
    .map((j) => j.replace(/[!?]+$/, ''))
    .filter(Boolean);
