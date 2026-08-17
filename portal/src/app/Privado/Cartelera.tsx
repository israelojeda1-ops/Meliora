"use client";

import { useEffect, useState, useTransition } from "react";
import type { Cartelera as Datos } from "@/lib/deportes/cartelera";
import type { DesgloseMetrica, Lado, LineaSegura, Proyeccion, ResumenSede } from "@/lib/deportes/modelo";
import type { Metricas } from "@/lib/deportes/catalogo";
import { DEPORTES_EN_PORTADA } from "@/lib/deportes/catalogo";
import { fechaCorta, horaChile, relativo } from "@/lib/deportes/fecha";

const pct = (v: number) => `${Math.round(v * 100)}%`;

// Escala de color de las probabilidades, sobre fondo oscuro.
function tono(v: number) {
  if (v >= 0.65) return "bg-emerald-400/15 text-emerald-300 ring-emerald-400/25";
  if (v >= 0.5) return "bg-amber-400/10 text-amber-300 ring-amber-400/20";
  return "bg-white/5 text-slate-400 ring-white/10";
}

const tonoBarra = (v: number) => (v >= 0.65 ? "bg-emerald-400" : v >= 0.5 ? "bg-amber-400" : "bg-slate-500");

function Pill({ v, children }: { v: number; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums ring-1 ${tono(v)}`}
    >
      {children}
    </span>
  );
}

/** Métrica proyectada de un equipo: número grande, barra y probabilidad. */
function Metrica({ valor, nombre, p }: { valor: number; nombre: string; p: number }) {
  return (
    <div className="flex-1">
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-extrabold tabular-nums text-white">{valor.toFixed(1)}</span>
        <span className="text-[11px] text-slate-400">{nombre}</span>
        <span className={`ml-auto text-[11px] font-bold tabular-nums ${p >= 0.65 ? "text-emerald-300" : p >= 0.5 ? "text-amber-300" : "text-slate-400"}`}>
          {pct(p)}
        </span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${tonoBarra(p)}`} style={{ width: pct(p) }} />
      </div>
    </div>
  );
}

function Promedio({ titulo, r, m, activo }: { titulo: string; r: ResumenSede; m: Metricas; activo: boolean }) {
  if (!r.pj)
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <span className={`h-1 w-1 rounded-full ${activo ? "bg-emerald-400" : "bg-slate-600"}`} />
        {titulo}: sin partidos
      </div>
    );
  return (
    <div className={`flex items-center gap-1.5 text-[11px] tabular-nums ${activo ? "text-slate-200" : "text-slate-500"}`}>
      <span className={`h-1 w-1 rounded-full ${activo ? "bg-emerald-400" : "bg-slate-600"}`} />
      {titulo} ({r.pj}): {m.a.corto} {r.a.toFixed(1)}-{r.aC.toFixed(1)} · {m.b.corto} {r.b.toFixed(1)}-
      {r.bC.toFixed(1)}
    </div>
  );
}

function BloqueEquipo({ l, m, marcador }: { l: Lado; m: Metricas; marcador: boolean }) {
  return (
    <div className="rounded-xl bg-black/30 p-3.5 ring-1 ring-white/5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-sm font-bold text-white">{l.nombre}</span>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            l.casa ? "bg-sky-400/10 text-sky-300" : "bg-white/5 text-slate-400"
          }`}
        >
          {l.casa ? "local" : "visita"}
        </span>
      </div>

      <div className="mt-3 flex gap-5">
        <Metrica valor={l.a} nombre={m.a.nombre} p={l.pA} />
        <Metrica valor={l.b} nombre={m.b.nombre} p={l.pB} />
      </div>

      {(l.segA || l.segB) && (
        <div className="mt-2.5">
          <LineaSeguraStrip segA={l.segA} segB={l.segB} m={m} />
        </div>
      )}

      {/* Historial reciente: fecha, rival, marcador y las dos métricas (a favor-en contra) */}
      {l.ultimos.length ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-[11px] tabular-nums">
            <tbody>
              {l.ultimos.map((u) => (
                <tr key={u.fid} className="border-t border-white/5">
                  <td className="py-1.5 pr-2 text-slate-500">{fechaCorta(u.ts)}</td>
                  <td className="max-w-[110px] truncate py-1.5 pr-2 text-slate-300">
                    <span className={u.casa ? "font-semibold text-sky-300/80" : "text-slate-500"}>
                      {u.casa ? "vs" : "@"}
                    </span>{" "}
                    {u.rival}
                  </td>
                  {marcador && (
                    <td className="py-1.5 pr-2 font-bold text-slate-200">
                      {u.gf}-{u.gc}
                    </td>
                  )}
                  <td className="py-1.5 pr-2 text-slate-300">
                    <span className="text-slate-500">{m.a.corto}</span> <b className="text-white">{u.af}</b>
                    <span className="text-slate-500">-{u.ac}</span>
                  </td>
                  <td className="py-1.5 text-slate-300">
                    <span className="text-slate-500">{m.b.corto}</span> <b className="text-white">{u.bf}</b>
                    <span className="text-slate-500">-{u.bc}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-3 text-xs text-slate-500">sin historial todavía</div>
      )}

      <div className="mt-3 space-y-1 border-t border-white/5 pt-2.5">
        <Promedio titulo="Local" r={l.promLocal} m={m} activo={l.casa} />
        <Promedio titulo="Visita" r={l.promVisita} m={m} activo={!l.casa} />
      </div>
    </div>
  );
}

function Partido({ p, m, marcador, ahora }: { p: Proyeccion; m: Metricas; marcador: boolean; ahora: number | null }) {
  const [abierto, setAbierto] = useState(false);
  const [analisis, setAnalisis] = useState(false);
  // Solo se muestra cuando el navegador ya montó: si lo calculara el servidor,
  // el HTML llegaría con una cuenta regresiva vieja y no calzaría al hidratar.
  const rel = ahora === null ? "" : relativo(p.ts, ahora);
  const doble = p.pA >= 0.6 && p.pB >= 0.6;
  return (
    <li
      className={`overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] ring-1 transition ${
        doble ? "ring-emerald-400/30" : "ring-white/10"
      }`}
    >
      <button onClick={() => setAbierto((v) => !v)} className="w-full px-4 py-3.5 text-left active:bg-white/5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 shrink-0 text-center">
            <div className="text-base font-extrabold tabular-nums text-white">{horaChile(p.ts)}</div>
            {rel && (
              <div className={`text-[10px] font-medium ${rel === "en juego" ? "text-emerald-300" : "text-slate-500"}`}>
                {rel}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 border-l border-white/10 pl-3.5">
            <div className="truncate text-[15px] font-bold leading-snug text-white">{p.local}</div>
            <div className="truncate text-[15px] font-medium leading-snug text-slate-300">{p.visita}</div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
              {doble && (
                <span className="rounded bg-emerald-400/15 px-1.5 py-px font-bold text-emerald-300">DOBLE</span>
              )}
              <span className="truncate">{p.liga}</span>
              {p.pjMin < 6 && <span className="h-1 w-1 shrink-0 rounded-full bg-amber-400" title="muestra corta" />}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Pill v={p.pA}>
              {p.a.toFixed(p.a >= 100 ? 0 : 1)} {m.a.corto} · {pct(p.pA)}
            </Pill>
            <Pill v={p.pB}>
              {p.b.toFixed(1)} {m.b.corto} · {pct(p.pB)}
            </Pill>
          </div>
        </div>
      </button>
      {p.resultado && (
        <div className="px-3 pb-2">
          <ResultadoStrip p={p} m={m} />
        </div>
      )}
      <div className="flex items-center gap-2 px-3 pb-3">
        {(p.segA || p.segB) && (
          <div className="min-w-0 flex-1">
            <LineaSeguraStrip segA={p.segA} segB={p.segB} m={m} />
          </div>
        )}
        <button
          onClick={() => setAnalisis(true)}
          className="shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-300 ring-1 ring-white/10 active:bg-white/5"
        >
          Análisis
        </button>
      </div>
      {abierto && (
        <div className="space-y-2.5 px-3 pb-3.5">
          {p.lados.map((l) => (
            <BloqueEquipo key={l.nombre + (l.casa ? "L" : "V")} l={l} m={m} marcador={marcador} />
          ))}
          <p className="px-1 text-[11px] leading-relaxed text-slate-500">
            Totales del partido: {p.a.toFixed(1)} {m.a.nombre} y {p.b.toFixed(1)} {m.b.nombre} proyectados. La
            «línea segura» es la línea Over más alta con más de 80% de caer, según el modelo. Los porcentajes de
            cada equipo son contra su propia línea, no contra el total.
          </p>
        </div>
      )}
      {analisis && <ModalAnalisis p={p} m={m} onClose={() => setAnalisis(false)} />}
    </li>
  );
}

/** Franja verde con la recomendación de línea segura (Over con prob > 80%). */
function LineaSeguraStrip({ segA, segB, m }: { segA: LineaSegura | null; segB: LineaSegura | null; m: Metricas }) {
  if (!segA && !segB) return null;
  const item = (s: LineaSegura | null, corto: string) =>
    s ? (
      <span className="inline-flex items-baseline gap-1">
        <span className="font-bold text-emerald-300">+{s.linea.toFixed(1)}</span>
        <span className="text-emerald-400/70">{corto}</span>
        <span className="text-emerald-400/50 tabular-nums">{pct(s.prob)}</span>
      </span>
    ) : null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-emerald-400/10 px-3 py-1.5 text-[11px] ring-1 ring-emerald-400/20">
      <span className="font-bold uppercase tracking-wide text-emerald-300/80">Línea segura</span>
      {item(segA, m.a.corto)}
      {item(segB, m.b.corto)}
    </div>
  );
}

/**
 * Franja de resultado real vs proyección, para partidos ya jugados. El acierto
 * (✓/✗) se juzga contra la línea segura, que es la recomendación que dio el
 * modelo: caía si el total real la superaba.
 */
function ResultadoStrip({ p, m }: { p: Proyeccion; m: Metricas }) {
  const r = p.resultado;
  if (!r) return null;
  const item = (real: number, proy: number, seg: Proyeccion["segA"], corto: string) => {
    const acerto = seg ? real > seg.linea : null; // null si no hubo línea segura
    return (
      <span className="inline-flex items-baseline gap-1">
        <span className="font-bold tabular-nums text-white">{real}</span>
        <span className="text-slate-500">{corto}</span>
        <span className="text-slate-600 tabular-nums">proy {proy.toFixed(0)}</span>
        {seg && (
          <span className={acerto ? "font-bold text-emerald-400" : "font-bold text-rose-400"}>
            +{seg.linea.toFixed(1)} {acerto ? "✓" : "✗"}
          </span>
        )}
      </span>
    );
  };
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-sky-400/10 px-3 py-1.5 text-[11px] ring-1 ring-sky-400/20">
      <span className="font-bold uppercase tracking-wide text-sky-300/80">
        Resultado {r.gl}–{r.gv}
      </span>
      {item(r.a, p.a, p.segA, m.a.corto)}
      {item(r.b, p.b, p.segB, m.b.corto)}
    </div>
  );
}

const x1 = (v: number) => `×${v.toFixed(2)}`;

/** Desglose de una métrica dentro del modal de análisis. */
function DesgloseMetricaVista({ dm, nombre }: { dm: DesgloseMetrica; nombre: string }) {
  const fila = (f: DesgloseMetrica["local"], sede: string) => (
    <tr className="border-t border-white/5">
      <td className="py-1.5 pr-2 text-slate-300">
        {f.nombre} <span className="text-slate-500">({sede})</span>
      </td>
      <td className="py-1.5 px-1 text-right tabular-nums text-slate-400">{x1(f.ataque)}</td>
      <td className="py-1.5 px-1 text-right tabular-nums text-slate-400">{x1(f.defensaRival)}</td>
      <td className="py-1.5 px-1 text-right tabular-nums text-slate-400">{x1(f.localia)}</td>
      <td className="py-1.5 pl-1 text-right font-bold tabular-nums text-white">{f.proyeccion.toFixed(1)}</td>
    </tr>
  );
  return (
    <div className="rounded-xl bg-black/30 p-3.5 ring-1 ring-white/5">
      <h3 className="mb-1 text-sm font-bold capitalize text-white">{nombre}</h3>
      <p className="mb-2 text-[11px] text-slate-500">
        Base de la liga: <b className="text-slate-300">{dm.base.toFixed(1)}</b> por equipo. Cada lado ={" "}
        base × ataque × defensa del rival × localía.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px] text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-500">
              <th className="pb-1 text-left font-semibold">Equipo</th>
              <th className="pb-1 px-1 text-right font-semibold">Ataque</th>
              <th className="pb-1 px-1 text-right font-semibold">Def. rival</th>
              <th className="pb-1 px-1 text-right font-semibold">Local</th>
              <th className="pb-1 pl-1 text-right font-semibold">Proyec.</th>
            </tr>
          </thead>
          <tbody>
            {fila(dm.local, "local")}
            {fila(dm.visita, "visita")}
          </tbody>
        </table>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/5 pt-2.5 text-[11px]">
        <span className="text-slate-400">
          Total: <b className="text-white">{dm.total.toFixed(1)}</b>
        </span>
        <span className="text-slate-500">
          P(&gt; {dm.linea}) = <b className={dm.prob >= 0.6 ? "text-emerald-300" : "text-slate-300"}>{pct(dm.prob)}</b>
        </span>
        {dm.segura && (
          <span className="text-emerald-300/80">
            segura: <b>+{dm.segura.linea.toFixed(1)}</b> ({pct(dm.segura.prob)})
          </span>
        )}
      </div>
    </div>
  );
}

/** Modal con el análisis matemático del partido. */
function ModalAnalisis({ p, m, onClose }: { p: Proyeccion; m: Metricas; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-slate-900 ring-1 ring-white/10 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-white/10 bg-slate-900/95 px-4 py-3 backdrop-blur">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-white">
              {p.local} <span className="text-slate-500">vs</span> {p.visita}
            </h2>
            <p className="text-[11px] text-slate-500">Análisis · la matemática detrás</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-400 ring-1 ring-white/10 active:bg-white/5"
          >
            Cerrar
          </button>
        </div>
        <div className="space-y-3 p-4">
          <DesgloseMetricaVista dm={p.desglose.a} nombre={m.a.nombre} />
          <DesgloseMetricaVista dm={p.desglose.b} nombre={m.b.nombre} />
          <div className="rounded-xl bg-white/[0.03] p-3.5 text-[11px] leading-relaxed text-slate-400 ring-1 ring-white/5">
            <p className="mb-1.5">
              <b className="text-slate-300">Cómo se lee.</b> El <b>ataque</b> es cuánto genera el equipo respecto a
              la media de su liga (×1.20 = 20% más que el promedio). La <b>defensa del rival</b> es cuánto concede el
              otro equipo. La <b>localía</b> ajusta por jugar de local (&gt;1) o visita (&lt;1).
            </p>
            <p className="mb-1.5">
              Multiplicados dan la proyección de cada lado; sumadas, el total del partido. La <b>probabilidad</b> es
              la de Poisson de superar la línea con ese total esperado.
            </p>
            <p>
              La <b className="text-emerald-300/80">línea segura</b> es la línea Over más alta que aún supera el 80%.
              El modelo tiende a ser algo optimista en los extremos: úsalo como probabilidad alta, no como certeza.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const METRICAS_VACIAS: Metricas = { a: { nombre: "—", corto: "a" }, b: { nombre: "—", corto: "b" } };

export function Cartelera({
  inicial,
  deporte,
  fecha,
  titulo,
  dias,
  fallo,
}: {
  inicial: Datos | null;
  deporte: string;
  fecha: string;
  titulo: string;
  dias: { fecha: string; etiqueta: string }[];
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

  const poblar = () =>
    empezar(async () => {
      setMsg("Trayendo historial por equipo desde ESPN… (puede tomar un minuto)");
      setError(null);
      try {
        const r = await fetch(`/Privado/poblar?modo=equipo`, { method: "POST" });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
        const aviso = (j.avisos ?? []).join(" ");
        setMsg(`Historial: ${j.equiposEscritos} equipos, ${j.partidos} partidos. ${aviso}`.trim());
      } catch (e) {
        setError((e as Error).message);
        setMsg(null);
        return;
      }
      await refrescarInterno(false);
    });

  const refrescarInterno = async (forzar: boolean) => {
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
      setMsg(null);
    } catch (e) {
      setError((e as Error).message);
      setMsg(null);
    }
  };

  const refrescar = (forzar: boolean) => empezar(() => refrescarInterno(forzar));

  const partidos = datos?.partidos ?? [];
  const m = datos?.metricas ?? METRICAS_VACIAS;
  const dobles = partidos.filter((p) => p.pA >= 0.6 && p.pB >= 0.6).length;

  // Cartelera agrupada por liga: proyectados y "sin historial" juntos bajo su
  // liga, y las ligas ordenadas por el primer partido del día.
  type Grupo = { liga: string; ts: number; proyectados: typeof partidos; sinDatos: NonNullable<typeof datos>["sinDatos"] };
  const porLiga = new Map<string, Grupo>();
  const grupo = (liga: string, ts: number) => {
    const g = porLiga.get(liga) ?? { liga, ts, proyectados: [], sinDatos: [] };
    g.ts = Math.min(g.ts, ts);
    porLiga.set(liga, g);
    return g;
  };
  for (const p of partidos) grupo(p.liga, p.ts).proyectados.push(p);
  for (const s of datos?.sinDatos ?? []) grupo(s.liga, s.ts).sinDatos.push(s);
  const grupos = [...porLiga.values()].sort((a, b) => a.ts - b.ts);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100">
      <main className="mx-auto w-full max-w-2xl pb-20">
        <header className="sticky top-0 z-10 border-b border-white/5 bg-slate-950/90 px-4 pb-3 pt-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold tracking-tight text-white first-letter:uppercase">
                {m.a.nombre} <span className="text-slate-500">&</span> {m.b.nombre}
              </h1>
              <p className="text-xs text-slate-500 first-letter:uppercase">{titulo} · hora de Chile</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => refrescar(true)}
                disabled={cargando}
                className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-extrabold text-slate-950 active:bg-emerald-300 disabled:opacity-40"
              >
                {cargando ? "…" : "Actualizar"}
              </button>
              <form action="/Privado/salir" method="post">
                <button className="rounded-full px-3 py-2 text-xs font-medium text-slate-500 ring-1 ring-white/10 active:bg-white/5">
                  Salir
                </button>
              </form>
            </div>
          </div>
          <nav className={`mt-3 gap-1.5 ${DEPORTES_EN_PORTADA.length > 1 ? "flex" : "hidden"}`}>
            {DEPORTES_EN_PORTADA.map((dep) => (
              <a
                key={dep.id}
                href={`/Privado?deporte=${dep.id}`}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  dep.id === deporte ? "bg-white text-slate-950" : "text-slate-400 ring-1 ring-white/10"
                }`}
              >
                {dep.nombre}
              </a>
            ))}
          </nav>
          <nav className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {dias.map((d) => (
              <a
                key={d.fecha}
                href={`/Privado?deporte=${deporte}&fecha=${d.fecha}`}
                aria-current={d.fecha === fecha ? "date" : undefined}
                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold first-letter:uppercase ${
                  d.fecha === fecha ? "bg-emerald-400 text-slate-950" : "text-slate-400 ring-1 ring-white/10 active:bg-white/5"
                }`}
              >
                {d.etiqueta}
              </a>
            ))}
          </nav>
          {msg && <p className="mt-2 text-xs text-slate-400">{msg}</p>}
          {error && <p className="mt-2 text-xs font-medium text-red-400">{error}</p>}
        </header>

        {datos && (
          <div className="grid grid-cols-3 gap-2 px-3 pt-3">
            {[
              { n: partidos.length, t: "partidos", verde: false },
              { n: dobles, t: "doble ≥60%", verde: dobles > 0 },
              { n: datos.ligasCargadas.length, t: "ligas", verde: false },
            ].map((k) => (
              <div key={k.t} className="rounded-xl bg-white/[0.03] px-2 py-2.5 text-center ring-1 ring-white/5">
                <div className={`text-xl font-extrabold tabular-nums ${k.verde ? "text-emerald-300" : "text-white"}`}>
                  {k.n}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500">{k.t}</div>
              </div>
            ))}
          </div>
        )}

        {grupos.map((g) => (
          <section key={g.liga} className="pt-4">
            <div className="flex items-baseline justify-between px-4 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">{g.liga}</h2>
              <span className="text-[11px] tabular-nums text-slate-600">
                {g.proyectados.length + g.sinDatos.length} partidos
              </span>
            </div>
            <ul className="space-y-2.5 px-3">
              {g.proyectados.map((p) => (
                <Partido key={p.fid} p={p} m={m} marcador={datos?.mostrarMarcador ?? true} ahora={ahora} />
              ))}
              {g.sinDatos.map((s, i) => (
                <li
                  key={`sd-${i}`}
                  className="flex items-center gap-3.5 rounded-2xl px-4 py-3 ring-1 ring-white/5"
                >
                  <div className="w-12 shrink-0 text-center text-base font-extrabold tabular-nums text-slate-300">
                    {horaChile(s.ts)}
                  </div>
                  <div className="min-w-0 flex-1 border-l border-white/10 pl-3.5">
                    <div className="truncate text-[15px] font-semibold leading-snug text-slate-300">{s.local}</div>
                    <div className="truncate text-[15px] font-medium leading-snug text-slate-400">{s.visita}</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-500 ring-1 ring-white/10">
                    sin historial
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {!grupos.length && !error && (
          <p className="px-4 py-14 text-center text-sm text-slate-500">
            {datos ? "No hay partidos hoy en las ligas seguidas." : "Cargando…"}
          </p>
        )}

        {deporte === "futbol" && (
          <div className="px-4 pt-4">
            <button
              onClick={poblar}
              disabled={cargando}
              className="w-full rounded-xl py-2.5 text-xs font-semibold text-slate-400 ring-1 ring-white/10 active:bg-white/5 disabled:opacity-40"
            >
              Poblar historial desde ESPN (últimas 5 semanas)
            </button>
          </div>
        )}

        {datos && datos.avisos.length > 0 && (
          <section className="mt-5 px-4 text-xs text-slate-500">
            {datos.nota && <p className="mb-2">{datos.nota}</p>}
            {datos.avisos.map((a, i) => (
              <p key={i} className="mb-1">
                {a}
              </p>
            ))}
          </section>
        )}

        {datos && (
          <p className="mt-6 px-4 text-[11px] text-slate-600">
            Actualizado {new Date(datos.generado).toLocaleString("es-CL", { timeZone: "America/Santiago" })} ·{" "}
            {datos.peticiones} peticiones en la última pasada
          </p>
        )}
      </main>
    </div>
  );
}
