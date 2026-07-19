import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mensaje enviado — Meliora Advisory",
  description: "Gracias por escribirnos. Te responderemos a la brevedad.",
};

export default function GraciasPage() {
  return (
    <section className="bg-navy py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center rounded-full bg-emerald/10 p-4 mb-6">
          <svg
            className="h-10 w-10 text-emerald"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          ¡Gracias por escribirnos!
        </h1>
        <p className="text-slate-300 mb-10">
          Recibimos tu mensaje y te responderemos dentro de 24 horas hábiles.
          Si prefieres una respuesta más rápida, escríbenos por WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://wa.me/56949282946"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-emerald px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-dark transition-colors"
          >
            Escríbenos por WhatsApp
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-white/20 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
