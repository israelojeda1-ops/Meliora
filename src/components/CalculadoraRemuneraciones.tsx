"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { calcularEmpleador } from "../lib/remuneraciones/motor.ts";
import { periodos } from "../lib/remuneraciones/parametros/index.ts";
import type {
  ModoGratificacion,
  SistemaSalud,
  TipoContrato,
} from "../lib/remuneraciones/tipos.ts";

const FORM_ENDPOINT = "https://formsubmit.co/israelojeda1@gmail.com";

const fmt = (n: number) => `$${Math.round(n).toLocaleString("es-CL")}`;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

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

export function CalculadoraRemuneraciones() {
  const [modo, setModo] = useState<"trabajador" | "empleador">("trabajador");
  const [periodoKey, setPeriodoKey] = useState(periodos[0].clave);

  const [sueldoBase, setSueldoBase] = useState("");
  const [gratMode, setGratMode] = useState<ModoGratificacion>("legal");
  const [gratManual, setGratManual] = useState("");
  const [afpKey, setAfpKey] = useState("modelo");
  const [salud, setSalud] = useState<SistemaSalud>("fonasa");
  const [planUF, setPlanUF] = useState("");
  const [contrato, setContrato] = useState<TipoContrato>("indefinido");
  const [horasExtra, setHorasExtra] = useState("");
  const [otrosImponibles, setOtrosImponibles] = useState("");
  const [colacion, setColacion] = useState("");
  const [movilizacion, setMovilizacion] = useState("");
  const [otrosDescuentos, setOtrosDescuentos] = useState("");
  const [mutualRecargo, setMutualRecargo] = useState("");

  const periodo = periodos.find((p) => p.clave === periodoKey) ?? periodos[0];

  const resultado = useMemo(() => {
    const base = parseCLP(sueldoBase);
    if (base <= 0) return null;
    return calcularEmpleador(
      {
        sueldoBase: base,
        modoGratificacion: gratMode,
        gratificacionManual: parseCLP(gratManual),
        afpKey,
        salud,
        planIsapreUF: salud === "isapre" ? parseUF(planUF) : 0,
        contrato,
        horasExtra: parseCLP(horasExtra),
        otrosImponibles: parseCLP(otrosImponibles),
        colacion: parseCLP(colacion),
        movilizacion: parseCLP(movilizacion),
        otrosDescuentos: parseCLP(otrosDescuentos),
        mutualRecargo: parseUF(mutualRecargo),
      },
      periodo
    );
  }, [
    sueldoBase,
    gratMode,
    gratManual,
    afpKey,
    salud,
    planUF,
    contrato,
    horasExtra,
    otrosImponibles,
    colacion,
    movilizacion,
    otrosDescuentos,
    mutualRecargo,
    periodo,
  ]);

  const liq = resultado?.liquidacion;

  const resumenTexto = useMemo(() => {
    if (!resultado || !liq) return "";
    const lineas = [
      `Período: ${periodo.etiqueta} (UF ${periodo.uf.toLocaleString("es-CL")}, UTM ${periodo.utm.toLocaleString("es-CL")})`,
      `Modo: ${modo === "trabajador" ? "Trabajador" : "Empleador"}`,
      `Sueldo base: ${fmt(liq.sueldoBase)}`,
      `Gratificación: ${fmt(liq.gratificacion)}`,
      liq.horasExtra > 0 ? `Horas extra: ${fmt(liq.horasExtra)}` : "",
      liq.otrosImponibles > 0 ? `Otros imponibles: ${fmt(liq.otrosImponibles)}` : "",
      `Total imponible: ${fmt(liq.totalImponible)}`,
      `Base de cotización (tope ${periodo.topeImponibleUF} UF): ${fmt(liq.baseCotizacion)}`,
      `AFP ${liq.afpNombre} (${liq.afpTasa}%): −${fmt(liq.afp)}`,
      `Salud 7%: −${fmt(liq.salud7)}`,
      liq.adicionalIsapre > 0 ? `Adicional isapre: −${fmt(liq.adicionalIsapre)}` : "",
      liq.cesantiaTrabajador > 0 ? `Cesantía trabajador: −${fmt(liq.cesantiaTrabajador)}` : "",
      `Impuesto único: −${fmt(liq.impuesto)}`,
      liq.otrosDescuentos > 0 ? `Otros descuentos: −${fmt(liq.otrosDescuentos)}` : "",
      liq.totalNoImponible > 0 ? `No imponibles (colación/movilización): +${fmt(liq.totalNoImponible)}` : "",
      `LÍQUIDO: ${fmt(liq.liquido)}`,
    ];
    if (modo === "empleador") {
      lineas.push(
        `Cesantía empleador: +${fmt(resultado.cesantiaEmpleador)}`,
        `ISL/Mutual (${resultado.mutualTasa.toLocaleString("es-CL")}%): +${fmt(resultado.mutual)}`,
        ...resultado.aportesPension.map(
          (a) => `${a.nombre} (${a.tasa.toLocaleString("es-CL")}%): +${fmt(a.monto)}`
        ),
        `COSTO TOTAL DE CONTRATACIÓN: ${fmt(resultado.costoTotal)}`
      );
    }
    return lineas.filter(Boolean).join("\n");
  }, [resultado, liq, modo, periodo]);

  const imprimir = () => {
    if (typeof window !== "undefined") {
      window.gtag?.("event", "calculadora_pdf", { modo });
      window.print();
    }
  };

  return (
    <div>
      {/* ── Selector de modo ── */}
      <div className="no-print flex flex-col sm:flex-row gap-3 mb-8">
        {(
          [
            {
              key: "trabajador",
              title: "Soy trabajador",
              sub: "¿Cuánto es mi sueldo líquido?",
            },
            {
              key: "empleador",
              title: "Soy empleador",
              sub: "¿Cuánto cuesta contratar?",
            },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setModo(t.key)}
            className={`flex-1 rounded-xl border px-5 py-4 text-left transition-colors ${
              modo === t.key
                ? "border-emerald bg-emerald/5 ring-1 ring-emerald/30"
                : "border-slate-200 bg-white hover:border-emerald/40"
            }`}
          >
            <p className={`text-sm font-bold ${modo === t.key ? "text-emerald" : "text-navy"}`}>
              {t.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{t.sub}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Entradas ── */}
        <div className="no-print rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-navy">Datos del cálculo</h2>
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
              <label htmlFor="calc-sueldo" className={labelClass}>
                Sueldo base mensual
              </label>
              <input
                id="calc-sueldo"
                inputMode="numeric"
                className={inputClass}
                placeholder="$1.000.000"
                value={sueldoBase ? `$${parseCLP(sueldoBase).toLocaleString("es-CL")}` : ""}
                onChange={(e) => setSueldoBase(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="calc-grat" className={labelClass}>
                  Gratificación
                </label>
                <select
                  id="calc-grat"
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
                  <label htmlFor="calc-grat-monto" className={labelClass}>
                    Monto gratificación
                  </label>
                  <input
                    id="calc-grat-monto"
                    inputMode="numeric"
                    className={inputClass}
                    placeholder="$219.115"
                    value={gratManual ? `$${parseCLP(gratManual).toLocaleString("es-CL")}` : ""}
                    onChange={(e) => setGratManual(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="calc-contrato" className={labelClass}>
                    Tipo de contrato
                  </label>
                  <select
                    id="calc-contrato"
                    value={contrato}
                    onChange={(e) => setContrato(e.target.value as TipoContrato)}
                    className={inputClass}
                  >
                    <option value="indefinido">Indefinido</option>
                    <option value="plazo_fijo">Plazo fijo</option>
                  </select>
                </div>
              )}
            </div>

            {gratMode === "manual" && (
              <div>
                <label htmlFor="calc-contrato2" className={labelClass}>
                  Tipo de contrato
                </label>
                <select
                  id="calc-contrato2"
                  value={contrato}
                  onChange={(e) => setContrato(e.target.value as TipoContrato)}
                  className={inputClass}
                >
                  <option value="indefinido">Indefinido</option>
                  <option value="plazo_fijo">Plazo fijo</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="calc-afp" className={labelClass}>
                  AFP
                </label>
                <select
                  id="calc-afp"
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
                <label htmlFor="calc-salud" className={labelClass}>
                  Salud
                </label>
                <select
                  id="calc-salud"
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
                <label htmlFor="calc-plan" className={labelClass}>
                  Plan isapre en UF{" "}
                  <span className="text-xs font-normal text-slate-400">
                    (usa hasta 3 decimales, ej: 6,958)
                  </span>
                </label>
                <input
                  id="calc-plan"
                  inputMode="decimal"
                  className={inputClass}
                  placeholder="6,958"
                  value={planUF}
                  onChange={(e) => setPlanUF(e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="calc-he" className={labelClass}>
                  Horas extra (al 50%)
                </label>
                <input
                  id="calc-he"
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="0"
                  value={horasExtra}
                  onChange={(e) => setHorasExtra(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <div>
                <label htmlFor="calc-oi" className={labelClass}>
                  Otros haberes imponibles
                </label>
                <input
                  id="calc-oi"
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="$0 (bonos, comisiones)"
                  value={otrosImponibles ? `$${parseCLP(otrosImponibles).toLocaleString("es-CL")}` : ""}
                  onChange={(e) => setOtrosImponibles(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="calc-col" className={labelClass}>
                  Colación
                </label>
                <input
                  id="calc-col"
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="$0"
                  value={colacion ? `$${parseCLP(colacion).toLocaleString("es-CL")}` : ""}
                  onChange={(e) => setColacion(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="calc-mov" className={labelClass}>
                  Movilización
                </label>
                <input
                  id="calc-mov"
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="$0"
                  value={movilizacion ? `$${parseCLP(movilizacion).toLocaleString("es-CL")}` : ""}
                  onChange={(e) => setMovilizacion(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="calc-od" className={labelClass}>
                  Otros descuentos
                </label>
                <input
                  id="calc-od"
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="$0 (APV, préstamos)"
                  value={otrosDescuentos ? `$${parseCLP(otrosDescuentos).toLocaleString("es-CL")}` : ""}
                  onChange={(e) => setOtrosDescuentos(e.target.value)}
                />
              </div>
              {modo === "empleador" && (
                <div>
                  <label htmlFor="calc-mut" className={labelClass}>
                    Recargo mutual (%){" "}
                    <span className="text-xs font-normal text-slate-400">
                      según riesgo
                    </span>
                  </label>
                  <input
                    id="calc-mut"
                    inputMode="decimal"
                    className={inputClass}
                    placeholder="0,00"
                    value={mutualRecargo}
                    onChange={(e) => setMutualRecargo(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Resultados ── */}
        <div className="print-area">
          {!resultado || !liq ? (
            <div className="no-print rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 flex items-center justify-center min-h-[300px]">
              <p className="text-sm text-slate-400 text-center max-w-xs">
                Ingresa el sueldo base para ver el desglose completo, línea por
                línea.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <div className="print-only mb-6 pb-4 border-b border-slate-200">
                <p className="text-lg font-bold text-navy">Meliora Advisory</p>
                <p className="text-xs text-slate-500">
                  Calculadora de remuneraciones — melioraadvisory.cl/calculadora
                  — valores referenciales, período {periodo.etiqueta}
                </p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-navy">
                  {modo === "trabajador" ? "Tu liquidación" : "Costo de contratación"}
                </h2>
                <span className="text-xs text-slate-400">{periodo.etiqueta}</span>
              </div>

              <p className="text-xs font-semibold text-emerald uppercase tracking-wider mb-1">
                Haberes
              </p>
              <Fila label="Sueldo base" value={liq.sueldoBase} />
              {liq.horasExtra > 0 && <Fila label="Horas extra (50%)" value={liq.horasExtra} />}
              {liq.gratificacion > 0 && <Fila label="Gratificación" value={liq.gratificacion} />}
              {liq.otrosImponibles > 0 && <Fila label="Otros imponibles" value={liq.otrosImponibles} />}
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
                <Fila label="Seguro de cesantía (0,6%)" value={liq.cesantiaTrabajador} negative />
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

              {modo === "empleador" && (
                <>
                  <p className="text-xs font-semibold text-emerald uppercase tracking-wider mt-6 mb-1">
                    Aportes del empleador
                  </p>
                  <Fila
                    label={`Seguro de cesantía (${periodo.cesantia[contrato].empleador.toLocaleString("es-CL")}%)`}
                    value={resultado.cesantiaEmpleador}
                  />
                  <Fila
                    label={`ISL / Mutual (${resultado.mutualTasa.toLocaleString("es-CL", { maximumFractionDigits: 2 })}%)`}
                    value={resultado.mutual}
                    note="ley 16.744"
                  />
                  {resultado.aportesPension.map((a) => (
                    <Fila
                      key={a.nombre}
                      label={`${a.nombre} (${a.tasa.toLocaleString("es-CL")}%)`}
                      value={a.monto}
                    />
                  ))}

                  <div className="mt-4 rounded-xl bg-navy px-4 py-3 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-white">
                      Costo total de contratación
                    </span>
                    <span className="text-xl font-bold text-white tabular-nums">
                      {fmt(resultado.costoTotal)}
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs text-slate-500 mb-2">
                      De cada {fmt(resultado.costoTotal)} que pagas, al bolsillo
                      del trabajador llegan {fmt(liq.liquido)} —{" "}
                      <span className="font-semibold text-navy">
                        {Math.round(resultado.proporcionLiquido * 100)}%
                      </span>
                      .
                    </p>
                    <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-3 bg-emerald"
                        style={{ width: `${Math.min(100, Math.round(resultado.proporcionLiquido * 100))}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[11px] text-slate-400">
                        Líquido del trabajador
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Cotizaciones e impuestos
                      </span>
                    </div>
                  </div>
                </>
              )}

              <p className="mt-5 text-[11px] leading-relaxed text-slate-400">
                Cálculo referencial con indicadores de {periodo.etiqueta} (UF{" "}
                {periodo.uf.toLocaleString("es-CL")}, UTM{" "}
                {periodo.utm.toLocaleString("es-CL")}). No reemplaza una
                liquidación de sueldo oficial.
              </p>

              <div className="no-print mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={imprimir}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-navy px-5 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659" />
                  </svg>
                  Descargar PDF
                </button>
              </div>
            </div>
          )}

          {/* ── Captura de correo + CTA por modo ── */}
          {resultado && liq && (
            <div className="no-print mt-6 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                <h3 className="text-base font-bold text-navy mb-1">
                  Recibe este desglose en tu correo
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Te lo enviamos junto a una breve revisión de tu caso. Sin spam.
                </p>
                <form action={FORM_ENDPOINT} method="POST" className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="hidden"
                    name="_subject"
                    value={`Calculadora remuneraciones (${modo}) — melioraadvisory.cl`}
                  />
                  <input type="hidden" name="_template" value="table" />
                  <input
                    type="hidden"
                    name="_next"
                    value="https://melioraadvisory.cl/contacto/gracias/"
                  />
                  <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />
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
                    Enviarme el desglose
                  </button>
                </form>
              </div>

              {modo === "empleador" ? (
                <div className="rounded-2xl bg-navy p-6 sm:p-8">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Ese {Math.round((1 - resultado.proporcionLiquido) * 100)}% de
                    sobrecosto es solo la parte visible
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-5">
                    Margen por línea, cobranza, flujo de caja proyectado: si no
                    los estás midiendo, estás decidiendo a ciegas. Mide gratis la
                    salud financiera de tu pyme en 3 minutos.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/diagnostico"
                      className="inline-flex items-center justify-center rounded-lg bg-emerald px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-dark transition-colors"
                    >
                      Hacer el Diagnóstico Financiero gratis
                    </Link>
                    <Link
                      href="/servicios"
                      className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                      Conocer el CFO externo
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    ¿Tienes una pyme, o la administras?{" "}
                    <Link
                      href="/diagnostico"
                      className="font-semibold text-emerald hover:text-emerald-dark transition-colors"
                    >
                      Mide gratis la salud financiera de tu empresa →
                    </Link>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
