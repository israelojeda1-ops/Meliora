import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Planes — Servicio Integral Meliora | Meliora Advisory",
  description:
    "Un servicio modular y escalable para PyMEs en Chile: contabilidad, remuneraciones y reportería en tiempo y forma, con acompañamiento mes a mes, sobre tu sistema o el nuestro. Desde 8 UF al mes, sin permanencia mínima.",
};

const faqs = [
  {
    q: "¿Cuánto cuesta el servicio?",
    a: "Los planes parten desde 8 UF mensuales y el valor final se cotiza a la medida, después de un diagnóstico gratuito de tu operación. Depende de dos factores: si trabajamos sobre tu propio sistema o sobre el nuestro, y el volumen de movimientos y trabajadores de tu empresa. Así pagas por lo que tu operación realmente necesita, ni más ni menos.",
  },
  {
    q: "¿Necesito cambiar mi sistema contable o ERP?",
    a: "No. Podemos trabajar dentro del ERP que ya usas: Softland, Odoo, Nubox, Defontana u otro. La implementación inicial en ese caso es una puesta a punto de tu sistema, no una migración. Y si no tienes sistema o prefieres el nuestro, implementamos el sistema Meliora.",
  },
  {
    q: "¿Hacen reportes y dashboards para empresas que usan Softland o Softland Cloud?",
    a: "Sí. Conectamos directo a la base de datos de Softland (on-premise o Softland Cloud) para automatizar reportes gerenciales, dashboards y KPIs que el ERP no entrega de forma nativa, sin necesidad de cambiar de sistema y sujeto a la factibilidad técnica del ERP.",
  },
  {
    q: "¿Trabajan con cualquier sistema?",
    a: "Sí. Softland es uno de los sistemas donde tenemos más experiencia, pero hacemos reportes y dashboards ad hoc para cualquier sistema o ERP (Odoo, Nubox, Defontana u otro), conectándonos a la fuente de datos que tengas disponible, sujeto a la factibilidad técnica de cada sistema.",
  },
  {
    q: "¿Qué incluye el portal de cliente?",
    a: "Un espacio donde puedes ver tus números actualizados en cada cierre mensual: estados financieros, KPIs, flujo de caja y reportería gerencial. Acceso 24/7.",
  },
  {
    q: "¿Puedo contratar solo una parte del servicio?",
    a: "Sí, el servicio es modular. Puedes partir con lo que tu empresa necesita hoy y sumar el resto cuando tenga sentido: la reportería, el plan avanzado de CFO externo o los complementos. La idea es que el servicio crezca contigo, no al revés.",
  },
  {
    q: "¿Cuál es el plazo de compromiso?",
    a: "Todos los planes son servicios mensuales renovables mes a mes. No hay contratos de permanencia mínima.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

const caminos = [
  {
    name: "Puesta a Punto de tu Sistema",
    tag: "Si ya usas un ERP",
    description:
      "Trabajamos sobre el sistema que ya tienes: Softland, Odoo, Nubox, Defontana u otro.",
    items: [
      "Auditoría del ERP y de la contabilidad",
      "Diseño de la reportería a la medida",
      "Conexión del portal de cliente",
    ],
  },
  {
    name: "Implementación Sistema Meliora",
    tag: "Si no tienes sistema o prefieres el nuestro",
    description:
      "Dejamos tu operación funcionando sobre nuestro sistema, estandarizado y listo para crecer.",
    items: [
      "Setup contable y de remuneraciones",
      "Carga de saldos y maestros",
      "Portal de cliente operativo",
    ],
  },
];

const base = [
  {
    name: "Contabilidad y Cumplimiento",
    description: "Cierre mensual al día · IVA / F29 · respaldo ante el SII",
    highlighted: false,
  },
  {
    name: "Remuneraciones",
    description:
      "Liquidaciones · Previred y Seguro Social · contratos y finiquitos",
    highlighted: false,
  },
  {
    name: "Reportería en Tiempo y Forma",
    description:
      "Informes gerenciales en cada cierre · portal de cliente 24/7",
    highlighted: true,
  },
];

export default function PlanesPage() {
  return (
    <>
      <section className="bg-navy py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-emerald font-semibold text-sm tracking-wide uppercase mb-4">
            Planes
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white max-w-2xl">
            Servicio Integral Meliora
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl">
            Un servicio modular y escalable centrado en reportería en tiempo y
            forma, personalización y acompañamiento mes a mes, sobre tu sistema
            o el nuestro. Partes con lo que necesitas hoy y sumas el resto
            cuando tenga sentido.
          </p>
          <p className="mt-4 text-sm font-semibold text-emerald">
            Desde 8 UF/mes · sin permanencia mínima · cotización a la medida
            tras el diagnóstico
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
          <div className="max-w-2xl mb-12">
            <p className="text-emerald font-semibold text-sm tracking-wide uppercase mb-3">
              Paso 1 · Una sola vez
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
              Implementación inicial: dos caminos
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Antes de operar mes a mes, dejamos la base ordenada. El camino
              depende de una sola pregunta: ¿trabajamos sobre tu sistema o
              sobre el nuestro?
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {caminos.map((camino) => (
              <div
                key={camino.name}
                className="rounded-2xl border border-slate-200 p-8"
              >
                <p className="text-xs font-semibold text-emerald uppercase tracking-wider mb-3">
                  {camino.tag}
                </p>
                <h3 className="text-lg font-bold text-navy mb-2">
                  {camino.name}
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  {camino.description}
                </p>
                <ul className="space-y-3">
                  {camino.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
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
                      <span className="text-sm text-slate-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-emerald font-semibold text-sm tracking-wide uppercase mb-3">
              Paso 2 · Mensual
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
              Servicio base: la operación recurrente
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Los módulos que mantienen tu empresa al día todos los meses.
              Puedes contratarlos juntos o partir solo con los que necesitas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {base.map((mod) => (
              <div
                key={mod.name}
                className={`rounded-2xl p-8 ${
                  mod.highlighted
                    ? "bg-navy text-white ring-2 ring-emerald"
                    : "bg-white border border-slate-200"
                }`}
              >
                {mod.highlighted && (
                  <span className="inline-block text-xs font-semibold text-emerald uppercase tracking-wider mb-3">
                    El corazón del servicio
                  </span>
                )}
                <h3
                  className={`text-lg font-bold mb-3 ${
                    mod.highlighted ? "text-white" : "text-navy"
                  }`}
                >
                  {mod.name}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    mod.highlighted ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {mod.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200/60 px-8 py-5 text-center">
            <p className="text-sm text-navy">
              <span className="font-bold uppercase tracking-wider text-xs mr-2">
                Anual, incluido:
              </span>
              Estados Financieros · Declaración de Renta · Declaraciones
              Juradas
            </p>
          </div>

          <div className="mt-6 rounded-2xl bg-emerald/10 border border-emerald/20 p-8 text-center">
            <p className="text-lg font-bold text-emerald-dark mb-1">
              Acompañamiento cercano, siempre incluido
            </p>
            <p className="text-sm text-slate-600">
              Sesión mensual sobre tus números · revisión continua de procesos
              · trato directo con Israel
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-emerald font-semibold text-sm tracking-wide uppercase mb-3">
              Paso 3 · Cuando tu empresa lo pida
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
              Plan avanzado y complementos
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Sobre el servicio base puedes sumar una dirección de finanzas
              completa o módulos puntuales para tu operación.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border-2 border-amber-400/70 p-8">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3">
                Plan avanzado
              </p>
              <h3 className="text-lg font-bold text-navy mb-2">
                CFO Externo / Dirección de Finanzas
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                No revisamos tus informes gerenciales: los construimos desde
                cero y los defendemos contigo en cada sesión.
              </p>
              <ul className="space-y-3">
                {[
                  "Elaboración de reportes gerenciales completos",
                  "Presupuesto anual",
                  "Forecast rolling 8–12 semanas",
                  "Sesión estratégica mensual",
                  "Reporting en inglés (si aplica)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <svg
                      className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5"
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
                    <span className="text-sm text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 p-8">
              <p className="text-xs font-semibold text-emerald uppercase tracking-wider mb-3">
                Complementos
              </p>
              <h3 className="text-lg font-bold text-navy mb-2">
                Módulos para tu operación
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Se suman a cualquier plan, de forma permanente o por proyecto.
              </p>
              <ul className="space-y-3">
                {[
                  "Dashboards ad hoc sobre tu ERP",
                  "Automatización de procesos",
                  "Costeo de importaciones",
                  "Apoyo en auditorías externas",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
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
                    <span className="text-sm text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 rounded-2xl bg-navy p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  ¿Y el precio?
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Los planes parten desde 8 UF al mes, sin permanencia mínima.
                  El valor final se cotiza a la medida según tu sistema, tu
                  volumen de movimientos y los módulos que elijas, después de
                  un diagnóstico gratuito.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row md:justify-end gap-4">
                <Link
                  href="/contacto"
                  className="inline-flex items-center justify-center rounded-lg bg-emerald px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-dark transition-colors"
                >
                  Pedir mi cotización
                </Link>
                <Link
                  href="/diagnostico"
                  className="inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Partir por el diagnóstico
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white border-t border-slate-100">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy text-center mb-12">
            Preguntas frecuentes
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            {faqs.map((faq) => (
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
            los módulos que mejor se ajustan a tu empresa.
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
