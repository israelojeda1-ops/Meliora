import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt, SESSION_COOKIE } from "@/lib/session";
import { getClient } from "@/lib/clients";
import { Logo } from "@/components/Logo";

export const metadata = {
  robots: { index: false, follow: false },
};

const money = (n: number) => `$${Math.round(n).toLocaleString("es-CL")}`;

const CUENTAS = [
  { codigo: "10-10-500-0000", nombre: "Existencias" },
  { codigo: "10-10-500-0001", nombre: "Existencias" },
  { codigo: "10-10-500-1000", nombre: "Existencias Madera" },
  { codigo: "10-10-500-2000", nombre: "Existencias Piedra" },
  { codigo: "10-10-500-3000", nombre: "Existencias Hormigón" },
  { codigo: "10-10-500-4000", nombre: "Existencias Muebles" },
  { codigo: "10-10-500-8000", nombre: "Existencias Metales" },
  { codigo: "10-10-500-9000", nombre: "Existencias Servicios" },
  { codigo: "40-20-300-0011", nombre: "Costo Tributario Existencias 2019" },
  { codigo: "40-20-300-0012", nombre: "Costo Tributario Existencias 2020" },
  { codigo: "40-20-900-0002", nombre: "Ajuste Inventarios" },
];

const TOTALES_ANIO = [
  { anio: "2025", altas: 1_057_830_854, costeo: 1_083_384_467 },
  { anio: "2026", altas: 618_968_253, costeo: 519_555_220 },
];

const MENSUAL = [
  { mes: "2025-01", altasClp: 15_024_606, altasDoc: 9, entradasUnid: 661, entradasMov: 11 },
  { mes: "2025-02", altasClp: 52_391_150, altasDoc: 31, entradasUnid: 20, entradasMov: 3 },
  { mes: "2025-03", altasClp: 172_820_734, altasDoc: 32, entradasUnid: 6977, entradasMov: 151 },
  { mes: "2025-04", altasClp: 46_161_526, altasDoc: 26, entradasUnid: 34, entradasMov: 2 },
  { mes: "2025-05", altasClp: 69_028_584, altasDoc: 36, entradasUnid: 142, entradasMov: 5 },
  { mes: "2025-06", altasClp: 49_792_288, altasDoc: 27, entradasUnid: 320, entradasMov: 2 },
  { mes: "2025-07", altasClp: 64_143_532, altasDoc: 34, entradasUnid: 253_761, entradasMov: 99 },
  { mes: "2025-08", altasClp: 189_607_476, altasDoc: 25, entradasUnid: 238_194, entradasMov: 788 },
  { mes: "2025-09", altasClp: 132_447_839, altasDoc: 29, entradasUnid: 1_049_269, entradasMov: 191 },
  { mes: "2025-10", altasClp: 72_172_248, altasDoc: 26, entradasUnid: 46_797, entradasMov: 197 },
  { mes: "2025-11", altasClp: 48_623_558, altasDoc: 19, entradasUnid: 19_099, entradasMov: 138 },
  { mes: "2025-12", altasClp: 145_617_313, altasDoc: 23, entradasUnid: 32_188, entradasMov: 259 },
  { mes: "2026-01", altasClp: 61_697_894, altasDoc: 28, entradasUnid: 1_563_665, entradasMov: 368 },
  { mes: "2026-02", altasClp: 157_062_485, altasDoc: 18, entradasUnid: 154_577, entradasMov: 332 },
  { mes: "2026-03", altasClp: 32_739_425, altasDoc: 19, entradasUnid: 467_468, entradasMov: 198 },
  { mes: "2026-04", altasClp: 93_828_979, altasDoc: 26, entradasUnid: 757_372, entradasMov: 201 },
  { mes: "2026-05", altasClp: 38_067_044, altasDoc: 24, entradasUnid: 102_745, entradasMov: 131 },
  { mes: "2026-06", altasClp: 220_073_581, altasDoc: 43, entradasUnid: 14_874, entradasMov: 195 },
  { mes: "2026-07", altasClp: 15_498_845, altasDoc: 2, entradasUnid: 2_494_202, entradasMov: 204 },
];

const totalAltas = TOTALES_ANIO.reduce((s, t) => s + t.altas, 0);
const totalCosteo = TOTALES_ANIO.reduce((s, t) => s + t.costeo, 0);

export default async function InternoPage() {
  const client = getClient("interno");
  if (!client) redirect("/login");

  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session || session.client !== client.slug) {
    redirect(`/login?client=${client.slug}`);
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <div className="bg-navy">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
          <Logo theme="dark" />
          <p className="text-emerald-light font-semibold text-xs tracking-wide uppercase mt-6 mb-1">
            Uso interno — no compartir
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Nüprotec — Cuentas de Existencias (Libro Mayor)
          </h1>
          <p className="text-slate-300 text-sm mt-0.5">
            Movimientos contables 2025–2026 · Altas (Debe) vs Costeo (Haber) · vs. entradas físicas de bodega
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-navy uppercase tracking-wide mb-4">Totales por año</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {TOTALES_ANIO.map((t) => (
              <div key={t.anio} className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-xs text-slate-500 font-medium">{t.anio}</p>
                <p className="text-sm text-slate-600 mt-2">
                  Altas (Debe) <span className="font-bold text-navy float-right">{money(t.altas)}</span>
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Costeo (Haber) <span className="font-bold text-navy float-right">{money(t.costeo)}</span>
                </p>
              </div>
            ))}
            <div className="rounded-xl bg-navy p-4">
              <p className="text-xs text-slate-300 font-medium">Total 2025-2026</p>
              <p className="text-sm text-slate-200 mt-2">
                Altas (Debe) <span className="font-bold text-white float-right">{money(totalAltas)}</span>
              </p>
              <p className="text-sm text-slate-200 mt-1">
                Costeo (Haber) <span className="font-bold text-white float-right">{money(totalCosteo)}</span>
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed">
            <b>Altas</b>: movimientos Debe en cuentas de Existencias — dominado por facturas de compra (glosa &ldquo;FT&rdquo;),
            declaraciones de ingreso de importación (glosa &ldquo;DI...INV&rdquo;) y ajustes de inventario. <b>Costeo</b>:
            movimientos Haber — costo de venta mensual (&ldquo;COSTO MM-AAAA&rdquo;) y consumo interno (&ldquo;CONSUMO&rdquo;).
            Solo se cuentan comprobantes vigentes (excluye anulados) y se excluye la apertura de saldo.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-navy uppercase tracking-wide mb-1">Altas contables vs. entradas físicas, por mes</h2>
          <p className="text-xs text-slate-500 mb-4">
            &ldquo;Entradas físicas&rdquo; = movimientos de bodega (IW_vsnpMovimStockTipoBod, bodegas 08/20) en unidades —
            <b> no son comparables en monto contra las Altas en pesos</b>, porque unidades de distintos productos se suman
            sin normalizar. Sirve para ver si la actividad de cada mes calza en general (meses con muchas entradas físicas
            pero pocas Altas contables, o viceversa, valen la pena revisar).
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-left">
                  <th className="py-2 px-3 font-semibold">Mes</th>
                  <th className="py-2 px-3 font-semibold text-right">Altas (CLP)</th>
                  <th className="py-2 px-3 font-semibold text-right"># docs Alta</th>
                  <th className="py-2 px-3 font-semibold text-right">Entradas físicas (unid.)</th>
                  <th className="py-2 px-3 font-semibold text-right"># movs físicos</th>
                </tr>
              </thead>
              <tbody>
                {MENSUAL.map((m) => (
                  <tr key={m.mes} className="border-t border-slate-100">
                    <td className="py-1.5 px-3 font-medium text-slate-700">{m.mes}</td>
                    <td className="py-1.5 px-3 text-right tabular-nums">{money(m.altasClp)}</td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-slate-500">{m.altasDoc}</td>
                    <td className="py-1.5 px-3 text-right tabular-nums">{m.entradasUnid.toLocaleString("es-CL")}</td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-slate-500">{m.entradasMov}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-navy uppercase tracking-wide mb-4">Cuentas de Existencias (plan de cuentas)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-left">
                  <th className="py-2 px-3 font-semibold">Código</th>
                  <th className="py-2 px-3 font-semibold">Nombre</th>
                </tr>
              </thead>
              <tbody>
                {CUENTAS.map((c) => (
                  <tr key={c.codigo} className="border-t border-slate-100">
                    <td className="py-1.5 px-3 font-mono text-slate-700">{c.codigo}</td>
                    <td className="py-1.5 px-3 text-slate-600">{c.nombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-amber-900 mb-2">Pendiente</h2>
          <p className="text-xs text-amber-800 leading-relaxed">
            Una reconciliación real (¿la entrada física X quedó contabilizada en la Alta Y?) requiere enlazar por
            producto/documento, no solo comparar totales del mes. El archivo que mandó Manuel Valdés (Necont) tiene
            códigos de producto inconsistentes (a veces código real, a veces nombre) y toca bodegas (10, 30) que el
            dashboard de Nuprotec no trackea (solo 08 y 20) — eso bloqueó el cruce línea a línea la última vez que se
            intentó. Falta corregir eso antes de un cruce exacto.
          </p>
        </section>

        <p className="text-center text-xs text-slate-400">
          Datos extraídos de Softland (cwmovim/cwpctas + IW_vsnpMovimStockTipoBod) el 29-07-2026. Snapshot puntual, no se
          actualiza solo.
        </p>
      </div>
    </div>
  );
}
