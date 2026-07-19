import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

export default async function RootPage() {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);

  if (session?.client) {
    redirect(`/${session.client}`);
  }

  redirect("/login");
}
