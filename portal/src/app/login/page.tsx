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
  const clientSlug = clientParam ?? "nuprotec";
  const client = getClient(clientSlug);

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
          ) : (
            <div>
              <p className="text-sm text-red-600 mb-4">
                Cliente no encontrado. Verifica el link de acceso.
              </p>
              <Link
                href="/login"
                className="text-sm font-semibold text-emerald hover:text-emerald-dark transition-colors"
              >
                ← Volver al inicio de sesión
              </Link>
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
