"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { planifierAction, completerAction, supprimerAction } from "@/app/actions/tracking";

type Action = {
  id: string;
  type: "appel" | "email" | "rdv" | "visite" | "relance";
  date: Date;
  done: boolean;
  createdAt: Date;
};

type Props = {
  leadId: string;
  actions: Action[];
};

const TYPE_LABELS: Record<Action["type"], string> = {
  appel: "Appel",
  email: "Email",
  rdv: "RDV",
  visite: "Visite",
  relance: "Relance",
};

function actionBadgeClass(type: Action["type"]): string {
  const classes: Record<Action["type"], string> = {
    appel: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800",
    email: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800",
    rdv: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800",
    visite: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800",
    relance: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800",
  };
  return classes[type];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isOverdue(date: Date): boolean {
  return new Date(date) < new Date();
}

export default function ActionSection({ leadId, actions }: Props) {
  const router = useRouter();
  const typeRef = useRef<HTMLSelectElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const pending = actions
    .filter((a) => !a.done)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const done = actions
    .filter((a) => a.done)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const next = pending[0] ?? null;

  async function handlePlanifier(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const type = typeRef.current?.value ?? "";
    const dateStr = dateRef.current?.value ?? "";
    if (!type || !dateStr) return;
    setPlanError(null);

    startTransition(async () => {
      const result = await planifierAction(leadId, type, new Date(dateStr).toISOString());
      if (result.error) {
        setPlanError(result.error);
      } else {
        if (typeRef.current) typeRef.current.value = "appel";
        if (dateRef.current) dateRef.current.value = "";
        router.refresh();
      }
    });
  }

  async function handleCompleter(actionId: string) {
    setActionError(null);
    startTransition(async () => {
      const result = await completerAction(actionId);
      if (result.error) {
        setActionError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  async function handleSupprimer(actionId: string) {
    if (!window.confirm("Supprimer cette action ?")) return;
    setActionError(null);
    startTransition(async () => {
      const result = await supprimerAction(actionId);
      if (result.error) {
        setActionError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-5">Prochaine action</h2>

      {actionError && (
        <p className="mb-3 text-xs text-red-600">{actionError}</p>
      )}

      {next ? (
        <div className="bg-slate-50 rounded-lg px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={actionBadgeClass(next.type)}>{TYPE_LABELS[next.type]}</span>
                {isOverdue(next.date) ? (
                  <span className="text-xs font-semibold text-red-600">En retard</span>
                ) : null}
              </div>
              <p className="mt-1.5 text-sm text-slate-600">{formatDate(next.date)}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleCompleter(next.id)}
                disabled={isPending}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Marquer fait
              </button>
              <button
                onClick={() => handleSupprimer(next.id)}
                disabled={isPending}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handlePlanifier}>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              ref={typeRef}
              defaultValue="appel"
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isPending}
            >
              <option value="appel">Appel</option>
              <option value="email">Email</option>
              <option value="rdv">RDV</option>
              <option value="visite">Visite</option>
              <option value="relance">Relance</option>
            </select>
            <input
              ref={dateRef}
              type="datetime-local"
              required
              className="flex-[2] px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isPending}
            />
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {isPending ? "Planification…" : "Planifier"}
            </button>
          </div>
          {planError && (
            <p className="mt-1.5 text-xs text-red-600">{planError}</p>
          )}
        </form>
      )}

      {pending.length > 1 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
            Actions planifiées suivantes ({pending.length - 1})
          </p>
          <div className="space-y-2">
            {pending.slice(1).map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className={actionBadgeClass(action.type)}>{TYPE_LABELS[action.type]}</span>
                  <span className="text-xs text-slate-500">{formatDate(action.date)}</span>
                  {isOverdue(action.date) && (
                    <span className="text-xs font-semibold text-red-600">En retard</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCompleter(action.id)}
                    disabled={isPending}
                    className="text-xs text-green-700 hover:text-green-800 disabled:opacity-50 transition-colors"
                  >
                    Fait
                  </button>
                  <span className="text-slate-200">|</span>
                  <button
                    onClick={() => handleSupprimer(action.id)}
                    disabled={isPending}
                    className="text-xs text-slate-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => setShowDone((v) => !v)}
            className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            <span
              className={`inline-block transition-transform ${showDone ? "rotate-90" : ""}`}
              aria-hidden
            >
              ▶
            </span>
            Actions effectuées ({done.length})
          </button>
          {showDone && (
            <div className="mt-3 space-y-2">
              {done.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 opacity-60"
                >
                  <span className={actionBadgeClass(action.type)}>{TYPE_LABELS[action.type]}</span>
                  <span className="text-xs text-slate-500">{formatDate(action.date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
