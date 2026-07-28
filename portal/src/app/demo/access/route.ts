import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; company?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const company = String(body.company ?? "").trim();
  if (!name || !email) {
    return NextResponse.json({ ok: false, error: "Falta nombre o correo" }, { status: 400 });
  }

  // Aviso por correo — best-effort: si falla, igual dejamos ver la demo.
  try {
    await fetch("https://formsubmit.co/ajax/israelojeda1@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: "Nuevo acceso a la demo — Meliora Advisory",
        Nombre: name,
        Correo: email,
        Empresa: company || "(no informado)",
        Fecha: new Date().toISOString(),
      }),
    });
  } catch {
    // ignorar errores de red al notificar
  }

  return NextResponse.json({ ok: true });
}
