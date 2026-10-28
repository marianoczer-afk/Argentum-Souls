# Registro de trabajo — primera entrega

Fecha: 25 de octubre de 2026. Horas de la tabla en Buenos Aires (UTC−3). Los intervalos representan tiempo de reloj entre marcas registradas, no facturación ni tiempo de CPU. No se atribuye tiempo anterior no observado.

## Etapas

| Etapa | Intervalo registrado | Duración |
| --- | --- | --- |
| Análisis de las cuatro partes y plan inicial | 03:46:03–03:47:55 | 1 min 52 s |
| Implementación modular y primeras pruebas del motor/navegador | 03:47:55–03:55:05 | 7 min 10 s |
| Correcciones, revisión visual y validación reproducible | 03:55:05–04:00:52 | 5 min 47 s |
| Prueba adicional de Pages, configuración y preparación de entrega | 04:00:52–04:03:56 | 185 s |

Las etapas incluyen lectura, escritura, espera de herramientas, documentación y diagnóstico. El análisis de video usó muestreo de fotogramas, no una reproducción en tiempo real de seis minutos.

## Ejecuciones con duración medida

| Comando | Inicio en Buenos Aires | Duración de proceso | Resultado |
| --- | --- | --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund --cache /workspace/argentum-environment/npm-cache` | 04:00:50 | 438 ms | salida 0 |
| `npm run build` | 04:00:51 | 245 ms | salida 0 |
| `npm test` | 04:00:51 | 446 ms | salida 0 |
| `npm run test:browser` (última ejecución) | 04:02:09 | 34726 ms | 17 comprobaciones aprobadas |

Resultados: 15 pruebas del motor aprobadas, 0 fallidas/omitidas; 17 comprobaciones de navegador aprobadas, 0 fallidas/omitidas. La prueba de continuidad del motor simula diez minutos por cada una de las cinco disciplinas. La del navegador usa reloj controlado y verifica una sesión de más de 35 segundos de simulación; no son 35 segundos de espera real. Teclado, mouse y controles táctiles se ejercitan en Chromium headless, no en un teléfono físico.

Las capturas del canvas verifican un cambio de fotograma durante el corte y el regreso de la pose al reposo. Se revisaron visualmente Fuerza, Defensa, Precisión, Esquiva y las fases aérea/impacto de Crítico. La revisión detectó y corrigió una discontinuidad de posición en Crítico. No se afirma equivalencia perceptiva con Flash ni latencia medida contra el video.

Informes completos de esta máquina: `artifacts/command-results.json` y `artifacts/browser-results.json`. Capturas y secuencia animada: `artifacts/`. Son salidas locales ignoradas por Git, regenerables con la suite de navegador.

## Fallos investigados y tiempos NO MEDIDOS

- Primera instalación: npm intentó escribir en su caché por defecto fuera del área escribible. Se corrigió usando `/workspace/argentum-environment/npm-cache`; instalación congelada posterior verificada. Duración individual del intento inicial: **NO MEDIDO**.
- Primera suite de navegador: falló el caso de Defensa porque el test intentaba mover el mouse al punto inicial de un proyectil fuera del canvas. Se corrigió la entrada del test para apuntar dentro de la sala en el mismo ángulo; no se cambió el bloqueo para hacer pasar el caso. Duración de esa ejecución fallida: **NO MEDIDO**.
- Reejecución completa previa: 16 comprobaciones aprobadas, 31.011 ms, inicio 03:55:20. Otra ejecución tras las correcciones: 16 aprobadas, 32.458 ms, inicio 03:59:25. La última agrega la comprobación de ruta de Pages.
- Builds iniciales: ejecutados correctamente; duración individual **NO MEDIDO**. El build final medido figura arriba.
- Análisis previo de la sesión anterior, intentos de adjuntos grandes y tiempo transcurrido entre turnos: **NO MEDIDO**; excluidos de estas etapas.
- `git ls-remote origin HEAD` funciona. La API de GitHub falló con `CONNECT 403` al consultar el repositorio; duración individual **NO MEDIDO**. Se guardó `api.github.com` como dominio adicional en el borrador conservando los presets existentes. Guardar un borrador no aplica la política ni demuestra permisos de PR.
- Los pasos de commit/publicación de rama/creación de PR posteriores a este punto se registran con su resultado; su duración individual es **NO MEDIDO** salvo indicación expresa.

## Alcance y pendientes

Primera entrega de entrenamiento implementada. La arena del prototipo y la tienda siguen jugables en módulos separados. No se implementaron todavía personajes/razas/clases, nuevos desbloqueos de arena ni la revisión completa de combate. `Idle-Czerniak` y su guardado v7 no fueron modificados. Main no se fusiona ni se despliega automáticamente.

## Publicación de la rama y PR

- Commit de implementación: `b913263` (`feat: add continuous modular training with responsive controls`).
- `git push --set-upstream origin dev/continuous-training`: correcto; rama remota creada y seguimiento configurado. Duración individual: **NO MEDIDO**.
- `gh pr create --repo marianoczer-afk/Argentum-Souls --base main --head dev/continuous-training ... --body-file ...`: bloqueado, `Post "https://api.github.com/graphql": Forbidden`. No se creó un PR; no es un fallo de las pruebas ni una fusión.
- Texto del PR preparado en `/tmp/argentum-training-pr.md` en esta máquina. Comparación para revisión: https://github.com/marianoczer-afk/Argentum-Souls/compare/main...dev/continuous-training?expand=1
- Borrador del entorno guardado con `install_script`, `start_skill` actualizados y `api.github.com` como dominio adicional. Requiere revisión/guardado y publicación desde los ajustes del entorno; aún no demuestra acceso efectivo a la API. No se solicitaron ni copiaron tokens.
- La rama main remota conserva `438977b5bd12f3876c9e4ca4fecb3449a02b42ab`. No se modificó la configuración de GitHub Pages ni se publicó la rama de desarrollo en producción.

## Corrección tras la primera auditoría — PR #1

Fecha: 25 de octubre de 2026. Se mantiene la rama `dev/continuous-training`; no se crea otro PR ni se modifica main. Ver [CORRECTIONS.md](CORRECTIONS.md) para decisiones, límites y correspondencia con los cuatro hallazgos.

Intervalo registrado de implementación, pruebas y documentación: **04:21:27–04:34:43 Buenos Aires (UTC−3)**, 796 segundos de reloj. La planificación anterior a la primera marca, el tiempo entre turnos y los pasos posteriores de publicación tienen duración individual **NO MEDIDO**. El intervalo incluye esperas y lectura; no representa tiempo de CPU.

| Comando final | Inicio Buenos Aires | Duración del proceso | Resultado |
| --- | --- | --- | --- |
| `npm run build` | 04:31:17 | 221 ms | salida 0 |
| `npm test` | 04:31:17 | 440 ms | salida 0 |
| `npm run test:browser` | 04:31:18 | 55241 ms | salida 0 |
| `npm run test:mutation` | 04:32:13 | 2272 ms | salida 0 |

- **21 pruebas unitarias aprobadas**, 0 fallidas/omitidas. Se conservan los casos del motor (diez minutos simulados por disciplina), combos, experiencia y guardado anterior; se actualiza la prueba de escritura para usar el adaptador coordinado. Se agregan cinco pruebas de almacenamiento/coordinación y una de transformación efectiva del dibujante.
- **27 comprobaciones Chromium aprobadas**, 0 fallidas/omitidas: se mantienen las 17 iniciales, se refuerza su comprobación de movimiento y el acierto táctil de Fuerza, y se agregan diez comprobaciones de concurrencia, almacenamiento, táctil y refresco de tienda. Teclado, mouse, toque/arrastre emulados y rutas de Pages comprobados.
- **Prueba de mutación aprobada**: en una copia temporal `hero()` ignora las poses; tanto el test unitario como Chromium terminan con salida 1 por la aserción específica de cuerpo inmóvil. Son dos fallos deliberados **esperados**, distintos de fallos de la entrega. La copia se elimina y el código real no se modifica.
- Las regresiones con dos pestañas también fuerzan los manejadores de acciones deshabilitadas para verificar que la autorización se comprueba en lógica y no solamente en el HTML. Se conserva XP, gasto de monedas y equipo al tomar control y reabrir, en ambos órdenes de cierre.
- Getter de `localStorage` bloqueado: arranque y entrenamiento en memoria, aviso y salida sin confirmación falsa. Cuota agotada: error explícito, reintento todavía fallido, recuperación, cierre/reapertura y XP persistida. Sin Web Locks: ninguna escritura del guardado previo.
- Medición exploratoria de 20 aciertos con sonido desactivado: antes **21 reconstrucciones de tienda oculta, 7,4 ms** en total; después **0 reconstrucciones, 1,0 ms**. No se generalizan esos tiempos a FPS o teléfonos. El test exige persistencia por acierto antes de salir y cero reconstrucciones de tienda oculta.
- No se modifican reglas de entrenamiento ni animaciones, ni se agregan personajes o funciones de arena. Los cambios de arena solo impiden mutaciones sin autoridad de escritura.
- `gh pr view 1` pudo leer la API en este turno y confirmó PR abierto, base main y cabecera `dev/continuous-training`; el bloqueo de red anotado en la entrega anterior es histórico.

Informes de esta ejecución: `artifacts/correction-results.json`, `artifacts/browser-results.json`, `artifacts/animation-mutation.json`. No se alteraron los registros históricos previos. Publicación de rama y actualización del PR se registran a continuación cuando se completen.

### Publicación de la corrección

- Commit de código y regresiones: `2122875` (`fix: protect cross-tab saves and verify rendered training motion`), enviado a la misma rama `dev/continuous-training`.
- PR #1 confirmado abierto, base `main` y cabecera `dev/continuous-training`. Se actualizó su descripción con los cuatro arreglos, 21 pruebas unitarias, 27 comprobaciones de Chromium, mutación y límites de operación.
- `gh pr edit` falló por la consulta obsoleta de Projects (classic) de esa versión del CLI. Se usó el endpoint REST `PATCH /repos/marianoczer-afk/Argentum-Souls/pulls/1`, que confirmó la actualización del mismo PR; no fue necesario crear otro ni pedir credenciales.
- Main remoto se comprobó en `438977b5bd12f3876c9e4ca4fecb3449a02b42ab`, sin cambios. No se fusionó el PR ni se publicó una versión de Pages.
- Duración individual de commit, push y edición del PR: **NO MEDIDO**.


## Entrega A — HUD y entrenamiento

Se inicia una entrega nueva después de confirmar que PR #1 está fusionado. Rama `dev/delivery-a-training-hud`, base main `44fb0050a0d1c5c30aa60b253abbe1f2739e0116`. Alcance completo y pendientes B/C en [DELIVERY_A.md](DELIVERY_A.md).

Primera marca de implementación registrada: **05:32:12 del 25 de octubre de 2026, Buenos Aires (UTC−3)**. El análisis inicial del pedido y consultas previas a esa marca: **NO MEDIDO**. Se mantiene tiempo de reloj por etapas; no se presenta como tiempo de CPU ni facturación.

- Se consultó Idle-Czerniak en modo lectura (`59977270a68c3a05f84eb760117b1a990d969c89`), identidad/HUD y datos originales; no se modificó ese repositorio.
- Las primeras pruebas fallaron por expectativas que el pedido cambia: dificultad por tiempo, corte medio con izquierda y castigo por golpes al aire. Se reemplazaron por verificaciones de los contratos nuevos y se conservaron continuidad, premios, combos, persistencia y regresiones de auditoría. Se corrigió además una comparación exacta de punto flotante extendiendo la simulación hasta alcanzar efectivamente el tope.
- Un caso de Configuración suponía que el diálogo seguiría abierto tras pulsar Espacio con el botón Cerrar enfocado. La activación nativa de ese botón lo cerraba correctamente; se corrigió el test y se mantuvo la exigencia de que no activara Crítico.
- Se detectó una carrera de inicialización al recargar: el test leía el bridge antes de que terminara la toma asíncrona del bloqueo. Ahora espera explícitamente la aplicación lista mediante sondeo fuera del reloj simulado. Los servidores de test usan un puerto libre asignado por el sistema y esperan su arranque, para no interferir con otras ejecuciones.
- Duración individual de esos intentos iniciales y diagnósticos: **NO MEDIDO**. Las ejecuciones finales se registran a continuación.
- Se revisaron capturas de escritorio, configuración, parejas de precisión, estrella, móvil vertical/horizontal y cuatro fases de esquiva. La resolución lógica es 1200×720, sin deformación. Capturas en `artifacts/delivery-a-*.png`.
- El build de publicación se probó con dos números de CI y SHA distintos en copias temporales. La configuración actual de Pages sigue en modo branch/main; el PR prepara Actions y documenta la selección de ese origen antes de publicar con numeración automática. No se cambia Pages ni se publica main desde esta sesión.
- La fórmula de XP anterior queda provisional en A. No se fija una curva de seis meses/260 horas sin la simulación y estimaciones que se presentarán en B.

### Validación final de A

Última marca de revisión y empaquetado: **06:01:43 Buenos Aires**. El intervalo desde 05:32:12 incluye implementación, diagnósticos, esperas, tests y documentación.

| Comando | Inicio Buenos Aires | Duración del proceso | Resultado |
| --- | --- | --- | --- |
| `npm run build` | 05:57:56 | 261 ms | salida 0 |
| `npm test` | 05:57:56 | 482 ms | salida 0 |
| `npm run test:browser` | 05:57:56 | 69443 ms | salida 0 |
| `npm run test:mutation` | 05:59:06 | 2430 ms | salida 0 |

- **30 pruebas unitarias y 34 comprobaciones Chromium aprobadas**, sin fallidas ni omitidas. Las 34 incluyen las regresiones de guardado y las siete comprobaciones específicas de A. Se preservó la sensibilidad de las pruebas a cuerpos sin animación: los dos fallos internos de la mutación son esperados y específicos.
- Commit fuente: `f938a09a0ae445bdcaa544e9ddbe52c7d7366258`. Build comprobado: `0.3.0-dev.e4924e8`, digest `e4924e82b390`, sin marca de cambios locales. El commit posterior solo registra HTML generado, documentación y capturas de revisión; no cambia las fuentes del juego.
- Se comprobaron escritorio 1440×1000, móvil 390×844 y horizontal 844×390, proporción 5:3, indicadores dentro de la escena e inicio automático. Se revisaron las cuatro fases de Esquiva en capturas; una respuesta perfecta permanece válida al ejecutarse el golpe.
- Se mantuvo el guardado existente sin modificar su estructura y sin cambiar la fórmula provisional de XP en esta etapa. Sigue pendiente estimar 10/25/50/75/100 antes de fijar la curva de B.
- Artefactos locales: `artifacts/delivery-a-results.json`, `artifacts/browser-results.json`, `artifacts/animation-mutation.json`, capturas y `artifacts/argentum-souls-entrega-a.zip`. El ZIP contiene solo `dist/` listo para servir por HTTP; no incluye credenciales ni guardados.
- Duración individual de commit, push y creación del PR: **NO MEDIDO**. No se modificó main ni se desplegó Pages en esta sesión.

### Corrección de carga después de Entrega A — 2026-10-25

La captura del usuario muestra HTML de A con estilos/JavaScript anteriores: sonido junto a «Salir», pausa duplicada y canvas sin dibujo. El PR #2 ya estaba fusionado (4007215). La configuración Pages continúa en modo legacy/main; no se cambió ni se desplegó desde esta corrección. No fue posible inspeccionar la URL pública desde este entorno (proxy HTTP 403), por lo que no se afirma haber verificado su caché real.

Se reprodujo en Chromium el arranque roto sirviendo el HTML nuevo con app, controlador y CSS reales de 44fb005. La compilación ahora agrega una identidad de contenido a CSS y al módulo inicial; un import map versiona también todas las dependencias transitivas. Las rutas siguen siendo relativas y funcionan bajo `/Argentum-Souls/`. La entrada de publicación es `index.html` generado; `src/index.html` sigue siendo una entrada de desarrollo sin compilación.

La nueva regresión mantiene disponibles los archivos viejos, recarga con los recursos versionados y exige cinco modos, sonido dentro del diálogo, un único botón pausa, estilos aplicados, canvas dibujado, cero errores y la misma XP/guardado. Se conserva una fixture de los tres archivos anteriores para reproducir el problema sin depender del historial Git en CI. No se alteran los datos guardados ni las mecánicas.

Validación local final: 30 pruebas unitarias, 35 comprobaciones de Chromium y las dos detecciones deliberadas de animación rota aprobadas. Inspección visual de `artifacts/cache-fix-desktop.png` con escena, personaje y cinco modos presentes. La regresión de caché se ejecutó también por separado después de exigir explícitamente la pausa duplicada en el control roto. El test de compilación exige además la versión en el `src` del módulo inicial: un import map por sí solo no versiona esa entrada HTML.

### Entrega A.1 — 2026-10-25 (Buenos Aires)

Implementación desde `main`/4007215 en rama nueva `dev/delivery-a1-training-polish`, incorporando la corrección de caché todavía pendiente del PR #3. No se cambió `main`, Pages, las arenas ni los personajes.

Se añadieron configuración única de balance, secuencias y ráfagas graduales, llegadas espaciadas en Defensa y Fuerza, blancos algo mayores y parejas probabilísticas, trazos rectos y aceptación temprana razonable en Esquiva, recompensas por amagues leídos y ventanas limitadas en Crítico. HUD centrado, ayuda y controles dentro del marco, panel lateral con niveles/XP y animaciones reales. `comboRecords` es una extensión aditiva del guardado Souls para que los premios de hitos no se repitan tras recargar; no migra ni toca Idle v7. Se preserva el protocolo de escritor exclusivo.

Las primeras pruebas señalaron expectativas anteriores incompatibles con el pedido: origen de Defensa dentro de escena, resultados inmediatos de Esquiva, pares obligatorios a combo 25 y amagues sin recompensa. Se adaptaron a las reglas solicitadas manteniendo los controles reales y las regresiones previas. La comparación exacta de flotantes de velocidad se cambió por tolerancia 1e-8. La inspección visual detectó que capturar inmediatamente tras cambiar de modo con reloj detenido fotografiaba el frame anterior: las capturas ahora avanzan un frame antes de tomar la imagen. Los avisos pasaron a texto DOM para conservar legibilidad en móvil.

Validación y parámetros detallados: `docs/DELIVERY_A1.md` y `docs/BALANCE_A1.md`. Las simulaciones mantienen el combo como fixture y no se presentan como sesiones humanas completas a combo 200. Se inspeccionaron capturas de escritorio, móvil, ráfagas, ejecución de Esquiva y anillo Perfecto de Crítico.

Cierre local de A.1: 40 unitarias aprobadas, 43 comprobaciones Chromium aprobadas y ambas mutaciones de `hero()` detectadas por sus aserciones de movimiento. Las 35 simulaciones × 120 s terminaron con cero fallos del solucionador. Se volvió a ejecutar el módulo de navegador A.1 tras exigir píxeles reales de manzanas y mejor combo persistente. La configuración de publicación no se cambió y no se desplegó la URL pública.

### Entrega A.2 — 2026-10-25, Buenos Aires

Rama nueva desde main/48d1c18. Se trabajó exclusivamente en los cinco entrenamientos y el ajuste de pantalla; no se adelantó B. Los lanzamientos de Fuerza nacen en el muñeco, la espada tiene un solo ataque y un único cambio en espera, y la estrella perdida es neutral. Defensa comparte geometría circular/rectángulo redondeado entre colisión y render; una fruta pasada no se bloquea al girar tarde. Precisión combina tres tamaños. Esquiva se redujo a cabezazo, brazo y patada, con actores próximos y círculo blanco/puntuación calculados por la misma función. Crítico usa avisos comparables en rojo/dorado. Se añadieron frases de ritmo y feedback de cadenas perfectas sin alterar XP/economía.

La revisión visual/matemática corrigió una cabeza que se quedaba corta y una evasión que alcanzaba su pose demasiado lentamente: se ajustó el contacto visual del cabezazo y la subida/retención de la pose de evasión. El ajuste de escritorio conserva 5:3 y mide el espacio vertical disponible; no oculta overflow para simular que todo entra. Las zonas táctiles usan el canvas y el panel mantiene los cinco atributos. Se eliminó la ayuda duplicada de abajo y se trasladó a `?`, con devolución explícita del foco al cerrar.

Las pruebas existentes se adaptaron a cambios solicitados, conservando las regresiones de guardado y duplicación. El corte se resuelve en el siguiente paso físico conducido por RAF: una aserción a 10 ms era inestable a 60 Hz y se cambió a 20 ms, sin cambiar el motor. Otra aserción seguía IDs solo al pulsar y no detectaba cortes múltiples posteriores del mismo barrido; ahora observa toda la trayectoria y cuenta exactamente los premios del grupo, con futuros spawns deshabilitados en esa fixture. El cierre de dialog se espera un frame porque el evento nativo es asíncrono.

Se midieron 60 escenarios (6 combos × 5 modos × 2 perfiles) de 120 s, todos sin fallos. El perfil restringido incorpora cadencia de entrada y giro limitado; no se presenta como una prueba humana. Parámetros y límites en docs/BALANCE_A2.md. La entrega conserva src/state.js y src/save-session.js sin cambios. Dos capturas actuales se guardan en docs/screenshots/current-*.png; el resto queda ignorado en artifacts. No se generó ZIP ni se publicó la página desde esta tarea.

Cierre local: 51 unitarias, 51 comprobaciones Chromium y 60 simulaciones aprobadas. Las pruebas de mutación detectaron por separado el cuerpo sin movimiento en unitarias y navegador. La verificación de audio inspecciona nodos Web Audio reales y tonos de cortes consecutivos; no afirma escucha humana. La emulación móvil comprueba también dos dedos sin cambio de escala/desplazamiento. El cierre de ayuda devuelve el foco para que el teclado siga funcionando al retomar.

La primera ejecución remota de A.2 falló en la aserción de tres Perfectos dentro de seis frutas aleatorias. Se reprodujo localmente: un corte múltiple válido puede tomar la segunda fruta como Bien, así que esa secuencia aleatoria no garantiza tres Perfectos consecutivos. Se conservaron las ráfagas naturales y se agregó una cohorte de tres lanzamientos físicos, de alturas distintas y separados por 250 ms, ejecutada con toques nativos: exige tres Perfectos y los tonos 1160/1320/1480 Hz. No se cambiaron las reglas para corregir esta prueba. Los detalles remotos ahora se publican como anotaciones del check; la descarga de logs de Azure estaba bloqueada en este entorno. Se corrigió además la espera de arranque del módulo A.2 para no depender de requestAnimationFrame con el reloj de prueba detenido.


### Entrega A.3 + cien arenas — 2026-10-25 (Buenos Aires)

Rama nueva `dev/delivery-a3-hundred-arenas`, desde `main`/7db314e. Se entrega el HTML generado y los módulos, sin fusionar ni publicar. Recuperación al tercer error en cinco modos, misiones persistentes encadenadas con premio y avance en el mismo guardado por acierto, escudo curvo con colisión compartida, blancos mayores, preparación corporal de Esquiva y Bien aéreo en Crítico. La cámara amplía el mundo horizontal, conserva las proporciones y transforma el puntero; equipo a la izquierda, atributos a la derecha, expansión nativa/alternativa y orientación solicitada desde el gesto. Se elimina la botonera inferior.

Se reemplaza el prototipo de series por cien arenas secuenciales en diez regiones, cuatro rivales con jefe por arena, habilidades con efecto durante contacto, transiciones, derrota/reintento, victoria y premio único. El motor no preselecciona ganadores. Los cinco espacios comparan y compran equipo; una mejora durante combate conserva el daño recibido. Los atributos no tienen tope global; probabilidades limitadas y rendimientos decrecientes. Nueva curva de XP sin reducir niveles ni XP existentes. Se preservan la clave Souls, el escritor exclusivo, las protecciones por cuota/memoria/guardado ilegible y el Bridge. Se añaden únicamente casco, misiones y mapa completado; `wins` antiguo no decide dificultad ni inventa IDs ya completados. Idle v7 no se toca.

Validación local: build, 68 unitarias y 64 comprobaciones Chromium; 60 escenarios de entrenamiento de 120 s, 6000 combates de balance y 150 sondas de atributo único, más ruta completa 1–100 con premios idempotentes. La mutación de animación debe fallar en unitarias y navegador. Se conservaron regresiones de dos pestañas, getter de localStorage, cuota, caché y controles nativos. Las pruebas nuevas juegan las arenas 1 y 100 con cuatro derrotas reales, miden avance corporal en canvas, completan misiones consecutivas, prueban derrota/reintento, recuperación en los cinco modos y coordenadas tras fullscreen. El caso de cuota en victoria conserva el avance en memoria y lo persiste al reintentar sin premio duplicado.

Se adaptaron fixtures anteriores al cambio solicitado: recuperación necesita continuar explícitamente; las estrellas aisladas no pueden esperar mientras otras amenazas acumulan tres errores; la misión llega dentro del acierto, sin segunda escritura. Se corrigieron la espera de cierre de la nueva ventana de Esquiva y las coordenadas de cámara. La instrumentación de pose descuenta el desplazamiento de cámara para no permitir un falso positivo. La revisión detectó y corrigió un listener de fullscreen de la escena inactiva que desbloqueaba orientación y un atributo `data-mode` del contenedor que interfería con la selección de los cinco botones. Se inspeccionaron las cuatro capturas actuales de escritorio/móvil y entrenamiento/arena; artefactos transitorios quedan ignorados.

Informes: `DELIVERY_A3.md`, `BALANCE_A3.md` y `ARENA_BALANCE.md`. La proyección equilibrada ronda 255 h a 15 XP/s efectivos; no es una duración garantizada ni una barrera temporal. La ruta de equipo puede resultar más rápida y requiere partidas humanas de calibración. Arte procedural reutiliza familias de enemigos. Móvil se verifica por emulación Chromium, no dispositivo físico ni Safari. No se implementan personajes, razas, clases o integración con Idle. No se generan ZIP ni se eliminan fixtures/documentos históricos necesarios.


La primera CI de A.3 pasó build, unitarias y balance, pero Chromium detectó que a 900 px la barra de modos/acciones podía superar el ancho central y quedar bajo el panel de atributos. Se permitió repartir la barra en dos filas según espacio real y se agregó comprobación de límites de todos sus botones a 900 y 1024 px, más clic nativo en «Salir». No se fuerza el clic ni se elimina la regresión de dos pestañas que descubrió el problema.


### Entrega A.3.1 — 2026-10-27 (Buenos Aires)

Se verificó que A.3/PR #6 está fusionada en `main`/cbbb23d. Rama nueva `dev/delivery-a3-1-combos-room`, sin modificar `main` ni publicar Pages. Se leyeron pedido completo, referencias, README, balance y pruebas previas. Los cuatro bocetos se recibieron durante el trabajo y guiaron barra central/combo derecho, sala progresiva, velocidades de combate y preparación corporal; se adaptan a vectores propios.

XP activa individual 2/4/12 y luego cuadrática suavizada, con referencia al nivel al iniciar combo. Se simularon primero la hipótesis y la realimentación por subir nivel: recalcular el presupuesto dentro de la misma cadena inflaba demasiado los niveles bajos, por eso se fija por cadena. La cola lineal conserva premios crecientes, sin multiplicadores por tramos ni crecimiento factorial. Sala multiplica solo base; estaciones y Perfectos suman y misiones se guardan aparte en el mismo snapshot. Amagues dan 1 XP fijo sin avanzar combo ni limpiar errores activos, evitando AFK con bonos de sala/estación. Récords de hitos conservados sin repetir la vieja XP extra.

Sala general 1–10, compras con coste/faltante, escritor y límite, decoración acumulativa de paredes, armas, estandartes, iluminación y emblema. Migración únicamente aditiva `room=1`; estaciones y todos los campos previos quedan intactos, igual que save-session.js y la clave de Souls. No se toca Idle. El HUD retira la XP total visible, centra barra y deja combo a la derecha, también tras rotación. La subida ilumina y completa la barra, muestra ícono y mejora real de heroStats con sobrante; varias subidas se resumen sin detener entradas y el audio respeta el interruptor.

Se confirmó que la extensión máxima de Esquiva coincidía con el blanco; ahora cabeza/brazo/pierna se retiran durante preparación y extienden después de la ventana. Perfecto termina 200 ms antes del contacto y Bien hasta 35 ms antes. Resultado e impacto se sincronizan; la acción errónea sigue dibujándose antes de herida. En combate se centralizan fases más lentas, armas y zancadas, daño al final de aproximación y velocidad ×1/×2 mediante pasos idénticos de 1/120 s. Cada rival aumenta HP y presión independientemente del arquetipo; el tercero deja de ser solo un trámite ante el jefe. Se conservan cien arenas y premios únicos.

Validación local final: build; 81 unitarias; 72 comprobaciones Chromium; 60 escenarios de entrenamiento ×120 s; 6000 combates +150 sondas de atributo único y ruta completa 1–100; 630 escenarios de XP; mutación de pose ignorada rechazada en unitarias y navegador. Se conservaron regresores de dos pestañas/cierre/reapertura, cuota/reintento, getter de localStorage, modo memoria y caché. Las ocho comprobaciones nuevas usan teclado/toques/clics nativos, compras y recargas reales, ventanas blancas dibujadas, progreso de barra al finalizar su animación, audio y controles de velocidad. El modelo compara ×1/×2 con el mismo RNG, cooldowns, contactos y transiciones. El render del rival comprueba cambios reales de brazos/piernas en preparación e impacto, no solo PNG completos.

Las pruebas antiguas se adaptaron a reglas solicitadas: se retiró XP fija de hitos sin quitar pruebas de récords/persistencia; rojo ya no avanza combo; el blanco de Esquiva se busca antes del contacto; el contador de sesión oculto ya no exige caja visible. La medición de movimiento de combate ahora observa aproximación completa y retorno en vez de comparar dos instantes que, con la nueva preparación lenta, todavía eran anticipación. No se forzaron clics ni se debilitaron pruebas de guardados. Se revisaron capturas actuales de escritorio, móvil vertical/horizontal, nivel, sala, Esquiva y arena; artefactos transitorios siguen ignorados, sin ZIP.

Informes: DELIVERY_A31, BALANCE_A31_XP, BALANCE_A31_TRAINING, ARENA_BALANCE y FUTURE_PROGRESSION_AND_FISHING. Sala completa 68.461 monedas. Combo 50 a nivel 64/sala 10: 72.986 XP activas sin Perfecto/estación, frente a 85.855 requeridas; en nivel 100: 77.008 frente a 239.284. El máximo muestreado de 50 aciertos en niveles ≥10 con estación ≤10/sala 10 fue 7 subidas desde 10, no diez niveles intermedios. La nueva recompensa cambia sustancialmente el ritmo; la antigua estimación de 255 h no es válida para jugadores que sostienen combos altos. Requiere calibración humana. No se afirma teléfono físico, Safari/Firefox, bloqueo de orientación real ni balance definitivo. Nivel general, talentos, clases/razas y pesca son solamente una propuesta documentada, sin cuentas o integración nueva.


La rama se subió correctamente a origin. La creación del PR con el título solicitado se intentó por `gh pr create`, también fuera del sandbox, pero la conexión a `api.github.com` devuelve Forbidden/403; `curl` confirmó rechazo del túnel CONNECT. No es una prueba fallida ni se declara CI remota aprobada. Se deja el cuerpo completo revisable en `docs/PR_A31.md` y un enlace de comparación con título/resumen preparados. No se inventa un número de PR ni se intenta fusionar/publicar como alternativa.

### Fase experimental A.3.2 — 2026-10-28 (Buenos Aires)

Se leyó íntegramente `Argentum_Souls_A32_Especificacion_Corregida.md` y se completó la lectura de los módulos pendientes, incluido el scheduler real, compras, premios, misiones, render, arenas y coordinación de guardados. Rama nueva `experiment/a3-2-measurement-rhythm` desde `main`/911300e8dcbde72258c2babd1cd90d9b65d4789e. No se modifica Idle-Czerniak ni se integra pesca. No se fusiona ni se despliega Pages.

El juego mantiene por defecto control/X0. Las opciones de URL y el HTML autocontenido permiten probar un candidato de Esquiva/Crítico que solapa únicamente espera neutra con retorno/aterrizaje completo. Fuerza, Defensa y Precisión conservan parámetros, geometría, render y secuencias fijados contra la base; no se recortan ventanas, preparación, animaciones, recuperación ni variedad. Se conservan Q, precios, coeficientes y enemigos. Se probaron X0, X1a4 y X2c50 en sesiones/recorridos, y las siete variantes en la matriz algebraica; no se elige ganadora. Los primeros premios base siguen siendo 2/4/12 antes de mejoras.

Medición local optativa: dos relojes, fases, acciones discretas y puntero continuo, aciertos activos, rojos pasivos, fallos, rachas y premios. No se envían datos. Exportación de copia Souls y medición; comparación de ritmos con recarga solo si guardar tiene éxito. Las variantes no crean claves/metadata de balance en el guardado. El fixture veterano tiene 75/61/36/14/15 y resto sintético explícito: no representa la partida real del usuario ni se tuvo acceso a ella. Localhost/archivo no comparten automáticamente el origen ni el almacenamiento de Pages.

Los controladores sintéticos solo reciben señales visibles actuales. Reacción positiva variable, decisiones erróneas, lapsos correlacionados, fatiga, recuperación, desplazamiento/puntería y giro/aceleración finitos. El ensayo de sensibilidad detectó que anticipar un corte con la propia latencia sorteada favorecía al controlador: se reemplazó por planificación con latencia habitual más variación real al actuar. También se exige visibilidad completa del proyectil y reacción variable al orientar el escudo. Estas correcciones son del simulador, no de los entrenamientos protegidos. Se recalcularon los subconjuntos y recorridos afectados; los componentes conservan SHA, snapshots de código/configuración y semillas, sin adjudicar resultados anteriores a un commit posterior.

Recorridos desde `loadState({getItem:()=>null})`: XP, misiones, monedas, compras, botín y cuatro oleadas mediante las funciones de producción. Tres builds, cuatro prioridades de compra, ablación sin compras, políticas adaptativa/greedy separadas y sensibilidad a bloques de 120/600 s. Banco finito de eventos reales reutilizado bajo counterfactuales financieros; caché con SHA de código/configuración, Node, parámetros y checksum de eventos. Es una aproximación documentada, no una población humana ni una interpolación por XP/s. Hitos no alcanzados se censuran; terminar en arena100 no inventa snapshots posteriores.

Métodos y comandos: `docs/A32_METHODS.md`. Tablas y límites: `docs/A32_REPORT.md`. Los resultados completos y resúmenes JSON/CSV, semillas 1001–1100, manifiesto SHA256 y snapshots exactos quedan en `artifacts/a32/`, ignorado por Git. No se agregan galerías ni se eliminan ilustraciones. Las mil semillas y la calibración humana de candidatos finales quedan pendientes, sin afirmarlas ejecutadas. La utilidad estudia nueve estados representativos alrededor de una hora, no todos los snapshots de todos los recorridos.

HTML experimental: `npm run build:a32:portable`. CSS/módulos incorporados, overlap/X0 por defecto; también existe control local servido. Chromium comprobó el HTML autocontenido por HTTP local sin recursos externos, con disparo nativo y cambio de ritmo. La política administrada bloqueó file://, por lo que no se declara verificado el doble clic. No se publicó un balance definitivo.

Validación final ejecutada: 99 unitarias; 7 regresiones del comando de guardados (también incluidas en la suite); 78 comprobaciones Chromium, incluidas rutas bajo `/Argentum-Souls/`, teclado/mouse/táctil, cierre/reapertura de dos pestañas, cuotas y getter bloqueado. Mutación que ignora la pose rechazada por unitarias y Chromium. Baselines antiguos: 60 escenarios ×120 s, 6000 combates +150 sondas y ruta completa, 630 escenarios de progresión; informes históricos sin cambios involuntarios. Build normal y HTML autocontenido generados correctamente.

Corridas finales: 3000 sesiones físicas de una hora/54000 filas derivadas, 13500 recorridos desde cero, 1890 filas algebraicas, 6000 validaciones de pasos/fps, 3000 sensibilidades de reacción y 1000 ensayos físicos de explotación. Utilidad: 675 celdas, cien semillas conjuntas, 4500 horas de entrenamiento sintético y 72000 batallas incluidas las bases emparejadas. El consolidador verificó cien semillas únicas por celda, orden de hitos, censura, saldos no negativos e igualdad exacta de los tres modos protegidos entre ritmos. Se generaron resúmenes y manifiesto.

Resultados sintéticos, no validación humana: Esquiva pasa de 32,77 a 38,88 aciertos/min (+18,6%) y Crítico de 26,95 a 31,07 (+15,3%) en el intermedio/X0. Intermedio equilibrado/mixto/control: arena10 mediana7,1 min, arena100 mediana1,89h; sin compras, arena100 mediana15,98h. Los objetivos de5h/meses no quedan respaldados por este modelo. No se forzaron mediante nerfs ni se declara una XP ganadora. Limitaciones y censura de otras variantes constan en el informe, no se sustituyen por extrapolaciones.

La rama experimental se subió a origin. Se intentó crear un PR en borrador con `gh pr create --draft --base main --head experiment/a3-2-measurement-rhythm --body-file docs/PR_A32.md`, también fuera del sandbox; ambas solicitudes devolvieron `Post https://api.github.com/graphql: Forbidden`. La creación del PR queda bloqueada por acceso a la API, no por una prueba ni por rechazo de aprobación automática. No se inventa número de PR ni se afirma CI remota. El cuerpo revisable está en `docs/PR_A32.md`; enlace de creación: https://github.com/marianoczer-afk/Argentum-Souls/pull/new/experiment/a3-2-measurement-rhythm . No se fusionó ni se desplegó Pages.
