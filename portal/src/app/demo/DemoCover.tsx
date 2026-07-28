import { Logo } from "@/components/Logo";

const FEATURES: { title: string; desc: string; icon: React.ReactNode }[] = [
  {
    title: "Ventas y Forecast",
    desc: "Real vs. presupuesto por mes, línea de negocio y proyección a 6 meses.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 15l4-4 3 3 5-6" />
    ),
  },
  {
    title: "Flujo de Caja",
    desc: "Ingresos y egresos mensuales, con saldo proyectado y alertas de liquidez.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2m2-8l3 3-3 3m-6-3h9"
      />
    ),
  },
  {
    title: "Cobranza y Deuda",
    desc: "Antigüedad de cartera por cliente, DSO y cuentas por pagar al día.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    title: "Estado de Resultados",
    desc: "P&L comparativo interanual bajo norma IFRS (IAS 1), listo para directorio.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17V9m4 8V5m4 12v-4M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    ),
  },
  {
    title: "Balance General",
    desc: "Activos, pasivos y patrimonio consolidados, con márgenes por producto.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h7"
      />
    ),
  },
  {
    title: "CAPEX y Dotación",
    desc: "Ejecución de inversiones, nómina y calendario tributario en un solo lugar.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4v16m8-8H4"
      />
    ),
  },
];

function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald/10 text-emerald shrink-0">
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        {children}
      </svg>
    </span>
  );
}

/** Mockup del dashboard hecho solo con CSS/SVG — sin imágenes externas. */
function DashboardPreview() {
  const bars = [38, 52, 45, 61, 55, 70, 64, 82];
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm shadow-2xl shadow-black/20 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-emerald-light uppercase">Reporte gerencial</p>
          <p className="text-sm font-semibold text-white mt-0.5">Empresa Demo SpA · Julio 2026</p>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium text-slate-200">En vivo</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Ventas YTD", value: "$595 MM", trend: "+16,1%", up: true },
          { label: "EBITDA", value: "15,8%", trend: "+4,6 pp", up: true },
          { label: "DSO", value: "42 días", trend: "-10 días", up: true },
        ].map((k) => (
          <div key={k.label} className="rounded-lg bg-white/5 px-3 py-2.5">
            <p className="text-[10px] text-slate-400">{k.label}</p>
            <p className="text-sm font-bold text-white mt-0.5">{k.value}</p>
            <p className="text-[10px] font-medium text-emerald-light mt-0.5">{k.trend}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-white/5 p-4">
        <div className="flex items-end justify-between gap-1.5 h-24">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald to-emerald-light" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[9px] text-slate-500">Ene</span>
          <span className="text-[9px] text-slate-500">Jul</span>
        </div>
      </div>
    </div>
  );
}

export function DemoCover() {
  return (
    <>
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-navy-dark">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(14,124,102,0.35), transparent 40%), radial-gradient(circle at 85% 0%, rgba(27,42,74,0.6), transparent 45%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14 sm:pb-24">
          <Logo theme="dark" />

          <div className="mt-10 sm:mt-14 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
                <svg className="h-3.5 w-3.5 text-emerald-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Demo interactiva · datos ficticios
              </span>

              <h1 className="mt-5 text-3xl sm:text-4xl lg:text-[2.7rem] font-bold text-white leading-tight tracking-tight">
                El reporte gerencial que tu directorio espera cada mes,
                <span className="text-emerald-light"> listo antes de que lo pidan.</span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                Meliora Advisory transforma tu contabilidad en un portal ejecutivo: ventas, flujo de caja,
                cobranza, estado de resultados y más — actualizado cada cierre, sin planillas.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#acceso"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald px-6 py-3.5 text-sm font-semibold text-white hover:bg-emerald-light transition-colors shadow-lg shadow-emerald/20"
                >
                  Ver la demo interactiva
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </a>
                <p className="text-xs text-slate-400">2 minutos · sin tarjeta de crédito · datos de ejemplo</p>
              </div>
            </div>

            <DashboardPreview />
          </div>
        </div>
      </div>

      {/* ── Qué vas a ver ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="max-w-2xl mb-10">
            <p className="text-emerald font-semibold text-xs tracking-[0.15em] uppercase mb-2">Qué vas a ver</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">
              Un portal, todos los números que importan
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex gap-3.5 rounded-xl border border-slate-200 bg-slate-50/60 p-4 hover:border-emerald/40 hover:bg-white transition-colors"
              >
                <FeatureIcon>{f.icon}</FeatureIcon>
                <div>
                  <p className="text-sm font-semibold text-navy">{f.title}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
