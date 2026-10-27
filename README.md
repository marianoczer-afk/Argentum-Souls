# Argentum Souls

🎮 **[JUGAR ARGENTUM SOULS ONLINE](https://marianoczer-afk.github.io/Argentum-Souls/)**

**A.3.1 — Combos, sala y combate.** El HTML y la build de esta rama se publican en ese mismo enlace después de revisar y fusionar el PR. No hace falta descargar ZIP.

Juego estático con gráficos vectoriales y sonidos propios: cinco entrenamientos continuos, equipamiento, misiones persistentes y 100 arenas en diez regiones. Cada arena enfrenta cuatro rivales, uno por uno, con jefe final, ataques automáticos y habilidades manuales. La dificultad depende de la arena y sus enemigos, sin aumentar por las victorias anteriores.

## Jugar

- **Fuerza:** ↑/W alto, →/D medio, ↓/S bajo; ←/A recoge la estrella opcional. Un corte activo y un cambio rápido en espera. Golpes al aire y estrellas perdidas son neutrales.
- **Defensa:** apuntar el escudo curvo con mouse o dedo; solo bloquea contacto real desde el frente.
- **Precisión:** clic/toque sobre el blanco; centro Perfecto, anillo Bien, exterior Fallo.
- **Esquiva:** ↑ salta la patada, ↓ agacha el cabezazo, ← retrocede ante el brazo. Las poses del muñeco anticipan el ataque; el círculo blanco coincide con Perfecto. Una acción incorrecta se anima antes del impacto.
- **Crítico:** rojo = esperar, dorado = saltar, aviso aéreo = segundo toque. Espacio/Enter/clic/toque. Un golpe válido fuera de Perfecto da Bien.

En móviles se juega sobre zonas de la escena, sin fila de botones debajo. `?` muestra la ayuda. Tres fallos consecutivos detienen amenazas y esperan una tecla o toque para continuar, sin perder XP. La XP base comienza en **2, 4 y 12** por acierto activo y crece con cada combo; Perfectos y estaciones suman, la sala general de diez niveles aumenta solo la base. Un amague rojo da 1 XP fijo sin hacer crecer combo. Las misiones avanzan continuamente; el mensaje de premio dura unos dos segundos y la siguiente misión sigue contando aciertos.

El botón **⛶** amplía entrenamientos o arenas. Intenta Fullscreen API y orientación horizontal; si el navegador no lo permite usa una expansión visual con salida visible. El juego también funciona en vertical. Equipo y atributos se convierten en desplegables compactos en móvil.

En combate decidís cuándo usar Doble golpe, Guardia o Curar. Podés elegir **×1 / ×2**: acelera toda la simulación, incluidas recargas y transiciones. Los cuatro rivales crecen en HP y presión, con un élite más relevante y jefe final. Se ven preparación, desplazamiento, contacto, retroceso, derrota y daño flotante. Completar los cuatro rivales desbloquea la siguiente arena. Perder o abandonar el intento conserva el progreso. Las primeras victorias entregan monedas; los diez jefes de región dan una mejora de equipo y un trofeo. Repetir una arena es práctica sin repetir el premio.

El inventario de la izquierda compara el objeto actual con la próxima calidad y permite **Comprar y equipar**. Se aplica al personaje inmediatamente; en un combate en curso se actualiza el poder sin borrar el daño ya recibido. Los cinco atributos son independientes y no tienen límite de nivel. No hay un nivel global ni requisitos rígidos de atributo para entrar a las arenas.

## Desarrollo y pruebas

```sh
npm ci --ignore-scripts
npm run build
npm start
npm test
npm run test:browser
npm run test:balance
npm run test:mutation
```

Abrir `http://127.0.0.1:8000/`. Node.js 20+ compila y prueba; Python 3 sirve archivos. Chromium se obtiene con `npx playwright install chromium`, o se usa `/usr/bin/chromium` / `CHROMIUM_PATH`. No abrir con `file://`: los módulos necesitan HTTP.

Editar `src/`; `npm run build` genera el nuevo `index.html` raíz y `dist/` para GitHub Pages, con rutas relativas y versiones por contenido en CSS y todo el grafo de módulos. La entrada `/src/` sirve para desarrollo; publicar la raíz compilada. GitHub Actions prueba y prepara el artefacto Pages; este trabajo no fusiona ni publica automáticamente.

## Guardados

Se conserva **`argentum_souls_fiel_v2`**, incluidos niveles, XP, monedas, estaciones, equipo, victorias y récords. La migración A.3.1 agrega sala general (nivel 1 por defecto), sin reducir niveles ni XP ni borrar estaciones, equipo o arenas de A.3. Las victorias del prototipo se conservan como historial; el mapa nuevo empieza en la arena 1 porque antes no existían sus identificadores.

La XP necesaria para subir conserva la curva gradual de A.3; no se recalculan niveles ya ganados ni se resta XP existente. [XP por combos y sala](docs/BALANCE_A31_XP.md) · [Balance de arenas](docs/ARENA_BALANCE.md). La recompensa creciente cambia las estimaciones de duración de A.3; ya no se promete el antiguo promedio de 255 horas. El objetivo orientativo de meses no es un tiempo mínimo obligatorio.

Solo una pestaña puede modificar el progreso: mantiene un Web Lock exclusivo; las demás esperan y recargan el guardado al adquirirlo. Todos los premios y compras pasan por ese escritor. Misiones e hitos se guardan con su recompensa en el mismo snapshot. Si falla una escritura por cuota, el avance permanece en memoria y se puede reintentar. Si el almacenamiento o la coordinación están bloqueados, se avisa que la sesión no se conservará. Los datos ilegibles no se sobrescriben.

`window.ArgentumSoulsBridge.exportProgress()` sigue devolviendo una copia del progreso con esquema `argentum-souls-progress-v1`, ampliado con campos aditivos. No se lee ni escribe el guardado v7 de Argentum Idle ni se modifica `Idle-Czerniak`. Personajes, razas y clases específicas siguen pendientes.

## Módulos

- `src/training/`: simulación, entrada, render, geometría compartida y ritmo por combo.
- `src/combat/`: cien arenas/regiones, fórmulas, combate en vivo y render propio.
- `src/progression/`: misiones persistentes, equipo y premios/desbloqueos de arena.
- `src/arena.js`, `src/economy.js`: controladores de mapa, batalla, inventario y tienda.
- `src/stage.js`: coordenadas, tamaño de escenario y pantalla completa.
- `src/state.js`, `src/save-session.js`: migración, XP, exportación y escritura exclusiva.

[Entrega A.3.1, capturas y limitaciones](docs/DELIVERY_A31.md) · [Balance de entrenamientos](docs/BALANCE_A31_TRAINING.md) · [Balance de las cien arenas](docs/ARENA_BALANCE.md).

[Nivel general y pesca: propuesta futura](docs/FUTURE_PROGRESSION_AND_FISHING.md) · [Referencia analizada](docs/REFERENCE.md) · [Registro de trabajo](docs/WORKLOG.md) · [Auditoría inicial](docs/CORRECTIONS.md). Los informes anteriores se conservan como historial; la especificación actual está en A.3. Capturas transitorias y resultados JSON quedan en `artifacts/`, ignorado por Git.
