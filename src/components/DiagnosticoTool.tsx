"use client";

import { useState } from "react";
import Link from "next/link";

const FORM_ENDPOINT = "https://formsubmit.co/israelojeda1@gmail.com";

type Area = "visibilidad" | "proyeccion" | "orden" | "procesos";

const areaLabels: Record<Area, string> = {
  visibilidad: "Visibilidad de tus números",
  proyeccion: "Presupuesto y proyección",
  orden: "Orden contable",
  procesos: "Procesos y tiempo",
};

type Question = {
  area: Area;
  text: string;
  options: { label: string; points: number }[];
};

const questions: Question[] = [
  {
    area: "visibilidad",
    text: "¿Recibes cada mes un reporte con ventas, margen y resultado del mes?",
    options: [
      { label: "Sí, todos los meses y a tiempo", points: 2 },
      { label: "A veces, o llega con atraso", points: 1 },
      { label: "No recibo nada parecido", points: 0 },
    ],
  },
  {
    area: "visibilidad",
    text: "¿Sabes hoy cuánto te deben tus clientes y hace cuántos días (cobranza y DSO)?",
    options: [
      { label: "Sí, lo tengo claro y actualizado", points: 2 },
      { label: "Tengo una idea aproximada", points: 1 },
      { label: "No lo sé con certeza", points: 0 },
    ],
  },
  {
    area: "visibilidad",
    text: "¿Conoces el margen por producto, servicio o línea de negocio?",
    options: [
      { label: "Sí, por línea o producto", points: 2 },
      { label: "Solo el margen global de la empresa", points: 1 },
      { label: "No conozco mis márgenes reales", points: 0 },
    ],
  },
  {
    area: "proyeccion",
    text: "¿Tienes un presupuesto anual contra el cual comparas tus resultados?",
    options: [
      { label: "Sí, y lo reviso contra lo real", points: 2 },
      { label: "Existe, pero no se usa", points: 1 },
      { label: "No tenemos presupuesto", points: 0 },
    ],
  },
  {
    area: "proyeccion",
    text: "¿Proyectas tu flujo de caja de las próximas 8–12 semanas?",
    options: [
      { label: "Sí, con proyección rolling", points: 2 },
      { label: "Solo miro el mes en curso", points: 1 },
      { label: "No proyecto la caja", points: 0 },
    ],
  },
  {
    area: "orden",
    text: "¿Tu contabilidad queda al día al cierre de cada mes?",
    options: [
      { label: "Sí, en los primeros días del mes siguiente", points: 2 },
      { label: "Se atrasa uno o más meses", points: 1 },
      { label: "No lo sé / está muy atrasada", points: 0 },
    ],
  },
  {
    area: "orden",
    text: "¿Tu contador te informa proactivamente de temas relevantes, más allá de los impuestos por pagar?",
    options: [
      { label: "Sí, me asesora activamente", points: 2 },
      { label: "A veces, si le pregunto", points: 1 },
      { label: "Solo me pasa el F29", points: 0 },
    ],
  },
  {
    area: "procesos",
    text: "¿Cuánto tiempo se dedica al mes a armar reportes a mano (Excel)?",
    options: [
      { label: "Casi nada, está automatizado", points: 2 },
      { label: "Algunas horas", points: 1 },
      { label: "Días completos de trabajo", points: 0 },
    ],
  },
  {
    area: "procesos",
    text: "¿Tu información financiera está integrada, o vive en proveedores y planillas separadas?",
    options: [
      { label: "Sí, es un servicio integrado", points: 2 },
      { label: "Parcialmente, con planillas de por medio", points: 1 },
      { label: "Son proveedores o mundos separados", points: 0 },
    ],
  },
  {
    area: "procesos",
    text: "¿Puedes ver tus números cuando quieras, sin pedirle el informe a alguien?",
    options: [
      { label: "Sí, tengo un portal o dashboard", points: 2 },
      { label: "Debo pedirlos y esperar", points: 1 },
      { label: "No hay dónde verlos", points: 0 },
    ],
  },
];

const MAX_SCORE = questions.reduce(
  (sum, q) => sum + Math.max(...q.options.map((o) => o.points)),
  0
);

type Tier = {
  min: number;
  name: string;
  color: string;
  headline: string;
  detail: string;
};

const tiers: Tier[] = [
  {
    min: 17,
    name: "Finanzas sólidas",
    color: "text-emerald",
    headline: "Tu PyME está en el grupo que decide con datos.",
    detail:
      "Tienes visibilidad y proyección. El siguiente paso suele ser profundizar el análisis estratégico — presupuesto, forecast rolling y sesiones de dirección de finanzas — para convertir ese orden en crecimiento.",
  },
  {
    min: 12,
    name: "En camino",
    color: "text-emerald",
    headline: "Hay una base, pero decides con información incompleta.",
    detail:
      "Algunas piezas funcionan, pero los vacíos en indicadores o proyección hacen que las decisiones importantes se tomen con intuición. Cerrar esas brechas específicas suele tener un impacto rápido.",
  },
  {
    min: 6,
    name: "En riesgo",
    color: "text-amber-600",
    headline: "Estás administrando mirando el retrovisor.",
    detail:
      "Tu empresa opera, pero sin visibilidad real de márgenes, cobranza ni caja futura. Ese es exactamente el punto donde un déficit de caja o un cliente moroso sorprende — y donde ordenar las finanzas genera más valor.",
  },
  {
    min: 0,
    name: "Punto crítico",
    color: "text-red-600",
    headline: "Hoy las finanzas de tu PyME son una caja negra.",
    detail:
      "Sin contabilidad al día ni indicadores, cada decisión es una apuesta. La buena noticia: partir de aquí es donde más rápido se nota el cambio — primero orden contable, luego indicadores, luego proyección.",
  },
];

const areaRecommendations: Record<Area, { text: string; href: string; cta: string }> = {
  visibilidad: {
    text: "Reportería gerencial mensual: margen por línea, cobranza y DSO entregados cada mes en tu portal de cliente.",
    href: "/servicios",
    cta: "Ver CFO as a Service",
  },
  proyeccion: {
    text: "Presupuesto anual y flujo de caja proyectado rolling 8–12 semanas, para anticipar déficits en vez de sufrirlos.",
    href: "/servicios",
    cta: "Ver CFO as a Service",
  },
  orden: {
    text: "Contabilidad mensual al día, F29, remuneraciones y Estados Financieros — con un contador que informa proactivamente.",
    href: "/servicios",
    cta: "Ver Contabilidad y Remuneraciones",
  },
  procesos: {
    text: "Automatización de reportes sobre tu propio ERP (Softland, Odoo, Nubox, Defontana u otro) y un portal con tus números 24/7.",
    href: "/servicios",
    cta: "Ver Consultoría de Gestión",
  },
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function DiagnosticoTool() {
  const [answers, setAnswers] = useState<(number | null)[]>(
    questions.map(() => null)
  );
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const answer = (optionIndex: number) => {
    const next = [...answers];
    next[step] = optionIndex;
    setAnswers(next);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setFinished(true);
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "diagnostico_completado", {
          score: next.reduce<number>(
            (sum, a, i) => sum + (a !== null ? questions[i].options[a].points : 0),
            0
          ),
        });
      }
    }
  };

  const goBack = () => {
    if (finished) {
      setFinished(false);
    } else if (step > 0) {
      setStep(step - 1);
    }
  };

  if (!finished) {
    const q = questions[step];
    const progress = Math.round((step / questions.length) * 100);
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-emerald uppercase tracking-wider">
            {areaLabels[q.area]}
          </p>
          <p className="text-xs text-slate-400">
            Pregunta {step + 1} de {questions.length}
          </p>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-100 mb-8">
          <div
            className="h-1.5 rounded-full bg-emerald transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-navy mb-6">
          {q.text}
        </h2>
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => answer(i)}
              className={`w-full text-left rounded-lg border px-5 py-3.5 text-sm transition-colors ${
                answers[step] === i
                  ? "border-emerald bg-emerald/5 text-navy font-medium"
                  : "border-slate-200 text-slate-600 hover:border-emerald/40 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {step > 0 && (
          <button
            type="button"
            onClick={goBack}
            className="mt-6 text-sm text-slate-400 hover:text-navy transition-colors"
          >
            ← Volver a la pregunta anterior
          </button>
        )}
      </div>
    );
  }

  const score = answers.reduce<number>(
    (sum, a, i) => sum + (a !== null ? questions[i].options[a].points : 0),
    0
  );
  const tier = tiers.find((t) => score >= t.min) ?? tiers[tiers.length - 1];

  const areaScores = (Object.keys(areaLabels) as Area[]).map((area) => {
    const idxs = questions
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => q.area === area);
    const got = idxs.reduce(
      (sum, { q, i }) =>
        sum + (answers[i] !== null ? q.options[answers[i]!].points : 0),
      0
    );
    const max = idxs.reduce(
      (sum, { q }) => sum + Math.max(...q.options.map((o) => o.points)),
      0
    );
    return { area, got, max, pct: Math.round((got / max) * 100) };
  });

  const weakest = [...areaScores].sort((a, b) => a.pct - b.pct).slice(0, 2);

  const resumen = questions
    .map((q, i) =>
      answers[i] !== null ? `${q.text} → ${q.options[answers[i]!].label}` : null
    )
    .filter(Boolean)
    .join("\n");

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 text-center">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Resultado de tu diagnóstico
        </p>
        <p className={`text-4xl font-bold ${tier.color}`}>
          {score} / {MAX_SCORE}
        </p>
        <p className={`mt-2 text-lg font-bold ${tier.color}`}>{tier.name}</p>
        <h2 className="mt-4 text-xl sm:text-2xl font-bold text-navy">
          {tier.headline}
        </h2>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-xl mx-auto">
          {tier.detail}
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-left max-w-xl mx-auto">
          {areaScores.map(({ area, got, max, pct }) => (
            <div key={area}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-navy">
                  {areaLabels[area]}
                </p>
                <p className="text-xs text-slate-400">
                  {got}/{max}
                </p>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div
                  className={`h-2 rounded-full ${
                    pct >= 67
                      ? "bg-emerald"
                      : pct >= 34
                        ? "bg-amber-400"
                        : "bg-red-400"
                  }`}
                  style={{ width: `${Math.max(pct, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={goBack}
          className="mt-8 text-sm text-slate-400 hover:text-navy transition-colors"
        >
          ← Revisar mis respuestas
        </button>
      </div>

      <div className="rounded-2xl bg-navy p-8 sm:p-10">
        <h3 className="text-lg font-bold text-white mb-6">
          Por dónde partir, según tus respuestas
        </h3>
        <div className="space-y-5">
          {weakest.map(({ area }) => (
            <div key={area} className="flex gap-4">
              <svg
                className="h-5 w-5 text-emerald flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-white">
                  {areaLabels[area]}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {areaRecommendations[area].text}
                </p>
                <Link
                  href={areaRecommendations[area].href}
                  className="mt-1 inline-block text-sm font-semibold text-emerald hover:text-emerald-light transition-colors"
                >
                  {areaRecommendations[area].cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10">
        <h3 className="text-lg font-bold text-navy mb-2">
          Recibe tu plan de acción personalizado
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Déjanos tus datos y te contactamos dentro de 24 horas hábiles con una
          propuesta concreta basada en este diagnóstico — sin compromiso.
        </p>
        <form action={FORM_ENDPOINT} method="POST" className="space-y-5">
          <input
            type="hidden"
            name="_subject"
            value="Diagnóstico financiero completado en melioraadvisory.cl"
          />
          <input type="hidden" name="_template" value="table" />
          <input
            type="hidden"
            name="_next"
            value="https://melioraadvisory.cl/contacto/gracias/"
          />
          <input
            type="text"
            name="_honey"
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />
          <input
            type="hidden"
            name="puntaje"
            value={`${score}/${MAX_SCORE} — ${tier.name}`}
          />
          <input type="hidden" name="respuestas" value={resumen} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="diag-name"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Nombre
              </label>
              <input
                id="diag-name"
                name="name"
                type="text"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label
                htmlFor="diag-company"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Empresa
              </label>
              <input
                id="diag-company"
                name="company"
                type="text"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald"
                placeholder="Nombre de tu empresa"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="diag-email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="diag-email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald"
                placeholder="tucorreo@empresa.cl"
              />
            </div>
            <div>
              <label
                htmlFor="diag-phone"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Teléfono
              </label>
              <input
                id="diag-phone"
                name="phone"
                type="tel"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald"
                placeholder="+56 9 1234 5678"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-dark transition-colors"
          >
            Quiero mi plan de acción
          </button>
          <p className="text-xs text-slate-400 text-center">
            Tus respuestas se envían junto al formulario para que la primera
            reunión parta con contexto real.
          </p>
        </form>
      </div>
    </div>
  );
}
