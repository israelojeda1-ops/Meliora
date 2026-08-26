"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { calcularFiniquito, type CausalTermino } from "../lib/remuneraciones/finiquito.ts";
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

const causales: { key: CausalTermino; label: string }[] = [
  { key: "necesidades_empresa", label: "Necesidades de la empresa (art. 161)" },
  { key: "renuncia", label: "Renuncia voluntaria" },
  { key: "mutuo_acuerdo", label: "Mutuo acuerdo" },
  { key: "vencimiento_plazo", label: "Vencimiento del plazo" },
];

export function CalculadoraFiniquito() {
  const [remuneracion, setRemuneracion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaTermino, setFechaTermino] = useState("");
  const [causal, setCausal] = useState<CausalTermino>("necesidades_empresa");
  const [avisoPrevio, setAvisoPrevio] = useState(false);
  const [vacacionesPendientes, setVacacionesPendientes] = useState("");

  const resultado = useMemo(() => {
    const rem = parseCLP(remuneracion);
    if (rem <= 0 || !fechaInicio || !fechaTermino) return null;
    if (fechaTermino <= fechaInicio) return null;
    return calcularFiniquito(
      {
        remuneracion: rem,
        fechaInicio,
        fechaTermino,
        causal,
        avisoPrevio,
        vacacionesPendientesDias: parseFloat(vacacionesPendientes.replace(",", ".")) || 0,
      },
      periodoActual
    );
  }, [remuneracion, fechaInicio, fechaTermino, causal, avisoPrevio, vacacionesPendientes]);

  const resumenTexto = resultado
    ? [
        `Causal: ${causales.find((c) => c.key === causal)?.label}`,
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
              Última remuneración mensual imponible
            </label>
            <input
              id="fin-rem"
              inputMode="numeric"
              className={inputClass}
              placeholder="$1.000.000"
              value={remuneracion ? `$${parseCLP(remuneracion).toLocaleString("es-CL")}` : ""}
              onChange={(e) => setRemuneracion(e.target.value)}
            />
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
              Completa la remuneración y las fechas del contrato para ver el
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
            {resultado.baseIndemnizacion < parseCLP(remuneracion) && (
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
            <div className="flex items-baseline justify-between py-1.5">
              <span className="text-sm text-slate-600">
                Feriado proporcional ({resultado.feriadoDiasHabiles.toLocaleString("es-CL")} días
                hábiles → {resultado.feriadoDiasCorridos.toLocaleString("es-CL")} corridos)
              </span>
              <span className="text-sm text-slate-700 tabular-nums">
                {fmt(resultado.feriadoMonto)}
              </span>
            </div>

            <div className="mt-4 rounded-xl bg-emerald/5 border border-emerald/20 px-4 py-3 flex items-baseline justify-between">
              <span className="text-sm font-bold text-navy">Total finiquito</span>
              <span className="text-xl font-bold text-emerald tabular-nums">
                {fmt(resultado.total)}
              </span>
            </div>

            <p className="mt-5 text-[11px] leading-relaxed text-slate-400">
              Cálculo referencial según Código del Trabajo (arts. 161, 162, 163
              y 172): fracción superior a 6 meses cuenta como año completo, tope
              de 11 años y base topeada en 90 UF. El feriado proporcional
              considera 1,25 días hábiles por mes y su conversión a días
              corridos sin festivos. No reemplaza el finiquito ratificado ante
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
                  Ver planes desde 8 UF
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
