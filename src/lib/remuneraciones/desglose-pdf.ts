// Desglose del sueldo en bloques para el PDF.
//
// Lo usan la calculadora de remuneraciones y la que despeja desde el líquido:
// ambas muestran lo mismo (liquidación del trabajador y costo de la empresa),
// así que el armado vive una sola vez acá.

import type { Bloque, FilaPDF } from "../pdf.ts";
import { topeGratificacionMensual, valorHoraExtra } from "./motor.ts";
import type {
  CostoEmpleador,
  ModoGratificacion,
  ParametrosPeriodo,
  SistemaSalud,
  TipoContrato,
} from "./tipos.ts";

const fmt = (n: number) => `$${Math.round(n).toLocaleString("es-CL")}`;
const pct = (n: number) => `${n.toLocaleString("es-CL", { maximumFractionDigits: 2 })}%`;
const uf = (n: number) =>
  n.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Las tres cifras que la persona vino a buscar, arriba del todo. */
export function tarjetas(costo: CostoEmpleador): Bloque {
  const liq = costo.liquidacion;
  return {
    tipo: "kpis",
    items: [
      { etiqueta: "Sueldo líquido", valor: fmt(liq.liquido), estilo: "emerald" },
      { etiqueta: "Costo para la empresa", valor: fmt(costo.costoTotal), estilo: "navy" },
      {
        etiqueta: "Llega al trabajador",
        valor: `${Math.round(costo.proporcionLiquido * 100)}%`,
        nota: "del costo total",
        estilo: "suave",
      },
    ],
  };
}

/** Haberes, descuentos y líquido: el detalle de la liquidación. */
export function panelesLiquidacion(
  costo: CostoEmpleador,
  p: ParametrosPeriodo,
  etiquetaOtrosImponibles = "Otros haberes imponibles"
): Bloque[] {
  const liq = costo.liquidacion;
  const bloques: Bloque[] = [];

  const haberes: FilaPDF[] = [{ etiqueta: "Sueldo base", valor: fmt(liq.sueldoBase) }];
  if (liq.horasExtra > 0)
    haberes.push({ etiqueta: "Horas extra (50%)", valor: fmt(liq.horasExtra) });
  if (liq.gratificacion > 0)
    haberes.push({ etiqueta: "Gratificación", valor: fmt(liq.gratificacion) });
  if (liq.otrosImponibles > 0)
    haberes.push({ etiqueta: etiquetaOtrosImponibles, valor: fmt(liq.otrosImponibles) });
  // Los no imponibles cuelgan del panel, después del subtotal: se pagan, pero
  // no entran en el total imponible ni en ninguna base.
  const noImponibles: FilaPDF[] = [];
  if (liq.colacion > 0)
    noImponibles.push({
      etiqueta: "Colación",
      valor: fmt(liq.colacion),
      nota: "no imponible",
    });
  if (liq.movilizacion > 0)
    noImponibles.push({
      etiqueta: "Movilización",
      valor: fmt(liq.movilizacion),
      nota: "no imponible",
    });

  bloques.push({
    tipo: "panel",
    titulo: "Haberes",
    filas: haberes,
    total: { etiqueta: "Total imponible", valor: fmt(liq.totalImponible) },
    pie: noImponibles,
  });

  const descuentos: FilaPDF[] = [];
  if (liq.baseCotizacion < liq.totalImponible)
    descuentos.push({
      etiqueta: "Base de cotización",
      valor: fmt(liq.baseCotizacion),
      nota: `topeada en ${p.topeImponibleUF.toLocaleString("es-CL")} UF`,
    });
  descuentos.push({
    etiqueta: `AFP ${liq.afpNombre}`,
    valor: fmt(liq.afp),
    nota: pct(liq.afpTasa),
    negativo: true,
  });
  descuentos.push({
    etiqueta: "Salud legal",
    valor: fmt(liq.salud7),
    nota: "7%",
    negativo: true,
  });
  if (liq.adicionalIsapre > 0)
    descuentos.push({
      etiqueta: "Adicional isapre",
      valor: fmt(liq.adicionalIsapre),
      nota: `plan ${fmt(liq.planIsapre)}`,
      negativo: true,
    });
  if (liq.cesantiaTrabajador > 0)
    descuentos.push({
      etiqueta: "Seguro de cesantía",
      valor: fmt(liq.cesantiaTrabajador),
      nota: `sobre ${fmt(liq.baseCesantia)}`,
      negativo: true,
    });
  descuentos.push({
    etiqueta: "Impuesto único",
    valor: fmt(liq.impuesto),
    nota: `base ${fmt(liq.baseTributable)}`,
    negativo: true,
  });
  if (liq.otrosDescuentos > 0)
    descuentos.push({
      etiqueta: "Otros descuentos",
      valor: fmt(liq.otrosDescuentos),
      negativo: true,
    });
  bloques.push({
    tipo: "panel",
    titulo: "Descuentos del trabajador",
    filas: descuentos,
    total: { etiqueta: "Total descuentos", valor: fmt(liq.totalDescuentos), negativo: true },
  });

  bloques.push({ tipo: "destacado", etiqueta: "Sueldo líquido", valor: fmt(liq.liquido) });
  return bloques;
}

/** Lo que la empresa paga por sobre el sueldo, y el costo total. */
export function panelesCostoEmpresa(
  costo: CostoEmpleador,
  p: ParametrosPeriodo,
  contrato: TipoContrato
): Bloque[] {
  const liq = costo.liquidacion;
  const aportes: FilaPDF[] = [
    {
      etiqueta: "Seguro de cesantía",
      valor: fmt(costo.cesantiaEmpleador),
      nota: pct(p.cesantia[contrato].empleador),
    },
    {
      etiqueta: "ISL / Mutual",
      valor: fmt(costo.mutual),
      nota: `ley 16.744, ${pct(costo.mutualTasa)}`,
    },
    ...costo.aportesPension.map((a) => ({
      etiqueta: a.nombre,
      valor: fmt(a.monto),
      nota: pct(a.tasa),
    })),
  ];
  const tasaPatronal =
    p.cesantia[contrato].empleador +
    costo.mutualTasa +
    costo.aportesPension.reduce((s, a) => s + a.tasa, 0);

  return [
    {
      tipo: "panel",
      titulo: "Aportes de cargo del empleador",
      filas: aportes,
      total: {
        etiqueta: "Total aporte patronal",
        valor: fmt(costo.totalAportes),
        nota: pct(tasaPatronal),
      },
    },
    {
      tipo: "destacado",
      etiqueta: "Costo total de contratación",
      valor: fmt(costo.costoTotal),
      estilo: "navy",
    },
    {
      tipo: "barra",
      proporcion: costo.proporcionLiquido,
      texto: `De cada ${fmt(costo.costoTotal)} que paga la empresa, al bolsillo del trabajador llegan ${fmt(liq.liquido)}: ${Math.round(costo.proporcionLiquido * 100)}%. El resto son cotizaciones e impuestos.`,
      izquierda: "Líquido del trabajador",
      derecha: "Cotizaciones e impuestos",
    },
  ];
}

/** Todo lo que entró al cálculo, para que el número se pueda auditar. */
export function variablesDelCalculo({
  costo,
  p,
  contrato,
  salud,
  modoGratificacion,
  horas,
  mutualRecargo,
}: {
  costo: CostoEmpleador;
  p: ParametrosPeriodo;
  contrato: TipoContrato;
  salud: SistemaSalud;
  modoGratificacion: ModoGratificacion;
  horas: number;
  mutualRecargo: number;
}): Bloque {
  const liq = costo.liquidacion;
  const enUTM = liq.baseTributable / p.utm;
  const tramo =
    p.tramosImpuesto.find((t) => enUTM <= t.hastaUTM) ??
    p.tramosImpuesto[p.tramosImpuesto.length - 1];

  const items: { etiqueta: string; valor: string }[] = [
    { etiqueta: "Valor UF del período", valor: `$${uf(p.uf)}` },
    { etiqueta: "Valor UTM del período", valor: fmt(p.utm) },
    { etiqueta: "Ingreso mínimo mensual", valor: fmt(p.ingresoMinimo) },
    { etiqueta: "Jornada semanal legal", valor: `${p.jornadaSemanal} horas` },
    {
      etiqueta: `Tope imponible AFP y salud (${p.topeImponibleUF.toLocaleString("es-CL")} UF)`,
      valor: fmt(liq.topeImponible),
    },
    {
      etiqueta: `Tope imponible cesantía (${p.topeCesantiaUF.toLocaleString("es-CL")} UF)`,
      valor: fmt(liq.topeCesantia),
    },
    { etiqueta: `AFP ${liq.afpNombre}`, valor: pct(liq.afpTasa) },
    {
      etiqueta: salud === "isapre" ? "Isapre, plan pactado" : "Fonasa",
      valor: salud === "isapre" ? fmt(liq.planIsapre) : "7%",
    },
    {
      etiqueta: "Gratificación",
      valor:
        modoGratificacion === "legal"
          ? "legal, 25%"
          : modoGratificacion === "manual"
            ? "pactada"
            : "no paga",
    },
    {
      etiqueta: "Tope mensual gratificación legal",
      valor: fmt(topeGratificacionMensual(p)),
    },
    {
      etiqueta: "Tipo de contrato",
      valor: contrato === "indefinido" ? "Indefinido" : "Plazo fijo",
    },
    { etiqueta: "Cesantía, parte trabajador", valor: pct(p.cesantia[contrato].trabajador) },
    { etiqueta: "Cesantía, parte empleador", valor: pct(p.cesantia[contrato].empleador) },
    { etiqueta: "Mutual, cotización base", valor: pct(p.mutualBase) },
    { etiqueta: "Mutual, recargo por riesgo", valor: pct(mutualRecargo) },
    ...costo.aportesPension.map((a) => ({ etiqueta: a.nombre, valor: pct(a.tasa) })),
    {
      etiqueta: "Salud que rebaja el impuesto",
      valor: fmt(liq.saludRebajable),
    },
    { etiqueta: "Base tributable", valor: fmt(liq.baseTributable) },
    { etiqueta: "Tramo de impuesto único", valor: pct(tramo.factor * 100) },
    { etiqueta: "Rebaja del tramo", valor: fmt(tramo.rebajaUTM * p.utm) },
  ];

  if (horas > 0) {
    items.push({ etiqueta: "Horas extra del mes", valor: `${horas}` });
    items.push({
      etiqueta: "Valor de la hora extra",
      valor: fmt(valorHoraExtra(liq.sueldoBase, p)),
    });
  }

  return { tipo: "parametros", titulo: "Variables del cálculo", items };
}
