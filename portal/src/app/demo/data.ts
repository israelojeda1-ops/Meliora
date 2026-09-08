/* ────────────────────────────────────────────────────────────────────────
   Paleta (dataviz skill · validada CVD), formatters y datos ficticios
   de Empresa Demo SpA. Módulo sin "use client": solo constantes.
   ──────────────────────────────────────────────────────────────────────── */
export const C = {
  blue: "#2a78d6",
  green: "#1baf7a",
  magenta: "#e87ba4",
  yellow: "#eda100",
  orange: "#eb6834",
  violet: "#4a3aa7",
  navy: "#1B2A4A",
  emerald: "#0E7C66",
  ink: "#0b0b0b",
  ink2: "#52514e",
  muted: "#898781",
  grid: "#eef1f5",
  axis: "#c3c2b7",
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
  goodText: "#006300",
};

export type Estado = "good" | "warning" | "serious" | "critical";
export const STATUS_COLOR: Record<Estado, string> = {
  good: C.good,
  warning: C.warning,
  serious: C.serious,
  critical: C.critical,
};

export const MESES = ["Ago", "Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"];
export const PERIODOS = [
  "Agosto 2025", "Septiembre 2025", "Octubre 2025", "Noviembre 2025", "Diciembre 2025",
  "Enero 2026", "Febrero 2026", "Marzo 2026", "Abril 2026", "Mayo 2026", "Junio 2026", "Julio 2026",
];

export const money = (n: number, dec = 0) =>
  `$${n.toLocaleString("es-CL", { minimumFractionDigits: dec, maximumFractionDigits: dec })}`;
export const mm = (n: number, dec = 0) => `${money(n, dec)} MM`;
export const pct = (n: number, dec = 1) => `${n.toFixed(dec).replace(".", ",")}%`;
export const days = (n: number) => `${Math.round(n)} días`;
export const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* ── Series mensuales (Ago 2025 a Jul 2026, MM CLP salvo indicado) ────── */
export const ventas = [42, 45, 41, 48, 53, 47, 44, 49, 52, 55, 58, 61];
export const presupuestoVentas = [40, 42, 43, 45, 48, 48, 46, 47, 49, 51, 53, 55];
export const ventasAnoAnterior = [36, 39, 36, 41, 45, 40, 38, 42, 45, 47, 50, 53];
export const compras = [26, 28, 25, 29, 32, 29, 27, 30, 31, 33, 34, 36];
export const ebitdaMargen = [11.2, 12.1, 10.4, 12.8, 14.1, 12.9, 11.8, 13.2, 13.9, 14.6, 15.2, 15.8];
export const ingresosCaja = [50, 54, 49, 56, 61, 55, 52, 58, 60, 63, 66, 69];
export const egresosCaja = [45, 47, 44, 48, 52, 49, 47, 50, 51, 53, 55, 57];
export const dso = [52, 50, 54, 49, 47, 48, 51, 46, 45, 44, 43, 42];
export const dpo = [48, 50, 47, 49, 51, 50, 49, 48, 50, 52, 51, 52];

export const saldoCaja: number[] = [];
ingresosCaja.reduce((acc, ing, i) => {
  const s = acc + (ing - egresosCaja[i]);
  saldoCaja.push(s);
  return s;
}, 18);

/* ── Forecast (6 meses proyectados) ───────────────────────────────────── */
export const forecastMeses = ["Ago*", "Sep*", "Oct*", "Nov*", "Dic*", "Ene*"];
export const forecastVentas = [64, 66, 63, 70, 76, 68];
export const metaAnualForecast = 1000;

/* ── Ventas: composición y clientes ───────────────────────────────────── */
export const ventasPorLinea = [
  { name: "Línea Retail", monto: 172 },
  { name: "Proyectos", monto: 141 },
  { name: "Servicios", monto: 98 },
  { name: "Otros", monto: 44 },
];
export const topClientes = [
  { cliente: "Constructora Andes SpA", linea: "Proyectos", monto: 78, part: 15.4 },
  { cliente: "Comercial del Sur Ltda", linea: "Línea Retail", monto: 61, part: 12.0 },
  { cliente: "Inversiones Aconcagua", linea: "Proyectos", monto: 47, part: 9.3 },
  { cliente: "Retail Pacífico SA", linea: "Línea Retail", monto: 39, part: 7.7 },
  { cliente: "Distribuidora Central", linea: "Otros", monto: 28, part: 5.5 },
];

/* ── Compras ──────────────────────────────────────────────────────────── */
export const comprasPorCategoria = [
  { name: "Materia prima", monto: 198 },
  { name: "Servicios externos", monto: 92 },
  { name: "Logística", monto: 61 },
  { name: "Administración", monto: 43 },
];
export const topProveedores = [
  { prov: "Importadora Química SA", cat: "Materia prima", monto: 84, cond: "30 días" },
  { prov: "Transportes Rápidos Ltda", cat: "Logística", monto: 52, cond: "Contado" },
  { prov: "Insumos Industriales", cat: "Materia prima", monto: 44, cond: "60 días" },
  { prov: "Energía y Gas SpA", cat: "Servicios externos", monto: 31, cond: "30 días" },
  { prov: "Servicios TI Cloud", cat: "Administración", monto: 22, cond: "Contado" },
];

/* ── Cobranza y pagos ─────────────────────────────────────────────────── */
export const cartera = [
  { rango: "Por vencer (0 a 30 días)", monto: 28.4, status: "good" as Estado },
  { rango: "31 a 60 días", monto: 12.1, status: "warning" as Estado },
  { rango: "61 a 90 días", monto: 6.3, status: "serious" as Estado },
  { rango: "Más de 90 días", monto: 3.8, status: "critical" as Estado },
];
export const topDeudores = [
  { cliente: "Comercial del Sur Ltda", monto: 9.4, dias: 74, status: "serious" as Estado },
  { cliente: "Retail Pacífico SA", monto: 6.1, dias: 41, status: "warning" as Estado },
  { cliente: "Inversiones Aconcagua", monto: 3.8, dias: 96, status: "critical" as Estado },
  { cliente: "Distribuidora Central", monto: 2.9, dias: 22, status: "good" as Estado },
];
export const carteraPagar = [
  { rango: "Por vencer (0 a 30 días)", monto: 32.6, status: "good" as Estado },
  { rango: "31 a 60 días", monto: 18.4, status: "warning" as Estado },
  { rango: "61 a 90 días", monto: 11.8, status: "serious" as Estado },
  { rango: "Más de 90 días", monto: 5.2, status: "critical" as Estado },
];
export type Prioridad = "P1" | "P2" | "P3";
export const proveedoresPago = [
  { prov: "Importadora Química SA", monto: 18.2, prioridad: "P1" as Prioridad, motivo: "Insumo crítico, pagar primero" },
  { prov: "Energía y Gas SpA", monto: 5.1, prioridad: "P1" as Prioridad, motivo: "Suministro, no se puede atrasar" },
  { prov: "Insumos Industriales", monto: 14.5, prioridad: "P2" as Prioridad, motivo: "2% descuento por pronto pago" },
  { prov: "Transportes Rápidos Ltda", monto: 6.4, prioridad: "P2" as Prioridad, motivo: "Proveedor estratégico" },
  { prov: "Servicios TI Cloud", monto: 3.2, prioridad: "P3" as Prioridad, motivo: "Condiciones flexibles" },
];
export const PRIORIDAD_COLOR: Record<Prioridad, string> = { P1: C.critical, P2: C.warning, P3: C.good };

/* ── Resultados ───────────────────────────────────────────────────────── */
export const eerr = [
  { label: "Ingresos por ventas", real: 61.0, pres: 55.0, kind: "total" as const },
  { label: "Costo de ventas", real: -35.8, pres: -33.0, kind: "cost" as const },
  { label: "Margen bruto", real: 25.2, pres: 22.0, kind: "sub" as const },
  { label: "Gastos de administración", real: -8.1, pres: -8.5, kind: "cost" as const },
  { label: "Gastos de venta", real: -5.9, pres: -5.2, kind: "cost" as const },
  { label: "Otros gastos operativos", real: -1.6, pres: -1.3, kind: "cost" as const },
  { label: "EBITDA", real: 9.6, pres: 7.0, kind: "total" as const },
];

export type StatementKind = "line" | "subtotal" | "total";
export const pnlIfrs: { label: string; actual: number; anterior: number; kind: StatementKind }[] = [
  { label: "Ingresos de actividades ordinarias", actual: 595.0, anterior: 512.4, kind: "line" },
  { label: "Costo de ventas", actual: -368.1, anterior: -322.8, kind: "line" },
  { label: "Ganancia bruta", actual: 226.9, anterior: 189.6, kind: "subtotal" },
  { label: "Otros ingresos, por función", actual: 6.2, anterior: 4.8, kind: "line" },
  { label: "Costos de distribución", actual: -41.3, anterior: -35.1, kind: "line" },
  { label: "Gastos de administración", actual: -98.7, anterior: -91.2, kind: "line" },
  { label: "Otros gastos, por función", actual: -12.4, anterior: -9.6, kind: "line" },
  { label: "Otras ganancias (pérdidas)", actual: 1.8, anterior: -0.9, kind: "line" },
  { label: "Ganancias de actividades operacionales", actual: 82.5, anterior: 57.6, kind: "subtotal" },
  { label: "Ingresos financieros", actual: 3.1, anterior: 2.4, kind: "line" },
  { label: "Costos financieros", actual: -14.6, anterior: -13.8, kind: "line" },
  { label: "Ganancia antes de impuestos", actual: 71.0, anterior: 46.2, kind: "subtotal" },
  { label: "Gasto por impuestos a las ganancias", actual: -19.2, anterior: -12.5, kind: "line" },
  { label: "Ganancia del período", actual: 51.8, anterior: 33.7, kind: "total" },
];

export const topVariaciones = [
  { item: "Ventas · Línea Retail", varMonto: 12.4, tipo: "F" as const, explicacion: "Nuevo contrato con cliente ancla (Constructora Andes)", accion: "Mantener capacidad de despacho", responsable: "Gerente Comercial", estado: "Cerrado" },
  { item: "Materia prima", varMonto: -8.6, tipo: "U" as const, explicacion: "Alza de precio de insumos +8% interanual", accion: "Negociar contrato de cobertura", responsable: "Abastecimiento", estado: "En curso" },
  { item: "Ventas · Proyectos", varMonto: 6.1, tipo: "F" as const, explicacion: "Mayor demanda en obras menores", accion: "Reforzar dotación de instalación", responsable: "Jefe de Proyectos", estado: "Cerrado" },
  { item: "Gastos de venta", varMonto: -4.3, tipo: "U" as const, explicacion: "Feria comercial no presupuestada", accion: "Evaluar retorno de la inversión", responsable: "Marketing", estado: "Revisión" },
  { item: "Costo de mano de obra directa", varMonto: -3.1, tipo: "U" as const, explicacion: "Horas extra por peak de producción", accion: "Evaluar contratación adicional", responsable: "RR.HH.", estado: "En curso" },
  { item: "Gastos de administración", varMonto: 2.8, tipo: "F" as const, explicacion: "Ahorro en servicios básicos", accion: "Documentar buenas prácticas", responsable: "Administración", estado: "Cerrado" },
  { item: "Gastos financieros", varMonto: 1.2, tipo: "F" as const, explicacion: "Refinanciamiento de deuda a mejor tasa", accion: "-", responsable: "Finanzas", estado: "Cerrado" },
];

/* ── Balance ──────────────────────────────────────────────────────────── */
export const activos: { label: string; monto: number; kind: StatementKind }[] = [
  { label: "Efectivo y equivalentes", monto: 113.0, kind: "line" },
  { label: "Cuentas por cobrar", monto: 50.6, kind: "line" },
  { label: "Existencias", monto: 60.8, kind: "line" },
  { label: "Otros activos corrientes", monto: 8.0, kind: "line" },
  { label: "Total activos corrientes", monto: 232.4, kind: "subtotal" },
  { label: "Propiedad, planta y equipo", monto: 180.0, kind: "line" },
  { label: "Intangibles", monto: 25.0, kind: "line" },
  { label: "Otros activos no corrientes", monto: 12.6, kind: "line" },
  { label: "Total activos no corrientes", monto: 217.6, kind: "subtotal" },
  { label: "TOTAL ACTIVOS", monto: 450.0, kind: "total" },
];
export const pasivosPatrimonio: { label: string; monto: number; kind: StatementKind }[] = [
  { label: "Cuentas por pagar", monto: 68.0, kind: "line" },
  { label: "Deuda de corto plazo", monto: 20.0, kind: "line" },
  { label: "Impuestos por pagar", monto: 9.5, kind: "line" },
  { label: "Provisiones y otros pasivos corrientes", monto: 15.0, kind: "line" },
  { label: "Total pasivos corrientes", monto: 112.5, kind: "subtotal" },
  { label: "Deuda de largo plazo", monto: 85.0, kind: "line" },
  { label: "Otros pasivos no corrientes", monto: 12.5, kind: "line" },
  { label: "Total pasivos no corrientes", monto: 97.5, kind: "subtotal" },
  { label: "Total pasivos", monto: 210.0, kind: "subtotal" },
  { label: "Capital social", monto: 150.0, kind: "line" },
  { label: "Reservas y otros resultados acumulados", monto: 38.2, kind: "line" },
  { label: "Resultado del ejercicio", monto: 51.8, kind: "line" },
  { label: "Total patrimonio", monto: 240.0, kind: "subtotal" },
  { label: "TOTAL PASIVOS Y PATRIMONIO", monto: 450.0, kind: "total" },
];

export const flujoIndirecto: { label: string; monto: number; kind: StatementKind }[] = [
  { label: "Utilidad neta del ejercicio", monto: 51.8, kind: "line" },
  { label: "(+) Depreciación y amortización", monto: 12.4, kind: "line" },
  { label: "(−) Variación en cuentas por cobrar", monto: -8.2, kind: "line" },
  { label: "(−) Variación en existencias", monto: -4.1, kind: "line" },
  { label: "(+) Variación en cuentas por pagar", monto: 6.5, kind: "line" },
  { label: "Flujo operacional (OCF)", monto: 58.4, kind: "subtotal" },
  { label: "(−) CAPEX: adquisición de activos fijos", monto: -22.0, kind: "line" },
  { label: "Flujo de inversión (ICF)", monto: -22.0, kind: "subtotal" },
  { label: "(−) Pago de deuda", monto: -6.0, kind: "line" },
  { label: "(−) Pago de dividendos", monto: -15.0, kind: "line" },
  { label: "Flujo de financiamiento (FCF)", monto: -21.0, kind: "subtotal" },
  { label: "Variación neta de caja", monto: 15.4, kind: "subtotal" },
  { label: "Caja al inicio del período", monto: 97.6, kind: "line" },
  { label: "CAJA AL CIERRE DEL PERÍODO", monto: 113.0, kind: "total" },
];

/* ── Productos y stock ────────────────────────────────────────────────── */
export const productos = [
  { nombre: "Línea Premium A", categoria: "Retail", ventas: 96.4, costo: 52.1 },
  { nombre: "Kit Instalación Pro", categoria: "Proyectos", ventas: 84.2, costo: 55.6 },
  { nombre: "Línea Estándar B", categoria: "Retail", ventas: 71.8, costo: 46.7 },
  { nombre: "Servicio Mantención", categoria: "Servicios", ventas: 58.3, costo: 21.4 },
  { nombre: "Accesorios varios", categoria: "Retail", ventas: 41.6, costo: 30.9 },
  { nombre: "Kit Obra Menor", categoria: "Proyectos", ventas: 38.9, costo: 27.3 },
  { nombre: "Línea Económica C", categoria: "Retail", ventas: 33.5, costo: 27.8 },
  { nombre: "Servicio Post-Venta", categoria: "Servicios", ventas: 22.1, costo: 10.2 },
].map((p) => ({
  ...p,
  margen: p.ventas - p.costo,
  margenPct: ((p.ventas - p.costo) / p.ventas) * 100,
}));

export const stock = [
  { sku: "A-1001", nombre: "Producto A · formato grande", categoria: "Línea Premium A", unidades: 340, costoUnit: 0.0838, dias: 46, estado: "good" as Estado },
  { sku: "B-2002", nombre: "Componente B · formato chico", categoria: "Kit Instalación Pro", unidades: 128, costoUnit: 0.0412, dias: 18, estado: "warning" as Estado },
  { sku: "C-3003", nombre: "Insumo C · unidad estándar", categoria: "Línea Estándar B", unidades: 0, costoUnit: 0.156, dias: 0, estado: "critical" as Estado },
  { sku: "D-4004", nombre: "Material D · rollo", categoria: "Kit Obra Menor", unidades: 612, costoUnit: 0.029, dias: 88, estado: "good" as Estado },
  { sku: "A-1002", nombre: "Producto A · formato mediano", categoria: "Línea Premium A", unidades: 54, costoUnit: 0.065, dias: 12, estado: "warning" as Estado },
  { sku: "E-5005", nombre: "Accesorio E · unidad", categoria: "Accesorios varios", unidades: 289, costoUnit: 0.0185, dias: 61, estado: "good" as Estado },
  { sku: "F-6006", nombre: "Insumo F · saco", categoria: "Línea Económica C", unidades: 22, costoUnit: 0.021, dias: 8, estado: "critical" as Estado },
].map((s) => ({ ...s, valor: s.unidades * s.costoUnit }));

/* ── CAPEX y dotación ─────────────────────────────────────────────────── */
export const capex = [
  { proyecto: "Ampliación línea productiva", categoria: "Equipamiento", presupuesto: 45.0, ejecutado: 38.5, estado: "En curso" as const },
  { proyecto: "Actualización ERP", categoria: "TI", presupuesto: 12.0, ejecutado: 12.0, estado: "Completo" as const },
  { proyecto: "Paneles solares · planta", categoria: "Infraestructura", presupuesto: 18.0, ejecutado: 16.8, estado: "Completo" as const },
  { proyecto: "Renovación flota de reparto", categoria: "Equipamiento", presupuesto: 9.0, ejecutado: 4.2, estado: "Retrasado" as const },
  { proyecto: "Laboratorio I+D", categoria: "I+D", presupuesto: 6.0, ejecutado: 3.6, estado: "En curso" as const },
];
export const CAPEX_ESTADO: Record<string, Estado> = { Completo: "good", "En curso": "warning", Retrasado: "critical" };

export const dotacion = [
  { area: "Producción / Operaciones", hc: 48, variacion: 2 },
  { area: "Comercial", hc: 12, variacion: 0 },
  { area: "Logística", hc: 9, variacion: 1 },
  { area: "Administración y Finanzas", hc: 8, variacion: 0 },
  { area: "TI", hc: 4, variacion: 0 },
  { area: "Gerencia", hc: 3, variacion: 0 },
];
export const costoNomina = [
  { name: "Sueldos brutos", monto: 42.8 },
  { name: "Leyes sociales / cotizaciones", monto: 8.6 },
  { name: "Bonos y gratificaciones", monto: 5.2 },
  { name: "Otros beneficios", monto: 2.1 },
];

/* ── Tributario ───────────────────────────────────────────────────────── */
export const calendarioTributario = [
  { obligacion: "IVA (F29) · Julio 2026", vencimiento: "12 ago 2026", monto: 14.8, estado: "Pendiente" as const },
  { obligacion: "PPM (Pago Provisional Mensual)", vencimiento: "12 ago 2026", monto: 3.2, estado: "Pendiente" as const },
  { obligacion: "Cotizaciones previsionales", vencimiento: "13 ago 2026", monto: 8.6, estado: "Pendiente" as const },
  { obligacion: "IVA (F29) · Junio 2026", vencimiento: "12 jul 2026", monto: 13.1, estado: "Pagado" as const },
  { obligacion: "Cotizaciones previsionales · Junio", vencimiento: "13 jul 2026", monto: 8.3, estado: "Pagado" as const },
  { obligacion: "Declaración de Renta (F22) · AT 2026", vencimiento: "30 abr 2026", monto: 0, estado: "Programado" as const },
];
export const TAX_ESTADO: Record<string, Estado | "neutral"> = { Pendiente: "warning", Pagado: "good", Programado: "neutral" };

/* ── Textos de asesoría ───────────────────────────────────────────────── */
export const DEFINICIONES: Record<string, string> = {
  DSO: "DSO: días promedio que demoran tus clientes en pagarte. Menos es mejor.",
  DPO: "DPO: días promedio que demoras en pagar a tus proveedores.",
  EBITDA: "EBITDA: resultado operacional antes de intereses, impuestos, depreciación y amortización. Mide cuánto genera el negocio en sí.",
  RAZON: "Razón corriente: activos corrientes divididos por pasivos corrientes. Sobre 1,0 indica que puedes cubrir tus deudas de corto plazo.",
  F29: "F29: declaración mensual de IVA y PPM ante el SII. Vence el día 12 (o 20 con factura electrónica).",
  PPM: "PPM: pago provisional mensual, un anticipo del impuesto a la renta anual.",
};
