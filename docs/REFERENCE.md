# Referencia de gameplay y plan de entregas

Revisión del 25 de octubre de 2026. Cuatro MP4 consecutivos proporcionados por el usuario; duración total aproximada: 6 min 12,55 s. Se inspeccionaron los cuatro archivos con ffprobe, hojas de contacto cada 3 segundos y secuencias de 6 segundos a 4 fotogramas por segundo para arena y cada entrenamiento. Es análisis de fotogramas, no reproducción audiovisual completa ni medición de las teclas del jugador. No se extrajeron recursos gráficos o sonidos para el juego.

## Observaciones comprobables

Los tiempos de esta tabla son relativos al archivo indicado, no a la concatenación.

| Parte y tramo aproximado | Lo visible | Consecuencia de diseño |
| --- | --- | --- |
| 00, 00:03–01:01 | Selección de batalla, una victoria, serie de goblins, derrota/reintento. Los luchadores avanzan para golpear y vuelven a su posición; destellos, retroceso, números de daño, barras de vida y casillas de habilidades con recarga. | La futura entrega de arena necesita anticipación, contacto y recuperación, además de decisiones con habilidades. No alcanza con animar las barras. |
| 00, 01:04–final; continúa en 01 hasta ~00:05 | Fuerza: muñeco a la derecha, manzanas a distintas alturas, cortes altos y bajos, movimiento del héroe, restos de manzana y estrellas detrás. El combo alcanza ×80 y después se reinicia. Las misiones entregan premios mientras los lanzamientos siguen. | Sesión continua, cortes encadenables, posibilidad de barrer varios objetos próximos, estrellas y misiones sin interrumpir. La secuencia visible supera un minuto. |
| 01, ~00:14–01:29 | Defensa: héroe central, escudo orientado en distintas direcciones, proyectiles por varios ángulos y pequeños impactos al bloquear. El combo sube y se reinicia tras errores. | Apuntado direccional inmediato y colisión cerca del escudo; conservar la lectura del objeto hasta el impacto. Tampoco hay cierre al llegar a 30 segundos. |
| 01, ~01:35–final; 02, inicio–00:20 | Precisión: arco en primer plano que sigue la puntería; blancos simultáneos, de distintos tamaños, que aparecen y desaparecen; destellos al acertar, combo y misiones. | Puntería con mouse, arco y trayectoria de disparo visibles, centro perfecto y duración legible de los blancos. El video no permite afirmar qué evento exacto de mouse dispara ni reconstruir una fórmula de timing. |
| 02, ~00:26–00:55 | Esquiva: el muñeco prepara y ejecuta movimientos diferentes; el héroe se agacha o se desplaza y queda momentáneamente bajo/extendido; destello y estrella de respuesta. | Separar anticipación, respuesta corporal y recuperación. No tratar las cuatro direcciones como una sola animación. |
| 02, ~01:01–01:18 | Crítico: señales sobre el muñeco, salto hacia él, golpe en el aire, destello y retorno; también aparece una calavera. | Conservar la regla explícita del usuario: calavera = esperar, exclamación = primer toque, segundo aviso aéreo = segundo toque. El muestreo no prueba qué pulsaciones se hicieron. |
| 02, ~01:29–final; 03 completo | Tienda, panel de estadísticas/habilidades/talentos, mapa y casa; el último tramo termina en la interfaz de captura. | Contexto para entregas posteriores; no atribuir a esta parte peleas ni entrenamientos adicionales. |

No se observa un contador de segundos que cierre automáticamente esas sesiones. Esto es compatible con el entrenamiento continuo pedido por el usuario; un video finito no demuestra por sí solo duración ilimitada. Las ventanas de reacción, frecuencias y curvas del prototipo nuevo son valores iniciales elegidos para jugar y probar, no mediciones exactas del Flash. No se afirma haber medido la latencia original.

## Primera entrega: entrenamiento continuo

- Separar simulación, dibujo y entrada; presentación, persistencia, economía y arena en archivos distintos. La distribución de Pages usa módulos relativos, sin HTML con lógica incrustada duplicada.
- Entrenar hasta salir voluntariamente; pausar al perder foco o cambiar de pestaña del juego. Guardar XP y monedas durante la sesión. Sin recompensas gratuitas por empezar/salir.
- Ritmo creciente y acotado. Simulación a 120 pasos/s, dibujo con requestAnimationFrame. No simular minutos de fallos al regresar de otra pestaña.
- Fuerza: tres alturas, corte activo durante 100 ms, varias manzanas por trayectoria, sin recarga entre pulsaciones y estrellas detrás. Cada proyectil se premia una sola vez.
- Defensa: orientación directa al puntero y bloqueo dentro del arco del escudo al llegar al impacto.
- Precisión: blancos con vida y movimiento, centro perfecto, arco que acompaña la mira, flecha y efectos al disparar. Es una primera aproximación; no se presenta como réplica exacta del sistema de timing original.
- Esquiva: señales con tecla requerida, salto/agachada/dash visibles. Crítico: amague y dos pasos, con penalización por adelantarse.
- Combos aumentan XP; misión de 12 aciertos y mejor combo ×5 entrega una sola recompensa por sesión y no termina el entrenamiento. Estaciones suman XP por acierto.
- Mantener guardado independiente de Souls y migrar niveles/equipo/monedas del prototipo. No tocar Idle-Czerniak ni su v7.
- Probar reglas con tests deterministas y entradas reales de teclado/mouse con Chromium. Inspeccionar capturas de movimientos, no solo contadores.

## Entregas siguientes

1. Arena: movimientos propios, impacto/defensa/derrota, daño flotante, decisiones con habilidades y jefes de series de 3/5. La arena actual se conserva jugable; su traslado a un módulo no equivale a completar esta entrega.
2. Personajes: consultar `Idle-Czerniak/src/js/core/005-core.js` en modo lectura, preservar IDs/modificadores de cinco razas y ocho clases, selección y guardado independiente por personaje. No se inventan esos valores en esta entrega.
3. Progresión: habilidades con identidad por clase, arenas desbloqueables, equipo y economía a largo plazo.
4. Pulido e integración explícita con exportación de datos; ningún supuesto de localStorage compartido entre dominios.

Antes de publicar cambios en main se requiere revisión del PR. Esta etapa trabaja sobre `dev/continuous-training`.
