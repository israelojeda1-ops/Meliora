import type { ParametrosPeriodo } from "./tipos.ts";

export type CausalTermino =
  | "necesidades_empresa"
  | "renuncia"
  | "mutuo_acuerdo"
  | "vencimiento_plazo";

export interface EntradaFiniquito {
  /** Última remuneración mensual imponible */
  remuneracion: number;
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
  aniosServicio: number;
  aniosComputables: number;
  topeRemuneracion: number;
  baseIndemnizacion: number;
  indemnizacionAnios: number;
  indemnizacionAviso: number;
  feriadoDiasHabiles: number;
  feriadoDiasCorridos: number;
  feriadoMonto: number;
  total: number;
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

/**
 * Días corridos que cubren una cantidad de días hábiles de feriado,
 * contando desde el día siguiente al término (sábados y domingos
 * inhábiles; festivos no considerados).
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
    if (dow !== 0 && dow !== 6) contados += 1;
  }
  return corridos + fraccion;
}

export function calcularFiniquito(
  e: EntradaFiniquito,
  p: ParametrosPeriodo
): ResultadoFiniquito {
  const remuneracion = Math.max(0, Math.round(e.remuneracion || 0));
  const inicio = parseISO(e.fechaInicio);
  const termino = parseISO(e.fechaTermino);

  // Años de servicio: fracción superior a 6 meses cuenta como año completo;
  // tope legal de 11 años (art. 163 CdT, contratos desde el 14-08-1981).
  const { meses } = mesesYDias(inicio, termino);
  let anios = Math.floor(meses / 12);
  if (meses % 12 > 6) anios += 1;
  const aniosComputables = Math.min(Math.max(0, anios), 11);

  // Base de indemnización: última remuneración con tope de 90 UF (art. 172).
  const topeRemuneracion = Math.round(p.topeImponibleUF * p.uf);
  const baseIndemnizacion = Math.min(remuneracion, topeRemuneracion);

  const esNecesidades = e.causal === "necesidades_empresa";
  const indemnizacionAnios = esNecesidades
    ? aniosComputables * baseIndemnizacion
    : 0;
  const indemnizacionAviso =
    esNecesidades && !e.avisoPrevio ? baseIndemnizacion : 0;

  // Feriado proporcional: 1,25 días hábiles por mes desde el último
  // aniversario, más vacaciones devengadas pendientes. Se paga en días
  // corridos contados desde el día siguiente al término.
  const aniversarios = Math.floor(meses / 12);
  const desdeAniversario = new Date(inicio);
  desdeAniversario.setMonth(desdeAniversario.getMonth() + aniversarios * 12);
  const prop = mesesYDias(desdeAniversario, termino);
  const habilesProporcional =
    prop.meses * 1.25 + (prop.dias / 30) * 1.25;
  const feriadoDiasHabiles =
    Math.round((habilesProporcional + Math.max(0, e.vacacionesPendientesDias || 0)) * 100) / 100;
  const feriadoDiasCorridos =
    Math.round(habilesACorridos(feriadoDiasHabiles, e.fechaTermino) * 100) / 100;
  const feriadoMonto = Math.round((remuneracion / 30) * feriadoDiasCorridos);

  return {
    aniosServicio: Math.floor(meses / 12),
    aniosComputables,
    topeRemuneracion,
    baseIndemnizacion,
    indemnizacionAnios,
    indemnizacionAviso,
    feriadoDiasHabiles,
    feriadoDiasCorridos,
    feriadoMonto,
    total: indemnizacionAnios + indemnizacionAviso + feriadoMonto,
  };
}
