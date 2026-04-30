"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";

type State = { success: true } | { error: string } | null;

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev: State, formData: FormData) => {
      const password = formData.get("password") as string;
      const confirm = formData.get("confirm") as string;
      if (password !== confirm) {
        return { error: "Les mots de passe ne correspondent pas." };
      }
      return register(formData);
    },
    null
  );

  if (state && "success" in state) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-8 py-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            Demande envoyée
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Votre demande a été envoyée. Un administrateur validera votre compte
            sous peu.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-slate-900 underline-offset-4 hover:underline"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-8 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            WIN CRM
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Créer un compte — accès soumis à validation
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          {state && "error" in state && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="prenom"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Prénom
              </label>
              <input
                id="prenom"
                name="prenom"
                type="text"
                autoComplete="given-name"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                placeholder="Jean"
              />
            </div>
            <div>
              <label
                htmlFor="nom"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Nom
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                autoComplete="family-name"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                placeholder="Dupont"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              placeholder="Minimum 8 caractères"
            />
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Confirmer le mot de passe
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? "Envoi en cours…" : "Envoyer la demande"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-medium text-slate-900 underline-offset-4 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
