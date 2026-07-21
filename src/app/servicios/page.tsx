import type { Metadata } from "next";
import Link from "next/link";
import { ContabilidadFlowDiagram } from "@/components/ContabilidadFlowDiagram";

export const metadata: Metadata = {
  title: "Servicios — CFO Externo, Contabilidad y Dashboards Softland | Meliora Advisory",
  description:
    "CFO as a Service, Contabilidad y Remuneraciones, Consultoría de Gestión, y dashboards de reportería gerencial automatizados sobre Softland, Softland Cloud u otro ERP. Tres líneas de servicio financiero para PyMEs en Chile.",
};

const servicios = [
  {
    id: "cfo",
    tag: "Finanzas",
    title: "CFO as a Service",
    subtitle:
      "La dirección financiera que tu PyME necesita, sin el costo de un CFO de planta.",
    description:
      "Asumimos la función de dirección financiera de tu empresa. Entregamos reportería gerencial mensual, KPIs de margen y cobranza, flujo de caja, presupuesto anual y forecast rolling de 8 a 12 semanas. Incluye una sesión mensual de análisis con el fundador o gerente general para revisar resultados, proyecciones y decisiones clave. Si tu empresa usa Softland (incluido Softland Cloud), construimos dashboards y reportes automatizados conectados directo a tu base de datos — sin depender de que el ERP tenga el informe que necesitas. También hacemos reportes ad hoc para cualquier otro sistema o ERP, no solo Softland.",
    items: [
      "Reportes gerenciales mensuales con análisis de variaciones",
      "KPIs: margen por producto/línea, DSO, estado de cobranza",
      "Flujo de caja proyectado y forecast rolling 8–12 semanas",
      "Presupuesto anual y seguimiento mensual de ejecución",
      "Dashboards automatizados sobre Softland / Softland Cloud, SQL Server y Power BI",
      "Reportes ad hoc para cualquier otro sistema o ERP",
      "Sesión mensual de análisis estratégico",
      "Reporting en inglés a casa matriz (si aplica)",
    ],
    forWho:
      "PyMEs con ventas sobre CLP 1.000 MM que necesitan control financiero real pero no justifican un CFO de planta.",
  },
  {
    id: "contabilidad",
    tag: "Operaciones",
    title: "Contabilidad y Remuneraciones",
    subtitle:
      "Cumplimiento tributario y laboral completo, integrado con tu sistema.",
    description:
      "Nos hacemos cargo de toda la operación contable y de remuneraciones. Trabajamos dentro del ERP que ya usas — Softland, Odoo, Nubox, Defontana — o te lo implementamos. No obligamos a migrar: nos adaptamos a tu sistema para que el cambio sea cero fricción.",
    items: [
      "Contabilidad mensual completa",
      "Declaración de IVA / F29",
      "Liquidaciones de sueldo y cálculo de Previred",
      "Contratos de trabajo y finiquitos",
      "Estados Financieros (EEFF) bajo normativa vigente",
      "Declaración de Renta anual",
      "Integración con el ERP existente del cliente",
    ],
    forWho:
      "Toda PyME que quiera externalizar su contabilidad y remuneraciones con un proveedor que realmente entienda el negocio.",
  },
  {
    id: "consultoria",
    tag: "Estrategia",
    title: "Consultoría de Gestión y Mejora de Procesos",
    subtitle:
      "Diagnóstico operacional con entregables concretos en 2 a 4 semanas.",
    description:
      "Realizamos un diagnóstico operacional intensivo de 2 a 4 semanas. Identificamos ineficiencias, proponemos quick wins inmediatos y diseñamos un plan de mejora con rediseño de procesos y automatización. No es un informe que se archiva: es un plan de acción con plazos, responsables y métricas.",
    items: [
      "Diagnóstico operacional de 2–4 semanas",
      "Informe de quick wins con impacto inmediato",
      "Rediseño de procesos administrativos y financieros",
      "Automatización de reportes (Power BI, Looker Studio, SQL Server)",
      "Plan de implementación con plazos y responsables",
    ],
    forWho:
      "PyMEs que sienten que su operación administrativa frena el crecimiento y quieren resultados rápidos.",
  },
];

export default function ServiciosPage() {
  return (
    <>
      <section className="bg-navy py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-emerald font-semibold text-sm tracking-wide uppercase mb-4">
            Servicios
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white max-w-2xl">
            Tres líneas de servicio, un solo equipo que entiende tu negocio
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl">
            Contabilidad, remuneraciones y finanzas que sí conversan entre sí.
          </p>
        </div>
      </section>

      {servicios.map((s, i) => (
        <section
          key={s.id}
          id={s.id}
          className={`py-20 sm:py-24 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <span className="inline-block text-xs font-semibold text-emerald uppercase tracking-wider mb-2">
                  {s.tag}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-2">
                  {s.title}
                </h2>
                <p className="text-base text-slate-500 mb-6">{s.subtitle}</p>
                <p className="text-sm text-slate-600 leading-relaxed mb-8">
                  {s.description}
                </p>
                <div className="rounded-xl bg-navy/5 p-5">
                  <p className="text-xs font-semibold text-navy uppercase tracking-wider mb-2">
                    Ideal para
                  </p>
                  <p className="text-sm text-slate-600">{s.forWho}</p>
                </div>
              </div>
              <div>
                <div className="rounded-2xl border border-slate-200 bg-white p-8">
                  <h3 className="text-sm font-semibold text-navy uppercase tracking-wider mb-6">
                    Qué incluye
                  </h3>
                  <ul className="space-y-4">
                    {s.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <svg
                          className="h-5 w-5 text-emerald flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
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
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <Link
                      href="/contacto"
                      className="inline-flex items-center justify-center w-full rounded-lg bg-emerald px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-dark transition-colors"
                    >
                      Consultar por este servicio
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {s.id === "contabilidad" && (
              <div className="mt-16 sm:mt-20">
                <div className="text-center mb-8">
                  <span className="inline-block text-xs font-semibold text-emerald uppercase tracking-wider mb-2">
                    Meliora Advisory
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-navy">
                    ¿Qué incluye tu contabilidad?
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">
                    Del Libro de Compras y Ventas del SII al informe ejecutivo
                    — un solo flujo, siempre al día. Compatible con Softland,
                    Softland Cloud y otros ERP.
                  </p>
                </div>

                <div className="relative -mx-4 sm:mx-0 py-8 sm:py-10">
                  <div className="overflow-x-auto sm:overflow-visible px-4 sm:px-0">
                    <ContabilidadFlowDiagram className="h-auto w-[950px] sm:w-full" />
                  </div>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0 right-0 h-full w-14 bg-gradient-to-l from-white to-transparent sm:hidden"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      ))}

      <section className="py-20 sm:py-24 bg-navy">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            ¿No sabes qué servicio necesitas?
          </h2>
          <p className="text-slate-300 max-w-lg mx-auto mb-8">
            Agenda una reunión de diagnóstico gratuita. Conversamos sobre tu
            operación y te recomendamos el servicio que más se ajusta.
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
