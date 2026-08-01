import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt, SESSION_COOKIE } from "@/lib/session";
import { getClient } from "@/lib/clients";

// Cabeceras que no tiene sentido reenviar tal cual: identifican al portal
// como origen (host) o describen el body que armamos de nuevo nosotros.
const HOP_BY_HOP_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
]);

const HOP_BY_HOP_RESPONSE_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "transfer-encoding",
]);

async function proxy(req: NextRequest) {
  const client = getClient("condores");
  if (!client || !client.proxyTarget) {
    return new Response("Cliente no configurado", { status: 404 });
  }

  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);

  if (!session || session.client !== client.slug) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("client", client.slug);
    return NextResponse.redirect(loginUrl);
  }

  const targetUrl = new URL(
    `${req.nextUrl.pathname}${req.nextUrl.search}`,
    client.proxyTarget
  );

  const headers = new Headers(req.headers);
  for (const key of HOP_BY_HOP_REQUEST_HEADERS) headers.delete(key);

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
    redirect: "manual",
    // @ts-expect-error: requerido por undici para enviar un body streamed
    duplex: "half",
    cache: "no-store",
  });

  const responseHeaders = new Headers(upstream.headers);
  for (const key of HOP_BY_HOP_RESPONSE_HEADERS) responseHeaders.delete(key);

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as HEAD,
};
