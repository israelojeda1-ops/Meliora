import { NextRequest, NextResponse } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session";
import { getClient } from "@/lib/clients";

// Rutas del portal mismo: no hay cliente detrás que autorizar.
const RUTAS_PORTAL = ["/login", "/logout", "/demo"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/" || RUTAS_PORTAL.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const segmentos = pathname.split("/").filter(Boolean);
  const primero = segmentos[0] ?? "";
  const cliente = getClient(primero);

  // Canonicaliza el slug antes de cualquier otra cosa: las apps proxeadas se
  // montan con un basePath que distingue mayúsculas ("/nuprotecV2"), así que
  // reenviar "/nuprotecv2" tal cual moriría en un 404 del otro lado. Se
  // redirige a la forma correcta en vez de romperse por una letra.
  if (cliente && cliente.slug !== primero) {
    const url = req.nextUrl.clone();
    segmentos[0] = cliente.slug;
    url.pathname = `/${segmentos.join("/")}`;
    return NextResponse.redirect(url);
  }

  // Apps con login propio: la clave del portal encima de la suya sería un
  // doble acceso. Se deriva de CLIENTS y no de una lista aparte, para que
  // agregar un cliente así no dependa de acordarse de tocar este archivo.
  if (cliente?.loginPropio) return NextResponse.next();

  const session = await decrypt(req.cookies.get(SESSION_COOKIE)?.value);

  if (!session || session.client !== primero) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("client", primero);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
