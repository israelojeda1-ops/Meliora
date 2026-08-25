/**
 * Tests del motor de remuneraciones. Sin dependencias:
 *   npm run test:remuneraciones
 */
import {
  calcularEmpleador,
  calcularTrabajador,
  impuestoUnico,
} from "./motor.ts";
import { parametros202607 as julio } from "./parametros/2026-07.ts";
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

// ── Caso obligatorio: liquidación real de julio 2026 ──
console.log("\nCaso obligatorio — liquidación real julio 2026 (isapre en UF)");
{
  const liq = calcularTrabajador(
    {
      sueldoBase: 5161047,
      modoGratificacion: "manual",
      gratificacionManual: 219115,
      afpKey: "provida", // 11,45%
      salud: "isapre",
      planIsapreUF: 6.958,
      contrato: "indefinido",
      colacion: 300000,
      movilizacion: 250000,
    },
    julio
  );
  eq("Total imponible", liq.totalImponible, 5380162);
  eq("Base topeada (90 UF)", liq.baseCotizacion, 3676031);
  eq("AFP (11,45%)", liq.afp, 420906);
  eq("Salud 7%", liq.salud7, 257322);
  eq("Adicional isapre", liq.adicionalIsapre, 26876);
  eq("Seguro de cesantía", liq.cesantiaTrabajador, 32281);
  eq("Base afecta a impuesto", liq.baseTributable, 4669653);
  eq("Impuesto único", liq.impuesto, 308699);
  eq("Líquido", liq.liquido, 4884078);

  // La gratificación del caso real coincide con el tope legal del período:
  const liqLegal = calcularTrabajador(
    {
      sueldoBase: 5161047,
      modoGratificacion: "legal",
      afpKey: "provida",
      salud: "isapre",
      planIsapreUF: 6.958,
      contrato: "indefinido",
      colacion: 300000,
      movilizacion: 250000,
    },
    julio
  );
  eq("Gratificación (tope legal)", liqLegal.gratificacion, 219115);
  eq("Líquido (gratificación legal)", liqLegal.liquido, 4884078);
}

// ── Modo empleador sobre el caso obligatorio ──
console.log("\nModo empleador — caso obligatorio (julio: SIS vía AFP + reforma 1%)");
{
  const c = calcularEmpleador(
    {
      sueldoBase: 5161047,
      modoGratificacion: "manual",
      gratificacionManual: 219115,
      afpKey: "provida",
      salud: "isapre",
      planIsapreUF: 6.958,
      contrato: "indefinido",
      colacion: 300000,
      movilizacion: 250000,
    },
    julio
  );
  eq("Cesantía empleador (2,4%)", c.cesantiaEmpleador, 129124);
  eq("ISL/Mutual (0,93%)", c.mutual, 34187);
  eq("SIS vía AFP (1,62%)", c.aportesPension[0].monto, 59552);
  eq("Capitalización individual (0,1%)", c.aportesPension[1].monto, 3676);
  eq("Expectativa de vida (0,9%)", c.aportesPension[2].monto, 33084);
  eq("Costo total de contratación", c.costoTotal, 6189785);
}

// ── Aporte patronal agosto 2026: replica planilla real (Previred) ──
console.log("\nAporte patronal agosto 2026 — planilla real, imponible 2.218.375");
{
  const c = calcularEmpleador(
    {
      sueldoBase: 2218375,
      modoGratificacion: "ninguna",
      afpKey: "modelo",
      salud: "fonasa",
      contrato: "indefinido",
    },
    agosto
  );
  eq("Aporte ISL (0,93%)", c.mutual, 20631);
  eq("Aporte Seg Cesantía (2,4%)", c.cesantiaEmpleador, 53241);
  eq("Aporte SIS (1,78%)", c.aportesPension[0].monto, 39487);
  eq("Aporte Expectativa de vida (0,72%)", c.aportesPension[1].monto, 15972);
  eq("Aporte AFP Adicional (0,10%)", c.aportesPension[2].monto, 2218);
  eq("Aporte Rentabilidad Protegida (0,90%)", c.aportesPension[3].monto, 19965);
  eq("Total aportes (6,83%)", c.totalAportes, 151514);
  // SIS + expectativa de vida deben sumar 2,5%
  const sisMasExp = agosto.aportesPension[0].tasa + agosto.aportesPension[1].tasa;
  eq("SIS + Expectativa de vida (×100)", Math.round(sisMasExp * 100), 250);
}

// ── Sueldo bajo el tope imponible, gratificación legal topeada, Fonasa ──
console.log("\nSueldo bajo el tope — Fonasa, AFP Modelo, indefinido");
{
  const liq = calcularTrabajador(
    {
      sueldoBase: 1000000,
      modoGratificacion: "legal",
      afpKey: "modelo", // 10,58%
      salud: "fonasa",
      contrato: "indefinido",
    },
    julio
  );
  eq("Gratificación topeada", liq.gratificacion, 219115);
  eq("Total imponible", liq.totalImponible, 1219115);
  eq("Base = imponible (sin tope)", liq.baseCotizacion, 1219115);
  eq("AFP", liq.afp, 128982);
  eq("Salud 7%", liq.salud7, 85338);
  eq("Cesantía", liq.cesantiaTrabajador, 7315);
  eq("Base tributable", liq.baseTributable, 997480);
  eq("Impuesto (tramo 4%)", liq.impuesto, 1209);
  eq("Líquido", liq.liquido, 996271);
}

// ── Plazo fijo: trabajador no cotiza cesantía, empleador paga 3% ──
console.log("\nPlazo fijo — Fonasa, AFP Uno, sin gratificación");
{
  const c = calcularEmpleador(
    {
      sueldoBase: 800000,
      modoGratificacion: "ninguna",
      afpKey: "uno", // 10,46%
      salud: "fonasa",
      contrato: "plazo_fijo",
    },
    julio
  );
  const liq = c.liquidacion;
  eq("Cesantía trabajador (0%)", liq.cesantiaTrabajador, 0);
  eq("AFP", liq.afp, 83680);
  eq("Salud 7%", liq.salud7, 56000);
  eq("Impuesto (exento)", liq.impuesto, 0);
  eq("Líquido", liq.liquido, 660320);
  eq("Cesantía empleador (3%)", c.cesantiaEmpleador, 24000);
  eq("ISL/Mutual (0,93%)", c.mutual, 7440);
  eq("SIS vía AFP (1,62%)", c.aportesPension[0].monto, 12960);
  eq("Capitalización individual (0,1%)", c.aportesPension[1].monto, 800);
  eq("Expectativa de vida (0,9%)", c.aportesPension[2].monto, 7200);
  eq("Costo total", c.costoTotal, 852400);
}

// ── Un caso en cada tramo del impuesto único ──
console.log("\nImpuesto único — un caso por tramo (base en UTM de julio)");
{
  const utm = julio.utm;
  const casos: [number, number, number][] = [
    // [base en UTM, factor, rebaja en UTM]
    [10, 0, 0],
    [20, 0.04, 0.54],
    [40, 0.08, 1.74],
    [60, 0.135, 4.49],
    [80, 0.23, 11.14],
    [100, 0.304, 17.8],
    [200, 0.35, 23.32],
    [400, 0.4, 38.82],
  ];
  for (const [enUTM, factor, rebaja] of casos) {
    const base = Math.round(enUTM * utm);
    const esperado = Math.max(0, Math.round(base * factor - rebaja * utm));
    eq(`Tramo hasta ${enUTM} UTM`, impuestoUnico(base, julio), esperado);
  }
}

if (fallas > 0) {
  console.error(`\n${fallas} prueba(s) fallaron`);
  process.exit(1);
}
console.log("\nTodas las pruebas pasaron ✔");
