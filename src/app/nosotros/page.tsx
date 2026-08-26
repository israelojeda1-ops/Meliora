import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nosotros — Meliora Advisory",
  description:
    "Meliora Advisory fue fundada por Israel Ojeda Millán, Contador Auditor y MBA de la Universidad de Chile, con más de 12 años liderando áreas de finanzas.",
};

const sectores = [
  "Farmacéutico",
  "Retail",
  "Construcción",
  "Inmobiliario",
  "Minería",
];

const logros = [
  {
    value: "40%",
    title: "Reducción en tiempos de reportería financiera",
    description:
      "Automatización de reportería gerencial con Power BI, eliminando procesos manuales en Excel.",
  },
  {
    value: "30%",
    title: "Reducción en tiempos de cierre contable mensual",
    description:
      "Optimización de procesos de cierre mediante estandarización y automatización de conciliaciones.",
  },
  {
    value: "20%",
    title: "Mejora en flujo de caja disponible",
    description:
      "Reestructuración de deuda y optimización de capital de trabajo en empresa del sector construcción.",
  },
  {
    value: "25%",
    title: "Reducción en tiempos de análisis financiero",
    description:
      "Automatización de reportes de control de costos en proyectos de construcción con SQL Server y Power BI.",
  },
];

export default function NosotrosPage() {
  return (
    <>
      <section className="bg-navy py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-emerald font-semibold text-sm tracking-wide uppercase mb-4">
            Nosotros
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white max-w-2xl">
            Experiencia real en finanzas corporativas, aplicada a tu PyME
          </h1>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-2xl font-bold text-navy mb-6">
                Quién está detrás de Meliora
              </h2>
              <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                <p>
                  Me llamo <strong className="text-navy">Israel Ojeda Millán</strong>.
                  Soy <strong className="text-navy">Contador Auditor y MBA de
                  la Universidad de Chile</strong>, y pasé más de 12 años
                  liderando áreas de finanzas, contabilidad IFRS, tesorería y
                  control de gestión en empresas de las industrias
                  farmacéutica, retail, construcción, inmobiliaria y minería,
                  reportando cada mes en inglés a casas matrices
                  internacionales.
                </p>
                <p>
                  Meliora nace de algo que vi durante años: las pymes chilenas
                  reciben de su contador lo justo para cumplir con el SII, y
                  casi nunca los números que de verdad sirven para decidir.
                  Margen por línea, cobranza, caja proyectada: eso en una
                  empresa grande lo produce una gerencia completa. En una pyme,
                  nadie.
                </p>
                <p>
                  Por eso armé un servicio donde contabilidad, remuneraciones y
                  reportería salen del mismo lugar y cierran entre sí, con
                  dashboards en{" "}
                  <strong className="text-navy">
                    Power BI, SQL Server y Looker Studio
                  </strong>{" "}
                  sobre el sistema que ya uses. Y el análisis lo hago yo, no un
                  pool de analistas junior.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl bg-slate-50 p-8">
                <h3 className="text-sm font-semibold text-navy uppercase tracking-wider mb-4">
                  Formación
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-navy">
                      MBA — Master in Business Administration
                    </p>
                    <p className="text-sm text-slate-500">
                      Universidad de Chile
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">
                      Contador Auditor
                    </p>
                    <p className="text-sm text-slate-500">
                      Universidad de Chile
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-8">
                <h3 className="text-sm font-semibold text-navy uppercase tracking-wider mb-4">
                  Sectores con experiencia directa
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sectores.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center rounded-full bg-navy/10 px-3 py-1 text-xs font-medium text-navy"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-8">
                <h3 className="text-sm font-semibold text-navy uppercase tracking-wider mb-4">
                  Herramientas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Power BI",
                    "SQL Server",
                    "Looker Studio",
                    "Softland",
                    "Odoo",
                    "Nubox",
                    "Defontana",
                    "Excel avanzado",
                  ].map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full bg-emerald/10 px-3 py-1 text-xs font-medium text-emerald-dark"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy">
              Resultados
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {logros.map((l) => (
              <div
                key={l.title}
                className="rounded-2xl border border-slate-200 p-8"
              >
                <p className="text-3xl font-bold text-emerald mb-3">
                  {l.value}
                </p>
                <h3 className="text-base font-semibold text-navy mb-2">
                  {l.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {l.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-navy">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            La misma profundidad de una gerencia de finanzas, al alcance de tu
            PyME
          </h2>
          <p className="text-slate-300 max-w-lg mx-auto mb-8">
            Conversemos sobre cómo podemos ayudarte a tener el control
            financiero que tu empresa necesita.
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
