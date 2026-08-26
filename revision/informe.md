# Informe consolidado — Sitio público melioraadvisory.cl

Fecha: 2026-08-26. Tres auditorías (seguridad, UX, datos) sobre el sitio
público y sus calculadoras, con foco pedido por el dueño: *"se ve muy IA
generada, ¿qué podríamos hacer?"*. Diagnóstico, sin cambios de código. (El
informe anterior, 2026-08-08, cubría el portal y queda en el historial git.)

## 1. Estado general

La ingeniería está sólida: motor de cálculo validado contra liquidaciones y
planillas reales con 72 aserciones, sin secretos en el repo, deploy
autoestable y un embudo completo (tráfico → herramientas → leads). La
debilidad principal es exactamente la que intuye el dueño: el sitio no
muestra **ninguna evidencia humana** — cero fotos, fundador anónimo, métricas
sin dueño — y eso lo hace indistinguible de un sitio fabricado. Nada impide
operar hoy; lo que está en juego es conversión y credibilidad, no
funcionamiento.

## 2. Bloqueantes

**No hay bloqueantes técnicos.** Dos asuntos deben resolverse pronto aunque
no detienen la operación:

- **Log de demo con datos personales en repo público** (seguridad M1): dejar
  de escribirlo aquí y sacar el archivo.
- **Captura de leads sin política de privacidad** (seguridad M2): publicar
  `/privacidad` antes de invertir en atraer más tráfico.

## 3. Hallazgos por área

- **Seguridad** → [`seguridad.md`](seguridad.md). Sin críticas ni altas. 2
  medias (PII en repo público; sin política de privacidad) y 3 bajas (correo
  personal como endpoint, dependencia de mindicador, sin cabeceras en Pages).
- **UX** → [`ux.md`](ux.md). El foco del dueño, confirmado con evidencia: 0
  imágenes reales en el sitio, fundador sin nombre, 31 repeticiones del mismo
  patrón de tarjeta, 43 guiones largos, tipografía por defecto. 6 causas
  identificadas, cada una con su corrección.
- **Datos** → [`datos.md`](datos.md). Motor validado; el riesgo es de
  **vigencia**: falta el rito mensual de actualizar parámetros. 1 media y 3
  bajas.

## 4. Plan priorizado

1. **Nombre + foto del fundador en `/nosotros`** — el mayor golpe de
   credibilidad por el menor esfuerzo. *Necesita del dueño: 1 foto y firmar
   con nombre.* (½ día)
2. **Capturas reales del portal/dashboards en home y servicios** — mostrar el
   producto que ya existe. *Necesita: screenshots con datos difuminados.* (½ día)
3. **Política de privacidad `/privacidad`** enlazada desde footer y
   formularios. (½ día)
4. **Anclar o podar las métricas 40/30/20/25%** + 1–2 testimonios aunque sean
   anónimos con cargo y rubro. *Necesita del dueño: los casos.* (½ día)
5. **Pasada de copy anti-plantilla**: mitad de los guiones largos, CTAs
   variados, 2–3 frases con voz propia por página. (1 día)
6. **Sacar el log de demo del repo público** y cerrar `/demo/access`
   (pendiente desde la auditoría anterior). (½ día)
7. **Tipografía display para títulos** + romper el patrón de tarjetas en una
   sección de la home. (1 día)
8. **Rito mensual de parámetros**: checklist de 10 minutos con los valores de
   Previred + tests. Agendarlo, no confiar en la memoria. (1 hora + hábito)

Los puntos 1, 2 y 4 son los que atacan directamente el "se ve IA generada";
requieren material que solo el dueño puede aportar. El resto es ejecutable de
inmediato.

## 5. Lo que está bien (no tocar)

- El motor de remuneraciones y sus tests: validados contra evidencia real;
  cualquier cambio debe pasar por `npm run test:remuneraciones`.
- La arquitectura de parámetros por período: es el diseño correcto, solo
  falta el hábito de alimentarla.
- El embudo (indicadores/recursos → calculadoras → diagnóstico → contacto) y
  el SEO técnico (metadata, JSON-LD, sitemap): completos y coherentes.
- El pipeline de deploy autoestable (espera al build legacy) y el silencio de
  Vercel en PRs que no tocan el portal.
- La paleta navy/emerald y la consistencia visual: el problema es la falta de
  evidencia humana, no el sistema de diseño.
