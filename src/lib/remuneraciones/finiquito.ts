import type { ModoGratificacion, ParametrosPeriodo } from "./tipos.ts";
import { topeGratificacionMensual } from "./motor.ts";
import { esFeriadoChile } from "./feriados-chile.ts";

/**
 * Causales de término de contrato (Código del Trabajo). Cada una determina
 * si corresponde indemnización por años de servicio y aviso previo:
 *
 * - art. 159 (necesidades_empresa NO incluida aquí, va por art. 161):
 *   mutuo_acuerdo, renuncia, vencimiento_plazo, conclusion_trabajo_caso_fortuito
 *   → sin indemnización, sin aviso previo.
 * - art. 160 (conducta_trabajador): falta de probidad, conducta indebida
 *   grave, etc. → sin indemnización.
 * - art. 161 (necesidades_empresa): con indemnización años de servicio y,
 *   si no hubo aviso con 30 días, indemnización sustitutiva.
 * - art. 161 bis (invalidez): con indemnización años de servicio, sin
 *   exigencia de aviso previo.
 */
export type CausalTermino =
  | "necesidades_empresa"
  | "invalidez"
  | "renuncia"
  | "mutuo_acuerdo"
  | "vencimiento_plazo"
  | "conclusion_trabajo_caso_fortuito"
  | "conducta_trabajador";

const CAUSALES_CON_INDEMNIZACION: ReadonlySet<CausalTermino> = new Set([
  "necesidades_empresa",
  "invalidez",
]);

export interface EntradaFiniquito {
  /** Sueldo base mensual pactado (sin gratificación ni horas extra) */
  sueldoBase: number;
  /**
   * Promedio mensual de horas extraordinarias habituales (sobresueldo).
   * Si son habituales/permanentes se tratan como remuneración variable y
   * se incluyen en la base de las indemnizaciones (Corte Suprema, Cuarta
   * Sala, 28-04-2026, rol 54883-2024); las esporádicas no van aquí.
   */
  horasExtraPromedio?: number;
  /** Promedio de remuneración variable (comisiones) de los últimos 3 meses */
  remuneracionVariablePromedio?: number;
  /** legal: 25% del devengado con tope. manual: monto fijo pactado. ninguna: no recibe. */
  modoGratificacion: ModoGratificacion;
  /** Monto mensual pactado, solo si modoGratificacion === "manual" */
  gratificacionManual?: number;
  /** Fechas en formato ISO yyyy-mm-dd */
  fechaInicio: string;
  fechaTermino: string;
  causal: CausalTermino;
  /** Solo para necesidades de la empresa: ¿se dio aviso con 30 días? */
  avisoPrevio?: boolean;
  /** Días hábiles de vacaciones ya devengadas y no tomadas (períodos anteriores) */
  vacacionesPendientesDias?: number;
}

export interface ResultadoFiniquito {
  // Remuneraciones pendientes (art. 63: se deben íntegras y proporcionales)
  diasPendientesMes: number;
  sueldoProporcional: number;
  horasExtraProporcional: number;
  gratificacionProporcional: number;
  totalRemuneracionesPendientes: number;

  // Feriado proporcional (art. 73: procede sea cual sea la causal)
  aniosServicio: number;
  feriadoDiasHabiles: number;
  feriadoDiasCorridos: number;
  feriadoMonto: number;

  // Indemnizaciones (solo si la causal lo permite)
  aplicaIndemnizacion: boolean;
  aniosComputables: number;
  topeRemuneracion: number;
  remuneracionBaseIndemnizacion: number;
  baseIndemnizacion: number;
  indemnizacionAnios: number;
  indemnizacionAviso: number;

  total: number;
  /** Indemnizaciones: exentas de impuesto único hasta el tope legal (art. 178 LIR) */
  totalExento: number;
  /** Remuneraciones pendientes y feriado: tributan como renta normal */
  totalTributable: number;
}

function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Meses y días transcurridos entre dos fechas (fin inclusive). */
function mesesYDias(desde: Date, hasta: Date): { meses: number; dias: number } {
  let meses =
    (hasta.getFullYear() - desde.getFullYear()) * 12 +
    (hasta.getMonth() - desde.getMonth());
  let dias = hasta.getDate() - desde.getDate() + 1;
  if (dias < 0) {
    meses -= 1;
    const finMesAnterior = new Date(hasta.getFullYear(), hasta.getMonth(), 0);
    dias += finMesAnterior.getDate();
  }
  if (dias >= 30) {
    meses += Math.floor(dias / 30);
    dias = dias % 30;
  }
  return { meses: Math.max(0, meses), dias };
}

function aISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/**
 * Días corridos que cubren una cantidad de días hábiles de feriado,
 * contando desde el día siguiente al término. Son inhábiles los sábados,
 * domingos y festivos legales (el feriado siempre se paga en días corridos,
 * pero su duración se define en días hábiles).
 */
export function habilesACorridos(
  habiles: number,
  fechaTermino: string
): number {
  if (habiles <= 0) return 0;
  const enteros = Math.floor(habiles);
  const fraccion = habiles - enteros;
  let corridos = 0;
  let contados = 0;
  const d = parseISO(fechaTermino);
  while (contados < enteros) {
    d.setDate(d.getDate() + 1);
    corridos += 1;
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6 && !esFeriadoChile(aISO(d))) contados += 1;
  }
  return corridos + fraccion;
}

export function calcularFiniquito(
  e: EntradaFiniquito,
  p: ParametrosPeriodo
): ResultadoFiniquito {
  const sueldoBase = Math.max(0, Math.round(e.sueldoBase || 0));
  const horasExtraPromedio = Math.max(0, Math.round(e.horasExtraPromedio || 0));
  const remuneracionVariablePromedio = Math.max(
    0,
    Math.round(e.remuneracionVariablePromedio || 0)
  );
  const gratificacionManual = Math.max(0, Math.round(e.gratificacionManual || 0));
  const inicio = parseISO(e.fechaInicio);
  const termino = parseISO(e.fechaTermino);

  // 1) Remuneraciones pendientes del mes en curso (art. 63 CdT): se prorratean
  // el sueldo y las horas extra habituales por los días efectivamente
  // trabajados en el mes de término.
  const diasPendientesMes = Math.min(termino.getDate(), 30);
  const factorMes = diasPendientesMes / 30;
  const sueldoProporcional = Math.round(sueldoBase * factorMes);
  const horasExtraProporcional = Math.round(horasExtraPromedio * factorMes);
  const gratificacionProporcional =
    e.modoGratificacion === "legal"
      ? Math.min(
          Math.round((sueldoProporcional + horasExtraProporcional) * 0.25),
          Math.round(topeGratificacionMensual(p) * factorMes)
        )
      : e.modoGratificacion === "manual"
        ? Math.round(gratificacionManual * factorMes)
        : 0;
  const totalRemuneracionesPendientes =
    sueldoProporcional + horasExtraProporcional + gratificacionProporcional;

  // Años de servicio: fracción superior a 6 meses cuenta como año completo;
  // tope legal de 11 años (art. 163 CdT, contratos desde el 14-08-1981).
  const { meses } = mesesYDias(inicio, termino);
  const aniosServicio = Math.floor(meses / 12);
  let anios = aniosServicio;
  if (meses % 12 > 6) anios += 1;
  const aniosComputables = Math.min(Math.max(0, anios), 11);

  // 2) Feriado proporcional: 1,25 días hábiles por mes desde el último
  // aniversario, más vacaciones devengadas pendientes. Se paga en días
  // corridos contados desde el día siguiente al término. Procede con
  // cualquier causal, incluso las imputables al trabajador (art. 73).
  const desdeAniversario = new Date(inicio);
  desdeAniversario.setMonth(desdeAniversario.getMonth() + aniosServicio * 12);
  const prop = mesesYDias(desdeAniversario, termino);
  const habilesProporcional = prop.meses * 1.25 + (prop.dias / 30) * 1.25;
  const feriadoDiasHabiles =
    Math.round(
      (habilesProporcional + Math.max(0, e.vacacionesPendientesDias || 0)) * 100
    ) / 100;
  const feriadoDiasCorridos =
    Math.round(habilesACorridos(feriadoDiasHabiles, e.fechaTermino) * 100) / 100;
  const feriadoMonto = Math.round((sueldoBase / 30) * feriadoDiasCorridos);

  // 3) Indemnizaciones: solo si la causal lo permite (art. 161 / 161 bis).
  // Base = última remuneración mensual (art. 172): sueldo + gratificación
  // si se paga mensualmente + promedio de variable, con tope de 90 UF. Las
  // horas extra pagadas de forma habitual/permanente se tratan como
  // remuneración variable y se incluyen, promediadas, en esta base (Corte
  // Suprema, Cuarta Sala, 28-04-2026, rol 54883-2024: revierte el criterio
  // de exclusión absoluta que sostenían fallos de Cortes de Apelaciones).
  const aplicaIndemnizacion = CAUSALES_CON_INDEMNIZACION.has(e.causal);
  const gratificacionBaseIndemnizacion =
    e.modoGratificacion === "legal"
      ? Math.min(
          Math.round((sueldoBase + horasExtraPromedio) * 0.25),
          topeGratificacionMensual(p)
        )
      : e.modoGratificacion === "manual"
        ? gratificacionManual
        : 0;
  const remuneracionBaseIndemnizacion =
    sueldoBase +
    gratificacionBaseIndemnizacion +
    remuneracionVariablePromedio +
    horasExtraPromedio;
  const topeRemuneracion = Math.round(p.topeImponibleUF * p.uf);
  const baseIndemnizacion = Math.min(
    remuneracionBaseIndemnizacion,
    topeRemuneracion
  );

  const indemnizacionAnios = aplicaIndemnizacion
    ? aniosComputables * baseIndemnizacion
    : 0;
  const indemnizacionAviso =
    e.causal === "necesidades_empresa" && !e.avisoPrevio ? baseIndemnizacion : 0;

  const totalExento = indemnizacionAnios + indemnizacionAviso;
  const totalTributable = totalRemuneracionesPendientes + feriadoMonto;

  return {
    diasPendientesMes,
    sueldoProporcional,
    horasExtraProporcional,
    gratificacionProporcional,
    totalRemuneracionesPendientes,

    aniosServicio,
    feriadoDiasHabiles,
    feriadoDiasCorridos,
    feriadoMonto,

    aplicaIndemnizacion,
    aniosComputables,
    topeRemuneracion,
    remuneracionBaseIndemnizacion,
    baseIndemnizacion,
    indemnizacionAnios,
    indemnizacionAviso,

    total: totalTributable + totalExento,
    totalExento,
    totalTributable,
  };
}

/**
 * Recargo por despido injustificado, indebido o improcedente (art. 168 CdT).
 * Se entrega solo como referencia informativa: exige que un juicio laboral
 * declare la causal infundada, y se calcula sobre la indemnización por años
 * de servicio que habría correspondido de aplicarse el art. 161 (no sobre la
 * indemnización efectivamente pagada, que en estas causales es cero) —
 * `aniosComputables × baseIndemnizacion` del resultado del finiquito.
 */
export function recargoDespidoInjustificado(
  causal: CausalTermino,
  indemnizacionAniosHipotetica: number
): { porcentaje: number; monto: number } | null {
  if (causal === "necesidades_empresa") {
    return {
      porcentaje: 0.3,
      monto: Math.round(indemnizacionAniosHipotetica * 0.3),
    };
  }
  if (
    causal === "renuncia" ||
    causal === "mutuo_acuerdo" ||
    causal === "vencimiento_plazo" ||
    causal === "conclusion_trabajo_caso_fortuito"
  ) {
    return {
      porcentaje: 0.5,
      monto: Math.round(indemnizacionAniosHipotetica * 0.5),
    };
  }
  if (causal === "conducta_trabajador") {
    return {
      porcentaje: 0.8,
      monto: Math.round(indemnizacionAniosHipotetica * 0.8),
    };
  }
  return null;
}
