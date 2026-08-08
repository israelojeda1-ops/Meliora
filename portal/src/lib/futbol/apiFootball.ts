import "server-only";
import { ZONA } from "./fecha";

// Plan gratuito de API-Football: 100 peticiones al día y 10 por minuto.
// Por eso cada invocación trabaja con un presupuesto y se apoya en el caché de
// datos de Next: la respuesta cacheada no cuenta contra la cuota.
// Configurable solo para poder levantar la app contra un servidor de prueba;
// en producción no se define y apunta a la API real.
const API = process.env.API_FOOTBALL_URL ?? "https://v3.football.api-sports.io";

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
export const TAG_LISTAS = "futbol-listas";
export const TAG_STATS = "futbol-stats";

type Opciones = { revalidate: number; tags: string[]; presupuesto: Presupuesto };

export async function apiGet<T>(
  ruta: string,
  params: Record<string, string | number>,
  { revalidate, tags, presupuesto }: Opciones
): Promise<{ response: T[] }> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) throw new ApiError("Falta la variable de entorno API_FOOTBALL_KEY.");

  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
  const url = `${API}/${ruta}?${qs}`;

  // No sabemos si la respuesta saldrá del caché hasta pedirla, así que se
  // contabiliza igual: es preferible quedarse corto que pasarse del límite.
  if (presupuesto.usadas >= presupuesto.max) {
    throw new SinCuota(`Se alcanzó el tope de ${presupuesto.max} peticiones de esta pasada.`);
  }
  presupuesto.usadas += 1;

  const res = await fetch(url, {
    headers: { "x-apisports-key": key },
    cache: "force-cache",
    next: { revalidate, tags },
  });

  if (res.status === 429) throw new SinCuota("API-Football devolvió 429: cuota o ritmo excedido.");
  if (!res.ok) throw new ApiError(`API-Football respondió HTTP ${res.status}.`);

  const json = (await res.json()) as { response?: T[]; errors?: unknown };
  const errs = json.errors;
  if (errs && !Array.isArray(errs) && Object.keys(errs as object).length) {
    throw new ApiError(Object.values(errs as Record<string, string>).join(" · "));
  }
  if (Array.isArray(errs) && errs.length) throw new ApiError(errs.join(" · "));
  return { response: json.response ?? [] };
}

// ---- formas mínimas de la respuesta que realmente usamos ----
export type FixtureApi = {
  fixture: { id: number; date: string; status: { short: string } };
  league: { id: number; name: string; country: string; season?: number };
  teams: { home: { id: number; name: string }; away: { id: number; name: string } };
  goals?: { home: number | null; away: number | null };
  statistics?: { team: { id: number }; statistics: { type: string; value: number | string | null }[] }[];
};

export const TERMINADOS = new Set(["FT", "AET", "PEN"]);

/** Partidos de un día, en hora de Chile. Una sola petición para todas las ligas. */
export async function fixturesDelDia(fecha: string, presupuesto: Presupuesto) {
  const { response } = await apiGet<FixtureApi>(
    "fixtures",
    { date: fecha, timezone: ZONA },
    { revalidate: TTL_CARTELERA, tags: [TAG_LISTAS, `dia-${fecha}`], presupuesto }
  );
  return response;
}

/** Últimos N partidos jugados de una liga (todos sus equipos a la vez). */
export async function ultimosDeLiga(ligaId: number, n: number, presupuesto: Presupuesto) {
  const { response } = await apiGet<FixtureApi>(
    "fixtures",
    { league: ligaId, last: n },
    { revalidate: TTL_HISTORIAL, tags: [TAG_LISTAS, `liga-${ligaId}`], presupuesto }
  );
  return response.filter((f) => TERMINADOS.has(f.fixture.status.short));
}

/** Estadísticas de hasta 20 partidos por petición. Un partido jugado no cambia,
 *  así que se cachea prácticamente para siempre. */
export async function statsDeFixtures(ids: number[], presupuesto: Presupuesto) {
  const out: FixtureApi[] = [];
  for (let i = 0; i < ids.length; i += 20) {
    const lote = ids.slice(i, i + 20);
    const { response } = await apiGet<FixtureApi>(
      "fixtures",
      { ids: lote.join("-") },
      { revalidate: TTL_STATS, tags: [TAG_STATS], presupuesto }
    );
    out.push(...response);
  }
  return out;
}

/** Cuota consumida hoy según la propia API. */
export async function estado(presupuesto: Presupuesto) {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) throw new ApiError("Falta la variable de entorno API_FOOTBALL_KEY.");
  presupuesto.usadas += 1;
  const res = await fetch(`${API}/status`, { headers: { "x-apisports-key": key }, cache: "no-store" });
  if (!res.ok) throw new ApiError(`API-Football respondió HTTP ${res.status}.`);
  const json = (await res.json()) as {
    response?: { subscription?: { plan?: string }; requests?: { current?: number; limit_day?: number } };
  };
  return {
    plan: json.response?.subscription?.plan ?? "?",
    usadas: json.response?.requests?.current ?? null,
    limite: json.response?.requests?.limit_day ?? null,
  };
}
