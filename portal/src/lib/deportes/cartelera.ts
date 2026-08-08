import "server-only";
import { DIA_MS, aTs, fechaChile, nombreDia } from "./fecha";
import { Deporte, DeporteId, buscarLiga, getDeporte } from "./catalogo";
import {
  PartidoApi,
  Presupuesto,
  SinCuota,
  estadoDe,
  idDe,
  ligaIdDe,
  ligaObj,
  nuevoPresupuesto,
  partidosDeFecha,
  porLote,
  statsDePartido,
  terminado,
  tsDe,
} from "./api";
import { leerDirecto, leerMarcador, leerNba } from "./lectores";
import {
  Equipo,
  EntradaPartido,
  Metricas,
  PartidoHist,
  Proyeccion,
  basesPorLiga,
  proyectar,
} from "./modelo";

export type Cartelera = {
  deporte: DeporteId;
  nombreDeporte: string;
  metricas: Metricas;
  mostrarMarcador: boolean;
  nota?: string;
  fecha: string;
  generado: number;
  partidos: Proyeccion[];
  sinDatos: { local: string; visita: string; ts: number; liga: string }[];
  ligasCargadas: string[];
  ligasPendientes: string[];
  peticiones: number;
  avisos: string[];
};

/**
 * Día a mostrar y su etiqueta. Va aquí, en un módulo de servidor, porque leer el
 * reloj dentro del render de un componente no es puro y además desincroniza el
 * HTML del servidor con el del navegador.
 */
export async function diaAMostrar(fechaParam?: string): Promise<{ fecha: string; titulo: string }> {
  const ahora = Date.now();
  const valida = fechaParam && /^\d{4}-\d{2}-\d{2}$/.test(fechaParam);
  const fecha = valida ? (fechaParam as string) : fechaChile(ahora);
  return { fecha, titulo: nombreDia(aTs(`${fecha}T12:00`), ahora) };
}

/**
 * La cartelera de una fecha en hora de Chile. Los partidos de la NBA nocturnos
 * caen en el día UTC siguiente y su API no acepta timezone, así que ahí se
 * consultan dos fechas y se filtra localmente.
 */
async function carteleraDeFecha(
  d: Deporte,
  fecha: string,
  hoy: string,
  presupuesto: Presupuesto
): Promise<PartidoApi[]> {
  const fechas = d.usaTimezone ? [fecha] : [fecha, fechaChile(aTs(`${fecha}T12:00`) + DIA_MS)];
  const out: PartidoApi[] = [];
  for (const f of fechas) out.push(...(await partidosDeFecha(d, f, hoy, presupuesto)));
  return d.usaTimezone ? out : out.filter((p) => fechaChile(tsDe(p)) === fecha);
}

/**
 * Historial de todas las ligas seguidas a la vez, barriendo días hacia atrás.
 * Cada día pasado es una petición cacheada para siempre, así que solo el primer
 * llenado gasta cuota; después, un día nuevo por jornada.
 */
async function historialPorBarrido(
  d: Deporte,
  fecha: string,
  hoy: string,
  ligaIds: Set<number>,
  presupuesto: Presupuesto,
  avisos: string[]
): Promise<Map<number, { nombre: string; ligaId: number; hist: PartidoHist[] }>> {
  const jugados: PartidoApi[] = [];
  let diasCargados = 0;
  const mediodia = aTs(`${fecha}T12:00`);

  for (let i = 1; i <= d.diasHistorial; i++) {
    const dia = fechaChile(mediodia - i * DIA_MS);
    try {
      const lista = await partidosDeFecha(d, dia, hoy, presupuesto);
      jugados.push(
        ...lista.filter((p) => {
          const liga = ligaIdDe(d, p);
          return (liga === null || ligaIds.has(liga)) && terminado(d, p) && Number.isFinite(tsDe(p));
        })
      );
      diasCargados = i;
    } catch (err) {
      if (err instanceof SinCuota) {
        avisos.push(
          `Historial cargado hasta ${diasCargados} de ${d.diasHistorial} días atrás; ` +
            `toca Actualizar en un minuto para seguir completándolo.`
        );
        break;
      }
      throw err;
    }
  }

  // Estadísticas según lo que cobre cada API.
  let detalle: PartidoApi[] = jugados;
  const statsExtra = new Map<number, ReturnType<typeof leerDirecto>>();
  try {
    if (d.estrategiaStats === "lote") {
      detalle = await porLote(d, jugados.map(idDe).filter((x): x is number => x !== null), presupuesto);
    } else if (d.estrategiaStats === "porPartido") {
      const recientes = [...jugados].sort((a, b) => tsDe(b) - tsDe(a)).slice(0, d.ultimosPorLiga);
      for (const p of recientes) {
        const id = idDe(p);
        const eq = p.teams;
        if (id === null || !eq) continue;
        statsExtra.set(id, leerNba(await statsDePartido(d, id, presupuesto), eq.home.id, eq.away.id));
      }
      detalle = recientes;
    }
  } catch (err) {
    if (!(err instanceof SinCuota)) throw err;
    avisos.push("El presupuesto se acabó pidiendo estadísticas; toca Actualizar en un minuto para seguir.");
  }

  const porEquipo = new Map<number, { nombre: string; ligaId: number; hist: PartidoHist[] }>();
  for (const p of detalle) {
    const id = idDe(p);
    const local = p.teams?.home;
    const visita = p.teams?.away;
    const ts = tsDe(p);
    const ligaId = ligaIdDe(d, p) ?? d.ligas[0]?.id ?? 0;
    if (id === null || !local || !visita || !Number.isFinite(ts)) continue;

    const stats = leerDirecto(d, p) ?? statsExtra.get(id) ?? null;
    if (!stats) continue;

    const marcador = leerMarcador(d, p);
    const anotar = (eqId: number, nombre: string, enCasa: boolean, rival: string) => {
      const e = porEquipo.get(eqId) ?? { nombre, ligaId, hist: [] };
      const mio = enCasa ? stats.home : stats.away;
      const suyo = enCasa ? stats.away : stats.home;
      e.hist.push({
        fid: id,
        ts,
        casa: enCasa,
        rival,
        gf: enCasa ? marcador.home : marcador.away,
        gc: enCasa ? marcador.away : marcador.home,
        af: mio.a,
        ac: suyo.a,
        bf: mio.b,
        bc: suyo.b,
      });
      porEquipo.set(eqId, e);
    };
    anotar(local.id, local.name, true, visita.name);
    anotar(visita.id, visita.name, false, local.name);
  }
  return porEquipo;
}

export async function getCartelera(
  deporteId: string | undefined,
  fecha: string,
  opciones: { maxPeticiones?: number } = {}
): Promise<Cartelera> {
  const d = getDeporte(deporteId);
  const presupuesto = nuevoPresupuesto(opciones.maxPeticiones ?? 9);
  const avisos: string[] = [];
  const ligaIds = new Set(d.ligas.map((l) => l.id));
  const hoy = fechaChile(Date.now());

  const delDia = (await carteleraDeFecha(d, fecha, hoy, presupuesto)).filter((p) => {
    const id = ligaIdDe(d, p);
    return id === null || ligaIds.has(id);
  });

  const equipos = new Map<number, Equipo>();
  const cargadas: string[] = [];
  const pendientes: string[] = [];

  try {
    const hist = await historialPorBarrido(d, fecha, hoy, ligaIds, presupuesto, avisos);
    for (const [id, e] of hist) equipos.set(id, { id, nombre: e.nombre, ligaId: e.ligaId, hist: e.hist });
  } catch (err) {
    avisos.push((err as Error).message);
  }

  // Qué ligas de hoy quedaron con historial y cuáles no.
  const ligasHoy = new Set(delDia.map((p) => ligaIdDe(d, p) ?? d.ligas[0]?.id ?? 0));
  const conDatos = new Set([...equipos.values()].map((e) => e.ligaId));
  for (const ligaId of ligasHoy) {
    const meta = buscarLiga(d, ligaId);
    const nombre = meta ? `${meta.nombre} (${meta.pais})` : String(ligaId);
    (conDatos.has(ligaId) ? cargadas : pendientes).push(nombre);
  }

  const bases = basesPorLiga([...equipos.values()]);
  const partidos: Proyeccion[] = [];
  const sinDatos: Cartelera["sinDatos"] = [];

  for (const p of delDia) {
    const ts = tsDe(p);
    const local = p.teams ? equipos.get(p.teams.home.id) : undefined;
    const visita = p.teams ? equipos.get(p.teams.away.id) : undefined;
    const ligaId = ligaIdDe(d, p);
    const meta = ligaId !== null ? buscarLiga(d, ligaId) : undefined;
    const nombreLiga = meta?.nombre ?? ligaObj(p)?.name ?? d.nombre;
    const id = idDe(p);

    const entrada: EntradaPartido | null =
      local && visita && id !== null && Number.isFinite(ts)
        ? {
            fid: id,
            ts,
            liga: nombreLiga,
            pais: meta?.pais ?? ligaObj(p)?.country ?? "",
            ligaId: ligaId ?? 0,
            local,
            visita,
          }
        : null;

    const proy = entrada ? proyectar(entrada, bases, d.lineas) : null;
    if (proy) partidos.push(proy);
    else if (p.teams)
      sinDatos.push({
        local: p.teams.home.name,
        visita: p.teams.away.name,
        ts,
        liga: nombreLiga,
      });
  }

  partidos.sort((a, b) => a.ts - b.ts);
  sinDatos.sort((a, b) => a.ts - b.ts);

  // Los partidos ya empezados no se proyectan: el estado lo dice la propia API.
  const enJuego = delDia.filter((p) => !["NS", "TBD", "PST"].includes(estadoDe(p))).length;
  if (enJuego && !partidos.length && !avisos.length) {
    avisos.push("Todos los partidos del día ya empezaron o terminaron.");
  }

  return {
    deporte: d.id,
    nombreDeporte: d.nombre,
    metricas: d.metricas,
    mostrarMarcador: d.mostrarMarcador,
    nota: d.nota,
    fecha,
    generado: Date.now(),
    partidos,
    sinDatos,
    ligasCargadas: cargadas,
    ligasPendientes: pendientes,
    peticiones: presupuesto.usadas,
    avisos,
  };
}
