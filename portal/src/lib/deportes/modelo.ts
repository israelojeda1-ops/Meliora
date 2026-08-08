// Modelo de proyección. Sin dependencias ni acceso a red: entra el historial de
// cada equipo y sale la proyección del partido.
//
// El modelo no sabe de qué deporte se trata: trabaja con dos métricas de conteo
// por equipo, A y B, cada una a favor y en contra. En fútbol son remates y
// córners; en la NBA, puntos y triples; en béisbol, carreras y hits. Los nombres
// visibles los pone el catálogo de deportes.

export type PartidoHist = {
  fid: number;
  ts: number;
  casa: boolean;
  rival: string;
  gf: number; // marcador a favor
  gc: number; // marcador en contra
  af: number; // métrica A a favor
  ac: number; // métrica A en contra
  bf: number; // métrica B a favor
  bc: number; // métrica B en contra
};

/** Promedios de un equipo restringidos a local o a visita. */
export type ResumenSede = { pj: number; a: number; aC: number; b: number; bC: number };

// La id es el nombre normalizado (ver nombres.ts): permite cruzar historial de
// fuentes distintas que numeran los equipos cada una a su manera.
export type Equipo = { id: string; nombre: string; ligaId: number; hist: PartidoHist[] };

export type Medias = { pj: number; af: number; ac: number; bf: number; bc: number; sede: boolean; hist: PartidoHist[] };

export type Lado = {
  nombre: string;
  casa: boolean;
  pj: number;
  soloSede: boolean;
  a: number;
  b: number;
  pA: number;
  pB: number;
  // línea Over más alta con prob > 80% para este equipo, o null
  segA: LineaSegura | null;
  segB: LineaSegura | null;
  ultimos: PartidoHist[];
  // los dos promedios se muestran siempre, aunque la proyección use solo el
  // que corresponde a la sede en que juega este partido
  promLocal: ResumenSede;
  promVisita: ResumenSede;
};

export type Proyeccion = {
  fid: number;
  ts: number;
  liga: string;
  pais: string;
  local: string;
  visita: string;
  a: number;
  b: number;
  pA: number;
  pB: number;
  // línea Over más alta con prob > 80% para el total del partido, o null
  segA: LineaSegura | null;
  segB: LineaSegura | null;
  idx: number;
  pjMin: number;
  lados: [Lado, Lado];
};

export type { Metricas } from "./catalogo";

export type Lineas = { total: { a: number; b: number }; equipo: { a: number; b: number } };

/** P(X >= k) con X ~ Poisson(lam). */
export function poissonTail(lam: number, k: number): number {
  if (lam <= 0) return k <= 0 ? 1 : 0;
  if (k <= 0) return 1;
  let term = Math.exp(-lam);
  let acum = term;
  for (let i = 1; i < k; i++) {
    term *= lam / i;
    acum += term;
  }
  return Math.min(1, Math.max(0, 1 - acum));
}

const sobreLinea = (lam: number, linea: number) => poissonTail(lam, Math.floor(linea) + 1);

export type LineaSegura = { linea: number; prob: number };

/**
 * La línea "Más de X.5" más alta cuya probabilidad de superarse sigue por
 * encima del umbral (0.80 por defecto). Es la recomendación conservadora:
 * "Más de 21.5 remates" con ~81% de caer. null si ni "Más de 0.5" llega al
 * umbral (proyección demasiado baja).
 */
export function lineaSegura(lam: number, umbral = 0.8): LineaSegura | null {
  let mejor: LineaSegura | null = null;
  // k = mínimo entero que hace ganar el "Más de (k-0.5)"; se sube mientras
  // la cola siga sobre el umbral.
  for (let k = 1; k <= Math.ceil(lam) + 40; k++) {
    const prob = poissonTail(lam, k);
    if (prob < umbral) break;
    mejor = { linea: k - 0.5, prob };
  }
  return mejor;
}

/**
 * Promedios de un equipo. `sede` restringe a partidos de local o de visita, y
 * exige al menos 3 para no proyectar sobre una muestra ridícula.
 */
export function medias(e: Equipo, sede: "casa" | "fuera" | null): Medias | null {
  const h = sede ? e.hist.filter((x) => (sede === "casa") === x.casa) : e.hist;
  const minimo = sede ? 3 : 1;
  if (h.length < minimo) return null;
  const m = (k: keyof Pick<PartidoHist, "af" | "ac" | "bf" | "bc">) =>
    h.reduce((s, x) => s + (Number(x[k]) || 0), 0) / h.length;
  return { pj: h.length, af: m("af"), ac: m("ac"), bf: m("bf"), bc: m("bc"), sede: sede !== null, hist: h };
}

const VACIO: Medias = { pj: 0, af: 0, ac: 0, bf: 0, bc: 0, sede: false, hist: [] };

/** Promedio de tiros y córners, a favor y en contra, de local o de visita. */
export function resumenSede(hist: PartidoHist[], casa: boolean): ResumenSede {
  const h = hist.filter((x) => x.casa === casa);
  if (!h.length) return { pj: 0, a: 0, aC: 0, b: 0, bC: 0 };
  const m = (k: "af" | "ac" | "bf" | "bc") => h.reduce((s, x) => s + (Number(x[k]) || 0), 0) / h.length;
  return { pj: h.length, a: m("af"), aC: m("ac"), b: m("bf"), bC: m("bc") };
}
export const mediasTotales = (e: Equipo): Medias => medias(e, null) ?? VACIO;

export type BaseLiga = { a: number; b: number };

/**
 * Referencia por liga. Una liga con pocos equipos cargados no es una referencia
 * fiable, así que se mezcla con el promedio global hasta tener muestra.
 */
export function basesPorLiga(equipos: Equipo[]): Map<number, BaseLiga> {
  const acum = new Map<number, { a: number; b: number; n: number }>();
  let gA = 0;
  let gB = 0;
  let gN = 0;
  for (const e of equipos) {
    const s = mediasTotales(e);
    if (!s.pj) continue;
    const acc = acum.get(e.ligaId) ?? { a: 0, b: 0, n: 0 };
    acc.a += (s.af + s.ac) / 2;
    acc.b += (s.bf + s.bc) / 2;
    acc.n += 1;
    acum.set(e.ligaId, acc);
    gA += (s.af + s.ac) / 2;
    gB += (s.bf + s.bc) / 2;
    gN += 1;
  }
  const globalA = gN ? gA / gN : 0;
  const globalB = gN ? gB / gN : 0;
  const out = new Map<number, BaseLiga>();
  for (const [liga, acc] of acum) {
    const w = acc.n / (acc.n + 3);
    out.set(liga, {
      a: w * (acc.a / acc.n) + (1 - w) * globalA,
      b: w * (acc.b / acc.n) + (1 - w) * globalB,
    });
  }
  return out;
}

/** Fuerza relativa encogida hacia 1 según el tamaño de la muestra. */
const fuerza = (v: number, base: number, n: number) => (base > 0 ? 1 + (n / (n + 5)) * (v / base - 1) : 1);

export type EntradaPartido = {
  fid: number;
  ts: number;
  liga: string;
  pais: string;
  ligaId: number;
  local: Equipo;
  visita: Equipo;
};

export function proyectar(
  p: EntradaPartido,
  bases: Map<number, BaseLiga>,
  lineas: Lineas,
  ventajaLocal = 1.08
): Proyeccion | null {
  // el local se juzga por su rendimiento de local y la visita por el suyo de visita
  const sL = medias(p.local, "casa") ?? mediasTotales(p.local);
  const sV = medias(p.visita, "fuera") ?? mediasTotales(p.visita);
  if (!sL.pj || !sV.pj) return null;

  const bL = bases.get(p.local.ligaId) ?? { a: 0, b: 0 };
  const bV = bases.get(p.visita.ligaId) ?? { a: 0, b: 0 };
  const baseA = (bL.a + bV.a) / 2;
  const baseB = (bL.b + bV.b) / 2;

  const atkAL = fuerza(sL.af, bL.a, sL.pj);
  const defAL = fuerza(sL.ac, bL.a, sL.pj);
  const atkAV = fuerza(sV.af, bV.a, sV.pj);
  const defAV = fuerza(sV.ac, bV.a, sV.pj);
  const atkBL = fuerza(sL.bf, bL.b, sL.pj);
  const defBL = fuerza(sL.bc, bL.b, sL.pj);
  const atkBV = fuerza(sV.bf, bV.b, sV.pj);
  const defBV = fuerza(sV.bc, bV.b, sV.pj);

  // si la muestra ya es "solo de local", la ventaja de local está dentro:
  // volver a aplicarla la contaría dos veces
  const hL = sL.sede ? 1 : ventajaLocal;
  const hV = sV.sede ? 1 : 1 / ventajaLocal;

  const aL = baseA * atkAL * defAV * hL;
  const aV = baseA * atkAV * defAL * hV;
  const bL2 = baseB * atkBL * defBV * hL;
  const bV2 = baseB * atkBV * defBL * hV;
  const totalA = aL + aV;
  const totalB = bL2 + bV2;

  const pA = sobreLinea(totalA, lineas.total.a);
  const pB = sobreLinea(totalB, lineas.total.b);

  const lado = (eq: Equipo, s: Medias, va: number, vb: number, casa: boolean): Lado => ({
    nombre: eq.nombre,
    casa,
    pj: s.pj,
    soloSede: s.sede,
    a: va,
    b: vb,
    pA: sobreLinea(va, lineas.equipo.a),
    pB: sobreLinea(vb, lineas.equipo.b),
    segA: lineaSegura(va),
    segB: lineaSegura(vb),
    // el listado muestra todo el historial reciente, de local y de visita
    ultimos: [...eq.hist].sort((a, b) => b.ts - a.ts).slice(0, 8),
    promLocal: resumenSede(eq.hist, true),
    promVisita: resumenSede(eq.hist, false),
  });

  return {
    fid: p.fid,
    ts: p.ts,
    liga: p.liga,
    pais: p.pais,
    local: p.local.nombre,
    visita: p.visita.nombre,
    a: totalA,
    b: totalB,
    pA,
    pB,
    segA: lineaSegura(totalA),
    segB: lineaSegura(totalB),
    idx: (pA + pB) / 2,
    pjMin: Math.min(sL.pj, sV.pj),
    lados: [lado(p.local, sL, aL, bL2, true), lado(p.visita, sV, aV, bV2, false)],
  };
}
