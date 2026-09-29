# Auditoría de seguridad — Sitio público melioraadvisory.cl

Fecha: 2026-08-26. Alcance: sitio principal (Next.js estático servido por Caddy en el VPS),
calculadoras y captura de leads. La auditoría del portal del 2026-08-08 sigue
vigente y queda en el historial git de este archivo.

## Resumen

Sin hallazgos críticos ni altos. El sitio es estático (sin backend propio que
atacar), sin secretos en el repositorio, con honeypot en los formularios. Los
hallazgos son de privacidad y de higiene, no de intrusión.

## Hallazgos

### M1 — Datos personales en repositorio público
`data/demo_access_log.csv` acumula nombre, correo e IP de quienes piden acceso
a la demo del portal, y **el repositorio es público**: cualquier persona puede
leer ese archivo y su historial completo. Hoy tiene 3 registros (2 son del
propio dueño), pero el mecanismo seguirá acumulando datos de terceros en un
lugar expuesto. Se cruza con el hallazgo M1 de la auditoría del portal
(`/demo/access` público y sin límite).
**Acción:** dejar de escribir el log en este repo (moverlo a un repo privado o
a otro almacenamiento), borrar el archivo y, dado que el historial git lo
conserva, evaluar hacer privado el repositorio o reescribir el historial.

### M2 — Captura de leads sin política de privacidad
El sitio recolecta nombre, correo, teléfono, empresa y respuestas de
diagnóstico (FormSubmit + Google Analytics), y no existe página de política de
privacidad ni aviso de tratamiento de datos. Con la nueva ley chilena de
protección de datos (21.719, en vigencia gradual) y siendo una firma de
asesoría, es una brecha de cumplimiento y de imagen profesional.
**Acción:** publicar `/privacidad` (qué se recolecta, para qué, cómo pedir
eliminación) y enlazarla desde el footer y los formularios.

### B1 — Correo personal expuesto como endpoint de formularios — RESUELTO
Los formularios apuntaban a `formsubmit.co/israelojeda1@gmail.com`, con el
correo personal a la vista en el HTML y con el envío dependiendo de un tercero
que además se cayó (respondía 500). Ahora los seis formularios (contacto,
diagnóstico y las cuatro calculadoras) envían a `/api/formularios`, una ruta del
portal. El correo sale de `contacto@melioraadvisory.cl` por SMTP propio y cada
envío queda registrado en la tabla `formularios` de la base del portal.

Los formularios apuntan a la URL absoluta del portal
(`portal.melioraadvisory.cl/api/formularios`) y no a una ruta relativa del sitio:
el sitio es un export estático y no tiene backend que responda `/api`, así que
la ruta relativa devolvía 404 y ningún envío llegaba. Si algún día se agrega al
bloque de Caddy de `melioraadvisory.cl` un `handle /api/formularios*` que lo
reenvíe al portal (127.0.0.1:3011), se puede volver a la ruta relativa cambiando
solo `src/lib/formularios.ts`.

De paso se corrigió algo que el sitio prometía y no cumplía: las calculadoras
dicen «recibe este desglose en tu correo», pero FormSubmit solo avisaba a
Israel y la persona nunca recibía nada. Ahora recibe su copia.

**Riesgo nuevo que esto introduce:** el servidor envía correo a una dirección
que escribe cualquiera, así que podría usarse para mandar texto arbitrario a
terceros desde el dominio. Mitigaciones en la ruta: campo trampa `_honey`,
límite de 5 envíos cada 10 minutos por IP (contados en la tabla, con respaldo en
memoria si la base no responde), validación del formato del correo, recorte de
los campos (300 caracteres, 5.000 para el desglose) y redirección solo a URLs de
`melioraadvisory.cl`. El cuerpo del correo a la persona es una plantilla fija:
lo que viene del formulario va escapado y dentro de un bloque, no arma el
mensaje. Queda como riesgo residual aceptado y conviene revisar la tabla
`formularios` si aparece tráfico raro.

### B2 — Dependencia de terceros en el navegador
Las calculadoras e indicadores consultan `mindicador.cl` desde el cliente. Si
ese servicio cae o es comprometido, el impacto es de disponibilidad/exactitud,
no de intrusión (solo se leen números). La calculadora de honorarios tiene
fallback al valor del período; la página de indicadores muestra error honesto.
Riesgo aceptado y documentado; no requiere acción.

### B3 — Sin cabeceras de seguridad
El sitio se sirve sin CSP, X-Frame-Options ni HSTS preload. Para un sitio
estático informativo el riesgo es bajo, pero ahora que lo publica Caddy en el
VPS sí se pueden configurar: conviene agregarlas en el bloque del dominio.

## Lo que está bien

- Repositorio sin secretos (verificado por barrido); `.env.example` solo con
  plantillas.
- Formularios con honeypot anti-spam.
- Sin `dangerouslySetInnerHTML` con datos de usuario (solo JSON-LD generado de
  constantes propias).
- Enlaces externos con `rel="noopener noreferrer"`.
