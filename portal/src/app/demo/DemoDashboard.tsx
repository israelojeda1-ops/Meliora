"use client";

import { useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   Paleta (dataviz skill · validada CVD) y helpers de formato
   ──────────────────────────────────────────────────────────────────────── */
const C = {
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
  grid: "#e6e8ec",
  axis: "#c3c2b7",
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
  goodText: "#006300",
};

const MESES = ["Ago", "Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"];

const money = (n: number, dec = 0) =>
  `$${n.toLocaleString("es-CL", { minimumFractionDigits: dec, maximumFractionDigits: dec })}`;
const mm = (n: number, dec = 0) => `${money(n, dec)} MM`;
const pct = (n: number, dec = 1) => `${n.toFixed(dec)}%`;
const days = (n: number) => `${Math.round(n)} días`;

/* ────────────────────────────────────────────────────────────────────────
   Datos ficticios · Empresa Demo SpA
   ──────────────────────────────────────────────────────────────────────── */
const ventas = [42, 45, 41, 48, 53, 47, 44, 49, 52, 55, 58, 61];
const presupuestoVentas = [40, 42, 43, 45, 48, 48, 46, 47, 49, 51, 53, 55];
const compras = [26, 28, 25, 29, 32, 29, 27, 30, 31, 33, 34, 36];
const ebitdaMargen = [11.2, 12.1, 10.4, 12.8, 14.1, 12.9, 11.8, 13.2, 13.9, 14.6, 15.2, 15.8];

/* Forecast de ventas: mezcla YTD real + proyección (6 meses, ficticios) */
const forecastMeses = ["Ago*", "Sep*", "Oct*", "Nov*", "Dic*", "Ene*"];
const forecastVentas = [64, 66, 63, 70, 76, 68];
const mesesForecastChart = [...MESES, ...forecastMeses];
const ventasRealSerie = [...ventas, 0, 0, 0, 0, 0, 0];
const ventasProyeccionSerie = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ...forecastVentas];
const metaAnualForecast = 1000;

const ingresosCaja = [50, 54, 49, 56, 61, 55, 52, 58, 60, 63, 66, 69];
const egresosCaja = [45, 47, 44, 48, 52, 49, 47, 50, 51, 53, 55, 57];
const dso = [52, 50, 54, 49, 47, 48, 51, 46, 45, 44, 43, 42];

const ventasPorLinea = [
  { name: "Línea Retail", monto: 172 },
  { name: "Proyectos", monto: 141 },
  { name: "Servicios", monto: 98 },
  { name: "Otros", monto: 44 },
];
const topClientes = [
  { cliente: "Constructora Andes SpA", monto: 78, part: 15.4 },
  { cliente: "Comercial del Sur Ltda", monto: 61, part: 12.0 },
  { cliente: "Inversiones Aconcagua", monto: 47, part: 9.3 },
  { cliente: "Retail Pacífico SA", monto: 39, part: 7.7 },
  { cliente: "Distribuidora Central", monto: 28, part: 5.5 },
];

const comprasPorCategoria = [
  { name: "Materia prima", monto: 198 },
  { name: "Servicios externos", monto: 92 },
  { name: "Logística", monto: 61 },
  { name: "Administración", monto: 43 },
];
const topProveedores = [
  { prov: "Importadora Química SA", monto: 84, cond: "30 días" },
  { prov: "Transportes Rápidos Ltda", monto: 52, cond: "Contado" },
  { prov: "Insumos Industriales", monto: 44, cond: "60 días" },
  { prov: "Energía y Gas SpA", monto: 31, cond: "30 días" },
  { prov: "Servicios TI Cloud", monto: 22, cond: "Contado" },
];

const cartera = [
  { rango: "Por vencer (0–30 días)", monto: 28.4, status: "good" as const },
  { rango: "31 – 60 días", monto: 12.1, status: "warning" as const },
  { rango: "61 – 90 días", monto: 6.3, status: "serious" as const },
  { rango: "Más de 90 días", monto: 3.8, status: "critical" as const },
];
const topDeudores = [
  { cliente: "Comercial del Sur Ltda", monto: 9.4, dias: 74, status: "serious" as const },
  { cliente: "Retail Pacífico SA", monto: 6.1, dias: 41, status: "warning" as const },
  { cliente: "Inversiones Aconcagua", monto: 3.8, dias: 96, status: "critical" as const },
  { cliente: "Distribuidora Central", monto: 2.9, dias: 22, status: "good" as const },
];

const eerr = [
  { label: "Ingresos por ventas", real: 61.0, pres: 55.0, kind: "total" as const },
  { label: "Costo de ventas", real: -35.8, pres: -33.0, kind: "cost" as const },
  { label: "Margen bruto", real: 25.2, pres: 22.0, kind: "sub" as const },
  { label: "Gastos de administración", real: -8.1, pres: -8.5, kind: "cost" as const },
  { label: "Gastos de venta", real: -5.9, pres: -5.2, kind: "cost" as const },
  { label: "Otros gastos operativos", real: -1.6, pres: -1.3, kind: "cost" as const },
  { label: "EBITDA", real: 9.6, pres: 7.0, kind: "total" as const },
];

/* Flujo de caja acumulado */
const saldoCaja: number[] = [];
ingresosCaja.reduce((acc, ing, i) => {
  const s = acc + (ing - egresosCaja[i]);
  saldoCaja.push(s);
  return s;
}, 18);

/* Márgenes por producto (acumulado 12m, MM CLP) */
const productos = [
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

/* Estado de Resultados por Función · estilo IFRS (IAS 1), comparativo interanual */
const pnlIfrs: { label: string; actual: number | null; anterior: number | null; kind: "line" | "subtotal" | "total" }[] = [
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

/* Top variaciones de presupuesto (complementa la tabla de eerr) */
const topVariaciones = [
  { item: "Ventas — Línea Retail", varMonto: 12.4, tipo: "F" as const, explicacion: "Nuevo contrato con cliente ancla (Constructora Andes)", accion: "Mantener capacidad de despacho", responsable: "Gerente Comercial", estado: "Cerrado" },
  { item: "Materia prima", varMonto: -8.6, tipo: "U" as const, explicacion: "Alza de precio de insumos +8% interanual", accion: "Negociar contrato de cobertura", responsable: "Abastecimiento", estado: "En curso" },
  { item: "Ventas — Proyectos", varMonto: 6.1, tipo: "F" as const, explicacion: "Mayor demanda en obras menores", accion: "Reforzar dotación de instalación", responsable: "Jefe de Proyectos", estado: "Cerrado" },
  { item: "Gastos de venta", varMonto: -4.3, tipo: "U" as const, explicacion: "Feria comercial no presupuestada", accion: "Evaluar retorno de la inversión", responsable: "Marketing", estado: "Revisión" },
  { item: "Costo de mano de obra directa", varMonto: -3.1, tipo: "U" as const, explicacion: "Horas extra por peak de producción", accion: "Evaluar contratación adicional", responsable: "RR.HH.", estado: "En curso" },
  { item: "Gastos de administración", varMonto: 2.8, tipo: "F" as const, explicacion: "Ahorro en servicios básicos", accion: "Documentar buenas prácticas", responsable: "Administración", estado: "Cerrado" },
  { item: "Gastos financieros", varMonto: 1.2, tipo: "F" as const, explicacion: "Refinanciamiento de deuda a mejor tasa", accion: "-", responsable: "Finanzas", estado: "Cerrado" },
];

/* Balance General (cifras balanceadas, MM CLP) */
const activos = [
  { label: "Efectivo y equivalentes", monto: 113.0, kind: "line" as const },
  { label: "Cuentas por cobrar", monto: 50.6, kind: "line" as const },
  { label: "Existencias", monto: 60.8, kind: "line" as const },
  { label: "Otros activos corrientes", monto: 8.0, kind: "line" as const },
  { label: "Total activos corrientes", monto: 232.4, kind: "subtotal" as const },
  { label: "Propiedad, planta y equipo", monto: 180.0, kind: "line" as const },
  { label: "Intangibles", monto: 25.0, kind: "line" as const },
  { label: "Otros activos no corrientes", monto: 12.6, kind: "line" as const },
  { label: "Total activos no corrientes", monto: 217.6, kind: "subtotal" as const },
  { label: "TOTAL ACTIVOS", monto: 450.0, kind: "total" as const },
];
const pasivosPatrimonio = [
  { label: "Cuentas por pagar", monto: 68.0, kind: "line" as const },
  { label: "Deuda de corto plazo", monto: 20.0, kind: "line" as const },
  { label: "Impuestos por pagar", monto: 9.5, kind: "line" as const },
  { label: "Provisiones y otros pasivos corrientes", monto: 15.0, kind: "line" as const },
  { label: "Total pasivos corrientes", monto: 112.5, kind: "subtotal" as const },
  { label: "Deuda de largo plazo", monto: 85.0, kind: "line" as const },
  { label: "Otros pasivos no corrientes", monto: 12.5, kind: "line" as const },
  { label: "Total pasivos no corrientes", monto: 97.5, kind: "subtotal" as const },
  { label: "Total pasivos", monto: 210.0, kind: "subtotal" as const },
  { label: "Capital social", monto: 150.0, kind: "line" as const },
  { label: "Reservas y otros resultados acumulados", monto: 38.2, kind: "line" as const },
  { label: "Resultado del ejercicio", monto: 51.8, kind: "line" as const },
  { label: "Total patrimonio", monto: 240.0, kind: "subtotal" as const },
  { label: "TOTAL PASIVOS Y PATRIMONIO", monto: 450.0, kind: "total" as const },
];

/* Flujo de caja — método indirecto */
const flujoIndirecto = [
  { label: "Utilidad neta del ejercicio", monto: 51.8, kind: "line" as const },
  { label: "(+) Depreciación y amortización", monto: 12.4, kind: "line" as const },
  { label: "(−) Variación en cuentas por cobrar", monto: -8.2, kind: "line" as const },
  { label: "(−) Variación en existencias", monto: -4.1, kind: "line" as const },
  { label: "(+) Variación en cuentas por pagar", monto: 6.5, kind: "line" as const },
  { label: "Flujo operacional (OCF)", monto: 58.4, kind: "subtotal" as const },
  { label: "(−) CAPEX — adquisición de activos fijos", monto: -22.0, kind: "line" as const },
  { label: "Flujo de inversión (ICF)", monto: -22.0, kind: "subtotal" as const },
  { label: "(−) Pago de deuda", monto: -6.0, kind: "line" as const },
  { label: "(−) Pago de dividendos", monto: -15.0, kind: "line" as const },
  { label: "Flujo de financiamiento (FCF)", monto: -21.0, kind: "subtotal" as const },
  { label: "Variación neta de caja", monto: 15.4, kind: "subtotal" as const },
  { label: "Caja al inicio del período", monto: 97.6, kind: "line" as const },
  { label: "CAJA AL CIERRE DEL PERÍODO", monto: 113.0, kind: "total" as const },
];

/* Cuentas por pagar (AP aging) — espejo de Cobranza */
const carteraPagar = [
  { rango: "Por vencer (0–30 días)", monto: 32.6, status: "good" as const },
  { rango: "31 – 60 días", monto: 18.4, status: "warning" as const },
  { rango: "61 – 90 días", monto: 11.8, status: "serious" as const },
  { rango: "Más de 90 días", monto: 5.2, status: "critical" as const },
];
const dpo = [48, 50, 47, 49, 51, 50, 49, 48, 50, 52, 51, 52];
const proveedoresPago = [
  { prov: "Importadora Química SA", monto: 18.2, prioridad: "P1" as const, motivo: "Insumo crítico — pagar primero" },
  { prov: "Energía y Gas SpA", monto: 5.1, prioridad: "P1" as const, motivo: "Suministro — no se puede atrasar" },
  { prov: "Insumos Industriales", monto: 14.5, prioridad: "P2" as const, motivo: "2% descuento por pronto pago" },
  { prov: "Transportes Rápidos Ltda", monto: 6.4, prioridad: "P2" as const, motivo: "Proveedor estratégico" },
  { prov: "Servicios TI Cloud", monto: 3.2, prioridad: "P3" as const, motivo: "Condiciones flexibles" },
];
const PRIORIDAD_COLOR = { P1: C.critical, P2: C.warning, P3: C.good };

/* CAPEX */
const capex = [
  { proyecto: "Ampliación línea productiva", categoria: "Equipamiento", presupuesto: 45.0, ejecutado: 38.5, estado: "En curso" as const },
  { proyecto: "Actualización ERP", categoria: "TI", presupuesto: 12.0, ejecutado: 12.0, estado: "Completo" as const },
  { proyecto: "Paneles solares — planta", categoria: "Infraestructura", presupuesto: 18.0, ejecutado: 16.8, estado: "Completo" as const },
  { proyecto: "Renovación flota de reparto", categoria: "Equipamiento", presupuesto: 9.0, ejecutado: 4.2, estado: "Retrasado" as const },
  { proyecto: "Laboratorio I+D", categoria: "I+D", presupuesto: 6.0, ejecutado: 3.6, estado: "En curso" as const },
];
const CAPEX_ESTADO_COLOR = { Completo: C.good, "En curso": C.warning, Retrasado: C.critical };

/* Remuneraciones */
const dotacion = [
  { area: "Producción / Operaciones", hc: 48, variacion: 2 },
  { area: "Comercial", hc: 12, variacion: 0 },
  { area: "Logística", hc: 9, variacion: 1 },
  { area: "Administración y Finanzas", hc: 8, variacion: 0 },
  { area: "TI", hc: 4, variacion: 0 },
  { area: "Gerencia", hc: 3, variacion: 0 },
];
const costoNomina = [
  { name: "Sueldos brutos", monto: 42.8 },
  { name: "Leyes sociales / cotizaciones", monto: 8.6 },
  { name: "Bonos y gratificaciones", monto: 5.2 },
  { name: "Otros beneficios", monto: 2.1 },
];

/* Calendario tributario (Chile) */
const calendarioTributario = [
  { obligacion: "IVA (F29) — Julio 2026", vencimiento: "12 ago 2026", monto: 14.8, estado: "Pendiente" as const },
  { obligacion: "PPM (Pago Provisional Mensual)", vencimiento: "12 ago 2026", monto: 3.2, estado: "Pendiente" as const },
  { obligacion: "Cotizaciones previsionales", vencimiento: "13 ago 2026", monto: 8.6, estado: "Pendiente" as const },
  { obligacion: "IVA (F29) — Junio 2026", vencimiento: "12 jul 2026", monto: 13.1, estado: "Pagado" as const },
  { obligacion: "Cotizaciones previsionales — Junio", vencimiento: "13 jul 2026", monto: 8.3, estado: "Pagado" as const },
  { obligacion: "Declaración de Renta (F22) — AT 2026", vencimiento: "30 abr 2026", monto: 0, estado: "Programado" as const },
];
const TAX_ESTADO_COLOR = { Pendiente: C.warning, Pagado: C.good, Programado: C.blue };

/* Hoja de stock */
const stock = [
  { sku: "A-1001", nombre: "Producto A · formato grande", categoria: "Línea Premium A", unidades: 340, costoUnit: 0.0838, dias: 46, estado: "good" as const },
  { sku: "B-2002", nombre: "Componente B · formato chico", categoria: "Kit Instalación Pro", unidades: 128, costoUnit: 0.0412, dias: 18, estado: "warning" as const },
  { sku: "C-3003", nombre: "Insumo C · unidad estándar", categoria: "Línea Estándar B", unidades: 0, costoUnit: 0.1560, dias: 0, estado: "critical" as const },
  { sku: "D-4004", nombre: "Material D · rollo", categoria: "Kit Obra Menor", unidades: 612, costoUnit: 0.0290, dias: 88, estado: "good" as const },
  { sku: "A-1002", nombre: "Producto A · formato mediano", categoria: "Línea Premium A", unidades: 54, costoUnit: 0.0650, dias: 12, estado: "warning" as const },
  { sku: "E-5005", nombre: "Accesorio E · unidad", categoria: "Accesorios varios", unidades: 289, costoUnit: 0.0185, dias: 61, estado: "good" as const },
  { sku: "F-6006", nombre: "Insumo F · saco", categoria: "Línea Económica C", unidades: 22, costoUnit: 0.0210, dias: 8, estado: "critical" as const },
].map((s) => ({ ...s, valor: s.unidades * s.costoUnit }));


/* ────────────────────────────────────────────────────────────────────────
   Primitivos de UI
   ──────────────────────────────────────────────────────────────────────── */
function Card({
  title,
  subtitle,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 ${className}`}>
      {title && <h3 className="text-sm font-bold text-navy">{title}</h3>}
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      {(title || subtitle) && <div className="mt-4" />}
      {children}
    </div>
  );
}

function StatTile({
  label,
  value,
  delta,
  deltaGood,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaGood?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2 leading-tight">
        {label}
      </p>
      <p className="text-xl sm:text-2xl font-semibold text-navy">{value}</p>
      {delta && (
        <p className="text-xs font-semibold mt-1" style={{ color: deltaGood ? C.goodText : C.critical }}>
          {delta}
        </p>
      )}
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

/* Barras verticales — una o dos series por mes */
function BarChart({
  labels,
  a,
  b,
  colorA,
  colorB,
  nameA,
  nameB,
  fmt = (n) => mm(n),
}: {
  labels: string[];
  a: number[];
  b?: number[];
  colorA: string;
  colorB?: string;
  nameA: string;
  nameB?: string;
  fmt?: (n: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 720;
  const h = 260;
  const padL = 40;
  const padB = 26;
  const padT = 12;
  const all = b ? [...a, ...b] : a;
  const max = Math.max(...all) * 1.15;
  const plotW = w - padL - 10;
  const plotH = h - padT - padB;
  const groupW = plotW / labels.length;
  const dual = !!b;
  const barW = Math.min(dual ? 18 : 26, groupW * (dual ? 0.3 : 0.5));
  const gap = 4;
  const ticks = [0, max / 2, max];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label={nameA}>
        {ticks.map((t, i) => {
          const y = padT + plotH - (t / max) * plotH;
          return (
            <g key={i}>
              <line x1={padL} x2={w - 10} y1={y} y2={y} stroke={C.grid} strokeWidth={1} />
              <text x={padL - 6} y={y + 3} fontSize={9} fill={C.muted} textAnchor="end">
                {Math.round(t)}
              </text>
            </g>
          );
        })}
        {labels.map((m, i) => {
          const cx = padL + groupW * i + groupW / 2;
          const hA = (a[i] / max) * plotH;
          const xA = dual ? cx - barW - gap / 2 : cx - barW / 2;
          return (
            <g key={m}>
              <rect x={xA} y={padT + plotH - hA} width={barW} height={hA} rx={4} fill={colorA} opacity={hover === i ? 1 : 0.9} />
              {dual && b && colorB && (
                <rect
                  x={cx + gap / 2}
                  y={padT + plotH - (b[i] / max) * plotH}
                  width={barW}
                  height={(b[i] / max) * plotH}
                  rx={4}
                  fill={colorB}
                  opacity={hover === i ? 1 : 0.9}
                />
              )}
              <rect
                x={cx - groupW / 2}
                y={padT}
                width={groupW}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
              <text x={cx} y={h - 8} fontSize={9} fill={C.muted} textAnchor="middle">
                {m}
              </text>
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div
          className="absolute pointer-events-none rounded-lg bg-navy text-white text-xs px-3 py-2 shadow-lg -translate-x-1/2 -translate-y-full"
          style={{ left: `${((padL + groupW * hover + groupW / 2) / w) * 100}%`, top: "18%" }}
        >
          <p className="font-semibold mb-0.5">{labels[hover]}</p>
          <p>{nameA}: {fmt(a[hover])}</p>
          {b && nameB && <p>{nameB}: {fmt(b[hover])}</p>}
        </div>
      )}
      <Legend
        items={
          dual && nameB && colorB
            ? [{ label: nameA, color: colorA }, { label: nameB, color: colorB }]
            : [{ label: nameA, color: colorA }]
        }
      />
    </div>
  );
}

/* Línea con área */
function LineChart({
  labels,
  values,
  color,
  name,
  fmt = (n) => pct(n),
}: {
  labels: string[];
  values: number[];
  color: string;
  name: string;
  fmt?: (n: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 720;
  const h = 240;
  const padL = 40;
  const padB = 26;
  const padT = 16;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const min = lo - (hi - lo) * 0.25 - 0.5;
  const max = hi + (hi - lo) * 0.2 + 0.5;
  const plotW = w - padL - 10;
  const plotH = h - padT - padB;

  const pts = values.map((v, i) => ({
    x: padL + (plotW / (values.length - 1)) * i,
    y: padT + plotH - ((v - min) / (max - min)) * plotH,
    v,
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1].x} ${padT + plotH} L ${pts[0].x} ${padT + plotH} Z`;
  const ticks = [min, (min + max) / 2, max];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label={name}>
        {ticks.map((t, i) => {
          const y = padT + plotH - ((t - min) / (max - min)) * plotH;
          return (
            <g key={i}>
              <line x1={padL} x2={w - 10} y1={y} y2={y} stroke={C.grid} strokeWidth={1} />
              <text x={padL - 6} y={y + 3} fontSize={9} fill={C.muted} textAnchor="end">
                {t.toFixed(0)}
              </text>
            </g>
          );
        })}
        <path d={area} fill={color} opacity={0.1} />
        <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <g key={i}>
            {(i === pts.length - 1 || hover === i) && (
              <circle cx={p.x} cy={p.y} r={4} fill={color} stroke="#fff" strokeWidth={2} />
            )}
            <rect
              x={p.x - plotW / values.length / 2}
              y={padT}
              width={plotW / values.length}
              height={plotH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
            <text x={p.x} y={h - 8} fontSize={9} fill={C.muted} textAnchor="middle">
              {labels[i]}
            </text>
          </g>
        ))}
      </svg>
      {hover !== null && (
        <div
          className="absolute pointer-events-none rounded-lg bg-navy text-white text-xs px-3 py-2 shadow-lg -translate-x-1/2 -translate-y-full"
          style={{ left: `${(pts[hover].x / w) * 100}%`, top: `${(pts[hover].y / h) * 100}%` }}
        >
          <p className="font-semibold">{labels[hover]}: {fmt(values[hover])}</p>
        </div>
      )}
    </div>
  );
}

/* Barras horizontales (ranking / composición) */
function HBarChart({
  items,
  color,
  fmt = (n) => mm(n),
}: {
  items: { name: string; monto: number }[];
  color: string;
  fmt?: (n: number) => string;
}) {
  const max = Math.max(...items.map((i) => i.monto));
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.name}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-slate-600">{it.name}</span>
            <span className="font-semibold text-navy tabular-nums">{fmt(it.monto)}</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(it.monto / max) * 100}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* Cartera por antigüedad (semáforo) */
const STATUS_COLOR = { good: C.good, warning: C.warning, serious: C.serious, critical: C.critical };
function AgingBars({ rows }: { rows: typeof cartera }) {
  const total = rows.reduce((a, r) => a + r.monto, 0);
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.rango}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-slate-600">{r.rango}</span>
            <span className="font-semibold text-navy tabular-nums">
              {mm(r.monto, 1)} <span className="text-slate-400 font-normal">· {((r.monto / total) * 100).toFixed(0)}%</span>
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(r.monto / total) * 100}%`, background: STATUS_COLOR[r.status] }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* Cascada del estado de resultados */
function Waterfall() {
  const w = 720;
  const h = 300;
  const padL = 40;
  const padB = 64;
  const padT = 20;
  const plotW = w - padL - 10;
  const plotH = h - padT - padB;

  // secuencia real: Ingresos → costos → EBITDA
  const seq = [
    { label: "Ingresos", value: 61.0, kind: "total" as const },
    { label: "Costo de ventas", value: -35.8, kind: "down" as const },
    { label: "Gastos admin.", value: -8.1, kind: "down" as const },
    { label: "Gastos venta", value: -5.9, kind: "down" as const },
    { label: "Otros gastos", value: -1.6, kind: "down" as const },
    { label: "EBITDA", value: 9.6, kind: "total" as const },
  ];
  const max = 65;
  const colW = plotW / seq.length;
  const barW = Math.min(56, colW * 0.6);
  const y = (v: number) => padT + plotH - (v / max) * plotH;

  let running = 0;
  const bars = seq.map((s) => {
    let top: number, bot: number, fill: string;
    if (s.kind === "total") {
      top = s.value;
      bot = 0;
      running = s.value;
      fill = C.navy;
    } else {
      const end = running + s.value;
      top = Math.max(running, end);
      bot = Math.min(running, end);
      running = end;
      fill = "#d8664f";
    }
    return { ...s, top, bot, fill };
  });

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Cascada del estado de resultados">
        {[0, max / 2, max].map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={w - 10} y1={y(t)} y2={y(t)} stroke={C.grid} strokeWidth={1} />
            <text x={padL - 6} y={y(t) + 3} fontSize={9} fill={C.muted} textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        {bars.map((bar, i) => {
          const cx = padL + colW * i + colW / 2;
          const yt = y(bar.top);
          const yb = y(bar.bot);
          return (
            <g key={bar.label}>
              {i > 0 && (
                <line
                  x1={padL + colW * (i - 1) + colW / 2 + barW / 2}
                  x2={cx - barW / 2}
                  y1={y(bars[i - 1].kind === "total" ? bars[i - 1].top : bars[i - 1].bot)}
                  y2={bar.kind === "total" ? yb : yt}
                  stroke={C.axis}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              )}
              <rect x={cx - barW / 2} y={yt} width={barW} height={Math.max(2, yb - yt)} rx={3} fill={bar.fill} />
              <text x={cx} y={yt - 6} fontSize={10} fontWeight={700} fill={C.ink} textAnchor="middle">
                {bar.kind === "total" ? mm(bar.value, 0) : `−${mm(Math.abs(bar.value), 1).replace("$", "")}`}
              </text>
              <text x={cx} y={h - padB + 18} fontSize={9.5} fill={C.ink2} textAnchor="middle">
                {bar.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* Tabla de estado financiero (Balance, Flujo Indirecto): filas línea / subtotal / total */
type StatementRow = { label: string; monto: number; kind: "line" | "subtotal" | "total" };
function StatementTable({ rows }: { rows: StatementRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r, i) => {
            const emphasize = r.kind === "subtotal" || r.kind === "total";
            return (
              <tr key={i} className={`border-b border-slate-100 last:border-0 ${r.kind === "total" ? "bg-navy/5" : emphasize ? "bg-slate-50" : ""}`}>
                <td className={`py-2.5 pr-4 ${emphasize ? "font-bold text-navy" : "text-slate-600"}`}>{r.label}</td>
                <td className={`py-2.5 pl-4 text-right tabular-nums ${emphasize ? "font-bold text-navy" : "text-slate-700"}`}>
                  {r.monto.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Pestañas
   ──────────────────────────────────────────────────────────────────────── */
const TABS = [
  "Resumen",
  "Ventas",
  "Forecast de Ventas",
  "Compras",
  "Flujo de Caja",
  "Cobranza",
  "Cuentas por Pagar",
  "Presupuesto",
  "Estado de Resultados",
  "P&L IFRS",
  "Balance General",
  "Márgenes por Producto",
  "Stock",
  "CAPEX",
  "Remuneraciones",
  "Calendario Tributario",
] as const;
type Tab = (typeof TABS)[number];

export default function DemoDashboard() {
  const [tab, setTab] = useState<Tab>("Resumen");

  const totalCartera = cartera.reduce((a, r) => a + r.monto, 0);
  const carteraVencida = cartera.slice(1).reduce((a, r) => a + r.monto, 0);
  const ventaMes = ventas[ventas.length - 1];
  const ventaPrev = ventas[ventas.length - 2];

  const ventasYTD = ventas.reduce((a, b) => a + b, 0);
  const forecastTotal = forecastVentas.reduce((a, b) => a + b, 0);
  const proyeccionAnual = ventasYTD + forecastTotal;
  const promedioUltimoTrimestre = (ventas[ventas.length - 3] + ventas[ventas.length - 2] + ventas[ventas.length - 1]) / 3;
  const promedioForecast = forecastTotal / forecastVentas.length;
  const crecimientoProyectado = ((promedioForecast - promedioUltimoTrimestre) / promedioUltimoTrimestre) * 100;
  const flujoNetoMes = ingresosCaja[ingresosCaja.length - 1] - egresosCaja[egresosCaja.length - 1];
  const saldoActual = saldoCaja[saldoCaja.length - 1];

  const margenPromedio = productos.reduce((a, p) => a + p.margenPct, 0) / productos.length;
  const mejorProducto = [...productos].sort((a, b) => b.margenPct - a.margenPct)[0];
  const peorProducto = [...productos].sort((a, b) => a.margenPct - b.margenPct)[0];

  const valorInventario = stock.reduce((a, s) => a + s.valor, 0);
  const skuConCobertura = stock.filter((s) => s.estado !== "critical");
  const coberturaPromedio = skuConCobertura.reduce((a, s) => a + s.dias, 0) / skuConCobertura.length;
  const skuMayorValor = [...stock].sort((a, b) => b.valor - a.valor)[0];

  const totalPagar = carteraPagar.reduce((a, r) => a + r.monto, 0);
  const pagarVencido = carteraPagar.slice(1).reduce((a, r) => a + r.monto, 0);
  const proveedoresCriticos = proveedoresPago.filter((p) => p.prioridad === "P1").length;

  const capexPresupuesto = capex.reduce((a, c) => a + c.presupuesto, 0);
  const capexEjecutado = capex.reduce((a, c) => a + c.ejecutado, 0);
  const capexRetrasados = capex.filter((c) => c.estado === "Retrasado").length;

  const totalHC = dotacion.reduce((a, d) => a + d.hc, 0);
  const totalNomina = costoNomina.reduce((a, c) => a + c.monto, 0);

  const proximoVencimiento = calendarioTributario.find((t) => t.estado === "Pendiente");
  const totalPendienteTax = calendarioTributario.filter((t) => t.estado === "Pendiente").reduce((a, t) => a + t.monto, 0);

  return (
    <div>
      {/* Header estilo dashboard */}
      <div className="bg-navy">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 pb-5">
          <p className="text-emerald font-semibold text-xs tracking-wide uppercase mb-1">
            Reporte gerencial mensual
          </p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Empresa Demo SpA</h1>
              <p className="text-slate-300 text-sm mt-0.5">Control financiero integrado · Portal Meliora</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Periodo:</span>
              <span className="rounded-lg bg-white/10 text-white px-3 py-1.5 font-medium">Julio 2026</span>
            </div>
          </div>
        </div>

        {/* Nav de pestañas */}
        <div className="mx-auto max-w-6xl px-2 sm:px-4 lg:px-6">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`whitespace-nowrap px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
                  tab === t ? "bg-[#f4f6f9] text-navy" : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {tab === "Resumen" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile
                label="Ventas del mes"
                value={mm(ventaMes)}
                delta={`${ventaMes >= ventaPrev ? "+" : ""}${(((ventaMes - ventaPrev) / ventaPrev) * 100).toFixed(1)}% vs mes anterior`}
                deltaGood={ventaMes >= ventaPrev}
              />
              <StatTile
                label="Margen EBITDA"
                value={pct(ebitdaMargen[ebitdaMargen.length - 1])}
                delta={`+${(ebitdaMargen[ebitdaMargen.length - 1] - ebitdaMargen[ebitdaMargen.length - 2]).toFixed(1)} pp`}
                deltaGood
              />
              <StatTile label="Flujo de caja neto" value={mm(flujoNetoMes)} delta={`Saldo: ${mm(saldoActual)}`} deltaGood />
              <StatTile
                label="Cobranza vencida"
                value={mm(carteraVencida, 1)}
                delta={`${((carteraVencida / totalCartera) * 100).toFixed(0)}% de la cartera`}
                deltaGood={false}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Ventas reales vs. presupuesto" subtitle="Últimos 12 meses (MM CLP)">
                <BarChart labels={MESES} a={ventas} b={presupuestoVentas} colorA={C.green} colorB={C.blue} nameA="Real" nameB="Presupuesto" />
              </Card>
              <Card title="Evolución del margen EBITDA" subtitle="% sobre ventas">
                <LineChart labels={MESES} values={ebitdaMargen} color={C.green} name="Margen EBITDA" />
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Cartera por cobrar" subtitle="Por antigüedad (MM CLP)">
                <AgingBars rows={cartera} />
              </Card>
              <Card title="Indicadores que requieren atención">
                <Alertas />
              </Card>
            </div>
          </div>
        )}

        {tab === "Ventas" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile label="Ventas del mes" value={mm(ventaMes)} delta={`+${(((ventaMes - ventaPrev) / ventaPrev) * 100).toFixed(1)}%`} deltaGood />
              <StatTile label="Ventas acumuladas 12m" value={mm(ventas.reduce((a, b) => a + b, 0))} />
              <StatTile
                label="Cumplimiento presupuesto"
                value={pct((ventaMes / presupuestoVentas[presupuestoVentas.length - 1]) * 100, 0)}
                delta="Sobre lo presupuestado"
                deltaGood
              />
              <StatTile label="Ticket promedio" value={money(3.4, 1) + " MM"} />
            </div>
            <Card title="Ventas reales vs. presupuesto" subtitle="Últimos 12 meses (MM CLP)">
              <BarChart labels={MESES} a={ventas} b={presupuestoVentas} colorA={C.green} colorB={C.blue} nameA="Real" nameB="Presupuesto" />
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Ventas por línea de negocio" subtitle="Acumulado 12m (MM CLP)">
                <HBarChart items={ventasPorLinea} color={C.blue} />
              </Card>
              <Card title="Principales clientes" subtitle="Acumulado 12m">
                <Table
                  cols={["Cliente", "Ventas", "Part."]}
                  align={["left", "right", "right"]}
                  rows={topClientes.map((c) => [c.cliente, mm(c.monto), pct(c.part, 1)])}
                />
              </Card>
            </div>
          </div>
        )}

        {tab === "Forecast de Ventas" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile label="Ventas YTD (12m)" value={mm(ventasYTD)} />
              <StatTile label="Proyección próximos 6 meses" value={mm(forecastTotal)} />
              <StatTile
                label="Crecimiento proyectado"
                value={pct(crecimientoProyectado, 1)}
                delta="vs. promedio último trimestre"
                deltaGood={crecimientoProyectado >= 0}
              />
              <StatTile
                label="Proyección FY vs. meta"
                value={mm(proyeccionAnual)}
                delta={`Meta: ${mm(metaAnualForecast)}`}
                deltaGood={proyeccionAnual >= metaAnualForecast}
              />
            </div>
            <Card title="Ventas: real (YTD) vs. proyección" subtitle="12 meses reales + 6 meses proyectados (MM CLP)">
              <BarChart labels={mesesForecastChart} a={ventasRealSerie} b={ventasProyeccionSerie} colorA={C.green} colorB={C.violet} nameA="Real" nameB="Proyección" />
              <p className="text-[11px] text-slate-400 mt-3">* Meses proyectados — datos ficticios, no observados aún.</p>
            </Card>
            <Card title="Detalle mensual" subtitle="Real (YTD) y proyección (MM CLP)">
              <Table
                cols={["Mes", "Tipo", "Monto"]}
                align={["left", "left", "right"]}
                rows={[
                  ...MESES.map((m, i) => [m, "Real", mm(ventas[i])]),
                  ...forecastMeses.map((m, i) => [
                    m,
                    <span key={m} className="font-semibold" style={{ color: C.violet }}>
                      Proyección
                    </span>,
                    mm(forecastVentas[i]),
                  ]),
                ]}
              />
            </Card>
          </div>
        )}

        {tab === "Compras" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile label="Compras del mes" value={mm(compras[compras.length - 1])} />
              <StatTile label="Compras acumuladas 12m" value={mm(compras.reduce((a, b) => a + b, 0))} />
              <StatTile
                label="Compras / Ventas"
                value={pct((compras[compras.length - 1] / ventaMes) * 100, 0)}
                delta="Bajo el objetivo de 62%"
                deltaGood
              />
              <StatTile label="Proveedores activos" value="38" />
            </div>
            <Card title="Compras por mes" subtitle="Últimos 12 meses (MM CLP)">
              <BarChart labels={MESES} a={compras} colorA={C.orange} nameA="Compras" />
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Compras por categoría" subtitle="Acumulado 12m (MM CLP)">
                <HBarChart items={comprasPorCategoria} color={C.orange} />
              </Card>
              <Card title="Principales proveedores" subtitle="Acumulado 12m">
                <Table
                  cols={["Proveedor", "Compras", "Pago"]}
                  align={["left", "right", "right"]}
                  rows={topProveedores.map((p) => [p.prov, mm(p.monto), p.cond])}
                />
              </Card>
            </div>
          </div>
        )}

        {tab === "Flujo de Caja" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile label="Ingresos del mes" value={mm(ingresosCaja[ingresosCaja.length - 1])} />
              <StatTile label="Egresos del mes" value={mm(egresosCaja[egresosCaja.length - 1])} />
              <StatTile label="Flujo neto del mes" value={mm(flujoNetoMes)} delta="Positivo" deltaGood />
              <StatTile label="Saldo de caja" value={mm(saldoActual)} delta="Acumulado a Jul" deltaGood />
            </div>
            <Card title="Ingresos vs. egresos de caja" subtitle="Últimos 12 meses (MM CLP)">
              <BarChart labels={MESES} a={ingresosCaja} b={egresosCaja} colorA={C.green} colorB={C.orange} nameA="Ingresos" nameB="Egresos" />
            </Card>
            <Card title="Saldo de caja acumulado" subtitle="MM CLP">
              <LineChart labels={MESES} values={saldoCaja} color={C.blue} name="Saldo de caja" fmt={(n) => mm(n)} />
            </Card>
            <Card title="Estado de flujo de efectivo — método indirecto" subtitle="FY 2026 (MM CLP)">
              <StatementTable rows={flujoIndirecto} />
            </Card>
          </div>
        )}

        {tab === "Cobranza" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile label="Total por cobrar" value={mm(totalCartera, 1)} />
              <StatTile
                label="Cartera vencida"
                value={mm(carteraVencida, 1)}
                delta={`${((carteraVencida / totalCartera) * 100).toFixed(0)}% del total`}
                deltaGood={false}
              />
              <StatTile label="DSO actual" value={days(dso[dso.length - 1])} delta={`${dso[dso.length - 1] - dso[dso.length - 2]} días vs mes ant.`} deltaGood />
              <StatTile label="Mayor a 90 días" value={mm(cartera[3].monto, 1)} delta="Requiere gestión" deltaGood={false} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Cartera por antigüedad" subtitle="MM CLP">
                <AgingBars rows={cartera} />
              </Card>
              <Card title="Días de venta pendientes (DSO)" subtitle="Evolución en días">
                <LineChart labels={MESES} values={dso} color={C.blue} name="DSO" fmt={(n) => days(n)} />
              </Card>
            </div>
            <Card title="Principales deudores" subtitle="Saldo pendiente">
              <Table
                cols={["Cliente", "Saldo", "Días", "Estado"]}
                align={["left", "right", "right", "left"]}
                rows={topDeudores.map((d) => [d.cliente, mm(d.monto, 1), String(d.dias), <StatusBadge key={d.cliente} status={d.status} />])}
              />
            </Card>
          </div>
        )}

        {tab === "Cuentas por Pagar" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile label="Total por pagar" value={mm(totalPagar, 1)} />
              <StatTile
                label="Por pagar vencido"
                value={mm(pagarVencido, 1)}
                delta={`${((pagarVencido / totalPagar) * 100).toFixed(0)}% del total`}
                deltaGood={false}
              />
              <StatTile label="DPO actual" value={days(dpo[dpo.length - 1])} delta={`${dpo[dpo.length - 1] - dpo[dpo.length - 2]} días vs mes ant.`} deltaGood />
              <StatTile label="Proveedores críticos (P1)" value={String(proveedoresCriticos)} delta="No se pueden atrasar" deltaGood={false} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Cuentas por pagar por antigüedad" subtitle="MM CLP">
                <AgingBars rows={carteraPagar} />
              </Card>
              <Card title="Días de pago a proveedores (DPO)" subtitle="Evolución en días">
                <LineChart labels={MESES} values={dpo} color={C.orange} name="DPO" fmt={(n) => days(n)} />
              </Card>
            </div>
            <Card title="Prioridad de pago a proveedores" subtitle="Saldo pendiente">
              <Table
                cols={["Proveedor", "Saldo", "Prioridad", "Motivo"]}
                align={["left", "right", "left", "left"]}
                rows={proveedoresPago.map((p) => [
                  p.prov,
                  mm(p.monto, 1),
                  <span key={p.prov} className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: PRIORIDAD_COLOR[p.prioridad] }}>
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: PRIORIDAD_COLOR[p.prioridad] }} />
                    {p.prioridad}
                  </span>,
                  p.motivo,
                ])}
              />
            </Card>
          </div>
        )}

        {tab === "Presupuesto" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile label="Ingresos vs. presupuesto" value={mm(61)} delta="+10.9% vs presup." deltaGood />
              <StatTile label="EBITDA vs. presupuesto" value={mm(9.6, 1)} delta="+37.1% vs presup." deltaGood />
              <StatTile label="Variaciones favorables" value={String(topVariaciones.filter((v) => v.tipo === "F").length)} deltaGood />
              <StatTile label="Variaciones desfavorables" value={String(topVariaciones.filter((v) => v.tipo === "U").length)} deltaGood={false} />
            </div>
            <Card title="Estado de resultados · presupuesto vs. real" subtitle="Julio 2026 (MM CLP)">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-200">
                      <th className="py-2 pr-4 font-semibold">Concepto</th>
                      <th className="py-2 px-4 font-semibold text-right">Presupuesto</th>
                      <th className="py-2 px-4 font-semibold text-right">Real</th>
                      <th className="py-2 pl-4 font-semibold text-right">Variación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eerr.map((r) => {
                      const delta = ((r.real - r.pres) / Math.abs(r.pres)) * 100;
                      const isCost = r.kind === "cost";
                      const good = isCost ? r.real >= r.pres : r.real >= r.pres;
                      const emphasize = r.kind === "total" || r.kind === "sub";
                      return (
                        <tr key={r.label} className={`border-b border-slate-100 last:border-0 ${emphasize ? "bg-slate-50" : ""}`}>
                          <td className={`py-2.5 pr-4 ${emphasize ? "font-bold text-navy" : "font-medium text-slate-600"}`}>{r.label}</td>
                          <td className="py-2.5 px-4 text-right text-slate-500 tabular-nums">{r.pres.toFixed(1)}</td>
                          <td className={`py-2.5 px-4 text-right tabular-nums ${emphasize ? "font-bold text-navy" : "font-semibold text-navy"}`}>
                            {r.real.toFixed(1)}
                          </td>
                          <td className="py-2.5 pl-4 text-right font-semibold tabular-nums" style={{ color: good ? C.goodText : C.critical }}>
                            {delta > 0 ? "+" : ""}
                            {delta.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {tab === "Estado de Resultados" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile label="Ingresos" value={mm(61)} delta="+10.9% vs presup." deltaGood />
              <StatTile label="Margen bruto" value={pct(41.3)} delta={mm(25.2, 1)} deltaGood />
              <StatTile label="EBITDA" value={mm(9.6, 1)} delta="+37% vs presup." deltaGood />
              <StatTile label="Margen EBITDA" value={pct(15.8)} delta="+2.9 pp vs presup." deltaGood />
            </div>
            <Card title="Cascada del resultado" subtitle="De ingresos a EBITDA · mes de Julio (MM CLP)">
              <Waterfall />
            </Card>
            <p className="text-xs text-slate-400 text-center">
              ¿Buscas el detalle de presupuesto vs. real? Revisa la pestaña <span className="font-semibold">Presupuesto</span>.
            </p>
          </div>
        )}

        {tab === "Márgenes por Producto" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile label="Margen promedio" value={pct(margenPromedio)} />
              <StatTile label="Producto más rentable" value={mejorProducto.nombre} delta={pct(mejorProducto.margenPct)} deltaGood />
              <StatTile label="Producto menos rentable" value={peorProducto.nombre} delta={pct(peorProducto.margenPct)} deltaGood={false} />
              <StatTile label="SKUs con margen bajo 25%" value={String(productos.filter((p) => p.margenPct < 25).length)} />
            </div>
            <Card title="Margen por producto" subtitle="Acumulado 12 meses · ordenado por margen %">
              <HBarChart
                items={[...productos].sort((a, b) => b.margenPct - a.margenPct).map((p) => ({ name: p.nombre, monto: p.margenPct }))}
                color={C.green}
                fmt={(n) => pct(n)}
              />
            </Card>
            <Card title="Detalle por producto" subtitle="Acumulado 12 meses (MM CLP)">
              <Table
                cols={["Producto", "Categoría", "Ventas", "Costo", "Margen", "Margen %"]}
                align={["left", "left", "right", "right", "right", "right"]}
                rows={[...productos]
                  .sort((a, b) => b.margen - a.margen)
                  .map((p) => [
                    p.nombre,
                    p.categoria,
                    mm(p.ventas, 1),
                    mm(p.costo, 1),
                    mm(p.margen, 1),
                    <span key={p.nombre} style={{ color: p.margenPct >= 30 ? C.goodText : p.margenPct >= 20 ? C.ink2 : C.critical }} className="font-semibold">
                      {pct(p.margenPct)}
                    </span>,
                  ])}
              />
            </Card>
          </div>
        )}

        {tab === "P&L IFRS" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile label="Ingresos ordinarios" value={mm(595.0)} delta="+16.1% vs año anterior" deltaGood />
              <StatTile label="Ganancia bruta" value={mm(226.9)} delta={pct((226.9 / 595.0) * 100) + " margen"} deltaGood />
              <StatTile label="Resultado operacional" value={mm(82.5)} delta="+43.2% vs año anterior" deltaGood />
              <StatTile label="Ganancia del período" value={mm(51.8)} delta="+53.7% vs año anterior" deltaGood />
            </div>
            <Card
              title="Estado de Resultados por Función"
              subtitle="Presentación IFRS (NIC 1) · Ejercicio terminado el 31 de julio de 2026, comparativo (cifras en MM CLP)"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-200">
                      <th className="py-2 pr-4 font-semibold">Concepto</th>
                      <th className="py-2 px-4 font-semibold text-right">Jul 2026</th>
                      <th className="py-2 pl-4 font-semibold text-right">Jul 2025</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pnlIfrs.map((r, i) => {
                      const emphasize = r.kind === "subtotal" || r.kind === "total";
                      return (
                        <tr
                          key={i}
                          className={`border-b border-slate-100 last:border-0 ${
                            r.kind === "total" ? "bg-navy/5" : emphasize ? "bg-slate-50" : ""
                          }`}
                        >
                          <td className={`py-2.5 pr-4 ${emphasize ? "font-bold text-navy" : "text-slate-600"}`}>{r.label}</td>
                          <td className={`py-2.5 px-4 text-right tabular-nums ${emphasize ? "font-bold text-navy" : "text-slate-700"}`}>
                            {r.actual!.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                          </td>
                          <td className="py-2.5 pl-4 text-right tabular-nums text-slate-400">
                            {r.anterior!.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
                Formato ilustrativo bajo Normas Internacionales de Información Financiera (NIIF/IFRS), método de función de gasto (NIC 1.99).
                Meliora Advisory elabora los Estados Financieros bajo esta u otra normativa según lo que aplique a tu empresa.
              </p>
            </Card>
          </div>
        )}

        {tab === "Balance General" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile label="Total activos" value={mm(450.0)} />
              <StatTile label="Total pasivos" value={mm(210.0)} />
              <StatTile label="Total patrimonio" value={mm(240.0)} />
              <StatTile label="Razón corriente" value={(232.4 / 112.5).toFixed(2) + "x"} delta="Activos ctes. / Pasivos ctes." deltaGood />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Activos" subtitle="Al cierre de julio 2026 (MM CLP)">
                <StatementTable rows={activos} />
              </Card>
              <Card title="Pasivos y patrimonio" subtitle="Al cierre de julio 2026 (MM CLP)">
                <StatementTable rows={pasivosPatrimonio} />
              </Card>
            </div>
            <p className="text-xs text-slate-400 text-center">
              ✓ Balanceado: Total activos ($450,0 MM) = Total pasivos y patrimonio ($450,0 MM)
            </p>
          </div>
        )}

        {tab === "Stock" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile label="Valor total inventario" value={mm(valorInventario, 1)} />
              <StatTile label="SKUs en quiebre" value={String(stock.filter((s) => s.estado === "critical").length)} delta="Requieren reposición" deltaGood={false} />
              <StatTile label="Cobertura promedio" value={days(coberturaPromedio)} />
              <StatTile label="SKU de mayor valor" value={skuMayorValor.sku} delta={mm(skuMayorValor.valor, 1)} deltaGood />
            </div>
            <Card title="Stock por SKU" subtitle="Unidades, valorización y cobertura estimada">
              <Table
                cols={["SKU", "Producto", "Categoría", "Unidades", "Valor", "Cobertura", "Estado"]}
                align={["left", "left", "left", "right", "right", "right", "left"]}
                rows={stock.map((s) => [
                  s.sku,
                  s.nombre,
                  s.categoria,
                  s.unidades.toLocaleString("es-CL"),
                  mm(s.valor, 1),
                  s.estado === "critical" ? "—" : days(s.dias),
                  <StatusBadge key={s.sku} status={s.estado} />,
                ])}
              />
            </Card>
            <Card title="Valor de inventario por producto" subtitle="MM CLP">
              <HBarChart items={[...stock].sort((a, b) => b.valor - a.valor).map((s) => ({ name: s.nombre, monto: s.valor }))} color={C.blue} fmt={(n) => mm(n, 1)} />
            </Card>
          </div>
        )}

        {tab === "CAPEX" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile label="Presupuesto CAPEX anual" value={mm(capexPresupuesto)} />
              <StatTile label="Ejecutado YTD" value={mm(capexEjecutado)} delta={pct((capexEjecutado / capexPresupuesto) * 100, 0) + " del presupuesto"} deltaGood />
              <StatTile label="Por ejecutar" value={mm(capexPresupuesto - capexEjecutado)} />
              <StatTile label="Proyectos retrasados" value={String(capexRetrasados)} delta="Requieren seguimiento" deltaGood={capexRetrasados === 0} />
            </div>
            <Card title="Registro CAPEX" subtitle="Presupuesto vs. ejecutado por proyecto (MM CLP)">
              <Table
                cols={["Proyecto", "Categoría", "Presupuesto", "Ejecutado", "% Avance", "Estado"]}
                align={["left", "left", "right", "right", "right", "left"]}
                rows={capex.map((c) => [
                  c.proyecto,
                  c.categoria,
                  mm(c.presupuesto, 1),
                  mm(c.ejecutado, 1),
                  pct((c.ejecutado / c.presupuesto) * 100, 0),
                  <span key={c.proyecto} className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: CAPEX_ESTADO_COLOR[c.estado] }}>
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: CAPEX_ESTADO_COLOR[c.estado] }} />
                    {c.estado}
                  </span>,
                ])}
              />
            </Card>
            <Card title="Ejecución por categoría" subtitle="MM CLP">
              <HBarChart
                items={Object.values(
                  capex.reduce((acc: Record<string, { name: string; monto: number }>, c) => {
                    acc[c.categoria] = acc[c.categoria] || { name: c.categoria, monto: 0 };
                    acc[c.categoria].monto += c.ejecutado;
                    return acc;
                  }, {})
                )}
                color={C.violet}
                fmt={(n) => mm(n, 1)}
              />
            </Card>
          </div>
        )}

        {tab === "Remuneraciones" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile label="Dotación total" value={`${totalHC} personas`} delta={`+${dotacion.reduce((a, d) => a + d.variacion, 0)} vs mes anterior`} deltaGood />
              <StatTile label="Costo nómina del mes" value={mm(totalNomina, 1)} />
              <StatTile label="Costo promedio / persona" value={money((totalNomina / totalHC) * 1000, 0) + " mil"} />
              <StatTile label="Rotación anual" value={pct(7.8)} delta="Bajo el promedio de la industria" deltaGood />
            </div>
            <Card title="Dotación por área" subtitle="Headcount de julio 2026">
              <Table
                cols={["Área", "Dotación", "Variación mensual"]}
                align={["left", "right", "right"]}
                rows={dotacion.map((d) => [
                  d.area,
                  String(d.hc),
                  <span key={d.area} style={{ color: d.variacion > 0 ? C.goodText : C.ink2 }} className="font-semibold">
                    {d.variacion > 0 ? "+" : ""}
                    {d.variacion}
                  </span>,
                ])}
              />
            </Card>
            <Card title="Costo de nómina por ítem" subtitle="MM CLP">
              <HBarChart items={costoNomina} color={C.magenta} />
            </Card>
          </div>
        )}

        {tab === "Calendario Tributario" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile label="Próximo vencimiento" value={proximoVencimiento?.vencimiento ?? "—"} delta={proximoVencimiento?.obligacion} deltaGood={false} />
              <StatTile label="Total pendiente de pago" value={mm(totalPendienteTax, 1)} />
              <StatTile label="IVA del mes (F29)" value={mm(14.8, 1)} />
              <StatTile label="Cotizaciones del mes" value={mm(8.6, 1)} />
            </div>
            <Card title="Calendario de obligaciones tributarias" subtitle="IVA, PPM, cotizaciones y Renta">
              <Table
                cols={["Obligación", "Vencimiento", "Monto", "Estado"]}
                align={["left", "left", "right", "left"]}
                rows={calendarioTributario.map((t) => [
                  t.obligacion,
                  t.vencimiento,
                  t.monto > 0 ? mm(t.monto, 1) : "—",
                  <span key={t.obligacion} className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: TAX_ESTADO_COLOR[t.estado] }}>
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: TAX_ESTADO_COLOR[t.estado] }} />
                    {t.estado}
                  </span>,
                ])}
              />
            </Card>
            <p className="text-[11px] text-slate-400 text-center">
              Calendario ilustrativo con obligaciones tributarias chilenas (IVA/F29, PPM, cotizaciones previsionales y Declaración de Renta/F22).
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 rounded-2xl bg-navy p-6 sm:p-8 text-center">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
            Esto es solo un ejemplo — el tuyo se arma con tus propios datos
          </h2>
          <p className="text-slate-300 max-w-lg mx-auto mb-5 text-sm">
            Conversemos sobre qué indicadores le faltan hoy a tu empresa y cómo se vería tu reporte gerencial mensual.
          </p>
          <a
            href="https://melioraadvisory.cl/contacto/"
            className="inline-flex items-center justify-center rounded-lg bg-emerald px-7 py-3 text-sm font-semibold text-white hover:bg-emerald-dark transition-colors"
          >
            Agendar reunión gratuita
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Piezas auxiliares ─────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: keyof typeof STATUS_COLOR }) {
  const label = { good: "Al día", warning: "Atención", serious: "Riesgo", critical: "Crítico" }[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: STATUS_COLOR[status] }}>
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[status] }} />
      {label}
    </span>
  );
}

const alertas = [
  { status: "critical" as const, texto: "3 clientes concentran el 62% de la cartera vencida a más de 90 días." },
  { status: "warning" as const, texto: "El gasto de venta superó el presupuesto en 4 de los últimos 6 meses." },
  { status: "good" as const, texto: "El margen EBITDA subió 4.6 puntos porcentuales respecto al semestre anterior." },
];
function Alertas() {
  const labels = { good: "Positivo", warning: "Atención", serious: "Riesgo", critical: "Crítico" };
  return (
    <ul className="space-y-3">
      {alertas.map((a, i) => (
        <li key={i} className="flex items-start gap-3">
          <span
            className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold shrink-0"
            style={{ background: STATUS_COLOR[a.status] }}
            aria-hidden="true"
          >
            {a.status === "good" ? "✓" : "!"}
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: STATUS_COLOR[a.status] }}>
              {labels[a.status]}
            </p>
            <p className="text-sm text-slate-600">{a.texto}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Table({
  cols,
  rows,
  align,
}: {
  cols: string[];
  rows: React.ReactNode[][];
  align: ("left" | "right")[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-200">
            {cols.map((c, i) => (
              <th
                key={c}
                className={`py-2 px-3 first:pl-0 last:pr-0 font-semibold ${align[i] === "right" ? "text-right" : "text-left"}`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-b border-slate-100 last:border-0">
              {r.map((cell, ci) => (
                <td
                  key={ci}
                  className={`py-2.5 px-3 first:pl-0 last:pr-0 tabular-nums ${align[ci] === "right" ? "text-right" : "text-left"} ${
                    ci === 0 ? "font-medium text-navy" : "text-slate-600"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
