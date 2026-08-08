# Revisión de datos — /Privado (cartelera deportiva)

Alcance: `src/lib/deportes/` (modelo, almacén, orquestación, fuentes) contra lo
que `Cartelera.tsx` promete en pantalla, y contra los 21 días de datos reales
del almacén (124 partidos, verificados desde el commit `3fde023`).

## Verificación sobre los datos reales

Sobre el contenido efectivo del almacén se comprobó:

- **Sin `fid` duplicado** entre archivos (mismo partido en dos días): 0 casos.
- **Sin partidos archivados bajo otra fecha chilena** que la de su `ts`: 0 casos.
- **Sin duplicados lógicos** (mismo par de equipos, mismo día, en dos archivos): 0.
- **Rangos plausibles**: todos los remates en 0–45 y córners en 0–20.
- Cobertura por liga: MLS 46, Leagues Cup 23, Liga MX 22, Chile 17, Sudamericana 16.

El almacén, hoy, está sano.

## Hallazgos

### Media — El mismo partido puede entrar dos veces con `fid` distinto (riesgo, no ocurrencia)

Las dos fuentes numeran los partidos cada una a su manera y etiquetan el día con
reglas distintas (ESPN agrupa por su propio huso; la cosecha usa fecha chilena).
Un partido nocturno cerca de la medianoche podría quedar en el archivo de un día
por una fuente y en el del día siguiente por la otra; al leer, el equipo lo
contaría dos veces en sus promedios. **En la muestra real no ocurre ninguna vez**,
pero nada lo impide estructuralmente: no hay llave lógica única
(`equipos + día`) al fusionar días en `cartelera.ts`.
*Propuesta:* dedupe en lectura por `(normNombre(local), fechaChile(ts))`.

### Media — La liga del equipo es la del primer registro visto

`historialDeAlmacen` fija `ligaId` del equipo con el primer partido que aparece.
Un equipo que juega MLS y Leagues Cup queda adscrito a una u otra según orden de
lectura, y `basesPorLiga` mezcla sus promedios en esa liga. El efecto es sutil
(las bases son promedios amortiguados) pero hace las bases de torneos cortos
menos estables. *Propuesta:* calcular bases por liga usando la liga del
**partido**, no la del equipo.

### Baja — El badge DOBLE promete menos de lo que aparenta

"DOBLE ≥60%" significa que *cada* probabilidad marginal supera 60%, no que la
combinada lo haga (remates y córners están correlacionados positivamente, así
que la conjunta es menor que el mínimo de ambas pero mayor que el producto). La
UI no lo explica. *Propuesta:* una línea en la leyenda del pie; no requiere
cambio de modelo.

### Baja — Archivos sin metadatos de procedencia

Cada JSON diario es una lista pelada: no registra fuente (ESPN/API-Football),
fecha de escritura ni versión del esquema. Para depurar discrepancias futuras
entre fuentes conviene un envoltorio `{v, fuente, escrito, partidos}` —
retrocompatible si el lector acepta ambas formas.

### Baja — `stats: null` se conserva pero no se reintenta

Un partido guardado sin estadísticas queda excluido del historial para siempre
(correcto para "la fuente no las tiene", pero no distingue "no las tenía
*todavía*"). Aceptable hoy; si aparecieran muchos, haría falta un reintento.

## Reglas de integridad presentes (no tocar)

- Un día solo se guarda cuando todos sus partidos alcanzaron estado terminal
  (evita fotos congeladas de partidos en juego).
- La cosecha parcial por cuota no escribe nada (todo-o-nada por día).
- El poblado nunca pisa días existentes; el modo liga solo inyecta ligas ausentes.
- Lectores tolerantes: campo faltante ⇒ partido fuera, nunca página caída.
- Cruce por nombre exige 2 tokens comunes; nombres de un token requieren calce
  exacto (evita unir Everton de Viña con Everton de Inglaterra).

## Contraste UI ↔ modelo

Todo lo que la pantalla muestra existe de verdad en el modelo: proyecciones por
equipo (`Lado.a/b`), probabilidades contra línea propia (`pA/pB`), historial
(`ultimos`, máx. 8), promedios por sede (`promLocal/promVisita`), totales del
partido. No hay promesas huérfanas. La única distancia semántica es la del badge
DOBLE ya descrita.
