import Link from "next/link";

const pillars = [
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: "Todo integrado",
    description:
      "Contabilidad, remuneraciones y reportería gerencial en un mismo servicio y el mismo interlocutor. Sin coordinar tres proveedores.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
      </svg>
    ),
    title: "Cero fricción de sistema",
    description:
      "Trabajamos dentro del ERP que ya usas — Softland, Odoo, Nubox, Defontana — o te lo implementamos. Nunca se obliga a migrar.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Indicadores que hoy no tienes",
    description:
      "Margen por producto/línea, cobranza y DSO, entregados cada mes de forma simple. Decisiones con datos, no intuición.",
    items: [
      "Reporte gerencial continuo: monitoreo mensual de resultados y proyecciones",
      "Sesión de asesoría personalizada mensual",
    ],
  },
];

const services = [
  {
    tag: "Finanzas",
    title: "CFO as a Service",
    items: [
      "Reportes gerenciales mensuales",
      "KPIs de margen y cobranza",
      "Flujo de caja y forecast rolling 8–12 semanas",
      "Presupuesto anual",
      "Sesión de análisis mensual",
    ],
  },
  {
    tag: "Operaciones",
    title: "Contabilidad y Remuneraciones",
    items: [
      "Contabilidad mensual completa",
      "IVA / F29",
      "Liquidaciones de sueldo y Previred",
      "Contratos y finiquitos",
      "Estados Financieros y Renta",
    ],
  },
  {
    tag: "Estrategia",
    title: "Consultoría de Gestión",
    items: [
      "Diagnóstico operacional (2–4 semanas)",
      "Informe de quick wins",
      "Rediseño de procesos",
      "Automatización de reportes",
    ],
  },
];

const stats = [
  { value: "12+", label: "Años en finanzas" },
  { value: "7+", label: "Años en liderazgo" },
  { value: "5", label: "Sectores con experiencia" },
  { value: "IFRS", label: "Reporting internacional" },
];

const results = [
  {
    value: "40%",
    label: "Reducción en tiempos de reportería financiera",
    detail: "Automatización con Power BI",
  },
  {
    value: "30%",
    label: "Reducción en tiempos de cierre contable",
    detail: "Optimización de procesos",
  },
  {
    value: "20%",
    label: "Mejora en flujo de caja disponible",
    detail: "Reestructuración de deuda",
  },
  {
    value: "25%",
    label: "Reducción en tiempos de análisis financiero",
    detail: "Automatización de reportes",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(14,124,102,0.3),_transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(14,124,102,0.15),_transparent_50%)]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <p className="text-emerald font-semibold text-sm tracking-wide uppercase mb-4">
              Asesoría financiera para PyMEs
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              El orden financiero que tu PyME necesita, sin cambiar de sistema ni
              contratar tres proveedores.
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-2xl">
              Contabilidad, remuneraciones y finanzas que sí conversan entre sí.
              Un solo equipo, tu mismo sistema, indicadores reales cada mes.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center rounded-lg bg-emerald px-6 py-3 text-base font-semibold text-white hover:bg-emerald-dark transition-colors"
              >
                Agendar reunión gratuita
              </Link>
              <Link
                href="/servicios"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Ver servicios
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pilares ── */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy">
              Todo lo financiero de tu PyME, en un solo lugar
            </h2>
            <p className="mt-4 text-slate-500">
              — y siempre a la vista.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-2xl border border-slate-200 p-8 hover:border-emerald/30 hover:shadow-lg transition-all"
              >
                <div className="inline-flex items-center justify-center rounded-xl bg-emerald/10 p-3 text-emerald mb-6">
                  {pillar.icon}
                </div>
                <h3 className="text-lg font-semibold text-navy mb-3">
                  {pillar.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {pillar.description}
                </p>
                {"items" in pillar && pillar.items && (
                  <ul className="mt-4 space-y-2 pt-4 border-t border-slate-100">
                    {pillar.items.map((item) => (
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
                        <span className="text-sm text-slate-500">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problema / Contexto ── */}
      <section className="py-20 sm:py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-emerald font-semibold text-sm tracking-wide uppercase mb-4">
                El problema
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-6">
                ¿Te suena familiar?
              </h2>
              <div className="space-y-5">
                {[
                  "Coordinas un contador externo para IVA, otro software para remuneraciones y nadie arma reportes gerenciales — o los armas tú mismo, tarde.",
                  "No revisas indicadores clave (margen por línea, estado real de cobranza, DSO) porque nadie te los entrega de forma periódica.",
                  "No haces budgeting ni forecast: administras mirando el retrovisor, sin una proyección de caja que anticipe déficits.",
                  "Cuando buscas ayuda encuentras dos extremos: un contador que solo cumple, o una firma boutique con honorarios de empresa grande.",
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="flex-shrink-0 mt-1 h-6 w-6 rounded-full bg-navy/10 text-navy text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-navy p-10 text-white">
              <h3 className="text-xl font-bold mb-4">
                Meliora resuelve las cuatro brechas
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Integramos contabilidad, remuneraciones y reportería gerencial en
                un solo servicio. Trabajamos en tu sistema, entregamos indicadores
                mensuales y armamos tu presupuesto y forecast — a un precio que
                tiene sentido para una PyME.
              </p>
              <div className="space-y-3">
                {[
                  "Un interlocutor para todo lo financiero",
                  "Indicadores mensuales listos para decidir",
                  "Presupuesto y forecast rolling",
                  "Precio ajustado al tamaño de tu empresa",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-emerald flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-sm text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Servicios ── */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-emerald font-semibold text-sm tracking-wide uppercase mb-4">
              Servicios
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy">
              Tres líneas, un solo equipo
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.title}
                className="rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="bg-navy px-6 py-5">
                  <span className="inline-block text-xs font-semibold text-emerald uppercase tracking-wider mb-1">
                    {service.tag}
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {service.title}
                  </h3>
                </div>
                <div className="px-6 py-6">
                  <ul className="space-y-3">
                    {service.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <svg className="h-4 w-4 text-emerald flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span className="text-sm text-slate-600">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/servicios"
                    className="mt-6 inline-flex items-center text-sm font-semibold text-emerald hover:text-emerald-dark transition-colors"
                  >
                    Más detalles
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Resultados ── */}
      <section className="py-20 sm:py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-emerald font-semibold text-sm tracking-wide uppercase mb-4">
              Trayectoria
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy">
              Resultados reales de más de una década en finanzas
            </h2>
            <p className="mt-4 text-sm text-slate-500">
              Logros como líder de finanzas en industrias farmacéutica, retail,
              construcción, inmobiliaria y minería.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {results.map((r) => (
              <div
                key={r.label}
                className="rounded-2xl bg-white border border-slate-200 p-6 text-center"
              >
                <p className="text-3xl sm:text-4xl font-bold text-emerald">
                  {r.value}
                </p>
                <p className="mt-2 text-sm font-medium text-navy">
                  {r.label}
                </p>
                <p className="mt-1 text-xs text-slate-400">{r.detail}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-navy">{s.value}</p>
                <p className="mt-1 text-xs text-slate-500 uppercase tracking-wider">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pilares adicionales ── */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Budgeting y forecast",
                description:
                  "Presupuesto anual y proyección de caja rolling 8–12 semanas, para decidir mirando hacia adelante.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                ),
              },
              {
                title: "Asesoría personalizada",
                description:
                  "Trato directo con quien hace el análisis, no un pool de analistas junior. Cada sesión se ajusta a tu negocio.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                ),
              },
              {
                title: "Precio accesible",
                description:
                  "Honorarios ajustados al tamaño real del cliente, no la tarifa de una firma boutique corporativa.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: "Siempre a la vista",
                description:
                  "Portal de cliente con los números actualizados en cada cierre mensual. Transparencia total.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-start">
                <div className="inline-flex items-center justify-center rounded-lg bg-navy/5 p-2.5 text-navy mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold text-navy mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="py-20 sm:py-24 bg-navy">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            ¿Listo para ordenar las finanzas de tu PyME?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-10">
            Agenda una reunión de diagnóstico sin costo. Conversamos sobre tu
            operación, identificamos las brechas y te proponemos un plan
            concreto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center rounded-lg bg-emerald px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-dark transition-colors"
            >
              Agendar reunión gratuita
            </Link>
            <Link
              href="/planes"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Ver planes y precios
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
