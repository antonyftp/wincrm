"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { LeadEtape } from "@prisma/client";
import { ETAPE_LABELS, ETAT_LABELS, NATURE_LABELS, TYPE_LABELS, etatBadgeClass } from "@/app/lib/labels";
import { ETAPE_ORDER, ETAPE_COLORS } from "@/app/lib/etape-colors";
import { updateLeadEtape } from "@/app/actions/leads";

type LeadWithTitulaire = Prisma.LeadGetPayload<{
  include: { titulaire: { select: { id: true; nom: true; prenom: true } } };
}>;

export default function PipelineView({ leads: initialLeads }: { leads: LeadWithTitulaire[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [dragOverEtape, setDragOverEtape] = useState<LeadEtape | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const byEtape = new Map<LeadEtape, LeadWithTitulaire[]>();
  for (const etape of ETAPE_ORDER) byEtape.set(etape, []);
  for (const lead of leads) byEtape.get(lead.etape)?.push(lead);

  function handleDragStart(e: React.DragEvent, lead: LeadWithTitulaire) {
    e.dataTransfer.setData("leadId", lead.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(lead.id);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverEtape(null);
  }

  function handleDragEnter(e: React.DragEvent, etape: LeadEtape) {
    e.preventDefault();
    setDragOverEtape(etape);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverEtape(null);
    }
  }

  function handleDrop(e: React.DragEvent, targetEtape: LeadEtape) {
    e.preventDefault();
    setDragOverEtape(null);
    const leadId = e.dataTransfer.getData("leadId");
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.etape === targetEtape) return;

    // Optimistic update
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, etape: targetEtape } : l)));

    startTransition(async () => {
      const result = await updateLeadEtape(leadId, targetEtape);
      if (result?.error) {
        // Revert on error
        setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, etape: lead.etape } : l)));
      }
    });
  }

  return (
    <div className="kanban">
      {ETAPE_ORDER.map((etape) => {
        const colLeads = byEtape.get(etape) ?? [];
        const color = ETAPE_COLORS[etape] ?? "var(--accent)";
        const isOver = dragOverEtape === etape;

        return (
          <div
            key={etape}
            className="kcol"
            onDragEnter={(e) => handleDragEnter(e, etape)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, etape)}
          >
            <div className="kcol-h">
              <div className="ttl">
                <span className="colordot" style={{ background: color }} />
                {ETAPE_LABELS[etape]}
              </div>
              <span className="count">{colLeads.length}</span>
            </div>

            <div className={`kcol-body${isOver ? " kcol-over" : ""}`}>
              {colLeads.length === 0 ? (
                <p className="kcol-empty">Aucun lead</p>
              ) : (
                colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead)}
                    onDragEnd={handleDragEnd}
                    onClick={() => router.push(`/leads/${lead.id}`)}
                    className={`kcard${draggingId === lead.id ? " kcard-dragging" : ""}`}
                  >
                    <div className="kc-name">{lead.nom} {lead.prenom}</div>
                    <div className="kc-sub">
                      {TYPE_LABELS[lead.typeLogement]} · {NATURE_LABELS[lead.natureRecherche]}
                    </div>
                    <div className="kc-foot">
                      <span className={etatBadgeClass(lead.etat)}>
                        <span className="dot" />
                        {ETAT_LABELS[lead.etat]}
                      </span>
                      <span className="kc-meta">
                        {lead.titulaire
                          ? `${lead.titulaire.prenom} ${lead.titulaire.nom}`
                          : <span style={{ fontStyle: "italic" }}>Non assigné</span>}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
