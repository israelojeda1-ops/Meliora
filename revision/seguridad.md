# Auditoría de seguridad — Sitio público melioraadvisory.cl

Fecha: 2026-08-26. Alcance: sitio principal (Next.js estático en GitHub Pages),
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

### B1 — Correo personal expuesto como endpoint de formularios
Los cuatro formularios apuntan a `formsubmit.co/israelojeda1@gmail.com`, con el
correo personal visible en el HTML. FormSubmit permite usar un alias aleatorio
(se genera tras la primera confirmación) que oculta la dirección real y reduce
spam. Ideal: migrar a `contacto@melioraadvisory.cl` cuando exista (Email
Routing de Cloudflare pendiente) y usar el alias.

### B2 — Dependencia de terceros en el navegador
Las calculadoras e indicadores consultan `mindicador.cl` desde el cliente. Si
ese servicio cae o es comprometido, el impacto es de disponibilidad/exactitud,
no de intrusión (solo se leen números). La calculadora de honorarios tiene
fallback al valor del período; la página de indicadores muestra error honesto.
Riesgo aceptado y documentado; no requiere acción.

### B3 — Sin cabeceras de seguridad
GitHub Pages no permite configurar CSP, X-Frame-Options ni HSTS preload. Para
un sitio estático informativo el riesgo es bajo. Si algún día se migra de
hosting, agregarlas.

## Lo que está bien

- Repositorio sin secretos (verificado por barrido); `.env.example` solo con
  plantillas.
- Formularios con honeypot anti-spam.
- Sin `dangerouslySetInnerHTML` con datos de usuario (solo JSON-LD generado de
  constantes propias).
- Enlaces externos con `rel="noopener noreferrer"`.
