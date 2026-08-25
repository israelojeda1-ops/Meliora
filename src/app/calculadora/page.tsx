import type { Metadata } from "next";
import Link from "next/link";
import { CalculadoraRemuneraciones } from "@/components/CalculadoraRemuneraciones";

export const metadata: Metadata = {
  title:
    "Calculadora Salarial Chile 2026 — Sueldo Líquido y Costo de Contratación | Meliora Advisory",
  description:
    "Calcula gratis tu sueldo líquido desde el bruto (AFP, salud, isapre en UF, impuesto único) o el costo total de contratar un trabajador en Chile: cesantía, SIS, mutual y aporte de la reforma previsional. Indicadores actualizados.",
  keywords: [
    "calcular sueldo líquido",
    "calculadora sueldo líquido Chile",
    "sueldo bruto a líquido",
    "costo de contratar un trabajador",
    "cuánto me cuesta un empleado",
    "costo empresa trabajador Chile",
    "impuesto único segunda categoría",
    "calculadora remuneraciones",
    "aporte empleador reforma previsional",
  ],
  openGraph: {
    title: "Calculadora Salarial — Chile 2026",
    description:
      "De bruto a líquido con desglose completo, y el costo real de contratar para tu pyme: cesantía, SIS, mutual y reforma previsional.",
    url: "https://melioraadvisory.cl/calculadora",
  },
};

const faqs = [
  {
    q: "¿Cómo se calcula el sueldo líquido en Chile?",
    a: "Al total imponible (sueldo base, gratificación, horas extra y bonos) se le descuentan la cotización de AFP, el 7% de salud, el seguro de cesantía (0,6% en contratos indefinidos) y el impuesto único de segunda categoría. Si el plan de isapre pactado en UF supera el 7% legal, la diferencia se descuenta adicionalmente. Los haberes no imponibles, como colación y movilización, se suman al final sin entrar en ninguna base.",
  },
  {
    q: "¿Cuánto cuesta realmente contratar un trabajador en Chile?",
    a: "Además de la remuneración bruta, el empleador paga su porción del seguro de cesantía (2,4% en contrato indefinido o 3% a plazo fijo), el seguro de accidentes ISL o mutual (0,93% base más recargo por riesgo) y, desde las remuneraciones de agosto de 2026, el 3,5% al Seguro Social Previsional de la reforma (Ley 21.735): SIS más compensación por expectativa de vida (que juntos suman 2,5%), 0,1% de capitalización individual y 0,9% de rentabilidad protegida. En total, cerca de un 6,8% adicional sobre la remuneración imponible topeada.",
  },
  {
    q: "¿Qué es el tope imponible de 90 UF?",
    a: "Las cotizaciones de AFP, salud y ley de accidentes se calculan sobre la remuneración imponible con un tope de 90 UF. El seguro de cesantía tiene su propio tope, más alto: 135,2 UF. Sobre esos montos, la parte del sueldo que excede el tope no cotiza.",
  },
  {
    q: "¿Por qué mi plan de isapre en UF cambia mi líquido?",
    a: "Si tu plan pactado en UF, convertido a pesos con la UF vigente, supera el 7% legal de tu base topeada, la diferencia se descuenta de tu sueldo como adicional de isapre. Ese adicional no rebaja la base del impuesto único, por eso dos personas con el mismo bruto pueden tener líquidos distintos.",
  },
  {
    q: "¿Qué es la cotización adicional del empleador de la reforma previsional?",
    a: "La Ley 21.735 creó una cotización de cargo del empleador que partió en 1% de la remuneración imponible en agosto de 2025 (0,1% capitalización individual + 0,9% expectativa de vida) y subió a 3,5% desde las remuneraciones de agosto de 2026, cuando además el SIS dejó de recaudarse vía AFP y pasó al Seguro Social: SIS + expectativa de vida suman 2,5%, más 0,1% de capitalización individual y 0,9% de rentabilidad protegida. Seguirá subiendo gradualmente hasta 8,5%. Es un costo de contratación adicional que no se descuenta al trabajador.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculadora Salarial",
    url: "https://melioraadvisory.cl/calculadora",
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

export default function CalculadoraPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="no-print bg-navy py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-emerald font-semibold text-sm tracking-wide uppercase mb-4">
            Herramienta gratuita
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white max-w-3xl">
            Calculadora Salarial: sueldo líquido y costo de contratación
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl">
            De bruto a líquido con desglose línea por línea — AFP, salud, isapre
            en UF, cesantía e impuesto único. Y si eres empleador: el costo
            total real de contratar, incluyendo el aporte de la reforma
            previsional.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="no-print flex justify-center gap-2 mb-10">
            <span className="rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-white">
              Calculadora Salarial
            </span>
            <Link
              href="/calculadora-honorarios"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 hover:border-emerald hover:text-emerald transition-colors"
            >
              Boleta de Honorarios
            </Link>
          </div>
          <CalculadoraRemuneraciones />
        </div>
      </section>

      <section className="no-print py-16 sm:py-20 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy text-center mb-12">
            Preguntas frecuentes sobre remuneraciones
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
            ¿Calcular remuneraciones todos los meses no es tu negocio?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-8">
            Es el nuestro. Contabilidad, remuneraciones y reportería gerencial
            integradas, trabajando en tu propio sistema, desde 8 UF al mes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/planes"
              className="inline-flex items-center justify-center rounded-lg bg-emerald px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-dark transition-colors"
            >
              Ver planes y precios
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
