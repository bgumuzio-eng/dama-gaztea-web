// Lógica del entrenador de problemas (sección 9 de docs/especificacion.md).
// chess.js valida las reglas; chessground pinta el tablero. El progreso vive en localStorage.
// La página trae el problema del día; el resto se descarga de problemas.json para no cargar cientos de problemas en el HTML.
// Parámetros de la dirección: ?p=<id> abre un problema concreto; ?nivel=medio&tema=clavada abre el modo entrenamiento.
import { Chess, type Move } from 'chess.js';
import { Chessground } from 'chessground';
import type { Key } from 'chessground/types';
import { aEspanol, deEspanol } from '../lib/problemas/notacion';
import type { ProblemaWeb as Problema } from '../lib/problemas/validar';

type Nivel = Problema['nivel'];

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

const raiz = document.querySelector<HTMLElement>('[data-problemas]');
if (raiz) iniciar(raiz);

function iniciar(raiz: HTMLElement) {
  const delDia: Problema = JSON.parse(raiz.querySelector('script[type="application/json"]')!.textContent!);
  const $ = <T extends HTMLElement = HTMLElement>(sel: string) => raiz.querySelector<T>(sel)!;

  // Todos los problemas publicados. Mientras llegan, el tablero ya enseña el problema del día.
  let problemas: Problema[] = [delDia];
  const listos = fetch(raiz.dataset.fuente!)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((lista: Problema[]) => {
      problemas = lista;
      pintarProgreso();
    })
    .catch(() => mensaje('No se han podido cargar más problemas. Revisa la conexión y recarga la página.', 'error'));
  const fechaDelDia = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
    new Date(`${raiz.dataset.hoy}T12:00:00Z`),
  );

  const ui = {
    modo: $('[data-modo]'),
    distintivo: $('[data-distintivo]'),
    enunciado: $('[data-enunciado]'),
    meta: $('[data-meta]'),
    mensaje: $('[data-mensaje]'),
    solucion: $('[data-solucion]'),
    solucionJugadas: $('[data-solucion-jugadas]'),
    formJugada: $<HTMLFormElement>('[data-form-jugada]'),
    tema: $<HTMLSelectElement>('select[name="tema"]'),
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

    ui.modo.textContent = p.id === delDia.id ? `Problema del día · ${fechaDelDia}` : 'Entrenamiento';
    ui.distintivo.innerHTML = p.propio ? '<span class="etiqueta etiqueta--oro">De las clases de Dama Gaztea</span>' : '';
    ui.enunciado.textContent = p.enunciado;
    ui.meta.textContent = [p.titulo, NIVELES[p.nivel], p.tema.join(', ')].filter(Boolean).join(' · ');
    ui.solucion.hidden = true;

    const previo = progreso.resueltos[p.id];
    mensaje(
      previo
        ? `Ya resolviste este problema. Puedes repetirlo, pero no vuelve a contar. Juegan ${colorTurno() === 'white' ? 'blancas' : 'negras'}.`
        : `Te toca: juegan ${colorTurno() === 'white' ? 'blancas' : 'negras'}. Mueve una pieza.`,
    );

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

  // Con desdeElPrincipio se elige el primero sin resolver del filtro, aunque sea el que está en el tablero.
  async function siguienteProblema(desdeElPrincipio = false) {
    await listos;
    const lista = filtrados();
    if (!lista.length) return mensaje('No hay problemas con ese nivel y tema. Prueba con otro filtro.', 'info');
    const desde = desdeElPrincipio ? -1 : lista.findIndex((p) => p.id === actual.id);
    const ordenados = [...lista.slice(desde + 1), ...lista.slice(0, desde + 1)];
    cargar(ordenados.find((p) => !progreso.resueltos[p.id] && (desdeElPrincipio || p.id !== actual.id)) ?? ordenados[0]);
  }

  // Cambiar el filtro pasa al modo entrenamiento y queda en la dirección para poder compartirla.
  async function aplicarFiltros() {
    const url = new URL(location.href);
    const nivel = raiz.querySelector<HTMLInputElement>('input[name="nivel"]:checked')!.value;
    for (const [clave, valor] of [['nivel', nivel], ['tema', ui.tema.value]]) {
      if (valor === 'todos') url.searchParams.delete(clave);
      else url.searchParams.set(clave, valor);
    }
    history.replaceState(null, '', url);
    await listos;
    if (!filtrados().some((p) => p.id === actual.id)) siguienteProblema();
  }

  function pintarProgreso() {
    const marcador = (k: string, v: string | number) => ($(`[data-marcador="${k}"]`).textContent = String(v));
    marcador('aciertos', progreso.aciertos);
    marcador('racha', progreso.racha);
    marcador('mejorRacha', progreso.mejorRacha);
    if (problemas.length > 1) {
      marcador('resueltos', `${problemas.filter((p) => progreso.resueltos[p.id]).length}/${problemas.length}`);
    }
  }

  raiz.addEventListener('click', (e) => {
    const objetivo = (e.target as HTMLElement).closest<HTMLElement>('[data-accion]');
    if (!objetivo) return;
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

  // Arranque: el problema pedido en la dirección, el modo entrenamiento si hay filtros o, si no, el problema del día.
  const params = new URLSearchParams(location.search);
  const nivelPedido = raiz.querySelector<HTMLInputElement>(`input[name="nivel"][value="${CSS.escape(params.get('nivel') ?? '')}"]`);
  if (nivelPedido) nivelPedido.checked = true;
  if ([...ui.tema.options].some((o) => o.value === params.get('tema'))) ui.tema.value = params.get('tema')!;
  const pedido = params.get('p');
  cargar(delDia);
  pintarProgreso();
  if (pedido && pedido !== delDia.id) {
    listos.then(() => {
      const p = problemas.find((p) => p.id === pedido);
      if (p) cargar(p);
      else mensaje('Ese problema ya no está publicado. Te enseñamos el problema del día.', 'info');
    });
  } else if (!pedido && (nivelPedido || ui.tema.value !== 'todos')) {
    siguienteProblema(true);
  }
}
