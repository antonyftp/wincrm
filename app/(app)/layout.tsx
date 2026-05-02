import { getSession } from "@/app/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "./components/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { prenom: true, nom: true, email: true },
  });

  const isAdmin = session.role === "admin";
  const prenom = dbUser?.prenom ?? "";
  const nom = dbUser?.nom ?? "";
  const email = dbUser?.email ?? "";

  const userName = [prenom, nom].filter(Boolean).join(" ") || email.split("@")[0] || "Utilisateur";
  const userInitials = [prenom[0], nom[0]].filter(Boolean).join("").toUpperCase() || userName.slice(0, 2).toUpperCase();

  return (
    <div className="app">
      <Sidebar
        userName={userName}
        userEmail={email}
        userInitials={userInitials}
        isAdmin={isAdmin}
      />
      <main className="main">
        {children}
      </main>
    </div>
  );
}
