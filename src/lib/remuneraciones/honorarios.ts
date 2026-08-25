import type { ParametrosPeriodo } from "./tipos.ts";

export interface Boleta {
  bruto: number;
  tasa: number;
  retencion: number;
  liquido: number;
}

/** Boleta de honorarios desde el monto bruto emitido. */
export function boletaDesdeBruto(
  bruto: number,
  p: ParametrosPeriodo
): Boleta {
  const b = Math.max(0, Math.round(bruto || 0));
  const retencion = Math.round(b * (p.retencionHonorarios / 100));
  return {
    bruto: b,
    tasa: p.retencionHonorarios,
    retencion,
    liquido: b - retencion,
  };
}

/** Monto bruto a boletear para recibir un líquido deseado. */
export function boletaDesdeLiquido(
  liquido: number,
  p: ParametrosPeriodo
): Boleta {
  const l = Math.max(0, Math.round(liquido || 0));
  const bruto = Math.round(l / (1 - p.retencionHonorarios / 100));
  return boletaDesdeBruto(bruto, p);
}
