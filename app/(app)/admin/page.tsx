import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/lib/session";
import { updateUserStatut, updateUserRole } from "@/app/actions/admin";
import { Role, UserStatut } from "@prisma/client";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      statut: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const enAttente = users.filter((u) => u.statut === "en_attente");
  const autres = users.filter((u) => u.statut !== "en_attente");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Administration</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestion des utilisateurs et des accès
        </p>
      </div>

      {/* Section 1 — En attente de validation */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            En attente de validation
          </h2>
          {enAttente.length > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              {enAttente.length}
            </span>
          )}
        </div>

        {enAttente.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 px-6 py-8 text-center">
            <p className="text-sm text-slate-400 italic">
              Aucune inscription en attente
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Nom
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Prénom
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Inscription
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enAttente.map((user) => (
                  <EnAttenteRow key={user.id} user={user} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Section 2 — Tous les utilisateurs */}
      <section>
        <h2 className="text-base font-semibold text-slate-900 mb-4">
          Tous les utilisateurs
        </h2>

        {autres.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 px-6 py-8 text-center">
            <p className="text-sm text-slate-400 italic">Aucun utilisateur</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Nom
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Prénom
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Rôle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {autres.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isSelf={user.id === session.userId}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Sous-composants Server ────────────────────────────────────────────────────

type UserRecord = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  statut: UserStatut;
  createdAt: Date;
};

async function EnAttenteRow({ user }: { user: UserRecord }) {
  async function approuver() {
    "use server";
    await updateUserStatut(user.id, "actif");
  }
  async function rejeter() {
    "use server";
    await updateUserStatut(user.id, "refuse");
  }

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3 font-medium text-slate-900">{user.nom}</td>
      <td className="px-4 py-3 text-slate-700">{user.prenom}</td>
      <td className="px-4 py-3 text-slate-600">{user.email}</td>
      <td className="px-4 py-3 text-slate-500 tabular-nums">
        {user.createdAt.toLocaleDateString("fr-FR")}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <form action={approuver}>
            <button
              type="submit"
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Approuver
            </button>
          </form>
          <form action={rejeter}>
            <button
              type="submit"
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
            >
              Rejeter
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}

async function UserRow({
  user,
  isSelf,
}: {
  user: UserRecord;
  isSelf: boolean;
}) {
  async function desactiver() {
    "use server";
    await updateUserStatut(user.id, "inactif");
  }
  async function reactiver() {
    "use server";
    await updateUserStatut(user.id, "actif");
  }
  async function changerRole(formData: FormData) {
    "use server";
    const role = formData.get("role") as Role | null;
    if (!role) return;
    await updateUserRole(user.id, role);
  }

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3 font-medium text-slate-900">
        {user.nom}
        {isSelf && (
          <span className="ml-1.5 text-xs text-slate-400">(vous)</span>
        )}
      </td>
      <td className="px-4 py-3 text-slate-700">{user.prenom}</td>
      <td className="px-4 py-3 text-slate-600">{user.email}</td>
      <td className="px-4 py-3">
        {isSelf ? (
          <RoleBadge role={user.role} />
        ) : (
          <form action={changerRole} className="flex items-center gap-2">
            <select
              name="role"
              defaultValue={user.role}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="commercial">Commercial</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Appliquer
            </button>
          </form>
        )}
      </td>
      <td className="px-4 py-3">
        <StatutBadge statut={user.statut} />
      </td>
      <td className="px-4 py-3">
        {!isSelf && (
          <div className="flex justify-end">
            {user.statut === "actif" && (
              <form action={desactiver}>
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Désactiver
                </button>
              </form>
            )}
            {user.statut === "inactif" && (
              <form action={reactiver}>
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                >
                  Réactiver
                </button>
              </form>
            )}
            {user.statut === "refuse" && (
              <form action={reactiver}>
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                >
                  Réactiver
                </button>
              </form>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function StatutBadge({ statut }: { statut: UserStatut }) {
  const map: Record<UserStatut, { label: string; className: string }> = {
    actif: { label: "Actif", className: "bg-green-100 text-green-800" },
    inactif: { label: "Inactif", className: "bg-slate-100 text-slate-600" },
    refuse: { label: "Refusé", className: "bg-red-100 text-red-700" },
    en_attente: { label: "En attente", className: "bg-amber-100 text-amber-800" },
  };
  const { label, className } = map[statut];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const map: Record<Role, { label: string; className: string }> = {
    admin: { label: "Admin", className: "bg-indigo-100 text-indigo-800" },
    commercial: { label: "Commercial", className: "bg-slate-100 text-slate-700" },
  };
  const { label, className } = map[role];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
