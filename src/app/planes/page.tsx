import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Planes y Precios — Meliora Advisory",
  description:
    "Planes mensuales de asesoría financiera y contable para PyMEs en Chile. Desde $250.000 CLP. Todos incluyen portal de cliente.",
};

const planes = [
  {
    name: "Contable",
    price: "$250.000–400.000",
    period: "/mes",
    description: "Contabilidad mensual completa para PyMEs con operación estándar.",
    features: [
      "Contabilidad mensual",
      "Declaración IVA / F29",
      "Estados Financieros",
      "Declaración de Renta",
      "Portal de cliente",
    ],
    highlighted: false,
  },
  {
    name: "Contable + Remuneraciones",
    price: "$380.000–650.000",
    period: "/mes",
    description:
      "Todo lo contable más la gestión completa de remuneraciones y cumplimiento laboral.",
    features: [
      "Todo del plan Contable",
      "Liquidaciones de sueldo",
      "Cálculo y pago Previred",
      "Contratos de trabajo",
      "Finiquitos",
      "Portal de cliente",
    ],
    highlighted: false,
  },
  {
    name: "Finanzas",
    price: "$700.000–1.200.000",
    period: "/mes",
    description:
      "Reportería gerencial y KPIs financieros para PyMEs que necesitan visibilidad de sus números.",
    features: [
      "Reportes gerenciales mensuales",
      "KPIs de margen y cobranza",
      "Análisis de DSO",
      "Flujo de caja proyectado",
      "Sesión mensual de análisis",
      "Portal de cliente",
    ],
    highlighted: true,
  },
  {
    name: "CFO Externo",
    price: "$1.200.000–2.800.000",
    period: "/mes",
    description:
      "Dirección financiera completa: presupuesto, forecast, estrategia y sesiones de análisis.",
    features: [
      "Todo del plan Finanzas",
      "Presupuesto anual",
      "Forecast rolling 8–12 semanas",
      "Análisis de variaciones",
      "Reporting en inglés (si aplica)",
      "Sesión estratégica mensual",
      "Portal de cliente",
    ],
    highlighted: false,
  },
];

export default function PlanesPage() {
  return (
    <>
      <section className="bg-navy py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-emerald font-semibold text-sm tracking-wide uppercase mb-4">
            Planes y precios
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white max-w-2xl">
            Honorarios ajustados al tamaño real de tu empresa
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl">
            Todos los planes incluyen acceso al portal de cliente con tus
            números actualizados en cada cierre mensual. El precio final se
            ajusta según volumen de transacciones y complejidad.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {planes.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 flex flex-col ${
                  plan.highlighted
                    ? "border-emerald bg-emerald/5 ring-1 ring-emerald/20"
                    : "border-slate-200"
                }`}
              >
                {plan.highlighted && (
                  <span className="inline-block self-start text-xs font-semibold text-emerald uppercase tracking-wider mb-3">
                    Más popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-navy">{plan.name}</h3>
                <div className="mt-4 mb-2">
                  <span className="text-2xl font-bold text-navy">
                    {plan.price}
                  </span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-500 mb-6">
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <svg
                        className="h-4 w-4 text-emerald flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      <span className="text-sm text-slate-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contacto"
                  className={`inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? "bg-emerald text-white hover:bg-emerald-dark"
                      : "bg-navy text-white hover:bg-navy-light"
                  }`}
                >
                  Consultar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-block text-xs font-semibold text-emerald uppercase tracking-wider mb-2">
                  Proyecto cerrado
                </span>
                <h3 className="text-xl font-bold text-navy mb-2">
                  Diagnóstico de Procesos
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Diagnóstico operacional de 2 a 4 semanas con informe de quick
                  wins, rediseño de procesos y plan de automatización. Entregable
                  concreto con plazos, responsables y métricas.
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-navy">
                  $600.000–1.500.000
                </p>
                <p className="text-sm text-slate-500 mb-4">Proyecto cerrado</p>
                <Link
                  href="/contacto"
                  className="inline-flex items-center justify-center rounded-lg bg-emerald px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-dark transition-colors"
                >
                  Solicitar diagnóstico
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy text-center mb-12">
            Preguntas frecuentes
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            {[
              {
                q: "¿Por qué los precios son un rango y no un valor fijo?",
                a: "Porque cada PyME tiene distinto volumen de transacciones, número de empleados y complejidad operacional. Cotizamos después de entender tu operación para darte un precio justo, no uno inflado.",
              },
              {
                q: "¿Necesito cambiar mi sistema contable o ERP?",
                a: "No. Trabajamos dentro del sistema que ya usas — Softland, Odoo, Nubox, Defontana u otro. Si no tienes uno, te ayudamos a implementarlo. Nunca obligamos a migrar.",
              },
              {
                q: "¿Qué incluye el portal de cliente?",
                a: "Un espacio donde puedes ver tus números actualizados en cada cierre mensual: estados financieros, KPIs, flujo de caja y reportería gerencial. Acceso 24/7.",
              },
              {
                q: "¿Puedo combinar servicios?",
                a: "Sí. De hecho, el mayor valor de Meliora es la integración. Puedes partir con contabilidad y remuneraciones, y sumar reportería gerencial o CFO externo cuando lo necesites.",
              },
              {
                q: "¿Cuál es el plazo de compromiso?",
                a: "Los servicios mensuales son renovables mes a mes. No hay contratos de permanencia mínima. El diagnóstico de procesos es un proyecto cerrado con entregables definidos.",
              },
            ].map((faq) => (
              <div key={faq.q}>
                <h3 className="text-base font-semibold text-navy mb-2">
                  {faq.q}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-navy">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-slate-300 max-w-lg mx-auto mb-8">
            Agenda una reunión gratuita. Revisamos tu operación y te proponemos
            el plan que mejor se ajusta a tu empresa.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center rounded-lg bg-emerald px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-dark transition-colors"
          >
            Agendar reunión gratuita
          </Link>
        </div>
      </section>
    </>
  );
}
