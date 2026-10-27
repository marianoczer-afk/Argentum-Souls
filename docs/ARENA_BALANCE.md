# Primer balance de cien arenas

Simulación reproducible: 100 arenas × 5 perfiles × 12 semillas (6000 combates de cuatro rivales). Mismo motor que el navegador, paso de 1/30 s, límite del simulador 180 s; el juego no decide un ganador de antemano. Habilidades automáticas de la política: especial disponible, cura al bajar de 65% de HP y guardia ante carga o vida inferior a 50%. No son sesiones humanas. Cada semilla resuelve todos los impactos y transiciones.

|Perfil|1|10|25|50|75|90|100|Tiempo medio arena 100|
|---|---:|---:|---:|---:|---:|---:|---:|---:|
|Equilibrado|100%|100%|100%|100%|100%|100%|100%|31.7 s|
|Fuerza y crítico|100%|100%|100%|100%|100%|100%|92%|29.5 s|
|Defensa y esquiva|100%|100%|100%|100%|100%|100%|100%|37.1 s|
|Equipo fuerte|100%|100%|100%|100%|100%|100%|100%|34.7 s|
|Intermedio|100%|100%|100%|100%|58%|0%|0%|40.0 s|

## Regiones y jefes

|Región|Arena final|Jefe|Victoria equilibrada|Tiempo|
|---|---:|---|---:|---:|
|Patio de entrenamiento|10|El instructor de bronce|100%|9.0 s|
|Bosque salvaje|20|La reina de las raíces|100%|9.7 s|
|Cavernas|30|El corazón de cristal|100%|11.0 s|
|Pantanos|40|La madre de la ciénaga|100%|15.8 s|
|Desierto|50|El faraón del mediodía|100%|16.6 s|
|Montañas heladas|60|La corona del invierno|100%|20.0 s|
|Ruinas antiguas|70|El oráculo sin tiempo|100%|22.4 s|
|Fortaleza oscura|80|El general del eclipse|100%|21.9 s|
|Abismo|90|El ojo del abismo|100%|32.4 s|
|Coliseo legendario|100|El soberano de las cien almas|100%|31.7 s|

## Curva y tiempo orientativo

XP necesaria para el próximo nivel L: `round(20 + 4L + 6L^2.3)`. Sin límite de nivel y sin convertir niveles ni XP anteriores a una escala menor. Los cinco atributos son independientes. Estas estimaciones son XP total dividida por una tasa efectiva de entrenamiento (8/15/26 XP por segundo), incluyendo el efecto agregado de habilidad, estaciones y misiones. No incluyen descansos, tiempo de menú ni batallas. No obligan a esperar una fecha real ni ajustan victorias por tiempo jugado.

|Perfil de final|F/D/P/E/C|Equipo|XP total|Monedas de equipo desde cero|Horas a 8 / 15 / 26 XP/s|
|---|---|---:|---:|---:|---|
|Equilibrado|75/75/75/75/75|8|13762295|19687|478 / 255 / 147|
|Fuerza y crítico|100/35/65/40/90|8|14451022|19687|502 / 268 / 154|
|Defensa y esquiva|55/100/65/100/45|8|17483324|19687|607 / 324 / 187|
|Equipo fuerte|50/50/50/50/50|14|3583760|81174|124 / 66 / 38|

Las primeras victorias de las cien arenas entregan 79820 monedas, más una mejora de equipo por jefe de región (10 en total). Repetir una arena es práctica sin repetir recompensa. No existe impuesto por derrota ni por reintentar. Monedas de misiones son adicionales y requieren objetivos persistentes; cambiar de modo o recargar no reinicia los premios. Precios de equipo: base × (nivel+1)^1.65. Su potencia es lineal hasta 8 y después 8+0.8√(nivel−8), para moderar el dominio del equipo sin invalidar niveles guardados. Estaciones mantienen 45×(nivel+1)^2 y compiten por las mismas monedas.

## Referencia de niveles independientes

|Nivel de cada atributo|XP para un atributo|Horas un atributo a 15 XP/s|Horas de cinco atributos a 15 XP/s|
|---:|---:|---:|---:|
|10|3434|0.1|0.3|
|25|71471|1.3|6.6|
|50|716752|13.3|66.4|
|75|2752459|51.0|254.9|
|100|7141136|132.2|661.2|

## Concentrar todo en un atributo

Cada sonda usa un solo atributo a 120, los demás a cero, equipo 8 y 30 semillas en arena 100. Su presupuesto de XP se aproxima al de los cinco atributos a 75.

|Atributo único|Probabilidad de victoria|Tiempo medio|
|---|---:|---:|
|str|0%|27.5 s|
|def|67%|81.3 s|
|acc|0%|24.5 s|
|dodge|0%|48.3 s|
|crit|0%|27.0 s|

La referencia de seis meses laborables a dos horas diarias equivale a unas 260 horas. El perfil equilibrado practicado se aproxima a ese orden; los perfiles extremos y la tasa efectiva producen diferencias amplias. La vía de equipo reduce necesidades de entrenamiento, pero necesita más monedas y pierde eficiencia después de calidad 8; debe vigilarse con partidas reales, no declararse perfectamente equilibrada. Las probabilidades son muestras de 12 semillas, no porcentajes exactos de toda la población. No se exige nivel 100 en ninguna combinación ni se usa un nivel global. Todas las fórmulas se centralizan en combat/balance.js, progression/equipment.js y state.js.
