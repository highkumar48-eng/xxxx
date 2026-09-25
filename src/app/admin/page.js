import LoginForm from "@/components/LoginForm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, verifyToken } from "@/lib/auth";
export const metadata = { title: "Creator studio" };
export const dynamic = "force-dynamic";
export default async function Admin() {
  if (await verifyToken((await cookies()).get(COOKIE)?.value))
    redirect("/admin/dashboard");
  return <LoginForm />;
}
