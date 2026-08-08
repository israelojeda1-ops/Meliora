import "server-only";
import { aTs, fechaChile, nombreDia } from "./fecha";
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
  partidosDelDia,
  porLote,
  statsDePartido,
  temporadaDe,
  temporadaDeLiga,
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

/** Historial de una liga completa, con el costo en peticiones que exige cada API. */
async function historialDeLiga(
  d: Deporte,
  ligaId: number,
  temporada: number | string,
  presupuesto: Presupuesto
): Promise<Map<number, { nombre: string; hist: PartidoHist[] }>> {
  // La temporada entera en una petición; los últimos jugados se filtran aquí.
  const lista = (await temporadaDeLiga(d, ligaId, temporada, presupuesto))
    .filter((p) => terminado(d, p) && Number.isFinite(tsDe(p)))
    .sort((a, b) => tsDe(b) - tsDe(a))
    .slice(0, d.ultimosPorLiga);

  // Fútbol: las estadísticas llegan pidiendo los partidos por id, de 20 en 20.
  const detalle: PartidoApi[] =
    d.estrategiaStats === "lote"
      ? await porLote(d, lista.map(idDe).filter((x): x is number => x !== null), presupuesto)
      : lista;

  const porEquipo = new Map<number, { nombre: string; hist: PartidoHist[] }>();

  for (const p of detalle) {
    const id = idDe(p);
    const local = p.teams?.home;
    const visita = p.teams?.away;
    const ts = tsDe(p);
    if (id === null || !local || !visita || !Number.isFinite(ts)) continue;

    // La NBA cobra una petición por partido, así que se pide aquí y no antes.
    let stats = leerDirecto(d, p);
    if (!stats && d.estrategiaStats === "porPartido") {
      try {
        stats = leerNba(await statsDePartido(d, id, presupuesto), local.id, visita.id);
      } catch (err) {
        if (err instanceof SinCuota) break; // se acabó el presupuesto: lo que haya alcanzado sirve
        throw err;
      }
    }
    if (!stats) continue;

    const marcador = leerMarcador(d, p);
    const anotar = (eqId: number, nombre: string, enCasa: boolean, rival: string) => {
      const e = porEquipo.get(eqId) ?? { nombre, hist: [] };
      const mio = enCasa ? stats!.home : stats!.away;
      const suyo = enCasa ? stats!.away : stats!.home;
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

  const delDia = (await partidosDelDia(d, fecha, presupuesto)).filter((p) => {
    const id = ligaIdDe(d, p);
    return id === null || ligaIds.has(id);
  });

  // Las ligas con partidos hoy, de la que más partidos tiene hacia abajo: si el
  // presupuesto se acaba, al menos se cargan las que más aportan. La temporada
  // vigente de cada liga se aprende de sus propios partidos del día.
  const cuenta = new Map<number, number>();
  const temporadas = new Map<number, number | string>();
  for (const p of delDia) {
    const id = ligaIdDe(d, p) ?? d.ligas[0]?.id ?? 0;
    cuenta.set(id, (cuenta.get(id) ?? 0) + 1);
    const t = temporadaDe(p);
    if (t !== null && !temporadas.has(id)) temporadas.set(id, t);
  }
  const ligas = [...cuenta.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);

  const equipos = new Map<number, Equipo>();
  const cargadas: string[] = [];
  const pendientes: string[] = [];

  for (const ligaId of ligas) {
    const meta = buscarLiga(d, ligaId);
    const nombre = meta ? `${meta.nombre} (${meta.pais})` : String(ligaId);
    const temporada = temporadas.get(ligaId);
    if (temporada === undefined) {
      pendientes.push(nombre);
      avisos.push(`${nombre}: los partidos del día no traen la temporada, no se puede pedir su historial.`);
      continue;
    }
    try {
      const hist = await historialDeLiga(d, ligaId, temporada, presupuesto);
      for (const [id, e] of hist) equipos.set(id, { id, nombre: e.nombre, ligaId, hist: e.hist });
      if (hist.size) cargadas.push(nombre);
      else {
        pendientes.push(nombre);
        avisos.push(`${nombre}: la API no devolvió estadísticas utilizables para sus últimos partidos.`);
      }
    } catch (err) {
      pendientes.push(nombre);
      if (err instanceof SinCuota) {
        avisos.push("Se acabó el presupuesto de peticiones de esta pasada; las ligas que faltan quedan para la próxima.");
        break;
      }
      avisos.push(`${nombre}: ${(err as Error).message}`);
    }
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
