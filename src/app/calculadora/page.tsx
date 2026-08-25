import type { Metadata } from "next";
import Link from "next/link";
import { CalculadoraRemuneraciones } from "@/components/CalculadoraRemuneraciones";

export const metadata: Metadata = {
  title:
    "Calculadora de Sueldo Líquido y Costo de Contratación Chile 2026 — Meliora Advisory",
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
    title: "Calculadora de Sueldo Líquido y Costo de Contratación — Chile 2026",
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
    a: "Además de la remuneración bruta, el empleador paga su porción del seguro de cesantía (2,4% en contrato indefinido o 3% a plazo fijo), el SIS (1,62%), la mutual de seguridad (desde 0,90% más recargo por riesgo) y la cotización adicional de la reforma previsional de la Ley 21.735 (3,5% desde las remuneraciones de agosto de 2026). En total, el costo de contratación supera la remuneración bruta en un 8% a 10% aproximadamente.",
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
    a: "La Ley 21.735 creó una cotización de cargo del empleador que partió en 1% de la remuneración imponible en agosto de 2025 y subió a 3,5% desde las remuneraciones de agosto de 2026, con aumentos graduales hasta llegar a 8,5%. Es un costo de contratación adicional que no se descuenta al trabajador.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculadora de Sueldo Líquido y Costo de Contratación",
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
            Calculadora de sueldo líquido y costo de contratación
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
