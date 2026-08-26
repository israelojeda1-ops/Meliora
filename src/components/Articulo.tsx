import Link from "next/link";
import type { Articulo } from "@/lib/recursos";

export function ArticuloLayout({
  articulo,
  children,
}: {
  articulo: Articulo;
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: articulo.titulo,
    description: articulo.bajada,
    datePublished: articulo.fecha,
    inLanguage: "es-CL",
    author: {
      "@type": "Organization",
      name: "Meliora Advisory",
      url: "https://melioraadvisory.cl",
    },
    publisher: {
      "@type": "Organization",
      name: "Meliora Advisory",
      url: "https://melioraadvisory.cl",
    },
    mainEntityOfPage: `https://melioraadvisory.cl/recursos/${articulo.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="bg-navy py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-emerald font-semibold text-sm tracking-wide uppercase mb-4">
            {articulo.tag}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            {articulo.titulo}
          </h1>
          <p className="mt-5 text-lg text-slate-300">{articulo.bajada}</p>
        </div>
      </section>

      <article className="py-14 sm:py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-5 text-[15px] leading-relaxed text-slate-600 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-navy [&_h2]:mt-10 [&_h2]:mb-3 [&_strong]:text-navy [&_a]:text-emerald [&_a]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2">
          {children}
        </div>
      </article>

      <section className="py-14 sm:py-16 bg-slate-50 border-t border-slate-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-navy mb-3">
            ¿Quieres estos números resueltos para tu pyme?
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto mb-8">
            Reportería gerencial en tiempo y forma, personalizada y con
            acompañamiento mes a mes. Parte midiendo gratis dónde está tu
            empresa.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/diagnostico"
              className="inline-flex items-center justify-center rounded-lg bg-emerald px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-dark transition-colors"
            >
              Diagnóstico Financiero gratis
            </Link>
            <Link
              href="/recursos"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 hover:border-emerald hover:text-emerald transition-colors"
            >
              Más recursos
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
