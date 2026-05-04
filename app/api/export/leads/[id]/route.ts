import { type NextRequest, NextResponse } from "next/server";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/lib/session";
import {
  ETAT_LABELS,
  ETAPE_LABELS,
  NATURE_LABELS,
  TYPE_LABELS,
  ACTION_TYPE_LABELS,
  SITUATION_LABELS,
} from "@/app/lib/labels";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1e293b",
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
  },
  header: {
    marginBottom: 20,
    borderBottom: "2pt solid #1e3a5f",
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 9,
    color: "#64748b",
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    backgroundColor: "#f1f5f9",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  field: {
    width: "30%",
    marginBottom: 6,
  },
  fieldFull: {
    width: "100%",
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 10,
    color: "#1e293b",
  },
  fieldValueEmpty: {
    fontSize: 10,
    color: "#cbd5e1",
    fontStyle: "italic",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#f8fafc",
    borderLeft: "2pt solid #e2e8f0",
  },
  listItemDone: {
    borderLeft: "2pt solid #86efac",
  },
  listItemText: {
    flex: 1,
    fontSize: 10,
    color: "#1e293b",
  },
  listItemMeta: {
    fontSize: 8,
    color: "#94a3b8",
    marginTop: 1,
  },
  commentItem: {
    marginBottom: 6,
    padding: 8,
    backgroundColor: "#f8fafc",
    borderLeft: "2pt solid #bfdbfe",
  },
  commentAuthor: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#3b82f6",
    marginBottom: 2,
  },
  commentContent: {
    fontSize: 10,
    color: "#1e293b",
  },
  emptyText: {
    fontSize: 9,
    color: "#94a3b8",
    fontStyle: "italic",
    paddingHorizontal: 8,
  },
});

function Field({ label, value }: { label: string; value?: string | null }) {
  return React.createElement(
    View,
    { style: styles.field },
    React.createElement(Text, { style: styles.fieldLabel }, label),
    value
      ? React.createElement(Text, { style: styles.fieldValue }, value)
      : React.createElement(Text, { style: styles.fieldValueEmpty }, "—")
  );
}

function FieldFull({ label, value }: { label: string; value?: string | null }) {
  return React.createElement(
    View,
    { style: styles.fieldFull },
    React.createElement(Text, { style: styles.fieldLabel }, label),
    value
      ? React.createElement(Text, { style: styles.fieldValue }, value)
      : React.createElement(Text, { style: styles.fieldValueEmpty }, "—")
  );
}

type LeadWithRelations = Awaited<ReturnType<typeof fetchLead>>;

async function fetchLead(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      titulaire: { select: { id: true, nom: true, prenom: true } },
      comments: {
        include: { author: { select: { id: true, nom: true, prenom: true } } },
        orderBy: { createdAt: "desc" },
      },
      actions: { orderBy: { date: "asc" } },
      visits: { orderBy: { dateVisite: "desc" } },
    },
  });
}

function formatMontant(value: number): string {
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function buildPdfDocument(lead: NonNullable<LeadWithRelations>) {
  const exportDate = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const genreLabel =
    lead.genre === "M" ? "M." : lead.genre === "Mme" ? "Mme" : "Autre";

  return React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: "A4", style: styles.page },

      React.createElement(
        View,
        { style: styles.header },
        React.createElement(
          Text,
          { style: styles.headerTitle },
          `Fiche Client — ${lead.nom.toUpperCase()} ${lead.prenom}`
        ),
        React.createElement(
          Text,
          { style: styles.headerSubtitle },
          `Exporté le ${exportDate}`
        )
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Identité"),
        React.createElement(
          View,
          { style: styles.grid },
          React.createElement(Field, { label: "Genre", value: genreLabel }),
          React.createElement(Field, { label: "Nom", value: lead.nom }),
          React.createElement(Field, { label: "Prénom", value: lead.prenom }),
          React.createElement(Field, {
            label: "Âge",
            value: lead.age !== null ? `${lead.age} ans` : null,
          }),
          React.createElement(Field, {
            label: "Situation maritale",
            value: lead.situationMaritale
              ? (SITUATION_LABELS[lead.situationMaritale] ?? lead.situationMaritale)
              : null,
          }),
          React.createElement(Field, {
            label: "Héritier",
            value:
              lead.heritier === true
                ? "Oui"
                : lead.heritier === false
                ? "Non"
                : null,
          })
        )
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Contact"),
        React.createElement(
          View,
          { style: styles.grid },
          React.createElement(Field, { label: "Email", value: lead.email }),
          React.createElement(Field, { label: "Téléphone", value: lead.telephone }),
          React.createElement(FieldFull, { label: "Adresse", value: lead.adresse })
        )
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text,
          { style: styles.sectionTitle },
          "Projet immobilier"
        ),
        React.createElement(
          View,
          { style: styles.grid },
          React.createElement(Field, {
            label: "Nature recherche",
            value: NATURE_LABELS[lead.natureRecherche],
          }),
          React.createElement(Field, {
            label: "Type logement",
            value: TYPE_LABELS[lead.typeLogement],
          }),
          React.createElement(Field, {
            label: "Budget achat",
            value: lead.budgetAchat !== null ? `${formatMontant(lead.budgetAchat)} €` : null,
          }),
          React.createElement(Field, {
            label: "Budget location",
            value: lead.budgetLocation !== null ? `${formatMontant(lead.budgetLocation)} €` : null,
          }),
          React.createElement(FieldFull, {
            label: "Critères spécifiques",
            value: lead.criteresSpecifiques,
          })
        )
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Suivi"),
        React.createElement(
          View,
          { style: styles.grid },
          React.createElement(Field, {
            label: "État",
            value: ETAT_LABELS[lead.etat],
          }),
          React.createElement(Field, {
            label: "Étape",
            value: ETAPE_LABELS[lead.etape],
          }),
          React.createElement(Field, {
            label: "Commercial assigné",
            value: lead.titulaire
              ? `${lead.titulaire.prenom} ${lead.titulaire.nom}`
              : "Non assigné",
          }),
          React.createElement(Field, {
            label: "Date de saisie",
            value: new Date(lead.dateSaisie).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          }),
          React.createElement(Field, {
            label: "Dernière modification",
            value: new Date(lead.updatedAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          })
        )
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text,
          { style: styles.sectionTitle },
          "Actions planifiées"
        ),
        lead.actions.length === 0
          ? React.createElement(
              Text,
              { style: styles.emptyText },
              "Aucune action enregistrée."
            )
          : lead.actions.map((action) =>
              React.createElement(
                View,
                {
                  key: action.id,
                  style: [styles.listItem, action.done ? styles.listItemDone : {}],
                },
                React.createElement(
                  View,
                  { style: { flex: 1 } },
                  React.createElement(
                    Text,
                    { style: styles.listItemText },
                    `${ACTION_TYPE_LABELS[action.type]} — ${new Date(action.date).toLocaleDateString("fr-FR")}`
                  ),
                  React.createElement(
                    Text,
                    { style: styles.listItemMeta },
                    action.done ? "Effectuée" : "En attente"
                  )
                )
              )
            )
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Visites"),
        lead.visits.length === 0
          ? React.createElement(
              Text,
              { style: styles.emptyText },
              "Aucune visite enregistrée."
            )
          : lead.visits.map((visit) =>
              React.createElement(
                View,
                { key: visit.id, style: styles.listItem },
                React.createElement(
                  View,
                  { style: { flex: 1 } },
                  React.createElement(
                    Text,
                    { style: styles.listItemText },
                    visit.bien
                  ),
                  React.createElement(
                    Text,
                    { style: styles.listItemMeta },
                    new Date(visit.dateVisite).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  )
                )
              )
            )
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Commentaires"),
        lead.comments.length === 0
          ? React.createElement(
              Text,
              { style: styles.emptyText },
              "Aucun commentaire."
            )
          : lead.comments.map((comment) =>
              React.createElement(
                View,
                { key: comment.id, style: styles.commentItem },
                React.createElement(
                  Text,
                  { style: styles.commentAuthor },
                  comment.author
                    ? `${comment.author.prenom} ${comment.author.nom} — ${new Date(comment.createdAt).toLocaleDateString("fr-FR")}`
                    : `Utilisateur supprimé — ${new Date(comment.createdAt).toLocaleDateString("fr-FR")}`
                ),
                React.createElement(
                  Text,
                  { style: styles.commentContent },
                  comment.content
                )
              )
            )
      )
    )
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  if (session.statut !== "actif") {
    return NextResponse.json({ error: "Compte désactivé." }, { status: 403 });
  }

  try {
    const { id } = await params;

    const lead = await fetchLead(id);
    if (!lead) {
      return NextResponse.json({ error: "Lead introuvable." }, { status: 404 });
    }

    if (
      session.role !== "admin" &&
      lead.titulaireId !== null &&
      lead.titulaireId !== session.userId
    ) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const doc = buildPdfDocument(lead);
    const nodeBuffer = await renderToBuffer(doc);

    const arrayBuffer: ArrayBuffer =
      nodeBuffer instanceof ArrayBuffer
        ? nodeBuffer
        : (nodeBuffer.buffer.slice(
            nodeBuffer.byteOffset,
            nodeBuffer.byteOffset + nodeBuffer.byteLength
          ) as ArrayBuffer);

    const safeName = `${lead.nom}_${lead.prenom}`
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .slice(0, 60);

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="lead_${safeName}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[export/leads/[id]] Unhandled error:", err);
    return NextResponse.json({ error: "Erreur lors de l'export." }, { status: 500 });
  }
}
