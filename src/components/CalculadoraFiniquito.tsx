"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  calcularFiniquito,
  recargoDespidoInjustificado,
  type CausalTermino,
} from "../lib/remuneraciones/finiquito.ts";
import { periodoActual } from "../lib/remuneraciones/parametros/index.ts";

const FORM_ENDPOINT = "https://formsubmit.co/israelojeda1@gmail.com";

const fmt = (n: number) => `$${Math.round(n).toLocaleString("es-CL")}`;

function parseCLP(s: string): number {
  const digits = s.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald bg-white";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

const causales: { key: CausalTermino; label: string; nota: string }[] = [
  {
    key: "necesidades_empresa",
    label: "Necesidades de la empresa (art. 161)",
    nota: "Con indemnización por años de servicio y, si no hubo aviso con 30 días, indemnización sustitutiva.",
  },
  {
    key: "invalidez",
    label: "Invalidez del trabajador (art. 161 bis)",
    nota: "Con indemnización por años de servicio, sin exigir aviso previo.",
  },
  {
    key: "renuncia",
    label: "Renuncia voluntaria (art. 159 N°2)",
    nota: "Sin indemnización por años de servicio ni aviso previo.",
  },
  {
    key: "mutuo_acuerdo",
    label: "Mutuo acuerdo (art. 159 N°1)",
    nota: "Sin indemnización por años de servicio ni aviso previo.",
  },
  {
    key: "vencimiento_plazo",
    label: "Vencimiento del plazo (art. 159 N°4)",
    nota: "Sin indemnización por años de servicio ni aviso previo.",
  },
  {
    key: "conclusion_trabajo_caso_fortuito",
    label: "Conclusión del trabajo o caso fortuito (art. 159 N°5 y N°6)",
    nota: "Sin indemnización por años de servicio ni aviso previo.",
  },
  {
    key: "conducta_trabajador",
    label: "Causa imputable al trabajador (art. 160)",
    nota: "Sin indemnización, aunque el feriado proporcional igual se paga.",
  },
];

export function CalculadoraFiniquito() {
  const [sueldoBase, setSueldoBase] = useState("");
  const [gratificacionLegalMensual, setGratificacionLegalMensual] = useState(false);
  const [tieneVariable, setTieneVariable] = useState(false);
  const [remuneracionVariable, setRemuneracionVariable] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaTermino, setFechaTermino] = useState("");
  const [causal, setCausal] = useState<CausalTermino>("necesidades_empresa");
  const [avisoPrevio, setAvisoPrevio] = useState(false);
  const [vacacionesPendientes, setVacacionesPendientes] = useState("");

  const resultado = useMemo(() => {
    const sb = parseCLP(sueldoBase);
    if (sb <= 0 || !fechaInicio || !fechaTermino) return null;
    if (fechaTermino <= fechaInicio) return null;
    return calcularFiniquito(
      {
        sueldoBase: sb,
        gratificacionLegalMensual,
        remuneracionVariablePromedio: tieneVariable
          ? parseCLP(remuneracionVariable)
          : 0,
        fechaInicio,
        fechaTermino,
        causal,
        avisoPrevio,
        vacacionesPendientesDias:
          parseFloat(vacacionesPendientes.replace(",", ".")) || 0,
      },
      periodoActual
    );
  }, [
    sueldoBase,
    gratificacionLegalMensual,
    tieneVariable,
    remuneracionVariable,
    fechaInicio,
    fechaTermino,
    causal,
    avisoPrevio,
    vacacionesPendientes,
  ]);

  const causalInfo = causales.find((c) => c.key === causal);

  const recargo = resultado
    ? recargoDespidoInjustificado(
        causal,
        resultado.aniosComputables * resultado.baseIndemnizacion
      )
    : null;

  const resumenTexto = resultado
    ? [
        `Causal: ${causalInfo?.label}`,
        `Sueldo proporcional: ${fmt(resultado.sueldoProporcional)}`,
        `Gratificación proporcional: ${fmt(resultado.gratificacionProporcional)}`,
        `Años computables: ${resultado.aniosComputables}`,
        `Indemnización años de servicio: ${fmt(resultado.indemnizacionAnios)}`,
        `Indemnización sustitutiva de aviso previo: ${fmt(resultado.indemnizacionAviso)}`,
        `Feriado proporcional (${resultado.feriadoDiasHabiles} días hábiles / ${resultado.feriadoDiasCorridos} corridos): ${fmt(resultado.feriadoMonto)}`,
        `TOTAL FINIQUITO: ${fmt(resultado.total)}`,
      ].join("\n")
    : "";

  const imprimir = () => {
    if (typeof window !== "undefined") {
      window.gtag?.("event", "finiquito_pdf", {});
      window.print();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="no-print rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-bold text-navy mb-6">Datos del contrato</h2>
        <div className="space-y-5">
          <div>
            <label htmlFor="fin-rem" className={labelClass}>
              Sueldo base mensual
            </label>
            <input
              id="fin-rem"
              inputMode="numeric"
              className={inputClass}
              placeholder="$1.000.000"
              value={sueldoBase ? `$${parseCLP(sueldoBase).toLocaleString("es-CL")}` : ""}
              onChange={(e) => setSueldoBase(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={gratificacionLegalMensual}
              onChange={(e) => setGratificacionLegalMensual(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald focus:ring-emerald"
            />
            Recibe gratificación legal mensual (25% del devengado, con tope)
          </label>
          <div>
            <label className="flex items-center gap-3 text-sm text-slate-700 mb-2">
              <input
                type="checkbox"
                checked={tieneVariable}
                onChange={(e) => setTieneVariable(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald focus:ring-emerald"
              />
              Tiene remuneración variable (comisiones)
            </label>
            {tieneVariable && (
              <div>
                <label htmlFor="fin-var" className={labelClass}>
                  Promedio mensual de los últimos 3 meses
                </label>
                <input
                  id="fin-var"
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="$0"
                  value={
                    remuneracionVariable
                      ? `$${parseCLP(remuneracionVariable).toLocaleString("es-CL")}`
                      : ""
                  }
                  onChange={(e) => setRemuneracionVariable(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fin-ini" className={labelClass}>
                Inicio del contrato
              </label>
              <input
                id="fin-ini"
                type="date"
                className={inputClass}
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="fin-fin" className={labelClass}>
                Término del contrato
              </label>
              <input
                id="fin-fin"
                type="date"
                className={inputClass}
                value={fechaTermino}
                onChange={(e) => setFechaTermino(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="fin-causal" className={labelClass}>
              Causal de término
            </label>
            <select
              id="fin-causal"
              className={inputClass}
              value={causal}
              onChange={(e) => setCausal(e.target.value as CausalTermino)}
            >
              {causales.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
            {causalInfo && (
              <p className="mt-1.5 text-xs text-slate-400">{causalInfo.nota}</p>
            )}
          </div>
          {causal === "necesidades_empresa" && (
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={avisoPrevio}
                onChange={(e) => setAvisoPrevio(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald focus:ring-emerald"
              />
              Se dio aviso con 30 días de anticipación
            </label>
          )}
          <div>
            <label htmlFor="fin-vac" className={labelClass}>
              Vacaciones pendientes de períodos anteriores{" "}
              <span className="text-xs font-normal text-slate-400">
                (días hábiles, opcional)
              </span>
            </label>
            <input
              id="fin-vac"
              inputMode="decimal"
              className={inputClass}
              placeholder="0"
              value={vacacionesPendientes}
              onChange={(e) => setVacacionesPendientes(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="print-area">
        {!resultado ? (
          <div className="no-print rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 flex items-center justify-center min-h-[300px]">
            <p className="text-sm text-slate-400 text-center max-w-xs">
              Completa el sueldo y las fechas del contrato para ver el
              desglose del finiquito.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="print-only mb-6 pb-4 border-b border-slate-200">
              <p className="text-lg font-bold text-navy">Meliora Advisory</p>
              <p className="text-xs text-slate-500">
                Calculadora de finiquito —
                melioraadvisory.cl/calculadora-finiquito — valores
                referenciales
              </p>
            </div>

            <h2 className="text-lg font-bold text-navy mb-4">
              Desglose del finiquito
            </h2>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
              Remuneraciones pendientes
            </p>
            <div className="flex items-baseline justify-between py-1.5">
              <span className="text-sm text-slate-600">
                Sueldo proporcional ({resultado.diasPendientesMes} días)
              </span>
              <span className="text-sm text-slate-700 tabular-nums">
                {fmt(resultado.sueldoProporcional)}
              </span>
            </div>
            {gratificacionLegalMensual && (
              <div className="flex items-baseline justify-between py-1.5">
                <span className="text-sm text-slate-600">
                  Gratificación proporcional
                </span>
                <span className="text-sm text-slate-700 tabular-nums">
                  {fmt(resultado.gratificacionProporcional)}
                </span>
              </div>
            )}

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mt-4 mb-1.5">
              Feriado proporcional
            </p>
            <div className="flex items-baseline justify-between py-1.5">
              <span className="text-sm text-slate-600">
                {resultado.feriadoDiasHabiles.toLocaleString("es-CL")} días
                hábiles → {resultado.feriadoDiasCorridos.toLocaleString("es-CL")} corridos
              </span>
              <span className="text-sm text-slate-700 tabular-nums">
                {fmt(resultado.feriadoMonto)}
              </span>
            </div>

            {resultado.aplicaIndemnizacion && (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mt-4 mb-1.5">
                  Indemnizaciones
                </p>
                <div className="flex items-baseline justify-between py-1.5">
                  <span className="text-sm text-slate-600">
                    Años de servicio computables
                    {resultado.aniosServicio > resultado.aniosComputables &&
                      ` (${resultado.aniosServicio} reales, tope 11)`}
                  </span>
                  <span className="text-sm text-slate-700 tabular-nums">
                    {resultado.aniosComputables}
                  </span>
                </div>
                {resultado.baseIndemnizacion < resultado.remuneracionBaseIndemnizacion && (
                  <div className="flex items-baseline justify-between py-1.5">
                    <span className="text-sm text-slate-600">
                      Base de indemnización (tope 90 UF)
                    </span>
                    <span className="text-sm text-slate-700 tabular-nums">
                      {fmt(resultado.baseIndemnizacion)}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline justify-between py-1.5">
                  <span className="text-sm text-slate-600">
                    Indemnización por años de servicio
                  </span>
                  <span className="text-sm text-slate-700 tabular-nums">
                    {fmt(resultado.indemnizacionAnios)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between py-1.5">
                  <span className="text-sm text-slate-600">
                    Indemnización sustitutiva de aviso previo
                  </span>
                  <span className="text-sm text-slate-700 tabular-nums">
                    {fmt(resultado.indemnizacionAviso)}
                  </span>
                </div>
              </>
            )}

            <div className="mt-4 rounded-xl bg-emerald/5 border border-emerald/20 px-4 py-3 flex items-baseline justify-between">
              <span className="text-sm font-bold text-navy">Total finiquito</span>
              <span className="text-xl font-bold text-emerald tabular-nums">
                {fmt(resultado.total)}
              </span>
            </div>
            {resultado.totalExento > 0 && (
              <p className="mt-2 text-xs text-slate-400">
                {fmt(resultado.totalTributable)} tributa como renta normal,{" "}
                {fmt(resultado.totalExento)} está exento de impuesto único
                hasta el tope legal (art. 178 Ley de Impuesto a la Renta).
              </p>
            )}

            {recargo && (
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                <p className="text-xs font-semibold text-amber-900">
                  Solo si la causal se declara injustificada en juicio
                </p>
                <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                  Si un tribunal laboral declara esta causal injustificada,
                  indebida o improcedente, el art. 168 del Código del Trabajo
                  agrega un recargo de {Math.round(recargo.porcentaje * 100)}%
                  sobre la indemnización por años de servicio que habría
                  correspondido: {fmt(recargo.monto)}. Este monto no forma
                  parte del finiquito que se paga al término del contrato.
                </p>
              </div>
            )}

            <p className="mt-5 text-[11px] leading-relaxed text-slate-400">
              Cálculo referencial según Código del Trabajo (arts. 63, 73, 161,
              161 bis, 162, 163 y 172): fracción superior a 6 meses cuenta
              como año completo, tope de 11 años y base topeada en 90 UF. El
              feriado proporcional considera 1,25 días hábiles por mes y su
              conversión a días corridos excluyendo sábados, domingos y
              festivos legales. No reemplaza el finiquito ratificado ante
              ministro de fe.
            </p>

            <div className="no-print mt-6">
              <button
                type="button"
                onClick={imprimir}
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
                Recibe este desglose en tu correo
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Te lo enviamos junto a una breve revisión de tu caso. Sin spam.
              </p>
              <form action={FORM_ENDPOINT} method="POST" className="flex flex-col sm:flex-row gap-3">
                <input
                  type="hidden"
                  name="_subject"
                  value="Calculadora finiquito — melioraadvisory.cl"
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

            <div className="rounded-2xl bg-navy p-6 sm:p-8">
              <h3 className="text-lg font-bold text-white mb-2">
                Un finiquito mal hecho sale caro
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-5">
                Nos encargamos de remuneraciones, contratos y finiquitos de tu
                pyme, con respaldo contable y al día con la reforma
                previsional.
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
