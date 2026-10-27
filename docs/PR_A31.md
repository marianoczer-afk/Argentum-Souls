# Entrega A.3.1 — Combos, sala de entrenamiento y mejoras de combate

## Resultado

A.3.1 desde `main`/cbbb23d (A.3 fusionada), en rama nueva `dev/delivery-a3-1-combos-room`.

- XP individual creciente: base exacta **2/4/12**, curva suavizada desde el cuarto acierto, nivel de referencia fijado al empezar el combo; sin multiplicadores por tramos. Sala multiplica la base, estaciones y Perfectos suman, misiones se conceden aparte en el mismo snapshot. Amagues rojos: 1 XP fijo, sin avanzar combo ni borrar fallos activos.
- Sala general de **10 niveles**, +0% a +90%, compras funcionales y decoración propia progresiva en niveles 1/3/5/7/10. Se conservan estaciones y equipo antiguos.
- Barra centrada, combo a la derecha, XP por acierto y aviso de nivel con ícono, luz, audio y mejora calculada por `heroStats`. Varias subidas se resumen y la barra continúa con el sobrante; sin bloquear controles.
- Esquiva: cabeza, brazo y pierna se retiran antes de extenderse; **la ventana blanca termina 200 ms antes del impacto**. Se comprueba el círculo realmente dibujado y se mantiene la acción equivocada antes del daño.
- Combate **×1 / ×2**, mismas iteraciones de 1/120 s, con animaciones más lentas/expresivas y daño al contacto. HP y presión crecientes entre los cuatro rivales; el élite tiene más peso. Se conservan cien arenas, premios únicos y progreso.
- Migración aditiva: solo `room=1` por defecto. No se cambia `save-session.js`, clave de Souls, niveles, XP, equipo, estaciones, récords, misiones o arenas guardadas. No se toca Idle v7.

## Fórmula y balance

Se probó la hipótesis cuadrática y se suavizó para evitar realimentación al subir niveles y saltos excesivos en niveles intermedios. En nivel 64, combo 50 y sala 10: ~73.000 XP activas antes de Perfectos/estación/misiones, frente a 85.855 del próximo nivel. En nivel 100: ~77.000 frente a 239.284.

Los combos altos aceleran mucho más que A.3; las estimaciones históricas de 255 h **ya no describen este sistema**. No se promete conservar esa duración. La sala completa cuesta 68.461 monedas y compite con equipo/estaciones. [630 escenarios y fórmula exacta](https://github.com/marianoczer-afk/Argentum-Souls/blob/dev/delivery-a3-1-combos-room/docs/BALANCE_A31_XP.md), [ventanas y 60 escenarios de entrenamiento](https://github.com/marianoczer-afk/Argentum-Souls/blob/dev/delivery-a3-1-combos-room/docs/BALANCE_A31_TRAINING.md), [6000 combates, 150 sondas y duración de cada rival](https://github.com/marianoczer-afk/Argentum-Souls/blob/dev/delivery-a3-1-combos-room/docs/ARENA_BALANCE.md).

## Verificación

Los cinco comandos existentes: `npm run build`, `npm test`, `npm run test:browser`, `npm run test:balance`, `npm run test:mutation`.

81 unitarias y 72 comprobaciones Chromium. Se mantienen regresiones de dos pestañas/cierre/reapertura, cuota, getter de localStorage y caché. Nuevas comprobaciones: 2/4/12 por toques reales, misiones/persistencia, nueve compras de sala, avisos de uno/varios niveles con mejora real y audio, cinco apariencias de sala, barra centrada tras rotación, tres evasiones Perfectas antes del impacto, acción equivocada visible, ×1/×2 y recargas, pasivos sin inflación de combo. El test de cuerpo de combate observa toda la aproximación y retorno, no una espera antigua incompatible con el movimiento más lento.

630 escenarios de XP +60 escenarios de entrenamiento +6000 combates +150 sondas, y recorrido completo 1–100 con recompensas idempotentes. La mutación de pose ignorada debe ser rechazada tanto en unitarias como Chromium. No son partidas humanas.

[Entrega, capturas y límites](https://github.com/marianoczer-afk/Argentum-Souls/blob/dev/delivery-a3-1-combos-room/docs/DELIVERY_A31.md) · [Registro](https://github.com/marianoczer-afk/Argentum-Souls/blob/dev/delivery-a3-1-combos-room/docs/WORKLOG.md)

![HUD y subida de nivel](https://raw.githubusercontent.com/marianoczer-afk/Argentum-Souls/dev/delivery-a3-1-combos-room/docs/screenshots/current-desktop.png)
![Sala de élite](https://raw.githubusercontent.com/marianoczer-afk/Argentum-Souls/dev/delivery-a3-1-combos-room/docs/screenshots/current-room.png)
![Combate y velocidad móvil](https://raw.githubusercontent.com/marianoczer-afk/Argentum-Souls/dev/delivery-a3-1-combos-room/docs/screenshots/current-mobile-arena.png)

## Alcance y límites

[Propuesta documentada de nivel general, talentos, clases/razas y pesca](https://github.com/marianoczer-afk/Argentum-Souls/blob/dev/delivery-a3-1-combos-room/docs/FUTURE_PROGRESSION_AND_FISHING.md). No implementa clases, razas, cuentas ni integra pesca. Los bocetos se adaptan con arte vectorial original; no se presentan como capturas implementadas. El balance necesita calibración humana, especialmente combos altos y rutas de equipo. Móvil probado por emulación Chromium, sin afirmar dispositivo físico, Safari/Firefox o bloqueo real de orientación.

**No fusionar automáticamente.** `index.html` generado y `dist/` compatibles con Pages; sin ZIP ni publicación de `main` desde esta entrega.
