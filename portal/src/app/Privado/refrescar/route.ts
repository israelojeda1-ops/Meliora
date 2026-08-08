import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { COOKIE_PRIVADO, verificar } from "@/lib/deportes/sesion";
import { getCartelera } from "@/lib/deportes/cartelera";
import { DEPORTES_EN_PORTADA } from "@/lib/deportes/catalogo";
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

  const deporte = url.searchParams.get("deporte");

  try {
    // Con deporte, responde esa cartelera (es lo que pide la página). Sin él —
    // así llama el cron de la mañana — recorre los tres deportes para que la
    // cosecha diaria del historial no dependa de que alguien abra la página.
    if (deporte) {
      return NextResponse.json(await getCartelera(deporte, fecha, { maxPeticiones: 30 }));
    }
    const resumen: Record<string, { partidos: number; avisos: string[] }> = {};
    for (const dep of DEPORTES_EN_PORTADA) {
      const c = await getCartelera(dep.id, fecha, { maxPeticiones: 30 });
      resumen[dep.id] = { partidos: c.partidos.length, avisos: c.avisos };
    }
    return NextResponse.json({ cosecha: resumen });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export const POST = manejar;
// El cron de Vercel llama con GET.
export const GET = manejar;
