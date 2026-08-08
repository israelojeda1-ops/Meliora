import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_PRIVADO, verificar } from "@/lib/deportes/sesion";
import { poblarFutbol, poblarPorEquipo } from "@/lib/deportes/espn";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Puebla el historial de fútbol desde la API pública de ESPN, a pedido.
 * - `?modo=equipo` (por defecto): historial profundo por equipo (temporada
 *   actual + anterior, todas las competencias). Es lo que da varios partidos
 *   hacia atrás cuando una temporada recién empezó.
 * - `?modo=dia`: rellena los días recientes del almacén que aún no existen.
 * Lo ya guardado no se pisa; ambas corren a tramos y se retoman tocando de nuevo.
 */
export async function POST(req: NextRequest) {
  if (!verificar((await cookies()).get(COOKIE_PRIVADO)?.value)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const url = new URL(req.url);
  const modo = url.searchParams.get("modo") ?? "equipo";

  try {
    if (modo === "dia") {
      const dias = Math.min(45, Math.max(1, Number(url.searchParams.get("dias")) || 35));
      const ligaParam = url.searchParams.get("liga");
      return NextResponse.json(await poblarFutbol(dias, ligaParam ? Number(ligaParam) : undefined));
    }
    return NextResponse.json(await poblarPorEquipo(url.searchParams.get("forzar") === "1"));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
