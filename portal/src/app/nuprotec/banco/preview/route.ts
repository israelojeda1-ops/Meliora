import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt, SESSION_COOKIE } from "@/lib/session";
import { getClient } from "@/lib/clients";
import { parseCSV } from "@/lib/csv";
import {
  BANCO_HEADER,
  buildCleanRow,
  buildRutToArqueo,
  esAgregadorPago,
  extractJsonLiteral,
  filaValida,
  normValorNum,
  sugerirFactura,
} from "@/lib/banco-import";

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

  const ghHeaders = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" };

  // 1) Dashboard actual, para sacar Arqueo y sugerir facturas por RUT+monto.
  const dashUrl = `https://api.github.com/repos/${client.repo.owner}/${client.repo.name}/contents/${client.repo.path}`;
  const dashResp = await fetch(`${dashUrl}?ref=main`, {
    headers: { ...ghHeaders, Accept: "application/vnd.github.raw" },
    cache: "no-store",
  });
  let rutToArqueo = new Map<string, { folio: string; monto: number }[]>();
  if (dashResp.ok) {
    const html = await dashResp.text();
    const arqueo = extractJsonLiteral(html, "ARQUEO");
    if (arqueo && typeof arqueo === "object") {
      rutToArqueo = buildRutToArqueo(arqueo as Record<string, { folio?: string; rut?: string; monto?: number }[]>);
    }
  }

  // 2) Log actual, para marcar cuáles filas ya existen (informativo — el
  // guardado real vuelve a chequear esto con los valores definitivos).
  const logUrl = `https://api.github.com/repos/${client.repo.owner}/${client.repo.name}/contents/${client.repo.bancoLogPath}`;
  const logResp = await fetch(`${logUrl}?ref=main`, { headers: ghHeaders, cache: "no-store" });
  let existentes = new Set<string>();
  if (logResp.ok) {
    const logJson = (await logResp.json()) as { content: string };
    const currentText = Buffer.from(logJson.content, "base64").toString("utf-8");
    const existingAll = parseCSV(currentText);
    const existingHeader = existingAll.shift() ?? BANCO_HEADER;
    const idxOf = (col: string) => existingHeader.findIndex((h) => h.trim().toLowerCase() === col.toLowerCase());
    existentes = new Set(
      existingAll.map((row) => BANCO_HEADER.map((col) => row[idxOf(col)] ?? "").join(""))
    );
  }

  const items = incoming.map((r, idx) => {
    const valida = filaValida(r);
    const valorNum = normValorNum(r["Valor"]);
    const facturaOriginal = String(r["Factura / Boleta"] ?? "").trim();
    const agregador = esAgregadorPago(r["Banco Origen/Destino"]);
    const facturaSugerida =
      !facturaOriginal && !agregador ? sugerirFactura(rutToArqueo, r["Rut Origen/Destino"], valorNum) : "";
    const cleanRow = valida ? buildCleanRow(r) : null;
    const yaExiste = !!cleanRow && existentes.has(cleanRow.join(""));

    return {
      idx,
      fecha: String(r["Fecha"] ?? ""),
      rut: String(r["Rut Origen/Destino"] ?? ""),
      banco: String(r["Banco Origen/Destino"] ?? ""),
      valor: valorNum,
      descripcion: String(r["DESCRIPCION"] ?? ""),
      facturaOriginal,
      facturaSugerida,
      esAgregadorPago: agregador,
      valida,
      yaExiste,
    };
  });

  return NextResponse.json({ ok: true, items });
}
