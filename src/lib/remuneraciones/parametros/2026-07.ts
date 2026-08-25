import type { ParametrosPeriodo } from "../tipos.ts";

/**
 * Indicadores previsionales y tributarios — remuneraciones de JULIO 2026.
 *
 * Para agregar un mes nuevo: copiar este archivo, actualizar los valores
 * y registrarlo en ./index.ts. Nunca incrustar estos valores en el motor.
 */
export const parametros202607: ParametrosPeriodo = {
  clave: "2026-07",
  etiqueta: "Julio 2026",
  uf: 40844.79, // UF al 31-07-2026
  utm: 71649,
  ingresoMinimo: 553553,
  topeImponibleUF: 90,
  topeCesantiaUF: 135.2,
  jornadaSemanal: 42, // Ley 21.561: 42 horas desde abril 2026
  afps: {
    capital: { nombre: "Capital", tasa: 11.44 },
    cuprum: { nombre: "Cuprum", tasa: 11.44 },
    habitat: { nombre: "Habitat", tasa: 11.27 },
    modelo: { nombre: "Modelo", tasa: 10.58 },
    planvital: { nombre: "PlanVital", tasa: 11.16 },
    provida: { nombre: "Provida", tasa: 11.45 },
    uno: { nombre: "Uno", tasa: 10.46 },
  },
  cesantia: {
    indefinido: { trabajador: 0.6, empleador: 2.4 },
    plazo_fijo: { trabajador: 0, empleador: 3.0 },
  },
  sis: 1.62, // vigente desde remuneraciones de abril 2026
  mutualBase: 0.9,
  aporteReformaPension: 1.0, // Ley 21.735: 1% entre ago-2025 y jul-2026
  tramosImpuesto: [
    { hastaUTM: 13.5, factor: 0, rebajaUTM: 0 },
    { hastaUTM: 30, factor: 0.04, rebajaUTM: 0.54 },
    { hastaUTM: 50, factor: 0.08, rebajaUTM: 1.74 },
    { hastaUTM: 70, factor: 0.135, rebajaUTM: 4.49 },
    { hastaUTM: 90, factor: 0.23, rebajaUTM: 11.14 },
    { hastaUTM: 120, factor: 0.304, rebajaUTM: 17.8 },
    { hastaUTM: 310, factor: 0.35, rebajaUTM: 23.32 },
    { hastaUTM: Infinity, factor: 0.4, rebajaUTM: 38.82 },
  ],
};
