import { NextRequest, NextResponse } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

// Cóndores y la nueva versión de Nuprotec son aplicaciones con login propio
// (usuarios y roles en su base): la clave del portal encima de su login sería
// un doble acceso, así que pasan sin la puerta del portal.
// /Privado tampoco pasa por aquí: tiene su propia clave y su propia cookie, y no
// es un cliente del portal, así que la puerta por slug de cliente no le aplica.
// /api/formularios recibe los formularios del sitio público: quien los envía no
// es cliente del portal y no tiene sesión, así que tampoco pasa por la puerta.
const PUBLIC_PREFIXES = [
  "/login",
  "/logout",
  "/demo",
  "/condores",
  "/nuprotecV2",
  "/Nuprotecv3",
  "/Privado",
  "/api/formularios",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/" || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const clientSlug = pathname.split("/").filter(Boolean)[0];
  const session = await decrypt(req.cookies.get(SESSION_COOKIE)?.value);

  if (!session || session.client !== clientSlug) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("client", clientSlug);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
