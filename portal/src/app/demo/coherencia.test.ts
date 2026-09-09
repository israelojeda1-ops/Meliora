/* Cuadratura del modelo ficticio del demo.
   Ejecutar: npm run test:demo   */
import * as D from "./data.ts";
const s = (a: number[]) => a.reduce((x, y) => x + y, 0);
const ok = (l: string, a: number, b: number, tol = 0.05) =>
  console.log(`${Math.abs(a - b) <= tol ? "OK  " : "FALLA"} ${l}: ${a.toFixed(1)} vs ${b.toFixed(1)}`);

ok("ventas 12m = líneas de negocio", s(D.ventas), D.totalVentasLineas);
ok("ventas 12m = productos", s(D.ventas), s(D.productos.map(p => p.ventas)));
ok("compras 12m = categorías", s(D.compras), D.totalComprasCategorias);
ok("saldo caja final = flujo indirecto cierre", D.saldoCaja[11], 113);
ok("caja inicial = flujo indirecto inicio", D.cajaInicial, 98);
ok("variación caja serie = estado", D.saldoCaja[11] - D.cajaInicial, 15);
ok("capex ejecutado = capex del flujo", s(D.capex.map(c => c.ejecutado)), 22);
ok("balance: activos = pasivos+patrimonio", 450, 450);
ok("patrimonio = capital+reservas+resultado", 150 + 49.4 + 40.6, 240);
ok("utilidad EERR = resultado del ejercicio balance", 40.6, D.utilidadNetaAnual);
const ebitdaAcum = D.ventas.reduce((a, v, i) => a + (v * D.ebitdaMargen[i]) / 100, 0);
ok("EBITDA acum = op + D&A", ebitdaAcum, 67.1 + D.depreciacionAnual, 0.6);
ok("variaciones suman delta EBITDA", s(D.topVariaciones.map(v => v.varMonto)), 9.6 - 7.0);
const vencida = D.cartera.slice(1).reduce((a, r) => a + r.monto, 0);
const deudoresVencidos = D.topDeudores.filter(d => d.status !== "good").reduce((a, d) => a + d.monto, 0);
console.log(`OK   concentración vencida: ${((deudoresVencidos / vencida) * 100).toFixed(0)}%`);
D.cartera.forEach(tr => {
  const enTramo = D.topDeudores.filter(d => d.status === tr.status).reduce((a, d) => a + d.monto, 0);
  ok(`deudores <= tramo ${tr.rango}`, Math.min(enTramo, tr.monto), enTramo);
});
const nom = s(D.costoNomina.map(c => c.monto));
const hc = s(D.dotacion.map(d => d.hc));
console.log(`OK   nómina ${nom} MM / ${hc} personas = ${(nom / hc).toFixed(2)} MM por persona`);
console.log(`OK   nómina anual ${(nom * 12).toFixed(0)} vs ingresos ${s(D.ventas)}`);
const meses = D.ventas.map((v, i) => v > D.presupuestoVentas[i]);
let racha = 0; for (let i = meses.length - 1; i >= 0 && meses[i]; i--) racha++;
console.log(`OK   meses consecutivos sobre presupuesto: ${racha}`);
const s1 = D.ebitdaMargen.slice(0, 6).reduce((a, b) => a + b, 0) / 6;
const s2 = D.ebitdaMargen.slice(6).reduce((a, b) => a + b, 0) / 6;
console.log(`OK   margen EBITDA: sem1 ${s1.toFixed(2)}% sem2 ${s2.toFixed(2)}% => +${(s2 - s1).toFixed(1)} pp`);
const proy12 = s(D.ventas.slice(6)) + s(D.forecastVentas);
console.log(`OK   proyección 12 meses móviles (Feb26-Ene27): ${proy12}`);
