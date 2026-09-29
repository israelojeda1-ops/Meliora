// Descarga del desglose en PDF, con el mismo diseño que la pantalla.
//
// jsPDF se carga solo al pulsar el botón (import dinámico), así la librería no
// pesa en la visita normal a la página.
//
// Las calculadoras arman una lista de bloques y de ahí salen las dos cosas: el
// PDF (`descargarPDF`) y el texto que va por correo (`bloquesATexto`). Una sola
// fuente, para que no se desincronicen.

type RGB = [number, number, number];

const NAVY: RGB = [27, 42, 74];
const EMERALD: RGB = [14, 124, 102];
const ROJO: RGB = [220, 38, 38];
const TEXTO: RGB = [71, 85, 105];
const SUAVE: RGB = [148, 163, 184];
const LINEA: RGB = [226, 232, 240];
const EMERALD_FONDO: RGB = [240, 250, 247];
const PISTA: RGB = [226, 232, 240];

export type Bloque =
  /** Encabezado de sección, en verde y mayúsculas: «HABERES» */
  | { tipo: "seccion"; texto: string }
  /** Fila normal. `nota` va en gris junto a la etiqueta; `fuerte` agrega línea arriba y negrita. */
  | {
      tipo: "fila";
      etiqueta: string;
      valor: string;
      nota?: string;
      negativo?: boolean;
      fuerte?: boolean;
    }
  /** Fila en caja: verde claro para el líquido, azul para el costo total. */
  | { tipo: "destacado"; etiqueta: string; valor: string; estilo?: "emerald" | "navy" }
  /** Barra de proporción, como la del costo de contratación. */
  | { tipo: "barra"; proporcion: number; texto: string; izquierda: string; derecha: string }
  /** Párrafo pequeño en gris. */
  | { tipo: "nota"; texto: string }
  /** Aire entre grupos. */
  | { tipo: "espacio" };

export type OpcionesPDF = {
  titulo: string;
  periodo?: string;
  bloques: Bloque[];
  archivo: string;
  nota?: string;
};

/**
 * Las fuentes base de jsPDF (Helvetica) usan WinAnsi: los caracteres fuera de
 * esa tabla no se dibujan, se desarman en símbolos sueltos. El signo menos
 * tipográfico «−» de los resúmenes salía como comillas y dígitos separados.
 */
const REEMPLAZOS: [RegExp, string][] = [
  [/−/g, "-"],
  [/[‐-―]/g, "-"],
  [/→/g, "->"],
  [/[‘’]/g, "'"],
  [/[“”]/g, '"'],
  [/…/g, "..."],
  [/ /g, " "],
];

function winAnsi(texto: string) {
  let s = texto;
  for (const [de, a] of REEMPLAZOS) s = s.replace(de, a);
  return s.replace(
    /[^\u0000-ÿ€‚ƒ†‡ˆ‰Š‹ŒŽ•–—˜™š›œžŸ]/g,
    "",
  );
}

/** El mismo contenido en texto plano, para el cuerpo del correo. */
export function bloquesATexto(bloques: Bloque[]): string {
  const lineas: string[] = [];
  for (const b of bloques) {
    if (b.tipo === "seccion") lineas.push("", b.texto.toUpperCase());
    else if (b.tipo === "fila")
      lineas.push(`${b.etiqueta}${b.nota ? ` (${b.nota})` : ""}: ${b.negativo ? "-" : ""}${b.valor}`);
    else if (b.tipo === "destacado") lineas.push(`${b.etiqueta.toUpperCase()}: ${b.valor}`);
    else if (b.tipo === "barra") lineas.push(b.texto);
    else if (b.tipo === "nota") lineas.push(b.texto);
  }
  return lineas.join("\n").replace(/^\n/, "");
}

export async function descargarPDF({ titulo, periodo, bloques, archivo, nota }: OpcionesPDF) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const ANCHO = doc.internal.pageSize.getWidth();
  const ALTO = doc.internal.pageSize.getHeight();
  const M = 48;
  const DERECHA = ANCHO - M;
  const PIE = 74;

  const texto = (s: string) => winAnsi(s);

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
  doc.text("Reporteria gerencial en tiempo y forma para tu pyme", M, 58);
  doc.setFontSize(9);
  doc.text("melioraadvisory.cl", DERECHA, 40, { align: "right" });

  let y = 126;

  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(texto(titulo), M, y);
  y += 17;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...SUAVE);
  const fecha = new Date().toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(texto(periodo ? `${fecha} · Indicadores de ${periodo}` : fecha), M, y);
  y += 24;

  const saltoSiHaceFalta = (alto: number) => {
    if (y + alto > ALTO - PIE) {
      doc.addPage();
      y = 72;
    }
  };

  // Para no dibujar la línea de subtotal justo debajo de un encabezado de
  // sección: ahí no separa nada.
  let anterior: Bloque["tipo"] | null = null;

  for (const b of bloques) {
    switch (b.tipo) {
      case "espacio":
        y += 9;
        break;

      case "seccion": {
        saltoSiHaceFalta(30);
        y += 7;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...EMERALD);
        doc.text(texto(b.texto.toUpperCase()), M, y);
        y += 14;
        break;
      }

      case "fila": {
        saltoSiHaceFalta(20);
        if (b.fuerte && anterior !== "seccion") {
          doc.setDrawColor(...LINEA);
          doc.setLineWidth(0.8);
          doc.line(M, y - 11, DERECHA, y - 11);
          y += 3;
        }
        const valor = `${b.negativo ? "-" : ""}${b.valor}`;
        doc.setFont("helvetica", b.fuerte ? "bold" : "normal");
        doc.setFontSize(10);
        doc.setTextColor(...(b.negativo ? ROJO : b.fuerte ? NAVY : NAVY));
        const anchoValor = doc.getTextWidth(texto(valor));
        doc.text(texto(valor), DERECHA, y, { align: "right" });

        doc.setFont("helvetica", b.fuerte ? "bold" : "normal");
        doc.setTextColor(...(b.fuerte ? NAVY : TEXTO));
        const etiqueta = texto(b.etiqueta);
        doc.text(etiqueta, M, y);

        if (b.nota) {
          const x = M + doc.getTextWidth(etiqueta) + 6;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...SUAVE);
          const espacio = DERECHA - anchoValor - 12 - x;
          if (espacio > 30) {
            doc.text((doc.splitTextToSize(texto(b.nota), espacio) as string[])[0], x, y);
          }
        }
        y += 17.5;
        break;
      }

      case "destacado": {
        saltoSiHaceFalta(40);
        const navy = b.estilo === "navy";
        y += 5;
        if (navy) doc.setFillColor(...NAVY);
        else doc.setFillColor(...EMERALD_FONDO);
        doc.roundedRect(M - 10, y - 14, DERECHA - M + 20, 32, 5, 5, "F");
        if (!navy) {
          doc.setDrawColor(...EMERALD);
          doc.setLineWidth(0.6);
          doc.roundedRect(M - 10, y - 14, DERECHA - M + 20, 32, 5, 5, "S");
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...(navy ? ([255, 255, 255] as RGB) : NAVY));
        doc.text(texto(b.etiqueta), M, y + 5);
        doc.setFontSize(14);
        doc.setTextColor(...(navy ? ([255, 255, 255] as RGB) : EMERALD));
        doc.text(texto(b.valor), DERECHA, y + 6, { align: "right" });
        y += 36;
        break;
      }

      case "barra": {
        saltoSiHaceFalta(60);
        y += 3;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...TEXTO);
        for (const trozo of doc.splitTextToSize(texto(b.texto), DERECHA - M) as string[]) {
          doc.text(trozo, M, y);
          y += 12;
        }
        y += 2;
        const ancho = DERECHA - M;
        doc.setFillColor(...PISTA);
        doc.roundedRect(M, y, ancho, 9, 4.5, 4.5, "F");
        const lleno = Math.max(0, Math.min(1, b.proporcion)) * ancho;
        if (lleno > 0) {
          doc.setFillColor(...EMERALD);
          doc.roundedRect(M, y, Math.max(lleno, 9), 9, 4.5, 4.5, "F");
        }
        y += 18;
        doc.setFontSize(7.5);
        doc.setTextColor(...SUAVE);
        doc.text(texto(b.izquierda), M, y);
        doc.text(texto(b.derecha), DERECHA, y, { align: "right" });
        y += 12;
        break;
      }

      case "nota": {
        saltoSiHaceFalta(26);
        y += 3;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...SUAVE);
        for (const trozo of doc.splitTextToSize(texto(b.texto), DERECHA - M) as string[]) {
          saltoSiHaceFalta(14);
          doc.text(trozo, M, y);
          y += 10.5;
        }
        y += 3;
        break;
      }
    }
    anterior = b.tipo;
  }

  // ── Pie en todas las páginas ──
  const paginas = doc.getNumberOfPages();
  for (let p = 1; p <= paginas; p++) {
    doc.setPage(p);
    doc.setDrawColor(...LINEA);
    doc.setLineWidth(0.8);
    doc.line(M, ALTO - 58, DERECHA, ALTO - 58);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...SUAVE);
    const pie =
      nota ?? "Valores referenciales. No reemplazan una liquidacion de sueldo oficial.";
    for (const [i, trozo] of (
      doc.splitTextToSize(texto(pie), DERECHA - M - 50) as string[]
    ).entries()) {
      doc.text(trozo, M, ALTO - 42 + i * 10);
    }
    doc.text(`${p} / ${paginas}`, DERECHA, ALTO - 42, { align: "right" });
  }

  doc.save(`${archivo}.pdf`);
}
