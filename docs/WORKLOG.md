# Registro de trabajo — primera entrega

Fecha: 25 de octubre de 2026. Horas de la tabla en Buenos Aires (UTC−3). Los intervalos representan tiempo de reloj entre marcas registradas, no facturación ni tiempo de CPU. No se atribuye tiempo anterior no observado.

## Etapas

| Etapa | Intervalo registrado | Duración |
| --- | --- | --- |
| Análisis de las cuatro partes y plan inicial | 03:46:03–03:47:55 | 1 min 52 s |
| Implementación modular y primeras pruebas del motor/navegador | 03:47:55–03:55:05 | 7 min 10 s |
| Correcciones, revisión visual y validación reproducible | 03:55:05–04:00:52 | 5 min 47 s |
| Prueba adicional de Pages, configuración y preparación de entrega | 04:00:52–04:03:56 | 185 s |

Las etapas incluyen lectura, escritura, espera de herramientas, documentación y diagnóstico. El análisis de video usó muestreo de fotogramas, no una reproducción en tiempo real de seis minutos.

## Ejecuciones con duración medida

| Comando | Inicio en Buenos Aires | Duración de proceso | Resultado |
| --- | --- | --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund --cache /workspace/argentum-environment/npm-cache` | 04:00:50 | 438 ms | salida 0 |
| `npm run build` | 04:00:51 | 245 ms | salida 0 |
| `npm test` | 04:00:51 | 446 ms | salida 0 |
| `npm run test:browser` (última ejecución) | 04:02:09 | 34726 ms | 17 comprobaciones aprobadas |

Resultados: 15 pruebas del motor aprobadas, 0 fallidas/omitidas; 17 comprobaciones de navegador aprobadas, 0 fallidas/omitidas. La prueba de continuidad del motor simula diez minutos por cada una de las cinco disciplinas. La del navegador usa reloj controlado y verifica una sesión de más de 35 segundos de simulación; no son 35 segundos de espera real. Teclado, mouse y controles táctiles se ejercitan en Chromium headless, no en un teléfono físico.

Las capturas del canvas verifican un cambio de fotograma durante el corte y el regreso de la pose al reposo. Se revisaron visualmente Fuerza, Defensa, Precisión, Esquiva y las fases aérea/impacto de Crítico. La revisión detectó y corrigió una discontinuidad de posición en Crítico. No se afirma equivalencia perceptiva con Flash ni latencia medida contra el video.

Informes completos de esta máquina: `artifacts/command-results.json` y `artifacts/browser-results.json`. Capturas y secuencia animada: `artifacts/`. Son salidas locales ignoradas por Git, regenerables con la suite de navegador.

## Fallos investigados y tiempos NO MEDIDOS

- Primera instalación: npm intentó escribir en su caché por defecto fuera del área escribible. Se corrigió usando `/workspace/argentum-environment/npm-cache`; instalación congelada posterior verificada. Duración individual del intento inicial: **NO MEDIDO**.
- Primera suite de navegador: falló el caso de Defensa porque el test intentaba mover el mouse al punto inicial de un proyectil fuera del canvas. Se corrigió la entrada del test para apuntar dentro de la sala en el mismo ángulo; no se cambió el bloqueo para hacer pasar el caso. Duración de esa ejecución fallida: **NO MEDIDO**.
- Reejecución completa previa: 16 comprobaciones aprobadas, 31.011 ms, inicio 03:55:20. Otra ejecución tras las correcciones: 16 aprobadas, 32.458 ms, inicio 03:59:25. La última agrega la comprobación de ruta de Pages.
- Builds iniciales: ejecutados correctamente; duración individual **NO MEDIDO**. El build final medido figura arriba.
- Análisis previo de la sesión anterior, intentos de adjuntos grandes y tiempo transcurrido entre turnos: **NO MEDIDO**; excluidos de estas etapas.
- `git ls-remote origin HEAD` funciona. La API de GitHub falló con `CONNECT 403` al consultar el repositorio; duración individual **NO MEDIDO**. Se guardó `api.github.com` como dominio adicional en el borrador conservando los presets existentes. Guardar un borrador no aplica la política ni demuestra permisos de PR.
- Los pasos de commit/publicación de rama/creación de PR posteriores a este punto se registran con su resultado; su duración individual es **NO MEDIDO** salvo indicación expresa.

## Alcance y pendientes

Primera entrega de entrenamiento implementada. La arena del prototipo y la tienda siguen jugables en módulos separados. No se implementaron todavía personajes/razas/clases, nuevos desbloqueos de arena ni la revisión completa de combate. `Idle-Czerniak` y su guardado v7 no fueron modificados. Main no se fusiona ni se despliega automáticamente.

## Publicación de la rama y PR

- Commit de implementación: `b913263` (`feat: add continuous modular training with responsive controls`).
- `git push --set-upstream origin dev/continuous-training`: correcto; rama remota creada y seguimiento configurado. Duración individual: **NO MEDIDO**.
- `gh pr create --repo marianoczer-afk/Argentum-Souls --base main --head dev/continuous-training ... --body-file ...`: bloqueado, `Post "https://api.github.com/graphql": Forbidden`. No se creó un PR; no es un fallo de las pruebas ni una fusión.
- Texto del PR preparado en `/tmp/argentum-training-pr.md` en esta máquina. Comparación para revisión: https://github.com/marianoczer-afk/Argentum-Souls/compare/main...dev/continuous-training?expand=1
- Borrador del entorno guardado con `install_script`, `start_skill` actualizados y `api.github.com` como dominio adicional. Requiere revisión/guardado y publicación desde los ajustes del entorno; aún no demuestra acceso efectivo a la API. No se solicitaron ni copiaron tokens.
- La rama main remota conserva `438977b5bd12f3876c9e4ca4fecb3449a02b42ab`. No se modificó la configuración de GitHub Pages ni se publicó la rama de desarrollo en producción.
