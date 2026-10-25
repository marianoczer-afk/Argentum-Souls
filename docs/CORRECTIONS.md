# Corrección de la primera auditoría — PR #1

Esta actualización se realiza exclusivamente sobre `dev/continuous-training`, para el mismo PR #1 hacia main. No se fusiona ni se amplía el alcance a personajes, progresión nueva o mejoras de arena.

## 1. Concurrencia de pestañas

`src/save-session.js` es la única ruta de escritura de la aplicación. Se eliminó el helper de escritura directa que podía usarse sin coordinación. Se conserva la clave `argentum_souls_fiel_v2` y la compatibilidad con los datos anteriores.

La sesión mantiene un Web Lock exclusivo por origen (`argentum-souls:save-writer:v1`). Una pestaña que no obtiene el bloqueo queda en espera, no puede entrenar, comprar, usar habilidades ni modificar atributos y **no escribe al cerrar ni al reintentar**. Los manejadores también verifican la autorización: no basta con deshabilitar los botones.

Al adquirir el bloqueo, la pestaña lee el guardado durable de nuevo y reemplaza el contenido del objeto de estado compartido por los componentes antes de habilitar acciones. El bloqueo sigue retenido durante todas las escrituras. Al salir se guarda bajo la misma autorización, se revocan futuras escrituras de esa instancia y se libera el bloqueo. Al restaurarse desde bfcache se recarga la aplicación, evitando reutilizar una sesión cerrada.

No se usan arrendamientos con vencimiento ni comparaciones read/modify/write de localStorage como si fueran bloqueos atómicos. Si falta Web Locks, el juego puede leer el progreso existente pero funciona solo en memoria y nunca lo sobrescribe. Las pestañas con la versión antigua deben recargarse: ese código anterior no participa en el protocolo.

**Regresión Chromium:** dos páginas del mismo contexto/origen; una gana XP y compra equipo, la otra intenta forzar manejadores de entrenamiento, compra, estación, combate, habilidad y reintento. Se verifica que no escribe ni cambia su progreso. Se ejercitan ambos órdenes de cierre y la reapertura; cuando se transfiere el control se comprueba XP, monedas y equipo actualizados, se gana más XP y se verifica su persistencia al reabrir. Una clave ajena de control permanece intacta.

## 2. Almacenamiento bloqueado

`loadState()` obtiene `globalThis.localStorage` dentro del `try`. El adaptador también protege la obtención de la propiedad y la lectura inicial. No quedan argumentos predeterminados que evalúen esa propiedad fuera de la protección.

Cuando la propiedad arroja `SecurityError`, la aplicación arranca, permite jugar en memoria y muestra desde el inicio que no conservará ese progreso al cerrar. Las pruebas reemplazan el **getter de la propiedad**, no únicamente `getItem`. Un archivo JSON ilegible no se reescribe automáticamente con datos vacíos: se impiden las mutaciones y se informa que debe revisarse el guardado.

## 3. Resultado de guardado explícito

El adaptador devuelve `{status, reason, message}`: `saved`, `memory`, `error` o `readonly`. El controlador presenta:

- `saved`: «Sesión guardada» después de una escritura correcta.
- `memory`: «Progreso solo en memoria», con aviso de pérdida al cerrar.
- `error`: «No se pudo guardar», con la intervención y reintento necesarios.
- `readonly`: aviso de espera; no se habilitan acciones que cambien el progreso.

Una cuota agotada conserva los datos en la pestaña, muestra el error y no confirma guardado. Al liberar la condición de fallo y pulsar Reintentar se guarda el mismo progreso y se actualiza la confirmación. Las pruebas verifican que tras cerrar y reabrir persiste la XP recuperada.

## 4. Animación y entrada táctil

El test unitario invoca `TrainingRenderer.hero()` y comprueba las llamadas que aplica al contexto: elevación del cuerpo al saltar, compresión al agacharse, desplazamiento de dash y avance/rotación de espada. El test Chromium observa `getTransform()` después de que el dibujante transforma el cuerpo, en vez de inferirlo del estado lógico o de diferencias en todo el PNG. Esa observación solo existe en el navegador de pruebas.

`npm run test:mutation` copia código y tests a un directorio temporal, hace que `hero()` use `heroTransform(null)` y exige que ambas comprobaciones lo rechacen por la aserción concreta de movimiento. Un error de infraestructura o timeout no cuenta como detección. Después elimina la copia; no modifica el código real. Los dos fallos internos son **esperados** y el comando solo pasa si ocurren por las razones previstas.

Los controles táctiles ahora verifican resultados: corte y XP, arrastre nativo Chromium para orientar/bloquear con escudo, tiro al centro y fallo posterior sin doble premio, esquiva correcta, y secuencia crítico salto/aviso aéreo/golpe, sin premio por repetir el golpe y con ruptura de combo al pulsar la calavera. Se ejecutan en Chromium con entrada táctil emulada; no sustituyen pruebas en dispositivos físicos.

## 5. Rendimiento y alcance

La medición exploratoria de un bloque de 20 aciertos, sonido desactivado, encontró **21 reconstrucciones completas de la tienda oculta** antes de la corrección. Tras separar `renderProgress()` de `renderShop()` y agrupar el refresco de atributos por frame, el mismo bloque produce **0**. En esta máquina el bloque pasó de 7,4 ms a 1,0 ms; son muestras controladas, no un benchmark ni una promesa de FPS/latencia en otros equipos.

El guardado sigue siendo síncrono y por acierto. La regresión comprueba que la XP está escrita **antes de salir de la sesión**; no se introduce una cola de guardados ni una ventana nueva de pérdida para acelerar el juego. No se cambian reglas, combos, dificultad, gráficos ni clases/personajes. Los cambios de arena se limitan a aplicar la autorización de escritura a sus rutas de mutación.

Persistencia y coordinación quedan en un adaptador separado con cierre y suscripción; no se implementa la integración con Idle. Los selectores y eventos de la aplicación todavía requerirán encapsulación al realizar esa integración. No se lee ni escribe el guardado v7.

## Validación

Ver `docs/WORKLOG.md` para comandos, resultados y tiempos de la ejecución final. Los informes reproducibles de esta máquina quedan en `artifacts/correction-results.json`, `artifacts/browser-results.json` y `artifacts/animation-mutation.json` (salidas ignoradas por Git).
