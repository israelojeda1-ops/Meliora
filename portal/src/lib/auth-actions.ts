"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { encrypt, SESSION_COOKIE } from "@/lib/session";
import { getClient } from "@/lib/clients";

export type LoginState = { error: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const clientSlug = formData.get("client")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  const client = getClient(clientSlug);
  if (!client) {
    return { error: "Cliente no encontrado." };
  }

  const expectedPassword = process.env[client.passwordEnv];
  if (!expectedPassword || password !== expectedPassword) {
    return { error: "Contraseña incorrecta." };
  }

  const session = await encrypt({ client: client.slug });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(`/${client.slug}`);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
