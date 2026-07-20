import type { Metadata } from "next";
import DemoCharts from "./DemoCharts";

export const metadata: Metadata = {
  title: "Demo — Reporte Gerencial | Meliora Advisory",
  description:
    "Ejemplo ilustrativo del reporte gerencial mensual que Meliora Advisory entrega a sus clientes.",
  robots: { index: false, follow: false },
};

const MESES = [
  "Ago", "Sep", "Oct", "Nov", "Dic", "Ene",
  "Feb", "Mar", "Abr", "May", "Jun", "Jul",
];

const INGRESOS = [42, 45, 41, 48, 53, 47, 44, 49, 52, 55, 58, 61];
const PRESUPUESTO = [40, 42, 43, 45, 48, 48, 46, 47, 49, 51, 53, 55];
const EBITDA_MARGEN = [11.2, 12.1, 10.4, 12.8, 14.1, 12.9, 11.8, 13.2, 13.9, 14.6, 15.2, 15.8];

const BUDGET_ROWS = [
  { cat: "Ingresos por ventas", pres: 55.0, real: 61.0 },
  { cat: "Costo de ventas", pres: 33.0, real: 35.8 },
  { cat: "Gastos de administración", pres: 8.5, real: 8.1 },
  { cat: "Gastos de venta", pres: 5.2, real: 5.9 },
  { cat: "EBITDA", pres: 8.3, real: 9.6 },
];

const CARTERA_ROWS = [
  { rango: "0 – 30 días", monto: 28.4, status: "good" as const },
  { rango: "31 – 60 días", monto: 12.1, status: "warning" as const },
  { rango: "61 – 90 días", monto: 6.3, status: "serious" as const },
  { rango: "Más de 90 días", monto: 3.8, status: "critical" as const },
];

const ALERTAS = [
  {
    status: "critical" as const,
    texto: "3 clientes concentran el 62% de la cartera vencida a más de 90 días.",
  },
  {
    status: "warning" as const,
    texto: "El gasto de venta superó el presupuesto en 4 de los últimos 6 meses.",
  },
  {
    status: "good" as const,
    texto: "El margen EBITDA subió 4.6 puntos porcentuales respecto al semestre anterior.",
  },
];

function clp(n: number) {
  return "$" + Math.round(n * 1_000_000).toLocaleString("es-CL");
}

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#f9f9f7]">
      <div className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs sm:text-sm text-white/80">
            Vista de demostración — los datos de este reporte son ficticios
          </p>
          <a
            href="https://melioraadvisory.cl/contacto/"
            className="inline-flex items-center rounded-lg bg-emerald px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-dark transition-colors whitespace-nowrap"
          >
            Quiero esto para mi empresa
          </a>
        </div>
      </div>

      <div className="bg-navy pb-16 pt-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-emerald font-semibold text-sm tracking-wide uppercase mb-2">
            Reporte gerencial mensual
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white max-w-2xl">
            Así de claro puede verse el control financiero de tu empresa
          </h1>
          <p className="text-slate-300 text-sm mt-2 max-w-xl">
            Empresa Demo SpA · Julio 2026 · Datos 100% ilustrativos, solo para fines demostrativos
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-10 pb-20">
        <DemoCharts
          meses={MESES}
          ingresos={INGRESOS}
          presupuesto={PRESUPUESTO}
          ebitdaMargen={EBITDA_MARGEN}
          carteraRows={CARTERA_ROWS}
          alertas={ALERTAS}
        />

        <div className="mt-10 rounded-2xl bg-white border border-slate-200 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-navy mb-4">Presupuesto vs. Real por categoría</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
                  <th className="py-2 pr-4 font-semibold">Categoría</th>
                  <th className="py-2 px-4 font-semibold text-right">Presupuesto</th>
                  <th className="py-2 px-4 font-semibold text-right">Real</th>
                  <th className="py-2 pl-4 font-semibold text-right">Variación</th>
                </tr>
              </thead>
              <tbody>
                {BUDGET_ROWS.map((r) => {
                  const delta = ((r.real - r.pres) / r.pres) * 100;
                  const isCost = r.cat.toLowerCase().includes("costo") || r.cat.toLowerCase().includes("gasto");
                  const good = isCost ? delta <= 0 : delta >= 0;
                  return (
                    <tr key={r.cat} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4 font-medium text-navy">{r.cat}</td>
                      <td className="py-3 px-4 text-right text-slate-500 tabular-nums">{clp(r.pres)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-navy tabular-nums">{clp(r.real)}</td>
                      <td
                        className="py-3 pl-4 text-right font-semibold tabular-nums"
                        style={{ color: good ? "#006300" : "#d03b3b" }}
                      >
                        {delta > 0 ? "+" : ""}
                        {delta.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-navy p-8 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Esto es solo un ejemplo — el tuyo se arma con tus propios datos
          </h2>
          <p className="text-slate-300 max-w-lg mx-auto mb-6 text-sm">
            Conversemos sobre qué indicadores le faltan hoy a tu empresa y cómo
            se vería tu reporte gerencial mensual.
          </p>
          <a
            href="https://melioraadvisory.cl/contacto/"
            className="inline-flex items-center justify-center rounded-lg bg-emerald px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-dark transition-colors"
          >
            Agendar reunión gratuita
          </a>
        </div>
      </div>
    </div>
  );
}
