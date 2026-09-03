"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import {
  C, STATUS_COLOR, PRIORIDAD_COLOR, MESES, PERIODOS, money, mm, pct, days, norm,
  ventas, presupuestoVentas, ventasAnoAnterior, compras, ebitdaMargen,
  ingresosCaja, egresosCaja, dso, dpo, saldoCaja,
  forecastMeses, forecastVentas, metaAnualForecast,
  ventasPorLinea, topClientes, comprasPorCategoria, topProveedores,
  cartera, topDeudores, carteraPagar, proveedoresPago,
  eerr, pnlIfrs, topVariaciones, activos, pasivosPatrimonio, flujoIndirecto,
  productos, stock, capex, CAPEX_ESTADO, dotacion, costoNomina,
  calendarioTributario, TAX_ESTADO, DEFINICIONES,
  type Estado, type Prioridad,
} from "./data";
import {
  Card, StatTile, StatusBadge, FilterChips, Segmented, RangeToggle,
  SearchInput, EmptyState, InfoTip, Insight, DataTable, StatementTable,
} from "./ui";
import { BarChart, LineChart, ForecastChart, HBarChart, AgingBars, Waterfall } from "./charts";
import {
  IconHome, IconChartBar, IconCart, IconBanknotes, IconInbox, IconScale,
  IconClipboard, IconCube, IconWrench, IconCalendar, IconChevronDown,
  IconChevronRight, IconCheck, IconDownload, IconAlert, IconBulb,
} from "./icons";

/* ── Navegación: 10 pestañas en 5 grupos ──────────────────────────────── */
const NAV = [
  {
    grupo: "Resumen",
    tabs: [
      { id: "resumen", label: "Resumen", icon: IconHome, desc: "Los indicadores clave del mes y qué mirar primero" },
    ],
  },
  {
    grupo: "Comercial",
    tabs: [
      { id: "ventas", label: "Ventas y Forecast", icon: IconChartBar, desc: "Ventas reales, presupuesto, líneas de negocio y proyección a 6 meses" },
      { id: "compras", label: "Compras", icon: IconCart, desc: "Compras por mes, categorías y principales proveedores" },
    ],
  },
  {
    grupo: "Caja",
    tabs: [
      { id: "caja", label: "Flujo de Caja", icon: IconBanknotes, desc: "Ingresos, egresos, saldo acumulado y flujo por método indirecto" },
      { id: "cobranza", label: "Cobranza y Pagos", icon: IconInbox, desc: "Cartera por cobrar y por pagar, antigüedad, DSO y DPO" },
    ],
  },
  {
    grupo: "Resultados",
    tabs: [
      { id: "resultados", label: "Resultados", icon: IconClipboard, desc: "El resultado del mes, la comparación con presupuesto y el EERR anual IFRS" },
      { id: "balance", label: "Balance", icon: IconScale, desc: "Activos, pasivos y patrimonio al cierre del período" },
    ],
  },
  {
    grupo: "Operación",
    tabs: [
      { id: "productos", label: "Productos y Stock", icon: IconCube, desc: "Márgenes por producto e inventario valorizado por SKU" },
      { id: "capex", label: "CAPEX y Dotación", icon: IconWrench, desc: "Ejecución de inversiones, headcount y costo de nómina" },
      { id: "tributario", label: "Tributario", icon: IconCalendar, desc: "Calendario de IVA, PPM, cotizaciones y Renta" },
    ],
  },
] as const;

type Tab =
  | "resumen" | "ventas" | "compras" | "caja" | "cobranza"
  | "resultados" | "balance" | "productos" | "capex" | "tributario";

const ALL_TABS = NAV.flatMap((g) => g.tabs.map((t) => ({ ...t, grupo: g.grupo })));

/* ── Bloque "Qué mirar este mes" ──────────────────────────────────────── */
const QUE_MIRAR: { texto: string; tab: Tab }[] = [
  { texto: "Las ventas superan el presupuesto por tercer mes consecutivo (+10,9% en julio). La proyección anual llega a $1.002 MM y roza la meta de $1.000 MM.", tab: "ventas" },
  { texto: "La caja cierra en $113 MM, pero $22,2 MM de cobranza vencida concentrada en 3 clientes es el riesgo del mes. Priorizar gestión con Inversiones Aconcagua (96 días).", tab: "cobranza" },
  { texto: "El costo de venta subió 8,5% sobre presupuesto por alza de materia prima. La negociación del contrato de cobertura sigue en curso.", tab: "resultados" },
];

const ALERTAS: { status: Estado; texto: string; tab: Tab }[] = [
  { status: "critical", texto: "3 clientes concentran el 62% de la cartera vencida a más de 90 días.", tab: "cobranza" },
  { status: "warning", texto: "El gasto de venta superó el presupuesto en 4 de los últimos 6 meses.", tab: "resultados" },
  { status: "good", texto: "El margen EBITDA subió 4,6 puntos porcentuales respecto al semestre anterior.", tab: "resultados" },
];

export default function DemoDashboard() {
  const [tab, setTab] = useState<Tab>("resumen");
  const [mes, setMes] = useState(11);
  const [periodoOpen, setPeriodoOpen] = useState(false);
  const periodoRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  /* rangos por sección */
  const [rangoVentas, setRangoVentas] = useState(12);
  const [rangoCompras, setRangoCompras] = useState(12);
  const [rangoCaja, setRangoCaja] = useState(12);
  const [rangoResumen, setRangoResumen] = useState(12);
  const [rangoCartera, setRangoCartera] = useState(12);

  /* filtros por pestaña */
  const [comparar, setComparar] = useState<"presupuesto" | "anterior">("presupuesto");
  const [lineaSel, setLineaSel] = useState<string | null>(null);
  const [catCompraSel, setCatCompraSel] = useState<string | null>(null);
  const [ladoCartera, setLadoCartera] = useState<"cobrar" | "pagar">("cobrar");
  const [filtroCobranza, setFiltroCobranza] = useState<Estado | "all">("all");
  const [filtroPrioridad, setFiltroPrioridad] = useState<Prioridad | "all">("all");
  const [vistaResultados, setVistaResultados] = useState<"mes" | "presupuesto" | "anual">("mes");
  const [tipoVar, setTipoVar] = useState<"all" | "F" | "U">("all");
  const [varAbierta, setVarAbierta] = useState<number | null>(null);
  const [catProd, setCatProd] = useState<"all" | "Retail" | "Proyectos" | "Servicios">("all");
  const [qStock, setQStock] = useState("");
  const [estadoStock, setEstadoStock] = useState<Estado | "all">("all");

  /* cerrar dropdown de período al click afuera */
  useEffect(() => {
    if (!periodoOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!periodoRef.current?.contains(e.target as Node)) setPeriodoOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPeriodoOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [periodoOpen]);

  useEffect(() => {
    tabRefs.current[tab]?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [tab]);

  const grupoActivo = NAV.find((g) => g.tabs.some((t) => t.id === tab))!;
  const tabActivo = ALL_TABS.find((t) => t.id === tab)!;
  const esCierre = mes === 11;

  /* ── Derivados del período seleccionado ─────────────────────────────── */
  const d = useMemo(() => {
    const corte = <T,>(s: T[]) => s.slice(0, mes + 1);
    const ventaMes = ventas[mes];
    const pptoMes = presupuestoVentas[mes];
    const ventasYTD = corte(ventas).reduce((a, b) => a + b, 0);
    const ebitdaMes = (ventas[mes] * ebitdaMargen[mes]) / 100;
    const ebitdaAcum = corte(ventas).reduce((sum, v, i) => sum + (v * ebitdaMargen[i]) / 100, 0);
    return {
      corte,
      ventaMes,
      pptoMes,
      deltaPpto: ((ventaMes - pptoMes) / pptoMes) * 100,
      deltaInteranual: ((ventaMes - ventasAnoAnterior[mes]) / ventasAnoAnterior[mes]) * 100,
      ventasYTD,
      ebitdaMes,
      ebitdaAcum,
      margenMes: ebitdaMargen[mes],
      flujoNetoMes: ingresosCaja[mes] - egresosCaja[mes],
      saldoActual: saldoCaja[mes],
      comprasMes: compras[mes],
      comprasAcum: corte(compras).reduce((a, b) => a + b, 0),
      dsoMes: dso[mes],
      dpoMes: dpo[mes],
      dsoDelta: mes > 0 ? dso[mes] - dso[mes - 1] : 0,
      dpoDelta: mes > 0 ? dpo[mes] - dpo[mes - 1] : 0,
    };
  }, [mes]);

  const labels = (rango: number) => d.corte([...MESES]).slice(-rango);
  const serie = (s: number[], rango: number) => d.corte(s).slice(-rango);
  const hl = (rango: number) => Math.min(rango, mes + 1) - 1;

  const plural = (n: number, unidad: string) => `${Math.abs(n)} ${Math.abs(n) === 1 ? unidad : unidad + "s"}`;

  /* cartera */
  const totalCartera = cartera.reduce((a, r) => a + r.monto, 0);
  const carteraVencida = cartera.slice(1).reduce((a, r) => a + r.monto, 0);
  const totalPagar = carteraPagar.reduce((a, r) => a + r.monto, 0);
  const pagarVencido = carteraPagar.slice(1).reduce((a, r) => a + r.monto, 0);
  const proveedoresCriticos = proveedoresPago.filter((p) => p.prioridad === "P1").length;

  /* forecast */
  const ventasYTD12 = ventas.reduce((a, b) => a + b, 0);
  const forecastTotal = forecastVentas.reduce((a, b) => a + b, 0);
  const proyeccionAnual = ventasYTD12 + forecastTotal;
  const promedioTrim = (ventas[9] + ventas[10] + ventas[11]) / 3;
  const crecimientoProyectado = ((forecastTotal / 6 - promedioTrim) / promedioTrim) * 100;

  /* productos y stock (filtrados) */
  const productosFiltrados = useMemo(
    () => productos.filter((p) => catProd === "all" || p.categoria === catProd),
    [catProd]
  );
  const margenPromedio = productosFiltrados.length
    ? productosFiltrados.reduce((a, p) => a + p.margenPct, 0) / productosFiltrados.length
    : 0;
  const mejorProducto = [...productosFiltrados].sort((a, b) => b.margenPct - a.margenPct)[0];
  const peorProducto = [...productosFiltrados].sort((a, b) => a.margenPct - b.margenPct)[0];

  const stockFiltrado = useMemo(
    () =>
      stock.filter(
        (s) =>
          (estadoStock === "all" || s.estado === estadoStock) &&
          norm(`${s.sku} ${s.nombre} ${s.categoria}`).includes(norm(qStock))
      ),
    [estadoStock, qStock]
  );
  const valorInventario = stock.reduce((a, s) => a + s.valor, 0);
  const skuConCobertura = stock.filter((s) => s.estado !== "critical");
  const coberturaPromedio = skuConCobertura.reduce((a, s) => a + s.dias, 0) / skuConCobertura.length;
  const skuMayorValor = [...stock].sort((a, b) => b.valor - a.valor)[0];

  /* clientes / proveedores filtrados */
  const clientesFiltrados = topClientes.filter((c) => !lineaSel || c.linea === lineaSel);
  const provsFiltrados = topProveedores.filter((p) => !catCompraSel || p.cat === catCompraSel);
  const deudoresFiltrados = topDeudores.filter((dd) => filtroCobranza === "all" || dd.status === filtroCobranza);
  const pagosFiltrados = proveedoresPago.filter((p) => filtroPrioridad === "all" || p.prioridad === filtroPrioridad);
  const variacionesFiltradas = topVariaciones.filter((v) => tipoVar === "all" || v.tipo === tipoVar);

  /* capex / dotación */
  const capexPresupuesto = capex.reduce((a, c) => a + c.presupuesto, 0);
  const capexEjecutado = capex.reduce((a, c) => a + c.ejecutado, 0);
  const capexRetrasados = capex.filter((c) => c.estado === "Retrasado").length;
  const totalHC = dotacion.reduce((a, dd) => a + dd.hc, 0);
  const totalNomina = costoNomina.reduce((a, c) => a + c.monto, 0);

  /* tributario */
  const proximoVencimiento = calendarioTributario.find((t) => t.estado === "Pendiente");
  const totalPendienteTax = calendarioTributario.filter((t) => t.estado === "Pendiente").reduce((a, t) => a + t.monto, 0);

  const notaCierre = !esCierre && (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
      Estados al cierre de Julio 2026
    </span>
  );

  const imprimir = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#22345C] to-navy">
        <div aria-hidden className="pointer-events-none absolute -top-24 right-[-8%] h-80 w-80 rounded-full bg-emerald/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 pb-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <Logo variant="icon" theme="dark" />
            <span className="text-slate-400 text-xs">Portal Meliora Advisory</span>
          </div>
          <p className="text-emerald-light font-semibold text-xs tracking-wide uppercase mb-1">
            Reporte gerencial mensual
          </p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Empresa Demo SpA</h1>
              <p className="text-slate-300 text-sm mt-0.5">Control financiero integrado · Portal Meliora</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Datos al 31 de julio de 2026 · Cifras en MM CLP · Información ficticia de demostración
              </p>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={imprimir}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
              >
                <IconDownload className="h-3.5 w-3.5" />
                Descargar PDF
              </button>
              <div className="relative" ref={periodoRef}>
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={periodoOpen}
                  onClick={() => setPeriodoOpen((o) => !o)}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
                >
                  <IconCalendar className="h-4 w-4" />
                  {PERIODOS[mes]}
                  <IconChevronDown className={`h-3.5 w-3.5 transition-transform ${periodoOpen ? "rotate-180" : ""}`} />
                </button>
                {periodoOpen && (
                  <div
                    role="listbox"
                    aria-label="Período del reporte"
                    className="absolute right-0 mt-2 w-52 rounded-xl bg-white border border-slate-200 shadow-lg z-30 p-1 max-h-80 overflow-y-auto"
                  >
                    {PERIODOS.map((p, i) => (
                      <button
                        key={p}
                        type="button"
                        role="option"
                        aria-selected={i === mes}
                        onClick={() => {
                          setMes(i);
                          setPeriodoOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-left transition-colors ${
                          i === mes ? "bg-navy/5 font-semibold text-navy" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                        {i === mes && <IconCheck className="h-4 w-4 text-emerald" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Nav dos niveles ── */}
        <div className="relative border-t border-white/10 print:hidden">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 overflow-x-auto no-scrollbar pt-2.5">
              {NAV.map((g) => {
                const activa = g.grupo === grupoActivo.grupo;
                return (
                  <button
                    key={g.grupo}
                    type="button"
                    aria-current={activa ? "true" : undefined}
                    onClick={() => setTab(g.tabs[0].id as Tab)}
                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
                      activa ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {g.grupo}
                  </button>
                );
              })}
            </div>
            <div role="tablist" aria-label="Secciones del reporte" className="flex gap-1 overflow-x-auto no-scrollbar">
              {grupoActivo.tabs.map((t) => {
                const Icono = t.icon;
                const activa = t.id === tab;
                return (
                  <button
                    key={t.id}
                    ref={(el) => {
                      tabRefs.current[t.id] = el;
                    }}
                    type="button"
                    role="tab"
                    aria-selected={activa}
                    onClick={() => setTab(t.id as Tab)}
                    className={`relative inline-flex items-center gap-2 whitespace-nowrap px-3.5 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
                      activa ? "text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icono className="h-4 w-4" />
                    {t.label}
                    {activa && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-emerald" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div role="tabpanel" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ── Encabezado de pestaña ── */}
        <div key={tab} className="tab-panel">
          <div className="mb-6">
            <p className="text-xs text-slate-400">
              {grupoActivo.grupo !== tabActivo.label && (
                <>
                  {grupoActivo.grupo} <span className="mx-1">/</span>
                </>
              )}
              <span className="font-medium text-slate-600">{tabActivo.label}</span> · {PERIODOS[mes]}
            </p>
            <h2 className="mt-1 text-lg font-bold text-navy flex items-center gap-2">
              <tabActivo.icon className="h-5 w-5 text-emerald" />
              {tabActivo.label}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{tabActivo.desc}</p>
          </div>

          {/* ════ RESUMEN ════ */}
          {tab === "resumen" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatTile
                  label="Ventas del mes"
                  value={mm(d.ventaMes)}
                  delta={`${d.deltaPpto >= 0 ? "+" : ""}${pct(d.deltaPpto)}`}
                  deltaTone={d.deltaPpto >= 0 ? "good" : "bad"}
                  deltaDown={d.deltaPpto < 0}
                  caption="vs presupuesto"
                  spark={d.corte(ventas)}
                />
                <StatTile
                  label="EBITDA del mes"
                  value={mm(d.ebitdaMes, 1)}
                  delta={`Margen ${pct(d.margenMes)}`}
                  deltaTone="good"
                  deltaArrow={false}
                  caption="sobre ventas"
                  spark={d.corte(ebitdaMargen)}
                />
                <StatTile
                  label="Caja disponible"
                  value={mm(d.saldoActual)}
                  delta={`${d.flujoNetoMes >= 0 ? "+" : ""}${mm(d.flujoNetoMes)}`}
                  deltaTone={d.flujoNetoMes >= 0 ? "good" : "bad"}
                  deltaDown={d.flujoNetoMes < 0}
                  caption="flujo neto del mes"
                  spark={d.corte(saldoCaja)}
                />
                <StatTile
                  label="Cobranza vencida"
                  value={mm(carteraVencida, 1)}
                  delta={`${((carteraVencida / totalCartera) * 100).toFixed(0)}% de la cartera`}
                  deltaTone="bad"
                  deltaArrow={false}
                  caption="al cierre de julio"
                  onClick={() => setTab("cobranza")}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card
                  title="Qué mirar este mes"
                  subtitle={`Análisis del equipo Meliora · ${PERIODOS[mes]}`}
                  className="border-l-4 border-l-emerald"
                >
                  <ul className="space-y-4">
                    {QUE_MIRAR.map((item, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => setTab(item.tab)}
                          className="text-left group flex items-start gap-3 w-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
                        >
                          <IconBulb className="h-4 w-4 mt-0.5 shrink-0 text-emerald" />
                          <span>
                            <span className="text-sm text-slate-600 leading-relaxed">{item.texto}</span>{" "}
                            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald group-hover:underline whitespace-nowrap">
                              Ver detalle
                              <IconChevronRight className="h-3 w-3" />
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card
                  title="Indicadores que requieren atención"
                  meta={
                    <span className="text-[11px] font-semibold" style={{ color: C.critical }}>
                      1 crítico
                    </span>
                  }
                >
                  <ul className="space-y-2">
                    {ALERTAS.map((a, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => setTab(a.tab)}
                          className="flex w-full items-start gap-3 rounded-lg p-2 -mx-2 text-left hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
                        >
                          <span className="mt-0.5 shrink-0" style={{ color: STATUS_COLOR[a.status] }} aria-hidden="true">
                            {a.status === "good" ? <IconCheck className="h-4 w-4" /> : <IconAlert className="h-4 w-4" />}
                          </span>
                          <span>
                            <span className="text-sm text-slate-600 leading-relaxed">{a.texto}</span>{" "}
                            <span className="text-xs font-semibold text-emerald hover:underline whitespace-nowrap">Ver detalle</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card
                  title="Evolución del margen EBITDA"
                  subtitle="% sobre ventas"
                  actions={<RangeToggle value={rangoResumen} onChange={setRangoResumen} />}
                >
                  <LineChart
                    labels={labels(rangoResumen)}
                    values={serie(ebitdaMargen, rangoResumen)}
                    color={C.green}
                    name="Margen EBITDA"
                    fmt={(n) => pct(n)}
                    target={{ value: 14, label: "Meta 14%" }}
                    highlight={hl(rangoResumen)}
                  />
                </Card>
                <Card title="Resumen financiero" subtitle={`${PERIODOS[mes]} vs. acumulado FY 2026`}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                        <th className="py-2 pr-4 text-left">Indicador</th>
                        <th className="py-2 px-4 text-right">Mes</th>
                        <th className="py-2 pl-4 text-right">Acumulado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Ingresos", mm(d.ventaMes), mm(d.ventasYTD)],
                        ["EBITDA", mm(d.ebitdaMes, 1), mm(d.ebitdaAcum, 1)],
                        ["Utilidad neta", "-", mm(51.8, 1)],
                        ["Flujo operacional (OCF)", "-", mm(58.4, 1)],
                      ].map((r) => (
                        <tr key={r[0]} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 pr-4 font-medium text-navy">{r[0]}</td>
                          <td className="py-2.5 px-4 text-right tabular-nums text-slate-700">{r[1]}</td>
                          <td className="py-2.5 pl-4 text-right tabular-nums text-slate-700">{r[2]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {notaCierre && <div className="mt-3">{notaCierre}</div>}
                </Card>
              </div>
            </div>
          )}

          {/* ════ VENTAS Y FORECAST ════ */}
          {tab === "ventas" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatTile
                  label="Ventas del mes"
                  value={mm(d.ventaMes)}
                  delta={`${d.deltaPpto >= 0 ? "+" : ""}${pct(d.deltaPpto)}`}
                  deltaTone={d.deltaPpto >= 0 ? "good" : "bad"}
                  caption="vs presupuesto"
                  spark={d.corte(ventas)}
                />
                <StatTile label="Ventas acumuladas" value={mm(d.ventasYTD)} caption={`${mes + 1} meses`} />
                <StatTile
                  label="Crecimiento interanual"
                  value={pct(d.deltaInteranual)}
                  delta={`vs ${MESES[mes]} 2025`}
                  deltaTone={d.deltaInteranual >= 0 ? "good" : "bad"}
                />
                <StatTile label="Ticket promedio" value={`${money(3.4, 1)} MM`} caption="por operación" />
              </div>

              <Insight tone="good">
                Las ventas del mes superan el presupuesto por tercer mes consecutivo. La Línea Retail explica la mayor
                parte del sobre cumplimiento gracias al contrato con Constructora Andes.
              </Insight>

              <Card
                title={comparar === "presupuesto" ? "Ventas reales vs. presupuesto" : "Ventas reales vs. año anterior"}
                subtitle={`Últimos ${Math.min(rangoVentas, mes + 1)} meses`}
                actions={
                  <div className="flex items-center gap-2">
                    <Segmented
                      size="sm"
                      label="Base de comparación"
                      options={[
                        { value: "presupuesto", label: "vs Presupuesto" },
                        { value: "anterior", label: "vs Año anterior" },
                      ]}
                      value={comparar}
                      onChange={setComparar}
                    />
                    <RangeToggle value={rangoVentas} onChange={setRangoVentas} />
                  </div>
                }
              >
                <BarChart
                  labels={labels(rangoVentas)}
                  a={serie(ventas, rangoVentas)}
                  b={serie(comparar === "presupuesto" ? presupuestoVentas : ventasAnoAnterior, rangoVentas)}
                  colorA={C.green}
                  colorB={C.blue}
                  nameA="Real"
                  nameB={comparar === "presupuesto" ? "Presupuesto" : "Año anterior"}
                  highlight={hl(rangoVentas)}
                  gapNote={(i) => {
                    const base = serie(comparar === "presupuesto" ? presupuestoVentas : ventasAnoAnterior, rangoVentas)[i];
                    const real = serie(ventas, rangoVentas)[i];
                    const delta = ((real - base) / base) * 100;
                    return `Real ${delta >= 0 ? "+" : ""}${pct(delta)} sobre ${comparar === "presupuesto" ? "presupuesto" : "año anterior"}`;
                  }}
                />
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card
                  title="Ventas por línea de negocio"
                  subtitle="Acumulado 12m · haz clic en una línea para filtrar los clientes"
                >
                  <HBarChart items={ventasPorLinea} color={C.blue} selected={lineaSel} onSelect={setLineaSel} />
                  {lineaSel && (
                    <p className="mt-3 text-xs text-slate-400">
                      {lineaSel}: {mm(ventasPorLinea.find((v) => v.name === lineaSel)?.monto ?? 0)} de {mm(455)} (
                      {(((ventasPorLinea.find((v) => v.name === lineaSel)?.monto ?? 0) / 455) * 100).toFixed(0)}%)
                    </p>
                  )}
                </Card>
                <Card title="Principales clientes" subtitle={lineaSel ? `Acumulado 12m · ${lineaSel}` : "Acumulado 12m"}>
                  {clientesFiltrados.length ? (
                    <DataTable
                      rowKey={(c) => c.cliente}
                      defaultSort={{ col: 1, dir: "desc" }}
                      cols={[
                        { label: "Cliente", render: (c) => c.cliente, sortValue: (c) => c.cliente },
                        { label: "Ventas", align: "right", render: (c) => mm(c.monto), sortValue: (c) => c.monto },
                        { label: "Part.", align: "right", render: (c) => pct(c.part), sortValue: (c) => c.part },
                      ]}
                      rows={clientesFiltrados}
                    />
                  ) : (
                    <EmptyState onClear={() => setLineaSel(null)} />
                  )}
                </Card>
              </div>

              {/* ── Forecast ── */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-base font-bold text-navy">Forecast de ventas</h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                    Proyección a 6 meses
                  </span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <StatTile label="Ventas últimos 12m" value={mm(ventasYTD12)} />
                  <StatTile label="Proyección 6 meses" value={mm(forecastTotal)} />
                  <StatTile
                    label="Crecimiento proyectado"
                    value={pct(crecimientoProyectado)}
                    delta="vs último trimestre"
                    deltaTone={crecimientoProyectado >= 0 ? "good" : "bad"}
                  />
                  <StatTile
                    label="Proyección FY vs. meta"
                    value={mm(proyeccionAnual)}
                    delta={`Meta ${mm(metaAnualForecast)}`}
                    deltaTone={proyeccionAnual >= metaAnualForecast ? "good" : "neutral"}
                  />
                </div>
                <Card title="Ventas: real y proyección" subtitle="12 meses reales + 6 meses proyectados">
                  <ForecastChart
                    labels={[...MESES, ...forecastMeses]}
                    values={[...ventas, ...forecastVentas]}
                    splitIndex={12}
                  />
                  <p className="text-[11px] text-slate-400 mt-3">* Meses proyectados: datos ficticios, no observados aún.</p>
                </Card>
              </div>
            </div>
          )}

          {/* ════ COMPRAS ════ */}
          {tab === "compras" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatTile label="Compras del mes" value={mm(d.comprasMes)} spark={d.corte(compras)} />
                <StatTile label="Compras acumuladas" value={mm(d.comprasAcum)} caption={`${mes + 1} meses`} />
                <StatTile
                  label="Compras / Ventas"
                  value={pct((d.comprasMes / d.ventaMes) * 100, 0)}
                  delta="Bajo el objetivo de 62%"
                  deltaTone="good"
                  deltaArrow={false}
                />
                <StatTile label="Proveedores activos" value="38" />
              </div>
              <Card
                title="Compras por mes"
                subtitle={`Últimos ${Math.min(rangoCompras, mes + 1)} meses`}
                actions={<RangeToggle value={rangoCompras} onChange={setRangoCompras} />}
              >
                <BarChart
                  labels={labels(rangoCompras)}
                  a={serie(compras, rangoCompras)}
                  colorA={C.orange}
                  nameA="Compras"
                  highlight={hl(rangoCompras)}
                />
              </Card>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Compras por categoría" subtitle="Acumulado 12m · haz clic para filtrar proveedores">
                  <HBarChart items={comprasPorCategoria} color={C.orange} selected={catCompraSel} onSelect={setCatCompraSel} />
                </Card>
                <Card
                  title="Principales proveedores"
                  subtitle={catCompraSel ? `Acumulado 12m · ${catCompraSel}` : "Acumulado 12m"}
                >
                  {provsFiltrados.length ? (
                    <DataTable
                      rowKey={(p) => p.prov}
                      defaultSort={{ col: 1, dir: "desc" }}
                      cols={[
                        { label: "Proveedor", render: (p) => p.prov, sortValue: (p) => p.prov },
                        { label: "Compras", align: "right", render: (p) => mm(p.monto), sortValue: (p) => p.monto },
                        { label: "Pago", align: "right", render: (p) => p.cond },
                      ]}
                      rows={provsFiltrados}
                    />
                  ) : (
                    <EmptyState onClear={() => setCatCompraSel(null)} />
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* ════ FLUJO DE CAJA ════ */}
          {tab === "caja" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatTile label="Ingresos del mes" value={mm(ingresosCaja[mes])} spark={d.corte(ingresosCaja)} />
                <StatTile label="Egresos del mes" value={mm(egresosCaja[mes])} />
                <StatTile
                  label="Flujo neto del mes"
                  value={mm(d.flujoNetoMes)}
                  delta={d.flujoNetoMes >= 0 ? "Positivo" : "Negativo"}
                  deltaTone={d.flujoNetoMes >= 0 ? "good" : "bad"}
                  deltaArrow={false}
                />
                <StatTile label="Saldo de caja" value={mm(d.saldoActual)} caption={`acumulado a ${MESES[mes]}`} spark={d.corte(saldoCaja)} />
              </div>
              <Insight tone="good">
                La caja acumula {mm(d.saldoActual)} y el flujo del mes vuelve a ser positivo. Con el nivel de egresos
                actual, la empresa tiene más de 2 meses de operación cubiertos.
              </Insight>
              <Card
                title="Ingresos vs. egresos de caja"
                subtitle={`Últimos ${Math.min(rangoCaja, mes + 1)} meses`}
                actions={<RangeToggle value={rangoCaja} onChange={setRangoCaja} />}
              >
                <BarChart
                  labels={labels(rangoCaja)}
                  a={serie(ingresosCaja, rangoCaja)}
                  b={serie(egresosCaja, rangoCaja)}
                  colorA={C.green}
                  colorB={C.orange}
                  nameA="Ingresos"
                  nameB="Egresos"
                  highlight={hl(rangoCaja)}
                />
              </Card>
              <Card title="Saldo de caja acumulado" subtitle="MM CLP">
                <LineChart
                  labels={labels(rangoCaja)}
                  values={serie(saldoCaja, rangoCaja)}
                  color={C.blue}
                  name="Saldo de caja"
                  fmt={(n) => mm(n)}
                  highlight={hl(rangoCaja)}
                />
              </Card>
              <Card title="Estado de flujo de efectivo · método indirecto" subtitle="FY 2026" meta={notaCierre}>
                <StatementTable rows={flujoIndirecto.map((r) => ({ label: r.label, kind: r.kind, values: [r.monto] }))} />
              </Card>
            </div>
          )}

          {/* ════ COBRANZA Y PAGOS ════ */}
          {tab === "cobranza" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Segmented
                  label="Lado de la cartera"
                  options={[
                    { value: "cobrar", label: "Por cobrar" },
                    { value: "pagar", label: "Por pagar" },
                  ]}
                  value={ladoCartera}
                  onChange={setLadoCartera}
                />
                {notaCierre}
              </div>

              {ladoCartera === "cobrar" ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <StatTile label="Total por cobrar" value={mm(totalCartera, 1)} />
                    <StatTile
                      label="DSO actual"
                      value={days(d.dsoMes)}
                      delta={d.dsoDelta === 0 ? "sin cambio" : plural(d.dsoDelta, "día") + (d.dsoDelta < 0 ? " menos" : " más")}
                      deltaTone={d.dsoDelta <= 0 ? "good" : "bad"}
                      deltaDown={d.dsoDelta < 0}
                      caption="que el mes anterior"
                      spark={d.corte(dso)}
                    />
                    <StatTile
                      label="Cartera vencida"
                      value={mm(carteraVencida, 1)}
                      delta={`${((carteraVencida / totalCartera) * 100).toFixed(0)}% del total`}
                      deltaTone="bad"
                      deltaArrow={false}
                    />
                    <StatTile label="Mayor a 90 días" value={mm(cartera[3].monto, 1)} delta="Requiere gestión" deltaTone="bad" deltaArrow={false} />
                  </div>
                  <Insight tone="serious">
                    Inversiones Aconcagua acumula 96 días de atraso y concentra el mayor riesgo de la cartera. Sugerimos
                    acordar un plan de pago antes del próximo despacho.
                  </Insight>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Cartera por antigüedad" subtitle="Haz clic en un tramo para filtrar los deudores">
                      <AgingBars rows={cartera} selected={filtroCobranza} onSelect={setFiltroCobranza} />
                    </Card>
                    <Card
                      title={
                        <>
                          Días de venta pendientes (DSO)
                          <InfoTip texto={DEFINICIONES.DSO} />
                        </>
                      }
                      subtitle="Evolución en días"
                      actions={<RangeToggle value={rangoCartera} onChange={setRangoCartera} />}
                    >
                      <LineChart
                        labels={labels(rangoCartera)}
                        values={serie(dso, rangoCartera)}
                        color={C.blue}
                        name="DSO"
                        fmt={(n) => days(n)}
                        target={{ value: 45, label: "Meta 45 días" }}
                        highlight={hl(rangoCartera)}
                      />
                    </Card>
                  </div>
                  <Card
                    title="Principales deudores"
                    subtitle={`Mostrando ${deudoresFiltrados.length} de ${topDeudores.length} deudores`}
                    actions={
                      <FilterChips
                        label="Filtrar por estado"
                        options={[
                          { value: "all", label: "Todos" },
                          { value: "good", label: "Al día", dot: STATUS_COLOR.good },
                          { value: "warning", label: "Atención", dot: STATUS_COLOR.warning },
                          { value: "serious", label: "Riesgo", dot: STATUS_COLOR.serious },
                          { value: "critical", label: "Crítico", dot: STATUS_COLOR.critical },
                        ]}
                        value={filtroCobranza}
                        onChange={setFiltroCobranza}
                      />
                    }
                  >
                    {deudoresFiltrados.length ? (
                      <DataTable
                        rowKey={(r) => r.cliente}
                        defaultSort={{ col: 1, dir: "desc" }}
                        cols={[
                          { label: "Cliente", render: (r) => r.cliente, sortValue: (r) => r.cliente },
                          { label: "Saldo", align: "right", render: (r) => mm(r.monto, 1), sortValue: (r) => r.monto },
                          { label: "Días", align: "right", render: (r) => String(r.dias), sortValue: (r) => r.dias },
                          { label: "Estado", render: (r) => <StatusBadge status={r.status} /> },
                        ]}
                        rows={deudoresFiltrados}
                      />
                    ) : (
                      <EmptyState onClear={() => setFiltroCobranza("all")} />
                    )}
                  </Card>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <StatTile label="Total por pagar" value={mm(totalPagar, 1)} />
                    <StatTile
                      label="DPO actual"
                      value={days(d.dpoMes)}
                      delta={d.dpoDelta === 0 ? "sin cambio" : plural(d.dpoDelta, "día") + (d.dpoDelta < 0 ? " menos" : " más")}
                      deltaTone="neutral"
                      caption="que el mes anterior"
                      spark={d.corte(dpo)}
                    />
                    <StatTile
                      label="Por pagar vencido"
                      value={mm(pagarVencido, 1)}
                      delta={`${((pagarVencido / totalPagar) * 100).toFixed(0)}% del total`}
                      deltaTone="bad"
                      deltaArrow={false}
                    />
                    <StatTile
                      label="Proveedores críticos (P1)"
                      value={String(proveedoresCriticos)}
                      delta="No se pueden atrasar"
                      deltaTone="bad"
                      deltaArrow={false}
                    />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Cuentas por pagar por antigüedad" subtitle="MM CLP">
                      <AgingBars rows={carteraPagar} />
                    </Card>
                    <Card
                      title={
                        <>
                          Días de pago a proveedores (DPO)
                          <InfoTip texto={DEFINICIONES.DPO} />
                        </>
                      }
                      subtitle="Evolución en días"
                      actions={<RangeToggle value={rangoCartera} onChange={setRangoCartera} />}
                    >
                      <LineChart
                        labels={labels(rangoCartera)}
                        values={serie(dpo, rangoCartera)}
                        color={C.orange}
                        name="DPO"
                        fmt={(n) => days(n)}
                        highlight={hl(rangoCartera)}
                      />
                    </Card>
                  </div>
                  <Card
                    title="Prioridad de pago a proveedores"
                    subtitle={`Mostrando ${pagosFiltrados.length} de ${proveedoresPago.length} proveedores`}
                    actions={
                      <FilterChips
                        label="Filtrar por prioridad"
                        options={[
                          { value: "all", label: "Todas" },
                          { value: "P1", label: "P1", dot: PRIORIDAD_COLOR.P1 },
                          { value: "P2", label: "P2", dot: PRIORIDAD_COLOR.P2 },
                          { value: "P3", label: "P3", dot: PRIORIDAD_COLOR.P3 },
                        ]}
                        value={filtroPrioridad}
                        onChange={setFiltroPrioridad}
                      />
                    }
                  >
                    {pagosFiltrados.length ? (
                      <DataTable
                        rowKey={(r) => r.prov}
                        defaultSort={{ col: 1, dir: "desc" }}
                        cols={[
                          { label: "Proveedor", render: (r) => r.prov, sortValue: (r) => r.prov },
                          { label: "Saldo", align: "right", render: (r) => mm(r.monto, 1), sortValue: (r) => r.monto },
                          {
                            label: "Prioridad",
                            render: (r) => (
                              <StatusBadge
                                status={r.prioridad === "P1" ? "critical" : r.prioridad === "P2" ? "warning" : "good"}
                                label={r.prioridad}
                              />
                            ),
                            sortValue: (r) => r.prioridad,
                          },
                          { label: "Motivo", render: (r) => <span className="whitespace-normal">{r.motivo}</span> },
                        ]}
                        rows={pagosFiltrados}
                      />
                    ) : (
                      <EmptyState onClear={() => setFiltroPrioridad("all")} />
                    )}
                  </Card>
                </>
              )}
            </div>
          )}

          {/* ════ RESULTADOS ════ */}
          {tab === "resultados" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Segmented
                  label="Vista del estado de resultados"
                  options={[
                    { value: "mes", label: "Resultado del mes" },
                    { value: "presupuesto", label: "vs Presupuesto" },
                    { value: "anual", label: "Anual IFRS" },
                  ]}
                  value={vistaResultados}
                  onChange={setVistaResultados}
                />
                {notaCierre}
              </div>

              {vistaResultados === "mes" && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <StatTile label="Ingresos" value={mm(61)} delta="+10,9%" deltaTone="good" caption="vs presupuesto" />
                    <StatTile label="Margen bruto" value={pct(41.3)} caption={mm(25.2, 1)} />
                    <StatTile
                      label={"EBITDA"}
                      value={mm(9.6, 1)}
                      delta="+37,1%"
                      deltaTone="good"
                      caption="vs presupuesto"
                    />
                    <StatTile label="Margen EBITDA" value={pct(15.8)} delta="+2,9 pp" deltaTone="good" caption="vs presupuesto" spark={ebitdaMargen} />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <Card title="Cascada del resultado" subtitle="De ingresos a EBITDA · Julio 2026" className="lg:col-span-3">
                      <Waterfall />
                    </Card>
                    <Card title="Detalle del mes" subtitle="Julio 2026, MM CLP" className="lg:col-span-2">
                      <StatementTable
                        rows={eerr.map((r) => ({
                          label: r.label,
                          kind: r.kind === "total" ? "total" : r.kind === "sub" ? "subtotal" : "line",
                          values: [r.real],
                        }))}
                      />
                      <button
                        type="button"
                        onClick={() => setVistaResultados("presupuesto")}
                        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded"
                      >
                        Ver presupuesto vs real
                        <IconChevronRight className="h-3 w-3" />
                      </button>
                    </Card>
                  </div>
                </>
              )}

              {vistaResultados === "presupuesto" && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <StatTile label="Ingresos vs. presupuesto" value={mm(61)} delta="+10,9%" deltaTone="good" />
                    <StatTile label="EBITDA vs. presupuesto" value={mm(9.6, 1)} delta="+37,1%" deltaTone="good" />
                    <StatTile label="Variaciones favorables" value={String(topVariaciones.filter((v) => v.tipo === "F").length)} deltaTone="good" />
                    <StatTile
                      label="Variaciones desfavorables"
                      value={String(topVariaciones.filter((v) => v.tipo === "U").length)}
                      delta="Requieren plan de acción"
                      deltaTone="bad"
                      deltaArrow={false}
                    />
                  </div>
                  <Card title="Estado de resultados · presupuesto vs. real" subtitle="Julio 2026, MM CLP">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                            <th className="py-2 pr-4">Concepto</th>
                            <th className="py-2 px-4 text-right">Presupuesto</th>
                            <th className="py-2 px-4 text-right">Real</th>
                            <th className="py-2 pl-4 text-right">Variación</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eerr.map((r) => {
                            const delta = ((r.real - r.pres) / Math.abs(r.pres)) * 100;
                            const good = r.real >= r.pres;
                            const emphasize = r.kind === "total" || r.kind === "sub";
                            return (
                              <tr
                                key={r.label}
                                className={`border-b border-slate-100 last:border-0 ${
                                  emphasize ? "bg-slate-50" : "hover:bg-slate-50 transition-colors"
                                }`}
                              >
                                <td className={`py-2.5 pr-4 ${emphasize ? "font-bold text-navy" : "font-medium text-slate-600"}`}>
                                  {r.label}
                                </td>
                                <td className="py-2.5 px-4 text-right text-slate-500 tabular-nums">{r.pres.toFixed(1)}</td>
                                <td className={`py-2.5 px-4 text-right tabular-nums ${emphasize ? "font-bold text-navy" : "font-semibold text-navy"}`}>
                                  {r.real.toFixed(1)}
                                </td>
                                <td
                                  className="py-2.5 pl-4 text-right font-semibold tabular-nums"
                                  style={{ color: good ? C.goodText : C.critical }}
                                >
                                  {delta > 0 ? "+" : ""}
                                  {delta.toFixed(1).replace(".", ",")}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  <Card
                    title="Principales variaciones del mes"
                    subtitle="Haz clic en una fila para ver la explicación y el plan de acción"
                    actions={
                      <FilterChips
                        label="Filtrar variaciones"
                        options={[
                          { value: "all", label: "Todas" },
                          { value: "F", label: "Favorables", dot: C.good },
                          { value: "U", label: "Desfavorables", dot: C.critical },
                        ]}
                        value={tipoVar}
                        onChange={(v) => {
                          setTipoVar(v);
                          setVarAbierta(null);
                        }}
                      />
                    }
                  >
                    <div>
                      {variacionesFiltradas.map((v, i) => (
                        <div key={v.item} className="border-b border-slate-100 last:border-0">
                          <button
                            type="button"
                            aria-expanded={varAbierta === i}
                            onClick={() => setVarAbierta((a) => (a === i ? null : i))}
                            className="w-full flex items-center justify-between gap-3 py-2.5 text-left hover:bg-slate-50 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <IconChevronRight
                                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${varAbierta === i ? "rotate-90" : ""}`}
                              />
                              <span className="font-medium text-navy text-sm truncate">{v.item}</span>
                            </span>
                            <span
                              className="tabular-nums font-semibold text-sm shrink-0"
                              style={{ color: v.tipo === "F" ? C.goodText : C.critical }}
                            >
                              {v.varMonto > 0 ? "+" : ""}
                              {mm(v.varMonto, 1)}
                            </span>
                          </button>
                          {varAbierta === i && (
                            <div className="bg-slate-50 rounded-lg p-4 mb-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Explicación</p>
                                <p className="text-slate-600">{v.explicacion}</p>
                              </div>
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Acción</p>
                                <p className="text-slate-600">{v.accion}</p>
                              </div>
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Responsable</p>
                                <p className="text-slate-600">
                                  {v.responsable}{" "}
                                  <span className="ml-1 rounded-full bg-white border border-slate-200 px-2 py-0.5 text-xs">
                                    {v.estado}
                                  </span>
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                </>
              )}

              {vistaResultados === "anual" && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <StatTile label="Ingresos ordinarios" value={mm(595.0)} delta="+16,1%" deltaTone="good" caption="vs año anterior" />
                    <StatTile label="Ganancia bruta" value={mm(226.9)} caption={`${pct((226.9 / 595.0) * 100)} margen`} />
                    <StatTile label="Resultado operacional" value={mm(82.5)} delta="+43,2%" deltaTone="good" caption="vs año anterior" />
                    <StatTile label="Ganancia del período" value={mm(51.8)} delta="+53,7%" deltaTone="good" caption="vs año anterior" />
                  </div>
                  <Card
                    title="Estado de Resultados por Función"
                    subtitle="Presentación IFRS (NIC 1) · Ejercicio terminado el 31 de julio de 2026, comparativo, MM CLP"
                  >
                    <StatementTable
                      cols={["Concepto", "Jul 2026", "Jul 2025"]}
                      rows={pnlIfrs.map((r) => ({ label: r.label, kind: r.kind, values: [r.actual, r.anterior] }))}
                    />
                    <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
                      Formato ilustrativo bajo Normas Internacionales de Información Financiera (NIIF/IFRS), método de
                      función de gasto (NIC 1.99). Meliora Advisory elabora los Estados Financieros bajo esta u otra
                      normativa según lo que aplique a tu empresa.
                    </p>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* ════ BALANCE ════ */}
          {tab === "balance" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatTile label="Total activos" value={mm(450.0)} />
                <StatTile label="Total pasivos" value={mm(210.0)} />
                <StatTile label="Total patrimonio" value={mm(240.0)} />
                <StatTile
                  label="Razón corriente"
                  value={`${(232.4 / 112.5).toFixed(2).replace(".", ",")}x`}
                  delta="Sana"
                  deltaTone="good"
                  deltaArrow={false}
                  caption="activos ctes. / pasivos ctes."
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Activos" subtitle="Al cierre de julio 2026, MM CLP" meta={notaCierre}>
                  <StatementTable rows={activos.map((r) => ({ label: r.label, kind: r.kind, values: [r.monto] }))} />
                </Card>
                <Card title="Pasivos y patrimonio" subtitle="Al cierre de julio 2026, MM CLP">
                  <StatementTable rows={pasivosPatrimonio.map((r) => ({ label: r.label, kind: r.kind, values: [r.monto] }))} />
                </Card>
              </div>
              <p className="text-xs text-slate-400 text-center">
                Balanceado: Total activos ($450,0 MM) = Total pasivos y patrimonio ($450,0 MM)
              </p>
            </div>
          )}

          {/* ════ PRODUCTOS Y STOCK ════ */}
          {tab === "productos" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <FilterChips
                  label="Filtrar por categoría"
                  options={[
                    { value: "all", label: "Todas las categorías" },
                    { value: "Retail", label: "Retail" },
                    { value: "Proyectos", label: "Proyectos" },
                    { value: "Servicios", label: "Servicios" },
                  ]}
                  value={catProd}
                  onChange={setCatProd}
                />
                {notaCierre}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatTile label="Margen promedio" value={pct(margenPromedio)} caption={catProd === "all" ? "todos los productos" : catProd} />
                <StatTile label="Producto más rentable" value={mejorProducto?.nombre ?? "-"} delta={mejorProducto ? pct(mejorProducto.margenPct) : undefined} deltaTone="good" />
                <StatTile label="Producto menos rentable" value={peorProducto?.nombre ?? "-"} delta={peorProducto ? pct(peorProducto.margenPct) : undefined} deltaTone="bad" />
                <StatTile label="SKUs con margen bajo 25%" value={String(productosFiltrados.filter((p) => p.margenPct < 25).length)} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Margen por producto" subtitle="Acumulado 12 meses · ordenado por margen %">
                  <HBarChart
                    items={[...productosFiltrados].sort((a, b) => b.margenPct - a.margenPct).map((p) => ({ name: p.nombre, monto: p.margenPct }))}
                    color={C.green}
                    fmt={(n) => pct(n)}
                  />
                </Card>
                <Card title="Detalle por producto" subtitle="Acumulado 12 meses, MM CLP">
                  {productosFiltrados.length ? (
                    <DataTable
                      rowKey={(p) => p.nombre}
                      defaultSort={{ col: 3, dir: "desc" }}
                      cols={[
                        { label: "Producto", render: (p) => p.nombre, sortValue: (p) => p.nombre },
                        { label: "Ventas", align: "right", render: (p) => mm(p.ventas, 1), sortValue: (p) => p.ventas },
                        { label: "Margen", align: "right", render: (p) => mm(p.margen, 1), sortValue: (p) => p.margen },
                        {
                          label: "Margen %",
                          align: "right",
                          render: (p) => (
                            <span className="font-semibold" style={{ color: p.margenPct >= 30 ? C.goodText : p.margenPct >= 20 ? C.ink2 : C.critical }}>
                              {pct(p.margenPct)}
                            </span>
                          ),
                          sortValue: (p) => p.margenPct,
                        },
                      ]}
                      rows={productosFiltrados}
                    />
                  ) : (
                    <EmptyState onClear={() => setCatProd("all")} />
                  )}
                </Card>
              </div>

              {/* ── Stock ── */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-base font-bold text-navy">Inventario</h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                    Valorizado por SKU
                  </span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <StatTile label="Valor total inventario" value={mm(valorInventario, 1)} />
                  <StatTile label="Cobertura promedio" value={days(coberturaPromedio)} caption="SKUs con stock" />
                  <StatTile label="SKU de mayor valor" value={skuMayorValor.sku} caption={mm(skuMayorValor.valor, 1)} />
                  <StatTile
                    label="SKUs en quiebre"
                    value={String(stock.filter((s) => s.estado === "critical").length)}
                    delta="Requieren reposición"
                    deltaTone="bad"
                    deltaArrow={false}
                  />
                </div>
                <Card
                  title="Stock por SKU"
                  subtitle={`Mostrando ${stockFiltrado.length} de ${stock.length} SKU`}
                  actions={
                    <div className="flex flex-wrap items-center gap-3">
                      <FilterChips
                        label="Filtrar por estado de stock"
                        options={[
                          { value: "all", label: "Todos" },
                          { value: "good", label: "Al día", dot: STATUS_COLOR.good },
                          { value: "warning", label: "Atención", dot: STATUS_COLOR.warning },
                          { value: "critical", label: "Crítico", dot: STATUS_COLOR.critical },
                        ]}
                        value={estadoStock}
                        onChange={setEstadoStock}
                      />
                      <SearchInput value={qStock} onChange={setQStock} placeholder="Buscar SKU o producto" />
                    </div>
                  }
                >
                  {stockFiltrado.length ? (
                    <DataTable
                      rowKey={(s) => s.sku}
                      cols={[
                        { label: "SKU", render: (s) => s.sku, sortValue: (s) => s.sku },
                        { label: "Producto", render: (s) => s.nombre, sortValue: (s) => s.nombre },
                        { label: "Unidades", align: "right", render: (s) => s.unidades.toLocaleString("es-CL"), sortValue: (s) => s.unidades },
                        { label: "Valor", align: "right", render: (s) => mm(s.valor, 1), sortValue: (s) => s.valor },
                        { label: "Cobertura", align: "right", render: (s) => (s.estado === "critical" ? "-" : days(s.dias)), sortValue: (s) => s.dias },
                        { label: "Estado", render: (s) => <StatusBadge status={s.estado} /> },
                      ]}
                      rows={stockFiltrado}
                    />
                  ) : (
                    <EmptyState
                      onClear={() => {
                        setQStock("");
                        setEstadoStock("all");
                      }}
                    />
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* ════ CAPEX Y DOTACIÓN ════ */}
          {tab === "capex" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatTile label="Presupuesto CAPEX anual" value={mm(capexPresupuesto)} />
                <StatTile
                  label="Ejecutado YTD"
                  value={mm(capexEjecutado)}
                  delta={`${pct((capexEjecutado / capexPresupuesto) * 100, 0)} del presupuesto`}
                  deltaTone="good"
                />
                <StatTile label="Por ejecutar" value={mm(capexPresupuesto - capexEjecutado)} />
                <StatTile
                  label="Proyectos retrasados"
                  value={String(capexRetrasados)}
                  delta="Requieren seguimiento"
                  deltaTone={capexRetrasados === 0 ? "good" : "bad"}
                  deltaArrow={false}
                />
              </div>
              <Card title="Registro CAPEX" subtitle="Presupuesto vs. ejecutado por proyecto, MM CLP">
                <DataTable
                  rowKey={(c) => c.proyecto}
                  defaultSort={{ col: 2, dir: "desc" }}
                  cols={[
                    { label: "Proyecto", render: (c) => c.proyecto, sortValue: (c) => c.proyecto },
                    { label: "Categoría", render: (c) => c.categoria, sortValue: (c) => c.categoria },
                    { label: "Presupuesto", align: "right", render: (c) => mm(c.presupuesto, 1), sortValue: (c) => c.presupuesto },
                    { label: "Ejecutado", align: "right", render: (c) => mm(c.ejecutado, 1), sortValue: (c) => c.ejecutado },
                    { label: "% Avance", align: "right", render: (c) => pct((c.ejecutado / c.presupuesto) * 100, 0), sortValue: (c) => c.ejecutado / c.presupuesto },
                    { label: "Estado", render: (c) => <StatusBadge status={CAPEX_ESTADO[c.estado]} label={c.estado} /> },
                  ]}
                  rows={capex}
                />
              </Card>

              {/* ── Dotación ── */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-base font-bold text-navy">Dotación y nómina</h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                    Julio 2026
                  </span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <StatTile
                    label="Dotación total"
                    value={`${totalHC} personas`}
                    delta={`+${dotacion.reduce((a, dd) => a + dd.variacion, 0)}`}
                    deltaTone="good"
                    caption="vs mes anterior"
                  />
                  <StatTile label="Costo nómina del mes" value={mm(totalNomina, 1)} />
                  <StatTile label="Costo promedio / persona" value={`${money((totalNomina / totalHC) * 1000, 0)} mil`} />
                  <StatTile label="Rotación anual" value={pct(7.8)} delta="Bajo la industria" deltaTone="good" deltaArrow={false} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card title="Dotación por área" subtitle="Headcount de julio 2026">
                    <DataTable
                      rowKey={(r) => r.area}
                      defaultSort={{ col: 1, dir: "desc" }}
                      cols={[
                        { label: "Área", render: (r) => r.area, sortValue: (r) => r.area },
                        { label: "Dotación", align: "right", render: (r) => String(r.hc), sortValue: (r) => r.hc },
                        {
                          label: "Variación",
                          align: "right",
                          render: (r) => (
                            <span className="font-semibold" style={{ color: r.variacion > 0 ? C.goodText : C.ink2 }}>
                              {r.variacion > 0 ? "+" : ""}
                              {r.variacion}
                            </span>
                          ),
                          sortValue: (r) => r.variacion,
                        },
                      ]}
                      rows={dotacion}
                    />
                  </Card>
                  <Card title="Costo de nómina por ítem" subtitle="MM CLP">
                    <HBarChart items={costoNomina} color={C.magenta} fmt={(n) => mm(n, 1)} />
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* ════ TRIBUTARIO ════ */}
          {tab === "tributario" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatTile label="Total pendiente de pago" value={mm(totalPendienteTax, 1)} caption="próximos vencimientos" />
                <StatTile
                  label={"IVA del mes (F29)"}
                  value={mm(14.8, 1)}
                  caption="vence 12 ago"
                />
                <StatTile label="Cotizaciones del mes" value={mm(8.6, 1)} caption="vencen 13 ago" />
                <StatTile
                  label="Próximo vencimiento"
                  value={proximoVencimiento?.vencimiento ?? "-"}
                  delta={proximoVencimiento ? "Pendiente" : undefined}
                  deltaTone="neutral"
                  caption={proximoVencimiento?.obligacion}
                />
              </div>
              <Card
                title={
                  <>
                    Calendario de obligaciones tributarias
                    <InfoTip texto={DEFINICIONES.F29} />
                  </>
                }
                subtitle="IVA, PPM, cotizaciones y Renta"
              >
                <DataTable
                  rowKey={(t) => t.obligacion}
                  cols={[
                    { label: "Obligación", render: (t) => <span className="whitespace-normal">{t.obligacion}</span> },
                    { label: "Vencimiento", render: (t) => t.vencimiento },
                    { label: "Monto", align: "right", render: (t) => (t.monto > 0 ? mm(t.monto, 1) : "-"), sortValue: (t) => t.monto },
                    { label: "Estado", render: (t) => <StatusBadge status={TAX_ESTADO[t.estado]} label={t.estado} /> },
                  ]}
                  rows={calendarioTributario}
                />
              </Card>
              <p className="text-[11px] text-slate-400 text-center">
                Calendario ilustrativo con obligaciones tributarias chilenas (IVA/F29, PPM, cotizaciones previsionales y
                Declaración de Renta/F22).
              </p>
            </div>
          )}
        </div>

        {/* ── CTA ── */}
        <div className="mt-10 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#243759] to-navy p-6 sm:p-8 text-center print:hidden">
          <div aria-hidden className="pointer-events-none absolute -bottom-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald/20 blur-3xl" />
          <div className="relative">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
              Esto es solo un ejemplo: el tuyo se arma con tus propios datos
            </h2>
            <p className="text-slate-300 max-w-lg mx-auto mb-5 text-sm">
              Conversemos sobre qué indicadores le faltan hoy a tu empresa y cómo se vería tu reporte gerencial mensual.
            </p>
            <a
              href="https://melioraadvisory.cl/contacto/"
              className="inline-flex items-center justify-center rounded-lg bg-emerald px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald/25 hover:bg-emerald-dark hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Agendar reunión gratuita
            </a>
          </div>
        </div>
        <p className="hidden print:block text-[10px] text-slate-400 text-center mt-6">
          Reporte generado por Portal Meliora · cifras ficticias de demostración
        </p>
      </div>
    </div>
  );
}
