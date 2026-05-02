"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { planifierAction, completerAction, supprimerAction } from "@/app/actions/tracking";
import { formatDate } from "@/app/lib/format";

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

const TYPE_TONE: Record<Action["type"], string> = {
  appel: "badge info",
  email: "badge accent",
  rdv: "badge warn",
  visite: "badge pos",
  relance: "badge neg",
};

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
      if (result.error) setActionError(result.error);
      else router.refresh();
    });
  }

  async function handleSupprimer(actionId: string) {
    if (!window.confirm("Supprimer cette action ?")) return;
    setActionError(null);
    startTransition(async () => {
      const result = await supprimerAction(actionId);
      if (result.error) setActionError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="card">
      <div className="card-h"><h3>Prochaine action</h3></div>
      <div className="card-b">
        {actionError && (
          <p style={{ marginBottom: 12, fontSize: 12, color: "var(--neg)" }}>{actionError}</p>
        )}

        {next ? (
          <div style={{ background: "var(--accent-soft-2)", border: "1px solid var(--accent-soft)", borderRadius: "var(--r)", padding: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span className={TYPE_TONE[next.type]}><span className="dot" />{TYPE_LABELS[next.type]}</span>
                  {isOverdue(next.date) && <span className="badge neg">En retard</span>}
                </div>
                <p style={{ marginTop: 8, fontSize: 13, color: "var(--text-muted)" }}>{formatDate(next.date)}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <button onClick={() => handleCompleter(next.id)} disabled={isPending} className="btn btn-sm btn-primary">
                  Marquer fait
                </button>
                <button onClick={() => handleSupprimer(next.id)} disabled={isPending} className="btn btn-sm btn-danger">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePlanifier}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select ref={typeRef} defaultValue="appel" className="input" style={{ flex: 1, minWidth: 120 }} disabled={isPending}>
                <option value="appel">Appel</option>
                <option value="email">Email</option>
                <option value="rdv">RDV</option>
                <option value="visite">Visite</option>
                <option value="relance">Relance</option>
              </select>
              <input ref={dateRef} type="datetime-local" required className="input" style={{ flex: 2 }} disabled={isPending} />
              <button type="submit" disabled={isPending} className="btn btn-primary">
                {isPending ? "Planification…" : "Planifier"}
              </button>
            </div>
            {planError && <p style={{ marginTop: 6, fontSize: 12, color: "var(--neg)" }}>{planError}</p>}
          </form>
        )}

        {pending.length > 1 && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <p className="h-eyebrow" style={{ marginBottom: 10 }}>Actions planifiées suivantes ({pending.length - 1})</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {pending.slice(1).map((action) => (
                <div key={action.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--r)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className={TYPE_TONE[action.type]}>{TYPE_LABELS[action.type]}</span>
                    <span className="muted" style={{ fontSize: 12 }}>{formatDate(action.date)}</span>
                    {isOverdue(action.date) && <span className="badge neg">En retard</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => handleCompleter(action.id)} disabled={isPending} className="btn btn-ghost btn-sm">Fait</button>
                    <button onClick={() => handleSupprimer(action.id)} disabled={isPending} className="btn btn-ghost btn-sm" style={{ color: "var(--neg)" }}>Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {done.length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <button onClick={() => setShowDone((v) => !v)} className="btn btn-ghost btn-sm" style={{ padding: "0 8px" }}>
              <span style={{ display: "inline-block", transition: "transform .12s", transform: showDone ? "rotate(90deg)" : "none" }} aria-hidden>▶</span>
              Actions effectuées ({done.length})
            </button>
            {showDone && (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                {done.map((action) => (
                  <div key={action.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--surface-2)", borderRadius: "var(--r)", opacity: 0.7 }}>
                    <span className={TYPE_TONE[action.type]}>{TYPE_LABELS[action.type]}</span>
                    <span className="muted" style={{ fontSize: 12 }}>{formatDate(action.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
