# Informe consolidado — Portal Meliora / zona /Privado

Fecha: 2026-08-08. Tres auditorías (seguridad, UX, datos) sobre el portal, con
foco en la cartelera deportiva nueva. Diagnóstico, sin cambios de código.

## 1. Estado general

El portal está sólido en lo estructural: autenticación con JWT firmado y
algoritmo fijado, cookies con flags correctos, render sin XSS, proxies sin SSRF,
y un almacén de datos que hoy —verificado sobre 124 partidos reales— está limpio,
sin duplicados ni fechas corridas. La debilidad principal no es de la cartelera
sino de un endpoint viejo, `/demo/access`, público y sin límite. Nada impide
operar `/Privado` con datos reales hoy; ya está en producción y funcionando.

## 2. Bloqueantes

**No hay bloqueantes para la zona `/Privado`.** Opera con datos reales sin riesgo
de corrupción ni de fuga. El único hallazgo que conviene resolver antes de dejar
el portal desatendido es de seguridad y ajeno a la cartelera:

- **`/demo/access` público** (seguridad M1): permite a un anónimo generar commits,
  gatillar correos e inyectar fórmulas en un CSV. No toca datos de clientes ni de
  `/Privado`, pero es la única puerta abierta del portal. Cerrarla (rate-limit +
  saneo CSV) es lo que yo haría antes de considerarlo "entregado".

## 3. Hallazgos por área

- **Seguridad** → [`seguridad.md`](seguridad.md). Sin críticas ni altas. 4 medias
  (demo público, proxies que reenvían la cookie de sesión, XSS de DOM en el widget
  de banco, token del almacén compartido) y 6 bajas de endurecimiento.
- **UX** → [`ux.md`](ux.md). 9 defectos de flujo/legibilidad (avisos de "Poblar"
  descartados, sesión expirada sin salida, fecha oculta, señales sin leyenda,
  contraste bajo) y 3 preferencias. Nada rompe el uso; sí lo confunden.
- **Datos** → [`datos.md`](datos.md). El almacén real está sano. 2 riesgos medios
  latentes (doble conteo por bordes de medianoche entre fuentes; liga del equipo
  fijada por el primer registro) y detalles menores. Ninguna promesa de la UI
  carece de respaldo en el modelo.

## 4. Plan priorizado

Máximo 8, por impacto sobre esfuerzo.

| # | Acción | Área | Esfuerzo |
|---|--------|------|----------|
| 1 | Mostrar `avisos` en el resultado de "Poblar" y renombrar el botón a "Poblando…/Continuar" | UX 1,8 | 15 min |
| 2 | En 401 de Actualizar/Poblar, recargar para volver al login | UX 2 | 10 min |
| 3 | Cerrar `/demo/access`: rate-limit + saneo de fórmulas CSV | Seg M1 | 45 min |
| 4 | No reenviar `Cookie`/`Authorization` en los proxies catch-all | Seg M2 | 20 min |
| 5 | Chips de fecha "Hoy / Mañana" + leyenda fija de chips y DOBLE | UX 3,5 | 40 min |
| 6 | Subir a `slate-400` los textos ≤12 px; chip de texto para "muestra corta"; `aria-expanded` | UX 4,7,9 | 30 min |
| 7 | Dedupe de historial por `(nombre, día chileno)` y bases por liga del partido | Datos | 40 min |
| 8 | Exigir `ALMACEN_TOKEN` sin fallback a `GITHUB_TOKEN`; escapar HTML en widget de banco | Seg M3,M4 | 30 min |

Los puntos 1, 2 y 5–6 son la cara visible para el dueño; 3 y 4 son la higiene de
seguridad; 7 y 8 son robustez a futuro. Todo cabe en una tarde.

## 5. Lo que está bien (no rehacer)

- **Autenticación y sesiones**: JWT HS256 fijo, cookies `httpOnly/secure/sameSite`,
  payloads de cliente y de `/Privado` disjuntos, `/Privado` con comparación de
  clave en tiempo constante.
- **Render seguro**: React auto-escapa nombres de equipos/ligas; sin
  `dangerouslySetInnerHTML` en la cartelera.
- **Almacén y cosecha**: todo-o-nada por día, solo días con partidos terminados,
  poblado que no pisa lo existente, lectores tolerantes que degradan a "sin datos".
- **Cruce por nombre**: exige 2 tokens comunes; evita unir equipos homónimos.
- **Tiempo y zona horaria**: todo en hora de Chile, horario de verano correcto,
  countdown sin desfase de hidratación.
- **Trazabilidad**: pie con hora de actualización y peticiones usadas; avisos
  operativos que dicen la acción a tomar.

Estos puntos son resultado de rondas previas de trabajo; una revisión posterior
no debería volver sobre ellos.
