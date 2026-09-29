import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import nodemailer from "nodemailer";

// Formularios del sitio público (melioraadvisory.cl). Antes iban a formsubmit.co:
// un tercero que expone el correo personal en el HTML y que además se cae (500).
// Ahora el envío sale del correo propio, contacto@melioraadvisory.cl, igual que el
// aviso de acceso a la demo.
//
// Los <form> del sitio estático apuntan a la URL absoluta de esta ruta. Si algún
// día Caddy la publica también bajo melioraadvisory.cl:
//   handle /api/formularios* { reverse_proxy 127.0.0.1:3011 }
// pueden volver a usar una ruta relativa.
//
// Las calculadoras mandan el desglose como PDF adjunto (campo `pdf`, en base64,
// generado en el navegador) más tres cifras de resumen (`resumen`). El cuerpo del
// correo lleva las cifras; el detalle va en el archivo.
//
// Variables (/etc/apps/portal.env): DATABASE_URL; SMTP_HOST, SMTP_PORT, SMTP_USUARIO,
// SMTP_PASSWORD, SMTP_REMITENTE; AVISO_FORMULARIOS_A (o AVISO_DEMO_A como respaldo).

const SITIO = "https://melioraadvisory.cl";
const GRACIAS = `${SITIO}/contacto/gracias/`;

const LARGO_CAMPO = 300;
const LARGO_MENSAJE = 5000;
/** El PDF de las calculadoras pesa ~20 KB; en base64, ~27 KB. 400 KB es holgado. */
const LARGO_PDF = 400_000;
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

type Kpi = { etiqueta: string; valor: string; nota?: string };
type Adjunto = { filename: string; content: Buffer; contentType: string };

/**
 * El PDF llega en base64 desde el navegador, así que hay que tratarlo como lo
 * que es: un archivo que alguien externo eligió. Se acota el tamaño y se exige
 * que de verdad empiece como un PDF, para no convertir esto en un reenviador de
 * archivos arbitrarios firmados con el dominio.
 */
function leerPDF(base64: string): Buffer | undefined {
  if (!base64 || base64.length > LARGO_PDF) return undefined;
  if (!/^[A-Za-z0-9+/=\s]+$/.test(base64)) return undefined;
  try {
    const buf = Buffer.from(base64, "base64");
    return buf.length > 8 && buf.subarray(0, 5).toString("latin1") === "%PDF-" ? buf : undefined;
  } catch {
    return undefined;
  }
}

function leerResumen(crudo: string): Kpi[] {
  if (!crudo) return [];
  try {
    const v: unknown = JSON.parse(crudo);
    if (!Array.isArray(v)) return [];
    return v
      .slice(0, 4)
      .filter((k): k is Kpi => !!k && typeof k === "object" && "etiqueta" in k && "valor" in k)
      .map((k) => ({
        etiqueta: String(k.etiqueta).slice(0, 80),
        valor: String(k.valor).slice(0, 40),
        nota: k.nota ? String(k.nota).slice(0, 120) : undefined,
      }));
  } catch {
    return [];
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
async function avisar(e: Envio, resumen: Kpi[], pdf?: Adjunto) {
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
    attachments: pdf ? [pdf] : undefined,
    text: [
      ...resumen.map((k) => `${k.etiqueta}: ${k.valor}`),
      ...filas.map(([k, v]) => `${k}: ${v}`),
      `Fecha: ${cuando}`,
    ].join("\n"),
    html:
      (resumen.length
        ? `<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 0 18px">` +
          `<tr>${resumen.map(tarjeta).join("")}</tr></table>`
        : "") +
      `<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${[
      ...filas,
      ["Fecha", cuando] as [string, string],
    ]
      .map(
        ([k, v]) =>
          `<tr><td style="color:#64748b;padding:4px 14px 4px 0;vertical-align:top">${esc(k)}</td>` +
          `<td style="white-space:pre-wrap"><b>${esc(v)}</b></td></tr>`,
      )
      .join("")}</table>` +
      (pdf ? `<p style="font-family:Arial,sans-serif;font-size:13px;color:#64748b">Va adjunto el mismo PDF que recibió la persona.</p>` : ""),
  });
}

/** Tarjeta de una cifra, del mismo color que la de la pantalla y la del PDF. */
function tarjeta(k: Kpi, i: number) {
  const navy = i === 1;
  const verde = i === 0;
  const fondo = navy ? "#1B2A4A" : verde ? "#EEFAF6" : "#F8FAFC";
  const borde = verde ? "#0E7C66" : navy ? "#1B2A4A" : "#E2E8F0";
  const etiqueta = navy ? "#94AAC7" : verde ? "#0E7C66" : "#94A3B8";
  const valor = navy ? "#FFFFFF" : verde ? "#0E7C66" : "#1B2A4A";
  return (
    `<td style="width:33.3%;padding:0 ${i === 2 ? 0 : 8}px 0 0" valign="top">` +
    `<table width="100%" cellpadding="0" cellspacing="0" style="background:${fondo};border:1px solid ${borde};border-radius:10px">` +
    `<tr><td style="padding:13px 15px;height:92px" valign="top">` +
    `<div style="font-size:10px;font-weight:bold;letter-spacing:.06em;line-height:13px;height:26px;text-transform:uppercase;color:${etiqueta}">${esc(k.etiqueta)}</div>` +
    `<div style="font-size:21px;font-weight:bold;line-height:24px;color:${valor}">${esc(k.valor)}</div>` +
    (k.nota
      ? `<div style="font-size:11px;color:${navy ? "#94AAC7" : "#94A3B8"};padding-top:4px">${esc(k.nota)}</div>`
      : "") +
    `</td></tr></table></td>`
  );
}

/** Encabezado azul con la marca, igual que el del PDF. */
const cabecera =
  `<table width="100%" cellpadding="0" cellspacing="0" style="background:#1B2A4A;border-radius:12px 12px 0 0">` +
  `<tr><td style="padding:22px 24px 20px">` +
  `<div style="font-size:17px;font-weight:bold;color:#fff;letter-spacing:.04em">MELIORA ADVISORY</div>` +
  `<div style="font-size:12px;color:#94AAC7;padding-top:5px">Reportería gerencial en tiempo y forma para tu pyme</div>` +
  `</td></tr></table><div style="height:3px;background:#0E7C66"></div>`;

const pie =
  `<p style="font-size:11px;color:#94A3B8;line-height:1.6;margin:22px 0 0">` +
  `Valores referenciales. No reemplazan una liquidación de sueldo oficial ni un finiquito ratificado ante ministro de fe.</p>` +
  `<p style="margin:14px 0 0"><a href="${SITIO}" style="color:#0E7C66;font-weight:bold;text-decoration:none;font-size:13px">melioraadvisory.cl</a></p>`;

/**
 * Copia para la persona. El detalle completo va en el PDF adjunto, que es el
 * mismo archivo que baja el botón de descarga: el cuerpo del correo solo lleva
 * las cifras que vino a buscar, no un volcado de líneas.
 */
async function enviarCopia(e: Envio, resumen: Kpi[], pdf?: Adjunto, desglose?: string) {
  const t = transporte();
  if (!t || (!resumen.length && !desglose)) return;
  const { titulo } = FORMULARIOS[e.formulario];

  const texto = [
    titulo,
    "",
    ...resumen.map((k) => `${k.etiqueta}: ${k.valor}`),
    "",
    pdf
      ? "El detalle completo, con todas las variables del cálculo, va en el PDF adjunto."
      : (desglose ?? ""),
    "",
    `Valores referenciales. Meliora Advisory — ${SITIO}`,
  ].join("\n");

  await t.sendMail({
    from: remitente(),
    to: e.correo,
    replyTo: process.env.AVISO_FORMULARIOS_A || process.env.AVISO_DEMO_A || undefined,
    subject: `${titulo} — Meliora Advisory`,
    text: texto,
    attachments: pdf ? [pdf] : undefined,
    html:
      `<div style="font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#1e293b;max-width:580px;margin:0 auto">` +
      cabecera +
      `<div style="border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px;padding:24px">` +
      `<p style="font-size:19px;font-weight:bold;color:#1B2A4A;margin:0">${esc(titulo)}</p>` +
      (resumen.length
        ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 0">` +
          `<tr>${resumen.map(tarjeta).join("")}</tr></table>`
        : "") +
      (pdf
        ? `<p style="font-size:14px;line-height:1.65;color:#475569;margin:20px 0 0">` +
          `El desglose completo va en el PDF adjunto: haberes, descuentos, aportes del empleador y ` +
          `las variables con que se calculó, para que el número se pueda revisar línea por línea.</p>`
        : `<pre style="white-space:pre-wrap;font-family:inherit;font-size:13px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:18px 0 0">${esc(desglose ?? "")}</pre>`) +
      `<p style="font-size:14px;line-height:1.65;color:#475569;margin:14px 0 0">` +
      `Si quieres, revisamos tu caso concreto: escribe a este correo y te respondemos.</p>` +
      pie +
      `</div></div>`,
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
  const pdfBruto = campos.pdf ?? "";
  const bytes = leerPDF(pdfBruto.trim());
  const pdf: Adjunto | undefined = bytes
    ? {
        filename: (campos.pdf_nombre || "desglose-meliora.pdf").replace(/[^\w.-]/g, "").slice(0, 60),
        content: bytes,
        contentType: "application/pdf",
      }
    : undefined;
  const resumen = leerResumen((campos.resumen ?? "").slice(0, LARGO_MENSAJE));

  // El PDF y el resumen no son datos del lead: no van en la tabla ni en la lista
  // del aviso, van como adjunto y como tarjetas.
  const datos: Record<string, string> = {};
  for (const [k, v] of Object.entries(campos)) {
    if (k.startsWith("_") || k === "formulario") continue;
    if (k === "pdf" || k === "pdf_nombre" || k === "resumen" || k === "titulo") continue;
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

  // El diagnóstico no manda PDF: manda puntaje y respuestas, y ahí el cuerpo del
  // correo sigue siendo el texto. `datos.desglose` es el respaldo para una página
  // vieja en caché que todavía mande el desglose y no el archivo.
  const desglose =
    datos.desglose ||
    (datos.puntaje ? [`Resultado: ${datos.puntaje}`, datos.respuestas].filter(Boolean).join("\n\n") : "");

  const tareas = await Promise.allSettled([
    registrar(envio),
    avisar(envio, resumen, pdf),
    resumen.length || desglose
      ? enviarCopia(envio, resumen, pdf, desglose)
      : Promise.resolve(),
  ]);
  const nombres = ["registrar el envío", "avisar por correo", "enviar la copia"];
  tareas.forEach((t, i) => {
    if (t.status === "rejected") console.error(`No se pudo ${nombres[i]}:`, t.reason);
  });

  return responder(200, { ok: true }, next);
}
