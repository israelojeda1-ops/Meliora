import type { Metadata } from "next";
import Link from "next/link";
import { IndicadoresHoy } from "@/components/IndicadoresHoy";

export const metadata: Metadata = {
  title: "Indicadores Económicos de Hoy: UF, UTM, Dólar, IPC | Meliora Advisory",
  description:
    "Valor de la UF hoy, dólar observado, euro, UTM, IPC y TPM actualizados con la serie oficial. Indicadores económicos de Chile al día, gratis.",
  keywords: [
    "valor UF hoy",
    "UF hoy Chile",
    "valor dólar hoy Chile",
    "UTM hoy",
    "IPC Chile",
    "indicadores económicos Chile",
    "valor euro hoy",
  ],
  openGraph: {
    title: "Indicadores económicos de hoy — Chile",
    description: "UF, dólar, euro, UTM, IPC y TPM actualizados al día.",
    url: "https://melioraadvisory.cl/indicadores",
  },
};

export default function IndicadoresPage() {
  return (
    <>
      <section className="bg-navy py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-emerald font-semibold text-sm tracking-wide uppercase mb-4">
            Actualizado cada día
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white max-w-3xl">
            Indicadores económicos de hoy
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl">
            UF, dólar, euro, UTM, IPC y tasa de política monetaria, con los
            valores oficiales del día (fuente: SII / Banco Central de Chile).
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <IndicadoresHoy />
          <p className="mt-6 text-xs text-slate-400 text-center">
            Valores de la serie oficial publicada por el SII y el Banco Central
            de Chile, vía mindicador.cl.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-navy text-center mb-8">
            Herramientas que usan estos indicadores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                href: "/calculadora",
                title: "Calculadora Salarial",
                desc: "Sueldo líquido y costo de contratación con topes en UF.",
              },
              {
                href: "/calculadora-honorarios",
                title: "Boleta de Honorarios",
                desc: "Retención 15,25% — con montos en pesos o UF.",
              },
              {
                href: "/calculadora-finiquito",
                title: "Calculadora de Finiquito",
                desc: "Indemnizaciones con tope 90 UF y feriado proporcional.",
              },
            ].map((h) => (
              <Link
                key={h.href}
                href={h.href}
                className="rounded-2xl border border-slate-200 p-6 hover:border-emerald/40 hover:shadow-lg transition-all"
              >
                <p className="text-base font-semibold text-navy mb-1">{h.title}</p>
                <p className="text-sm text-slate-500">{h.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-navy">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            ¿Tus decisiones dependen de estos números?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-8">
            Te entregamos cada mes los indicadores que de verdad mueven tu pyme:
            margen por línea, cobranza y flujo de caja proyectado.
          </p>
          <Link
            href="/diagnostico"
            className="inline-flex items-center justify-center rounded-lg bg-emerald px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-dark transition-colors"
          >
            Diagnóstico Financiero gratis
          </Link>
        </div>
      </section>
    </>
  );
}
