# Balance de cien arenas — A.3.1

Simulación reproducible: 100 arenas × 5 perfiles × 12 semillas (6000 combates de cuatro rivales). Mismo motor que el navegador, paso de 1/30 s, límite del simulador 180 s; el juego no decide un ganador de antemano. Habilidades automáticas de la política: especial disponible, cura al bajar de 65% de HP y guardia ante carga o vida inferior a 50%. No son sesiones humanas. Cada semilla resuelve todos los impactos y transiciones.

|Perfil|1|10|25|50|75|90|100|Tiempo medio arena 100|
|---|---:|---:|---:|---:|---:|---:|---:|---:|
|Equilibrado|100%|100%|100%|100%|100%|100%|100%|49.4 s|
|Fuerza y crítico|100%|100%|100%|100%|100%|100%|100%|42.6 s|
|Defensa y esquiva|100%|100%|100%|100%|100%|100%|100%|56.0 s|
|Equipo fuerte|100%|100%|100%|100%|100%|100%|100%|53.1 s|
|Intermedio|100%|100%|100%|100%|92%|0%|0%|72.6 s|

## Regiones y jefes

|Región|Arena final|Jefe|Victoria equilibrada|Tiempo|
|---|---:|---|---:|---:|
|Patio de entrenamiento|10|El instructor de bronce|100%|13.1 s|
|Bosque salvaje|20|La reina de las raíces|100%|14.5 s|
|Cavernas|30|El corazón de cristal|100%|17.5 s|
|Pantanos|40|La madre de la ciénaga|100%|22.1 s|
|Desierto|50|El faraón del mediodía|100%|24.3 s|
|Montañas heladas|60|La corona del invierno|100%|30.4 s|
|Ruinas antiguas|70|El oráculo sin tiempo|100%|33.9 s|
|Fortaleza oscura|80|El general del eclipse|100%|36.6 s|
|Abismo|90|El ojo del abismo|100%|45.2 s|
|Coliseo legendario|100|El soberano de las cien almas|100%|49.4 s|

## Duración de los cuatro rivales en arena 100

Segundos de combate por rival derrotado (excluye transición; derrotas parciales solo aportan encuentros ya terminados).

|Perfil|Inicial|Intermedio|Élite|Jefe|
|---|---:|---:|---:|---:|
|Equilibrado|5.6|7.9|15.8|16.6|
|Fuerza y crítico|4.5|7.0|13.2|14.5|
|Defensa y esquiva|6.7|9.5|18.0|18.4|
|Equipo fuerte|6.0|8.7|17.9|17.1|
|Intermedio|11.3|17.0|31.4|—|

Las primeras victorias entregan 79820 monedas y diez mejoras de equipo. Se conserva la economía de premios y costes de equipo/estaciones de A.3; la sala compite por esas monedas. Las antiguas horas a 15 XP/s quedan sustituidas por el [balance nuevo de combos, sala y estaciones](BALANCE_A31_XP.md). No se afirma mantener la duración de 255 h con recompensas por combo crecientes.

## Concentrar todo en un atributo

Cada sonda usa un solo atributo a 120, los demás a cero, equipo 8 y 30 semillas en arena 100. Su presupuesto de XP se aproxima al de los cinco atributos a 75.

|Atributo único|Probabilidad de victoria|Tiempo medio|
|---|---:|---:|
|str|0%|48.5 s|
|def|77%|122.8 s|
|acc|0%|58.0 s|
|dodge|0%|88.5 s|
|crit|0%|57.7 s|

La referencia de seis meses laborables a dos horas diarias equivale a unas 260 horas. Ese objetivo histórico debe recalibrarse con la nueva XP de A.3.1; los perfiles extremos y la tasa efectiva producen diferencias amplias. La vía de equipo reduce necesidades de entrenamiento, pero necesita más monedas y pierde eficiencia después de calidad 8; debe vigilarse con partidas reales, no declararse perfectamente equilibrada. Las probabilidades son muestras de 12 semillas, no porcentajes exactos de toda la población. No se exige nivel 100 en ninguna combinación ni se usa un nivel global. Todas las fórmulas se centralizan en combat/balance.js, progression/equipment.js y state.js.
