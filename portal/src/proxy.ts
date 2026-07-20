import { NextRequest, NextResponse } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

const PUBLIC_PREFIXES = ["/login", "/logout", "/demo"];

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
