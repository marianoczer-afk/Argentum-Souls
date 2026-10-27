# Balance de XP, sala y estaciones — A.3.1

630 escenarios de recompensas: 7 niveles ×5 combos ×3 salas ×3 estaciones ×2 calidades. Se ejecuta Training.good y awardTraining, con misiones y niveles reales; no se presenta como habilidad humana ni como duración de una sesión. El nivel inicial del combo se fija en su primer acierto para evitar crecimiento recursivo al subir nivel.

## Fórmula definitiva

Primeros tres valores base: 2, 4 y 12 XP exactos. Para n≥4, R=n(n−1)+4, F=n+8, B=max(24,0.18×XP requerida al iniciar la cadena); base=F+(R−F)/(1+(R−F)/B). Es una curva continua por acierto con cola lineal y rendimientos decrecientes, sin tramos de multiplicador ni techo plano.

XP activa = redondear(base×(1+0.1×(sala−1))) + estación + (Perfecto?1:0). La sala tiene niveles 1–10 y coste de próxima mejora redondear(180×nivel^2.15). Estaciones conservan exactamente su +nivel XP y coste anterior; no se multiplican. Misiones se agregan por separado en el mismo guardado atómico; el aviso las identifica por separado. Se conserva la curva de nivel de A.3 y todos los niveles/XP anteriores.

## Hipótesis cuadrática sin suavizar

|Combo|Total base propuesto|
|---:|---:|
|10|368|
|25|5298|
|50|41848|
|75|140898|
|100|333698|

## Combo 50 según nivel inicial

Sin Perfectos ni estación; las misiones se muestran aparte. Los niveles ganados incluyen misiones.

|Nivel|XP requerida|Sala 1 XP activa|Sala 10 XP activa|Misiones XP|Niveles sala 10|
|---:|---:|---:|---:|---:|---:|
|1|30|2667|5063|12|10|
|10|1257|8469|16093|12|6|
|25|9969|24753|47034|12|4|
|50|48725|36221|68825|12|1|
|64|85855|38414|72986|12|0|
|75|123571|39387|74836|12|0|
|100|239284|40531|77008|12|0|

## Cadena creciente en nivel 64

|Combo|Sala 1|Sala 5|Sala 10|Sala 10 + estación 10 + Perfectos|
|---:|---:|---:|---:|---:|
|10|368|515|699|809|
|25|5192|7266|9863|10138|
|50|38414|53780|72986|73536|
|75|117241|164136|222756|223581|
|100|246419|344986|468193|469293|

Mejorar toda la sala cuesta 68461 monedas; compite con equipo y estaciones. El peor salto de 50 aciertos en los niveles intermedios muestreados, sala 10 y estación ≤10 es 7 niveles (inicio 10). La estación 100 se incluye en el JSON como estrés de compatibilidad; conserva compras antiguas, pero no se recomienda como objetivo temprano.

## Riesgos de farmeo y alcance

Una lectura roja concede 1 XP fijo, sin sala, estación, Perfecto, hitos ni avance de combo. Sigue contando como lectura para su misión. Hay como máximo tres amagues seguidos antes de un aviso activo; ignorar tres avisos activos entra en recuperación. Una cadena alta exige acciones activas. Reiniciar, cambiar disciplina o recargar pierde la cadena y su nivel de referencia, no multiplica premios; pausarla no vuelve a resolver objetos. Los récords antiguos se conservan, pero ya no conceden montos de XP al cruzar hitos. Las misiones siguen protegidas por el escritor exclusivo.

Esta solicitud cambia sustancialmente el ritmo de A.3: las estimaciones históricas a 15 XP/s y ~255 h ya no describen a quien sostiene combos altos. Una cadena de 50 en sala avanzada se acerca a un nivel 64, mientras en 100 representa solo una fracción del nivel; 100 aciertos pueden otorgar varios niveles y requieren calibración humana. No se promete conservar seis meses de duración con esta recompensa. Los nuevos niveles son más rápidos que A.3, deliberadamente; no se añade espera temporal ni se rebaja progreso antiguo. El resultado depende de errores reales, velocidad por minijuego, monedas y sala: el JSON permite revisar todos los extremos antes de ajustar.
