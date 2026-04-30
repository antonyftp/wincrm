import { getSession } from "@/app/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { prenom: true, nom: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Bonjour, {user?.prenom} {user?.nom}
      </h1>
      <p className="mt-2 text-slate-500">Tableau de bord — à venir</p>
    </div>
  );
}
