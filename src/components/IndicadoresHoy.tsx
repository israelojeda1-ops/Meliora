"use client";

import { useEffect, useState } from "react";

type Indicador = {
  codigo: string;
  nombre: string;
  valor: number;
  fecha: string;
  unidad: "pesos" | "porcentaje";
  variacion?: number;
};

const catalogo: { codigo: string; nombre: string; unidad: "pesos" | "porcentaje"; conVariacion: boolean }[] = [
  { codigo: "uf", nombre: "UF", unidad: "pesos", conVariacion: true },
  { codigo: "dolar", nombre: "Dólar observado", unidad: "pesos", conVariacion: true },
  { codigo: "euro", nombre: "Euro", unidad: "pesos", conVariacion: true },
  { codigo: "utm", nombre: "UTM", unidad: "pesos", conVariacion: false },
  { codigo: "ipc", nombre: "IPC (variación mensual)", unidad: "porcentaje", conVariacion: false },
  { codigo: "tpm", nombre: "Tasa de Política Monetaria", unidad: "porcentaje", conVariacion: false },
];

function fmtValor(ind: Indicador): string {
  if (ind.unidad === "porcentaje") {
    return `${ind.valor.toLocaleString("es-CL", { maximumFractionDigits: 2 })}%`;
  }
  return `$${ind.valor.toLocaleString("es-CL", { minimumFractionDigits: ind.codigo === "uf" ? 2 : 0, maximumFractionDigits: 2 })}`;
}

function fmtFecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function IndicadoresHoy() {
  const [indicadores, setIndicadores] = useState<Indicador[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let vigente = true;
    Promise.all(
      catalogo.map((c) =>
        fetch(`https://mindicador.cl/api/${c.codigo}`)
          .then((r) => r.json())
          .then((data) => {
            const serie: { fecha: string; valor: number }[] = data?.serie ?? [];
            if (!serie.length) return null;
            const ind: Indicador = {
              codigo: c.codigo,
              nombre: c.nombre,
              valor: serie[0].valor,
              fecha: serie[0].fecha,
              unidad: c.unidad,
            };
            if (c.conVariacion && serie.length > 1 && serie[1].valor > 0) {
              ind.variacion = ((serie[0].valor - serie[1].valor) / serie[1].valor) * 100;
            }
            return ind;
          })
          .catch(() => null)
      )
    ).then((res) => {
      if (!vigente) return;
      const ok = res.filter((x): x is Indicador => x !== null);
      if (ok.length === 0) {
        setError(true);
      } else {
        setIndicadores(ok);
      }
    });
    return () => {
      vigente = false;
    };
  }, []);

  if (error) {
    return (
      <p className="text-sm text-slate-500 text-center py-12">
        No pudimos cargar los indicadores en este momento. Intenta nuevamente
        en unos minutos o consulta directamente en{" "}
        <a href="https://www.sii.cl/valores_y_fechas/" target="_blank" rel="noopener noreferrer" className="text-emerald font-semibold">
          sii.cl
        </a>
        .
      </p>
    );
  }

  if (!indicadores) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {catalogo.map((c) => (
          <div key={c.codigo} className="rounded-2xl bg-white border border-slate-200 p-6 animate-pulse">
            <div className="h-4 w-24 bg-slate-100 rounded mb-3" />
            <div className="h-8 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {indicadores.map((ind) => (
        <div
          key={ind.codigo}
          className="rounded-2xl bg-white border border-slate-200 p-6"
        >
          <p className="text-sm font-medium text-slate-500 mb-1">{ind.nombre}</p>
          <p className="text-2xl sm:text-3xl font-bold text-navy tabular-nums">
            {fmtValor(ind)}
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-xs text-slate-400">al {fmtFecha(ind.fecha)}</p>
            {ind.variacion !== undefined && (
              <p
                className={`text-xs font-semibold tabular-nums ${
                  ind.variacion >= 0 ? "text-emerald" : "text-red-600"
                }`}
              >
                {ind.variacion >= 0 ? "▲" : "▼"}{" "}
                {Math.abs(ind.variacion).toLocaleString("es-CL", { maximumFractionDigits: 2 })}
                % vs día anterior
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
