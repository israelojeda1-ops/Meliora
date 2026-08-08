// Modelo de proyección de remates y córners. Sin dependencias ni acceso a red:
// entra el historial de cada equipo y sale la proyección del partido.

export type PartidoHist = {
  fid: number;
  ts: number;
  casa: boolean;
  rival: string;
  gf: number; // goles a favor
  gc: number; // goles en contra
  tf: number; // tiros a favor
  cf: number; // córners a favor
  tc: number; // tiros en contra
  cc: number; // córners en contra
};

/** Promedios de un equipo restringidos a local o a visita. */
export type ResumenSede = { pj: number; rem: number; remC: number; cor: number; corC: number };

export type Equipo = { id: number; nombre: string; ligaId: number; hist: PartidoHist[] };

export type Medias = { pj: number; rf: number; rc: number; cf: number; cc: number; sede: boolean; hist: PartidoHist[] };

export type Lado = {
  nombre: string;
  casa: boolean;
  pj: number;
  soloSede: boolean;
  rem: number;
  cor: number;
  pRem: number;
  pCor: number;
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
  rem: number;
  cor: number;
  pRem: number;
  pCor: number;
  idx: number;
  pjMin: number;
  lados: [Lado, Lado];
};

export type Lineas = { total: { rem: number; cor: number }; equipo: { rem: number; cor: number } };

export const LINEAS_POR_DEFECTO: Lineas = {
  total: { rem: 24.5, cor: 9.5 },
  equipo: { rem: 16.5, cor: 5.5 },
};

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

/**
 * Promedios de un equipo. `sede` restringe a partidos de local o de visita, y
 * exige al menos 3 para no proyectar sobre una muestra ridícula.
 */
export function medias(e: Equipo, sede: "casa" | "fuera" | null): Medias | null {
  const h = sede ? e.hist.filter((x) => (sede === "casa") === x.casa) : e.hist;
  const minimo = sede ? 3 : 1;
  if (h.length < minimo) return null;
  const m = (k: keyof Pick<PartidoHist, "tf" | "tc" | "cf" | "cc">) =>
    h.reduce((s, x) => s + (Number(x[k]) || 0), 0) / h.length;
  return { pj: h.length, rf: m("tf"), rc: m("tc"), cf: m("cf"), cc: m("cc"), sede: sede !== null, hist: h };
}

const VACIO: Medias = { pj: 0, rf: 0, rc: 0, cf: 0, cc: 0, sede: false, hist: [] };

/** Promedio de tiros y córners, a favor y en contra, de local o de visita. */
export function resumenSede(hist: PartidoHist[], casa: boolean): ResumenSede {
  const h = hist.filter((x) => x.casa === casa);
  if (!h.length) return { pj: 0, rem: 0, remC: 0, cor: 0, corC: 0 };
  const m = (k: "tf" | "tc" | "cf" | "cc") => h.reduce((s, x) => s + (Number(x[k]) || 0), 0) / h.length;
  return { pj: h.length, rem: m("tf"), remC: m("tc"), cor: m("cf"), corC: m("cc") };
}
export const mediasTotales = (e: Equipo): Medias => medias(e, null) ?? VACIO;

export type BaseLiga = { rem: number; cor: number };

/**
 * Referencia por liga. Una liga con pocos equipos cargados no es una referencia
 * fiable, así que se mezcla con el promedio global hasta tener muestra.
 */
export function basesPorLiga(equipos: Equipo[]): Map<number, BaseLiga> {
  const acum = new Map<number, { rem: number; cor: number; n: number }>();
  let gRem = 0;
  let gCor = 0;
  let gN = 0;
  for (const e of equipos) {
    const s = mediasTotales(e);
    if (!s.pj) continue;
    const a = acum.get(e.ligaId) ?? { rem: 0, cor: 0, n: 0 };
    a.rem += (s.rf + s.rc) / 2;
    a.cor += (s.cf + s.cc) / 2;
    a.n += 1;
    acum.set(e.ligaId, a);
    gRem += (s.rf + s.rc) / 2;
    gCor += (s.cf + s.cc) / 2;
    gN += 1;
  }
  const globalRem = gN ? gRem / gN : 0;
  const globalCor = gN ? gCor / gN : 0;
  const out = new Map<number, BaseLiga>();
  for (const [liga, a] of acum) {
    const w = a.n / (a.n + 3);
    out.set(liga, {
      rem: w * (a.rem / a.n) + (1 - w) * globalRem,
      cor: w * (a.cor / a.n) + (1 - w) * globalCor,
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
  lineas: Lineas = LINEAS_POR_DEFECTO,
  ventajaLocal = 1.08
): Proyeccion | null {
  // el local se juzga por su rendimiento de local y la visita por el suyo de visita
  const sL = medias(p.local, "casa") ?? mediasTotales(p.local);
  const sV = medias(p.visita, "fuera") ?? mediasTotales(p.visita);
  if (!sL.pj || !sV.pj) return null;

  const bL = bases.get(p.local.ligaId) ?? { rem: 0, cor: 0 };
  const bV = bases.get(p.visita.ligaId) ?? { rem: 0, cor: 0 };
  const baseR = (bL.rem + bV.rem) / 2;
  const baseC = (bL.cor + bV.cor) / 2;

  const atkRL = fuerza(sL.rf, bL.rem, sL.pj);
  const defRL = fuerza(sL.rc, bL.rem, sL.pj);
  const atkRV = fuerza(sV.rf, bV.rem, sV.pj);
  const defRV = fuerza(sV.rc, bV.rem, sV.pj);
  const atkCL = fuerza(sL.cf, bL.cor, sL.pj);
  const defCL = fuerza(sL.cc, bL.cor, sL.pj);
  const atkCV = fuerza(sV.cf, bV.cor, sV.pj);
  const defCV = fuerza(sV.cc, bV.cor, sV.pj);

  // si la muestra ya es "solo de local", la ventaja de local está dentro:
  // volver a aplicarla la contaría dos veces
  const hL = sL.sede ? 1 : ventajaLocal;
  const hV = sV.sede ? 1 : 1 / ventajaLocal;

  const remL = baseR * atkRL * defRV * hL;
  const remV = baseR * atkRV * defRL * hV;
  const corL = baseC * atkCL * defCV * hL;
  const corV = baseC * atkCV * defCL * hV;
  const rem = remL + remV;
  const cor = corL + corV;

  const pRem = sobreLinea(rem, lineas.total.rem);
  const pCor = sobreLinea(cor, lineas.total.cor);

  const lado = (eq: Equipo, s: Medias, r: number, c: number, casa: boolean): Lado => ({
    nombre: eq.nombre,
    casa,
    pj: s.pj,
    soloSede: s.sede,
    rem: r,
    cor: c,
    pRem: sobreLinea(r, lineas.equipo.rem),
    pCor: sobreLinea(c, lineas.equipo.cor),
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
    rem,
    cor,
    pRem,
    pCor,
    idx: (pRem + pCor) / 2,
    pjMin: Math.min(sL.pj, sV.pj),
    lados: [lado(p.local, sL, remL, corL, true), lado(p.visita, sV, remV, corV, false)],
  };
}
