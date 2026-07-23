import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt, SESSION_COOKIE } from "@/lib/session";
import { getClient } from "@/lib/clients";
import { parseCSV, toCSV } from "@/lib/csv";

const HEADER = [
  "Fecha",
  "ID Transferencia",
  "Rut Origen/Destino",
  "Banco Origen/Destino",
  "Cuenta Origen/Destino",
  "Valor",
  "Estado",
  "DESCRIPCION",
  "Factura / Boleta",
  "Observacion",
];
const REQUIRED = ["Fecha", "Valor", "Factura / Boleta"];

function normFecha(v: unknown): string {
  const s = String(v ?? "").trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/.exec(s);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return s;
}

function normValor(v: unknown): string {
  const s = String(v ?? "").replace(/[^0-9-]/g, "");
  return s || "0";
}

export async function POST(req: NextRequest) {
  const client = getClient("nuprotec");
  if (!client || !client.repo.bancoLogPath) {
    return NextResponse.json({ ok: false, error: "Cliente no configurado" }, { status: 404 });
  }

  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session || session.client !== client.slug) {
    return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: "GITHUB_TOKEN no configurado" }, { status: 500 });
  }

  let body: { rows?: Record<string, unknown>[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }
  const incoming = Array.isArray(body.rows) ? body.rows : [];
  if (!incoming.length) {
    return NextResponse.json({ ok: false, error: "El archivo no tiene filas" }, { status: 400 });
  }

  const cleanRows: string[][] = [];
  for (const r of incoming) {
    const hasBase = REQUIRED.every((c) => r[c] !== undefined && String(r[c]).trim() !== "");
    if (!hasBase) continue;
    cleanRows.push([
      normFecha(r["Fecha"]),
      String(r["ID Transferencia"] ?? "").trim(),
      String(r["Rut Origen/Destino"] ?? "").trim(),
      String(r["Banco Origen/Destino"] ?? "").trim(),
      String(r["Cuenta Origen/Destino"] ?? "").trim(),
      normValor(r["Valor"]),
      String(r["Estado"] ?? "").trim(),
      String(r["DESCRIPCION"] ?? "").trim(),
      String(r["Factura / Boleta"] ?? "").trim(),
      String(r["Observacion"] ?? "").trim(),
    ]);
  }
  if (!cleanRows.length) {
    return NextResponse.json(
      { ok: false, error: "Ninguna fila tiene las columnas mínimas (Fecha, Valor, Factura / Boleta)" },
      { status: 400 }
    );
  }

  const apiUrl = `https://api.github.com/repos/${client.repo.owner}/${client.repo.name}/contents/${client.repo.bancoLogPath}`;
  const getResp = await fetch(`${apiUrl}?ref=main`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    cache: "no-store",
  });
  if (!getResp.ok) {
    return NextResponse.json(
      { ok: false, error: `No se pudo leer el log actual (${getResp.status})` },
      { status: 502 }
    );
  }
  const getJson = (await getResp.json()) as { content: string; sha: string };
  const currentText = Buffer.from(getJson.content, "base64").toString("utf-8");
  const sha = getJson.sha;

  const existingAll = parseCSV(currentText);
  const existingHeader = existingAll.shift() ?? HEADER;
  const idxOf = (col: string) =>
    existingHeader.findIndex((h) => h.trim().toLowerCase() === col.toLowerCase());
  const reordered = existingAll.map((row) =>
    HEADER.map((col) => {
      const idx = idxOf(col);
      return idx >= 0 ? row[idx] ?? "" : "";
    })
  );

  const seen = new Set(reordered.map((r) => r.join("")));
  let added = 0;
  for (const r of cleanRows) {
    const key = r.join("");
    if (seen.has(key)) continue;
    seen.add(key);
    reordered.push(r);
    added++;
  }

  reordered.sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0));

  const newCsv = toCSV(HEADER, reordered);
  const putResp = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Importa movimientos de banco (manual) — ${added} nuevos`,
      content: Buffer.from(newCsv, "utf-8").toString("base64"),
      sha,
      branch: "main",
    }),
  });
  if (!putResp.ok) {
    const text = await putResp.text();
    return NextResponse.json(
      { ok: false, error: `No se pudo guardar (${putResp.status}): ${text}` },
      { status: 502 }
    );
  }

  let triggeredAt: string | null = null;
  if (client.repo.workflowFile) {
    triggeredAt = new Date().toISOString();
    const dispatchUrl = `https://api.github.com/repos/${client.repo.owner}/${client.repo.name}/actions/workflows/${client.repo.workflowFile}/dispatches`;
    await fetch(dispatchUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: "main" }),
    }).catch(() => null);
  }

  return NextResponse.json({
    ok: true,
    received: incoming.length,
    valid: cleanRows.length,
    added,
    total: reordered.length,
    triggeredAt,
  });
}
