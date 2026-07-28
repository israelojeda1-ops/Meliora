"use client";

import { useEffect, useState, type FormEvent } from "react";
import DemoDashboard from "./DemoDashboard";
import { DemoCover } from "./DemoCover";

const STORAGE_KEY = "melioraDemoAccess";

type Access = { name: string; email: string };

export default function DemoGate() {
  const [access, setAccess] = useState<Access | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setAccess(raw ? (JSON.parse(raw) as Access) : null);
    } catch {
      setAccess(null);
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const resp = await fetch("/demo/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company }),
      });
      const data = await resp.json();
      if (!data.ok) throw new Error(data.error || "Error");
      const entry: Access = { name, email };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
      setAccess(entry);
    } catch {
      setError("No se pudo registrar tu acceso. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  // Mientras se lee localStorage, no mostrar nada para evitar parpadeo.
  if (access === undefined) return null;
  if (access) return <DemoDashboard />;

  return (
    <>
      <DemoCover />
      <div
        id="acceso"
        className="scroll-mt-6 min-h-[60vh] flex items-center justify-center px-4 py-16 sm:py-20 bg-[#f4f6f9]"
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Antes de ver la demo</h2>
          <p className="text-sm text-slate-500 mb-6">Cuéntanos quién eres para mostrarte el reporte.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="demo-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombre
              </label>
              <input
                id="demo-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label htmlFor="demo-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Correo
              </label>
              <input
                id="demo-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald"
                placeholder="tucorreo@empresa.cl"
              />
            </div>
            <div>
              <label htmlFor="demo-company" className="block text-sm font-medium text-slate-700 mb-1.5">
                Empresa <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <input
                id="demo-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald"
                placeholder="Nombre de tu empresa"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-emerald px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-dark transition-colors disabled:opacity-60"
            >
              {submitting ? "Ingresando..." : "Ver la demo"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
