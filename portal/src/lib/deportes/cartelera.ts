import "server-only";
import { DIA_MS, aTs, fechaChile, nombreDia } from "./fecha";
import { Deporte, DeporteId, buscarLiga, getDeporte, ligasActivas } from "./catalogo";
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
import { PartidoGuardado, guardarDia, leerEquipo, leerDia, parGuardado } from "./almacen";
import { ResultadoEspn, carteleraEspn, resultadosEspn } from "./espn";
import { buscarPorNombre, normNombre } from "./nombres";
import { leerDirecto, leerMarcador, leerNba } from "./lectores";
import {
  Equipo,
  EntradaPartido,
  Metrica,
  PartidoHist,
  Proyeccion,
  basesPorLiga,
  proyectar,
} from "./modelo";

export type Cartelera = {
  deporte: DeporteId;
  nombreDeporte: string;
  metricas: Metrica[];
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
 * Días que ofrece el selector, en hora de Chile: varios pasados, hoy y mañana.
 * ESPN no limita la fecha (a diferencia del viejo API-Football, que solo servía
 * de ayer a mañana), así que se pueden revisar jornadas anteriores.
 */
export function diasSelector(): { fecha: string; etiqueta: string }[] {
  const ahora = Date.now();
  const mediodiaHoy = aTs(`${fechaChile(ahora)}T12:00`);
  return [-4, -3, -2, -1, 0, 1].map((delta) => {
    const t = mediodiaHoy + delta * DIA_MS;
    return { fecha: fechaChile(t), etiqueta: nombreDia(t, ahora) };
  });
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
  // Fútbol: la lista del día sale de ESPN (gratis, sin límite de fecha). Antes
  // era API-Football, pero su plan gratuito quedó suspendido.
  if (d.id === "futbol") return carteleraEspn(d, fecha);

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
      stats: stats ? { l: [stats.home.a, stats.home.b], v: [stats.away.a, stats.away.b] } : null,
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
  clavesEquipo: string[],
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

  // El ayer que aún no está guardado se cosecha ahora y queda guardado. En
  // fútbol no aplica: su cosecha usaba API-Football (suspendida) y el historial
  // se mantiene con los archivos por equipo de ESPN (botón «Poblar»).
  const ayer = fechaChile(aTs(`${hoy}T12:00`) - DIA_MS);
  const iAyer = dias.indexOf(ayer);
  if (d.id !== "futbol" && iAyer >= 0 && leidos[iAyer] === null) {
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
  if (d.id !== "futbol" && diasConDatos < Math.min(3, d.diasHistorial)) {
    avisos.push(
      `El historial se construye día a día (el plan gratuito de la API no entrega el pasado): ` +
        `va ${diasConDatos} de ${d.diasHistorial} días guardados.`
    );
  }

  // Historial profundo por equipo (temporada actual + anterior), para los
  // clubes que juegan hoy. Se lee en paralelo y no gasta cuota de la API.
  const porEquipoFiles = await Promise.all(
    clavesEquipo.map(async (clave) => {
      try {
        return await leerEquipo(d, clave);
      } catch (err) {
        avisos.push((err as Error).message);
        return null;
      }
    })
  );

  // Se juntan los partidos de los archivos por día y por equipo, deduplicados
  // por `fid` (un mismo partido puede estar en ambos lugares); gana la copia con
  // estadísticas.
  const porFid = new Map<number, PartidoGuardado>();
  for (const lista of [...leidos, ...porEquipoFiles]) {
    for (const g of lista ?? []) {
      const previo = porFid.get(g.fid);
      if (!previo || (!previo.stats && g.stats)) porFid.set(g.fid, g);
    }
  }

  // La llave es el nombre normalizado: el historial puede venir de fuentes con
  // ids distintos para el mismo equipo (API-Sports y ESPN).
  const porEquipo = new Map<string, { nombre: string; ligaId: number; hist: PartidoHist[] }>();
  {
    for (const g of porFid.values()) {
      if (!g.stats) continue;
      const anotar = (eq: { id: number; nombre: string }, enCasa: boolean, rival: string) => {
        const clave = normNombre(eq.nombre);
        const e = porEquipo.get(clave) ?? { nombre: eq.nombre, ligaId: g.ligaId, hist: [] };
        // stats por métrica, tolerando el formato viejo {a,b}.
        const mio = parGuardado(enCasa ? g.stats!.l : g.stats!.v);
        const suyo = parGuardado(enCasa ? g.stats!.v : g.stats!.l);
        e.hist.push({
          fid: g.fid,
          ts: g.ts,
          casa: enCasa,
          rival,
          gf: enCasa ? g.gl : g.gv,
          gc: enCasa ? g.gv : g.gl,
          mf: mio,
          mc: suyo,
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
  // Solo las ligas activas aparecen en la cartelera y se cosechan. El historial
  // se arma con todo lo guardado (historialDeAlmacen no filtra por liga), así un
  // equipo que también juega otra competencia conserva sus partidos.
  const ligaIds = new Set(ligasActivas(d).map((l) => l.id));
  const hoy = fechaChile(Date.now());

  const delDia = (await carteleraDeFecha(d, fecha, presupuesto)).filter((p) => {
    const id = ligaIdDe(d, p);
    return id === null || ligaIds.has(id);
  });

  // Claves de los equipos que juegan hoy, para leer su historial profundo por
  // equipo (mismo slug que usa el poblado por equipo: normalizado con guiones).
  const clavesEquipo = [
    ...new Set(
      delDia.flatMap((p) => {
        const eq = equiposDe(p);
        return eq ? [normNombre(eq.home.name), normNombre(eq.away.name)] : [];
      })
    ),
  ].map((n) => n.replace(/ /g, "-"));

  const equipos = new Map<string, Equipo>();
  const cargadas: string[] = [];
  const pendientes: string[] = [];

  try {
    const hist = await historialDeAlmacen(d, fecha, hoy, ligaIds, clavesEquipo, presupuesto, avisos);
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

  // Resultados reales de los partidos ya terminados del día, desde ESPN (gratis;
  // el plan gratuito de API-Football no da estadísticas). Se cruzan con la
  // cartelera por el par de equipos normalizado.
  let resultados = new Map<string, ResultadoEspn>();
  if (d.id === "futbol") {
    try {
      resultados = await resultadosEspn(fecha);
    } catch (err) {
      avisos.push((err as Error).message);
    }
  }
  const claveDelPar = (h: string, a: string) => [normNombre(h), normNombre(a)].sort().join("|");

  const bases = basesPorLiga([...equipos.values()], d.metricas.length);
  const partidos: Proyeccion[] = [];
  const sinDatos: Cartelera["sinDatos"] = [];

  for (const p of delDia) {
    const ts = tsDe(p);
    const eq = equiposDe(p);
    const local = eq ? buscarPorNombre(equipos, eq.home.name) : undefined;
    const visita = eq ? buscarPorNombre(equipos, eq.away.name) : undefined;
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
    if (proy) {
      const rEspn = eq ? resultados.get(claveDelPar(eq.home.name, eq.away.name)) : undefined;
      if (rEspn && eq) {
        // orienta el marcador al local de la cartelera
        const local = rEspn.homeNorm === normNombre(eq.home.name);
        proy.resultado = {
          v: rEspn.v,
          gl: local ? rEspn.gl : rEspn.gv,
          gv: local ? rEspn.gv : rEspn.gl,
        };
      } else proy.resultado = null;
      partidos.push(proy);
    } else if (eq)
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

export type Oportunidad = {
  fecha: string;
  etiqueta: string;
  partido: Proyeccion;
  fuerza: number; // 0..1, qué tanto se destaca
};

/**
 * Buscador de oportunidades: recorre los próximos días, se queda con los
 * partidos aún por jugarse y los ordena por cuánto se destacan — la mayor
 * probabilidad de una métrica contra su línea, con un empujón si es DOBLE.
 * Devuelve solo los que superan un piso, para que la lista sean oportunidades
 * reales y no relleno.
 */
export async function getOportunidades(
  deporteId: string | undefined,
  opciones: { dias?: number; piso?: number; tope?: number } = {}
): Promise<Oportunidad[]> {
  const ahora = Date.now();
  const dias = opciones.dias ?? 3;
  const piso = opciones.piso ?? 0.6;
  const tope = opciones.tope ?? 8;
  const mediodiaHoy = aTs(`${fechaChile(ahora)}T12:00`);

  const out: Oportunidad[] = [];
  for (let i = 0; i < dias; i++) {
    const t = mediodiaHoy + i * DIA_MS;
    const fecha = fechaChile(t);
    let cartel: Cartelera;
    try {
      cartel = await getCartelera(deporteId, fecha, { maxPeticiones: 30 });
    } catch {
      continue;
    }
    for (const p of cartel.partidos) {
      // solo partidos que aún no empezaron: se puede apostar
      if (p.resultado || p.ts <= ahora) continue;
      const probs = p.p.filter((_, i) => p.disp[i]);
      if (!probs.length) continue;
      const doble = probs.filter((x) => x >= 0.6).length >= 2;
      const fuerza = Math.min(1, Math.max(...probs) + (doble ? 0.08 : 0));
      if (fuerza < piso) continue;
      out.push({ fecha, etiqueta: nombreDia(t, ahora), partido: p, fuerza });
    }
  }
  return out.sort((a, b) => b.fuerza - a.fuerza).slice(0, tope);
}
