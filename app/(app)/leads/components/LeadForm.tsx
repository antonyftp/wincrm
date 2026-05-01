"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  LeadEtat,
  LeadEtape,
  Genre,
  SituationMaritale,
  NatureRecherche,
  TypeLogement,
} from "@prisma/client";
import type { FormState } from "@/app/actions/leads";
import { ETAT_LABELS, ETAPE_LABELS } from "../lib/labels";

type LeadWithTitulaire = {
  id: string;
  etat: LeadEtat;
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
  natureRecherche: NatureRecherche;
  typeLogement: TypeLogement;
  budgetMin: number | null;
  budgetMax: number | null;
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
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Enregistrement…" : "Enregistrer"}
    </button>
  );
}

export default function LeadForm({ mode, lead, commercials, action }: Props) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-5">Suivi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              État
            </label>
            <select
              name="etat"
              defaultValue={lead?.etat ?? "nouveau"}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(Object.keys(ETAT_LABELS) as LeadEtat[]).map((val) => (
                <option key={val} value={val}>
                  {ETAT_LABELS[val]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Étape
            </label>
            <select
              name="etape"
              defaultValue={lead?.etape ?? "nouveau_contact"}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(Object.keys(ETAPE_LABELS) as LeadEtape[]).map((val) => (
                <option key={val} value={val}>
                  {ETAPE_LABELS[val]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Commercial assigné
            </label>
            <select
              name="titulaireId"
              defaultValue={lead?.titulaireId ?? ""}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Non assigné</option>
              {commercials.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.prenom} {c.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-5">Identité</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Genre <span className="text-red-500">*</span>
            </label>
            <select
              name="genre"
              defaultValue={lead?.genre ?? ""}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Sélectionner
              </option>
              <option value="M">M.</option>
              <option value="Mme">Mme</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Prénom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="prenom"
              defaultValue={lead?.prenom ?? ""}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nom"
              defaultValue={lead?.nom ?? ""}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Âge
            </label>
            <input
              type="number"
              name="age"
              defaultValue={lead?.age ?? ""}
              min={18}
              max={120}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Situation maritale
            </label>
            <select
              name="situationMaritale"
              defaultValue={lead?.situationMaritale ?? ""}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Non renseigné</option>
              <option value="marie">Marié(e)</option>
              <option value="veuf">Veuf/Veuve</option>
              <option value="celibataire">Célibataire</option>
              <option value="divorce">Divorcé(e)</option>
            </select>
          </div>

          <div className="flex items-end pb-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="heritier"
                value="true"
                defaultChecked={lead?.heritier === true}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Héritier</span>
            </label>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-5">Contact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              defaultValue={lead?.email ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Téléphone
            </label>
            <input
              type="tel"
              name="telephone"
              defaultValue={lead?.telephone ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Adresse
            </label>
            <input
              type="text"
              name="adresse"
              defaultValue={lead?.adresse ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-5">
          Projet immobilier
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nature de la recherche <span className="text-red-500">*</span>
            </label>
            <select
              name="natureRecherche"
              defaultValue={lead?.natureRecherche ?? ""}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Sélectionner
              </option>
              <option value="achat">Achat</option>
              <option value="location">Location</option>
              <option value="investissement">Investissement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Type de logement <span className="text-red-500">*</span>
            </label>
            <select
              name="typeLogement"
              defaultValue={lead?.typeLogement ?? ""}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Sélectionner
              </option>
              <option value="appartement">Appartement</option>
              <option value="maison">Maison</option>
              <option value="studio">Studio</option>
              <option value="t2">T2</option>
              <option value="t3">T3</option>
              <option value="t4">T4</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Budget min (€)
            </label>
            <input
              type="number"
              name="budgetMin"
              defaultValue={lead?.budgetMin ?? ""}
              min={0}
              step={1000}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Budget max (€)
            </label>
            <input
              type="number"
              name="budgetMax"
              defaultValue={lead?.budgetMax ?? ""}
              min={0}
              step={1000}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Critères spécifiques
            </label>
            <textarea
              name="criteresSpecifiques"
              defaultValue={lead?.criteresSpecifiques ?? ""}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
