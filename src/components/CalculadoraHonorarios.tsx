"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { boletaDesdeBruto, boletaDesdeLiquido } from "../lib/remuneraciones/honorarios.ts";
import { periodoActual } from "../lib/remuneraciones/parametros/index.ts";

const FORM_ENDPOINT = "https://formsubmit.co/israelojeda1@gmail.com";

const fmt = (n: number) => `$${Math.round(n).toLocaleString("es-CL")}`;

function parseCLP(s: string): number {
  const digits = s.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function parseUF(s: string): number {
  const n = parseFloat(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function hoyISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald bg-white";

type ResultadoUF = { fecha: string; valor: number; oficial: boolean };

export function CalculadoraHonorarios() {
  const [direccion, setDireccion] = useState<"bruto" | "liquido">("bruto");
  const [moneda, setMoneda] = useState<"clp" | "uf">("clp");
  const [monto, setMonto] = useState("");
  const [montoUF, setMontoUF] = useState("");
  const [fechaUF, setFechaUF] = useState(hoyISO());
  const [uf, setUf] = useState<ResultadoUF | null>(null);

  const tasa = periodoActual.retencionHonorarios;

  // Valor oficial de la UF (SII / Banco Central) para la fecha elegida,
  // vía la API pública mindicador.cl; si falla, se usa la UF del período.
  useEffect(() => {
    if (moneda !== "uf" || !fechaUF) return;
    let vigente = true;
    const fecha = fechaUF;
    const [anio, mes, dia] = fecha.split("-");
    fetch(`https://mindicador.cl/api/uf/${dia}-${mes}-${anio}`)
      .then((r) => r.json())
      .then((data) => {
        if (!vigente) return;
        const valor = data?.serie?.[0]?.valor;
        if (typeof valor === "number" && valor > 0) {
          setUf({ fecha, valor, oficial: true });
        } else {
          setUf({ fecha, valor: periodoActual.uf, oficial: false });
        }
      })
      .catch(() => {
        if (vigente) setUf({ fecha, valor: periodoActual.uf, oficial: false });
      });
    return () => {
      vigente = false;
    };
  }, [moneda, fechaUF]);

  const ufListo = uf !== null && uf.fecha === fechaUF ? uf : null;
  const ufValor = ufListo ? ufListo.valor : null;

  const montoPesos = useMemo(() => {
    if (moneda === "clp") return parseCLP(monto);
    if (ufValor === null) return 0;
    return Math.round(parseUF(montoUF) * ufValor);
  }, [moneda, monto, montoUF, ufValor]);

  const boleta = useMemo(() => {
    if (montoPesos <= 0) return null;
    return direccion === "bruto"
      ? boletaDesdeBruto(montoPesos, periodoActual)
      : boletaDesdeLiquido(montoPesos, periodoActual);
  }, [direccion, montoPesos]);

  const notaUF =
    moneda === "uf" && ufValor !== null && parseUF(montoUF) > 0
      ? `${montoUF} UF × $${ufValor.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (UF al ${fechaUF.split("-").reverse().join("-")})`
      : "";

  const resumenTexto = boleta
    ? [
        `Retención año 2026: ${tasa.toLocaleString("es-CL")}%`,
        notaUF
          ? `${direccion === "liquido" ? "Líquido deseado" : "Monto ingresado"}: ${notaUF} = ${fmt(montoPesos)}`
          : "",
        direccion === "liquido"
          ? `Debes boletear por (bruto): ${fmt(boleta.bruto)}`
          : `Monto bruto de la boleta: ${fmt(boleta.bruto)}`,
        `Retención SII: −${fmt(boleta.retencion)}`,
        `Líquido a recibir: ${fmt(boleta.liquido)}`,
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const imprimir = () => {
    if (typeof window !== "undefined") {
      window.gtag?.("event", "honorarios_pdf", {});
      window.print();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="no-print flex flex-col sm:flex-row gap-3 mb-8">
        {(
          [
            {
              key: "bruto",
              title: "Tengo el monto de la boleta",
              sub: "¿Cuánto me llega líquido?",
            },
            {
              key: "liquido",
              title: "Quiero recibir un monto líquido",
              sub: "¿Por cuánto debo boletear?",
            },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setDireccion(t.key)}
            className={`flex-1 rounded-xl border px-5 py-4 text-left transition-colors ${
              direccion === t.key
                ? "border-emerald bg-emerald/5 ring-1 ring-emerald/30"
                : "border-slate-200 bg-white hover:border-emerald/40"
            }`}
          >
            <p className={`text-sm font-bold ${direccion === t.key ? "text-emerald" : "text-navy"}`}>
              {t.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{t.sub}</p>
          </button>
        ))}
      </div>

      <div className="no-print rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 mb-8">
        <div className="flex items-center justify-between mb-4">
          <label
            htmlFor={moneda === "clp" ? "hon-monto" : "hon-monto-uf"}
            className="text-sm font-medium text-slate-700"
          >
            {direccion === "bruto"
              ? "Monto bruto de la boleta"
              : "Monto líquido que quieres recibir"}
          </label>
          <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden">
            {(["clp", "uf"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMoneda(m)}
                className={`px-4 py-1.5 text-xs font-semibold transition-colors ${
                  moneda === m
                    ? "bg-emerald text-white"
                    : "bg-white text-slate-600 hover:text-emerald"
                }`}
              >
                {m === "clp" ? "Pesos" : "UF"}
              </button>
            ))}
          </div>
        </div>

        {moneda === "clp" ? (
          <input
            id="hon-monto"
            inputMode="numeric"
            className={inputClass}
            placeholder="$1.000.000"
            value={monto ? `$${parseCLP(monto).toLocaleString("es-CL")}` : ""}
            onChange={(e) => setMonto(e.target.value)}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="hon-monto-uf"
                  className="block text-xs font-medium text-slate-500 mb-1.5"
                >
                  Monto en UF
                </label>
                <input
                  id="hon-monto-uf"
                  inputMode="decimal"
                  className={inputClass}
                  placeholder="10"
                  value={montoUF}
                  onChange={(e) => setMontoUF(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="hon-fecha-uf"
                  className="block text-xs font-medium text-slate-500 mb-1.5"
                >
                  Fecha del valor UF
                </label>
                <input
                  id="hon-fecha-uf"
                  type="date"
                  className={inputClass}
                  value={fechaUF}
                  min="2020-01-01"
                  onChange={(e) => setFechaUF(e.target.value)}
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {!ufListo && "Obteniendo el valor oficial de la UF…"}
              {ufListo && ufListo.oficial && (
                <>
                  UF al {fechaUF.split("-").reverse().join("-")}:{" "}
                  <span className="font-semibold text-navy">
                    ${ufListo.valor.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>{" "}
                  (valor oficial SII)
                  {parseUF(montoUF) > 0 && (
                    <>
                      {" "}— equivalente:{" "}
                      <span className="font-semibold text-emerald">
                        {fmt(montoPesos)}
                      </span>
                    </>
                  )}
                </>
              )}
              {ufListo && !ufListo.oficial && (
                <>
                  No se pudo obtener la UF de esa fecha; usando UF de
                  referencia del período ({periodoActual.etiqueta}): $
                  {ufListo.valor.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {parseUF(montoUF) > 0 && <> — equivalente: {fmt(montoPesos)}</>}
                </>
              )}
            </p>
          </>
        )}
        <p className="mt-2 text-xs text-slate-400">
          Retención vigente año 2026: {tasa.toLocaleString("es-CL")}% (Ley
          21.133 — sube a 16% en 2027 y 17% en 2028).
        </p>
      </div>

      {boleta && (
        <div className="print-area">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="print-only mb-6 pb-4 border-b border-slate-200">
              <p className="text-lg font-bold text-navy">Meliora Advisory</p>
              <p className="text-xs text-slate-500">
                Calculadora de boleta de honorarios —
                melioraadvisory.cl/calculadora-honorarios — valores
                referenciales, año 2026
              </p>
            </div>

            <h2 className="text-lg font-bold text-navy mb-4">
              Desglose de tu boleta
            </h2>
            {notaUF && (
              <div className="flex items-baseline justify-between py-1.5">
                <span className="text-sm text-slate-600">
                  {direccion === "liquido" ? "Líquido deseado: " : ""}
                  {notaUF}
                </span>
                <span className="text-sm text-slate-700 tabular-nums">
                  {fmt(montoPesos)}
                </span>
              </div>
            )}
            {direccion === "liquido" ? (
              <>
                <div className="mt-2 rounded-xl bg-emerald/5 border border-emerald/20 px-4 py-3 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-navy">
                    Debes boletear por (bruto)
                  </span>
                  <span className="text-xl font-bold text-emerald tabular-nums">
                    {fmt(boleta.bruto)}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between py-1.5">
                  <span className="text-sm text-slate-600">
                    Retención SII ({tasa.toLocaleString("es-CL")}%)
                  </span>
                  <span className="text-sm text-red-600 tabular-nums">
                    −{fmt(boleta.retencion)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between py-1.5">
                  <span className="text-sm font-semibold text-navy">
                    Líquido a recibir
                  </span>
                  <span className="text-sm font-bold text-navy tabular-nums">
                    {fmt(boleta.liquido)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-baseline justify-between py-1.5">
                  <span className="text-sm font-semibold text-navy">
                    Monto bruto de la boleta
                  </span>
                  <span className="text-sm font-bold text-navy tabular-nums">
                    {fmt(boleta.bruto)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between py-1.5">
                  <span className="text-sm text-slate-600">
                    Retención SII ({tasa.toLocaleString("es-CL")}%)
                  </span>
                  <span className="text-sm text-red-600 tabular-nums">
                    −{fmt(boleta.retencion)}
                  </span>
                </div>
                <div className="mt-3 rounded-xl bg-emerald/5 border border-emerald/20 px-4 py-3 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-navy">
                    Líquido a recibir
                  </span>
                  <span className="text-xl font-bold text-emerald tabular-nums">
                    {fmt(boleta.liquido)}
                  </span>
                </div>
              </>
            )}

            <p className="mt-5 text-[11px] leading-relaxed text-slate-400">
              La retención no es un impuesto perdido: financia tus cotizaciones
              previsionales como independiente (salud, AFP, SIS, cesantía) y el
              saldo se ajusta contra tu impuesto en la Operación Renta de abril.
              Cálculo referencial — no reemplaza la boleta emitida en sii.cl.
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
                  value="Calculadora honorarios — melioraadvisory.cl"
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
                ¿Boleteas mucho o tienes una pyme que paga honorarios?
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-5">
                Te ayudamos a decidir cuándo conviene pasar de boletas a
                contrato, ordenar la contabilidad y proyectar tu carga
                tributaria antes de la Operación Renta.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/diagnostico"
                  className="inline-flex items-center justify-center rounded-lg bg-emerald px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-dark transition-colors"
                >
                  Diagnóstico Financiero gratis
                </Link>
                <Link
                  href="/servicios"
                  className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Ver servicios
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
