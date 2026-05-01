"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addVisit, deleteVisit } from "@/app/actions/tracking";

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

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-5">
        Biens visités{" "}
        <span className="text-sm font-normal text-slate-400">({visits.length})</span>
      </h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            ref={bienRef}
            type="text"
            placeholder="Nom du bien (ex : Appart 3P rue des Lilas)"
            required
            className="flex-[2] px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isPending}
          />
          <input
            ref={dateRef}
            type="datetime-local"
            required
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {isPending ? "Ajout…" : "Ajouter"}
          </button>
        </div>
        {addError && (
          <p className="mt-1.5 text-xs text-red-600">{addError}</p>
        )}
      </form>

      {sorted.length === 0 ? (
        <p className="text-sm text-slate-400 italic">Aucune visite enregistrée.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((visit) => (
            <div
              key={visit.id}
              className="flex items-center justify-between gap-3 bg-slate-50 rounded-lg px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{visit.bien}</p>
                <p className="text-xs text-slate-400 mt-0.5">{formatDate(visit.dateVisite)}</p>
                {deleteErrors[visit.id] && (
                  <p className="mt-1 text-xs text-red-600">{deleteErrors[visit.id]}</p>
                )}
              </div>
              {canDelete && (
                <button
                  onClick={() => handleDelete(visit.id)}
                  disabled={isPending}
                  className="flex-shrink-0 text-xs text-slate-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                >
                  Supprimer
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
