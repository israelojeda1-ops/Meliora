import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt, SESSION_COOKIE } from "@/lib/session";
import { getClient } from "@/lib/clients";
import { parseCSV, toCSV } from "@/lib/csv";
import { BANCO_HEADER, locateBancoRow, normFecha, patchBancoInHtml } from "@/lib/banco-import";

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

  let body: {
    original?: { fecha?: string; idTransferencia?: string; valor?: string; factura?: string };
    cambios?: {
      fecha?: string;
      idTransferencia?: string;
      banco?: string;
      rut?: string;
      valor?: string;
      descripcion?: string;
      factura?: string;
    };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }

  const original = {
    fecha: String(body.original?.fecha ?? "").trim(),
    idTransferencia: String(body.original?.idTransferencia ?? "").trim(),
    valor: String(body.original?.valor ?? "").trim(),
    factura: String(body.original?.factura ?? "").trim(),
  };
  if (!original.fecha || !original.valor) {
    return NextResponse.json({ ok: false, error: "Falta fecha o valor para identificar la fila" }, { status: 400 });
  }
  const cambios = body.cambios ?? {};

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

  const located = locateBancoRow(all, header, original);
  if (located.index === undefined) {
    const status = located.error.startsWith("Hay") ? 409 : 404;
    return NextResponse.json({ ok: false, error: located.error }, { status });
  }

  const row = all[located.index];
  const setField = (col: string, value: string | undefined) => {
    if (value === undefined) return;
    const i = idxOf(col);
    if (i >= 0) row[i] = value;
  };
  // El CSV siempre guarda la fecha en ISO (yyyy-mm-dd), aunque el formulario
  // de edición la muestre/reciba como dd-mm-yyyy — normalizar acá evita que
  // quede escrita en el formato de pantalla y rompa el próximo editar/eliminar.
  setField("Fecha", cambios.fecha !== undefined ? normFecha(cambios.fecha) : undefined);
  setField("ID Transferencia", cambios.idTransferencia);
  setField("Banco Origen/Destino", cambios.banco);
  setField("Rut Origen/Destino", cambios.rut);
  setField("Valor", cambios.valor);
  setField("DESCRIPCION", cambios.descripcion);
  setField("Factura / Boleta", cambios.factura);

  const newCsv = toCSV(BANCO_HEADER, all);
  const putResp = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Edita un movimiento de banco (manual)`,
      content: Buffer.from(newCsv, "utf-8").toString("base64"),
      sha,
      branch: "main",
    }),
  });
  if (!putResp.ok) {
    const text = await putResp.text();
    return NextResponse.json({ ok: false, error: `No se pudo guardar (${putResp.status}): ${text}` }, { status: 502 });
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
      csvRows: all,
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
    triggeredAt,
    bancoPatched: patch.ok,
    bancoPatchError: patch.ok ? null : patch.error,
  });
}
