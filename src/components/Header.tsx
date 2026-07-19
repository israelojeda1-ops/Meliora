"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/planes", label: "Planes" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo theme="light" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-navy transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://portal.melioraadvisory.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-emerald hover:text-emerald-dark transition-colors"
            >
              Portal Clientes
            </a>
            <Link
              href="/contacto"
              className="rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-dark transition-colors"
            >
              Agendar reunión
            </Link>
          </nav>

          <button
            type="button"
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            {menuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm font-medium text-slate-600 hover:text-navy"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://portal.melioraadvisory.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm font-medium text-emerald"
            >
              Portal Clientes
            </a>
            <Link
              href="/contacto"
              className="block w-full text-center rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-white"
              onClick={() => setMenuOpen(false)}
            >
              Agendar reunión
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
