import "server-only";
import { ApiError, TAG_STATS, TTL_STATS } from "./api";
import type { Deporte } from "./catalogo";

// El plan gratuito de API-Sports solo sirve ayer, hoy y mañana: no hay forma de
// pedirle historial. La solución es cosechar el ayer todos los días y guardarlo
// nosotros, igual que Nuprotec guarda sus datos: archivos JSON en un repo de
// GitHub, con el GITHUB_TOKEN que ya vive en Vercel. Un archivo por deporte y
// día; un día ya escrito no cambia nunca.

export type ParGuardado = { a: number; b: number };
export type PartidoGuardado = {
  fid: number;
  ts: number;
  ligaId: number;
  local: { id: number; nombre: string };
  visita: { id: number; nombre: string };
  gl: number; // marcador local
  gv: number; // marcador visita
  /** null cuando la API no entregó estadísticas para este partido. */
  stats: { l: ParGuardado; v: ParGuardado } | null;
};

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

const ruta = (d: Deporte, fecha: string) =>
  `${HOST()}/repos/${REPO()}/contents/datos-deportes/${d.id}/${fecha}.json`;

/**
 * El día guardado, o null si aún no se cosecha. Los días recientes se
 * revalidan cada 15 minutos (la cosecha pudo escribirlos hace un momento); los
 * viejos quedan cacheados como las estadísticas, para siempre.
 */
export async function leerDia(d: Deporte, fecha: string, reciente: boolean): Promise<PartidoGuardado[] | null> {
  const rama = RAMA();
  const res = await fetch(`${ruta(d, fecha)}${rama ? `?ref=${rama}` : ""}`, {
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: "application/vnd.github.raw+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "force-cache",
    next: { revalidate: reciente ? 900 : TTL_STATS, tags: [TAG_STATS, `alm-${d.id}-${fecha}`] },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(`El almacén respondió HTTP ${res.status} al leer ${fecha}.`);
  const json = (await res.json()) as unknown;
  return Array.isArray(json) ? (json as PartidoGuardado[]) : null;
}

/** Escribe (o reescribe) el día en el repo. */
export async function guardarDia(d: Deporte, fecha: string, partidos: PartidoGuardado[]): Promise<void> {
  const cab = {
    Authorization: `Bearer ${token()}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // El sha actual, si el archivo ya existe (sin caché: tiene que ser el vigente).
  const rama = RAMA();
  const previo = await fetch(`${ruta(d, fecha)}${rama ? `?ref=${rama}` : ""}`, {
    headers: cab,
    cache: "no-store",
  });
  const sha = previo.ok ? ((await previo.json()) as { sha?: string }).sha : undefined;

  const res = await fetch(ruta(d, fecha), {
    method: "PUT",
    headers: { ...cab, "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      message: `Cosecha ${d.id} ${fecha}`,
      content: Buffer.from(JSON.stringify(partidos)).toString("base64"),
      ...(rama ? { branch: rama } : {}),
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    throw new ApiError(
      `El almacén respondió HTTP ${res.status} al guardar ${fecha}. ` +
        `Revisa que GITHUB_TOKEN tenga permiso de escritura en ${REPO()}.`
    );
  }
}
