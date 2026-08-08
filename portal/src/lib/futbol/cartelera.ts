import "server-only";
import { LIGA_IDS, buscarLiga } from "./ligas";
import { aTs, fechaChile, nombreDia } from "./fecha";
import {
  FixtureApi,
  Presupuesto,
  SinCuota,
  fixturesDelDia,
  nuevoPresupuesto,
  statsDeFixtures,
  ultimosDeLiga,
} from "./apiFootball";
import {
  Equipo,
  EntradaPartido,
  LINEAS_POR_DEFECTO,
  Lineas,
  PartidoHist,
  Proyeccion,
  basesPorLiga,
  proyectar,
} from "./modelo";

export type Cartelera = {
  fecha: string;
  generado: number;
  partidos: Proyeccion[];
  sinDatos: { local: string; visita: string; ts: number; liga: string }[];
  ligasCargadas: string[];
  ligasPendientes: string[];
  peticiones: number;
  avisos: string[];
};

/** Cuántos partidos recientes pedimos por liga: 60 ≈ 3 fechas ≈ 6 por equipo. */
const ULTIMOS_POR_LIGA = 60;

/**
 * Día a mostrar y su etiqueta. Va aquí, en un módulo de servidor, porque leer el
 * reloj dentro del render de un componente no es puro y además desincroniza el
 * HTML del servidor con el del navegador.
 */
export async function diaAMostrar(fechaParam?: string): Promise<{ fecha: string; titulo: string; ahora: number }> {
  const ahora = Date.now();
  const valida = fechaParam && /^\d{4}-\d{2}-\d{2}$/.test(fechaParam);
  const fecha = valida ? (fechaParam as string) : fechaChile(ahora);
  return { fecha, titulo: nombreDia(aTs(`${fecha}T12:00`), ahora), ahora };
}

const numero = (v: number | string | null | undefined): number | null => {
  if (v === null || v === undefined) return null;
  const n = Number(String(v).replace("%", ""));
  return Number.isFinite(n) ? n : null;
};

function leerStats(bloque: FixtureApi["statistics"] extends (infer B)[] | undefined ? B : never) {
  const buscar = (tipo: string) => {
    const s = bloque.statistics.find((x) => x.type.toLowerCase() === tipo.toLowerCase());
    return s ? numero(s.value) : null;
  };
  return { tiros: buscar("Total Shots"), corners: buscar("Corner Kicks") };
}

/**
 * Historial de una liga completa: una petición para la lista y una cada 20
 * partidos para las estadísticas. Devuelve el historial por equipo.
 */
async function historialDeLiga(
  ligaId: number,
  presupuesto: Presupuesto
): Promise<Map<number, { nombre: string; hist: PartidoHist[] }>> {
  const lista = await ultimosDeLiga(ligaId, ULTIMOS_POR_LIGA, presupuesto);
  const conStats = await statsDeFixtures(
    lista.map((f) => f.fixture.id),
    presupuesto
  );

  const porEquipo = new Map<number, { nombre: string; hist: PartidoHist[] }>();
  for (const fx of conStats) {
    const bloques = fx.statistics ?? [];
    const casa = bloques.find((b) => b.team.id === fx.teams.home.id);
    const fuera = bloques.find((b) => b.team.id === fx.teams.away.id);
    if (!casa || !fuera) continue; // partido sin estadísticas publicadas

    const sCasa = leerStats(casa);
    const sFuera = leerStats(fuera);
    if (sCasa.tiros === null || sCasa.corners === null || sFuera.tiros === null || sFuera.corners === null) continue;

    const ts = new Date(fx.fixture.date).getTime();
    const anotar = (id: number, nombre: string, enCasa: boolean, rival: string) => {
      const e = porEquipo.get(id) ?? { nombre, hist: [] };
      const mio = enCasa ? sCasa : sFuera;
      const suyo = enCasa ? sFuera : sCasa;
      const golLocal = fx.goals?.home ?? 0;
      const golVisita = fx.goals?.away ?? 0;
      e.hist.push({
        fid: fx.fixture.id,
        ts,
        casa: enCasa,
        rival,
        gf: enCasa ? golLocal : golVisita,
        gc: enCasa ? golVisita : golLocal,
        tf: mio.tiros as number,
        cf: mio.corners as number,
        tc: suyo.tiros as number,
        cc: suyo.corners as number,
      });
      porEquipo.set(id, e);
    };
    anotar(fx.teams.home.id, fx.teams.home.name, true, fx.teams.away.name);
    anotar(fx.teams.away.id, fx.teams.away.name, false, fx.teams.home.name);
  }
  return porEquipo;
}

export async function getCartelera(
  fecha: string,
  opciones: { maxPeticiones?: number; lineas?: Lineas } = {}
): Promise<Cartelera> {
  const { maxPeticiones = 9, lineas = LINEAS_POR_DEFECTO } = opciones;
  const presupuesto = nuevoPresupuesto(maxPeticiones);
  const avisos: string[] = [];

  const delDia = (await fixturesDelDia(fecha, presupuesto)).filter((f) => LIGA_IDS.has(f.league.id));

  // Las ligas con partidos hoy, de la que más partidos tiene hacia abajo: si el
  // presupuesto se acaba, al menos se cargan las que más aportan.
  const cuenta = new Map<number, number>();
  for (const f of delDia) cuenta.set(f.league.id, (cuenta.get(f.league.id) ?? 0) + 1);
  const ligas = [...cuenta.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);

  const equipos = new Map<number, Equipo>();
  const cargadas: string[] = [];
  const pendientes: string[] = [];

  for (const ligaId of ligas) {
    const meta = buscarLiga(ligaId);
    const nombre = meta ? `${meta.nombre} (${meta.pais})` : String(ligaId);
    try {
      const hist = await historialDeLiga(ligaId, presupuesto);
      for (const [id, e] of hist) equipos.set(id, { id, nombre: e.nombre, ligaId, hist: e.hist });
      cargadas.push(nombre);
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

  for (const f of delDia) {
    const meta = buscarLiga(f.league.id);
    const local = equipos.get(f.teams.home.id);
    const visita = equipos.get(f.teams.away.id);
    const ts = new Date(f.fixture.date).getTime();
    const entrada: EntradaPartido | null =
      local && visita
        ? {
            fid: f.fixture.id,
            ts,
            liga: meta?.nombre ?? f.league.name,
            pais: meta?.pais ?? f.league.country,
            ligaId: f.league.id,
            local,
            visita,
          }
        : null;
    const proy = entrada ? proyectar(entrada, bases, lineas) : null;
    if (proy) partidos.push(proy);
    else
      sinDatos.push({
        local: f.teams.home.name,
        visita: f.teams.away.name,
        ts,
        liga: meta?.nombre ?? f.league.name,
      });
  }

  partidos.sort((a, b) => a.ts - b.ts);
  sinDatos.sort((a, b) => a.ts - b.ts);

  return {
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
