# Argentum Souls

Prototipo independiente de entrenamiento y arena inspirado en el ciclo de juego de *Swords and Souls*, con personajes y arte originales.

## Jugar

El archivo raíz `index.html` contiene todo lo necesario para abrir el laboratorio de entrenamiento, jugar los cinco minijuegos, enfrentar arenas y guardar el progreso local. GitHub Pages debe publicar la rama **main**, carpeta **/ (root)**. La URL prevista es:

https://marianoczer-afk.github.io/Argentum-Souls/

La publicación de Pages requiere activarse en Settings > Pages si todavía no está habilitada.

## Código

- `index.html`: distribución autocontenida que se publica con Pages, derivada de la versión más reciente del laboratorio.
- `src/index.html`: fuente editable del prototipo HTML (referencia local a `./feel.js`).
- `src/feel.js`: capa experimental de respuesta visual, mejoras, misiones y arena 3/5.

**Editar en `src/` y luego regenerar el `index.html` raíz** integrando `src/feel.js` en un segundo bloque `<script>`. No editar dos versiones por separado.

## Aislamiento y seguridad

Proyecto nuevo, separado de `Idle-Czerniak` (Argentum Idle Estable 35). No enlaza ni altera el guardado v7 del juego original. La clave del laboratorio es `argentum_souls_fiel_v2` en el localStorage de este dominio.

Esta es la primera versión experimental. Probamos la sintaxis y varias mecánicas con una simulación de DOM, pero **aún falta verificación visual en un navegador real**, referencias del gameplay Flash, ajustes de animación y balance, y agregar creación de personajes con las cinco razas y ocho clases originales de Argentum Idle.

## Tareas siguientes

1. Analizar el video aportado por el usuario del juego Flash, sin copiar recursos gráficos.
2. Incorporar selección de personaje, clase y raza, preservando IDs y modificadores de Argentum Idle (fuente: `Idle-Czerniak/src/js/core/005-core.js`).
3. Pulir timing, dash, barrido de manzanas, falso aviso y doble golpe de crítico.
4. Diseñar progresión de arena y equipamiento por personaje, antes de plantear integración futura con el Idle.
