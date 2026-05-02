"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";

type State = { error: string } | null;

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev: State, formData: FormData) => {
      const result = await login(formData);
      if ("error" in result) return result;
      return null;
    },
    null
  );

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
            Pilotez votre activité immobilière en un coup d&apos;œil.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.9, maxWidth: 440, margin: 0 }}>
            Centralisez vos contacts, suivez vos leads et concluez plus de ventes. La plateforme conçue pour les agents immobiliers.
          </p>
          <div style={{ display: "flex", gap: 32, marginTop: 36 }}>
            <div>
              <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>482</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>Leads gérés</div>
            </div>
            <div>
              <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>18,4 %</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>Taux de conversion</div>
            </div>
            <div>
              <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>5</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>Commerciaux actifs</div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, opacity: 0.75 }}>© 2024 WIN CRM · Application interne</div>
      </div>

      <div className="auth-form">
        <div style={{ maxWidth: 380, width: "100%", margin: "auto 0" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Connexion
          </h2>
          <p style={{ color: "var(--text-soft)", margin: "0 0 28px", fontSize: 14 }}>
            Accédez à votre espace de travail.
          </p>

          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {state?.error && (
              <div className="badge neg" style={{ padding: "10px 14px", borderRadius: "var(--r)", fontSize: 13, lineHeight: 1.5 }}>
                {state.error}
              </div>
            )}

            <div className="field">
              <label className="field-label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input"
                placeholder="vous@wincrm.fr"
              />
            </div>

            <div className="field">
              <label className="field-label" style={{ display: "flex", justifyContent: "space-between" }} htmlFor="password">
                <span>Mot de passe</span>
                <span style={{ color: "var(--accent)", fontWeight: 500, fontSize: 12 }}>Oublié ?</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="btn btn-primary btn-lg btn-full"
            >
              {pending ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-soft)", fontSize: 13 }}>
            Pas de compte ?{" "}
            <Link href="/register" style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "none", marginLeft: 4 }}>
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
