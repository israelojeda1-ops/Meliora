import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Planes y Precios — Meliora Advisory",
  description:
    "Planes mensuales de asesoría financiera y contable para PyMEs en Chile. Desde 6 UF. Todos incluyen portal de cliente.",
};

const planes = [
  {
    name: "Contable — Sistema Meliora",
    price: "Desde 6 UF",
    period: "/mes",
    description:
      "Hasta 100 movimientos al mes, en nuestro sistema estandarizado — la opción más eficiente.",
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
    name: "Contable — Sistema del cliente",
    price: "Desde 9 UF",
    period: "/mes",
    description:
      "Hasta 100 movimientos al mes, trabajando dentro del ERP que ya usas.",
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
    name: "Contable + Remuneraciones — Sistema Meliora",
    price: "Desde 10 UF",
    period: "/mes",
    description: "Hasta 100 movimientos y 15 trabajadores, en nuestro sistema.",
    features: [
      "Todo del plan Contable",
      "Liquidaciones de sueldo",
      "Cálculo y pago Previred",
      "Contratos de trabajo",
      "Finiquitos",
      "Portal de cliente",
    ],
    highlighted: true,
  },
  {
    name: "Contable + Remuneraciones — Sistema del cliente",
    price: "Desde 14 UF",
    period: "/mes",
    description: "Hasta 100 movimientos y 15 trabajadores, en tu propio ERP.",
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
    price: "Desde 19 UF",
    period: "/mes",
    description:
      "Asesoría gerencial y revisión de los informes que tu empresa ya prepara: KPIs de margen, cobranza y flujo de caja.",
    features: [
      "Revisión y análisis de informes existentes",
      "KPIs de margen y cobranza",
      "Análisis de DSO",
      "Flujo de caja proyectado",
      "Sesión mensual de análisis",
      "Portal de cliente",
    ],
    highlighted: false,
  },
  {
    name: "CFO Externo",
    price: "Desde 31 UF",
    period: "/mes",
    description:
      "Elaboración y emisión completa de tus informes gerenciales — no los revisamos, los construimos desde cero.",
    features: [
      "Elaboración de reportes gerenciales completos",
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
            ajusta según el sistema que uses y el volumen de movimientos.
          </p>
          <a
            href="https://portal.melioraadvisory.cl/demo"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald hover:text-emerald-light transition-colors"
          >
            Ver demo del portal de cliente
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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

          <div className="mt-6 rounded-2xl bg-navy p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Empresas de alto volumen o complejidad
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  100+ movimientos al mes, multimoneda, múltiples centros de
                  costo, importaciones.
                </p>
              </div>
              <div className="md:text-right">
                <p className="text-xl font-bold text-white mb-4">
                  Cotización personalizada
                </p>
                <Link
                  href="/contacto"
                  className="inline-flex items-center justify-center rounded-lg bg-emerald px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-dark transition-colors"
                >
                  Cotización personalizada
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy text-center mb-12">
            Preguntas frecuentes
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            {[
              {
                q: "¿Por qué los precios parten con \"desde\" y no son un valor fijo?",
                a: "Porque el precio final depende de dos factores: si trabajamos en tu propio sistema (ERP) o en el nuestro, y el volumen de movimientos y trabajadores de tu empresa. Los planes en sistema Meliora son más económicos porque estandarizamos el proceso; trabajar en tu ERP tiene un costo mayor de integración. Cotizamos después de entender tu operación para darte un precio justo.",
              },
              {
                q: "¿Necesito cambiar mi sistema contable o ERP?",
                a: "No. Puedes elegir el plan \"Sistema del cliente\" y trabajamos dentro del ERP que ya usas — Softland, Odoo, Nubox, Defontana u otro. Nunca obligamos a migrar.",
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
                a: "Todos los planes son servicios mensuales renovables mes a mes. No hay contratos de permanencia mínima.",
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center rounded-lg bg-emerald px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-dark transition-colors"
            >
              Agendar reunión gratuita
            </Link>
            <a
              href="https://portal.melioraadvisory.cl/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-white/30 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Ver demo del portal
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
