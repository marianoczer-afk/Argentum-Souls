# Argentum Souls

Juego web independiente de entrenamiento y arena inspirado en el ciclo de juego de *Swords and Souls*, con dibujo y sonidos propios. Primera entrega: cinco entrenamientos continuos con controles de teclado/mouse/táctiles, combos, experiencia por acierto y progreso guardado al salir.

## Jugar y desarrollar

GitHub Pages sirve la rama **main**, carpeta **/ (root)**. El `index.html` raíz carga módulos estáticos desde `src/`, con rutas relativas compatibles con `/Argentum-Souls/`. No necesita backend ni servicios externos.

```sh
npm ci
npm run build
npm start
```

Abrir el servidor local en un navegador. La raíz y `/src/` sirven la misma aplicación. Python 3 sirve los archivos; Node.js 20+ se usa para generar el HTML raíz y ejecutar pruebas. No abrir el HTML mediante `file://`: los módulos necesitan HTTP.

Editar en `src/` y ejecutar `npm run build`. El build solo genera el pequeño HTML raíz con las rutas correctas; no duplica JavaScript ni necesita empaquetador. No editar el HTML raíz por separado.

## Entrenamiento

- **Fuerza:** ↑/W alto, ←/A medio, ↓/S bajo; →/D recoge la estrella detrás. Una trayectoria corta varias manzanas próximas. Se pueden encadenar pulsaciones sin recarga.
- **Defensa:** mover mouse o dedo para orientar el escudo al impacto.
- **Precisión:** apuntar y hacer clic/toque; acertar al centro da perfecto.
- **Esquiva:** seguir la dirección indicada ante el ataque del muñeco.
- **Crítico:** calavera = no pulsar; exclamación = primer toque; rayo en el aire = segundo toque. Espacio, Enter o clic.

No hay final por tiempo. El ritmo aumenta con límites; los errores rompen el combo. Cada acierto da experiencia y los combos la multiplican. La misión de sesión entrega +15 monedas una vez, sin cortar el entrenamiento. Las estaciones suman XP por acierto. «Salir y guardar» conserva lo ganado; también se guarda durante los aciertos. Perder foco o cambiar a arena/tienda pausa el entrenamiento; para volver hay que pulsar «Continuar».

## Código

- `src/app.js`: composición y bucle de simulación a 120 pasos/s con dibujo por frame.
- `src/training/model.js`: reglas, proyectiles, combos, señales, recompensas.
- `src/training/render.js`: sala, personajes, poses, trayectorias y efectos de canvas.
- `src/training/controller.js`: teclado, puntero, botones y HUD.
- `src/state.js`: persistencia y exportación de progreso.
- `src/economy.js`: equipo, estaciones y atributos.
- `src/arena.js`: arena del prototipo, series de 3/5 y habilidades. Las mejoras completas de combate pertenecen a la próxima entrega.

`window.ArgentumSoulsBridge.exportProgress()` devuelve una copia de los datos con esquema `argentum-souls-progress-v1`. Es una interfaz explícita de exportación, no sincronización entre dominios.

## Pruebas

```sh
npm test
npm run test:browser
```

Las pruebas de navegador usan Playwright y Chromium. En el entorno de nube está instalado `/usr/bin/chromium`; en otra máquina se puede ejecutar `npx playwright install chromium` o indicar `CHROMIUM_PATH`. El test levanta y cierra su propio servidor en el puerto 8765, usa contextos desechables, reloj controlado y teclado/mouse reales. No modifica el guardado del usuario. Las diez minutos por disciplina del test del motor son tiempo simulado, no diez minutos de ejecución real.

Las capturas por movimiento y el informe de cada ejecución se guardan en `artifacts/` (ignorado por Git). El test observa la simulación mediante instrumentación exclusiva del navegador de prueba, sin exponer API de depuración en producción ni sustituir los resultados de las acciones.

## Guardado y alcance

Solo se usa `argentum_souls_fiel_v2`, con compatibilidad para niveles, equipo, monedas, victorias y estaciones existentes. No lee ni escribe el guardado v7 de Argentum Idle. No se modificó `Idle-Czerniak`. Personajes con cinco razas/ocho clases, habilidades por clase y desbloqueos de arenas quedan para entregas posteriores.

Ver [análisis de referencia y plan](docs/REFERENCE.md) y [registro de trabajo y validación](docs/WORKLOG.md).
