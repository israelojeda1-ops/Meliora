import { cookies } from "next/headers";
import { COOKIE_PRIVADO, verificar } from "@/lib/deportes/sesion";
import { diaAMostrar, getCartelera } from "@/lib/deportes/cartelera";
import { getDeporte } from "@/lib/deportes/catalogo";
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
  searchParams: Promise<{ error?: string; fecha?: string; deporte?: string }>;
}) {
  const { error, fecha: fechaParam, deporte: deporteParam } = await searchParams;
  const token = (await cookies()).get(COOKIE_PRIVADO)?.value;
  const dentro = await verificar(token);

  if (!dentro) {
    return (
      <div className="flex min-h-screen w-full flex-1 items-center justify-center bg-slate-950 px-4 py-16">
        <form action="/Privado/acceso" method="post" className="w-full max-w-sm">
          <div className="rounded-2xl bg-white/[0.04] p-7 ring-1 ring-white/10">
            <h1 className="mb-1 text-lg font-extrabold tracking-tight text-white">Zona privada</h1>
            <p className="mb-5 text-sm text-slate-400">Ingresa la clave para continuar.</p>
            <input
              type="password"
              name="clave"
              autoFocus
              autoComplete="current-password"
              placeholder="Clave"
              className="w-full rounded-xl bg-white/5 px-3.5 py-2.5 text-base text-white placeholder-slate-500 outline-none ring-1 ring-white/10 focus:ring-emerald-400/50"
            />
            {error === "clave" && <p className="mt-3 text-sm font-medium text-red-400">Clave incorrecta.</p>}
            {error === "config" && (
              <p className="mt-3 text-sm font-medium text-red-400">
                Falta configurar la variable de entorno <code>PRIVADO_PASSWORD</code>.
              </p>
            )}
            <button
              type="submit"
              className="mt-5 w-full rounded-xl bg-emerald-400 py-2.5 text-sm font-extrabold text-slate-950 active:bg-emerald-300"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    );
  }

  const { fecha, titulo } = await diaAMostrar(fechaParam);
  const deporte = getDeporte(deporteParam);

  let datos;
  let fallo: string | null = null;
  try {
    datos = await getCartelera(deporte.id, fecha, { maxPeticiones: 30 });
  } catch (e) {
    fallo = (e as Error).message;
  }

  return (
    <Cartelera inicial={datos ?? null} deporte={deporte.id} fecha={fecha} titulo={titulo} fallo={fallo} />
  );
}
