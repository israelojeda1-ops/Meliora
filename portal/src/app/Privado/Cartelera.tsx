"use client";

import { useEffect, useState, useTransition } from "react";
import type { Cartelera as Datos } from "@/lib/deportes/cartelera";
import type { Lado, Proyeccion, ResumenSede } from "@/lib/deportes/modelo";
import type { Metricas } from "@/lib/deportes/catalogo";
import { LISTA_DEPORTES } from "@/lib/deportes/catalogo";
import { fechaCorta, horaChile, relativo } from "@/lib/deportes/fecha";

const pct = (v: number) => `${Math.round(v * 100)}%`;

function tono(v: number) {
  if (v >= 0.65) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (v >= 0.5) return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-slate-100 text-slate-500 ring-slate-200";
}

function Pill({ v, children }: { v: number; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${tono(v)}`}>
      {children}
    </span>
  );
}

function Promedio({ titulo, r, m, resaltar }: { titulo: string; r: ResumenSede; m: Metricas; resaltar: boolean }) {
  if (!r.pj) return <div className="text-[11px] text-slate-400">{titulo}: sin partidos</div>;
  return (
    <div className={`text-[11px] ${resaltar ? "font-semibold text-slate-700" : "text-slate-400"}`}>
      {titulo} ({r.pj}): {m.a.corto} {r.a.toFixed(1)}-{r.aC.toFixed(1)} · {m.b.corto} {r.b.toFixed(1)}-
      {r.bC.toFixed(1)}
    </div>
  );
}

function BloqueEquipo({ l, m, marcador }: { l: Lado; m: Metricas; marcador: boolean }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900">{l.nombre}</span>
        <span className="text-[11px] uppercase tracking-wide text-slate-400">{l.casa ? "local" : "visita"}</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
        <span>
          <b className="text-slate-900">{l.a.toFixed(1)}</b> {m.a.nombre} <Pill v={l.pA}>{pct(l.pA)}</Pill>
        </span>
        <span>
          <b className="text-slate-900">{l.b.toFixed(1)}</b> {m.b.nombre} <Pill v={l.pB}>{pct(l.pB)}</Pill>
        </span>
      </div>

      {/* Historial reciente: fecha, rival, marcador y las dos métricas (a favor-en contra) */}
      {l.ultimos.length ? (
        <div className="mt-2.5 overflow-x-auto">
          <table className="w-full min-w-[290px] text-[11px] tabular-nums">
            <tbody>
              {l.ultimos.map((u) => (
                <tr key={u.fid} className="border-t border-slate-200/70">
                  <td className="py-1 pr-2 text-slate-400">{fechaCorta(u.ts)}</td>
                  <td className="py-1 pr-2 text-slate-600">
                    <span className="text-slate-400">{u.casa ? "vs" : "@"}</span> {u.rival}
                  </td>
                  {marcador && (
                    <td className="py-1 pr-2 font-medium text-slate-700">
                      {u.gf}-{u.gc}
                    </td>
                  )}
                  <td className="py-1 pr-2 text-slate-600">
                    <span className="text-slate-400">{m.a.corto}</span> {u.af}-{u.ac}
                  </td>
                  <td className="py-1 text-slate-600">
                    <span className="text-slate-400">{m.b.corto}</span> {u.bf}-{u.bc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-2 text-xs text-slate-400">sin historial</div>
      )}

      <div className="mt-2 space-y-0.5">
        <Promedio titulo="Promedio de local" r={l.promLocal} m={m} resaltar={l.casa} />
        <Promedio titulo="Promedio de visita" r={l.promVisita} m={m} resaltar={!l.casa} />
      </div>
    </div>
  );
}

function Partido({ p, m, marcador, ahora }: { p: Proyeccion; m: Metricas; marcador: boolean; ahora: number | null }) {
  const [abierto, setAbierto] = useState(false);
  // Solo se muestra cuando el navegador ya montó: si lo calculara el servidor,
  // el HTML llegaría con una cuenta regresiva vieja y no calzaría al hidratar.
  const rel = ahora === null ? "" : relativo(p.ts, ahora);
  return (
    <li className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-slate-50"
      >
        <div className="w-12 shrink-0">
          <div className="text-sm font-semibold tabular-nums text-slate-900">{horaChile(p.ts)}</div>
          {rel && <div className="text-[11px] text-slate-400">{rel}</div>}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-slate-900">
            {p.local} <span className="text-slate-400">vs</span> {p.visita}
          </div>
          <div className="truncate text-xs text-slate-400">
            {p.liga}
            {p.pjMin < 6 ? " · muestra corta" : ""}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Pill v={p.pA}>
            {p.a.toFixed(p.a >= 100 ? 0 : 1)} {m.a.corto} · {pct(p.pA)}
          </Pill>
          <Pill v={p.pB}>
            {p.b.toFixed(1)} {m.b.corto} · {pct(p.pB)}
          </Pill>
        </div>
      </button>
      {abierto && (
        <div className="space-y-2 px-4 pb-4">
          {p.lados.map((l) => (
            <BloqueEquipo key={l.nombre + (l.casa ? "L" : "V")} l={l} m={m} marcador={marcador} />
          ))}
          <p className="text-[11px] leading-relaxed text-slate-400">
            Totales del partido: {p.a.toFixed(1)} {m.a.nombre} y {p.b.toFixed(1)} {m.b.nombre} proyectados. Los
            porcentajes de cada equipo son contra su propia línea, no contra el total.
          </p>
        </div>
      )}
    </li>
  );
}

const METRICAS_VACIAS: Metricas = { a: { nombre: "—", corto: "a" }, b: { nombre: "—", corto: "b" } };

export function Cartelera({
  inicial,
  deporte,
  fecha,
  titulo,
  fallo,
}: {
  inicial: Datos | null;
  deporte: string;
  fecha: string;
  titulo: string;
  fallo: string | null;
}) {
  const [datos, setDatos] = useState<Datos | null>(inicial);
  const [error, setError] = useState<string | null>(fallo);
  const [cargando, empezar] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [ahora, setAhora] = useState<number | null>(null);

  // El reloj es un sistema externo: se suscribe y se avisa a React desde el
  // callback, en vez de fijar el estado en el cuerpo del efecto.
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 30_000);
    const t = setTimeout(() => setAhora(Date.now()), 0);
    return () => {
      clearInterval(id);
      clearTimeout(t);
    };
  }, []);

  const refrescar = (forzar: boolean) =>
    empezar(async () => {
      setMsg(forzar ? "Actualizando desde la API…" : "Cargando…");
      setError(null);
      try {
        const r = await fetch(
          `/Privado/refrescar?deporte=${deporte}&fecha=${fecha}${forzar ? "&forzar=1" : ""}`,
          { method: "POST" }
        );
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
        setDatos(j as Datos);
        setMsg(`Listo · ${j.peticiones} peticiones usadas`);
      } catch (e) {
        setError((e as Error).message);
        setMsg(null);
      }
    });

  const partidos = datos?.partidos ?? [];
  const m = datos?.metricas ?? METRICAS_VACIAS;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-0 pb-16 sm:px-4">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-bold text-slate-900 first-letter:uppercase">
              {m.a.nombre} y {m.b.nombre}
            </h1>
            <p className="text-xs text-slate-400">{titulo} · hora de Chile</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refrescar(true)}
              disabled={cargando}
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {cargando ? "…" : "Actualizar"}
            </button>
            <form action="/Privado/salir" method="post">
              <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-500">Salir</button>
            </form>
          </div>
        </div>
        <nav className="mt-2.5 flex gap-1.5">
          {LISTA_DEPORTES.map((dep) => (
            <a
              key={dep.id}
              href={`/Privado?deporte=${dep.id}`}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                dep.id === deporte
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-500 active:bg-slate-200"
              }`}
            >
              {dep.nombre}
            </a>
          ))}
        </nav>
        {msg && <p className="mt-2 text-xs text-slate-400">{msg}</p>}
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </header>

      {datos && (
        <div className="grid grid-cols-3 gap-px bg-slate-200 text-center">
          <div className="bg-white px-2 py-3">
            <div className="text-lg font-bold tabular-nums text-slate-900">{partidos.length}</div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400">partidos</div>
          </div>
          <div className="bg-white px-2 py-3">
            <div className="text-lg font-bold tabular-nums text-slate-900">
              {partidos.filter((p) => p.pA >= 0.6 && p.pB >= 0.6).length}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400">doble ≥60%</div>
          </div>
          <div className="bg-white px-2 py-3">
            <div className="text-lg font-bold tabular-nums text-slate-900">{datos.ligasCargadas.length}</div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400">ligas cargadas</div>
          </div>
        </div>
      )}

      <ul className="divide-y divide-slate-100 bg-white">
        {partidos.map((p) => (
          <Partido key={p.fid} p={p} m={m} marcador={datos?.mostrarMarcador ?? true} ahora={ahora} />
        ))}
      </ul>

      {!partidos.length && !error && (
        <p className="px-4 py-10 text-center text-sm text-slate-400">
          {datos ? "No hay partidos proyectables hoy en las ligas seguidas." : "Cargando…"}
        </p>
      )}

      {datos && (datos.sinDatos.length > 0 || datos.ligasPendientes.length > 0 || datos.avisos.length > 0) && (
        <section className="mt-6 px-4 text-xs text-slate-400">
          {datos.ligasPendientes.length > 0 && (
            <p className="mb-2">
              <b className="text-slate-500">Ligas sin cargar:</b> {datos.ligasPendientes.join(", ")}. Toca Actualizar
              de nuevo en un minuto para completarlas.
            </p>
          )}
          {datos.nota && <p className="mb-2 text-slate-500">{datos.nota}</p>}
          {datos.avisos.map((a, i) => (
            <p key={i} className="mb-1">
              {a}
            </p>
          ))}
          {datos.sinDatos.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer">{datos.sinDatos.length} partidos sin historial suficiente</summary>
              <ul className="mt-2 space-y-1">
                {datos.sinDatos.map((s, i) => (
                  <li key={i}>
                    {horaChile(s.ts)} · {s.local} vs {s.visita} <span className="text-slate-300">({s.liga})</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <p className="mt-3 text-slate-300">
            Actualizado {new Date(datos.generado).toLocaleString("es-CL", { timeZone: "America/Santiago" })} ·{" "}
            {datos.peticiones} peticiones en la última pasada
          </p>
        </section>
      )}
    </main>
  );
}
