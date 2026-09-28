import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import nodemailer from "nodemailer";

// Quién accedió a la demo: se guarda en la base del servidor (tabla demo_accesos de la
// base `portal`) y se avisa por el correo propio. Ya no se escribe en el repo: Meliora es
// público y el CSV dejaba a la vista nombre, correo e IP. Las dos cosas son best-effort:
// si fallan (o no están configuradas), igual se muestra la demo.
//
// Variables (/etc/apps/portal.env): DATABASE_URL; SMTP_HOST, SMTP_PORT, SMTP_USUARIO,
// SMTP_PASSWORD, SMTP_REMITENTE y AVISO_DEMO_A (a quién llega el aviso).

let pool: Pool | undefined;
function db() {
  if (!process.env.DATABASE_URL) return undefined;
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  return pool;
}

type Acceso = { fecha: string; nombre: string; correo: string; empresa: string; ip: string };

async function registrar(a: Acceso) {
  const p = db();
  if (!p) return;
  await p.query(
    "INSERT INTO demo_accesos (fecha, nombre, correo, empresa, ip) VALUES ($1, $2, $3, NULLIF($4, ''), NULLIF($5, ''))",
    [a.fecha, a.nombre, a.correo, a.empresa, a.ip],
  );
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

async function avisar(a: Acceso) {
  const { SMTP_HOST, SMTP_USUARIO, SMTP_PASSWORD, AVISO_DEMO_A } = process.env;
  if (!SMTP_HOST || !SMTP_USUARIO || !SMTP_PASSWORD || !AVISO_DEMO_A) return;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const transporte = nodemailer.createTransport({
    host: SMTP_HOST, port, secure: port === 465,
    auth: { user: SMTP_USUARIO, pass: SMTP_PASSWORD },
  });
  const cuando = new Date(a.fecha).toLocaleString("es-CL", { timeZone: "America/Santiago" });
  const filas: [string, string][] = [["Nombre", a.nombre], ["Correo", a.correo], ["Empresa", a.empresa || "(no informado)"], ["Fecha", cuando]];
  await transporte.sendMail({
    from: `"Meliora · Demo" <${process.env.SMTP_REMITENTE || SMTP_USUARIO}>`,
    to: AVISO_DEMO_A,
    replyTo: a.correo,
    subject: `Nuevo acceso a la demo: ${a.nombre}${a.empresa ? ` (${a.empresa})` : ""}`,
    text: filas.map(([k, v]) => `${k}: ${v}`).join("\n"),
    html: `<table style="font-family:Arial,sans-serif;font-size:14px">${filas
      .map(([k, v]) => `<tr><td style="color:#64748b;padding:3px 12px 3px 0">${k}</td><td><b>${esc(v)}</b></td></tr>`)
      .join("")}</table>`,
  });
}

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; company?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }

  const nombre = String(body.name ?? "").trim().slice(0, 200);
  const correo = String(body.email ?? "").trim().slice(0, 200);
  const empresa = String(body.company ?? "").trim().slice(0, 200);
  if (!nombre || !correo) {
    return NextResponse.json({ ok: false, error: "Falta nombre o correo" }, { status: 400 });
  }

  const acceso: Acceso = {
    fecha: new Date().toISOString(),
    nombre, correo, empresa,
    ip: req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
  };

  const [guardado, aviso] = await Promise.allSettled([registrar(acceso), avisar(acceso)]);
  if (guardado.status === "rejected") console.error("No se pudo registrar el acceso a la demo:", guardado.reason);
  if (aviso.status === "rejected") console.error("No se pudo enviar el aviso de la demo:", aviso.reason);

  return NextResponse.json({ ok: true });
}
