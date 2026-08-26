import type { Metadata } from "next";
import { DiagnosticoTool } from "@/components/DiagnosticoTool";

export const metadata: Metadata = {
  title: "Diagnóstico Financiero Express — Meliora Advisory",
  description:
    "Evalúa gratis en 3 minutos la salud financiera de tu PyME: visibilidad de indicadores, proyección de caja, orden contable y procesos. Recibe un plan de acción concreto.",
  openGraph: {
    title: "Diagnóstico Financiero Express para PyMEs",
    description:
      "10 preguntas, 3 minutos. Descubre las brechas financieras de tu PyME y por dónde partir a cerrarlas.",
    url: "https://melioraadvisory.cl/diagnostico",
  },
};

export default function DiagnosticoPage() {
  return (
    <>
      <section className="bg-navy py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-emerald font-semibold text-sm tracking-wide uppercase mb-4">
            Herramienta gratuita
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white max-w-2xl">
            Diagnóstico Financiero Express de tu PyME
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl">
            10 preguntas, 3 minutos. Mide qué tan a ciegas (o qué tan en
            control) estás administrando las finanzas de tu empresa, y
            descubre por dónde partir a cerrar las brechas.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <DiagnosticoTool />
        </div>
      </section>
    </>
  );
}
