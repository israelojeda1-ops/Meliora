// El historial puede venir de fuentes distintas (API-Sports, ESPN) que usan ids
// distintos para el mismo equipo, así que el cruce es por nombre normalizado:
// minúsculas, sin tildes, sin puntuación y sin los sufijos de club que cada
// fuente pone o quita a su gusto ("Vancouver Whitecaps" vs "... FC").

const SUFIJOS = new Set(["fc", "cf", "sc", "afc", "ac", "cd", "club"]);

export function normNombre(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter((t) => t && !SUFIJOS.has(t))
    .join(" ");
}
