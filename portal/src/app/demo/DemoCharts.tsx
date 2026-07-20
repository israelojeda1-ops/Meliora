"use client";

import { useState } from "react";

type Alerta = { status: "good" | "warning" | "serious" | "critical"; texto: string };
type CarteraRow = { rango: string; monto: number; status: "good" | "warning" | "serious" | "critical" };

const STATUS_COLOR: Record<Alerta["status"], string> = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
};

const STATUS_LABEL: Record<Alerta["status"], string> = {
  good: "Positivo",
  warning: "Atención",
  serious: "Riesgo",
  critical: "Crítico",
};

const COLOR_PRESUPUESTO = "#2a78d6"; // categorical slot 1 (blue)
const COLOR_REAL = "#1baf7a"; // categorical slot 5 (aqua/emerald)

function fmtMM(n: number) {
  return `$${n.toFixed(0)}MM`;
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
    <div className="rounded-2xl bg-white border border-slate-200 p-5">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className="text-2xl font-semibold text-navy">{value}</p>
      {delta && (
        <p
          className="text-xs font-semibold mt-1"
          style={{ color: deltaGood ? "#006300" : "#d03b3b" }}
        >
          {delta}
        </p>
      )}
    </div>
  );
}

function BarChart({
  meses,
  ingresos,
  presupuesto,
}: {
  meses: string[];
  ingresos: number[];
  presupuesto: number[];
}) {
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const w = 720;
  const h = 260;
  const padL = 36;
  const padB = 24;
  const padT = 10;
  const max = Math.max(...ingresos, ...presupuesto) * 1.15;
  const plotW = w - padL - 8;
  const plotH = h - padT - padB;
  const groupW = plotW / meses.length;
  const barW = Math.min(20, groupW * 0.32);
  const gap = 3;

  const yTicks = [0, Math.round(max / 2 / 5) * 5, Math.round(max / 5) * 5];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Ingresos vs presupuesto mensual">
        {yTicks.map((t) => {
          const y = padT + plotH - (t / max) * plotH;
          return (
            <g key={t}>
              <line x1={padL} x2={w - 8} y1={y} y2={y} stroke="#e1e0d9" strokeWidth={1} />
              <text x={padL - 6} y={y + 3} fontSize={9} fill="#898781" textAnchor="end">
                {t}
              </text>
            </g>
          );
        })}
        <line x1={padL} x2={padL} y1={padT} y2={padT + plotH} stroke="#c3c2b7" strokeWidth={1} />

        {meses.map((m, i) => {
          const cx = padL + groupW * i + groupW / 2;
          const hPres = (presupuesto[i] / max) * plotH;
          const hReal = (ingresos[i] / max) * plotH;
          const xPres = cx - barW - gap / 2;
          const xReal = cx + gap / 2;
          return (
            <g key={m}>
              <rect
                x={xPres}
                y={padT + plotH - hPres}
                width={barW}
                height={hPres}
                rx={4}
                fill={COLOR_PRESUPUESTO}
                opacity={hover?.i === i ? 1 : 0.85}
              />
              <rect
                x={xReal}
                y={padT + plotH - hReal}
                width={barW}
                height={hReal}
                rx={4}
                fill={COLOR_REAL}
                opacity={hover?.i === i ? 1 : 0.85}
              />
              <rect
                x={cx - groupW / 2}
                y={padT}
                width={groupW}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover({ i, x: cx, y: padT + plotH - Math.max(hPres, hReal) })}
                onMouseLeave={() => setHover(null)}
              />
              <text x={cx} y={h - 6} fontSize={9} fill="#898781" textAnchor="middle">
                {m}
              </text>
            </g>
          );
        })}
      </svg>

      {hover && (
        <div
          className="absolute pointer-events-none rounded-lg bg-navy text-white text-xs px-3 py-2 shadow-lg -translate-x-1/2 -translate-y-full"
          style={{ left: `${(hover.x / w) * 100}%`, top: `${(hover.y / h) * 100}%` }}
        >
          <p className="font-semibold mb-1">{meses[hover.i]}</p>
          <p>Presupuesto: {fmtMM(presupuesto[hover.i])}</p>
          <p>Real: {fmtMM(ingresos[hover.i])}</p>
        </div>
      )}

      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: COLOR_PRESUPUESTO }} />
          Presupuesto
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: COLOR_REAL }} />
          Real
        </span>
      </div>
    </div>
  );
}

function LineChart({ meses, valores }: { meses: string[]; valores: number[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 720;
  const h = 220;
  const padL = 30;
  const padB = 22;
  const padT = 14;
  const min = Math.floor(Math.min(...valores) - 1);
  const max = Math.ceil(Math.max(...valores) + 1);
  const plotW = w - padL - 8;
  const plotH = h - padT - padB;

  const pts = valores.map((v, i) => {
    const x = padL + (plotW / (valores.length - 1)) * i;
    const y = padT + plotH - ((v - min) / (max - min)) * plotH;
    return { x, y, v };
  });

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${padT + plotH} L ${pts[0].x} ${padT + plotH} Z`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Margen EBITDA mensual">
        <line x1={padL} x2={w - 8} y1={padT + plotH} y2={padT + plotH} stroke="#e1e0d9" strokeWidth={1} />
        <path d={areaPath} fill={COLOR_REAL} opacity={0.1} />
        <path d={linePath} fill="none" stroke={COLOR_REAL} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <g key={i}>
            {i === pts.length - 1 && (
              <circle cx={p.x} cy={p.y} r={4} fill={COLOR_REAL} stroke="#fff" strokeWidth={2} />
            )}
            <rect
              x={p.x - plotW / valores.length / 2}
              y={padT}
              width={plotW / valores.length}
              height={plotH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
            <text x={p.x} y={h - 4} fontSize={9} fill="#898781" textAnchor="middle">
              {meses[i]}
            </text>
          </g>
        ))}
        <text x={pts[pts.length - 1].x} y={pts[pts.length - 1].y - 10} fontSize={11} fill="#0b0b0b" textAnchor="end" fontWeight={600}>
          {valores[valores.length - 1].toFixed(1)}%
        </text>
      </svg>
      {hover !== null && (
        <div
          className="absolute pointer-events-none rounded-lg bg-navy text-white text-xs px-3 py-2 shadow-lg -translate-x-1/2 -translate-y-full"
          style={{ left: `${(pts[hover].x / w) * 100}%`, top: `${(pts[hover].y / h) * 100}%` }}
        >
          <p className="font-semibold">{meses[hover]}: {valores[hover].toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
}

export default function DemoCharts({
  meses,
  ingresos,
  presupuesto,
  ebitdaMargen,
  carteraRows,
  alertas,
}: {
  meses: string[];
  ingresos: number[];
  presupuesto: number[];
  ebitdaMargen: number[];
  carteraRows: CarteraRow[];
  alertas: Alerta[];
}) {
  const totalIngresos = ingresos.reduce((a, b) => a + b, 0);
  const ultimoIngreso = ingresos[ingresos.length - 1];
  const penultimoIngreso = ingresos[ingresos.length - 2];
  const deltaIngreso = ((ultimoIngreso - penultimoIngreso) / penultimoIngreso) * 100;
  const totalCartera = carteraRows.reduce((a, r) => a + r.monto, 0);
  const carteraVencida = carteraRows.filter((r) => r.rango !== "0 – 30 días").reduce((a, r) => a + r.monto, 0);
  const ebitdaActual = ebitdaMargen[ebitdaMargen.length - 1];
  const ebitdaPrev = ebitdaMargen[ebitdaMargen.length - 2];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Ingresos del mes"
          value={fmtMM(ultimoIngreso)}
          delta={`${deltaIngreso > 0 ? "+" : ""}${deltaIngreso.toFixed(1)}% vs mes anterior`}
          deltaGood={deltaIngreso >= 0}
        />
        <StatTile
          label="Margen EBITDA"
          value={`${ebitdaActual.toFixed(1)}%`}
          delta={`${ebitdaActual >= ebitdaPrev ? "+" : ""}${(ebitdaActual - ebitdaPrev).toFixed(1)} pp vs mes anterior`}
          deltaGood={ebitdaActual >= ebitdaPrev}
        />
        <StatTile label="Ingresos acumulados (12m)" value={fmtMM(totalIngresos)} />
        <StatTile
          label="Cartera vencida"
          value={fmtMM(carteraVencida)}
          delta={`${((carteraVencida / totalCartera) * 100).toFixed(0)}% del total por cobrar`}
          deltaGood={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-navy mb-4">Ingresos reales vs. presupuesto (12 meses)</h2>
          <BarChart meses={meses} ingresos={ingresos} presupuesto={presupuesto} />
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-navy mb-4">Evolución del margen EBITDA</h2>
          <LineChart meses={meses} valores={ebitdaMargen} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-navy mb-4">Cartera por cobrar por antigüedad</h2>
          <div className="space-y-3">
            {carteraRows.map((r) => {
              const pct = (r.monto / totalCartera) * 100;
              return (
                <div key={r.rango}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-600">{r.rango}</span>
                    <span className="font-semibold text-navy tabular-nums">{fmtMM(r.monto)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: STATUS_COLOR[r.status] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-navy mb-4">Indicadores que requieren atención</h2>
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
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: STATUS_COLOR[a.status] }}>
                    {STATUS_LABEL[a.status]}
                  </p>
                  <p className="text-sm text-slate-600">{a.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
