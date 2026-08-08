import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { COOKIE_PRIVADO, verificar } from "@/lib/deportes/sesion";
import { getCartelera } from "@/lib/deportes/cartelera";
import { TAG_LISTAS } from "@/lib/deportes/api";
import { fechaChile } from "@/lib/deportes/fecha";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Deja pasar al dueño de la sesión o al cron de Vercel. */
async function autorizado(req: NextRequest): Promise<boolean> {
  const secreto = process.env.CRON_SECRET;
  if (secreto && req.headers.get("authorization") === `Bearer ${secreto}`) return true;
  return verificar((await cookies()).get(COOKIE_PRIVADO)?.value);
}

async function manejar(req: NextRequest) {
  if (!(await autorizado(req))) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const url = new URL(req.url);
  const fechaParam = url.searchParams.get("fecha");
  const fecha = fechaParam && /^\d{4}-\d{2}-\d{2}$/.test(fechaParam) ? fechaParam : fechaChile(Date.now());
  const forzar = url.searchParams.get("forzar") === "1";

  // Solo se caducan las listas: las estadísticas de partidos ya jugados siguen
  // en caché, así que actualizar no vuelve a pagar por ellas.
  if (forzar) revalidateTag(TAG_LISTAS, { expire: 0 });

  try {
    const datos = await getCartelera(url.searchParams.get("deporte") ?? undefined, fecha, {
      maxPeticiones: 30,
    });
    return NextResponse.json(datos);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export const POST = manejar;
// El cron de Vercel llama con GET.
export const GET = manejar;
