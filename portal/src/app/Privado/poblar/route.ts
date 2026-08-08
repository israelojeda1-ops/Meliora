import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_PRIVADO, verificar } from "@/lib/deportes/sesion";
import { poblarFutbol } from "@/lib/deportes/espn";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Puebla el historial de fútbol desde la API pública de ESPN, a pedido. Rellena
 * los días del almacén que aún no existen; lo ya cosechado no se toca.
 */
export async function POST(req: NextRequest) {
  if (!verificar((await cookies()).get(COOKIE_PRIVADO)?.value)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const url = new URL(req.url);
  const dias = Math.min(45, Math.max(1, Number(url.searchParams.get("dias")) || 35));
  const ligaParam = url.searchParams.get("liga");
  const liga = ligaParam ? Number(ligaParam) : undefined;

  try {
    return NextResponse.json(await poblarFutbol(dias, liga));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
