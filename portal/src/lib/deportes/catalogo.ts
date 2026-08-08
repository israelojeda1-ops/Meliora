import type { Lineas } from "./modelo";

// Las tres APIs de API-Sports comparten la forma de la respuesta ({response,
// errors}) y la cabecera x-apisports-key, pero cambian el host, el nombre del
// endpoint de partidos y, sobre todo, de dónde se leen las estadísticas.
// Cada deporte declara aquí sus diferencias.

export type DeporteId = "futbol" | "nba" | "beisbol";

/**
 * `espn` es el código de esa liga en la API pública de ESPN, si existe.
 * `activa: false` la deja fuera de la cartelera del día y de la cosecha, pero su
 * historial ya guardado sigue alimentando las proyecciones (los equipos que
 * juegan varias competencias cruzan por nombre igual).
 */
export type Liga = { id: number; nombre: string; pais: string; espn?: string; activa?: boolean };

/** Los dos números por equipo que la página proyecta y muestra. */
export type Metricas = { a: { nombre: string; corto: string }; b: { nombre: string; corto: string } };

export type Deporte = {
  id: DeporteId;
  nombre: string;
  host: string;
  /** Endpoint de partidos: "fixtures" en fútbol, "games" en NBA y béisbol. */
  recurso: string;
  metricas: Metricas;
  lineas: Lineas;
  ligas: Liga[];
  /** Estados que cuentan como partido terminado. */
  terminados: string[];
  /** Estados de un partido que aún no empieza. */
  noIniciados: string[];
  /**
   * Cómo se consiguen las estadísticas de los partidos ya jugados:
   * - "lote": vienen incluidas al pedir varios partidos por id (fútbol).
   * - "porPartido": hay que pedir un endpoint aparte por cada partido (NBA).
   * - "enLista": ya vienen en la propia lista de partidos (béisbol).
   */
  estrategiaStats: "lote" | "porPartido" | "enLista";
  /**
   * Días hacia atrás que se barren para armar el historial. El plan gratuito
   * no da acceso ni a `last` ni a las temporadas en curso; lo único que sirve
   * datos actuales son las consultas por fecha, así que el historial son N
   * días pasados, cada uno cacheado para siempre (un día jugado no cambia).
   */
  diasHistorial: number;
  /** Tope de partidos a los que pedirles estadísticas (solo "porPartido"). */
  ultimosPorLiga: number;
  /** La API de la NBA no acepta el parámetro timezone; el resto sí. */
  usaTimezone: boolean;
  /**
   * Si el marcador aporta algo además de las métricas. En fútbol sí (los goles
   * no son remates ni córners); en NBA y béisbol la métrica A *es* el marcador,
   * así que mostrarlo dos veces solo estorba.
   */
  mostrarMarcador: boolean;
  /** Advertencia a mostrar en la página, si el modelo calza peor con el deporte. */
  nota?: string;
  /** Si el deporte se muestra en la página. Los apagados conservan su código. */
  enPortada: boolean;
};

export const DEPORTES: Record<DeporteId, Deporte> = {
  futbol: {
    id: "futbol",
    nombre: "Fútbol",
    host: "https://v3.football.api-sports.io",
    recurso: "fixtures",
    metricas: { a: { nombre: "remates", corto: "rem" }, b: { nombre: "córners", corto: "cor" } },
    lineas: { total: { a: 24.5, b: 9.5 }, equipo: { a: 16.5, b: 5.5 } },
    terminados: ["FT", "AET", "PEN"],
    noIniciados: ["NS", "TBD", "PST"],
    estrategiaStats: "lote",
    // ~5 semanas: en ligas de un partido por semana, unos 5 por equipo. Leer
    // el almacén no gasta cuota, así que mirar lejos solo cuesta unos GET.
    diasHistorial: 35,
    ultimosPorLiga: 60,
    usaTimezone: true,
    mostrarMarcador: true,
    enPortada: true,
    // Activas hoy: Leagues Cup y MLS. El resto queda en el catálogo (su
    // historial guardado sigue sirviendo a los equipos que se cruzan), pero no
    // aparece en la cartelera del día. Reactivar una es poner activa: true.
    ligas: [
      { id: 772, nombre: "Leagues Cup", pais: "Norteamérica", espn: "concacaf.leagues.cup", activa: true },
      { id: 253, nombre: "Major League Soccer", pais: "Estados Unidos", espn: "usa.1", activa: true },
      { id: 262, nombre: "Liga MX", pais: "México", espn: "mex.1" },
      { id: 265, nombre: "Primera División", pais: "Chile", espn: "chi.1" },
      { id: 39, nombre: "Premier League", pais: "Inglaterra", espn: "eng.1" },
      { id: 140, nombre: "LaLiga", pais: "España", espn: "esp.1" },
      { id: 135, nombre: "Serie A", pais: "Italia", espn: "ita.1" },
      { id: 78, nombre: "Bundesliga", pais: "Alemania", espn: "ger.1" },
      { id: 61, nombre: "Ligue 1", pais: "Francia", espn: "fra.1" },
      { id: 13, nombre: "Copa Libertadores", pais: "Sudamérica", espn: "conmebol.libertadores" },
      { id: 11, nombre: "Copa Sudamericana", pais: "Sudamérica", espn: "conmebol.sudamericana" },
      { id: 2, nombre: "Champions League", pais: "Europa", espn: "uefa.champions" },
    ],
  },

  nba: {
    id: "nba",
    nombre: "NBA",
    host: "https://v2.nba.api-sports.io",
    recurso: "games",
    metricas: { a: { nombre: "puntos", corto: "pts" }, b: { nombre: "triples", corto: "3pt" } },
    // Líneas de referencia: total del partido y por equipo.
    lineas: { total: { a: 224.5, b: 25.5 }, equipo: { a: 112.5, b: 12.5 } },
    // En la API de la NBA el estado corto es un número: 1 programado, 2 en
    // juego, 3 terminado.
    terminados: ["3"],
    noIniciados: ["1"],
    estrategiaStats: "porPartido",
    diasHistorial: 10,
    mostrarMarcador: false,
    usaTimezone: false,
    enPortada: false,
    // Una petición por partido: con más se gastaría demasiado, así que la
    // muestra es más corta que en fútbol.
    ultimosPorLiga: 14,
    ligas: [{ id: 12, nombre: "NBA", pais: "Estados Unidos" }],
    nota:
      "En básquetbol el modelo de Poisson ajusta peor que en fútbol: los puntos tienen más " +
      "dispersión que un conteo de Poisson puro, así que las probabilidades extremas quedan " +
      "algo optimistas. Sirve para comparar partidos entre sí, no como probabilidad fina.",
  },

  beisbol: {
    id: "beisbol",
    nombre: "Béisbol",
    host: "https://v1.baseball.api-sports.io",
    recurso: "games",
    metricas: { a: { nombre: "carreras", corto: "car" }, b: { nombre: "hits", corto: "hits" } },
    lineas: { total: { a: 8.5, b: 16.5 }, equipo: { a: 4.5, b: 8.5 } },
    terminados: ["FT", "AOT"],
    noIniciados: ["NS", "TBD", "PST"],
    estrategiaStats: "enLista",
    diasHistorial: 8,
    ultimosPorLiga: 60,
    usaTimezone: true,
    mostrarMarcador: false,
    enPortada: false,
    ligas: [
      { id: 1, nombre: "MLB", pais: "Estados Unidos" },
      { id: 2, nombre: "NPB", pais: "Japón" },
    ],
  },
};

export const LISTA_DEPORTES = Object.values(DEPORTES);
export const DEPORTES_EN_PORTADA = LISTA_DEPORTES.filter((d) => d.enPortada);

export const esDeporteId = (v: unknown): v is DeporteId =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(DEPORTES, v);

export const getDeporte = (id: string | undefined): Deporte =>
  esDeporteId(id) ? DEPORTES[id] : DEPORTES.futbol;

export const buscarLiga = (d: Deporte, id: number): Liga | undefined => d.ligas.find((l) => l.id === id);

/** Ligas que se muestran hoy en la cartelera y se cosechan. */
export const ligasActivas = (d: Deporte): Liga[] => d.ligas.filter((l) => l.activa);
