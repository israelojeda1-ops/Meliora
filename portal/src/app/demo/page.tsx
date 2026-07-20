import type { Metadata } from "next";
import DemoDashboard from "./DemoDashboard";

export const metadata: Metadata = {
  title: "Demo — Reporte Gerencial | Meliora Advisory",
  description:
    "Ejemplo interactivo del reporte gerencial mensual que Meliora Advisory entrega a sus clientes: ventas, compras, flujo de caja, cobranza y estado de resultados.",
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <div className="bg-emerald-dark text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-2 text-center">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs sm:text-sm font-medium">
            Vista de demostración — datos ficticios de &ldquo;Empresa Demo SpA&rdquo;, solo para ilustrar el portal.
          </p>
        </div>
      </div>

      <DemoDashboard />
    </div>
  );
}
