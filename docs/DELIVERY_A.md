# Entrega A — HUD y entrenamiento

Rama: `dev/delivery-a-training-hud`, desde main `44fb005`. Esta entrega se detiene en A para que pueda probarse y publicarse sin esperar a B o C. No modifica Idle-Czerniak ni su guardado v7.

## Implementado

- HUD horizontal compacto con navegación Arenas/Entrenamiento/Tienda y engranaje. Modal de configuración para versión, commit fuente, identificador de build, sonido y estado real del guardado. Los datos del personaje se mantienen como perfil anterior sin asignarle IDs ficticios; raza/clase/selección corresponden a B.
- Sala sin columna lateral, canvas lógico **1200×720** y proporción 5:3 constante. Disciplinas compactas. Combo, mejor combo, XP ganada, nivel y progreso del atributo, misión y feedback dentro del marco de juego; se elimina la tabla inferior. En pantallas bajas se admite desplazamiento vertical en lugar de deformar el dibujo.
- Inicio automático al cargar, seleccionar o cambiar de disciplina. Cambiar conserva lo ganado y comienza la siguiente. Salir conserva el resultado; elegir una disciplina vuelve a comenzar. Pausa discreta/manual y al perder foco. Navegar a otra sección pausa; volver reanuda si esa fue la causa de la pausa. Una pausa por foco o configuración exige Continuar.
- Dificultad objetivo `min(combo / 80, 1)`, con aproximación suave y descenso progresivo tras perder combo. El tiempo transcurrido solo mueve la simulación y las animaciones: no sube la dificultad por sí mismo. Velocidades/frecuencias y mínimos de reacción acotados.
- **Fuerza:** ↑/W alto, →/D medio, ↓/S bajo, ←/A estrella trasera. Cortes múltiples y encadenados. Un movimiento al aire o sin estrella no falla ni rompe combo; perder un objeto sí. La estrella tiene mayor presencia, trayectoria, rastro, aviso y movimiento de recogida.
- **Defensa:** bolsa de ocho sectores sin repetición hasta agotarse y sin repetición inmediata al renovarse; orígenes visibles. Tiempo de llegada común de 2,5 a 2,1 segundos para evitar que proyectiles lanzados desde radios distintos converjan simultáneamente. Intervalo de lanzamiento mínimo cercano a 0,48 s y velocidad por debajo de 260 unidades/s. Escudo inmediato al puntero y feedback de perfecto.
- **Precisión:** zona ampliada, perfecto dentro del 16% del radio y Bien en el resto. Vida aproximada de 1,2–1,85 s. Movimiento desde combo 15 y parejas separadas por 220 ms desde combo 25, máximo cuatro blancos activos. Generación con separación espacial y posiciones de reserva; se omite un lanzamiento antes que tapar otro blanco. Blancos de al menos unos 44 px de diámetro en anchos móviles habituales, ajustados al ancho real de pantalla; no hay un área invisible de acierto fuera del blanco ni se amplía la proporción del centro perfecto.
- **Esquiva:** preparación, señal, destello perfecto, ventana tardía válida y ejecución visibles. Ritmo inicial más lento. Una respuesta válida permanece resuelta durante el golpe y no puede ser premiada o penalizada dos veces. Motivos explícitos para anticipación, dirección incorrecta o falta de respuesta.
- **Crítico:** calavera/primer salto/segundo golpe conservados. Clic o toque en cualquier parte del marco de escena, incluyendo el HUD y el pie; menú y diálogo externos no activan la acción.
- Conservación del adaptador de escritura exclusiva, modo memoria y recuperación de cuota de la entrega anterior. No cambia la estructura del guardado, los niveles previos ni la XP almacenada; no hace falta una migración nueva.

## Publicación y versión

`npm run build` genera el HTML raíz y `dist/`, listo para Pages, con versión visible, SHA fuente, marca explícita de cambios locales y digest de los archivos del juego. En desarrollo se usa `0.3.0-dev.<digest>`. El build estático comprobado identifica su commit fuente; un commit posterior puede contener solo el HTML generado.

El workflow `.github/workflows/pages.yml` ejecuta build, pruebas de lógica, navegador y mutación antes de desplegar main. En CI la versión es `0.3.<GITHUB_RUN_NUMBER>` y el SHA es exactamente `GITHUB_SHA`: cada publicación incrementa el número sin editar el HTML manualmente. El test de build verifica dos números de ejecución y commits distintos, conservando el digest para fuentes idénticas.

**Configuración necesaria al publicar:** el repositorio todavía tiene Pages en modo «Deploy from a branch / main». Para usar el versionado y publicación automáticos del workflow, seleccionar **Settings → Pages → Source → GitHub Actions** antes de publicar esta entrega. Este trabajo no cambia esa configuración, no ejecuta un despliegue y no fusiona el PR. El HTML raíz también sigue siendo servible con rutas relativas en el modo anterior, pero la publicación por rama no ejecuta el build ni numera nuevas ejecuciones.

## Validación

- Se conservan las regresiones de dos pestañas reales en ambos órdenes de cierre, almacenamiento bloqueado, cuota/reintento y guardado por acierto. Se adaptan los selectores al inicio automático, sin sustituir entradas por premios artificiales.
- Se actualizan las expectativas de Fuerza y dificultad que el pedido cambia expresamente: golpear al aire conserva combo y esperar no acelera el entrenamiento.
- Tests adicionales de combo, reducción de dificultad, bolsa de direcciones, velocidad/llegadas, movimiento de blancos, parejas separadas y fases de esquiva. Diez minutos por disciplina son tiempo simulado.
- Chromium verifica además el HUD, proporción y dimensiones, cambio automático con XP conservada, combo 25 mediante clics, dos blancos consecutivos, estrella móvil, fases de esquiva y exclusión de controles externos del Crítico. Capturas en `artifacts/delivery-a-*.png` revisadas en escritorio, móvil vertical y horizontal.
- La mutación que hace ignorar las poses debe seguir siendo rechazada por lógica y navegador. La entrada táctil es emulada; no representa pruebas en teléfonos físicos ni una medida de latencia física.

Comandos y tiempos finales en `docs/WORKLOG.md`.

## Pendiente, sin ampliar esta entrega

**B:** creación/selección de personajes, IDs y modificadores originales, estado por personaje, importación/exportación, curva ajustable de XP y simulación para niveles 10/25/50/75/100, selección/desbloqueo de 100 arenas. Antes de fijar la curva se presentarán estimaciones y supuestos; la fórmula anterior se conserva solo de forma provisional para no rebalancear ni reinterpretar XP guardada en A.

**C:** cuatro enemigos por arena, jefes, clases/habilidades/equipo y dificultad de combate. La arena actual se conserva para seguir jugando; no se declara completado el sistema de 100 arenas.

Referencia de HUD y datos consultada en modo lectura: `Idle-Czerniak`, commit `59977270a68c3a05f84eb760117b1a990d969c89`, especialmente `src/js/core/005-core.js` (identidad y workspace). No se copiaron ni modificaron guardados, ni se inventaron modificadores de razas/clases.
