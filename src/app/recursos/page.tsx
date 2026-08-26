import type { Metadata } from "next";
import Link from "next/link";
import { articulos } from "@/lib/recursos";

export const metadata: Metadata = {
  title: "Recursos para PyMEs — Finanzas, Remuneraciones y Tributario | Meliora Advisory",
  description:
    "Guías prácticas para dueños de pymes en Chile: costo de contratación, boleta vs contrato, reforma previsional, flujo de caja e indicadores de gestión.",
  openGraph: {
    title: "Recursos para PyMEs — Meliora Advisory",
    description:
      "Guías prácticas de finanzas, remuneraciones y tributario para pymes chilenas.",
    url: "https://melioraadvisory.cl/recursos",
  },
};

export default function RecursosPage() {
  return (
    <>
      <section className="bg-navy py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-emerald font-semibold text-sm tracking-wide uppercase mb-4">
            Recursos
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white max-w-3xl">
            Guías prácticas para las finanzas de tu pyme
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl">
            Sin jerga y con cifras vigentes: remuneraciones, tributario,
            reforma previsional y gestión financiera.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          {articulos.map((a) => (
            <Link
              key={a.slug}
              href={`/recursos/${a.slug}`}
              className="block rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 hover:border-emerald/40 hover:shadow-lg transition-all"
            >
              <p className="text-xs font-semibold text-emerald uppercase tracking-wider mb-2">
                {a.tag}
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-navy mb-2">
                {a.titulo}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">{a.bajada}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-navy mb-3">
            Herramientas gratuitas
          </h2>
          <p className="text-sm text-slate-500 mb-8">
            Para pasar de la lectura a los números de tu empresa.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "/calculadora", label: "Calculadora Salarial" },
              { href: "/calculadora-honorarios", label: "Boleta de Honorarios" },
              { href: "/calculadora-finiquito", label: "Finiquito" },
              { href: "/indicadores", label: "Indicadores de hoy" },
              { href: "/diagnostico", label: "Diagnóstico Financiero" },
            ].map((h) => (
              <Link
                key={h.href}
                href={h.href}
                className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 hover:border-emerald hover:text-emerald transition-colors"
              >
                {h.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
