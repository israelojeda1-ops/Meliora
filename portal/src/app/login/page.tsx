import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/LoginForm";
import { getClient } from "@/lib/clients";

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
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo theme="light" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-lg font-bold text-navy mb-6">
            Portal de Clientes
          </h1>
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
                Ingresa con el enlace de acceso privado que te compartió Meliora
                Advisory. Cada cliente tiene su propio portal con sus reportes
                actualizados en cada cierre mensual.
              </p>
            </div>
          )}
        </div>
        <div className="text-center mt-6">
          <Link
            href="/demo"
            className="text-sm font-semibold text-emerald hover:text-emerald-dark transition-colors"
          >
            ¿Aún no eres cliente? Ver demo del portal →
          </Link>
        </div>
      </div>
    </div>
  );
}
