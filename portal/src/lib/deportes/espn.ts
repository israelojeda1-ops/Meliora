import "server-only";
import { ApiError, PartidoApi, TAG_STATS, TTL_STATS } from "./api";
import { DIA_MS, aTs, fechaChile } from "./fecha";
import { Deporte, DEPORTES, Liga, ligasActivas } from "./catalogo";
import { PartidoGuardado, guardarDia, guardarEquipo, leerDia, leerEquipo } from "./almacen";
import { normNombre } from "./nombres";

// Fuente abierta para poblar el historial de fútbol de una vez, en lugar de
// esperar a que la cosecha diaria lo junte: la API pública de ESPN (sin clave)
// entrega por partido los remates y córners de cada equipo. Se usa solo a
// pedido — el botón "Poblar historial" — y escribe en el mismo almacén que la
// cosecha; el día a día lo sigue manteniendo API-Football.

const HOST = () => process.env.ESPN_URL ?? "https://site.api.espn.com";

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj | null => (v && typeof v === "object" ? (v as Obj) : null);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const num = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

async function espnGet(ruta: string): Promise<Obj> {
  // Días pasados: inmutables, cacheados como las estadísticas.
  const res = await fetch(`${HOST()}${ruta}`, {
    cache: "force-cache",
    next: { revalidate: TTL_STATS, tags: [TAG_STATS] },
  });
  if (!res.ok) throw new ApiError(`ESPN respondió HTTP ${res.status}.`);
  return (await res.json()) as Obj;
}

type EventoDia = {
  id: number;
  ts: number;
  terminado: boolean;
  local: { id: number; nombre: string };
  visita: { id: number; nombre: string };
  gl: number;
  gv: number;
};

/** Interpreta un evento de ESPN (scoreboard o schedule tienen la misma forma). */
function parseEvento(e: unknown): EventoDia | null {
  const ev = obj(e);
  const comp = obj(arr(ev?.competitions)[0]);
  const lados = arr(comp?.competitors).map(obj);
  const local = lados.find((c) => c?.homeAway === "home");
  const visita = lados.find((c) => c?.homeAway === "away");
  const id = num(ev?.id);
  const ts = ev?.date ? new Date(String(ev.date)).getTime() : NaN;
  const equipo = (c: Obj | null | undefined) => {
    const t = obj(c?.team);
    const tid = num(t?.id);
    const nombre = t?.displayName ?? t?.name;
    return tid !== null && typeof nombre === "string" ? { id: tid, nombre } : null;
  };
  const eqL = equipo(local);
  const eqV = equipo(visita);
  if (id === null || !Number.isFinite(ts) || !eqL || !eqV) return null;
  // El estado puede venir en el evento o en la competición según el endpoint.
  const estado = obj(obj(ev?.status)?.type)?.state ?? obj(obj(comp?.status)?.type)?.state;
  return {
    id,
    ts,
    terminado: estado === "post",
    local: eqL,
    visita: eqV,
    gl: num(local?.score) ?? 0,
    gv: num(visita?.score) ?? 0,
  };
}

/** Los partidos de una liga en un día, según el marcador de ESPN. */
async function diaEspn(liga: Liga, fecha: string): Promise<EventoDia[]> {
  const json = await espnGet(
    `/apis/site/v2/sports/soccer/${liga.espn}/scoreboard?dates=${fecha.replaceAll("-", "")}`
  );
  return arr(json.events).map(parseEvento).filter((e): e is EventoDia => e !== null);
}

/** Remates y córners de un partido, por id de equipo de ESPN. */
async function statsEspn(slug: string, eventoId: number): Promise<Map<number, { a: number; b: number }>> {
  const json = await espnGet(`/apis/site/v2/sports/soccer/${slug}/summary?event=${eventoId}`);
  const out = new Map<number, { a: number; b: number }>();
  for (const t of arr(obj(json.boxscore)?.teams)) {
    const lado = obj(t);
    const tid = num(obj(lado?.team)?.id);
    if (tid === null) continue;
    let remates: number | null = null;
    let corners: number | null = null;
    for (const st of arr(lado?.statistics)) {
      const fila = obj(st);
      if (fila?.name === "totalShots") remates = num(fila.displayValue ?? fila.value);
      if (fila?.name === "wonCorners") corners = num(fila.displayValue ?? fila.value);
    }
    if (remates !== null && corners !== null) out.set(tid, { a: remates, b: corners });
  }
  return out;
}

/**
 * Remates, córners y marcador de un partido en una sola petición. En el schedule
 * el marcador viene como un `$ref` (un enlace, no el número), así que se toma del
 * `summary`, que además trae las estadísticas.
 */
async function resumenEspn(
  slug: string,
  eventoId: number
): Promise<{ stats: Map<number, { a: number; b: number }>; marcador: Map<number, number> }> {
  const json = await espnGet(`/apis/site/v2/sports/soccer/${slug}/summary?event=${eventoId}`);
  const stats = new Map<number, { a: number; b: number }>();
  for (const t of arr(obj(json.boxscore)?.teams)) {
    const lado = obj(t);
    const tid = num(obj(lado?.team)?.id);
    if (tid === null) continue;
    let remates: number | null = null;
    let corners: number | null = null;
    for (const st of arr(lado?.statistics)) {
      const fila = obj(st);
      if (fila?.name === "totalShots") remates = num(fila.displayValue ?? fila.value);
      if (fila?.name === "wonCorners") corners = num(fila.displayValue ?? fila.value);
    }
    if (remates !== null && corners !== null) stats.set(tid, { a: remates, b: corners });
  }
  const marcador = new Map<number, number>();
  for (const c of arr(obj(arr(obj(json.header)?.competitions)[0])?.competitors)) {
    const comp = obj(c);
    const tid = num(comp?.id) ?? num(obj(comp?.team)?.id);
    const g = num(comp?.score);
    if (tid !== null && g !== null) marcador.set(tid, g);
  }
  return { stats, marcador };
}

/** Equipos de una liga (id y nombre de ESPN). */
async function equiposDeLiga(slug: string): Promise<{ id: number; nombre: string }[]> {
  const json = await espnGet(`/apis/site/v2/sports/soccer/${slug}/teams`);
  const sports = arr(json.sports);
  const leagues = arr(obj(sports[0])?.leagues);
  const teams = arr(obj(leagues[0])?.teams);
  const out: { id: number; nombre: string }[] = [];
  for (const t of teams) {
    const team = obj(obj(t)?.team);
    const id = num(team?.id);
    const nombre = team?.displayName;
    if (id !== null && typeof nombre === "string") out.push({ id, nombre });
  }
  return out;
}

/** Últimos partidos jugados de un equipo, de sus temporadas recientes. */
async function scheduleEquipo(slug: string, teamId: number, temporadas: number[]): Promise<EventoDia[]> {
  const vistos = new Set<number>();
  const out: EventoDia[] = [];
  for (const s of temporadas) {
    const json = await espnGet(`/apis/site/v2/sports/soccer/${slug}/teams/${teamId}/schedule?season=${s}`);
    for (const e of arr(json.events)) {
      const p = parseEvento(e);
      if (p && p.terminado && !vistos.has(p.id)) {
        vistos.add(p.id);
        out.push(p);
      }
    }
  }
  return out.sort((a, b) => b.ts - a.ts);
}

export type ResumenPoblado = {
  diasEscritos: number;
  partidos: number;
  sinStats: number;
  avisos: string[];
};

/**
 * Puebla el almacén de fútbol con los últimos `dias` días desde ESPN. Sin liga,
 * rellena solo los días que faltan, sin pisar lo cosechado. Con una liga, la
 * inyecta también en los días ya guardados que aún no la tienen — es como se
 * incorpora una competencia nueva (Leagues Cup) al historial existente.
 */
export async function poblarFutbol(dias: number, ligaId?: number): Promise<ResumenPoblado> {
  const d = DEPORTES.futbol;
  // Sin liga explícita se puebla lo activo; con liga, esa aunque no esté activa
  // (permite backfillear una competencia puntual).
  const base = ligaId === undefined ? ligasActivas(d) : d.ligas;
  const ligas = base.filter((l) => l.espn && (ligaId === undefined || l.id === ligaId));
  const avisos: string[] = [];
  let diasEscritos = 0;
  let partidos = 0;
  let sinStats = 0;

  // La función corre dentro de un lambda con tope de tiempo: si el poblado no
  // alcanza, se corta limpio y el siguiente toque del botón continúa (los días
  // ya escritos se saltan al tiro).
  const limite = Date.now() + 45_000;

  const mediodiaHoy = aTs(`${fechaChile(Date.now())}T12:00`);
  for (let i = 1; i <= dias; i++) {
    if (Date.now() > limite) {
      avisos.push(`Se acabó el tiempo de esta pasada; toca el botón de nuevo para seguir (va ${i - 1} de ${dias} días).`);
      break;
    }
    const fecha = fechaChile(mediodiaHoy - i * DIA_MS);
    try {
      const existente = await leerDia(d, fecha, i < 2);
      if (existente !== null && ligaId === undefined) continue; // ya cosechado o poblado
      if (existente !== null && existente.some((g) => g.ligaId === ligaId)) continue;

      const delDia: PartidoGuardado[] = [];
      for (const liga of ligas) {
        for (const ev of await diaEspn(liga, fecha)) {
          if (!ev.terminado) continue;
          let stats: Map<number, { a: number; b: number }>;
          try {
            stats = await statsEspn(liga.espn!, ev.id);
          } catch {
            stats = new Map();
          }
          const l = stats.get(ev.local.id) ?? null;
          const v = stats.get(ev.visita.id) ?? null;
          if (!l || !v) sinStats += 1;
          delDia.push({
            fid: ev.id,
            ts: ev.ts,
            ligaId: liga.id,
            local: ev.local,
            visita: ev.visita,
            gl: ev.gl,
            gv: ev.gv,
            stats: l && v ? { l, v } : null,
          });
        }
      }

      if (existente !== null && !delDia.length) continue; // nada nuevo que anotar
      await guardarDia(d, fecha, [...(existente ?? []), ...delDia]);
      diasEscritos += 1;
      partidos += delDia.length;
    } catch (err) {
      avisos.push(`${fecha}: ${(err as Error).message}`);
    }
  }

  return { diasEscritos, partidos, sinStats, avisos };
}

export type ResumenEquipos = {
  equiposEscritos: number;
  partidos: number;
  avisos: string[];
};

// Ligas domésticas de las que se traen los equipos: dan el historial profundo
// (temporada actual + anterior) de todos los clubes que juegan MLS y Leagues
// Cup, incluidos los mexicanos que llegan a la Leagues Cup.
const DOMESTICAS: { slug: string; ligaId: number }[] = [
  { slug: "usa.1", ligaId: 253 },
  { slug: "mex.1", ligaId: 262 },
];

const claveEquipo = (nombre: string) => normNombre(nombre).replace(/ /g, "-");

/**
 * Puebla el historial **por equipo** (no por liga/día): recorre los clubes de
 * las ligas domésticas y guarda, para cada uno, sus últimos partidos de la
 * temporada en curso y la anterior con remates y córners, desde ESPN. Es lo que
 * da profundidad real cuando una temporada recién empezó. Se salta los equipos
 * ya guardados, así que corre a tramos y se retoma tocando de nuevo.
 */
export async function poblarPorEquipo(forzar = false, porEquipo = 12): Promise<ResumenEquipos> {
  const d = DEPORTES.futbol;
  const avisos: string[] = [];
  let equiposEscritos = 0;
  let partidos = 0;
  const limite = Date.now() + 45_000;
  // Solo la temporada en curso: refleja el plantel y la forma actual, sin
  // arrastrar la campaña anterior. `forzar` reescribe los archivos existentes.
  const temporadas = [new Date().getFullYear()];

  for (const dom of DOMESTICAS) {
    let equipos: { id: number; nombre: string }[];
    try {
      equipos = await equiposDeLiga(dom.slug);
    } catch (err) {
      avisos.push(`${dom.slug}: ${(err as Error).message}`);
      continue;
    }

    for (const eq of equipos) {
      if (Date.now() > limite) {
        avisos.push("Se acabó el tiempo de esta pasada; toca de nuevo para seguir con el resto de equipos.");
        return { equiposEscritos, partidos, avisos };
      }
      const clave = claveEquipo(eq.nombre);
      if (!clave) continue;
      try {
        if (!forzar && (await leerEquipo(d, clave)) !== null) continue; // ya poblado

        const eventos = (await scheduleEquipo(dom.slug, eq.id, temporadas)).slice(0, porEquipo);
        const guardados: PartidoGuardado[] = [];
        for (const ev of eventos) {
          let stats = new Map<number, { a: number; b: number }>();
          let marcador = new Map<number, number>();
          try {
            ({ stats, marcador } = await resumenEspn(dom.slug, ev.id));
          } catch {
            /* sin resumen: el partido queda sin stats y se descarta al leer */
          }
          const l = stats.get(ev.local.id) ?? null;
          const v = stats.get(ev.visita.id) ?? null;
          guardados.push({
            fid: ev.id,
            ts: ev.ts,
            ligaId: dom.ligaId,
            local: ev.local,
            visita: ev.visita,
            // marcador del summary; si falta, el del schedule (que suele ser 0)
            gl: marcador.get(ev.local.id) ?? ev.gl,
            gv: marcador.get(ev.visita.id) ?? ev.gv,
            stats: l && v ? { l, v } : null,
          });
        }
        await guardarEquipo(d, clave, guardados);
        equiposEscritos += 1;
        partidos += guardados.length;
      } catch (err) {
        avisos.push(`${eq.nombre}: ${(err as Error).message}`);
      }
    }
  }

  return { equiposEscritos, partidos, avisos };
}

export type ResultadoEspn = { a: number; b: number; gl: number; gv: number; homeNorm: string };

/** Clave del partido independiente del orden de los equipos. */
const parClave = (n1: string, n2: string) => [normNombre(n1), normNombre(n2)].sort().join("|");

/**
 * Totales reales (remates, córners, marcador) de los partidos terminados de una
 * fecha en las ligas activas, desde ESPN (gratis). Indexados por el par de
 * equipos normalizado, así se cruzan con la cartelera aunque la API del día use
 * otros nombres. `homeNorm` permite orientar el marcador.
 */
export async function resultadosEspn(fecha: string): Promise<Map<string, ResultadoEspn>> {
  const d = DEPORTES.futbol;
  const out = new Map<string, ResultadoEspn>();
  for (const liga of ligasActivas(d)) {
    if (!liga.espn) continue;
    let eventos: EventoDia[];
    try {
      eventos = await diaEspn(liga, fecha);
    } catch {
      continue;
    }
    for (const ev of eventos) {
      if (!ev.terminado) continue;
      try {
        const { stats } = await resumenEspn(liga.espn, ev.id);
        const l = stats.get(ev.local.id);
        const v = stats.get(ev.visita.id);
        if (!l || !v) continue;
        out.set(parClave(ev.local.nombre, ev.visita.nombre), {
          a: l.a + v.a,
          b: l.b + v.b,
          gl: ev.gl,
          gv: ev.gv,
          homeNorm: normNombre(ev.local.nombre),
        });
      } catch {
        /* un partido sin resumen no aporta resultado */
      }
    }
  }
  return out;
}

/**
 * La cartelera de una fecha (partidos por jugarse y ya jugados) de las ligas
 * activas, desde ESPN. Reemplaza a API-Football: el plan gratuito quedó
 * suspendido y ESPN no cobra ni limita la fecha. Devuelve objetos con la forma
 * mínima que espera el resto del código (equiposDe, tsDe, idDe, terminado…).
 */
export async function carteleraEspn(d: Deporte, fecha: string): Promise<PartidoApi[]> {
  const centro = aTs(`${fecha}T12:00`);
  // ESPN agrupa por su propio huso; se barren el día y sus vecinos y se filtra
  // por fecha chilena para no perder los partidos nocturnos.
  const fechas = [-1, 0, 1].map((k) => fechaChile(centro + k * DIA_MS));
  const vistos = new Set<number>();
  const out: PartidoApi[] = [];
  for (const liga of ligasActivas(d)) {
    if (!liga.espn) continue;
    for (const f of fechas) {
      let eventos: EventoDia[];
      try {
        eventos = await diaEspn(liga, f);
      } catch {
        continue;
      }
      for (const ev of eventos) {
        if (vistos.has(ev.id) || fechaChile(ev.ts) !== fecha) continue;
        vistos.add(ev.id);
        out.push({
          id: ev.id,
          date: new Date(ev.ts).toISOString(),
          status: { short: ev.terminado ? "FT" : "NS" },
          teams: {
            home: { id: ev.local.id, name: ev.local.nombre },
            away: { id: ev.visita.id, name: ev.visita.nombre },
          },
          league: { id: liga.id, name: liga.nombre, country: liga.pais },
        });
      }
    }
  }
  return out;
}
