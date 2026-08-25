import type {
  CostoEmpleador,
  EntradaEmpleador,
  EntradaTrabajador,
  LiquidacionTrabajador,
  ParametrosPeriodo,
} from "./tipos.ts";

const r = Math.round;

/** Tope mensual de la gratificación legal: 4,75 ingresos mínimos anuales / 12. */
export function topeGratificacionMensual(p: ParametrosPeriodo): number {
  return r((4.75 * p.ingresoMinimo) / 12);
}

/**
 * Valor de la hora extraordinaria (recargo 50%) para sueldo mensual y
 * jornada semanal dadas: (sueldo/30) × 28 / (4 × jornada) × 1,5.
 */
export function valorHoraExtra(
  sueldoBase: number,
  p: ParametrosPeriodo
): number {
  return ((sueldoBase / 30) * 28 * 1.5) / (4 * p.jornadaSemanal);
}

export function impuestoUnico(
  baseTributable: number,
  p: ParametrosPeriodo
): number {
  if (baseTributable <= 0) return 0;
  const enUTM = baseTributable / p.utm;
  const tramo =
    p.tramosImpuesto.find((t) => enUTM <= t.hastaUTM) ??
    p.tramosImpuesto[p.tramosImpuesto.length - 1];
  return Math.max(0, r(baseTributable * tramo.factor - tramo.rebajaUTM * p.utm));
}

/** Motor directo bruto → líquido. Función pura: no depende de nada externo. */
export function calcularTrabajador(
  e: EntradaTrabajador,
  p: ParametrosPeriodo
): LiquidacionTrabajador {
  const sueldoBase = Math.max(0, e.sueldoBase || 0);
  const horas = Math.max(0, e.horasExtra || 0);
  const otrosImponibles = Math.max(0, e.otrosImponibles || 0);
  const colacion = Math.max(0, e.colacion || 0);
  const movilizacion = Math.max(0, e.movilizacion || 0);
  const otrosDescuentos = Math.max(0, e.otrosDescuentos || 0);

  const horasExtra = r(valorHoraExtra(sueldoBase, p) * horas);

  // 1–2. Haberes imponibles y gratificación legal
  const devengado = sueldoBase + horasExtra + otrosImponibles;
  let gratificacion = 0;
  if (e.modoGratificacion === "legal") {
    gratificacion = Math.min(r(devengado * 0.25), topeGratificacionMensual(p));
  } else if (e.modoGratificacion === "manual") {
    gratificacion = Math.max(0, e.gratificacionManual || 0);
  }
  const totalImponible = devengado + gratificacion;
  const totalNoImponible = colacion + movilizacion;

  // 3. Bases de cotización independientes (topes distintos)
  const topeImponible = r(p.topeImponibleUF * p.uf);
  const topeCesantia = r(p.topeCesantiaUF * p.uf);
  const baseCotizacion = Math.min(totalImponible, topeImponible);
  const baseCesantia = Math.min(totalImponible, topeCesantia);

  // 4. Descuentos del trabajador
  const afpDef = p.afps[e.afpKey];
  const afpTasa = afpDef ? afpDef.tasa : 0;
  const afp = r(baseCotizacion * (afpTasa / 100));
  const salud7 = r(baseCotizacion * 0.07);
  const cesantiaTrabajador = r(
    baseCesantia * (p.cesantia[e.contrato].trabajador / 100)
  );

  // 5. Adicional isapre: la parte del plan (UF) sobre el 7% legal.
  // No reduce la base tributable.
  let planIsapre = 0;
  let adicionalIsapre = 0;
  if (e.salud === "isapre" && e.planIsapreUF && e.planIsapreUF > 0) {
    planIsapre = r(e.planIsapreUF * p.uf);
    adicionalIsapre = Math.max(0, planIsapre - salud7);
  }

  // 6–7. Base tributable (resta el 7% legal, no el adicional) e impuesto
  const baseTributable = totalImponible - afp - salud7 - cesantiaTrabajador;
  const impuesto = impuestoUnico(baseTributable, p);

  // 8. Líquido: los no imponibles se suman al final, fuera de toda base
  const totalDescuentos =
    afp + salud7 + adicionalIsapre + cesantiaTrabajador + impuesto + otrosDescuentos;
  const liquido = totalImponible - totalDescuentos + totalNoImponible;

  return {
    sueldoBase,
    gratificacion,
    horasExtra,
    otrosImponibles,
    totalImponible,
    colacion,
    movilizacion,
    totalNoImponible,
    topeImponible,
    topeCesantia,
    baseCotizacion,
    baseCesantia,
    afpNombre: afpDef ? afpDef.nombre : "—",
    afpTasa,
    afp,
    salud7,
    planIsapre,
    adicionalIsapre,
    cesantiaTrabajador,
    baseTributable,
    impuesto,
    otrosDescuentos,
    totalDescuentos,
    liquido,
  };
}

/** Costo total de contratación para el empleador, sobre las bases topeadas. */
export function calcularEmpleador(
  e: EntradaEmpleador,
  p: ParametrosPeriodo
): CostoEmpleador {
  const liq = calcularTrabajador(e, p);
  const recargo = Math.max(0, e.mutualRecargo || 0);
  const mutualTasa = p.mutualBase + recargo;

  const cesantiaEmpleador = r(
    liq.baseCesantia * (p.cesantia[e.contrato].empleador / 100)
  );
  const mutual = r(liq.baseCotizacion * (mutualTasa / 100));
  const aportesPension = p.aportesPension.map((a) => ({
    ...a,
    monto: r(liq.baseCotizacion * (a.tasa / 100)),
  }));

  const totalAportes =
    cesantiaEmpleador +
    mutual +
    aportesPension.reduce((sum, a) => sum + a.monto, 0);
  const costoTotal = liq.totalImponible + liq.totalNoImponible + totalAportes;

  return {
    liquidacion: liq,
    cesantiaEmpleador,
    mutualTasa,
    mutual,
    aportesPension,
    totalAportes,
    costoTotal,
    proporcionLiquido: costoTotal > 0 ? liq.liquido / costoTotal : 0,
  };
}
