"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { LeadEtape, Genre, SituationMaritale, NatureRecherche, TypeLogement } from "@prisma/client";
import type { FormState } from "@/app/actions/leads";
import { ETAPE_LABELS } from "@/app/lib/labels";

type LeadWithTitulaire = {
  id: string;
  etape: LeadEtape;
  titulaireId: string | null;
  genre: Genre;
  prenom: string;
  nom: string;
  age: number | null;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  situationMaritale: SituationMaritale | null;
  heritier: boolean | null;
  dateMailEntrant: Date | null;
  natureRecherche: NatureRecherche;
  typeLogement: TypeLogement;
  budgetAchat: number | null;
  budgetLocation: number | null;
  criteresSpecifiques: string | null;
};

type Props = {
  mode: "create" | "edit";
  lead?: LeadWithTitulaire;
  commercials: { id: string; nom: string; prenom: string }[];
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary btn-lg">
      {pending ? "Enregistrement…" : "Enregistrer"}
    </button>
  );
}

function FieldLabel({ htmlFor, text, required = false }: { htmlFor: string; text: string; required?: boolean }) {
  return (
    <label className="field-label" htmlFor={htmlFor}>
      {text}{required && <span style={{ color: "var(--neg)", marginLeft: 2 }}>*</span>}
    </label>
  );
}


export default function LeadForm({ mode, lead, commercials, action }: Props) {
  const [state, formAction] = useActionState(action, null);
  const [natureRecherche, setNatureRecherche] = useState<string>(lead?.natureRecherche ?? "");

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {state?.error && (
        <div className="badge neg" style={{ padding: "10px 14px", borderRadius: "var(--r)", fontSize: 13, lineHeight: 1.5 }}>
          {state.error}
        </div>
      )}

      {/* Suivi */}
      <div className="card">
        <div className="card-h"><h3>Suivi</h3></div>
        <div className="card-b">
          <div className="form-grid-3">
            <div className="field">
              <FieldLabel htmlFor="etape" text="Étape" />
              <select id="etape" name="etape" defaultValue={lead?.etape ?? "nouveau"} className="input">
                {(Object.keys(ETAPE_LABELS) as LeadEtape[]).map((val) => (
                  <option key={val} value={val}>{ETAPE_LABELS[val]}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <FieldLabel htmlFor="titulaireId" text="Commercial assigné" />
              <select id="titulaireId" name="titulaireId" defaultValue={lead?.titulaireId ?? ""} className="input">
                <option value="">— Non assigné</option>
                {commercials.map((c) => (
                  <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Identité */}
      <div className="card">
        <div className="card-h"><h3>Identité</h3></div>
        <div className="card-b">
          <div className="form-grid-3">
            <div className="field">
              <FieldLabel htmlFor="genre" text="Genre" required />
              <select id="genre" name="genre" defaultValue={lead?.genre ?? ""} required className="input">
                <option value="" disabled>Sélectionner</option>
                <option value="M">M.</option>
                <option value="Mme">Mme</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div className="field">
              <FieldLabel htmlFor="prenom" text="Prénom" required />
              <input id="prenom" type="text" name="prenom" defaultValue={lead?.prenom ?? ""} required className="input" />
            </div>
            <div className="field">
              <FieldLabel htmlFor="nom" text="Nom" required />
              <input id="nom" type="text" name="nom" defaultValue={lead?.nom ?? ""} required className="input" />
            </div>
            <div className="field">
              <FieldLabel htmlFor="age" text="Âge" />
              <input id="age" type="number" name="age" defaultValue={lead?.age ?? ""} min={18} max={120} className="input" />
            </div>
            <div className="field">
              <FieldLabel htmlFor="situationMaritale" text="Situation maritale" />
              <select id="situationMaritale" name="situationMaritale" defaultValue={lead?.situationMaritale ?? ""} className="input">
                <option value="">— Non renseigné</option>
                <option value="marie">Marié(e)</option>
                <option value="veuf">Veuf/Veuve</option>
                <option value="celibataire">Célibataire</option>
                <option value="divorce">Divorcé(e)</option>
              </select>
            </div>
            <div className="field" style={{ justifyContent: "flex-end", paddingBottom: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>
                <input type="checkbox" name="heritier" value="true" defaultChecked={lead?.heritier === true} style={{ accentColor: "var(--accent)", width: 16, height: 16 }} />
                Héritier
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="card">
        <div className="card-h"><h3>Contact</h3></div>
        <div className="card-b">
          <div className="form-grid-3">
            <div className="field">
              <FieldLabel htmlFor="email" text="Email" />
              <input id="email" type="email" name="email" defaultValue={lead?.email ?? ""} className="input" />
            </div>
            <div className="field">
              <FieldLabel htmlFor="telephone" text="Téléphone" />
              <input id="telephone" type="tel" name="telephone" defaultValue={lead?.telephone ?? ""} className="input" />
            </div>
            <div className="field">
              <FieldLabel htmlFor="adresse" text="Adresse" />
              <input id="adresse" type="text" name="adresse" defaultValue={lead?.adresse ?? ""} className="input" />
            </div>
            <div className="field">
              <FieldLabel htmlFor="dateMailEntrant" text="Date mail entrant" />
              <input
                id="dateMailEntrant"
                type="date"
                name="dateMailEntrant"
                defaultValue={lead?.dateMailEntrant ? new Date(lead.dateMailEntrant).toISOString().slice(0, 10) : ""}
                className="input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Projet immobilier */}
      <div className="card">
        <div className="card-h"><h3>Projet immobilier</h3></div>
        <div className="card-b">
          <div className="form-grid-3" style={{ marginBottom: 16 }}>
            <div className="field">
              <FieldLabel htmlFor="natureRecherche" text="Nature de la recherche" required />
              <select
                id="natureRecherche"
                name="natureRecherche"
                value={natureRecherche}
                onChange={(e) => setNatureRecherche(e.target.value)}
                required
                className="input"
              >
                <option value="" disabled>Sélectionner</option>
                <option value="achat">Achat</option>
                <option value="location">Location</option>
                <option value="achat_ou_location">Achat ou location</option>
              </select>
            </div>
            <div className="field">
              <FieldLabel htmlFor="typeLogement" text="Type de logement" required />
              <select id="typeLogement" name="typeLogement" defaultValue={lead?.typeLogement ?? ""} required className="input">
                <option value="" disabled>Sélectionner</option>
                <option value="appartement">Appartement</option>
                <option value="maison">Maison</option>
                <option value="studio">Studio</option>
                <option value="t2">T2</option>
                <option value="t3">T3</option>
                <option value="t4">T4</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div />
            {(natureRecherche === "achat" || natureRecherche === "achat_ou_location") && (
              <div className="field">
                <FieldLabel htmlFor="budgetAchat" text="Budget achat (€)" />
                <input id="budgetAchat" type="number" name="budgetAchat" defaultValue={lead?.budgetAchat ?? ""} min={0} step={1000} className="input" />
              </div>
            )}
            {(natureRecherche === "location" || natureRecherche === "achat_ou_location") && (
              <div className="field">
                <FieldLabel htmlFor="budgetLocation" text="Budget location (€)" />
                <input id="budgetLocation" type="number" name="budgetLocation" defaultValue={lead?.budgetLocation ?? ""} min={0} step={1000} className="input" />
              </div>
            )}
          </div>
          <div className="field">
            <FieldLabel htmlFor="criteresSpecifiques" text="Critères spécifiques" />
            <textarea id="criteresSpecifiques" name="criteresSpecifiques" defaultValue={lead?.criteresSpecifiques ?? ""} rows={3} className="input" />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SubmitButton />
      </div>
    </form>
  );
}
