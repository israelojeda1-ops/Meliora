import type { Metadata } from "next";

/**
 * /nuprotecV2 ya no proxea a Vercel: muestra el cartel de mudanza y nada más.
 *
 * La copia de Vercel quedó congelada cuando Nuprotec pasó al servidor propio, y
 * ya traía este mismo cartel encima de la aplicación. Seguir proxeándola tenía
 * dos costos y ningún beneficio: el rodeo por Washington, y que la app vieja
 * siguiera en pie invitando a escribir en una base que nadie mira.
 *
 * Con esto el portal responde por su cuenta y Vercel deja de hacer falta para
 * v2 —que además hoy es inalcanzable: el proyecto no tiene dominio propio y sus
 * URLs .vercel.app están detrás del SSO de Vercel—. El texto es el mismo del
 * cartel que ya se mostraba (AvisoMudanza.tsx, repo nuprotec-informes) para que
 * quien lo vio ayer reconozca la pantalla.
 *
 * Es catch-all: cualquier ruta vieja que alguien tenga guardada
 * (/nuprotecV2/cobertura, /nuprotecV2/eerr…) cae acá y encuentra el camino al
 * portal nuevo, en vez de un 404.
 */

// URL absoluta al hostname propio de la app y no la ruta relativa del portal:
// el portal es un proxy que puede estar caído sin que Nuprotec lo esté —pasó el
// 27-09—, y así el botón funciona igual.
const NUEVO = "https://nuprotec.melioraadvisory.cl/Nuprotecv3";

export const metadata: Metadata = {
  title: "Nos mudamos · Portal NÜPROTEC",
  robots: { index: false, follow: false },
};

const RAZONES = [
  {
    titulo: "Más rápido",
    texto:
      "Corre en un servidor en Chile dedicado a nuestros clientes: las pantallas y los informes cargan antes.",
    color: "from-amber-400 to-orange-500",
    icono: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  },
  {
    titulo: "Más seguro",
    texto:
      "Tus datos en infraestructura propia, con acceso protegido y respaldos cifrados cada noche.",
    color: "from-emerald-400 to-teal-600",
    icono: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </>
    ),
  },
  {
    titulo: "Más confiable",
    texto: "Vigilancia las 24 horas, con avisos automáticos ante cualquier falla.",
    color: "from-sky-400 to-indigo-600",
    icono: <path d="M3 12h4l2-5 4 10 2-5h6" />,
  },
];

export default function NuprotecV2() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-teal-950 to-indigo-950 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-white/20">
        {/* Encabezado: escudo sobre degradado */}
        <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-700 px-7 pb-7 pt-8 text-white">
          <svg aria-hidden viewBox="0 0 200 200" className="absolute -right-10 -top-10 h-48 w-48 text-white/10">
            <circle cx="100" cy="100" r="90" fill="currentColor" />
          </svg>
          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
              <svg aria-hidden viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6L12 3Z" />
                <path d="m8.8 12.2 2.2 2.2 4.3-4.6" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/80">Portal NÜPROTEC</p>
              <h1 className="text-3xl font-bold leading-tight">Nos mudamos</h1>
            </div>
          </div>
          <p className="relative mt-4 text-sm leading-relaxed text-white/90">
            El portal ahora funciona en el servidor propio de Meliora Advisory. Tus datos, tu usuario y tu
            clave son los mismos.
          </p>
        </div>

        <div className="px-7 pb-7 pt-6">
          <ul className="space-y-4">
            {RAZONES.map((r) => (
              <li key={r.titulo} className="flex gap-4">
                <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-gradient-to-br ${r.color} text-white shadow-md`}>
                  <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {r.icono}
                  </svg>
                </span>
                <span className="text-sm text-slate-600">
                  <strong className="block font-semibold text-slate-900">{r.titulo}</strong>
                  {r.texto}
                </span>
              </li>
            ))}
          </ul>
          <a
            href={NUEVO}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            Ir al nuevo portal
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <p className="mt-3 text-center text-xs text-slate-500">Esta versión ya no se actualiza.</p>
        </div>
      </div>
    </main>
  );
}
