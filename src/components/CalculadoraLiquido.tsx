"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { resolverDesdeLiquido, type VariableAjustable } from "../lib/remuneraciones/motor.ts";
import { periodos } from "../lib/remuneraciones/parametros/index.ts";
import { descargarPDF, bloquesATexto, type Bloque } from "../lib/pdf.ts";
import { FORM_ENDPOINT } from "../lib/formularios.ts";
import {
  panelesCostoEmpresa,
  panelesLiquidacion,
  variablesDelCalculo,
} from "../lib/remuneraciones/desglose-pdf.ts";
import type {
  ModoGratificacion,
  SistemaSalud,
  TipoContrato,
} from "../lib/remuneraciones/tipos.ts";

const fmt = (n: number) => `$${Math.round(n).toLocaleString("es-CL")}`;

function parseCLP(s: string): number {
  const digits = s.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function parseUF(s: string): number {
  const n = parseFloat(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald bg-white";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
const resueltoClass =
  "w-full rounded-lg border border-emerald bg-emerald/5 px-3.5 py-2.5 text-sm font-bold text-emerald tabular-nums";

const ajustes: { key: VariableAjustable; label: string; sub: string }[] = [
  { key: "otrosImponibles", label: "El bono imponible", sub: "dejo fijo el sueldo base" },
  { key: "sueldoBase", label: "El sueldo base", sub: "sin bonos de por medio" },
  { key: "noImponible", label: "La colación", sub: "no imponible, no tributa" },
];

function Fila({
  label,
  value,
  bold,
  negative,
  note,
}: {
  label: string;
  value: number;
  bold?: boolean;
  negative?: boolean;
  note?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <div>
        <span className={`text-sm ${bold ? "font-semibold text-navy" : "text-slate-600"}`}>
          {label}
        </span>
        {note && <span className="ml-2 text-xs text-slate-400">{note}</span>}
      </div>
      <span
        className={`text-sm tabular-nums ${
          bold ? "font-bold text-navy" : negative ? "text-red-600" : "text-slate-700"
        }`}
      >
        {negative ? `−${fmt(value)}` : fmt(value)}
      </span>
    </div>
  );
}

export function CalculadoraLiquido() {
  const [periodoKey, setPeriodoKey] = useState(periodos[0].clave);
  const [objetivo, setObjetivo] = useState("");
  const [ajuste, setAjuste] = useState<VariableAjustable>("otrosImponibles");

  const [sueldoBase, setSueldoBase] = useState("");
  const [otrosImponibles, setOtrosImponibles] = useState("");
  const [colacion, setColacion] = useState("");
  const [gratMode, setGratMode] = useState<ModoGratificacion>("legal");
  const [gratManual, setGratManual] = useState("");
  const [afpKey, setAfpKey] = useState("modelo");
  const [salud, setSalud] = useState<SistemaSalud>("fonasa");
  const [planUF, setPlanUF] = useState("");
  const [contrato, setContrato] = useState<TipoContrato>("indefinido");
  const [horasExtra, setHorasExtra] = useState("");
  const [movilizacion, setMovilizacion] = useState("");
  const [otrosDescuentos, setOtrosDescuentos] = useState("");
  const [mutualRecargo, setMutualRecargo] = useState("");

  const periodo = periodos.find((p) => p.clave === periodoKey) ?? periodos[0];

  const resultado = useMemo(() => {
    const meta = parseCLP(objetivo);
    if (meta <= 0) return null;
    return resolverDesdeLiquido(
      {
        sueldoBase: ajuste === "sueldoBase" ? 0 : parseCLP(sueldoBase),
        modoGratificacion: gratMode,
        gratificacionManual: parseCLP(gratManual),
        afpKey,
        salud,
        planIsapreUF: salud === "isapre" ? parseUF(planUF) : 0,
        contrato,
        horasExtra: parseCLP(horasExtra),
        otrosImponibles: ajuste === "otrosImponibles" ? 0 : parseCLP(otrosImponibles),
        colacion: ajuste === "noImponible" ? 0 : parseCLP(colacion),
        movilizacion: parseCLP(movilizacion),
        otrosDescuentos: parseCLP(otrosDescuentos),
        mutualRecargo: parseUF(mutualRecargo),
      },
      periodo,
      meta,
      ajuste
    );
  }, [
    objetivo,
    ajuste,
    sueldoBase,
    otrosImponibles,
    colacion,
    gratMode,
    gratManual,
    afpKey,
    salud,
    planUF,
    contrato,
    horasExtra,
    movilizacion,
    otrosDescuentos,
    mutualRecargo,
    periodo,
  ]);

  const liq = resultado?.costo.liquidacion;
  const etiquetaAjuste = ajustes.find((a) => a.key === ajuste)!.label;

  // Mismos datos para el PDF y para el correo. Arriba van las tres cifras que
  // resuelven la pregunta: la variable despejada, el líquido y el costo.
  const bloques = useMemo<Bloque[]>(() => {
    if (!resultado || !liq) return [];
    return [
      {
        tipo: "kpis",
        items: [
          {
            etiqueta: `${etiquetaAjuste} debe ser`,
            valor: fmt(resultado.valor),
            estilo: "emerald",
          },
          {
            etiqueta: "Costo para la empresa",
            valor: fmt(resultado.costo.costoTotal),
            estilo: "navy",
          },
          {
            etiqueta: "Sueldo líquido",
            valor: fmt(liq.liquido),
            nota:
              liq.liquido !== parseCLP(objetivo)
                ? `objetivo ${fmt(parseCLP(objetivo))}, el más cercano por sobre`
                : "el objetivo pedido",
            estilo: "suave",
          },
        ],
      },
      ...panelesLiquidacion(resultado.costo, periodo, "Bono imponible"),
      ...panelesCostoEmpresa(resultado.costo, periodo, contrato),
      variablesDelCalculo({
        costo: resultado.costo,
        p: periodo,
        contrato,
        salud,
        modoGratificacion: gratMode,
        horas: parseCLP(horasExtra),
        mutualRecargo: parseUF(mutualRecargo),
      }),
      {
        tipo: "nota",
        texto:
          "Lo que fija el líquido es el total imponible, no cómo lo repartas: mover plata entre sueldo base y bono no cambia ni el líquido ni el costo, salvo que haya horas extra (su valor se calcula sobre el sueldo base).",
      },
      {
        tipo: "nota",
        texto: `Cálculo referencial con los indicadores de ${periodo.etiqueta}. No reemplaza una liquidación de sueldo oficial.`,
      },
    ];
  }, [
    resultado,
    liq,
    periodo,
    objetivo,
    etiquetaAjuste,
    contrato,
    salud,
    gratMode,
    horasExtra,
    mutualRecargo,
  ]);

  const resumenTexto = useMemo(() => bloquesATexto(bloques), [bloques]);

  const descargar = async () => {
    window.gtag?.("event", "calculadora_liquido_pdf", { ajuste });
    await descargarPDF({
      titulo: "Desde el líquido: " + etiquetaAjuste.toLowerCase(),
      periodo: periodo.etiqueta,
      bloques,
      archivo: "desde-el-liquido-meliora",
      nota: "Valores referenciales. No reemplazan una liquidación de sueldo oficial.",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ── Entradas ── */}
      <div className="no-print rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-navy">Qué quieres pagar</h2>
          <select
            value={periodoKey}
            onChange={(e) => setPeriodoKey(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 bg-white"
            aria-label="Período"
          >
            {periodos.map((p) => (
              <option key={p.clave} value={p.clave}>
                {p.etiqueta}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="liq-objetivo" className={labelClass}>
              Líquido que quieres que reciba
            </label>
            <input
              id="liq-objetivo"
              inputMode="numeric"
              className={`${inputClass} text-lg font-semibold`}
              placeholder="$1.200.000"
              value={objetivo ? `$${parseCLP(objetivo).toLocaleString("es-CL")}` : ""}
              onChange={(e) => setObjetivo(e.target.value)}
            />
          </div>

          <div>
            <span className={labelClass}>¿Qué ajusto para llegar?</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ajustes.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => setAjuste(a.key)}
                  className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    ajuste === a.key
                      ? "border-emerald bg-emerald/5 ring-1 ring-emerald/30"
                      : "border-slate-200 bg-white hover:border-emerald/40"
                  }`}
                >
                  <span
                    className={`block text-xs font-bold ${
                      ajuste === a.key ? "text-emerald" : "text-navy"
                    }`}
                  >
                    {a.label}
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">{a.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="liq-sueldo" className={labelClass}>
                Sueldo base
              </label>
              {ajuste === "sueldoBase" ? (
                <p className={resueltoClass}>
                  {resultado ? fmt(resultado.valor) : "—"}
                  <span className="ml-2 text-[11px] font-normal text-emerald/70">
                    calculado
                  </span>
                </p>
              ) : (
                <input
                  id="liq-sueldo"
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="$700.000"
                  value={sueldoBase ? `$${parseCLP(sueldoBase).toLocaleString("es-CL")}` : ""}
                  onChange={(e) => setSueldoBase(e.target.value)}
                />
              )}
            </div>
            <div>
              <label htmlFor="liq-bono" className={labelClass}>
                Bono imponible
              </label>
              {ajuste === "otrosImponibles" ? (
                <p className={resueltoClass}>
                  {resultado ? fmt(resultado.valor) : "—"}
                  <span className="ml-2 text-[11px] font-normal text-emerald/70">
                    calculado
                  </span>
                </p>
              ) : (
                <input
                  id="liq-bono"
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="$0"
                  value={
                    otrosImponibles
                      ? `$${parseCLP(otrosImponibles).toLocaleString("es-CL")}`
                      : ""
                  }
                  onChange={(e) => setOtrosImponibles(e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="liq-grat" className={labelClass}>
                Gratificación
              </label>
              <select
                id="liq-grat"
                value={gratMode}
                onChange={(e) => setGratMode(e.target.value as ModoGratificacion)}
                className={inputClass}
              >
                <option value="legal">Legal (25%, tope 4,75 IMM)</option>
                <option value="manual">Monto pactado</option>
                <option value="ninguna">Sin gratificación</option>
              </select>
            </div>
            {gratMode === "manual" ? (
              <div>
                <label htmlFor="liq-grat-monto" className={labelClass}>
                  Monto gratificación
                </label>
                <input
                  id="liq-grat-monto"
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="$0"
                  value={gratManual ? `$${parseCLP(gratManual).toLocaleString("es-CL")}` : ""}
                  onChange={(e) => setGratManual(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label htmlFor="liq-he" className={labelClass}>
                  Horas extra (50%)
                </label>
                <input
                  id="liq-he"
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="0"
                  value={horasExtra}
                  onChange={(e) => setHorasExtra(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="liq-afp" className={labelClass}>
                AFP
              </label>
              <select
                id="liq-afp"
                value={afpKey}
                onChange={(e) => setAfpKey(e.target.value)}
                className={inputClass}
              >
                {Object.entries(periodo.afps).map(([key, afp]) => (
                  <option key={key} value={key}>
                    {afp.nombre} ({afp.tasa.toLocaleString("es-CL")}%)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="liq-salud" className={labelClass}>
                Salud
              </label>
              <select
                id="liq-salud"
                value={salud}
                onChange={(e) => setSalud(e.target.value as SistemaSalud)}
                className={inputClass}
              >
                <option value="fonasa">Fonasa (7%)</option>
                <option value="isapre">Isapre (plan en UF)</option>
              </select>
            </div>
          </div>

          {salud === "isapre" && (
            <div>
              <label htmlFor="liq-plan" className={labelClass}>
                Plan isapre (UF)
              </label>
              <input
                id="liq-plan"
                inputMode="decimal"
                className={inputClass}
                placeholder="4,5"
                value={planUF}
                onChange={(e) => setPlanUF(e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="liq-contrato" className={labelClass}>
                Contrato
              </label>
              <select
                id="liq-contrato"
                value={contrato}
                onChange={(e) => setContrato(e.target.value as TipoContrato)}
                className={inputClass}
              >
                <option value="indefinido">Indefinido</option>
                <option value="plazo_fijo">Plazo fijo</option>
              </select>
            </div>
            <div>
              <label htmlFor="liq-col" className={labelClass}>
                Colación
              </label>
              {ajuste === "noImponible" ? (
                <p className={resueltoClass}>
                  {resultado ? fmt(resultado.valor) : "—"}
                  <span className="ml-2 text-[11px] font-normal text-emerald/70">
                    calculado
                  </span>
                </p>
              ) : (
                <input
                  id="liq-col"
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="$0"
                  value={colacion ? `$${parseCLP(colacion).toLocaleString("es-CL")}` : ""}
                  onChange={(e) => setColacion(e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="liq-mov" className={labelClass}>
                Movilización
              </label>
              <input
                id="liq-mov"
                inputMode="numeric"
                className={inputClass}
                placeholder="$0"
                value={movilizacion ? `$${parseCLP(movilizacion).toLocaleString("es-CL")}` : ""}
                onChange={(e) => setMovilizacion(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="liq-od" className={labelClass}>
                Otros descuentos
              </label>
              <input
                id="liq-od"
                inputMode="numeric"
                className={inputClass}
                placeholder="$0 (APV, préstamos)"
                value={
                  otrosDescuentos ? `$${parseCLP(otrosDescuentos).toLocaleString("es-CL")}` : ""
                }
                onChange={(e) => setOtrosDescuentos(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="liq-mut" className={labelClass}>
              Recargo mutual (%){" "}
              <span className="text-xs font-normal text-slate-400">según riesgo</span>
            </label>
            <input
              id="liq-mut"
              inputMode="decimal"
              className={inputClass}
              placeholder="0,00"
              value={mutualRecargo}
              onChange={(e) => setMutualRecargo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Resultados ── */}
      <div className="print-area">
        {!resultado || !liq ? (
          <div className="no-print rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 flex items-center justify-center min-h-[300px]">
            <p className="text-sm text-slate-400 text-center max-w-xs">
              Ingresa el líquido que quieres pagar y elige qué variable ajustar.
              El resto lo puedes ir moviendo y el cálculo se rehace solo.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="print-only mb-6 pb-4 border-b border-slate-200">
              <p className="text-lg font-bold text-navy">Meliora Advisory</p>
              <p className="text-xs text-slate-500">
                Calculadora desde el líquido —
                melioraadvisory.cl/calculadora-liquido — valores referenciales,
                período {periodo.etiqueta}
              </p>
            </div>

            <div className="rounded-xl bg-emerald/5 border border-emerald/20 px-5 py-4 mb-5">
              <p className="text-xs font-semibold text-emerald uppercase tracking-wider">
                {etiquetaAjuste} debe ser
              </p>
              <p className="text-3xl font-bold text-emerald tabular-nums mt-1">
                {fmt(resultado.valor)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                para un líquido de {fmt(liq.liquido)}
                {liq.liquido !== parseCLP(objetivo) && " (el más cercano por sobre el objetivo)"}
              </p>
            </div>

            <p className="text-xs font-semibold text-emerald uppercase tracking-wider mb-1">
              Haberes
            </p>
            <Fila label="Sueldo base" value={liq.sueldoBase} />
            {liq.horasExtra > 0 && <Fila label="Horas extra (50%)" value={liq.horasExtra} />}
            {liq.gratificacion > 0 && <Fila label="Gratificación" value={liq.gratificacion} />}
            {liq.otrosImponibles > 0 && (
              <Fila label="Bono imponible" value={liq.otrosImponibles} />
            )}
            <div className="border-t border-slate-100 mt-1 pt-1">
              <Fila label="Total imponible" value={liq.totalImponible} bold />
            </div>
            {liq.totalNoImponible > 0 && (
              <Fila
                label="No imponibles"
                value={liq.totalNoImponible}
                note="colación + movilización"
              />
            )}

            <p className="text-xs font-semibold text-emerald uppercase tracking-wider mt-5 mb-1">
              Descuentos del trabajador
            </p>
            {liq.baseCotizacion < liq.totalImponible && (
              <Fila
                label={`Base topeada (${periodo.topeImponibleUF} UF)`}
                value={liq.baseCotizacion}
                note="para AFP y salud"
              />
            )}
            <Fila
              label={`AFP ${liq.afpNombre} (${liq.afpTasa.toLocaleString("es-CL")}%)`}
              value={liq.afp}
              negative
            />
            <Fila label="Salud legal (7%)" value={liq.salud7} negative />
            {liq.adicionalIsapre > 0 && (
              <Fila
                label="Adicional isapre"
                value={liq.adicionalIsapre}
                negative
                note={`plan ${fmt(liq.planIsapre)}`}
              />
            )}
            {liq.cesantiaTrabajador > 0 && (
              <Fila
                label={`Seguro de cesantía (${periodo.cesantia[contrato].trabajador.toLocaleString("es-CL")}%)`}
                value={liq.cesantiaTrabajador}
                negative
              />
            )}
            <Fila
              label="Impuesto único"
              value={liq.impuesto}
              negative
              note={`base ${fmt(liq.baseTributable)}`}
            />
            {liq.otrosDescuentos > 0 && (
              <Fila label="Otros descuentos" value={liq.otrosDescuentos} negative />
            )}

            <div className="mt-4 rounded-xl bg-emerald/5 border border-emerald/20 px-4 py-3 flex items-baseline justify-between">
              <span className="text-sm font-bold text-navy">Sueldo líquido</span>
              <span className="text-xl font-bold text-emerald tabular-nums">
                {fmt(liq.liquido)}
              </span>
            </div>

            <p className="text-xs font-semibold text-emerald uppercase tracking-wider mt-6 mb-1">
              Aportes del empleador
            </p>
            <Fila
              label={`Seguro de cesantía (${periodo.cesantia[contrato].empleador.toLocaleString("es-CL")}%)`}
              value={resultado.costo.cesantiaEmpleador}
            />
            <Fila
              label={`ISL / Mutual (${resultado.costo.mutualTasa.toLocaleString("es-CL", { maximumFractionDigits: 2 })}%)`}
              value={resultado.costo.mutual}
              note="ley 16.744"
            />
            {resultado.costo.aportesPension.map((a) => (
              <Fila
                key={a.nombre}
                label={`${a.nombre} (${a.tasa.toLocaleString("es-CL")}%)`}
                value={a.monto}
              />
            ))}
            <div className="border-t border-slate-100 mt-1 pt-1">
              <Fila
                label={`Total aporte patronal (${(
                  periodo.cesantia[contrato].empleador +
                  resultado.costo.mutualTasa +
                  resultado.costo.aportesPension.reduce((s, a) => s + a.tasa, 0)
                ).toLocaleString("es-CL", { maximumFractionDigits: 2 })}%)`}
                value={resultado.costo.totalAportes}
                bold
              />
            </div>

            <div className="mt-4 rounded-xl bg-navy px-4 py-3 flex items-baseline justify-between">
              <span className="text-sm font-bold text-white">
                Costo total de contratación
              </span>
              <span className="text-xl font-bold text-white tabular-nums">
                {fmt(resultado.costo.costoTotal)}
              </span>
            </div>

            <div className="mt-5">
              <p className="text-xs text-slate-500 mb-2">
                De cada {fmt(resultado.costo.costoTotal)} que pagas, al bolsillo del
                trabajador llegan {fmt(liq.liquido)} —{" "}
                <span className="font-semibold text-navy">
                  {Math.round(resultado.costo.proporcionLiquido * 100)}%
                </span>
                .
              </p>
              <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-3 bg-emerald"
                  style={{
                    width: `${Math.min(100, Math.round(resultado.costo.proporcionLiquido * 100))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[11px] text-slate-400">Líquido del trabajador</span>
                <span className="text-[11px] text-slate-400">Cotizaciones e impuestos</span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Lo que fija el líquido es el{" "}
                <span className="font-semibold text-navy">total imponible</span>, no cómo lo
                repartas: mover plata entre sueldo base y bono no cambia ni el líquido ni el
                costo, salvo que haya horas extra (su valor se calcula sobre el sueldo base).
              </p>
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
              Cálculo referencial con los indicadores de {periodo.etiqueta} (UF{" "}
              {periodo.uf.toLocaleString("es-CL")}, UTM {periodo.utm.toLocaleString("es-CL")}).
              La colación y la movilización no tributan mientras sean montos razonables y
              acreditables: si se usan como sueldo encubierto, el SII las reclasifica como
              imponibles.
            </p>

            <div className="no-print mt-6">
              <button
                type="button"
                onClick={descargar}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-navy px-5 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white transition-colors"
              >
                Descargar PDF
              </button>
            </div>
          </div>
        )}

        {resultado && (
          <div className="no-print mt-6 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h3 className="text-base font-bold text-navy mb-1">
                Recibe este cálculo en tu correo
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Te lo enviamos junto a una revisión de la estructura de sueldos. Sin spam.
              </p>
              <form
                action={FORM_ENDPOINT}
                method="POST"
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="hidden"
                  name="_next"
                  value="https://melioraadvisory.cl/contacto/gracias/"
                />
                <input type="hidden" name="formulario" value="liquido" />
                <input
                  type="text"
                  name="_honey"
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />
                <input type="hidden" name="desglose" value={resumenTexto} />
                <input
                  name="email"
                  type="email"
                  required
                  className={`${inputClass} flex-1`}
                  placeholder="tucorreo@empresa.cl"
                  aria-label="Email"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-emerald px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-dark transition-colors"
                >
                  Enviarme el cálculo
                </button>
              </form>
            </div>

            <div className="rounded-2xl bg-navy p-6 sm:p-8">
              <h3 className="text-lg font-bold text-white mb-2">
                ¿Estructurando sueldos para tu equipo?
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-5">
                Armamos la estructura de remuneraciones de tu pyme, con el costo
                patronal proyectado y al día con la reforma previsional.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/planes"
                  className="inline-flex items-center justify-center rounded-lg bg-emerald px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-dark transition-colors"
                >
                  Conocer los planes
                </Link>
                <Link
                  href="/diagnostico"
                  className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Diagnóstico Financiero gratis
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
