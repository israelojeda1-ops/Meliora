import type { Metadata } from "next";
import Link from "next/link";
import { CalculadoraHonorarios } from "@/components/CalculadoraHonorarios";

export const metadata: Metadata = {
  title:
    "Calculadora de Boleta de Honorarios 2026 — Retención 15,25% | Meliora Advisory",
  description:
    "Calcula gratis tu boleta de honorarios 2026: cuánto recibes líquido con la retención del 15,25%, o por cuánto debes boletear para recibir el monto que quieres. Actualizada según Ley 21.133.",
  keywords: [
    "calculadora boleta de honorarios",
    "retención boleta honorarios 2026",
    "boleta honorarios líquido",
    "cuánto me retienen boleta honorarios",
    "boletear monto líquido",
    "retención 15,25%",
    "trabajador independiente Chile",
  ],
  openGraph: {
    title: "Calculadora de Boleta de Honorarios 2026 — Chile",
    description:
      "Bruto a líquido y líquido a bruto con la retención vigente del 15,25%.",
    url: "https://melioraadvisory.cl/calculadora-honorarios",
  },
};

const faqs = [
  {
    q: "¿Cuánto es la retención de la boleta de honorarios en 2026?",
    a: "Desde el 1 de enero de 2026 la retención es de 15,25% del monto bruto de la boleta (subió desde 14,5% en 2025). Según la Ley 21.133 seguirá aumentando gradualmente: 16% en 2027 y 17% desde 2028.",
  },
  {
    q: "Si emito una boleta por $1.000.000, ¿cuánto recibo?",
    a: "Recibes $847.500 líquidos. La retención de 15,25% ($152.500) la entera en el SII quien paga la boleta (o tú mismo, si emites a una persona natural).",
  },
  {
    q: "¿Por cuánto debo boletear para recibir un monto líquido específico?",
    a: "Divide el líquido deseado por 0,8475 (1 − 15,25%). Por ejemplo, para recibir $1.000.000 líquido debes emitir la boleta por $1.179.941. La calculadora hace este cálculo automáticamente en el modo \"Quiero recibir un monto líquido\".",
  },
  {
    q: "¿La retención de honorarios es un impuesto que pierdo?",
    a: "No. La retención financia tus cotizaciones previsionales obligatorias como trabajador independiente (salud, AFP, SIS, seguro de accidentes) y el saldo se imputa a tu Impuesto Global Complementario en la Operación Renta de abril. Si sobra, se devuelve.",
  },
  {
    q: "¿Cuándo conviene pasar de boletas a contrato?",
    a: "Depende del monto, la frecuencia y la relación de subordinación. Sobre ciertos niveles de ingreso mensual estable, un contrato puede ser más eficiente en cotizaciones e impuestos, además de reducir riesgo laboral para la empresa que paga. Es exactamente el tipo de análisis que hacemos en la asesoría.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculadora de Boleta de Honorarios 2026",
    url: "https://melioraadvisory.cl/calculadora-honorarios",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "CLP" },
    provider: {
      "@type": "Organization",
      name: "Meliora Advisory",
      url: "https://melioraadvisory.cl",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  },
];

export default function CalculadoraHonorariosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="no-print bg-navy py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-emerald font-semibold text-sm tracking-wide uppercase mb-4">
            Para independientes y quienes les pagan
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white max-w-3xl">
            Calculadora de Boleta de Honorarios 2026
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl">
            Con la retención vigente del 15,25%: cuánto recibes líquido por tu
            boleta, o por cuánto debes boletear para recibir el monto que
            necesitas.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="no-print flex flex-wrap justify-center gap-2 mb-10">
            <Link
              href="/calculadora"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 hover:border-emerald hover:text-emerald transition-colors"
            >
              Calculadora Salarial
            </Link>
            <span className="rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-white">
              Boleta de Honorarios
            </span>
            <Link
              href="/calculadora-finiquito"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 hover:border-emerald hover:text-emerald transition-colors"
            >
              Finiquito
            </Link>
          </div>
          <CalculadoraHonorarios />
        </div>
      </section>

      <section className="no-print py-16 sm:py-20 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy text-center mb-12">
            Preguntas frecuentes sobre boletas de honorarios
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="text-base font-semibold text-navy mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="no-print py-16 sm:py-20 bg-navy">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            ¿Tu pyme paga honorarios o remuneraciones todos los meses?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-8">
            Nosotros lo hacemos por ti, con reportería en tiempo y forma y
            acompañamiento mes a mes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/planes"
              className="inline-flex items-center justify-center rounded-lg bg-emerald px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-dark transition-colors"
            >
              Conocer los planes
            </Link>
            <Link
              href="/diagnostico"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Diagnóstico Financiero gratis
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
