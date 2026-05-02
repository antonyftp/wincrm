import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/lib/session";
import { updateUserStatut, updateUserRole } from "@/app/actions/admin";
import { Role, UserStatut } from "@prisma/client";
import Topbar from "../components/Topbar";

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
    <>
      <Topbar
        title="Administration"
        crumbs="Gestion des utilisateurs et des accès"
      />

      <div className="content">
        {/* En attente */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>En attente de validation</h2>
            {enAttente.length > 0 && <span className="badge warn">{enAttente.length}</span>}
          </div>

          {enAttente.length === 0 ? (
            <div className="empty card">
              <p style={{ margin: 0, fontStyle: "italic" }}>Aucune inscription en attente</p>
            </div>
          ) : (
            <div className="card">
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Email</th>
                      <th>Inscription</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enAttente.map((user) => (
                      <EnAttenteRow key={user.id} user={user} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Tous les utilisateurs */}
        <div>
          <h2 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 600 }}>Tous les utilisateurs</h2>

          {autres.length === 0 ? (
            <div className="empty card">
              <p style={{ margin: 0, fontStyle: "italic" }}>Aucun utilisateur</p>
            </div>
          ) : (
            <div className="card">
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Statut</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {autres.map((user) => (
                      <UserRow key={user.id} user={user} isSelf={user.id === session.userId} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

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
    <tr>
      <td className="bold">{user.nom}</td>
      <td>{user.prenom}</td>
      <td className="muted">{user.email}</td>
      <td className="muted">{user.createdAt.toLocaleDateString("fr-FR")}</td>
      <td>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
          <form action={approuver}>
            <button type="submit" className="btn btn-primary btn-sm">Approuver</button>
          </form>
          <form action={rejeter}>
            <button type="submit" className="btn btn-danger btn-sm">Rejeter</button>
          </form>
        </div>
      </td>
    </tr>
  );
}

async function UserRow({ user, isSelf }: { user: UserRecord; isSelf: boolean }) {
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
    <tr>
      <td className="bold">
        {user.nom}
        {isSelf && <span className="muted" style={{ fontSize: 11, marginLeft: 6 }}>(vous)</span>}
      </td>
      <td>{user.prenom}</td>
      <td className="muted">{user.email}</td>
      <td>
        {isSelf ? (
          <RoleBadge role={user.role} />
        ) : (
          <form action={changerRole} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select name="role" defaultValue={user.role} className="input btn-sm" style={{ width: "auto", height: 28, fontSize: 12 }}>
              <option value="commercial">Commercial</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="btn btn-sm btn-ghost" style={{ fontSize: 11 }}>OK</button>
          </form>
        )}
      </td>
      <td><StatutBadge statut={user.statut} /></td>
      <td>
        {!isSelf && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            {user.statut === "actif" && (
              <form action={desactiver}>
                <button type="submit" className="btn btn-sm">Désactiver</button>
              </form>
            )}
            {(user.statut === "inactif" || user.statut === "refuse") && (
              <form action={reactiver}>
                <button type="submit" className="btn btn-sm btn-primary">Réactiver</button>
              </form>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

function StatutBadge({ statut }: { statut: UserStatut }) {
  const map: Record<UserStatut, { label: string; cls: string }> = {
    actif: { label: "Actif", cls: "badge pos" },
    inactif: { label: "Inactif", cls: "badge" },
    refuse: { label: "Refusé", cls: "badge neg" },
    en_attente: { label: "En attente", cls: "badge warn" },
  };
  const { label, cls } = map[statut];
  return <span className={cls}><span className="dot" />{label}</span>;
}

function RoleBadge({ role }: { role: Role }) {
  const map: Record<Role, { label: string; cls: string }> = {
    admin: { label: "Admin", cls: "badge accent" },
    commercial: { label: "Commercial", cls: "badge" },
  };
  const { label, cls } = map[role];
  return <span className={cls}>{label}</span>;
}
