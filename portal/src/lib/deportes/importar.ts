import "server-only";
import { DEPORTES, Deporte } from "./catalogo";
import { OverrideXg, leerXg, guardarXg } from "./almacen";
import { normNombre } from "./nombres";

// Importación del xG real desde el Excel del usuario. ESPN no da el xG por
// equipo (el historial lo trae estimado desde los remates), así que aquí se
// aceptan filas de partido con el xG real de cada lado y se guardan como
// correcciones (capa aparte que la lectura aplica encima del estimado). El
// formato es tolerante: CSV (coma, punto y coma o tab) con encabezado, o JSON;
// se reconocen las columnas por nombre y no importa el orden.

/** Una fila de partido con el xG real de cada equipo. */
export type FilaXg = {
  fecha: string; // YYYY-MM-DD
  local: string;
  visita: string;
  xgLocal: number | null;
  xgVisita: number | null;
};

export type ResumenImport = {
  filas: number; // filas válidas leídas
  guardadas: number; // total de correcciones tras fusionar
  avisos: string[];
};

/** Normaliza una fecha (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY) a YYYY-MM-DD. */
function normFecha(v: string): string | null {
  const s = v.trim();
  let m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(s);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(s);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return null;
}

/** Lee un número tolerando coma decimal y espacios; null si no es número. */
function normNum(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  const n = Number(v.trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

// Sinónimos de cada columna (ya normalizados: minúsculas, sin tildes/símbolos).
const clave = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const esFecha = (k: string) => k === "fecha" || k === "date" || k === "dia";
const esLocal = (k: string) => ["local", "home", "casa", "equipolocal", "hometeam", "localteam"].includes(k);
const esVisita = (k: string) =>
  ["visita", "away", "visitante", "rival", "equipovisita", "awayteam", "visitorteam"].includes(k);
const esXgLocal = (k: string) => k.includes("xg") && (k.includes("local") || k.includes("home") || k.includes("casa"));
const esXgVisita = (k: string) =>
  k.includes("xg") && (k.includes("visita") || k.includes("away") || k.includes("rival") || k.includes("visitante"));

type Cols = { fecha: number; local: number; visita: number; xgLocal: number; xgVisita: number };

/** Ubica cada columna en el encabezado; -1 si falta. */
function mapearColumnas(cabecera: string[]): Cols {
  const cols: Cols = { fecha: -1, local: -1, visita: -1, xgLocal: -1, xgVisita: -1 };
  cabecera.forEach((raw, i) => {
    const k = clave(raw);
    // xG antes que local/visita: "xg local" no debe tomarse como el equipo local.
    if (esXgLocal(k) && cols.xgLocal < 0) cols.xgLocal = i;
    else if (esXgVisita(k) && cols.xgVisita < 0) cols.xgVisita = i;
    else if (esFecha(k) && cols.fecha < 0) cols.fecha = i;
    else if (esLocal(k) && cols.local < 0) cols.local = i;
    else if (esVisita(k) && cols.visita < 0) cols.visita = i;
  });
  return cols;
}

/** Parte una línea de CSV respetando comillas. */
function partirCsv(linea: string, sep: string): string[] {
  const out: string[] = [];
  let campo = "";
  let comillas = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (comillas) {
      if (c === '"') {
        if (linea[i + 1] === '"') { campo += '"'; i++; } else comillas = false;
      } else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === sep) { out.push(campo); campo = ""; }
    else campo += c;
  }
  out.push(campo);
  return out.map((s) => s.trim());
}

function parsearCsv(texto: string, avisos: string[]): FilaXg[] {
  const lineas = texto.split(/\r?\n/).filter((l) => l.trim());
  if (lineas.length < 2) return [];
  const sep = [";", "\t", ","].find((s) => lineas[0].includes(s)) ?? ",";
  const cols = mapearColumnas(partirCsv(lineas[0], sep));
  if (cols.fecha < 0 || cols.local < 0 || cols.visita < 0 || (cols.xgLocal < 0 && cols.xgVisita < 0)) {
    avisos.push(
      "No reconocí las columnas. Espero un encabezado con: fecha, local, visita, xG local, xG visita " +
        "(acepta home/away y variantes)."
    );
    return [];
  }
  const filas: FilaXg[] = [];
  for (let i = 1; i < lineas.length; i++) {
    const c = partirCsv(lineas[i], sep);
    const fecha = normFecha(c[cols.fecha] ?? "");
    const local = (c[cols.local] ?? "").trim();
    const visita = (c[cols.visita] ?? "").trim();
    if (!fecha || !local || !visita) continue;
    filas.push({
      fecha,
      local,
      visita,
      xgLocal: cols.xgLocal >= 0 ? normNum(c[cols.xgLocal]) : null,
      xgVisita: cols.xgVisita >= 0 ? normNum(c[cols.xgVisita]) : null,
    });
  }
  return filas;
}

function parsearJson(texto: string, avisos: string[]): FilaXg[] {
  let data: unknown;
  try {
    data = JSON.parse(texto);
  } catch {
    avisos.push("El texto no es un CSV ni un JSON válido.");
    return [];
  }
  const lista = Array.isArray(data) ? data : Array.isArray((data as { partidos?: unknown }).partidos) ? (data as { partidos: unknown[] }).partidos : [];
  const filas: FilaXg[] = [];
  for (const it of lista) {
    if (!it || typeof it !== "object") continue;
    const o = it as Record<string, unknown>;
    // Busca cada campo por cualquiera de sus alias.
    const pick = (test: (k: string) => boolean) => {
      for (const [rawK, v] of Object.entries(o)) if (test(clave(rawK))) return v;
      return undefined;
    };
    const fecha = normFecha(String(pick(esFecha) ?? ""));
    const local = String(pick(esLocal) ?? "").trim();
    const visita = String(pick(esVisita) ?? "").trim();
    if (!fecha || !local || !visita) continue;
    filas.push({
      fecha,
      local,
      visita,
      xgLocal: normNum(pick(esXgLocal)),
      xgVisita: normNum(pick(esXgVisita)),
    });
  }
  if (!filas.length) avisos.push("El JSON no traía filas con fecha, local, visita y xG.");
  return filas;
}

/** Interpreta el cuerpo subido (CSV o JSON) como filas de xG. */
export function parsearXg(texto: string): { filas: FilaXg[]; avisos: string[] } {
  const avisos: string[] = [];
  const t = texto.trim();
  if (!t) return { filas: [], avisos: ["No llegó contenido para importar."] };
  const filas = t.startsWith("[") || t.startsWith("{") ? parsearJson(t, avisos) : parsearCsv(t, avisos);
  return { filas, avisos };
}

/** Clave estable de un partido, sin importar el orden de los equipos. */
const parClave = (fecha: string, a: string, b: string) =>
  `${fecha}|${[normNombre(a), normNombre(b)].sort().join("|")}`;

/**
 * Importa el xG real: fusiona las filas nuevas con las correcciones ya guardadas
 * (una fila nueva pisa la vieja del mismo partido) y las escribe. La lectura del
 * historial las aplica encima del xG estimado, cruzando por fecha y nombre.
 */
export async function importarXg(texto: string): Promise<ResumenImport> {
  // El xG es una métrica de fútbol; la corrección vive en su almacén.
  const d: Deporte = DEPORTES.futbol;
  const { filas, avisos } = parsearXg(texto);
  if (!filas.length) return { filas: 0, guardadas: 0, avisos: avisos.length ? avisos : ["No se leyó ninguna fila válida."] };

  const previas = await leerXg(d);
  const porClave = new Map<string, OverrideXg>();
  for (const o of previas) porClave.set(parClave(o.fecha, o.local, o.visita), o);
  for (const f of filas) porClave.set(parClave(f.fecha, f.local, f.visita), f);

  const fusionadas = [...porClave.values()].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  await guardarXg(d, fusionadas);
  return { filas: filas.length, guardadas: fusionadas.length, avisos };
}
