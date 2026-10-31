# Guía para Álex: la hoja de problemas

La web publica cada día a las 06:00 un problema nuevo y deja todos los demás para entrenar por nivel y tema. Todo sale de una hoja de Google Sheets que rellenas tú. No hay que tocar nada más.

## La hoja

Tiene dos pestañas con las mismas columnas, en este orden y con la primera fila de títulos tal cual:

| Columna | Qué poner | ¿Obligatoria? |
| --- | --- | --- |
| id | Un código único, sin espacios ni tildes. Para los tuyos: `dg-001`, `dg-002`... | Sí |
| fen | La posición, copiada del editor de Lichess (ver abajo) | Sí |
| solucion | Las jugadas, separadas por espacios (ver abajo) | Sí |
| nivel | `facil`, `medio` o `dificil` | Sí |
| tema | Uno o varios de la lista, separados por comas | No |
| titulo | Un título corto, si quieres | No |
| enunciado | Por ejemplo "Juegan blancas y dan mate en 2". Si lo dejas vacío, se pone "Juegan blancas y ganan" | No |
| origen | `propio` para los tuyos | Sí |
| fecha_publicacion | El día que quieres que salga como problema del día, como `2026-11-15` | No |
| notas | Lo que quieras apuntar. No se publica | No |

- Pestaña **propios**: tus problemas. En la web llevan el distintivo "De las clases de Dama Gaztea".
- Pestaña **lichess**: problemas de la base abierta de Lichess, ya preparados. No hace falta tocarla.

Temas admitidos: mate en 1, mate en 2, mate en 3, mate del pasillo, clavada, horquilla, ataque doble, enfilada, descubierta, jaque doble, desviación, atracción, pieza indefensa, sacrificio, coronación, finales.

## Cómo sacar la FEN

1. Abre [lichess.org/editor](https://lichess.org/editor).
2. Vacía el tablero con el botón del menú de la derecha y coloca las piezas arrastrándolas desde las filas de arriba y abajo.
3. En el menú de la derecha, elige **a quién le toca mover** (blancas o negras). Es el error más frecuente: compruébalo siempre.
4. Debajo del tablero aparece una línea llamada FEN, por ejemplo `6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1`. Cópiala entera y pégala en la columna fen.

## Cómo escribir la solución

- En notación española: **R** rey, **D** dama, **T** torre, **A** alfil, **C** caballo; los peones sin letra. Captura con `x`, jaque con `+`, mate con `#`, enroque `O-O` y `O-O-O`, coronación `e8=D`.
- Escribe **también las respuestas del rival**, alternando: tu jugada, la del rival, tu jugada...
- La última jugada siempre es del bando que resuelve. Los números de jugada (`1.`, `2.`) se pueden poner o no.

## Ejemplos

| Nivel | fen | solucion | enunciado |
| --- | --- | --- | --- |
| facil | `6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1` | `Td8#` | Juegan blancas y dan mate en 1 |
| medio | `2kN1r2/ppp3p1/3p4/4p2Q/2P4p/PqNKP2P/6P1/6R1 b - - 2 27` | `e4+ Rd4 c5+ Rd5 Dxc3` | Juegan negras y ganan |
| dificil | `3r3k/p7/1p4p1/4P1Pp/4qQ2/2p1BR2/P2NK3/7R b - - 0 37` | `Txd2+ Rf1 Db1#` | Juegan negras y dan mate en 2 |

## La fecha

- **Con fecha**: ese día, a las 06:00, sale como problema del día. Antes de esa fecha no se ve en ningún sitio, ni siquiera en el entrenamiento. Solo un problema por fecha.
- **Sin fecha**: entra directamente en el entrenamiento y en el fondo común. Los días que no tengan ningún problema con fecha, la web elige uno del fondo común que no haya salido nunca.
- Todos los problemas del día quedan en el archivo, ordenados por fecha.

## Cuándo se ve un cambio

La web lee la hoja cada mañana a las 06:00. Si quieres que un cambio se vea antes, avisa a Borja y lo publica en un minuto.

Si un problema tiene un error (una jugada imposible, el turno al revés, dice mate y no lo es, una fecha repetida...), **no se publica** y los demás siguen saliendo con normalidad. Borja ve el motivo exacto y te dice qué fila revisar.
