import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt, SESSION_COOKIE } from "@/lib/session";
import { getClient } from "@/lib/clients";
import { parseCSV, toCSV } from "@/lib/csv";
import { BANCO_HEADER, buildCleanRow, filaValida, patchBancoInHtml } from "@/lib/banco-import";

export async function POST(req: NextRequest) {
  const client = getClient("nuprotec");
  if (!client || !client.repo || !client.repo.bancoLogPath) {
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
    if (!filaValida(r)) continue;
    cleanRows.push(buildCleanRow(r));
  }
  if (!cleanRows.length) {
    return NextResponse.json(
      { ok: false, error: "Ninguna fila tiene las columnas mínimas (Fecha, Valor)" },
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
  const existingHeader = existingAll.shift() ?? BANCO_HEADER;
  const idxOf = (col: string) =>
    existingHeader.findIndex((h) => h.trim().toLowerCase() === col.toLowerCase());
  const reordered = existingAll.map((row) =>
    BANCO_HEADER.map((col) => {
      const idx = idxOf(col);
      return idx >= 0 ? row[idx] ?? "" : "";
    })
  );

  // La clave de "ya existe" ignora IdMov a propósito: cada fila nueva trae un
  // IdMov recién generado (siempre distinto), así que compararlo haría que
  // reimportar la misma planilla de origen nunca detecte duplicados.
  const iIdMovHeader = BANCO_HEADER.indexOf("IdMov");
  const sinId = (r: string[]) => r.filter((_, i) => i !== iIdMovHeader).join("");
  const seen = new Set(reordered.map(sinId));
  let added = 0;
  for (const r of cleanRows) {
    const key = sinId(r);
    if (seen.has(key)) continue;
    seen.add(key);
    reordered.push(r);
    added++;
  }

  const iFechaHeader = BANCO_HEADER.indexOf("Fecha");
  reordered.sort((a, b) => (a[iFechaHeader] < b[iFechaHeader] ? 1 : a[iFechaHeader] > b[iFechaHeader] ? -1 : 0));

  const newCsv = toCSV(BANCO_HEADER, reordered);
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

  // Actualiza solo el bloque de Banco en el dashboard ya publicado, para que
  // quede al dia de inmediato sin esperar la regeneracion completa. Nunca debe
  // tumbar la respuesta: el CSV ya se guardó, así que un error acá solo se
  // informa, no hace fallar todo el request.
  let patch: { ok: true } | { ok: false; error: string };
  try {
    patch = await patchBancoInHtml({
      token,
      owner: client.repo.owner,
      repo: client.repo.name,
      dashboardPath: client.repo.path,
      csvRows: reordered,
      csvHeader: BANCO_HEADER,
    });
  } catch (err) {
    patch = { ok: false, error: err instanceof Error ? err.message : String(err) };
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
    bancoPatched: patch.ok,
    bancoPatchError: patch.ok ? null : patch.error,
  });
}
