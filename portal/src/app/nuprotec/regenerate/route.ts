import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt, SESSION_COOKIE } from "@/lib/session";
import { getClient } from "@/lib/clients";

export async function POST(req: NextRequest) {
  void req;
  const client = getClient("nuprotec");
  if (!client || !client.repo.workflowFile) {
    return NextResponse.json(
      { ok: false, error: "Cliente no configurado para regenerar" },
      { status: 404 }
    );
  }

  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session || session.client !== client.slug) {
    return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "GITHUB_TOKEN no configurado" },
      { status: 500 }
    );
  }

  const triggeredAt = new Date().toISOString();
  const dispatchUrl = `https://api.github.com/repos/${client.repo.owner}/${client.repo.name}/actions/workflows/${client.repo.workflowFile}/dispatches`;

  const upstream = await fetch(dispatchUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref: "main" }),
  });

  if (upstream.status !== 204) {
    const text = await upstream.text();
    return NextResponse.json(
      { ok: false, error: `GitHub respondió ${upstream.status}: ${text}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, triggeredAt });
}
