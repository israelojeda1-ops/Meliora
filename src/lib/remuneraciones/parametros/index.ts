import type { ParametrosPeriodo } from "../tipos.ts";
import { parametros202607 } from "./2026-07.ts";
import { parametros202608 } from "./2026-08.ts";

/** Períodos disponibles, del más reciente al más antiguo. */
export const periodos: ParametrosPeriodo[] = [
  parametros202608,
  parametros202607,
];

export const periodoActual = periodos[0];
