// Descarga del desglose en PDF. jsPDF se carga solo al pulsar el botón
// (import dinámico), así la librería no pesa en la visita normal a la página.
//
// El contenido es el mismo `resumenTexto` que ya se envía por correo: una línea
// por concepto con el formato «Etiqueta: valor». Las líneas cuya etiqueta va en
// mayúsculas (TOTAL FINIQUITO, LÍQUIDO, COSTO TOTAL DE CONTRATACIÓN) se
// destacan como totales.

const NAVY: [number, number, number] = [27, 42, 74];
const EMERALD: [number, number, number] = [14, 124, 102];
const GRIS: [number, number, number] = [100, 116, 139];
const GRIS_CLARO: [number, number, number] = [226, 232, 240];

export type OpcionesPDF = {
  /** Nombre de la herramienta: «Calculadora de finiquito» */
  titulo: string;
  /** Período de los indicadores usados, si aplica */
  periodo?: string;
  /** El mismo resumen que va al correo, una línea por concepto */
  resumen: string;
  /** Nombre del archivo, sin extensión */
  archivo: string;
  /** Nota al pie con las advertencias legales */
  nota?: string;
};

const esTotal = (etiqueta: string) =>
  etiqueta === etiqueta.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(etiqueta);

/**
 * Las fuentes base de jsPDF (Helvetica) usan WinAnsi: los caracteres fuera de
 * esa tabla no se dibujan, se desarman en símbolos sueltos. El signo menos
 * tipográfico «−» de los resúmenes salía como comillas y dígitos separados.
 */
const REEMPLAZOS: [RegExp, string][] = [
  [/−/g, "-"], // signo menos
  [/[‐-―]/g, "-"], // guiones tipográficos varios
  [/→/g, "->"], // flecha
  [/[‘’]/g, "'"],
  [/[“”]/g, '"'],
  [/…/g, "..."],
  [/ /g, " "], // espacio duro
];

function winAnsi(texto: string) {
  let s = texto;
  for (const [de, a] of REEMPLAZOS) s = s.replace(de, a);
  // Lo que quede fuera de WinAnsi se descarta antes que romper la línea entera.
  return s.replace(/[^\u0000-ÿ€‚ƒ†‡ˆ‰Š‹ŒŽ•–—˜™š›œžŸ]/g, "");
}

export async function descargarPDF({ titulo, periodo, resumen, archivo, nota }: OpcionesPDF) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const ANCHO = doc.internal.pageSize.getWidth();
  const ALTO = doc.internal.pageSize.getHeight();
  const M = 48; // margen
  const DERECHA = ANCHO - M;

  // ── Encabezado ──
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, ANCHO, 92, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("MELIORA ADVISORY", M, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(200, 214, 229);
  doc.text("Reportería gerencial en tiempo y forma para tu pyme", M, 58);
  doc.setFontSize(9);
  doc.text("melioraadvisory.cl", DERECHA, 40, { align: "right" });

  let y = 128;

  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(winAnsi(titulo), M, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRIS);
  const fecha = new Date().toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(winAnsi(periodo ? `${fecha} · Indicadores de ${periodo}` : fecha), M, y);
  y += 22;

  doc.setDrawColor(...GRIS_CLARO);
  doc.setLineWidth(1);
  doc.line(M, y, DERECHA, y);
  y += 24;

  // ── Filas del desglose ──
  const nuevaPagina = () => {
    doc.addPage();
    y = 72;
  };

  for (const linea of winAnsi(resumen).split("\n")) {
    const texto = linea.trim();
    if (!texto) {
      y += 8;
      continue;
    }
    if (y > ALTO - 110) nuevaPagina();

    const corte = texto.indexOf(": ");
    const etiqueta = corte > 0 ? texto.slice(0, corte) : texto;
    const valor = corte > 0 ? texto.slice(corte + 2) : "";

    if (corte > 0 && esTotal(etiqueta)) {
      doc.setFillColor(240, 249, 246);
      doc.rect(M - 10, y - 13, DERECHA - M + 20, 26, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...NAVY);
      doc.text(etiqueta, M, y + 4);
      doc.setTextColor(...EMERALD);
      doc.setFontSize(12);
      doc.text(valor, DERECHA, y + 4, { align: "right" });
      y += 34;
      continue;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);

    if (!valor) {
      // Línea suelta (un encabezado del resumen): se parte si es muy larga.
      for (const trozo of doc.splitTextToSize(etiqueta, DERECHA - M) as string[]) {
        if (y > ALTO - 110) nuevaPagina();
        doc.text(trozo, M, y);
        y += 15;
      }
      y += 4;
      continue;
    }

    // La etiqueta se recorta para que nunca pise al valor.
    const anchoValor = doc.getTextWidth(valor);
    const etiquetaCorta = (doc.splitTextToSize(
      etiqueta,
      DERECHA - M - anchoValor - 18,
    ) as string[])[0];
    doc.text(etiquetaCorta, M, y);
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.text(valor, DERECHA, y, { align: "right" });
    y += 19;
  }

  // ── Pie ──
  const paginas = doc.getNumberOfPages();
  for (let p = 1; p <= paginas; p++) {
    doc.setPage(p);
    doc.setDrawColor(...GRIS_CLARO);
    doc.line(M, ALTO - 62, DERECHA, ALTO - 62);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GRIS);
    const pie =
      nota ??
      "Valores referenciales. No reemplazan una liquidación de sueldo ni un finiquito oficial.";
    for (const [i, trozo] of (doc.splitTextToSize(winAnsi(pie), DERECHA - M - 60) as string[]).entries()) {
      doc.text(trozo, M, ALTO - 46 + i * 11);
    }
    doc.text(`${p} / ${paginas}`, DERECHA, ALTO - 46, { align: "right" });
  }

  doc.save(`${archivo}.pdf`);
}
