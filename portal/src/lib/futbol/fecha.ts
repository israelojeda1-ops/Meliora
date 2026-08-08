// Todo el módulo de fútbol trabaja en hora de Chile, sin importar dónde corra el
// servidor ni cómo tenga el reloj el celular que abre la página.
export const ZONA = "America/Santiago";
export const DIA_MS = 86_400_000;

const FMT = new Intl.DateTimeFormat("en-US", {
  timeZone: ZONA,
  hour12: false,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

type Partes = { year: number; month: number; day: number; hour: number; minute: number; second: number };

function partes(ts: number): Partes {
  const p: Record<string, number> = {};
  for (const x of FMT.formatToParts(ts)) if (x.type !== "literal") p[x.type] = Number(x.value);
  // en hour12:false la medianoche puede venir como 24
  return { year: p.year, month: p.month, day: p.day, hour: p.hour % 24, minute: p.minute, second: p.second };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Desfase de la zona respecto a UTC en ese instante, en ms. */
function desfase(ts: number): number {
  const p = partes(ts);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - ts;
}

/** "AAAA-MM-DD" o "AAAA-MM-DDTHH:MM" entendido como hora chilena -> instante absoluto. */
export function aTs(iso: string): number {
  const m = String(iso).trim().replace(" ", "T").match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{1,2}):(\d{2}))?/);
  if (!m) return NaN;
  const utc = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] ?? 0), Number(m[5] ?? 0));
  // dos pasadas, porque el desfase depende de la fecha (horario de verano)
  const aprox = utc - desfase(utc);
  return utc - desfase(aprox);
}

export const fechaChile = (ts: number): string => {
  const p = partes(ts);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
};

export const horaChile = (ts: number): string => {
  const p = partes(ts);
  return `${pad(p.hour)}:${pad(p.minute)}`;
};

export const inicioDia = (ts: number): number => aTs(fechaChile(ts) + "T00:00");

/** "05-08" — día y mes, como se anotan los historiales en los canales. */
export const fechaCorta = (ts: number): string => {
  const [, mes, dia] = fechaChile(ts).split("-");
  return `${dia}-${mes}`;
};

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function nombreDia(ts: number, hoyTs = Date.now()): string {
  const hoy = inicioDia(hoyTs);
  const d = inicioDia(ts);
  if (d === hoy) return "Hoy";
  if (d === hoy + DIA_MS) return "Mañana";
  if (d === hoy - DIA_MS) return "Ayer";
  const p = partes(d);
  const dow = new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();
  return `${DIAS[dow]} ${p.day} ${MESES[p.month - 1]}`;
}

/** "en 2 h", "en 35 min", "en juego". Vacío si falta más de un día. */
export function relativo(ts: number, ahora = Date.now()): string {
  const dif = ts - ahora;
  if (dif < -2.5 * 3_600_000) return "finalizado";
  if (dif < 0) return "en juego";
  if (dif < 3_600_000) return `en ${Math.max(1, Math.round(dif / 60_000))} min`;
  if (dif < DIA_MS) return `en ${Math.round(dif / 3_600_000)} h`;
  return "";
}
