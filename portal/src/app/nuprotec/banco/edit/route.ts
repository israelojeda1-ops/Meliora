import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt, SESSION_COOKIE } from "@/lib/session";
import { getClient } from "@/lib/clients";
import { parseCSV, toCSV } from "@/lib/csv";
import { BANCO_HEADER } from "@/lib/banco-import";

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

  let body: { fecha?: string; idTransferencia?: string; valor?: string; facturaActual?: string; facturaNueva?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }

  const fecha = String(body.fecha ?? "").trim();
  const idTransferencia = String(body.idTransferencia ?? "").trim();
  const valor = String(body.valor ?? "").trim();
  const facturaActual = String(body.facturaActual ?? "").trim();
  const facturaNueva = String(body.facturaNueva ?? "").trim();
  if (!fecha || !valor) {
    return NextResponse.json({ ok: false, error: "Falta fecha o valor para identificar la fila" }, { status: 400 });
  }

  const apiUrl = `https://api.github.com/repos/${client.repo.owner}/${client.repo.name}/contents/${client.repo.bancoLogPath}`;
  const getResp = await fetch(`${apiUrl}?ref=main`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    cache: "no-store",
  });
  if (!getResp.ok) {
    return NextResponse.json({ ok: false, error: `No se pudo leer el log actual (${getResp.status})` }, { status: 502 });
  }
  const getJson = (await getResp.json()) as { content: string; sha: string };
  const currentText = Buffer.from(getJson.content, "base64").toString("utf-8");
  const sha = getJson.sha;

  const all = parseCSV(currentText);
  const header = all.shift() ?? BANCO_HEADER;
  const idxOf = (col: string) => header.findIndex((h) => h.trim().toLowerCase() === col.toLowerCase());
  const iFecha = idxOf("Fecha");
  const iId = idxOf("ID Transferencia");
  const iValor = idxOf("Valor");
  const iFactura = idxOf("Factura / Boleta");

  const matches: number[] = [];
  all.forEach((row, i) => {
    const rowFactura = (row[iFactura] ?? "").trim();
    if (
      (row[iFecha] ?? "").trim() === fecha &&
      (row[iValor] ?? "").trim() === valor &&
      (iId < 0 || (row[iId] ?? "").trim() === idTransferencia) &&
      rowFactura === facturaActual
    ) {
      matches.push(i);
    }
  });

  if (matches.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No se encontró la fila (puede que ya haya cambiado). Recarga la página e intenta de nuevo." },
      { status: 404 }
    );
  }
  if (matches.length > 1) {
    return NextResponse.json(
      { ok: false, error: `Hay ${matches.length} filas idénticas que calzan, no se puede identificar cuál editar.` },
      { status: 409 }
    );
  }

  all[matches[0]][iFactura] = facturaNueva;

  const newCsv = toCSV(BANCO_HEADER, all);
  const putResp = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Edita Factura/Boleta de un movimiento de banco (manual)`,
      content: Buffer.from(newCsv, "utf-8").toString("base64"),
      sha,
      branch: "main",
    }),
  });
  if (!putResp.ok) {
    const text = await putResp.text();
    return NextResponse.json({ ok: false, error: `No se pudo guardar (${putResp.status}): ${text}` }, { status: 502 });
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

  return NextResponse.json({ ok: true, triggeredAt });
}
