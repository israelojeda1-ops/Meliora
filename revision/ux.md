# Auditoría UX — /Privado (cartelera deportiva móvil)

## Resumen

La app está bien pensada para su dueño: tema oscuro coherente, hora de Chile
explícita, protección contra doble toque, pie con trazabilidad. Los problemas
graves se concentran en tres puntos: "Poblar historial" **descarta los avisos**
del backend (incluido el del corte a 45 s, con lo que el mensaje de éxito puede
mentir), la **sesión expirada deja atascado** al usuario con "No autorizado." sin
salida, y **no existe control de fecha** pese a que el backend ya lo soporta. El
resto son fricciones de legibilidad, semántica sin leyenda y accesibilidad.

## Hallazgos

**Defectos**

1. **"Poblar historial" descarta avisos y puede reportar éxito falso.** `poblarFutbol` devuelve el aviso del corte a 45 s (`src/lib/deportes/espn.ts:128`), pero la UI solo muestra `diasEscritos`/`partidos` (`Cartelera.tsx:227`, ahora ~207). *Fix:* anexar `j.avisos` al mensaje y, si hubo corte, dejar el botón como "Continuar".
2. **Sesión expirada a mitad de uso deja la app atascada.** 401 solo pinta "No autorizado." sin re-login salvo recarga manual. *Fix:* en `r.status === 401`, `location.reload()`.
3. **No se puede ver mañana aunque el backend lo permite.** `diaAMostrar` acepta `?fecha=` y `nombreDia` rotula "Mañana", pero no hay control. *Fix:* chips "Hoy / Mañana".
4. **El punto ámbar de "muestra corta" es ilegible en móvil.** Círculo de 4 px cuya única pista es un `title` que no existe en táctil. *Fix:* mini-chip de texto ámbar.
5. **No hay leyenda de chips ni del badge DOBLE.** La explicación proyección-vs-línea vive dentro del acordeón abierto. *Fix:* línea fija de leyenda bajo los tiles.
6. **Primer uso: la acción clave (Poblar) está al fondo, desconectada del vacío.** El estado vacío no dice qué hacer. *Fix:* mover el botón dentro del estado vacío con una frase de contexto.
7. **Contraste insuficiente en textos pequeños.** `slate-600`/`slate-500` a 10–11 px sobre `slate-950` cae bajo AA. *Fix:* subir todo texto ≤12 px a `slate-400` mínimo.
8. **Progreso de "Poblar" opaco ~45 s.** Mensaje fijo, botón solo baja opacidad. *Fix:* etiqueta "Poblando…" mientras carga.
9. **Acordeón sin semántica accesible (leve).** Falta `aria-expanded`/`aria-controls`. *Fix:* `aria-expanded={abierto}`.

**Preferencias**

10. Avisos técnicos del almacén (HTTP, env vars) mezclados con avisos de usuario → agrupar bajo `<details>`.
11. Rival del historial capado a `max-w-[110px]` nunca se lee completo → quitar el cap (la tabla ya tiene scroll).
12. Áreas táctiles bajo 44 px en nav de deportes y botones del header → `min-h-[44px]`.

## Lo que está bien

- **Doble toque resuelto** con una sola `useTransition` para Actualizar y Poblar.
- **Countdown sin desfase de hidratación**: `relativo()` solo tras montar, tick 30 s, "en juego" en verde.
- **Zona horaria explícita y consistente**, con manejo correcto de horario de verano en `fecha.ts`.
- **Tablas de historial**: scroll del contenedor, no de la página; convención "vs/@" con color clara.
- **Trazabilidad**: pie "Actualizado · N peticiones" y tiles (partidos / dobles / ligas).
- **Avisos operativos bien escritos**: incluyen la acción a tomar y explican por qué el historial crece día a día.
- **Login**: `autoFocus`, errores de clave y de config diferenciados, redirect limpio, comparación de clave en tiempo constante.
