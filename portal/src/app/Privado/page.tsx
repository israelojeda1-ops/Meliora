import { cookies } from "next/headers";
import { COOKIE_PRIVADO, verificar } from "@/lib/futbol/sesion";
import { diaAMostrar, getCartelera } from "@/lib/futbol/cartelera";
import { Cartelera } from "./Cartelera";

export const metadata = {
  title: "Privado",
  robots: { index: false, follow: false },
};

// La página se arma en cada visita, pero las llamadas a la API salen del caché
// de datos: una carga normal no gasta cuota.
export const dynamic = "force-dynamic";

export default async function PrivadoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; fecha?: string }>;
}) {
  const { error, fecha: fechaParam } = await searchParams;
  const token = (await cookies()).get(COOKIE_PRIVADO)?.value;
  const dentro = await verificar(token);

  if (!dentro) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <form action="/Privado/acceso" method="post" className="w-full max-w-sm">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h1 className="text-lg font-bold text-slate-900 mb-1">Zona privada</h1>
            <p className="text-sm text-slate-500 mb-5">Ingresa la clave para continuar.</p>
            <input
              type="password"
              name="clave"
              autoFocus
              autoComplete="current-password"
              placeholder="Clave"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-slate-900"
            />
            {error === "clave" && <p className="mt-3 text-sm text-red-600">Clave incorrecta.</p>}
            {error === "config" && (
              <p className="mt-3 text-sm text-red-600">
                Falta configurar la variable de entorno <code>PRIVADO_PASSWORD</code>.
              </p>
            )}
            <button
              type="submit"
              className="mt-5 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white active:bg-slate-800"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    );
  }

  const { fecha, titulo } = await diaAMostrar(fechaParam);

  let datos;
  let fallo: string | null = null;
  try {
    datos = await getCartelera(fecha, { maxPeticiones: 6 });
  } catch (e) {
    fallo = (e as Error).message;
  }

  return <Cartelera inicial={datos ?? null} fecha={fecha} titulo={titulo} fallo={fallo} />;
}
