"use client";

import { useState } from "react";

const CONTACT_EMAIL = "contacto@melioraadvisory.cl";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = data.get("name")?.toString() ?? "";
    const company = data.get("company")?.toString() ?? "";
    const email = data.get("email")?.toString() ?? "";
    const message = data.get("message")?.toString() ?? "";

    const subject = encodeURIComponent(
      `Consulta de ${name}${company ? ` (${company})` : ""} — Meliora Advisory`
    );
    const body = encodeURIComponent(
      `Nombre: ${name}\nEmpresa: ${company}\nEmail: ${email}\n\nMensaje:\n${message}`
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setStatus("sent");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label
            htmlFor="company"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Empresa
          </label>
          <input
            id="company"
            name="company"
            type="text"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald"
            placeholder="Nombre de tu empresa"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald"
          placeholder="tucorreo@empresa.cl"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Cuéntanos sobre tu empresa
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald resize-none"
          placeholder="Ventas anuales aproximadas, sistema que usan actualmente, principal desafío financiero..."
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-emerald px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-dark transition-colors"
      >
        Enviar mensaje
      </button>

      {status === "sent" && (
        <p className="text-sm text-emerald-dark text-center">
          Se abrió tu cliente de correo con el mensaje listo para enviar.
        </p>
      )}
    </form>
  );
}
