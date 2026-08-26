import type { Metadata } from "next";
import Link from "next/link";
import { CalculadoraFiniquito } from "@/components/CalculadoraFiniquito";

export const metadata: Metadata = {
  title:
    "Calculadora de Finiquito Chile 2026 — Indemnización y Vacaciones | Meliora Advisory",
  description:
    "Calcula gratis el finiquito de un trabajador en Chile: indemnización por años de servicio (tope 11 años y 90 UF), aviso previo y feriado proporcional, según la causal de término.",
  keywords: [
    "calculadora finiquito Chile",
    "calcular finiquito trabajador",
    "indemnización años de servicio",
    "indemnización aviso previo",
    "feriado proporcional cálculo",
    "finiquito necesidades de la empresa",
    "finiquito renuncia voluntaria",
  ],
  openGraph: {
    title: "Calculadora de Finiquito — Chile 2026",
    description:
      "Indemnización por años de servicio, aviso previo y feriado proporcional según la causal.",
    url: "https://melioraadvisory.cl/calculadora-finiquito",
  },
};

const faqs = [
  {
    q: "¿Qué incluye un finiquito por necesidades de la empresa?",
    a: "Indemnización por años de servicio (una remuneración por cada año trabajado, donde la fracción superior a 6 meses cuenta como año completo, con tope de 11 años), indemnización sustitutiva de aviso previo si el despido no se avisó con 30 días de anticipación, y el feriado proporcional por las vacaciones no tomadas. La base de cálculo de las indemnizaciones tiene un tope de 90 UF.",
  },
  {
    q: "¿Si el trabajador renuncia, hay que pagar indemnización?",
    a: "No. En renuncia voluntaria, mutuo acuerdo o vencimiento del plazo no corresponde indemnización por años de servicio ni aviso previo, pero siempre corresponde pagar el feriado proporcional y cualquier remuneración pendiente.",
  },
  {
    q: "¿Cómo se calcula el feriado proporcional?",
    a: "Se devengan 1,25 días hábiles de vacaciones por cada mes trabajado desde el último aniversario del contrato (más los períodos completos pendientes). Esos días hábiles se convierten a días corridos contando desde el día siguiente al término, y se pagan a razón de la remuneración diaria (sueldo mensual dividido en 30).",
  },
  {
    q: "¿Qué es el tope de 90 UF en el finiquito?",
    a: "Para calcular las indemnizaciones, la última remuneración mensual se considera con un tope de 90 UF (art. 172 del Código del Trabajo). Si el sueldo es mayor, las indemnizaciones se calculan sobre ese tope.",
  },
  {
    q: "¿El finiquito debe firmarse ante notario?",
    a: "Debe ser ratificado ante un ministro de fe: notario, inspector del trabajo o el presidente del sindicato, entre otros. Desde 2021 también puede hacerse electrónicamente en el sitio de la Dirección del Trabajo. Sin esa ratificación, el finiquito no tiene poder liberatorio.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculadora de Finiquito Chile",
    url: "https://melioraadvisory.cl/calculadora-finiquito",
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

export default function CalculadoraFiniquitoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="no-print bg-navy py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-emerald font-semibold text-sm tracking-wide uppercase mb-4">
            Para empleadores
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white max-w-3xl">
            Calculadora de Finiquito
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl">
            Indemnización por años de servicio, aviso previo y feriado
            proporcional según la causal de término, con los topes legales de
            11 años y 90 UF.
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
            <Link
              href="/calculadora-honorarios"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 hover:border-emerald hover:text-emerald transition-colors"
            >
              Boleta de Honorarios
            </Link>
            <span className="rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-white">
              Finiquito
            </span>
          </div>
          <CalculadoraFiniquito />
        </div>
      </section>

      <section className="no-print py-16 sm:py-20 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy text-center mb-12">
            Preguntas frecuentes sobre finiquitos
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
    </>
  );
}
