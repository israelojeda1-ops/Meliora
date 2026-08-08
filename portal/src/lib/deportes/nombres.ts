// El historial puede venir de fuentes distintas (API-Sports, ESPN) que usan ids
// distintos para el mismo equipo, así que el cruce es por nombre normalizado:
// minúsculas, sin tildes, sin puntuación, sin sufijos de club y sin las
// iniciales sueltas de las abreviaturas ("D. La Serena" -> "la serena").

const SUFIJOS = new Set(["fc", "cf", "sc", "afc", "ac", "cd", "club"]);

export function normNombre(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !SUFIJOS.has(t))
    .join(" ");
}

/**
 * Busca un nombre en un mapa con llave normalizada. Si no calza exacto, acepta
 * que los tokens de la versión corta estén contenidos en la larga: "Everton de
 * Vina" encuentra a "Everton de Viña del Mar", "D. La Serena" a "Deportes La
 * Serena". Pide al menos dos tokens en común para no cruzar equipos distintos,
 * salvo nombres de un solo token ("Huachipato"), que exigen calce exacto.
 */
export function buscarPorNombre<T>(mapa: Map<string, T>, nombre: string): T | undefined {
  const clave = normNombre(nombre);
  const directo = mapa.get(clave);
  if (directo !== undefined) return directo;

  const mios = clave.split(" ").filter(Boolean);
  if (mios.length < 2) return undefined;
  for (const [k, v] of mapa) {
    const suyos = new Set(k.split(" "));
    const cortos = mios.length <= suyos.size ? mios : [...suyos];
    const largos = mios.length <= suyos.size ? suyos : new Set(mios);
    if (cortos.length >= 2 && cortos.every((t) => largos.has(t))) return v;
  }
  return undefined;
}
