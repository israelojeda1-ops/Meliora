import "server-only";
import { ApiError, TAG_STATS, TTL_STATS } from "./api";
import type { Deporte } from "./catalogo";

// El plan gratuito de API-Sports solo sirve ayer, hoy y mañana: no hay forma de
// pedirle historial. La solución es cosechar el ayer todos los días y guardarlo
// nosotros, igual que Nuprotec guarda sus datos: archivos JSON en un repo de
// GitHub, con el GITHUB_TOKEN que ya vive en Vercel. Un archivo por deporte y
// día; un día ya escrito no cambia nunca.

// Un valor por métrica (remates, córners, tarjetas, xG…); null si la fuente no
// trajo esa métrica en ese partido.
export type ParGuardado = (number | null)[];
export type PartidoGuardado = {
  fid: number;
  ts: number;
  ligaId: number;
  local: { id: number; nombre: string };
  visita: { id: number; nombre: string };
  gl: number; // marcador local
  gv: number; // marcador visita
  /** null cuando la fuente no entregó estadísticas para este partido. */
  stats: { l: ParGuardado; v: ParGuardado } | null;
};

/**
 * Normaliza las stats de un partido guardado al arreglo por métrica. Acepta el
 * formato viejo `{a, b}` (dos métricas) y el nuevo (arreglo), para leer archivos
 * escritos antes de sumar tarjetas y xG.
 */
export function parGuardado(v: unknown): ParGuardado {
  if (Array.isArray(v)) return v.map((x) => (typeof x === "number" ? x : null));
  if (v && typeof v === "object") {
    const o = v as { a?: unknown; b?: unknown };
    const num = (x: unknown) => (typeof x === "number" ? x : null);
    return [num(o.a), num(o.b)];
  }
  return [];
}

/** Permite apuntar a un servidor de prueba; en producción no se define. */
const HOST = () => process.env.ALMACEN_URL ?? "https://api.github.com";
// Los datos del portal viven en su propio repo, aparte de los de clientes.
// ALMACEN_TOKEN permite un token dedicado, sin ampliar el de Nuprotec.
const REPO = () => process.env.ALMACEN_REPO ?? "israelojeda1-ops/datos-deportes";
// Sin ALMACEN_RAMA se usa la rama por defecto del repo.
const RAMA = () => process.env.ALMACEN_RAMA;

function token(): string {
  const t = process.env.ALMACEN_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!t) throw new ApiError("Falta ALMACEN_TOKEN (o GITHUB_TOKEN) para el almacén de historial.");
  return t;
}

// El almacén guarda dos vistas de los mismos partidos:
// - por día: datos-deportes/futbol/2026-08-08.json (lo que cosecha la jornada).
// - por equipo: datos-deportes/futbol/equipos/guadalajara.json (historial
//   profundo de un club, traído por equipo desde ESPN, incluye temporada
//   anterior y todas sus competencias).
// La lectura fusiona ambas y deduplica por `fid`, así un mismo partido nunca
// cuenta dos veces aunque esté en los dos lugares.
const rutaDia = (d: Deporte, fecha: string) =>
  `${HOST()}/repos/${REPO()}/contents/datos-deportes/${d.id}/${fecha}.json`;
const rutaEquipo = (d: Deporte, clave: string) =>
  `${HOST()}/repos/${REPO()}/contents/datos-deportes/${d.id}/equipos/${clave}.json`;

async function leerRuta(url: string, reciente: boolean, tag: string): Promise<PartidoGuardado[] | null> {
  const rama = RAMA();
  const res = await fetch(`${url}${rama ? `?ref=${rama}` : ""}`, {
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: "application/vnd.github.raw+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "force-cache",
    next: { revalidate: reciente ? 900 : TTL_STATS, tags: [TAG_STATS, tag] },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(`El almacén respondió HTTP ${res.status} al leer ${tag}.`);
  const json = (await res.json()) as unknown;
  return Array.isArray(json) ? (json as PartidoGuardado[]) : null;
}

async function guardarRuta(url: string, mensaje: string, partidos: unknown): Promise<void> {
  const cab = {
    Authorization: `Bearer ${token()}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const rama = RAMA();
  const cuerpo = Buffer.from(JSON.stringify(partidos)).toString("base64");

  // La API de contenidos de GitHub devuelve 409 cuando la rama se movió entre
  // que leímos el sha y hacemos el PUT (pasa al escribir muchos archivos
  // seguidos). Se reintenta releyendo el sha vigente.
  let ultimo = 0;
  for (let intento = 0; intento < 4; intento++) {
    const previo = await fetch(`${url}${rama ? `?ref=${rama}` : ""}`, { headers: cab, cache: "no-store" });
    const sha = previo.ok ? ((await previo.json()) as { sha?: string }).sha : undefined;

    const res = await fetch(url, {
      method: "PUT",
      headers: { ...cab, "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        message: mensaje,
        content: cuerpo,
        ...(rama ? { branch: rama } : {}),
        ...(sha ? { sha } : {}),
      }),
    });
    if (res.ok) return;
    ultimo = res.status;
    if (res.status !== 409) break;
    await new Promise((r) => setTimeout(r, 300 * (intento + 1)));
  }
  throw new ApiError(
    `El almacén respondió HTTP ${ultimo} al guardar. ` +
      `Revisa que ALMACEN_TOKEN tenga permiso de escritura en ${REPO()}.`
  );
}

/** El día guardado, o null si aún no se cosecha. */
export const leerDia = (d: Deporte, fecha: string, reciente: boolean) =>
  leerRuta(rutaDia(d, fecha), reciente, `alm-${d.id}-${fecha}`);

/** Escribe (o reescribe) el día en el repo. */
export const guardarDia = (d: Deporte, fecha: string, partidos: PartidoGuardado[]) =>
  guardarRuta(rutaDia(d, fecha), `Cosecha ${d.id} ${fecha}`, partidos);

/** Historial profundo de un equipo (clave = nombre normalizado a slug). */
export const leerEquipo = (d: Deporte, clave: string) =>
  leerRuta(rutaEquipo(d, clave), true, `alm-eq-${d.id}-${clave}`);

/** Guarda el historial profundo de un equipo. */
export const guardarEquipo = (d: Deporte, clave: string, partidos: PartidoGuardado[]) =>
  guardarRuta(rutaEquipo(d, clave), `Equipo ${d.id} ${clave}`, partidos);

// ESPN no entrega el xG por equipo, así que el historial lo trae estimado desde
// los remates. Cuando el usuario sube su Excel con el xG real, no se reescriben
// los partidos guardados (arriesgaría duplicarlos o pisar el marcador): el xG
// real se guarda aparte, como una capa de correcciones que la lectura aplica
// encima. Cada corrección es un partido por fecha y equipos, con el xG real de
// cada lado; se cruza con el historial por nombre normalizado y fecha.
export type OverrideXg = {
  fecha: string; // YYYY-MM-DD
  local: string;
  visita: string;
  xgLocal: number | null;
  xgVisita: number | null;
};

const rutaXg = (d: Deporte) =>
  `${HOST()}/repos/${REPO()}/contents/datos-deportes/${d.id}/xg.json`;

/** Las correcciones de xG real subidas, o [] si aún no hay ninguna. */
export async function leerXg(d: Deporte): Promise<OverrideXg[]> {
  const rama = RAMA();
  const res = await fetch(`${rutaXg(d)}${rama ? `?ref=${rama}` : ""}`, {
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: "application/vnd.github.raw+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "force-cache",
    next: { revalidate: 900, tags: [TAG_STATS, `xg-${d.id}`] },
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new ApiError(`El almacén respondió HTTP ${res.status} al leer el xG real.`);
  const json = (await res.json()) as unknown;
  return Array.isArray(json) ? (json as OverrideXg[]) : [];
}

/** Reescribe las correcciones de xG real. */
export const guardarXg = (d: Deporte, lista: OverrideXg[]) =>
  guardarRuta(rutaXg(d), `xG real ${d.id}`, lista);
