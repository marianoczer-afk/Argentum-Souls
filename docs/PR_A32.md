# Experimento A.3.2 — ritmo, medición y progresión desde cero

Esquiva y Crítico conservaban esperas neutras que se sumaban al retorno/aterrizaje. Esta rama ofrece una variante optativa que solapa esas esperas, manteniendo preparación, ventanas, animaciones y recuperación. Fuerza, Defensa y Precisión conservan parámetros/render/geometría y secuencias de control. Sin parámetros permanece A.3.1/X0.

## Para probar

- `npm ci --ignore-scripts && npm run build && npm start`.
- Experimento: `http://127.0.0.1:8000/?measure=1&rhythm=overlap&xp=X0`.
- Control: `http://127.0.0.1:8000/?measure=1&rhythm=control&xp=X0`.
- `npm run build:a32:portable` genera un único HTML con CSS/módulos incorporados. Ver `docs/A32_METHODS.md` para origen de guardado y limitación del navegador administrado con file://.

El panel exporta copia Souls y medición local, sin telemetría remota; solo cambia de ritmo mediante recarga si guardar tuvo éxito. Exportar copia antes de probar XP alternativas. Una partida vacía en localhost no implica pérdida del guardado de Pages: son orígenes separados. No se accedió al guardado real del usuario.

## Mediciones y comparación

Herramientas reproducibles con Training/Combat, XP, misiones, compras y premios existentes: 100 semillas por celda, perfiles con latencia positiva variable, puntería/giro finitos, errores correlacionados y fatiga; observaciones actuales visibles, sin ataques futuros ni ventanas internas. Banco finito de trazas real y caché verificable, con límites documentados.

Se comparan X0, X1a4 y X2c50 sin elegir ganadora, además de siete variantes algebraicas; base 2/4/12, Q y partidas intactas. Sesiones 10/30/60 min, tres builds, prioridades económicas y políticas adversariales separadas. Hitos 10/20/50/100 con censura explícita. Los tiempos sintéticos con compras quedan muy lejos de los objetivos de cinco horas/meses: no se presentan como tiempos humanos ni se ajustan enemigos para forzar la meta.

[Informe](https://github.com/marianoczer-afk/Argentum-Souls/blob/experiment/a3-2-measurement-rhythm/docs/A32_REPORT.md) · [Métodos/comandos/semillas/limitaciones](https://github.com/marianoczer-afk/Argentum-Souls/blob/experiment/a3-2-measurement-rhythm/docs/A32_METHODS.md) · [Registro](https://github.com/marianoczer-afk/Argentum-Souls/blob/experiment/a3-2-measurement-rhythm/docs/WORKLOG.md). Raw JSON/CSV, resúmenes y manifiesto SHA256 se generan en `artifacts/a32/`, ignorado. No se versionan galerías ni binarios.

## Alcance y límites

No modifica Q, enemigos, coeficientes, precios ni la clave/normalización de guardado. No integra Idle ni pesca. No elimina ilustraciones. Conservación completa mediante fixture veterano explícitamente sintético y pruebas de dos pestañas, cuota, propiedad localStorage bloqueada, memoria y recargas.

El controlador requiere calibración humana PC/móvil. La utilidad cubre nueve snapshots representativos, no todos los estados del recorrido. No se ejecutaron mil semillas finales ni se eligió un candidato definitivo. La prueba móvil es Chromium emulado, no un teléfono físico. No hay merge, despliegue Pages ni aprobación de balance.

## Validación ejecutada localmente

99 unitarias, 78 comprobaciones Chromium, 7 regresores del comando de guardados y mutación de pose rechazada en motor/navegador. Baseline: 60 escenarios ×120 s, 6000 combates +150 sondas, ruta1–100 y630 tablas de progresión. Matrices A.3.2: 3000 sesiones físicas, 13500 recorridos, 1890 filas exactas, 6000 casos paso/fps, 3000 sensibilidades y1000 ensayos físicos de exploits. Utilidad: 675 comparaciones con100 semillas conjuntas y72000 combates incluidas bases. Consolidador con semillas únicas, controles protegidos iguales, censura y saldo verificados; resumen/manifest generados. No se afirma CI remota ni calibración humana aprobadas.
