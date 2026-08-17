import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_PRIVADO, verificar } from "@/lib/deportes/sesion";
import { getOportunidades } from "@/lib/deportes/cartelera";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Buscador de oportunidades: los partidos por jugarse que más se destacan. */
export async function POST(req: NextRequest) {
  if (!verificar((await cookies()).get(COOKIE_PRIVADO)?.value)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const deporte = new URL(req.url).searchParams.get("deporte") ?? undefined;
  try {
    return NextResponse.json({ oportunidades: await getOportunidades(deporte) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
