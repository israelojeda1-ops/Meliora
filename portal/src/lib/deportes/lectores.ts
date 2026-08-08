import type { Deporte } from "./catalogo";
import type { PartidoApi } from "./api";

// Cada API entrega las estadísticas en un lugar distinto. Los lectores son
// deliberadamente tolerantes: si un campo no está donde se espera, devuelven
// null y el partido queda fuera del historial, en vez de romper la página.
// Así una diferencia entre la documentación y la respuesta real se ve como
// "sin datos" y se corrige con un cambio acotado aquí.

export type ParMetricas = { a: number; b: number };
export type StatsPartido = { home: ParMetricas; away: ParMetricas } | null;

const numero = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  const n = Number(String(v).replace("%", ""));
  return Number.isFinite(n) ? n : null;
};

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj | null => (v && typeof v === "object" ? (v as Obj) : null);

/** Fútbol: bloque `statistics` por equipo, con filas {type, value}. */
function leerFutbol(p: PartidoApi): StatsPartido {
  const bloques = p.statistics ?? [];
  const idLocal = p.teams?.home.id;
  const idVisita = p.teams?.away.id;
  const casa = bloques.find((b) => b.team.id === idLocal);
  const fuera = bloques.find((b) => b.team.id === idVisita);
  if (!casa || !fuera) return null;

  const val = (b: NonNullable<PartidoApi["statistics"]>[number], tipo: string) => {
    const fila = b.statistics.find((x) => x.type?.toLowerCase() === tipo.toLowerCase());
    return fila ? numero(fila.value) : null;
  };
  const ha = val(casa, "Total Shots");
  const hb = val(casa, "Corner Kicks");
  const aa = val(fuera, "Total Shots");
  const ab = val(fuera, "Corner Kicks");
  if (ha === null || hb === null || aa === null || ab === null) return null;
  return { home: { a: ha, b: hb }, away: { a: aa, b: ab } };
}

/**
 * NBA: el endpoint `games/statistics` devuelve una entrada por equipo, y las
 * cifras vienen dentro de `statistics[0]` (points, tpm, …).
 */
export function leerNba(
  filas: { team?: { id: number }; statistics?: unknown[] }[],
  idLocal: number,
  idVisita: number
): StatsPartido {
  const dato = (id: number): ParMetricas | null => {
    const fila = filas.find((f) => f.team?.id === id);
    const s = obj(fila?.statistics?.[0]);
    if (!s) return null;
    const a = numero(s.points);
    const b = numero(s.tpm);
    return a === null || b === null ? null : { a, b };
  };
  const home = dato(idLocal);
  const away = dato(idVisita);
  return home && away ? { home, away } : null;
}

/**
 * Béisbol: las carreras y los hits ya vienen en la lista de partidos, dentro de
 * `scores.home` / `scores.away`, así que no hace falta una petición aparte.
 */
function leerBeisbol(p: PartidoApi): StatsPartido {
  const scores = obj(p.scores);
  if (!scores) return null;
  const lado = (k: "home" | "away"): ParMetricas | null => {
    const s = obj(scores[k]);
    if (!s) return null;
    const carreras = numero(s.total ?? s.runs);
    const hits = numero(s.hits);
    return carreras === null || hits === null ? null : { a: carreras, b: hits };
  };
  const home = lado("home");
  const away = lado("away");
  return home && away ? { home, away } : null;
}

/** Lectura que no necesita peticiones extra (fútbol por lote, béisbol en lista). */
export function leerDirecto(d: Deporte, p: PartidoApi): StatsPartido {
  if (d.id === "futbol") return leerFutbol(p);
  if (d.id === "beisbol") return leerBeisbol(p);
  return null; // la NBA necesita su petición aparte
}

/** Marcador final del partido, para mostrarlo junto a las métricas. */
export function leerMarcador(d: Deporte, p: PartidoApi): { home: number; away: number } {
  if (d.id === "futbol") {
    return { home: numero(p.goals?.home) ?? 0, away: numero(p.goals?.away) ?? 0 };
  }
  const scores = obj(p.scores);
  const lado = (k: "home" | "away") => {
    const v = scores?.[k];
    const o = obj(v);
    return numero(o ? (o.total ?? o.points ?? o.runs) : v) ?? 0;
  };
  return { home: lado("home"), away: lado("away") };
}
