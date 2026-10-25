# Argentum Souls

Juego web independiente de entrenamiento y arena inspirado en el ciclo de juego de *Swords and Souls*, con dibujo y sonidos propios. Entrega A: HUD compacto y sala ampliada, cinco entrenamientos de inicio automático y dificultad por combo, controles de teclado/mouse/táctiles y progreso guardado por acierto.

## Jugar y desarrollar

GitHub Pages sirve la rama **main**, carpeta **/ (root)**. El `index.html` raíz carga módulos estáticos desde `src/`, con rutas relativas compatibles con `/Argentum-Souls/`. No necesita backend ni servicios externos.

```sh
npm ci
npm run build
npm start
```

Abrir el servidor local en un navegador. La raíz y `/src/` sirven la misma aplicación. Python 3 sirve los archivos; Node.js 20+ se usa para generar el HTML raíz y ejecutar pruebas. No abrir el HTML mediante `file://`: los módulos necesitan HTTP.

Editar en `src/` y ejecutar `npm run build`. El build genera el HTML raíz con metadatos y el artefacto `dist/`; no incrusta JavaScript en un HTML gigante ni necesita empaquetador. No editar el HTML raíz por separado.

## Entrenamiento

- **Fuerza:** ↑/W alto, →/D medio, ↓/S bajo; ←/A recoge la estrella detrás. Una trayectoria corta varias manzanas próximas. Se pueden encadenar pulsaciones sin recarga.
- **Defensa:** mover mouse o dedo para orientar el escudo al impacto.
- **Precisión:** apuntar y hacer clic/toque; acertar al centro da perfecto.
- **Esquiva:** seguir la dirección indicada ante el ataque del muñeco.
- **Crítico:** calavera = no pulsar; exclamación = primer toque; rayo en el aire = segundo toque. Espacio, Enter o clic.

Las disciplinas arrancan al seleccionarlas, sin botón Empezar. No hay final por tiempo, combo ni misión. El ritmo aumenta según el combo con límites y vuelve suavemente al inicio tras fallar; golpear al aire en Fuerza no penaliza. Los errores rompen el combo. Cada acierto da experiencia y los combos la multiplican. La misión de sesión entrega +15 monedas una vez, sin cortar el entrenamiento. Las estaciones suman XP por acierto. «Salir y guardar» conserva lo ganado; también se guarda durante los aciertos. Perder foco o cambiar a arena/tienda pausa el entrenamiento; al volver desde arena/tienda se reanuda, mientras que una pausa por foco, configuración o manual exige «Continuar».

## Código

- `src/app.js`: composición y bucle de simulación a 120 pasos/s con dibujo por frame.
- `src/training/model.js`: reglas, proyectiles, combos, señales, recompensas.
- `src/training/render.js`: sala, personajes, poses, trayectorias y efectos de canvas.
- `src/training/controller.js`: teclado, puntero, botones y HUD.
- `src/state.js`: normalización, experiencia y exportación de progreso.
- `src/save-session.js`: coordinación de pestañas y única ruta de escritura, con estados de guardado explícitos.
- `src/economy.js`: equipo, estaciones y atributos.
- `src/arena.js`: arena del prototipo, series de 3/5 y habilidades. Las mejoras completas de combate pertenecen a la próxima entrega.

`window.ArgentumSoulsBridge.exportProgress()` devuelve una copia de los datos con esquema `argentum-souls-progress-v1`. Es una interfaz explícita de exportación, no sincronización entre dominios.

## Pruebas

```sh
npm test
npm run test:browser
npm run test:mutation
```

Las pruebas de navegador usan Playwright y Chromium. En el entorno de nube está instalado `/usr/bin/chromium`; en otra máquina se puede ejecutar `npx playwright install chromium` o indicar `CHROMIUM_PATH`. El test levanta y cierra su propio servidor en un puerto libre, usa contextos desechables, reloj controlado y teclado/mouse reales. No modifica el guardado del usuario. Las diez minutos por disciplina del test del motor son tiempo simulado, no diez minutos de ejecución real.

La suite también prueba dos pestañas reales en ambos órdenes de cierre, toma de control con recarga del estado, getter de almacenamiento bloqueado, cuota agotada y reintento. Las pruebas táctiles incluyen cortes con acierto, arrastre del escudo, disparos, esquivas y la secuencia completa de crítico. `npm run test:mutation` rompe la aplicación de poses en una copia temporal y exige que las pruebas unitaria y de Chromium fallen por falta de movimiento corporal.

Las capturas por movimiento y el informe de cada ejecución se guardan en `artifacts/` (ignorado por Git). El test observa la simulación mediante instrumentación exclusiva del navegador de prueba, sin exponer API de depuración en producción ni sustituir los resultados de las acciones.

## Guardado y pestañas

Solo una pestaña por origen puede modificar el guardado de Souls: mantiene un Web Lock exclusivo mientras está abierta. Las demás muestran un aviso y quedan en espera; entrenamiento, compras y combate no pueden modificar el progreso allí. Al cerrar la pestaña activa, la siguiente toma el control y **recarga el último estado guardado antes de permitir acciones**. Los cierres, reintentos y demás escrituras pasan por la misma coordinación.

Si falla el acceso a `localStorage` o el navegador no dispone de Web Locks, se puede jugar **solo en memoria** y se muestra que el progreso no se conservará al cerrar. Sin coordinación no se escribe el guardado existente. Con cuota agotada aparece un error: liberar espacio/habilitar almacenamiento y pulsar **Reintentar**; la sesión solo se confirma guardada cuando la escritura tiene éxito. Un guardado ilegible se protege contra sobrescritura y requiere revisar el almacenamiento y recargar.

La coordinación protege las pestañas que ejecutan esta versión; pestañas antiguas abiertas con el código previo deben recargarse. No coordina perfiles/dispositivos con almacenamiento independiente ni implementa sincronización entre dominios. Al volver mediante la caché de navegación se recarga la página para obtener otra vez el control y el estado vigentes.

Se conserva el guardado síncrono por acierto. Las actualizaciones de atributos se agrupan por frame; la tienda se refresca al abrirla o comprar, en lugar de reconstruirse con cada acierto mientras está oculta.

## Guardado y alcance

Solo se usa `argentum_souls_fiel_v2`, con compatibilidad para niveles, equipo, monedas, victorias y estaciones existentes. No lee ni escribe el guardado v7 de Argentum Idle. No se modificó `Idle-Czerniak`. Personajes con cinco razas/ocho clases, habilidades por clase y desbloqueos de arenas quedan para entregas posteriores.

Ver [análisis de referencia y plan](docs/REFERENCE.md) y [registro de trabajo y validación](docs/WORKLOG.md).

Ver también [correcciones de la primera auditoría](docs/CORRECTIONS.md).

La versión/publicación automática y la configuración de Pages necesaria se detallan en [Entrega A](docs/DELIVERY_A.md). Personajes, curva definitiva de XP y arenas nuevas quedan para B/C.

## Entrega A.1

Pulido de los cinco entrenamientos: ráfagas y dificultad por combo, premios persistentes de hitos, misión con XP, anticipación de Esquiva, lectura de amagues de Crítico y panel compacto de atributos. [Cambios y validación](docs/DELIVERY_A1.md) · [Parámetros y simulaciones](docs/BALANCE_A1.md).

`npm run test:balance` reproduce los 35 escenarios de balance. El build de publicación está en `dist/`; abrir mediante HTTP, no `file://`. Las arenas y los personajes siguen pendientes para B/C.
