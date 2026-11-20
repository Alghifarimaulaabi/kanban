import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireAdminSession() {
  const session = await getServerSession();

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  return session;
}
