import "server-only";
import { SignJWT, jwtVerify } from "jose";

// Sesión propia de /Privado, separada de la de clientes: esta zona no tiene
// nada que ver con los reportes del portal y no debe compartir cookie.
export const COOKIE_PRIVADO = "privado_session";

function clave() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("Falta la variable de entorno SESSION_SECRET.");
  return new TextEncoder().encode(s);
}

export async function firmar(): Promise<string> {
  return new SignJWT({ zona: "privado" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(clave());
}

export async function verificar(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, clave(), { algorithms: ["HS256"] });
    return payload.zona === "privado";
  } catch {
    return false;
  }
}

/** Comparación en tiempo constante, para no filtrar la clave por el reloj. */
export function claveCorrecta(entrada: string): boolean {
  const esperada = process.env.PRIVADO_PASSWORD;
  if (!esperada) return false;
  const a = new TextEncoder().encode(entrada);
  const b = new TextEncoder().encode(esperada);
  let dif = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) dif |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return dif === 0;
}
