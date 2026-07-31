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

/** Ubica una fila del log de Banco por sus valores originales (Fecha, ID
 * Transferencia, Valor, Factura/Boleta) — usado tanto para editar como para
 * eliminar, ya que no hay un ID único por fila en el CSV. */
export function locateBancoRow(
  rows: string[][],
  header: string[],
  original: { fecha: string; idTransferencia: string; valor: string; factura: string }
): { index: number; error?: undefined } | { index?: undefined; error: string } {
  const idxOf = (col: string) => header.findIndex((h) => h.trim().toLowerCase() === col.toLowerCase());
  const iFecha = idxOf("Fecha");
  const iId = idxOf("ID Transferencia");
  const iValor = idxOf("Valor");
  const iFactura = idxOf("Factura / Boleta");

  const matches: number[] = [];
  rows.forEach((row, i) => {
    if (
      (row[iFecha] ?? "").trim() === original.fecha &&
      (row[iValor] ?? "").trim() === original.valor &&
      (iId < 0 || (row[iId] ?? "").trim() === original.idTransferencia) &&
      (row[iFactura] ?? "").trim() === original.factura
    ) {
      matches.push(i);
    }
  });

  if (matches.length === 0) {
    return { error: "No se encontró la fila (puede que ya haya cambiado). Recarga la página e intenta de nuevo." };
  }
  if (matches.length > 1) {
    return { error: `Hay ${matches.length} filas idénticas que calzan, no se puede identificar cuál usar.` };
  }
  return { index: matches[0] };
}

/**
 * Reemplaza `var <varName> = <json>;` dentro de un HTML por un valor nuevo,
 * usando slicing + concatenación (nunca String.replace con un string de
 * reemplazo) para no toparse con patrones especiales como `$'` dentro del
 * JSON insertado.
 */
export function replaceJsonLiteral(html: string, varName: string, newValue: unknown): string | null {
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
        const end = i + 1;
        const newJson = JSON.stringify(newValue).replace(/</g, "<\\/");
        return html.slice(0, start) + newJson + html.slice(end);
      }
    }
  }
  return null;
}

/** Folio -> RUT desde Arqueo (el reverso de buildRutToArqueo), para detectar
 * si el RUT que transfiere calza con el RUT del documento pagado. */
export function buildFolioToRut(arqueo: ArqueoData): Map<string, string> {
  const map = new Map<string, string>();
  for (const rows of Object.values(arqueo || {})) {
    for (const r of rows || []) {
      if (r.folio && r.rut && !map.has(r.folio)) map.set(r.folio, r.rut);
    }
  }
  return map;
}

function folioNumerosDeCelda(v: string): string[] {
  return (v.match(/\d+/g) || []) as string[];
}

/** ISO (yyyy-mm-dd) o dd/mm/yyyy -> dd-mm-yyyy para mostrar, igual que
 * _fmt_fecha_banco en generar.py. */
function fechaDisplay(v: string): string {
  const s = (v || "").trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/.exec(s);
  if (m) return `${String(m[1]).padStart(2, "0")}-${String(m[2]).padStart(2, "0")}-${m[3]}`;
  return s;
}

export const BANCO_DISPLAY_COLUMNAS = ["Fecha", "ID Transferencia", "Banco", "RUT", "Valor", "Descripción", "Factura/Boleta"];

export type BancoData = { disponible: boolean; columnas: string[]; filas: (string | number)[][] };

/** Reconstruye el mismo BANCO_DATA que arma generar.py (columnas + filas,
 * con rut_flag y sugerencia como dos campos extra al final de cada fila),
 * a partir del CSV ya actualizado y el Arqueo del dashboard. */
export function buildBancoData(
  csvRows: string[][],
  csvHeader: string[],
  rutToArqueo: Map<string, { folio: string; monto: number }[]>,
  folioToRut: Map<string, string>
): BancoData {
  const idxOf = (col: string) => csvHeader.findIndex((h) => h.trim().toLowerCase() === col.toLowerCase());
  const iFecha = idxOf("Fecha");
  const iId = idxOf("ID Transferencia");
  const iBanco = idxOf("Banco Origen/Destino");
  const iRut = idxOf("Rut Origen/Destino");
  const iValor = idxOf("Valor");
  const iDesc = idxOf("DESCRIPCION");
  const iFactura = idxOf("Factura / Boleta");

  const sorted = csvRows.slice().sort((a, b) => {
    const fa = (a[iFecha] ?? "").trim();
    const fb = (b[iFecha] ?? "").trim();
    return fa < fb ? 1 : fa > fb ? -1 : 0;
  });

  const filas: (string | number)[][] = sorted.map((row) => {
    const banco = (row[iBanco] ?? "").trim();
    const rut = (row[iRut] ?? "").trim();
    const factura = (row[iFactura] ?? "").trim();
    const valor = normValorNum(row[iValor] ?? "");
    const agregador = esAgregadorPago(banco);

    let rutFlag = "";
    if (!agregador && factura) {
      const folios = folioNumerosDeCelda(factura);
      const rutsDoc = new Set(
        folios
          .map((f) => folioToRut.get(f))
          .filter((r): r is string => !!r)
          .map((r) => normRut(r))
      );
      rutsDoc.delete("");
      if (rutsDoc.size > 0) {
        rutFlag = rutsDoc.size === 1 && rutsDoc.has(normRut(rut)) ? "ok" : "mismatch";
      }
    }

    let sugerencia = "";
    if (!agregador && !factura) {
      sugerencia = sugerirFactura(rutToArqueo, rut, valor);
    }

    return [
      fechaDisplay(row[iFecha] ?? ""),
      row[iId] ?? "",
      banco,
      rut,
      valor,
      (row[iDesc] ?? "").trim(),
      factura,
      rutFlag,
      sugerencia,
    ];
  });

  return { disponible: true, columnas: BANCO_DISPLAY_COLUMNAS, filas };
}

/**
 * Actualiza SOLO el bloque `var BANCO = {...}` dentro del dashboard publicado,
 * sin correr el pipeline completo de Python (no toca Softland ni Transbank).
 * Se llama despues de guardar el CSV, para que la tabla de Banco quede al
 * dia de inmediato para cualquiera que abra la pagina, sin esperar la
 * regeneracion pesada.
 */
export async function patchBancoInHtml(params: {
  token: string;
  owner: string;
  repo: string;
  dashboardPath: string;
  csvRows: string[][];
  csvHeader: string[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { token, owner, repo, dashboardPath, csvRows, csvHeader } = params;
  const ghHeaders = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" };
  const dashUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${dashboardPath}`;

  // El dashboard pesa ~10MB: la API de Contents omite el campo "content" en
  // modo JSON para archivos de más de ~1MB (aunque "sha" sigue viniendo), así
  // que el contenido real hay que pedirlo aparte con el media type "raw"
  // (mismo truco que ya usa /nuprotec/route.ts para servir este mismo archivo).
  const [metaResp, rawResp] = await Promise.all([
    fetch(`${dashUrl}?ref=main`, { headers: ghHeaders, cache: "no-store" }),
    fetch(`${dashUrl}?ref=main`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.raw" },
      cache: "no-store",
    }),
  ]);
  if (!metaResp.ok) {
    return { ok: false, error: `No se pudo leer el dashboard (${metaResp.status})` };
  }
  if (!rawResp.ok) {
    return { ok: false, error: `No se pudo leer el contenido del dashboard (${rawResp.status})` };
  }
  const metaJson = (await metaResp.json()) as { sha: string };
  const html = await rawResp.text();
  const sha = metaJson.sha;

  const arqueo = extractJsonLiteral(html, "ARQUEO");
  if (!arqueo || typeof arqueo !== "object") {
    return { ok: false, error: "No se pudo leer Arqueo del dashboard publicado" };
  }
  const arqueoData = arqueo as ArqueoData;
  const rutToArqueo = buildRutToArqueo(arqueoData);
  const folioToRut = buildFolioToRut(arqueoData);
  const bancoData = buildBancoData(csvRows, csvHeader, rutToArqueo, folioToRut);

  const newHtml = replaceJsonLiteral(html, "BANCO", bancoData);
  if (!newHtml) {
    return { ok: false, error: "No se pudo ubicar 'var BANCO' en el dashboard publicado" };
  }

  const putResp = await fetch(dashUrl, {
    method: "PUT",
    headers: { ...ghHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Actualiza datos de Banco en el dashboard (sin regenerar todo) [skip ci]",
      content: Buffer.from(newHtml, "utf-8").toString("base64"),
      sha,
      branch: "main",
    }),
  });
  if (!putResp.ok) {
    const text = await putResp.text();
    return { ok: false, error: `No se pudo guardar el dashboard (${putResp.status}): ${text}` };
  }
  return { ok: true };
}
