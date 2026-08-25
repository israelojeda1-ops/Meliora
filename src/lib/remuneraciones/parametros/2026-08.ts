import type { ParametrosPeriodo } from "../tipos.ts";

/**
 * Indicadores previsionales y tributarios — remuneraciones de AGOSTO 2026.
 */
export const parametros202608: ParametrosPeriodo = {
  clave: "2026-08",
  etiqueta: "Agosto 2026",
  uf: 40873.77, // UF al 31-08-2026
  utm: 71649,
  ingresoMinimo: 553553,
  topeImponibleUF: 90,
  topeCesantiaUF: 135.2,
  jornadaSemanal: 42,
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
  sis: 1.62,
  mutualBase: 0.9,
  aporteReformaPension: 3.5, // Ley 21.735: sube a 3,5% desde remuneraciones de agosto 2026
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
