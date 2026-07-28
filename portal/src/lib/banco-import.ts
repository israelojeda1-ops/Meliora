// Lógica compartida entre /banco/preview (previsualización + sugerencia) y
// /banco/import (guardado real) para que ambos normalicen y decidan igual.

export const BANCO_HEADER = [
  "Fecha",
  "ID Transferencia",
  "Rut Origen/Destino",
  "Banco Origen/Destino",
  "Cuenta Origen/Destino",
  "Valor",
  "Estado",
  "DESCRIPCION",
  "Factura / Boleta",
  "Observacion",
];

export const BANCO_REQUIRED = ["Fecha", "Valor"];

const AGREGADORES_PAGO = ["transbank", "mercado pago", "mercado libre", "mercadolibre", "mercadopago"];

export function esAgregadorPago(bancoNombre: unknown): boolean {
  const s = String(bancoNombre ?? "").toLowerCase();
  return AGREGADORES_PAGO.some((a) => s.includes(a));
}

export function normRut(v: unknown): string {
  return String(v ?? "")
    .replace(/[^0-9kK]/g, "")
    .toUpperCase();
}

export function normFecha(v: unknown): string {
  const s = String(v ?? "").trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  // La plantilla usa dd/mm/yyyy, pero algunos lectores de planilla (ej. apps
  // de celular guardando en formato de texto en vez de fecha) entregan el
  // valor en m/d/y o con año de 2 dígitos. Si el primer número no puede ser
  // un mes válido, se asume que en realidad vino como m/d/y.
  m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/.exec(s);
  if (m) {
    const [, a, b, y] = m;
    const year = y.length === 2 ? `20${y}` : y;
    let day = Number(a);
    let month = Number(b);
    if (month > 12 && day <= 12) {
      [day, month] = [month, day];
    }
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  return s;
}

export function normValor(v: unknown): string {
  const s = String(v ?? "").replace(/[^0-9-]/g, "");
  return s || "0";
}

export function normValorNum(v: unknown): number {
  return Number(normValor(v)) || 0;
}

/**
 * Busca `var <varName> = <json>;` dentro de un HTML y devuelve el objeto
 * parseado. Cuenta llaves/corchetes respetando strings para no depender de
 * que el JSON esté en una sola línea ni de que no contenga las mismas
 * secuencias de cierre dentro de un valor string.
 */
export function extractJsonLiteral(html: string, varName: string): unknown | null {
  const marker = `var ${varName}`;
  const idx = html.indexOf(marker);
  if (idx === -1) return null;
  const eqIdx = html.indexOf("=", idx);
  if (eqIdx === -1) return null;
  let i = eqIdx + 1;
  while (i < html.length && /\s/.test(html[i])) i++;
  const open = html[i];
  if (open !== "{" && open !== "[") return null;
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escape = false;
  const start = i;
  for (; i < html.length; i++) {
    const c = html[i];
    if (inString) {
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) {
        const jsonStr = html.slice(start, i + 1);
        try {
          return JSON.parse(jsonStr);
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

type ArqueoRow = { folio?: string; rut?: string; monto?: number };
type ArqueoData = Record<string, ArqueoRow[]>;

/** RUT normalizado -> lista de {folio, monto} desde Arqueo, para sugerir a qué
 * documento podría corresponder una transferencia sin "Factura / Boleta". */
export function buildRutToArqueo(arqueo: ArqueoData): Map<string, { folio: string; monto: number }[]> {
  const map = new Map<string, { folio: string; monto: number }[]>();
  for (const rows of Object.values(arqueo || {})) {
    for (const r of rows || []) {
      if (!r.rut || !r.folio) continue;
      const key = normRut(r.rut);
      const list = map.get(key) ?? [];
      list.push({ folio: r.folio, monto: r.monto ?? 0 });
      map.set(key, list);
    }
  }
  return map;
}

export function sugerirFactura(
  rutToArqueo: Map<string, { folio: string; monto: number }[]>,
  rut: unknown,
  valor: number
): string {
  const candidatos = rutToArqueo.get(normRut(rut)) ?? [];
  const folios = new Set(candidatos.filter((c) => Math.abs(c.monto - valor) <= 1).map((c) => c.folio));
  return Array.from(folios).sort().join(",");
}

/** Fila ya limpia (10 columnas, mismo orden que BANCO_HEADER) a partir de una
 * fila cruda del Excel. `facturaOverride`, si viene, reemplaza el valor de
 * "Factura / Boleta" (para cuando el usuario editó la sugerencia). */
export function buildCleanRow(r: Record<string, unknown>, facturaOverride?: string): string[] {
  return [
    normFecha(r["Fecha"]),
    String(r["ID Transferencia"] ?? "").trim(),
    String(r["Rut Origen/Destino"] ?? "").trim(),
    String(r["Banco Origen/Destino"] ?? "").trim(),
    String(r["Cuenta Origen/Destino"] ?? "").trim(),
    normValor(r["Valor"]),
    String(r["Estado"] ?? "").trim(),
    String(r["DESCRIPCION"] ?? "").trim(),
    (facturaOverride ?? String(r["Factura / Boleta"] ?? "")).trim(),
    String(r["Observacion"] ?? "").trim(),
  ];
}

export function filaValida(r: Record<string, unknown>): boolean {
  return BANCO_REQUIRED.every((c) => r[c] !== undefined && String(r[c]).trim() !== "");
}
