import "server-only";
import { ApiError, TAG_STATS, TTL_STATS } from "./api";
import { DIA_MS, aTs, fechaChile } from "./fecha";
import { DEPORTES, Liga } from "./catalogo";
import { PartidoGuardado, guardarDia, leerDia } from "./almacen";

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

/** Los partidos de una liga en un día, según el marcador de ESPN. */
async function diaEspn(liga: Liga, fecha: string): Promise<EventoDia[]> {
  const json = await espnGet(
    `/apis/site/v2/sports/soccer/${liga.espn}/scoreboard?dates=${fecha.replaceAll("-", "")}`
  );
  const out: EventoDia[] = [];
  for (const e of arr(json.events)) {
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
    if (id === null || !Number.isFinite(ts) || !eqL || !eqV) continue;
    out.push({
      id,
      ts,
      terminado: obj(obj(ev?.status)?.type)?.state === "post",
      local: eqL,
      visita: eqV,
      gl: num(local?.score) ?? 0,
      gv: num(visita?.score) ?? 0,
    });
  }
  return out;
}

/** Remates y córners de un partido, por id de equipo de ESPN. */
async function statsEspn(liga: Liga, eventoId: number): Promise<Map<number, { a: number; b: number }>> {
  const json = await espnGet(`/apis/site/v2/sports/soccer/${liga.espn}/summary?event=${eventoId}`);
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

export type ResumenPoblado = {
  diasEscritos: number;
  partidos: number;
  sinStats: number;
  avisos: string[];
};

/**
 * Puebla el almacén de fútbol con los últimos `dias` días desde ESPN. Los días
 * que ya existen en el almacén se respetan: esto rellena lo que falta, no pisa
 * lo cosechado.
 */
export async function poblarFutbol(dias: number, ligaId?: number): Promise<ResumenPoblado> {
  const d = DEPORTES.futbol;
  const ligas = d.ligas.filter((l) => l.espn && (ligaId === undefined || l.id === ligaId));
  const avisos: string[] = [];
  let diasEscritos = 0;
  let partidos = 0;
  let sinStats = 0;

  const mediodiaHoy = aTs(`${fechaChile(Date.now())}T12:00`);
  for (let i = 1; i <= dias; i++) {
    const fecha = fechaChile(mediodiaHoy - i * DIA_MS);
    try {
      if ((await leerDia(d, fecha, i < 2)) !== null) continue; // ya cosechado o poblado

      const delDia: PartidoGuardado[] = [];
      for (const liga of ligas) {
        for (const ev of await diaEspn(liga, fecha)) {
          if (!ev.terminado) continue;
          let stats: Map<number, { a: number; b: number }>;
          try {
            stats = await statsEspn(liga, ev.id);
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

      await guardarDia(d, fecha, delDia);
      diasEscritos += 1;
      partidos += delDia.length;
    } catch (err) {
      avisos.push(`${fecha}: ${(err as Error).message}`);
    }
  }

  return { diasEscritos, partidos, sinStats, avisos };
}
