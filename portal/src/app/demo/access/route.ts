import { NextRequest, NextResponse } from "next/server";
import { parseCSV, toCSV } from "@/lib/csv";

const DEMO_LOG_OWNER = "israelojeda1-ops";
const DEMO_LOG_REPO = "Meliora";
const DEMO_LOG_PATH = "data/demo_access_log.csv";
const DEMO_LOG_HEADER = ["Fecha", "Nombre", "Correo", "Empresa", "IP"];

// Deja un registro permanente de quién accedió a la demo (además del aviso
// por correo, que puede perderse si formsubmit falla o si el correo se
// traspapela). Best-effort: si falla, igual dejamos ver la demo.
async function logDemoAccess(row: { fecha: string; nombre: string; correo: string; empresa: string; ip: string }) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return;

  const apiUrl = `https://api.github.com/repos/${DEMO_LOG_OWNER}/${DEMO_LOG_REPO}/contents/${DEMO_LOG_PATH}`;
  const ghHeaders = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" };

  let rows: string[][] = [];
  let sha: string | undefined;
  const getResp = await fetch(`${apiUrl}?ref=main`, { headers: ghHeaders, cache: "no-store" });
  if (getResp.ok) {
    const getJson = (await getResp.json()) as { content: string; sha: string };
    const currentText = Buffer.from(getJson.content, "base64").toString("utf-8");
    const all = parseCSV(currentText);
    all.shift(); // descarta el header existente, usamos siempre DEMO_LOG_HEADER
    rows = all;
    sha = getJson.sha;
  } else if (getResp.status !== 404) {
    throw new Error(`No se pudo leer el log de accesos (${getResp.status})`);
  }

  rows.push([row.fecha, row.nombre, row.correo, row.empresa, row.ip]);
  const newCsv = toCSV(DEMO_LOG_HEADER, rows);

  const putResp = await fetch(apiUrl, {
    method: "PUT",
    headers: { ...ghHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Registra acceso a la demo — ${row.nombre}`,
      content: Buffer.from(newCsv, "utf-8").toString("base64"),
      sha,
      branch: "main",
    }),
  });
  if (!putResp.ok) {
    const text = await putResp.text();
    throw new Error(`No se pudo guardar el log de accesos (${putResp.status}): ${text}`);
  }
}

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

  const fecha = new Date().toISOString();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";

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
        Fecha: fecha,
      }),
    });
  } catch {
    // ignorar errores de red al notificar
  }

  // Registro permanente en el repo — también best-effort.
  try {
    await logDemoAccess({ fecha, nombre: name, correo: email, empresa: company, ip });
  } catch (err) {
    console.error("No se pudo registrar el acceso a la demo:", err);
  }

  return NextResponse.json({ ok: true });
}
