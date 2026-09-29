import type { Metadata } from "next";
import Link from "next/link";
import { CalculadoraLiquido } from "@/components/CalculadoraLiquido";

export const metadata: Metadata = {
  title:
    "Calculadora de Sueldo Líquido a Bruto Chile 2026 — ¿Cuánto Sueldo Base Poner? | Meliora Advisory",
  description:
    "Ingresa el sueldo líquido que quieres pagar y calcula al revés: cuánto sueldo base, cuánto bono imponible o cuánta colación necesitas. Con el costo total para la empresa e indicadores actualizados.",
  keywords: [
    "de líquido a bruto Chile",
    "calcular sueldo bruto desde líquido",
    "cuánto sueldo base para un líquido",
    "calculadora sueldo inverso",
    "cuánto bono para llegar a un líquido",
    "estructura de sueldo pyme",
    "cuánto me cuesta pagar un líquido",
  ],
  openGraph: {
    title: "Calculadora de líquido a bruto — Chile 2026",
    description:
      "Fija el líquido que quieres pagar y despeja el sueldo base, el bono o la colación. Con el costo real para la empresa.",
    url: "https://melioraadvisory.cl/calculadora-liquido",
  },
};

const faqs = [
  {
    q: "¿Cómo calculo el sueldo base a partir de un líquido?",
    a: "No hay una fórmula directa, porque el líquido no es proporcional al bruto: los topes imponibles, el tope de la gratificación legal y los tramos del impuesto único quiebran la relación en tramos. Esta calculadora lo resuelve al revés, buscando el menor monto con el que se alcanza exactamente el líquido que fijaste, y muestra el desglose completo para que puedas verificarlo línea por línea.",
  },
  {
    q: "Si subo el sueldo base, ¿baja el bono que necesito?",
    a: "Sí, y en la misma proporción. Lo que determina el líquido es el total imponible, no cómo lo repartas entre sueldo base y bonos: ambos entran a la misma base de cotizaciones y al mismo impuesto. La única diferencia aparece cuando hay horas extra, porque el valor de la hora extraordinaria se calcula sobre el sueldo base y no sobre los bonos.",
  },
  {
    q: "¿Conviene pagar parte del sueldo como colación o movilización?",
    a: "Son haberes no imponibles: no pagan AFP, salud ni impuesto, así que cada peso llega íntegro al trabajador y le cuesta menos a la empresa. Pero deben ser montos razonables y acreditables respecto del gasto real que compensan. Si se usan como sueldo encubierto, el SII los reclasifica como imponibles y la empresa queda con cotizaciones e impuestos impagos.",
  },
  {
    q: "¿Por qué el líquido resultante a veces supera por unos pesos al objetivo?",
    a: "Porque las cotizaciones y el impuesto se calculan con montos redondeados, así que el líquido avanza a saltos de algunos pesos. La calculadora entrega el menor monto con el que se alcanza o se supera el objetivo, nunca uno que se quede corto.",
  },
  {
    q: "¿El costo para la empresa es solo el sueldo bruto?",
    a: "No. Sobre la remuneración imponible el empleador paga además su porción del seguro de cesantía (2,4% en contrato indefinido o 3% a plazo fijo), el seguro de accidentes ISL o mutual (0,93% base más el recargo por riesgo de la actividad) y el 3,5% del Seguro Social Previsional de la reforma (Ley 21.735). La calculadora suma todo eso en el costo total de contratación.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculadora de sueldo líquido a bruto",
    url: "https://melioraadvisory.cl/calculadora-liquido",
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

export default function CalculadoraLiquidoPage() {
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
            Desde el líquido: ¿cuánto sueldo base tengo que poner?
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl">
            Fija el líquido que quieres pagar y elige qué variable despejar: el
            sueldo base, el bono imponible o la colación. El resto lo vas
            moviendo y el cálculo se rehace solo, con el costo real para la
            empresa.
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
              Desde el Líquido
            </span>
            <Link
              href="/calculadora-honorarios"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 hover:border-emerald hover:text-emerald transition-colors"
            >
              Boleta de Honorarios
            </Link>
            <Link
              href="/calculadora-finiquito"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 hover:border-emerald hover:text-emerald transition-colors"
            >
              Finiquito
            </Link>
          </div>
          <CalculadoraLiquido />
        </div>
      </section>

      <section className="no-print py-16 sm:py-20 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy text-center mb-12">
            Preguntas frecuentes sobre estructurar un sueldo
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
