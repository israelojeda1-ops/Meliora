import "server-only";
import { ZONA } from "./fecha";
import type { Deporte } from "./catalogo";

// Planes gratuitos de API-Sports: 100 peticiones al día y 10 por minuto, por
// cada API. Por eso cada invocación trabaja con un presupuesto y se apoya en el
// caché de datos de Next: la respuesta cacheada no cuenta contra la cuota.

export const TTL_CARTELERA = 900; // 15 min: los horarios del día casi no cambian
export const TTL_HISTORIAL = 3 * 86_400; // 3 días: el historial de una liga se mueve lento
export const TTL_STATS = 365 * 86_400; // un partido jugado ya no cambia

export class SinCuota extends Error {}
export class ApiError extends Error {}

export type Presupuesto = { max: number; usadas: number };
export const nuevoPresupuesto = (max = 9): Presupuesto => ({ max, usadas: 0 });

// Las listas caducan (aparecen partidos nuevos); las estadísticas de un partido
// ya jugado no cambian nunca, así que se cachean aparte y no se expiran al
// apretar "Actualizar".
export const TAG_LISTAS = "deportes-listas";
export const TAG_STATS = "deportes-stats";

/** Permite apuntar a un servidor de prueba; en producción no se define. */
const hostDe = (d: Deporte) => process.env.API_SPORTS_URL ?? d.host;

function clave(): string {
  const k = process.env.API_FOOTBALL_KEY ?? process.env.API_SPORTS_KEY;
  if (!k) throw new ApiError("Falta la variable de entorno API_SPORTS_KEY (o API_FOOTBALL_KEY).");
  return k;
}

type Opciones = { revalidate: number; tags: string[]; presupuesto: Presupuesto };

export async function apiGet<T>(
  d: Deporte,
  ruta: string,
  params: Record<string, string | number>,
  { revalidate, tags, presupuesto }: Opciones
): Promise<T[]> {
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
  const url = `${hostDe(d)}/${ruta}${qs ? `?${qs}` : ""}`;

  // No sabemos si la respuesta saldrá del caché hasta pedirla, así que se
  // contabiliza igual: es preferible quedarse corto que pasarse del límite.
  if (presupuesto.usadas >= presupuesto.max) {
    throw new SinCuota(`Se alcanzó el tope de ${presupuesto.max} peticiones de esta pasada.`);
  }
  presupuesto.usadas += 1;

  const res = await fetch(url, {
    headers: { "x-apisports-key": clave() },
    cache: "force-cache",
    next: { revalidate, tags },
  });

  if (res.status === 429) throw new SinCuota("La API devolvió 429: cuota o ritmo excedido.");
  if (!res.ok) throw new ApiError(`La API respondió HTTP ${res.status}.`);

  const json = (await res.json()) as { response?: T[]; errors?: unknown };
  const errs = json.errors;
  if (errs && !Array.isArray(errs) && Object.keys(errs as object).length) {
    throw new ApiError(Object.values(errs as Record<string, string>).join(" · "));
  }
  if (Array.isArray(errs) && errs.length) throw new ApiError(errs.join(" · "));
  return json.response ?? [];
}

/**
 * Forma común de un partido en las tres APIs. Solo se declara lo que se usa, y
 * todo lo específico de cada deporte queda como opcional: así una diferencia en
 * la respuesta se traduce en "sin datos" y no en una excepción.
 */
export type PartidoApi = {
  // fútbol
  fixture?: { id: number; date: string; status: { short: string } };
  goals?: { home: number | null; away: number | null };
  statistics?: { team: { id: number }; statistics: { type: string; value: number | string | null }[] }[];
  // NBA y béisbol
  id?: number;
  date?: string | { start?: string };
  status?: { short?: string | number; long?: string };
  scores?: Record<string, unknown>;
  // comunes
  league?: { id: number; name?: string; country?: string; season?: number | string };
  teams?: { home: { id: number; name: string }; away: { id: number; name: string } };
};

/** Identificador del partido, se llame como se llame en cada API. */
export const idDe = (p: PartidoApi): number | null => p.fixture?.id ?? p.id ?? null;

/** Instante de inicio en ms. */
export function tsDe(p: PartidoApi): number {
  const bruto = p.fixture?.date ?? (typeof p.date === "string" ? p.date : p.date?.start);
  const t = bruto ? new Date(bruto).getTime() : NaN;
  return Number.isFinite(t) ? t : NaN;
}

/** Estado corto ("FT", "NS"…). */
export const estadoDe = (p: PartidoApi): string =>
  String(p.fixture?.status?.short ?? p.status?.short ?? "");

export const terminado = (d: Deporte, p: PartidoApi): boolean => d.terminados.includes(estadoDe(p));

/** Partidos de un día, en hora de Chile. Una sola petición por deporte. */
export const partidosDelDia = (d: Deporte, fecha: string, presupuesto: Presupuesto) =>
  apiGet<PartidoApi>(d, d.recurso, { date: fecha, timezone: ZONA }, {
    revalidate: TTL_CARTELERA,
    tags: [TAG_LISTAS, `dia-${d.id}-${fecha}`],
    presupuesto,
  });

/** Últimos N partidos jugados de una liga. */
export const ultimosDeLiga = (d: Deporte, ligaId: number, presupuesto: Presupuesto) =>
  apiGet<PartidoApi>(d, d.recurso, { league: ligaId, last: d.ultimosPorLiga }, {
    revalidate: TTL_HISTORIAL,
    tags: [TAG_LISTAS, `liga-${d.id}-${ligaId}`],
    presupuesto,
  });

/** Fútbol: hasta 20 partidos por petición, con estadísticas incluidas. */
export async function porLote(d: Deporte, ids: number[], presupuesto: Presupuesto) {
  const out: PartidoApi[] = [];
  for (let i = 0; i < ids.length; i += 20) {
    const lote = ids.slice(i, i + 20);
    out.push(
      ...(await apiGet<PartidoApi>(d, d.recurso, { ids: lote.join("-") }, {
        revalidate: TTL_STATS,
        tags: [TAG_STATS],
        presupuesto,
      }))
    );
  }
  return out;
}

/** NBA: una petición por partido al endpoint de estadísticas. */
export const statsDePartido = (d: Deporte, id: number, presupuesto: Presupuesto) =>
  apiGet<{ team?: { id: number }; statistics?: unknown[] }>(d, `${d.recurso}/statistics`, { id }, {
    revalidate: TTL_STATS,
    tags: [TAG_STATS],
    presupuesto,
  });

/** Cuota consumida hoy, según la propia API. */
export async function estado(d: Deporte, presupuesto: Presupuesto) {
  presupuesto.usadas += 1;
  const res = await fetch(`${hostDe(d)}/status`, {
    headers: { "x-apisports-key": clave() },
    cache: "no-store",
  });
  if (!res.ok) throw new ApiError(`La API respondió HTTP ${res.status}.`);
  const json = (await res.json()) as {
    response?: { subscription?: { plan?: string }; requests?: { current?: number; limit_day?: number } };
  };
  return {
    plan: json.response?.subscription?.plan ?? "?",
    usadas: json.response?.requests?.current ?? null,
    limite: json.response?.requests?.limit_day ?? null,
  };
}
