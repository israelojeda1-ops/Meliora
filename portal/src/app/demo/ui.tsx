"use client";

/* Primitivos de UI del dashboard demo: cards, tiles, badges, filtros y tablas. */
import { useMemo, useState } from "react";
import { C, STATUS_COLOR, type Estado } from "./data";
import { IconChevronDown, IconDelta, IconSearch } from "./icons";

/* ── Card ─────────────────────────────────────────────────────────────── */
export function Card({
  title,
  subtitle,
  meta,
  actions,
  children,
  className = "",
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const hasHeader = title || subtitle || meta || actions;
  return (
    <div
      className={`rounded-2xl bg-white ring-1 ring-slate-900/5 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.08)] p-5 sm:p-6 print:break-inside-avoid ${className}`}
    >
      {hasHeader && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-bold text-navy">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {(meta || actions) && (
            <div className="flex items-center gap-3 shrink-0">
              {meta}
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Sparkline (12 puntos, neutro con remate esmeralda) ───────────────── */
export function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 96;
  const h = 28;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  const pts = values.map((v, i) => ({
    x: 2 + ((w - 8) / (values.length - 1)) * i,
    y: 3 + (h - 8) * (1 - (v - lo) / span),
  }));
  const d = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-7 w-24" aria-hidden="true">
      <polyline points={d} fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r={2.5} fill={C.emerald} />
    </svg>
  );
}

/* ── StatTile ─────────────────────────────────────────────────────────── */
const DELTA_TONE = {
  good: "bg-[#e7f5ea] text-[#0a5c0a]",
  bad: "bg-[#fbe7e7] text-[#8f1f1f]",
  neutral: "bg-slate-100 text-slate-600",
};

export function StatTile({
  label,
  value,
  delta,
  deltaTone = "neutral",
  deltaDown,
  deltaArrow = true,
  caption,
  spark,
  onClick,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: keyof typeof DELTA_TONE;
  deltaDown?: boolean;
  deltaArrow?: boolean;
  caption?: string;
  spark?: number[];
  onClick?: () => void;
}) {
  const body = (
    <>
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide leading-tight">{label}</p>
      <p
        className={`mt-2 font-semibold tracking-tight text-navy ${
          value.length > 14 ? "text-base leading-snug" : "text-2xl sm:text-[26px]"
        }`}
      >
        {value}
      </p>
      {(delta || caption) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {delta && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${DELTA_TONE[deltaTone]}`}
            >
              {deltaTone !== "neutral" && deltaArrow && <IconDelta down={deltaDown ?? deltaTone === "bad"} />}
              {delta}
            </span>
          )}
          {caption && <span className="text-[11px] text-slate-400">{caption}</span>}
        </div>
      )}
      {spark && <Sparkline values={spark} />}
    </>
  );

  const shell =
    "relative rounded-2xl bg-white ring-1 ring-slate-900/5 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.08)] p-4 sm:p-5 print:break-inside-avoid";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${shell} text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald`}
      >
        <span className="absolute right-3 top-3 text-slate-300" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </span>
        {body}
      </button>
    );
  }
  return <div className={shell}>{body}</div>;
}

/* ── StatusBadge (pill tintada; texto oscuro, dot en color de estado) ─── */
const BADGE_TONE: Record<Estado | "neutral", string> = {
  good: "bg-[#e7f5ea] text-[#0a5c0a] ring-[#c2e5c8]",
  warning: "bg-[#fdf3d9] text-[#8a5a00] ring-[#f3dfad]",
  serious: "bg-[#fdeae1] text-[#94391a] ring-[#f5cfba]",
  critical: "bg-[#fbe3e3] text-[#8f1f1f] ring-[#f2c4c4]",
  neutral: "bg-slate-100 text-slate-600 ring-slate-200",
};
const BADGE_LABEL: Record<Estado, string> = {
  good: "Al día",
  warning: "Atención",
  serious: "Riesgo",
  critical: "Crítico",
};

export function StatusBadge({ status, label }: { status: Estado | "neutral"; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap ${BADGE_TONE[status]}`}
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: status === "neutral" ? "#94a3b8" : STATUS_COLOR[status] }}
      />
      {label ?? (status === "neutral" ? "" : BADGE_LABEL[status])}
    </span>
  );
}

/* ── Legend como chips ────────────────────────────────────────────────── */
export function Legend({ items, className = "" }: { items: { label: string; color?: string; swatch?: React.ReactNode }[]; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 text-[11px] text-slate-600 ${className}`}>
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2 py-0.5">
          {it.swatch ?? <span className="inline-block h-2 w-2 rounded-[3px]" style={{ background: it.color }} />}
          {it.label}
        </span>
      ))}
    </div>
  );
}

/* ── FilterChips ──────────────────────────────────────────────────────── */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string; dot?: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
              active
                ? "bg-navy border-navy text-white"
                : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 bg-white"
            }`}
          >
            {o.dot && <span className="inline-block h-2 w-2 rounded-full" style={{ background: o.dot }} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── SegmentedControl (sub-vistas dentro de una pestaña) ──────────────── */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  size?: "sm" | "md";
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-lg bg-slate-100 p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`${size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"} font-semibold rounded-md transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
              active ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function RangeToggle({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Segmented
      size="sm"
      label="Rango de meses"
      options={[
        { value: "3", label: "3M" },
        { value: "6", label: "6M" },
        { value: "12", label: "12M" },
      ]}
      value={String(value) as "3" | "6" | "12"}
      onChange={(v) => onChange(Number(v))}
    />
  );
}

/* ── SearchInput ──────────────────────────────────────────────────────── */
export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full sm:w-64">
      <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald"
      />
    </div>
  );
}

/* ── EmptyState ───────────────────────────────────────────────────────── */
export function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-slate-500">Sin resultados con los filtros aplicados.</p>
      <button
        type="button"
        onClick={onClear}
        className="mt-2 text-sm font-semibold text-emerald hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded"
      >
        Limpiar filtros
      </button>
    </div>
  );
}

/* ── InfoTip (definiciones al hover/focus) ────────────────────────────── */
export function InfoTip({ texto }: { texto: string }) {
  return (
    <span className="relative inline-flex group align-middle ml-1">
      <button type="button" aria-label={`Definición: ${texto}`} className="text-slate-400 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-full">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-3.5 w-3.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block group-focus-within:block w-56 rounded-lg bg-navy text-white text-[11px] font-normal normal-case tracking-normal leading-snug px-3 py-2 z-30 text-left shadow-xl"
      >
        {texto}
      </span>
    </span>
  );
}

/* ── Insight (tarjeta de análisis con tono) ───────────────────────────── */
export function Insight({ tone, children }: { tone: Estado; children: React.ReactNode }) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl bg-white ring-1 ring-slate-900/5 border-l-4 p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
      style={{ borderLeftColor: STATUS_COLOR[tone] }}
    >
      <span className="mt-0.5 shrink-0" style={{ color: STATUS_COLOR[tone] }} aria-hidden="true">
        {tone === "good" ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        )}
      </span>
      <p className="text-sm text-slate-600 leading-relaxed">{children}</p>
    </div>
  );
}

/* ── DataTable ordenable ──────────────────────────────────────────────── */
export type Col<T> = {
  label: string;
  align?: "left" | "right";
  sortValue?: (r: T) => number | string;
  render: (r: T) => React.ReactNode;
};

export function DataTable<T>({
  cols,
  rows,
  rowKey,
  defaultSort,
  maxHeight,
}: {
  cols: Col<T>[];
  rows: T[];
  rowKey: (r: T) => string;
  defaultSort?: { col: number; dir: "asc" | "desc" };
  maxHeight?: string;
}) {
  const [sort, setSort] = useState<{ col: number; dir: "asc" | "desc" } | null>(defaultSort ?? null);

  const sorted = useMemo(() => {
    if (!sort || !cols[sort.col]?.sortValue) return rows;
    const sv = cols[sort.col].sortValue!;
    return [...rows].sort((a, b) => {
      const va = sv(a);
      const vb = sv(b);
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb), "es");
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, sort, cols]);

  const toggle = (i: number) => {
    if (!cols[i].sortValue) return;
    setSort((s) => (s?.col === i ? { col: i, dir: s.dir === "desc" ? "asc" : "desc" } : { col: i, dir: "desc" }));
  };

  const table = (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200">
          {cols.map((c, i) => (
            <th
              key={c.label}
              aria-sort={sort?.col === i ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
              className={`py-2 px-3 first:pl-0 last:pr-0 ${maxHeight ? "sticky top-0 bg-white z-10" : ""} ${
                c.align === "right" ? "text-right" : "text-left"
              }`}
            >
              {c.sortValue ? (
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className={`inline-flex items-center gap-1 uppercase tracking-wider font-semibold transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded ${
                    sort?.col === i ? "text-navy" : ""
                  }`}
                >
                  {c.label}
                  <IconChevronDown
                    className={`h-3 w-3 transition-transform ${
                      sort?.col === i ? (sort.dir === "asc" ? "rotate-180" : "") : "opacity-40"
                    }`}
                  />
                </button>
              ) : (
                c.label
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.map((r) => (
          <tr key={rowKey(r)} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
            {cols.map((c, ci) => (
              <td
                key={c.label}
                className={`py-2.5 px-3 first:pl-0 last:pr-0 tabular-nums whitespace-nowrap ${
                  c.align === "right" ? "text-right" : "text-left"
                } ${ci === 0 ? "font-medium text-navy" : "text-slate-600"}`}
              >
                {c.render(r)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className={`overflow-x-auto ${maxHeight ? `overflow-y-auto ${maxHeight}` : ""}`}>{table}</div>
  );
}

/* ── StatementTable (orden contable, no ordenable) ────────────────────── */
export function StatementTable({
  rows,
  cols,
}: {
  rows: { label: string; kind: "line" | "subtotal" | "total"; values: number[] }[];
  cols?: string[];
}) {
  const fmtVal = (n: number) =>
    n.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        {cols && (
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <th className="py-2 pr-4 text-left">{cols[0]}</th>
              {cols.slice(1).map((c) => (
                <th key={c} className="py-2 pl-4 text-right">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((r, i) => {
            const emphasize = r.kind !== "line";
            return (
              <tr
                key={i}
                className={`border-b border-slate-100 last:border-0 ${
                  r.kind === "total"
                    ? "border-t-2 border-t-navy/25 bg-navy/[0.04]"
                    : r.kind === "subtotal"
                      ? "border-t border-t-slate-200 bg-slate-50/60"
                      : "hover:bg-slate-50 transition-colors"
                }`}
              >
                <td
                  className={`py-2.5 pr-4 ${
                    r.kind === "total"
                      ? "font-bold text-navy"
                      : r.kind === "subtotal"
                        ? "font-semibold text-navy"
                        : "pl-4 text-slate-600"
                  }`}
                >
                  {r.label}
                </td>
                {r.values.map((v, vi) => (
                  <td
                    key={vi}
                    className={`py-2.5 pl-4 text-right tabular-nums whitespace-nowrap ${
                      emphasize ? "font-semibold text-navy" : vi === r.values.length - 1 && r.values.length > 1 ? "text-slate-400" : "text-slate-700"
                    }`}
                  >
                    {fmtVal(v)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
