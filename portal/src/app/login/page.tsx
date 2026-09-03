import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/LoginForm";
import { getClient } from "@/lib/clients";
import { DashboardPreview } from "../demo/DemoCover";

const BENEFICIOS = [
  "Tus números actualizados en cada cierre mensual",
  "Ventas, caja, cobranza y resultados en un solo lugar",
  "Acceso privado, desde cualquier dispositivo",
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client: clientParam } = await searchParams;
  // Sin parámetro de cliente no revelamos ningún nombre de cliente:
  // solo se muestra el formulario cuando el link de acceso trae un slug válido.
  const client = clientParam ? getClient(clientParam) : undefined;

  return (
    <div className="flex-1 grid lg:grid-cols-[1.05fr_0.95fr] min-h-screen">
      {/* ── Panel de marca ── */}
      <div className="relative overflow-hidden bg-navy-dark hidden lg:flex flex-col justify-between p-10 xl:p-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(14,124,102,0.35), transparent 40%), radial-gradient(circle at 85% 0%, rgba(27,42,74,0.6), transparent 45%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        <div className="relative">
          <Logo theme="dark" />
        </div>

        <div className="relative max-w-lg">
          <h1 className="text-2xl xl:text-3xl font-bold text-white leading-tight tracking-tight">
            Los números de tu empresa, como los vería un gerente de finanzas.
          </h1>
          <ul className="mt-6 space-y-3">
            {BENEFICIOS.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-slate-300">
                <svg
                  className="h-4 w-4 mt-0.5 shrink-0 text-emerald-light"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <DashboardPreview />
          </div>
        </div>

        <p className="relative text-xs text-slate-500">
          © 2026 Meliora Advisory SpA ·{" "}
          <a
            href="https://melioraadvisory.cl"
            className="hover:text-slate-300 transition-colors"
          >
            melioraadvisory.cl
          </a>
        </p>
      </div>

      {/* ── Acceso ── */}
      <div className="flex items-center justify-center px-4 py-12 sm:py-16 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo theme="light" />
          </div>

          <div className="rounded-2xl bg-white ring-1 ring-slate-900/5 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_4px_12px_rgba(16,24,40,0.08)] p-8">
            <h2 className="text-lg font-bold text-navy mb-1">Portal de Clientes</h2>
            <p className="text-xs text-slate-400 mb-6">Acceso privado con enlace personal</p>
            {client ? (
              <LoginForm clientSlug={client.slug} clientName={client.name} />
            ) : clientParam ? (
              <div>
                <p className="text-sm text-red-600 mb-4">
                  Cliente no encontrado. Verifica el link de acceso.
                </p>
                <p className="text-sm text-slate-500">
                  Usa el enlace privado que te compartió Meliora Advisory para
                  ingresar a tu portal.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Ingresa con el enlace de acceso privado que te compartió
                  Meliora Advisory. Cada cliente tiene su propio portal con sus
                  reportes actualizados en cada cierre mensual.
                </p>
              </div>
            )}
          </div>

          <Link
            href="/demo"
            className="group mt-5 flex items-center justify-between gap-3 rounded-2xl border border-emerald/25 bg-emerald/5 p-5 hover:bg-emerald/10 transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-navy">¿Aún no eres cliente?</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Explora la demo interactiva del reporte gerencial, con datos de ejemplo.
              </p>
            </div>
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald text-white transition-transform group-hover:translate-x-0.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>

          <p className="text-center text-xs text-slate-400 mt-6 lg:hidden">
            © 2026 Meliora Advisory SpA ·{" "}
            <a href="https://melioraadvisory.cl" className="hover:text-slate-600 transition-colors">
              melioraadvisory.cl
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
