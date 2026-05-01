import { getSession } from "@/app/lib/session";
import { prisma } from "@/lib/prisma";
import { getDashboardData } from "@/app/actions/dashboard";
import { redirect } from "next/navigation";
import DashboardView from "./DashboardView";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [user, data] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { prenom: true, nom: true },
    }),
    getDashboardData(),
  ]);

  return (
    <DashboardView
      data={data}
      userName={`${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim()}
    />
  );
}
