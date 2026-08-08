import { NextRequest, NextResponse } from "next/server";
import { COOKIE_PRIVADO } from "@/lib/futbol/sesion";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/Privado", req.url), 303);
  res.cookies.set(COOKIE_PRIVADO, "", { path: "/Privado", maxAge: 0 });
  return res;
}
