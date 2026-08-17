import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_PRIVADO, verificar } from "@/lib/deportes/sesion";
import { importarXg } from "@/lib/deportes/importar";
import { revalidateTag } from "next/cache";
import { TAG_STATS } from "@/lib/deportes/api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Importa el xG real desde el Excel del usuario. Acepta el archivo como texto en
 * el cuerpo (CSV o JSON): fila por partido con fecha, local, visita y el xG de
 * cada lado. Se guarda como capa de correcciones que la lectura del historial
 * aplica encima del xG estimado desde los remates.
 */
export async function POST(req: NextRequest) {
  if (!verificar((await cookies()).get(COOKIE_PRIVADO)?.value)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const texto = await req.text();
    const resumen = await importarXg(texto);
    // Deja caer la caché de estadísticas para que el historial relea las
    // correcciones en la próxima carga de la cartelera.
    if (resumen.guardadas > 0) revalidateTag(TAG_STATS, { expire: 0 });
    return NextResponse.json(resumen);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
