// Ligas que seguimos. El plan gratuito de API-Football da 100 peticiones al día
// y 10 por minuto, así que la lista es deliberadamente corta: cada liga cuesta
// ~4 peticiones cada vez que se refresca su historial.
export type Liga = { id: number; nombre: string; pais: string };

export const LIGAS: Liga[] = [
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
];

export const LIGA_IDS = new Set(LIGAS.map((l) => l.id));
export const buscarLiga = (id: number): Liga | undefined => LIGAS.find((l) => l.id === id);
