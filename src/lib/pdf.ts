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
const NAVY_CLARO: RGB = [148, 170, 199];
const EMERALD: RGB = [14, 124, 102];
const ROJO: RGB = [200, 35, 35];
const TEXTO: RGB = [71, 85, 105];
const SUAVE: RGB = [148, 163, 184];
const LINEA: RGB = [226, 232, 240];
const BLANCO: RGB = [255, 255, 255];
const EMERALD_FONDO: RGB = [238, 250, 246];
const GRIS_FONDO: RGB = [248, 250, 252];
const PISTA: RGB = [226, 232, 240];

/** Fila de detalle: etiqueta a la izquierda, monto a la derecha. */
export type FilaPDF = {
  etiqueta: string;
  valor: string;
  /** Va en gris pequeño junto a la etiqueta: «ley 16.744», «base $758.501». */
  nota?: string;
  /** Lo dibuja en rojo y con signo, como los descuentos de la pantalla. */
  negativo?: boolean;
};

export type Bloque =
  /** Tarjetas grandes con las cifras que la persona vino a buscar. */
  | {
      tipo: "kpis";
      items: {
        etiqueta: string;
        valor: string;
        nota?: string;
        estilo?: "emerald" | "navy" | "suave";
      }[];
    }
  /**
   * Grupo de filas dentro de una tarjeta con título. `total` va tras una línea
   * y en negrita; `pie` son filas que cuelgan después del subtotal, para lo que
   * no forma parte de él (los haberes no imponibles, por ejemplo).
   */
  | { tipo: "panel"; titulo: string; filas: FilaPDF[]; total?: FilaPDF; pie?: FilaPDF[] }
  /** Fila en caja: verde para el líquido, azul para el costo total. */
  | { tipo: "destacado"; etiqueta: string; valor: string; estilo?: "emerald" | "navy" }
  /** Barra de proporción, como la del costo de contratación. */
  | { tipo: "barra"; proporcion: number; texto: string; izquierda: string; derecha: string }
  /** Las variables del cálculo, en dos columnas. */
  | { tipo: "parametros"; titulo: string; items: { etiqueta: string; valor: string }[] }
  /** Encabezado suelto, fuera de un panel. */
  | { tipo: "seccion"; texto: string }
  /** Fila suelta, fuera de un panel. */
  | ({ tipo: "fila"; fuerte?: boolean } & FilaPDF)
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
  [/ /g, " "],
];

function winAnsi(texto: string) {
  let s = texto;
  for (const [de, a] of REEMPLAZOS) s = s.replace(de, a);
  return s.replace(/[^\u0000-ÿ€‚ƒ†‡ˆ‰Š‹ŒŽ•–—˜™š›œžŸ]/g, "");
}

function filaATexto(f: FilaPDF) {
  return `${f.etiqueta}${f.nota ? ` (${f.nota})` : ""}: ${f.negativo ? "-" : ""}${f.valor}`;
}

/** El mismo contenido en texto plano, para el cuerpo del correo. */
export function bloquesATexto(bloques: Bloque[]): string {
  const lineas: string[] = [];
  for (const b of bloques) {
    if (b.tipo === "kpis")
      for (const k of b.items) lineas.push(`${k.etiqueta.toUpperCase()}: ${k.valor}`);
    else if (b.tipo === "panel") {
      lineas.push("", b.titulo.toUpperCase());
      for (const f of b.filas) lineas.push(filaATexto(f));
      if (b.total) lineas.push(filaATexto(b.total));
      for (const f of b.pie ?? []) lineas.push(filaATexto(f));
    } else if (b.tipo === "parametros") {
      lineas.push("", b.titulo.toUpperCase());
      for (const i of b.items) lineas.push(`${i.etiqueta}: ${i.valor}`);
    } else if (b.tipo === "seccion") lineas.push("", b.texto.toUpperCase());
    else if (b.tipo === "fila") lineas.push(filaATexto(b));
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
  const PIE = 70;
  const PAD = 14;
  const ALTO_FILA = 16.5;

  const texto = (s: string) => winAnsi(s);

  // ── Encabezado ──
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, ANCHO, 92, "F");
  doc.setFillColor(...EMERALD);
  doc.rect(0, 92, ANCHO, 3, "F");
  doc.setTextColor(...BLANCO);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("MELIORA ADVISORY", M, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...NAVY_CLARO);
  doc.text("Reporteria gerencial en tiempo y forma para tu pyme", M, 60);
  doc.text("melioraadvisory.cl", DERECHA, 42, { align: "right" });

  let y = 128;

  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(texto(titulo), M, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...SUAVE);
  const fecha = new Date().toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(texto(periodo ? `${fecha} · Indicadores de ${periodo}` : fecha), M, y);
  y += 22;

  /** Encabezado angosto de las páginas de continuación. */
  const encabezadoContinuacion = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...NAVY);
    doc.text(texto(`MELIORA ADVISORY  ·  ${titulo}`.toUpperCase()), M, 52);
    doc.setDrawColor(...LINEA);
    doc.setLineWidth(0.8);
    doc.line(M, 62, DERECHA, 62);
  };

  const saltoSiHaceFalta = (alto: number) => {
    if (y + alto > ALTO - PIE) {
      doc.addPage();
      encabezadoContinuacion();
      y = 84;
    }
  };

  /** Etiqueta (con su nota en gris) a la izquierda, monto a la derecha. */
  const dibujarFila = (f: FilaPDF, base: number, x0: number, x1: number, fuerte: boolean) => {
    const valor = `${f.negativo ? "-" : ""}${f.valor}`;
    doc.setFont("helvetica", fuerte ? "bold" : "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...(f.negativo ? ROJO : NAVY));
    const anchoValor = doc.getTextWidth(texto(valor));
    doc.text(texto(valor), x1, base, { align: "right" });

    doc.setTextColor(...(fuerte ? NAVY : TEXTO));
    const etiqueta = texto(f.etiqueta);
    doc.text(etiqueta, x0, base);

    if (f.nota) {
      const x = x0 + doc.getTextWidth(etiqueta) + 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...SUAVE);
      const espacio = x1 - anchoValor - 12 - x;
      if (espacio > 30) doc.text((doc.splitTextToSize(texto(f.nota), espacio) as string[])[0], x, base);
    }
  };

  // Para no dibujar la línea de subtotal justo debajo de un encabezado.
  let anterior: Bloque["tipo"] | null = null;

  for (const [indice, b] of bloques.entries()) {
    // Un panel y la caja destacada que lo cierra viajan juntos: separarlos deja
    // el total huérfano al inicio de la página siguiente.
    const siguiente = bloques[indice + 1];
    const pegado = siguiente?.tipo === "destacado" ? 46 : 0;

    switch (b.tipo) {
      case "espacio":
        y += 8;
        break;

      case "kpis": {
        const n = b.items.length;
        const hueco = 12;
        const ancho = (DERECHA - M - hueco * (n - 1)) / n;
        const alto = b.items.some((k) => k.nota) ? 66 : 56;
        saltoSiHaceFalta(alto + 12);
        b.items.forEach((k, i) => {
          const x = M + i * (ancho + hueco);
          const navy = k.estilo === "navy";
          const verde = k.estilo === "emerald";
          doc.setFillColor(...(navy ? NAVY : verde ? EMERALD_FONDO : GRIS_FONDO));
          doc.setDrawColor(...(verde ? EMERALD : LINEA));
          doc.setLineWidth(navy ? 0 : 0.8);
          doc.roundedRect(x, y, ancho, alto, 6, 6, navy ? "F" : "FD");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(7);
          doc.setTextColor(...(navy ? NAVY_CLARO : verde ? EMERALD : SUAVE));
          doc.text(texto(k.etiqueta.toUpperCase()), x + 13, y + 19);

          doc.setFontSize(15);
          doc.setTextColor(...(navy ? BLANCO : verde ? EMERALD : NAVY));
          doc.text(texto(k.valor), x + 13, y + 41);

          if (k.nota) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(...(navy ? NAVY_CLARO : SUAVE));
            doc.text(
              (doc.splitTextToSize(texto(k.nota), ancho - 26) as string[])[0],
              x + 13,
              y + 55
            );
          }
        });
        y += alto + 14;
        break;
      }

      case "panel": {
        const pie = b.pie ?? [];
        const alto =
          38 + (b.filas.length + pie.length) * ALTO_FILA + (b.total ? 24 : 0);
        saltoSiHaceFalta(alto + 10 + pegado);
        const y0 = y;
        doc.setFillColor(...BLANCO);
        doc.setDrawColor(...LINEA);
        doc.setLineWidth(0.8);
        doc.roundedRect(M, y0, DERECHA - M, alto, 6, 6, "FD");

        let yy = y0 + 19;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...EMERALD);
        doc.text(texto(b.titulo.toUpperCase()), M + PAD, yy);
        yy += 5;
        doc.setDrawColor(...LINEA);
        doc.setLineWidth(0.6);
        doc.line(M + PAD, yy, DERECHA - PAD, yy);
        yy += 3;

        for (const f of b.filas) {
          yy += ALTO_FILA;
          dibujarFila(f, yy - 5, M + PAD, DERECHA - PAD, false);
        }
        if (b.total) {
          yy += 6;
          doc.setDrawColor(...LINEA);
          doc.line(M + PAD, yy, DERECHA - PAD, yy);
          yy += 18;
          dibujarFila(b.total, yy - 6, M + PAD, DERECHA - PAD, true);
        }
        for (const f of pie) {
          yy += ALTO_FILA;
          dibujarFila(f, yy - 5, M + PAD, DERECHA - PAD, false);
        }
        y = y0 + alto + 9;
        break;
      }

      case "parametros": {
        const items = b.items;
        const mitad = Math.ceil(items.length / 2);
        const izq = items.slice(0, mitad);
        const der = items.slice(mitad);
        const alto = 34 + mitad * 13;
        saltoSiHaceFalta(alto + 10);
        const y0 = y;
        doc.setFillColor(...GRIS_FONDO);
        doc.setDrawColor(...LINEA);
        doc.setLineWidth(0.8);
        doc.roundedRect(M, y0, DERECHA - M, alto, 6, 6, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...EMERALD);
        doc.text(texto(b.titulo.toUpperCase()), M + PAD, y0 + 18);

        const anchoCol = (DERECHA - M - PAD * 2 - 24) / 2;
        for (const [col, lista] of [izq, der].entries()) {
          const x0 = M + PAD + col * (anchoCol + 24);
          lista.forEach((it, i) => {
            const base = y0 + 31 + (i + 1) * 13 - 4;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(...TEXTO);
            const valor = texto(it.valor);
            doc.setFont("helvetica", "bold");
            const anchoValor = doc.getTextWidth(valor);
            doc.setTextColor(...NAVY);
            doc.text(valor, x0 + anchoCol, base, { align: "right" });
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...TEXTO);
            const etiqueta = (
              doc.splitTextToSize(texto(it.etiqueta), anchoCol - anchoValor - 10) as string[]
            )[0];
            doc.text(etiqueta, x0, base);
          });
        }
        y = y0 + alto + 10;
        break;
      }

      case "seccion": {
        saltoSiHaceFalta(28);
        y += 7;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
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
        dibujarFila(b, y, M, DERECHA, !!b.fuerte);
        y += ALTO_FILA;
        break;
      }

      case "destacado": {
        saltoSiHaceFalta(46);
        const navy = b.estilo === "navy";
        doc.setFillColor(...(navy ? NAVY : EMERALD_FONDO));
        doc.setDrawColor(...EMERALD);
        doc.setLineWidth(navy ? 0 : 0.8);
        doc.roundedRect(M, y, DERECHA - M, 36, 6, 6, navy ? "F" : "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...(navy ? BLANCO : NAVY));
        doc.text(texto(b.etiqueta), M + PAD, y + 23);
        doc.setFontSize(15);
        doc.setTextColor(...(navy ? BLANCO : EMERALD));
        doc.text(texto(b.valor), DERECHA - PAD, y + 24, { align: "right" });
        y += 46;
        break;
      }

      case "barra": {
        saltoSiHaceFalta(58);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...TEXTO);
        for (const trozo of doc.splitTextToSize(texto(b.texto), DERECHA - M) as string[]) {
          y += 12;
          doc.text(trozo, M, y);
        }
        y += 8;
        const ancho = DERECHA - M;
        doc.setFillColor(...PISTA);
        doc.roundedRect(M, y, ancho, 9, 4.5, 4.5, "F");
        const lleno = Math.max(0, Math.min(1, b.proporcion)) * ancho;
        if (lleno > 0) {
          doc.setFillColor(...EMERALD);
          doc.roundedRect(M, y, Math.max(lleno, 9), 9, 4.5, 4.5, "F");
        }
        y += 20;
        doc.setFontSize(7.5);
        doc.setTextColor(...SUAVE);
        doc.text(texto(b.izquierda), M, y);
        doc.text(texto(b.derecha), DERECHA, y, { align: "right" });
        y += 14;
        break;
      }

      case "nota": {
        saltoSiHaceFalta(26);
        y += 3;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...SUAVE);
        for (const trozo of doc.splitTextToSize(texto(b.texto), DERECHA - M) as string[]) {
          saltoSiHaceFalta(14);
          y += 10.5;
          doc.text(trozo, M, y);
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
    doc.line(M, ALTO - 54, DERECHA, ALTO - 54);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...SUAVE);
    const pie = nota ?? "Valores referenciales. No reemplazan una liquidacion de sueldo oficial.";
    for (const [i, trozo] of (
      doc.splitTextToSize(texto(pie), DERECHA - M - 50) as string[]
    ).entries()) {
      doc.text(trozo, M, ALTO - 40 + i * 9.5);
    }
    doc.text(`${p} / ${paginas}`, DERECHA, ALTO - 40, { align: "right" });
  }

  doc.save(`${archivo}.pdf`);
}
