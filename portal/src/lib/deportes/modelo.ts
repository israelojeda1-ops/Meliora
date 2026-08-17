// Modelo de proyección. Sin dependencias ni acceso a red: entra el historial de
// cada equipo y sale la proyección del partido.
//
// El modelo no sabe de qué deporte se trata: trabaja con un vector de métricas
// de conteo por equipo, a favor y en contra. En fútbol son remates, córners,
// tarjetas y xG; en la NBA, puntos y triples. Los nombres y las líneas los pone
// el catálogo. Cada métrica puede faltar en un partido (un dato que la fuente
// no trajo, como el xG en partidos viejos): se guarda como null y se promedia
// solo sobre los partidos que sí la tienen.

export type PartidoHist = {
  fid: number;
  ts: number;
  casa: boolean;
  rival: string;
  gf: number; // marcador a favor
  gc: number; // marcador en contra
  mf: (number | null)[]; // métricas a favor (una celda por métrica)
  mc: (number | null)[]; // métricas en contra
};

/** Promedios por métrica (a favor y en contra), con el conteo de muestra. */
export type ResumenSede = { pj: number; f: number[]; c: number[]; n: number[] };

// La id es el nombre normalizado (ver nombres.ts): permite cruzar historial de
// fuentes distintas que numeran los equipos cada una a su manera.
export type Equipo = { id: string; nombre: string; ligaId: number; hist: PartidoHist[] };

export type Medias = { pj: number; f: number[]; c: number[]; n: number[]; sede: boolean; hist: PartidoHist[] };

export type LineaSegura = { linea: number; prob: number };

export type Lado = {
  nombre: string;
  casa: boolean;
  pj: number;
  soloSede: boolean;
  v: number[]; // proyección por métrica
  p: number[]; // prob de superar la línea del equipo, por métrica
  seg: (LineaSegura | null)[]; // línea segura por métrica
  disp: boolean[]; // si la métrica tiene datos para este equipo
  ultimos: PartidoHist[];
  // los dos promedios se muestran siempre, aunque la proyección use solo el
  // que corresponde a la sede en que juega este partido
  promLocal: ResumenSede;
  promVisita: ResumenSede;
};

export type FactorLado = {
  nombre: string;
  ataque: number;
  defensaRival: number;
  localia: number;
  proyeccion: number;
};
export type DesgloseMetrica = {
  base: number;
  local: FactorLado;
  visita: FactorLado;
  total: number;
  linea: number;
  prob: number;
  segura: LineaSegura | null;
  disp: boolean; // si hay datos para proyectar esta métrica
};

/** Totales reales de un partido terminado, por métrica (null si falta), + marcador. */
export type Resultado = { v: (number | null)[]; gl: number; gv: number };

export type Proyeccion = {
  fid: number;
  ts: number;
  liga: string;
  pais: string;
  local: string;
  visita: string;
  v: number[]; // proyección total por métrica
  p: number[]; // prob de superar la línea total, por métrica
  seg: (LineaSegura | null)[];
  disp: boolean[]; // si la métrica pudo proyectarse
  desglose: DesgloseMetrica[];
  resultado?: Resultado | null;
  idx: number;
  pjMin: number;
  lados: [Lado, Lado];
};

export type { Metrica } from "./catalogo";

export type Lineas = { total: number[]; equipo: number[] };

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
 * La línea "Más de X.5" más alta cuya probabilidad de superarse sigue por
 * encima del umbral (0.80 por defecto). null si ni "Más de 0.5" llega al umbral.
 * Las métricas con decimales (xG) usan pasos de 0.5 sobre su valor esperado.
 */
export function lineaSegura(lam: number, umbral = 0.8): LineaSegura | null {
  if (lam <= 0) return null;
  let mejor: LineaSegura | null = null;
  for (let k = 1; k <= Math.ceil(lam) + 40; k++) {
    const prob = poissonTail(lam, k);
    if (prob < umbral) break;
    mejor = { linea: k - 0.5, prob };
  }
  return mejor;
}

const promedio = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);

/**
 * Promedios de un equipo por métrica. `sede` restringe a local o visita y exige
 * al menos 3 partidos para no proyectar sobre una muestra ridícula. Cada métrica
 * se promedia sobre los partidos donde está presente (no-null).
 */
export function medias(e: Equipo, sede: "casa" | "fuera" | null, k: number): Medias | null {
  const h = sede ? e.hist.filter((x) => (sede === "casa") === x.casa) : e.hist;
  const minimo = sede ? 3 : 1;
  if (h.length < minimo) return null;
  const f: number[] = [];
  const c: number[] = [];
  const n: number[] = [];
  for (let i = 0; i < k; i++) {
    const vf = h.map((x) => x.mf[i]).filter((v): v is number => v != null);
    const vc = h.map((x) => x.mc[i]).filter((v): v is number => v != null);
    f.push(promedio(vf));
    c.push(promedio(vc));
    n.push(Math.min(vf.length, vc.length));
  }
  return { pj: h.length, f, c, n, sede: sede !== null, hist: h };
}

const vacio = (k: number): Medias => ({
  pj: 0,
  f: Array(k).fill(0),
  c: Array(k).fill(0),
  n: Array(k).fill(0),
  sede: false,
  hist: [],
});

/** Promedios por métrica, de local o de visita. */
export function resumenSede(hist: PartidoHist[], casa: boolean, k: number): ResumenSede {
  const h = hist.filter((x) => x.casa === casa);
  const f: number[] = [];
  const c: number[] = [];
  const n: number[] = [];
  for (let i = 0; i < k; i++) {
    const vf = h.map((x) => x.mf[i]).filter((v): v is number => v != null);
    const vc = h.map((x) => x.mc[i]).filter((v): v is number => v != null);
    f.push(promedio(vf));
    c.push(promedio(vc));
    n.push(Math.min(vf.length, vc.length));
  }
  return { pj: h.length, f, c, n };
}

export const mediasTotales = (e: Equipo, k: number): Medias => medias(e, null, k) ?? vacio(k);

/**
 * Referencia por liga y por métrica. Una liga con pocos equipos no es fiable, así
 * que se mezcla con el promedio global hasta tener muestra.
 */
export function basesPorLiga(equipos: Equipo[], k: number): Map<number, number[]> {
  const acum = new Map<number, { s: number[]; n: number[] }>();
  const gS = Array(k).fill(0);
  const gN = Array(k).fill(0);
  for (const e of equipos) {
    const m = mediasTotales(e, k);
    if (!m.pj) continue;
    const a = acum.get(e.ligaId) ?? { s: Array(k).fill(0), n: Array(k).fill(0) };
    for (let i = 0; i < k; i++) {
      if (m.n[i] > 0) {
        const media = (m.f[i] + m.c[i]) / 2;
        a.s[i] += media;
        a.n[i] += 1;
        gS[i] += media;
        gN[i] += 1;
      }
    }
    acum.set(e.ligaId, a);
  }
  const global = gS.map((s, i) => (gN[i] ? s / gN[i] : 0));
  const out = new Map<number, number[]>();
  for (const [liga, a] of acum) {
    out.set(
      liga,
      a.s.map((s, i) => {
        if (!a.n[i]) return global[i];
        const w = a.n[i] / (a.n[i] + 3);
        return w * (s / a.n[i]) + (1 - w) * global[i];
      })
    );
  }
  return out;
}

/** Fuerza relativa encogida hacia 1 según el tamaño de la muestra. */
const fuerza = (v: number, base: number, n: number) => (base > 0 && n > 0 ? 1 + (n / (n + 5)) * (v / base - 1) : 1);

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
  bases: Map<number, number[]>,
  lineas: Lineas,
  ventajaLocal = 1.08
): Proyeccion | null {
  const k = lineas.total.length;
  // el local se juzga por su rendimiento de local y la visita por el suyo de visita
  const sL = medias(p.local, "casa", k) ?? mediasTotales(p.local, k);
  const sV = medias(p.visita, "fuera", k) ?? mediasTotales(p.visita, k);
  if (!sL.pj || !sV.pj) return null;

  const bL = bases.get(p.local.ligaId) ?? Array(k).fill(0);
  const bV = bases.get(p.visita.ligaId) ?? Array(k).fill(0);

  // si la muestra ya es "solo de local", la ventaja de local está dentro:
  // volver a aplicarla la contaría dos veces
  const hL = sL.sede ? 1 : ventajaLocal;
  const hV = sV.sede ? 1 : 1 / ventajaLocal;

  const vTotal: number[] = [];
  const vL: number[] = [];
  const vV: number[] = [];
  const disp: boolean[] = [];
  const desglose: DesgloseMetrica[] = [];

  for (let i = 0; i < k; i++) {
    const base = (bL[i] + bV[i]) / 2;
    const dispI = sL.n[i] > 0 && sV.n[i] > 0 && base > 0;
    const atkL = fuerza(sL.f[i], bL[i], sL.n[i]);
    const defL = fuerza(sL.c[i], bL[i], sL.n[i]);
    const atkV = fuerza(sV.f[i], bV[i], sV.n[i]);
    const defV = fuerza(sV.c[i], bV[i], sV.n[i]);
    const li = base * atkL * defV * hL;
    const vi = base * atkV * defL * hV;
    const total = li + vi;
    vL.push(li);
    vV.push(vi);
    vTotal.push(total);
    disp.push(dispI);
    desglose.push({
      base,
      local: { nombre: p.local.nombre, ataque: atkL, defensaRival: defV, localia: hL, proyeccion: li },
      visita: { nombre: p.visita.nombre, ataque: atkV, defensaRival: defL, localia: hV, proyeccion: vi },
      total,
      linea: lineas.total[i],
      prob: sobreLinea(total, lineas.total[i]),
      segura: dispI ? lineaSegura(total) : null,
      disp: dispI,
    });
  }

  if (!disp.some(Boolean)) return null;

  const pTotal = vTotal.map((t, i) => (disp[i] ? sobreLinea(t, lineas.total[i]) : 0));
  const seg = vTotal.map((t, i) => (disp[i] ? lineaSegura(t) : null));

  const lado = (eq: Equipo, s: Medias, vs: number[], casa: boolean): Lado => ({
    nombre: eq.nombre,
    casa,
    pj: s.pj,
    soloSede: s.sede,
    v: vs,
    p: vs.map((v, i) => (disp[i] ? sobreLinea(v, lineas.equipo[i]) : 0)),
    seg: vs.map((v, i) => (disp[i] ? lineaSegura(v) : null)),
    disp,
    ultimos: [...eq.hist].sort((a, b) => b.ts - a.ts).slice(0, 8),
    promLocal: resumenSede(eq.hist, true, k),
    promVisita: resumenSede(eq.hist, false, k),
  });

  // índice para ordenar: la mejor probabilidad de una métrica disponible
  const idx = Math.max(0, ...pTotal.filter((_, i) => disp[i]));

  return {
    fid: p.fid,
    ts: p.ts,
    liga: p.liga,
    pais: p.pais,
    local: p.local.nombre,
    visita: p.visita.nombre,
    v: vTotal,
    p: pTotal,
    seg,
    disp,
    desglose,
    idx,
    pjMin: Math.min(sL.pj, sV.pj),
    lados: [lado(p.local, sL, vL, true), lado(p.visita, sV, vV, false)],
  };
}
