import type { Lineas } from "./modelo";

// Las tres APIs de API-Sports comparten la forma de la respuesta ({response,
// errors}) y la cabecera x-apisports-key, pero cambian el host, el nombre del
// endpoint de partidos y, sobre todo, de dónde se leen las estadísticas.
// Cada deporte declara aquí sus diferencias.

export type DeporteId = "futbol" | "nba" | "beisbol";

export type Liga = { id: number; nombre: string; pais: string };

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
  /**
   * Cómo se consiguen las estadísticas de los partidos ya jugados:
   * - "lote": vienen incluidas al pedir varios partidos por id (fútbol).
   * - "porPartido": hay que pedir un endpoint aparte por cada partido (NBA).
   * - "enLista": ya vienen en la propia lista de partidos (béisbol).
   */
  estrategiaStats: "lote" | "porPartido" | "enLista";
  /** Cuántos partidos recientes pedir por liga. */
  ultimosPorLiga: number;
  /**
   * Si el marcador aporta algo además de las métricas. En fútbol sí (los goles
   * no son remates ni córners); en NBA y béisbol la métrica A *es* el marcador,
   * así que mostrarlo dos veces solo estorba.
   */
  mostrarMarcador: boolean;
  /** Advertencia a mostrar en la página, si el modelo calza peor con el deporte. */
  nota?: string;
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
    estrategiaStats: "lote",
    ultimosPorLiga: 60,
    mostrarMarcador: true,
    ligas: [
      { id: 265, nombre: "Primera División", pais: "Chile" },
      { id: 39, nombre: "Premier League", pais: "Inglaterra" },
      { id: 140, nombre: "LaLiga", pais: "España" },
      { id: 135, nombre: "Serie A", pais: "Italia" },
      { id: 78, nombre: "Bundesliga", pais: "Alemania" },
      { id: 61, nombre: "Ligue 1", pais: "Francia" },
      { id: 253, nombre: "Major League Soccer", pais: "Estados Unidos" },
      { id: 262, nombre: "Liga MX", pais: "México" },
      { id: 13, nombre: "Copa Libertadores", pais: "Sudamérica" },
      { id: 11, nombre: "Copa Sudamericana", pais: "Sudamérica" },
      { id: 2, nombre: "Champions League", pais: "Europa" },
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
    terminados: ["FT", "AOT"],
    estrategiaStats: "porPartido",
    mostrarMarcador: false,
    // Una petición por partido: con 30 se gastaría demasiado, así que la muestra
    // es más corta que en fútbol.
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
    estrategiaStats: "enLista",
    ultimosPorLiga: 60,
    mostrarMarcador: false,
    ligas: [
      { id: 1, nombre: "MLB", pais: "Estados Unidos" },
      { id: 2, nombre: "NPB", pais: "Japón" },
    ],
  },
};

export const LISTA_DEPORTES = Object.values(DEPORTES);

export const esDeporteId = (v: unknown): v is DeporteId =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(DEPORTES, v);

export const getDeporte = (id: string | undefined): Deporte =>
  esDeporteId(id) ? DEPORTES[id] : DEPORTES.futbol;

export const buscarLiga = (d: Deporte, id: number): Liga | undefined => d.ligas.find((l) => l.id === id);
