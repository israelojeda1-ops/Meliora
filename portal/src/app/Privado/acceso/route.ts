import { NextRequest, NextResponse } from "next/server";
import { COOKIE_PRIVADO, claveCorrecta, firmar } from "@/lib/futbol/sesion";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const clave = String(form.get("clave") ?? "");

  if (!process.env.PRIVADO_PASSWORD) {
    return NextResponse.redirect(new URL("/Privado?error=config", req.url), 303);
  }
  if (!claveCorrecta(clave)) {
    return NextResponse.redirect(new URL("/Privado?error=clave", req.url), 303);
  }

  const res = NextResponse.redirect(new URL("/Privado", req.url), 303);
  res.cookies.set(COOKIE_PRIVADO, await firmar(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/Privado",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
