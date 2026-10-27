# Propuesta futura: personaje, estilos y pesca

Documento de diseño, no funcionalidades implementadas en A.3.1. Los cinco atributos siguen independientes y sin tope. No se crean cuentas ni se integra otro HTML, otra clave de guardado o el proyecto Idle.

## Qué tomar de Swords & Souls

Las referencias de Flash analizadas en REFERENCE separan práctica de atributos, progresión del personaje y decisiones del combate. La enseñanza útil es una meta a corto plazo (acierto/combo), otra a medio plazo (mejora/arena) y desbloqueos de habilidades que cambian cómo jugar. No se copian recursos, código ni un árbol de talentos propietario. Las observaciones disponibles no bastan para trasladar una tabla numérica completa de niveles/talentos: esta propuesta es propia y necesita validación, no una transcripción supuestamente exacta del juego de referencia.

Mantener el entrenamiento como origen principal del poder de los cinco atributos. Un nivel general futuro puede desbloquear espacios de habilidad, opciones o talentos, sin repartir puntos de Fuerza/Defensa adicionales que dupliquen lo ya entrenado. Preferir XP de personaje por primeras arenas, misiones y descubrimientos con IDs durables, nunca duplicar la XP creciente de cada acierto como otra fuente de estadísticas. No exigir ese nivel general para entrar a una arena: el mapa sigue secuencial y la capacidad se decide en combate.

Los talentos deberían ofrecer decisiones de coste: golpe más lento y fuerte, guardia más breve pero eficaz, cura menor con recarga corta, etc. Comparar daño/supervivencia con el mismo presupuesto y las mismas semillas del simulador. Evitar un talento que simplemente multiplique toda la XP o todos los atributos; se convertiría en elección obligatoria. Desbloqueos no son ventajas acumulativas sin contraparte.

Clases y razas: diferencias de ritmo, habilidades y presentación antes que grandes porcentajes planos. Antes de definir IDs, nombres o modificadores, revisar las cinco razas y ocho clases existentes en `Idle-Czerniak/src/js/core/005-core.js`, en modo lectura y con la versión acordada. No se inventan valores en esta entrega. Preparar un adaptador `build -> heroStats + abilities` y políticas de habilidad por clase; el motor actual ya recibe estadísticas, configuración de arena y callbacks de victoria, sin leer almacenamiento. Una futura migración sería aditiva y versionada; no convertir ni reiniciar el personaje actual automáticamente.

## Economía compartida con pesca

Esperar el HTML real para medir oro por minuto activo, rendimiento pasivo, costes, inventario y formato de guardado. No fijar un cambio de moneda ni importar saldos a ciegas. Monedas actuales: primeras arenas dan 45+8×ID+2×floor(ID^1.3); misiones repetibles escalan de 15 a 200 monedas; una sala completa cuesta la suma documentada en BALANCE_A31_XP. Las arenas no se farmean repitiendo un premio de primera victoria.

Proponer una sola cartera en el juego anfitrión y operaciones con origen, cantidad e ID único: `arena:ID:first-clear`, `mission:atributo:índice`, `catch:ID`. Solo el anfitrión confirma la compra y el saldo. Los módulos solicitan concesiones/gastos a través de un adaptador, sin escribir cada uno su copia de oro. Reintentar una operación no vuelve a cobrarla. Compra y equipamiento se confirman en el mismo snapshot; no restar en un guardado y equipar en otro. Si el HTML de pesca tiene otras denominaciones, acordar una conversión explícita y mostrar una vista previa antes de migrar.

Medir objetivos comparables: tiempo para siguiente pieza, siguiente sala y estación. Pesca debe aportar una alternativa competitiva y sus propios descubrimientos; las misiones y primeras arenas deben financiar una ruta viable sin pescar. Simular ambos extremos: solo Souls, solo pesca, alternancia y pesca pasiva. Si el oro pasivo compra toda la progresión de combate en minutos, ajustar sus sumideros/rendimiento antes de conectar las carteras. No se elige una tasa de pesca definitiva sin conocer el otro juego ni se agrega una obligación diaria.

El inventario compartido debería distinguir `equipment`, `fish`, `materials`, con IDs estables y versión de catálogo. Conservar `gear` numérico existente mediante un adaptador, no convertirlo retroactivamente a ítems que podrían perder calidad. Equipar no debe destruir peces/materiales por una colisión de IDs. Exportar/importar con validación de tipos, rangos y snapshot de recuperación; los archivos externos son datos, no código ejecutable ni instrucciones.

## Persistencia y coordinación

Cuando ambos módulos estén en el mismo origen, un solo anfitrión puede mantener un snapshot con subespacios Souls/pesca/cartera y un escritor exclusivo, usando el protocolo actual como base. Nunca asumir que dos GitHub Pages en dominios distintos comparten localStorage. Mientras sean proyectos separados, intercambio explícito de exportaciones; ninguna lectura silenciosa de otras claves ni del v7 de Idle.

Antes de migrar: identificar versión, mostrar saldo/equipo detectados, guardar copia recuperable y verificar que todas las operaciones anteriores conservan identidad. Conservar estados de memoria/cuota/solo lectura y no declarar «guardado» si falla una parte. Las pruebas deben incluir dos pestañas en ambas secciones, cierres en distinto orden, cuota durante una compra y reintento/importación duplicada. El cliente estático no impide que alguien edite su propio localStorage: cuentas, sincronización entre dispositivos o economía competitiva requerirían una autoridad externa y otro alcance. No se implementa nada de eso ahora.
