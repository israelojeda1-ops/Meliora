export type TipoContrato = "indefinido" | "plazo_fijo";
export type SistemaSalud = "fonasa" | "isapre";
export type ModoGratificacion = "legal" | "manual" | "ninguna";

export interface TramoImpuesto {
  /** Límite superior del tramo en UTM (Infinity para el último) */
  hastaUTM: number;
  factor: number;
  /** Rebaja expresada en UTM */
  rebajaUTM: number;
}

export interface AFP {
  nombre: string;
  /** Tasa total del trabajador dependiente (10% + comisión), en % */
  tasa: number;
}

export interface ParametrosPeriodo {
  clave: string;
  etiqueta: string;
  uf: number;
  utm: number;
  ingresoMinimo: number;
  /** Tope imponible general (AFP, salud, ley de accidentes), en UF */
  topeImponibleUF: number;
  /** Tope imponible del seguro de cesantía, en UF */
  topeCesantiaUF: number;
  /** Jornada ordinaria semanal vigente (Ley 21.561), en horas */
  jornadaSemanal: number;
  afps: Record<string, AFP>;
  cesantia: {
    indefinido: { trabajador: number; empleador: number };
    plazo_fijo: { trabajador: number; empleador: number };
  };
  /** Tasa SIS de cargo del empleador, en % */
  sis: number;
  /** Cotización básica ley 16.744 (mutual), en %; el recargo por riesgo es variable */
  mutualBase: number;
  /** Cotización adicional del empleador al sistema de pensiones (Ley 21.735), en % */
  aporteReformaPension: number;
  tramosImpuesto: TramoImpuesto[];
}

export interface EntradaTrabajador {
  sueldoBase: number;
  modoGratificacion: ModoGratificacion;
  /** Monto mensual pactado, solo si modoGratificacion === "manual" */
  gratificacionManual?: number;
  afpKey: string;
  salud: SistemaSalud;
  /** Plan pactado en UF (hasta 3 decimales), solo si salud === "isapre" */
  planIsapreUF?: number;
  contrato: TipoContrato;
  /** Cantidad de horas extra al 50% */
  horasExtra?: number;
  otrosImponibles?: number;
  colacion?: number;
  movilizacion?: number;
  otrosDescuentos?: number;
}

export interface EntradaEmpleador extends EntradaTrabajador {
  /** Recargo por riesgo de la mutual, en puntos porcentuales sobre la base */
  mutualRecargo?: number;
}

export interface LiquidacionTrabajador {
  sueldoBase: number;
  gratificacion: number;
  horasExtra: number;
  otrosImponibles: number;
  totalImponible: number;
  colacion: number;
  movilizacion: number;
  totalNoImponible: number;
  topeImponible: number;
  topeCesantia: number;
  baseCotizacion: number;
  baseCesantia: number;
  afpNombre: string;
  afpTasa: number;
  afp: number;
  salud7: number;
  planIsapre: number;
  adicionalIsapre: number;
  cesantiaTrabajador: number;
  baseTributable: number;
  impuesto: number;
  otrosDescuentos: number;
  totalDescuentos: number;
  liquido: number;
}

export interface CostoEmpleador {
  liquidacion: LiquidacionTrabajador;
  cesantiaEmpleador: number;
  sis: number;
  mutualTasa: number;
  mutual: number;
  aporteReformaTasa: number;
  aporteReforma: number;
  totalAportes: number;
  costoTotal: number;
  /** Fracción del costo total que llega al bolsillo del trabajador (0–1) */
  proporcionLiquido: number;
}
