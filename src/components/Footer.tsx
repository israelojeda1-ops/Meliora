import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-navy text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-white">Meliora</span>
              <span className="text-sm font-medium text-emerald">Advisory</span>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              Todo lo financiero de tu PyME, en un solo lugar — y siempre a la
              vista. Contabilidad, remuneraciones y finanzas que sí conversan
              entre sí.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Navegación
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Inicio" },
                { href: "/servicios", label: "Servicios" },
                { href: "/nosotros", label: "Nosotros" },
                { href: "/planes", label: "Planes y Precios" },
                { href: "/contacto", label: "Contacto" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Servicios
            </h4>
            <ul className="space-y-2">
              {[
                "CFO as a Service",
                "Contabilidad y Remuneraciones",
                "Consultoría de Gestión",
              ].map((s) => (
                <li key={s}>
                  <Link
                    href="/servicios"
                    className="text-sm hover:text-white transition-colors"
                  >
                    {s}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://portal.melioraadvisory.cl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  Portal Clientes
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Meliora Advisory SpA. Todos los
            derechos reservados.
          </p>
          <p className="text-xs text-slate-400">Santiago, Chile</p>
        </div>
      </div>
    </footer>
  );
}
