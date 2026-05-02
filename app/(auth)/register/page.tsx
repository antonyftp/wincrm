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
      <div className="auth">
        <div className="auth-stage">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.18)", borderRadius: 8, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 16 }}>
              W
            </div>
            <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.01em" }}>WIN CRM</div>
          </div>
          <div>
            <h2 style={{ fontSize: 38, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
              Bienvenue dans l&apos;équipe.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.9, margin: 0 }}>
              Votre demande d&apos;accès a été transmise à l&apos;administrateur.
            </p>
          </div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>© 2024 WIN CRM · Application interne</div>
        </div>
        <div className="auth-form">
          <div style={{ maxWidth: 380, width: "100%", margin: "auto 0", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, background: "var(--accent-soft)", borderRadius: 999, display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
              Demande envoyée
            </h2>
            <p style={{ color: "var(--text-soft)", fontSize: 14, lineHeight: 1.6, margin: "0 0 28px" }}>
              Votre demande a été envoyée. Un administrateur validera votre compte sous peu.
            </p>
            <Link href="/login" className="btn btn-primary btn-lg btn-full">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <div className="auth-stage">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.18)", borderRadius: 8, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 16 }}>
            W
          </div>
          <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.01em" }}>WIN CRM</div>
        </div>
        <div>
          <h2 style={{ fontSize: 38, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "0 0 16px", maxWidth: 480 }}>
            Rejoignez votre équipe commerciale.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.9, maxWidth: 440, margin: 0 }}>
            Créez votre compte pour accéder à l&apos;espace de travail partagé. L&apos;accès est validé par un administrateur.
          </p>
        </div>
        <div style={{ fontSize: 12, opacity: 0.75 }}>© 2024 WIN CRM · Application interne</div>
      </div>

      <div className="auth-form">
        <div style={{ maxWidth: 380, width: "100%", margin: "auto 0" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Créer un compte
          </h2>
          <p style={{ color: "var(--text-soft)", margin: "0 0 28px", fontSize: 14 }}>
            Accès soumis à validation administrateur.
          </p>

          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {state && "error" in state && (
              <div className="badge neg" style={{ padding: "10px 14px", borderRadius: "var(--r)", fontSize: 13, lineHeight: 1.5 }}>
                {state.error}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field">
                <label className="field-label" htmlFor="prenom">Prénom</label>
                <input id="prenom" name="prenom" type="text" autoComplete="given-name" required className="input" placeholder="Jean" />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="nom">Nom</label>
                <input id="nom" name="nom" type="text" autoComplete="family-name" required className="input" placeholder="Dupont" />
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required className="input" placeholder="vous@exemple.com" />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="password">Mot de passe</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className="input" placeholder="Minimum 8 caractères" />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="confirm">Confirmer le mot de passe</label>
              <input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} className="input" placeholder="••••••••" />
            </div>

            <button type="submit" disabled={pending} className="btn btn-primary btn-lg btn-full">
              {pending ? "Envoi en cours…" : "Envoyer la demande"}
            </button>
          </form>

          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-soft)", fontSize: 13 }}>
            Déjà un compte ?{" "}
            <Link href="/login" style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "none", marginLeft: 4 }}>
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
