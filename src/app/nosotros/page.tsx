import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nosotros — Meliora Advisory",
  description:
    "Meliora Advisory fue fundada por Israel Ojeda, Contador Auditor, MBA y Magíster en Business Intelligence, con más de 15 años de experiencia en finanzas.",
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
      "Automatización de reportería gerencial con Power BI en empresa del sector retail, liderando un equipo de 10 personas.",
  },
  {
    value: "30%",
    title: "Reducción en tiempos de cierre contable mensual",
    description:
      "Estandarización y automatización de conciliaciones del cierre mensual, en la misma operación de retail.",
  },
  {
    value: "20%",
    title: "Mejora en flujo de caja disponible",
    description:
      "Reestructuración de deuda y optimización de capital de trabajo en empresa del sector retail.",
  },
  {
    value: "25%",
    title: "Reducción en tiempos de análisis financiero",
    description:
      "Automatización de reportes de control de costos con Excel avanzado y datos del ERP, en holding de empresas constructoras.",
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
                  <strong className="text-navy">Israel Ojeda</strong> es{" "}
                  <strong className="text-navy">
                    Contador Auditor y MBA de la Universidad de Chile
                  </strong>
                  , y actualmente cursa un Magíster en Business Intelligence y
                  Big Data Analytics. Suma más de 15 años de experiencia en finanzas en rubros
                  tan distintos como el farmacéutico, retail, construcción,
                  inmobiliario y minería, los últimos 8 como gerente de
                  administración y finanzas.
                </p>
                <p>
                  Meliora nació con una idea concreta: acercar los procesos de
                  las empresas más grandes a las pymes. Cierres mensuales
                  ordenados, reportería gerencial, proyección de caja y
                  control de gestión son rutina en una corporación, pero casi
                  nunca llegan a una pyme, donde el contador tradicional se
                  limita a cumplir con el SII.
                </p>
                <p>
                  Por eso Meliora integra contabilidad, remuneraciones y
                  reportería en un solo servicio, trabajando sobre el sistema
                  que cada cliente ya usa. Y no se queda en los números:
                  incluye un acompañamiento cercano y la revisión continua de
                  los procesos, para que el orden se sostenga en el tiempo.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl bg-slate-50 p-8 flex items-center gap-5">
                <Image
                  src="/israel-ojeda.jpg"
                  alt="Israel Ojeda, fundador de Meliora Advisory"
                  width={200}
                  height={200}
                  className="h-24 w-24 rounded-full object-cover ring-2 ring-emerald/30 flex-shrink-0"
                />
                <div>
                  <p className="text-base font-semibold text-navy">
                    Israel Ojeda
                  </p>
                  <p className="text-sm text-slate-500">
                    Fundador de Meliora Advisory
                  </p>
                  <a
                    href="https://www.linkedin.com/in/israelojedamillan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm font-semibold text-emerald hover:text-emerald-dark transition-colors"
                  >
                    Ver perfil en LinkedIn
                  </a>
                </div>
              </div>

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
                      Universidad Tecnológica de Chile, INACAP
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">
                      Magíster en Business Intelligence y Big Data Analytics
                      (en curso)
                    </p>
                    <p className="text-sm text-slate-500">
                      CEUPE Business School, Madrid
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
                    "SAP",
                    "Flexline",
                    "Fin700",
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
