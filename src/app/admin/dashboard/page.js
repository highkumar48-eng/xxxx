import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, verifyToken } from "@/lib/auth";
import { listVideos } from "@/lib/data";
import Dashboard from "@/components/Dashboard";
export const dynamic = "force-dynamic";
export const metadata = { title: "Manage your collection" };
export default async function Page({ searchParams }) {
  if (!(await verifyToken((await cookies()).get(COOKIE)?.value)))
    redirect("/admin");
  const page = Math.max(0, parseInt((await searchParams).page) || 0);
  const data = await listVideos({ admin: true, page });
  return <Dashboard {...data} page={page} />;
}
