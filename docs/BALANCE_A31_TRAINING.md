# Balance y presupuestos de respuesta — A.3.1

Combos 0/25/50/75/100/150, cinco modos y dos perfiles de entrada, 120 segundos por escenario (60 simulaciones, semilla 1042). Intensidad fijada como fixture; la física, las ventanas y los controles del motor son reales. Los perfiles completaron las secuencias sin fallos. La simulación usa un mundo 1200×720; el navegador puede ampliarlo horizontalmente sin deformar los actores. Esto verifica límites y compatibilidad entre controles/animaciones, no demuestra dificultad humana.

|Combo|Intensidad|Fuerza horizontal / intervalo base / prob. ráfaga|Defensa viaje base / intervalo / prob. ráfaga|Precisión radio cercano / intervalo / vida / movimiento|Esquiva anticipación base / Perfecto|Crítico salto / aire / amague|
|---:|---:|---|---|---|---|---|
|0|0.000|260.000 ±10 px/s / 0.940 s / 12%|2.050 s / 0.950 s / 8%|73.4–76.4 px / 1.050 s / 2.050–2.170 s / 0.000 px/s|1.040 s ±5% / -290 a −80 ms de referencia; contacto +120 ms|0.740 s ±6% / 0.460 s ±4% / 25%|
|25|0.324|366.828 ±10 px/s / 0.778 s / 28%|1.723 s / 0.791 s / 24%|73.4–76.4 px / 0.940 s / 1.888–2.008 s / 17.808 px/s|0.959 s ±5% / -274 a −80 ms de referencia; contacto +120 ms|0.688 s ±6% / 0.434 s ±4% / 34%|
|50|0.533|435.861 ±10 px/s / 0.674 s / 38%|1.512 s / 0.689 s / 34%|73.4–76.4 px / 0.869 s / 1.784–1.904 s / 36.427 px/s|0.907 s ±5% / -263 a −80 ms de referencia; contacto +120 ms|0.655 s ±6% / 0.417 s ±4% / 40%|
|75|0.688|486.962 ±10 px/s / 0.596 s / 45%|1.355 s / 0.613 s / 41%|73.4–76.4 px / 0.816 s / 1.706–1.826 s / 50.210 px/s|0.868 s ±5% / -256 a −80 ms de referencia; contacto +120 ms|0.630 s ±6% / 0.405 s ±4% / 44%|
|100|0.811|527.552 ±10 px/s / 0.535 s / 51%|1.231 s / 0.553 s / 47%|73.4–76.4 px / 0.774 s / 1.645–1.765 s / 61.157 px/s|0.837 s ±5% / -249 a −80 ms de referencia; contacto +120 ms|0.610 s ±6% / 0.395 s ±4% / 48%|
|150|1.000|590.000 ±10 px/s / 0.440 s / 60%|1.040 s / 0.460 s / 56%|73.4–76.4 px / 0.710 s / 1.550–1.670 s / 78.000 px/s|0.790 s ±5% / -240 a −80 ms de referencia; contacto +120 ms|0.580 s ±6% / 0.380 s ±4% / 53%|

Las frases alternan factores 0,82/1/1,16 durante 3–6 lanzamientos, con variación de intervalo ±8%. Fuerza también varía su velocidad por frase, limitada a 240–600 px/s horizontales. La curva alta modifica la velocidad total instantánea; la tabla siguiente la mide a partir de posiciones, no solo de vx. Los tres tipos nacen en la mano del muñeco, no en el borde superior. Defensa varía el tiempo de viaje levemente por frase y nunca baja de 1,02 s. Las ráfagas de Fuerza y Defensa pueden tener tres objetos; se reserva su espacio antes de comenzar una nueva frase.

|Combo|Modo|Proyectil: velocidad total medida mín–máx px/s|Objetos/s o aciertos/s|Objetos de ráfaga|Menor intervalo de impactos|Menor aviso visible hasta contacto|
|---:|---|---:|---:|---:|---:|---:|
|0|str|240–393.3|1.200|17|0.19 s|2.27 s|
|0|def|119.3–310.6|1.100|9|0.33 s|1.616 s|
|0|acc|—–—|1.033|10|— s|— s|
|0|dodge|—–—|0.542|0|— s|— s|
|0|crit|—–—|0.808|0|— s|— s|
|25|str|336.3–551.6|1.683|49|0.19 s|1.626 s|
|25|def|136.7–359.6|1.617|41|0.314 s|1.362 s|
|25|acc|—–—|1.358|32|— s|— s|
|25|dodge|—–—|0.575|0|— s|— s|
|25|crit|—–—|0.867|0|— s|— s|
|50|str|401.5–652.8|2.142|77|0.19 s|1.374 s|
|50|def|161.9–417.5|2.025|69|0.303 s|1.194 s|
|50|acc|—–—|1.625|53|— s|— s|
|50|dodge|—–—|0.600|0|— s|— s|
|50|crit|—–—|0.883|0|— s|— s|
|75|str|449.7–727.7|2.642|118|0.19 s|1.233 s|
|75|def|167.7–470.4|2.358|87|0.296 s|1.069 s|
|75|acc|—–—|1.767|66|— s|— s|
|75|dodge|—–—|0.617|0|— s|— s|
|75|crit|—–—|0.892|0|— s|— s|
|100|str|488.1–786.2|3.067|148|0.19 s|1.14 s|
|100|def|162.4–510.8|2.642|111|0.289 s|0.976 s|
|100|acc|—–—|1.908|72|— s|— s|
|100|dodge|—–—|0.633|0|— s|— s|
|100|crit|—–—|0.925|0|— s|— s|
|150|str|540.8–827.9|3.625|179|0.19 s|1.083 s|
|150|def|43.5–512.3|3.358|167|0.28 s|0.892 s|
|150|acc|—–—|2.117|82|— s|— s|
|150|dodge|—–—|0.667|0|— s|— s|
|150|crit|—–—|0.983|0|— s|— s|

## Presupuestos de respuesta

- Fuerza: una sola espada activa. El primer movimiento responde al pulsar; un cambio durante los primeros 45 ms guarda únicamente la última dirección. Se aplica al siguiente paso físico de 8,33 ms, conducido por requestAnimationFrame (unos 16,7 ms por frame a 60 Hz), sin esperar a la animación de 160 ms. Las llegadas se separan al menos 190 ms: quedan más de 130 ms por encima del compromiso y del paso físico. El perfil restringido limita nuevas acciones a una por 110 ms y apunta con margen de 18 px; es una prueba de capacidad, no una medición de reflejos. La ventana de acierto de 230 px dura aproximadamente 0,38–0,96 s; Perfecto (70 px) dura 0,12–0,29 s según velocidad horizontal. Los ataques pueden cortar más de una fruta en la misma altura.
- Defensa: orientación directa, sin vuelta obligatoria. Separación de impactos `max(330−50*d ms, 180 ms + ángulo/π * 200 ms)`; para un giro de 180° hay al menos 380 ms. El perfil restringido espera 160 ms después de cada bloqueo y gira a un máximo de 1000°/s, sin teletransportar la orientación; completa ambos sentidos. Es una hipótesis de jugador entrenado que necesita validación personal. El escudo es un sector anular de radio 76, profundidad 21,4 y apertura 0,88 radianes, compartido por dibujo y colisión. Las frutas pasan a ser imbloqueables al atravesar el radio de 76 px y rompen combo al tocar el cuerpo.
- Precisión: 50% cercanos, 35% medianos y 15% lejanos; radio base multiplicado por 1,36/1,08/0,82. Ajuste por escala táctil. Perfecto sigue dentro del 16% del radio. Perfil restringido: mínimo 180 ms entre toques, tiempo inicial de lectura 180 ms y desviación lateral del 18% del radio (Bien). No se exige perfección de píxel para mantener combo.
- Esquiva: solo cabezazo/agacharse, brazo/retroceder y patada/saltar. Preparación visible desde el comienzo; círculo blanco y `Perfecto` comparten la misma función: dura 210–160 ms según combo y termina 200 ms antes del contacto físico. El muñeco mantiene la preparación durante el blanco, extiende después y alcanza al héroe al confirmar la puntuación. Bien desde el 20% de anticipación hasta 35 ms antes del contacto. La acción del jugador responde de inmediato. El perfil restringido actúa 25 ms antes de cerrar el blanco; no necesita pulsar con el golpe ya conectado.
- Crítico: señal roja y dorada comparten círculo y exclamación, distinguidas por color y texto. Pausas normales de 0,13–0,49 s según frase; nunca aceleran indefinidamente. Perfecto aéreo 80–180 ms; el resto de la fase aérea da Bien sin romper combo. Perfil restringido reacciona en 180 ms a ambos avisos; ignorar el rojo da 1 XP fijo una sola vez, sin avanzar combo ni multiplicadores, y no reinicia fallos activos consecutivos.

El perfil instantáneo sirve de control. El restringido comprueba que las secuencias toleran una latencia y cadencia limitadas; ninguno reemplaza a una persona. Las pruebas de Chromium agregan controles nativos, posiciones y píxeles dibujados, tres movimientos corporales distintos, pantalla completa y revisión visual de capturas actuales. No se afirma haber realizado una sesión humana ni una prueba en teléfono físico.
