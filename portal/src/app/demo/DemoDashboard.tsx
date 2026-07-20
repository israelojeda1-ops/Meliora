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

/* ────────────────────────────────────────────────────────────────────────
   Pestañas
   ──────────────────────────────────────────────────────────────────────── */
const TABS = ["Resumen", "Ventas", "Compras", "Flujo de Caja", "Cobranza", "Estado de Resultados"] as const;
type Tab = (typeof TABS)[number];

export default function DemoDashboard() {
  const [tab, setTab] = useState<Tab>("Resumen");

  const totalCartera = cartera.reduce((a, r) => a + r.monto, 0);
  const carteraVencida = cartera.slice(1).reduce((a, r) => a + r.monto, 0);
  const ventaMes = ventas[ventas.length - 1];
  const ventaPrev = ventas[ventas.length - 2];
  const flujoNetoMes = ingresosCaja[ingresosCaja.length - 1] - egresosCaja[egresosCaja.length - 1];
  const saldoActual = saldoCaja[saldoCaja.length - 1];

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
