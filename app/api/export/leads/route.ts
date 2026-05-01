import { type NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/lib/session";
import {
  ETAT_LABELS,
  ETAPE_LABELS,
  NATURE_LABELS,
  TYPE_LABELS,
  SITUATION_LABELS,
} from "@/app/lib/labels";
import {
  LeadEtat,
  LeadEtape,
  NatureRecherche,
  TypeLogement,
  type Prisma,
} from "@prisma/client";

const LEAD_ETATS = new Set<string>([
  "nouveau", "reponse_envoyee", "contacte_telephone", "non_valide",
  "qualifie", "visite_effectuee", "offre_en_cours", "offre_acceptee",
]);
const LEAD_ETAPES = new Set<string>([
  "nouveau_contact", "en_attente_qualification", "qualifie", "biens_proposes",
  "visite_programmee", "visite_effectuee", "relance_apres_visite",
  "offre_negociation", "conclu", "perdu",
]);
const NATURES_RECHERCHE = new Set<string>(["achat", "location", "investissement"]);
const TYPES_LOGEMENT = new Set<string>(["appartement", "maison", "studio", "t2", "t3", "t4", "autre"]);

const EXPORT_ROW_LIMIT = 10_000;

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  if (session.statut !== "actif") {
    return NextResponse.json({ error: "Compte désactivé." }, { status: 403 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q") ?? undefined;
    const commercial = searchParams.get("commercial") ?? undefined;
    const etat = searchParams.get("etat") ?? undefined;
    const etape = searchParams.get("etape") ?? undefined;
    const typeLogement = searchParams.get("typeLogement") ?? undefined;
    const natureRecherche = searchParams.get("natureRecherche") ?? undefined;
    const sortBy = searchParams.get("sortBy") ?? undefined;
    const sortDirRaw = searchParams.get("sortDir");
    const sortDir = sortDirRaw === "asc" ? "asc" : "desc";

    const conditions: Prisma.LeadWhereInput[] = [];

    if (session.role !== "admin") {
      conditions.push({ OR: [{ titulaireId: session.userId }, { titulaireId: null }] });
    }

    if (q) {
      const safeQ = q.trim().slice(0, 200);
      conditions.push({
        OR: [
          { nom: { contains: safeQ, mode: "insensitive" } },
          { prenom: { contains: safeQ, mode: "insensitive" } },
          { telephone: { contains: safeQ } },
          { email: { contains: safeQ, mode: "insensitive" } },
        ],
      });
    }

    // Non-admins may only filter by their own commercial ID
    if (commercial) {
      if (session.role === "admin" || commercial === session.userId) {
        conditions.push({ titulaireId: commercial });
      }
    }

    if (etat && LEAD_ETATS.has(etat)) conditions.push({ etat: etat as LeadEtat });
    if (etape && LEAD_ETAPES.has(etape)) conditions.push({ etape: etape as LeadEtape });
    if (typeLogement && TYPES_LOGEMENT.has(typeLogement)) conditions.push({ typeLogement: typeLogement as TypeLogement });
    if (natureRecherche && NATURES_RECHERCHE.has(natureRecherche)) conditions.push({ natureRecherche: natureRecherche as NatureRecherche });

    const SORT_FIELDS: Record<string, object> = {
      dateSaisie: { dateSaisie: sortDir },
      nom: { nom: sortDir },
      etat: { etat: sortDir },
      etape: { etape: sortDir },
      typeLogement: { typeLogement: sortDir },
      natureRecherche: { natureRecherche: sortDir },
    };
    const orderBy = sortBy && SORT_FIELDS[sortBy] ? SORT_FIELDS[sortBy] : { dateSaisie: sortDir };

    const leads = await prisma.lead.findMany({
      where: conditions.length > 0 ? { AND: conditions } : {},
      include: { titulaire: { select: { id: true, nom: true, prenom: true } } },
      orderBy,
      take: EXPORT_ROW_LIMIT,
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Leads");

    sheet.columns = [
      { header: "Nom", key: "nom", width: 20 },
      { header: "Prénom", key: "prenom", width: 20 },
      { header: "Genre", key: "genre", width: 8 },
      { header: "Âge", key: "age", width: 8 },
      { header: "Email", key: "email", width: 28 },
      { header: "Téléphone", key: "telephone", width: 16 },
      { header: "Adresse", key: "adresse", width: 30 },
      { header: "Situation maritale", key: "situationMaritale", width: 20 },
      { header: "Héritier", key: "heritier", width: 10 },
      { header: "Nature recherche", key: "natureRecherche", width: 20 },
      { header: "Type logement", key: "typeLogement", width: 16 },
      { header: "Budget min (€)", key: "budgetMin", width: 16 },
      { header: "Budget max (€)", key: "budgetMax", width: 16 },
      { header: "Critères spécifiques", key: "criteresSpecifiques", width: 35 },
      { header: "État", key: "etat", width: 22 },
      { header: "Étape", key: "etape", width: 26 },
      { header: "Commercial", key: "commercial", width: 24 },
      { header: "Date de saisie", key: "dateSaisie", width: 18 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
    headerRow.height = 20;

    sheet.views = [{ state: "frozen", ySplit: 1 }];

    for (const lead of leads) {
      sheet.addRow({
        nom: lead.nom,
        prenom: lead.prenom,
        genre: lead.genre,
        age: lead.age ?? "",
        email: lead.email ?? "",
        telephone: lead.telephone ?? "",
        adresse: lead.adresse ?? "",
        situationMaritale: lead.situationMaritale
          ? (SITUATION_LABELS[lead.situationMaritale] ?? lead.situationMaritale)
          : "",
        heritier: lead.heritier === true ? "Oui" : lead.heritier === false ? "Non" : "",
        natureRecherche: NATURE_LABELS[lead.natureRecherche],
        typeLogement: TYPE_LABELS[lead.typeLogement],
        budgetMin: lead.budgetMin ?? "",
        budgetMax: lead.budgetMax ?? "",
        criteresSpecifiques: lead.criteresSpecifiques ?? "",
        etat: ETAT_LABELS[lead.etat],
        etape: ETAPE_LABELS[lead.etape],
        commercial: lead.titulaire
          ? `${lead.titulaire.prenom} ${lead.titulaire.nom}`
          : "",
        dateSaisie: new Date(lead.dateSaisie).toLocaleDateString("fr-FR"),
      });
    }

    const xlsxBuffer = await workbook.xlsx.writeBuffer();
    const buffer =
      xlsxBuffer instanceof ArrayBuffer
        ? xlsxBuffer
        : (xlsxBuffer as Buffer).buffer.slice(
            (xlsxBuffer as Buffer).byteOffset,
            (xlsxBuffer as Buffer).byteOffset + (xlsxBuffer as Buffer).byteLength
          ) as ArrayBuffer;

    const today = new Date().toISOString().slice(0, 10);
    const headers: Record<string, string> = {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="leads_export_${today}.xlsx"`,
    };
    if (leads.length === EXPORT_ROW_LIMIT) {
      headers["X-Export-Truncated"] = "true";
    }

    return new Response(buffer, { status: 200, headers });
  } catch (err) {
    console.error("[export/leads] Unhandled error:", err);
    return NextResponse.json({ error: "Erreur lors de l'export." }, { status: 500 });
  }
}
