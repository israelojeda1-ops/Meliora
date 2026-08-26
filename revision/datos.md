# Auditoría de datos — Sitio público melioraadvisory.cl

Fecha: 2026-08-26. Alcance: parámetros legales de las calculadoras y promesas
de datos de la UI. El sitio no tiene base de datos propia; su "modelo de
datos" son los archivos de parámetros por período
(`src/lib/remuneraciones/parametros/`) y las APIs externas. La auditoría del
portal del 2026-08-08 queda en el historial git.

## Resumen

El motor de cálculo está validado contra evidencia real (liquidación de julio
2026, planilla de aportes de agosto, ejemplo oficial del SII) con 72
aserciones automatizadas. Los riesgos no son de cálculo sino de
**vigencia**: los parámetros son fotos mensuales que alguien debe actualizar.

## Hallazgos

### M1 — Sin proceso de actualización mensual de parámetros
Las calculadoras dependen de `2026-07.ts` / `2026-08.ts`. En septiembre, la
calculadora salarial seguirá mostrando "Agosto 2026" como período más
reciente: correcto pero envejeciendo. UF/UTM cambian cada mes; el SIS se
reajusta trimestralmente; las comisiones de AFP cambian sin calendario fijo.
**Acción:** instituir un rito mensual (copiar el archivo del período, poner
los valores de Previred, correr `npm run test:remuneraciones`, push). Son ~10
minutos; el diseño ya lo contempla, falta el hábito o un recordatorio.

### B1 — Datos con vigencia anual mezclados con mensuales
`retencionHonorarios` (anual) y `jornadaSemanal` (cambia en abril) viven en
los archivos mensuales. Funciona, pero al crear `2027-01` habrá que acordarse
de subir la retención a 16%. Mitigado con comentarios en el código; el test
del ejemplo SII fallaría si se copia mal hacia atrás, no hacia adelante.

### B2 — Valores no verificables de julio
El SIS de julio 2026 quedó en 1,62% (vigente desde abril según la
Superintendencia). No se encontró fuente que confirme si hubo reajuste
intermedio antes del cambio de régimen de agosto. Afecta solo al modo
empleador del período histórico julio — el caso de validación obligatorio
(modo trabajador) no lo usa. Riesgo bajo y acotado a un mes ya cerrado.

### B3 — Feriado proporcional sin festivos
La calculadora de finiquito convierte días hábiles a corridos saltando
sábados y domingos pero **no festivos** (un calendario de feriados chilenos
es mantención permanente). Está declarado en la UI y en el pie del desglose.
Decisión razonable para una herramienta referencial; dejarla explícita
también en el correo del desglose costaría poco.

### B4 — Dependencia de mindicador.cl sin monitoreo
Si la API cambia formato o muere, honorarios cae a su fallback (bien) y la
página de indicadores muestra error con enlace al SII (bien). Nadie se
enteraría hasta que un usuario reclame. Un chequeo ocasional manual basta al
tamaño actual.

## Verificaciones sin hallazgo

- Topes 90 UF / 135,2 UF calculados por período: coinciden peso a peso con
  los publicados por Previred para agosto ($3.678.639 / $5.526.134).
- Desglose del aporte patronal de agosto: coincide línea por línea con la
  planilla real del dueño (6,83% / $151.514) y con la lámina de Previred
  (SIS + expectativa de vida = 2,5%).
- Retención de honorarios 15,25%: coincide con el ejemplo oficial del SII
  ($1.000.000 → $847.500).
- Etiquetas de la página de indicadores: cada valor muestra su fecha real de
  la serie (la UTM muestra el primer día del mes, correcto para un valor
  mensual; el IPC se rotula "variación mensual", que es lo que entrega la
  serie).
- Los formularios de leads envían el desglose/respuestas junto al contacto:
  la promesa de la UI ("te contactamos con contexto") tiene respaldo.
