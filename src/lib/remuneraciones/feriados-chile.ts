/**
 * Feriados legales de Chile, calculados por regla (no por tabla fija), para
 * que sigan siendo correctos en años futuros sin mantención manual.
 *
 * Fuentes: Ley 2.977 y sus modificaciones (feriados civiles y religiosos);
 * Ley 19.973 y Ley 20.983 (traslado a día lunes de San Pedro y San Pablo y
 * Encuentro de Dos Mundos); cálculo de Pascua por el algoritmo de Gauss.
 *
 * No incluye feriados adicionales decretados por ley para casos puntuales
 * (por ejemplo, elecciones o conmemoraciones especiales de un solo año).
 */

function fecha(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

/** Domingo de Pascua (calendario gregoriano) por el algoritmo de Gauss/Meeus. */
function domingoDePascua(anio: number): Date {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(anio, mes - 1, dia);
}

function sumarDias(d: Date, dias: number): Date {
  const copia = new Date(d);
  copia.setDate(copia.getDate() + dias);
  return copia;
}

function aISO(d: Date): string {
  return fecha(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/**
 * Traslado a día lunes (Ley 19.973, art. 1°, inciso 2°): si la fecha cae
 * martes, se traslada al lunes anterior; si cae miércoles, jueves o
 * viernes, se traslada al lunes siguiente. Si cae sábado, domingo o lunes,
 * no se traslada.
 */
function trasladoALunes(d: Date): Date {
  const dow = d.getDay(); // 0=dom, 1=lun, ..., 6=sáb
  if (dow === 2) return sumarDias(d, -1);
  if (dow === 3) return sumarDias(d, 5);
  if (dow === 4) return sumarDias(d, 4);
  if (dow === 5) return sumarDias(d, 3);
  return d;
}

/** Feriados legales de Chile para un año, como set de fechas ISO. */
export function feriadosChile(anio: number): Set<string> {
  const fijos = [
    fecha(anio, 1, 1), // Año Nuevo (irrenunciable)
    fecha(anio, 5, 1), // Día Nacional del Trabajo (irrenunciable)
    fecha(anio, 5, 21), // Día de las Glorias Navales
    fecha(anio, 7, 16), // Virgen del Carmen
    fecha(anio, 8, 15), // Asunción de la Virgen
    fecha(anio, 9, 18), // Independencia Nacional (irrenunciable)
    fecha(anio, 9, 19), // Glorias del Ejército (irrenunciable)
    fecha(anio, 10, 31), // Iglesias Evangélicas y Protestantes
    fecha(anio, 11, 1), // Día de Todos los Santos
    fecha(anio, 12, 8), // Inmaculada Concepción
    fecha(anio, 12, 25), // Navidad (irrenunciable)
  ];

  const pascua = domingoDePascua(anio);
  const viernesSanto = aISO(sumarDias(pascua, -2));
  const sabadoSanto = aISO(sumarDias(pascua, -1));

  const sanPedroYSanPablo = aISO(trasladoALunes(new Date(anio, 5, 29)));
  const encuentroDeDosMundos = aISO(trasladoALunes(new Date(anio, 9, 12)));

  return new Set([
    ...fijos,
    viernesSanto,
    sabadoSanto,
    sanPedroYSanPablo,
    encuentroDeDosMundos,
  ]);
}

const cache = new Map<number, Set<string>>();

/** true si la fecha ISO (yyyy-mm-dd) es feriado legal en Chile. */
export function esFeriadoChile(fechaISO: string): boolean {
  const anio = Number(fechaISO.slice(0, 4));
  let set = cache.get(anio);
  if (!set) {
    set = feriadosChile(anio);
    cache.set(anio, set);
  }
  return set.has(fechaISO);
}
