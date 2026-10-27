// Lógica del entrenador de problemas (sección 9 de docs/especificacion.md).
// chess.js valida las reglas; chessground pinta el tablero. El progreso vive en localStorage.
import { Chess, type Move } from 'chess.js';
import { Chessground } from 'chessground';
import type { Key } from 'chessground/types';

type Nivel = 'facil' | 'medio' | 'dificil';
type Problema = {
  id: string;
  titulo: string;
  posicionFEN: string;
  enunciado: string;
  solucionJugadas: string[];
  solucion: string;
  nivel: Nivel;
  tema: string[];
  origen: 'propio' | 'lichess';
  idLichess?: string;
  puntuacionLichess?: number;
};
type Resultado = 'acierto' | 'resuelto' | 'visto';
type Progreso = { resueltos: Record<string, Resultado>; aciertos: number; racha: number; mejorRacha: number };

const CLAVE = 'dg-problemas-v1';
const NIVELES: Record<Nivel, string> = { facil: 'Fácil', medio: 'Medio', dificil: 'Difícil' };
const progresoVacio = (): Progreso => ({ resueltos: {}, aciertos: 0, racha: 0, mejorRacha: 0 });

function leerProgreso(): Progreso {
  try {
    const p = JSON.parse(localStorage.getItem(CLAVE) ?? 'null');
    if (p && typeof p === 'object' && p.resueltos) return { ...progresoVacio(), ...p };
  } catch {}
  return progresoVacio();
}

function guardarProgreso(p: Progreso) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(p));
  } catch {}
}

// Notación española (C, A, T, D, R) <-> inglesa de chess.js (N, B, R, Q, K)
const A_INGLES: Record<string, string> = { C: 'N', A: 'B', T: 'R', D: 'Q', R: 'K' };
const A_ESPANOL: Record<string, string> = { N: 'C', B: 'A', R: 'T', Q: 'D', K: 'R' };
const deEspanol = (san: string) => san.trim().replace(/0/g, 'O').replace(/[CATDR]/g, (l) => A_INGLES[l]);
const aEspanol = (san: string) => san.replace(/[NBRQK]/g, (l) => A_ESPANOL[l]);

const raiz = document.querySelector<HTMLElement>('[data-problemas]');
if (raiz) iniciar(raiz);

function iniciar(raiz: HTMLElement) {
  const problemas: Problema[] = JSON.parse(raiz.querySelector('script[type="application/json"]')!.textContent!);
  const $ = <T extends HTMLElement = HTMLElement>(sel: string) => raiz.querySelector<T>(sel)!;

  const ui = {
    distintivo: $('[data-distintivo]'),
    enunciado: $('[data-enunciado]'),
    meta: $('[data-meta]'),
    mensaje: $('[data-mensaje]'),
    solucion: $('[data-solucion]'),
    solucionJugadas: $('[data-solucion-jugadas]'),
    solucionTexto: $('[data-solucion-texto]'),
    formJugada: $<HTMLFormElement>('[data-form-jugada]'),
    tema: $<HTMLSelectElement>('select[name="tema"]'),
    sinResultados: $('[data-sin-resultados]'),
  };

  let progreso = leerProgreso();
  let actual: Problema;
  let chess: Chess;
  let paso = 0;
  let ultima: [Key, Key] | undefined;
  let fallado = false;
  let usoPista = false;
  let vioSolucion = false;
  let terminado = false;
  let bloqueado = false;
  let temporizadores: number[] = [];

  const cg = Chessground($('[data-tablero]'), {
    coordinates: true,
    animation: { duration: 220 },
    premovable: { enabled: false },
    drawable: { enabled: false, visible: true },
    movable: { free: false, showDests: true, events: { after: (orig, dest) => intentar({ from: orig, to: dest, promotion: 'q' }) } },
  });

  const colorTurno = () => (chess.turn() === 'w' ? 'white' : 'black');

  function destinos() {
    const mapa = new Map<Key, Key[]>();
    for (const m of chess.moves({ verbose: true })) mapa.set(m.from, [...(mapa.get(m.from) ?? []), m.to]);
    return mapa;
  }

  function sincronizar() {
    const puedeMover = !terminado && !bloqueado;
    cg.set({
      fen: chess.fen(),
      turnColor: colorTurno(),
      check: chess.inCheck(),
      lastMove: ultima,
      movable: { color: puedeMover ? colorTurno() : undefined, dests: puedeMover ? destinos() : new Map() },
    });
  }

  function mensaje(texto: string, tipo: 'info' | 'ok' | 'error' = 'info') {
    ui.mensaje.textContent = texto;
    ui.mensaje.dataset.tipo = tipo;
  }

  const esperar = (ms: number, fn: () => void) => temporizadores.push(window.setTimeout(fn, ms));

  function cargar(p: Problema) {
    temporizadores.forEach(clearTimeout);
    temporizadores = [];
    actual = p;
    chess = new Chess(p.posicionFEN);
    paso = 0;
    ultima = undefined;
    fallado = usoPista = vioSolucion = terminado = bloqueado = false;

    // Sin animación al cargar: si no, las piezas "viajan" desde la posición anterior.
    cg.set({ orientation: colorTurno(), animation: { enabled: false } });
    cg.setAutoShapes([]);
    sincronizar();
    cg.set({ animation: { enabled: true } });

    ui.distintivo.innerHTML =
      p.origen === 'propio'
        ? '<span class="etiqueta etiqueta--oro">De las clases de Dama Gaztea</span>'
        : `<span class="etiqueta">Base abierta de Lichess (CC0)</span>`;
    ui.enunciado.textContent = p.enunciado;
    const detalles = [NIVELES[p.nivel], p.tema.join(', ')];
    if (p.titulo) detalles.unshift(p.titulo);
    if (p.puntuacionLichess) detalles.push(`puntuación ${p.puntuacionLichess}`);
    ui.meta.textContent = detalles.filter(Boolean).join(' · ');
    ui.solucion.hidden = true;

    const previo = progreso.resueltos[p.id];
    mensaje(
      previo
        ? `Ya resolviste este problema. Puedes repetirlo, pero no vuelve a contar. Juegan ${colorTurno() === 'white' ? 'blancas' : 'negras'}.`
        : `Te toca: juegan ${colorTurno() === 'white' ? 'blancas' : 'negras'}. Mueve una pieza.`,
    );

    raiz.querySelectorAll('[data-item]').forEach((li) => li.classList.toggle('actual', (li as HTMLElement).dataset.item === p.id));
    const url = new URL(location.href);
    url.searchParams.set('p', p.id);
    history.replaceState(null, '', url);
  }

  function jugadaEsperada(): Move {
    return new Chess(chess.fen()).move(actual.solucionJugadas[paso]);
  }

  function intentar(entrada: string | { from: string; to: string; promotion: string }) {
    if (terminado || bloqueado) return;
    const esperada = jugadaEsperada();
    let jugada: Move;
    try {
      jugada = chess.move(entrada);
    } catch {
      mensaje('No entiendo esa jugada o no es legal en esta posición. Ejemplos: Cf3, exd5, Txd8+, O-O.', 'error');
      sincronizar();
      return;
    }

    // Se acepta la jugada de la solución o cualquier otra que dé mate.
    const correcta =
      (jugada.from === esperada.from && jugada.to === esperada.to && (jugada.promotion ?? '') === (esperada.promotion ?? '')) ||
      chess.isCheckmate();

    if (!correcta) {
      fallado = true;
      bloqueado = true;
      const anterior = ultima;
      ultima = [jugada.from, jugada.to];
      sincronizar();
      mensaje(`${aEspanol(jugada.san)} no es la mejor. La pieza vuelve a su sitio: inténtalo otra vez.`, 'error');
      esperar(650, () => {
        chess.undo();
        ultima = anterior;
        bloqueado = false;
        sincronizar();
      });
      return;
    }

    paso++;
    ultima = [jugada.from, jugada.to];
    cg.setAutoShapes([]);
    if (chess.isCheckmate() || paso >= actual.solucionJugadas.length) return finalizar();

    bloqueado = true;
    sincronizar();
    mensaje(`¡Bien! ${aEspanol(jugada.san)} es correcta. Mira cómo responde el rival...`, 'ok');
    esperar(600, () => {
      const respuesta = chess.move(actual.solucionJugadas[paso]);
      paso++;
      ultima = [respuesta.from, respuesta.to];
      bloqueado = false;
      sincronizar();
      mensaje(`El rival juega ${aEspanol(respuesta.san)}. Te toca otra vez.`, 'ok');
    });
  }

  function finalizar() {
    terminado = true;
    bloqueado = false;
    sincronizar();

    const previo = progreso.resueltos[actual.id];
    const limpio = !fallado && !usoPista && !vioSolucion;
    if (!previo) {
      if (limpio) {
        progreso.resueltos[actual.id] = 'acierto';
        progreso.aciertos++;
        progreso.racha++;
        progreso.mejorRacha = Math.max(progreso.mejorRacha, progreso.racha);
      } else {
        progreso.resueltos[actual.id] = vioSolucion ? 'visto' : 'resuelto';
        progreso.racha = 0;
      }
      guardarProgreso(progreso);
    }

    if (vioSolucion) mensaje('Esta es la solución. Prueba con el siguiente problema.', 'info');
    else if (previo) mensaje('¡Resuelto otra vez! Como ya lo tenías, no cambia el marcador.', 'ok');
    else if (limpio) mensaje(`¡Resuelto a la primera! Llevas una racha de ${progreso.racha}.`, 'ok');
    else mensaje('¡Resuelto! Esta vez no suma a la racha porque has fallado alguna jugada o has usado la pista.', 'ok');

    mostrarSolucion();
    pintarProgreso();
  }

  function mostrarSolucion() {
    const c = new Chess(actual.posicionFEN);
    const partes: string[] = [];
    for (const san of actual.solucionJugadas) {
      const numero = c.moveNumber();
      const blancas = c.turn() === 'w';
      const m = c.move(san);
      if (blancas) partes.push(`${numero}. ${aEspanol(m.san)}`);
      else partes.push(partes.length === 0 ? `${numero}... ${aEspanol(m.san)}` : aEspanol(m.san));
    }
    ui.solucionJugadas.textContent = partes.join(' ');
    ui.solucionTexto.textContent = actual.solucion;
    ui.solucion.hidden = false;
  }

  function pista() {
    if (terminado || bloqueado) return;
    usoPista = true;
    cg.setAutoShapes([{ orig: jugadaEsperada().from, brush: 'green' }]);
    mensaje('La pieza marcada con el círculo es la que tienes que mover.', 'info');
  }

  function verSolucion() {
    if (terminado) return;
    temporizadores.forEach(clearTimeout);
    temporizadores = [];
    vioSolucion = true;
    bloqueado = true;
    cg.setAutoShapes([]);
    // Si había una jugada equivocada pendiente de deshacer, se vuelve a la última posición buena.
    if (chess.history().length > paso) chess.undo();
    const siguiente = () => {
      if (paso >= actual.solucionJugadas.length) return finalizar();
      const m = chess.move(actual.solucionJugadas[paso]);
      paso++;
      ultima = [m.from, m.to];
      sincronizar();
      esperar(700, siguiente);
    };
    siguiente();
  }

  function filtrados() {
    const nivel = (raiz.querySelector<HTMLInputElement>('input[name="nivel"]:checked')?.value ?? 'todos') as Nivel | 'todos';
    const tema = ui.tema.value;
    return problemas.filter((p) => (nivel === 'todos' || p.nivel === nivel) && (tema === 'todos' || p.tema.includes(tema)));
  }

  function siguienteProblema() {
    const lista = filtrados();
    if (!lista.length) return;
    const desde = Math.max(0, lista.findIndex((p) => p.id === actual.id));
    const ordenados = [...lista.slice(desde + 1), ...lista.slice(0, desde + 1)];
    cargar(ordenados.find((p) => !progreso.resueltos[p.id] && p.id !== actual.id) ?? ordenados[0]);
  }

  function aplicarFiltros() {
    const visibles = new Set(filtrados().map((p) => p.id));
    raiz.querySelectorAll<HTMLElement>('[data-item]').forEach((li) => (li.hidden = !visibles.has(li.dataset.item!)));
    ui.sinResultados.hidden = visibles.size > 0;
    if (visibles.size && !visibles.has(actual.id)) siguienteProblema();
  }

  function pintarProgreso() {
    const marcador = (k: string, v: string | number) => ($(`[data-marcador="${k}"]`).textContent = String(v));
    marcador('aciertos', progreso.aciertos);
    marcador('racha', progreso.racha);
    marcador('mejorRacha', progreso.mejorRacha);
    marcador('resueltos', `${problemas.filter((p) => progreso.resueltos[p.id]).length}/${problemas.length}`);
    raiz.querySelectorAll<HTMLElement>('[data-item]').forEach((li) => {
      const r = progreso.resueltos[li.dataset.item!];
      const estado = li.querySelector<HTMLElement>('[data-estado]')!;
      estado.textContent = r === 'acierto' ? '★' : r ? '✓' : '';
      estado.setAttribute('aria-label', r === 'acierto' ? 'Acierto' : r ? 'Resuelto con ayuda' : 'Sin resolver');
    });
  }

  raiz.addEventListener('click', (e) => {
    const objetivo = (e.target as HTMLElement).closest<HTMLElement>('[data-accion], [data-cargar]');
    if (!objetivo) return;
    if (objetivo.dataset.cargar) {
      cargar(problemas.find((p) => p.id === objetivo.dataset.cargar)!);
      $('[data-tablero]').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    switch (objetivo.dataset.accion) {
      case 'pista':
        return pista();
      case 'solucion':
        return verSolucion();
      case 'reiniciar':
        return cargar(actual);
      case 'siguiente':
        return siguienteProblema();
      case 'borrar':
        progreso = progresoVacio();
        guardarProgreso(progreso);
        pintarProgreso();
        return cargar(actual);
    }
  });

  ui.formJugada.addEventListener('submit', (e) => {
    e.preventDefault();
    const campo = ui.formJugada.elements.namedItem('jugada') as HTMLInputElement;
    if (!campo.value.trim()) return;
    intentar(deEspanol(campo.value));
    campo.value = '';
  });

  raiz.querySelectorAll('input[name="nivel"]').forEach((r) => r.addEventListener('change', aplicarFiltros));
  ui.tema.addEventListener('change', aplicarFiltros);

  const pedido = new URLSearchParams(location.search).get('p') ?? raiz.dataset.inicial;
  cargar(problemas.find((p) => p.id === pedido) ?? problemas[0]);
  pintarProgreso();
}
