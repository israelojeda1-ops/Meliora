// El historial puede venir de fuentes distintas (API-Sports, ESPN) que usan ids
// distintos para el mismo equipo, así que el cruce es por nombre normalizado:
// minúsculas, sin tildes, sin puntuación, sin sufijos de club y sin las
// iniciales sueltas de las abreviaturas ("D. La Serena" -> "la serena").

const SUFIJOS = new Set(["fc", "cf", "sc", "afc", "ac", "cd", "club"]);

// Algunos clubes llegan con nombre distinto seg\u00fan la fuente (API-Football en la
// cartelera del d\u00eda, ESPN en el historial) y el parecido de tokens no basta.
// Aqu\u00ed cada variante normalizada se lleva a una forma can\u00f3nica com\u00fan. Es una
// lista acotada \u2014 se agrega un par cuando aparezca un equipo "sin historial"
// que en realidad s\u00ed lo tiene bajo otro nombre.
const ALIAS: Record<string, string> = {
  "los angeles": "lafc", // API-Football "Los Angeles FC" \u2194 ESPN "LAFC" (LA Galaxy es "la galaxy", no colisiona)
  "guadalajara chivas": "guadalajara",
  chivas: "guadalajara",
};

export function normNombre(nombre: string): string {
  const tokens = nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  // Une las siglas con puntos que quedaron como letras sueltas: "u n a m" ->
  // "unam", "d c united" -> "dc united". Si no, cada letra se descartar\u00eda por
  // tener un solo car\u00e1cter y la sigla desaparecer\u00eda del nombre.
  const unidos: string[] = [];
  let sigla = "";
  for (const t of tokens) {
    if (t.length === 1) sigla += t;
    else {
      if (sigla) unidos.push(sigla);
      sigla = "";
      unidos.push(t);
    }
  }
  if (sigla) unidos.push(sigla);

  const base = unidos.filter((t) => t.length > 1 && !SUFIJOS.has(t)).join(" ");
  return ALIAS[base] ?? base;
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
