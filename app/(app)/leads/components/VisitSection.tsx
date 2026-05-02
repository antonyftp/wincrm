"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addVisit, deleteVisit } from "@/app/actions/tracking";
import { formatDate } from "@/app/lib/format";

type Visit = {
  id: string;
  bien: string;
  dateVisite: Date;
  createdAt: Date;
};

type Props = {
  leadId: string;
  visits: Visit[];
  canDelete: boolean;
};

export default function VisitSection({ leadId, visits, canDelete }: Props) {
  const router = useRouter();
  const bienRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const sorted = [...visits].sort(
    (a, b) => new Date(b.dateVisite).getTime() - new Date(a.dateVisite).getTime()
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const bien = bienRef.current?.value ?? "";
    const dateStr = dateRef.current?.value ?? "";
    if (!bien.trim() || !dateStr) return;
    setAddError(null);
    startTransition(async () => {
      const result = await addVisit(leadId, bien, new Date(dateStr).toISOString());
      if (result.error) {
        setAddError(result.error);
      } else {
        if (bienRef.current) bienRef.current.value = "";
        if (dateRef.current) dateRef.current.value = "";
        router.refresh();
      }
    });
  }

  async function handleDelete(visitId: string) {
    if (!window.confirm("Supprimer cette visite ?")) return;
    setDeleteErrors((prev) => ({ ...prev, [visitId]: "" }));
    startTransition(async () => {
      const result = await deleteVisit(visitId);
      if (result.error) {
        setDeleteErrors((prev) => ({ ...prev, [visitId]: result.error! }));
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="card">
      <div className="card-h">
        <h3>Biens visités</h3>
        <span className="meta">{visits.length}</span>
      </div>
      <div className="card-b">
        <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              ref={bienRef}
              type="text"
              placeholder="Nom du bien (ex : Appart 3P rue des Lilas)"
              required
              className="input"
              style={{ flex: 2, minWidth: 200 }}
              disabled={isPending}
            />
            <input
              ref={dateRef}
              type="datetime-local"
              required
              className="input"
              style={{ flex: 1, minWidth: 160 }}
              disabled={isPending}
            />
            <button type="submit" disabled={isPending} className="btn btn-primary">
              {isPending ? "Ajout…" : "Ajouter"}
            </button>
          </div>
          {addError && <p style={{ marginTop: 6, fontSize: 12, color: "var(--neg)" }}>{addError}</p>}
        </form>

        {sorted.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-faint)", fontStyle: "italic" }}>
            Aucune visite enregistrée.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sorted.map((visit) => (
              <div key={visit.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "var(--surface-2)", borderRadius: "var(--r)", padding: "10px 14px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="bold" style={{ margin: 0, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{visit.bien}</p>
                  <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>{formatDate(visit.dateVisite)}</p>
                  {deleteErrors[visit.id] && (
                    <p style={{ marginTop: 2, fontSize: 11, color: "var(--neg)" }}>{deleteErrors[visit.id]}</p>
                  )}
                </div>
                {canDelete && (
                  <button onClick={() => handleDelete(visit.id)} disabled={isPending} className="btn btn-ghost btn-sm" style={{ color: "var(--neg)", flexShrink: 0 }}>
                    Supprimer
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
