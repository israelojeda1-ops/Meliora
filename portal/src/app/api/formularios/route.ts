import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import nodemailer from "nodemailer";

// Formularios del sitio público (melioraadvisory.cl). Antes iban a formsubmit.co:
// un tercero que expone el correo personal en el HTML y que además se cae (500).
// Ahora el envío sale del correo propio, contacto@melioraadvisory.cl, igual que el
// aviso de acceso a la demo.
//
// Caddy publica esta ruta bajo el dominio del sitio estático:
//   handle /api/formularios* { reverse_proxy 127.0.0.1:3011 }
// así los <form> envían al mismo origen y siguen funcionando sin JavaScript.
//
// Variables (/etc/apps/portal.env): DATABASE_URL; SMTP_HOST, SMTP_PORT, SMTP_USUARIO,
// SMTP_PASSWORD, SMTP_REMITENTE; AVISO_FORMULARIOS_A (o AVISO_DEMO_A como respaldo).

const SITIO = "https://melioraadvisory.cl";
const GRACIAS = `${SITIO}/contacto/gracias/`;

const LARGO_CAMPO = 300;
const LARGO_MENSAJE = 5000;
const LIMITE_ENVIOS = 5;
const VENTANA_MINUTOS = 10;

type Tipo =
  | "contacto"
  | "diagnostico"
  | "remuneraciones"
  | "honorarios"
  | "finiquito"
  | "liquido";

const FORMULARIOS: Record<Tipo, { asunto: string; titulo: string }> = {
  contacto: { asunto: "Nueva consulta", titulo: "Consulta desde el sitio" },
  diagnostico: { asunto: "Diagnóstico financiero completado", titulo: "Tu diagnóstico financiero" },
  remuneraciones: { asunto: "Calculadora salarial", titulo: "Tu cálculo de remuneraciones" },
  honorarios: { asunto: "Calculadora de honorarios", titulo: "Tu cálculo de honorarios" },
  finiquito: { asunto: "Calculadora de finiquito", titulo: "Tu cálculo de finiquito" },
  liquido: { asunto: "Calculadora desde el líquido", titulo: "Tu cálculo desde el líquido" },
};

const esTipo = (v: string): v is Tipo => v in FORMULARIOS;

let pool: Pool | undefined;
function db() {
  if (!process.env.DATABASE_URL) return undefined;
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  return pool;
}

let tablaLista: Promise<void> | undefined;
function prepararTabla(p: Pool) {
  tablaLista ??= p
    .query(
      `CREATE TABLE IF NOT EXISTS formularios (
         id         bigserial PRIMARY KEY,
         fecha      timestamptz NOT NULL DEFAULT now(),
         formulario text NOT NULL,
         correo     text NOT NULL,
         nombre     text,
         datos      jsonb NOT NULL DEFAULT '{}'::jsonb,
         ip         text
       )`,
    )
    .then(() => undefined);
  return tablaLista;
}

type Envio = {
  formulario: Tipo;
  correo: string;
  nombre: string;
  datos: Record<string, string>;
  ip: string;
};

async function registrar(e: Envio) {
  const p = db();
  if (!p) return;
  await prepararTabla(p);
  await p.query(
    `INSERT INTO formularios (formulario, correo, nombre, datos, ip)
     VALUES ($1, $2, NULLIF($3, ''), $4::jsonb, NULLIF($5, ''))`,
    [e.formulario, e.correo, e.nombre, JSON.stringify(e.datos), e.ip],
  );
}

// Límite por IP. En la base es el que cuenta; el de memoria cubre el rato en que
// la base no esté disponible, para no dejar el envío de correo abierto de par en par.
const enMemoria = new Map<string, number[]>();

function excedeEnMemoria(ip: string) {
  if (!ip) return false;
  const desde = Date.now() - VENTANA_MINUTOS * 60_000;
  const previos = (enMemoria.get(ip) ?? []).filter((t) => t > desde);
  previos.push(Date.now());
  enMemoria.set(ip, previos);
  if (enMemoria.size > 5000) enMemoria.clear();
  return previos.length > LIMITE_ENVIOS;
}

async function excedeLimite(ip: string) {
  if (excedeEnMemoria(ip)) return true;
  const p = db();
  if (!p || !ip) return false;
  try {
    await prepararTabla(p);
    const { rows } = await p.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM formularios
       WHERE ip = $1 AND fecha > now() - ($2 || ' minutes')::interval`,
      [ip, String(VENTANA_MINUTOS)],
    );
    return Number(rows[0]?.n ?? 0) >= LIMITE_ENVIOS;
  } catch (error) {
    console.error("No se pudo revisar el límite de envíos:", error);
    return false;
  }
}

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function transporte() {
  const { SMTP_HOST, SMTP_USUARIO, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USUARIO || !SMTP_PASSWORD) return undefined;
  const port = Number(process.env.SMTP_PORT ?? 465);
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USUARIO, pass: SMTP_PASSWORD },
  });
}

const remitente = () =>
  `"Meliora Advisory" <${process.env.SMTP_REMITENTE || process.env.SMTP_USUARIO}>`;

/** Aviso a Israel con todo lo que mandó la persona. */
async function avisar(e: Envio) {
  const t = transporte();
  const destino = process.env.AVISO_FORMULARIOS_A || process.env.AVISO_DEMO_A;
  if (!t || !destino) return;

  const filas = Object.entries(e.datos).filter(([, v]) => v.trim() !== "");
  const cuando = new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" });

  await t.sendMail({
    from: remitente(),
    to: destino,
    replyTo: e.correo,
    subject: `${FORMULARIOS[e.formulario].asunto}: ${e.nombre || e.correo}`,
    text: [...filas.map(([k, v]) => `${k}: ${v}`), `Fecha: ${cuando}`].join("\n"),
    html: `<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${[
      ...filas,
      ["Fecha", cuando] as [string, string],
    ]
      .map(
        ([k, v]) =>
          `<tr><td style="color:#64748b;padding:4px 14px 4px 0;vertical-align:top">${esc(k)}</td>` +
          `<td style="white-space:pre-wrap"><b>${esc(v)}</b></td></tr>`,
      )
      .join("")}</table>`,
  });
}

/**
 * Copia para la persona. Las calculadoras prometen «recibe este desglose en tu
 * correo» y con formsubmit nunca llegaba nada: el aviso iba solo a Israel.
 */
async function enviarCopia(e: Envio, desglose: string) {
  const t = transporte();
  if (!t || !desglose) return;
  const { titulo } = FORMULARIOS[e.formulario];

  await t.sendMail({
    from: remitente(),
    to: e.correo,
    replyTo: process.env.AVISO_FORMULARIOS_A || process.env.AVISO_DEMO_A || undefined,
    subject: `${titulo} — Meliora Advisory`,
    text: `${titulo}\n\n${desglose}\n\nValores referenciales. No reemplazan una liquidación oficial.\n\nMeliora Advisory — ${SITIO}`,
    html:
      `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1e293b;max-width:560px">` +
      `<p style="font-size:18px;font-weight:bold;color:#1B2A4A;margin:0 0 16px">${esc(titulo)}</p>` +
      `<pre style="white-space:pre-wrap;font-family:inherit;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:0">${esc(desglose)}</pre>` +
      `<p style="color:#64748b;font-size:12px;margin:16px 0 0">Valores referenciales. No reemplazan una liquidación oficial.</p>` +
      `<p style="margin:18px 0 0"><a href="${SITIO}" style="color:#0E7C66;font-weight:bold;text-decoration:none">Meliora Advisory</a></p>` +
      `</div>`,
  });
}

/** Solo se redirige de vuelta al propio sitio: _next viene del navegador. */
function destinoSeguro(next: string) {
  if (!next) return GRACIAS;
  try {
    const url = new URL(next, SITIO);
    return url.origin === SITIO ? url.toString() : GRACIAS;
  } catch {
    return GRACIAS;
  }
}

async function leerCampos(req: NextRequest): Promise<{ campos: Record<string, string>; json: boolean }> {
  const tipo = req.headers.get("content-type") ?? "";
  if (tipo.includes("application/json")) {
    const cuerpo = (await req.json()) as Record<string, unknown>;
    const campos: Record<string, string> = {};
    for (const [k, v] of Object.entries(cuerpo)) campos[k] = String(v ?? "");
    return { campos, json: true };
  }
  const form = await req.formData();
  const campos: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") campos[k] = v;
  return { campos, json: false };
}

export async function POST(req: NextRequest) {
  let campos: Record<string, string>;
  let json: boolean;
  try {
    ({ campos, json } = await leerCampos(req));
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }

  const responder = (estado: number, cuerpo: Record<string, unknown>, next: string) =>
    json
      ? NextResponse.json(cuerpo, { status: estado })
      : NextResponse.redirect(destinoSeguro(next), 303);

  const next = campos._next ?? "";

  // Trampa para robots: el campo está oculto, una persona nunca lo llena.
  if ((campos._honey ?? "").trim() !== "") {
    return responder(200, { ok: true }, next);
  }

  const crudo = (campos.formulario ?? "").trim();
  if (!esTipo(crudo)) {
    return responder(400, { ok: false, error: "Formulario desconocido" }, next);
  }
  const formulario: Tipo = crudo;

  const correo = (campos.email ?? "").trim().slice(0, LARGO_CAMPO);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) {
    return responder(400, { ok: false, error: "Correo inválido" }, next);
  }

  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "";

  if (await excedeLimite(ip)) {
    return responder(429, { ok: false, error: "Demasiados envíos, intenta más tarde" }, next);
  }

  // Todo lo demás se guarda tal cual, recortado. Los campos de control no son datos.
  const datos: Record<string, string> = {};
  for (const [k, v] of Object.entries(campos)) {
    if (k.startsWith("_") || k === "formulario") continue;
    const largo = k === "desglose" || k === "respuestas" || k === "message" ? LARGO_MENSAJE : LARGO_CAMPO;
    datos[k] = v.trim().slice(0, largo);
  }

  const envio: Envio = {
    formulario,
    correo,
    nombre: (campos.name ?? "").trim().slice(0, LARGO_CAMPO),
    datos,
    ip,
  };

  // El diagnóstico no manda un «desglose», manda puntaje y respuestas.
  const desglose =
    datos.desglose ||
    (datos.puntaje ? [`Resultado: ${datos.puntaje}`, datos.respuestas].filter(Boolean).join("\n\n") : "");

  const tareas = await Promise.allSettled([
    registrar(envio),
    avisar(envio),
    desglose ? enviarCopia(envio, desglose) : Promise.resolve(),
  ]);
  const nombres = ["registrar el envío", "avisar por correo", "enviar la copia"];
  tareas.forEach((t, i) => {
    if (t.status === "rejected") console.error(`No se pudo ${nombres[i]}:`, t.reason);
  });

  return responder(200, { ok: true }, next);
}
