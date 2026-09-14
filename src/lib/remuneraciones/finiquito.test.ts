/**
 * Tests del motor de finiquito. Sin dependencias:
 *   npm run test:finiquito
 */
import {
  calcularFiniquito,
  habilesACorridos,
  recargoDespidoInjustificado,
} from "./finiquito.ts";
import { parametros202608 as agosto } from "./parametros/2026-08.ts";

let fallas = 0;

function eq(nombre: string, actual: number, esperado: number) {
  if (actual === esperado) {
    console.log(`  ✓ ${nombre}: ${actual.toLocaleString("es-CL")}`);
  } else {
    fallas++;
    console.error(
      `  ✗ ${nombre}: se obtuvo ${actual.toLocaleString("es-CL")}, se esperaba ${esperado.toLocaleString("es-CL")}`
    );
  }
}

function ok(nombre: string, cond: boolean) {
  if (cond) {
    console.log(`  ✓ ${nombre}`);
  } else {
    fallas++;
    console.error(`  ✗ ${nombre}`);
  }
}

// ── Feriado: conversión hábiles → corridos debe saltarse los festivos ──
console.log("\nFeriado — hábiles a corridos, ventana que cruza el 18 de septiembre");
{
  // Sin festivos de por medio (misma cantidad de hábiles, ventana anterior).
  eq("5 hábiles desde el 10-09-2026 (sin festivo)", habilesACorridos(5, "2026-09-10"), 7);
  // Con el fix: el 18 de septiembre (viernes, feriado) no cuenta como hábil,
  // y el 19 (sábado) tampoco: el 6° día hábil cae recién el lunes 21.
  eq(
    "6 hábiles desde el 10-09-2026 (cruza Fiestas Patrias)",
    habilesACorridos(6, "2026-09-10"),
    11
  );
}

// ── Caso 1: mes completo, necesidades de la empresa, sin aviso previo ──
console.log("\nFiniquito — mes completo, necesidades de la empresa, sin aviso previo");
{
  const f = calcularFiniquito(
    {
      sueldoBase: 1500000,
      modoGratificacion: "ninguna",
      fechaInicio: "2020-03-01",
      fechaTermino: "2026-08-31",
      causal: "necesidades_empresa",
      avisoPrevio: false,
    },
    agosto
  );
  eq("Días pendientes del mes", f.diasPendientesMes, 30);
  eq("Sueldo proporcional", f.sueldoProporcional, 1500000);
  eq("Gratificación proporcional (sin gratificación pactada)", f.gratificacionProporcional, 0);
  eq("Años computables", f.aniosComputables, 6);
  eq("Indemnización años de servicio", f.indemnizacionAnios, 9000000);
  eq("Indemnización aviso previo", f.indemnizacionAviso, 1500000);
  eq("Feriado días hábiles (×100)", Math.round(f.feriadoDiasHabiles * 100), 754);
  eq("Feriado días corridos (×100)", Math.round(f.feriadoDiasCorridos * 100), 954);
  eq("Feriado proporcional", f.feriadoMonto, 477000);
  eq("Total exento (indemnizaciones)", f.totalExento, 10500000);
  eq("Total tributable (pendientes + feriado)", f.totalTributable, 1977000);
  eq("Total finiquito", f.total, 12477000);

  const recargo = recargoDespidoInjustificado(
    "necesidades_empresa",
    f.aniosComputables * f.baseIndemnizacion
  );
  ok("Recargo aplica para necesidades de la empresa", recargo !== null);
  eq("Recargo 30% por despido injustificado", recargo!.monto, 2700000);
}

// ── Caso 2: renuncia voluntaria, mismas fechas (sin indemnización) ──
console.log("\nFiniquito — renuncia voluntaria (remuneraciones pendientes + feriado)");
{
  const f = calcularFiniquito(
    {
      sueldoBase: 1500000,
      modoGratificacion: "ninguna",
      fechaInicio: "2020-03-01",
      fechaTermino: "2026-08-31",
      causal: "renuncia",
    },
    agosto
  );
  eq("Indemnización años (renuncia)", f.indemnizacionAnios, 0);
  eq("Indemnización aviso (renuncia)", f.indemnizacionAviso, 0);
  eq("Sueldo proporcional", f.sueldoProporcional, 1500000);
  eq("Feriado proporcional", f.feriadoMonto, 477000);
  eq("Total exento", f.totalExento, 0);
  eq("Total = pendientes + feriado", f.total, 1977000);

  const recargo = recargoDespidoInjustificado(
    "renuncia",
    f.aniosComputables * f.baseIndemnizacion
  );
  ok("Recargo aplica si la renuncia se usó para encubrir un despido", recargo !== null);
  eq("Recargo 50% (causal art. 159 mal invocada)", recargo!.monto, 4500000);
}

// ── Caso 3: topes de 90 UF y 11 años ──
console.log("\nFiniquito — topes: 90 UF de base y 11 años");
{
  const f = calcularFiniquito(
    {
      sueldoBase: 5000000,
      modoGratificacion: "ninguna",
      fechaInicio: "2010-01-01",
      fechaTermino: "2026-06-30",
      causal: "necesidades_empresa",
      avisoPrevio: true,
    },
    agosto
  );
  eq("Años de servicio reales", f.aniosServicio, 16);
  eq("Años computables (tope 11)", f.aniosComputables, 11);
  eq("Base topeada (90 UF)", f.baseIndemnizacion, 3678639);
  eq("Indemnización años", f.indemnizacionAnios, 40465029);
  eq("Aviso previo dado (sin pago)", f.indemnizacionAviso, 0);
  eq("Sueldo proporcional (mes completo)", f.sueldoProporcional, 5000000);
  eq("Feriado proporcional", f.feriadoMonto, 1583333);
  eq("Total finiquito", f.total, 47048362);
}

// ── Caso 4: gratificación legal mensual, mes parcial ──
console.log("\nFiniquito — gratificación legal mensual, término a mitad de mes");
{
  const f = calcularFiniquito(
    {
      sueldoBase: 900000,
      modoGratificacion: "legal",
      fechaInicio: "2024-01-15",
      fechaTermino: "2026-08-20",
      causal: "renuncia",
    },
    agosto
  );
  eq("Días pendientes del mes", f.diasPendientesMes, 20);
  eq("Sueldo proporcional", f.sueldoProporcional, 600000);
  eq("Gratificación proporcional (25% topeada y prorrateada)", f.gratificacionProporcional, 146077);
  eq("Total remuneraciones pendientes", f.totalRemuneracionesPendientes, 746077);
  eq("Feriado proporcional", f.feriadoMonto, 390000);
  eq("Total finiquito", f.total, 1136077);
}

// ── Caso 5: invalidez del trabajador (art. 161 bis, sin exigir aviso previo) ──
console.log("\nFiniquito — invalidez del trabajador");
{
  const f = calcularFiniquito(
    {
      sueldoBase: 1000000,
      modoGratificacion: "ninguna",
      fechaInicio: "2023-01-01",
      fechaTermino: "2026-01-01",
      causal: "invalidez",
    },
    agosto
  );
  ok("Aplica indemnización por invalidez", f.aplicaIndemnizacion);
  eq("Años computables", f.aniosComputables, 3);
  eq("Indemnización años de servicio", f.indemnizacionAnios, 3000000);
  eq("Sin indemnización sustitutiva de aviso previo (no la exige el art. 161 bis)", f.indemnizacionAviso, 0);
  eq("Total finiquito", f.total, 3034666);
}

// ── Caso 6: causa imputable al trabajador (art. 160, sin indemnización) ──
console.log("\nFiniquito — despido por causa imputable al trabajador (art. 160)");
{
  const f = calcularFiniquito(
    {
      sueldoBase: 800000,
      modoGratificacion: "ninguna",
      fechaInicio: "2024-06-01",
      fechaTermino: "2026-06-15",
      causal: "conducta_trabajador",
    },
    agosto
  );
  ok("No aplica indemnización por conducta del trabajador", !f.aplicaIndemnizacion);
  eq("Indemnización años", f.indemnizacionAnios, 0);
  eq("Sueldo proporcional", f.sueldoProporcional, 400000);
  eq("Feriado proporcional (igual procede, art. 73)", f.feriadoMonto, 16800);
  eq("Total finiquito", f.total, 416800);

  const recargo = recargoDespidoInjustificado(
    "conducta_trabajador",
    500000 * 6 // hipotético, solo para validar el porcentaje
  );
  eq("Recargo 80% si la causal del art. 160 no se prueba", recargo!.porcentaje * 100, 80);
}

// ── Caso 7: horas extra habituales y gratificación convencional (manual) ──
console.log("\nFiniquito — horas extra habituales y gratificación convencional");
{
  const f = calcularFiniquito(
    {
      sueldoBase: 1000000,
      horasExtraPromedio: 100000,
      modoGratificacion: "manual",
      gratificacionManual: 150000,
      fechaInicio: "2022-02-01",
      fechaTermino: "2026-02-10",
      causal: "necesidades_empresa",
      avisoPrevio: true,
    },
    agosto
  );
  eq("Días pendientes del mes", f.diasPendientesMes, 10);
  eq("Sueldo proporcional", f.sueldoProporcional, 333333);
  eq("Horas extra proporcional", f.horasExtraProporcional, 33333);
  eq("Gratificación proporcional (convencional, prorrateada)", f.gratificacionProporcional, 50000);
  eq("Total remuneraciones pendientes", f.totalRemuneracionesPendientes, 416666);
  eq(
    "Base de indemnización incluye horas extra habituales (Corte Suprema 28-04-2026)",
    f.remuneracionBaseIndemnizacion,
    1250000
  );
  eq("Indemnización años de servicio", f.indemnizacionAnios, 5000000);
  eq("Feriado proporcional", f.feriadoMonto, 14000);
  eq("Total finiquito", f.total, 5430666);
}

if (fallas > 0) {
  console.error(`\n${fallas} prueba(s) fallaron`);
  process.exit(1);
}
console.log("\nTodas las pruebas pasaron ✔");
