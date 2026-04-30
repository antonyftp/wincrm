import { logout } from "@/app/actions/auth";
import { getSession } from "@/app/lib/session";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
          <span className="text-base font-bold tracking-tight text-slate-900">
            WIN CRM
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
