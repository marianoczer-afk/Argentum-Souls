# Balance medido — Entrega A.1

Cada fila simula 120 segundos, con semilla 1042 y combo/intensidad fijados como fixture. El solucionador usa entradas del motor; todos los objetos y ventanas se ejecutan. No representa la velocidad de una persona ni calibra la curva definitiva de XP. 35 escenarios, sin fallos del solucionador.

|Combo|Intensidad|Fuerza px/s / intervalo / ráfaga|Defensa viaje / intervalo / ráfaga|Precisión radio / vida / movimiento / intervalo / pareja|Esquiva anticipación / Bien / Perfecto|Crítico salto / aire / amague|
|---:|---:|---|---|---|---|---|
|0|0.000|315.000 ±15 / 0.720 s / 0.0%|1.900 s / 0.840 s / 0.0%|34–37 px / 1.950–2.070 s / 0.000 px/s / 1.020 s / 0.0%|1.280 s / 0.256–1.360 s / 0.794–1.024 s|0.820 s / 0.480 s / 22.0%|
|10|0.125|333.681 ±15 / 0.680 s / 5.2%|1.838 s / 0.798 s / 4.7%|34–37 px / 1.900–2.020 s / 1.826 px/s / 0.985 s / 6.2%|1.263 s / 0.253–1.343 s / 0.783–1.010 s|0.810 s / 0.473 s / 25.7%|
|25|0.271|355.645 ±15 / 0.633 s / 11.4%|1.765 s / 0.748 s / 10.3%|34–37 px / 1.842–1.962 s / 13.563 px/s / 0.944 s / 13.5%|1.242 s / 0.248–1.322 s / 0.770–0.994 s|0.798 s / 0.464 s / 30.1%|
|50|0.453|382.888 ±15 / 0.575 s / 19.0%|1.674 s / 0.686 s / 17.2%|34–37 px / 1.769–1.889 s / 28.122 px/s / 0.893 s / 22.6%|1.217 s / 0.243–1.297 s / 0.754–0.973 s|0.784 s / 0.453 s / 35.6%|
|100|0.699|419.877 ±15 / 0.496 s / 29.4%|1.550 s / 0.602 s / 26.6%|34–37 px / 1.670–1.790 s / 47.887 px/s / 0.824 s / 35.0%|1.182 s / 0.236–1.262 s / 0.733–0.946 s|0.764 s / 0.438 s / 43.0%|
|150|0.870|445.443 ±15 / 0.442 s / 36.5%|1.465 s / 0.544 s / 33.0%|34–37 px / 1.602–1.722 s / 61.549 px/s / 0.777 s / 43.5%|1.158 s / 0.232–1.238 s / 0.718–0.927 s|0.750 s / 0.428 s / 48.1%|
|200|1.000|465.000 ±15 / 0.400 s / 42.0%|1.400 s / 0.500 s / 38.0%|34–37 px / 1.550–1.670 s / 72.000 px/s / 0.740 s / 50.0%|1.140 s / 0.228–1.220 s / 0.707–0.912 s|0.740 s / 0.420 s / 52.0%|

Intervalos normales: variación ±10%. Ráfagas: segundo objeto después de 0,17–0,21 s en Fuerza, 0,28–0,34 s en Defensa y 0,30–0,36 s en Precisión. Defensa conserva al menos 0,26 s entre impactos, con viaje mínimo 1,4 s. La velocidad depende del borde de entrada: se mide en el JSON, no es uniforme por dirección. Fuerza reordena llegadas si harían falta cortes en alturas distintas con menos de 0,17 s de separación; las velocidades pueden bajar para conservar esa distancia.

Precisión: diámetro físico mínimo previsto 50 px con ajuste por escala (radio máximo 110 px del mundo); Perfecto dentro de 16% del radio. Movimiento vertical hasta la mitad del horizontal. Separación mínima entre círculos: 30 px durante el movimiento; no se superponen. Esquiva: línea visible desde el nacimiento; antes del 20% es Fallo, del 20% al 62% es Bien, del 62% al 80% Perfecto y después Bien hasta +80 ms. Resultado al golpe; ejecución recta de 140 ms. Crítico: ventana Perfecta aérea 75–200 ms; máximo tres amagues consecutivos; las ventanas se fijan al mostrar cada señal.

Dificultad = min(1, log(1+combo/40)/log(6)), subida máxima 0,25/s y recuperación 0,55/s. A cero vuelve accesible en un máximo de 1,82 s. El tiempo de sesión no altera el objetivo.

## Tasas medidas en la simulación

|Combo|Modo|Objetos/s (o aciertos/s en Esquiva/Crítico)|Ráfagas|Velocidad máxima px/s|Menor separación de impactos Defensa|
|---:|---|---:|---:|---:|---:|
|0|str|1.517|0|331.41|—|
|0|def|1.192|0|288.47|0.75|
|0|acc|0.983|0|0|—|
|0|dodge|0.500|0|0|—|
|0|crit|0.842|0|0|—|
|10|str|1.667|6|349.16|—|
|10|def|1.317|7|300.3|0.325|
|10|acc|1.050|4|2.04|—|
|10|dodge|0.508|0|0|—|
|10|crit|0.850|0|0|—|
|25|str|1.908|24|372|—|
|25|def|1.442|13|312.88|0.3167|
|25|acc|1.250|21|15.16|—|
|25|dodge|0.517|0|0|—|
|25|crit|0.867|0|0|—|
|50|str|2.208|40|400.4|—|
|50|def|1.775|39|329.86|0.3083|
|50|acc|1.475|42|31.32|—|
|50|dodge|0.525|0|0|—|
|50|crit|0.883|0|0|—|
|100|str|2.775|75|436.79|—|
|100|def|2.092|51|353.79|0.26|
|100|acc|1.633|50|53.49|—|
|100|dodge|0.542|0|0|—|
|100|crit|0.900|0|0|—|
|150|str|3.200|96|462.64|—|
|150|def|2.517|83|376.92|0.26|
|150|acc|1.842|67|68.79|—|
|150|dodge|0.550|0|0|—|
|150|crit|0.917|0|0|—|
|200|str|3.625|119|482.33|—|
|200|def|2.792|97|393.59|0.26|
|200|acc|2.025|81|80.48|—|
|200|dodge|0.558|0|0|—|
|200|crit|0.942|0|0|—|
