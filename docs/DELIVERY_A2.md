# Entrega A.2 — ritmo, controles y lectura de los cinco entrenamientos

Rama `dev/delivery-a2-training-feel`, creada desde `main`/48d1c18 (incluye A.1). Versión local 0.3.2 con identidad de contenido; Actions conserva el número de ejecución en la versión publicada. No incorpora arenas, personajes ni cambios de economía. La URL pública solo cambiará después de revisar, fusionar y publicar.

## Cambios jugables

**Fuerza.** Los lanzamientos parten de la mano del muñeco: arriba asciende en arco y cae hacia el corte alto, medio es directo y abajo va cerca del suelo. Inicio de 260 px/s horizontales, alrededor de 528 en combo 100, máximo 600; cambian también la cadencia y las secuencias de dos/tres manzanas. Una sola espada activa: el primer movimiento responde a la entrada y un cambio durante los primeros 45 ms reemplaza el único movimiento en espera. No se espera a que termine la animación de 160 ms. Se conservan cortes múltiples y golpes al aire neutrales. La estrella trasera es un bonus opcional: al expirar se elimina sin daño, fallo ni pérdida de combo.

**Defensa.** Dibujo y colisión usan el mismo rectángulo redondeado, tangente a un círculo de radio 76. El escudo se posiciona directamente hacia el puntero o el dedo. La colisión es fruta circular contra ese rectángulo, con contacto desde el frente; no se vuelve a bloquear una fruta que superó el escudo. Si toca el cuerpo, rompe combo y explica el fallo. Se eliminó la estela/flecha de las manzanas. Dieciséis sectores con variación angular, entradas desde fuera del canvas y ráfagas; se reserva tiempo adicional para cambios de orientación grandes.

**Precisión.** Mezcla de blancos cercanos grandes (50%), medianos (35%) y lejanos más pequeños (15%). Los tamaños se adaptan a la escala táctil. Centro del 16% del radio = Perfecto; resto del círculo = Bien; exterior o pérdida = Fallo. Movimiento, vida y parejas siguen cambiando gradualmente. Los círculos conservan separación, incluso en móvil.

**Esquiva.** Tres ataques, sin el golpe procedente de la izquierda: cabezazo/agacharse, brazo/retroceder y patada/saltar. Personajes cercanos, con movimientos reales y distintos de cabeza, brazo, pierna y cuerpo. Se retiró el palo que se estiraba a través de la habitación. Anticipación, preparación y ataque más breves; una única función determina el círculo blanco y Perfecto, desde −60 a +120 ms respecto al inicio del ataque. Se permite Bien algo antes/después; demasiado pronto, dirección errónea o no responder = Fallo. La evasión responde al pulsar, alcanza rápido su pose y la sostiene durante el golpe; XP y resultado se confirman al cerrar la ventana.

**Crítico.** Rojo y dorado comparten círculo y exclamación; se distinguen por color y texto, sin calavera exclusiva para el amague. Avisos algo menores, intervalos y composiciones variables, pausas normales cortas y ventanas acotadas. Se conservan salto, segundo golpe aéreo y XP/combo una vez por ignorar correctamente el rojo.

**Dominio y ritmo.** Frases de 3–6 lanzamientos alternan un ritmo pausado, normal o rápido, con variación adicional limitada. Los cambios de velocidad no sustituyen las secuencias. Encadenar Perfectos en Fuerza o Defensa genera un pulso corto del combo, destellos locales, mensajes de cadena y tonos distintos/consecutivos. No agrega premios económicos ni detiene el reloj o los controles. El sonido sigue siendo opcional y las animaciones decorativas respetan reducir movimiento.

## Pantalla y controles

El tamaño del canvas se calcula a partir de la altura disponible, conservando su proporción 5:3. Encabezado, selección, HUD y panel de atributos son más compactos. En escritorio se verificó la escena completa, sus controles y el panel a zoom 100%, sin scroll, en 1024×600, 1280×720, 1366×768, 1440×900 y 1920×1080, con un contexto de escritorio real sin emulación táctil. Se comprueban las posiciones de los elementos, no solo que el overflow esté oculto.

En móvil, el área de juego sustituye la fila de botones: Fuerza se maneja arriba/derecha/abajo/detrás del héroe, Defensa con toque/arrastre directo, Precisión sobre el blanco, Esquiva con zonas superior/inferior/central y Crítico en cualquier parte libre de la escena. Las zonas se expresan en coordenadas del mundo y se escalan con el canvas. Hay una ayuda inicial discreta y un botón `?` que pausa, explica el modo y devuelve el control al cerrar. No queda el texto «Cómo jugar» debajo de la escena. HUD y menús no ejecutan ataques accidentales; en Crítico se conserva el toque sobre zonas libres del marco. Se verificaron además gestos nativos de dos dedos sin scroll, zoom ni selección accidental.

![Escritorio actual, 1366×768](screenshots/current-desktop.png)

![Móvil actual, 390×844](screenshots/current-mobile.png)

Solo se incorporan estas dos capturas actuales; otras imágenes de prueba quedan en `artifacts/`, ignorado por Git. No se genera ZIP.

## Guardados y arquitectura

Sin cambios en `src/state.js`, `src/save-session.js`, la clave de almacenamiento ni el formato persistente de A.1. Se conservan XP, niveles, misiones, estaciones, equipo y registros de hitos, así como escritor exclusivo entre pestañas, recuperación de cuota, advertencias y modo en memoria. No se accede a Idle v7. Los campos de ritmo y cadenas son transitorios de la sesión. La puntuación y los premios permanecen en el motor; renderizado y colisiones comparten geometría y ventanas, sin temporizadores de animación que decidan el resultado.

## Balance y pruebas

[Tabla de combos 0/25/50/75/100/150 y presupuestos de respuesta](BALANCE_A2.md). Incluye velocidad horizontal y total de proyectiles, intervalos, frecuencia de ráfagas, ventanas y menor separación entre acciones/impactos. `npm run test:balance` ejecuta 60 escenarios de 120 segundos con semilla fija: control instantáneo y perfil restringido. El segundo limita cadencia de cortes/toques, espera después de bloquear y limita velocidad angular del escudo. Ambos completaron las secuencias sin fallos.

```sh
npm ci --ignore-scripts
npm run build
npm test
npm run test:balance
npm run test:browser
npm run test:mutation
```

- 51 pruebas unitarias: estrella opcional, exclusividad y buffer de espada, trayectorias, colisión circular en 32 orientaciones, bloqueo tardío rechazado, tamaños y separación táctil, tres evasiones y límites exactos de Perfecto, ritmo y cadenas, además de XP/guardado anteriores.
- 51 comprobaciones Chromium: teclado, mouse, toque/arrastre y dos dedos; cuerpo y extremidades dibujadas, círculo blanco antes/durante la ventana, señales roja/dorada con la misma forma real, nodos de audio de cortes, progreso sin duplicación, pantalla completa en cinco resoluciones y las regresiones de concurrencia/cuota/caché. Las fixtures solo preparan escenarios; los aciertos usan controles reales y no sustituyen los resultados del motor.
- Mutación de animaciones: ignorar la pose en `hero()` es rechazado por las pruebas de movimiento unitarias y de Chromium. Las regresiones previas se adaptaron únicamente a las reglas solicitadas: tres evasiones, nueva fase blanca, corte en paso físico, zonas táctiles y mayor velocidad.

La revisión visual incluyó capturas de las tres animaciones, móvil, escritorio y avisos; no equivale a una sesión humana ni a una escucha física del audio. Las simulaciones restringidas son presupuestos de diseño, no prueba de que cualquier persona llegará a combo 100. Falta tu prueba personal de sensación y dificultad. No se probó un teléfono físico ni Safari/Firefox; alturas de escritorio inferiores a 600 px usan la disposición adaptable con desplazamiento permitido. Las entradas desde fuera de la escena en Defensa son intencionales, y el recorrido visible no se recorta para forzar el ajuste de pantalla.
