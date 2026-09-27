import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/clients";

/**
 * /Nuprotecv3 REDIRIGE al servidor propio; ya no se proxea.
 *
 * Antes esta ruta reenviaba cada pedido con fetch desde una función de Vercel.
 * El problema es por dónde pasaba: el proyecto del portal está en `iad1`
 * (Washington), así que un clic desde Chile hacía Chile → São Paulo →
 * Washington → el VPS en Chile, y todo el camino de vuelta. Medido: ~0,9 s por
 * pedido entrando por el portal contra ~0,5 s entrando directo. Y cada pantalla
 * son varios pedidos, así que ese rodeo se pagaba varias veces.
 *
 * `nuprotec.melioraadvisory.cl` ya está detrás de Cloudflare, el mismo camino
 * que usa app.msnchile.cl: navegador → Cloudflare → VPS.
 *
 * Redirigir no pierde nada porque el portal acá no hacía de puerta: Nuprotec
 * tiene login propio, con sus usuarios y roles en su base, y esta ruta ya
 * reenviaba sin pedir la clave del portal. Lo único que cambia es el dominio
 * que se ve en la barra —y con eso las cookies de sesión pasan a vivir en el
 * dominio de la app, que además evita que v2 y v3 se pisen la sesión—.
 *
 * Es 307 y no 308 a propósito: un permanente lo cachean los navegadores por
 * tiempo indefinido, y volver atrás se vuelve imposible para quien ya lo
 * guardó. El 307 además conserva método y cuerpo, así que un POST en vuelo no
 * se convierte en GET.
 *
 * Los enlaces viejos a portal.melioraadvisory.cl/Nuprotecv3 siguen andando:
 * pagan un salto y quedan en el destino.
 */
function redirigir(req: NextRequest) {
  const client = getClient("Nuprotecv3");
  if (!client?.proxyTarget) {
    return new Response("Cliente no configurado", { status: 404 });
  }
  const destino = new URL(
    `${req.nextUrl.pathname}${req.nextUrl.search}`,
    client.proxyTarget
  );
  return NextResponse.redirect(destino, 307);
}

export {
  redirigir as GET,
  redirigir as POST,
  redirigir as PUT,
  redirigir as PATCH,
  redirigir as DELETE,
  redirigir as HEAD,
};
