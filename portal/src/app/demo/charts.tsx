"use client";

/* Gráficos SVG del dashboard demo: barras, líneas, forecast, ranking,
   antigüedad y cascada. Reglas dataviz: un eje, ticks redondos, tooltips
   en todo chart, legend para 2+ series, labels en tinta (nunca color de serie). */
import { useId, useState } from "react";
import { C, STATUS_COLOR, mm, type Estado } from "./data";
import { Legend } from "./ui";

/* Ticks redondos 1/2/5 */
export function niceTicks(max: number, count = 4): number[] {
  const rough = max / count;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag;
  const ticks: number[] = [];
  for (let t = 0; t <= max + step * 0.001; t += step) ticks.push(t);
  return ticks;
}

function ChartTip({
  xPct,
  yPct,
  children,
}: {
  xPct: number;
  yPct: number;
  children: React.ReactNode;
}) {
  const left = Math.min(88, Math.max(12, xPct));
  return (
    <div
      className="absolute z-10 pointer-events-none rounded-lg bg-navy/95 text-white text-xs px-3 py-2 shadow-xl ring-1 ring-white/10 -translate-x-1/2 -translate-y-full whitespace-nowrap"
      style={{ left: `${left}%`, top: `${Math.max(10, yPct)}%` }}
    >
      {children}
    </div>
  );
}

const Swatch = ({ color }: { color: string }) => (
  <span className="inline-block h-2 w-2 rounded-sm mr-1.5" style={{ background: color }} />
);

/* ── Barras verticales, 1 o 2 series ──────────────────────────────────── */
export function BarChart({
  labels,
  a,
  b,
  colorA,
  colorB,
  nameA,
  nameB,
  fmt = (n) => mm(n),
  highlight,
  gapNote,
}: {
  labels: string[];
  a: number[];
  b?: number[];
  colorA: string;
  colorB?: string;
  nameA: string;
  nameB?: string;
  fmt?: (n: number) => string;
  highlight?: number;
  gapNote?: (i: number) => string | null;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 720;
  const h = 260;
  const padL = 40;
  const padB = 26;
  const padT = 16;
  const all = b ? [...a, ...b] : a;
  const ticks = niceTicks(Math.max(...all) * 1.1);
  const max = ticks[ticks.length - 1];
  const plotW = w - padL - 10;
  const plotH = h - padT - padB;
  const groupW = plotW / labels.length;
  const dual = !!b;
  const barW = Math.min(dual ? 16 : 22, groupW * (dual ? 0.28 : 0.45));
  const gap = 2;
  const yOf = (v: number) => padT + plotH - (v / max) * plotH;
  const bar = (x: number, v: number, fill: string, dim: boolean) => {
    const y = yOf(v);
    const bh = Math.max(0, padT + plotH - y);
    if (bh <= 0) return null;
    const r = Math.min(4, bh);
    return (
      <path
        d={`M ${x} ${padT + plotH} v ${-(bh - r)} q 0 ${-r} ${r} ${-r} h ${barW - 2 * r} q ${r} 0 ${r} ${r} v ${bh - r} z`}
        fill={fill}
        opacity={dim ? 0.45 : 1}
      />
    );
  };

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label={nameA}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={w - 10} y1={yOf(t)} y2={yOf(t)} stroke={C.grid} strokeWidth={1} />
            <text x={padL - 6} y={yOf(t) + 3} fontSize={10} fill="#64748b" textAnchor="end">
              {t.toLocaleString("es-CL")}
            </text>
          </g>
        ))}
        {labels.map((m, i) => {
          const cx = padL + groupW * i + groupW / 2;
          const xA = dual ? cx - barW - gap / 2 : cx - barW / 2;
          const dim = highlight !== undefined && i !== highlight && hover === null ? true : false;
          return (
            <g key={`${m}-${i}`}>
              <rect
                x={cx - groupW / 2}
                y={padT}
                width={groupW}
                height={plotH}
                fill="#0f172a"
                opacity={hover === i ? 0.04 : 0}
              />
              {bar(xA, a[i], colorA, dim)}
              {dual && b && colorB && bar(cx + gap / 2, b[i], colorB, dim)}
              {highlight === i && (
                <text x={dual ? cx - barW / 2 - gap / 2 : cx} y={yOf(a[i]) - 5} fontSize={10} fontWeight={700} fill={C.ink} textAnchor="middle">
                  {fmt(a[i])}
                </text>
              )}
              <rect
                x={cx - groupW / 2}
                y={padT}
                width={groupW}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setHover((hv) => (hv === i ? null : i))}
              />
              <text
                x={cx}
                y={h - 8}
                fontSize={9.5}
                fontWeight={highlight === i ? 700 : 400}
                fill={highlight === i ? C.ink : "#64748b"}
                textAnchor="middle"
              >
                {m}
              </text>
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <ChartTip xPct={((padL + groupW * hover + groupW / 2) / w) * 100} yPct={20}>
          <p className="font-semibold mb-0.5">{labels[hover]}</p>
          <p>
            <Swatch color={colorA} />
            {nameA}: <span className="font-semibold">{fmt(a[hover])}</span>
          </p>
          {b && nameB && colorB && (
            <p>
              <Swatch color={colorB} />
              {nameB}: <span className="font-semibold">{fmt(b[hover])}</span>
            </p>
          )}
          {gapNote && gapNote(hover) && <p className="text-slate-300 mt-0.5">{gapNote(hover)}</p>}
        </ChartTip>
      )}
      <Legend
        className="mt-3"
        items={
          dual && nameB && colorB
            ? [
                { label: nameA, color: colorA },
                { label: nameB, color: colorB },
              ]
            : [{ label: nameA, color: colorA }]
        }
      />
    </div>
  );
}

/* ── Línea con área en gradiente, crosshair y meta opcional ───────────── */
export function LineChart({
  labels,
  values,
  color,
  name,
  fmt = (n) => `${n}`,
  target,
  highlight,
}: {
  labels: string[];
  values: number[];
  color: string;
  name: string;
  fmt?: (n: number) => string;
  target?: { value: number; label: string };
  highlight?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const gradId = useId();
  const w = 720;
  const h = 240;
  const padL = 40;
  const padB = 26;
  const padT = 16;
  const lo = Math.min(...values, target ? target.value : Infinity);
  const hi = Math.max(...values, target ? target.value : -Infinity);
  const min = lo - (hi - lo) * 0.25 - 0.5;
  const max = hi + (hi - lo) * 0.2 + 0.5;
  const plotW = w - padL - 10;
  const plotH = h - padT - padB;

  const pts = values.map((v, i) => ({
    x: padL + (plotW / Math.max(1, values.length - 1)) * i,
    y: padT + plotH - ((v - min) / (max - min)) * plotH,
    v,
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1].x} ${padT + plotH} L ${pts[0].x} ${padT + plotH} Z`;
  const ticks = [min, (min + max) / 2, max];
  const yTarget = target ? padT + plotH - ((target.value - min) / (max - min)) * plotH : 0;
  const last = pts[pts.length - 1];
  const focus = hover ?? highlight;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label={name}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => {
          const y = padT + plotH - ((t - min) / (max - min)) * plotH;
          return (
            <g key={i}>
              <line x1={padL} x2={w - 10} y1={y} y2={y} stroke={C.grid} strokeWidth={1} />
              <text x={padL - 6} y={y + 3} fontSize={10} fill="#64748b" textAnchor="end">
                {t.toFixed(0)}
              </text>
            </g>
          );
        })}
        {target && (
          <g>
            <line x1={padL} x2={w - 10} y1={yTarget} y2={yTarget} stroke={C.axis} strokeWidth={1.5} strokeDasharray="4 4" />
            <text x={w - 12} y={yTarget - 5} fontSize={9} fill={C.ink2} textAnchor="end">
              {target.label}
            </text>
          </g>
        )}
        <path d={area} fill={`url(#${gradId})`} />
        <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {focus !== undefined && focus !== null && pts[focus] && (
          <line
            x1={pts[focus].x}
            x2={pts[focus].x}
            y1={padT}
            y2={padT + plotH}
            stroke="#cbd5e1"
            strokeDasharray="2 3"
          />
        )}
        {pts.map((p, i) => (
          <g key={i}>
            {(i === pts.length - 1 || focus === i) && (
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
              onClick={() => setHover((hv) => (hv === i ? null : i))}
            />
            <text
              x={p.x}
              y={h - 8}
              fontSize={9.5}
              fontWeight={highlight === i ? 700 : 400}
              fill={highlight === i ? C.ink : "#64748b"}
              textAnchor="middle"
            >
              {labels[i]}
            </text>
          </g>
        ))}
        <text
          x={last.x - 8 > w - 60 ? last.x - 8 : last.x + 8}
          y={last.y + 3}
          fontSize={10}
          fontWeight={600}
          fill={C.ink}
          textAnchor={last.x - 8 > w - 60 ? "end" : "start"}
        >
          {fmt(values[values.length - 1])}
        </text>
      </svg>
      {hover !== null && (
        <ChartTip xPct={(pts[hover].x / w) * 100} yPct={(pts[hover].y / h) * 100}>
          <p className="font-semibold">
            {labels[hover]}: {fmt(values[hover])}
          </p>
        </ChartTip>
      )}
    </div>
  );
}

/* ── Forecast: una serie continua, proyección con hatch ───────────────── */
export function ForecastChart({
  labels,
  values,
  splitIndex,
  fmt = (n) => mm(n),
}: {
  labels: string[];
  values: number[];
  splitIndex: number;
  fmt?: (n: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const patId = useId();
  const w = 720;
  const h = 260;
  const padL = 40;
  const padB = 26;
  const padT = 16;
  const ticks = niceTicks(Math.max(...values) * 1.1);
  const max = ticks[ticks.length - 1];
  const plotW = w - padL - 10;
  const plotH = h - padT - padB;
  const groupW = plotW / labels.length;
  const barW = Math.min(20, groupW * 0.55);
  const yOf = (v: number) => padT + plotH - (v / max) * plotH;
  const xSplit = padL + groupW * splitIndex;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Ventas reales y proyectadas">
        <defs>
          <pattern id={patId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill={C.green} opacity="0.25" />
            <line x1="0" y1="0" x2="0" y2="6" stroke={C.green} strokeWidth="1.5" />
          </pattern>
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={w - 10} y1={yOf(t)} y2={yOf(t)} stroke={C.grid} strokeWidth={1} />
            <text x={padL - 6} y={yOf(t) + 3} fontSize={10} fill="#64748b" textAnchor="end">
              {t.toLocaleString("es-CL")}
            </text>
          </g>
        ))}
        <line x1={xSplit} x2={xSplit} y1={padT} y2={padT + plotH} stroke={C.axis} strokeDasharray="4 4" />
        <text x={xSplit + 6} y={padT + 10} fontSize={9} fill={C.ink2}>
          Proyección
        </text>
        {labels.map((m, i) => {
          const cx = padL + groupW * i + groupW / 2;
          const v = values[i];
          const y = yOf(v);
          const bh = Math.max(0, padT + plotH - y);
          const r = Math.min(4, bh);
          const proyectado = i >= splitIndex;
          return (
            <g key={`${m}-${i}`}>
              <rect x={cx - groupW / 2} y={padT} width={groupW} height={plotH} fill="#0f172a" opacity={hover === i ? 0.04 : 0} />
              <path
                d={`M ${cx - barW / 2} ${padT + plotH} v ${-(bh - r)} q 0 ${-r} ${r} ${-r} h ${barW - 2 * r} q ${r} 0 ${r} ${r} v ${bh - r} z`}
                fill={proyectado ? `url(#${patId})` : C.green}
              />
              <rect
                x={cx - groupW / 2}
                y={padT}
                width={groupW}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setHover((hv) => (hv === i ? null : i))}
              />
              <text x={cx} y={h - 8} fontSize={9} fill="#64748b" textAnchor="middle">
                {m}
              </text>
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <ChartTip xPct={((padL + groupW * hover + groupW / 2) / w) * 100} yPct={20}>
          <p className="font-semibold mb-0.5">{labels[hover]}</p>
          <p>
            {hover >= splitIndex ? "Proyección" : "Real"}: <span className="font-semibold">{fmt(values[hover])}</span>
          </p>
        </ChartTip>
      )}
      <Legend
        className="mt-3"
        items={[
          { label: "Real", color: C.green },
          {
            label: "Proyección",
            swatch: (
              <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 mr-0" aria-hidden="true">
                <rect width="10" height="10" fill={C.green} opacity="0.25" rx="2" />
                <line x1="2" y1="10" x2="10" y2="2" stroke={C.green} strokeWidth="1.5" />
                <line x1="-2" y1="6" x2="6" y2="-2" stroke={C.green} strokeWidth="1.5" />
              </svg>
            ),
          },
        ]}
      />
    </div>
  );
}

/* ── Barras horizontales (ranking / composición) ──────────────────────── */
export function HBarChart({
  items,
  color,
  fmt = (n) => mm(n),
  selected,
  onSelect,
}: {
  items: { name: string; monto: number }[];
  color: string;
  fmt?: (n: number) => string;
  selected?: string | null;
  onSelect?: (name: string | null) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(...items.map((i) => i.monto), 0.001);
  const total = items.reduce((a, i) => a + i.monto, 0);
  return (
    <div className="space-y-3">
      {items.map((it) => {
        const dimmed = selected != null && selected !== it.name;
        const row = (
          <div className={`transition-opacity ${dimmed ? "opacity-40" : ""}`}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`font-medium ${selected === it.name ? "text-navy font-semibold" : "text-slate-600"}`}>
                {it.name}
              </span>
              <span className="font-semibold text-navy tabular-nums">{fmt(it.monto)}</span>
            </div>
            <div className="relative h-2.5 rounded-full bg-slate-100 overflow-hidden group-hover:bg-slate-200/70 transition-colors">
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-out"
                style={{ width: `${(it.monto / max) * 100}%`, background: color }}
              />
            </div>
          </div>
        );
        return (
          <div
            key={it.name}
            className="relative group"
            onMouseEnter={() => setHover(it.name)}
            onMouseLeave={() => setHover(null)}
          >
            {onSelect ? (
              <button
                type="button"
                aria-pressed={selected === it.name}
                onClick={() => onSelect(selected === it.name ? null : it.name)}
                className="w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded"
              >
                {row}
              </button>
            ) : (
              row
            )}
            {hover === it.name && (
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-lg bg-navy/95 text-white text-[11px] px-2.5 py-1.5 z-20 shadow-xl">
                {it.name}: {fmt(it.monto)} · {((it.monto / total) * 100).toFixed(0)}% del total
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Cartera por antigüedad ───────────────────────────────────────────── */
type AgingRow = { rango: string; monto: number; status: Estado };

export function AgingBars({
  rows,
  selected,
  onSelect,
}: {
  rows: AgingRow[];
  selected?: Estado | "all";
  onSelect?: (s: Estado | "all") => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const total = rows.reduce((a, r) => a + r.monto, 0);
  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden mb-5" role="img" aria-label="Composición de la cartera por antigüedad">
        {rows.map((r) => (
          <div
            key={r.rango}
            className="h-full relative"
            style={{ width: `${(r.monto / total) * 100}%`, background: STATUS_COLOR[r.status] }}
          >
            <span className="absolute inset-y-0 right-0 w-0.5 bg-white" aria-hidden="true" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {rows.map((r) => {
          const dimmed = selected && selected !== "all" && selected !== r.status;
          const content = (
            <div className={`transition-opacity ${dimmed ? "opacity-40" : ""}`}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-medium ${selected === r.status ? "text-navy font-semibold" : "text-slate-600"}`}>
                  {r.rango}
                </span>
                <span className="font-semibold text-navy tabular-nums">
                  {mm(r.monto, 1)}{" "}
                  <span className="text-slate-400 font-normal">· {((r.monto / total) * 100).toFixed(0)}%</span>
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out"
                  style={{ width: `${(r.monto / total) * 100}%`, background: STATUS_COLOR[r.status] }}
                />
              </div>
            </div>
          );
          return (
            <div
              key={r.rango}
              className="relative"
              onMouseEnter={() => setHover(r.rango)}
              onMouseLeave={() => setHover(null)}
            >
              {onSelect ? (
                <button
                  type="button"
                  aria-pressed={selected === r.status}
                  onClick={() => onSelect(selected === r.status ? "all" : r.status)}
                  className="w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded"
                >
                  {content}
                </button>
              ) : (
                content
              )}
              {hover === r.rango && (
                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-lg bg-navy/95 text-white text-[11px] px-2.5 py-1.5 z-20 shadow-xl">
                  {r.rango}: {mm(r.monto, 1)} · {((r.monto / total) * 100).toFixed(0)}% del total
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Cascada del estado de resultados ─────────────────────────────────── */
export function Waterfall() {
  const [hover, setHover] = useState<number | null>(null);
  const w = 720;
  const h = 300;
  const padL = 40;
  const padB = 56;
  const padT = 20;
  const plotW = w - padL - 10;
  const plotH = h - padT - padB;

  const seq = [
    { label: "Ingresos", value: 61.0, kind: "total" as const },
    { label: "Costo de ventas", value: -35.8, kind: "down" as const },
    { label: "Gastos admin.", value: -8.1, kind: "down" as const },
    { label: "Gastos venta", value: -5.9, kind: "down" as const },
    { label: "Otros gastos", value: -1.6, kind: "down" as const },
    { label: "EBITDA", value: 9.6, kind: "total" as const },
  ];
  const ticks = niceTicks(65);
  const max = ticks[ticks.length - 1];
  const colW = plotW / seq.length;
  const barW = Math.min(56, colW * 0.6);
  const y = (v: number) => padT + plotH - (v / max) * plotH;

  let running = 0;
  const bars = seq.map((s) => {
    let top: number, bot: number, fill: string, acumulado: number;
    if (s.kind === "total") {
      top = s.value;
      bot = 0;
      running = s.value;
      acumulado = s.value;
      fill = C.navy;
    } else {
      const end = running + s.value;
      top = Math.max(running, end);
      bot = Math.min(running, end);
      running = end;
      acumulado = end;
      fill = C.orange;
    }
    return { ...s, top, bot, fill, acumulado };
  });

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Cascada del estado de resultados">
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={w - 10} y1={y(t)} y2={y(t)} stroke={C.grid} strokeWidth={1} />
            <text x={padL - 6} y={y(t) + 3} fontSize={10} fill="#64748b" textAnchor="end">
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
              <rect x={cx - barW / 2} y={yt} width={barW} height={Math.max(2, yb - yt)} rx={4} fill={bar.fill} opacity={hover === null || hover === i ? 1 : 0.55} />
              {bar.kind === "total" && (
                <text x={cx} y={yt - 6} fontSize={10} fontWeight={700} fill={C.ink} textAnchor="middle">
                  {mm(bar.value, 0)}
                </text>
              )}
              <rect
                x={cx - colW / 2}
                y={padT}
                width={colW}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setHover((hv) => (hv === i ? null : i))}
              />
              <text x={cx} y={h - padB + 18} fontSize={9.5} fill={C.ink2} textAnchor="middle">
                {bar.label}
              </text>
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <ChartTip xPct={((padL + colW * hover + colW / 2) / w) * 100} yPct={18}>
          <p className="font-semibold mb-0.5">{bars[hover].label}</p>
          <p>
            {bars[hover].kind === "total" ? mm(bars[hover].value, 1) : `−${mm(Math.abs(bars[hover].value), 1).replace("$", "$")}`}
          </p>
          {bars[hover].kind !== "total" && <p className="text-slate-300">Acumulado: {mm(bars[hover].acumulado, 1)}</p>}
        </ChartTip>
      )}
      <Legend
        className="mt-3"
        items={[
          { label: "Ingresos y EBITDA", color: C.navy },
          { label: "Costos y gastos", color: C.orange },
        ]}
      />
    </div>
  );
}
