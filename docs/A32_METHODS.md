# A.3.2 — métodos, lectura pendiente completada y reproducción

Se leyó íntegro el adjunto `Argentum_Souls_A32_Especificacion_Corregida.md` antes de implementar (SHA256 `3d64ad219556d8607449cdcf3be17672b3e38eaf86ae74a15f0e3757df786ba7`). Es una fase experimental, no una publicación de balance. [Informe cuantitativo](A32_REPORT.md). La referencia fija de auditoría y regresiones es `911300e8dcbde72258c2babd1cd90d9b65d4789e`. Ningún simulador accede a una partida real del navegador ni al repositorio/guardado de Idle.

## Lectura P0 completada

La entrada real es `src/index.html` → `src/app.js`, no `src/main.js`. Se completaron `Training.start/spawnObject/input/click/tickCritical/update/good/bad`, render y geometría; callbacks de `economy.js`, `equipment.js`, `training-xp.js`, estaciones, misiones y `awardTraining`; `arena.js`, `arena-progress.js`, `regions.js`, `Combat` y su render; coordinación de `save-session.js` y la conexión de la aplicación. El scheduler completo confirma:

- Fuerza: velocidades, arcos, bolsas de alturas, ventanas de espada, buffer, ráfagas y estrellas neutrales; Defensa: generación fuera del mundo, rayos, separación de llegadas por ángulo y colisión de sector; Precisión: tamaños, vida, movimiento y parejas. No se alteran. Tests fijan parámetros/render/geom/controles y las secuencias exactas de dos semillas de A.3.1, tanto con control como con la opción experimental.
- Esquiva inicia con `spawn=.45` solo en una sesión nueva. El ciclo repetido es anticipación `windup`, contacto en `windup+.12`, retorno de 380 ms y luego intervalo neutro. Blanco: `[windup-.08-before-after, windup-.08]`, duración 210–160 ms; termina 200 ms antes del contacto. Entrada Bien desde 20% del windup hasta 35 ms antes del contacto. Los campos históricos `accept/late` no sustituyen a las funciones realmente usadas en `input` y geometría.
- Crítico: espera → rojo/dorado → salto de 320 ms → señal aérea → golpe → aterrizaje de 350 ms → espera. Un rojo leído es pasivo, +1 XP fijo; no incrementa combo ni borra errores activos. Las ventanas `ready`, `air`, `fake`, Perfecto y sus variaciones no se reducen. Se conservan frecuencia de amagues, límite de tres consecutivos, bolsas y recuperación.
- Una compra valida escritor y saldo, resta monedas y equipa; estación cuesta `45×(nivel+1)^2`, sala `round(180×nivel^2.15)`, equipamiento `ceil(base×(nivel+1)^1.65)`. Se extrajo únicamente la compra de estación a una función pura compartida, con el mismo precio y gate, para no copiarla en un simulador.
- `claimArena` concede solo `completed+1`, entre1–100; monedas `45+8id+2floor(id^1.3)` y una mejora rotativa de equipo por jefe regional. Repetir no entrega oro. La aplicación guarda ese premio mediante el escritor actual. Las regiones tienen100 arenas y cuatro enemigos cada una; dificultad por ID/oleada, no por wins.

## Opciones jugables y aislamiento de experimentos

```sh
npm ci --ignore-scripts
npm run build
npm start
```

Control medido: `http://127.0.0.1:8000/?measure=1&rhythm=control&xp=X0`

Ritmo experimental para probar primero: `http://127.0.0.1:8000/?measure=1&rhythm=overlap&xp=X0`

XP alternativas explícitas: sustituir `xp=X1a4` o `xp=X2c50`. Otras hipótesis disponibles: `X1a2`, `X1a6`, `X2c25`, `X2c75`. Sin parámetros, se conserva control/X0. No se selecciona una ganadora ni se guardan flags de balance en el progreso.

El panel compacto «A.3.2 experimental» permite exportar copia Souls y medición JSON. Los archivos se descargan localmente por acción del usuario; no hay cuentas, envío de telemetría ni almacenamiento nuevo. **La build experimental usa la misma clave Souls dentro del mismo origen: exportar una copia antes de probar XP alternativas. Localhost no comparte automáticamente el almacenamiento de GitHub Pages; allí una partida vacía no significa que se haya borrado la partida publicada. No se importan ni transfieren datos entre orígenes silenciosamente.** No reduce niveles/XP anteriores; jugar concede XP futura según la opción elegida. La selección no añade ni descuenta progreso por sí misma.

### HTML autocontenido para la prueba personal

`npm run build:a32:portable` genera `artifacts/a32/Argentum-Souls-A32-experimental.html`, con CSS y módulos incorporados, sin dependencias remotas. Arranca explícitamente en overlap/X0 y permite comparar con control desde el panel. El cambio exige guardado correcto; si falla o está solo en memoria, conserva la pestaña abierta y pide exportar/reintentar. Exportar medición antes de cambiar: la medición es de sesión y no se conserva en una recarga.

Se verificó el HTML autocontenido en Chromium servido por HTTP local, sin solicitudes de módulos/CSS externos, con disparo nativo y cambio de control. La política administrada del Chromium de este entorno bloquea `file://`; no se afirma haber validado el doble clic en este navegador. Si el navegador del jugador también restringe archivos locales, servir el archivo con `npm start` y abrir `/artifacts/a32/Argentum-Souls-A32-experimental.html`. Esto no publica Pages. El almacenamiento local del archivo y localhost tampoco comparten el guardado de Pages.

### Candidato de ritmo

`rhythmParameters` delega al `tuning` original. Para los tres modos protegidos devuelve exactamente el original.

|Parámetro|Control|Candidato|
|---|---|---|
|Esquiva intervalo|0.32−0.10d|0.24−0.10d|
|Esquiva mínimo|0.18|0.14|
|Esquiva espera posterior efectiva|intervalo tras retorno|presupuesto neutro consumido durante retorno; residual `max(0,espera−.38)`|
|Crítico espera uniforme mínima/máxima|.16 / .42−.10d|.14 / .34−.10d|
|Crítico tras aterrizar|espera sorteada completa|residual `max(0,espera−.35)` después de completar aterrizaje|

No hay otro aviso antes de habilitar entradas. Esquiva también espera que termine herida pendiente. Las animaciones duran lo mismo; el sorteo del próximo intento no se revela por adelantado. El intervalo sorteado puede quedar totalmente absorbido por el retorno: no se afirma que el ahorro se limite a80 ms. El ensayo conserva pequeñas variaciones de windup, técnicas aleatorias y los amagues; no impone una cadencia fija ni una reducción de ventanas. Las penalidades por fallar y margen de recuperación permanecen.

## Observación y errores sintéticos

El director del experimento tiene acceso al motor para medir; `PlayerPolicy` recibe solo `observeTraining(engine)`, un objeto nuevo sin motor, semilla, bolsa futura, velocidad interna, arrival, windup, clock, límite o resultado. La observación ofrece objetos completamente visibles dentro del mundo 1200×720 (sin clasificar una franja todavía fuera de pantalla), posiciones/radios visibles, colores/símbolos actuales y pose reconocible. La técnica de Esquiva se infiere de desplazamientos dibujados de cabeza/brazo/pierna (umbrales18/25/25 px lógicos), no de `cue.kind` antes de que se mueva. El blanco se deriva de la misma geometría visible. No es visión por computadora ni una lectura humana calibrada: umbrales, contraste, HUD, audio y pantalla física son limitaciones.

Reacción lognormal positiva: mediana350/250/190 ms; dispersión orientativa100/70/45 ms. `sigma=sqrt(log(1+(spread/median)^2))`, piso45 ms. Errores de elección8/3/1% producen entradas incorrectas, puntería desplazada o señales perdidas; el éxito/Perfecto sale de física y ventanas reales, no de un porcentaje de aciertos inyectado. Episodios correlacionados: probabilidad1.5% por decisión, tres decisiones con error×2.5 y reacción×1.5. Fatiga gradual: reacción hasta+25%, elección hasta+50% en una hora; la puntería también se dispersa.

Defensa limita giro a8/12/18 rad/s y aceleración35/65/120 rad/s² con frenado; no teletransporta ángulo. Precisión consume reacción y viaje de puntero a800/1300/1900 px/s, más error absoluto17/10/5 px y0.008×distancia; tamaño/movimiento afectan la colisión real. El viaje se representa por tiempo, no por una animación del ratón. Fuerza estima movimiento con observaciones anteriores y sortea la reacción una sola vez por objeto visible. Planifica el corte con su latencia habitual, nunca con el valor exacto de su propio jitter futuro; una regresión exige el mismo umbral de decisión con dos latencias sorteadas distintas. Defensa también usa una demora perceptiva variable, no una latencia fija. El controlador no recibe su trayectoria futura. Los expertos pueden esperar el blanco visible de Esquiva; Crítico reacciona a cada señal que está dibujada.

Estos supuestos pueden ser muy optimistas o pesimistas según disciplina. Los perfiles no aprenden durante un recorrido y no representan distribuciones humanas medidas. Sensibilidad ±25% de reacción no elimina ese límite.

## Dos relojes y fases

Tiempo presente de entrenamiento incluye esperas internas, lectura, animación y demora para continuar recuperación; excluye pausa explícita y ocultación. Tiempo ejecutable es el reloj que efectivamente avanzó `Training`. La versión personal registra además frames, viewport y timestamps de fases visibles; conserva el tiempo de pared aunque el motor descarte un gap grande. No cuenta salto y golpe aéreo como dos premios. Eventos discretos y actualizaciones continuas del puntero se reportan aparte; estas últimas no son gestos independientes.

El simulador separa paso físico y render/entrada. En física60/render120 observa también frames con posición repetida, sin inventar un paso nuevo. No se acumulan entradas de recuperación para dispararlas al continuar. Los tests de capacidad antiguos siguen siendo oráculos técnicos (consultaban ventanas); **no se usan como tasas humanas**.

## Sesiones y libros de recompensa

Se ejecuta `Training` real durante una hora por modo/perfil/ritmo/semilla, sin fijar combo o dificultad y sin llamar `good` para inventar éxitos. Lecturas, fallos y recuperación vienen de entradas. Seis libros de recompensa comparan tres fórmulas × compras ninguna/mixta sobre las mismas entradas. `TrainingLedger` llama las funciones de producción `trainingXp`, `advanceMission`, `awardTraining` y compras reales. El nivel de referencia se fija solo al comenzar una racha; después de un fallo lee el nivel mutable actualizado. Un assert por premio exige igualdad entre combo del libro y del motor. La equivalencia del estado completo se prueba por regresión.

Esta reutilización se permite porque XP, atributos, equipo y salas no cambian la física de estos minijuegos; puede ignorar diferencias perceptivas de decoración/feedback. Cada libro tiene saldo, compras y misiones propios. La política mixta compra la mejora más barata cada5 s si alcanza; no añade tiempo de menú en las tablas de entrenamiento. Por eso no deben confundirse con tiempo total de una visita humana a la tienda.

Los percentiles de racha incluyen la cadena todavía abierta al final (censurada por cierre). Los XP/h de10 min son equivalentes descriptivos, no extrapolaciones de un proceso estacionario. Las tablas separan XP base redondeada, sala, estación, Perfecto, pasivo y misión; su suma debe coincidir con el total.

## Recorridos desde una partida nueva

`loadState({getItem:()=>null})`: atributos/XP/monedas/equipo/estaciones/camino a cero, sala1. Builds de tiempo: ofensiva45/15/15/5/20%; defensiva20/40/10/20/10%; equilibrada25/25/20/15/15%. Las compras siguen prioridades explícitas: equipo primero, sala primero, estación especializada o más barata. Prioridades estrictas pueden ahorrar para la primera opción aunque otra barata sea comprable; no se presentan como óptimas. Cada compra real consume saldo y añade2 s de menú en el recorrido. La ruta sin compras conserva el botín de jefes legítimo.

La política vuelve a entrenar tras una derrota e intenta otra arena cada600 s; puede seguir hasta diez primeras victorias consecutivas antes de volver a practicar. No es una barrera del juego, es una decisión del controlador. Todos los combates usan `Combat`, cuatro rivales, habilidades con reacción a vida/recargas/anuncio visible, semilla separada y límite600 s. Timeout se marca aparte de derrota. El runner antiguo conserva su paso y automatización informada como control, y ya no ejecuta informes al importarlo.

Para que miles de recorridos sean viables, se reutilizan **trazas completas de eventos resueltos** generadas con entradas y física reales: dos bloques de120 s por modo/semilla/ritmo y bandas de fatiga0/30/60 min. Los recorridos cambian/reinician sesión en cada bloque; no se presenta como una racha continua de50 h. Cada repetición conserva el tiempo de fallos/recuperación y reinicia combo, pero aplica misiones, XP, oro y compras sobre el estado mutable del recorrido. No se convierte a XP/s ni se regala equipo. Se valida igualdad de combo y de replay/estado; la física es independiente de los campos financieros reutilizados. La caché valida hash de código/parámetros, Node y eventos, y se puede omitir con `--cache=0`; no modifica premios ni saldos. El banco finito y reinicios frecuentes pueden estrechar variabilidad o favorecer ciertas estrategias. Se añade sensibilidad con bloques600 s y pruebas adversariales de fragmentación; son límites importantes antes de hablar de humanos.

Los snapshots etiquetan `targetHours` y el `observedHours` real del primer punto de control después del objetivo (un bloque/combate puede cruzarlo). Se guardan estados completos al alcanzar10/20/50/100. Si ya terminó100, no se finge haber entrenado hasta50 h; si no alcanza una meta en el horizonte, es censurada, no una predicción. La matriz principal intermedia tiene máximo50 h; perfiles principiante/experto y políticas extra usan8 h, siempre cien semillas por celda ejecutada.

Adaptativa: usa resultados visibles del último combate. Optimizadora: heurística greedy de un paso basada en tasas de entrenamiento ya observadas y el cambio marginal de estadísticas propias por coste de nivel. No es un óptimo global ni conoce el siguiente ataque. Se etiqueta aparte del jugador típico.

## Utilidad a igual tiempo

Nueve estados representativos del recorrido (semilla1001, tres builds × tres XP, compra mixta, alrededor de1h); se estudian las cinco disciplinas con100 sesiones nuevas por cada estado/modo, puntos10/30/60 min y compras deshabilitadas. Cada semilla de entrenamiento se empareja con una semilla de combate antes/después en arenas10/20/50/100 y la siguiente elegible. Wilson95% sobre100 muestras conjuntas incorpora variación sintética de entrenamiento y combate, no incertidumbre poblacional humana. No se simulan todos los snapshots de todos los recorridos.

Se comparan cuatro oleadas completas, derrotas/timeout, curas/guardias, duración y daño recibido por oleada. Comparar duraciones solo entre victorias conjuntas evita declarar «mejor» una derrota rápida. El proxy de daño propio es por golpe antes de defensas rivales, y HP efectivo no modela cada habilidad particular: los resultados de combate son la verificación principal. Las monedas de primera victoria se prueban mediante `claimArena` sobre una copia, no se suman repetidamente a la partida real.

## Conservación de partidas y auditoría

No se cambia `state.js`, Q, clave Souls ni `save-session.js`. El fixture75/61/36/14/15 tiene **resto de campos sintéticos explícitos**, no reconstruye tu partida. Se prueba cargar→guardar→cargar con todos los campos, XP residual, monedas, compras, misiones, récords y arenas; variantes y medición no introducen metadata que se pierda al cargar. También se ejecutan los regresores de cuota, localStorage bloqueado, memoria, dos pestañas, cierres/reapertura y caché. No hubo acceso a datos reales de tu navegador; para calibrar tu partida exacta necesitaríamos tu exportación voluntaria completa.

## Comandos y artefactos

Desde la raíz del repositorio (Node24 usado en las corridas):

```sh
npm test
npm run build
npm run build:a32:portable
npm run test:browser
npm run test:mutation
npm run test:balance          # controles antiguos; escribe informes históricos: revisar diff
npm run test:a32:save
npm run sim:a32:xp
npm run sim:a32:sessions -- --seeds=100
npm run sim:a32:sessions -- --seeds=100 --mode=str --name=sessions-force
npm run sim:a32:sessions -- --seeds=100 --mode=def --name=sessions-defense
npm run sim:a32:journey -- --seeds=100
npm run sim:a32:journey -- --seeds=100 --profile=beginner --economy=mixed --hours=8 --workers=2 --name=journey-beginner
npm run sim:a32:journey -- --seeds=100 --profile=expert --economy=mixed --hours=8 --workers=2 --name=journey-expert
npm run sim:a32:journey -- --seeds=100 --economy=none --rhythm=control --workers=2 --name=journey-no-buy
npm run sim:a32:journey -- --seeds=100 --build=adaptive --economy=mixed --hours=8 --workers=2 --name=journey-adaptive
npm run sim:a32:journey -- --seeds=100 --build=optimizer --economy=mixed --hours=8 --workers=2 --name=journey-optimizer
npm run sim:a32:journey -- --seeds=100 --build=balanced --economy=mixed --hours=8 --blockSeconds=600 --workers=2 --name=journey-long-blocks
npm run sim:a32:validate -- --seeds=100 --seconds=60
npm run sim:a32:validate -- --kind=reaction --seeds=100 --seconds=600
npm run sim:a32:validate -- --seeds=100 --seconds=60 --mode=str --name=frames-force
npm run sim:a32:validate -- --seeds=100 --seconds=60 --mode=def --name=frames-defense
npm run sim:a32:validate -- --kind=reaction --seeds=100 --seconds=600 --mode=str --name=reaction-force
npm run sim:a32:validate -- --kind=reaction --seeds=100 --seconds=600 --mode=def --name=reaction-defense
npm run sim:a32:exploits -- --seeds=100
npm run sim:a32:exploits -- --seeds=100 --mode=str --name=exploits-force
npm run sim:a32:utility -- --seeds=100
npm run sim:a32:report
```

Los dos subconjuntos de sesiones se usan para consolidar la revisión final del controlador y conservar procedencia por componente. Volver a ejecutar toda la matriz con la revisión final produce los mismos controles; el consolidador exige100 semillas únicas por celda e igualdad de Fuerza/Defensa/Precisión en ambos ritmos. No agrupa resultados de variantes como muestras independientes.

Las salidas JSON/CSV tienen esquema `souls-a32-results-v1`. Guardan SHA de Git al empezar, indicador de cambios, hash/configuración exacta, Node, semillas, comando y parámetros. Un snapshot de código en el directorio ignorado conserva los bytes exactos usados, incluso cuando la corrida empezó durante el desarrollo. La composición de sesiones mantiene la procedencia de cada componente, no adjudica todas las cifras a un SHA posterior. El manifiesto añade SHA256 de cada JSON final. `elapsedWallMs` es duración de ejecución, no horas de jugador; CPU del proceso se guarda aparte y los workers tienen sus propios datos. No se confunde CPU ni paralelismo con horas activas simuladas.

Los raw y resúmenes están en `artifacts/a32/` (incluido `sessions-summary.csv`, `journey-summary.csv`, `manifest.json`); no se versionan nuevos binarios o galerías. Los informes Markdown sí se revisan en el PR. Para comprobar1.000 semillas en una siguiente fase, usar `--seeds=1000`; no se afirma haber ejecutado esa ampliación ni elegido aún candidatos finales. No se hicieron pruebas humanas prolongadas o en un teléfono físico; Chromium móvil es emulación.
