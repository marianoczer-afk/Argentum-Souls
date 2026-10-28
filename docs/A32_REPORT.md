# A.3.2 — informe experimental, sin selección de balance definitivo

Base fija `911300e8dcbde72258c2babd1cd90d9b65d4789e`. No se modifican Q, enemigos, daño, vida, probabilidades, precios, salas/estaciones ni partidas anteriores. Fuerza, Defensa y Precisión conservan exactamente su control mecánico y secuencias; las tablas comparan premios futuros elegidos explícitamente. No se fusiona ni publica.

## Qué se ejecutó

- 3000 sesiones físicas de una hora (5 disciplinas ×3 perfiles ×2 ritmos ×100 semillas), puntos a 10/30/60 minutos y 54000 filas de recompensas/finanzas derivadas. X0/X1a4/X2c50 comparten entradas físicas, no se presentan como jugadores independientes. Economía ninguna/mixta, estado inicial real vacío.
- 1890 filas exactas de XP para siete candidatos, niveles 0/15/50/75/150, combos 10/25/50/75/100/150, salas 1/5/10 y estaciones 0/10/100. Sin Perfectos o misiones en esa tabla algebraica.
- 13500 recorridos desde cero, 100 semillas por celda: intermedio/horizonte máximo 50 h en tres builds y cuatro compras; principiante/experto con compra mixta y máximo 8 h; ablación sin compras y políticas adaptativa/greedy separadas. Se detienen al completar 100.
- 6000 validaciones de dos pasos físicos y tres frecuencias de entrada (60 s), 3000 sensibilidades ±25% de reacción (10 min), 1000 pruebas físicas de explotación de rachas/amagues (10 min, tres XP derivadas).
- 675 comparaciones de utilidad: 9 snapshots representativos, 5 disciplinas, 10/30/60 min y 5 arenas. Cien semillas conjuntas de entrenamiento/combate por celda; 4500 horas de entrenamiento simulado y 72000 combates, incluyendo las bases emparejadas. Wilson 95% describe ese modelo, no personas.

Semillas exteriores 1001–1100. Toda cifra siguiente es de un controlador sintético sin calibrar con personas. Los p10/p90 son entre semillas; no son percentiles humanos medidos. [Métodos y límites](A32_METHODS.md). Datos completos JSON/CSV en `artifacts/a32/`, ignorados por Git; comandos y hashes en el manifiesto generado.

## Ritmo completo, no solo intervalos

Intermedio, una hora, X0 sin compras. Tasas medianas de eventos visibles/recompensas activas por minuto. Las lecturas rojas se cuentan aparte y dos teclas de Crítico no son dos aciertos. Fuerza incluye las recogidas opcionales de estrellas que conceden premio activo; no se cuentan como fallos al expirar.

|Disciplina|Oportunidades control / experimento|Aciertos control / experimento|Cambio de aciertos|Errores control / experimento|
|---|---:|---:|---:|---:|
|Fuerza|100.55 / 100.55|95.75 / 95.75|0.0%|274 / 274|
|Defensa|89.30 / 89.30|85.32 / 85.32|0.0%|230 / 230|
|Precisión|71.57 / 71.57|67.51 / 67.51|0.0%|433 / 433|
|Esquiva|34.17 / 40.52|32.77 / 38.88|18.6%|84 / 100|
|Crítico|31.18 / 35.98|26.95 / 31.07|15.3%|380 / 434|

La igualdad de Fuerza/Defensa/Precisión se verifica fila por fila bajo las mismas semillas, además del pin de parámetros/render y las secuencias del commit base. El candidato solapa el presupuesto neutro con retorno/aterrizaje; no recorta animación, preparación, reacción, blanco, salto ni golpe. La espera inicial de Esquiva es 450 ms solo al iniciar, no un coste por cada intento. La recuperación por tres errores permanece.

|Modo/perfil|Neutral control / experimental, s por hora|Aciertos/min control / experimental|
|---|---:|---:|
|Esquiva / Principiante|612.0 / 45.0|29.09 / 34.61|
|Crítico / Principiante|872.1 / 667.6|13.67 / 14.67|
|Esquiva / Intermedio|598.3 / 41.4|32.77 / 38.88|
|Crítico / Intermedio|812.1 / 386.4|26.95 / 31.07|
|Esquiva / Experto|600.5 / 41.7|32.42 / 38.45|
|Crítico / Experto|823.2 / 326.9|31.35 / 36.99|

Estos segundos son la fase neutra identificada, no todo intervalo sin tecla: preparación, rojo legible, salto, impacto y retorno son útiles. Más intentos/min no demuestran más diversión; esa decisión queda para las partidas personales.

## Sesiones desde cero: 10, 30 y 60 minutos

X0/control, sin compras. XP total mediana [p10–p90], nivel final mediano, monedas brutas, misiones, errores y p90 de racha de cada sesión (mediana entre semillas). El tiempo incluye esperas y recuperación; excluye pausa y pestaña oculta. XP/h equivalente = XP/tiempo presente; una extrapolación descriptiva de diez minutos no predice una hora. CSV de resumen contiene además base/sala/estación/Perfecto/pasivo/misión, XP/h, acciones discretas, actualizaciones continuas de puntero y ambos relojes. Las actualizaciones de Defensa no son gestos humanos independientes.

|Perfil|Modo|min|XP [p10–p90]|Nivel|Monedas|Misiones|Errores|P90 racha|
|---|---|---:|---:|---:|---:|---:|---:|---:|
|Principiante|Fuerza|10|104973 [80055–146974]|28|1201|18|77|25.4|
|Principiante|Fuerza|30|331091 [276345–397491]|39|2100|23|259|23.2|
|Principiante|Fuerza|60|539930 [485553–629949]|45|2559|23|593|20.0|
|Principiante|Defensa|10|66358 [45506–90336]|24|975|16|80|22.6|
|Principiante|Defensa|30|232616 [183821–286671]|35|2011|23|250|21.5|
|Principiante|Defensa|60|430273 [380636–512976]|42|2406|23|546|20.0|
|Principiante|Precisión|10|16529 [13458–21552]|16|357|8|175|11.8|
|Principiante|Precisión|30|48503 [42357–57463]|22|656|10|558|11.0|
|Principiante|Precisión|60|82591 [72908–91954]|26|1109|13|1191|10.0|
|Principiante|Esquiva|10|22722 [16216–30753]|17|375|9|32|22.0|
|Principiante|Esquiva|30|83725 [66596–115295]|26|1114|17|104|21.0|
|Principiante|Esquiva|60|157206 [132397–200952]|31|1385|18|235|18.9|
|Principiante|Crítico|10|1766 [1390–2314]|8|68|1|152|5.0|
|Principiante|Crítico|30|4339 [3682–5184]|10|161|1|500|5.0|
|Principiante|Crítico|60|6403 [5716–7277]|12|271|1|1113|4.0|
|Intermedio|Fuerza|10|480595 [343929–662156]|44|1939|24|36|60.1|
|Intermedio|Fuerza|30|1795368 [1464122–2409668]|66|4891|39|121|56.5|
|Intermedio|Fuerza|60|3094610 [2682002–3796049]|77|6246|43|274|48.8|
|Intermedio|Defensa|10|419945 [285532–625012]|42|1913|24|34|62.1|
|Intermedio|Defensa|30|1920887 [1331441–2652435]|67|4904|40|106|61.1|
|Intermedio|Defensa|60|3837733 [3089740–4949941]|83|7117|48|230|55.0|
|Intermedio|Precisión|10|181313 [131498–233748]|33|886|15|60|39.4|
|Intermedio|Precisión|30|673419 [527355–829841]|49|2565|27|196|36.7|
|Intermedio|Precisión|60|1260294 [1103601–1477149]|59|3940|33|433|33.0|
|Intermedio|Esquiva|10|68681 [46665–102858]|24|230|6|12|55.0|
|Intermedio|Esquiva|30|448455 [317982–682285]|43|863|14|37|58.8|
|Intermedio|Esquiva|60|1095350 [804753–1472523]|56|2131|24|84|54.7|
|Intermedio|Crítico|10|17260 [12415–24702]|16|172|4|43|20.0|
|Intermedio|Crítico|30|59166 [48089–71944]|23|498|8|152|18.0|
|Intermedio|Crítico|60|98668 [81003–118453]|27|772|9|380|15.0|
|Experto|Fuerza|10|2578718 [1548994–3863976]|73|2732|29|16|158.3|
|Experto|Fuerza|30|12333325 [8789105–16329304]|117|7679|52|55|147.7|
|Experto|Fuerza|60|22303575 [18145681–27477211]|141|11605|68|124|127.7|
|Experto|Defensa|10|1948686 [1164727–3196719]|67|2698|29|15|156.5|
|Experto|Defensa|30|14848359 [9038047–23268441]|124|7784|53|47|168.5|
|Experto|Defensa|60|35719659 [24638378–49668087]|162|12634|74|100|161.2|
|Experto|Precisión|10|758257 [576950–1129590]|50|1213|18|25|104.2|
|Experto|Precisión|30|4372176 [3570851–5174030]|86|3831|34|80|102.8|
|Experto|Precisión|60|9268138 [8011929–10682741]|108|7281|49|172|95.6|
|Experto|Esquiva|10|82650 [61808–121614]|26|507|11|9|67.7|
|Experto|Esquiva|30|455450 [339994–616268]|43|1562|21|34|64.6|
|Experto|Esquiva|60|826254 [662606–1046931]|52|2697|28|94|49.4|
|Experto|Crítico|10|76527 [57113–99065]|25|534|11|10|63.8|
|Experto|Crítico|30|453652 [326274–625218]|43|1425|19|36|62.9|
|Experto|Crítico|60|1026801 [768981–1291833]|55|2298|24|85|55.6|

## Comparación de las tres XP principales

Una hora intermedia con ritmo experimental, sin compras. Los otros valores de pendiente/cap se conservan en la matriz exacta, sin elegir ganador.

|Modo|XP X0 [p10–p90]|XP X1/a4 [p10–p90]|XP X2/cap50 [p10–p90]|Nivel X0 / X1 / X2|
|---|---:|---:|---:|---:|
|Fuerza|3094610 [2682002–3796049]|477555 [438690–534173]|2936887 [2578835–3514441]|77 / 44 / 76|
|Defensa|3837733 [3089740–4949941]|507447 [445176–578210]|3483911 [2888397–4286402]|83 / 45 / 80|
|Precisión|1260294 [1103601–1477149]|252791 [233995–276095]|1251639 [1100079–1458247]|59 / 36 / 59|
|Esquiva|1365087 [1028171–1861956]|225409 [186971–272173]|1345954 [1025576–1800311]|60 / 35 / 60|
|Crítico|113995 [96509–139412]|50050 [45481–55890]|113995 [96509–139412]|28 / 22 / 28|

|Modo|X0 XP sin compras / mixta|Sala / estación finales con mixta|Monedas netas mixtas / brutas|
|---|---:|---:|---:|
|Fuerza|3094610 / 3425923|2 / 3|358 / 6246|
|Defensa|3837733 / 4273811|2 / 3|232 / 7117|
|Precisión|1260294 / 1379954|2 / 2|303 / 3940|
|Esquiva|1365087 / 1458311|2 / 2|220 / 2479|
|Crítico|113995 / 115472|1 / 1|108 / 904|

### Sumas matemáticas sin mejoras

Cada casilla es acumulado entero / último golpe entero. X0 y X2 se evalúan con Q del nivel inicial fijado por racha, no se congela el nivel entre rachas de una sesión. X1 incluye los primeros 18 XP: S(n)=2n(n+1)−6 para a4. Base no redondeada y combinaciones de salas/estaciones se entregan en `xp.json`/`xp.csv`.

|Nivel inicial|Combo|X0|X1/a4|X2/cap50|
|---:|---:|---:|---:|---:|
|0|10|210 / 36|214 / 40|210 / 36|
|0|25|926 / 56|1294 / 100|926 / 56|
|0|50|2667 / 82|5094 / 200|2667 / 82|
|0|75|5042 / 107|11394 / 300|5042 / 107|
|0|100|8042 / 132|20194 / 400|8042 / 132|
|0|150|15917 / 182|45294 / 600|15917 / 182|
|15|10|347 / 85|214 / 40|347 / 85|
|15|25|3528 / 316|1294 / 100|3528 / 316|
|15|50|14423 / 513|5094 / 200|14423 / 513|
|15|75|28399 / 593|11394 / 300|28399 / 593|
|15|100|43859 / 639|20194 / 400|43859 / 639|
|15|150|77613 / 706|45294 / 600|77613 / 706|
|50|10|367 / 93|214 / 40|367 / 93|
|50|25|5111 / 569|1294 / 100|5111 / 569|
|50|50|36221 / 1940|5094 / 200|36221 / 1940|
|50|75|104618 / 3452|11394 / 300|104618 / 3452|
|50|100|208234 / 4735|20194 / 400|208234 / 4735|
|50|150|492824 / 6444|45294 / 600|492824 / 6444|
|75|10|368 / 94|214 / 40|367 / 93|
|75|25|5222 / 590|1294 / 100|5111 / 569|
|75|50|39387 / 2221|5094 / 200|36221 / 1940|
|75|75|123399 / 4474|11394 / 300|104618 / 3452|
|75|100|266904 / 6909|20194 / 400|208234 / 4735|
|75|150|727944 / 11268|45294 / 600|492824 / 6444|
|150|10|368 / 94|214 / 40|367 / 93|
|150|25|5284 / 601|1294 / 100|5111 / 569|
|150|50|41318 / 2403|5094 / 200|36221 / 1940|
|150|75|136862 / 5293|11394 / 300|104618 / 3452|
|150|100|316973 / 9099|20194 / 400|208234 / 4735|
|150|150|1006291 / 18609|45294 / 600|492824 / 6444|

X1 no es un recorte uniforme: puede superar X0 a nivel bajo y ser menor en nivel alto. X2 coincide con X0 por debajo del cap. No se cambió Q ni se aplicaron multiplicadores por disciplina. Perfecto suma 1, estación suma su nivel, sala multiplica solo base, misiones y pasivos van por separado.

## Recorrido de arenas y economía real

Horas activas acumuladas, mediana [p10–p90] **condicional a alcanzar**. Se indica alcanzadas/100 para evitar convertir censura en derrota o predecir con XP/s. Los objetivos no son mediciones: arena10 ≈5 h (explorar 3–8), 20=12–18 h, 50=70–110 h, 100=300–450 h. No son requisitos ni esperas del juego.

Intermedio/control, build equilibrada; comparación de compras.

|XP|Compras|Arena10 h|Arena20 h|Arena50 h|Arena100 h|Alcanzaron100|
|---|---|---:|---:|---:|---:|---:|
|X0|gear-first|0.12 [0.11–0.13]|0.30 [0.29–0.32]|0.88 [0.86–0.89]|1.87 [1.84–1.96]|100/100|
|X0|room-first|0.24 [0.14–0.25]|0.42 [0.39–0.46]|2.06 [1.66–2.64]|10.87 [7.96–14.46]|100/100|
|X0|station-first|0.25 [0.14–0.26]|0.43 [0.41–0.58]|2.62 [1.97–3.53]|15.81 [11.53–21.45]|100/100|
|X0|mixed|0.12 [0.11–0.13]|0.31 [0.30–0.32]|0.89 [0.87–0.91]|1.89 [1.85–2.00]|100/100|
|X0|none|0.24 [0.13–0.26]|0.43 [0.41–0.57]|2.63 [1.96–3.42]|15.98 [11.51–22.35]|100/100|
|X1a4|gear-first|0.12 [0.12–0.13]|0.31 [0.30–0.32]|0.88 [0.87–0.90]|2.13 [1.95–2.51]|100/100|
|X1a4|room-first|0.25 [0.21–0.26]|0.44 [0.41–0.61]|5.43 [4.46–6.87]|38.90 [31.43–46.36]|94/100|
|X1a4|station-first|0.25 [0.22–0.26]|0.46 [0.42–0.62]|7.05 [5.59–8.86]|46.53 [40.76–49.11]|29/100|
|X1a4|mixed|0.12 [0.12–0.13]|0.31 [0.30–0.32]|0.89 [0.87–0.92]|2.30 [2.03–2.68]|100/100|
|X1a4|none|0.25 [0.21–0.26]|0.45 [0.41–0.62]|7.62 [5.81–9.20]|48.21 [43.30–49.46]|11/100|
|X2c50|gear-first|0.12 [0.11–0.13]|0.30 [0.29–0.32]|0.88 [0.86–0.89]|1.87 [1.84–1.96]|100/100|
|X2c50|room-first|0.24 [0.14–0.25]|0.42 [0.39–0.46]|2.06 [1.66–2.64]|11.44 [8.36–15.32]|100/100|
|X2c50|station-first|0.25 [0.14–0.26]|0.43 [0.41–0.58]|2.62 [1.97–3.53]|16.46 [12.24–21.99]|100/100|
|X2c50|mixed|0.12 [0.11–0.13]|0.31 [0.30–0.32]|0.89 [0.87–0.91]|1.89 [1.85–2.00]|100/100|
|X2c50|none|0.24 [0.13–0.26]|0.43 [0.41–0.57]|2.63 [1.96–3.42]|16.58 [12.35–23.41]|100/100|

Perfil/build, compra mixta y ritmo experimental. Cada celda conserva cien semillas; principiante/experto tienen horizonte 8 h, intermedio 50 h.

|Perfil|Build|XP|Arena10 h|Arena100 h|Alcanzaron100 / censuradas|
|---|---|---|---:|---:|---:|
|Principiante|offensive|X0|0.13 [0.12–0.14]|3.00 [2.52–3.38]|100 / 0|
|Principiante|offensive|X1a4|0.13 [0.12–0.14]|4.00 [3.35–4.77]|100 / 0|
|Principiante|offensive|X2c50|0.13 [0.12–0.14]|3.00 [2.52–3.38]|100 / 0|
|Principiante|defensive|X0|0.20 [0.19–0.24]|2.76 [2.41–3.37]|100 / 0|
|Principiante|defensive|X1a4|0.20 [0.19–0.25]|3.64 [2.98–4.19]|100 / 0|
|Principiante|defensive|X2c50|0.20 [0.19–0.24]|2.76 [2.41–3.37]|100 / 0|
|Principiante|balanced|X0|0.13 [0.12–0.14]|2.89 [2.51–3.23]|100 / 0|
|Principiante|balanced|X1a4|0.13 [0.12–0.14]|3.77 [3.22–4.51]|100 / 0|
|Principiante|balanced|X2c50|0.13 [0.12–0.14]|2.89 [2.51–3.23]|100 / 0|
|Intermedio|offensive|X0|0.12 [0.11–0.13]|1.86 [1.83–1.99]|100 / 0|
|Intermedio|offensive|X1a4|0.12 [0.12–0.13]|2.33 [1.99–2.70]|100 / 0|
|Intermedio|offensive|X2c50|0.12 [0.11–0.13]|1.86 [1.83–1.99]|100 / 0|
|Intermedio|defensive|X0|0.20 [0.19–0.20]|1.92 [1.88–2.06]|100 / 0|
|Intermedio|defensive|X1a4|0.20 [0.19–0.20]|2.35 [2.07–2.67]|100 / 0|
|Intermedio|defensive|X2c50|0.20 [0.19–0.20]|1.92 [1.88–2.06]|100 / 0|
|Intermedio|balanced|X0|0.12 [0.11–0.13]|1.88 [1.86–1.99]|100 / 0|
|Intermedio|balanced|X1a4|0.12 [0.12–0.13]|2.31 [1.99–2.68]|100 / 0|
|Intermedio|balanced|X2c50|0.12 [0.11–0.13]|1.88 [1.86–1.99]|100 / 0|
|Experto|offensive|X0|0.11 [0.11–0.12]|1.81 [1.77–1.84]|100 / 0|
|Experto|offensive|X1a4|0.11 [0.10–0.12]|1.87 [1.83–1.99]|100 / 0|
|Experto|offensive|X2c50|0.11 [0.11–0.12]|1.81 [1.78–1.84]|100 / 0|
|Experto|defensive|X0|0.19 [0.16–0.20]|1.86 [1.82–1.89]|100 / 0|
|Experto|defensive|X1a4|0.19 [0.16–0.20]|1.92 [1.87–2.09]|100 / 0|
|Experto|defensive|X2c50|0.19 [0.16–0.20]|1.86 [1.82–1.89]|100 / 0|
|Experto|balanced|X0|0.11 [0.11–0.12]|1.83 [1.81–1.86]|100 / 0|
|Experto|balanced|X1a4|0.11 [0.10–0.12]|1.88 [1.84–1.98]|100 / 0|
|Experto|balanced|X2c50|0.11 [0.11–0.12]|1.83 [1.81–1.86]|100 / 0|

Hallazgo central: con estos supuestos, el intermedio equilibrado/mixto llega a10 en 7.1 min y a100 en 1.89 h. Sin compras (con botín legítimo de jefes) llega a100 en 15.98 h. Esto no respalda los objetivos de horas/meses; tampoco demuestra tiempos humanos. La diferencia entre políticas muestra que XP, equipo y reinversión de primeras victorias deben estudiarse juntos antes de tocar coeficientes.

Los recorridos no empiezan con atributos 75 o equipo8: usan loadState vacío, funciones reales de compra y primera victoria, saldo nunca negativo y desbloqueos secuenciales. Cambiar compras no inventa oro. Las misiones progresan de forma persistente; cada dos minutos se cambia/reinicia disciplina por política explícita. El banco de trazas se explica en métodos; sus repeticiones limitan la validez poblacional. Después de arena100 el recorrido termina: no se inventan snapshots a 5/10/20/50 h si ya terminó antes. Los snapshots y estados de hitos realmente observados están en los JSON.

## Políticas adaptativa y optimizadora, separadas del jugador típico

La adaptativa usa rendimiento visible en combate; la optimizadora es greedy de un paso con tasas recién observadas y derivadas de estadísticas propias, no un solucionador óptimo ni un lector de futuros ataques. Horizonte 8 h, intermedio/mixta.

|Política|XP|Arena10 h|Arena100 h|Alcanzadas / censuradas|
|---|---|---:|---:|---:|
|adaptive|X0|0.12 [0.11–0.13]|2.10 [2.02–2.45]|100 / 0|
|adaptive|X1a4|0.12 [0.12–0.13]|2.64 [2.26–3.26]|100 / 0|
|adaptive|X2c50|0.12 [0.11–0.13]|2.10 [2.02–2.45]|100 / 0|
|optimizer|X0|0.12 [0.11–0.13]|1.89 [1.85–1.95]|100 / 0|
|optimizer|X1a4|0.12 [0.12–0.13]|2.18 [1.94–2.56]|100 / 0|
|optimizer|X2c50|0.12 [0.11–0.13]|1.89 [1.85–1.95]|100 / 0|

Sensibilidad a cambiar/reiniciar disciplina cada diez minutos en lugar de dos, intermedio equilibrado/mixto, horizonte8h. No se oculta el coste de ese bloque inicial mayor.

|XP|Bloque|Arena10 h|Arena100 h|Alcanzadas / censuradas|
|---|---:|---:|---:|---:|
|X0|120s|0.12 [0.11–0.13]|1.88 [1.86–1.99]|100 / 0|
|X0|600s|0.23 [0.23–0.24]|2.69 [2.66–2.71]|100 / 0|
|X1a4|120s|0.12 [0.12–0.13]|2.31 [1.99–2.68]|100 / 0|
|X1a4|600s|0.24 [0.23–0.24]|2.84 [2.81–3.03]|100 / 0|
|X2c50|120s|0.12 [0.11–0.13]|1.88 [1.86–1.99]|100 / 0|
|X2c50|600s|0.23 [0.23–0.24]|2.69 [2.66–2.71]|100 / 0|

## Explotación de reinicios y amagues

Intermedio, diez minutos, sin compras. XP/h equivalente mediana [p10–p90]; no se regalan perfectos ni se simula un porcentaje de éxito independiente de controles. Reiniciar conserva misiones y récords, pero limpia objetos y racha.

|Modo|Estrategia|X0|X1/a4|X2/cap50|
|---|---|---:|---:|---:|
|Fuerza|continuous|2883570 [2063576–3972935]|628989 [491531–789743]|2883570 [2063576–3972935]|
|Fuerza|fragment10|124947 [121633–127874]|82866 [81124–84544]|124947 [121633–127874]|
|Fuerza|fragment25|626220 [588560–662016]|225168 [216255–234934]|626220 [588560–662016]|
|Precisión|continuous|1087875 [788989–1402490]|310146 [255623–372339]|1087875 [788989–1402490]|
|Precisión|fragment10|109503 [103627–114471]|73470 [70218–76181]|109503 [103627–114471]|
|Precisión|fragment25|444804 [398300–487945]|170538 [160577–182405]|444804 [398300–487945]|
|Crítico|continuous|129381 [92312–177309]|71382 [54974–87091]|129381 [92312–177309]|
|Crítico|fragment10|49521 [44861–54788]|36549 [33952–39697]|49521 [44861–54788]|
|Crítico|fragment25|112347 [86146–137970]|62148 [53530–71519]|112347 [86146–137970]|
|Crítico|reds-only|558 [479–613]|558 [479–613]|558 [479–613]|

Estas pruebas cuantifican incentivos: si fragmentar una racha mejora una celda, queda como problema a decidir, no se oculta por no haber excepción. Los amagues siguen dando solo 1 XP y no limpian errores activos; los premios de misión son únicos y no multiplicados. Las regresiones de duplicación, pausa, ocultación y dos pestañas se ejecutan aparte.

## Pasos físicos, render y sensibilidad

Cien semillas por celda, intermedio. Validación corta de 60 s: dos pasos reales (1/120,1/60) y render/entrada 30/60/120 Hz con relojes independientes; a120 Hz con física60 se pueden observar posiciones repetidas, no se finge que el motor ya avanzó. La reacción se sortea una vez por señal, no cada frame. Diferencias de cuantización y del controlador no se confunden con XP por segundo fija.

|Modo|Rango de aciertos medianos en 60 s (todos los pasos/fps)|
|---|---:|
|Fuerza|92.0–94.0|
|Defensa|80.5–81.0|
|Precisión|68.0–69.0|
|Esquiva|38.0–38.0|
|Crítico|33.0–34.5|

Sensibilidad de reacción ±25%, diez minutos; aciertos totales medianos con ritmo experimental.

|Modo|−25%|Base|+25%|
|---|---:|---:|---:|
|Fuerza|1088|1006|908|
|Defensa|880|881|880|
|Precisión|712|699|670|
|Esquiva|392|392|390|
|Crítico|377|336|274|

## Utilidad de combate a igual tiempo

Nueve estados reales del recorrido (semilla1001, compra mixta, alrededor de1h), condicionados a esas builds; 100 nuevas sesiones sintéticas y combates emparejados por celda. No son toda la población ni toda la frontera de estados. Se comparan siempre cuatro enemigos, incluidas arenas10/20/50/100 y la siguiente elegible. CSV/JSON ofrecen Wilson, daño recibido y diferencia por oleada, curas/guardias, supervivencia, duración, proxy de daño/HP y monedas. El proxy de daño propio no incluye armadura rival; HP efectivo no incluye mecánicas particulares del místico. Más daño recibido también puede significar llegar a más oleadas.

Ejemplo: build equilibrada, X0, arena100, 60 min de entrenamiento sin compras.

|Disciplina|Victorias antes / después|Wilson después 95%|Cambio daño esperado propio|Cambio HP efectivo|Niveles ganados [p10–p90]|
|---|---:|---:|---:|---:|---:|
|Fuerza|6/100 → 78/100|68.9%–85.0%|56.82 [52.73–61.87]|0.00 [0.00–0.00]|52 [48–57]|
|Defensa|6/100 → 100/100|96.3%–100.0%|0.00 [0.00–0.00]|1149.50 [1034.97–1282.07]|63 [57–70]|
|Precisión|6/100 → 21/100|14.2%–30.0%|12.80 [12.28–13.13]|0.00 [0.00–0.00]|44 [41–46]|
|Esquiva|6/100 → 55/100|45.2%–64.4%|0.00 [0.00–0.00]|322.47 [293.11–355.29]|52 [46–58]|
|Crítico|6/100 → 21/100|14.2%–30.0%|11.48 [11.00–12.41]|0.00 [0.00–0.00]|21 [20–23]|

No se resume toda la utilidad en un nivel global ni se exige igualar atributos. La tabla completa permite detectar rutas que mejoran XP pero no un enemigo concreto. Los resultados no autorizan por sí solos coeficientes nuevos ni una disciplina ganadora universal.

## Decisión pendiente

Entregar para prueba personal el ritmo experimental con XP X0, conservando un enlace de control. Comparar X1/X2 explícitamente, no activarlas de forma global. Calibrar lectura de poses, puntería, errores correlacionados, frecuencia de compras y habilidades con mediciones humanas PC/móvil antes de decidir. El desfase con las metas de arena es grande en este controlador; modificar solo Q o bajar todos los premios no constituye una conclusión validada. No hay balance definitivo aprobado ni publicación.
