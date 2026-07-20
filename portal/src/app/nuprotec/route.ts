import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt, SESSION_COOKIE } from "@/lib/session";
import { getClient } from "@/lib/clients";
import { buildRegenerateWidget } from "@/lib/regenerate-widget";

export async function GET(req: NextRequest) {
  const client = getClient("nuprotec");
  if (!client) {
    return new Response("Cliente no configurado", { status: 404 });
  }

  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);

  if (!session || session.client !== client.slug) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("client", client.slug);
    return NextResponse.redirect(loginUrl);
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return new Response("GITHUB_TOKEN no configurado", { status: 500 });
  }

  const apiUrl = `https://api.github.com/repos/${client.repo.owner}/${client.repo.name}/contents/${client.repo.path}`;

  const upstream = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.raw",
    },
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("No se pudo cargar el dashboard", {
      status: 502,
    });
  }

  let html = await upstream.text();

  if (client.repo.workflowFile) {
    const widget = buildRegenerateWidget(`/${client.slug}`);
    html = html.includes("</body>")
      ? html.replace("</body>", `${widget}</body>`)
      : `${html}${widget}`;
  }

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
