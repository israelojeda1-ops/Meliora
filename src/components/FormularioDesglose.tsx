"use client";

import { useRef, useState } from "react";
import { FORM_ENDPOINT } from "../lib/formularios.ts";
import { pdfBase64, type Bloque, type OpcionesPDF } from "../lib/pdf.ts";

/**
 * «Recibe este desglose en tu correo», compartido por las cuatro calculadoras.
 *
 * Antes el formulario mandaba el desglose como texto plano y el correo llegaba
 * con un bloque de líneas sueltas. Ahora arma el mismo PDF que baja el botón de
 * descarga, lo manda en base64 y el correo sale con el archivo adjunto y un
 * resumen corto. El detalle está en el PDF, no en el cuerpo del mensaje.
 *
 * El envío sigue siendo un POST de formulario: si el PDF no se puede generar
 * (navegador antiguo, bloqueo del import dinámico), el formulario se manda
 * igual y la persona recibe al menos el resumen. No se pierde el lead.
 */
export function FormularioDesglose({
  formulario,
  opciones,
  boton = "Enviarme el desglose",
}: {
  formulario: string;
  opciones: OpcionesPDF;
  boton?: string;
}) {
  const form = useRef<HTMLFormElement>(null);
  const [enviando, setEnviando] = useState(false);

  // Las tarjetas del PDF son el resumen que va en el cuerpo del correo.
  const kpis = opciones.bloques.filter(
    (b): b is Extract<Bloque, { tipo: "kpis" }> => b.tipo === "kpis"
  )[0];

  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    const el = form.current;
    if (!el) return;
    try {
      const campo = el.elements.namedItem("pdf") as HTMLInputElement | null;
      if (campo) campo.value = await pdfBase64(opciones);
    } catch (error) {
      console.error("No se pudo adjuntar el PDF al correo:", error);
    }
    el.submit();
  };

  return (
    <form
      ref={form}
      action={FORM_ENDPOINT}
      method="POST"
      onSubmit={enviar}
      className="flex flex-col sm:flex-row gap-3"
    >
      <input type="hidden" name="_next" value="https://melioraadvisory.cl/contacto/gracias/" />
      <input type="hidden" name="formulario" value={formulario} />
      <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />
      <input type="hidden" name="pdf" value="" />
      <input type="hidden" name="pdf_nombre" value={`${opciones.archivo}.pdf`} />
      <input type="hidden" name="titulo" value={opciones.titulo} />
      <input
        type="hidden"
        name="resumen"
        value={JSON.stringify(kpis ? kpis.items : [])}
      />
      <input
        name="email"
        type="email"
        required
        className="w-full flex-1 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald bg-white"
        placeholder="tucorreo@empresa.cl"
        aria-label="Email"
      />
      <button
        type="submit"
        disabled={enviando}
        className="rounded-lg bg-emerald px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-dark transition-colors disabled:opacity-60"
      >
        {enviando ? "Preparando…" : boton}
      </button>
    </form>
  );
}
