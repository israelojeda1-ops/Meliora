import "server-only";
import { DIA_MS, aTs, fechaChile, nombreDia } from "./fecha";
import { Deporte, DeporteId, buscarLiga, getDeporte } from "./catalogo";
import {
  ApiError,
  PartidoApi,
  Presupuesto,
  SinCuota,
  equiposDe,
  estadoDe,
  idDe,
  ligaIdDe,
  ligaObj,
  nuevoPresupuesto,
  partidosDeFecha,
  porLote,
  statsDeFixture,
  statsDePartido,
  terminado,
  tsDe,
} from "./api";
import { PartidoGuardado, guardarDia, leerDia } from "./almacen";
import { normNombre } from "./nombres";
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
  presupuesto: Presupuesto
): Promise<PartidoApi[]> {
  const fechas = d.usaTimezone ? [fecha] : [fecha, fechaChile(aTs(`${fecha}T12:00`) + DIA_MS)];
  const out: PartidoApi[] = [];
  for (const f of fechas) out.push(...(await partidosDeFecha(d, f, presupuesto)));
  return d.usaTimezone ? out : out.filter((p) => fechaChile(tsDe(p)) === fecha);
}

/**
 * Cosecha un día ya jugado desde la API: sus partidos en las ligas seguidas,
 * con marcador y estadísticas. Devuelve null si la pasada quedó a medias por
 * cuota — en ese caso no se guarda nada y se reintenta en la siguiente.
 */
async function cosecharDia(
  d: Deporte,
  fechaDia: string,
  ligaIds: Set<number>,
  presupuesto: Presupuesto,
  avisos: string[]
): Promise<PartidoGuardado[] | null> {
  let lista: PartidoApi[];
  try {
    lista = await carteleraDeFecha(d, fechaDia, presupuesto);
  } catch (err) {
    if (err instanceof SinCuota) {
      avisos.push("La cosecha de ayer quedó a medias por cuota; toca Actualizar en un minuto.");
      return null;
    }
    throw err;
  }

  const seguidos = lista.filter((p) => {
    const liga = ligaIdDe(d, p);
    return liga === null || ligaIds.has(liga);
  });

  // Un partido nocturno puede seguir en juego pasada la medianoche. Si algo del
  // día aún puede terminar, no se guarda nada: el día se cosecha entero más
  // tarde (los que nunca van a terminar —suspendidos, postergados— no bloquean).
  const pendientes = seguidos.filter(
    (p) => !terminado(d, p) && Number.isFinite(tsDe(p)) && tsDe(p) > Date.now() - 8 * 3_600_000
  );
  if (pendientes.length) {
    avisos.push("Ayer aún tiene partidos por terminar; la cosecha se hará más tarde sola.");
    return null;
  }

  const jugados = seguidos.filter(
    (p) => terminado(d, p) && Number.isFinite(tsDe(p)) && idDe(p) !== null && equiposDe(p) !== null
  );

  // Estadísticas, según lo que cobre (y permita) cada API.
  const statsPorId = new Map<number, ReturnType<typeof leerDirecto>>();
  try {
    if (d.estrategiaStats === "lote") {
      const ids = jugados.map(idDe).filter((x): x is number => x !== null);
      try {
        for (const p of await porLote(d, ids, presupuesto)) {
          const id = idDe(p);
          if (id !== null) statsPorId.set(id, leerDirecto(d, p));
        }
      } catch (err) {
        // Si el plan tampoco permite el lote por ids, partido por partido.
        if (!(err instanceof ApiError)) throw err;
        for (const p of jugados) {
          const id = idDe(p);
          if (id === null) continue;
          const filas = await statsDeFixture(d, id, presupuesto);
          statsPorId.set(id, leerDirecto(d, { ...p, statistics: filas }));
        }
      }
    } else if (d.estrategiaStats === "porPartido") {
      const recientes = [...jugados].sort((a, b) => tsDe(b) - tsDe(a)).slice(0, d.ultimosPorLiga);
      for (const p of recientes) {
        const id = idDe(p);
        const eq = equiposDe(p);
        if (id === null || !eq) continue;
        statsPorId.set(id, leerNba(await statsDePartido(d, id, presupuesto), eq.home.id, eq.away.id));
      }
    }
  } catch (err) {
    if (err instanceof SinCuota) {
      avisos.push("La cosecha de ayer quedó a medias por cuota; toca Actualizar en un minuto.");
      return null;
    }
    throw err;
  }

  return jugados.map((p) => {
    const id = idDe(p)!;
    const eq = equiposDe(p)!;
    const marcador = leerMarcador(d, p);
    const stats = leerDirecto(d, p) ?? statsPorId.get(id) ?? null;
    return {
      fid: id,
      ts: tsDe(p),
      ligaId: ligaIdDe(d, p) ?? d.ligas[0]?.id ?? 0,
      local: { id: eq.home.id, nombre: eq.home.name },
      visita: { id: eq.away.id, nombre: eq.away.name },
      gl: marcador.home,
      gv: marcador.away,
      stats: stats ? { l: stats.home, v: stats.away } : null,
    };
  });
}

/**
 * Historial desde el almacén. El plan gratuito de la API solo sirve ayer, hoy y
 * mañana — no hay forma de pedirle el pasado —, así que el portal guarda cada
 * ayer en el almacén y el historial crece un día por jornada. Leer el almacén
 * no gasta cuota de la API.
 */
async function historialDeAlmacen(
  d: Deporte,
  fecha: string,
  hoy: string,
  ligaIds: Set<number>,
  presupuesto: Presupuesto,
  avisos: string[]
): Promise<Map<string, { nombre: string; ligaId: number; hist: PartidoHist[] }>> {
  const mediodia = aTs(`${fecha}T12:00`);
  const dias = Array.from({ length: d.diasHistorial }, (_, i) => fechaChile(mediodia - (i + 1) * DIA_MS));

  const leidos = await Promise.all(
    dias.map(async (dia, i) => {
      try {
        return await leerDia(d, dia, i < 2);
      } catch (err) {
        avisos.push((err as Error).message);
        return null;
      }
    })
  );

  // El ayer que aún no está guardado se cosecha ahora y queda guardado.
  const ayer = fechaChile(aTs(`${hoy}T12:00`) - DIA_MS);
  const iAyer = dias.indexOf(ayer);
  if (iAyer >= 0 && leidos[iAyer] === null) {
    try {
      const cosecha = await cosecharDia(d, ayer, ligaIds, presupuesto, avisos);
      if (cosecha !== null) {
        leidos[iAyer] = cosecha;
        try {
          await guardarDia(d, ayer, cosecha);
        } catch (err) {
          avisos.push((err as Error).message);
        }
      }
    } catch (err) {
      avisos.push(`Cosecha de ayer: ${(err as Error).message}`);
    }
  }

  const diasConDatos = leidos.filter((x) => x !== null).length;
  if (diasConDatos < Math.min(3, d.diasHistorial)) {
    avisos.push(
      `El historial se construye día a día (el plan gratuito de la API no entrega el pasado): ` +
        `va ${diasConDatos} de ${d.diasHistorial} días guardados.`
    );
  }

  // La llave es el nombre normalizado: el historial puede venir de fuentes con
  // ids distintos para el mismo equipo (API-Sports y ESPN).
  const porEquipo = new Map<string, { nombre: string; ligaId: number; hist: PartidoHist[] }>();
  for (const dia of leidos) {
    for (const g of dia ?? []) {
      if (!g.stats) continue;
      const anotar = (eq: { id: number; nombre: string }, enCasa: boolean, rival: string) => {
        const clave = normNombre(eq.nombre);
        const e = porEquipo.get(clave) ?? { nombre: eq.nombre, ligaId: g.ligaId, hist: [] };
        const mio = enCasa ? g.stats!.l : g.stats!.v;
        const suyo = enCasa ? g.stats!.v : g.stats!.l;
        e.hist.push({
          fid: g.fid,
          ts: g.ts,
          casa: enCasa,
          rival,
          gf: enCasa ? g.gl : g.gv,
          gc: enCasa ? g.gv : g.gl,
          af: mio.a,
          ac: suyo.a,
          bf: mio.b,
          bc: suyo.b,
        });
        porEquipo.set(clave, e);
      };
      anotar(g.local, true, g.visita.nombre);
      anotar(g.visita, false, g.local.nombre);
    }
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

  const delDia = (await carteleraDeFecha(d, fecha, presupuesto)).filter((p) => {
    const id = ligaIdDe(d, p);
    return id === null || ligaIds.has(id);
  });

  const equipos = new Map<string, Equipo>();
  const cargadas: string[] = [];
  const pendientes: string[] = [];

  try {
    const hist = await historialDeAlmacen(d, fecha, hoy, ligaIds, presupuesto, avisos);
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
    const eq = equiposDe(p);
    const local = eq ? equipos.get(normNombre(eq.home.name)) : undefined;
    const visita = eq ? equipos.get(normNombre(eq.away.name)) : undefined;
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
    else if (eq)
      sinDatos.push({
        local: eq.home.name,
        visita: eq.away.name,
        // Sin fecha válida no hay hora que mostrar; el mediodía ordena razonable.
        ts: Number.isFinite(ts) ? ts : aTs(`${fecha}T12:00`),
        liga: nombreLiga,
      });
  }

  partidos.sort((a, b) => a.ts - b.ts);
  sinDatos.sort((a, b) => a.ts - b.ts);

  // Los partidos ya empezados no se proyectan: el estado lo dice la propia API.
  const enJuego = delDia.filter((p) => !d.noIniciados.includes(estadoDe(p))).length;
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
